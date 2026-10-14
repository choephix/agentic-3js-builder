import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { spiral, catmull } from "../../../../src/path";

function stats(label: string, root: THREE.Object3D, meshes: THREE.Mesh[]) {
  const box = new THREE.Box3().setFromObject(root, true);
  let triangles = 0;
  let verts = 0;
  let finite = true;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const m of meshes) {
    const pos = m.geometry.getAttribute("position");
    verts += pos.count;
    triangles += (m.geometry.index?.count ?? pos.count) / 3;
    for (let i = 0; i < pos.count; i++) {
      const p = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      finite &&= Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }
  console.log(label, { children: root.children.length, meshes: meshes.length, triangles, verts, finite, minY, maxY, boxMinY: box.min.y, boxMaxY: box.max.y });
}

const b = createBuilder({ name: "serpent", detail: 1 });
const root = b.joint("root", { at: [0, 0.1, 0], dir: [0, 1, 0] });
const path = spiral([0, 0.1, 0], [0.75, 0.1, 0], [0, 1, 0], { turns: 2.3, r1: 0.75, pitch: 0 });
const chain = b.chain("coil", path, { parent: root, count: 36, twist: 540, names: (i) => `coil${i + 1}` });
const tube = b.sweep(chain, 0.1, { color: "#2c8a40", caps: "round" });
console.log("chain", { joints: chain.joints.length, spanJoints: chain.spanJoints.length, pathLength: chain.length, pathKnots: path.knots.length, ts: chain.ts.length, tubeMeshes: tube.meshes.length });
const meshes = tube.meshes;
// Rooting is intentionally unposed; read root to finalize transforms and inspect actual geometry.
const obj = b.root;
stats("coil", obj, meshes);
for (const t of [0, 0.125, 0.25, 0.5, 0.75, 0.9, 1]) {
  const p = tube.at(t, 180);
  console.log("under", t, p.at.toArray(), p.n.toArray(), p.tangent.toArray(), "dotY", p.n.y);
}

// Also test a heavily kinked but ordinary long chain and its finite framing.
const b2 = createBuilder({ name: "serpent-kink", detail: 1 });
const r2 = b2.joint("root", { at: [0, 0.3, 0] });
const p2 = catmull(Array.from({ length: 33 }, (_, i) => [Math.sin(i * 0.45) * 0.6, 0.25 + i * 0.005, -1 + i * 0.06] as [number,number,number]));
const c2 = b2.chain("body", p2, { parent: r2, count: 32, twist: (t) => t * 1080 });
const s2 = b2.sweep(c2, (t) => 0.07 + 0.01 * Math.sin(t * Math.PI), { color: "#563d2b" });
const o2 = b2.root;
stats("kink", o2, s2.meshes);
console.log("kink joints", c2.joints.length, "sample", [0,.125,.5,.875,1].map((t) => {
 const q=s2.at(t, 0); return [t, ...q.at.toArray(), ...q.n.toArray(), ...q.tangent.toArray()];
}));
