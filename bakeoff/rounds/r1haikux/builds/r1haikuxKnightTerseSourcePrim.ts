import * as THREE from "three";
import { catmull, createBuilder, gradient, grain, mottle, paint } from "../../../../src/index";
import type { Fill } from "../../../../src/index";

export const meta = {
  name: "Armoured knight",
  description:
    "A knight in plate at rest: a great helm with a T-visor and a red crest, gothic pauldrons with spikes, a crimson " +
    "tabard with a gold cross over a steel cuirass, a cape, a royal-blue heater shield on the left arm, and a sword " +
    "held point-down in the right hand.",
};

// Flat colours (sRGB).
const CRIMSON = "#8c1b21";
const CRIMSON_DEEP = "#60121a";
const GOLD = "#d9ad55";
const ROYAL = "#21407d";
const STEEL_DARK = "#59616a";
const LEATHER = "#4a2c1b";
const SLIT = "#0c0b0b";
const BLADE = "#dde4ea";
const PLUME_RED = "#b3262a";
const PLUME_DEEP = "#4f0f18";

// Painted surfaces: mottled plate, the tabard and shield faces, cloth folds and a crest gradient.
const plate = mottle("#c2cad2", "#7d8690", { size: 0.2, contrast: 1.3, seed: 3 });
const helmPlate = mottle("#cdd4db", "#8a939c", { size: 0.12, contrast: 1.2, seed: 9 });

/** Crimson surcoat with a gold cross on its front; back and edges plain crimson. */
const tabard = paint((_p, n, [x, y]) => {
  if (n.z < 0.5) return CRIMSON;
  const upright = Math.abs(x) < 0.035 && y > -0.2 && y < 0.3;
  const bar = Math.abs(y - 0.12) < 0.035 && Math.abs(x) < 0.15;
  return upright || bar ? GOLD : CRIMSON;
});

/** Royal-blue shield face with a gold chevron. */
const shieldFace = paint((_p, n, [x, y]) => {
  if (n.z < 0.5) return ROYAL;
  const chevron = Math.abs(x) < 0.21 && Math.abs(y - (0.13 - 0.55 * Math.abs(x))) < 0.042;
  return chevron ? GOLD : ROYAL;
});

/** Cape cloth: fold streaks running down its length. */
const cape = grain(CRIMSON, CRIMSON_DEEP, { size: 0.09, axis: "y", seed: 4 });

/** Crest: red at the front edge, deep red at the tail. */
const crest = gradient(PLUME_RED, PLUME_DEEP, [0, 1.76, 0.1], [0, 1.8, -0.3]);

export default function armouredKnight() {
  const b = createBuilder({ name: "armoured-knight", detail: 1, paintSize: 1024 });
  const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Key points for each side (s = +1 is the knight's left, +X; s = -1 is the right).
  const pts = (s: 1 | -1) => ({
    shoulder: P(0.22 * s, 1.4, 0),
    elbow: P(0.41 * s, 1.17, 0.03),
    wrist: P(0.46 * s, 0.92, 0.12),
    hand: P(0.48 * s, 0.85, 0.14),
    hip: P(0.12 * s, 0.92, 0),
    knee: P(0.13 * s, 0.5, 0.01),
    ankle: P(0.13 * s, 0.1, 0),
    toe: P(0.13 * s, 0.05, 0.14),
  });
  const sides = [
    [1, "L"],
    [-1, "R"],
  ] as const;

  // Skeleton: pelvis (root), chest, neck, head; each arm and leg is a chain ending at a hand or foot.
  b.joint("pelvis", { at: [0, 0.92, 0], aim: [0, 1.24, 0] });
  b.joint("chest", { parent: "pelvis", at: [0, 1.24, 0], aim: [0, 1.42, 0], role: "spine" });
  b.joint("neck", { parent: "chest", at: [0, 1.42, 0], aim: [0, 1.56, 0], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.56, 0], aim: [0, 1.8, 0], role: "head" });
  for (const [s, L] of sides) {
    const q = pts(s);
    b.chain(`arm${L}`, [q.shoulder, q.elbow, q.wrist, q.hand], {
      parent: "chest",
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      role: "arm",
    });
    b.chain(`leg${L}`, [q.hip, q.knee, q.ankle, q.toe], {
      parent: "pelvis",
      names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      role: "leg",
      contact: P(0.13 * s, 0, 0.05),
    });
  }

  /** A tube from `from` to `to`, its local +Y along the run (rTo at the far end). */
  const bar = (from: THREE.Vector3, to: THREE.Vector3, rFrom: number, rTo: number, color: Fill, bone: string) =>
    b.part(new THREE.CylinderGeometry(rTo, rFrom, from.distanceTo(to), b.segments(10), 1), color, {
      bone,
      at: from.clone().lerp(to, 0.5),
      aim: to,
    });

  // Cuirass: one smooth loft from pelvis to neck, skinned across the three joints.
  b.loft(
    [
      { at: [0, 0.9, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.0, 0], w: 0.27, h: 0.19 },
      { at: [0, 1.12, 0], w: 0.32, h: 0.22 },
      { at: [0, 1.26, 0], w: 0.37, h: 0.25 },
      { at: [0, 1.37, 0], w: 0.35, h: 0.23 },
      { at: [0, 1.44, 0], w: 0.27, h: 0.19 },
    ],
    { color: plate, sides: 10, bone: ["pelvis", "chest", "neck"], name: "cuirass" },
  );

  // Fauld: a flared steel skirt over the hips, a little deeper at the sides than the front.
  b.part(new THREE.CylinderGeometry(0.2, 0.23, 0.16, b.segments(12), 1, true), STEEL_DARK, {
    bone: "pelvis",
    at: P(0, 0.84, 0),
    scale: [1, 1, 0.7],
    name: "fauld",
  });

  // Gorget at the throat.
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.12, b.segments(10), 1), STEEL_DARK, {
    bone: "neck",
    at: P(0, 1.45, 0),
  });

  // Great helm: an eight-sided, flat-shaded drum with a flat crown. Its front face points at +Z.
  b.part(new THREE.CylinderGeometry(0.168, 0.178, 0.3, b.segments(8), 1), helmPlate, {
    bone: "head",
    at: P(0, 1.62, 0),
    rotation: [0, -22.5, 0],
    flat: true,
    name: "helm",
  });
  // Gold band round the helm.
  b.part(new THREE.CylinderGeometry(0.182, 0.182, 0.024, b.segments(8), 1, true), GOLD, {
    bone: "head",
    at: P(0, 1.7, 0),
    rotation: [0, -22.5, 0],
  });
  // T-visor slit: a bar across the eyes and a stem down the nose.
  b.part(new THREE.BoxGeometry(0.2, 0.026, 0.022), SLIT, { bone: "head", at: P(0, 1.64, 0.157) });
  b.part(new THREE.BoxGeometry(0.03, 0.13, 0.022), SLIT, { bone: "head", at: P(0, 1.565, 0.157) });

  // Crest: a flat, tapering plume arching from the crown back over the helm.
  b.sweep(
    catmull([P(0, 1.76, 0.1), P(0, 1.84, 0.05), P(0, 1.9, -0.06), P(0, 1.9, -0.2), P(0, 1.8, -0.3)]),
    (t) => {
      const k = Math.sin(Math.PI * t) ** 0.6;
      return [0.034 * k + 0.004, 0.017 * k + 0.002];
    },
    { bone: "head", section: "box", color: crest, name: "crest" },
  );

  // Tabard: a swallow-tailed surcoat hanging over the front of the body.
  b.extrude(
    [
      [-0.15, 0.36],
      [0.15, 0.36],
      [0.17, 0.0],
      [0.22, -0.34],
      [0, -0.22],
      [-0.22, -0.34],
      [-0.17, 0],
    ],
    { color: tabard, at: P(0, 1.0, 0.16), thickness: 0.016, bevel: 0.004, bone: "chest", name: "tabard" },
  );

  // Cape: a flat crimson panel hanging from the shoulders at the back.
  b.slab(
    [
      [-0.2, 1.46, -0.15],
      [0.2, 1.46, -0.15],
      [0.24, 0.9, -0.15],
      [0.26, 0.5, -0.15],
      [-0.26, 0.5, -0.15],
      [-0.24, 0.9, -0.15],
    ],
    { color: cape, thickness: 0.012, bone: "chest", name: "cape" },
  );

  // Heater shield on the left arm: a gold rim plate behind a painted face plate.
  const shieldRim: Array<[number, number]> = [
    [-0.27, 0.36],
    [0.27, 0.36],
    [0.27, 0.04],
    [0.16, -0.2],
    [0, -0.42],
    [-0.16, -0.2],
    [-0.27, 0.04],
  ];
  const shieldFaceOutline = shieldRim.map(([x, y]): [number, number] => [x * 0.85, y * 0.85]);
  b.extrude(shieldRim, {
    color: GOLD,
    at: P(0.4, 1.0, 0.2),
    thickness: 0.03,
    bevel: 0.01,
    bone: "elbowL",
    name: "shieldRim",
  });
  b.extrude(shieldFaceOutline, {
    color: shieldFace,
    at: P(0.4, 1.0, 0.22),
    thickness: 0.02,
    bevel: 0.006,
    bone: "elbowL",
    name: "shieldFace",
  });

  // Limbs: pauldrons, arm and leg armour, gauntlets and sabatons.
  for (const [s, L] of sides) {
    const q = pts(s);

    // Gothic pauldron: a dome, two lames, a spike and gold rivets along the rim.
    const cap = P(0.22 * s, 1.42, 0);
    b.part(new THREE.SphereGeometry(0.135, b.segments(12), b.segments(6), 0, Math.PI * 2, 0, Math.PI / 2), plate, {
      bone: `shoulder${L}`,
      at: cap,
      scale: [1, 0.7, 1],
    });
    b.part(new THREE.CylinderGeometry(0.15, 0.14, 0.05, b.segments(12), 1, true), STEEL_DARK, {
      bone: `shoulder${L}`,
      at: P(0.22 * s, 1.39, 0),
    });
    b.part(new THREE.CylinderGeometry(0.135, 0.125, 0.045, b.segments(12), 1, true), STEEL_DARK, {
      bone: `shoulder${L}`,
      at: P(0.22 * s, 1.345, 0),
    });
    b.part(new THREE.ConeGeometry(0.028, 0.09, b.segments(6)), plate, {
      bone: `shoulder${L}`,
      at: cap.clone().add(P(0.02 * s, 0.125, 0)),
      dir: P(0.4 * s, 1, 0),
    });
    for (const deg of [25, 65, 115, 155]) {
      const a = (deg * Math.PI) / 180;
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, {
        bone: `shoulder${L}`,
        at: cap.clone().add(P(0.128 * Math.cos(a) * s, 0, 0.128 * Math.sin(a))),
      });
    }

    // Arm: upper cannon, couter with a spike pointing back, vambrace, gauntlet.
    bar(q.shoulder, q.elbow, 0.072, 0.062, STEEL_DARK, `shoulder${L}`);
    b.part(new THREE.SphereGeometry(0.062, b.segments(10), b.segments(7)), plate, {
      bone: `elbow${L}`,
      at: q.elbow,
    });
    const back = P(0.25 * s, 0.1, -1).normalize();
    b.part(new THREE.ConeGeometry(0.02, 0.085, b.segments(6)), plate, {
      bone: `elbow${L}`,
      at: q.elbow.clone().addScaledVector(back, 0.05),
      dir: back,
    });
    bar(q.elbow, q.wrist, 0.058, 0.05, plate, `elbow${L}`);
    b.part(new THREE.BoxGeometry(0.09, 0.1, 0.085), STEEL_DARK, {
      bone: `wrist${L}`,
      at: q.wrist.clone().lerp(q.hand, 0.5),
      dir: q.hand.clone().sub(q.wrist),
    });

    // Leg: cuisse, a knee cop with a gold rosette, greave, sabaton.
    bar(q.hip, q.knee, 0.094, 0.08, plate, `hip${L}`);
    b.part(new THREE.SphereGeometry(0.085, b.segments(10), b.segments(7)), plate, {
      bone: `knee${L}`,
      at: q.knee,
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.016, b.segments(8)), GOLD, {
      bone: `knee${L}`,
      at: q.knee.clone().add(P(0, 0, 0.088)),
      dir: P(0, 0, 1),
    });
    bar(q.knee, q.ankle, 0.072, 0.06, plate, `knee${L}`);
    b.part(new THREE.BoxGeometry(0.11, 0.1, 0.25), STEEL_DARK, {
      bone: `ankle${L}`,
      at: P(0.13 * s, 0.05, 0.06),
    });
  }

  // Sword in the right hand, point down at the side: grip, pommel, crossguard, then a tapering blade.
  const hand = pts(-1).hand;
  const d = P(-0.243, -0.967, 0.049).normalize();
  const across = new THREE.Vector3().crossVectors(d, P(0, 0, 1)).normalize();
  const guard = hand.clone().addScaledVector(d, 0.07);
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.13, b.segments(8)), LEATHER, {
    bone: "handR",
    at: hand,
    dir: d,
  });
  b.part(new THREE.SphereGeometry(0.03, b.segments(8), b.segments(6)), GOLD, {
    bone: "handR",
    at: hand.clone().addScaledVector(d, -0.08),
  });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.035), GOLD, { bone: "handR", at: guard, dir: d });
  b.extrude(
    [
      [-0.02, 0],
      [0.02, 0],
      [0.02, 0.62],
      [0, 0.74],
      [-0.02, 0.62],
    ],
    {
      color: BLADE,
      at: guard,
      x: across,
      y: d,
      thickness: [0.016, 0.004],
      bevel: 0.003,
      bone: "handR",
      name: "blade",
    },
  );

  return b.root;
}
