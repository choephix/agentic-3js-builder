import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim } from "../../../../src/math";
import { svg } from "../../../../src/texture";
import { paint } from "../../../../src/paint";

function verts(mesh: THREE.Mesh) {
  const a = mesh.geometry.getAttribute("position");
  const out: number[] = [];
  for (let i = 0; i < a.count; i++) out.push(+a.getX(i).toFixed(4), +a.getY(i).toFixed(4), +a.getZ(i).toFixed(4));
  return out;
}
function allMeshes(root: THREE.Object3D) { const out: THREE.Mesh[] = []; root.traverse(o => { if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh); }); return out; }

// b.part bone/no-at vs explicit model-space origin; and flat normals.
{
  const b = createBuilder({ name: "part-placement" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const head = b.joint("head", { parent: root, at: [2, 0, 0], dir: [0, 1, 0] });
  const g1 = new THREE.BoxGeometry(1, 1, 1);
  const p1 = b.part(g1, "#f00", { bone: head });
  const g2 = new THREE.BoxGeometry(1, 1, 1);
  const p2 = b.part(g2, "#0f0", { bone: head, at: [0, 0, 0], flat: true });
  console.log("part placement", p1.at.toArray(), p2.at.toArray(), p1.mesh.matrixWorld.elements[12], p2.mesh.matrixWorld.elements[12], p2.mesh.geometry.getAttribute("normal").count, p2.mesh.geometry.getAttribute("position").count);
}

// Names should remain stable when unrelated groups are added.
function nameBuild(extra: boolean) {
  const b = createBuilder({ name: "names" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const head = b.joint("head", { parent: root, at: [0, 1, 0] });
  const leg = b.joint("legL", { parent: root, at: [1, 0.5, 0] });
  if (extra) b.part(new THREE.SphereGeometry(0.1, 4, 3), "#0ff", { bone: root, group: "other" });
  b.part(new THREE.BoxGeometry(1, 1, 1), "#f00", { bone: head });
  b.part(new THREE.BoxGeometry(1, 1, 1), "#0f0", { bone: head });
  b.sweep([[1, .5, 0], [1, .25, 0]], .1, { bone: leg, color: "#00f" });
  b.sweep([[1, .5, 0], [1, .25, 0]], .1, { bone: leg, color: "#00f" });
  return allMeshes(b.root).map(m => m.name);
}
console.log("names", nameBuild(false), nameBuild(true));

// Region local/p are documented equivalent for literal points; mirror regions should remain mirror images.
{
  const b = createBuilder({ name: "region" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const q = aim([0, 0, 1], [0, 1, 0], "z");
  const r = b.region({ at: [2, 1, 3], scale: 2, quat: q, bone: root });
  const a = r.joint("a", { parent: root, at: [0.2, 0.3, 0.4], dir: [0, 0, 1] });
  const p = r.p([0.2, 0.3, 0.4]);
  console.log("region eq", a.at.toArray(), p.toArray(), r.local([0.2, 0.3, 0.4]).toArray(), r.d([1, 0, 0]).toArray());
  const mirror = (s: 1 | -1) => {
    const b2 = createBuilder({ name: `mirror${s}` });
    const r2 = b2.region({ at: [0, 0, 0], scale: 1, quat: aim([s, 0, 0], [0, 1, 0], "z") });
    return [r2.p([0.2, 0.3, 0.4]), r2.d([0, 0, 1])];
  };
  console.log("mirror", mirror(1).map(v => v.toArray()), mirror(-1).map(v => v.toArray()));
}

// Cards: placement, texture tint, count limits and mirrored UVs.
{
  const b = createBuilder({ name: "cards" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const tex = svg('<svg viewBox="0 0 2 1"><rect width="2" height="1" fill="#777"/></svg>', { size: 16 });
  const colored = svg('<svg viewBox="0 0 2 1"><rect width="2" height="1" fill="#f00"/></svg>', { size: 16 });
  const m1 = b.cards([frame([1, 2, 3], [0, 1, 0])], tex, { size: [2, 4], lean: 0, flow: [0, 0, 1], color: "#00ff00" })[0];
  const m2 = b.cards([frame([0, 0, 0], [0, 1, 0])], tex, { size: [2, 4], lean: 90, flow: [0, 0, 1], mirror: true, cross: true })[0];
  const m3 = b.cards([frame([0, 0, 0], [0, 1, 0])], colored, { size: 1, color: "#00ff00" })[0];
  console.log("cards m1 pos", verts(m1).slice(0, 12), "uv", Array.from(m1.geometry.getAttribute("uv").array as Float32Array).slice(0, 8), "mat", (m1.material as THREE.MeshStandardMaterial).color.getHexString());
  console.log("cards m2 counts", m2.geometry.getAttribute("position").count, m2.geometry.index!.count, "m3 mat", (m3.material as THREE.MeshStandardMaterial).color.getHexString(), "colored", colored.userData.coloured);
}

// Paint tint cards should produce linear vertex colours and white textured material.
{
  const b = createBuilder({ name: "cardpaint" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const tex = svg('<svg viewBox="0 0 1 1"><rect width="1" height="1" fill="#fff"/></svg>');
  const red = paint(() => "#ff0000");
  const m = b.cards([frame([0, 0, 0], [0, 1, 0])], tex, { size: 1, color: red })[0];
  console.log("paint card", (m.material as THREE.MeshStandardMaterial).color.getHexString(), Array.from(m.geometry.getAttribute("color").array as Float32Array).slice(0, 3));
}
