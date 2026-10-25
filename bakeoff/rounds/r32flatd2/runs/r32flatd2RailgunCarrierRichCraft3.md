```ts
import * as THREE from "three";
import { createBuilder, paint, patches, mix, smoothstep, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "RG-6 Astraeus Railgun Carrier",
  description:
    "Six-wheeled low-poly sci-fi military railgun carrier, deployed on four stabiliser outriggers with a glowing rail cannon, capacitor bank, camo hull and decals.",
};

// ---------- palette ----------
const OLIVE = "#55663a";
const OLIVE_D = "#3b472a";
const TAN = "#8c7c4e";
const GUN = "#363b42";
const GUN_L = "#565d66";
const STEEL = "#9aa2aa";
const BLACK = "#17191c";
const TIRE = "#222326";
const YELLOW = "#e2b422";
const CYAN = "#3fe8ff";
const AMBER = "#ffb23a";
const MUD = "#6b5a40";

// camo coat: digital-ish patches, darker underneath, mud near the ground
const camoBase = patches(OLIVE, [OLIVE_D, "#7a7a4c", "#4a5a33", TAN], { size: 0.8, gap: 0.015, seed: 4 });
const CAMO = paint((p, n) => {
  const c = camoBase.at(p, n);
  const k = 0.74 + 0.26 * smoothstep(-0.6, 0.8, n.y);
  let out = [c[0] * k, c[1] * k, c[2] * k] as [number, number, number];
  const mudAmt = smoothstep(1.7, 0.7, p.y) * (0.35 + 0.5 * noise(p, 0.3, 9));
  return mix(out, MUD, Math.min(mudAmt, 0.8));
});
const DARKMETAL = paint((p, n) => {
  const t = noise(p, 0.25, 3);
  const k = 0.8 + 0.3 * t * smoothstep(-0.5, 0.9, n.y);
  return [0.21 * k, 0.23 * k, 0.26 * k];
});

// ---------- textures ----------
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#14161a"/><circle cx="50" cy="50" r="40" fill="#d8d2b8"/>
  <circle cx="50" cy="50" r="31" fill="#2d3a22"/><path d="M50 21 L57 42 L79 42 L61 55 L68 77 L50 63 L32 77 L39 55 L21 42 L43 42Z" fill="#e2b422" stroke="#14161a" stroke-width="2"/>
  <rect x="6" y="46" width="88" height="8" fill="#14161a" opacity="0.0"/></svg>`,
  { size: 128 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 240 40"><text x="6" y="30" font-family="monospace" font-weight="bold" font-size="30" fill="#e8e2c8" letter-spacing="3">RG-6 ASTRAEUS</text>
  <rect x="0" y="35" width="240" height="3" fill="#e2b422"/></svg>`,
  { size: 512 },
);
const CHEVRON = svg(
  `<svg viewBox="0 0 128 24"><rect width="128" height="24" fill="#e2b422"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 16 - 8} 24 L${i * 16 + 4} 0 L${i * 16 + 12} 0 L${i * 16} 24Z" fill="#17191c"/>`).join("")}</svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#16181b"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="4" y="${3 + i * 4}" width="56" height="2.2" fill="#4b525a"/>`).join("")}
  <rect x="1" y="1" width="62" height="30" fill="none" stroke="#7b838b" stroke-width="1.5"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 32"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd6e8"/><stop offset="1" stop-color="#14323f"/></linearGradient></defs>
  <rect width="64" height="32" rx="3" fill="url(#g)" stroke="#101214" stroke-width="3"/>
  <path d="M10 32 L26 0 L34 0 L18 32Z" fill="#ffffff" opacity="0.28"/><path d="M38 32 L48 6 L52 6 L42 32Z" fill="#ffffff" opacity="0.18"/>
  <rect x="31" y="0" width="2" height="32" fill="#101214"/></svg>`,
  { size: 192 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 4 L61 56 L3 56Z" fill="#e2b422" stroke="#17191c" stroke-width="5" stroke-linejoin="round"/>
  <path d="M35 20 L24 38 H32 L28 50 L42 30 H34Z" fill="#17191c"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------- skeleton ----------
  const hull = b.joint("hull", { at: [0, 1.5, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 2.4, -1.2], dir: [0, 1, 0] });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.6, -1.2], dir: [0, 0, 1] });
  const wheelX = 1.75;
  const wheelZ = [3.6, 0.6, -2.4];
  const WR = 0.7;
  const wheelJ: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1])
    wheelZ.forEach((z, i) => {
      const n = `wheel${s > 0 ? "L" : "R"}${i + 1}`;
      wheelJ[n] = b.joint(n, { parent: hull, at: [s * wheelX, WR, z], dir: [s, 0, 0] });
    });

  const box = (w: number, h: number, d: number, color: any, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...o });
  const decal = (tex: THREE.Texture, at: number[], dir: number[], w: number, h: number, bone: any, extra: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...extra });

  // ---------- chassis ----------
  box(2.6, 0.7, 10.4, DARKMETAL, [0, 1.1, 0.1], hull);
  box(1.4, 0.35, 10.0, BLACK, [0, 0.75, 0.1], hull); // belly skid
  for (const z of wheelZ) {
    b.rod([-wheelX, WR, z], [wheelX, WR, z], 0.13, GUN_L, { bone: hull });
    cyl(0.28, 0.28, 0.5, 8, GUN, [0, WR, z], hull, { dir: [1, 0, 0] }); // differential
  }
  // main hull body
  box(2.8, 0.95, 7.6, CAMO, [0, 1.925, -1.05], hull);
  box(2.9, 0.12, 7.7, GUN, [0, 1.47, -1.05], hull);
  // sloped rear deck and engine vents
  box(2.5, 0.14, 2.2, CAMO, [0, 2.46, -3.7], hull);
  decal(GRILLE, [0, 2.54, -3.9], [0, 1, 0], 1.4, 0.8, hull, { up: [0, 0, 1] });
  // cab
  const cab = b.extrude(
    [
      [2.7, 1.45],
      [5.0, 1.45],
      [5.0, 2.4],
      [4.8, 2.7, "sharp"],
      [4.0, 3.25, "sharp"],
      [3.1, 3.2, "sharp"],
      [2.7, 2.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, color: CAMO, bone: hull },
  );
  void cab;
  glow(decal(SCREEN, [0, 2.975 + 0.012 * 0.8, 4.4 + 0.012 * 0.55], [0, 0.8, 0.55], 2.1, 0.97, hull), 0.35);
  for (const s of [1, -1]) {
    glow(decal(SCREEN, [s * 1.262, 2.8, 3.55], [s, 0, 0], 1.3, 0.55, hull), 0.3);
    // mirrors
    b.rod([s * 1.25, 2.6, 4.55], [s * 1.6, 2.7, 4.7], 0.03, GUN, { bone: hull });
    box(0.06, 0.3, 0.2, GUN, [s * 1.62, 2.7, 4.7], hull);
    // headlights
    glow(box(0.38, 0.22, 0.06, "#fff1c0", [s * 0.95, 1.95, 5.02], hull), 1.3);
    box(0.5, 0.3, 0.05, BLACK, [s * 0.95, 1.95, 5.0], hull);
    // exhaust stacks
    cyl(0.1, 0.1, 1.3, 6, GUN_L, [s * 1.2, 2.95, 2.45], hull);
    cyl(0.13, 0.1, 0.12, 6, BLACK, [s * 1.2, 3.62, 2.45], hull);
    // tool boxes + stowage
    box(0.3, 0.45, 1.2, OLIVE_D, [s * 1.55, 2.0, -3.5], hull);
    box(0.34, 0.08, 1.24, GUN, [s * 1.55, 2.26, -3.5], hull);
    // side emblem and stencil
    decal(EMBLEM, [s * 1.412, 2.0, 0.7], [s, 0, 0], 0.7, 0.7, hull);
    decal(STENCIL, [s * 1.412, 2.0, -1.9], [s, 0, 0], 2.4, 0.4, hull);
    decal(WARN, [s * 1.412, 1.65, -0.3], [s, 0, 0], 0.32, 0.32, hull);
    // side pods
    box(0.12, 0.28, 1.4, GUN, [s * 1.46, 2.25, 1.2], hull);
  }
  glow(box(1.4, 0.1, 0.12, AMBER, [0, 3.28, 3.2], hull), 1.2); // roof light bar
  decal(GRILLE, [0, 1.95, 5.012], [0, 0, 1], 1.0, 0.5, hull);
  // bumper
  box(2.9, 0.45, 0.35, GUN, [0, 1.1, 5.15], hull);
  decal(CHEVRON, [0, 1.1, 5.33], [0, 0, 1], 2.8, 0.38, hull);
  box(0.5, 0.25, 0.4, GUN_L, [0, 0.8, 5.25], hull); // tow hook plate
  // roof hatch, antenna
  cyl(0.28, 0.32, 0.12, 8, GUN, [0.55, 3.28, 3.45], hull);
  b.rod([-1.0, 3.2, 3.0], [-1.1, 4.8, 2.9], 0.018, BLACK, { bone: hull });
  cyl(0.06, 0.06, 0.16, 6, GUN, [-1.0, 3.22, 3.0], hull);

  // ---------- wheels ----------
  const tireMat = TIRE;
  for (const s of [1, -1])
    wheelZ.forEach((z, i) => {
      const j = wheelJ[`wheel${s > 0 ? "L" : "R"}${i + 1}`];
      const cx = s * wheelX;
      cyl(WR, WR, 0.56, 14, tireMat, [cx, WR, z], j, { dir: [s, 0, 0] });
      cyl(WR * 0.74, WR * 0.74, 0.6, 14, GUN, [cx, WR, z], j, { dir: [s, 0, 0] }); // sidewall band
      cyl(0.5, 0.5, 0.62, 10, STEEL, [cx, WR, z], j, { dir: [s, 0, 0] });
      cyl(0.3, 0.3, 0.68, 8, OLIVE_D, [cx, WR, z], j, { dir: [s, 0, 0] });
      cyl(0.12, 0.12, 0.72, 6, YELLOW, [cx, WR, z], j, { dir: [s, 0, 0] });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.SphereGeometry(0.045, 5, 3), BLACK, {
          bone: j,
          at: [cx + s * 0.33, WR + Math.sin(a) * 0.4, z + Math.cos(a) * 0.4],
        });
      }
      // fender
      box(0.8, 0.1, 1.9, CAMO, [cx, 1.55, z], hull);
      box(0.8, 0.5, 0.1, CAMO, [cx, 1.3, z + 0.92], hull);
      box(0.8, 0.5, 0.1, CAMO, [cx, 1.3, z - 0.92], hull);
    });
  for (const s of [1, -1]) box(0.9, 0.55, 0.06, BLACK, [s * wheelX, 0.55, -3.35], hull); // mud flaps

  // ---------- stabiliser outriggers ----------
  const legs: [string, number, number][] = [
    ["FL", 1, 2.1],
    ["FR", -1, 2.1],
    ["RL", 1, -4.0],
    ["RR", -1, -4.0],
  ];
  for (const [n, s, z] of legs) {
    const top = b.joint(`outrigger${n}`, { parent: hull, at: [s * 1.4, 1.75, z], aim: [s * 2.8, 1.75, z] });
    const low = b.joint(`outrigger${n}Low`, { parent: top, at: [s * 2.8, 1.5, z], dir: [0, -1, 0] });
    box(1.5, 0.35, 0.5, CAMO, [s * 2.1, 1.75, z], top);
    box(1.5, 0.08, 0.38, GUN, [s * 2.1, 1.96, z], top);
    cyl(0.25, 0.25, 0.95, 8, GUN_L, [s * 2.8, 1.5, z], top);
    cyl(0.28, 0.28, 0.14, 8, YELLOW, [s * 2.8, 1.8, z], top);
    cyl(0.14, 0.14, 1.1, 8, STEEL, [s * 2.8, 0.75, z], low);
    b.rod([s * 1.45, 1.0, z], [s * 2.8, 1.35, z], 0.08, GUN, { bone: top });
    b.part(new THREE.SphereGeometry(0.2, 6, 4), GUN, { bone: low, at: [s * 2.8, 0.27, z] });
    cyl(0.5, 0.58, 0.18, 8, GUN, [s * 2.8, 0.09, z], low);
    cyl(0.4, 0.4, 0.04, 8, YELLOW, [s * 2.8, 0.2, z], low);
    decal(WARN, [s * 2.8 + s * 0.255, 1.5, z], [s, 0, 0], 0.26, 0.26, top);
  }

  // ---------- turret ----------
  cyl(1.95, 1.95, 0.2, 10, GUN, [0, 2.5, -1.2], turret);
  cyl(1.65, 1.8, 0.9, 8, CAMO, [0, 2.95, -1.2], turret, { flat: true });
  cyl(1.35, 1.5, 0.14, 8, OLIVE_D, [0, 3.45, -1.2], turret);
  // trunnion supports
  for (const s of [1, -1]) {
    box(0.3, 0.95, 1.2, CAMO, [s * 1.0, 3.8, -1.2], turret);
    cyl(0.2, 0.2, 0.45, 8, STEEL, [s * 0.95, 3.6, -1.2], turret, { dir: [1, 0, 0] });
    // smoke launchers
    for (let k = 0; k < 3; k++)
      cyl(0.06, 0.06, 0.4, 6, GUN, [s * 1.5, 3.0 + k * 0.15, -0.4 + 0.0], turret, { dir: [s * 0.5, 0.35, 1] });
    box(0.18, 0.5, 0.5, GUN, [s * 1.45, 3.1, -0.45], turret);
  }
  // commander cupola
  cyl(0.38, 0.42, 0.28, 8, CAMO, [0.8, 3.65, -1.9], turret);
  glow(box(0.5, 0.1, 0.06, CYAN, [0.8, 3.7, -1.5], turret), 0.9);
  // radar dish
  b.rod([-0.95, 3.5, -2.0], [-0.95, 4.1, -2.0], 0.04, GUN, { bone: turret });
  cyl(0.45, 0.08, 0.14, 10, STEEL, [-0.95, 4.2, -2.0], turret, { dir: [-0.3, 0.8, 0.5] });
  b.part(new THREE.SphereGeometry(0.06, 5, 4), "#ff4a3a", { bone: turret, at: [-0.82, 4.35, -1.8] });
  // turret numbers
  decal(EMBLEM, [0, 2.95, 0.51 + 0.012], [0, 0.0, 1], 0.001, 0.001, turret);
  decal(WARN, [1.0, 3.55 + 0.0, -0.17], [0, 0, 1], 0.38, 0.38, turret, { up: [0, 1, 0] });

  // capacitor bank on rear deck
  for (let r = 0; r < 2; r++)
    for (let c = -1; c <= 1; c++) {
      const x = c * 0.8;
      const z = -3.6 - r * 0.7;
      cyl(0.28, 0.28, 0.9, 8, GUN_L, [x, 2.98, z], hull);
      glow(cyl(0.3, 0.3, 0.12, 8, CYAN, [x, 3.15, z], hull), 1.4);
      glow(cyl(0.3, 0.3, 0.06, 8, CYAN, [x, 2.78, z], hull), 1.2);
      cyl(0.18, 0.18, 0.1, 6, BLACK, [x, 3.47, z], hull);
    }
  box(2.4, 0.1, 0.1, STEEL, [0, 3.55, -3.6], hull);
  box(2.4, 0.1, 0.1, STEEL, [0, 3.55, -4.3], hull);
  b.rod([0, 3.5, -3.6], [0, 3.7, -2.3], 0.07, BLACK, { bone: hull }); // heavy cable to breech
  decal(WARN, [0, 2.96, -4.72], [0, 0, -1], 0.45, 0.45, hull);

  // ---------- the railgun ----------
  const GY = 3.6;
  box(1.3, 1.0, 1.6, GUN, [0, GY, -2.4], gun); // breech
  box(1.1, 0.12, 1.3, GUN_L, [0, GY + 0.56, -2.4], gun);
  glow(box(0.5, 0.08, 0.5, CYAN, [0, GY + 0.63, -2.4], gun), 1.3);
  for (const s of [1, -1]) {
    box(0.12, 0.9, 4.6, GUN, [s * 0.8, GY, -0.1], gun); // cradle plates
    box(0.2, 0.2, 4.6, STEEL, [s * 0.8, GY + 0.5, -0.1], gun);
    // rails
    box(0.24, 0.3, 11.2, STEEL, [s * 0.3, GY, 3.4], gun);
    box(0.28, 0.08, 11.2, GUN_L, [s * 0.3, GY + 0.19, 3.4], gun);
    glow(box(0.04, 0.12, 11.0, CYAN, [s * 0.17, GY, 3.4], gun), 1.5);
    // hydraulic recoil buffers
    cyl(0.12, 0.12, 2.4, 6, STEEL, [s * 0.55, GY - 0.55, -0.5], gun, { dir: [0, 0, 1] });
  }
  // spacers, clamps and coil rings
  for (let k = 0; k < 7; k++) {
    const z = -0.5 + k * 1.4;
    box(0.95, 0.1, 0.34, GUN, [0, GY + 0.24, z], gun);
    box(0.95, 0.1, 0.34, GUN, [0, GY - 0.24, z], gun);
  }
  for (let k = 0; k < 5; k++) {
    const z = 3.6 + k * 1.15;
    glow(
      b.part(new THREE.TorusGeometry(0.62, 0.07, 4, 8), CYAN, { bone: gun, at: [0, GY, z], flat: true }),
      1.2,
    );
  }
  for (let k = 0; k < 3; k++) cyl(0.7, 0.7, 0.22, 8, GUN, [0, GY, 1.2 + k * 0.0 + k * 0.0 - 0.0 + k * 0.25], gun, { dir: [0, 0, 1], flat: true });
  // muzzle
  box(1.2, 0.18, 0.6, GUN, [0, GY + 0.45, 9.1], gun);
  box(1.2, 0.18, 0.6, GUN, [0, GY - 0.45, 9.1], gun);
  box(0.16, 0.9, 0.6, GUN, [-0.6, GY, 9.1], gun);
  box(0.16, 0.9, 0.6, GUN, [0.6, GY, 9.1], gun);
  decal(CHEVRON, [0, GY + 0.55, 9.1], [0, 1, 0], 1.2, 0.2, gun, { up: [0, 0, 1] });
  // targeting sensor on gun
  box(0.35, 0.3, 0.6, GUN, [0.9, GY + 0.75, 0.6], gun);
  glow(box(0.2, 0.14, 0.04, CYAN, [0.9, GY + 0.75, 0.92], gun), 1.3);

  return b.root;
}
```