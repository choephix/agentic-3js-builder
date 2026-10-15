// Dwarf rifleman with a braided beard and a flared blunderbuss, Blizzard/Warcraft style: chunky heroic proportions,
// oversized head, hands, shoulders and gun, hand-painted shading baked into paints, gold trims, studs and rivets.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import type { ColorInput, Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import type { SurfaceTarget } from "../../../../src/surface";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout dwarf with a copper braided beard, gold-trimmed blue helmet and pauldrons, studded leather, fur trim and a flared blunderbuss held ready.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const LIGHT = [1, 0.95, 0.78] as const;
const SHADE = [0.08, 0.06, 0.16] as const;

/** Hand-painted look: warm light on upward faces, cool shadow on downward faces, and brush-speckle noise. */
function lit(base: ColorInput, k = 1, speck = 0.12): Paint {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    let o = mix(c, LIGHT, smoothstep(0.1, 0.95, n.y) * 0.3 * k);
    o = mix(o, SHADE, smoothstep(0.0, -0.9, n.y) * 0.42 * k);
    const m = noise(p, 0.05, 5) - 0.5;
    return mix(o, m > 0 ? LIGHT : SHADE, Math.abs(m) * speck * 2);
  });
}

const GOLD = lit("#e8b436", 1.3, 0.05);
const GOLD_D = lit("#8d5b12", 1, 0.04);
const SKIN = lit(mottle("#e3946b", "#d57f5a", { size: 0.04 }), 0.9, 0.08);
const NOSE = lit("#e4805f", 0.9, 0.05);
const HAIR = lit(grain("#d9612a", "#a63c16", { size: 0.012, axis: "y" }), 1.1, 0.1);
const HAIR_B = lit(grain("#c24f1e", "#8c2e10", { size: 0.012, axis: "y" }), 1.0, 0.1);
const HAIR_L = lit(grain("#ee8038", "#c95a22", { size: 0.012, axis: "y" }), 1.2, 0.06);
const LEATHER = lit(mottle("#80502c", "#6a3f22", { size: 0.05 }), 1, 0.1);
const LEATHER_D = lit(mottle("#573219", "#46280f", { size: 0.04 }), 1, 0.1);
const GLOVE = lit(mottle("#6a4023", "#58341c", { size: 0.03 }), 1, 0.1);
const BLUE = lit(mottle("#3358a6", "#2a4a92", { size: 0.05, contrast: 0.8 }), 1, 0.1);
const BLUE_D = lit("#243f82", 1, 0.08);
const FUR = lit(mottle("#f0e4c4", "#cdbb90", { size: 0.02, contrast: 1.4 }), 0.9, 0.1);
const STEEL = lit(mottle("#8a909c", "#5e6472", { size: 0.035 }), 1.1, 0.1);
const STEEL_D = lit("#3a3e48", 1, 0.08);
const WOOD = lit(grain("#7b4727", "#4d2b16", { size: 0.01, axis: "z" }), 1, 0.1);
const PANTS = lit(mottle("#4b3f45", "#3b3238", { size: 0.05 }), 1, 0.1);
const BOOT = lit(mottle("#7b4a29", "#63391d", { size: 0.04 }), 1, 0.12);
const SOLE = lit("#2b1a10", 1, 0.06);
const BLANKET = lit(mottle("#8a3f2c", "#6e2f22", { size: 0.04 }), 1, 0.1);

/** Quilted leather vest: diamond seams. */
const VEST = paint((p) => {
  const a = Math.abs((((p.x + p.y) / 0.075) % 1 + 1) % 1 - 0.5);
  const c = Math.abs((((p.x - p.y) / 0.075) % 1 + 1) % 1 - 0.5);
  return a > 0.46 || c > 0.46 ? LEATHER_D : LEATHER;
});

/** Gold band with a repeating diamond engraving, for lathe rings of height `h`. */
const engr = (h: number) =>
  paint((_p, _n, s) => {
    const u = (((s[1] / 22) % 1) + 1) % 1;
    const v = (((s[0] / h) % 1) + 1) % 1;
    const d = Math.abs(u - 0.5) + Math.abs(v - 0.5);
    return Math.abs(d - 0.3) < 0.06 || d < 0.1 ? GOLD_D : GOLD;
  });

/** Tunic skirt: blue with a gold hem band carrying a diamond chain. */
const SKIRT = paint((_p, _n, s) => {
  const h = s[0];
  const u = (((s[1] / 14) % 1) + 1) % 1;
  if (h < 0.012) return GOLD_D;
  if (h < 0.052) {
    const d = Math.abs(u - 0.5) + Math.abs((h - 0.012) / 0.04 - 0.5) * 0.9;
    return Math.abs(d - 0.28) < 0.05 || d < 0.07 ? GOLD_D : GOLD;
  }
  if (h < 0.062) return GOLD_D;
  return BLUE;
});

/** Pauldron / bell: dark inside the flared muzzle, steel elsewhere. */
const BARREL = paint((_p, n, s) => (n.z > 0.25 && s[0] > 0.36 ? STEEL_D : STEEL));

const ringPts = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 16) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy, cz + Math.sin(a) * rz];
  });

const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

const shield = (k: number): OutlinePoint[] => [
  [-0.05 * k, 0.05 * k],
  [0.05 * k, 0.05 * k],
  [0.055 * k, 0],
  [0, -0.065 * k],
  [-0.055 * k, 0],
];

const cheekPlate = (k: number): OutlinePoint[] => [
  [-0.035 * k, 0.012 * k],
  [0.035 * k, 0.012 * k],
  [0.04 * k, -0.04 * k],
  [0, -0.1 * k],
  [-0.04 * k, -0.04 * k],
];

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", paintSize: 2048 });
  const rand = rng(7);

  // ---------------------------------------------------------------- textures
  const TUFT = svg(
    `<svg viewBox="0 0 40 80">
      <path d="M4 80 Q2 40 10 4 Q18 40 20 80Z" fill="#efe3c2"/>
      <path d="M14 80 Q18 30 20 0 Q30 36 28 80Z" fill="#e2d2a8"/>
      <path d="M24 80 Q30 44 38 10 Q38 50 36 80Z" fill="#f6ecd2"/>
    </svg>`,
    { size: 128 },
  );
  const PANEL = svg(
    `<svg viewBox="0 0 60 96">
      <rect x="0" y="0" width="60" height="96" fill="#6b4126"/>
      <rect x="2" y="2" width="56" height="92" fill="none" stroke="#e8b436" stroke-width="3"/>
      <path d="M6 12 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6" stroke="#c28a24" stroke-width="2.5" fill="none"/>
      <path d="M6 84 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6" stroke="#c28a24" stroke-width="2.5" fill="none"/>
      <path d="M30 24 L48 48 L30 72 L12 48Z" fill="#e8b436"/>
      <path d="M30 33 L40 48 L30 63 L20 48Z" fill="#2c4a8c"/>
      <path d="M30 41 L35 48 L30 55 L25 48Z" fill="#e8b436"/>
    </svg>`,
    { size: 256 },
  );
  const BUCKLE = svg(
    `<svg viewBox="0 0 48 48">
      <rect width="48" height="48" rx="5" fill="#e8b436"/>
      <rect x="3" y="3" width="42" height="42" rx="3" fill="none" stroke="#8d5b12" stroke-width="2.5"/>
      <path d="M24 9L39 24L24 39L9 24Z" fill="#8d5b12"/>
      <path d="M24 15L33 24L24 33L15 24Z" fill="#f4d060"/>
      <circle cx="24" cy="24" r="3.5" fill="#8d5b12"/>
    </svg>`,
    { size: 128 },
  );
  const KNOT = svg(
    `<svg viewBox="0 0 80 48">
      <rect width="80" height="48" rx="6" fill="#e8b436"/>
      <rect x="3" y="3" width="74" height="42" rx="4" fill="none" stroke="#8d5b12" stroke-width="3"/>
      <path d="M8 24 Q20 6 32 24 T56 24 T72 24" stroke="#8d5b12" stroke-width="3.5" fill="none"/>
      <path d="M8 24 Q20 42 32 24 T56 24 T72 24" stroke="#8d5b12" stroke-width="3.5" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 120 80">
      <path d="M6 8 H114" stroke="#e8b436" stroke-width="4" fill="none"/>
      <path d="M6 72 H114" stroke="#e8b436" stroke-width="4" fill="none"/>
      <path d="M10 40 L30 20 L50 40 L70 20 L90 40 L110 20" stroke="#e8b436" stroke-width="5" fill="none"/>
      <path d="M10 40 L30 60 L50 40 L70 60 L90 40 L110 60" stroke="#e8b436" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------- skeleton: spine
  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.56, 0],
      [0, 0.72, 0.01],
      [0, 0.9, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    [
      [0, 0.95, 0.03],
      [0, 1.04, 0.07],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.04, 0.07], dir: [0, 0.35, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.085, 0.1], aim: [0, 1.07, 0.2], role: "jaw" });
  const gun = b.joint("gun", { parent: chest, at: [0, 0.78, 0.45], dir: [0, 0, 1] });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 0.45, 0], w: 0.34, h: 0.25 },
      { at: [0, 0.57, 0], w: 0.4, h: 0.31 },
      { at: [0, 0.74, 0.01], w: 0.46, h: 0.32 },
      { at: [0, 0.9, 0.02], w: 0.5, h: 0.3 },
      { at: [0, 0.98, 0.03], w: 0.32, h: 0.2 },
    ],
    { bone: [hips, spine], color: VEST, caps: "flat", name: "torso" },
  );
  const tsurf = b.surface(torso);

  b.sweep(neck, 0.075, SKIN, { name: "neck" });

  // belt with studs and buckle
  const beltPath = tsurf.loop([0, 0.575, 0], { lift: 0.012 });
  b.sweep(beltPath, 0.026, LEATHER_D, { sides: 6, name: "belt" });
  b.along(tsurf.loop([0, 0.575, 0], { lift: 0.034 }), 18, (at) => {
    b.part(sph(0.008), GOLD, { at });
  });
  b.part(box(0.085, 0.07, 0.014), GOLD, { bone: hips, at: [0, 0.575, 0.213] });
  b.part(new THREE.PlaneGeometry(0.075, 0.062), "#ffffff", {
    bone: hips,
    at: [0, 0.575, 0.222],
    dir: [0, 0, 1],
    axis: "z",
    texture: BUCKLE,
  });

  // suspender straps over the shoulders
  for (const s of [1, -1]) {
    const sp = tsurf.drape(
      catmull([
        [s * 0.19, 0.98, 0.0],
        [s * 0.14, 0.93, 0.14],
        [s * 0.1, 0.8, 0.17],
        [s * 0.1, 0.6, 0.16],
      ]),
      { lift: 0.012 },
    );
    b.sweep(sp, 0.02, LEATHER_D, { sides: 6 });
    b.along(sp, 6, (at) => {
      b.part(sph(0.01), GOLD, { at });
    });
  }

  // fur ruff around the neck
  const fur = (target: SurfaceTarget, count: number, size: number) => {
    const hits = b.surface(target).scatter(count, { rng: rand, minDist: size * 0.5 });
    b.cards(hits, TUFT, { size: [size * 0.8, size * 1.3], lean: 50, bend: 30, vary: 0.3, rng: rand, sink: 0.2 });
  };
  const ruff = b.sweep(tsurf.loop([0, 0.955, 0.02], { lift: 0.02 }), 0.048, FUR, { sides: 6, name: "ruff" });
  fur(ruff, 90, 0.05);

  // tunic skirt with tabard decal
  const skirt = b.lathe(
    [
      [0, 0],
      [0.275, 0],
      [0.262, 0.06],
      [0.245, 0.14],
      [0.228, 0.23],
      [0, 0.23],
    ],
    { at: [0, 0.33, 0], axis: [0, 1, 0], bone: hips, color: SKIRT, segments: 16, name: "skirt" },
  );
  b.decal(skirt, PANEL, { at: [0, 0.44, 0.25], dir: [0, 0, 1], size: [0.15, 0.24], bone: hips });

  // pouch on the right hip, powder horn, keg on the left hip
  b.part(box(0.075, 0.1, 0.095), LEATHER, { bone: hips, at: [-0.255, 0.49, 0.06] });
  b.part(box(0.082, 0.045, 0.102), LEATHER_D, { bone: hips, at: [-0.255, 0.53, 0.06] });
  b.part(box(0.012, 0.03, 0.02), GOLD, { bone: hips, at: [-0.298, 0.515, 0.06] });
  b.sweep(
    catmull([
      [-0.27, 0.6, -0.04],
      [-0.31, 0.52, -0.07],
      [-0.31, 0.43, -0.05],
      [-0.27, 0.37, 0.0],
    ]),
    [0.03, 0.026, 0.012],
    "#e9dcb4",
    { bone: hips, caps: { start: "flat", end: "point" }, sides: 6, name: "horn" },
  );
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 8), GOLD, { bone: hips, at: [-0.27, 0.605, -0.04], dir: [0.3, 1, 0.3] });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.15, 10), WOOD, { bone: hips, at: [0.3, 0.5, -0.02], dir: [0, 0, 1], name: "keg" });
  for (const dz of [-0.05, 0.0, 0.05])
    b.part(new THREE.TorusGeometry(0.058, 0.007, 5, 12), GOLD, { bone: hips, at: [0.3, 0.5, -0.02 + dz], dir: [0, 0, 1], axis: "z" });
  b.part(sph(0.012), GOLD_D, { bone: hips, at: [0.3, 0.557, -0.02] });
  b.sweep(
    catmull([
      [0.26, 0.575, 0.0],
      [0.3, 0.56, 0.0],
      [0.31, 0.5, 0.0],
    ]),
    0.012,
    LEATHER_D,
    { bone: hips, sides: 5 },
  );

  // backpack and bedroll
  b.part(box(0.3, 0.3, 0.12), LEATHER, { bone: chest, at: [0, 0.72, -0.2], name: "pack" });
  b.part(box(0.31, 0.1, 0.13), LEATHER_D, { bone: chest, at: [0, 0.83, -0.2] });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.36, 10), BLANKET, { bone: chest, at: [0, 0.915, -0.2], dir: [1, 0, 0], name: "bedroll" });
  for (const x of [-0.1, 0.1]) {
    b.part(new THREE.TorusGeometry(0.058, 0.008, 5, 10), LEATHER_D, { bone: chest, at: [x, 0.915, -0.2], dir: [1, 0, 0], axis: "z" });
    b.part(box(0.035, 0.2, 0.01), LEATHER_D, { bone: chest, at: [x, 0.73, -0.264] });
    b.part(box(0.04, 0.035, 0.012), GOLD, { bone: chest, at: [x, 0.65, -0.268] });
  }
  b.part(new THREE.CylinderGeometry(0.035, 0.03, 0.07, 8), STEEL, { bone: chest, at: [0.165, 0.72, -0.2], name: "cup" });

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.14;
    const pts = limb([s * 0.12, 0.5, 0], [x, 0.105, 0], [0.22, 0.2], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [x, 0, 0.06],
    });
    const knee = leg.joints[1];
    const ankJ = leg.joints[2];
    b.sweep(leg, [0.1, 0.092, 0.078, 0.072, 0.07], PANTS, { name: `leg${S}` });
    const bootSw = b.sweep(leg, [0.088, 0.082, 0.076], BOOT, { from: 0.6, to: 1, caps: { start: "flat" }, name: `boot${S}` });
    const c6 = leg.at(0.6).at;
    const cuff = b.lathe(
      [
        [0.075, 0],
        [0.1, 0],
        [0.106, 0.04],
        [0.1, 0.075],
        [0.08, 0.08],
      ],
      { at: [c6.x, c6.y - 0.035, c6.z], axis: [0, 1, 0], bone: knee, color: FUR, segments: 10, name: `cuff${S}` },
    );
    fur(cuff, 36, 0.045);

    // boot straps and buckles
    const bsurf = b.surface(bootSw);
    for (const t of [0.74, 0.88]) {
      const c = leg.at(t).at;
      b.sweep(bsurf.loop([c.x, c.y, c.z], { lift: 0.006 }), 0.009, LEATHER_D, { sides: 5 });
      b.stick(box(0.034, 0.014, 0.03), GOLD, bootSw.at(t, 0, 0.002));
    }

    // knee plate: gold shield with a blue face
    const K = pts[1];
    b.extrude(shield(1), { at: [K.x, K.y, K.z + 0.07], x: [1, 0, 0], thickness: 0.014, bevel: 0.003, color: GOLD, bone: knee });
    b.extrude(shield(0.72), { at: [K.x, K.y, K.z + 0.078], x: [1, 0, 0], thickness: 0.014, bevel: 0.003, color: BLUE, bone: knee });
    b.part(new THREE.ConeGeometry(0.014, 0.014, 4), GOLD, { bone: knee, at: [K.x, K.y - 0.005, K.z + 0.092], dir: [0, 0, 1] });

    // foot
    const toe = b.joint(`toe${S}`, { parent: ankJ, at: [x, 0.06, 0.12], aim: [x, 0.05, 0.25], role: "digit" });
    b.capsule([x, 0.105, -0.02], [x, 0.085, 0.15], 0.078, BOOT, { bone: ankJ, name: `foot${S}` });
    b.part(box(0.17, 0.045, 0.35), SOLE, { bone: ankJ, at: [x, 0.0225, 0.07], name: `sole${S}` });
    b.part(box(0.15, 0.035, 0.1), SOLE, { bone: ankJ, at: [x, 0.062, -0.06], name: `heel${S}` });
    b.part(sph(1, 8, 6), STEEL, { bone: toe, at: [x, 0.075, 0.185], scale: [0.078, 0.058, 0.085], name: `toecap${S}` });
    for (const dx of [-0.035, 0.035]) b.part(sph(0.009), GOLD, { bone: toe, at: [x + dx, 0.1, 0.225] });
    b.part(box(0.04, 0.02, 0.02), GOLD, { bone: ankJ, at: [x, 0.13, 0.065] });
  }

  // ---------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 0.26, 0.9, 0.03];
    const target = s > 0 ? [0, 0.735, 0.43] : [0, 0.745, 0.3];
    const pts = limb(sh, target, [0.29, 0.26], [[s * 0.8, -1, -0.1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    const shJ = arm.joints[0];
    const hj = arm.joints[2];
    const sleeve = b.sweep(arm, [0.092, 0.086, 0.08, 0.073, 0.066], {
      bands: [
        [0.6, BLUE],
        [0.84, LEATHER],
        [1, GLOVE],
      ],
      name: `arm${S}`,
    });
    const as = b.surface(sleeve);
    const cuffP = b.sweep(as.loop(arm.at(0.62), { lift: 0.012 }), 0.027, FUR, { sides: 6, name: `armfur${S}` });
    fur(cuffP, 36, 0.045);
    for (const t of [0.7, 0.83]) b.sweep(as.loop(arm.at(t), { lift: 0.006 }), 0.009, GOLD, { sides: 5 });
    b.along(as.loop(arm.at(0.765), { lift: 0.014 }), 8, (at) => {
      b.part(sph(0.011), GOLD, { at });
    });
    b.sweep(as.loop(arm.at(0.17), { lift: 0.008 }), 0.011, GOLD, { sides: 5 });
    // leather elbow strap
    b.sweep(as.loop(arm.at(0.5), { lift: 0.006 }), 0.012, LEATHER_D, { sides: 5 });

    // pauldron: blue dome, gold rim, pyramid stud and studs
    const axis = new THREE.Vector3(s * 0.6, 1, 0).normalize();
    const pc = [s * 0.275, 0.945, 0.03];
    b.lathe(
      [
        [0, 0],
        [0.13, 0],
        [0.135, 0.02],
        [0.12, 0.06],
        [0.08, 0.09],
        [0, 0.1],
      ],
      { at: pc, axis, bone: shJ, color: BLUE, segments: 12, name: `pauldron${S}` },
    );
    b.lathe(
      [
        [0.122, -0.012],
        [0.145, -0.012],
        [0.147, 0.012],
        [0.126, 0.022],
      ],
      { at: pc, axis, bone: shJ, color: GOLD, segments: 12, name: `pauldronrim${S}` },
    );
    const top = new THREE.Vector3(...pc).addScaledVector(axis, 0.092);
    b.part(new THREE.ConeGeometry(0.04, 0.04, 4), GOLD, { bone: shJ, at: top, dir: axis });
    const ringAt = new THREE.Vector3(...pc).addScaledVector(axis, 0.04);
    b.ring(frame(ringAt, axis), { count: 6, radius: 0.115 }, (item) => {
      b.part(sph(0.012), GOLD, { at: item, bone: shJ });
    });

    // glove / fist around the gun
    const cx = target[0];
    const cy = target[1];
    const cz = target[2];
    b.part(sph(1, 8, 6), GLOVE, { bone: hj, at: [cx + s * 0.04, cy, cz], scale: [0.032, 0.048, 0.058], name: `palm${S}` });
    for (let i = 0; i < 4; i++) {
      const z = cz - 0.03 + 0.02 * i;
      b.capsule([cx - s * 0.035, cy + 0.035, z], [cx - s * 0.03, cy - 0.03, z], 0.011, GLOVE, { bone: hj, sides: 6 });
    }
    b.capsule([cx + s * 0.03, cy + 0.035, cz - 0.01], [cx - s * 0.005, cy + 0.052, cz + 0.045], 0.013, GLOVE, { bone: hj, sides: 6 });
    b.part(sph(0.01), GOLD, { bone: hj, at: [cx + s * 0.07, cy + 0.015, cz - 0.015] });
    b.part(sph(0.01), GOLD, { bone: hj, at: [cx + s * 0.07, cy - 0.015, cz + 0.02] });
  }

  // ---------------------------------------------------------------- head
  b.part(sph(1, 12, 9), SKIN, { bone: head, at: [0, 1.13, 0.07], scale: [0.14, 0.13, 0.135], name: "skull" });
  b.part(sph(1, 10, 7), SKIN, { bone: jaw, at: [0, 1.065, 0.12], scale: [0.095, 0.055, 0.095], name: "jawbone" });
  b.part(sph(0.046, 8, 6), NOSE, { bone: head, at: [0, 1.11, 0.215], name: "nose" });
  b.capsule([0, 1.165, 0.185], [0, 1.115, 0.225], 0.026, NOSE, { bone: head, sides: 6 });
  for (const s of [1, -1]) {
    b.part(sph(1, 8, 6), NOSE, { bone: head, at: [s * 0.078, 1.1, 0.172], scale: [0.048, 0.04, 0.04] });
    b.part(sph(1, 7, 5), SKIN, { bone: head, at: [s * 0.14, 1.12, 0.07], scale: [0.02, 0.036, 0.03] });
    b.part(sph(0.007, 5, 4), STEEL_D, { bone: head, at: [s * 0.02, 1.095, 0.254] });
    // eyes
    b.part(sph(0.02, 8, 6), "#f2ead8", { bone: head, at: [s * 0.055, 1.133, 0.196] });
    b.part(sph(0.012, 7, 5), "#4a78a8", { bone: head, at: [s * 0.054, 1.133, 0.212] });
    b.part(sph(0.006, 5, 4), "#14101c", { bone: head, at: [s * 0.054, 1.133, 0.22] });
    // angry heavy brows
    b.capsule([s * 0.018, 1.158, 0.208], [s * 0.103, 1.182, 0.168], 0.0265, HAIR, { bone: head, sides: 6 });
    // sideburns
    b.capsule([s * 0.13, 1.17, 0.06], [s * 0.11, 1.07, 0.15], 0.03, HAIR_B, { bone: head, sides: 6 });
    // moustache
    b.sweep(
      catmull([
        [0, 1.085, 0.225],
        [s * 0.045, 1.078, 0.24],
        [s * 0.095, 1.065, 0.22],
        [s * 0.135, 1.075, 0.18],
        [s * 0.14, 1.105, 0.15],
      ]),
      [0.034, 0.034, 0.026, 0.015, 0.006],
      HAIR,
      { bone: head, caps: { start: "round", end: "point" }, sides: 7, name: "moustache" },
    );
    // cheek plates
    b.extrude(cheekPlate(1), { at: [s * 0.152, 1.19, 0.095], x: [0, 0, 1], thickness: 0.016, bevel: 0.003, color: GOLD, bone: head });
    b.extrude(cheekPlate(0.74), { at: [s * 0.158, 1.178, 0.095], x: [0, 0, 1], thickness: 0.018, bevel: 0.003, color: BLUE, bone: head });
    b.part(new THREE.ConeGeometry(0.012, 0.01, 4), GOLD, { bone: head, at: [s * 0.169, 1.15, 0.095], dir: [s, 0, 0] });
  }

  // helmet dome (superellipse profile) with gold bands and arches
  const R = 0.158;
  const H = 0.14;
  const dome: OutlinePoint[] = [
    [0, 0],
    [R, 0],
  ];
  for (let k = 1; k < 8; k++) {
    const a = (k / 8) * (Math.PI / 2);
    dome.push([R * Math.pow(Math.cos(a), 0.77), H * Math.pow(Math.sin(a), 0.77)]);
  }
  dome.push([0, H]);
  b.lathe(dome, { at: [0, 1.195, 0.07], axis: [0, 1, 0], bone: head, color: BLUE, segments: 14, name: "helmet" });
  b.sweep(catmull(ringPts(0, 1.2, 0.07, R + 0.004, R + 0.006), { closed: true }), 0.013, GOLD, { bone: head, sides: 6, name: "helmrim" });
  b.sweep(catmull(ringPts(0, 1.241, 0.07, R * 0.96, R * 0.96), { closed: true }), 0.007, GOLD_D, { bone: head, sides: 5 });
  const arch = (side: boolean) =>
    Array.from({ length: 9 }, (_, i) => {
      const a = (i / 8) * Math.PI;
      const r = (R + 0.004) * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.77);
      const h = (H + 0.004) * Math.pow(Math.sin(a), 0.77);
      return side ? [r, 1.195 + h, 0.07] : [0, 1.195 + h, 0.07 + r];
    });
  b.sweep(catmull(arch(true)), 0.011, GOLD, { bone: head, sides: 6, name: "archSide" });
  b.sweep(catmull(arch(false)), 0.011, GOLD, { bone: head, sides: 6, name: "archFront" });
  b.extrude(
    [
      [0, 0.045],
      [0.038, 0],
      [0, -0.045],
      [-0.038, 0],
    ],
    { at: [0, 1.248, 0.226], x: [1, 0, 0], thickness: 0.014, bevel: 0.003, color: GOLD, bone: head },
  );
  b.extrude(
    [
      [0, 0.028],
      [0.022, 0],
      [0, -0.028],
      [-0.022, 0],
    ],
    { at: [0, 1.248, 0.234], x: [1, 0, 0], thickness: 0.012, bevel: 0.002, color: BLUE_D, bone: head },
  );
  b.part(new THREE.ConeGeometry(0.012, 0.016, 4), GOLD, { bone: head, at: [0, 1.348, 0.07] });

  // ponytail at the back
  b.sweep(
    catmull([
      [0, 1.16, -0.07],
      [0, 1.08, -0.14],
      [0, 1.0, -0.15],
      [0, 0.95, -0.13],
    ]),
    [0.05, 0.05, 0.04, 0.012],
    HAIR_B,
    { bone: head, caps: { end: "point" }, sides: 7, name: "ponytail" },
  );

  // ---------------------------------------------------------------- beard
  const beard = b.loft(
    [
      { at: [0, 1.1, 0.14], w: 0.26, h: 0.14 },
      { at: [0, 1.03, 0.2], w: 0.26, h: 0.13 },
      { at: [0, 0.95, 0.235], w: 0.2, h: 0.11 },
      { at: [0, 0.885, 0.23], w: 0.12, h: 0.08 },
    ],
    { bone: head, color: HAIR, caps: { start: "round", end: "point" }, sides: 10, name: "beard" },
  );
  const bsf = b.surface(beard);
  [-2, -1, 0, 1, 2].forEach((k, i) => {
    b.sweep(
      bsf.drape(
        catmull([
          [k * 0.045, 1.075, 0.2],
          [k * 0.05, 1.0, 0.28],
          [k * 0.045, 0.93, 0.3],
          [k * 0.03, 0.885, 0.27],
        ]),
        { lift: 0.006 },
      ),
      [0.017, 0.008],
      i % 2 ? HAIR_L : HAIR_B,
      { bone: head, caps: { start: "round", end: "point" }, sides: 5 },
    );
  });

  const braid = (s: number) => {
    const S = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.085, 1.03, 0.25],
      [s * 0.09, 0.97, 0.285],
      [s * 0.085, 0.92, 0.292],
      [s * 0.08, 0.875, 0.287],
    ]);
    const bj: Joint = b.joint(`braid${S}`, { parent: head, at: [s * 0.085, 1.03, 0.25], aim: [s * 0.08, 0.875, 0.287] });
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const r = 0.036 * (1 - 0.4 * t);
      b.part(sph(1, 8, 6), i % 2 ? HAIR : HAIR_B, {
        bone: bj,
        at: path.at(t),
        scale: [r * 1.15, r * 0.85, r * 0.95],
        rotation: [0, 0, i % 2 ? 28 : -28],
      });
    }
    const end = path.at(1);
    b.spike([end.x, end.y, end.z], [0, -1, 0], 0.06, 0.026, HAIR_L, { bone: bj });
    for (const t of [0.14, 0.58]) {
      const p = path.at(t);
      b.lathe(
        [
          [0.034, 0],
          [0.052, 0],
          [0.054, 0.015],
          [0.052, 0.03],
          [0.034, 0.03],
        ],
        { at: [p.x, p.y - 0.015, p.z], axis: [0, 1, 0], color: engr(0.03), bone: bj, segments: 10 },
      );
    }
  };
  braid(1);
  braid(-1);

  // ---------------------------------------------------------------- blunderbuss
  // wooden stock in side profile (u along the barrel, v up from the bore axis)
  b.extrude(
    [
      [0, 0.05],
      [0.1, 0.042],
      [0.16, 0.048],
      [0.3, 0.042],
      [0.3, -0.014],
      [0.22, -0.026],
      [0.17, -0.05],
      [0.12, -0.072],
      [0.07, -0.095],
      [0, -0.085],
    ],
    { at: [0, 0.78, 0.19], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bevel: 0.008, color: WOOD, bone: gun, name: "stock" },
  );
  b.part(box(0.06, 0.135, 0.012), GOLD, { bone: gun, at: [0, 0.7625, 0.186], name: "buttplate" });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.09, 0.05), "#ffffff", {
      bone: gun,
      at: [s * 0.0285, s > 0 ? 0.8 : 0.775, 0.235],
      dir: [s, 0, 0],
      axis: "z",
      texture: KNOT,
    });
  }
  // barrel with flared bell
  const barrel = b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.036, 0.04],
      [0.032, 0.34],
      [0.038, 0.46],
      [0.06, 0.56],
      [0.09, 0.64],
      [0.08, 0.64],
      [0.05, 0.54],
      [0.026, 0.42],
      [0, 0.38],
    ],
    { at: [0, 0.78, 0.3], axis: [0, 0, 1], bone: gun, color: BARREL, segments: 14, name: "barrel" },
  );
  for (const y of [0.1, 0.26]) {
    b.lathe(
      [
        [0.03, 0],
        [0.047, 0],
        [0.047, 0.035],
        [0.03, 0.035],
      ],
      { at: [0, 0.78, 0.3 + y], axis: [0, 0, 1], bone: gun, color: engr(0.035), segments: 12 },
    );
  }
  b.lathe(
    [
      [0.07, 0],
      [0.098, 0],
      [0.1, 0.03],
      [0.082, 0.03],
    ],
    { at: [0, 0.78, 0.3 + 0.61], axis: [0, 0, 1], bone: gun, color: GOLD, segments: 14, name: "muzzlerim" },
  );
  for (const s of [1, -1])
    b.decal(barrel, RUNE, { at: [s * 0.06, 0.78, 0.3 + 0.5], dir: [s, 0, 0], up: [0, 1, 0], size: [0.12, 0.08], bone: gun });
  // ramrod under the barrel
  b.rod([0, 0.738, 0.5], [0, 0.738, 0.88], 0.005, STEEL, { bone: gun });
  b.part(sph(0.009), GOLD, { bone: gun, at: [0, 0.738, 0.885] });
  // flintlock on the left side
  b.part(box(0.01, 0.05, 0.085), STEEL, { bone: gun, at: [0.038, 0.795, 0.38], name: "lockplate" });
  b.sweep(
    catmull([
      [0.043, 0.795, 0.35],
      [0.046, 0.84, 0.345],
      [0.043, 0.858, 0.375],
    ]),
    0.008,
    STEEL_D,
    { bone: gun, sides: 5 },
  );
  b.part(box(0.012, 0.014, 0.03), STEEL_D, { bone: gun, at: [0.043, 0.858, 0.39] });
  b.part(box(0.014, 0.03, 0.02), STEEL, { bone: gun, at: [0.042, 0.835, 0.425] });
  b.part(box(0.014, 0.012, 0.025), STEEL_D, { bone: gun, at: [0.042, 0.815, 0.41] });
  for (const z of [0.35, 0.405]) b.part(sph(0.008), GOLD, { bone: gun, at: [0.045, 0.782, z] });
  // trigger guard and trigger
  b.sweep(
    catmull([
      [0, 0.752, 0.355],
      [0, 0.715, 0.365],
      [0, 0.71, 0.41],
      [0, 0.752, 0.435],
    ]),
    0.006,
    GOLD,
    { bone: gun, sides: 5 },
  );
  b.spike([0, 0.757, 0.382], [0, -1, 0], 0.03, 0.006, STEEL_D, { bone: gun });
  // gold bands on the stock
  for (const z of [0.31, 0.45])
    b.part(box(0.056, 0.012, 0.014), GOLD, { bone: gun, at: [0, 0.745, z] });

  // keep the glove, gun and torso from reading as one flat mass: a thin brass cap on the muzzle ring
  b.part(new THREE.TorusGeometry(0.1, 0.006, 4, 14), GOLD_D, { bone: gun, at: [0, 0.78, 0.3 + 0.64], dir: [0, 0, 1], axis: "z" });

  return b.root;
}
