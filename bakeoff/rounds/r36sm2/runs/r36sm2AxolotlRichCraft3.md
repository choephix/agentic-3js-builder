```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, countershade, spots, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Axolotl",
  description: "Chibi axolotl with a big smiling head, six frilly pink gills, stubby legs and a finned tail.",
};

// Palette
const BELLY = "#fde6ea";
const PINK = "#f6b3c6";
const FRECKLE = "#e68aa6";
const DARK = "#2a1830";
const STALK = "#dd507c";
const FIL = "#f2799b";
const TIPC = "#ffa6c0";
const TOE = "#fbcfda";
const FRECK_STICK = "#e48aa3";

const BODY = countershade(spots(PINK, FRECKLE, { size: 0.035, amount: 0.3, seed: 3 }), BELLY, {
  level: -0.25,
  soft: 0.3,
});
const FINP = paint((_p, _n, s) =>
  Math.abs(Math.sin(s[0] * 160 + s[1] * 40)) < 0.12 ? "#ee8fa8" : "#f9c3d0",
);

// Textures
const EYE = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#1a0f24"/>
    <circle cx="32" cy="32" r="30" fill="none" stroke="#5a3270" stroke-width="3"/>
    <ellipse cx="32" cy="38" rx="22" ry="16" fill="#3a2150" opacity="1"/>
    <circle cx="32" cy="32" r="20" fill="#120a1a" opacity="0.8"/>
    <circle cx="22" cy="21" r="9" fill="#ffffff"/>
    <circle cx="43" cy="42" r="4.5" fill="#ffffff"/>
    <circle cx="46" cy="30" r="2.2" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const SMILE = svg(
  `<svg viewBox="0 0 100 40">
    <path d="M5 9 Q50 46 95 9" stroke="#8a2f4a" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M3 4 L8 14 M97 4 L92 14" stroke="#8a2f4a" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 40 24">
    <ellipse cx="20" cy="12" rx="18" ry="10" fill="#ff86a4"/>
    <path d="M11 6 l-3 9 M20 5 l-3 11 M29 6 l-3 9" stroke="#e2587e" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const rand = rng(11);
  const sphere = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.06, -0.05] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.06, -0.05],
      [0, 0.065, 0.02],
      [0, 0.07, 0.1],
    ]),
    { parent: hips, role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.06, -0.05],
      [0, 0.055, -0.13],
      [0, 0.05, -0.21],
      [0, 0.05, -0.29],
      [0, 0.06, -0.35],
    ]),
    { parent: hips, role: "tail" },
  );
  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, 0.075, 0.09],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.045, 0.09], aim: [0, 0.035, 0.2], role: "jaw" });

  // ---- Body ----
  const bodyPath = catmull([
    [0, 0.06, -0.35],
    [0, 0.05, -0.29],
    [0, 0.05, -0.21],
    [0, 0.055, -0.13],
    [0, 0.06, -0.05],
    [0, 0.065, 0.02],
    [0, 0.07, 0.1],
  ]);
  const body = b.sweep(bodyPath, [0.005, 0.015, 0.027, 0.04, 0.049, 0.052, 0.05], {
    bone: [tail, hips, spine],
    color: BODY,
    sides: 10,
  });

  // Tail fin
  b.extrude(
    [
      [0, 0.052],
      [0.05, 0.058],
      [0.12, 0.04],
      [0.2, 0.034],
      [0.27, 0.02],
      [0.31, 0.0],
      [0.285, -0.024],
      [0.2, -0.04],
      [0.12, -0.048],
      [0.05, -0.05],
      [0, -0.05],
    ],
    {
      at: [0, 0.06, -0.04],
      x: [0, 0, -1],
      thickness: 0.004,
      bevel: 0.001,
      smoothing: 1,
      color: FINP,
      bone: tail.joints[1],
    },
  );

  // Freckle dots on the back
  const skinBody = b.surface(body);
  for (const h of skinBody.scatter(46, { rng: rand, minDist: 0.028, filter: (h: any) => h.n.y > 0.45 }))
    b.stick(new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 6), FRECK_STICK, h, { embed: 0.5 });

  // ---- Head ----
  const HC: [number, number, number] = [0, 0.075, 0.14];
  const skull = b.part(sphere(1, 18, 12), BODY, {
    bone: head,
    at: HC,
    scale: [0.095, 0.058, 0.085],
  });
  b.part(sphere(1, 14, 8), BELLY, { bone: jaw, at: [0, 0.03, 0.15], scale: [0.074, 0.022, 0.07] });
  // Tiny tongue
  b.part(sphere(1, 8, 5), "#f08aa0", { bone: jaw, at: [0, 0.046, 0.15], scale: [0.03, 0.006, 0.04] });

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(HC).at(s * 30, 38);
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.05, 0.05], segments: 10 });
    const cheek = skin.around(HC).at(s * 55, -6);
    if (cheek) b.decal(skull, BLUSH, { at: cheek, size: [0.04, 0.025], mirror: s > 0, segments: 8 });
    const nose = skin.around(HC).at(s * 9, 14);
    if (nose) b.stick(sphere(0.0045, 6, 4), DARK, nose, { embed: 0.4 });
  }
  const mouth = skin.around(HC).at(0, -15);
  if (mouth) b.decal(skull, SMILE, { at: mouth, size: [0.14, 0.056], segments: 16, lift: 0.002 });

  // ---- Gills ----
  const specs = [
    { r: [0.06, 0.1, 0.11], t: [0.17, 0.2, 0.06] },
    { r: [0.072, 0.082, 0.11], t: [0.215, 0.14, 0.07] },
    { r: [0.075, 0.064, 0.115], t: [0.2, 0.075, 0.085] },
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    specs.forEach((g, i) => {
      const root: [number, number, number] = [s * g.r[0], g.r[1], g.r[2]];
      const tip: [number, number, number] = [s * g.t[0], g.t[1], g.t[2]];
      const ctrl: [number, number, number] = [
        s * (g.r[0] + g.t[0]) * 0.5,
        (g.r[1] + g.t[1]) / 2 + 0.03,
        (g.r[2] + g.t[2]) / 2 + 0.01,
      ];
      const ch = b.chain(`gill${S}${i + 1}`, bezier(root, ctrl, tip), { parent: head, count: 3, role: "fan" });
      const sw = b.sweep(ch, [0.01, 0.0035], { color: STALK, sides: 6 });
      for (let k = 0; k < 7; k++) {
        const t = 0.1 + k * 0.13;
        for (const deg of [50, 130, 230, 310]) {
          const at: any = sw.at(t, deg);
          const d = at.n.clone().multiplyScalar(0.8).add(at.tangent.clone().multiplyScalar(0.6));
          const len = 0.058 * (1 - 0.5 * t);
          b.spike(at, d, len, 0.0058, { color: k % 2 ? FIL : TIPC, sides: 4 });
        }
      }
      b.part(sphere(0.009, 6, 4), TIPC, { at: sw.at(1) as any });
    });
  }

  // ---- Legs ----
  function toes(s: number, wrist: number[], bone: any, count: number, len: number, outDir: number[]) {
    const base = Math.atan2(s * outDir[0], outDir[1]); // angle from +Z toward +X
    const spread = count > 4 ? 0.95 : 0.8;
    for (let i = 0; i < count; i++) {
      const a = base + (i / (count - 1) - 0.5) * 2 * spread;
      const tip: [number, number, number] = [
        wrist[0] + Math.sin(a) * len,
        0.009,
        wrist[2] + Math.cos(a) * len,
      ];
      b.capsule([wrist[0], 0.011, wrist[2]], tip, 0.0062, { color: TOE, bone, sides: 6 });
      b.part(sphere(0.0078, 6, 4), "#f7a9bc", { at: tip, bone });
    }
    b.part(sphere(1, 8, 5), BODY, { bone, at: [wrist[0], 0.011, wrist[2]], scale: [0.018, 0.009, 0.018] });
  }

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.055, 0.05, 0.065],
        [s * 0.09, 0.028, 0.07],
        [s * 0.115, 0.012, 0.09],
      ]),
      { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.022, 0.013], { color: BODY, sides: 8 });
    toes(s, [s * 0.115, 0, 0.09], arm.tip, 4, 0.028, [0.7, 0.7]);

    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.05, 0.052, -0.05],
        [s * 0.09, 0.03, -0.07],
        [s * 0.11, 0.012, -0.045],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, [0.026, 0.014], { color: BODY, sides: 8 });
    toes(s, [s * 0.11, 0, -0.045], leg.tip, 5, 0.03, [0.6, 0.8]);
  }

  return b.root;
}
```