import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, noise, paint, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Roadside Lantern Shrine",
  description:
    "A mossy roadside shrine with a vermilion torii, shimenawa rope and paper streamers, stone lanterns, fox guardians, a small hokora with bell, offerings, ema rack, water basin, sakura tree and a glowing sigil.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Fill = string | Paint;

export default function build() {
  const b = createBuilder({ name: "lanternShrine" });
  const R = b.joint("root", { at: [0, 0, 0] });
  const G = 0.14; // ground top
  const rand = rng(11);

  // ---------- palette (cel-shaded paints) ----------
  const RED = cel(grain("#e2492a", "#cf3b21", { size: 0.04, axis: "y", seed: 2 }));
  const LACQUER = cel("#2c2432");
  const GOLD = cel("#f6cb62", "#d89a38");
  const WOOD = cel(grain("#9a6340", "#7c4e32", { size: 0.035, axis: "x", seed: 4 }));
  const WOODL = cel(grain("#c89560", "#b0794a", { size: 0.03, axis: "x", seed: 6 }));
  const PAPER = cel("#fbf3e2", "#e6d6c4");
  const STRAW = cel("#dcb862", "#b88f45");
  const ROOF = cel(stripes("#3f7391", "#336382", { size: 0.07, axis: "y", width: 0.3, wobble: 0.1 }), "#2b4e6d");
  const BARK = cel(grain("#6a4a3a", "#523a30", { size: 0.04, axis: "y", seed: 9 }));
  const PINK = cel(mottle("#ffbdd2", "#ffd6e3", { size: 0.35, seed: 5 }), "#e88fb6");
  const PINKD = cel("#ff9fbf", "#dc78a6");
  const ORANGE = cel("#ff9a2e", "#e4651c");
  const WHITE = cel("#ffffff", "#d9d9ee");
  const WATER = "#8fe6f2";
  const STONEC = cel(mottle("#c4bdac", "#aaa391", { size: 0.14, seed: 3 }), "#8c88a0");
  const MOSSC = cel(mottle("#86b256", "#6e9c48", { size: 0.1, seed: 8 }), "#4f8a5a");
  const STONE = paint((p, n) => (n.y > 0.45 && noise(p, 0.13, 5) > 0.48 ? MOSSC : STONEC));
  const GRASS1 = cel("#7cc752", "#4fa45e");
  const GRASS2 = cel("#69b84a", "#459a58");
  const GRAVEL = cel(mottle("#e2d9c4", "#cfc3a8", { size: 0.05, seed: 12 }), "#a89fb4");
  const DIRT = cel("#7a5a42", "#5d4350");
  const GROUND = paint((p, n) => {
    if (n.y < 0.3) return DIRT;
    const onPath = Math.abs(p.x) < 0.55 + 0.06 * Math.sin(p.z * 5) && p.z > -0.55;
    if (onPath) return GRAVEL;
    return noise(p, 0.5, 2) > 0.5 ? GRASS1 : GRASS2;
  });

  // ---------- textures ----------
  const NAMEPLATE = (() => {
    let petals = "";
    for (let i = 0; i < 6; i++)
      petals += `<ellipse cx="24" cy="21" rx="4" ry="9" fill="#f6cb62" transform="rotate(${i * 60} 24 32) translate(0 -9)"/>`;
    return svg(
      `<svg viewBox="0 0 48 64"><rect x="1" y="1" width="46" height="62" rx="4" fill="#f6cb62"/>
      <rect x="5" y="5" width="38" height="54" rx="2" fill="#2c2432"/>${petals}
      <circle cx="24" cy="32" r="4" fill="#e2492a"/><path d="M12 52 H36" stroke="#f6cb62" stroke-width="2"/></svg>`,
      { size: 192 },
    );
  })();
  const DOOR = (() => {
    let lines = "";
    for (let i = 1; i < 5; i++) lines += `<path d="M${i * 8} 0 V80" stroke="#f6cb62" stroke-width="1.2"/>`;
    for (let j = 1; j < 10; j++) lines += `<path d="M0 ${j * 8} H40" stroke="#f6cb62" stroke-width="1.2"/>`;
    return svg(
      `<svg viewBox="0 0 40 80"><rect width="40" height="80" fill="#b8321f"/>${lines}
      <rect x="1" y="1" width="38" height="78" fill="none" stroke="#f6cb62" stroke-width="2"/>
      <circle cx="20" cy="40" r="5" fill="#f6cb62"/><circle cx="20" cy="40" r="2" fill="#b8321f"/></svg>`,
      { size: 192 },
    );
  })();
  const SHIDE = svg(
    `<svg viewBox="0 0 32 64"><polygon points="8,0 24,0 24,16 30,24 22,28 28,40 18,46 24,60 12,64 14,50 6,44 14,36 4,28 12,20" fill="#fbf3e2" stroke="#d8c8b0" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );
  const PETAL = svg(`<svg viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="5" ry="7" fill="#ffb3cd"/></svg>`, { size: 64 });
  const BLADE = svg(
    `<svg viewBox="0 0 16 32"><polygon points="2,32 8,0 14,32" fill="#5fbf4e"/><polygon points="6,32 8,8 10,32" fill="#9be874"/></svg>`,
    { size: 64 },
  );
  const EMA = svg(
    `<svg viewBox="0 0 30 40"><polygon points="4,40 4,12 15,2 26,12 26,40" fill="#d9a86a" stroke="#6b3f22" stroke-width="1.6"/>
    <polygon points="8,26 8,15 12,19 18,19 22,15 22,26 15,35" fill="#e8662b"/><polygon points="12,28 18,28 15,35" fill="#fff4e0"/>
    <circle cx="12" cy="24" r="1.2" fill="#2c2432"/><circle cx="18" cy="24" r="1.2" fill="#2c2432"/></svg>`,
    { size: 128 },
  );
  const SIGIL = (() => {
    let marks = "";
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const x1 = 100 + Math.cos(a) * 84;
      const y1 = 100 + Math.sin(a) * 84;
      const x2 = 100 + Math.cos(a) * 92;
      const y2 = 100 + Math.sin(a) * 92;
      marks += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#7fe8ff" stroke-width="3"/>`;
    }
    let star = "";
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 34 : 70;
      star += `${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)} `;
    }
    return svg(
      `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="none" stroke="#7fe8ff" stroke-width="3.5"/>
      <circle cx="100" cy="100" r="78" fill="none" stroke="#ffe08a" stroke-width="2.5"/>${marks}
      <polygon points="${star}" fill="none" stroke="#ffe08a" stroke-width="2.5"/>
      <circle cx="100" cy="100" r="20" fill="none" stroke="#7fe8ff" stroke-width="3"/><circle cx="100" cy="100" r="6" fill="#ffe08a"/></svg>`,
      { size: 512 },
    );
  })();

  // ---------- helpers ----------
  const P = (g: THREE.BufferGeometry, c: Fill, x: number, y: number, z: number, o: PartOptions = {}) =>
    b.part(g, c, { bone: R, at: [x, y, z], flat: true, ...o });
  const box = (w: number, h: number, d: number, c: Fill, x: number, y: number, z: number, o: PartOptions = {}) =>
    P(new THREE.BoxGeometry(w, h, d), c, x, y, z, o);
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    c: Fill,
    x: number,
    y: number,
    z: number,
    o: PartOptions = {},
  ) => P(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z, o);
  const sph = (r: number, c: Fill, x: number, y: number, z: number, o: PartOptions = {}, seg = 8) =>
    P(new THREE.SphereGeometry(r, seg, Math.max(4, Math.floor(seg / 2))), c, x, y, z, o);
  const cone = (r: number, h: number, seg: number, c: Fill, x: number, y: number, z: number, o: PartOptions = {}) =>
    P(new THREE.ConeGeometry(r, h, seg), c, x, y, z, o);
  const torus = (r: number, t: number, c: Fill, x: number, y: number, z: number, o: PartOptions = {}) =>
    P(new THREE.TorusGeometry(r, t, 4, 10), c, x, y, z, { rotation: [90, 0, 0], ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, o: PartOptions = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: R, at: [x, y, z], texture: tex, ...o });

  // ---------- ground ----------
  b.lathe(
    [
      [0, 0],
      [2.8, 0],
      [2.86, 0.06],
      [2.8, G],
      [0, G],
    ],
    { at: [0, 0, 0], bone: R, color: GROUND, segments: 20 },
  );
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + rand() * 0.1;
    const r = 0.16 + rand() * 0.1;
    P(new THREE.IcosahedronGeometry(r, 0), STONE, Math.cos(a) * 2.76, G + 0.02, Math.sin(a) * 2.76, {
      scale: [1.2, 0.6, 1],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // flagstones along the path
  for (let i = 0; i < 7; i++) {
    const z = 2.45 - i * 0.45;
    box(0.78 + rand() * 0.1, 0.05, 0.38, STONE, (rand() - 0.5) * 0.1, G + 0.02, z, { rotation: [0, (rand() - 0.5) * 8, 0] });
  }
  // grass tufts and petals
  {
    const tufts: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 90; i++) {
      const a = rand() * Math.PI * 2;
      const r = 0.4 + Math.sqrt(rand()) * 2.3;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (Math.abs(x) < 0.7 && z > -0.55) continue;
      tufts.push(frame([x, G, z], [0, 1, 0]));
    }
    b.cards(tufts, BLADE, { size: [0.1, 0.2], vary: 0.4, spin: 180, cross: true, rng: rng(3), flow: [0, 0, 1], bone: R });
    const petals: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 46; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 2.5;
      petals.push(frame([Math.cos(a) * r, G + 0.005 + rand() * 0.01, Math.sin(a) * r], [0, 1, 0]));
    }
    b.cards(petals, PETAL, {
      size: 0.06,
      lean: 90,
      mirror: true,
      sink: 0,
      vary: 0.3,
      rng: rng(4),
      flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
      bone: R,
    });
  }

  // ---------- torii ----------
  const TZ = 1.2;
  for (const s of [1, -1]) {
    box(0.62, 0.1, 0.62, STONE, s * 1.05, G + 0.04, TZ);
    cyl(0.23, 0.25, 0.3, 8, LACQUER, s * 1.05, G + 0.25, TZ);
    cyl(0.13, 0.17, 2.95, 10, RED, s * 1.05, G + 0.05 + 1.5, TZ);
    cyl(0.185, 0.185, 0.09, 10, GOLD, s * 1.05, G + 2.35, TZ);
    cyl(0.16, 0.16, 0.08, 10, GOLD, s * 1.05, G + 2.84, TZ);
    // kasagi upturned ends
    box(0.62, 0.15, 0.36, LACQUER, s * 1.95, G + 3.12, TZ, { rotation: [0, 0, s * 14] });
    box(0.55, 0.05, 0.4, LACQUER, s * 1.95, G + 3.22, TZ, { rotation: [0, 0, s * 14] });
    // nuki end caps
    box(0.1, 0.19, 0.17, GOLD, s * 1.46, G + 2.35, TZ);
    // hanging paper lantern outside
    const lx = s * 1.35;
    box(0.02, 0.2, 0.02, GOLD, lx, G + 2.2, TZ);
    chochin(lx, G + 1.88, TZ, 0.17);
  }
  box(4.0, 0.15, 0.34, LACQUER, 0, G + 3.1, TZ); // kasagi
  box(3.8, 0.05, 0.4, LACQUER, 0, G + 3.21, TZ);
  box(3.3, 0.14, 0.26, RED, 0, G + 2.92, TZ); // shimaki
  box(2.9, 0.15, 0.15, RED, 0, G + 2.35, TZ); // nuki
  box(0.12, 0.5, 0.12, RED, 0, G + 2.62, TZ); // gakuzuka
  box(0.5, 0.64, 0.05, GOLD, 0, G + 2.62, TZ + 0.07);
  box(0.5, 0.64, 0.05, GOLD, 0, G + 2.62, TZ - 0.07);
  plane(0.44, 0.58, NAMEPLATE, 0, G + 2.62, TZ + 0.1);
  plane(0.44, 0.58, NAMEPLATE, 0, G + 2.62, TZ - 0.1, { dir: [0, 0, -1], axis: "z" });
  // shimenawa with shide
  {
    const pts = [
      [-1.0, G + 2.2, TZ],
      [-0.5, G + 2.1, TZ],
      [0, G + 2.05, TZ],
      [0.5, G + 2.1, TZ],
      [1.0, G + 2.2, TZ],
    ];
    const rp = catmull(pts);
    b.sweep(rp, { radius: 0.048, color: STRAW, sides: 6, bone: R });
    const fr: ReturnType<typeof frame>[] = [];
    for (let k = 1; k <= 8; k++) {
      const at = rp.at(k / 9);
      fr.push(frame([at.x, at.y - 0.03, at.z], [0, 1, 0]));
      sph(0.028, STRAW, at.x, at.y, at.z, {}, 5);
    }
    b.cards(fr, SHIDE, { size: [0.1, 0.26], lean: 180, flow: [0, 0, 1], bone: R });
    for (const s of [1, -1]) {
      sph(0.06, GOLD, s * 1.0, G + 2.18, TZ + 0.04, {}, 6);
      cone(0.05, 0.22, 6, GOLD, s * 1.0, G + 2.0, TZ + 0.04, { rotation: [180, 0, 0] });
      cyl(0.04, 0.04, 0.04, 6, RED, s * 1.0, G + 2.27, TZ + 0.04);
    }
  }

  // ---------- chochin (paper lantern) ----------
  function chochin(x: number, y: number, z: number, r: number) {
    glow(sph(r, "#ff8a3d", x, y, z, { scale: [1, 1.25, 1] }, 8), 1.3);
    cyl(r * 0.6, r * 0.6, 0.04, 8, LACQUER, x, y + r * 1.25, z);
    cyl(r * 0.6, r * 0.6, 0.04, 8, LACQUER, x, y - r * 1.25, z);
    for (const k of [-0.6, 0, 0.6]) torus(r * Math.sqrt(1 - (k * 0.8) ** 2) + 0.004, 0.007, LACQUER, x, y + k * r * 1.25, z);
    cone(0.03, 0.1, 6, GOLD, x, y - r * 1.25 - 0.08, z, { rotation: [180, 0, 0] });
  }

  // ---------- stone lanterns ----------
  function toro(x: number, z: number) {
    cyl(0.3, 0.34, 0.1, 6, STONE, x, G + 0.05, z);
    cyl(0.09, 0.11, 0.5, 8, STONE, x, G + 0.35, z);
    cyl(0.2, 0.17, 0.06, 6, STONE, x, G + 0.63, z);
    cyl(0.3, 0.24, 0.1, 6, STONE, x, G + 0.71, z);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.05, 0.26, 0.05, STONE, x + sx * 0.13, G + 0.89, z + sz * 0.13);
    glow(box(0.21, 0.24, 0.21, "#ffb347", x, G + 0.89, z), 1.5);
    box(0.36, 0.05, 0.36, STONE, x, G + 1.045, z);
    b.lathe(
      [
        [0, 0],
        [0.48, 0],
        [0.46, 0.04],
        [0.3, 0.1],
        [0.12, 0.2],
        [0.05, 0.27],
        [0, 0.27],
      ],
      { at: [x, G + 1.07, z], bone: R, color: STONE, segments: 6 },
    );
    sph(0.06, STONE, x, G + 1.38, z, {}, 6);
    cone(0.05, 0.14, 6, STONE, x, G + 1.5, z);
  }
  toro(2.1, 0);
  toro(-2.1, 0);

  // ---------- hokora (small shrine) ----------
  const HZ = -1.15;
  box(2.0, 0.12, 1.4, STONE, 0, G + 0.06, HZ + 0.05);
  box(1.5, 0.12, 1.1, WOODL, 0, G + 0.18, HZ);
  box(1.0, 0.1, 0.3, STONE, 0, G + 0.05, HZ + 0.9);
  box(1.0, 0.07, 0.3, STONE, 0, G + 0.035, HZ + 1.1);
  box(1.1, 0.96, 0.7, RED, 0, G + 0.72, HZ);
  for (const sx of [1, -1]) {
    box(0.09, 1.0, 0.09, LACQUER, sx * 0.55, G + 0.74, HZ + 0.35);
    box(0.09, 1.0, 0.09, LACQUER, sx * 0.55, G + 0.74, HZ - 0.35);
    plane(0.45, 0.8, DOOR, sx * 0.25, G + 0.69, HZ + 0.355);
    box(0.06, 0.88, 0.04, GOLD, sx * 0.5 - sx * 0.03 + sx * 0.0, G + 0.69, HZ + 0.352);
    sph(0.025, GOLD, sx * 0.04, G + 0.69, HZ + 0.38, {}, 5);
    box(0.09, 0.14, 0.09, GOLD, sx * 0.55, G + 1.18, HZ + 0.35);
  }
  box(0.08, 0.88, 0.04, GOLD, 0, G + 0.69, HZ + 0.352);
  box(1.3, 0.08, 0.9, LACQUER, 0, G + 1.24, HZ);
  box(1.2, 0.06, 0.8, GOLD, 0, G + 1.2, HZ);
  b.lathe(
    [
      [0, 0],
      [1.3, 0],
      [1.24, 0.05],
      [0.7, 0.3],
      [0.1, 0.62],
      [0, 0.62],
    ],
    { at: [0, G + 1.27, HZ], bone: R, color: ROOF, segments: 4, spin: 45 },
  );
  // gold eave trim and chigi
  box(1.84, 0.04, 0.04, GOLD, 0, G + 1.29, HZ + 0.92);
  box(1.84, 0.04, 0.04, GOLD, 0, G + 1.29, HZ - 0.92);
  box(0.04, 0.04, 1.84, GOLD, 0.92, G + 1.29, HZ);
  box(0.04, 0.04, 1.84, GOLD, -0.92, G + 1.29, HZ);
  sph(0.07, GOLD, 0, G + 1.92, HZ, {}, 6);
  cone(0.05, 0.2, 6, GOLD, 0, G + 2.05, HZ);
  box(0.03, 0.4, 0.03, GOLD, 0.06, G + 2.05, HZ, { rotation: [0, 0, 18] });
  box(0.03, 0.4, 0.03, GOLD, -0.06, G + 2.05, HZ, { rotation: [0, 0, -18] });
  // bell and rope
  box(0.4, 0.04, 0.06, WOOD, 0, G + 1.22, HZ + 0.9);
  sph(0.09, GOLD, 0, G + 0.96, HZ + 0.9, {}, 8);
  box(0.12, 0.012, 0.02, LACQUER, 0, G + 0.94, HZ + 0.98);
  cyl(0.01, 0.01, 0.12, 5, GOLD, 0, G + 1.12, HZ + 0.9);
  b.sweep(
    catmull([
      [0, G + 0.88, HZ + 0.9],
      [0, G + 0.6, HZ + 0.92],
      [0, G + 0.3, HZ + 0.95],
    ]),
    { radius: 0.025, color: RED, sides: 6, bone: R },
  );
  sph(0.05, GOLD, 0, G + 0.3, HZ + 0.95, {}, 6);
  for (const s of [1, -1]) {
    chochin(s * 0.62, G + 0.98, HZ + 0.92, 0.1);
    box(0.02, 0.1, 0.02, GOLD, s * 0.62, G + 1.18, HZ + 0.92);
  }
  // saisen box
  box(0.9, 0.42, 0.42, WOOD, 0, G + 0.21, -0.1);
  for (let i = 0; i < 6; i++) box(0.9, 0.025, 0.05, LACQUER, 0, G + 0.435, -0.28 + i * 0.07);
  box(0.94, 0.04, 0.46, LACQUER, 0, G + 0.02, -0.1);

  // ---------- fox guardians ----------
  function fox(s: number) {
    const x = s * 0.88;
    const z = 0.55;
    const y0 = G + 0.32;
    box(0.55, 0.32, 0.55, STONE, x, G + 0.16, z);
    sph(0.2, STONE, x, y0 + 0.2, z - 0.07, { scale: [1, 1.05, 1.15] }, 8);
    cyl(0.1, 0.16, 0.4, 7, STONE, x, y0 + 0.3, z + 0.03, { rotation: [-8, 0, 0] });
    for (const sx of [1, -1]) cyl(0.045, 0.055, 0.36, 6, STONE, x + sx * 0.09, y0 + 0.19, z + 0.14);
    sph(0.13, STONE, x, y0 + 0.57, z + 0.08, { scale: [1.05, 0.92, 1] }, 8);
    cone(0.065, 0.2, 6, STONE, x, y0 + 0.54, z + 0.26, { dir: [0, -0.1, 1] });
    sph(0.02, LACQUER, x, y0 + 0.55, z + 0.37, {}, 5);
    for (const sx of [1, -1]) {
      cone(0.055, 0.19, 5, STONE, x + sx * 0.08, y0 + 0.74, z + 0.04, { rotation: [0, 0, -sx * 12] });
      box(0.035, 0.012, 0.012, LACQUER, x + sx * 0.06, y0 + 0.6, z + 0.2, { rotation: [0, 0, sx * -15] });
    }
    torus(0.115, 0.025, RED, x, y0 + 0.42, z + 0.07, { rotation: [80, 0, 0] });
    sph(0.035, GOLD, x, y0 + 0.36, z + 0.17, {}, 6);
    sph(0.12, STONE, x, y0 + 0.12, z - 0.3, { scale: [0.7, 0.6, 1.6] }, 8);
    sph(0.07, STONE, x, y0 + 0.2, z - 0.48, { scale: [0.8, 0.7, 1.2] }, 6);
  }
  fox(1);
  fox(-1);

  // ---------- offerings table ----------
  {
    const tx = -1.55;
    const tz = 0.5;
    box(0.95, 0.06, 0.55, WOODL, tx, G + 0.4, tz);
    box(0.7, 0.012, 0.5, RED, tx, G + 0.435, tz);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.06, 0.38, 0.06, WOOD, tx + sx * 0.4, G + 0.19, tz + sz * 0.22);
    // sake barrel
    const bx = tx - 0.3;
    cyl(0.13, 0.13, 0.26, 10, WOOD, bx, G + 0.57, tz);
    cyl(0.137, 0.137, 0.03, 10, GOLD, bx, G + 0.5, tz);
    cyl(0.137, 0.137, 0.03, 10, GOLD, bx, G + 0.64, tz);
    cyl(0.1, 0.1, 0.012, 10, LACQUER, bx, G + 0.706, tz);
    cone(0.04, 0.05, 6, PAPER, bx, G + 0.74, tz);
    // fruit tray
    cyl(0.18, 0.14, 0.05, 10, LACQUER, tx, G + 0.46, tz);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      sph(0.055, ORANGE, tx + Math.cos(a) * 0.09, G + 0.52, tz + Math.sin(a) * 0.09, {}, 6);
    }
    sph(0.055, ORANGE, tx, G + 0.6, tz, {}, 6);
    cone(0.02, 0.04, 5, GRASS1, tx, G + 0.66, tz);
    // mochi stack on sanpo stand
    const mx = tx + 0.3;
    box(0.2, 0.03, 0.2, WOODL, mx, G + 0.44, tz);
    sph(0.09, WHITE, mx, G + 0.49, tz, { scale: [1, 0.5, 1] }, 8);
    sph(0.075, WHITE, mx, G + 0.54, tz, { scale: [1, 0.5, 1] }, 8);
    sph(0.058, WHITE, mx, G + 0.58, tz, { scale: [1, 0.5, 1] }, 8);
    sph(0.03, ORANGE, mx, G + 0.625, tz, {}, 5);
    // cups
    for (const sx of [-1, 1]) {
      cyl(0.03, 0.022, 0.035, 8, WHITE, tx + sx * 0.12, G + 0.45, tz + 0.2);
      torus(0.03, 0.004, GOLD, tx + sx * 0.12, G + 0.467, tz + 0.2, { rotation: [90, 0, 0] });
    }
  }
  // incense burner
  {
    const ix = -0.85;
    const iz = 0.95;
    cyl(0.1, 0.07, 0.12, 8, STONE, ix, G + 0.06, iz);
    cyl(0.085, 0.085, 0.02, 8, LACQUER, ix, G + 0.12, iz);
    for (let i = 0; i < 4; i++) {
      const dx = (i - 1.5) * 0.03;
      cyl(0.005, 0.005, 0.2, 4, WOODL, ix + dx, G + 0.22, iz, { rotation: [0, 0, 8 - i * 5] });
      glow(sph(0.01, "#ff7a30", ix + dx - (8 - i * 5) * 0.0018, G + 0.32, iz, {}, 4), 1.5);
    }
  }

  // ---------- ema rack ----------
  {
    const rx = 1.4;
    const rz = -1.0;
    for (const sx of [1, -1]) box(0.07, 1.15, 0.07, WOOD, rx + sx * 0.4, G + 0.58, rz);
    box(0.95, 0.05, 0.07, WOOD, rx, G + 0.98, rz);
    box(1.0, 0.04, 0.28, ROOF, rx, G + 1.16, rz);
    box(1.0, 0.03, 0.03, GOLD, rx, G + 1.19, rz + 0.15);
    for (let i = 0; i < 5; i++) {
      const ex = rx - 0.3 + i * 0.15;
      b.sweep(
        [
          [ex, G + 0.98, rz + 0.02],
          [ex, G + 0.9, rz + 0.02],
        ],
        { radius: 0.004, color: STRAW, sides: 4, bone: R },
      );
      box(0.13, 0.17, 0.012, WOODL, ex, G + 0.8, rz + 0.02);
      plane(0.14, 0.19, EMA, ex, G + 0.79, rz + 0.03);
    }
  }

  // ---------- water basin ----------
  {
    const wx = 1.5;
    const wz = 0.75;
    cyl(0.2, 0.26, 0.28, 8, STONE, wx, G + 0.14, wz);
    cyl(0.2, 0.2, 0.02, 8, WATER, wx, G + 0.285, wz);
    glow(cyl(0.18, 0.18, 0.005, 8, "#9ff0ff", wx, G + 0.295, wz, { flat: false }), 0.7);
    box(0.5, 0.025, 0.04, "#d8c27a", wx, G + 0.31, wz + 0.02, { rotation: [0, 20, 0] });
    cyl(0.04, 0.04, 0.05, 8, "#d8c27a", wx + 0.22, G + 0.32, wz - 0.04);
  }

  // ---------- sakura tree ----------
  {
    const tx = -1.95;
    const tz = -1.5;
    b.sweep(
      catmull([
        [tx, G - 0.05, tz],
        [tx + 0.05, 1.0, tz + 0.05],
        [tx - 0.1, 2.0, tz],
        [tx + 0.1, 2.9, tz - 0.05],
      ]),
      { radius: [0.24, 0.1], color: BARK, sides: 8, bone: R, caps: { start: "flat", end: "round" } },
    );
    for (const [dx, dy, dz] of [
      [0.9, 3.4, 0.2],
      [-0.7, 3.5, -0.3],
      [0.1, 3.7, 0.6],
    ])
      b.sweep(
        catmull([
          [tx, 2.2, tz],
          [tx + dx * 0.5, 2.9, tz + dz * 0.5],
          [tx + dx, dy, tz + dz],
        ]),
        { radius: [0.07, 0.03], color: BARK, sides: 6, bone: R },
      );
    for (const [dx, dy, dz, r] of [
      [0.0, 3.3, 0.0, 0.85],
      [0.9, 3.3, 0.2, 0.65],
      [-0.7, 3.4, -0.3, 0.7],
      [0.2, 3.6, 0.6, 0.6],
      [-0.2, 3.7, -0.5, 0.55],
      [0.6, 3.7, -0.3, 0.5],
    ])
      P(new THREE.IcosahedronGeometry(r, 1), PINK, tx + dx, dy, tz + dz, { scale: [1, 0.8, 1] });
    for (let i = 0; i < 8; i++) {
      const a = rand() * 6.28;
      P(new THREE.IcosahedronGeometry(0.2, 0), PINKD, tx + Math.cos(a) * 0.9, 3.0 + rand() * 0.6, tz + Math.sin(a) * 0.9);
    }
    P(new THREE.IcosahedronGeometry(0.3, 0), STONE, tx + 0.3, G + 0.05, tz + 0.4, { scale: [1, 0.6, 1] });
  }

  // ---------- sigil and wisps ----------
  glow(plane(1.5, 1.5, SIGIL, 0, G + 0.058, 0.9, { dir: [0, 1, 0], axis: "z" }), 1.4);
  for (const [x, y, z] of [
    [0.6, 1.5, 0.6],
    [-0.5, 1.9, 0.3],
    [0.2, 2.3, 0.9],
    [-1.0, 1.2, 0.9],
    [1.0, 1.7, 0.2],
  ])
    glow(sph(0.04, "#9ff0ff", x, y, z, {}, 6), 1.6);

  return b.root;
}
