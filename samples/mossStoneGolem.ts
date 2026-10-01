import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { JointRef } from "../src/context";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { rng } from "../src/math";
import type { Part } from "../src/parts";
import type { Hit } from "../src/surface";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Moss Stone Golem",
  description:
    "An ancient 2.6 m stone golem of stacked, weathered boulders: carved amber runes, glowing eye slits, a heavy separate jaw, huge fists, moss and ferns on its shoulders and a young sapling growing from its back. Flat low-poly, SVG-drawn cracks, lichen and foliage.",
};

type V = [number, number, number];

// ---------------------------------------------------------------- palette
const STONES = ["#9a9a8c", "#8b9488", "#a59e8b", "#7f857a", "#968c78", "#8a9088"];
const DEEP = "#5c5f56";
const MOSS = ["#4d7a2c", "#5e8c35", "#3f6a28"];
const BARK = "#6a4a30";
const BARK_DARK = "#463121";
const AMBER = "#ffb02e";
const LEAF = ["#5f9e36", "#79b844"];

// ---------------------------------------------------------------- drawings
const pt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

function blob(cx: number, cy: number, r: number, n: number, j: number, rand: () => number, sx = 1) {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - j + rand() * 2 * j);
    pts.push(pt(cx + Math.cos(a) * rr * sx, cy + Math.sin(a) * rr));
  }
  return pts.join(" ");
}

/** Greys only: the part's colour tints it. Weathering patches, cracks, pits and pale lichen flecks. */
function stoneSvg(seed: number) {
  const r = rng(seed);
  let s = `<rect width="128" height="128" fill="#e4e4e4"/>`;
  const fills = ["#d2d2d2", "#ececec", "#c6c6c6", "#f4f4f4"];
  for (let i = 0; i < 9; i++)
    s += `<polygon points="${blob(r() * 128, r() * 128, 10 + r() * 16, 7, 0.4, r, 1 + r() * 0.6)}" fill="${fills[i % 4]}"/>`;
  // dark rain-streaks running down
  for (let i = 0; i < 3; i++) {
    const x = 10 + r() * 108;
    const y = 10 + r() * 50;
    s += `<polygon points="${pt(x, y)} ${pt(x + 5, y)} ${pt(x + 3, y + 30 + r() * 30)} ${pt(x + 1, y + 34 + r() * 20)}" fill="#bcbcbc"/>`;
  }
  for (let i = 0; i < 3; i++) {
    let x = r() * 128;
    let y = r() * 128;
    let d = `M${pt(x, y)}`;
    for (let k = 0; k < 5; k++) {
      x += (r() - 0.5) * 30;
      y += 8 + r() * 14;
      d += ` L${pt(x, y)}`;
    }
    s += `<path d="${d}" stroke="#6c6c6c" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  for (let i = 0; i < 7; i++)
    s += `<polygon points="${blob(r() * 128, r() * 128, 1.6 + r() * 2.2, 5, 0.3, r)}" fill="#9b9b9b"/>`;
  for (let i = 0; i < 5; i++)
    s += `<polygon points="${blob(r() * 128, r() * 128, 2 + r() * 3, 6, 0.35, r)}" fill="#fafafa"/>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${s}</svg>`, { size: 256 });
}

const GLYPHS = [
  "M10,2 L10,18 M10,6 L16,10 M10,11 L15,14",
  "M4,2 L4,18 M4,10 L16,2 M4,10 L16,18",
  "M4,3 L16,3 L4,17 L16,17",
  "M10,2 L4,10 L10,18 L16,10 Z M10,6 L10,14",
  "M4,2 L10,10 L16,2 M10,10 L10,18",
  "M5,2 L5,18 L15,18 M5,8 L13,8",
  "M10,4 L10,16 M4,10 L16,10 M6,6 L14,14",
  "M4,18 L10,2 L16,18 M6,12 L14,12",
];

/** A row of carved runes: a dark groove with an amber glow inside. */
function runeStrip(ids: number[]) {
  const w = ids.length * 24;
  let s = "";
  ids.forEach((id, i) => {
    const g = `<path transform="translate(${i * 24 + 2} 2)" d="${GLYPHS[id]}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    s += `${g} stroke="#2b251c" stroke-width="5.4"/>${g} stroke="${AMBER}" stroke-width="2.4"/>`;
  });
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 24">${s}</svg>`, { size: w * 4 });
}

/** The big chest sigil: rings, a hex, spokes and six small glyphs. */
function sigilSvg() {
  const hex = [0, 1, 2, 3, 4, 5].map((i) =>
    pt(50 + Math.cos((i * Math.PI) / 3 + 0.5) * 26, 50 + Math.sin((i * Math.PI) / 3 + 0.5) * 26),
  );
  const parts: string[] = [
    `<circle cx="50" cy="50" r="44" fill="none"`,
    `<circle cx="50" cy="50" r="10" fill="none"`,
    `<polygon points="${hex.join(" ")}" fill="none" stroke-linejoin="round"`,
    `<path d="M50,6 L50,24 M50,76 L50,94 M6,50 L24,50 M76,50 L94,50" fill="none" stroke-linecap="round"`,
  ];
  let s = "";
  for (const p of parts) s += `${p} stroke="#2b251c" stroke-width="7"/>${p} stroke="${AMBER}" stroke-width="3.4"/>`;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + 0.5 + Math.PI / 6;
    const x = 50 + Math.cos(a) * 35 - 6;
    const y = 50 + Math.sin(a) * 35 - 6;
    const g = `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(0.6)" d="${GLYPHS[i]}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    s += `${g} stroke="#2b251c" stroke-width="6"/>${g} stroke="${AMBER}" stroke-width="3"/>`;
  }
  s += `<polygon points="${blob(50, 50, 4, 5, 0.1, () => 0.5)}" fill="#ffe08a"/>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${s}</svg>`, { size: 512 });
}

/** A glowing eye slit in a dark carved socket. */
function eyeSvg() {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 24">
<polygon points="2,14 12,4 46,2 58,8 52,21 14,22" fill="#14120d"/>
<polygon points="6,14 16,8 44,6 55,9 46,17 16,18" fill="#ff8f1c"/>
<polygon points="14,13 22,10 42,9 49,11 40,15 22,15" fill="#ffd36b"/>
</svg>`,
    { size: 240 },
  );
}

function mossPatchSvg(seed: number) {
  const r = rng(seed);
  let s = `<polygon points="${blob(50, 50, 46, 16, 0.3, r, 1)}" fill="#4f7d2d"/>`;
  for (let i = 0; i < 6; i++)
    s += `<polygon points="${blob(18 + r() * 64, 18 + r() * 64, 7 + r() * 10, 6, 0.35, r)}" fill="#3e6a25"/>`;
  for (let i = 0; i < 9; i++)
    s += `<polygon points="${blob(12 + r() * 76, 12 + r() * 76, 2.5 + r() * 4, 5, 0.3, r)}" fill="#86b548"/>`;
  for (let i = 0; i < 5; i++)
    s += `<polygon points="${blob(15 + r() * 70, 15 + r() * 70, 1.5 + r() * 2, 5, 0.3, r)}" fill="#b6d96a"/>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${s}</svg>`, { size: 192 });
}

function lichenSvg(seed: number) {
  const r = rng(seed);
  let s = "";
  const tones = [
    ["#d8c35a", "#b89c34"],
    ["#e3d98a", "#c2b050"],
    ["#d0733a", "#a4521f"],
  ];
  for (let i = 0; i < 7; i++) {
    const [a, c] = tones[i % 3];
    const x = 14 + r() * 72;
    const y = 14 + r() * 72;
    const rad = 5 + r() * 9;
    s += `<polygon points="${blob(x, y, rad, 9, 0.25, r)}" fill="${c}"/><polygon points="${blob(x, y, rad * 0.72, 8, 0.25, r)}" fill="${a}"/>`;
  }
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${s}</svg>`, { size: 160 });
}

function crackSvg(seed: number) {
  const r = rng(seed);
  let s = "";
  const branch = (x: number, y: number, dx: number, dy: number, depth: number, w: number) => {
    let d = `M${pt(x, y)}`;
    for (let k = 0; k < 4; k++) {
      x += dx * (8 + r() * 8) + (r() - 0.5) * 8;
      y += dy * (8 + r() * 8) + (r() - 0.5) * 8;
      d += ` L${pt(x, y)}`;
      if (depth > 0 && k === 1) branch(x, y, dy * (r() > 0.5 ? 1 : -1), dx * (r() > 0.5 ? 1 : -1), depth - 1, w * 0.7);
    }
    s += `<path d="${d}" stroke="#2e2c27" stroke-width="${w.toFixed(1)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  branch(50, 6, 0.15, 1, 2, 3.6);
  branch(20, 30, 1, 0.4, 1, 3);
  for (let i = 0; i < 4; i++)
    s += `<polygon points="${blob(10 + r() * 80, 10 + r() * 80, 2 + r() * 3, 5, 0.3, r)}" fill="#7d7a70"/>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${s}</svg>`, { size: 192 });
}

function leafShape(cx: number, cy: number, angle: number, len: number, wid: number, fill: string) {
  return `<polygon transform="rotate(${angle.toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" points="${pt(cx, cy - len / 2)} ${pt(cx + wid / 2, cy - len * 0.08)} ${pt(cx, cy + len / 2)} ${pt(cx - wid / 2, cy - len * 0.08)}" fill="${fill}"/>`;
}

function fernSvg() {
  let s = `<path d="M20,79 Q22,40 18,6" stroke="#2e5522" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 10; i++) {
    const y = 74 - i * 6.8;
    const x = 20 + (i / 10) * -2;
    const len = 17 * (1 - i * 0.075) + 2;
    const col = i % 2 ? "#4f8a30" : "#62a13a";
    s += `<polygon points="${pt(x, y)} ${pt(x - len, y - 8)} ${pt(x - len * 0.55, y + 1)}" fill="${col}"/>`;
    s += `<polygon points="${pt(x, y)} ${pt(x + len, y - 8)} ${pt(x + len * 0.55, y + 1)}" fill="${col}"/>`;
  }
  s += `<polygon points="${pt(17, 14)} ${pt(18, 2)} ${pt(21, 14)}" fill="#62a13a"/>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">${s}</svg>`, { size: 192 });
}

function grassSvg() {
  const cols = ["#4f8a30", "#6fae3e", "#8cc34f", "#3f7126"];
  const r = rng(5);
  let s = "";
  for (let i = 0; i < 9; i++) {
    const bx = 5 + i * 4.8;
    const tip = bx + (r() - 0.5) * 22;
    const h = 34 + r() * 28;
    s += `<polygon points="${pt(bx - 3.2, 64)} ${pt(tip, 64 - h)} ${pt(bx + 3.2, 64)}" fill="${cols[i % 4]}"/>`;
  }
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">${s}</svg>`, { size: 160 });
}

function leafBranchSvg() {
  let s = `<path d="M6,60 Q28,44 54,12" stroke="#4d6b2a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  const spots: [number, number, number][] = [
    [14, 52, 0],
    [24, 45, 1],
    [34, 36, 0],
    [42, 28, 1],
    [49, 19, 0],
  ];
  spots.forEach(([x, y, side], i) => {
    const a = side ? 62 : -62;
    s += leafShape(x + (side ? 6 : -6), y + (side ? -4 : 4), a, 22, 11, LEAF[i % 2]);
  });
  s += leafShape(55, 8, 28, 20, 10, LEAF[1]);
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${s}</svg>`, { size: 192 });
}

function vineSvg() {
  let s = `<path d="M12,80 Q8,50 13,4" stroke="#3c6a25" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const r = rng(9);
  for (let i = 0; i < 7; i++) {
    const y = 72 - i * 10;
    const side = i % 2 ? 1 : -1;
    s += leafShape(12 + side * 6, y, side * 70, 12 - i * 0.6, 7, i % 2 ? "#5e9a34" : "#4a8029");
  }
  for (let i = 0; i < 3; i++) s += `<polygon points="${blob(12, 14 + r() * 40, 2.4, 5, 0.2, r)}" fill="#9bcc55"/>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 80">${s}</svg>`, { size: 192 });
}

function flowerSvg() {
  let s = "";
  const heads: [number, number, string][] = [
    [8, 10, "#f4efe0"],
    [20, 16, "#f6d65a"],
    [14, 6, "#f4efe0"],
  ];
  for (const [x, y] of heads)
    s += `<path d="M${x},40 Q${x + 1},22 ${x},${y}" stroke="#3f7126" stroke-width="2.4" fill="none"/>`;
  for (const [x, y, c] of heads) {
    s += `<polygon points="${blob(x, y, 5.2, 6, 0.05, () => 0.5)}" fill="${c}"/>`;
    s += `<polygon points="${blob(x, y, 2, 5, 0.05, () => 0.5)}" fill="${c === "#f4efe0" ? "#e0a930" : "#c97d1e"}"/>`;
  }
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40">${s}</svg>`, { size: 160 });
}

// ---------------------------------------------------------------- geometry
function hash(x: number, y: number, z: number, seed: number) {
  const q = (v: number) => Math.round(v * 500) / 500;
  const s = Math.sin(q(x) * 12.9898 + q(y) * 78.233 + q(z) * 37.719 + seed * 19.17) * 43758.5453;
  return s - Math.floor(s);
}

/** Pushes every vertex in or out by its own position hash, so shared corners stay shared. */
function roughen(g: THREE.BufferGeometry, amount: number, seed: number, floorY?: number) {
  const p = g.getAttribute("position");
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.multiplyScalar(1 + (hash(v.x, v.y, v.z, seed) - 0.5) * 2 * amount);
    if (floorY !== undefined && v.y < floorY) v.y = floorY;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  return g;
}

export default function build() {
  const b = createBuilder({ name: "mossStoneGolem" });
  const random = rng(2024);

  const STONE_TEX = [stoneSvg(3), stoneSvg(8)];

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.1, 0],
      [0, 1.45, 0.03],
      [0, 1.85, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const [spine1, spine2] = spine.joints;
  const neck = b.joint("neck", { parent: spine2, at: [0, 1.92, 0.08], dir: [0, 0.5, 0.85], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.02, 0.14], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.97, 0.1], dir: [0, 0, 1], role: "jaw" });

  const sides = [
    { s: 1, S: "L" },
    { s: -1, S: "R" },
  ];

  const legs = sides.map(({ s, S }) => {
    const pts: V[] = [
      [s * 0.34, 0.95, 0],
      [s * 0.38, 0.56, 0.1],
      [s * 0.4, 0.22, 0],
      [s * 0.4, 0.09, 0.42],
    ];
    const chain = b.chain(`leg${S}`, polyline(pts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
      role: "leg",
      contact: [s * 0.4, 0, 0.3],
    });
    return { s, pts, joints: chain.joints };
  });

  const arms = sides.map(({ s, S }) => {
    const pts: V[] = [
      [s * 0.8, 1.8, 0],
      [s * 1.3, 1.68, 0.08],
      [s * 1.74, 1.52, 0.16],
      [s * 1.98, 1.46, 0.2],
    ];
    const chain = b.chain(`arm${S}`, polyline(pts), {
      parent: spine2,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "arm",
    });
    const fingers: { k: number; pts: V[]; joints: readonly JointRef[] }[] = [];
    for (let k = 0; k < 4; k++) {
      const z = 0.2 + (k - 1.5) * 0.14;
      const fp: V[] = [
        [s * 2.16, 1.56, z],
        [s * 2.32, 1.48, z],
        [s * 2.4, 1.3, z],
      ];
      const c = b.chain(`finger${S}${k + 1}`, polyline(fp), {
        parent: chain.joints[3],
        names: [`finger${S}${k + 1}a`, `finger${S}${k + 1}b`],
        role: "digit",
      });
      fingers.push({ k, pts: fp, joints: c.joints });
    }
    const tp: V[] = [
      [s * 1.96, 1.62, 0.44],
      [s * 2.1, 1.57, 0.62],
      [s * 2.18, 1.5, 0.76],
    ];
    const thumb = b.chain(`thumb${S}`, polyline(tp), {
      parent: chain.joints[3],
      names: [`thumb${S}a`, `thumb${S}b`],
      role: "digit",
    });
    fingers.push({ k: 4, pts: tp, joints: thumb.joints });
    return { s, pts, joints: chain.joints, fingers };
  });

  // ------------------------------------------------------------ helpers
  let counter = 0;

  type RockOpts = {
    dir?: V;
    up?: V;
    rot?: V;
    color?: string;
    seed?: number;
    jit?: number;
    floor?: boolean;
    plain?: boolean;
  };

  /** One faceted boulder on a bone: `r` are the half extents. */
  function rock(bone: JointRef, at: V, r: V, o: RockOpts = {}) {
    const seed = o.seed ?? ++counter;
    const geo = roughen(new THREE.IcosahedronGeometry(1, 1), o.jit ?? 0.2, seed, o.floor ? -0.78 : undefined);
    const orient = o.dir ? { dir: o.dir, up: o.up } : o.rot ? { rotation: o.rot } : {};
    return b.part(geo, o.color ?? STONES[seed % STONES.length], {
      bone,
      at,
      scale: r,
      flat: true,
      ...orient,
      ...(o.plain ? {} : { texture: STONE_TEX[seed % 2] }),
    });
  }

  /** A roughened block (jaw, brow, teeth, belt). */
  function chunk(bone: JointRef, at: V, size: V, o: RockOpts = {}) {
    const seed = o.seed ?? ++counter;
    const geo = roughen(new THREE.BoxGeometry(1, 1, 1, 2, 1, 2), o.jit ?? 0.1, seed);
    return b.part(geo, o.color ?? STONES[seed % STONES.length], {
      bone,
      at,
      scale: size,
      flat: true,
      ...(o.rot ? { rotation: o.rot } : {}),
      ...(o.plain ? {} : { texture: STONE_TEX[seed % 2] }),
    });
  }

  /** `count` boulders stacked along a limb segment, each a little off-axis. */
  function stackAlong(bone: JointRef, a: V, c: V, count: number, r0: number, r1: number, seedBase: number) {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const len = d.length();
    d.normalize();
    const out: Part[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const rad = (r0 + (r1 - r0) * t) * (0.92 + random() * 0.16);
      const p = A.clone()
        .lerp(C, t)
        .add(new THREE.Vector3((random() - 0.5) * 0.09, (random() - 0.5) * 0.09, (random() - 0.5) * 0.09));
      out.push(
        rock(bone, [p.x, p.y, p.z], [rad, Math.max((len / count) * 0.6, rad * 0.95), rad * (0.9 + random() * 0.2)], {
          dir: [d.x, d.y, d.z],
          up: [random() - 0.5, random() - 0.5, random() - 0.5],
          seed: seedBase + i,
        }),
      );
    }
    return out;
  }

  /** A squat mossy lump. */
  const moss = (bone: JointRef, at: V, r: V, seed: number) =>
    rock(bone, at, r, { color: MOSS[seed % 3], plain: true, jit: 0.28, seed, rot: [0, seed * 40, 0] });

  /** A drawing conformed onto the outermost surface in a compass direction (azimuth 0 = +Z, 90 = +X). */
  function mark(
    target: Part | Part[],
    tex: THREE.Texture,
    az: number,
    el: number,
    size: [number, number],
    o: { roll?: number; mirror?: boolean; segments?: number | [number, number]; lift?: number } = {},
  ) {
    const hit = b.surface(target).around().at(az, el);
    if (!hit) throw new Error(`mark(): nothing to draw on at ${az}/${el}`);
    return b.decal(target, tex, {
      at: hit,
      size,
      segments: o.segments ?? 7,
      lift: o.lift ?? 0.004,
      ...(o.roll ? { roll: o.roll } : {}),
      ...(o.mirror ? { mirror: true } : {}),
    });
  }

  // drawings shared by many parts
  const mossPatch = [mossPatchSvg(4), mossPatchSvg(17), mossPatchSvg(29)];
  const lichen = [lichenSvg(2), lichenSvg(13)];
  const cracks = [crackSvg(6), crackSvg(21), crackSvg(33)];
  const fern = fernSvg();
  const grass = grassSvg();
  const flowers = flowerSvg();
  const vine = vineSvg();
  const leafBranch = leafBranchSvg();

  /** A toadstool seated on a surface hit, `h` scales it. */
  function toadstool(on: Hit, h: number) {
    b.stick(new THREE.CylinderGeometry(0.014 * h, 0.02 * h, 0.08 * h, 5), "#e6dcc4", on, { flat: true, embed: 0.25 });
    b.stick(new THREE.ConeGeometry(0.06 * h, 0.05 * h, 6), "#c4532e", on.moved([0, 0.075 * h, 0]), {
      flat: true,
      embed: 0,
    });
    b.stick(new THREE.CylinderGeometry(0.02 * h, 0.02 * h, 0.012 * h, 5), "#f1ead2", on.moved([0, 0.1 * h, 0]), {
      flat: true,
      embed: 0,
    });
  }

  /** Cards standing on the upward faces of the host parts. */
  function growOn(
    hosts: Part[],
    tex: THREE.Texture | THREE.Texture[],
    count: number,
    seed: number,
    size: [number, number],
    o: { lean?: number; bend?: number; minDist?: number; flow?: (f: Frame) => V } = {},
  ) {
    const hits = b.surface(hosts).scatter(count, {
      rng: rng(seed),
      minDist: o.minDist ?? 0.07,
      filter: (h) => h.n.y > 0.35,
    });
    return b.cards(hits, tex, {
      size,
      lean: o.lean ?? 20,
      bend: o.bend ?? 20,
      vary: 0.3,
      spin: 25,
      cross: true,
      rng: rng(seed + 1),
      ...(o.flow ? { flow: o.flow } : {}),
    });
  }

  // ------------------------------------------------------------ torso
  const pelvis = rock(hips, [0, 0.98, 0], [0.6, 0.32, 0.42], { seed: 11 });
  const belly = rock(spine1, [0, 1.3, 0.05], [0.56, 0.3, 0.44], { seed: 12 });
  const chest = rock(spine2, [0, 1.65, 0.06], [0.8, 0.4, 0.54], { seed: 13 });
  rock(spine2, [0, 1.9, -0.02], [0.64, 0.26, 0.44], { seed: 14, color: STONES[3] });
  const hump = rock(spine2, [0, 1.82, -0.24], [0.55, 0.34, 0.38], { seed: 15, color: STONES[2] });
  // a belt of knobbly blocks across the hips
  for (const x of [-0.42, -0.14, 0.14, 0.42])
    chunk(hips, [x, 1.16, 0.34 - Math.abs(x) * 0.25], [0.22, 0.17, 0.16], {
      seed: 40 + Math.round(x * 10),
      color: DEEP,
      rot: [0, -x * 40, 0],
    });

  // ------------------------------------------------------------ head and jaw
  const skull = rock(head, [0, 2.2, 0.22], [0.35, 0.24, 0.32], { seed: 21, jit: 0.12, color: STONES[0] });
  for (const { s } of sides) rock(head, [s * 0.25, 2.13, 0.34], [0.12, 0.1, 0.1], { seed: 22 + s, jit: 0.18 });
  chunk(head, [0, 2.31, 0.44], [0.58, 0.1, 0.2], { seed: 25, color: DEEP, rot: [-22, 0, 0] });
  chunk(head, [0, 2.15, 0.52], [0.11, 0.16, 0.11], { seed: 26, color: STONES[4] });
  chunk(head, [0, 2.0, 0.38], [0.5, 0.07, 0.3], { seed: 27, color: "#26241f", plain: true });
  chunk(jaw, [0, 1.88, 0.42], [0.6, 0.18, 0.46], { seed: 28, jit: 0.08, color: STONES[4] });
  for (const x of [-0.19, -0.065, 0.065, 0.19])
    chunk(jaw, [x, 2.01, 0.62 - Math.abs(x) * 0.3], [0.06, 0.1, 0.06], {
      seed: 60 + Math.round(x * 100),
      color: "#d8d2bc",
      plain: true,
    });

  // eyes: a carved socket with a glowing slit, projected onto the skull
  const eyeTex = eyeSvg();
  for (const { s } of sides) {
    const hit = b.surface(skull).ray([s * 0.14, 2.19, 1.0], [0, 0, -1]);
    if (!hit) throw new Error("eye ray missed the skull");
    glow(
      b.decal(skull, eyeTex, {
        at: hit,
        dir: [0, 0, 1],
        size: [0.2, 0.08],
        mirror: s < 0,
        roll: -s * 12,
        lift: 0.004,
        segments: [7, 3],
      }),
      1.4,
    );
  }
  const foreHit = b.surface(skull).ray([0, 2.37, 1.0], [0, 0, -1]);
  if (foreHit)
    glow(
      b.decal(skull, runeStrip([3]), { at: foreHit, dir: [0, 0, 1], size: [0.11, 0.11], lift: 0.004, segments: 5 }),
      0.8,
    );

  // ------------------------------------------------------------ legs
  for (const { s, pts, joints } of legs) {
    const [hipJ, kneeJ, ankleJ, toeJ] = joints;
    const thigh = stackAlong(hipJ, pts[0], pts[1], 2, 0.3, 0.27, 100 + (s > 0 ? 0 : 10));
    const knee = rock(kneeJ, [s * 0.39, 0.56, 0.18], [0.22, 0.2, 0.19], { seed: 120 + s, color: STONES[4] });
    const shin = stackAlong(kneeJ, pts[1], pts[2], 2, 0.26, 0.24, 130 + (s > 0 ? 0 : 10));
    const foot = rock(ankleJ, [s * 0.4, 0.108, 0.12], [0.3, 0.14, 0.38], { seed: 140 + s, floor: true, jit: 0.12 });
    for (const dx of [-0.19, 0, 0.19])
      rock(toeJ, [s * 0.4 + dx, 0.078, 0.42], [0.1, 0.09, 0.12], {
        seed: 150 + Math.round(dx * 100) + s,
        floor: true,
        jit: 0.15,
      });
    const kneeMoss = moss(kneeJ, [s * 0.39, 0.72, 0.22], [0.15, 0.05, 0.12], 160 + s);
    const footMoss = moss(ankleJ, [s * 0.44, 0.24, 0.17], [0.16, 0.05, 0.17], 165 + s);
    growOn([kneeMoss, footMoss], grass, 7, 300 + s, [0.06, 0.1], { minDist: 0.05 });
    mark(thigh, mossPatch[s > 0 ? 0 : 1], s * 50, 35, [0.32, 0.32]);
    glow(mark(thigh, runeStrip([s > 0 ? 1 : 7]), 0, 0, [0.17, 0.17], { segments: 6, lift: 0.006 }), 0.8);
    mark(shin, cracks[s > 0 ? 0 : 1], 0, 10, [0.26, 0.26], { roll: s * 20 });
    mark([knee], lichen[s > 0 ? 0 : 1], s * 20, 10, [0.28, 0.28]);
    mark([foot], lichen[s > 0 ? 1 : 0], s * 70, 25, [0.26, 0.26]);
  }

  // ------------------------------------------------------------ arms
  for (const { s, pts, joints, fingers } of arms) {
    const [shJ, elJ, wrJ, handJ] = joints;
    const shoulder = rock(shJ, [s * 0.95, 1.85, 0], [0.4, 0.34, 0.4], { seed: 200 + s, color: STONES[1] });
    const upper = stackAlong(shJ, pts[0], pts[1], 2, 0.34, 0.3, 210 + (s > 0 ? 0 : 10));
    rock(elJ, [s * 1.3, 1.68, 0.08], [0.29, 0.29, 0.29], { seed: 230 + s, color: STONES[4] });
    const fore = stackAlong(elJ, pts[1], pts[2], 2, 0.34, 0.35, 240 + (s > 0 ? 0 : 10));
    // the fist: a palm block, four finger stones and a thumb
    const palm = rock(handJ, [s * 1.92, 1.49, 0.2], [0.26, 0.34, 0.4], { seed: 260 + s, color: STONES[2] });
    for (const f of fingers) {
      const big = f.k === 4;
      stackAlong(
        f.joints[0],
        f.pts[0],
        f.pts[1],
        1,
        big ? 0.125 : 0.11,
        big ? 0.115 : 0.1,
        270 + f.k * 2 + (s > 0 ? 0 : 20),
      );
      stackAlong(
        f.joints[1],
        f.pts[1],
        f.pts[2],
        1,
        big ? 0.115 : 0.1,
        big ? 0.1 : 0.09,
        271 + f.k * 2 + (s > 0 ? 0 : 20),
      );
    }

    // vegetation on the upward faces
    const shoulderMoss = [
      moss(shJ, [s * 0.95, 2.17, 0], [0.32, 0.1, 0.3], 400 + s),
      moss(shJ, [s * 0.76, 2.13, -0.14], [0.2, 0.08, 0.18], 402 + s),
      moss(shJ, [s * 1.12, 2.06, 0.12], [0.18, 0.08, 0.16], 404 + s),
    ];
    const armMoss = [
      moss(shJ, [s * 1.12, 1.99, -0.04], [0.22, 0.07, 0.17], 406 + s),
      moss(elJ, [s * 1.56, 1.89, 0.12], [0.2, 0.06, 0.15], 408 + s),
      moss(wrJ, [s * 1.94, 1.82, 0.2], [0.2, 0.06, 0.18], 410 + s),
    ];
    growOn(shoulderMoss, fern, 6, 500 + s, [0.16, 0.3], { lean: 35, bend: 25, minDist: 0.11 });
    growOn(shoulderMoss, grass, 12, 510 + s, [0.07, 0.12], { minDist: 0.06 });
    growOn(shoulderMoss, flowers, 4, 520 + s, [0.05, 0.07], { lean: 5, bend: 0, minDist: 0.12 });
    growOn(armMoss, grass, 12, 530 + s, [0.06, 0.1], { minDist: 0.05 });
    growOn(armMoss, fern, 2, 540 + s, [0.11, 0.2], { lean: 40, minDist: 0.15 });

    for (const [mx, mz, h] of [
      [0.86, -0.1, 1],
      [1.04, 0.08, 0.7],
    ]) {
      const cap = b.surface(shoulderMoss).ray([s * mx, 3, mz], [0, -1, 0]);
      if (cap) toadstool(cap, h);
    }

    // hanging moss strands under the forearm and shoulder
    const under = b
      .surface([...upper, ...fore])
      .scatter(16, { rng: rng(550 + s), minDist: 0.1, filter: (h) => h.n.y < -0.45 });
    b.cards(
      under.map((h) => frame(h.at, [0, 1, 0])),
      vine,
      {
        size: [0.08, 0.22],
        lean: 180,
        flow: [0, 0, 1],
        vary: 0.35,
        spin: 20,
        rng: rng(560 + s),
        cross: true,
        bone: elJ,
      },
    );

    // carved runes, cracks, lichen and moss patches
    glow(mark(fore, runeStrip([2, 5, 0]), 0, 22, [0.52, 0.13], { segments: [10, 3], lift: 0.006 }), 0.8);
    mark(fore, cracks[s > 0 ? 2 : 0], -s * 90 + 180, 0, [0.3, 0.3], { roll: 40 });
    mark(upper, lichen[s > 0 ? 0 : 1], 0, 30, [0.3, 0.3]);
    mark(upper, mossPatch[s > 0 ? 2 : 0], 180, 10, [0.34, 0.34]);
    glow(mark([shoulder], runeStrip([6]), s * 60, 15, [0.17, 0.17], { segments: 6, lift: 0.006 }), 0.8);
    mark([shoulder], cracks[s > 0 ? 1 : 2], s * 100, 10, [0.3, 0.3]);
    mark([palm], lichen[s > 0 ? 1 : 0], 0, 25, [0.3, 0.3]);
    mark([palm], cracks[s > 0 ? 0 : 1], 0, -10, [0.3, 0.3], { roll: 100 });
  }

  // ------------------------------------------------------------ chest, belly, back
  glow(mark([chest], sigilSvg(), 0, 0, [0.54, 0.54], { segments: 10, lift: 0.006 }), 0.85);
  mark([chest], cracks[0], 35, -25, [0.34, 0.34]);
  mark([chest], lichen[0], -40, 25, [0.34, 0.34]);
  mark([chest], mossPatch[1], 60, 55, [0.4, 0.4]);
  mark([belly], cracks[2], -20, 5, [0.3, 0.3], { roll: 30 });
  mark([belly], lichen[1], 40, 0, [0.3, 0.3]);
  mark([pelvis], mossPatch[2], -50, 10, [0.34, 0.34]);
  mark([hump], mossPatch[0], 180, 25, [0.5, 0.5]);
  mark([hump], cracks[1], 130, 5, [0.36, 0.36]);
  mark([hump], lichen[0], -110, 15, [0.3, 0.3]);
  mark([skull], cracks[1], 55, 40, [0.2, 0.2], { roll: 160 });
  mark([skull], lichen[1], -80, 30, [0.22, 0.22]);

  // moss crown and hair of grass on the head
  const crown = [
    moss(head, [0.04, 2.41, 0.16], [0.22, 0.07, 0.2], 420),
    moss(head, [-0.14, 2.36, 0.3], [0.11, 0.05, 0.1], 422),
  ];
  growOn(crown, grass, 8, 600, [0.06, 0.11], { minDist: 0.05 });
  growOn(crown, fern, 1, 604, [0.1, 0.19], { lean: 40 });

  // a little moss beard hanging from the jaw
  b.cards(
    [-0.18, -0.06, 0.06, 0.18].map((x) => frame([x, 1.78, 0.68 - Math.abs(x) * 0.3], [0, 1, 0])),
    vine,
    { size: [0.07, 0.17], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(610), cross: true, bone: jaw },
  );

  // ------------------------------------------------------------ sapling on the back
  const mound = [
    rock(spine2, [0, 2.0, -0.5], [0.32, 0.1, 0.24], {
      color: MOSS[0],
      plain: true,
      jit: 0.28,
      seed: 430,
      rot: [-50, 0, 0],
    }),
    rock(spine2, [0.24, 1.92, -0.52], [0.17, 0.07, 0.14], {
      color: MOSS[1],
      plain: true,
      jit: 0.28,
      seed: 432,
      rot: [-55, 0, 0],
    }),
    rock(spine2, [-0.26, 1.9, -0.52], [0.18, 0.07, 0.14], {
      color: MOSS[2],
      plain: true,
      jit: 0.28,
      seed: 434,
      rot: [-55, 0, 0],
    }),
    rock(spine2, [0, 2.14, -0.36], [0.22, 0.07, 0.16], {
      color: MOSS[1],
      plain: true,
      jit: 0.28,
      seed: 436,
      rot: [-20, 0, 0],
    }),
  ];
  growOn(mound, grass, 14, 620, [0.07, 0.12], { minDist: 0.05 });
  growOn(mound, fern, 4, 630, [0.13, 0.24], { lean: 35, minDist: 0.14 });
  growOn(mound, flowers, 3, 640, [0.05, 0.07], { lean: 5, bend: 0, minDist: 0.12 });
  toadstool(b.surface(mound).ray([0.14, 3, -0.42], [0, -1, 0]) ?? b.surface(mound).nearest([0.14, 2.1, -0.42]), 0.9);

  const trunkPts: V[] = [
    [0, 2.0, -0.5],
    [0.02, 2.14, -0.53],
    [-0.03, 2.3, -0.55],
    [0, 2.43, -0.52],
  ];
  b.sweep(catmull(trunkPts), [0.065, 0.015], {
    bone: spine2,
    color: BARK,
    sides: 5,
    smooth: false,
    caps: { start: "flat", end: "point" },
  });
  const twigs: [V, V][] = [
    [
      [0.02, 2.17, -0.53],
      [0.24, 2.31, -0.6],
    ],
    [
      [-0.03, 2.27, -0.55],
      [-0.25, 2.39, -0.62],
    ],
    [
      [0, 2.38, -0.54],
      [0.09, 2.46, -0.44],
    ],
  ];
  const tips: Frame[] = [frame(trunkPts[3], [0, 1, -0.1])];
  for (const [from, to] of twigs) {
    b.sweep(polyline([from, to]), [0.025, 0.007], {
      bone: spine2,
      color: BARK_DARK,
      sides: 5,
      smooth: false,
      caps: { end: "point" },
    });
    tips.push(frame(to, [to[0] - from[0], to[1] - from[1], to[2] - from[2]]));
    rock(spine2, [to[0], to[1] + 0.02, to[2]], [0.12, 0.08, 0.12], {
      color: LEAF[tips.length % 2],
      plain: true,
      jit: 0.25,
      seed: 700 + tips.length,
    });
  }
  rock(spine2, [0, 2.45, -0.52], [0.12, 0.08, 0.12], { color: LEAF[0], plain: true, jit: 0.25, seed: 699 });
  b.cards(tips, leafBranch, {
    size: 0.26,
    lean: 45,
    bend: 25,
    cross: true,
    vary: 0.2,
    spin: 30,
    rng: rng(710),
    flow: (f) => [f.axis.x, 0.2, f.axis.z],
    bone: spine2,
  });

  // surface roots gripping the stone
  const humpSkin = b.surface([hump]);
  const rootPaths: V[][] = [
    [
      [0.05, 2.0, -0.5],
      [0.26, 1.96, -0.56],
      [0.46, 1.86, -0.5],
      [0.58, 1.72, -0.4],
    ],
    [
      [-0.05, 2.0, -0.5],
      [-0.26, 1.95, -0.56],
      [-0.46, 1.84, -0.5],
      [-0.58, 1.7, -0.4],
    ],
    [
      [0, 2.0, -0.52],
      [0.02, 1.85, -0.62],
      [0.0, 1.66, -0.64],
    ],
  ];
  for (const rp of rootPaths)
    b.sweep(humpSkin.drape(catmull(rp), { lift: 0.012 }), [0.04, 0.01], {
      bone: spine2,
      color: BARK,
      sides: 5,
      smooth: false,
      caps: { start: "none", end: "point" },
    });

  return b.root;
}
