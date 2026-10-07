// A stone gargoyle crouched on a bevelled plinth, wings half open. Blizzard heroic proportions (oversized head, shoulders
// and hands; painted stone with lit tops and violet shadows; worn bronze trim and rivets) over Overwatch-clean bevelled
// blocks with panel lines, and one accent colour: amber, on the eyes and the glyphs on the plinth die.
import * as THREE from "three";
import type { OutlinePoint } from "../src/builder";
import { createBuilder } from "../src/builder";
import { glow } from "../kits/glow";
import { limb } from "../src/ik";
import { catmull, polyline } from "../src/path";
import { cells, countershade, mottle, noise, paint, scales } from "../src/paint";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A stone gargoyle crouched on a bevelled plinth, wings half open, with glowing amber eyes.",
  style: "Blizzard/Overwatch mix",
  commit: "b816db2",
};

// Palette: warm sandstone lit from above, violet-blue shadow underneath, one amber accent.
const LIGHT = "#dcc296";
const MID = "#a8875c";
const SHADE = "#4b3f6b";
const CRACK = "#2c2439";
const STONE_DARK = "#5a4f6f";
const STONE_BODY = countershade(mottle(LIGHT, MID, { size: 0.12, contrast: 0.6, seed: 3 }), SHADE, {
  level: -0.15,
  soft: 0.3,
});
const STONE = paint((p) => {
  const c = cells(p, 0.2, 7);
  return c.d2 - c.d1 < 0.014 ? CRACK : STONE_BODY;
});

const PLINTH_A = "#9d9482";
const PLINTH_B = "#7d766a";
const BLOCK = "#2d2a31";
const MOSS = "#5d7b35";
const PEBBLE = "#b3a88f";
const PLINTH = paint((p, n) => {
  if (n.y > 0.7) {
    const gx = p.x / 0.2;
    const gz = p.z / 0.2;
    const fx = gx - Math.floor(gx);
    const fz = gz - Math.floor(gz);
    const seam = Math.min(fx, 1 - fx, fz, 1 - fz) < 0.03;
    return seam ? BLOCK : noise(p, 0.12, 5) > 0.5 ? PLINTH_A : PLINTH_B;
  }
  const row = Math.floor(p.y / 0.1);
  const fy = p.y / 0.1 - row;
  const h = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
  const u = h / 0.22 + (row % 2) * 0.5;
  const fu = u - Math.floor(u);
  if (fy < 0.05 || fy > 0.95 || fu < 0.03 || fu > 0.97) return BLOCK;
  if (p.y < 0.12 && noise(p, 0.07, 4) > 0.55) return MOSS;
  return noise(p, 0.12, 5) > 0.5 ? PLINTH_A : PLINTH_B;
});

const WING = scales(["#7d86a0", "#66708c"], "#2e2c44", { size: 0.08, width: 0.14, seed: 2 });

// Flat accents and trims.
const CAP = "#4c4858";
const BRONZE = "#c98a34";
const AMBER = "#ffb13b";
const INK = "#1d1826";
const TEETH = "#f1e6c8";
const CLAW = "#2a2530";
const HORN = "#b9ad98";

const EAR: OutlinePoint[] = [
  [0.05, -0.03],
  [0.03, 0.05],
  [-0.02, 0.07],
  [-0.1, 0.11, "sharp"],
  [-0.05, 0.02],
  [-0.02, -0.04],
];

function square(h: number): [number, number][] {
  return [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h],
  ];
}

/** Points on a circle of radius r round c, in the plane square to axis. */
function circle(c: number[], axis: number[], r: number, n = 14): number[][] {
  const a = new THREE.Vector3(...axis).normalize();
  const ref = Math.abs(a.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(a, ref).normalize();
  const v = new THREE.Vector3().crossVectors(a, u).normalize();
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    out.push(new THREE.Vector3(...c).addScaledVector(u, r * Math.cos(t)).addScaledVector(v, r * Math.sin(t)).toArray());
  }
  return out;
}

export default function build() {
  const b = createBuilder({ name: "cathedralGargoyle" });
  // Mirror helper: the left side is +X, so s = 1 is the creature's left and s = -1 its right.
  const S = (s: number, x: number, y: number, z: number): number[] => [s * x, y, z];

  // ---- Plinth: three bevelled slabs (base, die, cap) on the root bone. The root is left still by the flex tests.
  const base = b.joint("base", { at: [0, 0.4, 0] });
  b.extrude(square(0.5), {
    at: [0, 0.05, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.1,
    bevel: 0.02,
    color: PLINTH,
    bone: base,
  });
  b.extrude(square(0.4), {
    at: [0, 0.2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.2,
    bevel: 0.015,
    color: PLINTH,
    bone: base,
  });
  b.extrude(square(0.46), {
    at: [0, 0.35, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.1,
    bevel: 0.02,
    color: CAP,
    bone: base,
  });
  for (const x of [-0.42, 0.42])
    for (const z of [-0.42, 0.42])
      b.part(new THREE.SphereGeometry(0.018, 8, 6), BRONZE, { bone: base, at: [x, 0.41, z] });
  b.part(new THREE.SphereGeometry(1, 8, 6), MOSS, { bone: base, at: [0.3, 0.4, -0.32], scale: [0.08, 0.03, 0.07] });
  b.part(new THREE.SphereGeometry(1, 8, 6), MOSS, { bone: base, at: [-0.36, 0.4, -0.3], scale: [0.06, 0.025, 0.06] });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), PEBBLE, { bone: base, at: [-0.22, 0.42, 0.3], scale: [1, 0.6, 0.8] });
  b.part(new THREE.SphereGeometry(0.025, 6, 5), PEBBLE, { bone: base, at: [0.26, 0.41, -0.2], scale: [1, 0.6, 1.2] });
  // Amber glyph band across the die's front wall.
  for (const x of [-0.3, -0.18, -0.06, 0.06, 0.18])
    glow(
      b.sweep(
        polyline([
          [x, 0.16, 0.402],
          [x + 0.05, 0.24, 0.402],
          [x + 0.1, 0.16, 0.402],
        ]),
        0.006,
        { bone: base, color: AMBER },
      ),
      1.3,
    );
  glow(b.sweep(polyline([[-0.32, 0.12, 0.402], [0.32, 0.12, 0.402]]), 0.006, { bone: base, color: AMBER }), 1.3);

  // ---- Skeleton: spine (hips, waist, chest, neck tip), head with a jaw, tail, legs, arms, fingers and wings.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.6, -0.05],
      [0, 0.7, 0.03],
      [0, 0.8, 0.15],
      [0, 0.9, 0.3],
    ]),
    { parent: base, names: ["hips", "waist", "chest", "neck"], role: "spine" },
  );
  const hips = spine.joints[0];
  const waist = spine.joints[1];
  const chest = spine.joints[2];
  const neck = spine.joints[3];
  const head = b.joint("head", { parent: neck, at: [0, 0.98, 0.37], dir: [0, -0.3, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.15 }),
    aim: head.local({ forward: 0.25, up: -0.18 }),
    role: "jaw",
  });

  // ---- Torso: one lofted body, oversized chest, dorsal spikes, a bronze belt with rivets.
  const torso = b.loft(
    [
      { at: [0, 0.6, -0.05], w: 0.36, h: 0.32 },
      { at: [0, 0.7, 0.03], w: 0.38, h: 0.34 },
      { at: [0, 0.8, 0.15], w: 0.5, h: 0.42 },
      { at: [0, 0.9, 0.3], w: 0.28, h: 0.26 },
    ],
    { bone: spine, color: STONE },
  );
  b.along(torso, 6, (at) => b.spike(at, at, 0.1, 0.034, { color: STONE_DARK }), { from: 0.12, to: 0.9 });
  const belt = b.surface(torso).loop(waist, { lift: 0.012 });
  b.sweep(belt, 0.014, { color: BRONZE });
  b.along(belt, 12, (at) => b.part(new THREE.SphereGeometry(0.011, 6, 4), BRONZE, { at }));
  b.part(new THREE.BoxGeometry(0.06, 0.04, 0.02), BRONZE, { bone: waist, at: [0, 0.7, 0.215] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 14, 10), STONE, {
      bone: chest,
      at: chest.local({ forward: 0.1, left: s * 0.11, up: -0.03 }),
      scale: [0.12, 0.11, 0.1],
    });

  b.extrude(
    [
      [-0.13, 0.1],
      [0.13, 0.1],
      [0.1, -0.04],
      [0, -0.13, "sharp"],
      [-0.1, -0.04],
    ],
    { at: [0, 0.82, 0.35], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.008, color: CAP, bone: chest },
  );
  for (const [x, y] of [
    [0.115, 0.92],
    [-0.115, 0.92],
    [0.09, 0.78],
    [-0.09, 0.78],
  ])
    b.part(new THREE.SphereGeometry(0.009, 6, 4), BRONZE, { bone: chest, at: [x, y, 0.37] });

  // ---- Tail: hangs over the back of the plinth and ends in a flat spade.
  const tail = b.chain("tail", catmull([[0, 0.6, -0.08], [0, 0.54, -0.22], [0, 0.45, -0.36], [0, 0.46, -0.5], [0, 0.6, -0.58]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });
  const tailBody = b.sweep(tail, [0.07, 0.055, 0.04, 0.03, 0.018], { color: STONE });
  b.along(tailBody, 5, (at) => b.spike(at, at, 0.05, 0.016, { color: STONE_DARK }), { from: 0.1, to: 0.95 });
  b.extrude(
    [
      [0, 0.12, "sharp"],
      [0.06, 0.04],
      [0.02, -0.02],
      [0.04, -0.1, "sharp"],
      [0, -0.05],
      [-0.04, -0.1, "sharp"],
      [-0.02, -0.02],
      [-0.06, 0.04],
    ],
    { at: tail.joints[4], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.03, bevel: 0.006, color: STONE, bone: tail.joints[4] },
  );

  // ---- Legs: crouched, knees forward, feet flat on the plinth with three claws each.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb(S(s, 0.17, 0.6, -0.02), S(s, 0.16, 0.43, 0.24), [0.25, 0.2, 0.13], [0, 0.3, 1], { sole: [0, 0, 1] });
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      role: "leg",
    });
    b.sweep(leg, [0.095, 0.075, 0.05, 0.04], { color: STONE });
    const foot = leg.tip!;
    for (const off of [-0.03, 0, 0.03]) {
      b.capsule(foot.local({ forward: -0.04, left: s * off }), foot.local({ forward: 0.02, left: s * off }), 0.014, {
        bone: foot,
        color: STONE,
      });
      b.spike(foot.local({ forward: 0.02, left: s * off }), [0, -0.2, 1], 0.045, 0.012, { bone: foot, color: CLAW });
    }
  }

  // ---- Arms: oversized shoulders with a bronze strap, big hands planted on the plinth, four fingers and a thumb.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb(S(s, 0.25, 0.8, 0.16), S(s, 0.22, 0.46, 0.36), [0.28, 0.25], [s, 0.4, -0.3]);
    const arm = b.chain(`arm${L}`, pts, { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" });
    b.sweep(arm, [0.085, 0.065, 0.05], { color: STONE });
    const hand = arm.tip!;
    const shoulder = arm.joints[0];
    b.part(new THREE.SphereGeometry(1, 14, 10), STONE, {
      bone: shoulder,
      at: pts[0],
      scale: [0.14, 0.13, 0.14],
    });
    const strapDir = pts[1].clone().sub(pts[0]).toArray();
    b.sweep(catmull(circle(pts[0].toArray(), strapDir, 0.16), { closed: true }), 0.012, { bone: shoulder, color: BRONZE });
    b.part(new THREE.SphereGeometry(1, 14, 10), STONE, { bone: hand, at: [s * 0.22, 0.46, 0.38], scale: [0.09, 0.05, 0.1] });
    for (let i = 0; i < 4; i++) {
      const lat = s * (i - 1.5) * 0.03;
      const x0 = s * 0.22;
      const finger = b.chain(
        `finger${L}${i}`,
        [
          [x0 + lat * 0.8, 0.45, 0.37],
          [x0 + lat, 0.43, 0.42],
          [x0 + lat * 1.1, 0.42, 0.47],
        ],
        { parent: hand, names: [`f${L}${i}a`, `f${L}${i}b`, `f${L}${i}tip`], role: "digit" },
      );
      b.sweep(finger, [0.024, 0.02, 0.015], { color: STONE });
      b.spike(finger.tip!, [0, -0.25, 1], 0.045, 0.012, { color: CLAW });
    }
    const thumb = b.chain(
      `thumb${L}`,
      [
        [s * 0.27, 0.45, 0.33],
        [s * 0.31, 0.43, 0.37],
        [s * 0.34, 0.42, 0.41],
      ],
      { parent: hand, names: [`thumb${L}a`, `thumb${L}b`, `thumb${L}tip`], role: "digit" },
    );
    b.sweep(thumb, [0.028, 0.022, 0.016], { color: STONE });
    b.spike(thumb.tip!, [s * 0.3, -0.2, 1], 0.04, 0.011, { color: CLAW });
  }

  // ---- Wings: half open from the shoulder blades. Each wing is a jointed arm, four stone ribs from the wrist and
  // membranes of scaled stone between them.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const R = S(s, 0.2, 0.88, -0.02);
    const E = S(s, 0.34, 1.0, -0.1);
    const Wr = S(s, 0.5, 1.08, -0.18);
    const wing = b.chain(`wing${L}`, catmull([R, E, Wr]), {
      parent: chest,
      names: [`wingRoot${L}`, `wingElbow${L}`, `wingWrist${L}`],
      role: "wing",
    });
    b.sweep(wing, [0.045, 0.03, 0.022], { color: STONE_DARK });
    const wrist = wing.tip!;
    const ribs = [
      { tip: S(s, 0.74, 0.96, -0.3), mid: S(s, 0.62, 1.07, -0.24) },
      { tip: S(s, 0.66, 0.78, -0.28), mid: S(s, 0.6, 0.95, -0.22) },
      { tip: S(s, 0.56, 0.66, -0.2), mid: S(s, 0.54, 0.86, -0.19) },
      { tip: S(s, 0.4, 0.56, -0.1), mid: S(s, 0.47, 0.8, -0.14) },
    ];
    const fingers = ribs.map((rib, i) => {
      const c = b.chain(`wing${i}${L}`, catmull([Wr, rib.mid, rib.tip]), {
        parent: wrist,
        names: [`wf${i}a${L}`, `wf${i}b${L}`, `wf${i}Tip${L}`],
        role: "wing",
      });
      b.sweep(c, [0.024, 0.016, 0.009], { color: STONE_DARK });
      return c;
    });
    b.membrane(polyline([Wr, E]), fingers[0], { color: WING, thickness: 0.025 });
    b.membrane(fingers[0], fingers[1], { color: WING, thickness: 0.025 });
    b.membrane(fingers[1], fingers[2], { color: WING, thickness: 0.025 });
    b.membrane(fingers[2], fingers[3], { color: WING, thickness: 0.025 });
    b.membrane(fingers[3], polyline([Wr, S(s, 0.34, 0.84, -0.1), S(s, 0.21, 0.68, -0.05)]), {
      color: WING,
      thickness: 0.025,
    });
    b.spike(fingers[0].tip!, S(s, 0.24, -0.12, -0.12), 0.06, 0.016, { color: CLAW });
  }

  // ---- Head: big cranium, heavy brow, a rounded muzzle with fangs, a lower jaw on its own joint, swept-back horns, ears.
  b.part(new THREE.SphereGeometry(1, 16, 12), STONE, {
    bone: head,
    at: head.local({ up: 0.03, forward: -0.02 }),
    scale: [0.15, 0.14, 0.16],
  });
  b.capsule(head.local({ forward: 0.12, up: 0.09, left: 0.1 }), head.local({ forward: 0.13, up: 0.085, right: 0.1 }), 0.032, {
    bone: head,
    color: STONE,
  });
  b.loft(
    [
      { at: head.local({ forward: 0.0, up: -0.01 }), w: 0.17, h: 0.15 },
      { at: head.local({ forward: 0.12, up: -0.045 }), w: 0.14, h: 0.12 },
      { at: head.local({ forward: 0.22, up: -0.06 }), w: 0.1, h: 0.1 },
    ],
    { bone: head, color: STONE },
  );
  b.loft(
    [
      { at: jaw.local({ forward: -0.02 }), w: 0.12, h: 0.05 },
      { at: jaw.local({ forward: 0.08, up: -0.005 }), w: 0.11, h: 0.05 },
      { at: jaw.local({ forward: 0.17, up: -0.01 }), w: 0.08, h: 0.04 },
    ],
    { bone: jaw, color: STONE },
  );
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(1, 10, 8), AMBER, {
        bone: head,
        at: head.local({ forward: 0.13, up: 0.04, left: s * 0.075 }),
        scale: [0.03, 0.026, 0.024],
      }),
      1.6,
    );
    b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
      bone: head,
      at: head.local({ forward: 0.22, up: -0.045, left: s * 0.035 }),
      scale: 0.014,
    });
    b.spike(head.local({ forward: 0.15, up: -0.1, left: s * 0.06 }), [0, -1, 0], 0.04, 0.012, {
      bone: head,
      color: TEETH,
    });
    b.spike(jaw.local({ forward: 0.12, up: 0.035, left: s * 0.06 }), [0, 1, 0], 0.045, 0.011, { bone: jaw, color: TEETH });
    b.sweep(
      catmull([
        head.local({ up: 0.1, left: s * 0.1 }),
        head.local({ up: 0.17, left: s * 0.13, back: 0.08 }),
        head.local({ up: 0.19, left: s * 0.15, back: 0.2 }),
      ]),
      [0.035, 0.02, 0.006],
      { bone: head, color: HORN, caps: { end: "point" } },
    );
    b.extrude(EAR, {
      at: head.local({ left: s * 0.15, up: 0.05 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.005,
      color: STONE,
      bone: head,
    });
  }

  return b.root;
}
