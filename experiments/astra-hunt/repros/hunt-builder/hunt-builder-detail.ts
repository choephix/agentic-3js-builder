import { createBuilder } from "../../../../src/builder.ts";
function run(label: string, fn: () => unknown) {
  try { console.log(label, "OK", fn()); } catch (e) { console.log(label, "ERR", e instanceof Error ? `${e.name}: ${e.message}` : String(e)); }
}
for (const detail of [Infinity, Number.MAX_VALUE, 1e300]) {
  run(`sweep detail=${detail}`, () => {
    const b = createBuilder({ detail });
    b.joint("root", { at: [0, 0, 0] });
    const s = b.sweep([[0, 0, 0], [0, 1, 0]], .1, { color: "red" });
    return { detail: b.detail, meshes: s.meshes.length, vertices: s.meshes[0].geometry.getAttribute("position").count };
  });
}
