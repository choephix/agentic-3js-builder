import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  limb,
  scales,
  spiral,
  stripes,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;
type P = [number, number, number];

export const meta = {
  name: "Chameleon",
  description:
    "A stylised veiled chameleon in rest pose: lime scaled skin with teal bars, turret eyes with gold decals, a teal casque, a coral throat fan, a gold dorsal crest and a coiled prehensile tail.",
};

// Linear ramp through [t, value] stops, for radii along a chain.
function ramp(stops: [number, number][]) {
  return (t: number): number => {
    for (let i = 1; i < stops.length; i++) {
      const [t0, v0] = stops[i - 1];
      const [t1, v1] = stops[i];
      if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
    return stops[stops.length - 1][1];
  };
}

function unit(v: P): P {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

// Turret eye: a solid of revolution. x = radius, y = height along its axis.
const EYE_PROFILE: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.04, 0],
  [0.042, 0.012],
  [0.036, 0.036],
  [0.022, 0.052],
  [0, 0.06, "sharp"],
];

export default function build() {
  const b = createBuilder({ name: "chameleon" });

  // ---- palette -----------------------------------------------------------
  const LIME = "#7ccc4f";
  const GREEN = "#2e8b4e";
  const TEAL = "#17756f";
  const YELLOW = "#f1dc6a";
  const CORAL = "#f0664a";
  const GOLD = "#f2b632";
  const DARK = "#1a2a22";
  const CLAW = "#f1e8cf";
  const TONGUE = "#ff8ea3";
  const CASQUE = "#22a39a";

  // Skin: granular lime scales, teal bars around the body, yellow underside.
  const hide = scales(LIME, GREEN, { size: 0.024, width: 0.25, seed: 2 });
  const bars = stripes(hide, TEAL, { size: 0.085, width: 0.3, seed: 7 });
  const coat = countershade(bars, YELLOW, { level: -0.2, soft: 0.25 });

  // ---- skeleton ----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.15, 0], aim: [0, 0.15, 0.1], role: "spine" });

  const spine = b.chain(
    "torso",
    catmull([
      [0, 0.15, -0.03],
      [0, 0.158, 0.04],
      [0, 0.165, 0.13],
      [0, 0.176, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.176, 0.2],
      [0, 0.19, 0.235],
      [0, 0.2, 0.265],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.2, 0.265],
    aim: [0, 0.19, 0.4],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.168, 0.29],
    aim: [0, 0.157, 0.37],
    role: "jaw",
  });

  // Prehensile tail: swings back, then coils its tip in the side plane.
  const tailPath = bezier([0, 0.15, -0.03], [0, 0.14, -0.16], [0, 0.2, -0.25], [0, 0.2, -0.33]).concat(
    spiral([0, 0.13, -0.33], [0, 0.2, -0.33], [1, 0, 0], { turns: -1.1, r1: 0.03 }),
  );
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 7,
    names: (i: number) => `tail${i + 1}`,
    role: "tail",
  });

  // ---- feet: zygodactyl toe bundles (2 and 3) fanned on the floor ----------
  const digits = (foot: P, bone: Joint, side: number, len: number) => {
    const forward = Math.atan2(side * 0.35, 1);
    for (const deg of [-30, -12, 12, 30, 48]) {
      const a = forward + (side * deg * Math.PI) / 180;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const tip: P = [foot[0] + dx * len, 0.006, foot[2] + dz * len];
      b.rod([foot[0], 0.012, foot[2]], tip, 0.0065, { color: hide, bone });
      const n = Math.hypot(dx, 0.3, dz);
      b.spike(tip, [dx / n, -0.3 / n, dz / n], 0.013, 0.0038, { color: CLAW, bone });
    }
  };

  // ---- limbs: splayed sprawl, solved so the feet land on the floor --------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    const armPts = limb([s * 0.034, 0.135, 0.13], [s * 0.12, 0.012, 0.17], [0.085, 0.085], [[s, 0.5, 0]]);
    const arm = b.chain(`arm${sd}`, armPts, {
      parent: spine.joints[2],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    b.sweep(arm, (t: number) => 0.02 - 0.006 * t, { color: hide });

    const legPts = limb([s * 0.034, 0.13, -0.02], [s * 0.125, 0.012, -0.03], [0.08, 0.08], [[s, 0.35, 0]]);
    const leg = b.chain(`leg${sd}`, legPts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.026 - 0.01 * t, { color: hide });

    const wrist = arm.joints[arm.joints.length - 1];
    const ankle = leg.joints[leg.joints.length - 1];
    digits([s * 0.12, 0.012, 0.17], wrist, s, 0.036);
    digits([s * 0.125, 0.012, -0.03], ankle, s, 0.03);
  }

  // ---- body: a laterally compressed trunk along the spine ------------------
  const bodyX = ramp([
    [0, 0.028],
    [0.3, 0.045],
    [0.7, 0.044],
    [1, 0.034],
  ]);
  const bodyY = ramp([
    [0, 0.058],
    [0.3, 0.07],
    [0.7, 0.068],
    [1, 0.05],
  ]);
  const body = b.sweep(spine, (t: number): [number, number] => [bodyX(t), bodyY(t)], { color: coat });

  // Neck tube up to the head.
  b.sweep(neck, (t: number): [number, number] => [0.036 - 0.006 * t, 0.046 - 0.008 * t], { color: coat });

  // Gold dorsal crest: spikes standing on the top of the trunk.
  b.along(
    body,
    9,
    (at) => {
      b.spike(at, at, 0.02 + 0.02 * Math.sin(Math.PI * at.t), 0.011, { color: GOLD });
    },
    { from: 0.08, to: 0.85 },
  );

  // Tail: tapering tube, coiled at the tip.
  b.sweep(tail, (t: number) => 0.027 - 0.016 * t, {
    color: coat,
    caps: { start: "round", end: "point" },
  });

  // ---- head ----------------------------------------------------------------
  const headTube = catmull([
    [0, 0.2, 0.265],
    [0, 0.2, 0.31],
    [0, 0.19, 0.345],
    [0, 0.18, 0.37],
  ]);
  const headX = ramp([
    [0, 0.042],
    [0.5, 0.034],
    [1, 0.02],
  ]);
  const headY = ramp([
    [0, 0.052],
    [0.5, 0.04],
    [1, 0.026],
  ]);
  b.sweep(headTube, (t: number): [number, number] => [headX(t), headY(t)], { bone: head, color: coat });

  // Casque: a tall flat plate on the crown, thick at its base and thin at its crest.
  const casque: OutlinePoint[] = [
    [-0.035, -0.02],
    [-0.02, 0.05],
    [0.02, 0.075],
    [0.07, 0.07],
    [0.105, 0.02],
    [0.12, -0.02],
  ];
  b.extrude(casque, {
    at: [0, 0.215, 0.24],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.034, 0.012],
    bevel: 0.005,
    smoothing: 1,
    color: CASQUE,
    bone: head,
  });

  // Coral throat fan hanging under the chin.
  const throat: OutlinePoint[] = [
    [0, 0.02],
    [0.05, 0],
    [0.075, -0.03],
    [0.05, -0.06],
    [0, -0.045],
    [-0.01, -0.01],
  ];
  b.extrude(throat, {
    at: [0, 0.165, 0.265],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 1,
    color: CORAL,
    bone: head,
  });

  // Dark seam where the mouth closes.
  b.sweep(
    catmull([
      [0, 0.17, 0.3],
      [0, 0.168, 0.34],
      [0, 0.163, 0.37],
    ]),
    0.0035,
    { bone: head, color: DARK },
  );

  // Lower jaw, hinged at the back of the head so it can open.
  b.sweep(
    catmull([
      [0, 0.168, 0.29],
      [0, 0.162, 0.33],
      [0, 0.157, 0.36],
    ]),
    (t: number): [number, number] => [0.02 - 0.004 * t, 0.012],
    { bone: jaw, color: coat },
  );

  // Tongue: thin at the mouth, clubbed at the tip.
  const tongue = catmull([
    [0, 0.16, 0.3],
    [0, 0.158, 0.36],
    [0, 0.156, 0.4],
  ]);
  b.sweep(tongue, [0.006, 0.011], { bone: jaw, color: TONGUE });
  b.part(new THREE.SphereGeometry(0.013, 8, 6), TONGUE, { at: [0, 0.156, 0.4], bone: jaw });

  // ---- turret eyes: independent cones with a gold iris decal ---------------
  const eyeArt = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="31" fill="#f2b632"/>
  <circle cx="32" cy="32" r="26" fill="#1d7a64"/>
  <circle cx="32" cy="32" r="19" fill="#b7d943"/>
  <ellipse cx="32" cy="32" rx="5" ry="16" fill="#14201a"/>
  <circle cx="25" cy="24" r="3.5" fill="#ffffff" opacity="0.9"/>
</svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const ax = unit([s * 0.9, 0.2, 0.45]);
    const base: P = [s * 0.042, 0.19, 0.285];
    const turret = b.lathe(EYE_PROFILE, {
      at: base,
      axis: ax,
      bone: head,
      smoothing: 1,
      color: coat,
    });

    const top: P = [base[0] + ax[0] * 0.06, base[1] + ax[1] * 0.06, base[2] + ax[2] * 0.06];
    const hit = b
      .surface(turret)
      .ray([top[0] + ax[0] * 0.1, top[1] + ax[1] * 0.1, top[2] + ax[2] * 0.1], [-ax[0], -ax[1], -ax[2]]);
    if (hit) b.decal(turret, eyeArt, { at: hit, size: [0.04, 0.04] });
  }

  return b.root;
}
