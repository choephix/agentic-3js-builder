import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { catmull } from "../src/path";
import type { Path } from "../src/path";
import { grain, mix, noise, paint, resolve, smoothstep } from "../src/paint";
import type { ColorInput, Paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A broad, heroic dwarf in a crimson tunic and steel helm with a backswept red plume, a braided ginger beard tied in brass, and a brass-trimmed blunderbuss held across the chest.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

type V = [number, number, number];

// ---- palette and paints -------------------------------------------------------------------------------------------

/** The key light: from model right (−X), above and in front. */
const LIGHT = new THREE.Vector3(-0.35, 0.8, 0.5).normalize();

/** Hand-painted shading: a soft core shadow, a shine band on the lit side, and brush-stroke variation. */
function toon(base: ColorInput, hi: string, lo: string): Paint {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const d = n.dot(LIGHT);
    const lit = smoothstep(-0.3, 0.25, d);
    const shine = smoothstep(0.5, 0.8, d);
    const shaded = mix(mix(lo, c, lit), hi, 0.5 * shine);
    const k = 0.93 + 0.14 * noise(p, 0.025, 7);
    return [Math.min(1, shaded[0] * k), Math.min(1, shaded[1] * k), Math.min(1, shaded[2] * k)];
  });
}

const SKIN = toon("#e8a375", "#ffe0bc", "#8a4a2c");
const SCAR = toon("#c95a5a", "#ff9a8a", "#5a1a1a");
const NOSE = toon("#d9654a", "#ffb394", "#6a2418");
const HAIR = toon(grain("#dc5f24", "#8a2e12", { size: 0.01, axis: "y", seed: 3 }), "#ffc27a", "#4a1a0a");
const HAIR_A = toon("#e0682a", "#ffb070", "#4a1a0a");
const HAIR_B = toon("#9a3a18", "#d86a34", "#2a0e06");
const HAIR_C = toon("#f2b458", "#fff0b0", "#7a4a12");
const TUNIC_BASE = toon("#b8242c", "#f2655a", "#48080f");
const BRASS = toon("#dba43c", "#fff2a6", "#6e4010");
const TUNIC = paint((p, n) => {
  // a zigzag of gold stitching across the chest, the tunic's only ornament
  const zig = 0.9 + 0.012 * Math.sin(p.x * 70);
  return n.z > 0.3 && Math.abs(p.y - zig) < 0.0055 ? BRASS : TUNIC_BASE;
});
const TROUSER_CLOTH = toon("#2d6f6b", "#7fd0b8", "#0b2a2a");
// gold piping down each side seam of the legs (sweep angle 90 and -90)
const TROUSER = paint((_p, _n, s) => (Math.abs((((s[1] % 180) + 180) % 180) - 90) < 4 ? BRASS : TROUSER_CLOTH));
const LEATHER = toon("#7b4526", "#c98a58", "#2a130a");
const BOOT = toon("#4a2715", "#9a5a2e", "#120804");
const STEEL = toon("#9aa7b6", "#ffffff", "#27303e");
const DARKSTEEL = toon("#4d5968", "#b8c4d2", "#161c26");
const HORN = toon("#e8c26a", "#fff2c0", "#6a4a10");

const GRIP_R: V = [-0.15, 0.82, 0.3];
const GRIP_L: V = [0.06, 0.86, 0.42];
const GUN_DIR = new THREE.Vector3(...GRIP_L).sub(new THREE.Vector3(...GRIP_R)).normalize();
const WOOD = toon(
  grain("#a5672f", "#5c2f15", { size: 0.012, axis: [GUN_DIR.x, GUN_DIR.y, GUN_DIR.z], seed: 11 }),
  "#e8a862",
  "#2e1608",
);

// ---- textures ------------------------------------------------------------------------------------------------------

const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
<path d="M3 22 Q32 -2 61 22 Q32 38 3 22Z" fill="#f3ecdc" stroke="#2a1408" stroke-width="3"/>
<circle cx="33" cy="21" r="11" fill="#2f7fc0" stroke="#0e2238" stroke-width="2"/>
<circle cx="33" cy="21" r="5.5" fill="#080a10"/>
<circle cx="29" cy="17" r="3" fill="#ffffff"/>
<path d="M2 17 Q32 -4 62 17" fill="none" stroke="#2a1408" stroke-width="5"/>
</svg>`,
  { size: 128 },
);

const FEATHER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120">
<path d="M20 118 C4 92 3 40 20 2 C37 40 36 92 20 118Z" fill="#c4232c"/>
<path d="M20 116 C11 84 11 40 20 8 C29 40 29 84 20 116Z" fill="#f2b84a"/>
<path d="M20 116 L20 8" stroke="#4a0a10" stroke-width="2.5" fill="none"/>
</svg>`,
  { size: 128 },
);

// ---- outlines ------------------------------------------------------------------------------------------------------

const PAULDRON: OutlinePoint[] = [
  [0, -0.03],
  [0.14, -0.03],
  [0.155, 0.0],
  [0.16, 0.03],
  [0.14, 0.065],
  [0.095, 0.095],
  [0.04, 0.11],
  [0, 0.115],
];

const HELM: OutlinePoint[] = [
  [0, 0.205],
  [0.04, 0.2],
  [0.09, 0.18],
  [0.14, 0.14],
  [0.165, 0.09],
  [0.17, 0.03],
  [0.165, 0],
  [0.15, 0],
  [0.15, 0.03],
  [0.155, 0.09],
  [0.125, 0.135],
  [0.08, 0.165],
  [0.03, 0.185],
  [0, 0.19],
];

const NOSE_GUARD: OutlinePoint[] = [
  [0.13, 0.0],
  [0.165, 0.0],
  [0.172, -0.03],
  [0.19, -0.08],
  [0.184, -0.1],
  [0.165, -0.07],
  [0.135, -0.03],
];

const BOOT_SIDE: OutlinePoint[] = [
  [-0.1, 0.0],
  [0.2, 0.0],
  [0.228, 0.035],
  [0.225, 0.075],
  [0.14, 0.1],
  [0.08, 0.16],
  [0.07, 0.27],
  [-0.07, 0.28],
  [-0.1, 0.2],
  [-0.1, 0.05],
];

const SOLE_SIDE: OutlinePoint[] = [
  [-0.1, -0.005],
  [0.235, -0.005],
  [0.235, 0.035],
  [-0.1, 0.035],
];

const CUFF_SIDE: OutlinePoint[] = [
  [-0.105, 0.235],
  [0.08, 0.235],
  [0.085, 0.27],
  [-0.11, 0.275],
];

const STOCK: OutlinePoint[] = [
  [0.0, -0.05],
  [0.035, -0.08],
  [0.2, -0.075],
  [0.3, -0.05],
  [0.36, -0.02],
  [0.37, 0.02],
  [0.3, 0.04],
  [0.18, 0.05],
  [0.03, 0.06],
  [0.0, 0.05],
];

const LOCK: OutlinePoint[] = [
  [-0.04, -0.035],
  [0.09, -0.035],
  [0.1, 0.0],
  [0.09, 0.035],
  [-0.04, 0.035],
];

const FLARE: OutlinePoint[] = [
  [0, 0],
  [0.028, 0],
  [0.028, 0.012],
  [0.04, 0.035],
  [0.065, 0.07],
  [0.09, 0.095],
  [0.1, 0.1],
  [0, 0.1],
];

const BORE: OutlinePoint[] = [
  [0, 0],
  [0.08, 0],
  [0.08, 0.004],
  [0, 0.004],
];

// ---- radius profiles -----------------------------------------------------------------------------------------------

/** Piecewise-linear keys over t, for radius profiles. */
function ramp(stops: [number, number][]) {
  return (t: number) => {
    for (let i = 1; i < stops.length; i++) {
      const [t1, v1] = stops[i];
      const [t0, v0] = stops[i - 1];
      if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
    return stops[stops.length - 1][1];
  };
}

const torsoRx = ramp([[0, 0.16], [0.35, 0.2], [0.7, 0.2], [1, 0.17]]);
const torsoRy = ramp([[0, 0.13], [0.35, 0.165], [0.7, 0.15], [1, 0.12]]);
const sleeveRad = ramp([[0, 0.09], [0.5, 0.078], [1, 0.066]]);
const bracerRad = ramp([[0.56, 0.08], [1, 0.07]]);
const trouserRad = ramp([[0, 0.1], [0.5, 0.085], [0.55, 0.075], [1, 0.06]]);
const beardRx = ramp([[0, 0.12], [0.5, 0.11], [1, 0.03]]);
const beardRy = ramp([[0, 0.07], [0.5, 0.075], [1, 0.02]]);

// ---- point helpers -------------------------------------------------------------------------------------------------

/** Points on a horizontal ellipse. */
function circle(cx: number, cy: number, cz: number, rx: number, rz: number, n: number): V[] {
  const out: V[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([cx + rx * Math.cos(a), cy, cz + rz * Math.sin(a)]);
  }
  return out;
}

/** One strand of a braid: a helix round the centre path, `turns` full turns over its length. */
function strand(centre: Path, r: number, turns: number, phase: number, n: number): V[] {
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = centre.at(t);
    const a = phase + Math.PI * 2 * turns * t;
    out.push([p.x + r * Math.cos(a), p.y, p.z + r * Math.sin(a)]);
  }
  return out;
}

export default function build() {
  const b = createBuilder({ name: "dwarfRiflemanHaiku" });

  // ---- skeleton -------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.6, 0], [0, 0.76, 0.01], [0, 0.9, 0.02], [0, 1.0, 0]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });
  const chest = spine.joints[3];
  const head = b.joint("head", { parent: chest, at: [0, 1.06, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.99, 0.06], role: "jaw" });

  const shoulderR: V = [-0.2, 0.93, 0.02];
  const shoulderL: V = [0.2, 0.93, 0.02];
  const armRPts = limb(shoulderR, GRIP_R, [0.23, 0.22], [[-0.3, -1, -0.4]]);
  const armLPts = limb(shoulderL, GRIP_L, [0.23, 0.22], [[0.3, -1, -0.2]]);
  const armR = b.chain("armR", armRPts, { parent: chest, names: ["shoulderR", "elbowR", "handR"], role: "arm" });
  const armL = b.chain("armL", armLPts, { parent: chest, names: ["shoulderL", "elbowL", "handL"], role: "arm" });

  const legRPts = limb([-0.12, 0.6, 0], [-0.13, 0.1, 0.02], [0.27, 0.25], [[0, 0, 1]]);
  const legLPts = limb([0.12, 0.6, 0], [0.13, 0.1, 0.02], [0.27, 0.25], [[0, 0, 1]]);
  const legR = b.chain("legR", legRPts, { parent: hips, names: ["hipR", "kneeR", "ankleR"], role: "leg" });
  const legL = b.chain("legL", legLPts, { parent: hips, names: ["hipL", "kneeL", "ankleL"], role: "leg" });

  // ---- torso and legs -------------------------------------------------------------------------------------------
  const torso = b.sweep(spine, (t) => [torsoRx(t), torsoRy(t)] as [number, number], {
    color: TUNIC,
    caps: { start: "round", end: "flat" },
    name: "torso",
  });

  b.sweep(
    catmull([
      [0, 0.94, 0],
      [0, 1.02, 0],
      [0, 1.08, 0.01],
    ]),
    0.072,
    { color: SKIN, bone: head, name: "neck" },
  );
  b.sweep(circle(0, 0.975, 0, 0.175, 0.125, 16), 0.012, { color: BRASS, bone: chest, name: "collar" });

  // belt, buckle and pouches sit on the torso surface
  const beltLoop = b.surface(torso).loop([0, 0.66, 0], { dir: [0, 1, 0], lift: 0.016 });
  b.sweep(beltLoop, 0.021, { color: LEATHER, name: "belt" });
  const buckle = b.surface(torso).ray([0, 0.66, 1], [0, 0, -1]);
  if (buckle) b.stick(new THREE.BoxGeometry(0.07, 0.014, 0.055), BRASS, buckle, { embed: 0.2, name: "buckle" });
  for (const x of [-0.13, 0.13]) {
    const hit = b.surface(torso).ray([x, 0.66, 1], [0, 0, -1]);
    if (hit) b.stick(new THREE.BoxGeometry(0.07, 0.035, 0.06), LEATHER, hit, { embed: 0.2, name: "pouch" });
  }

  // a powder horn hangs from the left hip
  b.sweep(
    catmull([
      [0.19, 0.66, 0.02],
      [0.25, 0.56, 0.0],
      [0.235, 0.46, -0.03],
    ]),
    [0.03, 0.015],
    { color: HORN, bone: hips, name: "powderHorn" },
  );
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { bone: hips, at: [0.19, 0.66, 0.02], name: "hornCap" });

  for (const [leg, pts, side] of [
    [legR, legRPts, "R"],
    [legL, legLPts, "L"],
  ] as const) {
    b.sweep(leg, (t) => trouserRad(t), { color: TROUSER, name: `trouser${side}` });
    const knee = pts[1];
    b.part(new THREE.SphereGeometry(0.062, 10, 8), STEEL, {
      bone: leg.joints[1],
      at: [knee.x, knee.y, knee.z + 0.045],
      scale: [0.95, 1, 0.45],
      name: `kneeGuard${side}`,
    });
    const ankle = pts[2];
    const foot = leg.joints[2];
    const at: V = [ankle.x, 0, 0];
    b.extrude(BOOT_SIDE, { at, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.13, smoothing: 1, color: BOOT, bone: foot, name: `boot${side}` });
    b.extrude(SOLE_SIDE, { at, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.15, color: LEATHER, bone: foot, name: `sole${side}` });
    b.extrude(CUFF_SIDE, { at, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.14, smoothing: 1, color: BRASS, bone: foot, name: `cuff${side}` });
    b.part(new THREE.BoxGeometry(0.1, 0.035, 0.012), BRASS, { bone: foot, at: [at[0], 0.2, 0.084], name: `bootStrap${side}` });
  }

  // ---- arms, shoulders and hands ----------------------------------------------------------------------------------
  b.sweep(armR, (t) => sleeveRad(t), { from: 0, to: 0.62, color: TUNIC, name: "sleeveR" });
  b.sweep(armL, (t) => sleeveRad(t), { from: 0, to: 0.62, color: TUNIC, name: "sleeveL" });
  const bracerR = b.sweep(armR, (t) => bracerRad(t), { from: 0.56, to: 1, color: LEATHER, name: "bracerR" });
  const bracerL = b.sweep(armL, (t) => bracerRad(t), { from: 0.56, to: 1, color: LEATHER, name: "bracerL" });
  for (const bracer of [bracerR, bracerL])
    for (const t of [0.66, 0.84])
      for (const deg of [0, 90, 180, 270])
        b.stick(new THREE.SphereGeometry(0.009, 6, 4), BRASS, bracer.at(t, deg), { embed: 0.35, name: "bracerRivet" });

  for (const s of [1, -1]) {
    const x = s * 0.2;
    const side = s > 0 ? "L" : "R";
    b.lathe(PAULDRON, { at: [x, 0.93, 0], axis: [0, 1, 0], segments: 14, smoothing: 1, color: STEEL, bone: chest, name: `pauldron${side}` });
    b.part(new THREE.SphereGeometry(0.028, 8, 6), BRASS, { bone: chest, at: [x, 1.035, 0], name: `pauldronBoss${side}` });
    b.sweep(circle(x, 0.925, 0, 0.15, 0.15, 16), 0.009, { color: BRASS, bone: chest, name: `pauldronTrim${side}` });
    b.ring(frame([x, 0.93, 0], [0, 1, 0]), { count: 10, radius: 0.14 }, (item) =>
      b.stick(new THREE.SphereGeometry(0.0085, 6, 4), BRASS, item, { embed: 0.35, name: "pauldronRivet" }),
    );
  }

  for (const [hand, c] of [
    [armR.joints[2], GRIP_R],
    [armL.joints[2], GRIP_L],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.085, 12, 9), SKIN, { bone: hand, at: c, scale: [1, 0.95, 1.05], name: "fist" });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), SKIN, { bone: hand, at: [c[0], c[1] + 0.07, c[2] + 0.02], name: "thumb" });
    for (let k = 0; k < 4; k++)
      b.part(new THREE.SphereGeometry(0.024, 8, 6), SKIN, {
        bone: hand,
        at: [c[0] + (k - 1.5) * 0.032, c[1] - 0.02, c[2] + 0.07],
        name: "knuckle",
      });
  }

  // ---- head ---------------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(0.14, 16, 12), SKIN, {
    bone: head,
    at: [0, 1.06, 0],
    scale: [1, 1.05, 0.98],
    name: "skull",
  });
  b.frustumBox([0, 1.0, 0.02], [0, 0.95, 0.1], [0.1, 0.1], [0.075, 0.075], { bone: jaw, color: SKIN, name: "jawBox" });
  b.part(new THREE.SphereGeometry(0.042, 10, 8), NOSE, { bone: head, at: [0, 1.045, 0.15], scale: [0.9, 1, 1.1], name: "nose" });
  b.sweep(
    catmull([
      [-0.07, 1.035, 0.165],
      [0, 1.02, 0.18],
      [0.07, 1.035, 0.165],
    ]),
    [0.022, 0.016],
    { color: HAIR, bone: head, name: "moustache" },
  );
  b.sweep(
    catmull([
      [-0.1, 1.11, 0.12],
      [-0.115, 1.09, 0.1],
      [-0.125, 1.065, 0.075],
    ]),
    [0.005, 0.004],
    { color: SCAR, bone: head, name: "scar" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 8, 6), SKIN, { bone: head, at: [s * 0.14, 1.06, 0], scale: [0.45, 1, 0.8], name: "ear" });
    b.decal(skull, EYE, { at: [s * 0.05, 1.085, 0.14], dir: [0, 0, 1], size: [0.07, 0.045], mirror: s < 0, name: "eye" });
    b.sweep(
      catmull([
        [s * 0.02, 1.105, 0.135],
        [s * 0.07, 1.118, 0.128],
        [s * 0.12, 1.1, 0.1],
      ]),
      [0.016, 0.009],
      { color: HAIR_B, bone: head, name: "brow" },
    );
    b.sweep(
      catmull([
        [s * 0.135, 1.1, -0.02],
        [s * 0.14, 1.03, 0.0],
        [s * 0.13, 0.96, 0.05],
      ]),
      [0.03, 0.022],
      { color: HAIR, bone: head, name: "sideburn" },
    );
  }
  b.sweep(
    catmull([
      [0.12, 1.07, -0.1],
      [0, 1.05, -0.17],
      [-0.12, 1.07, -0.1],
    ]),
    [0.045, 0.035],
    { color: HAIR, bone: head, name: "nape" },
  );

  // ---- braided beard -------------------------------------------------------------------------------------------------
  b.sweep(
    catmull([
      [0, 1.02, 0.06],
      [0, 0.94, 0.14],
      [0, 0.86, 0.155],
      [0, 0.76, 0.13],
    ]),
    (t) => [beardRx(t), beardRy(t)] as [number, number],
    { color: HAIR, bone: jaw, name: "beard" },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.1, 1.03, 0.02],
        [s * 0.13, 0.95, 0.09],
        [s * 0.11, 0.86, 0.12],
        [s * 0.05, 0.78, 0.14],
      ]),
      [0.05, 0.02],
      { color: HAIR_B, bone: jaw, name: "cheekBeard" },
    );
  }

  // three braids: a centre braid down the front of the beard, and one on each side
  const braidStrands = [HAIR_A, HAIR_B, HAIR_C];
  const centreBraid = catmull([
    [0, 1.0, 0.17],
    [0, 0.92, 0.2],
    [0, 0.84, 0.2],
    [0, 0.76, 0.17],
  ]);
  for (let k = 0; k < 3; k++)
    b.sweep(catmull(strand(centreBraid, 0.02, 3, (k * Math.PI * 2) / 3, 24)), 0.011, {
      color: braidStrands[k],
      bone: jaw,
      name: `braidStrand${k}`,
    });
  b.sweep(circle(0, 0.74, 0.165, 0.026, 0.026, 14), 0.006, { color: BRASS, bone: jaw, name: "braidTie" });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), BRASS, { bone: jaw, at: [0, 0.715, 0.165], name: "braidBead" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sideBraid = catmull([
      [s * 0.11, 1.0, 0.1],
      [s * 0.13, 0.92, 0.13],
      [s * 0.11, 0.85, 0.12],
    ]);
    for (let k = 0; k < 3; k++)
      b.sweep(catmull(strand(sideBraid, 0.014, 2, (k * Math.PI * 2) / 3, 18)), 0.0075, {
        color: braidStrands[(k + 1) % 3],
        bone: jaw,
        name: `sideBraid${side}${k}`,
      });
    b.sweep(circle(s * 0.11, 0.84, 0.115, 0.02, 0.02, 12), 0.005, { color: BRASS, bone: jaw, name: `sideTie${side}` });
  }

  // ---- helm -------------------------------------------------------------------------------------------------------
  b.lathe(HELM, { at: [0, 1.125, 0], axis: [0, 1, 0], segments: 16, color: STEEL, bone: head, name: "helm" });
  b.sweep(circle(0, 1.127, 0, 0.172, 0.172, 18), 0.009, { color: BRASS, bone: head, name: "helmTrim" });
  b.ring(frame([0, 1.127, 0], [0, 1, 0]), { count: 16, radius: 0.166 }, (item) =>
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), BRASS, item, { embed: 0.3, name: "helmRivet" }),
  );
  b.sweep(
    catmull([
      [0, 1.155, 0.168],
      [0, 1.265, 0.142],
      [0, 1.305, 0.092],
      [0, 1.33, 0.042],
      [0, 1.335, 0.0],
      [0, 1.33, -0.042],
      [0, 1.305, -0.092],
      [0, 1.265, -0.142],
      [0, 1.155, -0.168],
    ]),
    0.007,
    { color: BRASS, bone: head, name: "helmRidge" },
  );
  b.extrude(NOSE_GUARD, { at: [0, 1.125, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, color: STEEL, bone: head, name: "noseGuard" });
  b.cards(
    [
      frame([0, 1.33, -0.03], [0, 0.25, -1]),
      frame([0, 1.305, -0.08], [0, 0.25, -1]),
      frame([0, 1.265, -0.13], [0, 0.25, -1]),
    ],
    FEATHER,
    { size: [0.05, 0.17], lean: 10, bend: 20, sink: 0.05, cross: true, bone: head },
  );

  // ---- blunderbuss: butt under the right arm, muzzle across the chest to the left ------------------------------
  const dir = GUN_DIR;
  const butt = new THREE.Vector3(...GRIP_R).addScaledVector(dir, -0.22);
  const muzzle = new THREE.Vector3(...GRIP_L).addScaledVector(dir, 0.3);
  const along = (u: number) => butt.clone().addScaledVector(dir, u);
  const upAlong = new THREE.Vector3(0, 1, 0).addScaledVector(dir, -dir.y).normalize();
  const side = new THREE.Vector3().crossVectors(dir, upAlong).normalize();
  if (side.x < 0) side.negate();
  const gun = { bone: chest };

  b.extrude(STOCK, { at: butt, x: dir, y: upAlong, thickness: 0.07, bevel: 0.01, smoothing: 1, color: WOOD, ...gun, name: "stock" });
  b.rod(along(-0.012), along(0.01), 0.058, { color: BRASS, ...gun, name: "buttPlate" });
  b.sweep([along(0.3), muzzle.clone().addScaledVector(dir, -0.1)], [0.02, 0.028], { color: STEEL, ...gun, name: "barrel" });
  for (const u of [0.4, 0.52, 0.62])
    b.rod(along(u - 0.008), along(u + 0.008), 0.03, { color: BRASS, ...gun, name: "barrelBand" });
  b.extrude(LOCK, { at: along(0.1).addScaledVector(side, 0.04), x: dir, y: upAlong, thickness: 0.012, bevel: 0.003, color: BRASS, ...gun, name: "lock" });
  b.part(new THREE.BoxGeometry(0.018, 0.03, 0.02), DARKSTEEL, { ...gun, at: along(0.1).addScaledVector(side, 0.055).addScaledVector(upAlong, 0.03), name: "hammer" });
  b.lathe(FLARE, { at: muzzle.clone().addScaledVector(dir, -0.1), axis: dir, segments: 14, smoothing: 1, color: BRASS, ...gun, name: "muzzle" });
  b.lathe(BORE, { at: muzzle.clone().addScaledVector(dir, -0.001), axis: dir, color: DARKSTEEL, ...gun, name: "bore" });

  return b.root;
}
