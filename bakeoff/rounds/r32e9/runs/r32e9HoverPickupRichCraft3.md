```ts
import * as THREE from "three";
import { createBuilder, paint, patches, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Ares-7 Militarized Pickup",
  description:
    "Low-poly cyberpunk militarized pickup truck whose wheels were replaced by four glowing turbine hover thrusters, with camo plating, pintle gun, neon underglow and decals.",
};

// ---------------------------------------------------------------- palette
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const YELLOW = "#ffd52b";
const RED = "#ff2a4a";
const DARK = "#161a21";
const GLASS = "#0b2536";
const WHITE_HOT = "#e8ffff";

const CAMO = patches("#2f3829", ["#4d5b3a", "#3e4a30", "#5a6342"], { size: 0.5, gap: 0.05 });
const PLATED = panelled(CAMO, { size: 0.55, aspect: 0.5, rivets: 0.1 });
const HULL = paint((p) => (p.y < 0.95 ? "#23262b" : PLATED));
const IRON = metal("iron", { tarnish: 0.5 });
const STEEL = metal("steel", { tarnish: 0.3 });
const POD = panelled(metal("iron", { polish: 0.2 }), { size: 0.3, rivets: 0.06 });

// ---------------------------------------------------------------- textures
const star = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 17 : 38;
    const a = (i * Math.PI) / 5;
    pts.push(`${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`);
  }
  return pts.join(" ");
})();
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#161a21" stroke="#e9e2c4" stroke-width="5"/>
   <circle cx="50" cy="50" r="38" fill="none" stroke="#19f0ff" stroke-width="2"/>
   <polygon points="${star}" fill="#e9e2c4" stroke="#161a21" stroke-width="1.5"/>
   <rect x="44" y="44" width="12" height="12" fill="#ff2bd6"/></svg>`,
  { size: 128 },
);

const hazardBars = Array.from(
  { length: 11 },
  (_, i) => `<polygon points="${i * 16 - 10},20 ${i * 16 - 2},20 ${i * 16 + 10},0 ${i * 16 + 2},0" fill="#ffd52b"/>`,
).join("");
const HAZARD = svg(`<svg viewBox="0 0 160 20"><rect width="160" height="20" fill="#14161b"/>${hazardBars}</svg>`, {
  size: 256,
});

const PLATE = svg(
  `<svg viewBox="0 0 120 40"><rect x="1" y="1" width="118" height="38" rx="5" fill="#0b0f14" stroke="#19f0ff" stroke-width="3"/>
   <text x="60" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#19f0ff">NX-7734</text></svg>`,
  { size: 256 },
);

const SKULL = svg(
  `<svg viewBox="0 0 100 100">
   <path d="M20 40 L2 30 L12 52 L24 52Z M80 40 L98 30 L88 52 L76 52Z" fill="#ff2bd6"/>
   <ellipse cx="50" cy="42" rx="29" ry="27" fill="#f4eaff" stroke="#ff2bd6" stroke-width="4"/>
   <rect x="34" y="62" width="32" height="20" rx="4" fill="#f4eaff" stroke="#ff2bd6" stroke-width="4"/>
   <ellipse cx="38" cy="44" rx="8" ry="9" fill="#2a0a2e"/><ellipse cx="62" cy="44" rx="8" ry="9" fill="#2a0a2e"/>
   <polygon points="50,52 45,62 55,62" fill="#2a0a2e"/>
   <path d="M42 66V80M50 66V80M58 66V80" stroke="#ff2bd6" stroke-width="2.5"/></svg>`,
  { size: 128 },
);

const SIGN = svg(
  `<svg viewBox="0 0 120 30"><rect x="2" y="2" width="116" height="26" rx="4" fill="none" stroke="#19f0ff" stroke-width="3"/>
   <path d="M8 8 L16 15 L8 22 M18 8 L26 15 L18 22" stroke="#ff2bd6" stroke-width="3" fill="none"/>
   <text x="72" y="21" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#19f0ff">ARES-7 HOVER</text></svg>`,
  { size: 256 },
);

const fanBlades = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  const c = (r: number, d: number) =>
    `${(50 + r * Math.cos(a + d)).toFixed(1)},${(50 + r * Math.sin(a + d)).toFixed(1)}`;
  return `<polygon points="${c(8, 0)} ${c(45, 0.1)} ${c(45, 0.5)} ${c(8, 0.6)}" fill="${i % 2 ? "#19f0ff" : "#7bfaff"}"/>`;
}).join("");
const FAN = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#04323c"/>${fanBlades}
   <circle cx="50" cy="50" r="9" fill="#e8ffff"/><circle cx="50" cy="50" r="48" fill="none" stroke="#e8ffff" stroke-width="3"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "hover_pickup" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0] });

  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: chassis, at, ...o });
  const rod = (a: number[], c: number[], r: number, color: any, o: any = {}) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });

  // ---- main body: side-profile extrude (z forward, y up)
  const PROFILE: [number, number][] = [
    [-2.5, 0.8],
    [2.45, 0.8],
    [2.5, 1.2],
    [2.2, 1.4],
    [1.3, 1.5],
    [0.75, 2.05],
    [-0.2, 2.1],
    [-0.5, 1.55],
    [-0.6, 1.1],
    [-2.5, 1.1],
  ];
  b.extrude(PROFILE, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.04, color: HULL, bone: chassis });

  // underbody + underglow
  box(1.7, 0.22, 4.7, IRON, [0, 0.7, 0]);
  glow(box(1.5, 0.02, 4.3, MAGENTA, [0, 0.58, 0]), 1.2);
  box(1.0, 0.12, 2.4, STEEL, [0, 0.62, 0.2]);

  // bed walls, tailgate, bed liner
  for (const s of [1, -1]) {
    box(0.1, 0.45, 1.95, HULL, [s * 0.9, 1.33, -1.52]);
    box(0.14, 0.06, 1.99, IRON, [s * 0.9, 1.58, -1.52]);
    glow(box(0.03, 0.04, 4.2, CYAN, [s * 0.965, 0.84, 0]), 1.3); // rocker neon
  }
  box(1.9, 0.45, 0.1, HULL, [0, 1.33, -2.45]);
  box(1.94, 0.06, 0.14, IRON, [0, 1.58, -2.45]);
  box(1.7, 0.03, 1.9, "#1e2228", [0, 1.12, -1.52]);

  // ---- cab details
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.36, 1.62],
        [1.05, 1.62],
        [0.8, 1.95],
        [-0.14, 1.95],
      ],
      { at: [s * 0.96, 0, 0], x: [0, 0, 1], thickness: 0.04, color: GLASS, bone: chassis },
    );
    // door lines, handle
    for (const z of [1.12, 0.1]) box(0.012, 0.75, 0.015, DARK, [s * 0.953, 1.17, z]);
    box(0.03, 0.03, 0.14, STEEL, [s * 0.965, 1.42, 0.2]);
    // armour plate with rivets
    box(0.05, 0.3, 1.5, panelled(metal("iron"), { size: 0.3, aspect: 0.8 }), [s * 0.975, 1.0, 0.35]);
    // door emblem
    decal(EMBLEM, 0.36, 0.36, [s * 0.955, 1.34, 0.6], [s, 0, 0]);
    // mirrors
    rod([s * 0.95, 1.62, 1.12], [s * 1.12, 1.72, 1.2], 0.015, DARK);
    box(0.05, 0.14, 0.2, DARK, [s * 1.14, 1.72, 1.2]);
    // bed neon sign
    glow(decal(SIGN, 1.1, 0.28, [s * 0.956, 1.36, -1.52], [s, 0, 0]), 1.1);
    // headlights
    glow(box(0.42, 0.14, 0.05, WHITE_HOT, [s * 0.68, 1.04, 2.5]), 1.6);
    glow(box(0.42, 0.03, 0.06, CYAN, [s * 0.68, 0.94, 2.5]), 1.3);
    // taillights
    glow(box(0.32, 0.1, 0.04, RED, [s * 0.75, 1.45, -2.51]), 1.4);
    // hood neon strips
    glow(
      b.part(new THREE.BoxGeometry(0.05, 0.015, 0.97), CYAN, {
        bone: chassis,
        at: [s * 0.3, 1.458, 1.75],
        dir: [0, -0.1, 0.9],
        axis: "z",
      }),
      1.2,
    );
    // hood vents
    for (let i = 0; i < 3; i++)
      box(0.3, 0.012, 0.04, DARK, [s * 0.62, 1.452 - i * 0.012, 1.55 + i * 0.16], { rotation: [-6, 0, 0] });
    // antenna
    rod([s * 0.9, 1.6, -2.3], [s * 0.9, 3.0, -2.3], 0.012, DARK);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), s > 0 ? MAGENTA : CYAN, { bone: chassis, at: [s * 0.9, 3.02, -2.3] }), 1.6);
    // roll bar uprights + floodlights
    rod([s * 0.82, 1.1, -0.8], [s * 0.82, 2.2, -0.8], 0.04, IRON);
    glow(box(0.22, 0.14, 0.08, WHITE_HOT, [s * 0.5, 2.32, -0.74]), 1.6);
    box(0.24, 0.16, 0.06, DARK, [s * 0.5, 2.32, -0.79]);
  }
  rod([-0.82, 2.2, -0.8], [0.82, 2.2, -0.8], 0.04, IRON);

  // windshield + visor stripe + wipers
  b.part(new THREE.BoxGeometry(1.7, 0.78, 0.02), GLASS, { bone: chassis, at: [0, 1.79, 1.037], dir: [0, 0.55, -0.55] });
  glow(box(1.7, 0.03, 0.03, CYAN, [0, 2.06, 0.78]), 1.3);
  for (const s of [1, -1]) rod([s * 0.2, 1.54, 1.28], [s * 0.55, 1.75, 1.08], 0.01, DARK);
  // rear window
  box(1.4, 0.3, 0.02, GLASS, [0, 1.8, -0.35], { rotation: [-18, 0, 0] });

  // roof: light bar, radar dish, sensor dome
  box(1.3, 0.08, 0.12, DARK, [0, 2.15, 0.6]);
  for (let i = 0; i < 8; i++)
    glow(box(0.14, 0.05, 0.02, i % 2 ? MAGENTA : CYAN, [-0.56 + i * 0.16, 2.15, 0.67]), 1.5);
  cyl(0.02, 0.02, 0.2, 6, DARK, [0.5, 2.2, -0.05]);
  b.lathe(
    [
      [0, 0],
      [0.18, 0.07],
      [0.2, 0.1],
      [0.17, 0.1],
      [0, 0.03],
    ],
    { at: [0.5, 2.32, -0.05], dir: undefined as any, axis: [0.2, 1, 0.5], segments: 8, color: STEEL, bone: chassis } as any,
  );
  b.part(new THREE.SphereGeometry(0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), DARK, { bone: chassis, at: [-0.5, 2.1, -0.05] });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { bone: chassis, at: [-0.5, 2.2, -0.05] }), 1.6);

  // ---- front end: grille, ram bumper, bull bars
  box(0.7, 0.3, 0.04, DARK, [0, 0.98, 2.52]);
  for (let i = -3; i <= 3; i++) glow(box(0.02, 0.24, 0.03, MAGENTA, [i * 0.09, 0.98, 2.54]), 1.2);
  box(2.05, 0.28, 0.3, IRON, [0, 0.74, 2.55]);
  decal(HAZARD, 1.9, 0.22, [0, 0.74, 2.705], [0, 0, 1]);
  for (const s of [1, -1]) {
    rod([s * 0.55, 0.6, 2.62], [s * 0.55, 1.28, 2.62], 0.035, STEEL);
    rod([s * 0.9, 0.75, 2.6], [s * 0.7, 1.18, 2.6], 0.03, STEEL);
  }
  rod([-0.55, 1.28, 2.62], [0.55, 1.28, 2.62], 0.035, STEEL);
  glow(box(1.0, 0.04, 0.04, CYAN, [0, 0.58, 2.66]), 1.3);

  // ---- rear bumper + plate + skull
  box(2.0, 0.25, 0.2, IRON, [0, 0.8, -2.55]);
  decal(PLATE, 0.5, 0.17, [0, 0.82, -2.655], [0, 0, -1]);
  glow(decal(SKULL, 0.5, 0.5, [0, 1.32, -2.505], [0, 0, -1]), 1.1);
  for (const s of [1, -1]) {
    cyl(0.09, 0.09, 0.2, 6, DARK, [s * 0.7, 0.8, -2.72], { rotation: [90, 0, 0] });
    glow(b.part(new THREE.CircleGeometry(0.07, 6), CYAN, { bone: chassis, at: [s * 0.7, 0.8, -2.825], dir: [0, 0, -1], axis: "z" }), 1.3);
  }

  // ---- bed gear: pintle gun, crates, energy cell
  cyl(0.22, 0.26, 0.08, 8, IRON, [0, 1.16, -1.5]);
  cyl(0.07, 0.09, 1.1, 8, STEEL, [0, 1.65, -1.5]);
  box(0.4, 0.28, 0.5, IRON, [0, 2.3, -1.5]);
  box(0.18, 0.18, 0.2, DARK, [0, 2.42, -1.5]);
  for (const s of [1, -1]) {
    rod([s * 0.09, 2.3, -1.4], [s * 0.09, 2.3, 0.1], 0.03, STEEL);
    rod([s * 0.09, 2.3, -0.5], [s * 0.09, 2.3, -0.1], 0.052, IRON);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), YELLOW, { bone: chassis, at: [s * 0.09, 2.3, 0.12] }), 1.5);
  }
  b.extrude(
    [
      [-0.4, 0],
      [0.4, 0],
      [0.3, 0.5],
      [-0.3, 0.5],
    ],
    { at: [0, 2.08, -1.12], x: [1, 0, 0], thickness: 0.04, color: panelled(metal("iron"), { size: 0.2 }), bone: chassis },
  );
  glow(box(0.5, 0.03, 0.02, YELLOW, [0, 2.12, -1.09]), 1.2);
  box(0.3, 0.25, 0.2, "#3b4630", [0.38, 2.22, -1.5]);
  rod([0.28, 2.27, -1.5], [0.12, 2.3, -1.45], 0.018, YELLOW);
  box(0.55, 0.4, 0.5, PLATED, [-0.45, 1.33, -2.0]);
  glow(box(0.57, 0.04, 0.52, CYAN, [-0.45, 1.4, -2.0]), 1);
  box(0.4, 0.3, 0.4, PLATED, [-0.5, 1.28, -1.1]);
  cyl(0.17, 0.17, 0.5, 8, DARK, [0.5, 1.37, -2.0]);
  glow(cyl(0.12, 0.12, 0.42, 8, CYAN, [0.5, 1.37, -2.0]), 1.4);
  cyl(0.15, 0.15, 0.1, 8, STEEL, [0.5, 1.65, -2.0]);

  // ---- hover wings and thruster pods
  const podShell: [number, number][] = [
    [0.3, 0],
    [0.46, 0.05],
    [0.52, 0.35],
    [0.46, 0.7],
    [0.32, 0.7],
    [0.38, 0.35],
    [0.32, 0.08],
  ];
  const band: [number, number][] = [
    [0.5, 0.26],
    [0.545, 0.26],
    [0.545, 0.33],
    [0.5, 0.33],
  ];
  const corners: [string, number, number][] = [
    ["thrusterFL", 1, 1.6],
    ["thrusterFR", -1, 1.6],
    ["thrusterRL", 1, -1.6],
    ["thrusterRR", -1, -1.6],
  ];
  for (const [name, s, z] of corners) {
    const x = s * 1.4;
    const j = b.joint(name, { parent: chassis, at: [x, 0.35, z], dir: [0, 1, 0] });
    b.lathe(podShell, { at: [x, 0, z], bone: j, segments: 8, color: POD });
    glow(b.lathe(band, { at: [x, 0, z], bone: j, segments: 8, color: CYAN }), 1.3);
    cyl(0.5, 0.5, 0.06, 8, IRON, [x, 0.73, z], { bone: j });
    cyl(0.1, 0.1, 0.5, 6, DARK, [x, 0.4, z], { bone: j });
    glow(
      b.part(new THREE.CircleGeometry(0.34, 16), "#ffffff", {
        bone: j,
        at: [x, 0.16, z],
        dir: [0, -1, 0],
        axis: "z",
        texture: FAN,
      }),
      1.3,
    );
    // inlet grille slats on top
    for (let i = -2; i <= 2; i++) box(0.7, 0.02, 0.03, DARK, [x, 0.77, z + i * 0.09], { bone: j });
    // wing plate, edge neon, struts
    b.extrude(
      [
        [0, -0.7],
        [1.1, -0.55],
        [1.1, 0.55],
        [0, 0.7],
      ],
      { at: [s * 0.9, 0.93, z], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.06, bevel: 0.015, color: HULL, bone: chassis },
    );
    glow(box(0.03, 0.04, 1.0, MAGENTA, [s * 2.0, 0.93, z]), 1.3);
    rod([x, 0.74, z], [s * 0.95, 1.15, z], 0.06, IRON);
    rod([x, 0.74, z - 0.25], [s * 1.0, 0.95, z - 0.25], 0.035, STEEL);
    rod([x, 0.74, z + 0.25], [s * 1.0, 0.95, z + 0.25], 0.035, STEEL);
    // wing number
    box(0.2, 0.012, 0.08, YELLOW, [s * 1.45, 0.965, z + 0.45]);
  }

  return b.root;
}
```