import * as THREE from "three";
import { createBuilder, rng, mix, noise, smoothstep, paint } from "../../../../src/index";
import { metal, panelled, INK } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "hover-technical",
  description: "Militarized pickup truck converted to ducted hover thrusters, low-poly cyberpunk, with bed turret and neon glow.",
};

const CYAN = "#29f2ff";
const MAG = "#ff2d9a";
const RED = "#ff3030";
const GUN = "#23282c";
const DARK = "#101317";
const STEEL = "#59636c";
const OLIVE = "#3b4a3f";
const YEL = "#f2c230";

// Textures
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c230"/>${Array.from({ length: 10 }, (_, i) => `<polygon points="${i * 8 - 8},16 ${i * 8},16 ${i * 8 + 8},0 ${i * 8},0" fill="#111"/>`).join("")}<rect width="64" height="16" fill="none" stroke="#111" stroke-width="2"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#14181c" stroke="${MAG}" stroke-width="3"/><polygon points="32,8 52,20 52,44 32,56 12,44 12,20" fill="none" stroke="${CYAN}" stroke-width="3"/><polygon points="36,12 22,36 31,36 27,54 44,28 34,28" fill="${YEL}" stroke="#111" stroke-width="1.5"/></svg>`,
  { size: 128 },
);
const HEAD = svg(
  `<svg viewBox="0 0 64 16"><rect x="1" y="1" width="62" height="14" rx="5" fill="#0b1c22" stroke="#111" stroke-width="2"/><rect x="5" y="4" width="54" height="8" rx="4" fill="${CYAN}"/><rect x="10" y="6" width="44" height="4" rx="2" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const TAIL = svg(
  `<svg viewBox="0 0 64 16"><rect x="1" y="1" width="62" height="14" rx="5" fill="#220808" stroke="#111" stroke-width="2"/><rect x="5" y="4" width="54" height="8" rx="4" fill="${RED}"/><rect x="10" y="6" width="44" height="4" rx="2" fill="#ffb0a0"/></svg>`,
  { size: 128 },
);
const FAN = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#0a3a48"/><circle cx="32" cy="32" r="26" fill="${CYAN}"/><circle cx="32" cy="32" r="19" fill="#bffaff"/><circle cx="32" cy="32" r="12" fill="#ffffff"/><circle cx="32" cy="32" r="22.5" fill="none" stroke="#1aa8c0" stroke-width="2"/></svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" rx="3" fill="#e8e8d0" stroke="#111" stroke-width="2"/><text x="32" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#1a1a1a">HV-77</text><rect x="3" y="3" width="58" height="3" fill="${MAG}"/></svg>`,
  { size: 192 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0c0f12"/>${Array.from({ length: 7 }, (_, i) => `<rect x="4" y="${2 + i * 3.2}" width="56" height="1.8" fill="${MAG}"/>`).join("")}</svg>`,
  { size: 128 },
);
const LIGHTBAR = svg(
  `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#111"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 8 + 1}" y="1" width="6" height="6" fill="${i % 2 ? CYAN : MAG}"/>`).join("")}</svg>`,
  { size: 128 },
);
const SLIT = svg(`<svg viewBox="0 0 32 8"><rect width="32" height="8" rx="3" fill="${CYAN}"/></svg>`, { size: 64 });

// Paints
const BODY = paint((p, n) => {
  const base = mix("#34443d", "#47594d", noise(p, 0.6, 3));
  const grime = smoothstep(1.0, 0.45, p.y) * 0.75;
  const c = mix(base, "#15191b", grime);
  const top = smoothstep(0.4, 1, n.y) * 0.15;
  return mix(c, "#8aa090", top);
});
const ARMOR = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.4, aspect: 0.6, rivets: 0.08 });
const PLATING = panelled(mix("#3a4046", "#4a5258", 0.5), { size: 0.5, aspect: 0.5, rivets: 0.1 });
const STEELP = metal("steel", { tarnish: 0.4 });

export default function build() {
  const b = createBuilder({ name: "hover_technical" });
  const R = rng(5);

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const decal = (w: number, h: number, tex: THREE.Texture, at: [number, number, number], dir: [number, number, number], up?: [number, number, number], color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", texture: tex, ...(up ? { up } : {}) });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: [number, number, number], dir: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir });

  // ---------- Chassis and body ----------
  box(1.96, 0.42, 5.2, ARMOR, 0, 0.71, 0);
  box(1.7, 0.1, 4.8, DARK, 0, 0.47, 0);

  // Hood
  b.extrude(
    [[1.0, 0.88], [2.6, 0.88], [2.68, 1.05], [2.25, 1.28], [1.0, 1.28]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.05, color: BODY },
  );
  // Cabin
  b.extrude(
    [[-0.9, 0.9], [1.0, 0.9], [1.0, 1.25], [0.55, 1.85], [-0.7, 1.9], [-0.9, 1.75]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.7, bevel: 0.04, color: BODY },
  );
  // Side windows
  for (const pts of [
    [[-0.55, 1.42], [-0.2, 1.42], [-0.2, 1.8], [-0.55, 1.8]],
    [[-0.12, 1.42], [0.82, 1.42], [0.5, 1.8], [-0.12, 1.8]],
  ] as [number, number][][])
    glow(b.extrude(pts, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.74, color: "#0f4a66" }), 0.5);
  // Windshield
  glow(box(1.5, 0.76, 0.04, "#1286a8", 0, 1.56, 0.78, [-37, 0, 0]), 0.5);
  // Roof armor
  box(1.5, 0.08, 1.2, PLATING, 0, 1.93, -0.05);
  box(1.74, 0.06, 0.08, GUN, 0, 1.91, 0.58);

  // Armor plates on doors & fenders
  for (const s of [1, -1]) {
    box(0.08, 0.5, 1.4, PLATING, s * 0.93, 1.16, 0.15, [0, 0, 0]);
    box(0.08, 0.34, 1.5, PLATING, s * 0.97, 0.98, 1.85);
    box(0.1, 0.12, 5.2, GUN, s * 0.99, 0.55, 0);
    // door emblem + hazard
    decal(0.5, 0.5, EMBLEM, [s * 0.975, 1.17, 0.15], [s, 0, 0]);
    decal(1.5, 0.1, HAZARD, [s * 0.975, 0.92, 1.85], [s, 0, 0]);
    // mirrors
    box(0.18, 0.14, 0.1, GUN, s * 1.02, 1.5, 0.82);
    box(0.06, 0.06, 0.1, GUN, s * 0.92, 1.45, 0.82);
    glow(decal(0.14, 0.1, SLIT, [s * 1.02, 1.5, 0.88], [0, 0, 1], undefined, CYAN), 1.3);
  }

  // Hood scoop and vents
  box(0.9, 0.12, 0.8, GUN, 0, 1.31, 1.75);
  glow(decal(0.7, 0.07, SLIT, [0, 1.372, 1.75], [0, 1, 0], [0, 0, 1], MAG), 1.4);
  for (const s of [1, -1]) {
    box(0.06, 0.1, 1.4, STEELP, s * 0.5, 1.31, 1.75);
    box(0.5, 0.04, 0.9, DARK, s * 0.5, 1.28, 1.75, [0, 0, s * -10]);
  }

  // Front end
  box(2.04, 0.28, 0.22, GUN, 0, 0.66, 2.66);
  decal(1.5, 0.5, GRILLE, [0, 1.0, 2.69], [0, 0, 1]);
  glow(decal(1.5, 0.5, GRILLE, [0, 1.0, 2.694], [0, 0, 1]), 1.0);
  decal(1.9, 0.12, HAZARD, [0, 0.66, 2.775], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(decal(0.55, 0.14, HEAD, [s * 0.78, 1.0, 2.7], [0, 0, 1]), 1.6);
    b.spike([s * 0.8, 0.66, 2.77], [0, 0, 1], 0.35, 0.07, { color: STEEL, sides: 6 });
    b.spike([s * 0.35, 0.66, 2.77], [0, 0, 1], 0.28, 0.06, { color: STEEL, sides: 6 });
  }
  box(0.7, 0.22, 0.08, GUN, 0, 0.82, 2.78);

  // ---------- Bed ----------
  box(1.8, 0.1, 1.8, DARK, 0, 0.93, -1.72);
  for (const s of [1, -1]) {
    box(0.1, 0.5, 1.8, ARMOR, s * 0.93, 1.2, -1.72);
    glow(box(0.02, 0.04, 1.6, s > 0 ? MAG : CYAN, s * 0.985, 1.4, -1.72), 1.5);
    decal(0.5, 0.2, PLATE, [s * 0.985, 1.17, -1.72], [s, 0, 0]);
  }
  box(1.8, 0.5, 0.1, ARMOR, 0, 1.2, -2.62);
  box(1.8, 0.5, 0.1, ARMOR, 0, 1.2, -0.85);
  decal(0.48, 0.18, PLATE, [0, 1.12, -2.675], [0, 0, -1]);
  decal(1.5, 0.12, HAZARD, [0, 1.35, -2.675], [0, 0, -1]);

  // Roll hoops
  for (const z of [-1.1, -2.3]) {
    for (const s of [1, -1]) b.rod([s * 0.85, 1.45, z], [s * 0.85, 2.15, z], 0.045, STEEL, { sides: 6 });
    b.rod([-0.85, 2.15, z], [0.85, 2.15, z], 0.045, STEEL, { sides: 6 });
  }
  b.rod([0, 2.15, -1.1], [0, 2.15, -2.3], 0.04, STEEL, { sides: 6 });

  // Turret (mounted on a pintle)
  cyl(0.28, 0.34, 0.5, 8, GUN, [0, 1.25, -1.7], [0, 1, 0]);
  cyl(0.38, 0.38, 0.06, 8, STEEL, [0, 1.5, -1.7], [0, 1, 0]);
  box(0.5, 0.24, 0.4, GUN, 0, 1.68, -1.7);
  box(0.36, 0.34, 1.0, ARMOR, 0, 1.92, -1.6);
  b.rod([0, 1.92, -1.1], [0, 1.92, 0.5], 0.05, STEEL, { sides: 6 });
  b.rod([0.1, 1.92, -1.1], [0.1, 1.92, 0.3], 0.03, STEEL, { sides: 6 });
  b.rod([-0.1, 1.92, -1.1], [-0.1, 1.92, 0.3], 0.03, STEEL, { sides: 6 });
  cyl(0.09, 0.09, 0.26, 8, DARK, [0, 1.92, 0.55], [0, 0, 1]);
  glow(b.part(new THREE.TorusGeometry(0.08, 0.015, 4, 8), CYAN, { at: [0, 1.92, -0.7] }), 1.5);
  box(0.9, 0.5, 0.06, PLATING, 0, 2.0, -1.05);
  glow(decal(0.5, 0.06, SLIT, [0, 2.1, -1.015], [0, 0, 1], undefined, MAG), 1.5);
  box(0.28, 0.24, 0.4, OLIVE, 0.45, 1.65, -1.8);
  glow(box(0.02, 0.04, 0.3, YEL, 0.595, 1.68, -1.8), 1.2);

  // Missile tubes
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      cyl(0.09, 0.09, 0.8, 6, GUN, [-0.55 + j * 0.2, 1.1 + i * 0.0 + 0.0, -2.1 - 0.0], [0, 0, 1]);
    }
  box(0.5, 0.2, 0.9, PLATING, -0.65, 1.12, -2.1);
  for (let k = 0; k < 4; k++) cyl(0.07, 0.07, 0.9, 6, DARK, [-0.8 + (k % 2) * 0.3, 1.1 + Math.floor(k / 2) * 0.17, -2.1], [0, 0, 1]);
  // Crates
  box(0.5, 0.35, 0.5, OLIVE, 0.5, 1.2, -2.2);
  glow(box(0.52, 0.04, 0.2, CYAN, 0.5, 1.3, -2.2), 1.2);
  box(0.4, 0.28, 0.4, "#6b5a2c", 0.55, 1.18, -1.5);

  // ---------- Roof gear ----------
  box(1.4, 0.1, 0.16, GUN, 0, 2.04, 0.3);
  glow(decal(1.36, 0.1, LIGHTBAR, [0, 2.04, 0.385], [0, 0, 1]), 1.5);
  glow(decal(1.36, 0.1, LIGHTBAR, [0, 2.04, 0.215], [0, 0, -1]), 1.5);
  b.part(new THREE.SphereGeometry(0.18, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0.5, 1.97, -0.4] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), MAG, { at: [0.5, 2.12, -0.35] }), 2);
  b.rod([-0.7, 1.95, -0.6], [-0.85, 2.9, -0.8], 0.015, STEEL, { sides: 4 });
  b.rod([-0.55, 1.95, -0.6], [-0.4, 2.5, -0.9], 0.012, STEEL, { sides: 4 });
  glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), RED, { at: [-0.85, 2.92, -0.8] }), 2);

  // Rear lights and jet
  for (const s of [1, -1]) glow(decal(0.5, 0.13, TAIL, [s * 0.65, 1.1, -2.69], [0, 0, -1]), 1.5);
  cyl(0.22, 0.26, 0.5, 8, GUN, [0, 0.8, -2.85], [0, 0, 1]);
  glow(decal(0.4, 0.4, FAN, [0, 0.8, -3.11], [0, 0, -1]), 1.6);
  box(0.8, 0.2, 0.2, PLATING, 0, 0.8, -2.65);

  // Underglow
  glow(decal(1.7, 4.4, SLIT, [0, 0.42, 0], [0, -1, 0], [0, 0, 1], MAG), 1.6);

  // ---------- Thruster pods ----------
  const podAt: [number, number][] = [[1.5, 1.55], [-1.5, 1.55], [1.5, -1.45], [-1.5, -1.45]];
  for (const [px, pz] of podAt) {
    const s = Math.sign(px);
    const cy = 0.27;
    b.part(new THREE.CylinderGeometry(0.5, 0.44, 0.3, 10, 1, true), PLATING, { at: [px, cy, pz], flat: true });
    b.part(new THREE.CylinderGeometry(0.42, 0.48, 0.3, 10, 1, true), DARK, { at: [px, cy, pz], flat: true });
    b.part(new THREE.TorusGeometry(0.46, 0.09, 5, 10), GUN, { at: [px, cy + 0.15, pz], rotation: [90, 0, 0], flat: true });
    b.part(new THREE.TorusGeometry(0.44, 0.09, 5, 10), GUN, { at: [px, cy - 0.15, pz], rotation: [90, 0, 0], flat: true });
    glow(b.part(new THREE.TorusGeometry(0.4, 0.025, 4, 14), CYAN, { at: [px, cy - 0.2, pz], rotation: [90, 0, 0] }), 1.8);
    glow(decal(0.8, 0.8, FAN, [px, cy - 0.12, pz], [0, -1, 0], [0, 0, 1]), 1.5);
    // blades and hub
    for (let k = 0; k < 3; k++) box(0.82, 0.015, 0.1, DARK, px, cy - 0.06, pz, [0, k * 60 + 10, 0]);
    cyl(0.1, 0.1, 0.16, 6, STEEL, [px, cy, pz], [0, 1, 0]);
    // intake grille on top
    for (let k = 0; k < 4; k++) box(0.9, 0.02, 0.04, STEEL, px, cy + 0.2, pz - 0.27 + k * 0.18);
    box(0.06, 0.02, 0.96, STEEL, px, cy + 0.2, pz);
    // landing pads
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094 + 0.5;
      box(0.16, 0.06, 0.16, STEEL, px + Math.cos(a) * 0.42, 0.03, pz + Math.sin(a) * 0.42);
    }
    // mounting arms
    b.rod([s * 0.95, 0.62, pz - 0.2], [px - s * 0.38, cy + 0.2, pz - 0.2], 0.07, STEEL, { sides: 6 });
    b.rod([s * 0.95, 0.62, pz + 0.2], [px - s * 0.38, cy + 0.2, pz + 0.2], 0.07, STEEL, { sides: 6 });
    box(0.3, 0.14, 0.5, PLATING, px - s * 0.5, 0.58, pz);
    // hazard strip on the pod
    decal(0.5, 0.08, HAZARD, [px + s * 0.505, cy + 0.02, pz], [s, 0, 0]);
    glow(decal(0.2, 0.05, SLIT, [px + s * 0.52, cy - 0.06, pz + 0.2], [s, 0, 0], undefined, MAG), 1.5);
  }

  // Rivets / bolts on hood (merged)
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 1.6;
    const z = 1.1 + R() * 1.3;
    bolts.push(new THREE.SphereGeometry(0.02, 5, 3).translate(x, 1.29 - (z > 2.2 ? (z - 2.2) * 0.5 : 0), z));
  }
  void bolts;

  return b.root;
}
