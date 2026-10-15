import * as THREE from "three";
import { createBuilder, frame, rng, catmull, grain, mottle, countershade, paint, svg } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description:
    "Toon-styled roadside shrine: vermilion torii with paper lanterns and shimenawa, small hokora, stone lanterns, kitsune guardians, offerings, an Electro crystal and a sakura tree.",
};

// ---------- palette ----------
const VERM = cel("#d23a2e");
const VERM_D = cel("#9c2a2a");
const LACQ = cel("#2c2230");
const STONE = cel(mottle("#c4bfb6", "#a39e98", { size: 0.18, seed: 3 }));
const STONE_D = cel(mottle("#8f8b88", "#76727a", { size: 0.14, seed: 8 }));
const MOSS = cel("#6f9a4a");
const GRASS = cel(mottle("#86b852", "#6a9c42", { size: 0.3, seed: 5 }));
const WOOD = cel(countershade("#9a6a40", "#7a4e32"));
const CREAM = cel("#f3e6c8");
const GOLD = "#f0c64c";
const ROPE = cel(grain("#e0cb8e", "#a8904f", { size: 0.01 }));
const TRUNK = cel("#6b4a3c");
const PINK = cel("#f6a9c4");
const PINK2 = cel("#ec86ab");
const PAPER = "#fbf6ea";
const WARM = "#ffb85a";
const ELECTRO = "#b985ff";

// ---------- textures ----------
const DOOR = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#7d3b33"/>
  <rect x="2" y="2" width="28" height="60" fill="#a8483b" stroke="#2c2230" stroke-width="2"/>
  <rect x="34" y="2" width="28" height="60" fill="#a8483b" stroke="#2c2230" stroke-width="2"/>
  <g stroke="#f0c64c" stroke-width="1.6" fill="none">
  <path d="M16 6V58M6 20H26M6 34H26M6 48H26M48 6V58M38 20H58M38 34H58M38 48H58"/></g>
  <circle cx="26" cy="32" r="3" fill="#f0c64c"/><circle cx="38" cy="32" r="3" fill="#f0c64c"/></svg>`,
  { size: 128 },
);
const PLAQUE = svg(
  `<svg viewBox="0 0 48 64"><rect width="48" height="64" rx="3" fill="#2c2230"/>
  <rect x="3" y="3" width="42" height="58" rx="2" fill="none" stroke="#f0c64c" stroke-width="2"/>
  <circle cx="24" cy="24" r="11" fill="none" stroke="#b985ff" stroke-width="3"/>
  <path d="M24 10 L20 26 L26 25 L22 40 L31 22 L25 23 Z" fill="#f0c64c"/>
  <path d="M12 50H36M16 56H32" stroke="#f0c64c" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const LANT = svg(
  `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#ff9a45"/>
  <rect y="0" width="128" height="8" fill="#f2693a"/><rect y="56" width="128" height="8" fill="#f2693a"/>
  <g stroke="#e0552e" stroke-width="2"><path d="M0 14H128M0 50H128"/></g>
  <circle cx="32" cy="32" r="10" fill="none" stroke="#7a2a22" stroke-width="3"/>
  <path d="M32 22 L29 33 L34 32 L31 43" stroke="#7a2a22" stroke-width="3" fill="none"/>
  <circle cx="96" cy="32" r="10" fill="none" stroke="#7a2a22" stroke-width="3"/></svg>`,
  { size: 128 },
);
const SHIDE = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 0 L30 10 L10 22 L28 34 L8 46 L22 64 L4 50 L22 38 L4 26 L24 14 L6 8Z" fill="#fbf6ea" stroke="#cfc6ae" stroke-width="1.5"/></svg>`,
  { size: 96 },
);
const PETAL = svg(`<svg viewBox="0 0 32 32"><path d="M16 2 Q30 12 16 30 Q2 12 16 2Z" fill="#f8b6cf"/></svg>`, { size: 64 });
const BLOSSOM = svg(
  `<svg viewBox="0 0 48 48"><g fill="#f7a8c6" stroke="#e57aa3" stroke-width="1.5"><circle cx="24" cy="10" r="9"/><circle cx="38" cy="21" r="9"/><circle cx="33" cy="38" r="9"/><circle cx="15" cy="38" r="9"/><circle cx="10" cy="21" r="9"/></g><circle cx="24" cy="25" r="5" fill="#ffe27a"/></svg>`,
  { size: 96 },
);
const LABEL = svg(
  `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#f6efe0"/><rect y="0" width="32" height="5" fill="#d23a2e"/><circle cx="16" cy="18" r="7" fill="none" stroke="#2c2230" stroke-width="2"/><path d="M16 11V25" stroke="#2c2230" stroke-width="2"/></svg>`,
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "shrine" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------- helpers ----------
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: root, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), c, [x, y, z], o);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), c, [x, y, z], o);
  const ball = (r: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    P(new THREE.SphereGeometry(r, 8, 6), c, [x, y, z], o);

  // ---------- ground & platform ----------
  cyl(2.9, 3.0, 0.1, 14, GRASS, 0, 0.05, 0.2);
  box(4.0, 0.15, 3.1, STONE, 0, 0.175, 0.15);
  box(4.2, 0.05, 3.3, STONE_D, 0, 0.12, 0.15);
  for (let i = 0; i < 3; i++) box(1.8 - i * 0.1, 0.07, 0.3, STONE, 0, 0.035 + i * 0.0, 1.85 + 0.3 * (2 - i) * 0 + i * 0.28);
  // stepping stones
  [[0.1, 2.9], [-0.15, 3.3], [0.2, 3.7]].forEach(([x, z], i) =>
    cyl(0.28 - i * 0.03, 0.3 - i * 0.03, 0.05, 7, STONE, x, 0.075, z - 0.1),
  );
  // moss on platform edge
  const r = rng(11);
  for (let i = 0; i < 9; i++)
    ball(0.1 + r() * 0.08, MOSS, -2 + r() * 4, 0.1, r() < 0.5 ? 1.7 : -1.4, { scale: [1.3, 0.35, 1] });

  const TOP = 0.25;
  // ---------- torii ----------
  const TZ = 1.2;
  for (const s of [1, -1]) {
    cyl(0.1, 0.12, 2.15, 10, VERM, s * 0.95, TOP + 1.075, TZ);
    cyl(0.14, 0.14, 0.22, 10, LACQ, s * 0.95, TOP + 0.11, TZ);
    cyl(0.125, 0.125, 0.04, 10, GOLD, s * 0.95, TOP + 2.0, TZ);
  }
  const nukiY = TOP + 1.75;
  box(2.5, 0.14, 0.12, VERM, 0, nukiY, TZ);
  box(0.22, 0.4, 0.14, LACQ, 0, nukiY + 0.2, TZ);
  box(0.9, 0.12, 0.1, VERM_D, 0, TOP + 2.1, TZ);
  b.extrude(
    [[-1.7, 0.2], [-1.0, 0.03], [1.0, 0.03], [1.7, 0.2], [1.7, 0.34], [1.0, 0.17], [-1.0, 0.17], [-1.7, 0.34]],
    { at: [0, TOP + 2.2, TZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.34, bevel: 0.02, color: LACQ, bone: root },
  );
  b.extrude(
    [[-1.6, 0.0], [-1.0, -0.02], [1.0, -0.02], [1.6, 0.0], [1.6, 0.06], [-1.6, 0.06]],
    { at: [0, TOP + 2.17, TZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.4, color: VERM_D, bone: root },
  );
  box(0.34, 0.46, 0.04, "#2c2230", 0, TOP + 1.2, TZ);
  b.part(new THREE.PlaneGeometry(0.34, 0.46), "#ffffff", {
    bone: root, at: [0, TOP + 1.2 + 0.0, TZ + 0.03], dir: [0, 0, 1], axis: "z", texture: PLAQUE,
  });
  box(0.34, 0.46, 0.04, "#2c2230", 0, TOP + 1.2, TZ);
  // gold caps on beam ends
  for (const s of [1, -1]) box(0.06, 0.1, 0.1, GOLD, s * 1.26, nukiY, TZ);

  // shimenawa with shide
  const sag = (x: number) => TOP + 1.5 - 0.1 * (1 - (x / 0.85) ** 2) * 0 - 0.14 * (1 - (x / 0.85) ** 2);
  const ropePts: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const x = -0.88 + (1.76 * i) / 8;
    ropePts.push([x, sag(x) + 0.0, TZ + 0.14]);
  }
  b.sweep(catmull(ropePts), [0.04, 0.04], { color: ROPE, bone: root, sides: 6 });
  for (const s of [1, -1]) {
    cyl(0.05, 0.07, 0.18, 6, ROPE, s * 0.9, sag(0.88) - 0.05, TZ + 0.14);
  }
  const shideFrames = [-0.6, -0.3, 0, 0.3, 0.6].map((x) => frame([x, sag(x) - 0.03, TZ + 0.14], [0, 1, 0]));
  b.cards(shideFrames, SHIDE, { size: [0.1, 0.24], lean: 180, flow: [0, 0, 1], bone: root, cross: false });

  // hanging paper lanterns
  for (const s of [1, -1]) {
    const x = s * 0.5;
    b.rod([x, TOP + 2.08, TZ], [x, TOP + 1.98, TZ], 0.008, "#2c2230", { bone: root });
    cyl(0.07, 0.07, 0.035, 8, LACQ, x, TOP + 1.95, TZ);
    glow(
      b.part(new THREE.SphereGeometry(1, 8, 6), "#ffffff", {
        bone: root, at: [x, TOP + 1.8, TZ], scale: [0.15, 0.19, 0.15], texture: LANT, rotation: [0, 90, 0],
      }),
      1.3,
    );
    cyl(0.07, 0.07, 0.035, 8, LACQ, x, TOP + 1.62, TZ);
    b.cards([frame([x, TOP + 1.6, TZ], [0, 1, 0])], SHIDE, { size: [0.05, 0.14], lean: 180, flow: [0, 0, 1], bone: root, color: "#d23a2e" });
  }

  // ---------- hokora shrine ----------
  const SZ = -0.8;
  box(1.25, 0.3, 1.0, STONE, 0, TOP + 0.15, SZ);
  box(1.35, 0.06, 1.1, STONE_D, 0, TOP + 0.03, SZ);
  box(0.9, 0.8, 0.7, CREAM, 0, TOP + 0.7, SZ);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) cyl(0.045, 0.045, 0.85, 6, VERM, sx * 0.46, TOP + 0.72, SZ + sz * 0.36);
  box(1.0, 0.07, 0.8, VERM_D, 0, TOP + 1.14, SZ);
  b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
    bone: root, at: [0, TOP + 0.62, SZ + 0.355], dir: [0, 0, 1], axis: "z", texture: DOOR,
  });
  // glow behind lattice slit
  glow(box(0.5, 0.06, 0.02, WARM, 0, TOP + 0.98, SZ + 0.36), 1.2);
  // veranda + steps
  box(1.0, 0.06, 0.28, WOOD, 0, TOP + 0.33, SZ + 0.62);
  box(0.6, 0.1, 0.2, STONE, 0, TOP + 0.05, SZ + 0.75);
  // roof
  P(
    new THREE.CylinderGeometry(0.0, 1, 1, 4),
    LACQ,
    [0, TOP + 1.18, SZ],
    { flat: true },
  ).mesh.visible = false;
  b.lathe([[0, 0.55], [0.35, 0.3], [0.85, 0.07], [1.05, 0.0], [1.05, -0.05], [0.85, -0.04], [0, -0.04]], {
    at: [0, TOP + 1.2, SZ], segments: 4, spin: 45, color: LACQ, bone: root, smoothing: 0,
  }).mesh.scale.set(1, 1, 0.9);
  b.lathe([[0, 0.45], [0.3, 0.27], [0.75, 0.06], [0.95, 0.0], [0.95, -0.03], [0, -0.03]], {
    at: [0, TOP + 1.24, SZ], segments: 4, spin: 45, color: cel("#5e4658"), bone: root,
  }).mesh.scale.set(1, 1, 0.9);
  ball(0.07, GOLD, 0, TOP + 1.8, SZ);
  cyl(0.02, 0.04, 0.12, 6, GOLD, 0, TOP + 1.72, SZ);
  for (const s of [1, -1]) {
    box(0.06, 0.12, 0.06, GOLD, s * 0.9, TOP + 1.3, SZ + 0.55);
    // little hanging bell
    ball(0.045, GOLD, s * 0, TOP + 1.05, SZ + 0.42);
  }
  b.rod([0, TOP + 1.1, SZ + 0.42], [0, TOP + 1.0, SZ + 0.42], 0.01, ROPE, { bone: root });
  // shimenawa on shrine
  b.sweep(catmull([[-0.5, TOP + 1.04, SZ + 0.4], [0, TOP + 0.98, SZ + 0.42], [0.5, TOP + 1.04, SZ + 0.4]]), 0.025, { color: ROPE, bone: root, sides: 6 });

  // ---------- stone lanterns ----------
  for (const s of [1, -1]) {
    const x = s * 1.5;
    const z = 0.45;
    cyl(0.2, 0.24, 0.1, 6, STONE, x, TOP + 0.05, z);
    cyl(0.07, 0.09, 0.55, 6, STONE, x, TOP + 0.37, z);
    cyl(0.17, 0.12, 0.1, 6, STONE_D, x, TOP + 0.69, z);
    glow(box(0.18, 0.2, 0.18, WARM, x, TOP + 0.84, z), 1.4);
    for (const cx of [1, -1])
      for (const cz of [1, -1]) box(0.035, 0.22, 0.035, STONE, x + cx * 0.1, TOP + 0.84, z + cz * 0.1);
    b.lathe([[0, 0.2], [0.12, 0.12], [0.3, 0.02], [0.3, -0.02], [0, -0.02]], {
      at: [x, TOP + 0.96, z], segments: 6, color: STONE, bone: root,
    });
    ball(0.045, GOLD, x, TOP + 1.2, z);
    // moss
    ball(0.08, MOSS, x + s * 0.05, TOP + 0.1, z + 0.18, { scale: [1.4, 0.5, 1] });
  }

  // ---------- kitsune guardians ----------
  for (const s of [1, -1]) {
    const x = s * 0.85;
    const z = 0.0;
    box(0.4, 0.3, 0.4, STONE_D, x, TOP + 0.15, z);
    box(0.34, 0.06, 0.34, STONE, x, TOP + 0.33, z);
    const B = TOP + 0.36;
    ball(1, STONE, x, B + 0.24, z - 0.02, { scale: [0.13, 0.24, 0.12] });
    ball(0.09, STONE, x, B + 0.05, z - 0.1, { scale: [1.5, 0.7, 1.4] });
    for (const fx of [1, -1]) box(0.05, 0.22, 0.06, STONE, x + fx * 0.06, B + 0.11, z + 0.1);
    ball(0.1, STONE, x, B + 0.52, z + 0.02);
    b.part(new THREE.ConeGeometry(0.06, 0.2, 6), STONE, { bone: root, at: [x, B + 0.5, z + 0.14], rotation: [90, 0, 0], flat: true });
    ball(0.02, LACQ, x, B + 0.5, z + 0.24);
    for (const ex of [1, -1]) {
      b.part(new THREE.ConeGeometry(0.045, 0.14, 4), STONE, { bone: root, at: [x + ex * 0.07, B + 0.66, z - 0.01], rotation: [0, 0, -ex * 12], flat: true });
      ball(0.015, LACQ, x + ex * 0.045, B + 0.55, z + 0.1);
    }
    b.sweep(catmull([[x, B + 0.12, z - 0.1], [x + s * 0.08, B + 0.2, z - 0.22], [x + s * 0.12, B + 0.5, z - 0.22], [x + s * 0.05, B + 0.62, z - 0.18]]), [0.05, 0.015], { color: STONE, bone: root, sides: 6 });
    // red bib
    b.sweep(catmull([[x - 0.1, B + 0.43, z + 0.0], [x, B + 0.4, z + 0.09], [x + 0.1, B + 0.43, z + 0.0]]), 0.022, { color: VERM, bone: root, sides: 6 });
    box(0.07, 0.1, 0.02, VERM, x, B + 0.33, z + 0.11);
  }

  // ---------- offering table ----------
  const OZ = 0.5;
  box(0.9, 0.05, 0.5, WOOD, 0, TOP + 0.4, OZ);
  for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.06, 0.38, 0.06, WOOD, sx * 0.38, TOP + 0.19, OZ + sz * 0.2);
  box(0.9, 0.025, 0.04, VERM_D, 0, TOP + 0.36, OZ + 0.23);
  const TT = TOP + 0.425;
  // sake bottle
  cyl(0.06, 0.07, 0.2, 8, CREAM, -0.3, TT + 0.1, OZ);
  cyl(0.025, 0.05, 0.1, 8, CREAM, -0.3, TT + 0.25, OZ);
  cyl(0.03, 0.03, 0.03, 8, VERM, -0.3, TT + 0.32, OZ);
  b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", { bone: root, at: [-0.3, TT + 0.1, OZ + 0.072], dir: [0, 0, 1], axis: "z", texture: LABEL });
  // cups
  for (const x of [-0.14, -0.05]) b.lathe([[0, 0], [0.04, 0], [0.05, 0.05], [0.045, 0.05], [0.035, 0.01], [0, 0.01]], { at: [x, TT, OZ + 0.1], color: cel("#2c2230"), bone: root });
  // rice bowl
  b.lathe([[0, 0], [0.05, 0], [0.09, 0.07], [0.085, 0.075], [0.04, 0.02], [0, 0.02]], { at: [0.05, TT, OZ - 0.05], color: cel("#f5f1e6"), bone: root });
  ball(0.075, "#fffdf6", 0.05, TT + 0.065, OZ - 0.05, { scale: [1, 0.55, 1] });
  // sunsettia fruit
  for (const [x, z] of [[0.28, 0.05], [0.37, -0.05], [0.33, 0.12]]) {
    ball(0.055, cel("#ff9a2e"), x, TT + 0.055, OZ + z);
    cyl(0.01, 0.01, 0.03, 4, MOSS, x, TT + 0.115, OZ + z);
  }
  // dango on plate
  cyl(0.1, 0.08, 0.02, 10, cel("#f5f1e6"), 0.0, TT + 0.01, OZ + 0.12);
  b.rod([-0.05, TT + 0.025, OZ + 0.12], [0.05, TT + 0.08, OZ + 0.12], 0.006, WOOD, { bone: root });
  [["#f6a9c4", -0.03], ["#fffdf6", 0.0], ["#9fcf7a", 0.03]].forEach(([c, d], i) =>
    ball(0.025, cel(c as string), (d as number) * 1.2, TT + 0.045 + i * 0.012 + (d as number) * 0.6, OZ + 0.12),
  );
  // coins
  for (let i = 0; i < 4; i++) cyl(0.03, 0.03, 0.006, 8, GOLD, -0.5 + i * 0.01, TT + 0.004 + i * 0.006, OZ - 0.1 + i * 0.01);
  // donation box
  box(0.34, 0.28, 0.3, WOOD, 1.0, TOP + 0.14, 1.0);
  box(0.3, 0.02, 0.05, LACQ, 1.0, TOP + 0.29, 1.0);
  box(0.36, 0.04, 0.32, VERM_D, 1.0, TOP + 0.3, 1.0);

  // ---------- Electro crystal on rocks ----------
  const cx = 1.65, cz = -0.9;
  for (const [dx, dz, s] of [[0, 0, 0.25], [0.25, 0.1, 0.17], [-0.2, 0.15, 0.15]])
    P(new THREE.IcosahedronGeometry(s, 0), STONE_D, [cx + dx, TOP + s * 0.6, cz + dz], { scale: [1.2, 0.8, 1] });
  [[0, 0.8, 0.09, 8], [0.12, 0.55, 0.06, -14], [-0.1, 0.45, 0.05, 20]].forEach(([dx, h, rr, tilt]) => {
    glow(
      b.part(new THREE.ConeGeometry(rr, h, 6), ELECTRO, {
        bone: root, at: [cx + dx, TOP + 0.3 + h / 2, cz], rotation: [0, 0, tilt], flat: true,
      }),
      1.6,
    );
    glow(b.part(new THREE.ConeGeometry(rr, h * 0.25, 6), "#e2ccff", { bone: root, at: [cx + dx, TOP + 0.3 + h * 1.1, cz], rotation: [0, 0, tilt], flat: true }), 1.8);
  });
  // floating crystal shards
  for (let i = 0; i < 3; i++)
    glow(P(new THREE.OctahedronGeometry(0.04, 0), ELECTRO, [cx - 0.3 + i * 0.3, TOP + 1.3 + (i % 2) * 0.2, cz + 0.1], { scale: [1, 1.6, 1] }), 1.5);

  // ---------- sakura tree ----------
  const tx = -1.9, tz = -1.0;
  b.sweep(catmull([[tx, 0.2, tz], [tx + 0.05, 0.9, tz], [tx - 0.1, 1.6, tz + 0.05], [tx + 0.1, 2.2, tz]]), [0.17, 0.07], { color: TRUNK, bone: root, sides: 6 });
  b.sweep(catmull([[tx, 1.3, tz], [tx + 0.5, 1.8, tz + 0.2], [tx + 0.8, 2.3, tz + 0.2]]), [0.06, 0.03], { color: TRUNK, bone: root, sides: 5 });
  b.sweep(catmull([[tx - 0.05, 1.5, tz], [tx - 0.5, 2.0, tz - 0.1], [tx - 0.7, 2.5, tz - 0.1]]), [0.05, 0.025], { color: TRUNK, bone: root, sides: 5 });
  const blobs: number[][] = [[0.1, 2.7, 0, 0.75], [0.8, 2.6, 0.2, 0.55], [-0.7, 2.7, -0.1, 0.55], [0.3, 3.1, -0.1, 0.5], [-0.2, 3.0, 0.3, 0.45], [0.7, 3.0, -0.2, 0.4]];
  blobs.forEach(([dx, y, dz, rr], i) =>
    P(new THREE.IcosahedronGeometry(rr, 1), i % 2 ? PINK2 : PINK, [tx + dx, y, tz + dz], { scale: [1.1, 0.8, 1.1] }),
  );
  const canopy = b.surface(b.root);
  void canopy;
  // blossom cards around canopy
  const bl = rng(21);
  const bfr = blobs.flatMap(([dx, y, dz, rr]) =>
    Array.from({ length: 5 }, () => {
      const a = bl() * 6.28, e = (bl() - 0.2) * 1.2;
      const nx = Math.cos(a) * Math.cos(e), ny = Math.sin(e), nz = Math.sin(a) * Math.cos(e);
      return frame([tx + dx + nx * rr * 1.0, y + ny * rr * 0.8, tz + dz + nz * rr * 1.0], [nx, ny, nz]);
    }),
  );
  b.cards(bfr, BLOSSOM, { size: 0.22, lean: 20, vary: 0.3, rng: rng(5), bone: root });
  // fallen petals
  const pr = rng(33);
  const petals = Array.from({ length: 22 }, () => frame([-2.0 + pr() * 2.6, TOP + 0.005, -1.3 + pr() * 2.6], [0, 1, 0]));
  b.cards(petals, PETAL, { size: 0.07, lean: 90, flow: [1, 0, 0.3], mirror: true, spin: 180, rng: rng(7), bone: root });
  // drifting petals
  const air = Array.from({ length: 8 }, () => frame([-1.8 + pr() * 2.6, 1.0 + pr() * 1.5, -0.6 + pr() * 1.6], [0, 1, 0]));
  b.cards(air, PETAL, { size: 0.07, lean: 70, flow: [1, 0, 0.2], spin: 180, rng: rng(9), bone: root });

  // ---------- small grass tufts ----------
  const TUFT = svg(`<svg viewBox="0 0 32 32"><path d="M2 32 L8 6 L12 32 L16 2 L20 32 L26 8 L30 32Z" fill="#7fb34c" stroke="#5a9040" stroke-width="1"/></svg>`, { size: 64 });
  const gr = rng(44);
  const tufts = Array.from({ length: 22 }, () => {
    const a = gr() * 6.28, d = 2.2 + gr() * 0.5;
    return frame([Math.cos(a) * d, 0.1, 0.2 + Math.sin(a) * d * 0.9], [0, 1, 0]);
  });
  b.cards(tufts, TUFT, { size: [0.16, 0.2], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(2), bone: root });

  return b.root;
}
