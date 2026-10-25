```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, resolve, mottle, stripes, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a rear-mounted elevated twin-rail railgun, glowing coils, capacitor bank and four deployed stabiliser legs.",
};

// ---------------------------------------------------------------- palette
const OLIVE = "#55633f";
const DARKOL = "#2f3828";
const TAN = "#8f7e57";
const STEEL = "#4a515c";
const GUN = "#2b3038";
const BLACK = "#16181c";
const YELLOW = "#e2b422";
const CYAN = "#58eaff";
const RED = "#d82f2f";
const AMBER = "#ffae2e";

const CAMO_BASE = mottle(OLIVE, DARKOL, { size: 0.75, seed: 3, contrast: 1.6 });
const CAMO = paint((p, n) => {
  let c = resolve(CAMO_BASE, p, n);
  c = mix(c, TAN, smoothstep(0.6, 0.72, noise(p, 0.55, 9)) * 0.9);
  c = mix(c, "#b9c4a0", smoothstep(0.3, 1, n.y) * 0.12);
  c = mix(c, "#6f6244", smoothstep(1.5, 0.9, p.y) * (0.35 + 0.5 * noise(p, 0.25, 4)));
  return c;
});
const GUNMETAL = paint((p, n) =>
  mix(mix("#2a2f36", "#505865", noise(p, 0.3, 21)), "#8a94a4", smoothstep(0.6, 1, n.y) * 0.25),
);
const TIRE = paint((p) => mix("#1a1b1e", "#4d4636", smoothstep(0.45, 0, p.y) * 0.6 * noise(p, 0.18, 4)));
const PADPAINT = stripes("#c9a21f", "#202020", { size: 0.14, axis: "x", width: 0.5, wobble: 0 });

// ---------------------------------------------------------------- textures
const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#2a2d33"/><circle cx="50" cy="50" r="44" fill="#6b727e"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#e2b422" stroke-width="3"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${50 + 29 * Math.cos((i * Math.PI) / 4)}" cy="${50 + 29 * Math.sin((i * Math.PI) / 4)}" r="4" fill="#1d2025"/>`).join("")}
  <circle cx="50" cy="50" r="17" fill="#3a3f48" stroke="#14161a" stroke-width="3"/><circle cx="50" cy="50" r="7" fill="#8a94a4"/></svg>`,
  { size: 128 },
);
const GLASS = svg(
  `<svg viewBox="0 0 200 80"><rect width="200" height="80" rx="6" fill="#101820"/><rect x="5" y="5" width="190" height="70" rx="4" fill="#1f4a62"/>
  <polygon points="20,75 60,5 85,5 45,75" fill="#9fd8ee" opacity="0.35"/><polygon points="95,75 135,5 150,5 110,75" fill="#9fd8ee" opacity="0.2"/>
  <rect x="97" y="3" width="6" height="74" fill="#101820"/><path d="M20 72 L90 40" stroke="#0a0a0a" stroke-width="2"/><path d="M110 40 L180 72" stroke="#0a0a0a" stroke-width="2"/></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 100 60"><rect width="100" height="60" rx="6" fill="#101820"/><polygon points="6,54 6,6 88,6 94,54" fill="#1f4a62"/>
  <polygon points="12,54 40,6 56,6 28,54" fill="#9fd8ee" opacity="0.3"/><rect x="48" y="4" width="4" height="52" fill="#101820"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 200 100"><rect width="200" height="100" rx="8" fill="#232a1d" opacity="0.85"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="#e2b422" stroke-width="5"/>
  <polygon points="50,20 56,40 77,40 60,52 67,72 50,59 33,72 40,52 23,40 44,40" fill="#e2b422"/>
  <text x="95" y="48" font-family="sans-serif" font-weight="bold" font-size="30" fill="#e8e8d8">RG-6</text>
  <rect x="95" y="58" width="95" height="6" fill="#e2b422"/><text x="95" y="86" font-family="sans-serif" font-size="14" fill="#e8e8d8">HYPERVELOCITY</text></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 120 60"><rect width="120" height="60" rx="5" fill="#e2b422" stroke="#111" stroke-width="4"/>
  <polygon points="22,8 12,34 22,34 16,54 36,24 26,24 32,8" fill="#111"/>
  <text x="44" y="28" font-family="sans-serif" font-weight="bold" font-size="14" fill="#111">HIGH</text>
  <text x="44" y="46" font-family="sans-serif" font-weight="bold" font-size="14" fill="#111">VOLTAGE</text></svg>`,
  { size: 192 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 100 60"><rect width="100" height="60" rx="4" fill="#06170f"/>
  <g stroke="#1f8a4c" stroke-width="1"><path d="M0 20H100M0 40H100M25 0V60M50 0V60M75 0V60"/></g>
  <circle cx="50" cy="30" r="24" fill="none" stroke="#3be07a" stroke-width="2"/><path d="M50 30 L72 16" stroke="#7dffae" stroke-width="3"/>
  <circle cx="38" cy="38" r="3" fill="#ff6a4a"/><circle cx="64" cy="42" r="2.5" fill="#ff6a4a"/></svg>`,
  { size: 128 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 160 60"><rect width="160" height="60" rx="4" fill="#15171b"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="8" y="${7 + i * 7}" width="144" height="3.5" fill="#59616d"/>`).join("")}
  <circle cx="80" cy="30" r="10" fill="#e2b422" stroke="#111" stroke-width="2"/><polygon points="80,23 82.5,29 89,29 84,33 86,39 80,35 74,39 76,33 71,29 77.5,29" fill="#111"/></svg>`,
  { size: 192 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e2b422"/>
  ${[-1, 0, 1, 2, 3].map((i) => `<polygon points="${i * 16},64 ${i * 16 + 8},64 ${i * 16 + 40},0 ${i * 16 + 32},0" fill="#16181c"/>`).join("")}</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const rand = rng(11);

  // ------------------------------------------------------------ skeleton
  const E = (8 * Math.PI) / 180;
  const D = [0, Math.sin(E), Math.cos(E)];
  const U = [0, Math.cos(E), -Math.sin(E)];
  const P = [0, 3.1, -0.5];
  const gp = (t: number, x = 0, u = 0): number[] => [x, P[1] + D[1] * t + U[1] * u, P[2] + D[2] * t + U[2] * u];

  const chassis = b.joint("chassis", { at: [0, 1.2, 0], role: "spine" });
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.4, -0.65], dir: [0, 1, 0], role: "hinge" });
  const gun = b.joint("gun", { parent: turret, at: P, dir: D, role: "hinge" });

  let BONE: any = chassis;
  const box = (sz: number[], color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), color, { at, bone: BONE, ...o });
  const cyl = (r: number, len: number, color: any, at: number[], dir: number[], o: any = {}, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir, bone: BONE, ...o });
  const onGun = (sz: number[], color: any, t: number, x = 0, u = 0) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), color, { at: gp(t, x, u), dir: D, axis: "z", bone: gun });

  // ------------------------------------------------------------ chassis frame
  BONE = chassis;
  for (const s of [1, -1]) box([0.3, 0.32, 8.8], GUNMETAL, [s * 0.75, 0.85, -0.1]);
  for (const z of [3.6, 2.2, 0.0, -1.2, -2.7, -4.0]) box([1.9, 0.24, 0.3], GUNMETAL, [0, 0.82, z]);
  // underbody armour
  box([1.6, 0.1, 6.2], BLACK, [0, 0.66, -0.4]);

  // hull and cab silhouettes
  b.extrude(
    [[-4.3, 1.0], [2.55, 1.0], [2.55, 1.9], [1.9, 2.2], [-3.6, 2.2], [-4.3, 1.8]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.04, color: CAMO, bone: chassis, name: "hull" },
  );
  b.extrude(
    [[2.5, 1.0], [4.25, 1.0], [4.25, 1.75], [3.85, 2.05], [3.4, 2.85], [2.5, 2.85]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.04, color: CAMO, bone: chassis, name: "cab" },
  );

  // hull side armour ribs & decals
  for (const s of [1, -1]) {
    box([0.06, 0.1, 1.2], STEEL, [s * 1.23, 1.97, -0.5]);
    box([0.06, 0.1, 3.2], STEEL, [s * 1.23, 1.15, -3.0]);
    b.part(new THREE.PlaneGeometry(1.5, 0.75), "#ffffff", {
      at: [s * 1.215, 1.55, -3.1], dir: [s, 0, 0], axis: "z", texture: EMBLEM, bone: chassis,
    });
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
      at: [s * 1.215, 1.7, -0.5], dir: [s, 0, 0], axis: "z", texture: WARN, bone: chassis,
    });
    // side windows
    b.part(new THREE.PlaneGeometry(1.0, 0.6), "#ffffff", {
      at: [s * 1.16, 2.38, 3.05], dir: [s, 0, 0], axis: "z", texture: SIDEWIN, bone: chassis,
    });
    // door seam + handle
    box([0.03, 0.9, 0.04], BLACK, [s * 1.16, 1.9, 2.55]);
    box([0.05, 0.06, 0.25], BLACK, [s * 1.17, 2.0, 3.2]);
    // mirrors
    b.rod([s * 1.15, 2.4, 3.55], [s * 1.5, 2.55, 3.6], 0.03, STEEL, { bone: chassis });
    box([0.1, 0.4, 0.26], BLACK, [s * 1.55, 2.5, 3.6]);
    // exhaust stacks
    cyl(0.11, 1.35, STEEL, [s * 1.0, 2.6, 2.3], [0, 1, 0], {}, 8);
    cyl(0.14, 0.12, BLACK, [s * 1.0, 3.3, 2.3], [0, 1, 0], {}, 8);
    cyl(0.16, 0.1, GUN, [s * 1.0, 2.0, 2.3], [0, 1, 0], {}, 8);
    // headlights and taillights
    glow(box([0.4, 0.2, 0.08], "#fff2b0", [s * 0.85, 1.55, 4.27]), 1.6);
    glow(box([0.3, 0.14, 0.06], RED, [s * 0.9, 1.4, -4.33]), 1.4);
    box([0.5, 0.06, 0.1], BLACK, [s * 0.85, 1.7, 4.28]);
    // tow hooks
    box([0.12, 0.12, 0.3], STEEL, [s * 0.8, 1.05, 4.4]);
    // cab roof lights
    glow(box([0.2, 0.12, 0.12], AMBER, [s * 0.7, 2.93, 3.25]), 1.4);
  }

  // cab front details
  b.part(new THREE.PlaneGeometry(1.2, 0.45), "#ffffff", { at: [0, 1.38, 4.265], dir: [0, 0, 1], axis: "z", texture: GRILLE, bone: chassis });
  b.part(new THREE.PlaneGeometry(2.0, 0.8), "#ffffff", { at: [0, 2.456, 3.637], dir: [0, 0.49, 0.87], axis: "z", texture: GLASS, bone: chassis });
  b.part(new THREE.BoxGeometry(2.6, 0.34, 0.3), "#ffffff", { at: [0, 1.15, 4.4], texture: HAZARD, bone: chassis });
  b.part(new THREE.BoxGeometry(2.6, 0.3, 0.3), "#ffffff", { at: [0, 1.15, -4.4], texture: HAZARD, bone: chassis });
  box([2.0, 0.1, 0.5], STEEL, [0, 2.9, 3.4]); // roof visor
  box([1.9, 0.08, 0.5], GUN, [0, 2.9, 3.4]);
  glow(box([1.2, 0.08, 0.1], AMBER, [0, 2.97, 3.35]), 1.3);
  // sensor mast with radar dish
  cyl(0.04, 0.7, STEEL, [-0.7, 3.2, 2.85], [0, 1, 0], {}, 6);
  b.lathe([[0, 0], [0.32, 0.12], [0.32, 0.15], [0, 0.04]], {
    at: [-0.7, 3.55, 2.85], axis: [0, 0.5, 0.85], segments: 10, color: "#b9c0cc", bone: chassis,
  });
  cyl(0.03, 0.2, STEEL, [-0.7, 3.62, 2.95], [0, 0.5, 0.85], {}, 6);
  // whip antennas
  for (const s of [1, -1]) {
    b.rod([s * 1.05, 2.2, -3.9], [s * 1.25, 4.1, -4.1], [0.025, 0.01], BLACK, { bone: chassis });
    cyl(0.06, 0.1, STEEL, [s * 1.05, 2.2, -3.9], [0, 1, 0], {}, 6);
  }

  // deck details
  for (const [x, z] of [[0.9, 1.0], [-0.9, 1.0]]) {
    cyl(0.28, 0.08, STEEL, [x, 2.24, z], [0, 1, 0], {}, 8);
    cyl(0.1, 0.1, GUN, [x, 2.3, z], [0, 1, 0], {}, 6);
  }
  box([0.8, 0.1, 0.6], GUN, [-0.5, 2.25, 1.2]);
  for (let i = 0; i < 5; i++) box([0.7, 0.04, 0.05], BLACK, [-0.5, 2.31, 1.02 + i * 0.1]);
  // hand-rail posts on deck rear
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 2.2, -3.55], [s * 1.1, 2.7, -3.55], 0.03, YELLOW, { bone: chassis });
    b.rod([s * 1.1, 2.7, -3.55], [s * 1.1, 2.7, -1.0], 0.03, YELLOW, { bone: chassis });
    b.rod([s * 1.1, 2.7, -1.0], [s * 1.1, 2.2, -1.0], 0.03, YELLOW, { bone: chassis });
  }
  // rear ladder
  for (const s of [1, -1]) b.rod([s * 0.3, 1.0, -4.32], [s * 0.3, 2.1, -4.32], 0.03, STEEL, { bone: chassis });
  for (let i = 0; i < 5; i++) b.rod([-0.3, 1.2 + i * 0.2, -4.32], [0.3, 1.2 + i * 0.2, -4.32], 0.025, STEEL, { bone: chassis });
  box([0.3, 0.2, 0.3], STEEL, [0, 0.95, -4.45]); // hitch

  // ------------------------------------------------------------ wheels
  const AX = [3.2, 0.9, -1.9];
  const AXN = ["F", "M", "R"];
  const WR = 0.65;
  const WX = 1.45;
  AX.forEach((z, i) => {
    BONE = chassis;
    cyl(0.12, 3.0, GUN, [0, WR, z], [1, 0, 0], {}, 8);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), STEEL, { at: [0, WR, z], bone: chassis });
    b.rod([-0.7, 0.9, z], [-0.7, 0.8, z + 0.45], 0.06, STEEL, { bone: chassis });
    for (const s of [1, -1]) {
      b.rod([s * 0.7, 0.9, z], [s * 1.25, 0.7, z], 0.07, STEEL, { bone: chassis });
      const w = b.joint(`wheel${AXN[i]}${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * WX, WR, z], dir: [s, 0, 0] });
      BONE = w;
      const c = [s * WX, WR, z];
      cyl(0.65, 0.5, TIRE, c, [1, 0, 0], {}, 14);
      cyl(0.44, 0.52, STEEL, c, [1, 0, 0], {}, 12);
      cyl(0.2, 0.6 + 0.04, GUN, c, [1, 0, 0], {}, 8);
      b.part(new THREE.CircleGeometry(0.44, 16), "#ffffff", {
        at: [s * (WX + 0.265), WR, z], dir: [s, 0, 0], axis: "z", texture: HUB, bone: w,
      });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        box([0.54, 0.1, 0.22], BLACK, [c[0], WR + 0.67 * Math.cos(a), z + 0.67 * Math.sin(a)], {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      // fender + skirt
      BONE = chassis;
      box([0.8, 0.08, 1.55], CAMO, [s * WX, 1.43, z]);
      box([0.08, 0.34, 1.55], CAMO, [s * (WX + 0.4), 1.28, z]);
      box([0.8, 0.07, 0.3], CAMO, [s * WX, 1.3, z + 0.82], { rotation: [-35, 0, 0] });
      box([0.8, 0.07, 0.3], CAMO, [s * WX, 1.3, z - 0.82], { rotation: [35, 0, 0] });
      // mud flap
      box([0.7, 0.4, 0.04], BLACK, [s * WX, 0.8, z - 0.82]);
    }
  });

  // ------------------------------------------------------------ stabilisers
  for (const zi of [1.9, -3.4]) {
    for (const s of [1, -1]) {
      const tag = `${zi > 0 ? "F" : "R"}${s > 0 ? "L" : "R"}`;
      const leg = b.joint(`stab${tag}`, { parent: chassis, at: [s * 1.1, 1.3, zi], dir: [s, 0, 0], role: "leg" });
      const pad = b.joint(`stabPad${tag}`, { parent: leg, at: [s * 2.5, 0.9, zi], dir: [0, -1, 0], role: "leg" });
      BONE = leg;
      box([1.5, 0.3, 0.36], GUNMETAL, [s * 1.85, 1.3, zi]);
      box([0.5, 0.34, 0.4], YELLOW, [s * 2.55, 1.3, zi]);
      b.rod([s * 1.1, 1.05, zi], [s * 2.5, 0.8, zi], 0.07, STEEL, { bone: leg });
      cyl(0.18, 0.8, GUN, [s * 2.5, 1.0, zi], [0, 1, 0], {}, 8);
      cyl(0.22, 0.1, STEEL, [s * 2.5, 1.45, zi], [0, 1, 0], {}, 8);
      BONE = pad;
      cyl(0.1, 0.8, "#aab2bf", [s * 2.5, 0.55, zi], [0, 1, 0], {}, 8);
      b.part(new THREE.SphereGeometry(0.17, 6, 5), STEEL, { at: [s * 2.5, 0.28, zi], bone: pad });
      b.part(new THREE.CylinderGeometry(0.5, 0.56, 0.24, 8), PADPAINT, { at: [s * 2.5, 0.12, zi], bone: pad });
      cyl(0.3, 0.06, GUN, [s * 2.5, 0.27, zi], [0, 1, 0], {}, 8);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        box([0.06, 0.2, 0.3], STEEL, [s * 2.5 + 0.28 * Math.cos(a), 0.34, zi + 0.28 * Math.sin(a)], {
          rotation: [0, (-a * 180) / Math.PI + 90, 0],
        });
      }
    }
  }

  // ------------------------------------------------------------ turret
  BONE = turret;
  cyl(1.05, 0.2, GUN, [0, 2.3, -0.65], [0, 1, 0], {}, 16);
  cyl(1.12, 0.06, YELLOW, [0, 2.22, -0.65], [0, 1, 0], {}, 16);
  b.extrude(
    [[-2.2, 2.4], [0.9, 2.4], [0.9, 2.7], [-2.2, 2.7]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: CAMO, bone: turret, name: "turretBase" },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [[-2.0, 2.6], [0.7, 2.6], [0.7, 3.2], [0.2, 3.6], [-1.6, 3.6], [-2.0, 3.2]],
      { at: [s * 0.78, 0, 0], x: [0, 0, 1], thickness: 0.3, bevel: 0.03, color: CAMO, bone: turret, name: "cheek" },
    );
    cyl(0.24, 0.2, STEEL, [s * 1.0, 3.1, -0.5], [1, 0, 0], {}, 8);
    cyl(0.12, 0.26, YELLOW, [s * 1.1, 3.1, -0.5], [1, 0, 0], {}, 6);
    // armour plates on cheeks
    box([0.06, 0.5, 1.1], STEEL, [s * 0.96, 3.1, -1.2]);
    // optics
    box([0.22, 0.28, 0.4], GUN, [s * 0.5, 3.75, 0.1]);
    glow(cyl(0.07, 0.04, CYAN, [s * 0.5, 3.75, 0.32], [0, 0, 1], {}, 8), 1.5);
    b.rod([s * 0.5, 3.6, 0.1], [s * 0.5, 3.72, 0.1], 0.06, STEEL, { bone: turret });
    // smoke dischargers
    for (let k = 0; k < 3; k++) cyl(0.06, 0.28, BLACK, [s * 0.85, 2.95, 0.88 - k * 0.02], [0, 0.6, 0.8], { at: [s * (0.7 + k * 0.12), 2.95, 0.9] }, 6);
  }
  glow(
    b.part(new THREE.PlaneGeometry(0.55, 0.33), "#ffffff", { at: [0.945, 3.1, -1.4], dir: [1, 0, 0], axis: "z", texture: SCREEN, bone: turret }),
    1.1,
  );
  box([1.7, 0.8, 0.5], CAMO, [0, 3.2, -2.05]); // breech housing
  box([1.5, 0.12, 0.4], STEEL, [0, 3.62, -2.05]);
  glow(box([1.2, 0.05, 0.05], CYAN, [0, 3.2, -1.78]), 1.6);
  // bolts on housing
  for (let k = 0; k < 6; k++) cyl(0.04, 0.05, BLACK, [-0.65 + k * 0.26, 3.45, -2.32], [0, 0, 1], {}, 6);

  // ------------------------------------------------------------ capacitor bank
  BONE = chassis;
  for (const x of [0.45, -0.45])
    for (const z of [-2.85, -3.4]) {
      cyl(0.25, 1.0, "#2e4a66", [x, 2.7, z], [0, 1, 0], {}, 10);
      cyl(0.2, 0.08, STEEL, [x, 3.23, z], [0, 1, 0], {}, 8);
      cyl(0.28, 0.06, GUN, [x, 2.25, z], [0, 1, 0], {}, 10);
      for (const y of [2.5, 2.9]) glow(cyl(0.265, 0.08, CYAN, [x, y, z], [0, 1, 0], {}, 10), 1.7);
      b.sweep(
        catmull([[x, 3.27, z], [x, 3.65, z + 0.25 + rand() * 0.05], [x * 0.55, 3.7, -2.3], [x * 0.5, 3.5, -2.1]]),
        0.035,
        { color: BLACK, bone: chassis },
      );
    }

  // ------------------------------------------------------------ railgun
  box([1.0, 0.62, 1.0], STEEL, [0, 0, 0], { at: gp(0.2), dir: D, axis: "z", bone: gun });
  onGun([0.9, 0.4, 0.14], YELLOW, 0.75);
  for (const s of [1, -1]) {
    b.frustumBox(gp(-1.2, s * 0.28), gp(6.2, s * 0.28), [0.24, 0.34], [0.24, 0.34], { color: GUNMETAL, bone: gun, name: "rail" });
    onGun([0.04, 0.16, 5.6], CYAN, 3.4, s * 0.15).mesh && glow(onGun([0.03, 0.14, 5.6], CYAN, 3.4, s * 0.15), 2);
    for (let k = 0; k < 9; k++) glow(onGun([0.05, 0.2, 0.3], CYAN, 1.2 + k * 0.62, s * 0.42), 1.6);
    onGun([0.3, 0.08, 6.0], STEEL, 3.0, s * 0.28, 0.2); // top guard
  }
  // clamps
  for (let k = 0; k < 6; k++) {
    const t = 0.9 + k * 1.0;
    onGun([0.95, 0.12, 0.2], k % 2 ? STEEL : GUN, t, 0, 0.23);
    onGun([0.95, 0.12, 0.2], k % 2 ? STEEL : GUN, t, 0, -0.23);
    onGun([0.2, 0.5, 0.2], BLACK, t, 0, 0);
    onGun([0.96, 0.54, 0.05], YELLOW, t - 0.14, 0, 0);
  }
  // muzzle
  onGun([1.0, 0.6, 0.22], BLACK, 6.2);
  onGun([0.96, 0.08, 0.3], STEEL, 6.34, 0, 0.3);
  onGun([0.96, 0.08, 0.3], STEEL, 6.34, 0, -0.3);
  glow(onGun([0.36, 0.14, 0.04], CYAN, 6.33), 2.2);
  // breech block
  onGun([0.9, 0.55, 0.5], GUN, -1.3);
  glow(onGun([0.5, 0.05, 0.05], CYAN, -1.05, 0, 0.3), 1.6);

  return b.root;
}
```