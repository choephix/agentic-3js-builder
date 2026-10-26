import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

export const meta = {
  name: "Dutch windmill",
  description:
    "A chunky, Animal Crossing style Dutch windmill: an octagonal cream tower on a red brick band, a gallery with railing, a round red cap, four lattice sails and a tail pole. Flat pastel colours.",
};

// Palette (stage 2 can use these by name)
export const PLASTER = "#fff0d4";
export const BRICK = "#d9805f";
export const BRICK_DARK = "#b9644a";
export const ROOF = "#e2634e";
export const ROOF_DARK = "#bd4a3c";
export const TRIM = "#fff8ea";
export const WOOD = "#b98550";
export const WOOD_DARK = "#8a5a34";
export const STONE = "#c4baa8";
export const GLASS = "#9fd8e6";
export const SHUTTER = "#62b184";
export const DOOR = "#4f9fb5";
export const SAIL = "#fff6e2";
export const LATTICE = "#a8733f";
export const BRASS = "#f0c15a";

export const REQUESTS = [
  {
    id: "doorKnocker",
    kind: "add",
    part: "door",
    what: "Details for the arched front door: a brass ring knocker with a small backplate, a round brass handle, three iron-look hinge straps in WOOD_DARK across the door, and a small hanging name sign in WOOD with a TRIM border.",
    at: [0, 1.2, 2.45],
    normal: [0, 0.12, 1],
    bone: null,
    room: [1.1, 1.8, 0.4],
  },
  {
    id: "windowFlowerBoxes",
    kind: "add",
    part: "windowFront",
    what: "A wooden flower box under the front upper window (WOOD with WOOD_DARK slats), packed with round pastel blooms in pink, yellow and lavender and leafy green tufts. Echo smaller boxes under the two side windows.",
    at: [0, 3.55, 1.98],
    normal: [0, 0.12, 1],
    bone: null,
    room: [1.3, 0.45, 0.55],
  },
  {
    id: "galleryLanterns",
    kind: "add",
    part: "galleryRail",
    what: "Two cosy hanging lanterns on short posts at the front corners of the gallery rail: BRASS cage, warm glowing yellow glass, little cone caps in ROOF. Glowing.",
    at: [2.2, 3.1, 2.4],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 0.8, 0.5],
  },
  {
    id: "sailPennants",
    kind: "add",
    part: "sailLattice",
    what: "Small swallow-tail pennants in ROOF, BRASS and DOOR colours tied to the tip of each of the four sails, flat shapes with a thin pole each. This is the upper-right sail tip; repeat on the other three tips (centred on the hub at [0,7.2,2.35], 5 m out on the diagonals).",
    at: [3.54, 10.74, 2.4],
    normal: [0.7, 0.7, 0],
    bone: null,
    room: [0.7, 0.7, 0.5],
  },
  {
    id: "weathervane",
    kind: "add",
    part: "capRoof",
    what: "A cute weathervane on the cap finial: thin iron-look rod, crossed N/E/S/W arms with tiny balls, and a little rooster or arrow in BRASS on top.",
    at: [0, 7.95, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 1.3, 0.9],
  },
  {
    id: "doorstepProps",
    kind: "add",
    part: "plinth",
    what: "Right of the front steps: two wooden barrels with WOOD_DARK hoops and a stack of three flour sacks tied with string in PLASTER and STONE colours, one sack leaning on the wall.",
    at: [1.9, 0.35, 3.0],
    normal: [0, 1, 0],
    bone: null,
    room: [1.4, 1.1, 1.2],
  },
  {
    id: "flowerBed",
    kind: "add",
    part: "plinth",
    what: "A tidy low flower bed left of the steps: a rounded earth mound, a ring of small stones, and a dozen round blooms (pink, yellow, white, lavender) with green leaves.",
    at: [-1.9, 0.35, 2.9],
    normal: [0, 1, 0],
    bone: null,
    room: [1.5, 0.5, 1.0],
  },
  {
    id: "tailWheel",
    kind: "add",
    part: "tailWinch",
    what: "A coil of rope around the tail pole winch, four wooden handle spokes with round knobs, and a short chain hanging to the ground.",
    at: [0, 1.2, -6.4],
    normal: [1, 0, 0],
    bone: null,
    room: [1.2, 1.3, 1.2],
  },
  {
    id: "hubStar",
    kind: "add",
    part: "hubNose",
    what: "A cheerful star-shaped brass emblem on the front of the red hub nose cone with a small round centre button.",
    at: [0, 7.2, 3.0],
    normal: [0, 0, 1],
    bone: null,
    room: [0.6, 0.6, 0.4],
  },
  {
    id: "galleryBunting",
    kind: "add",
    part: "galleryRail",
    what: "A sagging string of triangular bunting flags along the left side of the gallery rail in ROOF, BRASS, SHUTTER, DOOR and TRIM colours.",
    at: [3.1, 3.0, 0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.5, 0.6, 3.0],
  },
  {
    id: "capVents",
    kind: "add",
    part: "capRoof",
    what: "A small round attic hatch window on the front of the cap with a trim ring and a little wooden hood above it.",
    at: [0, 6.95, 1.75],
    normal: [0, 0.3, 1],
    bone: null,
    room: [0.8, 0.8, 0.4],
  },
  {
    id: "towerWall",
    kind: "texture",
    part: "towerWall",
    what: "Soft plaster for the octagonal tower in PLASTER with faint warm speckles, plus thin WOOD timber vertical strips along the eight corner edges and a few faded cream blotches.",
  },
  {
    id: "brickBand",
    kind: "texture",
    part: "brickBand",
    what: "Cute chunky bricks in BRICK with BRICK_DARK mortar lines and a few lighter and darker bricks, running in even courses.",
  },
  {
    id: "capRoof",
    kind: "texture",
    part: "capRoof",
    what: "Rounded shingle rows in ROOF with ROOF_DARK edges, slightly lighter near the top.",
  },
  {
    id: "sailCloth",
    kind: "texture",
    part: "sailCloth",
    what: "Patchwork sail canvas in SAIL with two or three slightly warmer patches, stitched seams and a soft red stripe near the outer edge.",
  },
  {
    id: "plinth",
    kind: "texture",
    part: "plinth",
    what: "Rounded cobblestones in STONE shades with gaps between them.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const D2R = Math.PI / 180;
const COS = Math.cos(22.5 * D2R);
const R = (y: number) => 2.6 - (0.9 * y) / 6.6; // tower circumradius at height y
const TILT = Math.atan(0.9 / 6.6 * COS);

export default function build() {
  const b = createBuilder({ name: "dutchWindmill" });

  // Place something on a wall face (phi = facing angle, 0 = +Z).
  const onFace = (phi: number, y: number, lat: number, lift: number, extra = 0) => {
    const p = phi * D2R;
    const ap = (R(y) + extra) * COS + lift;
    const nh = [Math.sin(p), 0, Math.cos(p)];
    const t = [Math.cos(p), 0, -Math.sin(p)];
    return {
      at: [nh[0] * ap + t[0] * lat, y, nh[2] * ap + t[2] * lat] as [number, number, number],
      dir: [nh[0] * Math.cos(TILT), Math.sin(TILT), nh[2] * Math.cos(TILT)] as [number, number, number],
    };
  };
  const box = (w: number, h: number, d: number, color: string, phi: number, y: number, lat: number, lift: number, name: string, extra = 0) => {
    const f = onFace(phi, y, lat, lift, extra);
    return b.part(new THREE.BoxGeometry(w, h, d), color, { at: f.at, dir: f.dir, axis: "z", name });
  };
  const oct = (rt: number, rb: number, h: number, y: number, color: string, name: string, sides = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color, {
      at: [0, y, 0],
      rotation: [0, sides === 8 ? 22.5 : 0, 0],
      flat: sides === 8,
      name,
    });

  // ---------- Tower ----------
  oct(2.9, 3.0, 0.35, 0.175, STONE, "plinth");
  oct(R(6.6), R(0.35), 6.25, 0.35 + 3.125, PLASTER, "towerWall");
  oct(R(2.2) + 0.08, R(0.35) + 0.08, 1.85, 0.35 + 0.925, BRICK, "brickBand");
  oct(R(2.2) + 0.17, R(2.2) + 0.17, 0.14, 2.22, TRIM, "ledgeTrim");
  oct(R(4.9) + 0.05, R(4.9) + 0.05, 0.16, 4.95, WOOD, "beamRing");
  oct(R(6.55) + 0.06, R(6.55) + 0.06, 0.16, 6.5, WOOD, "beamRingTop");

  // Vertical timber ribs on the eight corners above the brick
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 + 22.5) * D2R;
    const rb = R(2.3) + 0.04;
    const rt = R(6.5) + 0.04;
    b.rod([Math.sin(a) * rb, 2.35, Math.cos(a) * rb], [Math.sin(a) * rt, 6.5, Math.cos(a) * rt], 0.06, WOOD, { name: "cornerRib" });
  }

  // ---------- Door ----------
  const DY = 0.35;
  const door = onFace(0, 1.0, 0, 0.0, 0.08);
  box(1.3, 1.25, 0.14, TRIM, 0, DY + 0.62, 0, 0.0, "doorFrame", 0.08);
  box(1.05, 1.15, 0.2, DOOR, 0, DY + 0.6, 0, 0.0, "door", 0.08);
  {
    const f = onFace(0, 1.55, 0, 0.0, 0.08);
    b.part(new THREE.CylinderGeometry(0.65, 0.65, 0.14, 12), TRIM, { at: f.at, dir: f.dir, name: "doorArchFrame" });
    const g = onFace(0, 1.55, 0, 0.04, 0.08);
    b.part(new THREE.CylinderGeometry(0.52, 0.52, 0.2, 12), DOOR, { at: g.at, dir: g.dir, name: "door" });
  }
  void door;
  // Steps
  b.part(new THREE.BoxGeometry(1.8, 0.14, 0.7), STONE, { at: [0, 0.42, 2.78], name: "stepTop" });
  b.part(new THREE.BoxGeometry(2.2, 0.12, 0.6), STONE, { at: [0, 0.41 - 0.06, 3.15], name: "stepLow" });

  // ---------- Windows ----------
  const win = (phi: number, y: number, tag: string) => {
    box(1.15, 1.35, 0.12, TRIM, phi, y, 0, 0.0, tag + "Frame");
    box(0.85, 1.05, 0.16, GLASS, phi, y, 0, 0.0, tag);
    box(0.07, 1.05, 0.2, TRIM, phi, y, 0, 0.0, tag + "Mullion");
    box(0.85, 0.07, 0.2, TRIM, phi, y + 0.05, 0, 0.0, tag + "Mullion");
    box(1.4, 0.1, 0.3, WOOD, phi, y - 0.72, 0, 0.1, tag + "Sill");
    for (const s of [1, -1]) box(0.4, 1.3, 0.1, SHUTTER, phi, y, s * 0.82, 0.02, tag + "Shutter");
  };
  win(0, 4.2, "windowFront");
  win(90, 4.2, "windowSide");
  win(-90, 4.2, "windowSide");
  win(45, 3.9, "windowDiag");
  win(-45, 3.9, "windowDiag");
  // small windows on the brick band, diagonals
  for (const phi of [45, -45, 90, -90]) {
    box(0.7, 0.7, 0.12, TRIM, phi, 1.5, 0, 0.0, "brickWinFrame", 0.08);
    box(0.5, 0.5, 0.16, GLASS, phi, 1.5, 0, 0.0, "brickWin", 0.08);
  }

  // ---------- Gallery ----------
  oct(3.4, 3.4, 0.16, 2.37, WOOD, "galleryDeck");
  oct(3.45, 3.45, 0.1, 2.27, WOOD_DARK, "galleryUnder");
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5 * D2R;
    b.part(new THREE.BoxGeometry(0.1, 0.75, 0.1), TRIM, { at: [Math.sin(a) * 3.28, 2.83, Math.cos(a) * 3.28], name: "galleryPost" });
  }
  b.part(new THREE.TorusGeometry(3.28, 0.06, 6, 16), TRIM, { at: [0, 3.22, 0], dir: [0, 1, 0], axis: "z", name: "galleryRail" });
  b.part(new THREE.TorusGeometry(3.28, 0.04, 6, 16), TRIM, { at: [0, 2.75, 0], dir: [0, 1, 0], axis: "z", name: "galleryRailLow" });

  // ---------- Cap ----------
  b.part(new THREE.CylinderGeometry(2.15, 2.15, 0.16, 16), TRIM, { at: [0, 6.6, 0], name: "capTrim" });
  b.lathe(
    [
      [0, 0],
      [2.05, 0],
      [2.12, 0.1],
      [1.98, 0.3],
      [1.6, 0.72],
      [1.05, 1.1],
      [0.45, 1.3],
      [0, 1.36],
    ],
    { at: [0, 6.58, 0], segments: 16, color: ROOF, name: "capRoof" },
  );
  b.part(new THREE.SphereGeometry(0.16, 8, 6), BRASS, { at: [0, 7.95, 0], name: "finial" });
  // roof ribs
  for (let i = 0; i < 8; i++) {
    const a = (i * 45) * D2R;
    b.rod([Math.sin(a) * 2.05, 6.68, Math.cos(a) * 2.05], [Math.sin(a) * 0.4, 7.88, Math.cos(a) * 0.4], 0.05, ROOF_DARK, { name: "capRib" });
  }

  // ---------- Hub and sails ----------
  const H = new THREE.Vector3(0, 7.2, 2.35);
  b.rod([0, 7.2, 0.8], [0, 7.2, 2.7], 0.16, WOOD_DARK, { name: "axle" });
  b.part(new THREE.CylinderGeometry(0.4, 0.45, 0.5, 8), WOOD_DARK, { at: [0, 7.2, 2.35], dir: [0, 0, 1], name: "hub" });
  b.part(new THREE.ConeGeometry(0.3, 0.5, 8), ROOF, { at: [0, 7.2, 2.78], dir: [0, 0, 1], name: "hubNose" });

  for (let k = 0; k < 4; k++) {
    const a = (45 + 90 * k) * D2R;
    const d = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const p = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    const pt = (u: number, v: number, z: number) =>
      H.clone().addScaledVector(d, u).addScaledVector(p, v).add(new THREE.Vector3(0, 0, z));
    // main stock
    b.rod(pt(0.2, 0, 0), pt(5.1, 0, 0), 0.1, WOOD, { name: "sailStock" });
    // cloth
    b.extrude(
      [
        [1.0, 0.08],
        [4.9, 0.08],
        [4.85, 1.1],
        [1.0, 1.0],
      ],
      { at: pt(0, 0, 0.1), x: [d.x, d.y, 0], y: [p.x, p.y, 0], thickness: 0.04, color: SAIL, name: "sailCloth" },
    );
    // lattice frame
    b.rod(pt(1.0, 1.0, 0.15), pt(4.9, 1.1, 0.15), 0.045, LATTICE, { name: "sailLattice" });
    b.rod(pt(4.9, 0.0, 0.15), pt(4.9, 1.1, 0.15), 0.05, LATTICE, { name: "sailLattice" });
    b.rod(pt(1.0, 0.0, 0.15), pt(1.0, 1.0, 0.15), 0.045, LATTICE, { name: "sailLattice" });
    for (let r = 1; r <= 4; r++) {
      const u = 1.0 + r * 0.78;
      b.rod(pt(u, 0, 0.15), pt(u, 1.05, 0.15), 0.035, LATTICE, { name: "sailLattice" });
    }
    // root bracket and tip cap
    b.part(new THREE.BoxGeometry(0.34, 0.5, 0.2), WOOD_DARK, {
      at: pt(0.75, 0, 0.02),
      dir: [d.x, d.y, 0],
      name: "sailBracket",
    });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), BRASS, { at: pt(5.15, 0, 0), name: "sailTip" });
  }

  // ---------- Tail pole ----------
  b.rod([0, 7.05, -1.4], [0, 0.12, -7.3], 0.1, WOOD_DARK, { name: "tailPole" });
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.16, 10), WOOD, { at: [0, 1.16, -6.4], dir: [1, 0, 0], name: "tailWinch" });
  for (const s of [1, -1]) b.rod([s * 0.25, 0.1, -6.4], [s * 0.1, 1.1, -6.4], 0.06, WOOD, { name: "tailPost" });
  b.rod([0, 6.4, -1.9], [0, 5.5, -3.6], 0.07, WOOD, { name: "tailBrace" });

  for (const add of STAGE2) add(b);
  return b.root;
}
