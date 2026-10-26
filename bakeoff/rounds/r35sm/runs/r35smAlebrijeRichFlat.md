```ts
import * as THREE from "three";
import { createBuilder, rng, limb, catmull, bezier } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan alebrije painted-wood fantasy beast: a jaguar body with an eagle's head, beak, wings and talons, covered in dotted rosettes and bright feather trim.",
};

// ---- palette -------------------------------------------------------------------------------------------
const GOLD = "#f4b73c";
const ORANGE = "#f07a22";
const MAGENTA = "#d8246f";
const TURQ = "#1fb8b0";
const BLUE = "#2b4fd0";
const YEL = "#ffe14d";
const GREEN = "#7ac943";
const CREAM = "#fff0cf";
const BLACK = "#1d1226";
const RED = "#e0352b";
const PURPLE = "#6a2c9c";
const PAL = [TURQ, MAGENTA, ORANGE, BLUE, YEL, GREEN, RED, PURPLE];
const pal = (i: number) => PAL[((i % PAL.length) + PAL.length) % PAL.length];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "alebrije" });

  // ---- helpers -----------------------------------------------------------------------------------------
  // A flat painted feather blade lying along `dir`, its width across `widthAxis`.
  function feather(at: THREE.Vector3, dir: THREE.Vector3, len: number, wid: number, color: string, widthAxis: THREE.Vector3, bone: any, thick = 0.012) {
    const d = dir.clone().normalize();
    const w = widthAxis.clone().addScaledVector(d, -widthAxis.dot(d));
    if (w.lengthSq() < 1e-4) w.set(1, 0, 0).addScaledVector(d, -d.x);
    w.normalize();
    const L = len;
    const W = wid;
    return b.extrude(
      [
        [0, -0.2 * W],
        [0, 0.2 * W],
        [0.3 * L, W],
        [0.75 * L, 0.8 * W],
        [L, 0, "sharp"],
        [0.75 * L, -0.8 * W],
        [0.3 * L, -W],
      ],
      { at, x: d, y: w, thickness: thick, color, bone },
    );
  }
  // Concentric painted dots seated on a surface hit.
  function dotStack(hit: any, specs: [number, number, string][]) {
    for (const [r, h, c] of specs) b.stick(new THREE.CylinderGeometry(r, r, h, 10), c, hit, { embed: 0.3 });
  }
  const ROSETTE: [number, number, string][] = [
    [0.05, 0.01, MAGENTA],
    [0.036, 0.015, TURQ],
    [0.02, 0.02, YEL],
  ];

  // ---- skeleton ----------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.64, -0.4], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.64, -0.4],
      [0, 0.67, 0.02],
      [0, 0.69, 0.42],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.72, 0.42],
      [0, 0.88, 0.55],
      [0, 1.0, 0.66],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const HC = V(0, 1.04, 0.7);
  const head = b.joint("head", { parent: neck, at: [0, 1.0, 0.64], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.99, 0.76], aim: [0, 0.965, 0.95], role: "jaw" });

  // ---- body --------------------------------------------------------------------------------------------
  const body = b.sweep(spine, (t) => [0.19 + 0.05 * t, 0.2 + 0.03 * Math.sin(Math.PI * t)], {
    color: GOLD,
    sectors: [
      [120, 240, TURQ],
      [-16, 16, MAGENTA],
    ],
  });
  b.sweep(neck, [0.13, 0.095], { color: GOLD, sectors: [[110, 250, ORANGE]] });

  // dorsal spines
  let k = 0;
  b.along(body, 9, (at) => b.spike(at, at, 0.07, 0.032, { color: pal(k++) }));

  // rosettes and dots
  const skin = b.surface(body);
  const rosettes = skin.scatter(16, { rng: rng(5), minDist: 0.17, filter: (h) => h.n.y > -0.1 });
  for (const h of rosettes) dotStack(h, ROSETTE);
  let di = 0;
  for (const h of skin.scatter(70, { rng: rng(9), minDist: 0.075, filter: (h) => h.n.y > -0.6 })) {
    if (rosettes.some((r) => r.at.distanceTo(h.at) < 0.08)) continue;
    b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8), pal(di++ + 2), h, { embed: 0.3 });
  }

  // ---- ruffs -------------------------------------------------------------------------------------------
  for (const [t, r, n] of [
    [0.3, 0.14, 12],
    [0.65, 0.115, 11],
  ] as [number, number, number][]) {
    let c = 0;
    b.ring(neck.at(t), { count: n, radius: r, tilt: -40 }, (it) => b.spike(it, it, 0.14, 0.04, { color: pal(c++ + (t > 0.5 ? 1 : 0)) }));
  }

  // ---- head --------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), GOLD, { bone: head, at: HC, scale: [0.115, 0.12, 0.125] });
  // facial disc stripes
  for (const s of [1, -1]) {
    const hit = b.surface(skull).around(HC).at(s * 62, 5);
    if (hit) dotStack(hit, [[0.03, 0.008, MAGENTA], [0.02, 0.012, YEL]]);
    const hit2 = b.surface(skull).around(HC).at(s * 70, 38);
    if (hit2) dotStack(hit2, [[0.022, 0.008, TURQ], [0.012, 0.012, BLACK]]);
    // ears (jaguar)
    const ear = b.part(new THREE.SphereGeometry(0.045, 8, 6), GOLD, { bone: head, at: [s * 0.085, 1.15, 0.64], scale: [1, 1, 0.6], dir: [s * 0.4, 0.5, 0.2] });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), MAGENTA, { bone: head, at: [s * 0.09, 1.155, 0.665], scale: [1, 1, 0.5] });
    void ear;
    // eyes
    const e = V(s * 0.085, 1.075, 0.765);
    b.part(new THREE.SphereGeometry(0.044, 10, 8), MAGENTA, { bone: head, at: e.clone().add(V(0, 0, -0.008)) });
    b.part(new THREE.SphereGeometry(0.036, 10, 8), YEL, { bone: head, at: e.clone().add(V(s * 0.004, 0, 0.004)) });
    b.part(new THREE.SphereGeometry(0.021, 8, 6), BLACK, { bone: head, at: e.clone().add(V(s * 0.012, 0, 0.026)) });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), "#ffffff", { bone: head, at: e.clone().add(V(s * 0.004, 0.01, 0.043)) });
    // brow
    b.capsule([s * 0.035, 1.105, 0.835], [s * 0.115, 1.13, 0.74], 0.017, { color: BLACK, bone: head });
    // nostril dots on beak
    b.part(new THREE.SphereGeometry(0.01, 6, 4), BLACK, { bone: head, at: [s * 0.03, 1.04, 0.87] });
  }
  // beak
  b.sweep(
    catmull([
      [0, 1.035, 0.78],
      [0, 1.045, 0.9],
      [0, 1.015, 0.98],
      [0, 0.955, 1.0],
    ]),
    (t) => [0.055 * (1 - t) + 0.006, 0.055 * (1 - t) + 0.006],
    { bone: head, caps: { start: "flat", end: "point" }, sectors: [[-30, 30, YEL]], color: ORANGE },
  );
  b.sweep(
    catmull([
      [0, 0.98, 0.78],
      [0, 0.968, 0.89],
      [0, 0.962, 0.955],
    ]),
    [0.04, 0.012],
    { bone: jaw, color: YEL, caps: { start: "flat", end: "point" } },
  );
  // crest of feathers
  for (let i = 0; i < 5; i++) {
    const a = ((i - 2) * 22 * Math.PI) / 180;
    feather(V(Math.sin(a) * 0.04, 1.15, 0.66), V(Math.sin(a) * 0.7, 0.6, -0.7), 0.2, 0.035, pal(i + 1), V(1, 0, 0), head, 0.012);
  }

  // ---- tail --------------------------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.64, -0.5],
      [0, 0.62, -0.78],
      [0, 0.6, -1.0],
      [0, 0.64, -1.18],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, [0.075, 0.04], { color: (t) => (Math.floor(t * 9) % 2 ? GOLD : BLACK) });
  const tailTip = tail.tip ?? tail.joints[tail.joints.length - 1];
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) * 17 * Math.PI) / 180;
    const d = V(Math.sin(a), 0.1, -Math.cos(a));
    const f = feather(V(0, 0.64, -1.17), d, 0.42 - Math.abs(i - 3) * 0.02, 0.075, pal(i), V(Math.cos(a), 0, Math.sin(a)), tailTip, 0.012);
    void f;
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 8), i % 2 ? YEL : CREAM, {
      bone: tailTip,
      at: V(0, 0.646, -1.17).addScaledVector(d.clone().normalize(), 0.28),
    });
  }

  // ---- wings -------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${n}`,
      catmull([
        [s * 0.2, 0.9, 0.2],
        [s * 0.6, 0.98, 0.15],
        [s * 0.95, 0.95, 0.05],
        [s * 1.25, 0.9, -0.05],
      ]),
      { parent: spine, names: [`wingA${n}`, `wingB${n}`, `wingC${n}`, `wingD${n}`], role: "wing" },
    );
    b.sweep(wing, [0.055, 0.03], { color: (t) => (t < 0.5 ? ORANGE : MAGENTA) });
    // primaries / secondaries
    let i = 0;
    b.along(
      wing,
      8,
      (p: any) => {
        const t = p.t ?? i / 8;
        const d = V(s * (0.12 + 0.55 * t), 0, -1);
        const len = 0.5 + 0.28 * t;
        const at = p.at.clone().add(V(0, -0.012, -0.02));
        feather(at, d, len, 0.07, pal(i), V(1, 0, 0), p.bone, 0.012);
        b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 8), i % 2 ? YEL : CREAM, {
          bone: p.bone,
          at: at.clone().addScaledVector(d.clone().normalize(), len * 0.72).add(V(0, 0.007, 0)),
        });
        // covert
        feather(p.at.clone().add(V(0, 0.016, 0.03)), d, 0.26 + 0.1 * t, 0.06, pal(i + 3), V(1, 0, 0), p.bone, 0.01);
        i++;
      },
      { from: 0.02, to: 0.98 },
    );
  }

  // ---- legs --------------------------------------------------------------------------------------------
  function foot(tipJoint: any, x: number, z: number, talon: boolean) {
    b.part(new THREE.SphereGeometry(0.06, 8, 6), talon ? YEL : TURQ, { bone: tipJoint, at: [x, 0.05, z + 0.03], scale: [1, 0.8, 1.35] });
    const toes = talon ? 3 : 3;
    for (let i = 0; i < toes; i++) {
      const dx = (i - 1) * 0.04;
      const L = talon ? 0.15 : 0.09;
      b.capsule([x + dx, 0.04, z + 0.05], [x + dx * 1.3, 0.027, z + 0.05 + L], 0.022, { color: talon ? YEL : TURQ, bone: tipJoint });
      b.spike([x + dx * 1.3, 0.03, z + 0.05 + L], [0, -0.45, 1], 0.07, 0.014, { color: talon ? BLACK : CREAM, bone: tipJoint });
    }
    if (talon) {
      b.capsule([x, 0.04, z - 0.01], [x, 0.027, z - 0.11], 0.02, { color: YEL, bone: tipJoint });
      b.spike([x, 0.03, z - 0.11], [0, -0.45, -1], 0.06, 0.013, { color: BLACK, bone: tipJoint });
    }
  }
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    // front: jaguar paws
    const fPts = limb([s * 0.17, 0.6, 0.38], [s * 0.19, 0.05, 0.42], [0.3, 0.3], [[0, 0, -1]]);
    const fl = b.chain(`legF${n}`, fPts, { parent: spine, names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`], role: "leg" });
    b.sweep(fl, (t) => 0.085 - 0.035 * t, { color: (t) => (t < 0.72 ? GOLD : TURQ) });
    foot(fl.tip ?? fl.joints[fl.joints.length - 1], s * 0.19, 0.42, false);
    b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 9), MAGENTA, b.surface(fl.joints[0]).nearest([s * 0.26, 0.58, 0.38]), { embed: 0.3 });
    // hind: eagle legs
    const hPts = limb([s * 0.17, 0.6, -0.4], [s * 0.19, 0.05, -0.5], [0.28, 0.28, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${n}`, hPts, { parent: hips, names: [`hip${n}`, `knee${n}`, `hock${n}`, `ankle${n}`], role: "leg" });
    b.sweep(hl, (t) => 0.095 - 0.055 * t, { color: (t) => (t < 0.55 ? GOLD : t < 0.8 ? ORANGE : YEL) });
    foot(hl.tip ?? hl.joints[hl.joints.length - 1], s * 0.19, -0.5, true);
    for (let i = 0; i < 3; i++)
      feather(V(s * 0.265, 0.66, -0.5 + i * 0.1), V(0, -1, -0.12), 0.3 - i * 0.03, 0.05, pal(i + (s > 0 ? 0 : 3)), V(0, 0, 1), hl.joints[0], 0.012);
  }

  return b.root;
}
```