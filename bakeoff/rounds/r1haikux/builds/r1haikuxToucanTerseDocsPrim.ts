import * as THREE from "three";
import { bezier, catmull, createBuilder, mottle, paint, svg } from "../../../../src/index";

export const meta = {
  name: "toco toucan",
  description:
    "A standing toco toucan: glossy black plumage, a white bib, a long orange bill with a gold ridge and black tip, a blue eye ring and a red undertail.",
};

type Vec2 = [number, number];
type Key = [number, number, number]; // [t, rx, ry]

const ORANGE = "#f57a1f";
const GOLD = "#ffc53a";
const BLACK = "#121214";
const WHITE = "#f4f0e6";
const RED = "#e5331e";
const LEG = "#4f5762";
const CLAW = "#1c1c1f";
const NOSTRIL = "#050506";

const FOOT_Z = 0.06;

// Body half-widths along the spine: rx sideways, ry up (source t, 0 = rump, 1 = neck top).
const BODY: Key[] = [
  [0.0, 0.042, 0.052],
  [0.3, 0.07, 0.082],
  [0.53, 0.077, 0.09],
  [0.8, 0.064, 0.072],
  [0.92, 0.04, 0.042],
  [1.0, 0.036, 0.038],
];

// Zygodactyl toes as [outward, forward] offsets from the foot, mirrored per side.
const TOES: [number, number][] = [
  [0.032, 0.03],
  [-0.006, 0.042],
  [0.026, -0.03],
  [-0.012, -0.028],
];

// Folded wing, drawn in (forward, up) metres from the shoulder.
const WING_OUTLINE = [
  [0.035, 0.055],
  [-0.02, 0.05],
  [-0.08, 0.03],
  [-0.125, 0.0],
  [-0.14, -0.05, "sharp"],
  [-0.105, -0.07],
  [-0.06, -0.055],
  [-0.02, -0.075],
  [0.02, -0.04],
] as const;

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="31" fill="#2f8fe8"/>
  <circle cx="32" cy="32" r="19" fill="#ffb51f"/>
  <circle cx="32" cy="32" r="11" fill="#140d08"/>
  <circle cx="36.5" cy="27.5" r="3.6" fill="#ffffff"/>
</svg>`;

/** Piecewise-linear half-width profile over source t. */
function profile(keys: Key[], t: number): Vec2 {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    const [t1, rx1, ry1] = keys[i];
    if (t <= t1) {
      const [t0, rx0, ry0] = keys[i - 1];
      const u = (t - t0) / (t1 - t0);
      return [rx0 + (rx1 - rx0) * u, ry0 + (ry1 - ry0) * u];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
}

export default function build() {
  const b = createBuilder({ name: "toco-toucan" });

  // ---- paints and textures ------------------------------------------------
  const plumage = mottle("#16171b", "#2d2f36", { size: 0.07, seed: 3 });
  const coat = paint((p, n) => (n.z > 0.35 && p.y < 0.42 && p.z > 0.02 ? WHITE : plumage));
  const headCoat = paint((_p, n) => (n.y < -0.2 && n.z > 0.05 ? WHITE : plumage));
  const eyeTex = svg(EYE_SVG, { size: 128 });

  // ---- body: hips (root) -> back -> chest -> neck, one smooth tube ---------
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.27, -0.08],
      [0, 0.3, 0.0],
      [0, 0.32, 0.06],
      [0, 0.37, 0.115],
      [0, 0.42, 0.14],
    ]),
    { names: ["hips", "back", "chest", "neck"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];
  const neck = spine.joints[3];
  b.sweep(spine, (t) => profile(BODY, t), { sides: 10, color: coat });

  // ---- tail: broad, squared, red undertail --------------------------------
  const tail = b.chain(
    "tail",
    bezier([0, 0.275, -0.06], [0, 0.27, -0.13], [0, 0.24, -0.18], [0, 0.205, -0.23]),
    { parent: hips, count: 3, role: "tail" },
  );
  b.sweep(tail, (t): Vec2 => [0.036 - 0.012 * t, 0.017], {
    section: "box",
    color: plumage,
    sectors: [[120, 240, RED]],
    caps: { start: "round", end: "flat" },
  });

  // ---- legs: thigh inside the body, bird tarsus, zygodactyl feet ---------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.055;
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.05, 0.25, -0.02],
        [x, 0.15, 0.01],
        [x, 0.06, -0.02],
        [x, 0.012, FOOT_Z],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.sweep(leg, [0.022, 0.011], { color: LEG });

    for (const [dx, dz] of TOES) {
      const end = [x + s * dx, 0.012, FOOT_Z + dz];
      b.capsule([x, 0.012, FOOT_Z], end, 0.009, { color: LEG, bone: foot });
      b.spike(end, [s * dx * 1.2, 0.05, dz * 1.2], 0.014, 0.0045, { color: CLAW, bone: foot });
    }
  }

  // ---- folded wings: flat feathered plates on the flanks ------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.07, 0.385, 0.03];
    const wing = b.joint(`wing${side}`, { parent: chest, at: shoulder, role: "wing" });
    b.extrude(WING_OUTLINE, {
      at: shoulder,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 1,
      color: plumage,
      bone: wing,
    });
  }

  // ---- head and eyes -------------------------------------------------------
  const head = b.joint("head", { parent: neck, at: [0, 0.455, 0.155], role: "head" });
  const skull = b.part(new THREE.SphereGeometry(0.066, 14, 10), headCoat, { bone: head });
  for (const s of [1, -1]) {
    const hit = b.surface(skull).nearest(head.local({ left: s * 0.05, up: 0.01, forward: 0.035 }));
    b.decal(skull, eyeTex, { at: hit, size: [0.042, 0.042] });
  }

  // ---- upper mandible: orange, gold ridge on top, black tip ----------------
  const upperR = (t: number): Vec2 => [0.031 - 0.018 * t, 0.047 - 0.032 * t];
  const upper = b.sweep(
    bezier([0, 0.478, 0.2], [0, 0.49, 0.28], [0, 0.47, 0.36], [0, 0.44, 0.39]),
    upperR,
    {
      bone: head,
      color: ORANGE,
      bands: [
        [0.72, ORANGE],
        [1, BLACK],
      ],
      sectors: [[-38, 38, GOLD, 0, 0.72]],
    },
  );
  for (const s of [1, -1]) {
    const hit = b.surface(upper).nearest([s * 0.027, 0.49, 0.245]);
    b.stick(new THREE.SphereGeometry(0.0045, 6, 4), NOSTRIL, hit, { embed: 0.4 });
  }

  // ---- lower mandible on its own joint, slightly open ----------------------
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.44, 0.19], role: "jaw" });
  const lowerR = (t: number): Vec2 => [0.022 - 0.01 * t, 0.024 - 0.016 * t];
  b.sweep(bezier([0, 0.44, 0.19], [0, 0.435, 0.26], [0, 0.42, 0.33], [0, 0.405, 0.36]), lowerR, {
    bone: jaw,
    color: ORANGE,
    bands: [
      [0.7, ORANGE],
      [1, BLACK],
    ],
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
