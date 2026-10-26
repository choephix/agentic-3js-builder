import * as THREE from "three";
import { type Builder, createBuilder, paint, mix, noise, smoothstep, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A nine-storey raw-concrete slab block on pilotis, with deep balcony loggias, fins, a slit-windowed stair tower and a roof plant level.",
};

// ---------- palette (top level, shared with stage 2) ----------
export const CONCRETE = "#9a9890";
export const CONCRETE_LIGHT = "#b3b0a6";
export const CONCRETE_DARK = "#6f6d68";
export const CONCRETE_STAIN = "#5d5b56";
export const SHADOW = "#2f2f31";
export const GLASS = "#3b4a52";
export const GLASS_LIGHT = "#6f8a93";
export const FRAME = "#26272a";
export const RUST = "#8a4a2b";
export const OCHRE = "#b98a3a";
export const TEAL = "#3f6b66";
export const OLIVE = "#6b6e3a";
export const BONE = "#d8d2bf";
export const STEEL = "#7b8086";
export const LAMP = "#ffd98a";
const INFILL = [OCHRE, RUST, TEAL, BONE, OLIVE];

const fr = (x: number) => x - Math.floor(x);

// Board-formed concrete for fins: horizontal boards, tie holes, rain streaks.
const finPaint = (base: string) =>
  paint((p, n) => {
    const board = Math.floor(p.y / 0.18);
    const tone = 0.5 + 0.5 * Math.sin(board * 12.9898) * 0.6;
    let c = mix(base, CONCRETE_DARK, 0.12 + 0.25 * tone * noise(p, 0.5, 3));
    const f = fr(p.y / 0.18);
    if (f < 0.07) c = mix(c, CONCRETE_STAIN, 0.55);
    const tx = fr((p.x + p.z) / 0.6) - 0.5;
    const ty = fr(p.y / 0.9) - 0.5;
    if (Math.hypot(tx * 0.6, ty * 0.9) < 0.05) c = mix(c, SHADOW, 0.8);
    const streak = smoothstep(0.55, 0.8, noise([p.x * 6, p.y * 0.25, p.z * 6] as never, 0.4, 5) as number);
    c = mix(c, CONCRETE_STAIN, streak * 0.4 * smoothstep(-0.5, 0.9, -n.y + 0.5));
    return c;
  });

// Gable-end wall: shuttering joints plus faded mural (grid of squares and sun disc).
const endWallPaint = paint((p, n) => {
  let c = mix(CONCRETE_LIGHT, CONCRETE, 0.35 + 0.4 * noise(p, 1.2, 8));
  if (Math.abs(n.x) > 0.7) {
    const y = p.y - 16, z = p.z;
    const sun = Math.hypot(z, y - 4);
    const gx = Math.floor((z + 4.5) / 1.5), gy = Math.floor((y + 8) / 1.5);
    const inGrid = y < -1 && y > -9 && Math.abs(z) < 4.5;
    const cell = [OCHRE, RUST, TEAL][Math.abs(gx * 3 + gy * 5) % 3];
    if (sun < 3.2) c = mix(c, OCHRE, 0.28);
    else if (sun < 3.6) c = mix(c, RUST, 0.3);
    else if (inGrid && fr((z + 4.5) / 1.5) > 0.1 && fr((y + 8) / 1.5) > 0.1 && (gx + gy) % 2 === 0)
      c = mix(c, cell, 0.26);
  }
  if (fr((p.z + p.x) / 1.5) < 0.012) c = mix(c, CONCRETE_DARK, 0.6);
  return c;
});

// Pilotis: vertical boards, base grime, chipped corners, graffiti tag.
const pilotisPaint = paint((p, n) => {
  let c = mix(CONCRETE, CONCRETE_LIGHT, 0.5 * noise(p, 0.4, 2));
  const b = fr((p.x + p.z) / 0.25);
  if (b < 0.06) c = mix(c, CONCRETE_DARK, 0.6);
  const grime = smoothstep(2.2, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.3, 4));
  c = mix(c, CONCRETE_STAIN, grime * 0.8);
  if (Math.abs(n.y) < 0.5 && noise(p, 0.12, 9) > 0.72 && fr((p.x + p.z) / 1.5) < 0.2) c = mix(c, CONCRETE_DARK, 0.7);
  const t = p.x * 7 + p.z * 7;
  if (p.y > 0.5 && p.y < 1.3 && Math.abs(p.y - 0.9 - 0.2 * Math.sin(t * 2.3)) < 0.035 && fr(t / 1.7) < 0.7)
    c = mix(c, p.x > 0 ? RUST : TEAL, 0.85);
  return c;
});

// Roof edge: green-black streaks, efflorescence drips, expansion joints.
const roofPaint = paint((p, n) => {
  let c = mix(CONCRETE_LIGHT, CONCRETE, 0.4 + 0.4 * noise(p, 0.8, 6));
  const sx = noise([p.x * 8, 0, p.z * 8] as never, 0.5, 11) as number;
  if (Math.abs(n.y) < 0.6) {
    c = mix(c, "#2e3a33", smoothstep(0.55, 0.8, sx) * 0.6 * smoothstep(-0.3, 1.2, 1.3 - (p.y - 28)));
    const d = noise([p.x * 14, 0, p.z * 14] as never, 0.4, 13) as number;
    if (d > 0.68 && p.y > 28.4) c = mix(c, "#ece9e0", 0.7);
  }
  if (fr(p.x / 8) < 0.01 || fr(p.z / 6) < 0.01) c = mix(c, CONCRETE_DARK, 0.8);
  return c;
});

export const REQUESTS = [
  {
    id: "houseNumbers",
    kind: "add",
    part: "lobbyCanopy",
    what: "Large cast-concrete style house numbers '1-48' and a street-name plate in BONE on SHADOW backing, mounted on the canopy fascia, plus a small recessed letterbox bank beside the lobby door in STEEL.",
    at: [0, 4.1, 6.2],
    normal: [0, 0, 1],
    bone: null,
    room: [6, 1.2, 0.5],
  },
  {
    id: "lobbyFurniture",
    kind: "add",
    part: "lobby",
    what: "Entrance forecourt details: two heavy concrete planters with shrubs in OLIVE, a bench, bollards, and a bike rack in STEEL.",
    at: [0, 0.5, 8],
    normal: [0, 0, 1],
    bone: null,
    room: [14, 1.4, 3],
  },
  {
    id: "balconyLife",
    kind: "add",
    part: "parapet",
    what: "Balcony clutter on the front loggias of floors 3 to 6 near the left end: slim steel railings, pot plants, washing lines with small coloured garments, a chair, and a few satellite dishes in BONE.",
    at: [-14, 13, 6.5],
    normal: [0, 0, 1],
    bone: null,
    room: [12, 7, 2],
  },
  {
    id: "endWallPipes",
    kind: "add",
    part: "endWall",
    what: "Exposed services on the west end wall: vertical downpipes, a bundled cable run with clips, two rectangular vent grilles and a fire-escape signage plate in STEEL and FRAME.",
    at: [-24.1, 12, 0],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.6, 14, 6],
  },
  {
    id: "roofPlant",
    kind: "add",
    part: "roofPlant",
    what: "Roof plant details: safety railing along the parapet inner edge, access ladder on the water tank, rooftop aerial masts with guy wires, pipework and ducting elbows in STEEL.",
    at: [-10, 29.5, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [14, 3, 8],
  },
  {
    id: "towerSlits",
    kind: "add",
    part: "towerSlit",
    what: "Glazing for the stair tower slit windows: thin frames in FRAME with GLASS_LIGHT reflective panes and horizontal transoms; wired glass look.",
    at: [27, 16, 5.1],
    normal: [0, 0, 1],
    bone: null,
    room: [1.2, 28, 0.4],
  },
  {
    id: "towerCrown",
    kind: "add",
    part: "towerCap",
    what: "Tower crown: a lift-motor room louvre grille, a red aircraft warning lamp glowing, a lightning rod and a flagpole.",
    at: [27, 33.5, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [5, 4, 6],
  },
  {
    id: "undersideLights",
    kind: "add",
    part: "pilotis",
    what: "Ground-level soffit lighting: rows of caged bulkhead lamps glowing LAMP under the first floor slab between the pilotis, with conduit runs, and fat painted numbers on three columns.",
    at: [0, 3.8, 0],
    normal: [0, -1, 0],
    bone: null,
    room: [40, 0.6, 9],
  },
  {
    id: "windowBlinds",
    kind: "add",
    part: "glass",
    what: "Interior life seen through windows of the east half of the front facade: roller blinds half drawn in BONE, curtains in OCHRE and TEAL and a few warm lit windows glowing LAMP.",
    at: [12, 15, 5.1],
    normal: [0, 0, 1],
    bone: null,
    room: [20, 18, 0.3],
  },
  {
    id: "mailboxEntrance",
    kind: "add",
    part: "lobby",
    what: "Lobby door assembly: double glazed doors with steel handles, intercom panel with buttons, and a small glowing lamp above the door.",
    at: [0, 1.6, 4.1],
    normal: [0, 0, 1],
    bone: null,
    room: [4, 3, 0.5],
  },
  {
    id: "boardMarked",
    kind: "texture",
    part: "fin",
    what: "Board-formed concrete: horizontal timber-grain lines and tie-hole dots on fins in CONCRETE and CONCRETE_DARK, with rain-streak staining in CONCRETE_STAIN running down from slab edges.",
  },
  {
    id: "endWallMural",
    kind: "texture",
    part: "endWall",
    what: "Raw concrete with a big faded geometric mural (grid of squares and a large sun disc) in OCHRE, RUST and TEAL at low contrast on both gable ends, plus vertical shuttering joints.",
  },
  {
    id: "pilotisTexture",
    kind: "texture",
    part: "pilotis",
    what: "Heavy rough concrete columns: vertical board marks, chipped corners, grime darkening toward the base in CONCRETE_STAIN and graffiti tags low down.",
  },
  {
    id: "roofSlabTexture",
    kind: "texture",
    part: "roofSlab",
    what: "Weathered roof edge and parapet: streaky black-green staining, white efflorescence drips and expansion joints in CONCRETE_DARK.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "brutalistBlock" });

  const box = (name: string, color: string, size: [number, number, number], at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, name });
  const boxP = (name: string, color: any, size: [number, number, number], at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, name });
  const cyl = (name: string, color: string, r: number, h: number, at: [number, number, number], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, name });

  const BAYS = 12, BAYW = 4, X0 = -24, FLOORS = 8, FH = 3, BASE = 4;
  const TOP = BASE + FLOORS * FH; // 28

  // ---------- plinth ----------
  box("plinth", CONCRETE_DARK, [52, 0.2, 14], [0, 0.1 - 0.1, 0]).position.y += 0;

  // ---------- pilotis ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 9; i++) {
      const x = -24 + i * 6;
      boxP("pilotis", pilotisPaint, [1.5, BASE, 1.5], [x, BASE / 2, s * 4.5]);
      box("pilotis", CONCRETE_DARK, [1.8, 0.3, 1.8], [x, 0.15, s * 4.5]);
    }
    // downstand edge beam
    box("beam", CONCRETE_LIGHT, [48.6, 0.7, 0.6], [0, BASE - 0.35, s * 6.7]);
  }
  for (let i = 0; i < 9; i++) box("beam", CONCRETE_LIGHT, [0.6, 0.6, 12], [-24 + i * 6, BASE - 0.3, 0]);

  // ---------- ground lobby ----------
  box("lobby", SHADOW, [14, 3.6, 7.4], [0, 1.8, 0]);
  box("lobby", GLASS, [10, 2.8, 0.15], [0, 1.5, 3.8]);
  box("lobby", FRAME, [0.2, 2.8, 0.2], [0, 1.5, 3.9]);
  box("lobby", FRAME, [10.2, 0.2, 0.2], [0, 2.95, 3.9]);
  for (const x of [-5, 5]) box("lobby", FRAME, [0.2, 2.8, 0.2], [x, 1.5, 3.9]);
  box("lobbyCanopy", CONCRETE_LIGHT, [9, 0.4, 3.2], [0, 3.6, 5.4]);
  box("lobbyCanopy", CONCRETE_DARK, [9, 0.5, 0.3], [0, 3.8, 6.9]);

  // ---------- main core mass ----------
  box("core", CONCRETE, [48, FLOORS * FH, 10], [0, BASE + (FLOORS * FH) / 2, 0]);
  boxP("endWall", endWallPaint, [0.3, FLOORS * FH - 1, 9], [-24.15, BASE + 12, 0]);
  boxP("endWall", endWallPaint, [0.3, FLOORS * FH - 1, 9], [24.15 - 0.0, BASE + 12, 0]);
  // end wall slits
  for (const s of [-1, 1])
    for (let k = 0; k < 4; k++) box("endSlit", SHADOW, [0.15, 1.8, 0.5], [s * 24.35, BASE + 3 + k * 6, 0]);

  // ---------- facade, both sides ----------
  for (const s of [1, -1]) {
    // fins
    for (let i = 0; i <= BAYS; i++) {
      const x = X0 + i * BAYW;
      boxP("fin", finPaint(i % 2 ? CONCRETE : CONCRETE_LIGHT), [0.4, FLOORS * FH, 2.2], [x, BASE + (FLOORS * FH) / 2, s * 6.1]);
    }
    for (let k = 0; k < FLOORS; k++) {
      const y0 = BASE + k * FH;
      // projecting floor slab + parapet
      box("slab", CONCRETE_LIGHT, [48.4, 0.35, 2.2], [0, y0 + 0.17, s * 6.1]);
      box("parapet", CONCRETE_DARK, [48.4, 0.95, 0.25], [0, y0 + 0.35 + 0.47, s * 7.1]);
      // soffit shadow line
      box("shadowLine", CONCRETE_STAIN, [48, 0.12, 0.1], [0, y0 + FH - 0.06, s * 5.05]);
      for (let i = 0; i < BAYS; i++) {
        const x = X0 + i * BAYW + BAYW / 2;
        box("glass", GLASS, [2.4, 1.5, 0.12], [x - 0.5, y0 + 1.95, s * 5.04]);
        box("mullion", FRAME, [0.1, 1.5, 0.14], [x - 0.5, y0 + 1.95, s * 5.06]);
        box("sill", CONCRETE_LIGHT, [2.6, 0.12, 0.3], [x - 0.5, y0 + 1.15, s * 5.15]);
        const col = INFILL[(i * 3 + k * 2 + (s > 0 ? 0 : 1)) % 5];
        box("infill", col, [0.95, 2.1, 0.12], [x + 1.2, y0 + 1.4, s * 5.05]);
        if ((i + k) % 3 === 0) box("door", SHADOW, [0.6, 1.7, 0.14], [x + 1.2, y0 + 1.25, s * 5.07]);
      }
    }
    // top fascia
    box("fascia", CONCRETE_DARK, [48.4, 1.1, 0.4], [0, TOP + 0.2, s * 7.1]);
  }

  // ---------- roof ----------
  boxP("roofSlab", roofPaint, [48.6, 0.5, 14.4], [0, TOP + 0.25, 0]);
  boxP("roofSlab", roofPaint, [48.6, 1.0, 0.4], [0, TOP + 1.0, -7.0]);
  boxP("roofSlab", roofPaint, [48.6, 1.0, 0.4], [0, TOP + 1.0, 7.0]);
  for (const s of [-1, 1]) boxP("roofSlab", roofPaint, [0.4, 1.0, 14.4], [s * 24.2, TOP + 1.0, 0]);
  // plant
  box("roofPlant", CONCRETE, [6, 2.6, 4], [-10, TOP + 1.8, 0]);
  box("roofPlant", CONCRETE_DARK, [6.4, 0.3, 4.4], [-10, TOP + 3.25, 0]);
  box("roofPlant", SHADOW, [1.4, 1.6, 0.1], [-10, TOP + 1.6, 2.05]);
  cyl("roofPlant", STEEL, 1.5, 2.6, [4, TOP + 1.8, -2], 12);
  cyl("roofPlant", CONCRETE_DARK, 1.6, 0.25, [4, TOP + 3.2, -2], 12);
  box("roofPlant", CONCRETE, [3, 2.0, 3], [14, TOP + 1.5, 1.5]);
  box("roofPlant", CONCRETE_DARK, [3.3, 0.25, 3.3], [14, TOP + 2.6, 1.5]);
  for (const x of [-18, -16.5, 8]) {
    cyl("chimney", CONCRETE_DARK, 0.45, 3.2, [x, TOP + 2.1, -3], 8);
    cyl("chimney", SHADOW, 0.3, 0.1, [x, TOP + 3.75, -3], 8);
  }
  for (let i = 0; i < 5; i++) box("roofLight", GLASS_LIGHT, [1.4, 0.5, 1.4], [18 + (i % 2) * 2.5 - 2, TOP + 0.75, -2.5 + i * 1.5 - 0]);

  // ---------- stair tower ----------
  box("tower", CONCRETE, [6, 32, 10], [27, 16, 0]);
  box("towerBase", CONCRETE_DARK, [6.4, 0.6, 10.4], [27, 0.3, 0]);
  for (const s of [1, -1]) {
    for (let k = 0; k < 10; k++) {
      box("towerSlit", GLASS, [0.7, 2.2, 0.12], [27, 2.2 + k * 3, s * 5.04]);
      box("towerSlit", FRAME, [0.95, 2.45, 0.1], [27, 2.2 + k * 3, s * 5.02]);
    }
    box("towerRib", CONCRETE_LIGHT, [0.5, 32, 0.5], [24.4, 16, s * 5.1]);
    box("towerRib", CONCRETE_LIGHT, [0.5, 32, 0.5], [29.6, 16, s * 5.1]);
  }
  for (let k = 0; k < 6; k++) box("towerSlit", SHADOW, [0.15, 3, 0.7], [30.05, 4 + k * 5, 0]);
  box("towerCap", CONCRETE_LIGHT, [7.4, 0.8, 11.4], [27, 32.4, 0]);
  box("towerCap", CONCRETE_DARK, [7.4, 0.6, 11.4], [27, 31.5, 0]);
  box("towerCap", CONCRETE, [4, 2, 5], [27, 33.8, 0]);
  box("towerCap", CONCRETE_DARK, [4.4, 0.3, 5.4], [27, 35, 0]);

  // service bridges linking tower to block at stair landings
  for (const k of [2, 5]) box("landing", CONCRETE_LIGHT, [1.5, 0.3, 4], [24.0, BASE + k * 3, 0]);

  // staining & weathering at feet
  for (const s of [1, -1]) box("stain", CONCRETE_STAIN, [48, 0.5, 0.1], [0, 0.35, s * 5.0]);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addHouseNumbers(b: Builder) {
  const NUM_BACK = SHADOW;
  const Z = 7.1; // canopy fascia front face (fascia at z=6.9, depth 0.3 -> front 7.05)

  // texture for numbers and street plate
  const numTex = svg(
    `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="240" height="80" fill="#2f2f31"/>
      <rect x="4" y="4" width="232" height="72" fill="none" stroke="#d8d2bf" stroke-width="3"/>
      <text x="120" y="60" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="bold" font-size="62" fill="#d8d2bf">1-48</text>
    </svg>`,
    { size: 512 },
  );
  const streetTex = svg(
    `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="48" fill="#d8d2bf"/>
      <rect x="3" y="3" width="234" height="42" fill="none" stroke="#2f2f31" stroke-width="2"/>
      <text x="120" y="33" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#2f2f31">CASTLE WALK</text>
    </svg>`,
    { size: 512 },
  );

  // numbers backing slab and face
  b.part(new THREE.BoxGeometry(4.6, 1.0, 0.12), NUM_BACK, { at: [0, 4.0, Z + 0.0], name: "numBack" });
  b.part(new THREE.PlaneGeometry(4.4, 0.8), "#ffffff", {
    at: [0, 4.0, Z + 0.07],
    dir: [0, 0, 1],
    axis: "z",
    texture: numTex,
    name: "numFace",
  });
  // raised relief slabs behind digits (cast look)
  b.part(new THREE.BoxGeometry(4.7, 0.06, 0.16), CONCRETE_LIGHT, { at: [0, 4.53, Z], name: "numFrameTop" });
  b.part(new THREE.BoxGeometry(4.7, 0.06, 0.16), CONCRETE_LIGHT, { at: [0, 3.47, Z], name: "numFrameBot" });

  // street plate on the canopy front edge below
  b.part(new THREE.BoxGeometry(2.4, 0.4, 0.06), SHADOW, { at: [-0.0, 3.55, 7.08], name: "streetBack" });
  b.part(new THREE.PlaneGeometry(2.3, 0.35), "#ffffff", {
    at: [0, 3.55, 7.12],
    dir: [0, 0, 1],
    axis: "z",
    texture: streetTex,
    name: "streetPlate",
  });
  for (const x of [-1.1, 1.1])
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), STEEL, {
      at: [x, 3.55, 7.13],
      dir: [0, 0, 1],
      name: "plateScrew",
    });

  // bolts on number plate corners
  for (const x of [-2.1, 2.1])
    for (const y of [3.65, 4.35])
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), STEEL, {
        at: [x, y, Z + 0.09],
        dir: [0, 0, 1],
        name: "numBolt",
      });

  // letterbox bank beside lobby door, on lobby front (z=3.7..3.8), to the right of door
  const lbX = 6.2, lbY = 1.4, lbZ = 3.78;
  b.part(new THREE.BoxGeometry(2.4, 1.3, 0.12), SHADOW, { at: [lbX, lbY, lbZ + 0.0], name: "letterRecess" });
  b.part(new THREE.BoxGeometry(2.5, 0.08, 0.2), CONCRETE_LIGHT, { at: [lbX, lbY + 0.69, lbZ + 0.03], name: "letterHead" });
  b.part(new THREE.BoxGeometry(2.5, 0.08, 0.2), CONCRETE_LIGHT, { at: [lbX, lbY - 0.69, lbZ + 0.03], name: "letterSill" });
  const cols = 6, rows = 3;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const x = lbX - 1.0 + c * 0.4;
      const y = lbY + 0.4 - r * 0.4;
      b.part(new THREE.BoxGeometry(0.34, 0.3, 0.06), STEEL, { at: [x, y, lbZ + 0.08], name: "letterbox" });
      b.part(new THREE.BoxGeometry(0.2, 0.02, 0.03), FRAME, { at: [x, y + 0.05, lbZ + 0.12], name: "slot" });
      b.part(new THREE.BoxGeometry(0.1, 0.05, 0.03), BONE, { at: [x, y - 0.08, lbZ + 0.12], name: "nameTag" });
    }
}
    return addHouseNumbers;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addLobbyFurniture(b: Builder) {
  const R = rng(22);
  const PLANTER = paint((p, n) => {
    const g = noise(p, 0.12, 4);
    const base = mix(CONCRETE, CONCRETE_DARK, g * 0.7);
    return mix(base, CONCRETE_STAIN, smoothstep(0.4, -0.5, n.y) * 0.25 + smoothstep(0.7, 0.0, p.y) * 0.3);
  });
  const WOODC = "#8b6a43";
  const GARMENTS = [RUST, OCHRE, TEAL, BONE, "#b04a5a"];

  const box = (name: string, color: any, s: [number, number, number], at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { at, name });
  const cyl = (name: string, color: any, r: number, h: number, at: [number, number, number], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, name });
  const rod = (name: string, color: string, a: [number, number, number], c: [number, number, number], r: number) =>
    b.rod(a, c, r, color, { name, sides: 4 } as any);

  const leaf = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 31 C4 22 4 8 16 1 C28 8 28 22 16 31Z" fill="#6b6e3a" stroke="#3c4020" stroke-width="2"/><path d="M16 29 L16 6" stroke="#9aa05a" stroke-width="2"/></svg>`,
    { size: 64 },
  );

  // ---------- forecourt (z ~ 8, y near 0) ----------
  // planters
  for (const s of [-1, 1]) {
    const x = s * 5.2;
    b.part(new THREE.BoxGeometry(2.2, 0.9, 1.2), PLANTER, { at: [x, 0.45, 8], name: "planter" });
    box("planterRim", CONCRETE_LIGHT, [2.4, 0.12, 1.4], [x, 0.94, 8]);
    box("soil", "#3b2d22", [2.0, 0.06, 1.0], [x, 0.99, 8]);
    for (let i = 0; i < 4; i++) {
      const sx = x + (i - 1.5) * 0.45;
      b.part(new THREE.IcosahedronGeometry(0.4 + R() * 0.12, 0), OLIVE, {
        at: [sx, 1.35 + R() * 0.15, 8 + (R() - 0.5) * 0.3],
        name: "shrub",
        flat: true,
      });
    }
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 7; i++) pts.push([x + (R() - 0.5) * 1.8, 1.55 + R() * 0.2, 8.45 + R() * 0.15]);
    b.cards(
      pts.map((p) => ({ at: new THREE.Vector3(...p), axis: new THREE.Vector3(0, 1, 0) }) as any),
      leaf,
      { size: 0.3, lean: 20, flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(3 + s) },
    );
  }

  // bench
  box("benchSeat", WOODC, [2.2, 0.08, 0.5], [0, 0.46, 8.6]);
  box("benchSeat", "#755936", [2.2, 0.08, 0.14], [0, 0.78, 8.95]);
  box("benchBack", WOODC, [2.2, 0.08, 0.14], [0, 0.9, 8.95]);
  for (const x of [-0.95, 0.95]) {
    box("benchLeg", CONCRETE_DARK, [0.14, 0.46, 0.5], [x, 0.23, 8.6]);
    box("benchLeg", CONCRETE_DARK, [0.1, 0.5, 0.1], [x, 0.7, 8.95]);
  }

  // bollards
  for (let i = 0; i < 6; i++) {
    const x = -3 + i * 1.2;
    if (Math.abs(x) < 0.7) continue;
    cyl("bollard", CONCRETE, 0.13, 0.8, [x, 0.4, 9.6], 8);
    cyl("bollardCap", OCHRE, 0.14, 0.08, [x, 0.76, 9.6], 8);
  }

  // bike rack
  const rackX = 3.2;
  for (let i = 0; i < 4; i++) {
    const x = rackX + i * 0.5;
    rod("rackLoop", STEEL, [x, 0, 9.2], [x, 0.7, 9.2], 0.02);
    rod("rackLoop", STEEL, [x, 0.7, 9.2], [x, 0.7, 9.6], 0.02);
    rod("rackLoop", STEEL, [x, 0.7, 9.6], [x, 0, 9.6], 0.02);
  }
  rod("rackBar", STEEL, [rackX - 0.1, 0.06, 9.2], [rackX + 1.6, 0.06, 9.2], 0.02);

  // lamp
  cyl("lampPost", FRAME, 0.04, 2.6, [-3.4, 1.3, 9.2], 6);
  b.part(new THREE.BoxGeometry(0.3, 0.14, 0.3), LAMP, { at: [-3.4, 2.65, 9.2], name: "lampHead" });

  // ---------- balcony life: floors 3..6, x -20..-8, front z ~ 6.3 ----------
  const fz = 6.2;
  for (const k of [2, 3, 4, 5]) {
    const y0 = 4 + k * 3 + 0.35;
    // slim railing atop parapet
    const xa = -20, xb = -8;
    rod("rail", STEEL, [xa, y0 + 1.25, 7.1], [xb, y0 + 1.25, 7.1], 0.02);
    for (let i = 0; i <= 12; i++) rod("baluster", STEEL, [xa + i, y0 + 0.95, 7.1], [xa + i, y0 + 1.25, 7.1], 0.012);
    // pot plants
    for (let i = 0; i < 3; i++) {
      const x = -19 + i * 4 + (k % 2) * 1.5 + R();
      cyl("pot", RUST, 0.16, 0.28, [x, y0 + 0.14, 6.4], 6);
      b.part(new THREE.IcosahedronGeometry(0.22, 0), OLIVE, { at: [x, y0 + 0.45, 6.4], name: "plant", flat: true });
    }
    // chair on some floors
    if (k % 2 === 0) {
      const cx = -12.5;
      box("chair", WOODC, [0.45, 0.05, 0.45], [cx, y0 + 0.45, 6.4]);
      box("chair", WOODC, [0.45, 0.5, 0.05], [cx, y0 + 0.7, 6.2]);
      for (const dx of [-0.2, 0.2]) for (const dz of [-0.2, 0.2])
        box("chairLeg", FRAME, [0.04, 0.45, 0.04], [cx + dx, y0 + 0.22, 6.4 + dz]);
    }
    // washing line with garments
    if (k % 2 === 1) {
      const ya = y0 + 2.0;
      rod("line", BONE, [-18.5, ya, 6.3], [-14, ya - 0.05, 6.3], 0.008);
      for (let i = 0; i < 5; i++) {
        const gx = -18 + i * 0.85;
        box("garment", GARMENTS[(i + k) % 5], [0.4, 0.5 - (i % 2) * 0.15, 0.03], [gx, ya - 0.3, 6.3]);
      }
    }
  }
  // satellite dishes
  for (const [x, k] of [[-9.5, 5], [-17.5, 3], [-11, 2]] as [number, number][]) {
    const y = 4 + k * 3 + 2.2;
    b.part(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), BONE, {
      at: [x, y, 6.45], dir: [0, 0.3, 1], axis: "y", name: "dish",
    });
    rod("dishArm", STEEL, [x, y - 0.2, 6.2], [x, y, 6.45], 0.015);
  }
}
    return addLobbyFurniture;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addEndWallPipes(b: Builder) {
  const box = (name: string, color: string, size: [number, number, number], at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, name });
  const cyl = (name: string, color: string, r: number, h: number, at: [number, number, number], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, name });

  // ================= WEST END WALL SERVICES =================
  const WX = -24.45; // just proud of the end wall face (wall face at ~ -24.3)
  const yLo = 4.6, yHi = 27.4;
  const h = yHi - yLo, yc = (yHi + yLo) / 2;

  // vertical downpipes with clips and elbows at the base
  for (const z of [-3.2, -2.7, 3.0]) {
    cyl("downpipe", STEEL, 0.1, h, [WX - 0.1, yc, z], 8);
    for (let y = yLo + 1; y < yHi; y += 2.6) {
      box("pipeClip", FRAME, [0.1, 0.14, 0.3], [WX - 0.04, y, z]);
    }
    cyl("pipeShoe", FRAME, 0.15, 0.25, [WX - 0.1, yLo + 0.1, z], 8);
    // elbow kick-out near base
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), STEEL, {
      at: [WX - 0.3, yLo - 0.1, z],
      rotation: [0, 0, 90],
      name: "pipeElbow",
    });
  }

  // top hopper heads
  for (const z of [-3.2, -2.7, 3.0]) {
    box("hopper", STEEL, [0.35, 0.4, 0.4], [WX - 0.12, yHi + 0.1, z]);
    box("hopperLip", FRAME, [0.4, 0.06, 0.45], [WX - 0.12, yHi + 0.32, z]);
  }

  // bundled cable run: horizontal trunk then vertical, with clips
  const cableCols = [FRAME, SHADOW, STEEL];
  for (let i = 0; i < 3; i++) {
    cyl("cable", cableCols[i], 0.04, h * 0.8, [WX - 0.06 - (i % 2) * 0.03, yLo + h * 0.4 + 0.6, 0.9 + i * 0.07], 6);
  }
  for (let y = yLo + 1.2; y < yLo + h * 0.8; y += 1.5) {
    box("cableClip", FRAME, [0.1, 0.1, 0.4], [WX - 0.05, y, 1.0]);
  }
  // horizontal branch
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6), cableCols[i], {
      at: [WX - 0.07, 9.8 + i * 0.07, 0.1],
      rotation: [90, 0, 0],
      name: "cableBranch",
    });
  }
  box("junctionBox", STEEL, [0.25, 0.5, 0.4], [WX - 0.12, 9.8, -1.1]);
  box("junctionLid", FRAME, [0.06, 0.4, 0.3], [WX - 0.27, 9.8, -1.1]);

  // two rectangular vent grilles
  for (const y of [14.5, 21.5]) {
    box("ventFrame", FRAME, [0.18, 0.9, 1.5], [WX - 0.06, y, -0.2]);
    box("ventBack", SHADOW, [0.2, 0.7, 1.3], [WX - 0.07, y, -0.2]);
    for (let i = 0; i < 5; i++) {
      box("ventSlat", STEEL, [0.1, 0.05, 1.3], [WX - 0.18, y - 0.28 + i * 0.14, -0.2]);
    }
    box("ventHood", CONCRETE_DARK, [0.3, 0.08, 1.7], [WX - 0.15, y + 0.5, -0.2]);
  }

  // fire-escape signage plate
  box("signBack", FRAME, [0.08, 1.0, 1.4], [WX - 0.03, 17.6, -1.6]);
  box("signFace", BONE, [0.05, 0.8, 1.2], [WX - 0.08, 17.6, -1.6]);
  box("signArrow", RUST, [0.04, 0.12, 0.8], [WX - 0.11, 17.6, -1.6]);
  box("signHead", RUST, [0.04, 0.3, 0.2], [WX - 0.11, 17.6, -1.15]);
  box("signFigure", RUST, [0.04, 0.4, 0.14], [WX - 0.11, 17.75, -2.0]);

  // ================= ROOF PLANT DETAILS =================
  const TOPY = 28; // roof level
  const RY = TOPY + 0.5; // roof slab top
  // safety railing along inner edge of parapet (north & south, west end)
  for (const z of [-6.5, 6.5]) {
    for (let x = -23.5; x <= -0.5; x += 2.3) {
      cyl("railPost", STEEL, 0.035, 1.1, [x, RY + 0.55, z], 6);
    }
    box("railTop", STEEL, [23, 0.05, 0.05], [-12, RY + 1.1, z]);
    box("railMid", STEEL, [23, 0.04, 0.04], [-12, RY + 0.6, z]);
  }
  for (let z = -6; z <= 6; z += 3) cyl("railPost", STEEL, 0.035, 1.1, [-23.5, RY + 0.55, z], 6);
  box("railTop", STEEL, [0.05, 0.05, 13], [-23.5, RY + 1.1, 0]);

  // water tank ladder (cylindrical tank at x=4,z=-2; r=1.5)
  const lx = 4, lz = -2 + 1.62;
  box("ladderRail", STEEL, [0.05, 2.6, 0.05], [lx - 0.25, RY + 1.3, lz]);
  box("ladderRail", STEEL, [0.05, 2.6, 0.05], [lx + 0.25, RY + 1.3, lz]);
  for (let i = 0; i < 8; i++) box("ladderRung", STEEL, [0.5, 0.04, 0.04], [lx, RY + 0.25 + i * 0.32, lz]);
  box("tankBand", FRAME, [3.2, 0.1, 3.2], [4, RY + 1.0, -2]);
  box("tankBand", FRAME, [3.2, 0.1, 3.2], [4, RY + 2.0, -2]);

  // aerial masts with guy wires on plant house roof
  const roofTopY = TOPY + 3.4;
  const mastBase: [number, number][] = [[-12, -1], [-8.5, 1]];
  const mastH = [4.2, 3.2];
  mastBase.forEach(([x, z], i) => {
    cyl("mast", STEEL, 0.05, mastH[i], [x, roofTopY + mastH[i] / 2, z], 6);
    // crossbars
    box("aerialBar", STEEL, [1.2, 0.04, 0.04], [x, roofTopY + mastH[i] - 0.3, z]);
    box("aerialBar", STEEL, [0.9, 0.04, 0.04], [x, roofTopY + mastH[i] - 0.7, z]);
    box("aerialBar", STEEL, [0.6, 0.04, 0.04], [x, roofTopY + mastH[i] - 1.1, z]);
    // guy wires to roof corners
    const tip = new THREE.Vector3(x, roofTopY + mastH[i] - 1.4, z);
    const anchors = [[x - 2.4, roofTopY, z - 1.6], [x + 2.4, roofTopY, z - 1.6], [x, roofTopY, z + 1.9]];
    for (const a of anchors) {
      const end = new THREE.Vector3(a[0], a[1], a[2]);
      b.rod(tip, end, 0.012, FRAME, { name: "guyWire" });
    }
  });

  // pipework & ducting elbows on the plant house roof
  cyl("pipeRun", STEEL, 0.12, 3.6, [-12.2, roofTopY + 0.25, 1.3], 8).mesh.rotation.z = Math.PI / 2;
  cyl("pipeElbow", STEEL, 0.14, 0.5, [-14.1, roofTopY + 0.45, 1.3], 8);
  cyl("pipeRise", STEEL, 0.12, 1.0, [-14.1, roofTopY + 0.8, 1.3], 8);
  cyl("pipeFlange", FRAME, 0.2, 0.08, [-14.1, roofTopY + 0.3, 1.3], 8);
  cyl("pipeFlange", FRAME, 0.2, 0.08, [-10.5, roofTopY + 0.25, 1.3], 8).mesh.rotation.z = Math.PI / 2;
  // rectangular duct with bend
  box("duct", STEEL, [2.4, 0.5, 0.6], [-8.5, roofTopY + 0.3, -1.7]);
  box("ductBend", STEEL, [0.6, 1.2, 0.6], [-7.0, roofTopY + 0.6, -1.7]);
  box("ductCap", FRAME, [0.75, 0.1, 0.75], [-7.0, roofTopY + 1.25, -1.7]);
  box("ductBand", FRAME, [0.1, 0.55, 0.65], [-9.0, roofTopY + 0.3, -1.7]);
  box("ductBand", FRAME, [0.1, 0.55, 0.65], [-8.0, roofTopY + 0.3, -1.7]);
  // vent cowl and warning plate on plant house
  cyl("cowl", STEEL, 0.35, 0.5, [-11.5, roofTopY + 0.5, -1.0], 8);
  cyl("cowlCap", FRAME, 0.45, 0.08, [-11.5, roofTopY + 0.8, -1.0], 8);
}
    return addEndWallPipes;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addTowerSlits(b: Builder) {
  // Wired-glass texture: reflective pane with wire mesh and sky gradient
  const WIRED = svg(
    `<svg viewBox="0 0 32 128" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9fb8c0"/><stop offset="0.5" stop-color="#6f8a93"/><stop offset="1" stop-color="#4c666e"/>
      </linearGradient></defs>
      <rect width="32" height="128" fill="url(#g)"/>
      <path d="M0 0 L32 32 M0 32 L32 64 M0 64 L32 96 M0 96 L32 128 M32 0 L0 32 M32 32 L0 64 M32 64 L0 96 M32 96 L0 128" stroke="#2c3a40" stroke-width="0.9" opacity="0.55"/>
      <path d="M6 4 L10 4 L4 60 L0 60Z M22 70 L27 70 L20 124 L15 124Z" fill="#ffffff" opacity="0.28"/>
    </svg>`,
    { size: 128 },
  );

  const paneGeo = new THREE.PlaneGeometry(0.6, 2.05);
  const barGeo = new THREE.BoxGeometry(0.08, 2.3, 0.06);
  const transGeo = new THREE.BoxGeometry(0.88, 0.07, 0.07);
  const sillGeo = new THREE.BoxGeometry(1.1, 0.1, 0.22);
  const headGeo = new THREE.BoxGeometry(1.05, 0.08, 0.12);

  for (const s of [1, -1]) {
    const z = s * 5.0;
    const dirOut: [number, number, number] = [0, 0, s];
    for (let k = 0; k < 10; k++) {
      const y = 2.2 + k * 3;
      // reflective wired pane
      b.part(paneGeo, "#ffffff", {
        at: [27, y, z + s * 0.1],
        dir: dirOut,
        axis: "z",
        texture: WIRED,
        name: "towerPane",
      });
      // vertical frame bars
      for (const dx of [-0.42, 0.42]) {
        b.part(barGeo, FRAME, { at: [27 + dx, y, z + s * 0.09], name: "towerFrame" });
      }
      // mid mullion
      b.part(new THREE.BoxGeometry(0.05, 2.1, 0.05), FRAME, { at: [27, y, z + s * 0.14], name: "towerMullion" });
      // transoms (top, middle, bottom)
      for (const dy of [-1.1, 0, 1.1]) {
        b.part(transGeo, FRAME, { at: [27, y + dy, z + s * 0.1], name: "towerTransom" });
      }
      // projecting sill and drip head
      b.part(sillGeo, CONCRETE_LIGHT, { at: [27, y - 1.25, z + s * 0.1], name: "towerSill" });
      b.part(headGeo, CONCRETE_DARK, { at: [27, y + 1.22, z + s * 0.08], name: "towerHead" });
      // rain streak below sill
      b.part(new THREE.BoxGeometry(0.5, 0.5, 0.02), CONCRETE_STAIN, {
        at: [27, y - 1.55, z + s * 0.03],
        name: "towerStain",
      });
    }
  }
}
    return addTowerSlits;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addTowerCrown(b: Builder) {
  const RED = "#e0262a";
  const box = (c: string, s: [number, number, number], at: [number, number, number], name: string) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, name });
  const cyl = (c: string, r: number, h: number, at: [number, number, number], seg = 8, name = "s25cyl") =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, name });

  // ---------- tower crown (motor room sits at y 32.8..34.8, top at 35.15) ----------
  const louvre = svg(
    `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#26272a"/>` +
      Array.from({ length: 9 }, (_, i) => `<rect x="3" y="${3 + i * 5}" width="58" height="2.6" fill="#7b8086"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(2.6, 1.5), "#ffffff", {
      at: [27, 33.8, s * 2.53],
      dir: [0, 0, s],
      axis: "z",
      texture: louvre,
      name: "s25louvre",
    });
    box(FRAME, [2.9, 0.12, 0.1], [27, 34.6, s * 2.52], "s25louvreFrame");
    box(FRAME, [2.9, 0.12, 0.1], [27, 33.0, s * 2.52], "s25louvreFrame");
  }
  for (const s of [1, -1]) box(FRAME, [0.1, 1.7, 0.1], [27 + s * 1.4, 33.8, 2.52], "s25louvreFrame");
  // parapet kerb on cap
  for (const s of [1, -1]) {
    box(CONCRETE_LIGHT, [4.6, 0.3, 0.2], [27, 35.3, s * 2.5], "s25kerb");
    box(CONCRETE_LIGHT, [0.2, 0.3, 5.2], [27 + s * 2.3, 35.3, 0], "s25kerb");
  }
  // warning lamp (glowing)
  cyl(STEEL, 0.28, 0.2, [25.6, 35.4, 1.6], 8, "s25lampBase");
  const lamp = b.part(new THREE.SphereGeometry(0.22, 8, 6), RED, { at: [25.6, 35.62, 1.6], name: "s25warnLamp" });
  const m = lamp.mesh.material as THREE.MeshStandardMaterial;
  const mc = m.clone();
  mc.emissive = new THREE.Color(RED);
  mc.emissiveIntensity = 2;
  lamp.mesh.material = mc;
  // lightning rod
  cyl(STEEL, 0.05, 3, [28.8, 36.8, -1.6], 6, "s25rod");
  b.part(new THREE.SphereGeometry(0.1, 6, 4), STEEL, { at: [28.8, 38.35, -1.6], name: "s25rodTip" });
  box(STEEL, [0.4, 0.15, 0.4], [28.8, 35.4, -1.6], "s25rodBase");
  // flagpole + flag
  cyl(STEEL, 0.045, 4, [25.4, 37.3, -1.6], 6, "s25pole");
  box(RUST, [1.1, 0.7, 0.04], [26.0, 38.9, -1.6], "s25flag");
  box(OCHRE, [1.1, 0.18, 0.05], [26.0, 38.9, -1.6], "s25flagStripe");
  for (const y of [36.0, 37.2]) box(STEEL, [0.08, 0.08, 0.3], [25.4, y, -1.6], "s25stay");

  // ---------- soffit lighting & columns under first floor slab ----------
  const lampMat = new THREE.MeshStandardMaterial({ color: LAMP, emissive: new THREE.Color(LAMP), emissiveIntensity: 1.5 });
  for (const s of [1, -1]) {
    // conduit runs along beam
    b.part(new THREE.BoxGeometry(46, 0.08, 0.1), STEEL, { at: [0, 3.2, s * 6.35], name: "s25conduit" });
    for (let i = 0; i < 16; i++) {
      const x = -22.5 + i * 3;
      const z = s * 6.35;
      const cage = cyl(FRAME, 0.2, 0.14, [x, 3.33, z], 8, "s25lampCage");
      const bulb = b.part(new THREE.SphereGeometry(0.14, 6, 4), LAMP, { at: [x, 3.2, z], name: "s25bulb" });
      bulb.mesh.material = lampMat;
      void cage;
      box(STEEL, [0.04, 0.14, 0.04], [x, 3.0 + 0.0, z], "s25cageBar");
    }
  }
  // lamps down the centre beams
  for (let i = 0; i < 8; i++) {
    const x = -21 + i * 6;
    const bulb = b.part(new THREE.SphereGeometry(0.15, 6, 4), LAMP, { at: [x, 3.5, 0], name: "s25bulb" });
    bulb.mesh.material = lampMat;
    cyl(FRAME, 0.22, 0.1, [x, 3.7, 0], 8, "s25lampCage");
  }
  // painted numbers on three columns
  const numTex = (n: string, col: string) =>
    svg(
      `<svg viewBox="0 0 48 64"><rect width="48" height="64" rx="3" fill="${SHADOW}"/><text x="24" y="50" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="48" fill="${col}">${n}</text></svg>`,
      { size: 96 },
    );
  const cols: [number, string, string][] = [[-12, "1", BONE], [0, "2", OCHRE], [12, "3", RUST]];
  for (const [x, n, c] of cols) {
    b.part(new THREE.PlaneGeometry(1.1, 1.4), "#ffffff", {
      at: [x, 1.6, 5.27],
      dir: [0, 0, 1],
      axis: "z",
      texture: numTex(n, c),
      name: "s25colNum",
    });
  }
}
    return addTowerCrown;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addWindowBlinds(b: Builder) {
  const r = rng(26);
  const CURT_O = "#c9922f";
  const CURT_T = "#3f7a72";
  const WARM = "#ffd98a";
  const BLIND = "#d8d2bf";

  const blindTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#ffffff"/>` +
      Array.from({ length: 8 }, (_, i) => `<rect x="0" y="${i * 4 + 3}" width="32" height="1" fill="#a8a392"/>`).join("") +
      `<rect x="0" y="30" width="32" height="2" fill="#7d7968"/><rect x="14" y="26" width="4" height="4" fill="#5a5648"/></svg>`,
    { size: 64 },
  );
  const curtTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#ffffff"/>` +
      Array.from({ length: 8 }, (_, i) => `<rect x="${i * 4}" y="0" width="1.6" height="32" fill="#9a9a9a"/>`).join("") +
      `</svg>`,
    { size: 64 },
  );

  // Front facade (s = +1) windows: x = X0 + i*4 + 2 - 0.5, y = y0 + 1.95, z = 5.04; size 2.4 x 1.5
  const BASE_ = 4, FH_ = 3;
  let parts = 0;
  for (let k = 1; k < 7; k++) {
    for (let i = 6; i < 12; i++) {
      if (parts > 62) break;
      const x = -24 + i * 4 + 2 - 0.5;
      const y = BASE_ + k * FH_ + 1.95;
      const z = 5.12;
      const roll = r();
      if (roll < 0.28) {
        // roller blind, half drawn from the top
        const h = 0.55 + r() * 0.5;
        b.part(new THREE.PlaneGeometry(2.3, h), BLIND, {
          at: [x, y + 0.75 - h / 2, z],
          dir: [0, 0, 1],
          axis: "z",
          texture: blindTex,
        });
        parts++;
        b.part(new THREE.BoxGeometry(2.4, 0.08, 0.1), "#7d7968", { at: [x, y + 0.72, z + 0.02] });
        parts++;
      } else if (roll < 0.55) {
        const c = roll < 0.4 ? CURT_O : CURT_T;
        for (const s of [-1, 1]) {
          b.part(new THREE.PlaneGeometry(0.75, 1.4), c, {
            at: [x + s * 0.8, y, z],
            dir: [0, 0, 1],
            axis: "z",
            texture: curtTex,
          });
          parts++;
        }
        b.part(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 6), "#26272a", {
          at: [x, y + 0.72, z + 0.03],
          dir: [1, 0, 0],
        });
        parts++;
      } else if (roll < 0.72) {
        glow(
          b.part(new THREE.PlaneGeometry(2.3, 1.4), WARM, { at: [x, y, z - 0.01], dir: [0, 0, 1], axis: "z" }),
          1.3,
        );
        parts++;
        b.part(new THREE.BoxGeometry(0.1, 1.4, 0.05), "#26272a", { at: [x, y, z + 0.01] });
        parts++;
      }
    }
  }

  // ---- Lobby door assembly ----
  const dz = 3.95;
  const FR = "#26272a";
  const ST = "#7b8086";
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(1.1, 2.5, 0.06), "#6f8a93", { at: [s * 0.56, 1.4, dz + 0.1] });
    b.part(new THREE.BoxGeometry(1.2, 0.08, 0.1), FR, { at: [s * 0.56, 2.68, dz + 0.1] });
    b.part(new THREE.BoxGeometry(1.2, 0.08, 0.1), FR, { at: [s * 0.56, 0.15, dz + 0.1] });
    b.part(new THREE.BoxGeometry(0.06, 2.5, 0.1), FR, { at: [s * 1.12, 1.4, dz + 0.1] });
    // pull handle
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), ST, { at: [s * 0.14, 1.3, dz + 0.22] });
    for (const yy of [0.9, 1.7]) b.part(new THREE.BoxGeometry(0.04, 0.04, 0.12), ST, { at: [s * 0.14, yy, dz + 0.16] });
  }
  b.part(new THREE.BoxGeometry(0.06, 2.6, 0.12), FR, { at: [0, 1.4, dz + 0.1] });
  // door frame head
  b.part(new THREE.BoxGeometry(2.5, 0.2, 0.2), FR, { at: [0, 2.78, dz + 0.1] });

  // intercom panel
  b.part(new THREE.BoxGeometry(0.34, 0.6, 0.08), ST, { at: [1.75, 1.45, dz + 0.1] });
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 2; i++)
      b.part(new THREE.BoxGeometry(0.07, 0.06, 0.04), j === 0 && i === 0 ? WARM : "#d8d2bf", {
        at: [1.68 + i * 0.14, 1.65 - j * 0.1, dz + 0.16],
      });
  glow(b.part(new THREE.BoxGeometry(0.2, 0.05, 0.02), "#ffd98a", { at: [1.75, 1.2, dz + 0.15] }), 1.2);

  // lamp above the door
  b.part(new THREE.BoxGeometry(0.5, 0.1, 0.1), ST, { at: [0, 3.15, dz + 0.1] });
  glow(b.part(new THREE.SphereGeometry(0.14, 8, 6), WARM, { at: [0, 3.05, dz + 0.25] }), 1.8);
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8), FR, { at: [0, 2.92, dz + 0.25] });
}
    return addWindowBlinds;
  })(),
);
