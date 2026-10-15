// Floating sky island diorama, Genshin Impact style: cel-shaded grass and rock, a ruined Anemo shrine with a glowing
// sigil dais, a waterfall pouring off the rim into clouds, a big tree, a sakura, pines, islets and a rope bridge.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng } from "../../../../src/math";
import { catmull, spiral } from "../../../../src/path";
import type { PartOptions } from "../../../../src/parts";
import { grain, mottle, noise, paint, patches, spots } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Skyward Ruin Isle",
  description:
    "A floating sky island with an overgrown Anemo ruin and glowing sigil dais, a waterfall spilling into the clouds, a big tree, a sakura, pines, a rope bridge to a small islet and crystals.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette (cel paints: lit tone plus a hue-shifted hard shadow)
const GRASS = cel(mottle("#a6ef5e", "#80da58", { size: 0.32, seed: 3, contrast: 1.3 }));
const DIRT = cel("#92654a");
const rockBase = patches("#a99383", ["#d4be9c", "#c0a98c", "#cfb393", "#b79f89"], { size: 0.26, gap: 0.06, seed: 4 });
const rockStrata = paint((p) => {
  const band = Math.sin(p.y * 27 + noise(p, 0.5, 5) * 7);
  if (band > 0.88) return "#8c7a7c";
  return rockBase;
});
const ROCK = cel(rockStrata);

const STONE_A = "#f2ead6";
const STONE_B = "#ddd3bd";
const STONE_C = "#e6dcc6";
const STONE_D = "#d0c7b4";
const STONE_J = "#b3aa99";
const MOSS = cel("#79d65a");
const stoneTone = patches(STONE_B, [STONE_A, STONE_C, STONE_D], { size: 0.11, gap: 0.04, seed: 9 });
const stoneRaw = paint((p, n) => {
  const row = Math.floor(p.y / 0.11);
  const j1 = (((p.y / 0.11) % 1) + 1) % 1;
  const j2 = ((((p.x + p.z) / 0.22 + row * 0.5) % 1) + 1) % 1;
  if (Math.abs(n.y) < 0.6 && (j1 < 0.05 || j2 < 0.035)) return STONE_J;
  if (noise(p, 0.18, 21) + 0.27 * n.y > 0.8) return MOSS;
  return stoneTone;
});
const STONE = cel(stoneRaw);

const GOLD = cel("#ffd45c", "#c4812c");
const BARK = cel(grain("#94664a", "#74503f", { size: 0.025, axis: "y" }));
const WOOD = cel(mottle("#a67a52", "#8d6444", { size: 0.05, seed: 8, contrast: 1.2 }));
const LEAF = cel(mottle("#52c04b", "#8be25b", { size: 0.2, seed: 5, contrast: 1.3 }));
const PINE = cel(mottle("#2f9a5c", "#4cb86a", { size: 0.18, seed: 6, contrast: 1.2 }));
const BLOSSOM = cel(mottle("#ff9cc2", "#ffd0e2", { size: 0.18, seed: 7, contrast: 1.3 }));
const CLOUD = cel("#ffffff", "#b9c9f1");
const WATERFLAT = "#5bd0f0";

const waterPaint = paint((p) => {
  const a = noise(p, 0.12, 41);
  const w = noise(p, 0.05, 43);
  if (a > 0.66 && w > 0.45) return "#d9fbff";
  if (a < 0.3) return "#3aaee6";
  return WATERFLAT;
});

// ---------------------------------------------------------------------------------------------------------------
// Merged-geometry bag: many small static pieces, placed in model space, built as one part per colour or paint.
class Bag {
  private geos: THREE.BufferGeometry[] = [];

  add(
    g: THREE.BufferGeometry,
    at: readonly number[],
    o: { dir?: readonly number[]; rot?: readonly number[]; scale?: number | readonly number[] } = {},
  ) {
    const q = o.dir
      ? aim(o.dir)
      : new THREE.Quaternion().setFromEuler(
          new THREE.Euler((o.rot?.[0] ?? 0) * DEG, (o.rot?.[1] ?? 0) * DEG, (o.rot?.[2] ?? 0) * DEG),
        );
    const s = typeof o.scale === "number" ? [o.scale, o.scale, o.scale] : (o.scale ?? [1, 1, 1]);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(at[0], at[1], at[2]),
      q,
      new THREE.Vector3(s[0], s[1], s[2]),
    );
    const c = g.index ? g.toNonIndexed() : g.clone();
    c.applyMatrix4(m);
    this.geos.push(c);
    return this;
  }

  get count() {
    return this.geos.length;
  }

  merged() {
    const m = mergeGeometries(this.geos);
    if (!m) throw new Error("Bag.merged(): geometries are not mergeable");
    return m;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Island height map: the lathe profile of the top, so everything stands on it.
const gy = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  if (r < 0.7) return 1.54 - 0.02 * (r / 0.7);
  if (r < 1.15) return 1.52 - 0.04 * ((r - 0.7) / 0.45);
  return 1.48 - 0.04 * Math.min((r - 1.15) / 0.15, 1);
};

const segDist = (px: number, pz: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
};

export default function build() {
  const b = createBuilder({ name: "floatingIsland", paintSize: 2048 });
  const R = rng(2024);
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const put = (g: THREE.BufferGeometry, color: Fill, o: PartOptions = {}) => b.part(g, color, { bone: base, ...o });
  const bagPart = (bag: Bag, color: Fill, o: PartOptions = {}) =>
    put(bag.merged(), color, { at: [0, 0, 0], flat: true, ...o });
  const rr = (lo: number, hi: number) => lo + (hi - lo) * R();

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const TUFT = svg(
    `<svg viewBox="0 0 64 64">
    <path d="M8 64 Q10 34 3 10 Q19 30 22 64Z" fill="#4fb347"/>
    <path d="M40 64 Q46 40 58 22 Q54 44 52 64Z" fill="#6fd24f"/>
    <path d="M30 64 Q34 36 44 8 Q46 36 42 64Z" fill="#5fc84c"/>
    <path d="M18 64 Q20 28 20 2 Q32 28 32 64Z" fill="#7bdc4f"/>
    <path d="M22 64 Q26 44 30 20 Q36 46 36 64Z" fill="#a8f26c"/>
  </svg>`,
    { size: 128 },
  );
  const leafSvg = (c1: string, c2: string, c3: string) => {
    let s = '<svg viewBox="0 0 64 64">';
    const angles = [-75, -38, 0, 38, 75, -110, 110];
    angles.forEach((a, i) => {
      const len = i < 5 ? 34 : 24;
      const col = i % 2 ? c1 : c2;
      s += `<g transform="translate(32 46) rotate(${a})"><path d="M0 0 Q9 -${len * 0.45} 0 -${len} Q-9 -${len * 0.45} 0 0Z" fill="${col}"/><path d="M0 -3 L0 -${len - 6}" stroke="${c3}" stroke-width="1.8"/></g>`;
    });
    return `${s}</svg>`;
  };
  const LEAF_TEX = svg(leafSvg("#4fbf4a", "#6fd653", "#2f8f45"), { size: 128 });
  const BLOSSOM_TEX = svg(leafSvg("#ff9ec4", "#ffc2da", "#e8709f"), { size: 128 });
  const PINE_TEX = svg(leafSvg("#2f9a5c", "#45b569", "#1f7a48"), { size: 128 });
  const flowerSvg = (petal: string, edge: string, core: string, n: number) => {
    let s = '<svg viewBox="0 0 40 56"><path d="M20 56 Q18 38 20 24" stroke="#4fb35a" stroke-width="3" fill="none"/>';
    s += '<path d="M20 46 Q10 42 6 32 Q16 34 20 42Z" fill="#5fcf6a"/><path d="M20 40 Q30 38 34 30 Q24 30 20 36Z" fill="#6fdc74"/>';
    for (let i = 0; i < n; i++)
      s += `<ellipse cx="20" cy="8" rx="5.6" ry="9" fill="${petal}" stroke="${edge}" stroke-width="1.2" transform="rotate(${(360 / n) * i} 20 18)"/>`;
    return `${s}<circle cx="20" cy="18" r="4.4" fill="${core}"/></svg>`;
  };
  const CECILIA = svg(flowerSvg("#f6fdff", "#8fd8f0", "#b6fbff", 5), { size: 160 });
  const DAISY = svg(flowerSvg("#ffa6cc", "#e8709f", "#ffd24f", 6), { size: 160 });
  const PETAL = svg(
    `<svg viewBox="0 0 16 16"><path d="M8 16 Q0 8 4 0 Q8 4 12 0 Q16 8 8 16Z" fill="#ffbdd8"/></svg>`,
    { size: 64 },
  );
  const VINELEAF = svg(
    `<svg viewBox="0 0 24 40"><path d="M12 40 C0 30 0 12 12 0 C24 12 24 30 12 40Z" fill="#5cc454"/><path d="M12 38 L12 8" stroke="#2f8f45" stroke-width="2"/></svg>`,
    { size: 96 },
  );
  const runeSvg = () => {
    let s = '<svg viewBox="0 0 256 256">';
    s += '<circle cx="128" cy="128" r="122" fill="none" stroke="#ffd36b" stroke-width="5"/>';
    s += '<circle cx="128" cy="128" r="112" fill="none" stroke="#7ff5e3" stroke-width="3"/>';
    s += '<circle cx="128" cy="128" r="80" fill="none" stroke="#ffd36b" stroke-width="4"/>';
    s += '<circle cx="128" cy="128" r="70" fill="none" stroke="#7ff5e3" stroke-width="3"/>';
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r0 = i % 2 ? 90 : 86;
      s += `<path d="M${128 + Math.cos(a) * r0} ${128 + Math.sin(a) * r0} L${128 + Math.cos(a) * 104} ${128 + Math.sin(a) * 104}" stroke="#ffd36b" stroke-width="4" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      const cx = 128 + Math.cos(a) * 96;
      const cy = 128 + Math.sin(a) * 96;
      s += `<circle cx="${cx}" cy="${cy}" r="5" fill="#7ff5e3"/>`;
    }
    let star = "";
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 24 : 58;
      star += `${i ? "L" : "M"}${128 + Math.cos(a) * r} ${128 + Math.sin(a) * r} `;
    }
    s += `<path d="${star}Z" fill="none" stroke="#ffd36b" stroke-width="3.4" stroke-linejoin="round"/>`;
    for (let k = 0; k < 3; k++)
      s += `<path d="M128 128 Q148 106 140 84 Q128 66 108 76" stroke="#7ff5e3" stroke-width="5" stroke-linecap="round" fill="none" transform="rotate(${k * 120} 128 128)"/>`;
    return `${s}</svg>`;
  };
  const RUNE = svg(runeSvg(), { size: 512 });
  const GLYPH = svg(
    `<svg viewBox="0 0 24 64">
    <circle cx="12" cy="8" r="4.5" fill="none" stroke="#7ff5e3" stroke-width="2.4"/>
    <path d="M12 16 L19 24 L12 32 L5 24Z" fill="none" stroke="#7ff5e3" stroke-width="2.4"/>
    <path d="M4 40 H20 M4 46 H20" stroke="#ffd36b" stroke-width="2.6"/>
    <path d="M12 50 Q4 56 12 62 Q20 56 12 50Z" fill="#7ff5e3"/>
  </svg>`,
    { size: 192 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 60 150">
    <rect x="0" y="0" width="60" height="7" rx="2" fill="#ffd36b"/>
    <path d="M3 7 H57 V132 L30 112 L3 132Z" fill="#33bcc6"/>
    <path d="M8 12 H52 V122 L30 104 L8 122Z" fill="none" stroke="#ffd36b" stroke-width="2.8"/>
    <path d="M30 24 Q46 34 38 50 Q30 60 22 52 Q16 44 24 38" fill="none" stroke="#ffe9a0" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M30 62 Q46 72 38 88 Q30 98 22 90 Q16 82 24 76" fill="none" stroke="#ffe9a0" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="30" cy="18" r="3.4" fill="#ffd36b"/>
    <circle cx="14" cy="112" r="2.6" fill="#ffd36b"/><circle cx="46" cy="112" r="2.6" fill="#ffd36b"/>
  </svg>`,
    { size: 256 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 20 56">
    <circle cx="10" cy="6" r="5" fill="#ffd45c"/>
    <rect x="6" y="10" width="8" height="6" rx="1.5" fill="#c4812c"/>
    <path d="M10 16 L3 54 M10 16 L6.5 54 M10 16 L10 55 M10 16 L13.5 54 M10 16 L17 54" stroke="#ffd45c" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  </svg>`,
    { size: 112 },
  );
  const STREAK = svg(
    `<svg viewBox="0 0 64 128">
    <path d="M8 0 L13 0 L12 64 L11 128 L9 128 L8 64Z" fill="#ffffff"/>
    <path d="M24 0 L28 0 L29 40 L27 100 L26 128 L24 100Z" fill="#e8fcff"/>
    <path d="M38 0 L44 0 L43 50 L42 128 L40 128 L39 50Z" fill="#ffffff"/>
    <path d="M52 0 L56 0 L55 72 L54 128 L52 128 L51 72Z" fill="#e8fcff"/>
  </svg>`,
    { size: 256 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Island body: inverted cone of rock, grass cap with a zig-zag overhang
  const makeIslandPaint = (cx: number, cz: number, yGrass: number, seed: number) =>
    paint((p) => {
      const ang = Math.atan2(p.z - cz, p.x - cx);
      const yG = yGrass + 0.07 * zigzag(ang * 52) + (noise(p, 0.3, seed) - 0.5) * 0.08;
      if (p.y > yG) return GRASS;
      if (p.y > yG - 0.03) return DIRT;
      return ROCK;
    });
  const islandPaint = makeIslandPaint(0, 0, 1.375, 11);
  const body = b.lathe(
    [
      [0, 0],
      [0.12, 0.2],
      [0.3, 0.5],
      [0.62, 0.8],
      [0.98, 1.08],
      [1.26, 1.28],
      [1.34, 1.38],
      [1.3, 1.44],
      [1.15, 1.48],
      [0.7, 1.52],
      [0, 1.54],
    ],
    { at: [0, 0, 0], segments: 16, color: islandPaint, bone: base, name: "islandBody" },
  );
  const skin = b.surface(body);

  // rim lobes break the round outline (grass on top, rock below, same paint)
  const lobes = new Bag();
  const ico1 = new THREE.IcosahedronGeometry(1, 1);
  const ico0 = new THREE.IcosahedronGeometry(1, 0);
  for (const [a, rad, ry, rim] of [
    [200, 0.3, 0.55, 1.26],
    [250, 0.26, 0.6, 1.25],
    [330, 0.28, 0.55, 1.27],
    [100, 0.24, 0.6, 1.25],
    [150, 0.22, 0.6, 1.24],
  ] as const) {
    const x = Math.cos(a * DEG) * rim;
    const z = Math.sin(a * DEG) * rim;
    lobes.add(ico1, [x, 1.3, z], { scale: [rad, rad * ry, rad], rot: [0, a, 0] });
  }
  bagPart(lobes, islandPaint, { name: "rimLobes" });

  // rock chunks on the flanks
  const chunks = new Bag();
  const flank = skin.scatter(30, {
    rng: R,
    minDist: 0.2,
    filter: (h) => h.at.y > 0.25 && h.at.y < 1.3 && !(h.at.y > 0.88 && h.at.y < 1.02) && h.n.y < 0.6,
  });
  for (const h of flank) {
    const s = rr(0.05, 0.12);
    chunks.add(ico0, [h.at.x + h.n.x * 0.03, h.at.y + h.n.y * 0.03, h.at.z + h.n.z * 0.03], {
      scale: [s * 1.2, s * 0.8, s],
      rot: [rr(0, 90), rr(0, 360), rr(0, 90)],
    });
  }
  bagPart(chunks, ROCK, { name: "flankChunks" });

  // stalactites
  const spikes = new Bag();
  const cone5 = new THREE.ConeGeometry(1, 1, 5);
  const under = skin.scatter(30, {
    rng: R,
    minDist: 0.17,
    filter: (h) => h.at.y > 0.4 && h.at.y < 1.1 && h.n.y < 0.15,
  });
  for (const h of under) {
    const len = rr(0.14, 0.34) * (1.2 - h.at.y * 0.4);
    const rad = len * rr(0.17, 0.24);
    const d = new THREE.Vector3(h.n.x * 0.5, -1, h.n.z * 0.5).normalize();
    if (h.at.y - len * 0.9 < 0.05) continue;
    spikes.add(
      cone5,
      [h.at.x + d.x * len * 0.5 - h.n.x * 0.02, h.at.y + d.y * len * 0.5, h.at.z + d.z * len * 0.5 - h.n.z * 0.02],
      { dir: [d.x, d.y, d.z], scale: [rad, len, rad] },
    );
  }
  bagPart(spikes, ROCK, { name: "stalactites" });

  // carved band around the body, gold rope with teal studs
  const band = skin.loop([0, 0.95, 0], { lift: 0.012 });
  b.sweep(band, 0.024, { color: GOLD, sides: 6, bone: base, name: "goldBand" });
  const studsA = new Bag();
  const stud = new THREE.OctahedronGeometry(0.03, 0);
  for (let i = 0; i < 22; i++) {
    const at = band.at((i + 0.5) / 22);
    studsA.add(stud, [at.x * 1.015, at.y + 0.0, at.z * 1.015], { scale: [1, 1.35, 1], rot: [0, i * 16, 0] });
  }
  glow(bagPart(studsA, "#7ff5e3", { name: "bandStuds" }), 1);

  // underside crystals (glow)
  const crystalDeep = new Bag();
  const crystalTip = new Bag();
  const prism = new THREE.CylinderGeometry(1, 1, 1, 6);
  const tipGeo = new THREE.ConeGeometry(1, 1, 6);
  const crystalCluster = (at: THREE.Vector3, n: THREE.Vector3, count: number, size: number) => {
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3(
        n.x + rr(-0.45, 0.45),
        n.y + rr(-0.35, 0.45),
        n.z + rr(-0.45, 0.45),
      ).normalize();
      const len = size * rr(0.6, 1.2);
      const rad = size * rr(0.14, 0.22);
      const p0 = at.clone().addScaledVector(n, -0.02);
      const c1 = p0.clone().addScaledVector(dir, len * 0.325);
      const c2 = p0.clone().addScaledVector(dir, len * 0.825);
      crystalDeep.add(prism, [c1.x, c1.y, c1.z], { dir: [dir.x, dir.y, dir.z], scale: [rad, len * 0.65, rad] });
      crystalTip.add(tipGeo, [c2.x, c2.y, c2.z], { dir: [dir.x, dir.y, dir.z], scale: [rad, len * 0.35, rad] });
    }
  };
  for (const [az, el, cnt, size] of [
    [215, -38, 4, 0.2],
    [305, -42, 5, 0.22],
    [120, -40, 4, 0.18],
    [20, -45, 3, 0.16],
  ] as const) {
    const h = skin.around([0, 0.7, 0]).at(az, el);
    if (h) crystalCluster(h.at, h.n, cnt, size);
  }
  // crystals on the grass at the back
  crystalCluster(new THREE.Vector3(0.9, gy(0.9, -0.85) + 0.01, -0.85), new THREE.Vector3(0, 1, 0), 6, 0.3);
  crystalCluster(new THREE.Vector3(0.78, gy(0.78, -0.95) + 0.01, -0.95), new THREE.Vector3(0.2, 1, -0.2), 3, 0.17);
  glow(bagPart(crystalDeep, "#5ccfdc", { name: "crystalDeep" }), 1);
  glow(bagPart(crystalTip, "#b6fff0", { name: "crystalTip" }), 1);

  // hanging vines with leaf cards
  const vineFrames: ReturnType<typeof frame>[] = [];
  const vineFlow: P3[] = [];
  const dAng = Math.atan2(0.867, 0.498); // waterfall azimuth (z over x)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    let diff = Math.abs(a - dAng);
    diff = Math.min(diff, Math.PI * 2 - diff);
    if (diff < 0.42) continue;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const len = rr(0.28, 0.55);
    const r0 = 1.29;
    const path = catmull([
      [c * r0, 1.41, s * r0],
      [c * (r0 + 0.03), 1.41 - len * 0.35, s * (r0 + 0.03)],
      [c * (r0 + 0.01), 1.41 - len * 0.7, s * (r0 + 0.01)],
      [c * (r0 - 0.01), 1.41 - len, s * (r0 - 0.01)],
    ]);
    b.sweep(path, [0.008, 0.004], { color: "#4d9a3f", sides: 4, bone: base, name: "vine" });
    for (let k = 0; k < 6; k++) {
      const pt = path.at(0.12 + k * 0.17);
      vineFrames.push(frame([pt.x, pt.y, pt.z], [0, 1, 0]));
      vineFlow.push([c, 0, s]);
    }
  }
  b.cards(vineFrames, VINELEAF, {
    size: [0.055, 0.075],
    lean: 150,
    flow: (_f, i) => vineFlow[i],
    vary: 0.3,
    spin: 25,
    rng: R,
    bone: base,
    cross: true,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Clouds
  const clouds = new Bag();
  const cloud = (cx: number, cy: number, cz: number, s: number, lumps: number, flat = 0.75) => {
    for (let i = 0; i < lumps; i++) {
      const a = (i / lumps) * Math.PI * 2 + rr(-0.3, 0.3);
      const d = i === 0 ? 0 : s * rr(0.7, 1.15);
      const rad = s * (i === 0 ? 0.85 : rr(0.5, 0.75));
      clouds.add(ico1, [cx + Math.cos(a) * d, cy + (i === 0 ? 0.1 : rr(-0.02, 0.06)) * s, cz + Math.sin(a) * d], {
        scale: [rad, rad * flat, rad],
        rot: [0, rr(0, 360), 0],
      });
    }
  };
  // pedestal under the tip: lowest points touch y = 0, the rock tip rises in the middle
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const rad = rr(0.11, 0.16);
    clouds.add(ico1, [Math.cos(a) * 0.3, rad * 0.8, Math.sin(a) * 0.3], {
      scale: [rad * 1.3, rad * 0.8, rad * 1.3],
      rot: [0, rr(0, 360), 0],
    });
  }
  clouds.add(ico1, [0.08, 0.1, 0.44], { scale: [0.2, 0.125, 0.2] });
  clouds.add(ico1, [-0.15, 0.09, -0.45], { scale: [0.19, 0.12, 0.19] });
  cloud(0.72, 0.55, 1.28, 0.2, 7);
  cloud(0.95, 0.47, 1.1, 0.14, 5);
  cloud(-1.15, 0.55, 0.7, 0.22, 7);
  cloud(-0.65, 0.4, -1.0, 0.21, 6);
  cloud(0.95, 0.32, -0.95, 0.18, 6);
  cloud(-0.35, 0.46, 1.25, 0.16, 5);
  cloud(-1.72, 0.66, 0.1, 0.17, 5);
  cloud(1.52, 1.28, -0.62, 0.13, 4);
  cloud(1.35, 0.7, -0.3, 0.17, 5);
  cloud(-0.05, 0.62, -1.3, 0.16, 5);
  bagPart(clouds, CLOUD, { name: "clouds" });

  // -------------------------------------------------------------------------------------------------------------
  // Ruins: dais, broken arch, pillars, walls, fallen blocks, steps
  const RC: [number, number] = [-0.48, -0.22];
  const DY = 1.505;
  const YD = DY + 0.1;
  const stone = new Bag();
  const gold = new Bag();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cyl8 = new THREE.CylinderGeometry(1, 1, 1, 8);
  const cone4 = new THREE.ConeGeometry(1, 1, 5);
  const sph = new THREE.SphereGeometry(1, 8, 6);
  // dais: two octagonal tiers
  stone.add(cyl8, [RC[0], DY + 0.025, RC[1]], { scale: [0.5, 0.05, 0.5], rot: [0, 22.5, 0] });
  stone.add(cyl8, [RC[0], DY + 0.075, RC[1]], { scale: [0.43, 0.05, 0.43], rot: [0, 22.5, 0] });
  gold.add(cyl8, [RC[0], DY + 0.052, RC[1]], { scale: [0.505, 0.008, 0.505], rot: [0, 22.5, 0] });
  // steps
  stone.add(box, [RC[0], DY + 0.012, RC[1] + 0.53], { scale: [0.36, 0.05, 0.13] });
  stone.add(box, [RC[0] - 0.02, DY + 0.0, RC[1] + 0.64], { scale: [0.42, 0.05, 0.1], rot: [0, 4, 0] });

  const P_BASE = DY + 0.05;
  const SHAFT1 = 0.52;
  const TOP1 = P_BASE + 0.08 + SHAFT1;
  const pillar = (x: number, z: number, shaftH: number, broken: boolean) => {
    stone.add(box, [x, P_BASE + 0.025, z], { scale: [0.19, 0.05, 0.19] });
    stone.add(cyl8, [x, P_BASE + 0.065, z], { scale: [0.096, 0.03, 0.096], rot: [0, 22.5, 0] });
    stone.add(cyl8, [x, P_BASE + 0.08 + shaftH / 2, z], { scale: [0.07, shaftH, 0.07], rot: [0, 22.5, 0] });
    gold.add(cyl8, [x, P_BASE + 0.12, z], { scale: [0.077, 0.016, 0.077], rot: [0, 22.5, 0] });
    const top = P_BASE + 0.08 + shaftH;
    if (!broken) {
      gold.add(cyl8, [x, top - 0.02, z], { scale: [0.077, 0.016, 0.077], rot: [0, 22.5, 0] });
      stone.add(new THREE.CylinderGeometry(1.45, 1, 1, 8), [x, top + 0.025, z], {
        scale: [0.07, 0.05, 0.07],
        rot: [0, 22.5, 0],
      });
      stone.add(box, [x, top + 0.065, z], { scale: [0.21, 0.035, 0.21] });
      gold.add(box, [x, top + 0.088, z], { scale: [0.215, 0.01, 0.215] });
    } else {
      stone.add(cone4, [x + 0.01, top + 0.03, z], { scale: [0.07, 0.07, 0.07], rot: [8, 20, -10] });
      stone.add(box, [x + 0.05, top - 0.03, z + 0.06], { scale: [0.04, 0.05, 0.03], rot: [20, 30, 15] });
    }
  };
  const PX1 = RC[0] - 0.31;
  const PX2 = RC[0] + 0.31;
  const PZ = RC[1] - 0.2;
  pillar(PX1, PZ, SHAFT1, false);
  pillar(PX2, PZ, 0.3, true);

  // arch: voussoirs from the west pillar, broken before the keystone
  const archY = TOP1 + 0.0925;
  const archBlocks = 6;
  for (let i = 0; i < archBlocks; i++) {
    const th = 180 - 18 * (i + 0.5);
    const x = RC[0] + 0.31 * Math.cos(th * DEG);
    const y = archY + 0.31 * Math.sin(th * DEG);
    stone.add(box, [x, y, PZ], { scale: [0.105, 0.1, 0.17], rot: [0, 0, th] });
  }
  // gold inlay lines along the arch faces
  const archLine = (rad: number, zOff: number, fromDeg: number, toDeg: number) => {
    const pts: number[][] = [];
    for (let k = 0; k <= 8; k++) {
      const th = (fromDeg + ((toDeg - fromDeg) * k) / 8) * DEG;
      pts.push([RC[0] + rad * Math.cos(th), archY + rad * Math.sin(th), PZ + zOff]);
    }
    return catmull(pts);
  };
  b.sweep(archLine(0.272, 0.088, 180, 74), 0.008, { color: GOLD, sides: 4, bone: base, name: "archGoldIn" });
  b.sweep(archLine(0.352, 0.088, 180, 74), 0.008, { color: GOLD, sides: 4, bone: base, name: "archGoldOut" });
  // fallen arch blocks and rubble
  stone.add(box, [RC[0] - 0.3, YD + 0.05, RC[1] + 0.12], { scale: [0.105, 0.1, 0.17], rot: [0, 38, 15] });
  stone.add(box, [PX2 - 0.1, YD + 0.04, PZ + 0.26], { scale: [0.105, 0.1, 0.17], rot: [10, 75, 0] });
  stone.add(box, [RC[0] + 0.5, gy(RC[0] + 0.5, RC[1] - 0.15) + 0.04, RC[1] - 0.15], {
    scale: [0.11, 0.1, 0.17],
    rot: [0, -20, 70],
  });
  stone.add(box, [RC[0] + 0.52, gy(RC[0] + 0.52, RC[1] + 0.2) + 0.03, RC[1] + 0.2], {
    scale: [0.12, 0.07, 0.1],
    rot: [18, 10, 0],
  });
  stone.add(ico0, [RC[0] + 0.15, YD + 0.03, RC[1] + 0.15], { scale: [0.05, 0.035, 0.045], rot: [20, 40, 0] });
  stone.add(ico0, [RC[0] - 0.12, YD + 0.025, RC[1] + 0.12], { scale: [0.04, 0.03, 0.04], rot: [0, 10, 25] });
  // fallen column drum lying across the dais
  stone.add(cyl8, [RC[0] + 0.22, YD + 0.07, RC[1] + 0.08], {
    scale: [0.07, 0.34, 0.07],
    rot: [90, 0, 25],
  });
  gold.add(cyl8, [RC[0] + 0.22 - 0.023, YD + 0.07, RC[1] + 0.08 + 0.05], { scale: [0.077, 0.014, 0.077], rot: [90, 0, 25] });
  stone.add(new THREE.CylinderGeometry(1.45, 1, 1, 8), [RC[0] + 0.5, gy(RC[0] + 0.5, RC[1] + 0.28) + 0.04, RC[1] + 0.28], {
    scale: [0.07, 0.05, 0.07],
    rot: [75, 0, 50],
  });

  // broken wall stubs
  const wallRun = (x: number, z: number, along: "x" | "z", heights: number[]) => {
    heights.forEach((h, i) => {
      const o = i * 0.125;
      const px = along === "x" ? x + o : x;
      const pz = along === "z" ? z + o : z;
      const gh = gy(px, pz);
      stone.add(box, [px, gh - 0.02 + h / 2, pz], {
        scale: along === "x" ? [0.126, h + 0.02, 0.13] : [0.13, h + 0.02, 0.126],
        rot: [0, rr(-4, 4), 0],
      });
    });
  };
  wallRun(-1.08, -0.5, "z", [0.3, 0.26, 0.17, 0.11, 0.06]);
  wallRun(-0.02, -0.62, "x", [0.24, 0.14, 0.07]);
  // wall caps in gold (top of tallest stub)
  gold.add(box, [-1.08, gy(-1.08, -0.5) + 0.3 + 0.008, -0.5], { scale: [0.136, 0.012, 0.14] });

  // stepping stones from the stairs to the bridge
  const stepStones: P3[] = [
    [-0.5, 0.58, 0],
    [-0.66, 0.5, 0],
    [-0.83, 0.4, 0],
    [-0.98, 0.29, 0],
    [-1.13, 0.19, 0],
  ];
  stepStones.forEach(([x, z], i) => {
    stone.add(cyl8, [x, gy(x, z) + 0.004, z], { scale: [0.06 + (i % 2) * 0.015, 0.02, 0.06], rot: [0, i * 20, 0] });
  });
  bagPart(stone, STONE, { name: "ruinStone" });
  bagPart(gold, GOLD, { name: "ruinGold" });

  // teal gems and glyph strips on the ruin
  const gems = new Bag();
  const gemGeo = new THREE.OctahedronGeometry(0.022, 0);
  for (let i = 0; i < archBlocks; i += 2) {
    const th = (180 - 18 * (i + 0.5)) * DEG;
    gems.add(gemGeo, [RC[0] + 0.31 * Math.cos(th), archY + 0.31 * Math.sin(th), PZ + 0.092], { scale: [1, 1.4, 0.7], rot: [0, 0, 180 - 18 * (i + 0.5)] });
  }
  gems.add(gemGeo, [PX1, DY + 0.06 + 0.72 - 0.19, PZ + 0.068], { scale: [1, 1.3, 0.8] });
  gems.add(gemGeo, [PX1, DY + 0.06 + 0.72 + 0.07, PZ + 0.109], { scale: [1, 1.3, 0.8] });
  glow(bagPart(gems, "#7ff5e3", { name: "ruinGems" }), 1.2);
  glow(
    put(new THREE.PlaneGeometry(0.045, 0.17), "#ffffff", {
      at: [PX1, DY + 0.06 + 0.4, PZ + 0.0674],
      dir: [0, 0, 1],
      axis: "z",
      texture: GLYPH,
    }),
    1,
  );
  glow(
    put(new THREE.PlaneGeometry(0.045, 0.17), "#ffffff", {
      at: [PX2, DY + 0.06 + 0.2, PZ + 0.0674],
      dir: [0, 0, 1],
      axis: "z",
      texture: GLYPH,
    }),
    1,
  );
  // rune circle on the dais
  glow(
    put(new THREE.PlaneGeometry(0.72, 0.72), "#ffffff", {
      at: [RC[0], YD + 0.004, RC[1]],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNE,
    }),
    1,
  );

  // tassels hanging from the arch
  const tasselFrames = [150, 124, 100].map((deg) => {
    const th = deg * DEG;
    return frame([RC[0] + 0.272 * Math.cos(th), archY + 0.272 * Math.sin(th) + 0.005, PZ + 0.1], [0, 1, 0]);
  });
  b.cards(tasselFrames, TASSEL, { size: [0.05, 0.17], lean: 180, flow: [0, 0, 1], bone: base, sink: 0.0 });

  // wind sigil: spinning ribbons, motes, floating orb
  const spinJ = b.joint("windSpin", { parent: base, at: [RC[0], YD, RC[1]], dir: [0, 1, 0], role: "hinge" });
  const orbPos: P3 = [RC[0], YD + 0.52, RC[1]];
  const orbJ = b.joint("orb", { parent: spinJ, at: orbPos, dir: [0, 1, 0], role: "hinge" });
  const orbCore = b.part(new THREE.OctahedronGeometry(0.085, 0), "#a6fff0", {
    bone: orbJ,
    at: orbPos,
    scale: [1, 1.5, 1],
    flat: true,
  });
  glow(orbCore, 1.5);
  glow(b.part(new THREE.OctahedronGeometry(0.04, 0), "#ffffff", { bone: orbJ, at: orbPos, scale: [1, 1.5, 1], flat: true }), 2);
  const ringGeo = new THREE.TorusGeometry(0.16, 0.008, 6, 28);
  b.part(ringGeo, GOLD, { bone: orbJ, at: orbPos, rotation: [78, 0, 0] });
  b.part(new THREE.TorusGeometry(0.19, 0.006, 6, 28), GOLD, { bone: orbJ, at: orbPos, rotation: [35, 40, 0] });
  b.part(new THREE.TorusGeometry(0.13, 0.005, 6, 24), GOLD, { bone: orbJ, at: orbPos, rotation: [-30, -50, 0] });
  const sats = new Bag();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    sats.add(new THREE.OctahedronGeometry(0.02, 0), [orbPos[0] + Math.cos(a) * 0.21, orbPos[1] + Math.sin(a * 2) * 0.05, orbPos[2] + Math.sin(a) * 0.21], { scale: [1, 1.4, 1] });
  }
  glow(bagPart(sats, "#d5fff8", { bone: orbJ, name: "orbSats" }), 1.5);
  for (const k of [0, 1]) {
    const ribbon = spiral(
      [RC[0], YD + 0.03, RC[1]],
      [RC[0] + Math.cos(k * Math.PI) * 0.33, YD + 0.03, RC[1] + Math.sin(k * Math.PI) * 0.33],
      [0, 1, 0],
      { turns: 1.5, r1: 0.1, pitch: 0.36 },
    );
    glow(
      b.sweep(ribbon, [0.014, 0.003], { color: "#b6fff0", sides: 4, bone: spinJ, caps: { start: "flat", end: "point" }, name: "windRibbon" }),
      1.2,
    );
  }
  const motes = new Bag();
  for (let i = 0; i < 18; i++) {
    const a = i * 2.4;
    const rad = rr(0.1, 0.38);
    motes.add(new THREE.OctahedronGeometry(rr(0.008, 0.016), 0), [RC[0] + Math.cos(a) * rad, YD + 0.06 + (i / 18) * 0.85, RC[1] + Math.sin(a) * rad]);
  }
  glow(bagPart(motes, "#e2fffa", { bone: spinJ, name: "motes" }), 1.5);

  // -------------------------------------------------------------------------------------------------------------
  // Pond, river and waterfall
  const PND: [number, number] = [0.12, 0.2];
  const D = new THREE.Vector3(0.498, 0, 0.867).normalize();
  const T = new THREE.Vector3(-D.z, 0, D.x);
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.27, 0.03],
      [0, 0.03],
    ],
    {
      at: [PND[0], gy(PND[0], PND[1]) - 0.015, PND[1]],
      segments: 14,
      color: paint((p) => (Math.hypot(p.x - PND[0], p.z - PND[1]) > 0.24 ? "#e8fcff" : waterPaint)),
      bone: base,
      name: "pond",
    },
  );
  const riverXZ = catmull([
    [0.14, 0, 0.3],
    [0.24, 0, 0.5],
    [0.32, 0, 0.7],
    [0.42, 0, 0.88],
    [0.52, 0, 1.04],
    [D.x * 1.37, 0, D.z * 1.37],
  ]);
  const riverPts: number[][] = [];
  for (let i = 0; i <= 22; i++) {
    const q = riverXZ.at(i / 22);
    const y = Math.hypot(q.x, q.z) > 1.3 ? 1.456 : gy(q.x, q.z) + 0.004;
    riverPts.push([q.x, y, q.z]);
  }
  b.sweep(catmull(riverPts), (t) => [0.04 + 0.07 * t, 0.012], {
    section: "box",
    color: waterPaint,
    bone: base,
    caps: { start: "flat", end: "flat" },
    name: "river",
  });
  // bank stones and pond rim
  const bank = new Bag();
  for (let i = 0; i < 18; i++) {
    const t = 0.04 + (i / 18) * 0.88;
    const q = riverXZ.at(t);
    const tg = riverXZ.tangentAt(t);
    const hw = 0.04 + 0.07 * t + 0.03;
    for (const sgn of [1, -1]) {
      if (R() < 0.35) continue;
      const x = q.x + -tg.z * hw * sgn + rr(-0.02, 0.02);
      const z = q.z + tg.x * hw * sgn + rr(-0.02, 0.02);
      const s = rr(0.025, 0.05);
      bank.add(ico0, [x, gy(x, z) + s * 0.3, z], { scale: [s * 1.3, s * 0.8, s], rot: [0, rr(0, 360), 0] });
    }
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    if (Math.abs(a - 1.1) < 0.28) continue;
    const x = PND[0] + Math.cos(a) * 0.29;
    const z = PND[1] + Math.sin(a) * 0.29;
    const s = rr(0.04, 0.06);
    bank.add(ico0, [x, gy(x, z) + s * 0.35, z], { scale: [s * 1.3, s * 0.85, s * 1.1], rot: [0, rr(0, 360), 0] });
  }
  bagPart(bank, ROCK, { name: "bankStones" });

  // lily pads and lotus
  const pads = new Bag();
  const padGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
  const gP = gy(PND[0], PND[1]) + 0.017;
  for (const [dx, dz, s] of [
    [-0.08, 0.05, 0.045],
    [0.1, -0.06, 0.04],
    [0.05, 0.12, 0.035],
    [-0.12, -0.08, 0.032],
  ] as const) {
    pads.add(padGeo, [PND[0] + dx, gP, PND[1] + dz], { scale: [s, 0.004, s], rot: [0, dx * 300, 0] });
  }
  bagPart(pads, "#4fbf5a", { name: "lilyPads" });
  const lotus = new Bag();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    lotus.add(new THREE.ConeGeometry(0.014, 0.05, 4), [PND[0] - 0.08 + Math.cos(a) * 0.014, gP + 0.025, PND[1] + 0.05 + Math.sin(a) * 0.014], {
      dir: [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5],
    });
  }
  bagPart(lotus, "#ffa6cc", { name: "lotus" });

  // waterfall: lip rock, sheet layers, streak cards, droplets
  const lip = new Bag();
  lip.add(box, [D.x * 1.3, 1.405, D.z * 1.3], {
    scale: [0.34, 0.09, 0.28],
    rot: [0, Math.atan2(D.x, D.z) / DEG, 0],
  });
  lip.add(ico0, [D.x * 1.31 + T.x * 0.2, 1.4, D.z * 1.31 + T.z * 0.2], { scale: [0.08, 0.06, 0.08], rot: [0, 30, 0] });
  lip.add(ico0, [D.x * 1.31 - T.x * 0.2, 1.4, D.z * 1.31 - T.z * 0.2], { scale: [0.07, 0.055, 0.075], rot: [0, 70, 0] });
  bagPart(lip, ROCK, { name: "lipRock" });
  const fallPaint = paint((p, _n, s) => {
    const u = s[0];
    const v = s[1];
    if (v < 0.09 + 0.035 * Math.sin(u * 70)) return "#ffffff";
    if (Math.sin(u * 85 + noise(p, 0.25, 31) * 5 + v * 3) > 0.8) return "#d6f8ff";
    return v > 0.5 ? "#4fc9ee" : "#7ce0f6";
  });
  const sheet: [number, number][] = [
    [-0.11, 0.92],
    [0.11, 0.92],
    [0.12, 0.7],
    [0.13, 0.45],
    [0.15, 0.2],
    [0.19, 0.05],
    [0.12, 0.0],
    [0.05, 0.07],
    [-0.04, 0.0],
    [-0.12, 0.06],
    [-0.19, 0.04],
    [-0.15, 0.22],
    [-0.13, 0.45],
    [-0.12, 0.7],
  ];
  b.extrude(sheet, {
    at: [D.x * 1.37, 0.55, D.z * 1.37],
    x: [T.x, 0, T.z],
    thickness: 0.05,
    color: fallPaint,
    bone: base,
    name: "waterfall",
  });
  b.extrude(
    sheet.map(([x, y]) => [x * 0.62, y * 0.96 + 0.02] as [number, number]),
    {
      at: [D.x * 1.405, 0.55, D.z * 1.405],
      x: [T.x, 0, T.z],
      thickness: 0.03,
      color: fallPaint,
      bone: base,
      name: "waterfallFront",
    },
  );
  const streakFrames = [-0.075, 0, 0.075].map((u, i) =>
    frame([D.x * 1.435 + T.x * u, 1.45 - i * 0.04, D.z * 1.435 + T.z * u], [0, 1, 0]),
  );
  glow(
    b.cards(streakFrames, STREAK, { size: [0.075, 0.82], lean: 180, flow: [D.x, 0, D.z], bone: base, sink: 0 }),
    0.5,
  );
  const drops = new Bag();
  for (let i = 0; i < 16; i++) {
    const u = rr(-0.16, 0.16);
    const y = rr(0.3, 0.52);
    const dd = rr(1.32, 1.5);
    drops.add(new THREE.OctahedronGeometry(0.014, 0), [D.x * dd + T.x * u, y, D.z * dd + T.z * u], { scale: [1, 2, 1] });
  }
  bagPart(drops, "#cdf7ff", { name: "droplets" });

  // -------------------------------------------------------------------------------------------------------------
  // Trees
  const roots = (x: number, z: number, g: number, count: number, reach: number, w: number) => {
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2 + rr(-0.2, 0.2);
      const rx = x + Math.cos(a) * reach * rr(0.9, 1.2);
      const rz = z + Math.sin(a) * reach * rr(0.9, 1.2);
      b.sweep(
        catmull([
          [x, g + 0.2, z],
          [x + Math.cos(a) * reach * 0.5, g + 0.05, z + Math.sin(a) * reach * 0.5],
          [rx, g - 0.02, rz],
        ]),
        [w, w * 0.3],
        { color: BARK, sides: 5, bone: base, name: "root" },
      );
    }
  };
  const canopy = (cx: number, cy: number, cz: number, blobs: number[][], color: Fill, name: string) => {
    const c = new Bag();
    for (const [dx, dy, dz, r] of blobs)
      c.add(ico1, [cx + dx, cy + dy, cz + dz], { scale: [r, r * 0.8, r], rot: [0, rr(0, 360), 0] });
    return bagPart(c, color, { name });
  };

  // big tree
  const T1: [number, number] = [0.62, -0.52];
  const g1 = gy(T1[0], T1[1]);
  b.sweep(
    catmull([
      [T1[0], g1 - 0.05, T1[1]],
      [T1[0] + 0.04, g1 + 0.25, T1[1] + 0.02],
      [T1[0] - 0.04, g1 + 0.6, T1[1]],
      [T1[0] - 0.01, g1 + 0.98, T1[1] + 0.02],
    ]),
    [0.115, 0.075, 0.062, 0.05],
    { color: BARK, sides: 7, bone: base, name: "trunk" },
  );
  roots(T1[0], T1[1], g1, 6, 0.3, 0.05);
  for (const [dx, dz, up] of [
    [0.3, 0.08, 1.02],
    [-0.28, 0.06, 1.0],
    [0.04, 0.3, 0.95],
    [0.0, -0.28, 0.95],
  ] as const)
    b.sweep(
      catmull([
        [T1[0] - 0.03, g1 + 0.55, T1[1]],
        [T1[0] + dx * 0.4, g1 + 0.78, T1[1] + dz * 0.4],
        [T1[0] + dx, g1 + up, T1[1] + dz],
      ]),
      [0.04, 0.02],
      { color: BARK, sides: 5, bone: base, name: "branch" },
    );
  const crown1 = canopy(
    T1[0] - 0.01,
    g1 + 1.02,
    T1[1] + 0.02,
    [
      [0, 0.18, 0, 0.34],
      [0.3, 0.05, 0.08, 0.27],
      [-0.3, 0.08, -0.05, 0.27],
      [0.02, 0.02, 0.32, 0.25],
      [-0.06, 0.02, -0.32, 0.26],
      [0.12, 0.42, 0.02, 0.24],
      [-0.15, 0.38, 0.1, 0.2],
      [0.28, 0.28, -0.18, 0.2],
      [-0.28, 0.3, 0.18, 0.18],
    ],
    LEAF,
    "crownBig",
  );
  const crownHits = b.surface(crown1).scatter(110, { rng: R, minDist: 0.07, filter: (h) => h.n.y > -0.2 });
  b.cards(crownHits, LEAF_TEX, { size: [0.17, 0.17], lean: 40, vary: 0.3, spin: 180, rng: R, bone: base, flow: [0, -0.3, -1] });

  // lanterns hanging from the big tree
  const lanternJoints: ReturnType<typeof b.joint>[] = [];
  const hangLantern = (name: string, x: number, y: number, z: number) => {
    const j = b.joint(name, { parent: base, at: [x, y, z], dir: [0, -1, 0], role: "hinge" });
    lanternJoints.push(j);
    b.rod([x, y, z], [x, y - 0.12, z], 0.003, "#6a4a3a", { bone: j, caps: "none" });
    b.part(new THREE.CylinderGeometry(0.03, 0.02, 0.014, 8), GOLD, { bone: j, at: [x, y - 0.127, z], flat: true });
    glow(b.part(new THREE.SphereGeometry(0.048, 8, 6), "#ffcf7a", { bone: j, at: [x, y - 0.185, z], scale: [1, 1.2, 1], flat: true }), 1.3);
    b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.012, 8), GOLD, { bone: j, at: [x, y - 0.253, z], flat: true });
    b.cards([frame([x, y - 0.258, z], [0, 1, 0])], TASSEL, { size: [0.04, 0.12], lean: 180, flow: [0, 0, 1], bone: j, sink: 0 });
    return j;
  };
  hangLantern("lanternA", T1[0] + 0.3, g1 + 0.96, T1[1] + 0.09);
  hangLantern("lanternB", T1[0] - 0.27, g1 + 0.92, T1[1] + 0.06);

  // sakura
  const T2: [number, number] = [-0.98, 0.62];
  const g2 = gy(T2[0], T2[1]);
  b.sweep(
    catmull([
      [T2[0], g2 - 0.05, T2[1]],
      [T2[0] - 0.05, g2 + 0.2, T2[1] + 0.03],
      [T2[0] - 0.14, g2 + 0.45, T2[1] + 0.08],
      [T2[0] - 0.12, g2 + 0.74, T2[1] + 0.1],
    ]),
    [0.07, 0.045, 0.035],
    { color: BARK, sides: 6, bone: base, name: "sakuraTrunk" },
  );
  roots(T2[0], T2[1], g2, 5, 0.2, 0.035);
  for (const [dx, dz] of [
    [0.22, 0.04],
    [-0.2, -0.02],
    [0.02, 0.2],
  ] as const)
    b.sweep(
      catmull([
        [T2[0] - 0.12, g2 + 0.55, T2[1] + 0.09],
        [T2[0] - 0.12 + dx * 0.5, g2 + 0.7, T2[1] + 0.1 + dz * 0.5],
        [T2[0] - 0.12 + dx, g2 + 0.82, T2[1] + 0.1 + dz],
      ]),
      [0.025, 0.012],
      { color: BARK, sides: 5, bone: base, name: "sakuraBranch" },
    );
  const crown2 = canopy(
    T2[0] - 0.12,
    g2 + 0.82,
    T2[1] + 0.1,
    [
      [0, 0.1, 0, 0.27],
      [0.26, 0, 0.04, 0.2],
      [-0.26, 0.02, -0.02, 0.21],
      [0.0, 0.0, 0.26, 0.19],
      [0.02, 0.0, -0.25, 0.2],
      [0.1, 0.27, 0.05, 0.18],
    ],
    BLOSSOM,
    "crownSakura",
  );
  const blossomHits = b.surface(crown2).scatter(70, { rng: R, minDist: 0.07, filter: (h) => h.n.y > -0.2 });
  b.cards(blossomHits, BLOSSOM_TEX, { size: [0.14, 0.14], lean: 40, vary: 0.3, spin: 180, rng: R, bone: base, flow: [0, -0.3, -1] });
  // falling petals
  const petalFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 26; i++) {
    const a = rr(0, Math.PI * 2);
    const rad = rr(0.05, 0.6);
    const y = rr(g2 + 0.05, g2 + 0.9);
    petalFrames.push(frame([T2[0] - 0.12 + Math.cos(a) * rad, y, T2[1] + 0.1 + Math.sin(a) * rad], [rr(-0.3, 0.3), 1, rr(-0.3, 0.3)]));
  }
  b.cards(petalFrames, PETAL, { size: 0.04, lean: 80, flow: [1, 0, 0.3], spin: 180, vary: 0.3, rng: R, bone: base });

  // pines
  const pines = new Bag();
  const pineTrunks = new Bag();
  const cone7 = new THREE.ConeGeometry(1, 1, 7);
  const pine = (x: number, z: number, h: number) => {
    const g = gy(x, z);
    pineTrunks.add(cyl8, [x, g + 0.06 * h, z], { scale: [0.028 * h + 0.012, 0.15 * h, 0.028 * h + 0.012] });
    for (let k = 0; k < 4; k++) {
      const rad = (0.2 - k * 0.04) * h * 1.4;
      const ht = 0.3 * h;
      pines.add(cone7, [x, g + 0.1 * h + k * 0.17 * h + ht / 2, z], {
        scale: [rad, ht, rad],
        rot: [0, k * 25 + x * 100, 0],
      });
    }
  };
  pine(0.1, -1.0, 1.05);
  pine(-0.25, -1.03, 0.82);
  pine(1.08, -0.1, 0.75);
  pine(-1.12, -0.82, 0.62);
  bagPart(pines, PINE, { name: "pines" });
  bagPart(pineTrunks, BARK, { name: "pineTrunks" });
  b.cards(
    [
      frame([0.1, gy(0.1, -1.0) + 0.9, -1.0], [0, 1, 0]),
      frame([0.15, gy(0.1, -1.0) + 0.5, -0.88], [0, 1, 0]),
      frame([0.0, gy(0.1, -1.0) + 0.6, -1.08], [0, 1, 0]),
    ],
    PINE_TEX,
    { size: [0.14, 0.14], lean: 50, flow: [0, -0.2, 1], spin: 180, bone: base },
  );

  // bushes
  const bushes = new Bag();
  for (const [x, z, s] of [
    [0.1, -0.15, 0.1],
    [0.25, -0.18, 0.08],
    [-0.1, 0.55, 0.09],
    [0.42, 0.28, 0.09],
    [-0.15, 0.8, 0.1],
    [0.62, 0.15, 0.08],
    [-0.8, -0.8, 0.12],
    [0.4, -1.0, 0.11],
    [0.9, 0.3, 0.1],
    [-0.28, 0.12, 0.07],
  ] as const) {
    const g = gy(x, z);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1;
      bushes.add(ico0, [x + Math.cos(a) * s * 0.7, g + s * 0.45, z + Math.sin(a) * s * 0.7], {
        scale: [s * rr(0.8, 1.1), s * 0.75, s * rr(0.8, 1.1)],
        rot: [rr(0, 90), rr(0, 360), 0],
      });
    }
  }
  bagPart(bushes, LEAF, { name: "bushes" });

  // mushrooms
  const mushCaps = new Bag();
  const mushStems = new Bag();
  const capGeo = new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const [x, z, s] of [
    [0.45, -0.3, 0.05],
    [0.5, -0.36, 0.035],
    [0.36, -0.34, 0.03],
    [-0.9, -0.15, 0.04],
    [-0.35, 0.65, 0.03],
  ] as const) {
    const g = gy(x, z);
    mushStems.add(cyl8, [x, g + s * 0.6, z], { scale: [s * 0.3, s * 1.3, s * 0.3] });
    mushCaps.add(capGeo, [x, g + s * 1.15, z], { scale: [s * 1.2, s * 0.85, s * 1.2], rot: [0, x * 200, 0] });
  }
  bagPart(mushStems, "#fff0d2", { name: "mushStems" });
  bagPart(mushCaps, cel(spots("#ff8a5c", "#fff1d0", { size: 0.03, amount: 0.55, seed: 3 })), { name: "mushCaps" });

  // boulders scattered on the grass
  const boulders = new Bag();
  for (const [x, z, s] of [
    [0.9, 0.55, 0.1],
    [-0.2, -0.75, 0.09],
    [0.05, 0.85, 0.07],
    [-1.05, -0.2, 0.08],
    [0.32, -0.9, 0.06],
    [0.95, -0.55, 0.07],
  ] as const) {
    boulders.add(ico0, [x, gy(x, z) + s * 0.35, z], { scale: [s * 1.3, s * 0.8, s], rot: [rr(0, 40), rr(0, 360), 0] });
  }
  bagPart(boulders, ROCK, { name: "boulders" });

  // banner pole near the stairs
  const BP: [number, number] = [-0.62, 0.78];
  const gB = gy(BP[0], BP[1]);
  const pole = new Bag();
  pole.add(cyl8, [BP[0], gB + 0.4, BP[1]], { scale: [0.014, 0.8, 0.014] });
  pole.add(cyl8, [BP[0], gB + 0.74, BP[1]], { scale: [0.009, 0.24, 0.009], rot: [0, 0, 90] });
  bagPart(pole, WOOD, { name: "bannerPole" });
  const poleGold = new Bag();
  poleGold.add(sph, [BP[0], gB + 0.83, BP[1]], { scale: 0.026 });
  poleGold.add(sph, [BP[0] - 0.12, gB + 0.74, BP[1]], { scale: 0.015 });
  poleGold.add(sph, [BP[0] + 0.12, gB + 0.74, BP[1]], { scale: 0.015 });
  poleGold.add(cyl8, [BP[0], gB + 0.04, BP[1]], { scale: [0.026, 0.05, 0.026] });
  bagPart(poleGold, GOLD, { name: "bannerGold" });
  const bannerJ = b.joint("banner", { parent: base, at: [BP[0], gB + 0.74, BP[1]], dir: [0, -1, 0], role: "hinge" });
  b.cards([frame([BP[0], gB + 0.74, BP[1] + 0.012], [0, 1, 0])], BANNER, {
    size: [0.2, 0.5],
    lean: 180,
    flow: [0, 0, 1],
    bone: bannerJ,
    sink: 0,
  });
  b.cards(
    [frame([BP[0] - 0.085, gB + 0.255, BP[1] + 0.015], [0, 1, 0]), frame([BP[0] + 0.085, gB + 0.255, BP[1] + 0.015], [0, 1, 0])],
    TASSEL,
    { size: [0.035, 0.1], lean: 180, flow: [0, 0, 1], bone: bannerJ, sink: 0 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Islet A with a plank bridge
  const IA: [number, number, number] = [-1.72, 0.955, 0.1];
  const isletJ = b.joint("isletA", { parent: base, at: [IA[0], IA[1] + 0.25, IA[2]], dir: [0, 1, 0], role: "hinge" });
  const isletPaint = makeIslandPaint(IA[0], IA[2], 1.32, 17);
  const isletBody = b.lathe(
    [
      [0, 0],
      [0.07, 0.07],
      [0.14, 0.2],
      [0.21, 0.33],
      [0.23, 0.42],
      [0.2, 0.46],
      [0.1, 0.49],
      [0, 0.5],
    ],
    { at: IA, segments: 10, color: isletPaint, bone: isletJ, name: "isletA" },
  );
  const isletTop = IA[1] + 0.49;
  const isletSpikes = new Bag();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const len = rr(0.08, 0.15);
    isletSpikes.add(cone5, [IA[0] + Math.cos(a) * 0.15, IA[1] + 0.18 - len * 0.3, IA[2] + Math.sin(a) * 0.15], {
      dir: [Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3],
      scale: [0.03, len, 0.03],
    });
  }
  bagPart(isletSpikes, ROCK, { bone: isletJ, name: "isletASpikes" });
  // islet tree
  b.sweep(
    catmull([
      [IA[0] - 0.04, isletTop - 0.02, IA[2] - 0.02],
      [IA[0] - 0.03, isletTop + 0.1, IA[2] - 0.01],
      [IA[0] - 0.06, isletTop + 0.22, IA[2] - 0.02],
    ]),
    [0.03, 0.018],
    { color: BARK, sides: 5, bone: isletJ, name: "isletTrunk" },
  );
  {
    const c = new Bag();
    for (const [dx, dy, dz, r] of [
      [0, 0.04, 0, 0.13],
      [0.1, -0.02, 0.03, 0.09],
      [-0.1, -0.01, -0.02, 0.09],
      [0.0, 0.08, 0.05, 0.08],
    ])
      c.add(ico1, [IA[0] - 0.06 + dx, isletTop + 0.28 + dy, IA[2] - 0.02 + dz], { scale: [r, r * 0.8, r] });
    bagPart(c, LEAF, { bone: isletJ, name: "isletCrown" });
  }
  {
    const cd = new Bag();
    const ct = new Bag();
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6;
      const dir = new THREE.Vector3(Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3).normalize();
      const len = rr(0.07, 0.12);
      const p0 = new THREE.Vector3(IA[0] + 0.1 + Math.cos(a) * 0.02, isletTop - 0.01, IA[2] + 0.06 + Math.sin(a) * 0.02);
      const c1 = p0.clone().addScaledVector(dir, len * 0.325);
      const c2 = p0.clone().addScaledVector(dir, len * 0.825);
      cd.add(prism, [c1.x, c1.y, c1.z], { dir: [dir.x, dir.y, dir.z], scale: [0.016, len * 0.65, 0.016] });
      ct.add(tipGeo, [c2.x, c2.y, c2.z], { dir: [dir.x, dir.y, dir.z], scale: [0.016, len * 0.35, 0.016] });
    }
    glow(bagPart(cd, "#5ccfdc", { bone: isletJ, name: "isletCrystalA" }), 1);
    glow(bagPart(ct, "#b6fff0", { bone: isletJ, name: "isletCrystalB" }), 1);
  }
  const isletTufts = b
    .surface(isletBody)
    .scatter(26, { rng: R, minDist: 0.06, filter: (h) => h.n.y > 0.8 && h.at.y > isletTop - 0.08 && Math.hypot(h.at.x - IA[0] + 0.06, h.at.z - IA[2]) > 0.08 });
  b.cards(isletTufts, TUFT, { size: [0.07, 0.08], lean: 15, cross: true, vary: 0.35, spin: 180, rng: R, bone: isletJ, flow: [0, -0.2, 1] });

  // bridge between the main island rim and islet A
  const wood = new Bag();
  const bx0 = -1.27;
  const bx1 = IA[0] + 0.2;
  const byA = 1.455;
  const planks = 6;
  for (let i = 0; i < planks; i++) {
    const t = (i + 0.5) / planks;
    const x = bx0 + (bx1 - bx0) * t;
    const y = byA + 0.012 - 0.03 * Math.sin(t * Math.PI);
    wood.add(box, [x, y, 0.1], { scale: [0.05, 0.012, 0.15], rot: [0, 0, (t - 0.5) * 8] });
  }
  for (const zz of [0.025, 0.175]) {
    wood.add(cyl8, [bx0 + 0.01, byA + 0.07, zz], { scale: [0.01, 0.15, 0.01] });
    wood.add(cyl8, [bx1 - 0.01, byA + 0.07, zz], { scale: [0.01, 0.15, 0.01] });
  }
  bagPart(wood, WOOD, { name: "bridgeWood" });
  for (const zz of [0.025, 0.175])
    b.sweep(
      catmull([
        [bx0 + 0.01, byA + 0.14, zz],
        [(bx0 + bx1) / 2, byA + 0.09, zz],
        [bx1 - 0.01, byA + 0.14, zz],
      ]),
      0.005,
      { color: "#d8c08c", sides: 4, bone: base, name: "bridgeRope" },
    );

  // islet B with crystals
  const IB: [number, number, number] = [1.5, 1.5, -0.65];
  const isletBJ = b.joint("isletB", { parent: base, at: [IB[0], IB[1] + 0.2, IB[2]], dir: [0, 1, 0], role: "hinge" });
  const isletBBody = b.lathe(
    [
      [0, 0],
      [0.06, 0.06],
      [0.12, 0.16],
      [0.17, 0.27],
      [0.19, 0.34],
      [0.16, 0.38],
      [0.08, 0.41],
      [0, 0.42],
    ],
    { at: IB, segments: 9, color: makeIslandPaint(IB[0], IB[2], 1.5 + 0.28, 23), bone: isletBJ, name: "isletB" },
  );
  const topB = IB[1] + 0.41;
  {
    const cd = new Bag();
    const ct = new Bag();
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3;
      const dir = new THREE.Vector3(Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35).normalize();
      const len = rr(0.1, 0.2);
      const p0 = new THREE.Vector3(IB[0] + Math.cos(a) * 0.04, topB - 0.01, IB[2] + Math.sin(a) * 0.04);
      const c1 = p0.clone().addScaledVector(dir, len * 0.325);
      const c2 = p0.clone().addScaledVector(dir, len * 0.825);
      cd.add(prism, [c1.x, c1.y, c1.z], { dir: [dir.x, dir.y, dir.z], scale: [0.02, len * 0.65, 0.02] });
      ct.add(tipGeo, [c2.x, c2.y, c2.z], { dir: [dir.x, dir.y, dir.z], scale: [0.02, len * 0.35, 0.02] });
    }
    glow(bagPart(cd, "#5ccfdc", { bone: isletBJ, name: "isletBCrystalA" }), 1);
    glow(bagPart(ct, "#b6fff0", { bone: isletBJ, name: "isletBCrystalB" }), 1);
  }
  const spikesB = new Bag();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const len = rr(0.06, 0.12);
    spikesB.add(cone5, [IB[0] + Math.cos(a) * 0.11, IB[1] + 0.14 - len * 0.3, IB[2] + Math.sin(a) * 0.11], {
      dir: [Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3],
      scale: [0.025, len, 0.025],
    });
  }
  bagPart(spikesB, ROCK, { bone: isletBJ, name: "isletBSpikes" });
  b.cards(
    b.surface(isletBBody).scatter(14, { rng: R, minDist: 0.05, filter: (h) => h.n.y > 0.8 && h.at.y > topB - 0.06 }),
    TUFT,
    { size: [0.06, 0.07], lean: 15, cross: true, vary: 0.35, spin: 180, rng: R, bone: isletBJ, flow: [0, -0.2, 1] },
  );

  // small drifting rocks
  const drift = new Bag();
  for (const [x, y, z, s] of [
    [0.85, 0.5, -0.5, 0.07],
    [-0.82, 0.3, 0.55, 0.06],
    [0.28, 0.72, 1.05, 0.05],
    [-0.72, 0.95, -1.0, 0.07],
    [1.2, 1.0, 0.55, 0.045],
  ] as const) {
    drift.add(ico0, [x, y, z], { scale: [s * 1.2, s * 0.85, s], rot: [rr(0, 60), rr(0, 360), 0] });
    drift.add(cone5, [x, y - s * 0.9, z], { dir: [0.1, -1, 0], scale: [s * 0.5, s * 1.2, s * 0.5] });
  }
  bagPart(drift, ROCK, { name: "driftRocks" });

  // -------------------------------------------------------------------------------------------------------------
  // Grass tufts and flowers on top
  const blockers: [number, number, number][] = [
    [RC[0], RC[1], 0.62],
    [PND[0], PND[1], 0.37],
    [T1[0], T1[1], 0.22],
    [T2[0], T2[1], 0.15],
    [BP[0], BP[1], 0.08],
    [0.1, -1.0, 0.14],
    [-0.25, -1.03, 0.12],
    [1.08, -0.1, 0.12],
    [-1.12, -0.82, 0.1],
    [-0.08, -0.62, 0.2],
    [-1.08, -0.3, 0.2],
    [0.9, -0.85, 0.28],
  ];
  const blocked = (x: number, z: number) => {
    if (Math.hypot(x, z) > 1.22) return true;
    if (blockers.some(([bx, bz, r]) => Math.hypot(x - bx, z - bz) < r)) return true;
    // river corridor
    for (let i = 0; i < riverPts.length - 1; i++)
      if (segDist(x, z, riverPts[i][0], riverPts[i][2], riverPts[i + 1][0], riverPts[i + 1][2]) < 0.15) return true;
    for (let i = 0; i < stepStones.length - 1; i++)
      if (segDist(x, z, stepStones[i][0], stepStones[i][1], stepStones[i + 1][0], stepStones[i + 1][1]) < 0.08) return true;
    return false;
  };
  const tuftHits = skin.scatter(260, {
    rng: R,
    minDist: 0.075,
    filter: (h) => h.n.y > 0.85 && h.at.y > 1.45 && !blocked(h.at.x, h.at.z),
  });
  const tuftFlows = tuftHits.map(() => {
    const a = R() * Math.PI * 2;
    return [Math.cos(a), -0.2, Math.sin(a)] as P3;
  });
  b.cards(tuftHits, TUFT, {
    size: [0.1, 0.11],
    lean: 12,
    cross: true,
    vary: 0.4,
    spin: 180,
    rng: R,
    bone: base,
    flow: (_f, i) => tuftFlows[i],
  });
  const flowerSpots = skin.scatter(90, {
    rng: R,
    minDist: 0.1,
    filter: (h) => h.n.y > 0.85 && h.at.y > 1.45 && !blocked(h.at.x, h.at.z),
  });
  const cecFrames = flowerSpots.slice(0, 40);
  const daisyFrames = flowerSpots.slice(40);
  glow(
    b.cards(cecFrames, CECILIA, { size: [0.07, 0.1], lean: 5, cross: true, vary: 0.3, spin: 180, rng: R, bone: base, flow: [0, -0.1, 1] }),
    0.6,
  );
  b.cards(daisyFrames, DAISY, { size: [0.07, 0.1], lean: 5, cross: true, vary: 0.3, spin: 180, rng: R, bone: base, flow: [0, -0.1, 1] });
  // flowers around the shrine steps and pond
  const extraFlowers: ReturnType<typeof frame>[] = [];
  for (const [x, z] of [
    [-0.3, 0.36],
    [-0.7, 0.34],
    [-0.1, 0.44],
    [0.4, 0.05],
    [0.3, 0.1],
    [0.0, -0.1],
    [0.38, 0.6],
    [0.5, 0.5],
  ] as const)
    extraFlowers.push(frame([x, gy(x, z) - 0.005, z], [0, 1, 0]));
  glow(b.cards(extraFlowers, CECILIA, { size: [0.075, 0.11], lean: 5, cross: true, vary: 0.25, spin: 180, rng: R, bone: base, flow: [0, -0.1, 1] }), 0.6);

  return b.root;
}
