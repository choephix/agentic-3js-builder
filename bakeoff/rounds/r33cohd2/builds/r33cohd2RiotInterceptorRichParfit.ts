import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, stripes, mix, noise, smoothstep, countershade, mottle, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  "name": "Arasaka-Style Riot Interceptor RCV-9",
  "description": "A heavy corporate riot-control hover-wheeled interceptor with a roof water cannon, neon light bars and cyberpunk decals."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2a2e38",
  hullLight: "#464c5a",
  hullDark: "#14161c",
  armor: "#5a6070",
  hazard: "#f2c200",
  corpRed: "#d1202f",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonYellow: "#fff04a",
  glass: "#0c1a2a",
  tire: "#0e0e11",
  rim: "#8a90a0",
  water: "#7fd8ff",
  steel: "#9aa0ae",
};
const M = {
  deckTop: [0, 1.75, -0.6] as [number, number, number],
  cabFloor: [0, 0.7, 1.4] as [number, number, number],
  turretRing: [0, 1.95, -1.1] as [number, number, number],
  cannonPivot: [0, 2.2, -1.1] as [number, number, number],
  axleFront: [0, 0.5, 1.9] as [number, number, number],
  axleRear: [0, 0.5, -1.8] as [number, number, number],
  noseTip: [0, 0.8, 3] as [number, number, number],
  roofBarMount: [0, 1.95, 1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // lowerHull
  (() => {
function buildLowerHull({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const hullPaint = paint((p, n, s) => {
    const base = panelled(P.hull, { size: 0.5, aspect: 0.6, rivets: 0.1, seam: P.hullDark }).at(p, n);
    const grime = smoothstep(0.7, 0.25, p.y) * (0.35 + 0.4 * noise(p, 0.15, 4));
    const up = smoothstep(0.0, 1.0, n.y) * 0.12;
    const c = mix(base as any, P.hullDark, grime);
    return mix(c, P.hullLight, up);
  });
  const hazard = stripes(P.hazard, P.hullDark, { size: 0.14, axis: [1, 0, 1], width: 0.5, wobble: 0.02 });
  const dark = paint((p, n) => mix(P.hullDark, "#3a2f24", smoothstep(0.5, 0.2, p.y) * noise(p, 0.12, 9)));

  // main tub loft
  b.loft(
    [
      { at: [0, 0.78, -2.95], w: 2.3, h: 0.9 },
      { at: [0, 0.8, -1.8], w: 2.55, h: 1.0 },
      { at: [0, 0.8, 0], w: 2.6, h: 1.0 },
      { at: [0, 0.78, 1.8], w: 2.5, h: 0.95 },
      { at: [0, 0.72, 2.95], w: 2.0, h: 0.7 },
    ],
    { bone, color: hullPaint, section: "box", caps: "flat" },
  );

  // underbody plate and skid plates
  b.part(new THREE.BoxGeometry(2.0, 0.08, 5.6), dark, { bone, at: [0, 0.27, 0] });
  for (const z of [-2, -0.7, 0.7, 2]) {
    b.part(new THREE.BoxGeometry(1.5, 0.05, 0.9), P.armor, { bone, at: [0, 0.23, z] });
    for (const x of [-0.65, 0.65]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.steel, { bone, at: [x, 0.2, z] });
  }

  const neonSpec: [number, string][] = [[1, P.neonCyan], [-1, P.neonMagenta]];
  for (const [s, col] of neonSpec) {
    // side skirts
    b.part(new THREE.BoxGeometry(0.12, 0.3, 2.0), P.hullLight, { bone, at: [s * 1.31, 0.5, 0] });
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.7), P.armor, { bone, at: [s * 1.32, 0.52, -2.4] });
    // sill armour with hazard stripes
    b.part(new THREE.BoxGeometry(0.14, 0.16, 2.2), hazard, { bone, at: [s * 1.33, 0.36, 0] });
    // neon strip
    glow(b.part(new THREE.BoxGeometry(0.05, 0.06, 2.0), col, { bone, at: [s * 1.38, 0.62, 0] }), 1.6);
    for (const z of [-1.05, 1.05]) b.part(new THREE.BoxGeometry(0.08, 0.1, 0.1), P.hullDark, { bone, at: [s * 1.36, 0.62, z] });
    // tow hooks
    b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.steel, { bone, at: [s * 0.8, 0.5, 3.0] });
    b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.steel, { bone, at: [s * 0.8, 0.5, -3.0] });
    // exhaust pipes
    b.part(new THREE.CylinderGeometry(0.09, 0.1, 0.3, 8), P.steel, { bone, at: [s * 0.9, 0.42, -2.8], dir: [0, 0, 1] });
    glow(b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 8), "#ff6a1a", { bone, at: [s * 0.9, 0.42, -2.97], dir: [0, 0, 1] }), 1);
    // fender-area armour bumpers
    b.part(new THREE.BoxGeometry(0.1, 0.25, 0.5), P.armor, { bone, at: [s * 1.2, 0.5, 2.85] });
  }

  // rear bumper
  b.part(new THREE.BoxGeometry(2.5, 0.28, 0.2), P.armor, { bone, at: [0, 0.5, -2.9] });
  b.part(new THREE.BoxGeometry(2.5, 0.08, 0.22), hazard, { bone, at: [0, 0.66, -2.89] });
  // vents
  for (let i = 0; i < 5; i++) b.part(new THREE.BoxGeometry(0.5, 0.025, 0.06), P.hullDark, { bone, at: [0, 0.34 + i * 0.045, -3.07] });
  // front bumper lip and glow under-nose
  b.part(new THREE.BoxGeometry(2.1, 0.12, 0.25), P.armor, { bone, at: [0, 0.4, 3.0] });
  glow(b.part(new THREE.BoxGeometry(1.7, 0.03, 0.04), P.neonCyan, { bone, at: [0, 0.31, 3.1] }), 1.4);
  // red stripe
  b.part(new THREE.BoxGeometry(2.62, 0.06, 4.8), P.corpRed, { bone, at: [0, 0.98, -0.3] });
  // stencil label
  const label = svg(`<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#f2c200"/><text x="50" y="27" font-size="20" font-weight="bold" text-anchor="middle" fill="#14161c" font-family="monospace">RCV-9</text></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", { bone, at: [s * 1.305, 0.8, -1.2], dir: [s, 0, 0], axis: "z", texture: label });
}
    return buildLowerHull;
  })(),
  // runningGear
  (() => {
function buildRunningGear({ b, J, P }: any) {
  const R = 0.5;
  const W = 0.34;
  const tireMat = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const g = noise(p, 0.12, 3);
    return mix(P.tire, "#2a2a30", smoothstep(0.5, 0.9, g) * 0.6 + Math.max(0, -n.y) * 0.0);
  });
  const hazard = stripes(P.hazard, P.hullDark, { size: 0.12, axis: "x", width: 0.5 });
  const armorPaint = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix(mix(P.armor, P.hullDark, smoothstep(0.6, 0.0, p.y) * 0.7), "#3a2f26", smoothstep(0.55, 0.9, noise(p, 0.2, 5)) * 0.4 * (n.y < 0.5 ? 1 : 0)));
  const spokeTex = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#8a90a0" stroke="#14161c" stroke-width="4"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M50 50 L${50 + 40 * Math.cos(i * 1.047)} ${50 + 40 * Math.sin(i * 1.047)}" stroke="#14161c" stroke-width="9"/>`).join("")}
    <circle cx="50" cy="50" r="14" fill="#14161c"/><circle cx="50" cy="50" r="10" fill="#ff2bd6"/></svg>`, { size: 128 });
  const logoTex = svg(`<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#14161c"/><rect x="2" y="2" width="56" height="36" fill="none" stroke="#d1202f" stroke-width="3"/><path d="M14 30 L30 8 L46 30 M20 22 H40" stroke="#d1202f" stroke-width="5" fill="none"/></svg>`, { size: 96 });

  const wheels: [string, number, number][] = [["wheelFL", 1, 1.9], ["wheelFR", -1, 1.9], ["wheelRL", 1, -1.8], ["wheelRR", -1, -1.8]];
  for (const [name, s, z] of wheels) {
    const j = J[name];
    const x = s * 1.15;
    const axis: [number, number, number] = [s, 0, 0];
    const at = [x, R, z];
    // tire
    b.part(new THREE.CylinderGeometry(R, R, W, 14), tireMat, { bone: j, at, dir: axis, flat: true });
    // tread blocks
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(W * 0.95, 0.07, 0.12), P.tire, {
        bone: j, at: [x, R + Math.sin(a) * R, z + Math.cos(a) * R],
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // rim face
    const out = x + s * (W / 2 + 0.006);
    b.part(new THREE.CircleGeometry(0.31, 16), "#ffffff", { bone: j, at: [out, R, z], dir: axis, axis: "z", texture: spokeTex });
    b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.05, 14), P.rim, { bone: j, at: [x + s * 0.15, R, z], dir: axis });
    // hub glow ring
    glow(b.part(new THREE.TorusGeometry(0.1, 0.018, 5, 14), P.neonMagenta, { bone: j, at: [out + s * 0.01, R, z], dir: axis, axis: "z" }), 1.6);
    // brake disc and caliper
    b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.025, 14), P.steel, { bone: j, at: [x - s * 0.12, R, z], dir: axis });
    b.part(new THREE.BoxGeometry(0.08, 0.16, 0.14), P.corpRed, { bone: J.body, at: [x - s * 0.12, R + 0.22, z + 0.05] });
    // suspension
    b.rod([s * 0.75, 0.95, z], [x - s * 0.1, R + 0.1, z], 0.04, P.steel, { bone: J.body });
    b.rod([s * 0.7, 0.5, z + 0.35], [x - s * 0.15, R - 0.05, z], 0.035, P.hullLight, { bone: J.body });
    b.rod([s * 0.95, 0.95, z - 0.12], [x - s * 0.25, R + 0.05, z - 0.1], 0.05, P.hazard, { bone: J.body });
    // fender flare
    const fl = b.lathe([[0.55, -0.22], [0.62, -0.22], [0.62, 0.22], [0.55, 0.22]], {
      at: [x, R, z], axis: axis, segments: 14, color: armorPaint, bone: J.body });
    b.part(new THREE.BoxGeometry(0.4, 0.07, 1.2), hazard, { bone: J.body, at: [x + s * 0.02, 1.04, z] });
    b.part(new THREE.BoxGeometry(0.4, 0.4, 0.07), armorPaint, { bone: J.body, at: [x, 0.8, z + 0.5], rotation: [-30, 0, 0] });
    // mud flap
    const fz = z - 0.5;
    b.part(new THREE.BoxGeometry(0.04, 0.36, 0.4), P.hullDark, { bone: J.body, at: [x, 0.3, fz] });
    b.part(new THREE.PlaneGeometry(0.3, 0.2), "#ffffff", { bone: J.body, at: [x + s * 0.025, 0.3, fz], dir: axis, axis: "z", texture: logoTex });
  }
  // axle beams
  for (const z of [1.9, -1.8]) b.rod([-1.0, R, z], [1.0, R, z], 0.06, P.hullDark, { bone: J.body });
}
    return buildRunningGear;
  })(),
  // noseAndCab
  (() => {
function buildNoseAndCab({ b, J, P, M }: any) {
  const body = J.body;
  const hullP = countershade(mottle(P.hull, P.hullLight, { size: 0.25, seed: 4 }), P.hullDark, { level: -0.3 });
  const armorP = countershade(mottle(P.armor, P.hullLight, { size: 0.2, seed: 8 }), P.hullDark, { level: -0.2 });
  const box = (w: number, h: number, d: number, c: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...opts });

  // Sloped prow: lower block + sloped hood
  b.frustumBox([0, 0.85, 1.0], [0, 0.85, 3.0], [2.3, 0.7], [1.9, 0.45], { bone: body, color: hullP });
  b.extrude(
    [[0, 0], [2.0, 0], [0.35, 0.6], [0, 0.6]] as any,
    { at: [0, 1.2, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: armorP, bone: body },
  );
  // fix the extrude's thickness axis is x cross y => centred on x=0 -> moved by at
  // Hood centre plate
  box(1.8, 0.06, 1.3, hullP, [0, 1.52, 1.75], { rotation: [-14, 0, 0] });

  // Push bar
  box(2.2, 0.16, 0.2, P.hazard, [0, 0.72, 3.08]);
  for (const s of [1, -1]) {
    box(0.14, 0.5, 0.14, P.steel, [s * 0.95, 0.9, 3.02]);
    box(0.12, 0.3, 0.3, P.hullDark, [s * 0.95, 0.7, 2.9]);
  }
  for (let i = -4; i <= 4; i++) box(0.12, 0.17, 0.215, P.hullDark, [i * 0.24, 0.72, 3.08], { rotation: [0, 0, 30] });

  // Cyan visor strip
  glow(box(1.9, 0.07, 0.05, P.neonCyan, [0, 1.12, 2.99]), 2);
  // Lamp clusters
  for (const s of [1, -1]) {
    box(0.4, 0.2, 0.1, P.hullDark, [s * 0.7, 0.98, 2.98]);
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonYellow, { bone: body, at: [s * 0.78, 0.98, 3.04] }), 2);
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonYellow, { bone: body, at: [s * 0.62, 0.98, 3.04] }), 2);
  }
  // Grille slats
  box(0.9, 0.3, 0.06, P.hullDark, [0, 0.9, 2.99]);
  for (let i = 0; i < 5; i++) box(0.86, 0.025, 0.04, P.steel, [0, 0.8 + i * 0.06, 3.03]);

  // Hood emblem
  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#d1202f" stroke="#000" stroke-width="4"/><path d="M32 10 L50 50 L42 50 L32 28 L22 50 L14 50Z" fill="#fff"/><rect x="26" y="40" width="12" height="4" fill="#000"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
    bone: body, at: [0, 1.545, 1.75], dir: [0, 1, 0.25], axis: "z", up: [0, 0, -1], texture: logo,
  });

  // Cab shell
  b.frustumBox([0, 1.45, 0.85], [0, 1.45, 1.8], [2.4, 0.5], [2.3, 0.5], { bone: body, color: hullP });
  box(2.4, 0.08, 1.05, P.hullDark, [0, 1.92, 1.3]);
  box(2.3, 0.06, 0.95, armorP, [0, 1.96, 1.3]);
  // Windscreen
  const glassTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0c1a2a"/><path d="M8 32 L22 0 L30 0 L16 32Z M30 32 L44 0 L48 0 L34 32Z" fill="#2ff3ff" opacity="0.35"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(1.7, 0.55), "#ffffff", {
    bone: body, at: [0, 1.65, 1.78], dir: [0, 0.6, 0.8], axis: "z", texture: glassTex,
  });
  b.part(new THREE.PlaneGeometry(0.6, 0.5), "#ffffff", {
    bone: body, at: [0, 1.6, 1.8], dir: [0, 0.6, 0.8], axis: "z", texture: glassTex,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.3, 0.3), P.glass, {
      bone: body, at: [s * 1.0, 1.66, 1.65], dir: [s * 0.7, 0.55, 0.45], axis: "z",
    });
    // side window + cage
    box(0.04, 0.45, 0.8, P.glass, [s * 1.205, 1.6, 1.25]);
    for (let i = 0; i < 4; i++) box(0.05, 0.47, 0.02, P.steel, [s * 1.215, 1.6, 0.95 + i * 0.2]);
    for (let j = 0; j < 3; j++) box(0.05, 0.02, 0.82, P.steel, [s * 1.215, 1.43 + j * 0.17, 1.25]);
    // door seam
    box(0.03, 0.9, 0.02, P.hullDark, [s * 1.205, 1.1, 0.95]);
    box(0.03, 0.9, 0.02, P.hullDark, [s * 1.205, 1.1, 1.75]);
    box(0.06, 0.04, 0.2, P.steel, [s * 1.22, 1.2, 1.55]);
    // hazard stripe sill
    box(0.04, 0.1, 1.9, P.hazard, [s * 1.2, 0.75, 1.9]);
    // mirror
    box(0.04, 0.07, 0.04, P.steel, [s * 1.19, 1.6, 1.9]);
    b.rod([s * 1.18, 1.6, 1.85], [s * 1.18, 1.62, 2.0], 0.015, P.steel, { bone: body });
    box(0.06, 0.2, 0.06, P.hullDark, [s * 1.17, 1.62, 2.03]);
    glow(box(0.02, 0.04, 0.05, P.neonMagenta, [s * 1.19, 1.74, 2.03]), 2);
    // fender-top neon
    glow(box(0.04, 0.04, 1.4, s > 0 ? P.neonCyan : P.neonMagenta, [s * 1.22, 1.05, 2.2]), 1.8);
  }
  // red stripe on hood edge
  box(2.2, 0.04, 0.05, P.corpRed, [0, 1.33, 1.02]);
  box(0.12, 0.5, 0.05, P.corpRed, [0.6, 1.2, 3.0]);
  void M; void paint; void J;
}
    return buildNoseAndCab;
  })(),
  // roofLights
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildRoofLights({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const [mx, my, mz] = M.roofBarMount;
  const BASE = my; // 1.95
  const DARK = "#0a0b10";

  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, ...extra });

  const plate = paint((p, n) => {
    const k = noise(p, 0.12, 4);
    const c = mix(P.hullDark, P.hullLight, k * 0.6 + (n.y > 0.5 ? 0.2 : 0));
    return c;
  });

  // ---- main light bar
  const barY = BASE + 0.1;
  const barZ = mz;
  box(1.9, 0.08, 0.34, plate, [0, BASE + 0.04, barZ]);
  box(1.8, 0.14, 0.3, P.hullDark, [0, barY + 0.04, barZ]);
  // segments
  const segs = 8;
  const segW = 1.7 / segs;
  for (let i = 0; i < segs; i++) {
    const x = -0.85 + segW * (i + 0.5);
    const col = i % 2 === 0 ? P.corpRed : P.neonCyan;
    glow(box(segW * 0.9, 0.12, 0.26, col, [x, barY + 0.1, barZ]), 1.6);
    // glass lens dome
    b.part(new THREE.SphereGeometry(segW * 0.42, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), col, {
      bone: body, at: [x, barY + 0.15, barZ], scale: [1, 0.5, 1.4],
    });
    box(segW * 0.9, 0.04, 0.04, P.hullDark, [x, barY + 0.17, barZ + 0.1]);
  }
  // end caps
  for (const s of [1, -1]) box(0.08, 0.2, 0.36, P.hazard, [s * 0.95, barY + 0.05, barZ]);
  // magenta neon edge tubes
  for (const dz of [0.19, -0.19])
    glow(b.rod([-0.92, barY - 0.02, barZ + dz], [0.92, barY - 0.02, barZ + dz], 0.016, P.neonMagenta, { bone: body, sides: 6 }), 2);
  for (const s of [1, -1]) {
    glow(b.rod([s * 0.92, barY - 0.02, barZ - 0.19], [s * 0.92, barY - 0.02, barZ + 0.19], 0.016, P.neonMagenta, { bone: body, sides: 6 }), 2);
    // legs
    box(0.08, 0.06, 0.2, P.steel, [s * 0.7, BASE + 0.02, barZ]);
  }

  // ---- strobe pods on corners
  for (const sx of [1, -1])
    for (const [z, col] of [[1.45, P.neonCyan], [0.1, P.corpRed]] as [number, string][]) {
      cyl(0.09, 0.11, 0.05, 8, P.hullDark, [sx * 1.08, BASE + 0.03, z]);
      glow(b.part(new THREE.SphereGeometry(0.075, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), col, {
        bone: body, at: [sx * 1.08, BASE + 0.06, z],
      }), 1.8);
    }

  // ---- loudspeaker horns (front pair, facing forward)
  for (const s of [1, -1]) {
    const x = s * 0.5, z = 1.2;
    box(0.16, 0.1, 0.16, P.hullDark, [x, BASE + 0.05, z]);
    b.part(new THREE.CylinderGeometry(0.15, 0.06, 0.26, 8, 1, true), P.steel, {
      bone: body, at: [x, BASE + 0.2, z + 0.12], dir: [0, 0.1, 1], flat: true,
    });
    cyl(0.14, 0.14, 0.02, 8, DARK, [x, BASE + 0.2, z + 0.25], { dir: [0, 0.1, 1] });
    box(0.06, 0.06, 0.1, P.hullLight, [x, BASE + 0.12, z - 0.06]);
  }

  // ---- camera dome (centre-back)
  cyl(0.12, 0.14, 0.05, 10, P.hullDark, [0, BASE + 0.025, 0.4]);
  b.part(new THREE.SphereGeometry(0.1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.glass, {
    bone: body, at: [0, BASE + 0.05, 0.4],
  });
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.neonCyan, { bone: body, at: [0, BASE + 0.1, 0.46] }), 2);

  // ---- antenna masts with blinking tips
  const masts: [number, number, number, string][] = [
    [0.95, 0.0, 0.95, P.corpRed],
    [-0.95, 0.0, 1.0, P.neonYellow],
  ];
  for (const [x, z, h, col] of masts) {
    const zz = z + 0.25;
    cyl(0.05, 0.06, 0.05, 8, P.hullDark, [x, BASE + 0.025, zz]);
    b.rod([x, BASE + 0.05, zz], [x, BASE + 0.05 + h * 0.4, zz], [0.02, 0.012], P.steel, { bone: body, sides: 6 });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), col, { bone: body, at: [x, BASE + 0.07 + h * 0.4, zz] }), 2.4);
    cyl(0.03, 0.03, 0.02, 6, P.hazard, [x, BASE + 0.25, zz]);
  }

  // ---- sat dish
  const dx = 0.7, dz = 0.2;
  cyl(0.04, 0.05, 0.2, 6, P.steel, [dx, BASE + 0.1, dz]);
  b.part(new THREE.SphereGeometry(0.2, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.4), P.armor, {
    bone: body, at: [dx, BASE + 0.32, dz], rotation: [-100, 0, 0], flat: true, scale: [1, 0.7, 1],
  });
  b.rod([dx, BASE + 0.3, dz], [dx, BASE + 0.42, dz + 0.17], 0.01, P.steel, { bone: body, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonMagenta, { bone: body, at: [dx, BASE + 0.43, dz + 0.18] }), 2);

  // ---- warning label decals
  const WARN = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#f2c200"/><rect x="2" y="2" width="60" height="28" rx="2" fill="none" stroke="#14161c" stroke-width="2"/>
    <path d="M14 26 L24 6 L34 26Z" fill="#14161c"/><rect x="23" y="12" width="2" height="8" fill="#f2c200"/>
    <text x="38" y="15" font-size="9" font-family="monospace" font-weight="bold" fill="#14161c">警告</text>
    <text x="38" y="26" font-size="7" font-family="monospace" fill="#d1202f">STROBE</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", {
      bone: body, at: [s * 0.3, barY + 0.045, barZ + 0.153], dir: [0, 0, 1], axis: "z", texture: WARN,
    });
  b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", {
    bone: body, at: [0.95, BASE + 0.26, 0.55], dir: [1, 0, 0], axis: "z", texture: WARN,
  });

  // ---- side neon bars along cab upper edge
  for (const s of [1, -1]) {
    const col = s > 0 ? P.neonCyan : P.neonMagenta;
    glow(b.rod([s * 1.16, 1.86, 0.85], [s * 1.16, 1.86, 1.55], 0.022, col, { bone: body, sides: 6 }), 2);
    for (const z of [0.85, 1.55]) box(0.06, 0.06, 0.05, P.hullDark, [s * 1.16, 1.86, z]);
    for (const z of [1.0, 1.2, 1.4]) box(0.05, 0.05, 0.04, P.hullLight, [s * 1.16, 1.82, z]);
  }

  // ---- scattered rivets on bar base
  for (let i = 0; i < 8; i++) {
    const x = -0.9 + i * 0.257;
    cyl(0.015, 0.015, 0.02, 5, P.steel, [x, BASE + 0.09, barZ - 0.14 + (R() - 0.5) * 0.01]);
  }
}
    return buildRoofLights;
  })(),
  // rearBox
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildRearBox({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });

  // hull paint: panelled, grime low, soot at rear
  const grime = paint((p: any, n: any) => {
    let c: any = mix(P.hull, P.hullLight, smoothstep(0.2, 0.9, noise(p, 0.3, 4)) * 0.5 + Math.max(0, n.y) * 0.3);
    c = mix(c, "#0a0a0c", smoothstep(1.2, 0.6, p.y) * 0.5 + smoothstep(-2.6, -3, p.z) * 0.4 * noise(p, 0.2, 9));
    return c;
  });
  const HULL = panelled(grime, { size: 0.45, rivets: 0.06 });

  // main box
  box(2.5, 1.0, 3.8, HULL, [0, 1.3, -1.1]);
  // upper sloped roof section
  b.extrude(
    [[-1.2, 0], [1.2, 0], [1.0, 0.25], [-1.0, 0.25]],
    { at: [0, 1.78, -1.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 3.6, color: HULL, bone },
  );
  // sloped rear
  b.extrude(
    [[0, 0], [0.5, 0], [0.5, 1.15], [0, 1.15]],
    { at: [0, 0.65, -3], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: P.hullDark, bone },
  ).mesh.position.x += 0;
  b.frustumBox([0, 1.05, -2.95], [0, 1.78, -2.7], [2.5, 0.2], [2.3, 0.2], { color: P.armor, bone });

  // roof deck + turret ring plate
  box(2.0, 0.06, 3.3, P.armor, [0, 1.99, -1.1]);
  b.lathe([[0, 0], [0.8, 0], [0.8, 0.05], [0.65, 0.07], [0, 0.07]], {
    at: [M.turretRing[0], 1.97, M.turretRing[2]], color: P.hullDark, bone, segments: 16,
  });
  b.ring(frame([0, 2.05, M.turretRing[2]], [0, 1, 0]), { count: 12, radius: 0.72 }, (it: any) =>
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.steel, it, { bone }));

  // livery stripes
  for (const s of [1, -1]) {
    box(0.03, 0.12, 3.7, P.corpRed, [s * 1.27, 1.45, -1.1]);
    glow(box(0.03, 0.04, 3.6, P.neonCyan, [s * 1.275, 1.33, -1.1]), 1.4);
    glow(box(0.03, 0.04, 3.6, P.neonCyan, [s * 1.275, 1.62, -1.1]), 1.4);
  }

  // textures
  const logo = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#d1202f" stroke="#fff" stroke-width="3"/><path d="M32 10 L48 50 H40 L32 30 L24 50 H16Z" fill="#fff"/><path d="M14 38H50" stroke="#14161c" stroke-width="4"/></svg>`, { size: 128 });
  const kanji = svg(`<svg viewBox="0 0 96 48"><text x="48" y="36" text-anchor="middle" font-size="34" font-weight="bold" fill="#2ff3ff">企業警備</text></svg>`, { size: 192 });
  const stencil = svg(`<svg viewBox="0 0 96 32"><text x="48" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#f2c200">RCV-09</text></svg>`, { size: 192 });
  const warn = svg(`<svg viewBox="0 0 40 40"><path d="M20 3L38 36H2Z" fill="#f2c200" stroke="#14161c" stroke-width="3"/><rect x="18" y="14" width="4" height="12" fill="#14161c"/><rect x="18" y="29" width="4" height="4" fill="#14161c"/></svg>`, { size: 64 });
  const vent = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#14161c"/>${[4, 10, 16, 22, 28].map((y) => `<rect x="3" y="${y - 1}" width="26" height="3" fill="#464c5a"/>`).join("")}</svg>`, { size: 64 });
  const decal = (tex: any, at: number[], dir: number[], w: number, h: number, up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...(up ? { up } : {}) });

  for (const s of [1, -1]) {
    const x = s * 1.262;
    const dir = [s, 0, 0];
    // hatch
    box(0.04, 0.7, 1.0, P.armor, [s * 1.26, 1.25, -0.6]);
    box(0.05, 0.62, 0.92, P.hull, [s * 1.275, 1.25, -0.6]);
    // slit window
    glow(box(0.05, 0.08, 0.6, "#2a6a8a", [s * 1.29, 1.45, -0.6]), 0.4);
    // hazard handle
    box(0.07, 0.05, 0.3, P.hazard, [s * 1.31, 1.18, -0.25]);
    box(0.06, 0.1, 0.04, P.steel, [s * 1.3, 1.18, -0.12]);
    box(0.06, 0.1, 0.04, P.steel, [s * 1.3, 1.18, -0.38]);
    // hazard stripes along hatch bottom
    for (let i = 0; i < 6; i++) box(0.055, 0.05, 0.08, i % 2 ? P.hullDark : P.hazard, [s * 1.3, 0.97, -1.0 + i * 0.16]);
    decal(vent, [x + s * 0.03, 1.3, -1.75], dir, 0.5, 0.5, [0, 1, 0]);
    decal(warn, [x + s * 0.03, 1.55, -2.2], dir, 0.25, 0.25);
    decal(logo, [x + s * 0.03, 1.55, 0.35], dir, 0.4, 0.4);
    decal(kanji, [x + s * 0.03, 1.4, -2.55], dir, 0.6, 0.3);
    decal(stencil, [x + s * 0.03, 1.1, -2.2], dir, 0.6, 0.2);
    // strobe corner pods
    glow(box(0.1, 0.1, 0.1, s > 0 ? P.neonCyan : P.neonMagenta, [s * 1.2, 1.88, 0.7]), 1.6);
  }

  // rear face (z=-3)
  const rz = -3.02;
  box(2.2, 0.9, 0.04, P.hull, [0, 1.3, rz]);
  box(0.03, 0.9, 0.06, P.hullDark, [0, 1.3, rz - 0.01]);
  for (const s of [1, -1]) {
    box(0.1, 0.18, 0.08, P.steel, [s * 0.1, 1.3, rz - 0.04]);
    box(0.06, 0.4, 0.05, P.steel, [s * 0.9, 1.3, rz - 0.03]);
    box(0.5, 0.06, 0.05, P.hazard, [s * 0.55, 0.9, rz - 0.03]);
    // tail lights
    glow(box(0.5, 0.08, 0.05, P.corpRed, [s * 0.7, 1.7, rz - 0.02]), 1.8);
  }
  glow(box(0.5, 0.06, 0.05, P.corpRed, [0, 1.7, rz - 0.02]), 1.8);
  decal(logo, [0, 1.35, rz - 0.07], [0, 0, -1], 0.5, 0.5);
  decal(kanji, [0, 1.62, rz - 0.07], [0, 0, -1], 0.7, 0.3);
  decal(stencil, [0.7, 1.05, rz - 0.07], [0, 0, -1], 0.6, 0.2);
  decal(warn, [-0.8, 1.1, rz - 0.07], [0, 0, -1], 0.22, 0.22);
  glow(box(2.2, 0.03, 0.04, P.neonCyan, [0, 0.82, rz - 0.04]), 1.5);

  // exhaust pipes with soot
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.25, 8), P.hullDark, { bone, at: [s * 1.0, 0.75, -2.85], dir: [0, 0, -1] });
  }

  // roof vents and small antenna stubs
  for (let i = 0; i < 4; i++) {
    box(0.4, 0.05, 0.06, P.hullDark, [0.8 * (i % 2 ? 1 : -1) * 0.9, 2.04, -2.1 + i * 0.12]);
  }
  for (const s of [1, -1]) {
    box(0.3, 0.08, 0.5, P.hullDark, [s * 0.75, 1.99, -2.2]);
    glow(box(0.2, 0.02, 0.4, P.neonMagenta, [s * 0.75, 2.04, -2.2]), 1.2);
  }
  // front wall trim with cab
  box(2.3, 0.9, 0.08, P.armor, [0, 1.3, 0.86]);
  glow(box(2.3, 0.03, 0.04, P.neonMagenta, [0, 1.8, 0.9]), 1.4);
  // roof edge rails
  for (const s of [1, -1]) b.rod([s * 1.0, 2.03, -2.7], [s * 1.0, 2.03, 0.5], 0.025, P.steel, { bone });
}
    return buildRearBox;
  })(),
  // turretBase
  (() => {
function buildTurretBase({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const BRASS = "#c8993a";
  const [cx, cy, cz] = M.turretRing as number[];

  const armor = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) =>
      mix(P.hull, P.hullLight, smoothstep(-0.2, 0.9, n.y) * 0.6 + noise(p, 0.2, 3) * 0.3),
    ),
    { size: 0.24, rivets: 0.06 },
  );
  const hazard = paint((p: THREE.Vector3) =>
    Math.floor((p.x + p.z) / 0.07) % 2 ? P.hazard : P.hullDark,
  );

  const at = (x: number, y: number, z: number): [number, number, number] => [cx + x, cy + y, cz + z];
  const part = (g: THREE.BufferGeometry, c: any, pos: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone: yaw, at: pos, flat: true, ...o });

  // ring bearing and skirt
  part(new THREE.CylinderGeometry(0.78, 0.84, 0.1, 20), hazard, at(0, 0.02, 0));
  part(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 20), metal("steel"), at(0, 0.1, 0));
  glow(part(new THREE.TorusGeometry(0.8, 0.018, 6, 28), P.neonMagenta, at(0, 0.08, 0), { rotation: [90, 0, 0] }), 1.6);

  // housing
  part(new THREE.BoxGeometry(1.0, 0.3, 1.2), armor, at(0, 0.3, 0));
  part(new THREE.BoxGeometry(0.8, 0.12, 0.9), armor, at(0, 0.5, -0.1), { rotation: [-8, 0, 0] });
  part(new THREE.BoxGeometry(0.9, 0.2, 0.3), armor, at(0, 0.38, 0.55), { rotation: [28, 0, 0] });
  part(new THREE.BoxGeometry(0.9, 0.2, 0.3), armor, at(0, 0.36, -0.62), { rotation: [-25, 0, 0] });
  // trunnion cheeks
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.1, 0.2, 0.4), P.armor, at(s * 0.2, 0.52, 0.15));

  // water tanks with level windows
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.17, 0.17, 1.0, 10), metal("steel"), at(s * 0.7, 0.32, -0.05), { rotation: [90, 0, 0] });
    for (const z of [-0.4, 0.3]) part(new THREE.TorusGeometry(0.175, 0.02, 5, 12), BRASS, at(s * 0.7, 0.32, z), { rotation: [0, 0, 0] });
    glow(part(new THREE.BoxGeometry(0.02, 0.2, 0.55), P.water, at(s * 0.88, 0.32, -0.05)), 1.4);
    part(new THREE.BoxGeometry(0.08, 0.1, 0.9), P.hullDark, at(s * 0.7, 0.14, -0.05));
  }

  // pipes and fittings
  for (const s of [1, -1]) {
    b.rod(at(s * 0.55, 0.45, 0.3), at(s * 0.12, 0.62, 0.35), 0.03, P.steel, { bone: yaw });
    part(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 8), BRASS, at(s * 0.55, 0.45, 0.3), { rotation: [0, 0, 90] });
    part(new THREE.SphereGeometry(0.04, 6, 4), BRASS, at(s * 0.12, 0.62, 0.35));
  }
  b.sweep(
    [at(-0.6, 0.2, -0.5), at(-0.4, 0.5, -0.7), at(-0.1, 0.55, -0.55)],
    0.025,
    { bone: yaw, color: P.hullDark },
  );

  // pump / ammo box with screen
  part(new THREE.BoxGeometry(0.5, 0.26, 0.3), armor, at(0, 0.42, -0.78));
  part(new THREE.BoxGeometry(0.52, 0.04, 0.32), hazard, at(0, 0.56, -0.78));
  const screen = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#06232b"/><path d="M4 22 L16 12 L26 18 L38 6 L52 14 L60 8" stroke="#2ff3ff" stroke-width="3" fill="none"/><text x="4" y="30" font-size="8" fill="#2ff3ff" font-family="monospace">H2O 87%</text></svg>`,
    { size: 128 },
  );
  glow(
    part(new THREE.PlaneGeometry(0.34, 0.17), "#ffffff", at(0, 0.44, -0.935), { dir: [0, 0, -1], axis: "z", texture: screen }),
    1.2,
  );
  // vents
  for (let i = 0; i < 4; i++) part(new THREE.BoxGeometry(0.4, 0.015, 0.02), P.hullDark, at(0, 0.5 - i * 0.04, 0.16 * 0 + 0.62 + 0.0), {});
  // status lamps
  for (const s of [1, -1]) glow(part(new THREE.SphereGeometry(0.035, 6, 4), s > 0 ? P.neonCyan : P.corpRed, at(s * 0.4, 0.55, 0.4)), 2);
}
    return buildTurretBase;
  })(),
  // waterCannon
  (() => {
function buildWaterCannon({ b, J, P, M }: Ctx) {
  const bone = J.cannonPitch;
  const R = rng(11);
  const Y = 2.2, Z0 = -1.1;

  const barrelPaint = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 1, n.y) * 0.7);
    const grime = noise(p, 0.15, 4);
    return mix(base, P.hullDark, grime > 0.62 ? 0.5 : 0);
  });
  const bandPaint = paint((p, n) => {
    const k = Math.floor((p.z + 5) / 0.08) % 2;
    return k ? P.hazard : P.hullDark;
  });

  const axisZ = (r: number, len: number, z: number, color: any, seg = 10, y = Y, x = 0) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at: [x, y, z], dir: [0, 0, 1], flat: true });

  // breech block and main barrel
  b.part(new THREE.BoxGeometry(0.42, 0.34, 0.5), P.armor, { bone, at: [0, Y, Z0 - 0.1] });
  axisZ(0.2, 0.9, -0.35, barrelPaint, 12);
  axisZ(0.17, 1.4, 0.6, barrelPaint, 12);
  // banded rings
  for (const z of [-0.7, -0.1, 0.35, 0.9, 1.2]) axisZ(0.215, 0.07, z, P.steel, 12);
  // hazard muzzle collar
  axisZ(0.22, 0.2, 1.25, bandPaint, 12);
  // flared nozzle
  const noz = b.lathe(
    [[0, 0], [0.17, 0], [0.2, 0.05], [0.3, 0.3], [0.26, 0.3], [0.16, 0.06], [0, 0.06]],
    { at: [0, Y, 1.35], axis: [0, 0, 1], bone, color: P.armor, segments: 12 },
  );
  glow(axisZ(0.2, 0.05, 1.42, P.water, 12), 1.6);
  // cooling fins
  for (let i = 0; i < 6; i++) {
    const z = -0.55 + i * 0.14;
    b.part(new THREE.BoxGeometry(0.5, 0.025, 0.07), P.steel, { bone, at: [0, Y + 0.17, z] });
    b.part(new THREE.BoxGeometry(0.5, 0.025, 0.07), P.steel, { bone, at: [0, Y - 0.17, z] });
  }
  // trunnions
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8), P.steel, { bone, at: [s * 0.3, Y, Z0 + 0.4], dir: [1, 0, 0], flat: true });
    b.part(new THREE.BoxGeometry(0.06, 0.2, 0.2), P.armor, { bone, at: [s * 0.37, Y - 0.05, Z0 + 0.4] });
  }
  // gauge
  const gauge = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e8e8e0" stroke="#222" stroke-width="5"/><path d="M20 70 A38 38 0 1 1 80 70" stroke="#222" stroke-width="3" fill="none"/><path d="M60 65 L50 50" stroke="#d1202f" stroke-width="5"/><path d="M68 30 A38 38 0 0 1 80 70" stroke="#d1202f" stroke-width="6" fill="none"/><circle cx="50" cy="50" r="5" fill="#222"/></svg>`, { size: 128 });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12), P.hullDark, { bone, at: [0.2, Y + 0.12, -0.5], dir: [1, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", { bone, at: [0.228, Y + 0.12, -0.5], dir: [1, 0, 0], axis: "z", texture: gauge });
  // red stencil
  const stencil = svg(`<svg viewBox="0 0 120 40"><text x="60" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="#d1202f">RCV-9</text></svg>`, { size: 256 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.4, 0.13), "#ffffff", { bone, at: [s * 0.176, Y + 0.02, 0.5], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: stencil, rotation: undefined as any });
  // scope
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), P.hullDark, { bone, at: [-0.2, Y + 0.25, 0.1] });
  axisZ(0.05, 0.4, 0.2, P.hullDark, 8, Y + 0.3, -0.2);
  glow(b.part(new THREE.CircleGeometry(0.045, 8), P.neonCyan, { bone, at: [-0.2, Y + 0.3, 0.405], dir: [0, 0, 1], axis: "z" }), 1.5);
  b.part(new THREE.BoxGeometry(0.06, 0.1, 0.06), P.armor, { bone, at: [-0.2, Y + 0.2, 0.2] });
  // elbow pipe and hose to the tank
  const hose = b.sweep(
    [[0.1, Y - 0.1, -0.7], [0.3, Y - 0.12, -0.9], [0.34, Y - 0.12, -1.2], [0.2, Y - 0.1, -1.45]],
    0.04, { bone, color: P.hullDark, sides: 6 },
  );
  b.part(new THREE.SphereGeometry(0.075, 6, 5), "#b08a3a", { bone, at: [0.1, Y - 0.1, -0.7] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), "#b08a3a", { bone, at: [0.2, Y - 0.1, -1.45], dir: [1, 0, 0] });
  // rear cap
  axisZ(0.15, 0.1, -1.4, P.hazard, 8);
  // spray mist cards
  const mist = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#bfeaff" opacity="0.9"/><circle cx="20" cy="40" r="14" fill="#7fd8ff"/></svg>`, { size: 64 });
  const frames: any[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    frames.push({ at: [Math.cos(a) * 0.1, Y + Math.sin(a) * 0.1, 1.42 + (i % 3) * 0.02], axis: [Math.cos(a) * 0.3, Math.sin(a) * 0.3, 1] });
  }
  b.cards(frames.map((f) => ({ ...f })), mist, { size: 0.09, bone, lean: 0, rng: R, vary: 0.4, cross: true } as any);
}
    return buildWaterCannon;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.5,1.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.5,1.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.15,0.5,-1.8], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.15,0.5,-1.8], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,1.95,-1.1], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannonPitch"] = b.joint("cannonPitch", { parent: J["turretYaw"], at: [0,2.2,-1.1], dir: [0,0,1], role: "hinge", group: "turret" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
