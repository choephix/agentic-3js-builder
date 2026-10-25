import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, countershade, stripes, noise, smoothstep, mix } from "../../../../src/index";
import { panelled, metal, INK, gaugeTexture, coil } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Arasaka-Style Riot Interceptor RC-9 'Pacifier'",
  "description": "A hulking corporate riot-control interceptor truck in Cyberpunk 2077 style, with a roof-mounted water cannon turret, neon light bars, caged windows and corporate decals."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2b2f3a",
  hullDark: "#14161d",
  armor: "#454b5a",
  trim: "#e7b814",
  hazardBlack: "#101010",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonRed: "#ff2a3c",
  neonBlue: "#2a5bff",
  glass: "#0b1a24",
  tyre: "#0e0e10",
  rim: "#7a8091",
  steel: "#8a90a0",
  tankBlue: "#2a5f8f",
  white: "#e8ecf2",
  rust: "#6b3a22",
};
const M = {
  chassisTop: [0, 1.3, 0] as [number, number, number],
  cabinBase: [0, 1.3, 0.9] as [number, number, number],
  deckTop: [0, 1.4, -1.6] as [number, number, number],
  turretRing: [0, 2, -0.6] as [number, number, number],
  roofBar: [0, 2.25, 1] as [number, number, number],
  noseFront: [0, 0.9, 3] as [number, number, number],
  axleFront: [0, 0.55, 1.9] as [number, number, number],
  axleMid: [0, 0.55, -0.2] as [number, number, number],
  axleRear: [0, 0.55, -2.2] as [number, number, number],
  tankMount: [0, 1.4, -1.9] as [number, number, number],
  rearBumper: [0, 0.7, -3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassisHull
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildChassisHull({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const grime = paint((p, n) => {
    const base: [number, number, number] = [0.17, 0.19, 0.24];
    const top: [number, number, number] = [0.3, 0.33, 0.4];
    let c = mix(base, top, smoothstep(0.4, 1.3, p.y));
    const mud = noise(p, 0.25, 4);
    const arch = Math.max(smoothstep(1.2, 0.5, Math.abs(Math.abs(p.z - 1.9) - 0)), smoothstep(1.2, 0.5, Math.abs(p.z + 0.2)), smoothstep(1.2, 0.5, Math.abs(p.z + 2.2)));
    const m = smoothstep(0.55, 0.8, mud) * (1 - smoothstep(0.3, 0.9, p.y)) * (0.5 + 0.5 * arch);
    c = mix(c, [0.26, 0.17, 0.11], m * 0.8);
    c = mix(c, [0.05, 0.05, 0.07], smoothstep(0.1, -0.8, n.y) * 0.6);
    return c;
  });
  const HULL = panelled(grime, { size: 0.5, aspect: 0.6, rivets: 0.06 });
  const HAZARD = stripes(P.trim, P.hazardBlack, { size: 0.16, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const ARMOR = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.3, rivets: 0.05 });

  // ---------- main body ----------
  // lower slab with wedge nose (loft along z)
  b.loft(
    [
      { at: [0, 0.82, -2.95], w: 2.5, h: 0.95 },
      { at: [0, 0.82, -1.5], w: 2.6, h: 0.95 },
      { at: [0, 0.82, 1.0], w: 2.6, h: 0.95 },
      { at: [0, 0.78, 2.3], w: 2.4, h: 0.8 },
      { at: [0, 0.72, 2.95], w: 1.9, h: 0.55 },
    ],
    { bone, color: HULL, skin: "rigid", name: "hullLoft" },
  );
  // sloped nose hood plate
  b.frustumBox([0, 1.1, 1.4], [0, 1.0, 2.9], [2.4, 0.2], [1.7, 0.14], { bone, color: ARMOR });
  // underbody plate
  b.part(new THREE.BoxGeometry(2.1, 0.08, 5.6), P.hullDark, { bone, at: [0, 0.33, 0] });

  // side skirts
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.3, 5.4), ARMOR, { bone, at: [s * 1.32, 0.52, 0] });
    b.part(new THREE.BoxGeometry(0.05, 0.05, 5.2), P.neonCyan, { bone, at: [s * 1.4, 0.36, 0] });
    glow(b.part(new THREE.BoxGeometry(0.04, 0.04, 5.2), P.neonCyan, { bone, at: [s * 1.385, 0.34, 0] }), 1.6);
    // wheel arches
    for (const z of [1.9, -0.2, -2.2]) {
      b.part(new THREE.BoxGeometry(0.2, 0.55, 1.35), P.hullDark, { bone, at: [s * 1.25, 0.95, z] });
      b.part(new THREE.BoxGeometry(0.08, 0.1, 1.5), P.armor, { bone, at: [s * 1.33, 1.25, z] });
      for (const dz of [-0.6, 0.6])
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.steel, { bone, at: [s * 1.38, 1.25, z + dz], dir: [s, 0, 0] });
    }
    // side top rail
    b.part(new THREE.BoxGeometry(0.1, 0.1, 5.6), P.armor, { bone, at: [s * 1.28, 1.28, 0] });
  }

  // top deck plate
  b.part(new THREE.BoxGeometry(2.3, 0.06, 5.0), HULL, { bone, at: [0, 1.28, -0.4] });

  // ---------- front: bumper, ram, grille ----------
  b.part(new THREE.BoxGeometry(2.3, 0.3, 0.3), HAZARD, { bone, at: [0, 0.55, 3.0] });
  b.part(new THREE.BoxGeometry(1.5, 0.12, 0.1), P.hullDark, { bone, at: [0, 0.85, 3.0] });
  glow(b.part(new THREE.BoxGeometry(1.4, 0.05, 0.05), P.neonCyan, { bone, at: [0, 0.93, 3.04] }), 1.8);
  // pushbar frame
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.35, 2.7], [s * 0.9, 1.1, 3.25], 0.06, P.armor, { bone, sides: 6 });
    b.rod([s * 0.35, 0.4, 2.8], [s * 0.35, 1.05, 3.25], 0.05, P.armor, { bone, sides: 6 });
    b.part(new THREE.BoxGeometry(0.06, 0.18, 0.06), P.trim, { bone, at: [s * 0.9, 0.5, 3.3] });
  }
  b.rod([-0.95, 1.05, 3.25], [0.95, 1.05, 3.25], 0.07, P.armor, { bone, sides: 6 });
  b.rod([-0.95, 0.55, 3.25], [0.95, 0.55, 3.25], 0.07, P.armor, { bone, sides: 6 });
  b.part(new THREE.BoxGeometry(1.9, 0.5, 0.05), P.hullDark, { bone, at: [0, 0.8, 3.22] });
  // grille slats
  for (let i = 0; i < 5; i++) b.part(new THREE.BoxGeometry(1.8, 0.03, 0.04), P.steel, { bone, at: [0, 0.6 + i * 0.1, 3.25] });
  // tow hooks
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8, Math.PI * 1.5), P.trim, { bone, at: [s * 0.65, 0.5, 3.1], dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8, Math.PI * 1.5), P.trim, { bone, at: [s * 0.6, 0.5, -3.08], dir: [0, 0, 1], axis: "z" });
  }

  // ---------- rear: bumper, taillights, cage ----------
  b.part(new THREE.BoxGeometry(2.5, 0.35, 0.2), HAZARD, { bone, at: [0, 0.6, -3.0] });
  glow(b.part(new THREE.BoxGeometry(2.0, 0.07, 0.05), P.neonRed, { bone, at: [0, 0.92, -3.0] }), 2);
  for (const s of [1, -1]) {
    b.rod([s * 1.15, 0.8, -3.0], [s * 1.15, 1.3, -3.0], 0.04, P.armor, { bone, sides: 6 });
    glow(b.part(new THREE.BoxGeometry(0.2, 0.12, 0.05), P.neonRed, { bone, at: [s * 1.1, 1.1, -3.02] }), 2);
  }
  for (let i = -3; i <= 3; i++) b.rod([i * 0.32, 0.8, -3.1], [i * 0.32, 1.28, -3.1], 0.015, P.steel, { bone, sides: 4 });
  for (const y of [0.85, 1.05, 1.25]) b.rod([-1.1, y, -3.1], [1.1, y, -3.1], 0.018, P.steel, { bone, sides: 4 });

  // ---------- decals ----------
  const logo = svg(
    `<svg viewBox="0 0 100 100"><path d="M50 8 L90 88 L70 88 L50 46 L30 88 L10 88Z" fill="#e8ecf2"/><rect x="38" y="62" width="24" height="8" fill="#ff2bd6"/><rect x="8" y="92" width="84" height="4" fill="#e7b814"/></svg>`,
    { size: 128 },
  );
  const plate = svg(
    `<svg viewBox="0 0 80 32"><rect width="80" height="32" rx="3" fill="#e8ecf2"/><rect x="2" y="2" width="76" height="28" rx="2" fill="none" stroke="#101010" stroke-width="2"/><text x="40" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#101010">RC-9</text></svg>`,
    { size: 128 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 200 40"><text x="100" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="#e8ecf2" letter-spacing="3">PACIFIER</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    const dir: [number, number, number] = [s, 0, 0];
    const up: [number, number, number] = [0, 1, 0];
    const mk = (tex: any, w: number, h: number, z: number, y: number, col: string) =>
      b.part(new THREE.PlaneGeometry(w, h), col, { bone, at: [s * 1.311, y, z], dir, axis: "z", up, texture: tex });
    mk(logo, 0.45, 0.45, 0.9, 0.85, "#ffffff");
    mk(stencil, 1.1, 0.22, -1.2, 0.85, "#ffffff");
  }
  // number plates
  b.part(new THREE.PlaneGeometry(0.55, 0.22), "#ffffff", { bone, at: [0, 0.4, 3.18], dir: [0, 0, 1], axis: "z", texture: plate });
  b.part(new THREE.PlaneGeometry(0.55, 0.22), "#ffffff", { bone, at: [0, 0.5, -3.11], dir: [0, 0, -1], axis: "z", texture: plate });
  // rear magenta emblem strip
  glow(b.part(new THREE.BoxGeometry(0.8, 0.04, 0.03), P.neonMagenta, { bone, at: [0, 0.78, -3.1] }), 1.6);

  // ---------- greeble rivets / vents ----------
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.04, 0.16, 0.3), P.hullDark, { bone, at: [s * 1.31, 1.05, 2.45 - i * 0.12 + 0.0] });
  for (let i = 0; i < 10; i++) {
    const x = (R() - 0.5) * 2;
    const z = -2.8 + R() * 3.5;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 6), P.steel, { bone, at: [x, 1.32, z] });
  }
}
    return buildChassisHull;
  })(),
  // cabin
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildCabin({ b, J, P }: Ctx) {
  const bone = J.body;
  const Y0 = 1.3, Z0 = 0.2, Z1 = 2.4, W = 1.2;

  // ---------- paints ----------
  const shell = paint((p, n, s) => {
    const base = mix(P.hull, P.armor, smoothstep(1.3, 2.4, p.y) * 0.5 + (n.y > 0.5 ? 0.25 : 0));
    const grime = smoothstep(0.5, 0.85, noise(p, 0.18, 4)) * smoothstep(1.9, 1.3, p.y);
    return mix(base, P.hullDark, grime * 0.7);
  });
  const armorPaint = panelled(shell, { size: 0.35, aspect: 0.8, rivets: 0.08, seam: P.hullDark });
  const doorPaint = panelled(mix(P.armor, P.hull, 0.4) as any, { size: 0.3, aspect: 0.9, rivets: 0.06, seam: P.hullDark });

  // ---------- textures ----------
  const police = svg(`<svg viewBox="0 0 200 50"><rect width="200" height="50" fill="none"/>
    <text x="100" y="36" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="32" fill="#e8ecf2" stroke="#101010" stroke-width="1">POLICE</text></svg>`, { size: 256 });
  const logo = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2bd6" stroke-width="4"/>
    <path d="M32 10 L50 50 L40 50 L32 30 L24 50 L14 50Z" fill="#ff2bd6"/></svg>`, { size: 128 });
  const hud = svg(`<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#06222a"/>
    <path d="M0 40 L15 30 L30 35 L50 15 L70 25 L100 8" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <circle cx="80" cy="30" r="9" fill="none" stroke="#ff2bd6" stroke-width="2"/>
    <rect x="6" y="6" width="30" height="4" fill="#2ff3ff"/><rect x="6" y="14" width="18" height="3" fill="#ffd400"/></svg>`, { size: 256 });
  const mesh = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="none"/>
    <path d="M0 0L32 32M32 0L0 32M16 0V32M0 16H32" stroke="#8a90a0" stroke-width="3.5"/></svg>`, { size: 128 });
  const grille = mesh;

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], color = "#ffffff", extra: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { bone, at, dir, axis: "z", texture: tex, ...extra });

  // ---------- shell: extruded side profile (z along x-axis of drawing) ----------
  // profile in (z, y): drawn front to back
  const prof: any[] = [
    [Z0, Y0], [Z1, Y0], [Z1, 1.55, "sharp"], [1.75, 2.3, "sharp"], [1.55, 2.4, "sharp"], [Z0 + 0.05, 2.4, "sharp"], [Z0, 2.3, "sharp"],
  ];
  // flip: extrude x along +Z, y up, thickness along x
  b.extrude(prof.map((q) => [q[0] - 0, q[1] - 0, q[2]].filter((v) => v !== undefined) as any), {
    at: [-W + 0.0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2 * W, color: armorPaint, bone, bevel: 0.03,
  });
  // note: profile coordinates are model coordinates (at has zero offset on y/z)

  // roof plate + lip
  box(2.3, 0.06, 1.0, P.hullDark, [0, 2.42, 0.95]);
  box(2.5, 0.05, 0.12, P.hullDark, [0, 2.38, 0.22]);

  // ---------- windscreen (raked) ----------
  const wsA = [0, 1.92, 2.0];
  const rake = Math.atan2(2.3 - 1.55, 1.75 - 2.4) ; // slope direction
  const nrm = new THREE.Vector3(0, 0.62, 0.78).normalize();
  const wsDir: [number, number, number] = [nrm.x, nrm.y, nrm.z];
  const wsC = [0, 1.92, 2.06];
  b.part(new THREE.PlaneGeometry(1.9, 0.78), P.glass, { bone, at: wsC, dir: wsDir, axis: "z" });
  // HUD behind glass
  glow(plane(0.8, 0.4, hud, [0, 1.86, 2.02], wsDir, "#ffffff"), 1.2);
  // grille cage over glass
  b.part(new THREE.PlaneGeometry(1.9, 0.78), "#ffffff", { bone, at: [0, 1.935, 2.085], dir: wsDir, axis: "z", texture: grille });
  const up = new THREE.Vector3(0, 0.78, -0.62).normalize();
  for (const x of [-0.95, 0, 0.95]) {
    b.rod([x, 1.55, 2.4], [x, 2.28, 1.78], 0.025, { color: P.steel, bone });
  }
  box(2.0, 0.07, 0.07, P.steel, [0, 1.56, 2.38]);
  b.rod([-1.0, 2.3, 1.76], [1.0, 2.3, 1.76], 0.035, { color: P.steel, bone });

  // ---------- front face and neon grille ----------
  box(2.35, 0.25, 0.08, P.hullDark, [0, 1.42, 2.4]);
  glow(box(1.8, 0.05, 0.03, P.neonCyan, [0, 1.42, 2.45]), 2);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.06, 0.03, "#dff9ff", [s * 0.88, 1.43, 2.45]), 2.2);
    box(0.46, 0.12, 0.02, P.hullDark, [s * 0.88, 1.43, 2.43]);
    glow(box(0.4, 0.06, 0.03, "#dff9ff", [s * 0.88, 1.43, 2.46]), 2.2);
  }

  // ---------- side details ----------
  for (const s of [1, -1]) {
    const out: [number, number, number] = [s, 0, 0];
    const x = s * (W + 0.005);
    // door panel (riot shield)
    box(0.06, 0.78, 1.15, doorPaint, [s * (W + 0.03), 1.75, 1.0]);
    // door frame
    box(0.04, 0.05, 1.2, P.hullDark, [s * (W + 0.06), 1.35, 1.0]);
    box(0.04, 0.05, 1.2, P.hullDark, [s * (W + 0.06), 2.15, 1.0]);
    // window
    b.part(new THREE.PlaneGeometry(0.8, 0.4), P.glass, { bone, at: [x + s * 0.062, 1.95, 1.2], dir: out, axis: "z" });
    b.part(new THREE.PlaneGeometry(0.8, 0.4), "#ffffff", { bone, at: [x + s * 0.068, 1.95, 1.2], dir: out, axis: "z", texture: mesh });
    for (const dz of [-0.42, 0.42]) box(0.05, 0.46, 0.05, P.steel, [x + s * 0.07, 1.95, 1.2 + dz]);
    box(0.05, 0.05, 0.9, P.steel, [x + s * 0.07, 2.17, 1.2]);
    box(0.05, 0.05, 0.9, P.steel, [x + s * 0.07, 1.73, 1.2]);
    // handle
    b.rod([x + s * 0.06, 1.6, 0.65], [x + s * 0.06, 1.6, 0.85], 0.02, { color: P.steel, bone });
    // POLICE lettering
    plane(0.9, 0.22, police, [x + s * 0.065, 1.55, 1.3], [s, 0, 0], "#ffffff");
    plane(0.9, 0.22, police, [x + s * 0.065, 1.55, 1.3], [s, 0, 0], "#ffffff");
    // logo
    plane(0.25, 0.25, logo, [x + s * 0.07, 1.83, 0.45], [s, 0, 0], "#ffffff");
    // magenta edge neon
    glow(b.rod([s * 1.22, 2.37, 0.25], [s * 1.22, 2.37, 1.7], 0.025, { color: P.neonMagenta, bone }), 2.2);
    // mirror
    b.rod([s * 1.22, 1.95, 1.9], [s * 1.5, 2.0, 1.95], 0.025, { color: P.steel, bone });
    box(0.07, 0.3, 0.2, P.hullDark, [s * 1.54, 2.0, 1.95]);
    glow(box(0.01, 0.26, 0.16, "#2ff3ff", [s * 1.5 + s * 0.04, 2.0, 1.95]), 0.6);
    // lower skirt strip
    glow(box(0.02, 0.03, 1.9, P.neonCyan, [s * (W + 0.045), 1.33, 1.3]), 1.2);
  }
  // rear wall
  box(2.3, 1.0, 0.06, P.hullDark, [0, 1.85, 0.22]);

  // ---------- roof light bar ----------
  box(1.7, 0.1, 0.34, P.hullDark, [0, 2.5, 1.0]);
  const segs = 6;
  for (let i = 0; i < segs; i++) {
    const c = i < segs / 2 ? P.neonRed : P.neonBlue;
    const x = -0.72 + i * 0.288;
    glow(box(0.26, 0.1, 0.3, c, [x, 2.58, 1.0]), 2.5);
    box(0.28, 0.02, 0.32, P.hullDark, [x, 2.65, 1.0]);
  }
  for (const s of [1, -1]) box(0.08, 0.1, 0.4, P.hullDark, [s * 0.85, 2.46, 1.0]);

  // ---------- antennas and dome ----------
  b.lathe([[0, 0], [0.12, 0], [0.12, 0.05], [0.08, 0.14], [0.0, 0.16]], { at: [0.55, 2.43, 0.5], bone, color: P.hullDark, segments: 10 });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonCyan, { bone, at: [0.55, 2.55, 0.55] }), 2);
  for (const [x, z, h] of [[-0.7, 0.4, 0.7], [-0.55, 0.35, 0.45], [0.95, 0.35, 0.55]] as number[][]) {
    b.rod([x, 2.42, z], [x, 2.42 + h, z], [0.014, 0.007], { color: P.steel, bone });
    glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonRed, { bone, at: [x, 2.42 + h, z] }), 2);
  }
  box(0.2, 0.08, 0.2, P.hullDark, [-0.7, 2.44, 0.4]);

  // vents on roof rear
  for (let i = 0; i < 4; i++) box(0.5, 0.02, 0.03, P.hullDark, [0.35, 2.435, 0.3 + i * 0.08]);
  // front visor over windscreen
  box(2.3, 0.05, 0.2, P.hullDark, [0, 2.38, 1.7], { rotation: [-35, 0, 0] });
  // corner pillars
  for (const s of [1, -1]) b.rod([s * 1.1, 1.55, 2.36], [s * 1.1, 2.3, 1.74], 0.05, { color: P.armor, bone });
}
    return buildCabin;
  })(),
  // waterTankDeck
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildWaterTankDeck({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const DECK_Y = M.deckTop[1];
  const TANK_Y = 1.72;
  const TANK_R = 0.5;
  const MAGENTA_DARK = "#7a1366";

  // helper: box part
  const box = (size: [number, number, number], color: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: body, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, ...extra });

  // ---------- paints ----------
  const grime = paint((p, n) => {
    const base = mix(P.hullDark, P.armor, smoothstep(1.3, 2.2, p.y) * 0.8);
    const g = noise(p, 0.12, 4);
    return mix(base, "#050608", smoothstep(0.55, 0.9, g) * 0.5);
  });
  const hazard = paint((p, _n, s) => {
    const k = Math.floor((p.x + p.z) / 0.1);
    return k % 2 === 0 ? P.trim : P.hazardBlack;
  });
  const tankPaint = panelled(
    paint((p, n) => {
      const c = mix(P.tankBlue, "#183850", smoothstep(0.3, -0.8, n.y) * 0.7);
      return mix(c, P.rust, smoothstep(0.62, 0.85, noise(p, 0.1, 9)) * 0.45);
    }),
    { size: 0.3, aspect: 1, rivets: 0.05 },
  );
  const steelP = metal("steel", { tarnish: 0.4 });
  const ironP = metal("iron");

  // ---------- deck plate ----------
  box([2.4, 0.1, 2.2], grime, [0, DECK_Y + 0.05 - 0.02, -1.9]);
  // hazard edges
  box([2.4, 0.02, 0.1], hazard, [0, DECK_Y + 0.1, -2.95 + 0.05]);
  box([2.4, 0.02, 0.1], hazard, [0, DECK_Y + 0.1, -0.85]);
  for (const s of [1, -1]) box([0.1, 0.02, 2.0], hazard, [s * 1.15, DECK_Y + 0.1, -1.9]);

  // ---------- tank ----------
  const tank = b.part(new THREE.CylinderGeometry(TANK_R, TANK_R, 1.8, 14), tankPaint, {
    bone: body, at: [0, TANK_Y, -1.9], dir: [0, 0, 1],
  });
  // domed ends
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(TANK_R, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.tankBlue, {
      bone: body, at: [0, TANK_Y, -1.9 + s * 0.9], dir: [0, 0, s],
    });
  }
  // bands
  for (const z of [-2.6, -2.1, -1.6, -1.1]) {
    b.part(new THREE.TorusGeometry(TANK_R + 0.015, 0.025, 5, 16), P.armor, { bone: body, at: [0, TANK_Y, z], dir: [0, 0, 1], axis: "z" });
  }
  // saddles + straps
  for (const z of [-2.5, -1.3]) {
    box([1.0, 0.3, 0.16], P.hullDark, [0, DECK_Y + 0.2, z]);
    box([1.2, 0.08, 0.14], P.armor, [0, DECK_Y + 0.12, z]);
    for (const s of [1, -1]) {
      box([0.06, 0.06, 0.2], P.steel, [s * 0.4, TANK_Y - 0.28, z]);
    }
  }
  // top hatch
  cyl(0.15, 0.17, 0.06, 8, P.armor, [0, TANK_Y + TANK_R + 0.01, -1.4]);
  cyl(0.05, 0.05, 0.08, 6, P.trim, [0, TANK_Y + TANK_R + 0.07, -1.4]);

  // level gauge glow strips on both sides
  for (const s of [1, -1]) {
    box([0.02, 0.05, 1.3], P.hullDark, [s * (TANK_R + 0.0), TANK_Y + 0.02, -1.9], { rotation: [0, 0, 0] });
    glow(box([0.016, 0.03, 1.2], P.neonCyan, [s * (TANK_R + 0.014), TANK_Y + 0.02, -1.9]), 1.6);
    for (let i = 0; i < 6; i++)
      box([0.014, 0.012, 0.02], P.white, [s * (TANK_R + 0.016), TANK_Y + 0.07, -2.4 + i * 0.1 + 0.2]);
  }

  // warning label textures
  const warn = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4 L60 56 H4Z" fill="#e7b814" stroke="#101010" stroke-width="4" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="20" fill="#101010"/><rect x="29" y="46" width="6" height="6" fill="#101010"/></svg>`,
    { size: 96 },
  );
  const label = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" rx="4" fill="#e8ecf2"/><rect x="3" y="3" width="122" height="34" rx="3" fill="none" stroke="#101010" stroke-width="2"/><text x="64" y="17" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#101010">H2O // HIGH PRESS</text><text x="64" y="32" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ff2a3c">NON-POTABLE</text></svg>`,
    { size: 192 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: body, at: [s * (TANK_R + 0.01) , TANK_Y - 0.2, -1.2], dir: [s, 0, 0], axis: "z", texture: warn });
    b.part(new THREE.PlaneGeometry(0.5, 0.16), "#ffffff", { bone: body, at: [s * (TANK_R + 0.01) , TANK_Y - 0.17, -2.5], dir: [s, 0, 0], axis: "z", texture: label });
  }

  // ---------- pipes and hoses to the turret ----------
  const pipeStart: [number, number, number] = [0, TANK_Y + 0.15, -0.98];
  b.sweep(
    [[0, TANK_Y - 0.1, -1.0], [0, TANK_Y - 0.1, -0.85], [0.0, 1.62, -0.75], [0, 1.75, -0.65]],
    0.045, { bone: body, color: steelP, sides: 8 });
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.35, TANK_Y + 0.1, -1.0], [s * 0.38, TANK_Y + 0.25, -0.88], [s * 0.3, 1.95, -0.72], [s * 0.12, 2.0, -0.62]],
      0.035, { bone: body, color: P.hullDark, sides: 6 });
    // pipe collars
    cyl(0.05, 0.05, 0.05, 6, P.trim, [s * 0.37, TANK_Y + 0.22, -0.9], { rotation: [70, 0, 0] });
  }
  // manifold at pipe start
  box([0.5, 0.12, 0.14], steelP, [0, 1.55, -0.9]);
  // valves
  for (const [x, z] of [[0.3, -0.95], [-0.3, -0.95]] as [number, number][]) {
    cyl(0.05, 0.05, 0.16, 8, P.steel, [x, 1.65, z]);
    b.part(new THREE.TorusGeometry(0.07, 0.014, 5, 10), P.neonRed, { bone: body, at: [x, 1.76, z], rotation: [90, 0, 0] });
    box([0.16, 0.012, 0.012], P.neonRed, [x, 1.76, z]);
  }

  // ---------- side tool lockers ----------
  for (const s of [1, -1]) {
    box([0.34, 0.5, 1.1], grime, [s * 1.0, DECK_Y + 0.35, -2.1]);
    box([0.02, 0.4, 1.0], P.armor, [s * 1.17, DECK_Y + 0.35, -2.1]);
    for (const z of [-2.35, -1.85]) {
      box([0.015, 0.34, 0.02], P.hullDark, [s * 1.18, DECK_Y + 0.35, z + 0.25]);
      box([0.03, 0.04, 0.12], P.trim, [s * 1.19, DECK_Y + 0.38, z + 0.02]);
    }
    box([0.36, 0.03, 1.12], hazard, [s * 1.0, DECK_Y + 0.61, -2.1]);
  }

  // ---------- exhaust stacks ----------
  for (const s of [1, -1]) {
    const x = s * 0.88, z = -0.98;
    cyl(0.06, 0.07, 0.8, 8, ironP, [x, DECK_Y + 0.4, z]);
    cyl(0.085, 0.085, 0.05, 8, P.armor, [x, DECK_Y + 0.12, z]);
    cyl(0.085, 0.085, 0.05, 8, P.armor, [x, DECK_Y + 0.55, z]);
    cyl(0.08, 0.06, 0.06, 8, P.hullDark, [x, DECK_Y + 0.82, z]);
    glow(cyl(0.05, 0.05, 0.015, 8, "#ff7a1a", [x, DECK_Y + 0.84, z]), 2);
  }

  // ---------- vent grills near deck front ----------
  for (const s of [1, -1]) {
    box([0.3, 0.06, 0.2], P.hullDark, [s * 0.62, DECK_Y + 0.07, -0.95]);
    for (let i = 0; i < 5; i++) box([0.28, 0.012, 0.016], P.steel, [s * 0.62, DECK_Y + 0.105, -1.0 + i * 0.04 - 0.04]);
  }

  // ---------- rear cage frame ----------
  const zr = -2.92;
  const postH = 0.8;
  for (const x of [-1.1, -0.55, 0, 0.55, 1.1])
    box([0.05, postH, 0.05], P.armor, [x, DECK_Y + postH / 2, zr]);
  box([2.3, 0.06, 0.07], P.armor, [0, DECK_Y + postH, zr]);
  box([2.3, 0.05, 0.07], P.armor, [0, DECK_Y + 0.12, zr]);
  box([2.3, 0.04, 0.05], P.armor, [0, DECK_Y + 0.45, zr]);
  for (const x of [-1.1, 1.1]) {
    b.rod([x, DECK_Y + postH, zr], [x, DECK_Y + postH, zr + 0.5], 0.025, P.armor, { bone: body });
  }
  box([2.3, 0.04, 0.05], P.armor, [0, DECK_Y + postH, zr + 0.5]);
  // taillight neon bars
  for (const s of [1, -1]) {
    glow(box([0.45, 0.07, 0.04], P.neonRed, [s * 0.75, DECK_Y + 0.65, zr - 0.035]), 2);
    glow(box([0.04, 0.2, 0.03], P.neonRed, [s * 1.15, DECK_Y + 0.5, zr - 0.035]), 1.6);
  }
  // magenta emblem
  const logo = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#14161d" stroke="#ff2bd6" stroke-width="6"/><path d="M50 14 L82 80 H66 L50 46 L34 80 H18Z" fill="#ff2bd6"/><rect x="38" y="62" width="24" height="6" fill="#14161d"/><path d="M50 22 L50 40" stroke="#ff2bd6" stroke-width="3"/></svg>`,
    { size: 192 },
  );
  box([0.46, 0.46, 0.03], P.hullDark, [0, DECK_Y + 0.55, zr + 0.04]);
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: body, at: [0, DECK_Y + 0.55, zr - 0.012], dir: [0, 0, -1], axis: "z", texture: logo }), 1.3);
  // inner cage bars
  for (const x of [-0.8, -0.3, 0.3, 0.8]) box([0.03, 0.5, 0.03], P.steel, [x, DECK_Y + 0.35, zr + 0.03]);

  // ---------- rear access ladder (on the rear, left side) ----------
  const lx = -0.9, lz = -2.99;
  for (const dx of [-0.1, 0.1]) box([0.035, 0.9, 0.035], P.steel, [lx + dx, 1.0 + 0.45 + 0.0, lz - 0.0 + 0.0], { });
  for (let i = 0; i < 6; i++) {
    b.rod([lx - 0.1, 1.0 + 0.1 + i * 0.14, lz], [lx + 0.1, 1.0 + 0.1 + i * 0.14, lz], 0.016, P.steel, { bone: body });
  }
  // ladder brackets onto the hull
  for (const y of [1.15, 1.7]) for (const dx of [-0.1, 0.1]) box([0.03, 0.03, 0.06], P.hullDark, [lx + dx, y, lz + 0.04]);

  // ---------- antenna / beacon on tank top rear ----------
  b.spike([0.7, TANK_Y + 0.3, -2.7], [0, 1, 0], 0.4, 0.015, { bone: body, color: P.steel });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: body, at: [0.7, TANK_Y + 0.72, -2.7] }), 2);
  b.part(new THREE.SphereGeometry(0.0001, 3, 2), P.hull, { bone: body, at: [0, 1.4, -1.0] });
}
    return buildWaterTankDeck;
  })(),
  // waterCannonTurret
  (() => {
function buildWaterCannonTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pit = J.cannonPitch;
  const cx = M.turretRing[0];
  const cy = M.turretRing[1];
  const cz = M.turretRing[2];
  const R = rng(11);

  const ARMOR = panelled(
    paint((p, n) => mix(mix(P.armor, "#2a2e38", 1 - smoothstep(-0.5, 0.8, n.y)), "#1a1c22", 0.5 * smoothstep(0.55, 0.8, noise(p, 0.12, 4)))),
    { size: 0.22, rivets: 0.05 },
  );
  const HAZ = stripes(P.trim, P.hazardBlack, { size: 0.06, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const BARREL = countershade(metal("steel", { tarnish: 0.4 }), "#30343f", { level: -0.2 });

  const P3 = (x: number, y: number, z: number): [number, number, number] => [cx + x, cy + y, cz + z];

  // base ring and drum (yaw)
  b.lathe(
    [[0, 0], [0.62, 0], [0.66, 0.04], [0.66, 0.1], [0.58, 0.13], [0, 0.13]],
    { at: P3(0, -0.1, 0), segments: 16, bone: yaw, color: HAZ },
  );
  b.lathe(
    [[0, 0], [0.5, 0], [0.5, 0.14], [0.44, 0.2], [0, 0.2]],
    { at: P3(0, 0.03, 0), segments: 12, bone: yaw, color: ARMOR },
  );
  // bearing ring of steel
  b.lathe([[0.5, 0], [0.54, 0], [0.54, 0.03], [0.5, 0.03]], { at: P3(0, 0.2, 0), segments: 16, bone: yaw, color: P.steel });

  // housing with sloped sides: extruded side profile
  for (const s of [1, -1]) {
    b.extrude(
      [[-0.55, 0], [0.5, 0], [0.4, 0.38], [-0.3, 0.46], [-0.55, 0.3]],
      { at: P3(s * 0.34, 0.2, 0), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, bevel: 0.015, bone: yaw, color: ARMOR },
    );
  }
  b.part(new THREE.BoxGeometry(0.64, 0.1, 0.9), ARMOR, { bone: yaw, at: P3(0, 0.62, -0.05), rotation: [-4, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.7, 0.3, 0.3), ARMOR, { bone: yaw, at: P3(0, 0.3, -0.5), flat: true });
  // rear hazard band
  b.part(new THREE.BoxGeometry(0.72, 0.07, 0.04), HAZ, { bone: yaw, at: P3(0, 0.44, -0.66) });
  b.part(new THREE.BoxGeometry(0.4, 0.07, 0.3), P.hullDark, { bone: yaw, at: P3(0, 0.66, 0.34), flat: true });

  // gunner shield with slit window
  const shield = b.extrude(
    [[-0.38, 0], [0.38, 0], [0.34, 0.5], [-0.34, 0.5]],
    { at: P3(0, 0.22, 0.34), x: [1, 0, 0], y: [0, 1, -0.45], thickness: 0.05, bevel: 0.01, bone: yaw, color: ARMOR },
  );
  b.part(new THREE.BoxGeometry(0.46, 0.07, 0.03), P.glass, { bone: yaw, at: P3(0, 0.5, 0.52), rotation: [-24, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(0.46, 0.012, 0.03), P.neonCyan, { bone: yaw, at: P3(0, 0.545, 0.5), rotation: [-24, 0, 0] }), 1.4);
  // targeting screen
  const scr = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#031418"/><circle cx="32" cy="20" r="12" fill="none" stroke="#2ff3ff" stroke-width="2"/><path d="M32 4V36M14 20H50" stroke="#2ff3ff" stroke-width="2"/><rect x="4" y="30" width="22" height="5" fill="#ff2bd6"/></svg>`,
    { size: 128 },
  );
  glow(b.part(new THREE.PlaneGeometry(0.16, 0.1), "#ffffff", { bone: yaw, at: P3(-0.2, 0.42, 0.35), dir: [0, 0.4, 1], axis: "z", texture: scr }));

  // side pressure gauge
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), P.steel, { bone: yaw, at: P3(0.4, 0.4, -0.1), dir: [1, 0, 0] });
  b.part(new THREE.CircleGeometry(0.052, 16), "#ffffff", { bone: yaw, at: P3(0.425, 0.4, -0.1), dir: [1, 0, 0], axis: "z", texture: gaugeTexture({ needle: 40 }) });

  // floodlight + antenna
  b.part(new THREE.BoxGeometry(0.14, 0.09, 0.12), P.hullDark, { bone: yaw, at: P3(-0.2, 0.74, -0.1) });
  glow(b.part(new THREE.BoxGeometry(0.12, 0.07, 0.02), "#ffffff", { bone: yaw, at: P3(-0.2, 0.74, -0.04) }), 1.6);
  b.rod(P3(0.25, 0.67, -0.4), P3(0.3, 1.0, -0.45), 0.007, P.steel, { bone: yaw });
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.neonRed, { bone: yaw, at: P3(0.3, 1.01, -0.45) }), 1.5);

  // rivets (merged-ish: few)
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.02, 5, 3), P.steel, { bone: yaw, at: P3(Math.sin(a) * 0.56, 0.0, Math.cos(a) * 0.56) });
  }

  // cannon trunnions + barrel on pitch joint (at y 2.35)
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), P.steel, { bone: pit, at: [cx + s * 0.3, 2.35, cz], dir: [1, 0, 0] });
  const tilt = 4 * Math.PI / 180;
  const at = (z: number): [number, number, number] => [cx, 2.35 + Math.sin(tilt) * z, cz + Math.cos(tilt) * z];
  b.sweep(
    [at(-0.3), at(0.3), at(0.9), at(1.5)],
    (t) => 0.14 - 0.05 * t,
    { bone: pit, color: BARREL, sides: 10, caps: "flat" },
  );
  // reinforcement bands
  for (const z of [0, 0.4, 0.85, 1.25]) {
    const r = 0.14 - 0.05 * ((z + 0.3) / 1.8) + 0.02;
    b.part(new THREE.CylinderGeometry(r, r, 0.06, 10), P.hullDark, { bone: pit, at: at(z), dir: [0, Math.sin(tilt), Math.cos(tilt)] });
  }
  // nozzle flare
  const dirN: [number, number, number] = [0, Math.sin(tilt), Math.cos(tilt)];
  b.part(new THREE.CylinderGeometry(0.15, 0.1, 0.22, 12, 1, true), P.steel, { bone: pit, at: at(1.6), dir: dirN });
  b.part(new THREE.TorusGeometry(0.135, 0.02, 5, 14), P.neonMagenta, { bone: pit, at: at(1.4), dir: dirN, axis: "z" });
  glow(b.part(new THREE.TorusGeometry(0.15, 0.022, 5, 14), P.neonCyan, { bone: pit, at: at(1.71), dir: dirN, axis: "z" }), 2);
  glow(b.part(new THREE.CircleGeometry(0.1, 12), P.neonCyan, { bone: pit, at: at(1.6), dir: dirN, axis: "z" }), 0.8);
  glow(b.part(new THREE.TorusGeometry(0.15, 0.015, 5, 14), P.neonMagenta, { bone: pit, at: at(1.35), dir: dirN, axis: "z" }), 1.5);

  // feed hoses curving from base into barrel, both sides
  for (const s of [1, -1]) {
    b.sweep(
      [P3(s * 0.2, 0.2, -0.7), P3(s * 0.38, 0.45, -0.75), P3(s * 0.3, 0.7, -0.4), P3(s * 0.14, 0.4, -0.3)].map((p) => p) as number[][],
      0.035,
      { bone: yaw, color: P.hullDark, sides: 6 },
    );
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6), P.steel, { bone: yaw, at: P3(s * 0.2, 0.2, -0.72) });
  }
  // rear pipe stub toward tank
  b.rod(P3(0, 0.15, -0.7), P3(0, 0.15, -1.0), 0.05, P.steel, { bone: yaw });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 8), P.rust, { bone: yaw, at: P3(0, 0.15, -0.95), dir: [0, 0, 1] });
}
    return buildWaterCannonTurret;
  })(),
  // runningGear
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildRunningGear({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const W = 0.5;
  const rand = rng(11);

  // Tread paint: lugs around the circumference, grime near the ground.
  const TREAD = paint((p, n) => {
    const ang = Math.atan2(p.y - 0.55, p.z);
    const lug = Math.abs(Math.sin(ang * 12)) > 0.55;
    const g = noise(p, 0.12, 3);
    const base = lug ? "#1a1a1e" : "#08080a";
    return mix(base, "#3a2c20", smoothstep(0.5, 0.9, g) * (1 - smoothstep(0, 0.5, p.y)) * 0.8);
  });
  const HAZARD = paint((p) => (Math.floor((p.x + p.y) / 0.05) % 2 ? P.trim : P.hazardBlack));
  const RIM = metal("steel", { tarnish: 0.4 });
  const DARKM = metal("iron");

  const SIDEWALL = svg(
    `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="none" stroke="#6a6a70" stroke-width="3" stroke-dasharray="6 5"/>
    <path id="a" d="M 64 64 m -48 0 a 48 48 0 1 1 96 0" fill="none"/>
    <text x="64" y="20" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#9a9aa4">ARMORED-X RC9</text>
    <text x="64" y="118" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#7a7a84">NON-LETHAL</text>
    <circle cx="64" cy="64" r="44" fill="none" stroke="#2a2a30" stroke-width="3"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 1.9],
    ["wheelFR", -1, 1.9],
    ["wheelML", 1, -0.2],
    ["wheelMR", -1, -0.2],
    ["wheelRL", 1, -2.2],
    ["wheelRR", -1, -2.2],
  ];

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const front = z > 1;
    const x = s * (front ? 1.2 : 1.15);
    const c: [number, number, number] = [x, 0.55, z];
    const out = [s, 0, 0];
    // tyre
    b.part(new THREE.CylinderGeometry(R, R, W, 18), TREAD, { bone: j, at: c, dir: out, flat: true });
    // sidewall shoulders (slightly smaller darker discs)
    for (const k of [1, -1]) {
      const sw = [x + s * k * (W / 2 + 0.003), 0.55, z];
      b.part(new THREE.CircleGeometry(R * 0.93, 18), "#ffffff", {
        bone: j, at: sw, dir: [s * k, 0, 0], axis: "z", texture: SIDEWALL, color: "#ffffff",
      });
    }
    // rim: outer face
    const ox = x + s * (W / 2 + 0.01);
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 14), RIM, { bone: j, at: [ox, 0.55, z], dir: out, flat: true });
    // hub dish
    b.part(new THREE.CylinderGeometry(0.12, 0.17, 0.08, 10), DARKM, { bone: j, at: [ox + s * 0.04, 0.55, z], dir: out, flat: true });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), P.steel, { bone: j, at: [ox + s * 0.07, 0.55, z], dir: out });
    // bolt ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), P.steel, {
        bone: j, at: [ox + s * 0.03, 0.55 + Math.sin(a) * 0.25, z + Math.cos(a) * 0.25], dir: out,
      });
    }
    // magenta rim glow ring
    glow(
      b.part(new THREE.TorusGeometry(0.33, 0.012, 5, 20), P.neonMagenta, {
        bone: j, at: [ox + s * 0.025, 0.55, z], dir: out, axis: "z",
      }),
      1.3,
    );
    // brake disc inboard
    const ix = x - s * (W / 2 - 0.02);
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 14), DARKM, { bone: j, at: [ix - s * 0.04, 0.55, z], dir: out });
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.12), P.armor, { bone: j, at: [ix - s * 0.04, 0.8, z + 0.05] });
    // axle housing stub
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 8), P.hullDark, { bone: j, at: [s * 0.9, 0.55, z], dir: out });

    // suspension: lower arm to hull, shock with coil spring
    const arm = b.rod([s * 0.75, 0.5, z], [s * 1.0, 0.42, z + 0.0], 0.05, P.armor, { bone: J.body });
    b.rod([s * 0.75, 0.45, z - 0.25], [s * 1.0, 0.55, z], 0.035, P.steel, { bone: J.body });
    b.rod([s * 0.75, 0.45, z + 0.25], [s * 1.0, 0.55, z], 0.035, P.steel, { bone: J.body });
    const top: [number, number, number] = [s * 0.95, 0.4, z + 0.28];
    const bot: [number, number, number] = [s * 0.92, 0.25, z + 0.28];
    b.rod(bot, top, 0.022, P.steel, { bone: J.body });
    b.sweep(coil(bot, top, 0.045, 6), 0.007, { color: "#c8481e", bone: J.body, sides: 5 });
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.1), P.hullDark, { bone: J.body, at: [s * 0.95, 0.4, z + 0.28] });

    // mudflap with hazard stripes behind wheel
    b.part(new THREE.BoxGeometry(0.45, 0.4, 0.03), P.hullDark, { bone: J.body, at: [x, 0.3, z - R - 0.08] });
    b.part(new THREE.BoxGeometry(0.46, 0.12, 0.035), HAZARD, { bone: J.body, at: [x, 0.14, z - R - 0.08] });
    b.part(new THREE.BoxGeometry(0.5, 0.04, 0.05), P.steel, { bone: J.body, at: [x, 0.52, z - R - 0.08] });
  }

  // axle beams linking each pair
  for (const z of [1.9, -0.2, -2.2]) {
    b.rod([-0.95, 0.5, z], [0.95, 0.5, z], 0.07, P.hullDark, { bone: J.body });
    b.part(new THREE.SphereGeometry(0.17, 8, 6), P.armor, { bone: J.body, at: [0, 0.5, z] });
  }
  // small pressure gauge-like plate on the middle axle housing (grimy detail)
  b.part(new THREE.CircleGeometry(0.06, 12), "#ffffff", {
    bone: J.body, at: [0, 0.5, -0.2 + 0.18], dir: [0, 0, 1], axis: "z", texture: gaugeTexture({ label: "HYD" }),
  });
}
    return buildRunningGear;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2,-0.6], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannonPitch"] = b.joint("cannonPitch", { parent: J["turretYaw"], at: [0,2.35,-0.6], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.55,1.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.55,1.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.15,0.55,-0.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.15,0.55,-0.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.15,0.55,-2.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.15,0.55,-2.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
