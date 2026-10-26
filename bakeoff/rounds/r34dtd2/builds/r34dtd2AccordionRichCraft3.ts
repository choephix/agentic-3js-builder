import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Piano accordion",
  description:
    "Italian mother-of-pearl piano accordion: nacre-painted cases, wine-red pleated bellows, gold binding, a 21-key piano keyboard, a pearl bass button board and inlaid end grilles.",
};

const GOLD = "#d9b25a";
const GOLD_DK = "#9a7326";
const BLACK = "#16131a";
const LEATHER = "#241518";
const IVORY = "#fbf7ea";
const KEYBLACK = "#0f0e13";

// ---------- paints ----------
const PEARL = paint((p, n) => {
  const a = noise(p, 0.05, 3);
  const c = noise(p, 0.14, 9);
  let col = mix("#fbf6ee", "#e1f1ef", smoothstep(0.35, 0.7, a));
  col = mix(col, "#f5d3e6", smoothstep(0.55, 0.8, c) * 0.8);
  col = mix(col, "#cfdff6", smoothstep(0.6, 0.85, noise(p, 0.1, 21)) * 0.6);
  const t = smoothstep(-0.6, 0.9, n.x * 0.5 + n.y * 0.5);
  col = mix(col, "#ffe9c8", t * 0.25);
  const vein = Math.abs(Math.sin((p.x * 8 + p.y * 5 + a * 4) * 3));
  if (vein < 0.05) col = mix(col, "#ffffff", 0.55);
  const ao = 0.88 + 0.12 * smoothstep(-0.9, 0.4, n.y);
  return [col[0] * ao, col[1] * ao, col[2] * ao] as const;
});

const BELLOWS = paint((p) => {
  const f = (((p.x / 0.02) % 1) + 1) % 1;
  const ph = Math.abs(f * 2 - 1);
  let c = mix("#2a0409", "#9a1628", smoothstep(0, 1, ph));
  if (ph > 0.9) c = mix(c, "#f0e6d2", 0.4);
  return c;
});

// ---------- textures ----------
const petals = Array.from({ length: 12 }, (_, i) => {
  return `<ellipse cx="50" cy="80" rx="5" ry="17" transform="rotate(${i * 30} 50 80) translate(0 -17)" fill="${GOLD}" stroke="#5a3d10" stroke-width="0.8"/>`;
}).join("");
const slots = (y: number) =>
  Array.from({ length: 8 }, (_, i) => `<rect x="${14 + i * 10}" y="${y}" width="5" height="9" rx="2.5" fill="#e9dfc8"/>`).join("");

const END_TREBLE = svg(
  `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="158" rx="8" fill="#17131a" stroke="${GOLD}" stroke-width="3"/>
  <rect x="7" y="7" width="86" height="146" rx="5" fill="none" stroke="#f3ead6" stroke-width="1.2"/>
  ${slots(14)}${slots(137)}
  <circle cx="50" cy="80" r="33" fill="#241a2c" stroke="${GOLD}" stroke-width="2"/>
  ${petals}
  <circle cx="50" cy="80" r="14" fill="#fbf6ee" stroke="${GOLD}" stroke-width="2"/>
  <circle cx="50" cy="80" r="6" fill="#d98aa8"/>
  <circle cx="50" cy="80" r="2.4" fill="#fff"/>
  ${[18, 82].map((x) => [38, 122].map((y) => `<circle cx="${x}" cy="${y}" r="3" fill="${GOLD}"/>`).join("")).join("")}
</svg>`,
  { size: 384 },
);

const star = Array.from({ length: 8 }, (_, i) => `<path d="M50 80 L45 40 L50 26 L55 40Z" transform="rotate(${i * 45} 50 80)" fill="${GOLD}" stroke="#5a3d10" stroke-width="0.7"/>`).join("");
const END_BASS = svg(
  `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="158" rx="8" fill="#17131a" stroke="${GOLD}" stroke-width="3"/>
  <rect x="7" y="7" width="86" height="146" rx="5" fill="none" stroke="#f3ead6" stroke-width="1.2"/>
  <circle cx="50" cy="80" r="38" fill="#221a28" stroke="${GOLD}" stroke-width="2"/>
  ${star}
  <circle cx="50" cy="80" r="12" fill="#fbf6ee" stroke="${GOLD}" stroke-width="2"/>
  <path d="M44 86 Q50 70 56 86 M50 72 L50 90" stroke="#7a1020" stroke-width="2" fill="none"/>
  <text x="50" y="23" text-anchor="middle" font-family="serif" font-weight="bold" font-size="10" fill="${GOLD}">MILANO</text>
  <text x="50" y="146" text-anchor="middle" font-family="serif" font-size="8" fill="#f3ead6">1962</text>
</svg>`,
  { size: 384 },
);

const BRAND = svg(
  `<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="118" height="28" rx="5" fill="${GOLD}" stroke="#6b4a14" stroke-width="2"/>
  <text x="60" y="21" text-anchor="middle" font-family="serif" font-style="italic" font-weight="bold" font-size="18" fill="#2a1608">Fiorelli</text>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "accordion" });
  type V = [number, number, number];
  const box = (s: V, c: any, at: V, o: any = {}) => b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, ...o });

  const H = 0.4;
  const D = 0.25;
  const CW = 0.2; // case width
  const caseX = [0.266, -0.266];

  // ---------- cases ----------
  for (const cx of caseX) {
    box([CW, H, D], PEARL, [cx, H / 2, 0]);
    // black binding bands and gold pinstripes
    box([CW + 0.004, 0.012, D + 0.004], BLACK, [cx, 0.006, 0]);
    box([CW + 0.004, 0.012, D + 0.004], BLACK, [cx, H - 0.006, 0]);
    box([CW + 0.007, 0.003, D + 0.007], GOLD, [cx, 0.0135, 0]);
    box([CW + 0.007, 0.003, D + 0.007], GOLD, [cx, H - 0.0135, 0]);
    // vertical gold corner rails on the front
    for (const s of [1, -1]) {
      b.rod([cx + s * (CW / 2 - 0.004), 0.016, D / 2 + 0.001], [cx + s * (CW / 2 - 0.004), H - 0.016, D / 2 + 0.001], 0.002, GOLD, {
        sides: 6,
      });
    }
    // back strap
    box([0.13, 0.3, 0.012], LEATHER, [cx, 0.2, -D / 2 - 0.004]);
    box([0.02, 0.03, 0.006], GOLD, [cx, 0.28, -D / 2 - 0.012]);
    box([0.02, 0.03, 0.006], GOLD, [cx, 0.12, -D / 2 - 0.012]);
  }

  // end grilles
  b.part(new THREE.PlaneGeometry(0.2, 0.32), "#ffffff", {
    at: [0.266 + CW / 2 + 0.001, 0.2, 0],
    dir: [1, 0, 0],
    axis: "z",
    texture: END_TREBLE,
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.32), "#ffffff", {
    at: [-0.266 - CW / 2 - 0.001, 0.2, 0],
    dir: [-1, 0, 0],
    axis: "z",
    texture: END_BASS,
  });

  // ---------- bellows ----------
  const frontZ = (i: number) => (i % 2 === 0 ? 0.12 : 0.1);
  const N = 32;
  const side: [number, number, "sharp"][] = [];
  for (let i = 0; i <= N; i++) side.push([-0.16 + i * 0.01, frontZ(i), "sharp"]);
  const back: [number, number, "sharp"][] = [];
  for (let i = N; i >= 0; i--) back.push([-0.16 + i * 0.01, -frontZ(i), "sharp"]);
  b.extrude([...side, ...back], {
    at: [0, 0.2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.37,
    color: BELLOWS,
  });
  const top: [number, number, "sharp"][] = [];
  const bot: [number, number, "sharp"][] = [];
  for (let i = 0; i <= N; i++) top.push([-0.16 + i * 0.01, i % 2 === 0 ? 0.2 : 0.18, "sharp"]);
  for (let i = N; i >= 0; i--) bot.push([-0.16 + i * 0.01, i % 2 === 0 ? -0.2 : -0.18, "sharp"]);
  b.extrude([...top, ...bot], {
    at: [0, 0.2, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.21,
    color: BELLOWS,
  });
  // gold frame plates at bellows ends
  for (const s of [1, -1]) box([0.008, H, D + 0.004], GOLD, [s * 0.164, H / 2, 0]);
  // corner rails along the bellows
  for (const sy of [0.016, H - 0.016])
    for (const sz of [1, -1])
      b.rod([-0.16, sy, sz * 0.123], [0.16, sy, sz * 0.123], 0.004, GOLD, { sides: 6, caps: "flat" });

  // ---------- keyboard ----------
  const kx = 0.266;
  const zf = D / 2;
  box([0.17, 0.385, 0.004], KEYBLACK, [kx, H / 2, zf + 0.001]);
  const pitch = 0.0175;
  const y0 = 0.0163;
  for (let i = 0; i < 21; i++) {
    box([0.15, pitch - 0.0012, 0.012], IVORY, [kx, y0 + pitch * (i + 0.5), zf + 0.006]);
  }
  for (let i = 0; i < 20; i++) {
    if ([0, 1, 3, 4, 5].includes(i % 7)) {
      box([0.085, 0.0105, 0.02], KEYBLACK, [kx + 0.0325, y0 + pitch * (i + 1), zf + 0.01]);
    }
  }

  // ---------- bass button board ----------
  const bx = -0.266;
  box([0.17, 0.31, 0.004], KEYBLACK, [bx, 0.185, zf + 0.001]);
  const pearlBtn: THREE.BufferGeometry[] = [];
  const darkBtn: THREE.BufferGeometry[] = [];
  const rings: THREE.BufferGeometry[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 6; c++) {
      const x = bx + (c - 2.5) * 0.026;
      const y = 0.05 + r * 0.0325;
      const cap = new THREE.CylinderGeometry(0.0095, 0.0095, 0.009, 8).rotateX(Math.PI / 2).translate(x, y, zf + 0.0075);
      ((r * 6 + c) % 7 === 0 ? darkBtn : pearlBtn).push(cap);
      rings.push(new THREE.CylinderGeometry(0.0115, 0.0115, 0.004, 8).rotateX(Math.PI / 2).translate(x, y, zf + 0.004));
    }
  }
  b.part(mergeGeometries(pearlBtn)!, PEARL, { at: [0, 0, 0] });
  b.part(mergeGeometries(darkBtn)!, KEYBLACK, { at: [0, 0, 0] });
  b.part(mergeGeometries(rings)!, GOLD, { at: [0, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.12, 0.03), "#ffffff", { at: [bx, 0.372, zf + 0.0006], dir: [0, 0, 1], axis: "z", texture: BRAND });

  // ---------- treble top: register switches, bass top: air button ----------
  box([0.16, 0.008, 0.09], KEYBLACK, [kx, H + 0.004, 0.02]);
  for (let i = 0; i < 5; i++) {
    box([0.018, 0.008, 0.012], i % 2 ? PEARL : GOLD, [kx + (i - 2) * 0.03, H + 0.011, 0.02]);
  }
  b.part(new THREE.CylinderGeometry(0.012, 0.014, 0.012, 8), GOLD, { at: [bx, H + 0.006, -0.05] });
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 8), PEARL, { at: [bx, H + 0.014, -0.05] });

  // gold feet nubs at the base
  for (const cx of caseX)
    for (const sz of [1, -1]) box([0.02, 0.004, 0.02], GOLD_DK, [cx, 0.002, sz * 0.1]);

  return b.root;
}
