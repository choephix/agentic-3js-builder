import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
function probe(thickness: number) {
  const b = createBuilder(); b.joint("root", { at: [0, 0, 0] });
  try {
    const p = b.slab([[0, 0, 0], [1, 0, 0], [0, 1, 0]], { thickness, color: "#fff" }).mesh;
    const a = p.geometry.getAttribute("position");
    const zs = []; for (let i = 0; i < a.count; i++) zs.push(a.getZ(i));
    console.log("slab", thickness, { vertices: a.count, zMin: Math.min(...zs), zMax: Math.max(...zs), finite: Array.from(a.array).every(Number.isFinite) });
  } catch (e) { console.log("slab", thickness, "THROW", String(e)); }
}
function membrane(thickness: number) {
  const b = createBuilder(); b.joint("root", { at: [0, 0, 0] });
  try {
    const p = b.membrane([[0, 0, 0], [0, 1, 0]], [[1, 0, 0], [1, 1, 0]], { thickness, rows: 1, cols: 1, color: "#fff" })[0].geometry.getAttribute("position");
    const z = []; for (let i = 0; i < p.count; i++) z.push(p.getZ(i));
    console.log("membrane", thickness, { vertices: p.count, zMin: Math.min(...z), zMax: Math.max(...z), finite: Array.from(p.array).every(Number.isFinite) });
  } catch (e) { console.log("membrane", thickness, "THROW", String(e)); }
}
for (const x of [0, -0.1, 0.1]) { probe(x); membrane(x); }
