import * as THREE from "three";
import { createBuilder, rng, paint, mix, smoothstep, noise, mottle, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Railgun Carrier RG-6",
  description:
    "Six-wheeled heavy railgun carrier, camouflaged and mud-splashed, with four hydraulic stabiliser legs planted on hazard-striped pads and a glowing elevated twin-rail cannon.",
};

// ---------------------------------------------------------------- palette
const OLIVE = "#56613c";
const OLIVE_D = "#3a4429";
const TAN = "#8a7d52";
const DARK = "#23262b";
const DARKER = "#15171a";
const ORANGE = "#e0861c";
const CYAN = "#52ecff";
const RED = "#ff3b2e";
const AMBER = "#ffb23a";
const MUD = "#4a3b28";
const RUBBER = "#1b1c1f";
const CHROME = "#b9c2cc";

// ---------------------------------------------------------------- textures
const stripeLines = (() => {
  let s = "";
  for (let c = -32; c <= 160; c += 32) s += `M${c} 0 L${c - 64} 64 `;
  return s;
})();
const HAZARD = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f2b705"/><path d="${stripeLines}" stroke="#161616" stroke-width="15" fill="none"/></svg>`,
  { size: 128 },
);
const VISOR = svg(
  `<svg viewBox="0 0 64 32"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a8fa0"/><stop offset="1" stop-color="#0d2630"/></linearGradient></defs>
  <rect width="64" height="32" fill="url(#g)" stroke="#0a0c0e" stroke-width="3"/>
  <path d="M6 30 L22 2 L28 2 L12 30Z M34 30 L50 2 L54 2 L38 30Z" fill="#ffffff" opacity="0.22"/>
  <path d="M32 0 V32" stroke="#0a0c0e" stroke-width="2.5"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1a2418" stroke="#e8e2c8" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#e0861c" stroke-width="3"/>
  <path d="M18 40 H82 M18 60 H82" stroke="#e8e2c8" stroke-width="6" stroke-linecap="round"/>
  <path d="M56 14 L36 52 H50 L42 86 L68 44 H53Z" fill="#52ecff" stroke="#10222a" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);
const DOORNUM = svg(
  `<svg viewBox="0 0 90 40"><rect x="2" y="2" width="86" height="36" rx="3" fill="none" stroke="#e8e2c8" stroke-width="2" stroke-dasharray="8 3"/>
  <text x="45" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e8e2c8">RG-06</text></svg>`,
  { size: 256 },
);
const VENT = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#16181b" stroke="#6a7078" stroke-width="3"/>
  ${[5, 10, 15, 20, 25].map((y) => `<rect x="5" y="${y}" width="54" height="2.6" fill="#3d434b"/>`).join("")}</svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#04161a" stroke="#6a7078" stroke-width="3"/>
  <g stroke="#1a8a96" stroke-width="0.6">${[10, 20, 30, 40, 50, 60, 70].map((x) => `<path d="M${x} 2 V38"/>`).join("")}${[10, 20, 30].map((y) => `<path d="M2 ${y} H78"/>`).join("")}</g>
  <path d="M4 30 L16 24 L26 28 L38 12 L50 20 L60 8 L76 14" stroke="#52ecff" stroke-width="2" fill="none"/>
  <circle cx="60" cy="8" r="3" fill="none" stroke="#ff3b2e" stroke-width="1.5"/><path d="M60 0 V16 M52 8 H68" stroke="#ff3b2e" stroke-width="0.8"/></svg>`,
  { size: 256 },
);
const HVLABEL = svg(
  `<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#f2b705" stroke="#161616" stroke-width="3"/>
  <path d="M30 6 L48 34 H12Z" fill="none" stroke="#161616" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 12 L25 25 H31 L28 31 L37 20 H31Z" fill="#161616"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- paints
const camo = mottle(OLIVE, OLIVE_D, { size: 0.9, contrast: 1.4, seed: 3 });
const camo2 = mottle(camo, TAN, { size: 1.6, contrast: 2.5, seed: 8 });
const HULL = paint((p, n) => {
  const c = camo2.at(p, n);
  const mud = smoothstep(1.4, 0.85, p.y) * (0.45 + 0.55 * noise(p, 0.35, 9));
  const r = mix(c, MUD, Math.min(mud * 0.85, 0.85));
  return mix(r, "#c3cc92", smoothstep(0.6, 1, n.y) * 0.1);
});
const STEEL = paint((p, n) =>
  mix("#555c66", "#a3acb8", smoothstep(-0.3, 0.9, n.y) * 0.75 + 0.25 * noise(p, 0.3, 2)),
);
const TIRE = paint((p, n) => mix(RUBBER, MUD, smoothstep(0.7, 0.05, p.y) * noise(p, 0.2, 4) * 0.8 + 0 * n.y));

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const cyl = (r: number, h: number, seg: number, color: any, at: number[], dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir });
  const plane = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

  // ---- hull
  const hullOutline: [number, number][] = [
    [-4.4, 0.9], [4.4, 0.9], [4.7, 1.25], [4.2, 1.8], [-4.3, 1.8], [-4.4, 1.6],
  ];
  b.extrude(hullOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.8, bevel: 0.05, color: HULL });
  // side trim and skid
  for (const s of [1, -1]) {
    box(0.07, 0.12, 8.6, DARK, [s * 1.42, 1.72, 0]);
    box(0.07, 0.1, 8.6, DARK, [s * 1.42, 1.0, 0]);
    for (let i = 0; i < 16; i++) {
      const z = -4.0 + i * 0.53;
      b.part(new THREE.SphereGeometry(0.035, 5, 4), CHROME, { at: [s * 1.46, 1.72, z] });
    }
  }
  box(2.6, 0.12, 8.2, DARKER, [0, 0.86, 0]);
  // front glacis details
  plane(VENT, 1.6, 0.55, [0, 1.54, 4.465], [0, 0.67, 0.74]);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.34, 0.22, 0.12), AMBER, { at: [s * 1.08, 1.53, 4.44], dir: [0, 0.67, 0.74], axis: "z" }), 1.6);
    box(0.5, 0.12, 0.08, DARK, [s * 1.08, 1.53, 4.4], { dir: [0, 0.67, 0.74], axis: "z" });
    // tow hooks
    box(0.12, 0.1, 0.35, ORANGE, [s * 0.7, 1.0, 4.6]);
    // tail lights
    glow(box(0.38, 0.2, 0.08, RED, [s * 1.0, 1.4, -4.45]), 1.4);
  }
  box(2.8, 0.28, 0.18, DARK, [0, 1.05, 4.66]);
  box(2.8, 0.26, 0.2, DARK, [0, 1.0, -4.5]);
  plane(HAZARD, 2.6, 0.2, [0, 1.0, -4.605], [0, 0, -1]);

  // ---- cab
  const cabOutline: [number, number][] = [
    [2.3, 1.8], [4.3, 1.8], [4.3, 2.2], [3.6, 2.75], [2.5, 2.75], [2.3, 2.5],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.04, color: HULL });
  plane(VISOR, 1.95, 0.8, [0, 2.49, 3.96], [0, 0.62, 0.78]);
  box(2.0, 0.08, 0.2, DARK, [0, 2.2, 4.34]);
  for (const s of [1, -1]) {
    plane(VISOR, 1.1, 0.5, [s * 1.112, 2.4, 3.15], [s, 0, 0]);
    plane(DOORNUM, 0.95, 0.42, [s * 1.112, 2.0, 3.15], [s, 0, 0]);
    box(0.06, 0.1, 0.3, CHROME, [s * 1.13, 2.15, 2.65]); // door handle
    // mirror
    box(0.1, 0.4, 0.22, DARK, [s * 1.3, 2.45, 3.75]);
    b.rod([s * 1.1, 2.4, 3.75], [s * 1.28, 2.45, 3.75], 0.02, DARK);
    // exhaust stacks
    cyl(0.1, 1.1, 8, STEEL, [s * 1.2, 2.35, 2.0]);
    cyl(0.13, 0.08, 8, DARKER, [s * 1.2, 2.92, 2.0]);
    cyl(0.14, 0.2, 8, ORANGE, [s * 1.2, 1.95, 2.0]);
  }
  glow(box(1.2, 0.09, 0.2, AMBER, [0, 2.8, 3.0]), 1.4);
  box(1.3, 0.05, 0.28, DARK, [0, 2.76, 3.0]);
  // antenna + radar
  b.rod([0.9, 2.75, 2.5], [0.9, 4.1, 2.5], [0.025, 0.008], DARK);
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [0.9, 4.12, 2.5] }), 1.5);
  b.rod([-0.8, 2.75, 2.6], [-0.8, 3.35, 2.6], 0.04, DARK);
  b.lathe(
    [[0, 0], [0.3, 0.13], [0.3, 0.16], [0, 0.05]],
    { at: [-0.8, 3.4, 2.6], axis: [0, 0.35, 1], segments: 10, color: STEEL },
  );
  cyl(0.02, 0.3, 5, DARK, [-0.8, 3.52, 2.78], [0, 0.35, 1]);

  // ---- wheels
  const wheelZ = [3.3, 0, -3.3];
  for (const z of wheelZ) {
    b.rod([-1.5, 0.8, z], [1.5, 0.8, z], 0.14, DARK);
    b.part(new THREE.SphereGeometry(0.34, 8, 6), STEEL, { at: [0, 0.8, z] });
    for (const s of [1, -1]) {
      const xc = s * 1.85;
      cyl(0.8, 0.7, 12, TIRE, [xc, 0.8, z], [1, 0, 0]);
      // tread blocks
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        box(0.74, 0.1, 0.16, RUBBER, [xc, 0.8 + Math.cos(a) * 0.8, z + Math.sin(a) * 0.8], {
          rotation: [(-a * 180) / Math.PI + 90 - 90, 0, 0],
        });
      }
      cyl(0.58, 0.76, 12, STEEL, [xc, 0.8, z], [1, 0, 0]);
      cyl(0.27, 0.86, 8, ORANGE, [xc, 0.8, z], [1, 0, 0]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.045, 0.09, 6, CHROME, [s * 2.28, 0.8 + Math.cos(a) * 0.4, z + Math.sin(a) * 0.4], [1, 0, 0]);
      }
      // fender
      box(0.95, 0.1, 1.95, HULL, [xc, 1.7, z]);
      box(0.95, 0.35, 0.1, HULL, [xc, 1.55, z + 0.95], { rotation: [-25, 0, 0] });
      box(0.95, 0.35, 0.1, HULL, [xc, 1.55, z - 0.95], { rotation: [25, 0, 0] });
    }
  }

  // ---- stabiliser legs
  for (const s of [1, -1])
    for (const zz of [1.65, -1.65]) {
      const xb = s * 2.2;
      const xl = s * 2.85;
      box(1.6, 0.35, 0.5, HULL, [xb, 1.25, zz]);
      plane(HAZARD, 1.2, 0.3, [xb + s * 0.1, 1.432, zz], [0, 1, 0], [0, 0, 1]);
      box(0.22, 0.5, 0.7, DARK, [s * 1.5, 1.25, zz]); // mounting block
      b.rod([s * 1.45, 0.98, zz], [xl, 0.65, zz], 0.07, STEEL);
      b.rod([xl, 1.1, zz], [xl, 0.55, zz], 0.17, STEEL);
      cyl(0.2, 0.08, 8, ORANGE, [xl, 0.9, zz]);
      b.rod([xl, 0.6, zz], [xl, 0.14, zz], 0.1, CHROME);
      b.part(new THREE.SphereGeometry(0.14, 6, 5), DARK, { at: [xl, 0.17, zz] });
      cyl(0.55, 0.12, 12, DARK, [xl, 0.06, zz]);
      b.part(new THREE.CircleGeometry(0.5, 12), "#ffffff", {
        at: [xl, 0.122, zz], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: HAZARD,
      });
      cyl(0.2, 0.06, 8, DARK, [xl, 0.15, zz]);
      // hose
      b.sweep(
        catmull([[s * 1.5, 1.45, zz + 0.15], [s * 2.1, 1.65, zz + 0.2], [xl - s * 0.05, 1.35, zz + 0.2], [xl, 1.05, zz + 0.15]]),
        0.035,
        { color: DARKER, sides: 6 },
      );
    }

  // ---- turret
  b.lathe([[0, 0], [1.35, 0], [1.35, 0.1], [1.2, 0.22], [0, 0.22]], {
    at: [0, 1.8, -1.2], segments: 12, color: DARK,
  });
  const turOutline: [number, number][] = [
    [-2.8, 1.95], [0.4, 1.95], [0.4, 2.5], [-0.2, 2.8], [-2.2, 2.8], [-2.8, 2.4],
  ];
  b.extrude(turOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.04, color: HULL });
  for (const s of [1, -1]) {
    plane(EMBLEM, 1.0, 1.0, [s * 1.162, 2.35, -1.1], [s, 0, 0]);
    plane(HAZARD, 1.0, 0.18, [s * 1.162, 2.05, -1.1], [s, 0, 0]);
    box(0.1, 0.5, 0.9, DARK, [s * 1.18, 2.35, -2.35]); // side hatch
  }
  // turret front panels
  glow(plane(SCREEN, 1.0, 0.5, [-0.55, 2.22, 0.412], [0, 0, 1]), 1.1);
  plane(HVLABEL, 0.5, 0.33, [0.55, 2.22, 0.412], [0, 0, 1]);
  box(1.1, 0.6, 0.04, DARK, [-0.55, 2.22, 0.395]);
  // roof hatch
  cyl(0.38, 0.1, 10, STEEL, [0.9, 2.84, -1.9]);
  cyl(0.12, 0.06, 6, DARK, [0.9, 2.92, -1.9]);
  for (let i = 0; i < 6; i++) b.part(new THREE.SphereGeometry(0.03, 4, 3), CHROME, { at: [-0.9 + i * 0.1, 2.82, -2.6 + R() * 0.02] });
  // ammo crates ahead of turret
  for (const s of [1, -1]) {
    box(0.8, 0.5, 0.6, OLIVE_D, [s * 0.6, 2.05, 1.3]);
    box(0.84, 0.06, 0.64, DARK, [s * 0.6, 2.33, 1.3]);
    plane(HAZARD, 0.5, 0.14, [s * 0.6, 2.05, 1.602], [0, 0, 1]);
  }

  // ---- capacitor bank
  for (const x of [-0.85, 0, 0.85]) {
    cyl(0.4, 1.0, 8, STEEL, [x, 2.3, -3.4]);
    cyl(0.43, 0.14, 8, ORANGE, [x, 2.1, -3.4]);
    cyl(0.43, 0.14, 8, ORANGE, [x, 2.55, -3.4]);
    glow(cyl(0.3, 0.05, 8, CYAN, [x, 2.82, -3.4]), 1.5);
    b.sweep(
      catmull([[x, 2.85, -3.4], [x * 0.6, 3.3, -3.1], [x * 0.2, 3.3, -2.7], [0, 3.03, -2.48]]),
      0.06,
      { color: DARK, sides: 6 },
    );
  }

  // ---- railgun
  const A = (9 * Math.PI) / 180;
  const d = new THREE.Vector3(0, Math.sin(A), Math.cos(A));
  const u = new THREE.Vector3(0, Math.cos(A), -Math.sin(A));
  const pivot = new THREE.Vector3(0, 3.3, -0.8);
  const gp = (s: number, x: number, y: number) =>
    pivot.clone().addScaledVector(d, s).addScaledVector(u, y).add(new THREE.Vector3(x, 0, 0));
  const gbox = (w: number, h: number, L: number, s: number, x: number, y: number, color: any) =>
    b.part(new THREE.BoxGeometry(w, h, L), color, { at: gp(s, x, y), dir: d, axis: "z" });
  const gcyl = (r: number, L: number, s: number, x: number, y: number, color: any, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, L, seg), color, { at: gp(s, x, y), dir: d });

  // pedestal and trunnion
  for (const s of [1, -1]) {
    box(0.3, 0.8, 1.5, HULL, [s * 0.95, 3.2, -0.8]);
    box(0.34, 0.18, 1.6, DARK, [s * 0.95, 2.86, -0.8]);
  }
  cyl(0.2, 2.2, 8, STEEL, pivot.toArray(), [1, 0, 0]);
  // breech
  gbox(1.3, 0.95, 2.1, -0.5, 0, 0, HULL);
  gbox(1.0, 0.7, 0.3, -1.7, 0, 0, DARK);
  glow(gbox(0.5, 0.3, 0.06, -1.88, 0, 0, CYAN), 1.5);
  b.part(new THREE.PlaneGeometry(1.0, 1.6), "#ffffff", {
    at: gp(-0.5, 0, 0.482), dir: u, axis: "z", up: d, texture: VENT,
  });
  for (const s of [1, -1]) gbox(0.08, 0.5, 1.2, -0.5, s * 0.67, 0, ORANGE);
  // rails
  for (const s of [1, -1]) {
    gbox(0.3, 0.46, 9, 3.3, s * 0.3, 0, STEEL);
    gbox(0.34, 0.06, 8.8, 3.3, s * 0.3, 0.26, DARK);
    glow(gbox(0.04, 0.12, 8.5, 3.3, s * 0.135, 0.02, CYAN), 1.6);
    gbox(0.32, 0.5, 0.4, 6.4, s * 0.3, 0, ORANGE);
    gcyl(0.1, 2.6, 1.8, s * 0.45, -0.5, STEEL);
    gcyl(0.06, 1.8, 3.6, s * 0.45, -0.5, CHROME);
  }
  for (let i = 0; i < 8; i++) {
    const s = -0.4 + i * 1.0;
    gbox(1.0, 0.12, 0.3, s, 0, 0.3, DARK);
    gbox(1.0, 0.12, 0.3, s, 0, -0.3, DARK);
    glow(gbox(0.22, 0.05, 0.14, s, 0, 0.37, CYAN), 1.6);
    for (const x of [-1, 1]) b.part(new THREE.SphereGeometry(0.04, 5, 4), CHROME, { at: gp(s, x * 0.4, 0.37) });
  }
  // muzzle
  gbox(1.15, 0.18, 0.55, 7.5, 0, 0.31, DARK);
  gbox(1.15, 0.18, 0.55, 7.5, 0, -0.31, DARK);
  gbox(1.35, 0.95, 0.14, 7.1, 0, 0, STEEL);
  gbox(1.2, 0.8, 0.1, 7.8, 0, 0, ORANGE);
  // sight
  gbox(0.18, 0.2, 0.6, 1.0, 0.0, 0.58, DARK);
  glow(b.part(new THREE.SphereGeometry(0.06, 5, 4), RED, { at: gp(1.35, 0, 0.6) }), 1.5);

  // ---- rivets & misc deck bits (seeded scatter)
  for (let i = 0; i < 18; i++) {
    const x = (R() - 0.5) * 2.4;
    const z = 0.55 + R() * 0.5;
    if (Math.abs(x) < 0.15) continue;
    b.part(new THREE.SphereGeometry(0.03, 4, 3), CHROME, { at: [x, 1.81, z] });
  }
  // tool rack on rear deck
  box(0.5, 0.12, 1.4, DARK, [1.1, 1.86, -0.1], { rotation: [0, 0, 0] });
  b.rod([1.1, 1.95, -0.7], [1.1, 1.95, 0.5], 0.045, ORANGE);

  return b.root;
}
