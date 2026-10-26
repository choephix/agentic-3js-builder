import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description:
    "Retro-industrial spaceship galley kitchen in the style of Alien (1979): grimy beige wall panels, steel counters, hob, sink, coffee maker, cold locker, bolted mess table with stools, overhead pipes, CRT monitor and a bulkhead hatch.",
};

// ---------- palette ----------
const WALL = "#c4bba2";
const WALL_DARK = "#8f8873";
const SEAM = "#4d4a40";
const STEEL = "#9aa1a3";
const STEEL_DK = "#5d6467";
const STEEL_LT = "#c3c8c8";
const DECK = "#3a3d3f";
const DECK_LT = "#55595b";
const BLACK = "#17181a";
const ORANGE = "#d4722a";
const ORANGE_DK = "#9a4c1a";
const YELLOW = "#e0b92c";
const CREAM = "#dcd3b6";
const PIPE_GREY = "#7b8184";
const GLASS = "#8fb0aa";
const RED = "#c43224";
const GREEN_LED = "#59ff9a";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "nostromoGalley" });

  // ---------- helpers ----------
  type O = { rotation?: [number, number, number]; flat?: boolean };
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: O = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10, o: O = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], flat: true, ...o });
  const tor = (r: number, t: number, c: string, x: number, y: number, z: number, rot: [number, number, number], seg = 12) =>
    b.part(new THREE.TorusGeometry(r, t, 5, seg), c, { at: [x, y, z], rotation: rot, flat: true });
  const ball = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), c, { at: [x, y, z], flat: true });
  const plane = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], texture: tex, rotation: rot });

  const screenTex = (lines: string[], col: string, bg: string) =>
    svg(
      `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="${bg}"/>
      <rect x="4" y="4" width="152" height="92" fill="none" stroke="${col}" stroke-width="2"/>
      ${lines
        .map(
          (t, i) =>
            `<text x="12" y="${22 + i * 14}" font-family="monospace" font-size="${i === 0 ? 11 : 9}" font-weight="bold" fill="${col}">${t}</text>`,
        )
        .join("")}
      <rect x="12" y="82" width="${70}" height="6" fill="${col}"/>
    </svg>`,
      { size: 256 },
    );
  const signTex = (t1: string, t2: string, bg: string, fg: string) =>
    svg(
      `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" fill="${bg}"/>
      <rect x="2" y="2" width="116" height="36" fill="none" stroke="${fg}" stroke-width="2"/>
      <text x="60" y="18" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="${fg}">${t1}</text>
      <text x="60" y="32" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="${fg}">${t2}</text>
    </svg>`,
      { size: 256 },
    );

  // ---------- deck ----------
  box(3.5, 0.06, 2.6, DECK, 0, 0.03, 0.3);
  for (let i = 0; i < 14; i++) box(3.4, 0.008, 0.02, DECK_LT, 0, 0.062, -0.9 + i * 0.18);
  for (let i = 0; i < 9; i++) box(0.02, 0.008, 2.5, DECK_LT, -1.6 + i * 0.4, 0.063, 0.3);
  // hazard stripe at the front lip
  for (let i = 0; i < 29; i++) box(0.062, 0.01, 0.1, i % 2 ? BLACK : YELLOW, -1.74 + i * 0.12, 0.066, 1.52, { rotation: [0, 20, 0] });

  // ---------- walls ----------
  box(3.5, 2.4, 0.08, WALL, 0, 1.2, -0.94);
  box(0.08, 2.4, 2.0, WALL, 1.79, 1.2, 0.0);
  // wall panel seams on back wall
  for (let i = 0; i < 8; i++) box(0.012, 2.3, 0.01, SEAM, -1.5 + i * 0.43, 1.2, -0.896);
  box(3.4, 0.012, 0.01, SEAM, 0, 2.0, -0.896);
  box(3.4, 0.012, 0.01, SEAM, 0, 1.45, -0.896);
  box(3.4, 0.3, 0.012, WALL_DARK, 0, 0.2, -0.897); // grimy kick band
  box(3.4, 0.08, 0.012, ORANGE_DK, 0, 2.25, -0.898); // stripe
  // backsplash
  box(2.7, 0.52, 0.015, STEEL_DK, 0.25, 1.2, -0.893);
  for (let i = 0; i < 23; i++) ball(0.011, STEEL_LT, -1.0 + i * 0.12, 2.12, -0.89);
  for (let i = 0; i < 12; i++) ball(0.011, STEEL_LT, 1.745, 0.3 + i * 0.18 > 2.3 ? 2.3 : 0.3 + i * 0.18, -0.6 + (i % 2) * 0.0);
  // sign
  plane(0.5, 0.17, signTex("GALLEY", "DECK C / 07", ORANGE, BLACK), -1.35, 2.18, -0.888);

  // ---------- tall cold locker ----------
  box(0.52, 1.92, 0.6, STEEL, -1.36, 1.02, -0.6);
  box(0.46, 1.8, 0.02, STEEL_LT, -1.36, 1.02, -0.29);
  box(0.02, 0.5, 0.04, BLACK, -1.18, 1.1, -0.26);
  box(0.46, 0.02, 0.012, SEAM, -1.36, 1.6, -0.277);
  box(0.22, 0.1, 0.01, BLACK, -1.36, 1.8, -0.277);
  glow(box(0.18, 0.06, 0.008, GREEN_LED, -1.36, 1.8, -0.272), 1.4);
  plane(0.3, 0.1, signTex("COLD STORE", "-18 C", YELLOW, BLACK), -1.36, 1.45, -0.275);
  for (let i = 0; i < 4; i++) ball(0.012, STEEL_DK, -1.57, 0.4 + i * 0.5, -0.28);

  // ---------- base counter ----------
  box(2.7, 0.8, 0.55, STEEL, 0.25, 0.5, -0.625);
  box(2.7, 0.1, 0.5, BLACK, 0.25, 0.11, -0.64);
  box(2.76, 0.04, 0.6, STEEL_LT, 0.25, 0.92, -0.6);
  box(2.76, 0.02, 0.02, STEEL_DK, 0.25, 0.945, -0.31);
  for (let i = 0; i < 5; i++) {
    const x = -0.85 + i * 0.54;
    box(0.5, 0.7, 0.02, i % 2 ? STEEL_DK : STEEL_LT, x, 0.5, -0.345);
    box(0.3, 0.025, 0.03, BLACK, x, 0.78, -0.325);
    box(0.46, 0.008, 0.01, SEAM, x, 0.2, -0.332);
  }
  // oven window at first door
  box(0.28, 0.2, 0.012, BLACK, -0.85, 0.5, -0.332);
  glow(box(0.2, 0.1, 0.01, ORANGE, -0.85, 0.5, -0.326), 1.2);

  // ---------- hob ----------
  box(0.7, 0.025, 0.46, BLACK, -0.55, 0.955, -0.62);
  const burners: [number, number][] = [[-0.7, -0.74], [-0.4, -0.74], [-0.7, -0.5], [-0.4, -0.5]];
  burners.forEach(([x, z], i) => {
    cyl(0.085, 0.085, 0.012, STEEL_DK, x, 0.972, z, 10);
    if (i === 1) glow(tor(0.065, 0.011, RED, x, 0.982, z, [90, 0, 0]), 1.6);
    else tor(0.065, 0.01, "#2a2c2e", x, 0.98, z, [90, 0, 0]);
  });
  // pot on burner 1
  cyl(0.1, 0.095, 0.15, STEEL, -0.4, 1.055, -0.74, 10);
  cyl(0.105, 0.105, 0.02, STEEL_LT, -0.4, 1.14, -0.74, 10);
  box(0.07, 0.02, 0.02, BLACK, -0.4, 1.158, -0.74);
  box(0.1, 0.02, 0.025, BLACK, -0.265, 1.08, -0.74);
  // pan on burner 3
  cyl(0.11, 0.09, 0.04, STEEL_DK, -0.7, 0.995, -0.5, 10);
  box(0.2, 0.015, 0.03, BLACK, -0.55, 1.005, -0.5);
  // control knobs
  for (let i = 0; i < 4; i++) cyl(0.022, 0.022, 0.03, ORANGE, -0.82 + i * 0.09, 0.96, -0.34, 8, { rotation: [90, 0, 0] });

  // ---------- extractor hood ----------
  b.part(new THREE.CylinderGeometry(0.3, 0.5, 0.45, 4), STEEL, { at: [-0.55, 1.78, -0.7], rotation: [0, 45, 0], scale: [1, 1, 0.8], flat: true });
  box(0.28, 0.5, 0.2, STEEL_DK, -0.55, 2.15, -0.8);
  box(0.5, 0.02, 0.01, BLACK, -0.55, 1.58, -0.46);
  glow(box(0.3, 0.02, 0.01, "#ffe7a8", -0.55, 1.56, -0.5), 1.2);

  // ---------- sink ----------
  box(0.6, 0.02, 0.4, STEEL_LT, 0.35, 0.945, -0.62);
  box(0.5, 0.02, 0.32, "#262a2c", 0.35, 0.955, -0.62);
  cyl(0.016, 0.016, 0.2, STEEL_LT, 0.35, 1.04, -0.82, 8);
  cyl(0.014, 0.014, 0.2, STEEL_LT, 0.35, 1.13, -0.72, 8, { rotation: [90, 0, 0] });
  cyl(0.02, 0.014, 0.03, STEEL_LT, 0.35, 1.115, -0.62, 8);
  cyl(0.012, 0.012, 0.05, RED, 0.28, 0.98, -0.82, 6);
  cyl(0.012, 0.012, 0.05, "#3a6fd1", 0.42, 0.98, -0.82, 6);

  // ---------- coffee machine ----------
  box(0.3, 0.05, 0.3, BLACK, 1.28, 0.97, -0.68);
  box(0.3, 0.44, 0.12, CREAM, 1.28, 1.2, -0.82);
  box(0.3, 0.1, 0.28, CREAM, 1.28, 1.38, -0.7);
  cyl(0.065, 0.075, 0.16, GLASS, 1.28, 1.07, -0.65, 8);
  box(0.13, 0.03, 0.05, BLACK, 1.28, 1.31, -0.58);
  glow(box(0.05, 0.02, 0.008, RED, 1.35, 1.2, -0.755), 1.5);
  glow(box(0.05, 0.02, 0.008, GREEN_LED, 1.21, 1.2, -0.755), 1.5);
  cyl(0.065, 0.065, 0.06, "#3e2b1e", 1.28, 1.02, -0.65, 8);

  // ---------- upper cabinets ----------
  box(0.85, 0.6, 0.35, STEEL, 1.175, 1.82, -0.725);
  box(0.4, 0.5, 0.012, STEEL_LT, 1.0, 1.82, -0.544);
  box(0.4, 0.5, 0.012, STEEL_LT, 1.4, 1.82, -0.544);
  box(0.03, 0.14, 0.02, BLACK, 1.18, 1.72, -0.535);
  box(0.03, 0.14, 0.02, BLACK, 1.22, 1.72, -0.535);
  box(0.05, 0.04, 0.02, YELLOW, 1.0, 1.6, -0.535);
  box(0.05, 0.04, 0.02, YELLOW, 1.4, 1.6, -0.535);

  // ---------- wall monitor ----------
  box(0.74, 0.56, 0.12, "#6c7173", 0.35, 1.78, -0.84);
  box(0.64, 0.46, 0.04, BLACK, 0.35, 1.78, -0.77);
  glow(plane(0.58, 0.4, screenTex(["MOTHER INTERFACE", "GALLEY STATUS: OK", "RATIONS ... 0412", "WATER  ... 71%", "CREW .... 07", "> _"], "#7dffb0", "#06180f"), 0.35, 1.78, -0.745), 1.3);
  for (let i = 0; i < 4; i++) cyl(0.014, 0.014, 0.02, i === 0 ? ORANGE : STEEL_LT, 0.15 + i * 0.07, 1.46, -0.78, 8, { rotation: [90, 0, 0] });

  // ---------- utensil rail ----------
  cyl(0.01, 0.01, 0.7, STEEL_LT, 0.35, 1.38, -0.8, 6, { rotation: [0, 0, 90] });
  box(0.02, 0.04, 0.03, STEEL_DK, 0.02, 1.38, -0.82);
  box(0.02, 0.04, 0.03, STEEL_DK, 0.68, 1.38, -0.82);
  // ladle
  cyl(0.008, 0.008, 0.22, STEEL, 0.1, 1.26, -0.79, 6);
  cyl(0.04, 0.025, 0.04, STEEL, 0.1, 1.13, -0.79, 8);
  // spatula
  cyl(0.008, 0.008, 0.2, BLACK, 0.2, 1.28, -0.79, 6);
  box(0.07, 0.1, 0.01, STEEL_DK, 0.2, 1.13, -0.79);
  // whisk-ish / tongs
  box(0.012, 0.22, 0.012, STEEL, 0.3, 1.27, -0.79);
  box(0.012, 0.22, 0.012, STEEL, 0.318, 1.27, -0.79);
  // small pans
  for (let i = 0; i < 2; i++) {
    cyl(0.07, 0.07, 0.02, STEEL_DK, 0.45 + i * 0.12, 1.22, -0.82, 10, { rotation: [90, 0, 0] });
    box(0.012, 0.1, 0.012, BLACK, 0.45 + i * 0.12, 1.31, -0.82);
  }
  // cups on hooks
  for (let i = 0; i < 2; i++) cyl(0.035, 0.03, 0.07, CREAM, 0.6 + i * 0.05, 1.28, -0.81 + i * 0.0, 8);

  // ---------- overhead pipes ----------
  cyl(0.05, 0.05, 3.4, ORANGE, 0, 2.3, -0.78, 8, { rotation: [0, 0, 90] });
  cyl(0.032, 0.032, 3.4, PIPE_GREY, 0, 2.3, -0.64, 8, { rotation: [0, 0, 90] });
  cyl(0.025, 0.025, 3.4, STEEL_DK, 0, 2.2, -0.82, 6, { rotation: [0, 0, 90] });
  for (let i = 0; i < 8; i++) {
    const x = -1.5 + i * 0.43;
    cyl(0.065, 0.065, 0.035, ORANGE_DK, x, 2.3, -0.78, 8, { rotation: [0, 0, 90] });
    cyl(0.045, 0.045, 0.03, STEEL_DK, x + 0.1, 2.3, -0.64, 8, { rotation: [0, 0, 90] });
  }
  // valve on pipe
  cyl(0.02, 0.02, 0.1, STEEL_DK, 0.9, 2.37, -0.78, 6);
  tor(0.06, 0.012, RED, 0.9, 2.43, -0.78, [90, 0, 0]);
  // drop-down branch pipe
  cyl(0.03, 0.03, 0.4, PIPE_GREY, 1.62, 2.1, -0.84, 8);
  cyl(0.045, 0.045, 0.03, ORANGE_DK, 1.62, 2.28, -0.84, 8);

  // ---------- ceiling light over table ----------
  box(1.3, 0.04, 0.34, STEEL_DK, 0, 2.38, 0.55);
  glow(box(1.2, 0.02, 0.26, "#fff1cf", 0, 2.355, 0.55), 1.3);
  for (let i = 0; i < 2; i++) cyl(0.01, 0.01, 0.2, BLACK, -0.5 + i, 2.3, 0.55, 5);

  // ---------- mess table ----------
  box(1.7, 0.06, 0.75, CREAM, -0.1, 0.78, 0.55);
  box(1.74, 0.04, 0.79, STEEL_DK, -0.1, 0.74, 0.55);
  for (const x of [-0.75, 0.55]) {
    cyl(0.07, 0.07, 0.7, STEEL, x, 0.38, 0.55, 8);
    cyl(0.17, 0.17, 0.03, STEEL_DK, x, 0.075, 0.55, 8);
  }
  // table items
  box(0.42, 0.02, 0.3, STEEL, -0.55, 0.82, 0.55);
  for (let i = 0; i < 3; i++) box(0.11, 0.012, 0.22, i === 1 ? "#6b7f3a" : "#9a7a4a", -0.64 + i * 0.12, 0.833, 0.55);
  for (let i = 0; i < 3; i++) {
    const x = 0.1 + i * 0.22;
    cyl(0.04, 0.035, 0.09, i === 1 ? ORANGE : CREAM, x, 0.855, 0.45 + i * 0.1, 8);
    tor(0.025, 0.007, i === 1 ? ORANGE : CREAM, x + 0.045, 0.855, 0.45 + i * 0.1, [0, 90, 0], 8);
  }
  cyl(0.06, 0.05, 0.05, STEEL_LT, 0.1, 0.835, 0.7, 8); // bowl
  cyl(0.018, 0.018, 0.07, STEEL_LT, 0.48, 0.845, 0.65, 6); // shaker
  cyl(0.018, 0.018, 0.07, BLACK, 0.52, 0.845, 0.65, 6);
  cyl(0.03, 0.03, 0.2, "#4f7d62", 0.62, 0.9, 0.45, 8); // bottle
  cyl(0.012, 0.012, 0.06, "#4f7d62", 0.62, 1.03, 0.45, 6);
  plane(0.1, 0.04, signTex("MESS", "07", YELLOW, BLACK), -0.1, 0.8125, 0.3, [-90, 0, 0]);

  // ---------- stools ----------
  for (const x of [-0.65, -0.1, 0.45, 0.95]) {
    const z = x > 0.9 ? 0.55 : 1.3;
    const xx = x > 0.9 ? 1.1 : x;
    cyl(0.03, 0.03, 0.4, STEEL_DK, xx, 0.26, z, 8);
    cyl(0.14, 0.14, 0.03, STEEL_DK, xx, 0.075, z, 8);
    cyl(0.17, 0.17, 0.07, ORANGE, xx, 0.49, z, 8);
    cyl(0.175, 0.175, 0.012, ORANGE_DK, xx, 0.455, z, 8);
  }

  // ---------- bulkhead hatch (right wall) ----------
  box(0.05, 1.5, 0.95, WALL_DARK, 1.73, 1.1, 0.2);
  tor(0.46, 0.05, STEEL_DK, 1.7, 1.1, 0.2, [0, 90, 0], 14);
  cyl(0.42, 0.42, 0.06, STEEL, 1.69, 1.1, 0.2, 14, { rotation: [0, 0, 90] });
  cyl(0.3, 0.3, 0.02, STEEL_LT, 1.655, 1.1, 0.2, 14, { rotation: [0, 0, 90] });
  // wheel
  tor(0.14, 0.016, ORANGE, 1.63, 1.1, 0.2, [0, 90, 0], 10);
  for (let i = 0; i < 3; i++) box(0.012, 0.28, 0.012, ORANGE, 1.63, 1.1, 0.2, { rotation: [i * 60, 0, 0] });
  cyl(0.03, 0.03, 0.04, ORANGE_DK, 1.625, 1.1, 0.2, 8, { rotation: [0, 0, 90] });
  // hinges and lamp
  for (const y of [0.8, 1.4]) box(0.05, 0.1, 0.05, BLACK, 1.68, y, 0.68);
  glow(cyl(0.03, 0.03, 0.02, RED, 1.69, 1.78, 0.2, 8, { rotation: [0, 0, 90] }), 1.6);
  plane(0.3, 0.1, signTex("AIRLOCK 3", "AUTH ONLY", YELLOW, BLACK), 1.745, 1.9, -0.45, [0, -90, 0]);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ball(0.014, STEEL_LT, 1.67, 1.1 + Math.sin(a) * 0.5, 0.2 + Math.cos(a) * 0.5);
  }

  // ---------- cables and details ----------
  cyl(0.012, 0.012, 0.45, BLACK, 0.8, 2.15, -0.89, 5);
  cyl(0.012, 0.012, 0.5, BLACK, 0.84, 2.1, -0.89, 5);
  box(0.12, 0.08, 0.04, STEEL_DK, 0.82, 1.95, -0.88);
  glow(box(0.04, 0.02, 0.01, YELLOW, 0.82, 1.95, -0.855), 1.3);
  // fire extinguisher by locker
  cyl(0.06, 0.06, 0.3, RED, -1.0, 0.95 - 0.28 + 0.15, -0.82, 8);
  cyl(0.02, 0.02, 0.06, BLACK, -1.0, 0.99, -0.82, 6);
  cyl(0.014, 0.014, 0.1, BLACK, -1.0, 1.03, -0.82, 5);

  return b.root;
}
