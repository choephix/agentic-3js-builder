```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Autumn Hedgehog",
  description:
    "A plump hedgehog on an evening stroll: chestnut spines with cream tips, fawn face, black nose, pink paws and a red maple leaf trophy.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const r = rng(11);

  // ---------- skeleton ----------
  const C = new THREE.Vector3(0, 0.17, -0.01);
  const R = new THREE.Vector3(0.15, 0.13, 0.19);

  const hips = b.joint("hips", { at: [0, 0.17, -0.02] });
  const spine = b.joint("spine", { at: [0, 0.18, 0.04], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.16, 0.17], parent: spine });
  const head = b.joint("head", { at: [0, 0.15, 0.22], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.115, 0.27], parent: head });
  const earL = b.joint("earL", { at: [0.055, 0.2, 0.2], parent: head });
  const earR = b.joint("earR", { at: [-0.055, 0.2, 0.2], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.1, -0.2], parent: hips });
  const legs: Record<string, any> = {};
  const legPos: [string, number, number][] = [
    ["FL", 0.085, 0.11],
    ["FR", -0.085, 0.11],
    ["BL", 0.085, -0.12],
    ["BR", -0.085, -0.12],
  ];
  for (const [n, x, z] of legPos) {
    legs[n] = b.joint("leg" + n, { at: [x, 0.07, z], parent: hips });
  }

  const part = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any, dir?: number[]) =>
    b.part(geo, color, dir ? { at, bone, dir } : { at, bone });

  // ---------- body ----------
  const bodyGeo = new THREE.SphereGeometry(1, 12, 9);
  bodyGeo.scale(R.x * 0.97, R.y * 0.97, R.z * 0.97);
  part(bodyGeo, "#c9a374", [C.x, C.y, C.z], spine);
  // soft belly
  const belly = new THREE.SphereGeometry(1, 10, 7);
  belly.scale(0.125, 0.09, 0.16);
  part(belly, "#e6cfa8", [0, 0.12, 0.02], spine);

  // ---------- spines ----------
  const spineGeo = (len: number, rad: number) => {
    const g = new THREE.ConeGeometry(rad, len, 5);
    g.translate(0, len / 2, 0);
    return g;
  };
  const shaft = spineGeo(0.075, 0.014);
  const tip = spineGeo(0.03, 0.0075);
  const browns = ["#7a3f1e", "#8c4a24", "#6a3418"];
  let placed = 0;
  let guard = 0;
  while (placed < 270 && guard++ < 5000) {
    const u = r() * 2 - 1;
    const th = r() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const n = new THREE.Vector3(s * Math.cos(th), u, s * Math.sin(th));
    if (n.y < -0.05) continue;
    if (n.z > 0.5 && n.y < 0.62) continue; // face opening
    const p = new THREE.Vector3(n.x * R.x, n.y * R.y, n.z * R.z);
    const d = new THREE.Vector3(n.x / R.x, n.y / R.y, n.z / R.z).normalize();
    // splay back slightly
    d.z -= 0.15;
    d.normalize();
    const at = p.clone().add(C).addScaledVector(d, -0.01);
    const col = browns[Math.floor(r() * browns.length)];
    part(shaft, col, at.toArray(), spine, d.toArray());
    const tipAt = at.clone().addScaledVector(d, 0.05);
    part(tip, "#f1deb0", tipAt.toArray(), spine, d.toArray());
    placed++;
  }

  // ---------- head ----------
  const skull = new THREE.SphereGeometry(1, 10, 8);
  skull.scale(0.078, 0.07, 0.085);
  part(skull, "#e0b98a", [0, 0.15, 0.22], head);
  const cheek = new THREE.SphereGeometry(1, 8, 6);
  cheek.scale(0.05, 0.04, 0.05);
  part(cheek, "#ecc9a0", [0, 0.13, 0.26], head);
  // snout (upper)
  const snout = new THREE.ConeGeometry(0.052, 0.13, 7);
  snout.translate(0, 0.065, 0);
  part(snout, "#e8c394", [0, 0.145, 0.25], head, [0, -0.12, 1]);
  // lower jaw
  const jawG = new THREE.ConeGeometry(0.032, 0.08, 6);
  jawG.translate(0, 0.04, 0);
  part(jawG, "#d9b183", [0, 0.115, 0.265], jaw, [0, -0.03, 1]);
  // nose
  const nose = new THREE.SphereGeometry(0.02, 8, 6);
  part(nose, "#111111", [0, 0.128, 0.385], head);
  const noseShine = new THREE.SphereGeometry(0.006, 5, 4);
  part(noseShine, "#ffffff", [0.006, 0.139, 0.395], head);
  // eyes
  for (const sx of [1, -1]) {
    const eye = new THREE.SphereGeometry(0.017, 8, 6);
    part(eye, "#0b0b0b", [sx * 0.05, 0.17, 0.275], head);
    const hl = new THREE.SphereGeometry(0.0055, 5, 4);
    part(hl, "#ffffff", [sx * 0.054, 0.178, 0.289], head);
    const brow = new THREE.SphereGeometry(1, 6, 4);
    brow.scale(0.016, 0.006, 0.014);
    part(brow, "#b98f62", [sx * 0.05, 0.193, 0.272], head);
  }
  // ears
  for (const [sx, j] of [[1, earL], [-1, earR]] as [number, any][]) {
    const ear = new THREE.SphereGeometry(1, 8, 6);
    ear.scale(0.028, 0.03, 0.012);
    part(ear, "#d9a77c", [sx * 0.058, 0.205, 0.2], j);
    const inner = new THREE.SphereGeometry(1, 6, 5);
    inner.scale(0.016, 0.018, 0.008);
    part(inner, "#e79a9a", [sx * 0.058, 0.205, 0.209], j);
  }
  // whisker-ish hairs
  for (const sx of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const w = new THREE.CylinderGeometry(0.0013, 0.0013, 0.06, 3);
      w.translate(0, 0.03, 0);
      part(w, "#4a3a2c", [sx * 0.025, 0.13 - i * 0.008, 0.33], head, [sx * 1, (i - 1) * 0.25, 0.5]);
    }
  }

  // ---------- legs & paws ----------
  for (const [n, x, z] of legPos) {
    const j = legs[n];
    const leg = new THREE.CylinderGeometry(0.026, 0.022, 0.07, 6);
    part(leg, "#e0b98a", [x, 0.06, z], j);
    const paw = new THREE.SphereGeometry(1, 8, 6);
    paw.scale(0.032, 0.02, 0.042);
    part(paw, "#f0a0a8", [x, 0.02, z + 0.012], j);
    for (let t = -1; t <= 1; t++) {
      const toe = new THREE.SphereGeometry(0.009, 5, 4);
      part(toe, "#e48894", [x + t * 0.0135, 0.016, z + 0.05], j);
    }
  }

  // ---------- tail ----------
  const tl = new THREE.SphereGeometry(0.025, 6, 5);
  part(tl, "#c9a374", [0, 0.1, -0.2], tail1);

  // ---------- maple leaf ----------
  const shape = new THREE.Shape();
  const pts: [number, number][] = [];
  const lobes = 5;
  for (let i = 0; i < lobes * 4; i++) {
    const a = (i / (lobes * 4)) * Math.PI * 2 + Math.PI / 2;
    const k = i % 4;
    const rad = k === 0 ? 0.08 : k === 2 ? 0.035 : 0.055;
    const rr = k === 0 ? rad : k === 2 ? rad : rad * 0.9;
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 1.05]);
  }
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();
  const leafG = new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: false });
  leafG.rotateX(-Math.PI / 2);
  const leafDir = new THREE.Vector3(0.3, 1, -0.35).normalize();
  const leafAt = new THREE.Vector3(0.045, 0.3, -0.04);
  part(leafG, "#c4281c", leafAt.toArray(), spine, leafDir.toArray());
  // veins
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
    const v = new THREE.BoxGeometry(0.004, 0.003, 0.05);
    v.translate(0, 0, 0.025);
    // lay vein flat on leaf plane, pointing outward (leaf plane is perpendicular to leafDir)
    const m = new THREE.Matrix4().makeRotationY(a);
    v.applyMatrix4(m);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), leafDir);
    v.applyQuaternion(q);
    const o = leafAt.clone().addScaledVector(leafDir, 0.006);
    part(v, "#8a1510", o.toArray(), spine);
  }
  const stem = new THREE.CylinderGeometry(0.004, 0.005, 0.045, 5);
  stem.translate(0, -0.0225, 0);
  const sq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), leafDir);
  const sideAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(sq);
  stem.rotateX(0);
  stem.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(sideAxis, Math.PI / 2));
  stem.applyQuaternion(sq);
  part(stem, "#6e2a14", leafAt.clone().addScaledVector(leafDir, 0.003).toArray(), spine);

  return b.root;
}
```