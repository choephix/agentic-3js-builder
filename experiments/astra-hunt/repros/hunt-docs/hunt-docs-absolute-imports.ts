import { readFileSync } from "node:fs";

const files = ["docs/api.md", "docs/conventions.md", "GUIDE.md"];
const root = "/home/cx/noodlespace/agentic-3js-builder/";
for (const file of files) {
  const hits = readFileSync(file, "utf8")
    .split("\n")
    .map((line, i) => ({ line: i + 1, text: line }))
    .filter(({ text }) => text.includes(root));
  for (const hit of hits) console.log(`${file}:${hit.line}: ${hit.text.trim()}`);
}
export default function build() {
  return { type: "Group", children: [] } as never;
}
