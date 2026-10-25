import * as THREE from "three";
import { createBuilder, svg, paint, mottle, countershade, mix } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup truck converted to four ducted hover thrusters, with camo armor, a bed-mounted twin cannon and neon cyberpunk lighting.",
};

// ---------- palette ----------
const CYAN = "#3df2ff";
const MAG = "#ff2fb4";
const AMBER = "#ffb21e";
const RED = "#ff2a3a";
const ARMOR = "#1b2025";
const DARK = "#0e1115";
const STEEL = "#5a6670";
const GLASS = "#0c2a3a";
const OLIVE = "#4a5640";

const CAMO = countershade(
  mottle(mottle("#3b4a43", "#2a3733", { size: 0.32, seed: 3 }), "#4b4f3a", { size: 0.7, seed: 9, contrast: 0.7 }),
  "#171c1f",
  { level: -0.45 },
);
const PLATE = paint((p, n) => {
  const base = mix("#262d33", "#39424a", Math.min(1, Math.max(0, n.y * 0.5 + 0.5)));
  const seam = Math.abs(((p.z * 4) % 1) - 0.5) > 0.47 ? 0.4 : 0;
  return mix(base, "#0a0c0e", seam);
});

// ---------- textures ----------
const windowTex = svg(
  `<svg viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
  <polygon points="0,50 150,50 125,0 25,0" fill="#05121a"/>
  <polygon points="6,46 144,46 121,4 29,4" fill="${GLASS}"/>
  <polygon points="30,46 52,46 80,4 58,4" fill="#2fe0ff" opacity="0.28"/>
  <polygon points="62,46 70,46 98,4 90,4" fill="#ff2fb4" opacity="0.35"/>
  <polygon points="6,46 144,46 142,41 8,41" fill="#000" opacity="0.3"/>
</svg>`,
  { size: 256 },
);
const doorTex = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="112" height="3" fill="#ff2fb4"/>
  <text x="8" y="36" font-family="monospace" font-weight="bold" font-size="30" fill="#e9f4ef" stroke="#10151a" stroke-width="2" paint-order="stroke">HX-07</text>
  <path d="M96 14 l4 10 h10 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 h10z" fill="#3df2ff" stroke="#10151a" stroke-width="1.2"/>
  <rect x="4" y="44" width="40" height="3" fill="#3df2ff"/>
</svg>`,
  { size: 256 },
);
const hoodTex = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="27" fill="#12181c" stroke="#3df2ff" stroke-width="3"/>
  <circle cx="30" cy="30" r="21" fill="none" stroke="#ff2fb4" stroke-width="1.5" stroke-dasharray="4 3"/>
  <path d="M30 10 l5 14 h15 l-12 9 l5 15 l-13 -9 l-13 9 l5 -15 l-12 -9 h15z" fill="#e9f4ef" stroke="#10151a" stroke-width="1.5"/>
  <path d="M18 54 l12 -6 l12 6" fill="none" stroke="#ffb21e" stroke-width="2.5"/>
</svg>`,
  { size: 192 },
);
const grilleTex = svg(
  `<svg viewBox="0 0 150 26" xmlns="http://www.w3.org/2000/svg">
  <rect width="150" height="26" rx="3" fill="#080a0d"/>
  ${Array.from({ length: 22 }, (_, i) => `<rect x="${6 + i * 6.4}" y="4" width="3" height="18" fill="${i % 5 === 2 ? "#ff2fb4" : "#2a343c"}"/>`).join("")}
  <rect x="0" y="11" width="150" height="3" fill="#3df2ff" opacity="0.8"/>
</svg>`,
  { size: 256 },
);
const hazardTex = svg(
  `<svg viewBox="0 0 200 14" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="14" fill="#14161a"/>
  ${Array.from({ length: 14 }, (_, i) => `<polygon points="${i * 16},14 ${i * 16 + 8},14 ${i * 16 + 22},0 ${i * 16 + 14},0" fill="#e8b918"/>`).join("")}
</svg>`,
  { size: 256 },
);
const plateTex = svg(
  `<svg viewBox="0 0 70 30" xmlns="http://www.w3.org/2000/svg">
  <rect width="70" height="30" rx="3" fill="#dfe3cf" stroke="#10151a" stroke-width="2"/>
  <text x="35" y="19" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#10151a">NX-4471</text>
  <rect x="6" y="23" width="58" height="3" fill="#ff2fb4"/>
</svg>`,
  { size: 192 },
);

// ---------- builder + helpers ----------
export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) => b.part(geo, color, { at, ...o });
  const bx = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, { flat: true, ...o });
  const lit = <T,>(part: T, k = 1.2): T => glow(part as any, k) as T;
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], up?: number[]) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", up, texture: tex });

  // ===== lower body (side profile in z,y) =====
  b.extrude(
    [
      [-2.6, 0.5],
      [2.7, 0.5],
      [2.8, 0.85],
      [2.35, 1.15],
      [-2.6, 1.15],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: CAMO, name: "lowerBody" },
  );
  // belly plate and hover generator
  bx(1.5, 0.14, 4.6, ARMOR, [0, 0.43, -0.1]);
  bx(1.1, 0.1, 2.2, DARK, [0, 0.34, 0.1]);
  for (const z of [-0.6, 0.1, 0.8]) lit(bx(1.14, 0.03, 0.08, CYAN, [0, 0.3, z]), 1.5);

  // ===== cabin =====
  b.extrude(
    [
      [-0.4, 1.15],
      [1.45, 1.15],
      [1.45, 1.3],
      [0.7, 2.0],
      [-0.4, 2.0],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.7, bevel: 0.04, color: CAMO, name: "cabin" },
  );
  // roof armor + rails
  bx(1.6, 0.06, 0.95, PLATE, [0, 2.03, -0.1]);
  for (const s of [1, -1]) {
    bx(0.04, 0.05, 0.95, STEEL, [s * 0.7, 2.09, -0.1]);
  }
  // windscreen
  bx(1.5, 0.03, 0.95, GLASS, [0, 1.667, 1.09], { rotation: [43, 0, 0] });
  lit(bx(1.5, 0.02, 0.05, CYAN, [0, 1.99, 0.72], { rotation: [43, 0, 0] }), 1.0);
  // rear cabin window
  bx(1.1, 0.4, 0.03, GLASS, [0, 1.65, -0.415]);
  lit(bx(1.1, 0.03, 0.02, MAG, [0, 1.42, -0.43]), 1.3);

  for (const s of [1, -1]) {
    // side window, door stencil
    plane(1.5, 0.5, windowTex, [s * 0.855, 1.65, 0.5], [s, 0, 0]);
    plane(1.2, 0.5, doorTex, [s * 0.955, 0.86, 0.45], [s, 0, 0]);
    // door seams
    bx(0.01, 0.55, 0.02, DARK, [s * 0.953, 0.86, 1.07]);
    bx(0.01, 0.55, 0.02, DARK, [s * 0.953, 0.86, -0.15]);
    lit(bx(0.02, 0.03, 0.14, AMBER, [s * 0.96, 0.98, 0.9]), 1.0); // handle light
    // mirror
    bx(0.04, 0.04, 0.2, ARMOR, [s * 1.0, 1.5, 1.22], { rotation: [0, 0, 0] });
    bx(0.07, 0.18, 0.12, ARMOR, [s * 1.07, 1.52, 1.25]);
    lit(bx(0.01, 0.12, 0.08, CYAN, [s * 1.105, 1.52, 1.25]), 1.0);
    // side skirt + hazard stripe
    bx(0.08, 0.16, 2.0, ARMOR, [s * 0.98, 0.6, 0.0]);
    plane(2.0, 0.14, hazardTex, [s * 1.022, 0.6, 0.0], [s, 0, 0]);
    // underglow
    lit(bx(0.04, 0.03, 1.9, MAG, [s * 0.9, 0.47, 0.0]), 1.6);
    // bed walls with neon cap
    bx(0.1, 0.38, 2.1, CAMO, [s * 0.9, 1.34, -1.5]);
    lit(bx(0.03, 0.02, 2.1, MAG, [s * 0.9, 1.54, -1.5]), 1.3);
    // tail lights
    lit(bx(0.4, 0.1, 0.04, RED, [s * 0.7, 1.0, -2.62]), 1.5);
    // stacks behind cabin
    cyl(0.06, 0.07, 0.9, 6, STEEL, [s * 0.78, 1.6, -0.55]);
    for (const y of [1.3, 1.6, 1.85]) cyl(0.085, 0.085, 0.04, 6, ARMOR, [s * 0.78, y, -0.55]);
    lit(cyl(0.045, 0.045, 0.03, 6, CYAN, [s * 0.78, 2.07, -0.55]), 1.6);
    // rear fins
    b.extrude(
      [
        [-2.0, 1.5],
        [-2.3, 2.15],
        [-2.65, 2.15],
        [-2.55, 1.5],
      ],
      { at: [s * 0.95, 0, 0], x: [0, 0, 1], thickness: 0.06, bevel: 0.01, color: ARMOR },
    );
    lit(bx(0.07, 0.03, 0.4, MAG, [s * 0.95, 2.15, -2.48]), 1.4);
    // headlights
    lit(bx(0.32, 0.09, 0.05, "#e8fdff", [s * 0.8, 0.74, 2.8]), 1.8);
    // front corner armor wedges
    bx(0.2, 0.34, 0.3, ARMOR, [s * 0.9, 0.7, 2.7], { rotation: [0, s * 20, 0] });
    // hood vents
    for (let i = 0; i < 3; i++) lit(bx(0.2, 0.012, 0.04, CYAN, [s * 0.52, 1.31, 1.7 + i * 0.12]), 1.2);
    // bumper lamp
    lit(cyl(0.05, 0.05, 0.05, 6, AMBER, [s * 0.95, 0.5, 2.9], { dir: [0, 0, 1] }), 1.5);
  }

  // hood
  bx(1.5, 0.15, 0.85, PLATE, [0, 1.225, 1.88]);
  plane(0.6, 0.6, hoodTex, [0, 1.304, 1.88], [0, 1, 0], [0, 0, 1]);
  // front DRL strip on slope
  lit(bx(1.2, 0.03, 0.08, CYAN, [0, 1.017, 2.586], { rotation: [33.7, 0, 0] }), 1.6);
  // grille + bumper
  plane(1.2, 0.26, grilleTex, [0, 0.72, 2.806], [0, 0, 1]);
  bx(2.05, 0.2, 0.22, ARMOR, [0, 0.46, 2.82]);
  bx(1.3, 0.1, 0.12, STEEL, [0, 0.58, 2.93]);
  lit(bx(1.3, 0.025, 0.02, MAG, [0, 0.46, 2.935]), 1.5);
  // rear bumper + plate
  bx(1.9, 0.2, 0.2, ARMOR, [0, 0.62, -2.7]);
  plane(0.42, 0.18, plateTex, [0, 0.64, -2.803], [0, 0, -1]);
  // tailgate + bulkhead
  bx(1.9, 0.38, 0.1, CAMO, [0, 1.34, -2.55]);
  lit(bx(1.9, 0.02, 0.03, MAG, [0, 1.54, -2.55]), 1.3);
  bx(1.7, 0.5, 0.1, ARMOR, [0, 1.4, -0.47]);

  // ===== roof gear =====
  bx(1.3, 0.1, 0.2, ARMOR, [0, 2.12, 0.3]);
  lit(bx(0.55, 0.07, 0.17, CYAN, [-0.33, 2.13, 0.3]), 1.7);
  lit(bx(0.55, 0.07, 0.17, MAG, [0.33, 2.13, 0.3]), 1.7);
  cyl(0.012, 0.015, 0.9, 5, DARK, [-0.7, 2.5, -0.3]);

  lit(P(new THREE.SphereGeometry(0.03, 6, 4), RED, [-0.7, 2.96, -0.3]), 1.8);
  b.lathe(
    [
      [0, 0],
      [0.2, 0.07],
      [0.2, 0.09],
      [0, 0.03],
    ],
    { at: [0.45, 2.1, -0.15], axis: [0, 0.75, 0.65], segments: 8, color: STEEL },
  );
  cyl(0.015, 0.015, 0.2, 5, DARK, [0.45, 2.15, -0.15]);

  // ===== bed: turret + cargo =====
  cyl(0.24, 0.28, 0.2, 8, ARMOR, [0, 1.25, -1.3]);
  bx(0.55, 0.3, 0.55, CAMO, [0, 1.5, -1.3]);
  bx(0.6, 0.06, 0.3, PLATE, [0, 1.68, -1.2], { rotation: [-10, 0, 0] });
  for (const s of [1, -1]) {
    cyl(0.05, 0.05, 1.2, 6, DARK, [s * 0.14, 1.52, -0.65], { dir: [0, 0, 1] });
    cyl(0.07, 0.07, 0.18, 6, STEEL, [s * 0.14, 1.52, -0.12], { dir: [0, 0, 1] });
    lit(cyl(0.035, 0.035, 0.03, 6, CYAN, [s * 0.14, 1.52, 0.0], { dir: [0, 0, 1] }), 1.8);
    bx(0.04, 0.34, 0.4, ARMOR, [s * 0.32, 1.52, -1.35]);
  }
  lit(bx(0.3, 0.04, 0.04, AMBER, [0, 1.62, -1.02]), 1.4);
  // crates
  bx(0.55, 0.35, 0.55, OLIVE, [0.45, 1.33, -2.1]);
  bx(0.58, 0.04, 0.58, DARK, [0.45, 1.52, -2.1]);
  bx(0.5, 0.3, 0.5, "#3d3f46", [-0.5, 1.3, -2.15]);
  lit(bx(0.3, 0.04, 0.01, AMBER, [-0.5, 1.33, -1.895]), 1.2);
  // fuel/power cell
  cyl(0.16, 0.16, 0.5, 8, STEEL, [-0.5, 1.4, -1.0]);
  lit(cyl(0.12, 0.12, 0.3, 8, CYAN, [-0.5, 1.45, -1.0]), 1.5);
  cyl(0.17, 0.17, 0.04, 8, ARMOR, [-0.5, 1.64, -1.0]);

  // ===== hover pods =====
  const pod = (s: number, z: number) => {
    const x = s * 1.3;
    b.lathe(
      [
        [0.33, 0],
        [0.43, 0],
        [0.45, 0.2],
        [0.43, 0.52],
        [0.34, 0.52],
        [0.32, 0.3],
      ],
      { at: [x, 0, z], axis: [0, 1, 0], segments: 10, color: PLATE, name: "podShroud" },
    );
    P(new THREE.TorusGeometry(0.44, 0.02, 4, 12), CYAN, [x, 0.03, z], { rotation: [90, 0, 0] });
    lit(P(new THREE.TorusGeometry(0.44, 0.02, 4, 12), CYAN, [x, 0.03, z], { rotation: [90, 0, 0] }), 1.8);
    lit(cyl(0.33, 0.33, 0.03, 10, CYAN, [x, 0.12, z]), 1.5);
    cyl(0.07, 0.07, 0.1, 6, STEEL, [x, 0.34, z]);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      bx(0.3, 0.012, 0.07, DARK, [x + Math.sin(a) * 0.17, 0.34, z + Math.cos(a) * 0.17], {
        rotation: [0, (a * 180) / Math.PI - 90, 0],
      });
    }
    // strut + pad
    bx(0.55, 0.14, 0.5, ARMOR, [s * 1.13, 0.53, z]);
    bx(0.4, 0.1, 0.4, STEEL, [s * 0.98, 0.45, z]);
    // bolts
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      lit(P(new THREE.SphereGeometry(0.03, 5, 3), MAG, [x + Math.sin(a) * 0.44, 0.5, z + Math.cos(a) * 0.44]), 1.4);
    }
    // outer stabiliser fin
    b.extrude(
      [
        [-0.25, 0.1],
        [0.25, 0.1],
        [0.1, 0.6],
        [-0.1, 0.6],
      ],
      { at: [x + s * 0.45, 0, z], x: [0, 0, 1], thickness: 0.04, bevel: 0.008, color: ARMOR },
    );
    lit(bx(0.045, 0.03, 0.2, AMBER, [x + s * 0.45, 0.58, z]), 1.2);
  };
  for (const s of [1, -1]) for (const z of [1.65, -1.65]) pod(s, z);

  return b.root;
}
