import * as THREE from "three";
import { createBuilder, svg, mottle, rng } from "../../../../src/index";
import { gearGeometry, metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Pickup MK-VII",
  description:
    "A militarized pickup truck converted to ducted hover thrusters: armored low-poly cyberpunk body, roof gun, rocket pod, neon trim, and four fan pods on landing skids.",
};

// ---------- palette ----------
const CYAN = "#30f0ff";
const MAG = "#ff2d9a";
const AMBER = "#ffb020";
const BLACK = "#0d0f14";
const GUN = "#1b1f27";
const STEEL = "#586070";
const GLASS = "#0b4458";
const HAZ = "#e8a21a";

// ---------- paints ----------
const BODY = panelled(mottle("#35423f", "#2a3433", { size: 0.45, contrast: 1.2, seed: 3 }), {
  size: 0.55,
  aspect: 0.55,
  rivets: 0.09,
});
const ARMOR = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.35, aspect: 0.8, rivets: 0.07 });
const DARKMETAL = metal("steel", { tarnish: 0.6, polish: 0.1 });
const BRASS = metal("brass", { tarnish: 0.5 });

// ---------- textures ----------
const DOOR_TEX = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="124" height="60" rx="4" fill="#161a20" stroke="#0a0c10" stroke-width="3"/>
  <rect x="6" y="6" width="116" height="10" fill="${HAZ}"/>
  <path d="M6 6 l10 10 M22 6 l10 10 M38 6 l10 10 M54 6 l10 10 M70 6 l10 10 M86 6 l10 10 M102 6 l10 10" stroke="#161a20" stroke-width="5"/>
  <text x="10" y="50" font-family="monospace" font-weight="bold" font-size="30" fill="${CYAN}">TX-07</text>
  <rect x="96" y="26" width="22" height="4" fill="${MAG}"/><rect x="96" y="34" width="14" height="4" fill="${MAG}"/>
  <rect x="96" y="42" width="22" height="4" fill="${CYAN}"/><circle cx="106" cy="54" r="3" fill="${AMBER}"/>
  </svg>`,
  { size: 256 },
);
const GRILLE_TEX = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="16" fill="#07080b"/>
  ${[2, 6, 10, 14].map((y) => `<rect x="3" y="${y - 1}" width="58" height="1.6" fill="${MAG}"/>`).join("")}
  <rect x="29" y="0" width="6" height="16" fill="#07080b"/>
  </svg>`,
  { size: 256 },
);
const EMBLEM_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="#12151b" stroke="${AMBER}" stroke-width="3"/>
  <polygon points="32,12 50,22 50,42 32,52 14,42 14,22" fill="none" stroke="${CYAN}" stroke-width="2"/>
  <path d="M16 32 Q32 18 48 32 Q32 46 16 32Z" fill="${MAG}" stroke="#12151b" stroke-width="2"/>
  <circle cx="32" cy="32" r="6" fill="#12151b"/><circle cx="30" cy="30" r="2" fill="#fff"/>
  </svg>`,
  { size: 192 },
);
const TAIL_TEX = svg(
  `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="32" fill="#0b0d12"/>
  <rect x="3" y="6" width="34" height="8" fill="${MAG}"/><rect x="91" y="6" width="34" height="8" fill="${MAG}"/>
  <rect x="3" y="18" width="34" height="5" fill="${AMBER}"/><rect x="91" y="18" width="34" height="5" fill="${AMBER}"/>
  <rect x="46" y="8" width="36" height="16" fill="#cfd8dc"/>
  <text x="64" y="21" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#12151b">HVR-404</text>
  </svg>`,
  { size: 256 },
);
const HAZ_TEX = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="16" fill="${HAZ}"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<polygon points="${i * 10 - 4},16 ${i * 10 + 2},16 ${i * 10 + 10},0 ${i * 10 + 4},0" fill="#12151b"/>`).join("")}
  </svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "hoverPickup" });
  const R = rng(11);

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: number[], dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, dir });
  const decal = (w: number, h: number, tex: any, at: number[], dir: number[], up: number[] = [0, 1, 0]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, up, axis: "z", texture: tex });
  const side = (z: number, y: number): number[] => [z, y];

  // ---------- main body (side profile extrudes, x runs along z) ----------
  const lower: any[] = [
    [-0.4, 0.6],
    [2.5, 0.6],
    [2.7, 0.85],
    [2.6, 1.05],
    [2.0, 1.22],
    [1.45, 1.22],
    [-0.4, 1.22],
  ];
  b.extrude(lower, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, color: BODY });
  // cab
  const cab: any[] = [
    [-0.4, 1.2],
    [-0.28, 1.85],
    [0.2, 1.97],
    [1.0, 1.92],
    [1.47, 1.2],
  ];
  b.extrude(cab, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, color: BODY });
  // roof plate and underbody
  box(1.6, 0.06, 1.3, ARMOR, [0, 1.99, 0.32]);
  box(1.7, 0.14, 5.0, GUN, [0, 0.54, 0.05]);
  box(1.2, 0.1, 4.6, DARKMETAL, [0, 0.47, 0.05]);

  // ---------- windows ----------
  for (const s of [1, -1]) {
    const w = b.extrude(
      [
        [-0.2, 1.42],
        [-0.15, 1.8],
        [0.2, 1.88],
        [0.9, 1.84],
        [1.2, 1.42],
      ],
      { at: [s * 0.9, 0, 0], x: [0, 0, 1], thickness: 0.04, color: GLASS },
    );
    glow(w, 0.5);
    // window frame bar
    box(0.03, 0.46, 0.05, BLACK, [s * 0.91, 1.62, 0.5]);
  }
  glow(
    b.slab(
      [
        [-0.78, 1.83, 1.05],
        [0.78, 1.83, 1.05],
        [0.78, 1.3, 1.4],
        [-0.78, 1.3, 1.4],
      ].map(([x, y, z]) => [x, y + 0.012, z + 0.018]),
      { color: GLASS, thickness: 0.03 },
    ),
    0.55,
  );
  box(0.04, 0.5, 0.04, BLACK, [0, 1.56, 1.215], { rotation: [32, 0, 0] });
  glow(box(1.0, 0.36, 0.03, GLASS, [0, 1.62, -0.33], { rotation: [-10, 0, 0] }), 0.5);

  // ---------- hood details ----------
  box(0.5, 0.1, 0.5, ARMOR, [0, 1.27, 1.95]);
  for (let i = 0; i < 4; i++) glow(box(0.4, 0.012, 0.03, MAG, [0, 1.327, 1.8 + i * 0.1]), 1.2);
  decal(0.5, 0.5, EMBLEM_TEX, [0, 1.226, 1.55], [0, 1, 0], [0, 0, 1]);
  for (const s of [1, -1]) {
    // hood armor chevrons
    b.extrude(
      [
        [0, 0],
        [0.45, 0],
        [0.6, 0.18],
        [0.15, 0.18],
      ],
      { at: [s * 0.35, 1.225, 1.75], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.05, color: ARMOR },
    );
  }

  // ---------- front fascia ----------
  box(2.0, 0.24, 0.22, ARMOR, [0, 0.72, 2.7]);
  b.part(new THREE.BoxGeometry(1.7, 0.1, 0.1), HAZ_TEX && "#ffffff", {
    at: [0, 0.6, 2.82],
    texture: HAZ_TEX,
  });
  decal(0.9, 0.22, GRILLE_TEX, [0, 0.97, 2.655], [0, 0.2, 1]);
  glow(decal(0.9, 0.22, GRILLE_TEX, [0, 0.97, 2.656], [0, 0.2, 1]), 1.1);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.09, 0.06, CYAN, [s * 0.68, 0.99, 2.655], { rotation: [-12, 0, 0] }), 1.6);
    box(0.56, 0.04, 0.08, BLACK, [s * 0.68, 1.06, 2.64], { rotation: [-12, 0, 0] });
    // bull bar
    b.rod([s * 0.75, 0.55, 2.76], [s * 0.75, 1.05, 2.78], 0.04, STEEL);
    b.rod([s * 0.75, 1.05, 2.78], [s * 0.2, 1.05, 2.82], 0.04, STEEL);
    // mirrors
    b.rod([s * 0.9, 1.55, 1.2], [s * 1.12, 1.62, 1.22], 0.02, BLACK);
    box(0.06, 0.2, 0.14, GUN, [s * 1.14, 1.62, 1.22]);
    glow(box(0.02, 0.14, 0.1, CYAN, [s * 1.175, 1.62, 1.22]), 1.0);
  }
  b.rod([-0.2, 1.05, 2.82], [0.2, 1.05, 2.82], 0.04, STEEL);

  // ---------- side armor + door decals + neon ----------
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.2, 0.7],
        [1.5, 0.7],
        [1.7, 0.95],
        [1.45, 1.17],
        [-0.2, 1.17],
      ],
      { at: [s * 1.04, 0, 0], x: [0, 0, 1], thickness: 0.08, color: ARMOR },
    );
    decal(0.95, 0.47, DOOR_TEX, [s * 1.085, 0.94, 0.6], [s, 0, 0]);
    glow(box(0.03, 0.035, 3.4, s > 0 ? CYAN : MAG, [s * 1.02, 0.63, 0.5]), 1.4);
    // rivet bolts line
    for (let i = 0; i < 5; i++) b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), BRASS, { at: [s * 1.08, 1.12, -0.1 + i * 0.35], dir: [s, 0, 0] });
  }

  // ---------- roof gear ----------
  glow(box(1.5, 0.07, 0.1, MAG, [0, 2.0, 0.98]), 1.6);
  for (const s of [1, -1]) {
    b.rod([s * 0.75, 1.98, -0.2], [s * 0.82, 3.0, -0.35], 0.015, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), s > 0 ? CYAN : MAG, { at: [s * 0.82, 3.02, -0.35] }), 2);
    box(0.28, 0.12, 0.28, GUN, [s * 0.6, 2.08, -0.05]);
  }
  // gun ring + pedestal + shield + gun
  cyl(0.38, 0.4, 0.1, 10, DARKMETAL, [0, 2.07, 0.35]);
  cyl(0.12, 0.14, 0.3, 8, GUN, [0, 2.22, 0.35]);
  box(0.34, 0.26, 0.6, GUN, [0, 2.45, 0.35]);
  cyl(0.045, 0.045, 1.1, 8, STEEL, [0, 2.46, 1.0], [0, 0, 1]);
  cyl(0.07, 0.07, 0.22, 8, DARKMETAL, [0, 2.46, 1.5], [0, 0, 1]);
  glow(cyl(0.05, 0.05, 0.02, 8, CYAN, [0, 2.46, 1.62], [0, 0, 1]), 1.5);
  cyl(0.035, 0.035, 0.8, 6, STEEL, [0.11, 2.4, 0.9], [0, 0, 1]);
  cyl(0.035, 0.035, 0.8, 6, STEEL, [-0.11, 2.4, 0.9], [0, 0, 1]);
  b.extrude(
    [
      [-0.35, 0],
      [0.35, 0],
      [0.3, 0.38],
      [0, 0.46],
      [-0.3, 0.38],
    ],
    { at: [0, 2.3, 0.62], x: [1, 0, 0], thickness: 0.04, color: ARMOR, bevel: 0.01 },
  );
  box(0.18, 0.2, 0.26, HAZ, [0.3, 2.34, 0.28]);
  glow(box(0.2, 0.03, 0.04, CYAN, [0.3, 2.45, 0.28]), 1.4);

  // ---------- bed ----------
  box(1.9, 0.12, 2.1, ARMOR, [0, 0.95, -1.45]);
  box(1.9, 0.35, 2.1, GUN, [0, 0.77, -1.45]);
  for (const s of [1, -1]) {
    box(0.1, 0.5, 2.1, BODY, [s * 0.95, 1.2, -1.45]);
    box(0.14, 0.05, 2.14, ARMOR, [s * 0.95, 1.46, -1.45]);
    for (let i = 0; i < 4; i++) box(0.12, 0.45, 0.06, ARMOR, [s * 0.97, 1.2, -2.2 + i * 0.6]);
  }
  box(1.9, 0.5, 0.1, BODY, [0, 1.2, -2.45]);
  box(1.94, 0.05, 0.14, ARMOR, [0, 1.46, -2.45]);
  decal(1.5, 0.375, TAIL_TEX, [0, 1.2, -2.506], [0, 0, -1]);
  glow(decal(1.5, 0.375, TAIL_TEX, [0, 1.2, -2.507], [0, 0, -1]), 0.9);
  // roll hoop behind cab
  for (const s of [1, -1]) b.rod([s * 0.9, 1.4, -0.65], [s * 0.9, 2.3, -0.65], 0.04, STEEL);
  b.rod([-0.9, 2.3, -0.65], [0.9, 2.3, -0.65], 0.04, STEEL);
  b.rod([-0.9, 1.5, -0.65], [0.9, 2.15, -0.65], 0.025, STEEL);
  b.rod([0.9, 1.5, -0.65], [-0.9, 2.15, -0.65], 0.025, STEEL);
  // crate with battery cells
  box(0.8, 0.5, 0.6, HAZ, [-0.45, 1.26, -2.05]);
  box(0.84, 0.06, 0.64, BLACK, [-0.45, 1.53, -2.05]);
  for (let i = 0; i < 3; i++) glow(box(0.16, 0.34, 0.02, i % 2 ? CYAN : MAG, [-0.65 + i * 0.2, 1.25, -1.745]), 1.4);
  // rocket pod: tilted tube bundle
  const base = -1.75;
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) {
      const x = 0.28 + (c - 1) * 0.0 + 0;
      const px = 0.2 + c * 0.2 - 0.0;
      const y0 = 1.1 + r * 0.19;
      b.rod([px, y0, base], [px, y0 + 0.45, base + 0.75], 0.075, GUN);
      glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), MAG, { at: [px, y0 + 0.455, base + 0.755], dir: [0, 0.45, 0.75] }), 1.5);
      void x;
    }
  b.rod([0.1, 1.0, base + 0.05], [0.1, 1.4, base - 0.05], 0.03, STEEL);
  b.rod([0.52, 1.0, base + 0.05], [0.52, 1.4, base - 0.05], 0.03, STEEL);
  box(0.62, 0.45, 0.06, ARMOR, [0.31, 1.33, base - 0.08], { rotation: [-28, 0, 0] });

  // ---------- rear main boosters ----------
  box(1.6, 0.5, 0.35, ARMOR, [0, 0.9, -2.68]);
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0.16, 0],
        [0.22, 0],
        [0.36, 0.3],
        [0.3, 0.3],
        [0.17, 0.05],
      ],
      { at: [s * 0.55, 0.9, -2.82], axis: [0, 0, -1], segments: 8, color: DARKMETAL },
    );
    glow(cyl(0.2, 0.2, 0.03, 8, CYAN, [s * 0.55, 0.9, -2.9], [0, 0, 1]), 2);
    glow(box(0.5, 0.04, 0.03, MAG, [s * 0.55, 0.68, -2.86]), 1.4);
  }

  // ---------- skids ----------
  for (const s of [1, -1]) {
    box(0.14, 0.07, 4.6, GUN, [s * 0.7, 0.035, 0.1]);
    box(0.14, 0.07, 0.3, GUN, [s * 0.7, 0.07, 2.5], { rotation: [-25, 0, 0] });
    for (const z of [1.5, -0.2, -1.8]) {
      b.rod([s * 0.7, 0.05, z], [s * 0.7, 0.6, z], 0.06, STEEL);
    }
  }

  // ---------- hover pods ----------
  const SHROUD: any[] = [
    [0.4, 0],
    [0.58, 0],
    [0.55, 0.15],
    [0.55, 0.4],
    [0.42, 0.4],
    [0.42, 0.12],
  ];
  const podAt: number[][] = [];
  for (const s of [1, -1])
    for (const z of [1.75, -1.55]) podAt.push([s * 1.5, 0.2, z]);
  podAt.forEach(([x, y, z], i) => {
    const s = Math.sign(x);
    b.lathe(SHROUD, { at: [x, y, z], segments: 10, color: ARMOR, smoothing: 0 });
    // inner glow disc and fan
    glow(cyl(0.41, 0.41, 0.02, 10, CYAN, [x, y + 0.06, z]), 1.8);
    cyl(0.07, 0.07, 0.14, 8, STEEL, [x, y + 0.2, z]);
    for (let k = 0; k < 6; k++) {
      const g = new THREE.BoxGeometry(0.36, 0.012, 0.09);
      g.rotateZ(0.35);
      g.translate(0.2, 0, 0);
      b.part(g, GUN, { at: [x, y + 0.2, z], rotation: [0, k * 60 + (i % 2) * 20, 0] });
    }
    // glow rim ring
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      glow(box(0.14, 0.03, 0.05, k % 2 ? MAG : CYAN, [x + Math.cos(a) * 0.56, y + 0.3, z + Math.sin(a) * 0.56], { rotation: [0, -(a * 180) / Math.PI + 90 - 90, 0] }), 1.4);
    }
    // mount arm to hull
    box(0.7, 0.14, 0.36, ARMOR, [s * 1.12, 0.52, z]);
    b.rod([s * 0.98, 1.0, z], [s * 1.42, 0.55, z], 0.05, STEEL);
    // gear cog detail on the arm
    b.part(gearGeometry({ teeth: 12, module: 0.012, bore: 0.01 }), BRASS, { at: [s * 1.12, 0.6, z + (z > 0 ? 0.19 : -0.19)], dir: [0, 0, z > 0 ? 1 : -1] });
    // intake fins on top
    for (const dz of [-0.18, 0, 0.18]) box(0.6, 0.03, 0.04, GUN, [x, y + 0.4, z + dz]);
    void R;
  });

  // ---------- underglow ----------
  glow(box(1.4, 0.02, 3.8, MAG, [0, 0.46, 0.05]), 1.0);

  return b.root;
}
