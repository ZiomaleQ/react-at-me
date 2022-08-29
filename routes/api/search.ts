import { HandlerContext } from "$fresh/server.ts"
import { PictureManager } from "../../utils/dataManager.ts";

export const handler = async (req: Request, _ctx: HandlerContext) => {
  const sParams = new URL(req.url).searchParams

  //TODO Add search by text

  return new Response(
    JSON.stringify(
      await PictureManager.getInstance().searchForTags(
        sParams.get('tags')!.split(',')
      )
    )
  )
}