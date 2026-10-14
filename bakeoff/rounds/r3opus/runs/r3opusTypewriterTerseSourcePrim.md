```ts
import * as THREE from "three";
import { createBuilder, svg, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Royale Typewriter",
  description:
    "A stylized 1950s portable typewriter in cherry-red enamel: chrome-rimmed glass keys, a fanned typebar basket, ribbon spools, platen carriage with knobs and return lever, and a typed letter in the roller.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });

  const RED = "#b3262b";
  const CHROME = "#cfd5da";
  const DARK = "#1c1c20";
  const ROLLER = "#151517";
  const CREAM = "#efe6cf";
  const GOLD = "#d4a640";
  const RIB_RED = "#9e1b1b";

  b.material(CHROME).metalness = 0.5;
  b.material(CHROME).roughness = 0.28;
  b.material(RED).roughness = 0.36;
  b.material(GOLD).metalness = 0.45;
  b.material(GOLD).roughness = 0.35;
  b.material(ROLLER).roughness = 0.9;

  b.joint("root", { at: [0, 0, 0] });
  b.joint("carriage", { parent: "root", at: [0, 0.15, -0.12], dir: [1, 0, 0] });

  // ---------- Textures ----------
  const glyphs = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
    "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
    "A", "S", "D", "F", "G", "H", "J", "K", "L", ";",
    "SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".",
  ];
  const COLS = 8;
  const ROWS = Math.ceil(glyphs.length / COLS);
  let atlasBody = "";
  glyphs.forEach((g, i) => {
    const cx = (i % COLS) * 64;
    const cy = Math.floor(i / COLS) * 64;
    const fs = g.length > 1 ? 12 : 30;
    const dy = g.length > 1 ? 37 : 43;
    atlasBody += `<rect x="${cx}" y="${cy}" width="64" height="64" fill="#111114"/>`;
    atlasBody += `<circle cx="${cx + 32}" cy="${cy + 32}" r="27" fill="none" stroke="#3a3a40" stroke-width="2"/>`;
    atlasBody += `<text x="${cx + 32}" y="${cy + dy}" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="${fs}" text-anchor="middle" fill="#f4f4f4">${g}</text>`;
  });
  const atlas = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COLS * 64} ${ROWS * 64}">${atlasBody}</svg>`,
    { size: 512 },
  );

  const paperTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 200">
      <rect width="216" height="200" fill="#fbf7ec"/>
      <g font-family="'Courier New', Courier, monospace" font-size="7.5" fill="#2a2a2e">
        <text x="18" y="26" fill="#a8231f" font-weight="bold" font-size="9">MEMO — Nov. 12</text>
        <text x="18" y="46">Dear Reader,</text>
        <text x="18" y="60">The quick brown fox jumps</text>
        <text x="18" y="70">over the lazy dog. Every</text>
        <text x="18" y="80">key leaves its little mark,</text>
        <text x="18" y="90">ding! and back we go to the</text>
        <text x="18" y="100">start of another line.</text>
        <text x="18" y="120">Yours, with ink &amp; ribbon,</text>
        <text x="18" y="134">     -- R.</text>
        <text x="18" y="160">_</text>
      </g>
      <rect x="0" y="0" width="216" height="200" fill="none" stroke="#e6dfcc" stroke-width="2"/>
    </svg>`,
    { size: 512 },
  );

  const badgeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 44">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6dc8a"/><stop offset="0.5" stop-color="#c8962e"/><stop offset="1" stop-color="#8a6418"/>
      </linearGradient></defs>
      <rect x="1" y="1" width="218" height="42" rx="10" fill="url(#g)" stroke="#5a3e0c" stroke-width="2"/>
      <text x="110" y="32" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="28" text-anchor="middle" fill="#7a1414">Royale</text>
    </svg>`,
    { size: 256 },
  );

  let ticks = "";
  for (let i = 0; i <= 68; i++) {
    const x = 2 + i * 4.94;
    const h = i % 10 === 0 ? 7 : i % 5 === 0 ? 5 : 3;
    ticks += `<rect x="${x.toFixed(2)}" y="0" width="0.9" height="${h}" fill="#222"/>`;
  }
  const rulerTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 10"><rect width="340" height="10" fill="#f1e7cc"/>${ticks}</svg>`,
    { size: 512 },
  );

  // ---------- Body ----------
  b.extrude(
    [
      [0.17, 0.012],
      [0.17, 0.045],
      [0.04, 0.1],
      [0.03, 0.14],
      [-0.17, 0.14],
      [-0.17, 0.012],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.4, bevel: 0.008, color: RED, bone: "root", name: "body" },
  );
  // dark skirt and feet
  b.part(new THREE.BoxGeometry(0.41, 0.012, 0.35), DARK, { at: [0, 0.018, 0], bone: "root" });
  for (const x of [-0.17, 0.17])
    for (const z of [-0.14, 0.14])
      b.part(new THREE.CylinderGeometry(0.016, 0.018, 0.013, 10), DARK, { at: [x, 0.0065, z], bone: "root" });

  // gold pinstripes on the sides
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.0012, 0.003, 0.19), GOLD, { at: [s * 0.2005, 0.125, -0.07], bone: "root" });
    b.part(new THREE.BoxGeometry(0.0012, 0.003, 0.3), GOLD, { at: [s * 0.2005, 0.03, 0.0], bone: "root" });
  }

  // badge on the front
  b.part(new THREE.PlaneGeometry(0.11, 0.022), "#ffffff", {
    at: [0, 0.028, 0.1712],
    texture: badgeTex,
    bone: "root",
  });

  // ---------- Keyboard ----------
  const deck = (z: number) => 0.045 + ((0.17 - z) / 0.13) * 0.055;
  const rowsZ = [0.152, 0.12, 0.088, 0.058];
  const stagger = [0.006, 0.0, -0.006, -0.012];
  const rowGlyphs = [
    ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", "."],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ];
  const STEM = 0.028;
  rowGlyphs.forEach((row, r) => {
    const z = rowsZ[r];
    const base = deck(z);
    row.forEach((g, i) => {
      const x = (i - 4.5) * 0.034 + stagger[r];
      const rad = g === "SHIFT" ? 0.0115 : 0.0095;
      const top = base + STEM;
      b.part(new THREE.CylinderGeometry(0.0018, 0.0018, STEM, 6), CHROME, {
        at: [x, base + STEM / 2 - 0.003, z],
        bone: "root",
      });
      b.part(new THREE.CylinderGeometry(rad, rad * 0.92, 0.006, 16), CHROME, {
        at: [x, top - 0.003, z],
        bone: "root",
      });
      const disc = new THREE.CircleGeometry(rad * 0.82, 16);
      const idx = glyphs.indexOf(g);
      const col = idx % COLS;
      const rowA = Math.floor(idx / COLS);
      const uv = disc.getAttribute("uv") as THREE.BufferAttribute;
      for (let k = 0; k < uv.count; k++) {
        const u = (col + 0.06 + uv.getX(k) * 0.88) / COLS;
        const v = (ROWS - 1 - rowA + 0.06 + uv.getY(k) * 0.88) / ROWS;
        uv.setXY(k, u, v);
      }
      b.part(disc, "#ffffff", { at: [x, top + 0.0002, z], rotation: [-90, 0, 0], texture: atlas, bone: "root" });
    });
  });

  // space bar
  b.part(new THREE.BoxGeometry(0.2, 0.008, 0.016), CREAM, { at: [0, 0.054, 0.184], bone: "root" });
  for (const s of [-1, 1])
    b.part(new THREE.BoxGeometry(0.005, 0.006, 0.026), CHROME, { at: [s * 0.08, 0.052, 0.171], bone: "root" });

  // ---------- Typebar basket ----------
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.004, 24, 1, false, -Math.PI / 2, Math.PI), DARK, {
    at: [0, 0.142, -0.08],
    bone: "root",
  });
  b.part(new THREE.TorusGeometry(0.095, 0.004, 6, 24, Math.PI), CHROME, {
    at: [0, 0.144, -0.08],
    rotation: [90, 0, 0],
    bone: "root",
  });
  const BARS = 34;
  for (let i = 0; i < BARS; i++) {
    const a = (-80 + (160 * i) / (BARS - 1)) * (Math.PI / 180);
    const r = 0.058;
    b.part(new THREE.BoxGeometry(0.0028, 0.002, 0.058), CHROME, {
      at: [Math.sin(a) * r, 0.1452, -0.08 + Math.cos(a) * r],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone: "root",
    });
  }
  b.part(new THREE.BoxGeometry(0.022, 0.016, 0.01), CHROME, { at: [0, 0.15, -0.075], bone: "root" });

  // ribbon spools and ribbon strand
  for (const s of [-1, 1]) {
    const x = s * 0.12;
    b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.012, 20), CHROME, { at: [x, 0.146, -0.02], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.003, 20), "#2a1a1a", { at: [x, 0.1525, -0.02], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.004, 10), RIB_RED, { at: [x, 0.154, -0.02], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.008, 8), CHROME, { at: [x, 0.156, -0.02], bone: "root" });
  }
  b.part(new THREE.BoxGeometry(0.24, 0.004, 0.0015), DARK, { at: [0, 0.152, -0.052], bone: "root" });
  b.part(new THREE.BoxGeometry(0.24, 0.004, 0.0015), RIB_RED, { at: [0, 0.148, -0.052], bone: "root" });

  // ---------- Carriage ----------
  const C = "carriage";
  b.part(new THREE.BoxGeometry(0.44, 0.012, 0.05), CHROME, { at: [0, 0.15, -0.12], bone: C });
  b.part(new THREE.PlaneGeometry(0.34, 0.01), "#ffffff", {
    at: [0, 0.15, -0.0948],
    texture: rulerTex,
    bone: C,
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 20), ROLLER, {
    at: [0, 0.19, -0.12],
    rotation: [0, 0, 90],
    bone: C,
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.01, 0.075, 0.085), RED, { at: [s * 0.185, 0.19, -0.12], bone: C });
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), CHROME, {
      at: [s * 0.203, 0.19, -0.12],
      rotation: [0, 0, 90],
      bone: C,
    });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.026, 12), CREAM, {
      at: [s * 0.228, 0.19, -0.12],
      rotation: [0, 0, 90],
      bone: C,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 12), DARK, {
      at: [s * 0.242, 0.19, -0.12],
      rotation: [0, 0, 90],
      bone: C,
    });
    // bail rollers
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.014, 10), ROLLER, {
      at: [s * 0.06, 0.222, -0.097],
      rotation: [0, 0, 90],
      bone: C,
    });
  }
  // paper bail
  b.part(new THREE.CylinderGeometry(0.0025, 0.0025, 0.36, 8), CHROME, {
    at: [0, 0.222, -0.097],
    rotation: [0, 0, 90],
    bone: C,
  });

  // paper and paper table
  const tilt = 12 * (Math.PI / 180);
  b.part(new THREE.PlaneGeometry(0.216, 0.2), "#ffffff", {
    at: [0, 0.2 + 0.1 * Math.cos(tilt), -0.152 - 0.1 * Math.sin(tilt)],
    rotation: [-12, 0, 0],
    texture: paperTex,
    bone: C,
  });
  b.part(new THREE.BoxGeometry(0.26, 0.16, 0.003), CHROME, {
    at: [0, 0.19 + 0.08 * Math.cos(tilt) - 0.006 * 0.208, -0.16 - 0.08 * Math.sin(tilt) - 0.006 * 0.978],
    rotation: [-12, 0, 0],
    bone: C,
  });

  // carriage return lever (typist's left = model -X)
  b.sweep(
    catmull([
      [-0.19, 0.2, -0.11],
      [-0.21, 0.232, -0.09],
      [-0.222, 0.248, -0.045],
      [-0.218, 0.25, -0.005],
    ]),
    0.0035,
    { color: CHROME, bone: C },
  );
  b.part(new THREE.SphereGeometry(0.009, 10, 8), CREAM, { at: [-0.218, 0.25, 0.0], bone: C });

  return b.root;
}
```