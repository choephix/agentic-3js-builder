import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { lerp } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mix, mottle, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout, heroic dwarf in blue-steel plate and a tartan kilt: horned helm with a red plume, huge ginger beard with gold-ringed braids, and a flared brass-banded blunderbuss grounded at his side while his other fist hoists a mug.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette
const SKIN = "#e29a6c";
const HAIR = "#e0661a";
const HAIR_D = "#9a3410";
const HAIR_L = "#ffa63a";
const STEEL = "#7f93b2";
const STEEL_D = "#4a5a78";
const GOLD = "#f2b82c";
const GOLD_D = "#b4791a";
const BLUE = "#2c58c0";
const BLUE_D = "#1b3a86";
const LEATHER = "#7a4524";
const LEATHER_D = "#442612";
const WOOD = "#8a5a2c";
const WOOD_D = "#4f2f15";
const RED = "#b02a22";
const IVORY = "#f2e6c8";
const DARK = "#1b1220";
const WHITE = "#f4efe0";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Hand-painted lighting: warm on top, cool below, with wear blotches and dirt near the floor. */
function lit(base: ColorInput, seed = 1, wear = 0.3) {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const t = smoothstep(-0.55, 0.85, n.y * 0.8 + n.z * 0.3 + n.x * 0.1);
    const lo = mix(c, "#1c1233", 0.4);
    const hi = mix(c, "#fff0c0", 0.26);
    let out = mix(lo, hi, t);
    const w = smoothstep(0.62, 0.82, noise(p, 0.05, seed));
    out = mix(out, lo, w * wear);
    out = mix(out, "#3a2a1a", smoothstep(0.25, 0.0, p.y) * 0.35);
    return out;
  });
}

const GUN_DIR = V(0, 0.945, 0.327).normalize();

const plaid = paint((_p, _n, s) => {
  const a = (s[1] / 360) * 1.75;
  const cu = ((a % 0.07) + 0.07) % 0.07;
  const cv = ((s[0] % 0.07) + 0.07) % 0.07;
  if (cu < 0.012 || cv < 0.012) return "#3a0d0c";
  if (cu < 0.03 && cv < 0.03) return "#d8432e";
  if (cu > 0.05 && cv > 0.05) return "#1f3f87";
  return RED;
});

const P = {
  skin: lit(mottle(SKIN, "#d4784f", { size: 0.07, contrast: 0.6, seed: 3 }), 2, 0.1),
  tunic: lit(grain(BLUE, BLUE_D, { size: 0.012 }), 3, 0.25),
  pants: lit(grain("#5a4630", "#3d2e1e", { size: 0.01 }), 4, 0.3),
  leather: lit(grain(LEATHER, LEATHER_D, { size: 0.012, axis: "x" }), 5, 0.45),
  leatherD: lit(LEATHER_D, 6, 0.4),
  steel: lit(STEEL, 7, 0.5),
  steelD: lit(STEEL_D, 8, 0.5),
  gold: lit(GOLD, 9, 0.15),
  brass: lit(GOLD_D, 12, 0.3),
  wood: lit(grain(WOOD, WOOD_D, { size: 0.01, axis: [0, 0.945, 0.327] }), 10, 0.3),
  hair: lit(grain(grain(HAIR, HAIR_L, { size: 0.02, seed: 2 }), HAIR_D, { size: 0.012 }), 11, 0.1),
  kilt: lit(plaid, 13, 0.2),
  red: lit(RED, 14, 0.3),
  ivory: lit(IVORY, 15, 0.2),
  barrel: lit(grain("#59657c", "#2f3849", { size: 0.01, axis: [0, 0.945, 0.327] }), 16, 0.5),
};

const TABARD = svg(
  `<svg viewBox="0 0 64 96"><path d="M3 2H61V76L32 94L3 76Z" fill="#7d1f1a" stroke="#f2b82c" stroke-width="3.5" stroke-linejoin="round"/><path d="M9 8H55V72L32 87L9 72Z" fill="none" stroke="#e2a226" stroke-width="1.5"/><circle cx="32" cy="30" r="13" fill="#f2b82c"/><circle cx="32" cy="30" r="9" fill="#c4621a"/><path d="M12 66 L27 38 L33 48 L39 40 L52 66Z" fill="#3a1410" stroke="#f2b82c" stroke-width="2.2" stroke-linejoin="round"/><path d="M27 38 L30 44 L26 46Z" fill="#fff2c8"/><path d="M20 70 H44" stroke="#f2b82c" stroke-width="2.5"/></svg>`,
  { size: 256 },
);

// torso section radius, shared with the strap placement
const torsoRx = (t: number) => 0.19 + 0.1 * Math.sin(Math.PI * Math.pow(Math.min(Math.max(t, 0), 1), 1.3));
const plateZ = (x: number, y: number) =>
  0.06 + 0.17 * Math.sqrt(Math.max(0, 1 - ((y - 0.86) / 0.2) ** 2 - (x / 0.285) ** 2));
const torsoZ = (x: number, y: number) => {
  const rx = torsoRx((y - 0.56) / 0.42);
  return 0.025 + 0.17 * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
};

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", paintSize: 2048 });
  const HY = 1.12;

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.56, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.56, 0],
      [0, 0.77, 0.015],
      [0, 0.98, 0.025],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chestTop"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    [
      [0, 0.98, 0.02],
      [0, 1.05, 0.04],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.05, 0.04], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HY - 0.06, 0.06],
    aim: [0, HY - 0.085, 0.2],
    role: "jaw",
  });

  // ---------- torso ----------
  b.sweep(spine, (t) => [torsoRx(t), 0.17], { color: P.tunic });
  // breast and back plates
  b.part(new THREE.SphereGeometry(1, 14, 10), P.steel, { bone: chest, at: [0, 0.86, 0.06], scale: [0.285, 0.2, 0.17] });
  b.part(new THREE.SphereGeometry(1, 12, 8), P.steelD, { bone: chest, at: [0, 0.86, -0.07], scale: [0.27, 0.2, 0.15] });
  // gold ridge and rivets on the breastplate
  b.rod(V(0, 0.73, plateZ(0, 0.73) + 0.005), V(0, 0.99, plateZ(0, 0.99) + 0.005), 0.014, P.gold, { bone: chest, sides: 6 });
  for (const [x, y] of [
    [0.15, 0.93],
    [-0.15, 0.93],
    [0.2, 0.83],
    [-0.2, 0.83],
    [0.14, 0.75],
    [-0.14, 0.75],
  ])
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.gold, { bone: chest, at: [x, y, plateZ(x, y) + 0.004] });
  // plate rim at the bottom of the breastplate
  b.part(new THREE.TorusGeometry(0.255, 0.012, 5, 16), P.gold, {
    bone: chest,
    at: [0, 0.7, 0.03],
    rotation: [90, 0, 0],
    scale: [1, 0.78, 1],
  });
  // gorget
  b.part(new THREE.TorusGeometry(0.1, 0.034, 6, 14), P.steel, {
    bone: chest,
    at: [0, 1.0, 0.025],
    rotation: [90, 0, 0],
    scale: [1, 1.1, 1],
  });
  // bandolier with charges
  const strap = catmull(
    Array.from({ length: 9 }, (_, i) => {
      const u = i / 8;
      const x = 0.2 - 0.42 * u;
      const y = 1.0 - 0.36 * u;
      return [x, y, Math.max(plateZ(x, y), torsoZ(x, y)) + 0.022];
    }),
  );
  b.sweep(strap, 0.022, { color: P.leather, bone: chest, sides: 6 });
  b.part(new THREE.BoxGeometry(0.045, 0.045, 0.02), P.gold, { bone: chest, at: strap.at(0.5) });
  for (const u of [0.02, 0.08, 0.14, 0.8, 0.88, 0.96]) {
    const q = strap.at(u);
    b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.08, 7), P.brass, { bone: chest, at: [q.x, q.y - 0.005, q.z + 0.026] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 7), P.leatherD, { bone: chest, at: [q.x, q.y + 0.04, q.z + 0.026] });
  }
  // backpack, bedroll, pot
  b.part(new THREE.BoxGeometry(0.34, 0.3, 0.14), P.leather, { bone: chest, at: [0, 0.84, -0.24] });
  b.part(new THREE.BoxGeometry(0.35, 0.12, 0.15), P.leatherD, { bone: chest, at: [0, 0.93, -0.245] });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), P.gold, { bone: chest, at: [0, 0.89, -0.32] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.46, 10), P.tunic, {
    bone: chest,
    at: [0, 1.03, -0.26],
    rotation: [0, 0, 90],
  });
  for (const x of [-0.12, 0.12])
    b.part(new THREE.TorusGeometry(0.072, 0.008, 4, 10), P.leatherD, {
      bone: chest,
      at: [x, 1.03, -0.26],
      rotation: [0, 90, 0],
    });
  b.part(new THREE.CylinderGeometry(0.06, 0.052, 0.09, 9), P.steelD, { bone: chest, at: [0.17, 0.72, -0.31] });
  b.part(new THREE.TorusGeometry(0.04, 0.005, 4, 8, Math.PI), P.steel, { bone: chest, at: [0.17, 0.77, -0.31] });
  for (const s of [1, -1]) b.rod(V(s * 0.1, 1.0, -0.19), V(s * 0.12, 0.7, -0.2), 0.016, P.leatherD, { bone: chest, sides: 5 });

  // ---------- belt, kilt, tabard ----------
  b.part(new THREE.TorusGeometry(0.235, 0.035, 6, 18), P.leather, {
    bone: hips,
    at: [0, 0.63, -0.005],
    rotation: [90, 0, 0],
    scale: [1, 0.82, 1],
  });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.gold, {
      bone: hips,
      at: [Math.sin(a) * 0.272, 0.63, Math.cos(a) * 0.272 * 0.82 - 0.005],
    });
  }
  b.part(new THREE.BoxGeometry(0.08, 0.065, 0.026), P.gold, { bone: hips, at: [0, 0.63, 0.232] });
  b.part(new THREE.BoxGeometry(0.045, 0.035, 0.03), DARK, { bone: hips, at: [0, 0.63, 0.234] });
  b.lathe(
    [
      [0.215, 0.03],
      [0.27, 0.03],
      [0.31, -0.19],
      [0.295, -0.2],
      [0.21, -0.01],
    ],
    { at: [0, 0.65, 0], bone: hips, color: P.kilt, segments: 14 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.3), "#ffffff", { bone: hips, at: [0, 0.45, 0.312], texture: TABARD });
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.02), P.gold, { bone: hips, at: [0, 0.605, 0.305] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.09, 0.1, 0.05), P.leather, {
      bone: hips,
      at: [s * 0.19, 0.56, 0.235],
      rotation: [0, s * 35, 0],
    });
    b.part(new THREE.BoxGeometry(0.095, 0.04, 0.056), P.leatherD, {
      bone: hips,
      at: [s * 0.19, 0.598, 0.236],
      rotation: [0, s * 35, 0],
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), P.gold, { bone: hips, at: [s * 0.2, 0.575, 0.268] });
  }
  // powder horn on the left hip
  b.sweep(
    catmull([
      [0.24, 0.64, -0.08],
      [0.31, 0.55, -0.15],
      [0.35, 0.42, -0.14],
      [0.33, 0.31, -0.08],
    ]),
    [0.045, 0.012],
    { color: P.ivory, bone: hips, caps: { start: "round", end: "point" }, sides: 7 },
  );
  b.part(new THREE.SphereGeometry(0.05, 7, 5), P.gold, { bone: hips, at: [0.24, 0.64, -0.08] });
  b.rod(V(0.2, 0.7, -0.05), V(0.31, 0.58, -0.15), 0.008, P.leatherD, { bone: hips, sides: 5 });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.11, 0.56, 0), V(s * 0.12, 0.1, 0.02), [0.27, 0.26], [0, 0, 1]);
    const leg = b.chain("leg" + side, pts, {
      parent: hips,
      names: ["hip" + side, "knee" + side, "ankle" + side],
      role: "leg",
      contact: [s * 0.12, 0, 0.06],
    });
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    const kneeP = pts[1];
    const ankleP = pts[2];
    b.sweep(leg, [0.1, 0.09, 0.075, 0.07], { color: P.pants });
    // boot shaft and cuff
    b.rod(ankleP, lerp(ankleP, kneeP, 0.42), 0.088, P.leather, { bone: kneeJ, sides: 8 });
    b.rod(lerp(ankleP, kneeP, 0.4), lerp(ankleP, kneeP, 0.46), 0.097, P.leatherD, { bone: kneeJ, sides: 8 });
    b.part(new THREE.BoxGeometry(0.03, 0.035, 0.012), P.gold, {
      bone: kneeJ,
      at: lerp(ankleP, kneeP, 0.43).add(V(0, 0, 0.098)),
    });
    // foot
    b.part(new THREE.BoxGeometry(0.15, 0.12, 0.27), P.leather, { bone: ankleJ, at: [s * 0.12, 0.06, 0.075] });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), P.leather, {
      bone: ankleJ,
      at: [s * 0.12, 0.055, 0.2],
      scale: [1, 0.75, 0.9],
    });
    b.part(new THREE.BoxGeometry(0.15, 0.04, 0.08), P.leatherD, { bone: ankleJ, at: [s * 0.12, 0.02, -0.03] });
    b.part(new THREE.BoxGeometry(0.16, 0.025, 0.3), P.leatherD, { bone: ankleJ, at: [s * 0.12, 0.0125, 0.08] });
    b.part(new THREE.BoxGeometry(0.06, 0.02, 0.04), P.steel, { bone: ankleJ, at: [s * 0.12, 0.085, 0.22] });
    // knee guard
    b.part(new THREE.SphereGeometry(0.065, 8, 6), P.steel, {
      bone: kneeJ,
      at: kneeP.clone().add(V(0, 0, 0.055)),
      scale: [1, 1, 0.8],
    });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), P.gold, { bone: kneeJ, at: kneeP.clone().add(V(0, 0, 0.105)) });
  }

  // ---------- arms ----------
  const gunB = V(-0.4, 0.006, 0);
  const gunP = V(0, -0.327, 0.945).normalize();
  const g = (x: number, y = 0, side = 0) =>
    gunB.clone().addScaledVector(GUN_DIR, x).addScaledVector(gunP, y).add(V(side, 0, 0));
  const fistR = g(0.58);

  const armR = b.chain(
    "armR",
    limb(V(-0.31, 0.94, 0), fistR.clone().addScaledVector(gunP, -0.04), [0.25, 0.24], [-1, 0, -0.6]),
    { parent: chest, names: ["shoulderR", "elbowR", "wristR"], role: "arm" },
  );
  const armL = b.chain("armL", limb(V(0.31, 0.94, 0), V(0.38, 0.62, 0.1), [0.25, 0.24], [1, 0, -0.6]), {
    parent: chest,
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  for (const [arm, s] of [
    [armR, -1],
    [armL, 1],
  ] as const) {
    b.sweep(arm, [0.085, 0.078, 0.068, 0.062], {
      color: P.skin,
      bands: [
        [0.46, P.tunic],
        [1, P.skin],
      ],
    });
    const sh = arm.joints[0];
    const el = arm.joints[1];
    const wr = arm.joints[2];
    // bracer and elbow cap
    const elbowP = arm.at(0.5).at;
    const wristP = arm.at(1).at;
    b.rod(lerp(elbowP, wristP, 0.45), lerp(elbowP, wristP, 0.92), 0.069, P.steel, { bone: el, sides: 8 });
    b.rod(lerp(elbowP, wristP, 0.42), lerp(elbowP, wristP, 0.48), 0.073, P.gold, { bone: el, sides: 8 });
    b.part(new THREE.SphereGeometry(0.05, 7, 5), P.steelD, { bone: el, at: elbowP.clone().add(V(s * 0.045, 0, -0.04)) });
    // layered pauldrons
    const tilts = [22, 30, 38];
    const sizes = [0.15, 0.135, 0.12];
    const ys = [0.975, 0.935, 0.895];
    tilts.forEach((tilt, i) => {
      const r = sizes[i];
      const a = (tilt * Math.PI) / 180;
      const axis = V(s * Math.sin(a), Math.cos(a), 0);
      const outline: OutlinePoint[] = [
        [0, 0],
        [r, 0],
        [r * 1.03, r * 0.08],
        [r * 0.97, r * 0.16],
        [r * 0.85, r * 0.3],
        [r * 0.62, r * 0.5],
        [r * 0.32, r * 0.68],
        [0, r * 0.74],
      ];
      const dome = paint((_p, _n, st) => (st[0] < r * 0.09 ? P.gold : i === 1 ? P.steelD : P.steel));
      b.lathe(outline, { at: [s * (0.33 + i * 0.012), ys[i], 0], axis: [axis.x, axis.y, axis.z], bone: sh, color: dome, segments: 10 });
      if (i === 0) {
        b.spike(V(s * 0.33, ys[0], 0).addScaledVector(axis, r * 0.7), axis, 0.1, 0.03, P.gold, { bone: sh, sides: 6 });
        for (let k = 0; k < 5; k++) {
          const th = (k / 5) * Math.PI * 2;
          const rr = r * 0.8;
          const side = V(Math.cos(th), 0, Math.sin(th));
          const pos = V(s * 0.33, ys[0], 0).addScaledVector(side, rr).addScaledVector(axis, r * 0.12);
          b.part(new THREE.SphereGeometry(0.011, 5, 4), P.gold, { bone: sh, at: pos });
        }
      }
    });
  }

  // ---------- right hand and blunderbuss ----------
  const wristR = armR.joints[2];
  b.part(new THREE.SphereGeometry(1, 8, 6), P.skin, { bone: wristR, at: fistR, scale: [0.075, 0.07, 0.07] });
  for (let k = 0; k < 4; k++) {
    const c = fistR.clone().addScaledVector(gunP, 0.055).addScaledVector(GUN_DIR, -0.045 + 0.03 * k);
    b.capsule(c.clone().add(V(0.065, 0, 0)), c.clone().add(V(-0.065, 0, 0)), 0.0185, P.skin, { bone: wristR, sides: 6 });
  }
  b.capsule(
    fistR.clone().addScaledVector(gunP, -0.05).addScaledVector(GUN_DIR, -0.06),
    fistR.clone().addScaledVector(gunP, -0.05).addScaledVector(GUN_DIR, 0.05),
    0.02,
    P.skin,
    { bone: wristR, sides: 6 },
  );
  const stockOutline: OutlinePoint[] = [
    [0, -0.08],
    [0, 0.03],
    [0.14, 0.05],
    [0.3, 0.045],
    [0.46, 0.035],
    [0.46, -0.03],
    [0.34, -0.035],
    [0.27, -0.1],
    [0.2, -0.1],
    [0.12, -0.07],
  ];
  b.extrude(stockOutline, {
    at: gunB,
    x: [GUN_DIR.x, GUN_DIR.y, GUN_DIR.z],
    y: [gunP.x, gunP.y, gunP.z],
    thickness: 0.07,
    bevel: 0.01,
    color: P.wood,
    bone: wristR,
  });
  b.part(new THREE.BoxGeometry(0.08, 0.012, 0.12), P.brass, { bone: wristR, at: g(0.004, -0.025), dir: GUN_DIR });
  for (let k = 0; k < 5; k++)
    b.part(new THREE.SphereGeometry(0.008, 5, 4), P.gold, { bone: wristR, at: g(0.1 + 0.07 * k, 0.012, -0.036) });
  // barrel: flares into a bell mouth
  const rad = (u: number) => (u < 0.7 ? 0.034 + 0.012 * u : 0.0424 + ((u - 0.7) / 0.3) ** 2 * 0.065);
  const bpos = (u: number) => g(0.3 + 0.62 * u);
  b.sweep([bpos(0), bpos(1)], (t) => rad(t), {
    color: P.barrel,
    bone: wristR,
    caps: { start: "flat", end: "flat" },
    sides: 10,
  });
  for (const u of [0.04, 0.3, 0.55, 0.8])
    b.rod(bpos(u), bpos(u + 0.035), rad(u + 0.017) + 0.008, P.gold, { bone: wristR, sides: 10 });
  b.part(new THREE.TorusGeometry(0.103, 0.014, 5, 14), P.gold, { bone: wristR, at: bpos(1), dir: GUN_DIR, axis: "z" });
  b.part(new THREE.CircleGeometry(0.092, 12), DARK, { bone: wristR, at: bpos(1).addScaledVector(GUN_DIR, 0.003), dir: GUN_DIR, axis: "z" });
  b.part(new THREE.SphereGeometry(0.052, 8, 6), P.steelD, { bone: wristR, at: g(0.3) });
  b.rod(g(0.34, -0.047), g(0.9, -0.047), 0.007, P.wood, { bone: wristR, sides: 5 });
  // flintlock
  b.part(new THREE.BoxGeometry(0.012, 0.12, 0.035), P.brass, { bone: wristR, at: g(0.28, 0, -0.04), dir: GUN_DIR });
  b.part(new THREE.BoxGeometry(0.014, 0.055, 0.02), P.steelD, {
    bone: wristR,
    at: g(0.33, 0.045, -0.05),
    dir: gunP.clone().add(GUN_DIR),
  });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), P.gold, { bone: wristR, at: g(0.26, 0.035, -0.05) });
  b.part(new THREE.TorusGeometry(0.035, 0.006, 4, 10), P.steelD, { bone: wristR, at: g(0.31, -0.08), dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.BoxGeometry(0.012, 0.03, 0.008), P.steelD, { bone: wristR, at: g(0.3, -0.07) });

  // ---------- left hand with ale mug ----------
  const wristL = armL.joints[2];
  b.part(new THREE.SphereGeometry(1, 8, 6), P.skin, { bone: wristL, at: [0.38, 0.6, 0.13], scale: [0.072, 0.07, 0.072] });
  for (let k = 0; k < 3; k++)
    b.capsule(V(0.34, 0.585 + 0.03 * k, 0.16), V(0.42, 0.585 + 0.03 * k, 0.16), 0.017, P.skin, { bone: wristL, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.055, 0.05, 0.12, 9), P.wood, { bone: wristL, at: [0.38, 0.66, 0.235] });
  for (const dy of [-0.04, 0.04])
    b.part(new THREE.TorusGeometry(0.054, 0.006, 4, 12), P.gold, {
      bone: wristL,
      at: [0.38, 0.66 + dy, 0.235],
      rotation: [90, 0, 0],
    });
  b.part(new THREE.SphereGeometry(1, 8, 5), WHITE, { bone: wristL, at: [0.38, 0.725, 0.235], scale: [0.058, 0.03, 0.058] });
  b.part(new THREE.TorusGeometry(0.03, 0.008, 4, 8), P.gold, { bone: wristL, at: [0.38, 0.66, 0.17], dir: [1, 0, 0], axis: "z" });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 14, 10), P.skin, { bone: head, at: [0, HY + 0.01, 0.07], scale: [0.16, 0.14, 0.15] });
  b.part(new THREE.SphereGeometry(1, 10, 7), P.skin, { bone: jaw, at: [0, HY - 0.09, 0.12], scale: [0.1, 0.055, 0.095] });
  b.part(new THREE.SphereGeometry(1, 7, 5), DARK, { bone: jaw, at: [0, HY - 0.065, 0.2], scale: [0.04, 0.015, 0.02] });
  b.part(new THREE.SphereGeometry(0.048, 8, 6), "#e8806a", { bone: head, at: [0, HY - 0.01, 0.235] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 7, 5), "#e08a6a", { bone: head, at: [s * 0.1, HY - 0.025, 0.17] });
    b.part(new THREE.SphereGeometry(0.035, 6, 5), P.skin, { bone: head, at: [s * 0.152, HY, 0.05], scale: [0.6, 1.1, 0.8] });
    b.part(new THREE.SphereGeometry(0.026, 8, 6), WHITE, { bone: head, at: [s * 0.065, HY + 0.03, 0.195] });
    b.part(new THREE.SphereGeometry(0.0155, 6, 5), "#3a7fd8", { bone: head, at: [s * 0.066, HY + 0.03, 0.215] });
    b.part(new THREE.SphereGeometry(0.0075, 5, 4), DARK, { bone: head, at: [s * 0.067, HY + 0.03, 0.227] });
    b.part(new THREE.BoxGeometry(0.075, 0.028, 0.04), HAIR_D, {
      bone: head,
      at: [s * 0.07, HY + 0.065, 0.195],
      rotation: [0, 0, s * 18],
    });
    // moustache
    b.sweep(
      catmull([
        [s * 0.01, HY - 0.035, 0.235],
        [s * 0.07, HY - 0.045, 0.25],
        [s * 0.14, HY - 0.07, 0.225],
        [s * 0.19, HY - 0.04, 0.17],
      ]),
      [0.042, 0.012],
      { color: P.hair, bone: head, sides: 7 },
    );
    // sideburns
    b.sweep(
      catmull([
        [s * 0.15, HY + 0.05, 0.04],
        [s * 0.16, HY - 0.02, 0.08],
        [s * 0.12, HY - 0.08, 0.14],
      ]),
      [0.035, 0.05],
      { color: P.hair, bone: head, sides: 7 },
    );
    // cheek guards and helm horns
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.1), P.steel, { bone: head, at: [s * 0.172, HY + 0.07, 0.05], rotation: [0, 0, -s * 8] });
    b.sweep(
      catmull([
        [s * 0.165, HY + 0.14, 0.07],
        [s * 0.235, HY + 0.18, 0.07],
        [s * 0.26, HY + 0.28, 0.07],
        [s * 0.22, HY + 0.36, 0.07],
      ]),
      [0.032, 0.0],
      { color: P.ivory, bone: head, caps: { start: "flat", end: "point" }, sides: 7 },
    );
    b.part(new THREE.TorusGeometry(0.032, 0.008, 4, 8), P.gold, {
      bone: head,
      at: [s * 0.172, HY + 0.145, 0.07],
      rotation: [0, 0, 90 - s * 20],
    });
  }
  // main beard
  b.sweep(
    catmull([
      [0, HY - 0.07, 0.16],
      [0, HY - 0.14, 0.2],
      [0, HY - 0.25, 0.215],
      [0, HY - 0.45, 0.215],
    ]),
    (t) => [0.15 * (1 - 0.55 * t), 0.075 * (1 - 0.25 * t)],
    { color: P.hair, bone: head, caps: { start: "round", end: "point" }, sides: 9 },
  );
  // braids
  for (const s of [1, -1]) {
    const path = catmull([
      [s * 0.075, HY - 0.1, 0.215],
      [s * 0.085, HY - 0.22, 0.265],
      [s * 0.07, HY - 0.36, 0.285],
      [s * 0.06, HY - 0.5, 0.28],
    ]);
    const n = 11;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      b.part(new THREE.SphereGeometry(0.032 * (1 - 0.4 * t), 6, 5), i % 2 ? HAIR_D : HAIR, {
        bone: head,
        at: path.at(t),
        scale: [1, 1.25, 0.9],
        rotation: [0, 0, (i % 2 ? 1 : -1) * 28],
      });
    }
    for (const t of [0.3, 0.62, 0.95])
      b.part(new THREE.TorusGeometry(0.034 * (1 - 0.35 * t), 0.008, 4, 8), P.gold, {
        bone: head,
        at: path.at(t),
        rotation: [90, 0, 0],
      });
    b.spike(path.at(1), [0, -1, 0], 0.07, 0.028, HAIR_L, { bone: head, sides: 6 });
  }
  // back hair
  b.sweep(
    catmull([
      [0, HY + 0.1, -0.1],
      [0, HY - 0.05, -0.17],
      [0, 1.0, -0.15],
    ]),
    [0.1, 0.06],
    { color: P.hair, bone: head, sides: 7 },
  );

  // ---------- helmet ----------
  const HYB = HY + 0.09;
  const helmPaint = paint((_p, _n, st) => (st[0] < 0.03 || (st[0] > 0.085 && st[0] < 0.1) ? P.gold : P.steel));
  b.lathe(
    [
      [0, 0],
      [0.165, 0],
      [0.17, 0.03],
      [0.165, 0.05],
      [0.15, 0.1],
      [0.115, 0.15],
      [0.06, 0.19],
      [0, 0.205],
    ],
    { at: [0, HYB, 0.07], bone: head, color: helmPaint, segments: 12 },
  );
  b.part(new THREE.BoxGeometry(0.03, 0.08, 0.012), P.steel, { bone: head, at: [0, HYB - 0.03, 0.226] });
  b.extrude(
    [
      [-0.15, 0],
      [0.15, 0],
      [0.11, 0.06],
      [0.03, 0.115],
      [-0.06, 0.095],
      [-0.14, 0.05],
    ],
    { at: [0, HYB + 0.12, 0.07], x: [0, 0, 1], thickness: 0.03, bevel: 0.006, color: P.red, bone: head },
  );
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.011, 5, 4), P.gold, {
      bone: head,
      at: [Math.sin(a) * 0.174, HYB + 0.012, 0.07 + Math.cos(a) * 0.174],
    });
  }

  return b.root;
}
