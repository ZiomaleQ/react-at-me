import { Handlers } from "$fresh/server.ts"
import { DEFAULT_META, PictureManager } from "../../utils/dataManager.ts"
import { crypto } from "https://deno.land/std@0.146.0/crypto/mod.ts"

export const handler: Handlers = {
	async POST(req, _ctx) {

		if (!req.body) return new Response(undefined, { status: 400 })

		const body = await req.arrayBuffer()

		const hash = new Uint8Array(crypto.subtle.digestSync('SHA-1', body))
		let fileHash = ''

		for (const num of hash.values()) {
			fileHash += num.toString(16)
		}

		Deno.writeFile(`./static/images/${fileHash}`, new Uint8Array(body), { create: true,  })

		const data = {
			'@metadata': DEFAULT_META,
			file: {
				hash: fileHash,
				type: req.headers.get('Content-Type')!,
				size: body.byteLength
			},
			text: [],
			tags: []
		}

		const existing = await PictureManager.getInstance().getByHash(fileHash)

		if (existing === undefined) await PictureManager.getInstance().create(data)

		return new Response(JSON.stringify(existing || data))
	}
}