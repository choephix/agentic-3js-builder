// A wizard's bookshelf: tall carved shelf with a moon-and-star crown, shelves of tomes, scroll rack, glowing orbs,
// candles, an open spellbook, potions, a wizard hat, plus a rug, scroll basket and book pile on the floor.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { DEG, rng } from "../../../../src/math";
import { grain, spots } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall carved wizard's bookshelf with a moon-and-star crown, shelves of tomes, a scroll rack, glowing orbs, candles, an open spellbook, potions and a wizard hat, with a rug, scroll basket and book pile at its feet.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 2048 });
  const root = b.joint("base", { at: [0, 0, 0] });
  const r = rng(7);

  // ---------------------------------------------------------------- palette
  const WOOD = cel(grain("#8b5230", "#6d3b20", { size: 0.012, axis: "y", seed: 2 }));
  const WOODH = cel(grain("#94592f", "#73411f", { size: 0.012, axis: "x", seed: 5 }));
  const DARK = cel(grain("#4d2c1c", "#3a2014", { size: 0.012, axis: "x", seed: 9 }));
  const GOLD = cel("#f4c542", "#c2851f");
  const PAGES = cel("#f6ecd0", "#d8c9a0");
  const PARCH = cel("#f3e4b8", "#d9c18a");
  const PARCH2 = cel("#e9d3a0", "#c9ad78");
  const LABEL = cel("#f7efd6", "#d8cba2");
  const WICKER = cel(grain("#c9984f", "#a8742f", { size: 0.01, axis: "y", seed: 4 }));
  const HAT = cel(spots("#4a2f94", "#f7d774", { size: 0.06, amount: 0.15, seed: 3 }));
  const COV: Fill[] = [
    cel("#b3262e"),
    cel("#2c55b8"),
    cel("#1f8f5f"),
    cel("#6d41a8"),
    cel("#1f8f9f"),
    cel("#d9822b"),
    cel("#8a2d63"),
    cel("#2f6b3a"),
    cel("#243165"),
    cel("#d9d2b8"),
  ];
  const RED = COV[0];
  const WAX = [cel("#f6ead0", "#dccba4"), cel("#c93a3a"), cel("#4a7fd0")];

  // ---------------------------------------------------------------- textures
  const orbTex = (light: string, mid: string, deep: string, seed: number) => {
    const rs = rng(seed);
    let s = "";
    for (let i = 0; i < 5; i++) {
      const y = 8 + i * 11 + rs() * 4;
      s += `<path d="M0 ${y.toFixed(1)} Q32 ${(y - 10 - rs() * 6).toFixed(1)} 64 ${y.toFixed(1)} T128 ${y.toFixed(1)}" stroke="${light}" stroke-width="3" fill="none" stroke-opacity="0.55"/>`;
    }
    for (let i = 0; i < 16; i++)
      s += `<circle cx="${(rs() * 128).toFixed(1)}" cy="${(rs() * 64).toFixed(1)}" r="${(0.8 + rs() * 1.6).toFixed(1)}" fill="#ffffff"/>`;
    return svg(
      `<svg viewBox="0 0 128 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${mid}"/><stop offset="1" stop-color="${deep}"/></linearGradient></defs><rect width="128" height="64" fill="url(#g)"/>${s}</svg>`,
      { size: 256 },
    );
  };
  const ORB_BLUE = orbTex("#d4fbff", "#58d4ff", "#2a5fd6", 21);
  const ORB_VIOLET = orbTex("#f0d8ff", "#b27cff", "#5a2ea8", 22);
  const ORB_GREEN = orbTex("#e0ffe4", "#6df0a8", "#1f9a8a", 23);

  const spiralPts = Array.from({ length: 70 }, (_, i) => {
    const a = i * 0.34;
    const rr = 2 + i * 0.62;
    return `${(50 + rr * Math.cos(a)).toFixed(1)},${(50 + rr * Math.sin(a)).toFixed(1)}`;
  });
  const SPIRAL = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#f1deae"/><polyline points="${spiralPts.join(" ")}" stroke="#b08850" stroke-width="4" fill="none"/></svg>`,
    { size: 128 },
  );

  const rb = rng(11);
  let stars = "";
  for (let i = 0; i < 90; i++)
    stars += `<circle cx="${(rb() * 110).toFixed(1)}" cy="${(rb() * 174).toFixed(1)}" r="${(0.4 + rb() * 1.1).toFixed(1)}" fill="#fff3c4"/>`;
  const penta = [0, 2, 4, 1, 3, 0]
    .map((k) => {
      const a = (-90 + k * 72) * DEG;
      return `${(55 + 36 * Math.cos(a)).toFixed(1)},${(60 + 36 * Math.sin(a)).toFixed(1)}`;
    })
    .join(" ");
  const BACK = svg(
    `<svg viewBox="0 0 110 174"><defs><linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a78"/><stop offset="1" stop-color="#1b2157"/></linearGradient></defs><rect width="110" height="174" fill="url(#n)"/>${stars}<circle cx="55" cy="60" r="40" fill="none" stroke="#f4c542" stroke-width="1.2" stroke-opacity="0.8"/><circle cx="55" cy="60" r="30" fill="none" stroke="#f4c542" stroke-width="1" stroke-opacity="0.6"/><polyline points="${penta}" fill="none" stroke="#f4c542" stroke-width="1" stroke-opacity="0.8"/><polyline points="10,140 28,128 44,146 70,132 98,150" fill="none" stroke="#ffe9a0" stroke-width="1"/></svg>`,
    { size: 512 },
  );

  let vine = "";
  for (let i = 0; i < 9; i++) {
    const y = 12 + i * 19;
    vine += `<ellipse cx="${i % 2 ? 22 : 8}" cy="${y}" rx="5" ry="2.4" fill="#f4c542" transform="rotate(${i % 2 ? -30 : 30} ${i % 2 ? 22 : 8} ${y})"/><circle cx="15" cy="${y + 9}" r="2" fill="#59e6d5"/>`;
  }
  const VINE = svg(
    `<svg viewBox="0 0 30 180"><path d="M15 0 Q27 22 15 45 T15 90 T15 135 T15 180" stroke="#f4c542" stroke-width="1.8" fill="none"/>${vine}</svg>`,
    { size: 512 },
  );

  const TEXT = svg(
    `<svg viewBox="0 0 60 80"><text x="4" y="14" font-size="14" fill="#a8341f" font-family="serif">A</text>${Array.from(
      { length: 9 },
      (_, i) =>
        `<line x1="${i === 0 ? 18 : 5}" y1="${10 + i * 8}" x2="${50 - (i % 3) * 5}" y2="${10 + i * 8}" stroke="#5b3a1e" stroke-width="2"/>`,
    ).join("")}</svg>`,
    { size: 128 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="#6ff0ff" stroke-width="2"/><circle cx="40" cy="40" r="24" fill="none" stroke="#6ff0ff" stroke-width="1.6"/><polyline points="${[0, 2, 4, 1, 3, 0]
      .map((k) => {
        const a = (-90 + k * 72) * DEG;
        return `${(40 + 24 * Math.cos(a)).toFixed(1)},${(40 + 24 * Math.sin(a)).toFixed(1)}`;
      })
      .join(" ")}" fill="none" stroke="#bafaff" stroke-width="1.6"/><path d="M40 6 v6 M40 68 v6 M6 40 h6 M68 40 h6" stroke="#6ff0ff" stroke-width="2"/></svg>`,
    { size: 256 },
  );

  const RUG = svg(
    `<svg viewBox="0 0 190 95"><ellipse cx="95" cy="47.5" rx="94" ry="46" fill="#7b1e34"/><ellipse cx="95" cy="47.5" rx="88" ry="40" fill="none" stroke="#e9c46a" stroke-width="2"/><ellipse cx="95" cy="47.5" rx="76" ry="32" fill="#2d2a6e"/><ellipse cx="95" cy="47.5" rx="76" ry="32" fill="none" stroke="#e9c46a" stroke-width="1.5"/>${Array.from(
      { length: 9 },
      (_, i) =>
        `<polygon points="${30 + i * 16},47.5 ${38 + i * 16},40 ${46 + i * 16},47.5 ${38 + i * 16},55" fill="#e9c46a" opacity="0.9"/>`,
    ).join("")}<circle cx="95" cy="47.5" r="14" fill="#7b1e34" stroke="#e9c46a" stroke-width="2"/><polygon points="95,37 98,45 106,45 100,50 102,58 95,53 88,58 90,50 84,45 92,45" fill="#e9c46a"/></svg>`,
    { size: 1024 },
  );

  // ---------------------------------------------------------------- helpers
  const box = (size: number[], color: Fill, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: root, at, rotation: rot });
  const cyl = (
    rt: number,
    rbm: number,
    h: number,
    seg: number,
    color: Fill,
    at: number[],
    extra: { dir?: number[]; rotation?: number[] } = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rbm, h, seg), color, { bone: root, at, ...extra });
  const sph = (rad: number, color: Fill, at: number[], scale?: number[], ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(rad, ws, hs), color, { bone: root, at, ...(scale ? { scale } : {}) });
  const tor = (R: number, t: number, color: Fill, at: number[], rotation: number[], seg = 24) =>
    b.part(new THREE.TorusGeometry(R, t, 5, seg), color, { bone: root, at, rotation });
  const lath = (outline: OutlinePoint[], color: Fill, at: number[], segments = 10, rotation?: number[], scale?: number) =>
    b.lathe(outline, {
      at,
      bone: root,
      color,
      segments,
      ...(rotation ? { rotation } : {}),
      ...(scale ? { scale } : {}),
    } as Parameters<typeof b.lathe>[1]);

  // ---------------------------------------------------------------- books
  const book = (x: number, y: number, z: number, t: number, h: number, d: number, cover: Fill, tilt = 0) => {
    const c = Math.cos(tilt * DEG);
    const s = Math.sin(tilt * DEG);
    const P = (lx: number, ly: number, lz: number) => [x + lx * c - ly * s, y + lx * s + ly * c, z + lz];
    const rot = [0, 0, tilt];
    box([t - 0.012, h - 0.01, d - 0.012], PAGES, P(0, h / 2, -0.004), rot);
    for (const sg of [1, -1]) box([0.008, h, d - 0.004], cover, P(sg * (t / 2 - 0.004), h / 2, -0.002), rot);
    box([t, h, 0.01], cover, P(0, h / 2, d / 2 - 0.005), rot);
    box([t, h, 0.006], cover, P(0, h / 2, -d / 2 + 0.003), rot);
    for (const fy of [0.1, 0.9]) box([t + 0.004, 0.012, 0.004], GOLD, P(0, h * fy, d / 2 + 0.001), rot);
    box([t * 0.7, Math.min(0.06, h * 0.2), 0.004], LABEL, P(0, h * 0.55, d / 2 + 0.001), rot);
  };
  const row = (xs: number, xe: number, y: number, maxH: number, lean: boolean) => {
    let x = xs;
    for (;;) {
      const t = 0.03 + r() * 0.04;
      const h = Math.min(maxH, 0.24 + r() * 0.16);
      if (x + t + (lean ? 0.12 : 0) > xe) break;
      const d = 0.2 + r() * 0.06;
      book(x + t / 2, y, 0.09 - d / 2 - r() * 0.015, t, h, d, COV[Math.floor(r() * COV.length)], 0);
      x += t + 0.003;
    }
    if (lean) book(x + 0.02 + 0.045, y, -0.03, 0.04, Math.min(maxH, 0.34), 0.24, COV[Math.floor(r() * COV.length)], 14);
  };
  const flatBook = (cx: number, y: number, cz: number, w: number, t: number, d: number, cover: Fill, rotY: number) => {
    const c = Math.cos(rotY * DEG);
    const s = Math.sin(rotY * DEG);
    const P = (lx: number, ly: number, lz: number) => [cx + lx * c + lz * s, y + ly, cz - lx * s + lz * c];
    const rot = [0, rotY, 0];
    box([w - 0.01, t - 0.012, d - 0.012], PAGES, P(0, t / 2, -0.004), rot);
    box([w, 0.008, d], cover, P(0, 0.004, 0), rot);
    box([w, 0.008, d], cover, P(0, t - 0.004, 0), rot);
    box([w, t, 0.01], cover, P(0, t / 2, d / 2 - 0.005), rot);
    for (const sx of [-1, 1]) box([0.012, t + 0.004, 0.004], GOLD, P(sx * w * 0.3, t / 2, d / 2 + 0.001), rot);
    box([0.06, t * 0.5, 0.004], LABEL, P(0, t / 2, d / 2 + 0.001), rot);
  };
  const stack = (cx: number, y: number, cz: number, specs: number[][]) => {
    let yy = y;
    specs.forEach(([w, t, rotY], i) => {
      flatBook(cx, yy, cz, w, t, 0.22, COV[(i * 3 + 1) % COV.length], rotY);
      yy += t;
    });
    return yy;
  };

  // ---------------------------------------------------------------- candles, orbs, scrolls, potions
  const FLAME: OutlinePoint[] = [
    [0, 0],
    [0.011, 0.01],
    [0.013, 0.022],
    [0.008, 0.04],
    [0, 0.062],
  ];
  const candle = (x: number, y: number, z: number, h: number, wax: Fill, rad = 0.016) => {
    lath(
      [
        [0, 0],
        [rad + 0.03, 0],
        [rad + 0.03, 0.008],
        [rad + 0.006, 0.018],
        [rad + 0.006, 0.03],
        [0, 0.03],
      ],
      GOLD,
      [x, y, z],
      10,
    );
    const top = y + 0.03 + h;
    cyl(rad, rad, h, 8, wax, [x, y + 0.03 + h / 2, z]);
    sph(0.007, wax, [x + rad * 0.95, top - 0.015, z], [1, 2.4, 1]);
    sph(0.006, wax, [x - rad * 0.6, top - 0.02, z + rad * 0.7], [1, 1.8, 1]);
    box([0.003, 0.012, 0.003], "#2b1a12", [x, top + 0.005, z]);
    glow(lath(FLAME, "#ff9a2e", [x, top + 0.004, z], 6), 1.6);
    glow(lath(FLAME, "#fff0a0", [x, top + 0.008, z], 6, undefined, 0.55), 2);
    return top + 0.07;
  };
  const STAND: number[][] = [
    [0, 0],
    [0.07, 0],
    [0.07, 0.012],
    [0.045, 0.026],
    [0.03, 0.05],
    [0.045, 0.07],
    [0.055, 0.08],
    [0, 0.08],
  ];
  const orb = (x: number, y: number, z: number, rad: number, tex: THREE.Texture, rings: boolean) => {
    const s = rad / 0.095;
    const sh = 0.08 * s;
    lath(
      STAND.map(([px, py]) => [px * s, py * s] as [number, number]),
      GOLD,
      [x, y, z],
      10,
    );
    const cy = y + sh + rad * 0.85;
    glow(b.part(new THREE.SphereGeometry(rad, 14, 10), "#ffffff", { bone: root, at: [x, cy, z], texture: tex }), 1);
    glow(sph(rad * 0.17, "#ffffff", [x - 0.38 * rad, cy + 0.5 * rad, z + 0.72 * rad], [1, 0.7, 0.5], 6, 4), 1);
    for (let k = 0; k < 4; k++) {
      const a = (k * 90 + 45) * DEG;
      b.rod(
        [x + Math.cos(a) * 0.05 * s, y + sh, z + Math.sin(a) * 0.05 * s],
        [x + Math.cos(a) * rad * 0.9, cy - rad * 0.3, z + Math.sin(a) * rad * 0.9],
        0.006 * s,
        GOLD,
        { bone: root, sides: 5 },
      );
    }
    if (rings)
      for (const rot of [[0, 0, 0], [90, 0, 0], [0, 60, 0], [60, 0, 0]])
        tor(rad * 1.35, 0.0045 * s, GOLD, [x, cy, z], rot, 28);
  };
  const scroll = (at: number[], len: number, rad: number, dir: number[], paper: Fill, ribbon: string) => {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const c = new THREE.Vector3(at[0], at[1], at[2]);
    cyl(rad, rad, len, 10, paper, at, { dir: d.toArray() });
    const e1 = c.clone().addScaledVector(d, len / 2 + 0.02);
    const e0 = c.clone().addScaledVector(d, -len / 2 - 0.02);
    b.rod(e0.toArray(), e1.toArray(), rad * 0.28, DARK, { bone: root, sides: 6 });
    sph(rad * 0.5, DARK, e1.toArray(), undefined, 6, 4);
    sph(rad * 0.5, DARK, e0.toArray(), undefined, 6, 4);
    const rp = c.clone().addScaledVector(d, len * 0.22);
    cyl(rad + 0.003, rad + 0.003, 0.018, 10, ribbon, rp.toArray(), { dir: d.toArray() });
    sph(0.011, "#b3262e", [rp.x, rp.y + rad + 0.004, rp.z], [1, 0.5, 1], 6, 4);
    for (const sg of [1, -1])
      b.part(new THREE.CircleGeometry(rad * 0.97, 12), SPIRAL, {
        bone: root,
        at: c.clone().addScaledVector(d, (sg * len) / 2 + sg * 0.001).toArray(),
        dir: d.clone().multiplyScalar(sg).toArray(),
        axis: "z",
        texture: SPIRAL,
      });
  };
  const potion = (x: number, y: number, z: number, s: number, color: string) => {
    const pts: Array<[number, number]> = [
      [0, 0],
      [0.03 * s, 0],
      [0.04 * s, 0.018 * s],
      [0.04 * s, 0.055 * s],
      [0.016 * s, 0.09 * s],
      [0.016 * s, 0.115 * s],
      [0, 0.115 * s],
    ];
    glow(lath(pts, color, [x, y, z], 8), 1.2);
    cyl(0.017 * s, 0.014 * s, 0.03 * s, 6, "#8a5a33", [x, y + 0.125 * s, z]);
    tor(0.017 * s, 0.003, GOLD, [x, y + 0.108 * s, z], [90, 0, 0], 10);
    box([0.04 * s, 0.035 * s, 0.003], LABEL, [x, y + 0.04 * s, z + 0.039 * s]);
    box([0.014 * s, 0.014 * s, 0.003], "#a8341f", [x, y + 0.04 * s, z + 0.041 * s], [0, 0, 45]);
  };
  const openBook = (x: number, y: number, z: number) => {
    box([0.32, 0.016, 0.2], RED, [x, y + 0.008, z]);
    box([0.33, 0.004, 0.006], GOLD, [x, y + 0.016, z + 0.1]);
    cyl(0.012, 0.012, 0.19, 8, RED, [x, y + 0.022, z], { dir: [0, 0, 1] });
    for (const sg of [1, -1]) {
      const tilt = 5 * sg;
      box([0.14, 0.022, 0.19], PAGES, [x - sg * 0.072, y + 0.031, z + 0.002], [0, 0, tilt]);
      const n = [-Math.sin(tilt * DEG), Math.cos(tilt * DEG), 0];
      const plane = b.part(new THREE.PlaneGeometry(0.115, 0.16), "#ffffff", {
        bone: root,
        at: [x - sg * 0.072 + n[0] * 0.001, y + 0.044, z + 0.002],
        dir: n,
        axis: "z",
        up: [0, 0, -1],
        texture: sg > 0 ? TEXT : RUNE,
      });
      if (sg < 0) glow(plane, 1.3);
    }
  };

  // ---------------------------------------------------------------- the shelf
  const TOPS = [0.12, 0.58, 1.02, 1.44];
  // plinth and floor
  box([1.3, 0.1, 0.46], DARK, [0, 0.05, 0]);
  box([1.34, 0.02, 0.48], WOODH, [0, 0.1, 0]);
  box([1.3, 0.012, 0.004], GOLD, [0, 0.05, 0.231]);
  // sides
  for (const sg of [1, -1]) {
    box([0.05, 1.8, 0.4], WOOD, [sg * 0.575, 1.0, 0]);
    box([0.03, 1.76, 0.006], GOLD, [sg * 0.575, 1.0, 0.203]);
    for (const gy of [0.35, 0.8, 1.25, 1.7]) glow(sph(0.014, "#59e6d5", [sg * 0.575, gy, 0.209], [1, 1, 0.6], 6, 4), 1.2);
    b.part(new THREE.PlaneGeometry(0.28, 1.68), "#ffffff", {
      bone: root,
      at: [sg * 0.6025, 1.0, 0],
      dir: [sg, 0, 0],
      axis: "z",
      texture: VINE,
    });
  }
  // back
  box([1.1, 1.8, 0.02], DARK, [0, 1.0, -0.18]);
  b.part(new THREE.PlaneGeometry(1.1, 1.74), "#ffffff", {
    bone: root,
    at: [0, 1.0, -0.1695],
    dir: [0, 0, 1],
    axis: "z",
    texture: BACK,
  });
  // shelf boards
  TOPS.forEach((top) => {
    box([1.1, 0.03, 0.36], WOODH, [0, top - 0.015, 0.01]);
    box([1.1, 0.01, 0.008], GOLD, [0, top - 0.018, 0.194]);
  });
  // cornice, dentils, crown
  box([1.3, 0.06, 0.46], WOODH, [0, 1.93, 0]);
  box([1.34, 0.02, 0.48], DARK, [0, 1.97, 0]);
  box([1.3, 0.01, 0.01], GOLD, [0, 1.93, 0.232]);
  for (let i = 0; i < 20; i++) box([0.026, 0.025, 0.02], GOLD, [-0.58 + i * 0.061, 1.885, 0.222]);
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      lath(
        [
          [0, 0],
          [0.025, 0],
          [0.02, 0.02],
          [0.012, 0.03],
          [0.03, 0.06],
          [0.03, 0.075],
          [0.012, 0.1],
          [0, 0.12],
        ],
        GOLD,
        [sx * 0.62, 1.98, sz * 0.2],
        8,
      );
  const arch: Array<[number, number]> = [
    [-0.32, 0],
    [0.32, 0],
    [0.31, 0.06],
    [0.26, 0.1],
    [0.2, 0.17],
    [0.14, 0.25],
    [0.07, 0.32],
    [0, 0.37],
    [-0.07, 0.32],
    [-0.14, 0.25],
    [-0.2, 0.17],
    [-0.26, 0.1],
    [-0.31, 0.06],
  ];
  b.extrude(arch, { at: [0, 1.98, 0], x: [1, 0, 0], thickness: 0.05, bevel: 0.006, smoothing: 1, color: DARK, bone: root });
  b.sweep(
    arch.slice(1, 8).map(([ax, ay]) => [ax, 1.98 + ay, 0.027]),
    0.006,
    { color: GOLD, bone: root, sides: 5 },
  );
  b.sweep(
    [[0, 0.37], ...arch.slice(8)].map(([ax, ay]) => [ax, 1.98 + ay, 0.027]),
    0.006,
    { color: GOLD, bone: root, sides: 5 },
  );
  // crescent moon and stars
  const cres: OutlinePoint[] = [];
  for (let k = 0; k <= 10; k++) {
    const a = (50.3 + (309.7 - 50.3) * (k / 10)) * DEG;
    cres.push([0.1 * Math.cos(a), 0.1 * Math.sin(a)]);
  }
  for (let k = 1; k < 8; k++) {
    const p = (285.9 - (285.9 - 74.1) * (k / 8)) * DEG;
    cres.push([0.1 * (0.42 + 0.8 * Math.cos(p)), 0.1 * 0.8 * Math.sin(p)]);
  }
  const moon = cres.map((p) => [-p[1], p[0]] as [number, number]);
  b.extrude(moon, { at: [0, 2.16, 0.03], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: GOLD, bone: root });
  const star = (rad: number): OutlinePoint[] =>
    Array.from({ length: 10 }, (_, i) => {
      const a = (90 + i * 36) * DEG;
      const q = i % 2 ? rad * 0.45 : rad;
      return [q * Math.cos(a), q * Math.sin(a), ...(i % 2 ? [] : ["sharp"])] as unknown as [number, number];
    });
  glow(b.extrude(star(0.04), { at: [0, 2.2, 0.03], x: [1, 0, 0], thickness: 0.012, color: "#ffe36e", bone: root }), 1.6);
  for (const sx of [1, -1])
    b.extrude(star(0.035), { at: [sx * 0.2, 2.07, 0.03], x: [1, 0, 0], thickness: 0.012, bevel: 0.002, color: GOLD, bone: root });

  // ---------------------------------------------------------------- shelf 0
  row(-0.545, -0.18, TOPS[0], 0.38, true);
  const s0 = stack(0.0, TOPS[0], 0.0, [
    [0.28, 0.05, 0],
    [0.25, 0.04, 8],
    [0.27, 0.06, -6],
    [0.22, 0.035, 14],
  ]);
  candle(0.0, s0, 0.0, 0.06, WAX[0]);
  orb(0.33, TOPS[0], 0.03, 0.085, ORB_BLUE, true);
  row(0.42, 0.545, TOPS[0], 0.34, false);

  // ---------------------------------------------------------------- shelf 1 (books + scroll rack)
  row(-0.545, 0.1, TOPS[1], 0.37, true);
  const rx = [0.145, 0.275, 0.405, 0.535];
  const rackY = TOPS[1];
  for (const x of rx) box([0.012, 0.34, 0.2], WOODH, [x, rackY + 0.17, 0]);
  box([0.4, 0.012, 0.2], WOODH, [0.34, rackY + 0.17, 0]);
  box([0.4, 0.012, 0.2], WOODH, [0.34, rackY + 0.34, 0]);
  const scrollSpecs: Array<[number, number, number, number, Fill, string]> = [
    [0, 0, 0.044, 0, PARCH, "#b3262e"],
    [1, 0, 0.03, -0.03, PARCH2, "#2c55b8"],
    [1, 0, 0.03, 0.03, PARCH, "#1f8f5f"],
    [2, 0, 0.044, 0, PARCH2, "#d9822b"],
    [0, 1, 0.046, 0, PARCH2, "#6d41a8"],
    [2, 1, 0.046, 0, PARCH, "#b3262e"],
  ];
  for (const [ci, ri, rad, off, paper, rib] of scrollSpecs) {
    const cx = (rx[ci] + rx[ci + 1]) / 2 + off;
    const cy = ri === 0 ? rackY + 0.003 + rad : rackY + 0.176 + rad;
    scroll([cx, cy, 0], 0.19, rad, [0, 0, 1], paper, rib);
  }
  // middle upper cubby holds a rolled map and a small crystal
  glow(sph(0.035, "#8fe9ff", [0.34, rackY + 0.176 + 0.035, 0.03], undefined, 8, 6), 1.2);
  for (let k = 0; k < 3; k++) {
    box([0.056, 0.012, 0.004], GOLD, [(rx[k] + rx[k + 1]) / 2, rackY + 0.17, 0.102]);
    box([0.056, 0.012, 0.004], GOLD, [(rx[k] + rx[k + 1]) / 2, rackY + 0.34, 0.102]);
  }

  // ---------------------------------------------------------------- shelf 2
  row(-0.545, -0.2, TOPS[2], 0.38, true);
  openBook(-0.02, TOPS[2], 0.02);
  potion(0.22, TOPS[2], 0.05, 1, "#b57bff");
  potion(0.3, TOPS[2], 0.0, 1.25, "#7dffb0");
  orb(0.44, TOPS[2], 0.03, 0.05, ORB_VIOLET, false);

  // ---------------------------------------------------------------- shelf 3
  row(-0.4, -0.2, TOPS[3], 0.38, false);
  row(0.2, 0.4, TOPS[3], 0.38, false);
  orb(0.0, TOPS[3], 0.04, 0.12, ORB_GREEN, true);
  for (const sg of [1, -1]) {
    lath(
      [
        [0, 0],
        [0.05, 0],
        [0.05, 0.012],
        [0.02, 0.04],
        [0.015, 0.14],
        [0.03, 0.16],
        [0.03, 0.18],
        [0, 0.18],
      ],
      GOLD,
      [sg * 0.49, TOPS[3], 0.02],
      10,
    );
    candle(sg * 0.49, TOPS[3] + 0.18, 0.02, 0.1, WAX[sg > 0 ? 1 : 2]);
  }

  // ---------------------------------------------------------------- shelf top: candelabra and wizard hat
  const cx0 = -0.45;
  const yt = 1.98;
  lath(
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.015],
      [0.03, 0.04],
      [0.02, 0.1],
      [0.035, 0.13],
      [0.03, 0.14],
      [0, 0.14],
    ],
    GOLD,
    [cx0, yt, 0],
    10,
  );
  candle(cx0, yt + 0.14, 0, 0.12, WAX[0]);
  for (const sg of [1, -1]) {
    b.rod([cx0, yt + 0.12, 0], [cx0 + sg * 0.09, yt + 0.19, 0], 0.007, GOLD, { bone: root, sides: 5 });
    candle(cx0 + sg * 0.09, yt + 0.19, 0, sg > 0 ? 0.08 : 0.06, WAX[sg > 0 ? 2 : 1], 0.014);
  }
  lath(
    [
      [0, 0],
      [0.14, 0],
      [0.14, 0.008],
      [0.09, 0.016],
      [0, 0.016],
    ],
    HAT,
    [0.45, yt, 0],
    14,
  );
  lath(
    [
      [0, 0],
      [0.085, 0],
      [0.075, 0.1],
      [0.05, 0.2],
      [0.025, 0.28],
      [0, 0.32],
    ],
    HAT,
    [0.45, yt + 0.01, 0],
    12,
    [0, 0, -10],
  );
  tor(0.082, 0.008, GOLD, [0.45, yt + 0.03, 0], [90, 0, 0], 14);
  box([0.03, 0.03, 0.01], GOLD, [0.45, yt + 0.03, 0.088]);
  box([0.016, 0.016, 0.012], "#4a2f94", [0.45, yt + 0.03, 0.09]);

  // ---------------------------------------------------------------- floor dressing
  b.part(new THREE.PlaneGeometry(1.9, 0.95), "#ffffff", {
    bone: root,
    at: [0, 0.004, 0.55],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RUG,
  });
  const pileTop = stack(0.82, 0.008, 0.5, [
    [0.34, 0.06, 0],
    [0.3, 0.05, 20],
    [0.28, 0.07, -12],
    [0.24, 0.04, 33],
  ]);
  candle(0.82, pileTop, 0.5, 0.1, WAX[1]);
  // basket of scrolls
  const bx = -0.82;
  const bz = 0.5;
  lath(
    [
      [0, 0],
      [0.11, 0],
      [0.15, 0.24],
      [0.138, 0.24],
      [0.1, 0.02],
      [0, 0.02],
    ],
    WICKER,
    [bx, 0.008, bz],
    12,
  );
  tor(0.145, 0.01, WICKER, [bx, 0.248, bz], [90, 0, 0], 14);
  const leans: Array<[number[], number, number, Fill, string]> = [
    [[0.25, 1, 0.1], -0.04, 0.0, PARCH, "#b3262e"],
    [[-0.2, 1, 0.15], 0.04, 0.02, PARCH2, "#2c55b8"],
    [[0.05, 1, -0.25], 0.0, -0.05, PARCH, "#1f8f5f"],
    [[-0.05, 1, 0.28], -0.02, 0.05, PARCH2, "#d9822b"],
    [[0.3, 1, -0.1], 0.05, -0.02, PARCH, "#6d41a8"],
  ];
  for (const [dir, ox, oz, paper, rib] of leans) {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const base = new THREE.Vector3(bx + ox, 0.06, bz + oz);
    const c = base.addScaledVector(d, 0.19);
    scroll(c.toArray(), 0.38, 0.032, dir, paper, rib);
  }
  // small glowing orb on a cushion at the shelf's foot
  cyl(0.09, 0.1, 0.04, 10, COV[7], [0.0, 0.028, 0.62]);
  sph(0.012, GOLD, [0.0, 0.052, 0.62], undefined, 6, 4);
  orb(0.0, 0.048, 0.62, 0.05, ORB_BLUE, false);

  return b.root;
}
