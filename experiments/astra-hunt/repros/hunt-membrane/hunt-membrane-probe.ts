import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";

function finite(arr: THREE.BufferAttribute) {
  for (let i = 0; i < arr.count; i++) for (let j = 0; j < arr.itemSize; j++) if (!Number.isFinite(arr.getComponent(i, j))) return false;
  return true;
}
function tris(mesh: THREE.Mesh) {
  const p = mesh.geometry.getAttribute("position");
  const idx = mesh.geometry.getIndex();
  const out: { cross: THREE.Vector3; dot: number; area: number }[] = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
  const count = idx ? idx.count / 3 : p.count / 3;
  for (let k = 0; k < count; k++) {
    const ia = idx ? idx.getX(3 * k) : 3 * k, ib = idx ? idx.getX(3 * k + 1) : 3 * k + 1, ic = idx ? idx.getX(3 * k + 2) : 3 * k + 2;
    a.fromBufferAttribute(p, ia); b.fromBufferAttribute(p, ib); c.fromBufferAttribute(p, ic);
    const cross = ab.subVectors(b, a).cross(ac.subVectors(c, a)).clone();
    out.push({ cross, dot: cross.dot(new THREE.Vector3(0, 0, 1)), area: cross.length() / 2 });
  }
  return out;
}
function slabCase(name: string, pts: THREE.Vector3[]) {
  const b = createBuilder({ name }); b.joint("root", { at: [0, 0, 0] });
  try {
    const part = b.slab(pts, { thickness: 0.1, color: "#fff", name }); const pos = part.mesh.geometry.getAttribute("position"); const t = tris(part.mesh); const bb = new THREE.Box3().setFromBufferAttribute(pos);
    console.log(name, { count: pos.count, tri: t.length, nan: !finite(pos), min: Math.min(...t.map((x) => x.area)), max: Math.max(...t.map((x) => x.area)), boxMin: bb.min.toArray(), boxMax: bb.max.toArray(), n: part.axis.toArray(), first: t.slice(0, 4).map((x) => x.cross.toArray()) });
  } catch (e) { console.log(name, "THROW", String(e)); }
}
slabCase("concave", [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(1, 2, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 2, 0)]);
slabCase("concave-cw", [new THREE.Vector3(-1, 2, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 2, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)]);
slabCase("nonplanar", [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(1, 1, 0.5), new THREE.Vector3(-1, 1, 0)]);
slabCase("collinear", [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]);

function membraneCase(name: string, a: THREE.Vector3[], bpts: THREE.Vector3[], opts: Record<string, unknown> = {}) {
  const b = createBuilder({ name }); b.joint("root", { at: [0, 0, 0] });
  try {
    const m = b.membrane(a, bpts, { thickness: 0.1, color: "#fff", rows: 2, cols: 2, name, ...opts });
    for (const [mi, x] of m.entries()) { const p = x.geometry.getAttribute("position"); const t = tris(x); console.log(name, mi, { v: p.count, tri: t.length, nan: !finite(p), minArea: Math.min(...t.map((y) => y.area)), maxArea: Math.max(...t.map((y) => y.area)), signed: t.slice(0, 4).map((y) => y.dot), sw: x.geometry.getAttribute("skinWeight") ? Array.from(x.geometry.getAttribute("skinWeight")!.array).slice(0, 16) : undefined }); }
  } catch (e) { console.log(name, "THROW", String(e)); }
}
membraneCase("parallel", [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 2, 0)], [new THREE.Vector3(1, 0, 0), new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, 2, 0)]);
membraneCase("opposite", [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 2, 0)], [new THREE.Vector3(1, 2, 0), new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, 0, 0)]);
membraneCase("cross", [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 2, 0)], [new THREE.Vector3(-1, 2, 0), new THREE.Vector3(1, 0, 0)], { rows: 2, cols: 4 });
membraneCase("unequal", [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 0)], [new THREE.Vector3(2, 0, 0), new THREE.Vector3(2, 1, 0)], { rows: 2, cols: 2 });

const b = createBuilder({ name: "weights" }); const root = b.joint("root", { at: [0, 0, 0] }); const chain = b.chain("arm", [[0, 0, 0], [0, 1, 0], [0, 2, 0]], { parent: root });
const chainMem = b.membrane(chain, [[1, 0, 0], [1, 1, 0], [1, 2, 0]], { thickness: 0.1, color: "#fff", rows: 2, cols: 2, name: "cm" }); console.log("chain-plain", chainMem.length, chainMem[0].geometry.getAttribute("skinWeight")?.array, chainMem[0].userData.skinBones);
const bothPlain = b.membrane([[1, 0, 0], [1, 1, 0], [1, 2, 0]], [[2, 0, 0], [2, 1, 0], [2, 2, 0]], { thickness: 0.1, color: "#fff", rows: 2, cols: 2, name: "pm" }); console.log("plain-plain", bothPlain.length, bothPlain[0].geometry.getAttribute("skinWeight"), bothPlain[0].userData.skinBones);
