import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, bezier, polyline } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { frame } from "../../../../src/frame";
import { paint, scales, mottle, gradient, noise } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "A jade-scaled, cloven-hooved chimera with golden antlers, a dragon head, a billowing cloud mane and a flame-curl tail, in cel-shaded high-fantasy anime style.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------- palette ----------
const JADE = "#2fbf9a";
const JADE_EDGE = "#12806a";
const CREAM = "#fff3d6";
const CREAM_SH = "#f0c9a0";
const GOLD = "#ffc83a";
const GOLD_DK = "#c98a14";
const CLOUD = "#fdfcff";
const CLOUD_SH = "#b9c4f0";
const LILAC = "#a58cf0";
const CORAL = "#ff6f6a";
const GEM = "#6ff0ff";
const HOOF = "#3a2a4a";

const COAT_SCALE = cel(scales([JADE, "#38cfa6", "#27ad8c"], JADE_EDGE, { size: 0.05, width: 0.1, seed: 4 }));
const COAT = cel(
  furEdge(scales([JADE, "#38cfa6", "#27ad8c"], JADE_EDGE, { size: 0.05, width: 0.1, seed: 4 }), CREAM, {
    axis: [0, 1, 0],
    level: -0.3,
    teeth: 0.2,
    period: 0.05,
    along: [0, 0, 1],
    ink: INK,
  }),
  "#1a8a7c",
);
const BELLY = cel(CREAM, CREAM_SH);
const GOLD_C = cel(GOLD, GOLD_DK);
const CLOUD_C = cel(CLOUD, CLOUD_SH);
const LILAC_C = cel(LILAC);
const CORAL_C = cel(CORAL);
const HOOF_C = cel(HOOF, "#1d1230");
const HEAD_C = cel(
  furEdge(scales([JADE, "#38cfa6"], JADE_EDGE, { size: 0.03, width: 0.1, seed: 9 }), CREAM, {
    by: "position",
    axis: [0, 1, 0],
    level: 1.52,
    teeth: 0.012,
    period: 0.02,
    along: [1, 0, 0],
  }),
  "#1a8a7c",
);

// ---------- textures ----------
const puff = (a: string, b: string) =>
  svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 78 C14 66 6 48 14 34 C6 26 14 12 26 14 C28 4 42 2 46 12 C58 12 62 28 52 36 C60 50 50 68 32 78 Z" fill="${a}" stroke="#7a86c8" stroke-width="3"/>
    <path d="M32 70 C22 60 20 48 26 38 C30 46 36 46 40 38 C46 50 42 62 32 70 Z" fill="${b}"/>
    <path d="M22 24 C26 18 34 18 38 22" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
    { size: 128 },
  );
const PUFF_W = puff("#ffffff", "#dfe6ff");
const PUFF_L = puff("#e6dcff", "#c3b3f7");
const PUFF_P = puff("#ffe2ea", "#ffc2d2");

const flameTex = svg(
  `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 94 C4 70 8 48 20 34 C14 24 22 10 24 2 C30 16 44 30 42 54 C40 74 34 86 24 94 Z" fill="#ff6f6a" stroke="#c43a58" stroke-width="3"/>
    <path d="M24 86 C12 68 16 52 24 42 C34 54 36 72 24 86 Z" fill="#ffb347"/>
    <path d="M24 72 C20 64 22 56 24 52 C28 58 28 66 24 72 Z" fill="#fff3a0"/>
  </svg>`,
  { size: 128 },
);

const medallion = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" fill="#ffc83a" stroke="#c98a14" stroke-width="4"/>
    <circle cx="32" cy="32" r="21" fill="#2a8f8a" stroke="#c98a14" stroke-width="2"/>
    <path d="M32 14 L36 28 L50 32 L36 36 L32 50 L28 36 L14 32 L28 28 Z" fill="#6ff0ff"/>
    <circle cx="32" cy="32" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const sash = svg(
  `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="4" width="128" height="24" fill="#ffc83a"/>
    <rect x="0" y="4" width="128" height="3" fill="#fff0a0"/>
    <rect x="0" y="25" width="128" height="3" fill="#c98a14"/>
    <path d="M0 16 Q8 8 16 16 T32 16 T48 16 T64 16 T80 16 T96 16 T112 16 T128 16" fill="none" stroke="#c98a14" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const swirlTex = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 54 C10 54 8 28 28 26 C42 25 44 40 34 40 C28 40 28 33 33 33" fill="none" stroke="#ffc83a" stroke-width="5" stroke-linecap="round"/>
    <path d="M32 54 C10 54 8 28 28 26 C42 25 44 40 34 40 C28 40 28 33 33 33" fill="none" stroke="#fff3a0" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const R = rng(11);
  const MIRROR = [1, -1] as const;

  // ================= BODY =================
  // spine path: rump -> chest -> neck base -> head (side view, z forward)
  const bodyStations = [
    { at: [0, 1.28, -0.95], w: 0.46, h: 0.5 },
    { at: [0, 1.36, -0.55], w: 0.52, h: 0.58 },
    { at: [0, 1.38, -0.1], w: 0.52, h: 0.6 },
    { at: [0, 1.4, 0.35], w: 0.5, h: 0.6 },
    { at: [0, 1.42, 0.7], w: 0.46, h: 0.56 },
    { at: [0, 1.5, 0.92], w: 0.34, h: 0.42 },
  ];
  const torso = b.loft(bodyStations, { color: COAT, sides: 10, caps: "round" });
  // belly under-strip
  b.loft(
    [
      { at: [0, 1.08, -0.7], w: 0.3, h: 0.14 },
      { at: [0, 1.06, -0.1], w: 0.34, h: 0.14 },
      { at: [0, 1.08, 0.6], w: 0.3, h: 0.14 },
    ],
    { color: BELLY, sides: 8, caps: "round" },
  );
  // chest
  b.part(new THREE.SphereGeometry(0.34, 12, 9), COAT, { at: [0, 1.32, 0.78], scale: [0.95, 1.05, 0.9] });
  // haunches
  for (const s of MIRROR) {
    b.part(new THREE.SphereGeometry(0.3, 10, 8), COAT, { at: [s * 0.28, 1.2, -0.72], scale: [0.8, 1.15, 1.2] });
    b.part(new THREE.SphereGeometry(0.22, 9, 7), COAT, { at: [s * 0.27, 1.3, 0.55], scale: [0.8, 1.2, 1.1] });
  }

  // neck: long and arching
  const neckPath = catmull([
    [0, 1.45, 0.8],
    [0, 1.7, 1.05],
    [0, 2.0, 1.2],
    [0, 2.22, 1.34],
  ]);
  const neck = b.sweep(neckPath, [0.25, 0.12], {
    color: HEAD_C === HEAD_C ? COAT : COAT,
    sides: 10,
    caps: "round",
  });
  // neck underside cream stripe
  b.sweep(catmull([
    [0, 1.42, 0.98],
    [0, 1.66, 1.2],
    [0, 1.96, 1.33],
    [0, 2.16, 1.44],
  ]), [0.1, 0.05], { color: BELLY, sides: 6, caps: "round" });

  // ================= HEAD (dragon-ish horse) =================
  const HC: [number, number, number] = [0, 2.3, 1.5];
  const skull = b.part(new THREE.SphereGeometry(0.17, 12, 9), HEAD_C, { at: HC, scale: [0.9, 0.95, 1.05] });
  // muzzle
  const muzzle = b.loft(
    [
      { at: [0, 2.27, 1.55], w: 0.2, h: 0.17 },
      { at: [0, 2.2, 1.78], w: 0.17, h: 0.14 },
      { at: [0, 2.15, 1.94], w: 0.17, h: 0.13 },
    ],
    { color: HEAD_C, sides: 8, caps: "round" },
  );
  // lower jaw
  b.loft(
    [
      { at: [0, 2.15, 1.55], w: 0.16, h: 0.08 },
      { at: [0, 2.09, 1.78], w: 0.14, h: 0.07 },
      { at: [0, 2.07, 1.93], w: 0.14, h: 0.07 },
    ],
    { color: BELLY, sides: 8, caps: "round" },
  );
  // nostrils & nose pad
  for (const s of MIRROR) {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), INK, { at: [s * 0.06, 2.17, 2.02], scale: [1, 0.8, 0.6] });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), CORAL_C, { at: [s * 0.075, 2.18, 1.98] });
  }
  // brow ridges
  for (const s of MIRROR) {
    b.capsule([s * 0.05, 2.38, 1.6], [s * 0.15, 2.36, 1.5], 0.022, { color: GOLD_C, sides: 6 });
  }
  // teeth/fangs
  for (const s of MIRROR) {
    b.spike([s * 0.08, 2.1, 1.88], [0, -1, 0], 0.045, 0.012, { color: CREAM, sides: 5 });
  }
  // ears
  for (const s of MIRROR) {
    b.extrude(
      [
        [0, 0],
        [0.06, 0.02],
        [0.07, 0.12, "sharp"],
        [0.02, 0.2, "sharp"],
        [-0.03, 0.08],
      ],
      { at: [s * 0.13, 2.4, 1.38], x: [s, 0.3, 0], y: [0, 1, -0.3], thickness: 0.02, bevel: 0.004, color: HEAD_C },
    );
  }
  // eyes (decals)
  const EYE = animeEye({ iris: "#ffb02e", irisLight: "#fff08a" });
  const skin = b.surface(skull);
  for (const s of MIRROR) {
    const hit = skin.around(HC).at(s * 62, 4);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.07, 0.095], mirror: s > 0 });
  }
  // forehead gem
  glow(b.part(new THREE.OctahedronGeometry(0.035, 0), GEM, { at: [0, 2.43, 1.62], scale: [0.8, 1.3, 0.8] }), 1.6);
  b.part(new THREE.TorusGeometry(0.04, 0.008, 5, 8), GOLD_C, { at: [0, 2.43, 1.615], rotation: [0, 0, 0] });

  // whiskers: long flowing dragon moustache
  for (const s of MIRROR) {
    const wh = catmull([
      [s * 0.08, 2.18, 1.95],
      [s * 0.2, 2.22, 2.05],
      [s * 0.4, 2.12, 2.0],
      [s * 0.55, 1.9, 1.78],
      [s * 0.6, 1.66, 1.6],
    ]);
    b.sweep(wh, [0.012, 0.004], { color: GOLD_C, sides: 4, caps: "point" });
    const wh2 = catmull([
      [s * 0.07, 2.14, 1.93],
      [s * 0.18, 2.12, 2.04],
      [s * 0.34, 1.98, 2.02],
      [s * 0.44, 1.76, 1.88],
    ]);
    b.sweep(wh2, [0.01, 0.003], { color: LILAC_C, sides: 4, caps: "point" });
  }
  // beard (cloud tuft under chin)
  b.cards(
    [0, 1, 2, 3, 4].map((i) => frame([0, 2.05 - i * 0.012, 1.7 - i * 0.07], [0, -1, -0.3])),
    PUFF_W,
    { size: [0.1, 0.16], lean: 20, flow: [0, -0.5, -1], bend: 30, vary: 0.3, rng: R, color: "#ffffff" },
  );

  // ================= ANTLERS =================
  for (const s of MIRROR) {
    const base: [number, number, number] = [s * 0.07, 2.42, 1.42];
    const main = catmull([
      base,
      [s * 0.13, 2.62, 1.34],
      [s * 0.2, 2.86, 1.22],
      [s * 0.24, 3.1, 1.08],
      [s * 0.2, 3.3, 0.92],
    ]);
    const antler = b.sweep(main, [0.032, 0.012], { color: GOLD_C, sides: 6, caps: "round" });
    // tines
    const tines: Array<[number, number[][]]> = [
      [
        0.3,
        [
          [s * 0.15, 2.7, 1.3],
          [s * 0.3, 2.78, 1.4],
          [s * 0.4, 2.98, 1.46],
        ],
      ],
      [
        0.55,
        [
          [s * 0.19, 2.88, 1.22],
          [s * 0.34, 3.0, 1.1],
          [s * 0.46, 3.18, 1.04],
        ],
      ],
      [
        0.78,
        [
          [s * 0.23, 3.06, 1.1],
          [s * 0.32, 3.24, 1.2],
          [s * 0.36, 3.44, 1.22],
        ],
      ],
    ];
    for (const [, pts] of tines) {
      const tp = catmull(pts);
      b.sweep(tp, [0.022, 0.005], { color: GOLD_C, sides: 5, caps: "point" });
      const tip = tp.at(1);
      glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), GEM, { at: tip }), 1.5);
    }
    // swirl tip
    const tip2 = main.at(1);
    glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), GEM, { at: tip2 }), 1.5);
    // antler rings
    for (const t of [0.12, 0.3, 0.5, 0.7]) {
      b.part(new THREE.TorusGeometry(0.03 - t * 0.02, 0.006, 5, 8), "#fff0a0", {
        at: main.at(t),
        dir: main.tangentAt(t),
        axis: "z",
      });
    }
    // coral burr
    b.part(new THREE.SphereGeometry(0.04, 7, 5), CORAL_C, { at: base, scale: [1, 0.7, 1] });
    void antler;
  }

  // ================= CLOUD MANE =================
  // spine of the mane follows the neck's top
  const manePath = catmull([
    [0, 1.7, 0.2],
    [0, 1.78, 0.62],
    [0, 1.95, 0.98],
    [0, 2.2, 1.22],
    [0, 2.42, 1.36],
  ]);
  b.sweep(manePath, [0.04, 0.025], { color: GOLD_C, sides: 6, caps: "round" });
  const maneFrames = [];
  for (let i = 0; i < 26; i++) {
    const t = i / 25;
    const p = manePath.at(t);
    maneFrames.push(frame([p.x, p.y + 0.03, p.z], [0, 1, 0.3]));
  }
  b.cards(maneFrames, [PUFF_W, PUFF_L, PUFF_P, PUFF_W], {
    size: [0.2, 0.3],
    lean: 50,
    flow: (_f, i) => [0, -0.2 - (i % 3) * 0.1, -1],
    bend: 35,
    vary: 0.35,
    spin: 18,
    rng: R,
    cross: true,
  });
  // chunky cloud billows hanging beside the neck (spheres clusters)
  for (const s of MIRROR) {
    for (let i = 0; i < 6; i++) {
      const t = 0.1 + i * 0.15;
      const p = manePath.at(t);
      const r = 0.1 + 0.05 * Math.sin(i * 1.7) + 0.02;
      b.part(new THREE.IcosahedronGeometry(r, 1), i % 2 ? CLOUD_C : LILAC_C, {
        at: [p.x + s * (0.2 + 0.03 * (i % 2)), p.y - 0.02 - 0.03 * i, p.z - 0.04],
        scale: [1, 0.85, 1.1],
      });
    }
  }
  // trailing mane streamers
  for (const s of MIRROR) {
    const st = catmull([
      [s * 0.15, 1.92, 0.9],
      [s * 0.3, 1.9, 0.5],
      [s * 0.42, 1.76, 0.1],
      [s * 0.5, 1.5, -0.2],
    ]);
    b.sweep(st, [0.05, 0.01], { color: CLOUD_C, sides: 6, caps: "point" });
    const st2 = catmull([
      [s * 0.12, 2.1, 1.1],
      [s * 0.3, 2.0, 0.8],
      [s * 0.44, 1.84, 0.5],
      [s * 0.5, 1.7, 0.3],
    ]);
    b.sweep(st2, [0.035, 0.008], { color: LILAC_C, sides: 6, caps: "point" });
  }

  // ================= LEGS =================
  // legs: [x sign, front?]
  const legs: Array<{ s: number; front: boolean }> = [
    { s: 1, front: true },
    { s: -1, front: true },
    { s: 1, front: false },
    { s: -1, front: false },
  ];
  for (const { s, front } of legs) {
    const x = s * (front ? 0.26 : 0.27);
    const zTop = front ? 0.72 : -0.78;
    const upper = front
      ? ([
          [x, 1.2, zTop],
          [x, 0.82, zTop + 0.05],
        ] as number[][])
      : ([
          [x, 1.15, zTop],
          [x, 0.82, zTop - 0.14],
        ] as number[][]);
    // thigh/upper
    b.capsule(upper[0], upper[1], front ? [0.14, 0.085] : [0.19, 0.095], { color: COAT, sides: 8 });
    // knee / hock
    const knee = upper[1];
    b.part(new THREE.SphereGeometry(front ? 0.09 : 0.1, 8, 6), COAT, { at: knee });
    // cannon
    const cannonEnd: number[] = front ? [x, 0.2, zTop + 0.04] : [x, 0.2, zTop + 0.02];
    b.capsule(knee, cannonEnd, [0.065, 0.05], { color: COAT, sides: 8 });
    // gold anklet
    b.part(new THREE.TorusGeometry(0.058, 0.014, 5, 10), GOLD_C, {
      at: [cannonEnd[0], 0.2, cannonEnd[2]],
      rotation: [90, 0, 0],
    });
    // fetlock cloud tuft
    b.part(new THREE.IcosahedronGeometry(0.07, 1), CLOUD_C, {
      at: [cannonEnd[0], 0.16, cannonEnd[2] - 0.03],
      scale: [1, 1.1, 1.3],
    });
    b.cards(
      [0, 1, 2, 3].map((i) =>
        frame([cannonEnd[0] + (i - 1.5) * 0.02, 0.2, cannonEnd[2] - 0.05], [0, 0.6, -1]),
      ),
      PUFF_W,
      { size: [0.09, 0.14], lean: 40, flow: [0, -1, -0.4], bend: 20, vary: 0.2, rng: R },
    );
    // cloven hooves
    b.capsule([x, 0.12, cannonEnd[2]], [x, 0.05, cannonEnd[2] + 0.02], [0.05, 0.05], { color: COAT, sides: 8 });
    for (const h of MIRROR) {
      b.frustumBox(
        [x + h * 0.027, 0.06, cannonEnd[2] + 0.005],
        [x + h * 0.027, 0.0, cannonEnd[2] + 0.03],
        [0.046, 0.1],
        [0.05, 0.12],
        { color: HOOF_C },
      );
      b.frustumBox(
        [x + h * 0.027, 0.013, cannonEnd[2] + 0.005],
        [x + h * 0.027, 0.0, cannonEnd[2] + 0.03],
        [0.054, 0.1],
        [0.054, 0.125],
        { color: GOLD_C },
      );
    }
  }

  // ================= TAIL =================
  const tailPath = catmull([
    [0, 1.32, -1.3],
    [0, 1.5, -1.62],
    [0, 1.62, -1.98],
    [0, 1.46, -2.28],
    [0, 1.22, -2.4],
  ]);
  b.sweep(tailPath, [0.09, 0.04], { color: COAT, sides: 8, caps: "round" });
  const tailTip = tailPath.at(1);
  // flame curls
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const f = catmull([
      [0, tailTip.y, tailTip.z],
      [Math.cos(a) * 0.14, tailTip.y + 0.12 + Math.sin(a) * 0.12, tailTip.z - 0.12],
      [Math.cos(a) * 0.3, tailTip.y + 0.16 + Math.sin(a) * 0.2, tailTip.z - 0.32],
      [Math.cos(a) * 0.36, tailTip.y - 0.1 + Math.sin(a) * 0.2, tailTip.z - 0.5],
    ]);
    b.sweep(f, [0.05, 0.006], { color: i % 2 ? CORAL_C : LILAC_C, sides: 5, caps: "point" });
  }
  b.cards(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
      const a = (i / 10) * Math.PI * 2;
      return frame([Math.cos(a) * 0.08, tailTip.y + Math.sin(a) * 0.08, tailTip.z - 0.02], [Math.cos(a) * 0.5, Math.sin(a) * 0.5 + 0.2, -1]);
    }),
    flameTex,
    { size: [0.16, 0.32], lean: 10, flow: [0, 0.2, -1], bend: 40, vary: 0.3, rng: R, cross: true },
  );
  // tail base cloud ruff
  b.cards(
    [0, 1, 2, 3, 4, 5].map((i) => {
      const t = i / 5;
      const p = tailPath.at(0.1 + t * 0.6);
      return frame([p.x, p.y + 0.06, p.z], [0, 1, -0.2]);
    }),
    [PUFF_W, PUFF_L],
    { size: [0.14, 0.22], lean: 55, flow: [0, -0.2, -1], bend: 30, vary: 0.3, rng: R, cross: true },
  );

  // ================= BODY DETAIL =================
  // gold saddle-sash draped over the barrel
  const sashLoop = b.surface(torso).loop(frame([0, 1.4, 0.05], [0, 0, 1]), { lift: 0.012 });
  b.sweep(sashLoop, [0.03, 0.03], { color: GOLD_C, sides: 4, section: "box" });
  b.sweep(sashLoop, [0.012, 0.012], { color: CORAL_C, sides: 4, caps: "none", shift: [0, 0.03] });
  // hanging tassels from sash
  for (const s of MIRROR) {
    const tp = sashLoop.at(s > 0 ? 0.25 : 0.75);
    const tassel = catmull([
      [tp.x + s * 0.02, tp.y, tp.z],
      [tp.x + s * 0.04, tp.y - 0.15, tp.z - 0.03],
      [tp.x + s * 0.045, tp.y - 0.3, tp.z - 0.06],
    ]);
    b.sweep(tassel, [0.012, 0.01], { color: CORAL_C, sides: 5 });
    b.spike(tassel.at(1), [0, -1, 0], 0.12, 0.025, { color: CORAL_C, sides: 6 });
    b.part(new THREE.SphereGeometry(0.025, 6, 5), GOLD_C, { at: tassel.at(0.9) });
  }

  // chest medallion
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    at: [0, 1.36, 1.1],
    dir: [0, -0.1, 1],
    axis: "z",
    texture: medallion,
  });
  // collar of gold ring around neck base
  const collar = b.surface(neck).loop(frame([0, 1.62, 1.0], [0, 0.5, 0.5]), { lift: 0.01 });
  b.sweep(collar, [0.02, 0.02], { color: GOLD_C, sides: 6 });
  b.sweep(collar, [0.012, 0.012], { color: LILAC_C, sides: 5, shift: [0, 0.03] });

  // flank swirl emblems (gold cloud-spiral decals)
  for (const s of MIRROR) {
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
      at: [s * 0.545, 1.28, -0.62],
      dir: [s, 0, 0],
      axis: "z",
      texture: swirlTex,
    });
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      at: [s * 0.56, 1.34, 0.12],
      dir: [s, 0, 0],
      axis: "z",
      texture: swirlTex,
    });
  }
  // gold scale-cards along the back (dorsal ridge of leaf-like scales)
  b.along(polyline([[0, 1.72, -1.0], [0, 1.74, -0.3], [0, 1.78, 0.3], [0, 1.82, 0.7]]), 12, (at) => {
    b.spike(at.moved([0, 0, 0]), [0, 1, 0.2], 0.07, 0.022, { color: GOLD_C, sides: 4 });
  });
  // chest ridge scale studs
  const hits = b.surface(torso).scatter(120, { rng: rng(5), minDist: 0.09, filter: (h) => h.n.y > 0.3 });
  for (const h of hits) {
    b.stick(new THREE.ConeGeometry(0.018, 0.04, 4), GOLD_C, h);
  }

  // haunch and shoulder cloud-puff accents
  for (const s of MIRROR) {
    for (const [z, y] of [[-0.72, 1.45], [0.55, 1.5]] as const) {
      b.cards(
        [0, 1, 2].map((i) => frame([s * (0.34 + i * 0.02), y - i * 0.07, z + i * 0.05], [s, 0.2, 0])),
        PUFF_L,
        { size: [0.12, 0.16], lean: 30, flow: [0, -0.5, -1], bend: 25, vary: 0.2, rng: R },
      );
    }
  }

  // jade mottling accent on rump for color variety
  b.part(new THREE.SphereGeometry(0.05, 6, 4), mottle(JADE, "#7af0c8", { size: 0.1, seed: 3 }), { at: [0, 1.6, -1.0] });
  void COAT_SCALE;
  void gradient;
  void inkLines;
  void noise;
  void paint;
  void bezier;
  void sash;

  return b.root;
}
