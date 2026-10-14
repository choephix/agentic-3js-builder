// A static copy of the lab page (showcase/lab.html) for webshare, which serves ~/tmp/public at http://axalon:8080/:
// the page's bundle and `lab.json` in the output folder, with symlinks for the thumbnails (`lab-thumbs/`) and the
// rounds' modules and replies (`lab-rounds/` → bakeoff/rounds/). Renders are linked where they already are, under
// ~/tmp/public. The copy links nowhere outside itself, so it can be published as it is.
//   npm run lab-export [-- <out dir>]
import { copyFileSync, existsSync, mkdirSync, renameSync, symlinkSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { build } from "vite";
import { labData, v01Renders } from "../showcase/lab-data.mjs";

const publicRoot = "/home/cx/tmp/public";
const snapshotRoot = join(publicRoot, "nilo/agentic-3js-builder/snaps");
const out = resolve(process.argv[2] ?? join(publicRoot, "nilo/agentic-3js-builder/lab"));

await build({
  configFile: false,
  root: resolve("showcase"),
  base: "./",
  publicDir: false,
  logLevel: "warn",
  build: { outDir: out, emptyOutDir: true, rolldownOptions: { input: resolve("showcase/lab.html") } },
});
renameSync(join(out, "lab.html"), join(out, "index.html"));
for (const icon of ["favicon.ico", "favicon.svg"]) copyFileSync(resolve("showcase/public", icon), join(out, icon));

// Webshare serves ~/tmp/public at its root, so a render's address is its path below it.
const url = (path: string) => `/${relative(publicRoot, path)}`;
const data = await labData((slug: string) => v01Renders(slug, snapshotRoot, url));
writeFileSync(join(out, "lab.json"), JSON.stringify(data));
for (const [name, target] of [
  ["lab-thumbs", resolve("showcase/public/lab-thumbs")],
  ["lab-rounds", resolve("bakeoff/rounds")],
]) {
  if (!existsSync(target)) mkdirSync(target, { recursive: true });
  symlinkSync(target, join(out, name));
}
console.log(`lab-export: ${data.builds.length} builds → ${out}`);
