/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import {
  Picture,
  PictureManager,
  RavenResponse,
} from "../utils/dataManager.ts";
import { cardLike, centeredCard } from "../utils/styles.ts";

export const handler: Handlers<RavenResponse<Picture> & { query: string | null } | null> = {
  async GET(req, ctx) {
    const query = new URL(req.url).searchParams.get('query')
    const resp = await PictureManager.getInstance().getAll(query);
    resp.TotalResults === 0;
    if (resp.TotalResults === 0) {
      return ctx.render(null);
    }

    return ctx.render({ ...resp, query });
  },
};

export default function Page(
  { data }: PageProps<RavenResponse<Picture> & { query: string | null } | null>,
) {
  if (!data) {
    return (
      <div style={{ ...centeredCard, width: "50%", textAlign: "center" }}>
        <p>No data, come back next time!</p>
        <p style={{ fontWeight: 600 }}>
          or if you're as impatient as me, just add some!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <form>
        <input
          type="text"
          name="query"
          value={data.query ?? ''}
          label={'query'}
          placeholder={'query'}
          title={'query'}
          style={{ width: '95%' }}
        />
        <button type="button">
          Add new
        </button>
      </form>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {
          data.Results.map(elt =>
            <div style={{ ...cardLike }}>
              <img
                width={'250px'}
                height={'250px'}
                alt={'image'}
                src={`images/${elt.file.hash}`}
              />
            </div>
          )
        }
      </div>
    </div>
  )
}
