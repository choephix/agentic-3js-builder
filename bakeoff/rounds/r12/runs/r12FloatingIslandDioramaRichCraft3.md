```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  svg,
  paint,
  mottle,
  grain,
  patches,
  noise,
  mix,
  smoothstep,
  catmull,
  arc,
  frame,
} from "agentic-3js-builder";
import { cel, zigzag } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Sky Island of the Wind",
  description:
    "A Genshin-style floating sky island: grassy cap over striated rock with glowing crystals, a ruined wind-shrine with an arch and orb altar, a stream that spills into a waterfall, sakura, oak and pine trees, flowers, vines and drifting fragments.",
};

type Col = string | ReturnType<typeof cel>;
type Pt = [number, number, number];

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const O = (pts: [number, number][]) => pts;
const sc = (pts: [number, number][], s: number): [number, number][] => pts.map(([x, y]) => [x * s, y * s]);

export default function build() {
  const b = createBuilder({ name: "skyIsland" });
  b.joint("root", { at: [0, 0, 0] });

  const R = rng(2024);
  const rr = (lo: number, hi: number) => lo + (hi - lo) * R();

  // ------------------------------------------------------------------ palette
  const TOP = 3.3;
  const TEAL = "#4fe9d9";
  const TEAL_PALE = "#b9fff4";
  const GOLD = "#e8c25a";
  const WATER = "#6fdcf0";

  const GRASS = cel(mottle("#79c94f", "#a2dc63", { size: 0.55, seed: 4 }));
  const DIRT = cel(mottle("#b98c5e", "#a67a50", { size: 0.2, seed: 8 }));
  const rockBase = paint((p, n) => {
    const band = Math.sin(p.y * 8 + noise(p, 0.7, 2) * 6);
    let c = mix("#aaa4ba", "#8a8599", smoothstep(-0.5, 0.7, band));
    c = mix(c, "#c9b9a0", 0.35 * smoothstep(0.55, 0.95, noise(p, 0.45, 9)));
    const moss = smoothstep(TOP - 1.1, TOP - 0.3, p.y) * smoothstep(0.45, 0.75, noise(p, 0.35, 5));
    c = mix(c, "#78b866", moss * 0.85 * smoothstep(-0.6, 0.2, n.y + 0.4));
    return c;
  });
  const ROCK = cel(rockBase, undefined, { threshold: -0.05 });
  const STONE = cel(mottle("#e6dfca", "#d3cbb3", { size: 0.22, seed: 5 }));
  const STONE2 = cel(mottle("#c4bca6", "#b2aa94", { size: 0.2, seed: 6 }));
  const TILE = cel(patches("#bdb59f", ["#e9e2cd", "#ded6bf", "#e3dbc4"], { size: 0.28, gap: 0.07, seed: 3 }));
  const COLUMN = cel(grain("#ece5d0", "#d2cab2", { size: 0.035, axis: "y", seed: 2 }));
  const MOSS = cel("#6fb85a");
  const WOOD = cel(grain("#8a6350", "#6a4a3c", { size: 0.05, axis: "y", seed: 3 }));
  const PINK = cel(mottle("#ffb6d0", "#ffd0e2", { size: 0.5, seed: 12 }));
  const PINK2 = cel(mottle("#ffc9dc", "#ffe3ee", { size: 0.4, seed: 13 }));
  const LEAFG = cel(mottle("#4fb563", "#7bd36f", { size: 0.5, seed: 14 }));
  const LEAFG2 = cel(mottle("#6fcc72", "#97e382", { size: 0.4, seed: 15 }));
  const PINE = cel(mottle("#2b946a", "#47b97e", { size: 0.4, seed: 16 }));
  const CLOUD = cel("#ffffff", "#c9def2");
  const CARDTINT = mottle("#62b845", "#a8e063", { size: 0.5, seed: 4 });

  const sv = new THREE.Vector3();
  const WATERFALL = paint((_p, _n, s) => {
    sv.set(s[0] * 14, s[1] * 0.8, 0.3);
    const streak = noise(sv, 1, 11);
    const foam = smoothstep(-0.35, -0.05, s[1]);
    const base = mix("#5fd3ee", "#bff3ff", smoothstep(0.35, 0.7, streak));
    return mix(base, "#ffffff", Math.max(foam * 0.85, smoothstep(-2.2, -2.6, s[1]) * 0.6));
  });

  function capPaint(top: number, cx = 0, cz = 0, k = 1) {
    return paint((p, n) => {
      const a = Math.atan2(p.x - cx, p.z - cz);
      const line = top - k * (0.1 + 0.2 * zigzag((a * 19) / TAU) + 0.06 * noise(p, 0.3, 3));
      return n.y > 0.7 || p.y > line ? GRASS : DIRT;
    });
  }

  // ------------------------------------------------------------------ textures
  const TUFT = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8c8c8c"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <g fill="url(#g)">
      <path d="M6 64 Q8 30 2 6 Q14 28 16 64Z"/>
      <path d="M14 64 Q16 24 20 0 Q26 26 26 64Z"/>
      <path d="M24 64 Q28 34 38 10 Q34 40 34 64Z"/>
      <path d="M11 64 Q14 40 10 24 Q20 44 18 64Z"/>
    </g></svg>`,
    { size: 128 },
  );

  const flowerSvg = (petal: string, edge: string, center: string) =>
    svg(
      `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 48 L20 22" stroke="#4f9f3f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="14" cy="38" rx="6" ry="2.6" transform="rotate(-30 14 38)" fill="#6dbb4f"/>
      <g fill="${petal}" stroke="${edge}" stroke-width="1">
        <ellipse cx="20" cy="8" rx="5" ry="8" transform="rotate(0 20 16)"/>
        <ellipse cx="20" cy="8" rx="5" ry="8" transform="rotate(72 20 16)"/>
        <ellipse cx="20" cy="8" rx="5" ry="8" transform="rotate(144 20 16)"/>
        <ellipse cx="20" cy="8" rx="5" ry="8" transform="rotate(216 20 16)"/>
        <ellipse cx="20" cy="8" rx="5" ry="8" transform="rotate(288 20 16)"/>
      </g>
      <circle cx="20" cy="16" r="4.2" fill="${center}"/></svg>`,
      { size: 96 },
    );
  const FLOWER = flowerSvg("#ffffff", "#e9d4e4", "#ffd25a");
  const CECILIA = flowerSvg("#9ff0ff", "#4fc6e8", "#ffffff");

  const LEAF = svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="l" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#a8a8a8"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <path d="M16 48 Q0 30 16 0 Q32 30 16 48Z" fill="url(#l)"/>
    <path d="M16 46 L16 8" stroke="#b4b4b4" stroke-width="2" stroke-linecap="round"/></svg>`,
    { size: 96 },
  );
  const PETAL = svg(
    `<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 32 Q-3 16 9 0 L12 4 L15 0 Q27 16 12 32Z" fill="#ffffff"/>
    <path d="M12 30 L12 10" stroke="#dcdcdc" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    { size: 96 },
  );
  const VINE = svg(
    `<svg viewBox="0 0 24 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 96 Q6 70 14 50 Q20 30 12 4" fill="none" stroke="#4d8f3c" stroke-width="3" stroke-linecap="round"/>
    <g fill="#7cc855" stroke="#3f7a35" stroke-width="1">
      <ellipse cx="6" cy="76" rx="6" ry="3.5" transform="rotate(-30 6 76)"/>
      <ellipse cx="19" cy="62" rx="6" ry="3.5" transform="rotate(30 19 62)"/>
      <ellipse cx="8" cy="48" rx="6" ry="3.5" transform="rotate(-35 8 48)"/>
      <ellipse cx="19" cy="34" rx="6" ry="3.5" transform="rotate(30 19 34)"/>
      <ellipse cx="8" cy="20" rx="5" ry="3" transform="rotate(-35 8 20)"/>
      <ellipse cx="13" cy="6" rx="4" ry="3" transform="rotate(10 13 6)"/>
    </g></svg>`,
    { size: 192 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#5ff2e2" stroke-width="3" stroke-linecap="round">
      <circle cx="50" cy="50" r="46"/>
      <circle cx="50" cy="50" r="38" stroke-dasharray="2 5"/>
      <circle cx="50" cy="50" r="27" stroke-width="2"/>
      <path d="M50 50 C50 38 60 32 69 37 C74 40 74 47 70 50"/>
      <path d="M50 50 C50 38 60 32 69 37 C74 40 74 47 70 50" transform="rotate(90 50 50)"/>
      <path d="M50 50 C50 38 60 32 69 37 C74 40 74 47 70 50" transform="rotate(180 50 50)"/>
      <path d="M50 50 C50 38 60 32 69 37 C74 40 74 47 70 50" transform="rotate(270 50 50)"/>
    </g>
    <g fill="#b9fff4">
      <circle cx="50" cy="50" r="4"/>
      <path d="M50 2 L53 8 L50 14 L47 8Z"/>
      <path d="M50 2 L53 8 L50 14 L47 8Z" transform="rotate(90 50 50)"/>
      <path d="M50 2 L53 8 L50 14 L47 8Z" transform="rotate(180 50 50)"/>
      <path d="M50 2 L53 8 L50 14 L47 8Z" transform="rotate(270 50 50)"/>
    </g></svg>`,
    { size: 512 },
  );
  const TABLET = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#5ff2e2" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="10" r="6"/><path d="M20 4 V16 M14 10 H26"/>
      <path d="M8 26 L20 20 L32 26"/><path d="M8 34 Q14 28 20 34 T32 34"/>
      <path d="M10 44 H30 M10 50 H22 M26 50 H30"/>
      <path d="M20 54 L25 60 L15 60Z"/>
    </g></svg>`,
    { size: 256 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(180 30 60)">
      <path d="M3 0 H57 V98 L30 118 L3 98Z" fill="#2d8e9e" stroke="#e8c25a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M9 6 H51 V92 L30 108 L9 92Z" fill="none" stroke="#bff3ee" stroke-width="1.6"/>
      <g fill="none" stroke="#f3d878" stroke-width="3" stroke-linecap="round">
        <path d="M30 52 C30 40 40 34 46 40 C50 44 48 50 43 51"/>
        <path d="M30 52 C30 64 20 70 14 64 C10 60 12 54 17 53"/>
        <circle cx="30" cy="52" r="3" fill="#f3d878"/>
      </g>
      <path d="M30 14 L34 22 L30 30 L26 22Z" fill="#f3d878"/>
    </g></svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------ terrain helper
  const HILLS = [
    { x: 1.5, z: -1.3, r: 1.0, h: 0.42 },
    { x: -2.1, z: -1.0, r: 0.7, h: 0.3 },
    { x: 2.0, z: 0.9, r: 0.7, h: 0.22 },
    { x: -0.4, z: -2.0, r: 0.8, h: 0.2 },
  ];
  const gy = (x: number, z: number) => {
    let y = TOP;
    for (const h of HILLS) {
      const k = 1 - ((x - h.x) ** 2 + (z - h.z) ** 2) / (h.r * h.r);
      if (k > 0) y = Math.max(y, TOP + h.h * Math.sqrt(k));
    }
    return y;
  };
  const P = (x: number, z: number, dy = 0): Pt => [x, gy(x, z) + dy, z];

  // ------------------------------------------------------------------ island body
  const body = b.lathe(
    O([
      [0, 0],
      [0.18, 0.12],
      [0.42, 0.5],
      [0.7, 0.85],
      [0.62, 1.25],
      [1.1, 1.55],
      [1.45, 1.95],
      [1.35, 2.3],
      [2.0, 2.6],
      [2.55, 2.85],
      [2.95, 3.05],
      [3.0, TOP - 0.1],
      [0, TOP - 0.1],
    ]),
    { at: [0, 0, 0], segments: 10, color: ROCK },
  );
  const cap = b.lathe(
    O([
      [0, TOP],
      [2.75, TOP],
      [3.12, TOP - 0.06],
      [3.18, TOP - 0.22],
      [3.1, TOP - 0.42],
      [2.98, TOP - 0.55],
      [0, TOP - 0.55],
    ]),
    { at: [0, 0, 0], segments: 22, color: capPaint(TOP) },
  );
  const hillParts = HILLS.map((h) =>
    b.part(new THREE.SphereGeometry(1, 14, 6, 0, TAU, 0, Math.PI / 2), GRASS, {
      at: [h.x, TOP - 0.01, h.z],
      scale: [h.r, h.h, h.r],
    }),
  );

  // underside rocks, stalactites
  const skin = b.surface(body);
  for (const h of skin.scatter(16, { rng: rng(31), minDist: 0.55, filter: (q) => q.at.y < TOP - 0.9 && q.n.y < 0.5 })) {
    const s = rr(0.14, 0.34);
    b.stick(new THREE.DodecahedronGeometry(1, 0), ROCK, h, {
      scale: [s * 1.2, s, s * 1.1],
      embed: 0.35,
      spin: rr(0, 360),
      flat: true,
    });
  }
  for (const h of skin.scatter(9, { rng: rng(32), minDist: 0.6, filter: (q) => q.n.y < -0.1 && q.at.y > 0.3 })) {
    const s = rr(0.12, 0.2);
    b.stick(new THREE.ConeGeometry(1, 1, 6), ROCK, h, { scale: [s, rr(0.4, 0.8), s], embed: 0.15, flat: true });
  }

  // glowing crystal clusters
  const crystalGeo = () => new THREE.OctahedronGeometry(1, 0).translate(0, 1, 0);
  function crystals(az: number, el: number, n: number, big: number) {
    const hit = skin.around([0, 1.7, 0]).at(az, el);
    if (!hit) return;
    for (let i = 0; i < n; i++) {
      const s = big * rr(0.55, 1);
      const d = new THREE.Vector3(hit.n.x + rr(-0.7, 0.7), hit.n.y + rr(-0.4, 0.5), hit.n.z + rr(-0.7, 0.7)).normalize();
      const at = hit.at.clone().addScaledVector(hit.n, -0.04);
      glow(
        b.part(crystalGeo(), i % 2 ? TEAL_PALE : TEAL, { at, dir: d, scale: [s * 0.3, s, s * 0.3], flat: true }),
        1.3,
      );
    }
  }
  crystals(30, -25, 4, 0.34);
  crystals(-120, -30, 4, 0.3);
  crystals(170, -22, 3, 0.3);
  crystals(95, -45, 3, 0.24);
  crystals(-40, -55, 3, 0.2);
  crystals(0, -75, 3, 0.2);

  // hanging vines on the rim
  const capSkin = b.surface(cap);
  const vineHits = capSkin.scatter(36, { rng: rng(41), minDist: 0.3, filter: (h) => h.n.y < 0.35 && h.at.y < TOP - 0.15 });
  b.cards(vineHits, VINE, { size: [0.11, 0.5], lean: 80, flow: [0, -1, 0], vary: 0.35, rng: rng(42) });

  // ------------------------------------------------------------------ layout anchors
  const RC = { x: -0.7, z: 0.35 };
  const POND = { x: 0.95, z: 0.2 };
  const WA = 20 * DEG;
  const rad: Pt = [Math.sin(WA), 0, Math.cos(WA)];
  const tan: Pt = [Math.cos(WA), 0, -Math.sin(WA)];
  const wfAt = (r: number, y: number, t = 0): Pt => [rad[0] * r + tan[0] * t, y, rad[2] * r + tan[2] * t];

  // ------------------------------------------------------------------ stream and pond
  const streamPath = catmull([
    [0.95, TOP + 0.04, 0.62],
    [0.8, TOP + 0.04, 1.2],
    [1.05, TOP + 0.04, 1.8],
    [0.9, TOP + 0.04, 2.35],
    wfAt(3.15, TOP + 0.04),
  ]);
  glow(
    b.sweep(streamPath, (t: number): [number, number] => [0.19 + 0.04 * Math.sin(t * 9) + 0.12 * smoothstep(0.75, 1, t), 0.035], {
      section: "box",
      color: WATER,
      caps: "flat",
    }),
    0.5,
  );
  const streamPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) streamPts.push(streamPath.at(i / 24));
  for (let i = 1; i < 12; i++) {
    const t = i * 0.075;
    const c = streamPath.at(t);
    const tg = streamPath.tangentAt(t);
    const sd = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
    for (const s of [1, -1]) {
      const off = 0.3 + rr(0, 0.1);
      const r = rr(0.04, 0.085);
      b.part(new THREE.DodecahedronGeometry(1, 0), STONE2, {
        at: [c.x + sd.x * off * s, TOP + 0.03, c.z + sd.z * off * s],
        scale: [r * 1.2, r * 0.8, r],
        rotation: [0, rr(0, 180), 0],
        flat: true,
      });
    }
  }

  glow(b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 14), WATER, { at: [POND.x, TOP + 0.03, POND.z] }), 0.5);
  for (let i = 0; i < 13; i++) {
    const a = (i / 13) * TAU;
    const r = rr(0.07, 0.12);
    b.part(new THREE.DodecahedronGeometry(1, 0), i % 3 ? STONE2 : STONE, {
      at: [POND.x + Math.sin(a) * 0.56, TOP + 0.05, POND.z + Math.cos(a) * 0.56],
      scale: [r * 1.3, r, r * 1.1],
      rotation: [0, rr(0, 180), 0],
      flat: true,
    });
  }
  b.part(new THREE.TorusGeometry(0.28, 0.01, 4, 20), "#d8fbff", { at: [POND.x, TOP + 0.065, POND.z], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.16, 0.008, 4, 16), "#d8fbff", { at: [POND.x + 0.1, TOP + 0.065, POND.z - 0.05], rotation: [90, 0, 0] });
  for (const [dx, dz, s] of [
    [-0.22, 0.18, 0.11],
    [0.2, 0.22, 0.09],
    [0.05, -0.28, 0.1],
  ] as number[][]) {
    b.part(new THREE.CylinderGeometry(s, s, 0.012, 8), "#6bcf5e", { at: [POND.x + dx, TOP + 0.066, POND.z + dz] });
  }
  b.part(new THREE.SphereGeometry(0.035, 6, 4), "#ff9fc4", { at: [POND.x - 0.22, TOP + 0.1, POND.z + 0.18] });

  // ------------------------------------------------------------------ waterfall
  b.extrude(
    O([
      [-0.36, 0.06],
      [0.36, 0.06],
      [0.38, -0.8],
      [0.3, -1.8],
      [0.4, -2.45],
      [0.2, -2.62],
      [-0.2, -2.62],
      [-0.4, -2.45],
      [-0.3, -1.8],
      [-0.38, -0.8],
    ]),
    { at: wfAt(3.22, TOP + 0.06), x: [tan[0], 0, tan[2]], y: [0, 1, 0], thickness: 0.1, smoothing: 1, color: WATERFALL },
  );
  glow(
    b.extrude(
      O([
        [-0.22, 0.06],
        [0.22, 0.06],
        [0.2, -1.5],
        [0.12, -2.2],
        [-0.12, -2.2],
        [-0.2, -1.5],
      ]),
      { at: wfAt(3.3, TOP + 0.06), x: [tan[0], 0, tan[2]], y: [0, 1, 0], thickness: 0.05, smoothing: 1, color: "#e8fdff" },
    ),
    0.5,
  );
  for (const t of [-0.3, 0, 0.3]) {
    b.part(new THREE.SphereGeometry(0.11, 7, 5), CLOUD, { at: wfAt(3.2, TOP + 0.1, t), scale: [1, 0.7, 1] });
  }
  for (let i = 0; i < 6; i++) {
    const s = rr(0.26, 0.4);
    b.part(new THREE.SphereGeometry(1, 9, 6), CLOUD, {
      at: wfAt(3.3 + rr(-0.1, 0.25), 0.7 + rr(-0.1, 0.15), rr(-0.4, 0.4)),
      scale: [s, s * 0.7, s],
    });
  }
  for (let i = 0; i < 10; i++) {
    glow(
      b.part(new THREE.CylinderGeometry(0.012, 0.006, rr(0.08, 0.16), 5), "#bff6ff", {
        at: wfAt(3.3 + rr(0, 0.12), rr(0.18, 0.55), rr(-0.35, 0.35)),
      }),
      0.8,
    );
  }

  // ------------------------------------------------------------------ ruins
  function block(x: number, y: number, z: number, w: number, h: number, d: number, ry = 0, color: Col = STONE, moss = 0) {
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y + h / 2, z], rotation: [0, ry, 0] });
    if (moss > 0 && R() < moss)
      b.part(new THREE.BoxGeometry(w * 0.9, 0.035, d * 0.9), MOSS, { at: [x, y + h + 0.012, z], rotation: [0, ry, 0] });
  }
  function rubble(x: number, z: number, n: number, spread: number) {
    for (let i = 0; i < n; i++) {
      const px = x + rr(-spread, spread);
      const pz = z + rr(-spread, spread);
      const r = rr(0.05, 0.12);
      b.part(new THREE.DodecahedronGeometry(1, 0), i % 2 ? STONE : STONE2, {
        at: [px, gy(px, pz) + r * 0.4, pz],
        scale: [r * 1.2, r * 0.8, r],
        rotation: [rr(0, 40), rr(0, 180), rr(0, 40)],
        flat: true,
      });
    }
  }
  function column(x: number, z: number, h: number, broken: boolean) {
    const y = gy(x, z) - 0.04;
    b.part(new THREE.CylinderGeometry(0.3, 0.33, 0.14, 8), STONE2, { at: [x, y + 0.07, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.21, 0.23, h, 8), COLUMN, { at: [x, y + 0.14 + h / 2, z], rotation: [0, rr(0, 45), 0], flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.245, 0.245, 0.04, 8), TEAL, { at: [x, y + 0.14 + h * 0.35, z] }), 1);
    if (!broken) {
      b.part(new THREE.CylinderGeometry(0.26, 0.21, 0.08, 8), STONE2, { at: [x, y + 0.14 + h + 0.04, z], flat: true });
      b.part(new THREE.BoxGeometry(0.54, 0.1, 0.54), STONE2, { at: [x, y + 0.14 + h + 0.13, z], rotation: [0, 8, 0] });
    } else {
      b.part(new THREE.CylinderGeometry(0.15, 0.21, 0.18, 6), COLUMN, {
        at: [x, y + 0.14 + h + 0.07, z],
        rotation: [rr(-12, 12), 0, rr(-12, 12)],
        flat: true,
      });
      rubble(x, z, 3, 0.5);
    }
    b.part(new THREE.SphereGeometry(1, 8, 4, 0, TAU, 0, Math.PI / 2), MOSS, { at: [x, y + 0.02, z], scale: [0.36, 0.07, 0.36] });
  }

  // platform
  const PY = TOP - 0.02;
  b.lathe(O([[0, 0], [1.12, 0], [1.12, 0.11], [0, 0.11]]), { at: [RC.x, PY, RC.z], segments: 14, color: STONE2 });
  b.lathe(O([[0, 0], [0.96, 0], [0.96, 0.09], [0.9, 0.11], [0, 0.11]]), { at: [RC.x, PY + 0.11, RC.z], segments: 14, color: TILE });
  const PTOP = PY + 0.22;
  glow(
    b.part(new THREE.CircleGeometry(0.88, 28), "#ffffff", {
      at: [RC.x, PTOP + 0.006, RC.z],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: EMBLEM,
    }),
    1,
  );
  // chipped edge blocks
  for (let i = 0; i < 6; i++) {
    const a = rr(0, TAU);
    block(RC.x + Math.sin(a) * 1.06, PY, RC.z + Math.cos(a) * 1.06, rr(0.14, 0.24), rr(0.05, 0.1), rr(0.14, 0.22), rr(0, 90), STONE, 0.5);
  }

  // pedestal and orb
  b.lathe(
    O([[0, 0], [0.26, 0], [0.26, 0.06], [0.14, 0.12], [0.12, 0.4], [0.22, 0.52], [0.2, 0.56], [0.1, 0.5], [0, 0.48]]),
    { at: [RC.x, PTOP, RC.z], segments: 8, color: STONE },
  );
  glow(b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 10), TEAL, { at: [RC.x, PTOP + 0.5, RC.z] }), 1.2);
  const orbY = PTOP + 1.02;
  glow(b.part(new THREE.OctahedronGeometry(0.17, 0), "#7ff7ea", { at: [RC.x, orbY, RC.z], scale: [1, 1.5, 1], flat: true }), 1.8);
  glow(b.part(new THREE.OctahedronGeometry(0.07, 0), "#ffffff", { at: [RC.x, orbY, RC.z], scale: [1, 1.5, 1], flat: true }), 2);
  glow(b.part(new THREE.TorusGeometry(0.32, 0.012, 4, 24), TEAL_PALE, { at: [RC.x, orbY, RC.z], rotation: [70, 0, 20] }), 1.2);
  glow(b.part(new THREE.TorusGeometry(0.4, 0.008, 4, 24), TEAL, { at: [RC.x, orbY, RC.z], rotation: [-30, 40, 80] }), 1);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    glow(
      b.part(new THREE.OctahedronGeometry(0.04, 0), i % 2 ? TEAL : TEAL_PALE, {
        at: [RC.x + Math.sin(a) * 0.36, orbY + Math.sin(a * 2) * 0.12, RC.z + Math.cos(a) * 0.36],
        scale: [1, 1.5, 1],
        flat: true,
      }),
      1.4,
    );
  }

  // columns
  column(-1.85, 0.75, 1.35, false);
  column(-1.0, 1.65, 0.85, true);
  column(0.15, 1.6, 0.4, true);
  {
    const fx = -0.4;
    const fz = 2.15;
    const yaw = -15 * DEG;
    b.part(new THREE.CylinderGeometry(0.21, 0.22, 1.0, 8), COLUMN, {
      at: [fx, gy(fx, fz) + 0.2, fz],
      dir: [Math.cos(yaw), 0, Math.sin(yaw)],
      flat: true,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.04, 8), TEAL, {
        at: [fx + Math.cos(yaw) * 0.1, gy(fx, fz) + 0.2, fz + Math.sin(yaw) * 0.1],
        dir: [Math.cos(yaw), 0, Math.sin(yaw)],
      }),
      1,
    );
    b.part(new THREE.BoxGeometry(0.5, 0.1, 0.5), STONE2, {
      at: [fx + Math.cos(yaw) * 0.56, gy(fx, fz) + 0.16, fz + Math.sin(yaw) * 0.56],
      rotation: [0, -yaw / DEG, 0],
    });
    b.part(new THREE.SphereGeometry(1, 8, 4, 0, TAU, 0, Math.PI / 2), MOSS, { at: [fx, gy(fx, fz) + 0.3, fz], scale: [0.4, 0.07, 0.2], rotation: [0, -yaw / DEG, 0] });
  }

  // gate
  function gate(cx: number, cz: number) {
    const y0 = PY;
    const springY = y0 + 1.34;
    for (const s of [-1, 1]) block(cx + s * 0.69, y0, cz, 0.58, 0.14, 0.62, 0, STONE2, 0.6);
    for (let k = 0; k < 3; k++) block(cx - 0.69 + rr(-0.01, 0.01), y0 + 0.14 + k * 0.4, cz, 0.38, 0.4, 0.42, rr(-2, 2), k % 2 ? STONE : STONE2);
    block(cx + 0.69, y0 + 0.14, cz, 0.38, 0.4, 0.42, 1, STONE);
    block(cx + 0.69, y0 + 0.54, cz, 0.38, 0.3, 0.42, -2, STONE2);
    b.part(new THREE.BoxGeometry(0.34, 0.2, 0.38), STONE, { at: [cx + 0.69, y0 + 0.96, cz], rotation: [8, 15, 14] });
    rubble(cx + 0.8, cz + 0.5, 5, 0.45);

    const outline: [number, number][] = [];
    for (let a = 180; a >= 40; a -= 14) outline.push([0.88 * Math.cos(a * DEG), 0.88 * Math.sin(a * DEG)]);
    for (let a = 55; a <= 180; a += 12.5) outline.push([0.5 * Math.cos(a * DEG), 0.5 * Math.sin(a * DEG)]);
    b.extrude(outline, { at: [cx, springY, cz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.42, color: STONE });

    const band: number[][] = [];
    for (let a = 172; a >= 62; a -= 10) band.push([cx + 0.69 * Math.cos(a * DEG), springY + 0.69 * Math.sin(a * DEG), cz + 0.225]);
    glow(b.sweep(catmull(band), 0.024, { color: TEAL }), 1.2);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.85, 0.02), TEAL, { at: [cx - 0.69, y0 + 0.14 + 0.6, cz + 0.215] }), 1.2);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.28, 0.02), TEAL, { at: [cx + 0.69, y0 + 0.14 + 0.2, cz + 0.215] }), 1.2);

    b.part(new THREE.BoxGeometry(0.22, 0.38, 0.5), STONE2, { at: [cx, springY + 0.69, cz] });
    b.part(new THREE.OctahedronGeometry(0.07, 0), GOLD, { at: [cx, springY + 0.7, cz + 0.26], scale: [1, 1.5, 0.4], flat: true });

    // lantern
    b.rod([cx, springY + 0.5, cz], [cx, springY + 0.3, cz], 0.008, "#8b7a4a");
    b.part(new THREE.ConeGeometry(0.09, 0.06, 6), GOLD, { at: [cx, springY + 0.28, cz] });
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.15, 6), "#ffd98a", { at: [cx, springY + 0.18, cz] }), 1.6);
    b.part(new THREE.ConeGeometry(0.07, 0.05, 6), GOLD, { at: [cx, springY + 0.07, cz], rotation: [180, 0, 0] });

    // vines on arch
    const vf = [100, 112, 126, 140, 155, 166].map((a) =>
      frame([cx + 0.5 * Math.cos(a * DEG), springY + 0.5 * Math.sin(a * DEG) - 0.02, cz + rr(-0.15, 0.15)], [0, 1, 0]),
    );
    b.cards(vf, VINE, { size: [0.1, 0.38], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: rng(61) });

    // banner on the pillar
    b.part(new THREE.BoxGeometry(0.42, 0.03, 0.04), GOLD, { at: [cx - 0.69, y0 + 1.15, cz + 0.23] });
    b.cards([frame([cx - 0.69, y0 + 1.14, cz + 0.26], [0, 1, 0])], BANNER, { size: [0.3, 0.7], lean: 180, flow: [0, 0, 1] });
  }
  gate(-0.6, -0.65);

  // broken wall
  {
    const heights = [3, 2, 3, 1];
    heights.forEach((n, i) => {
      const x = 0.62 + i * 0.3;
      const z = -0.78;
      let y = gy(x, z) - 0.04;
      for (let k = 0; k < n; k++) {
        const h = rr(0.22, 0.3);
        block(x, y, z, 0.3, h, 0.32, rr(-4, 4), (i + k) % 2 ? STONE : STONE2, k === n - 1 ? 0.8 : 0);
        y += h;
      }
    });
    block(0.77, gy(0.77, -0.78) + 0.78, -0.78, 0.5, 0.12, 0.34, 2, STONE2, 0.7);
    glow(b.part(new THREE.BoxGeometry(0.04, 0.22, 0.02), TEAL, { at: [0.92, gy(0.9, -0.78) + 0.3, -0.6] }), 1.1);
    rubble(1.2, -0.45, 5, 0.3);
  }

  // stele
  {
    const sx = -1.9;
    const sz = -0.05;
    const y = gy(sx, sz);
    block(sx, y - 0.04, sz, 0.6, 0.12, 0.3, 0, STONE2, 0.6);
    b.extrude(
      O([[-0.26, 0], [0.26, 0], [0.26, 0.75], [0, 0.95], [-0.26, 0.75]]),
      { at: [sx, y + 0.08, sz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.14, color: STONE },
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.34, 0.54), "#ffffff", { at: [sx, y + 0.46, sz + 0.075], dir: [0, 0, 1], axis: "z", texture: TABLET }),
      1,
    );
  }

  // stepping stones
  for (const [x, z] of [
    [-0.1, 1.4],
    [0.25, 1.15],
    [-0.45, 1.7],
    [0.55, 0.85],
    [-1.2, -0.05],
    [-1.5, 0.4],
  ] as number[][]) {
    b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.06, 7), STONE, { at: [x, gy(x, z) + 0.02, z], rotation: [0, rr(0, 90), 0], flat: true });
  }

  // standing banner
  {
    const px = 2.05;
    const pz = 0.3;
    const y = gy(px, pz);
    b.part(new THREE.CylinderGeometry(0.03, 0.04, 1.65, 6), WOOD, { at: [px, y + 0.8, pz], flat: true });
    b.part(new THREE.BoxGeometry(0.55, 0.035, 0.035), GOLD, { at: [px, y + 1.5, pz] });
    b.part(new THREE.SphereGeometry(0.055, 8, 6), GOLD, { at: [px, y + 1.68, pz] });
    for (const s of [-1, 1]) b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { at: [px + s * 0.28, y + 1.5, pz] });
    b.cards([frame([px, y + 1.49, pz + 0.03], [0, 1, 0])], BANNER, { size: [0.44, 0.98], lean: 180, flow: [0, 0, 1] });
  }

  // ------------------------------------------------------------------ trees
  function canopy(base: Pt, blobs: number[][], cols: Col[], tex: ReturnType<typeof svg>, tint: string, nCards: number, seed: number) {
    const parts = blobs.map(([dx, dy, dz, r], i) =>
      b.part(new THREE.IcosahedronGeometry(1, 1), cols[i % cols.length], {
        at: [base[0] + dx, base[1] + dy, base[2] + dz],
        scale: [r * 1.08, r * 0.85, r * 1.08],
        rotation: [0, i * 47, 0],
        flat: true,
      }),
    );
    const hits = b.surface(parts).scatter(nCards, { rng: rng(seed), minDist: 0.16, filter: (h) => h.n.y > -0.25 });
    b.cards(hits, tex, { size: [0.2, 0.24], lean: 35, vary: 0.3, spin: 180, rng: rng(seed + 1), color: tint });
    return parts;
  }

  // sakura
  {
    const base = P(1.5, -1.3, -0.08);
    const at = (dx: number, dy: number, dz: number): Pt => [base[0] + dx, base[1] + dy, base[2] + dz];
    b.sweep(catmull([at(0, 0, 0), at(0, 0.5, 0.05), at(0.12, 1.0, 0), at(0.05, 1.5, -0.1)]), [0.2, 0.08], { color: WOOD, sides: 7, smooth: false });
    for (const tip of [at(0.7, 1.55, 0.2), at(-0.5, 1.45, -0.1), at(0.1, 1.6, 0.55)]) {
      b.sweep(catmull([at(0.1, 0.95, 0), [(base[0] + 0.1 + tip[0]) / 2, tip[1] - 0.25, (base[2] + tip[2]) / 2], tip]), [0.06, 0.03], { color: WOOD, sides: 6, smooth: false });
    }
    canopy(
      base,
      [
        [0, 1.9, 0, 0.85],
        [0.7, 1.75, 0.2, 0.62],
        [-0.65, 1.65, -0.1, 0.6],
        [0.15, 1.6, 0.6, 0.55],
        [-0.2, 2.3, 0.1, 0.55],
        [0.4, 2.2, -0.35, 0.5],
        [-0.3, 1.7, -0.55, 0.5],
      ],
      [PINK, PINK2, PINK],
      PETAL,
      "#ffc4da",
      60,
      71,
    );
    const pf: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 22; i++) {
      const a = rr(0, TAU);
      const r = rr(0.2, 1.6);
      pf.push(frame([base[0] + Math.sin(a) * r, base[1] + rr(0.2, 2.2), base[2] + Math.cos(a) * r], [0, 1, 0]));
    }
    b.cards(pf, PETAL, { size: 0.1, lean: 90, mirror: true, color: "#ffc2d9", flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)] });
  }

  // oak
  {
    const base = P(-1.6, 1.9, -0.06);
    const at = (dx: number, dy: number, dz: number): Pt => [base[0] + dx, base[1] + dy, base[2] + dz];
    b.sweep(catmull([at(0, 0, 0), at(0, 0.5, 0), at(0.05, 1.0, 0.05), at(0, 1.4, 0)]), [0.23, 0.12], { color: WOOD, sides: 7, smooth: false });
    canopy(
      base,
      [
        [0, 1.9, 0, 0.8],
        [0.6, 1.65, 0.1, 0.55],
        [-0.55, 1.7, 0, 0.55],
        [0.05, 1.7, 0.55, 0.5],
        [0, 1.65, -0.5, 0.5],
        [0.1, 2.4, 0, 0.45],
      ],
      [LEAFG, LEAFG2, LEAFG],
      LEAF,
      "#6fcf70",
      50,
      81,
    );
  }

  // pines
  function pine(x: number, z: number, h: number) {
    const y = gy(x, z) - 0.04;
    b.part(new THREE.CylinderGeometry(0.06, 0.09, 0.5, 6), WOOD, { at: [x, y + 0.25, z], flat: true });
    for (let i = 0; i < 4; i++) {
      const k = 1 - i * 0.2;
      b.part(new THREE.ConeGeometry(0.62 * k * (h / 2), (h / 2) * 0.62, 7), PINE, {
        at: [x, y + 0.4 + i * h * 0.17 + 0.2, z],
        rotation: [0, i * 25, 0],
        flat: true,
      });
    }
    b.part(new THREE.ConeGeometry(0.1, 0.25, 6), PINE, { at: [x, y + 0.4 + 4 * h * 0.17 + 0.1, z], flat: true });
  }
  pine(-2.15, -0.95, 2.2);
  pine(-1.7, -1.6, 1.7);
  pine(-0.9, -2.2, 1.3);

  // bushes
  function bush(x: number, z: number, s: number, flowers = false) {
    const y = gy(x, z);
    for (let i = 0; i < 3; i++) {
      const r = s * rr(0.6, 1);
      b.part(new THREE.IcosahedronGeometry(1, 1), i % 2 ? LEAFG2 : LEAFG, {
        at: [x + rr(-0.5, 0.5) * s, y + r * 0.35, z + rr(-0.5, 0.5) * s],
        scale: [r, r * 0.75, r],
        flat: true,
      });
    }
    if (flowers)
      for (let i = 0; i < 5; i++)
        b.part(new THREE.SphereGeometry(0.03, 5, 4), i % 2 ? "#ffffff" : "#ff9fc4", {
          at: [x + rr(-0.5, 0.5) * s, y + s * rr(0.4, 0.8), z + rr(-0.5, 0.5) * s],
        });
  }
  bush(2.1, 1.6, 0.28, true);
  bush(2.0, -0.1, 0.22);
  bush(-0.5, 2.6, 0.26, true);
  bush(0.3, -1.7, 0.3);
  bush(-1.3, -1.9, 0.24, true);
  bush(2.45, 0.7, 0.2);

  // boulders
  for (const [x, z, s] of [
    [2.4, 1.0, 0.2],
    [-2.5, 0.2, 0.17],
    [0.6, 2.4, 0.15],
    [-0.1, -1.3, 0.18],
    [1.9, 2.0, 0.16],
  ] as number[][]) {
    b.part(new THREE.DodecahedronGeometry(1, 0), STONE2, {
      at: [x, gy(x, z) + s * 0.4, z],
      scale: [s * 1.3, s, s * 1.1],
      rotation: [0, rr(0, 180), 0],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 7, 4, 0, TAU, 0, Math.PI / 2), MOSS, { at: [x, gy(x, z) + s * 0.75, z], scale: [s * 0.9, s * 0.2, s * 0.8] });
  }

  // ------------------------------------------------------------------ grass, flowers
  const blockers = [
    { x: RC.x, z: RC.z, r: 1.3 },
    { x: POND.x, z: POND.z, r: 0.72 },
    { x: -0.6, z: -0.65, r: 0.95 },
    { x: 1.0, z: -0.75, r: 0.7 },
    { x: -1.85, z: 0.75, r: 0.4 },
    { x: -1.0, z: 1.65, r: 0.4 },
    { x: 0.15, z: 1.6, r: 0.4 },
    { x: -0.4, z: 2.15, r: 0.7 },
    { x: -1.9, z: -0.05, r: 0.45 },
    { x: 1.5, z: -1.3, r: 0.3 },
    { x: -1.6, z: 1.9, r: 0.3 },
    { x: -2.15, z: -0.95, r: 0.3 },
    { x: -1.7, z: -1.6, r: 0.3 },
    { x: -0.9, z: -2.2, r: 0.3 },
    { x: 2.05, z: 0.3, r: 0.2 },
  ];
  const clear = (x: number, z: number) => {
    if (Math.hypot(x, z) > 2.95) return false;
    for (const k of blockers) if (Math.hypot(x - k.x, z - k.z) < k.r) return false;
    for (const s of streamPts) if (Math.hypot(x - s.x, z - s.z) < 0.34) return false;
    return true;
  };
  const grassSkin = b.surface([cap, ...hillParts]);
  const onTop = (h: { n: THREE.Vector3; at: THREE.Vector3 }) => h.n.y > 0.75 && h.at.y > TOP - 0.05 && clear(h.at.x, h.at.z);
  const tufts = grassSkin.scatter(130, { rng: rng(51), minDist: 0.1, filter: onTop });
  b.cards(tufts, TUFT, { size: [0.16, 0.24], vary: 0.4, spin: 180, rng: rng(52), color: CARDTINT, cross: true });
  const flowers = grassSkin.scatter(26, { rng: rng(53), minDist: 0.22, filter: onTop });
  b.cards(flowers, FLOWER, { size: [0.14, 0.17], vary: 0.3, spin: 180, rng: rng(54), cross: true });

  const cec: ReturnType<typeof frame>[] = [];
  for (const [x, z] of [
    [-1.5, 1.2],
    [-1.35, 1.0],
    [-1.6, 0.45],
    [-2.2, 0.5],
    [-0.1, -0.1],
    [0.4, 0.3],
    [-1.7, -0.7],
    [-0.2, 1.0],
    [0.3, 2.3],
    [1.5, 0.9],
    [-0.9, 2.0],
    [-2.0, 1.4],
  ] as number[][])
    cec.push(frame(P(x, z, -0.02), [0, 1, 0]));
  glow(b.cards(cec, CECILIA, { size: [0.11, 0.17], vary: 0.3, spin: 180, rng: rng(55), cross: true }), 1.2);

  // ------------------------------------------------------------------ floating fragments
  const FR_ROCK = O([[0, 0], [0.18, 0.18], [0.45, 0.42], [0.58, 0.66], [0.62, 0.8], [0, 0.8]]);
  const FR_CAP = O([[0, 0.8], [0.52, 0.8], [0.68, 0.76], [0.68, 0.66], [0, 0.66]]);
  function fragment(x: number, y: number, z: number, s: number, deco: (top: number) => void) {
    b.lathe(sc(FR_ROCK, s), { at: [x, y, z], segments: 7, color: ROCK });
    b.lathe(sc(FR_CAP, s), { at: [x, y, z], segments: 10, color: capPaint(y + 0.8 * s, x, z, s) });
    glow(b.part(crystalGeo(), TEAL, { at: [x, y + 0.03, z], dir: [0.2, -1, 0.1], scale: [0.09 * s, 0.32 * s, 0.09 * s], flat: true }), 1.3);
    deco(y + 0.8 * s);
  }
  const miniTree = (x: number, z: number, top: number, s: number) => {
    b.part(new THREE.CylinderGeometry(0.03 * s, 0.045 * s, 0.4 * s, 6), WOOD, { at: [x, top + 0.18 * s, z], flat: true });
    b.part(new THREE.IcosahedronGeometry(1, 1), PINK, { at: [x, top + 0.55 * s, z], scale: [0.32 * s, 0.27 * s, 0.32 * s], flat: true });
    b.part(new THREE.IcosahedronGeometry(1, 1), PINK2, { at: [x + 0.12 * s, top + 0.7 * s, z], scale: [0.2 * s, 0.17 * s, 0.2 * s], flat: true });
  };
  fragment(4.2, 2.3, 0.9, 0.9, (top) => miniTree(4.2, 0.9, top, 1));
  fragment(-4.0, 1.2, -0.6, 0.7, (top) => {
    b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8), COLUMN, { at: [-4.0, top + 0.22, -0.6], flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.025, 8), TEAL, { at: [-4.0, top + 0.28, -0.6] }), 1);
    b.part(new THREE.BoxGeometry(0.26, 0.06, 0.26), STONE2, { at: [-4.0, top + 0.5, -0.6] });
  });
  fragment(2.6, 5.0, -2.6, 0.5, (top) => {
    for (let i = 0; i < 3; i++)
      glow(
        b.part(crystalGeo(), i % 2 ? TEAL_PALE : TEAL, {
          at: [2.6 + (i - 1) * 0.08, top - 0.01, -2.6],
          dir: [(i - 1) * 0.3, 1, 0.1],
          scale: [0.05, 0.14 + i * 0.03, 0.05],
          flat: true,
        }),
        1.5,
      );
  });
  fragment(-3.1, 4.4, 1.8, 0.45, (top) => {
    b.cards([frame([-3.1, top, 1.8], [0, 1, 0]), frame([-3.0, top, 1.85], [0, 1, 0])], TUFT, { size: [0.13, 0.2], color: CARDTINT, cross: true });
  });
  fragment(0.4, 1.3, 4.3, 0.45, (top) => {
    b.cards([frame([0.4, top, 4.3], [0, 1, 0])], FLOWER, { size: [0.14, 0.17], cross: true });
  });

  // ------------------------------------------------------------------ clouds and air
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.4;
    const rd = 3.5 + rr(0, 1.0);
    const cy = 0.7 + rr(0, 0.8);
    for (let k = 0; k < 4; k++) {
      const s = rr(0.35, 0.6);
      b.part(new THREE.SphereGeometry(1, 10, 7), CLOUD, {
        at: [Math.sin(a) * rd + rr(-0.5, 0.5), cy + rr(-0.1, 0.2), Math.cos(a) * rd + rr(-0.5, 0.5)],
        scale: [s, s * 0.7, s],
      });
    }
  }
  for (let i = 0; i < 18; i++) {
    const a = rr(0, TAU);
    const rd = rr(3.4, 5);
    const s = rr(0.04, 0.07);
    glow(
      b.part(new THREE.OctahedronGeometry(1, 0), i % 3 ? "#fff2b0" : TEAL, {
        at: [Math.sin(a) * rd, rr(1.2, 6.5), Math.cos(a) * rd],
        scale: [s, s * 1.6, s],
        flat: true,
      }),
      1.5,
    );
  }
  // wind ribbons
  glow(b.sweep(arc([0, 4.4, 0], [4.7, 4.4, 0], [0.12, 1, 0], 210), [0.004, 0.05, 0.004], { color: "#e6fffb", sides: 6 }), 0.7);
  glow(b.sweep(arc([0, 2.4, 0], [0, 2.4, 4.9], [-0.1, 1, 0.1], 160), [0.004, 0.04, 0.004], { color: "#d4fff8", sides: 6 }), 0.7);

  return b.root;
}
```