import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, gradient, glow as _unused } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Warhound MX-77 Armored Truck",
  "description": "A low-poly cyberpunk 2077 militarized 6x6 truck with a wedge armored cab, neon-lit hull, weapon turret and a modular cargo bay."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4150",
  hullDark: "#20242e",
  hullLight: "#5b6578",
  plate: "#2b303b",
  trim: "#e7b814",
  trimDark: "#14161c",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonAmber: "#ffa21f",
  neonRed: "#ff2a3a",
  glass: "#0a1a26",
  tire: "#15161a",
  rim: "#7a8190",
  steel: "#8d95a4",
  mud: "#4a3b2a",
  olive: "#4a5238",
  white: "#e9edf2",
  exhaust: "#6a4a38",
};
const M = {
  chassisTop: [0, 1.35, 0] as [number, number, number],
  frontAxle: [0, 0.62, 2.7] as [number, number, number],
  midAxle: [0, 0.62, -1.7] as [number, number, number],
  rearAxle: [0, 0.62, -3] as [number, number, number],
  cabBase: [0, 1.35, 2] as [number, number, number],
  cabRear: [0, 1.35, 0.5] as [number, number, number],
  cargoBase: [0, 1.35, -0.4] as [number, number, number],
  cargoFront: [0, 1.35, 0.4] as [number, number, number],
  turretRing: [0, 2.55, 0.1] as [number, number, number],
  bumperFront: [0, 0.75, 4.1] as [number, number, number],
  rampHinge: [0, 1, -4.1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(77);

  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, ...extra });

  // Paints
  const mudWear = (base: any) =>
    paint((p, n, s) => {
      const c = mix(base, P.mud, 0);
      const low = smoothstep(0.95, 0.45, p.y) * (0.4 + 0.6 * noise(p, 0.25, 4));
      const top = smoothstep(0.3, 1, n.y) * 0.15;
      const m = mix(mix(base, P.mud, low), "#9aa4b6", top);
      return m;
    });
  const HULL = mudWear(panelled(P.hull, { size: 0.3, aspect: 0.6, rivets: 0.06, seam: P.trimDark }));
  const HULLD = mudWear(panelled(P.hullDark, { size: 0.25, aspect: 0.8, rivets: 0.05, seam: P.trimDark }));
  const SOOT = paint((p, n) => mix(P.exhaust, "#14110f", smoothstep(1.4, 2.4, p.y) * 0.8 + 0.2 * noise(p, 0.1, 2)));
  const STEEL = metal("steel", { tarnish: 0.4 });

  // Hazard chevron texture
  const HAZ = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#14161c"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 8} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 16Z" fill="#e7b814"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );

  // Main frame beam box + deck
  box(1.9, 0.42, 8.0, HULLD, [0, 0.9, 0]);
  box(2.7, 0.14, 8.1, HULL, [0, 1.28, 0]);
  box(2.5, 0.06, 7.8, P.plate, [0, 1.35, 0]);
  // under rails
  for (const s of [1, -1]) {
    box(0.12, 0.14, 7.6, STEEL, [s * 0.7, 0.58, 0]);
    box(0.1, 0.1, 7.4, P.trimDark, [s * 0.35, 0.52, 0]);
  }
  for (let i = 0; i < 7; i++) box(1.5, 0.08, 0.1, P.trimDark, [0, 0.55, -3.4 + i * 1.1]);

  // Side skirts with hazard stripes and hex plates
  for (const s of [1, -1]) {
    box(0.16, 0.5, 5.2, HULL, [s * 1.37, 0.85, 0.4]);
    b.part(new THREE.PlaneGeometry(4.6, 0.12), "#ffffff", {
      bone: body, at: [s * 1.46, 0.68, 0.4], dir: [s, 0, 0], axis: "z", texture: HAZ,
    });
    // hex plates
    for (let i = 0; i < 6; i++) {
      const z = -1.8 + i * 0.85;
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 6), P.hullLight, {
        bone: body, at: [s * 1.46, 1.0, z + 0.4], dir: [s, 0, 0],
      });
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, { bone: body, at: [s * 1.5, 1.0, z + 0.4] });
    }
    // underglow
    glow(box(0.06, 0.04, 6.4, P.neonCyan, [s * 1.2, 0.47, 0.2]), 1.6);
    glow(box(0.04, 0.04, 1.2, P.neonCyan, [s * 0.9, 0.46, 3.6]), 1.4);

    // fender arches over each wheel
    for (const z of [2.7, -1.7, -3.0]) {
      b.part(new THREE.CylinderGeometry(0.82, 0.82, 0.55, 12, 1, false, 0, Math.PI), P.hullDark, {
        bone: body, at: [s * 1.3, 0.62, z], dir: [s, 0, 0], rotation: [0, 0, 0], flat: true,
      });
      box(0.62, 0.07, 1.7, P.hull, [s * 1.3, 1.46 - 0.14, z]);
      box(0.6, 0.06, 0.1, P.trim, [s * 1.3, 1.4, z + 0.85]);
      box(0.6, 0.06, 0.1, P.trim, [s * 1.3, 1.4, z - 0.85]);
    }

    // fuel + battery pods
    cyl(0.28, 0.28, 1.5, 8, HULLD, [s * 1.05, 0.62, 0.4], { rotation: [90, 0, 0], flat: true });
    for (const z of [-0.2, 1.0]) cyl(0.3, 0.3, 0.06, 8, P.trim, [s * 1.05, 0.62, z], { rotation: [90, 0, 0] });
    box(0.5, 0.3, 0.8, P.olive, [s * 0.95, 0.66, -1.0 + 0]);
    glow(box(0.3, 0.05, 0.05, P.neonAmber, [s * 0.95, 0.83, -1.0]), 1.2);
    b.part(new THREE.SphereGeometry(0.05, 5, 4), P.neonRed, { bone: body, at: [s * 1.05, 0.9, 1.2] });

    // exhaust stacks behind cab
    cyl(0.1, 0.12, 1.5, 8, SOOT, [s * 1.2, 1.9, 0.62], { flat: true });
    cyl(0.14, 0.1, 0.1, 8, P.trimDark, [s * 1.2, 2.66, 0.62]);
    box(0.08, 1.2, 0.08, STEEL, [s * 1.2, 1.7, 0.5]);

    // tow hooks, bumper
    box(0.12, 0.12, 0.3, P.trim, [s * 0.9, 0.62, 4.15]);
    b.part(new THREE.TorusGeometry(0.08, 0.025, 5, 8), P.steel, { bone: body, at: [s * 0.9, 0.62, 4.32] });

    // mud flaps
    for (const z of [-1.95, -3.35]) {
      box(0.04, 0.5, 0.7, P.tire, [s * 1.3, 0.62, z - 0.35 * 0]);
      box(0.05, 0.1, 0.5, P.trim, [s * 1.3, 0.8, z]);
    }
  }

  // Dozer wedge front bumper
  b.extrude(
    [[-1.45, 0], [1.45, 0], [1.3, 0.5], [-1.3, 0.5]],
    { at: [0, 0.5, 4.1], x: [1, 0, 0], y: [0, 0.4, -1], thickness: [0.45, 0.1], color: HULL, bone: body },
  );
  box(2.9, 0.1, 0.5, P.trim, [0, 0.62, 4.15], { rotation: [-25, 0, 0] });
  for (let i = -3; i <= 3; i++) box(0.12, 0.5, 0.06, P.trimDark, [i * 0.4, 0.74, 4.3], { rotation: [-25, 0, 0] });
  b.part(new THREE.PlaneGeometry(2.4, 0.14), "#ffffff", {
    bone: body, at: [0, 0.8, 4.17], dir: [0, 0.4, 1], axis: "z", texture: HAZ,
  });
  // winch drum
  cyl(0.16, 0.16, 1.0, 8, STEEL, [0, 0.95, 4.15], { rotation: [0, 0, 90] });
  for (const s of [1, -1]) cyl(0.22, 0.22, 0.06, 8, P.trimDark, [s * 0.52, 0.95, 4.15], { rotation: [0, 0, 90] });
  cyl(0.19, 0.19, 0.5, 8, P.trimDark, [0, 0.95, 4.15], { rotation: [0, 0, 90] });
  // skid plates
  box(2.2, 0.06, 1.2, STEEL, [0, 0.45, 3.4], { rotation: [6, 0, 0] });
  box(1.8, 0.06, 1.0, STEEL, [0, 0.45, -3.6], { rotation: [-6, 0, 0] });
  glow(box(2.3, 0.04, 0.05, P.neonCyan, [0, 0.52, 4.3]), 1.6);
  glow(box(1.6, 0.04, 0.05, P.neonMagenta, [0, 0.9, 4.31], { rotation: [-25, 0, 0] }), 1.4);

  // Rear bumper + tail lights
  box(2.9, 0.4, 0.3, HULLD, [0, 0.75, -4.0]);
  box(2.9, 0.1, 0.32, P.trim, [0, 0.98, -4.02]);
  for (let i = 0; i < 6; i++) box(0.2, 0.08, 0.34, P.trimDark, [-1.25 + i * 0.5, 0.98, -4.03], { rotation: [0, 0, 30] });
  for (const s of [1, -1]) {
    glow(box(0.5, 0.18, 0.06, P.neonRed, [s * 1.0, 0.76, -4.17]), 2);
    box(0.62, 0.26, 0.04, P.trimDark, [s * 1.0, 0.76, -4.15]);
    glow(box(0.04, 0.04, 0.05, P.neonAmber, [s * 1.35, 0.62, -4.17]), 1.2);
    b.part(new THREE.TorusGeometry(0.08, 0.025, 5, 8), P.steel, { bone: body, at: [s * 0.6, 0.55, -4.18] });
  }
  // ramp hinge barrel
  cyl(0.07, 0.07, 2.6, 8, STEEL, [0, 1.0, -4.1], { rotation: [0, 0, 90] });

  // Panel rivets on deck
  for (let i = 0; i < 12; i++) {
    const z = -3.6 + i * 0.65;
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.03, 5, 4), P.steel, { bone: body, at: [s * 1.2, 1.4, z] });
  }
  // axle cross members visible
  for (const z of [2.7, -1.7, -3.0]) box(2.0, 0.16, 0.2, P.hullDark, [0, 0.72, z]);
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: any) {
  const cab = J.cab;
  const R = rng(77);
  const Z0 = 0.5, Z1 = 4.0, Y0 = 1.35;

  const wear = paint((p, n) => {
    const base = mix(P.hullLight, P.hull, 0.35 + 0.4 * noise(p, 0.3, 4));
    let c = mix(base, "#8c97aa", 0.35 * smoothstep(0.6, 1, n.y));
    c = mix(c, P.mud, 0.45 * smoothstep(1.75, 1.35, p.y) * noise(p, 0.15, 9));
    c = mix(c, "#111111", 0.5 * smoothstep(0.3, 0.9, noise(p, 0.12, 2)) * smoothstep(3.1, 2.0, p.z) * smoothstep(0.1, 0.6, n.y) * (p.z > 2.8 ? 1 : 0));
    return c;
  });
  const HULL = panelled(wear, { size: 0.35, aspect: 0.8, rivets: 0.08 });
  const DARK = panelled(P.plate, { size: 0.3, rivets: 0.07 });

  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: cab, at, flat: true, ...o });

  // main wedge body via loft stations
  b.loft(
    [
      { at: [0, 1.95, 0.55], w: 2.7, h: 1.2 },
      { at: [0, 1.95, 1.8], w: 2.75, h: 1.2 },
      { at: [0, 1.85, 3.1], w: 2.7, h: 1.0 },
      { at: [0, 1.78, 3.9], w: 2.5, h: 0.85 },
    ],
    { bone: cab, color: HULL, section: "box" } as any,
  );
  // heavy lowered roof (sloped slab)
  b.extrude(
    [[0, 0], [2.2, 0], [1.9, 0.28], [0.35, 0.34], [0.05, 0.2]],
    { at: [-1.2, 2.55, 0.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, color: DARK, bone: cab } as any,
  );
  // fix: extrude centered thickness along x
  // hood wedge
  b.extrude(
    [[0, 0], [1.3, 0], [1.3, 0.12], [0, 0.42]],
    { at: [0, 2.3, 2.7], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: wear, bone: cab, bevel: 0.02 } as any,
  );
  // armored nose plate
  box(2.5, 0.8, 0.2, DARK, [0, 1.9, 3.95], { rotation: [-12, 0, 0] });

  // visor windshield
  const hud = svg(`<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#0a1a26"/>
    <path d="M4 16H40L48 8H80L88 16H124" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <path d="M10 26H50M78 26H118" stroke="#2ff3ff" stroke-width="1.5"/>
    <circle cx="64" cy="16" r="5" stroke="#2ff3ff" stroke-width="1.5" fill="none"/>
    <path d="M64 6V11M64 21V26" stroke="#2ff3ff" stroke-width="1.5"/></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(2.3, 0.5), "#ffffff", {
    bone: cab, at: [0, 2.28, 3.18], dir: [0, 0.35, 1], axis: "z", texture: hud,
  });
  // visor frame
  box(2.45, 0.08, 0.1, P.trimDark, [0, 2.54, 3.12], { rotation: [-18, 0, 0] });
  box(2.45, 0.08, 0.1, P.trimDark, [0, 2.02, 3.22], { rotation: [-18, 0, 0] });

  // emblem
  const badge = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14161c" stroke="#e7b814" stroke-width="4"/>
    <path d="M14 22L22 10L28 20H36L42 10L50 22L46 34L40 40V50H24V40L18 34Z" fill="#e9edf2" stroke="#14161c" stroke-width="2"/>
    <path d="M22 28L30 31L26 36ZM42 28L34 31L38 36Z" fill="#ff2a3a"/><path d="M28 44H36" stroke="#14161c" stroke-width="2"/></svg>`, { size: 128 });
  const hazard = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#14161c"/>
    <path d="M0 16L10 0H22L12 16ZM24 16L34 0H46L36 16ZM48 16L58 0H70L60 16Z" fill="#e7b814"/></svg>`, { size: 128 });

  for (const s of [1, -1]) {
    const x = s * 1.38;
    // side door
    box(0.06, 1.0, 1.5, DARK, [x, 1.95, 1.6]);
    box(0.04, 0.02, 1.5, P.trimDark, [x + s * 0.03, 1.95, 1.6]);
    box(0.04, 1.0, 0.02, P.trimDark, [x + s * 0.03, 1.95, 0.85]);
    box(0.04, 1.0, 0.02, P.trimDark, [x + s * 0.03, 1.95, 2.35]);
    box(0.08, 0.06, 0.24, P.steel, [x + s * 0.05, 2.0, 2.15]);
    b.part(new THREE.CircleGeometry(0.28, 12), "#ffffff", { bone: cab, at: [x + s * 0.04, 1.7, 1.6], dir: [s, 0, 0], axis: "z", texture: badge });
    // armored window + shutter
    box(0.07, 0.34, 0.9, P.glass, [x + s * 0.01, 2.3, 1.5]);
    for (let i = 0; i < 4; i++) box(0.09, 0.05, 0.9, P.trimDark, [x + s * 0.02, 2.4 - i * 0.09, 1.5]);
    box(0.1, 0.4, 0.06, P.hullDark, [x + s * 0.02, 2.3, 1.0]);
    box(0.1, 0.4, 0.06, P.hullDark, [x + s * 0.02, 2.3, 2.0]);
    // hazard stripe
    b.part(new THREE.PlaneGeometry(1.4, 0.14), "#ffffff", { bone: cab, at: [x + s * 0.035, 1.5, 1.6], dir: [s, 0, 0], axis: "z", texture: hazard });
    // mirror
    b.rod([s * 1.4, 2.25, 2.4], [s * 1.75, 2.45, 2.55], 0.025, P.steel, { bone: cab });
    box(0.08, 0.3, 0.2, P.hullDark, [s * 1.78, 2.45, 2.55]);
    box(0.02, 0.26, 0.16, P.glass, [s * 1.78, 2.45, 2.65]);
    // headlights
    glow(box(0.4, 0.2, 0.08, "#ffffff", [s * 0.9, 1.78, 4.04]), 2);
    box(0.5, 0.28, 0.05, P.trimDark, [s * 0.9, 1.78, 4.0]);
    // vents on hood
    for (let i = 0; i < 4; i++) box(0.4, 0.03, 0.06, P.trimDark, [s * 0.8, 2.42 - i * 0.02, 2.4 + i * 0.16], { rotation: [-8, 0, 0] });
    // cheek armor
    box(0.12, 0.7, 1.3, P.plate, [s * 1.34, 1.7, 3.3], { rotation: [0, s * 6, 0] });
    // roof antenna
    b.rod([s * 1.1, 2.8, 0.8], [s * 1.2, 3.55, 0.7], 0.012, P.steel, { bone: cab });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: cab, at: [s * 1.2, 3.57, 0.7] }), 2);
  }
  // hood emblem
  b.part(new THREE.CircleGeometry(0.3, 12), "#ffffff", { bone: cab, at: [0, 2.44, 2.9], dir: [0, 1, 0.1], axis: "z", texture: badge });

  // grille with neon strips
  box(1.1, 0.5, 0.08, P.trimDark, [0, 1.75, 4.04]);
  for (let i = 0; i < 4; i++) glow(box(1.0, 0.04, 0.03, P.neonMagenta, [0, 1.58 + i * 0.12, 4.09]), 2);
  box(0.04, 0.5, 0.04, P.steel, [0, 1.75, 4.1]);

  // roof light bar
  box(2.2, 0.14, 0.3, P.trimDark, [0, 2.95, 1.0]);
  const cols = [P.neonAmber, P.white, P.neonAmber, P.white, P.neonAmber, P.white, P.neonAmber];
  cols.forEach((c, i) => glow(box(0.26, 0.1, 0.24, c, [-0.9 + i * 0.3, 3.05, 1.0]), 2.2));
  box(0.1, 0.12, 0.1, P.steel, [-0.9, 2.88, 1.0]);
  box(0.1, 0.12, 0.1, P.steel, [0.9, 2.88, 1.0]);

  // sensor dome
  b.part(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.hullDark, { bone: cab, at: [0, 2.78, 1.9] });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonCyan, { bone: cab, at: [0, 2.9, 2.0] }), 2);
  b.part(new THREE.CylinderGeometry(0.26, 0.3, 0.08, 8), P.steel, { bone: cab, at: [0, 2.72, 1.9] });

  // tow-cable rack on roof rear
  for (const s of [1, -1]) box(0.05, 0.14, 0.6, P.steel, [s * 0.5, 2.8, 0.85]);
  for (let i = 0; i < 3; i++) b.capsule([-0.5, 2.9, 0.65 + i * 0.1], [0.5, 2.9, 0.65 + i * 0.1], 0.04, P.trimDark, { bone: cab });

  // rear wall meets cargo
  box(2.7, 1.1, 0.12, P.hullDark, [0, 2.0, 0.56]);
  // neon edge lines
  for (const s of [1, -1]) glow(box(0.04, 0.04, 1.2, P.neonCyan, [s * 1.41, 1.42, 1.7]), 2);
  // rivet row on door sills
  for (let i = 0; i < 10; i++) for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.02, 4, 3), P.steel, { bone: cab, at: [s * 1.4, 1.38, 0.8 + i * 0.33] });
}
    return buildCab;
  })(),
  // cargo
  (() => {
function buildCargo({ b, J, P, M }: { b: any; J: any; P: any; M: any }) {
  const R = rng(77);
  const body = J.body;
  const ramp = J.ramp;

  // ---------- helpers ----------
  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: o.bone ?? body, at: [x, y, z], ...o.extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: o.bone ?? body, at, ...o.extra });
  const plane = (w: number, h: number, at: number[], dir: number[], tex: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), o.tint ?? "#ffffff", {
      bone: o.bone ?? body, at, dir, axis: "z", texture: tex,
    });
  const mergeAt = (geos: THREE.BufferGeometry[], color: any, bone: any) => {
    if (!geos.length) return;
    const m = mergeGeometries(geos);
    if (m) b.part(m, color, { bone, at: [0, 0, 0] });
  };

  // ---------- textures ----------
  let hz = "";
  for (let i = -2; i < 10; i++) hz += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="${P.trim}"/>`;
  const HAZARD = svg(`<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="${P.trimDark}"/>${hz}<rect x="0.5" y="0.5" width="63" height="15" fill="none" stroke="#000" stroke-width="1"/></svg>`, { size: 256 });

  let slats = "";
  for (let i = 0; i < 8; i++) slats += `<rect x="3" y="${4 + i * 7}" width="58" height="3.5" fill="${P.neonCyan}"/>`;
  const VENT = svg(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="4" fill="#06141a" stroke="${P.steel}" stroke-width="3"/>${slats}</svg>`, { size: 128 });

  const UNIT = svg(`<svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="156" height="60" rx="6" fill="none" stroke="${P.white}" stroke-width="3" stroke-dasharray="14 5"/>
    <text x="80" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="34" fill="${P.white}">WH-03</text>
    <text x="80" y="56" text-anchor="middle" font-family="monospace" font-size="12" fill="${P.neonAmber}">CARGO // MX-77</text></svg>`, { size: 256 });

  const STENCIL = svg(`<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
    <text x="64" y="20" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="${P.white}">HAZMAT / AMMO</text>
    <text x="64" y="40" text-anchor="middle" font-family="monospace" font-size="11" fill="${P.neonAmber}">DO NOT OPEN IN FIRE</text>
    <path d="M6 44 L16 26 L26 44Z" fill="none" stroke="${P.neonAmber}" stroke-width="3"/></svg>`, { size: 256 });

  const EMBLEM = svg(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="${P.hullDark}" stroke="${P.trim}" stroke-width="3"/>
    <path d="M18 24 L26 18 L32 24 L38 18 L46 24 L44 40 L32 50 L20 40Z" fill="${P.white}"/>
    <rect x="23" y="29" width="7" height="5" fill="${P.hullDark}"/><rect x="34" y="29" width="7" height="5" fill="${P.hullDark}"/></svg>`, { size: 128 });

  const BEACON = svg(`<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="8" fill="${P.neonAmber}"/></svg>`, { size: 8 });

  // ---------- paints ----------
  const wallBase = paint((p, n) => {
    const top = smoothstep(0.2, 0.9, n.y);
    const c = mix(P.hull, P.hullLight, top * 0.7);
    return mix(c, P.hullDark, smoothstep(0.1, -0.8, n.y) * 0.6);
  });
  const WALL = gradient(P.mud, panelled(wallBase, { size: 0.5, aspect: 0.8, rivets: 0.12 }), [0, 1.38, 0], [0, 1.85, 0]);
  const OLIVE = gradient(P.mud, panelled(P.olive, { size: 0.45, aspect: 0.9, rivets: 0.1 }), [0, 1.38, 0], [0, 1.8, 0]);
  const ROOF = panelled(mix(P.hullLight, P.hull, 0.4), { size: 0.4, rivets: 0.1 });

  // ---------- main container ----------
  bx(2.6, 1.07, 4.4, 0, 1.915, -1.8, WALL); // y 1.38..2.45, z -4.0..0.4
  bx(2.5, 0.05, 4.3, 0, 2.475, -1.82, ROOF); // roof plate
  // olive plate insets on both sides
  for (const s of [1, -1]) {
    for (const z of [-0.9, -2.3, -3.3]) {
      const len = z === -0.9 ? 1.2 : z === -2.3 ? 1.4 : 0.8;
      bx(0.04, 0.8, len, s * 1.32, 1.95, z, OLIVE);
    }
  }
  // base sill
  bx(2.7, 0.08, 4.4, 0, 1.4, -1.8, P.hullDark);
  // ribs on sides
  const ribGeo: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 9; i++) {
      const z = -3.75 + i * 0.5;
      ribGeo.push(new THREE.BoxGeometry(0.05, 0.98, 0.07).translate(s * 1.325, 1.92, z));
    }
  mergeAt(ribGeo, P.plate, body);
  // front wall ribs
  const fr: THREE.BufferGeometry[] = [];
  for (let i = -2; i <= 2; i++) fr.push(new THREE.BoxGeometry(0.07, 0.98, 0.04).translate(i * 0.5, 1.92, 0.42));
  mergeAt(fr, P.plate, body);
  // horizontal belt bands
  for (const s of [1, -1]) bx(0.05, 0.06, 4.3, s * 1.325, 2.38, -1.82, P.trimDark);
  bx(2.62, 0.06, 0.05, 0, 2.38, 0.41, P.trimDark);

  // corner posts
  for (const sx of [1, -1])
    for (const [z, d] of [[-4.0, 0.2], [0.33, 0.14]] as number[][]) {
      bx(0.18, 1.13, d, sx * 1.3, 1.93, z, P.hullDark);
      bx(0.2, 0.06, d + 0.04, sx * 1.3, 2.5, z, P.steel);
    }

  // rivets
  const rv: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 9; i++) {
      const z = -3.75 + i * 0.5;
      for (const y of [1.55, 1.95, 2.3]) {
        const g = new THREE.SphereGeometry(0.022, 5, 3);
        g.translate(s * 1.355, y, z + 0.1);
        rv.push(g);
      }
    }
  mergeAt(rv, P.steel, body);

  // ---------- side lockers with hazard stripes ----------
  for (const s of [1, -1]) {
    bx(0.12, 0.62, 1.3, s * 1.34, 1.72, -2.9, P.plate);
    bx(0.12, 0.62, 1.1, s * 1.34, 1.72, -1.3, P.hullDark);
    plane(1.2, 0.16, [s * 1.405, 1.55, -2.9], [s, 0, 0], HAZARD);
    plane(1.0, 0.14, [s * 1.405, 1.55, -1.3], [s, 0, 0], HAZARD);
    // handles
    bx(0.04, 0.05, 0.3, s * 1.41, 1.85, -2.9, P.steel);
    bx(0.04, 0.05, 0.3, s * 1.41, 1.85, -1.3, P.steel);
    // locker seams
    bx(0.02, 0.62, 0.03, s * 1.405, 1.72, -2.9, P.trimDark);
    bx(0.02, 0.62, 0.03, s * 1.405, 1.72, -1.3, P.trimDark);
  }

  // glowing vent grilles
  for (const s of [1, -1]) {
    glow(plane(0.8, 0.4, [s * 1.37, 2.12, -0.45], [s, 0, 0], VENT), 1.3);
    bx(0.05, 0.46, 0.86, s * 1.34, 2.12, -0.45, P.hullDark);
  }
  glow(plane(0.9, 0.35, [0.55, 2.1, 0.43], [0, 0, 1], VENT), 1.2);

  // unit number, stencil, emblem
  plane(1.5, 0.6, [-1.372, 2.12, -2.3], [-1, 0, 0], UNIT);
  plane(1.5, 0.56, [1.372, 2.08, -2.3], [1, 0, 0], STENCIL);
  plane(0.5, 0.5, [-1.372, 2.0, -0.45], [-1, 0, 0], EMBLEM);
  plane(0.5, 0.5, [-0.45, 2.1, 0.43], [0, 0, 1], EMBLEM);

  // ---------- cable conduits ----------
  for (const s of [1, -1]) {
    b.rod([s * 1.38, 2.22, -3.9], [s * 1.38, 2.22, -0.1], 0.03, P.trimDark, { bone: body });
    for (let i = 0; i < 6; i++) bx(0.07, 0.09, 0.07, s * 1.38, 2.22, -3.8 + i * 0.7, P.steel);
    b.rod([s * 1.38, 2.22, -0.1], [s * 1.38, 1.9, -0.1], 0.03, P.trimDark, { bone: body });
  }

  // ---------- roof: rails, hatches, tie-downs, beacon, masts ----------
  for (const s of [1, -1]) {
    b.rod([s * 1.15, 2.6, -3.8], [s * 1.15, 2.6, -0.8], 0.025, P.steel, { bone: body });
    for (const z of [-3.8, -2.8, -1.8, -0.8]) b.rod([s * 1.15, 2.5, z], [s * 1.15, 2.6, z], 0.025, P.steel, { bone: body });
  }
  b.rod([-1.15, 2.6, -3.8], [1.15, 2.6, -3.8], 0.022, P.steel, { bone: body });
  for (const z of [-1.4, -3.0]) {
    bx(0.9, 0.07, 0.9, 0, 2.535, z, P.hull);
    bx(0.8, 0.03, 0.8, 0, 2.57, z, P.plate);
    bx(0.3, 0.05, 0.05, 0, 2.6, z + 0.15, P.trim);
    bx(0.92, 0.02, 0.92, 0, 2.505, z, P.trimDark);
    for (const sx of [1, -1]) bx(0.06, 0.07, 0.1, sx * 0.4, 2.54, z - 0.4, P.steel);
  }
  const ties: THREE.BufferGeometry[] = [];
  for (const sx of [1, -1])
    for (const z of [-3.6, -2.2, -0.9]) {
      const g = new THREE.TorusGeometry(0.06, 0.014, 4, 6);
      g.rotateY(Math.PI / 2);
      g.translate(sx * 1.0, 2.52, z);
      ties.push(g);
    }
  mergeAt(ties, P.steel, body);

  // beacon
  cyl(0.14, 0.17, 0.05, 8, [0.85, 2.52, -3.7], P.trimDark);
  glow(b.part(new THREE.SphereGeometry(0.11, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.neonAmber, { bone: body, at: [0.85, 2.545, -3.7] }), 1.8);
  cyl(0.02, 0.02, 0.14, 4, [0.85, 2.6, -3.7], P.white);

  // antenna masts
  for (const s of [1, -1]) {
    b.spike([s * 1.2, 2.5, -3.9], [0, 1, 0], 0.2, 0.025, { color: P.trimDark, bone: body });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: body, at: [s * 1.2, 2.71, -3.9] }), 2);
  }

  // ---------- turret mount ring plate ----------
  const tr = M.turretRing;
  cyl(0.85, 0.9, 0.06, 8, [tr[0], 2.5, tr[2]], P.hullDark);
  cyl(0.75, 0.75, 0.04, 8, [tr[0], 2.53, tr[2]], P.steel);
  cyl(0.55, 0.55, 0.02, 8, [tr[0], 2.55, tr[2]], P.plate);
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    bolts.push(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6).translate(tr[0] + Math.cos(a) * 0.65, 2.55, tr[2] + Math.sin(a) * 0.65));
  }
  mergeAt(bolts, P.trim, body);
  glow(b.part(new THREE.TorusGeometry(0.8, 0.012, 4, 16), P.neonCyan, { bone: body, at: [tr[0], 2.535, tr[2]], rotation: [90, 0, 0] }), 1.5);

  // front-top skirt guard of the bay (against cab)
  bx(2.5, 0.12, 0.08, 0, 2.5, 0.35, P.hullDark);

  // ---------- rear: frame, door, ramp ----------
  bx(2.6, 0.12, 0.1, 0, 1.45, -4.02, P.hullDark);
  bx(0.1, 1.1, 0.12, 1.26, 1.92, -4.04, P.plate);
  bx(0.1, 1.1, 0.12, -1.26, 1.92, -4.04, P.plate);
  bx(2.6, 0.1, 0.12, 0, 2.47, -4.04, P.plate);
  // red-ish dim door latch lights (decor)
  // ramp / rear door panel on ramp joint
  const rampPaint = panelled(mix(P.hull, P.olive, 0.4), { size: 0.5, aspect: 0.8, rivets: 0.1 });
  const rp = { bone: ramp };
  b.part(new THREE.BoxGeometry(2.5, 1.5, 0.07), rampPaint, { ...rp, at: [0, 1.82, -4.07] });
  bx(0.03, 1.5, 0.03, 0, 1.82, -4.115, P.trimDark, rp);
  bx(0.05, 1.5, 0.03, 0.02, 1.82, -4.113, P.trimDark, rp);
  bx(0.05, 1.5, 0.03, -0.02, 1.82, -4.113, P.trimDark, rp);
  plane(2.3, 0.3, [0, 1.2, -4.108], [0, 0, -1], HAZARD, rp);
  plane(1.0, 0.38, [0.6, 2.0, -4.109], [0, 0, -1], STENCIL, rp);
  plane(0.4, 0.4, [-0.7, 2.05, -4.109], [0, 0, -1], EMBLEM, rp);
  for (const s of [1, -1]) {
    bx(0.05, 0.3, 0.06, s * 0.14, 1.85, -4.14, P.steel, rp);
    bx(0.06, 0.06, 0.1, s * 0.14, 1.85, -4.17, P.steel, rp);
    bx(0.12, 0.12, 0.1, s * 1.18, 1.1, -4.1, P.steel, rp); // hinge knuckles
    bx(0.12, 0.12, 0.1, s * 1.18, 2.5, -4.1, P.steel, rp); // lock lugs
    // hydraulic pistons
    b.rod([s * 1.15, 1.55, -3.95], [s * 1.15, 1.45, -4.2], 0.05, P.steel, { bone: body });
    b.rod([s * 1.15, 1.45, -4.2], [s * 1.15, 1.25, -4.2], 0.032, P.rim, { bone: ramp });
    cyl(0.06, 0.06, 0.12, 6, [s * 1.15, 1.55, -3.95], P.trimDark, { extra: { rotation: [0, 0, 90] } });
  }
  const rrv: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) for (const y of [1.15, 2.45]) rrv.push(new THREE.SphereGeometry(0.02, 5, 3).translate(-1.1 + i * 0.275, y, -4.12));
  mergeAt(rrv, P.steel, ramp);

  // lower tail strip mounting plate
  bx(1.4, 0.08, 0.1, 0, 1.4, -4.05, P.trim);

  // small side vents on roof edge (decor)
  for (const s of [1, -1]) {
    const v: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 4; i++) v.push(new THREE.BoxGeometry(0.03, 0.12, 0.28).translate(s * 1.31, 2.3, -3.6 + i * 0.2 + R() * 0.0));
    mergeAt(v, P.trimDark, body);
  }
}
    return buildCargo;
  })(),
  // turret
  (() => {
type Ctx = { b: any; J: any; P: any; M: any };

function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const [rx, ry, rz] = M.turretRing;

  const HULLP = panelled(P.hullLight, { size: 0.22, rivets: 0.05 });
  const DARKP = panelled(P.hull, { size: 0.18, rivets: 0.04 });
  const GUN = metal("iron", { tarnish: 0.5 });
  const SOOT = paint((p, n) => {
    const t = Math.max(0, Math.min(1, (p.z - 0.4) / 1.4));
    const c = new THREE.Color(P.steel).lerp(new THREE.Color("#15161a"), t * 0.7 + (n.y < 0 ? 0.2 : 0));
    return [c.r, c.g, c.b] as any;
  });

  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---- textures
  const stripe = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#14161c"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const kills = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#20242e"/>${[0, 1, 2, 3, 4, 5]
      .map(
        (i) =>
          `<circle cx="${8 + i * 9}" cy="9" r="3.4" fill="#e9edf2"/><rect x="${6.4 + i * 9}" y="12" width="3.2" height="3" fill="#e9edf2"/><circle cx="${7 + i * 9}" cy="8.5" r="0.9" fill="#20242e"/><circle cx="${9 + i * 9}" cy="8.5" r="0.9" fill="#20242e"/>`,
      )
      .join("")}<path d="M5 22h54M5 26h54" stroke="#ff2a3a" stroke-width="1.6"/></svg>`,
    { size: 192 },
  );
  const reticle = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#2ff3ff" stroke-width="2.5"/><path d="M16 1v8M16 23v8M1 16h8M23 16h8" stroke="#2ff3ff" stroke-width="2.5"/><circle cx="16" cy="16" r="3" fill="#ff2bd6"/></svg>`,
    { size: 128 },
  );

  // ---- base ring (on yaw)
  const ringTop = ry + 0.12;
  b.part(cyl(0.78, 0.86, 0.12, 8), DARKP, { bone: yaw, at: [rx, ry + 0.06, rz], name: "turretRingBase" });
  b.part(cyl(0.66, 0.74, 0.1, 8), P.hullDark, { bone: yaw, at: [rx, ringTop + 0.05, rz] });
  // ring rim lights
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    glow(
      b.part(box(0.07, 0.04, 0.07), P.neonCyan, {
        bone: yaw,
        at: [rx + Math.sin(a) * 0.86, ry + 0.07, rz + Math.cos(a) * 0.86],
        rotation: [0, (a * 180) / Math.PI, 0],
      }),
      1.4,
    );
  }
  // hazard band
  b.part(cyl(0.805, 0.805, 0.04, 8), stripe, { bone: yaw, at: [rx, ry + 0.115, rz], texture: undefined, color: P.trim });

  // ---- housing
  const hy = ringTop + 0.32;
  b.part(box(1.3, 0.5, 1.1), HULLP, { bone: yaw, at: [rx, hy, rz + 0.1] });
  // sloped front glacis
  b.extrude(
    [
      [0, 0],
      [0.6, 0],
      [0.45, 0.4],
      [0, 0.4],
    ],
    { at: [rx - 0.65, hy - 0.2, rz + 0.65], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.3, color: HULLP, bone: yaw },
  );
  // roof wedge
  b.extrude(
    [
      [-0.55, 0],
      [0.55, 0],
      [0.38, 0.14],
      [-0.38, 0.14],
    ],
    { at: [rx, hy + 0.25, rz + 0.1], x: [1, 0, 0], thickness: 1.0, color: P.hullLight, bone: yaw },
  );
  // hex plates on sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(cyl(0.13, 0.13, 0.03, 6), P.plate, {
        bone: yaw,
        at: [rx + s * 0.66, hy + (i === 1 ? 0.05 : -0.07), rz - 0.25 + i * 0.3],
        dir: [s, 0, 0],
      });
    }
    // vent slats
    for (let i = 0; i < 4; i++)
      b.part(box(0.02, 0.025, 0.28), P.trimDark, { bone: yaw, at: [rx + s * 0.67, hy + 0.2 - i * 0.045, rz - 0.35] });
  }
  // rear bustle
  b.part(box(1.1, 0.4, 0.2), DARKP, { bone: yaw, at: [rx, hy - 0.02, rz - 0.55] });
  for (const s of [1, -1]) {
    glow(b.part(box(0.14, 0.06, 0.03), P.neonRed, { bone: yaw, at: [rx + s * 0.4, hy, rz - 0.66] }), 1.5);
  }
  // kill tally on rear-left cheek
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    bone: yaw,
    at: [rx + 0.664, hy + 0.12, rz + 0.35],
    dir: [1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture: kills,
  });

  // ---- gunner shield (front of housing, behind gun cradle) is on yaw
  b.extrude(
    [
      [-0.5, 0],
      [0.5, 0],
      [0.42, 0.34],
      [-0.42, 0.34],
    ],
    { at: [rx, hy + 0.3, rz + 0.82], x: [1, 0, 0], thickness: 0.06, color: P.hullDark, bone: yaw, bevel: 0.01 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 0.1), P.trim, {
    bone: yaw,
    at: [rx, hy + 0.34, rz + 0.855],
    dir: [0, 0, 1],
    axis: "z",
    texture: stripe,
  });

  // ---- ammo box + belt (left side)
  const ax = rx + 0.82;
  const ay = hy - 0.1;
  b.part(box(0.28, 0.3, 0.4), P.olive, { bone: yaw, at: [ax, ay, rz + 0.3] });
  b.part(box(0.3, 0.05, 0.42), P.trimDark, { bone: yaw, at: [ax, ay + 0.17, rz + 0.3] });
  b.part(box(0.04, 0.12, 0.16), P.trim, { bone: yaw, at: [ax + 0.15, ay, rz + 0.3] });
  const links: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const g = box(0.05, 0.04, 0.07);
    g.rotateZ(-t * 0.9);
    g.translate(ax - 0.1 - t * 0.2, ay + 0.2 + Math.sin(t * Math.PI) * 0.1 + t * 0.16, rz + 0.5 + t * 0.35);
    links.push(g);
  }
  // merged inline for budget
  const merged = mergeG(links);
  b.part(merged, P.steel, { bone: yaw, at: [0, 0, 0] });

  // ---- missile pod (right side)
  const px = rx - 0.88;
  const py = hy + 0.05;
  b.part(box(0.36, 0.36, 0.6), P.olive, { bone: yaw, at: [px, py, rz + 0.1] });
  for (const [dx, dy] of [
    [-0.08, -0.08],
    [0.08, -0.08],
    [-0.08, 0.08],
    [0.08, 0.08],
  ]) {
    b.part(cyl(0.065, 0.065, 0.12, 8), P.trimDark, { bone: yaw, at: [px + dx, py + dy, rz + 0.42], dir: [0, 0, 1] });
    glow(b.part(cyl(0.035, 0.035, 0.02, 6), P.neonAmber, { bone: yaw, at: [px + dx, py + dy, rz + 0.39], dir: [0, 0, 1] }), 0.8);
  }
  b.part(new THREE.PlaneGeometry(0.36, 0.1), P.trim, {
    bone: yaw,
    at: [px, py - 0.26, rz + 0.1],
    dir: [0, 0, 1],
    axis: "z",
    texture: stripe,
  });
  b.part(box(0.12, 0.3, 0.12), P.hullDark, { bone: yaw, at: [px + 0.15, py - 0.1, rz + 0.1] });
  b.part(box(0.37, 0.05, 0.6), P.trim, { bone: yaw, at: [px, py + 0.2, rz + 0.1] });

  // ---- sensor mast on top (yaw)
  b.part(cyl(0.05, 0.07, 0.2, 6), P.hullDark, { bone: yaw, at: [rx - 0.35, hy + 0.42, rz - 0.25] });
  glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), P.neonCyan, { bone: yaw, at: [rx - 0.35, hy + 0.57, rz - 0.25] }), 1.6);
  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    bone: yaw,
    at: [rx - 0.35, hy + 0.57, rz - 0.15],
    dir: [0, 0, 1],
    axis: "z",
    texture: reticle,
  });
  glow(b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    bone: yaw, at: [rx - 0.35, hy + 0.57, rz - 0.148], dir: [0, 0, 1], axis: "z", texture: reticle }), 1.2);
  // laser designator
  b.part(cyl(0.035, 0.035, 0.2, 6), P.hullDark, { bone: yaw, at: [rx + 0.35, hy + 0.4, rz + 0.1], dir: [0, 0, 1] });
  glow(b.part(cyl(0.026, 0.026, 0.02, 6), P.neonMagenta, { bone: yaw, at: [rx + 0.35, hy + 0.4, rz + 0.21], dir: [0, 0, 1] }), 2);
  b.part(box(0.1, 0.1, 0.1), P.hullDark, { bone: yaw, at: [rx + 0.35, hy + 0.32, rz + 0.0] });

  // ---- gun cradle on pitch
  const gy = pitch.at.y;
  const gz0 = pitch.at.z;
  b.part(box(0.5, 0.34, 0.3), SOOT, { bone: pitch, at: [rx, gy, gz0 - 0.05] });
  for (const s of [1, -1]) {
    b.part(cyl(0.08, 0.08, 0.08, 8), P.steel, { bone: pitch, at: [rx + s * 0.28, gy, gz0], dir: [1, 0, 0] });
    // shroud
    const bx = rx + s * 0.15;
    b.part(box(0.17, 0.17, 0.62), GUN, { bone: pitch, at: [bx, gy, gz0 + 0.45] });
    b.part(cyl(0.055, 0.055, 0.9, 8), P.trimDark, { bone: pitch, at: [bx, gy, gz0 + 0.95], dir: [0, 0, 1] });
    // cooling fins
    for (let i = 0; i < 5; i++)
      b.part(cyl(0.1, 0.1, 0.018, 8), P.steel, { bone: pitch, at: [bx, gy, gz0 + 0.2 + i * 0.1], dir: [0, 0, 1] });
    // muzzle brake
    b.part(box(0.13, 0.13, 0.16), P.hullDark, { bone: pitch, at: [bx, gy, gz0 + 1.46] });
    for (const dz of [-0.04, 0.04])
      b.part(box(0.15, 0.04, 0.02), P.steel, { bone: pitch, at: [bx, gy, gz0 + 1.46 + dz] });
    glow(b.part(cyl(0.03, 0.03, 0.02, 6), P.neonCyan, { bone: pitch, at: [bx, gy + 0.1, gz0 + 0.5], dir: [0, 0, 1] }), 1.2);
  }
  // hazard on shroud top
  b.part(new THREE.PlaneGeometry(0.5, 0.1), P.trim, {
    bone: pitch,
    at: [rx, gy + 0.19, gz0 + 0.45],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: stripe,
  });
}

function mergeG(gs: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let pos: number[] = [];
  let idx: number[] = [];
  let nor: number[] = [];
  let uv: number[] = [];
  let off = 0;
  for (const g of gs) {
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    const u = g.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
      uv.push(u.getX(i), u.getY(i));
    }
    const ix = g.index!;
    for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
    off += p.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  m.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  m.setIndex(idx);
  return m;
}
    return buildTurret;
  })(),
  // wheels
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.5;
  const rand = rng(77);

  // ---- textures ----
  const SIDEWALL = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="none" stroke="#e9edf2" stroke-width="3" stroke-dasharray="10 6"/>
      <circle cx="64" cy="64" r="48" fill="none" stroke="#e9edf2" stroke-width="2"/>
      <text x="64" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#e9edf2">WARHOUND</text>
      <text x="64" y="112" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#e9edf2">MX-77 · ALL-TERRAIN</text>
      <path d="M20 64 L30 58 L30 70Z M108 64 L98 58 L98 70Z" fill="#ffa21f"/>
    </svg>`,
    { size: 256 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#e7b814"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#14161c"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const HEXRIM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="49" fill="#7a8190"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#2b303b" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * Math.PI) / 3; return `<circle cx="${50 + 33 * Math.cos(a)}" cy="${50 + 33 * Math.sin(a)}" r="5" fill="#20242e" stroke="#e9edf2" stroke-width="1.5"/>`; }).join("")}
    <path d="M50 22 L74 36 L74 64 L50 78 L26 64 L26 36Z" fill="none" stroke="#2b303b" stroke-width="3"/></svg>`,
    { size: 192 },
  );

  // ---- paints ----
  const TREAD = paint((p, n) => {
    const m = noise(p, 0.12, 5);
    const base = mix(P.tire, P.mud, smoothstep(0.35, 0.8, m) * 0.7 + (1 - smoothstep(-0.3, 0.6, n.y)) * 0.0);
    return mix(base, "#6a5a40", smoothstep(0.55, 0.9, noise(p, 0.05, 9)) * 0.35);
  });
  const SIDE = paint((p, n) => {
    const low = smoothstep(0.9, 0.0, p.y) * 0.5;
    return mix(P.tire, P.mud, low * smoothstep(0.3, 0.7, noise(p, 0.1, 3)));
  });
  const HOUSING = paint((p, n) => mix(P.hullDark, P.mud, smoothstep(0.7, 0.2, p.y) * 0.6 + smoothstep(0.4, 0.7, noise(p, 0.08, 2)) * 0.15));
  const STEELP = paint((p, n) => mix(P.steel, "#c8cfdb", smoothstep(0.4, 1, n.y) * 0.5));

  const joints: [string, number][] = [["wheelFL", 1], ["wheelFR", -1], ["wheelML", 1], ["wheelMR", -1], ["wheelRL", 1], ["wheelRR", -1]];

  const cylX = (r0: number, r1: number, len: number, seg: number) => new THREE.CylinderGeometry(r1, r0, len, seg).rotateZ(Math.PI / 2);

  for (const [name, s] of joints) {
    const j = J[name];
    const at = j.at;
    const X = (d: number) => [at.x + s * d, at.y, at.z] as [number, number, number];
    const dirOut: [number, number, number] = [s, 0, 0];

    // tire: tread ring + two sidewalls
    const tread = new THREE.CylinderGeometry(R, R, W * 0.78, 12, 1);
    tread.rotateZ(Math.PI / 2);
    b.part(tread, TREAD, { bone: j, at: X(0), flat: true });
    for (const side of [-1, 1]) {
      const sw = new THREE.CylinderGeometry(R * 0.93, R * 0.99, W * 0.16, 12).rotateZ(Math.PI / 2);
      b.part(sw, SIDE, { bone: j, at: X(side * W * 0.4), flat: true });
    }
    // tread blocks
    const blocks: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.26;
      for (const k of [-1, 1]) {
        const g = new THREE.BoxGeometry(W * 0.3, 0.07, 0.15);
        g.rotateX(0).translate(k * W * 0.2, 0, 0);
        g.translate(0, R + 0.012, 0);
        g.rotateX(a);
        blocks.push(g);
      }
    }
    b.part(mergeAll(blocks), P.tire, { bone: j, at: X(0), flat: true });
    // sidewall lettering decal on outer face
    b.part(new THREE.CircleGeometry(R * 0.9, 24), "#ffffff", {
      bone: j, at: X(W * 0.485), dir: dirOut, axis: "z", texture: SIDEWALL,
    });
    // rim
    const rim = new THREE.CylinderGeometry(R * 0.62, R * 0.62, W * 0.7, 6).rotateZ(Math.PI / 2);
    b.part(rim, STEELP, { bone: j, at: X(0.0), flat: true });
    b.part(new THREE.CircleGeometry(R * 0.6, 6), "#ffffff", {
      bone: j, at: X(W * 0.36), dir: dirOut, axis: "z", texture: HEXRIM,
    });
    // neon ring
    const ring = glow(
      b.part(new THREE.TorusGeometry(R * 0.58, 0.018, 4, 18).rotateY(Math.PI / 2), P.neonCyan, { bone: j, at: X(W * 0.37) }),
      1.6,
    );
    // hub cap + bolts
    b.part(cylX(0.13, 0.11, 0.1, 8), P.steel, { bone: j, at: X(W * 0.42), flat: true });
    b.part(cylX(0.05, 0.05, 0.12, 6), P.trim, { bone: j, at: X(W * 0.44), flat: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(cylX(0.022, 0.022, 0.05, 6), P.trimDark, {
        bone: j, at: [at.x + s * W * 0.42, at.y + Math.cos(a) * 0.2, at.z + Math.sin(a) * 0.2], flat: true,
      });
    }
    // inner hub + brake disc and caliper
    b.part(cylX(0.34, 0.34, 0.04, 14), P.rim, { bone: j, at: X(-W * 0.2), flat: true });
    b.part(cylX(0.15, 0.15, 0.1, 8), P.hullDark, { bone: j, at: X(-W * 0.3), flat: true });
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.16), P.neonRed, { bone: j, at: [at.x + s * W * 0.28 * 0.8, at.y + 0.04, at.z + 0.3] });
    // stub axle to body
    b.part(cylX(0.09, 0.09, 0.4, 8), P.steel, { bone: j, at: X(-0.55), flat: true });
    // shock absorber
    const sx = at.x - s * 0.6;
    b.rod([sx, at.y + 0.05, at.z + 0.35], [sx + s * 0.08, 0.95, at.z + 0.25], 0.045, P.neonAmber, { bone: J.body });
    b.rod([sx, at.y + 0.05, at.z + 0.35], [sx + s * 0.03, at.y + 0.3, at.z + 0.32], 0.06, P.hullDark, { bone: J.body });
  }

  // ---- axle housings ----
  const axles: [number[], boolean][] = [[M.frontAxle, true], [M.midAxle, false], [M.rearAxle, false]];
  for (const [m, front] of axles) {
    const [, y, z] = m;
    b.part(new THREE.BoxGeometry(2.1, 0.17, 0.2), HOUSING, { bone: J.body, at: [0, y, z], flat: true });
    b.part(new THREE.BoxGeometry(2.1, 0.08, 0.1), P.trimDark, { bone: J.body, at: [0, y - 0.06, z + 0.0], flat: true });
    // differential pumpkin
    const dif = new THREE.SphereGeometry(0.28, 8, 6);
    dif.scale(1, 0.9, 1.0);
    b.part(dif, HOUSING, { bone: J.body, at: [0, y, z + (front ? 0.05 : 0.04)], flat: true });
    b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 8), P.steel, { bone: J.body, at: [0, y, z + 0.28], rotation: [90, 0, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), P.neonMagenta, { bone: J.body, at: [0, y + 0.22, z], flat: true });
    // drive shaft stub
    b.rod([0, y + 0.02, z + 0.3], [0, y + 0.1, z + (front ? 1.0 : 0.8)], 0.05, P.steel, { bone: J.body });
    // leaf springs per side
    for (const s of [1, -1]) {
      const x = s * 0.82;
      for (let k = 0; k < 4; k++) {
        const len = 1.2 - k * 0.2;
        b.part(new THREE.BoxGeometry(0.14, 0.035, len), k % 2 ? P.hullDark : P.steel, {
          bone: J.body, at: [x, y + 0.12 + k * 0.032, z], flat: true,
        });
      }
      // clamp
      b.part(new THREE.BoxGeometry(0.18, 0.2, 0.14), P.hullDark, { bone: J.body, at: [x, y + 0.2, z], flat: true });
      // U-bolts
      for (const d of [-0.06, 0.06])
        b.rod([x - 0.07, y + 0.1, z + d], [x - 0.07, y + 0.3, z + d], 0.012, P.trim, { bone: J.body });
      // spring hanger up to chassis
      b.rod([x, y + 0.3, z + 0.55], [x, 0.92, z + 0.55], 0.035, P.steel, { bone: J.body });
      b.rod([x, y + 0.3, z - 0.55], [x, 0.92, z - 0.55], 0.035, P.steel, { bone: J.body });
      b.part(new THREE.BoxGeometry(0.16, 0.08, 0.14), P.trimDark, { bone: J.body, at: [x, 0.9, z + 0.55], flat: true });
      b.part(new THREE.BoxGeometry(0.16, 0.08, 0.14), P.trimDark, { bone: J.body, at: [x, 0.9, z - 0.55], flat: true });
    }
    // steering tie rod on front
    if (front) {
      b.rod([-1.0, y + 0.1, z + 0.28], [1.0, y + 0.1, z + 0.28], 0.03, P.trim, { bone: J.body });
    }
    // axle hazard marking
    b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", {
      bone: J.body, at: [0, y + 0.05, z - 0.11], dir: [0, 0, -1], axis: "z", texture: HAZARD,
    });
  }

  // tandem walking beam between mid and rear axles
  for (const s of [1, -1]) {
    const x = s * 0.95;
    b.rod([x, 0.72, M.midAxle[2]], [x, 0.72, M.rearAxle[2]], 0.05, P.hullDark, { bone: J.body });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8).rotateZ(Math.PI / 2), P.steel, {
      bone: J.body, at: [x, 0.72, (M.midAxle[2] + M.rearAxle[2]) / 2], flat: true,
    });
    b.rod([x, 0.72, (M.midAxle[2] + M.rearAxle[2]) / 2], [x, 0.95, (M.midAxle[2] + M.rearAxle[2]) / 2], 0.05, P.steel, { bone: J.body });
  }
  void rand;

  function mergeAll(list: THREE.BufferGeometry[]) {
    let pos: number[] = [];
    let norm: number[] = [];
    let uv: number[] = [];
    for (const g0 of list) {
      const g = g0.index ? g0.toNonIndexed() : g0;
      pos = pos.concat(Array.from(g.getAttribute("position").array as ArrayLike<number>));
      norm = norm.concat(Array.from(g.getAttribute("normal").array as ArrayLike<number>));
      uv = uv.concat(Array.from(g.getAttribute("uv").array as ArrayLike<number>));
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute("normal", new THREE.Float32BufferAttribute(norm, 3));
    out.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    return out;
  }
}
    return buildWheels;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhoundTruck2077" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["cab"] = b.joint("cab", { parent: J["body"], at: [0,1.35,2], dir: [0,0,1], role: "spine", group: "cab" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.55,0.1], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,2.85,0.4], dir: [0,0,1], role: "hinge", group: "turret" });
  J["ramp"] = b.joint("ramp", { parent: J["body"], at: [0,1,-4.1], dir: [0,0,-1], role: "hinge", group: "cargo" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.3,0.62,2.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.3,0.62,2.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.3,0.62,-1.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.3,0.62,-1.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.3,0.62,-3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.3,0.62,-3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
