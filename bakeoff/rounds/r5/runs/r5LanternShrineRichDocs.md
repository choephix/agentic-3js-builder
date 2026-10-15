```ts
// @ts-nocheck
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, mottle, scales, stripes, grain, paint, catmull, svg } from "agentic-3js-builder";

export const meta = {
  name: "Roadside Shrine",
  description:
    "Inazuma-style roadside shrine: vermilion torii with shimenawa and paper shide, a small hip-roofed hokora with offering box and bell, stone lanterns, kitsune guardians, offering table, ema rack, paper lanterns, pinwheels and a sacred sakura tree.",
};

export default function build() {
  const b = createBuilder({ name: "roadside_shrine" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------- palette ----------
  const VERM = "#d23a2e", VERM_D = "#a32a24", BLACK_P = "#2b2336";
  const GOLD = "#f0bf48", GOLD_D = "#b98a2c";
  const STONE = "#a3a2b0", STONE_D = "#76758a", STONE_L = "#c4c3d0", MOSS = "#6f9f58";
  const WOOD = "#8f5e3e", WOOD_L = "#bd8a5e", WOOD_D = "#5d3b2c";
  const CREAM = "#f0e4c8", WHITE = "#faf6ec", ROPE = "#dcc98c", ROPE_D = "#a88f55";
  const RED_L = "#e0502f", RED_D = "#8e2a22", GLOW = "#ffd873", DARK = "#2a2030";
  const PINK = "#f4a9c3", PINK_L = "#fbd3e0", PINK_D = "#e784a6", BARK = "#6e4d4f";
  const ROOF = "#3f4768", ROOF_L = "#59628a", ROOF_D = "#2a3050";
  const FOX_W = "#ece8f4", PURPLE = "#8a63c9", ORANGE = "#f08a2a", LEAF = "#4f8f46";
  const GRASS = "#82b85a", GRASS_D = "#5d9a48", EARTH = "#8a6a4a", DANGO_G = "#9fd16c";
  const GY = 0.2; // ground top

  // ---------- paints ----------
  const mossP = mottle(MOSS, "#92b66e", { size: 0.12, seed: 4 });
  const stoneBase = mottle(STONE, STONE_D, { size: 0.22, contrast: 0.6, seed: 2 });
  const stoneP = paint((p) => (p.y < 0.3 ? mossP : stoneBase));
  const pathP = mottle("#cdbd9d", "#a99877", { size: 0.18, seed: 9 });
  const roofP = scales([ROOF, "#48507a"], ROOF_D, { size: 0.15, seed: 3 });
  const woodP = grain(WOOD_L, WOOD, { size: 0.04, axis: "x", seed: 5 });
  const groundP = mottle(GRASS, GRASS_D, { size: 0.7, seed: 3 });
  const ropeP = stripes(ROPE, ROPE_D, { size: 0.05, axis: "x" });

  // ---------- textures ----------
  const crestTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><rect width="64" height="48" fill="#2a2040"/><rect x="2" y="2" width="60" height="44" fill="none" stroke="#f0bf48" stroke-width="2.5"/><g fill="#b58cf0" stroke="#f0bf48" stroke-width="1"><ellipse cx="32" cy="12" rx="4.5" ry="8"/><ellipse cx="32" cy="12" rx="4.5" ry="8" transform="rotate(60 32 24)"/><ellipse cx="32" cy="12" rx="4.5" ry="8" transform="rotate(120 32 24)"/><ellipse cx="32" cy="12" rx="4.5" ry="8" transform="rotate(180 32 24)"/><ellipse cx="32" cy="12" rx="4.5" ry="8" transform="rotate(240 32 24)"/><ellipse cx="32" cy="12" rx="4.5" ry="8" transform="rotate(300 32 24)"/></g><circle cx="32" cy="24" r="4.5" fill="#f0bf48"/></svg>`,
    { size: 128 },
  );
  const foxTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><rect width="64" height="48" fill="#f3e2b8"/><polygon points="12,4 26,16 38,16 52,4 54,28 32,46 10,28" fill="#ec7a2c"/><polygon points="32,46 20,30 26,26 32,32 38,26 44,30" fill="#fff6e6"/><polygon points="16,9 24,16 18,20" fill="#3a2a30"/><polygon points="48,9 40,16 46,20" fill="#3a2a30"/><polygon points="20,22 28,26 22,28" fill="#2a1f2e"/><polygon points="44,22 36,26 42,28" fill="#2a1f2e"/><polygon points="30,38 34,38 32,41" fill="#2a1f2e"/><path d="M3 3H61V45H3Z" fill="none" stroke="#c8332b" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  const sakuraTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><rect width="64" height="48" fill="#e7defa"/><rect x="2" y="2" width="60" height="44" fill="none" stroke="#f0bf48" stroke-width="2.5"/><g fill="#f29ab8"><circle cx="32" cy="14" r="8"/><circle cx="41.5" cy="21" r="8"/><circle cx="38" cy="32" r="8"/><circle cx="26" cy="32" r="8"/><circle cx="22.5" cy="21" r="8"/></g><circle cx="32" cy="24" r="4" fill="#f7d44a"/></svg>`,
    { size: 128 },
  );
  const doorTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 70"><rect width="40" height="70" fill="#f2e6c6"/><g stroke="#6b3f2a" stroke-width="2.2"><path d="M0 1H40M0 18H40M0 35H40M0 52H40M0 69H40M1 0V70M20 0V70M39 0V70"/></g><g stroke="#d23a2e" stroke-width="1.4"><path d="M10 0V70M30 0V70"/></g></svg>`,
    { size: 160 },
  );
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><polygon points="4,32 9,6 14,32" fill="#6fae4f"/><polygon points="11,32 18,0 25,32" fill="#8cc85e"/><polygon points="19,32 27,10 31,32" fill="#5b9944"/></svg>`,
    { size: 64 },
  );

  // ---------- helpers ----------
  let seed = 20240607;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const part = (g, c, x, y, z, o = {}) => b.part(g, c, { at: [x, y, z], flat: true, ...o });
  const box = (w, h, d, c, x, yb, z, o = {}) => part(new THREE.BoxGeometry(w, h, d), c, x, yb + h / 2, z, o);
  const cyl = (rt, rb, h, seg, c, x, yb, z, o = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, yb + h / 2, z, o);
  const ball = (r, c, x, y, z, o = {}, ws = 8, hs = 6) => part(new THREE.SphereGeometry(r, ws, hs), c, x, y, z, o);
  const rod = (a, c2, r, c, o = {}) => b.rod(a, c2, r, c, { sides: 6, ...o });

  const shide = (x, y, z) =>
    b.extrude(
      [[-0.04, 0], [0.04, 0], [0.04, -0.07], [0.09, -0.07], [0.09, -0.14], [0.03, -0.14], [0.03, -0.2], [-0.03, -0.2], [-0.03, -0.14], [-0.09, -0.14], [-0.09, -0.07], [-0.04, -0.07]],
      { at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, color: WHITE },
    );

  const chochin = (x, yTop, z, k) => {
    cyl(0.06 * k, 0.06 * k, 0.03 * k, 8, GOLD, x, yTop - 0.03 * k, z);
    const prof = [[0, 0], [0.06, 0], [0.11, 0.03], [0.14, 0.1], [0.145, 0.15], [0.14, 0.2], [0.11, 0.27], [0.06, 0.3], [0, 0.3]].map(
      ([a, c]) => [a * k, c * k],
    );
    b.lathe(prof, { at: [x, yTop - 0.33 * k, z], segments: 10, color: stripes(RED_L, RED_D, { size: 0.045 * k, axis: "y" }) });
    cyl(0.06 * k, 0.06 * k, 0.03 * k, 8, GOLD, x, yTop - 0.36 * k, z);
    rod([x, yTop - 0.36 * k, z], [x, yTop - 0.5 * k, z], 0.006 * k + 0.003, GOLD);
    ball(0.016 * k, GOLD, x, yTop - 0.5 * k, z, {}, 6, 4);
  };

  // ---------- ground ----------
  cyl(4.05, 4.1, 0.08, 28, EARTH, 0, 0, 0);
  const ground = cyl(3.95, 4.0, 0.12, 28, groundP, 0, 0.08, 0);

  // rocks
  const rocks = [[3.1, -1.5, 0.38], [-3.0, 1.4, 0.3], [1.2, -3.3, 0.3], [-1.2, 3.0, 0.25], [2.0, -2.6, 0.25]];
  for (const [rx, rz, rr] of rocks) {
    part(new THREE.IcosahedronGeometry(rr, 0), stoneP, rx, GY + rr * 0.3, rz, {
      scale: [1.1, 0.75, 0.95],
      rotation: [0, rnd() * 90, 0],
    });
  }

  // stepping-stone path
  for (let i = 0; i < 9; i++) {
    const z = 3.45 - i * 0.38;
    const sc = 0.9 + rnd() * 0.25;
    part(new THREE.CylinderGeometry(0.3, 0.33, 0.06, 6), pathP, (rnd() - 0.5) * 0.2, GY + 0.025, z, {
      scale: [1.15 * sc, 1, 0.78 * sc],
      rotation: [0, rnd() * 60, 0],
    });
  }

  // blocked zones for ground detail
  const blocked = (x, z) => {
    if (Math.abs(x) < 0.8 && z > -0.4 && z < 3.7) return true;
    if (Math.abs(x) < 1.7 && z > -3.2 && z < 0.6) return true;
    for (const s of [1, -1]) {
      if (Math.hypot(x - s * 1.15, z - 2.3) < 0.42) return true;
      if (Math.hypot(x - s * 1.5, z - 1.1) < 0.45) return true;
    }
    if (Math.hypot(x + 2.9, z + 2.0) < 0.65) return true;
    if (Math.hypot(x + 2.35, z - 0.45) < 0.7) return true;
    if (x > 1.7 && x < 3.2 && z > -0.2 && z < 0.7) return true;
    if (Math.hypot(x - 2.5, z - 2.0) < 0.3) return true;
    for (const [rx, rz, rr] of rocks) if (Math.hypot(x - rx, z - rz) < rr + 0.15) return true;
    return false;
  };

  // grass tufts as cards
  const gsurf = b.surface(ground);
  const tufts = gsurf.scatter(130, {
    rng: rng(6),
    minDist: 0.22,
    filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) < 3.7 && !blocked(h.at.x, h.at.z),
  });
  b.cards(tufts, grassTex, { size: [0.16, 0.18], lean: 8, bend: 20, vary: 0.4, rng: rng(7), cross: true });

  // flowers (merged)
  const flowerHits = gsurf.scatter(46, {
    rng: rng(12),
    minDist: 0.3,
    filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) < 3.6 && !blocked(h.at.x, h.at.z),
  });
  const fcols = [WHITE, PINK_D, GLOW];
  const heads = [[], [], []];
  const stems = [];
  flowerHits.forEach((h, i) => {
    heads[i % 3].push(
      new THREE.IcosahedronGeometry(0.038, 0).scale(1, 0.7, 1).translate(h.at.x, GY + 0.1, h.at.z),
    );
    stems.push(new THREE.CylinderGeometry(0.005, 0.005, 0.1, 3).translate(h.at.x, GY + 0.05, h.at.z));
  });
  heads.forEach((arr, i) => {
    if (arr.length) b.part(mergeGeometries(arr), fcols[i], { bone: root, at: [0, 0, 0], flat: true });
  });
  if (stems.length) b.part(mergeGeometries(stems), GRASS_D, { bone: root, at: [0, 0, 0] });

  // ---------- TORII ----------
  const TZ = 2.3;
  const FY = GY + 0.12;
  for (const s of [1, -1]) {
    const px = s * 1.15;
    box(0.5, 0.12, 0.5, stoneP, px, GY, TZ);
    cyl(0.17, 0.19, 0.4, 10, BLACK_P, px, FY, TZ);
    cyl(0.16, 0.16, 0.04, 10, GOLD, px, FY + 0.4, TZ);
    cyl(0.125, 0.15, 2.28, 10, VERM, px, FY + 0.4, TZ);
    cyl(0.145, 0.145, 0.05, 10, GOLD, px, 2.8, TZ);
    for (const t of [-1, 1]) box(0.1, 0.3, 0.12, BLACK_P, px + t * 0.19, 2.29, TZ);
    box(0.06, 0.2, 0.18, BLACK_P, s * 1.57, 2.33, TZ);
    chochin(s * 1.75, 3.08, TZ, 1.3);
  }
  box(3.1, 0.16, 0.14, VERM_D, 0, 2.35, TZ);
  box(0.56, 0.4, 0.1, BLACK_P, 0, 2.52, TZ);
  b.part(new THREE.PlaneGeometry(0.5, 0.34), "#ffffff", { at: [0, 2.72, TZ + 0.052], dir: [0, 0, 1], axis: "z", texture: crestTex });
  b.part(new THREE.PlaneGeometry(0.5, 0.34), "#ffffff", { at: [0, 2.72, TZ - 0.052], dir: [0, 0, -1], axis: "z", texture: crestTex });
  box(3.3, 0.14, 0.28, BLACK_P, 0, 2.93, TZ);
  b.extrude(
    [[-1.98, 0.22], [-1.7, 0.04], [-1.0, 0], [0, 0], [1.0, 0], [1.7, 0.04], [1.98, 0.22], [1.98, 0.36], [1.7, 0.2], [1.0, 0.16], [0, 0.16], [-1.0, 0.16], [-1.7, 0.2], [-1.98, 0.36]],
    { at: [0, 3.07, TZ], thickness: 0.36, bevel: 0.01, color: BLACK_P },
  );
  for (const s of [1, -1]) box(0.04, 0.15, 0.4, GOLD, s * 1.99, 3.28, TZ);
  box(2.4, 0.03, 0.2, GOLD_D, 0, 3.24, TZ);

  // shimenawa across the torii
  const rope1 = catmull([[-1.05, 2.24, TZ], [-0.5, 2.1, TZ], [0, 2.04, TZ], [0.5, 2.1, TZ], [1.05, 2.24, TZ]]);
  b.sweep(rope1, 0.04, { color: ropeP, sides: 6, smooth: false });
  for (let i = 0; i < 5; i++) {
    const q = rope1.at((i + 0.5) / 5);
    shide(q.x, q.y - 0.02, TZ + 0.05);
  }
  for (const s of [1, -1]) {
    cyl(0.03, 0.05, 0.14, 6, ROPE, s * 1.03, 2.05, TZ);
    rod([s * 1.03, 2.05, TZ], [s * 1.03, 1.95, TZ], 0.012, ROPE_D);
  }

  // ---------- STONE LANTERNS ----------
  const toro = (x, z, k) => {
    const y0 = GY;
    box(0.56 * k, 0.08 * k, 0.56 * k, stoneP, x, y0, z);
    cyl(0.19 * k, 0.24 * k, 0.16 * k, 6, stoneP, x, y0 + 0.08 * k, z);
    cyl(0.085 * k, 0.1 * k, 0.62 * k, 6, stoneP, x, y0 + 0.24 * k, z);
    cyl(0.12 * k, 0.12 * k, 0.05 * k, 6, STONE_D, x, y0 + 0.5 * k, z);
    cyl(0.3 * k, 0.17 * k, 0.1 * k, 6, stoneP, x, y0 + 0.86 * k, z);
    const fy = y0 + 0.96 * k;
    box(0.34 * k, 0.34 * k, 0.34 * k, STONE_L, x, fy, z);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const dm = (w, h, t) => (dx ? [t, h, w] : [w, h, t]);
      const o = 0.172 * k;
      let d = dm(0.2 * k, 0.2 * k, 0.012);
      box(d[0], d[1], d[2], GLOW, x + dx * o, fy + 0.07 * k, z + dz * o);
      d = dm(0.02 * k, 0.2 * k, 0.016);
      box(d[0], d[1], d[2], DARK, x + dx * (o + 0.002), fy + 0.07 * k, z + dz * (o + 0.002));
      d = dm(0.2 * k, 0.02 * k, 0.016);
      box(d[0], d[1], d[2], DARK, x + dx * (o + 0.002), fy + 0.16 * k, z + dz * (o + 0.002));
    }
    const ry = fy + 0.34 * k;
    cyl(0.46 * k, 0.46 * k, 0.05 * k, 6, stoneP, x, ry, z);
    cyl(0.1 * k, 0.44 * k, 0.26 * k, 6, stoneP, x, ry + 0.05 * k, z);
    cyl(0.05 * k, 0.07 * k, 0.05 * k, 6, STONE_D, x, ry + 0.31 * k, z);
    ball(0.07 * k, stoneP, x, ry + 0.4 * k, z, {}, 8, 6);
    part(new THREE.ConeGeometry(0.04 * k, 0.12 * k, 6), stoneP, x, ry + 0.5 * k, z);
  };
  toro(1.5, 1.1, 1.15);
  toro(-1.5, 1.1, 1.15);

  // ---------- SHRINE (hokora) ----------
  const z0 = -1.5;
  box(2.6, 0.16, 2.6, stoneP, 0, GY, z0);
  box(2.66, 0.03, 2.66, STONE_L, 0, GY + 0.16, z0);
  box(2.2, 0.14, 2.0, stoneP, 0, GY + 0.16, z0);
  box(2.26, 0.04, 2.06, STONE_L, 0, 0.5, z0);
  box(1.0, 0.1, 0.3, STONE_L, 0, 0.36, z0 + 1.15);
  box(1.1, 0.1, 0.35, stoneP, 0, GY, z0 + 1.475);

  box(1.7, 0.16, 0.64, woodP, 0, 0.54, z0 + 0.67);
  box(1.5, 0.12, 1.2, WOOD_D, 0, 0.7, z0 - 0.15);
  box(1.4, 0.88, 1.1, CREAM, 0, 0.82, z0 - 0.15);
  for (const sx of [1, -1])
    for (const zz of [z0 + 0.4, z0 - 0.7]) box(0.1, 0.88, 0.1, VERM, sx * 0.7, 0.82, zz);
  for (const sx of [1, -1]) box(0.06, 0.74, 0.06, VERM_D, sx * 0.47, 0.8, z0 + 0.42);
  box(1.5, 0.12, 0.12, VERM, 0, 1.58, z0 + 0.44);
  box(1.6, 0.05, 0.04, GOLD, 0, 1.64, z0 + 0.52);
  box(0.96, 0.06, 0.06, VERM_D, 0, 1.52, z0 + 0.42);
  for (const sx of [-1, 1]) {
    b.part(new THREE.PlaneGeometry(0.43, 0.7), "#ffffff", { at: [sx * 0.225, 1.17, z0 + 0.405], dir: [0, 0, 1], axis: "z", texture: doorTex });
    ball(0.025, GOLD, -sx * 0.04, 1.15, z0 + 0.42, {}, 6, 4);
  }
  for (const sx of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.44, 0.33), "#ffffff", { at: [sx * 0.702, 1.25, z0 - 0.15], dir: [sx, 0, 0], axis: "z", texture: crestTex });
  }
  b.part(new THREE.PlaneGeometry(0.44, 0.33), "#ffffff", { at: [0, 1.25, z0 - 0.702], dir: [0, 0, -1], axis: "z", texture: crestTex });

  // deck rails
  for (const sx of [1, -1]) {
    for (const zz of [z0 + 0.45, z0 + 0.95]) {
      box(0.06, 0.3, 0.06, VERM, sx * 0.8, 0.7, zz);
      ball(0.04, GOLD, sx * 0.8, 1.02, zz, {}, 6, 4);
    }
    box(0.04, 0.04, 0.5, VERM, sx * 0.8, 0.92, z0 + 0.7);
    box(0.04, 0.03, 0.5, VERM_D, sx * 0.8, 0.8, z0 + 0.7);
  }

  // roof
  const cz = z0 + 0.1;
  const roofC = (rt, rb, h, yb) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, 4, 1);
    g.rotateY(Math.PI / 4);
    return part(g, roofP, 0, yb + h / 2, cz, { scale: [0.88, 1, 0.85] });
  };
  roofC(2.0, 1.65, 0.16, 1.7);
  roofC(0.55, 1.9, 0.5, 1.86);
  roofC(0.02, 0.55, 0.32, 2.36);
  b.lathe(
    [[0, 0], [0.04, 0], [0.07, 0.05], [0.06, 0.1], [0.1, 0.16], [0.08, 0.24], [0.03, 0.3], [0, 0.34]],
    { at: [0, 2.67, cz], segments: 8, color: GOLD },
  );
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      ball(0.07, GOLD, sx * 1.24, 1.9, cz + sz * 1.2, {}, 6, 4);
      part(new THREE.ConeGeometry(0.04, 0.16, 5), GOLD, sx * 1.24, 2.0, cz + sz * 1.2);
    }
  for (const sx of [1, -1]) chochin(sx * 1.0, 1.7, z0 + 0.95, 1.0);

  // saisen box
  const sz0 = z0 + 0.82;
  box(0.7, 0.26, 0.34, WOOD_L, 0, 0.7, sz0);
  box(0.72, 0.04, 0.36, VERM, 0, 0.84, sz0);
  box(0.6, 0.012, 0.24, DARK, 0, 0.955, sz0);
  for (let i = 0; i < 5; i++) box(0.075, 0.03, 0.32, WOOD_L, -0.25 + i * 0.125, 0.96, sz0);
  box(0.2, 0.1, 0.01, GOLD, 0, 0.74, sz0 + 0.176);

  // suzu bell
  const sr = catmull([[0, 1.72, z0 + 0.95], [0.02, 1.55, z0 + 0.95], [0, 1.35, z0 + 0.95]]);
  b.sweep(sr, 0.022, { color: stripes(WHITE, VERM, { size: 0.05, axis: "y" }), sides: 6, smooth: false });
  ball(0.075, GOLD, 0, 1.25, z0 + 0.95, {}, 10, 8);
  cyl(0.078, 0.078, 0.014, 10, GOLD_D, 0, 1.245, z0 + 0.95);
  rod([0, 1.3, z0 + 0.95], [0, 1.1, z0+ 0.95], 0.03, stripes(WHITE, VERM, { size: 0.05, axis: "y" }));

  // shrine shimenawa
  const zf = z0 + 0.53;
  const rope2 = catmull([[-0.72, 1.5, zf], [-0.4, 1.4, zf], [0, 1.36, zf], [0.4, 1.4, zf], [0.72, 1.5, zf]]);
  b.sweep(rope2, 0.03, { color: ropeP, sides: 6, smooth: false });
  for (let i = 0; i < 4; i++) {
    const q = rope2.at(0.15 + i * 0.23);
    shide(q.x, q.y - 0.02, zf + 0.04);
  }

  // ---------- KITSUNE GUARDIANS ----------
  const fox = (cx, cz, s) => {
    box(0.62, 0.12, 0.62, stoneP, cx, GY, cz);
    box(0.5, 0.3, 0.5, stoneP, cx, GY + 0.12, cz);
    box(0.6, 0.07, 0.6, STONE_L, cx, GY + 0.42, cz);
    const y0 = GY + 0.49;
    ball(0.17, FOX_W, cx, y0 + 0.15, cz - 0.08, { scale: [1, 0.95, 1.2] }, 8, 6);
    b.capsule([cx, y0 + 0.2, cz - 0.06], [cx, y0 + 0.5, cz + 0.06], [0.14, 0.1], FOX_W, { sides: 8, smooth: false });
    for (const e of [1, -1]) {
      rod([cx + e * 0.07, y0 + 0.4, cz + 0.1], [cx + e * 0.07, y0 + 0.05, cz + 0.17], 0.036, FOX_W);
      box(0.08, 0.05, 0.12, FOX_W, cx + e * 0.07, y0, cz + 0.2);
    }
    ball(0.11, FOX_W, cx, y0 + 0.62, cz + 0.08, { scale: [1, 0.9, 1] }, 8, 6);
    part(new THREE.ConeGeometry(0.06, 0.17, 6), FOX_W, cx, y0 + 0.6, cz + 0.2, { dir: [0, -0.2, 1] });
    ball(0.022, DARK, cx, y0 + 0.585, cz + 0.285, {}, 5, 4);
    for (const e of [1, -1]) {
      part(new THREE.ConeGeometry(0.05, 0.2, 4), FOX_W, cx + e * 0.07, y0 + 0.77, cz + 0.05, { dir: [e * 0.3, 1, -0.15] });
      part(new THREE.ConeGeometry(0.03, 0.12, 4), RED_D, cx + e * 0.07, y0 + 0.76, cz + 0.07, { dir: [e * 0.3, 1, -0.15] });
      box(0.045, 0.012, 0.012, DARK, cx + e * 0.055, y0 + 0.645, cz + 0.178, { rotation: [0, 0, e * 20] });
      part(new THREE.ConeGeometry(0.035, 0.1, 4), FOX_W, cx + e * 0.1, y0 + 0.58, cz + 0.1, { dir: [e, -0.3, 0.3] });
    }
    const tail = catmull([[cx, y0 + 0.1, cz - 0.2], [cx, y0 + 0.12, cz - 0.4], [cx + s * 0.04, y0 + 0.38, cz - 0.48], [cx, y0 + 0.68, cz - 0.38]]);
    b.sweep(tail, [0.05, 0.09, 0.05], { color: FOX_W, bands: [[0.78, FOX_W], [1, RED_L]], sides: 7, smooth: false });
    part(new THREE.TorusGeometry(0.1, 0.024, 5, 10), VERM, cx, y0 + 0.5, cz + 0.05, { rotation: [90, 0, 0] });
    part(new THREE.ConeGeometry(0.06, 0.14, 4), VERM, cx, y0 + 0.4, cz + 0.16, { rotation: [170, 0, 0] });
    ball(0.025, GOLD, cx, y0 + 0.36, cz + 0.19, {}, 6, 4);
    if (s > 0) {
      ball(0.05, GOLD, cx, y0 + 0.06, cz + 0.24, {}, 8, 6);
      part(new THREE.ConeGeometry(0.025, 0.07, 5), GOLD, cx, y0 + 0.13, cz + 0.24);
    } else {
      part(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8), WHITE, cx, y0 + 0.04, cz + 0.24, { rotation: [0, 0, 90] });
      for (const e of [1, -1]) part(new THREE.CylinderGeometry(0.038, 0.038, 0.02, 8), VERM, cx + e * 0.1, y0 + 0.04, cz + 0.24, { rotation: [0, 0, 90] });
    }
  };
  fox(0.95, 0.2, 1);
  fox(-0.95, 0.2, -1);

  // ---------- PINWHEELS ----------
  const pinwheel = (x, z, h) => {
    rod([x, GY, z], [x, GY + h, z], 0.012, WOOD_L);
    const cols = [VERM, WHITE, PURPLE, GOLD];
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      b.extrude([[0, 0], [0.09, 0], [0.09, 0.09]], {
        at: [x, GY + h, z + 0.02],
        x: [Math.cos(a), Math.sin(a), 0],
        y: [-Math.sin(a), Math.cos(a), 0],
        thickness: 0.006,
        color: cols[k],
      });
    }
    ball(0.02, GOLD, x, GY + h, z + 0.035, {}, 6, 4);
  };
  pinwheel(0.8, 1.7, 0.6);
  pinwheel(-0.8, 1.4, 0.5);

  // ---------- OFFERING TABLE ----------
  const tx = -2.35, tz = 0.45, TY = 0.81;
  for (const a of [1, -1])
    for (const c of [1, -1]) box(0.05, 0.55, 0.05, WOOD_D, tx + a * 0.38, GY, tz + c * 0.2);
  box(0.9, 0.05, 0.5, woodP, tx, GY + 0.55, tz);
  box(0.7, 0.008, 0.4, PURPLE, tx, TY - 0.01, tz);
  // dango
  for (const [dx, order] of [[-0.3, [PINK_D, WHITE, DANGO_G]], [-0.22, [DANGO_G, WHITE, PINK_D]]]) {
    cyl(0.03, 0.035, 0.04, 8, WOOD_D, tx + dx, TY, tz - 0.12);
    rod([tx + dx, TY + 0.03, tz - 0.12], [tx + dx, TY + 0.3, tz - 0.12], 0.007, WOOD_L, { sides: 5 });
    order.forEach((c, i) => ball(0.032, c, tx + dx, TY + 0.12 + i * 0.06, tz - 0.12, {}, 8, 6));
  }
  // sake
  b.lathe([[0, 0], [0.05, 0], [0.06, 0.03], [0.04, 0.1], [0.025, 0.16], [0.03, 0.18], [0, 0.18]], {
    at: [tx - 0.02, TY, tz + 0.1], segments: 8, color: "#e8edf5",
  });
  box(0.05, 0.05, 0.005, VERM, tx - 0.02, TY + 0.04, tz + 0.158);
  for (const o of [0.08, 0.15]) cyl(0.032, 0.022, 0.035, 8, VERM, tx + o, TY, tz + 0.13);
  // mikan
  cyl(0.12, 0.1, 0.02, 10, WHITE, tx + 0.25, TY, tz - 0.05);
  const mk = [[-0.045, -0.025], [0.045, -0.025], [0, 0.05]];
  for (const [mx, mz] of mk) ball(0.045, ORANGE, tx + 0.25 + mx, TY + 0.063, tz - 0.05 + mz, {}, 8, 6);
  ball(0.045, ORANGE, tx + 0.25, TY + 0.12, tz - 0.05, {}, 8, 6);
  part(new THREE.ConeGeometry(0.02, 0.04, 4), LEAF, tx + 0.25, TY + 0.17, tz - 0.05);
  // rice bowl
  cyl(0.06, 0.035, 0.06, 10, WHITE, tx - 0.12, TY, tz + 0.13);
  part(new THREE.SphereGeometry(0.056, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#ffffff", tx - 0.12, TY + 0.06, tz + 0.13);
  // candle
  cyl(0.03, 0.035, 0.012, 8, GOLD, tx + 0.33, TY, tz + 0.15);
  cyl(0.015, 0.015, 0.1, 6, WHITE, tx + 0.33, TY + 0.012, tz + 0.15);
  part(new THREE.ConeGeometry(0.013, 0.045, 5), GLOW, tx + 0.33, TY + 0.135, tz + 0.15);

  // ---------- EMA RACK ----------
  const ex = 2.45, ez = 0.25;
  for (const s of [1, -1]) {
    box(0.09, 1.65, 0.09, VERM, ex + s * 0.58, GY, ez);
    box(0.13, 0.05, 0.13, BLACK_P, ex + s * 0.58, GY, ez);
  }
  box(1.3, 0.08, 0.1, VERM_D, ex, 1.45, ez);
  box(1.3, 0.05, 0.1, VERM_D, ex, 0.95, ez);
  b.extrude([[-0.45, 0], [0, 0.26], [0.45, 0], [0.38, -0.05], [-0.38, -0.05]], {
    at: [ex, 1.78, ez], thickness: 1.45, x: [0, 0, 1], y: [0, 1, 0], color: roofP,
  });
  box(1.5, 0.05, 0.05, GOLD, ex, 2.05, ez);
  const tex3 = [foxTex, crestTex, sakuraTex];
  for (let i = 0; i < 5; i++) {
    const px = ex + (i - 2) * 0.22;
    const drop = 0.16 + (i % 2) * 0.08;
    const topY = 1.45 - drop;
    const pz = ez + 0.07;
    rod([px, 1.45, ez + 0.05], [px, topY + 0.11, pz], 0.004, ROPE_D, { sides: 4 });
    b.extrude([[-0.08, -0.1], [0.08, -0.1], [0.08, 0.04], [0, 0.11], [-0.08, 0.04]], {
      at: [px, topY, pz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, color: WOOD_L,
    });
    b.part(new THREE.PlaneGeometry(0.13, 0.1), "#ffffff", { at: [px, topY - 0.04, pz + 0.0085], dir: [0, 0, 1], axis: "z", texture: tex3[i % 3] });
    b.part(new THREE.PlaneGeometry(0.13, 0.1), "#ffffff", { at: [px, topY - 0.04, pz - 0.0085], dir: [0, 0, -1], axis: "z", texture: tex3[(i + 1) % 3] });
  }
  // omamori charms on lower rail
  [GOLD, PURPLE, PINK_D].forEach((c, i) => {
    const px = ex - 0.3 + i * 0.3;
    rod([px, 0.95, ez + 0.05], [px, 0.85, ez + 0.06], 0.004, ROPE_D, { sides: 4 });
    box(0.06, 0.1, 0.015, c, px, 0.75, ez + 0.06);
    box(0.06, 0.02, 0.017, WHITE, px, 0.82, ez + 0.06);
  });

  // ---------- LANTERN POLE ----------
  cyl(0.04, 0.05, 2.3, 8, WOOD_D, 2.5, GY, 2.0);
  ball(0.05, GOLD, 2.5, 2.54, 2.0, {}, 6, 4);
  rod([2.5, 2.4, 2.0], [1.9, 2.4, 2.0], 0.026, WOOD_D);
  rod([2.5, 2.0, 2.0], [2.1, 2.38, 2.0], 0.02, WOOD_D);
  rod([1.95, 2.4, 2.0], [1.95, 2.32, 2.0], 0.008, ROPE_D, { sides: 4 });
  chochin(1.95, 2.32, 2.0, 1.4);

  // ---------- SAKURA TREE ----------
  const tx0 = -2.9, tz0 = -2.0;
  const trunk = catmull([
    [tx0, GY - 0.05, tz0], [tx0, 0.8, tz0], [tx0 + 0.12, 1.5, tz0 + 0.05], [tx0 + 0.3, 2.2, tz0], [tx0 + 0.45, 2.8, tz0 - 0.05],
  ]);
  b.sweep(trunk, [0.3, 0.22, 0.14, 0.09, 0.05], { color: BARK, sides: 7, smooth: false });
  const tp = (t) => {
    const q = trunk.at(t);
    return [q.x, q.y, q.z];
  };
  const branches = [
    [0.5, [tx0 + 1.1, 2.9, tz0 + 0.5]], [0.55, [tx0 - 0.6, 2.9, tz0 + 0.4]], [0.7, [tx0 + 0.9, 3.4, tz0 - 0.7]],
    [0.65, [tx0 - 0.7, 3.2, tz0 - 0.6]], [0.45, [tx0 + 1.5, 2.7, tz0 - 0.2]],
  ];
  for (const [t, e] of branches) {
    const a = tp(t);
    const mid = [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2 + 0.15, (a[2] + e[2]) / 2];
    b.sweep(catmull([a, mid, e]), [0.09, 0.03], { color: BARK, sides: 6, smooth: false });
  }
  const clusters = [
    [0.5, 3.2, 0, 0.9, PINK], [1.3, 3.0, 0.5, 0.7, PINK_L], [-0.5, 3.0, 0.4, 0.7, PINK_D], [0.9, 3.6, -0.7, 0.65, PINK_L],
    [-0.6, 3.4, -0.6, 0.65, PINK], [1.6, 2.75, -0.1, 0.55, PINK_D], [0.4, 3.9, -0.1, 0.6, PINK_L], [-1.1, 2.7, -0.1, 0.5, PINK],
    [0.2, 2.7, 0.7, 0.45, PINK_D], [1.0, 2.5, 0.3, 0.4, PINK_L],
  ];
  for (const [dx, y, dz, r, c] of clusters)
    part(new THREE.IcosahedronGeometry(r, 1), c, tx0 + dx, y, tz0 + dz, { scale: [1, 0.8, 1], rotation: [0, rnd() * 90, 0] });
  // shimenawa round trunk
  const ringPts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ringPts.push([tx0 + Math.cos(a) * 0.36, 1.0 + (i % 2) * 0.03, tz0 + Math.sin(a) * 0.36]);
  }
  b.sweep(catmull(ringPts, { closed: true }), 0.035, { color: ropeP, sides: 6, smooth: false });
  for (const a of [0.6, 2.2, 4.0]) shide(tx0 + Math.cos(a) * 0.38, 0.98, tz0 + Math.sin(a) * 0.38);

  // ---------- PETALS ----------
  const groundPetals = [], airPetals = [];
  const mkPetal = (x, y, z, ground) => {
    const g = new THREE.BoxGeometry(0.06, 0.004, 0.04);
    g.applyMatrix4(
      new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(ground ? 0 : rnd() * 3, rnd() * 6.28, ground ? 0 : rnd() * 3),
      ),
    );
    g.translate(x, y, z);
    return g;
  };
  for (let i = 0; i < 80; i++) {
    const a = rnd() * Math.PI * 2, rr = 0.4 + rnd() * 2.8;
    let x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (i < 45) { x = tx0 + 0.9 + Math.cos(a) * rr * 0.6; z = tz0 + 0.5 + Math.sin(a) * rr * 0.6; }
    if (Math.hypot(x, z) > 3.7) continue;
    groundPetals.push(mkPetal(x, GY + 0.005 + (i % 3) * 0.002, z, true));
  }
  for (let i = 0; i < 26; i++)
    airPetals.push(mkPetal(-3 + rnd() * 5.5, 0.5 + rnd() * 2.6, -2.2 + rnd() * 5, false));
  b.part(mergeGeometries(groundPetals), PINK_L, { bone: root, at: [0, 0, 0] });
  b.part(mergeGeometries(airPetals), PINK, { bone: root, at: [0, 0, 0] });

  return b.root;
}
```