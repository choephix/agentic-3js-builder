import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Sweep, SweepPoint } from "../src/sweep";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { limb } from "../src/ik";
import { grain, mix, noise, paint, resolve, smoothstep } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Wild Boar",
  description:
    "A battle-scarred wild boar built in a hand-painted Warcraft style: a hunched, heavy-shouldered body, a huge wedge head with a snapped and a bronze-banded tusk, a ridge of bristling mane spikes, dry-brushed fur and cloven hooves.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (hand-painted: warm lights, cool-purple shadows, saturated mid-tones)
const FUR_DEEP = "#22140f";
const FUR_DARK = "#3a2218";
const FUR_MID = "#5e3a26";
const FUR_LIGHT = "#a06836";
const FUR_TIP = "#d29a4c";
const BELLY = "#a2814f";
const BELLY_D = "#6e5233";
const MUD = "#5a4733";
const MUZZLE = "#93805f";
const SNOUT = "#9c6f68";
const SNOUT_D = "#6d4743";
const NOSTRIL = "#241114";
const HORN = "#2a201c";
const HORN_HI = "#5f4b3c";
const IVORY = "#efe0b4";
const BRONZE = "#b8742f";
const BRONZE_D = "#6e401a";
const EYE = "#f3a51c";
const BLACK = "#0f0807";
const WHITE = "#fff7e6";
const TEETH = "#ece0bf";
const TONGUE = "#c85a6c";
const MOUTH = "#5a1a24";
const EAR_IN = "#a8705a";
const EAR_IN_D = "#7a4a3c";
const SCAR = "#e2c496";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const backFur = grain(FUR_MID, FUR_LIGHT, { size: 0.024, axis: "z", seed: 2 });
const flankFur = grain(FUR_DARK, "#744a2c", { size: 0.022, axis: "z", seed: 5 });
const bellyFur = grain(BELLY_D, BELLY, { size: 0.022, axis: "z", seed: 8 });

const coat = paint((p, n) => {
  const a = resolve(backFur, p, n);
  const f = resolve(flankFur, p, n);
  const bl = resolve(bellyFur, p, n);
  let c = mix(f, a, smoothstep(-0.2, 0.8, n.y));
  c = mix(c, bl, smoothstep(-0.3, -0.85, n.y) * 0.95);
  // dry-brushed highlights on the upward facing fur, dark blotches in the shade
  const dry = smoothstep(0.55, 0.8, noise(p, 0.11, 11)) * smoothstep(0.1, 0.9, n.y);
  c = mix(c, FUR_TIP, dry * 0.4);
  c = mix(c, FUR_DEEP, smoothstep(0.55, 0.8, noise(p, 0.28, 4)) * 0.4);
  c = mix(c, FUR_DEEP, smoothstep(0.12, 0.0, Math.abs(p.x)) * smoothstep(0.4, 0.9, n.y) * 0.55);
  // dark stockings on the lower legs, mud splashed on belly and legs
  c = mix(c, FUR_DEEP, smoothstep(0.3, 0.1, p.y));
  const mud = smoothstep(0.44, 0.12, p.y) * smoothstep(0.4, 0.68, noise(p, 0.07, 21));
  c = mix(c, MUD, mud * 0.75);
  // pale grizzled muzzle, dark palate under the upper jaw
  if (p.z > 1.0) {
    c = mix(c, MUZZLE, smoothstep(1.1, 1.32, p.z) * 0.6);
    if (n.y < -0.5 && p.y > 0.28) c = mix(c, MOUTH, smoothstep(-0.5, -0.8, n.y));
  }
  return c;
});

const tuftTint = paint((p, n) => mix(resolve(coat, p, n), FUR_TIP, 0.5));

const jawPaint = paint((p, n) => {
  if (n.y > 0.55) return MOUTH;
  return mix(resolve(coat, p, n), MUZZLE, 0.55);
});

const spikePaint = paint((_p, _n, s) => {
  const lo = mix(FUR_DEEP, "#7c4a22", smoothstep(0.05, 0.6, s[0]));
  return mix(lo, FUR_TIP, smoothstep(0.65, 1.0, s[0]));
});

const tuskPaint = paint((_p, _n, s) => {
  const t = s[0];
  let c = mix("#6f4f2a", IVORY, smoothstep(0.04, 0.4, t));
  c = mix(c, "#fff8e2", smoothstep(0.55, 1.0, t));
  if (Math.sin(t * 64) > 0.9) c = mix(c, "#9a7a48", 0.5);
  return c;
});

const brokenTuskPaint = paint((_p, _n, s) => {
  const t = s[0];
  let c = mix("#6f4f2a", IVORY, smoothstep(0.04, 0.35, t));
  if (Math.sin(t * 64) > 0.9) c = mix(c, "#9a7a48", 0.5);
  c = mix(c, "#7c5d34", smoothstep(0.85, 1, t));
  return c;
});

const hoofPaint = paint((_p, _n, s) => mix(HORN_HI, HORN, smoothstep(0.0, 0.07, s[1])));

const noseTop = paint((p, n) => mix(mix(SNOUT, SNOUT_D, smoothstep(0.3, -0.7, n.y)), "#c8978a", smoothstep(0.55, 0.9, noise(p, 0.03, 3)) * 0.5));

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#a8a8a8"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <polygon points="3,64 8,64 5,4" fill="url(#g)"/>
  <polygon points="10,64 17,64 16,0" fill="url(#g)"/>
  <polygon points="17,64 24,64 21,8" fill="url(#g)"/>
  <polygon points="24,64 30,64 29,14" fill="url(#g)"/>
</svg>`,
  { size: 128 },
);

const MANE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
  <defs><linearGradient id="m" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#22140f"/><stop offset="0.5" stop-color="#7c4a22"/><stop offset="1" stop-color="#e2b872"/></linearGradient></defs>
  <polygon points="2,80 14,80 6,12" fill="url(#m)"/>
  <polygon points="10,80 28,80 20,0" fill="url(#m)"/>
  <polygon points="24,80 38,80 35,16" fill="url(#m)"/>
</svg>`,
  { size: 192 },
);

const SCARS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <g stroke-linecap="round" fill="none">
    <path d="M8,10 L40,50" stroke="${SCAR}" stroke-width="4.5"/><path d="M8,10 L40,50" stroke="#a8745a" stroke-width="1.4"/>
    <path d="M20,6 L50,42" stroke="${SCAR}" stroke-width="4"/><path d="M20,6 L50,42" stroke="#a8745a" stroke-width="1.3"/>
    <path d="M32,4 L56,32" stroke="${SCAR}" stroke-width="3.4"/><path d="M32,4 L56,32" stroke="#a8745a" stroke-width="1.2"/>
  </g>
</svg>`,
  { size: 256 },
);

const SCARS_R = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
  <g stroke-linecap="round" fill="none">
    <path d="M6,34 L50,6" stroke="${SCAR}" stroke-width="4.5"/><path d="M6,34 L50,6" stroke="#a8745a" stroke-width="1.4"/>
    <path d="M14,38 L56,18" stroke="${SCAR}" stroke-width="3.6"/><path d="M14,38 L56,18" stroke="#a8745a" stroke-width="1.2"/>
  </g>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "wildBoar", paintSize: 1024 });
  const r = rng(7);

  // --- skeleton ------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.58, -0.35], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.63, 0.0],
      [0, 0.74, 0.32],
      [0, 0.66, 0.58],
    ]),
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.66, 0.58],
      [0, 0.59, 0.77],
      [0, 0.53, 0.92],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.53, 0.92], dir: [0, -0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.42, 0.97], aim: [0, 0.32, 1.3], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.59, -0.66],
      [0, 0.61, -0.8],
      [0, 0.71, -0.88],
      [0, 0.84, -0.86],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // --- body ----------------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.56, -0.72], w: 0.36, h: 0.36 },
      { at: [0, 0.58, -0.35], w: 0.56, h: 0.46 },
      { at: [0, 0.63, 0.0], w: 0.56, h: 0.46 },
      { at: [0, 0.74, 0.32], w: 0.74, h: 0.6 },
      { at: [0, 0.66, 0.58], w: 0.6, h: 0.5 },
      { at: [0, 0.59, 0.77], w: 0.5, h: 0.44 },
      { at: [0, 0.53, 0.92], w: 0.42, h: 0.4 },
    ],
    { bone: [hips, spine, neck], color: coat, sides: 10, name: "body" },
  );

  b.sweep(tail, [0.045, 0.012], { color: coat, sides: 6, name: "tailTube" });
  b.cards([frame(tail.at(1), [0, 1, 0.15])], TUFT, {
    size: [0.07, 0.18],
    lean: 30,
    flow: [0, 0, -1],
    cross: true,
    vary: 0.2,
    color: FUR_TIP,
  });
  b.cards(
    [frame(tail.at(1), [0, 0.8, 0.5]), frame(tail.at(1), [0, 0.8, -0.4])],
    TUFT,
    { size: [0.06, 0.14], lean: 40, flow: [0, -0.5, -1], cross: true, color: "#e0b070" },
  );

  // --- head ----------------------------------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: [0, 0.56, 0.86], w: 0.5, h: 0.5 },
      { at: [0, 0.55, 0.98], w: 0.46, h: 0.47 },
      { at: [0, 0.5, 1.1], w: 0.36, h: 0.36 },
      { at: [0, 0.445, 1.25], w: 0.25, h: 0.25 },
      { at: [0, 0.4, 1.37], w: 0.21, h: 0.21 },
    ],
    { bone: head, color: coat, sides: 10, caps: { start: "round", end: "flat" }, name: "skull" },
  );
  const jawBody = b.loft(
    [
      { at: [0, 0.315, 1.0], w: 0.26, h: 0.12 },
      { at: [0, 0.29, 1.15], w: 0.2, h: 0.11 },
      { at: [0, 0.3, 1.32], w: 0.14, h: 0.09 },
    ],
    { bone: jaw, color: jawPaint, sides: 8, name: "jawBody" },
  );

  // snout disc and nostrils
  b.part(new THREE.CylinderGeometry(0.1, 0.106, 0.075, 8), noseTop, {
    bone: head,
    at: [0, 0.395, 1.405],
    dir: [0, -0.28, 1],
    scale: [1.05, 1, 0.92],
    name: "snoutDisc",
  });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 6, 4), NOSTRIL, {
      bone: head,
      at: [sx * 0.045, 0.393, 1.444],
      scale: [1.05, 0.75, 0.5],
    });
    b.part(new THREE.SphereGeometry(0.007, 4, 3), WHITE, { bone: head, at: [sx * 0.05, 0.42, 1.448] });
  }
  // upper lip wrinkle ridge
  b.capsule([-0.085, 0.445, 1.37], [0.085, 0.445, 1.37], 0.015, { bone: head, color: SNOUT_D, name: "noseBridge" });

  // teeth
  for (const sx of [-1, 1])
    for (const k of [0.5, 1.5]) {
      b.part(new THREE.ConeGeometry(0.0125, 0.04, 5), TEETH, { bone: head, at: [sx * k * 0.03, 0.32, 1.395], dir: [0, -1, 0] });
      b.part(new THREE.ConeGeometry(0.011, 0.036, 5), TEETH, { bone: jaw, at: [sx * k * 0.027, 0.36, 1.372] });
    }
  b.part(new THREE.BoxGeometry(0.1, 0.022, 0.2), TONGUE, { bone: jaw, at: [0, 0.344, 1.14] });

  // eyes and brows
  const eyeSkin = b.surface(skull);
  for (const sx of [1, -1]) {
    const hit = eyeSkin.nearest([sx * 0.2, 0.6, 1.1]);
    const E = hit.at.clone();
    b.stick(new THREE.SphereGeometry(0.036, 8, 6), "#2a1410", hit, { embed: 0.55, bone: head });
    b.part(new THREE.SphereGeometry(0.031, 7, 5), EYE, { bone: head, at: E.clone().addScaledVector(hit.n, 0.026) });
    b.part(new THREE.SphereGeometry(0.0155, 6, 4), BLACK, { bone: head, at: E.clone().addScaledVector(hit.n, 0.05) });
    const glint = E.clone().addScaledVector(hit.n, 0.062).add(new THREE.Vector3(0, 0.01, 0.008));
    b.part(new THREE.SphereGeometry(0.0065, 4, 3), WHITE, { bone: head, at: glint });
    // heavy angry brow, inner end lower than the outer
    const brA = E.clone().add(new THREE.Vector3(0, 0.046, -0.055)).addScaledVector(hit.n, 0.012);
    const brB = E.clone().add(new THREE.Vector3(0, 0.03, 0.06)).addScaledVector(hit.n, 0.012);
    b.capsule(brA, brB, [0.027, 0.019], { bone: head, color: FUR_DEEP, sides: 6, name: "brow" });
  }

  // ears
  for (const sx of [1, -1]) {
    const inner = new THREE.Vector3(sx * 0.4, 0, 0.9).normalize();
    const earJoint = b.joint(sx > 0 ? "earL" : "earR", {
      parent: head,
      at: [sx * 0.15, 0.75, 0.9],
      dir: [sx * 0.4, 1, -0.28],
      role: "hinge",
    });
    const outline: OutlinePoint[] =
      sx > 0
        ? [
            [-0.075, 0],
            [0.075, 0],
            [0.08, 0.07],
            [0.06, 0.15],
            [0.032, 0.14, "sharp"],
            [0.03, 0.2],
            [0.0, 0.27, "sharp"],
            [-0.04, 0.18],
            [-0.08, 0.07],
          ]
        : [
            [-0.075, 0],
            [0.075, 0],
            [0.08, 0.07],
            [0.045, 0.17],
            [0.0, 0.27, "sharp"],
            [-0.04, 0.18],
            [-0.08, 0.07],
          ];
    const earPaint = paint((p, n, s) => {
      if (n.dot(inner) > 0.4) return mix(EAR_IN, EAR_IN_D, smoothstep(0.03, 0.26, s[1]) * 0.7 + smoothstep(0.04, 0.075, Math.abs(s[0])) * 0.3);
      return mix(resolve(coat, p, n), FUR_DEEP, smoothstep(0.1, 0.27, s[1]) * 0.6);
    });
    const ear = b.extrude(outline, {
      at: [sx * 0.15, 0.75, 0.9],
      x: [sx * 0.9, 0, -0.4],
      y: [sx * 0.4, 1, -0.28],
      thickness: [0.03, 0.01],
      bevel: 0.008,
      smoothing: 1,
      color: earPaint,
      bone: earJoint,
      name: sx > 0 ? "earL" : "earR",
    });
    // bristle fringe on the ear's rim
    b.cards(
      [ear.moved([0.0, 0.26, 0]), ear.moved([0.04, 0.2, 0]), ear.moved([-0.04, 0.2, 0])],
      TUFT,
      { size: [0.03, 0.07], lean: 0, flow: [0, 0, -1], color: FUR_TIP },
    );
  }

  // tusks (lower canines, ride the jaw): one snapped, one banded in bronze
  const tuskLeftPath = bezier([0.08, 0.33, 1.22], [0.21, 0.35, 1.34], [0.29, 0.52, 1.42], [0.21, 0.78, 1.33]);
  const tuskRightFull = bezier([-0.08, 0.33, 1.22], [-0.21, 0.35, 1.34], [-0.29, 0.52, 1.42], [-0.21, 0.78, 1.33]);
  const tuskRightPath = tuskRightFull.slice(0, 0.76);
  b.sweep(tuskLeftPath, [0.056, 0.0], { bone: jaw, color: tuskPaint, sides: 8, caps: { start: "flat", end: "point" }, name: "tuskL" });
  b.sweep(tuskRightPath, [0.056, 0.026], { bone: jaw, color: brokenTuskPaint, sides: 8, caps: { start: "flat", end: "flat" }, name: "tuskR" });
  // jagged break on the snapped tusk
  const brk = tuskRightPath.at(1);
  b.part(new THREE.ConeGeometry(0.012, 0.03, 5), "#cdb98a", { bone: jaw, at: brk, dir: tuskRightPath.tangentAt(1), name: "tuskChip" });

  // bronze band on the left tusk with rivets, and a worn cuff on the right
  for (const [path, t, rad, key] of [
    [tuskLeftPath, 0.3, 0.047, "L"],
    [tuskRightPath, 0.24, 0.055, "R"],
  ] as const) {
    const c = path.at(t);
    const d = path.tangentAt(t);
    b.part(new THREE.CylinderGeometry(rad, rad + 0.004, 0.05, 10), BRONZE, { bone: jaw, at: c, dir: d, name: `band${key}` });
    for (const edge of [-0.027, 0.027])
      b.part(new THREE.CylinderGeometry(rad + 0.005, rad + 0.005, 0.008, 10), BRONZE_D, {
        bone: jaw,
        at: c.clone().addScaledVector(d, edge),
        dir: d,
      });
    b.ring(frame(c, d), { count: 5, radius: rad + 0.004 }, (item) => {
      b.part(new THREE.SphereGeometry(0.007, 4, 3), "#e7b25b", { bone: jaw, at: item.at });
    });
  }

  // small upper tusks
  for (const sx of [1, -1]) {
    b.sweep(
      bezier([sx * 0.09, 0.36, 1.31], [sx * 0.125, 0.37, 1.37], [sx * 0.15, 0.41, 1.4], [sx * 0.155, 0.49, 1.37]),
      [0.024, 0.0],
      { bone: head, color: tuskPaint, sides: 6, caps: { start: "flat", end: "point" }, name: "upperTusk" },
    );
    // fleshy lip pad where the lower tusk leaves the mouth, and two warty cheek knobs
    b.part(new THREE.SphereGeometry(0.04, 6, 4), SNOUT_D, { bone: jaw, at: [sx * 0.1, 0.345, 1.25], scale: [1, 0.7, 1.2], name: "lipPad" });
    for (const [x, y, z, rr] of [
      [0.2, 0.5, 1.03, 0.022],
      [0.17, 0.44, 1.15, 0.017],
    ] as const) {
      const wart = eyeSkin.nearest([sx * x, y, z]);
      b.stick(new THREE.SphereGeometry(rr, 5, 4), "#7a5646", wart, { embed: 0.3, bone: head, name: "wart" });
    }
  }

  // --- legs ----------------------------------------------------------------------------------------------------
  const legRadii = [0.135, 0.11, 0.082, 0.066, 0.056, 0.053];
  const legSweeps: Sweep[] = [];
  const addLeg = (
    sx: number,
    root: [number, number, number],
    foot: [number, number, number],
    lengths: number[],
    bends: [number, number, number][],
    names: string[],
    parent: typeof hips,
  ) => {
    const pts = limb(root, foot, lengths, bends);
    const leg = b.chain(`${names[0]}Leg${sx > 0 ? "L" : "R"}`, pts, {
      parent,
      names: names.map((n) => n + (sx > 0 ? "L" : "R")),
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    legSweeps.push(b.sweep(leg, legRadii, { color: coat, sides: 8, name: `leg${sx > 0 ? "L" : "R"}${names[0]}` }));
    const hoof = leg.tip!;
    for (const k of [-1, 1]) {
      b.extrude(
        [
          [0, 0],
          [0.108, 0],
          [0.115, 0.02],
          [0.085, 0.06],
          [0.04, 0.086],
          [-0.012, 0.082],
          [-0.024, 0.04],
        ],
        {
          x: [0, 0, 1],
          at: [foot[0] + k * 0.03, 0, foot[2] - 0.055],
          thickness: 0.056,
          bevel: 0.005,
          color: hoofPaint,
          bone: hoof,
          name: "hoof",
        },
      );
      b.spike([foot[0] + k * 0.04, 0.115, foot[2] - 0.045], [0, -0.5, -1], 0.045, 0.014, { bone: hoof, color: HORN });
    }
    return leg;
  };

  for (const sx of [1, -1]) {
    const front = addLeg(
      sx,
      [sx * 0.27, 0.54, 0.38],
      [sx * 0.24, 0.075, 0.43],
      [0.23, 0.21, 0.06],
      [[0, 0, -1], [0, 0, 1], [0, 0, -1]],
      ["shoulder", "elbow", "carpus", "hoofF"],
      chest,
    );
    // shoulder muscle
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: front.joints[0],
      at: [sx * 0.27, 0.54, 0.37],
      scale: [0.125, 0.23, 0.21],
      name: "shoulderMuscle",
    });
    const hind = addLeg(
      sx,
      [sx * 0.26, 0.5, -0.42],
      [sx * 0.23, 0.075, -0.5],
      [0.24, 0.21, 0.06],
      [[0, 0, 1], [0, 0, -1], [0, 0, 1]],
      ["hip", "knee", "hock", "hoofH"],
      hips,
    );
    // ham
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: hind.joints[0],
      at: [sx * 0.25, 0.5, -0.42],
      scale: [0.14, 0.24, 0.22],
      name: "ham",
    });
  }

  // --- mane: ridge of bristle spikes from the crown down the spine --------------------------------------------
  const maneHeight = (t: number) => 0.12 + 0.26 * Math.exp(-(((t - 0.6) / 0.2) ** 2));
  for (const [deg, scale, count] of [
    [0, 1, 16],
    [40, 0.55, 14],
    [-40, 0.55, 14],
  ] as const) {
    for (let i = 0; i < count; i++) {
      const t = 0.1 + (0.86 * (i + 0.5)) / count;
      const pt = body.at(t, deg);
      const h = maneHeight(t) * scale * (0.9 + 0.2 * r());
      const base = pt.at.clone().addScaledVector(pt.n, -0.02);
      const back = pt.tangent.clone().multiplyScalar(-1);
      const p1 = pt.at.clone().addScaledVector(pt.n, h * 0.5);
      const p2 = pt.at.clone().addScaledVector(pt.n, h * 0.82).addScaledVector(back, h * 0.14);
      const tip = pt.at.clone().addScaledVector(pt.n, h * 0.96).addScaledVector(back, h * 0.38);
      b.sweep(bezier(base, p1, p2, tip), [0.014 + 0.03 * scale, 0.0], {
        bone: pt.bone ?? hips,
        color: spikePaint,
        sides: 5,
        name: "maneSpike",
      });
    }
  }
  // crown spikes between the ears and brow
  for (const [deg, t, h] of [
    [0, 0.0, 0.1],
    [0, 0.2, 0.12],
    [0, 0.4, 0.1],
    [28, 0.1, 0.08],
    [-28, 0.1, 0.08],
    [28, 0.3, 0.07],
    [-28, 0.3, 0.07],
  ] as const) {
    const pt = skull.at(0.08 + t * 0.8, deg);
    const back = pt.tangent.clone().multiplyScalar(-1);
    const base = pt.at.clone().addScaledVector(pt.n, -0.015);
    const tip = pt.at.clone().addScaledVector(pt.n, h).addScaledVector(back, h * 0.5);
    b.sweep(bezier(base, pt.at.clone().addScaledVector(pt.n, h * 0.5), tip), [0.02, 0.0], {
      bone: head,
      color: spikePaint,
      sides: 5,
      name: "crownSpike",
    });
  }

  // --- fur cards -----------------------------------------------------------------------------------------------
  const bodySkin = b.surface([body, ...legSweeps]);
  const tufts = bodySkin.scatter(360, { rng: rng(3), minDist: 0.07, filter: (h) => h.n.y > -0.55 && h.at.y > 0.2 });
  b.cards(tufts, TUFT, { size: [0.045, 0.1], lean: 68, bend: 22, vary: 0.3, rng: rng(4), color: tuftTint, flow: [0, -0.3, -1] });

  // mane fuzz between the spikes: bold painted bristle cards
  const fuzz: SweepPoint[] = [];
  for (let i = 0; i < 30; i++) fuzz.push(body.at(0.08 + (0.88 * i) / 29, i % 2 ? 14 : -14));
  b.cards(fuzz, MANE, {
    size: [0.07, 0.16],
    lean: 28,
    bend: 12,
    flow: [0, -0.2, -1],
    vary: 0.3,
    rng: rng(5),
    cross: true,
  });

  // shaggy beard, cheek tufts and jowls
  const headSkin = b.surface([skull, jawBody]);
  const beard = headSkin.scatter(70, {
    rng: rng(6),
    minDist: 0.04,
    filter: (h) => h.at.z > 0.9 && h.at.z < 1.3 && (h.n.y < -0.1 || Math.abs(h.n.x) > 0.7) && h.at.y > 0.24,
  });
  b.cards(beard, TUFT, { size: [0.04, 0.09], lean: 70, bend: 16, vary: 0.3, rng: rng(8), color: "#c8a878", flow: [0, -0.5, -1] });
  // chest bib and neck ruff
  const ruff = b.surface(body).scatter(90, {
    rng: rng(9),
    minDist: 0.05,
    filter: (h) => h.at.z > 0.5 && h.at.z < 0.92 && h.n.y < 0.2,
  });
  b.cards(ruff, MANE, { size: [0.07, 0.15], lean: 70, bend: 16, vary: 0.25, rng: rng(10), flow: [0, -0.6, -1] });

  // --- scars (decals on the flanks) ----------------------------------------------------------------------------
  const flank = b.surface(body);
  const scarHit = flank.around([0, 0.64, 0.05]).at(90, 5);
  if (scarHit) b.decal(flank, SCARS, { at: scarHit, dir: [1, 0, 0], size: [0.24, 0.24], roll: 6, segments: 12 });
  const scarHitR = flank.around([0, 0.64, -0.2]).at(-90, 10);
  if (scarHitR) b.decal(flank, SCARS_R, { at: scarHitR, dir: [-1, 0, 0], size: [0.26, 0.17], mirror: true, segments: 12 });

  // --- open the jaw a little, last --------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 13 });

  return b.root;
}
