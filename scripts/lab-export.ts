// A static copy of the lab page (showcase/lab.html) for webshare, which serves ~/tmp/public at http://axalon:8080/:
// the page's bundle and `lab.json` in the output folder, with symlinks for the thumbnails (`lab-thumbs/`) and the
// rounds' modules and replies (`lab-rounds/` → bakeoff/rounds/). Renders are linked where they already are, under
// ~/tmp/public. Live 3D links point at the dev server, which has to be running for them.
//   npm run lab-export [-- <out dir>] [--bakeoff <url>]
import { copyFileSync, existsSync, mkdirSync, renameSync, symlinkSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { build } from "vite";
import { labData, v01Renders } from "../showcase/lab-data.mjs";

const publicRoot = "/home/cx/tmp/public";
const snapshotRoot = join(publicRoot, "nilo/agentic-3js-builder/snaps");
const args = process.argv.slice(2);
const flag = args.indexOf("--bakeoff");
const bakeoffUrl = flag >= 0 ? args.splice(flag, 2)[1] : "http://100.97.226.110:5190/bakeoff";
const out = resolve(args[0] ?? join(publicRoot, "nilo/agentic-3js-builder/lab"));

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
const data = await labData((slug: string) => v01Renders(slug, snapshotRoot, url), bakeoffUrl);
writeFileSync(join(out, "lab.json"), JSON.stringify(data));
for (const [name, target] of [
  ["lab-thumbs", resolve("showcase/public/lab-thumbs")],
  ["lab-rounds", resolve("bakeoff/rounds")],
]) {
  if (!existsSync(target)) mkdirSync(target, { recursive: true });
  symlinkSync(target, join(out, name));
}
console.log(`lab-export: ${data.builds.length} builds → ${out}`);
