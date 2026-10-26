```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

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
      box("pilotis", CONCRETE, [1.5, BASE, 1.5], [x, BASE / 2, s * 4.5]);
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
  box("endWall", CONCRETE_LIGHT, [0.3, FLOORS * FH - 1, 9], [-24.15, BASE + 12, 0]);
  box("endWall", CONCRETE_LIGHT, [0.3, FLOORS * FH - 1, 9], [24.15 - 0.0, BASE + 12, 0]);
  // end wall slits
  for (const s of [-1, 1])
    for (let k = 0; k < 4; k++) box("endSlit", SHADOW, [0.15, 1.8, 0.5], [s * 24.35, BASE + 3 + k * 6, 0]);

  // ---------- facade, both sides ----------
  for (const s of [1, -1]) {
    // fins
    for (let i = 0; i <= BAYS; i++) {
      const x = X0 + i * BAYW;
      box("fin", i % 2 ? CONCRETE : CONCRETE_LIGHT, [0.4, FLOORS * FH, 2.2], [x, BASE + (FLOORS * FH) / 2, s * 6.1]);
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
  box("roofSlab", CONCRETE_LIGHT, [48.6, 0.5, 14.4], [0, TOP + 0.25, 0]);
  box("roofSlab", CONCRETE_DARK, [48.6, 1.0, 0.4], [0, TOP + 1.0, -7.0]);
  box("roofSlab", CONCRETE_DARK, [48.6, 1.0, 0.4], [0, TOP + 1.0, 7.0]);
  for (const s of [-1, 1]) box("roofSlab", CONCRETE_DARK, [0.4, 1.0, 14.4], [s * 24.2, TOP + 1.0, 0]);
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
```