import * as THREE from "three";
import { type Builder, createBuilder, rng, paint, mix, noise, smoothstep, cells, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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

const CLAP = paint((p, n, _s) => {
  const board = 0.22;
  const f = (((p.y / board) % 1) + 1) % 1;
  const base = noise(p, 0.6, 3);
  let c = mix(WALL, WALL_DARK, 0.25 * base);
  if (f < 0.1) c = mix(c, WALL_DARK, 0.85);
  else if (f > 0.9) c = mix(c, TRIM, 0.18);
  const streak = noise(new THREE.Vector3(p.x * 6, p.y * 0.4, p.z * 6), 0.5, 8);
  c = mix(c, WALL_DARK, 0.3 * smoothstep(0.6, 0.85, streak));
  c = mix(c, SNOW, 0.7 * smoothstep(2.9, 2.35, p.y) * (0.6 + 0.4 * noise(p, 0.15, 4)));
  return c;
});
const SNOWP = paint((p, n) => {
  const ripple = 0.5 + 0.5 * Math.sin((p.x * 1.3 + p.z * 0.7 + noise(p, 1.2, 2) * 3) * 7);
  let c = mix(SNOW, SNOW_SHADE, 0.45 * smoothstep(0.55, 0.95, ripple) + 0.25 * (1 - smoothstep(-0.2, 0.8, n.y)));
  c = mix(c, ICE, 0.35 * smoothstep(0.62, 0.8, noise(p, 0.9, 6)) * (1 - smoothstep(0.2, 0.9, n.y)));
  const sp = cells(p, 0.09, 11);
  if (sp.d1 < 0.06 && sp.id > 0.75) c = mix(c, "#ffffff", 0.9);
  return c;
});
const ROOFP = paint((p, _n, _s) => {
  const f = (((p.x / 0.4) % 1) + 1) % 1;
  let c = mix(ROOF, ROOF_LIGHT, 0.35 * noise(p, 0.8, 5));
  if (f < 0.05) c = mix(c, ROOF_LIGHT, 0.9);
  else if (f < 0.09) c = mix(c, "#2a3240", 0.7);
  const st = noise(new THREE.Vector3(p.x * 5, p.y * 0.3, p.z * 0.3), 0.6, 9);
  return mix(c, ROOF_LIGHT, 0.25 * smoothstep(0.6, 0.85, st));
});

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
    { at: [0, -0.02, 0], segments: 14, color: SNOWP, name: "mound" },
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
  box(5.02, 2.3, 0.1, CLAP as any, [0, wy, 1.9], "cabinFront");
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
  b.extrude(roofShape, { at: [0, 4.4, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 4.5, color: ROOFP, name: "roof" }).mesh.rotation.y = 0;
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addWindowGlow(b: Builder) {
  const CURT = "#e8a24a";
  const WARM = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#f5a640"/></linearGradient></defs>
      <rect width="64" height="48" fill="url(#g)"/>
      <circle cx="32" cy="34" r="16" fill="#ffd57a" opacity="0.6"/>
      <path d="M0 0 L22 0 Q14 20 4 48 L0 48Z" fill="#c9692a"/>
      <path d="M64 0 L42 0 Q50 20 60 48 L64 48Z" fill="#c9692a"/>
      <path d="M8 0 Q10 20 6 48 M14 0 Q16 22 12 46 M56 0 Q54 20 58 48 M50 0 Q48 22 52 46" stroke="#8f4a1e" stroke-width="1.2" fill="none"/>
      <rect x="26" y="26" width="12" height="14" rx="1" fill="#8a5a33"/>
      <rect x="29" y="22" width="6" height="5" fill="#f2e3c2"/>
    </svg>`,
    { size: 128 },
  );

  const z = 1.97;
  for (const sx of [-1.3, 1.3]) {
    // glowing pane with drawn scene (lamp, curtains)
    glow(
      b.part(new THREE.PlaneGeometry(0.98, 0.76), "#ffffff", {
        at: [sx, 3.4, z + 0.045],
        dir: [0, 0, 1],
        axis: "z",
        texture: WARM,
        name: "winPane",
      }),
      1.3,
    );
    // cross mullions
    b.part(new THREE.BoxGeometry(0.98, 0.05, 0.05), TRIM, { at: [sx, 3.4, z + 0.07], name: "mullionH" });
    b.part(new THREE.BoxGeometry(0.05, 0.76, 0.05), TRIM, { at: [sx, 3.4, z + 0.07], name: "mullionV" });
    // outer frame bars
    b.part(new THREE.BoxGeometry(1.22, 0.07, 0.1), TRIM, { at: [sx, 3.82, z + 0.07] });
    b.part(new THREE.BoxGeometry(1.3, 0.1, 0.18), TRIM, { at: [sx, 2.95, z + 0.1], name: "sill" });
    b.part(new THREE.BoxGeometry(0.07, 0.95, 0.1), TRIM, { at: [sx - 0.56, 3.4, z + 0.07] });
    b.part(new THREE.BoxGeometry(0.07, 0.95, 0.1), TRIM, { at: [sx + 0.56, 3.4, z + 0.07] });
    // curtain rod and tie-backs
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 1.0, 5), METAL_DARK, {
      at: [sx, 3.78, z + 0.09],
      rotation: [0, 0, 90],
    });
    for (const s of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.2, 0.62, 0.025), CURT, { at: [sx + s * 0.4, 3.42, z + 0.085], name: "curtain" });
      b.part(new THREE.BoxGeometry(0.22, 0.04, 0.035), ORANGE, { at: [sx + s * 0.4, 3.35, z + 0.095] });
    }
    // snow ledge on sill and window box light spill
    b.part(new THREE.BoxGeometry(1.2, 0.06, 0.2), SNOW, { at: [sx, 3.0, z + 0.12], name: "sillSnow" });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 6), SNOW, { at: [sx - 0.3, 3.04, z + 0.12] });
    // light spill on the snow-facing deck trim
    glow(b.part(new THREE.PlaneGeometry(0.9, 0.12), ORANGE, {
      at: [sx, 2.88, z + 0.02], dir: [0, 0, 1], axis: "z", name: "spill",
    }), 0.5);
  }

  // door-side lamp is left to others; add a small shared lintel board
  b.part(new THREE.BoxGeometry(4.0, 0.08, 0.08), WALL_DARK, { at: [0, 4.2, z + 0.02], name: "lintel" });
}
    return addWindowGlow;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addDoorDetail(b: Builder) {
  const P = (g: THREE.BufferGeometry, c: string, at: number[], rot?: number[], name?: string) =>
    b.part(g, c, { at: at as [number, number, number], rotation: rot as any, name });
  const B = (w: number, h: number, d: number, c: string, at: number[], rot?: number[], name?: string) =>
    P(new THREE.BoxGeometry(w, h, d), c, at, rot, name);
  const C = (r: number, h: number, c: string, at: number[], seg = 6, rot?: number[], name?: string) =>
    P(new THREE.CylinderGeometry(r, r, h, seg), c, at, rot, name);

  // ---- Door (left wall x ~2.53, center z 0.5, y 3.0, 0.9 wide x 1.6 tall) ----
  const dx = 2.6, dz = 0.5;
  // plank overlay
  for (let i = 0; i < 4; i++) {
    B(0.05, 1.56, 0.21, i % 2 ? WOOD_DARK : "#5a3b24", [dx, 3.0, dz - 0.33 + i * 0.22], undefined, "doorPlank");
  }
  // cross battens
  B(0.06, 0.1, 0.9, WOOD_DARK, [dx + 0.03, 3.5, dz], [0, 0, 0]);
  B(0.06, 0.1, 0.9, WOOD_DARK, [dx + 0.03, 2.5, dz]);
  B(0.06, 0.1, 1.15, WOOD_DARK, [dx + 0.035, 3.0, dz], [28, 0, 0]);
  // frame
  B(0.08, 0.1, 1.1, TRIM, [dx - 0.01, 3.86, dz]);
  B(0.08, 1.7, 0.1, TRIM, [dx - 0.01, 3.02, dz - 0.55]);
  B(0.08, 1.7, 0.1, TRIM, [dx - 0.01, 3.02, dz + 0.55]);
  // step sill
  B(0.3, 0.08, 1.1, WOOD, [dx + 0.08, 2.18, dz]);
  // handle: plate, lever, knob
  B(0.04, 0.28, 0.1, METAL_DARK, [dx + 0.06, 3.0, dz + 0.32]);
  C(0.025, 0.2, METAL, [dx + 0.12, 3.02, dz + 0.32], 6, [90, 0, 0]);
  P(new THREE.SphereGeometry(0.045, 6, 4), METAL, [dx + 0.12, 3.02, dz + 0.42]);
  // hinges
  for (const y of [3.55, 2.45]) C(0.035, 0.14, METAL_DARK, [dx + 0.05, y, dz - 0.42], 6);

  // hood lamp above door
  B(0.06, 0.2, 0.3, METAL_DARK, [dx + 0.02, 4.02, dz]);
  const hood = new THREE.ConeGeometry(0.22, 0.2, 6, 1, true);
  P(hood, METAL_DARK, [dx + 0.18, 4.12, dz], [0, 0, -20], "lampHood");
  B(0.04, 0.12, 0.2, YELLOW, [dx + 0.14, 3.98, dz], undefined, "lampGlow");
  C(0.02, 0.2, METAL_DARK, [dx + 0.08, 4.08, dz], 5, [0, 0, 90]);

  // hanging parka beside the door (toward -z... forward, +z side)
  const px = 2.62, pz = 1.38, py = 3.2;
  B(0.03, 0.05, 0.4, WOOD_DARK, [px - 0.02, 3.95, pz]);   // peg rail
  for (const dz2 of [-0.12, 0.12]) C(0.03, 0.07, METAL, [px + 0.02, 3.95, pz + dz2], 5, [0, 0, 90]);
  B(0.12, 0.85, 0.42, ORANGE, [px + 0.06, py + 0.1, pz], undefined, "parkaBody");
  B(0.1, 0.4, 0.42, "#d9741f", [px + 0.07, py - 0.5, pz], undefined, "parkaHem");
  for (const s of [-1, 1]) {
    B(0.1, 0.65, 0.14, ORANGE, [px + 0.07, py - 0.05, pz + s * 0.3], [s * 8, 0, 0], "parkaSleeve");
    B(0.11, 0.1, 0.15, WOOD_DARK, [px + 0.07, py - 0.42, pz + s * 0.33]);
  }
  P(new THREE.SphereGeometry(0.16, 6, 4), ORANGE, [px + 0.08, 3.73, pz], undefined, "hood");
  B(0.05, 0.1, 0.22, "#8a5a2e", [px + 0.15, 3.76, pz]); // fur trim
  B(0.04, 0.8, 0.05, TRIM, [px + 0.125, py + 0.05, pz]); // zip
  B(0.04, 0.08, 0.2, TRIM, [px + 0.12, py + 0.2, pz + 0.0]); // reflective stripe
  B(0.04, 0.08, 0.42, TRIM, [px + 0.125, py - 0.3, pz]);

  // ---- Stair rails ----
  // stairs: steps at x=3.2, y=0.5+i*0.28, z=2.2-i*0.45 ; landing y 2.2 z 0.5
  const rx = [2.72, 3.68];
  for (const x of rx) {
    // posts
    for (let i = 0; i < 6; i += 1) {
      const y = 0.5 + i * 0.28, z = 2.2 - i * 0.45;
      if (i % 2 === 0) C(0.03, 0.8, METAL_DARK, [x, y + 0.45, z], 5, undefined, "railPost");
    }
    // sloped handrail
    const a = new THREE.Vector3(x, 1.35, 2.2), e = new THREE.Vector3(x, 2.55, 0.0);
    b.rod(a, e, 0.035, METAL_DARK, { name: "handrail" });
    // lower rail
    b.rod([x, 0.95, 2.2], [x, 2.15, 0.0], 0.02, METAL_DARK);
    // landing post caps
    P(new THREE.SphereGeometry(0.05, 6, 4), METAL, [x, 2.56, 0.0]);
    P(new THREE.SphereGeometry(0.05, 6, 4), METAL, [x, 1.36, 2.2]);
  }
  // landing guard rail
  C(0.03, 0.8, METAL_DARK, [3.68, 2.65, 0.95], 5);
  b.rod([3.68, 3.05, 0.0], [3.68, 3.05, 1.0], 0.03, METAL_DARK);
  b.rod([3.68, 2.7, 0.0], [3.68, 2.7, 1.0], 0.02, METAL_DARK);

  // rope loops draped between posts on outer rail
  const loopCols = "#d8c49a";
  for (let i = 0; i < 2; i++) {
    const y0 = 0.5 + i * 2 * 0.28 + 0.8, z0 = 2.2 - i * 2 * 0.45;
    const y1 = y0 + 0.56, z1 = z0 - 0.9;
    b.sweep(
      [[3.68, y0 - 0.02, z0], [3.68, (y0 + y1) / 2 - 0.2, (z0 + z1) / 2], [3.68, y1 - 0.02, z1]],
      0.018, loopCols, { name: "ropeLoop" },
    );
    C(0.035, 0.05, WOOD_DARK, [3.68, y0, z0], 6);
  }

  // snow-covered top step / landing
  B(1.05, 0.08, 1.15, SNOW, [3.2, 2.3, 0.5], undefined, "landingSnow");
  P(new THREE.IcosahedronGeometry(0.3, 0), SNOW, [3.1, 2.3, 0.7], undefined, "snowHeap").mesh.scale.set(1.3, 0.4, 1);
  P(new THREE.IcosahedronGeometry(0.2, 0), SNOW, [3.35, 2.32, 0.2]).mesh.scale.set(1.2, 0.35, 1);
  // snow dust on lower steps
  for (let i = 0; i < 3; i++) {
    B(0.8, 0.04, 0.5, SNOW, [3.2, 0.58 + i * 0.28 + 0.06, 2.2 - i * 0.45 + 0.1], undefined, "stepSnow");
  }

  // Signage plaque on wall near the stairs
  const tex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#f2e3c2" stroke="#4d3320" stroke-width="3"/><text x="32" y="22" text-anchor="middle" font-family="serif" font-weight="bold" font-size="16" fill="#a83a2c">STN 7</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    at: [2.57, 3.9, -0.6], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: tex,
  } as any);
}
    return addDoorDetail;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addMastAntennas(b: Builder) {
  const mx = -3.2, mz = -1.2;
  const DISH = "#e8ecef";
  const WIRE = "#2d3036";
  const LAMP = "#ff3b30";

  const P = (g: THREE.BufferGeometry, c: string, at: number[], rot?: number[], scale?: number[]) =>
    b.part(g, c, { at: at as [number, number, number], rotation: rot as any, scale: scale as any });
  const rod = (a: number[], z: number[], r: number, c: string) =>
    b.rod(a as [number, number, number], z as [number, number, number], r, c, { sides: 5 } as any);

  // Yagi antenna (boom along X, elements across Z)
  const yagi = (y: number, zOff: number, rotY: number) => {
    const cs = Math.cos(rotY), sn = Math.sin(rotY);
    const pt = (x: number, dy: number, dz: number) => [mx + x * cs + (dz + zOff) * sn, y + dy, mz - x * sn + (dz + zOff) * cs];
    rod(pt(-0.75, 0, 0), pt(0.75, 0, 0), 0.025, METAL);
    const lens = [0.42, 0.34, 0.3, 0.26, 0.22, 0.18];
    lens.forEach((l, i) => {
      const x = -0.65 + i * 0.26;
      rod(pt(x, 0, -l), pt(x, 0, l), 0.012, TRIM);
    });
    P(new THREE.BoxGeometry(0.1, 0.08, 0.1), METAL_DARK, pt(-0.3, 0, 0), [0, (rotY * 180) / Math.PI, 0]);
  };
  yagi(7.2, 0, 0.3);
  yagi(6.5, 0, -0.9);

  // Dish disks
  const dishTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#dfe4e8"/><circle cx="32" cy="32" r="22" fill="none" stroke="#9aa3ad" stroke-width="2"/><circle cx="32" cy="32" r="12" fill="none" stroke="#9aa3ad" stroke-width="2"/><circle cx="32" cy="32" r="4" fill="#c2352b"/></svg>`,
    { size: 128 },
  );
  const dish = (y: number, ang: number, side: number) => {
    const at = [mx + side * 0.45, y, mz + 0.1];
    const d = new THREE.Vector3(Math.sin(ang) * side, 0.15, Math.cos(ang));
    const bowl = b.part(new THREE.SphereGeometry(0.5, 10, 4, 0, Math.PI * 2, 0, 0.9), DISH, {
      at: at as [number, number, number], dir: d.toArray() as any, axis: "y",
    });
    b.part(new THREE.CircleGeometry(0.44, 14), "#ffffff", {
      at: [at[0] + d.x * 0.1, at[1] + d.y * 0.1 + 0.0, at[2] + d.z * 0.1], dir: d.toArray() as any, axis: "z", texture: dishTex,
    });
    rod(at, [mx, y - 0.05, mz], 0.04, METAL_DARK);
    const tip = [at[0] + d.x * 0.45, at[1] + d.y * 0.45, at[2] + d.z * 0.45];
    rod(at, tip, 0.012, METAL_DARK);
    P(new THREE.SphereGeometry(0.05, 6, 4), ORANGE, tip);
    return bowl;
  };
  dish(5.6, 0.6, 1);
  dish(4.6, -0.5, -1);

  // Mast tip + aviation light
  P(new THREE.ConeGeometry(0.06, 0.6, 6), METAL, [mx, 8.05, mz]);
  const lamp = P(new THREE.SphereGeometry(0.15, 8, 6), LAMP, [mx, 7.95, mz]);
  lamp.mesh.material = (lamp.mesh.material as THREE.MeshStandardMaterial).clone();
  const m = lamp.mesh.material as THREE.MeshStandardMaterial;
  m.emissive.set(LAMP); m.emissiveIntensity = 1.5;
  P(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), WIRE, [mx, 7.82, mz]);

  // Guy wires with stakes
  for (let i = 0; i < 3; i++) {
    const a = 0.5 + (i * Math.PI * 2) / 3;
    const gx = mx + Math.cos(a) * 2.6, gz = mz + Math.sin(a) * 2.6;
    rod([mx, 6.4, mz], [gx, 0.95, gz], 0.012, WIRE);
    P(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 5), WOOD_DARK, [gx, 0.95, gz], [0, 0, 0]);
    P(new THREE.BoxGeometry(0.22, 0.1, 0.1), METAL_DARK, [mx + Math.cos(a) * 0.14, 6.4, mz + Math.sin(a) * 0.14]);
    P(new THREE.IcosahedronGeometry(0.25, 0), SNOW, [gx, 0.95, gz], undefined, [1.2, 0.4, 1.2]);
  }
  P(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8), YELLOW, [mx, 1.5, mz]);
}

function addTurbineBlades(b: Builder) {
  const tx = 3.6, tz = -2.6, hy = 6.1, hz = tz + 0.62;
  const BLADE_TRIM = TRIM;

  // Hub spinner cone
  b.part(new THREE.ConeGeometry(0.24, 0.55, 8), ORANGE, { at: [tx, hy, hz + 0.28], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 8), METAL_DARK, { at: [tx, hy, hz - 0.02], rotation: [90, 0, 0] });

  // Blades: tapered outline extruded in the XY plane at hub
  const outline: [number, number][] = [
    [-0.12, 0.1], [0.12, 0.1], [0.1, 0.9], [0.07, 1.55], [0.0, 1.7, "sharp" as any], [-0.06, 1.5], [-0.1, 0.8],
  ] as any;
  const tip: [number, number][] = [[-0.06, 1.1], [0.08, 1.1], [0.0, 1.7], [-0.06, 1.5]] as any;
  for (let i = 0; i < 3; i++) {
    const ang = (i * 120 + 20) * (Math.PI / 180);
    const x = [Math.cos(ang), Math.sin(ang), 0] as [number, number, number];
    const y = [-Math.sin(ang), Math.cos(ang), 0] as [number, number, number];
    // our outline runs along +y (blade length); rotate so local y points radially
    const yr = [Math.cos(ang), Math.sin(ang), 0] as [number, number, number];
    const xr = [Math.sin(ang), -Math.cos(ang), 0] as [number, number, number];
    void x; void y;
    b.extrude(outline, { at: [tx, hy, hz + 0.05], x: xr, y: yr, thickness: [0.06, 0.02], bevel: 0.01, color: BLADE_TRIM });
    // red tip stripes
    const stripe: [number, number][] = [[-0.1, 1.2], [0.1, 1.2], [0.05, 1.6], [0.0, 1.7], [-0.06, 1.5]] as any;
    b.extrude(stripe, { at: [tx, hy, hz + 0.05], x: xr, y: yr, thickness: [0.075, 0.03], color: RED });
    void tip;
    // blade root fitting
    const rx = tx + Math.cos(ang) * 0.3, ry = hy + Math.sin(ang) * 0.3;
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.14), METAL, { at: [rx, ry, hz + 0.03], rotation: [0, 0, (ang * 180) / Math.PI] });
  }

  // Nacelle vent slats and rear details
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.4), METAL_DARK, { at: [tx + 0.21, 6.2 - i * 0.07 + 0.0, tz - 0.1] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.4), METAL_DARK, { at: [tx - 0.21, 6.2 - i * 0.07, tz - 0.1] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 5), METAL_DARK, { at: [tx, 6.45, tz - 0.4] });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [tx, 6.68, tz - 0.4] });
  // tail fin
  b.extrude([[0, 0], [0.7, 0], [0.7, 0.5], [0.25, 0.25]], {
    at: [tx, 6.2, tz - 0.55], x: [0, 0, -1], thickness: 0.04, color: ORANGE,
  });
}
    return addMastAntennas;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addWeatherStation(b: Builder) {
  const cx = -2.6, cz = 3.2;
  const CUP = "#e8e4dc";
  const DARK = "#2f3440";
  const BRASS = "#c9a24a";

  // louvre texture: horizontal slats on the screen's faces
  const louvre = svg(
    `<svg viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#ffffff"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="0" y="${i * 8 + 5}" width="64" height="3" fill="#b9b3a4"/><rect x="0" y="${i * 8 + 8}" width="64" height="1.2" fill="#8c8678"/>`).join("")}
      <rect x="0" y="0" width="64" height="3" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // Louvred faces on the Stevenson screen (box 0.9 x 0.7 x 0.7 at y 1.7)
  const sy = 1.7;
  const faces: [number[], number[], number[]][] = [
    [[0.88, 0.62], [cx, sy], [0, 0.357]],
  ];
  void faces;
  const face = (w: number, h: number, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), TRIM, {
      at: at as [number, number, number],
      dir: dir as [number, number, number],
      axis: "z",
      texture: louvre,
      name: "s24louvre",
    });
  face(0.86, 0.62, [cx, sy - 0.02, cz + 0.357], [0, 0, 1]);
  face(0.86, 0.62, [cx, sy - 0.02, cz - 0.357], [0, 0, -1]);
  face(0.66, 0.62, [cx + 0.457, sy - 0.02, cz], [1, 0, 0]);
  face(0.66, 0.62, [cx - 0.457, sy - 0.02, cz], [-1, 0, 0]);

  // door handle and frame edges
  b.part(new THREE.BoxGeometry(0.05, 0.1, 0.03), METAL_DARK, { at: [cx + 0.3, sy, cz + 0.375] });
  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.04, 0.7, 0.04), WOOD, { at: [cx + sx * 0.44, sy, cz + 0.35] });
  // snow on the roof of the screen
  b.part(new THREE.BoxGeometry(0.98, 0.07, 0.78), SNOW, { at: [cx, 2.19, cz] });
  b.part(new THREE.BoxGeometry(0.7, 0.05, 0.55), SNOW_SHADE, { at: [cx - 0.05, 2.24, cz], flat: true });
  // thermometer slot
  b.part(new THREE.BoxGeometry(0.76, 0.05, 0.6), WOOD_DARK, { at: [cx, 1.33, cz] });
  // cross braces between legs
  b.part(new THREE.BoxGeometry(0.6, 0.04, 0.04), WOOD, { at: [cx, 1.0, cz + 0.25], rotation: [0, 0, 20] });
  b.part(new THREE.BoxGeometry(0.6, 0.04, 0.04), WOOD, { at: [cx, 1.0, cz + 0.25], rotation: [0, 0, -20] });

  // Pole with anemometer and wind vane (beside the screen)
  const px = cx + 0.75, pz = cz - 0.35;
  b.part(new THREE.CylinderGeometry(0.03, 0.045, 1.9, 6), METAL, { at: [px, 1.8, pz], name: "s24pole" });
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.08, 6), SNOW, { at: [px, 0.9, pz] });
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.04), METAL_DARK, { at: [px, 2.2, pz] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), METAL_DARK, { at: [px, 2.22, pz] });
  // cups: rotated arms
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const ax = px + Math.cos(a) * 0.2, az = pz + Math.sin(a) * 0.2;
    b.part(new THREE.BoxGeometry(0.22, 0.025, 0.025), METAL_DARK, { at: [px + Math.cos(a) * 0.1, 2.3, pz + Math.sin(a) * 0.1], rotation: [0, -a * 180 / Math.PI, 0] });
    b.part(new THREE.SphereGeometry(0.065, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.6), i === 0 ? RED : CUP, { at: [ax, 2.3, az], rotation: [180, 0, 0], flat: true });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6), METAL_DARK, { at: [px, 2.36, pz] });

  // wind vane
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 5), METAL_DARK, { at: [px, 2.0, pz] });
  b.part(new THREE.BoxGeometry(0.5, 0.025, 0.025), METAL_DARK, { at: [px, 1.92, pz], name: "s24vane" });
  b.part(new THREE.ConeGeometry(0.06, 0.16, 4), RED, { at: [px, 1.92, pz + 0.3], rotation: [90, 0, 0] });
  b.part(new THREE.BoxGeometry(0.03, 0.2, 0.2), YELLOW, { at: [px, 1.95, pz - 0.28] });
  b.part(new THREE.BoxGeometry(0.03, 0.12, 0.12), YELLOW, { at: [px, 1.95, pz - 0.42] });

  // Rain gauge
  const rx = cx - 0.65, rz = cz + 0.5;
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8), METAL, { at: [rx, 1.05, rz], name: "s24gauge" });
  b.part(new THREE.CylinderGeometry(0.115, 0.1, 0.06, 8), METAL_DARK, { at: [rx, 1.27, rz] });
  b.part(new THREE.CylinderGeometry(0.1, 0.02, 0.1, 8), ICE, { at: [rx, 1.3, rz], flat: true });
  b.part(new THREE.CylinderGeometry(0.103, 0.103, 0.03, 8), YELLOW, { at: [rx, 1.0, rz] });
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 8), SNOW, { at: [rx, 0.84, rz] });
  // stake
  b.part(new THREE.BoxGeometry(0.05, 0.4, 0.05), WOOD, { at: [rx, 0.9, rz - 0.0] });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.03), BRASS, { at: [rx + 0.12, 1.15, rz] });

  // small snow drifts at pole bases
  b.part(new THREE.IcosahedronGeometry(0.2, 0), SNOW, { at: [px, 0.88, pz], scale: [1.5, 0.4, 1.2], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.18, 0), SNOW, { at: [rx - 0.05, 0.84, rz + 0.05], scale: [1.4, 0.4, 1.2], flat: true });
}
    return addWeatherStation;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addDrumLabels(b: Builder) {
  const R = rng(25);

  // Drums from stage 1: centres (x,z), body y 1.05 height 0.9 radius 0.32, top at ~1.52
  const drums: [number, number][] = [
    [3.6, 2.8],
    [4.3, 2.4],
    [3.9, 3.5],
  ];

  const LABEL = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8" width="60" height="48" rx="4" fill="#f4efe6" stroke="#4a4e57" stroke-width="3"/>
      <path d="M32 14 L50 46 L14 46Z" fill="#f2c230" stroke="#4a4e57" stroke-width="3" stroke-linejoin="round"/>
      <rect x="30" y="24" width="4" height="12" fill="#4a4e57"/>
      <rect x="30" y="39" width="4" height="4" fill="#4a4e57"/>
    </svg>`,
    { size: 128 },
  );

  // Hazard stripe texture (yellow/dark diagonal)
  const STRIPE = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="#f2c230"/>
      <path d="M0 16 L16 0 L24 0 L8 16Z M16 16 L32 0 L40 0 L24 16Z M32 16 L48 0 L56 0 L40 16Z M48 16 L64 0 L72 0 L56 16Z M-16 16 L0 0 L8 0 L-8 16Z" fill="#4a4e57"/>
    </svg>`,
    { size: 128 },
  );

  drums.forEach(([x, z], i) => {
    // hazard band wrapped around the drum (open cylinder with texture)
    const bandGeo = new THREE.CylinderGeometry(0.335, 0.335, 0.16, 12, 1, true);
    b.part(bandGeo, "#ffffff", { at: [x, 0.8, z], texture: STRIPE, name: "hazardBand" });
    b.part(new THREE.CylinderGeometry(0.335, 0.335, 0.16, 12, 1, true), "#ffffff", {
      at: [x, 1.3, z],
      texture: STRIPE,
      name: "hazardBand",
    });
    // label plate facing +Z-ish (toward viewer)
    const ang = [0.5, 0.2, -0.3][i];
    const dx = Math.sin(ang), dz = Math.cos(ang);
    b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
      at: [x + dx * 0.345, 1.05, z + dz * 0.345],
      dir: [dx, 0, dz],
      axis: "z",
      texture: LABEL,
      name: "drumLabel",
    });
    // ribs
    for (const ry of [0.62, 1.05, 1.48]) {
      b.part(new THREE.TorusGeometry(0.33, 0.015, 4, 12), METAL_DARK, {
        at: [x, ry, z],
        rotation: [90, 0, 0],
        name: "drumRib",
      });
    }
    // bungs on top
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), METAL, { at: [x + 0.12, 1.58, z], name: "bung" });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), YELLOW, { at: [x - 0.14, 1.58, z + 0.08], name: "bung" });
  });

  // One tipped drum lying on snow beside the stack
  const tx = 4.7, tz = 3.3;
  b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 10), ORANGE, {
    at: [tx, 1.0, tz],
    rotation: [90, 0, 35],
    name: "tippedDrum",
  });
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 10), METAL_DARK, {
    at: [tx - 0.26, 1.0, tz - 0.37],
    rotation: [90, 0, 35],
  });
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 10), METAL_DARK, {
    at: [tx + 0.26, 1.0, tz + 0.37],
    rotation: [90, 0, 35],
  });
  b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
    at: [tx - 0.1, 1.0, tz + 0.33],
    dir: [0, 0, 1],
    axis: "z",
    texture: LABEL,
  });
  // spill puddle
  b.part(new THREE.CylinderGeometry(0.35, 0.4, 0.02, 8), METAL_DARK, { at: [tx + 0.5, 0.9, tz + 0.5], name: "spill" });

  // ---- Roof snow ----
  // thick cap: two slanted slabs over the gable (roof peak at y 5.7, eaves at 4.4, half width 2.9)
  const slope = Math.atan2(1.3, 2.9);
  const len = Math.hypot(2.9, 1.3) + 0.25;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(len, 0.22, 4.9), SNOW, {
      at: [s * 1.5, 5.12, 0],
      rotation: [0, 0, -s * slope * (180 / Math.PI)],
      name: "roofSnow",
    });
    // scalloped drooping edge along eaves
    for (let k = 0; k < 9; k++) {
      const z = -2.1 + k * 0.525;
      const h = 0.18 + R() * 0.16;
      b.part(new THREE.IcosahedronGeometry(0.2, 0), SNOW, {
        at: [s * 3.0, 4.38 - h * 0.3, z],
        scale: [0.9, 0.5 + h * 2, 1.2],
        flat: true,
        name: "roofScallop",
      });
      // icicles
      if (k % 2 === 0 || R() > 0.6) {
        const il = 0.2 + R() * 0.3;
        b.part(new THREE.ConeGeometry(0.045, il, 5), ICE, {
          at: [s * 3.05, 4.25 - il / 2 - 0.08, z + (R() - 0.5) * 0.2],
          rotation: [180, 0, 0],
          name: "icicle",
        });
      }
    }
  }
  // ridge cap
  b.part(new THREE.BoxGeometry(0.5, 0.2, 4.9), SNOW, { at: [0, 5.78, 0], name: "ridgeSnow" });
  // gable-end overhang bumps
  for (const zs of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.3, 0), SNOW, {
      at: [0, 5.75, zs * 2.45],
      scale: [1.2, 0.6, 0.8],
      flat: true,
    });
  }
  // chimney snow cap
  b.part(new THREE.BoxGeometry(0.7, 0.1, 0.7), SNOW, { at: [-1.4, 5.95, -0.6], name: "chimneySnow" });

  // smoke puffs
  const SMOKE = ["#e4e1e6", "#d3d3dc", "#c4c6d2", "#b5b9c9"];
  for (let k = 0; k < 4; k++) {
    const r = 0.2 + k * 0.08;
    b.part(new THREE.IcosahedronGeometry(r, 0), SMOKE[k], {
      at: [-1.4 + k * 0.28, 6.25 + k * 0.45, -0.6 - k * 0.1],
      flat: true,
      name: "smoke",
    });
  }
}
    return addDrumLabels;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addSledGear(b: Builder) {
  const R = rng(26);
  const CRATE_DARK = "#b85f1c";
  const TARP = "#5f7f8a";
  const ROPE = "#c9a566";

  const crateStripe = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/><rect x="0" y="0" width="64" height="64" fill="none" stroke="#555" stroke-width="5"/><path d="M0 0L64 64M64 0L0 64" stroke="#999" stroke-width="3"/><rect x="26" y="0" width="12" height="64" fill="#777"/></svg>`,
    { size: 128 },
  );

  const tarpPaint = paint((p, n) => {
    const k = noise(p, 0.12, 3);
    return mix(TARP, "#3f5a64", k * 0.6 + (n.y < 0 ? 0.2 : 0));
  });

  const sledX = -3.4, sledZ = 2.4, top = 0.96;

  // crates with straps
  const crates: [number, number, number, number, number, number][] = [
    [-3.75, top + 0.2, sledZ - 0.12, 0.5, 0.4, 0.46],
    [-3.15, top + 0.16, sledZ + 0.12, 0.42, 0.32, 0.4],
  ];
  crates.forEach(([x, y, z, w, h, d], i) => {
    b.part(new THREE.BoxGeometry(w, h, d), i ? ORANGE : "#f08a2c", {
      at: [x, y, z],
      rotation: [0, i ? -8 : 6, 0],
      texture: crateStripe,
      name: "sledCrate" + i,
    });
    b.part(new THREE.BoxGeometry(w + 0.02, h + 0.02, 0.05), METAL_DARK, { at: [x, y, z], rotation: [0, i ? -8 : 6, 0] });
    b.part(new THREE.BoxGeometry(0.05, h + 0.02, d + 0.02), CRATE_DARK, { at: [x + 0.12, y, z], rotation: [0, i ? -8 : 6, 0] });
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.06), YELLOW, { at: [x, y + h / 2 + 0.02, z + d / 2 - 0.05] });
  });
  // small crate on top
  b.part(new THREE.BoxGeometry(0.3, 0.22, 0.3), RED, { at: [-3.72, top + 0.51, sledZ - 0.1], rotation: [0, 20, 0] });
  b.part(new THREE.BoxGeometry(0.32, 0.04, 0.08), TRIM, { at: [-3.72, top + 0.52, sledZ - 0.1], rotation: [0, 20, 0] });

  // rolled tarp
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.8, 9), tarpPaint, {
    at: [-3.45, top + 0.1, sledZ + 0.3],
    rotation: [90, 0, 0],
    name: "tarp",
  });
  for (const dz of [-0.2, 0.2])
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 9), ROPE, { at: [-3.45, top + 0.1, sledZ + 0.3 + dz], rotation: [90, 0, 0] });
  for (const dz of [-0.4, 0.4])
    b.part(new THREE.CircleGeometry(0.12, 9), "#2f444c", { at: [-3.45, top + 0.1, sledZ + 0.3 + dz * 1.02], dir: [0, 0, dz > 0 ? 1 : -1], axis: "z" });

  // ski poles leaning
  for (const [dx, tilt] of [[0, 14], [0.12, 8]] as number[][]) {
    b.rod([-3.9 + dx, top, sledZ + 0.32], [-4.4 + dx, top + 1.2, sledZ + 0.5], 0.015, METAL_DARK);
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), METAL, { at: [-3.99 + dx, top + 0.2, sledZ + 0.35], rotation: [90, 0, tilt] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), RED, { at: [-4.4 + dx, top + 1.15, sledZ + 0.5], rotation: [20, 0, 20] });
  }

  // rope coil
  for (let i = 0; i < 4; i++)
    b.part(new THREE.TorusGeometry(0.17 - i * 0.012, 0.025, 5, 12), ROPE, { at: [-2.85, top + 0.04 + i * 0.045, sledZ - 0.2], rotation: [90, 0, 0] });
  b.rod([-2.7, top + 0.05, sledZ - 0.2], [-2.35, 0.9, sledZ - 0.1], 0.02, ROPE);

  // snow on cargo
  b.part(new THREE.IcosahedronGeometry(0.2, 0), SNOW, { at: [-3.75, top + 0.66, sledZ - 0.1], scale: [1.2, 0.3, 1], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.2, 0), SNOW, { at: [-3.15, top + 0.38, sledZ + 0.12], scale: [1.1, 0.3, 1], flat: true });

  // snow flags
  const flagTex = svg(
    `<svg viewBox="0 0 64 40"><path d="M0 0H64L48 20L64 40H0Z" fill="#fff"/><path d="M0 0H10V40H0Z" fill="#ccc"/><path d="M14 6H50L40 20L50 34H14Z" fill="#ddd"/></svg>`,
    { size: 96 },
  );
  for (let i = 0; i < 3; i++) {
    const x = -1.2 + i * 1.2;
    const z = 5.0 - i * 0.2;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 5), WOOD_DARK, { at: [x, 2.45, z] });
    b.part(new THREE.PlaneGeometry(0.4, 0.26), RED, { at: [x + 0.22, 2.2, z], dir: [0, 0, 1], axis: "z", texture: flagTex });
    b.part(new THREE.PlaneGeometry(0.4, 0.26), RED, { at: [x + 0.22, 2.2, z - 0.01], dir: [0, 0, -1], axis: "z", texture: flagTex });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 8), METAL_DARK, { at: [x, 2.47, z] });
    // drift at base
    b.part(new THREE.IcosahedronGeometry(0.32, 0), SNOW, { at: [x, 0.95, z], scale: [1.4, 0.4, 1.1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), SNOW_SHADE, { at: [x + 0.25 + R() * 0.1, 0.9, z - 0.15], scale: [1.3, 0.35, 1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.1, 0), SNOW, { at: [x + 0.03, 2.5, z], scale: [1.2, 0.6, 1.2], flat: true });
  }
}
    return addSledGear;
  })(),
);
