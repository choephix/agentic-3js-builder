import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, stripes, svg } from "../../../../src/index";
import { metal, panelled, INK } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description: "A Final Fantasy style gunblade: revolver chamber hilt, spine barrel, winged gold guard, runed blade.",
};

const LEATHER = stripes("#3a2418", "#1c100a", { size: 0.012, axis: "y", width: 0.55, wobble: 0.15 });
const STEEL = paint((p, n) => {
  const t = noise(p, 0.12, 4);
  const base = mix("#aeb8c8", "#eef3fa", t);
  return mix(base, "#6d788c", 0.35 * smoothstep(0.2, -0.6, n.y));
});
const GOLD = metal("gilt", { tarnish: 0.15 });
const IRON = panelled(metal("iron"), { size: 0.05, rivets: 0.02 });
const DARK = "#1d2029";
const CYAN = "#58e6ff";

const chamberTex = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#8a929f" stroke="#1d2029" stroke-width="3"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#2c303b" stroke-width="2"/>
  ${[0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (i * Math.PI) / 3;
      return `<circle cx="${50 + 26 * Math.sin(a)}" cy="${50 - 26 * Math.cos(a)}" r="9" fill="#0d0f14" stroke="#d9a93a" stroke-width="2.5"/>`;
    })
    .join("")}
  <circle cx="50" cy="50" r="8" fill="#d9a93a" stroke="#1d2029" stroke-width="2"/></svg>`,
  { size: 192 },
);

const lionTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1d2029" stroke="#f3cf6a" stroke-width="3"/>
  <path d="M32 10 L40 18 L48 16 L46 26 L52 34 L44 38 L42 50 L32 44 L22 50 L20 38 L12 34 L18 26 L16 16 L24 18Z" fill="#f3cf6a" stroke="#7a5a22" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="26" cy="30" r="2.6" fill="#1d2029"/><circle cx="38" cy="30" r="2.6" fill="#1d2029"/>
  <path d="M28 38 L32 42 L36 38" stroke="#1d2029" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);

const runeTex = svg(
  `<svg viewBox="0 0 20 200"><g stroke="#58e6ff" stroke-width="2.4" fill="none" stroke-linecap="round">
  ${Array.from({ length: 9 }, (_, i) => {
    const y = 14 + i * 21;
    return i % 3 === 0
      ? `<path d="M5 ${y} L10 ${y + 12} L15 ${y} M10 ${y + 12} V${y + 18}"/>`
      : i % 3 === 1
        ? `<path d="M5 ${y} H15 M10 ${y} V${y + 16} M5 ${y + 16} L15 ${y + 8}"/>`
        : `<path d="M6 ${y} L14 ${y + 8} L6 ${y + 16} M14 ${y} V${y + 16}"/>`;
  }).join("")}</g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  // ---- hilt ----
  const pommel = b.part(new THREE.IcosahedronGeometry(0.04, 1), GOLD, { at: [0, 0.038, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), DARK, { at: [0, 0.085, 0] });
  b.part(new THREE.CylinderGeometry(0.023, 0.024, 0.25, 10), LEATHER, { at: [0, 0.21, 0] });
  for (let i = 0; i < 5; i++)
    b.part(new THREE.TorusGeometry(0.025, 0.004, 5, 10), GOLD, { at: [0, 0.11 + i * 0.048, 0], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.032, 0.026, 0.02, 8), GOLD, { at: [0, 0.345, 0] });

  // ---- revolver housing ----
  b.part(new THREE.BoxGeometry(0.11, 0.17, 0.05), IRON, { at: [0, 0.43, 0] });
  b.part(new THREE.BoxGeometry(0.13, 0.03, 0.06), GOLD, { at: [0, 0.35, 0] });
  b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.075, 12), metal("steel"), { at: [0, 0.42, 0], dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.058, 20), "#ffffff", {
      at: [0, 0.42, s * 0.0385],
      dir: [0, 0, s],
      axis: "z",
      texture: chamberTex,
    });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), GOLD, { at: [0, 0.42, s * 0.04], dir: [0, 0, s] });
  }
  // hammer
  b.part(new THREE.BoxGeometry(0.02, 0.07, 0.016), DARK, { at: [-0.06, 0.52, 0], rotation: [0, 0, 25] });
  // trigger and guard
  b.part(new THREE.BoxGeometry(0.012, 0.045, 0.012), GOLD, { at: [-0.075, 0.325, 0], rotation: [0, 0, 15] });
  b.part(new THREE.TorusGeometry(0.048, 0.006, 5, 14, Math.PI * 1.5), GOLD, {
    at: [-0.075, 0.3, 0],
    rotation: [0, 0, 130],
  });

  // ---- winged guard ----
  const wing = [
    [0, -0.02],
    [0.09, -0.01],
    [0.17, 0.05],
    [0.115, 0.048],
    [0.125, 0.11],
    [0.055, 0.065],
    [0, 0.055],
  ] as [number, number][];
  for (const s of [1, -1]) {
    b.extrude(wing, { at: [0, 0.5, 0], x: [s, 0, 0], thickness: 0.03, bevel: 0.006, color: GOLD });
    b.part(new THREE.IcosahedronGeometry(0.014, 0), CYAN, { at: [s * 0.075, 0.52, 0.02] });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), CYAN, { at: [0, 0.5, 0.025] }), 1.6);
  b.part(new THREE.CircleGeometry(0.036, 18), "#ffffff", { at: [0, 0.43, 0.0265], dir: [0, 0, 1], axis: "z", texture: lionTex });

  // ---- blade ----
  const outline = [
    [-0.035, 0.52],
    [0.058, 0.52],
    [0.064, 0.9],
    [0.052, 1.22],
    [0.0, 1.42, "sharp"],
    [-0.036, 1.3],
    [-0.042, 0.8],
  ] as any;
  b.extrude(outline, { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: STEEL });
  // bright edge
  b.extrude(
    [
      [0.052, 0.54],
      [0.062, 0.54],
      [0.067, 0.9],
      [0.054, 1.23],
      [0.04, 1.25],
      [0.05, 0.9],
    ] as any,
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.006, color: "#ffffff" },
  );
  // fuller with runes
  b.extrude(
    [
      [-0.02, 0.58],
      [0.03, 0.58],
      [0.03, 1.12],
      [0.005, 1.2],
      [-0.02, 1.12],
    ] as any,
    { at: [0, 0, 0.0035], x: [1, 0, 0], thickness: 0.018, color: "#4b5568" },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.03, 0.3), "#ffffff", {
      at: [0.005, 0.85, 0.0128],
      dir: [0, 0, 1],
      axis: "z",
      texture: runeTex,
    }),
    1.4,
  );
  // blade base collar
  b.part(new THREE.BoxGeometry(0.13, 0.03, 0.035), GOLD, { at: [0.01, 0.535, 0] });

  // ---- spine barrel ----
  b.rod([-0.058, 0.5, 0], [-0.058, 1.2, 0], 0.014, { color: DARK, sides: 8 });
  for (const y of [0.56, 0.78, 1.0, 1.18]) b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), GOLD, { at: [-0.058, y, 0] });
  b.part(new THREE.CylinderGeometry(0.017, 0.012, 0.03, 8), IRON, { at: [-0.058, 1.215, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.005, 6), "#ffb347", { at: [-0.058, 1.232, 0] }), 1.5);
  // blade-to-barrel brackets
  for (const y of [0.64, 0.9, 1.1]) b.part(new THREE.BoxGeometry(0.03, 0.025, 0.026), DARK, { at: [-0.045, y, 0] });

  // ---- pendant chain from pommel ----
  const rn = rng0();
  for (let i = 0; i < 7; i++) {
    const a = i * 0.5;
    b.part(new THREE.TorusGeometry(0.008, 0.0025, 4, 6), "#c8ced8", {
      at: [0.045 + Math.sin(a) * 0.012, 0.28 - i * 0.032 + rn() * 0.002, 0.03],
      rotation: [i % 2 ? 90 : 0, 0, 0],
    });
  }
  b.part(new THREE.CircleGeometry(0.02, 12), "#ffffff", { at: [0.048, 0.055, 0.032], dir: [0, 0, 1], axis: "z", texture: lionTex });

  void pommel;
  return b.root;
}

function rng0() {
  let s = 7;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
