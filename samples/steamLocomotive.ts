// Steam Locomotive: a 760 mm gauge 2-6-0 with its coal tender on a short stretch of sleepered track.
// Flat low-poly: every mesh faceted, flat colours plus SVG drawings (lettering, plates, grime, smoke, grass).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Steam Locomotive",
  description:
    "Narrow-gauge 2-6-0 steam locomotive with coal tender on a stretch of sleepered track: green livery, brass fittings, jointed wheels and rods, smoke plume cards.",
};

// ---------------------------------------------------------------- palette
const GREEN = "#2f5d46";
const GREEN_D = "#22473a";
const CREAM = "#e6dcb6";
const BLACK = "#222228";
const IRON = "#3a3c44";
const STEEL = "#a2a8b0";
const STEEL_D = "#6d737b";
const RED = "#a8291f";
const RED_D = "#7d1f19";
const BRASS = "#d3a53f";
const COPPER = "#b8652f";
const COAL = "#1f1f25";
const COAL2 = "#3d3d46";
const WOOD_IN = "#b89b6c";
const CANVAS = "#77815f";
const CANVAS_D = "#5b6648";
const FLOOR = "#5b4732";
const BALLAST = "#8d877b";
const GRASS = "#6e8c3e";
const RAIL_BODY = "#6b5748";
const RAIL_HEAD = "#b1aea6";
const PLATE_DARK = "#3b3631";
const WARM = "#ffe7a0";
const LAMP_RED = "#ff3a26";
const ROOF = "#d4cbb0";

// ---------------------------------------------------------------- dimensions (meters)
const Y0 = 0.255; // rail head top
const H = (h: number) => Y0 + h; // height above the rails
const GX = 0.415; // rail centre / wheel tread centre
const DEG = Math.PI / 180;
const SEG = 10; // wheel and boiler facets
const DRIVER_R = 0.36;
const PONY_R = 0.2;
const TENDER_R = 0.22;
const flatAxle = (r: number) => r * Math.cos(Math.PI / SEG); // axle height with a facet on the rail

// ---------------------------------------------------------------- drawings
const svgDoc = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const lumpy = (seed: number, cx: number, cy: number, r: number, n: number, jit: number) => {
  const g = rng(seed);
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - jit + g() * jit * 2);
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join(" ");
};

const puffSvg = (seed: number, base: string, shade: string, light: string) =>
  svg(
    svgDoc(
      100,
      100,
      `<polygon points="${lumpy(seed, 50, 50, 46, 11, 0.14)}" fill="${base}"/>` +
        `<polygon points="${lumpy(seed + 11, 58, 64, 30, 8, 0.2)}" fill="${shade}"/>` +
        `<polygon points="${lumpy(seed + 23, 38, 36, 17, 7, 0.22)}" fill="${light}"/>`,
    ),
    { size: 128 },
  );

const spraySvg = svg(
  svgDoc(
    60,
    80,
    `<polygon points="${lumpy(51, 30, 68, 9, 7, 0.2)}" fill="#dfe6e7"/>` +
      `<polygon points="${lumpy(52, 30, 48, 14, 8, 0.2)}" fill="#eef2f2"/>` +
      `<polygon points="${lumpy(53, 30, 24, 19, 9, 0.18)}" fill="#ffffff"/>` +
      `<polygon points="${lumpy(54, 36, 30, 9, 6, 0.3)}" fill="#d3dcdd"/>`,
  ),
  { size: 128 },
);

const grassA = svg(
  svgDoc(
    40,
    50,
    `<polygon points="4,50 8,18 12,50" fill="#4f6b2c"/><polygon points="10,50 18,4 24,50" fill="#6e8c3e"/>` +
      `<polygon points="18,50 28,14 32,50" fill="#86a64c"/><polygon points="24,50 36,26 38,50" fill="#5b7a33"/>` +
      `<polygon points="14,50 14,26 19,50" fill="#3f5a25"/>`,
  ),
  { size: 128 },
);
const grassB = svg(
  svgDoc(
    40,
    50,
    `<polygon points="6,50 10,22 14,50" fill="#5b7a33"/><polygon points="14,50 20,8 25,50" fill="#7c9b47"/>` +
      `<polygon points="22,50 32,20 35,50" fill="#4f6b2c"/>` +
      `<polygon points="18,14 22,6 26,14 22,18" fill="#e8d36a"/><polygon points="8,24 11,19 14,24 11,27" fill="#f2efe2"/>`,
  ),
  { size: 128 },
);

const sleeperTex = svg(
  svgDoc(
    260,
    34,
    `<rect width="260" height="34" fill="#5d4a39"/>` +
      `<polygon points="0,6 90,7 140,5 260,8 260,10 140,9 90,11 0,10" fill="#4a3a2c"/>` +
      `<polygon points="0,18 60,17 170,19 260,17 260,19 170,21 60,20 0,21" fill="#4a3a2c"/>` +
      `<polygon points="0,27 110,28 200,26 260,28 260,30 200,29 110,31 0,30" fill="#6e5944"/>` +
      `<polygon points="150,0 158,0 154,34 149,34" fill="#3a2d22"/>` +
      `<rect x="0" y="0" width="6" height="34" fill="#7a6650"/><rect x="254" y="0" width="6" height="34" fill="#7a6650"/>`,
  ),
  { size: 512 },
);

const pebbleGrid = (seed: number, w: number, h: number, step: number, colors: string[]) => {
  const g = rng(seed);
  let out = "";
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step) {
      const cx = x + step / 2 + (g() - 0.5) * step * 0.6;
      const cy = y + step / 2 + (g() - 0.5) * step * 0.6;
      const c = colors[Math.floor(g() * colors.length)];
      out += `<polygon points="${lumpy(Math.floor(g() * 1e6), cx, cy, step * 0.55, 6, 0.25)}" fill="${c}"/>`;
    }
  return out;
};

const ballastTex = svg(
  svgDoc(170, 100, pebbleGrid(5, 170, 100, 10, ["#a9a397", "#7c766b", "#95907f", "#bdb7a8", "#6b665c"])),
  {
    size: 512,
  },
);

const verdureTex = svg(
  svgDoc(
    100,
    100,
    `<polygon points="${lumpy(3, 26, 30, 16, 7, 0.3)}" fill="#5c7a35"/>` +
      `<polygon points="${lumpy(4, 70, 22, 12, 7, 0.3)}" fill="#7e9d48"/>` +
      `<polygon points="${lumpy(5, 60, 72, 18, 7, 0.3)}" fill="#587433"/>` +
      `<polygon points="${lumpy(6, 20, 78, 10, 6, 0.3)}" fill="#8a7046"/>` +
      `<polygon points="${lumpy(7, 86, 54, 7, 6, 0.3)}" fill="#8a7046"/>` +
      `<polygon points="44,50 47,44 50,50 47,53" fill="#f2efe2"/><polygon points="80,88 83,82 86,88 83,91" fill="#e8d36a"/>` +
      `<polygon points="12,54 15,48 18,54 15,57" fill="#e8d36a"/><polygon points="50,10 53,4 56,10 53,13" fill="#f2efe2"/>`,
  ),
  { size: 256 },
);

const letterFont = `font-family="Georgia, 'DejaVu Serif', serif" font-weight="bold"`;

const tenderPanel = svg(
  svgDoc(
    330,
    96,
    `<rect x="3" y="3" width="324" height="90" rx="10" fill="none" stroke="${CREAM}" stroke-width="4"/>` +
      `<rect x="11" y="11" width="308" height="74" rx="6" fill="none" stroke="${RED}" stroke-width="2.5"/>` +
      `<text x="165" y="47" text-anchor="middle" font-size="27" ${letterFont} fill="#c9a23a" stroke="${RED_D}" stroke-width="0.8" textLength="270" lengthAdjust="spacingAndGlyphs">MOORLAND MINERAL</text>` +
      `<text x="165" y="76" text-anchor="middle" font-size="22" ${letterFont} fill="${CREAM}" textLength="190" lengthAdjust="spacingAndGlyphs">RAILWAY  No. 7</text>`,
  ),
  { size: 1024 },
);

const cabPanel = svg(
  svgDoc(
    190,
    80,
    `<rect x="3" y="3" width="184" height="74" rx="8" fill="none" stroke="${CREAM}" stroke-width="3.5"/>` +
      `<rect x="9" y="9" width="172" height="62" rx="5" fill="none" stroke="${RED}" stroke-width="2"/>`,
  ),
  { size: 768 },
);

const numberPlate = svg(
  svgDoc(
    100,
    64,
    `<ellipse cx="50" cy="32" rx="48" ry="30" fill="#8a6a22"/><ellipse cx="50" cy="32" rx="43" ry="25" fill="#d8ab45"/>` +
      `<text x="50" y="49" text-anchor="middle" font-size="44" ${letterFont} fill="#2a1d07">7</text>`,
  ),
  { size: 256 },
);

const namePlate = svg(
  svgDoc(
    200,
    64,
    `<polygon points="10,4 190,4 198,32 190,60 10,60 2,32" fill="#8a6a22"/>` +
      `<polygon points="15,9 185,9 191,32 185,55 15,55 9,32" fill="#d8ab45"/>` +
      `<text x="100" y="46" text-anchor="middle" font-size="38" ${letterFont} fill="#2a1d07" textLength="146" lengthAdjust="spacingAndGlyphs">WREN</text>`,
  ),
  { size: 512 },
);

const doorTex = svg(
  svgDoc(
    200,
    200,
    `<circle cx="100" cy="100" r="98" fill="${BLACK}"/>` +
      `<circle cx="100" cy="100" r="92" fill="none" stroke="${STEEL_D}" stroke-width="5"/>` +
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return `<circle cx="${(100 + Math.cos(a) * 82).toFixed(1)}" cy="${(100 + Math.sin(a) * 82).toFixed(1)}" r="4.2" fill="${STEEL}"/>`;
      }).join("") +
      `<polygon points="6,88 194,88 194,112 6,112" fill="${IRON}"/><polygon points="88,6 112,6 112,194 88,194" fill="${IRON}"/>` +
      `<circle cx="100" cy="100" r="22" fill="${STEEL_D}"/><circle cx="100" cy="100" r="13" fill="${BRASS}"/>` +
      `<polygon points="100,40 108,62 92,62" fill="${STEEL}"/><polygon points="100,160 108,138 92,138" fill="${STEEL}"/>` +
      `<polygon points="40,100 62,92 62,108" fill="${STEEL}"/><polygon points="160,100 138,92 138,108" fill="${STEEL}"/>`,
  ),
  { size: 512 },
);

const beamTex = svg(
  svgDoc(
    130,
    30,
    `<rect width="130" height="30" fill="${RED}"/><rect x="0" y="0" width="130" height="3" fill="${RED_D}"/>` +
      `<rect x="0" y="27" width="130" height="3" fill="${RED_D}"/>` +
      Array.from({ length: 13 }, (_, i) => `<circle cx="${5 + i * 10}" cy="6" r="2" fill="#d85a48"/>`).join("") +
      Array.from({ length: 13 }, (_, i) => `<circle cx="${5 + i * 10}" cy="24" r="2" fill="#d85a48"/>`).join("") +
      `<polygon points="38,8 54,8 54,22 38,22" fill="${CREAM}"/>` +
      `<text x="46" y="20.5" text-anchor="middle" font-size="14" ${letterFont} fill="${RED_D}">7</text>` +
      `<polygon points="74,8 98,8 98,22 74,22" fill="${CREAM}"/>` +
      `<text x="86" y="19.5" text-anchor="middle" font-size="10" ${letterFont} fill="${RED_D}" textLength="20" lengthAdjust="spacingAndGlyphs">MMR</text>`,
  ),
  { size: 1024 },
);

const backheadTex = svg(
  svgDoc(
    130,
    120,
    `<rect width="130" height="120" fill="#2c2a2a"/>` +
      `<circle cx="65" cy="92" r="20" fill="#16100c"/><circle cx="65" cy="92" r="14" fill="#ff8a1c"/>` +
      `<circle cx="65" cy="95" r="8" fill="#ffd36a"/>` +
      `<circle cx="36" cy="44" r="15" fill="${BRASS}"/><circle cx="36" cy="44" r="11" fill="#ece6d0"/><polygon points="36,44 44,36 46,38" fill="#222"/>` +
      `<circle cx="94" cy="44" r="15" fill="${BRASS}"/><circle cx="94" cy="44" r="11" fill="#ece6d0"/><polygon points="94,44 88,35 86,38" fill="#222"/>` +
      `<rect x="62" y="14" width="6" height="40" fill="${BRASS}"/><circle cx="65" cy="14" r="6" fill="${RED}"/>` +
      `<rect x="10" y="64" width="6" height="48" fill="${STEEL}"/><circle cx="13" cy="62" r="5" fill="${RED}"/>` +
      `<rect x="114" y="64" width="6" height="48" fill="${STEEL}"/><circle cx="117" cy="62" r="5" fill="${BRASS}"/>`,
  ),
  { size: 512 },
);
const roofTex = svg(
  svgDoc(
    146,
    156,
    Array.from(
      { length: 6 },
      (_, i) =>
        `<polygon points="${10 + i * 25},0 ${13.5 + i * 25},0 ${13.5 + i * 25},156 ${10 + i * 25},156" fill="#b9ae8e"/>`,
    ).join("") +
      `<polygon points="${lumpy(61, 44, 26, 26, 9, 0.3)}" fill="#a79f86"/><polygon points="${lumpy(62, 112, 40, 18, 8, 0.3)}" fill="#a79f86"/>` +
      `<polygon points="30,96 70,92 74,122 34,126" fill="#c6bd9f"/>` +
      `<polygon points="100,110 130,108 132,150 102,152" fill="#a39b82"/>`,
  ),
  { size: 512 },
);

const sootTex = svg(
  svgDoc(
    100,
    70,
    `<polygon points="${lumpy(71, 50, 52, 22, 8, 0.25)}" fill="#2d2a28"/>` +
      `<polygon points="50,58 40,2 47,2" fill="#2d2a28"/><polygon points="42,50 24,10 31,8" fill="#2d2a28"/>` +
      `<polygon points="58,50 74,12 79,14" fill="#2d2a28"/>`,
  ),
  { size: 256 },
);

const grimeTex = svg(
  svgDoc(
    300,
    40,
    `<polygon points="0,0 300,0 300,4 270,4 266,22 260,4 210,4 207,32 202,4 130,4 127,18 122,4 60,4 57,26 52,4 0,4" fill="#2b241f"/>` +
      `<polygon points="0,0 40,0 38,10 30,8 28,16 20,8 0,10" fill="#6b3b22"/>` +
      `<polygon points="170,0 230,0 226,12 214,10 208,18 196,10 172,12" fill="#6b3b22"/>`,
  ),
  { size: 768 },
);

const scuffTex = svg(
  svgDoc(
    200,
    20,
    `<polygon points="4,4 40,3 52,8 20,12" fill="#6d6a66"/><polygon points="70,10 110,8 122,13 90,16" fill="#6d6a66"/>` +
      `<polygon points="140,3 180,4 190,9 150,10" fill="#6d6a66"/>`,
  ),
  { size: 256 },
);

// ---------------------------------------------------------------- build
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "steamLocomotive" });
  const R = rng(41);

  // skeleton ---------------------------------------------------------------
  const base = b.joint("base", { at: [0, 0, 0] });
  const track = b.joint("track", { parent: base, at: [0, 0.1, 0] });
  const chassis = b.joint("chassis", { parent: base, at: [0, H(0.55), 0.3] });
  const tender = b.joint("tender", { parent: chassis, at: [0, H(0.55), -1.3] });
  type J = typeof base;

  // batches of static geometry, merged per bone and colour -------------------
  const batches = new Map<string, { bone: J; color: string; geos: THREE.BufferGeometry[] }>();
  const add = (bone: J, color: string, ...geos: THREE.BufferGeometry[]) => {
    const key = `${bone.name}|${color}`;
    let e = batches.get(key);
    if (!e) batches.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(...geos);
  };
  const flush = () => {
    for (const { bone, color, geos } of batches.values()) {
      const merged = mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
      if (merged) b.part(merged, color, { bone, at: [0, 0, 0], flat: true, name: `${bone.name}${color}` });
    }
    batches.clear();
  };
  // a box of w,h,d centred at x,y,z, optionally turned (degrees, XYZ)
  const bx = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    rot: [number, number, number] = [0, 0, 0],
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rot[0] || rot[1] || rot[2])
      g.applyMatrix4(
        new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
      );
    return g.translate(x, y, z);
  };
  // a faceted rod from a to c
  const rd = (a: [number, number, number], c: [number, number, number], r: number, sides = 6, rTop = r) => {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const dir = C.clone().sub(A);
    const g = new THREE.CylinderGeometry(rTop, r, dir.length(), sides);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
    const m = A.add(C).multiplyScalar(0.5);
    return g.translate(m.x, m.y, m.z);
  };
  const cyl = (r: number, h: number, x: number, y: number, z: number, sides = 8, rTop = r) =>
    new THREE.CylinderGeometry(rTop, r, h, sides).translate(x, y, z);
  const cylX = (r: number, h: number, x: number, y: number, z: number, sides = 8) =>
    new THREE.CylinderGeometry(r, r, h, sides).rotateZ(Math.PI / 2).translate(x, y, z);
  const cylZ = (r: number, h: number, x: number, y: number, z: number, sides = 8) =>
    new THREE.CylinderGeometry(r, r, h, sides).rotateX(Math.PI / 2).translate(x, y, z);
  // a decal plane facing `dir`, floating on a flat surface
  const plane = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: [number, number, number],
    dir: [number, number, number],
    bone: J,
    name: string,
  ) => b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, name });

  // ===================================================================== TRACK
  const LEN = 7.2;
  const ballastSurface = b.extrude(
    [
      [-1.18, 0],
      [1.18, 0],
      [0.88, 0.11],
      [-0.88, 0.11],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: LEN, color: BALLAST, bone: track, name: "ballast" },
  );
  for (let i = 0; i < 7; i++) {
    const z = -3.15 + i * 1.05;
    b.decal(ballastSurface, ballastTex, {
      at: [0, 0.11, z],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      size: [1.7, 1.05],
      segments: [1, 1],
      bone: track,
      lift: 0.002,
      name: "pebbles",
    });
  }
  // grass verges with ragged outer edges
  for (const s of [1, -1]) {
    const edge: [number, number][] = [];
    const zs = [-3.6, -2.9, -2.1, -1.3, -0.5, 0.3, 1.1, 1.9, 2.7, 3.6];
    zs.forEach((z) => edge.push([s * (1.5 + R() * 0.28), z]));
    const outline: [number, number][] = [[s * 1.05, -3.6], ...edge, [s * 1.05, 3.6]];
    const verge = b.extrude(
      outline.map(([x, z]) => [x, -z] as [number, number]),
      { at: [0, 0.04, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.08, color: GRASS, bone: track, name: `verge${s}` },
    );
    for (let i = 0; i < 6; i++)
      b.decal(verge, verdureTex, {
        at: [s * 1.3, 0.08, -3.0 + i * 1.2],
        dir: [0, 1, 0],
        up: [0, 0, -1],
        size: [0.52, 1.2],
        segments: [1, 3],
        bone: track,
        name: "meadow",
      });
  }

  // sleepers, tie plates, rails ------------------------------------------------
  const sleepers: THREE.BufferGeometry[] = [];
  const plates: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 19; k++) {
    const z = -3.6 + k * 0.4;
    const g = new THREE.BoxGeometry(1.32, 0.095, 0.17);
    g.rotateY((R() - 0.5) * 0.08);
    g.translate((R() - 0.5) * 0.03, 0.1175 + (R() - 0.5) * 0.008, z);
    sleepers.push(g);
    for (const s of [1, -1]) plates.push(bx(0.16, 0.012, 0.13, s * GX, 0.171, z));
  }
  b.part(mergeGeometries(sleepers.map((g) => g.toNonIndexed()))!, "#ffffff", {
    bone: track,
    at: [0, 0, 0],
    texture: sleeperTex,
    flat: true,
    name: "sleepers",
  });
  add(track, PLATE_DARK, ...plates);
  for (const s of [1, -1]) {
    const x = s * GX;
    for (const [z0, z1] of [
      [-3.6, 0.55],
      [0.565, 3.6],
    ]) {
      const zc = (z0 + z1) / 2;
      const L = z1 - z0;
      add(track, RAIL_BODY, bx(0.09, 0.016, L, x, 0.173, zc), bx(0.028, 0.05, L, x, 0.205, zc));
      add(track, RAIL_HEAD, bx(0.055, 0.03, L, x, 0.24, zc));
    }
    add(track, STEEL_D, bx(0.012, 0.06, 0.4, x - 0.03, 0.21, 0.56), bx(0.012, 0.06, 0.4, x + 0.03, 0.21, 0.56));
  }
  // tufts of grass between the stones and along the verges
  const tufts = [];
  for (let i = 0; i < 90; i++) {
    const s = R() < 0.5 ? 1 : -1;
    const near = R() < 0.3;
    const x = s * (near ? 0.86 + R() * 0.25 : 1.1 + R() * 0.85);
    const z = -3.5 + R() * 7.0;
    tufts.push(frame([x, near ? 0.105 : 0.078, z], [0, 1, 0]));
  }
  b.cards(tufts, [grassA, grassB], {
    size: [0.15, 0.2],
    vary: 0.4,
    spin: 180,
    rng: R,
    cross: true,
    bone: track,
    sink: 0.15,
  });
  const fringe = [];
  for (let i = 0; i < 30; i++) {
    const s = i % 2 ? 1 : -1;
    fringe.push(frame([s * (0.56 + R() * 0.2), 0.12, -3.6 + (i / 30) * 7.2], [0, 1, 0]));
  }
  b.cards(fringe, grassA, { size: [0.1, 0.1], vary: 0.4, spin: 180, rng: R, cross: true, bone: track, sink: 0.2 });

  // ===================================================================== LOCOMOTIVE
  // boiler -----------------------------------------------------------------------
  const YB = H(1.3); // boiler axis height
  const rB = (z: number) => 0.39 + ((1.86 - z) / 1.56) * 0.07; // barrel radius at z
  const boiler = b.lathe(
    [
      [0, 2.15],
      [0.42, 2.15],
      [0.42, 1.88],
      [0.39, 1.86],
      [0.46, 0.3],
      [0, 0.3],
    ],
    { at: [0, YB, 0], axis: [0, 0, 1], segments: SEG, color: GREEN, bone: chassis, name: "boiler" },
  );
  // smokebox: black band and front door
  b.lathe(
    [
      [0, 2.145],
      [0.425, 2.145],
      [0.425, 1.9],
      [0, 1.9],
    ],
    { at: [0, YB, 0], axis: [0, 0, 1], segments: SEG, color: BLACK, bone: chassis, name: "smokebox" },
  );
  b.part(new THREE.CircleGeometry(0.4, SEG), "#ffffff", {
    bone: chassis,
    at: [0, YB, 2.157],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTex,
    name: "smokeboxDoor",
  });
  plane(numberPlate, 0.2, 0.128, [0, YB + 0.2, 2.164], [0, 0, 1], chassis, "numberPlate");
  // boiler bands
  for (const z of [1.62, 1.12, 0.66]) {
    const r = rB(z);
    b.lathe(
      [
        [r - 0.02, z - 0.03],
        [r + 0.022, z - 0.03],
        [r + 0.022, z + 0.03],
        [r - 0.02, z + 0.03],
      ],
      { at: [0, YB, 0], axis: [0, 0, 1], segments: SEG, color: BRASS, bone: chassis, name: "band" },
    );
  }
  // dome, sandbox, chimney, safety valves, whistle
  const topAt = (z: number) => YB + rB(z) - 0.02;
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.22, 0.05],
      [0.18, 0.15],
      [0.15, 0.3],
      [0.09, 0.4],
      [0, 0.43],
    ],
    { at: [0, topAt(1.0), 1.0], color: BRASS, segments: SEG, bone: chassis, name: "dome", smoothing: 0 },
  );
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.15, 0.1],
      [0.11, 0.16],
      [0.11, 0.2],
      [0, 0.23],
    ],
    { at: [0, topAt(1.42), 1.42], color: GREEN_D, segments: SEG, bone: chassis, name: "sandbox" },
  );
  const chimney = b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.13, 0.12],
      [0.09, 0.3],
      [0.09, 0.85],
      [0.135, 1.05],
      [0.165, 1.12],
      [0.165, 1.2],
      [0.12, 1.2],
      [0.12, 1.14],
      [0, 1.14],
    ],
    { at: [0, topAt(1.78) - 0.02, 1.78], color: BLACK, segments: SEG, bone: chassis, name: "chimney" },
  );
  const chimneyTop = topAt(1.78) - 0.02 + 1.2;
  b.lathe(
    [
      [0.167, 1.12],
      [0.17, 1.12],
      [0.17, 1.2],
      [0.167, 1.2],
    ],
    { at: chimney.at, color: COPPER, segments: SEG, bone: chassis, name: "chimneyCap" },
  );
  // firebox-top fittings
  const fbTop = YB + 0.46;
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.06, 0.08],
      [0.04, 0.16],
      [0, 0.2],
    ],
    { at: [0, fbTop - 0.04, 0.48], color: BRASS, segments: 6, bone: chassis, name: "safety" },
  );
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.035, 0.12],
      [0.05, 0.12],
      [0.05, 0.2],
      [0.03, 0.22],
      [0, 0.22],
    ],
    { at: [0.16, fbTop - 0.07, 0.56], color: BRASS, segments: 6, bone: chassis, name: "whistle" },
  );
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.2), BRASS, {
    bone: chassis,
    at: [0.16, fbTop + 0.13, 0.52],
    flat: true,
    name: "whistleLever",
  });

  // headlamp on the smokebox top
  const lampY = YB + 0.42;
  add(chassis, IRON, bx(0.22, 0.03, 0.2, 0, lampY + 0.01, 2.03));
  add(chassis, BLACK, bx(0.22, 0.26, 0.2, 0, lampY + 0.15, 2.03), bx(0.25, 0.03, 0.23, 0, lampY + 0.295, 2.03));
  add(chassis, BRASS, cyl(0.045, 0.05, 0, lampY + 0.34, 2.03, 6, 0.02));
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.17), WARM, {
      bone: chassis,
      at: [0, lampY + 0.15, 2.135],
      dir: [0, 0, 1],
      axis: "z",
      name: "headlampGlass",
    }),
    1.4,
  );
  add(chassis, BRASS, bx(0.17, 0.19, 0.012, 0, lampY + 0.15, 2.128));

  // handrails along both sides, knobs, pipes
  for (const s of [1, -1]) {
    const hx = s * 0.49;
    const hy = YB + 0.22;
    add(chassis, BRASS, rd([hx, hy, 2.0], [hx, hy, 0.4], 0.013, 4));
    add(chassis, BRASS, cylZ(0.03, 0.03, hx, hy, 2.0, 6), cylZ(0.03, 0.03, hx, hy, 0.4, 6));
    for (const z of [1.65, 1.2, 0.75])
      add(chassis, BRASS, rd([s * (rB(z) + 0.02), hy - 0.07, z], [hx, hy, z], 0.011, 4));
    // steam pipe from the smokebox down to the cylinder
    add(
      chassis,
      STEEL_D,
      rd([s * 0.34, YB - 0.1, 1.98], [s * 0.545, H(0.75), 1.8], 0.032, 6),
      cyl(0.05, 0.05, s * 0.545, H(0.72), 1.8, 6),
    );
  }

  // running boards, cab floor, frame --------------------------------------------------
  for (const s of [1, -1]) {
    add(chassis, IRON, bx(0.4, 0.045, 1.95, s * 0.54, H(0.905), 1.27));
    add(chassis, CREAM, bx(0.012, 0.055, 1.95, s * 0.737, H(0.9), 1.27));
    add(chassis, IRON, rd([s * 0.33, H(0.58), 2.36], [s * 0.33, H(0.58), -1.15], 0.035, 4));
    add(chassis, IRON, bx(0.045, 0.3, 3.5, s * 0.31, H(0.56), 0.62));
  }
  add(
    chassis,
    IRON,
    bx(0.66, 0.1, 1.98, 0, H(0.85), 1.25),
    bx(0.7, 0.1, 0.45, 0, H(0.46), 2.0),
    bx(0.7, 0.1, 0.3, 0, H(0.46), -0.5),
  );
  add(chassis, FLOOR, bx(1.36, 0.05, 1.5, 0, H(0.895), -0.4));
  add(chassis, IRON, bx(1.36, 0.08, 1.5, 0, H(0.83), -0.4));
  add(chassis, IRON, bx(0.6, 0.12, 0.1, 0, H(0.61), 0.2));

  // cab -------------------------------------------------------------------------------
  const FL = H(0.92);
  const CZ0 = 0.34;
  const CZ1 = -1.12;
  const cabLen = CZ0 - CZ1;
  const cabMidZ = (CZ0 + CZ1) / 2;
  add(chassis, GREEN, bx(1.32, 1.38, 0.04, 0, FL + 0.69, CZ0 - 0.02)); // front wall, boiler passes through it
  for (const s of [1, -1]) {
    const wx = s * 0.64;
    add(chassis, GREEN, bx(0.04, 0.58, cabLen, wx, FL + 0.29, cabMidZ)); // lower panel
    add(chassis, GREEN, bx(0.04, 0.38, cabLen, wx, FL + 1.19, cabMidZ)); // header band above the windows
    for (const [za, zb] of [
      [CZ0, 0.22],
      [-0.36, -0.46],
      [CZ1 + 0.1, CZ1],
    ])
      add(chassis, GREEN, bx(0.04, 0.42, za - zb, wx, FL + 0.79, (za + zb) / 2));
    add(
      chassis,
      WOOD_IN,
      bx(0.012, 0.56, cabLen - 0.02, s * 0.612, FL + 0.29, cabMidZ),
      bx(0.012, 0.36, cabLen - 0.02, s * 0.612, FL + 1.19, cabMidZ),
    );
    // cream window frames
    for (const [za, zb] of [
      [0.22, -0.36],
      [-0.46, CZ1 + 0.1],
    ]) {
      const zc = (za + zb) / 2;
      const wl = za - zb;
      add(chassis, CREAM, bx(0.02, 0.022, wl, s * 0.66, FL + 0.6, zc), bx(0.02, 0.022, wl, s * 0.66, FL + 0.99, zc));
    }
    // cab side lining and number plate
    plane(cabPanel, 1.3, 0.5, [s * 0.662, FL + 0.29, cabMidZ], [s, 0, 0], chassis, "cabPanel");
  }
  // backhead inside the front wall
  plane(backheadTex, 0.75, 0.69, [0, FL + 0.6, CZ0 - 0.045], [0, 0, -1], chassis, "backhead");
  glow(
    b.part(new THREE.CircleGeometry(0.07, 8), "#ffb347", {
      bone: chassis,
      at: [0, FL + 0.416, CZ0 - 0.047],
      dir: [0, 0, -1],
      axis: "z",
      name: "firehole",
    }),
    1.3,
  );
  // roof with overhang, ribs and vent
  const roof = b.extrude(
    [
      [-0.76, 0],
      [0.76, 0],
      [0.76, 0.03],
      [0.56, 0.1],
      [0.28, 0.14],
      [0, 0.155],
      [-0.28, 0.14],
      [-0.56, 0.1],
      [-0.76, 0.03],
    ],
    { at: [0, H(2.3), -0.4], x: [1, 0, 0], y: [0, 1, 0], thickness: 1.6, color: ROOF, bone: chassis, name: "cabRoof" },
  );
  b.decal(roof, roofTex, {
    at: [0, H(2.46), -0.4],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [1.46, 1.56],
    segments: [8, 4],
    bone: chassis,
    lift: 0.003,
    name: "roofSeams",
  });
  add(chassis, GREEN_D, bx(0.3, 0.06, 0.4, 0, H(2.49), -0.4), bx(0.24, 0.04, 0.32, 0, H(2.54), -0.4));
  add(chassis, GREEN_D, bx(1.52, 0.05, 0.04, 0, H(2.3), 0.39), bx(1.52, 0.05, 0.04, 0, H(2.3), -1.19));
  // canvas weather-sheet hanging from the roof behind the crew, tied back in the middle
  for (const s of [1, -1]) {
    add(
      chassis,
      CANVAS,
      bx(0.4, 1.0, 0.02, s * 0.43, FL + 0.86, CZ1 + 0.02, [0, 0, s * 4]),
      bx(0.05, 1.0, 0.05, s * 0.64, FL + 0.86, CZ1 + 0.02),
    );
    add(chassis, CANVAS_D, bx(0.1, 0.95, 0.03, s * 0.2, FL + 0.86, CZ1 + 0.03, [0, 0, -s * 6]));
  }
  add(chassis, IRON, rd([-0.66, FL + 1.34, CZ1 + 0.02], [0.66, FL + 1.34, CZ1 + 0.02], 0.012, 4));
  // interior lamp
  glow(
    b.part(new THREE.IcosahedronGeometry(0.045, 0), WARM, {
      bone: chassis,
      at: [0.35, FL + 1.15, -0.2],
      flat: true,
      name: "cabLamp",
    }),
    1.2,
  );
  add(chassis, IRON, rd([0.35, FL + 1.35, -0.2], [0.35, FL + 1.2, -0.2], 0.01, 4));
  // reversing lever and brake stand
  add(chassis, STEEL_D, rd([-0.3, FL, 0.0], [-0.3, FL + 0.75, 0.05], 0.018, 6));
  add(chassis, RED, cyl(0.07, 0.025, -0.3, FL + 0.76, 0.05, 6));

  // steps below the cab doors
  for (const s of [1, -1]) {
    add(
      chassis,
      IRON,
      bx(0.18, 0.02, 0.36, s * 0.75, H(0.55), -0.2),
      rd([s * 0.66, H(0.88), -0.05], [s * 0.66, H(0.55), -0.05], 0.014, 4),
      rd([s * 0.66, H(0.88), -0.35], [s * 0.66, H(0.55), -0.35], 0.014, 4),
    );
    add(chassis, STEEL_D, bx(0.18, 0.012, 0.36, s * 0.75, H(0.563), -0.2));
  }

  // buffer beams, buffers, couplings ---------------------------------------------------
  b.part(new THREE.BoxGeometry(1.3, 0.3, 0.1), RED, {
    bone: chassis,
    at: [0, H(0.58), 2.41],
    flat: true,
    name: "frontBeam",
  });
  plane(beamTex, 1.3, 0.3, [0, H(0.58), 2.462], [0, 0, 1], chassis, "frontBeamDecal");
  b.part(new THREE.BoxGeometry(1.3, 0.3, 0.1), RED, {
    bone: chassis,
    at: [0, H(0.58), -1.2],
    flat: true,
    name: "rearBeam",
  });
  for (const s of [1, -1]) {
    add(chassis, STEEL_D, cylZ(0.045, 0.14, s * 0.48, H(0.58), 2.52, 8), cylZ(0.095, 0.035, s * 0.48, H(0.58), 2.6, 8));
    add(
      chassis,
      STEEL_D,
      cylZ(0.045, 0.14, s * 0.48, H(0.58), -1.32, 8),
      cylZ(0.095, 0.035, s * 0.48, H(0.58), -1.4, 8),
    );
  }
  add(chassis, IRON, bx(0.06, 0.06, 0.2, 0, H(0.58), 2.56), bx(0.09, 0.12, 0.05, 0, H(0.52), 2.63));
  add(chassis, STEEL_D, bx(0.03, 0.12, 0.03, 0, H(0.58), 2.66));

  // cowcatcher: a V of slats under the front beam -----------------------------------------
  const CATCH_Z = 2.46;
  const apexZ = 2.74;
  const catchTop = H(0.5);
  const catchLow = H(0.17);
  const slatX = [-0.6, -0.48, -0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36, 0.48, 0.6];
  const slatZ = (x: number) => CATCH_Z + 0.02 + (apexZ - CATCH_Z) * (1 - Math.abs(x) / 0.62);
  for (const x of slatX) add(chassis, BLACK, rd([x, catchTop, CATCH_Z + 0.02], [x, catchLow, slatZ(x)], 0.014, 4));
  for (const s of [1, -1]) {
    add(chassis, BLACK, rd([s * 0.62, catchTop, CATCH_Z], [0, catchTop - 0.04, apexZ], 0.03, 4));
    add(chassis, BLACK, rd([s * 0.62, catchLow + 0.02, CATCH_Z], [0, catchLow, apexZ], 0.026, 4));
    add(chassis, IRON, rd([s * 0.3, H(0.58), 2.37], [s * 0.3, catchLow, 2.55], 0.02, 4));
  }
  add(chassis, RED_D, bx(0.08, 0.05, 0.05, 0, catchTop - 0.06, apexZ - 0.01));

  // cylinders, guides, valve gear -----------------------------------------------------------
  const yP = H(0.54); // piston axis
  const PX = 0.545;
  for (const s of [1, -1]) {
    const x = s * PX;
    add(chassis, IRON, bx(0.15, 0.2, 0.36, s * 0.365, H(0.54), 1.78)); // cylinder saddle
    b.rod([x, yP, 1.62], [x, yP, 1.97], 0.105, { section: { ngon: 8 }, color: BLACK, bone: chassis, name: "cylinder" });
    add(chassis, BRASS, cylZ(0.11, 0.03, x, yP, 1.6, 6), cylZ(0.11, 0.03, x, yP, 1.985, 6));
    add(chassis, IRON, bx(0.11, 0.1, 0.36, x, yP + 0.13, 1.8)); // steam chest
    add(chassis, STEEL_D, rd([x, yP - 0.105, 1.66], [x + s * 0.02, yP - 0.17, 1.66], 0.012, 4)); // drain cock
    // guide bars
    add(chassis, STEEL_D, bx(0.03, 0.022, 0.42, x, yP + 0.045, 1.35), bx(0.03, 0.022, 0.42, x, yP - 0.045, 1.35));
    add(chassis, IRON, bx(0.03, 0.14, 0.04, x, yP, 1.15), bx(0.03, 0.14, 0.04, x, yP, 1.56));
    add(chassis, IRON, bx(0.12, 0.05, 0.05, s * 0.49, yP, 1.15));
  }

  // wheels and rods -----------------------------------------------------------------------
  const driverZ = [0.95, 0.1, -0.75];
  const driverY = H(flatAxle(DRIVER_R));
  const PIN_R = 0.13;
  const wheelGeo = (s: number, cz: number, cy: number, Rw: number, spokes: number, psi0: number, weight: boolean) => {
    const cx = s * GX;
    const rot = (g: THREE.BufferGeometry) => g.rotateZ(s > 0 ? -Math.PI / 2 : Math.PI / 2);
    const V = THREE.Vector2;
    const tyre = rot(
      new THREE.LatheGeometry(
        [
          new V(Rw - 0.055, -0.045),
          new V(Rw + 0.03, -0.045),
          new V(Rw + 0.03, -0.03),
          new V(Rw, -0.02),
          new V(Rw, 0.03),
          new V(Rw - 0.055, 0.03),
          new V(Rw - 0.055, -0.045),
        ],
        SEG,
      ),
    ).translate(cx, cy, cz);
    const rim = rot(
      new THREE.LatheGeometry(
        [
          new V(Rw - 0.09, -0.02),
          new V(Rw - 0.05, -0.02),
          new V(Rw - 0.05, 0.022),
          new V(Rw - 0.09, 0.022),
          new V(Rw - 0.09, -0.02),
        ],
        SEG,
      ),
    ).translate(cx, cy, cz);
    const web: THREE.BufferGeometry[] = [rim];
    const hub = rot(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 6)).translate(cx + s * 0.005, cy, cz);
    web.push(hub);
    const inner = 0.06;
    const outer = Rw - 0.085;
    const len = outer - inner;
    for (let k = 0; k < spokes; k++) {
      const psi = psi0 * DEG + (k / spokes) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.028, len, 0.04);
      g.rotateX(Math.PI / 2 - psi);
      const d = (inner + outer) / 2;
      g.translate(cx, cy + Math.sin(psi) * d, cz + Math.cos(psi) * d);
      web.push(g);
    }
    if (weight) {
      const psi = (psi0 + 180) * DEG;
      const g = new THREE.BoxGeometry(0.034, 0.17, 0.16);
      g.rotateX(Math.PI / 2 - psi);
      g.translate(cx + s * 0.002, cy + Math.sin(psi) * 0.2, cz + Math.cos(psi) * 0.2);
      web.push(g);
    }
    return { tyre, web };
  };
  const driverNames = ["1", "2", "3"];
  const wheelJoints: Record<string, J> = {};
  const sideInfo: Record<string, { pins: THREE.Vector3[]; phi: number; s: number }> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const phi = s > 0 ? 35 : 125; // crank angle from +Z toward +Y
    sideInfo[side] = { s, phi, pins: [] };
    driverZ.forEach((z, i) => {
      const j = b.joint(`driver${side}${driverNames[i]}`, {
        parent: chassis,
        at: [s * GX, driverY, z],
        dir: [s, 0, 0],
        role: "hinge",
      });
      wheelJoints[`driver${side}${i}`] = j;
      const { tyre, web } = wheelGeo(s, z, driverY, DRIVER_R, 8, phi + 22.5, true);
      add(j, STEEL_D, tyre);
      add(j, RED, ...web);
      add(j, BRASS, cylX(0.05, 0.03, s * (GX + 0.06), driverY, z, 6));
      const pinLen = i === 1 ? 0.16 : 0.1;
      const pz = z + Math.cos(phi * DEG) * PIN_R;
      const py = driverY + Math.sin(phi * DEG) * PIN_R;
      sideInfo[side].pins.push(new THREE.Vector3(s * 0.49, py, pz));
      add(
        j,
        STEEL,
        rd([s * (GX - 0.005), py, pz], [s * (GX + pinLen), py, pz], 0.022, 6),
        rd([s * (GX - 0.3), driverY, z], [s * GX, driverY, z], 0.035, 6),
      );
      add(j, RED_D, rd([s * (GX + 0.0), py, pz], [s * (GX + 0.05), py, pz], 0.05, 6));
    });
  }
  // rods per side
  for (const side of ["L", "R"]) {
    const { s, phi, pins } = sideInfo[side];
    const x = s * PX;
    const P1 = pins[0];
    const P2 = pins[1];
    const P3 = pins[2];
    // crosshead position from a 1.2 m connecting rod
    const dy = yP - P2.y;
    const zc = P2.z + Math.sqrt(1.2 * 1.2 - dy * dy);
    const couple = b.joint(`couplingRod${side}`, {
      parent: chassis,
      at: [s * 0.49, P1.y, P1.z],
      aim: [s * 0.49, P3.y, P3.z],
      role: "hinge",
    });
    const cross = b.joint(`crosshead${side}`, { parent: chassis, at: [x, yP, zc], dir: [0, 0, -1], role: "hinge" });
    const main = b.joint(`mainRod${side}`, { parent: cross, at: [x, yP, zc], aim: [x, P2.y, P2.z], role: "hinge" });
    b.frustumBox([s * 0.49, P1.y, P1.z], [s * 0.49, P3.y, P3.z], [0.028, 0.065], [0.028, 0.065], {
      color: STEEL,
      bone: couple,
      name: "couplingRod",
    });
    for (const P of [P1, P2, P3]) add(couple, STEEL_D, cylX(0.055, 0.032, s * 0.49, P.y, P.z, 6));
    b.frustumBox([x, yP, zc], [x, P2.y, P2.z], [0.03, 0.07], [0.03, 0.09], {
      color: STEEL,
      bone: main,
      name: "mainRod",
    });
    add(main, STEEL_D, cylX(0.06, 0.035, x, P2.y, P2.z, 6));
    add(cross, STEEL_D, bx(0.05, 0.09, 0.13, x, yP, zc), bx(0.028, 0.03, 0.09, x, yP, zc - 0.02));
    b.rod([x, yP, zc], [x, yP, 1.6], 0.018, { section: { ngon: 6 }, color: STEEL, bone: cross, name: "pistonRod" });
    // valve gear: expansion link over the middle axle, eccentric rod, radius rod to the valve stem
    const linkZ = 0.5;
    const linkY = H(0.78);
    const linkX = s * 0.56;
    add(chassis, STEEL_D, bx(0.03, 0.17, 0.05, linkX, linkY, linkZ, [15 * s, 0, 0]));
    add(chassis, IRON, rd([linkX, linkY - 0.1, linkZ], [linkX, H(0.92), linkZ + 0.02], 0.014, 4));
    const crank = new THREE.Vector3(
      s * 0.6,
      driverY + Math.sin((phi + 95) * DEG) * 0.07,
      driverZ[1] + Math.cos((phi + 95) * DEG) * 0.07,
    );
    const ecc = b.joint(`eccentricRod${side}`, {
      parent: chassis,
      at: [linkX, linkY - 0.08, linkZ],
      aim: [crank.x, crank.y, crank.z],
      role: "hinge",
    });
    b.rod([linkX, linkY - 0.08, linkZ], crank, 0.014, {
      section: { ngon: 4 },
      color: STEEL,
      bone: ecc,
      name: "eccentricRod",
    });
    add(wheelJoints[`driver${side}1`], STEEL_D, cylX(0.045, 0.02, crank.x, crank.y, crank.z, 6));
    const valve = b.joint(`valveRod${side}`, {
      parent: chassis,
      at: [linkX, linkY + 0.02, linkZ],
      aim: [linkX, yP + 0.17, 1.6],
      role: "hinge",
    });
    b.rod([linkX, linkY + 0.02, linkZ], [linkX, yP + 0.17, 1.6], 0.014, {
      section: { ngon: 4 },
      color: STEEL,
      bone: valve,
      name: "radiusRod",
    });
  }

  // pony truck ----------------------------------------------------------------------------
  const ponyY = H(flatAxle(PONY_R));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const j = b.joint(`pony${side}`, { parent: chassis, at: [s * GX, ponyY, 2.0], dir: [s, 0, 0], role: "hinge" });
    const { tyre, web } = wheelGeo(s, 2.0, ponyY, PONY_R, 6, 0, false);
    add(j, STEEL_D, tyre);
    add(j, RED, ...web);
    add(j, IRON, rd([s * (GX - 0.3), ponyY, 2.0], [s * GX, ponyY, 2.0], 0.03, 6));
  }
  add(
    chassis,
    IRON,
    bx(0.6, 0.05, 0.12, 0, H(0.36), 2.0),
    bx(0.04, 0.14, 0.1, 0.33, H(0.43), 2.0),
    bx(0.04, 0.14, 0.1, -0.33, H(0.43), 2.0),
  );

  // ===================================================================== TENDER
  const tz0 = -1.36;
  const tz1 = -2.46;
  const tzMid = (tz0 + tz1) / 2;
  const tlen = tz0 - tz1;
  // drawbar and safety chains
  add(
    chassis,
    IRON,
    rd([0, H(0.55), -1.25], [0, H(0.55), -1.4], 0.035, 6),
    cyl(0.06, 0.05, 0, H(0.55), -1.25, 6),
    cyl(0.06, 0.05, 0, H(0.55), -1.4, 6),
  );
  for (const s of [1, -1]) {
    add(
      chassis,
      STEEL_D,
      rd([s * 0.3, H(0.62), -1.25], [s * 0.25, H(0.5), -1.32], 0.01, 4),
      rd([s * 0.25, H(0.5), -1.32], [s * 0.3, H(0.62), -1.4], 0.01, 4),
    );
  }
  // frame and tank
  for (const s of [1, -1]) {
    add(tender, IRON, bx(0.045, 0.22, tlen + 0.1, s * 0.31, H(0.55), tzMid));
  }
  add(tender, IRON, bx(0.66, 0.1, tlen, 0, H(0.56), tzMid));
  b.extrude(
    [
      [-0.65, 0],
      [0.65, 0],
      [0.65, 0.42],
      [0.58, 0.5],
      [-0.58, 0.5],
      [-0.65, 0.42],
    ],
    {
      at: [0, H(0.6), tzMid],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: tlen,
      color: GREEN,
      bone: tender,
      name: "tenderTank",
    },
  );
  // tank lining and lettering
  add(tender, CREAM, bx(1.32, 0.02, tlen + 0.01, 0, H(0.605), tzMid));
  for (const s of [1, -1]) {
    plane(tenderPanel, 1.0, 0.29, [s * 0.652, H(0.84), tzMid + 0.02], [s, 0, 0], tender, "tenderLettering");
    b.part(new THREE.PlaneGeometry(1.0, 0.13), "#ffffff", {
      bone: tender,
      at: [s * 0.654, H(0.66), tzMid + 0.02],
      dir: [s, 0, 0],
      axis: "z",
      texture: grimeTex,
      name: "grime",
    });
    plane(scuffTex, 1.0, 0.1, [s * 0.737, H(0.9), 1.3], [s, 0, 0], chassis, "scuffs");
  }
  // coal bunker walls and heap
  const bz0 = -1.72;
  const bzMid = (bz0 + tz1) / 2;
  const bLen = bz0 - tz1;
  add(tender, GREEN, bx(1.3, 0.3, 0.05, 0, H(1.11 + 0.07), bz0), bx(1.3, 0.3, 0.05, 0, H(1.11 + 0.07), tz1 + 0.025));
  for (const s of [1, -1]) add(tender, GREEN, bx(0.05, 0.3, bLen, s * 0.625, H(1.11 + 0.07), bzMid));
  add(tender, CREAM, bx(1.32, 0.02, 0.06, 0, H(1.33), bz0), bx(1.32, 0.02, 0.06, 0, H(1.33), tz1 + 0.025));
  for (const s of [1, -1]) add(tender, CREAM, bx(0.06, 0.02, bLen, s * 0.625, H(1.33), bzMid));
  add(tender, FLOOR, bx(1.2, 0.04, bLen, 0, H(1.085), bzMid));
  const coalA: THREE.BufferGeometry[] = [];
  const coalB: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 36; i++) {
    const u = R();
    const v = R();
    const x = (u - 0.5) * 1.05;
    const z = bz0 - 0.06 - v * (bLen - 0.14);
    const hump = 0.2 + 0.24 * (1 - Math.abs(x) / 0.6) * (1 - Math.abs((v - 0.5) * 2) * 0.6);
    const g = new THREE.DodecahedronGeometry(0.07 + R() * 0.06, 0);
    g.scale(1.2, 0.8, 1);
    g.rotateY(R() * 6);
    g.rotateX(R() * 0.6);
    g.translate(x, H(1.1) + hump, z);
    (R() < 0.35 ? coalB : coalA).push(g);
  }
  add(tender, COAL, ...coalA);
  add(tender, COAL2, ...coalB);
  // shovel leaning on the front wall
  add(
    tender,
    STEEL_D,
    rd([0.35, H(1.5), -1.75], [0.35, H(1.05), -1.98], 0.014, 4),
    bx(0.14, 0.02, 0.17, 0.35, H(1.05), -2.03, [-20, 0, 0]),
  );
  // water filler on the tank top forward of the bunker
  add(tender, BRASS, cyl(0.1, 0.05, 0.3, H(1.13), -1.52, 8), cyl(0.05, 0.05, 0.3, H(1.16), -1.52, 6, 0.03));
  add(tender, IRON, bx(0.56, 0.05, 0.22, -0.25, H(1.13), -1.52));
  // handbrake column and wheel
  add(tender, IRON, rd([-0.5, H(1.1), -1.44], [-0.5, H(1.52), -1.44], 0.02, 6));
  add(tender, BRASS, new THREE.TorusGeometry(0.1, 0.014, 4, 8).rotateY(Math.PI / 2).translate(-0.5, H(1.56), -1.44));
  add(tender, RED_D, rd([-0.5, H(1.56), -1.44], [-0.5, H(1.56), -1.44], 0.001, 4));
  // tender beam, buffers, lamp
  b.part(new THREE.BoxGeometry(1.3, 0.26, 0.09), RED, {
    bone: tender,
    at: [0, H(0.58), tz1 - 0.045],
    flat: true,
    name: "tenderBeam",
  });
  for (const s of [1, -1])
    add(
      tender,
      STEEL_D,
      cylZ(0.045, 0.12, s * 0.48, H(0.58), tz1 - 0.15, 8),
      cylZ(0.095, 0.035, s * 0.48, H(0.58), tz1 - 0.225, 8),
    );
  add(tender, IRON, bx(0.06, 0.06, 0.2, 0, H(0.58), tz1 - 0.15), bx(0.09, 0.12, 0.05, 0, H(0.52), tz1 - 0.24));
  add(
    tender,
    BLACK,
    bx(0.14, 0.18, 0.12, 0, H(0.86), tz1 - 0.1),
    bx(0.16, 0.02, 0.14, 0, H(0.96), tz1 - 0.1),
    bx(0.05, 0.05, 0.1, 0, H(0.86), tz1 - 0.03),
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.1, 0.12), LAMP_RED, {
      bone: tender,
      at: [0, H(0.86), tz1 - 0.172],
      dir: [0, 0, -1],
      axis: "z",
      name: "tailLamp",
    }),
    1.3,
  );
  // tender wheels
  const tendY = H(flatAxle(TENDER_R));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    [-1.65, -2.23].forEach((z, i) => {
      const j = b.joint(`tenderWheel${side}${i + 1}`, {
        parent: tender,
        at: [s * GX, tendY, z],
        dir: [s, 0, 0],
        role: "hinge",
      });
      const { tyre, web } = wheelGeo(s, z, tendY, TENDER_R, 6, 15 * i, false);
      add(j, STEEL_D, tyre);
      add(j, RED, ...web);
      add(j, IRON, rd([s * (GX - 0.3), tendY, z], [s * GX, tendY, z], 0.03, 6));
    });
  }

  // soot on the boiler top behind the chimney and on the smokebox
  b.decal(boiler, sootTex, {
    at: [0, YB + 0.42, 1.62],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.42, 0.62],
    segments: [3, 4],
    bone: chassis,
    lift: 0.003,
    name: "soot",
  });
  for (const s of [1, -1]) {
    b.decal(boiler, namePlate, {
      at: [s * 0.44, YB + 0.02, 1.36],
      dir: [s, 0, 0],
      size: [0.42, 0.135],
      segments: [6, 2],
      bone: chassis,
      lift: 0.003,
      name: "nameplate",
    });
  }
  flush();

  // ===================================================================== SMOKE AND STEAM
  const chimneyAt: [number, number, number] = [0, chimneyTop + 0.1, 1.78];
  const path = bezier(
    chimneyAt,
    [0, chimneyTop + 0.45, 1.6],
    [0, chimneyTop + 0.75, 0.7],
    [0, chimneyTop + 0.85, -1.0],
  );
  const smokeDark = [puffSvg(11, "#4a4846", "#35332f", "#66635e"), puffSvg(12, "#4e4b48", "#37342f", "#6a6661")];
  const smokeMid = [puffSvg(21, "#8b8883", "#6f6c67", "#a7a49e"), puffSvg(22, "#8e8b85", "#72706a", "#aaa7a0")];
  const smokeLight = [puffSvg(31, "#c5c3bd", "#a8a6a0", "#e2e0da"), puffSvg(32, "#cbc9c3", "#adaba5", "#e6e4de")];
  const N = 11;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const size = 0.3 + 0.75 * Math.pow(t, 0.9);
    const p = path.at(t);
    const set = t < 0.3 ? smokeDark : t < 0.65 ? smokeMid : smokeLight;
    b.cards([frame([p.x + (R() - 0.5) * 0.1, p.y - size * 0.5, p.z], [0, 1, 0])], set, {
      size,
      cross: true,
      spin: 180,
      rng: R,
      sink: 0,
      bone: chassis,
      flow: [1, 0, 0.3],
    });
  }
  // steam spray at the drain cocks and a wisp at the safety valve
  for (const s of [1, -1]) {
    b.cards([frame([s * (PX + 0.02), yP - 0.175, 1.66], [0, 1, 0])], spraySvg, {
      size: [0.2, 0.22],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      bone: chassis,
      sink: 0,
    });
  }
  b.cards([frame([0, fbTop + 0.16, 0.48], [0, 1, 0])], spraySvg, {
    size: [0.22, 0.4],
    cross: true,
    bone: chassis,
    sink: 0,
    flow: [0, 0, -1],
    lean: 10,
  });

  return b.root;
}
