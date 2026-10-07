import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { grain, noise, paint, spots, stripes } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel } from "../kits/toon";

export const meta = {
  name: "Snowy Owl on a Frost Stump",
  description:
    "A snowy owl perched on a frost-dusted stump with its wings spread: gold talons and jesses, a filigree collar, a sapphire circlet and feather cards, in cel-shaded high-fantasy anime style. About 1.2 m tall, 1.7 m across the wings.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

// ---- palette -------------------------------------------------------------

const SNOW_LIT = "#fbf7ee";
const SNOW_SHADE = "#c3c9e4";
const SNOW = cel(SNOW_LIT, SNOW_SHADE);
const BARRED = cel(stripes(SNOW_LIT, "#7b7592", { size: 0.045, axis: "y", width: 0.2, seed: 4 }), SNOW_SHADE);
const HEAD = cel(spots(SNOW_LIT, "#8d88a3", { size: 0.04, amount: 0.12, seed: 6 }), SNOW_SHADE);
const SNOW_TOP = cel("#ffffff", "#a9bde8");
const GOLD = cel("#ffd45c", "#c4812c");
const GOLD_DEEP = cel("#e7a53c", "#94521f");
const BEAK = cel("#3a2f52", "#1a1230");
const GEM = cel("#5fe0ff", "#1f5fc4");
const MUSH = spots(cel("#ff6b5a", "#b02f4a"), cel("#fff3d8", "#d9b38a"), { size: 0.03, amount: 0.3, seed: 3 });
const MUSH_STEM = cel("#f4e7cf", "#c9b08f");
const BARK = cel(grain("#8f6444", "#6a4632", { size: 0.03, axis: "y", seed: 2 }), "#6b3f3a");
const RING_A = cel("#d9a46a", "#9a6a58");
const RING_B = cel("#b27a4d", "#7a4f4a");

// Stump: bark on the sides, growth rings on the cut top.
const STUMP = paint((p, n) => {
  if (n.y < 0.6) return BARK;
  const ring = Math.floor(Math.hypot(p.x, p.z) / 0.03 + 0.8 * noise(p, 0.25, 9)) % 2;
  return ring ? RING_A : RING_B;
});

// ---- textures --------------------------------------------------------------

function featherTex(fill: string, bar: string, edge: string) {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">
<path d="M20 2C36 18 38 66 20 98C2 66 4 18 20 2Z" fill="${fill}" stroke="${edge}" stroke-width="3"/>
<g stroke="${bar}" stroke-width="4" fill="none" stroke-linecap="round">
<path d="M10 34Q20 40 30 34"/><path d="M8 52Q20 58 32 52"/><path d="M9 70Q20 76 31 70"/>
</g></svg>`,
    { size: 256 },
  );
}

const FEATHER_A = featherTex("#fffdf6", "#b2adc4", "#c2bdd2");
const FEATHER_B = featherTex("#fbf9f2", "#bdb8cc", "#c9c4d8");
const PRIMARY = featherTex("#e9e6f0", "#3d3756", "#2e2a40");

const MOSS_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
<g fill="none" stroke-linecap="round" stroke-width="4">
<path d="M20 40Q17 22 6 10" stroke="#7bc65a"/>
<path d="M20 40Q22 18 34 8" stroke="#94d86a"/>
<path d="M20 40Q20 24 20 4" stroke="#6ab04e"/>
<path d="M20 40Q14 28 10 22" stroke="#a6e27a"/>
<path d="M20 40Q27 30 30 24" stroke="#5aa54a"/>
</g></svg>`,
  { size: 128 },
);

const EYE = animeEye({ iris: "#ffb42e", irisLight: "#ffe27a", irisDark: "#a95d12", blush: false, brow: false, size: 512 });

// A closed ring of points in the plane y = cy.
function ring(cx: number, cy: number, cz: number, rx: number, rz: number, n: number): number[][] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + rx * Math.sin(a), cy, cz + rz * Math.cos(a)];
  });
}

export default function build() {
  const b = createBuilder({ name: "snowyOwl" });

  // ---- skeleton: spine, neck, head, jaw -------------------------------------

  const hips = b.joint("hips", { at: [0, 0.66, -0.02], aim: [0, 0.8, 0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.02],
      [0, 0.8, 0.02],
      [0, 0.92, 0.05],
      [0, 0.98, 0.07],
    ]),
    { parent: hips, names: ["waist", "chest", "neck"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = spine.joints[2];
  const head = b.joint("head", { parent: neck, at: [0, 0.98, 0.07], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.0, 0.18], aim: [0, 0.99, 0.27], role: "jaw" });

  // ---- body -------------------------------------------------------------------

  const body = b.loft(
    [
      { at: [0, 0.6, -0.04], w: 0.2, h: 0.2 },
      { at: [0, 0.7, 0.0], w: 0.3, h: 0.3 },
      { at: [0, 0.8, 0.03], w: 0.33, h: 0.33 },
      { at: [0, 0.91, 0.05], w: 0.26, h: 0.26 },
    ],
    { bone: spine, color: BARRED },
  );

  // Head: a round skull with a pale face, big gold anime eyes and a hooked beak.
  const headMesh = b.part(new THREE.SphereGeometry(1, 20, 14), HEAD, {
    bone: head,
    at: [0, 1.035, 0.085],
    scale: [0.135, 0.13, 0.125],
    name: "head",
  });
  const skull = b.surface(headMesh);
  // Facial ruff: small feathers round the cheeks and chin.
  b.cards(
    skull.scatter(70, { rng: rng(51), minDist: 0.025, filter: (h) => (Math.abs(h.n.x) > 0.6 && h.n.z < 0.5) || h.n.y < -0.5 }),
    [FEATHER_B, FEATHER_A],
    { size: [0.035, 0.06], lean: 60, flow: [0, -0.6, 0.6], rng: rng(52), sink: 0.2 },
  );
  for (const s of [1, -1]) {
    const hit = skull.nearest([s * 0.058, 1.04, 0.2]);
    b.decal(skull, EYE, { at: hit, size: [0.07, 0.095], mirror: s > 0 });
  }

  // Upper mandible rides the head, lower mandible rides the jaw.
  const beakBase = skull.nearest([0, 1.0, 0.215]);
  b.sweep(
    bezier(beakBase, [0, 0.995, 0.245], [0, 0.97, 0.235]),
    (t) => [0.03 * (1 - t) + 0.006 * t, 0.03 * (1 - t) + 0.004 * t],
    { bone: head, color: BEAK, caps: { end: "point" } },
  );
  b.sweep(bezier(jaw.at, [0, 0.994, 0.215], [0, 0.972, 0.238]), [0.022, 0.011], {
    bone: jaw,
    color: BEAK,
    caps: { end: "point" },
  });

  // Gold circlet across the brow, with a sapphire and a leaf-shaped crest.
  b.sweep(polyline(ring(0, 1.11, 0.085, 0.115, 0.115, 40), { closed: true }), 0.0075, { bone: head, color: GOLD });
  b.part(new THREE.OctahedronGeometry(0.018), GEM, { bone: head, at: [0, 1.11, 0.205] });
  b.extrude(
    [
      [-0.03, 0],
      [0.03, 0],
      [0.022, 0.05],
      [0, 0.09, "sharp"],
      [-0.022, 0.05],
    ],
    { at: [0, 1.115, 0.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, bevel: 0.003, smoothing: 1, color: GOLD, bone: head },
  );

  // ---- gold filigree collar round the neck -------------------------------------

  const collar = b.surface(body).loop(neck, { lift: 0.012 });
  b.sweep(collar, 0.0105, { bone: neck, color: GOLD });
  b.along(collar, 16, (at) => {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_DEEP, { bone: neck, at });
  });
  const collarHit = b.surface(body).nearest([0, 0.91, 0.19]);
  b.stick(new THREE.OctahedronGeometry(0.022), GEM, collarHit, { embed: 0.25 });

  // Soft fluff cards on the breast and flanks, hanging downward.
  b.cards(
    b.surface(body).scatter(220, { rng: rng(21), minDist: 0.03, filter: (h) => h.n.y < 0.7 }),
    [FEATHER_A, FEATHER_B],
    { size: [0.045, 0.085], lean: 55, flow: [0, -1, 0.25], rng: rng(22), sink: 0.2, vary: 0.2 },
  );

  // ---- wings, spread --------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.1, 0.87, 0.0],
        [s * 0.27, 0.93, -0.02],
        [s * 0.45, 0.955, -0.07],
        [s * 0.66, 0.95, -0.12],
      ]),
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "wing" },
    );
    const wingTube = b.sweep(wing, (t) => [0.085 - 0.06 * t, 0.024 - 0.012 * t], { color: BARRED });

    // Covert feathers shingled over the upper wing, sweeping outward.
    b.cards(
      b.surface(wingTube).scatter(90, { rng: rng(s > 0 ? 11 : 12), minDist: 0.035, filter: (h) => h.n.y > 0.2 }),
      [FEATHER_A, FEATHER_B],
      { size: [0.06, 0.12], lean: 80, flow: [s, 0, -0.35], rng: rng(s > 0 ? 41 : 42), sink: 0.15, vary: 0.2 },
    );

    // Secondaries along the trailing edge.
    const secondaries = Array.from({ length: 6 }, (_, i) =>
      frame([s * (0.3 + 0.03 * i), 0.963 + 0.0015 * i, -0.035 - 0.009 * i], [0, 1, 0]),
    );
    b.cards(secondaries, FEATHER_B, { size: [0.07, 0.15], lean: 90, flow: [s * 0.25, 0, -1], sink: 0.08 });

    // Dark flight feathers fanning off the hand.
    const primaries = Array.from({ length: 9 }, (_, i) => {
      const u = i / 8;
      return frame([s * (0.45 + 0.21 * u), 0.972 + 0.0025 * i, -0.085 - 0.04 * u - 0.004 * i], [0, 1, 0]);
    });
    b.cards(primaries, PRIMARY, { size: [0.075, 0.2], lean: 90, flow: [s, 0, -0.45], sink: 0.08 });
  }

  // ---- legs, toes and jesses ---------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.08, 0.66, -0.01],
        [s * 0.09, 0.57, 0.04],
        [s * 0.075, 0.5, -0.02],
        [s * 0.07, 0.455, 0.05],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    const legTube = b.sweep(leg, (t) => 0.034 - 0.014 * t, { color: SNOW });
    b.cards(
      b.surface(legTube).scatter(40, { rng: rng(s > 0 ? 61 : 62), minDist: 0.03, filter: (h) => h.n.y > -0.3 && h.at.y > 0.5 }),
      FEATHER_B,
      { size: [0.04, 0.07], lean: 70, flow: [0, -1, 0], sink: 0.2 },
    );

    const foot = leg.tip!;
    const ankle = leg.joints[2];
    const F = [s * 0.07, 0.455, 0.05];

    // Three forward talons and a hind one, all gold.
    const forward = [
      { dx: -0.026, dz: 0.075 },
      { dx: 0, dz: 0.085 },
      { dx: 0.026, dz: 0.075 },
    ];
    forward.forEach((t, k) => {
      const base = [F[0] + t.dx * 0.25, 0.457, F[2] + 0.005];
      const mid = [F[0] + t.dx * 0.8, 0.453, F[2] + t.dz * 0.5];
      const tip = [F[0] + t.dx, 0.45, F[2] + t.dz];
      const toe = b.chain(`toe${k + 1}${side}`, catmull([base, mid, tip]), {
        parent: foot,
        names: [`t${k + 1}${side}a`, `t${k + 1}${side}b`, `t${k + 1}${side}c`],
        role: "digit",
      });
      b.sweep(toe, [0.011, 0.004], { color: GOLD, caps: { start: "round", end: "point" } });
    });
    const hallux = b.chain(
      `toe4${side}`,
      catmull([
        [F[0], 0.457, F[2]],
        [F[0], 0.453, F[2] - 0.03],
        [F[0], 0.45, F[2] - 0.06],
      ]),
      { parent: foot, names: [`t4${side}a`, `t4${side}b`, `t4${side}c`], role: "digit" },
    );
    b.sweep(hallux, [0.011, 0.004], { color: GOLD, caps: { start: "round", end: "point" } });

    // Falconer's jess: a thin gold chain from the ankle to the stump, ending in a bell.
    b.sweep(catmull([ankle.at, [s * 0.11, 0.47, -0.03], [s * 0.15, 0.452, -0.1]]), 0.0045, {
      bone: ankle,
      color: GOLD,
    });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD_DEEP, { bone: ankle, at: [s * 0.15, 0.462, -0.1] });
  }

  // ---- tail and tail fan ----------------------------------------------------------------

  const tail = b.chain("tail", catmull([[0, 0.62, -0.03], [0, 0.56, -0.16], [0, 0.5, -0.28]]), {
    parent: hips,
    names: ["tailA", "tailB", "tailC"],
    role: "tail",
  });
  b.sweep(tail, (t) => [0.075 - 0.02 * t, 0.014], { color: BARRED, caps: { start: "round", end: "round" } });
  b.extrude(
    [
      [-0.07, 0],
      [0.07, 0],
      [0.09, 0.1],
      [0.065, 0.18],
      [0, 0.2],
      [-0.065, 0.18],
      [-0.09, 0.1],
    ],
    {
      at: [0, 0.5, -0.28],
      x: [1, 0, 0],
      y: [0, -0.12, -1],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: BARRED,
      bone: tail.tip!,
    },
  );

  // ---- stump, roots, mushrooms and snow ---------------------------------------------

  const stump = b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.39, 0.12],
      [0.36, 0.28],
      [0.34, 0.43],
      [0.31, 0.45],
      [0, 0.45],
    ],
    { at: [0, 0, 0], bone: hips, color: STUMP, smoothing: 1, segments: 16 },
  );

  // Gold band round the stump with studs.
  const band = polyline(ring(0, 0.2, 0, 0.373, 0.373, 48), { closed: true });
  b.sweep(band, 0.012, { bone: hips, color: GOLD });
  b.along(band, 18, (at) => {
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD_DEEP, { bone: hips, at });
  });

  // Roots spilling off the stump into the snow.
  for (const [x, z, ex, ez] of [
    [0.3, 0.2, 0.52, 0.3],
    [-0.3, -0.05, -0.55, -0.1],
    [0.1, -0.3, 0.2, -0.52],
  ]) {
    b.sweep(
      catmull([
        [x, 0.12, z],
        [x + (ex - x) * 0.5, 0.05, z + (ez - z) * 0.5],
        [ex, 0.02, ez],
      ]),
      (t) => 0.052 - 0.03 * t,
      { bone: hips, color: BARK },
    );
  }

  // Mushrooms on the cut top.
  b.lathe(
    [
      [0, 0],
      [0.024, 0],
      [0.016, 0.05],
      [0, 0.05],
    ],
    { at: [-0.2, 0.45, 0.12], bone: hips, color: MUSH_STEM },
  );
  b.lathe(
    [
      [0, 0.04],
      [0.06, 0.045],
      [0.085, 0.07],
      [0.072, 0.095],
      [0.04, 0.105],
      [0, 0.1],
    ],
    { at: [-0.2, 0.45, 0.12], bone: hips, color: MUSH, smoothing: 1 },
  );

  // Moss tufts on the stump.
  b.cards(
    b.surface(stump).scatter(60, { rng: rng(31), minDist: 0.05, filter: (h) => h.n.y > -0.2 && h.at.y > 0.2 }),
    MOSS_TEX,
    { size: [0.05, 0.06], lean: 10, rng: rng(32), vary: 0.3 },
  );

  // Snow: a ground drift around the base, and lumps on the cut top.
  b.lathe(
    [
      [0, 0],
      [0.52, 0],
      [0.5, 0.018],
      [0.4, 0.034],
      [0.22, 0.04],
      [0, 0.04],
    ],
    { at: [0, 0, 0], bone: hips, color: SNOW_TOP, segments: 16 },
  );
  const lump = (x: number, y: number, z: number, sx: number, sy: number, sz: number) =>
    b.part(new THREE.SphereGeometry(1, 12, 8), SNOW_TOP, { bone: hips, at: [x, y, z], scale: [sx, sy, sz] });
  lump(0.2, 0.45, -0.2, 0.12, 0.022, 0.1);
  lump(-0.19, 0.45, -0.22, 0.09, 0.02, 0.08);
  lump(0.25, 0.45, 0.08, 0.06, 0.018, 0.05);
  lump(0.44, 0.025, 0.22, 0.12, 0.03, 0.09);
  lump(-0.42, 0.025, -0.3, 0.11, 0.03, 0.08);

  return b.root;
}
