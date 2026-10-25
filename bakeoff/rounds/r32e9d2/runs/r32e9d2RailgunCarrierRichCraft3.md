```ts
import * as THREE from "three";
import { createBuilder, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a camo armoured hull, an elevated twin-rail railgun with glowing coils, and four deployed stabiliser legs on pads.",
};

// ---------- palette ----------
const OLV = "#59623f";
const DKG = "#3e4631";
const TAN = "#8c8156";
const DARK = "#24282a";
const RUBBER = "#1b1c1e";
const CYAN = "#52e6ff";
const AMBER = "#ffb22e";
const RED = "#ff3b2e";
const WHITE = "#ffffff";

const STEEL = metal("steel", { tarnish: 0.3 });
const IRON = metal("iron");
const COPPER = metal("copper", { verdigris: 0.2 });

const camoBase = paint((p, n) => {
  const a = noise(p, 1.4, 3);
  const c = noise(p, 0.9, 11);
  const base = a > 0.58 ? TAN : c > 0.6 ? DKG : OLV;
  let col = mix(base, base, 0);
  col = mix(col, "#e8f0ff", 0.12 * smoothstep(0.3, 1, n.y));
  col = mix(col, "#0d0f0b", 0.25 * smoothstep(0.2, -0.9, n.y));
  col = mix(col, "#4a3a28", 0.55 * smoothstep(1.1, 0.4, p.y) * (0.5 + noise(p, 0.3, 5)));
  return col;
});
const HULL = panelled(camoBase, { size: 0.9, aspect: 0.75 });

// ---------- textures ----------
let hz = "";
for (let i = 0; i < 6; i++)
  hz += `<polygon points="${i * 16 - 8},16 ${i * 16},16 ${i * 16 + 8},0 ${i * 16},0" fill="#1b1b1b"/>`;
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b81c"/>${hz}<rect width="64" height="16" fill="none" stroke="#1b1b1b" stroke-width="1.5"/></svg>`,
  { size: 128 },
);
let slats = "";
for (let i = 0; i < 9; i++) slats += `<rect x="6" y="${7 + i * 9}" width="88" height="5" rx="1" fill="#3b4144"/>`;
const GRILLE = svg(
  `<svg viewBox="0 0 100 90"><rect width="100" height="90" rx="6" fill="#121516" stroke="#555c60" stroke-width="3"/>${slats}</svg>`,
  { size: 128 },
);
const VISOR = svg(
  `<svg viewBox="0 0 100 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#58d9e2"/><stop offset="1" stop-color="#0a3445"/></linearGradient></defs>
  <rect width="100" height="48" rx="4" fill="url(#g)" stroke="#15191a" stroke-width="4"/>
  <polygon points="12,44 30,4 42,4 24,44" fill="#ffffff" opacity="0.28"/><polygon points="48,44 60,4 66,4 54,44" fill="#ffffff" opacity="0.2"/>
  <line x1="50" y1="2" x2="50" y2="46" stroke="#15191a" stroke-width="2.5"/></svg>`,
  { size: 192 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#e9e4cf" stroke-width="6"/>
  <polygon points="50,16 58,40 84,40 63,55 71,80 50,65 29,80 37,55 16,40 42,40" fill="#e9e4cf"/>
  <text x="50" y="97" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="17" fill="#e9e4cf">RG-6</text></svg>`,
  { size: 192 },
);
const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#6a6f76" stroke="#2a2d31" stroke-width="4"/><circle cx="50" cy="50" r="30" fill="#8b9098" stroke="#2a2d31" stroke-width="3"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${50 + 38 * Math.cos((i * Math.PI) / 3)}" cy="${50 + 38 * Math.sin((i * Math.PI) / 3)}" r="4" fill="#2a2d31"/>`).join("")}
  <circle cx="50" cy="50" r="10" fill="#d9a21b" stroke="#2a2d31" stroke-width="3"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 100 70"><rect width="100" height="70" rx="5" fill="#04161b" stroke="#2b3236" stroke-width="4"/>
  <text x="8" y="18" font-family="monospace" font-weight="bold" font-size="11" fill="#52e6ff">CHARGE 87%</text>
  <rect x="8" y="26" width="84" height="8" fill="#0d3a44"/><rect x="8" y="26" width="73" height="8" fill="#52e6ff"/>
  <polyline points="8,62 22,48 34,56 48,40 62,50 76,38 92,44" fill="none" stroke="#52e6ff" stroke-width="2.5"/></svg>`,
  { size: 128 },
);
const WARN = svg(
  `<svg viewBox="0 0 100 90"><polygon points="50,4 96,86 4,86" fill="#e8b81c" stroke="#1b1b1b" stroke-width="7" stroke-linejoin="round"/>
  <polygon points="54,26 34,54 48,54 44,74 66,44 52,44" fill="#1b1b1b"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier", paintSize: 2048 });
  const V = THREE.Vector3;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const box = (w: number, h: number, d: number, color: any, at: number[], o: Record<string, any> = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as [number, number, number], ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cyl = (r: number, h: number, color: any, at: number[], dir: number[], seg = 8, o: Record<string, any> = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, {
      at: at as [number, number, number],
      dir: dir as [number, number, number],
      ...o,
    });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), WHITE, {
      at: at as [number, number, number],
      dir: dir as [number, number, number],
      axis: "z",
      texture: tex,
    });

  // ---------- hull ----------
  const hull = b.extrude(
    [
      [-4.2, 0.9],
      [4.1, 0.9],
      [4.1, 1.6],
      [3.3, 1.8],
      [-4.2, 1.8],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, bevel: 0.05, color: HULL },
  );
  void hull;
  box(2.2, 0.2, 7.6, DARK, [0, 0.82, -0.1]);
  // cab
  b.extrude(
    [
      [2.0, 1.8],
      [4.0, 1.8],
      [4.0, 2.3],
      [3.3, 2.9],
      [2.0, 2.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.05, color: HULL },
  );
  plane(1.9, 0.92, VISOR, [0, 2.615, 3.663], [0, 0.759, 0.651]);
  for (const s of [1, -1]) {
    plane(0.9, 0.5, VISOR, [s * 1.112, 2.4, 3.0], [s, 0, 0]);
    plane(0.45, 0.45, EMBLEM, [s * 1.112, 2.35, 2.2], [s, 0, 0]);
    glow(box(0.35, 0.18, 0.08, AMBER, [s * 0.85, 2.05, 4.02]), 1.5);
    box(0.08, 0.3, 0.2, DARK, [s * 1.2, 2.5, 3.9]); // mirror
    glow(box(0.3, 0.15, 0.05, RED, [s * 1.0, 1.3, -4.22]), 1.5);
    box(0.5, 0.3, 1.2, TAN, [s * 0.95, 1.95, 1.2]); // cassette lockers
    box(0.52, 0.06, 1.0, DARK, [s * 0.95, 2.12, 1.2]);
  }
  plane(0.9, 0.4, GRILLE, [0, 2.05, 4.012], [0, 0, 1]);
  box(2.9, 0.3, 0.3, WHITE, [0, 1.0, 4.25], { texture: HAZARD });
  box(2.8, 0.25, 0.2, WHITE, [0, 1.0, -4.3], { texture: HAZARD });
  // roof gear
  glow(box(1.2, 0.1, 0.15, AMBER, [0, 2.97, 2.5]), 1.3);
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.28, 0.1],
      [0.18, 0.2],
      [0, 0.24],
    ],
    { at: [-0.6, 2.9, 2.5], color: IRON, segments: 8 },
  );
  b.rod([0.6, 2.9, 2.4], [0.6, 3.9, 2.3], 0.02, DARK);

  // ---------- power unit ----------
  box(2.2, 0.7, 1.5, HULL, [0, 2.15, -3.3]);
  plane(1.9, 0.5, GRILLE, [0, 2.1, -4.062], [0, 0, -1]);
  box(1.4, 0.06, 0.9, DARK, [0, 2.53, -3.3]);
  for (const s of [1, -1]) {
    cyl(0.14, 0.9, IRON, [s * 0.95, 2.95, -3.0], [0, 1, 0]);
    cyl(0.2, 0.1, DARK, [s * 0.95, 3.43, -3.0], [0, 1, 0]);
    plane(0.4, 0.36, WARN, [s * 1.112, 2.15, -3.3], [s, 0, 0]);
  }

  // ---------- wheels, axles ----------
  for (const z of [2.9, 0, -2.9]) {
    cyl(0.1, 3.7, DARK, [0, 0.7, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), IRON, { at: [0, 0.7, z] });
    for (const s of [1, -1]) {
      const x = s * 1.55;
      cyl(0.7, 0.5, RUBBER, [x, 0.7, z], [1, 0, 0], 16);
      cyl(0.43, 0.54, STEEL, [x, 0.7, z], [1, 0, 0], 12);
      plane(0.6, 0.6, HUB, [s * 1.83, 0.7, z], [s, 0, 0]);
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        const d = [0, Math.cos(a), Math.sin(a)];
        box(0.52, 0.12, 0.22, RUBBER, [x, 0.7 + d[1] * 0.66, z + d[2] * 0.66], { dir: d });
      }
      box(0.75, 0.14, 1.7, HULL, [s * 1.58, 1.5, z]);
      box(0.06, 0.4, 1.4, DARK, [s * 1.94, 1.27, z]); // mudflap lip
    }
  }

  // ---------- stabiliser legs ----------
  for (const s of [1, -1])
    for (const z of [1.4, -1.4]) {
      box(0.35, 0.6, 0.6, IRON, [s * 1.45, 1.25, z]); // mount block
      b.frustumBox([s * 1.4, 1.3, z], [s * 2.75, 1.3, z], [0.4, 0.4], [0.4, 0.4], { color: HULL });
      box(0.5, 0.44, 0.46, WHITE, [s * 2.1, 1.3, z], { texture: HAZARD });
      b.part(new THREE.SphereGeometry(0.24, 8, 6), IRON, { at: [s * 2.75, 1.3, z] });
      b.rod([s * 2.9, 1.2, z], [s * 3.02, 0.62, z], 0.17, STEEL);
      b.rod([s * 3.02, 0.62, z], [s * 3.1, 0.22, z], 0.1, IRON);
      b.rod([s * 1.42, 0.98, z], [s * 2.95, 0.78, z], 0.08, DARK);
      b.part(new THREE.SphereGeometry(0.17, 6, 5), IRON, { at: [s * 3.1, 0.24, z] });
      cyl(0.62, 0.18, DARK, [s * 3.1, 0.09, z], [0, 1, 0], 8);
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2 + Math.PI / 4;
        box(0.12, 0.1, 0.5, AMBER, [s * 3.1 + Math.cos(a) * 0.4, 0.2, z + Math.sin(a) * 0.4], {
          rotation: [0, -(a * 180) / Math.PI + 90, 0],
        });
      }
    }

  // ---------- turret ----------
  cyl(1.15, 0.25, DARK, [0, 1.92, -1.2], [0, 1, 0], 12);
  const turret = b.extrude(
    [
      [-2.4, 2.05],
      [0.6, 2.05],
      [0.6, 2.8],
      [0.2, 3.3],
      [-1.8, 3.3],
      [-2.4, 2.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.05, color: HULL },
  );
  for (const s of [1, -1]) {
    b.decal(turret, EMBLEM, { at: [s * 0.9, 2.8, -0.9], dir: [s, 0, 0], size: [0.8, 0.8] });
    plane(0.55, 0.38, SCREEN, [s * 0.912, 2.5, -1.9], [s, 0, 0]);
    glow(box(0.1, 0.3, 0.3, RED, [s * 0.85, 3.5, 0.15]), 1.2);
  }
  glow(b.part(new THREE.PlaneGeometry(0.3, 0.2), "#04161b", { at: [0, 0, 0] }), 0.0);
  cyl(0.35, 0.15, DARK, [0.45, 3.37, -1.7], [0, 1, 0], 8);
  b.rod([-0.7, 3.3, -2.1], [-0.8, 4.9, -2.3], 0.02, DARK);
  b.rod([-0.5, 3.3, -2.1], [-0.4, 4.3, -2.2], 0.02, DARK);

  // ---------- railgun ----------
  const EL = (18 * Math.PI) / 180;
  const D = new V3(0, Math.sin(EL), Math.cos(EL));
  const N = new V3(0, Math.cos(EL), -Math.sin(EL));
  const P = new V3(0, 3.0, -1.0);
  const bp = (s: number, x = 0, v = 0) =>
    P.clone().addScaledVector(D, s).add(new V3(x, 0, 0)).addScaledVector(N, v);
  const alongD = (geo: THREE.BufferGeometry, color: unknown, s: number, x = 0, v = 0) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    b.part(geo, color as any, { at: bp(s, x, v), dir: D });

  for (const s of [1, -1]) {
    alongD(new THREE.BoxGeometry(0.24, 10.2, 0.36), STEEL, 4.9, s * 0.33);
    alongD(new THREE.BoxGeometry(0.16, 10.0, 0.06), COPPER, 4.9, s * 0.33, 0.2);
    alongD(new THREE.CylinderGeometry(0.12, 0.12, 3, 8), IRON, 1.0, s * 0.3, -0.6);
  }
  glow(alongD(new THREE.BoxGeometry(0.42, 8.4, 0.1), CYAN, 5.8), 1.4);
  alongD(new THREE.BoxGeometry(1.5, 1.0, 0.95), IRON, 1.3);
  alongD(new THREE.BoxGeometry(1.3, 1.0, 0.8), DARK, -0.3);
  for (let k = 0; k < 6; k++) alongD(new THREE.BoxGeometry(1.15, 0.28, 0.8), IRON, 2.3 + k * 1.4);
  for (let k = 0; k < 5; k++)
    glow(
      b.part(new THREE.TorusGeometry(0.62, 0.08, 4, 8), CYAN, { at: bp(3.0 + k * 1.4), dir: D, axis: "z" }),
      1.6,
    );
  alongD(new THREE.BoxGeometry(1.3, 0.5, 0.9), STEEL, 9.9);
  glow(alongD(new THREE.BoxGeometry(0.5, 0.52, 0.12), CYAN, 9.95), 1.8);
  for (const s of [1, -1]) alongD(new THREE.BoxGeometry(0.1, 0.4, 1.1), DARK, 9.7, s * 0.7);

  return b.root;
}
```