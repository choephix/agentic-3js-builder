import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { noise } from "../src/paint";
import { cellPaint, pixelArt, stepped } from "../kits/pixel";
import { glow } from "../kits/glow";

export const meta = {
  name: "Basilisk King",
  description:
    "An eight-legged serpent-lizard king: a long scaled body on four sprawling leg pairs, a spiked gold crown with a red gem on the brow, glowing eyes, a forked tongue, red frills and a spade-tipped tail, drawn in square pixels.",
  style: "pixel art",
  commit: "b816db2",
};

// One texel of the pixel style, in metres: paint cells, eye and gem pixels all snap to it or a third of it.
const TEXEL = 0.03;

const SCALE_RAMP = ["#0f2a18", "#1f4d2a", "#2f6e35", "#4c9440", "#7ac24e"];
const BELLY_RAMP = ["#7a5a22", "#b8903a", "#e6c262", "#fbe9a6"];
const GOLD_RAMP = ["#6a4312", "#a8741c", "#e0a82e", "#ffe27a"];
const GOLD = "#e0a82e";
const RED = "#c8323a";
const TONGUE = "#d9505e";
const FANG = "#f4ecd0";
const JAW = "#e6c262";
const MOUTH = "#5a1424";
const INK = "#0b1a10";

// Scales: each cell is one scale-sized pixel on the body, with dark scale lips, a pale belly, a gold dorsal line,
// chevron saddles along the back and gold rosettes on the flanks. Dithered so ramp steps show as pixel checks.
const SCALE = cellPaint(
  TEXEL,
  (c) => {
    const { x, y, z } = c.at;
    if (c.n.y < -0.45) return c.pick(BELLY_RAMP, 0.9 + 0.1 * (noise(c.at, 0.08, 4) - 0.5));
    const top = Math.max(0, c.n.y);
    if (top > 0.6 && Math.abs(x) < 0.02 && z > -1.0 && z < 1.1) return c.pick(GOLD_RAMP, 0.6);
    if (z < -1.2 && Math.floor((z + 2) / 0.12) % 2 === 0) return c.pick(GOLD_RAMP, 0.7);
    const rosette = Math.round((z + 1.0) / 0.4);
    const dz = z - (rosette * 0.4 - 1.0);
    const dy = y - 0.44;
    const d2 = dz * dz + dy * dy;
    if (Math.abs(c.n.x) > 0.5 && z > -1.0 && z < 0.9 && d2 < 0.0064 && d2 > 0.0016) return c.pick(GOLD_RAMP, 0.45);
    let v = 0.42 + 0.32 * top + 0.22 * (noise(c.at, 0.12, 2) - 0.5);
    if ((((c.u + (c.v & 1)) % 3) + 3) % 3 === 0) v -= 0.22; // lip of every scale row
    const saddle = Math.floor((z + 1.95) / 0.3) % 2 === 0;
    if (saddle && top > 0.5 && Math.abs(x) < 0.12 && z < 1.0) v -= 0.3;
    if (z > 1.0) v += 0.12; // the skull and snout are paler
    return c.pick(SCALE_RAMP, v);
  },
  { dither: true },
);

// Eyes: slit pupil, yellow iris, dark rim; drawn on the 0.01 m pixel grid.
const EYE = pixelArt(
  [
    "...kkk...",
    "..kwyyk..",
    ".kwyyyyk.",
    "kyyyPyyok",
    "kyyyPyyok",
    "kyyyPyyok",
    ".kyyyyok.",
    "..koook..",
    "...kkk...",
  ],
  { k: INK, w: "#fff6c0", y: "#ffd23a", o: "#e0701c", P: "#0b0805" },
);

// The gem in the crown's brow.
const GEM = pixelArt(["..k..", ".kRk.", "kRWRk", ".kRk.", "..k.."], { k: INK, R: RED, W: "#ffb8a8" });

// Body radius along the spine, keyed by z (tail tip to skull), linearly interpolated.
const RADIUS: [number, number][] = [
  [-1.95, 0.012],
  [-1.6, 0.03],
  [-1.15, 0.06],
  [-0.6, 0.15],
  [-0.1, 0.19],
  [0.42, 0.21],
  [0.72, 0.17],
  [1.0, 0.13],
  [1.14, 0.12],
];

function radiusAt(z: number) {
  for (let i = 1; i < RADIUS.length; i++) {
    const [z0, r0] = RADIUS[i - 1];
    const [z1, r1] = RADIUS[i];
    if (z <= z1) return r0 + ((z - z0) / (z1 - z0)) * (r1 - r0);
  }
  return RADIUS[RADIUS.length - 1][1];
}

// Four pairs of legs: where the hip sits inside the body, and where the foot lands on the floor.
const LEGS = [
  { z: 0.42, hipY: 0.46, footZ: 0.58 },
  { z: 0.02, hipY: 0.43, footZ: 0.08 },
  { z: -0.38, hipY: 0.38, footZ: -0.43 },
  { z: -0.78, hipY: 0.33, footZ: -0.94 },
];
const FOOT_Y = 0.035;

export default function build() {
  const b = createBuilder({ name: "basilisk" });

  // Spine: one curve from the tail tip to the base of the skull, split at the hips into tail, trunk and neck.
  const body = catmull([
    [0, 0.16, -1.95],
    [0, 0.2, -1.6],
    [0, 0.27, -1.15],
    [0, 0.42, -0.5],
    [0, 0.47, -0.05],
    [0, 0.5, 0.42],
    [0, 0.6, 0.72],
    [0, 0.82, 0.98],
    [0, 0.98, 1.12],
  ]);
  const rootT = body.closestT([0, 0.42, -0.5]);
  const neckT = body.closestT([0, 0.6, 0.72]);

  const hips = b.joint("hips", { at: body.at(rootT), role: "spine" });
  const tail = b.chain("tail", body.slice(rootT, 0), { parent: hips, count: 5, role: "tail" });
  const trunk = b.chain("trunk", body.slice(rootT, neckT), { parent: hips, count: 4, role: "spine" });
  const trunkEnd = trunk.joints[trunk.joints.length - 1];
  const neck = b.chain("neck", body.slice(neckT, 1), { parent: trunkEnd, count: 3, role: "neck" });
  const neckEnd = neck.joints[neck.joints.length - 1];
  const tailEnd = tail.joints[tail.joints.length - 1];

  const head = b.joint("head", { parent: neckEnd, at: body.at(1), aim: [0, 0.93, 1.6], role: "head" });

  // The body skin: a flattened tube over the whole spine, skinned across the hips, scaled with the paint.
  const bodySweep = b.sweep(
    body,
    (t): [number, number] => {
      const r = radiusAt(body.at(t).z);
      return [r * 1.08, r * 0.86];
    },
    { bone: [tail, hips, trunk, neck], color: SCALE },
  );

  // Dorsal spines along the back and neck, sized by the skin radius where each one stands.
  b.along(bodySweep, 16, (at) => b.spike(at, at, 0.35 * at.radius + 0.03, 0.14 * at.radius, { color: GOLD }), {
    from: 0.28,
    to: 0.92,
  });

  // Tail tip: a stepped spade, flat in the vertical plane, pointing back from the tip.
  const spade = stepped(
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 4],
      [0, 3],
      [0, 2],
      [0, 1],
    ],
    TEXEL,
    { rows: true, start: -4 },
  );
  b.extrude(spade, {
    at: body.at(0),
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.025,
    color: RED,
    bone: tailEnd,
  });

  // Gold gorget round the base of the neck, with a ring of small spikes.
  const gorget = b.surface(bodySweep).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(gorget, 0.018, { color: GOLD });
  b.along(gorget, 10, (at) => b.spike(at, at, 0.04, 0.012, { color: GOLD }));

  // Legs: four pairs, each a three-joint limb from a hip inside the body to a foot on the floor.
  LEGS.forEach((leg, i) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hip: [number, number, number] = [s * 0.12, leg.hipY, leg.z];
      const foot: [number, number, number] = [s * 0.74, FOOT_Y, leg.footZ];
      const pts = limb(hip, foot, [0.42, 0.4], [[s * 0.25, 1, -0.4]]);
      const chain = b.chain(`leg${side}${i + 1}`, pts, {
        parent: hips,
        names: [`hip${side}${i + 1}`, `knee${side}${i + 1}`, `ankle${side}${i + 1}`],
        role: "leg",
      });
      b.sweep(chain, [0.075, 0.046, 0.036], {
        color: SCALE,
        bands: [
          [0.4, SCALE],
          [0.47, GOLD],
          [1, SCALE],
        ],
      });

      const ankle = chain.tip;
      if (!ankle) throw new Error("leg chain has no tip");
      b.part(new THREE.SphereGeometry(0.05, 8, 5), SCALE, { bone: ankle, at: ankle.at, scale: [1.2, 0.55, 1.4] });
      for (const k of [-1, 0, 1]) {
        b.spike(ankle.moved({ forward: 0.05, right: k * 0.03 }), [k * 0.2, -0.6, 1], 0.06, 0.014, { color: FANG });
      }
    }
  });

  // Head: a wedge-shaped skull lofted along the head joint, with a dark mouth roof and a hinged lower jaw.
  const HEAD_STATIONS: [number, number, number, number][] = [
    [-0.1, 0.3, 0.25, 0.02],
    [0.04, 0.38, 0.3, 0.03],
    [0.2, 0.32, 0.24, 0.0],
    [0.34, 0.2, 0.16, -0.02],
    [0.44, 0.12, 0.1, -0.03],
  ];
  const skull = b.loft(
    HEAD_STATIONS.map(([f, w, h, u]) => ({ at: head.local({ forward: f, up: u }), w, h })),
    { bone: head, color: SCALE },
  );

  for (const s of [1, -1]) {
    // Brow horns above each eye.
    b.spike(head.moved({ left: s * 0.11, up: 0.14, forward: 0.02 }), [s * 0.3, 1, -0.35], 0.1, 0.024, { color: GOLD });
    // Glowing eye, drawn on the flank of the skull.
    const eye = b.decal(head, EYE, {
      at: head.local({ left: s * 0.18, up: 0.04, forward: 0.12 }),
      dir: [s, 0, 0.35],
      size: [0.12, 0.12],
    });
    glow(eye, 1.2);
    // Red frill fin standing off the back of the skull.
    const frill = stepped(
      [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 4],
        [0, 2],
      ],
      TEXEL,
      { rows: true },
    );
    b.extrude(frill, {
      at: head.moved({ left: s * 0.19, forward: -0.05, up: 0.0 }),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.02,
      color: RED,
      bone: head,
    });
  }

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: -0.02, up: -0.13 }),
    aim: head.local({ forward: 0.44, up: -0.19 }),
    role: "jaw",
  });
  b.loft(
    [
      { at: head.local({ forward: -0.02, up: -0.13 }), w: 0.22, h: 0.06 },
      { at: head.local({ forward: 0.14, up: -0.16 }), w: 0.2, h: 0.05 },
      { at: head.local({ forward: 0.28, up: -0.18 }), w: 0.13, h: 0.04 },
      { at: head.local({ forward: 0.4, up: -0.2 }), w: 0.06, h: 0.03 },
    ],
    { bone: jaw, color: JAW },
  );
  // Dark mouth roof between the skull and the jaw.
  b.loft(
    [
      { at: head.local({ forward: -0.02, up: -0.12 }), w: 0.2, h: 0.02 },
      { at: head.local({ forward: 0.16, up: -0.12 }), w: 0.18, h: 0.02 },
      { at: head.local({ forward: 0.32, up: -0.12 }), w: 0.12, h: 0.02 },
      { at: head.local({ forward: 0.42, up: -0.11 }), w: 0.04, h: 0.02 },
    ],
    { bone: head, color: MOUTH },
  );

  // Fangs: upper ones hang from the skull, lower ones rise from the jaw.
  for (const s of [1, -1]) {
    b.spike(head.moved({ left: s * 0.08, up: -0.12, forward: 0.18 }), [s * 0.06, -1, 0.12], 0.075, 0.014, {
      color: FANG,
    });
    b.spike(jaw.moved({ left: s * 0.07, up: 0.02, forward: 0.22 }), [s * 0.03, 1, 0.1], 0.05, 0.011, {
      color: FANG,
    });
  }

  // Forked tongue out of the mouth.
  const tongueTip = head.local({ forward: 0.58, up: -0.16 });
  b.sweep(
    catmull([head.local({ forward: 0.1, up: -0.13 }), head.local({ forward: 0.4, up: -0.14 }), tongueTip]),
    [0.016, 0.01],
    { bone: jaw, color: TONGUE },
  );
  for (const s of [1, -1]) {
    b.sweep([tongueTip, head.local({ forward: 0.7, left: s * 0.03, up: -0.18 })], [0.008, 0.004], {
      bone: jaw,
      color: TONGUE,
      detail: 0.5,
    });
  }

  // Crown: a gold band hugging the skull at brow height, with a spike on every other point and a gem at the front.
  const skin = b.surface(skull);
  const crownCentre = head.moved({ forward: 0.05, up: 0.02 });
  const crownHits = Array.from({ length: 24 }, (_, i) => skin.around(crownCentre).at(i * 15, 22)).filter(
    (hit) => hit !== null,
  );
  b.sweep(catmull(crownHits.map((hit) => hit.moved([0, 0.008, 0])), { closed: true }), 0.016, { color: GOLD });
  crownHits.forEach((hit, i) => {
    if (i % 2 === 0) return;
    b.spike(hit, hit, 0.11, 0.026, { color: GOLD });
  });
  const gemAt = crownHits[0].moved([0, 0.03, 0]);
  const gem = b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    texture: GEM,
    at: gemAt,
    dir: [0, 0, 1],
    axis: "z",
    bone: head,
  });
  glow(gem, 1);

  return b.root;
}
