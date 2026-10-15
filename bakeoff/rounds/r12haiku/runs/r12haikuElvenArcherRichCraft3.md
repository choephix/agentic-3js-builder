```ts
import * as THREE from "three";
import { bezier, catmull, createBuilder, frame, grain, limb, paint, polyline, rng, svg } from "agentic-3js-builder";
import { animeEye, cel, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "elven ranger archer",
  description:
    "A slender elven ranger in a green tunic with gold trim, drawing an emerald-gripped longbow, with a feathered quiver and a dagged cape, in high-fantasy anime style.",
};

type Outline = Array<[number, number] | [number, number, "sharp"]>;
type Row = [number, number, number];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Points round an ellipse at height y: collars and rings. */
const loopOf = (rx: number, rz: number, y: number, n: number): Row[] =>
  Array.from({ length: n }, (_, i): Row => {
    const a = (i / n) * Math.PI * 2;
    return [Math.sin(a) * rx, y, Math.cos(a) * rz];
  });

// ---- palette: cel-shaded skin, cloth, leather, hair and metal -----------------------------------

const SKIN = cel("#fde0c9", "#e9aea6");
const HAIR = cel(grain("#f3fcf8", "#9fdcd3", { size: 0.04, axis: "y", seed: 3 }));
const TUNIC = cel("#2f7d55");
/** Tunic with one gold embroidery band round the chest. */
const TUNIC_TRIM = cel(paint((p) => (Math.abs(p.y - 1.2) < 0.006 ? "#ffd66b" : "#2f7d55")));
/** Cape: deep teal with a gold centre stripe and a gold hem. */
const CAPE = cel(paint((_p, _n, s) => (s[1] < -0.9 || Math.abs(s[0]) < 0.011 ? "#ffd66b" : "#1f6258")));
const PANTS = cel("#4a5c3a");
const LEATHER = cel("#8c5a33");
const BOOT = cel("#4b2d1c");
const GOLD = cel("#ffd66b", "#d9953e");
const STEEL = cel("#eef4fa", "#8fa3ba");
const WOOD = cel(grain("#b07a46", "#5e3418", { size: 0.025, axis: "y", seed: 5 }));
/** Quiver: leather with one gold band. */
const QUIVER = cel(paint((_p, _n, s) => (Math.abs(s[0] - 0.3) < 0.03 ? "#ffd66b" : "#8c5a33")));

// ---- textures ---------------------------------------------------------------------------------

const EYE = animeEye({ iris: "#3ad8b0", irisLight: "#c4fff0" });

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" fill="#1f6258" stroke="#ffd66b" stroke-width="4"/>
    <path d="M32 9 C47 22 49 42 32 56 C15 42 17 22 32 9Z" fill="#8ff2d8" stroke="#0e3b36" stroke-width="2.5"/>
    <path d="M32 15 L32 52" stroke="#0e3b36" stroke-width="2.2"/>
    <path d="M32 26 L24 20 M32 26 L40 20 M32 37 L23 31 M32 37 L41 31" stroke="#0e3b36" stroke-width="1.8" fill="none"/>
    <circle cx="32" cy="32" r="3.2" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const FEATHER = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 C2 18 3 46 12 62 C21 46 22 18 12 2Z" fill="#8ff0d8" stroke="#1d5f57" stroke-width="1.5"/>
    <path d="M12 4 L12 60" stroke="#f6f0dc" stroke-width="1.6"/>
  </svg>`,
  { size: 96 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g"><stop offset="0" stop-color="#ff7fa8" stop-opacity="0.9"/><stop offset="1" stop-color="#ff7fa8" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="20" cy="12" rx="19" ry="11" fill="url(#g)"/>
  </svg>`,
  { size: 64 },
);

/** A single hair strand, drawn in greys so the card takes its tint. */
const STRAND = svg(
  `<svg viewBox="0 0 16 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 0 C2 18 13 36 5 64 C11 44 15 22 9 0Z" fill="#ffffff"/>
  </svg>`,
  { size: 64 },
);

// ---- outlines ---------------------------------------------------------------------------------

/** Dagged cape, drawn in the plane of x and y (width along x, height along y). */
const CAPE_OUTLINE: Outline = [
  [-0.2, 0.26],
  [0.2, 0.26],
  [0.25, 0.0],
  [0.33, -0.5],
  [0.37, -0.96],
  [0.28, -0.84, "sharp"],
  [0.2, -0.98, "sharp"],
  [0.1, -0.84, "sharp"],
  [0.0, -0.98, "sharp"],
  [-0.1, -0.84, "sharp"],
  [-0.2, -0.98, "sharp"],
  [-0.28, -0.84, "sharp"],
  [-0.37, -0.96],
  [-0.33, -0.5],
  [-0.25, 0.0],
];

/** Pointed elf ear, pointing back and a little up from its base. */
const EAR: Outline = [
  [-0.02, -0.02],
  [0.04, 0.0],
  [0.1, 0.03],
  [0.14, 0.07, "sharp"],
  [0.06, 0.03],
  [0.0, -0.02],
];

/** Swept fringe over the forehead, drawn in the plane of x and y. */
const FRINGE: Outline = [
  [-0.13, 0.0],
  [0.0, 0.012],
  [0.13, -0.008],
  [0.1, -0.03],
  [0.0, -0.045],
  [-0.07, -0.03],
  [-0.14, -0.02, "sharp"],
];

/** Teardrop earring. */
const DROP: Outline = [
  [0, 0],
  [0.007, -0.008],
  [0, -0.024, "sharp"],
  [-0.007, -0.008],
];

export default function build() {
  const b = createBuilder({ name: "elven ranger archer" });

  // ---- skeleton ---------------------------------------------------------------------------------

  const hips = b.joint("hips", { at: V(0, 0.98, 0), role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([V(0, 0.98, 0), V(0, 1.12, 0), V(0, 1.28, 0), V(0, 1.4, 0)]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "shoulders"], role: "spine" },
  );
  const shoulders = spine.tip!;
  const neck = b.chain("neck", catmull([V(0, 1.4, 0), V(0, 1.5, 0.006), V(0, 1.58, 0.012)]), {
    parent: shoulders,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: V(0, 1.66, 0), dir: [0, 1, 0], role: "head" });

  // Legs: knees bend forward, feet land flat on the floor.
  const legL = b.chain("legL", limb(V(0.09, 0.97, 0), V(0.095, 0.075, 0), [0.47, 0.45], [[0, 0, 1]]), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
  });
  const legR = b.chain("legR", limb(V(-0.09, 0.97, 0), V(-0.095, 0.075, 0), [0.47, 0.45], [[0, 0, 1]]), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
  });

  // Arms: the left holds the bow grip out front, the right draws the string to the cheek.
  const GRIP = V(0.1, 1.42, 0.48);
  const NOCK = V(-0.06, 1.5, 0.12);
  const armL = b.chain("armL", limb(V(0.17, 1.4, 0), GRIP, [0.3, 0.27], [[0.8, -0.9, 0.1]]), {
    parent: shoulders,
    names: ["shoulderL", "elbowL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", limb(V(-0.17, 1.4, 0), NOCK, [0.3, 0.27], [[-1, -0.5, -0.6]]), {
    parent: shoulders,
    names: ["shoulderR", "elbowR", "handR"],
    role: "arm",
  });
  const handL = armL.tip!;
  const handR = armR.tip!;

  // ---- torso ------------------------------------------------------------------------------------

  const torso = b.loft(
    [
      { at: V(0, 0.98, 0), w: 0.25, h: 0.17 },
      { at: V(0, 1.12, 0), w: 0.2, h: 0.14 },
      { at: V(0, 1.28, 0), w: 0.26, h: 0.18 },
      { at: V(0, 1.4, 0), w: 0.31, h: 0.17 },
      { at: V(0, 1.47, 0), w: 0.13, h: 0.12 },
    ],
    { bone: [spine, hips], color: TUNIC_TRIM },
  );
  const chest = b.surface(torso);

  // Collar: a dark cloth ring with a gold piping above it.
  b.sweep(catmull(loopOf(0.075, 0.07, 1.47, 10), { closed: true }), 0.02, { color: TUNIC, bone: neck });
  b.sweep(catmull(loopOf(0.078, 0.073, 1.495, 12), { closed: true }), 0.0055, { color: GOLD, bone: neck });
  b.sweep(neck, 0.05, { color: SKIN });

  // Belt, buckle, pouch, emblem and the emerald at its heart.
  b.sweep(chest.loop(spine.joints[1], { lift: 0.012 }), 0.018, { color: LEATHER });
  b.stick(new THREE.BoxGeometry(0.05, 0.04, 0.012), GOLD, chest.nearest(V(0, 1.12, 0.3)).moved([0, 0.018, 0]), {
    embed: 0.25,
  });
  b.stick(new THREE.BoxGeometry(0.056, 0.06, 0.03), LEATHER, chest.nearest(V(-0.11, 1.1, 0.3)), { embed: 0.3 });
  b.decal(torso, EMBLEM, { at: chest.nearest(V(0, 1.28, 0.3)), dir: [0, 0, 1], size: [0.09, 0.09] });
  glow(
    b.stick(new THREE.SphereGeometry(0.013, 8, 6), "#63ffd0", chest.nearest(V(0, 1.28, 0.3)).moved([0, 0.002, 0])),
    1.6,
  );

  // Sleeves, leather bracers with a gold band, and hands.
  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR;
    b.sweep(arm, (t: number) => 0.05 - 0.009 * t, { from: 0, to: 0.58, color: TUNIC });
    b.sweep(arm, (t: number) => 0.0465 + 0.0 * t, { from: 0.6, to: 0.63, color: GOLD });
    b.sweep(arm, (t: number) => 0.042 - 0.004 * t, { from: 0.58, to: 0.9, color: LEATHER });
  }
  b.part(new THREE.SphereGeometry(1, 10, 8), LEATHER, { bone: handL, at: GRIP, scale: [0.034, 0.038, 0.032] });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: handR, at: NOCK, scale: [0.03, 0.034, 0.028] });

  // Leather shoulder guards.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 14, 10), LEATHER, {
      bone: shoulders,
      at: V(0.165 * s, 1.4, 0),
      scale: [0.075, 0.06, 0.078],
    });
  }

  // ---- legs -------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const leg = s > 0 ? legL : legR;
    b.sweep(leg, (t: number) => 0.066 - 0.016 * t, { from: 0, to: 0.6, color: PANTS });
    b.sweep(leg, (t: number) => 0.062 - 0.01 * t, { from: 0.6, to: 1, color: BOOT });
    b.sweep(leg, 0.058, { from: 0.6, to: 0.63, color: GOLD });
    b.capsule(V(0.095 * s, 0.042, -0.04), V(0.095 * s, 0.038, 0.16), [0.04, 0.032], {
      color: BOOT,
      bone: leg.tip!,
    });
  }

  // Cape: one flat dagged slab hanging from the shoulders, just behind the body.
  b.extrude(CAPE_OUTLINE, {
    at: V(0, 1.2, -0.1),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.022,
    bevel: 0.004,
    color: CAPE,
    bone: spine.joints[2],
  });

  // ---- head and face ----------------------------------------------------------------------------

  const headLoft = b.loft(
    [
      { at: V(0, 1.5, 0.01), w: 0.05, h: 0.07 },
      { at: V(0, 1.545, 0), w: 0.12, h: 0.15 },
      { at: V(0, 1.6, 0), w: 0.155, h: 0.19 },
      { at: V(0, 1.655, 0), w: 0.165, h: 0.21 },
      { at: V(0, 1.72, -0.005), w: 0.155, h: 0.2 },
      { at: V(0, 1.77, -0.01), w: 0.09, h: 0.12 },
    ],
    { bone: head, color: SKIN },
  );
  const skull = b.surface(headLoft);
  const face = (x: number, y: number, lift = 0.003) => skull.nearest(V(x, y, 0.3)).moved([0, lift, 0]);

  // Big shiny anime eyes, the right one drawn and mirrored for the left.
  for (const s of [1, -1]) {
    b.decal(headLoft, EYE, {
      at: skull.nearest(V(s * 0.054, 1.64, 0.3)),
      dir: [0, 0, 1],
      size: [0.058, 0.078],
      mirror: s > 0,
    });
    b.decal(headLoft, BLUSH, { at: skull.nearest(V(s * 0.092, 1.6, 0.3)), dir: [0, 0, 1], size: [0.05, 0.03] });
  }

  // Brows, a small mouth, and pointed ears poking out under the hair.
  for (const s of [1, -1]) {
    b.sweep(bezier(face(s * 0.02, 1.71), face(s * 0.05, 1.725), face(s * 0.087, 1.716)), 0.0032, {
      color: INK,
      bone: head,
    });
  }
  b.sweep(bezier(face(-0.02, 1.575), face(0, 1.562), face(0.02, 1.575)), 0.0026, {
    color: "#c9606f",
    bone: head,
  });
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: V(0.09 * s, 1.655, -0.02),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      color: SKIN,
      bone: head,
    });
    b.extrude(DROP, {
      at: V(0.082 * s, 1.63, -0.005),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      color: GOLD,
      bone: head,
    });
  }

  // ---- hair -------------------------------------------------------------------------------------

  // Silver-mint cap over the crown, with a swept fringe.
  const cap = b.part(
    new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
    HAIR,
    { bone: head, at: V(0, 1.76, 0), scale: [0.168, 0.135, 0.155] },
  );
  b.extrude(FRINGE, {
    at: V(0, 1.79, 0.156),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    smoothing: 1,
    color: HAIR,
    bone: head,
  });

  // Loose strands along the lower cap, lying back and down.
  const strands = b.surface(cap).scatter(46, {
    rng: rng(4),
    minDist: 0.018,
    filter: (h) => h.n.y < 0.45,
  });
  b.cards(strands, STRAND, {
    size: [0.024, 0.09],
    lean: 30,
    flow: [0, -1, -0.4],
    bend: 22,
    vary: 0.25,
    rng: rng(9),
    color: "#e9fbf5",
  });

  // Long side locks framing the face.
  for (const s of [1, -1]) {
    b.sweep(
      catmull([V(s * 0.1, 1.78, 0.03), V(s * 0.112, 1.66, 0.05), V(s * 0.124, 1.52, 0.055), V(s * 0.13, 1.36, 0.04)]),
      [0.02, 0.011],
      { color: HAIR, caps: { end: "point" }, bone: [head, neck, spine] },
    );
  }

  // The long tail down the back, with a gold tie.
  const TAIL = catmull([
    V(0.02, 1.78, -0.03),
    V(0.05, 1.66, -0.085),
    V(0.06, 1.46, -0.095),
    V(0.06, 1.2, -0.085),
    V(0.05, 1.06, -0.075),
  ]);
  const tailR = (t: number): [number, number] => [0.072 - 0.034 * t, 0.034 - 0.012 * t];
  b.sweep(TAIL, tailR, { section: "box", color: HAIR, bone: [head, neck, spine], caps: { end: "point" } });
  b.sweep(TAIL, (t: number): [number, number] => [tailR(t)[0] + 0.007, tailR(t)[1] + 0.005], {
    section: "box",
    from: 0.78,
    to: 0.86,
    color: GOLD,
  });

  // ---- quiver and arrows ------------------------------------------------------------------------

  const QT = V(-0.09, 1.5, -0.16);
  const QB = V(-0.14, 1.02, -0.19);
  b.sweep(polyline([QT, QB]), [0.046, 0.04], {
    color: QUIVER,
    caps: { start: "flat", end: "flat" },
    bone: spine.joints[1],
  });
  const qd = QT.clone().sub(QB).normalize();
  const jitter = rng(12);
  const lateral: [number, number][] = [
    [0.02, 0.0],
    [-0.01, 0.02],
    [0.0, -0.018],
    [-0.02, -0.01],
  ];
  for (const [ox, oz] of lateral) {
    const root = QT.clone().add(V(ox, 0, oz));
    const tail = root.clone().addScaledVector(qd, 0.12 + 0.03 * jitter());
    b.rod(root.clone().addScaledVector(qd, -0.3), tail, 0.0042, WOOD, { bone: spine.joints[1] });
    b.cards([frame(tail.clone().addScaledVector(qd, -0.075), qd)], FEATHER, {
      size: [0.03, 0.07],
      cross: true,
    });
  }

  // ---- longbow, string and nocked arrow ---------------------------------------------------------

  const TOP = V(0.1, 1.97, 0.36);
  const BOT = V(0.1, 0.87, 0.36);
  const bowPath = catmull([TOP, V(0.1, 1.74, 0.43), GRIP.clone(), V(0.1, 1.1, 0.43), BOT]);
  b.sweep(bowPath, (t: number) => 0.011 + 0.013 * Math.sin(Math.PI * t), { color: WOOD, bone: handL });
  b.sweep(bowPath, 0.026, { from: 0.44, to: 0.56, color: LEATHER, bone: handL });
  for (const tip of [TOP, BOT]) {
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD, { bone: handL, at: tip });
  }
  glow(b.part(new THREE.SphereGeometry(0.013, 8, 6), "#63ffd0", { bone: handL, at: V(0.1, 1.42, 0.512) }), 1.8);

  b.sweep(polyline([TOP, NOCK, BOT]), 0.0028, { color: "#efe6cf", bone: handR });

  const dirA = GRIP.clone().sub(NOCK).normalize();
  const shaftEnd = NOCK.clone().addScaledVector(dirA, 0.72);
  const arrowTip = NOCK.clone().addScaledVector(dirA, 0.8);
  b.rod(NOCK, shaftEnd, 0.0045, WOOD, { bone: handR });
  b.spike(shaftEnd, arrowTip, null, 0.011, { color: STEEL, bone: handR });
  b.cards([frame(NOCK.clone(), dirA.clone().negate())], FEATHER, { size: [0.03, 0.065], cross: true });

  return b.root;
}
```