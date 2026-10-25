import * as THREE from "three";
import { createBuilder, frame, rng, paint, mottle, noise, smoothstep, mix, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Ares-77 Armoured Hauler",
  description: "Low-poly cyberpunk 6x6 militarized truck from 2077 with neon trim, rocket pods, remote turret and decals.",
};

// ---- palette -------------------------------------------------------------
const DARK = "#0d0f14";
const TIRE = "#17181d";
const TIRE2 = "#0b0b0e";
const RIM = "#7a828f";
const MAG = "#ff2d95";
const CYAN = "#18e6ff";
const YEL = "#f5c400";
const RED = "#ff2a2a";
const GLASS = "#0a2e40";
const OLIVE = "#3b4636";

// ---- textures ------------------------------------------------------------
const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#f5c400"/>
  ${Array.from({ length: 10 }, (_, i) => `<polygon points="${i * 8 - 8},16 ${i * 8},16 ${i * 8 + 8},0 ${i * 8},0" fill="#101010"/>`).join("")}
  <rect width="64" height="16" fill="none" stroke="#101010" stroke-width="2"/></svg>`,
  { size: 128 },
);
const TAG = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="98" height="38" rx="4" fill="#05060a" stroke="#18e6ff" stroke-width="2"/>
  <text x="50" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#ff2d95">ARES-77</text>
  <rect x="8" y="32" width="84" height="2" fill="#18e6ff"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="#0a0c12" stroke="#ff2d95" stroke-width="3"/>
  <polygon points="32,14 48,40 38,40 32,29 26,40 16,40" fill="#18e6ff"/><rect x="29" y="44" width="6" height="8" fill="#f5c400"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="40" fill="#04141c" stroke="#18e6ff" stroke-width="2"/>
  <polyline points="4,30 16,22 26,26 38,10 50,20 60,8 76,18" fill="none" stroke="#18e6ff" stroke-width="2"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${6 + i * 12}" y="${34 - (i % 3) * 3}" width="8" height="${3 + (i % 3) * 3}" fill="#ff2d95"/>`).join("")}
  <text x="6" y="9" font-family="monospace" font-size="7" fill="#f5c400">SYS//ONLINE</text></svg>`,
  { size: 256 },
);
const GRILL = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="24" fill="#08090d"/>
  ${Array.from({ length: 9 }, (_, i) => `<rect x="${3 + i * 7}" y="2" width="4" height="20" fill="#2a2f3a"/>`).join("")}
  <rect x="0" y="10" width="64" height="3" fill="#ff2d95"/></svg>`,
  { size: 128 },
);

// ---- paints --------------------------------------------------------------
const baseHull = paint((p, n) => {
  const m = noise(p, 0.5, 3);
  const base = mix("#2a303a", "#3d4552", m);
  const top = smoothstep(0.2, 0.9, n.y) * 0.25;
  const low = smoothstep(0.6, 0.0, p.y) * 0.5;
  const c = mix(mix(base, "#8fa0b8", top), "#1a1410", low);
  return c;
});
const HULL = panelled(baseHull, { size: 0.5, aspect: 0.8, rivets: 0.12 });
const ARMOR = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.35, rivets: 0.1 });
const CAMO = mottle(OLIVE, "#2a2f2a", { size: 0.4, seed: 4 });

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const R = rng(77);

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, rot ? { at: [x, y, z], rotation: rot as any } : { at: [x, y, z] });
  const cyl = (r: number, h: number, seg: number, at: number[], dir: number[], c: any, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), c, { at: at as any, dir: dir as any });
  const plane = (tex: any, w: number, h: number, at: number[], dir: number[], up?: number[], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at: at as any, dir: dir as any, up: up as any, axis: "z", texture: tex });

  // ---- chassis ---------------------------------------------------------
  for (const s of [1, -1]) box(0.26, 0.3, 7.0, s * 0.7, 0.9, -0.1, DARK);
  for (const z of [3.0, 1.6, 0.0, -1.6, -3.1]) box(1.6, 0.18, 0.2, 0, 0.9, z, DARK);
  glow(box(2.0, 0.04, 6.2, 0, 0.5, 0, MAG), 1.4);
  for (const s of [1, -1]) {
    glow(box(0.04, 0.05, 6.0, s * 1.0, 0.55, 0, CYAN), 1.2);
  }
  // front bumper + bullbar
  box(2.6, 0.45, 0.35, 0, 0.75, 3.75, ARMOR);
  plane(HAZARD, 2.4, 0.3, [0, 0.75, 3.93], [0, 0, 1]);
  for (const s of [1, -1]) {
    box(0.1, 0.9, 0.12, s * 0.9, 1.4, 3.95, DARK, [-12, 0, 0]);
    box(0.5, 0.2, 0.4, s * 1.25, 0.95, 3.65, ARMOR, [0, s * 25, 0]);
  }
  box(2.0, 0.1, 0.12, 0, 1.75, 3.98, DARK, [-12, 0, 0]);
  // winch
  cyl(0.1, 0.9, 8, [0, 0.62, 4.0], [1, 0, 0], YEL);

  // ---- cab ---------------------------------------------------------------
  b.extrude(
    [
      [1.4, 1.0, "sharp"],
      [1.4, 2.55, "sharp"],
      [2.5, 2.65, "sharp"],
      [3.5, 1.75, "sharp"],
      [3.65, 1.3, "sharp"],
      [3.6, 1.0, "sharp"],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, color: HULL },
  );
  // roof armor plates and camo accent
  box(2.3, 0.1, 1.0, 0, 2.7, 2.0, ARMOR);
  box(2.45, 0.08, 0.4, 0, 2.45, 1.5, CAMO);
  // windshield
  glow(box(2.1, 0.05, 1.3, 0, 2.2, 3.0, GLASS, [42, 0, 0]), 0.6);
  box(2.2, 0.06, 0.08, 0, 2.63, 2.55, DARK);
  box(2.2, 0.06, 0.08, 0, 1.78, 3.47, DARK, [42, 0, 0]);
  // grille + lights
  plane(GRILL, 1.7, 0.55, [0, 1.15, 3.7], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(box(0.7, 0.12, 0.08, s * 0.85, 1.5, 3.62, "#d8fbff", [-17, 0, 0]), 1.8);
    glow(box(0.3, 0.08, 0.08, s * 0.85, 1.32, 3.66, MAG), 1.5);
    // side window + door
    glow(box(0.04, 0.42, 0.95, s * 1.21, 2.05, 2.35, GLASS), 0.6);
    box(0.04, 1.45, 0.05, s * 1.22, 1.75, 1.75, DARK);
    box(0.04, 1.45, 0.05, s * 1.22, 1.75, 2.95, DARK);
    box(0.06, 0.08, 0.3, s * 1.23, 1.55, 2.8, DARK);
    glow(plane(TAG, 1.0, 0.4, [s * 1.215, 1.3, 2.3], [s, 0, 0]), 1.0);
    // mirrors
    box(0.05, 0.4, 0.2, s * 1.5, 2.1, 3.0, DARK);
    cyl(0.03, 0.4, 5, [s * 1.35, 2.15, 3.0], [s, 0, 0], DARK);
    glow(box(0.04, 0.3, 0.14, s * 1.53, 2.1, 3.0, CYAN), 0.8);
    // skirts
    box(0.1, 0.35, 1.5, s * 1.18, 0.75, 2.6, ARMOR);
  }
  plane(EMBLEM, 0.6, 0.6, [0, 2.12, 3.15], [0, 0.67, 0.74], [0, 1, 0]);
  // roof lightbar
  glow(box(0.9, 0.1, 0.16, -0.45, 2.78, 2.35, CYAN), 1.6);
  glow(box(0.9, 0.1, 0.16, 0.45, 2.78, 2.35, MAG), 1.6);
  // remote weapon station
  cyl(0.35, 0.2, 8, [0, 2.85, 1.9], [0, 1, 0], DARK);
  box(0.6, 0.32, 0.7, 0, 3.1, 1.95, ARMOR);
  for (const s of [1, -1]) {
    cyl(0.05, 1.3, 6, [s * 0.16, 3.1, 2.9], [0, 0, 1], DARK);
    cyl(0.08, 0.2, 6, [s * 0.16, 3.1, 3.5], [0, 0, 1], RIM);
    box(0.12, 0.2, 0.5, s * 0.36, 3.08, 1.9, DARK);
  }
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), RED, { at: [0, 3.2, 2.35] }), 2);
  // antennas
  for (const s of [1, -1]) {
    cyl(0.025, 1.6, 5, [s * 1.1, 3.4, 1.55], [0, 1, 0], DARK);
    glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), s > 0 ? MAG : CYAN, { at: [s * 1.1, 4.22, 1.55] }), 2);
    cyl(0.05, 0.3, 6, [s * 1.1, 2.7, 1.55], [0, 1, 0], ARMOR);
  }

  // ---- cargo module ----------------------------------------------------
  b.part(new THREE.BoxGeometry(2.6, 1.3, 4.6), HULL, { at: [0, 1.75, -1.0] });
  b.part(new THREE.BoxGeometry(2.3, 0.3, 4.1), ARMOR, { at: [0, 2.55, -1.0] });
  box(2.65, 0.2, 4.65, 0, 1.15, -1.0, DARK);
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) box(0.08, 1.1, 0.14, s * 1.32, 1.75, -3.0 + i * 0.84, ARMOR);
    glow(box(0.05, 0.06, 4.3, s * 1.33, 1.2, -1.0, MAG), 1.4);
    glow(box(0.05, 0.06, 4.3, s * 1.33, 2.35, -1.0, CYAN), 1.4);
    plane(SCREEN, 1.2, 0.6, [s * 1.34, 1.8, -1.9], [s, 0, 0]);
    glow(plane(SCREEN, 1.2, 0.6, [s * 1.345, 1.8, -1.9], [s, 0, 0]), 0.9);
    plane(EMBLEM, 0.7, 0.7, [s * 1.34, 1.8, 0.1], [s, 0, 0]);
    // exhaust stacks
    cyl(0.1, 2.0, 8, [s * 1.5, 2.0, 1.3], [0, 1, 0], metal("steel"));
    cyl(0.14, 0.1, 8, [s * 1.5, 3.05, 1.3], [0, 1, 0], DARK);
    for (let k = 0; k < 3; k++) box(0.22, 0.04, 0.22, s * 1.5, 1.2 + k * 0.5, 1.3, YEL);
    // side tool lockers
    box(0.3, 0.45, 1.2, s * 1.2, 0.5, -0.8, ARMOR);
    // rear lights
    glow(box(0.4, 0.15, 0.06, s * 1.0, 1.4, -3.33, RED), 1.8);
    glow(box(0.3, 0.1, 0.06, s * 1.0, 1.15, -3.33, YEL), 1.2);
    // rear doors seam
    box(0.04, 1.1, 0.04, s * 0.01, 1.75, -3.32, DARK);
  }
  plane(HAZARD, 2.4, 0.3, [0, 1.0, -3.32], [0, 0, -1]);
  plane(EMBLEM, 0.8, 0.8, [0, 1.85, -3.33], [0, 0, -1]);
  box(0.06, 1.1, 0.06, 0, 1.75, -3.32, DARK);
  // roof ribs/vents
  for (let i = 0; i < 5; i++) box(1.8, 0.06, 0.1, 0, 2.74, -2.7 + i * 0.35, DARK);
  // rocket pods
  const d = [0, 0.42, 0.9];
  const upv = [0, 0.91, -0.42];
  for (const s of [1, -1]) {
    const c = [s * 0.75, 3.1, -0.4];
    box(1.0, 0.7, 1.7, c[0], c[1], c[2], ARMOR, [-25, 0, 0]);
    for (const u of [-0.3, 0, 0.3])
      for (const v of [-0.16, 0.16]) {
        const p = [c[0] + u, c[1] + upv[1] * v, c[2] + upv[2] * v];
        cyl(0.12, 1.8, 6, p, d, DARK);
        const t = [p[0], p[1] + d[1] * 0.9, p[2] + d[2] * 0.9];
        glow(cyl(0.08, 0.06, 6, t, d, RED), 1.2);
      }
    box(0.3, 0.5, 0.3, c[0], 2.6, c[2] - 0.1, DARK);
  }
  // radar dome + mast
  cyl(0.08, 0.6, 6, [0, 2.95, -3.0], [0, 1, 0], DARK);
  b.part(new THREE.SphereGeometry(0.4, 8, 5, 0, Math.PI * 2, 0, 1.4), ARMOR, { at: [0, 3.25, -3.0] });
  glow(box(0.5, 0.05, 0.05, 0, 3.4, -2.62, CYAN), 1.6);
  // camo drone bay hatches
  for (const z of [-2.2, -1.6]) box(0.8, 0.04, 0.5, 0.0, 2.74, z, CAMO);

  // ---- wheels & suspension --------------------------------------------
  for (const z of [2.7, -1.4, -3.0]) {
    cyl(0.1, 2.4, 6, [0, 0.62, z], [1, 0, 0], DARK);
    b.part(new THREE.SphereGeometry(0.28, 6, 4), ARMOR, { at: [0, 0.62, z] });
    for (const s of [1, -1]) {
      const x = s * 1.2;
      cyl(0.62, 0.52, 10, [x, 0.62, z], [1, 0, 0], TIRE);
      b.ring(frame([x, 0.62, z], [1, 0, 0]), { count: 12, radius: 0.58 }, (it) =>
        b.stick(new THREE.BoxGeometry(0.22, 0.08, 0.2), TIRE2, it, { embed: 0.3 }),
      );
      cyl(0.36, 0.06, 8, [s * 1.47, 0.62, z], [1, 0, 0], RIM);
      glow(cyl(0.22, 0.05, 8, [s * 1.5, 0.62, z], [1, 0, 0], s > 0 ? CYAN : MAG), 1.5);
      cyl(0.08, 0.1, 6, [s * 1.52, 0.62, z], [1, 0, 0], DARK);
      b.ring(frame([s * 1.5, 0.62, z], [s, 0, 0]), { count: 6, radius: 0.29 }, (it) =>
        b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 5), DARK, it, { embed: 0.3 }),
      );
      // fender + flap
      box(0.66, 0.08, 1.4, x, 1.32, z, ARMOR);
      box(0.66, 0.5, 0.06, x, 0.9, z - 0.78, DARK);
      box(0.66, 0.2, 0.06, x, 1.18, z + 0.7, ARMOR, [-30, 0, 0]);
      // shock absorber
      cyl(0.05, 0.6, 6, [s * 0.8, 0.95, z + 0.2], [0, 1, 0], YEL);
    }
  }

  // ---- greebles: scattered armor studs & sensor nubs --------------------
  for (let i = 0; i < 14; i++) {
    const s = R() > 0.5 ? 1 : -1;
    const z = -3 + R() * 4.2;
    const y = 1.3 + R() * 1.0;
    box(0.06, 0.1, 0.1 + R() * 0.12, s * 1.34, y, z, R() > 0.5 ? DARK : YEL);
  }
  for (let i = 0; i < 8; i++) {
    const z = -3 + i * 0.55;
    glow(box(0.1, 0.03, 0.2, (i % 2 ? 1 : -1) * 0.9, 2.74, z, i % 2 ? MAG : CYAN), 1.4);
  }
  // roof cables
  for (const s of [1, -1]) b.rod([s * 0.9, 2.74, 1.4], [s * 0.9, 2.7, -0.4], 0.03, DARK);
  return b.root;
}
