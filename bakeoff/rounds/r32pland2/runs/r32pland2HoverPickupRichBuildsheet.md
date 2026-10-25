```ts
/*
BUILD SHEET: HOVER-RAM "Ares-7" militarized hover pickup, low-poly cyberpunk
Proportions: length 6.0 m (tail thrusters included), width 2.9 m across the pods, height 2.6 m with turret.
  Body 1.9 m wide, 5.3 m long. Hover pods stand on y=0 with glowing nozzles. Cab 1.76 m wide, 2.0 m long.
Parts:
  - Hull: side-profile extrusion (hood, belt, bed floor) 1.9 m thick, plus cab extrusion 1.76 m thick
  - 4 hover pods: lathe bell 0.46 m radius, 0.78 m tall; glow nozzle disc, neon ring, fan with 3 blades,
    pylon with hazard cap, rim bolts
  - 2 tail thrusters (0.22 m radius cylinders) with glowing discs
  - Bed: side walls, hazard-capped tailgate, roll cage rods, crates, fuel drum, tail light strip
  - Pintle turret: post, shield, cradle, twin barrels, shroud, muzzle brakes, ammo box
  - Front: bumper, spikes, glowing visor, grille, fog lamps, hood scoop, vents, neon stripes
  - Cab: windshield, side and rear glass textures, mirrors, light bar, radar dome, antennas, smoke launchers
  - Door armour plates with glowing ID text and faction emblem; magenta underglow
Palette:
  #2a342f/#34423b/#3d4b43 camo hull (panelled, grimy toward the bottom); #14181c underside and dark metal
  #19e6ff cyan neon (thrusters, visor, rings); #ff2a8a magenta neon (stripes, tail lights, underglow)
  #f2c230 hazard yellow (caps, spikes, drum); #26404a door plates; iron and steel metal paints for guns and pods
Signature features:
  1. Four glowing downward thruster pods, each with a neon ring and a fan, replacing the wheels.
  2. Cyan slit visor and magenta hood stripes on a blocky armoured camo hull.
  3. Shielded twin-barrel pintle gun raised above the cab roof.
  4. Textured glass, glowing door ID plates, emblem decals, hazard-stripe trim.
*/
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, countershade, patches, gradient, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Hover-Ram Ares-7",
  description: "Militarized pickup truck converted to hover thrusters, low-poly cyberpunk, with a turret and neon trim.",
};

// ---------- palette ----------
const DARK = "#14181c";
const GUNM = "#2a2f38";
const CYAN = "#19e6ff";
const MAG = "#ff2a8a";
const YEL = "#f2c230";
const OLIVE = "#4a5238";

// ---------- paints ----------
const HULL_BASE = patches("#2a342f", ["#34423b", "#3d4b43", "#2d3a40"], { size: 0.55, gap: 0.05, seed: 4 });
const HULL = panelled(
  gradient(countershade(HULL_BASE, "#14181c", { level: -0.55, soft: 0.3 }), "#1d1a16", [0, 1.0, 0], [0, 0.55, 0]),
  { size: 0.5, aspect: 0.55, rivets: 0.1 },
);
const PLATE = panelled(countershade("#2b4752", "#162229"), { size: 0.3, rivets: 0.1 });
const IRON = metal("iron");
const STEEL = metal("steel", { tarnish: 0.4 });
const CRATE = paint((p, n) => mix(OLIVE, "#2f3524", smoothstep(0.3, 0.8, noise(p, 0.12, 5)) * 0.6 + (n.y < 0 ? 0.2 : 0)));

// ---------- textures ----------
const hazard = () => {
  let s = "";
  for (let i = -2; i < 8; i++) s += `<polygon points="${i * 10},16 ${i * 10 + 5},16 ${i * 10 + 13},0 ${i * 10 + 8},0" fill="${YEL}"/>`;
  return svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#101215"/>${s}</svg>`, { size: 128 });
};
const HAZ = hazard();

const windowTex = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 200 65"><g ${flip ? 'transform="translate(200,0) scale(-1,1)"' : ""}>
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2230"/><stop offset="1" stop-color="#17617a"/></linearGradient></defs>
    <polygon points="10,55 55,8 170,8 188,30 188,55" fill="url(#g)" stroke="#080a0d" stroke-width="5" stroke-linejoin="round"/>
    <rect x="97" y="6" width="6" height="52" fill="#0d1014"/>
    <polygon points="30,50 55,12 68,12 43,50" fill="#ff2a8a" opacity="0.35"/>
    <polygon points="120,50 140,12 148,12 128,50" fill="#19e6ff" opacity="0.3"/></g></svg>`,
    { size: 256 },
  );
const WIN_R = windowTex(false);
const WIN_L = windowTex(true);

const WINDSHIELD = svg(
  `<svg viewBox="0 0 160 88"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2230"/><stop offset="1" stop-color="#1a6c86"/></linearGradient></defs>
  <polygon points="4,86 22,4 138,4 156,86" fill="url(#g)" stroke="#080a0d" stroke-width="6" stroke-linejoin="round"/>
  <path d="M40 70 H120 M50 56 H110 M60 42 H100" stroke="#19e6ff" stroke-width="1.6" opacity="0.55"/>
  <polygon points="26,80 48,10 60,10 40,80" fill="#ff2a8a" opacity="0.3"/>
  <circle cx="118" cy="30" r="5" fill="none" stroke="#19e6ff" stroke-width="1.5"/></svg>`,
  { size: 256 },
);
const REAR_WIN = svg(
  `<svg viewBox="0 0 140 40"><rect x="3" y="3" width="134" height="34" rx="6" fill="#0d2d3c" stroke="#080a0d" stroke-width="5"/>
  <path d="M10 30 L40 8 M50 30 L80 8" stroke="#19e6ff" stroke-width="3" opacity="0.4"/></svg>`,
  { size: 192 },
);
const VISOR = svg(
  `<svg viewBox="0 0 170 16"><rect width="170" height="16" rx="3" fill="#0b0d12"/>
  <polygon points="6,8 20,3 70,3 78,8 70,13 20,13" fill="#19e6ff"/>
  <polygon points="164,8 150,3 100,3 92,8 100,13 150,13" fill="#19e6ff"/>
  <rect x="80" y="5" width="10" height="6" fill="#ff2a8a"/></svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 120 24"><rect width="120" height="24" fill="#0a0c10"/>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${6 + i * 8}" y="3" width="3" height="18" fill="${i % 2 ? "#ff2a8a" : "#3a4350"}"/>`).join("")}</svg>`,
  { size: 192 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 92,26 92,70 50,96 8,70 8,26" fill="#0b0d12" stroke="#19e6ff" stroke-width="5"/>
  <polygon points="50,20 74,34 70,60 58,72 42,72 30,60 26,34" fill="#ff2a8a"/>
  <polygon points="36,40 46,46 36,52" fill="#0b0d12"/><polygon points="64,40 54,46 64,52" fill="#0b0d12"/>
  <rect x="44" y="60" width="4" height="9" fill="#0b0d12"/><rect x="52" y="60" width="4" height="9" fill="#0b0d12"/>
  <path d="M20 14 L50 26 L80 14" stroke="#f2c230" stroke-width="3" fill="none"/></svg>`,
  { size: 192 },
);
const IDTEX = svg(
  `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="none"/>
  <text x="60" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#ff2a8a">HV-07</text>
  <rect x="4" y="34" width="112" height="3" fill="#19e6ff"/></svg>`,
  { size: 256 },
);
const THR = svg(
  `<svg viewBox="0 0 100 100"><defs><radialGradient id="r"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#7ff3ff"/><stop offset="0.75" stop-color="#19c8e8"/><stop offset="1" stop-color="#0b7fa0"/></radialGradient></defs>
  <rect width="100" height="100" fill="url(#r)"/><circle cx="50" cy="50" r="30" fill="none" stroke="#0b7fa0" stroke-width="2"/>
  <circle cx="50" cy="50" r="18" fill="none" stroke="#0b7fa0" stroke-width="2"/></svg>`,
  { size: 128 },
);
const HUD = svg(
  `<svg viewBox="0 0 40 24"><rect width="40" height="24" fill="#041218"/><path d="M4 18 L12 10 L20 14 L30 5 L36 8" stroke="#19e6ff" stroke-width="1.6" fill="none"/>
  <circle cx="30" cy="5" r="2" fill="#ff2a8a"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hover-ram" });

  // ---------- helpers ----------
  type V = [number, number, number];
  const part = (geo: THREE.BufferGeometry, color: any, at: V, o: Record<string, any> = {}) => b.part(geo, color, { at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: V, o: Record<string, any> = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r: number, len: number, seg: number, color: any, at: V, dir?: V, o: Record<string, any> = {}) =>
    part(new THREE.CylinderGeometry(r, r, len, seg), color, at, dir ? { dir, flat: true, ...o } : { flat: true, ...o });
  const plane = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });
  const disc = (tex: THREE.Texture | null, color: string, r: number, at: V, dir: V, up: V = [0, 0, 1]) =>
    b.part(new THREE.CircleGeometry(r, 12), color, { at, dir, axis: "z", up, texture: tex ?? undefined });
  const side = (outline: [number, number][], x: number, y: number, z: number, th: number, color: any) =>
    b.extrude(outline, { at: [x, y, z], x: [0, 0, 1], thickness: th, color });
  const hy = (z: number) => 1.3 - (z - 1.0) * 0.1176; // hood height at z

  // ---------- hull ----------
  side(
    [[-2.6, 0.55], [2.55, 0.55], [2.72, 0.8], [2.7, 1.1], [1.0, 1.3], [-1.0, 1.3], [-1.0, 1.05], [-2.6, 1.05]],
    0, 0, 0, 1.9, HULL,
  );
  side([[-1.05, 1.3], [0.95, 1.3], [0.35, 1.95], [-0.85, 1.95], [-1.05, 1.75]], 0, 0, 0, 1.76, HULL);
  box(1.5, 0.2, 4.6, DARK, [0, 0.48, 0]); // skid plate
  glow(plane(THR, 1.3, 3.4, [0, 0.375, 0], [0, -1, 0], [0, 0, 1]), 0.5);
  // roof plate / brow armour
  box(1.7, 0.06, 1.3, GUNM, [0, 1.975, -0.25]);
  box(1.78, 0.1, 0.12, GUNM, [0, 1.92, 0.5], { rotation: [-45, 0, 0] });

  // glass
  plane(WINDSHIELD, 1.62, 0.9, [0, 1.625 + 0.007, 0.65 + 0.007], [0, 0.678, 0.735]);
  plane(REAR_WIN, 1.4, 0.4, [0, 1.55, -1.062], [0, 0, -1]);
  plane(WIN_R, 2.0, 0.65, [0.885, 1.625, -0.05], [1, 0, 0]);
  plane(WIN_L, 2.0, 0.65, [-0.885, 1.625, -0.05], [-1, 0, 0]);

  // ---------- front end ----------
  box(1.95, 0.3, 0.28, HULL, [0, 0.66, 2.74]);
  glow(plane(VISOR, 1.7, 0.16, [0, 0.98, 2.722], [0, 0, 1]), 1.3);
  glow(plane(GRILLE, 1.3, 0.22, [0, 0.66, 2.885], [0, 0, 1]), 0.6);
  for (const s of [1, -1]) {
    glow(cyl(0.07, 0.06, 8, YEL, [s * 0.75, 0.82, 2.9], [0, 0, 1]), 1.2);
    for (const x of [0.3, 0.85]) b.spike([s * x, 0.7, 2.88], [0, 0, 1], 0.22, 0.05, { color: YEL, sides: 4 });
    // hood vents + neon stripes
    for (let i = 0; i < 3; i++)
      box(0.4, 0.015, 0.05, DARK, [s * 0.62, hy(1.5 + i * 0.12) + 0.008, 1.5 + i * 0.12], { rotation: [6.7, 0, 0] });
    glow(box(0.06, 0.015, 1.5, MAG, [s * 0.25, hy(1.9) + 0.01, 1.9], { rotation: [6.7, 0, 0] }), 1.3);
    // mirrors
    b.rod([s * 0.88, 1.6, 0.6], [s * 1.05, 1.7, 0.62], 0.02, { color: DARK });
    box(0.05, 0.2, 0.16, GUNM, [s * 1.08, 1.7, 0.62]);
    glow(box(0.01, 0.14, 0.1, CYAN, [s * 1.11, 1.7, 0.62]), 1);
    // smoke launchers
    for (let i = 0; i < 3; i++)
      cyl(0.04, 0.2, 6, GUNM, [s * 0.78, 2.04, -0.15 - i * 0.14], [s * 0.5, 1, 0.3]);
  }
  box(0.9, 0.12, 0.75, HULL, [0, hy(1.8) + 0.06, 1.8], { rotation: [6.7, 0, 0] }); // hood scoop
  glow(box(0.7, 0.02, 0.05, CYAN, [0, hy(2.18) + 0.1, 2.18], { rotation: [6.7, 0, 0] }), 1);
  plane(EMBLEM, 0.38, 0.38, [0, hy(1.15) + 0.012, 1.15], [0, 0.99, 0.115], [0, 0, 1]);

  // ---------- side armour plates & trim ----------
  const plateOutline: [number, number][] = [[-0.65, -0.25], [0.55, -0.25], [0.7, -0.1], [0.7, 0.25], [-0.65, 0.25]];
  for (const s of [1, -1]) {
    side(plateOutline, s * 0.99, 0.82, 0.05, 0.06, PLATE);
    glow(plane(IDTEX, 0.5, 0.17, [s * 1.025, 0.72, 0.05 + s * 0.2], [s, 0, 0]), 1.2);
    plane(EMBLEM, 0.26, 0.26, [s * 1.025, 0.9, 0.05 - s * 0.2], [s, 0, 0]);
    glow(box(0.04, 0.04, 3.4, MAG, [s * 0.965, 0.58, 0]), 1.4); // underglow strip
    box(0.1, 0.08, 0.5, GUNM, [s * 1.0, 0.9, -0.75]); // door handle block (kept inside the plate region)
    glow(box(0.04, 0.03, 0.3, CYAN, [s * 1.05, 0.9, -0.75]), 1);
    b.rod([s * 0.9, 0.72, 0.95], [s * 0.9, 0.72, -0.95], 0.015, { color: YEL }); // trim cable
  }
  glow(box(1.9, 0.04, 0.04, MAG, [0, 0.58, 2.62]), 1.4);

  // ---------- hover pods ----------
  const podProfile: [number, number][] = [[0, 0.012], [0.4, 0.012], [0.46, 0.12], [0.46, 0.5], [0.36, 0.78], [0, 0.78]];
  const bladeMat = DARK;
  for (const s of [1, -1])
    for (const z of [1.7, -1.6]) {
      const x = s * 1.3;
      b.lathe(podProfile, { at: [x, 0, z], axis: [0, 1, 0], segments: 8, color: IRON });
      glow(disc(THR, "#ffffff", 0.34, [x, 0.006, z], [0, -1, 0]), 1.6);
      const ring = glow(part(new THREE.TorusGeometry(0.47, 0.025, 4, 12), CYAN, [x, 0.2, z], { rotation: [90, 0, 0] }), 1.4);
      void ring;
      glow(disc(null, "#0b6f86", 0.3, [x, 0.785, z], [0, 1, 0]), 0.8);
      for (let i = 0; i < 3; i++) box(0.62, 0.015, 0.07, bladeMat, [x, 0.792, z], { rotation: [0, i * 60, 0] });
      cyl(0.04, 0.03, 6, STEEL, [x, 0.8, z]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        box(0.06, 0.05, 0.06, STEEL, [x + Math.cos(a) * 0.4, 0.79, z + Math.sin(a) * 0.4]);
      }
      // pylon with hazard cap
      box(0.42, 0.3, 0.6, GUNM, [s * 1.06, 0.74, z]);
      box(0.44, 0.06, 0.62, HAZ, [s * 1.06, 0.92, z], { texture: HAZ });
      b.rod([s * 0.9, 0.62, z + 0.3], [s * 1.2, 0.5, z + 0.25], 0.04, { color: STEEL });
      b.rod([s * 0.9, 0.62, z - 0.3], [s * 1.2, 0.5, z - 0.25], 0.04, { color: STEEL });
    }

  // ---------- bed ----------
  for (const s of [1, -1]) {
    box(0.1, 0.42, 1.6, HULL, [s * 0.9, 1.26, -1.8]);
    box(0.14, 0.05, 1.6, HAZ, [s * 0.9, 1.5, -1.8], { texture: HAZ });
    // roll cage
    b.rod([s * 0.82, 1.05, -1.2], [s * 0.82, 2.0, -1.2], 0.035, { color: GUNM });
    b.rod([s * 0.82, 2.0, -1.2], [s * 0.82, 1.5, -2.0], 0.03, { color: GUNM });
    glow(box(0.3, 0.07, 0.02, MAG, [s * 0.7, 1.3, -2.61]), 1.5); // tail lights
    // tail thrusters
    cyl(0.22, 0.4, 8, IRON, [s * 0.55, 0.8, -2.8], [0, 0, 1]);
    cyl(0.27, 0.1, 8, GUNM, [s * 0.55, 0.8, -3.0], [0, 0, 1]);
    glow(disc(THR, "#ffffff", 0.2, [s * 0.55, 0.8, -3.056], [0, 0, -1]), 1.6);
    b.rod([s * 0.55, 0.62, -2.6], [s * 0.55, 0.62, -3.0], 0.02, { color: YEL });
  }
  b.rod([-0.82, 2.0, -1.2], [0.82, 2.0, -1.2], 0.03, { color: GUNM });
  box(1.9, 0.42, 0.1, HULL, [0, 1.26, -2.55]);
  box(1.9, 0.05, 0.14, HAZ, [0, 1.5, -2.55], { texture: HAZ });
  glow(box(1.4, 0.04, 0.02, MAG, [0, 1.18, -2.61]), 1.4);
  box(0.6, 0.4, 0.5, CRATE, [-0.4, 1.25, -2.3]);
  glow(box(0.5, 0.04, 0.02, CYAN, [-0.4, 1.33, -2.06]), 1);
  box(0.4, 0.3, 0.4, CRATE, [-0.45, 1.6, -2.3], { rotation: [0, 20, 0] });
  cyl(0.2, 0.5, 8, YEL, [0.5, 1.3, -2.3]);
  box(0.42, 0.04, 0.42, DARK, [0.5, 1.56, -2.3], { rotation: [0, 22, 0] });

  // ---------- turret ----------
  const GZ = -1.85;
  cyl(0.28, 0.1, 8, GUNM, [0, 1.1, GZ]);
  cyl(0.07, 0.95, 6, STEEL, [0, 1.55, GZ]);
  box(0.5, 0.3, 0.7, GUNM, [0, 2.2, GZ]);
  box(0.12, 0.2, 0.2, STEEL, [0, 2.0, GZ]);
  b.extrude([[-0.38, -0.25], [0.38, -0.25], [0.3, 0.25], [-0.3, 0.25]], {
    at: [0, 2.2, GZ + 0.45], x: [1, 0, 0], thickness: 0.06, color: HULL,
  });
  glow(box(0.5, 0.03, 0.02, MAG, [0, 2.4, GZ + 0.49]), 1.4);
  box(0.25, 0.28, 0.4, OLIVE, [0.38, 2.15, GZ + 0.1]);
  glow(plane(HUD, 0.2, 0.12, [0.38, 2.15, GZ + 0.31], [0, 0, 1]), 1);
  for (const s of [1, -1]) {
    cyl(0.045, 1.5, 6, STEEL, [s * 0.11, 2.22, GZ + 1.05], [0, 0, 1]);
    cyl(0.075, 0.6, 6, IRON, [s * 0.11, 2.22, GZ + 0.7], [0, 0, 1]);
    box(0.1, 0.1, 0.12, GUNM, [s * 0.11, 2.22, GZ + 1.8]);
    glow(cyl(0.02, 0.04, 6, MAG, [s * 0.11, 2.22, GZ + 1.88], [0, 0, 1]), 1.5);
  }

  // ---------- roof gear ----------
  box(1.4, 0.1, 0.18, GUNM, [0, 2.05, 0.2]);
  glow(box(0.5, 0.07, 0.19, MAG, [-0.4, 2.1, 0.2]), 1.6);
  glow(box(0.5, 0.07, 0.19, CYAN, [0.4, 2.1, 0.2]), 1.6);
  cyl(0.18, 0.06, 8, GUNM, [0.35, 2.03, -0.55]);
  part(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#c8f3ff", [0.35, 2.06, -0.55], { flat: true });
  glow(box(0.04, 0.04, 0.04, CYAN, [0.35, 2.2, -0.55]), 1.5);
  b.rod([-0.7, 1.98, -0.8], [-0.75, 2.9, -0.9], 0.012, { color: DARK });
  glow(part(new THREE.SphereGeometry(0.03, 6, 4), MAG, [-0.75, 2.92, -0.9]), 1.8);
  b.rod([0.7, 1.98, -0.85], [0.68, 2.55, -0.9], 0.012, { color: DARK });
  glow(part(new THREE.SphereGeometry(0.025, 6, 4), CYAN, [0.68, 2.57, -0.9]), 1.8);

  return b.root;
}
```