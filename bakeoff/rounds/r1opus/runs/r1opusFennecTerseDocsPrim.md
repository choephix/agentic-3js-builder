```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  frame,
  countershade,
  mottle,
  paint,
  gradient,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Fennec Fox",
  description:
    "A stylized low-poly fennec fox: sandy mottled coat with a pale belly, giant pink-lined ears with white tufts, big glossy eyes, tear streaks, whiskers, and a bushy fur-card tail with a black tip. Rigged quadruped in a neutral rest pose.",
};

const SAND = "#e2b47a";
const SAND2 = "#d39b5b";
const RUST = "#c4844a";
const CREAM = "#f7ecd6";
const WHITE = "#fffaf0";
const PINK = "#e79c94";
const PINKL = "#f4d0c2";
const DARK = "#24170f";
const BROWN = "#6e4224";
const NOSE = "#1b1310";

export default function build() {
  const b = createBuilder({ name: "fennecFox" });

  // ---------- paints & textures ----------
  const coat = countershade(mottle(SAND, SAND2, { size: 0.04, seed: 3 }), CREAM, { level: -0.15 });
  const backCoat = paint((_p, n) => (n.y > 0.82 ? RUST : coat));
  const legPaint = gradient(coat, CREAM, [0, 0.12, 0], [0, 0.03, 0]);

  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C5 50 3 28 9 2 C13 20 15 22 16 8 C18 22 20 20 23 2 C29 28 27 50 16 64 Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#1a110b"/>
      <circle cx="32" cy="33" r="25" fill="#5a3418"/>
      <circle cx="32" cy="34" r="19" fill="#3a200e"/>
      <circle cx="32" cy="34" r="13" fill="#080504"/>
      <circle cx="41" cy="22" r="7.5" fill="#ffffff"/>
      <circle cx="23" cy="44" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- skeleton ----------
  const pelvis = b.joint("pelvis", { at: [0, 0.17, -0.1], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.172, -0.05],
      [0, 0.176, 0.02],
      [0, 0.185, 0.09],
    ]),
    { parent: pelvis, count: 2, names: ["spine1", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.185, 0.09],
      [0, 0.22, 0.132],
      [0, 0.25, 0.16],
    ]),
    { parent: chest, count: 1, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.252, 0.165], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.022, down: 0.022 }),
    aim: head.local({ forward: 0.085, down: 0.028 }),
    role: "jaw",
  });

  const tailPath = catmull([
    [0, 0.168, -0.14],
    [0, 0.15, -0.23],
    [0, 0.115, -0.32],
    [0, 0.1, -0.41],
  ]);
  const tail = b.chain("tail", tailPath, { parent: pelvis, count: 4, role: "tail" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.168, -0.155], w: 0.07, h: 0.07 },
      { at: [0, 0.172, -0.1], w: 0.105, h: 0.1 },
      { at: [0, 0.174, -0.02], w: 0.095, h: 0.095 },
      { at: [0, 0.181, 0.055], w: 0.1, h: 0.112 },
      { at: [0, 0.19, 0.1], w: 0.072, h: 0.08 },
    ],
    { bone: [pelvis, spine], color: backCoat },
  );
  const neckTube = b.sweep(neck, [0.042, 0.033], { color: coat });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fx = s * 0.042;
    const front = b.chain(
      `front${S}`,
      polyline([
        [s * 0.04, 0.16, 0.06],
        [fx, 0.098, 0.048],
        [fx, 0.032, 0.062],
        [fx, 0.014, 0.082],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "leg", contact: [fx, 0, 0.085] },
    );
    b.sweep(front, [0.022, 0.015, 0.011, 0.011], { color: legPaint });
    b.part(new THREE.SphereGeometry(0.017, 8, 6), CREAM, {
      bone: front.tip!,
      at: [fx, 0.0095, 0.082],
      scale: [0.95, 0.56, 1.35],
      flat: true,
    });

    const hx = s * 0.046;
    const hind = b.chain(
      `hind${S}`,
      polyline([
        [hx, 0.165, -0.105],
        [hx, 0.098, -0.062],
        [hx, 0.048, -0.128],
        [hx, 0.014, -0.108],
      ]),
      { parent: pelvis, names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`], role: "leg", contact: [hx, 0, -0.1] },
    );
    b.sweep(hind, [0.034, 0.02, 0.012, 0.011], { color: legPaint });
    b.part(new THREE.SphereGeometry(0.017, 8, 6), CREAM, {
      bone: hind.tip!,
      at: [hx, 0.0095, -0.1],
      scale: [0.95, 0.56, 1.35],
      flat: true,
    });
  }

  // ---------- tail ----------
  const tipT = 0.8;
  const tailTube = b.sweep(tail, [0.018, 0.03, 0.04, 0.043, 0.038, 0.024], {
    color: coat,
    bands: [
      [tipT, coat],
      [1, DARK],
    ],
    sectors: [[-35, 35, BROWN, 0.12, 0.26]],
  });
  const tipZ = tailPath.at(tipT).z;
  const tailCardPaint = paint((p) => (p.z < tipZ ? DARK : coat));
  b.cards(b.surface(tailTube).scatter(110, { rng: rng(5), minDist: 0.011 }), tuft, {
    size: [0.022, 0.05],
    lean: 55,
    bend: 25,
    vary: 0.3,
    rng: rng(6),
    color: tailCardPaint,
    flow: [0, -0.2, -1],
  });

  // ---------- head ----------
  const hy = head.at.y;
  const hz = head.at.z;
  const facePaint = paint((p, n) => {
    if (n.y < -0.3 || (p.y < hy - 0.01 && n.z > 0.2)) return CREAM;
    if (n.y > 0.6) return RUST;
    return SAND;
  });
  const skull = b.part(new THREE.SphereGeometry(0.048, 12, 9), facePaint, {
    bone: head,
    at: head.at,
    scale: [1.1, 0.92, 1],
    flat: true,
  });
  const snoutPaint = paint((_p, n) => (n.y > 0.5 ? SAND : CREAM));
  const snout = b.capsule(head.local({ forward: 0.02, down: 0.006 }), head.local({ forward: 0.088, down: 0.012 }), [0.027, 0.01], {
    bone: head,
    color: snoutPaint,
  });
  b.part(new THREE.SphereGeometry(0.0095, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.098, down: 0.009 }),
    scale: [1.2, 0.85, 1],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.0025, 6, 4), WHITE, {
    bone: head,
    at: head.local({ forward: 0.105, down: 0.005, left: 0.003 }),
  });
  b.capsule(jaw.at, jaw.local([0, 0.056, 0]), [0.017, 0.0065], { bone: jaw, color: CREAM });

  const faceSurf = b.surface([skull, snout]);
  for (const s of [1, -1]) {
    // eyes
    b.decal(skull, eyeTex, {
      at: head.local({ left: s * 0.031, up: 0.012, forward: 0.035 }),
      dir: [s * 0.6, 0.12, 1],
      size: [0.034, 0.034],
      mirror: s > 0,
    });
    // tear streaks
    const streak = faceSurf.drape(
      catmull([
        head.local({ left: s * 0.024, up: 0.0, forward: 0.044 }),
        head.local({ left: s * 0.022, down: 0.007, forward: 0.058 }),
        head.local({ left: s * 0.019, down: 0.013, forward: 0.072 }),
      ]),
      { lift: 0.0015 },
    );
    b.sweep(streak, [0.0028, 0.0014], { color: BROWN, bone: head });
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.spike(
        head.local({ left: s * 0.013, forward: 0.072, down: 0.006 + i * 0.004 }),
        head.local({ left: s * 0.078, forward: 0.08 - i * 0.008, down: -0.008 + i * 0.014 }),
        null,
        0.0011,
        { bone: head, color: DARK },
      );
    }
    // brow whiskers
    b.spike(
      head.local({ left: s * 0.03, up: 0.03, forward: 0.03 }),
      head.local({ left: s * 0.056, up: 0.062, forward: 0.05 }),
      null,
      0.0009,
      { bone: head, color: DARK },
    );
  }

  // ---------- ears ----------
  const earOutline: OutlinePoint[] = [
    [-0.03, 0],
    [0.032, 0],
    [0.026, 0.05],
    [0.006, 0.118, "sharp"],
    [-0.018, 0.065],
  ];
  const innerOutline: OutlinePoint[] = [
    [-0.019, 0.012],
    [0.022, 0.012],
    [0.018, 0.05],
    [0.005, 0.1, "sharp"],
    [-0.011, 0.058],
  ];
  const earPaint = paint((_p, _n, s) => (s[1] > 0.096 ? BROWN : s[1] > 0.08 ? RUST : SAND));
  const innerPaint = paint((_p, _n, s) => (s[1] < 0.035 ? PINKL : PINK));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const earBase = head.local({ left: s * 0.028, up: 0.03, back: 0.012 });
    const a: [number, number, number] = [s * 0.42, 1, -0.12];
    const x: [number, number, number] = [s, -0.42, 0];
    const aN = new THREE.Vector3(...a).normalize();
    const xN = new THREE.Vector3(...x).normalize();
    const front = new THREE.Vector3(...x).cross(new THREE.Vector3(...a)).normalize();
    if (front.z < 0) front.negate();

    const earJ = b.joint(`ear${S}`, { parent: head, at: earBase, dir: a });
    b.extrude(earOutline, {
      at: earBase,
      x,
      y: a,
      thickness: 0.007,
      bevel: 0.002,
      smoothing: 1,
      color: earPaint,
      bone: earJ,
    });
    b.extrude(innerOutline, {
      at: earBase.clone().addScaledVector(front, 0.0045),
      x,
      y: a,
      thickness: 0.003,
      smoothing: 1,
      color: innerPaint,
      bone: earJ,
    });
    const hairDir = aN.clone().addScaledVector(front, 0.3).normalize();
    const hairFrames = [-0.012, -0.004, 0.004, 0.012].map((k) =>
      frame(
        earBase
          .clone()
          .addScaledVector(front, 0.007)
          .addScaledVector(aN, 0.012)
          .addScaledVector(xN, s * k),
        hairDir,
      ),
    );
    b.cards(hairFrames, tuft, {
      size: [0.014, 0.04],
      lean: 10,
      flow: [front.x, front.y, front.z],
      bone: earJ,
      color: WHITE,
      cross: true,
    });
  }

  // ---------- fur ----------
  // cheek ruffs
  const cheekHits = b.surface(skull).scatter(26, {
    rng: rng(12),
    minDist: 0.007,
    filter: (h) => Math.abs(h.n.x) > 0.6 && h.n.y < 0.15 && h.at.z < hz + 0.02,
  });
  b.cards(cheekHits, tuft, { size: [0.016, 0.03], lean: 50, bend: 15, vary: 0.25, rng: rng(13), color: WHITE, flow: [0, -0.5, -1] });

  // chest bib
  const bibHits = b.surface([body, neckTube]).scatter(40, {
    rng: rng(14),
    minDist: 0.008,
    filter: (h) => h.n.z > 0.45 && h.n.y < 0.35,
  });
  b.cards(bibHits, tuft, { size: [0.018, 0.035], lean: 55, bend: 15, vary: 0.3, rng: rng(15), color: CREAM, flow: [0, -1, 0.3] });

  // body coat
  const coatHits = b.surface(body).scatter(150, {
    rng: rng(8),
    minDist: 0.014,
    filter: (h) => h.n.y > -0.5,
  });
  b.cards(coatHits, tuft, { size: [0.016, 0.032], lean: 72, bend: 15, vary: 0.3, rng: rng(9), color: backCoat });

  return b.root;
}
```