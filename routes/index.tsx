/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import {
  Picture,
  PictureManager,
  RavenResponse,
} from "../utils/dataManager.ts";
import { cardLike } from "../utils/styles.ts";

export const handler: Handlers<RavenResponse<Picture> | null> = {
  async GET(_, ctx) {
    const resp = await PictureManager.getInstance().getPage();
    resp.TotalResults === 0;
    if (resp.TotalResults === 0) {
      return ctx.render(null);
    }

    return ctx.render(resp);
  },
};

export default function Page(
  { data }: PageProps<RavenResponse<Picture> | null>,
) {
  if (!data) {
    return (
      <div style={{ ...cardLike, width: "50%", textAlign: "center" }}>
        <p>No data, come back next time!</p>
        <p style={{fontWeight: 600}}>
          or if you're as impatient as me, just add some!
        </p>
      </div>
    );
  }

  return (
    <div style={{...cardLike}}>

    </div>
  );
}
