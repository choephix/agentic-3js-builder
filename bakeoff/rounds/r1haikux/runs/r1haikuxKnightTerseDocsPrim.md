```ts
import * as THREE from "three";
import { createBuilder, frame, grain, lerp, paint } from "agentic-3js-builder";

export const meta = {
  name: "knight",
  description:
    "A full-plate knight at rest: great helm with a red plume, heater shield on the left arm, longsword point-down in the right hand, red tabard and blue cape.",
};

// Flat colours. Paints are baked into the shared sheet and don't count against the colour limit.
const GOLD = "#c9a24a";
const CAPE = "#22386e";
const LEATHER = "#4b2e1f";
const BLADE = "#d9e0ea";
const RED = "#a3212b";
const BLUE = "#2e4d86";
const WHITE = "#efe9dc";
const DARK = "#17181c";

// Brushed steel for every plate.
const STEEL = grain("#c7ccd4", "#6b727c", { size: 0.05, axis: "y" });

// Great helm: steel with a dark visor slit and breathing holes.
const HELM = paint((p, n) => {
  if (n.z > 0.35) {
    if (p.y > 1.585 && p.y < 1.615 && Math.abs(p.x) < 0.085) return DARK;
    for (const x of [-0.06, 0.06]) if (Math.hypot(p.x - x, p.y - 1.5) < 0.011) return DARK;
  }
  return STEEL;
});

// Heater shield: blue field, gold cross, steel rim.
const SHIELD = paint((_p, n, s) => {
  if (Math.abs(n.z) < 0.5) return STEEL;
  const cross = Math.abs(s[0]) < 0.035 || Math.abs(s[1] - 0.05) < 0.035;
  return cross ? GOLD : BLUE;
});

// Surcoat: red with a white cross, gold hem and edges.
const TABARD = paint((_p, n, s) => {
  if (Math.abs(n.z) < 0.5 || s[1] < -0.36) return GOLD;
  if (Math.abs(s[0]) < 0.024 || Math.abs(s[1] - 0.02) < 0.024) return WHITE;
  return RED;
});

export default function build() {
  const b = createBuilder({ name: "knight" });

  // ---- skeleton: rest pose, legs apart, shield arm bent forward, sword arm hanging ----
  const hips = b.joint("hips", { at: [0, 0.92, 0], aim: [0, 1.06, 0], role: "spine" });
  const waist = b.joint("waist", { parent: hips, at: [0, 1.06, 0], aim: [0, 1.22, 0], role: "spine" });
  const chest = b.joint("chest", { parent: waist, at: [0, 1.22, 0], aim: [0, 1.4, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.4, 0], aim: [0, 1.5, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.5, 0], aim: [0, 1.62, 0], role: "head" });

  const arm = (k: string, pts: number[][]) =>
    b.chain(`arm${k}`, pts, {
      parent: chest,
      names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`],
      role: "arm",
    }).joints;
  const armL = arm("L", [[0.2, 1.36, 0], [0.3, 1.1, 0.04], [0.18, 1.08, 0.27], [0.16, 1.07, 0.33]]);
  const armR = arm("R", [[-0.2, 1.36, 0], [-0.31, 1.1, 0], [-0.36, 0.86, 0.06], [-0.37, 0.8, 0.08]]);
  const wristL = armL[2];
  const handR = armR[3];

  const leg = (k: string, x: number) =>
    b.chain(`leg${k}`, [[x, 0.92, 0], [x, 0.5, 0.01], [x, 0.1, 0], [x, 0.05, 0.22]], {
      parent: hips,
      names: [`hip${k}`, `knee${k}`, `ankle${k}`, `foot${k}`],
      role: "leg",
    }).joints;
  const legs = [leg("L", 0.11), leg("R", -0.11)];

  // ---- torso: fauld, cuirass, gorget, belt ----
  const fauld = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.36, h: 0.24 },
      { at: [0, 0.98, 0], w: 0.36, h: 0.23 },
      { at: [0, 1.06, 0], w: 0.31, h: 0.2 },
    ],
    { bone: waist, color: STEEL },
  );
  b.loft(
    [
      { at: [0, 1.06, 0], w: 0.31, h: 0.2 },
      { at: [0, 1.16, 0], w: 0.38, h: 0.24 },
      { at: [0, 1.27, 0], w: 0.42, h: 0.27 },
      { at: [0, 1.36, 0], w: 0.4, h: 0.24 },
      { at: [0, 1.44, 0], w: 0.25, h: 0.19 },
    ],
    { bone: chest, color: STEEL },
  );
  const belt = b.surface(fauld).loop([0, 1.02, 0], { lift: 0.01 });
  b.sweep(belt, 0.014, { color: LEATHER });
  b.part(new THREE.CylinderGeometry(0.13, 0.155, 0.08, 8), STEEL, {
    bone: neck,
    at: [0, 1.42, 0],
    flat: true,
  });

  // ---- surcoat and cape, hanging flat behind and in front of the torso ----
  b.extrude(
    [[-0.16, 0.12], [0.16, 0.12], [0.16, -0.04], [0.2, -0.42], [0, -0.3, "sharp"], [-0.2, -0.42], [-0.16, -0.04]],
    { at: [0, 1.2, 0.145], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: TABARD, bone: waist },
  );
  b.extrude(
    [[-0.2, 0.16], [0.2, 0.16], [0.24, -0.4], [0.3, -1.0], [0.15, -1.05], [0, -0.98], [-0.15, -1.05], [-0.3, -1.0], [-0.24, -0.4]],
    { at: [0, 1.3, -0.16], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: CAPE, bone: chest },
  );

  // ---- arms: pauldrons, upper cannons, vambraces, gauntlets ----
  for (const [joints, s] of [[armL, 1], [armR, -1]] as const) {
    const [shoulder, elbow, wrist, hand] = joints;

    b.capsule(shoulder, elbow, [0.066, 0.056], { color: STEEL });
    b.part(new THREE.TorusGeometry(0.062, 0.009, 6, 14), GOLD, {
      bone: shoulder,
      at: lerp(shoulder.at, elbow.at, 0.4),
      dir: elbow.at.clone().sub(shoulder.at),
      axis: "z",
    });
    b.capsule(elbow, wrist, [0.058, 0.046], { color: STEEL });
    b.part(new THREE.SphereGeometry(0.062, 8, 6), STEEL, { bone: elbow, at: elbow.at });
    b.capsule(wrist, hand, [0.05, 0.042], { color: STEEL });

    // Pauldron: a tilted dome on the shoulder with a ring of gold rivets.
    const tilt = [s * 0.35, 1, 0];
    b.lathe(
      [[0, 0], [0.115, 0], [0.12, 0.025], [0.108, 0.07], [0.06, 0.1], [0, 0.11]],
      { at: [s * 0.2, 1.36, 0], axis: tilt, smoothing: 1, color: STEEL, bone: shoulder },
    );
    b.ring(frame([s * 0.2, 1.385, 0], tilt), { count: 8, radius: 0.118 }, (r) =>
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: r, bone: shoulder }),
    );
  }

  // ---- legs: cuisses, knee cops, greaves, sabatons ----
  for (const [hip, knee, ankle] of legs) {
    b.capsule(hip, knee, [0.08, 0.068], { color: STEEL });
    b.part(new THREE.SphereGeometry(0.072, 8, 6), STEEL, { bone: knee, at: knee.at });
    b.capsule(knee, ankle, [0.066, 0.05], { color: STEEL });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.28), STEEL, {
      bone: ankle,
      at: [ankle.at.x, 0.05, 0.1],
      flat: true,
    });
  }

  // ---- head: great helm, nasal guard, gold bands, plume ----
  b.lathe(
    [[0, 0], [0.15, 0], [0.158, 0.03], [0.152, 0.26], [0.13, 0.3], [0, 0.3]],
    { at: [0, 1.44, 0], segments: 8, bone: head, color: HELM },
  );
  b.part(new THREE.BoxGeometry(0.022, 0.13, 0.03), STEEL, {
    bone: head,
    at: [0, 1.565, 0.155],
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.155, 0.009, 6, 16), GOLD, {
    bone: head,
    at: [0, 1.46, 0],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.13, 0.008, 6, 14), GOLD, {
    bone: head,
    at: [0, 1.735, 0],
    rotation: [90, 0, 0],
  });
  b.extrude(
    [[0.12, -0.02], [0.08, 0.06], [-0.02, 0.14], [-0.16, 0.16], [-0.27, 0.11], [-0.3, 0.04, "sharp"], [-0.22, 0.0], [-0.14, -0.04], [0.02, -0.06]],
    {
      at: [0, 1.7, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.03, 0.01],
      bevel: 0.004,
      smoothing: 1,
      color: RED,
      bone: head,
    },
  );

  // ---- left hand: heater shield with a steel boss ----
  b.extrude(
    [[-0.22, 0.34], [0.22, 0.34], [0.22, -0.02], [0.14, -0.22], [0, -0.38, "sharp"], [-0.14, -0.22], [-0.22, -0.02]],
    {
      at: [0.2, 1.06, 0.4],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      color: SHIELD,
      bone: wristL,
    },
  );
  b.lathe([[0, 0], [0.055, 0], [0.06, 0.012], [0.035, 0.03], [0, 0.05]], {
    at: [0.2, 1.06, 0.415],
    axis: [0, 0, 1],
    smoothing: 1,
    color: STEEL,
    bone: wristL,
  });

  // ---- right hand: longsword point-down ----
  b.extrude(
    [[-0.03, 0], [0.03, 0], [0.03, -0.65], [0, -0.73, "sharp"], [-0.03, -0.65]],
    {
      at: [-0.37, 0.77, 0.08],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.004, 0.014],
      bevel: 0.002,
      color: BLADE,
      bone: handR,
    },
  );
  b.part(new THREE.BoxGeometry(0.26, 0.032, 0.05), GOLD, {
    bone: handR,
    at: [-0.37, 0.77, 0.08],
    flat: true,
  });
  b.capsule([-0.37, 0.93, 0.08], [-0.37, 0.78, 0.08], 0.017, { color: LEATHER, bone: handR });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), GOLD, {
    bone: handR,
    at: [-0.37, 0.935, 0.08],
  });

  return b.root;
}
```