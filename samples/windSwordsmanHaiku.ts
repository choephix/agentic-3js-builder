import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { catmull, polyline, spiral } from "../src/path";
import { limb } from "../src/ik";
import { frame } from "../src/frame";
import { paint } from "../src/paint";
import { rng } from "../src/math";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Wind Swordsman",
  description:
    "A wandering swordsman in a streaming jade coat with gold filigree, a drawn jian wrapped in a wind spiral, and a scarf and ponytail caught in the breeze.",
  style: "Genshin Impact",
  commit: "b816db2",
};

type V = [number, number, number];
const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a: V, b: V): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const toV = (p: THREE.Vector3 | readonly number[]): V =>
  p instanceof THREE.Vector3 ? [p.x, p.y, p.z] : [p[0], p[1], p[2]];

// ---- palette: two-tone cel colours, shadows hue-shifted by the kit
const SKIN = cel("#ffe3cf", "#f2b5a2");
const HAIR = cel("#3a5cae", "#23387c");
const JADE = cel("#43e3bb", "#1f9c9b");
const CREAM = cel("#fff8ec", "#f1c6b4");
const GOLD = cel("#ffd96a", "#d8912f");
const HAKAMA = cel("#4f73dd", "#2b40a0");
const BOOT = cel("#2c3b6b", "#18224c");
const BLADE = cel("#f5fcff", "#9cc3ea");
const GRIP = cel("#1f4f78", "#102a45");
const WIND = "#c9fff4";
const IRIS = "#55ecc9";

// ---- drawings
const FILIGREE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#ffe27a" stroke-width="3.4" stroke-linecap="round">
    <path d="M4 58 C4 30 26 24 30 40 C34 54 52 50 52 30"/>
    <path d="M52 30 C52 14 40 8 34 14 C28 20 36 28 42 22"/>
    <circle cx="14" cy="16" r="7"/>
    <path d="M14 9 C22 4 28 12 22 18"/>
    <path d="M4 30 C10 40 16 44 22 38"/>
    <path d="M30 40 C26 46 22 50 16 50"/>
  </g></svg>`,
  { size: 256 },
);
const LEAF = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 2 C44 18 46 44 24 62 C2 44 4 18 24 2 Z" fill="#d6fff5"/>
  <path d="M24 8 L24 56" stroke="#3ee6c4" stroke-width="2.5" fill="none"/>
  <path d="M24 22 L36 30 M24 36 L12 44" stroke="#3ee6c4" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const STRAND = svg(
  `<svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 46 C2 28 8 12 12 2 C16 12 22 28 20 46 Z" fill="#3a5cae"/>
  <path d="M12 8 C11 18 12 30 12 42" stroke="#9cc0ff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const MOUTH = svg(
  `<svg viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 4 Q20 15 36 4" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="16" cy="10" rx="13" ry="7.5" fill="#ff8fb4" fill-opacity="0.8"/></svg>`,
  { size: 64 },
);

// ---- outlines
const GUARD: OutlinePoint[] = [
  [-0.11, -0.007],
  [0.11, -0.007],
  [0.125, 0],
  [0.11, 0.007],
  [-0.11, 0.007],
  [-0.125, 0],
];
const BLADE_OUT: OutlinePoint[] = [
  [-0.02, 0],
  [0.02, 0],
  [0.02, 0.74],
  [0, 0.86, "sharp"],
  [-0.02, 0.74],
];

// ---- paints
const FRONT_EDGE = 0.35; // coat faces this far round from the front (n.z) to count as the open front
const torsoPaint = paint((p, n) => {
  const t = Math.min(1, Math.max(0, (p.y - 1.0) / 0.32));
  const hw = 0.03 + 0.12 * t;
  if (n.z > FRONT_EDGE && Math.abs(p.x) < hw) return CREAM;
  if (n.z > FRONT_EDGE && Math.abs(p.x) < hw + 0.012) return GOLD;
  return JADE;
});
const skirtPaint = furEdge(JADE, HAKAMA, {
  by: "position",
  axis: [0, 1, 0],
  level: 0.7,
  teeth: 0.05,
  period: 0.07,
  along: [1, 0, 0],
  ink: INK,
  inkWidth: 0.004,
});
const SCARF = paint((_p, _n, s) => (Math.floor(s[0] * 6) % 2 === 0 ? CREAM : JADE));

export default function build() {
  const b = createBuilder({ name: "windSwordsman" });
  const HEAD_C: V = [0, 1.565, 0];
  const EYE = animeEye({ iris: IRIS });

  // ---- skeleton: hips, spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.95, 0], [0, 1.13, 0.004], [0, 1.36, 0]]), {
    parent: hips,
    names: ["lowerSpine", "upperSpine", "neckBase"],
    role: "spine",
  });
  const neckBase = spine.tip!;
  const neck = b.chain("neck", polyline([[0, 1.34, 0], [0, 1.5, 0.012]]), {
    parent: neckBase,
    names: ["neck"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[0], at: HEAD_C, dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.5, 0.03], aim: [0, 1.42, 0.07], role: "jaw" });
  const ball = (at: V, r: number, color: typeof GOLD, bone: typeof hips) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), color, { bone, at, scale: [r, r, r] });

  // ---- torso: fitted jade coat with a cream open front and gold lapel edge
  const torso = b.loft(
    [
      { at: [0, 1.0, 0], w: 0.3, h: 0.19 },
      { at: [0, 1.13, 0.004], w: 0.35, h: 0.21 },
      { at: [0, 1.28, 0], w: 0.38, h: 0.19 },
      { at: [0, 1.36, 0], w: 0.36, h: 0.16 },
      { at: [0, 1.44, 0], w: 0.16, h: 0.14 },
    ],
    { bone: spine, color: torsoPaint },
  );
  const torsoSurf = b.surface(torso);

  // long coat skirt, hemmed with a zig-zag edge over the hakama
  const skirt = b.loft(
    [
      { at: [0, 1.04, 0], w: 0.31, h: 0.2 },
      { at: [0, 0.9, 0], w: 0.38, h: 0.26 },
      { at: [0, 0.76, 0.01], w: 0.44, h: 0.3 },
      { at: [0, 0.6, 0.03], w: 0.48, h: 0.32 },
    ],
    { bone: spine, color: skirtPaint, caps: { start: "none", end: "flat" } },
  );
  const skirtSurf = b.surface(skirt);

  // gold-trimmed cream sash with hanging tails at the back
  const obi = torsoSurf.loop([0, 1.05, 0], { dir: [0, 1, 0], lift: 0.007 });
  b.sweep(obi, () => [0.024, 0.012] as [number, number], { section: "box", color: CREAM });
  const obiTrim = torsoSurf.loop([0, 1.068, 0], { dir: [0, 1, 0], lift: 0.007 });
  b.sweep(obiTrim, () => [0.026, 0.005] as [number, number], { section: "box", color: GOLD });
  b.membrane(
    catmull([
      [0.03, 1.03, -0.21],
      [0.04, 0.86, -0.25],
      [0.05, 0.7, -0.3],
    ]),
    catmull([
      [-0.01, 1.03, -0.21],
      [0.0, 0.86, -0.25],
      [0.0, 0.7, -0.3],
    ]),
    { color: CREAM, thickness: 0.005, bone: spine.joints[0] },
  );
  // jade coat tail flaring out behind the right hip, its hem trimmed in gold
  const flapA = catmull([
    [-0.02, 1.0, -0.16],
    [-0.08, 0.84, -0.28],
    [-0.14, 0.7, -0.36],
  ]);
  const flapB = catmull([
    [-0.12, 1.0, -0.16],
    [-0.16, 0.84, -0.27],
    [-0.22, 0.7, -0.34],
  ]);
  b.membrane(flapA, flapB, { color: JADE, thickness: 0.006, bone: spine.joints[0] });
  b.sweep(flapB, 0.0045, { color: GOLD, bone: spine.joints[0] });
  for (const s of [1, -1]) {
    const cord = catmull([
      [s * 0.165, 1.03, 0.1],
      [s * 0.17, 0.95, 0.12],
      [s * 0.178, 0.86, 0.13],
    ]);
    b.sweep(cord, [0.008, 0.005], { color: JADE, bone: spine.joints[0] });
    ball([s * 0.178, 0.84, 0.13], 0.012, GOLD, spine.joints[0]);
  }

  // ---- legs, boots, arms, hands, and the drawn sword
  const D = norm([0.22, 0.72, 0.66]); // blade direction, up and forward
  const Wd = norm(add([1, 0, 0], D, -dot([1, 0, 0], D))); // across the blade's flat
  const Td = cross(Wd, D); // blade face normal
  const rad = (deg: number): V => {
    const c = Math.cos((deg * Math.PI) / 180);
    const sn = Math.sin((deg * Math.PI) / 180);
    return [Wd[0] * c + Td[0] * sn, Wd[1] * c + Td[1] * sn, Wd[2] * c + Td[2] * sn];
  };
  const finger = (name: string, p0: V, p1: V, p2: V, hand: typeof hips, S: string) => {
    const f = b.chain(`${name}${S}`, [p0, p1, p2], {
      parent: hand,
      names: [`${name}${S}1`, `${name}${S}2`],
      role: "digit",
    });
    b.sweep(f, [0.0095, 0.0068], { color: SKIN });
  };

  for (const [s, S] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // hakama legs with a wide flared hem over the boots
    const hipP: V = [s * 0.1, 0.93, 0];
    const ankleP: V = [s * 0.11, 0.085, s > 0 ? 0.05 : -0.03];
    const leg = b.chain(`leg${S}`, limb(hipP, ankleP, [0.46, 0.42], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.098, 0.076, 0.06, 0.07], { color: HAKAMA });
    const z0 = ankleP[2];
    b.sweep(
      catmull([
        [s * 0.11, 0.13, z0],
        [s * 0.11, 0.07, z0 + 0.08],
        [s * 0.115, 0.04, z0 + 0.2],
      ]),
      [0.06, 0.04],
      { color: BOOT, bands: [[0.12, GOLD], [1, BOOT]], bone: leg.tip! },
    );

    // jade sleeves with gold and cream cuffs
    const shP: V = [s * 0.2, 1.34, 0];
    const wrP: V = s > 0 ? [0.31, 0.93, 0.12] : [-0.3, 1.03, 0.3];
    const armPts = limb(shP, wrP, [0.3, 0.27], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, armPts, {
      parent: neckBase,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.08, 0.07, 0.06, 0.072], {
      color: JADE,
      bands: [
        [0.9, JADE],
        [0.95, GOLD],
        [1, CREAM],
      ],
    });
    const hand = arm.tip!;
    const el = toV(armPts[1]);
    const wr = toV(armPts[2]);

    if (s > 0) {
      // relaxed open hand, fingers hanging forward
      const F = norm(add(wr, el, -1));
      b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
        bone: hand,
        at: add(wr, F, 0.045),
        dir: F,
        scale: [0.04, 0.07, 0.022],
      });
      const fingers: [string, number][] = [
        ["thumb", 0.026],
        ["index", 0.012],
        ["middle", 0],
        ["ring", -0.011],
        ["pinky", -0.021],
      ];
      for (const [name, o] of fingers) {
        const p0 = add(add(wr, F, 0.03), [o, 0, 0]);
        const p1 = add(add(p0, F, 0.04), [0, -0.012, 0]);
        const p2 = add(add(p1, F, 0.035), [0, -0.02, 0]);
        finger(name, p0, p1, p2, hand, S);
      }
    } else {
      // sword hand: palm on the grip, fingers wrapped round it
      const G = add(wr, D, 0.03);
      b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: hand, at: G, dir: D, scale: [0.045, 0.045, 0.04] });
      const grips: [string, number][] = [
        ["index", 62],
        ["middle", 36],
        ["ring", 12],
        ["pinky", -10],
        ["thumb", 205],
      ];
      for (const [name, deg] of grips) {
        const r = rad(deg);
        finger(name, add(add(G, D, -0.035), r, 0.022), add(G, r, 0.024), add(add(G, D, 0.035), r, 0.024), hand, S);
      }

      // grip with cream wraps
      b.sweep([add(G, D, -0.1), add(G, D, 0.08)], 0.0145, {
        bone: hand,
        color: GRIP,
        bands: [
          [0.14, CREAM],
          [0.22, GRIP],
          [0.3, CREAM],
          [0.38, GRIP],
          [0.46, CREAM],
          [0.54, GRIP],
          [0.62, CREAM],
          [0.7, GRIP],
          [0.78, CREAM],
          [0.86, GRIP],
          [0.94, CREAM],
          [1, GRIP],
        ],
      });
      const pom = add(G, D, -0.12);
      ball(pom, 0.021, GOLD, hand);
      b.extrude(GUARD, { at: add(G, D, 0.11), x: Wd, y: Td, thickness: 0.016, bevel: 0.003, color: GOLD, bone: hand });
      b.extrude(BLADE_OUT, { at: add(G, D, 0.12), x: Wd, y: D, thickness: 0.007, bevel: 0.002, color: BLADE, bone: hand });
      b.sweep(
        catmull([pom, add(add(pom, D, -0.05), [0, -0.06, 0]), add(add(pom, D, -0.09), [0, -0.14, 0])]),
        [0.009, 0.005],
        { color: JADE, bone: hand },
      );
      ball(add(add(pom, D, -0.09), [0, -0.15, 0]), 0.012, GOLD, hand);
      // a wind spiral coils up the blade
      const swirl = spiral(add(G, D, 0.2), add(add(G, D, 0.2), Wd, 0.05), D, { turns: 2.6, r1: 0.014, pitch: 0.2 });
      glow(b.sweep(swirl, [0.008, 0.003], { bone: hand, color: WIND }), 1.6);
    }
  }

  // ---- head: hair-capped skull, anime eyes, blush, mouth and chin
  const headPart = b.part(new THREE.SphereGeometry(1, 20, 14), SKIN, {
    bone: head,
    at: HEAD_C,
    scale: [0.122, 0.142, 0.118],
  });
  // hair shell over the crown, back and sides, open at the front for the face
  b.part(new THREE.SphereGeometry(1, 20, 12, Math.PI / 2 + 1.0, 2 * Math.PI - 2.0, 0, 1.85), HAIR, {
    bone: head,
    at: HEAD_C,
    scale: [0.13, 0.15, 0.126],
  });
  // fringe: two rows of strand cards swept down over the forehead
  const fringe: V[] = [];
  for (let i = -3; i <= 3; i++) fringe.push([i * 0.032, 1.718 - 0.012 * Math.abs(i), 0.062 + 0.004 * Math.abs(i)]);
  for (let i = -3; i <= 2; i++) fringe.push([i * 0.032 + 0.016, 1.7 - 0.01 * Math.abs(i + 0.5), 0.078]);
  b.cards(
    fringe.map((p) => frame(p, [0, 0.45, 1])),
    STRAND,
    { size: [0.05, 0.068], lean: 90, flow: [0, -1, 0.25], vary: 0.2, rng: rng(5), spin: 10, bone: head },
  );

  const skin = b.surface(headPart);
  for (const s of [1, -1]) {
    const eye = skin.around(HEAD_C).at(s * 28, 6);
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.045, 0.062], mirror: s > 0 });
    const cheek = skin.around(HEAD_C).at(s * 52, -6);
    if (cheek) b.decal(skin, BLUSH, { at: cheek, size: [0.032, 0.02] });
  }
  const mouth = skin.around(HEAD_C).at(0, -20);
  if (mouth) b.decal(skin, MOUTH, { at: mouth, size: [0.03, 0.012] });
  b.part(new THREE.SphereGeometry(1, 6, 4), SKIN, {
    bone: head,
    at: [0, 1.54, 0.116],
    scale: [0.011, 0.012, 0.01],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    bone: jaw,
    at: [0, 1.452, 0.06],
    scale: [0.042, 0.03, 0.036],
  });

  // long ponytail, tied high and drooping, its tip lifting in the breeze
  const tail = b.chain(
    "ponytail",
    catmull([
      [0, 1.61, -0.1],
      [0.03, 1.52, -0.23],
      [0.1, 1.42, -0.35],
      [0.17, 1.32, -0.4],
      [0.22, 1.27, -0.38],
    ]),
    { parent: head, count: 4 },
  );
  b.sweep(tail, [0.04, 0.03, 0.02, 0.008], { color: HAIR });
  b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 12), GOLD, {
    bone: head,
    at: [0, 1.6, -0.125],
    dir: [0, -0.5, -0.87],
    axis: "z",
  });

  // ---- scarf: a cream and jade banner streaming down behind the left shoulder
  const sc: V[] = [
    [0.12, 1.4, -0.07],
    [0.22, 1.34, -0.2],
    [0.3, 1.24, -0.4],
    [0.34, 1.14, -0.6],
    [0.3, 1.04, -0.78],
    [0.36, 0.98, -0.92],
    [0.26, 0.92, -1.06],
  ];
  const hw = [0.02, 0.035, 0.05, 0.06, 0.065, 0.065, 0.055];
  const scEdgeA = catmull(sc.map((p, i): V => [p[0], p[1] + hw[i], p[2]]));
  const scEdgeB = catmull(sc.map((p, i): V => [p[0], p[1] - hw[i], p[2]]));
  b.membrane(scEdgeA, scEdgeB, { color: SCARF, thickness: 0.006, bone: neckBase });
  glow(b.sweep(scEdgeA, 0.0045, { color: WIND, bone: neckBase }), 1.2);
  ball([0.26, 0.92, -1.06], 0.03, GOLD, neckBase);

  // gold filigree drawn on the coat and the skirt flanks
  for (const s of [1, -1]) {
    const shoulder = torsoSurf.around([0, 1.2, 0]).at(s * 42, 14);
    if (shoulder) b.decal(torsoSurf, FILIGREE, { at: shoulder, size: [0.1, 0.1] });
    const flank = skirtSurf.around([0, 0.85, 0]).at(s * 58, 0);
    if (flank) b.decal(skirtSurf, FILIGREE, { at: flank, size: [0.11, 0.11] });
  }

  // wind: glowing ribbons swirling round the figure, and leaves drifting in them
  glow(
    b.sweep(
      catmull([
        [0.5, 1.15, -0.35],
        [0.62, 1.3, 0.05],
        [0.5, 1.12, 0.42],
        [0.25, 0.95, 0.62],
      ]),
      [0.008, 0.001],
      { color: WIND },
    ),
    1.4,
  );
  glow(
    b.sweep(
      catmull([
        [-0.45, 0.98, -0.3],
        [-0.58, 1.18, 0.0],
        [-0.45, 1.38, 0.3],
        [-0.22, 1.52, 0.5],
      ]),
      [0.008, 0.001],
      { color: WIND },
    ),
    1.4,
  );
  const leaves = b.cards(
    [
      [0.5, 1.25, -0.45],
      [0.62, 1.02, -0.7],
      [0.42, 1.45, -0.55],
      [-0.52, 1.3, 0.28],
      [-0.6, 0.95, 0.5],
      [0.12, 1.62, 0.42],
    ].map((p) => frame(p as V, [0, 0, 1])),
    LEAF,
    { size: [0.09, 0.13], lean: 15, vary: 0.25, rng: rng(11), spin: 35 },
  );
  glow(leaves);

  return b.root;
}
