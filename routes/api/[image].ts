import { HandlerContext } from "$fresh/server.ts"
import { PictureManager } from "../../utils/dataManager.ts";

export const handler = async (_req: Request, ctx: HandlerContext) => {
  const picture = await PictureManager.getInstance().getByHash(ctx.params.image)
  if (!picture) return new Response(undefined, { status: 400 })
  return new Response(JSON.stringify(picture))
};