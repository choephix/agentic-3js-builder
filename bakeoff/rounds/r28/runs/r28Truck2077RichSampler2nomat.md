```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aegis-77 Hauler",
  description:
    "Six-wheeled militarized cyberpunk war truck from 2077: armoured cab, container bed with railgun turret, missile pods, neon underglow and hazard-striped plating.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

// ---------- palette
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const AMBER = "#ffb02e";
const RED = "#ff3040";
const DARK = "#14171f";
const GUN = "#2b313d";
const STEEL = "#6d7684";
const TYRE = "#101216";
const GLASS = "#0a2a3a";

// ---------- paints
const grid = (p: THREE.Vector3, n: THREE.Vector3, size: number) => {
  const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
  const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
  const du = ((u / size) % 1 + 1) % 1 * size;
  const dv = ((v / (size * 0.7)) % 1 + 1) % 1 * size * 0.7;
  return [du, dv] as const;
};
const hullPaint = (a: string, b2: string, seed: number) =>
  paint((p, n) => {
    let c = mix(a, b2, noise(p, 0.5, seed));
    const [du, dv] = grid(p, n, 0.55);
    if (du < 0.006 || dv < 0.006) c = mix(c, "#05060a", 0.85);
    else if (du < 0.014 || dv < 0.014) c = mix(c, "#9fb4d0", 0.15);
    c = mix(c, "#0b0c10", 0.5 * smoothstep(1.2, 0.5, p.y) * noise(p, 0.15, seed + 3));
    c = mix(c, "#b8c8e0", 0.25 * smoothstep(0.5, 1, n.y) * noise(p, 0.1, seed + 8));
    const k = 0.78 + 0.22 * smoothstep(-0.8, 0.5, n.y);
    return [c[0] * k, c[1] * k, c[2] * k];
  });
const HULL = hullPaint("#2c3544", "#3d4a60", 2);
const HULL2 = hullPaint("#3a2a45", "#512f63", 5); // violet accent armour
const ARMOUR = hullPaint("#252b36", "#323b4a", 9);

// ---------- textures
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b020"/>${[-1, 0, 1, 2, 3, 4, 5]
    .map((i) => `<path d="M${i * 12} 16 L${i * 12 + 8} 0 L${i * 12 + 16} 0 L${i * 12 + 8} 16Z" fill="#111"/>`)
    .join("")}<rect width="64" height="16" fill="none" stroke="#111" stroke-width="1.5"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="#10131a" stroke="${CYAN}" stroke-width="4"/>
  <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="none" stroke="${MAGENTA}" stroke-width="2.5"/>
  <path d="M30 62 L50 28 L70 62 L58 62 L50 46 L42 62Z" fill="${CYAN}"/><circle cx="50" cy="66" r="5" fill="${AMBER}"/>
  <text x="50" y="94" font-size="9" text-anchor="middle" font-family="monospace" font-weight="bold" fill="${CYAN}">AEGIS</text></svg>`,
  { size: 256 },
);
const SIGN = svg(
  `<svg viewBox="0 0 160 48"><rect width="160" height="48" rx="6" fill="#0b0d14" stroke="${MAGENTA}" stroke-width="3"/>
  <text x="80" y="24" font-size="19" text-anchor="middle" font-family="monospace" font-weight="bold" fill="${MAGENTA}">AEGIS-77</text>
  <text x="80" y="40" font-size="10" text-anchor="middle" font-family="monospace" fill="${CYAN}">HEAVY ESCORT UNIT</text></svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#031a22"/><circle cx="32" cy="20" r="14" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
  <circle cx="32" cy="20" r="7" fill="none" stroke="${CYAN}" stroke-width="1"/><path d="M32 2V38M4 20H60" stroke="${CYAN}" stroke-width="0.8"/>
  <rect x="4" y="4" width="14" height="3" fill="${AMBER}"/><rect x="46" y="33" width="14" height="3" fill="${RED}"/><circle cx="40" cy="14" r="2" fill="${RED}"/></svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 64 20"><rect width="64" height="20" fill="#d8d8c0"/><text x="32" y="15" font-size="13" text-anchor="middle" font-family="monospace" font-weight="bold" fill="#111">NX-2077</text></svg>`,
  { size: 128 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 40 24"><rect width="40" height="24" fill="#07090d"/>${[2, 6, 10, 14, 18]
    .map((y) => `<rect x="2" y="${y}" width="36" height="2.4" fill="${CYAN}" opacity="0.85"/>`)
    .join("")}</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "aegis77" });
  const R = rng(77);
  const chassis = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });
  const P = (geo: THREE.BufferGeometry, color: any, at: [number, number, number], o: any = {}) =>
    b.part(geo, color, { bone: chassis, at, ...o });

  // ---------- underframe
  P(box(1.7, 0.2, 5.8), DARK, [0, 0.75, 0]);
  for (const s of [1, -1]) P(box(0.14, 0.26, 5.6), GUN, [s * 0.7, 0.72, 0]);
  for (const z of [-2.4, -1.2, 0, 1.2, 2.4]) P(box(1.9, 0.12, 0.14), GUN, [0, 0.66, z]);
  P(cyl(0.22, 1.2, 8), STEEL, [0, 0.62, -0.6], { rotation: [90, 0, 0], flat: true }); // fuel/battery cell
  for (const s of [1, -1]) {
    // glowing underglow bars
    glow(P(box(0.05, 0.05, 4.6), MAGENTA, [s * 1.0, 0.56, 0]));
    glow(P(box(1.2, 0.05, 0.05), CYAN, [0, 0.52, s * 2.7]));
  }

  // ---------- wheels (3 axles)
  const axles = [2.0, 0.0, -2.0];
  axles.forEach((z, ai) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hub: [number, number, number] = [s * 1.22, 0.5, z];
      const susp = b.joint(`susp${ai}${side}`, { parent: chassis, at: [s * 0.8, 0.8, z], dir: [0, 1, 0], role: "hinge" });
      let parent: any = susp;
      if (ai === 0) parent = b.joint(`steer${side}`, { parent: susp, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
      const spin = b.joint(`wheel${ai}${side}`, { parent, at: hub, dir: [0, 1, 0], role: "hinge" });
      const W = (g: THREE.BufferGeometry, c: any, dx: number, o: any = {}) =>
        b.part(g, c, { bone: spin, at: [hub[0] + s * dx, hub[1], hub[2]], ...o });
      W(cyl(0.46, 0.42, 12), TYRE, 0, { rotation: [0, 0, 90], flat: true });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        b.part(box(0.44, 0.1, 0.14), TYRE, {
          bone: spin,
          at: [hub[0], hub[1] + 0.48 * Math.cos(a), hub[2] + 0.48 * Math.sin(a)],
          rotation: [(a * 180) / Math.PI, 0, 0],
          flat: true,
        });
      }
      W(cyl(0.32, 0.44, 10), ARMOUR, 0, { rotation: [0, 0, 90], flat: true });
      W(cyl(0.34, 0.06, 10), STEEL, s * 0.21, { rotation: [0, 0, 90], flat: true });
      W(cyl(0.12, 0.1, 8), DARK, s * 0.25, { rotation: [0, 0, 90] });
      glow(W(new THREE.TorusGeometry(0.22, 0.025, 5, 12), CYAN, s * 0.26, { rotation: [0, 90, 0] }));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(cyl(0.02, 0.05, 6), STEEL, {
          bone: spin,
          at: [hub[0] + s * 0.26, hub[1] + 0.28 * Math.cos(a), hub[2] + 0.28 * Math.sin(a)],
          rotation: [0, 0, 90],
        });
      }
      // axle + shock
      b.rod([s * 0.5, 0.6, z], hub as any, 0.07, DARK, { bone: susp, sides: 6 });
      b.rod([s * 0.9, 0.7, z + 0.2], [s * 0.85, 1.1, z + 0.1], 0.04, MAGENTA, { bone: susp, sides: 6 });
      // fender arch
      P(new THREE.TorusGeometry(0.62, 0.07, 5, 10, Math.PI), ARMOUR, [s * 1.2, 0.5, z], { rotation: [0, 90, 0], scale: [1, 1, 3.4] });
      P(box(0.5, 0.06, 1.3), ARMOUR, [s * 1.2, 1.12, z]);
    }
  });

  // ---------- main hull
  P(box(2.15, 0.55, 5.8), HULL, [0, 1.15, 0]);
  P(box(2.3, 0.1, 5.9), ARMOUR, [0, 0.9, 0]); // sill plate
  for (const s of [1, -1]) {
    // side skirts with segmented armour plates
    for (let i = 0; i < 4; i++)
      P(box(0.08, 0.38, 0.7), i % 2 ? HULL2 : ARMOUR, [s * 1.12, 0.95, -0.9 + i * 0.95 - 0.5 + (i > 1 ? 0.0 : 0)]);
    for (let i = 0; i < 6; i++) glow(P(box(0.02, 0.04, 0.2), AMBER, [s * 1.17, 1.4, -2.3 + i * 0.9]));
  }

  // ---------- hood / nose
  b.frustumBox([0, 1.5, 1.4], [0, 1.5, 3.0], [2.1, 0.55], [1.9, 0.3], { bone: chassis, color: HULL });
  P(box(1.2, 0.08, 1.2), HULL2, [0, 1.8, 2.1], { rotation: [-6, 0, 0] });
  for (const s of [1, -1]) {
    P(box(0.5, 0.06, 0.6), DARK, [s * 0.6, 1.84, 2.2]); // vents
    for (let i = 0; i < 4; i++) glow(P(box(0.4, 0.015, 0.03), CYAN, [s * 0.6, 1.88, 2.0 + i * 0.14]));
  }
  // front armour wedge + bull bar
  b.extrude(
    [[-1.1, 0], [1.1, 0], [0.95, 0.65, "sharp"], [-0.95, 0.65, "sharp"]],
    { at: [0, 1.0, 3.05], x: [1, 0, 0], y: [0, 0.2, -1], thickness: 0.2, bevel: 0.04, bone: chassis, color: ARMOUR },
  );
  P(box(2.5, 0.28, 0.3), GUN, [0, 0.8, 3.15]);
  for (let i = 0; i < 9; i++) b.spike([-1.1 + i * 0.275, 0.8, 3.3], [0, 0, 1], 0.28, 0.05, STEEL, { bone: chassis, sides: 5 });
  glow(P(box(1.2, 0.08, 0.05), CYAN, [0, 1.25, 3.08]));
  const grill = b.part(new THREE.PlaneGeometry(0.9, 0.5), "#ffffff", { bone: chassis, at: [0, 1.3, 3.08], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  glow(grill);
  for (const s of [1, -1]) {
    // headlights: slit + ring
    glow(P(box(0.5, 0.1, 0.06), "#e8ffff", [s * 0.85, 1.55, 3.0], { rotation: [0, 0, s * -8] }), 1.6);
    P(box(0.6, 0.05, 0.12), DARK, [s * 0.85, 1.64, 2.98]);
    glow(P(cyl(0.07, 0.05, 8), AMBER, [s * 1.0, 1.1, 3.1], { rotation: [90, 0, 0] }));
    // tow hook
    P(new THREE.TorusGeometry(0.07, 0.02, 5, 8, Math.PI * 1.5), STEEL, [s * 0.5, 0.78, 3.35], { rotation: [0, 0, 0] });
  }
  b.part(new THREE.PlaneGeometry(0.4, 0.125), "#ffffff", { bone: chassis, at: [0, 0.97, 3.31], dir: [0, 0, 1], axis: "z", texture: PLATE });

  // ---------- cab
  P(box(2.1, 0.95, 1.7), HULL, [0, 2.0, 0.55]);
  P(box(1.9, 0.12, 1.5), ARMOUR, [0, 2.52, 0.45]); // roof plate
  b.extrude(
    [[-1.0, 0], [1.0, 0], [0.8, 0.14, "sharp"], [-0.8, 0.14, "sharp"]],
    { at: [0, 2.55, 0.1], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, bone: chassis, color: HULL2 },
  );
  // raked windscreen: split visor with HUD
  P(box(1.85, 0.5, 0.06), GLASS, [0, 2.15, 1.44], { rotation: [-24, 0, 0] });
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.31), "#ffffff", { bone: chassis, at: [0.55, 2.12, 1.49], dir: [0, 0.4, 1], axis: "z", texture: HUD }), 0.9);
  for (const s of [1, -1]) {
    P(box(0.08, 0.6, 0.1), ARMOUR, [s * 0.95, 2.12, 1.4], { rotation: [-24, 0, 0] });
    P(box(0.06, 0.4, 1.0), GLASS, [s * 1.07, 2.15, 0.6]); // side window
    P(box(0.08, 0.1, 1.1), DARK, [s * 1.07, 2.4, 0.6]);
    glow(P(box(0.02, 0.03, 0.9), CYAN, [s * 1.11, 1.9, 0.6]));
    P(box(0.06, 0.08, 0.3), STEEL, [s * 1.1, 1.78, 0.2]); // handle
    // mirror drone-eye
    b.rod([s * 1.05, 2.15, 1.35], [s * 1.4, 2.25, 1.45], 0.02, STEEL, { bone: chassis, sides: 5 });
    P(box(0.12, 0.28, 0.2), DARK, [s * 1.45, 2.25, 1.45]);
    glow(P(box(0.02, 0.2, 0.14), RED, [s * 1.52, 2.25, 1.45]));
    // missile pod on shoulder
    P(box(0.5, 0.4, 0.9), GUN, [s * 1.4, 1.85, 0.2]);
    for (const dx of [-0.1, 0.1]) for (const dy of [-0.08, 0.08]) {
      P(cyl(0.07, 0.06, 8), DARK, [s * 1.4 + dx, 1.85 + dy, 0.67], { rotation: [90, 0, 0] });
      b.spike([s * 1.4 + dx, 1.85 + dy, 0.62], [0, 0, 1], 0.16, 0.05, s > 0 ? MAGENTA : CYAN, { bone: chassis, sides: 6 });
    }
    P(box(0.54, 0.06, 0.94), HULL2, [s * 1.4, 2.08, 0.2]);
    // smoke launchers
    for (let i = 0; i < 3; i++) b.rod([s * 0.9, 2.6, 1.0 - i * 0.1], [s * 1.05, 2.85, 1.0 - i * 0.1 + 0.25], 0.04, DARK, { bone: chassis, sides: 6 });
  }
  // roof light bar + antennas + sensor
  P(box(1.4, 0.1, 0.16), DARK, [0, 2.65, 1.1]);
  [-0.5, -0.17, 0.17, 0.5].forEach((x, i) => glow(P(cyl(0.06, 0.04, 8), i % 2 ? MAGENTA : CYAN, [x, 2.72, 1.12], { rotation: [90, 0, 0] }), 1.4));
  P(cyl(0.25, 0.06, 10), STEEL, [-0.6, 2.62, 0.2], { flat: true });
  P(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, [-0.6, 2.64, 0.2], { flat: true });
  glow(P(new THREE.SphereGeometry(0.06, 6, 4), RED, [-0.6, 2.72, 0.28]));
  for (const [x, h] of [[0.9, 1.4], [0.75, 0.9]] as const) {
    b.spike([x, 2.6, -0.2], [0, 1, 0], h, 0.018, STEEL, { bone: chassis, sides: 5 });
    P(new THREE.SphereGeometry(0.03, 5, 4), MAGENTA, [x, 2.6 + h, -0.2]);
  }
  // dish
  b.lathe([[0, 0], [0.28, 0.1], [0.28, 0.12], [0, 0.03]], { at: [0.35, 2.75, 0.0], axis: [0.2, 0.8, -0.5], segments: 10, bone: chassis, color: STEEL });

  // ---------- cargo container
  P(box(2.3, 1.0, 2.9), HULL, [0, 1.75, -1.95]);
  P(box(2.36, 0.08, 2.96), ARMOUR, [0, 2.28, -1.95]);
  P(box(2.36, 0.08, 2.96), ARMOUR, [0, 1.25, -1.95]);
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) P(box(0.07, 0.96, 0.08), GUN, [s * 1.17, 1.76, -3.3 + i * 0.52]); // ribs
    b.part(new THREE.PlaneGeometry(1.0, 0.25), "#ffffff", { bone: chassis, at: [s * 1.21, 1.45, -1.3], dir: [s, 0, 0], axis: "z", texture: HAZARD });
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: chassis, at: [s * 1.21, 1.95, -2.3], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    glow(b.part(new THREE.PlaneGeometry(1.0, 0.3), "#ffffff", { bone: chassis, at: [s * 1.21, 1.9, -1.0], dir: [s, 0, 0], axis: "z", texture: SIGN }), 1.2);
    // fuel tanks
    P(cyl(0.2, 1.0, 10), STEEL, [s * 1.32, 1.0, -1.0], { rotation: [90, 0, 0], flat: true });
    for (const dz of [-0.4, 0.4]) P(box(0.04, 0.46, 0.06), DARK, [s * 1.32, 1.0, -1.0 + dz]);
    // exhaust stacks behind cab
    b.rod([s * 1.1, 1.3, -0.35], [s * 1.1, 2.9, -0.35], 0.07, STEEL, { bone: chassis, sides: 8 });
    P(cyl(0.1, 0.4, 8), GUN, [s * 1.1, 1.9, -0.35]);
    P(cyl(0.09, 0.04, 8), DARK, [s * 1.1, 2.92, -0.35]);
  }
  // rear doors & lights
  P(box(2.2, 0.9, 0.08), ARMOUR, [0, 1.75, -3.42]);
  P(box(0.06, 0.86, 0.1), DARK, [0, 1.75, -3.47]);
  b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { bone: chassis, at: [-0.55, 1.78, -3.47], dir: [0, 0, -1], axis: "z", texture: EMBLEM });
  b.part(new THREE.PlaneGeometry(1.0, 0.25), "#ffffff", { bone: chassis, at: [0.55, 1.5, -3.47], dir: [0, 0, -1], axis: "z", texture: HAZARD });
  for (const s of [1, -1]) {
    glow(P(box(0.14, 0.5, 0.05), RED, [s * 1.05, 1.75, -3.47]), 1.4);
    P(box(0.4, 0.3, 0.3), GUN, [s * 0.7, 0.85, -3.1]); // rear thruster housing
    P(cyl(0.14, 0.2, 8), DARK, [s * 0.7, 0.85, -3.35], { rotation: [90, 0, 0] });
    glow(P(cyl(0.09, 0.03, 8), CYAN, [s * 0.7, 0.85, -3.46], { rotation: [90, 0, 0] }), 1.5);
  }
  b.part(new THREE.PlaneGeometry(0.4, 0.125), "#ffffff", { bone: chassis, at: [0, 1.1, -3.47], dir: [0, 0, -1], axis: "z", texture: PLATE });
  // roof greebles
  for (let i = 0; i < 18; i++) {
    const x = (R() - 0.5) * 1.8, z = -2.9 + R() * 1.8;
    if (Math.abs(x) < 0.5 && z > -2.4 && z < -1.2) continue;
    P(box(0.1 + R() * 0.18, 0.05 + R() * 0.1, 0.1 + R() * 0.18), i % 3 ? GUN : STEEL, [x, 2.36, z]);
  }
  for (let i = 0; i < 4; i++) glow(P(box(0.02, 0.02, 0.3), AMBER, [-0.9, 2.34, -3.0 + i * 0.7]));

  // ---------- railgun turret
  const ty = 2.33, tz = -1.8;
  P(new THREE.TorusGeometry(0.5, 0.05, 5, 14), STEEL, [0, ty + 0.03, tz], { rotation: [90, 0, 0] });
  const yaw = b.joint("yaw", { parent: chassis, at: [0, ty + 0.05, tz], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, ty + 0.5, tz], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.42, 0.25, 12), ARMOUR, { bone: yaw, at: [0, ty + 0.17, tz], flat: true });
  for (const s of [1, -1]) {
    b.part(box(0.08, 0.5, 0.6), HULL2, { bone: yaw, at: [s * 0.3, ty + 0.5, tz] });
    b.part(box(0.3, 0.3, 0.4), GUN, { bone: yaw, at: [s * 0.55, ty + 0.4, tz - 0.1] });
    glow(b.part(box(0.02, 0.06, 0.2), AMBER, { bone: yaw, at: [s * 0.71, ty + 0.4, tz - 0.1] }));
  }
  b.part(box(0.42, 0.4, 0.8), GUN, { bone: pitch, at: [0, ty + 0.5, tz - 0.2] }); // breech
  for (const s of [1, -1]) {
    b.part(box(0.07, 0.14, 2.4), STEEL, { bone: pitch, at: [s * 0.1, ty + 0.5, tz + 1.4] });
    b.part(cyl(0.1, 0.5, 8), DARK, { bone: pitch, at: [s * 0.3, ty + 0.5, tz + 0.1], rotation: [90, 0, 0], flat: true });
  }
  glow(b.part(box(0.1, 0.05, 2.3), CYAN, { bone: pitch, at: [0, ty + 0.5, tz + 1.4] }), 1.5);
  for (let i = 0; i < 6; i++) {
    glow(b.part(new THREE.TorusGeometry(0.2 - i * 0.012, 0.025, 5, 10), i % 2 ? MAGENTA : CYAN, { bone: pitch, at: [0, ty + 0.5, tz + 0.5 + i * 0.36] }), 1.3);
    b.part(box(0.46 - i * 0.025, 0.06, 0.08), GUN, { bone: pitch, at: [0, ty + 0.5, tz + 0.58 + i * 0.36] });
  }
  b.part(box(0.3, 0.3, 0.3), DARK, { bone: pitch, at: [0, ty + 0.5, tz + 2.65] }); // muzzle brake
  b.part(box(0.12, 0.12, 0.3), GUN, { bone: pitch, at: [0.35, ty + 0.75, tz + 0.2] }); // sensor
  glow(b.part(cyl(0.04, 0.03, 6), RED, { bone: pitch, at: [0.35, ty + 0.75, tz + 0.37], rotation: [90, 0, 0] }));

  // ---------- cables & hoses
  for (const s of [1, -1]) {
    const path = [[s * 0.6, 2.5, -0.1], [s * 0.7, 2.3, -0.9], [s * 0.5, 2.3, -1.6]] as [number, number, number][];
    b.sweep(path, 0.025, DARK, { bone: chassis, sides: 5 });
    b.sweep([[s * 0.5, 2.5, -0.1], [s * 0.5, 2.28, -0.8], [s * 0.35, 2.3, -1.6]], 0.015, s > 0 ? CYAN : MAGENTA, { bone: chassis, sides: 4 });
  }

  return b.root;
}
```