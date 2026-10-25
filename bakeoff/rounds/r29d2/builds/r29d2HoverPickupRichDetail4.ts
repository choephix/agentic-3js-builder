import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters: armoured cab, roof turret, glowing fans, neon trim.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const OLIVE = "#4a5240", DARK = "#16181f", STEEL = "#6b7280", TRIM = "#2c303a";
const NEON = "#19f0ff", PINK = "#ff2d8a", AMBER = "#ffb23a", GLASS = "#1c3b4a";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const R = rng(5);
  const H = 0.55; // hover height
  const chassis = b.joint("chassis", { at: [0, H + 0.4, 0], role: "spine" });

  const hull = paint((p, n) => {
    let c = mix(OLIVE, "#6a7458", noise(p, 0.5, 2) * 0.6);
    c = mix(c, "#2a2f27", smoothstep(0.55, 0.8, noise(p, 0.18, 7)) * 0.5);
    if (n.y < -0.5) c = mix(c, DARK, 0.7);
    if (p.y < H + 0.45) c = mix(c, "#2b2118", 0.35);
    return c;
  });
  const P = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: chassis, at: at as any, ...o });

  // Decals
  const stripe = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#111"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#ffb23a"/>`).join("")}</svg>`, { size: 128 });
  const emblem = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#19f0ff" stroke-width="5"/><path d="M14 40 L32 12 L50 40 L32 32Z" fill="#ff2d8a"/><rect x="28" y="42" width="8" height="10" fill="#19f0ff"/></svg>`, { size: 128 });
  const screen = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#021a20"/><path d="M2 24 L12 16 L20 20 L30 8 L40 18 L52 10 L62 14" stroke="#19f0ff" stroke-width="2" fill="none"/><rect x="4" y="4" width="14" height="4" fill="#ff2d8a"/></svg>`, { size: 128 });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], tint = "#ffffff") =>
    P(new THREE.PlaneGeometry(w, h), tint, { at, dir: dir as any, axis: "z", texture: tex });

  // Floor pan and skid
  P(box(1.5, 0.14, 4.6), DARK, [0, -0.2, 0]);
  P(box(1.2, 0.1, 4.2), TRIM, [0, -0.3, 0]);
  for (let i = 0; i < 6; i++) P(box(1.55, 0.05, 0.08), STEEL, [0, -0.12, -2 + i * 0.8]);

  // Body lower
  P(box(1.9, 0.5, 4.7), hull, [0, 0.12, 0]);
  P(box(2.0, 0.06, 4.8), TRIM, [0, -0.14, 0]);
  // Cab
  P(box(1.8, 0.55, 1.7), hull, [0, 0.64, 0.45]);
  P(box(1.7, 0.1, 1.5), hull, [0, 1.25, 0.4]);
  P(box(1.74, 0.46, 0.06), GLASS, [0, 0.9, 1.3], { rotation: [-20, 0, 0] });
  P(box(1.74, 0.4, 0.05), GLASS, [0, 0.9, -0.42]);
  for (const s of [1, -1]) {
    P(box(0.04, 0.4, 1.0), GLASS, [s * 0.91, 0.92, 0.5]);
    P(box(0.08, 0.5, 0.08), TRIM, [s * 0.9, 0.95, 1.18]);
    P(box(0.2, 0.3, 1.2), "#363d31", [s * 0.97, 0.55, 0.5]); // armour skirt plates
    for (const z of [0.1, 0.9]) P(cyl(0.025, 0.04, 6), STEEL, [s * 1.08, 0.55, z], { rotation: [0, 0, 90] });
    // mirror
    b.rod([s * 0.95, 0.95, 1.1], [s * 1.2, 1.0, 1.15], 0.015, STEEL, { bone: chassis });
    P(box(0.05, 0.2, 0.14), DARK, [s * 1.22, 1.0, 1.15]);
  }
  // Hood and nose wedge
  b.frustumBox([0, 0.45, 1.6], [0, 0.3, 2.55], [1.8, 0.5], [1.7, 0.3], { bone: chassis, color: hull });
  P(box(0.3, 0.04, 0.9), TRIM, [0, 0.74, 2.0]);
  for (const s of [1, -1]) {
    glow(P(box(0.4, 0.07, 0.04), AMBER, [s * 0.6, 0.38, 2.58]), 1.5);
    P(box(0.46, 0.12, 0.06), DARK, [s * 0.6, 0.38, 2.55]);
  }
  P(box(1.0, 0.22, 0.05), DARK, [0, 0.32, 2.58]);
  for (let i = 0; i < 5; i++) P(box(0.9, 0.015, 0.02), STEEL, [0, 0.26 + i * 0.04, 2.61]);
  // Ram bumper
  P(box(2.1, 0.2, 0.2), TRIM, [0, 0.1, 2.7]);
  for (let i = 0; i < 5; i++) b.spike([-0.8 + i * 0.4, 0.1, 2.8], [0, 0, 1], 0.18, 0.04, STEEL, { bone: chassis, sides: 5 });
  glow(P(box(1.8, 0.03, 0.03), NEON, [0, -0.02, 2.8]), 2);

  // Bed
  P(box(1.9, 0.08, 2.1), DARK, [0, 0.36, -1.35]);
  for (const s of [1, -1]) {
    P(box(0.08, 0.5, 2.1), hull, [s * 0.95, 0.6, -1.35]);
    P(box(0.12, 0.05, 2.1), TRIM, [s * 0.95, 0.87, -1.35]);
    glow(P(box(0.02, 0.03, 2.0), NEON, [s * 1.0, 0.2, -1.2]), 2);
    glow(P(box(0.02, 0.03, 1.6), PINK, [s * 1.0, 0.12, 0.6]), 2);
  }
  P(box(1.9, 0.5, 0.08), hull, [0, 0.6, -2.35]);
  P(box(1.9, 0.5, 0.08), hull, [0, 0.6, -0.3]);
  decal(stripe, 1.6, 0.3, [0, 0.6, -2.4], [0, 0, -1]);
  decal(emblem, 0.5, 0.5, [0.99, 0.62, 0.5], [1, 0, 0]);
  decal(emblem, 0.5, 0.5, [-0.99, 0.62, 0.5], [-1, 0, 0]);
  decal(stripe, 1.0, 0.18, [1.0, 0.38, -1.3], [1, 0, 0]);
  decal(stripe, 1.0, 0.18, [-1.0, 0.38, -1.3], [-1, 0, 0]);
  // Ammo crates & cells in bed
  for (const [x, z] of [[-0.5, -1.0], [0.55, -1.2], [-0.5, -1.8]] as number[][]) {
    P(box(0.5, 0.3, 0.5), "#3b4234", [x, 0.55, z]);
    P(box(0.5, 0.04, 0.1), AMBER, [x, 0.71, z]);
  }
  for (const [x, z] of [[0.5, -1.9]]) {
    P(cyl(0.18, 0.5, 8), TRIM, [x, 0.65, z]);
    glow(P(cyl(0.12, 0.52, 8), NEON, [x, 0.65, z]), 1.5);
  }

  // Roof: light bar, antenna, dish
  P(box(1.2, 0.08, 0.14), DARK, [0, 1.34, 0.95]);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) glow(P(box(0.2, 0.05, 0.03), x < 0 ? PINK : NEON, [x, 1.34, 1.03]), 2);
  b.spike([-0.8, 1.3, -0.2], [0, 1, 0], 1.3, 0.015, STEEL, { bone: chassis, sides: 5 });
  glow(P(new THREE.SphereGeometry(0.03, 5, 4), PINK, [-0.8, 2.6, -0.2]), 2);
  P(cyl(0.04, 0.2, 6), STEEL, [0.7, 1.4, -0.15]);
  P(new THREE.SphereGeometry(0.2, 8, 4, 0, 6.28, 0, 1.57), TRIM, [0.7, 1.5, -0.15], { rotation: [-50, 0, 0], flat: true });

  // Turret on bed
  P(cyl(0.34, 0.14, 10), STEEL, [0, 0.44, -1.55]);
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 0.55, -1.55], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 0.95, -1.55], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.28, 0.3, 8), hull, { bone: yaw, at: [0, 0.7, -1.55], flat: true });
  for (const s of [1, -1]) b.part(box(0.06, 0.34, 0.4), TRIM, { bone: yaw, at: [s * 0.2, 0.95, -1.55] });
  b.part(box(0.3, 0.26, 0.5), TRIM, { bone: pitch, at: [0, 0.95, -1.45] });
  for (const s of [1, -1]) {
    b.rod([s * 0.08, 0.95, -1.3], [s * 0.08, 0.95, -0.2], 0.04, STEEL, { bone: pitch, sides: 8 });
    b.part(cyl(0.065, 0.2, 8), DARK, { bone: pitch, at: [s * 0.08, 0.95, -0.25], rotation: [90, 0, 0] });
    b.part(cyl(0.06, 0.4, 8), STEEL, { bone: pitch, at: [s * 0.08, 0.95, -0.9], rotation: [90, 0, 0] });
  }
  b.part(box(0.2, 0.2, 0.3), "#3b4234", { bone: pitch, at: [0.3, 0.9, -1.5] });
  glow(b.part(box(0.1, 0.06, 0.02), NEON, { bone: pitch, at: [0, 1.1, -1.15] }), 2);
  // Rocket pod on cab side
  const pod = b.joint("podMount", { parent: chassis, at: [-0.95, 1.05, 0.3], dir: [0, 0, 1], role: "hinge" });
  b.part(box(0.4, 0.4, 0.9), TRIM, { bone: pod, at: [-1.0, 1.05, 0.3] });
  for (const dx of [-0.08, 0.08]) for (const dy of [-0.08, 0.08]) {
    b.part(cyl(0.07, 0.05, 8), DARK, { bone: pod, at: [-1.0 + dx * 2, 1.05 + dy * 2, 0.77], rotation: [90, 0, 0] });
    b.spike([-1.0 + dx * 2, 1.05 + dy * 2, 0.74], [0, 0, 1], 0.12, 0.06, AMBER, { bone: pod, sides: 6 });
  }

  // Hover thrusters at four wheel stations
  const fans: any[] = [];
  for (const [k, s, z] of [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]] as [string, number, number][]) {
    const x = s * 1.25, y = 0.25;
    // pylon from body
    b.rod([s * 0.9, 0.1, z], [x, y + 0.1, z], 0.07, TRIM, { bone: chassis, sides: 6 });
    b.part(box(0.2, 0.08, 0.5), STEEL, { bone: chassis, at: [s * 1.0, 0.05, z] });
    // nacelle: lathed bell shell
    b.lathe([[0, 0.1], [0.38, 0.1], [0.5, 0.0], [0.5, -0.15], [0.42, -0.2], [0.32, -0.2], [0.3, 0.0], [0, 0.05]],
      { at: [x, y, z], axis: [0, 1, 0], segments: 10, bone: chassis, color: hull });
    b.part(new THREE.TorusGeometry(0.46, 0.03, 5, 12), STEEL, { bone: chassis, at: [x, y + 0.1, z], rotation: [90, 0, 0] });
    glow(b.part(new THREE.TorusGeometry(0.36, 0.025, 5, 12), NEON, { bone: chassis, at: [x, y - 0.17, z], rotation: [90, 0, 0] }), 2.5);
    glow(b.part(cyl(0.3, 0.02, 12), s > 0 ? NEON : PINK, { bone: chassis, at: [x, y - 0.19, z], flat: true }), 1.2);
    const fan = b.joint(`fan${k}`, { parent: chassis, at: [x, y + 0.1, z], dir: [0, 1, 0], role: "hinge" });
    fans.push(fan);
    b.part(cyl(0.07, 0.14, 8), DARK, { bone: fan, at: [x, y + 0.12, z] });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      b.part(box(0.28, 0.015, 0.08), STEEL, { bone: fan, at: [x + 0.2 * Math.cos(a), y + 0.14, z + 0.2 * Math.sin(a)], rotation: [0, (-a * 180) / Math.PI, 12] });
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      b.rod([x + 0.46 * Math.cos(a), y + 0.2, z + 0.46 * Math.sin(a)], [x - 0.46 * Math.cos(a), y + 0.2, z - 0.46 * Math.sin(a)], 0.012, DARK, { bone: chassis, sides: 4 });
    }
    // shock/stabiliser fin
    b.extrude([[0, 0], [0.3, 0], [0.1, 0.25, "sharp"], [0, 0.25]], { at: [x + s * 0.5, y, z], x: [0, 0, 1], thickness: 0.03, bone: chassis, color: PINK });
  }

  // Rear main thrusters
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.22, 0], [0.18, 0.1], [0.32, 0.5], [0.27, 0.5], [0.14, 0.12], [0, 0.14]],
      { at: [s * 0.55, 0.45, -2.45], axis: [0, 0, -1], segments: 10, bone: chassis, color: STEEL });
    glow(P(cyl(0.12, 0.03, 10), AMBER, [s * 0.55, 0.45, -2.6], { rotation: [90, 0, 0] }), 2);
  }
  // Hull cables and vents
  for (const s of [1, -1]) {
    P(box(0.5, 0.02, 0.3), DARK, [s * 0.55, 0.75, 1.9]);
    for (let i = 0; i < 4; i++) P(box(0.44, 0.015, 0.03), STEEL, [s * 0.55, 0.77, 1.78 + i * 0.07]);
  }
  b.sweep([[0.7, 1.25, -0.3], [0.9, 1.0, -0.6], [0.95, 0.9, -1.2]], 0.02, DARK, { bone: chassis, sides: 5 });
  // Cab dash screen visible through glass + roll bar
  decal(screen, 0.4, 0.2, [0.3, 0.88, 1.22], [0, 0, -1]);
  for (const s of [1, -1]) b.rod([s * 0.85, 0.9, -0.6], [s * 0.85, 1.5, -0.7], 0.03, STEEL, { bone: chassis, sides: 6 });
  b.rod([-0.85, 1.5, -0.7], [0.85, 1.5, -0.7], 0.03, STEEL, { bone: chassis, sides: 6 });
  // Underglow strip
  glow(P(box(1.4, 0.02, 3.8), "#0a6f8a", [0, -0.37, 0]), 1.2);

  // lift whole truck so hover skids clear the floor
  b.root.position.y = 0;
  return b.root;
}
