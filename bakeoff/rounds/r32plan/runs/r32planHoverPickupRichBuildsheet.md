```ts
/*
BUILD SHEET — "Ghost Hog" hover-converted military pickup, low-poly cyberpunk
Proportions: length 6.0 m (z -3.1..2.9), width 3.2 m across thruster pods (body 1.9 m), height 3.0 m with antennas.
  Body hovers on four ducted-fan pods whose rims touch y=0. Faces +Z.
Parts (sizes in m):
  - Cab + hood: one side-profile extrude, 2.8 long x 1.5 high x 1.9 wide, panelled hull paint
  - Bed: floor pan 1.9x0.5x2.5, side walls 0.1x0.5x2.5, tailgate, cargo crates, cell canisters
  - 4 thruster pods: 8-sided lathe shells r0.42 h0.7, fan decal, cyan glow disc, magenta rim torus, pylons
  - 2 rear thrust nozzles: lathe bells r0.4, glowing exhaust discs
  - Pintle gatling on a tall pedestal over the cab roof: 6 barrels, housing, drum, yoke
  - 2 rocket pods on bed rails (6 tubes each), roof light bar, sensor dome, 2 antennas
  - Bull bar, hazard bumpers, door armour plates with bolts, mirrors, wipers, grille
Palette:
  #34423f/#44564f hull olive-teal (dirt darkens below 0.95 m), #505a58 + iron metal armour,
  #14181c dark trim/glass frame, #18eaff cyan neon (underglow, nose slit, fans),
  #ff2d9b magenta neon (rims, light bar, sign), #ffcf1f hazard yellow, #ff7a1a orange warheads/stacks,
  #ff2a3a taillights, #e8fbff headlights
Signature features:
  - Hover pods: lathe duct shells with textured fan blades above and a glowing disc below
  - Neon: underglow strips, nose visor slit, light bar, tailgate sign (all emissive)
  - Military kit: gatling on pedestal, rocket pods, bull bar, riveted door armour with emblem decals
  - Painted by place: panelled hull with mottled camo, mud dark at the bottom, sun-bleached top
*/
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ghost Hog Hover Pickup",
  description: "Militarized pickup truck converted to hover thrusters, low-poly cyberpunk with neon accents.",
};

const DARK = "#14181c";
const CYAN = "#18eaff";
const MAG = "#ff2d9b";
const YEL = "#ffcf1f";
const ORANGE = "#ff7a1a";
const RED = "#ff2a3a";
const WHITE = "#e8fbff";
const ARMOR_C = "#505a58";
const RUBBER = "#0c0e10";

export default function build() {
  const b = createBuilder({ name: "ghost-hog" });

  // ---------- paints ----------
  const hullBase = paint((p, n) => {
    const t = noise(p, 0.5, 3);
    let c = mix("#2f3d3b", "#44564f", t);
    c = mix(c, "#222a2c", smoothstep(0.62, 0.85, noise(p, 0.25, 8)) * 0.5);
    if (p.y < 0.95) c = mix(c, "#1b1d1f", smoothstep(0.95, 0.62, p.y) * 0.65);
    if (n.y > 0.6) c = mix(c, "#6a7c74", 0.25);
    return c;
  });
  const HULL = panelled(hullBase, { size: 0.45, aspect: 0.8, rivets: 0.15 });
  const ARMOR = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.3, rivets: 0.1 });
  const IRON = metal("iron");
  const STEEL = metal("steel", { tarnish: 0.4 });

  // ---------- textures ----------
  const fanBlade = (k: number) =>
    `<path transform="rotate(${k * 60} 50 50)" d="M50 50 C 58 34 72 20 88 26 C 80 42 66 54 50 50Z" fill="#1d2a35" stroke="#18eaff" stroke-width="1.6"/>`;
  const FAN = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="#18eaff" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map(fanBlade).join("")}<circle cx="50" cy="50" r="9" fill="#ff2d9b" stroke="#14181c" stroke-width="2"/></svg>`,
    { size: 192 },
  );
  const WIND = svg(
    `<svg viewBox="0 0 170 73"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17435a"/><stop offset="1" stop-color="#050f18"/></linearGradient></defs>
    <rect width="170" height="73" rx="4" fill="url(#g)" stroke="#14181c" stroke-width="5"/>
    <path d="M20 70 L58 4 L72 4 L34 70Z M84 70 L112 4 L120 4 L92 70Z" fill="#8fe9ff" opacity="0.18"/>
    <path d="M12 60 H70 M12 54 H48 M118 60 H158" stroke="#18eaff" stroke-width="1.6" opacity="0.8"/>
    <circle cx="140" cy="24" r="9" fill="none" stroke="#ff2d9b" stroke-width="1.5"/><path d="M140 12 V36 M128 24 H152" stroke="#ff2d9b" stroke-width="1"/>
    <path d="M118 40 l8 -6 l4 8 l9 -3 M126 34 l-5 -9" stroke="#cfefff" stroke-width="1" fill="none" opacity="0.7"/></svg>`,
    { size: 340 },
  );
  const sideWin = (flip: boolean) =>
    svg(
      `<svg viewBox="0 0 135 60"><g ${flip ? 'transform="translate(135 0) scale(-1 1)"' : ""}>
      <path d="M2 58 L2 24 L24 3 L108 3 L133 20 L133 58Z" fill="#0d3347" stroke="#14181c" stroke-width="5" stroke-linejoin="round"/>
      <path d="M30 56 L56 6 L66 6 L40 56Z M76 56 L98 6 L104 6 L84 56Z" fill="#8fe9ff" opacity="0.2"/>
      <path d="M8 50 H60" stroke="#18eaff" stroke-width="1.5" opacity="0.7"/></g></svg>`,
      { size: 256 },
    );
  const SIDE_L = sideWin(false);
  const SIDE_R = sideWin(true);
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#101419" stroke="#18eaff" stroke-width="5"/>
    <path d="M26 30 L50 76 L74 30" fill="none" stroke="#ff2d9b" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M50 30 V52" stroke="#ffcf1f" stroke-width="5"/><circle cx="50" cy="22" r="4" fill="#ffcf1f"/></svg>`,
    { size: 192 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 120 20"><rect width="120" height="20" fill="#ffcf1f"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 18 - 10} 20 L${i * 18 + 2} 0 L${i * 18 + 12} 0 L${i * 18} 20Z" fill="#14181c"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 130 30"><rect width="130" height="30" rx="3" fill="#0b0d10" stroke="#3a4448" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<rect x="${8 + i * 10}" y="5" width="4" height="20" fill="#2a3338"/>`).join("")}
    <rect x="8" y="13" width="114" height="3" fill="#18eaff"/></svg>`,
    { size: 256 },
  );
  const HOOD = svg(
    `<svg viewBox="0 0 160 70"><text x="80" y="52" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="52" fill="#e8fbff" stroke="#14181c" stroke-width="3" paint-order="stroke">HV-07</text>
    <rect x="6" y="6" width="148" height="5" fill="#ff2d9b"/></svg>`,
    { size: 256 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 160 50"><rect width="160" height="50" rx="6" fill="#14081a"/>
    <text x="80" y="35" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#ff2d9b">GHOST·HOG</text>
    <rect x="4" y="4" width="152" height="42" rx="5" fill="none" stroke="#18eaff" stroke-width="2.5"/></svg>`,
    { size: 256 },
  );
  const CRATE = svg(
    `<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#4b5a3a"/><rect x="3" y="3" width="74" height="44" fill="none" stroke="#2a3320" stroke-width="3"/>
    <text x="40" y="32" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#ffcf1f">AMMO</text></svg>`,
    { size: 128 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 60 30"><rect width="60" height="30" rx="3" fill="#e9e4c0" stroke="#14181c" stroke-width="2"/>
    <text x="30" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#1a1a1a">N1GHT</text></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (size: number[], at: number[], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });
  const merged = (geos: THREE.BufferGeometry[], color: any) =>
    b.part(mergeGeometries(geos)!, color, { at: [0, 0, 0] });
  const bolts = (pts: number[][], r = 0.02) =>
    merged(pts.map((p) => new THREE.SphereGeometry(r, 5, 4).translate(p[0], p[1], p[2])), STEEL);

  // ---------- main body: cab + hood profile (z, y) ----------
  b.extrude(
    [
      [-0.2, 0.6], [2.4, 0.6], [2.78, 0.85], [2.78, 1.3], [2.45, 1.5],
      [1.7, 1.52], [1.25, 2.1], [0.55, 2.12], [-0.2, 2.0],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.04, color: HULL },
  );
  // roof plate
  box([1.7, 0.06, 0.8], [0, 2.14, 0.9], ARMOR);
  // windshield + side windows
  plane(1.7, 0.73, WIND, [0, 1.82, 1.49], [0, 0.62, 0.79]);
  for (const s of [1, -1]) {
    plane(1.35, 0.6, s > 0 ? SIDE_L : SIDE_R, [s * 0.962, 1.77, 0.52], [s, 0, 0]);
  }
  // wipers
  b.rod([-0.5, 1.56, 1.55], [0.1, 1.64, 1.6], 0.012, DARK);
  b.rod([0.05, 1.56, 1.55], [0.6, 1.66, 1.6], 0.012, DARK);

  // hood details
  plane(0.8, 0.35, HOOD, [0, 1.535, 2.05], [0, 1, 0], [0, 0, 1]);
  for (const s of [1, -1]) {
    box([0.4, 0.07, 0.5], [s * 0.55, 1.55, 2.0], DARK);
    for (let i = 0; i < 4; i++) box([0.36, 0.015, 0.03], [s * 0.55, 1.595, 1.85 + i * 0.1], CYAN, {});
  }
  glow(box([0.02, 0.02, 0.02], [0, -5, 0], CYAN));
  // nose: visor slit, headlights, grille
  glow(box([1.5, 0.06, 0.05], [0, 1.1, 2.785], CYAN));
  for (const s of [1, -1]) {
    box([0.42, 0.22, 0.06], [s * 0.7, 1.18, 2.77], DARK);
    glow(box([0.3, 0.12, 0.06], [s * 0.7, 1.18, 2.8], WHITE), 1.4);
  }
  plane(1.3, 0.3, GRILLE, [0, 0.74, 2.6], [0, -0.83, 0.55]);
  // bull bar
  box([1.9, 0.14, 0.1], [0, 0.95, 2.92], ARMOR);
  box([1.9, 0.1, 0.1], [0, 0.72, 2.9], ARMOR);
  for (const s of [1, -1]) {
    box([0.1, 0.5, 0.1], [s * 0.5, 0.85, 2.88], ARMOR);
    box([0.1, 0.5, 0.1], [s * 0.93, 0.85, 2.82], ARMOR);
    box([0.08, 0.1, 0.4], [s * 0.93, 0.85, 2.68], ARMOR);
  }
  plane(1.5, 0.12, HAZARD, [0, 0.95, 2.975], [0, 0, 1]);
  box([0.5, 0.08, 0.08], [0, 0.6, 2.9], STEEL);
  // tow hooks
  for (const s of [1, -1]) cyl(0.03, 0.03, 0.14, 6, [s * 0.35, 0.72, 2.95], YEL, { dir: [0, 0, 1] });

  // doors: seams, armour plates, emblems, handles
  for (const s of [1, -1]) {
    b.extrude(
      [[-0.1, 0.8], [1.15, 0.8], [1.3, 0.95], [1.3, 1.45], [-0.1, 1.45]],
      { at: [s * 0.98, 0, 0], x: [0, 0, 1], thickness: 0.06, bevel: 0.015, color: ARMOR },
    );
    box([0.02, 0.9, 0.03], [s * 0.96, 1.4, -0.12], DARK);
    box([0.02, 0.9, 0.03], [s * 0.96, 1.4, 1.05], DARK);
    box([0.04, 0.04, 0.2], [s * 0.98, 1.5, 0.15], STEEL);
    plane(0.55, 0.55, EMBLEM, [s * 1.013, 1.12, 0.6], [s, 0, 0]);
    const ps: number[][] = [];
    for (const z of [-0.05, 1.2]) for (const y of [0.86, 1.4]) ps.push([s * 1.012, y, z]);
    for (const z of [0.2, 0.4, 0.8, 1.0]) ps.push([s * 1.012, 0.86, z], [s * 1.012, 1.4, z]);
    bolts(ps);
    // mirrors
    box([0.2, 0.05, 0.05], [s * 1.05, 1.7, 1.18], DARK);
    box([0.07, 0.2, 0.15], [s * 1.17, 1.76, 1.18], DARK);
    glow(box([0.075, 0.03, 0.12], [s * 1.17, 1.68, 1.18], MAG));
  }
  // underglow strips
  for (const s of [1, -1]) {
    glow(box([0.05, 0.04, 3.2], [s * 0.9, 0.58, 0.3], CYAN), 1.3);
    box([0.1, 0.1, 3.3], [s * 0.9, 0.66, 0.3], DARK);
  }
  glow(box([1.4, 0.04, 0.05], [0, 0.58, -2.65], MAG), 1.3);

  // ---------- bed ----------
  box([1.9, 0.5, 2.5], [0, 0.85, -1.45], HULL);
  box([1.9, 0.05, 2.5], [0, 1.12, -1.45], DARK);
  for (const s of [1, -1]) {
    box([0.1, 0.55, 2.5], [s * 0.9, 1.4, -1.45], HULL);
    box([0.14, 0.06, 2.5], [s * 0.9, 1.7, -1.45], ARMOR);
    // rail studs
    bolts([-0.5, -1.0, -1.5, -2.0, -2.5].map((z) => [s * 0.97, 1.55, z]));
    // cell canisters outside rail? put inside against wall
    cyl(0.1, 0.1, 0.4, 8, [s * 0.76, 1.33, -0.45], STEEL);
    glow(cyl(0.102, 0.102, 0.05, 8, [s * 0.76, 1.33, -0.45], CYAN));
    // exhaust stacks (coolant)
    cyl(0.06, 0.07, 1.1, 6, [s * 0.78, 1.65, -0.33], IRON);
    glow(cyl(0.075, 0.075, 0.04, 6, [s * 0.78, 2.2, -0.33], ORANGE), 1.3);
    // rear braces
    box([0.08, 0.5, 0.08], [s * 0.88, 1.4, -2.7], ARMOR);
  }
  // tailgate
  box([1.9, 0.55, 0.1], [0, 1.4, -2.65], HULL);
  box([1.9, 0.06, 0.14], [0, 1.7, -2.65], ARMOR);
  glow(plane(1.3, 0.42, SIGN, [0, 1.38, -2.706], [0, 0, -1]), 1.1);
  for (const s of [1, -1]) {
    glow(box([0.2, 0.28, 0.06], [s * 0.78, 1.45, -2.71], RED), 1.3);
  }
  plane(0.3, 0.15, PLATE, [0, 1.12, -2.706], [0, 0, -1]);
  // bumper
  box([1.9, 0.22, 0.16], [0, 0.82, -2.78], ARMOR);
  plane(1.7, 0.16, HAZARD, [0, 0.82, -2.865], [0, 0, -1]);
  // cargo crates
  for (const [x, z, ry] of [[-0.45, -2.15, 6], [0.4, -2.2, -8], [-0.35, -1.5, 0]] as const) {
    box([0.55, 0.4, 0.5], [x, 1.35, z], "#4b5a3a", { rotation: [0, ry, 0] });
    plane(0.4, 0.25, CRATE, [x, 1.35, z + 0.255 * Math.cos((ry * Math.PI) / 180)], [Math.sin((ry * Math.PI) / 180), 0, Math.cos((ry * Math.PI) / 180)]);
  }
  box([0.4, 0.28, 0.4], [0.45, 1.29, -1.5], "#3a3f4a");
  box([0.42, 0.04, 0.42], [0.45, 1.45, -1.5], YEL);
  // rocket pods on rails
  for (const s of [1, -1]) {
    box([0.38, 0.42, 0.9], [s * 0.62, 1.52, -2.0], ARMOR);
    box([0.42, 0.06, 0.94], [s * 0.62, 1.76, -2.0], DARK);
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 3; j++) {
        const x = s * 0.62 + (i - 0.5) * 0.16;
        const y = 1.52 + (j - 1) * 0.12;
        cyl(0.055, 0.055, 0.05, 6, [x, y, -1.54], RUBBER, { dir: [0, 0, 1] });
        glow(b.part(new THREE.ConeGeometry(0.04, 0.08, 6), ORANGE, { at: [x, y, -1.55], dir: [0, 0, 1] }), 1.2);
      }
  }

  // ---------- gatling ----------
  cyl(0.22, 0.26, 0.06, 8, [0, 1.15, -1.0], ARMOR);
  cyl(0.07, 0.09, 1.1, 8, [0, 1.65, -1.0], IRON);
  box([0.4, 0.26, 0.3], [0, 2.3, -1.0], ARMOR);
  box([0.06, 0.34, 0.34], [0.22, 2.38, -1.0], ARMOR);
  box([0.06, 0.34, 0.34], [-0.22, 2.38, -1.0], ARMOR);
  cyl(0.13, 0.13, 0.55, 8, [0, 2.38, -0.9], IRON, { dir: [0, 0, 1] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cyl(0.025, 0.025, 0.85, 5, [Math.sin(a) * 0.075, 2.38 + Math.cos(a) * 0.075, -0.25], STEEL, { dir: [0, 0, 1] });
  }
  b.part(new THREE.TorusGeometry(0.1, 0.02, 4, 8), ARMOR, { at: [0, 2.38, 0.0], dir: [0, 0, 1], axis: "z" });
  b.part(new THREE.TorusGeometry(0.1, 0.02, 4, 8), ARMOR, { at: [0, 2.38, -0.45], dir: [0, 0, 1], axis: "z" });
  cyl(0.17, 0.17, 0.22, 8, [0.32, 2.3, -1.0], "#4b5a3a", { dir: [1, 0, 0] });
  b.rod([0.22, 2.32, -1.0], [0.1, 2.4, -0.95], 0.02, YEL);
  glow(box([0.06, 0.06, 0.06], [0, 2.47, -1.0], RED));

  // ---------- roof gear ----------
  box([1.4, 0.08, 0.24], [0, 2.22, 0.85], DARK);
  const cyanBars: THREE.BufferGeometry[] = [];
  const magBars: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++)
    (i % 2 ? magBars : cyanBars).push(new THREE.BoxGeometry(0.2, 0.08, 0.2).translate(-0.55 + i * 0.22, 2.29, 0.85));
  glow(merged(cyanBars, CYAN), 1.4);
  glow(merged(magBars, MAG), 1.4);
  b.part(new THREE.SphereGeometry(0.14, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [-0.55, 2.17, 0.35] });
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [-0.55, 2.28, 0.35] }));
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 2.05, -0.12], [s * 0.88, 3.0, -0.25], 0.012, DARK);
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), s > 0 ? CYAN : MAG, { at: [s * 0.88, 3.02, -0.25] }), 1.5);
    box([0.1, 0.1, 0.1], [s * 0.8, 2.08, -0.1], DARK);
  }

  // ---------- thruster pods ----------
  const shellOutline: [number, number][] = [[0.3, 0], [0.42, 0], [0.4, 0.2], [0.42, 0.7], [0.32, 0.7], [0.3, 0.2]];
  const pod = (x: number, z: number) => {
    const s = Math.sign(x);
    b.lathe(shellOutline, { at: [x, 0, z], segments: 8, spin: 22.5, color: ARMOR });
    b.part(new THREE.TorusGeometry(0.37, 0.022, 4, 12), MAG, { at: [x, 0.69, z], dir: [0, 1, 0], axis: "z" });
    glow(b.part(new THREE.TorusGeometry(0.37, 0.022, 4, 12), MAG, { at: [x, 0.69, z], dir: [0, 1, 0], axis: "z" }), 1.4);
    plane(0.62, 0.62, FAN, [x, 0.45, z], [0, 1, 0], [0, 0, 1]);
    glow(b.part(new THREE.CircleGeometry(0.3, 10), CYAN, { at: [x, 0.07, z], dir: [0, -1, 0], axis: "z" }), 1.6);
    glow(cyl(0.3, 0.3, 0.03, 10, [x, 0.3, z], CYAN), 1.0);
    // pylon + stabiliser fin
    box([0.5, 0.22, 0.5], [x - s * 0.22, 0.7, z], DARK);
    box([0.34, 0.05, 0.34], [x - s * 0.22, 0.83, z], ARMOR);
    b.extrude([[0, 0], [0.35, 0], [0.05, 0.3]], { at: [x + s * 0.4, 0.5, z - 0.17], x: [0, 0, 1], thickness: 0.04, color: HULL });
    bolts([[x + s * 0.2, 0.7, z + 0.42], [x - s * 0.2, 0.7, z + 0.42], [x + s * 0.2, 0.7, z - 0.42], [x - s * 0.2, 0.7, z - 0.42]], 0.025);
  };
  for (const x of [1.2, -1.2]) for (const z of [1.65, -1.6]) pod(x, z);
  // side skirts
  for (const s of [1, -1]) box([0.14, 0.2, 2.2], [s * 1.0, 0.62, 0.02], ARMOR);

  // rear thrust nozzles
  for (const s of [1, -1]) {
    b.lathe([[0.22, 0], [0.28, 0], [0.42, 0.4], [0.34, 0.4], [0.2, 0.06]], {
      at: [s * 0.55, 0.95, -2.76], axis: [0, 0, -1], segments: 8, color: IRON,
    });
    glow(b.part(new THREE.CircleGeometry(0.34, 8), CYAN, { at: [s * 0.55, 0.95, -3.04], dir: [0, 0, -1], axis: "z" }), 1.6);
    glow(b.part(new THREE.TorusGeometry(0.38, 0.02, 4, 8), MAG, { at: [s * 0.55, 0.95, -3.16], dir: [0, 0, -1], axis: "z" }), 1.4);
  }

  return b.root;
}
```