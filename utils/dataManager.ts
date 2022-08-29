const config = {
	RAVEN_DB: {
		SERVER: "192.168.1.19",
		PORT: 8080
	}
}

export class BaseManager<T extends RavenMeta> {
	dbName = "";

	constructor(dbName: string) {
		this.dbName = dbName;
	}

	async query(
		query: string,
		params: Record<string, unknown> = {},
		method = "POST",
	): Promise<RavenResponse<T>> {
		return await fetchData(
			method,
			`/${this.dbName}/queries`,
			JSON.stringify({
				"Query": query,
				"QueryParameters": params,
			}),
		);
	}

	async create(data: T): Promise<void> {
		await fetchData(
			"POST",
			`/${this.dbName}/bulk_docs`,
			JSON.stringify({ Commands: [{ Document: data, Id: "", Type: "PUT" }] }),
		);
	}

	async update(data: T): Promise<void> {
		await fetchData(
			"POST",
			`/${this.dbName}/bulk_docs`,
			JSON.stringify({
				Commands: [{
					Id: data["@metadata"]["@id"],
					Patch: {
						Script: `${Object.keys(data).map((elt) =>
							elt !== "@metadata"
								// deno-lint-ignore no-explicit-any
								? `this.${elt} = ${JSON.stringify((data as any)[elt])}`
								: null
						).filter((elt) => elt).join(";")
							};`,
					},
					Type: "PATCH",
				}],
			}),
		);
	}

	async deleteByID(id: string): Promise<void> {
		await fetchData(
			"DELETE",
			`/${this.dbName}/docs?id=${id}`,
		);
	}

	async getByID(id: string): Promise<T> {
		return (await fetchData<T>(
			"GET",
			`/${this.dbName}/docs?id=${id}`,
		)).Results[0];
	}
}

export interface RavenResponse<T> {
	TotalResults: number;
	LongTotalResults: number;
	ScannedResults: number;
	SkippedResults: number;
	DurationInMs: number;
	// deno-lint-ignore no-explicit-any
	IncludedPaths?: any;
	IndexName: string;
	Results: T[];
	// deno-lint-ignore no-explicit-any
	Includes: Record<any, any>;
	IndexTimestamp: Date;
	LastQueryTime: Date;
	IsStale: boolean;
	ResultEtag: number;
	NodeTag: string;
}

// deno-lint-ignore no-explicit-any
export async function fetchData<T extends any>(
	method: string,
	path: string,
	body: string | null = null,
): Promise<RavenResponse<T>> {
	const response = await fetch(
		`http://${config.RAVEN_DB.SERVER}:${config.RAVEN_DB.PORT}/databases${path}`,
		{
			method,
			body,
			headers: {
				"accept": "application/json",
				"Content-Type": "application/json",
			},
		},
	);

	console.log(
		"FETCHING: ",
		method,
		response.url,
		"\n\n With body;",
		body,
		"\n",
	);

	if (response.status >= 400) throw Error(await response.text());

	// deno-lint-ignore no-explicit-any
	if (response.status === 204) return null as any;

	return (await response.json()) as RavenResponse<T>;
}

export interface Metadata {
	"@collection": string | null;
	"@id": string;
	// deno-lint-ignore no-explicit-any
	[index: string]: any;
}

export const DEFAULT_META: Metadata = { "@collection": null, "@id": "" };

export interface RavenMeta {
	"@metadata": Metadata;
}

export type Picture = {
	file: {
		hash: string,
		type: string,
		size: number
	},
	tags: string[]
	text: string[]
} & RavenMeta

export class PictureManager extends BaseManager<Picture> {
	static #instance: PictureManager | undefined = undefined;

	static getInstance() {
		if (!this.#instance) {
			this.#instance = new PictureManager();
		}
		return this.#instance;
	}

	constructor() {
		super("images");
	}

	async getByHash(hash: string): Promise<Picture | undefined> {
		return (await this.query(
			`from "@empty" where file.hash == $hash`,
			{ hash },
		)).Results[0];
	}

	async searchForTags(tags: string[]): Promise<Picture[]> {
		return (await this.query(
			`from '@empty' where tags in ($tags) limit 20`, { tags })).Results
	}

	async getTags(): Promise<string[]> {
		const resp = await this.query(
			`from "@empty" where tags.length > 0 select distinct tags`,
		) as unknown as RavenResponse<{ "tags": string }>;

		return [
			...(new Set(
				resp.Results.flatMap((elt) => elt["tags"]),
			)).values(),
		];
	}

	async getAll(
		query: string | null
	): Promise<RavenResponse<Picture>> {
		if (query) {
			return await super.query(`from "@empty" where startsWith(text, $query)`, { query })
		} else {
			return await super.query(`from "@empty"`)
		}
	}

	async getTagCounts(): Promise<{ name: string, count: number }[]> {
		const resp = await super.query(
			`from '@empty' group by tags[] select tags[], count()`
		) as unknown as RavenResponse<{ "tags[]": string, Count: number }>

		return resp.Results.map(record => ({ name: record['tags[]'], count: record.Count }))
	}
}