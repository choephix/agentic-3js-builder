import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { glow } from "../../../../kits/glow";
import { mix, paint, smoothstep } from "../../../../src/paint";
import { catmull, polyline } from "../../../../src/path";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg medic with a winged healing staff, glowing cyber eye, white armour plates and a teal medical accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// Palette: white/graphite colour blocking, one strong teal accent.
const WHITE = "#eef2f5";
const GRAPH = "#2a313c";
const GUN = "#444e5b";
const STEEL = "#8794a1";
const PEARL = "#c9d3da";
const TEAL = "#19e0b4";
const MINT = "#d8fff3";
const SKIN = "#9a5f40";
const DARK = "#10151c";
const LEATHER = "#5b4636";
const EYEW = "#f3f0e8";
const IRIS = "#4a2f1e";
const LIP = "#7a3f32";
const HAIR = "#2a1c16";
const BROW = "#1d130e";

const hexOf = (c: THREE.Color) => `#${c.getHexString()}`;

// A painted form light: warm/light from above, cool/dark underneath, optional panel seams and floor grime.
function lit(hex: string, o: { seam?: number; grime?: number } = {}) {
  const c = new THREE.Color(hex);
  const hi = hexOf(c.clone().lerp(new THREE.Color("#ffffff"), 0.2));
  const lo = hexOf(c.clone().multiplyScalar(0.72).lerp(new THREE.Color("#3b4a80"), 0.14));
  const seam = hexOf(c.clone().multiplyScalar(0.5));
  return paint((p, n) => {
    const base = mix(lo, hi, smoothstep(-0.6, 0.75, n.y * 0.85 + n.z * 0.15 + 0.1 * n.x));
    if (o.seam) {
      const f = p.y / o.seam;
      if (f - Math.floor(f) < 0.05) return mix(base, seam, 0.8);
    }
    if (o.grime && p.y < o.grime) return mix(base, "#2a2622", 0.55 * (1 - p.y / o.grime));
    return base;
  });
}

const ARMOR = lit(WHITE);
const ARMOR_S = lit(WHITE, { seam: 0.13 });
const BOOT = lit(WHITE, { grime: 0.07 });
const SUIT = lit(GRAPH);
const GUN_P = lit(GUN);
const STEEL_P = lit(STEEL);
const SKIN_P = lit(SKIN);
const LEATH_P = lit(LEATHER);
const GLOVE = lit("#232a34");

function keyed(keys: Array<[number, number]>) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const k = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * k;
      }
    }
    return keys[keys.length - 1][1];
  };
}

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#10151c" stroke="#19e0b4" stroke-width="5"/><rect x="42" y="22" width="16" height="56" rx="4" fill="#19e0b4"/><rect x="22" y="42" width="56" height="16" rx="4" fill="#19e0b4"/><circle cx="50" cy="50" r="6" fill="#eafff8"/></svg>`,
  { size: 256 },
);
const CROSS = svg(
  `<svg viewBox="0 0 32 32"><rect x="12" y="4" width="8" height="24" rx="2" fill="#19e0b4"/><rect x="4" y="12" width="24" height="8" rx="2" fill="#19e0b4"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });

  const box = (w: number, h: number, d: number, color: Fill, at: P3, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const sph = (r: number, color: Fill, at: P3, o: PartOptions = {}) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, { at, ...o });
  const dirOf = (a: P3, c: P3): P3 => [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const band = (at: P3, r: number, h: number, color: Fill, bone: Joint, axis: P3 = [0, 1, 0], segs = 10) =>
    b.lathe(
      [
        [r - 0.008, -h / 2],
        [r, -h / 2],
        [r, h / 2],
        [r - 0.008, h / 2],
      ],
      { at, axis, segments: segs, color, bone },
    );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.95, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, 0],
      [0, 1.12, 0.01],
      [0, 1.32, 0.02],
      [0, 1.5, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.5, 0.02],
      [0, 1.58, 0.035],
      [0, 1.66, 0.05],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.66, 0.05], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.72, 0.05], aim: [0, 1.69, 0.15], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torsoPath = catmull([
    [0, 0.88, 0],
    [0, 1.1, 0.01],
    [0, 1.32, 0.02],
    [0, 1.5, 0.02],
  ]);
  const rxF = keyed([
    [0, 0.14],
    [0.15, 0.15],
    [0.4, 0.125],
    [0.7, 0.18],
    [0.9, 0.2],
    [1, 0.14],
  ]);
  const ryF = keyed([
    [0, 0.1],
    [0.15, 0.105],
    [0.4, 0.095],
    [0.7, 0.125],
    [0.9, 0.12],
    [1, 0.09],
  ]);
  const torso = b.sweep(torsoPath, (t) => [rxF(t), ryF(t)], { bone: [hips, spine], color: SUIT, caps: "round" });
  const tsurf = b.surface(torso);

  const belt = tsurf.loop([0, 0.99, 0], { lift: 0.012 });
  b.sweep(belt, 0.022, { color: LEATH_P });
  b.along(tsurf.loop([0, 0.99, 0], { lift: 0.03 }), 14, (at) =>
    b.part(new THREE.SphereGeometry(0.008, 5, 4), STEEL, { at }),
  );
  b.sweep(tsurf.loop([0, 1.07, 0], { lift: 0.008 }), 0.01, { color: GUN_P });
  b.sweep(tsurf.loop([0, 1.13, 0], { lift: 0.008 }), 0.008, { color: GUN_P });

  // pelvis
  box(0.3, 0.1, 0.19, SUIT, [0, 0.93, 0], { bone: hips });
  box(0.07, 0.07, 0.03, STEEL_P, [0, 0.985, 0.125], { bone: hips });
  box(0.04, 0.04, 0.012, TEAL, [0, 0.985, 0.142], { bone: hips });
  box(0.1, 0.1, 0.04, ARMOR, [0, 0.87, 0.1], { bone: hips });
  for (const s of [1, -1]) {
    box(0.05, 0.14, 0.2, ARMOR_S, [s * 0.16, 0.93, 0], { bone: hips });
    glow(b.rod([s * 0.187, 0.88, 0.04], [s * 0.187, 0.98, 0.04], 0.006, TEAL, { bone: hips }), 0.9);
    box(0.07, 0.1, 0.09, LEATH_P, [s * 0.175, 0.84, 0.07], { bone: hips });
    box(0.075, 0.03, 0.095, STEEL_P, [s * 0.175, 0.89, 0.07], { bone: hips });
    b.part(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", {
      at: [s * 0.2125, 0.835, 0.07],
      dir: [s, 0, 0],
      axis: "z",
      texture: CROSS,
      bone: hips,
    });
  }

  // chest plate and emblem
  const plate = b.extrude(
    [
      [-0.15, 0],
      [0, -0.045],
      [0.15, 0],
      [0.205, 0.13],
      [0.17, 0.235],
      [0, 0.215],
      [-0.17, 0.235],
      [-0.205, 0.13],
    ],
    { at: [0, 1.18, 0.145], x: [1, 0, 0], thickness: 0.07, bevel: 0.012, color: ARMOR, bone: chest },
  );
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    at: [0, 1.3, 0.1835],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
    bone: chest,
  });
  glow(b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    at: [0, 1.3, 0.1845],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
    bone: chest,
  }));
  for (const s of [1, -1]) {
    glow(b.rod([s * 0.165, 1.385, 0.182], [s * 0.05, 1.4, 0.182], 0.006, TEAL, { bone: chest }), 0.9);
    box(0.045, 0.012, 0.012, GUN_P, [s * 0.12, 1.2, 0.182], { bone: chest });
    box(0.045, 0.012, 0.012, GUN_P, [s * 0.12, 1.225, 0.182], { bone: chest });
    box(0.03, 0.09, 0.012, GUN_P, [s * 0.19, 1.3, 0.17], { bone: chest, rotation: [0, s * 20, 0] });
  }
  void plate;

  // collar
  band([0, 1.515, 0.02], 0.1, 0.05, ARMOR, chest, [0, 1, 0.1], 12);
  band([0, 1.495, 0.02], 0.105, 0.02, GUN_P, chest, [0, 1, 0.1], 12);

  // backpack medical unit
  box(0.28, 0.32, 0.11, ARMOR_S, [0, 1.3, -0.185], { bone: chest });
  box(0.24, 0.1, 0.1, GUN_P, [0, 1.1, -0.17], { bone: chest });
  box(0.2, 0.05, 0.03, STEEL_P, [0, 1.47, -0.16], { bone: chest });
  glow(box(0.18, 0.02, 0.012, TEAL, [0, 1.36, -0.242], { bone: chest }), 1.1);
  glow(box(0.18, 0.02, 0.012, TEAL, [0, 1.24, -0.242], { bone: chest }), 1.1);
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
    at: [0, 1.3, -0.2415],
    dir: [0, 0, -1],
    axis: "z",
    texture: CROSS,
    bone: chest,
  });
  for (const s of [1, -1]) {
    b.capsule([s * 0.1, 1.15, -0.27], [s * 0.1, 1.42, -0.27], 0.04, PEARL, { bone: chest });
    glow(band([s * 0.1, 1.3, -0.27], 0.043, 0.03, TEAL, chest), 1);
    b.rod([s * 0.1, 1.46, -0.2], [s * 0.1 + s * 0.03, s === 1 ? 1.8 : 1.64, -0.24], 0.006, STEEL, { bone: chest });
    glow(sph(0.015, TEAL, [s * 0.13, s === 1 ? 1.8 : 1.64, -0.24], { bone: chest }), 1.4);
    b.sweep(
      catmull([
        [s * 0.12, 1.18, -0.2],
        [s * 0.2, 1.1, -0.2],
        [s * 0.2, 1.0, -0.12],
        [s * 0.17, 0.95, 0.0],
      ]),
      0.011,
      { color: DARK, bone: chest },
    );
  }

  // ---------------------------------------------------------------- neck & head
  b.sweep(neck, [0.056, 0.05, 0.05], { color: SKIN_P });
  b.rod([0.03, 1.52, 0.06], [0.03, 1.64, 0.08], 0.008, GUN, { bone: neck.joints[0] });
  b.rod([-0.03, 1.52, 0.06], [-0.03, 1.64, 0.08], 0.008, GUN, { bone: neck.joints[0] });

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN_P, {
    at: [0, 1.755, 0.04],
    scale: [0.105, 0.11, 0.11],
    bone: head,
  });
  void skull;
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN_P, { at: [0, 1.69, 0.065], scale: [0.085, 0.06, 0.09], bone: jaw });
  b.part(new THREE.SphereGeometry(1, 10, 7), HAIR, { at: [0, 1.74, -0.03], scale: [0.108, 0.1, 0.1], bone: head });
  // helmet cap, rim and stripe
  b.part(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), ARMOR, {
    at: [0, 1.775, 0.015],
    scale: [0.118, 0.125, 0.12],
    bone: head,
  });
  b.part(new THREE.TorusGeometry(1, 0.06, 6, 16), GUN_P, {
    at: [0, 1.775, 0.015],
    rotation: [90, 0, 0],
    scale: [0.118, 0.12, 0.125],
    bone: head,
  });
  glow(
    b.sweep(
      catmull([
        [0, 1.796, 0.133],
        [0, 1.853, 0.109],
        [0, 1.892, 0.062],
        [0, 1.902, 0.015],
        [0, 1.892, -0.032],
        [0, 1.853, -0.079],
        [0, 1.796, -0.1265],
      ]),
      0.008,
      { color: TEAL, bone: head },
    ),
    0.9,
  );

  // eyes: organic right, cybernetic left
  const ey = 1.752;
  b.part(new THREE.SphereGeometry(0.02, 8, 6), EYEW, { at: [-0.04, ey, 0.142], scale: [1, 1.1, 0.6], bone: head });
  b.part(new THREE.SphereGeometry(0.0115, 8, 6), IRIS, { at: [-0.04, ey, 0.1485], scale: [1, 1, 0.6], bone: head });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), DARK, { at: [-0.04, ey, 0.153], scale: [1, 1, 0.6], bone: head });
  b.part(new THREE.SphereGeometry(0.003, 5, 4), "#ffffff", { at: [-0.0435, ey + 0.004, 0.1565], bone: head });
  b.part(new THREE.SphereGeometry(0.017, 8, 6), DARK, { at: [0.04, ey, 0.143], scale: [1, 1, 0.6], bone: head });
  glow(
    b.part(new THREE.SphereGeometry(0.011, 8, 6), TEAL, { at: [0.04, ey, 0.148], scale: [1, 1, 0.6], bone: head }),
    1.6,
  );
  glow(b.part(new THREE.TorusGeometry(0.019, 0.004, 6, 12), TEAL, { at: [0.04, ey, 0.15], bone: head }), 1.1);
  box(0.044, 0.009, 0.012, BROW, [-0.04, 1.785, 0.137], { bone: head, rotation: [0, 0, 8] });
  box(0.044, 0.009, 0.012, BROW, [0.04, 1.785, 0.137], { bone: head, rotation: [0, 0, -8] });
  b.part(new THREE.SphereGeometry(0.017, 7, 5), SKIN_P, { at: [0, 1.725, 0.155], scale: [0.8, 1, 1.1], bone: head });
  b.sweep(
    [
      [-0.03, 1.688, 0.15],
      [0, 1.68, 0.16],
      [0.03, 1.688, 0.15],
    ],
    0.004,
    { color: LIP, bone: jaw },
  );
  // cheek plate and ear cups
  box(0.05, 0.05, 0.015, PEARL, [0.075, 1.715, 0.115], { bone: head, rotation: [0, 35, 0] });
  glow(sph(0.005, TEAL, [0.085, 1.715, 0.12], { bone: head }), 1.2);
  for (const s of [1, -1]) {
    const big = s === 1 ? 1.2 : 1;
    b.part(new THREE.CylinderGeometry(0.04 * big, 0.04 * big, 0.03, 10), GRAPH, {
      at: [s * 0.113, 1.74, 0.02],
      dir: [s, 0, 0],
      bone: head,
    });
    glow(
      b.part(new THREE.TorusGeometry(0.028 * big, 0.005, 6, 12), TEAL, {
        at: [s * 0.13, 1.74, 0.02],
        dir: [s, 0, 0],
        axis: "z",
        bone: head,
      }),
      1,
    );
  }
  b.rod([0.12, 1.78, 0.0], [0.13, 1.94, -0.05], 0.006, STEEL, { bone: head });
  glow(sph(0.014, TEAL, [0.13, 1.945, -0.05], { bone: head }), 1.5);

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const sd = s === 1 ? "L" : "R";
    const pts: P3[] = [
      [s * 0.1, 0.92, 0],
      [s * 0.11, 0.5, 0.035],
      [s * 0.115, 0.1, -0.01],
      [s * 0.115, 0.05, 0.14],
    ];
    const lp = polyline(pts);
    const leg = b.chain(`leg${sd}`, lp, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`],
      role: "leg",
      contact: [s * 0.115, 0, 0.08],
    });
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    const tK = lp.closestT(pts[1]);
    const tA = lp.closestT(pts[2]);
    const rLeg = keyed([
      [0, 0.092],
      [tK * 0.5, 0.08],
      [tK, 0.062],
      [tK + (tA - tK) * 0.5, 0.054],
      [tA, 0.042],
    ]);
    b.sweep(leg, rLeg, { to: tA, color: SUIT });
    b.sweep(leg, [0.098, 0.102, 0.09], { from: tK * 0.12, to: tK * 0.6, color: ARMOR_S, caps: "flat" });
    b.sweep(leg, [0.072, 0.07, 0.056], {
      from: tK + (tA - tK) * 0.12,
      to: tK + (tA - tK) * 0.78,
      color: ARMOR_S,
      caps: "flat",
    });
    sph(0.055, ARMOR, [s * 0.11, 0.5, 0.075], { bone: kneeJ, scale: [1, 1.2, 0.75] });
    sph(0.05, GUN_P, [s * 0.11, 0.5, 0.0], { bone: kneeJ });
    glow(b.rod([s * 0.105, 0.82, 0.12], [s * 0.108, 0.62, 0.12], 0.005, TEAL, { bone: leg.joints[0] }), 0.9);
    glow(b.rod([s * 0.115, 0.4, 0.085], [s * 0.115, 0.22, 0.04], 0.005, TEAL, { bone: kneeJ }), 0.9);
    band([s * 0.115, 0.2, 0.0], 0.062, 0.025, GUN_P, ankleJ, dirOf(pts[1], pts[2]));
    // boot
    b.frustumBox([s * 0.115, 0.24, 0.0], [s * 0.115, 0.1, -0.008], [0.15, 0.15], [0.13, 0.13], {
      color: BOOT,
      bone: ankleJ,
    });
    b.frustumBox([s * 0.115, 0.065, -0.065], [s * 0.115, 0.055, 0.16], [0.125, 0.1], [0.11, 0.085], {
      color: BOOT,
      bone: ankleJ,
    });
    b.frustumBox([s * 0.115, 0.012, -0.07], [s * 0.115, 0.012, 0.175], [0.13, 0.026], [0.12, 0.026], {
      color: DARK,
      bone: ankleJ,
    });
    sph(0.048, GUN_P, [s * 0.115, 0.05, 0.145], { bone: ankleJ, scale: [1, 0.75, 1] });
    box(0.06, 0.04, 0.03, GUN_P, [s * 0.115, 0.075, -0.07], { bone: ankleJ });
    glow(box(0.05, 0.012, 0.01, TEAL, [s * 0.115, 0.14, 0.073], { bone: ankleJ }), 1);
    for (const z of [-0.03, 0.0, 0.03, 0.06]) box(0.14, 0.012, 0.01, DARK, [s * 0.115, 0.02, z], { bone: ankleJ });
  }

  // ---------------------------------------------------------------- arms
  const pShape = (s: number) => (s === 1 ? 1 : -1);
  void pShape;

  // left arm: fully cybernetic
  const armLp: P3[] = [
    [0.26, 1.44, 0],
    [0.37, 1.18, 0.0],
    [0.44, 0.95, 0.03],
    [0.465, 0.865, 0.04],
  ];
  const pathL = polyline(armLp);
  const armL = b.chain("armL", pathL, {
    parent: chest,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });
  const shL = armL.joints[0];
  const elL = armL.joints[1];
  const wrL = armL.joints[2];
  const handL = armL.tip!;
  const tEL = pathL.closestT(armLp[1]);
  const tWL = pathL.closestT(armLp[2]);
  b.sweep(armL, [0.058, 0.055, 0.05, 0.046, 0.04], { to: tWL, color: GUN_P });
  b.sweep(armL, [0.068, 0.074, 0.066], { from: tEL * 0.18, to: tEL * 0.85, color: ARMOR_S, caps: "flat" });
  b.sweep(armL, [0.064, 0.068, 0.054], {
    from: tEL + (tWL - tEL) * 0.3,
    to: tEL + (tWL - tEL) * 0.88,
    color: ARMOR_S,
    caps: "flat",
  });
  sph(0.056, GUN_P, armLp[1], { bone: elL });
  glow(band([0.4, 1.06, 0.015], 0.058, 0.02, TEAL, elL, dirOf(armLp[1], armLp[2])), 1.1);
  glow(band([0.435, 0.97, 0.025], 0.05, 0.016, TEAL, wrL, dirOf(armLp[1], armLp[2])), 1.1);
  // exposed pistons along the forearm
  for (const z of [-0.045, 0.045]) {
    b.rod([0.385 + 0.0, 1.15, z], [0.43, 0.99, z + 0.0], 0.007, STEEL, { bone: elL });
  }
  // pauldron
  const pdL = b.part(new THREE.SphereGeometry(0.105, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), ARMOR, {
    at: [0.27, 1.45, 0],
    dir: [0.7, 0.7, 0],
    scale: [1.1, 0.85, 1.0],
    bone: shL,
  });
  glow(band([0.27, 1.45, 0], 0.1, 0.012, TEAL, shL, [0.7, 0.7, 0]), 0.9);
  const pdLs = b.surface(pdL);
  const hitL = pdLs.around([0.27, 1.45, 0]).at(90, 35)!;
  b.decal(pdLs, CROSS, { at: hitL, size: [0.06, 0.06] });
  box(0.05, 0.015, 0.1, GUN_P, [0.3, 1.5, 0.0], { bone: shL, rotation: [0, 0, -40] });

  // left hand (open, relaxed)
  {
    const W = new THREE.Vector3(...armLp[2]);
    const E = new THREE.Vector3(...armLp[3]);
    const d = E.clone().sub(W).normalize();
    const palmC = W.clone().addScaledVector(d, 0.042);
    box(0.036, 0.09, 0.085, ARMOR, [palmC.x, palmC.y, palmC.z], { bone: handL, dir: [d.x, d.y, d.z] });
    b.part(new THREE.CircleGeometry(0.028, 10), DARK, {
      at: [palmC.x - 0.0195, palmC.y, palmC.z],
      dir: [-1, 0, 0],
      axis: "z",
      bone: handL,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.02, 10), TEAL, {
        at: [palmC.x - 0.0205, palmC.y, palmC.z],
        dir: [-1, 0, 0],
        axis: "z",
        bone: handL,
      }),
      1.5,
    );
    const nm = ["index", "middle", "ring", "pinky"];
    const lens = [0.034, 0.038, 0.034, 0.028];
    for (let i = 0; i < 4; i++) {
      const fb = W.clone().addScaledVector(d, 0.082).add(new THREE.Vector3(0, 0, (1.5 - i) * 0.021));
      const mid = fb.clone().addScaledVector(d, lens[i]).add(new THREE.Vector3(-0.007, 0, 0));
      const tip = mid.clone().addScaledVector(d, lens[i] * 0.85).add(new THREE.Vector3(-0.013, 0, 0));
      const f = b.chain(`${nm[i]}L`, polyline([fb, mid, tip]), {
        parent: handL,
        names: [`${nm[i]}L1`, `${nm[i]}L2`],
        role: "digit",
      });
      b.sweep(f, [0.0095, 0.0065], { color: i % 2 === 0 ? GRAPH : GUN });
      glow(sph(0.006, TEAL, [tip.x, tip.y, tip.z], { bone: f.joints[1] }), 1.2);
    }
    const tb = W.clone().addScaledVector(d, 0.02).add(new THREE.Vector3(0, 0, 0.045));
    const tm = tb.clone().addScaledVector(d, 0.025).add(new THREE.Vector3(-0.005, 0, 0.022));
    const tt = tm.clone().addScaledVector(d, 0.02).add(new THREE.Vector3(-0.008, 0, 0.018));
    const th = b.chain("thumbL", polyline([tb, tm, tt]), {
      parent: handL,
      names: ["thumbL1", "thumbL2"],
      role: "digit",
    });
    b.sweep(th, [0.011, 0.007], { color: GUN });
  }

  // right arm: suited sleeve, holds the staff
  const armRp: P3[] = [
    [-0.26, 1.44, 0],
    [-0.37, 1.2, 0.06],
    [-0.43, 1.03, 0.29],
    [-0.43, 1.0, 0.34],
  ];
  const pathR = polyline(armRp);
  const armR = b.chain("armR", pathR, {
    parent: chest,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });
  const shR = armR.joints[0];
  const elR = armR.joints[1];
  const wrR = armR.joints[2];
  const handR = armR.tip!;
  const tER = pathR.closestT(armRp[1]);
  const tWR = pathR.closestT(armRp[2]);
  b.sweep(armR, [0.06, 0.057, 0.052, 0.048, 0.042], { to: tWR, color: SUIT });
  b.sweep(armR, [0.066, 0.07, 0.062], { from: tER * 0.2, to: tER * 0.8, color: ARMOR_S, caps: "flat" });
  b.sweep(armR, [0.062, 0.064, 0.052], {
    from: tER + (tWR - tER) * 0.3,
    to: tER + (tWR - tER) * 0.86,
    color: ARMOR_S,
    caps: "flat",
  });
  sph(0.056, ARMOR, armRp[1], { bone: elR, scale: [1, 1, 1] });
  glow(band([-0.405, 1.1, 0.185], 0.05, 0.016, TEAL, wrR, dirOf(armRp[1], armRp[2])), 1.1);
  const pdR = b.part(new THREE.SphereGeometry(0.105, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), ARMOR, {
    at: [-0.27, 1.45, 0],
    dir: [-0.7, 0.7, 0],
    scale: [1.1, 0.85, 1.0],
    bone: shR,
  });
  glow(band([-0.27, 1.45, 0], 0.1, 0.012, TEAL, shR, [-0.7, 0.7, 0]), 0.9);
  const pdRs = b.surface(pdR);
  const hitR = pdRs.around([-0.27, 1.45, 0]).at(-90, 35)!;
  b.decal(pdRs, CROSS, { at: hitR, size: [0.06, 0.06] });
  box(0.05, 0.015, 0.1, GUN_P, [-0.3, 1.5, 0.0], { bone: shR, rotation: [0, 0, 40] });

  // right fist around the staff
  const sx = -0.43;
  const sz = 0.365;
  const RW = 0.029;
  const wrap = (y: number, deg: number): P3 => {
    const a = (deg * Math.PI) / 180;
    return [sx + RW * Math.sin(a), y, sz - RW * Math.cos(a)];
  };
  box(0.075, 0.11, 0.05, GLOVE, [sx + 0.01, 1.0, 0.325], { bone: handR });
  box(0.06, 0.09, 0.014, ARMOR, [sx + 0.01, 1.0, 0.296], { bone: handR });
  const fn = ["index", "middle", "ring", "pinky"];
  for (let i = 0; i < 4; i++) {
    const y = 1.037 - 0.024 * i;
    const f = b.chain(`${fn[i]}R`, polyline([wrap(y, 40), wrap(y, 115), wrap(y, 185)]), {
      parent: handR,
      names: [`${fn[i]}R1`, `${fn[i]}R2`],
      role: "digit",
    });
    b.sweep(f, [0.0095, 0.0075], { color: GLOVE });
  }
  const thR = b.chain("thumbR", polyline([wrap(1.07, -40), wrap(1.07, -110), wrap(1.07, -175)]), {
    parent: handR,
    names: ["thumbR1", "thumbR2"],
    role: "digit",
  });
  b.sweep(thR, [0.011, 0.008], { color: GLOVE });
  sph(0.016, GLOVE, [sx - 0.02, 1.055, sz - 0.025], { bone: handR });

  // ---------------------------------------------------------------- healing staff
  const staff = b.joint("staff", { parent: handR, at: [sx, 0.5, sz], aim: [sx, 1.5, sz] });
  const sp = (y: number, dx = 0, dz = 0): P3 => [sx + dx, y, sz + dz];
  b.rod(sp(-0.005), sp(1.58), 0.017, GUN_P, { bone: staff });
  b.rod(sp(-0.005), sp(0.06), 0.026, ARMOR, { bone: staff });
  b.rod(sp(0.94), sp(1.09), 0.022, LEATH_P, { bone: staff });
  for (const y of [0.3, 0.6, 1.25]) band(sp(y), 0.024, 0.03, ARMOR, staff);
  glow(band(sp(0.45), 0.021, 0.018, TEAL, staff), 1.1);
  glow(band(sp(1.35), 0.021, 0.018, TEAL, staff), 1.1);
  b.lathe(
    [
      [0, 0],
      [0.036, 0],
      [0.052, 0.04],
      [0.032, 0.085],
      [0, 0.085],
    ],
    { at: sp(1.55), color: ARMOR, bone: staff },
  );
  // prongs holding the orb
  for (const k of [1, -1]) {
    b.sweep(catmull([sp(1.62), sp(1.69, k * 0.11), sp(1.8, k * 0.12), sp(1.91, k * 0.05)]), [0.015, 0.008], {
      color: ARMOR,
      bone: staff,
    });
    glow(sph(0.01, TEAL, sp(1.915, k * 0.05), { bone: staff }), 1.4);
    b.sweep(catmull([sp(1.62), sp(1.69, 0, k * 0.11), sp(1.8, 0, k * 0.12), sp(1.91, 0, k * 0.05)]), [0.013, 0.007], {
      color: PEARL,
      bone: staff,
    });
    glow(sph(0.009, TEAL, sp(1.915, 0, k * 0.05), { bone: staff }), 1.4);
    // wings
    b.extrude(
      [
        [0, 0],
        [0.1, -0.01],
        [0.2, 0.05],
        [0.19, 0.1],
        [0.12, 0.07],
        [0.12, 0.12],
        [0.06, 0.08],
        [0.04, 0.12],
        [0, 0.06],
      ],
      { at: sp(1.5, k * 0.02), x: [k, 0, 0], thickness: 0.008, bevel: 0.002, color: ARMOR, bone: staff },
    );
  }
  glow(sph(0.065, TEAL, sp(1.76), { bone: staff }), 1.4);
  glow(sph(0.035, MINT, sp(1.76), { bone: staff }), 1.8);
  glow(b.part(new THREE.TorusGeometry(0.095, 0.006, 6, 16), TEAL, { at: sp(1.76), bone: staff }), 1.2);
  glow(b.part(new THREE.TorusGeometry(0.095, 0.006, 6, 16), TEAL, { at: sp(1.76), rotation: [0, 90, 0], bone: staff }), 1.2);
  b.spike(sp(1.93), [0, 1, 0], 0.07, 0.015, ARMOR, { bone: staff });

  return b.root;
}
