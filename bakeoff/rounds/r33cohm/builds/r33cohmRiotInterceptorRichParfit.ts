import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, stripes } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal, gaugeTexture } from "../../../../kits/clockwork";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Riot-Control Interceptor RC-9 'Pacifier'",
  "description": "A corporate cyberpunk riot-control interceptor: armored wedge hull on four fat wheels, roof-mounted water cannon, glowing neon light bars and ad-panel decals."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2b2f3a",
  hullDark: "#14161d",
  plate: "#454c5c",
  trim: "#f2c515",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonRed: "#ff2a3a",
  neonBlue: "#2a5bff",
  glass: "#0e2a3a",
  tire: "#0c0c0f",
  rim: "#7b8394",
  steel: "#8a93a5",
  tank: "#3a6f8f",
  rubber: "#1b1c22",
  white: "#e9eef5",
  grime: "#3a3326",
};
const M = {
  deckTop: [0, 1.6, 0] as [number, number, number],
  cabinBase: [0, 1.6, -0.2] as [number, number, number],
  turretRing: [0, 1.9, -1.3] as [number, number, number],
  cannonPivot: [0, 2.15, -1.3] as [number, number, number],
  axleFront: [0, 0.52, 1.95] as [number, number, number],
  axleRear: [0, 0.52, -1.85] as [number, number, number],
  noseFront: [0, 0.9, 3] as [number, number, number],
  rearFace: [0, 1, -3] as [number, number, number],
  sillLine: [0, 0.62, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // lowerHull
  (() => {
function buildLowerHull({ b, J, P, M }: any) {
  const bone = J.body;
  const GRIME: [number, number, number] = [0.23, 0.2, 0.15];

  const hullPaint = paint((p, n, s) => {
    const base = panelled(P.hull, { size: 0.6, aspect: 0.6, rivets: 0.08 }).at(p, n);
    const low = smoothstep(1.2, 0.45, p.y) * (0.35 + 0.5 * noise(p, 0.3, 4));
    const side = 1 - Math.abs(n.y);
    return mix(base, GRIME, low * 0.8 * (0.4 + side * 0.6));
  });
  const plateP = paint((p, n) => {
    const base = panelled(P.plate, { size: 0.5, aspect: 0.8, rivets: 0.07 }).at(p, n);
    return mix(base, GRIME, smoothstep(1.1, 0.5, p.y) * 0.6 * noise(p, 0.25, 9));
  });

  const box = (w: number, h: number, d: number, at: number[], color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...opts });

  // main slab hull (with wheel arch clearance by splitting into segments)
  box(2.3, 0.7, 5.6, [0, 1.25, -0.2], hullPaint);
  // upper deck plate
  box(2.2, 0.12, 4.0, [0, 1.54, -0.8], plateP);
  // lower sill / belly
  box(1.9, 0.3, 5.6, [0, 0.6, -0.1], P.hullDark);
  // skid plate
  box(1.7, 0.08, 5.4, [0, 0.4, -0.1], metal("iron"));
  // between-wheel side armour panels
  for (const s of [1, -1]) {
    box(0.1, 0.6, 1.4, [s * 1.2, 1.05, 0], plateP);
    box(0.08, 0.5, 1.2, [s * 1.2, 1.1, 0.0], P.hullDark, { at: [s * 1.25, 1.1, 0] });
    // door outlines
    box(0.02, 0.5, 0.02, [s * 1.17, 1.3, -0.65], P.hullDark);
    box(0.02, 0.5, 0.02, [s * 1.17, 1.3, 0.65], P.hullDark);
    box(0.02, 0.02, 1.3, [s * 1.17, 1.55, 0], P.hullDark);
    box(0.02, 0.02, 1.3, [s * 1.17, 1.05, 0], P.hullDark);
    box(0.03, 0.06, 0.25, [s * 1.19, 1.3, 0.45], P.steel);
    // yellow trim side stripe
    box(0.03, 0.05, 5.0, [s * 1.16, 0.88, -0.1], P.trim);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8), P.steel, { bone, at: [s * 0.7, 0.62, 2.88], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8), P.steel, { bone, at: [s * 0.7, 0.62, -2.88], rotation: [90, 0, 0] });
  }

  // sloped nose wedge
  const wedge = b.extrude(
    [[0, 0], [0, 0.7], [1.0, 0.5], [1.0, 0.1], [0.6, 0]],
    { at: [1.1, 0.9, 2.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: hullPaint, bone },
  );
  void wedge;
  box(2.2, 0.4, 0.3, [0, 1.5, 2.75], plateP, { rotation: [-25, 0, 0] });

  // front ram bar with chevrons
  const chev = svg(
    `<svg viewBox="0 0 128 24"><rect width="128" height="24" fill="#f2c515"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 16} 0 L${i * 16 + 8} 0 L${i * 16 + 20} 12 L${i * 16 + 8} 24 L${i * 16} 24 L${i * 16 + 12} 12Z" fill="#14161d"/>`).join("")}</svg>`,
    { size: 256 },
  );
  box(2.3, 0.3, 0.25, [0, 0.8, 2.87], P.hullDark);
  b.part(new THREE.PlaneGeometry(2.2, 0.22), "#ffffff", { bone, at: [0, 0.8, 2.999], dir: [0, 0, 1], axis: "z", texture: chev });
  box(0.2, 0.5, 0.2, [0.9, 0.95, 2.88], P.steel);
  box(0.2, 0.5, 0.2, [-0.9, 0.95, 2.88], P.steel);

  // rear bumper
  box(2.3, 0.3, 0.25, [0, 0.75, -2.87], P.hullDark);
  b.part(new THREE.PlaneGeometry(2.2, 0.22), "#ffffff", { bone, at: [0, 0.75, -2.999], dir: [0, 0, -1], axis: "z", texture: chev });
  box(2.3, 0.5, 0.1, [0, 1.25, -2.95], plateP);

  // license plate with neon text
  const plate = svg(
    `<svg viewBox="0 0 120 50"><rect width="120" height="50" rx="4" fill="#e9eef5"/><rect x="3" y="3" width="114" height="44" rx="3" fill="none" stroke="#14161d" stroke-width="2"/><text x="60" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#14161d">RC-9 NCPD</text><text x="60" y="44" text-anchor="middle" font-family="monospace" font-size="9" fill="#ff2bd6">NIGHT CITY</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.6, 0.25), "#ffffff", { bone, at: [0, 1.0, -3.0], dir: [0, 0, -1], axis: "z", texture: plate });
  glow(box(0.5, 0.025, 0.02, [0, 0.84, -2.99], P.neonMagenta), 1.5);

  // exhaust stacks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.5, 8), P.steel, { bone, at: [s * 0.95, 1.33, -2.8] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 8), P.hullDark, { bone, at: [s * 0.95, 1.58, -2.8] });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8), P.trim, { bone, at: [s * 0.95, 1.1, -2.8] });
  }

  // stencil on flanks
  const stencil = svg(
    `<svg viewBox="0 0 200 40"><text x="100" y="28" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#e9eef5" opacity="0.85">KIROSHI SECURITY</text></svg>`,
    { size: 512 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.2, 0.24), "#ffffff", {
      bone, at: [s * 1.201, 1.25, 0], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: stencil,
    });
  // rivets / scratch seams
  const rnd = [-2.2, -1.6, 1.6, 2.2];
  for (const z of rnd) box(2.31, 0.015, 0.02, [0, 1.3, z], P.hullDark);
}
    return buildLowerHull;
  })(),
  // wheelsFenders
  (() => {
function buildWheelsFenders({ b, J, P, M }: Ctx) {
  const R = 0.52;
  const TW = 0.34;
  const CX = 1.1;
  const rand = rng(11);

  const GRIME = paint((p, n) => {
    const base = mix(P.hull, P.plate, noise(p, 0.15, 3) * 0.6);
    const low = smoothstep(0.9, 0.2, p.y);
    const m = mix(base, P.grime, low * (0.5 + 0.5 * noise(p, 0.08, 5)));
    return mix(m, P.hullDark, smoothstep(0.2, -0.8, n.y) * 0.5);
  });
  const TIRE = paint((p, n) => mix(P.tire, P.rubber, noise(p, 0.05, 2) * 0.8 + smoothstep(0.5, 1, n.y) * 0.1));
  const RIM = paint((p, n) => mix(P.rim, P.steel, noise(p, 0.04, 7)));
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 6} 16 L${i * 8 + 2} 0 L${i * 8 + 6} 0 L${i * 8 - 2} 16Z" fill="#14161d"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const HUB = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#444b5a"/><circle cx="32" cy="32" r="22" fill="none" stroke="#2ff3ff" stroke-width="5"/><circle cx="32" cy="32" r="10" fill="#8a93a5"/><circle cx="32" cy="32" r="4" fill="#14161d"/></svg>`,
    { size: 128 },
  );
  const RING = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#2ff3ff" stroke-width="6"/><circle cx="32" cy="32" r="28" fill="none" stroke="#ffffff" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number, number][] = [
    ["wheelFL", 1, M.axleFront[2], 1],
    ["wheelFR", -1, M.axleFront[2], 1],
    ["wheelRL", 1, M.axleRear[2], 0],
    ["wheelRR", -1, M.axleRear[2], 0],
  ];

  for (const [jn, s, z, front] of wheels) {
    const j = J[jn];
    const cx = s * CX;
    const cy = R;
    const axis = new THREE.Vector3(s, 0, 0);
    const at = (dx: number, y = 0, zz = 0) => [cx + s * dx, cy + y, z + zz] as [number, number, number];
    b.part(new THREE.CylinderGeometry(R, R, TW, 14), TIRE, { bone: j, at: at(0), dir: axis });
    b.part(new THREE.CylinderGeometry(R * 0.93, R * 0.97, TW * 1.04, 14), P.tire, { bone: j, at: at(0), dir: axis });
    const treads: THREE.BufferGeometry[] = [];
    const N = 14;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const g = new THREE.BoxGeometry(TW * 0.92, 0.06, 0.06);
      g.translate(0, 0, R - 0.03);
      g.rotateX(a);
      treads.push(g);
    }
    const merged = mergeGeometries(treads)!;
    b.part(merged, P.rubber, { bone: j, at: at(0) });
    b.part(new THREE.CylinderGeometry(R * 0.62, R * 0.62, TW * 0.9, 10), RIM, { bone: j, at: at(0.0), dir: axis });
    b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.05, 10), P.hullDark, { bone: j, at: at(0.16), dir: axis });
    b.part(new THREE.PlaneGeometry(R * 1.2, R * 1.2), "#ffffff", { bone: j, at: at(0.172), dir: axis, axis: "z", texture: HUB });
    glow(
      b.part(new THREE.PlaneGeometry(R * 1.3, R * 1.3), "#ffffff", { bone: j, at: at(0.176), dir: axis, axis: "z", texture: RING }),
      1.6,
    );
    const lugs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6);
      g.rotateZ(Math.PI / 2);
      g.translate(0, Math.sin(a) * 0.14, Math.cos(a) * 0.14);
      lugs.push(g);
    }
    b.part(mergeGeometries(lugs)!, P.steel, { bone: j, at: at(0.185) });
    b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.03, 12), P.steel, { bone: j, at: at(-0.12), dir: axis });
    b.part(new THREE.BoxGeometry(0.08, 0.16, 0.2), P.neonMagenta, { bone: J.body, at: at(-0.12, 0.2, 0.0) });
    b.rod(at(-0.3), at(-0.18), 0.07, P.steel, { bone: j });
    const hx = s * 0.95;
    b.rod(at(-0.3, 0, 0.0), [hx, 0.7, z + 0.35], 0.05, P.hullDark, { bone: J.body });
    b.rod(at(-0.3, 0, 0.0), [hx, 0.7, z - 0.35], 0.05, P.hullDark, { bone: J.body });
    b.rod(at(-0.3, 0.12, 0), [hx, 1.0, z], 0.045, P.steel, { bone: J.body });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6), P.steel, { bone: J.body, at: [hx, 0.88, z] });

    const fw = 0.3;
    const fR = R + 0.04;
    const segs = 7;
    for (let i = 0; i < segs; i++) {
      const a0 = Math.PI * (0.08 + (0.84 * i) / segs);
      const a1 = Math.PI * (0.08 + (0.84 * (i + 1)) / segs);
      const p0: [number, number, number] = [cx, cy + Math.sin(a0) * fR, z + Math.cos(a0) * fR];
      const p1: [number, number, number] = [cx, cy + Math.sin(a1) * fR, z + Math.cos(a1) * fR];
      b.frustumBox(p0, p1, [fw, 0.04], [fw, 0.04], { bone: J.body, color: GRIME });
      const o0: [number, number, number] = [cx + s * (fw / 2 - 0.02), p0[1], p0[2]];
      const o1: [number, number, number] = [cx + s * (fw / 2 - 0.02), p1[1], p1[2]];
      b.frustumBox(o0, o1, [0.04, 0.06], [0.04, 0.06], { bone: J.body, color: i % 2 ? P.trim : P.hullDark });
    }
    b.part(new THREE.BoxGeometry(fw, 0.03, 0.5), GRIME, { bone: J.body, at: [cx, cy + fR + 0.01, z] });
    const fz = front ? z - 0.58 : z + 0.58;
    b.part(new THREE.BoxGeometry(0.04, 0.3, 0.3), P.rubber, { bone: J.body, at: [cx + s * 0.1, 0.26, fz] });
    b.part(new THREE.BoxGeometry(0.045, 0.06, 0.3), "#ffffff", { bone: J.body, at: [cx + s * 0.12, 0.34, fz], texture: HAZ });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.4), "#ffffff", {
      bone: J.body,
      at: [cx + s * (fw / 2 + 0.0), cy + fR * 0.72, z + (front ? 0.45 : -0.45)],
      texture: HAZ,
    });
  }
}
    return buildWheelsFenders;
  })(),
  // cabin
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildCabin({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // own colours (max 6)
  const CYAN_GLASS = "#12475c";
  const SCREEN = "#0a2a33";
  const BLACK = "#08090c";

  const armor = paint((p, n) => {
    const base: [number, number, number] = [0.17, 0.18, 0.23];
    const top = smoothstep(0.2, 0.9, n.y);
    const g = noise(p, 0.12, 4);
    let c = mix(base, [0.28, 0.3, 0.37], top * 0.6 + g * 0.3);
    // grime toward the bottom
    c = mix(c, [0.12, 0.1, 0.08], smoothstep(1.95, 1.6, p.y) * 0.6);
    // scratch seams
    const seam = Math.abs(((p.z * 3.1) % 1) - 0.5) < 0.012 ? 0.5 : 0;
    return mix(c, [0.05, 0.05, 0.07], seam);
  });

  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, flat: true, ...extra });

  // ---- shell: lower cabin walls (belt) y1.6-1.82
  box(2.0, 0.24, 2.6, armor, [0, 1.72, 0.4]);
  // sloped windshield pillar/roof frame via extruded side profile (side view: z, y)
  const prof: any[] = [
    [-1.0, 1.82, "sharp"], [-0.85, 2.12, "sharp"], [0.85, 2.14, "sharp"], [1.35, 1.82, "sharp"],
  ];
  for (const s of [1, -1]) {
    // side pillars slab (outline drawn z forward, y up)
    b.extrude(prof, {
      at: [s * 0.97, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, color: armor, bone: body,
    });
  }
  // roof armour plate
  box(2.0, 0.07, 1.85, armor, [0, 2.12, -0.08]);
  box(1.7, 0.04, 1.5, P.plate, [0, 2.165, -0.08]);
  // roof ribs
  for (let i = 0; i < 4; i++) box(1.7, 0.03, 0.05, P.hullDark, [0, 2.2, -0.65 + i * 0.4]);
  // rear wall
  box(2.0, 0.34, 0.08, armor, [0, 1.95, -0.98]);
  // windshield glass (sloped)
  const HUD = svg(
    `<svg viewBox="0 0 128 32"><g stroke="#7ffcff" stroke-width="1.4" fill="none" opacity="0.8">
    <path d="M4 8H40M4 14H28M88 8H124M100 14H124"/><circle cx="64" cy="16" r="9"/><path d="M64 3V9M64 23V29M51 16H57M71 16H77"/>
    <path d="M10 26H30L34 22" /><path d="M96 26H118"/></g>
    <text x="42" y="30" font-size="5" fill="#2ff3ff" font-family="monospace">SPD 000 // RC-9</text></svg>`,
    { size: 512 },
  );
  const ws = new THREE.PlaneGeometry(1.8, 0.5);
  const wsGlass = b.part(ws, CYAN_GLASS, {
    bone: body, at: [0, 1.99, 1.1], dir: [0, 0.62, 0.78], up: [0, 1, 0], axis: "z",
  });
  box(1.86, 0.04, 0.04, P.trim, [0, 1.8, 1.26], { dir: [0, 0, 1] });
  const hud = b.part(new THREE.PlaneGeometry(1.5, 0.375), "#ffffff", {
    bone: body, at: [0, 1.99, 1.115], dir: [0, 0.62, 0.78], axis: "z", texture: HUD,
  });
  const dir = new THREE.Vector3(0, 0.62, 0.78).normalize();
  const tilt = (x: number, y: number, z: number, d = 0.012) => [x, y + dir.y * d, z + dir.z * d];
  glow(hud, 1.2);
  // slit visor bars over windshield
  for (const s of [-1, 1]) box(0.06, 0.4, 0.05, armor, tilt(s * 0.92, 1.99, 1.1), { dir: [0, 0.62, 0.78] });
  box(1.86, 0.07, 0.05, P.hullDark, tilt(0, 2.12, 0.93), { rotation: [-38, 0, 0] });
  // centre divider
  box(0.05, 0.42, 0.05, P.hullDark, tilt(0, 1.99, 1.1, 0.03), { rotation: [38, 0, 0] });

  // ---- side windows with bars
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.5, 0.3), CYAN_GLASS, {
      bone: body, at: [s * 1.0, 1.98, 0.4], dir: [s, 0, 0], axis: "z",
    });
    for (let i = 0; i < 6; i++)
      box(0.03, 0.3, 0.03, BLACK, [s * 1.03, 1.98, -0.28 + i * 0.27]);
    box(0.03, 0.04, 1.6, P.trim, [s * 1.03, 2.14, 0.4]);
    // A/B pillars
    box(0.07, 0.34, 0.12, armor, [s * 0.98, 1.98, 1.15], { rotation: [-35, 0, 0] });
    box(0.09, 0.4, 0.14, armor, [s * 1.0, 1.98, -0.12]);
    // door handle plate
    box(0.03, 0.06, 0.24, P.steel, [s * 1.02, 1.74, 0.55]);
    box(0.02, 0.1, 0.34, P.hullDark, [s * 1.015, 1.74, 0.55]);
    // door outline
    box(0.015, 0.012, 1.1, BLACK, [s * 1.0, 1.62, 0.55]);
    // mirror
    box(0.04, 0.04, 0.1, P.hullDark, [s * 1.0, 1.9, 1.05]);
    box(0.04, 0.2, 0.2, P.hullDark, [s * 1.03, 1.9, 1.1]);
    glow(box(0.01, 0.14, 0.16, P.neonCyan, [s * 1.045, 1.9, 1.1]), 1);
  }

  // ---- interior: headrests, seats, dashboard
  for (const s of [-0.45, 0.45]) {
    box(0.34, 0.5, 0.1, P.hullDark, [s, 1.9, 0.0]);
    box(0.24, 0.16, 0.12, P.rubber, [s, 2.02, 0.0]);
    box(0.36, 0.1, 0.4, P.rubber, [s, 1.7, 0.22]);
    box(0.03, 0.2, 0.03, P.steel, [s - 0.08, 1.95, 0.0]);
  }
  box(1.8, 0.14, 0.34, P.hullDark, [0, 1.84, 1.02]);
  const UI = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#04161c"/>
    <path d="M2 24L10 14L18 20L28 6L38 16L48 10L62 22" stroke="#2ff3ff" stroke-width="1.6" fill="none"/>
    <rect x="4" y="3" width="20" height="3" fill="#ff2bd6"/><rect x="40" y="26" width="18" height="3" fill="#f2c515"/>
    <text x="30" y="30" font-size="4" fill="#fff" font-family="monospace">KIROSHI</text></svg>`,
    { size: 256 },
  );
  for (const s of [-0.5, 0.45, 0]) {
    const w = s === 0 ? 0.3 : 0.5;
    glow(
      b.part(new THREE.PlaneGeometry(w, w / 2), "#ffffff", {
        bone: body, at: [s, 1.93, 0.9], dir: [0, 0.5, -0.87], axis: "z", texture: UI,
      }),
      1.4,
    );
  }

  // ---- roof sensors and antennas (rear)
  const dome = (x: number, z: number, r: number, col: string) => {
    b.part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), col, {
      bone: body, at: [x, 2.1, z], scale: [1, 0.35, 1], flat: true,
    });
    box(r * 2.3, 0.02, r * 2.3, P.hullDark, [x, 2.1, z]);
  };
  dome(0.6, -0.65, 0.12, P.plate);
  dome(-0.6, -0.65, 0.09, P.steel);
  glow(box(0.1, 0.02, 0.1, P.neonMagenta, [0, 2.14, -0.8]), 1.3);
  for (const [x, z] of [[0.85, -0.85], [-0.85, -0.8]] as number[][]) {
    b.rod([x, 2.1, z], [x, 2.13, z], 0.012, P.steel, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.015, 6, 4), P.neonRed, { bone: body, at: [x, 2.14, z] }), 1.5);
  }
  // stencil on roof plate
  const ST = svg(
    `<svg viewBox="0 0 96 24"><text x="48" y="17" text-anchor="middle" font-size="13" font-weight="bold" font-family="sans-serif" fill="#f2c515">KIROSHI SEC</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.9, 0.225), "#ffffff", {
    bone: body, at: [0, 2.207, 0.35], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: ST,
  });
  // hazard trim stripes on front header
  for (let i = 0; i < 7; i++)
    box(0.1, 0.02, 0.05, i % 2 ? P.hullDark : P.trim, [-0.6 + i * 0.2, 2.15, 0.9]);
  // rivets along roof edge
  for (let i = 0; i < 8; i++) for (const s of [-1, 1])
    b.part(new THREE.SphereGeometry(0.018, 4, 3), P.steel, { bone: body, at: [s * 0.95, 2.17, -0.8 + i * 0.3 + R() * 0.02] });
}
    return buildCabin;
  })(),
  // frontFace
  (() => {
function buildFrontFace({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  // ---- paints
  const hood = paint((p, n) => {
    const base: [number, number, number] = [0.17, 0.18, 0.23];
    const top = Math.max(0, n.y);
    const seam = Math.abs(((p.x + 5) % 0.55) - 0.275) > 0.268 ? 0.55 : 1;
    const g = Math.max(0, 1 - (p.y - 0.7) / 0.5);
    const k = (0.75 + 0.35 * top) * seam;
    return [base[0] * k + 0.17 * g * 0.5, base[1] * k + 0.13 * g * 0.5, base[2] * k + 0.05 * g * 0.5];
  });
  const hazard = paint((p) => (Math.floor((p.x + p.y * 1.0) / 0.1) % 2 === 0 ? P.trim : P.hullDark));

  // ---- hood wedge
  b.extrude(
    [[1.7, 0.75], [3.0, 0.75], [3.0, 1.2], [2.55, 1.52], [1.7, 1.62]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: hood, bone },
  );
  // hood creases
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 1.6, 1.75], [s * 0.5, 1.5, 2.6], 0.012, P.hullDark, { bone });
    b.rod([s * 1.1, 1.58, 1.75], [s * 1.1, 1.3, 2.9], 0.02, P.trim, { bone, sides: 4 });
    // side cheek plates
    box(0.06, 0.38, 1.0, P.plate, [s * 1.17, 0.98, 2.4]);
    // headlight slits
    glow(
      b.extrude([[0, 0], [0.55, 0.08], [0.55, 0.2], [0, 0.1]], {
        at: [s * 0.55, 0.93, 3.0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.07, color: "#dffcff", bone,
      }),
      2,
    );
    // camera eyes
    box(0.2, 0.14, 0.2, P.hullDark, [s * 0.55, 1.45, 2.72]);
    glow(
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 8), P.neonRed, {
        bone, at: [s * 0.55, 1.45, 2.84], dir: [0, 0, 1],
      }),
      2,
    );
    // bull-bar uprights
    b.rod([s * 0.95, 0.78, 2.98], [s * 0.95, 1.32, 2.98], 0.04, P.steel, { bone, sides: 6, caps: "flat" });
    b.rod([s * 0.4, 0.8, 2.98], [s * 0.4, 1.3, 2.98], 0.035, P.steel, { bone, sides: 6, caps: "flat" });
    b.rod([s * 0.95, 1.3, 2.98], [s * 1.1, 1.3, 2.85], 0.035, P.steel, { bone, sides: 6 });
    // tow hook eyes
    b.rod([s * 0.7, 0.72, 2.95], [s * 0.7, 0.72, 3.02], 0.025, P.trim, { bone, sides: 5, caps: "flat" });
  }
  b.rod([-0.95, 1.3, 2.98], [0.95, 1.3, 2.98], 0.04, P.steel, { bone, sides: 6, caps: "flat" });
  b.rod([-0.95, 0.85, 2.98], [0.95, 0.85, 2.98], 0.045, P.steel, { bone, sides: 6, caps: "flat" });
  b.rod([-0.95, 1.08, 2.98], [0.95, 1.08, 2.98], 0.025, P.steel, { bone, sides: 6, caps: "flat" });
  // bull-bar mounting stubs
  for (const x of [-0.95, 0.95, -0.4, 0.4]) box(0.06, 0.06, 0.2, P.steel, [x, 1.2, 2.92]);

  // ---- grille
  box(1.1, 0.3, 0.06, P.hullDark, [0, 1.0, 3.02]);
  for (let i = 0; i < 11; i++) box(0.03, 0.26, 0.03, P.rim, [-0.5 + i * 0.1, 1.0, 3.07]);
  glow(box(1.1, 0.035, 0.05, P.neonMagenta, [0, 1.19, 3.04]), 2.2);
  glow(box(1.1, 0.025, 0.05, P.neonMagenta, [0, 0.83, 3.04]), 1.5);

  // ---- ram plate with hazard stripes
  box(2.3, 0.2, 0.08, hazard, [0, 0.78, 3.04]);
  box(2.34, 0.04, 0.1, P.hullDark, [0, 0.67, 3.03]);

  // ---- licence plate
  const plate = svg(
    `<svg viewBox="0 0 100 24"><rect width="100" height="24" rx="3" fill="#e9eef5"/><rect x="2" y="2" width="96" height="20" rx="2" fill="none" stroke="#14161d" stroke-width="1.5"/><text x="50" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#14161d">RC-9 KS</text><rect x="4" y="4" width="14" height="3" fill="#ff2bd6"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
    bone, at: [0, 0.78, 3.088], dir: [0, 0, 1], axis: "z", texture: plate,
  });

  // ---- hood logo decal
  const logo = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#14161d" stroke="#f2c515" stroke-width="5"/><path d="M50 14 L82 68 L18 68Z" fill="none" stroke="#2ff3ff" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="48" r="9" fill="#ff2bd6"/><text x="50" y="86" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#f2c515">KIROSHI</text><text x="50" y="34" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#e9eef5">警備</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
    bone, at: [0, 1.58, 2.15], dir: [0, 1, 0.118], axis: "z", up: [0, 0, 1], texture: logo,
  });

  // ---- siren grille
  box(0.5, 0.07, 0.22, P.hullDark, [0, 1.52, 2.45], { rotation: [6, 0, 0] });
  for (let i = 0; i < 5; i++) {
    const c = i % 2 ? P.neonBlue : P.neonRed;
    glow(box(0.07, 0.02, 0.18, c, [-0.18 + i * 0.09, 1.56, 2.45], { rotation: [6, 0, 0] }), 2);
  }

  // ---- sloped leading-edge trim
  b.rod([-1.15, 1.2, 3.0], [1.15, 1.2, 3.0], 0.025, P.trim, { bone, sides: 4 });
}
    return buildFrontFace;
  })(),
  // neonLights
  (() => {
function buildNeonLights({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: string, at: number[], s = 1, opts: any = {}) =>
    glow(b.part(g, color, { bone, at, ...opts }), s);
  const dark = (g: THREE.BufferGeometry, color: string, at: number[], opts: any = {}) =>
    b.part(g, color, { bone, at, ...opts });

  const HULL_HALF = 1.15;
  const sillY = M.sillLine[1];

  // ---- Sill neon strips (both sides) ----
  for (const s of [1, -1]) {
    // brackets / housing
    dark(box(0.06, 0.14, 4.6), P.hullDark, [s * (HULL_HALF + 0.03), sillY, 0.1]);
    put(box(0.04, 0.05, 4.5), P.neonCyan, [s * (HULL_HALF + 0.07), sillY + 0.03, 0.1], 1.6);
    put(box(0.04, 0.05, 4.5), P.neonMagenta, [s * (HULL_HALF + 0.07), sillY - 0.04, 0.1], 1.6);
    // end caps
    for (const z of [-2.2, 2.35]) dark(box(0.09, 0.17, 0.06), P.trim, [s * (HULL_HALF + 0.04), sillY, z]);
    // underglow emitters
    put(box(0.08, 0.03, 4.0), P.neonCyan, [s * 0.95, 0.43, 0.1], 1.4);
    // hazard warning panels
    const haz = svg(
      `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#14161d"/>
      <g fill="#f2c515"><path d="M-8 32 L8 0 L20 0 L4 32Z"/><path d="M16 32 L32 0 L44 0 L28 32Z"/><path d="M40 32 L56 0 L68 0 L52 32Z"/></g>
      <rect x="1" y="1" width="62" height="30" fill="none" stroke="#f2c515" stroke-width="2"/></svg>`,
      { size: 128 },
    );
    for (const z of [1.5, -1.9]) {
      b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
        bone,
        at: [s * (HULL_HALF + 0.075), 1.0, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: haz,
      });
    }
  }
  // underglow front/back
  put(box(1.7, 0.03, 0.08), P.neonMagenta, [0, 0.42, 2.7], 1.4);
  put(box(1.7, 0.03, 0.08), P.neonMagenta, [0, 0.42, -2.9], 1.4);

  // ---- Ad billboard side panels (kanji + logos) ----
  const ad = svg(
    `<svg viewBox="0 0 160 64"><rect width="160" height="64" rx="4" fill="#0a0612"/>
    <rect x="2" y="2" width="156" height="60" rx="3" fill="none" stroke="#ff2bd6" stroke-width="2.5"/>
    <text x="10" y="34" font-size="30" font-weight="bold" fill="#2ff3ff" font-family="sans-serif">警備</text>
    <text x="78" y="28" font-size="16" font-weight="bold" fill="#ff2bd6" font-family="sans-serif">KIROSHI</text>
    <text x="78" y="46" font-size="12" fill="#f2c515" font-family="sans-serif">SECURITY</text>
    <path d="M10 52 H150" stroke="#2ff3ff" stroke-width="2"/>
    <circle cx="140" cy="14" r="6" fill="none" stroke="#ff2a3a" stroke-width="2"/></svg>`,
    { size: 512 },
  );
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(1.5, 0.6), "#ffffff", {
        bone,
        at: [s * (HULL_HALF + 0.09), 1.22, -0.7],
        dir: [s, 0, 0],
        axis: "z",
        texture: ad,
      }),
      1.1,
    );
  }

  // ---- Rear taillights + sign ----
  const rz = M.rearFace[2];
  put(box(2.0, 0.1, 0.06), P.neonRed, [0, 1.25, rz - 0.04], 1.8);
  put(box(2.0, 0.06, 0.06), P.neonRed, [0, 0.8, rz - 0.04], 1.4);
  for (const s of [1, -1]) {
    dark(box(0.12, 0.35, 0.1), P.hullDark, [s * 1.0, 1.02, rz - 0.04]);
    put(box(0.08, 0.28, 0.06), P.neonRed, [s * 1.0, 1.02, rz - 0.1], 1.8);
  }
  const sign = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#07070b"/>
    <rect x="2" y="2" width="124" height="36" fill="none" stroke="#ff2a3a" stroke-width="2"/>
    <text x="64" y="26" text-anchor="middle" font-size="19" font-weight="bold" fill="#ff2a3a" font-family="monospace">STAND BACK</text></svg>`,
    { size: 512 },
  );
  dark(box(1.2, 0.34, 0.05), P.hullDark, [0, 1.5, rz - 0.03]);
  glow(
    b.part(new THREE.PlaneGeometry(1.1, 0.34), "#ffffff", {
      bone,
      at: [0, 1.5, rz - 0.065],
      dir: [0, 0, -1],
      axis: "z",
      texture: sign,
    }),
    1.5,
  );

  // ---- Roof light bar ----
  const barZ = 1.3;
  const barY = 2.15;
  dark(box(1.7, 0.08, 0.34), P.hullDark, [0, barY + 0.04, barZ]);
  for (const s of [1, -1]) {
    dark(box(0.1, 0.1, 0.3), P.plate, [s * 0.6, barY + 0.05, barZ]);
    dark(box(0.1, 0.22, 0.38), P.trim, [s * 0.88, barY + 0.14, barZ]);
  }
  const n = 8;
  for (let i = 0; i < n; i++) {
    const x = -0.72 + (i + 0.5) * (1.44 / n);
    const col = i % 2 === 0 ? P.neonRed : P.neonBlue;
    put(box(1.44 / n - 0.03, 0.18, 0.28), col, [x, barY + 0.17, barZ], 2);
    dark(box(0.02, 0.2, 0.3), P.hullDark, [x + 0.09, barY + 0.17, barZ]);
  }
  dark(box(1.62, 0.04, 0.4), P.plate, [0, barY + 0.28, barZ]);
  put(box(1.4, 0.02, 0.03), P.neonCyan, [0, barY + 0.31, barZ + 0.19], 1.4);

  // ---- Front white-cyan accent strip under bar ----
  put(box(1.3, 0.03, 0.04), P.white, [0, barY + 0.01, barZ + 0.19], 1.2);
}
    return buildNeonLights;
  })(),
  // turretBase
  (() => {
function buildTurretBase({ b, J, P, M }: Ctx) {
  const turret = J.turret;
  const body = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const HULLP = panelled(
    paint((p, n) => {
      const g = noise(p, 0.25, 4);
      return mix(P.hull, P.plate, 0.25 + 0.4 * g * smoothstep(-0.2, 1, n.y));
    }),
    { size: 0.22, rivets: 0.05 },
  );
  const DARKP = metal("iron", { tarnish: 0.6, size: 0.1 });
  const TANKP = paint((p, n) => {
    const g = noise(p, 0.18, 7);
    const grime = smoothstep(0.1, -0.4, n.y) * 0.5 + (g > 0.62 ? 0.25 : 0);
    return mix(P.tank, P.grime, grime);
  });
  const HAZ = paint((p) => (Math.floor((p.x + p.y + p.z) / 0.07) % 2 ? P.trim : P.hullDark));

  // ---------- textures ----------
  const stencil = svg(
    `<svg viewBox="0 0 200 60"><rect width="200" height="60" fill="#14161d"/>
    <rect x="3" y="3" width="194" height="54" fill="none" stroke="#f2c515" stroke-width="3" stroke-dasharray="10 4"/>
    <text x="100" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#e9eef5">KIROSHI SECURITY</text>
    <text x="100" y="47" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#ff2bd6">警備 · RC-9</text></svg>`,
    { size: 400 },
  );
  const gaugeStrip = svg(
    `<svg viewBox="0 0 24 128"><rect width="24" height="128" fill="#05222c"/>
    <rect x="5" y="40" width="14" height="84" fill="#2ff3ff"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="2" y="${8 + i * 16}" width="20" height="2" fill="#e9eef5"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f2c515"/>
    <path d="M32 8 L58 54 H6Z" fill="none" stroke="#14161d" stroke-width="5"/>
    <rect x="29" y="24" width="6" height="16" fill="#14161d"/><rect x="29" y="44" width="6" height="6" fill="#14161d"/></svg>`,
    { size: 128 },
  );

  const at = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];
  const box = (w: number, h: number, d: number, c: any, pos: [number, number, number], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at: pos, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, pos: [number, number, number], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at: pos, ...opts });

  const [rx, ry, rz] = M.turretRing;

  // ---------- roof deck plate under turret ----------
  box(1.7, 0.06, 1.7, HULLP, at(0, 1.93, rz - 0.4));

  // ---------- rotating ring (rides turret) ----------
  b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.62, 0.05],
      [0.55, 0.08],
      [0.5, 0.2],
      [0.46, 0.3],
      [0, 0.3],
    ],
    { at: [rx, 1.88, rz], bone: turret, segments: 10, color: HULLP },
  );
  b.lathe(
    [
      [0.5, 0],
      [0.66, 0],
      [0.66, 0.04],
      [0.5, 0.04],
    ],
    { at: [rx, 1.94, rz], bone: turret, segments: 12, color: HAZ },
  );
  // armored cylindrical housing
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.2, 8), DARKP, { bone: turret, at: at(rx, 2.12, rz), flat: true });
  b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 8), P.steel, { bone: turret, at: at(rx, 2.24, rz), flat: true });
  // bolts around ring
  b.ring(
    { at: new THREE.Vector3(rx, 1.97, rz), axis: new THREE.Vector3(0, 1, 0) },
    { count: 12, radius: 0.58 },
    (it) => b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), P.rim, { bone: turret, at: it.at }),
  );
  // trunnion cradle uprights where the cannon sits
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.3), HULLP, { bone: turret, at: at(s * 0.3, 2.35, rz) });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), P.trim, {
      bone: turret,
      at: at(s * 0.37, 2.15, rz),
      dir: [1, 0, 0],
    });
  }
  // front shield plate on turret
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.08), HULLP, { bone: turret, at: at(0, 2.3, rz + 0.45) });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.02), P.trim, { bone: turret, at: at(0, 2.3, rz + 0.5) });

  // ---------- rear water tank ----------
  const tz = -2.1;
  const ty = 2.2;
  const tank = b.part(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 12), TANKP, {
    bone: body,
    at: at(0, ty, tz),
    dir: [0, 0, 1],
    flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.34, 0.42, 0.14, 12), TANKP, {
      bone: body,
      at: at(0, ty, tz + s * 0.66),
      dir: [0, 0, s],
    });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), P.steel, {
      bone: body,
      at: at(0, ty, tz + s * 0.76),
      dir: [0, 0, s],
    });
  }
  // ribbed bands
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.CylinderGeometry(0.445, 0.445, 0.05, 12), P.steel, {
      bone: body,
      at: at(0, ty, tz - 0.5 + i * 0.25),
      dir: [0, 0, 1],
    });
  }
  // hazard stripe band
  b.part(new THREE.CylinderGeometry(0.455, 0.455, 0.12, 12), HAZ, {
    bone: body,
    at: at(0, ty, tz + 0.1),
    dir: [0, 0, 1],
  });
  // tank cradle saddles
  for (const z of [tz - 0.4, tz + 0.5]) {
    box(0.95, 0.14, 0.12, DARKP, at(0, 1.98, z));
    for (const s of [1, -1]) box(0.08, 0.22, 0.12, DARKP, at(s * 0.4, 2.05, z), { rotation: [0, 0, s * 20] });
  }
  // level gauge strip (glowing) on side of tank
  for (const s of [1, -1]) {
    box(0.03, 0.34, 0.07, P.hullDark, at(s * 0.425, ty + 0.02, tz - 0.1));
    glow(
      b.part(new THREE.PlaneGeometry(0.06, 0.3), "#ffffff", {
        bone: body,
        at: at(s * 0.445, ty + 0.02, tz - 0.1),
        dir: [s, 0, 0],
        axis: "z",
        texture: gaugeStrip,
      }),
      1.4,
    );
  }
  // filler cap on top
  cyl(0.09, 0.09, 0.06, 8, P.steel, at(0, ty + 0.3, tz - 0.2));
  cyl(0.04, 0.04, 0.06, 6, P.trim, at(0, ty + 0.35, tz - 0.2));

  // ---------- hoses and pipes tank -> cannon ----------
  const hose = (side: number) => {
    const pts = [
      at(side * 0.3, ty - 0.05, tz + 0.7),
      at(side * 0.45, 2.1, tz + 1.0),
      at(side * 0.45, 2.0, rz - 0.3),
      at(side * 0.3, 2.2, rz - 0.05),
    ];
    b.sweep(pts, 0.035, { bone: body, color: P.rubber, sides: 6 });
    // pipe clamps
    for (const p of [pts[1], pts[2]]) cyl(0.05, 0.05, 0.05, 6, P.trim, at(p[0], p[1], p[2]), { dir: [0, 0, 1] });
  };
  hose(1);
  hose(-1);
  // rigid steel pipe along roof center
  b.rod(at(0, ty - 0.2, tz + 0.7), at(0, 2.05, rz - 0.4), 0.04, P.steel, { bone: body, sides: 6 });
  cyl(0.065, 0.065, 0.08, 6, P.trim, at(0, 2.05, rz - 0.4), { dir: [0, 0, 1] });

  // ---------- pump motor box ----------
  const px = 0.62;
  const pz = -1.75;
  box(0.5, 0.3, 0.6, HULLP, at(px, 2.08, pz));
  box(0.54, 0.04, 0.64, P.trim, at(px, 2.24, pz));
  for (let i = 0; i < 5; i++) box(0.4, 0.015, 0.04, P.hullDark, at(px, 2.12, pz - 0.2 + i * 0.1 + 0.0), {});
  for (let i = 0; i < 4; i++) box(0.51, 0.03, 0.02, P.hullDark, at(px, 2.0 + i * 0.07, pz + 0.31));
  cyl(0.1, 0.1, 0.12, 8, P.steel, at(px + 0.26, 2.08, pz), { dir: [1, 0, 0] });
  glow(box(0.1, 0.04, 0.04, P.neonCyan, at(px, 2.2, pz + 0.32)), 1.5);
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: body,
    at: at(px, 2.1, pz + 0.311),
    dir: [0, 0, 1],
    axis: "z",
    texture: warn,
  });

  // ---------- roof rack rails (left side) ----------
  const railX = -0.82;
  for (const z of [-2.9, -2.3, -1.7, -1.1, -0.6]) box(0.05, 0.2, 0.05, P.steel, at(railX, 2.03, z));
  b.rod(at(railX, 2.14, -2.95), at(railX, 2.14, -0.55), 0.025, P.steel, { bone: body, sides: 6 });
  b.rod(at(railX, 2.04, -2.95), at(railX, 2.04, -0.55), 0.02, P.steel, { bone: body, sides: 6 });
  // right rail short
  const rr = 0.9;
  for (const z of [-2.9, -2.4, -2.0]) box(0.05, 0.16, 0.05, P.steel, at(rr, 2.0, z));
  b.rod(at(rr, 2.1, -2.95), at(rr, 2.1, -1.95), 0.025, P.steel, { bone: body, sides: 6 });

  // ---------- ladder on rear face ----------
  const lz = -2.98;
  for (const s of [1, -1]) box(0.05, 0.5, 0.05, P.steel, at(s * 0.25 - 0.55, 2.2, lz + 0.05));
  for (let i = 0; i < 4; i++)
    b.rod(at(-0.8, 1.99 + i * 0.14, lz + 0.05), at(-0.3, 1.99 + i * 0.14, lz + 0.05), 0.015, P.trim, {
      bone: body,
      sides: 6,
    });

  // ---------- rear spoiler plate with stencil ----------
  box(1.9, 0.07, 0.3, HULLP, at(0, 2.42, -2.82), { rotation: [-8, 0, 0] });
  for (const s of [1, -1]) {
    box(0.07, 0.4, 0.3, HULLP, at(s * 0.95, 2.25, -2.82));
    box(0.075, 0.1, 0.3, P.trim, at(s * 0.95, 2.43, -2.82));
  }
  b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", {
    bone: body,
    at: at(0, 2.3, -2.98),
    dir: [0, 0, -1],
    axis: "z",
    texture: stencil,
  });
  box(1.9, 0.02, 0.05, HAZ, at(0, 2.46, -2.97), { rotation: [-8, 0, 0] });

  // ---------- grime / bolts on deck, small details ----------
  const deck = [
    [-0.6, 1.97, -0.8],
    [0.6, 1.97, -0.8],
    [-0.6, 1.97, -1.9],
    [0.2, 1.97, -2.7],
    [-0.4, 1.97, -2.7],
  ];
  for (const d of deck) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.rim, { bone: body, at: at(d[0], d[1], d[2]) });
  // antenna whip on tank cradle
  b.rod(at(0.8, 2.0, -1.0), at(0.82, 2.42, -1.05), [0.015, 0.006], P.steel, { bone: body, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonRed, { bone: body, at: at(0.82, 2.44, -1.05) }), 2);
}
    return buildTurretBase;
  })(),
  // waterCannon
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildWaterCannon({ b, J, P, M }: Ctx) {
  const cannon = J.cannon;
  const turret = J.turret;
  const CY = M.cannonPivot[1];
  const CX = M.cannonPivot[0];

  const hazard = stripes(P.trim, P.hullDark, { size: 0.07, axis: [0, 0, 1], width: 0.5, wobble: 0.02 });
  const stained = paint((p, n) => {
    const base = P.steel;
    const drip = noise(p, 0.06, 4);
    const low = smoothstep(0.3, -0.8, n.y);
    return mix(mix(base, P.plate, 0.35), P.tank, Math.min(1, low * 0.5 + (drip > 0.62 ? 0.35 : 0)));
  });
  const barrelPaint = paint((p, n) => {
    const w = noise(p, 0.1, 9);
    const c = mix(P.plate, P.steel, smoothstep(0.2, 0.9, n.y * 0.5 + 0.5) * 0.6 + w * 0.3);
    return mix(c, P.grime, 0.25 * smoothstep(0.6, 0.85, noise(p, 0.05, 2)));
  });

  // Barrel: axis along z at y=CY
  const barrelBack = [CX, CY, -1.3] as [number, number, number];
  const barrelMid = [CX, CY, 1.3] as [number, number, number];
  b.rod(barrelBack, barrelMid, 0.17, barrelPaint, { bone: cannon, sides: 8, caps: "flat" });
  // breech cap
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 8), P.hullDark, { bone: cannon, at: [CX, CY, -1.38], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.14, 0.2, 0.14, 8), P.plate, { bone: cannon, at: [CX, CY, -1.5 + 0.05], dir: [0, 0, 1] });

  // Nozzle flare
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.19, 0.12],
      [0.25, 0.5],
      [0.24, 0.52],
      [0.17, 0.5],
      [0.12, 0.2],
      [0, 0.2],
    ],
    { at: [CX, CY, 1.3], axis: [0, 0, 1], segments: 8, color: P.steel, bone: cannon },
  );
  // glowing mouth
  glow(
    b.part(new THREE.CircleGeometry(0.17, 8), P.neonCyan, { bone: cannon, at: [CX, CY, 1.795], dir: [0, 0, 1], axis: "z" }),
    1.6,
  );
  glow(b.part(new THREE.TorusGeometry(0.235, 0.018, 4, 8), P.neonCyan, { bone: cannon, at: [CX, CY, 1.8], dir: [0, 0, 1], axis: "z" }), 1.6);

  // Ring bands along barrel and nozzle
  const bandZ = [1.15, 0.7, 0.25, -0.2, -0.65, -1.1];
  bandZ.forEach((z, i) => {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8), i % 2 === 0 ? hazard : P.hullDark, {
      bone: cannon,
      at: [CX, CY, z],
      dir: [0, 0, 1],
    });
  });
  for (const z of [1.62, 1.95]) {
    b.part(new THREE.CylinderGeometry(0.255, 0.255, 0.04, 8), P.trim, { bone: cannon, at: [CX, CY, z], dir: [0, 0, 1] });
  }
  // neon accent rings
  for (const z of [0.95, -0.45]) {
    glow(
      b.part(new THREE.TorusGeometry(0.2, 0.014, 4, 8), P.neonMagenta, { bone: cannon, at: [CX, CY, z], dir: [0, 0, 1], axis: "z" }),
      1.4,
    );
  }

  // Trunnion cradle: arms on turret
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.08, 0.34, 0.5), P.plate, { bone: turret, at: [s * 0.3, CY - 0.1, -0.4] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 8), P.steel, {
      bone: cannon,
      at: [s * 0.25, CY, -0.4],
      dir: [1, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.06, 0.1, 0.55), P.trim, { bone: turret, at: [s * 0.34, CY - 0.26, -0.4] });
  }
  b.part(new THREE.BoxGeometry(0.56, 0.08, 0.5), P.hullDark, { bone: turret, at: [CX, CY - 0.28, -0.4] });

  // Pipe feeds from rear underside
  const feed = b.sweep(
    [
      [0.1, CY - 0.15, -1.45],
      [0.18, CY - 0.1, -1.45],
      [0.3, CY + 0.12, -1.0],
      [0.22, CY + 0.17, -0.7],
    ],
    0.035,
    { color: P.rubber, bone: cannon, sides: 6 },
  );
  b.sweep(
    [
      [-0.1, CY - 0.15, -1.45],
      [-0.3, CY - 0.05, -1.3],
      [-0.28, CY + 0.15, -0.9],
      [-0.2, CY + 0.17, -0.6],
    ],
    0.035,
    { color: P.rubber, bone: cannon, sides: 6 },
  );
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), P.steel, { bone: cannon, at: [s * 0.2, CY + 0.17, -0.65], dir: [0, 0, 1] });

  // Pressure gauge on left side (+X)
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), P.hullDark, { bone: cannon, at: [CX + 0.2, CY + 0.02, 0.0], dir: [1, 0, 0] });
  b.part(new THREE.CircleGeometry(0.085, 16), "#ffffff", {
    bone: cannon,
    at: [CX + 0.227, CY + 0.02, 0.0],
    dir: [1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture: gaugeTexture({ needle: 70, label: "BAR" }),
  });
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.06), P.steel, { bone: cannon, at: [CX + 0.18, CY - 0.1, 0.0] });

  // Targeting laser sensor box on top
  b.part(new THREE.BoxGeometry(0.16, 0.1, 0.3), P.hullDark, { bone: cannon, at: [CX, CY + 0.22, 0.75] });
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.12), P.plate, { bone: cannon, at: [CX, CY + 0.28, 0.65] });
  glow(b.part(new THREE.BoxGeometry(0.05, 0.05, 0.02), P.neonRed, { bone: cannon, at: [CX, CY + 0.22, 0.91] }), 2);
  b.rod([CX, CY + 0.19, 0.6], [CX, CY + 0.19, 0.4], 0.01, P.steel, { bone: cannon });

  // Stencil on barrel side
  const stencil = svg(
    `<svg viewBox="0 0 120 30"><rect width="120" height="30" fill="none"/><text x="60" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#f2c515">AQUA-9</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.5, 0.125), "#ffffff", {
      bone: cannon,
      at: [CX + s * 0.176, CY + 0.02, 0.5],
      dir: [s, 0, 0],
      axis: "z",
      texture: stencil,
    });
  }

  // Water-stained drips under nozzle
  const r = rng(11);
  for (let i = 0; i < 5; i++) {
    const z = 1.55 + r() * 0.35;
    const x = (r() - 0.5) * 0.2;
    b.part(new THREE.CylinderGeometry(0.008, 0.012, 0.05 + r() * 0.06, 5), P.neonCyan, {
      bone: cannon,
      at: [CX + x, CY - 0.25, z],
    });
  }
  b.part(new THREE.SphereGeometry(0.03, 6, 4), P.tank, { bone: cannon, at: [CX + 0.05, CY - 0.36, 1.85] });

  // Stained collar plate mid-barrel
  b.part(new THREE.BoxGeometry(0.4, 0.06, 0.4), stained, { bone: cannon, at: [CX, CY - 0.19, 0.5] });
}
    return buildWaterCannon;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.2,0.52,1.95], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.2,0.52,1.95], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.2,0.52,-1.85], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.2,0.52,-1.85], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turret"] = b.joint("turret", { parent: J["body"], at: [0,1.9,-1.3], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannon"] = b.joint("cannon", { parent: J["turret"], at: [0,2.15,-1.3], dir: [0,0,1], role: "hinge", group: "turret" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
