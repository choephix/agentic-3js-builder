```ts
import * as THREE from "three";
import { createBuilder, paint, patches, noise, mix, smoothstep, resolve, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Stabilised Railgun Carrier",
  description:
    "Six-wheeled 6x6 railgun carrier with a camo hull, armoured cab, turret-mounted rail cannon and four deployed stabiliser legs plus a rear recoil spade.",
};

// ------------------------------------------------------------------ palette
const TYRE = "#1b1d20";
const TYRE2 = "#2a2d31";
const RIM = "#8a9199";
const DARK = "#2a2e34";
const STEEL = "#555d66";
const LSTEEL = "#9aa2aa";
const BRASS = "#c9a24a";
const AMBER = "#ffb020";
const CYAN = "#58e6ff";
const RED = "#c0392b";
const GLASS = "#1f3a48";
const OLIVE = "#3d4733";

const camo = patches("#4f5d41", ["#6a6c47", "#38432f", "#76785a"], { size: 1.1, gap: 0.05, seed: 3 });
const HULL = paint((p, n) => {
  let c = resolve(camo, p, n);
  const dirt = smoothstep(1.5, 0.8, p.y) * (0.5 + 0.5 * noise(p, 0.3, 5));
  c = mix(c, "#4a3d2c", dirt * 0.55);
  c = mix(c, "#cfd5ac", smoothstep(0.6, 1, n.y) * 0.14);
  c = mix(c, "#10130d", smoothstep(0.7, 1.0, 1 - noise(p, 0.07, 9)) * 0.25);
  const sx = (((p.z + 20) * 0.9) % 1.0);
  if (Math.abs(n.x) > 0.7 && (sx < 0.025 || (((p.y + 5) * 1.6) % 1) < 0.02)) c = mix(c, "#10130d", 0.7);
  if (n.y > 0.7 && sx < 0.025) c = mix(c, "#10130d", 0.6);
  return c;
});

// ------------------------------------------------------------------ textures
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><defs><pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#f2b705"/><rect x="8" width="8" height="16" fill="#1b1b1b"/></pattern></defs><rect width="64" height="16" fill="url(#p)"/><rect x="0.8" y="0.8" width="62.4" height="14.4" fill="none" stroke="#111" stroke-width="1.6"/></svg>`,
  { size: 256 },
);
const NUMBER = svg(
  `<svg viewBox="0 0 64 32"><text x="32" y="25" text-anchor="middle" font-family="Impact,Arial Black,sans-serif" font-size="26" font-weight="bold" fill="#e8e8dc" stroke="#111" stroke-width="1.2" paint-order="stroke">R-07</text></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 3 L58 12 L55 40 Q50 56 32 62 Q14 56 9 40 L6 12 Z" fill="#1d2430" stroke="#e8e8dc" stroke-width="3"/><path d="M36 10 L20 36 L30 36 L26 56 L44 28 L34 28 Z" fill="#58e6ff" stroke="#0b2230" stroke-width="2" stroke-linejoin="round"/><path d="M12 16 L52 16" stroke="#c0392b" stroke-width="3"/></svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 96 40"><rect x="2" y="2" width="92" height="36" rx="4" fill="#d9d4bd" stroke="#111" stroke-width="2.5"/><text x="48" y="17" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="11" font-weight="bold" fill="#161616">RAILGUN MK.IV</text><text x="48" y="31" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#b0281c">HIGH VOLTAGE 40MJ</text></svg>`,
  { size: 384 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 5 L61 57 L3 57 Z" fill="#f2b705" stroke="#111" stroke-width="4" stroke-linejoin="round"/><path d="M36 20 L24 40 L32 40 L28 52 L42 32 L34 32 Z" fill="#111"/></svg>`,
  { size: 128 },
);
const TALLY = svg(
  `<svg viewBox="0 0 64 32"><g stroke="#e8e8dc" stroke-width="3" stroke-linecap="round"><path d="M6 6V26M14 6V26M22 6V26M30 6V26M2 24L34 8"/><path d="M42 6V26M50 6V26M58 6V26"/></g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "railcarrier" });
  const X: [number, number, number] = [1, 0, 0];
  const Y: [number, number, number] = [0, 1, 0];
  const Z: [number, number, number] = [0, 0, 1];
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

  const chassis = b.joint("chassis", { at: [0, 1.1, 0], role: "spine" });

  const bx = (bone: any, w: number, h: number, d: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(box(w, h, d), c, { bone, at: [x, y, z], ...o });
  const cy = (bone: any, r: number, h: number, c: any, at: number[], dir: number[], sides = 8, o: any = {}) =>
    b.part(cyl(r, h, sides), c, { bone, at, dir, flat: true, ...o });
  const deco = (tex: any, w: number, h: number, at: number[], dir: number[], bone: any = chassis, up: number[] = Y) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex });

  class Merger {
    list: THREE.BufferGeometry[] = [];
    add(g: THREE.BufferGeometry, pos: number[], q?: THREE.Quaternion) {
      const m = new THREE.Matrix4();
      m.compose(new THREE.Vector3(pos[0], pos[1], pos[2]), q ?? new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      g.applyMatrix4(m);
      this.list.push(g);
    }
    commit(c: any, bone: any) {
      if (this.list.length) b.part(mergeGeometries(this.list)!, c, { bone, at: [0, 0, 0] });
    }
  }
  const qx = (a: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);

  // ================================================================== hull
  b.extrude(
    ([
      [-5.1, 1.1],
      [-4.8, 0.88],
      [2.0, 0.88],
      [2.3, 1.1],
      [2.3, 1.6],
      [2.0, 1.8],
      [-4.8, 1.8],
      [-5.1, 1.6],
    ] as number[][]).map(([x, y]) => [x, y, "sharp"] as [number, number, "sharp"]),
    { at: [0, 0, 0], x: Z, y: Y, thickness: 2.4, bevel: 0.05, color: HULL, bone: chassis },
  );
  // deck slab (also forms the side skirts over the wheels)
  bx(chassis, 2.9, 0.55, 6.7, HULL, 0, 1.5, -1.75);
  bx(chassis, 2.96, 0.06, 6.76, DARK, 0, 1.79, -1.75); // deck edge trim
  bx(chassis, 2.96, 0.06, 6.76, DARK, 0, 1.22, -1.75);
  bx(chassis, 2.6, 0.12, 6.6, STEEL, 0, 0.82, -1.5); // skid plate
  for (const s of [1, -1]) {
    // skirt detail: rivet rows, access plates, hazard strip
    for (let i = 0; i < 6; i++) {
      bx(chassis, 0.04, 0.34, 0.9, DARK, s * 1.47, 1.5, -4.7 + i * 1.15, { });
    }
    deco(HAZARD, 1.1, 0.28, [s * 1.48, 1.35, -1.0], [s, 0, 0]);
    deco(WARN, 0.35, 0.35, [s * 1.48, 1.55, 1.15], [s, 0, 0]);
    deco(TALLY, 0.7, 0.35, [s * 1.48, 1.6, -4.9], [s, 0, 0]);
    // tow shackle & grab handles
    b.rod([s * 1.5, 1.35, -5.1], [s * 1.5, 1.6, -5.1], 0.03, STEEL, { bone: chassis, sides: 6 });
  }
  deco(NUMBER, 1.2, 0.6, [1.48, 1.52, -2.9], [1, 0, 0]);
  deco(EMBLEM, 0.6, 0.6, [-1.48, 1.5, -2.9], [-1, 0, 0]);

  // underbody: driveshafts, axles, diffs
  const AXLES = [3.0, 1.4, -2.8];
  b.rod([0, 0.7, 3.0], [0, 0.7, -2.8], 0.07, DARK, { bone: chassis, sides: 8 });
  for (const z of AXLES) {
    b.rod([-1.35, 0.6, z], [1.35, 0.6, z], 0.09, DARK, { bone: chassis, sides: 8 });
    b.part(new THREE.SphereGeometry(0.24, 8, 6), STEEL, { bone: chassis, at: [0, 0.6, z], flat: true });
    for (const s of [1, -1]) {
      bx(chassis, 0.14, 0.05, 1.1, LSTEEL, s * 0.85, 0.76, z); // leaf springs
      bx(chassis, 0.16, 0.04, 0.8, LSTEEL, s * 0.85, 0.80, z);
      b.rod([s * 1.1, 0.64, z + 0.3], [s * 1.0, 0.92, z + 0.35], 0.035, BRASS, { bone: chassis, sides: 6 }); // shock
    }
  }
  // belly tank + ribs
  cy(chassis, 0.2, 1.4, STEEL, [0.6, 0.8, -1.3], Z, 10);

  // ================================================================== wheels
  function wheel(bone: any, hx: number, hy: number, hz: number, s: number) {
    b.part(cyl(0.6, 0.56, 16), TYRE, { bone, at: [hx, hy, hz], rotation: [0, 0, 90], flat: true });
    const tread = new Merger();
    for (let i = 0; i < 12; i++)
      for (const k of [-1, 1]) {
        const a = (i / 12) * Math.PI * 2 + (k > 0 ? Math.PI / 12 : 0);
        tread.add(box(0.26, 0.1, 0.2), [hx + k * 0.14, hy + 0.6 * Math.cos(a), hz + 0.6 * Math.sin(a)], qx(a));
      }
    tread.commit(TYRE2, bone);
    b.part(new THREE.TorusGeometry(0.5, 0.05, 5, 16), TYRE2, { bone, at: [hx + s * 0.29, hy, hz], rotation: [0, 90, 0] }); // sidewall bead
    b.part(cyl(0.4, 0.12, 12), RIM, { bone, at: [hx + s * 0.27, hy, hz], rotation: [0, 0, 90], flat: true });
    b.part(new THREE.TorusGeometry(0.4, 0.04, 5, 14), LSTEEL, { bone, at: [hx + s * 0.33, hy, hz], rotation: [0, 90, 0] });
    b.part(cyl(0.27, 0.05, 12), DARK, { bone, at: [hx + s * 0.33, hy, hz], rotation: [0, 0, 90], flat: true });
    const fx = new Merger();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      fx.add(box(0.05, 0.3, 0.06), [hx + s * 0.35, hy + 0.17 * Math.cos(a), hz + 0.17 * Math.sin(a)], qx(a));
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const g = cyl(0.028, 0.06, 6);
      g.rotateZ(Math.PI / 2);
      fx.add(g, [hx + s * 0.38, hy + 0.2 * Math.cos(a), hz + 0.2 * Math.sin(a)]);
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const g = cyl(0.014, 0.04, 5);
      g.rotateZ(Math.PI / 2);
      fx.add(g, [hx + s * 0.34, hy + 0.37 * Math.cos(a), hz + 0.37 * Math.sin(a)]);
    }
    fx.commit(BRASS, bone);
    b.part(cyl(0.12, 0.12, 8), LSTEEL, { bone, at: [hx + s * 0.38, hy, hz], rotation: [0, 0, 90], flat: true });
    b.part(cyl(0.015, 0.1, 5), RED, { bone, at: [hx + s * 0.34, hy - 0.33, hz + 0.05] }); // valve stem
    // inner brake drum
    b.part(cyl(0.3, 0.16, 10), DARK, { bone, at: [hx - s * 0.3, hy, hz], rotation: [0, 0, 90], flat: true });
  }
  AXLES.forEach((z, i) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hub: [number, number, number] = [s * 1.5, 0.6, z];
      const steer =
        i < 2 ? b.joint(`steer${side}${i + 1}`, { parent: chassis, at: hub, dir: Z, up: X, role: "hinge" }) : chassis;
      const spin = b.joint(`wheel${side}${i + 1}`, { parent: steer, at: hub, dir: [s, 0, 0], role: "hinge" });
      wheel(spin, hub[0], hub[1], hub[2], s);
      // mud flap behind wheel
      bx(chassis, 0.5, 0.45, 0.04, DARK, s * 1.5, 0.98, z - 0.72);
      bx(chassis, 0.5, 0.06, 0.05, AMBER, s * 1.5, 0.78, z - 0.72);
      // arch trim
      b.part(new THREE.TorusGeometry(0.72, 0.035, 4, 12, Math.PI), STEEL, { bone: chassis, at: [s * 1.78, 0.6, z], rotation: [0, 90, 0] });
    }
  });
  // front fenders over cab wheels
  for (const s of [1, -1])
    for (const z of [3.0]) {
      bx(chassis, 0.7, 0.09, 1.1, HULL, s * 1.5, 1.34, z);
      bx(chassis, 0.7, 0.09, 0.5, HULL, s * 1.5, 1.27, z + 0.75, { rotation: [-35, 0, 0] });
      bx(chassis, 0.7, 0.09, 0.5, HULL, s * 1.5, 1.27, z - 0.75, { rotation: [35, 0, 0] });
    }

  // ================================================================== cab
  b.extrude(
    ([
      [2.2, 0.95],
      [4.7, 0.95],
      [4.85, 1.55],
      [4.45, 1.9],
      [3.9, 2.7],
      [2.2, 2.7],
    ] as number[][]).map(([x, y]) => [x, y, "sharp"] as [number, number, "sharp"]),
    { at: [0, 0, 0], x: Z, y: Y, thickness: 2.3, bevel: 0.05, color: HULL, bone: chassis },
  );
  // windscreen
  const wn = new THREE.Vector3(0, 0.568, 0.826);
  b.part(box(1.95, 0.8, 0.05), GLASS, { bone: chassis, at: [0, 2.3, 4.175 + 0.03], dir: wn, axis: "z", up: Y });
  for (const dx of [-0.65, 0.0, 0.65])
    b.part(box(0.04, 0.82, 0.06), DARK, { bone: chassis, at: [dx, 2.3, 4.2], dir: wn, axis: "z", up: Y });
  b.part(box(2.1, 0.08, 0.1), DARK, { bone: chassis, at: [0, 2.72, 3.9], dir: wn, axis: "z", up: Y }); // brow
  // armoured window shutters on windscreen
  for (const s of [1, -1])
    b.part(box(0.9, 0.12, 0.08), HULL, { bone: chassis, at: [s * 0.5, 2.62, 4.0], dir: wn, axis: "z", up: Y });
  // lower nose: grille, lights, bumper
  bx(chassis, 1.6, 0.55, 0.06, DARK, 0, 1.3, 4.82, { rotation: [0, 0, 0] });
  for (let i = 0; i < 6; i++) bx(chassis, 1.5, 0.04, 0.08, LSTEEL, 0, 1.08 + i * 0.09, 4.86);
  for (const s of [1, -1]) {
    bx(chassis, 0.42, 0.28, 0.1, DARK, s * 1.0, 1.4, 4.8);
    glow(bx(chassis, 0.34, 0.2, 0.04, "#fff2b0", s * 1.0, 1.4, 4.87), 1.4);
    bx(chassis, 0.16, 0.1, 0.06, AMBER, s * 1.0, 1.15, 4.84);
    b.part(new THREE.TorusGeometry(0.06, 0.02, 5, 8, Math.PI), STEEL, { bone: chassis, at: [s * 0.65, 0.88, 5.08], rotation: [90, 0, 0] });
  }
  bx(chassis, 2.7, 0.38, 0.35, STEEL, 0, 0.9, 4.95);
  bx(chassis, 2.74, 0.06, 0.4, DARK, 0, 1.1, 4.95);
  deco(HAZARD, 2.4, 0.2, [0, 0.9, 5.14], Z);
  for (const s of [1, -1]) bx(chassis, 0.3, 0.45, 0.4, DARK, s * 1.3, 0.92, 4.9);
  // winch
  cy(chassis, 0.1, 0.8, LSTEEL, [0, 0.9, 4.75], X, 10);
  // doors and windows
  for (const s of [1, -1]) {
    const wx = s * 1.16;
    bx(chassis, 0.04, 0.6, 1.2, GLASS, wx, 2.25, 3.35);
    bx(chassis, 0.06, 0.07, 1.3, DARK, s * 1.17, 2.58, 3.35);
    bx(chassis, 0.06, 0.07, 1.3, DARK, s * 1.17, 1.93, 3.35);
    bx(chassis, 0.06, 0.6, 0.07, DARK, s * 1.17, 2.25, 2.7);
    bx(chassis, 0.06, 0.6, 0.07, DARK, s * 1.17, 2.25, 4.0);
    // door seams
    for (const z of [2.65, 4.05]) bx(chassis, 0.03, 1.4, 0.03, DARK, s * 1.16, 1.65, z);
    bx(chassis, 0.05, 0.05, 0.18, LSTEEL, s * 1.18, 1.9, 2.85); // handle
    // step
    bx(chassis, 0.3, 0.05, 0.8, STEEL, s * 1.3, 0.98, 3.4);
    // mirror arms
    b.rod([s * 1.15, 2.4, 4.0], [s * 1.5, 2.5, 4.15], 0.025, STEEL, { bone: chassis, sides: 6 });
    bx(chassis, 0.12, 0.34, 0.2, DARK, s * 1.55, 2.5, 4.15);
    // side armour stand-off plate
    bx(chassis, 0.08, 0.5, 1.3, HULL, s * 1.2, 1.35, 3.35);
  }
  deco(NUMBER, 0.7, 0.35, [1.19, 1.5, 3.35], [1, 0, 0]);
  deco(EMBLEM, 0.4, 0.4, [-1.19, 1.5, 3.35], [-1, 0, 0]);
  // cab roof
  bx(chassis, 2.1, 0.1, 1.6, HULL, 0, 2.74, 3.0);
  bx(chassis, 1.4, 0.07, 0.12, DARK, 0, 2.82, 3.7);
  for (const x of [-0.55, -0.18, 0.18, 0.55]) glow(bx(chassis, 0.28, 0.06, 0.06, x < 0 ? RED : CYAN, x, 2.87, 3.7), 1.4);
  cy(chassis, 0.3, 0.1, DARK, [0.6, 2.82, 2.5], Y, 10);
  b.part(new THREE.SphereGeometry(0.26, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: chassis, at: [0.6, 2.84, 2.5], flat: true });
  b.part(cyl(0.05, 0.16, 6), LSTEEL, { bone: chassis, at: [0.6, 2.95, 2.5] });
  for (const s of [1, -1]) {
    b.spike([s * 0.95, 2.78, 2.5], Y, 1.5, 0.025, LSTEEL, { bone: chassis, sides: 5 });
    cy(chassis, 0.06, 0.1, DARK, [s * 0.95, 2.82, 2.5], Y, 6);
  }
  // radar bar
  b.rod([-0.3, 2.82, 2.4], [-0.3, 3.1, 2.4], 0.03, STEEL, { bone: chassis, sides: 6 });
  bx(chassis, 0.7, 0.08, 0.14, LSTEEL, -0.3, 3.15, 2.4);
  // cab-hull gap: air intake & exhaust behind cab
  bx(chassis, 1.2, 0.8, 0.12, DARK, 0, 2.2, 2.2);
  for (let i = 0; i < 5; i++) bx(chassis, 1.1, 0.03, 0.15, LSTEEL, 0, 1.95 + i * 0.12, 2.16);

  // ================================================================== power module + deck gear
  bx(chassis, 2.5, 0.9, 1.9, HULL, 0, 2.23, -4.1);
  bx(chassis, 2.54, 0.06, 1.94, DARK, 0, 2.7, -4.1);
  for (let i = 0; i < 8; i++) bx(chassis, 2.0, 0.04, 0.05, DARK, 0, 1.95 + i * 0.09, -5.08); // rear louvres
  glow(bx(chassis, 1.6, 0.06, 0.02, CYAN, 0, 2.7, -5.07), 1.3);
  for (const s of [1, -1]) {
    cy(chassis, 0.14, 1.2, STEEL, [s * 0.9, 3.25, -4.8], Y, 8);
    cy(chassis, 0.19, 0.1, DARK, [s * 0.9, 3.85, -4.8], Y, 8);
    cy(chassis, 0.22, 0.1, BRASS, [s * 0.9, 3.0, -4.8], Y, 8);
    deco(WARN, 0.3, 0.3, [s * 1.26, 2.25, -4.1], [s, 0, 0]);
    // side radiator
    for (let i = 0; i < 7; i++) bx(chassis, 0.05, 0.5, 0.04, LSTEEL, s * 1.27, 2.3, -4.8 + i * 0.28);
    // ammo cassettes beside turret
    bx(chassis, 0.4, 0.5, 0.9, STEEL, s * 1.18, 2.05, -3.0);
  }
  const R = rng(5);
  for (let i = 0; i < 9; i++) {
    const g = i % 2 ? box(0.18, 0.1, 0.22) : cyl(0.08, 0.14, 8);
    b.part(g, i % 3 ? DARK : LSTEEL, { bone: chassis, at: [(R() - 0.5) * 1.8, 2.75, -4.1 + (R() - 0.5) * 1.4], flat: true });
  }
  // front deck: hatches, tie rings, spare cells
  cy(chassis, 0.28, 0.08, HULL, [-0.6, 1.84, 1.0], Y, 10);
  cy(chassis, 0.06, 0.04, LSTEEL, [-0.6, 1.9, 1.0], Y, 6);
  bx(chassis, 0.7, 0.25, 0.5, STEEL, 0.7, 1.95, 1.0);
  deco(LABEL, 0.62, 0.26, [0.7, 1.96, 1.256], Z);
  for (const s of [1, -1])
    for (const z of [1.5, -0.2])
      b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8), STEEL, { bone: chassis, at: [s * 1.2, 1.83, z], rotation: [90, 0, 0] });
  // tail lights and pintle
  for (const s of [1, -1]) {
    glow(bx(chassis, 0.3, 0.12, 0.04, RED, s * 1.1, 1.6, -5.14), 1.2);
    bx(chassis, 0.34, 0.16, 0.05, DARK, s * 1.1, 1.6, -5.12);
  }
  cy(chassis, 0.1, 0.3, STEEL, [0, 1.2, -5.2], Z, 8);
  b.part(new THREE.TorusGeometry(0.12, 0.03, 5, 8), STEEL, { bone: chassis, at: [0, 1.2, -5.4] });

  // ================================================================== turret
  const TY = 1.8;
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, TY, -1.2], dir: Y, role: "hinge" });
  const PV = new THREE.Vector3(0, 3.0, -1.2);
  const A = (18 * Math.PI) / 180;
  const fwd = new THREE.Vector3(0, Math.sin(A), Math.cos(A));
  const upv = new THREE.Vector3(0, Math.cos(A), -Math.sin(A));
  const pitch = b.joint("gunPitch", { parent: yaw, at: PV.toArray() as [number, number, number], dir: Z, up: Y, role: "hinge" });
  // fixed ring on deck
  b.part(new THREE.TorusGeometry(1.15, 0.08, 5, 16), STEEL, { bone: chassis, at: [0, TY, -1.2], rotation: [90, 0, 0] });
  const bolts = new Merger();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    bolts.add(cyl(0.035, 0.06, 6), [1.15 * Math.cos(a), TY + 0.07, -1.2 + 1.15 * Math.sin(a)]);
  }
  bolts.commit(LSTEEL, chassis);
  // housing
  bx(yaw, 2.6, 0.8, 2.6, HULL, 0, 2.2, -1.2);
  bx(yaw, 2.2, 0.15, 2.2, HULL, 0, 2.68, -1.2);
  for (const s of [1, -1]) {
    bx(yaw, 0.12, 0.7, 2.4, HULL, s * 1.35, 2.2, -1.2, { rotation: [0, 0, s * 14] });
    deco(HAZARD, 1.6, 0.2, [s * 1.43, 2.05, -1.2], [s, 0, 0], yaw);
    // trunnion cheeks
    bx(yaw, 0.3, 1.3, 1.7, HULL, s * 1.15, 3.0, -1.2);
    bx(yaw, 0.34, 0.18, 1.5, DARK, s * 1.15, 3.7, -1.2);
    cy(yaw, 0.26, 0.1, LSTEEL, [s * 1.34, 3.0, -1.2], X, 10);
    glow(cy(yaw, 0.1, 0.12, AMBER, [s * 1.38, 3.45, -0.6], X, 6), 1.2);
  }
  // turret rear counterweight
  bx(yaw, 2.2, 0.9, 0.6, HULL, 0, 2.55, -2.65);
  // sensor head
  cy(yaw, 0.2, 0.14, DARK, [-0.85, 2.82, -0.2], Y, 8);
  b.part(new THREE.SphereGeometry(0.18, 8, 5), GLASS, { bone: yaw, at: [-0.85, 2.95, -0.2], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), CYAN, { bone: yaw, at: [-0.85, 2.98, -0.04], flat: true }), 1.5);
  cy(yaw, 0.3, 0.06, HULL, [0.8, 2.78, -1.9], Y, 10);
  deco(WARN, 0.4, 0.4, [0.0, 2.2, 0.11], Z, yaw);
  deco(HAZARD, 1.8, 0.18, [0, 1.95, 0.11], Z, yaw);

  // gun helpers (local u lateral, v up-along-gun-normal, w along barrel)
  const G = (u: number, v: number, w: number) =>
    new THREE.Vector3(u, 0, 0).add(PV).addScaledVector(upv, v).addScaledVector(fwd, w);
  const gbox = (w: number, h: number, d: number, c: any, u: number, v: number, wd: number) =>
    b.part(box(w, h, d), c, { bone: pitch, at: G(u, v, wd), dir: fwd, axis: "z", up: upv });
  const gcyl = (r: number, len: number, c: any, u: number, v: number, wd: number, sides = 8) =>
    b.part(cyl(r, len, sides), c, { bone: pitch, at: G(u, v, wd), dir: fwd, flat: true });
  const gring = (r: number, t: number, c: any, u: number, v: number, wd: number) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 10), c, { bone: pitch, at: G(u, v, wd), dir: fwd, axis: "z" });

  b.part(cyl(0.2, 2.5, 10), STEEL, { bone: pitch, at: PV, rotation: [0, 0, 90], flat: true }); // trunnion shaft
  gbox(1.2, 1.0, 2.0, HULL, 0, 0, -0.3); // breech
  gbox(1.0, 0.18, 1.8, DARK, 0, 0.56, -0.3);
  gbox(1.24, 0.2, 0.8, STEEL, 0, 0.1, 0.8); // collar
  gcyl(0.4, 0.25, DARK, 0, 0, -1.4, 8);
  glow(gring(0.28, 0.04, CYAN, 0, 0, -1.55), 1.5);
  for (const s of [1, -1]) {
    deco(LABEL, 0.9, 0.38, G(s * 0.605, 0.05, -0.3).toArray(), [s, 0, 0], pitch, upv.toArray());
    deco(HAZARD, 0.9, 0.16, G(s * 0.605, -0.33, -0.3).toArray(), [s, 0, 0], pitch, upv.toArray());
  }
  // rails
  for (const s of [1, -1]) {
    gbox(0.26, 0.46, 6.3, STEEL, s * 0.33, 0, 4.0);
    gbox(0.12, 0.2, 6.0, LSTEEL, s * 0.52, 0, 4.0);
    for (let i = 0; i < 10; i++) gbox(0.08, 0.34, 0.12, DARK, s * 0.46, 0, 1.2 + i * 0.6); // rail ribs
  }
  glow(gbox(0.3, 0.14, 6.1, CYAN, 0, 0.02, 4.0), 1.6);
  for (const wd of [1.3, 2.5, 3.7, 4.9, 6.1]) {
    gbox(1.2, 0.1, 0.2, DARK, 0, 0.3, wd);
    gbox(1.2, 0.1, 0.2, DARK, 0, -0.3, wd);
    for (const s of [1, -1]) {
      gbox(0.1, 0.7, 0.2, DARK, s * 0.62, 0, wd);
      gcyl(0.03, 0.14, BRASS, s * 0.62, 0.34, wd, 6);
    }
    glow(gbox(0.5, 0.04, 0.08, CYAN, 0, 0.36, wd), 1.2);
  }
  // capacitor drums
  for (const s of [1, -1])
    for (const wd of [1.5, 2.45, 3.4]) {
      gcyl(0.17, 0.75, STEEL, s * 0.82, -0.12, wd, 10);
      glow(gring(0.17, 0.025, CYAN, s * 0.82, -0.12, wd + 0.38), 1.4);
      glow(gring(0.17, 0.025, CYAN, s * 0.82, -0.12, wd - 0.38), 1.4);
      gring(0.18, 0.03, BRASS, s * 0.82, -0.12, wd);
      b.rod(G(s * 0.82, -0.05, wd + 0.42), G(s * 0.62, 0.1, wd + 0.5), 0.025, DARK, { bone: pitch, sides: 5 });
    }
  // muzzle
  gbox(1.0, 0.75, 0.5, DARK, 0, 0, 7.25);
  gbox(1.1, 0.12, 0.7, HULL, 0, 0.42, 7.2);
  glow(gbox(0.3, 0.12, 0.04, CYAN, 0, 0, 7.52), 1.8);
  for (const s of [1, -1]) {
    gbox(0.08, 0.5, 0.35, STEEL, s * 0.54, 0, 7.25);
    for (let i = 0; i < 3; i++) gbox(0.05, 0.08, 0.3, LSTEEL, s * 0.58, -0.2 + i * 0.2, 7.25);
  }
  // recoil buffers under breech
  for (const s of [1, -1]) {
    gcyl(0.1, 2.0, LSTEEL, s * 0.45, -0.62, 0.3, 8);
    gcyl(0.07, 1.4, BRASS, s * 0.45, -0.62, 1.6, 6);
  }
  // top optic
  gbox(0.4, 0.3, 0.8, DARK, 0.2, 0.7, 1.0);
  b.part(cyl(0.1, 0.12, 8), GLASS, { bone: pitch, at: G(0.2, 0.75, 1.45), dir: fwd, flat: true });
  glow(b.part(cyl(0.07, 0.03, 8), CYAN, { bone: pitch, at: G(0.2, 0.75, 1.52), dir: fwd, flat: true }), 1.4);
  // elevation rams
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(s * 0.8, 2.6, -2.2);
    const top = G(s * 0.8, -0.6, -0.5);
    const mid = base.clone().lerp(top, 0.55);
    b.rod(base, mid, 0.1, STEEL, { bone: yaw, sides: 8 });
    b.rod(mid, top, 0.06, LSTEEL, { bone: pitch, sides: 8 });
    b.part(new THREE.SphereGeometry(0.12, 6, 4), BRASS, { bone: yaw, at: base, flat: true });
  }

  // ================================================================== stabiliser legs
  const legZ = [0.3, -3.9];
  legZ.forEach((z, zi) => {
    for (const s of [1, -1]) {
      const id = `${s > 0 ? "L" : "R"}${zi + 1}`;
      const arm = b.joint(`outrigger${id}`, { parent: chassis, at: [s * 1.3, 1.15, z], dir: [s, 0, 0], role: "leg" });
      const jack = b.joint(`jack${id}`, { parent: arm, at: [s * 2.35, 1.15, z], dir: [0, -1, 0], role: "leg" });
      bx(arm, 1.3, 0.36, 0.5, HULL, s * 1.85, 1.15, z); // beam
      bx(arm, 1.3, 0.08, 0.58, DARK, s * 1.85, 1.35, z);
      b.rod([s * 1.5, 0.95, z], [s * 2.2, 1.0, z], 0.05, STEEL, { bone: arm, sides: 6 });
      b.rod([s * 1.45, 1.55, z + 0.2], [s * 2.2, 1.3, z + 0.2], 0.04, LSTEEL, { bone: arm, sides: 6 }); // brace
      deco(HAZARD, 1.0, 0.2, [s * 1.85, 1.15, z + 0.26], Z, arm);
      deco(HAZARD, 1.0, 0.2, [s * 1.85, 1.15, z - 0.26], [0, 0, -1], arm);
      // hydraulic cylinder
      cy(arm, 0.16, 0.65, STEEL, [s * 2.35, 1.0, z], Y, 10);
      cy(arm, 0.19, 0.08, BRASS, [s * 2.35, 1.33, z], Y, 10);
      cy(arm, 0.19, 0.08, BRASS, [s * 2.35, 0.7, z], Y, 10);
      cy(jack, 0.09, 0.7, LSTEEL, [s * 2.35, 0.5, z], Y, 8); // piston
      b.part(new THREE.SphereGeometry(0.17, 7, 5), DARK, { bone: jack, at: [s * 2.35, 0.2, z], flat: true });
      cy(jack, 0.5, 0.12, STEEL, [s * 2.35, 0.06, z], Y, 8); // pad
      cy(jack, 0.42, 0.04, DARK, [s * 2.35, 0.14, z], Y, 8);
      const ribs = new Merger();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        ribs.add(box(0.06, 0.14, 0.28), [s * 2.35 + 0.28 * Math.cos(a), 0.2, z + 0.28 * Math.sin(a)], new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a));
      }
      ribs.commit(DARK, jack);
      glow(bx(arm, 0.14, 0.12, 0.1, AMBER, s * 2.55, 1.35, z), 1.4); // lamp
      // locking pin & chain
      b.rod([s * 2.5, 0.9, z], [s * 2.5, 0.6, z + 0.2], 0.012, STEEL, { bone: arm, sides: 4 });
    }
  });
  // rear spade
  b.extrude(
    [
      [-1.1, 0],
      [1.1, 0],
      [0.9, 0.95],
      [-0.9, 0.95],
    ],
    { at: [0, 0, -5.45], x: X, y: [0, 1, 0.45], thickness: 0.12, bevel: 0.03, color: STEEL, bone: chassis },
  );
  for (const x of [-0.6, 0, 0.6]) bx(chassis, 0.1, 0.8, 0.1, DARK, x, 0.5, -5.35, { rotation: [-24, 0, 0] });
  b.rod([-0.5, 1.15, -5.1], [-0.5, 0.5, -5.55], 0.05, LSTEEL, { bone: chassis, sides: 6 });
  b.rod([0.5, 1.15, -5.1], [0.5, 0.5, -5.55], 0.05, LSTEEL, { bone: chassis, sides: 6 });
  bx(chassis, 0.5, 0.2, 0.04, AMBER, 0, 0.55, -5.58, { rotation: [-24, 0, 0] });

  return b.root;
}
```