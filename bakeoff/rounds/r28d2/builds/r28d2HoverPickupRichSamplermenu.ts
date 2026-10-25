import * as THREE from "three";
import { createBuilder, paint, noise, rng } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to four ducted hover thrusters, low-poly cyberpunk, with a bed turret and neon trim.",
};

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const R = rng(11);

  const GUN = "#3b4048", DARK = "#15171c", STEEL = "#6b717c", CYAN = "#33f0ff", MAG = "#ff2d9a",
    GLASS = "#1b6f86", AMBER = "#ffb23a", OLIVE = "#4d5b3f";

  // camo + panel seams + worn edges
  const BODY = paint((p, n) => {
    const q = noise(p, 0.55, 3);
    let c: string = q < 0.4 ? "#3d4a3a" : q < 0.62 ? "#4f5a47" : "#2c3338";
    if (Math.abs(((p.z / 0.7) % 1)) < 0.012 || Math.abs(((p.y / 0.45) % 1)) < 0.012) c = "#14171a";
    if (n.y > 0.7 && noise(p, 0.06, 9) > 0.7) c = "#8a8f94";
    return c;
  });
  const SKY = paint((p, n) => (n.y > 0.5 ? "#4a5560" : n.y < -0.3 ? "#101216" : "#2b3037"));

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (r: number, h: number, color: any, x: number, y: number, z: number, sides = 8, dir?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at: [x, y, z], dir });
  const lit = (m: any, s = 1.4) => glow(m, s);

  // textures
  const NUM = svg(`<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="none" stroke="#fff" stroke-width="4"/><text x="32" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="38" fill="#fff">07</text></svg>`, { size: 128 });
  const WARN = svg(`<svg viewBox="0 0 64 64"><path d="M32 4 L61 58 H3Z" fill="#ffc400" stroke="#111" stroke-width="4"/><path d="M36 20 L26 36 H33 L28 50 L40 31 H33Z" fill="#111"/></svg>`, { size: 128 });
  const STRIPE = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffc400"/><path d="M0 16 L16 0 H28 L12 16Z M24 16 L40 0 H52 L36 16Z M48 16 L64 0 V12 L60 16Z" fill="#111"/></svg>`, { size: 128 });
  const HUD = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#021418"/><circle cx="22" cy="20" r="12" fill="none" stroke="#33f0ff" stroke-width="2"/><path d="M22 4V36M6 20H38" stroke="#33f0ff" stroke-width="1.5"/><rect x="44" y="8" width="16" height="4" fill="#ff2d9a"/><rect x="44" y="18" width="11" height="4" fill="#33f0ff"/><rect x="44" y="28" width="14" height="4" fill="#33f0ff"/></svg>`, { size: 128 });
  const FACE = svg(`<svg viewBox="0 0 64 32"><path d="M2 16 L12 4 H52 L62 16 L52 28 H12Z" fill="#111" stroke="#ff2d9a" stroke-width="3"/><path d="M10 16 L18 9 H46 L54 16 L46 23 H18Z" fill="#ff2d9a"/></svg>`, { size: 128 });
  const decal = (tex: any, w: number, h: number, x: number, y: number, z: number, dir: [number, number, number], g = false) => {
    const m = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: tex });
    if (g) glow(m, 1.2);
    return m;
  };

  // chassis
  box(1.7, 0.3, 4.9, SKY, 0, 0.85, 0.1);
  box(1.2, 0.18, 4.4, DARK, 0, 0.66, 0.1);
  for (const z of [-1.9, -0.6, 0.7, 1.9]) box(2.0, 0.12, 0.2, GUN, 0, 0.78, z);

  // lower body / fenders
  box(1.95, 0.45, 2.1, BODY, 0, 1.2, 1.55);
  box(1.95, 0.5, 1.1, BODY, 0, 1.25, 0.0);
  box(1.8, 0.14, 1.9, BODY, 0, 1.5, 1.6, [-4, 0, 0]);   // hood
  box(0.5, 0.06, 1.5, STEEL, 0, 1.6, 1.6);               // hood scoop ridge
  for (const s of [1, -1]) {
    box(0.08, 0.3, 0.9, DARK, s * 0.5, 1.58, 1.3);       // vents
    box(0.3, 0.1, 0.9, BODY, s * 0.98, 1.5, 1.6);        // fender top
  }
  // cab
  box(1.9, 0.75, 1.5, BODY, 0, 1.78, -0.1);
  box(1.8, 0.1, 1.45, BODY, 0, 2.2, -0.15);              // roof
  box(1.9, 0.62, 0.08, GLASS, 0, 1.85, 0.72, [-28, 0, 0]);   // windscreen
  lit(box(1.9, 0.62, 0.05, GLASS, 0, 1.85, 0.74, [-28, 0, 0]), 0.35);
  for (const s of [1, -1]) {
    box(0.04, 0.45, 1.0, GLASS, s * 0.96, 1.9, -0.05);
    box(0.06, 0.5, 0.06, DARK, s * 0.96, 1.9, -0.6);
    box(0.5, 0.05, 0.06, STEEL, s * 1.15, 1.8, 0.62);
    box(0.02, 0.32, 0.4, "#22262c", s * 1.4, 1.8, 0.62);
  }
  box(1.7, 0.45, 0.05, GLASS, 0, 1.9, -0.87);
  // roof light bar + antenna
  box(1.3, 0.1, 0.2, DARK, 0, 2.31, 0.4);
  for (let i = -2; i <= 2; i++) lit(box(0.18, 0.08, 0.12, i % 2 ? MAG : CYAN, i * 0.25, 2.33, 0.5), 2);
  cyl(0.015, 1.1, STEEL, -0.8, 2.8, -0.6, 5);
  b.part(new THREE.SphereGeometry(0.04, 6, 4), AMBER, { at: [-0.8, 3.36, -0.6] });
  // dish
  b.part(new THREE.SphereGeometry(0.22, 8, 4, 0, Math.PI * 2, 0, 1.2), STEEL, { at: [0.7, 2.38, -0.7], rotation: [-50, 0, 0] });
  cyl(0.03, 0.14, DARK, 0.7, 2.3, -0.7, 6);

  // front face: grille, headlights, bumper
  box(1.1, 0.4, 0.08, DARK, 0, 1.2, 2.62);
  for (let i = 0; i < 5; i++) box(1.0, 0.03, 0.05, STEEL, 0, 1.06 + i * 0.08, 2.67);
  decal(FACE, 0.5, 0.25, 0, 1.38, 2.66, [0, 0, 1], true);
  for (const s of [1, -1]) {
    box(0.4, 0.2, 0.1, DARK, s * 0.72, 1.3, 2.6);
    lit(box(0.32, 0.1, 0.05, "#e9ffff", s * 0.72, 1.3, 2.66), 2.2);
    box(0.4, 0.04, 0.12, GUN, s * 0.72, 1.42, 2.62);
  }
  box(2.1, 0.22, 0.25, GUN, 0, 0.92, 2.65);
  decal(STRIPE, 2.0, 0.2, 0, 0.92, 2.79, [0, 0, 1]);
  for (let i = -3; i <= 3; i++) b.spike([i * 0.28, 0.86, 2.78], [0, 0, 1], 0.2, 0.05, { color: STEEL });
  // winch
  cyl(0.07, 0.5, DARK, 0, 0.75, 2.68, 8, [1, 0, 0]);

  // bed
  box(1.95, 0.08, 2.4, DARK, 0, 1.0, -1.7);
  for (const s of [1, -1]) {
    box(0.1, 0.55, 2.4, BODY, s * 0.95, 1.3, -1.7);
    box(0.14, 0.06, 2.4, STEEL, s * 0.95, 1.6, -1.7);
    box(0.02, 0.4, 1.6, "#2a3036", s * 1.01, 1.3, -1.7);
  }
  box(1.95, 0.55, 0.1, BODY, 0, 1.3, -2.9);
  box(1.95, 0.06, 0.14, STEEL, 0, 1.6, -2.9);
  decal(NUM, 0.5, 0.5, 1.02, 1.3, -1.7, [1, 0, 0]);
  decal(NUM, 0.5, 0.5, -1.02, 1.3, -1.7, [-1, 0, 0]);
  decal(WARN, 0.4, 0.4, 0, 1.3, -2.96, [0, 0, -1]);
  // cab rear screen & rack
  decal(HUD, 0.8, 0.5, 0, 1.9, -0.9, [0, 0, -1], true);
  for (const s of [1, -1]) cyl(0.03, 1.0, STEEL, s * 0.85, 1.9, -0.95, 6);
  // ammo crates
  for (const s of [1, -1]) {
    box(0.4, 0.3, 0.5, OLIVE, s * 0.62, 1.2, -2.5);
    box(0.3, 0.04, 0.1, AMBER, s * 0.62, 1.37, -2.5);
  }

  // turret
  const ty = 1.1, tz = -1.5;
  cyl(0.5, 0.1, STEEL, 0, ty + 0.05, tz, 12);
  cyl(0.18, 0.5, GUN, 0, ty + 0.35, tz, 8);
  box(0.7, 0.4, 0.6, BODY, 0, ty + 0.78, tz);
  for (const s of [1, -1]) {
    cyl(0.03, 1.1, STEEL, s * 0.12, ty + 0.8, tz + 0.95, 6, [0, 0, 1]);
    cyl(0.055, 0.18, DARK, s * 0.12, ty + 0.8, tz + 1.55, 6, [0, 0, 1]);
    box(0.26, 0.26, 0.5, GUN, s * 0.5, ty + 0.78, tz + 0.1);
    lit(cyl(0.02, 0.2, CYAN, s * 0.5, ty + 0.78, tz + 0.4, 6, [0, 0, 1]), 2);
  }
  lit(box(0.3, 0.06, 0.04, MAG, 0, ty + 0.86, tz + 0.31), 2);
  box(0.4, 0.12, 0.3, DARK, 0, ty + 1.05, tz - 0.1);

  // hover thruster nacelles
  for (const s of [1, -1]) for (const z of [1.65, -1.55]) {
    const x = s * 1.2;
    box(0.5, 0.18, 0.28, GUN, s * 0.9, 0.82, z);        // pylon
    box(0.18, 0.5, 0.3, GUN, x - s * 0.15, 0.62, z);
    cyl(0.5, 0.55, SKY, x, 0.58, z, 10);
    b.part(new THREE.TorusGeometry(0.5, 0.05, 5, 12), STEEL, { at: [x, 0.86, z], dir: [0, 1, 0], axis: "z" });
    b.part(new THREE.TorusGeometry(0.5, 0.06, 5, 12), MAG, { at: [x, 0.33, z], dir: [0, 1, 0], axis: "z" });
    lit(b.part(new THREE.TorusGeometry(0.5, 0.06, 5, 12), MAG, { at: [x, 0.33, z], dir: [0, 1, 0], axis: "z" }), 2);
    lit(cyl(0.42, 0.04, CYAN, x, 0.31, z, 10), 2.2);
    for (let k = 0; k < 3; k++) b.part(new THREE.BoxGeometry(0.8, 0.02, 0.1), DARK, { at: [x, 0.36, z], rotation: [0, k * 60, 0] });
    cyl(0.1, 0.08, STEEL, x, 0.36, z, 6);
    // landing skid leg
    box(0.12, 0.3, 0.12, STEEL, x + s * 0.5, 0.15, z);
    box(0.4, 0.05, 0.5, DARK, x + s * 0.5, 0.03, z);
    decal(STRIPE, 0.7, 0.1, x + s * 0.52, 0.62, z, [s, 0, 0]);
  }

  // side neon + underglow
  for (const s of [1, -1]) {
    lit(box(0.04, 0.05, 4.2, s > 0 ? CYAN : MAG, s * 0.98, 1.0, 0.1), 2);
    lit(box(0.05, 0.04, 4.6, CYAN, s * 0.7, 0.62, 0.1), 2);
    lit(box(0.04, 0.05, 1.3, MAG, s * 0.98, 1.47, 1.55), 1.8);
  }
  // rear: tail lights & exhaust
  for (const s of [1, -1]) {
    lit(box(0.3, 0.1, 0.05, "#ff2020", s * 0.7, 1.35, -2.97), 2);
    cyl(0.07, 0.4, STEEL, s * 0.55, 0.85, -2.7, 8, [0, 0, 1]);
  }
  // sparse greeble scatter on bed floor
  for (let i = 0; i < 8; i++) box(0.12, 0.05, 0.12, i % 2 ? STEEL : DARK, (R() - 0.5) * 1.3, 1.07, -2.1 - R() * 0.6);
  // armour plates on doors
  for (const s of [1, -1]) {
    box(0.06, 0.45, 0.9, GUN, s * 1.0, 1.8, -0.1);
    for (const dz of [-0.4, 0.2]) cyl(0.03, 0.04, STEEL, s * 1.04, 1.9, dz, 6, [1, 0, 0]);
  }

  return b.root;
}
