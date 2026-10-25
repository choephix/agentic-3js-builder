import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, mix, type ColorInput, svg, rng, smoothstep } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler guarding a sealed cargo pod.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.55, 3.3], normal: [0, 1, 0], bone: null, room: [1.8, 0.3, 0.4] },
  { id: "grille", kind: "add", part: "cab", what: "Armoured front grille: horizontal slats in STEEL_DARK with a CYAN glowing core strip and a small emblem.", at: [0, 1.0, 4.45], normal: [0, 0, 1], bone: null, room: [1.6, 0.8, 0.3] },
  { id: "headlights", kind: "add", part: "cab", what: "Pair of angular headlights with MAGENTA-rimmed visors; one request, at is the left lamp, mirror to the right at x=-0.85.", at: [0.85, 0.75, 4.45], normal: [0, 0, 1], bone: null, room: [0.5, 0.25, 0.2] },
  { id: "podHatch", kind: "add", part: "pod", what: "Sealed pod top hatch: ring seal, hazard chevrons, four bolts, a glowing CYAN status lamp.", at: [0, 3.3, -1.2], normal: [0, 1, 0], bone: null, room: [1.2, 0.2, 1.2] },
  { id: "podLocks", kind: "add", part: "pod", what: "Row of three heavy lock clamps with small red lamps down the pod's left side.", at: [1.35, 2.0, -1.2], normal: [1, 0, 0], bone: null, room: [0.3, 1.2, 3.0] },
  { id: "antenna", kind: "add", part: "cab", what: "Antenna array behind the cab: whip antennas, a small dish, blinking MAGENTA tip lights.", at: [-0.8, 2.6, 2.2], normal: [0, 1, 0], bone: null, room: [0.6, 1.2, 0.6] },
  { id: "sidePlates", kind: "add", part: "chassis", what: "Bolted armour skirt plates along the chassis sides with CYAN edge trim.", at: [1.3, 0.75, 0.5], normal: [1, 0, 0], bone: null, room: [0.2, 0.6, 5.0] },
  { id: "exhaust", kind: "add", part: "cab", what: "Twin vertical exhaust stacks with vent caps and faint glow.", at: [1.25, 2.0, 2.4], normal: [1, 0, 0], bone: null, room: [0.3, 1.4, 0.3] },
  { id: "hullCamo", kind: "texture", part: "podSide", what: "Faded urban digital camo in HULL and HULL_DARK on pod sides, with a stencilled unit number near the rear." },
  { id: "cabSide", kind: "texture", part: "cabBody", what: "Scratched armour paint on cab with CYAN circuit-trace lines and hazard stripes along the lower edge." },
  { id: "chassisGrime", kind: "texture", part: "chassis", what: "Oil and road grime streaks in STEEL_DARK and BLACK, heavier near the wheels." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5560";
export const HULL_DARK = "#2e353d";
export const STEEL_DARK = "#20252b";
export const STEEL = "#7d8a96";
export const BLACK = "#111317";
export const CYAN = "#22e6ff";
export const MAGENTA = "#ff2fa8";
export const GLASS = "#0c2a3a";
export const WARN = "#ffb020";

const camoPaint = paint((p, n) => {
  const q = 0.22;
  const cx = Math.floor(p.x / q), cy = Math.floor(p.y / q), cz = Math.floor(p.z / q);
  const v = noise(new THREE.Vector3((cx + 0.5) * q, (cy + 0.5) * q, (cz + 0.5) * q), 0.9, 4);
  let c: ColorInput = v > 0.62 ? "#5c6874" : v > 0.46 ? HULL : HULL_DARK;
  // stencilled unit number on side faces near the rear (z < -2.6)
  if (Math.abs(n.x) > 0.5 && p.z < -2.3 && p.z > -3.3 && p.y > 1.9 && p.y < 2.7) {
    const u = (p.z + 3.3) / 1.0 * 5, w = (p.y - 1.9) / 0.8 * 7;
    const iu = Math.floor(u), iw = Math.floor(w);
    const bar = iu === 0 || iu === 4 || iw === 0 || iw === 3 || iw === 6;
    if (iu >= 0 && iu < 5 && (iu === 0 || iu === 4 || iw === 0 || iw === 3 || iw === 6) && bar) c = "#cfd6dc";
  }
  return c;
});

const cabPaint = paint((p, n) => {
  let c: ColorInput = mix(HULL, "#5b6772", noise(p, 0.5, 2));
  const sc = noise(new THREE.Vector3(p.x * 6, p.y * 0.5, p.z * 6), 0.12, 8);
  if (sc > 0.7) c = mix(c as string, "#8c98a4", 0.6);
  if (p.y < 1.45 + 0.0 && p.y > 1.18) {
    c = Math.floor((p.z + p.x + 10) / 0.18) % 2 ? WARN : BLACK;
  }
  const g = 0.12;
  const gx = Math.abs(((p.z / g) % 1 + 1) % 1 - 0.5), gy = Math.abs(((p.y / g) % 1 + 1) % 1 - 0.5);
  if (p.y > 1.6 && noise(new THREE.Vector3(Math.floor(p.z / 0.36), Math.floor(p.y / 0.36), 0), 0.5, 11) > 0.62 &&
    (gx > 0.46 || gy > 0.47) && Math.abs(n.y) < 0.5) c = CYAN;
  return c;
});

const grimePaint = paint((p) => {
  const wheelZ = [-2.8, -1.2, 1.6, 3.4];
  let near = 9;
  for (const z of wheelZ) near = Math.min(near, Math.hypot(p.z - z, p.y - 0.62));
  const heavy = Math.max(0, 1 - near / 1.4);
  const streak = noise(new THREE.Vector3(p.x * 3, p.y * 3, p.z * 0.25), 0.3, 6);
  const t = Math.min(1, streak * 0.8 + heavy * 0.7);
  return mix(STEEL_DARK, BLACK, t);
});

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name });

  // chassis
  box(2.4, 0.5, 8.6, grimePaint as unknown as string, 0, 0.85, 0.2, "chassis");
  box(2.0, 0.3, 8.0, STEEL_DARK, 0, 0.55, 0.2);
  // wheels
  for (const s of [1, -1])
    for (const z of [-2.8, -1.2, 1.6, 3.4]) {
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10), BLACK, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.54, 8), STEEL, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.58, 6), CYAN, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0] });
      box(0.2, 0.08, 1.4, HULL, s * 1.28, 1.35, z); // fender
    }
  // cab
  box(2.4, 1.5, 2.6, cabPaint as unknown as string, 0, 1.9, 3.1, "cabBody");
  box(2.2, 0.7, 1.4, HULL, 0, 1.15, 4.1, "cab");
  box(2.0, 0.55, 0.12, GLASS, 0, 2.2, 4.42);
  const slant = b.part(new THREE.BoxGeometry(2.2, 0.5, 0.9), HULL_DARK, { at: [0, 2.7, 3.2], name: "cab" });
  void slant;
  for (const s of [1, -1]) {
    box(0.1, 0.5, 1.0, GLASS, s * 1.22, 2.2, 3.4);
    box(0.5, 0.9, 0.5, STEEL_DARK, s * 1.2, 0.95, 4.35);
    box(0.4, 0.15, 0.4, WARN, s * 1.2, 1.45, 4.35);
  }
  box(2.6, 0.35, 0.5, STEEL_DARK, 0, 0.55, 4.5); // bumper
  box(2.4, 0.15, 0.3, CYAN, 0, 0.55, 4.76);
  // coupling deck
  box(2.2, 0.2, 5.0, STEEL, 0, 1.2, -1.3);
  // pod
  box(2.7, 2.0, 5.0, HULL, 0, 2.3, -1.3, "pod");
  box(2.76, 1.6, 4.9, camoPaint as unknown as string, 0, 2.3, -1.3, "podSide");
  box(2.3, 0.3, 4.6, HULL_DARK, 0, 3.45, -1.3);
  for (const z of [-3.3, -2.2, -0.2, 0.7]) box(2.9, 0.2, 0.25, STEEL_DARK, 0, 2.3, z);
  for (const z of [-3.3, 0.7]) box(2.9, 2.1, 0.25, STEEL_DARK, 0, 2.3, z);
  box(2.6, 1.9, 0.2, STEEL_DARK, 0, 2.3, -3.85);
  box(1.6, 0.12, 0.1, CYAN, 0, 3.0, -3.98);
  // rear lights
  for (const s of [1, -1]) box(0.4, 0.2, 0.1, MAGENTA, s * 0.9, 1.2, -4.0);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const Y = 2.95; // cab top roof surface (slant box top at 2.7+0.25)
  const Z = 3.3;
  const BRACKET = "#20252b";
  const part = (g: THREE.BufferGeometry, c: string, x: number, y: number, z: number, name: string) =>
    b.part(g, c, { at: [x, y, z], name });

  // housing
  part(new THREE.BoxGeometry(1.8, 0.14, 0.3), STEEL_DARK, 0, Y + 0.17, Z, "lightbarHousing");
  // top cap and bottom lip
  part(new THREE.BoxGeometry(1.84, 0.04, 0.34), BLACK, 0, Y + 0.26, Z, "lightbarCap");
  part(new THREE.BoxGeometry(1.84, 0.03, 0.34), BLACK, 0, Y + 0.095, Z, "lightbarLip");
  // end caps
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.06, 0.2, 0.36), HULL_DARK, s * 0.92, Y + 0.18, Z, "lightbarEnd");
    // brackets with feet
    part(new THREE.BoxGeometry(0.12, 0.14, 0.14), BRACKET, s * 0.7, Y + 0.04, Z, "lightbarBracket");
    part(new THREE.BoxGeometry(0.22, 0.03, 0.22), STEEL, s * 0.7, Y - 0.02, Z, "lightbarFoot");
    part(new THREE.BoxGeometry(0.12, 0.14, 0.14), BRACKET, s * 0.0 + s * 0.2, Y + 0.04, Z, "lightbarBracket");
  }
  // six lamps, alternating cyan / magenta, with dark visors
  for (let i = 0; i < 6; i++) {
    const x = -0.725 + i * 0.29;
    const c = i % 2 === 0 ? CYAN : MAGENTA;
    glow(part(new THREE.BoxGeometry(0.22, 0.09, 0.05), c, x, Y + 0.17, Z + 0.16, "lightbarLamp"), 1.6);
    part(new THREE.BoxGeometry(0.25, 0.02, 0.08), BLACK, x, Y + 0.225, Z + 0.17, "lightbarVisor");
    part(new THREE.BoxGeometry(0.02, 0.1, 0.07), BLACK, x + 0.145, Y + 0.17, Z + 0.165, "lightbarDivider");
  }
  // rear glow strip
  glow(part(new THREE.BoxGeometry(1.5, 0.025, 0.02), CYAN, 0, Y + 0.17, Z - 0.16, "lightbarRear"), 1.2);
  // wiring conduit forward of the bar
  part(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), BLACK, 0, Y + 0.0, Z - 0.3, "lightbarConduit").mesh.rotation.x = Math.PI / 2;
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addGrille(b: Builder) {
  const Z = 4.5;
  const cx = 0, cy = 1.0;
  const ember = "#8a1230";

  // armoured frame around the grille
  const bx = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, name = "grille") =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name });

  bx(1.6, 0.06, 0.12, STEEL, cx, cy + 0.4, Z + 0.04);
  bx(1.6, 0.06, 0.12, STEEL, cx, cy - 0.4, Z + 0.04);
  for (const s of [1, -1]) bx(0.07, 0.8, 0.12, STEEL, cx + s * 0.78, cy, Z + 0.04);

  // dark backing plate
  bx(1.5, 0.74, 0.04, BLACK, cx, cy, Z + 0.0);

  // glowing core strip
  bx(1.3, 0.07, 0.05, CYAN, cx, cy, Z + 0.04);
  const core = b.part(new THREE.BoxGeometry(1.3, 0.07, 0.05), CYAN, { at: [cx, cy, Z + 0.045], name: "grille" });
  core.mesh.material = new THREE.MeshStandardMaterial({
    color: CYAN, emissive: CYAN, emissiveIntensity: 1.4,
  });

  // horizontal slats (angled), above and below core strip
  for (const dy of [0.12, 0.22, 0.32, -0.12, -0.22, -0.32]) {
    const slat = b.part(new THREE.BoxGeometry(1.42, 0.06, 0.1), STEEL_DARK, {
      at: [cx, cy + dy, Z + 0.07],
      name: "grille",
    });
    slat.mesh.rotation.x = dy > 0 ? -0.35 : 0.35;
  }

  // vertical stiffeners
  for (const x of [-0.45, 0.45]) bx(0.05, 0.7, 0.09, HULL_DARK, cx + x, cy, Z + 0.1);

  // bolts on frame corners
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), STEEL_DARK, {
        at: [cx + sx * 0.78, cy + sy * 0.4, Z + 0.12],
        dir: [0, 0, 1],
        name: "grille",
      });

  // emblem: drawn badge above the core strip
  const emblem = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 3 L58 14 L54 44 L32 61 L10 44 L6 14Z" fill="#20252b" stroke="#22e6ff" stroke-width="4"/>
      <path d="M32 14 L46 38 L18 38Z" fill="none" stroke="#ff2fa8" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="32" cy="31" r="4" fill="#22e6ff"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
    at: [cx, cy + 0.0, Z + 0.16],
    dir: [0, 0, 1],
    axis: "z",
    texture: emblem,
    name: "grille",
  });
  // emblem mount
  bx(0.3, 0.3, 0.04, STEEL_DARK, cx, cy, Z + 0.12);

  // small magenta indicator lamps under the grille
  for (const x of [-0.6, 0.6]) {
    const lamp = b.part(new THREE.BoxGeometry(0.1, 0.05, 0.05), MAGENTA, { at: [x, cy - 0.46, Z + 0.06], name: "grille" });
    lamp.mesh.material = new THREE.MeshStandardMaterial({ color: MAGENTA, emissive: MAGENTA, emissiveIntensity: 1.2 });
  }
  void ember;
}
    return addGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addHeadlights(b: Builder) {
  const VISOR = "#1a0f1e";
  const LENS = "#fff6d8";
  const chevron = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffb020"/>
    <path d="M-10 20 L32 -4 L74 20 L74 34 L32 10 L-10 34Z M-10 46 L32 22 L74 46 L74 60 L32 36 L-10 60Z" fill="#111317"/></svg>`,
    { size: 128 },
  );

  // Headlights
  for (const s of [1, -1]) {
    const x = 0.85 * s;
    const z = 4.45;
    // housing
    b.part(new THREE.BoxGeometry(0.5, 0.25, 0.14), STEEL_DARK, { at: [x, 0.75, z + 0.05] });
    // visor rim (magenta frame)
    b.part(new THREE.BoxGeometry(0.46, 0.04, 0.06), MAGENTA, { at: [x, 0.89, z + 0.15] });
    b.part(new THREE.BoxGeometry(0.46, 0.03, 0.06), MAGENTA, { at: [x, 0.62, z + 0.15] });
    for (const e of [1, -1])
      b.part(new THREE.BoxGeometry(0.04, 0.22, 0.06), MAGENTA, { at: [x + e * 0.23, 0.75, z + 0.15] });
    // angular lens: wedge-ish via rotated box + cone
    const lens = b.part(new THREE.BoxGeometry(0.36, 0.14, 0.06), LENS, { at: [x, 0.75, z + 0.14] });
    lens.mesh.rotation.z = s * 0.12;
    // visor brow slanting over lens
    const brow = b.part(new THREE.BoxGeometry(0.5, 0.05, 0.12), VISOR, { at: [x, 0.94, z + 0.13] });
    brow.mesh.rotation.x = -0.35;
    // inner glow strip
    b.part(new THREE.BoxGeometry(0.2, 0.025, 0.02), CYAN, { at: [x - s * 0.04, 0.71, z + 0.18] });
    // bolts
    for (const e of [1, -1])
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 6), STEEL, {
        at: [x + e * 0.2, 0.9, z + 0.19],
        dir: [0, 0, 1],
      });
  }

  // Pod hatch
  const cx = 0;
  const cy = 3.6;
  const cz = -1.2;
  b.part(new THREE.CylinderGeometry(0.58, 0.62, 0.08, 12), STEEL_DARK, { at: [cx, cy, cz] });
  // ring seal
  b.part(new THREE.TorusGeometry(0.5, 0.045, 5, 16), STEEL, { at: [cx, cy + 0.05, cz], dir: [0, 1, 0], axis: "z" });
  // hatch lid
  b.part(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 12), HULL, { at: [cx, cy + 0.07, cz] });
  // hazard chevron ring: four decals on lid
  for (const a of [0, 1, 2, 3]) {
    const ang = (a * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      at: [cx + Math.sin(ang) * 0.3, cy + 0.105, cz + Math.cos(ang) * 0.3],
      dir: [0, 1, 0],
      axis: "z",
      up: [Math.sin(ang), 0, Math.cos(ang)],
      texture: chevron,
    });
  }
  // four bolts at corners
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 6), STEEL, {
        at: [cx + sx * 0.5, cy + 0.06, cz + sz * 0.5],
      });
      b.part(new THREE.BoxGeometry(0.09, 0.03, 0.09), STEEL_DARK, {
        at: [cx + sx * 0.5, cy + 0.02, cz + sz * 0.5],
      });
    }
  // center status lamp
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 8), BLACK, { at: [cx, cy + 0.12, cz] });
  const lamp = b.part(new THREE.SphereGeometry(0.08, 8, 5), CYAN, { at: [cx, cy + 0.15, cz] });
  lamp.mesh.scale.y = 0.6;
  // handle bar
  b.part(new THREE.BoxGeometry(0.5, 0.04, 0.05), STEEL, { at: [cx, cy + 0.11, cz + 0.2] });
}
    return addHeadlights;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addPodLocks(b: Builder) {
  const LAMP = "#ff2a2a";
  const LAMP_DIM = "#8a1010";
  const X = 1.35;
  const zs = [-2.7, -1.2, 0.3];

  // long mounting rail down the pod side
  b.part(new THREE.BoxGeometry(0.1, 0.16, 3.6), STEEL_DARK, { at: [X + 0.03, 2.95, -1.2], name: "podLockRail" });
  b.part(new THREE.BoxGeometry(0.1, 0.16, 3.6), STEEL_DARK, { at: [X + 0.03, 1.15 + 0.0, -1.2], name: "podLockRailLow" });

  zs.forEach((z, i) => {
    // backing plate
    b.part(new THREE.BoxGeometry(0.1, 1.2, 0.6), HULL_DARK, { at: [X + 0.05, 2.0, z], name: "lockPlate" });
    // hazard strip on plate
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.5), WARN, { at: [X + 0.11, 2.52, z] });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.5), WARN, { at: [X + 0.11, 1.48, z] });
    // clamp body
    b.part(new THREE.BoxGeometry(0.22, 0.7, 0.42), STEEL_DARK, { at: [X + 0.2, 2.0, z], name: "lockBody" });
    // clamp jaws (top and bottom)
    b.part(new THREE.BoxGeometry(0.3, 0.16, 0.5), STEEL, { at: [X + 0.22, 2.38, z] });
    b.part(new THREE.BoxGeometry(0.3, 0.16, 0.5), STEEL, { at: [X + 0.22, 1.62, z] });
    // locking pin
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8), STEEL, { at: [X + 0.38, 2.0, z], name: "lockPin" });
    // pin caps
    for (const dy of [0.42, -0.42])
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8), BLACK, { at: [X + 0.38, 2.0 + dy, z] });
    // handle
    b.part(new THREE.BoxGeometry(0.14, 0.08, 0.3), BLACK, { at: [X + 0.4, 2.0, z], name: "lockHandle" });
    // bolts on plate
    for (const dz of [-0.22, 0.22])
      for (const dy of [-0.5, 0.5])
        b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), STEEL, {
          at: [X + 0.12, 2.0 + dy, z + dz],
          dir: [1, 0, 0],
        });
    // red lamp housing + lamp
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.16), BLACK, { at: [X + 0.14, 2.0, z + 0.0 + 0.0 - 0.0 + 0.0 + 0.0], name: "lampHousing" });
    const lamp = b.part(new THREE.SphereGeometry(0.06, 6, 4), i === 1 ? LAMP_DIM : LAMP, {
      at: [X + 0.22, 2.0 - 0.0, z + 0.0],
      name: "lockLamp",
    });
    const m = lamp.mesh.material as THREE.MeshStandardMaterial;
    void m;
    // lamp on clamp body upper corner for visibility
    const lamp2 = b.part(new THREE.SphereGeometry(0.045, 6, 4), LAMP, { at: [X + 0.34, 2.28, z + 0.17] });
    void lamp2;
    // cable conduit between locks
    if (i < zs.length - 1)
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 1.5 - 0.6, 6), BLACK, {
        at: [X + 0.12, 2.75, (z + zs[i + 1]) / 2],
        dir: [0, 0, 1],
      });
  });
}
    return addPodLocks;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addAntenna(b: Builder) {
  const BASE: [number, number, number] = [-0.8, 2.95, 2.2];
  const DISH = "#b9c4cf";
  const part = (g: THREE.BufferGeometry, c: string, at: number[], extra: object = {}) =>
    b.part(g, c, { at: at as [number, number, number], ...extra });

  // mounting plate, bolted
  part(new THREE.BoxGeometry(0.58, 0.08, 0.58), STEEL_DARK, [BASE[0], BASE[1] + 0.04, BASE[2]]);
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), STEEL, [BASE[0] + sx * 0.23, BASE[1] + 0.1, BASE[2] + sz * 0.23]);

  // central housing box
  part(new THREE.BoxGeometry(0.3, 0.2, 0.3), HULL_DARK, [BASE[0], BASE[1] + 0.18, BASE[2]]);
  part(new THREE.BoxGeometry(0.32, 0.03, 0.12), CYAN, [BASE[0], BASE[1] + 0.2, BASE[2] + 0.151]);
  glow(b.part(new THREE.BoxGeometry(0.2, 0.025, 0.02), CYAN, { at: [BASE[0], BASE[1] + 0.2, BASE[2] + 0.16] }), 1.4);

  // whip antennas: tilted, with collars, tip lights
  const whips: { x: number; z: number; h: number; tx: number; tz: number }[] = [
    { x: 0.2, z: -0.18, h: 1.15, tx: 0.08, tz: -0.1 },
    { x: -0.2, z: -0.18, h: 0.85, tx: -0.1, tz: -0.05 },
    { x: 0.2, z: 0.2, h: 0.6, tx: 0.05, tz: 0.08 },
  ];
  whips.forEach((w, i) => {
    const bx = BASE[0] + w.x;
    const bz = BASE[2] + w.z;
    const by = BASE[1] + 0.08;
    const tip = new THREE.Vector3(bx + w.tx, by + w.h, bz + w.tz);
    const root = new THREE.Vector3(bx, by, bz);
    part(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 6), STEEL_DARK, [bx, by + 0.05, bz]);
    b.rod(root.clone().setY(by + 0.1), tip, [0.018, 0.006], STEEL, { caps: { start: "flat", end: "point" } });
    const mid = root.clone().lerp(tip, 0.5);
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), WARN, [mid.x, mid.y, mid.z]);
    glow(
      b.part(new THREE.OctahedronGeometry(i === 0 ? 0.045 : 0.035, 0), MAGENTA, { at: [tip.x, tip.y + 0.02, tip.z] }),
      2,
    );
  });

  // small dish on a swivel arm
  const dx = BASE[0] - 0.05;
  const dz = BASE[2] + 0.02;
  part(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 6), STEEL_DARK, [dx - 0.1, BASE[1] + 0.4, dz]);
  const dishY = BASE[1] + 0.62;
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), STEEL, [dx - 0.1, dishY - 0.05, dz]);
  // dish bowl via lathe, facing back-left-up
  b.lathe(
    [
      [0, 0],
      [0.05, 0.01],
      [0.14, 0.06],
      [0.15, 0.075],
      [0.13, 0.07],
      [0.04, 0.02],
      [0, 0.015],
    ],
    {
      at: [dx - 0.1, dishY + 0.02, dz],
      axis: [-0.3, 0.8, -0.5],
      segments: 8,
      color: DISH,
    },
  );
  // feed horn
  b.rod([dx - 0.1, dishY + 0.02, dz], [dx - 0.13, dishY + 0.2, dz - 0.07], 0.012, STEEL_DARK);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), CYAN, { at: [dx - 0.13, dishY + 0.21, dz - 0.07] }), 1.6);

  // warning stripe base tag
  part(new THREE.BoxGeometry(0.2, 0.02, 0.05), WARN, [BASE[0] + 0.05, BASE[1] + 0.09, BASE[2] + 0.29]);
}
    return addAntenna;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addSidePlates(b: Builder) {
  const r = rng(26);
  const PLATE = "#566370";
  const DIRT = paint((p, n) => {
    const g = noise(p, 0.35, 4);
    const low = smoothstep(1.1, 0.5, p.y);
    const c = mix(PLATE, "#2e353d", 0.45 * g + 0.4 * low);
    return mix(c, "#111317", 0.5 * smoothstep(0.6, 0.9, noise(p, 0.12, 9)) * low);
  });
  const BOLT = "#9aa6b0";
  const EXH = "#2a2f36";
  const HOT = "#ff7a2a";

  // ---- side skirt plates (chassis sides) ----
  for (const s of [1, -1]) {
    const zs = [-3.1, -1.7, -0.3, 1.1];
    zs.forEach((z, i) => {
      const x = s * 1.34;
      const y = 0.75 + (i % 2) * 0.02;
      b.part(new THREE.BoxGeometry(0.1, 0.55, 1.3), DIRT, { at: [x, y, z], name: "skirt" });
      // bevel strip on top
      b.part(new THREE.BoxGeometry(0.14, 0.06, 1.3), STEEL_DARK, { at: [x + s * 0.01, y + 0.3, z] });
      // cyan edge trim
      glow(b.part(new THREE.BoxGeometry(0.04, 0.035, 1.24), CYAN, { at: [x + s * 0.07, y - 0.24, z] }), 1.4);
      glow(b.part(new THREE.BoxGeometry(0.04, 0.035, 1.24), CYAN, { at: [x + s * 0.07, y + 0.24, z] }), 1.4);
      // bolts
      for (const dz of [-0.5, 0.5])
        for (const dy of [-0.15, 0.15])
          b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), BOLT, {
            at: [x + s * 0.07, y + dy, z + dz],
            dir: [s, 0, 0],
          });
      // scuff mark
      b.part(new THREE.BoxGeometry(0.02, 0.1, 0.3 + r() * 0.3), BLACK, {
        at: [x + s * 0.06, y - 0.05, z + (r() - 0.5) * 0.4],
      });
    });
    // mounting brackets between plates
    for (const z of [-3.8, -2.4, -1.0, 0.4, 1.8])
      b.part(new THREE.BoxGeometry(0.16, 0.5, 0.1), STEEL_DARK, { at: [s * 1.3, 0.75, z] });
  }

  // ---- twin exhaust stacks behind cab (left side, x=+) ----
  const sx = 1.25;
  [2.15, 2.7].forEach((z, k) => {
    // base mount
    b.part(new THREE.BoxGeometry(0.4, 0.14, 0.4), STEEL_DARK, { at: [sx, 1.1, z] });
    // pipe
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 1.35, 8), EXH, { at: [sx, 1.85, z] });
    // heat shield bands
    for (const y of [1.35, 1.75, 2.15])
      b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 8), STEEL, { at: [sx, y, z] });
    // cap
    b.part(new THREE.CylinderGeometry(0.17, 0.11, 0.12, 8), BLACK, { at: [sx, 2.58, z] });
    // glowing vent
    glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 8), HOT, { at: [sx, 2.65, z] }), 1.6);
    // cap struts
    for (const a of [0, 1, 2, 3]) {
      const ang = (a * Math.PI) / 2 + Math.PI / 4;
      b.part(new THREE.BoxGeometry(0.03, 0.12, 0.03), STEEL, {
        at: [sx + Math.cos(ang) * 0.1, 2.52, z + Math.sin(ang) * 0.1],
      });
    }
    // stay bracket to cab wall
    b.part(new THREE.BoxGeometry(0.2, 0.06, 0.06), STEEL_DARK, { at: [sx - 0.12, 2.0 + k * 0.1, z] });
  });
  // magenta tag light
  glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 0.06), MAGENTA, { at: [sx + 0.12, 1.35, 2.42] }), 1.5);
}
    return addSidePlates;
  })(),
);
