```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Arctic Research Outpost",
  description: "Firewatch-style flat colour diorama: elevated cabin on stilts, radio mast, wind turbine, weather station, sled and fuel drums on a snow mound.",
};

export const STAGE2: ((b: Builder) => void)[] = [];

// Palette (top level for stage 2)
export const SNOW = "#f4efe6";
export const SNOW_SHADE = "#d7d9e4";
export const ICE = "#9fc6d8";
export const ICE_DEEP = "#5f8fae";
export const WALL = "#d9553b";
export const WALL_DARK = "#a83a2c";
export const TRIM = "#f2e3c2";
export const ROOF = "#3f4a5c";
export const ROOF_LIGHT = "#5b6a80";
export const WOOD = "#7a5233";
export const WOOD_DARK = "#4d3320";
export const METAL = "#8a8f99";
export const METAL_DARK = "#4a4e57";
export const GLASS = "#f5c15a";
export const ORANGE = "#f08a2c";
export const RED = "#c2352b";
export const YELLOW = "#f2c230";
export const GREEN = "#4d6b4a";
export const ROCK = "#6d6a73";

export const REQUESTS = [
  { id: "windowGlow", kind: "add", part: "cabinFront", what: "Two warm glowing windows with TRIM frames, cross mullions and tiny curtains in GLASS and ORANGE on the front wall.", at: [0, 2.6, 1.82], normal: [0, 0, 1], bone: null, room: [2.6, 0.9, 0.2] },
  { id: "doorDetail", kind: "add", part: "cabinSide", what: "Door detail on the left wall: WOOD_DARK planks, METAL handle, small hood lamp in YELLOW, and a hanging parka in ORANGE beside it.", at: [2.52, 2.2, 0.2], normal: [1, 0, 0], bone: null, room: [0.3, 1.8, 1.0] },
  { id: "stairRails", kind: "add", part: "stairs", what: "Handrails with posts in METAL_DARK along the staircase, rope loops and a snow-covered top step.", at: [2.9, 1.2, 1.3], normal: [1, 0, 0], bone: null, room: [0.5, 1.6, 2.4] },
  { id: "mastAntennas", kind: "add", part: "mast", what: "Antenna array on the radio mast: yagi elements, two dish disks, guy wires to the ground, red aviation light at the tip.", at: [-3.2, 6.6, -1.0], normal: [0, 1, 0], bone: null, room: [1.6, 2.4, 1.6] },
  { id: "turbineBlades", kind: "add", part: "turbineHub", what: "Three tapered turbine blades in TRIM with RED tip stripes, spinner cone and a nacelle vent.", at: [3.6, 5.6, -2.6], normal: [0, 0, 1], bone: null, room: [3.4, 3.4, 0.6] },
  { id: "weatherStation", kind: "add", part: "stevenson", what: "Stevenson screen louvres in TRIM, a cup anemometer and wind vane on a short pole, and a rain gauge.", at: [-2.6, 1.0, 3.2], normal: [0, 1, 0], bone: null, room: [1.2, 1.8, 1.2] },
  { id: "drumLabels", kind: "add", part: "drums", what: "Hazard stripes and labels on the fuel drums in YELLOW and METAL_DARK, bungs on top, one tipped drum.", at: [3.6, 0.7, 2.6], normal: [0, 1, 0], bone: null, room: [1.8, 1.2, 1.4] },
  { id: "roofSnow", kind: "add", part: "roof", what: "Thick snow cap on the roof in SNOW with scalloped drooping edge, icicles in ICE and chimney smoke puffs.", at: [0, 4.6, 0], normal: [0, 1, 0], bone: null, room: [5.6, 0.6, 4.2] },
  { id: "sledGear", kind: "add", part: "sled", what: "Cargo on the sled: strapped ORANGE crates, a rolled tarp, ski poles and a coil of rope.", at: [-3.4, 0.5, 2.4], normal: [0, 1, 0], bone: null, room: [1.8, 0.8, 1.0] },
  { id: "snowFlags", kind: "add", part: "flagLine", what: "Marker poles with RED flags leading from the cabin, tiny drifts at their bases.", at: [0, 0.6, 5.0], normal: [0, 1, 0], bone: null, room: [3.0, 1.4, 1.0] },
  { id: "cabinSiding", kind: "texture", part: "cabinFront", what: "Horizontal clapboard siding in WALL with WALL_DARK seams, weathered streaks and frost near the base." },
  { id: "snowTexture", kind: "texture", part: "mound", what: "Snow mound: soft SNOW with SNOW_SHADE wind ripples and sparkles, faint ICE tint in hollows." },
  { id: "roofPanels", kind: "texture", part: "roof", what: "Standing seam metal panels in ROOF and ROOF_LIGHT with rust-free subtle streaks." },
];

export default function build() {
  const b = createBuilder({ name: "arcticOutpost" });
  const R = rng(5);

  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], name, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], seg = 10, name?: string, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as [number, number, number], name, rotation: rot as any });

  // Snow mound (lathe, low poly)
  b.lathe(
    [[0, 0], [8.6, 0], [8.3, 0.3], [7.4, 0.65], [5.8, 0.95], [3.5, 1.1], [0, 1.15]],
    { at: [0, -0.02, 0], segments: 14, color: SNOW, name: "mound" },
  );
  // shade skirt
  b.lathe([[0, 0], [8.9, 0], [8.7, 0.18], [0, 0.18]], { at: [0, -0.02, 0], segments: 14, color: SNOW_SHADE, name: "moundSkirt" });
  // ice patch
  cyl(1.5, 1.6, 0.05, ICE, [-4.4, 0.86, 3.8], 10, "icePatch");
  cyl(0.9, 1.0, 0.06, ICE_DEEP, [-4.2, 0.88, 3.9], 8);
  // rocks
  for (const [x, z, s] of [[5.4, -1.2, 0.7], [-5.6, -2.4, 0.9], [5.9, 1.6, 0.5]]) {
    b.part(new THREE.DodecahedronGeometry(s, 0), ROCK, { at: [x, 0.7 + s * 0.2, z], scale: [1, 0.7, 1], flat: true });
    b.part(new THREE.DodecahedronGeometry(s * 0.7, 0), SNOW, { at: [x, 0.7 + s * 0.65, z], scale: [1, 0.4, 1], flat: true });
  }

  // Stilts
  const baseY = 1.1;
  for (const sx of [-2, 2]) for (const sz of [-1.4, 1.4]) {
    cyl(0.18, 0.22, 1.5, WOOD_DARK, [sx, baseY + 0.55, sz], 6);
    cyl(0.3, 0.34, 0.12, SNOW, [sx, baseY - 0.2, sz], 7);
  }
  // cross braces
  for (const sz of [-1.4, 1.4]) {
    box(4.6, 0.1, 0.1, WOOD, [0, baseY + 0.4, sz], undefined, [0, 0, 22]);
    box(4.6, 0.1, 0.1, WOOD, [0, baseY + 0.4, sz], undefined, [0, 0, -22]);
  }
  // floor deck
  box(5.6, 0.25, 4.4, WOOD_DARK, [0, 1.95, 0], "deck");
  box(5.8, 0.08, 4.6, TRIM, [0, 2.1, 0]);

  // Cabin walls
  const wy = 3.25;
  box(5.0, 2.3, 3.8, WALL, [0, wy, 0], "cabinBody");
  box(5.02, 2.3, 0.1, WALL, [0, wy, 1.9], "cabinFront");
  box(0.1, 2.3, 3.82, WALL, [2.5, wy, 0], "cabinSide");
  // base trim
  box(5.2, 0.18, 4.0, WALL_DARK, [0, 2.2, 0]);
  // corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.2, 2.4, 0.2, TRIM, [sx * 2.5, wy, sz * 1.9]);
  // front window panels (plain recess spots)
  for (const sx of [-1.3, 1.3]) {
    box(1.0, 0.8, 0.06, GLASS, [sx, 3.4, 1.93]);
    box(1.2, 0.1, 0.1, TRIM, [sx, 3.85, 1.95]);
    box(1.2, 0.1, 0.1, TRIM, [sx, 2.95, 1.95]);
    box(0.1, 0.9, 0.1, TRIM, [sx - 0.55, 3.4, 1.95]);
    box(0.1, 0.9, 0.1, TRIM, [sx + 0.55, 3.4, 1.95]);
  }
  // side window rear
  box(0.06, 0.7, 0.9, GLASS, [2.53, 3.4, -0.9]);
  box(0.06, 0.7, 0.9, GLASS, [-2.53, 3.4, 0]);
  // door on left wall
  box(0.08, 1.6, 0.9, WOOD, [2.53, 3.0, 0.5], "door");
  box(0.1, 1.7, 1.0, TRIM, [2.52, 3.02, 0.5]).mesh.scale.set(0.5, 1, 1);

  // Roof (gable)
  const roofShape: [number, number][] = [[-2.9, 0], [2.9, 0], [0, 1.3]];
  b.extrude(roofShape, { at: [0, 4.4, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 4.5, color: ROOF, name: "roof" }).mesh.rotation.y = 0;
  // gable fill front/back
  b.extrude([[-2.5, 0], [2.5, 0], [0, 1.1]], { at: [0, 4.4, 1.95], x: [1, 0, 0], thickness: 0.1, color: WALL_DARK, name: "gable" });
  box(6.0, 0.12, 4.7, ROOF_LIGHT, [0, 4.38, 0]);
  // chimney
  box(0.5, 1.2, 0.5, METAL_DARK, [-1.4, 5.2, -0.6]);
  box(0.64, 0.1, 0.64, METAL, [-1.4, 5.85, -0.6]);

  // Stairs
  for (let i = 0; i < 6; i++) box(0.9, 0.12, 1.0, WOOD, [3.25 + 0.0, 1.15 + i * 0.16 + 0.1, 3.0 - i * 0.5 + 0.0 - 0], "stairs").mesh.position.set(3.2, 0.5 + i * 0.28, 2.2 - i * 0.45);
  box(1.0, 0.12, 1.1, WOOD, [3.2, 2.2, 0.5], "landing");
  for (const sz of [2.4, -0.1]) cyl(0.07, 0.07, 1.4, WOOD_DARK, [3.2, 1.5, sz], 5);

  // Radio mast
  const mx = -3.2, mz = -1.2;
  cyl(0.08, 0.14, 7.0, METAL, [mx, 4.2, mz], 6, "mast");
  for (let i = 0; i < 6; i++) box(0.5, 0.05, 0.05, METAL_DARK, [mx, 1.8 + i * 1.0, mz]);
  box(0.4, 0.4, 0.4, METAL_DARK, [mx, 0.9, mz]);
  cyl(0.14, 0.14, 0.2, RED, [mx, 7.7, mz], 6);

  // Wind turbine
  const tx = 3.6, tz = -2.6;
  cyl(0.1, 0.2, 5.0, TRIM, [tx, 3.5, tz], 8, "turbineTower");
  box(0.4, 0.4, 1.0, METAL, [tx, 6.1, tz - 0.1]);
  cyl(0.2, 0.2, 0.2, ORANGE, [tx, 6.1, tz + 0.5], 8, "turbineHub", [90, 0, 0]);
  box(0.1, 0.5, 0.5, RED, [tx, 5.8, tz - 0.5]);
  box(0.5, 0.2, 0.5, METAL_DARK, [tx, 0.9, tz]);

  // Stevenson screen
  box(0.9, 0.7, 0.7, TRIM, [-2.6, 1.7, 3.2], "stevenson");
  box(1.0, 0.1, 0.8, METAL, [-2.6, 2.1, 3.2]);
  for (const sx of [-0.35, 0.35]) for (const sz of [-0.25, 0.25]) box(0.07, 1.0, 0.07, WOOD, [-2.6 + sx, 1.0, 3.2 + sz]);

  // Fuel drums
  for (const [x, z, c] of [[3.6, 2.8, RED], [4.3, 2.4, ORANGE], [3.9, 3.5, METAL]] as [number, number, string][]) {
    cyl(0.32, 0.32, 0.9, c, [x, 1.5 - 0.0, z], 10, "drums").mesh.position.y = 1.05;
    cyl(0.34, 0.34, 0.06, METAL_DARK, [x, 1.52, z], 10);
    cyl(0.34, 0.34, 0.06, METAL_DARK, [x, 0.6, z], 10);
  }

  // Sled
  box(1.5, 0.12, 0.8, WOOD, [-3.4, 0.9, 2.4], "sled");
  for (const sz of [-0.38, 0.38]) {
    box(1.9, 0.08, 0.1, METAL_DARK, [-3.4, 0.78, 2.4 + sz]);
    box(0.1, 0.2, 0.1, METAL_DARK, [-3.0, 0.85, 2.4 + sz]);
    box(0.1, 0.2, 0.1, METAL_DARK, [-3.8, 0.85, 2.4 + sz]);
  }
  box(0.5, 0.06, 0.06, WOOD_DARK, [-4.45, 0.95, 2.4]);

  // Flag line
  for (let i = 0; i < 3; i++) {
    const x = -1.2 + i * 1.2;
    cyl(0.04, 0.04, 1.4, WOOD, [x, 1.7, 5.0 - i * 0.2], 5, "flagLine");
    box(0.35, 0.22, 0.03, RED, [x + 0.18, 2.2, 5.0 - i * 0.2]);
  }

  // Snow cap drifts around the base
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + R() * 0.3;
    const r = 4.8 + R() * 1.5;
    b.part(new THREE.IcosahedronGeometry(0.5 + R() * 0.3, 0), SNOW, { at: [Math.cos(a) * r, 0.85, Math.sin(a) * r], scale: [1.3, 0.45, 1], flat: true });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```