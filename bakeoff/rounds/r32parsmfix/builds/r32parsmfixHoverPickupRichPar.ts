import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng, countershade, stripes, mottle, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hover Technical",
  "description": "A militarized pickup truck converted to four hover thrusters in a low-poly cyberpunk style, with armor plating, a roll cage, a bed-mounted gun and glowing neon underlights."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4048",
  hullLight: "#59626d",
  camo: "#4d5a3a",
  camoDark: "#2f3824",
  trim: "#e7b814",
  dark: "#14161b",
  glass: "#1b3a4a",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  tail: "#ff2a3a",
  metal: "#8a929c",
  rust: "#7a4a2a",
  white: "#e8eef2",
};
const M = {
  chassisTop: [0, 0.95, 0] as [number, number, number],
  hoodFront: [0, 0.95, 2.7] as [number, number, number],
  cabFloor: [0, 0.95, 0.3] as [number, number, number],
  cabRoof: [0, 1.75, -0.15] as [number, number, number],
  bedFloor: [0, 0.95, -1.6] as [number, number, number],
  bedRear: [0, 0.95, -2.7] as [number, number, number],
  gunMount: [0, 1, -1.5] as [number, number, number],
  podFL: [1, 0.55, 1.75] as [number, number, number],
  podFR: [-1, 0.55, 1.75] as [number, number, number],
  podRL: [1, 0.55, -1.7] as [number, number, number],
  podRR: [-1, 0.55, -1.7] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

function buildChassis({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // paints
  const grime = paint((p, n) => {
    const low = smoothstep(1.0, 0.35, p.y);
    const nz = noise(p, 0.18, 3);
    const base = mix(P.hull, P.dark, 0.35 + 0.4 * low * (0.5 + nz));
    return mix(base, P.rust, 0.25 * smoothstep(0.55, 0.8, nz) * low);
  });
  const camo = paint((p, n) => {
    const a = noise(p, 0.45, 5);
    const c = noise(p, 0.22, 9);
    let col = mix(P.camo, P.camoDark, smoothstep(0.45, 0.6, a));
    col = mix(col, P.hull, 0.5 * smoothstep(0.62, 0.72, c));
    const lit = 0.85 + 0.2 * smoothstep(-0.3, 1, n.y);
    return [col[0] * lit, col[1] * lit, col[2] * lit] as any;
  });
  const hazard = paint((p) => ((Math.floor((p.z + p.x) / 0.09) % 2 + 2) % 2 ? P.trim : P.dark));

  // helper: box part
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, rotation: rot, flat: true, ...opts });

  // floor pan & sills
  box(2.3, 0.12, 5.3, grime, [0, 0.48, 0]);
  box(1.7, 0.06, 4.2, P.dark, [0, 0.43, 0]); // skid plate
  box(1.2, 0.04, 3.2, P.metal, [0, 0.4, 0.1]);
  for (const s of [1, -1]) {
    box(0.16, 0.3, 4.0, grime, [s * 1.07, 0.62, 0]);
    box(0.05, 0.1, 3.0, hazard, [s * 1.16, 0.6, 0]);
    // neon underglow
    glow(box(0.05, 0.04, 3.6, P.neonMagenta, [s * 1.1, 0.42, 0]), 1.6);
    // exhaust vents
    for (let i = 0; i < 5; i++) box(0.03, 0.05, 0.22, P.dark, [s * 1.17, 0.78, -0.35 + i * 0.13 - 0.2]);
    // chassis rails
    box(0.12, 0.14, 5.3, P.hull, [s * 0.55, 0.55, 0]);
  }
  // cross members
  for (const z of [-2.3, -1.0, 0.2, 1.3, 2.3]) box(2.2, 0.1, 0.12, P.hullLight, [0, 0.58, z]);

  // deck plate under cab/bed
  box(2.3, 0.1, 5.2, grime, [0, 0.92, 0]);
  box(2.4, 0.06, 5.3, P.dark, [0, 0.86, 0]);

  // fender arches around pods (faceted hex lathe rims)
  const pods = [[1, 1.75, 1], [-1, 1.75, 1], [1, -1.7, 1.12], [-1, -1.7, 1.12]];
  for (const [x, z, k] of pods) {
    const s = x > 0 ? 1 : -1;
    b.lathe(
      [[0.5 * k, 0], [0.62 * k, 0.03], [0.62 * k, 0.12], [0.5 * k, 0.12]],
      { at: [x, 0.84, z], segments: 6, color: camo, bone: body },
    );
    b.lathe(
      [[0.55 * k, 0], [0.7 * k, 0.04], [0.7 * k, 0.1], [0.55 * k, 0.1]],
      { at: [x, 0.74, z], segments: 6, color: P.dark, bone: body },
    );
    box(0.1, 0.06, 0.9 * k, P.neonCyan, [x, 0.79, z], undefined, { });
    // outer fender flare
    box(0.12, 0.2, 1.1 * k, camo, [s * 1.3, 0.95, z], [0, 0, s * 12]);
    box(0.04, 0.05, 0.9 * k, hazard, [s * 1.36, 1.08, z]);
  }
  // fender top plates
  for (const s of [1, -1]) {
    box(0.3, 0.07, 1.3, camo, [s * 1.15, 1.18, 1.75]);
    box(0.3, 0.07, 1.3, camo, [s * 1.15, 1.18, -1.7]);
  }

  // hood: sloped block
  const hood = b.extrude(
    [[0, 0], [1.75, 0], [1.75, 0.18], [1.3, 0.35], [0, 0.4]],
    { at: [0, 0.95, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, color: camo, bone: body },
  );
  void hood;
  // hood ribs and vents
  for (let i = 0; i < 4; i++) for (const s of [1, -1])
    box(0.3, 0.02, 0.05, P.dark, [s * 0.55, 1.34 - i * 0.015, 1.15 + i * 0.12], [8, 0, 0]);
  // scoop
  b.part(new THREE.CylinderGeometry(0.2, 0.3, 0.16, 6), P.dark, { bone: body, at: [0, 1.42, 1.55], rotation: [10, 0, 0], flat: true });
  glow(box(0.3, 0.015, 0.05, P.neonCyan, [0, 1.5, 1.62], [10, 0, 0]), 1.2);
  // center spine stripe
  box(0.1, 0.02, 1.5, P.trim, [0, 1.4, 1.6], [8, 0, 0]);

  // grille texture
  const grilleTex = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#14161b"/>` +
      Array.from({ length: 8 }, (_, i) => `<rect x="6" y="${4 + i * 4.4}" width="88" height="2.4" fill="#59626d"/>`).join("") +
      `<rect x="4" y="2" width="92" height="36" fill="none" stroke="#e7b814" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(1.3, 0.5), "#ffffff", {
    bone: body, at: [0, 0.98, 2.78], dir: [0, 0, 1], axis: "z", texture: grilleTex,
  });
  // cyan light bar grille
  glow(box(1.5, 0.07, 0.06, P.neonCyan, [0, 1.3, 2.74]), 1.8);
  box(1.6, 0.12, 0.05, P.dark, [0, 1.3, 2.72]);

  // headlamps angular
  for (const s of [1, -1]) {
    const lamp = b.extrude(
      [[0, 0], [0.34, 0.04], [0.3, 0.2], [0.05, 0.16]],
      { at: [s * 0.78 - (s > 0 ? 0 : 0.0), 1.05, 2.74], x: [s, 0, 0], thickness: 0.08, color: P.dark, bone: body },
    );
    void lamp;
    glow(box(0.22, 0.08, 0.04, P.white, [s * 0.95, 1.2, 2.8]), 1.5);
    glow(box(0.2, 0.03, 0.04, P.neonMagenta, [s * 0.95, 1.1, 2.79]), 1.3);
  }

  // front bumper + bull bar
  box(2.5, 0.2, 0.22, P.dark, [0, 0.72, 2.66]);
  box(2.4, 0.04, 0.24, hazard, [0, 0.82, 2.66]);
  box(2.1, 0.12, 0.2, P.hull, [0, 0.55, 2.55], [-15, 0, 0]);
  for (const x of [-0.9, -0.3, 0.3, 0.9]) {
    b.rod([x, 0.7, 2.76], [x * 0.9, 1.3, 2.8], 0.035, P.metal, { bone: body });
  }
  b.rod([-1.0, 1.0, 2.82], [1.0, 1.0, 2.82], 0.04, P.metal, { bone: body });
  b.rod([-1.0, 1.25, 2.8], [1.0, 1.25, 2.8], 0.04, P.metal, { bone: body });
  glow(box(1.8, 0.05, 0.05, P.neonCyan, [0, 0.9, 2.78]), 2);
  // tow hooks
  for (const s of [1, -1]) box(0.08, 0.08, 0.18, P.trim, [s * 0.7, 0.55, 2.8]);

  // rear bumper
  box(2.5, 0.22, 0.2, P.dark, [0, 0.72, -2.65]);
  box(2.4, 0.04, 0.22, hazard, [0, 0.62, -2.66]);
  glow(box(2.0, 0.07, 0.05, P.tail, [0, 0.76, -2.77]), 2);
  for (const s of [1, -1]) box(0.3, 0.3, 0.1, P.hull, [s * 1.1, 0.8, -2.7], [0, 0, s * 10]);

  // side plates & mirrors on fenders
  for (const s of [1, -1]) {
    box(0.06, 0.28, 1.5, camo, [s * 1.2, 0.95, 0.15]);
    box(0.02, 0.1, 1.2, P.neonMagenta, [s * 1.24, 0.82, 0.15]);
    b.rod([s * 1.1, 1.3, 0.95], [s * 1.35, 1.45, 0.95], 0.02, P.dark, { bone: body });
    box(0.05, 0.14, 0.2, P.dark, [s * 1.38, 1.46, 0.92]);
    glow(box(0.01, 0.1, 0.16, P.neonCyan, [s * 1.4, 1.46, 0.92]), 1);
  }
  // bolts
  for (let i = 0; i < 14; i++) {
    const x = -1.1 + (i % 7) * 0.37;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 6), P.metal, {
      bone: body, at: [x, 0.5, i < 7 ? 2.0 : -2.0 + R() * 0.05], flat: true,
    });
  }
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const camo = paint((p, n) => {
    const a = noise(p, 0.5, 3);
    const c2 = noise(p, 0.22, 8);
    let c: any = mix(P.camo, P.camoDark, smoothstep(0.45, 0.6, a));
    c = mix(c, P.hull, smoothstep(0.62, 0.72, c2) * 0.7);
    const top = smoothstep(0.2, 0.9, n.y);
    c = mix(c, P.hullLight, top * 0.18);
    const grime = smoothstep(1.25, 0.95, p.y) * (0.4 + 0.4 * noise(p, 0.1, 2));
    return mix(c, P.dark, grime);
  });
  const armor = paint((p, n) => mix(mix(P.hull, P.hullLight, noise(p, 0.3, 5)), P.dark, smoothstep(0.1, -0.8, n.y) * 0.5));
  const hazard = stripes(P.trim, P.dark, { size: 0.09, axis: [1, 0, 1], width: 0.5, wobble: 0 });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...opt });
  const nglow = (w: number, h: number, d: number, col: string, at: number[], s = 1.4, opt: any = {}) =>
    glow(box(w, h, d, col, at, opt), s);

  // ---------- main body: lower tub, beltline, roof ----------
  // lower cab (doors area), z -0.65..1.0
  const lower = b.extrude(
    [[-0.65, 0.95], [1.0, 0.95], [1.05, 1.38], [-0.7, 1.38]],
    { at: [-1.1, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: camo, bone },
  );
  // glasshouse pillars / greenhouse: profile with slanted windshield and rear window
  const house = b.extrude(
    [[-0.62, 1.38], [0.98, 1.38], [0.5, 1.78], [-0.45, 1.78], [-0.6, 1.6]],
    { at: [-1.02, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.04, color: P.glass, bone },
  );
  // camo pillars frame
  for (const s of [1, -1]) {
    // A pillars
    b.rod([s * 1.0, 1.38, 0.97], [s * 1.0, 1.78, 0.5], 0.04, camo, { bone, sides: 6 });
    // B pillar
    box(0.07, 0.4, 0.1, camo, [s * 1.03, 1.58, 0.15]);
    // C pillar
    b.rod([s * 1.0, 1.38, -0.6], [s * 1.0, 1.78, -0.45], 0.045, camo, { bone, sides: 6 });
    // window sills & roof rails
    b.rod([s * 1.03, 1.38, -0.6], [s * 1.03, 1.38, 0.98], 0.035, P.hullLight, { bone, sides: 6 });
    b.rod([s * 0.99, 1.78, -0.45], [s * 0.99, 1.78, 0.5], 0.04, camo, { bone, sides: 6 });
  }
  // roof armour slab (slightly wedge)
  box(2.1, 0.07, 0.98, camo, [0, 1.82, 0.02]);
  box(2.0, 0.04, 0.9, armor, [0, 1.87, 0.02]);
  // front roof visor
  b.frustumBox([0, 1.8, 0.52], [0, 1.8, 0.7], [2.1, 0.06], [2.0, 0.03], { bone, color: P.dark });

  // windshield sloped plate with reflection decal
  const refl = svg(
    `<svg viewBox="0 0 100 50"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#2ff3ff" stop-opacity="0.0"/><stop offset="0.5" stop-color="#2ff3ff" stop-opacity="0.5"/><stop offset="1" stop-color="#2ff3ff" stop-opacity="0"/></linearGradient></defs>
    <path d="M10 50 L40 0 L55 0 L25 50Z" fill="url(#g)"/><path d="M50 50 L70 8 L76 8 L56 50Z" fill="#ff2bd6" fill-opacity="0.35"/></svg>`,
    { size: 256 },
  );
  const ang = Math.atan2(0.4, 0.48);
  const wsN = [0, Math.sin(ang), Math.cos(ang)];
  b.part(new THREE.PlaneGeometry(1.9, 0.6), P.glass, {
    bone, at: [0, 1.585, 0.76], dir: wsN, axis: "z", texture: refl,
  });
  b.part(new THREE.PlaneGeometry(1.9, 0.5), P.glass, {
    bone, at: [0, 1.6, -0.5], dir: [0, 0.35, -1], axis: "z", texture: refl,
  });
  // windshield frame
  b.rod([-1.0, 1.4, 0.98], [1.0, 1.4, 0.98], 0.035, camo, { bone, sides: 6 });
  b.rod([-0.97, 1.78, 0.5], [0.97, 1.78, 0.5], 0.035, camo, { bone, sides: 6 });
  // wipers
  for (const s of [1, -1]) b.rod([s * 0.1, 1.42, 0.95], [s * 0.7, 1.55, 0.8], 0.01, P.dark, { bone, sides: 4 });

  // ---------- shutters, doors ----------
  const slat = svg(
    `<svg viewBox="0 0 64 32">${[0, 1, 2, 3, 4].map((i) => `<rect x="1" y="${2 + i * 6}" width="62" height="4" fill="#fff"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#14161b" stroke="#e7b814" stroke-width="6"/>
    <path d="M50 14 L82 72 L18 72Z" fill="none" stroke="#2ff3ff" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="50" cy="56" r="8" fill="#ff2bd6"/><text x="50" y="92" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#e8eef2">HT-07</text></svg>`,
    { size: 256 },
  );
  const num = svg(
    `<svg viewBox="0 0 100 50"><text x="50" y="40" font-size="46" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#e8eef2" stroke="#14161b" stroke-width="2">07</text></svg>`,
    { size: 200 },
  );
  for (const s of [1, -1]) {
    const x = s * 1.115;
    const dir = [s, 0, 0];
    // door panel (raised)
    box(0.06, 0.4, 0.62, camo, [s * 1.12, 1.17, 0.5]);
    box(0.04, 0.4, 0.6, camo, [s * 1.12, 1.17, -0.18]);
    // seams
    box(0.07, 0.43, 0.012, P.dark, [s * 1.12, 1.17, 0.19]);
    box(0.07, 0.43, 0.012, P.dark, [s * 1.12, 1.17, 0.83]);
    box(0.07, 0.43, 0.012, P.dark, [s * 1.12, 1.17, -0.5]);
    // hazard stripe at door bottom
    box(0.07, 0.07, 1.4, hazard, [s * 1.125, 1.01, 0.18]);
    // handles
    for (const z of [0.3, -0.05]) {
      box(0.05, 0.03, 0.14, P.metal, [s * 1.17, 1.28, z]);
      box(0.04, 0.05, 0.02, P.dark, [s * 1.16, 1.27, z + 0.08]);
    }
    // side window shutters (armoured slats), raised
    b.part(new THREE.PlaneGeometry(0.62, 0.3), P.dark, { at: [x + s * 0.03, 1.58, 0.52], dir, axis: "z", bone, texture: slat });
    b.part(new THREE.PlaneGeometry(0.52, 0.3), P.dark, { at: [x + s * 0.03, 1.58, -0.12], dir, axis: "z", bone, texture: slat });
    // shutter frame
    box(0.06, 0.035, 0.7, armor, [s * 1.1, 1.75, 0.5]);
    box(0.06, 0.035, 0.6, armor, [s * 1.1, 1.75, -0.12]);
    box(0.06, 0.03, 0.7, armor, [s * 1.1, 1.41, 0.5]);
    // angled armour plates over door lower
    b.slab([[s * 1.14, 1.34, 0.9], [s * 1.14, 1.34, -0.6], [s * 1.2, 1.08, -0.55], [s * 1.2, 1.08, 0.85]], { bone, color: armor, thickness: 0.03 });
    // emblem & number
    if (s > 0) {
      b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { at: [1.18, 1.2, 0.55], dir, axis: "z", bone, texture: emblem });
      b.part(new THREE.PlaneGeometry(0.34, 0.17), "#ffffff", { at: [1.18, 1.2, -0.1], dir, axis: "z", bone, texture: num });
    } else {
      b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { at: [-1.18, 1.2, 0.55], dir, axis: "z", bone, texture: emblem });
      b.part(new THREE.PlaneGeometry(0.34, 0.17), "#ffffff", { at: [-1.18, 1.2, -0.1], dir: [-1, 0, 0], axis: "z", bone, texture: num });
    }
    // neon edge line along beltline
    nglow(0.02, 0.02, 1.55, P.neonCyan, [s * 1.205, 1.355, 0.18], 1.6);

    // mirrors
    b.rod([s * 1.1, 1.45, 0.85], [s * 1.3, 1.5, 0.88], 0.018, P.dark, { bone, sides: 6 });
    box(0.05, 0.16, 0.12, camo, [s * 1.34, 1.5, 0.88]);
    box(0.01, 0.13, 0.1, P.glass, [s * 1.34, 1.5, 0.945 - 0.0]);
    nglow(0.01, 0.02, 0.1, P.neonMagenta, [s * 1.34, 1.42, 0.88], 1.3);

    // roll bar behind cab
    b.rod([s * 0.95, 1.38, -0.78], [s * 0.95, 1.95, -0.78], 0.04, P.metal, { bone, sides: 6 });
    b.rod([s * 0.95, 1.95, -0.78], [s * 0.95, 1.9, -0.35], 0.035, P.metal, { bone, sides: 6 });
    b.rod([s * 0.95, 1.9, -0.35], [s * 0.95, 1.88, -0.1], 0.03, P.metal, { bone, sides: 6 });
    b.rod([s * 0.95, 1.4, -0.75], [s * 0.95, 1.9, -0.4], 0.022, P.metal, { bone, sides: 5 });
    // roof rack rails
    b.rod([s * 0.85, 1.93, -0.3], [s * 0.85, 1.93, 0.4], 0.018, P.metal, { bone, sides: 5 });
    for (const z of [-0.3, 0.05, 0.4]) b.rod([s * 0.85, 1.9, z], [s * 0.85, 1.94, z], 0.018, P.metal, { bone, sides: 5 });
    // fender-top lamps on A pillar
    nglow(0.05, 0.05, 0.05, P.white, [s * 1.0, 1.82, 0.52], 1.5);
    // magenta roof edge lines
    nglow(0.025, 0.025, 1.0, P.neonMagenta, [s * 1.06, 1.855, 0.02], 1.6);
  }
  box(2.14, 0.025, 0.025, P.neonMagenta, [0, 1.855, 0.52], {}).mesh;
  glow(box(2.1, 0.025, 0.025, P.neonMagenta, [0, 1.855, -0.47]), 1.6);
  glow(box(2.1, 0.025, 0.025, P.neonMagenta, [0, 1.855, 0.52]), 1.6);

  // roll bar cross bars
  b.rod([-0.95, 1.95, -0.78], [0.95, 1.95, -0.78], 0.04, P.metal, { bone, sides: 6 });
  b.rod([-0.95, 1.7, -0.78], [0.95, 1.7, -0.78], 0.03, P.metal, { bone, sides: 6 });
  b.rod([-0.95, 1.4, -0.78], [0.95, 1.8, -0.78], 0.02, P.metal, { bone, sides: 5 });
  b.rod([0.95, 1.4, -0.78], [-0.95, 1.8, -0.78], 0.02, P.metal, { bone, sides: 5 });
  nglow(0.5, 0.03, 0.04, P.neonCyan, [0, 1.95, -0.82], 1.6);

  // rack cross bars + crate
  for (const z of [-0.3, 0.05, 0.4]) b.rod([-0.85, 1.94, z], [0.85, 1.94, z], 0.016, P.metal, { bone, sides: 5 });
  box(0.5, 0.14, 0.3, P.camoDark, [-0.3, 2.02 - 0.04, 0.05]);
  box(0.52, 0.03, 0.32, hazard, [-0.3, 1.93, 0.05]);
  b.lathe([[0, 0], [0.12, 0], [0.12, 0.1], [0.05, 0.14], [0, 0.14]], { at: [0.4, 1.95, 0.05], segments: 8, color: P.metal, bone });

  // light bar on roof front
  box(1.5, 0.08, 0.1, P.dark, [0, 1.97, 0.46]);
  for (let i = 0; i < 6; i++) {
    glow(box(0.2, 0.05, 0.02, i % 2 ? P.neonMagenta : P.neonCyan, [-0.62 + i * 0.25, 1.97, 0.515]), 1.8);
  }
  for (const s of [1, -1]) box(0.06, 0.1, 0.14, P.metal, [s * 0.78, 1.95, 0.46]);

  // antenna
  b.spike([-0.9, 1.9, -0.6], [0, 1, -0.05], 0.75, 0.014, { bone, color: P.metal, sides: 5 });
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.06, 6), P.dark, { bone, at: [-0.9, 1.92, -0.6] });
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.neonMagenta, { bone, at: [-0.91, 2.0, -0.6] }), 2);
  // antenna fits within box height: tip at ~2.65, cap by flexing (shorter)
  
  // ---------- armour wedges at A-pillars and front face ----------
  box(2.3, 0.12, 0.06, armor, [0, 1.0, 1.02]);
  box(2.3, 0.04, 0.06, hazard, [0, 1.08, 1.04]);
  for (const s of [1, -1]) {
    b.slab([[s * 1.15, 1.38, 1.0], [s * 1.0, 1.4, 1.0], [s * 1.0, 1.4, 0.8], [s * 1.15, 1.38, 0.7]], { bone, color: armor, thickness: 0.05 });
    // rivets along beltline
    for (let i = 0; i < 6; i++) b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 5), P.metal, { bone, at: [s * 1.14, 1.31, -0.5 + i * 0.28], dir: [s, 0, 0] });
  }
  // rear panel behind seats
  box(2.1, 0.5, 0.06, camo, [0, 1.15, -0.67]);
  box(2.0, 0.12, 0.04, armor, [0, 1.42, -0.66]);
  // rear lower hazard & vents
  box(1.2, 0.05, 0.02, hazard, [0, 1.03, -0.71]);
  for (let i = 0; i < 4; i++) box(0.3, 0.025, 0.02, P.dark, [0, 1.18 + i * 0.06, -0.705]);

  // ---------- interior hint ----------
  const seatMat = P.dark;
  for (const s of [1, -1]) {
    box(0.45, 0.12, 0.45, seatMat, [s * 0.5, 1.25, -0.1]);
    box(0.45, 0.45, 0.1, seatMat, [s * 0.5, 1.5, -0.32]);
    box(0.25, 0.14, 0.07, P.hull, [s * 0.5, 1.8 - 0.08, -0.36]);
  }
  // dashboard
  box(1.9, 0.14, 0.3, P.dark, [0, 1.42, 0.82]);
  glow(box(0.5, 0.05, 0.02, P.neonCyan, [-0.5, 1.5, 0.67]), 1.3);
  glow(box(0.3, 0.04, 0.02, P.neonMagenta, [0.5, 1.5, 0.67]), 1.3);
  // steering wheel (on driver = +X side? model left is +X)
  b.sweep(new THREE.EllipseCurve ? [[0.45, 1.5, 0.5], [0.45, 1.58, 0.55], [0.45, 1.5, 0.6], [0.45, 1.42, 0.55]] : [[0, 0, 0], [0, 0, 1]], 0.012, {
    bone, color: P.metal, sides: 5, caps: "none",
  } as any);
  b.rod([0.45, 1.46, 0.6], [0.45, 1.44, 0.7], 0.018, P.metal, { bone, sides: 5 });
  b.part(new THREE.TorusGeometry(0.1, 0.014, 5, 10), P.dark, { bone, at: [0.45, 1.52, 0.56], dir: [0, 0.4, 0.9], axis: "z" });
  // roof interior glow
  glow(box(0.4, 0.02, 0.2, P.white, [0, 1.76, 0.1]), 1.0);

  // ---------- cab contour: door window pillars hazard strip at roof edge ----------
  box(2.2, 0.035, 0.05, hazard, [0, 1.78, 0.53]);
}
    return buildCab;
  })(),
  // bed
  (() => {
function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const Z0 = -2.7, Z1 = -0.7;
  const FLOOR_Y = 0.95;

  // ---------- textures ----------
  const RIB = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#2a2e35"/>${Array.from({ length: 8 }, (_, i) =>
      `<rect x="0" y="${i * 8 + 1}" width="64" height="3" fill="#4a515b"/><rect x="0" y="${i * 8 + 5}" width="64" height="1.5" fill="#101216"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#14161b"/>${Array.from({ length: 10 }, (_, i) =>
      `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#e7b814"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const CRATE = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#4d5a3a"/><rect x="2" y="2" width="60" height="60" fill="none" stroke="#2f3824" stroke-width="3"/><path d="M2 2L62 62M62 2L2 62" stroke="#2f3824" stroke-width="2"/><rect x="14" y="24" width="36" height="16" fill="#e8eef2"/><text x="32" y="37" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#14161b">AMMO</text></svg>`,
    { size: 128 },
  );
  const DRUM = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#7a4a2a"/><rect y="6" width="64" height="4" fill="#4a2c18"/><rect y="54" width="64" height="4" fill="#4a2c18"/><rect x="8" y="20" width="48" height="24" fill="#e8eef2"/><path d="M12 24h8l-4 8z" fill="#e7b814" stroke="#14161b" stroke-width="1.5"/><text x="40" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#14161b">FUEL</text></svg>`,
    { size: 128 },
  );
  const GRILL = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#14161b"/>${Array.from({ length: 6 }, (_, i) =>
      `<rect x="6" y="${6 + i * 9}" width="52" height="4" fill="#2f3824"/>`).join("")}<circle cx="32" cy="32" r="7" fill="none" stroke="#2ff3ff" stroke-width="2"/></svg>`,
    { size: 96 },
  );

  // ---------- paints ----------
  const CAMO = paint((p, n) => {
    const a = noise(p, 0.35, 3);
    const c2 = noise(p, 0.18, 8);
    let c = mix(P.camo, P.camoDark, smoothstep(0.45, 0.58, a));
    c = mix(c, P.hull, smoothstep(0.62, 0.7, c2) * 0.7);
    const grime = smoothstep(1.25, 0.9, p.y) * 0.5;
    c = mix(c, P.dark, grime);
    return mix(c, P.hullLight, smoothstep(0.6, 1, n.y) * 0.15);
  });
  const METAL = paint((p, n) => mix(P.hull, P.hullLight, smoothstep(0.3, 1, n.y) * 0.6 + noise(p, 0.1, 2) * 0.2));

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });
  const texBox = (w: number, h: number, d: number, tex: any, at: number[], tint = "#ffffff", extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), tint, { bone, at, texture: tex, ...extra });
  const neon = (a: number[], c: number[], col: string, r = 0.012) => glow(b.rod(a, c, r, col, { bone, sides: 4 } as any), 1.4);

  // ---------- floor ----------
  texBox(2.2, 0.06, 1.95, RIB, [0, FLOOR_Y + 0.03, -1.72]);
  box(2.3, 0.06, 2.0, METAL, [0, FLOOR_Y - 0.02, -1.7]);
  // floor cross ribs
  for (let i = 0; i < 5; i++) box(2.1, 0.03, 0.05, P.dark, [0, FLOOR_Y + 0.075, -2.5 + i * 0.4]);

  // ---------- side walls with angled armour ----------
  for (const s of [1, -1]) {
    box(0.1, 0.5, 1.95, CAMO, [s * 1.12, 1.25, -1.72]);
    // top rail
    box(0.16, 0.06, 1.95, METAL, [s * 1.12, 1.52 - 0.0, -1.72]);
    // angled armour plates
    for (let i = 0; i < 3; i++) {
      const z = -2.4 + i * 0.62;
      b.part(new THREE.BoxGeometry(0.05, 0.4, 0.55), i % 2 ? CAMO : METAL, {
        bone, at: [s * 1.19, 1.25, z], rotation: [0, 0, s * -8], flat: true,
      } as any);
      box(0.02, 0.05, 0.4, P.trim, [s * 1.22, 1.08, z]);
    }
    // inner face neon
    neon([s * 1.06, 1.17, -2.65], [s * 1.06, 1.17, -0.75], P.neonMagenta);
    // wheel arch humps
    b.part(new THREE.CylinderGeometry(0.42, 0.46, 0.55, 6), CAMO, {
      bone, at: [s * 0.88, FLOOR_Y + 0.12, -1.7], rotation: [0, 0, 90], flat: true,
    } as any);
    box(0.5, 0.04, 0.8, P.hullLight, [s * 0.88, FLOOR_Y + 0.42, -1.7]);
    // tie-down hooks
    for (const z of [-2.5, -1.9, -1.1]) {
      b.rod([s * 1.0, 1.5, z], [s * 1.0, 1.58, z], 0.015, P.metal, { bone });
      b.sweep(catmull([[s * 1.0, 1.58, z], [s * 0.95, 1.63, z], [s * 0.9, 1.58, z]]), 0.012, { bone, color: P.metal, sides: 5 } as any);
    }
  }

  // ---------- front wall (cab rear) ----------
  box(2.3, 0.55, 0.1, METAL, [0, 1.22, -0.75]);
  texBox(2.0, 0.12, 0.04, HAZ, [0, 1.38, -0.8]);
  box(2.3, 0.06, 0.14, P.hullLight, [0, 1.5, -0.75]);

  // ---------- tailgate ----------
  box(2.3, 0.5, 0.1, CAMO, [0, 1.22, -2.7]);
  texBox(2.2, 0.12, 0.03, HAZ, [0, 1.12, -2.77]);
  box(2.3, 0.06, 0.14, METAL, [0, 1.5, -2.7]);
  // hinge bolts
  for (const x of [-1.05, -0.35, 0.35, 1.05]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.metal, { bone, at: [x, 1.4, -2.77], rotation: [90, 0, 0] } as any);
  // tail light cluster
  for (const s of [1, -1]) {
    glow(box(0.3, 0.1, 0.03, P.tail, [s * 0.85, 1.3, -2.78]), 1.6);
    box(0.34, 0.14, 0.02, P.dark, [s * 0.85, 1.3, -2.765]);
    glow(box(0.1, 0.1, 0.03, P.white, [s * 0.6, 1.3, -2.78]), 1.2);
  }
  glow(box(0.6, 0.04, 0.03, P.tail, [0, 1.3, -2.78]), 1.6);

  // ---------- rear roll hoop ----------
  const hoop = catmull([[-1.05, 1.5, -2.55], [-1.05, 1.95, -2.55], [-0.5, 2.1, -2.55], [0.5, 2.1, -2.55], [1.05, 1.95, -2.55], [1.05, 1.5, -2.55]], { tension: 0.5 } as any);
  b.sweep(hoop, 0.04, { bone, color: P.hullLight, sides: 6 } as any);

  b.rod([-1.05, 1.9, -2.55], [1.05, 1.9, -2.55], 0.025, P.metal, { bone });
  glow(box(0.5, 0.06, 0.06, P.neonCyan, [0, 2.1, -2.55]), 1.8);
  for (const s of [1, -1]) b.rod([s * 1.0, 1.5, -2.5], [s * 0.7, 1.95, -2.2], 0.02, P.metal, { bone });

  // ---------- cargo: ammo crates ----------
  const crates: [number[], number, number[]][] = [
    [[0.65, FLOOR_Y + 0.2, -1.1], 8, [0.5, 0.34, 0.4]],
    [[0.6, FLOOR_Y + 0.2, -1.55], -5, [0.45, 0.34, 0.4]],
    [[0.62, FLOOR_Y + 0.5, -1.3], 14, [0.4, 0.26, 0.34]],
  ];
  for (const [at, rot, sz] of crates) {
    texBox(sz[0], sz[1], sz[2], CRATE, [at[0], at[1], at[2]], "#ffffff", { rotation: [0, rot, 0] } as any);
    b.part(new THREE.BoxGeometry(sz[0] + 0.02, 0.03, 0.06), P.metal, { bone, at: [at[0], at[1] + sz[1] / 2, at[2]], rotation: [0, rot, 0] } as any);
  }

  // ---------- fuel drums ----------
  const drumGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 10);
  for (const [x, z] of [[-0.7, -1.0], [-0.72, -1.5]]) {
    b.part(drumGeo, "#ffffff", { bone, at: [x, FLOOR_Y + 0.33, z], texture: DRUM } as any);
    b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.04, 10), P.dark, { bone, at: [x, FLOOR_Y + 0.5, z] });
    b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.04, 10), P.dark, { bone, at: [x, FLOOR_Y + 0.16, z] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 6), P.trim, { bone, at: [x + 0.08, FLOOR_Y + 0.65, z] });
  }
  // strap across drums
  b.rod([-0.95, FLOOR_Y + 0.45, -0.95], [-0.95, FLOOR_Y + 0.45, -1.7], 0.02, P.trim, { bone });

  // ---------- spare thruster cell ----------
  const sx = -0.55, sz = -2.35, sy = FLOOR_Y + 0.17;
  b.part(new THREE.CylinderGeometry(0.28, 0.3, 0.26, 6), P.hull, { bone, at: [sx, sy, sz], flat: true } as any);
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 6), CAMO, { bone, at: [sx, sy + 0.15, sz], flat: true } as any);
  glow(b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 12), P.neonCyan, { bone, at: [sx, sy + 0.185, sz] }), 1.6);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.02, 0.01, 0.16), P.dark, { bone, at: [sx + Math.cos(a) * 0.09, sy + 0.2, sz + Math.sin(a) * 0.09], rotation: [0, -a * 57.3, 0] } as any);
  }
  b.part(new THREE.TorusGeometry(0.29, 0.015, 4, 6), P.neonMagenta, { bone, at: [sx, sy - 0.05, sz], rotation: [90, 0, 0] } as any);

  // ---------- grille detail on front wall, mounting plate ----------
  b.part(new THREE.PlaneGeometry(0.5, 0.3), "#ffffff", { bone, at: [0, 1.25, -0.795], dir: [0, 0, -1], axis: "z", texture: GRILL } as any);

  // ---------- gun ring seat at gunMount ----------
  b.part(new THREE.CylinderGeometry(0.4, 0.42, 0.04, 12), P.hullLight, { bone, at: [M.gunMount[0], FLOOR_Y + 0.08, M.gunMount[2]] });
  b.part(new THREE.TorusGeometry(0.4, 0.015, 4, 12), P.neonCyan, { bone, at: [M.gunMount[0], FLOOR_Y + 0.105, M.gunMount[2]], rotation: [90, 0, 0] } as any);

  // ---------- cables ----------
  const cable = (pts: number[][], col: string) => b.sweep(catmull(pts), 0.012, { bone, color: col, sides: 5 } as any);
  cable([[0.9, FLOOR_Y + 0.1, -2.5], [0.7, FLOOR_Y + 0.14, -2.3], [0.2, FLOOR_Y + 0.1, -2.35], [-0.3, FLOOR_Y + 0.12, -2.3]], P.dark);
  cable([[-0.3, FLOOR_Y + 0.1, -2.1], [-0.4, FLOOR_Y + 0.14, -1.9], [-0.2, FLOOR_Y + 0.1, -1.7]], P.neonCyan);

  // ---------- neon trims ----------
  neon([-1.14, 1.55, -2.7], [-1.14, 1.55, -0.75], P.neonCyan, 0.01);
  neon([1.14, 1.55, -2.7], [1.14, 1.55, -0.75], P.neonCyan, 0.01);
  neon([-1.1, 1.0, -2.78], [1.1, 1.0, -2.78], P.neonMagenta, 0.012);

  // ---------- rivets along rails ----------
  for (const s of [1, -1]) for (let i = 0; i < 8; i++)
    b.part(new THREE.SphereGeometry(0.02, 5, 3), P.metal, { bone, at: [s * 1.12, 1.555, -2.6 + i * 0.26] });
  void R;
}
    return buildBed;
  })(),
  // pods
  (() => {
function buildPods({ b, J, P, M }: Ctx) {
  const LABEL = svg(
    `<svg viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="68" height="48" rx="4" fill="#14161b" stroke="#e7b814" stroke-width="3"/>
      <path d="M17 8 L30 34 L4 34Z" fill="#e7b814" stroke="#14161b" stroke-width="2"/>
      <rect x="15.5" y="15" width="3" height="10" fill="#14161b"/><rect x="15.5" y="27" width="3" height="3" fill="#14161b"/>
      <text x="36" y="22" font-family="monospace" font-weight="bold" font-size="11" fill="#2ff3ff">HOVER</text>
      <text x="36" y="35" font-family="monospace" font-size="8" fill="#ff2bd6">NO STEP</text>
      <path d="M6 43 H64" stroke="#e7b814" stroke-width="2" stroke-dasharray="5 3"/>
    </svg>`,
    { size: 256 },
  );

  const hazard = paint((_p, _n, s) => (Math.floor(s[1] / 20) % 2 ? P.trim : P.dark));
  const camo = mottle(P.camo, P.camoDark, { size: 0.12, seed: 4 });

  const quat = (yawDeg: number, tiltDeg: number) =>
    new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 1, 0), (yawDeg * Math.PI) / 180)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (tiltDeg * Math.PI) / 180));

  function pod(joint: any, mount: number[], R: number, neon: string) {
    const [x, , z] = mount;
    const at: [number, number, number] = [x, 0, z];
    const side = x > 0 ? 1 : -1;
    const hull = paint((p, n, s) => {
      const seam = s[1] % 60;
      let c: any = P.hull;
      if (p.y < 0.3) c = P.dark;
      else if (n.y > 0.5) c = P.hullLight;
      if (seam < 3 || seam > 57 || Math.abs(s[0] - 0.4) < 0.006) return P.dark;
      return c;
    });

    // housing, skirt, cap
    b.lathe([[0, 0.14], [0.95 * R, 0.14], [R, 0.2], [R, 0.6], [0.95 * R, 0.66], [0, 0.66]], { at, segments: 6, bone: joint, color: hull });
    b.lathe([[0.8 * R, 0], [1.04 * R, 0], [1.06 * R, 0.14], [0.8 * R, 0.14]], { at, segments: 6, bone: joint, color: P.dark });
    b.lathe([[0, 0.62], [0.97 * R, 0.62], [0.97 * R, 0.7], [0.8 * R, 0.75], [0, 0.75]], { at, segments: 6, bone: joint, color: camo });
    // hazard band + neon ring
    b.lathe([[1.012 * R, 0.24], [1.02 * R, 0.24], [1.02 * R, 0.3], [1.012 * R, 0.3]], { at, segments: 6, bone: joint, color: hazard });
    glow(b.lathe([[1.012 * R, 0.44], [1.03 * R, 0.44], [1.03 * R, 0.47], [1.012 * R, 0.47]], { at, segments: 6, bone: joint, color: neon }), 1.3);
    glow(b.lathe([[1.07 * R, 0.1], [1.075 * R, 0.1], [1.075 * R, 0.12], [1.07 * R, 0.12]], { at, segments: 6, bone: joint, color: neon }), 1.1);

    // turbine
    for (let i = 0; i < 8; i++) {
      const a = i * 45;
      const r = 0.45 * R;
      b.part(new THREE.BoxGeometry(0.09 * R * 1.4, 0.012, 0.55 * R), P.metal, {
        bone: joint,
        at: [x + Math.sin((a * Math.PI) / 180) * r, 0.08, z + Math.cos((a * Math.PI) / 180) * r],
        quat: quat(a, 25),
      });
    }
    b.part(new THREE.CylinderGeometry(0.2 * R, 0.2 * R, 0.05, 8), P.dark, { bone: joint, at: [x, 0.08, z] });
    glow(b.part(new THREE.CircleGeometry(0.62 * R, 12), P.neonCyan, { bone: joint, at: [x, 0.136, z], dir: [0, -1, 0], axis: "z" }), 1.6);
    glow(b.part(new THREE.ConeGeometry(0.16 * R, 0.1, 8), P.neonCyan, { bone: joint, at: [x, 0.04, z], dir: [0, -1, 0] }), 0.8);

    // vents, labels, bolts
    for (const a of [30, 150, 210, 330]) {
      const rad = (a * Math.PI) / 180;
      for (let k = 0; k < 3; k++)
        b.part(new THREE.BoxGeometry(0.22 * R, 0.022, 0.05), P.dark, {
          bone: joint,
          at: [x + Math.sin(rad) * 0.868 * R, 0.34 + k * 0.055, z + Math.cos(rad) * 0.868 * R],
          rotation: [0, a, 0],
        });
    }
    for (const a of [90, 270]) {
      const rad = (a * Math.PI) / 180;
      b.part(new THREE.PlaneGeometry(0.42 * R, 0.3 * R), "#ffffff", {
        bone: joint,
        at: [x + Math.sin(rad) * 0.874 * R, 0.36, z + Math.cos(rad) * 0.874 * R],
        dir: [Math.sin(rad), 0, Math.cos(rad)],
        axis: "z",
        texture: LABEL,
      });
    }
    for (let i = 0; i < 6; i++) {
      const rad = (i * 60 * Math.PI) / 180;
      b.part(new THREE.SphereGeometry(0.02, 5, 3), P.metal, {
        bone: joint,
        at: [x + Math.sin(rad) * 0.62 * R, 0.745, z + Math.cos(rad) * 0.62 * R],
      });
    }

    // mounting struts toward the chassis
    for (const dz of [-0.14, 0.14]) {
      b.rod([x - side * 0.8 * R, 0.45, z + dz], [x - side * (R + 0.14), 0.7, z + dz], 0.04, P.metal, { bone: joint });
    }
    b.part(new THREE.BoxGeometry(0.06, 0.1, 0.4), P.trim, { bone: joint, at: [x - side * (R + 0.14), 0.68, z] });
  }

  pod(J.podFL, M.podFL, 0.36, P.neonCyan);
  pod(J.podFR, M.podFR, 0.36, P.neonCyan);
  pod(J.podRL, M.podRL, 0.4, P.neonMagenta);
  pod(J.podRR, M.podRR, 0.4, P.neonMagenta);
}
    return buildPods;
  })(),
  // gun
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildGun({ b, J, P, M }: Ctx) {
  const GM = M.gunMount; // [0,1,-1.5]
  const gx = GM[0], gy = GM[1], gz = GM[2];
  const yaw = J.gunYaw, pitch = J.gunPitch, body = J.body;
  const PY = 1.35; // pitch joint height

  // ---------- paints & textures ----------
  const gunmetal = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, noise(p, 0.12, 4));
    const wear = smoothstep(0.55, 0.8, noise(p, 0.05, 9));
    const c = mix(base, P.dark, wear * 0.45);
    return mix(c, P.hullLight, smoothstep(0.4, 1, n.y) * 0.25);
  });
  const camoPaint = paint((p, n) => {
    const v = noise(p, 0.16, 12);
    let c = v > 0.58 ? P.camoDark : P.camo;
    if (noise(p, 0.07, 3) > 0.7) c = P.hull;
    return mix(c, P.dark, smoothstep(0.1, -0.8, n.y) * 0.5);
  });
  const hazard = paint((p) => {
    const s = (((p.x + p.y) * 9) % 1 + 1) % 1;
    return s < 0.5 ? P.trim : P.dark;
  });
  const hazardZ = paint((p) => {
    const s = (((p.x * 9 + p.y * 9)) % 1 + 1) % 1;
    return s < 0.5 ? P.trim : P.dark;
  });
  const vent = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#2a2e35"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${5 + i * 9.5}" y="4" width="5" height="24" rx="1" fill="#0a0b0e"/><rect x="${5 + i * 9.5}" y="4" width="1.5" height="24" fill="#59626d"/>`).join("")}
    <rect x="1" y="1" width="62" height="30" fill="none" stroke="#14161b" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const decal = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="29" fill="#14161b" stroke="#ff2bd6" stroke-width="3"/>
    <path d="M32 10 L50 44 L32 36 L14 44Z" fill="#2ff3ff"/><path d="M32 18 L42 38 L32 33 L22 38Z" fill="#14161b"/>
    <text x="32" y="58" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" fill="#e7b814">07</text></svg>`,
    { size: 128 },
  );
  const lens = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="15" fill="#0a2a33"/><circle cx="16" cy="16" r="11" fill="#2ff3ff"/><circle cx="16" cy="16" r="6" fill="#e8eef2"/><circle cx="13" cy="13" r="2" fill="#ffffff"/><path d="M16 1v6M16 25v6M1 16h6M25 16h6" stroke="#14161b" stroke-width="1.5"/></svg>`,
    { size: 64 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#5a6430"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#e8eef2" stroke-width="2"/><text x="32" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#e8eef2">20MM</text><text x="32" y="26" text-anchor="middle" font-family="monospace" font-size="7" fill="#e7b814">AMMO ▲</text></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const cyl = (r0: number, r1: number, h: number, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const put = (geo: THREE.BufferGeometry, color: any, bone: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });

  // ---------- fixed base: ring and pedestal on body ----------
  const baseY = gy; // 1.0
  put(cyl(0.5, 0.52, 0.05, 12), gunmetal, body, [gx, baseY + 0.025, gz]);
  put(cyl(0.44, 0.44, 0.03, 12), P.dark, body, [gx, baseY + 0.065, gz]);
  // hazard ring on base
  put(new THREE.TorusGeometry(0.46, 0.014, 4, 16), hazard, body, [gx, baseY + 0.055, gz], { rotation: [90, 0, 0] });
  // neon ring
  glow(put(new THREE.TorusGeometry(0.5, 0.01, 4, 20), P.neonMagenta, body, [gx, baseY + 0.03, gz], { rotation: [90, 0, 0] }), 1.4);
  // bolts on ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(cyl(0.02, 0.02, 0.03, 6), P.metal, body, [gx + Math.sin(a) * 0.48, baseY + 0.065, gz + Math.cos(a) * 0.48]);
  }
  // pedestal: tapered hex column
  put(cyl(0.2, 0.28, 0.2, 6), gunmetal, body, [gx, baseY + 0.18, gz]);
  put(cyl(0.16, 0.2, 0.08, 6), P.dark, body, [gx, baseY + 0.32, gz]);
  // pedestal braces (4 angled struts)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.rod([gx + Math.sin(a) * 0.4, baseY + 0.07, gz + Math.cos(a) * 0.4], [gx + Math.sin(a) * 0.2, baseY + 0.26, gz + Math.cos(a) * 0.2], 0.025, P.hullLight, { bone: body, sides: 6 });
  }
  // cable from base to bed
  b.sweep([[gx + 0.1, baseY + 0.1, gz - 0.2], [gx + 0.25, baseY + 0.02, gz - 0.35], [gx + 0.45, baseY + 0.02, gz - 0.55]], 0.012, { color: P.dark, bone: body, sides: 5 });

  // ---------- yaw turret (on gunYaw) ----------
  put(cyl(0.3, 0.3, 0.05, 10), camoPaint, yaw, [gx, baseY + 0.38, gz]);
  put(cyl(0.26, 0.3, 0.04, 10), P.dark, yaw, [gx, baseY + 0.42, gz]);
  // yoke arms
  for (const s of [1, -1]) {
    put(box(0.07, 0.4, 0.3), camoPaint, yaw, [gx + s * 0.27, PY + 0.02, gz]);
    // chamfer top
    put(box(0.07, 0.08, 0.2), gunmetal, yaw, [gx + s * 0.27, PY + 0.26, gz + 0.02], { rotation: [0, 0, 0] });
    // trunnion cap
    put(cyl(0.07, 0.07, 0.04, 8), P.metal, yaw, [gx + s * 0.315, PY, gz], { rotation: [0, 0, 90] });
    put(cyl(0.03, 0.03, 0.05, 6), P.dark, yaw, [gx + s * 0.335, PY, gz], { rotation: [0, 0, 90] });
    // bolts
    for (const dz of [-0.1, 0.1]) put(cyl(0.015, 0.015, 0.02, 6), P.metal, yaw, [gx + s * 0.31, PY - 0.12, gz + dz], { rotation: [0, 0, 90] });
  }
  // yoke rear bridge
  put(box(0.54, 0.1, 0.06), gunmetal, yaw, [gx, baseY + 0.5, gz - 0.14]);
  // yaw status
  glow(put(box(0.04, 0.04, 0.02), P.neonMagenta, yaw, [gx + 0.27, PY + 0.2, gz + 0.16]), 1.8);

  // ---------- shield plate (on yaw, in front) ----------
  const shield = b.extrude(
    [[-0.34, 0], [0.34, 0], [0.38, 0.28], [0.22, 0.46], [-0.22, 0.46], [-0.38, 0.28]],
    { at: [gx, baseY + 0.5, gz + 0.3], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: camoPaint, bone: yaw },
  );
  // cutout-ish: hazard stripe at bottom of shield
  put(box(0.72, 0.06, 0.042), hazard, yaw, [gx, baseY + 0.54, gz + 0.3]);
  put(box(0.5, 0.04, 0.045), P.dark, yaw, [gx, baseY + 0.8, gz + 0.3]);
  // shield decal
  b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", { bone: yaw, at: [gx - 0.2, baseY + 0.7, gz + 0.322], dir: [0, 0, 1], axis: "z", texture: decal });
  // shield edge neon
  glow(b.rod([gx - 0.37, baseY + 0.5, gz + 0.325], [gx - 0.22, baseY + 0.95, gz + 0.325], 0.008, P.neonCyan, { bone: yaw, sides: 4 }), 1.4);
  glow(b.rod([gx + 0.37, baseY + 0.5, gz + 0.325], [gx + 0.22, baseY + 0.95, gz + 0.325], 0.008, P.neonCyan, { bone: yaw, sides: 4 }), 1.4);
  // shield side braces
  for (const s of [1, -1]) b.rod([gx + s * 0.3, baseY + 0.5, gz + 0.3], [gx + s * 0.27, baseY + 0.5, gz + 0.05], 0.015, P.hullLight, { bone: yaw, sides: 5 });

  // ---------- pitch assembly ----------
  const cz = gz; // cradle centred above pedestal
  // cradle body (receiver)
  put(box(0.36, 0.26, 0.5), camoPaint, pitch, [gx, PY, cz + 0.05]);
  put(box(0.3, 0.06, 0.46), P.dark, pitch, [gx, PY + 0.14, cz + 0.05]);
  put(box(0.38, 0.04, 0.3), gunmetal, pitch, [gx, PY - 0.14, cz + 0.1]);
  // trunnion axle
  put(cyl(0.04, 0.04, 0.58, 8), P.metal, pitch, [gx, PY, cz], { rotation: [0, 0, 90] });
  // rear block / breech
  put(box(0.3, 0.22, 0.12), gunmetal, pitch, [gx, PY, cz - 0.26]);
  put(cyl(0.05, 0.05, 0.08, 6), P.dark, pitch, [gx, PY, cz - 0.34], { rotation: [90, 0, 0] });
  // side vent panels with texture
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.28, 0.14), "#ffffff", { bone: pitch, at: [gx + s * 0.185, PY, cz + 0.06], dir: [s, 0, 0], axis: "z", texture: vent });
  }
  // hazard slash on receiver top
  put(box(0.1, 0.012, 0.2), hazard, pitch, [gx, PY + 0.176, cz + 0.05]);

  // twin barrels
  for (const s of [1, -1]) {
    const bx = gx + s * 0.085;
    // cooling jacket
    put(cyl(0.062, 0.062, 0.55, 8), gunmetal, pitch, [bx, PY + 0.02, cz + 0.52], { rotation: [90, 0, 0] });
    // vent holes on jacket (dark slits)
    for (let i = 0; i < 5; i++) put(box(0.04, 0.012, 0.03), P.dark, pitch, [bx, PY + 0.083, cz + 0.32 + i * 0.1]);
    for (let i = 0; i < 4; i++) put(cyl(0.066, 0.066, 0.012, 8), P.metal, pitch, [bx, PY + 0.02, cz + 0.33 + i * 0.14], { rotation: [90, 0, 0] });
    // barrel
    put(cyl(0.028, 0.028, 0.42, 8), P.dark, pitch, [bx, PY + 0.02, cz + 0.97], { rotation: [90, 0, 0] });
    // muzzle brake
    put(cyl(0.05, 0.05, 0.12, 6), P.metal, pitch, [bx, PY + 0.02, cz + 1.2], { rotation: [90, 0, 0] });
    put(box(0.07, 0.015, 0.03), P.dark, pitch, [bx, PY + 0.07, cz + 1.2]);
    put(box(0.07, 0.015, 0.03), P.dark, pitch, [bx, PY - 0.03, cz + 1.2]);
    put(cyl(0.03, 0.03, 0.02, 8), P.neonCyan, pitch, [bx, PY + 0.02, cz + 1.265], { rotation: [90, 0, 0] });
    glow(b.part(cyl(0.02, 0.02, 0.005, 8), P.neonCyan, { bone: pitch, at: [bx, PY + 0.02, cz + 1.27], rotation: [90, 0, 0], flat: true }), 2);
  }
  // barrel clamp bridging both
  put(box(0.28, 0.06, 0.04), P.hullLight, pitch, [gx, PY + 0.02, cz + 0.8]);
  put(box(0.28, 0.05, 0.04), P.hullLight, pitch, [gx, PY + 0.02, cz + 1.08]);

  // ammo box on left side with belt feed
  const ax = gx + 0.31;
  put(box(0.18, 0.2, 0.26), P.camo, pitch, [ax + 0.04, PY - 0.08, cz - 0.02]);
  b.part(new THREE.PlaneGeometry(0.24, 0.12), "#ffffff", { bone: pitch, at: [ax + 0.135, PY - 0.08, cz - 0.02], dir: [1, 0, 0], axis: "z", texture: warn });
  put(box(0.19, 0.03, 0.27), P.dark, pitch, [ax + 0.04, PY + 0.03, cz - 0.02]);
  put(box(0.04, 0.05, 0.08), P.metal, pitch, [ax + 0.04, PY + 0.06, cz - 0.02]);
  // belt: chain of brass-like links curving to receiver
  const belt = [[ax - 0.02, PY + 0.0, cz + 0.1], [ax - 0.08, PY + 0.02, cz + 0.16], [ax - 0.12, PY + 0.04, cz + 0.2]];
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    put(box(0.025, 0.03, 0.03), i % 2 ? P.trim : P.metal, pitch, [ax + 0.0 - t * 0.12, PY - 0.14 + t * 0.2, cz + 0.12 + t * 0.1], { rotation: [0, 0, -30 * t] });
  }
  void belt;
  // right-side spent-casing chute
  put(box(0.06, 0.08, 0.14), P.dark, pitch, [gx - 0.2, PY - 0.08, cz + 0.05]);

  // ---------- sensor (cyan) on top ----------
  put(box(0.1, 0.1, 0.12), P.dark, pitch, [gx - 0.1, PY + 0.22, cz + 0.12]);
  put(cyl(0.04, 0.045, 0.06, 8), P.hullLight, pitch, [gx - 0.1, PY + 0.28, cz + 0.12]);
  put(cyl(0.05, 0.05, 0.05, 8), P.hullLight, pitch, [gx - 0.1, PY + 0.22, cz + 0.2], { rotation: [90, 0, 0] });
  glow(b.part(new THREE.CircleGeometry(0.04, 10), "#ffffff", { bone: pitch, at: [gx - 0.1, PY + 0.22, cz + 0.2262], dir: [0, 0, 1], axis: "z", texture: lens }), 2);
  // status light magenta
  glow(put(cyl(0.025, 0.025, 0.04, 6), P.neonMagenta, pitch, [gx + 0.1, PY + 0.2, cz - 0.1]), 2);
  put(cyl(0.032, 0.032, 0.01, 6), P.dark, pitch, [gx + 0.1, PY + 0.175, cz - 0.1]);
  // antenna
  b.rod([gx + 0.14, PY + 0.17, cz - 0.2], [gx + 0.16, PY + 0.62, cz - 0.3], [0.012, 0.004], P.metal, { bone: pitch, sides: 5 });
  put(new THREE.SphereGeometry(0.014, 5, 4), P.neonMagenta, pitch, [gx + 0.16, PY + 0.63, cz - 0.3]);
  glow(put(new THREE.SphereGeometry(0.01, 5, 4), P.neonMagenta, pitch, [gx + 0.16, PY + 0.63, cz - 0.3]), 2);
  // handle grips at rear
  b.rod([gx - 0.12, PY - 0.02, cz - 0.34], [gx - 0.12, PY - 0.1, cz - 0.5], 0.014, P.dark, { bone: pitch, sides: 5 });
  b.rod([gx + 0.12, PY - 0.02, cz - 0.34], [gx + 0.12, PY - 0.1, cz - 0.5], 0.014, P.dark, { bone: pitch, sides: 5 });
  b.rod([gx - 0.12, PY - 0.1, cz - 0.5], [gx + 0.12, PY - 0.1, cz - 0.5], 0.014, P.dark, { bone: pitch, sides: 5 });
}
    return buildGun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.9,0], dir: [0,0,1], role: "spine" });
  J["podFL"] = b.joint("podFL", { parent: J["body"], at: [1,0.55,1.75], dir: [0,-1,0], role: "hinge", group: "pods" });
  J["podFR"] = b.joint("podFR", { parent: J["body"], at: [-1,0.55,1.75], dir: [0,-1,0], role: "hinge", group: "pods" });
  J["podRL"] = b.joint("podRL", { parent: J["body"], at: [1,0.55,-1.7], dir: [0,-1,0], role: "hinge", group: "pods" });
  J["podRR"] = b.joint("podRR", { parent: J["body"], at: [-1,0.55,-1.7], dir: [0,-1,0], role: "hinge", group: "pods" });
  J["gunYaw"] = b.joint("gunYaw", { parent: J["body"], at: [0,1,-1.5], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["gunYaw"], at: [0,1.35,-1.5], dir: [0,0,1], role: "hinge", group: "gun" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
