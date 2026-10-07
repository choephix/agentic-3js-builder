import * as THREE from "three";
import {
  createBuilder,
  rng,
  polyline,
  catmull,
  arc,
  mottle,
  spots,
  paint,
  noise,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Battle-worn Knight",
  description:
    "A fantasy knight in scratched, dented plate: great helm with eye slit and tall crimson plume, layered gold-filigree pauldrons, deep-blue surcoat with a silver griffin, kite shield, broadsword and a torn crimson cape.",
};

const STEEL = "#9aa4ae";
const STEEL_DK = "#6a727c";
const SCRATCH = "#dfe5ea";
const DENT = "#4b525a";
const GOLD = "#d6a93a";
const GOLD_DK = "#9a7020";
const BLUE = "#1f3a7a";
const BLUE_DK = "#14275a";
const SILVER = "#d9dee6";
const CRIMSON = "#b3172b";
const CRIMSON_DK = "#740d1c";
const GRIME = "#4a1016";
const LEATHER = "#5a3a22";
const LEATHER_DK = "#34200f";
const DARK = "#121216";
const RUBY = "#d0102a";
const WOOD = "#6b5236";

const D = Math.PI / 180;

const GRIFFIN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
  <g fill="${SILVER}" stroke="#7c8794" stroke-width="2" stroke-linejoin="round">
    <path d="M48 50 L30 34 L14 30 L22 26 L10 18 L26 18 L18 8 L34 14 L32 2 L44 16 L50 10 L54 30 Z"/>
    <path d="M44 78 C 30 84 22 96 16 86" fill="none" stroke="${SILVER}" stroke-width="5"/>
    <path d="M16 86 L 6 82 L 10 93 L 20 91 Z"/>
    <path d="M48 80 L 40 96 L 32 100 L 34 105 L 46 101 L 55 84 Z"/>
    <path d="M58 84 L 64 100 L 74 105 L 75 100 L 69 96 L 65 82 Z"/>
    <path d="M42 52 C 40 70 46 84 58 86 C 70 86 72 70 66 52 C 62 42 46 42 42 52 Z"/>
    <path d="M60 64 L 76 70 L 82 78 L 78 81 L 72 75 L 60 73 Z"/>
    <path d="M64 56 L 78 50 L 84 43 L 88 46 L 85 51 L 91 52 L 86 57 L 78 59 L 66 65 Z"/>
    <path d="M58 50 C 58 38 60 28 66 22 C 72 18 80 20 82 26 L 93 32 L 80 35 C 76 40 72 46 68 52 Z"/>
    <path d="M66 22 L 61 9 L 72 19 Z"/>
  </g>
  <circle cx="72" cy="27" r="2.4" fill="${BLUE_DK}"/>
</svg>`,
  { size: 256 },
);

const FEATHER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <path d="M16 64 L12 56 L6 54 L9 48 L3 42 L8 38 L4 30 L9 26 L6 18 L11 14 L12 6 L16 0 L20 6 L21 14 L26 18 L23 26 L28 30 L24 38 L29 42 L23 48 L26 54 L20 56 Z" fill="#ffffff"/>
  <path d="M16 62 L16 4" stroke="#8a8a8a" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "knight", paintSize: 2048 });
  const R = rng(42);

  // ---------- paints ----------
  type P = ReturnType<typeof mottle>;
  const scratched = (base: P | string, mark: string, seed: number) =>
    paint((p) => {
      const a = p.x * 0.8 + p.y * 0.5 + p.z * 0.35 + noise(p, 0.05, seed) * 0.03;
      if (Math.abs(Math.sin(a * 150)) > 0.97 && noise(p, 0.1, seed + 7) > 0.64) return mark;
      return base;
    });
  const steel = scratched(
    spots(mottle(STEEL, STEEL_DK, { size: 0.14, contrast: 0.5, seed: 3 }), DENT, { size: 0.18, amount: 0.07, seed: 5 }),
    SCRATCH,
    2,
  );
  const gold = scratched(mottle(GOLD, GOLD_DK, { size: 0.06, seed: 8 }), "#f5d98a", 4);
  const blueCloth = scratched(mottle(BLUE, BLUE_DK, { size: 0.07, seed: 9 }), "#3b5594", 6);
  const filigree = (k: number) =>
    paint((_p, _n, s) => {
      const h = s[0] / k;
      const d = s[1] * D;
      if (h < -0.012) return gold;
      if (Math.abs(h - (0.03 + 0.012 * Math.sin(d * 8))) < 0.0035) return gold;
      if (Math.abs(h - (0.03 - 0.012 * Math.sin(d * 8))) < 0.0035) return gold;
      if (h > 0.066 && h < 0.074) return gold;
      return steel;
    });
  const helmPaint = paint((_p, _n, s) => {
    const h = s[0];
    if (h < 0.022) return gold;
    if (h > 0.31 && h < 0.33) return gold;
    return steel;
  });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.98, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.02, 0],
      [0, 1.2, 0.005],
      [0, 1.38, 0],
      [0, 1.54, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.54, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.62, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.72, 0.04], aim: [0, 1.62, 0.16], role: "jaw" });

  // ---------- torso ----------
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.32, h: 0.22 },
      { at: [0, 1.0, 0], w: 0.34, h: 0.24 },
      { at: [0, 1.12, 0.005], w: 0.3, h: 0.22 },
      { at: [0, 1.28, 0.01], w: 0.38, h: 0.27 },
      { at: [0, 1.42, 0.005], w: 0.43, h: 0.27 },
      { at: [0, 1.52, 0], w: 0.34, h: 0.22 },
      { at: [0, 1.58, 0], w: 0.18, h: 0.15 },
    ],
    { bone: [hips, spine], color: steel, sides: 10, name: "breastplate" },
  );
  void torso;

  const surcoat = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.35, h: 0.25 },
      { at: [0, 1.0, 0], w: 0.37, h: 0.27 },
      { at: [0, 1.12, 0.005], w: 0.33, h: 0.25 },
      { at: [0, 1.28, 0.01], w: 0.41, h: 0.3 },
      { at: [0, 1.4, 0.005], w: 0.45, h: 0.3 },
    ],
    { bone: [hips, spine], color: blueCloth, sides: 10, caps: "flat", name: "surcoat" },
  );
  const coatSurf = b.surface(surcoat);
  b.decal(surcoat, GRIFFIN, { at: [0, 1.22, 0.22], dir: [0, 0, 1], size: [0.22, 0.25] });
  b.sweep(coatSurf.loop([0, 1.385, 0], { lift: 0.002 }), 0.007, { color: gold, name: "surcoatTrimTop" });
  b.sweep(coatSurf.loop([0, 0.93, 0], { lift: 0.002 }), 0.007, { color: gold, name: "surcoatTrimLow" });

  // belt + buckle
  b.sweep(coatSurf.loop([0, 0.99, 0], { lift: 0.004 }), () => [0.008, 0.028], {
    section: "box",
    color: LEATHER,
    name: "belt",
  });
  const buckleHit = coatSurf.ray([0, 0.99, 1], [0, 0, -1]);
  if (buckleHit) {
    b.stick(new THREE.BoxGeometry(0.075, 0.03, 0.06), gold, buckleHit, { embed: 0.2 });
    b.stick(new THREE.BoxGeometry(0.04, 0.034, 0.03), LEATHER_DK, buckleHit, { embed: 0.1 });
  }

  // tabard panels with torn hems
  const panel: OutlinePoint[] = [
    [-0.15, 0, "sharp"],
    [0.15, 0, "sharp"],
    [0.16, -0.38],
    [0.11, -0.47, "sharp"],
    [0.07, -0.4],
    [0.02, -0.5, "sharp"],
    [-0.03, -0.41],
    [-0.08, -0.48, "sharp"],
    [-0.12, -0.39],
    [-0.165, -0.45, "sharp"],
  ];
  const panelPaint = paint((_p, _n, s) =>
    Math.abs(s[0]) > 0.133 ? gold : s[1] < -0.37 ? BLUE_DK : blueCloth,
  );
  for (const side of [1, -1]) {
    const hit = coatSurf.ray([0, 0.97, side * 1], [0, 0, -side]);
    const z = hit ? hit.at.z + side * 0.008 : side * 0.145;
    b.extrude(panel, {
      at: [0, 0.97, z],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: panelPaint,
      bone: hips,
      name: side > 0 ? "tabardFront" : "tabardBack",
    });
  }

  // gorget
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.14, 0.02],
      [0.105, 0.065],
      [0.096, 0.11],
      [0, 0.11],
    ],
    { at: [0, 1.49, 0], segments: 10, color: paint((_p, _n, s) => (s[0] < 0.022 ? gold : steel)), bone: chest, name: "gorget" },
  );

  // ---------- helm ----------
  b.lathe(
    [
      [0, 0.02],
      [0.118, 0],
      [0.128, 0.005],
      [0.13, 0.12],
      [0.13, 0.29],
      [0.122, 0.33],
      [0.09, 0.355],
      [0, 0.365],
    ],
    { at: [0, 1.555, 0], segments: 10, color: helmPaint, bone: head, name: "greatHelm" },
  );
  const arcAt = (y: number, r: number, half: number) =>
    arc([0, y, 0], [-Math.sin(half * D) * r, y, Math.cos(half * D) * r], [0, 1, 0], 2 * half);
  // eye slit, recessed between two gold brows
  b.sweep(arcAt(1.79, 0.131, 66), () => [0.007, 0.009], { section: "box", caps: "flat", color: DARK, bone: head, name: "eyeSlit" });
  b.sweep(arcAt(1.766, 0.134, 68), () => [0.009, 0.011], { section: "box", caps: "flat", color: gold, bone: head, name: "browLow" });
  b.sweep(arcAt(1.814, 0.134, 68), () => [0.009, 0.011], { section: "box", caps: "flat", color: gold, bone: head, name: "browHigh" });
  b.sweep(
    polyline([
      [0, 1.826, 0.133],
      [0, 1.9, 0.13],
    ]),
    () => [0.011, 0.006],
    { section: "box", caps: "flat", color: gold, bone: head, name: "helmCross" },
  );
  b.sweep(
    polyline([
      [0, 1.725, 0.133],
      [0, 1.756, 0.133],
    ]),
    () => [0.011, 0.006],
    { section: "box", caps: "flat", color: gold, bone: head, name: "helmCrossLow" },
  );
  b.along(arcAt(1.572, 0.13, 180), 18, (at) =>
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), GOLD, { at, bone: head }),
  );

  // bevor (lower face plate) on the jaw
  const bevor = b.sweep(arcAt(1.655, 0.14, 72), () => [0.008, 0.075], {
    section: "box",
    caps: "flat",
    color: steel,
    bone: jaw,
    name: "bevor",
  });
  b.sweep(arcAt(1.583, 0.149, 72), () => [0.006, 0.007], { section: "box", caps: "flat", color: gold, bone: jaw, name: "bevorRim" });
  const bevorSurf = b.surface(bevor);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      const th = (-58 + c * 10) * D;
      const y = 1.61 + r * 0.028;
      const hit = bevorSurf.ray([0.5 * Math.sin(th), y, 0.5 * Math.cos(th)], [-Math.sin(th), 0, -Math.cos(th)]);
      if (hit) b.stick(new THREE.CylinderGeometry(0.0065, 0.0065, 0.004, 6), DARK, hit, { embed: 0.4 });
    }

  // plume
  b.rod([0, 1.912, -0.03], [0, 1.975, -0.03], [0.02, 0.016], { color: gold, bone: head, name: "plumeHolder" });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), GOLD, { at: [0, 1.975, -0.03], bone: head });
  const plume = b.chain(
    "plume",
    catmull([
      [0, 1.96, -0.03],
      [0, 2.16, -0.05],
      [0, 2.3, -0.16],
      [0, 2.24, -0.36],
    ]),
    { parent: head, count: 3 },
  );
  const plumeCols = [CRIMSON, CRIMSON_DK, "#d42a3c", CRIMSON];
  let mainFeather = null as ReturnType<typeof b.sweep> | null;
  for (let i = 0; i <= 10; i++) {
    const dx = ((i - 5) / 5) * 0.065;
    const j = () => (R() - 0.5) * 0.03;
    const path = catmull([
      [dx * 0.2, 1.96, -0.03],
      [dx * 0.6 + j(), 2.14 + j(), -0.05 + j()],
      [dx, 2.27 + j() - Math.abs(dx) * 0.6, -0.17 + j()],
      [dx * 1.3, 2.2 + j() - Math.abs(dx), -0.36 + j()],
    ]);
    const sw = b.sweep(path, [0.01, 0.028, 0.034, 0.022, 0.004], {
      bone: plume,
      sides: 6,
      color: plumeCols[i % plumeCols.length],
      name: `feather${i}`,
    });
    if (i === 5) mainFeather = sw;
  }
  if (mainFeather) {
    const frames = [];
    for (let k = 0; k < 9; k++)
      for (const deg of [-75, 0, 75]) frames.push(mainFeather.at(0.18 + k * 0.09, deg));
    b.cards(frames, FEATHER, { size: [0.06, 0.14], lean: 50, bend: 30, vary: 0.3, spin: 15, rng: rng(9), color: CRIMSON });
  }

  // ---------- arms ----------
  const pauldron: [number, number][] = [
    [0, 0.1],
    [0.07, 0.088],
    [0.12, 0.055],
    [0.15, 0.0],
    [0.155, -0.03],
    [0.142, -0.03],
    [0.137, 0.0],
    [0.108, 0.048],
    [0.063, 0.076],
    [0, 0.086],
  ];
  const hands: Record<string, ReturnType<typeof b.joint>> = {};
  const elbows: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.2, 1.47, 0],
        [s * 0.48, 1.47, -0.01],
        [s * 0.74, 1.47, 0],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" },
    );
    const [shoulder, elbow, hand] = arm.joints;
    hands[S] = hand;
    elbows[S] = elbow;
    const armTube = b.sweep(arm, [0.07, 0.062, 0.056, 0.05, 0.046], { color: steel, name: `arm${S}` });

    // layered pauldron lames with gold filigree
    for (let i = 3; i >= 0; i--) {
      const k = 1 - 0.08 * i;
      const at: [number, number, number] = [s * (0.22 + 0.06 * i), 1.48 - 0.005 * i, 0];
      const dome = b.lathe(
        pauldron.map(([x, y]) => [x * k, y * k] as OutlinePoint),
        { at, axis: [s * (0.5 + 0.4 * i), 1, 0], segments: 12, color: filigree(k), bone: shoulder, name: `pauldron${S}${i}` },
      );
      if (i === 0) {
        const ds = b.surface(dome).around(at);
        for (let a = 0; a < 6; a++) {
          const hit = ds.at(a * 60 + 30, 28);
          if (hit) b.stick(new THREE.SphereGeometry(0.009, 6, 4), GOLD, hit, { embed: 0.3 });
        }
      }
    }
    b.extrude(
      [
        [-0.11, 0, "sharp"],
        [0.11, 0, "sharp"],
        [0.09, 0.045],
        [0, 0.062],
        [-0.09, 0.045],
      ],
      { at: [s * 0.19, 1.553, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, bevel: 0.003, smoothing: 1, color: gold, bone: shoulder, name: `hautePiece${S}` },
    );

    // couter
    const ch = b.surface(armTube).ray([s * 0.48, 1.47, -0.6], [0, 0, 1]);
    if (ch) {
      b.stick(new THREE.SphereGeometry(0.052, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), steel, ch, { embed: 0.25 });
      b.stick(new THREE.ConeGeometry(0.012, 0.04, 6), GOLD, ch, { embed: -0.6 });
    }
    // flared gauntlet cuff
    b.lathe(
      [
        [0.046, 0],
        [0.053, 0],
        [0.08, 0.065],
        [0.072, 0.068],
      ],
      { at: [s * 0.69, 1.47, 0], axis: [s, 0, 0], segments: 10, color: paint((_p, _n, q) => (q[0] > 0.05 ? gold : steel)), bone: elbow, name: `cuff${S}` },
    );

    if (s > 0) {
      // left hand: open, palm down, behind the shield
      b.frustumBox([0.74, 1.47, 0], [0.84, 1.47, 0], [0.085, 0.045], [0.09, 0.04], { bone: hand, color: steel, name: "palmL" });
      const fingers = b.chain(
        "fingersL",
        polyline([
          [0.84, 1.47, 0],
          [0.885, 1.466, 0],
          [0.93, 1.452, 0],
        ]),
        { parent: hand, names: ["fingersL1", "fingersL2"], role: "digit" },
      );
      b.sweep(fingers, () => [0.042, 0.017], { section: "box", caps: "flat", color: steel, name: "fingersL" });
      const thumb = b.chain(
        "thumbL",
        polyline([
          [0.77, 1.465, 0.04],
          [0.81, 1.46, 0.075],
          [0.845, 1.455, 0.09],
        ]),
        { parent: hand, names: ["thumbL1", "thumbL2"], role: "digit" },
      );
      b.sweep(thumb, [0.016, 0.013], { color: steel, sides: 6, name: "thumbL" });
    } else {
      // right hand: fist round the sword grip
      b.frustumBox([-0.74, 1.47, 0], [-0.84, 1.47, 0], [0.055, 0.09], [0.05, 0.085], { bone: hand, color: steel, name: "palmR" });
      const fingers = b.chain(
        "fingersR",
        polyline([
          [-0.84, 1.47, -0.01],
          [-0.866, 1.47, 0.03],
          [-0.84, 1.47, 0.056],
        ]),
        { parent: hand, names: ["fingersR1", "fingersR2"], role: "digit" },
      );
      b.sweep(fingers, () => [0.014, 0.04], { section: "box", caps: "flat", color: steel, name: "fingersR" });
      const thumb = b.chain(
        "thumbR",
        polyline([
          [-0.78, 1.5, 0.025],
          [-0.81, 1.52, 0.04],
          [-0.835, 1.522, 0.045],
        ]),
        { parent: hand, names: ["thumbR1", "thumbR2"], role: "digit" },
      );
      b.sweep(thumb, [0.016, 0.013], { color: steel, sides: 6, name: "thumbR" });
    }
  }

  // ---------- broadsword ----------
  const SX = -0.835;
  const SZ = 0.015;
  const sword = b.joint("sword", { parent: hands.R, at: [SX, 1.47, SZ], dir: [0, -1, 0] });
  b.sweep(
    polyline([
      [SX, 1.36, SZ],
      [SX, 1.55, SZ],
    ]),
    0.016,
    {
      bone: sword,
      sides: 6,
      caps: "flat",
      color: paint((_p, _n, s) => ((((s[0] * 12 + s[1] / 360) % 1) + 1) % 1 < 0.25 ? LEATHER_DK : LEATHER)),
      name: "grip",
    },
  );
  b.lathe(
    [
      [0, 0],
      [0.022, 0.005],
      [0.03, 0.025],
      [0.022, 0.045],
      [0, 0.05],
    ],
    { at: [SX, 1.55, SZ], segments: 8, color: gold, bone: sword, name: "pommel" },
  );
  b.extrude(
    [
      [-0.12, 0.01],
      [-0.135, 0.032, "sharp"],
      [-0.05, 0.012],
      [0, 0.02],
      [0.05, 0.012],
      [0.135, 0.032, "sharp"],
      [0.12, 0.01],
      [0.05, -0.012],
      [0, -0.026, "sharp"],
      [-0.05, -0.012],
    ],
    { at: [SX, 1.345, SZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.026, bevel: 0.005, color: gold, bone: sword, name: "crossguard" },
  );
  b.part(new THREE.SphereGeometry(0.011, 6, 4), RUBY, { at: [SX, 1.345, SZ + 0.014], bone: sword });
  const bladePaint = paint((p, _n, s) => {
    if (Math.abs(s[0]) < 0.006 && s[1] > -0.72 && s[1] < -0.03) return STEEL_DK;
    if (Math.abs(s[0]) > 0.017 && noise(p, 0.03, 31) > 0.72) return DENT;
    return scratched(mottle("#c9d0d7", STEEL, { size: 0.2, seed: 13 }), "#f2f5f8", 21);
  });
  b.extrude(
    [
      [-0.027, 0],
      [0.027, 0],
      [0.024, -0.8],
      [0, -0.95, "sharp"],
      [-0.024, -0.8],
    ],
    { at: [SX, 1.333, SZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.011, bevel: 0.004, color: bladePaint, bone: sword, name: "blade" },
  );

  // ---------- kite shield ----------
  const shieldJ = b.joint("shield", { parent: elbows.L, at: [0.62, 1.47, 0.1], dir: [0, 1, 0] });
  const kite: OutlinePoint[] = [
    [-0.28, 0.24, "sharp"],
    [0, 0.3],
    [0.28, 0.24, "sharp"],
    [0.27, -0.02],
    [0.2, -0.3],
    [0, -0.66, "sharp"],
    [-0.2, -0.3],
    [-0.27, -0.02],
  ];
  const scaleOutline = (o: OutlinePoint[], k: number): OutlinePoint[] =>
    o.map((q) => (q.length === 3 ? [q[0] * k, q[1] * k, "sharp"] : [q[0] * k, q[1] * k]) as OutlinePoint);
  const SC: [number, number, number] = [0.66, 1.48, 0.17];
  const shieldBack = b.extrude(kite, {
    at: SC,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    smoothing: 1,
    color: steel,
    bone: shieldJ,
    name: "shieldRim",
  });
  const slash = (s: number[], ax: number, ay: number, bx: number, by: number) => {
    const vx = bx - ax;
    const vy = by - ay;
    const t = Math.max(0, Math.min(1, ((s[0] - ax) * vx + (s[1] - ay) * vy) / (vx * vx + vy * vy)));
    return Math.hypot(s[0] - ax - vx * t, s[1] - ay - vy * t) < 0.005;
  };
  const shieldPaint = paint((_p, _n, s) => {
    if (slash(s, -0.2, 0.17, 0.04, -0.05) || slash(s, 0.12, 0.2, 0.2, 0.05) || slash(s, -0.06, -0.3, 0.08, -0.42)) return WOOD;
    if (s[1] > 0.17) return CRIMSON;
    if (s[1] > 0.155) return gold;
    return blueCloth;
  });
  const shieldFace = b.extrude(scaleOutline(kite, 0.87), {
    at: [SC[0], SC[1], SC[2] + 0.0195],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    smoothing: 1,
    color: shieldPaint,
    bone: shieldJ,
    name: "shieldFace",
  });
  b.decal(shieldFace, GRIFFIN, { at: shieldFace.local([0, -0.08, 0.004]), dir: [0, 0, 1], size: [0.34, 0.38], bone: shieldJ });
  const rimPts = scaleOutline(kite, 0.935).map((q) => shieldBack.local([q[0], q[1], 0.015]));
  b.along(catmull(rimPts, { closed: true }), 20, (at) =>
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { at, bone: shieldJ }),
  );
  for (const x of [0.57, 0.71])
    b.frustumBox([x, 1.47, 0.03], [x, 1.47, 0.158], [0.04, 0.018], [0.04, 0.018], { bone: shieldJ, color: LEATHER, name: "enarme" });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.12;
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.11, 0.96, 0],
        [x, 0.52, 0.03],
        [x, 0.1, 0],
        [x, 0.03, 0.2],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`], role: "leg", contact: [x, 0, 0.06] },
    );
    const [, knee, ankle] = leg.joints;
    const legTube = b.sweep(leg, [0.088, 0.08, 0.07, 0.064, 0.06, 0.055, 0.05, 0.046], {
      to: leg.ts[2],
      color: steel,
      name: `leg${S}`,
    });
    // poleyn
    const kh = b.surface(legTube).ray([x, 0.52, 0.6], [0, 0, -1]);
    if (kh) {
      b.stick(new THREE.SphereGeometry(0.066, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), steel, kh, { embed: 0.25 });
      b.stick(new THREE.ConeGeometry(0.013, 0.045, 6), GOLD, kh, { embed: -0.7 });
    }
    b.extrude(
      [
        [0, 0.055],
        [0.05, 0.035],
        [0.06, -0.01],
        [0.02, -0.055, "sharp"],
        [-0.04, -0.02],
        [-0.04, 0.035],
      ],
      { at: [x + s * 0.07, 0.52, 0.03], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, bevel: 0.003, smoothing: 1, color: gold, bone: knee, name: `kneeFan${S}` },
    );
    // tasset
    b.extrude(
      [
        [-0.09, 0, "sharp"],
        [0.09, 0, "sharp"],
        [0.085, -0.12],
        [0, -0.14],
        [-0.085, -0.12],
      ],
      {
        at: [s * 0.205, 0.975, 0],
        x: [0, 0, 1],
        y: [-s * 0.25, 1, 0],
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 1,
        color: paint((_p, _n, q) => (q[1] < -0.115 ? gold : steel)),
        bone: hips,
        name: `tasset${S}`,
      },
    );
    // sabaton with lames and spur
    b.frustumBox([x, 0.055, -0.07], [x, 0.032, 0.2], [0.1, 0.11], [0.08, 0.064], { bone: ankle, color: steel, name: `sabaton${S}` });
    for (let k = 0; k < 3; k++) {
      const z = 0.0 + 0.055 * k;
      const yt = 0.11 - (z + 0.07) * 0.17;
      b.frustumBox([x, yt - 0.01, z - 0.025], [x, yt - 0.016, z + 0.03], [0.104, 0.028], [0.09, 0.028], {
        bone: ankle,
        color: k === 0 ? gold : steel,
        name: `sabatonLame${S}${k}`,
      });
    }
    b.rod([x, 0.06, -0.07], [x, 0.066, -0.13], 0.006, { bone: ankle, color: gold, name: `spur${S}` });
    b.part(new THREE.OctahedronGeometry(0.016), GOLD, { at: [x, 0.066, -0.135], bone: ankle, flat: true });
  }

  // ---------- torn cape ----------
  const cape = b.chain(
    "cape",
    catmull([
      [0, 1.52, -0.17],
      [0, 1.12, -0.25],
      [0, 0.72, -0.29],
      [0, 0.35, -0.32],
    ]),
    { parent: chest, count: 3 },
  );
  const capeBase = mottle(CRIMSON, CRIMSON_DK, { size: 0.12, seed: 17 });
  const capePaint = paint((p, _n, s) => {
    if (s[0] < 0.035) return gold;
    if (p.y < 0.6 && noise(p, 0.06, 12) > 0.5 - (0.6 - p.y) * 0.8) return GRIME;
    return capeBase;
  });
  const N = 6;
  const lineAt = (k: number, v: number): [number, number, number] => {
    const u = k / N;
    const xt = 0.21 - 0.42 * u;
    const xb = 0.37 - 0.74 * u;
    const x = xt + (xb - xt) * v;
    const fold = (k % 2 === 1 ? -0.045 : 0) * v;
    const z = -0.165 - 0.15 * v + 0.055 * (1 - v) * Math.pow(Math.abs(xt) / 0.21, 2) + fold;
    return [x, 1.52 - 1.15 * v, z];
  };
  for (let j = 0; j < N; j++) {
    const L = 1 - R() * 0.24;
    const edge = (k: number) => catmull([0, 0.25, 0.5, 0.75, 1].map((f) => lineAt(k, f * L)));
    b.membrane(edge(j), edge(j + 1), {
      color: capePaint,
      thickness: 0.008,
      scallop: 0.06 + R() * 0.1,
      bone: cape,
      name: `cape${j}`,
    });
  }

  return b.root;
}
