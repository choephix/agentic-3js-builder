import * as THREE from "three";
import { createBuilder, rng, catmull, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description:
    "A stylized low-poly male lion in a neutral standing rest pose: tawny mottled coat with pale belly, a layered faceted mane of chunky tufts, amber eyes, whiskered muzzle, separate jaw and a tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------- palette ----------
  const COAT_BASE = mottle("#c4843a", "#d3984c", { size: 0.2, seed: 4, contrast: 0.8 });
  const COAT_BELLY = countershade(COAT_BASE, "#ecd4a4", { level: -0.3, soft: 0.35 });
  const COAT = countershade("#b5752f", COAT_BELLY, { level: 0.8, soft: 0.12 });
  const HEAD = "#c98c40";
  const HEAD_DARK = "#b07232";
  const CREAM = "#ead3a4";
  const PAW = "#dcb57c";
  const NOSE = "#3a2220";
  const MANE_DARK = "#4e2610";
  const EYE = "#e8a628";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0, 0] });
  b.chain(
    "spine",
    [
      [0, 0.92, -0.62],
      [0, 0.93, -0.15],
      [0, 0.97, 0.35],
      [0, 1.0, 0.62],
    ],
    { names: ["hips", "spine1", "chest"], role: "spine", parent: "root" },
  );
  b.joint("neck", { parent: "chest", at: [0, 1.0, 0.62], aim: [0, 1.2, 0.86], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.2, 0.86], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.13, 0.95], dir: [0, -0.3, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.95, -0.85],
      [0, 0.86, -1.12],
      [0, 0.66, -1.36],
      [0, 0.5, -1.58],
      [0, 0.44, -1.8],
    ]),
    { count: 4, role: "tail", parent: "hips" },
  );

  // ---------- torso ----------
  b.loft(
    [
      { at: [0, 0.9, -0.82], w: 0.34, h: 0.36 },
      { at: [0, 0.92, -0.6], w: 0.46, h: 0.5 },
      { at: [0, 0.9, -0.2], w: 0.42, h: 0.46 },
      { at: [0, 0.95, 0.25], w: 0.5, h: 0.6 },
      { at: [0, 0.98, 0.55], w: 0.44, h: 0.56 },
      { at: [0, 1.0, 0.7], w: 0.3, h: 0.36 },
    ],
    { color: COAT, bone: ["hips", "spine1", "chest"], sides: 10, name: "torso" },
  );

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const x = 0.2 * s;
    const fp: [number, number, number][] = [
      [x, 0.98, 0.45],
      [x, 0.58, 0.36],
      [x, 0.17, 0.43],
      [x, 0.05, 0.56],
    ];
    b.chain(`legF${S}`, fp, {
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`],
      role: "leg",
      parent: "chest",
    });
    b.part(sphere(0.12), COAT, { at: [x * 1.05, 0.86, 0.44], scale: [0.8, 1.35, 1.05], bone: `shoulder${S}`, flat: true });
    b.capsule(fp[0], fp[1], [0.1, 0.075], { color: COAT, bone: `shoulder${S}`, sides: 8 });
    b.capsule(fp[1], fp[2], [0.07, 0.055], { color: COAT, bone: `elbow${S}`, sides: 8 });
    b.capsule(fp[2], [x, 0.08, 0.47], [0.055, 0.06], { color: PAW, bone: `wrist${S}`, sides: 8 });
    b.part(sphere(0.085), PAW, { at: [x, 0.06, 0.48], scale: [1, 0.62, 1.3], bone: `wrist${S}`, flat: true });
    for (const o of [-0.045, -0.015, 0.015, 0.045])
      b.part(sphere(0.03, 6, 4), PAW, { at: [x + o, 0.03, 0.555 - Math.abs(o) * 0.6], bone: `wrist${S}`, flat: true });
    b.spike([x, 0.6, 0.33], [x + 0.01 * s, 0.48, 0.24], null, 0.035, {
      color: MANE_DARK,
      bone: `elbow${S}`,
      sides: 5,
      smooth: false,
    });

    // hind
    const h = 0.19 * s;
    const hp: [number, number, number][] = [
      [h, 0.92, -0.62],
      [h, 0.56, -0.46],
      [h, 0.3, -0.74],
      [h, 0.08, -0.66],
      [h, 0.05, -0.52],
    ];
    b.chain(`legH${S}`, hp, {
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`, `toe${S}`],
      role: "leg",
      parent: "hips",
    });
    b.part(sphere(0.16), COAT, { at: [h * 1.08, 0.76, -0.56], scale: [0.75, 1.25, 1.15], bone: `hip${S}`, flat: true });
    b.capsule(hp[0], hp[1], [0.11, 0.08], { color: COAT, bone: `hip${S}`, sides: 8 });
    b.capsule(hp[1], hp[2], [0.07, 0.05], { color: COAT, bone: `knee${S}`, sides: 8 });
    b.capsule(hp[2], hp[3], [0.05, 0.05], { color: COAT, bone: `hock${S}`, sides: 8 });
    b.part(sphere(0.085), PAW, { at: [h, 0.06, -0.59], scale: [1, 0.62, 1.3], bone: `foot${S}`, flat: true });
    for (const o of [-0.045, -0.015, 0.015, 0.045])
      b.part(sphere(0.03, 6, 4), PAW, { at: [h + o, 0.03, -0.515 - Math.abs(o) * 0.6], bone: `foot${S}`, flat: true });
  }

  // ---------- tail ----------
  b.sweep(tail, (t: number) => 0.045 - 0.02 * t, { color: COAT, sides: 6, name: "tail" });
  {
    const tip = tail.at(1);
    const p = tip.at;
    const tg = tip.tangent.normalize();
    b.part(sphere(0.055, 6, 5), MANE_DARK, { at: p.clone().addScaledVector(tg, 0.02), bone: "tail4", flat: true });
    for (let k = 0; k < 7; k++) {
      const d = tg
        .clone()
        .add(V((R() - 0.5) * 0.9, (R() - 0.5) * 0.9, (R() - 0.5) * 0.4))
        .normalize();
      const base = p.clone().addScaledVector(tg, 0.01);
      b.spike(base, base.clone().addScaledVector(d, 0.1 + R() * 0.07), null, 0.035, {
        color: k % 2 ? MANE_DARK : "#3a1c0c",
        bone: "tail4",
        sides: 5,
        smooth: false,
      });
    }
  }

  // ---------- head ----------
  b.part(sphere(0.17, 8, 6), HEAD, { at: [0, 1.25, 0.92], scale: [1.05, 0.9, 1], bone: "head", flat: true });
  b.part(new THREE.BoxGeometry(0.26, 0.08, 0.12), HEAD_DARK, { at: [0, 1.31, 1.0], bone: "head" });
  b.part(new THREE.BoxGeometry(0.09, 0.07, 0.2), "#d39a4f", { at: [0, 1.235, 1.08], rotation: [12, 0, 0], bone: "head" });
  b.part(new THREE.BoxGeometry(0.2, 0.11, 0.14), CREAM, { at: [0, 1.15, 1.1], bone: "head" });
  for (const s of [1, -1])
    b.part(sphere(0.06, 7, 5), CREAM, { at: [s * 0.05, 1.155, 1.17], bone: "head", flat: true });
  // nose
  b.part(new THREE.BoxGeometry(0.08, 0.03, 0.05), NOSE, { at: [0, 1.228, 1.205], bone: "head" });
  b.part(new THREE.ConeGeometry(0.042, 0.04, 3), NOSE, { at: [0, 1.2, 1.215], rotation: [180, 0, 0], bone: "head" });
  // mouth interior + fangs (upper)
  b.part(new THREE.BoxGeometry(0.12, 0.04, 0.1), "#5a1e1e", { at: [0, 1.11, 1.08], bone: "head" });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.012, 0.04, 4), "#f4ecd8", { at: [s * 0.04, 1.105, 1.19], rotation: [180, 0, 0], bone: "head" });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.13, 0.05, 0.12), CREAM, { at: [0, 1.08, 1.11], bone: "jaw" });
  b.part(new THREE.BoxGeometry(0.12, 0.012, 0.11), NOSE, { at: [0, 1.106, 1.115], bone: "jaw" });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.009, 0.025, 4), "#f4ecd8", { at: [s * 0.035, 1.115, 1.16], bone: "jaw" });

  // eyes, brows, ears, whiskers
  for (const s of [1, -1]) {
    const ex = s * 0.072;
    b.part(sphere(0.034), "#2a1a10", { at: [ex, 1.27, 1.06], scale: [1, 0.75, 0.6], rotation: [0, 0, s * 8], bone: "head" });
    b.part(sphere(0.026), EYE, { at: [ex, 1.27, 1.074], scale: [1, 1, 0.6], bone: "head" });
    b.part(sphere(0.011, 6, 4), "#111111", { at: [ex, 1.27, 1.088], bone: "head" });
    b.part(sphere(0.005, 4, 3), "#ffffff", { at: [ex + 0.008, 1.278, 1.092], bone: "head" });
    b.part(sphere(0.025, 6, 4), "#f1e3c2", { at: [ex, 1.243, 1.075], scale: [1.3, 0.6, 0.5], bone: "head" });
    b.part(new THREE.BoxGeometry(0.008, 0.045, 0.008), "#3b2414", { at: [s * 0.048, 1.235, 1.1], rotation: [0, 0, s * -20], bone: "head" });
    b.part(new THREE.BoxGeometry(0.08, 0.022, 0.04), "#8f5a28", { at: [ex, 1.305, 1.07], rotation: [0, 0, s * 15], bone: "head" });

    // ears
    const earX = s * 0.14;
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), MANE_DARK, { at: [earX, 1.385, 0.925], rotation: [90, 0, 0], bone: "head" });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 8), HEAD, { at: [earX, 1.38, 0.94], rotation: [90, 0, 0], bone: "head" });
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 8), "#e2c08a", { at: [earX, 1.375, 0.952], rotation: [90, 0, 0], bone: "head" });

    // whisker dots and whiskers
    const pad = V(s * 0.05, 1.155, 1.17);
    for (let k = 0; k < 3; k++) {
      const d = V(s * 0.55, 0.15 - k * 0.12, 0.82).normalize();
      const pt = pad.clone().addScaledVector(d, 0.06);
      b.part(sphere(0.006, 4, 3), "#2a1a10", { at: pt, bone: "head" });
      const w = V(s * 0.9, 0.08 - k * 0.12, 0.25).normalize();
      b.rod(pt, pt.clone().addScaledVector(w, 0.15), 0.002, { color: "#f6efe0", bone: "head", sides: 3 });
    }
  }

  // ---------- mane ----------
  b.part(new THREE.IcosahedronGeometry(0.27, 1), "#6a3317", {
    at: [0, 1.13, 0.66],
    scale: [1, 1.05, 1.2],
    bone: "neck",
    flat: true,
  });
  const C = V(0, 1.21, 0.86);
  const layers = [
    { count: 16, R: 0.15, z: 0.93, len: 0.15, r: 0.055, tilt: 25, cols: ["#c27a33", "#a85f27"], bone: "head", off: 0 },
    { count: 14, R: 0.18, z: 0.84, len: 0.23, r: 0.075, tilt: 40, cols: ["#8c4a20", "#7a3e1a"], bone: "head", off: 0.5 },
    { count: 12, R: 0.17, z: 0.72, len: 0.3, r: 0.095, tilt: 58, cols: ["#5e2e14", "#6d3718"], bone: "neck", off: 0 },
  ];
  for (const L of layers) {
    for (let i = 0; i < L.count; i++) {
      const a = ((i + L.off) / L.count) * Math.PI * 2;
      const radial = V(Math.sin(a), Math.cos(a), 0);
      const base = V(C.x + radial.x * L.R, C.y + radial.y * L.R * 0.95, L.z);
      const t = (L.tilt * Math.PI) / 180;
      const dir = radial.clone().multiplyScalar(Math.cos(t)).add(V(0, 0, -Math.sin(t)));
      dir.y -= 0.15;
      dir.normalize();
      const len = L.len * (0.85 + 0.3 * R());
      b.spike(base, base.clone().addScaledVector(dir, len), null, L.r, {
        color: L.cols[i % 2],
        bone: L.bone,
        sides: 5,
        smooth: false,
      });
    }
  }
  // crest along the neck top
  for (let k = 0; k < 4; k++) {
    const base = V(0, 1.32 - k * 0.04, 0.62 - k * 0.1);
    b.spike(base, base.clone().add(V((R() - 0.5) * 0.06, 0.06, -0.2)), null, 0.07, {
      color: k % 2 ? "#5e2e14" : MANE_DARK,
      bone: k < 2 ? "neck" : "chest",
      sides: 5,
      smooth: false,
    });
  }
  // chest fringe
  for (const x of [-0.12, -0.04, 0.04, 0.12]) {
    const base = V(x, 0.92, 0.7);
    b.spike(base, base.clone().add(V(x * 0.3, -0.22 - R() * 0.06, 0.04)), null, 0.06, {
      color: Math.abs(x) > 0.1 ? "#6d3718" : "#5e2e14",
      bone: "chest",
      sides: 5,
      smooth: false,
    });
  }

  return b.root;
}
