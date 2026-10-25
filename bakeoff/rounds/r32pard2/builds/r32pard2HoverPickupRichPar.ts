import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, noise, mix, smoothstep, glow as _unused, panelled, stripes } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  "name": "Hoverbed Raider",
  "description": "A militarized pickup truck converted to ride on four downward-firing hover thrusters, in low-poly cyberpunk style with neon underglow, armor plates and a roof-mounted gun."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#4a5348",
  hullDark: "#2a3030",
  armor: "#5d6658",
  trim: "#e7b814",
  black: "#14161a",
  glass: "#1a2a3a",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fa8",
  neonViolet: "#8a4dff",
  steel: "#8d96a3",
  rust: "#7a4a2a",
  crate: "#6b5a3a",
  white: "#e8ecef",
  red: "#d0302a",
  glowOrange: "#ff9a2f",
};
const M = {
  chassisTop: [0, 1.2, 0] as [number, number, number],
  underside: [0, 0.55, 0] as [number, number, number],
  cabFloor: [0, 1.2, 0.3] as [number, number, number],
  cabBack: [0, 1.2, -0.55] as [number, number, number],
  bedFloor: [0, 1, -1.7] as [number, number, number],
  roofTop: [0, 2, 0.2] as [number, number, number],
  turretRing: [0, 2.05, -0.1] as [number, number, number],
  thrusterFL: [1.05, 0.75, 1.75] as [number, number, number],
  thrusterFR: [-1.05, 0.75, 1.75] as [number, number, number],
  thrusterBL: [1.05, 0.75, -1.75] as [number, number, number],
  thrusterBR: [-1.05, 0.75, -1.75] as [number, number, number],
  bumperFront: [0, 0.8, 2.8] as [number, number, number],
  bumperRear: [0, 0.8, -2.8] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const hullBase = paint((p, n) => {
    const base = mix(P.hull, P.armor, noise(p, 0.5, 3));
    const low = smoothstep(0.95, 0.6, p.y);
    let c = mix(base, "#5a4630", low * 0.55 * noise(p, 0.12, 8));
    c = mix(c, P.rust, low * 0.4 * smoothstep(0.55, 0.8, noise(p, 0.2, 5)));
    return mix(c, "#cfd8cc", 0.15 * smoothstep(0.5, 1, n.y));
  });
  const HULL = panelled(hullBase, { size: 0.32, aspect: 0.6, rivets: 0.07, seam: P.black });
  const DARK = panelled(metal("iron"), { size: 0.25, rivets: 0.06 });
  const chevrons = paint((p) => {
    const u = (p.z + p.y * 1.0) / 0.2;
    return Math.abs(u - Math.floor(u) - 0.5) < 0.25 ? P.trim : P.black;
  });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: body, at, ...o });

  // ---------- floor pan ----------
  put(box(2.3, 0.12, 5.4), DARK, [0, 0.62, 0]);
  put(box(1.9, 0.1, 4.8), P.black, [0, 0.55, 0]);
  // frame rails
  for (const s of [1, -1]) put(box(0.14, 0.16, 5.2), P.hullDark, [s * 0.7, 0.72, 0]);

  // ---------- main lower hull (cab/bed seats) ----------
  put(box(2.4, 0.4, 1.9), HULL, [0, 0.98, 0.1]); // under cab
  // bed side walls base / floor
  put(box(2.4, 0.3, 2.3), HULL, [0, 0.93, -1.65]);
  put(box(2.0, 0.05, 2.2), P.hullDark, [0, 1.1, -1.65]);
  for (let i = 0; i < 9; i++) put(box(1.9, 0.03, 0.08), P.steel, [0, 1.14, -0.7 - i * 0.24]);

  // ---------- side skirts ----------
  for (const s of [1, -1]) {
    put(box(0.14, 0.26, 3.4), chevrons, [s * 1.2, 0.84, 0.0]);
    put(box(0.1, 0.05, 3.5), P.black, [s * 1.22, 0.69, 0]);
    // underglow
    glow(put(box(0.05, 0.04, 3.2), s > 0 ? P.neonCyan : P.neonMagenta, [s * 1.1, 0.58, 0]), 1.6);
    glow(put(box(0.05, 0.04, 3.2), s > 0 ? P.neonMagenta : P.neonCyan, [s * 1.15, 0.6, 0]), 1.2);
    // skirt bolts
    for (let i = 0; i < 8; i++)
      put(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.steel, [s * 1.28, 0.88, -1.4 + i * 0.4], { dir: [s, 0, 0] });
  }
  glow(put(box(1.6, 0.03, 0.04), P.neonViolet, [0, 0.56, 1.9]), 1.5);
  glow(put(box(1.6, 0.03, 0.04), P.neonViolet, [0, 0.56, -1.9]), 1.5);

  // ---------- hood ----------
  const hood = b.extrude(
    [[0, 0], [2.3, 0], [2.3, 0.1], [2.15, 0.34, "sharp"], [0, 0.34, "sharp"]].map((p) => [p[0], p[1], ...(p[2] ? [p[2]] : [])]) as any,
    { at: [0, 0.78, 0.6], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: HULL, bone: body },
  );
  void hood;
  // simpler faceted hood slab: wedge from lathe-free extrude along x
  b.extrude(
    [[0, 0], [1.9, 0], [1.9, 0.12], [1.65, 0.4, "sharp"], [0.25, 0.46, "sharp"], [0, 0.4]] as any,
    { at: [0, 0.8, 0.9], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.03, color: HULL, bone: body, name: "hood" },
  );
  // hood scoop
  put(box(0.7, 0.14, 0.6), P.hullDark, [0, 1.3, 1.5], { rotation: [-8, 0, 0] });
  put(box(0.55, 0.08, 0.1), P.black, [0, 1.3, 1.82], { rotation: [-8, 0, 0] });
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) put(box(0.3, 0.02, 0.05), P.black, [s * 0.75, 1.275, 1.2 + i * 0.14]);
  // hood centre stripe
  put(box(0.18, 0.012, 1.3), P.trim, [0, 1.268, 1.5], { rotation: [-8, 0, 0] });

  // ---------- fenders with arch cutouts ----------
  const archTex = paint((p) => (p.y < 0.98 ? P.black : HULL));
  for (const s of [1, -1])
    for (const z of [1.75, -1.75]) {
      const x = s * 1.12;
      put(box(0.36, 0.06, 1.1), HULL, [x, 1.2, z]);
      put(box(0.08, 0.3, 1.1), HULL, [s * 1.27, 1.04, z]);
      put(box(0.08, 0.3, 0.14), archTex === null ? HULL : HULL, [x, 1.04, z + 0.52]);
      put(box(0.08, 0.3, 0.14), HULL, [x, 1.04, z - 0.52]);
      // arch trim
      put(box(0.05, 0.03, 0.9), P.trim, [s * 1.31, 1.18, z]);
      put(box(0.03, 0.2, 0.03), P.trim, [s * 1.31, 1.08, z + 0.5]);
      put(box(0.03, 0.2, 0.03), P.trim, [s * 1.31, 1.08, z - 0.5]);
    }

  // ---------- front nose, bumper, bull bar ----------
  put(box(2.3, 0.4, 0.35), HULL, [0, 0.92, 2.6]);
  put(box(2.45, 0.2, 0.3), P.hullDark, [0, 0.72, 2.7]);
  for (const s of [1, -1]) put(box(0.5, 0.16, 0.04), P.trim, [s * 0.9, 0.72, 2.86]);
  // grille
  put(box(1.2, 0.3, 0.06), P.black, [0, 0.95, 2.78]);
  for (let i = 0; i < 6; i++) put(box(1.15, 0.02, 0.04), P.steel, [0, 0.84 + i * 0.05, 2.82]);
  // bull bar
  for (const s of [1, -1]) {
    b.rod([s * 0.7, 0.65, 2.88], [s * 0.7, 1.15, 2.88], 0.05, P.steel, { bone: body, sides: 6 });
    b.rod([s * 0.7, 1.15, 2.88], [s * 0.7, 1.15, 2.62], 0.04, P.steel, { bone: body, sides: 6 });
  }
  b.rod([-0.7, 1.12, 2.9], [0.7, 1.12, 2.9], 0.05, P.steel, { bone: body, sides: 6 });
  b.rod([-0.7, 0.78, 2.9], [0.7, 0.78, 2.9], 0.05, P.steel, { bone: body, sides: 6 });
  glow(put(box(1.3, 0.05, 0.05), P.neonMagenta, [0, 1.12, 2.94]), 2);
  // headlights
  for (const s of [1, -1]) {
    put(box(0.5, 0.13, 0.05), P.black, [s * 0.85, 1.02, 2.78]);
    glow(put(box(0.44, 0.05, 0.06), P.neonCyan, [s * 0.85, 1.02, 2.8]), 2.2);
    put(box(0.3, 0.06, 0.04), P.trim, [s * 0.85, 1.12, 2.78]);
  }

  // ---------- rear bumper ----------
  put(box(2.4, 0.3, 0.3), P.hullDark, [0, 0.8, -2.65]);
  put(box(2.3, 0.1, 0.34), chevrons, [0, 0.98, -2.65]);
  for (const s of [1, -1]) {
    put(box(0.4, 0.2, 0.06), P.black, [s * 0.95, 0.85, -2.82]);
    glow(put(box(0.34, 0.14, 0.05), P.red, [s * 0.95, 0.85, -2.85]), 2);
    glow(put(box(0.12, 0.03, 0.05), P.white, [s * 0.5, 0.75, -2.84]), 1.2);
  }
  // tow hitch
  put(box(0.14, 0.12, 0.3), P.steel, [0, 0.72, -2.9]);
  put(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 8), P.steel, [0, 0.8, -3.0]);
  put(new THREE.TorusGeometry(0.07, 0.015, 5, 8), P.steel, [0, 0.72, -3.02], { rotation: [90, 0, 0] });

  // ---------- decals ----------
  const unitTex = svg(
    `<svg viewBox="0 0 120 60"><rect x="2" y="2" width="116" height="56" fill="none" stroke="#e8ecef" stroke-width="4"/><text x="60" y="44" font-family="monospace" font-weight="bold" font-size="40" text-anchor="middle" fill="#e8ecef">R-07</text></svg>`,
    { size: 256 },
  );
  const kanjiTex = svg(
    `<svg viewBox="0 0 100 60"><text x="50" y="48" font-size="46" text-anchor="middle" fill="#ff2fa8" font-weight="bold">浮襲</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      bone: body, at: [s * 1.285, 1.0, 1.15], dir: [s, 0, 0], axis: "z", texture: unitTex,
    });
    b.part(new THREE.PlaneGeometry(0.4, 0.24), "#ffffff", {
      bone: body, at: [s * 1.285, 1.0, -0.2], dir: [s, 0, 0], axis: "z", texture: kanjiTex,
    });
  }
  b.part(new THREE.PlaneGeometry(0.5, 0.3), "#ffffff", {
    bone: body, at: [0.4, 1.285, 1.3], dir: [0, 1, 0], axis: "z", texture: kanjiTex, rotation: [-8, 0, 0],
  });

  // ---------- underside details ----------
  for (let i = 0; i < 4; i++) put(box(1.8, 0.05, 0.08), P.steel, [0, 0.5, -1.8 + i * 1.2]);
  put(new THREE.CylinderGeometry(0.22, 0.22, 0.9, 8), P.hullDark, [0, 0.6, 0.2], { dir: [0, 0, 1] });
  // cables
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.4, 0.62, 1.5], [s * 0.6, 0.5, 1.7], [s * 0.95, 0.58, 1.75]],
      0.018,
      { bone: body, color: s > 0 ? P.neonCyan : P.neonMagenta },
    );
  }
  // mud splatter ledges
  for (let i = 0; i < 10; i++) {
    const s = R() > 0.5 ? 1 : -1;
    put(box(0.1 + R() * 0.1, 0.03, 0.1 + R() * 0.12), "#4a3a26", [s * (1.0 + R() * 0.2), 0.68, -2.3 + R() * 4.6]);
  }
}
    return buildChassis;
  })(),
  // cab
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // ---------- textures ----------
  const GLASS = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#13222f"/>
    <path d="M0 50 L30 0 L40 0 L10 64 L0 64Z" fill="#2ff3ff" opacity="0.28"/>
    <path d="M26 64 L56 0 L60 0 L32 64Z" fill="#ff2fa8" opacity="0.3"/>
    <path d="M44 64 L64 20 L64 36 L52 64Z" fill="#8a4dff" opacity="0.25"/></svg>`,
    { size: 128 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#052a30"/>
    <path d="M4 22 L14 12 L22 18 L34 6 L44 16 L60 8" stroke="#2ff3ff" stroke-width="2.5" fill="none"/>
    <rect x="4" y="26" width="30" height="3" fill="#2ff3ff"/><rect x="40" y="24" width="18" height="5" fill="#ff2fa8"/></svg>`,
    { size: 128 },
  );
  const KANJI = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="none" stroke="#e7b814" stroke-width="4"/>
    <text x="32" y="46" text-anchor="middle" font-size="40" font-weight="bold" fill="#e7b814" font-family="sans-serif">狼</text></svg>`,
    { size: 128 },
  );
  const NUM = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="26" text-anchor="middle" font-size="28" font-weight="bold" fill="#e8ecef" font-family="sans-serif">07</text></svg>`,
    { size: 96 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#0a0c10"/>${[4, 12, 20, 28].map((x) => `<rect x="${x - 1.5}" y="0" width="3" height="32" fill="#8d96a3"/>`).join("")}</svg>`,
    { size: 64 },
  );

  // ---------- paints ----------
  const HULL = panelled(
    paint((p, n) => {
      const c = mix(P.hull, P.armor, noise(p, 0.3, 3));
      return mix(c, "#7a8570", 0.25 * smoothstep(0.5, 1, n.y));
    }),
    { size: 0.28, rivets: 0.07 },
  );
  const ROOF = stripes(P.hull, P.trim, { size: 0.22, axis: "z", width: 0.4, wobble: 0.05 });
  const SEAT = "#1d2127";

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at, ...o });
  const tex = (w: number, h: number, t: any, at: number[], dir: number[], c = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), c, { bone: body, at, dir, axis: "z", texture: t });
  const bolt = (at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 6), P.steel, { bone: body, at, dir });

  const yB = 1.2, yT = 2.0;
  // ---------- floor / shell ----------
  box(2.0, 0.06, 1.8, P.hullDark, [0, 1.23, 0.4]);
  // lower body belt
  for (const s of [1, -1]) {
    box(0.12, 0.38, 1.85, HULL, [s * 1.0, 1.4, 0.37]);
    box(0.05, 0.14, 1.85, P.trim, [s * 1.07, 1.28, 0.37]);
  }
  // cowl
  box(2.1, 0.3, 0.22, HULL, [0, 1.35, 1.2]);
  // dashboard
  box(1.8, 0.2, 0.3, P.black, [0, 1.5, 1.0]);
  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      bone: body, at: [0, 1.65, 0.86], dir: [0, 0.35, -1], axis: "z", texture: SCREEN,
    }),
    1.4,
  );
  box(0.56, 0.3, 0.02, P.black, [0, 1.65, 0.88], { rotation: [-20, 0, 0] });
  // seats
  for (const s of [1, -1]) {
    box(0.5, 0.14, 0.5, SEAT, [s * 0.5, 1.4, 0.35]);
    box(0.48, 0.55, 0.12, SEAT, [s * 0.5, 1.7, 0.05], { rotation: [-8, 0, 0] });
    box(0.3, 0.12, 0.1, SEAT, [s * 0.5, 2.0, 0.0]);
  }
  // steering wheel
  b.part(new THREE.TorusGeometry(0.11, 0.015, 5, 8), P.black, { bone: body, at: [0.5, 1.68, 0.7], rotation: [-60, 0, 0] });

  // ---------- pillars (A, B, C) ----------
  for (const s of [1, -1]) {
    // A pillar slanted
    b.rod([s * 1.0, 1.45, 1.15], [s * 0.98, 1.98, 0.62], 0.055, HULL, { bone: body, sides: 4 });
    // B pillar
    box(0.1, 0.62, 0.14, HULL, [s * 1.03, 1.7, 0.12]);
    // C pillar
    box(0.1, 0.6, 0.16, HULL, [s * 1.03, 1.7, -0.5]);
    // sills and roof rails
    box(0.1, 0.07, 1.8, HULL, [s * 1.03, 2.0, 0.35]);
    // door plates
    for (const [z, w] of [[0.62, 0.7], [-0.2, 0.55]] as number[][]) {
      box(0.04, 0.34, w, P.armor, [s * 1.12, 1.45, z]);
      box(0.03, 0.08, w * 0.9, P.trim, [s * 1.14, 1.32, z]);
      for (const dz of [-1, 1]) for (const dy of [-0.1, 0.1]) bolt([s * 1.145, 1.45 + dy, z + dz * w * 0.4], [s, 0, 0]);
      box(0.05, 0.04, 0.16, P.steel, [s * 1.13, 1.58, z - w * 0.36]); // handle
    }
    // side glass
    tex(0.68, 0.42, GLASS, [s * 1.04, 1.76, 0.62], [s, 0, 0]);
    tex(0.52, 0.42, GLASS, [s * 1.04, 1.76, -0.2], [s, 0, 0]);
    // mirror
    b.rod([s * 1.1, 1.62, 1.12], [s * 1.38, 1.7, 1.2], 0.014, P.black, { bone: body });
    box(0.06, 0.16, 0.2, P.black, [s * 1.42, 1.72, 1.2]);
    glow(box(0.02, 0.04, 0.14, P.neonCyan, [s * 1.455, 1.66, 1.2]), 1.5);
    // door seam inset
    box(0.02, 0.5, 0.02, P.black, [s * 1.1, 1.65, 0.28]);
  }

  // ---------- windshield ----------
  const ws = new THREE.PlaneGeometry(1.9, 0.62);
  b.part(ws, "#ffffff", { bone: body, at: [0, 1.72, 1.0], rotation: [-62, 0, 0], texture: GLASS });
  b.part(new THREE.PlaneGeometry(1.9, 0.62), "#ffffff", { bone: body, at: [0, 1.72, 1.0], rotation: [118, 0, 0], texture: GLASS });
  // frame
  b.rod([-1.0, 1.45, 1.17], [1.0, 1.45, 1.17], 0.05, HULL, { bone: body, sides: 4 });
  b.rod([-0.98, 1.98, 0.7], [0.98, 1.98, 0.7], 0.055, HULL, { bone: body, sides: 4 });
  b.rod([0, 1.45, 1.17], [0, 1.98, 0.7], 0.018, P.black, { bone: body, sides: 4 });
  // wipers
  for (const s of [1, -1]) b.rod([s * 0.1, 1.5, 1.14], [s * 0.6, 1.62, 1.04], 0.01, P.black, { bone: body });

  // ---------- roof ----------
  box(2.0, 0.08, 1.35, ROOF, [0, 2.04, 0.0]);
  box(1.96, 0.05, 0.12, P.trim, [0, 2.0, 0.72]); // visor lip
  // turret ring plate
  cyl(0.38, 0.42, 0.06, 12, P.hullDark, [0, 2.09, -0.1]);
  b.part(new THREE.TorusGeometry(0.34, 0.016, 4, 14), P.trim, { bone: body, at: [0, 2.125, -0.1], rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    bolt([Math.sin(a) * 0.4 * 0.9, 2.125, -0.1 + Math.cos(a) * 0.36], [0, 1, 0]);
  }
  // roof rack
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 2.12, 0.65], [s * 0.9, 2.12, 0.1], 0.02, P.black, { bone: body, sides: 4 });
    b.rod([s * 0.9, 2.12, -0.35], [s * 0.9, 2.12, -0.5], 0.02, P.black, { bone: body, sides: 4 });
  }
  b.rod([-0.9, 2.12, 0.65], [0.9, 2.12, 0.65], 0.022, P.black, { bone: body, sides: 4 });
  b.rod([-0.9, 2.12, -0.5], [0.9, 2.12, -0.5], 0.022, P.black, { bone: body, sides: 4 });
  for (const s of [1, -1]) for (const z of [0.65, -0.5]) b.rod([s * 0.9, 2.08, z], [s * 0.9, 2.15, z], 0.02, P.black, { bone: body });
  // spotlights on rack front
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const x = i * 0.34;
    cyl(0.07, 0.07, 0.1, 8, P.black, [x, 2.2, 0.66], { rotation: [90, 0, 0] });
    glow(cyl(0.055, 0.055, 0.02, 8, "#fff4c8", [x, 2.2, 0.72], { rotation: [90, 0, 0] }), 1.6);
    b.rod([x, 2.12, 0.65], [x, 2.17, 0.66], 0.015, P.black, { bone: body });
  }
  // antenna
  const ant = b.rod([-0.95, 2.1, -0.45], [-0.95, 2.75 - 0.0, -0.5], [0.014, 0.006], P.black, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: body, at: [-0.95, 2.0 + 0.0, -0.5] }), 0);
  void ant;

  // ---------- back wall ----------
  box(2.1, 0.9, 0.12, HULL, [0, 1.65, -0.5]);
  // rear window w/ grille
  tex(1.0, 0.4, GLASS, [0, 1.8, -0.565], [0, 0, -1]);
  tex(1.0, 0.4, GRILLE, [0, 1.8, -0.575], [0, 0, -1]);
  b.rod([-0.52, 1.6, -0.58], [-0.52, 2.0, -0.58], 0.02, P.black, { bone: body, sides: 4 });
  b.rod([0.52, 1.6, -0.58], [0.52, 2.0, -0.58], 0.02, P.black, { bone: body, sides: 4 });
  // gun-port
  box(0.28, 0.16, 0.05, P.black, [0.72, 1.45, -0.58]);
  box(0.34, 0.04, 0.06, P.trim, [0.72, 1.55, -0.58]);
  box(0.34, 0.04, 0.06, P.trim, [0.72, 1.35, -0.58]);
  // back wall decals
  tex(0.4, 0.4, KANJI, [-0.7, 1.45, -0.58], [0, 0, -1]);
  tex(0.4, 0.2, NUM, [-0.25, 1.4, -0.58], [0, 0, -1], "#e8ecef");
  // magenta strip
  glow(box(1.9, 0.03, 0.02, P.neonMagenta, [0, 1.28, -0.57]), 1.4);

  // tilted armor cheeks on roof corners
  for (const s of [1, -1]) {
    box(0.14, 0.1, 0.5, P.armor, [s * 1.0, 2.1, 0.35], { rotation: [0, 0, s * 12] });
    for (const z of [0.2, 0.5]) bolt([s * 1.0, 2.16, z], [0, 1, 0]);
  }
  // cab magenta/cyan accents
  glow(box(1.95, 0.025, 0.02, P.neonCyan, [0, 1.46, 1.19]), 1.3);
  // light bar at windshield top
  glow(box(0.9, 0.04, 0.05, P.neonMagenta, [0, 2.1, 0.78]), 1.3);
  // jitter-free tiny details: vents on cowl
  for (let i = 0; i < 5; i++) box(0.3, 0.012, 0.03, P.black, [-0.5 + i * 0.25 + R() * 0.0, 1.51, 1.24]);
}
    return buildCab;
  })(),
  // bed
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...extra });

  const HULL = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const c = new THREE.Color(P.hull);
    const top = n.y > 0.5 ? 1.12 : n.y < -0.5 ? 0.8 : 1;
    const mud = Math.max(0, 1 - (p.y - 1) / 0.35) * 0.35;
    c.multiplyScalar(top).lerp(new THREE.Color(P.rust), mud);
    return [c.r, c.g, c.b] as any;
  });
  const PLATED = panelled(HULL, { size: 0.4, aspect: 0.8, rivets: 0.12 });

  // textures
  const stripeTex = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ff2fa8"/><rect y="6" width="64" height="4" fill="#ffd0ee"/></svg>`, { size: 128 });
  const numTex = svg(`<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="none" stroke="#e8ecef" stroke-width="4"/><text x="32" y="46" font-size="38" font-weight="bold" text-anchor="middle" fill="#e8ecef" font-family="sans-serif">07</text></svg>`, { size: 128 });
  const crateTex = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#6b5a3a"/><rect x="3" y="3" width="58" height="58" fill="none" stroke="#3b3020" stroke-width="4"/><path d="M3 3L61 61M61 3L3 61" stroke="#3b3020" stroke-width="3"/><rect x="14" y="24" width="36" height="16" fill="#e7b814"/><text x="32" y="37" font-size="12" font-weight="bold" text-anchor="middle" fill="#14161a" font-family="sans-serif">AMMO</text></svg>`, { size: 128 });
  const hazTex = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#8d96a3"/><rect y="20" width="64" height="26" fill="#e7b814"/><path d="M0 20l12 26h12L12 20zM28 20l12 26h12L40 20z" fill="#14161a"/><circle cx="32" cy="33" r="0" fill="none"/></svg>`, { size: 128 });
  const cellTex = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#2ff3ff"/><rect x="4" y="4" width="24" height="24" fill="none" stroke="#e8ffff" stroke-width="2"/><path d="M18 6L10 18h6l-2 8 8-13h-6z" fill="#e8ffff"/></svg>`, { size: 64 });
  const netTex = svg(`<svg viewBox="0 0 32 32"><path d="M0 0H32M0 16H32M0 31H32M0 0V32M16 0V32M31 0V32" stroke="#1d2024" stroke-width="2.5" fill="none"/></svg>`, { size: 96 });

  // floor with ribs
  box(2.2, 0.08, 2.2, PLATED, [0, 1.04, -1.68]);
  for (let i = 0; i < 11; i++) box(2.1, 0.03, 0.06, P.hullDark, [0, 1.1, -0.75 - i * 0.19]);
  box(2.4, 0.1, 2.25, P.hullDark, [0, 0.98, -1.67]);

  // side walls
  for (const s of [1, -1]) {
    box(0.1, 0.62, 2.2, PLATED, [s * 1.1, 1.38, -1.67]);
    box(0.16, 0.07, 2.25, P.armor, [s * 1.1, 1.72, -1.67]);
    box(0.02, 0.1, 2.2, P.trim, [s * 1.16, 1.28, -1.67]);
    for (let i = 0; i < 6; i++) {
      const z = -0.8 - i * 0.38;
      box(0.04, 0.2, 0.2, P.armor, [s * 1.16, 1.5, z]);
      cyl(0.025, 0.025, 0.03, 6, P.steel, [s * 1.19, 1.5, z], { rotation: [0, 0, 90] });
    }
    // tie-down rings
    for (const z of [-1.2, -2.2])
      b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.steel, { bone, at: [s * 1.0, 1.74, z], rotation: [90, 0, 0] });
    // roll bar
    cyl(0.04, 0.04, 0.85, 6, P.black, [s * 1.0, 2.1, -1.0]);
    glow(b.part(new THREE.BoxGeometry(0.1, 0.07, 0.1), "#fff3c0", { bone, at: [s * 1.0, 2.55 - 0.05, -0.97] }), 1.5);
  }
  // roll bar top (kept within box height 2)
  box(2.1, 0.07, 0.07, P.black, [0, 1.98, -1.0]);
  for (const s of [1, -1]) cyl(0.04, 0.04, 0.5, 6, P.black, [s * 1.0, 1.75, -1.0]);
  for (const s of [1, -1]) glow(box(0.14, 0.09, 0.12, "#fff3c0", [s * 0.7, 1.9, -0.95]), 1.5);
  box(0.9, 0.05, 0.05, P.black, [0, 1.8, -1.0]);

  // tailgate
  box(2.3, 0.7, 0.1, PLATED, [0, 1.4, -2.72]);
  box(2.4, 0.07, 0.14, P.armor, [0, 1.78, -2.72]);
  b.part(new THREE.PlaneGeometry(1.5, 0.19), "#ffffff", { bone, at: [0, 1.5, -2.775], dir: [0, 0, -1], axis: "z", texture: stripeTex });
  glow(b.part(new THREE.PlaneGeometry(1.5, 0.19), "#ffffff", { bone, at: [0, 1.5, -2.776], dir: [0, 0, -1], axis: "z", texture: stripeTex }), 0.8);
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone, at: [0.8, 1.25, -2.775], dir: [0, 0, -1], axis: "z", texture: numTex });
  for (const s of [1, -1]) {
    box(0.1, 0.12, 0.08, P.steel, [s * 1.0, 1.7, -2.78]);
    cyl(0.02, 0.02, 0.04, 6, P.steel, [s * 1.0, 1.6, -2.78], { rotation: [90, 0, 0] });
  }

  // spoiler
  for (const s of [1, -1]) box(0.08, 0.12, 0.3, P.black, [s * 0.95, 1.9, -2.6]);
  box(2.3, 0.05, 0.4, P.hullDark, [0, 1.97, -2.62], { rotation: [-8, 0, 0] });
  for (const s of [1, -1]) box(0.04, 0.1, 0.42, P.trim, [s * 1.16, 1.95, -2.62]);

  // crates
  const crates: [number, number, number, number][] = [[0.65, 1.32, -2.1, 0.5], [0.65, 1.32, -1.5, 0.5], [0.65, 1.82 - 0.06, -1.8, 0.4]];
  crates.forEach(([x, y, z, s], i) => {
    b.part(new THREE.BoxGeometry(s, s, s), "#ffffff", { bone, at: [x, y, z], rotation: [0, i * 12, 0], texture: crateTex });
    box(s + 0.02, 0.04, 0.05, P.black, [x, y + 0.05, z], { rotation: [0, i * 12, 0] });
  });
  // cargo net
  b.cards([THREE.Object3D].length ? [] : [], netTex);
  b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", { bone, at: [0.65, 1.55, -1.8 + 0.01], dir: [1, 0, 0], axis: "z", texture: netTex });
  b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", { bone, at: [0.65, 1.55, -1.8], dir: [-1, 0, 0], axis: "z", texture: netTex });

  // barrels
  for (const [x, z] of [[-0.75, -2.35], [-0.35, -2.4], [-0.8, -1.9]]) {
    cyl(0.17, 0.17, 0.55, 8, P.red, [x, 1.36, z]);
    for (const dy of [-0.18, 0.18]) cyl(0.18, 0.18, 0.03, 8, P.steel, [x, 1.36 + dy, z]);
    cyl(0.1, 0.1, 0.03, 6, P.black, [x, 1.65, z]);
    b.part(new THREE.CylinderGeometry(0.172, 0.172, 0.2, 8, 1, true, 0, Math.PI), "#ffffff", { bone, at: [x, 1.36, z], rotation: [0, 180, 0], texture: hazTex });
  }

  // energy cell
  glow(b.part(new THREE.BoxGeometry(0.32, 0.32, 0.32), "#ffffff", { bone, at: [-0.3, 1.24 + 0.0, -1.2], rotation: [0, 20, 0], texture: cellTex }), 1.8);
  box(0.4, 0.06, 0.4, P.black, [-0.3, 1.1, -1.2], { rotation: [0, 20, 0] });
  for (const s of [1, -1]) box(0.03, 0.4, 0.03, P.black, [-0.3 + s * 0.17, 1.28, -1.2]);

  // cab back wall trim
  box(2.0, 0.08, 0.08, P.trim, [0, 1.06, -0.62]);
  void R; void M;
}
    return buildBed;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: Ctx) {
  const GRILLE = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#cfcfcf"/>` +
      Array.from({ length: 16 }, (_, i) => `<rect x="${i * 4 + 1}" y="4" width="2" height="24" fill="#3c3c3c"/>`).join("") +
      `<rect y="0" width="64" height="3" fill="#9a9a9a"/><rect y="29" width="64" height="3" fill="#9a9a9a"/><rect y="15" width="64" height="2" fill="#7a7a7a"/></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4 L62 58 H2Z" fill="#e7b814" stroke="#14161a" stroke-width="5" stroke-linejoin="round"/>
     <rect x="29" y="22" width="6" height="20" fill="#14161a"/><rect x="29" y="46" width="6" height="6" fill="#14161a"/></svg>`,
    { size: 128 },
  );
  const KANJI = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#14161a"/><text x="32" y="25" text-anchor="middle" font-size="24" font-weight="bold" fill="#ff2fa8" font-family="sans-serif">推進</text></svg>`,
    { size: 128 },
  );
  const HEAT = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="#3a7bff" stroke-width="5"/>
     <circle cx="50" cy="50" r="36" fill="none" stroke="#2ff3ff" stroke-width="4"/>
     <circle cx="50" cy="50" r="24" fill="#5a6bff"/><circle cx="50" cy="50" r="12" fill="#bfeaff"/></svg>`,
    { size: 128 },
  );

  const pods: [string, number, number][] = [
    ["thrusterFL", M.thrusterFL[0], M.thrusterFL[2]],
    ["thrusterFR", M.thrusterFR[0], M.thrusterFR[2]],
    ["thrusterBL", M.thrusterBL[0], M.thrusterBL[2]],
    ["thrusterBR", M.thrusterBR[0], M.thrusterBR[2]],
  ];

  for (const [name, x, z] of pods) {
    const bone = J[name];
    const sx = x > 0 ? 1 : -1;
    const o = { bone };
    const at = (dx: number, y: number, dz: number): [number, number, number] => [x + dx, y, z + dz];

    // armor shroud, strut and trim
    b.frustumBox(at(0, 0.6, 0), at(0, 0.8, 0), [0.9, 0.9], [0.9, 0.9], { ...o, color: P.armor });
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.92), P.trim, { ...o, at: at(sx * 0.45, 0.78, 0) });
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.92), P.trim, { ...o, at: at(sx * 0.45, 0.62, 0) });
    b.part(new THREE.BoxGeometry(0.92, 0.04, 0.04), P.hullDark, { ...o, at: at(0, 0.6, sx * 0.0 + 0.45) });
    b.part(new THREE.BoxGeometry(0.92, 0.04, 0.04), P.hullDark, { ...o, at: at(0, 0.6, -0.45) });
    b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.1, 8), P.hullDark, { ...o, at: at(0, 0.6, 0), flat: true });

    // decals on shroud outer face
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      ...o, at: at(sx * 0.461, 0.7, 0.2), dir: [sx, 0, 0], axis: "z", texture: WARN,
    });
    b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
      ...o, at: at(sx * 0.461, 0.7, -0.18), dir: [sx, 0, 0], axis: "z", texture: KANJI,
    });

    // turbine drum with grille
    b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 8), P.steel, {
      ...o, at: at(0, 0.52, 0), texture: GRILLE, flat: true, rotation: [0, 22.5, 0],
    });
    b.part(new THREE.CylinderGeometry(0.44, 0.44, 0.04, 8), P.black, { ...o, at: at(0, 0.67, 0), flat: true, rotation: [0, 22.5, 0] });
    glow(b.part(new THREE.CylinderGeometry(0.455, 0.455, 0.05, 8), P.neonCyan, { ...o, at: at(0, 0.4, 0), flat: true, rotation: [0, 22.5, 0] }), 1.6);

    // vane stage
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 8), P.steel, { ...o, at: at(0, 0.34, 0), flat: true });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = 0.23;
      b.part(new THREE.BoxGeometry(0.26, 0.02, 0.08), P.steel, {
        ...o, at: at(Math.sin(a) * r, 0.34, Math.cos(a) * r), rotation: [0, (a * 180) / Math.PI + 90, 25],
      });
    }

    // exhaust cone nozzle
    b.lathe(
      [[0, 0.02], [0.2, 0.0], [0.23, 0.04], [0.33, 0.3], [0.3, 0.31], [0, 0.31]],
      { ...o, at: at(0, 0, 0), segments: 8, color: P.hullDark },
    );
    b.part(new THREE.CylinderGeometry(0.255, 0.255, 0.03, 8), P.trim, { ...o, at: at(0, 0.035, 0), flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 10), P.neonViolet, { ...o, at: at(0, 0.011, 0) }), 2);
    glow(b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.026, 10), P.neonCyan, { ...o, at: at(0, 0.013, 0) }), 2.4);

    // heat glow disc on the floor
    glow(
      b.part(new THREE.CircleGeometry(0.75, 20), "#ffffff", {
        ...o, at: at(0, 0.004, 0), dir: [0, 1, 0], axis: "z", texture: HEAT,
      }),
      0.8,
    );

    // hydraulic pistons and cables
    for (const dz of [-1, 1]) {
      const base = at(-sx * 0.3, 0.8, dz * 0.3);
      const mid = at(-sx * 0.36, 0.62, dz * 0.22);
      const low = at(-sx * 0.4, 0.46, dz * 0.14);
      b.rod(base, mid, 0.045, P.hullDark, o);
      b.rod(mid, low, 0.026, P.steel, o);
      b.part(new THREE.SphereGeometry(0.05, 6, 4), P.steel, { ...o, at: low });
    }
    b.sweep(
      [at(-sx * 0.32, 0.55, 0.02), at(-sx * 0.5, 0.58, 0.08), at(-sx * 0.55, 0.72, 0.12), at(-sx * 0.5, 0.82, 0.12)],
      0.02,
      { ...o, color: P.black, sides: 5 },
    );
    b.sweep(
      [at(-sx * 0.32, 0.5, -0.04), at(-sx * 0.52, 0.52, -0.1), at(-sx * 0.58, 0.7, -0.12), at(-sx * 0.5, 0.82, -0.14)],
      0.016,
      { ...o, color: P.neonMagenta, sides: 5 },
    );
  }
}
    return buildThrusters;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pit = J.turretPitch;
  const [cx, cy, cz] = M.turretRing as number[];

  const ORANGE = P.glowOrange;
  const HAZ = P.trim;

  const hullPaint = paint((p, n) => {
    const t = noise(p, 0.12, 4);
    const base = mix(P.armor, P.hull, t);
    const lit = mix(base, "#8a9484", smoothstep(0.6, 1, n.y) * 0.4);
    return lit;
  });
  const stripePaint = paint((p) => (Math.floor((p.x + p.z) / 0.05) % 2 === 0 ? HAZ : P.black));
  const metalPaint = paint((p, n) => mix(P.steel, P.hullDark, 0.4 + 0.4 * noise(p, 0.05, 2) - 0.2 * n.y));

  const kanji = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="#14161a" stroke="#e7b814" stroke-width="4"/><text x="32" y="48" text-anchor="middle" font-size="44" font-family="serif" font-weight="bold" fill="#e7b814">砲</text></svg>`,
    { size: 128 },
  );
  const lens = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14161a"/><circle cx="32" cy="32" r="22" fill="#ff2fa8"/><circle cx="32" cy="32" r="12" fill="#ffd0ef"/><circle cx="24" cy="24" r="5" fill="#fff"/></svg>`,
    { size: 96 },
  );

  // ---------- yaw base ----------
  b.part(new THREE.CylinderGeometry(0.34, 0.38, 0.03, 12), P.black, { bone: yaw, at: [cx, cy + 0.015, cz] });
  b.part(new THREE.CylinderGeometry(0.3, 0.32, 0.04, 12), stripePaint, { bone: yaw, at: [cx, cy + 0.05, cz] });
  b.part(new THREE.TorusGeometry(0.31, 0.012, 4, 16), P.steel, {
    bone: yaw, at: [cx, cy + 0.075, cz], rotation: [90, 0, 0],
  });
  // housing
  b.part(new THREE.CylinderGeometry(0.22, 0.27, 0.12, 8), hullPaint, { bone: yaw, at: [cx, cy + 0.14, cz], flat: true });
  for (const s of [1, -1]) {
    // side cheek armor
    b.part(new THREE.BoxGeometry(0.06, 0.2, 0.4), hullPaint, { bone: yaw, at: [cx + s * 0.26, cy + 0.2, cz + 0.02], flat: true });
    b.part(new THREE.BoxGeometry(0.065, 0.03, 0.3), stripePaint, { bone: yaw, at: [cx + s * 0.26, cy + 0.3, cz + 0.02] });
    // bolts
    for (const z of [-0.12, 0.14]) {
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), P.steel, {
        bone: yaw, at: [cx + s * 0.295, cy + 0.2, cz + z], dir: [s, 0, 0],
      });
    }
    // trunnion
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 8), P.steel, {
      bone: yaw, at: [cx + s * 0.3, cy + 0.2, cz + 0.1], dir: [1, 0, 0],
    });
  }
  // yaw rear back plate
  b.part(new THREE.BoxGeometry(0.4, 0.16, 0.05), hullPaint, { bone: yaw, at: [cx, cy + 0.18, cz - 0.22], flat: true });
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
    bone: yaw, at: [cx, cy + 0.18, cz - 0.248], dir: [0, 0, -1], axis: "z", texture: kanji,
  });

  // antenna whip
  b.part(new THREE.CylinderGeometry(0.004, 0.008, 0.5, 5), P.black, { bone: yaw, at: [cx - 0.36, cy + 0.27, cz - 0.3] });
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), P.neonMagenta, { bone: yaw, at: [cx - 0.36, cy + 0.53, cz - 0.3] }), 1.6);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), P.black, { bone: yaw, at: [cx - 0.36, cy + 0.04, cz - 0.3] });

  // ---------- pitching gun cradle ----------
  const gy = cy + 0.3;
  const gz = cz;
  // cradle body
  b.part(new THREE.BoxGeometry(0.34, 0.17, 0.42), hullPaint, { bone: pit, at: [cx, gy, gz + 0.1], flat: true });
  b.part(new THREE.BoxGeometry(0.36, 0.03, 0.3), stripePaint, { bone: pit, at: [cx, gy + 0.1, gz + 0.1] });
  // sloped front mantlet
  b.part(new THREE.CylinderGeometry(0.1, 0.14, 0.12, 6), P.armor, {
    bone: pit, at: [cx, gy, gz + 0.36], dir: [0, 0, 1], flat: true,
  });

  for (const s of [1, -1]) {
    const bx = cx + s * 0.07;
    // barrel
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.8, 8), P.black, { bone: pit, at: [bx, gy, gz + 0.75], dir: [0, 0, 1] });
    // perforated shroud
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.34, 8), metalPaint, { bone: pit, at: [bx, gy, gz + 0.6], dir: [0, 0, 1] });
    for (let i = 0; i < 4; i++) {
      for (const a of [0, 90, 180, 270]) {
        const r = (a * Math.PI) / 180;
        b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 5), P.black, {
          bone: pit,
          at: [bx + Math.sin(r) * 0.04, gy + Math.cos(r) * 0.04, gz + 0.47 + i * 0.08],
          dir: [Math.sin(r), Math.cos(r), 0],
        });
      }
    }
    // muzzle brake
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 6), P.steel, { bone: pit, at: [bx, gy, gz + 1.12 - 0.12], dir: [0, 0, 1], flat: true });
    b.part(new THREE.BoxGeometry(0.07, 0.012, 0.05), P.black, { bone: pit, at: [bx, gy, gz + 1.0] });
    b.part(new THREE.BoxGeometry(0.012, 0.07, 0.05), P.black, { bone: pit, at: [bx, gy, gz + 1.0] });
    // heat tip
    glow(b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 8), ORANGE, {
      bone: pit, at: [bx, gy, gz + 0.98], dir: [0, 0, 1],
    }), 1.8);
    glow(b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.035, 8), ORANGE, {
      bone: pit, at: [bx, gy, gz + 0.9], dir: [0, 0, 1],
    }), 1.2);
  }
  // barrel clamp
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.04), P.black, { bone: pit, at: [cx, gy, gz + 0.78], flat: true });

  // ammo box (left side) with belt
  b.part(new THREE.BoxGeometry(0.16, 0.14, 0.22), P.crate, { bone: pit, at: [cx + 0.26, gy - 0.02, gz + 0.12], flat: true });
  b.part(new THREE.BoxGeometry(0.17, 0.02, 0.23), HAZ, { bone: pit, at: [cx + 0.26, gy + 0.05, gz + 0.12] });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    bone: pit, at: [cx + 0.346, gy - 0.02, gz + 0.12], dir: [1, 0, 0], axis: "z", texture: kanji,
  });
  const beltPts = [
    [cx + 0.2, gy + 0.06, gz + 0.22],
    [cx + 0.16, gy + 0.1, gz + 0.3],
    [cx + 0.11, gy + 0.07, gz + 0.38],
    [cx + 0.08, gy + 0.03, gz + 0.45],
  ];
  b.sweep(beltPts, 0.014, { bone: pit, color: P.rust, section: "box" });
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 5), "#d9a63a", {
      bone: pit,
      at: [cx + 0.2 - 0.12 * t, gy + 0.08 + Math.sin(t * 3) * 0.02, gz + 0.22 + 0.22 * t],
      dir: [1, 0, 0.3],
    });
  }

  // sensor head (right side, on short stalk) with magenta lens
  const sx = cx - 0.24;
  b.part(new THREE.BoxGeometry(0.04, 0.08, 0.04), P.black, { bone: pit, at: [sx, gy + 0.1, gz + 0.05] });
  b.part(new THREE.BoxGeometry(0.15, 0.1, 0.16), hullPaint, { bone: pit, at: [sx, gy + 0.19, gz + 0.1], flat: true });
  glow(b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    bone: pit, at: [sx, gy + 0.19, gz + 0.183], dir: [0, 0, 1], axis: "z", texture: lens,
  }), 1.6);
  b.part(new THREE.BoxGeometry(0.17, 0.02, 0.1), P.black, { bone: pit, at: [sx, gy + 0.255, gz + 0.14] });
  // cyan laser sight
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 6), P.black, { bone: pit, at: [sx - 0.09, gy + 0.19, gz + 0.14], dir: [0, 0, 1] });
  glow(b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6), P.neonCyan, {
    bone: pit, at: [sx - 0.09, gy + 0.19, gz + 0.21], dir: [0, 0, 1],
  }), 2);
  glow(b.rod([sx - 0.09, gy + 0.19, gz + 0.22], [sx - 0.09, gy + 0.19, gz + 0.9], 0.0025, P.neonCyan, { bone: pit, caps: "none" }), 1.5);

  // top hatch plate / rivets
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.1), HAZ, { bone: pit, at: [cx + s * 0.12, gy + 0.105, gz - 0.02] });
}
    return buildTurret;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverRaider" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.9,0], dir: [0,0,1], role: "spine" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [1.05,0.75,1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-1.05,0.75,1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterBL"] = b.joint("thrusterBL", { parent: J["body"], at: [1.05,0.75,-1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterBR"] = b.joint("thrusterBR", { parent: J["body"], at: [-1.05,0.75,-1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.05,-0.1], dir: [0,1,0], role: "hinge", group: "turret" });
  J["turretPitch"] = b.joint("turretPitch", { parent: J["turretYaw"], at: [0,2.3,-0.1], dir: [0,0,1], role: "hinge", group: "turret" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
