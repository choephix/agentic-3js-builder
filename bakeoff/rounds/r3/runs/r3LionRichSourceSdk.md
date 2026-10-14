```ts
import * as THREE from "three";
import {
  createBuilder,
  polyline,
  catmull,
  frame,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  countershade,
  mottle,
} from "agentic-3js-builder";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old lion lying with his head held high: gold-to-chocolate shaggy mane, tawny body, cream belly and muzzle, scarred brow, padded paws and a dark-tufted tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lion" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const TAWNY = "#c99452";
  const CREAM = "#efdcb0";
  const DARK = "#2a1a10";

  const coat = countershade(mottle("#c99452", "#b98644", { size: 0.35, seed: 4 }), "#ecd8aa", {
    level: -0.3,
    soft: 0.25,
  });

  // Mane colour: golden at the face, chocolate at the edges.
  const face = V(0, 1.25, 1.2);
  const manePaint = paint((p) => {
    const d = p.distanceTo(face) + (noise(p, 0.1, 2) - 0.5) * 0.22;
    const t1 = smoothstep(0.18, 0.5, d);
    const t2 = smoothstep(0.45, 0.88, d);
    return mix(mix("#e6b95e", "#9a6a2a", t1), "#3b2312", t2);
  });

  // ---- Skeleton ----
  b.joint("root", { at: [0, 0.6, -0.7] });
  const spine = b.chain("spine", catmull([[0, 0.5, -0.8], [0, 0.55, -0.4], [0, 0.6, 0.1], [0, 0.65, 0.55]]), {
    parent: "root",
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.65, 0.55], [0, 0.95, 0.78], [0, 1.2, 0.92]]), {
    parent: spine,
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 1.2, 0.92], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.17, 1.14], dir: [0, 0, 1], role: "jaw" });

  // ---- Body ----
  b.loft(
    [
      { at: [0, 0.28, -0.85], w: 0.5, h: 0.56 },
      { at: [0, 0.36, -0.5], w: 0.62, h: 0.74 },
      { at: [0, 0.39, 0.0], w: 0.6, h: 0.78 },
      { at: [0, 0.43, 0.45], w: 0.62, h: 0.88 },
      { at: [0, 0.45, 0.72], w: 0.55, h: 0.9 },
    ],
    { color: coat, bone: spine, name: "body" },
  );
  b.sweep(neck, { radius: (t: number) => 0.24 - 0.04 * t, color: coat, name: "neckTube" });

  // ---- Head ----
  b.part(new THREE.SphereGeometry(0.2, 10, 8), TAWNY, { at: [0, 1.28, 1.08], scale: [1.05, 0.95, 1.1], bone: head, name: "skull" });
  b.part(new THREE.BoxGeometry(0.2, 0.14, 0.26), CREAM, { at: [0, 1.2, 1.3], bone: head, name: "muzzle" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.07, 8, 6), CREAM, { at: [s * 0.07, 1.19, 1.32], bone: head });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), "#e3a21a", { at: [s * 0.09, 1.33, 1.25], bone: head, name: "eye" });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), "#0b0806", { at: [s * 0.09, 1.333, 1.283], bone: head, name: "pupil" });
    b.part(new THREE.BoxGeometry(0.1, 0.035, 0.06), "#a8743a", { at: [s * 0.09, 1.375, 1.22], rotation: [0, 0, -s * 12], bone: head, name: "brow" });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), "#8a5a2a", { at: [s * 0.17, 1.46, 0.98], scale: [1, 1, 0.6], bone: head, name: "ear" });
    b.part(new THREE.SphereGeometry(0.035, 6, 5), "#2a1a10", { at: [s * 0.17, 1.46, 1.0], scale: [1, 1, 0.5], bone: head, name: "earInner" });
    // upper fangs
    b.part(new THREE.ConeGeometry(0.015, 0.06, 5).translate(0, -0.03, 0), "#f5efe0", { at: [s * 0.07, 1.14, 1.4], bone: head, name: "fang" });
    // lower fangs
    b.part(new THREE.ConeGeometry(0.014, 0.05, 5).translate(0, 0.025, 0), "#f5efe0", { at: [s * 0.06, 1.1, 1.4], bone: jaw, name: "fangLow" });
  }
  b.part(new THREE.BoxGeometry(0.11, 0.07, 0.06), "#17100d", { at: [0, 1.262, 1.435], bone: head, name: "nose" });
  b.part(new THREE.BoxGeometry(0.16, 0.05, 0.24), CREAM, { at: [0, 1.115, 1.28], bone: jaw, name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.12, 0.012, 0.2), "#5a2a2a", { at: [0, 1.145, 1.28], bone: jaw, name: "tongue" });
  // scar across the left (+X) brow
  b.part(new THREE.BoxGeometry(0.014, 0.13, 0.014), "#8a3f35", { at: [0.1, 1.375, 1.255], rotation: [0, 0, 28], bone: head, name: "scar" });

  // ---- Mane ----
  const mane1 = b.part(new THREE.IcosahedronGeometry(0.45, 1), manePaint, {
    at: [0, 1.18, 0.85], scale: [1.0, 1.05, 0.85], bone: head, flat: true, name: "mane",
  });
  const mane2 = b.part(new THREE.IcosahedronGeometry(0.38, 1), manePaint, {
    at: [0, 0.78, 0.6], scale: [1.05, 0.9, 1.0], bone: head, flat: true, name: "maneChest",
  });
  const cone = new THREE.ConeGeometry(0.07, 0.34, 5, 1, true);
  const r = rng(11);
  const hits = b.surface([mane1, mane2]).scatter(130, {
    rng: rng(3),
    minDist: 0.075,
    filter: (h) => h.at.distanceTo(face) > 0.3,
  });
  for (const h of hits) {
    const dir = h.n.clone().multiplyScalar(0.6).add(V(0, -0.35, -0.7)).normalize();
    const sc = 0.8 + r() * 0.7;
    b.stick(cone, manePaint, frame(h, dir), { embed: 0.3, scale: [sc, sc * (1 + r() * 0.5), sc] });
  }

  // ---- Legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fl = b.chain(
      "foreleg" + S,
      polyline([[s * 0.25, 0.45, 0.55], [s * 0.26, 0.2, 0.7], [s * 0.26, 0.13, 1.0]]),
      { parent: spine, names: ["shoulder" + S, "elbow" + S, "wrist" + S], role: "leg" },
    );
    b.sweep(fl, { radius: (t: number) => 0.13 - 0.03 * t, color: coat, name: "foreleg" + S });
    b.part(new THREE.SphereGeometry(0.12, 8, 6), TAWNY, { at: [s * 0.26, 0.07, 1.1], scale: [1, 0.55, 1.3], bone: "wrist" + S, name: "paw" });
    for (const dx of [-0.07, 0, 0.07])
      b.part(new THREE.SphereGeometry(0.045, 6, 5), CREAM, { at: [s * 0.26 + dx, 0.045, 1.25 - Math.abs(dx) * 0.4], bone: "wrist" + S, name: "toe" });

    const hl = b.chain(
      "hindleg" + S,
      polyline([[s * 0.38, 0.45, -0.55], [s * 0.4, 0.18, -0.15], [s * 0.38, 0.12, -0.65], [s * 0.38, 0.07, -0.3]]),
      { parent: "root", names: ["hip" + S, "knee" + S, "hock" + S, "paw" + S], role: "leg" },
    );
    b.sweep(hl, { radius: (t: number) => 0.14 - 0.07 * t, color: coat, name: "hindleg" + S });
    b.part(new THREE.SphereGeometry(0.3, 9, 7), coat, { at: [s * 0.36, 0.3, -0.5], scale: [0.6, 0.95, 1.05], bone: "hip" + S, name: "thigh" });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), TAWNY, { at: [s * 0.38, 0.065, -0.24], scale: [1, 0.6, 1.5], bone: "paw" + S, name: "hindPaw" });
    for (const dx of [-0.05, 0, 0.05])
      b.part(new THREE.SphereGeometry(0.035, 6, 5), CREAM, { at: [s * 0.38 + dx, 0.04, -0.09], bone: "paw" + S, name: "hindToe" });
  }

  // ---- Tail ----
  const tail = b.chain(
    "tail",
    catmull([[0, 0.3, -0.85], [0.1, 0.22, -1.25], [0.25, 0.15, -1.6], [0.4, 0.1, -1.9], [0.6, 0.08, -2.1]]),
    { parent: "root", role: "tail" },
  );
  b.sweep(tail, {
    radius: (t: number) => 0.065 - 0.02 * t,
    bands: [[0.82, coat], [1, DARK]],
    name: "tailTube",
  });
  const end = tail.at(1);
  const T = end.tangent.clone().normalize();
  const side = T.clone().cross(V(0, 1, 0)).normalize();
  const upv = side.clone().cross(T).normalize();
  const tuftCone = new THREE.ConeGeometry(0.045, 0.2, 5, 1, true).translate(0, 0.1, 0);
  const lastJoint = tail.joints[tail.joints.length - 1];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const d = T.clone().multiplyScalar(0.85)
      .addScaledVector(side, Math.cos(a) * 0.5)
      .addScaledVector(upv, Math.sin(a) * 0.5)
      .normalize();
    b.part(tuftCone, DARK, { at: end.at.clone().addScaledVector(T, -0.03), dir: d, bone: lastJoint, name: "tuft" });
  }
  b.part(tuftCone, DARK, { at: end.at.clone().addScaledVector(T, -0.03), dir: T, bone: lastJoint, name: "tuftTip" });

  return b.root;
}
```