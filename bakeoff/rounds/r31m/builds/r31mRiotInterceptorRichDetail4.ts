import * as THREE from "three";
import { createBuilder, paint, noise, mix, catmull, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, gaugeTexture } from "../../../../kits/clockwork";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Vantage Riot Interceptor",
  description:
    "Corporate riot-control interceptor: armored cab, roof-mounted water cannon with glowing nozzle, hose and tanks, ram plow, neon light bars and underglow. Cyberpunk 2077 style.",
};

// ------------------------------------------------------------------ palette
const CY = "#19f0ff";
const MG = "#ff2d95";
const YEL = "#f4d51e";
const RED = "#ff2030";
const DARK = "#14151c";
const STEEL = "#6b7280";
const GLASS = "#0b2a33";
const BLACK = "#0a0a0e";

// paints
const HULL = panelled(
  paint((p, n) => {
    const base: [number, number, number] = [0.1, 0.11, 0.16];
    const grime = Math.max(0, 1 - p.y / 1.1) * 0.8 + noise(p, 0.3, 4) * 0.25;
    const lit = n.y > 0.5 ? 0.06 : 0;
    const c = mix([base[0] + lit, base[1] + lit, base[2] + lit + 0.02], [0.2, 0.17, 0.12], Math.min(grime, 0.7));
    return c;
  }),
  { size: 0.5, aspect: 0.6, rivets: 0.12 },
);
const YELP = paint((p, n) => mix("#f4d51e", "#8f6c08", Math.min(1, noise(p, 0.16, 3) * 0.55 + (n.y < -0.3 ? 0.3 : 0))));
const TANKP = paint((p) => (Math.floor((p.z + 5) / 0.28) % 4 === 0 ? "#12a9b8" : mix("#c7ccd6", "#6e7480", noise(p, 0.2, 6))));
const TYREP = paint((p) => mix("#16171b", "#2b2c33", noise(p, 0.05, 2)));

// ------------------------------------------------------------------ textures
const LOGO = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="196" height="96" rx="8" fill="#0a0a0e" stroke="#f4d51e" stroke-width="4"/>
  <polygon points="40,12 66,26 66,56 40,70 14,56 14,26" fill="#f4d51e" stroke="#0a0a0e" stroke-width="3"/>
  <path d="M26 30 L40 58 L54 30" stroke="#0a0a0e" stroke-width="7" fill="none" stroke-linejoin="round"/>
  <text x="76" y="44" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="26" fill="#f4d51e">VANTAGE</text>
  <text x="77" y="64" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#19f0ff" letter-spacing="3">SECURITY DIV.</text>
  <rect x="14" y="80" width="172" height="5" fill="#ff2d95"/>
  <path d="M14 76 h172" stroke="#19f0ff" stroke-width="1.5"/></svg>`,
  { size: 512 },
);
const chev = (() => {
  let s = `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="40" fill="#f4d51e"/>`;
  for (let i = -2; i < 8; i++) s += `<polygon points="${i * 20},40 ${i * 20 + 10},40 ${i * 20 + 30},0 ${i * 20 + 20},0" fill="#0a0a0e"/>`;
  return svg(s + `</svg>`, { size: 384 });
})();
const STRIP = (() => {
  let s = `<svg viewBox="0 0 160 16" xmlns="http://www.w3.org/2000/svg">`;
  for (let i = 0; i < 8; i++) {
    const c = i % 2 ? "#ff2d95" : "#19f0ff";
    s += `<rect x="${i * 20 + 1}" y="1" width="18" height="14" rx="3" fill="${c}"/><rect x="${i * 20 + 4}" y="6" width="12" height="4" fill="#ffffff" opacity="0.8"/>`;
  }
  return svg(s + `</svg>`, { size: 512 });
})();
const HUD = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d3c48"/><stop offset="1" stop-color="#05141a"/></linearGradient></defs>
  <rect width="200" height="80" fill="url(#g)"/>
  <path d="M0 8 H200 M0 20 H200 M0 32 H200 M0 44 H200 M0 56 H200 M0 68 H200" stroke="#19f0ff" stroke-width="0.6" opacity="0.25"/>
  <circle cx="100" cy="40" r="16" fill="none" stroke="#19f0ff" stroke-width="1.2"/>
  <path d="M100 18 v14 M100 48 v14 M78 40 h14 M108 40 h14" stroke="#19f0ff" stroke-width="1.2"/>
  <text x="8" y="14" font-family="monospace" font-size="7" fill="#19f0ff">UNIT 07 // CROWD 82%</text>
  <text x="130" y="74" font-family="monospace" font-size="7" fill="#ff2d95">CANNON: ARMED</text>
  <polygon points="150,0 170,0 120,80 100,80" fill="#ffffff" opacity="0.07"/></svg>`,
  { size: 512 },
);
const LABEL = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="58" fill="#0a0a0e" stroke="#f4d51e" stroke-width="3"/>
  <text x="50" y="22" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="15" fill="#ffffff">RIOT</text>
  <text x="50" y="38" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="13" fill="#f4d51e">CONTROL</text>
  <path d="M8 46 h4 v8 h-4z M15 46 h2 v8 h-2z M20 46 h5 v8 h-5z M28 46 h2 v8 h-2z M33 46 h4 v8 h-4z M40 46 h2 v8 h-2z" fill="#ffffff"/>
  <text x="92" y="53" text-anchor="end" font-family="monospace" font-size="9" fill="#19f0ff">07</text></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 100 28" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="26" rx="3" fill="#e8e8f0" stroke="#0a0a0e" stroke-width="2"/>
  <rect x="1" y="1" width="98" height="6" fill="#19f0ff"/>
  <text x="50" y="23" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="15" fill="#0a0a0e">VS-4471</text></svg>`,
  { size: 256 },
);
const WATER = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="58" rx="5" fill="#06222a" stroke="#19f0ff" stroke-width="3"/>
  <path d="M22 10 C14 24 12 30 22 40 C32 30 30 24 22 10Z" fill="#19f0ff"/>
  <text x="40" y="26" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="14" fill="#19f0ff">H2O</text>
  <text x="40" y="40" font-family="monospace" font-size="9" fill="#ffffff">40 BAR</text>
  <path d="M8 50 h84" stroke="#ff2d95" stroke-width="3" stroke-dasharray="6 3"/></svg>`,
  { size: 256 },
);
const GAUGE = gaugeTexture({ label: "BAR", needle: 40 });

// ------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const chassis = b.joint("chassis", { at: [0, 0.7, 0], role: "spine" });
  const r = rng(5);

  const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cy = (rad: number, h: number, n = 8) => new THREE.CylinderGeometry(rad, rad, h, n);
  type V = [number, number, number];
  const P = (geo: THREE.BufferGeometry, col: any, at: V, o: any = {}) => b.part(geo, col, { bone: chassis, at, ...o });
  const D = (tex: any, w: number, h: number, at: V, dir: V, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });
  const R = (a: V, c: V, rad: number, col: any, o: any = {}) => b.rod(a, c, rad, col, { bone: chassis, sides: 6, ...o });

  // ---------------- frame and underbody
  for (const s of [1, -1]) {
    P(bx(0.12, 0.18, 5.6), DARK, [s * 0.5, 0.68, 0]);
    R([s * 1.1, 0.53, -1.7], [s * 0.5, 0.65, -1.7], 0.05, STEEL);
    R([s * 1.1, 0.53, 1.9], [s * 0.5, 0.65, 1.9], 0.05, STEEL);
    glow(P(bx(0.05, 0.05, 3.4), s > 0 ? MG : CY, [s * 1.0, 0.64, 0.1]), 1.4); // underglow
    glow(P(bx(0.05, 0.05, 3.4), s > 0 ? CY : MG, [s * 0.78, 0.62, 0.1]), 0.8);
  }
  R([0, 0.6, 1.9], [0, 0.6, -1.7], 0.06, STEEL);
  P(cy(0.14, 0.5, 8), STEEL, [0, 0.62, 0], { rotation: [0, 0, 90], flat: true });

  // ---------------- hull
  P(bx(2.1, 0.8, 4.2), HULL, [0, 1.1, -0.7]); // lower hull
  P(bx(2.1, 0.8, 2.45), HULL, [0, 1.9, -1.575]); // rear compartment
  P(bx(2.1, 0.35, 1.75), HULL, [0, 1.675, 0.525]); // cab lower
  b.frustumBox([0, 1.15, 1.4], [0, 1.1, 2.9], [2.1, 0.9], [1.96, 0.7], { bone: chassis, color: HULL });
  P(bx(0.5, 0.04, 1.4), YELP, [0, 1.62, 2.1]); // hood stripe
  P(bx(0.5, 0.01, 1.4), DARK, [0, 1.645, 2.1]);
  for (let i = 0; i < 5; i++) P(bx(0.4, 0.02, 0.05), DARK, [0, 1.66, 1.55 + i * 0.22]); // hood vents
  for (const s of [1, -1]) glow(P(bx(0.03, 0.03, 1.4), MG, [s * 0.98, 1.56, 2.15]), 1.2); // hood neon edge

  // cab greenhouse
  P(bx(2.0, 0.5, 1.4), GLASS, [0, 2.1, 0.35]);
  P(bx(2.2, 0.1, 1.9), HULL, [0, 2.42, 0.05]); // roof slab
  P(bx(2.24, 0.04, 1.94), YELP, [0, 2.375, 0.05]); // yellow trim underside
  for (const s of [1, -1]) {
    P(bx(0.1, 0.55, 0.12), HULL, [s * 1.0, 2.1, -0.38]);
    P(bx(0.1, 0.55, 0.1), HULL, [s * 1.0, 2.1, 1.0]);
    b.extrude(
      [[1.05, 1.85], [1.42, 1.85], [1.05, 2.42]],
      { at: [s * 1.0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, color: HULL, bone: chassis },
    );
  }
  // windscreen with HUD drawing, wire guard
  D(HUD, 1.9, 0.65, [0, 2.14, 1.23], [0, 0.5, 0.85]);
  P(bx(2.0, 0.05, 0.05), HULL, [0, 1.86, 1.42]);
  for (let i = -3; i <= 3; i++)
    R([i * 0.28, 1.88, 1.46], [i * 0.28, 2.42, 1.1], 0.012, STEEL, { sides: 4 });
  for (const t of [0.35, 0.7]) R([-1.0, 1.88 + 0.55 * t, 1.46 - 0.36 * t], [1.0, 1.88 + 0.55 * t, 1.46 - 0.36 * t], 0.012, STEEL, { sides: 4 });
  // wipers
  for (const x of [-0.4, 0.4]) R([x, 1.9, 1.42], [x + 0.5, 2.15, 1.27], 0.012, BLACK, { sides: 4 });

  // doors
  for (const s of [1, -1]) {
    const door = b.joint(s > 0 ? "doorL" : "doorR", { parent: chassis, at: [s * 1.07, 1.6, 0.95], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
    const pd = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: door, at, ...o });
    pd(bx(0.05, 0.62, 1.2), HULL, [s * 1.07, 1.28, 0.35]);
    pd(bx(0.055, 0.06, 1.2), YELP, [s * 1.07, 1.0, 0.35]);
    pd(bx(0.055, 0.06, 1.2), YELP, [s * 1.07, 1.6, 0.35]);
    pd(bx(0.05, 0.08, 1.2), HULL, [s * 1.07, 2.38, 0.35]);
    pd(bx(0.04, 0.55, 1.1), "#06161c", [s * 1.065, 2.08, 0.35]);
    for (let i = 0; i < 6; i++) R([s * 1.1, 1.82, -0.15 + i * 0.2], [s * 1.1, 2.34, -0.15 + i * 0.2], 0.012, STEEL, { bone: door, sides: 4 });
    for (const y of [1.95, 2.2]) R([s * 1.1, y, -0.22], [s * 1.1, y, 0.9], 0.012, STEEL, { bone: door, sides: 4 });
    pd(bx(0.06, 0.04, 0.2), STEEL, [s * 1.11, 1.45, -0.1]); // handle
    for (const y of [1.0, 1.55]) pd(cy(0.025, 0.1, 6), STEEL, [s * 1.07, y, 0.95]);
    // seams
    for (const z of [-0.26, 0.96]) pd(bx(0.055, 0.7, 0.012), BLACK, [s * 1.07, 1.3, z]);
    D(LABEL, 0.36, 0.22, [s * 1.1, 1.3, 0.55], [s, 0, 0], { bone: door });
    glow(pd(bx(0.03, 0.03, 1.1), s > 0 ? CY : MG, [s * 1.1, 1.12, 0.35]), 1.2);
  }
  // mirrors
  for (const s of [1, -1]) {
    R([s * 1.1, 2.0, 1.0], [s * 1.38, 2.12, 1.12], 0.018, STEEL, { sides: 5 });
    R([s * 1.1, 1.8, 1.0], [s * 1.38, 2.0, 1.12], 0.018, STEEL, { sides: 5 });
    P(bx(0.07, 0.32, 0.22), DARK, [s * 1.42, 2.08, 1.14]);
    P(bx(0.01, 0.26, 0.17), "#3b6a78", [s * 1.455, 2.08, 1.14]);
    glow(P(bx(0.02, 0.02, 0.2), CY, [s * 1.44, 1.91, 1.14]), 1.2);
  }

  // ---------------- front end
  P(bx(2.0, 0.55, 0.06), DARK, [0, 1.1, 2.92]); // fascia
  P(bx(0.7, 0.34, 0.05), BLACK, [0, 1.3, 2.93]);
  for (let i = 0; i < 6; i++) R([-0.32, 1.17 + i * 0.056, 2.96], [0.32, 1.17 + i * 0.056, 2.96], 0.012, STEEL, { sides: 4 });
  for (const s of [1, -1]) {
    glow(P(bx(0.5, 0.1, 0.04), "#e7fdff", [s * 0.7, 1.32, 2.95]), 1.8);
    glow(P(bx(0.44, 0.02, 0.03), CY, [s * 0.7, 1.22, 2.96]), 1.6);
    P(bx(0.56, 0.04, 0.1), HULL, [s * 0.7, 1.4, 2.93]); // brow
    P(bx(0.2, 0.2, 0.05), DARK, [s * 0.95, 1.0, 2.93]);
    glow(P(bx(0.14, 0.06, 0.03), RED, [s * 0.95, 1.0, 2.96]), 1.4);
  }
  // ram plow
  b.extrude(
    [[2.9, 0.45], [3.3, 0.5], [3.3, 1.15], [3.1, 1.22], [2.9, 1.05]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.03, color: YELP, bone: chassis },
  );
  D(chev, 2.0, 0.45, [0, 0.82, 3.31], [0, 0, 1]);
  glow(P(bx(1.6, 0.04, 0.03), MG, [0, 1.12, 3.31]), 1.5);
  for (const s of [1, -1]) {
    P(cy(0.05, 0.14, 6), STEEL, [s * 0.9, 0.5, 3.35], { rotation: [90, 0, 0] }); // tow hook stub
    R([s * 0.8, 1.15, 3.1], [s * 0.8, 1.55, 2.85], 0.05, STEEL, { sides: 6 });
    R([s * 0.8, 1.2, 3.2], [s * 0.45, 0.42, 3.0], 0.03, STEEL);
  }
  R([-0.8, 1.55, 2.85], [0.8, 1.55, 2.85], 0.045, STEEL);
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.55, 3.3], [0, 0, 1], 0.14, 0.035, STEEL, { bone: chassis, sides: 5 });

  // ---------------- fenders and wheels
  const wheelDefs: [string, number, number, boolean][] = [
    ["FL", 1, 1.9, true], ["FR", -1, 1.9, true], ["RL", 1, -1.7, false], ["RR", -1, -1.7, false],
  ];
  for (const [k, s, z, front] of wheelDefs) {
    P(bx(0.5, 0.08, 1.4), HULL, [s * 1.12, 1.17, z]);
    P(bx(0.5, 0.02, 1.44), YELP, [s * 1.12, 1.215, z]);
    P(bx(0.06, 0.2, 1.4), HULL, [s * 1.35, 1.08, z]);
    const hub: V = [s * 1.1, 0.53, z];
    const steer = front
      ? b.joint(`steer${k}`, { parent: chassis, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" })
      : chassis;
    const spin = b.joint(`wheel${k}`, { parent: steer, at: hub, dir: [0, 1, 0], role: "hinge" });
    const W = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: spin, at, ...o });
    W(cy(0.46, 0.34, 16), TYREP, hub, { rotation: [0, 0, 90], flat: true });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      W(bx(i % 2 ? 0.3 : 0.34, 0.08, 0.15), TYREP, [hub[0], hub[1] + 0.5 * Math.cos(a), hub[2] + 0.5 * Math.sin(a)], {
        rotation: [(a * 180) / Math.PI, 0, 0], flat: true,
      });
    }
    W(cy(0.3, 0.36, 12), STEEL, hub, { rotation: [0, 0, 90], flat: true });
    W(cy(0.22, 0.04, 12), DARK, [s * 1.29, 0.53, z], { rotation: [0, 0, 90], flat: true });
    glow(W(new THREE.TorusGeometry(0.27, 0.022, 5, 16), MG, [s * 1.285, 0.53, z], { rotation: [0, 90, 0] }), 1.6);
    W(cy(0.09, 0.08, 8), STEEL, [s * 1.31, 0.53, z], { rotation: [0, 0, 90] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      W(cy(0.02, 0.04, 6), "#b9bfcc", [s * 1.31, 0.53 + 0.15 * Math.cos(a), z + 0.15 * Math.sin(a)], { rotation: [0, 0, 90] });
    }
    // brake caliper
    W(bx(0.1, 0.12, 0.2), YEL, [s * 1.22, 0.53 + 0.2, z - 0.05]);
    if (!front) P(bx(0.05, 0.4, 0.46), DARK, [s * 1.1, 0.88, z - 0.7]); // mud flap
  }

  // ---------------- side details on rear compartment
  for (const s of [1, -1]) {
    D(LOGO, 1.3, 0.65, [s * 1.056, 1.95, -1.75], [s, 0, 0]);
    D(WATER, 0.6, 0.36, [s * 1.056, 1.95, -0.75], [s, 0, 0]);
    P(bx(0.04, 0.12, 2.4), YELP, [s * 1.07, 1.55, -1.575]);
    for (let i = 0; i < 5; i++) P(bx(0.04, 0.8, 0.06), DARK, [s * 1.07, 1.9, -2.6 + i * 0.5]);
    glow(P(bx(0.03, 0.8, 0.04), s > 0 ? CY : MG, [s * 1.07, 1.9, -2.77]), 1.5);
    glow(P(bx(0.03, 0.8, 0.04), s > 0 ? MG : CY, [s * 1.07, 1.9, -0.4]), 1.5);
    P(bx(0.08, 0.04, 2.4), STEEL, [s * 1.08, 0.78, -1.1]); // side step
  }

  // ---------------- rear
  for (const s of [1, -1]) {
    P(bx(1.02, 1.3, 0.05), HULL, [s * 0.52, 1.6, -2.82]);
    P(bx(0.04, 0.7, 0.05), STEEL, [s * 0.06, 1.7, -2.86]); // handle bar
    for (const y of [1.0, 1.55, 2.1]) P(cy(0.03, 0.1, 6), STEEL, [s * 1.0, y, -2.82]);
    glow(P(bx(0.12, 0.55, 0.03), RED, [s * 1.0, 2.0, -2.85]), 1.8);
    glow(P(bx(0.12, 0.08, 0.03), "#ff9a20", [s * 1.0, 1.55, -2.85]), 1.4);
    // exhaust stacks
    R([s * 0.9, 0.85, -2.92], [s * 0.9, 2.45, -2.92], 0.07, STEEL, { sides: 8 });
    for (let i = 0; i < 4; i++) P(new THREE.TorusGeometry(0.075, 0.015, 5, 8), DARK, [s * 0.9, 1.1 + i * 0.35, -2.92], { rotation: [90, 0, 0] });
    P(cy(0.09, 0.05, 8), DARK, [s * 0.9, 2.47, -2.92]);
  }
  P(bx(0.04, 1.3, 0.05), BLACK, [0, 1.6, -2.82]); // center seam
  P(bx(2.2, 0.3, 0.25), DARK, [0, 0.85, -2.92]);
  D(chev, 2.0, 0.26, [0, 0.85, -3.05], [0, 0, -1]);
  D(PLATE, 0.5, 0.14, [0, 1.25, -2.86], [0, 0, -1]);
  glow(P(bx(1.0, 0.03, 0.03), MG, [0, 1.0, -2.86]), 1.4);

  // ---------------- roof: light bars, speakers, sensors
  P(bx(1.7, 0.1, 0.16), DARK, [0, 2.52, 0.9]);
  glow(D(STRIP, 1.6, 0.08, [0, 2.53, 0.985], [0, 0, 1]), 1.8);
  for (let i = 0; i < 8; i++) glow(P(bx(0.17, 0.03, 0.12), i % 2 ? MG : CY, [-0.7 + i * 0.2, 2.595, 0.9]), 1.6);
  for (const s of [1, -1]) {
    P(cy(0.1, 0.16, 8), DARK, [s * 1.0, 2.55, 0.9]);
    glow(P(new THREE.SphereGeometry(0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), s > 0 ? RED : CY, [s * 1.0, 2.63, 0.9], { flat: true }), 1.8);
    // LRAD horn
    P(bx(0.2, 0.1, 0.2), STEEL, [s * 0.75, 2.52, 0.2]);
    P(new THREE.CylinderGeometry(0.2, 0.08, 0.4, 10), DARK, [s * 0.75, 2.65, 0.28], { rotation: [90, 0, 0], flat: true });
    P(new THREE.TorusGeometry(0.2, 0.02, 5, 10), YEL, [s * 0.75, 2.65, 0.48]);
    // side strips
    glow(P(bx(0.03, 0.04, 1.7), s > 0 ? MG : CY, [s * 1.1, 2.43, 0.05]), 1.5);
  }
  // camera dome and antennas
  P(cy(0.17, 0.05, 10), STEEL, [0.0, 2.5, -0.15]);
  P(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#222a30", [0, 2.52, -0.15], { flat: true });
  P(cy(0.03, 0.06, 6), CY, [0, 2.62, -0.0], { rotation: [70, 0, 0] });
  b.spike([-0.95, 2.47, -0.25], [0, 1, -0.1], 1.1, 0.014, STEEL, { bone: chassis, sides: 5 });
  P(new THREE.SphereGeometry(0.03, 6, 4), RED, [-0.95, 3.56, -0.36], { flat: true });
  b.spike([0.95, 2.47, -0.25], [0, 1, 0.05], 0.6, 0.012, STEEL, { bone: chassis, sides: 5 });

  // ---------------- rear roof: tanks, hatch, cable
  for (const s of [1, -1]) {
    P(cy(0.28, 1.1, 12), TANKP, [s * 0.65, 2.58, -2.15], { rotation: [90, 0, 0], flat: true });
    for (const z of [-2.6, -1.7]) P(new THREE.TorusGeometry(0.29, 0.02, 5, 12), STEEL, [s * 0.65, 2.58, z]);
    P(new THREE.SphereGeometry(0.28, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), TANKP, [s * 0.65, 2.58, -1.6], { rotation: [90, 0, 0], flat: true });
    P(cy(0.07, 0.1, 8), DARK, [s * 0.65, 2.88, -2.3]); // filler cap
    P(bx(0.2, 0.08, 1.0), DARK, [s * 0.65, 2.34, -2.15]); // cradle
  }
  P(bx(0.5, 0.05, 0.5), STEEL, [0, 2.33, -2.3]); // hatch
  P(bx(0.3, 0.02, 0.3), DARK, [0, 2.36, -2.3]);

  // ---------------- water cannon turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.3, -1.1], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 2.85, -1.1], dir: [0, 0, 1], role: "hinge" });
  const Y = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: yaw, at, ...o });
  const Pt = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: pitch, at, ...o });
  P(new THREE.TorusGeometry(0.42, 0.04, 6, 16), STEEL, [0, 2.34, -1.1], { rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(cy(0.02, 0.03, 6), DARK, [0.42 * Math.cos(a), 2.37, -1.1 + 0.42 * Math.sin(a)]);
  }
  Y(cy(0.36, 0.25, 12), HULL, [0, 2.45, -1.1], { flat: true });
  Y(cy(0.38, 0.04, 12), YELP, [0, 2.57, -1.1], { flat: true });
  for (const s of [1, -1]) {
    Y(bx(0.07, 0.55, 0.5), HULL, [s * 0.3, 2.82, -1.1]);
    Y(cy(0.09, 0.1, 8), STEEL, [s * 0.36, 2.85, -1.1], { rotation: [0, 0, 90] });
    Y(bx(0.2, 0.26, 0.3), DARK, [s * 0.46, 2.65, -1.2]); // valve box
    glow(Y(bx(0.02, 0.05, 0.2), CY, [s * 0.56, 2.7, -1.2]), 1.4);
  }
  Pt(bx(0.46, 0.4, 0.55), HULL, [0, 2.85, -1.3]); // breech
  Pt(bx(0.48, 0.06, 0.3), YELP, [0, 3.07, -1.3]);
  b.rod([0, 2.85, -1.1], [0, 2.85, 0.0], 0.11, STEEL, { bone: pitch, sides: 10 });
  for (const z of [-0.85, -0.5, -0.15]) Pt(new THREE.TorusGeometry(0.12, 0.03, 5, 10), YELP, [0, 2.85, z]);
  Pt(new THREE.CylinderGeometry(0.19, 0.11, 0.36, 10), DARK, [0, 2.85, 0.18], { rotation: [90, 0, 0], flat: true });
  glow(Pt(new THREE.TorusGeometry(0.16, 0.03, 5, 12), CY, [0, 2.85, 0.37]), 2);
  glow(Pt(cy(0.14, 0.02, 12), "#aef8ff", [0, 2.85, 0.35], { rotation: [90, 0, 0] }), 2);
  // gauge and scope
  Pt(cy(0.1, 0.05, 12), STEEL, [0.24, 2.9, -1.3], { rotation: [0, 0, 90] });
  b.part(new THREE.CircleGeometry(0.085, 16), "#ffffff", { bone: pitch, at: [0.27, 2.9, -1.3], dir: [1, 0, 0], axis: "z", texture: GAUGE });
  Pt(cy(0.05, 0.4, 8), DARK, [0, 3.12, -0.9], { rotation: [90, 0, 0] });
  glow(Pt(cy(0.04, 0.02, 8), MG, [0, 3.12, -0.69], { rotation: [90, 0, 0] }), 2);
  R([0, 3.08, -1.1], [0, 3.02, -0.85], 0.02, STEEL, { bone: pitch });
  // hoses
  b.sweep(catmull([[0.5, 2.55, -1.65], [0.42, 2.7, -1.5], [0.38, 2.75, -1.3], [0.2, 2.62, -1.25]]), 0.04, { color: DARK, bone: chassis, sides: 6 });
  b.sweep(catmull([[-0.5, 2.55, -1.65], [-0.42, 2.45, -1.5], [-0.3, 2.4, -1.25]]), 0.035, { color: STEEL, bone: chassis, sides: 6 });
  for (let i = 0; i < 4; i++) P(new THREE.TorusGeometry(0.045, 0.012, 4, 8), YELP, [0.48 - i * 0.07, 2.62 + 0.04 * i, -1.58 + i * 0.1], { rotation: [0, 90, 0] });

  // vertical neon accent frames on cab back
  for (const s of [1, -1]) glow(P(bx(0.04, 0.5, 0.04), s > 0 ? MG : CY, [s * 0.95, 2.05, -0.37]), 1.6);

  // grime specks on hull sides (scuff plates)
  for (let i = 0; i < 10; i++) {
    const s = i % 2 ? 1 : -1;
    P(bx(0.02, 0.1 + r() * 0.1, 0.12 + r() * 0.16), "#2a2b34", [s * 1.062, 1.15 + r() * 0.2, -2.4 + r() * 3.4]);
  }

  return b.root;
}
