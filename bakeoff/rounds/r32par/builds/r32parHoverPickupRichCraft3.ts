import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Pickup VX-07",
  description:
    "Militarized pickup converted to quad hover thrusters: camo armor, bed-mounted twin autocannon, neon underglow, bull bar, landing feet. Low-poly cyberpunk.",
};

// ---------- palette ----------
const DARK = "#14171c";
const STEEL = "#4a5560";
const ARMOR = "#39434d";
const GLASS = "#0a2433";
const MAG = "#ff2fa8";
const CYAN = "#27f0ff";
const AMBER = "#ffb02e";
const RED = "#ff2a3a";
const OLIVE = "#566049";

// ---------- paints ----------
const BODY = paint((p, n) => {
  const camo = noise(p, 0.7, 3);
  let c = mix("#222a34", "#3a4a43", smoothstep(0.38, 0.62, camo));
  c = mix(c, "#2b2733", smoothstep(0.66, 0.8, noise(p, 0.45, 8)) * 0.8);
  c = mix(c, "#15171b", smoothstep(0.95, 0.55, p.y) * 0.65 + 0.15 * noise(p, 0.12, 4));
  c = mix(c, "#6a7a88", 0.28 * smoothstep(0.45, 1, n.y));
  c = mix(c, "#9aa2ab", 0.5 * smoothstep(0.78, 0.86, noise(p, 0.06, 12)));
  return c;
});
const PLATE = paint((p, n) => {
  let c = mix("#333c46", "#46535d", noise(p, 0.3, 21));
  c = mix(c, "#8f98a1", 0.4 * smoothstep(0.8, 0.9, noise(p, 0.05, 6)));
  return mix(c, "#1b1f25", 0.3 * smoothstep(0.2, -0.8, n.y));
});

// ---------- textures ----------
const GRILLE = svg(
  `<svg viewBox="0 0 80 20"><rect width="80" height="20" rx="2" fill="#0b0e13"/>
  ${Array.from({ length: 13 }, (_, i) => `<rect x="${5 + i * 5.6}" y="3" width="2.4" height="14" fill="#1f2a36"/><rect x="${5 + i * 5.6}" y="15" width="2.4" height="2" fill="${i % 2 ? "#ff2fa8" : "#27f0ff"}"/>`).join("")}
  <rect x="1" y="1" width="78" height="18" rx="2" fill="none" stroke="#27f0ff" stroke-width="1"/></svg>`,
  { size: 256 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#15171b"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#ffb02e"/>`).join("")}</svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 60">
  <polygon points="22,4 78,4 96,30 78,56 22,56 4,30" fill="#101419" stroke="#27f0ff" stroke-width="3"/>
  <polygon points="28,10 72,10 86,30 72,50 28,50 14,30" fill="none" stroke="#ff2fa8" stroke-width="1.5"/>
  <path d="M30 38 L40 20 L50 38 L60 20 L70 38" stroke="#ffb02e" stroke-width="4" fill="none" stroke-linejoin="round"/>
  <text x="50" y="52" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#27f0ff">VX-07</text></svg>`,
  { size: 256 },
);
const STRIPE = svg(
  `<svg viewBox="0 0 200 8"><rect y="2.5" width="200" height="3" fill="#ff2fa8"/><rect y="3.2" width="200" height="1.2" fill="#ffd0ef"/>
  ${Array.from({ length: 12 }, (_, i) => `<path d="M${10 + i * 16} 0 l6 4 l-6 4 z" fill="#27f0ff"/>`).join("")}</svg>`,
  { size: 512 },
);
const PLATE_TEX = svg(
  `<svg viewBox="0 0 60 30"><rect width="60" height="30" rx="3" fill="#e9e2c0" stroke="#15171b" stroke-width="2"/>
  <rect x="3" y="3" width="54" height="6" fill="#ff2fa8"/><text x="30" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#15171b">N30N-77</text></svg>`,
  { size: 128 },
);
const FAN = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#0a3b52"/><circle cx="50" cy="50" r="40" fill="#1b8fb5"/>
  <circle cx="50" cy="50" r="30" fill="#7ff3ff"/><circle cx="50" cy="50" r="18" fill="#ffffff"/>
  ${Array.from({ length: 8 }, (_, i) => `<path d="M50 50 L${50 + 48 * Math.cos((i * Math.PI) / 4)} ${50 + 48 * Math.sin((i * Math.PI) / 4)}" stroke="#0a3b52" stroke-width="3"/>`).join("")}
  <circle cx="50" cy="50" r="40" fill="none" stroke="#ff2fa8" stroke-width="3"/><circle cx="50" cy="50" r="7" fill="#0a3b52"/></svg>`,
  { size: 192 },
);
const HEAD = svg(
  `<svg viewBox="0 0 40 12"><rect width="40" height="12" rx="3" fill="#bff8ff"/>
  ${Array.from({ length: 6 }, (_, i) => `<rect x="${3 + i * 6}" y="2" width="3" height="8" fill="#ffffff"/>`).join("")}
  <rect y="9" width="40" height="3" fill="#27f0ff"/></svg>`,
  { size: 128 },
);
const TAIL = svg(
  `<svg viewBox="0 0 60 10"><rect width="60" height="10" rx="2" fill="#ff2a3a"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${3 + i * 6}" y="1" width="1.5" height="8" fill="#7a0a14"/>`).join("")}</svg>`,
  { size: 192 },
);

// ---------- builder + helpers ----------
export default function build() {
  const b = createBuilder({ name: "hoverpickup" });

  const box = (size: number[], color: any, at: number[], rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: at as any, rotation: rotation as any });
  const plane = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], g = 0, tint = "#ffffff") => {
    const p = b.part(new THREE.PlaneGeometry(w, h), tint, { at: at as any, dir: dir as any, axis: "z", texture: tex });
    if (g) glow(p, g);
    return p;
  };
  const gbox = (size: number[], color: string, at: number[], g = 1.2) => glow(box(size, color, at), g);
  const cyl = (r0: number, r1: number, h: number, color: any, at: number[], dir: number[] = [0, 1, 0], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at: at as any, dir: dir as any });
  const both = (fn: (s: number) => void) => [1, -1].forEach(fn);

  // ===== chassis & underbody =====
  box([1.7, 0.2, 4.9], DARK, [0, 0.62, 0]);
  box([1.2, 0.08, 4.4], STEEL, [0, 0.5, 0]);
  gbox([1.5, 0.03, 4.6], MAG, [0, 0.46, 0], 1.6);
  both((s) => {
    gbox([0.04, 0.05, 4.6], MAG, [s * 0.97, 0.58, 0], 1.6);
    box([0.1, 0.12, 4.4], DARK, [s * 0.9, 0.66, 0]);
  });

  // ===== lower body (side silhouette extruded across the width) =====
  b.extrude(
    [
      [-2.62, 0.6],
      [2.7, 0.6],
      [2.7, 1.05],
      [1.8, 1.15],
      [-2.62, 1.15],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: BODY },
  );
  // ===== cab =====
  b.extrude(
    [
      [-0.5, 1.15],
      [1.3, 1.15],
      [0.65, 1.8],
      [-0.35, 1.8],
      [-0.5, 1.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.7, bevel: 0.03, color: BODY },
  );
  // side glass
  b.extrude(
    [
      [-0.3, 1.52],
      [0.9, 1.52],
      [0.7, 1.74],
      [-0.3, 1.74],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.72, color: GLASS },
  );
  // windshield
  glow(box([1.5, 0.92, 0.04], GLASS, [0, 1.49, 0.99], [-45, 0, 0]), 0.35);
  // roof extras
  box([1.55, 0.05, 1.0], ARMOR, [0, 1.83, 0.15]);
  gbox([1.3, 0.07, 0.1], CYAN, [0, 1.87, 0.62], 1.6);
  gbox([0.6, 0.07, 0.1], MAG, [0.3, 1.87, -0.3], 1.6);
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [-0.35, 1.86, 0.1] });
  glow(cyl(0.05, 0.05, 0.03, CYAN, [-0.35, 2.0, 0.1]), 1.4);
  both((s) => {
    b.rod([s * 0.45, 1.85, -0.3], [s * 0.5, 2.55 + (s > 0 ? 0 : -0.3), -0.35], 0.012, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), s > 0 ? MAG : CYAN, { at: [s * 0.5, 2.55 + (s > 0 ? 0 : -0.3), -0.35] }), 2);
    box([0.04, 0.04, 1.0], STEEL, [s * 0.7, 1.9, 0.15]);
  });

  // ===== doors, plates, emblems =====
  both((s) => {
    for (const z of [-0.12, 0.5]) box([0.012, 0.65, 0.015], DARK, [s * 0.855, 1.43, z + 0.6]);
    box([0.03, 0.04, 0.16], STEEL, [s * 0.865, 1.38, 0.2]);
    box([0.06, 0.34, 1.1], PLATE, [s * 0.9, 1.3, 0.35]);
    plane(EMBLEM, 0.6, 0.36, [s * 0.935, 1.3, 0.35], [s, 0, 0], 0.5);
    plane(STRIPE, 4.6, 0.12, [s * 0.955, 0.88, -0.1], [s, 0, 0], 1.4);
    // wing mirrors
    box([0.18, 0.03, 0.03], DARK, [s * 0.95, 1.55, 1.05]);
    box([0.05, 0.16, 0.12], ARMOR, [s * 1.04, 1.55, 1.05]);
    gbox([0.01, 0.12, 0.08], CYAN, [s * 1.07, 1.55, 1.05], 0.7);
    // bed walls
    box([0.08, 0.42, 2.1], BODY, [s * 0.91, 1.36, -1.57]);
    box([0.1, 0.05, 2.1], ARMOR, [s * 0.91, 1.59, -1.57]);
  });
  // tailgate & bed floor
  box([1.9, 0.42, 0.08], BODY, [0, 1.36, -2.58]);
  box([1.9, 0.05, 0.1], ARMOR, [0, 1.59, -2.58]);
  box([1.7, 0.03, 2.05], DARK, [0, 1.17, -1.55]);
  for (let i = 0; i < 6; i++) box([1.7, 0.02, 0.05], STEEL, [0, 1.19, -0.8 - i * 0.32]);

  // ===== front end =====
  box([2.0, 0.26, 0.2], ARMOR, [0, 0.74, 2.73]);
  b.part(new THREE.BoxGeometry(1.96, 0.24, 0.02), "#ffffff", { at: [0, 0.74, 2.835], texture: HAZARD });
  plane(GRILLE, 0.85, 0.2, [0, 0.96, 2.71], [0, 0, 1], 0.5);
  both((s) => {
    plane(HEAD, 0.34, 0.1, [s * 0.62, 0.97, 2.715], [0, 0, 1], 1.8);
    b.rod([s * 0.5, 0.7, 2.85], [s * 0.5, 1.28, 2.78], 0.035, STEEL);
  });
  b.rod([0, 0.7, 2.85], [0, 1.28, 2.78], 0.035, STEEL);
  b.rod([-0.62, 1.28, 2.78], [0.62, 1.28, 2.78], 0.035, STEEL);
  b.rod([-0.62, 1.28, 2.78], [-0.9, 1.0, 2.72], 0.03, STEEL);
  b.rod([0.62, 1.28, 2.78], [0.9, 1.0, 2.72], 0.03, STEEL);
  // hood scoop + vents
  box([0.8, 0.1, 0.6], ARMOR, [0, 1.19, 1.85], [-6, 0, 0]);
  for (let i = 0; i < 4; i++) gbox([0.6, 0.012, 0.04], CYAN, [0, 1.25, 1.65 + i * 0.12], 1.3);
  box([0.5, 0.05, 0.3], STEEL, [0, 1.2, 2.45]);
  both((s) => box([0.1, 0.05, 1.0], ARMOR, [s * 0.7, 1.18, 2.0]));
  // spotlights on hood edge
  both((s) => {
    cyl(0.07, 0.07, 0.1, DARK, [s * 0.4, 1.23, 1.45], [0, 0, 1]);
    glow(cyl(0.055, 0.055, 0.02, "#ffffff", [s * 0.4, 1.23, 1.51], [0, 0, 1]), 1.6);
  });

  // ===== rear end =====
  box([2.0, 0.2, 0.18], ARMOR, [0, 0.85, -2.68]);
  plane(TAIL, 1.5, 0.12, [0, 1.05, -2.64], [0, 0, -1], 1.6);
  plane(PLATE_TEX, 0.4, 0.2, [0, 1.35, -2.63], [0, 0, -1], 0);
  both((s) => gbox([0.14, 0.12, 0.02], RED, [s * 0.8, 1.55, -2.63], 1.8));
  // rear thruster nozzles
  both((s) => {
    b.lathe(
      [
        [0, 0],
        [0.18, 0],
        [0.2, 0.08],
        [0.3, 0.38],
        [0, 0.38],
      ],
      { at: [s * 0.5, 0.85, -2.76], axis: [0, 0, -1], color: STEEL, segments: 8 },
    );
    glow(cyl(0.27, 0.27, 0.02, CYAN, [s * 0.5, 0.85, -3.15], [0, 0, -1], 10), 1.8);
    glow(cyl(0.14, 0.14, 0.03, "#ffffff", [s * 0.5, 0.85, -3.165], [0, 0, -1], 8), 2);
  });

  // ===== bed cargo: battery cells & ammo =====
  both((s) => {
    box([0.4, 0.3, 0.5], STEEL, [s * 0.6, 1.34, -2.25]);
    gbox([0.3, 0.05, 0.3], CYAN, [s * 0.6, 1.5, -2.25], 1.4);
  });
  box([0.4, 0.26, 0.4], OLIVE, [-0.0, 1.31, -2.2]);
  b.part(new THREE.BoxGeometry(0.42, 0.06, 0.42), "#ffffff", { at: [0, 1.47, -2.2], texture: HAZARD });

  // ===== turret =====
  cyl(0.38, 0.42, 0.14, STEEL, [0, 1.25, -1.45], [0, 1, 0], 10);
  glow(b.part(new THREE.TorusGeometry(0.4, 0.015, 4, 14), MAG, { at: [0, 1.33, -1.45], rotation: [90, 0, 0] }), 1.6);
  box([0.56, 0.3, 0.7], ARMOR, [0, 1.52, -1.5]);
  box([0.4, 0.14, 0.34], PLATE, [0, 1.74, -1.55]);
  both((s) => {
    box([0.16, 0.32, 0.5], STEEL, [s * 0.32, 1.52, -1.5]);
    b.rod([s * 0.17, 1.55, -1.3], [s * 0.17, 1.55, -0.62], 0.032, DARK, { sides: 8 });
    b.rod([s * 0.17, 1.55, -0.62], [s * 0.17, 1.55, -0.54], 0.045, STEEL, { sides: 8 });
    glow(cyl(0.02, 0.02, 0.02, AMBER, [s * 0.17, 1.55, -0.53], [0, 0, 1], 6), 2);
    box([0.3, 0.22, 0.22], OLIVE, [s * 0.5, 1.4, -1.7]);
  });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [0, 1.62, -1.17] }), 2);

  // ===== hover pods =====
  const podFront = 1.85;
  const podRear = -1.65;
  both((s) =>
    [podFront, podRear].forEach((z) => {
      const x = s * 1.22;
      // support arms
      box([0.5, 0.1, 0.34], STEEL, [s * 0.95, 0.62, z]);
      box([0.1, 0.34, 0.3], DARK, [s * 1.0, 0.55, z]);
      b.lathe(
        [
          [0, 0],
          [0.34, 0],
          [0.44, 0.06],
          [0.44, 0.34],
          [0.36, 0.4],
          [0, 0.4],
        ],
        { at: [x, 0.2, z], color: PLATE, segments: 10 },
      );
      glow(b.part(new THREE.TorusGeometry(0.42, 0.02, 4, 16), MAG, { at: [x, 0.25, z], rotation: [90, 0, 0] }), 1.6);
      glow(b.part(new THREE.TorusGeometry(0.42, 0.02, 4, 16), CYAN, { at: [x, 0.52, z], rotation: [90, 0, 0] }), 1.2);
      plane(FAN, 0.7, 0.7, [x, 0.195, z], [0, -1, 0], 1.7);
      // intake grille on top
      for (let k = 0; k < 3; k++) box([0.7, 0.02, 0.05], DARK, [x, 0.6, z + (k - 1) * 0.16]);
      // landing foot
      cyl(0.045, 0.05, 0.4, STEEL, [s * 1.6, 0.2, z]);
      cyl(0.12, 0.14, 0.04, DARK, [s * 1.6, 0.02, z], [0, 1, 0], 8);
      box([0.12, 0.05, 0.12], AMBER, [s * 1.6, 0.34, z]);
    }),
  );

  // ===== rivets (merged) =====
  const rv: THREE.BufferGeometry[] = [];
  for (let z = -2.4; z <= 2.5; z += 0.3)
    both((s) => rv.push(new THREE.SphereGeometry(0.02, 5, 3).translate(s * 0.955, 0.68, z)));
  for (let x = -0.8; x <= 0.81; x += 0.2) rv.push(new THREE.SphereGeometry(0.02, 5, 3).translate(x, 0.86, 2.845));
  const merged = mergeGeometries(rv);
  if (merged) b.part(merged, "#9aa2ab", { at: [0, 0, 0] });

  return b.root;
}
