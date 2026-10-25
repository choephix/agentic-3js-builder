```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { mottle, paint, mix, noise, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup truck converted to ducted-fan hover thrusters, low-poly cyberpunk.",
};

const CY = "#25f2ff";
const MG = "#ff2fd0";
const AMB = "#ffb02e";
const DARK = "#14161d";
const NAVY = "#0b2433";

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c200"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#15151a"/>`)
    .join("")}<rect width="64" height="16" fill="none" stroke="#15151a" stroke-width="2"/></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 96 32"><rect x="1" y="1" width="94" height="30" rx="4" fill="#0a0d14" stroke="#25f2ff" stroke-width="2"/>
  <text x="48" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#25f2ff">HV-07</text>
  <rect x="6" y="5" width="12" height="3" fill="#ff2fd0"/><rect x="78" y="5" width="12" height="3" fill="#ff2fd0"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="#10131c" stroke="#ff2fd0" stroke-width="3"/>
  <polygon points="36,10 20,36 30,36 26,54 44,26 33,26" fill="#25f2ff" stroke="#05080d" stroke-width="1.5"/>
  <polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="none" stroke="#25f2ff" stroke-width="1" transform="translate(32 32) scale(0.82) translate(-32 -32)"/></svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 48 32"><rect width="48" height="32" fill="#04130d"/>${[0, 1, 2, 3, 4, 5]
    .map((i) => `<rect x="4" y="${4 + i * 4.5}" width="${10 + ((i * 17) % 28)}" height="2.2" fill="#3dff8a"/>`)
    .join("")}<circle cx="38" cy="8" r="4" fill="none" stroke="#3dff8a" stroke-width="1.2"/><path d="M38 8 L41 5" stroke="#3dff8a" stroke-width="1.2"/></svg>`,
  { size: 128 },
);
const SLITS = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#0a0b10"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((i) => `<rect x="${3 + i * 6}" y="3" width="3" height="10" fill="#25f2ff"/>`)
    .join("")}</svg>`,
  { size: 128 },
);

const CAMO = mottle("#3b4636", "#262e2a", { size: 0.5, contrast: 1.5, seed: 3 });
const HULL = panelled(CAMO, { size: 0.55, aspect: 0.6, rivets: 0.07 });
const GRIME = paint((p, n) => {
  const base = mix("#2f3a32", "#222a26", noise(p, 0.4, 5));
  return mix(base, "#0d0f12", smoothstep(0.7, 0.2, p.y) * 0.5 * (1 - Math.max(n.y, 0)));
});
const IRON = metal("iron", { tarnish: 0.6 });
const STEEL = metal("steel", { tarnish: 0.5 });
const GILT = metal("gilt");

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rot as any });
  const gbox = (w: number, h: number, d: number, color: string, at: number[], s = 1.3) =>
    glow(box(w, h, d, color, at), s);
  const cyl = (rt: number, rb: number, h: number, sides: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color, { at: at as any, rotation: rot as any });
  const decal = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: at as any, dir: dir as any, axis: "z", up: up as any, texture: tex });

  // ---- main hull (side profile extrudes, z along x of drawing)
  b.extrude(
    [[-2.7, 0.5], [2.6, 0.5], [2.8, 0.85], [2.55, 1.2], [-2.7, 1.2]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, bevel: 0.05, color: HULL },
  );
  b.extrude(
    [[-0.8, 1.2], [0.95, 1.2], [0.35, 1.9], [-0.65, 1.9]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.85, bevel: 0.05, color: HULL },
  );
  // belly skid plate
  box(1.7, 0.1, 4.6, IRON, [0, 0.47, -0.1]);
  box(1.2, 0.06, 4.2, DARK, [0, 0.4, -0.1]);
  // roof
  box(1.7, 0.06, 1.05, GRIME, [0, 1.92, -0.15]);
  for (const s of [1, -1]) box(0.08, 0.05, 0.9, STEEL, [s * 0.6, 1.97, -0.15]);

  // ---- glass
  glow(decal(1.55, 0.8, svg(`<svg viewBox="0 0 8 4"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d3b52"/><stop offset="1" stop-color="#061620"/></linearGradient></defs><rect width="8" height="4" fill="url(#g)"/><path d="M0 4 L3 0 L4 0 L1 4Z" fill="#25f2ff" opacity="0.35"/></svg>`, { size: 128 }), [0, 1.56, 0.66], [0, 0.6, 0.7], [0, 1, 0]), 0.6);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.95, 0.42), NAVY, { at: [s * 0.935, 1.58, -0.06], dir: [s, 0, 0], axis: "z" }), 0.5);
    // window frame bars
    box(0.03, 0.04, 1.0, DARK, [s * 0.93, 1.81, -0.06]);
    box(0.03, 0.04, 1.0, DARK, [s * 0.93, 1.37, -0.06]);
    // door seam & handle
    box(0.02, 0.45, 0.02, DARK, [s * 0.935, 1.55, -0.56]);
    box(0.03, 0.04, 0.16, STEEL, [s * 0.94, 1.32, 0.3]);
    // side armor plate on door
    box(0.06, 0.2, 0.95, IRON, [s * 0.95, 1.27, -0.05]);
    // mirrors
    box(0.1, 0.16, 0.05, DARK, [s * 1.0, 1.55, 0.55]);
    b.rod([s * 0.93, 1.5, 0.5], [s * 1.0, 1.55, 0.55], 0.012, STEEL);
    // side stencil + neon
    decal(0.9, 0.3, PLATE, [s * 1.012, 0.88, 1.5], [s, 0, 0]);
    gbox(0.03, 0.04, 4.8, MG, [s * 1.01, 0.6, -0.05], 1.6);
    gbox(0.03, 0.03, 4.5, CY, [s * 0.5, 0.455, -0.05], 1.6);
    // fender flares over thruster arms
    box(0.1, 0.22, 1.1, IRON, [s * 1.03, 1.05, 1.75]);
    box(0.1, 0.22, 1.1, IRON, [s * 1.03, 1.05, -1.75]);
    // headlights & tail lights
    gbox(0.42, 0.13, 0.1, "#eaffff", [s * 0.7, 1.0, 2.7], 1.8);
    gbox(0.4, 0.1, 0.06, "#ff2a3a", [s * 0.75, 0.95, -2.7], 1.6);
    box(0.5, 0.05, 0.14, DARK, [s * 0.7, 1.1, 2.68]);
    // rear vector thrusters
    cyl(0.2, 0.24, 0.5, 10, IRON, [s * 0.6, 0.85, -2.85], [90, 0, 0]);
    cyl(0.26, 0.2, 0.1, 10, STEEL, [s * 0.6, 0.85, -3.1], [90, 0, 0]);
    glow(b.part(new THREE.CircleGeometry(0.17, 10), CY, { at: [s * 0.6, 0.85, -3.16], dir: [0, 0, -1], axis: "z" }), 2);
    // roof beacon bar halves
    gbox(0.5, 0.1, 0.18, s > 0 ? "#ff2a3a" : "#2a6bff", [s * 0.27, 2.01, 0.1], 1.8);
    // bumper lights
    gbox(0.1, 0.1, 0.05, AMB, [s * 0.95, 0.58, 2.8], 1.5);
    // bullbar
    b.rod([s * 0.6, 0.55, 2.88], [s * 0.6, 1.1, 2.88], 0.035, STEEL);
    b.rod([s * 0.6, 1.1, 2.88], [s * 0.45, 1.2, 2.72], 0.03, STEEL);
  }

  // ---- hood
  box(0.9, 0.12, 1.1, HULL, [0, 1.25, 1.7]); // scoop base
  box(0.7, 0.05, 0.8, DARK, [0, 1.32, 1.75]);
  decal(0.7, 0.7, EMBLEM, [0, 1.213, 2.1], [0, 1, 0], [0, 0, -1]);
  decal(0.55, 0.5, SLITS, [0, 1.332, 1.75], [0, 1, 0], [0, 0, -1]);
  glow(box(0.55, 0.02, 0.4, CY, [0, 1.333, 1.75]), 0);
  // grille & bumper
  b.part(new THREE.BoxGeometry(1.3, 0.26, 0.1), "#ffffff", { at: [0, 0.7, 2.72], texture: SLITS });
  b.part(new THREE.BoxGeometry(1.9, 0.18, 0.22), "#ffffff", { at: [0, 0.58, 2.68], texture: HAZARD });
  b.rod([-0.6, 1.1, 2.88], [0.6, 1.1, 2.88], 0.035, STEEL);
  b.rod([-0.6, 0.8, 2.88], [0.6, 0.8, 2.88], 0.03, STEEL);
  gbox(0.6, 0.03, 0.03, CY, [0, 0.9, 2.76], 1.5);
  // winch
  cyl(0.07, 0.07, 0.3, 8, IRON, [0, 0.55, 2.82], [0, 0, 90]);

  // ---- bed
  for (const s of [1, -1]) {
    box(0.1, 0.5, 1.9, HULL, [s * 0.95, 1.45, -1.75]);
    box(0.14, 0.06, 1.9, STEEL, [s * 0.95, 1.72, -1.75]);
    // tie-down ribs
    for (let i = 0; i < 4; i++) box(0.04, 0.4, 0.06, IRON, [s * 1.0, 1.45, -1.05 - i * 0.55]);
    // rocket pod
    box(0.38, 0.42, 1.05, IRON, [s * 0.75, 1.95, -1.95]);
    box(0.4, 0.06, 1.0, AMB, [s * 0.75, 2.18, -1.95]);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const x = s * 0.75 - 0.11 + c * 0.11;
        cyl(0.04, 0.04, 0.06, 8, "#07080b", [x, 1.88 + r * 0.17, -1.42], [90, 0, 0]);
        cyl(0.02, 0.02, 0.07, 6, "#c33", [x, 1.88 + r * 0.17, -1.4], [90, 0, 0]);
      }
    // pod mounts
    box(0.3, 0.2, 0.15, STEEL, [s * 0.75, 1.76, -1.9]);
  }
  box(1.9, 0.5, 0.1, HULL, [0, 1.45, -2.65]);
  box(1.9, 0.06, 0.14, STEEL, [0, 1.72, -2.65]);
  gbox(0.5, 0.04, 0.02, MG, [0, 1.45, -2.71], 1.5);
  box(1.8, 0.08, 1.9, DARK, [0, 1.22, -1.75]);
  // roll bar
  b.rod([-0.85, 1.25, -0.85], [-0.85, 2.1, -0.85], 0.04, STEEL);
  b.rod([0.85, 1.25, -0.85], [0.85, 2.1, -0.85], 0.04, STEEL);
  b.rod([-0.85, 2.1, -0.85], [0.85, 2.1, -0.85], 0.04, STEEL);
  b.rod([-0.85, 1.8, -0.85], [0.85, 2.1, -0.85], 0.025, STEEL);

  // ---- turret
  cyl(0.45, 0.5, 0.1, 12, IRON, [0, 1.31, -1.65]);
  cyl(0.38, 0.38, 0.02, 12, MG, [0, 1.37, -1.65]);
  glow(cyl(0.4, 0.4, 0.015, 12, MG, [0, 1.362, -1.65]), 1.4);
  cyl(0.14, 0.18, 0.5, 8, STEEL, [0, 1.65, -1.65]);
  box(0.5, 0.28, 0.6, HULL, [0, 1.98, -1.65]);
  box(0.46, 0.06, 0.5, IRON, [0, 2.15, -1.7]);
  for (const s of [1, -1]) {
    cyl(0.04, 0.04, 1.0, 8, DARK, [s * 0.14, 1.98, -1.1], [90, 0, 0]);
    cyl(0.06, 0.06, 0.2, 8, STEEL, [s * 0.14, 1.98, -0.62], [90, 0, 0]);
    box(0.06, 0.12, 0.3, IRON, [s * 0.28, 1.98, -1.4]);
    gbox(0.03, 0.03, 0.03, CY, [s * 0.14, 1.98, -0.52], 2);
  }
  // shield plate
  b.extrude([[-0.4, 0], [0.4, 0], [0.34, 0.45], [-0.34, 0.45]], { at: [0, 1.82, -1.4], x: [1, 0, 0], thickness: 0.05, bevel: 0.01, color: IRON });
  decal(0.3, 0.3, EMBLEM, [0, 2.0, -1.37], [0, 0, 1]);
  // sensor ball on turret
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), AMB, { at: [0.2, 2.2, -1.75] }), 2);

  // ---- bed cargo
  box(0.55, 0.4, 0.5, "#4a4f3a", [-0.55, 1.46, -2.3]);
  box(0.58, 0.04, 0.53, IRON, [-0.55, 1.67, -2.3]);
  b.part(new THREE.PlaneGeometry(0.28, 0.2), "#ffffff", { at: [-0.55, 1.5, -2.04], dir: [0, 0, 1], axis: "z", texture: SCREEN });
  glow(b.part(new THREE.PlaneGeometry(0.28, 0.2), "#ffffff", { at: [-0.55, 1.5, -2.045], dir: [0, 0, 1], axis: "z", texture: SCREEN }), 1.2);
  for (let i = 0; i < 2; i++) {
    cyl(0.14, 0.14, 0.4, 8, "#7a2a22", [0.55 + i * 0.3, 1.46, -2.3]);
    cyl(0.1, 0.1, 0.03, 8, STEEL, [0.55 + i * 0.3, 1.67, -2.3]);
    box(0.2, 0.02, 0.02, AMB, [0.55 + i * 0.3, 1.5, -2.16]);
  }

  // ---- antennas
  b.rod([0.8, 1.95, -0.6], [0.8, 3.0, -0.75], 0.012, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), "#ff2a3a", { at: [0.8, 3.0, -0.75] }), 2);
  b.rod([-0.75, 1.95, -0.6], [-0.75, 2.6, -0.75], 0.012, STEEL);
  // radar dish
  b.lathe([[0, 0], [0.25, 0.1], [0.22, 0.12], [0, 0.03]], { at: [-0.4, 2.0, 0.35], axis: [0, 0.7, 0.7], color: STEEL, segments: 10 });
  cyl(0.03, 0.03, 0.12, 6, IRON, [-0.4, 1.97, 0.35]);

  // ---- hover pods
  const podTop = 0.6;
  for (const sx of [1, -1])
    for (const z of [1.75, -1.75]) {
      const x = sx * 1.55;
      b.lathe([[0.5, 0], [0.64, 0], [0.62, 0.55], [0.52, 0.58]], { at: [x, 0, z], axis: [0, 1, 0], color: HULL, segments: 12 });
      cyl(0.5, 0.5, 0.02, 12, DARK, [x, 0.3, z]);
      glow(b.part(new THREE.CircleGeometry(0.47, 12), CY, { at: [x, 0.05, z], dir: [0, -1, 0], axis: "z" }), 1.6);
      glow(cyl(0.64, 0.64, 0.035, 12, CY, [x, 0.12, z]), 1.8);
      // hub and fan
      cyl(0.09, 0.09, 0.14, 8, GILT, [x, 0.34, z]);
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        b.part(new THREE.BoxGeometry(0.3, 0.015, 0.09), STEEL, {
          at: [x + Math.cos(a) * 0.26, 0.34, z + Math.sin(a) * 0.26],
          rotation: [0, (-a * 180) / Math.PI, 20],
        });
      }
      // struts across the intake
      box(1.1, 0.03, 0.04, IRON, [x, 0.53, z]);
      box(0.04, 0.03, 1.1, IRON, [x, 0.53, z]);
      // bolts
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        cyl(0.02, 0.02, 0.03, 6, GILT, [x + Math.cos(a) * 0.58, 0.58, z + Math.sin(a) * 0.58]);
      }
      // mount arm
      box(Math.abs(x) - 0.9, 0.2, 0.3, IRON, [sx * ((Math.abs(x) + 0.9) / 2), 0.45, z]);
      b.rod([sx * 1.0, 0.75, z], [x, 0.62, z], 0.04, STEEL);
      gbox(0.04, 0.05, 0.18, AMB, [sx * 1.22, 0.58, z], 1.4);
    }

  // ---- underbody glow plate and ground lights
  gbox(1.0, 0.02, 3.0, CY, [0, 0.385, -0.1], 0.9);

  // ---- billboard-like roof sign
  b.part(new THREE.BoxGeometry(0.5, 0.18, 0.04), "#ffffff", { at: [0, 2.12, 0.27], texture: PLATE });
  glow(b.part(new THREE.PlaneGeometry(0.46, 0.15), "#ffffff", { at: [0, 2.12, 0.295], dir: [0, 0, 1], axis: "z", texture: PLATE }), 1.2);

  return b.root;
}
```