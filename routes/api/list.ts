import { HandlerContext } from "$fresh/server.ts"
import { PictureManager } from "../../utils/dataManager.ts";

export const handler = async (_req: Request, _ctx: HandlerContext) => {
  const sParams = new URL(_req.url).searchParams
  const page = ~~(sParams.get('page') ?? -1)
  return new Response(JSON.stringify(await PictureManager.getInstance().getPage(page)))
}