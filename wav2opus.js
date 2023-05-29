import { expandGlobSync } from "https://deno.land/std/fs/expand_glob.ts";
import $ from "https://deno.land/x/dax/mod.ts";

const dir = Deno.args[0];
const glob = expandGlobSync(`${dir}/*.wav`, { globstar: true });
for await (const file of glob) {
  const outFile = file.path.slice(0, -4) + ".opus";
  await $`opusenc ${file.path} ${outFile}`;
}
