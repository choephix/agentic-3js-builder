import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, smoothstep, mottle, countershade, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a twin-rail electromagnetic cannon, capacitor banks and four deployed stabiliser outriggers.",
};

// ---------- palette ----------
const OLIVE = "#5d6b3b";
const OLIVE_L = "#7a8a4c";
const OLIVE_D = "#323b22";
const DARK = "#24282a";
const GUN = "#3a3f44";
const YELLOW = "#e2b11f";
const RED = "#b3261e";
const CYAN = "#58e6ff";
const ORANGE = "#ff8a2a";
const RUBBER = "#1b1b1e";
const TAN = "#b9a67a";

// ---------- paints ----------
const HULL = countershade(mottle(OLIVE, OLIVE_L, { size: 0.7, contrast: 0.9, seed: 3 }), OLIVE_D, {
  level: -0.5,
  soft: 0.4,
});
const STEEL = metal("steel", { tarnish: 0.3, polish: 0.3 });
const IRON = metal("iron");
const TYRE = paint((p, n) => {
  const mud = smoothstep(0.55, 0.05, p.y) * (0.5 + 0.5 * noise(p, 0.25, 4));
  const base = mix("#1b1b1e", "#2a2a2e", noise(p, 0.1, 2));
  return mix(base, "#5a4a30", Math.min(1, mud * 0.9) * (n.y > 0.9 ? 0.6 : 1));
});

// ---------- textures ----------
const GLASS = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd0e0"/><stop offset="1" stop-color="#16303a"/></linearGradient></defs>
  <rect width="100" height="50" fill="#14181a"/><rect x="3" y="3" width="94" height="44" rx="4" fill="url(#g)"/>
  <path d="M10 47 L38 3 L50 3 L22 47Z" fill="#ffffff" opacity="0.22"/><path d="M56 47 L76 3 L82 3 L62 47Z" fill="#ffffff" opacity="0.15"/>
  <line x1="50" y1="3" x2="50" y2="47" stroke="#14181a" stroke-width="2.5"/></svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 90 30" xmlns="http://www.w3.org/2000/svg"><rect width="90" height="30" fill="#15191a"/>
  ${[4, 9, 14, 19, 24].map((y) => `<rect x="4" y="${y}" width="82" height="2.6" fill="#6b747a"/>`).join("")}
  <rect x="1" y="1" width="88" height="28" fill="none" stroke="#9aa3a8" stroke-width="2"/>
  <path d="M45 6 L48 13 L55 13 L49 17 L51 24 L45 20 L39 24 L41 17 L35 13 L42 13Z" fill="#b3261e"/></svg>`,
  { size: 256 },
);
const CHEVRON = svg(
  `<svg viewBox="0 0 80 20" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="20" fill="#e2b11f"/>
  ${[-10, 6, 22, 38, 54, 70].map((x) => `<polygon points="${x},20 ${x + 8},20 ${x + 18},0 ${x + 10},0" fill="#1c1c1c"/>`).join("")}
  <rect x="1" y="1" width="78" height="18" fill="none" stroke="#1c1c1c" stroke-width="2"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="#1d2218" stroke="#d8cfa6" stroke-width="3"/>
  <path d="M32 9 L38 26 L56 26 L42 36 L47 54 L32 43 L17 54 L22 36 L8 26 L26 26Z" fill="#d8cfa6"/>
  <path d="M4 32 H20 M44 32 H60" stroke="#58e6ff" stroke-width="3"/>
  <circle cx="32" cy="32" r="6" fill="#b3261e" stroke="#1d2218" stroke-width="2"/></svg>`,
  { size: 192 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 128 40" xmlns="http://www.w3.org/2000/svg">
  <text x="64" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#12140e" stroke="#12140e" stroke-width="3">RG-6</text>
  <text x="64" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#ece6c6">RG-6</text>
  <rect x="8" y="32" width="112" height="3" fill="#ece6c6"/><rect x="8" y="4" width="30" height="3" fill="#ece6c6"/><rect x="90" y="4" width="30" height="3" fill="#ece6c6"/></svg>`,
  { size: 256 },
);
const WHEEL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#5a6168"/><circle cx="50" cy="50" r="42" fill="#7b848c" stroke="#2a2e32" stroke-width="3"/>
  <circle cx="50" cy="50" r="30" fill="#40464c" stroke="#2a2e32" stroke-width="2"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${50 + 22 * Math.cos((i * Math.PI) / 3)}" cy="${50 + 22 * Math.sin((i * Math.PI) / 3)}" r="4.5" fill="#15181a"/>`).join("")}
  <circle cx="50" cy="50" r="10" fill="#e2b11f" stroke="#2a2e32" stroke-width="2.5"/></svg>`,
  { size: 192 },
);
const VENT = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#1a1d1e"/>
  ${[5, 12, 19, 26, 33].map((y) => `<rect x="4" y="${y}" width="52" height="3.5" fill="#566066"/>`).join("")}
  <rect x="1.5" y="1.5" width="57" height="37" fill="none" stroke="#7d878d" stroke-width="3"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier", paintSize: 2048 });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opt });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir, flat: true });
  const sph = (r: number, color: any, at: number[]) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at, flat: true });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, up });
  const bolts = (pts: number[][], r = 0.035, color: any = GUN) => pts.forEach((p) => sph(r, color, p));

  // ---------- hull ----------
  const profile: [number, number][] = [
    [-4.6, 0.85], [4.7, 0.85], [4.7, 1.7], [3.9, 2.1], [3.3, 2.9],
    [2.2, 2.9], [2.0, 2.3], [-4.4, 2.3], [-4.6, 2.0],
  ];
  b.extrude(profile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, bevel: 0.06, color: HULL });
  box(2.4, 0.3, 8.6, DARK, [0, 0.72, 0]); // underbody
  box(1.2, 0.18, 3, IRON, [0, 0.55, 0.5]); // belly armour

  // windscreen + cab windows
  decal(GLASS, 2.3, 1.0, [0, 2.52, 3.62], [0, 0.6, 0.8]);
  box(2.5, 0.08, 0.1, DARK, [0, 2.97, 3.1]);
  for (const s of [1, -1]) {
    decal(GLASS, 1.1, 0.5, [s * 1.311, 2.55, 2.85], [s, 0, 0]);
    box(0.08, 0.1, 1.3, DARK, [s * 1.31, 2.25, 2.85]);
  }
  // front: grille, lights, bumper, winch
  decal(GRILLE, 1.9, 0.62, [0, 1.28, 4.72], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(box(0.45, 0.2, 0.08, "#fff2b0", [s * 1.0, 1.35, 4.73]), 1.4);
    box(0.55, 0.3, 0.06, DARK, [s * 1.0, 1.35, 4.71]);
    glow(box(0.14, 0.14, 0.06, ORANGE, [s * 1.22, 1.0, 4.9]), 1.2);
    cyl(0.09, 0.09, 0.14, 6, STEEL, [s * 0.55, 0.9, 4.95], [0, 0, 1]); // tow hooks
    sph(0.1, STEEL, [s * 0.55, 0.9, 5.04]);
  }
  box(2.9, 0.3, 0.4, GUN, [0, 0.98, 4.9]);
  decal(CHEVRON, 2.6, 0.2, [0, 0.98, 5.101], [0, 0, 1]);
  cyl(0.16, 0.16, 1.2, 8, DARK, [0, 0.98, 4.5], [1, 0, 0]);
  // hood vents and roof gear
  decal(VENT, 1.2, 0.5, [0, 1.95, 4.2], [0, 0.45, 0.9]);
  glow(box(1.5, 0.08, 0.1, ORANGE, [0, 3.0, 3.25]), 1.1); // light bar
  box(0.5, 0.4, 0.5, GUN, [-0.8, 3.1, 2.6]);
  const dome = b.lathe([[0, 0], [0.3, 0], [0.34, 0.1], [0.24, 0.3], [0, 0.36]], { at: [-0.8, 3.3, 2.6], color: TAN, segments: 8 });
  void dome;
  b.rod([0.7, 2.9, 2.5], [0.7, 4.0, 2.4], 0.025, STEEL);
  b.rod([0.95, 2.9, 2.5], [0.95, 3.6, 2.45], 0.02, STEEL);
  sph(0.05, RED, [0.7, 4.02, 2.4]);
  cyl(0.18, 0.22, 0.2, 8, GUN, [0.8, 3.0, 2.6]); // searchlight
  glow(cyl(0.15, 0.15, 0.04, 8, "#fff2b0", [0.8, 3.05, 2.75], [0, 0.4, 1]), 1.3);
  glow(cyl(0.1, 0.1, 0.12, 8, ORANGE, [0.2, 2.96, 2.5]), 1.3);

  // side armour panels with bolts and decals
  for (const s of [1, -1]) {
    const x = s * 1.36;
    for (const z of [-3.4, -1.2, 0.9]) {
      box(0.12, 0.7, 1.8, HULL, [x, 1.8, z]);
      bolts(
        [[-0.8, -0.28], [0.8, -0.28], [-0.8, 0.28], [0.8, 0.28]].map(([dz, dy]) => [s * 1.43, 1.8 + dy, z + dz]),
      );
      box(0.04, 0.05, 1.7, DARK, [s * 1.425, 1.8, z]); // seam
    }
    decal(EMBLEM, 0.6, 0.6, [s * 1.441, 1.8, -3.4], [s, 0, 0]);
    decal(STENCIL, 1.4, 0.44, [s * 1.441, 1.8, -1.2], [s, 0, 0]);
    decal(CHEVRON, 1.5, 0.3, [s * 1.441, 1.8, 0.9], [s, 0, 0]);
    box(0.14, 0.32, 0.9, GUN, [s * 1.37, 1.55, 3.2]); // cab step plate
  }

  // rear deck gear
  decal(VENT, 1.6, 1.0, [0, 2.311, -3.7], [0, 1, 0], [0, 0, 1]);
  cyl(0.38, 0.38, 0.12, 10, GUN, [-0.55, 2.36, 1.2]);
  cyl(0.28, 0.28, 0.16, 10, DARK, [-0.55, 2.42, 1.2]);
  box(0.9, 0.35, 0.7, OLIVE_D, [0.7, 2.47, 1.3]);
  box(0.94, 0.06, 0.74, GUN, [0.7, 2.67, 1.3]);
  for (const s of [1, -1]) {
    cyl(0.1, 0.12, 0.9, 6, STEEL, [s * 1.1, 2.75, -4.3]); // exhaust stacks
    cyl(0.14, 0.14, 0.08, 6, DARK, [s * 1.1, 3.22, -4.3]);
    box(0.1, 0.4, 1.1, DARK, [s * 1.0, 2.5, -2.3 + 0]);
  }
  // rear bumper, lights, ladder, hitch
  box(2.9, 0.3, 0.35, GUN, [0, 1.0, -4.75]);
  decal(CHEVRON, 2.6, 0.2, [0, 1.0, -4.926], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.2, 0.06, RED, [s * 1.0, 1.65, -4.63]), 1.2);
    b.rod([s * 0.4, 0.95, -4.7], [s * 0.4, 2.2, -4.7], 0.03, STEEL);
  }
  for (let i = 0; i < 5; i++) b.rod([-0.4, 1.2 + i * 0.25, -4.7], [0.4, 1.2 + i * 0.25, -4.7], 0.025, STEEL);
  box(0.3, 0.2, 0.3, IRON, [0, 0.8, -4.9]);

  // ---------- wheels ----------
  for (const z of [3.1, 0.6, -1.9]) {
    cyl(0.1, 0.1, 3.3, 8, IRON, [0, 0.65, z], [1, 0, 0]); // axle
    sph(0.28, IRON, [0, 0.65, z]); // differential
    for (const s of [1, -1]) {
      const cx = s * 1.6;
      b.part(new THREE.CylinderGeometry(0.65, 0.65, 0.5, 14), TYRE, { at: [cx, 0.65, z], dir: [1, 0, 0], flat: true });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        box(0.52, 0.1, 0.17, RUBBER, [cx, 0.65 + 0.67 * Math.cos(a), z + 0.67 * Math.sin(a)], {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      cyl(0.42, 0.42, 0.54, 10, STEEL, [cx, 0.65, z], [1, 0, 0]);
      b.part(new THREE.CircleGeometry(0.4, 12), "#ffffff", {
        at: [s * 1.875, 0.65, z], dir: [s, 0, 0], axis: "z", texture: WHEEL,
      });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.04, 0.04, 0.05, 6, GUN, [s * 1.9, 0.65 + 0.3 * Math.cos(a), z + 0.3 * Math.sin(a)], [s, 0, 0]);
      }
      cyl(0.09, 0.09, 0.06, 6, YELLOW, [s * 1.9, 0.65, z], [s, 0, 0]);
      cyl(0.03, 0.03, 0.12, 5, DARK, [s * 1.9, 0.98, z + 0.2]); // valve stem
      // fender, mudguard, wheel-arch trim
      box(0.8, 0.1, 1.55, HULL, [s * 1.6, 1.38, z]);
      box(0.08, 0.3, 1.55, OLIVE_D, [s * 1.98, 1.25, z]);
      box(0.7, 0.4, 0.06, RUBBER, [s * 1.6, 0.3, z - 0.78 + (z < -1 ? -0.0 : 0)]);
      bolts([[-0.65], [0.65]].map(([dz]) => [s * 1.8, 1.45, z + dz]), 0.03);
    }
  }

  // ---------- stabiliser outriggers ----------
  for (const s of [1, -1]) {
    for (const z of [1.85, -3.6]) {
      box(1.35, 0.3, 0.4, GUN, [s * 1.9, 1.55, z]); // arm
      decal(CHEVRON, 1.15, 0.22, [s * 1.9, 1.55, z + 0.201], [0, 0, 1]);
      cyl(0.2, 0.2, 0.5, 8, DARK, [s * 1.3, 1.55, z], [0, 0, 1]); // hinge
      b.rod([s * 2.5, 1.7, z], [s * 2.65, 0.75, z], 0.17, GUN); // sleeve
      b.rod([s * 2.65, 0.95, z], [s * 2.75, 0.25, z], 0.1, STEEL); // piston
      b.rod([s * 1.3, 1.25, z], [s * 2.62, 0.85, z], 0.07, IRON); // brace
      b.rod([s * 1.55, 1.9, z + 0.0], [s * 2.5, 1.75, z], 0.06, STEEL); // hydraulic ram
      sph(0.15, STEEL, [s * 2.75, 0.28, z]);
      cyl(0.5, 0.55, 0.2, 8, RUBBER, [s * 2.75, 0.1, z]); // pad
      cyl(0.4, 0.4, 0.05, 8, YELLOW, [s * 2.75, 0.22, z]);
      glow(sph(0.05, ORANGE, [s * 2.52, 1.8, z + 0.2]), 1.4); // lock light
      bolts([[1.4], [2.3]].map(([x]) => [s * x, 1.72, z + 0.2]), 0.035);
    }
  }

  // ---------- railgun ----------
  const TZ = -1.0;
  b.lathe([[0, 0], [1.25, 0], [1.25, 0.15], [1.1, 0.3], [0, 0.3]], {
    at: [0, 2.3, TZ], color: IRON, segments: 14,
  });
  b.extrude(
    [[-1.3, 0], [1.3, 0], [1.3, 0.45], [0.9, 0.75], [-0.9, 0.75], [-1.4, 0.4]],
    { at: [0, 2.6, TZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bevel: 0.05, color: HULL },
  );
  for (const s of [1, -1]) {
    box(0.22, 0.7, 2.2, GUN, [s * 0.85, 3.4, TZ]); // cradle cheeks
    bolts([[-0.9], [0], [0.9]].map(([dz]) => [s * 0.97, 3.55, TZ + dz]));
    cyl(0.2, 0.2, 0.3, 8, STEEL, [s * 0.95, 3.4, TZ], [1, 0, 0]); // trunnions
  }
  const RY = 3.6;
  box(1.4, 0.9, 1.0, GUN, [0, RY, -2.9]); // breech
  box(1.0, 0.2, 0.7, IRON, [0, RY + 0.55, -2.9]);
  glow(box(0.5, 0.1, 0.5, CYAN, [0, RY + 0.66, -2.9]), 1.3);
  for (const s of [1, -1]) {
    box(0.22, 0.34, 8.8, STEEL, [s * 0.3, RY, 1.8]); // rails
    glow(box(0.03, 0.14, 8.6, CYAN, [s * 0.175, RY, 1.8]), 1.6);
    box(0.06, 0.06, 8.6, IRON, [s * 0.42, RY + 0.12, 1.8]);
    box(0.3, 0.36, 0.25, GUN, [s * 0.3, RY, 6.25]); // muzzle block
  }
  box(1.0, 0.1, 0.3, GUN, [0, RY + 0.22, 6.25]);
  for (let i = 0; i < 9; i++) {
    const z = -0.2 + i * 0.75;
    box(1.1, 0.12, 0.24, GUN, [0, RY + 0.24, z]);
    box(1.1, 0.12, 0.24, GUN, [0, RY - 0.24, z]);
    for (const s of [1, -1]) {
      box(0.1, 0.62, 0.24, DARK, [s * 0.52, RY, z]);
      glow(box(0.06, 0.2, 0.26, i % 2 ? CYAN : ORANGE, [s * 0.54, RY, z]), 1.5);
    }
    bolts([[-0.45], [0.45]].map(([x]) => [x, RY + 0.31, z]), 0.03);
  }
  // muzzle brake with slots
  for (let i = 0; i < 3; i++) box(1.0, 0.5, 0.06, DARK, [0, RY, 6.5 + i * 0.12]);
  glow(box(0.3, 0.2, 0.04, CYAN, [0, RY, 6.5]), 1.5);

  // capacitor banks + cables
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 1.9, 10, OLIVE_D, [s * 1.15, 3.05, TZ - 0.2], [0, 0, 1]);
    for (const dz of [-0.7, 0, 0.7]) cyl(0.32, 0.32, 0.08, 10, YELLOW, [s * 1.15, 3.05, TZ - 0.2 + dz], [0, 0, 1]);
    for (const e of [-1, 1]) glow(cyl(0.2, 0.2, 0.05, 8, CYAN, [s * 1.15, 3.05, TZ - 0.2 + e * 0.97], [0, 0, 1]), 1.5);
    box(0.5, 0.35, 0.3, GUN, [s * 1.0, 2.85, TZ + 0.45]); // bracket
    box(0.5, 0.35, 0.3, GUN, [s * 1.0, 2.85, TZ - 0.85]);
    const cable = [
      [s * 1.15, 3.1, -2.2], [s * 0.9, 3.5, -2.5], [s * 0.6, 3.7, -2.75], [s * 0.35, 3.85, -2.9],
    ];
    b.sweep(polyline(cable), 0.05, { color: DARK, sides: 6 });
  }

  // turret hatch, sensor, ammo rack
  cyl(0.3, 0.3, 0.1, 8, GUN, [-0.5, 3.4, TZ - 0.2]);
  box(0.5, 0.25, 0.5, OLIVE_D, [0.5, 3.45, TZ - 0.5]);
  decal(EMBLEM, 0.3, 0.3, [0.5, 3.58, TZ - 0.5], [0, 1, 0], [0, 0, 1]);
  glow(cyl(0.05, 0.05, 0.1, 6, RED, [-0.5, 3.5, TZ - 0.2]), 1.3);

  return b.root;
}
