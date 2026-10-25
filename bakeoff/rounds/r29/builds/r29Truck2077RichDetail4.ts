import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nightwarden 6x6",
  description: "Low-poly cyberpunk 2077 militarized six-wheel truck with railgun turret, missile pods, neon underglow and armour plating.",
};

const NEON = "#19f0ff", PINK = "#ff2d95", AMBER = "#ffb020", DARK = "#16181f", STEEL = "#4a505c", RUBBER = "#1b1c20";
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8, r2?: number) => new THREE.CylinderGeometry(r, r2 ?? r, h, s);
const TAU = Math.PI * 2;

const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffc400"/>${[0, 1, 2, 3, 4, 5, 6, 7]
  .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#111"/>`).join("")}</svg>`, { size: 128 });
const SIGN = svg(`<svg viewBox="0 0 96 40"><rect width="96" height="40" rx="4" fill="#0a0d18" stroke="#ff2d95" stroke-width="3"/><text x="48" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#19f0ff">2077</text></svg>`, { size: 192 });
const EMBLEM = svg(`<svg viewBox="0 0 64 64"><polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="#0d1018" stroke="#19f0ff" stroke-width="3"/><path d="M32 14 L46 40 L32 34 L18 40Z" fill="#ff2d95"/><circle cx="32" cy="32" r="5" fill="#19f0ff"/><path d="M12 50h40" stroke="#19f0ff" stroke-width="2"/></svg>`, { size: 128 });
const HUD = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#06151a"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${4 + i * 10}" y="${26 - (i * 7) % 20 - 4}" width="6" height="${(i * 7) % 20 + 4}" fill="#19f0ff"/>`).join("")}<path d="M2 6h60" stroke="#ff2d95" stroke-width="1.5"/></svg>`, { size: 128 });
const RUNES = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="none"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${4 + i * 8} 2 v12 M${4 + i * 8} ${3 + (i % 3) * 3} h4" stroke="#ff2d95" stroke-width="2" fill="none"/>`).join("")}</svg>`, { size: 128 });

// paints
const seams = (a: string, b2: string, size: number) =>
  paint((p, n) => {
    const ax = Math.abs(n.x) > 0.6;
    const u = ax ? p.z : p.x, v = ax ? p.y : Math.abs(n.y) > 0.6 ? p.z : p.y;
    const fu = ((u / size) % 1 + 1) % 1, fv = ((v / (size * 0.7)) % 1 + 1) % 1;
    const wear = noise(p, 0.3, 4);
    let c = mix(a, b2, smoothstep(0.3, 0.8, wear) * 0.7 + (n.y < 0 ? 0.3 : 0));
    if (fu * size < 0.012 || fv * size * 0.7 < 0.012) c = mix(c, "#07080b", 0.8);
    else if (fu * size < 0.024 || fv * size * 0.7 < 0.024) c = mix(c, "#9aa4b8", 0.18);
    return mix(c, "#e8f4ff", n.y > 0.8 ? 0.08 : 0);
  });
const HULL = seams("#3b4658", "#232a36", 0.5);
const PLATE = seams("#2d3441", "#1a1e27", 0.35);
const CAMO = paint((p, n) => mix(mix("#2a3140", "#3e4a5c", noise(p, 0.5, 2)), "#14171e", smoothstep(0.55, 0.8, noise(p, 0.15, 9)) * 0.7 + (n.y < -0.3 ? 0.3 : 0)));

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const R = rng(77);
  const ch = b.joint("chassis", { at: [0, 0.7, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: ch, at, ...o });
  const G = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}, k = 1.4) => glow(P(g, c, at, o), k);

  // ---------- chassis
  for (const s of [1, -1]) {
    P(box(0.14, 0.2, 6.6), DARK, [s * 0.55, 0.62, -0.1]);
    P(box(0.08, 0.1, 6.4), STEEL, [s * 0.55, 0.5, -0.1]);
    // underglow strips
    G(box(0.05, 0.04, 5.6), s > 0 ? NEON : PINK, [s * 1.0, 0.36, -0.1]);
    // side skirt armour with bolts
    P(box(0.08, 0.42, 3.6), PLATE, [s * 1.06, 0.72, -0.2]);
    for (let i = 0; i < 7; i++) P(cyl(0.025, 0.04, 6), STEEL, [s * 1.11, 0.88, -1.8 + i * 0.55], { rotation: [0, 0, 90] });
    P(box(0.03, 0.12, 3.0), HAZARD, [s * 1.11, 0.6, -0.2], { texture: HAZARD });
  }
  for (let i = 0; i < 8; i++) P(box(1.3, 0.1, 0.1), DARK, [0, 0.58, -3.1 + i * 0.9]);
  b.rod([0, 0.55, 2.2], [0, 0.55, -2.8], 0.05, STEEL, { bone: ch, sides: 6 });

  // ---------- wheels (6x6)
  const wheel = (name: string, x: number, z: number, steer: boolean) => {
    const s = x > 0 ? 1 : -1;
    const hubAt: [number, number, number] = [x, 0.5, z];
    const sj = steer ? b.joint("steer" + name, { parent: ch, at: hubAt, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : ch;
    const sp = b.joint("wheel" + name, { parent: sj, at: hubAt, dir: [0, 1, 0], role: "hinge" });
    const W = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: sp, at: [x + at[0], 0.5 + at[1], z + at[2]], ...o });
    W(cyl(0.44, 0.42, 14), RUBBER, [0, 0, 0], { rotation: [0, 0, 90], flat: true });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      W(box(0.44, 0.08, 0.14), "#101114", [0, 0.47 * Math.cos(a), 0.47 * Math.sin(a)], { rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    W(cyl(0.28, 0.44, 12), "#2a2f3a", [s * 0.02, 0, 0], { rotation: [0, 0, 90], flat: true });
    W(cyl(0.3, 0.05, 12), STEEL, [s * 0.22, 0, 0], { rotation: [0, 0, 90], flat: true });
    glow(W(new THREE.TorusGeometry(0.25, 0.018, 5, 16), s > 0 ? NEON : PINK, [s * 0.25, 0, 0], { rotation: [0, 90, 0] }), 1.6);
    W(cyl(0.1, 0.1, 8), DARK, [s * 0.26, 0, 0], { rotation: [0, 0, 90] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      W(cyl(0.02, 0.04, 6), "#c9d2e0", [s * 0.27, 0.17 * Math.cos(a), 0.17 * Math.sin(a)], { rotation: [0, 0, 90] });
    }
    // suspension
    b.rod([s * 0.55, 0.62, z], [x - s * 0.2, 0.5, z], 0.06, STEEL, { bone: ch, sides: 6 });
    b.rod([s * 0.62, 0.95, z + 0.2], [x - s * 0.25, 0.55, z + 0.05], 0.035, "#9aa4b8", { bone: ch, sides: 6 });
    // mud guard
    P(box(0.34, 0.06, 1.1), PLATE, [s * 1.0, 1.0, z]);
  };
  [["FL", 1.02, 2.3, true], ["FR", -1.02, 2.3, true], ["ML", 1.02, -0.2, false], ["MR", -1.02, -0.2, false], ["RL", 1.02, -2.4, false], ["RR", -1.02, -2.4, false]]
    .forEach(([n, x, z, st]: any) => wheel(n, x, z, st));

  // ---------- hull / cab
  P(box(2.0, 0.5, 6.0), HULL, [0, 0.98, -0.1]); // lower hull
  P(box(2.1, 0.06, 6.1), STEEL, [0, 0.72, -0.1]);
  b.frustumBox([0, 1.2, 0.9], [0, 1.2, 3.35], [1.9, 0.55], [1.6, 0.34], { bone: ch, color: HULL }); // sloped hood
  b.frustumBox([0, 1.58, 0.1], [0, 1.55, 1.85], [1.8, 0.7], [1.64, 0.48], { bone: ch, color: CAMO }); // cab body
  P(box(1.7, 0.1, 1.7), PLATE, [0, 1.98, 0.9]);
  // windscreen & HUD glass
  G(box(1.5, 0.3, 0.05), "#0c6f86", [0, 1.7, 1.78], { rotation: [-28, 0, 0] }, 0.8);
  P(box(1.56, 0.04, 0.07), DARK, [0, 1.86, 1.76], { rotation: [-28, 0, 0] });
  P(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", [0.4, 1.7, 1.815], { texture: HUD, dir: [0, 0.4, 1], axis: "z" });
  for (const s of [1, -1]) {
    G(box(0.04, 0.28, 0.9), "#0c6f86", [s * 0.9, 1.72, 0.9], {}, 0.8);
    P(box(0.06, 0.5, 0.06), DARK, [s * 0.91, 1.7, 1.38]);
    P(box(0.06, 0.5, 0.06), DARK, [s * 0.91, 1.7, 0.4]);
    P(new THREE.PlaneGeometry(0.4, 0.4), "#fff", [s * 0.93, 1.38, 0.9], { texture: EMBLEM, dir: [s, 0, 0], axis: "z" });
    // door seams & handle
    P(box(0.03, 0.5, 0.02), "#07080b", [s * 0.93, 1.4, 0.2]);
    P(box(0.04, 0.04, 0.16), "#c9d2e0", [s * 0.94, 1.5, 0.3]);
    // mirror drones
    b.rod([s * 0.95, 1.7, 1.5], [s * 1.2, 1.82, 1.55], 0.02, STEEL, { bone: ch, sides: 5 });
    P(box(0.12, 0.2, 0.08), DARK, [s * 1.24, 1.82, 1.55]);
    G(box(0.1, 0.16, 0.01), NEON, [s * 1.24, 1.82, 1.6], {}, 1);
    // fender missile-smoke tubes
    for (let i = 0; i < 4; i++) P(cyl(0.05, 0.3, 7), STEEL, [s * (1.05 + i * 0.001), 1.46 + i * 0.0, 2.3 + i * 0.12 - 0.2], { rotation: [70, 0, 0] });
    // headlights
    P(box(0.5, 0.16, 0.12), DARK, [s * 0.6, 1.2, 3.38]);
    G(box(0.44, 0.06, 0.04), "#eaffff", [s * 0.6, 1.2, 3.45], {}, 2);
    G(box(0.1, 0.1, 0.04), PINK, [s * 0.9, 1.2, 3.4], {}, 1.4);
    // hood vents
    for (let i = 0; i < 4; i++) P(box(0.3, 0.03, 0.04), "#07080b", [s * 0.5, 1.5 - i * 0.0 + 0.0, 1.5 + i * 0.12], { rotation: [-8, 0, 0] });
    // roof light pods
    P(cyl(0.07, 0.1, 8), DARK, [s * 0.6, 2.08, 1.55], { rotation: [90, 0, 0] });
    G(cyl(0.05, 0.02, 8), AMBER, [s * 0.6, 2.08, 1.62], { rotation: [90, 0, 0] });
  }
  // grille + bumper
  P(box(1.4, 0.34, 0.12), "#0a0b0f", [0, 1.12, 3.4]);
  for (let i = 0; i < 6; i++) G(box(1.3, 0.015, 0.03), NEON, [0, 0.98 + i * 0.056, 3.47], {}, 1.2);
  P(box(2.2, 0.3, 0.3), PLATE, [0, 0.72, 3.45]);
  for (let i = 0; i < 9; i++) b.spike([-0.96 + i * 0.24, 0.62, 3.6], [0, -0.15, 1], 0.2, 0.05, STEEL, { bone: ch, sides: 4 });
  P(box(1.0, 0.1, 0.04), HAZARD, [0, 0.8, 3.61], { texture: HAZARD });
  // winch
  P(cyl(0.08, 0.5, 8), DARK, [0, 0.6, 3.3], { rotation: [0, 0, 90] });
  // roof sign & light bar
  P(box(1.4, 0.08, 0.14), DARK, [0, 2.07, 1.72]);
  G(box(1.3, 0.03, 0.02), PINK, [0, 2.08, 1.8], {}, 1.8);
  P(new THREE.PlaneGeometry(0.7, 0.3), "#fff", [0, 1.12, -3.25], { texture: SIGN, dir: [0, 0, -1], axis: "z" });
  glow(P(new THREE.PlaneGeometry(0.7, 0.3), "#fff", [0, 1.12, -3.249], { texture: SIGN, dir: [0, 0, -1], axis: "z" }), 1.2);

  // ---------- bed / weapons deck
  P(box(1.9, 0.08, 3.4), PLATE, [0, 1.26, -1.5]);
  for (const s of [1, -1]) {
    P(box(0.1, 0.45, 3.4), HULL, [s * 0.95, 1.5, -1.5]);
    P(box(0.14, 0.05, 3.4), STEEL, [s * 0.95, 1.76, -1.5]);
    P(box(0.03, 0.2, 3.2), "#fff", [s * 1.01, 1.5, -1.5], { texture: RUNES });
    // missile pods on the rails
    P(box(0.5, 0.42, 0.9), PLATE, [s * 0.62, 1.78, -2.55]);
    for (const dx of [-0.11, 0.11]) for (const dy of [-0.1, 0.1]) {
      P(cyl(0.085, 0.06, 8), "#07080b", [s * 0.62 + dx, 1.78 + dy, -2.12], { rotation: [90, 0, 0] });
      b.spike([s * 0.62 + dx, 1.78 + dy, -2.2], [0, 0, 1], 0.14, 0.07, "#c04040", { bone: ch, sides: 6 });
    }
    // rear exhausts and thrusters
    for (const dx of [0.3, 0.7]) {
      b.lathe([[0, 0], [0.16, 0], [0.12, 0.1], [0.24, 0.4], [0.2, 0.4], [0.1, 0.12], [0, 0.14]], { at: [s * dx, 1.0, -3.15], axis: [0, 0, -1], segments: 8, bone: ch, color: STEEL });
      G(cyl(0.1, 0.03, 8), "#8af4ff", [s * dx, 1.0, -3.2], { rotation: [90, 0, 0] }, 2);
    }
    // jerry cans and cables
    P(box(0.2, 0.3, 0.4), "#5a6b3a", [s * 0.75, 1.46, 0.2]);
    P(box(0.08, 0.05, 0.12), STEEL, [s * 0.75, 1.64, 0.2]);
  }
  // cargo crates
  P(box(0.7, 0.4, 0.6), CAMO, [-0.3, 1.5, -0.2]);
  P(box(0.72, 0.04, 0.62), HAZARD, [-0.3, 1.7, -0.2], { texture: HAZARD });
  G(box(0.3, 0.03, 0.03), AMBER, [-0.3, 1.5, 0.12], {}, 1.2);

  // ---------- turret (yaw + pitch)
  const yaw = b.joint("yaw", { parent: ch, at: [0, 1.32, -1.2], dir: [0, 1, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 1.95, -1.2], dir: [0, 0, 1], role: "hinge" });
  P(new THREE.TorusGeometry(0.55, 0.05, 6, 16), STEEL, [0, 1.34, -1.2], { rotation: [90, 0, 0] });
  b.part(cyl(0.5, 0.4, 12), HULL, { bone: yaw, at: [0, 1.55, -1.2], flat: true });
  b.part(box(0.9, 0.3, 0.9), PLATE, { bone: yaw, at: [0, 1.9, -1.25] });
  for (const s of [1, -1]) {
    b.part(box(0.08, 0.35, 0.6), PLATE, { bone: yaw, at: [s * 0.4, 2.1, -1.15] });
    b.part(cyl(0.03, 0.04, 6), STEEL, { bone: yaw, at: [s * 0.45, 2.14, -1.0], rotation: [0, 0, 90] });
  }
  b.part(box(0.5, 0.3, 0.7), DARK, { bone: pitch, at: [0, 2.05, -1.3] });
  for (const s of [1, -1]) {
    b.part(box(0.05, 0.1, 1.9), STEEL, { bone: pitch, at: [s * 0.08, 2.05, -0.2] });
    for (let i = 0; i < 6; i++) b.part(cyl(0.1, 0.07, 8), "#222833", { bone: pitch, at: [s * 0.2, 2.02, -0.8 + i * 0.3], rotation: [90, 0, 0] });
  }
  glow(b.part(box(0.1, 0.03, 1.8), NEON, { bone: pitch, at: [0, 2.05, -0.2] }), 2);
  for (let i = 0; i < 6; i++) glow(b.part(new THREE.TorusGeometry(0.17 - i * 0.012, 0.012, 5, 10), NEON, { bone: pitch, at: [0, 2.05, -0.7 + i * 0.3] }), 1.6);
  b.part(box(0.16, 0.16, 0.16), PINK, { bone: pitch, at: [0, 2.05, 0.8] });
  glow(b.part(cyl(0.06, 0.03, 8), PINK, { bone: pitch, at: [0, 2.05, 0.9], rotation: [90, 0, 0] }), 2);
  // sensor ball on turret
  b.part(new THREE.SphereGeometry(0.14, 8, 6), "#0b0e14", { bone: yaw, at: [-0.35, 2.15, -1.7], flat: true });
  glow(b.part(cyl(0.04, 0.02, 8), PINK, { bone: yaw, at: [-0.35, 2.15, -1.84], rotation: [90, 0, 0] }), 2);

  // ---------- antennas, dish, cables
  b.spike([-0.8, 2.0, 0.3], [0.05, 1, 0], 1.6, 0.02, STEEL, { bone: ch, sides: 5 });
  G(new THREE.SphereGeometry(0.04, 6, 4), PINK, [-0.76, 3.6, 0.3], {}, 2);
  b.spike([0.8, 2.0, 0.3], [-0.05, 1, -0.1], 1.1, 0.018, STEEL, { bone: ch, sides: 5 });
  P(cyl(0.04, 0.3, 6), STEEL, [0.4, 2.15, 0.2]);
  b.lathe([[0, 0], [0.3, 0.12], [0.3, 0.14], [0, 0.03]], { at: [0.4, 2.35, 0.2], axis: [0.2, 0.7, 0.7], segments: 10, bone: ch, color: "#8c96a8" });
  for (let k = 0; k < 3; k++) {
    const y = 1.2 + k * 0.1;
    b.sweep([[0.9, 1.9, -0.3], [0.95, y + 0.2, -0.5], [0.9, 1.8, -0.9]], 0.014, DARK, { bone: ch, sides: 5 });
  }
  for (let i = 0; i < 18; i++) { // greeble boxes on hull top
    const x = (R() - 0.5) * 1.5, z = 0.3 + (R() - 0.5) * 0.4;
    if (i % 2) P(box(0.05 + R() * 0.08, 0.05, 0.05 + R() * 0.08), i % 3 ? DARK : STEEL, [x, 2.06, z + 0.2]);
  }
  // emblem on hood
  P(new THREE.PlaneGeometry(0.5, 0.5), "#fff", [0.0, 1.495 + 0.0, 2.6], { texture: EMBLEM, dir: [0, 1, 0.12], axis: "z", up: [0, 0, 1] });
  // spare tyre on rear
  P(cyl(0.4, 0.2, 12), RUBBER, [0, 1.8, -3.25], { rotation: [90, 0, 0], flat: true });
  glow(P(new THREE.TorusGeometry(0.22, 0.02, 5, 12), NEON, [0, 1.8, -3.36]), 1.6);

  // ground-contact check: lowest points are tyres at y~0.04
  return b.root;
}
