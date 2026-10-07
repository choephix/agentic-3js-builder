import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { lerp, rng } from "../src/math";
import { bezier, catmull, Path } from "../src/path";
import { limb } from "../src/ik";
import type { Joint } from "../src/skeleton";
import { countershade, gradient, mottle, paint, scales, spots, stripes } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Cockatrice",
  description:
    "A plump storybook cockatrice: rooster head, comb and hackles, patchwork dragon wings, a sickle-feather plume and a long scaly serpent tail with a spade tip. One foot is slowly turning to stone.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

// ---- palette -------------------------------------------------------------------------------------------
const ORANGE = "#f4a63c";
const ORANGE_HI = "#ffc55a";
const RUST = "#d8602b";
const CREAM = "#fff0c8";
const CREAM_SH = "#edd39a";
const TEAL = "#1fb2a6";
const DTEAL = "#127a80";
const PLUM = "#7b3a9c";
const COMB = "#ea3d4f";
const COMB_HI = "#ff6a6a";
const WATTLE = "#d42a48";
const BEAK = "#ffc936";
const BEAK_DK = "#e8962a";
const LEG = "#f8b93a";
const LEG_DK = "#e38a26";
const TALON = "#5a4670";
const BONE = "#fbe7b4";
const STONE = "#a3a6ae";
const STONE_DK = "#757985";
const GREEN = "#58c46e";
const GREEN_DK = "#2f9a60";
const BELLY = "#ffe9a8";
const BELLY_SH = "#f0cc78";
const INK = "#2a1530";
const PINK = "#ef7fb0";
const LOBE = "#fffaf0";
const GOLD = "#ffd24a";

const FLAT = { sides: 6, smooth: false } as const;
/** Rows of overlapping rounded feathers, tips pointing toward the start of the surface (u = 0). */
function plumage(len: number, circ: number, tones: [string, string], edge: string, cell = 0.07) {
  return paint((_p, _n, s) => {
    const u = (s[0] * len) / cell;
    const v = ((((s[1] % 360) + 360) % 360) / 360) * (circ / cell);
    const row = Math.floor(u);
    const shifted = v + (row % 2) * 0.5;
    const col = Math.floor(shifted);
    const fu = u - row;
    const fv = shifted - col;
    const d = fu - 0.3 * (2 * fv - 1) ** 2;
    if (d >= 0 && d < 0.1) return edge;
    return tones[(col + row + (d < 0 ? 1 : 0)) % 2];
  });
}


export default function build() {
  const b = createBuilder({ name: "cockatrice" });

  // ---- skeleton: spine, neck, head, jaw ------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.52, -0.12], dir: [0, 0.1, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.52, -0.12],
      [0, 0.57, 0.08],
      [0, 0.67, 0.26],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.66, 0.26],
      [0, 0.82, 0.3],
      [0, 0.98, 0.36],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, -0.06, 1], role: "head" });
  const hl = (forward: number, up: number, left = 0) => head.local({ forward, up, left });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hl(0.12, -0.05),
    aim: hl(0.3, -0.06),
    role: "jaw",
  });

  // ---- tail (serpent) ------------------------------------------------------------------------------------
  const tailPts = [
    [0, 0.47, -0.28],
    [0, 0.33, -0.5],
    [0.02, 0.2, -0.72],
    [0.12, 0.1, -0.95],
    [0.3, 0.075, -1.2],
    [0.55, 0.065, -1.3],
    [0.8, 0.055, -1.15],
    [0.88, 0.05, -0.88],
    [0.75, 0.06, -0.65],
    [0.55, 0.14, -0.58],
    [0.42, 0.3, -0.62],
    [0.4, 0.44, -0.72],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, count: 11, role: "tail" });
  const tailR = (t: number) => 0.085 * (1 - t) + 0.02;

  // ---- plume joints ---------------------------------------------------------------------------------------
  const plume: { joint: Joint; path: Path; i: number; u: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const u = (i - 3) / 3;
    const H = 1 - 0.38 * Math.abs(u) ** 1.4;
    const base = [u * 0.03, 0.6, -0.3];
    const c1 = [u * 0.12, 0.6 + 0.3 * H, -0.42 - 0.1 * H];
    const c2 = [u * 0.34, 0.6 + 0.52 * H, -0.7 - 0.1 * H];
    const tip = [u * 0.6, 0.62 + 0.22 * H, -1.02 - 0.1 * H];
    const joint = b.joint(`plume${i + 1}`, { parent: hips, at: base, aim: c1, role: "fan" });
    plume.push({ joint, path: bezier(base, c1, c2, tip), i, u });
  }

  // ---- legs ------------------------------------------------------------------------------------------------
  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const foot = [s * 0.19, 0.05, 0.03];
    const pts = limb(
      [s * 0.17, 0.5, -0.03],
      foot,
      [0.2, 0.2, 0.21],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [foot[0], 0, 0.1],
    });
    return { s, side, pts, leg, foot };
  });
  const toes = legs.map(({ s, side, leg, foot }) => {
    const footJ = leg.joints[3];
    const defs = [
      { a: 34, len: 0.17, n: "1" },
      { a: 0, len: 0.2, n: "2" },
      { a: -34, len: 0.17, n: "3" },
      { a: 180, len: 0.1, n: "4" },
    ];
    return defs.map(({ a, len, n }) => {
      const r = (a * Math.PI) / 180;
      const d = [s * Math.sin(r), 0, Math.cos(r)];
      const B = foot;
      const path = catmull([
        B,
        [B[0] + d[0] * len * 0.5, 0.03, B[2] + d[2] * len * 0.5],
        [B[0] + d[0] * len, 0.024, B[2] + d[2] * len],
      ]);
      const chain = b.chain(`toe${side}${n}`, path, {
        parent: footJ,
        names: [`toe${side}${n}a`, `toe${side}${n}b`, `toe${side}${n}tip`],
        role: "digit",
      });
      return { d, chain, len, a, side, s };
    });
  });

  // ---- wings ----------------------------------------------------------------------------------------------
  const wings = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const sh = [s * 0.2, 0.78, 0.04];
    const el = [s * 0.46, 0.94, -0.12];
    const wr = [s * 0.74, 1.02, 0.1];
    const arm = b.chain(`arm${side}`, catmull([sh, el, wr]), {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
    });
    const tips = [
      [s * 1.02, 1.26, 0.3],
      [s * 1.0, 1.08, -0.18],
      [s * 0.82, 0.92, -0.5],
    ];
    const fingers = tips.map((tip, k) => {
      const mid = lerp(wr, tip, 0.5);
      mid.y += 0.03;
      return b.chain(`finger${k + 1}${side}`, catmull([wr, mid, tip]), {
        parent: arm.joints[2],
        names: [`f${k + 1}a${side}`, `f${k + 1}b${side}`, `f${k + 1}tip${side}`],
        role: "digit",
      });
    });
    return { s, side, arm, fingers, el };
  });

  // ---- body ------------------------------------------------------------------------------------------------
  const BODY_LEN = 0.85;
  const BODY_BACK = plumage(BODY_LEN, 1.4, [TEAL, "#2cc3b2"], "#128e92");
  const bodyCoat = countershade(
    plumage(BODY_LEN, 1.4, [ORANGE, ORANGE_HI], "#e0802a"),
    plumage(BODY_LEN, 1.4, [BELLY, CREAM], "#e6c27c"),
    { level: -0.2 },
  );
  const body = b.loft(
    [
      { at: [0, 0.52, -0.38], w: 0.16, h: 0.18 },
      { at: [0, 0.54, -0.22], w: 0.36, h: 0.36 },
      { at: [0, 0.57, -0.02], w: 0.46, h: 0.46 },
      { at: [0, 0.62, 0.17], w: 0.46, h: 0.5 },
      { at: [0, 0.72, 0.33], w: 0.3, h: 0.36 },
    ],
    {
      bone: [tail, hips, spine],
      sides: 10,
      smooth: false,
      color: bodyCoat,
      sectors: [[-52, 52, BODY_BACK, 0, 0.8]],
      name: "body",
    },
  );

  const neckCoat = countershade(
    plumage(0.42, 0.75, [ORANGE, ORANGE_HI], "#e0802a", 0.06),
    plumage(0.42, 0.75, [CREAM, BELLY], "#e6c27c", 0.06),
    { level: -0.3 },
  );
  const neckTube = b.sweep(neck, (t) => 0.125 - 0.035 * t, { ...FLAT, sides: 8, color: neckCoat, name: "neck" });

  // ---- head ------------------------------------------------------------------------------------------------
  const HC = hl(0.08, 0.05);
  const headCoat = countershade(
    scales([ORANGE, ORANGE_HI], RUST, { size: 0.05, width: 0.1 }),
    scales(CREAM, CREAM_SH, { size: 0.05, width: 0.1 }),
    { level: -0.35 },
  );
  const skull = b.part(new THREE.SphereGeometry(1, 9, 7), headCoat, {
    bone: head,
    at: HC,
    scale: [0.155, 0.145, 0.165],
    flat: true,
    name: "skull",
  });
  const skin = b.surface(skull);

  // beaks
  const beakPaint = gradient(BEAK, BEAK_DK, hl(0.18, 0.05), hl(0.38, 0.0));
  b.part(new THREE.ConeGeometry(0.095, 0.26, 4), beakPaint, {
    bone: head,
    at: hl(0.255, 0.045),
    dir: [0, -0.1, 1],
    up: [0, 1, 0],
    scale: [1, 1, 0.75],
    flat: true,
    name: "beakUpper",
  });
  b.part(new THREE.ConeGeometry(0.07, 0.2, 4), gradient(BEAK, BEAK_DK, hl(0.18, -0.05), hl(0.34, -0.06)), {
    bone: jaw,
    at: hl(0.215, -0.062),
    dir: [0, -0.03, 1],
    up: [0, 1, 0],
    scale: [1, 1, 0.7],
    flat: true,
    name: "beakLower",
  });
  // tongue
  b.part(new THREE.ConeGeometry(0.028, 0.14, 3), PINK, {
    bone: jaw,
    at: hl(0.2, -0.04),
    dir: [0, 0, 1],
    up: [0, 1, 0],
    scale: [1, 1, 0.4],
    flat: true,
    name: "tongue",
  });
  // little teeth on both beaks
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.011, 0.04, 4), CREAM, {
        bone: head,
        at: hl(0.18 + 0.045 * k, 0.0, s * (0.045 - 0.008 * k)),
        dir: [0, -1, 0],
        flat: true,
        name: "toothU",
      });
      b.part(new THREE.ConeGeometry(0.01, 0.034, 4), CREAM, {
        bone: jaw,
        at: hl(0.17 + 0.04 * k, -0.04, s * (0.036 - 0.008 * k)),
        dir: [0, 1, 0],
        flat: true,
        name: "toothL",
      });
    }
  }
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.012, 5, 4), INK, {
      bone: head,
      at: hl(0.17, 0.07, s * 0.024),
      scale: [1, 0.7, 1.2],
      flat: true,
      name: "nostril",
    });

  // eyes
  const EYE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs><clipPath id="c"><circle cx="50" cy="50" r="46"/></clipPath></defs>
      <circle cx="50" cy="50" r="49" fill="${INK}"/>
      <circle cx="50" cy="50" r="43" fill="#d4f23a"/>
      <circle cx="50" cy="54" r="33" fill="#ffe84a"/>
      <ellipse cx="50" cy="54" rx="9" ry="30" fill="${INK}"/>
      <circle cx="36" cy="38" r="9" fill="#ffffff"/>
      <circle cx="63" cy="68" r="4" fill="#ffffff"/>
      <g clip-path="url(#c)"><polygon points="0,0 100,0 100,30 0,46" fill="${RUST}"/>
      <line x1="0" y1="46" x2="100" y2="30" stroke="${INK}" stroke-width="6"/></g>
    </svg>`,
    { size: 192 },
  );
  for (const s of [1, -1]) {
    glow(
      b.decal(skin, EYE, {
        at: hl(0.17, 0.09, s * 0.115),
        dir: [s * 0.6, 0.05, 0.8],
        size: [0.125, 0.125],
        mirror: s > 0,
        lift: 0.004,
        name: "eye",
      }),
      0.9,
    );
    // brow ridge
    b.capsule(hl(0.19, 0.138, s * 0.07), hl(0.11, 0.152, s * 0.13), 0.02, {
      ...FLAT,
      bone: head,
      color: RUST,
      name: "brow",
    });
    // earlobe
    b.part(new THREE.SphereGeometry(1, 7, 5), LOBE, {
      bone: head,
      at: hl(0.05, 0.03, s * 0.145),
      scale: [0.014, 0.045, 0.038],
      dir: [0, 1, 0],
      flat: true,
      name: "earlobe",
    });
    // dragon horn
    b.sweep(bezier(hl(0.02, 0.17, s * 0.09), hl(-0.06, 0.25, s * 0.14), hl(-0.2, 0.25, s * 0.18)), [0.032, 0.0], {
      sides: 5,
      smooth: false,
      bone: head,
      color: BONE,
      caps: { start: "flat", end: "point" },
      name: "horn",
    });
  }

  // comb
  b.extrude(
    [
      [0.12, 0.0],
      [0.13, 0.06],
      [0.1, 0.09],
      [0.09, 0.16],
      [0.04, 0.12],
      [0.015, 0.215],
      [-0.03, 0.14],
      [-0.06, 0.19],
      [-0.095, 0.1],
      [-0.15, 0.08],
      [-0.17, 0.0],
      [-0.1, -0.05],
      [0.1, -0.05],
    ],
    {
      at: hl(0.08, 0.17),
      thickness: 0.06,
      bevel: 0.01,
      smoothing: 1,
      color: paint((_p, _n, s) => (s[1] > 0.12 ? COMB_HI : COMB)),
      bone: head,
      name: "comb",
    },
  );
  // wattles
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 7, 5), WATTLE, {
      bone: jaw,
      at: hl(0.14, -0.14, s * 0.04),
      scale: [0.032, 0.085, 0.04],
      flat: true,
      name: "wattle",
    });

  // ---- neck / body detail --------------------------------------------------------------------------------
  const FEATHER = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
      <path d="M20 63 C13 52 5 42 5 26 C5 12 13 3 20 3 C27 3 35 12 35 26 C35 42 27 52 20 63 Z" fill="#ffffff" stroke="#b0b0b0" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M20 58 L20 14" stroke="#b0b0b0" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M20 40 L12 28 M20 40 L28 28" stroke="#cfcfcf" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const neckSkin = b.surface(neckTube);
  b.cards(
    neckSkin.scatter(70, { rng: rng(3), minDist: 0.045, filter: (h) => h.n.y > -0.5 }),
    FEATHER,
    { size: [0.06, 0.12], lean: 62, bend: 25, flow: [0, -1, -0.15], vary: 0.25, spin: 15, rng: rng(4), color: ORANGE },
  );
  b.cards(
    neckSkin.scatter(40, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > 0.1 && h.at.y > 0.8 }),
    FEATHER,
    { size: [0.05, 0.1], lean: 75, bend: 20, flow: [0, -1, -0.3], vary: 0.2, rng: rng(6), color: RUST },
  );
  b.cards(
    neckSkin.scatter(30, { rng: rng(7), minDist: 0.05, filter: (h) => h.n.z > 0.3 }),
    FEATHER,
    { size: [0.05, 0.1], lean: 70, bend: 15, flow: [0, -1, 0.2], vary: 0.2, rng: rng(8), color: CREAM },
  );
  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(60, { rng: rng(9), minDist: 0.08, filter: (h) => h.n.y > 0.45 && h.at.z < 0.2 }),
    FEATHER,
    { size: [0.09, 0.16], lean: 72, bend: 25, flow: [0, -0.15, -1], vary: 0.25, spin: 12, rng: rng(10), color: TEAL },
  );
  b.cards(
    bodySkin.scatter(70, { rng: rng(11), minDist: 0.06, filter: (h) => h.n.z > 0.45 && h.n.y < 0.5 && h.at.y > 0.4 }),
    FEATHER,
    { size: [0.07, 0.115], lean: 68, bend: 20, flow: [0, -1, 0.1], vary: 0.2, rng: rng(12), color: "#fff2b8" },
  );
  // dragon spines: neck and back
  b.along(neckTube, 5, (at) => b.spike(at, at, 0.05 + 0.03 * at.t, 0.026, { sides: 4, smooth: false, color: DTEAL }));
  b.along(body, 4, (at) => b.spike(at, at, 0.09, 0.035, { sides: 4, smooth: false, color: DTEAL }), {
    from: 0.1,
    to: 0.85,
  });

  // ---- tail sweep ------------------------------------------------------------------------------------------
  const TAIL_LEN = tail.length;
  const tailPaint = paint((_p, n, s) => {
    if (n.y < -0.4) return Math.floor((s[0] * TAIL_LEN) / 0.04) % 2 ? BELLY : BELLY_SH;
    const u = ((s[0] * TAIL_LEN) / 0.12) % 1;
    const ang = (((s[1] % 360) + 360) % 360) / 72;
    const v = ang % 1;
    const d = Math.abs(u - 0.5) + Math.abs(v - 0.5);
    return d < 0.36 ? DTEAL : d < 0.5 ? GREEN_DK : GREEN;
  });
  const tailSweep = b.sweep(tail, tailR, { ...FLAT, color: tailPaint, name: "tail" });
  b.along(tailSweep, 11, (at) => b.spike(at, at, 0.02 + at.radius * 0.7, at.radius * 0.25 + 0.006, { sides: 4, smooth: false, color: COMB }), {
    from: 0.04,
    to: 0.92,
  });
  const tt = tail.at(1);
  b.extrude(
    [
      [0.0, 0.0],
      [-0.02, 0.085, "sharp"],
      [0.07, 0.055],
      [0.21, 0.0, "sharp"],
      [0.07, -0.055],
      [-0.02, -0.085, "sharp"],
    ],
    {
      at: tt.at,
      x: tt.tangent,
      y: tt.normal,
      thickness: 0.03,
      bevel: 0.008,
      color: paint((_p, _n, s) => (s[0] > 0.1 ? COMB_HI : COMB)),
      bone: tail.joints[tail.joints.length - 1],
      name: "spade",
    },
  );

  // ---- plume ----------------------------------------------------------------------------------------------
  for (const { joint, path, i, u } of plume) {
    const warm = i % 2 === 1;
    b.sweep(path, (t) => [0.028 + 0.03 * Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.007], {
      section: "box",
      bone: joint,
      caps: { start: "flat", end: "point" },
      color: (t) =>
        t < 0.2
          ? DTEAL
          : t < 0.66
            ? warm
              ? ORANGE
              : TEAL
            : t < 0.8
              ? warm
                ? RUST
                : DTEAL
              : t < 0.9
                ? GOLD
                : PLUM,
      name: `sickle${i}${u > 0 ? "L" : "R"}`,
    });
  }

  // ---- legs ------------------------------------------------------------------------------------------------
  for (const { s, side, pts, leg } of legs) {
    const stone = s < 0;
    const LEGP = stripes(LEG, LEG_DK, { size: 0.04, axis: "y", width: 0.25 });
    const legPaint = stone
      ? gradient(mottle(STONE, STONE_DK, { size: 0.035 }), LEGP, [0, 0.03, 0], [0, 0.22, 0])
      : LEGP;
    b.sweep(leg, [0.065, 0.05, 0.036, 0.031, 0.027], { ...FLAT, color: legPaint, name: `leg${side}` });
    // feather pantaloons
    const kn = lerp(pts[0], pts[1], 0.45);
    const pant = b.part(new THREE.SphereGeometry(1, 8, 6), scales([ORANGE, ORANGE_HI], RUST, { size: 0.07, width: 0.1 }), {
      bone: leg.joints[0],
      at: kn,
      scale: [0.11, 0.15, 0.16],
      flat: true,
      name: `pants${side}`,
    });
    b.cards(
      b.surface(pant).scatter(22, { rng: rng(30 + (s > 0 ? 1 : 2)), minDist: 0.07, filter: (h) => h.n.y < 0.3 }),
      FEATHER,
      { size: [0.06, 0.11], lean: 62, bend: 20, flow: [0, -1, -0.2], vary: 0.2, rng: rng(32), color: ORANGE },
    );
    // hock spur
    const sp = leg.at(0.82);
    b.spike(sp, [0, 0.35, -1], 0.1, 0.02, { sides: 4, smooth: false, color: TALON, name: `spur${side}` });
    // feathery hock boots
    b.cards(
      b.ring(leg.at(0.5), { count: 8, radius: 0.04 }).items,
      FEATHER,
      { size: [0.05, 0.085], lean: 60, bend: 15, flow: [0, -1, 0], vary: 0.15, rng: rng(60), color: RUST },
    );
    if (!stone) {
      // a tiny gold leg ring, a storybook "band"
      const band = b.ring(leg.at(0.66), { count: 8, radius: 0.04 });
      b.sweep(catmull(band.items, { closed: true }), 0.011, { ...FLAT, sides: 4, color: GOLD, name: "legBand" });
    }
  }
  for (const set of toes) {
    for (const { d, chain, side, a } of set) {
      const stone = side === "R";
      const LEGP = stripes(LEG, LEG_DK, { size: 0.04, axis: "z", width: 0.25 });
      b.sweep(chain, [0.028, 0.02], {
        ...FLAT,
        sides: 6,
        color: stone ? mottle(STONE, STONE_DK, { size: 0.03 }) : LEGP,
        name: `toe${side}`,
      });
      const tp = chain.at(1);
      b.spike(tp, [d[0], a === 180 ? -0.15 : -0.3, d[2]], a === 180 ? 0.06 : 0.075, 0.019, {
        sides: 5,
        smooth: false,
        color: stone ? STONE_DK : TALON,
        name: "claw",
      });
    }
  }

  // ---- wings ----------------------------------------------------------------------------------------------
  const WING_BASE = spots("#ffa6c8", "#ffe6b8", { size: 0.12, amount: 0.24, seed: 5 });
  const WING = paint((_p, _n, s) =>
    s[0] > 0.94 ? "#ffd2a8" : Math.abs(s[1] - 0.5) < 0.02 && s[0] < 0.92 ? "#e86aa6" : WING_BASE,
  );
  for (const { s, side, arm, fingers, el } of wings) {
    const armTube = b.sweep(arm, [0.05, 0.036, 0.026], { ...FLAT, color: PLUM, name: `arm${side}` });
    fingers.forEach((f, k) => {
      b.sweep(f, [0.022 - 0.003 * k, 0.012, 0.005], {
        sides: 5,
        smooth: false,
        color: k === 0 ? PLUM : "#9455b8",
        caps: { start: "round", end: "point" },
        name: `finger${k + 1}${side}`,
      });
    });
    b.membrane(fingers[0], fingers[1], { thickness: 0.01, color: WING, scallop: 0.16, rows: 3, name: `mem1${side}` });
    b.membrane(fingers[1], fingers[2], { thickness: 0.01, color: WING, scallop: 0.16, rows: 3, name: `mem2${side}` });
    b.membrane(fingers[2], [el, [s * 0.26, 0.64, -0.2], [s * 0.17, 0.56, -0.34]], {
      thickness: 0.01,
      color: WING,
      scallop: 0.1,
      rows: 3,
      name: `mem3${side}`,
    });
    // thumb claw + finger claws
    b.spike(arm.at(1), [s * 0.2, 0.5, 1], 0.11, 0.024, { sides: 5, smooth: false, color: BONE, name: "thumb" });
    b.spike(arm.at(0.5), [s * 0.35, 0.3, -1], 0.13, 0.03, { sides: 5, smooth: false, color: BONE, name: "elbowSpur" });
    fingers.forEach((f, k) => {
      const p = f.at(1);
      b.spike(p, p.tangent, 0.07, 0.014, { sides: 4, smooth: false, color: BONE, name: `fclaw${k}` });
    });
    // coverts along the arm
    const as = b.surface(armTube);
    b.cards(as.scatter(26, { rng: rng(40 + (s > 0 ? 0 : 1)), minDist: 0.05, filter: (h) => h.n.y > -0.3 }), FEATHER, {
      size: [0.07, 0.13],
      lean: 70,
      bend: 20,
      flow: [0, -0.25, -1],
      vary: 0.2,
      rng: rng(44),
      color: ORANGE,
    });
    b.cards(as.scatter(14, { rng: rng(50 + (s > 0 ? 0 : 1)), minDist: 0.07, filter: (h) => h.n.y > 0.2 }), FEATHER, {
      size: [0.06, 0.1],
      lean: 75,
      bend: 20,
      flow: [0, -0.25, -1],
      vary: 0.2,
      rng: rng(45),
      color: TEAL,
    });
  }

  // ---- final rest pose: jaw a little open -----------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
