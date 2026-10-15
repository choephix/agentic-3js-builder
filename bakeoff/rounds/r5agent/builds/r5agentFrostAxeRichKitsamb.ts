import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, mix, mottle, noise, paint, smoothstep, grain } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering two-handed glacier axe planted in a snowy rune dais: crescent blade with a glowing frost-fern core, talon back-spike, crystal crown, crimson pennant tails and a hanging ice charm.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: deep indigo steel, one hot ice-cyan glow, pale frost, a crimson cloth accent.
const NAVY = "#14234a";
const NAVY2 = "#233c78";
const STEEL = "#5f86bd";
const SILVER = "#c9d9ec";
const FROST = "#dff6ff";
const ICE = "#9fe3ff";
const ICE2 = "#6cc8f5";
const CYAN = "#3fe3ff";
const DEEP = "#1f64e6";
const CRIMSON = "#e0304f";
const CRIMSON_D = "#8f1d3a";
const GOLD = "#f2c14e";
const STONE = "#273049";
const STONE2 = "#3d4a6b";
const SNOW = "#f5fbff";
const VIOLET = "#2d2a66";
const CLOTH = "#cfeaf7";

// ---------------------------------------------------------------------------------------------------------------
// Blade design, in meters. Head centre sits at HC on the haft; outlines run +X (the model's left) for the blade.
const HC = 1.26;
const K = 0.64;
type Pt = [number, number, "sharp"?];
const BLADE_RAW: Pt[] = [
  [0.04, 0.14],
  [0.12, 0.3],
  [0.2, 0.5],
  [0.22, 0.74, "sharp"],
  [0.33, 0.5],
  [0.48, 0.36],
  [0.58, 0.18],
  [0.63, 0.0],
  [0.58, -0.18],
  [0.48, -0.34],
  [0.33, -0.46],
  [0.22, -0.68, "sharp"],
  [0.18, -0.46],
  [0.1, -0.28],
  [0.04, -0.14],
];
const FLUKE_RAW: Pt[] = [
  [-0.04, 0.12],
  [-0.18, 0.12],
  [-0.34, 0.16],
  [-0.5, 0.26],
  [-0.66, 0.44, "sharp"],
  [-0.54, 0.16],
  [-0.38, 0.02],
  [-0.2, -0.07],
  [-0.04, -0.12],
];
const sc = (pts: Pt[], k: number): Pt[] => pts.map((p) => (p[2] ? [p[0] * k, p[1] * k, "sharp"] : [p[0] * k, p[1] * k]));
const centroid = (pts: Pt[]): [number, number] => {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
  }
  return [x / pts.length, y / pts.length];
};
const inset = (pts: Pt[], c: [number, number], s: number): Pt[] =>
  pts.map((p) => {
    const q: Pt = [c[0] + (p[0] - c[0]) * s, c[1] + (p[1] - c[1]) * s];
    if (p[2]) q[2] = "sharp";
    return q;
  });
const inPoly = (pts: Pt[], x: number, y: number) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

const BLADE = sc(BLADE_RAW, K);
const FLUKE = sc(FLUKE_RAW, K * 0.92);
const BC = centroid(BLADE.filter((p) => p[0] > 0.1)) as [number, number];
const FC = centroid(FLUKE);
const BLADE_MID = inset(BLADE, BC, 0.84);
const BLADE_CORE = inset(BLADE, BC, 0.6);
const FLUKE_MID = inset(FLUKE, FC, 0.7);

// ---------------------------------------------------------------------------------------------------------------
// Drawings, all authored in millimetres of blade space (y up) and flipped into SVG space.
type Seg = [number, number, number, number, number];
function drawing(
  box: [number, number, number, number],
  mirror: boolean,
  body: (mm: (v: number) => number) => string,
  size: number,
) {
  const [x0, y0, x1, y1] = box.map((v) => v * 1000);
  const w = x1 - x0;
  const h = y1 - y0;
  const vb = mirror ? `${-x1} ${-y1} ${w} ${h}` : `${x0} ${-y1} ${w} ${h}`;
  const tf = mirror ? "scale(-1,-1)" : "scale(1,-1)";
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><g transform="${tf}">${body((v) => v * 1000)}</g></svg>`, {
    size,
  });
}
const line = (s: Seg, col: string, op = 1) =>
  `<line x1="${s[0]}" y1="${s[1]}" x2="${s[2]}" y2="${s[3]}" stroke="${col}" stroke-width="${s[4]}" stroke-linecap="round" opacity="${op}"/>`;
const poly = (pts: Pt[], extra: string) =>
  `<polygon points="${pts.map((p) => `${(p[0] * 1000).toFixed(1)},${(p[1] * 1000).toFixed(1)}`).join(" ")}" ${extra}/>`;

/** Frost-fern branches along a spine, clipped to a polygon. */
function fern(from: [number, number], to: [number, number], clip: Pt[], width: number, spacing: number, branch: number) {
  const out: Seg[] = [];
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const ok = (x: number, y: number) => inPoly(clip, x, y);
  const add = (x1: number, y1: number, x2: number, y2: number, w: number) => {
    if (ok(x1, y1) && ok(x2, y2)) out.push([x1 * 1000, y1 * 1000, x2 * 1000, y2 * 1000, w]);
  };
  add(from[0], from[1], to[0], to[1], width * 1.5);
  const n = Math.floor(len / spacing);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const px = from[0] + dx * t;
    const py = from[1] + dy * t;
    const bl = branch * (1 - t * 0.55);
    for (const sgn of [1, -1]) {
      for (const ang of [52, 30]) {
        const a = (ang * Math.PI) / 180;
        const bx = ux * Math.cos(a) - sgn * uy * Math.sin(a);
        const by = uy * Math.cos(a) + sgn * ux * Math.sin(a);
        const l = ang === 52 ? bl : bl * 0.55;
        const ox = ang === 52 ? 0 : ux * spacing * 0.5;
        const oy = ang === 52 ? 0 : uy * spacing * 0.5;
        add(px + ox, py + oy, px + ox + bx * l, py + oy + by * l, width);
        // twig
        const mx = px + ox + bx * l * 0.55;
        const my = py + oy + by * l * 0.55;
        const ta = a * 0.4;
        const tx = ux * Math.cos(ta) - sgn * uy * Math.sin(ta);
        const ty = uy * Math.cos(ta) + sgn * ux * Math.sin(ta);
        add(mx, my, mx + tx * l * 0.4, my + ty * l * 0.4, width * 0.8);
      }
    }
  }
  return out;
}

/** Engraved ticks between two nested outlines. */
function ticks(outline: Pt[], c: [number, number], a: number, bk: number, step: number, minU: number) {
  const out: Seg[] = [];
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i];
    const q = outline[(i + 1) % outline.length];
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const n = Math.max(1, Math.round(l / step));
    for (let j = 0; j < n; j++) {
      const t = (j + 0.5) / n;
      const x = p[0] + (q[0] - p[0]) * t;
      const y = p[1] + (q[1] - p[1]) * t;
      if (Math.abs(x) < minU) continue;
      const x1 = c[0] + (x - c[0]) * a;
      const y1 = c[1] + (y - c[1]) * a;
      const x2 = c[0] + (x - c[0]) * bk;
      const y2 = c[1] + (y - c[1]) * bk;
      out.push([x1 * 1000, y1 * 1000, x2 * 1000, y2 * 1000, 2.2]);
    }
  }
  return out;
}

const bbox = (pts: Pt[], pad = 0.005): [number, number, number, number] => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad];
};

function bladeTexture(kind: "core" | "ring", mirror: boolean) {
  const box = bbox(BLADE_MID);
  const clip = inset(BLADE_CORE, BC, 0.9);
  if (kind === "core") {
    return drawing(
      box,
      mirror,
      () => {
        const gid = mirror ? "gm" : "gf";
        let s = `<defs><radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${BC[0] * 1000 + 40}" cy="${BC[1] * 1000}" r="260"><stop offset="0" stop-color="#f4ffff"/><stop offset="0.35" stop-color="#7ff0ff"/><stop offset="1" stop-color="#1f8ff2"/></radialGradient></defs>`;
        s += poly(inset(BLADE_CORE, BC, 0.97), `fill="url(#${gid})"`);
        const spines: [[number, number], [number, number]][] = [
          [[0.07, 0.0], [0.5 * K * 1.4, 0.0]],
          [[0.11, 0.07], [0.22 * K, 0.62 * K]],
          [[0.11, -0.07], [0.2 * K, -0.58 * K]],
        ];
        for (const [a, b] of spines) for (const seg of fern(a, b, clip, 1.6, 0.032, 0.13)) s += line(seg, "#ffffff", 0.95);
        // glints
        s += `<polygon points="250,40 256,52 268,56 256,60 250,72 244,60 232,56 244,52" fill="#ffffff"/>`;
        return s;
      },
      1024,
    );
  }
  return drawing(
    box,
    mirror,
    () => {
      let s = "";
      for (const seg of ticks(BLADE_MID, BC, 0.7, 0.88, 0.036, 0.07)) s += line(seg, "#10285a", 0.9);
      // rim highlight line just inside the mid layer
      s += poly(inset(BLADE_MID, BC, 0.985), `fill="none" stroke="#e8fbff" stroke-width="1.8" opacity="0.9"`);
      return s;
    },
    1024,
  );
}

function flukeTexture(kind: "core" | "ring", mirror: boolean) {
  const box = bbox(FLUKE_MID);
  if (kind === "core") {
    return drawing(
      box,
      mirror,
      () => {
        const gid = mirror ? "fm" : "ff";
        let s = `<defs><linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="-380" y2="200"><stop offset="0" stop-color="#1f8ff2"/><stop offset="0.6" stop-color="#6fe8ff"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>`;
        s += poly(inset(FLUKE_MID, FC, 0.95), `fill="url(#${gid})"`);
        const clip = inset(FLUKE_MID, FC, 0.85);
        for (const seg of fern([-0.04, 0.03], [-0.34, 0.14], clip, 1.2, 0.022, 0.05)) s += line(seg, "#ffffff", 0.9);
        return s;
      },
      512,
    );
  }
  return drawing(
    box,
    mirror,
    () => {
      let s = "";
      for (const seg of ticks(FLUKE, FC, 0.74, 0.9, 0.03, 0.06)) s += line(seg, "#10285a", 0.9);
      return s;
    },
    512,
  );
}

function runeGlyph(r: () => number, cx: number, cy: number, size: number, rot: number, w: number, col: string) {
  const pts: [number, number][] = [];
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) pts.push([(r() - 0.5) * size, (r() - 0.5) * size * 1.6]);
  let d = "";
  for (let i = 0; i < pts.length - 1; i += 1) {
    d += `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i + 1][0]}" y2="${pts[i + 1][1]}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  d += `<line x1="0" y1="${-size * 0.85}" x2="0" y2="${size * 0.85}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">${d}</g>`;
}

function daisRunes() {
  const r = rng(11);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200">`;
  s += `<circle cx="0" cy="0" r="96" fill="#0b1a3c" opacity="0.55"/>`;
  s += `<circle cx="0" cy="0" r="94" fill="none" stroke="#3fe3ff" stroke-width="2.4"/>`;
  s += `<circle cx="0" cy="0" r="62" fill="none" stroke="#3fe3ff" stroke-width="2"/>`;
  s += `<circle cx="0" cy="0" r="58" fill="none" stroke="#9fe9ff" stroke-width="1.2"/>`;
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r0 = i % 4 === 0 ? 86 : 90;
    s += `<line x1="${Math.cos(a) * r0}" y1="${Math.sin(a) * r0}" x2="${Math.cos(a) * 94}" y2="${Math.sin(a) * 94}" stroke="#3fe3ff" stroke-width="1.6"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    s += runeGlyph(r, Math.cos(a) * 76, Math.sin(a) * 76, 8, (a * 180) / Math.PI + 90, 1.8, "#c8f6ff");
  }
  // snowflake star in the middle ring
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x2 = Math.cos(a) * 56;
    const y2 = Math.sin(a) * 56;
    s += `<line x1="${Math.cos(a) * 20}" y1="${Math.sin(a) * 20}" x2="${x2}" y2="${y2}" stroke="#3fe3ff" stroke-width="2.2" stroke-linecap="round"/>`;
    const mx = Math.cos(a) * 40;
    const my = Math.sin(a) * 40;
    for (const sg of [1, -1]) {
      const b = a + sg * 0.6;
      s += `<line x1="${mx}" y1="${my}" x2="${mx + Math.cos(b) * 10}" y2="${my + Math.sin(b) * 10}" stroke="#c8f6ff" stroke-width="1.6" stroke-linecap="round"/>`;
    }
  }
  s += `</svg>`;
  return svg(s, { size: 1024 });
}

function hazeRunes(rot: number) {
  const r = rng(40 + rot);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120">`;
  s += `<line x1="20" y1="4" x2="20" y2="116" stroke="#3fe3ff" stroke-width="1.6"/>`;
  for (let i = 0; i < 5; i++) s += runeGlyph(r, 20, 16 + i * 22, 9, 0, 2, "#baf4ff");
  s += `<polygon points="20,0 24,5 20,10 16,5" fill="#ffffff"/><polygon points="20,110 24,115 20,120 16,115" fill="#ffffff"/>`;
  s += `</svg>`;
  return svg(s, { size: 256 });
}

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">
  <polygon points="24,0 29,30 24,64 19,30" fill="#e9fbff"/>
  <polygon points="9,14 16,34 12,56 6,34" fill="#bdeeff"/>
  <polygon points="39,18 43,38 37,56 33,34" fill="#cdf3ff"/>
  <polygon points="24,0 27,30 24,64 24,30" fill="#ffffff" opacity="0.7"/>
  </svg>`,
  { size: 128 },
);
const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <rect x="12" y="0" width="8" height="10" rx="2" fill="#f2c14e"/>
  <polygon points="6,10 26,10 30,64 2,64" fill="#e0304f"/>
  <polygon points="16,10 26,10 30,64 16,64" fill="#b8213f"/>
  <line x1="10" y1="12" x2="8" y2="62" stroke="#ff8aa0" stroke-width="1.4"/>
  <line x1="16" y1="12" x2="16" y2="62" stroke="#ff8aa0" stroke-width="1.4"/>
  <line x1="22" y1="12" x2="24" y2="62" stroke="#ff8aa0" stroke-width="1.4"/>
  <rect x="5" y="22" width="22" height="4" fill="#f2c14e"/>
  </svg>`,
  { size: 128 },
);
const PENDANT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
  <polygon points="20,0 38,26 20,64 2,26" fill="#3fe3ff"/>
  <polygon points="20,0 38,26 20,26" fill="#c8faff"/>
  <polygon points="20,26 38,26 20,64" fill="#1f8ff2"/>
  <polygon points="20,0 2,26 20,26" fill="#7ff0ff"/>
  <polygon points="20,26 2,26 20,64" fill="#2fb5f5"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "frostAxe", paintSize: 2048 });
  const axe = b.joint("axe", { at: [0, 0, 0], dir: [0, 1, 0] });
  const R = rng(7);
  const own = { bone: axe } as const;

  // -------------------------------------------------------------------------------------------------------------
  // Dais
  const stoneTop = countershade(mottle(SNOW, "#cfe9f7", { size: 0.07, seed: 3 }), mottle(STONE, STONE2, { size: 0.09, seed: 5 }), {
    level: 0.55,
    soft: 0.15,
  });
  const daisPaint = paint((p, n, s) => {
    if (n.y > 0.6) return stoneTop;
    const a = Math.atan2(p.x, p.z) / (Math.PI * 2) + 1;
    const seam = (a * 28) % 1 < 0.05;
    const chip = noise(p, 0.05, 9) > 0.78 && n.y < 0.2;
    if (seam || s[0] < -1) return "#0d1428";
    return chip ? STONE : mottle(STONE2, STONE, { size: 0.08, seed: 4 });
  });
  const dais = b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.6, 0.05],
      [0.52, 0.056],
      [0.52, 0.105],
      [0.5, 0.115],
      [0, 0.115],
    ],
    { at: [0, 0, 0], segments: 20, color: daisPaint, name: "dais", ...own },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.46, 40), "#ffffff", {
      at: [0, 0.1175, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: daisRunes(),
      name: "runeCircle",
      ...own,
    }),
    1.1,
  );
  // stone studs round the tier rim
  {
    const studs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.05, 0.03, 0.03);
      g.rotateY(a);
      g.translate(Math.sin(a) * 0.58, 0.058, Math.cos(a) * 0.58);
      studs.push(g);
    }
    b.part(mergeGeometries(studs), STONE2, { at: [0, 0, 0], name: "tierBlocks", flat: true, ...own });
  }

  // pedestal of ice the axe is driven into
  const iceBlock = paint((p) => mix(ICE2, FROST, smoothstep(0.1, 0.9, noise(p, 0.06, 2) + (p.y - 0.12) * 2)));
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.14, 0.04],
      [0.11, 0.075],
      [0.05, 0.085],
      [0, 0.085],
    ],
    { at: [0, 0.115, 0], segments: 7, color: iceBlock, name: "pedestal", ...own },
  );

  // crystal helper: hex prism body + pointed tip
  const crystal = (
    base: [number, number, number],
    dir: [number, number, number],
    len: number,
    r: number,
    color: string,
    glowing = 0,
  ) => {
    const d = new THREE.Vector3(...dir).normalize();
    const bv = new THREE.Vector3(...base);
    const mid = bv.clone().addScaledVector(d, len * 0.6);
    const tip = bv.clone().addScaledVector(d, len);
    const body = b.rod(bv, mid, [r, r * 0.92], { sides: 6, caps: "flat", color, ...own });
    const point = b.spike(mid, tip, null, r * 0.92, { sides: 6, color, ...own });
    if (glowing) {
      glow(body, glowing);
      glow(point, glowing);
    }
  };
  const lean = (azimuth: number, tilt: number): [number, number, number] => [
    Math.sin(azimuth) * Math.sin(tilt),
    Math.cos(tilt),
    Math.cos(azimuth) * Math.sin(tilt),
  ];

  // inner ring of tall crystals around the axe butt
  for (let i = 0; i < 7; i++) {
    const az = (i / 7) * Math.PI * 2 + 0.3;
    const rad = 0.16 + R() * 0.03;
    const len = 0.2 + R() * 0.2 + (Math.cos(az) < 0 ? 0.1 : 0);
    crystal(
      [Math.sin(az) * rad, 0.17, Math.cos(az) * rad],
      lean(az, 0.25 + R() * 0.25),
      len,
      0.026 + R() * 0.012,
      i % 3 === 0 ? CYAN : i % 2 ? ICE : FROST,
      i % 3 === 0 ? 1.1 : 0,
    );
  }
  // mid ring
  for (let i = 0; i < 12; i++) {
    const az = (i / 12) * Math.PI * 2 + 0.1 + R() * 0.15;
    const rad = 0.3 + R() * 0.08;
    crystal(
      [Math.sin(az) * rad, 0.11, Math.cos(az) * rad],
      lean(az, 0.2 + R() * 0.45),
      0.08 + R() * 0.14,
      0.017 + R() * 0.01,
      i % 4 === 0 ? CYAN : i % 2 ? ICE2 : ICE,
      i % 4 === 0 ? 1 : 0,
    );
  }
  // outer snowy shard fringe
  for (let i = 0; i < 16; i++) {
    const az = (i / 16) * Math.PI * 2 + R() * 0.2;
    const rad = 0.43 + R() * 0.04;
    crystal([Math.sin(az) * rad, 0.11, Math.cos(az) * rad], lean(az, 0.4 + R() * 0.4), 0.04 + R() * 0.06, 0.011 + R() * 0.006, i % 2 ? FROST : ICE);
  }
  // frost tufts on tier tops
  {
    const daisSurf = b.surface(dais);
    const hits = daisSurf.scatter(160, {
      rng: rng(21),
      minDist: 0.045,
      filter: (h) => h.n.y > 0.85 && Math.hypot(h.at.x, h.at.z) > 0.47,
    });
    b.cards(hits, TUFT, { size: [0.05, 0.07], lean: 0, flow: [0, 0, 1], vary: 0.4, spin: 180, rng: rng(22), cross: true, ...own });
  }
  // snow drifts on the dais
  for (const [x, z, sx, sz] of [
    [0.4, 0.28, 0.08, 0.05],
    [-0.42, 0.22, 0.07, 0.05],
    [-0.12, 0.5, 0.06, 0.04],
    [0.3, -0.42, 0.09, 0.05],
    [-0.36, -0.36, 0.07, 0.045],
  ] as const)
    b.part(new THREE.SphereGeometry(1, 7, 4), SNOW, { at: [x, 0.108, z], scale: [sx, 0.022, sz], name: "drift", ...own });

  // -------------------------------------------------------------------------------------------------------------
  // Haft
  const hLine = (y0: number, y1: number): [number, number, number][] => [
    [0, y0, 0],
    [0, y1, 0],
  ];
  const ring = (y: number, r: number, h: number, color: string, segs = 8, name?: string) =>
    b.lathe(
      [
        [0, 0],
        [r - 0.005, 0],
        [r, 0.005],
        [r, h - 0.005],
        [r - 0.005, h],
        [0, h],
      ],
      { at: [0, y, 0], segments: segs, color, name, ...own },
    );

  // ferrule: spike driven into the ice, finned cap
  b.spike([0, 0.215, 0], [0, -1, 0], 0.07, 0.03, { sides: 8, color: SILVER, ...own });
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.04, 0.03],
      [0.036, 0.1],
      [0.046, 0.12],
      [0.046, 0.135],
      [0.034, 0.155],
      [0, 0.155],
    ],
    { at: [0, 0.195, 0], segments: 8, color: NAVY2, name: "ferrule", ...own },
  );
  ring(0.205, 0.048, 0.016, SILVER, 8, "ferruleRingLow");
  ring(0.295, 0.05, 0.014, GOLD, 8, "ferruleRingGold");
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    b.extrude(
      [
        [0, 0],
        [0.045, 0.03],
        [0.07, 0.11],
        [0.03, 0.09],
        [0, 0.14, "sharp"],
      ],
      { at: [dx * 0.034, 0.215, dz * 0.034], x: [dx, 0, dz], thickness: 0.012, bevel: 0.003, color: SILVER, name: "ferruleFin", ...own },
    );
    crystal([dx * 0.05, 0.32, dz * 0.05], [dx * 0.8, 0.6, dz * 0.8], 0.06, 0.011, CYAN, 1);
  }

  // grip wrap
  const wrap = paint((p) => {
    const a = Math.atan2(p.x, p.z) / (Math.PI * 2);
    const f = (((a + p.y / 0.075) % 1) + 1) % 1;
    if (f < 0.07) return "#0d1630";
    return f < 0.55 ? VIOLET : mix(CLOTH, "#a5cfe6", noise(p, 0.03, 1));
  });
  b.sweep(hLine(0.335, 0.85), 0.031, { section: { ngon: 8 }, caps: "flat", color: wrap, name: "grip", ...own });
  ring(0.33, 0.04, 0.02, STEEL, 8, "gripCapLow");
  ring(0.84, 0.042, 0.02, STEEL, 8, "gripCapHigh");
  ring(0.57, 0.036, 0.012, SILVER, 8, "gripRingMid");
  // glowing ice bands in the grip
  for (const y of [0.45, 0.7])
    glow(ring(y, 0.0335, 0.012, CYAN, 8, "gripGlow"), 1.2);

  // upper haft
  b.sweep(hLine(0.85, 1.12), 0.027, { section: { ngon: 8 }, caps: "flat", color: grain(NAVY, NAVY2, { size: 0.02 }), name: "haftUpper", ...own });
  const rune = hazeRunes(0);
  for (const sd of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.036, 0.11), "#ffffff", {
        at: [0, 0.98, sd * 0.0275],
        dir: [0, 0, sd],
        axis: "z",
        up: [0, 1, 0],
        texture: rune,
        name: "haftRunes",
        ...own,
      }),
      1.1,
    );

  // crimson knot and pennant tails
  ring(0.885, 0.036, 0.03, CRIMSON_D, 8, "knotBand");
  b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 10), CRIMSON, { at: [0, 0.9, 0], rotation: [90, 0, 0], name: "knotRope", ...own });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), CRIMSON, { at: [0.03, 0.89, 0.025], name: "knot", ...own });
  const tails: [number, number[][]][] = [
    [
      0,
      [
        [0.035, 0.88, 0.02],
        [0.12, 0.82, 0.06],
        [0.18, 0.7, 0.03],
        [0.27, 0.6, 0.08],
        [0.31, 0.46, 0.05],
      ],
    ],
    [
      1,
      [
        [-0.03, 0.88, 0.03],
        [-0.1, 0.8, -0.02],
        [-0.15, 0.66, 0.02],
        [-0.23, 0.55, -0.03],
        [-0.26, 0.4, 0.0],
      ],
    ],
  ];
  for (const [i, pts] of tails) {
    const joint = b.joint(`pennant${i + 1}`, {
      parent: axe,
      at: pts[0] as [number, number, number],
      aim: pts[2] as [number, number, number],
      role: "hinge",
    });
    const wA = pts.map((p) => [p[0], p[1], p[2]]);
    const wB = pts.map((p, k) => {
      const width = 0.07 * (1 - (k / (pts.length - 1)) * 0.5);
      return [p[0] + (i ? -0.02 : 0.02), p[1], p[2] + width];
    });
    const m = b.membrane(catmull(wA), catmull(wB), {
      thickness: 0.006,
      color: paint((_p, _n, s) => {
        const band = Math.abs(s[1] - 0.5) < 0.09 && s[0] > 0.18 && s[0] < 0.26;
        const trim = s[0] > 0.88 || s[1] < 0.05 || s[1] > 0.95;
        return band ? GOLD : trim ? CRIMSON_D : mix(CRIMSON, "#ff6f89", s[1] * 0.5);
      }),
      scallop: 0.2,
      rows: 3,
      bone: joint,
      name: `pennant${i + 1}`,
    });
    void m;
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: pts[pts.length - 1] as [number, number, number], bone: joint, name: "pennantBead" });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: socket, blade layers, fluke
  const socketPaint = paint((p, n) => {
    const base = mix(NAVY2, STEEL, smoothstep(-0.3, 1, n.y * 0.6 + noise(p, 0.04, 6) * 0.8 - 0.1));
    return Math.abs(p.y - HC) < 0.012 ? SILVER : base;
  });
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.066, 0.03],
      [0.054, 0.08],
      [0.05, 0.13],
      [0.05, 0.19],
      [0.056, 0.23],
      [0.07, 0.29],
      [0.0, 0.29],
    ],
    { at: [0, HC - 0.145, 0], segments: 8, color: socketPaint, name: "socket", ...own },
  );
  ring(HC - 0.012, 0.062, 0.024, SILVER, 8, "socketBand");
  ring(HC - 0.155, 0.068, 0.016, GOLD, 8, "socketCollar");
  {
    const rivets: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      rivets.push(new THREE.SphereGeometry(0.0085, 5, 4).translate(Math.sin(a) * 0.067, HC - 0.147, Math.cos(a) * 0.067));
      rivets.push(new THREE.SphereGeometry(0.0075, 5, 4).translate(Math.sin(a) * 0.072, HC + 0.133, Math.cos(a) * 0.072));
    }
    b.part(mergeGeometries(rivets), GOLD, { at: [0, 0, 0], name: "rivets", ...own });
  }
  // crown crystals
  ring(HC + 0.13, 0.072, 0.018, GOLD, 8, "crownBand");
  crystal([0, HC + 0.14, 0], [0, 1, 0], 0.42, 0.034, CYAN, 1.2);
  for (let i = 0; i < 4; i++) {
    const az = (i / 4) * Math.PI * 2 + Math.PI / 4;
    crystal([Math.sin(az) * 0.05, HC + 0.14, Math.cos(az) * 0.05], lean(az, 0.55), 0.17, 0.016, i % 2 ? ICE : FROST);
  }
  // icy collar shards hanging beneath the socket
  for (let i = 0; i < 8; i++) {
    const az = (i / 8) * Math.PI * 2 + 0.2;
    crystal(
      [Math.sin(az) * 0.07, HC - 0.16, Math.cos(az) * 0.07],
      [Math.sin(az) * 0.5, -1, Math.cos(az) * 0.5],
      0.07 + (i % 2) * 0.035,
      0.011,
      i % 3 === 0 ? CYAN : FROST,
      i % 3 === 0 ? 1 : 0,
    );
  }
  // frost gems on the socket faces
  for (const sd of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.036, 0.0085, 5, 8), GOLD, { at: [0, HC, sd * 0.052], dir: [0, 0, sd], axis: "z", name: "gemBezel", ...own });
    glow(
      b.part(new THREE.OctahedronGeometry(0.034), CYAN, { at: [0, HC, sd * 0.058], scale: [0.85, 1.3, 0.55], flat: true, name: "gem", ...own }),
      1.4,
    );
  }

  const bladePaintOuter = (sgn: number) =>
    paint((p, _n, s) => {
      const t = smoothstep(0.06, 0.34, s[0] * sgn) + (noise(p, 0.04, 8) - 0.5) * 0.15;
      return mix(mix(NAVY, NAVY2, 0.4), "#d4f4ff", t);
    });
  const bladePaintMid = (sgn: number) =>
    paint((p, _n, s) => {
      const t = smoothstep(0.04, 0.36, s[0] * sgn) + (noise(p, 0.05, 3) - 0.5) * 0.3;
      return mix("#1e56c8", "#9be4ff", t);
    });

  // main blade: three nested layers
  const ex = { at: [0, HC, 0] as [number, number, number], x: [1, 0, 0] as [number, number, number], y: [0, 1, 0] as [number, number, number] };
  b.extrude(BLADE as OutlinePoint[], { ...ex, thickness: 0.03, bevel: 0.012, smoothing: 1, color: bladePaintOuter(1), name: "bladeOuter", ...own });
  b.extrude(BLADE_MID as OutlinePoint[], { ...ex, thickness: 0.04, bevel: 0.006, smoothing: 1, color: bladePaintMid(1), name: "bladeMid", ...own });
  b.extrude(BLADE_CORE as OutlinePoint[], { ...ex, thickness: 0.05, bevel: 0.006, smoothing: 1, color: DEEP, name: "bladeCore", ...own });
  // fluke
  b.extrude(FLUKE as OutlinePoint[], { ...ex, thickness: [0.034, 0.014], bevel: 0.01, smoothing: 1, color: bladePaintOuter(-1), name: "flukeOuter", ...own });
  b.extrude(FLUKE_MID as OutlinePoint[], { ...ex, thickness: [0.042, 0.02], bevel: 0.005, smoothing: 1, color: bladePaintMid(-1), name: "flukeMid", ...own });

  // drawings laid on both faces
  const bc = bbox(BLADE_MID);
  const fc = bbox(FLUKE_MID);
  const overlay = (box: [number, number, number, number], tex: ReturnType<typeof svg>, z: number, side: number, g: number, name: string) => {
    const p = b.part(new THREE.PlaneGeometry(box[2] - box[0], box[3] - box[1]), "#ffffff", {
      at: [(box[0] + box[2]) / 2, HC + (box[1] + box[3]) / 2, z * side],
      dir: [0, 0, side],
      axis: "z",
      up: [0, 1, 0],
      texture: tex,
      name,
      ...own,
    });
    if (g) glow(p, g);
  };
  for (const sd of [1, -1]) {
    const mir = sd < 0;
    overlay(bc, bladeTexture("ring", mir), 0.0212, sd, 0, "bladeTicks");
    overlay(bc, bladeTexture("core", mir), 0.0268, sd, 1.15, "bladeFrost");
    overlay(fc, flukeTexture("ring", mir), 0.0132 + 0.0001, sd, 0, "flukeTicks");
    overlay(fc, flukeTexture("core", mir), 0.0215 * 0.7 + 0.0105, sd, 1.1, "flukeFrost");
  }

  // cutting-edge ice teeth and hanging icicles
  const edge = BLADE.slice(5, 11);
  for (let i = 0; i < edge.length - 1; i++) {
    const [x1, y1] = edge[i];
    const [x2, y2] = edge[i + 1];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const ox = y2 - y1;
    const oy = -(x2 - x1);
    const l = Math.hypot(ox, oy);
    for (const sd of [-1, 1]) {
      void sd;
    }
    b.spike([mx, HC + my, 0], [ox / l, oy / l, 0], 0.05 + (i % 2) * 0.02, 0.012, { sides: 5, color: FROST, ...own });
  }
  for (const [x, y, len] of [
    [0.3 * K, -0.5 * K, 0.09],
    [0.42 * K, -0.4 * K, 0.06],
    [0.5 * K, -0.3 * K, 0.1],
    [0.2 * K, -0.62 * K, 0.05],
  ] as const)
    b.spike([x, HC + y, 0], [0, -1, 0], len, 0.011, { sides: 5, color: i2(len), ...own });
  function i2(l: number) {
    return l > 0.07 ? ICE : FROST;
  }
  // horn tip jewels
  for (const [x, y] of [
    [0.22 * K, 0.74 * K],
    [0.22 * K, -0.68 * K],
  ] as const)
    glow(b.part(new THREE.OctahedronGeometry(0.014), CYAN, { at: [x, HC + y + (y > 0 ? 0.012 : -0.012), 0], scale: [1, 1.5, 1], flat: true, name: "tipGem", ...own }), 1.2);
  // fluke crystals
  crystal([-0.3 * K * 0.92, HC + 0.16 * K * 0.92, 0.0], [-0.25, 1, 0], 0.16, 0.014, CYAN, 1.1);
  crystal([-0.46 * K * 0.92, HC + 0.26 * K * 0.92, 0.0], [-0.55, 1, 0], 0.11, 0.011, ICE, 0);
  crystal([-0.18 * K * 0.92, HC + 0.12 * K * 0.92, 0.0], [-0.1, 1, 0], 0.12, 0.012, FROST, 0);

  // -------------------------------------------------------------------------------------------------------------
  // Hanging charm
  const cb = [0.04, 0.64, 0.02] as const;
  const charm = b.joint("charm", { parent: axe, at: [...cb], dir: [0.1, -1, 0.1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.036, 0.0045, 5, 10), CRIMSON_D, { at: [0, 0.64, 0], rotation: [90, 0, 0], name: "charmLoop", ...own });
  const cordEnd: [number, number, number] = [0.055, 0.5, 0.025];
  b.rod([...cb], cordEnd, 0.004, { color: CRIMSON_D, bone: charm, name: "charmCord" });
  for (let i = 1; i < 4; i++) {
    const t = i / 4.2;
    b.part(new THREE.SphereGeometry(0.009, 5, 4), i % 2 ? GOLD : ICE, {
      at: [cb[0] + (cordEnd[0] - cb[0]) * t, cb[1] + (cordEnd[1] - cb[1]) * t, cb[2] + (cordEnd[2] - cb[2]) * t],
      bone: charm,
      name: "charmBead",
    });
  }
  b.part(new THREE.TorusGeometry(0.012, 0.0035, 4, 8), GOLD, { at: [0.056, 0.497, 0.025], bone: charm, name: "charmCap" });
  glow(
    b.part(new THREE.PlaneGeometry(0.05, 0.08), "#ffffff", { at: [0.056, 0.46, 0.028], dir: [0, 0, 1], axis: "z", texture: PENDANT, bone: charm, name: "pendantFront" }),
    1.1,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.05, 0.08), "#ffffff", { at: [0.056, 0.46, 0.022], dir: [0, 0, -1], axis: "z", texture: PENDANT, bone: charm, name: "pendantBack" }),
    1.1,
  );
  b.cards([{ at: [0.052, 0.4, 0.025], axis: [0, 1, 0] } as never], TASSEL, {} as never);

  return b.root;
}
