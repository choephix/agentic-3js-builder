import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, mix, mottle, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, long-armed swamp troll with curling tusks, a flaming mohawk, mossy hump, war paint and a harness of bone fetishes, skulls and feathers.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette
const GREEN = "#4f9a4a";
const GREEN_D = "#2f6e3c";
const BELLY = "#a8b86a";
const MOSS = "#6f9a2a";
const MUD = "#4a3a24";
const SKIN_D = "#3f7440";
const BONE = "#e8dcb4";
const BONE_L = "#fff4d0";
const BONE_D = "#b89e6a";
const CLAW = "#2b2418";
const LEATHER = "#7a4a26";
const LEATHER_D = "#46281a";
const GOLD = "#e8b230";
const TEETH = "#efe3b5";
const DARKRED = "#7a1a2a";
const EYE = "#f6d52a";
const PUPIL = "#1a1208";
const SOCKET = "#1b140d";
const WART = "#7d9a3e";
const FEATHER_R = "#d6342e";
const FEATHER_T = "#27b8b0";
const FEATHER_Y = "#f2b830";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Y = V(0, 1, 0);
const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

const leaf = (l: number): OutlinePoint[] => [
  [0, 0],
  [0.03 * l, 0.05 * l],
  [0.028 * l, 0.13 * l],
  [0, 0.22 * l, "sharp"],
  [-0.028 * l, 0.13 * l],
  [-0.03 * l, 0.05 * l],
];

export default function build() {
  const b = createBuilder({ name: "swampTroll" });

  // Paints
  const skinBase = countershade(mottle(GREEN, GREEN_D, { size: 0.28, seed: 2 }), BELLY, { level: -0.15, soft: 0.3 });
  const SKIN = paint((p, n) => {
    if (n.y > 0.55 && p.y > 1.2 && noise(p, 0.2, 7) > 0.56) return MOSS;
    let c = resolve(skinBase, p, n);
    c = mix(c, "#d6f08a", 0.2 * smoothstep(0.2, 0.9, n.y));
    c = mix(c, "#13302b", 0.3 * smoothstep(0.0, -0.9, n.y));
    c = mix(c, MUD, 0.75 * smoothstep(0.3, 0.06, p.y));
    return c;
  });
  const LOINBASE = mottle(LEATHER, LEATHER_D, { size: 0.05, seed: 4 });
  const LOIN = paint((_p, _n, s) => (s[1] > -0.05 ? DARKRED : Math.abs(s[1] + 0.2) < 0.012 ? GOLD : LOINBASE));

  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.05, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.05, 0],
      [0, 1.36, 0.1],
      [0, 1.68, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.68, 0.22],
      [0, 1.78, 0.44],
      [0, 1.84, 0.68],
    ]),
    { parent: chest, names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const head = neck.tip!;
  const H = head.at.clone();
  const C = V(H.x, H.y + 0.06, H.z + 0.14);
  const h = (x: number, y: number, z: number) => V(C.x + x, C.y + y, C.z + z);
  const jaw = b.joint("jaw", { parent: head, at: h(0, -0.1, -0.02), aim: h(0, -0.12, 0.3), role: "jaw" });

  // Body
  const torso = b.sweep(
    spine,
    (t) => [0.4 + 0.2 * smoothstep(0.25, 1, t), 0.3 + 0.1 * Math.sin(Math.PI * Math.min(t * 1.1, 1))],
    { color: SKIN, sides: 12, shift: (t) => [0, -0.07 * Math.sin(Math.PI * t) - 0.04] },
  );
  b.sweep(
    neck,
    [0.23, 0.2, 0.19],
    { color: SKIN, sides: 10 },
  );
  const hump = b.part(sph(10, 8), SKIN, { bone: chest, at: [0, 1.8, 0.12], scale: [0.36, 0.27, 0.38] });
  b.part(sph(10, 8), SKIN, { bone: hips, at: [0, 1.05, 0], scale: [0.34, 0.24, 0.28] });
  const body = b.surface([torso, hump]);

  // Helpers
  const boneStick = (a: THREE.Vector3, e: THREE.Vector3, r: number, bone: Joint) => {
    b.capsule(a, e, r, { color: BONE, bone, sides: 6 });
    const d = e.clone().sub(a).normalize();
    let side = d.clone().cross(V(0, 0, 1));
    if (side.lengthSq() < 1e-4) side = V(1, 0, 0);
    side.normalize();
    for (const end of [a, e])
      for (const k of [-1, 1])
        b.part(sph(5, 4), BONE, { bone, at: end.clone().addScaledVector(side, k * r * 0.7), scale: r * 1.3 });
  };
  const skull = (at: THREE.Vector3, bone: Joint, s: number, yaw = 0, eyeColor?: string) => {
    const R = (x: number, y: number, z: number) =>
      V(x * s, y * s, z * s).applyAxisAngle(Y, (yaw * Math.PI) / 180).add(at);
    const rot = [0, yaw, 0];
    b.part(sph(8, 6), BONE, { bone, at: R(0, 0, 0), rotation: rot, scale: [0.056 * s, 0.05 * s, 0.06 * s] });
    b.part(sph(6, 4), BONE_D, { bone, at: R(0, 0.024, 0.04), rotation: rot, scale: [0.05 * s, 0.012 * s, 0.02 * s] });
    b.part(new THREE.BoxGeometry(0.1 * s, 0.05 * s, 0.07 * s), BONE, { bone, at: R(0, -0.05, 0.03), rotation: rot });
    b.part(new THREE.BoxGeometry(0.085 * s, 0.025 * s, 0.07 * s), BONE_D, {
      bone,
      at: R(0, -0.085, 0.02),
      rotation: rot,
    });
    for (const k of [-1, 1]) {
      const sock = b.part(sph(5, 4), eyeColor ?? SOCKET, {
        bone,
        at: R(k * 0.024, 0.0, 0.052),
        rotation: rot,
        scale: 0.017 * s,
      });
      if (eyeColor) glow(sock, 1.4);
      b.part(sph(5, 4), BONE, { bone, at: R(k * 0.05, -0.03, 0.025), rotation: rot, scale: 0.02 * s });
      b.part(new THREE.BoxGeometry(0.008 * s, 0.014 * s, 0.01 * s), TEETH, {
        bone,
        at: R(k * 0.015, -0.074, 0.067),
        rotation: rot,
      });
    }
    b.part(sph(5, 4), SOCKET, { bone, at: R(0, -0.03, 0.066), rotation: rot, scale: [0.01 * s, 0.015 * s, 0.01 * s] });
  };
  const feather = (at: THREE.Vector3, bone: Joint, color: string, len: number, up = false) => {
    b.extrude(leaf(len), {
      at,
      x: [1, 0, 0],
      y: up ? [0, 1, 0] : [0, -1, 0],
      thickness: 0.007,
      color,
      bone,
    });
    b.extrude(
      [
        [0, 0],
        [0.007 * len, 0.1 * len],
        [0, 0.18 * len],
        [-0.007 * len, 0.1 * len],
      ],
      { at: at.clone().add(V(0, 0, 0.004)), x: [1, 0, 0], y: up ? [0, 1, 0] : [0, -1, 0], thickness: 0.007, color: LEATHER_D, bone },
    );
  };

  // Belt, loincloth, pouch
  const fz = body.ray([0, 1.12, 2], [0, 0, -1])?.at.z ?? 0.4;
  const bz = body.ray([0, 1.12, -2], [0, 0, 1])?.at.z ?? -0.3;
  const sx = body.ray([2, 1.12, 0.05], [-1, 0, 0])?.at.x ?? 0.4;
  const cz = (fz + bz) / 2;
  const rx = sx + 0.035;
  const rz = (fz - bz) / 2 + 0.035;
  const beltPts: THREE.Vector3[] = [];
  for (let k = 0; k < 12; k++) {
    const a = (2 * Math.PI * k) / 12;
    beltPts.push(V(rx * Math.sin(a), 1.12, cz + rz * Math.cos(a)));
  }
  const beltPath = catmull(beltPts, { closed: true });
  b.sweep(beltPath, 0.045, { color: LEATHER, bone: hips, sides: 6 });
  b.along(beltPath, 16, (a) => {
    b.part(sph(5, 4), GOLD, { at: a.at, bone: hips, scale: 0.024 });
  });
  b.extrude(
    [
      [-0.22, 0],
      [0.22, 0],
      [0.24, -0.28],
      [0.12, -0.4],
      [0, -0.28],
      [-0.12, -0.4],
      [-0.24, -0.28],
    ],
    { at: V(0, 1.1, fz + 0.025), x: [1, 0, 0], thickness: 0.035, color: LOIN, bone: hips },
  );
  b.extrude(
    [
      [-0.22, 0],
      [0.22, 0],
      [0.24, -0.28],
      [0.12, -0.4],
      [0, -0.28],
      [-0.12, -0.4],
      [-0.24, -0.28],
    ],
    { at: V(0, 1.1, bz - 0.025), x: [-1, 0, 0], thickness: 0.035, color: LOIN, bone: hips },
  );
  skull(V(0, 1.14, fz + 0.075), hips, 1.3, 0, "#6bff7a");
  const lh = body.ray([2, 1.0, 0.05], [-1, 0, 0])?.at.x ?? 0.4;
  b.part(new THREE.BoxGeometry(0.12, 0.16, 0.14), LEATHER, { bone: hips, at: [lh + 0.05, 0.99, 0.08] });
  b.part(new THREE.BoxGeometry(0.13, 0.05, 0.15), LEATHER_D, { bone: hips, at: [lh + 0.05, 1.07, 0.08] });
  b.part(sph(5, 4), GOLD, { bone: hips, at: [lh + 0.05, 1.04, 0.16], scale: 0.02 });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 5), LEATHER_D, { bone: hips, at: [lh + 0.05, 1.09, 0.08], rotation: [0, 0, 90] });
  const bx = -(sx + 0.03);
  b.rod(V(bx, 1.12, 0.08), V(bx, 1.0, 0.08), 0.012, LEATHER_D, { bone: hips });
  boneStick(V(bx, 1.0, 0.08), V(bx - 0.02, 0.8, 0.1), 0.02, hips);
  boneStick(V(bx + 0.04, 1.05, 0.1), V(bx + 0.06, 0.88, 0.12), 0.016, hips);
  feather(V(bx - 0.05, 1.06, 0.06), hips, FEATHER_R, 1.3);
  feather(V(bx + 0.02, 1.06, 0.14), hips, FEATHER_T, 1.0);

  // Necklace and bandolier
  const neckPath = body.drape(
    catmull([
      [0.32, 1.92, 0.28],
      [0.24, 1.76, 0.56],
      [0, 1.66, 0.64],
      [-0.24, 1.76, 0.56],
      [-0.32, 1.92, 0.28],
    ]),
    { lift: 0.02 },
  );
  b.sweep(neckPath, 0.016, { color: LEATHER_D, sides: 5 });
  [0.15, 0.3, 0.7, 0.85].forEach((t, i) => {
    const p = neckPath.at(t);
    if (i % 2) b.spike(p, [0, -1, 0], 0.08, 0.02, BONE, { bone: chest });
    else boneStick(p.clone().add(V(0, -0.01, 0.02)), p.clone().add(V(0, -0.11, 0.03)), 0.012, chest);
  });
  skull(neckPath.at(0.5).add(V(0, -0.08, 0.05)), chest, 1.1, 0, "#6bff7a");
  const bandPath = body.drape(
    catmull([
      [0.52, 1.98, 0.22],
      [0.4, 1.78, 0.62],
      [0.12, 1.5, 0.7],
      [-0.2, 1.24, 0.56],
      [-0.4, 1.06, 0.3],
    ]),
    { lift: 0.025 },
  );
  b.sweep(bandPath, 0.035, { color: LEATHER, sides: 6 });
  b.along(bandPath, 9, (a) => {
    b.part(sph(5, 4), GOLD, { at: a, scale: 0.024 });
  });
  b.along(bandPath, 7, (a) => {
    b.spike(a, [0, -1, 0], 0.09, 0.02, BONE);
  });

  // Chest and belly war marks
  const TATTOO = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="#e9dfb8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="9"/><path d="M32 8 V18 M32 46 V56 M8 32 H18 M46 32 H56 M15 15 L22 22 M42 42 L49 49 M49 15 L42 22 M22 42 L15 49"/><path d="M20 60 Q32 52 44 60"/></g></svg>`,
    { size: 256 },
  );
  const BELLYMARK = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="#e9dfb8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14 L22 6 M10 30 L26 18 M10 46 L30 30"/><path d="M54 14 L42 6 M54 30 L38 18 M54 46 L34 30"/><path d="M14 58 L22 50 L30 58 L38 50 L46 58 L52 52"/></g></svg>`,
    { size: 256 },
  );
  const chestHit = body.around(V(0, 1.45, 0.2)).at(0, 14);
  if (chestHit) b.decal(body, TATTOO, { at: chestHit, size: [0.34, 0.34] });
  const bellyHit = body.around(V(0, 1.1, 0.1)).at(0, -8);
  if (bellyHit) b.decal(body, BELLYMARK, { at: bellyHit, size: [0.3, 0.3] });

  // Back fetish totem
  const bz2 = body.ray([0, 1.55, -2], [0, 0, 1])?.at.z ?? -0.35;
  skull(V(0, 1.6, bz2 - 0.06), chest, 1.8, 180, "#6bff7a");
  boneStick(V(-0.3, 1.25, bz2 - 0.04), V(0.3, 1.85, bz2 - 0.04), 0.026, chest);
  boneStick(V(0.3, 1.25, bz2 - 0.04), V(-0.3, 1.85, bz2 - 0.04), 0.026, chest);
  feather(V(-0.1, 1.76, bz2 - 0.1), chest, FEATHER_R, 1.6, true);
  feather(V(0.1, 1.76, bz2 - 0.1), chest, FEATHER_T, 1.6, true);
  feather(V(0, 1.78, bz2 - 0.1), chest, FEATHER_Y, 1.9, true);

  // Head
  const o = { bone: head };
  b.part(sph(12, 9), SKIN, { ...o, at: h(0, 0.08, 0), scale: [0.2, 0.17, 0.2] });
  b.sweep(
    catmull([h(-0.19, 0.09, 0.12), h(-0.1, 0.15, 0.2), h(0.1, 0.15, 0.2), h(0.19, 0.09, 0.12)]),
    0.05,
    { color: SKIN, bone: head, sides: 8 },
  );
  for (const sg of [1, -1]) {
    b.part(sph(6, 5), SKIN_D, { ...o, at: h(sg * 0.09, 0.06, 0.175), scale: 0.05 });
    glow(b.part(sph(8, 6), EYE, { ...o, at: h(sg * 0.09, 0.06, 0.19), scale: 0.04 }), 1);
    b.part(sph(5, 4), PUPIL, { ...o, at: h(sg * 0.09, 0.06, 0.225), scale: [0.018, 0.024, 0.012] });
    b.part(sph(6, 4), SKIN, { ...o, at: h(sg * 0.15, 0.0, 0.2), scale: [0.07, 0.05, 0.08] });
    b.part(sph(5, 4), SKIN_D, { ...o, at: h(sg * 0.035, 0.015, 0.445), scale: [0.018, 0.012, 0.015] });
    b.part(sph(5, 4), WART, { ...o, at: h(sg * 0.12, 0.0, 0.3), scale: 0.018 });
    b.spike(h(sg * 0.1, -0.1, 0.33), [0, -1, 0], 0.06, 0.015, TEETH, { bone: head });
  }
  b.part(sph(10, 8), SKIN, { ...o, at: h(0, -0.03, 0.27), scale: [0.16, 0.09, 0.15] });
  b.part(sph(8, 6), SKIN_D, { ...o, at: h(0, 0.02, 0.4), scale: [0.075, 0.05, 0.055] });
  b.part(sph(5, 4), WART, { ...o, at: h(0.02, 0.07, 0.36), scale: 0.016 });

  // Lower jaw
  b.frustumBox(h(0, -0.11, 0.08), h(0, -0.11, 0.38), [0.34, 0.1], [0.26, 0.09], { color: SKIN, bone: jaw });
  b.part(sph(8, 6), SKIN, { bone: jaw, at: h(0, -0.11, 0.4), scale: [0.13, 0.065, 0.08] });
  for (const x of [-0.08, -0.04, 0.04, 0.08]) b.spike(h(x, -0.07, 0.36), [0, 1, 0], 0.05, 0.012, TEETH, { bone: jaw });
  for (const x of [-0.06, -0.03, 0, 0.03, 0.06])
    b.spike(h(x, -0.15, 0.42), [0, -1, 0.3], 0.08, 0.02, "#d92b3a", { bone: jaw });

  // Tusks and ears
  for (const sg of [1, -1]) {
    const tp = catmull([h(sg * 0.12, -0.1, 0.3), h(sg * 0.15, -0.02, 0.42), h(sg * 0.14, 0.12, 0.46), h(sg * 0.12, 0.2, 0.43)]);
    b.sweep(tp, [0.05, 0.035, 0.012], {
      color: gradient(BONE_D, BONE_L, tp.at(0), tp.at(1)),
      bone: jaw,
      sides: 7,
      caps: { start: "flat", end: "point" },
    });
    b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 10), GOLD, {
      bone: jaw,
      at: tp.at(0.4),
      dir: tp.tangentAt(0.4),
      axis: "z",
    });
    const ep = catmull([h(sg * 0.19, 0.08, -0.02), h(sg * 0.38, 0.14, -0.08), h(sg * 0.55, 0.3, -0.12)]);
    b.sweep(ep, [0.06, 0.045, 0.008], { color: SKIN, bone: head, sides: 6, caps: { start: "flat", end: "point" } });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), GOLD, {
      bone: head,
      at: ep.at(0.35),
      rotation: [0, 90, 0],
    });
  }

  // Mohawk
  const HAIR = [
    [0.45, "#7a1236"],
    [0.8, "#d92b3a"],
    [1, "#ff9a24"],
  ] as const;
  for (let i = 0; i < 9; i++) {
    const dz = 0.12 - i * 0.04;
    const y = C.y + 0.08 + 0.17 * Math.sqrt(Math.max(0, 1 - (dz / 0.2) ** 2)) - 0.02;
    const base = V(C.x, y, C.z + dz);
    const len = 0.2 + 0.14 * Math.sin((Math.PI * (i + 0.5)) / 9);
    const tip = base.clone().add(V(0, 1, -0.3 - 0.04 * i).normalize().multiplyScalar(len));
    b.frustumBox(base, tip, [0.04, 0.12], [0.008, 0.03], { bands: HAIR, bone: head });
  }
  [V(0, 1.99, 0.22), V(0, 2.02, 0.1), V(0, 1.99, 0.0), V(0, 1.92, -0.1)].forEach((base, i) => {
    const tip = base.clone().add(V(0, 1, -0.4).normalize().multiplyScalar(0.3 - 0.03 * i));
    b.frustumBox(base, tip, [0.04, 0.12], [0.008, 0.03], { bands: HAIR, bone: chest });
  });

  // Arms and legs
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const sh = V(s * 0.66, 1.72, 0.2);
    const el = V(s * 0.94, 1.2, 0.28);
    const wr = V(s * 1.02, 0.74, 0.5);
    const he = V(s * 1.04, 0.52, 0.56);
    const arm = b.chain("arm" + N, catmull([sh, el, wr, he]), {
      parent: chest,
      names: ["shoulder" + N, "elbow" + N, "wrist" + N, "hand" + N],
      role: "arm",
    });
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const wrJ = arm.joints[2];
    const hand = arm.tip!;
    b.sweep(arm, [0.21, 0.17, 0.15, 0.125], { color: SKIN, sides: 10 });
    b.part(sph(10, 8), SKIN, { bone: shJ, at: sh, scale: [0.27, 0.25, 0.27] });
    b.spike(el.clone().add(V(s * 0.1, 0, -0.1)), [s, 0, -0.35], 0.18, 0.045, BONE, { bone: elJ });
    // bracer
    const fdir = he.clone().sub(el).normalize();
    b.part(new THREE.CylinderGeometry(0.17, 0.16, 0.14, 8), LEATHER, { bone: wrJ, at: wr, dir: fdir });
    b.part(new THREE.CylinderGeometry(0.175, 0.175, 0.02, 8), GOLD, {
      bone: wrJ,
      at: wr.clone().addScaledVector(fdir, 0.07),
      dir: fdir,
    });
    b.ring(frame(wr, fdir), { count: 5, radius: 0.165 }, (it) => {
      b.spike(it, it, 0.07, 0.028, BONE, { bone: wrJ });
    });
    // hand
    const px = he.x;
    b.part(sph(8, 6), SKIN, { bone: hand, at: [px, 0.52, 0.56], scale: [0.15, 0.12, 0.1] });
    for (const dx of [-0.09, -0.03, 0.03, 0.09]) {
      const a = V(px + dx, 0.48, 0.58);
      const e = V(px + dx * 1.1, 0.3, 0.63);
      b.part(sph(6, 4), SKIN, { bone: hand, at: a, scale: 0.05 });
      b.rod(a, e, 0.04, SKIN, { bone: hand, sides: 6 });
      b.spike(e, [0, -0.4, 0.9], 0.09, 0.026, CLAW, { bone: hand });
    }
    const t0 = V(px - s * 0.13, 0.52, 0.54);
    const t1 = V(px - s * 0.15, 0.4, 0.64);
    b.rod(t0, t1, 0.04, SKIN, { bone: hand, sides: 6 });
    b.spike(t1, [0, -0.5, 0.9], 0.08, 0.026, CLAW, { bone: hand });

    // shoulder fetishes
    if (s > 0) {
      skull(V(0.7, 2.0, 0.2), shJ, 2.3, 35, "#6bff7a");
      for (const d of [V(0.5, 0.9, 0.2), V(0.9, 0.5, 0), V(0.4, 0.8, -0.6)]) {
        const dn = d.clone().normalize();
        b.spike(sh.clone().addScaledVector(dn, 0.22), dn, 0.24, 0.05, BONE, { bone: shJ });
      }
    } else {
      feather(V(-0.62, 1.93, 0.15), shJ, FEATHER_R, 1.5, true);
      feather(V(-0.7, 1.9, 0.22), shJ, FEATHER_Y, 1.2, true);
      feather(V(-0.78, 1.84, 0.18), shJ, FEATHER_T, 1.0, true);
      boneStick(V(-0.8, 2.0, 0.08), V(-0.56, 1.92, 0.34), 0.025, shJ);
      for (const d of [V(-0.5, 0.9, 0.2), V(-0.9, 0.4, 0.1)]) {
        const dn = d.clone().normalize();
        b.spike(sh.clone().addScaledVector(dn, 0.22), dn, 0.16, 0.04, BONE, { bone: shJ });
      }
    }

    // legs
    const hp = V(s * 0.3, 1.0, 0.02);
    const kn = V(s * 0.4, 0.6, 0.24);
    const an = V(s * 0.42, 0.24, 0.0);
    const ba = V(s * 0.42, 0.12, 0.2);
    const leg = b.chain("leg" + N, catmull([hp, kn, an, ba]), {
      parent: hips,
      names: ["hip" + N, "knee" + N, "ankle" + N, "foot" + N],
      role: "leg",
    });
    const kJ = leg.joints[1];
    const aJ = leg.joints[2];
    const foot = leg.tip!;
    b.sweep(leg, [0.27, 0.2, 0.14, 0.12], { color: SKIN, sides: 10 });
    b.spike(kn.clone().add(V(0, 0, 0.17)), [0, 0.1, 1], 0.12, 0.04, BONE, { bone: kJ });
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 8), LEATHER, { bone: aJ, at: an.clone().add(V(0, 0.03, 0)) });
    b.part(sph(8, 6), SKIN, { bone: foot, at: [s * 0.42, 0.1, 0.2], scale: [0.17, 0.1, 0.2] });
    for (const dx of [-0.11, 0, 0.11]) {
      const a = V(s * 0.42 + dx, 0.07, 0.32);
      const e = V(s * 0.42 + dx * 1.15, 0.065, 0.5);
      b.capsule(a, e, 0.055, { color: SKIN, bone: foot, sides: 6 });
      b.spike(e, [0, -0.2, 1], 0.1, 0.035, CLAW, { bone: foot });
    }
  }

  // Warts and moss
  const rr = rng(11);
  for (const hit of body.scatter(34, { rng: rr, minDist: 0.12 }))
    b.stick(new THREE.SphereGeometry(0.03, 5, 4), WART, hit, { embed: 0.5 });
  const MOSSTEX = svg(
    `<svg viewBox="0 0 40 60"><g fill="none" stroke-width="5" stroke-linecap="round"><path d="M20 60 Q18 30 6 6" stroke="#4f8a22"/><path d="M20 60 Q22 32 34 8" stroke="#6faa2a"/><path d="M20 60 Q20 30 20 2" stroke="#8cc83a"/></g></svg>`,
    { size: 160 },
  );
  const mossHits = body.scatter(60, { rng: rng(5), minDist: 0.1, filter: (hit) => hit.n.y > 0.55 });
  b.cards(mossHits, MOSSTEX, { size: [0.09, 0.13], lean: 50, bend: 30, vary: 0.3, rng: rng(6) });

  return b.root;
}
