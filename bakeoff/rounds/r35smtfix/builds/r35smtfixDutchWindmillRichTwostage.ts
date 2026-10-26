import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, cells, mix, smoothstep, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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


const TOWER_PAINT = paint((p, n) => {
  const a = Math.atan2(p.x, p.z);
  const rr = Math.hypot(p.x, p.z);
  const cornerD = Math.abs((((a / (Math.PI / 4) - 0.5) % 1) + 1) % 1 - 0.5) * 2;
  let c = mix(PLASTER, "#f6dcb0", smoothstep(0.55, 0.8, noise(p, 0.5, 3)) * 0.5);
  c = mix(c, "#ffffff", smoothstep(0.62, 0.78, noise(p, 0.9, 8)) * 0.4);
  const sp = cells(p, 0.07, 11);
  if (sp.d1 < 0.1 && sp.id > 0.6) c = mix(c, "#e2b98a", 0.5);
  const nearCorner = (0.5 - Math.abs(cornerD - 0.0)) > 0 && cornerD < 0.07 + 0.0 * rr;
  if (Math.abs(n.y) < 0.5 && nearCorner) c = mix(c, WOOD, 0.95);
  return c;
});

const BRICK_PAINT = paint((p, n) => {
  const ax = Math.abs(n.x) > Math.abs(n.z);
  const u = ax ? p.z : p.x;
  const ch = 0.13;
  const row = Math.floor(p.y / ch);
  const cw = 0.3;
  const uu = u / cw + (row % 2) * 0.5;
  const col = Math.floor(uu);
  const fu = uu - col;
  const fv = p.y / ch - row;
  const id = Math.abs(Math.sin(col * 12.9898 + row * 78.233 + (ax ? 5 : 0)) * 43758.5453) % 1;
  if (fu < 0.07 || fv < 0.1) return BRICK_DARK;
  let c = mix(BRICK, id > 0.5 ? "#eca07e" : "#c26f52", Math.abs(id - 0.5) * (id > 0.25 && id < 0.8 ? 0.3 : 1.2));
  return mix(c, "#ffc6a0", smoothstep(0.85, 0.97, fv) * 0.25);
});

const ROOF_PAINT = paint((p, n) => {
  const rowH = 0.2;
  const row = Math.floor((p.y - 6.58) / rowH);
  const fv = (p.y - 6.58) / rowH - row;
  const a = Math.atan2(p.x, p.z) / (Math.PI * 2) * 24 + (row % 2) * 0.5;
  const fu = a - Math.floor(a);
  const edge = Math.min(fu, 1 - fu);
  const round = fv - 0.25 * Math.pow(Math.abs(fu - 0.5) * 2, 2);
  if (round < 0.14 || edge < 0.05) return ROOF_DARK;
  const t = smoothstep(6.6, 7.9, p.y);
  return mix(mix(ROOF, "#f08a6e", t * 0.55), "#ffffff", 0 * n.y);
});

const SAIL_PAINT = paint((p) => {
  const r = Math.hypot(p.x, p.y - 7.2);
  const c = cells(p, 0.5, 4);
  let col = mix(SAIL, "#f6e0b4", c.id > 0.6 ? 0.8 : 0);
  if (c.d2 - c.d1 < 0.05) col = mix(col, "#b49a74", 0.6);
  const st = (r * 6) % 0.5;
  if (c.d2 - c.d1 > 0.05 && c.d2 - c.d1 < 0.1 && st < 0.25) col = mix(col, "#8a7050", 0.5);
  if (r > 4.15 && r < 4.55) col = mix(col, "#e2634e", 0.75);
  return col;
});

const COBBLE = paint((p, n) => {
  const c = cells(p, 0.3, 5);
  const e = c.d2 - c.d1;
  const tones = ["#c4baa8", "#d2c9b8", "#b3a995", "#cbbfa6"];
  const t = tones[Math.floor(c.id * 4) % 4];
  if (n.y < 0.5) return mix(t, "#8f8573", 0.2);
  return mix("#7d7464", t, smoothstep(0.02, 0.2, e) * (0.9 + 0.1 * (1 - c.d1)));
});

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
  const oct = (rt: number, rb: number, h: number, y: number, color: string | ReturnType<typeof paint>, name: string, sides = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color, {
      at: [0, y, 0],
      rotation: [0, sides === 8 ? 22.5 : 0, 0],
      flat: sides === 8,
      name,
    });

  // ---------- Tower ----------
  oct(2.9, 3.0, 0.35, 0.175, COBBLE, "plinth");
  oct(R(6.6), R(0.35), 6.25, 0.35 + 3.125, TOWER_PAINT, "towerWall");
  oct(R(2.2) + 0.08, R(0.35) + 0.08, 1.85, 0.35 + 0.925, BRICK_PAINT, "brickBand");
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
    { at: [0, 6.58, 0], segments: 16, color: ROOF_PAINT, name: "capRoof" },
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
      { at: pt(0, 0, 0.1), x: [d.x, d.y, 0], y: [p.x, p.y, 0], thickness: 0.04, color: SAIL_PAINT, name: "sailCloth" },
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addDoorKnocker(b: Builder) {
  // Door surface: stage 1 door is a box at face phi=0, tilted slightly. Front plane near z ~ 2.5.
  const TILT = 0.12;
  const cz = 2.5; // approximate door front
  const place = (x: number, y: number, lift: number): [number, number, number] => [
    x,
    y + (lift * TILT),
    cz + lift,
  ];
  const dir: [number, number, number] = [0, TILT, 1];

  // Hinge straps (three across the door), dark wood bands with nail heads
  const strapYs = [0.75, 1.15, 1.55];
  strapYs.forEach((y, i) => {
    const len = i === 2 ? 0.7 : 0.85;
    b.part(new THREE.BoxGeometry(len, 0.09, 0.03), WOOD_DARK, {
      at: place(-0.5 + len / 2 - 0.0 + (i === 2 ? 0.0 : 0.0) - (len - 0.85) / 2 * 0, y, 0.14),
      dir,
      axis: "z",
      name: "doorStrap",
    });
    // pointed strap ends
    b.part(new THREE.ConeGeometry(0.06, 0.1, 3), WOOD_DARK, {
      at: place(-0.5 + len + 0.0 - 0.0, y, 0.14),
      rotation: [0, 0, -90],
      name: "doorStrapTip",
    });
    // hinge pin knobs
    b.part(new THREE.SphereGeometry(0.045, 6, 4), WOOD_DARK, {
      at: place(-0.45, y, 0.16),
      name: "doorHinge",
    });
    for (const x of [-0.2, 0.05, 0.3]) {
      b.part(new THREE.SphereGeometry(0.022, 5, 4), BRASS, {
        at: place(x, y, 0.165),
        name: "doorNail",
      });
    }
  });

  // Brass backplate, knocker ring and handle
  const kx = 0.22;
  const ky = 1.25;
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), BRASS, {
    at: place(kx, ky + 0.12, 0.17),
    dir,
    name: "knockerPlate",
  });
  b.part(new THREE.TorusGeometry(0.075, 0.016, 5, 12), BRASS, {
    at: place(kx, ky + 0.06, 0.2),
    dir,
    axis: "z",
    name: "knockerRing",
  });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, {
    at: place(kx, ky + 0.14, 0.2),
    name: "knockerBoss",
  });
  // round handle
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 6), BRASS, {
    at: place(-0.3, 1.05, 0.2),
    dir,
    name: "handleStem",
  });
  b.part(new THREE.SphereGeometry(0.055, 8, 6), BRASS, {
    at: place(-0.3, 1.05, 0.26),
    name: "handleKnob",
  });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 8), BRASS, {
    at: place(-0.3, 1.05, 0.17),
    dir,
    name: "handleRose",
  });

  // Hanging name sign above the door arch, from a little bracket
  const sy = 2.0;
  b.part(new THREE.BoxGeometry(0.7, 0.05, 0.05), WOOD_DARK, {
    at: [0, sy + 0.3, cz + 0.15],
    name: "signBar",
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.25, sy + 0.3, cz + 0.15], [s * 0.25, sy + 0.14, cz + 0.15], 0.012, WOOD_DARK, { name: "signChain" });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), BRASS, { at: [s * 0.25, sy + 0.3, cz + 0.18], name: "signRing" });
  }
  b.part(new THREE.BoxGeometry(0.62, 0.3, 0.04), TRIM, { at: [0, sy, cz + 0.15], name: "signBorder" });
  b.part(new THREE.BoxGeometry(0.54, 0.22, 0.05), WOOD, { at: [0, sy, cz + 0.155], name: "signBoard" });
  // little decoration on the sign: a tiny sail-wheel motif
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 8), TRIM, {
    at: [0, sy, cz + 0.19],
    rotation: [90, 0, 0],
    name: "signEmblem",
  });
  for (let k = 0; k < 4; k++) {
    const a = (k * 90 + 45) * (Math.PI / 180);
    b.rod(
      [0, sy, cz + 0.2],
      [Math.cos(a) * 0.1, sy + Math.sin(a) * 0.1, cz + 0.2],
      0.012,
      ROOF,
      { name: "signSail" },
    );
  }
  b.part(new THREE.SphereGeometry(0.02, 5, 4), BRASS, { at: [0, sy, cz + 0.21], name: "signHub" });

  // Welcome mat at the step
  b.part(new THREE.BoxGeometry(0.9, 0.025, 0.4), SHUTTER, { at: [0, 0.505, 2.85], name: "doorMat" });
  b.part(new THREE.BoxGeometry(0.7, 0.03, 0.2), TRIM, { at: [0, 0.512, 2.85], name: "doorMatStripe" });
}
    return addDoorKnocker;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addWindowFlowerBoxes(b: Builder) {
  const PINK = "#f59ab8";
  const YELLOW = "#ffd95a";
  const LAVENDER = "#b9a2e8";
  const LEAF = "#6fbf73";
  const LAMP = "#ffd877";
  const blooms = [PINK, YELLOW, LAVENDER];

  // Flower boxes under windows. phi: facing angle (0 = +Z), s: scale
  const flowerBox = (phi: number, y: number, s: number) => {
    const p = phi * D2R;
    const ap = R(y) * COS + 0.13;
    const sn = Math.sin(p);
    const cs = Math.cos(p);
    // local x = lateral, z = outward from the wall
    const place = (x: number, yy: number, z: number): [number, number, number] => {
      const out = ap + z;
      return [sn * out + cs * x, yy, cs * out - sn * x];
    };
    const rot: [number, number, number] = [0, phi, 0];
    const w = 1.2 * s;
    const part = (g: THREE.BufferGeometry, c: string, x: number, yy: number, z: number, name: string) =>
      b.part(g, c, { at: place(x, y + yy, z), rotation: rot, name });
    part(new THREE.BoxGeometry(w, 0.3, 0.3), WOOD, 0, 0, 0.05, "flowerBox");
    part(new THREE.BoxGeometry(w + 0.04, 0.05, 0.34), WOOD_DARK, 0, 0.15, 0.05, "flowerBoxRim");
    for (const sx of [-1, 0, 1])
      part(new THREE.BoxGeometry(0.05, 0.3, 0.02), WOOD_DARK, sx * w * 0.32, 0, 0.215, "flowerBoxSlat");
    part(new THREE.BoxGeometry(w - 0.06, 0.06, 0.24), "#7a5236", 0, 0.17, 0.05, "flowerSoil");
    const n = Math.max(4, Math.round(6 * s));
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5;
      const x = t * (w - 0.2);
      const zz = 0.05 + (i % 2 ? 0.06 : -0.05);
      part(new THREE.ConeGeometry(0.07, 0.16, 5), LEAF, x + 0.07, 0.26, zz, "flowerLeaf");
      part(new THREE.SphereGeometry(0.075 * (i % 2 ? 1 : 1.15), 6, 4), blooms[i % 3], x, 0.3 + (i % 2) * 0.04, zz, "flowerBloom");
      part(new THREE.SphereGeometry(0.025, 5, 4), i % 3 === 1 ? "#fff0d4" : YELLOW, x, 0.37 + (i % 2) * 0.04, zz + 0.04, "flowerCentre");
    }
  };
  flowerBox(0, 3.3, 1);
  flowerBox(90, 3.3, 0.7);
  flowerBox(-90, 3.3, 0.7);

  // Lanterns on short posts at the front corners of the gallery rail
  for (const s of [1, -1]) {
    const x = s * 2.2;
    const z = 2.4;
    b.part(new THREE.BoxGeometry(0.12, 0.45, 0.12), WOOD, { at: [x, 3.45, z], name: "lanternPost" });
    b.part(new THREE.BoxGeometry(0.3, 0.05, 0.3), BRASS, { at: [x, 3.7, z], name: "lanternBase" });
    glow(b.part(new THREE.BoxGeometry(0.22, 0.28, 0.22), LAMP, { at: [x, 3.87, z], name: "lanternGlass" }), 1.6);
    for (const cx of [-1, 1])
      for (const cz of [-1, 1])
        b.part(new THREE.BoxGeometry(0.035, 0.3, 0.035), BRASS, {
          at: [x + cx * 0.115, 3.87, z + cz * 0.115],
          name: "lanternBar",
        });
    b.part(new THREE.BoxGeometry(0.3, 0.04, 0.3), BRASS, { at: [x, 4.03, z], name: "lanternTop" });
    b.part(new THREE.ConeGeometry(0.24, 0.2, 8), ROOF, { at: [x, 4.15, z], name: "lanternCap" });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), BRASS, { at: [x, 4.28, z], name: "lanternKnob" });
  }
}
    return addWindowFlowerBoxes;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addSailPennants(b: Builder) {
  const IRON = "#4a4f5c";
  const hubC = new THREE.Vector3(0, 7.2, 2.35);

  // Swallow-tail pennant drawn as a texture (cut-away tail)
  const mkFlag = (fill: string, stripe: string) =>
    svg(
      `<svg viewBox="0 0 64 40"><path d="M0 2 L62 2 L44 20 L62 38 L0 38 Z" fill="${fill}" stroke="#5a3a2a" stroke-width="2.5" stroke-linejoin="round"/><path d="M6 12 L50 12 M6 28 L50 28" stroke="${stripe}" stroke-width="4"/></svg>`,
      { size: 128 },
    );
  const flags = [mkFlag(ROOF, TRIM), mkFlag(BRASS, ROOF), mkFlag(DOOR, TRIM), mkFlag(ROOF, BRASS)];

  // ---- Pennants on the four sail tips ----
  for (let k = 0; k < 4; k++) {
    const a = (45 + 90 * k) * D2R;
    const d = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const p = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    const tip = hubC.clone().addScaledVector(d, 5.15).add(new THREE.Vector3(0, 0, 0.05));
    const top = tip.clone().addScaledVector(d, 0.65);
    b.rod(tip.toArray() as [number, number, number], top.toArray() as [number, number, number], 0.025, IRON, { name: "s23pole" });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), BRASS, { at: top.toArray() as [number, number, number], name: "s23poleBall" });
    // flag extends sideways from the pole (along p), double-sided via two planes
    const centre = top.clone().addScaledVector(d, -0.2).addScaledVector(p, 0.36);
    for (const side of [1, -1]) {
      b.part(new THREE.PlaneGeometry(0.7, 0.42), "#ffffff", {
        at: centre.clone().add(new THREE.Vector3(0, 0, side * 0.006)).toArray() as [number, number, number],
        dir: [0, 0, side],
        up: [d.x, d.y, 0],
        axis: "z",
        texture: flags[k],
        name: "s23pennant",
      });
    }
  }

  // ---- Weathervane ----
  const base = 7.95;
  b.rod([0, base, 0], [0, base + 0.95, 0], 0.03, IRON, { name: "s23vaneRod" });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), BRASS, { at: [0, base + 0.42, 0], name: "s23vaneBall" });
  const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (const [x, z] of dirs) {
    b.rod([0, base + 0.42, 0], [x * 0.38, base + 0.42, z * 0.38], 0.018, IRON, { name: "s23vaneArm" });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), BRASS, { at: [x * 0.4, base + 0.42, z * 0.4], name: "s23vaneArmBall" });
  }
  // arrow on top, pointing +Z
  const ay = base + 0.95;
  b.rod([0, ay, -0.3], [0, ay, 0.25], 0.025, BRASS, { name: "s23arrowShaft" });
  b.part(new THREE.ConeGeometry(0.09, 0.2, 6), BRASS, { at: [0, ay, 0.35], dir: [0, 0, 1], name: "s23arrowHead" });
  b.extrude(
    [
      [0, 0],
      [0.2, 0.17],
      [0.28, 0.17],
      [0.16, 0],
      [0.28, -0.17],
      [0.2, -0.17],
    ],
    { at: [0, ay, -0.22], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.025, color: BRASS, name: "s23arrowTail" },
  );
  b.part(new THREE.SphereGeometry(0.06, 6, 4), ROOF, { at: [0, base + 0.99, 0], name: "s23vaneTop" });
}
    return addSailPennants;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addDoorstepProps(b: Builder) {
  const r = rng(24);
  const STRING = "#c9a66b";
  const MOUND = "#7a5638";
  const LEAF = "#6fb86a";
  const PINK = "#ff9fbf";
  const YELLOW = "#ffd95a";
  const WHITE = "#fffaf0";
  const LAV = "#b9a2e6";

  // ---------- Barrels ----------
  const barrelPaint = paint((p, n, s) => {
    const base: [number, number, number] = [0.72, 0.52, 0.31];
    const dark: [number, number, number] = [0.52, 0.35, 0.2];
    const plank = Math.abs(Math.sin((p.x + p.z) * 38));
    return mix(dark, base, smoothstep(0.1, 0.6, plank) * 0.6 + noise(p, 0.05, 3) * 0.4);
  });

  const barrel = (x: number, z: number, h: number, name: string) => {
    const y0 = 0.34;
    const rad = 0.27;
    b.lathe(
      [
        [0, 0],
        [rad * 0.85, 0],
        [rad, h * 0.5],
        [rad * 0.85, h],
        [0, h],
      ],
      { at: [x, y0, z], segments: 10, color: barrelPaint, name: name + "Body", smoothing: 0 },
    );
    for (const f of [0.15, 0.85]) {
      const k = 1 - 0.15 * Math.pow(Math.abs(f - 0.5) * 2, 2);
      b.part(new THREE.CylinderGeometry(rad * k * 1.0 + 0.02, rad * k + 0.02, 0.05, 10), WOOD_DARK, {
        at: [x, y0 + h * f, z],
        name: name + "Hoop",
      });
    }
    b.part(new THREE.CylinderGeometry(rad * 0.82, rad * 0.82, 0.03, 10), WOOD, {
      at: [x, y0 + h + 0.005, z],
      name: name + "Lid",
    });
    b.part(new THREE.TorusGeometry(rad * 0.7, 0.015, 4, 10), WOOD_DARK, {
      at: [x, y0 + h + 0.03, z],
      dir: [0, 1, 0],
      axis: "z",
      name: name + "LidRim",
    });
  };
  barrel(1.45, 3.15, 0.62, "barrelA");
  barrel(2.2, 3.05, 0.5, "barrelB");

  // ---------- Flour sacks ----------
  const sackPaint = (c1: string) =>
    paint((p, n) => mix(c1, "#8d8372", noise(p, 0.04, 9) * 0.35 + (n.y < 0 ? 0.15 : 0)));
  const sack = (x: number, y: number, z: number, col: string, rotY: number, name: string, tilt = 0) => {
    const w = 0.26;
    const h = 0.3;
    const body = b.lathe(
      [
        [0, 0],
        [w * 0.8, 0],
        [w, h * 0.35],
        [w * 0.85, h * 0.8],
        [w * 0.3, h],
        [0, h * 1.0],
      ],
      { at: [x, y, z], segments: 8, color: sackPaint(col), name: name, smoothing: 1 },
    );
    body.mesh.rotation.set(tilt, rotY, 0);
    // tied top
    b.part(new THREE.ConeGeometry(0.09, 0.14, 6), col, {
      at: [x, y + h + 0.05, z],
      name: name + "Tuft",
    });
    b.part(new THREE.TorusGeometry(0.075, 0.015, 4, 8), STRING, {
      at: [x, y + h - 0.01, z],
      dir: [0, 1, 0],
      axis: "z",
      name: name + "String",
    });
  };
  const sy = 0.34;
  sack(2.0, sy, 2.35, PLASTER, 0.3, "sackA");
  sack(2.38, sy, 2.4, STONE, 1.1, "sackB");
  sack(2.2, sy + 0.3, 2.38, PLASTER, 0.7, "sackC");
  // leaning sack against wall
  sack(1.2, sy + 0.1, 2.2, STONE, 0.2, "sackLean", -0.28);

  // ---------- Flower bed ----------
  const cx = -1.9;
  const cz = 3.05;
  const earth = paint((p, n) => mix("#6a4a30", "#8a6544", noise(p, 0.08, 4)));
  b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.55, 0.12],
      [0.35, 0.2],
      [0, 0.24],
    ],
    { at: [cx, 0.34, cz], segments: 10, color: earth, name: "bedMound", smoothing: 1 },
  );
  // stone ring
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const sc = 0.07 + r() * 0.03;
    b.part(new THREE.DodecahedronGeometry(sc, 0), i % 2 ? STONE : "#d8cfbd", {
      at: [cx + Math.cos(a) * 0.68, 0.34 + 0.03, cz + Math.sin(a) * 0.55],
      scale: [1.2, 0.8, 1],
      rotation: [0, r() * 180, 0],
      name: "bedStone",
    });
  }
  // blooms
  const cols = [PINK, YELLOW, WHITE, LAV];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + r() * 0.4;
    const rr = i < 8 ? 0.25 + r() * 0.2 : r() * 0.12;
    const x = cx + Math.cos(a) * rr;
    const z = cz + Math.sin(a) * rr * 0.8;
    const top = 0.34 + 0.24 * (1 - rr / 0.62) * 0.9 + 0.02;
    const hgt = 0.14 + r() * 0.08;
    b.rod([x, top, z], [x, top + hgt, z], 0.012, LEAF, { name: "bloomStem" });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), cols[i % 4], {
      at: [x, top + hgt + 0.02, z],
      name: "bloom",
    });
    b.part(new THREE.SphereGeometry(0.025, 5, 4), cols[i % 4] === YELLOW ? "#e58a3a" : YELLOW, {
      at: [x, top + hgt + 0.065, z],
      name: "bloomCore",
    });
    const la = r() * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.04, 0.14, 4), LEAF, {
      at: [x + Math.cos(la) * 0.05, top + 0.05, z + Math.sin(la) * 0.05],
      dir: [Math.cos(la), 0.9, Math.sin(la)],
      name: "bloomLeaf",
    });
  }
  // low leafy tufts
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    b.part(new THREE.SphereGeometry(0.09, 6, 4), LEAF, {
      at: [cx + Math.cos(a) * 0.45, 0.34 + 0.1, cz + Math.sin(a) * 0.36],
      scale: [1, 0.7, 1],
      name: "bedLeaves",
    });
  }
}
    return addDoorstepProps;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addTailWheel(b: Builder) {
  const ROPE = "#d9bf8a";
  const ROPE_DARK = "#b49a64";
  const IRON = "#6f7480";

  // ---------- Tail winch: rope coil, spokes, chain ----------
  const cx = 0, cy = 1.16, cz = -6.4;

  // rope coil: stacked torus rings around the winch drum (axis along X)
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.07;
    b.part(new THREE.TorusGeometry(0.52, 0.045, 5, 14), i % 2 ? ROPE_DARK : ROPE, {
      at: [cx + x, cy, cz],
      dir: [1, 0, 0],
      axis: "z",
      name: "winchRope",
    });
  }
  // rope end hanging
  b.rod([cx + 0.1, cy - 0.5, cz + 0.05], [cx + 0.22, 0.45, cz + 0.2], 0.04, ROPE, { name: "ropeTail" });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), ROPE_DARK, { at: [cx + 0.22, 0.43, cz + 0.2], name: "ropeKnot" });

  // end flanges
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.58, 0.58, 0.05, 10), WOOD_DARK, {
      at: [cx + s * 0.22, cy, cz],
      dir: [1, 0, 0],
      name: "winchFlange",
    });
  }

  // four handle spokes with round knobs on the outer side
  for (let k = 0; k < 4; k++) {
    const a = (k * 90 + 45) * D2R;
    const uy = Math.cos(a), uz = Math.sin(a);
    const x = cx + 0.3;
    b.rod([x, cy, cz], [x, cy + uy * 0.78, cz + uz * 0.78], 0.045, WOOD, { name: "winchSpoke" });
    b.part(new THREE.SphereGeometry(0.1, 6, 5), WOOD_DARK, {
      at: [x, cy + uy * 0.82, cz + uz * 0.82],
      name: "winchKnob",
    });
  }
  // hub cap
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 8), BRASS, {
    at: [cx + 0.34, cy, cz],
    dir: [1, 0, 0],
    name: "winchCap",
  });

  // chain hanging to the ground: alternating links
  const top = cy - 0.55;
  const links = 7;
  for (let i = 0; i < links; i++) {
    const y = top - 0.08 - i * 0.1;
    if (y < 0.05) break;
    b.part(new THREE.TorusGeometry(0.045, 0.014, 4, 8), IRON, {
      at: [cx - 0.12, y, cz + 0.05],
      dir: i % 2 ? [1, 0, 0] : [0, 0, 1],
      axis: "z",
      name: "chainLink",
    });
  }
  b.part(new THREE.SphereGeometry(0.07, 6, 4), IRON, { at: [cx - 0.12, 0.08, cz + 0.05], name: "chainWeight" });

  // ---------- Hub star emblem ----------
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36) * D2R;
    const r = i % 2 ? 0.11 : 0.25;
    star.push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  // nose cone: radius shrinks toward tip at z ~3.03; place emblem on the cone's front region
  b.extrude(star, {
    at: [0, 7.2, 2.98],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.01,
    color: BRASS,
    name: "hubStar",
  });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), ROOF_DARK, { at: [0, 7.2, 3.04], name: "hubButton" });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), TRIM, { at: [-0.02, 7.22, 3.09], name: "hubButtonGlint" });
  // small bolts around the nose base
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * D2R;
    b.part(new THREE.SphereGeometry(0.03, 5, 4), BRASS, {
      at: [Math.sin(a) * 0.36, 7.2 + Math.cos(a) * 0.36, 2.62],
      name: "hubBolt",
    });
  }
}
    return addTailWheel;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addGalleryBunting(b: Builder) {
  // ---------- Bunting along the left (+X) side of the gallery rail ----------
  const RAIL_R = 3.28;
  const flagColors = [ROOF, BRASS, SHUTTER, DOOR, TRIM];
  const flagTex = svg(
    `<svg viewBox="0 0 32 32"><path d="M2 2 L30 2 L16 30 Z" fill="#ffffff" stroke="#6b4a2a" stroke-width="2" stroke-linejoin="round"/><path d="M8 6 L24 6 L16 20 Z" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/></svg>`,
    { size: 64 },
  );
  // rope follows the rail arc between two angles, sagging between posts
  const aStart = 28 * D2R;
  const aEnd = 152 * D2R;
  const N = 6; // number of swags
  const railPt = (a: number, sag: number) =>
    new THREE.Vector3(Math.sin(a) * (RAIL_R + 0.1), 3.2 - sag, Math.cos(a) * (RAIL_R + 0.1));
  // note: angle a measured from +Z toward +X, so a in (28..152 deg) covers the left side
  const pts: THREE.Vector3[] = [];
  const flags: { p: THREE.Vector3; a: number }[] = [];
  for (let i = 0; i < N; i++) {
    const a0 = aStart + ((aEnd - aStart) * i) / N;
    const a1 = aStart + ((aEnd - aStart) * (i + 1)) / N;
    const seg = 8;
    for (let k = 0; k <= seg; k++) {
      const t = k / seg;
      const a = a0 + (a1 - a0) * t;
      const sag = 0.38 * 4 * t * (1 - t);
      const p = railPt(a, sag);
      pts.push(p);
      if (k > 0 && k < seg && k % 2 === 0 || (k === 4)) {
        if (k === 2 || k === 4 || k === 6) flags.push({ p, a });
      }
    }
  }
  for (let i = 0; i < pts.length - 1; i++) {
    if (pts[i].distanceTo(pts[i + 1]) < 1e-4) continue;
    b.rod(pts[i].toArray() as [number, number, number], pts[i + 1].toArray() as [number, number, number], 0.014, WOOD_DARK, { name: "buntingRope" });
  }
  // knots at the posts
  for (let i = 0; i <= N; i++) {
    const a = aStart + ((aEnd - aStart) * i) / N;
    const p = railPt(a, 0);
    b.part(new THREE.SphereGeometry(0.05, 6, 4), BRASS, { at: p.toArray() as [number, number, number], name: "buntingKnot" });
  }
  flags.forEach((f, i) => {
    const out = new THREE.Vector3(Math.sin(f.a), 0, Math.cos(f.a));
    const c = flagColors[i % flagColors.length];
    // flag hangs below the rope, face looks outward
    b.part(new THREE.PlaneGeometry(0.3, 0.34), c, {
      at: [f.p.x + out.x * 0.01, f.p.y - 0.19, f.p.z + out.z * 0.01],
      dir: [out.x, 0, out.z],
      axis: "z",
      texture: flagTex,
      name: "buntingFlag",
    });
    // back side so it reads from inside too
    b.part(new THREE.PlaneGeometry(0.3, 0.34), c, {
      at: [f.p.x - out.x * 0.01, f.p.y - 0.19, f.p.z - out.z * 0.01],
      dir: [-out.x, 0, -out.z],
      axis: "z",
      texture: flagTex,
      name: "buntingFlagBack",
    });
  });

  // ---------- Attic hatch on the cap front ----------
  const hy = 6.95;
  const hz = 1.72;
  const tilt: [number, number, number] = [0, 0.3, 1];
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 14), TRIM, { at: [0, hy, hz], dir: tilt, name: "hatchRing" });
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.14, 14), GLASS, { at: [0, hy, hz + 0.02], dir: tilt, name: "hatchGlass" });
  const cross = (w: number, h: number, rz: number) =>
    b.part(new THREE.BoxGeometry(w, h, 0.05), TRIM, {
      at: [0, hy + 0.01, hz + 0.1],
      dir: tilt,
      axis: "z",
      rotation: undefined,
      name: "hatchMullion",
    });
  cross(0.04, 0.6, 0);
  cross(0.6, 0.04, 0);
  // little wooden hood: two sloped boards
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.32), WOOD, {
      at: [s * 0.2, hy + 0.5, hz + 0.1],
      rotation: [-20, s * -18, s * 14],
      name: "hatchHood",
    });
  }
  for (const s of [1, -1]) {
    b.rod([s * 0.38, hy + 0.2, hz + 0.1], [s * 0.38, hy + 0.5, hz + 0.1], 0.03, WOOD_DARK, { name: "hatchHoodPost" });
  }
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.2), WOOD_DARK, {
    at: [0, hy - 0.42, hz + 0.18],
    name: "hatchSill",
  });
}
    return addGalleryBunting;
  })(),
);
