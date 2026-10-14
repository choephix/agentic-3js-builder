import { createBuilder } from "../../../../src/builder";
const b = createBuilder({ name: "surface-joint" });
const root = b.joint("root", { at: [0, 1, 0] });
const chain = b.chain("tail", [[0,1,0], [0,1,-1], [0,1,-2]], { parent: root });
const tube = b.sweep(chain, 0.12, { color: "red", skin: "smooth" });
for (const [label, target] of [["root", root], ["span", chain.joints[0]], ["chain", chain], ["sweep", tube]] as const) {
  try {
    const s = b.surface(target);
    console.log(label, "surface meshes", s.meshes.length, "nearest", s.nearest([0, 1, -0.5]).at.toArray());
  } catch (e) { console.log(label, "ERR", e instanceof Error ? e.message : String(e)); }
}
