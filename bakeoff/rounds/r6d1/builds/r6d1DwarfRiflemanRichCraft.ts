import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  arc,
  limb,
  paint,
  mix,
  rgb,
  resolve,
  noise,
  smoothstep,
  mottle,
  grain,
  patches,
  stripes,
  svg,
} from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "Ironforge-style dwarf rifleman with a braided ginger beard, goggled steel helmet, oversized pauldrons and a brass-bell blunderbuss, standing on a snowy rune-ringed stone base with keg, crate and signpost.",
};

type Pt = [number, number, number] | THREE.Vector3;

// ---------------------------------------------------------------------------------------------------------------
// Paints: hand-painted look, warm light from above, cool bounce below, mud at the feet.

function tone(base: ColorInput, mud = 0): ColorInput {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const lit = smoothstep(-0.4, 0.9, n.y);
    const k = 0.72 + 0.4 * lit;
    const cool = smoothstep(0.1, -0.9, n.y) * 0.14;
    const warm = smoothstep(0.2, 0.9, n.z) * 0.05;
    let col: [number, number, number] = [
      c[0] * k * (1 - cool * 0.7 + warm),
      c[1] * k * (1 - cool * 0.2 + warm * 0.4),
      c[2] * k * (1 + cool - warm),
    ];
    if (mud > 0 && p.y < 0.17) {
      const m = mud * smoothstep(0.17, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.05, 4));
      const r = mix(col, [0.26, 0.2, 0.16], m);
      col = [r[0], r[1], r[2]];
    }
    return [Math.min(col[0], 1), Math.min(col[1], 1), Math.min(col[2], 1)];
  });
}

const BLUE = "#2d5cab";
const GOLD_HEX = "#e0a93a";
const SKIN_HEX = "#e39a70";

const GOLD_P = metal("gilt");
const BRASS_P = metal("brass", { tarnish: 0.2 });
const STEEL_P = metal("steel", { tarnish: 0.18 });
const IRON_P = metal("iron");
const BLUED_P = metal("blued");

const TUNIC_P = tone(
  paint((p, n) => {
    const weave = 0.93 + 0.07 * Math.sin(p.y * 260) * Math.sin((p.x + p.z) * 260);
    const c = mix(BLUE, "#244b8e", noise(p, 0.12, 6));
    return [c[0] * weave, c[1] * weave, c[2] * weave + 0 * n.y];
  }),
);
const SLEEVE_P = tone(mottle("#2d5cab", "#264f96", { size: 0.08, seed: 2 }));
const LEATHER_P = tone(mottle("#7a4c2a", "#5e3a1f", { size: 0.05, seed: 8 }));
const LEATHER_D_P = tone(mottle("#4a2f1b", "#37210f", { size: 0.05, seed: 9 }));
const PANTS_P = tone(mottle("#6b4a2c", "#523720", { size: 0.06, seed: 12 }), 0.7);
const BOOT_P = tone(mottle("#4b2e19", "#341f10", { size: 0.05, seed: 13 }), 0.9);
const GLOVE_P = tone(mottle("#5a3820", "#432a17", { size: 0.04, seed: 14 }));
const SKIN_P = tone(paint((p) => mix(SKIN_HEX, "#c9704f", 0.45 * noise(p, 0.07, 3))));
const NOSE_P = tone("#d9674f");
const BEARD_P = tone(grain("#c2561c", "#ef9138", { size: 0.012, axis: "y", seed: 2 }));
const BROW_P = tone(grain("#a9440f", "#d6741f", { size: 0.01, axis: "x", seed: 3 }));
const SNOW_P = tone(mottle("#f6f9ff", "#cddaee", { size: 0.14, seed: 5 }));
const ROCK = tone(mottle("#6c7487", "#98a0b3", { size: 0.08, seed: 3 }));
const ROCK_SNOW = paint((p, n) => (n.y > 0.4 + 0.2 * noise(p, 0.05, 7) ? SNOW_P : ROCK));
const COBBLE = patches("#3d4352", ["#8a92a4", "#99a1b3", "#7d8598", "#a2a9ba"], { size: 0.1, gap: 0.12, seed: 4 });
const BASE_TOP = paint((p, n) => {
  const r = Math.hypot(p.x, p.z / 1.3) + 0.05 * noise(p, 0.1, 9);
  return n.y > 0.5 && r > 0.5 ? SNOW_P : tone(COBBLE);
});
const WOOD_P = tone(grain("#8d5a2e", "#5f3a1c", { size: 0.014, axis: "y", seed: 4 }));
const WOOD_Z = tone(grain("#8d5a2e", "#5f3a1c", { size: 0.014, axis: "z", seed: 5 }));
const BEDROLL_P = tone(stripes("#7b8d58", "#3d4b2e", { size: 0.05, axis: "x", width: 0.5, seed: 6 }));
const HORN_P = paint((_p, _n, s) => mix("#efe0b8", "#35261a", smoothstep(0.55, 1, s[0])));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EMBLEM_BODY = `
  <circle cx="32" cy="32" r="30" fill="#1f4d99" stroke="#e0a93a" stroke-width="4"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="#12306b" stroke-width="2"/>
  <g transform="rotate(-38 32 32)"><rect x="29.5" y="8" width="5" height="46" rx="2" fill="#6a4326" stroke="#2a1608" stroke-width="1.5"/><rect x="20" y="8" width="24" height="11" rx="2" fill="#cfd8e8" stroke="#2a1608" stroke-width="2"/></g>
  <g transform="rotate(38 32 32)"><rect x="29.5" y="8" width="5" height="46" rx="2" fill="#6a4326" stroke="#2a1608" stroke-width="1.5"/><rect x="20" y="8" width="24" height="11" rx="2" fill="#cfd8e8" stroke="#2a1608" stroke-width="2"/></g>
  <path d="M15 27 H49 Q49 32 43 33 L39 35 L41 41 L47 45 V49 H17 V45 L23 41 L25 35 L21 33 Q15 32 15 27 Z" fill="#f1c453" stroke="#3a2410" stroke-width="2" stroke-linejoin="round"/>
  <path d="M19 29.5 H45" stroke="#fff3b8" stroke-width="2" stroke-linecap="round"/>`;

const EMBLEM = svg(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${EMBLEM_BODY}</svg>`, { size: 256 });

const TABARD = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0 H40 V52 L20 64 L0 52 Z" fill="#2a58a8" stroke="#10285a" stroke-width="2"/>
    <path d="M3.5 3.5 H36.5 V49.5 L20 60 L3.5 49.5 Z" fill="none" stroke="#e0a93a" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M7 6 V47 M33 6 V47" stroke="#1e4690" stroke-width="2"/>
    <g transform="translate(5.5 10) scale(0.47)">${EMBLEM_BODY}</g>
    <path d="M10 52 L20 59 L30 52" fill="none" stroke="#f1c453" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="e"><path d="M3 24 Q32 0 61 24 Q32 40 3 24Z"/></clipPath></defs>
    <path d="M3 24 Q32 0 61 24 Q32 40 3 24Z" fill="#f8f0de"/>
    <g clip-path="url(#e)"><circle cx="32" cy="23" r="12" fill="#2f86d6"/><circle cx="32" cy="29" r="10" fill="#7fd0ff" opacity="0.55"/><circle cx="32" cy="23" r="12" fill="none" stroke="#143a63" stroke-width="2.5"/><circle cx="32" cy="23" r="5.6" fill="#0a0e18"/><circle cx="27.5" cy="18.5" r="3.2" fill="#ffffff"/><circle cx="36" cy="27" r="1.5" fill="#ffffff"/>
    <path d="M0 14 Q32 -2 64 14 V0 H0Z" fill="#3a1d0c" opacity="0.45"/></g>
    <path d="M3 24 Q32 0 61 24" fill="none" stroke="#2a1608" stroke-width="5" stroke-linecap="round"/>
    <path d="M6 27 Q32 40 58 27" fill="none" stroke="#2a1608" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8c3410"/><stop offset="0.55" stop-color="#d1651c"/><stop offset="1" stop-color="#f7ae52"/></linearGradient></defs>
    <path d="M16 64 C3 50 7 22 17 1 C25 22 29 50 16 64Z" fill="url(#g)" stroke="#6e2a0c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M16 62 C14 44 15 24 17 6" stroke="#ffd48a" stroke-width="1.6" fill="none" opacity="0.7" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const glyph = (i: number) =>
  [
    "M0 -12 L0 12 M0 -4 L9 -12 M0 4 L9 -4",
    "M-7 -12 L7 12 M7 -12 L-7 12 M-7 0 H7",
    "M0 -12 L8 0 L0 12 L-8 0 Z M0 -4 V4",
    "M-6 -12 V12 M-6 -12 L6 -4 L-6 4 M-6 4 L6 12",
  ][i % 4];

const RUNES = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="96" fill="none" stroke="#8be9ff" stroke-width="3.5"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="#8be9ff" stroke-width="3.5"/>
    <circle cx="100" cy="100" r="64" fill="none" stroke="#4aa8e8" stroke-width="2"/>
    ${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30} 100 100)"><path transform="translate(100 17) scale(0.6)" d="${glyph(i)}" fill="none" stroke="#bff4ff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>`).join("")}
    ${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30 + 15} 100 100)"><path d="M100 6 V16" stroke="#4aa8e8" stroke-width="3"/></g>`).join("")}
  </svg>`,
  { size: 512 },
);

const LABEL = svg(
  `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="76" height="56" rx="6" fill="#ead9a6" stroke="#4a2c12" stroke-width="3"/>
    <text x="40" y="26" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" fill="#8e1d12">POWDER</text>
    <circle cx="40" cy="43" r="8" fill="#1b1410"/><path d="M40 35 Q44 30 48 31" stroke="#6a4326" stroke-width="2" fill="none"/><circle cx="49" cy="30" r="2.4" fill="#ff9a2a"/>
    <path d="M10 14 H70" stroke="#4a2c12" stroke-width="1.5"/>
  </svg>`,
  { size: 256 },
);

const SIGN = svg(
  `<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
    <text x="61" y="22" text-anchor="middle" font-family="serif" font-weight="bold" font-size="17" fill="#2a1608">IRONFORGE</text>
    <text x="60" y="21" text-anchor="middle" font-family="serif" font-weight="bold" font-size="17" fill="#f2d488">IRONFORGE</text>
  </svg>`,
  { size: 384 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });
  type J = ReturnType<typeof b.joint>;
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- helpers
  const blob = (color: ColorInput, at: Pt, bone: J, r: [number, number, number], opts: Record<string, any> = {}) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, { at, bone, scale: r, flat: true, ...opts });
  const box = (color: ColorInput, size: [number, number, number], at: Pt, bone: J, opts: Record<string, any> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone, ...opts });
  const torus = (color: ColorInput, Rr: number, r: number, at: Pt, dir: Pt, bone: J, opts: Record<string, any> = {}) =>
    b.part(new THREE.TorusGeometry(Rr, r, 5, 14), color, { at, dir, axis: "z", bone, ...opts });
  const cyl = (color: ColorInput, a: Pt, c: Pt, r0: number, r1: number, bone: J) =>
    b.rod(a, c, [r0, r1], color, { bone, sides: 8, smooth: false });

  // ---- skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.52, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.6, 0.01], aim: [0, 0.85, 0.03], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [0, 0.85, 0.03], aim: [0, 1.05, 0.04], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.05, 0.04], aim: [0, 1.12, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.12, 0.05], aim: [0, 1.3, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.11, 0.07], aim: [0, 1.09, 0.2], role: "jaw" });

  // ---- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.12, 0.5, 0], [s * 0.14, 0.13, 0.0], [0.22, 0.21], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.14, 0, 0.06],
    });
    b.sweep(leg, [0.098, 0.082, 0.072], {
      bands: [
        [0.55, PANTS_P],
        [1, BOOT_P],
      ],
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const ds = ankle.at.clone().sub(knee.at).normalize();
    const top = ankle.at.clone().addScaledVector(ds, -0.14);
    cyl(BOOT_P, top, ankle.at.clone().addScaledVector(ds, 0.02), 0.092, 0.08, knee);
    cyl(LEATHER_P, top.clone().addScaledVector(ds, -0.005), top.clone().addScaledVector(ds, 0.045), 0.1, 0.098, knee);
    torus(GOLD_P, 0.099, 0.008, top.clone().addScaledVector(ds, 0.047), ds, knee);
    // knee guard
    blob(STEEL_P, knee.at.clone().add(V(0, 0.0, 0.085)), knee, [0.06, 0.055, 0.04]);
    torus(GOLD_P, 0.045, 0.007, knee.at.clone().add(V(0, 0, 0.1)), [0, 0, 1], knee);
    // foot
    const fx = s * 0.14;
    box(BOOT_P, [0.125, 0.085, 0.22], [fx, 0.075, 0.045], ankle);
    box(IRON_P, [0.14, 0.04, 0.27], [fx, 0.018, 0.06], ankle);
    blob(BOOT_P, [fx, 0.07, 0.15], ankle, [0.066, 0.05, 0.072]);
    box(LEATHER_P, [0.13, 0.016, 0.045], [fx, 0.125, 0.06], ankle);
    box(GOLD_P, [0.04, 0.02, 0.012], [fx, 0.128, 0.085], ankle);
  }

  // ---- torso
  box(PANTS_P, [0.34, 0.14, 0.26], [0, 0.54, 0], hips);
  const bellyP = blob(TUNIC_P, [0, 0.72, 0.06], spine, [0.24, 0.19, 0.21]);
  const chestP = blob(TUNIC_P, [0, 0.93, 0.02], chest, [0.27, 0.2, 0.2]);
  blob(SKIN_P, [0, 1.07, 0.04], neck, [0.1, 0.06, 0.09]);
  torus(LEATHER_P, 0.1, 0.018, [0, 1.095, 0.04], [0, 1, 0], neck, { scale: [1, 1, 1] });

  // belt
  const bellySurf = b.surface(bellyP);
  const beltPath = bellySurf.loop([0, 0.62, 0.06], { dir: [0, 1, 0], lift: 0.01 });
  b.sweep(beltPath, () => [0.012, 0.032], { section: "box", color: LEATHER_D_P, bone: spine });
  const buckleHit = bellySurf.ray([0, 0.62, 1], [0, 0, -1]);
  if (buckleHit) {
    b.stick(new THREE.BoxGeometry(0.1, 0.016, 0.08), GOLD_P, buckleHit, { embed: 0.3, bone: spine });
    b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
      at: buckleHit.moved([0, 0.012, 0]),
      dir: buckleHit.axis,
      axis: "z",
      texture: EMBLEM,
      bone: spine,
    });
  }

  // tabard front and back
  b.part(new THREE.PlaneGeometry(0.2, 0.32), "#ffffff", {
    at: [0, 0.46, 0.215],
    dir: [0, -0.18, 1],
    axis: "z",
    bone: hips,
    texture: TABARD,
  });
  b.part(new THREE.PlaneGeometry(0.22, 0.3), "#ffffff", {
    at: [0, 0.46, -0.185],
    dir: [0, -0.18, -1],
    axis: "z",
    bone: hips,
    texture: TABARD,
  });

  // bandolier + pack straps draped on the torso
  const torso = b.surface([chestP, bellyP]);
  const bandPath = torso.drape(
    catmull([
      [0.17, 1.1, 0.0],
      [0.12, 1.0, 0.2],
      [-0.04, 0.86, 0.29],
      [-0.22, 0.66, 0.2],
    ]),
    { lift: 0.012 },
  );
  b.sweep(bandPath, () => [0.026, 0.012], { section: "box", color: LEATHER_P, bone: chest });
  for (let i = 0; i < 6; i++) {
    const hit = torso.nearest(bandPath.at((i + 0.5) / 6));
    b.stick(new THREE.BoxGeometry(0.034, 0.024, 0.05), LEATHER_D_P, hit, { embed: 0.2, bone: chest });
    const shell = b.stick(new THREE.CylinderGeometry(0.009, 0.009, 0.03, 6), BRASS_P, hit.moved([0, 0.02, 0]), {
      bone: chest,
    });
    glow(b.part(new THREE.SphereGeometry(0.0, 3, 2), "#000000", { at: shell.at, bone: chest }), 0);
  }
  for (const s of [1, -1]) {
    const strapPath = torso.drape(
      catmull([
        [s * 0.13, 1.0, -0.2],
        [s * 0.16, 1.12, -0.02],
        [s * 0.14, 1.0, 0.17],
        [s * 0.11, 0.84, 0.22],
      ]),
      { lift: 0.01 },
    );
    b.sweep(strapPath, () => [0.022, 0.009], { section: "box", color: LEATHER_D_P, bone: chest });
  }

  // ---- pack
  box(LEATHER_P, [0.3, 0.34, 0.14], [0, 0.9, -0.25], chest);
  box(LEATHER_D_P, [0.31, 0.14, 0.15], [0, 1.03, -0.255], chest);
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    at: [0, 1.03, -0.335],
    dir: [0, 0, -1],
    axis: "z",
    bone: chest,
    texture: EMBLEM,
  });
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.36, 10), BEDROLL_P, {
    at: [0, 1.14, -0.25],
    dir: [1, 0, 0],
    bone: chest,
    flat: true,
  });
  for (const x of [-0.11, 0.11]) torus(LEATHER_D_P, 0.067, 0.008, [x, 1.14, -0.25], [1, 0, 0], chest);
  for (const x of [-0.1, 0.1]) box(BRASS_P, [0.025, 0.03, 0.01], [x, 0.98, -0.33], chest);
  b.part(new THREE.CylinderGeometry(0.036, 0.03, 0.065, 8), STEEL_P, { at: [0.17, 0.82, -0.34], bone: chest });
  torus(LEATHER_D_P, 0.04, 0.007, [0.17, 0.87, -0.34], [0, 1, 0], chest);
  torus(
    tone("#b79b63"),
    0.05,
    0.014,
    [-0.16, 0.8, -0.34],
    [0, 0, 1],
    chest,
  );

  // hip gear: powder horn and pouch
  const hornPath = bezier(V(0.22, 0.65, -0.03), V(0.28, 0.6, -0.14), V(0.27, 0.5, -0.24), V(0.2, 0.44, -0.3));
  b.sweep(hornPath, [0.036, 0.008], { color: HORN_P, bone: hips, sides: 8, smooth: false });
  b.part(new THREE.CylinderGeometry(0.04, 0.038, 0.03, 8), BRASS_P, {
    at: [0.22, 0.655, -0.032],
    dir: [-0.15, 0.9, 0.3],
    bone: hips,
  });
  torus(LEATHER_P, 0.04, 0.006, [0.23, 0.63, -0.05], [-0.2, 0.9, 0.35], hips);
  box(LEATHER_P, [0.1, 0.12, 0.06], [-0.2, 0.55, -0.12], hips);
  box(LEATHER_D_P, [0.105, 0.05, 0.065], [-0.2, 0.6, -0.12], hips);
  b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD_P, { at: [-0.2, 0.595, -0.087], bone: hips });

  // ---- arms
  const H = V(-0.36, 0.8, 0.3);
  const F = V(0, 0.64, 0.77).normalize();
  const SIDE = V(1, 0, 0);
  const UP = new THREE.Vector3().crossVectors(F, SIDE).normalize();
  const gp = (a: number, u = 0, s = 0) =>
    H.clone().addScaledVector(F, a).addScaledVector(UP, u).addScaledVector(SIDE, s);

  const armChains = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const target: [number, number, number] = s > 0 ? [0.43, 0.62, 0.06] : [H.x, H.y, H.z];
    const bend: [number, number, number] = s > 0 ? [0, -0.2, -1] : [-0.3, -0.5, -1];
    const pts = limb([s * 0.3, 1.0, 0], target, [0.22, 0.21], [bend]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.078, 0.068, 0.06, 0.056], {
      bands: [
        [0.5, SLEEVE_P],
        [1, GLOVE_P],
      ],
    });
    const sh = arm.joints[0];
    const el = arm.joints[1];
    const wr = arm.joints[2];
    // pauldron
    const tilt = -s * 22;
    blob(SLEEVE_P, sh.at.clone().add(V(s * 0.04, 0.07, 0)), sh, [0.135, 0.085, 0.145], {
      rotation: [0, 0, tilt],
    });
    blob(STEEL_P, sh.at.clone().add(V(s * 0.065, 0.03, 0)), sh, [0.14, 0.045, 0.15], { rotation: [0, 0, tilt] });
    torus(GOLD_P, 0.135, 0.01, sh.at.clone().add(V(s * 0.065, 0.045, 0)), [s * 0.37, 0.93, 0], sh, {
      scale: [1, 1.1, 1],
    });
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.55;
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD_P, {
        at: sh.at.clone().add(V(s * (0.04 + 0.05 * Math.cos(a)) , 0.15 - 0.012 * Math.abs(a) - 0.03 * s * 0 , 0.1 * Math.sin(a))),
        bone: sh,
      });
    }
    glow(
      b.part(new THREE.OctahedronGeometry(0.02, 0), "#6fe3ff", {
        at: sh.at.clone().add(V(s * 0.05, 0.15, 0.0)),
        bone: sh,
        flat: true,
      }),
      1.4,
    );
    // forearm bracer
    const fd = wr.at.clone().sub(el.at).normalize();
    cyl(STEEL_P, el.at.clone().addScaledVector(fd, 0.06), wr.at.clone().addScaledVector(fd, -0.02), 0.062, 0.058, el);
    torus(GOLD_P, 0.06, 0.008, wr.at.clone().addScaledVector(fd, -0.02), fd, el);
    torus(GOLD_P, 0.064, 0.008, el.at.clone().addScaledVector(fd, 0.06), fd, el);
    blob(SLEEVE_P, el.at, el, [0.062, 0.062, 0.062]);
    return { arm, side, s, fd, el, wr };
  });

  // left hand: relaxed open fingerless glove, fingers separated
  {
    const { wr, fd, s } = armChains[0];
    const w = wr.at.clone();
    b.part(new THREE.BoxGeometry(0.055, 0.085, 0.1), GLOVE_P, { at: w.clone().addScaledVector(fd, 0.05), dir: fd, bone: wr });
    const inward = V(-s, 0, 0);
    ["index", "middle", "ring", "pinky"].forEach((nm, i) => {
      const off = (1.5 - i) * 0.03;
      const K = w.clone().addScaledVector(fd, 0.09).add(V(0, 0, off));
      const K1 = K.clone().addScaledVector(fd, 0.04).addScaledVector(inward, 0.004).add(V(0, 0, off * 0.2));
      const K2 = K1.clone().addScaledVector(fd, 0.03).addScaledVector(inward, 0.022).add(V(0, 0, off * 0.2));
      const ch = b.chain(`${nm}L`, catmull([K, K1, K2]), {
        parent: wr,
        names: [`${nm}L1`, `${nm}L2`],
        role: "digit",
      });
      b.sweep(ch, [0.0145, 0.011, 0.0085], { color: SKIN_P });
      blob(SKIN_P, K, wr, [0.016, 0.016, 0.016]);
    });
    const T = w.clone().addScaledVector(fd, 0.05).addScaledVector(inward, 0.032).add(V(0, 0, 0.05));
    const th = b.chain("thumbL", catmull([T, T.clone().add(V(0, -0.01, 0.035)), T.clone().add(V(-s * 0.012, -0.02, 0.07))]), {
      parent: wr,
      names: ["thumbL1", "thumbL2"],
      role: "digit",
    });
    b.sweep(th, [0.017, 0.013, 0.01], { color: SKIN_P });
  }

  // right hand: gripping the blunderbuss wrist
  {
    const { wr } = armChains[1];
    box(GLOVE_P, [0.075, 0.034, 0.12], gp(0.015, 0.05, 0), wr, { dir: F, axis: "z", up: UP });
    const rg = 0.034;
    [0, 1, 2, 3].forEach((i) => {
      const off = (1.5 - i) * 0.03 + 0.015;
      const C = H.clone().addScaledVector(F, off);
      const S = C.clone().addScaledVector(UP, rg);
      const ch = b.chain(`fingerR${i + 1}`, arc(C, S, F, 250), {
        parent: wr,
        names: [`fingerR${i + 1}a`, `fingerR${i + 1}b`, `fingerR${i + 1}c`],
        role: "digit",
      });
      b.sweep(ch, [0.0125, 0.0105, 0.009], { color: SKIN_P });
      blob(SKIN_P, S, wr, [0.015, 0.015, 0.015]);
    });
    const T0 = gp(-0.04, 0.05, 0.028);
    const th = b.chain(
      "thumbR",
      catmull([T0, T0.clone().addScaledVector(F, 0.04).addScaledVector(UP, 0.012), T0.clone().addScaledVector(F, 0.075).addScaledVector(SIDE, 0.01)]),
      { parent: wr, names: ["thumbR1", "thumbR2"], role: "digit" },
    );
    b.sweep(th, [0.017, 0.013, 0.01], { color: SKIN_P });
  }

  // ---- the blunderbuss
  const wristR = armChains[1].wr;
  const gbox = (w: number, h: number, l: number, color: ColorInput, a: number, u = 0, s = 0) =>
    b.part(new THREE.BoxGeometry(w, h, l), color, { at: gp(a, u, s), dir: F, axis: "z", up: UP, bone: wristR });
  const WOOD_G = tone(grain("#8d5a2e", "#5f3a1c", { size: 0.014, axis: [0, 0.64, 0.77], seed: 4 }));
  gbox(0.05, 0.07, 0.26, WOOD_G, -0.12, -0.01);
  gbox(0.052, 0.115, 0.05, WOOD_G, -0.265, -0.03);
  gbox(0.056, 0.12, 0.012, BRASS_P, -0.292, -0.03);
  gbox(0.044, 0.03, 0.12, WOOD_G, -0.18, 0.05);
  gbox(0.045, 0.065, 0.1, WOOD_G, 0.02, -0.01);
  gbox(0.058, 0.05, 0.3, WOOD_G, 0.2, -0.035);
  gbox(0.062, 0.056, 0.02, BRASS_P, 0.355, -0.035);
  gbox(0.02, 0.006, 0.1, BRASS_P, -0.07, 0.038);
  // barrel and flared bell
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.034, 0.04],
      [0.028, 0.07],
      [0.024, 0.12],
      [0.024, 0.42],
      [0.03, 0.46],
      [0, 0.46],
    ] as [number, number][],
    { at: gp(-0.05, 0.03), axis: F, segments: 10, color: BLUED_P, bone: wristR },
  );
  const BELL = paint((p, n, s) => {
    if (n.dot(F) > 0.2 && s[0] < 0.178) return "#14100c";
    return resolve(BRASS_P, p, n);
  });
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.036, 0.04],
      [0.056, 0.1],
      [0.088, 0.18],
      [0.075, 0.18],
      [0.051, 0.12],
      [0, 0.12],
    ] as [number, number][],
    { at: gp(0.4, 0.03), axis: F, segments: 10, color: BELL, bone: wristR },
  );
  torus(GOLD_P, 0.04, 0.007, gp(0.405, 0.03), F, wristR);
  for (const [a, r] of [
    [0.1, 0.036],
    [0.24, 0.03],
    [0.37, 0.03],
  ]) {
    torus(GOLD_P, r, 0.0065, gp(a, 0.03), F, wristR);
  }
  // flintlock on the inner side
  gbox(0.012, 0.04, 0.09, STEEL_P, 0.0, 0.02, 0.03);
  gbox(0.012, 0.05, 0.016, IRON_P, -0.035, 0.07, 0.032);
  gbox(0.014, 0.02, 0.02, BRASS_P, -0.015, 0.1, 0.032);
  gbox(0.014, 0.012, 0.03, BRASS_P, 0.025, 0.047, 0.034);
  gbox(0.01, 0.05, 0.016, IRON_P, 0.05, 0.075, 0.032);
  glow(
    b.part(new THREE.IcosahedronGeometry(0.008, 0), "#ffb03a", { at: gp(0.03, 0.058, 0.036), bone: wristR }),
    2,
  );
  // trigger guard + trigger
  b.part(new THREE.TorusGeometry(0.032, 0.005, 5, 10, Math.PI), BRASS_P, {
    at: gp(-0.02, -0.04),
    dir: SIDE,
    axis: "z",
    up: UP.clone().negate(),
    bone: wristR,
  });
  gbox(0.006, 0.02, 0.008, IRON_P, -0.03, -0.035);
  // ramrod, pipes
  b.rod(gp(0.04, -0.075), gp(0.42, -0.075), 0.007, WOOD_G, { bone: wristR, sides: 6 });
  b.part(new THREE.SphereGeometry(0.011, 6, 4), BRASS_P, { at: gp(0.425, -0.075), bone: wristR });
  for (const a of [0.12, 0.28]) gbox(0.026, 0.02, 0.02, BRASS_P, a, -0.068);
  torus(IRON_P, 0.014, 0.004, gp(-0.2, -0.065), SIDE, wristR);

  // ---- head
  const HC = V(0, 1.17, 0.04);
  const skull = blob(SKIN_P, HC, head, [0.15, 0.135, 0.145], { flat: false });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 26, -4);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.072, 0.045], segments: 8 });
    // bushy brow
    blob(BROW_P, [s * 0.062, 1.205, 0.172], head, [0.06, 0.022, 0.034], { rotation: [0, 0, s * 20] });
    blob(BROW_P, [s * 0.1, 1.212, 0.15], head, [0.04, 0.02, 0.03], { rotation: [0, 0, s * 28] });
    // cheek, ear
    blob(tone("#e5896c"), [s * 0.112, 1.098, 0.13], head, [0.04, 0.03, 0.03]);
    blob(SKIN_P, [s * 0.15, 1.17, 0.03], head, [0.025, 0.055, 0.035], { rotation: [0, 0, -s * 12] });
    // sideburn / hair under the helmet
    blob(BEARD_P, [s * 0.138, 1.14, -0.01], head, [0.045, 0.085, 0.075]);
    // mustache curl
    b.sweep(
      catmull([
        [s * 0.01, 1.1, 0.19],
        [s * 0.06, 1.085, 0.205],
        [s * 0.12, 1.078, 0.175],
        [s * 0.165, 1.105, 0.115],
      ]),
      [0.034, 0.012],
      { color: BEARD_P, bone: head, sides: 8, smooth: false, caps: { end: "point" } },
    );
  }
  blob(NOSE_P, [0, 1.128, 0.2], head, [0.04, 0.045, 0.043]);
  for (const s of [1, -1]) blob(tone("#c85c46"), [s * 0.02, 1.115, 0.235], head, [0.016, 0.012, 0.012]);
  blob(BEARD_P, [0, 1.15, -0.1], head, [0.12, 0.09, 0.06]);
  blob(SKIN_P, [0, 1.085, 0.12], jaw, [0.095, 0.045, 0.085]);

  // beard mass
  const B1 = blob(BEARD_P, [0, 1.06, 0.12], jaw, [0.14, 0.1, 0.115]);
  const B2 = blob(BEARD_P, [0, 0.97, 0.19], head, [0.125, 0.11, 0.08]);
  const B3 = blob(BEARD_P, [0, 0.86, 0.225], head, [0.1, 0.11, 0.07]);
  const B4 = blob(BEARD_P, [0, 0.77, 0.25], head, [0.065, 0.1, 0.05]);
  const beardSurf = b.surface([B1, B2, B3, B4]);
  const hits = beardSurf.scatter(90, {
    rng: rng(5),
    minDist: 0.035,
    filter: (h) => h.n.z > -0.1 && h.at.y < 1.05,
  });
  b.cards(hits, TUFT, {
    size: [0.045, 0.09],
    lean: 50,
    flow: [0, -1, 0.15],
    bend: 20,
    vary: 0.3,
    spin: 20,
    rng: rng(6),
  });

  // braids
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.1, 1.0, 0.2],
      [s * 0.15, 0.9, 0.255],
      [s * 0.15, 0.78, 0.3],
      [s * 0.12, 0.65, 0.3],
    ]);
    const bc = b.chain(`braid${side}`, path, {
      parent: head,
      names: [`braid${side}1`, `braid${side}2`, `braid${side}3`],
      role: "tail",
    });
    const n = 10;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const p = path.at(t);
      const r = 0.03 - 0.012 * t;
      blob(BEARD_P, p, bc.nearestJoint(p), [r * 1.35, r * 0.85, r], {
        rotation: [0, 0, (i % 2 ? 1 : -1) * 38],
      });
    }
    for (const t of [0.35, 0.97]) {
      const p = path.at(t);
      torus(GOLD_P, t < 0.5 ? 0.03 : 0.02, 0.007, p, path.tangentAt(t), bc.nearestJoint(p));
    }
    const tip = path.at(1);
    b.spike(tip, [0, -1, 0.05], 0.07, 0.022, { color: BEARD_P, bone: bc.joints[2] });
    blob(GOLD_P, tip.clone().add(V(0, -0.005, 0)), bc.joints[2], [0.014, 0.014, 0.014]);
  }
  // beard bead and gold ring in the centre
  torus(GOLD_P, 0.07, 0.01, [0, 0.93, 0.25], [0, 0.2, 1], head, { scale: [1, 0.7, 1] });
  glow(b.part(new THREE.OctahedronGeometry(0.014, 0), "#6fe3ff", { at: [0, 0.93, 0.325], bone: head, flat: true }), 1.2);

  // brow tufts
  for (const s of [1, -1]) {
    const hs = beardSurf.scatter(0, {});
    void hs;
  }

  // ---- helmet
  const HB = V(0, 1.23, 0.035);
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.172, 0.03],
      [0.16, 0.085],
      [0.12, 0.14],
      [0.06, 0.18],
      [0, 0.195],
    ] as [number, number][],
    { at: HB, axis: [0, 1, 0], segments: 12, color: STEEL_P, bone: head },
  );
  torus(GOLD_P, 0.171, 0.012, HB.clone().add(V(0, 0.005, 0)), [0, 1, 0], head);
  b.ring(frame([0, 1.236, 0.035], [0, 1, 0]), { count: 10, radius: 0.175 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), GOLD_P, it, { bone: head, embed: 0.4 }),
  );
  b.extrude(
    [
      [0.186, 0.01],
      [0.186, 0.03],
      [0.173, 0.088],
      [0.132, 0.15],
      [0.07, 0.192],
      [0, 0.207],
      [-0.07, 0.192],
      [-0.132, 0.15],
      [-0.173, 0.088],
      [-0.186, 0.03],
      [-0.186, 0.01],
    ] as [number, number][],
    { at: HB, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.024, bevel: 0.005, color: BRASS_P, bone: head },
  );
  b.part(new THREE.ConeGeometry(0.016, 0.05, 6), GOLD_P, { at: HB.clone().add(V(0, 0.225, 0)), bone: head, flat: true });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.08, 0],
        [-0.1, 0],
        [-0.09, -0.09],
        [-0.02, -0.125],
        [0.06, -0.07],
      ] as [number, number][],
      {
        at: [s * 0.163, 1.236, 0.02],
        x: [0, 0, 1],
        y: [s * 0.25, 1, 0],
        thickness: 0.014,
        bevel: 0.003,
        color: STEEL_P,
        bone: head,
      },
    );
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD_P, { at: [s * 0.172, 1.2, 0.03], bone: head });
  }
  // goggles pushed up
  torus(LEATHER_D_P, 0.166, 0.012, [0, 1.31, 0.035], [0, 1, 0], head);
  const gN = V(0, 0.55, 0.83).normalize();
  for (const s of [1, -1]) {
    const gc = V(s * 0.056, 1.345, 0.185);
    b.part(new THREE.CylinderGeometry(0.04, 0.042, 0.035, 10), BRASS_P, { at: gc, dir: gN, bone: head, flat: true });
    torus(GOLD_P, 0.04, 0.008, gc.clone().addScaledVector(gN, 0.02), gN, head);
    glow(
      b.part(new THREE.CircleGeometry(0.034, 10), "#6fe3ff", {
        at: gc.clone().addScaledVector(gN, 0.019),
        dir: gN,
        axis: "z",
        bone: head,
      }),
      1.1,
    );
  }
  box(LEATHER_D_P, [0.04, 0.02, 0.02], [0, 1.345, 0.2], head, { rotation: [34, 0, 0] });

  // ---- base & setting
  b.part(new THREE.CylinderGeometry(0.62, 0.66, 0.025, 8), BASE_TOP, {
    at: [0, -0.0125, 0],
    scale: [1, 1, 1.3],
    bone: root,
    flat: true,
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.78, 0.78), "#ffffff", {
      at: [0, 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      bone: root,
      texture: RUNES,
    }),
    1.2,
  );
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.2;
    const x = Math.cos(a) * (0.56 + R() * 0.05);
    const z = Math.sin(a) * (0.73 + R() * 0.05);
    const s = 0.05 + R() * 0.05;
    b.part(new THREE.IcosahedronGeometry(1, 0), ROCK_SNOW, {
      at: [x, s * 0.7, z],
      scale: [s * 1.3, s * 0.8, s * 1.1],
      rotation: [R() * 12, R() * 360, R() * 12],
      bone: root,
      flat: true,
    });
  }
  for (let i = 0; i < 8; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.3 + R() * 0.25;
    blob(SNOW_P, [Math.cos(a) * rr, 0.004, Math.sin(a) * rr * 1.2], root, [0.07 + R() * 0.05, 0.012, 0.06 + R() * 0.04]);
  }

  // powder keg
  const keg = b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0.1, 0.05],
      [0.105, 0.1],
      [0.1, 0.15],
      [0.085, 0.2],
      [0, 0.2],
    ] as [number, number][],
    { at: [-0.38, 0, -0.28], segments: 10, color: WOOD_P, bone: root },
  );
  for (const y of [0.035, 0.165]) torus(IRON_P, y < 0.1 ? 0.092 : 0.092, 0.007, [-0.38, y, -0.28], [0, 1, 0], root);
  b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.01, 10), WOOD_P, { at: [-0.38, 0.203, -0.28], bone: root });
  blob(SNOW_P, [-0.38, 0.21, -0.28], root, [0.085, 0.025, 0.085]);
  const kegHit = b.surface(keg).ray([-0.38, 0.1, 1], [0, 0, -1]);
  if (kegHit) b.decal(keg, LABEL, { at: kegHit, size: [0.1, 0.075], segments: 8 });
  // small keg lying down
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.13, 9), WOOD_P, {
    at: [-0.5, 0.06, -0.12],
    dir: [0.3, 0, 1],
    bone: root,
    flat: true,
  });
  // crate
  b.part(new THREE.BoxGeometry(0.22, 0.17, 0.2), WOOD_Z, { at: [0.28, 0.085, -0.4], rotation: [0, 20, 0], bone: root });
  for (const [x, z] of [
    [-0.105, -0.095],
    [0.105, -0.095],
    [-0.105, 0.095],
    [0.105, 0.095],
  ]) {
    const c = V(0.28, 0.085, -0.4).add(V(x, 0, z).applyAxisAngle(V(0, 1, 0), (20 * Math.PI) / 180));
    b.part(new THREE.BoxGeometry(0.02, 0.18, 0.02), IRON_P, { at: c, rotation: [0, 20, 0], bone: root });
  }
  blob(SNOW_P, [0.28, 0.175, -0.4], root, [0.115, 0.03, 0.105], { rotation: [0, 20, 0] });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    at: V(0.28, 0.085, -0.4).add(V(0.0, 0, 0.102).applyAxisAngle(V(0, 1, 0), (20 * Math.PI) / 180)),
    dir: V(0, 0, 1).applyAxisAngle(V(0, 1, 0), (20 * Math.PI) / 180),
    axis: "z",
    texture: EMBLEM,
    bone: root,
  });
  // signpost
  b.rod([0.5, 0, -0.33], [0.5, 0.72, -0.33], 0.026, WOOD_P, { bone: root, sides: 6, smooth: false });
  b.extrude(
    [
      [-0.17, -0.04],
      [0.12, -0.04],
      [0.2, 0],
      [0.12, 0.04],
      [-0.17, 0.04],
    ] as [number, number][],
    { at: [0.5, 0.6, -0.3], x: [1, 0.06, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: WOOD_P, bone: root },
  );
  b.part(new THREE.PlaneGeometry(0.3, 0.075), "#ffffff", {
    at: [0.485, 0.604, -0.2885],
    dir: [0, 0, 1],
    up: [-0.06, 1, 0],
    axis: "z",
    texture: SIGN,
    bone: root,
  });
  blob(SNOW_P, [0.5, 0.735, -0.33], root, [0.04, 0.02, 0.04]);
  torus(IRON_P, 0.028, 0.005, [0.5, 0.55, -0.33], [0, 1, 0], root);

  // cheerful snowflakes drifting around the hero
  const flake = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"><path d="M16 3 V29 M4.7 9.5 L27.3 22.5 M4.7 22.5 L27.3 9.5"/></g></svg>`,
    { size: 64 },
  );
  const flakes: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.3 + R() * 0.35;
    flakes.push(frame([Math.cos(a) * rr, 0.35 + R() * 1.1, Math.sin(a) * rr * 1.2], [0, 1, 0]));
  }
  b.cards(flakes, flake, { size: 0.03, lean: 90, flow: [0, 0, 1], bone: root, vary: 0.4, rng: rng(21), color: "#ffffff" });

  return b.root;
}
