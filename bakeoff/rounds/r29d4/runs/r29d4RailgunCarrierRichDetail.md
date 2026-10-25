```ts
import * as THREE from "three";
import { createBuilder, svg, paint, mottle, countershade, stripes } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description: "Low-poly sci-fi 6x6 railgun carrier with deployed stabiliser legs, capacitor rings and glowing rails.",
};

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const OLIVE = panelled(mottle("#56653f", "#47552f", { size: 0.6, seed: 4 }), { size: 0.9, rivets: 0.12 });
  const DARK = "#23272a", STEEL = metal("steel"), IRON = metal("iron");
  const TIRE = "#17181a", YEL = "#e0b020", RED = "#b02a22", BLUE = "#59d4ff";

  const box = (sx: number, sy: number, sz: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), c, { at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as any, dir: dir as any });

  // ---- textures
  const WINDOW = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="4" fill="#14303c"/>
    <path d="M0 32 L20 0 L30 0 L10 32Z M36 32 L50 0 L54 0 L40 32Z" fill="#3f8aa5" opacity=".5"/>
    <rect x="1" y="1" width="62" height="30" rx="4" fill="none" stroke="#0a0f12" stroke-width="2"/></svg>`, { size: 128 });
  const EMBLEM = svg(`<svg viewBox="0 0 96 48"><rect x="2" y="2" width="92" height="44" rx="4" fill="none" stroke="#e9e4d0" stroke-width="3"/>
    <text x="48" y="33" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e9e4d0" stroke="#111" stroke-width="1">RG-6</text></svg>`, { size: 192 });
  const STAR = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1c2216" stroke="#e9e4d0" stroke-width="3"/>
    <path d="M32 10 L38 26 L55 26 L41 36 L46 53 L32 43 L18 53 L23 36 L9 26 L26 26Z" fill="#e9e4d0"/></svg>`, { size: 128 });
  const WARN = svg(`<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#e0b020"/><path d="M32 6 L58 42 H6Z" fill="none" stroke="#111" stroke-width="4"/>
    <path d="M30 18 h4 l-1 14 h-2Z" fill="#111"/><circle cx="32" cy="37" r="2" fill="#111"/></svg>`, { size: 128 });
  const HAZARD = stripes(YEL, "#16171a", { size: 0.14, axis: [0, 1, 1], width: 0.5, wobble: 0 });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], c = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), c, { at: at as any, dir: dir as any, axis: "z", texture: tex });

  // ---- hull (side profile extruded across the width)
  b.extrude(
    [[-4.5, 0.85], [3.9, 0.85], [4.6, 1.3], [4.1, 1.9], [2.0, 2.0], [-4.5, 2.0]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, bevel: 0.06, color: OLIVE },
  );
  // sub-frame, skirts and bumper
  box(2.0, 0.3, 8.6, IRON, 0, 0.8, 0);
  box(2.9, 0.25, 0.35, HAZARD, 0, 1.0, 4.55);
  box(2.9, 0.25, 0.3, HAZARD, 0, 1.0, -4.6);
  // deck plate and hatches
  box(2.3, 0.08, 4.2, DARK, 0, 2.04, -2.0);
  for (const s of [1, -1]) {
    box(0.5, 0.06, 0.5, STEEL, s * 0.8, 2.1, -3.6);
    cyl(0.07, 0.07, 0.12, 6, YEL, [s * 1.0, 2.1, 1.6], [0, 1, 0]);
    cyl(0.03, 0.03, 1.2, 5, DARK, [s * 1.1, 2.7, -3.9], [0, 1, 0]); // antenna
  }
  // ---- cab
  box(2.4, 0.9, 1.9, OLIVE, 0, 2.45, 2.9);
  box(2.2, 0.12, 1.7, DARK, 0, 2.95, 2.9);
  decal(WINDOW, 2.0, 0.6, [0, 2.55, 3.86], [0, 0.0, 1]);
  for (const s of [1, -1]) {
    decal(WINDOW, 1.1, 0.5, [s * 1.21, 2.6, 2.7], [s, 0, 0]);
    decal(STAR, 0.7, 0.7, [s * 1.31, 1.45, 2.2], [s, 0, 0]);
    decal(EMBLEM, 1.4, 0.7, [s * 1.31, 1.55, -0.6], [s, 0, 0]);
    decal(WARN, 0.5, 0.38, [s * 1.31, 1.25, -2.4], [s, 0, 0]);
    // headlights / tail lights
    glow(box(0.4, 0.2, 0.08, "#fff2b0", s * 0.9, 1.35, 4.66), 1.4);
    glow(box(0.35, 0.18, 0.08, "#ff3a2a", s * 1.0, 1.4, -4.53), 1.2);
    // mirrors
    box(0.1, 0.35, 0.08, DARK, s * 1.4, 2.7, 3.6);
    // side stowage + ladder rungs
    box(0.25, 0.4, 1.2, DARK, s * 1.42, 1.6, 1.0);
    for (let i = 0; i < 4; i++) box(0.06, 0.04, 0.4, STEEL, s * 1.4, 1.3 + i * 0.22, -3.0);
    // exhaust stacks
    cyl(0.09, 0.09, 1.1, 6, IRON, [s * 1.1, 2.55, 2.0 - 0 + -0.6 - 1.6 + 1.2], [0, 1, 0]);
  }
  b.part(new THREE.SphereGeometry(0.28, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0.6, 3.0, 3.3] }); // sensor dome
  box(0.4, 0.06, 0.4, DARK, -0.6, 3.04, 3.3);
  // fenders and mud flaps
  for (const s of [1, -1])
    for (const z of [2.8, 0, -2.8]) {
      box(0.78, 0.1, 1.6, OLIVE, s * 1.65, 1.3, z);
      box(0.7, 0.4, 0.06, TIRE, s * 1.65, 0.85, z - 0.85);
    }

  // ---- wheels
  const wheel = (s: number, zc: number) => {
    const xc = s * 1.55;
    cyl(0.6, 0.6, 0.5, 12, TIRE, [xc, 0.6, zc], [1, 0, 0]);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.13;
      box(0.52, 0.12, 0.2, "#101113", xc, 0.6 + Math.cos(a) * 0.62, zc + Math.sin(a) * 0.62, { rotation: [(-a * 180) / Math.PI + 90 - 90, 0, 0] });
    }
    cyl(0.36, 0.36, 0.54, 10, STEEL, [xc, 0.6, zc], [1, 0, 0]);
    cyl(0.22, 0.22, 0.6, 8, IRON, [xc, 0.6, zc], [1, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.035, 0.035, 0.66, 6, "#c8ccd2", [xc, 0.6 + Math.cos(a) * 0.29, zc + Math.sin(a) * 0.29], [1, 0, 0]);
    }
    cyl(0.07, 0.07, 0.7, 6, YEL, [xc, 0.6, zc], [1, 0, 0]);
  };
  for (const s of [1, -1]) for (const z of [2.8, 0, -2.8]) wheel(s, z);
  for (const z of [2.8, 0, -2.8]) cyl(0.12, 0.12, 3.2, 8, IRON, [0, 0.6, z], [1, 0, 0]); // axles

  // ---- stabiliser legs
  for (const s of [1, -1])
    for (const z of [1.45, -1.45]) {
      box(1.5, 0.28, 0.4, HAZARD, s * 2.0, 1.15, z); // outrigger beam
      box(0.4, 0.4, 0.5, IRON, s * 1.35, 1.15, z);
      b.rod(V(s * 2.7, 1.3, z), V(s * 2.9, 0.15, z), 0.13, YEL);
      b.rod(V(s * 2.78, 0.7, z), V(s * 2.9, 0.15, z), 0.07, STEEL);
      cyl(0.5, 0.55, 0.14, 8, DARK, [s * 2.9, 0.07, z], [0, 1, 0]);
      cyl(0.3, 0.3, 0.08, 8, IRON, [s * 2.9, 0.17, z], [0, 1, 0]);
      b.rod(V(s * 1.7, 0.95, z), V(s * 2.8, 0.65, z), 0.05, STEEL); // brace
      box(0.1, 0.1, 0.1, RED, s * 2.9, 0.9, z + 0.14);
    }

  // ---- turret + railgun
  cyl(1.15, 1.25, 0.2, 12, IRON, [0, 2.15, -1.4], [0, 1, 0]);
  box(2.0, 1.0, 2.6, OLIVE, 0, 2.75, -1.4);
  box(1.6, 0.14, 2.2, DARK, 0, 3.32, -1.4);
  for (const s of [1, -1]) {
    decal(STAR, 0.6, 0.6, [s * 1.01, 2.8, -1.8], [s, 0, 0]);
    box(0.12, 0.6, 1.4, IRON, s * 1.05, 2.7, -0.6);
  }
  const D = V(0, 0.3, 1).normalize();
  const U = V(0, D.z, -D.y);
  const P = V(0, 3.55, -1.2);
  const pt = (t: number, dx = 0, du = 0) => P.clone().addScaledVector(D, t).addScaledVector(U, du).add(V(dx, 0, 0));
  for (const s of [1, -1]) {
    b.frustumBox(pt(-1.2, s * 0.24), pt(7.6, s * 0.24), [0.22, 0.3], [0.2, 0.26], { color: STEEL });
    b.rod(pt(-0.5, s * 0.24, 0.22), pt(7.2, s * 0.24, 0.22), 0.025, "#9fb0c8"); // rail top inlay
    box(0.16, 0.8, 0.5, IRON, s * 0.9, 3.5, -1.6, { dir: D.toArray(), axis: "z" }); // cradle plates
  }
  glow(b.frustumBox(pt(-0.8), pt(7.4), [0.2, 0.16], [0.14, 0.12], { color: BLUE }), 1.6);
  for (let t = 0.4; t < 7; t += 0.95) {
    const c = pt(t);
    b.part(new THREE.TorusGeometry(0.42, 0.06, 5, 10), YEL, { at: c, dir: D.toArray(), axis: "z", scale: [1.1, 0.8, 1] });
    box(0.12, 0.12, 0.12, DARK, c.x + 0.55, c.y - 0.12, c.z, { dir: D.toArray(), axis: "z" });
    box(0.12, 0.12, 0.12, DARK, c.x - 0.55, c.y - 0.12, c.z, { dir: D.toArray(), axis: "z" });
  }
  // muzzle
  const M = pt(7.6);
  box(0.9, 0.4, 0.6, IRON, M.x, M.y, M.z, { dir: D.toArray(), axis: "z" });
  glow(box(0.5, 0.1, 0.1, BLUE, M.x, M.y, M.z + 0.3, { dir: D.toArray(), axis: "z" }), 2);
  // breech block with capacitor bank
  const B = pt(-1.5);
  box(1.0, 0.7, 0.9, IRON, B.x, B.y, B.z, { dir: D.toArray(), axis: "z" });
  for (const s of [1, -1]) {
    cyl(0.18, 0.18, 1.1, 8, DARK, [s * 0.75, 3.75, -2.6], [0, 0, 1]);
    glow(cyl(0.12, 0.12, 0.2, 6, BLUE, [s * 0.75, 3.75, -2.0], [0, 0, 1]), 1.5);
  }
  // cabling from turret to hull
  b.sweep([[0.6, 3.3, -2.6], [1.1, 2.5, -3.3], [0.9, 2.1, -3.6]], 0.05, { color: DARK });
  // warning label on turret rear
  decal(WARN, 0.6, 0.45, [0, 2.8, -2.71], [0, 0, -1]);

  return b.root;
}
```