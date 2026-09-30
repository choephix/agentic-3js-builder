// Type-checks the project, or only the samples you name, with the project's compiler settings:
//
//   npm run typecheck                                  # src, kits, samples and showcase
//   npm run typecheck -- <slug | path/to/file.ts> ...  # those files and what they import, nothing else
//
// A named file is checked on its own, so errors in other samples (even ones that don't parse) neither show up nor
// hide yours. Exits 1 when the checked files have errors.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TSC = join(ROOT, "node_modules/.bin/tsc");

const targets = process.argv.slice(2);
let config = join(ROOT, "tsconfig.json");
if (targets.length) {
  const files = targets.map((target) =>
    target.endsWith(".ts") ? resolve(process.cwd(), target) : join(ROOT, "samples", `${target}.ts`),
  );
  const missing = files.filter((file) => !existsSync(file));
  if (missing.length) {
    console.error(`No such file: ${missing.join(", ")}`);
    process.exit(2);
  }
  // A throwaway config next to the project's: same compiler options, only these root files.
  const dir = join(ROOT, "node_modules/.cache/typecheck");
  mkdirSync(dir, { recursive: true });
  config = join(dir, `tsconfig.${process.pid}.json`);
  writeFileSync(config, JSON.stringify({ extends: join(ROOT, "tsconfig.json"), files, include: [] }));
}

const run = spawnSync(TSC, ["--noEmit", "--pretty", "false", "-p", config], { cwd: ROOT, encoding: "utf8" });
const output = `${run.stdout}${run.stderr}`.trim();
if (output) console.log(output);
if (targets.length) {
  unlinkSync(config);
  if (run.status === 0) console.log(`No type errors in ${targets.join(", ")}.`);
}
process.exit(run.status ?? 1);
