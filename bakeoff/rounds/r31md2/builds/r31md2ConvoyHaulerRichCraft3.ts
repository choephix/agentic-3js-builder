import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, smoothstep } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Six-wheeled low-poly cyberpunk armoured hauler with roof turret, neon trim and a sealed, glowing cargo pod on the flatbed.",
};

// ---------------------------------------------------------------- palette
const GUN = "#2a2f3d";
const GUN_D = "#171a24";
const TIRE = "#101116";
const STEEL = "#6d7587";
const CYAN = "#19e6ff";
const MAGENTA = "#ff2a8a";
const AMBER = "#ffb21a";
const RED = "#ff2a2a";
const YELLOW = "#f2c200";
const WHITE = "#e9edf5";

// ---------------------------------------------------------------- paints
const HULL = paint((p, n) => {
  let c = mix("#232838", "#475068", smoothstep(-0.3, 0.9, n.y));
  const seamZ = ((p.z / 0.9) % 1 + 1) % 1;
  const seamY = ((p.y / 0.55) % 1 + 1) % 1;
  if (Math.abs(n.y) < 0.8 && (seamZ < 0.025 || seamY < 0.025)) c = mix(c, "#0a0b10", 0.8);
  else if (Math.abs(n.y) < 0.8 && (seamZ < 0.05 || seamY < 0.05)) c = mix(c, "#7a86a6", 0.25);
  const wear = noise(p, 0.18, 4);
  if (wear > 0.7) c = mix(c, "#8f98ae", 0.35);
  if (p.y < 1.0) c = mix(c, "#1a1815", 0.6 * smoothstep(1.0, 0.4, p.y) * (0.5 + noise(p, 0.1, 2)));
  return c;
});
const POD = paint((p, n) => {
  let c = mix("#aab2c4", "#e1e6ef", smoothstep(-0.4, 0.9, n.y));
  const sz = ((p.z / 0.6) % 1 + 1) % 1;
  if (Math.abs(n.y) > 0.5 && sz < 0.03) c = mix(c, "#4a5266", 0.7);
  c = mix(c, "#6a6f7c", 0.45 * smoothstep(0.58, 0.8, noise(p, 0.25, 7)));
  if (p.y < 1.9) c = mix(c, "#2b2a2a", 0.4 * smoothstep(1.9, 1.4, p.y));
  return c;
});
const FRAME = paint((p, n) => mix("#1b1e29", "#3a4156", smoothstep(0, 1, n.y) * (0.6 + noise(p, 0.1, 3) * 0.6)));

// ---------------------------------------------------------------- textures
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${YELLOW}"/>${Array.from(
    { length: 9 },
    (_, i) => `<polygon points="${i * 8 - 8},16 ${i * 8},16 ${i * 8 + 8},0 ${i * 8},0" fill="#14141a"/>`,
  ).join("")}<rect width="64" height="16" fill="none" stroke="#14141a" stroke-width="1.5"/></svg>`,
  { size: 256 },
);
const WIND = svg(
  `<svg viewBox="0 0 100 44"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c4a66"/><stop offset="1" stop-color="#06121f"/></linearGradient></defs>
  <rect width="100" height="44" rx="4" fill="url(#g)" stroke="#05080e" stroke-width="3"/>
  <polygon points="12,2 28,2 14,42 2,42" fill="#6fe9ff" opacity="0.28"/><polygon points="34,2 40,2 26,42 20,42" fill="#6fe9ff" opacity="0.2"/>
  <path d="M60 30 h30 M60 25 h22 M60 20 h26" stroke="#19e6ff" stroke-width="1.6" opacity="0.8"/>
  <circle cx="72" cy="12" r="5" fill="none" stroke="#ff2a8a" stroke-width="1.6"/><path d="M72 4v16M64 12h16" stroke="#ff2a8a" stroke-width="0.8"/></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 60 36"><rect width="60" height="36" rx="4" fill="#0a3248" stroke="#05080e" stroke-width="3"/><polygon points="8,2 22,2 10,34 2,34" fill="#6fe9ff" opacity="0.3"/><path d="M30 28h24" stroke="#19e6ff" stroke-width="1.5"/></svg>`,
  { size: 128 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 60 26"><rect width="60" height="26" fill="#0b0c12" stroke="#2c3040" stroke-width="2"/>${Array.from(
    { length: 9 },
    (_, i) => `<rect x="${5 + i * 6}" y="4" width="2.6" height="18" fill="${i % 2 ? "#19e6ff" : "#1f2433"}"/>`,
  ).join("")}</svg>`,
  { size: 192 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="#10131c" stroke="${CYAN}" stroke-width="5"/>
  <polygon points="50,18 80,34 80,66 50,82 20,66 20,34" fill="none" stroke="${MAGENTA}" stroke-width="3"/>
  <path d="M30 56 L50 30 L70 56 M36 68 L50 50 L64 68" stroke="${CYAN}" stroke-width="6" fill="none" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="5" fill="#fff"/></svg>`,
  { size: 256 },
);
const SIDESIGN = svg(
  `<svg viewBox="0 0 200 60"><rect x="2" y="2" width="196" height="56" rx="6" fill="#0d1019" stroke="${MAGENTA}" stroke-width="3"/>
  <text x="100" y="32" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="26" fill="${CYAN}">HAUL-07</text>
  <text x="100" y="50" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${MAGENTA}">SEALED  //  ESCORT ACTIVE</text>
  <path d="M10 10 h24 M166 10 h24" stroke="${AMBER}" stroke-width="3"/></svg>`,
  { size: 512 },
);
const DOOR = svg(
  `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="6" fill="#bcc3d2" stroke="#2a2f3d" stroke-width="4"/>
  <rect x="6" y="6" width="42" height="88" fill="none" stroke="#2a2f3d" stroke-width="2"/><rect x="52" y="6" width="42" height="88" fill="none" stroke="#2a2f3d" stroke-width="2"/>
  <circle cx="50" cy="50" r="14" fill="#10131c" stroke="${MAGENTA}" stroke-width="3"/><path d="M42 50h16M50 42v16" stroke="${CYAN}" stroke-width="3"/>
  <rect x="10" y="80" width="80" height="8" fill="${YELLOW}"/><path d="M14 80l8 8M26 80l8 8M38 80l8 8M50 80l8 8M62 80l8 8M74 80l8 8" stroke="#14141a" stroke-width="3"/></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 60 20"><rect width="60" height="20" rx="2" fill="#e9edf5" stroke="#14141a" stroke-width="2"/><text x="30" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#14141a">NX-4471</text></svg>`,
  { size: 192 },
);
const CELL = svg(
  `<svg viewBox="0 0 40 20"><rect width="40" height="20" fill="#06141c"/>${[0, 1, 2, 3].map((i) => `<rect x="${3 + i * 9}" y="4" width="7" height="12" fill="${CYAN}"/>`).join("")}</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  type Fill = string | ReturnType<typeof paint>;
  type V = [number, number, number];
  const box = (w: number, h: number, d: number, color: Fill, at: V, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r: number, h: number, seg: number, color: Fill, at: V, o: Record<string, unknown> = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, ...o });
  const decal = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, o: Record<string, unknown> = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });

  // ---- chassis
  box(2.2, 0.35, 7.4, GUN_D, [0, 0.9, 0]);
  box(1.6, 0.25, 7.0, FRAME, [0, 0.62, 0]); // under-belly
  for (const s of [1, -1]) {
    box(0.18, 0.3, 7.2, STEEL, [s * 1.0, 1.0, 0]); // rails
    // neon underglow
    for (const z of [2.0 - 1.0, -0.9]) glow(box(0.05, 0.05, 1.1, CYAN, [s * 1.1, 0.5, z + 0.1]), 1.4);
  }

  // ---- wheels
  const axles = [2.5, -0.9, -2.4];
  for (const z of axles)
    for (const s of [1, -1]) {
      const x = s * 1.32;
      cyl(0.62, 0.55, 12, TIRE, [x, 0.62, z], { rotation: [0, 0, 90], flat: true });
      cyl(0.4, 0.58, 10, STEEL, [x, 0.62, z], { rotation: [0, 0, 90], flat: true });
      cyl(0.2, 0.62, 6, CYAN, [x + s * 0.01, 0.62, z], { rotation: [0, 0, 90] });
      glow(cyl(0.2, 0.62, 6, CYAN, [x + s * 0.01, 0.62, z], { rotation: [0, 0, 90] }), 1.3);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.028, 0.64, 5, GUN_D, [x, 0.62 + Math.sin(a) * 0.3, z + Math.cos(a) * 0.3], { rotation: [0, 0, 90] });
      }
      // fender
      box(0.7, 0.12, 1.5, GUN, [s * 1.3, 1.34, z]);
      box(0.12, 0.3, 1.5, GUN_D, [s * 1.62, 1.2, z]);
    }
  // axle beams
  for (const z of axles) cyl(0.09, 2.6, 8, GUN_D, [0, 0.62, z], { rotation: [0, 0, 90] });

  // ---- cab (side profile extrude)
  const cabProfile: [number, number][] = [
    [-0.9, 0], [1.5, 0], [1.5, 0.75], [1.0, 0.75], [0.5, 1.5], [-0.7, 1.6], [-0.9, 1.4],
  ];
  b.extrude(cabProfile, { at: [0, 1.075, 2.0], x: [0, 0, 1], thickness: 2.3, bevel: 0.03, color: HULL });
  // armoured hood plates & ram wedge
  box(2.5, 0.2, 0.3, GUN, [0, 1.9, 3.35], { rotation: [-18, 0, 0] });
  box(2.7, 0.55, 0.45, GUN_D, [0, 0.72, 3.7]);
  b.part(new THREE.BoxGeometry(2.7, 0.35, 0.5), GUN, { at: [0, 0.42, 3.9], rotation: [-35, 0, 0] });
  decal(2.5, 0.5, HAZARD, [0, 0.72, 3.93], [0, 0, 1]);
  decal(1.25, 0.54, GRILLE, [0, 1.45, 3.505], [0, 0, 1]);
  decal(1.9, 0.9, WIND, [0, 2.208, 2.763], [0, 0.555, 0.832]);
  glow(decal(1.9, 0.9, WIND, [0, 2.21, 2.765], [0, 0.555, 0.832]), 0.7);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.14, 0.05, "#fff6c8", [s * 0.88, 1.5, 3.515]), 1.6); // headlights
    glow(box(0.4, 0.05, 0.05, MAGENTA, [s * 0.88, 1.3, 3.52]), 1.4);
    glow(decal(0.9, 0.55, SIDEWIN, [s * 1.17, 2.2, 1.95], [s, 0, 0]), 0.6);
    // armour door plate + rivets
    box(0.08, 0.55, 1.2, GUN_D, [s * 1.17, 1.55, 2.0]);
    for (let i = 0; i < 4; i++) box(0.05, 0.05, 0.05, STEEL, [s * 1.2, 1.35 + (i % 2) * 0.4, 1.55 + i * 0.3]);
    // mirrors
    box(0.05, 0.4, 0.05, GUN_D, [s * 1.45, 2.15, 2.5]);
    box(0.1, 0.3, 0.2, GUN, [s * 1.5, 2.3, 2.5]);
    glow(box(0.02, 0.22, 0.14, CYAN, [s * 1.45, 2.3, 2.5]), 1.2);
    // exhaust stacks
    cyl(0.1, 1.9, 8, STEEL, [s * 1.0, 2.1, 0.88], { flat: true });
    cyl(0.14, 0.12, 8, GUN_D, [s * 1.0, 3.04, 0.88]);
    cyl(0.1, 0.1, 8, AMBER, [s * 1.0, 3.1, 0.88]);
    glow(cyl(0.08, 0.04, 8, AMBER, [s * 1.0, 3.1, 0.88]), 1.4);
    // side skirt
    box(0.1, 0.55, 1.9, GUN, [s * 1.15, 0.65, 0.8]);
    decal(1.7, 0.4, HAZARD, [s * 1.205, 0.55, 0.8], [s, 0, 0]);
    glow(decal(0.7, 0.2, CELL, [s * 1.21, 0.86, 0.8], [s, 0, 0]), 1);
    // front tow hooks
    box(0.15, 0.15, 0.3, YELLOW, [s * 1.0, 0.75, 4.0]);
  }
  // roof gear
  box(1.9, 0.08, 0.25, GUN_D, [0, 2.72, 2.2]);
  glow(box(0.9, 0.08, 0.18, CYAN, [-0.45, 2.78, 2.2]), 1.5);
  glow(box(0.9, 0.08, 0.18, MAGENTA, [0.45, 2.78, 2.2]), 1.5);
  // antenna
  b.rod([-1.0, 2.7, 1.3], [-1.05, 3.9, 1.2], 0.02, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [-1.05, 3.92, 1.2] }), 1.8);

  // ---- roof turret
  cyl(0.45, 0.18, 10, GUN_D, [0, 2.78, 1.75], { flat: true });
  cyl(0.3, 0.3, 8, STEEL, [0, 2.97, 1.75], { flat: true });
  box(0.9, 0.42, 0.8, GUN, [0, 3.3, 1.75]);
  box(0.96, 0.12, 0.5, GUN_D, [0, 3.55, 1.7]);
  for (const s of [1, -1]) {
    box(0.18, 0.22, 0.5, GUN_D, [s * 0.24, 3.28, 2.2]);
    b.rod([s * 0.24, 3.28, 2.3], [s * 0.24, 3.28, 3.35], 0.05, STEEL, { sides: 8 });
    b.rod([s * 0.24, 3.28, 3.2], [s * 0.24, 3.28, 3.5], 0.075, GUN_D, { sides: 6 });
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), AMBER, { at: [s * 0.24, 3.28, 3.52] }), 1.5);
    box(0.14, 0.3, 0.5, GUN_D, [s * 0.52, 3.3, 1.7]); // ammo can
  }
  glow(box(0.5, 0.09, 0.06, MAGENTA, [0, 3.38, 2.17]), 1.8); // sensor eye
  glow(box(0.14, 0.14, 0.05, CYAN, [0, 3.2, 2.17]), 1.5);

  // ---- flatbed + cradle
  box(2.5, 0.15, 4.4, FRAME, [0, 1.15, -1.5]);
  for (let i = 0; i < 3; i++)
    for (const s of [1, -1]) {
      const z = -0.1 - i * 1.4;
      box(0.2, 0.7, 0.45, GUN, [s * 1.2, 1.55, z]);
      box(0.24, 0.1, 0.5, YELLOW, [s * 1.2, 1.93, z]);
      box(0.4, 0.12, 0.5, GUN_D, [s * 1.05, 1.28, z]);
    }

  // ---- sealed cargo pod
  const oct = (k: number): [number, number][] => [
    [-0.65 * k, -0.95 * k], [0.65 * k, -0.95 * k], [1.05 * k, -0.55 * k], [1.05 * k, 0.55 * k],
    [0.65 * k, 0.95 * k], [-0.65 * k, 0.95 * k], [-1.05 * k, 0.55 * k], [-1.05 * k, -0.55 * k],
  ];
  const PY = 2.175, PZ = -1.5;
  b.extrude(oct(1), { at: [0, PY, PZ], x: [1, 0, 0], thickness: 3.6, bevel: 0.04, color: POD });
  for (const [vx, vy] of oct(1)) box(0.14, 0.14, 3.7, FRAME, [vx, PY + vy, PZ]);
  for (let i = 0; i < 5; i++) {
    const z = PZ - 1.4 + i * 0.7;
    b.extrude(oct(1.04), { at: [0, PY, z], x: [1, 0, 0], thickness: 0.12, color: FRAME });
    glow(box(0.7, 0.04, 0.14, i % 2 ? CYAN : MAGENTA, [0, PY + 0.99, z]), 1.5);
    for (const s of [1, -1]) glow(box(0.04, 0.5, 0.14, i % 2 ? MAGENTA : CYAN, [s * 1.09, PY, z]), 1.3);
  }
  glow(box(0.12, 0.03, 3.3, MAGENTA, [0, PY + 0.96, PZ]), 1.6); // seal strip
  for (const s of [1, -1]) {
    decal(2.2, 0.75, SIDESIGN, [s * 1.058, PY + 0.02, PZ], [s, 0, 0]);
    glow(decal(2.2, 0.75, SIDESIGN, [s * 1.062, PY + 0.02, PZ], [s, 0, 0]), 0.9);
    decal(0.9, 0.9, EMBLEM, [s * 1.065, PY, PZ + 1.35], [s, 0, 0]);
    decal(0.9, 0.9, EMBLEM, [s * 1.065, PY, PZ - 1.35], [s, 0, 0]);
    // diagonal lock bars on chamfers
    for (const z of [PZ + 1.7, PZ - 1.7])
      box(0.16, 0.12, 0.22, YELLOW, [s * 0.86, PY + 0.77, z], { rotation: [0, 0, -s * 40] });
  }
  // rear doors & sensor front
  decal(1.7, 1.7, DOOR, [0, PY, PZ - 1.81], [0, 0, -1]);
  box(2.0, 0.08, 0.1, GUN_D, [0, PY + 0.88, PZ - 1.83]);
  glow(box(0.3, 0.06, 0.04, RED, [0, PY + 0.82, PZ - 1.87]), 1.8);
  box(1.4, 1.2, 0.18, GUN, [0, PY, PZ + 1.88]);
  glow(box(1.0, 0.1, 0.05, CYAN, [0, PY + 0.2, PZ + 1.98]), 1.5);
  glow(box(1.0, 0.06, 0.05, MAGENTA, [0, PY - 0.1, PZ + 1.98]), 1.5);
  // top pod hatch & beacon
  box(0.7, 0.07, 0.7, GUN_D, [0, PY + 1.0, PZ + 0.8]);
  cyl(0.1, 0.18, 8, GUN_D, [0, PY + 1.1, PZ - 0.9]);
  glow(cyl(0.07, 0.1, 8, AMBER, [0, PY + 1.22, PZ - 0.9]), 1.8);

  // ---- rear: bumper, lights, rear guns
  box(2.7, 0.42, 0.3, GUN_D, [0, 0.72, -3.85]);
  decal(2.5, 0.35, HAZARD, [0, 0.72, -4.005], [0, 0, -1]);
  decal(0.6, 0.2, PLATE, [0, 1.15, -3.72], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.2, 0.06, RED, [s * 1.0, 1.15, -3.72]), 1.6);
    box(0.5, 0.5, 0.5, GUN, [s * 1.2, 1.5, -3.6]); // rear gun nest
    b.rod([s * 1.2, 1.55, -3.8], [s * 1.2, 1.55, -4.5], 0.05, STEEL, { sides: 6 });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), AMBER, { at: [s * 1.2, 1.55, -4.52] }), 1.4);
  }

  // ---- side rivets along chassis
  for (let i = 0; i < 9; i++) for (const s of [1, -1]) box(0.04, 0.04, 0.04, STEEL, [s * 1.1, 1.0, -3.2 + i * 0.8]);

  return b.root;
}
