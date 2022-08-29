import { HandlerContext } from "$fresh/server.ts"
import { PictureManager } from "../../../utils/dataManager.ts";

export const handler = async (_req: Request, _ctx: HandlerContext) => {
  return new Response(JSON.stringify(await PictureManager.getInstance().getTagCounts()))
}