```ts
import * as THREE from "three";
import { createBuilder, svg, rng, stripes, mottle, paint, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Rail Breaker RG-6",
  description:
    "Six-wheeled railgun carrier, deployed on four hydraulic stabiliser legs, with a coil-ringed railgun on a yawing turret. Low-poly sci-fi military.",
};

// ---------- palette ----------
const HULL = panelled(mottle("#5a684b", "#4b573f", { size: 0.6, contrast: 0.8, seed: 3 }), { size: 0.8, rivets: 0.08 });
const HULL_DARK = panelled(mottle("#3f4a38", "#364030", { size: 0.5, seed: 5 }), { size: 0.7, rivets: 0.1 });
const STEEL = metal("steel", { tarnish: 0.3 });
const IRON = metal("iron");
const DARK = "#1f2226";
const TYRE = "#17181a";
const GLASS = "#3a8fa8";
const NEON = "#5ff4ff";
const AMBER = "#ffb23a";
const YEL = "#e0b020";
const HAZARD = stripes(YEL, "#1b1b1b", { size: 0.14, axis: "x", width: 0.5, wobble: 0.05, seed: 2 });
const SOOT = paint((p, n) => (n.y > 0.5 && noise(p, 0.3, 4) > 0.62 ? "#2c2f2a" : "#4a4f50"));

// ---------- textures ----------
const EMBLEM = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#15181b" stroke="#e8e8e0" stroke-width="4"/>
  <polyline points="22,58 48,30 74,58" fill="none" stroke="#e0b020" stroke-width="9"/>
  <polyline points="32,74 48,54 64,74" fill="none" stroke="#e8e8e0" stroke-width="7"/></svg>`,
  { size: 192 },
);
const UNIT = svg(
  `<svg viewBox="0 0 160 64"><rect x="3" y="3" width="154" height="58" rx="6" fill="none" stroke="#ecece4" stroke-width="4"/>
  <text x="80" y="47" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#ecece4" text-anchor="middle">RG-6</text></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="5"/>
  <polygon points="52,26 36,54 48,54 42,76 62,44 50,44 56,26" fill="#111"/></svg>`,
  { size: 128 },
);
const AMMO = svg(
  `<svg viewBox="0 0 80 48"><rect width="80" height="48" fill="#6b6a3a"/><rect x="3" y="3" width="74" height="42" fill="none" stroke="#2c2c18" stroke-width="3"/>
  <rect x="10" y="14" width="60" height="6" fill="#e0b020"/><text x="40" y="38" font-family="Arial,sans-serif" font-weight="bold" font-size="14" fill="#1b1b10" text-anchor="middle">SLUG</text></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const R = rng(9);
  const chassis = b.joint("chassis", { at: [0, 1.1, 0], role: "spine" });

  const bx = (bone: any, w: number, h: number, d: number, at: number[], color: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: at as any, rotation: rot as any });
  const cy = (bone: any, r: number, h: number, at: number[], color: any, rot?: number[], sides = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone, at: at as any, rotation: rot as any, flat: true });
  const rod = (bone: any, a: number[], c: number[], r: number, color: any, sides = 6) =>
    b.rod(a as any, c as any, r, color, { bone, sides });

  // ---------- hull ----------
  bx(chassis, 2.5, 0.9, 8.2, [0, 1.35, -0.2], HULL); // main tub
  bx(chassis, 2.3, 0.2, 7.6, [0, 0.82, -0.2], HULL_DARK); // belly skid
  bx(chassis, 2.4, 0.3, 5.6, [0, 1.95, -1.4], HULL); // rear deck
  for (const s of [1, -1]) {
    bx(chassis, 0.1, 0.5, 7.4, [s * 1.28, 1.2, -0.2], HULL_DARK); // side sponson
    bx(chassis, 0.12, 0.35, 7.0, [s * 1.3, 1.62, -0.4], HULL, [0, 0, s * 12]); // sloped side armour
    b.part(new THREE.BoxGeometry(0.1, 0.14, 7.2), YEL, { bone: chassis, at: [s * 1.33, 1.0, -0.2] }); // hazard rail
    bx(chassis, 0.1, 0.1, 7.2, [s * 1.34, 0.95, -0.2], HAZARD);
  }
  // sloped glacis nose
  b.frustumBox([0, 1.4, 1.8], [0, 1.25, 4.45], [2.5, 0.95], [2.3, 0.6], { bone: chassis, color: HULL });
  bx(chassis, 2.7, 0.28, 0.3, [0, 0.95, 4.5], IRON); // bumper
  for (const s of [1, -1]) {
    glow(bx(chassis, 0.5, 0.14, 0.05, [s * 0.8, 1.35, 4.52], NEON), 1.4); // headlights
    glow(bx(chassis, 0.2, 0.12, 0.05, [s * 1.1, 1.0, 4.6], AMBER), 1.2);
    rod(chassis, [s * 0.6, 0.9, 4.55], [s * 0.6, 0.9, 4.95], 0.05, STEEL); // tow hooks
  }
  // rear
  bx(chassis, 2.4, 0.5, 0.2, [0, 1.2, -4.4], HULL_DARK);
  b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: chassis, at: [0, 1.4, -4.51], dir: [0, 0, -1], axis: "z", texture: WARN });
  for (const s of [1, -1]) {
    cy(chassis, 0.14, 0.4, [s * 0.9, 0.95, -4.5], DARK, [90, 0, 0]); // exhausts low
  }

  // ---------- cab ----------
  bx(chassis, 2.3, 0.9, 1.9, [0, 2.55, 2.5], HULL);
  b.frustumBox([0, 2.6, 3.4], [0, 2.55, 3.9], [2.3, 0.9], [2.1, 0.5], { bone: chassis, color: HULL });
  bx(chassis, 2.0, 0.55, 0.06, [0, 2.85, 3.9], GLASS, [-28, 0, 0]);
  bx(chassis, 2.4, 0.15, 2.1, [0, 3.05, 2.45], HULL_DARK); // roof plate
  for (const s of [1, -1]) {
    bx(chassis, 0.05, 0.4, 1.0, [s * 1.17, 2.75, 2.6], GLASS);
    bx(chassis, 0.1, 0.3, 0.6, [s * 1.2, 2.2, 1.9], DARK); // side step box
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { bone: chassis, at: [s * 1.19, 2.2, 3.0], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    b.part(new THREE.PlaneGeometry(1.5, 0.6), "#ffffff", { bone: chassis, at: [s * 1.271, 1.4, -2.6], dir: [s, 0, 0], axis: "z", texture: UNIT });
    rod(chassis, [s * 1.1, 2.0, 1.55], [s * 1.1, 3.4, 1.55], 0.1, STEEL, 8); // exhaust stack
    cy(chassis, 0.14, 0.12, [s * 1.1, 3.45, 1.55], DARK);
    cy(chassis, 0.2, 0.5, [s * 1.1, 2.4, 1.55], SOOT, undefined, 8);
    b.rod([s * 1.1, 3.5, 3.0] as any, [s * 1.1, 4.5, 3.0] as any, 0.02, DARK, { bone: chassis, sides: 4 }); // whips
  }
  glow(bx(chassis, 1.6, 0.08, 0.1, [0, 3.18, 3.45], AMBER), 1.4); // light bar
  glow(bx(chassis, 1.7, 0.06, 0.04, [0, 2.45, 3.93], NEON), 1.2); // visor strip
  // radar
  const radar = b.joint("radar", { parent: chassis, at: [0.7, 3.2, 1.9], dir: [0, 1, 0], role: "hinge" });
  cy(radar, 0.06, 0.3, [0.7, 3.35, 1.9], STEEL, undefined, 6);
  b.lathe([[0, 0], [0.4, 0.15], [0.4, 0.18], [0, 0.05]], { at: [0.7, 3.55, 1.9], axis: [0, 0.8, 0.6], segments: 10, bone: radar, color: HULL_DARK });
  rod(radar, [0.7, 3.55, 1.9], [0.7, 3.8, 2.2], 0.015, STEEL, 4);

  // ---------- wheels (6) ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    [3.2, 0.2, -2.8].forEach((z, i) => {
      const hub: [number, number, number] = [s * 1.5, 0.62, z];
      const w = b.joint(`wheel${side}${i + 1}`, { parent: chassis, at: hub, dir: [s, 0, 0], role: "hinge" });
      cy(w, 0.62, 0.46, hub, TYRE, [0, 0, 90], 14);
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.5 + (k % 2) * 0.04, 0.1, 0.22), TYRE, {
          bone: w, at: [hub[0], hub[1] + 0.62 * Math.cos(a), hub[2] + 0.62 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0], flat: true,
        });
      }
      cy(w, 0.36, 0.48, hub, IRON, [0, 0, 90], 12);
      cy(w, 0.2, 0.08, [hub[0] + s * 0.26, hub[1], hub[2]], STEEL, [0, 0, 90], 8);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cy(w, 0.03, 0.05, [hub[0] + s * 0.26, hub[1] + 0.28 * Math.cos(a), hub[2] + 0.28 * Math.sin(a)], DARK, [0, 0, 90], 6);
      }
      // fender and axle
      bx(chassis, 0.62, 0.1, 1.6, [s * 1.5, 1.4, z], HULL);
      bx(chassis, 0.08, 0.3, 1.6, [s * 1.8, 1.3, z], HULL, [0, 0, 0]);
      rod(chassis, [0, 0.62, z], [s * 1.3, 0.62, z], 0.12, DARK, 8);
    });
  }

  // ---------- turret & railgun ----------
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.1, -1.2], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
  const pitch = b.joint("gunPitch", { parent: yaw, at: [0, 3.4, -1.2], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(1.15, 0.07, 6, 18), STEEL, { bone: chassis, at: [0, 2.12, -1.2], rotation: [90, 0, 0] });
  cy(yaw, 1.05, 0.4, [0, 2.3, -1.2], HULL, undefined, 14);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    cy(yaw, 0.04, 0.05, [1.05 * Math.cos(a) * 0.95, 2.52, -1.2 + 1.05 * Math.sin(a) * 0.95], STEEL, undefined, 6);
  }
  for (const s of [1, -1]) {
    bx(yaw, 0.14, 1.2, 1.7, [s * 0.95, 2.95, -1.3], HULL); // cheeks
    bx(yaw, 0.18, 0.4, 1.0, [s * 1.0, 2.7, -0.5], HULL_DARK);
    cy(yaw, 0.18, 0.1, [s * 1.05, 3.4, -1.2], STEEL, [0, 0, 90]);
    rod(yaw, [s * 0.5, 2.55, -2.3], [s * 0.5, 3.2, -1.9], 0.07, STEEL, 6); // elevation ram
  }
  b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: yaw, at: [1.031, 2.95, -1.0], dir: [1, 0, 0], axis: "z", texture: EMBLEM });
  // gun
  rod(pitch, [-1.0, 3.4, -1.2], [1.0, 3.4, -1.2], 0.1, STEEL, 8);
  bx(pitch, 0.9, 0.7, 1.4, [0, 3.4, -1.9], HULL_DARK); // breech
  bx(pitch, 0.7, 0.14, 0.9, [0, 3.82, -1.9], HULL);
  for (const s of [1, -1]) {
    bx(pitch, 0.16, 0.36, 6.6, [s * 0.24, 3.4, 2.1], STEEL); // rails
    bx(pitch, 0.1, 0.1, 6.2, [s * 0.24, 3.62, 2.1], IRON);
    cy(pitch, 0.24, 1.1, [s * 0.62, 3.3, 0.5], DARK, [90, 0, 0], 10); // capacitors
    cy(pitch, 0.26, 0.08, [s * 0.62, 3.3, 0.0], YEL, [90, 0, 0], 10);
    rod(pitch, [s * 0.6, 3.1, -1.2], [s * 0.5, 3.1, 0.9], 0.04, DARK, 5);
  }
  glow(bx(pitch, 0.3, 0.07, 6.0, [0, 3.4, 2.1], NEON), 1.6);
  for (let k = 0; k < 7; k++) {
    const z = 1.3 + k * 0.62;
    const ring = b.part(new THREE.TorusGeometry(0.4 - k * 0.012, 0.06, 5, 8), IRON, { bone: pitch, at: [0, 3.4, z], flat: true });
    void ring;
    glow(b.part(new THREE.TorusGeometry(0.36 - k * 0.012, 0.018, 4, 8), NEON, { bone: pitch, at: [0, 3.4, z + 0.07] }), 1.4);
  }
  bx(pitch, 0.8, 0.8, 0.4, [0, 3.4, 5.5], HULL_DARK); // muzzle shroud
  for (const s of [1, -1]) bx(pitch, 0.1, 0.5, 0.42, [s * 0.45, 3.4, 5.5], YEL);
  glow(bx(pitch, 0.3, 0.1, 0.04, [0, 3.4, 5.72], NEON), 1.8);
  b.part(new THREE.PlaneGeometry(1.4, 0.4), "#ffffff", { bone: pitch, at: [0.341, 3.62, -1.9], dir: [1, 0, 0], axis: "z", texture: UNIT });
  b.pose(pitch, { axis: [1, 0, 0], deg: -9 });

  // ---------- deck cargo ----------
  for (let i = 0; i < 4; i++) {
    const s = i % 2 ? 1 : -1;
    const y = 2.4 + Math.floor(i / 2) * 0.62;
    bx(chassis, 0.95, 0.6, 0.7, [s * 0.55, y, -3.3], HULL_DARK);
    b.part(new THREE.PlaneGeometry(0.8, 0.45), "#ffffff", { bone: chassis, at: [s * 0.55, y, -3.652], dir: [0, 0, -1], axis: "z", texture: AMMO });
  }
  for (const s of [1, -1]) {
    cy(chassis, 0.22, 1.1, [s * 0.9, 2.3, -0.2 + 0.2], metal("copper", { tarnish: 0.5 }), [90, 0, 0], 10); // fuel drum
  }
  // smoke launchers on hull front corners
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++)
      b.rod([s * (0.7 + k * 0.14), 2.2, 1.0] as any, [s * (0.7 + k * 0.14), 2.5, 1.3] as any, 0.05, IRON, { bone: chassis, sides: 6 });

  // ---------- stabiliser legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    [1.7, -1.3].forEach((z, i) => {
      const n = `${side}${i ? "R" : "F"}`;
      const knee: [number, number, number] = [s * 2.75, 1.7, z];
      const arm = b.joint(`legArm${n}`, { parent: chassis, at: [s * 1.2, 1.5, z], aim: knee, role: "leg" });
      const foot = b.joint(`legFoot${n}`, { parent: arm, at: knee, aim: [s * 2.75, 0.2, z], role: "leg" });
      b.rod([s * 1.2, 1.5, z] as any, knee as any, 0.17, HULL_DARK, { bone: arm, section: "box" });
      rod(arm, [s * 1.25, 0.95, z], [s * 2.6, 1.3, z], 0.07, STEEL, 6); // brace
      rod(arm, [s * 1.3, 1.9, z], [s * 2.4, 1.85, z], 0.08, IRON, 6); // hydraulic
      cy(arm, 0.28, 0.9, [knee[0], 1.35, z], HAZARD, undefined, 8); // sleeve
      cy(foot, 0.14, 1.3, [knee[0], 0.8, z], STEEL, undefined, 8); // piston
      b.part(new THREE.SphereGeometry(0.22, 7, 5), IRON, { bone: foot, at: [knee[0], 0.22, z], flat: true });
      cy(foot, 0.52, 0.16, [knee[0], 0.08, z], HAZARD, undefined, 8); // pad
      cy(foot, 0.58, 0.04, [knee[0], 0.02, z], DARK, undefined, 8);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + 0.4;
        cy(foot, 0.04, 0.06, [knee[0] + 0.4 * Math.cos(a), 0.18, z + 0.4 * Math.sin(a)], STEEL, undefined, 6);
      }
      glow(bx(arm, 0.12, 0.06, 0.12, [s * 1.6, 1.64 + R() * 0.0, z], AMBER), 1.2); // status lamp
    });
  }
  return b.root;
}
```