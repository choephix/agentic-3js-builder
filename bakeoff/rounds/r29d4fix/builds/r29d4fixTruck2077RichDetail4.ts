import * as THREE from "three";
import { createBuilder, rng, catmull, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Wraith-7 Armoured Hauler",
  description: "Low-poly cyberpunk 6x6 militarised truck from 2077: railgun turret, missile pods, neon underglow, thrusters.",
};

const DARK = "#14161e", STEEL = "#4a5060", GUN = "#2a2e3a", NEON = "#27f0ff", PINK = "#ff2fa8",
  YEL = "#ffd11a", GLASS = "#0c2a3a", TYRE = "#101114", RUST = "#7a3a1e";
const HULL = panelled(metal("iron", { tarnish: 0.5, size: 0.2 }), { size: 0.4, rivets: 0.1 });
const HULL2 = panelled(metal("blued", { tarnish: 0.4 }), { size: 0.3, rivets: 0.08 });

const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffd11a"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#15151a"/>`).join("")}</svg>`, { size: 128 });
const EMBLEM = svg(`<svg viewBox="0 0 128 64"><rect x="2" y="2" width="124" height="60" rx="6" fill="#0a0c14" stroke="#27f0ff" stroke-width="3"/><path d="M14 46 L30 14 L46 46Z" fill="none" stroke="#ff2fa8" stroke-width="4"/><text x="56" y="30" font-family="monospace" font-weight="bold" font-size="22" fill="#27f0ff">2077</text><text x="56" y="52" font-family="monospace" font-size="14" fill="#ffd11a">WRAITH-07</text></svg>`, { size: 256 });
const SCREEN = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#031018"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="4" y="${5 + i * 6}" width="${10 + ((i * 17) % 40)}" height="3" fill="${i % 2 ? "#27f0ff" : "#ff2fa8"}"/>`).join("")}<circle cx="52" cy="14" r="8" fill="none" stroke="#27f0ff" stroke-width="2"/></svg>`, { size: 128 });
const VISOR = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#061a24"/><path d="M0 12 L20 4 L28 10 L64 2" stroke="#27f0ff" stroke-width="1.5" fill="none"/></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "wraith" });
  const R = rng(77);
  const chassis = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at: at as any, ...o });
  const HZ = (g: THREE.BufferGeometry, at: number[], o: any = {}) =>
    b.part(g, "#ffffff", { bone: o.bone ?? chassis, at: at as any, texture: HAZARD, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], gl = true, bone: any = chassis) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at: at as any, dir: dir as any, axis: "z", texture: tex });
    return gl ? glow(p) : p;
  };

  // ---- frame & hull
  for (const s of [1, -1]) {
    P(box(0.14, 0.2, 6.4), DARK, [s * 0.6, 0.72, 0]);
    P(box(0.08, 0.3, 6.2), HULL2, [s * 1.0, 0.95, 0]); // skirt body
    HZ(box(0.04, 0.12, 5.6), [s * 1.05, 0.7, 0]);
  }
  for (const z of [-3, -2, -1, 0, 1, 2, 3]) P(box(1.4, 0.1, 0.1), DARK, [0, 0.62, z]);
  P(box(2.0, 0.5, 6.2), HULL, [0, 1.05, 0]);
  P(box(2.1, 0.06, 6.0), STEEL, [0, 1.32, 0]);
  b.rod([0, 0.55, 2.5], [0, 0.55, -2.8], 0.07, STEEL, { bone: chassis, sides: 8 }); // driveshaft
  b.part(cyl(0.2, 0.8, 10), GUN, { bone: chassis, at: [0.4, 0.5, 0.2], rotation: [90, 0, 0] as any, flat: true }); // fuel/battery
  // underglow
  for (const s of [1, -1]) glow(P(box(0.05, 0.05, 5.2), NEON, [s * 0.9, 0.58, 0]));
  glow(P(box(1.6, 0.05, 0.05), PINK, [0, 0.58, 3.0]));

  // ---- cab (cabover, wedge nose)
  P(box(2.05, 0.9, 2.0), HULL, [0, 1.8, 1.9]);
  b.frustumBox([0, 1.55, 2.9], [0, 1.45, 3.45], [2.0, 0.8], [1.9, 0.5], { bone: chassis, color: HULL2 }); // nose
  P(box(2.1, 0.12, 2.1), HULL2, [0, 2.3, 1.85]); // roof
  P(box(1.7, 0.08, 1.5), STEEL, [0, 2.38, 1.8]);
  const wind = b.part(box(1.8, 0.5, 0.06), GLASS, { bone: chassis, at: [0, 2.0, 2.92], rotation: [-18, 0, 0] as any });
  plane(1.7, 0.42, VISOR, [0, 2.0, 2.96], [0, 0.3, 1], true);
  void wind;
  for (const s of [1, -1]) {
    P(box(0.08, 0.5, 0.9), GLASS, [s * 1.03, 2.0, 1.9]); // side window
    P(box(0.06, 0.6, 0.06), STEEL, [s * 1.03, 2.0, 2.4]);
    P(box(0.12, 0.1, 0.5), DARK, [s * 1.06, 1.55, 1.8]); // door handle strip
    P(box(0.5, 0.4, 0.3), GUN, [s * 1.15, 2.1, 2.5]); // mirror box
    glow(P(box(0.4, 0.3, 0.02), NEON, [s * 1.15, 2.1, 2.66]));
    plane(0.95, 0.48, EMBLEM, [s * 1.045, 1.55, 1.2], [s, 0, 0], true);
    // headlights
    glow(P(box(0.55, 0.1, 0.06), "#fff2b0", [s * 0.6, 1.5, 3.37], { rotation: [12, 0, 0] as any }));
    P(box(0.6, 0.04, 0.14), DARK, [s * 0.6, 1.58, 3.34]);
    // bumper teeth + ram
    for (let i = 0; i < 3; i++)
      b.spike([s * (0.3 + i * 0.3), 0.8, 3.5], [0, 0, 1], 0.28, 0.07, STEEL, { bone: chassis, sides: 5 });
    P(box(0.9, 0.5, 0.35), HULL2, [s * 0.5, 0.85, 3.3]);
    // exhaust stacks behind cab
    b.rod([s * 0.95, 1.4, 0.6], [s * 0.95, 3.0, 0.6], 0.09, STEEL, { bone: chassis, sides: 8 });
    P(cyl(0.12, 0.5, 8), DARK, [s * 0.95, 2.0, 0.6]);
    P(box(0.22, 0.04, 0.22), DARK, [s * 0.95, 3.06, 0.6], { rotation: [-15, 0, 0] as any });
    glow(P(cyl(0.05, 0.03, 6), RUST, [s * 0.95, 3.0, 0.6]), 1.5);
  }
  P(box(1.2, 0.7, 0.1), DARK, [0, 1.2, 3.36]); // grille
  for (let i = 0; i < 6; i++) glow(P(box(1.0, 0.03, 0.03), i % 2 ? NEON : PINK, [0, 0.98 + i * 0.1, 3.42]), 0.8);
  // roof light bar + dish + whips
  P(box(1.8, 0.12, 0.2), DARK, [0, 2.5, 2.7]);
  for (let i = -3; i <= 3; i++) glow(P(box(0.2, 0.08, 0.04), i % 2 ? PINK : NEON, [i * 0.25, 2.5, 2.8]), 1.5);
  b.spike([-0.9, 2.4, 1.0], [0, 1, 0], 1.6, 0.025, STEEL, { bone: chassis, sides: 5 });
  b.spike([0.9, 2.4, 1.0], [0.1, 1, 0], 1.2, 0.02, STEEL, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), PINK, { bone: chassis, at: [-0.9, 4.0, 1.0] }), 2);
  const dish = b.joint("dish", { parent: chassis, at: [0.7, 2.5, 1.2], dir: [0, 1, 0] });
  b.part(cyl(0.05, 0.3, 6), STEEL, { bone: dish, at: [0.7, 2.6, 1.2] });
  b.lathe([[0, 0], [0.32, 0.14], [0.32, 0.16], [0, 0.04]], { at: [0.7, 2.76, 1.2], axis: [0.3, 0.8, 0.5], segments: 10, bone: dish, color: HULL2 });

  // ---- turret with railgun
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.45, 0.7], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.95, 0.7], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.55, 0.05, 6, 14), STEEL, { bone: chassis, at: [0, 2.48, 0.7], rotation: [90, 0, 0] as any });
  b.part(cyl(0.5, 0.35, 10), HULL2, { bone: yaw, at: [0, 2.65, 0.7], flat: true });
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.55, 0.7), HULL, { bone: yaw, at: [s * 0.35, 2.95, 0.7] });
    b.part(box(0.35, 0.3, 0.5), DARK, { bone: yaw, at: [s * 0.65, 2.9, 0.55] }); // ammo
    HZ(box(0.04, 0.15, 0.3), [s * 0.84, 2.9, 0.55], { bone: yaw });
  }
  b.part(box(0.5, 0.4, 0.9), GUN, { bone: pitch, at: [0, 2.95, 0.5] });
  for (const s of [1, -1]) {
    b.part(box(0.07, 0.14, 2.2), STEEL, { bone: pitch, at: [s * 0.1, 2.95, 2.0] });
    for (let i = 0; i < 5; i++) b.part(cyl(0.12, 0.2, 8), DARK, { bone: pitch, at: [s * 0.3, 2.9, 1.0 + i * 0.35], rotation: [90, 0, 0] as any });
  }
  glow(b.part(box(0.12, 0.04, 2.1), NEON, { bone: pitch, at: [0, 2.95, 2.0] }), 2);
  for (let i = 0; i < 4; i++) glow(b.part(new THREE.TorusGeometry(0.2, 0.02, 5, 10), PINK, { bone: pitch, at: [0, 2.95, 1.3 + i * 0.4] }), 1.5);
  plane(0.4, 0.25, SCREEN, [0, 3.0, 1.12], [0, 0, 1], true, pitch);

  // ---- bed: armoured cargo with missile pods
  P(box(2.0, 0.08, 3.2), STEEL, [0, 1.38, -1.8]);
  for (const s of [1, -1]) {
    P(box(0.1, 0.8, 3.2), HULL, [s * 0.98, 1.78, -1.8]);
    P(box(0.14, 0.06, 3.2), STEEL, [s * 0.98, 2.2, -1.8]);
    for (let i = 0; i < 4; i++) P(box(0.14, 0.7, 0.08), HULL2, [s * 1.04, 1.78, -0.6 - i * 0.8]);
    plane(2.4, 0.2, HAZARD, [s * 1.06, 1.45, -1.8], [s, 0, 0], false);
    for (let i = 0; i < 3; i++) {
      const z = -1.1 - i * 0.8;
      // missile pods on rails
      P(box(0.5, 0.45, 0.6), GUN, [s * 0.5, 2.0, z]);
      for (const dx of [-0.1, 0.1]) for (const dy of [-0.1, 0.1]) {
        P(cyl(0.085, 0.05, 8), DARK, [s * 0.5 + dx, 2.0 + dy, z + 0.32], { rotation: [90, 0, 0] as any });
        b.spike([s * 0.5 + dx, 2.0 + dy, z + 0.28], [0, 0, 1], 0.1, 0.06, PINK, { bone: chassis, sides: 6 });
      }
    }
  }
  P(box(2.0, 0.9, 0.12), HULL, [0, 1.8, -3.4]); // tailgate
  plane(1.0, 0.5, EMBLEM, [0, 1.8, -3.47], [0, 0, -1], true);
  P(box(2.0, 0.9, 0.12), HULL2, [0, 1.8, -0.15]); // headboard
  // greebles on roof of bed centre
  for (let i = 0; i < 12; i++) {
    const w = 0.1 + R() * 0.2;
    P(box(w, 0.08 + R() * 0.1, w), i % 2 ? DARK : STEEL, [(R() - 0.5) * 0.4, 1.46, -1.0 - R() * 2.2]);
  }
  // cables
  const cab = catmull([[0.4, 2.0, -0.2], [0.8, 2.1, -1.0], [0.3, 1.5, -1.8], [0.9, 1.55, -3.0]]);
  b.sweep(cab, 0.03, DARK, { bone: chassis, sides: 5 });
  glow(b.sweep(catmull([[-0.5, 2.0, -0.2], [-0.8, 2.2, -1.5], [-0.4, 1.5, -2.5]]), 0.02, NEON, { bone: chassis, sides: 5 }), 1.2);

  // ---- thrusters
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.22, 0], [0.18, 0.1], [0.36, 0.55], [0.3, 0.55], [0.14, 0.14], [0, 0.16]], { at: [s * 0.6, 1.0, -3.45], axis: [0, 0, -1], segments: 10, bone: chassis, color: STEEL });
    glow(P(cyl(0.13, 0.04, 10), NEON, [s * 0.6, 1.0, -3.58], { rotation: [90, 0, 0] as any }), 2);
    P(new THREE.TorusGeometry(0.28, 0.025, 5, 10), DARK, [s * 0.6, 1.0, -3.75]);
  }

  // ---- wheels (6x6)
  for (const z of [2.2, -0.9, -2.3]) for (const s of [1, -1]) {
    const k = (s > 0 ? "L" : "R") + (z > 1 ? "F" : z > -1.5 ? "M" : "B");
    const parent = z > 1 ? b.joint(`steer${k}`, { parent: chassis, at: [s * 1.1, 0.5, z], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : chassis;
    const w = b.joint(`wheel${k}`, { parent, at: [s * 1.1, 0.5, z], dir: [0, 1, 0], role: "hinge" });
    const at = [s * 1.1, 0.5, z];
    const W = (g: any, c: any, dx = 0, o: any = {}) => b.part(g, c, { bone: w, at: [at[0] + s * dx, at[1], at[2]] as any, rotation: [0, 0, 90] as any, ...o });
    W(cyl(0.46, 0.48, 12), TYRE, 0, { flat: true });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      b.part(box(0.5, 0.1, 0.14), TYRE, { bone: w, at: [at[0], at[1] + 0.49 * Math.cos(a), at[2] + 0.49 * Math.sin(a)] as any, rotation: [(a * 180) / Math.PI, 0, 0] as any });
    }
    W(cyl(0.3, 0.5, 10), STEEL, 0, { flat: true });
    W(cyl(0.24, 0.1, 10), GUN, 0.25, { flat: true });
    glow(b.part(new THREE.TorusGeometry(0.34, 0.025, 5, 14), NEON, { bone: w, at: [at[0] + s * 0.255, at[1], at[2]] as any, rotation: [0, 90, 0] as any }), 1.5);
    W(cyl(0.09, 0.1, 6), STEEL, 0.32);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(cyl(0.02, 0.03, 6), YEL, { bone: w, at: [at[0] + s * 0.3, at[1] + 0.17 * Math.cos(a), at[2] + 0.17 * Math.sin(a)] as any, rotation: [0, 0, 90] as any });
    }
    // axle + mudguard
    b.rod([s * 0.3, 0.5, z], [s * 0.9, 0.5, z], 0.07, DARK, { bone: chassis, sides: 6 });
    P(box(0.5, 0.06, 1.15), HULL2, [s * 1.15, 1.08, z]);
    P(box(0.04, 0.3, 1.1), DARK, [s * 1.38, 0.95, z]);
  }
  return b.root;
}
