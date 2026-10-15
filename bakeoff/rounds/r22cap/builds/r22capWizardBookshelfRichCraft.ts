import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { svg } from "../../../../src/texture";
import { grain } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A midnight-blue lacquered wizard's bookcase with gold filigree, arched crown, ranks of tomes, scroll pyramids, glowing orbs, crystals, candles and floor clutter.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type Col = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "wizardBookshelf" });
  const R = rng(11);
  const R2 = rng(5);

  // ---------- palette ----------
  const GOLD = cel("#f4c84e", "#c98a2b");
  const SIDE = cel(grain("#3b3f93", "#31367f", { size: 0.015, axis: "y" }));
  const BOARD = cel(grain("#4a50a8", "#3c4195", { size: 0.015, axis: "x" }));
  const PLINTH = cel(grain("#2a2d70", "#232660", { size: 0.015, axis: "x" }));
  const BACKW = "#25286a";
  const PAGES = "#f4e4bf";
  const PARCH = "#efd9a0";
  const WAX = "#fff1d0";
  const RUBY = "#e0334f";
  const BOOKS: Paint[] = [
    cel("#b3263e"),
    cel("#2b7fd4"),
    cel("#2f9e6b"),
    cel("#8a45d0"),
    cel("#e8922a"),
    cel("#1fa5b0"),
    cel("#d4538f"),
    cel("#6b4a36"),
    cel("#3a3fa8"),
  ];
  const RIBBONS = ["#e0334f", "#2b7fd4", "#2f9e6b", "#8a45d0"];

  // ---------- textures ----------
  let stars = "";
  for (let i = 0; i < 46; i++) {
    stars += `<circle cx="${(R2() * 108 + 1).toFixed(1)}" cy="${(R2() * 198 + 1).toFixed(1)}" r="${(0.4 + R2() * 0.9).toFixed(2)}" fill="#ffe9a0"/>`;
  }
  const BACK = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 200"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14123f"/><stop offset="0.6" stop-color="#2a2a7a"/><stop offset="1" stop-color="#4a2f7a"/></linearGradient></defs><rect width="110" height="200" fill="url(#g)"/>${stars}<circle cx="80" cy="30" r="13" fill="#f7e6a8"/><circle cx="86" cy="26" r="12" fill="#1d1c58"/><circle cx="55" cy="110" r="38" fill="none" stroke="#e8b84a" stroke-width="0.7"/><circle cx="55" cy="110" r="31" fill="none" stroke="#e8b84a" stroke-width="0.5"/><polygon points="55,72 88,129 22,129" fill="none" stroke="#e8b84a" stroke-width="0.6"/><polygon points="55,148 22,91 88,91" fill="none" stroke="#e8b84a" stroke-width="0.6"/><polyline points="15,150 28,168 45,160 60,182 78,170" fill="none" stroke="#ffe9a0" stroke-width="0.5"/><polyline points="20,20 34,34 52,26 60,44" fill="none" stroke="#ffe9a0" stroke-width="0.5"/></svg>`,
    { size: 512 },
  );
  let vine = `<path d="M17 2`;
  let leaves = "";
  for (let i = 0; i < 8; i++) {
    const y0 = 2 + i * 24.5;
    const sg = i % 2 ? 1 : -1;
    vine += ` C ${17 + sg * 14} ${y0 + 8} ${17 - sg * 14} ${y0 + 16} 17 ${y0 + 24.5}`;
    leaves += `<ellipse cx="${17 + sg * 9}" cy="${y0 + 8}" rx="4" ry="1.8" transform="rotate(${sg * 40} ${17 + sg * 9} ${y0 + 8})" fill="#f2c14e"/><polygon points="17,${y0 + 20} 20,${y0 + 24.5} 17,${y0 + 29} 14,${y0 + 24.5}" fill="#f2c14e"/>`;
  }
  vine += `" fill="none" stroke="#f2c14e" stroke-width="1.3"/>`;
  const FILIGREE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 200"><rect x="3" y="3" width="28" height="194" fill="none" stroke="#f2c14e" stroke-width="1.3"/>${vine}${leaves}</svg>`,
    { size: 640 },
  );
  const RUNE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24"><g stroke="#aaf6ff" stroke-width="1.2" fill="none"><circle cx="8" cy="7" r="4"/><path d="M8 11 V22 M3 16 L8 13 L13 16 M5 20 H11"/></g></svg>`,
    { size: 128 },
  );
  const SPIRAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#f3deaa"/><path d="M16 16 a2 2 0 1 1 3 1 a5 5 0 1 1 -8 -3 a9 9 0 1 1 13 5" stroke="#b8895a" stroke-width="1.6" fill="none"/></svg>`,
    { size: 128 },
  );
  const CIRCLE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g stroke="#8ff6ff" stroke-width="1.4" fill="none"><circle cx="32" cy="32" r="29"/><circle cx="32" cy="32" r="22"/><polygon points="32,6 54,44 10,44"/><polygon points="32,58 10,20 54,20"/></g></svg>`,
    { size: 256 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: Col) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, c: Col) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const sph = (r: number, x: number, y: number, z: number, c: Col, sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z], scale: sc });

  const book = (cx: number, y0: number, w: number, h: number, d: number, zf: number, c: Col, rune: boolean, label: string) => {
    const cz = zf - d / 2;
    box(w, h, 0.012, cx, y0 + h / 2, zf - 0.006, c);
    box(0.006, h, d - 0.012, cx - w / 2 + 0.003, y0 + h / 2, cz - 0.006, c);
    box(0.006, h, d - 0.012, cx + w / 2 - 0.003, y0 + h / 2, cz - 0.006, c);
    box(w - 0.012, h - 0.008, d - 0.016, cx, y0 + h / 2, zf - 0.012 - (d - 0.016) / 2, PAGES);
    box(w + 0.003, 0.007, 0.016, cx, y0 + h - 0.028, zf - 0.006, GOLD);
    box(w + 0.003, 0.007, 0.016, cx, y0 + 0.028, zf - 0.006, GOLD);
    if (h > 0.26) box(w + 0.002, 0.004, 0.015, cx, y0 + h * 0.34, zf - 0.006, GOLD);
    box(w * 0.7, 0.04, 0.015, cx, y0 + h * 0.64, zf - 0.006, label);
    if (rune) {
      glow(
        b.part(new THREE.PlaneGeometry(0.024, 0.036), "#ffffff", {
          at: [cx, y0 + h * 0.64, zf + 0.0035],
          dir: [0, 0, 1],
          axis: "z",
          texture: RUNE,
        }),
      );
    } else if (w > 0.05) {
      sph(0.006, cx, y0 + h * 0.64, zf + 0.0015, RUBY);
    }
  };

  const fillRow = (y0: number, x0: number, x1: number, maxH: number) => {
    let x = x0;
    for (;;) {
      const w = 0.032 + R() * 0.036;
      if (x + w > x1) break;
      const h = maxH * (0.62 + 0.38 * R());
      const d = 0.2 + 0.07 * R();
      const c = BOOKS[Math.floor(R() * BOOKS.length)];
      const label = R() < 0.5 ? PAGES : "#2a1840";
      book(x + w / 2, y0, w, h, d, 0.172 - R() * 0.012, c, R() < 0.3 && w > 0.04, label);
      x += w + 0.003;
    }
  };

  const flat = (cx: number, y: number, cz: number, L: number, t: number, D: number, c: Col) => {
    box(L, 0.006, D, cx, y + 0.003, cz, c);
    box(L, 0.006, D, cx, y + t - 0.003, cz, c);
    box(L - 0.012, t - 0.012, D - 0.012, cx + 0.004, y + t / 2, cz, PAGES);
    box(0.01, t, D, cx - L / 2 + 0.005, y + t / 2, cz, c);
    box(0.016, t + 0.004, D * 0.5, cx + L * 0.28, y + t / 2, cz, GOLD);
    cyl(0.028, 0.028, 0.004, 10, cx - L * 0.1, y + t + 0.002, cz, GOLD);
    sph(0.011, cx - L * 0.1, y + t + 0.004, cz, RUBY);
  };

  const scrollZ = (x: number, y: number, z0: number, z1: number, rib: string) => {
    b.rod([x, y, z0], [x, y, z1], 0.028, PARCH, { sides: 8 });
    b.rod([x, y, z1 - 0.07], [x, y, z1 - 0.05], 0.0305, rib, { sides: 8 });
    b.part(new THREE.CircleGeometry(0.027, 8), "#ffffff", { at: [x, y, z1 + 0.0015], dir: [0, 0, 1], axis: "z", texture: SPIRAL });
  };
  const scrollX = (x: number, y: number, z: number, len: number, rib: string) => {
    b.rod([x - len / 2, y, z], [x + len / 2, y, z], 0.026, PARCH, { sides: 8 });
    b.rod([x + len / 2, y, z], [x + len / 2 + 0.02, y, z], 0.014, GOLD, { sides: 6 });
    b.rod([x - len / 2 - 0.02, y, z], [x - len / 2, y, z], 0.014, GOLD, { sides: 6 });
    b.rod([x + len * 0.2, y, z], [x + len * 0.2 + 0.018, y, z], 0.0285, rib, { sides: 8 });
  };

  const candle = (x: number, y: number, z: number, h: number, r: number) => {
    b.rod([x, y, z], [x, y + h, z], r, WAX, { sides: 8 });
    cyl(r * 0.8, r * 0.8, 0.004, 8, x, y + h + 0.001, z, "#f0d6a0");
    box(0.003, 0.012, 0.003, x, y + h + 0.008, z, "#3a2a2a");
    glow(sph(0.02, x, y + h + 0.03, z, "#ff9a3c", [0.8, 1.7, 0.8]), 1.2);
    glow(sph(0.011, x, y + h + 0.026, z, "#fff3b0", [0.8, 1.6, 0.8]), 1.5);
    for (let k = 0; k < 3; k++) {
      const a = R() * 6.28;
      sph(0.007, x + (r + 0.002) * Math.cos(a), y + h - 0.025 - R() * 0.05, z + (r + 0.002) * Math.sin(a), WAX, [1, 3, 1]);
    }
  };
  const dish = (x: number, y: number, z: number) => {
    cyl(0.055, 0.045, 0.012, 10, x, y + 0.006, z, GOLD);
    b.part(new THREE.TorusGeometry(0.022, 0.005, 4, 8), GOLD, { at: [x + 0.07, y + 0.008, z], rotation: [90, 0, 0] });
  };

  const orb = (x: number, y: number, z: number, k: number, col: string) => {
    const prof: Array<[number, number]> = [
      [0, 0],
      [0.07 * k, 0],
      [0.05 * k, 0.02 * k],
      [0.03 * k, 0.05 * k],
      [0.06 * k, 0.075 * k],
      [0, 0.075 * k],
    ];
    b.lathe(prof, { at: [x, y, z], color: GOLD, segments: 8 });
    const cy = y + 0.14 * k;
    glow(b.part(new THREE.SphereGeometry(0.085 * k, 10, 8), col, { at: [x, cy, z] }), 1);
    b.part(new THREE.TorusGeometry(0.115 * k, 0.005 * k + 0.002, 4, 16), GOLD, { at: [x, cy, z], rotation: [70, 20, 0] });
    glow(sph(0.014 * k, x - 0.03 * k, cy + 0.04 * k, z + 0.065 * k, "#ffffff", [1, 1.4, 1]), 1.5);
    glow(sph(0.007 * k, x - 0.05 * k, cy + 0.02 * k, z + 0.06 * k, "#ffffff"), 1.5);
    glow(sph(0.01, x + 0.1 * k, cy + 0.09 * k, z + 0.02, "#ffffff"), 1.5);
    glow(sph(0.008, x - 0.11 * k, cy - 0.03 * k, z + 0.04, col), 1.5);
  };

  const hourglass = (x: number, y: number, z: number) => {
    cyl(0.04, 0.04, 0.01, 8, x, y + 0.005, z, GOLD);
    cyl(0.04, 0.04, 0.01, 8, x, y + 0.155, z, GOLD);
    cyl(0.004, 0.035, 0.07, 8, x, y + 0.045, z, "#bff4ff");
    cyl(0.035, 0.004, 0.07, 8, x, y + 0.115, z, "#bff4ff");
    cyl(0.003, 0.026, 0.04, 8, x, y + 0.03, z, "#f2a8e8");
    cyl(0.02, 0.003, 0.02, 8, x, y + 0.13, z, "#f2a8e8");
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + 0.78;
      b.rod([x + 0.036 * Math.cos(a), y + 0.01, z + 0.036 * Math.sin(a)], [x + 0.036 * Math.cos(a), y + 0.15, z + 0.036 * Math.sin(a)], 0.004, GOLD, { sides: 6 });
    }
  };

  const crystals = (x: number, y: number, z: number) => {
    const specs: Array<[number, number, number, number, number]> = [
      [0, 0, 0.17, 0.028, 0],
      [-0.04, 0.02, 0.11, 0.022, -18],
      [0.04, -0.01, 0.13, 0.024, 16],
      [0.01, 0.045, 0.09, 0.018, 8],
    ];
    for (const [dx, dz, len, r, tilt] of specs) {
      const tx = Math.sin((tilt * Math.PI) / 180);
      glow(b.spike([x + dx, y, z + dz], [tx, 1, 0], len, r, "#7df0ff", { sides: 5 }), 1);
    }
    cyl(0.07, 0.08, 0.015, 7, x, y + 0.0075, z, "#4a4fa6");
  };

  // ---------- carcass ----------
  const Y = [0.12, 0.56, 0.98, 1.4, 1.8];
  const TOP = 2.15;
  box(1.3, 0.1, 0.44, 0, 0.05, 0, PLINTH);
  box(1.32, 0.012, 0.455, 0, 0.1, 0, GOLD);
  for (const s of [1, -1]) {
    box(0.05, 2.0, 0.38, s * 0.575, 1.1, 0, SIDE);
    box(0.012, 1.96, 0.012, s * 0.6, 1.1, 0.19, GOLD);
    box(0.012, 1.96, 0.012, s * 0.55, 1.1, 0.19, GOLD);
    // filigree panels on outer flanks
    b.part(new THREE.PlaneGeometry(0.34, 1.95), "#ffffff", {
      at: [s * 0.6015, 1.1, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: FILIGREE,
    });
    // corner finials
    for (const zz of [0.17, -0.17]) {
      cyl(0.022, 0.026, 0.04, 8, s * 0.6, TOP + 0.02, zz, GOLD);
      sph(0.026, s * 0.6, TOP + 0.06, zz, GOLD);
      glow(sph(0.01, s * 0.6, TOP + 0.092, zz, "#ffffff"), 1);
    }
    // plinth feet
    sph(0.03, s * 0.6, 0.03, 0.2, GOLD);
    sph(0.03, s * 0.6, 0.03, -0.2, GOLD);
  }
  box(1.1, 2.0, 0.02, 0, 1.1, -0.17, BACKW);
  b.part(new THREE.PlaneGeometry(1.1, 1.98), "#ffffff", { at: [0, 1.11, -0.158], dir: [0, 0, 1], axis: "z", texture: BACK });
  box(0.9, 0.02, 0.4, 0, 0.11, 0, BOARD);
  for (let i = 1; i < 5; i++) {
    box(1.1, 0.025, 0.36, 0, Y[i] - 0.0125, 0, BOARD);
    box(1.1, 0.025, 0.008, 0, Y[i] - 0.0125, 0.1835, GOLD);
    sph(0.012, 0, Y[i] - 0.0125, 0.19, RUBY);
    for (const s of [1, -1]) {
      sph(0.009, s * 0.3, Y[i] - 0.0125, 0.19, "#7df0ff");
      b.spike([s * 0.15, Y[i] - 0.025, 0.18], [0, -1, 0], 0.03, 0.008, GOLD, { sides: 4 });
    }
  }
  box(1.28, 0.05, 0.42, 0, 2.125, 0, BOARD);
  box(1.3, 0.012, 0.44, 0, TOP, 0, GOLD);
  box(1.3, 0.012, 0.012, 0, 2.1, 0.2, GOLD);

  // crown arch
  const crown: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.62, 0],
    [0.62, 0],
    [0.62, 0.08],
    [0.3, 0.14],
    [0.12, 0.3],
    [0, 0.5, "sharp"],
    [-0.12, 0.3],
    [-0.3, 0.14],
    [-0.62, 0.08],
  ];
  b.extrude(crown, { at: [0, TOP, -0.14], x: [1, 0, 0], thickness: 0.06, bevel: 0.008, color: SIDE });
  const inlay: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.5, 0.02],
    [0.5, 0.02],
    [0.5, 0.06],
    [0.26, 0.11],
    [0.09, 0.26],
    [0, 0.4, "sharp"],
    [-0.09, 0.26],
    [-0.26, 0.11],
    [-0.5, 0.06],
  ];
  b.extrude(inlay, { at: [0, TOP, -0.104], x: [1, 0, 0], thickness: 0.008, color: GOLD });
  glow(b.part(new THREE.OctahedronGeometry(0.05), "#8ff6ff", { at: [0, TOP + 0.5 + 0.06, -0.14], scale: [0.7, 1.2, 0.7] }), 1);
  b.part(new THREE.TorusGeometry(0.075, 0.007, 4, 12), GOLD, { at: [0, TOP + 0.56, -0.14], rotation: [0, 0, 0] });
  glow(sph(0.035, 0, TOP + 0.2, -0.1, "#ff9ad0"), 1);
  b.part(new THREE.TorusGeometry(0.05, 0.007, 4, 10), GOLD, { at: [0, TOP + 0.2, -0.1] });
  for (const s of [1, -1]) {
    glow(sph(0.02, s * 0.3, TOP + 0.12, -0.1, "#7df0ff"), 1);
    b.part(new THREE.TorusGeometry(0.03, 0.005, 4, 8), GOLD, { at: [s * 0.3, TOP + 0.12, -0.1] });
    glow(sph(0.014, s * 0.5, TOP + 0.08, -0.1, "#ffd06a"), 1);
  }

  // ---------- row 0 (y 0.12) ----------
  fillRow(Y[0], -0.545, 0.1, 0.38);
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.09, 0.07],
      [0.075, 0.15],
      [0.05, 0.2],
      [0.06, 0.22],
      [0, 0.22],
    ],
    { at: [0.27, Y[0], 0.0], color: cel("#4f8fe0"), segments: 10 },
  );
  b.part(new THREE.TorusGeometry(0.058, 0.007, 4, 10), GOLD, { at: [0.27, Y[0] + 0.222, 0], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.088, 0.005, 4, 10), GOLD, { at: [0.27, Y[0] + 0.07, 0], rotation: [90, 0, 0] });
  const urn: Array<[number, number, number, number, number]> = [
    [-0.02, 0.0, 0.05, 0.02, 0.01],
    [0.02, 0.01, -0.04, 0.0, -0.02],
    [0.0, -0.02, 0.01, -0.03, 0.04],
    [-0.01, 0.02, 0.08, 0.0, -0.05],
    [0.01, -0.01, -0.07, 0.03, 0.03],
  ];
  urn.forEach(([sx, sz, dx, dz, _t], i) => {
    const tx = 0.27 + sx + dx * 0.5;
    const tz = sz + dz * 0.5;
    b.rod([0.27 + sx, Y[0] + 0.16, sz], [tx, Y[0] + 0.32 - i * 0.005, tz], 0.016, PARCH, { sides: 6 });
    b.rod([tx - dx * 0.1, Y[0] + 0.28 - i * 0.004, tz - dz * 0.1], [tx - dx * 0.02, Y[0] + 0.3 - i * 0.004, tz - dz * 0.02], 0.0185, RIBBONS[i % 4], { sides: 6 });
  });
  fillRow(Y[0], 0.4, 0.545, 0.38);

  // ---------- row 1 (y 0.56) ----------
  fillRow(Y[1], -0.545, -0.44, 0.34);
  flat(-0.29, Y[1], 0.0, 0.3, 0.055, 0.22, BOOKS[1]);
  flat(-0.27, Y[1] + 0.055, 0.01, 0.27, 0.045, 0.2, BOOKS[3]);
  flat(-0.3, Y[1] + 0.1, -0.005, 0.24, 0.05, 0.19, BOOKS[0]);
  scrollX(-0.28, Y[1] + 0.15 + 0.026, 0.0, 0.2, "#e0334f");
  fillRow(Y[1], -0.12, 0.18, 0.34);
  {
    const cx = 0.36;
    let n = 0;
    for (let row = 0; row < 4; row++) {
      const cnt = 4 - row;
      for (let i = 0; i < cnt; i++) {
        const sx = cx + (i - (cnt - 1) / 2) * 0.058;
        scrollZ(sx, Y[1] + 0.028 + row * 0.05, -0.1, 0.15, RIBBONS[n % 4]);
        n++;
      }
    }
  }

  // ---------- row 2 (y 0.98) ----------
  orb(-0.33, Y[2], 0.0, 1.0, "#4fd8ff");
  dish(-0.02, Y[2], 0.02);
  candle(-0.03, Y[2] + 0.012, 0.02, 0.2, 0.024);
  candle(0.03, Y[2] + 0.012, 0.03, 0.13, 0.02);
  hourglass(0.2, Y[2], 0.02);
  orb(0.4, Y[2], 0.0, 0.9, "#d77bff");
  fillRow(Y[2], -0.545, -0.5, 0.3);

  // ---------- row 3 (y 1.40) ----------
  fillRow(Y[3], -0.545, -0.1, 0.34);
  {
    const x = 0.17;
    const y = Y[3];
    box(0.32, 0.012, 0.22, x, y + 0.006, 0.0, BOOKS[3]);
    box(0.145, 0.014, 0.19, x - 0.075, y + 0.019, 0.0, PAGES);
    box(0.145, 0.014, 0.19, x + 0.075, y + 0.019, 0.0, PAGES);
    box(0.012, 0.03, 0.2, x, y + 0.015, 0.0, GOLD);
    for (let k = 0; k < 4; k++) {
      box(0.1, 0.002, 0.003, x - 0.075, y + 0.027, -0.06 + k * 0.04, "#8a6a4a");
      box(0.1, 0.002, 0.003, x + 0.075, y + 0.027, -0.06 + k * 0.04, "#8a6a4a");
    }
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at: [x, y + 0.11, 0.0], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: CIRCLE }),
      1,
    );
    glow(sph(0.012, x + 0.05, y + 0.17, 0.02, "#8ff6ff"), 1.5);
    glow(sph(0.008, x - 0.08, y + 0.14, -0.03, "#ffffff"), 1.5);
  }
  dish(0.45, Y[3], 0.04);
  candle(0.44, Y[3] + 0.012, 0.04, 0.18, 0.022);
  fillRow(Y[3], 0.4, 0.545, 0.3);

  // ---------- row 4 (y 1.80) ----------
  fillRow(Y[4], -0.545, -0.2, 0.24);
  crystals(-0.07, Y[4], 0.0);
  dish(0.2, Y[4], 0.02);
  candle(0.2, Y[4] + 0.012, 0.02, 0.14, 0.022);
  flat(0.43, Y[4], 0.0, 0.2, 0.035, 0.16, BOOKS[5]);
  flat(0.44, Y[4] + 0.035, 0.0, 0.17, 0.03, 0.14, BOOKS[6]);
  scrollX(0.43, Y[4] + 0.065 + 0.026, 0.0, 0.14, "#2f9e6b");

  // ---------- top ----------
  orb(0.0, TOP, 0.04, 1.35, "#8a7bff");
  flat(-0.44, TOP, 0.0, 0.3, 0.06, 0.22, BOOKS[4]);
  flat(-0.43, TOP + 0.06, 0.01, 0.26, 0.05, 0.2, BOOKS[8]);
  dish(-0.43, TOP + 0.11, 0.0);
  candle(-0.44, TOP + 0.122, 0.0, 0.16, 0.022);
  {
    const x = 0.44;
    cyl(0.07, 0.08, 0.02, 10, x, TOP + 0.01, 0.0, GOLD);
    b.rod([x, TOP + 0.02, 0], [x, TOP + 0.2, 0], 0.012, GOLD, { sides: 6 });
    for (const s of [1, -1]) {
      b.rod([x, TOP + 0.17, 0], [x + s * 0.1, TOP + 0.17, 0], 0.008, GOLD, { sides: 6 });
      b.rod([x + s * 0.1, TOP + 0.17, 0], [x + s * 0.1, TOP + 0.2, 0], 0.008, GOLD, { sides: 6 });
      cyl(0.026, 0.02, 0.012, 8, x + s * 0.1, TOP + 0.206, 0, GOLD);
      candle(x + s * 0.1, TOP + 0.212, 0, 0.12, 0.018);
    }
    cyl(0.026, 0.02, 0.012, 8, x, TOP + 0.206, 0, GOLD);
    candle(x, TOP + 0.212, 0, 0.17, 0.02);
  }
  scrollX(0.2, TOP + 0.026, 0.12, 0.24, "#8a45d0");

  // ---------- floor dressing ----------
  flat(-0.92, 0, 0.05, 0.38, 0.07, 0.27, BOOKS[0]);
  flat(-0.9, 0.07, 0.06, 0.33, 0.06, 0.24, BOOKS[8]);
  flat(-0.93, 0.13, 0.04, 0.3, 0.055, 0.22, BOOKS[2]);
  flat(-0.9, 0.185, 0.05, 0.26, 0.045, 0.19, BOOKS[3]);
  orb(-0.9, 0.23, 0.05, 0.75, "#ffd06a");
  scrollX(-0.78, 0.026, 0.35, 0.3, "#e0334f");

  cyl(0.14, 0.15, 0.012, 12, 0.92, 0.006, 0.05, "#fff1d0");
  cyl(0.12, 0.13, 0.014, 12, 0.92, 0.012, 0.05, "#f0d6a0");
  candle(0.92, 0.015, 0.05, 0.42, 0.036);
  candle(1.0, 0.015, 0.0, 0.28, 0.03);
  candle(0.86, 0.015, 0.14, 0.18, 0.028);
  candle(0.97, 0.015, 0.14, 0.1, 0.024);
  scrollX(0.78, 0.026, 0.4, 0.28, "#2b7fd4");

  return b.root;
}
