```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  gradient,
  grain,
  patches,
  svg,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gray Wolf, Alert",
  description:
    "A heroic Warcraft-style gray wolf standing alert on a snowy stone plinth: heavy layered ruff and mane, amber eyes, a jointed jaw, digitigrade legs, a bushy tail, a leather collar with a glowing frost rune, a war spear with a pennant, frost crystals, bones and saplings.",
};

// ---------------------------------------------------------------- palette
const GRAY_A = "#7d838c";
const GRAY_B = "#5d636d";
const GRAY_D = "#33363d";
const TAN = "#8d7658";
const CREAM = "#d8d2c2";
const LEGD = "#4a4a4e";
const MUZ = "#b9b4a8";
const NOSE = "#16151a";
const FANG = "#f2ecda";
const TONGUE = "#c0626c";
const MOUTH = "#3a1218";
const BROW = "#2e3036";
const CLAW = "#18130f";
const PAWC = "#4d473f";
const WHISK = "#e6e2d6";
const EARIN = "#9a8584";
const LEATHER = "#5a3a22";
const LEATHER2 = "#7a5030";
const BRONZE = "#b9822f";
const BONE = "#e4dcc4";
const STEEL = "#9aa5b0";
const ICE = "#8fe3ff";
const ICE2 = "#4fb0f0";
const CLOTH = "#8a1c1c";
const PINE = "#2f5a3a";
const SNOW = "#f4f8fb";
const WOOD = "#5a3c24";

// ---------------------------------------------------------------- textures
const blade = (tip: string, mid: string, root: string, d: string) =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${root}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${tip}"/></linearGradient></defs><path d="${d}" fill="url(#g)"/><path d="M16 6 L16 58" stroke="${root}" stroke-opacity="0.35" stroke-width="1.4"/></svg>`,
    { size: 128 },
  );
const SHAPE_A = "M16 0 C21 12 29 38 27 64 L5 64 C3 38 11 12 16 0Z";
const SHAPE_B = "M16 1 L21 17 L29 12 L25 34 L32 36 L27 64 L5 64 L0 36 L7 34 L3 12 L11 17Z";
const SHAPE_C = "M16 0 C19 16 26 40 24 64 L8 64 C6 40 13 16 16 0Z";
const BLADE_A = blade("#d3d0c6", "#8d929b", "#3b3e46", SHAPE_A);
const BLADE_B = blade("#b4b8be", "#6f747d", "#2b2d33", SHAPE_B);
const BLADE_DARK = blade("#7d838c", "#4a4e57", "#23252b", SHAPE_A);
const TUFT = blade("#f7f2e4", "#e6dfcc", "#b5aa92", SHAPE_C);

const EYE = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 30 Q22 4 57 9 Q46 36 3 30Z" fill="#1a1208"/>
  <path d="M7 29 Q24 10 52 12 Q43 31 7 29Z" fill="#f0a818"/>
  <path d="M7 29 Q24 10 52 12 L52 15 Q28 15 7 29Z" fill="#a85a08"/>
  <ellipse cx="32" cy="20" rx="5" ry="5.5" fill="#0a0604"/>
  <circle cx="29.5" cy="17.5" r="2.2" fill="#ffffff"/>
  <circle cx="36" cy="23" r="1.1" fill="#fff6c8"/>
</svg>`,
  { size: 192 },
);

const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#0b1c33"/>
  <circle cx="32" cy="32" r="26" fill="none" stroke="#7fe0ff" stroke-width="3"/>
  <path d="M32 12 L32 52 M32 22 L45 33 M32 34 L44 46 M20 24 L32 33" stroke="#9af0ff" stroke-width="4" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 192 },
);

const SIGIL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="none" stroke="#d6a640" stroke-width="3"/>
  <path d="M12 52 L15 18 L25 29 L32 23 L39 29 L49 18 L52 52 L43 46 L32 58 L21 46Z" fill="#e8e0cc"/>
  <path d="M21 35 L29 38 M43 35 L35 38" stroke="#7a1414" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M29 47 L32 52 L35 47Z" fill="#2a1a12"/>
</svg>`,
  { size: 192 },
);

const FEATHER = svg(
  `<svg viewBox="0 0 16 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 0 C14 10 14 30 8 48 C2 30 2 10 8 0Z" fill="#d9d2bf"/>
  <path d="M8 0 C12 8 12 14 8 18 C4 14 4 8 8 0Z" fill="#8a1c1c"/>
  <path d="M8 4 L8 48" stroke="#6a4a2a" stroke-width="1.6"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- scale constants
const G = 0.1; // plinth height: the wolf stands at y = G
const H = 1.15; // head scale
const W = (x: number, y: number, z: number): [number, number, number] => [x, y + G, z];
const HEADP = W(0, 1.0, 0.64);
const hp = (x: number, y: number, z: number): [number, number, number] => [
  HEADP[0] + x * H,
  HEADP[1] + y * H,
  HEADP[2] + z * H,
];

type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------- paints
const coatRgb = (p: THREE.Vector3, n: THREE.Vector3): Rgb => {
  const y = p.y - G;
  let c: Rgb = mix(GRAY_A, GRAY_B, noise(p, 0.09, 3));
  const sad = smoothstep(0.35, 0.85, n.y) * (0.45 + 0.55 * noise(p, 0.12, 8));
  c = mix(c, GRAY_D, sad * 0.85);
  c = mix(c, TAN, 0.45 * smoothstep(0.55, 0.75, noise(p, 0.16, 11)) * (1 - sad));
  c = mix(c, CREAM, smoothstep(0.05, -0.55, n.y));
  if (y < 0.3) c = mix(c, LEGD, smoothstep(0.3, 0.1, y) * 0.55);
  const k = 0.82 + 0.2 * smoothstep(-0.8, 0.8, n.y);
  return [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k * 1.03, 1)];
};
const coat = paint((p, n) => coatRgb(p, n));
const faceP = paint((p, n) => {
  let c = coatRgb(p, n);
  const f = (p.z - HEADP[2]) / H;
  c = mix(c, MUZ, 0.55 * smoothstep(0.12, 0.2, f) * smoothstep(0.55, -0.1, n.y));
  c = mix(c, CREAM, smoothstep(0.1, -0.5, n.y) * smoothstep(0.08, 0.16, f));
  if (n.y > 0.5 && f > 0.1 && Math.abs(p.x) < 0.02 * H) c = mix(c, GRAY_D, 0.5);
  return c;
});
const woodP = grain("#7a5230", "#4f3320", { size: 0.012, axis: "y" });
const rockP = patches("#3b404a", ["#5b616c", "#4d535e", "#666c76", "#565c66"], { size: 0.13, gap: 0.07, seed: 4 });
const snowP = paint((p) => mix(SNOW, "#cfdbe6", noise(p, 0.16, 6)));
const mossP = paint((p) => mix("#5f7f4a", "#e8f0f4", smoothstep(0.35, 0.65, noise(p, 0.1, 4))));
const baseP = paint((_p, n) => (n.y > 0.75 ? snowP : n.y > 0.3 ? mossP : rockP));

export default function build() {
  const b = createBuilder({ name: "gray_wolf" });
  const rr = rng(7);

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: W(0, 0.8, -0.34) });
  const spine = b.chain("spine", catmull([W(0, 0.8, -0.34), W(0, 0.76, -0.02), W(0, 0.76, 0.38)]), {
    parent: hips,
    count: 3,
    role: "spine",
  });
  const neck = b.chain("neck", catmull([W(0, 0.76, 0.38), W(0, 0.9, 0.52), HEADP]), {
    parent: spine,
    count: 2,
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: HEADP, dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.03, 0.06), aim: hp(0, -0.04, 0.28), role: "jaw" });
  const NECK2 = neck.joints[1];

  // ------------------------------------------------------------ torso, neck
  const torso = b.loft(
    [
      { at: W(0, 0.76, -0.52), w: 0.14, h: 0.18 },
      { at: W(0, 0.79, -0.38), w: 0.24, h: 0.3 },
      { at: W(0, 0.77, -0.12), w: 0.22, h: 0.28 },
      { at: W(0, 0.7, 0.12), w: 0.28, h: 0.38 },
      { at: W(0, 0.7, 0.3), w: 0.33, h: 0.4 },
      { at: W(0, 0.76, 0.44), w: 0.24, h: 0.3 },
    ],
    { bone: [hips, spine], color: coat },
  );
  const neckSw = b.sweep(neck, [0.14, 0.125, 0.105], { color: coat });
  const torsoSk = b.surface(torso);

  // ------------------------------------------------------------ head
  const skullC = hp(0, 0.035, 0.07);
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), faceP, {
    bone: head,
    at: skullC,
    scale: [0.078 * H, 0.072 * H, 0.085 * H],
  });
  b.frustumBox(hp(0, 0.0, 0.14), hp(0, -0.006, 0.3), [0.12 * H, 0.09 * H], [0.07 * H, 0.06 * H], {
    bone: head,
    color: faceP,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: hp(0, 0.01, 0.31),
    scale: [0.034 * H, 0.025 * H, 0.026 * H],
  });
  // mouth interior and lower jaw
  b.frustumBox(hp(0, -0.033, 0.09), hp(0, -0.033, 0.28), [0.075 * H, 0.01 * H], [0.045 * H, 0.01 * H], {
    bone: head,
    color: MOUTH,
  });
  b.frustumBox(hp(0, -0.047, 0.07), hp(0, -0.043, 0.285), [0.085 * H, 0.04 * H], [0.05 * H, 0.03 * H], {
    bone: jaw,
    color: faceP,
  });
  b.frustumBox(hp(0, -0.034, 0.09), hp(0, -0.033, 0.25), [0.04 * H, 0.012 * H], [0.03 * H, 0.01 * H], {
    bone: jaw,
    color: TONGUE,
  });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // ears
    const ey = new THREE.Vector3(s * 0.2, 1, 0.12).normalize();
    const ex = new THREE.Vector3(1, 0, -0.3 * s);
    ex.addScaledVector(ey, -ex.dot(ey)).normalize();
    const earJ = b.joint(`ear${S}`, { parent: head, at: hp(s * 0.062, 0.085, 0.0), dir: ey });
    const earShape = (k: number): Pt[] => [
      [-0.042 * k, 0],
      [0.042 * k, 0],
      [0.033 * k, 0.075 * k],
      [0, 0.165 * k, "sharp"],
      [-0.031 * k, 0.08 * k],
    ];
    const ear = b.extrude(earShape(1.1), {
      at: hp(s * 0.062, 0.085, 0.0),
      x: ex,
      y: ey,
      thickness: 0.02,
      bevel: 0.004,
      color: coat,
      bone: earJ,
    });
    b.extrude(earShape(0.66), {
      at: ear.local([0, 0.014, 0.012]),
      x: ex,
      y: ey,
      thickness: 0.01,
      color: EARIN,
      bone: earJ,
    });
    b.extrude(earShape(0.3), {
      at: ear.local([0, 0.006, -0.012]),
      x: ex,
      y: ey,
      thickness: 0.008,
      color: GRAY_D,
      bone: earJ,
    });

    // brows
    b.part(new THREE.BoxGeometry(0.052 * H, 0.014 * H, 0.032 * H), BROW, {
      bone: head,
      at: hp(s * 0.058, 0.09, 0.1),
      rotation: [0, 0, s * 18],
    });
    // fangs
    b.part(new THREE.ConeGeometry(0.011 * H, 0.04 * H, 6), FANG, {
      bone: head,
      at: hp(s * 0.03, -0.052, 0.27),
      dir: [0, -1, 0],
    });
    b.part(new THREE.ConeGeometry(0.009 * H, 0.032 * H, 6), FANG, {
      bone: jaw,
      at: hp(s * 0.033, -0.016, 0.262),
      dir: [0, 1, 0.2],
    });
    // lips
    b.rod(hp(s * 0.058, -0.022, 0.15), hp(s * 0.037, -0.028, 0.3), 0.004, BROW, { bone: head });
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod(hp(s * 0.046, 0.0 - i * 0.008, 0.235), hp(s * 0.15, 0.015 - i * 0.025, 0.2 - i * 0.02), 0.0022, WHISK, {
        bone: head,
      });
    }
    // cheek mass
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
      bone: head,
      at: hp(s * 0.058, -0.02, 0.05),
      scale: [0.03 * H, 0.04 * H, 0.05 * H],
    });
  }

  // eyes: drawn decals on the skull
  const skullSk = b.surface(skull);
  for (const s of [1, -1]) {
    const eye = b.decal(skullSk, EYE, {
      at: hp(s * 0.058, 0.065, 0.113),
      dir: [s * 0.55, 0.12, 0.83],
      size: [0.07, 0.047],
      mirror: s < 0,
      bone: head,
    });
    glow(eye, 0.55);
  }

  // cheek ruffs
  const cheek: any[] = [];
  for (const s of [1, -1])
    for (const [az, el] of [
      [78, 8],
      [92, -12],
      [104, -30],
      [112, -5],
    ]) {
      const h = skullSk.around(skullC).at(s * az, el);
      if (h) cheek.push(h);
    }
  if (cheek.length)
    b.cards(cheek, TUFT, { size: [0.055, 0.12], lean: 72, flow: [0, -0.35, -1], bend: 20, vary: 0.2, rng: rr });

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  // ------------------------------------------------------------ ruff and mane
  const layers: { t: number; n: number; s: [number, number] }[] = [
    { t: 0.08, n: 16, s: [0.09, 0.21] },
    { t: 0.26, n: 16, s: [0.085, 0.19] },
    { t: 0.44, n: 15, s: [0.08, 0.17] },
    { t: 0.62, n: 12, s: [0.07, 0.14] },
  ];
  layers.forEach((L, i) => {
    const frames: any[] = [];
    for (let k = 0; k < L.n; k++) frames.push(neckSw.at(L.t, ((k + (i % 2) * 0.5) * 360) / L.n));
    b.cards(frames, [BLADE_A, BLADE_B], { size: L.s, lean: 58, bend: 28, vary: 0.25, spin: 10, rng: rr, sink: 0.15 });
  });
  const manes: [number, (h: any) => boolean, [number, number], any][] = [
    [60, (h) => h.n.y > 0.45 && h.at.z > 0.12, [0.1, 0.22], [BLADE_A, BLADE_B]],
    [60, (h) => h.n.y > 0.45 && h.at.z <= 0.12 && h.at.z > -0.15, [0.08, 0.17], [BLADE_A, BLADE_DARK]],
    [40, (h) => h.n.y > 0.3 && h.at.z <= -0.15, [0.07, 0.13], [BLADE_DARK, BLADE_B]],
    [90, (h) => h.n.y > -0.2 && h.n.y <= 0.45 && h.at.z > -0.3 && h.at.z < 0.3, [0.05, 0.09], [BLADE_DARK, BLADE_B]],
  ];
  manes.forEach(([count, filter, size, tex], i) => {
    const hits = torsoSk.scatter(count, { rng: rng(21 + i), minDist: 0.045, filter });
    if (hits.length) b.cards(hits, tex, { size, lean: 55, bend: 25, vary: 0.3, spin: 10, rng: rr });
  });
  const chest = torsoSk.scatter(40, {
    rng: rng(41),
    minDist: 0.04,
    filter: (h: any) => h.n.z > 0.25 && h.at.z > 0.3 && h.at.y < G + 0.66,
  });
  if (chest.length) b.cards(chest, TUFT, { size: [0.05, 0.12], lean: 75, bend: 20, vary: 0.25, rng: rr });

  // ------------------------------------------------------------ legs
  const paw = (x: number, z: number, bone: any) => {
    b.part(new THREE.BoxGeometry(0.085, 0.06, 0.13), PAWC, { bone, at: W(x, 0.03, z + 0.035), flat: true });
    for (let i = 0; i < 4; i++) {
      const ox = x + (i - 1.5) * 0.021;
      const oz = z + 0.105 + (i === 1 || i === 2 ? 0.012 : 0);
      b.part(new THREE.BoxGeometry(0.02, 0.025, 0.035), PAWC, { bone, at: W(ox, 0.0125, oz) });
      b.part(new THREE.ConeGeometry(0.0075, 0.032, 5), CLAW, { bone, at: W(ox, 0.011, oz + 0.03), dir: [0, -0.45, 1] });
    }
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // forelegs
    const fp = limb(W(s * 0.11, 0.7, 0.3), W(s * 0.115, 0.045, 0.37), [0.3, 0.28, 0.14], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const fleg = b.chain(`legF${S}`, fp, {
      parent: spine,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`],
      role: "leg",
      contact: [s * 0.115, G, 0.37],
    });
    const fsw = b.sweep(fleg, [0.075, 0.05, 0.036, 0.032], { color: coat });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: fleg.joints[0],
      at: W(s * 0.14, 0.66, 0.28),
      scale: [0.07, 0.14, 0.12],
    });
    paw(s * 0.115, 0.37, fleg.tip!);
    const ft = b.surface(fsw).scatter(8, {
      rng: rng(30 + (s > 0 ? 0 : 1)),
      minDist: 0.045,
      filter: (h: any) => h.n.z < -0.3 && h.at.y > G + 0.15,
    });
    if (ft.length) b.cards(ft, TUFT, { size: [0.04, 0.1], lean: 70, vary: 0.2, rng: rr });

    // hind legs
    const hpts = limb(W(s * 0.12, 0.76, -0.36), W(s * 0.115, 0.045, -0.46), [0.3, 0.32, 0.2], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hleg = b.chain(`legH${S}`, hpts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
      contact: [s * 0.115, G, -0.46],
    });
    const hsw = b.sweep(hleg, [0.085, 0.06, 0.04, 0.034], { color: coat });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: hleg.joints[0],
      at: W(s * 0.14, 0.7, -0.34),
      scale: [0.075, 0.16, 0.14],
    });
    paw(s * 0.115, -0.46, hleg.tip!);
    const ht = b.surface(hsw).scatter(8, {
      rng: rng(34 + (s > 0 ? 0 : 1)),
      minDist: 0.045,
      filter: (h: any) => h.n.z < -0.2 && h.at.y > G + 0.1 && h.at.y < G + 0.5,
    });
    if (ht.length) b.cards(ht, [TUFT, BLADE_B], { size: [0.045, 0.1], lean: 70, vary: 0.2, rng: rr });
  }

  // ------------------------------------------------------------ tail
  const tailPath = catmull([W(0, 0.8, -0.5), W(0, 0.72, -0.7), W(0, 0.52, -0.82), W(0, 0.34, -0.86), W(0, 0.2, -0.86)]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail" });
  const tailSw = b.sweep(tail, [0.05, 0.08, 0.09, 0.07, 0.03], {
    color: gradient(coat, "#22242a", tailPath.at(0.7), tailPath.at(1)),
  });
  const tf: any[] = [];
  for (let i = 0; i < 6; i++)
    for (let k = 0; k < 8; k++) tf.push(tailSw.at(0.15 + i * 0.15, (k + (i % 2) * 0.5) * 45));
  b.cards(tf, [BLADE_A, BLADE_DARK, BLADE_B], { size: [0.06, 0.14], lean: 62, bend: 22, vary: 0.25, rng: rr });

  // ------------------------------------------------------------ trinkets
  const collar = b.surface(neckSw).loop(neck.at(0.7), { lift: 0.03 });
  b.sweep(collar, 0.016, { color: LEATHER, bone: NECK2 });
  b.ring(neck.at(0.7), { count: 10, radius: 0.147 }, (it: any) =>
    b.stick(new THREE.ConeGeometry(0.012, 0.025, 5), BRONZE, it, { embed: 0.4 }),
  );
  for (const [a, len] of [
    [150, 0.05],
    [180, 0.075],
    [210, 0.05],
  ]) {
    const f: any = neckSw.at(0.7, a);
    const base = new THREE.Vector3().copy(f.at).addScaledVector(f.n, 0.035);
    b.part(new THREE.ConeGeometry(0.014, len, 6), BONE, {
      bone: NECK2,
      at: [base.x, base.y - len / 2, base.z],
      dir: [0, -1, 0.15],
    });
  }
  // chest medallion with glowing frost rune
  const med: any = torsoSk.ray(W(0, 0.66, 1.2), [0, 0, -1]);
  if (med) {
    const mb = med.bone ?? hips;
    b.stick(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 8), BRONZE, med, { embed: 0.2 });
    glow(
      b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
        bone: mb,
        at: med.moved([0, 0.0135, 0]),
        dir: med.n,
        axis: "z",
        up: [0, 1, 0],
        texture: RUNE,
      }),
      1.2,
    );
    const t0: any = neckSw.at(0.7, 180);
    const t1: any = neckSw.at(0.4, 180);
    const pa = new THREE.Vector3().copy(t0.at).addScaledVector(t0.n, 0.04);
    const pb = new THREE.Vector3().copy(t1.at).addScaledVector(t1.n, 0.05);
    b.sweep(catmull([pa, pb, new THREE.Vector3().copy(med.at).addScaledVector(med.n, 0.01)]), 0.007, {
      color: LEATHER2,
      bone: NECK2,
    });
  }
  // girth strap with buckle
  const girth = torsoSk.loop(W(0, 0.7, 0.14), { dir: [0, 0, 1], lift: 0.012 });
  b.sweep(girth, 0.014, { color: LEATHER });
  const bk: any = torsoSk.ray(W(0.6, 0.7, 0.14), [-1, 0, 0]);
  if (bk) {
    b.stick(new THREE.BoxGeometry(0.05, 0.012, 0.05), BRONZE, bk, { embed: 0.2 });
    b.stick(new THREE.BoxGeometry(0.03, 0.012, 0.03), LEATHER, bk.moved([0, 0.006, 0]), { embed: 0.1 });
  }
  // braid with beads and feather on the left ruff
  const br: any = neckSw.at(0.52, 270);
  const b0 = new THREE.Vector3().copy(br.at).addScaledVector(br.n, 0.06);
  const b1 = b0.clone().add(new THREE.Vector3(0.05, -0.1, -0.02));
  const b2 = b1.clone().add(new THREE.Vector3(0.03, -0.11, -0.03));
  const braid = catmull([b0, b1, b2]);
  b.sweep(braid, 0.011, { color: LEATHER2, bone: NECK2 });
  for (const t of [0.3, 0.6, 0.9]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), t > 0.8 ? BONE : BRONZE, { bone: NECK2, at: braid.at(t) });
  }
  b.cards([frame(b2, [0, 1, 0])], FEATHER, { size: [0.045, 0.14], lean: 180, flow: [0, 0, 1], bone: NECK2 });

  // ------------------------------------------------------------ plinth
  const outline: [number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const j = 0.95 + rr() * 0.09;
    outline.push([Math.cos(a) * 0.58 * j, -0.18 + Math.sin(a) * 0.92 * j]);
  }
  b.extrude(outline, {
    at: [0, G / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: G,
    bevel: 0.018,
    color: baseP,
    bone: hips,
  });
  const rocks: [number, number, number][] = [
    [0.46, -0.25, 0.08],
    [0.42, 0.3, 0.06],
    [-0.44, 0.05, 0.09],
    [-0.46, -0.28, 0.06],
    [0.26, 0.55, 0.05],
    [-0.08, 0.66, 0.05],
    [0.12, -1.0, 0.07],
  ];
  const rockCols = ["#4d535e", "#5b616c", "#666c76"];
  for (const [x, z, r] of rocks) {
    const sc: [number, number, number] = [r * (0.9 + rr() * 0.4), r * (0.7 + rr() * 0.3), r * (0.9 + rr() * 0.4)];
    b.part(new THREE.IcosahedronGeometry(1, 0), rockCols[Math.floor(rr() * 3)], {
      bone: hips,
      at: W(x, sc[1] * 0.5, z),
      scale: sc,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 7, 4), SNOW, {
      bone: hips,
      at: W(x, sc[1] * 1.15, z),
      scale: [sc[0] * 0.7, sc[1] * 0.3, sc[2] * 0.7],
    });
  }
  for (const [x, z] of [
    [0.2, 0.5],
    [-0.22, 0.58],
    [0.18, -0.2],
    [-0.2, -0.2],
  ])
    b.part(new THREE.SphereGeometry(1, 7, 4), SNOW, {
      bone: hips,
      at: W(x, 0.0, z),
      scale: [0.09, 0.025, 0.07],
    });

  // ------------------------------------------------------------ props
  // war spear with pennant
  const sBase = new THREE.Vector3(...W(0.24, 0, -0.8));
  const sTop = new THREE.Vector3(...W(0.22, 1.05, -0.82));
  const sd = sTop.clone().sub(sBase).normalize();
  const sp = (t: number) => sBase.clone().lerp(sTop, t);
  b.rod(sBase, sTop, 0.016, woodP, { bone: hips });
  const sx = new THREE.Vector3(1, 0, 0);
  sx.addScaledVector(sd, -sx.dot(sd)).normalize();
  b.extrude(
    [
      [0, 0],
      [0.035, 0.05],
      [0.025, 0.15],
      [0, 0.24, "sharp"],
      [-0.025, 0.15],
      [-0.035, 0.05],
    ] as Pt[],
    { at: sTop, x: sx, y: sd, thickness: 0.01, bevel: 0.003, color: STEEL, bone: hips },
  );
  for (const t of [0.96, 0.7, 0.2])
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 8), BRONZE, { bone: hips, at: sp(t), dir: sd });
  const a0 = sp(0.86);
  const pa0 = [a0, a0.clone().add(new THREE.Vector3(0, -0.09, 0)), a0.clone().add(new THREE.Vector3(0, -0.2, 0))];
  const pb0 = [
    a0.clone().add(new THREE.Vector3(0.2, -0.02, 0)),
    a0.clone().add(new THREE.Vector3(0.13, -0.1, 0)),
    a0.clone().add(new THREE.Vector3(0.2, -0.18, 0)),
  ];
  b.membrane(pa0, pb0, { thickness: 0.008, color: CLOTH, bone: hips });
  for (const zs of [1, -1])
    b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", {
      bone: hips,
      at: [a0.x + 0.075, a0.y - 0.095, a0.z + zs * 0.006],
      dir: [0, 0, zs],
      axis: "z",
      up: [0, 1, 0],
      texture: SIGIL,
    });
  const tassels: any[] = [];
  for (const dx of [-0.025, 0, 0.025]) tassels.push(frame(sp(0.66).add(new THREE.Vector3(dx, 0, 0.0)), [0, 1, 0]));
  b.cards(tassels, FEATHER, { size: [0.04, 0.13], lean: 180, flow: [0, 0, 1], bone: hips, vary: 0.2, rng: rr });

  // frost crystals
  const crystal = (x: number, z: number, h: number, r: number, axis: [number, number, number], col: string) =>
    glow(
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 1.05, h * 0.62],
          [0, h],
        ],
        { at: W(x, 0, z), axis, segments: 6, color: col, bone: hips },
      ),
      1.3,
    );
  crystal(-0.38, -0.58, 0.36, 0.06, [-0.12, 1, 0.05], ICE);
  crystal(-0.3, -0.5, 0.24, 0.045, [0.25, 1, 0.1], ICE2);
  crystal(-0.46, -0.5, 0.18, 0.04, [-0.3, 1, -0.1], ICE);

  // bone pile
  b.part(new THREE.SphereGeometry(1, 8, 6), BONE, { bone: hips, at: W(-0.3, 0.05, 0.42), scale: [0.07, 0.055, 0.075] });
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.06), BONE, { bone: hips, at: W(-0.3, 0.025, 0.48) });
  for (const sgn of [1, -1])
    b.part(new THREE.SphereGeometry(0.014, 6, 4), CLAW, { bone: hips, at: W(-0.3 + sgn * 0.03, 0.065, 0.485) });
  b.sweep(bezier(W(-0.42, 0, 0.3), W(-0.4, 0.16, 0.36), W(-0.3, 0.02, 0.5)), [0.014, 0.008], {
    color: BONE,
    bone: hips,
  });
  b.sweep(bezier(W(-0.38, 0, 0.26), W(-0.32, 0.14, 0.3), W(-0.22, 0.0, 0.36)), [0.013, 0.008], {
    color: BONE,
    bone: hips,
  });

  // pine saplings
  for (const [x, z, k] of [
    [0.4, -0.5, 1],
    [-0.16, -0.93, 0.8],
  ] as [number, number, number][]) {
    b.part(new THREE.CylinderGeometry(0.02 * k, 0.026 * k, 0.12 * k, 6), WOOD, { bone: hips, at: W(x, 0.06 * k, z) });
    for (let i = 0; i < 3; i++) {
      const rad = (0.14 - i * 0.035) * k;
      b.part(new THREE.ConeGeometry(rad, 0.2 * k, 7), PINE, {
        bone: hips,
        at: W(x, (0.17 + i * 0.13) * k, z),
        flat: true,
      });
      b.part(new THREE.ConeGeometry(rad * 0.6, 0.08 * k, 7), SNOW, {
        bone: hips,
        at: W(x, (0.22 + i * 0.13) * k, z),
        flat: true,
      });
    }
  }

  // sink the model's feet exactly on the floor: the plinth is the lowest geometry (y = 0)
  return b.root;
}
```