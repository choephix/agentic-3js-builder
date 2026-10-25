```ts
import * as THREE from "three";
import { createBuilder, paint, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { catmull } from "agentic-3js-builder";

export const meta = {
  name: "Meridian RSU-9 Riot Interceptor",
  description:
    "Corporate riot-suppression armoured van, Cyberpunk 2077 style: slab hull with yellow hazard stripe, roof-mounted water cannon with tanks, neon light bars, LED dispersal sign, ram bumper and neon wheel rims.",
};

const INK = "#0b0d14";
const GRAPH = "#1b202c";
const STEEL = "#3a4152";
const LIGHT_STEEL = "#7b8499";
const YEL = "#f6d31c";
const CYAN = "#19f0ff";
const MAG = "#ff2fa0";
const WHITE = "#e6eaf0";
const GLASS = "#10303f";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 10) => new THREE.CylinderGeometry(r, r, h, s);

// ------------------------------------------------------------ textures
function hazard(w: number, h: number, a: string, c: string) {
  let s = `<rect width="${w}" height="${h}" fill="${a}"/>`;
  for (let x = -h; x < w + h; x += 16)
    s += `<polygon points="${x},${h} ${x + 8},${h} ${x + 8 + h},0 ${x + h},0" fill="${c}"/>`;
  return svg(`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 256 });
}
const HAZARD = hazard(120, 24, YEL, INK);

const LOGO = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="198" height="78" rx="6" fill="#0c0f18" stroke="${YEL}" stroke-width="3"/>
  <polygon points="40,10 62,22 62,48 40,60 18,48 18,22" fill="none" stroke="${CYAN}" stroke-width="4"/>
  <polygon points="40,20 54,28 54,42 40,50 26,42 26,28" fill="${YEL}"/>
  <path d="M30 40 L40 24 L50 40 Z" fill="#0c0f18"/>
  <text x="76" y="36" font-family="sans-serif" font-weight="bold" font-size="22" fill="${WHITE}">MERIDIAN</text>
  <text x="76" y="54" font-family="sans-serif" font-weight="bold" font-size="11" fill="${YEL}">CIVIC DEFENSE // RSU-9</text>
  <rect x="76" y="62" width="110" height="4" fill="${MAG}"/>
  <path d="M10 70 h60" stroke="${CYAN}" stroke-width="2"/>
</svg>`,
  { size: 512 },
);

const LED = svg(
  `<svg viewBox="0 0 160 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="24" fill="#05060a"/>
  <text x="6" y="17" font-family="monospace" font-weight="bold" font-size="14" fill="#ffb02e">DISPERSE</text>
  <text x="76" y="17" font-family="monospace" font-weight="bold" font-size="14" fill="${MAG}">//</text>
  <text x="94" y="17" font-family="monospace" font-weight="bold" font-size="14" fill="${CYAN}">COMPLY</text>
  <rect x="0" y="0" width="160" height="2" fill="${MAG}"/><rect x="0" y="22" width="160" height="2" fill="${CYAN}"/>
</svg>`,
  { size: 512 },
);

const REAR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="6" fill="#0c0f18" stroke="${YEL}" stroke-width="4"/>
  <polygon points="50,10 84,30 84,70 50,90 16,70 16,30" fill="none" stroke="${CYAN}" stroke-width="5"/>
  <polygon points="50,24 72,37 72,63 50,76 28,63 28,37" fill="${YEL}"/>
  <path d="M36 62 L50 34 L64 62 Z" fill="#0c0f18"/>
  <text x="50" y="97" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="${WHITE}">STAND BACK 5M</text>
</svg>`,
  { size: 256 },
);

const TANK = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="50" fill="#d8dde6"/>
  <path d="M22 8 C 10 24 10 38 22 40 C 34 38 34 24 22 8 Z" fill="${CYAN}" stroke="#0c0f18" stroke-width="2"/>
  <text x="46" y="26" font-family="sans-serif" font-weight="bold" font-size="16" fill="#0c0f18">AQUA-JET</text>
  <text x="46" y="40" font-family="sans-serif" font-weight="bold" font-size="9" fill="${MAG}">CROWD CONTROL 400L</text>
  <rect x="0" y="0" width="120" height="4" fill="${YEL}"/><rect x="0" y="46" width="120" height="4" fill="${YEL}"/>
</svg>`,
  { size: 384 },
);

const PLATE = svg(
  `<svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="20" rx="2" fill="${YEL}" stroke="#0c0f18" stroke-width="1.5"/>
  <text x="30" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#0c0f18">MCD-2077</text>
</svg>`,
  { size: 192 },
);

// ------------------------------------------------------------ paints
const BASE = panelled(
  paint((_p, n) => (n.y > 0.5 ? "#2c3446" : n.y < -0.3 ? "#0f121a" : "#1c212d")),
  { size: 0.55, aspect: 0.6, rivets: 0.14, seam: "#06070b" },
);
const HULL = paint((p, n) => (Math.abs(n.x) > 0.5 && p.y > 0.8 && p.y < 0.92 ? YEL : BASE));
const PLATING = panelled("#262c3b", { size: 0.3, aspect: 0.8, rivets: 0.1, seam: "#06070b" });
const TANKCOL = paint((_p, n) => (n.y > 0.4 ? "#eef1f6" : "#c3c9d4"));

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const chassis = b.joint("chassis", { at: [0, 0.7, 0], role: "spine" });

  const P = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: chassis, at: at as [number, number, number], ...o });
  const G = (g: THREE.BufferGeometry, col: string, at: number[], o: any = {}, k = 1.4) =>
    glow(P(g, col, at, { flat: true, ...o }), k);
  const neon = (a: number[], c: number[], r: number, col: string, bone: any = chassis) =>
    glow(b.rod(a as any, c as any, r, col, { bone, sides: 6 }), 1.6);
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], bone: any = chassis, g = false) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone,
      at: at as [number, number, number],
      dir: dir as [number, number, number],
      axis: "z",
      texture: tex,
    });
    return g ? glow(part, 1.3) : part;
  };

  // ---------------------------------------------------------- hull
  const profile: [number, number][] = [
    [-2.7, 0.6], [2.5, 0.6], [2.85, 0.85], [2.85, 1.3], [2.1, 1.5],
    [1.1, 1.55], [0.6, 2.25], [-0.2, 2.4], [-2.7, 2.4], [-2.78, 1.5],
  ];
  b.extrude(profile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bevel: 0.04, bone: chassis, color: HULL });

  // underbody, axles, skid plate
  P(box(1.5, 0.12, 4.6), INK, [0, 0.56, 0]);
  for (const z of [-1.7, 1.7]) b.rod([-1.08, 0.45, z], [1.08, 0.45, z], 0.07, STEEL, { bone: chassis, sides: 8 });
  b.rod([0, 0.5, -1.7], [0, 0.5, 1.7], 0.05, STEEL, { bone: chassis, sides: 6 });

  // windscreen (raked)
  P(box(1.72, 0.04, 0.9), GLASS, [0, 1.9 + 0.012, 0.85 + 0.01], { rotation: [54.6, 0, 0] });
  for (const s of [1, -1]) {
    P(box(0.07, 0.05, 0.96), GRAPH, [s * 0.88, 1.9, 0.85], { rotation: [54.6, 0, 0] });
    // wipers
    b.rod([s * 0.1, 1.62, 1.07], [s * 0.7, 1.82, 0.95], 0.012, INK, { bone: chassis, sides: 4 });
  }
  P(box(1.8, 0.05, 0.05), GRAPH, [0, 1.58, 1.1]);
  P(box(1.8, 0.05, 0.05), GRAPH, [0, 2.26, 0.58]);

  // sides
  for (const s of [1, -1]) {
    const X = s * 0.955;
    // cab side window with security bars
    P(box(0.04, 0.36, 0.55), GLASS, [X, 1.82, 0.45]);
    for (const dz of [0.25, 0.45, 0.65]) P(box(0.05, 0.38, 0.02), INK, [s * 0.965, 1.82, dz]);
    // door seams
    for (const z of [0.9, -0.05]) P(box(0.02, 0.95, 0.02), INK, [s * 0.96, 1.15, z]);
    P(box(0.02, 0.02, 0.95), INK, [s * 0.96, 0.7, 0.42]);
    P(box(0.03, 0.04, 0.2), YEL, [s * 0.97, 1.45, 0.0]);
    // flank logo
    decal(LOGO, 1.6, 0.64, [s * 0.962, 1.8, -1.2], [s, 0, 0]);
    // armour ribs on cargo flank
    for (const z of [-2.4, -1.9, -0.55, -0.1]) P(box(0.04, 0.55, 0.1), PLATING, [s * 0.96, 1.2, z]);
    // beltline neon and roofline neon
    neon([s * 0.965, 1.45, -2.5], [s * 0.965, 1.45, -0.3], 0.014, MAG);
    neon([s * 0.965, 2.33, -2.6], [s * 0.965, 2.33, -0.3], 0.014, CYAN);
    // side skirt and underglow
    P(box(0.07, 0.3, 2.3), PLATING, [s * 0.985, 0.73, 0]);
    G(box(0.05, 0.04, 2.1), CYAN, [s * 1.0, 0.54, 0], {}, 2);
    // roof rail
    b.rod([s * 0.85, 2.46, -2.6], [s * 0.85, 2.46, -0.4], 0.025, STEEL, { bone: chassis, sides: 6 });
    // mirrors
    b.rod([s * 0.95, 1.7, 1.0], [s * 1.2, 1.78, 1.2], 0.015, STEEL, { bone: chassis, sides: 5 });
    P(box(0.07, 0.3, 0.2), GRAPH, [s * 1.25, 1.8, 1.2]);
    P(box(0.01, 0.24, 0.14), GLASS, [s * 1.215, 1.8, 1.2]);
    G(box(0.02, 0.03, 0.12), MAG, [s * 1.26, 1.97, 1.2], {}, 1.6);
    // A-pillar spot lamps
    P(cyl(0.05, 0.08, 8), INK, [s * 0.9, 1.62, 1.08], { rotation: [90, 0, 0] });
    G(cyl(0.035, 0.02, 8), CYAN, [s * 0.9, 1.62, 1.13], { rotation: [90, 0, 0] }, 2);
    // flank vents
    for (let i = 0; i < 4; i++) P(box(0.03, 0.03, 0.4), INK, [s * 0.96, 0.98 + i * 0.05, -0.8]);
  }

  // ---------------------------------------------------------- wheels
  const hubs: [string, number, number][] = [
    ["FL", 1, 1.7], ["FR", -1, 1.7], ["RL", 1, -1.7], ["RR", -1, -1.7],
  ];
  for (const [k, s, z] of hubs) {
    const hub: [number, number, number] = [s * 1.08, 0.45, z];
    const front = z > 0;
    const steer = front
      ? b.joint(`steer${k}`, { parent: chassis, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" })
      : chassis;
    const w = b.joint(`wheel${k}`, { parent: steer, at: hub, dir: [0, 1, 0], role: "hinge" });
    const W = (g: THREE.BufferGeometry, col: any, d: number[], o: any = {}) =>
      b.part(g, col, { bone: w, at: [hub[0] + d[0], hub[1] + d[1], hub[2] + d[2]], ...o });
    W(cyl(0.45, 0.4, 14), "#14161c", [0, 0, 0], { rotation: [0, 0, 90], flat: true });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      W(box(0.38, 0.06, 0.13), "#0a0b0f", [0, 0.45 * Math.cos(a), 0.45 * Math.sin(a)], {
        rotation: [(a * 180) / Math.PI, 0, 0],
        flat: true,
      });
    }
    W(cyl(0.3, 0.42, 12), STEEL, [0, 0, 0], { rotation: [0, 0, 90], flat: true });
    W(cyl(0.27, 0.05, 12), GRAPH, [s * 0.2, 0, 0], { rotation: [0, 0, 90], flat: true });
    glow(W(new THREE.TorusGeometry(0.22, 0.02, 5, 14), MAG, [s * 0.225, 0, 0], { rotation: [0, 90, 0] }), 2);
    W(cyl(0.08, 0.07, 8), YEL, [s * 0.23, 0, 0], { rotation: [0, 0, 90] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      W(box(0.03, 0.14, 0.05), LIGHT_STEEL, [s * 0.215, 0.15 * Math.cos(a), 0.15 * Math.sin(a)], {
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // arch over wheel + mud flap
    P(new THREE.TorusGeometry(0.54, 0.06, 5, 12, Math.PI), PLATING, [hub[0], 0.45, z], {
      rotation: [0, 90, 0],
      scale: [1, 1, 3.4],
      flat: true,
    });
    P(box(0.4, 0.3, 0.04), INK, [hub[0], 0.3, z - 0.55]);
  }

  // ---------------------------------------------------------- front end
  P(box(2.05, 0.4, 0.22), PLATING, [0, 0.72, 2.9]);
  decal(HAZARD, 1.9, 0.28, [0, 0.72, 3.012], [0, 0, 1]);
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.5, 2.85], [s * 0.9, 1.5, 2.88], 0.04, STEEL, { bone: chassis, sides: 6 });
    b.rod([s * 0.9, 1.5, 2.88], [s * 0.3, 1.5, 2.95], 0.03, STEEL, { bone: chassis, sides: 6 });
    // headlights
    G(box(0.55, 0.1, 0.03), "#fff6c8", [s * 0.62, 1.12, 2.865], {}, 2);
    P(box(0.62, 0.04, 0.05), INK, [s * 0.62, 1.2, 2.87]);
    P(box(0.62, 0.04, 0.05), INK, [s * 0.62, 1.04, 2.87]);
    G(box(0.06, 0.06, 0.03), MAG, [s * 0.95, 1.0, 2.85], {}, 1.8);
  }
  P(box(0.9, 0.34, 0.06), INK, [0, 1.1, 2.86]);
  for (let i = 0; i < 7; i++) G(box(0.04, 0.3, 0.02), i % 2 ? CYAN : MAG, [-0.36 + i * 0.12, 1.1, 2.9], {}, 1.2);
  G(box(1.9, 0.03, 0.02), CYAN, [0, 0.93, 2.87], {}, 2);
  decal(PLATE, 0.5, 0.17, [0, 0.62, 3.015], [0, 0, 1]);
  // hood details
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) P(box(0.5, 0.015, 0.04), INK, [s * 0.45, 1.5 - i * 0.012, 1.85 + i * 0.12]);
    P(box(0.04, 0.04, 0.5), YEL, [s * 0.85, 1.43, 1.9]);
  }

  // ---------------------------------------------------------- roof: light bar, LED sign, sensors
  P(box(1.75, 0.1, 0.22), INK, [0, 2.46, 0.05]);
  for (let i = 0; i < 6; i++) {
    G(box(0.26, 0.07, 0.03), i < 3 ? MAG : CYAN, [-0.7 + i * 0.28, 2.46, 0.17], {}, 2.2);
  }
  for (const s of [1, -1]) b.rod([s * 0.75, 2.5, 0.0], [s * 0.75, 2.74, 0.0], 0.02, STEEL, { bone: chassis, sides: 5 });
  P(box(1.6, 0.3, 0.06), INK, [0, 2.76, 0.0]);
  decal(LED, 1.5, 0.22, [0, 2.76, 0.035], [0, 0, 1], chassis, true);
  for (const s of [1, -1]) {
    b.lathe(
      [[0, 0], [0.12, 0], [0.1, 0.07], [0.05, 0.14], [0, 0.16]],
      { at: [s * 0.82, 2.4, -0.1], axis: [0, 1, 0], segments: 8, bone: chassis, color: s > 0 ? MAG : CYAN },
    );
    // dome sensor
    P(new THREE.SphereGeometry(0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, [s * 0.5, 2.4, -0.6], { flat: true });
  }
  glow(P(new THREE.SphereGeometry(0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), MAG, [-0.82, 2.4, -0.1], { flat: true }), 0);
  // antenna
  b.spike([-0.8, 2.4, -2.5], [0, 1, 0], 1.0, 0.018, STEEL, { bone: chassis, sides: 5 });
  P(new THREE.SphereGeometry(0.03, 6, 4), MAG, [-0.8, 3.42, -2.5]);
  // roof greeble
  const r = rng(5);
  for (let i = 0; i < 6; i++)
    P(box(0.12 + r() * 0.1, 0.05, 0.1 + r() * 0.1), i % 2 ? STEEL : GRAPH, [(r() - 0.5) * 0.9 + 0.0, 2.43, -1.4 + (r() - 0.5) * 0.3 - 1.0]);

  // ---------------------------------------------------------- water tanks
  for (const s of [1, -1]) {
    const tx = s * 0.55;
    P(cyl(0.32, 1.4, 12), TANKCOL, [tx, 2.74, -2.0], { rotation: [90, 0, 0], flat: true });
    for (const dz of [-0.6, 0.6]) {
      P(new THREE.TorusGeometry(0.33, 0.025, 5, 14), STEEL, [tx, 2.74, -2.0 + dz]);
    }
    P(new THREE.SphereGeometry(0.32, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#c3c9d4", [tx, 2.74, -1.3], { rotation: [90, 0, 0], flat: true });
    P(new THREE.SphereGeometry(0.32, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#c3c9d4", [tx, 2.74, -2.7], { rotation: [-90, 0, 0], flat: true });
    decal(TANK, 1.0, 0.42, [s * 0.553 + s * 0.0 + (s > 0 ? 0.0 : 0.0) + s * 0.328, 2.74, -2.0], [s, 0, 0]);
    // sight glass
    G(box(0.06, 0.5, 0.03), CYAN, [tx, 2.72, -2.74], {}, 1.6);
    P(cyl(0.06, 0.06, 6), YEL, [tx, 3.06, -2.0]);
    // saddle
    P(box(0.5, 0.1, 1.3), GRAPH, [tx, 2.45, -2.0]);
  }
  b.rod([-0.55, 2.74, -1.28], [0.55, 2.74, -1.28], 0.03, STEEL, { bone: chassis, sides: 6 });

  // ---------------------------------------------------------- water cannon turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.42, -0.8], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.05, -0.8], dir: [0, 0, 1], role: "hinge" });
  const Y = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: yaw, at: at as [number, number, number], ...o });
  const T = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: pitch, at: at as [number, number, number], ...o });
  P(new THREE.TorusGeometry(0.42, 0.035, 6, 16), STEEL, [0, 2.44, -0.8], { rotation: [90, 0, 0] });
  Y(cyl(0.38, 0.22, 12), PLATING, [0, 2.55, -0.8], { flat: true });
  Y(cyl(0.2, 0.3, 8), GRAPH, [0, 2.8, -0.8], { flat: true });
  for (const s of [1, -1]) {
    Y(box(0.07, 0.5, 0.5), PLATING, [s * 0.22, 2.9, -0.8]);
    G(box(0.02, 0.2, 0.02), CYAN, [s * 0.26, 2.9, -0.62], {}, 1.5);
  }
  T(cyl(0.12, 0.5, 8), STEEL, [0, 3.05, -0.8], { rotation: [0, 0, 90] });
  b.rod([0, 3.05, -1.15], [0, 3.05, 0.55], 0.1, GRAPH, { bone: pitch, sides: 10 });
  T(cyl(0.14, 0.4, 10), YEL, [0, 3.05, -0.1], { rotation: [90, 0, 0], flat: true });
  T(cyl(0.15, 0.06, 10), INK, [0, 3.05, -0.28], { rotation: [90, 0, 0] });
  T(cyl(0.15, 0.06, 10), INK, [0, 3.05, 0.08], { rotation: [90, 0, 0] });
  T(new THREE.CylinderGeometry(0.19, 0.1, 0.42, 10), STEEL, [0, 3.05, 0.78], { rotation: [90, 0, 0], flat: true });
  glow(T(new THREE.TorusGeometry(0.19, 0.022, 5, 12), CYAN, [0, 3.05, 0.99]), 2.2);
  glow(T(new THREE.CircleGeometry(0.15, 10), CYAN, [0, 3.05, 0.995], { dir: [0, 0, 1], axis: "z" }), 1.4);
  glow(T(box(0.04, 0.025, 0.9), CYAN, [0, 3.17, -0.35]), 1.6);
  // pump handwheel and sight
  T(new THREE.TorusGeometry(0.1, 0.015, 5, 10), MAG, [0.14, 3.2, -0.9], { rotation: [0, 90, 0] });
  T(box(0.1, 0.1, 0.2), INK, [-0.14, 3.2, -0.75]);
  glow(T(box(0.06, 0.06, 0.02), CYAN, [-0.14, 3.2, -0.64], { flat: true }), 2);
  // hose from tank to turret
  const hose = catmull([[0.55, 2.74, -1.3], [0.5, 2.98, -1.15], [0.2, 2.92, -0.9], [0.1, 3.0, -0.9]]);
  b.sweep(hose, 0.045, INK, { bone: chassis, sides: 6 });
  b.along(hose, 8, (at: any) => b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), STEEL, { frame: at, bone: chassis }));

  // ---------------------------------------------------------- rear doors
  for (const s of [1, -1]) {
    const door = b.joint(`rearDoor${s > 0 ? "L" : "R"}`, {
      parent: chassis, at: [s * 0.95, 1.5, -2.8], dir: [0, 1, 0], role: "hinge",
    });
    const D = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
      b.part(g, col, { bone: door, at: at as [number, number, number], ...o });
    D(box(0.92, 1.65, 0.06), PLATING, [s * 0.47, 1.5, -2.8]);
    D(box(0.5, 0.18, 0.04), GLASS, [s * 0.47, 2.0, -2.835]);
    for (const dx of [-0.15, 0, 0.15]) D(box(0.02, 0.2, 0.05), INK, [s * 0.47 + dx, 2.0, -2.84]);
    D(box(0.04, 0.2, 0.06), YEL, [s * 0.1, 1.5, -2.84]);
    G(box(0.07, 0.8, 0.03), MAG, [s * 0.86, 1.35, -2.84], {}, 2);
    D(box(0.92, 0.04, 0.06), YEL, [s * 0.47, 0.82, -2.84]);
    if (s > 0) decal(REAR, 0.72, 0.72, [s * 0.47, 1.45, -2.835], [0, 0, -1], door);
    else {
      decal(HAZARD, 0.8, 0.2, [s * 0.47, 1.6, -2.835], [0, 0, -1], door);
      decal(PLATE, 0.4, 0.13, [s * 0.47, 1.1, -2.835], [0, 0, -1], door);
    }
  }
  P(box(1.9, 0.14, 0.3), PLATING, [0, 0.66, -2.86]);
  G(box(1.7, 0.03, 0.02), CYAN, [0, 0.74, -3.01], {}, 1.8);
  P(box(0.08, 0.1, 0.08), STEEL, [0.0, 0.5, -3.0]);

  return b.root;
}
```