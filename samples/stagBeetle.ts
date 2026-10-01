import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { lerp, offset, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Stag Beetle",
  description:
    "A male stag beetle scaled to 0.6 m on a mossy log: glossy chestnut wing cases that lift on hinges, antler mandibles, elbowed comb antennae, six jointed legs hooked into the bark, a segmented underside.",
};

// ---------------------------------------------------------------- palette
const CHITIN = "#2a1810"; // head, thorax, legs
const CHITIN_LIGHT = "#4a2a1a";
const ELYTRA = "#82300f"; // chestnut wing cases
const ELYTRA_DARK = "#4f1a09";
const MAND = "#9a3a16";
const MAND_TIP = "#3a1a0e";
const FEMUR = "#65270f";
const TIBIA = "#2e1b12";
const AMBER = "#c98b3c";
const BARK_WHITE = "#ffffff";
const WOOD = "#c9a26a";
const WOOD_DARK = "#7a5634";

// ---------------------------------------------------------------- geometry constants
const LOG_R = 0.16; // vertex radius of the 10-gon log
const LOG_FACE = LOG_R * Math.cos(Math.PI / 10); // apothem: the log rests on a flat face
const LOG_HALF = 0.46;
const LOG_TOP = LOG_FACE * 2;
const BY = LOG_TOP + 0.065; // body mid-plane height

type Pt = [number, number];

/** Mirror a half outline (starting and ending on the axis x = 0) into a full closed outline. */
function mirrorOutline(half: Pt[]): OutlinePoint[] {
  const back = half
    .slice(1, -1)
    .reverse()
    .map(([x, y]): Pt => [-x, y]);
  return [...half, ...back];
}

const poly = (pts: number[][], fill: string) =>
  `<polygon points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="${fill}"/>`;
const SVGNS = 'xmlns="http://www.w3.org/2000/svg"';

// ---------------------------------------------------------------- drawings
function barkSvg() {
  const r = rng(11);
  const W = 160;
  const H = 160;
  let s = `<svg ${SVGNS} viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#2b1e15"/>`;
  const edges = [0];
  while (edges[edges.length - 1] < W) edges.push(Math.min(W, edges[edges.length - 1] + 5 + r() * 9));
  const tones = ["#5b4332", "#6a4e38", "#4c3828", "#765a40"];
  const j = () => r() * 2 - 1;
  for (let c = 0; c < edges.length - 1; c++) {
    let y = -r() * 30;
    while (y < H) {
      const len = 20 + r() * 50;
      const x0 = edges[c] + 0.9 + r() * 0.8;
      const x1 = edges[c + 1] - 0.9 - r() * 0.8;
      const xm = (x0 + x1) / 2;
      const tone = tones[Math.floor(r() * tones.length)];
      s += poly(
        [
          [x0 + j(), y + 1],
          [xm + j(), y + j() * 1.2],
          [x1 + j(), y + 1],
          [x1 + j() * 1.2, y + len * 0.5],
          [x1 - j(), y + len - 1],
          [xm + j(), y + len + j()],
          [x0 + j(), y + len - 1],
          [x0 - j() * 1.2, y + len * 0.5],
        ],
        tone,
      );
      // a sliver of lighter ridge along the plate's left edge
      s += poly(
        [
          [x0 + 0.6, y + 2],
          [x0 + 2.2, y + 3],
          [x0 + 2.2, y + len - 3],
          [x0 + 0.6, y + len - 2],
        ],
        "#86694a",
      );
      y += len + 1.2 + r() * 1.6;
    }
  }
  // beetle-bored holes and pale dead-wood scars
  for (let i = 0; i < 26; i++) {
    const cx = r() * W;
    const cy = r() * H;
    s += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(1 + r() * 1.3).toFixed(1)}" ry="${(1.4 + r() * 1.6).toFixed(1)}" fill="#1a110b"/>`;
  }
  for (let i = 0; i < 7; i++) {
    const cx = r() * W;
    const cy = r() * H;
    s += poly(
      [
        [cx, cy],
        [cx + 3 + r() * 3, cy + 6 + r() * 4],
        [cx + 1, cy + 22 + r() * 12],
        [cx - 3 - r() * 2, cy + 8 + r() * 4],
      ],
      "#a38a64",
    );
  }
  // lichen rosettes
  for (let i = 0; i < 22; i++) {
    const cx = r() * W;
    const cy = r() * H;
    const tone = ["#a9b79a", "#c9cfa0", "#d6c779"][Math.floor(r() * 3)];
    const n = 4 + Math.floor(r() * 4);
    for (let k = 0; k < n; k++)
      s += `<circle cx="${(cx + j() * 3.5).toFixed(1)}" cy="${(cy + j() * 3.5).toFixed(1)}" r="${(1 + r() * 1.4).toFixed(1)}" fill="${tone}"/>`;
  }
  // moss: a thick cover over the top faces (u 0.33..0.57), ragged patches down the flanks
  const blob = (cx: number, cy: number, rad: number, tone: string, squash = 1) => {
    const n = 11;
    const pts: number[][] = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const rr = rad * (0.62 + r() * 0.55) * (k % 2 ? 0.78 : 1.15);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
    }
    return poly(pts, tone);
  };
  for (let i = 0; i < 46; i++) {
    const cx = 53 + r() * 42;
    const cy = r() * H;
    s += blob(cx, cy, 6 + r() * 8, "#3d6424", 1.5);
  }
  for (let i = 0; i < 44; i++) {
    const cx = 56 + r() * 36;
    const cy = r() * H;
    s += blob(cx, cy, 4 + r() * 6, "#5d8b30", 1.4);
  }
  for (let i = 0; i < 36; i++) {
    const cx = 58 + r() * 32;
    const cy = r() * H;
    s += blob(cx, cy, 2 + r() * 3.5, "#88b34a", 1.3);
  }
  for (let i = 0; i < 26; i++) {
    const side = r() < 0.5 ? 30 : 118;
    const cx = side + j() * 18;
    const cy = r() * H;
    s += blob(cx, cy, 3 + r() * 6, i % 3 ? "#46692b" : "#5d8b30", 1.6);
  }
  // damp dark green where the log meets the floor
  for (let i = 0; i < 14; i++) {
    const cx = r() < 0.5 ? r() * 12 : 148 + r() * 12;
    s += blob(cx, r() * H, 3 + r() * 4, "#2f4a1c", 1.6);
  }
  return svg(`${s}</svg>`, { size: 768 });
}

function mossTuftSvg(seed: number, spores: boolean) {
  const r = rng(seed);
  let s = `<svg ${SVGNS} viewBox="0 0 48 40">`;
  const tones = ["#2f5a1e", "#467a28", "#66a038", "#8cc454"];
  for (let i = 0; i < 15; i++) {
    const x = 6 + r() * 36;
    const h = 14 + r() * 22;
    const lean = (r() - 0.5) * 14;
    const w = 2.4 + r() * 2;
    s += poly(
      [
        [x - w, 40],
        [x + w, 40],
        [x + lean + w * 0.2, 40 - h],
        [x + lean - w * 0.1, 40 - h - 1],
      ],
      tones[Math.floor(r() * tones.length)],
    );
  }
  if (spores) {
    for (let i = 0; i < 4; i++) {
      const x = 8 + r() * 32;
      const h = 20 + r() * 14;
      s += poly(
        [
          [x - 0.9, 40],
          [x + 0.9, 40],
          [x + 0.9, 40 - h],
          [x - 0.9, 40 - h],
        ],
        "#9a5a24",
      );
      s += poly(
        [
          [x - 2.6, 40 - h],
          [x + 2.6, 40 - h],
          [x + 2, 40 - h - 5],
          [x - 2, 40 - h - 5],
        ],
        "#c7822f",
      );
    }
  }
  return svg(`${s}</svg>`, { size: 192 });
}

function grassSvg() {
  const r = rng(23);
  let s = `<svg ${SVGNS} viewBox="0 0 48 64">`;
  const tones = ["#4f7a2a", "#6a9a36", "#8cb24a", "#b3b65a"];
  for (let i = 0; i < 9; i++) {
    const x = 6 + (i / 8) * 36 + (r() - 0.5) * 4;
    const h = 36 + r() * 26;
    const lean = (r() - 0.5) * 22;
    s += poly(
      [
        [x - 2.6, 64],
        [x + 2.6, 64],
        [x + lean * 0.5 + 1.1, 64 - h * 0.6],
        [x + lean, 64 - h],
        [x + lean * 0.5 - 1.1, 64 - h * 0.6],
      ],
      tones[Math.floor(r() * tones.length)],
    );
  }
  return svg(`${s}</svg>`, { size: 192 });
}

function leafSvg(body: string, vein: string) {
  return svg(
    `<svg ${SVGNS} viewBox="0 0 40 64">${poly(
      [
        [20, 62],
        [14, 52],
        [6, 50],
        [10, 40],
        [3, 32],
        [11, 28],
        [8, 18],
        [16, 18],
        [20, 4],
        [24, 18],
        [32, 18],
        [29, 28],
        [37, 32],
        [30, 40],
        [34, 50],
        [26, 52],
      ],
      body,
    )}<rect x="19" y="8" width="2.4" height="56" fill="${vein}"/>${poly(
      [
        [20, 44],
        [10, 34],
        [11, 32],
        [20, 41],
      ],
      vein,
    )}${poly(
      [
        [20, 44],
        [30, 34],
        [29, 32],
        [20, 41],
      ],
      vein,
    )}</svg>`,
    { size: 160 },
  );
}

function hairSvg() {
  return svg(
    `<svg ${SVGNS} viewBox="0 0 24 32">${poly(
      [
        [2, 32],
        [8, 32],
        [5, 2],
      ],
      "#b98f4a",
    )}${poly(
      [
        [8, 32],
        [15, 32],
        [12, 0],
      ],
      "#d2ab62",
    )}${poly(
      [
        [15, 32],
        [22, 32],
        [19, 6],
      ],
      "#a77d3c",
    )}</svg>`,
    { size: 96 },
  );
}

// Elytron outline (left wing case): x across from the suture, y backwards (negative) from the hinge.
const ELY: Pt[] = [
  [0.004, 0.0],
  [0.05, 0.004],
  [0.085, -0.008],
  [0.093, -0.04],
  [0.092, -0.09],
  [0.083, -0.145],
  [0.062, -0.195],
  [0.035, -0.225],
  [0.004, -0.232],
];

function elytronSvg() {
  const pt = ELY.map(([x, y]) => [98 - x * 1000, -y * 1000]);
  const path = pt.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
  let s = `<svg ${SVGNS} viewBox="0 0 100 240">`;
  // enamel panel: a slightly lighter top inside a dark rim
  s += poly(
    pt.map(([x, y]) => [50 + (x - 50) * 0.72, 120 + (y - 120) * 0.9]),
    "#94391a",
  );
  s += `<polygon points="${path}" fill="none" stroke="${ELYTRA_DARK}" stroke-width="15" stroke-linejoin="round"/>`;
  // striae running the length of the case, converging toward the tail
  for (let k = 0; k < 4; k++) {
    const x0 = 26 + k * 15;
    const pts: number[][] = [];
    for (let y = 14; y <= 215; y += 12) {
      const f = Math.pow(y / 232, 2.4);
      pts.push([x0 + (50 - x0) * f * 0.9, y]);
    }
    s += `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="#7d2f14" stroke-width="1.4"/>`;
  }
  // glossy sheen: a long streak and a small glint
  s += poly(
    [
      [62, 28],
      [72, 34],
      [76, 90],
      [70, 150],
      [64, 120],
      [61, 70],
    ],
    "#c3582a",
  );
  s += poly(
    [
      [66, 38],
      [71, 42],
      [72, 76],
      [68, 96],
      [66, 70],
    ],
    "#ee9c62",
  );
  s += poly(
    [
      [64, 112],
      [68, 120],
      [66, 138],
      [63, 128],
    ],
    "#e8884a",
  );
  return svg(`${s}</svg>`, { size: 512 });
}

function pronotumSvg() {
  const r = rng(5);
  let s = `<svg ${SVGNS} viewBox="0 0 170 140">`;
  // centre groove and two shoulder dimples
  s += poly(
    [
      [83, 14],
      [87, 14],
      [88, 126],
      [82, 126],
    ],
    "#140a06",
  );
  // two domed lobes with a glossy sheen each
  for (const m of [0, 1]) {
    const X = (x: number) => (m ? 170 - x : x);
    s += poly(
      [
        [X(26), 40],
        [X(50), 22],
        [X(72), 20],
        [X(76), 60],
        [X(60), 96],
        [X(34), 88],
      ],
      "#3f2316",
    );
    s += poly(
      [
        [X(34), 42],
        [X(52), 28],
        [X(66), 27],
        [X(58), 38],
        [X(42), 52],
      ],
      "#8a5236",
    );
    s += poly(
      [
        [X(42), 40],
        [X(54), 31],
        [X(58), 32],
        [X(48), 43],
      ],
      "#c48a66",
    );
  }
  // punctures
  for (let i = 0; i < 46; i++) {
    const x = 14 + r() * 142;
    const y = 12 + r() * 118;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" fill="#4b2a1b"/>`;
  }
  return svg(`${s}</svg>`, { size: 384 });
}

function headSvg() {
  let s = `<svg ${SVGNS} viewBox="0 0 150 120">`;
  s += poly(
    [
      [75, 6],
      [78, 6],
      [78, 60],
      [72, 60],
    ],
    "#140a06",
  );
  s += poly(
    [
      [28, 44],
      [66, 40],
      [70, 52],
      [36, 64],
    ],
    "#5d331f",
  );
  s += poly(
    [
      [122, 44],
      [84, 40],
      [80, 52],
      [114, 64],
    ],
    "#5d331f",
  );
  s += poly(
    [
      [38, 48],
      [60, 44],
      [60, 49],
      [42, 57],
    ],
    "#a06c4c",
  );
  s += poly(
    [
      [112, 48],
      [90, 44],
      [90, 49],
      [108, 57],
    ],
    "#a06c4c",
  );
  // clypeus fold and brow ridges
  s += poly(
    [
      [30, 18],
      [120, 18],
      [120, 23],
      [30, 23],
    ],
    "#140a06",
  );
  return svg(`${s}</svg>`, { size: 256 });
}

function abdomenSvg() {
  // Sphere UV with its poles along the body: v runs tail to head, u around the body.
  const rows = 9;
  const H = 180;
  let s = `<svg ${SVGNS} viewBox="0 0 128 ${H}"><rect width="128" height="${H}" fill="#2d1a11"/>`;
  for (let i = 0; i < rows; i++) {
    const y0 = 14 + (i * (H - 28)) / rows;
    const h = (H - 28) / rows;
    // each segment: a plate with a pale rim on the tail edge
    s += poly(
      [
        [0, y0 + 1],
        [128, y0 + 1],
        [128, y0 + h - 3],
        [0, y0 + h - 3],
      ],
      i % 2 ? "#3c2316" : "#34201a",
    );
    s += poly(
      [
        [0, y0 + h - 3],
        [128, y0 + h - 3],
        [128, y0 + h],
        [0, y0 + h],
      ],
      "#7a4a2a",
    );
    // spiracles on both flanks
    for (const x of [32, 96]) s += `<circle cx="${x}" cy="${(y0 + h * 0.4).toFixed(1)}" r="2.6" fill="#120a06"/>`;
  }
  // ventral midline keel
  s += poly(
    [
      [0, 0],
      [6, 0],
      [6, H],
      [0, H],
    ],
    "#241409",
  );
  s += poly(
    [
      [122, 0],
      [128, 0],
      [128, H],
      [122, H],
    ],
    "#241409",
  );
  return svg(`${s}</svg>`, { size: 256 });
}

function eyeSvg() {
  let s = `<svg ${SVGNS} viewBox="0 0 32 32"><rect width="32" height="32" fill="#2a1408"/>`;
  for (let y = 0; y < 6; y++)
    for (let x = 0; x < 6; x++)
      s += poly(
        [
          [x * 6 + (y % 2) * 3 + 0.8, y * 5.4 + 2.7],
          [x * 6 + (y % 2) * 3 + 3, y * 5.4 + 0.8],
          [x * 6 + (y % 2) * 3 + 5.2, y * 5.4 + 2.7],
          [x * 6 + (y % 2) * 3 + 3, y * 5.4 + 4.6],
        ],
        (x + y) % 3 ? "#4a2410" : "#6a3814",
      );
  s += poly(
    [
      [13, 9],
      [16, 8],
      [17, 10],
      [14, 11],
    ],
    "#b9956a",
  );
  return svg(`${s}</svg>`, { size: 128 });
}

function ringsSvg() {
  // concentric growth rings of a cut log end (a 10-gon), radial checks and a dark heart
  const r = rng(17);
  const n = 10;
  const ring = (rad: number, fill: string, rot = 0) =>
    poly(
      Array.from({ length: n }, (_, k) => [
        100 + Math.cos((k / n) * Math.PI * 2 + rot) * rad,
        100 + Math.sin((k / n) * Math.PI * 2 + rot) * rad,
      ]),
      fill,
    );
  let s = `<svg ${SVGNS} viewBox="0 0 200 200">`;
  s += ring(96, "#b9885a");
  s += ring(84, "#d7ab78");
  s += ring(72, "#b9885a");
  s += ring(60, "#d7ab78");
  s += ring(48, "#b9885a");
  s += ring(36, "#c99563");
  s += ring(24, "#8f6238");
  s += ring(10, "#5a3a1e");
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const len = 30 + r() * 60;
    const w = 1.6 + r() * 1.4;
    s += poly(
      [
        [100 + Math.cos(a) * 12 - Math.sin(a) * w, 100 + Math.sin(a) * 12 + Math.cos(a) * w],
        [
          100 + Math.cos(a) * (12 + len) - Math.sin(a) * w * 0.3,
          100 + Math.sin(a) * (12 + len) + Math.cos(a) * w * 0.3,
        ],
        [100 + Math.cos(a) * 12 + Math.sin(a) * w, 100 + Math.sin(a) * 12 - Math.cos(a) * w],
      ],
      "#5a3a1e",
    );
  }
  return svg(`${s}</svg>`, { size: 384 });
}

function fungusSvg() {
  // bracket fungus seen from above: concentric crescent bands
  let s = `<svg ${SVGNS} viewBox="0 0 120 70">`;
  const bands = ["#e7d6b0", "#b86a2e", "#d89a4a", "#7a3f1e", "#e0c48a", "#a8552a"];
  for (let i = 0; i < bands.length; i++) {
    const rad = 58 - i * 9;
    const pts: number[][] = [];
    for (let k = 0; k <= 8; k++) {
      const a = Math.PI + (k / 8) * Math.PI;
      pts.push([60 + Math.cos(a) * rad * 1.02, 64 + Math.sin(a) * rad * 0.95]);
    }
    s += poly(pts, bands[i]);
  }
  return svg(`${s}</svg>`, { size: 256 });
}

function wingSvg() {
  let s = `<svg ${SVGNS} viewBox="0 0 70 240">`;
  for (const [x0, x1] of [
    [14, 10],
    [26, 24],
    [38, 40],
    [50, 56],
  ])
    s += `<polyline points="6,10 ${x0},60 ${x1},200" fill="none" stroke="#6a3a14" stroke-width="1.8"/>`;
  s += `<polyline points="6,10 6,120 22,215" fill="none" stroke="#6a3a14" stroke-width="2.4"/>`;
  return svg(`${s}</svg>`, { size: 384 });
}

// ---------------------------------------------------------------- model
export default function build() {
  const b = createBuilder({ name: "stagBeetle" });
  const rand = rng(77);

  // ---- skeleton
  const log = b.joint("log", { at: [0, LOG_FACE, 0] });
  const thorax = b.joint("thorax", { parent: log, at: [0, BY, 0.0], dir: [0, 0, 1], role: "spine" });
  const abdomen = b.joint("abdomen", { parent: thorax, at: [0, BY + 0.005, -0.02], dir: [0, 0, -1], role: "spine" });
  const prothorax = b.joint("prothorax", { parent: thorax, at: [0, BY + 0.01, 0.03], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: prothorax, at: [0, BY + 0.005, 0.1], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, BY - 0.012, 0.19], dir: [0, 0, 1], role: "jaw" });

  // ---- the log
  const logGeo = new THREE.CylinderGeometry(LOG_R, LOG_R, LOG_HALF * 2, 10, 1, true);
  logGeo.rotateY(Math.PI / 10);
  const logPart = b.part(logGeo, BARK_WHITE, {
    bone: log,
    at: [0, LOG_FACE, 0],
    rotation: [90, 0, 0],
    texture: barkSvg(),
    flat: true,
    name: "log",
  });
  const logOutline: OutlinePoint[] = Array.from(
    { length: 10 },
    (_, k): Pt => [LOG_R * Math.cos((k * Math.PI) / 5), LOG_R * Math.sin((k * Math.PI) / 5)],
  );
  const cutEnd = b.extrude(logOutline, {
    at: [0, LOG_FACE, LOG_HALF - 0.01],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    color: WOOD,
    bone: log,
    name: "logCut",
  });
  b.decal(cutEnd, ringsSvg(), {
    at: [0, LOG_FACE, LOG_HALF],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.27, 0.27],
    segments: 2,
    lift: 0.002,
    mirror: true,
  });
  // the broken end: a rotten hollow ringed by splinters
  b.extrude(logOutline, {
    at: [0, LOG_FACE, -LOG_HALF + 0.01],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    color: "#5b4028",
    bone: log,
    name: "logHollow",
  });
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.2;
    const rad = 0.11 + (k % 2) * 0.025;
    const base: [number, number, number] = [Math.cos(a) * rad, LOG_FACE + Math.sin(a) * rad, -LOG_HALF + 0.02];
    const len = 0.05 + ((k * 37) % 7) * 0.014;
    b.spike(base, [-Math.cos(a) * 0.25, -Math.sin(a) * 0.25, -1], len, 0.024 - (k % 3) * 0.005, {
      sides: 4,
      smooth: false,
      color: k % 2 ? WOOD : WOOD_DARK,
      bone: log,
      caps: { start: "none", end: "point" },
    });
  }
  const logSurf = b.surface(logPart);

  // a knot stub on the right flank
  const stub = b.rod([-0.13, LOG_FACE + 0.03, -0.3], [-0.25, LOG_FACE + 0.1, -0.3], [0.045, 0.028], {
    bone: log,
    sides: 6,
    smooth: false,
    color: "#4f3826",
    caps: "flat",
    name: "stub",
  });
  b.decal(stub, ringsSvg(), {
    at: [-0.25, LOG_FACE + 0.1, -0.3],
    dir: [-0.88, 0.45, 0],
    up: [0, 1, 0],
    size: [0.07, 0.07],
    segments: 2,
    lift: 0.002,
  });

  // bracket fungi on the right flank
  for (const [fz, fy, fs] of [
    [0.3, 0.14, 0.15],
    [0.34, 0.09, 0.1],
    [-0.12, 0.18, 0.11],
  ]) {
    const shelf = b.extrude(
      [
        [-0.5, 0],
        [-0.42, 0.3],
        [-0.15, 0.52],
        [0.15, 0.52],
        [0.42, 0.3],
        [0.5, 0],
      ].map(([x, y]): Pt => [x * fs, y * fs]),
      {
        at: [-LOG_R * 0.92, fy, fz],
        x: [0, 0, 1],
        y: [-1, 0.05, 0],
        thickness: 0.022,
        bevel: 0.008,
        color: "#c98a4a",
        bone: log,
        name: "fungus",
      },
    );
    b.decal(shelf, fungusSvg(), {
      at: shelf.at,
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [fs * 1.0, fs * 0.55],
      segments: [4, 3],
      lift: 0.001,
    });
  }

  // ---- body
  // pronotum
  const pronotum = b.extrude(
    mirrorOutline([
      [0, 0.072],
      [0.05, 0.072],
      [0.077, 0.05],
      [0.089, 0.005],
      [0.086, -0.03],
      [0.068, -0.052],
      [0.03, -0.06],
      [0, -0.056],
    ]),
    {
      at: [0, BY + 0.036, 0.03],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.052,
      bevel: 0.022,
      color: CHITIN,
      bone: prothorax,
      name: "pronotum",
    },
  );
  b.decal(pronotum, pronotumSvg(), {
    at: [0, BY + 0.07, 0.036],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.178, 0.132],
    segments: [9, 8],
  });

  // head
  const skull = b.extrude(
    mirrorOutline([
      [0, 0.085],
      [0.035, 0.085],
      [0.062, 0.066],
      [0.086, 0.036],
      [0.09, 0.0],
      [0.078, -0.035],
      [0.055, -0.05],
      [0, -0.05],
    ]),
    {
      at: [0, BY + 0.018, 0.15],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.06,
      bevel: 0.022,
      color: CHITIN,
      bone: head,
      name: "head",
    },
  );
  b.decal(skull, headSvg(), {
    at: [0, BY + 0.05, 0.1675],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.18, 0.135],
    segments: [8, 7],
  });

  // scutellum, the small shield between the wing case bases
  b.extrude(
    [
      [-0.016, 0.004],
      [0.016, 0.004],
      [0.0, -0.026],
    ],
    {
      at: [0, BY + 0.04, -0.012],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.04,
      bevel: 0.012,
      color: CHITIN_LIGHT,
      bone: thorax,
      name: "scutellum",
    },
  );

  // underside: thorax and abdomen ellipsoids (segmented)
  const thoraxUnder = b.part(new THREE.SphereGeometry(1, 8, 6), CHITIN, {
    bone: thorax,
    at: [0, BY - 0.008, 0.02],
    scale: [0.072, 0.04, 0.095],
    flat: true,
    name: "thoraxUnder",
  });
  b.part(new THREE.SphereGeometry(1, 10, 9), "#ffffff", {
    bone: abdomen,
    at: [0, BY + 0.008, -0.125],
    dir: [0, 0, 1],
    scale: [0.078, 0.108, 0.045],
    // scale is applied in local axes: x across, y along the body (poles), z up
    texture: abdomenSvg(),
    flat: true,
    name: "abdomen",
  });

  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 7, 5), "#ffffff", {
      bone: head,
      at: [s * 0.084, BY + 0.03, 0.165],
      dir: [s, 0, 0.3],
      scale: [1.0, 0.7, 1.2],
      texture: eyeSvg(),
      flat: true,
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    // canthus ridge above each eye, swept forward and out
    b.spike([s * 0.055, BY + 0.044, 0.13], [s * 0.096, BY + 0.052, 0.2], null, 0.012, {
      bone: head,
      sides: 4,
      smooth: false,
      color: CHITIN_LIGHT,
      caps: { start: "flat", end: "point" },
    });
  }

  // lower mouthparts on the jaw bone: labium with two palps
  b.extrude(
    [
      [-0.03, -0.01],
      [0.03, -0.01],
      [0.02, 0.03],
      [-0.02, 0.03],
    ],
    {
      at: [0, BY - 0.022, 0.19],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.014,
      bevel: 0.004,
      color: "#3a2016",
      bone: jaw,
      name: "labium",
    },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.02, BY - 0.022, 0.2], [s * 0.03, BY - 0.018, 0.232], [0.008, 0.006], {
      bone: jaw,
      sides: 5,
      smooth: false,
      color: "#6a3318",
    });
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), "#8a5a2a", {
      bone: jaw,
      at: [s * 0.03, BY - 0.018, 0.236],
      flat: true,
    });
  }

  // ---- wing cases and folded flight wings
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hinge = b.joint(`elytra${S}`, {
      parent: thorax,
      at: [s * 0.0, BY + 0.038, -0.02],
      dir: [0, 0, -1],
      role: "hinge",
    });
    const ely = b.extrude(ELY, {
      at: [0, BY + 0.038, -0.02],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.06,
      bevel: 0.028,
      color: ELYTRA,
      bone: hinge,
      name: `elytron${S}`,
    });
    b.decal(ely, elytronSvg(), {
      at: [s * 0.048, BY + 0.07, -0.14],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.1, 0.24],
      segments: [8, 20],
      mirror: s < 0,
      lift: 0.0015,
    });
    // a flight wing folded under each case
    const wing = b.joint(`wing${S}`, {
      parent: thorax,
      at: [s * 0.012, BY + 0.052, -0.022],
      dir: [0, 0, -1],
      role: "wing",
    });
    const w = b.extrude(
      [
        [0, 0],
        [0.03, -0.012],
        [0.054, -0.07],
        [0.052, -0.15],
        [0.034, -0.205],
        [0.008, -0.22],
      ],
      {
        at: [s * 0.012, BY + 0.052, -0.022],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.004,
        color: AMBER,
        bone: wing,
        name: `hindwing${S}`,
      },
    );
    b.decal(w, wingSvg(), {
      at: [s * 0.012 + s * 0.03, BY + 0.056, -0.11],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.07, 0.24],
      segments: [3, 10],
      mirror: s < 0,
    });
  }

  // ---- mandibles: antler beams on hinges
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts: [number, number, number][] = [
      [s * 0.052, BY + 0.014, 0.215],
      [s * 0.088, BY + 0.026, 0.27],
      [s * 0.088, BY + 0.046, 0.325],
      [s * 0.058, BY + 0.068, 0.368],
      [s * 0.028, BY + 0.078, 0.392],
    ];
    const chain = b.chain(`mandible${S}`, catmull(pts), {
      parent: head,
      count: 2,
      names: [`mandible${S}`, `mandibleTip${S}`],
      role: "jaw",
    });
    b.part(new THREE.SphereGeometry(0.021, 6, 4), CHITIN_LIGHT, { bone: chain.joints[0], at: pts[0], flat: true });
    const beam = b.sweep(chain, (t) => [0.011 * Math.pow(1 - t, 0.7) + 0.005, 0.013 * Math.pow(1 - t, 0.7) + 0.005], {
      sides: 6,
      smooth: false,
      bands: [
        [0.88, MAND],
        [1, MAND_TIP],
      ],
      caps: { start: "flat", end: "point" },
      name: `mandibleBeam${S}`,
    });
    const inner = s > 0 ? 90 : -90;
    // a curved tine growing off the beam: out along dir, bending toward the midline
    const tine = (t: number, ang: number, dir: [number, number, number], len: number, rad: number, col = MAND) => {
      const f = beam.at(t, ang);
      const p1 = offset(f, dir, len * 0.55);
      const p2 = offset(p1, [dir[0] - s * 0.5, dir[1], dir[2] + 0.35], len * 0.45);
      b.sweep(catmull([f, p1, p2]), [rad, 0], { sides: 5, smooth: false, color: col, caps: "point" });
    };
    tine(0.2, inner, [-s * 0.8, 0.3, 0.5], 0.05, 0.013); // big inner tooth near the base
    tine(0.42, 0, [-s * 0.1, 1, 0.3], 0.065, 0.011); // first tall tine
    tine(0.6, 0, [-s * 0.15, 1, 0.35], 0.065, 0.01); // second tall tine
    tine(0.58, inner, [-s * 0.9, 0.2, 0.45], 0.036, 0.008); // inner tine
    tine(0.94, 0, [-s * 0.3, 0.9, 0.5], 0.032, 0.006, MAND_TIP); // terminal fork
  }

  // ---- antennae: elbowed, ending in a comb of lamellae
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const a0 = new THREE.Vector3(s * 0.045, BY + 0.05, 0.225);
    const a1 = new THREE.Vector3(s * 0.07, BY + 0.085, 0.262); // the elbow
    const a2 = new THREE.Vector3(s * 0.052, BY + 0.098, 0.3);
    const a3 = new THREE.Vector3(s * 0.04, BY + 0.1, 0.322);
    const chain = b.chain(`antenna${S}`, polyline([a0, a1, a2, a3]), {
      parent: head,
      names: [`antennaBase${S}`, `antennaElbow${S}`, `antennaClub${S}`, `antennaTip${S}`],
      role: "tentacle",
    });
    const [j0, j1, j2] = chain.joints;
    b.rod(j0, j1, [0.0085, 0.0075], { sides: 5, smooth: false, color: "#5a2a14", caps: "flat" });
    b.rod(j1, j2, [0.0065, 0.006], { sides: 5, smooth: false, color: "#3a2016", caps: "flat" });
    b.part(new THREE.SphereGeometry(0.0115, 5, 4), "#5a2a14", { bone: j1, at: a1, flat: true });
    b.rod(j2, chain.joints[3], [0.006, 0.0045], { sides: 5, smooth: false, color: "#3a2016", caps: "flat" });
    // the comb: four lamellae fanned about the club axis
    const d = a3.clone().sub(a2).normalize();
    const base = new THREE.Vector3(0, 1, 0).addScaledVector(d, -d.y).normalize();
    for (let k = 0; k < 4; k++) {
      const ang = ((k - 1.5) * 30 * Math.PI) / 180;
      const perp = base.clone().applyAxisAngle(d, ang * s);
      b.extrude(
        [
          [0, 0],
          [0.008, -0.004],
          [0.024, -0.005],
          [0.03, 0.002],
          [0.028, 0.011],
          [0.012, 0.016],
          [0.003, 0.009],
        ],
        {
          at: a2.clone(),
          x: [d.x, d.y, d.z],
          y: [perp.x, perp.y, perp.z],
          thickness: 0.004,
          color: k % 2 ? "#b4511d" : "#9a4116",
          bone: chain.joints[3],
        },
      );
    }
  }

  // ---- legs
  const legSpec: [string, number, number, number, number, number][] = [
    // name, hipZ, kneeX, kneeZ, toeX, toeZ
    ["F", 0.065, 0.17, 0.14, 0.125, 0.19],
    ["M", -0.005, 0.195, -0.005, 0.14, 0.0],
    ["H", -0.085, 0.175, -0.15, 0.13, -0.205],
  ];
  const toes: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const [n, hipZ, kx, kz, tx, tz] of legSpec) {
      const hipP = new THREE.Vector3(s * 0.058, BY - 0.012, hipZ);
      const kneeP = new THREE.Vector3(s * kx, BY + 0.03, kz);
      const hit = logSurf.ray([s * tx, 1, tz], [0, -1, 0]);
      if (!hit) throw new Error(`no log under foot ${n}${S}`);
      const toe = hit.at.clone();
      const nrm = hit.n.clone();
      const out = new THREE.Vector3(s, 0, 0);
      const fwd = new THREE.Vector3(0, 0, Math.sign(tz - hipZ) * 0.3);
      const ankle = toe
        .clone()
        .addScaledVector(nrm, 0.05)
        .addScaledVector(out, 0.03)
        .add(fwd.clone().multiplyScalar(0.08));
      toes.push(toe);
      const chain = b.chain(`leg${n}${S}`, polyline([hipP, kneeP, ankle, toe]), {
        parent: thorax,
        names: [`hip${n}${S}`, `knee${n}${S}`, `ankle${n}${S}`, `foot${n}${S}`],
        role: "leg",
        contact: toe,
      });
      const [hj, kj, aj, fj] = chain.joints;
      // coxa set into the underside
      b.capsule(new THREE.Vector3(s * 0.03, BY - 0.02, hipZ), hj, 0.022, {
        bone: thorax,
        sides: 6,
        smooth: false,
        color: CHITIN,
      });
      b.part(new THREE.SphereGeometry(0.024, 6, 4), CHITIN, { bone: hj, at: hipP, flat: true });
      b.rod(hj, kj, [0.022, 0.017], { sides: 6, smooth: false, color: FEMUR, caps: "flat", name: `femur${n}${S}` });
      b.part(new THREE.SphereGeometry(0.022, 6, 4), FEMUR, { bone: kj, at: kneeP, flat: true });
      b.rod(kj, aj, [0.0145, 0.0105], { sides: 6, smooth: false, color: TIBIA, caps: "flat", name: `tibia${n}${S}` });
      b.part(new THREE.SphereGeometry(0.0135, 6, 4), TIBIA, { bone: aj, at: ankle, flat: true });
      // outer spines down the tibia, two spurs at its tip
      for (const t of [0.35, 0.55, 0.75]) {
        const base = lerp(kneeP, ankle, t);
        base.x += s * 0.007;
        b.spike(base, [s, -0.6, n === "F" ? 0.2 : 0], 0.026, 0.0055, {
          bone: kj,
          sides: 4,
          smooth: false,
          color: "#22130c",
        });
      }
      // tarsus: a short jointed rod ending in two hooked claws
      b.rod(aj, fj, [0.0092, 0.0072], {
        sides: 5,
        smooth: false,
        color: "#22130c",
        caps: "flat",
        name: `tarsus${n}${S}`,
      });
      for (const t of [0.4, 0.75]) {
        b.part(new THREE.SphereGeometry(0.009, 5, 4), "#3a2016", { bone: fj, at: lerp(ankle, toe, t), flat: true });
      }
      const dirT = toe.clone().sub(ankle).normalize();
      const side = new THREE.Vector3().crossVectors(dirT, nrm).normalize();
      for (const c of [-1, 1]) {
        const c0 = toe.clone().addScaledVector(side, c * 0.007);
        const c1 = c0.clone().addScaledVector(dirT, 0.018).addScaledVector(nrm, 0.007);
        const c2 = c0.clone().addScaledVector(dirT, 0.028).addScaledVector(nrm, -0.012);
        b.sweep(catmull([c0, c1, c2]), [0.0065, 0.0008], {
          bone: fj,
          sides: 4,
          smooth: false,
          color: "#120a06",
          caps: "point",
        });
      }
    }
  }

  // ---- hair tufts on the underside and cheeks
  const under = b.surface(thoraxUnder);
  const hairHits = under.scatter(22, { rng: rand, minDist: 0.025, filter: (h) => h.n.y < 0.4 });
  b.cards(hairHits, hairSvg(), {
    size: [0.012, 0.018],
    lean: 50,
    flow: [0, -0.3, -1],
    vary: 0.3,
    rng: rand,
    cross: true,
  });
  // a golden fringe along the pronotum's sides and the cheeks
  const fringeHits = [
    ...b
      .surface(pronotum)
      .scatter(40, { rng: rand, minDist: 0.02, filter: (h) => Math.abs(h.at.x) > 0.06 && h.n.y < 0.75 }),
    ...b
      .surface(skull)
      .scatter(16, { rng: rand, minDist: 0.025, filter: (h) => Math.abs(h.at.x) > 0.06 && h.n.y < 0.6 }),
  ];
  b.cards(fringeHits, hairSvg(), {
    size: [0.02, 0.026],
    lean: 60,
    flow: [0, -0.2, -1],
    vary: 0.3,
    rng: rand,
    cross: true,
  });

  // ---- moss and ground cover
  const mossHits = logSurf.scatter(140, {
    rng: rng(3),
    minDist: 0.075,
    filter: (h) => {
      if (h.n.y < 0.3) return false;
      return toes.every((t) => t.distanceTo(h.at) > 0.05) && Math.abs(h.at.x) < 0.13;
    },
  });
  b.cards(mossHits, [mossTuftSvg(41, false), mossTuftSvg(43, false), mossTuftSvg(47, true)], {
    size: [0.07, 0.045],
    lean: 35,
    flow: [0, 0, 1],
    vary: 0.35,
    spin: 180,
    rng: rng(9),
    cross: true,
  });
  // a soft fringe of moss along the broken end and low on the flanks
  const mossLow = logSurf.scatter(60, {
    rng: rng(13),
    minDist: 0.05,
    filter: (h) => h.n.y < 0.3 && h.n.y > -0.35 && Math.abs(h.at.z) > 0.35,
  });
  b.cards(mossLow, mossTuftSvg(51, false), {
    size: [0.075, 0.05],
    lean: 25,
    flow: [0, -1, 0],
    vary: 0.3,
    rng: rng(15),
  });

  // grass tufts and leaf litter on the floor
  const floorRng = rng(31);
  const grassFrames = Array.from({ length: 18 }, () => {
    const side = floorRng() < 0.5 ? 1 : -1;
    return frame([side * (0.18 + floorRng() * 0.16), 0.02, (floorRng() - 0.5) * 1.0], [0, 1, 0]);
  });
  b.cards(grassFrames, grassSvg(), {
    size: [0.09, 0.13],
    lean: 8,
    flow: [0, 0, 1],
    vary: 0.35,
    spin: 180,
    rng: rng(2),
    cross: true,
    bone: log,
  });
  const leafFrames = Array.from({ length: 10 }, () => {
    const side = floorRng() < 0.5 ? 1 : -1;
    return frame([side * (0.2 + floorRng() * 0.16), 0.012, (floorRng() - 0.5) * 1.0], [0, 1, 0]);
  });
  b.cards(leafFrames, [leafSvg("#a8541f", "#6a2c0f"), leafSvg("#c98a2a", "#7a4a12"), leafSvg("#8a3a1a", "#4a1c0a")], {
    size: [0.07, 0.11],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
    rng: rng(6),
    mirror: true,
    bone: log,
  });

  return b.root;
}
