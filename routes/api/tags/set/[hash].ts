import { Handlers } from "$fresh/server.ts"
import { PictureManager, Picture } from "../../../../utils/dataManager.ts"

export const handler: Handlers = {
	async PATCH(req, ctx) {
		if (!req.body) return new Response(undefined, { status: 400 })

		const picture = await PictureManager.getInstance().getByHash(ctx.params.hash)
		const body = (await req.json()) as Partial<Pick<Picture, 'tags' | 'text'>>

		if (!picture) return new Response(undefined, { status: 400 })

		if (body.tags) {
			picture.tags = Array.from(new Set(body.tags))
		}

		if (picture.text) {
			picture.text = Array.from(new Set(body.text))
		}

		await PictureManager.getInstance().update(picture)

		return new Response(JSON.stringify(picture))
	}
}