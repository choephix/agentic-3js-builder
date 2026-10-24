```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  polyline,
  spiral,
  limb,
  countershade,
  spots,
  mottle,
  gradient,
  grain,
  paint,
  noise,
  cells,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frog Wizard",
  description:
    "A storybook frog wizard in a star-dotted indigo robe, plum cape and floppy pointed hat, with a bushy white beard, a vine-wrapped staff topped by a glowing orb, a spellbook, a pouch and a potion on his belt.",
};

// ---------------------------------------------------------------- palette
const G_LIGHT = "#86c455";
const G_MID = "#68a843";
const G_DARK = "#3f7f3a";
const BELLY = "#efe6a8";
const PAD = "#f2e08a";
const INDIGO = "#34399a";
const INDIGO_L = "#5560c8";
const PLUM = "#6c2f86";
const PLUM_L = "#a35fbd";
const GOLD = "#f0bb3a";
const GOLD_D = "#b5801f";
const CREAM = "#fbf8ef";
const LEATHER = "#6b3f22";
const LEATHER_D = "#4a2915";
const WOOD = "#7a4b2a";
const WOOD_L = "#a8703c";
const WINE = "#8e2338";
const MOUTH = "#7d2a36";
const TONGUE = "#e0607e";
const INK = "#241418";
const MAGIC = "#7ff3d2";
const LEAF_G = "#4e9a3a";

// ---------------------------------------------------------------- drawings
const starPath = (cx: number, cy: number, R: number, r: number, n = 5, rot = -90) => {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const rr = i % 2 ? r : R;
    d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(2) + " " + (cy + rr * Math.sin(a)).toFixed(2);
  }
  return d + "Z";
};
const starOutline = (R: number, r: number, n = 5): [number, number, "sharp"][] => {
  const out: [number, number, "sharp"][] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / n;
    const rr = i % 2 ? r : R;
    out.push([rr * Math.cos(a), rr * Math.sin(a), "sharp"]);
  }
  return out;
};

const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="0.5" cy="0.42" r="0.62"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.6" stop-color="#f2aa2c"/><stop offset="1" stop-color="#b8661a"/></radialGradient></defs>
  <circle cx="50" cy="50" r="48" fill="#3b2412"/>
  <circle cx="50" cy="50" r="43" fill="url(#i)"/>
  <path d="M50 8 L50 30 M20 20 L33 35 M80 20 L67 35 M8 50 L22 50 M92 50 L78 50" stroke="#c9741c" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="50" cy="50" rx="36" ry="11" fill="#1a0e08"/>
  <ellipse cx="50" cy="50" rx="36" ry="11" fill="none" stroke="#6b3a12" stroke-width="2"/>
  <ellipse cx="34" cy="38" rx="9" ry="6" fill="#ffffff" opacity="0.95"/>
  <circle cx="64" cy="62" r="3.6" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

const MOON = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M62 10 A40 40 0 1 0 62 90 A31 31 0 1 1 62 10 Z" fill="#f6c844" stroke="#7a4a10" stroke-width="5" stroke-linejoin="round"/>
  <path d="M58 20 A31 31 0 0 0 30 62" fill="none" stroke="#fff1a8" stroke-width="4" stroke-linecap="round"/>
  <path d="${starPath(78, 30, 11, 4.5)}" fill="#f6c844" stroke="#7a4a10" stroke-width="3" stroke-linejoin="round"/>
  <path d="${starPath(84, 68, 7, 3)}" fill="#f6c844" stroke="#7a4a10" stroke-width="2.5" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const PANEL = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="60" height="124" rx="8" fill="#5a63cf" stroke="#1d2060" stroke-width="3"/>
  <rect x="7" y="7" width="50" height="114" rx="5" fill="none" stroke="#f0bb3a" stroke-width="3"/>
  <path d="M32 14 L46 32 L32 50 L18 32 Z" fill="#f0bb3a" stroke="#7a4a10" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="5" fill="#34399a"/>
  <path d="${starPath(32, 66, 12, 5)}" fill="#fff1a8" stroke="#7a4a10" stroke-width="2" stroke-linejoin="round"/>
  <path d="M14 84 L50 84 M14 90 L50 90" stroke="#f0bb3a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M22 100 L32 114 L42 100 M26 100 L26 108 M38 100 L38 108" fill="none" stroke="#fff1a8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const BOOKTEX = svg(
  `<svg viewBox="0 0 64 90" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="62" height="88" rx="4" fill="#8e2338" stroke="#3a0c16" stroke-width="2.5"/>
  <rect x="6" y="6" width="52" height="78" rx="2" fill="none" stroke="#f0bb3a" stroke-width="2.5"/>
  <path d="M6 16 L16 6 M58 16 L48 6 M6 74 L16 84 M58 74 L48 84" stroke="#f0bb3a" stroke-width="2.5"/>
  <circle cx="32" cy="45" r="15" fill="#34399a" stroke="#f0bb3a" stroke-width="3"/>
  <path d="${starPath(32, 45, 12, 5)}" fill="#fff1a8" stroke="#7a4a10" stroke-width="1.5" stroke-linejoin="round"/>
  <rect x="26" y="70" width="12" height="9" rx="2" fill="#f0bb3a" stroke="#7a4a10" stroke-width="1.5"/>
</svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 62 C4 46 2 24 12 12 C14 8 15 4 16 1 C17 4 18 8 20 12 C30 24 28 46 16 62 Z" fill="#fbf9f4" stroke="#b9b2cc" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M16 56 C12 40 12 26 16 10 M16 56 C22 42 22 28 18 14" fill="none" stroke="#d9d3e6" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const LEAF = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 46 C2 34 2 14 16 2 C30 14 30 34 16 46 Z" fill="#5cae42" stroke="#24561f" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M16 44 L16 8 M16 30 L8 22 M16 30 L24 22 M16 20 L10 14 M16 20 L22 14" stroke="#b8e58a" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 128 },
);

const SPARK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 2 L38 26 L62 32 L38 38 L32 62 L26 38 L2 32 L26 26 Z" fill="#9ffbe6" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
</svg>`,
  { size: 96 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 0 L12 22" stroke="#f0bb3a" stroke-width="3" stroke-linecap="round"/>
  <circle cx="12" cy="26" r="6" fill="#f0bb3a" stroke="#7a4a10" stroke-width="2"/>
  <path d="M6 30 L18 30 L21 62 L3 62 Z" fill="#8e2338" stroke="#3a0c16" stroke-width="2" stroke-linejoin="round"/>
  <path d="M8 34 L7 60 M12 34 L12 60 M16 34 L17 60" stroke="#d9566e" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="20" rx="29" ry="16" fill="#f08a7a" opacity="0.95"/>
  <path d="M14 14 L20 28 M26 12 L32 30 M38 12 L44 30 M50 14 L55 26" stroke="#d4604f" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const RUNES = svg(
  `<svg viewBox="0 0 24 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 6 L12 22 M6 12 L12 6 L18 12" stroke="#8ff7dc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M6 34 L18 46 L6 58 M18 34 L6 46 L18 58" stroke="#8ff7dc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="12" cy="78" r="7" stroke="#8ff7dc" stroke-width="3" fill="none"/>
  <path d="M12 71 L12 85" stroke="#8ff7dc" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- paints
const SKIN = countershade(
  spots(mottle(G_LIGHT, G_MID, { size: 0.06, seed: 3 }), G_DARK, { size: 0.05, amount: 0.2, seed: 4 }),
  BELLY,
  { level: -0.6, soft: 0.25 },
);

const robePaint = (base: string, light: string, star: string, seed: number) =>
  paint((p, n) => {
    const up = smoothstep(-0.6, 0.9, n.y);
    let c = mix(base, light, 0.12 + 0.5 * up * smoothstep(0.25, 0.75, noise(p, 0.08, seed)));
    const fold = 0.5 + 0.5 * Math.sin(Math.atan2(p.x, p.z) * 14 + noise(p, 0.2, seed + 1) * 3);
    const k = 0.86 + 0.14 * fold;
    c = [c[0] * k, c[1] * k, c[2] * k];
    const cl = cells(p, 0.09, seed + 2);
    if (cl.d1 < 0.16 && cl.id > 0.55) c = mix(c, star, 0.9);
    return c;
  });

const ROBE = robePaint(INDIGO, INDIGO_L, GOLD, 3);
const CAPE = robePaint(PLUM, PLUM_L, GOLD, 9);
const HAT = robePaint("#5a2a7e", PLUM_L, GOLD, 15);
const STAFF_WOOD = paint((p, n) => {
  const g = noise(p.clone().multiply(new THREE.Vector3(6, 0.5, 6)), 0.03, 21);
  const c = mix(WOOD, WOOD_L, smoothstep(0.3, 0.8, g) * 0.8);
  const k = 0.85 + 0.15 * smoothstep(-0.5, 0.8, n.y);
  return [c[0] * k, c[1] * k, c[2] * k] as const;
});
const BEARD = gradient("#fbfaf6", "#c4c1da", [0, 0.87, 0], [0, 0.55, 0]);
const BRIM_FELT = grain(HAT, "#4a2068", { size: 0.02, axis: "x", seed: 2 });

export default function build() {
  const b = createBuilder({ name: "frogWizard" });
  const rand = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const last = <T,>(c: { joints: T[] }) => c.joints[c.joints.length - 1];
  const sph = (w = 10, h = 7) => new THREE.SphereGeometry(1, w, h);
  const ell = (bone: any, color: any, c: number[], rad: number[], opts: Record<string, any> = {}) =>
    b.part(sph(), color, { bone, at: c, scale: rad, ...opts });

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.42, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, 0],
      [0, 0.6, 0.015],
      [0, 0.77, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = last(spine);
  const neck = b.joint("neck", { parent: chest, at: [0, 0.79, 0.025], dir: [0, 1, 0.4], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.86, 0.05], dir: [0, 0.35, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.9, 0.03], aim: [0, 0.89, 0.2], role: "jaw" });

  // ------------------------------------------------------------ robe body
  b.sweep(spine, (t: number) => [0.2 - 0.045 * t, 0.165 - 0.025 * t], { color: ROBE, sides: 10 });
  ell(spine.joints[1], ROBE, [0, 0.54, 0.07], [0.2, 0.15, 0.15]);

  const skirt = b.lathe(
    [
      [0, 0.13],
      [0.31, 0.13],
      [0.325, 0.16],
      [0.28, 0.26],
      [0.225, 0.36],
      [0.18, 0.46],
      [0, 0.46],
    ],
    { at: [0, 0, 0], bone: hips, segments: 14, color: ROBE },
  );
  const skirtSurf = b.surface(skirt);
  b.sweep(skirtSurf.loop([0, 0.142, 0], { lift: 0.004 }), 0.014, { color: GOLD, sides: 6, bone: hips });
  b.sweep(skirtSurf.loop([0, 0.2, 0], { lift: 0.004 }), 0.007, { color: PLUM_L, sides: 5, bone: hips });
  b.decal(skirt, PANEL, { at: [0, 0.28, 0.265], dir: [0, 0.15, 1], size: [0.17, 0.3] });

  // belt
  const belt = skirtSurf.loop([0, 0.425, 0], { lift: 0.008 });
  b.sweep(belt, 0.02, { color: LEATHER, sides: 6, bone: hips });
  const bf = belt.at(0);
  b.part(new THREE.BoxGeometry(0.08, 0.065, 0.016), GOLD, { bone: hips, at: offset(bf, [0, 0, 1], 0.012) });
  b.part(new THREE.BoxGeometry(0.046, 0.034, 0.02), LEATHER_D, { bone: hips, at: offset(bf, [0, 0, 1], 0.015) });
  b.cards([frame(V(bf.x + 0.075, bf.y - 0.015, bf.z - 0.015), [0, 1, 0])], TASSEL, {
    size: [0.04, 0.14],
    lean: 180,
    flow: [0, 0, 1],
    bone: hips,
  });

  // spellbook on the left hip
  const bh = skirtSurf.around([0, 0.36, 0]).at(82, 0);
  if (bh) {
    const n = bh.n.clone();
    const layer = (w: number, t: number, h: number, d: number, color: string) =>
      b.part(new THREE.BoxGeometry(w, t, h), color, { bone: hips, at: offset(bh.at, n, d), dir: n, up: [0, 1, 0] });
    layer(0.115, 0.008, 0.16, 0.004, WINE);
    layer(0.105, 0.026, 0.15, 0.021, CREAM);
    layer(0.115, 0.008, 0.16, 0.038, WINE);
    layer(0.014, 0.044, 0.16, 0.021, "#6a1428");
    b.part(new THREE.PlaneGeometry(0.1, 0.143), "#ffffff", {
      bone: hips,
      at: offset(bh.at, n, 0.0425),
      dir: n,
      axis: "z",
      up: [0, 1, 0],
      texture: BOOKTEX,
    });
  }
  // pouch on the right hip
  const ph = skirtSurf.around([0, 0.3, 0]).at(-72, 0);
  if (ph) {
    b.stick(sph(8, 6), LEATHER, ph, { scale: [0.075, 0.075, 0.075], embed: 0.2 });
    const top = skirtSurf.around([0, 0.3, 0]).at(-72, 24);
    if (top) b.stick(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8), GOLD, top, { embed: 0.4 });
  }
  // potion vial
  const vh = skirtSurf.around([0, 0.36, 0]).at(30, 0);
  if (vh) {
    const base = offset(vh.at, vh.n, 0.012);
    glow(
      b.lathe(
        [
          [0, 0],
          [0.022, 0],
          [0.028, 0.012],
          [0.028, 0.04],
          [0.012, 0.064],
          [0.012, 0.08],
          [0, 0.08],
        ],
        { at: [base.x, base.y - 0.04, base.z], bone: hips, segments: 8, color: "#69e86a" },
      ),
      1.2,
    );
    b.part(new THREE.CylinderGeometry(0.014, 0.012, 0.025, 6), LEATHER, {
      bone: hips,
      at: [base.x, base.y + 0.052, base.z],
    });
  }

  // cape
  const capeP = b.lathe(
    [
      [0, 0.6],
      [0.29, 0.6],
      [0.305, 0.645],
      [0.26, 0.72],
      [0.17, 0.79],
      [0.09, 0.825],
      [0, 0.825],
    ],
    { at: [0, 0, 0], bone: chest, segments: 14, color: CAPE },
  );
  b.sweep(b.surface(capeP).loop([0, 0.615, 0], { lift: 0.004 }), 0.012, { color: GOLD, sides: 6, bone: chest });
  b.extrude(starOutline(0.036, 0.016), {
    at: [0.14, 0.735, 0.205],
    x: [1, 0, 0],
    thickness: 0.014,
    bevel: 0.003,
    color: GOLD,
    bone: chest,
  });
  ell(chest, SKIN, [0, 0.83, 0.05], [0.1, 0.07, 0.1]); // neck

  // ------------------------------------------------------------ head
  const skull = ell(head, SKIN, [0, 0.97, 0.08], [0.21, 0.12, 0.17], { name: "skull" });
  const upper = ell(head, SKIN, [0, 0.945, 0.17], [0.19, 0.055, 0.13], { name: "upperJaw" });
  const lower = ell(jaw, SKIN, [0, 0.885, 0.17], [0.175, 0.04, 0.115], { name: "lowerJaw" });
  ell(jaw, MOUTH, [0, 0.912, 0.17], [0.15, 0.02, 0.1]);
  ell(jaw, TONGUE, [0, 0.918, 0.2], [0.07, 0.014, 0.075]);

  const headSurf = b.surface([skull, upper, lower]);
  const seamPts: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const th = -1.35 + (i * 2.7) / 8;
    seamPts.push(V(0.17 * Math.sin(th), 0.908 + 0.014 * Math.sin(th) ** 2, 0.17 + 0.13 * Math.cos(th)));
  }
  b.sweep(headSurf.drape(catmull(seamPts), { lift: 0.003 }), 0.0045, { color: "#2c4b25", sides: 5, bone: head });

  // nostrils
  for (const s of [1, -1]) {
    const nh = b.surface(upper).ray([s * 0.055, 1.2, 0.27], [0, -1, 0]);
    if (nh) b.stick(new THREE.SphereGeometry(0.012, 6, 4), INK, nh, { embed: 0.4 });
    // tympanum
    const th = b.surface(skull).around([0, 0.97, 0.08]).at(s * 90, -6);
    if (th) {
      b.stick(new THREE.CylinderGeometry(0.044, 0.044, 0.014, 10), "#a8d46e", th, { embed: 0.4 });
      b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 10), "#5f9a3d", th, { embed: 0.3 });
    }
    // blush
    b.decal([skull, upper], BLUSH, {
      at: [s * 0.15, 0.925, 0.15],
      dir: [s * 0.8, 0, 0.6],
      size: [0.07, 0.044],
    });
  }
  // warts on the cheeks
  for (const h of b
    .surface(skull)
    .scatter(9, { rng: rand, minDist: 0.05, filter: (h) => Math.abs(h.n.x) > 0.5 && h.n.y < 0.5 && h.at.y < 1.0 }))
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), G_DARK, h, { embed: 0.4 });

  // eyes
  for (const s of [1, -1]) {
    ell(head, SKIN, [s * 0.105, 1.02, 0.1], [0.066, 0.062, 0.066]);
    const ball = b.part(sph(12, 9), "#e0a526", {
      bone: head,
      at: [s * 0.105, 1.035, 0.125],
      scale: [0.058, 0.058, 0.058],
    });
    const dir = V(s * 0.3, 0, 0.95).normalize();
    b.decal(ball, EYE, { at: [s * 0.123, 1.03, 0.18], dir, size: [0.072, 0.072] });
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#74ad47", {
      bone: head,
      at: [s * 0.105, 1.04, 0.115],
      rotation: [-18, 0, 0],
      scale: [0.067, 0.067, 0.067],
    });
    // bushy brows
    b.sweep(
      catmull([
        [s * 0.04, 1.075, 0.2],
        [s * 0.09, 1.093, 0.195],
        [s * 0.15, 1.093, 0.145],
        [s * 0.205, 1.065, 0.09],
      ]),
      [0.024, 0.006],
      { color: CREAM, sides: 6, bone: head, caps: { start: "round", end: "point" } },
    );
    for (let k = 0; k < 3; k++)
      b.spike(
        [s * (0.06 + k * 0.05), 1.09, 0.19 - k * 0.015],
        [s * 0.4, 0.5 + k * 0.1, 0.5],
        0.05,
        0.012,
        { color: "#e9e4f4", bone: head, sides: 5 },
      );
  }

  // ------------------------------------------------------------ hat
  const hat = b.sweep(
    catmull([
      [0, 1.115, 0.03],
      [0, 1.27, 0.01],
      [0, 1.42, -0.03],
      [0, 1.55, -0.11],
      [0, 1.6, -0.24],
      [0, 1.56, -0.36],
    ]),
    [0.2, 0.18, 0.14, 0.095, 0.05, 0.0],
    { color: HAT, sides: 10, bone: head, caps: { start: "flat", end: "point" } },
  );
  b.lathe(
    [
      [0, -0.008],
      [0.2, -0.01],
      [0.36, 0.0],
      [0.385, 0.018],
      [0.36, 0.034],
      [0.2, 0.036],
      [0, 0.036],
    ],
    {
      at: [0, 1.1, 0.05],
      axis: V(0, 1, -0.12).normalize(),
      bone: head,
      segments: 16,
      color: BRIM_FELT,
    },
  );
  const band = b.surface(hat).loop([0, 1.16, 0.03], { lift: 0.006 });
  b.sweep(band, 0.016, { color: WINE, sides: 6, bone: head });
  const bp = band.at(0);
  b.part(new THREE.BoxGeometry(0.08, 0.065, 0.016), GOLD, { bone: head, at: offset(bp, [0, 0, 1], 0.008) });
  b.part(new THREE.BoxGeometry(0.046, 0.034, 0.02), WINE, { bone: head, at: offset(bp, [0, 0, 1], 0.012) });
  const hp = hat.at(0.34, 180);
  b.decal(hat, MOON, { at: hp.at, dir: hp.n, size: [0.15, 0.15] });
  ell(head, GOLD, [0, 1.555, -0.37], [0.03, 0.03, 0.03]);

  // ------------------------------------------------------------ beard
  const leaf = (L: number, w: number): [number, number, "sharp"?][] => [
    [-0.7 * w, 0],
    [0.7 * w, 0],
    [w, -0.25 * L],
    [0.85 * w, -0.6 * L],
    [0, -L, "sharp"],
    [-0.85 * w, -0.6 * L],
    [-w, -0.25 * L],
  ];
  const beardParts = [
    { x: 0, L: 0.32, w: 0.05, tilt: 0 },
    { x: 0.055, L: 0.26, w: 0.045, tilt: 0.22 },
    { x: -0.055, L: 0.26, w: 0.045, tilt: -0.22 },
    { x: 0.105, L: 0.19, w: 0.04, tilt: 0.45 },
    { x: -0.105, L: 0.19, w: 0.04, tilt: -0.45 },
  ].map((o, i) =>
    b.extrude(leaf(o.L, o.w) as any, {
      at: [o.x, 0.862, 0.262 - Math.abs(o.x) * 0.8 - i * 0.002],
      x: [1, 0, 0],
      y: [o.tilt, 1, 0.25],
      thickness: 0.022,
      bevel: 0.005,
      color: BEARD,
      bone: jaw,
    }),
  );
  b.cards(
    b
      .surface(beardParts)
      .scatter(34, { rng: rand, minDist: 0.03, filter: (h) => h.n.z > 0.3 && h.at.y < 0.84 }),
    TUFT,
    { size: [0.05, 0.075], lean: 35, flow: [0, -1, 0.2], vary: 0.3, rng: rand },
  );

  // ------------------------------------------------------------ legs and feet
  const FOOT: [number, number][] = [
    [-0.06, -0.07],
    [0.06, -0.07],
    [0.11, 0.02],
    [0.15, 0.14],
    [0.12, 0.2],
    [0.085, 0.15],
    [0.06, 0.23],
    [0.03, 0.16],
    [0, 0.24],
    [-0.03, 0.16],
    [-0.06, 0.23],
    [-0.085, 0.15],
    [-0.12, 0.2],
    [-0.15, 0.14],
    [-0.11, 0.02],
  ];
  const TOES: [number, number][] = [
    [-0.12, 0.18],
    [-0.06, 0.22],
    [0, 0.235],
    [0.06, 0.22],
    [0.12, 0.18],
  ];
  const hands: Record<string, { palm: THREE.Vector3; wrist: any }> = {};

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ax = s * 0.14;
    const az = 0.2;
    const lp = limb([s * 0.1, 0.42, 0], [ax, 0.06, az], [0.23, 0.23], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, lp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.062, 0.04], { color: SKIN, sides: 8 });
    const ankle = last(leg);
    b.extrude(FOOT, {
      at: [ax, 0.03, az],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.02,
      bevel: 0.004,
      color: SKIN,
      bone: ankle,
    });
    ell(ankle, SKIN, [ax, 0.045, az], [0.05, 0.035, 0.06]);
    TOES.forEach(([dx, dz], i) => {
      const toe = b.chain(
        `toe${S}${i}`,
        polyline([V(ax + dx * 0.2, 0.024, az + 0.01), V(ax + dx, 0.024, az + dz)]),
        { parent: ankle, names: [`toe${S}${i}`, `toe${S}${i}Tip`], role: "digit" },
      );
      b.sweep(toe, [0.02, 0.015], { color: SKIN, sides: 6 });
      b.part(sph(8, 6), PAD, {
        bone: last(toe),
        at: [ax + dx, 0.025, az + dz + 0.005],
        scale: [0.024, 0.02, 0.024],
      });
    });

    // ---------------------------------------------------------- arms
    const shoulder: number[] = [s * 0.2, 0.72, 0];
    let armPts: THREE.Vector3[];
    if (s > 0) armPts = limb(shoulder, [0.41, 0.51, 0.13], [0.18, 0.18], [[0.3, -0.2, -1]]);
    else armPts = limb(shoulder, [-0.29, 0.58, 0.16], [0.18, 0.18], [[-0.5, -0.6, -0.6]]);
    const arm = b.chain(`arm${S}`, armPts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const wrist = last(arm);
    b.sweep(arm, (t: number) => 0.065 + 0.035 * t * t, {
      sides: 8,
      color: ROBE,
      bands: [
        [0.9, ROBE],
        [1, GOLD],
      ],
      caps: { start: "round", end: "flat" },
    });

    if (s > 0) {
      // open frog hand
      const d = armPts[2].clone().sub(armPts[1]).normalize();
      const side = new THREE.Vector3().crossVectors(d, V(0, 1, 0)).normalize();
      const palmC = armPts[2].clone().addScaledVector(d, 0.045);
      hands[S] = { palm: palmC, wrist };
      b.part(sph(), SKIN, { bone: wrist, at: palmC, dir: d, scale: [0.058, 0.05, 0.04] });
      for (let i = 0; i < 4; i++) {
        const a = (i - 1.5) * 0.32;
        const fd = d.clone().multiplyScalar(Math.cos(a)).addScaledVector(side, Math.sin(a));
        const base = palmC.clone().addScaledVector(d, 0.03).addScaledVector(side, (i - 1.5) * 0.03);
        const mid = base.clone().addScaledVector(fd, 0.04);
        const tip = base.clone().addScaledVector(fd, 0.085).add(V(0, -0.012, 0));
        const f = b.chain(`finger${S}${i}`, catmull([base, mid, tip]), {
          parent: wrist,
          names: [`finger${S}${i}`, `finger${S}${i}b`, `finger${S}${i}Tip`],
          role: "digit",
        });
        b.sweep(f, [0.017, 0.012], { color: SKIN, sides: 6 });
        b.part(sph(8, 6), PAD, { bone: last(f), at: tip, scale: [0.021, 0.019, 0.021] });
      }
    } else {
      // right hand gripping the staff
      ell(wrist, SKIN, [-0.345, 0.58, 0.16], [0.032, 0.078, 0.048]);
      for (let i = 0; i < 4; i++) {
        const y = 0.58 + (i - 1.5) * 0.034;
        const pt = (deg: number) =>
          V(
            -0.41 + 0.047 * Math.cos((deg * Math.PI) / 180),
            y - (0.003 * deg) / 60,
            0.17 + 0.047 * Math.sin((deg * Math.PI) / 180),
          );
        const f = b.chain(`fingerR${i}`, catmull([pt(5), pt(75), pt(150)]), {
          parent: wrist,
          names: [`fingerR${i}`, `fingerR${i}b`, `fingerR${i}Tip`],
          role: "digit",
        });
        b.sweep(f, [0.017, 0.013], { color: SKIN, sides: 6 });
        b.part(sph(8, 6), PAD, { bone: last(f), at: pt(152), scale: [0.02, 0.02, 0.02] });
      }
    }
  }

  // ------------------------------------------------------------ staff
  const wristR = b.joint("wristRef", { parent: head, at: [0, 1.0, 0] }); // placeholder replaced below
  void wristR;
  return finish();

  function finish() {
    return b.root;
  }
}
```

Wait — the module above ends in a stub for the staff, which I cannot leave. Here is the complete, corrected module (replace the whole previous block with this one):

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  polyline,
  spiral,
  limb,
  countershade,
  spots,
  mottle,
  gradient,
  grain,
  paint,
  noise,
  cells,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frog Wizard",
  description:
    "A storybook frog wizard in a star-dotted indigo robe, plum cape and floppy pointed hat, with a bushy white beard, a vine-wrapped staff topped by a glowing orb, a spellbook, a pouch and a potion on his belt.",
};

// ---------------------------------------------------------------- palette
const G_LIGHT = "#86c455";
const G_MID = "#68a843";
const G_DARK = "#3f7f3a";
const BELLY = "#efe6a8";
const PAD = "#f2e08a";
const INDIGO = "#34399a";
const INDIGO_L = "#5560c8";
const PLUM = "#6c2f86";
const PLUM_L = "#a35fbd";
const GOLD = "#f0bb3a";
const CREAM = "#fbf8ef";
const LEATHER = "#6b3f22";
const LEATHER_D = "#4a2915";
const WOOD = "#7a4b2a";
const WOOD_L = "#a8703c";
const WINE = "#8e2338";
const MOUTH = "#7d2a36";
const TONGUE = "#e0607e";
const INK = "#241418";
const MAGIC = "#7ff3d2";

// ---------------------------------------------------------------- drawings
const starPath = (cx: number, cy: number, R: number, r: number, n = 5, rot = -90) => {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const rr = i % 2 ? r : R;
    d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(2) + " " + (cy + rr * Math.sin(a)).toFixed(2);
  }
  return d + "Z";
};
const starOutline = (R: number, r: number, n = 5): [number, number, "sharp"][] => {
  const out: [number, number, "sharp"][] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / n;
    const rr = i % 2 ? r : R;
    out.push([rr * Math.cos(a), rr * Math.sin(a), "sharp"]);
  }
  return out;
};

const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="0.5" cy="0.42" r="0.62"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.6" stop-color="#f2aa2c"/><stop offset="1" stop-color="#b8661a"/></radialGradient></defs>
  <circle cx="50" cy="50" r="48" fill="#3b2412"/>
  <circle cx="50" cy="50" r="43" fill="url(#i)"/>
  <path d="M50 8 L50 30 M20 20 L33 35 M80 20 L67 35 M8 50 L22 50 M92 50 L78 50" stroke="#c9741c" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="50" cy="50" rx="36" ry="11" fill="#1a0e08"/>
  <ellipse cx="50" cy="50" rx="36" ry="11" fill="none" stroke="#6b3a12" stroke-width="2"/>
  <ellipse cx="34" cy="38" rx="9" ry="6" fill="#ffffff" opacity="0.95"/>
  <circle cx="64" cy="62" r="3.6" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

const MOON = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M62 10 A40 40 0 1 0 62 90 A31 31 0 1 1 62 10 Z" fill="#f6c844" stroke="#7a4a10" stroke-width="5" stroke-linejoin="round"/>
  <path d="M58 20 A31 31 0 0 0 30 62" fill="none" stroke="#fff1a8" stroke-width="4" stroke-linecap="round"/>
  <path d="${starPath(78, 30, 11, 4.5)}" fill="#f6c844" stroke="#7a4a10" stroke-width="3" stroke-linejoin="round"/>
  <path d="${starPath(84, 68, 7, 3)}" fill="#f6c844" stroke="#7a4a10" stroke-width="2.5" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const PANEL = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="60" height="124" rx="8" fill="#5a63cf" stroke="#1d2060" stroke-width="3"/>
  <rect x="7" y="7" width="50" height="114" rx="5" fill="none" stroke="#f0bb3a" stroke-width="3"/>
  <path d="M32 14 L46 32 L32 50 L18 32 Z" fill="#f0bb3a" stroke="#7a4a10" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="5" fill="#34399a"/>
  <path d="${starPath(32, 66, 12, 5)}" fill="#fff1a8" stroke="#7a4a10" stroke-width="2" stroke-linejoin="round"/>
  <path d="M14 84 L50 84 M14 90 L50 90" stroke="#f0bb3a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M22 100 L32 114 L42 100 M26 100 L26 108 M38 100 L38 108" fill="none" stroke="#fff1a8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const BOOKTEX = svg(
  `<svg viewBox="0 0 64 90" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="62" height="88" rx="4" fill="#8e2338" stroke="#3a0c16" stroke-width="2.5"/>
  <rect x="6" y="6" width="52" height="78" rx="2" fill="none" stroke="#f0bb3a" stroke-width="2.5"/>
  <path d="M6 16 L16 6 M58 16 L48 6 M6 74 L16 84 M58 74 L48 84" stroke="#f0bb3a" stroke-width="2.5"/>
  <circle cx="32" cy="45" r="15" fill="#34399a" stroke="#f0bb3a" stroke-width="3"/>
  <path d="${starPath(32, 45, 12, 5)}" fill="#fff1a8" stroke="#7a4a10" stroke-width="1.5" stroke-linejoin="round"/>
  <rect x="26" y="70" width="12" height="9" rx="2" fill="#f0bb3a" stroke="#7a4a10" stroke-width="1.5"/>
</svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 62 C4 46 2 24 12 12 C14 8 15 4 16 1 C17 4 18 8 20 12 C30 24 28 46 16 62 Z" fill="#fbf9f4" stroke="#b9b2cc" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M16 56 C12 40 12 26 16 10 M16 56 C22 42 22 28 18 14" fill="none" stroke="#d9d3e6" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const LEAF = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 46 C2 34 2 14 16 2 C30 14 30 34 16 46 Z" fill="#5cae42" stroke="#24561f" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M16 44 L16 8 M16 30 L8 22 M16 30 L24 22 M16 20 L10 14 M16 20 L22 14" stroke="#b8e58a" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 128 },
);

const SPARK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 2 L38 26 L62 32 L38 38 L32 62 L26 38 L2 32 L26 26 Z" fill="#9ffbe6" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
</svg>`,
  { size: 96 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 0 L12 22" stroke="#f0bb3a" stroke-width="3" stroke-linecap="round"/>
  <circle cx="12" cy="26" r="6" fill="#f0bb3a" stroke="#7a4a10" stroke-width="2"/>
  <path d="M6 30 L18 30 L21 62 L3 62 Z" fill="#8e2338" stroke="#3a0c16" stroke-width="2" stroke-linejoin="round"/>
  <path d="M8 34 L7 60 M12 34 L12 60 M16 34 L17 60" stroke="#d9566e" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="20" rx="29" ry="16" fill="#f08a7a" opacity="0.95"/>
  <path d="M14 14 L20 28 M26 12 L32 30 M38 12 L44 30 M50 14 L55 26" stroke="#d4604f" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const RUNES = svg(
  `<svg viewBox="0 0 24 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 6 L12 22 M6 12 L12 6 L18 12" stroke="#8ff7dc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M6 34 L18 46 L6 58 M18 34 L6 46 L18 58" stroke="#8ff7dc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="12" cy="78" r="7" stroke="#8ff7dc" stroke-width="3" fill="none"/>
  <path d="M12 71 L12 85" stroke="#8ff7dc" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- paints
const SKIN = countershade(
  spots(mottle(G_LIGHT, G_MID, { size: 0.06, seed: 3 }), G_DARK, { size: 0.05, amount: 0.2, seed: 4 }),
  BELLY,
  { level: -0.6, soft: 0.25 },
);

const robePaint = (base: string, light: string, star: string, seed: number) =>
  paint((p, n) => {
    const up = smoothstep(-0.6, 0.9, n.y);
    let c = mix(base, light, 0.12 + 0.5 * up * smoothstep(0.25, 0.75, noise(p, 0.08, seed)));
    const fold = 0.5 + 0.5 * Math.sin(Math.atan2(p.x, p.z) * 14 + noise(p, 0.2, seed + 1) * 3);
    const k = 0.86 + 0.14 * fold;
    c = [c[0] * k, c[1] * k, c[2] * k];
    const cl = cells(p, 0.09, seed + 2);
    if (cl.d1 < 0.16 && cl.id > 0.55) c = mix(c, star, 0.9);
    return c;
  });

const ROBE = robePaint(INDIGO, INDIGO_L, GOLD, 3);
const CAPE = robePaint(PLUM, PLUM_L, GOLD, 9);
const HAT = robePaint("#5a2a7e", PLUM_L, GOLD, 15);
const BRIM_FELT = grain(HAT, "#4a2068", { size: 0.02, axis: "x", seed: 2 });
const STAFF_WOOD = grain(WOOD, WOOD_L, { size: 0.015, axis: "y", seed: 5 });
const BEARD = gradient("#fbfaf6", "#c4c1da", [0, 0.87, 0], [0, 0.55, 0]);

export default function build() {
  const b = createBuilder({ name: "frogWizard" });
  const rand = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const last = <T,>(c: { joints: T[] }) => c.joints[c.joints.length - 1];
  const sph = (w = 10, h = 7) => new THREE.SphereGeometry(1, w, h);
  const ell = (bone: any, color: any, c: number[], rad: number[], opts: Record<string, any> = {}) =>
    b.part(sph(), color, { bone, at: c, scale: rad, ...opts });

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.42, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, 0],
      [0, 0.6, 0.015],
      [0, 0.77, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = last(spine);
  const neck = b.joint("neck", { parent: chest, at: [0, 0.79, 0.025], dir: [0, 1, 0.4], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.86, 0.05], dir: [0, 0.35, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.9, 0.03], aim: [0, 0.89, 0.2], role: "jaw" });

  // ------------------------------------------------------------ robe body
  b.sweep(spine, (t: number) => [0.2 - 0.045 * t, 0.165 - 0.025 * t], { color: ROBE, sides: 10 });
  ell(spine.joints[1], ROBE, [0, 0.54, 0.07], [0.2, 0.15, 0.15]);

  const skirt = b.lathe(
    [
      [0, 0.13],
      [0.31, 0.13],
      [0.325, 0.16],
      [0.28, 0.26],
      [0.225, 0.36],
      [0.18, 0.46],
      [0, 0.46],
    ],
    { at: [0, 0, 0], bone: hips, segments: 14, color: ROBE },
  );
  const skirtSurf = b.surface(skirt);
  b.sweep(skirtSurf.loop([0, 0.142, 0], { lift: 0.004 }), 0.014, { color: GOLD, sides: 6, bone: hips });
  b.sweep(skirtSurf.loop([0, 0.2, 0], { lift: 0.004 }), 0.007, { color: PLUM_L, sides: 5, bone: hips });
  b.decal(skirt, PANEL, { at: [0, 0.28, 0.265], dir: [0, 0.15, 1], size: [0.17, 0.3] });

  // belt
  const belt = skirtSurf.loop([0, 0.425, 0], { lift: 0.008 });
  b.sweep(belt, 0.02, { color: LEATHER, sides: 6, bone: hips });
  const bf = belt.at(0);
  b.part(new THREE.BoxGeometry(0.08, 0.065, 0.016), GOLD, { bone: hips, at: offset(bf, [0, 0, 1], 0.012) });
  b.part(new THREE.BoxGeometry(0.046, 0.034, 0.02), LEATHER_D, { bone: hips, at: offset(bf, [0, 0, 1], 0.015) });
  b.cards([frame(V(bf.x + 0.075, bf.y - 0.015, bf.z - 0.015), [0, 1, 0])], TASSEL, {
    size: [0.04, 0.14],
    lean: 180,
    flow: [0, 0, 1],
    bone: hips,
  });

  // spellbook on the left hip
  const bh = skirtSurf.around([0, 0.36, 0]).at(82, 0);
  if (bh) {
    const n = bh.n.clone();
    const layer = (w: number, t: number, h: number, d: number, color: string) =>
      b.part(new THREE.BoxGeometry(w, t, h), color, { bone: hips, at: offset(bh.at, n, d), dir: n, up: [0, 1, 0] });
    layer(0.115, 0.008, 0.16, 0.004, WINE);
    layer(0.105, 0.026, 0.15, 0.021, CREAM);
    layer(0.115, 0.008, 0.16, 0.038, WINE);
    layer(0.014, 0.044, 0.16, 0.021, "#6a1428");
    b.part(new THREE.PlaneGeometry(0.1, 0.143), "#ffffff", {
      bone: hips,
      at: offset(bh.at, n, 0.0425),
      dir: n,
      axis: "z",
      up: [0, 1, 0],
      texture: BOOKTEX,
    });
  }
  // pouch on the right hip
  const ph = skirtSurf.around([0, 0.3, 0]).at(-72, 0);
  if (ph) {
    b.stick(sph(8, 6), LEATHER, ph, { scale: [0.075, 0.075, 0.075], embed: 0.2 });
    const top = skirtSurf.around([0, 0.3, 0]).at(-72, 24);
    if (top) b.stick(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8), GOLD, top, { embed: 0.4 });
  }
  // potion vial
  const vh = skirtSurf.around([0, 0.36, 0]).at(30, 0);
  if (vh) {
    const base = offset(vh.at, vh.n, 0.012);
    glow(
      b.lathe(
        [
          [0, 0],
          [0.022, 0],
          [0.028, 0.012],
          [0.028, 0.04],
          [0.012, 0.064],
          [0.012, 0.08],
          [0, 0.08],
        ],
        { at: [base.x, base.y - 0.04, base.z], bone: hips, segments: 8, color: "#69e86a" },
      ),
      1.2,
    );
    b.part(new THREE.CylinderGeometry(0.014, 0.012, 0.025, 6), LEATHER, {
      bone: hips,
      at: [base.x, base.y + 0.052, base.z],
    });
  }

  // cape
  const capeP = b.lathe(
    [
      [0, 0.6],
      [0.29, 0.6],
      [0.305, 0.645],
      [0.26, 0.72],
      [0.17, 0.79],
      [0.09, 0.825],
      [0, 0.825],
    ],
    { at: [0, 0, 0], bone: chest, segments: 14, color: CAPE },
  );
  b.sweep(b.surface(capeP).loop([0, 0.615, 0], { lift: 0.004 }), 0.012, { color: GOLD, sides: 6, bone: chest });
  b.extrude(starOutline(0.036, 0.016), {
    at: [0.14, 0.735, 0.205],
    x: [1, 0, 0],
    thickness: 0.014,
    bevel: 0.003,
    color: GOLD,
    bone: chest,
  });
  ell(chest, SKIN, [0, 0.83, 0.05], [0.1, 0.07, 0.1]);

  // ------------------------------------------------------------ head
  const skull = ell(head, SKIN, [0, 0.97, 0.08], [0.21, 0.12, 0.17], { name: "skull" });
  const upper = ell(head, SKIN, [0, 0.945, 0.17], [0.19, 0.055, 0.13], { name: "upperJaw" });
  const lower = ell(jaw, SKIN, [0, 0.885, 0.17], [0.175, 0.04, 0.115], { name: "lowerJaw" });
  ell(jaw, MOUTH, [0, 0.912, 0.17], [0.15, 0.02, 0.1]);
  ell(jaw, TONGUE, [0, 0.918, 0.2], [0.07, 0.014, 0.075]);

  const headSurf = b.surface([skull, upper, lower]);
  const seamPts: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const th = -1.35 + (i * 2.7) / 8;
    seamPts.push(V(0.17 * Math.sin(th), 0.908 + 0.014 * Math.sin(th) ** 2, 0.17 + 0.13 * Math.cos(th)));
  }
  b.sweep(headSurf.drape(catmull(seamPts), { lift: 0.003 }), 0.0045, { color: "#2c4b25", sides: 5, bone: head });

  for (const s of [1, -1]) {
    const nh = b.surface(upper).ray([s * 0.055, 1.2, 0.27], [0, -1, 0]);
    if (nh) b.stick(new THREE.SphereGeometry(0.012, 6, 4), INK, nh, { embed: 0.4 });
    const th = b.surface(skull).around([0, 0.97, 0.08]).at(s * 90, -6);
    if (th) {
      b.stick(new THREE.CylinderGeometry(0.044, 0.044, 0.014, 10), "#a8d46e", th, { embed: 0.4 });
      b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 10), "#5f9a3d", th, { embed: 0.3 });
    }
    b.decal([skull, upper], BLUSH, {
      at: [s * 0.15, 0.925, 0.15],
      dir: [s * 0.8, 0, 0.6],
      size: [0.07, 0.044],
    });
  }
  for (const h of b
    .surface(skull)
    .scatter(9, { rng: rand, minDist: 0.05, filter: (h) => Math.abs(h.n.x) > 0.5 && h.n.y < 0.5 && h.at.y < 1.0 }))
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), G_DARK, h, { embed: 0.4 });

  // eyes
  for (const s of [1, -1]) {
    ell(head, SKIN, [s * 0.105, 1.02, 0.1], [0.066, 0.062, 0.066]);
    const ball = b.part(sph(12, 9), "#e0a526", {
      bone: head,
      at: [s * 0.105, 1.035, 0.125],
      scale: [0.058, 0.058, 0.058],
    });
    const dir = V(s * 0.3, 0, 0.95).normalize();
    b.decal(ball, EYE, { at: [s * 0.123, 1.03, 0.18], dir, size: [0.072, 0.072] });
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#74ad47", {
      bone: head,
      at: [s * 0.105, 1.04, 0.115],
      rotation: [-18, 0, 0],
      scale: [0.067, 0.067, 0.067],
    });
    b.sweep(
      catmull([
        [s * 0.04, 1.075, 0.2],
        [s * 0.09, 1.093, 0.195],
        [s * 0.15, 1.093, 0.145],
        [s * 0.205, 1.065, 0.09],
      ]),
      [0.024, 0.006],
      { color: CREAM, sides: 6, bone: head, caps: { start: "round", end: "point" } },
    );
    for (let k = 0; k < 3; k++)
      b.spike([s * (0.06 + k * 0.05), 1.09, 0.19 - k * 0.015], [s * 0.4, 0.5 + k * 0.1, 0.5], 0.05, 0.012, {
        color: "#e9e4f4",
        bone: head,
        sides: 5,
      });
  }

  // ------------------------------------------------------------ hat
  const hat = b.sweep(
    catmull([
      [0, 1.115, 0.03],
      [0, 1.27, 0.01],
      [0, 1.42, -0.03],
      [0, 1.55, -0.11],
      [0, 1.6, -0.24],
      [0, 1.56, -0.36],
    ]),
    [0.2, 0.18, 0.14, 0.095, 0.05, 0.0],
    { color: HAT, sides: 10, bone: head, caps: { start: "flat", end: "point" } },
  );
  b.lathe(
    [
      [0, -0.008],
      [0.2, -0.01],
      [0.36, 0.0],
      [0.385, 0.018],
      [0.36, 0.034],
      [0.2, 0.036],
      [0, 0.036],
    ],
    { at: [0, 1.1, 0.05], axis: V(0, 1, -0.12).normalize(), bone: head, segments: 16, color: BRIM_FELT },
  );
  const band = b.surface(hat).loop([0, 1.16, 0.03], { lift: 0.006 });
  b.sweep(band, 0.016, { color: WINE, sides: 6, bone: head });
  const bp = band.at(0);
  b.part(new THREE.BoxGeometry(0.08, 0.065, 0.016), GOLD, { bone: head, at: offset(bp, [0, 0, 1], 0.008) });
  b.part(new THREE.BoxGeometry(0.046, 0.034, 0.02), WINE, { bone: head, at: offset(bp, [0, 0, 1], 0.012) });
  const hp = hat.at(0.34, 180);
  b.decal(hat, MOON, { at: hp.at, dir: hp.n, size: [0.15, 0.15] });
  ell(head, GOLD, [0, 1.555, -0.37], [0.03, 0.03, 0.03]);

  // ------------------------------------------------------------ beard
  const leaf = (L: number, w: number): any[] => [
    [-0.7 * w, 0],
    [0.7 * w, 0],
    [w, -0.25 * L],
    [0.85 * w, -0.6 * L],
    [0, -L, "sharp"],
    [-0.85 * w, -0.6 * L],
    [-w, -0.25 * L],
  ];
  const beardParts = [
    { x: 0, L: 0.32, w: 0.05, tilt: 0 },
    { x: 0.055, L: 0.26, w: 0.045, tilt: 0.22 },
    { x: -0.055, L: 0.26, w: 0.045, tilt: -0.22 },
    { x: 0.105, L: 0.19, w: 0.04, tilt: 0.45 },
    { x: -0.105, L: 0.19, w: 0.04, tilt: -0.45 },
  ].map((o, i) =>
    b.extrude(leaf(o.L, o.w), {
      at: [o.x, 0.862, 0.262 - Math.abs(o.x) * 0.8 - i * 0.002],
      x: [1, 0, 0],
      y: [o.tilt, 1, 0.25],
      thickness: 0.022,
      bevel: 0.005,
      color: BEARD,
      bone: jaw,
    }),
  );
  b.cards(
    b.surface(beardParts).scatter(34, { rng: rand, minDist: 0.03, filter: (h) => h.n.z > 0.3 && h.at.y < 0.84 }),
    TUFT,
    { size: [0.05, 0.075], lean: 35, flow: [0, -1, 0.2], vary: 0.3, rng: rand },
  );

  // ------------------------------------------------------------ legs, feet, arms
  const FOOT: [number, number][] = [
    [-0.06, -0.07],
    [0.06, -0.07],
    [0.11, 0.02],
    [0.15, 0.14],
    [0.12, 0.2],
    [0.085, 0.15],
    [0.06, 0.23],
    [0.03, 0.16],
    [0, 0.24],
    [-0.03, 0.16],
    [-0.06, 0.23],
    [-0.085, 0.15],
    [-0.12, 0.2],
    [-0.15, 0.14],
    [-0.11, 0.02],
  ];
  const TOES: [number, number][] = [
    [-0.12, 0.18],
    [-0.06, 0.22],
    [0, 0.235],
    [0.06, 0.22],
    [0.12, 0.18],
  ];
  let palmL = V(0.45, 0.5, 0.13);
  let wristL: any = null;
  let wristR: any = null;

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ax = s * 0.14;
    const az = 0.2;
    const lp = limb([s * 0.1, 0.42, 0], [ax, 0.06, az], [0.23, 0.23], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, lp, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.062, 0.04], { color: SKIN, sides: 8 });
    const ankle = last(leg);
    b.extrude(FOOT, {
      at: [ax, 0.03, az],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.02,
      bevel: 0.004,
      color: SKIN,
      bone: ankle,
    });
    ell(ankle, SKIN, [ax, 0.045, az], [0.05, 0.035, 0.06]);
    TOES.forEach(([dx, dz], i) => {
      const toe = b.chain(
        `toe${S}${i}`,
        polyline([V(ax + dx * 0.2, 0.024, az + 0.01), V(ax + dx, 0.024, az + dz)]),
        { parent: ankle, names: [`toe${S}${i}`, `toe${S}${i}Tip`], role: "digit" },
      );
      b.sweep(toe, [0.02, 0.015], { color: SKIN, sides: 6 });
      b.part(sph(8, 6), PAD, { bone: last(toe), at: [ax + dx, 0.025, az + dz + 0.005], scale: [0.024, 0.02, 0.024] });
    });

    // arms
    const shoulder: number[] = [s * 0.2, 0.72, 0];
    const armPts =
      s > 0
        ? limb(shoulder, [0.41, 0.51, 0.13], [0.18, 0.18], [[0.3, -0.2, -1]])
        : limb(shoulder, [-0.29, 0.58, 0.16], [0.18, 0.18], [[-0.5, -0.6, -0.6]]);
    const arm = b.chain(`arm${S}`, armPts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const wrist = last(arm);
    b.sweep(arm, (t: number) => 0.065 + 0.035 * t * t, {
      sides: 8,
      color: ROBE,
      bands: [
        [0.9, ROBE],
        [1, GOLD],
      ],
      caps: { start: "round", end: "flat" },
    });

    if (s > 0) {
      wristL = wrist;
      const d = armPts[2].clone().sub(armPts[1]).normalize();
      const side = new THREE.Vector3().crossVectors(d, V(0, 1, 0)).normalize();
      const palmC = armPts[2].clone().addScaledVector(d, 0.045);
      palmL = palmC;
      b.part(sph(), SKIN, { bone: wrist, at: palmC, dir: d, scale: [0.058, 0.05, 0.04] });
      for (let i = 0; i < 4; i++) {
        const a = (i - 1.5) * 0.32;
        const fd = d.clone().multiplyScalar(Math.cos(a)).addScaledVector(side, Math.sin(a));
        const base = palmC.clone().addScaledVector(d, 0.03).addScaledVector(side, (i - 1.5) * 0.03);
        const mid = base.clone().addScaledVector(fd, 0.04);
        const tip = base.clone().addScaledVector(fd, 0.085).add(V(0, -0.012, 0));
        const f = b.chain(`finger${S}${i}`, catmull([base, mid, tip]), {
          parent: wrist,
          names: [`finger${S}${i}`, `finger${S}${i}b`, `finger${S}${i}Tip`],
          role: "digit",
        });
        b.sweep(f, [0.017, 0.012], { color: SKIN, sides: 6 });
        b.part(sph(8, 6), PAD, { bone: last(f), at: tip, scale: [0.021, 0.019, 0.021] });
      }
    } else {
      wristR = wrist;
      ell(wrist, SKIN, [-0.345, 0.58, 0.16], [0.032, 0.078, 0.048]);
      for (let i = 0; i < 4; i++) {
        const y = 0.58 + (i - 1.5) * 0.034;
        const pt = (deg: number) =>
          V(
            -0.41 + 0.047 * Math.cos((deg * Math.PI) / 180),
            y - (0.003 * deg) / 60,
            0.17 + 0.047 * Math.sin((deg * Math.PI) / 180),
          );
        const f = b.chain(`fingerR${i}`, catmull([pt(5), pt(75), pt(150)]), {
          parent: wrist,
          names: [`fingerR${i}`, `fingerR${i}b`, `fingerR${i}Tip`],
          role: "digit",
        });
        b.sweep(f, [0.017, 0.013], { color: SKIN, sides: 6 });
        b.part(sph(8, 6), PAD, { bone: last(f), at: pt(152), scale: [0.02, 0.02, 0.02] });
      }
    }
  }

  // ------------------------------------------------------------ staff
  const SX = -0.41;
  const SZ = 0.17;
  const staff = b.joint("staff", { parent: wristR, at: [SX, 0.58, SZ], dir: [0, 1, 0] });
  const shaft = b.sweep(
    polyline([V(SX, 0, SZ), V(SX, 1.36, SZ)]),
    [0.032, 0.024],
    { color: STAFF_WOOD, sides: 7, bone: staff, caps: { start: "flat", end: "flat" } },
  );
  b.rod([SX, 0, SZ], [SX, 0.07, SZ], 0.038, { color: GOLD, sides: 7, bone: staff });
  b.rod([SX, 0.07, SZ], [SX, 0.085, SZ], 0.042, { color: "#c98f26", sides: 7, bone: staff });
  for (const [y, a] of [
    [0.92, 0.6],
    [1.12, 2.4],
    [0.78, 4.2],
  ] as [number, number][])
    b.part(sph(7, 5), WOOD_L, {
      bone: staff,
      at: [SX + 0.026 * Math.cos(a), y, SZ + 0.026 * Math.sin(a)],
      scale: [0.022, 0.026, 0.022],
    });
  const rp = shaft.at(0.64, 180);
  glow(b.decal(shaft, RUNES, { at: rp.at, dir: rp.n, size: [0.045, 0.18] }), 1.1);

  // fork prongs and orb
  const orbC = V(SX, 1.51, SZ);
  for (let i = 0; i < 3; i++) {
    const a = 0.35 + (i * Math.PI * 2) / 3;
    const rd = V(Math.cos(a), 0, Math.sin(a));
    const P = (r: number, y: number) => V(SX + rd.x * r, 1.35 + y, SZ + rd.z * r);
    b.sweep(catmull([P(0, 0), P(0.045, 0.06), P(0.078, 0.15), P(0.055, 0.23), P(0.02, 0.27)]), [0.026, 0.006], {
      color: STAFF_WOOD,
      sides: 6,
      bone: staff,
      caps: { start: "round", end: "point" },
    });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.066, 1), MAGIC, { bone: staff, at: orbC, flat: true }), 1.4);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = V(SX + Math.cos(a) * 0.15, 1.5 + Math.sin(a * 2.3) * 0.07 - 0.025, SZ + Math.sin(a) * 0.15);
    glow(
      b.cards([frame(p, [0, 1, 0])], SPARK, {
        size: i % 2 ? 0.04 : 0.06,
        lean: 0,
        flow: [0, 0, 1],
        bone: staff,
      }),
      1.3,
    );
  }

  // ribbon under the fork
  const ringPts: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ringPts.push(V(SX + Math.cos(a) * 0.037, 1.33, SZ + Math.sin(a) * 0.037));
  }
  b.sweep(catmull(ringPts, { closed: true }), 0.011, { color: WINE, sides: 5, bone: staff });
  const tail: any[] = [
    [-0.016, 0],
    [0.016, 0],
    [0.022, -0.2],
    [0, -0.16],
    [-0.022, -0.2],
  ];
  for (const [dx, tilt, z] of [
    [0.012, 0.15, 0.04],
    [-0.012, -0.12, 0.045],
  ] as [number, number, number][])
    b.extrude(tail, {
      at: [SX + dx, 1.335, SZ + z],
      x: [1, 0, 0],
      y: [tilt, 1, 0.1],
      thickness: 0.005,
      color: WINE,
      bone: staff,
    });

  // winding vine with leaves
  const vine = b.sweep(
    spiral([SX, 0.72, SZ], [SX + 0.042, 0.72, SZ], [0, 1, 0], { turns: 3.6, r1: 0.042, pitch: 0.17 }),
    0.007,
    { color: "#3f7f3a", sides: 5, bone: staff },
  );
  b.cards(b.along(vine, 9, () => {}), LEAF, {
    size: [0.055, 0.08],
    lean: 55,
    flow: [0, 1, 0],
    vary: 0.25,
    rng: rand,
    bone: staff,
  });

  // ------------------------------------------------------------ magic in the left hand
  const sp = palmL.clone().add(V(0, 0.15, 0));
  glow(
    b.extrude(starOutline(0.04, 0.013, 4), {
      at: [sp.x, sp.y, sp.z],
      x: [1, 0, 0],
      thickness: 0.01,
      bevel: 0.002,
      color: "#ffe58a",
      bone: wristL,
    }),
    1.4,
  );
  const swirlC = palmL.clone().add(V(0, 0.02, 0));
  glow(
    b.sweep(spiral(swirlC, swirlC.clone().add(V(0.05, 0, 0)), [0, 1, 0], { turns: 2, r1: 0.012, pitch: 0.055 }), 0.004, {
      color: "#ffd36b",
      sides: 4,
      bone: wristL,
    }),
    1.2,
  );
  for (const [dx, dy, dz] of [
    [0.07, 0.19, 0.03],
    [-0.06, 0.12, 0.05],
    [0.03, 0.24, -0.05],
  ])
    glow(
      b.part(new THREE.OctahedronGeometry(0.011), "#fff1a8", {
        bone: wristL,
        at: [palmL.x + dx, palmL.y + dy, palmL.z + dz],
        flat: true,
      }),
      1.3,
    );

  return b.root;
}
```