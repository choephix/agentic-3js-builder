```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  grain,
  mix,
  mottle,
  noise,
  paint,
  rng,
  scales,
  smoothstep,
  stripes,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse island",
  description:
    "A red-and-white lighthouse with a glowing lantern on a tiny rocky island, with a keeper's cottage, a wooden jetty, a rowboat, two seagulls and wildflowers, on a round plinth.",
};

type Builder = ReturnType<typeof createBuilder>;
type Vec3 = [number, number, number];

// Layout in metres. The island is centred on the origin; the model faces +Z and its left is +X.
const WATER_Y = 0.085;
const ISLAND_RIM = 0.52;
const TOWER = { x: 0.12, z: -0.12 };
const COTTAGE = { x: -0.11, z: 0.06 };
const BOAT = { x: 0.67, z: 0.2 };
const SKERRIES: Array<[number, number, number]> = [
  [-0.66, -0.42, 0.1],
  [0.34, -0.76, 0.075],
];

const IRON = "#25282d";
const RED = "#b3262d";
const BRASS = "#d6a53a";
const GLASS = "#ffe27a";
const SLATE = "#4a5a6c";
const WALL = "#f3e9d2";
const BLUE = "#2f6fb3";
const STEP = "#9ca2a9";

// Paints: colour as a function of the model-space point and surface normal, baked over every part.
const DEEP = "#14a9ad";
const SHALLOW = "#63e0d2";
const FOAM = "#f7fffd";

/** Turquoise water, lighter over the shallows, white foam where it meets the island and the skerries. */
const sea = paint((p) => {
  let edge = Math.hypot(p.x, p.z) - ISLAND_RIM;
  for (const [x, z, r] of SKERRIES) edge = Math.min(edge, Math.hypot(p.x - x, p.z - z) - r);
  const foam = smoothstep(0.075, 0.03, edge + 0.035 * (noise(p, 0.07, 4) - 0.5));
  const shallow = smoothstep(0.4, 0.05, edge);
  const ripple = smoothstep(0.6, 0.8, noise(p, 0.05, 12));
  const water = mix(mix(DEEP, SHALLOW, shallow), "#0b8c99", 0.4 * ripple);
  return mix(water, FOAM, foam);
});

const sand = mottle("#f0dcab", "#dcc08c", { size: 0.03, seed: 11 });
const grassy = mottle("#91cc5e", "#5ea23f", { size: 0.04, seed: 2 });
const stone = mottle("#9ca2a9", "#636a73", { size: 0.05, seed: 5, contrast: 1.4 });

/** Sand at the waterline, grass on the top and gentle slopes, rock everywhere else. */
const ground = paint((p, n) => {
  const wobble = noise(p, 0.1, 2) - 0.5;
  if (p.y + 0.02 * wobble < 0.105) return sand;
  if (n.y > 0.45 && p.y + 0.04 * wobble > 0.2) return grassy;
  return stone;
});

const plinthWood = grain("#6e4727", "#43291a", { size: 0.035, axis: "y", seed: 3 });
const plankWood = grain("#c08a5a", "#8d5d38", { size: 0.02, axis: "x", seed: 7 });
const towerStripes = stripes("#f5f2ea", "#d7313a", { size: 0.11, axis: "y", width: 0.5, wobble: 0.12, seed: 3 });
const brick = scales(["#b65f48", "#a14f3b"], "#e8dac6", { size: 0.03, width: 0.14, seed: 4 });

/** White at the core of the lantern, warm yellow at its glass. */
const lanternGlow = paint((p) =>
  mix("#fff6d0", "#ffc23d", smoothstep(0, 0.07, Math.hypot(p.x - TOWER.x, p.z - TOWER.z))),
);
/** Blue hull with a white top rail. */
const hull = paint((p) => (p.y > 0.128 ? "#f4f1ea" : "#2f6fb3"));

// Card textures, drawn as SVG.
const GRASS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M4 64 C8 42 10 22 3 6 C16 24 19 44 18 64Z" fill="#4f9a3a"/>
<path d="M20 64 C22 36 26 16 32 2 C36 20 39 42 41 64Z" fill="#78bf4f"/>
<path d="M39 64 C41 46 48 30 61 15 C55 36 55 50 57 64Z" fill="#3f8a33"/>
</svg>`;

const flower = (petal: string, centre: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">
<path d="M24 64 C24 50 23 40 24 26" stroke="#4f9a3a" stroke-width="3" fill="none"/>
<circle cx="24" cy="9" r="6" fill="${petal}"/>
<circle cx="33" cy="15" r="6" fill="${petal}"/>
<circle cx="30" cy="26" r="6" fill="${petal}"/>
<circle cx="18" cy="26" r="6" fill="${petal}"/>
<circle cx="15" cy="15" r="6" fill="${petal}"/>
<circle cx="24" cy="18" r="4.5" fill="${centre}"/>
</svg>`;

/** A standing seagull: skeleton first (body, neck, head, lower jaw, wings, legs), then its meshes. */
function gull(b: Builder, name: string, base: Vec3, yaw: number, legSpread: number) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  // Gull-local metres (x: its left, y: up, z: forward) to model space, and directions likewise.
  const P = (x: number, y: number, z: number): Vec3 => [base[0] + x * c + z * s, base[1] + y, base[2] - x * s + z * c];
  const D = (x: number, y: number, z: number): Vec3 => [x * c + z * s, y, -x * s + z * c];
  const j = (part: string) => `${name}${part}`;
  const WHITE = "#f6f7f8";
  const GREY = "#8e9aa6";
  const INK = "#15171b";
  const BEAK = "#f2b632";
  const LEG = "#e8842b";

  b.joint(j("Body"), { parent: "root", at: P(0, 0.072, 0), dir: D(0, 0.2, 1), role: "spine" });
  b.joint(j("Neck"), { parent: j("Body"), at: P(0, 0.09, 0.04), dir: D(0, 0.7, 0.7), role: "neck" });
  b.joint(j("Head"), { parent: j("Neck"), at: P(0, 0.126, 0.066), dir: D(0, 0.25, 1), role: "head" });
  b.joint(j("Jaw"), { parent: j("Head"), at: P(0, 0.12, 0.078), dir: D(0, -0.2, 1), role: "jaw" });
  b.joint(j("WingL"), { parent: j("Body"), at: P(0.028, 0.085, 0), dir: D(0, 0, -1), role: "wing" });
  b.joint(j("WingR"), { parent: j("Body"), at: P(-0.028, 0.085, 0), dir: D(0, 0, -1), role: "wing" });
  b.joint(j("LegL"), { parent: j("Body"), at: P(legSpread, 0.045, 0), dir: D(0, -1, 0), role: "leg" });
  b.joint(j("LegR"), { parent: j("Body"), at: P(-legSpread, 0.045, 0), dir: D(0, -1, 0), role: "leg" });

  // Body: a tapered loft from tail to chest.
  b.loft(
    [
      { at: P(0, 0.07, -0.06), w: 0.05, h: 0.05 },
      { at: P(0, 0.072, -0.005), w: 0.068, h: 0.07 },
      { at: P(0, 0.078, 0.035), w: 0.06, h: 0.064 },
    ],
    { color: WHITE, bone: j("Body") },
  );
  b.capsule(P(0, 0.09, 0.04), P(0, 0.124, 0.064), 0.014, { color: WHITE, bone: j("Neck") });
  b.part(new THREE.SphereGeometry(0.024, 12, 8), WHITE, { at: P(0, 0.128, 0.066), bone: j("Head") });
  for (const sx of [0.0225, -0.0225])
    b.part(new THREE.SphereGeometry(0.0055, 8, 6), INK, { at: P(sx, 0.133, 0.068), bone: j("Head") });

  // Upper beak on the head; the lower jaw is its own joint so the bird can open its mouth.
  b.rod(P(0, 0.13, 0.082), P(0, 0.124, 0.12), [0.0065, 0.0018], { color: BEAK, bone: j("Head") });
  b.rod(P(0, 0.122, 0.078), P(0, 0.117, 0.11), [0.0045, 0.0016], { color: "#e39a1e", bone: j("Jaw") });

  // Wings folded over the back: flat grey slabs hinged at the shoulders.
  const wing: Array<[number, number]> = [
    [0, 0.03],
    [0.05, 0.036],
    [0.11, 0.02],
    [0.14, 0],
    [0.1, -0.006],
    [0.03, -0.012],
    [0, -0.008],
  ];
  for (const [side, sx] of [
    ["WingL", 0.028],
    ["WingR", -0.028],
  ] as const)
    b.extrude(wing, {
      color: GREY,
      at: P(sx, 0.085, 0),
      x: D(0, 0, -1),
      y: D(0, 1, 0),
      thickness: 0.008,
      bevel: 0.003,
      bone: j(side),
    });

  // Legs with three toes each.
  for (const [side, sx] of [
    ["LegL", legSpread],
    ["LegR", -legSpread],
  ] as const) {
    const foot = P(sx, 0.004, 0.006);
    b.rod(P(sx, 0.045, 0), foot, 0.0055, { color: LEG, bone: j(side) });
    b.rod(foot, P(sx, 0.002, 0.036), 0.0038, { color: LEG, bone: j(side) });
    b.rod(foot, P(sx + 0.012, 0.002, 0.026), 0.0034, { color: LEG, bone: j(side) });
    b.rod(foot, P(sx - 0.012, 0.002, 0.026), 0.0034, { color: LEG, bone: j(side) });
  }
}

export default function lighthouseIsland() {
  const b = createBuilder({ name: "lighthouse-island", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });

  // Round display base: a turned plinth with a brass band, the sea set into its top.
  b.lathe([[0, 0], [0.97, 0], [0.99, 0.02], [0.99, 0.07], [0, 0.07]], {
    color: plinthWood,
    at: [0, 0, 0],
    segments: 24,
    bone: "root",
    name: "plinth",
  });
  b.lathe([[0.985, 0.022], [1.008, 0.022], [1.008, 0.046], [0.985, 0.046]], {
    color: BRASS,
    at: [0, 0, 0],
    segments: 24,
    bone: "root",
    name: "brassBand",
  });
  b.lathe([[0, 0.06], [0.95, 0.06], [0.95, WATER_Y], [0, WATER_Y]], {
    color: sea,
    at: [0, 0, 0],
    segments: 40,
    bone: "root",
    name: "sea",
  });

