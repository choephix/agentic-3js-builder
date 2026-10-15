```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  limb,
  svg,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  rgb,
  mottle,
  spots,
  countershade,
  catmull,
} from "agentic-3js-builder";
import type { ColorInput, Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering Warcraft-style treant guardian: gnarled bark body, root feet, branch-fingered hands, a leafy antlered crown, glowing amber eyes and a teal rune sigil, standing on a mossy forest-floor base with a rune stone, mushrooms, a sapling and fireflies.",
};

type V = [number, number, number];
const G = 0.14; // height of the forest-floor base: the treant stands on it
const P = (x: number, y: number, z: number): V => [x, y + G, z];
const DEG = Math.PI / 180;

const C = {
  barkD: "#2a1a10",
  bark: "#5b3b24",
  barkL: "#8d6538",
  moss: "#6f9a2c",
  mossD: "#3f6a1e",
  mossL: "#a8c648",
  leafD: "#1f5a2a",
  leaf: "#3d8a32",
  leafL: "#79b83c",
  gold: "#d9b53c",
  teal: "#4de6d2",
  amber: "#ffc13a",
  tooth: "#e8d9a8",
  dark: "#140a05",
};

export default function build() {
  const b = createBuilder({ name: "treant", paintSize: 2048 });
  const R = rng(2024);
  const attempt = (fn: () => void) => {
    try {
      fn();
    } catch {
      /* optional decoration */
    }
  };

  // ------------------------------------------------------------------ paints
  function bark(seed: number, mossy: number, light: string) {
    const D = rgb(C.barkD);
    const M = rgb(C.bark);
    const L = rgb(light);
    const MS = rgb(C.moss);
    const ML = rgb(C.mossL);
    const MD = rgb(C.mossD);
    return paint((p, n) => {
      const q = new THREE.Vector3(p.x, p.y * 0.3, p.z);
      const c = cells(q, 0.16, seed);
      const furrow = smoothstep(0.03, 0.18, c.d2 - c.d1);
      let col = mix(M, L, 0.15 + 0.55 * smoothstep(0.35, 0.75, noise(p, 0.3, seed + 4)) + 0.25 * c.id);
      col = mix(D, col, 0.2 + 0.8 * furrow);
      const streak = noise(new THREE.Vector3(p.x * 5, p.y * 0.6, p.z * 5), 0.12, seed + 8);
      col = mix(col, D, 0.3 * smoothstep(0.55, 0.8, streak));
      const top = mossy * smoothstep(0.1, 0.7, n.y) * smoothstep(0.36, 0.52, noise(p, 0.24, seed + 3));
      const low = mossy * 0.8 * smoothstep(G + 0.8, G + 0.2, p.y) * smoothstep(0.42, 0.56, noise(p, 0.3, seed + 11));
      const mc = mix(MD, mix(MS, ML, noise(p, 0.1, seed + 6)), 0.3 + 0.7 * smoothstep(0.2, 0.9, n.y));
      col = mix(col, mc, Math.min(1, top + low));
      const sh = 0.74 + 0.3 * smoothstep(-0.8, 0.9, n.y);
      return [
        Math.min(1, col[0] * (sh + 0.05 * n.y)),
        Math.min(1, col[1] * sh),
        Math.min(1, col[2] * (sh - 0.04 * n.y)),
      ];
    });
  }
  const BARK_TRUNK = bark(1, 1, C.barkL);
  const BARK_LIMB = bark(2, 0.7, "#946a3a");
  const BARK_DARK = bark(3, 0.2, "#6b4a2c");
  const BARK_ROOT = bark(4, 0.6, "#7a5632");
  const BARK_HEAD = bark(6, 0.5, "#a07a48");
  const BARK_RIDGE = bark(5, 1, "#a47c46");
  const MOSS = mottle(C.mossD, C.moss, { size: 0.12, seed: 12 });
  const VINE = mottle("#355c1c", "#7aa532", { size: 0.08, seed: 14 });

  const LEAF_PAINT = paint((p, n) => {
    const t = noise(p, 0.35, 21);
    const base = mix(C.leafD, C.leaf, smoothstep(0.25, 0.7, t));
    const hi = mix(base, C.leafL, smoothstep(0.2, 0.95, n.y) * (0.4 + 0.6 * noise(p, 0.15, 22)));
    const gold = 0.55 * smoothstep(0.62, 0.78, noise(p, 0.5, 23));
    const col = mix(hi, C.gold, gold);
    const sh = 0.8 + 0.25 * smoothstep(-0.7, 0.8, n.y);
    return [col[0] * sh, col[1] * sh, col[2] * (sh - 0.05)];
  });
  const BASE_PAINT = paint((p, n) => {
    if (n.y > 0.6) {
      let col = mix(C.mossD, C.moss, smoothstep(0.3, 0.7, noise(p, 0.3, 31)));
      col = mix(col, C.mossL, 0.5 * smoothstep(0.55, 0.8, noise(p, 0.12, 32)));
      const f = cells(p, 0.3, 33);
      if (f.d1 < 0.09 && f.id > 0.72) return f.id > 0.86 ? "#ff9ec4" : "#fff2c8";
      return col;
    }
    const layer = noise(new THREE.Vector3(p.x * 0.4, p.y * 9, p.z * 0.4), 0.3, 35);
    const col = mix("#4a3322", "#6e5030", layer);
    return mix(col, "#7d7a70", smoothstep(0.62, 0.78, noise(p, 0.18, 36)));
  });
  const STONE = paint((p, n) => {
    let col = mix("#59595f", "#9a978c", noise(p, 0.25, 41));
    col = mix(col, "#3d3d44", 0.5 * smoothstep(0.6, 0.8, noise(p, 0.08, 42)));
    const m = smoothstep(0.35, 0.8, n.y) * smoothstep(0.4, 0.6, noise(p, 0.2, 43));
    return mix(col, "#5f8f2a", m * 0.85);
  });
  const SHELF = paint((_p, n) => (n.y > 0.25 ? "#e0802a" : "#f4e2b4"));

  // ---------------------------------------------------------------- textures
  const leafTex = (a: string, c: string, edge: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 48 72"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
      <path d="M24 70 C6 52 4 26 24 2 C44 26 42 52 24 70Z" fill="url(#g)" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M24 68 L24 10 M24 54 L12 42 M24 54 L36 42 M24 38 L14 27 M24 38 L34 27 M24 24 L18 17 M24 24 L30 17" stroke="${vein}" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`,
      { size: 128 },
    );
  const LEAVES = [
    leafTex("#2f7a2e", "#7cc23c", "#1a4a22", "#c8e88a"),
    leafTex("#3f8c34", "#a6d44a", "#1f5a26", "#e6f6a0"),
    leafTex("#6f8a22", "#e0c23c", "#44521a", "#fff0a0"),
  ];
  const STRAND = svg(
    `<svg viewBox="0 0 24 96"><path d="M12 2 C16 20 10 38 16 58 C19 74 16 86 18 96 L6 96 C8 84 5 72 8 58 C11 40 6 22 12 2Z" fill="#6f9a2c" stroke="#35591a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M12 12 C13 36 11 60 12 90" stroke="#b6d65a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="19" cy="44" rx="4" ry="7" fill="#4f8a28" stroke="#35591a" stroke-width="2"/><ellipse cx="5" cy="66" rx="4" ry="7" fill="#4f8a28" stroke="#35591a" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 48 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3b6e1c"/><stop offset="1" stop-color="#b4d85a"/></linearGradient></defs>
    <path d="M6 64 C8 40 6 20 2 6 C14 20 18 42 18 64Z" fill="url(#g)"/><path d="M16 64 C18 36 22 16 26 0 C32 18 32 42 30 64Z" fill="url(#g)"/><path d="M28 64 C30 44 36 28 46 14 C44 34 42 50 40 64Z" fill="url(#g)"/></svg>`,
    { size: 128 },
  );
  let frondLeaflets = "";
  for (let i = 0; i < 9; i++) {
    const y = 88 - i * 9;
    const w = 22 - i * 1.9;
    frondLeaflets += `<path d="M32 ${y} Q${(32 - w * 0.5).toFixed(1)} ${y - 4} ${(32 - w).toFixed(1)} ${y - 11} M32 ${y} Q${(32 + w * 0.5).toFixed(1)} ${y - 4} ${(32 + w).toFixed(1)} ${y - 11}" />`;
  }
  const FERN = svg(
    `<svg viewBox="0 0 64 96" fill="none" stroke-linecap="round"><path d="M32 95 L32 6" stroke="#2f6a26" stroke-width="3.5"/><g stroke="#4aa238" stroke-width="5">${frondLeaflets}</g><g stroke="#9ad45a" stroke-width="1.6">${frondLeaflets}</g></svg>`,
    { size: 192 },
  );
  const BLOSSOM = svg(
    `<svg viewBox="0 0 40 56"><path d="M20 56 C20 44 21 36 20 26" stroke="#3f7a26" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M20 40 C28 38 32 42 33 46 C27 47 22 45 20 40Z" fill="#4f9a30"/>
    <g fill="#ff9ec4" stroke="#b84a7a" stroke-width="1.6"><circle cx="20" cy="12" r="7"/><circle cx="29" cy="19" r="7"/><circle cx="25" cy="29" r="7"/><circle cx="15" cy="29" r="7"/><circle cx="11" cy="19" r="7"/></g>
    <circle cx="20" cy="21" r="5" fill="#ffd95a" stroke="#b8861f" stroke-width="1.4"/></svg>`,
    { size: 128 },
  );
  const EYE = svg(
    `<svg viewBox="0 0 80 50"><defs><radialGradient id="g" cx="0.45" cy="0.5" r="0.6"><stop offset="0" stop-color="#fff6b0"/><stop offset="0.5" stop-color="#ffc83a"/><stop offset="1" stop-color="#e0701a"/></radialGradient></defs>
    <path d="M3 14 Q38 -4 77 22 Q62 48 36 46 Q10 44 3 14Z" fill="${C.dark}"/>
    <path d="M9 17 Q38 6 71 24 Q58 40 36 39 Q16 37 9 17Z" fill="url(#g)"/>
    <ellipse cx="40" cy="25" rx="4.5" ry="11" fill="#2a1204"/>
    <path d="M7 15 Q38 2 74 22" stroke="${C.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="31" cy="22" r="3" fill="#fffbe0"/></svg>`,
    { size: 256 },
  );
  const pol = (r: number, deg: number): string =>
    `${(50 + r * Math.sin(deg * DEG)).toFixed(1)} ${(50 - r * Math.cos(deg * DEG)).toFixed(1)}`;
  let marks = "";
  for (let i = 0; i < 12; i++) {
    const a = i * 30;
    const k = i % 3;
    if (k === 0) marks += `M${pol(38.5, a - 6)} L${pol(41.8, a)} L${pol(38.5, a + 6)} `;
    else if (k === 1) marks += `M${pol(37.5, a)} L${pol(43, a)} M${pol(40, a - 5)} L${pol(40, a + 5)} `;
    else marks += `M${pol(38, a - 5)} L${pol(42, a + 5)} M${pol(38, a + 5)} L${pol(42, a - 5)} `;
  }
  const sigilLines = `<circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="35"/><path d="${marks}"/><path d="M50 68 L50 32 M50 52 L39 41 M50 52 L61 41 M50 44 L43 36 M50 44 L57 36 M50 68 L41 74 M50 68 L59 74"/>`;
  const SIGIL = svg(
    `<svg viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#1fb3a6" stroke-width="6">${sigilLines}</g><g stroke="#d6fff8" stroke-width="2.4">${sigilLines}</g></svg>`,
    { size: 256 },
  );
  const stoneLines = `<path d="M30 18 m-9 0 a9 9 0 1 1 9 9 a4.5 4.5 0 1 1 -4.5 -4.5"/><path d="M30 40 L41 53 L30 66 L19 53Z"/><path d="M18 78 L42 78 M30 78 L30 94 M20 88 L40 88"/>`;
  const STONE_RUNE = svg(
    `<svg viewBox="0 0 60 100" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#1fb3a6" stroke-width="6">${stoneLines}</g><g stroke="#d6fff8" stroke-width="2.4">${stoneLines}</g></svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------- helpers
  const ico = () => new THREE.IcosahedronGeometry(1, 1);
  const blob = (bone: Joint, at: V, r: number | V, color: ColorInput, rot?: V) =>
    b.part(ico(), color, { bone, at, scale: r, rotation: rot ?? [R() * 360, R() * 360, 0], flat: true });
  const branch = (bone: Joint, pts: V[], r0: number, r1: number, color: ColorInput) =>
    b.sweep(catmull(pts), [r0, r1], { bone, color, sides: 6, caps: { start: "round", end: "point" } });
  const hang = (pts: V[], bone: Joint, size: [number, number], seed: number) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      STRAND,
      { size, lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(seed), bone },
    );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: P(0, 1.25, 0) });
  const spine = b.chain("spine", catmull([P(0, 1.45, 0), P(0, 1.95, 0), P(0, 2.5, 0.05), P(0, 2.95, 0.1)]), {
    parent: hips,
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: P(0, 2.95, 0.1), aim: P(0, 3.2, 0.22), role: "neck" });
  const head = b.joint("head", { parent: neck, at: P(0, 3.1, 0.18), aim: P(0, 3.2, 0.7), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 2.99, 0.3), aim: P(0, 2.9, 0.7), role: "jaw" });

  // ------------------------------------------------------------------- trunk
  const trunk = b.loft(
    [
      { at: P(0, 1.0, 0), w: 1.0, h: 0.85 },
      { at: P(0, 1.35, 0), w: 1.3, h: 1.0 },
      { at: P(0, 1.85, -0.02), w: 1.2, h: 0.98 },
      { at: P(0, 2.3, 0.04), w: 1.5, h: 1.1 },
      { at: P(0, 2.7, 0.06), w: 1.7, h: 1.12 },
      { at: P(0, 3.0, 0.1), w: 0.95, h: 0.8 },
    ],
    { bone: [hips, spine], color: BARK_TRUNK },
  );
  const skin = b.surface(trunk);

  attempt(() => {
    for (const a of [0, 40, 80, 120, 240, 280, 320]) {
      b.sweep(trunk.line(a, 0.0).slice(0.08, 0.92), (t) => 0.025 + 0.05 * Math.sin(Math.PI * t), {
        color: BARK_RIDGE,
        sides: 6,
      });
    }
  });

  // bark shingles
  const chunks = skin.scatter(46, {
    rng: rng(31),
    minDist: 0.2,
    filter: (h) => !(h.n.z > 0.45 && Math.abs(h.at.x) < 0.45 && h.at.y > 2.0 + G && h.at.y < 2.85 + G) && h.n.y > -0.4,
  });
  for (const h of chunks) {
    b.stick(new THREE.ConeGeometry(0.1 + R() * 0.05, 0.1, 5), BARK_DARK, h, { embed: 0.4, spin: R() * 360 });
  }

  // chest sigil
  const sigil = b.decal(trunk, SIGIL, { at: P(0, 2.38, 0.62), dir: [0, 0, 1], size: [0.66, 0.66], segments: 14 });
  glow(sigil, 1.3);
  attempt(() => {
    for (const s of [1, -1]) {
      const vein = skin.drape(
        catmull([P(s * 0.28, 2.3, 0.7), P(s * 0.42, 2.0, 0.6), P(s * 0.46, 1.75, 0.5), P(s * 0.34, 1.5, 0.5)]),
        { lift: 0.012 },
      );
      glow(b.sweep(vein, 0.014, { color: C.teal, sides: 5 }), 1.2);
    }
  });

  // belt of vines, gem, leaf skirt
  b.sweep(skin.loop(spine.joints[0], { lift: 0.025 }), 0.05, { color: VINE, sides: 6 });
  const belt2 = skin.loop(P(0, 1.3, 0), { lift: 0.025 });
  b.sweep(belt2, 0.04, { color: VINE, sides: 6 });
  const skirt: V[] = [];
  b.along(belt2, 22, (at) => {
    skirt.push([at.at.x, at.at.y, at.at.z]);
  });
  b.cards(
    skirt.map((p) => frame(p, [0, 1, 0])),
    LEAVES,
    { size: [0.17, 0.3], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rng(41), bone: hips },
  );
  const gemHit = skin.ray([0, 1.45 + G, 3], [0, 0, -1]);
  if (gemHit) {
    glow(b.stick(new THREE.OctahedronGeometry(0.07, 0), C.teal, gemHit, { embed: 0.3 }), 1.4);
  }

  // shelf fungi on the trunk
  attempt(() => {
    const shelves: [number, number, number][] = [
      [90, 1.7, 1],
      [60, 2.05, 0.8],
      [-100, 2.45, 1.1],
      [160, 2.0, 0.9],
      [-150, 1.6, 0.8],
      [130, 2.6, 0.7],
    ];
    for (const [a, y, sc] of shelves) {
      const sa = Math.sin(a * DEG);
      const ca = Math.cos(a * DEG);
      const hit = skin.ray([sa * 3, y + G, ca * 3], [-sa, 0, -ca]);
      if (!hit) continue;
      const at: V = [hit.at.x - hit.n.x * 0.03, hit.at.y, hit.at.z - hit.n.z * 0.03];
      b.part(new THREE.CylinderGeometry(0.17 * sc, 0.14 * sc, 0.045, 8, 1, false, -Math.PI / 2, Math.PI), SHELF, {
        at,
        bone: spine.joints[1],
        rotation: [0, Math.atan2(hit.n.x, hit.n.z) / DEG, 0],
        flat: true,
      });
    }
  });

  // neck
  b.capsule(P(0, 2.85, 0.08), P(0, 3.12, 0.2), 0.28, { color: BARK_HEAD, bone: neck });

  // ------------------------------------------------------------------- head
  const HC = P(0, 3.2, 0.28);
  const skull = b.part(ico(), BARK_HEAD, { bone: head, at: HC, scale: [0.37, 0.38, 0.37], flat: true, rotation: [0, 0, 0] });
  // muzzle, nose, mouth interior
  b.frustumBox(P(0, 3.08, 0.45), P(0, 3.04, 0.78), [0.44, 0.2], [0.34, 0.14], { color: BARK_HEAD, bone: head });
  blob(head, P(0, 3.13, 0.82), [0.1, 0.09, 0.09], BARK_DARK);
  b.part(new THREE.BoxGeometry(0.3, 0.06, 0.3), C.dark, { bone: head, at: P(0, 2.95, 0.5) });
  // lower jaw with tusks
  b.frustumBox(P(0, 2.92, 0.3), P(0, 2.86, 0.7), [0.4, 0.1], [0.3, 0.1], { color: BARK_HEAD, bone: jaw });
  blob(jaw, P(0, 2.84, 0.72), [0.13, 0.08, 0.1], BARK_DARK);
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.14, 6), C.tooth, { bone: jaw, at: P(s * 0.12, 3.0, 0.64), flat: true });
    b.part(new THREE.ConeGeometry(0.02, 0.08, 5), C.tooth, { bone: head, at: P(s * 0.09, 2.93, 0.7), dir: [0, -1, 0], flat: true });
    // cheeks
    blob(head, P(s * 0.27, 3.08, 0.46), 0.13, BARK_DARK);
    // brow
    b.sweep(catmull([P(s * 0.33, 3.38, 0.38), P(s * 0.18, 3.36, 0.59), P(s * 0.03, 3.3, 0.64)]), [0.07, 0.055], {
      bone: head,
      color: BARK_DARK,
      sides: 6,
    });
    // ears: leaf-shaped bark flaps
    b.extrude(
      [
        [0, 0],
        [0.12, 0.1],
        [0.24, 0.14, "sharp"],
        [0.14, -0.02],
        [0.05, -0.1],
      ],
      { at: P(s * 0.34, 3.2, 0.18), x: [s, 0.2, -0.2], y: [0, 1, 0], thickness: 0.035, color: BARK_LIMB, bone: head },
    );
  }
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 24, 5);
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.17, 0.105], mirror: s > 0 }), 1.3);
  }
  // hair of leaves around the head sides
  b.cards(
    skullSkin.scatter(36, { rng: rng(51), minDist: 0.07, filter: (h) => h.n.z < 0.3 && h.n.y > -0.2 }),
    LEAVES,
    { size: [0.1, 0.15], lean: 60, vary: 0.3, spin: 30, rng: rng(52) },
  );

  // beard of roots and moss
  for (let i = 0; i < 9; i++) {
    const u = (i / 8) * 2 - 1;
    const z0 = 0.46 + (1 - Math.abs(u)) * 0.2;
    const st = P(u * 0.2, 2.86, z0);
    const len = 0.45 + (1 - Math.abs(u)) * 0.25 + R() * 0.1;
    branch(
      jaw,
      [st, P(u * 0.24, 2.7, z0 + 0.05), P(u * 0.32, 2.86 - len, z0 + 0.1 + R() * 0.05)],
      0.045,
      0.008,
      i % 2 ? BARK_ROOT : BARK_DARK,
    );
  }
  const beardPts: V[] = [];
  for (let i = 0; i < 12; i++) {
    const u = (i / 11) * 2 - 1;
    beardPts.push(P(u * 0.24, 2.83, 0.4 + (1 - Math.abs(u)) * 0.26));
  }
  hang(beardPts, jaw, [0.1, 0.4], 61);

  // crown: antlers and canopy
  for (const s of [1, -1]) {
    branch(head, [P(s * 0.18, 3.5, -0.02), P(s * 0.4, 3.8, -0.1), P(s * 0.62, 4.05, -0.2), P(s * 0.72, 4.4, -0.2)], 0.08, 0.02, BARK_LIMB);
    branch(head, [P(s * 0.4, 3.8, -0.1), P(s * 0.7, 3.9, 0.02), P(s * 0.92, 4.08, 0.1)], 0.045, 0.012, BARK_LIMB);
    branch(head, [P(s * 0.52, 3.95, -0.18), P(s * 0.4, 4.2, -0.05), P(s * 0.36, 4.45, 0.08)], 0.035, 0.01, BARK_DARK);
  }
  const crownDefs: [V, number][] = [
    [P(0, 3.9, -0.05), 0.52],
    [P(0.5, 3.72, -0.08), 0.4],
    [P(-0.5, 3.72, -0.08), 0.4],
    [P(0.3, 3.78, 0.3), 0.28],
    [P(-0.3, 3.78, 0.3), 0.28],
    [P(0, 3.7, -0.42), 0.42],
    [P(0.72, 3.5, -0.25), 0.3],
    [P(-0.72, 3.5, -0.25), 0.3],
    [P(0.1, 4.15, -0.02), 0.32],
    [P(-0.3, 4.05, 0), 0.26],
    [P(0.92, 4.08, 0.1), 0.2],
    [P(-0.92, 4.08, 0.1), 0.2],
    [P(0.72, 4.4, -0.2), 0.2],
    [P(-0.72, 4.4, -0.2), 0.2],
  ];
  const crown = crownDefs.map(([at, r]) => blob(head, at, [r, r * 0.85, r], LEAF_PAINT));
  b.cards(b.surface(crown).scatter(180, { rng: rng(71), minDist: 0.075 }), LEAVES, {
    size: [0.16, 0.24],
    lean: 50,
    vary: 0.3,
    spin: 40,
    rng: rng(72),
  });
  b.cards(b.surface(crown).scatter(26, { rng: rng(73), minDist: 0.2, filter: (h) => h.n.y > 0.2 }), BLOSSOM, {
    size: [0.1, 0.14],
    lean: 20,
    vary: 0.2,
    rng: rng(74),
  });
  hang(
    [P(-0.6, 3.5, 0.0), P(0.6, 3.5, 0.0), P(-0.35, 3.62, 0.3), P(0.35, 3.62, 0.3), P(0.78, 3.4, -0.2), P(-0.78, 3.4, -0.2)],
    head,
    [0.09, 0.45],
    81,
  );

  // mantle of foliage around the shoulders
  const mantle: ReturnType<typeof blob>[] = [];
  for (const a of [110, 145, 180, 215, 250]) {
    mantle.push(blob(chest, P(Math.sin(a * DEG) * 0.68, 2.98 + R() * 0.1, Math.cos(a * DEG) * 0.55 + 0.05), 0.32, LEAF_PAINT));
  }
  for (const s of [1, -1]) mantle.push(blob(chest, P(s * 0.5, 2.6, -0.55), 0.3, LEAF_PAINT));
  b.cards(b.surface(mantle).scatter(90, { rng: rng(91), minDist: 0.08 }), LEAVES, {
    size: [0.17, 0.25],
    lean: 55,
    vary: 0.3,
    spin: 40,
    rng: rng(92),
  });
  hang(
    [P(0, 2.8, -0.7), P(0.4, 2.7, -0.65), P(-0.4, 2.7, -0.65), P(0.7, 2.7, -0.4), P(-0.7, 2.7, -0.4), P(0.2, 2.55, -0.75), P(-0.2, 2.55, -0.75)],
    chest,
    [0.12, 0.55],
    93,
  );
  // back branches
  for (const s of [1, -1]) {
    branch(chest, [P(s * 0.3, 2.5, -0.45), P(s * 0.55, 2.95, -0.7), P(s * 0.75, 3.4, -0.75)], 0.1, 0.025, BARK_LIMB);
    blob(chest, P(s * 0.76, 3.5, -0.76), [0.24, 0.2, 0.24], LEAF_PAINT);
  }

  // ------------------------------------------------------------------- arms
  const handTips: Joint[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([P(s * 0.85, 2.6, 0), P(s * 1.3, 1.85, 0.12), P(s * 1.5, 1.0, 0.3), P(s * 1.56, 0.72, 0.38)]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
    );
    const hand = arm.tip!;
    handTips.push(hand);
    b.sweep(arm, [0.21, 0.19, 0.15, 0.12], { color: BARK_LIMB, sides: 8 });
    // shoulder burl and mossy cap
    blob(arm.joints[0], P(s * 0.92, 2.82, -0.02), [0.4, 0.3, 0.4], BARK_TRUNK);
    const cap = blob(arm.joints[0], P(s * 0.92, 3.02, -0.02), [0.3, 0.14, 0.3], MOSS);
    b.cards(b.surface(cap).scatter(16, { rng: rng(100 + (s > 0 ? 1 : 2)), minDist: 0.08 }), LEAVES, {
      size: [0.13, 0.2],
      lean: 40,
      vary: 0.3,
      rng: rng(103),
    });
    hang([P(s * 1.1, 2.9, 0.15), P(s * 1.15, 2.85, -0.2), P(s * 0.85, 2.95, 0.3)], arm.joints[0], [0.1, 0.45], 110 + (s > 0 ? 0 : 1));
    // elbow knot and spur
    blob(arm.joints[1], P(s * 1.32, 1.85, 0.1), [0.2, 0.22, 0.2], BARK_DARK);
    b.spike(P(s * 1.36, 1.85, 0.02), [s * 0.5, 0.1, -1], 0.3, 0.06, { color: BARK_DARK, bone: arm.joints[1], sides: 6 });
    // forearm moss cuff
    b.sweep(catmull([P(s * 1.44, 1.3, 0.22), P(s * 1.47, 1.2, 0.24)]), 0.17, { color: MOSS, bone: arm.joints[2], sides: 8 });
    // palm and fingers
    blob(hand, P(s * 1.56, 0.7, 0.38), [0.11, 0.15, 0.17], BARK_LIMB);
    const zo = [-0.12, -0.04, 0.04, 0.12];
    const lens = [0.28, 0.36, 0.36, 0.3];
    for (let k = 0; k < 4; k++) {
      const z0 = 0.38 + zo[k] * 0.9;
      const L = lens[k];
      const f = b.chain(
        `finger${k + 1}${S}`,
        catmull([
          P(s * 1.56, 0.66, z0),
          P(s * 1.58, 0.66 - L * 0.5, z0 + zo[k] * 0.7 + 0.01),
          P(s * 1.6, 0.66 - L, z0 + zo[k] * 1.6 + 0.05),
        ]),
        { parent: hand, role: "digit" },
      );
      b.sweep(f, [0.048, 0.014], { color: k % 2 ? BARK_DARK : BARK_LIMB, sides: 6, caps: { start: "round", end: "point" } });
      b.cards([f.at(0.5)], LEAVES[k % 3], { size: [0.07, 0.11], lean: 60, flow: [s, 0, 0], rng: rng(120 + k) });
    }
    const th = b.chain(
      `thumb${S}`,
      catmull([P(s * 1.5, 0.74, 0.48), P(s * 1.46, 0.66, 0.62), P(s * 1.42, 0.56, 0.74)]),
      { parent: hand, role: "digit" },
    );
    b.sweep(th, [0.052, 0.015], { color: BARK_LIMB, sides: 6, caps: { start: "round", end: "point" } });
  }

  // ------------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const root = P(s * 0.45, 1.25, 0);
    const target: V = P(s * 0.58, 0.22, 0.12);
    const pts = limb(root, target, [0.62, 0.55], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.58, 0, 0.2],
    });
    const ankle = leg.tip!;
    b.sweep(leg, [0.27, 0.2, 0.16], { color: BARK_LIMB, sides: 8 });
    blob(leg.joints[1], [pts[1].x, pts[1].y, pts[1].z + 0.04], [0.22, 0.22, 0.22], BARK_DARK);
    // foot mound
    blob(ankle, P(s * 0.58, 0.12, 0.18), [0.27, 0.14, 0.36], BARK_ROOT, [0, s * 10, 0]);
    // toes
    const spread = [-28, 0, 28];
    for (let i = 0; i < 3; i++) {
      const th = (spread[i] + s * 6) * DEG;
      const dx = Math.sin(th);
      const dz = Math.cos(th);
      const fx = s * 0.58;
      const fz = 0.2;
      const toe = b.chain(
        `toe${i + 1}${S}`,
        catmull([
          P(fx + dx * 0.15, 0.12, fz + dz * 0.15),
          P(fx + dx * 0.4, 0.09, fz + dz * 0.4),
          P(fx + dx * 0.66, 0.045, fz + dz * 0.66),
        ]),
        { parent: ankle, role: "digit" },
      );
      b.sweep(toe, [0.085, 0.028], { color: BARK_ROOT, sides: 6, caps: { start: "round", end: "point" } });
      b.spike(toe.at(1), toe.at(1), 0.09, 0.028, { color: C.tooth, sides: 5 });
    }
    // heel root
    b.sweep(catmull([P(s * 0.58, 0.16, -0.05), P(s * 0.62, 0.09, -0.3), P(s * 0.7, 0.05, -0.5)]), [0.09, 0.03], {
      bone: ankle,
      color: BARK_ROOT,
      sides: 6,
      caps: { start: "round", end: "point" },
    });
  }

  // buttress roots creeping over the ground
  for (const a of [75, 105, 150, 180, 210, 255, 285]) {
    const sa = Math.sin(a * DEG);
    const ca = Math.cos(a * DEG);
    const wob = 0.1 * Math.sin(a);
    b.sweep(
      catmull([
        P(sa * 0.42, 0.95, ca * 0.42),
        P(sa * 0.9, 0.38, ca * 0.9 + wob),
        P(sa * 1.45, 0.11, ca * 1.45 - wob),
        P(sa * 1.85, 0.04, ca * 1.85),
      ]),
      [0.15, 0.09, 0.05, 0.03],
      { bone: hips, color: BARK_ROOT, sides: 6, caps: { start: "round", end: "point" } },
    );
  }

  // ------------------------------------------------------------------- base
  const base = b.lathe(
    [
      [0, 0],
      [2.0, 0],
      [2.08, 0.05],
      [2.02, 0.11],
      [1.92, 0.14],
      [0, 0.14],
    ],
    { at: [0, 0, 0], bone: hips, color: BASE_PAINT, segments: 16 },
  );
  const floor = b.surface(base);
  b.cards(
    floor.scatter(170, { rng: rng(131), minDist: 0.11, filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 0.95 }),
    GRASS,
    { size: [0.1, 0.18], lean: 12, vary: 0.35, spin: 180, rng: rng(132) },
  );
  b.cards(
    floor.scatter(12, { rng: rng(133), minDist: 0.45, filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 1.1 }),
    FERN,
    { size: [0.4, 0.55], lean: 35, bend: 25, cross: true, vary: 0.25, rng: rng(134) },
  );
  b.cards(
    floor.scatter(26, { rng: rng(135), minDist: 0.25, filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 1.0 }),
    BLOSSOM,
    { size: [0.11, 0.16], lean: 10, vary: 0.25, rng: rng(136), cross: true },
  );

  // rim stones
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 360 + R() * 10;
    const r = 1.88 + R() * 0.08;
    const sz = 0.1 + R() * 0.1;
    b.part(ico(), STONE, {
      bone: hips,
      at: P(Math.sin(a * DEG) * r, 0.02, Math.cos(a * DEG) * r),
      scale: [sz * 1.2, sz * 0.8, sz],
      rotation: [R() * 40, R() * 360, R() * 40],
      flat: true,
    });
  }

  // rune stone
  const yaw = 25 * DEG;
  const stoneAt = P(-1.3, 0, -0.9);
  const stoneT = 0.22;
  b.extrude(
    [
      [-0.3, 0],
      [0.3, 0],
      [0.32, 0.5],
      [0.2, 0.95, "sharp"],
      [-0.05, 1.12, "sharp"],
      [-0.28, 0.85],
      [-0.34, 0.4],
    ],
    {
      at: stoneAt,
      x: [Math.cos(yaw), 0, -Math.sin(yaw)],
      y: [0, 1, 0],
      thickness: stoneT,
      bevel: 0.03,
      color: STONE,
      bone: hips,
    },
  );
  const sn: V = [Math.sin(yaw), 0, Math.cos(yaw)];
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 0.56), "#ffffff", {
      bone: hips,
      at: [stoneAt[0] + sn[0] * (stoneT / 2 + 0.006), stoneAt[1] + 0.52, stoneAt[2] + sn[2] * (stoneT / 2 + 0.006)],
      dir: sn,
      axis: "z",
      texture: STONE_RUNE,
    }),
    1.2,
  );
  b.part(ico(), MOSS, {
    bone: hips,
    at: [stoneAt[0], stoneAt[1] + 1.0, stoneAt[2]],
    scale: [0.22, 0.07, 0.17],
    flat: true,
  });

  // fallen log
  const logA: V = P(0.1, 0.13, -1.55);
  const logB: V = P(1.35, 0.13, -1.05);
  b.rod(logA, logB, 0.14, { color: BARK_LIMB, bone: hips, sides: 7 });
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.02, 8), "#c9a06a", {
    bone: hips,
    at: logB,
    dir: [logB[0] - logA[0], 0, logB[2] - logA[2]],
  });
  b.part(ico(), MOSS, { bone: hips, at: P(0.7, 0.28, -1.3), scale: [0.4, 0.06, 0.12], rotation: [0, -22, 0], flat: true });

  // mushrooms
  function mushroom(x: number, z: number, h: number, r: number, cap: ColorInput, lit = false) {
    const top: V = [x, G + h, z];
    b.rod([x, G - 0.01, z], top, [r * 0.3, r * 0.22], { color: "#efe2c2", bone: hips, sides: 6 });
    const c = b.lathe(
      [
        [0, 0],
        [r * 0.95, 0],
        [r, 0.015],
        [r * 0.8, r * 0.45],
        [r * 0.4, r * 0.7],
        [0, r * 0.78],
      ],
      { at: top, bone: hips, color: cap, segments: 9 },
    );
    if (lit) glow(c, 1.4);
  }
  mushroom(-1.05, 1.25, 0.18, 0.13, spots("#c8352b", "#fff1d6", { size: 0.06, amount: 0.55, seed: 3 }));
  mushroom(-0.85, 1.5, 0.12, 0.09, spots("#c8352b", "#fff1d6", { size: 0.05, amount: 0.55, seed: 4 }));
  mushroom(-1.3, 1.05, 0.1, 0.08, spots("#d9892b", "#fff1d6", { size: 0.05, amount: 0.5, seed: 5 }));
  mushroom(0.95, 1.35, 0.14, 0.1, "#59f0d8", true);
  mushroom(1.1, 1.18, 0.09, 0.07, "#59f0d8", true);
  mushroom(1.25, 1.4, 0.07, 0.05, "#59f0d8", true);

  // sapling
  const sap = branch(hips, [P(1.45, 0, -0.45), P(1.48, 0.3, -0.45), P(1.42, 0.55, -0.48)], 0.03, 0.012, BARK_LIMB);
  void sap;
  b.cards(
    [P(1.44, 0.4, -0.46), P(1.42, 0.55, -0.48), P(1.46, 0.28, -0.45)].map((p) => frame(p, [0, 1, 0])),
    LEAVES,
    { size: [0.14, 0.2], lean: 55, flow: [1, 0, 0.3], bone: hips, vary: 0.2, rng: rng(141), cross: true },
  );

  // nest with eggs on the right shoulder
  b.part(new THREE.TorusGeometry(0.12, 0.035, 5, 10), "#6b4a24", {
    bone: handTips[1] ? chest : hips,
    at: P(-0.92, 3.12, -0.02),
    rotation: [90, 0, 0],
    flat: true,
  });
  for (let i = 0; i < 3; i++) {
    const a = i * 120 * DEG;
    b.part(new THREE.SphereGeometry(1, 7, 5), spots("#8ad6e8", "#2f6a88", { size: 0.025, amount: 0.4, seed: 7 + i }), {
      bone: chest,
      at: P(-0.92 + Math.sin(a) * 0.05, 3.14, -0.02 + Math.cos(a) * 0.05),
      scale: [0.04, 0.055, 0.04],
    });
  }

  // fireflies and spores
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.9 + R() * 1.0;
    glow(
      b.part(new THREE.IcosahedronGeometry(0.02 + R() * 0.012, 0), "#d8ff6a", {
        bone: hips,
        at: [Math.sin(a) * r, 0.6 + R() * 3.4 + G, Math.cos(a) * r],
        flat: true,
      }),
      1.6,
    );
  }

  // countershaded accent: moss collar sitting in the cheek ruffs
  b.part(ico(), countershade(MOSS, "#2f4a18"), {
    bone: head,
    at: P(0, 3.0, 0.1),
    scale: [0.34, 0.14, 0.3],
    flat: true,
  });

  return b.root;
}
```