/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import { font } from "./utils/styles.ts";

await start(manifest, {render: (ctx, render) => {
  ctx.styles.push(font)
  render()
}});