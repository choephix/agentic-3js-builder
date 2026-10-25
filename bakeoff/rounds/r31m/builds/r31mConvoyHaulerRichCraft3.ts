import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler Mk-VII",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler: wedge armoured cab with roof turret, neon trim, and a ribbed, sealed cargo pod with glowing lock seals.",
};

// ---------- palette ----------
const CYAN = "#19f2ff";
const MAGENTA = "#ff2bd6";
const AMBER = "#ffb020";
const RED = "#ff2a3a";
const DARK = "#191b24";
const STEEL = "#4b5164";
const RIM = "#5d647c";
const TIRE = "#121217";

// ---------- paints ----------
const ARMOR = paint((p, n) => {
  let c = mix("#262a38", "#4d566f", smoothstep(-0.3, 1, n.y));
  c = mix(c, "#3a4258", noise(p, 0.25, 2) * 0.4);
  c = mix(c, "#1a1612", smoothstep(1.6, 0.7, p.y) * noise(p, 0.3, 4) * 0.75);
  if (Math.abs(n.x) > 0.7 && Math.abs(p.y - 1.62) < 0.035) return "#c21fa6";
  return c;
});

const POD = paint((p, n) => {
  let c = mix("#9aa8bb", "#e4ecf3", smoothstep(-0.2, 1, n.y));
  c = mix(c, "#6e7b8e", noise(p, 0.35, 5) * 0.5);
  c = mix(c, "#2c2a30", smoothstep(2.1, 1.3, p.y) * (0.4 + 0.6 * noise(p, 0.4, 9)) * 0.7);
  const f = (p.y * 1.5) % 1;
  if (f > 0 && f < 0.025 && Math.abs(n.y) < 0.5) c = mix(c, "#3a4152", 0.8);
  return c;
});

// ---------- textures ----------
const hazardPolys = Array.from({ length: 9 }, (_, i) => {
  const x = i * 10 - 10;
  return `<polygon points="${x},16 ${x + 5},16 ${x + 13},0 ${x + 8},0" fill="#101014"/>`;
}).join("");
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c200"/>${hazardPolys}</svg>`,
  { size: 128 },
);

const VISOR = svg(
  `<svg viewBox="0 0 128 60">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#04161e"/><stop offset="1" stop-color="#0b4050"/></linearGradient></defs>
  <rect width="128" height="60" fill="url(#g)"/>
  <path d="M0 15H128M0 30H128M0 45H128M32 0V60M64 0V60M96 0V60" stroke="#19f2ff" stroke-opacity="0.18" stroke-width="0.7"/>
  <circle cx="64" cy="30" r="12" fill="none" stroke="#19f2ff" stroke-width="1.4"/>
  <path d="M64 12V22M64 38V48M46 30H56M72 30H82" stroke="#19f2ff" stroke-width="1.4"/>
  <text x="6" y="10" font-family="monospace" font-size="7" fill="#19f2ff">ESCORT-9 // LINK OK</text>
  <text x="84" y="55" font-family="monospace" font-size="7" fill="#ff2bd6">SPD 062</text>
  <polygon points="0,60 30,0 44,0 14,60" fill="#ffffff" fill-opacity="0.07"/>
  <rect x="1" y="1" width="126" height="58" fill="none" stroke="#0a0a10" stroke-width="2"/>
</svg>`,
  { size: 256 },
);

const barcode = Array.from({ length: 14 }, (_, i) => `<rect x="${112 + i * 5}" y="90" width="${i % 3 === 0 ? 3 : 1.6}" height="16" fill="#19f2ff"/>`).join("");
const EMBLEM = svg(
  `<svg viewBox="0 0 200 120">
  <rect x="3" y="3" width="194" height="114" rx="8" fill="#0a0614" fill-opacity="0.92" stroke="#ff2bd6" stroke-width="3"/>
  <path d="M10 22V10H22M190 22V10H178M10 98V110H22M190 98V110H178" stroke="#19f2ff" stroke-width="3" fill="none"/>
  <path d="M55 14 L95 22 V62 Q95 84 55 98 Q15 84 15 62 V22 Z" transform="translate(5 0)" fill="#1a0f2e" stroke="#ff2bd6" stroke-width="3"/>
  <rect x="42" y="50" width="36" height="28" rx="3" fill="#19f2ff"/>
  <path d="M48 50 V40 Q60 24 72 40 V50" stroke="#19f2ff" stroke-width="6" fill="none"/>
  <rect x="57" y="58" width="6" height="12" fill="#0a0614"/>
  <text x="105" y="42" font-family="monospace" font-weight="bold" font-size="22" fill="#ff2bd6">SEALED</text>
  <text x="105" y="62" font-family="monospace" font-weight="bold" font-size="12" fill="#19f2ff">CARGO 7-K</text>
  <text x="105" y="78" font-family="monospace" font-size="8" fill="#ffb020">NO INSPECTION</text>
  ${barcode}
</svg>`,
  { size: 512 },
);

const SEAL = svg(
  `<svg viewBox="0 0 120 90">
  <rect x="2" y="2" width="116" height="86" rx="6" fill="#0a0614" fill-opacity="0.93" stroke="#19f2ff" stroke-width="2.5"/>
  <circle cx="60" cy="42" r="30" fill="none" stroke="#ff2bd6" stroke-width="3"/>
  <circle cx="60" cy="42" r="22" fill="none" stroke="#19f2ff" stroke-width="1.5" stroke-dasharray="4 3"/>
  <path d="M60 8V18M60 66V76M26 42H36M84 42H94M36 18L43 25M84 66L77 59M36 66L43 59M84 18L77 25" stroke="#ff2bd6" stroke-width="2.5"/>
  <rect x="49" y="38" width="22" height="18" rx="2" fill="#ff2bd6"/>
  <path d="M53 38V32Q60 22 67 32V38" stroke="#ff2bd6" stroke-width="4" fill="none"/>
  <rect x="58" y="43" width="4" height="8" fill="#0a0614"/>
  <text x="60" y="84" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#ffb020">DO NOT OPEN // BIO-LOCK</text>
</svg>`,
  { size: 384 },
);

const eyeSvg = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 64 24"><g ${flip ? 'transform="translate(64 0) scale(-1 1)"' : ""}>
  <polygon points="1,6 63,2 63,18 8,23" fill="#06080c"/>
  <polygon points="6,9 58,5 58,12 14,18" fill="#19f2ff"/>
  <polygon points="40,7 58,5 58,9 44,11" fill="#ffffff"/>
</g></svg>`,
    { size: 128 },
  );
const EYE_R = eyeSvg(false);
const EYE_L = eyeSvg(true);

const slits = [4, 10, 16, 22]
  .map((y, i) => `<rect x="6" y="${y}" width="68" height="3" fill="${i % 2 ? "#ff2bd6" : "#19f2ff"}"/>`)
  .join("");
const GRILL = svg(`<svg viewBox="0 0 80 28"><rect width="80" height="28" fill="#08090d"/>${slits}</svg>`, { size: 160 });

const HUB = svg(
  `<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="31" fill="#20232e" stroke="#19f2ff" stroke-width="2.5"/>
  <polygon points="32,10 51,21 51,43 32,54 13,43 13,21" fill="none" stroke="#ff2bd6" stroke-width="2"/>
  ${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${32 + 21 * Math.sin((a * Math.PI) / 180)}" cy="${32 - 21 * Math.cos((a * Math.PI) / 180)}" r="2.4" fill="#cfd6e6"/>`).join("")}
  <circle cx="32" cy="32" r="8" fill="#ff2bd6"/><circle cx="32" cy="32" r="3" fill="#0a0614"/>
</svg>`,
  { size: 128 },
);

const plateTex = (text: string) =>
  svg(
    `<svg viewBox="0 0 80 40">
  <rect x="2" y="2" width="76" height="36" rx="4" fill="#10131a" fill-opacity="0.9" stroke="#e8eef5" stroke-width="2"/>
  <text x="40" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#e8eef5">${text}</text>
  <rect x="8" y="31" width="64" height="3" fill="#ffb020"/>
</svg>`,
    { size: 192 },
  );
const PLATE_CAB = plateTex("C-07");
const PLATE_POD = plateTex("POD-7");

// ---------- build ----------
export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  const rand = rng(7);

  type V = [number, number, number];
  const part = (geo: THREE.BufferGeometry, color: any, at: V, o: Record<string, any> = {}) =>
    b.part(geo, color, { at, ...o });
  const box = (w: number, h: number, d: number, at: V, color: any, o: Record<string, any> = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r1: number, r2: number, h: number, seg: number, at: V, color: any, dir: V = [0, 1, 0], o: Record<string, any> = {}) =>
    part(new THREE.CylinderGeometry(r1, r2, h, seg), color, at, { dir, flat: true, ...o });
  const plane = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, g = 0, up?: V) => {
    const p = part(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, up });
    if (g) glow(p, g);
    return p;
  };

  // ----- chassis -----
  box(2.2, 0.4, 9.0, [0, 0.85, -0.3], DARK);
  box(1.7, 0.12, 8.6, [0, 0.62, -0.3], STEEL);
  for (const s of [1, -1]) {
    cyl(0.04, 0.04, 8.0, 6, [s * 0.9, 0.55, -0.3], CYAN, [0, 0, 1]);
    glow(b.rod([s * 0.9, 0.55, -4.3], [s * 0.9, 0.55, 3.7], 0.04, CYAN, { caps: "flat" }), 1.4);
  }

  // ----- axles and wheels -----
  const axles = [2.8, -1.4, -3.0];
  for (const z of axles) {
    cyl(0.1, 0.1, 2.9, 8, [0, 0.6, z], STEEL, [1, 0, 0]);
    for (const x of [1.4, -1.4]) {
      const s = Math.sign(x);
      cyl(0.6, 0.6, 0.56, 12, [x, 0.6, z], TIRE, [1, 0, 0]);
      cyl(0.36, 0.36, 0.6, 10, [x, 0.6, z], RIM, [1, 0, 0]);
      plane(HUB, 0.7, 0.7, [x + s * 0.306, 0.6, z], [s, 0, 0], 0.8);
      box(0.72, 0.18, 1.4, [x, 1.22, z], ARMOR);
    }
  }
  for (const s of [1, -1]) box(0.6, 0.5, 0.05, [s * 1.4, 0.62, -3.75], DARK);

  // ----- fuel tanks -----
  for (const s of [1, -1]) {
    cyl(0.3, 0.3, 1.4, 8, [s * 1.3, 0.8, 0.7], "#2f4a52", [0, 0, 1]);
    cyl(0.31, 0.31, 0.1, 8, [s * 1.3, 0.8, 0.35], DARK, [0, 0, 1]);
    cyl(0.31, 0.31, 0.1, 8, [s * 1.3, 0.8, 1.05], DARK, [0, 0, 1]);
  }

  // ----- cab -----
  b.extrude(
    [[1.7, 1.15], [4.5, 1.15], [4.5, 1.95], [4.05, 2.3], [3.4, 3.1], [2.1, 3.1], [1.7, 2.95]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.5, bevel: 0.05, color: ARMOR },
  );
  plane(VISOR, 2.1, 1.0, [0, 2.707, 3.733], [0, 0.65, 0.8], 0.7);
  for (const s of [1, -1]) {
    plane(VISOR, 1.0, 0.5, [s * 1.262, 2.55, 2.75], [s, 0, 0], 0.5);
    plane(s > 0 ? PLATE_CAB : PLATE_CAB, 0.8, 0.4, [s * 1.262, 1.85, 2.9], [s, 0, 0], 0.6);
    for (let i = 0; i < 6; i++) {
      const z = 2.0 + i * 0.4;
      box(0.06, 0.22, 0.32, [s * 1.28, 1.4 + (rand() - 0.5) * 0.02, z], i % 2 ? "#3b4460" : "#2f364c");
    }
    // mirrors
    b.rod([s * 1.25, 2.5, 3.9], [s * 1.6, 2.6, 3.95], 0.025, STEEL);
    box(0.1, 0.45, 0.3, [s * 1.65, 2.6, 3.95], DARK);
    glow(box(0.02, 0.38, 0.24, [s * 1.7, 2.6, 3.95], CYAN), 0.7);
    // exhaust stacks
    cyl(0.11, 0.11, 2.2, 8, [s * 1.38, 2.4, 1.95], STEEL);
    for (const y of [1.8, 2.4, 3.0]) cyl(0.145, 0.145, 0.1, 8, [s * 1.38, y, 1.95], DARK);
    glow(cyl(0.13, 0.13, 0.06, 8, [s * 1.38, 3.52, 1.95], AMBER), 1.6);
    // antennas
    const ah = 4.2 + rand() * 0.4;
    b.rod([s * 1.0, 3.1, 2.2], [s * 1.0, ah, 2.15], 0.022, STEEL);
    glow(part(new THREE.SphereGeometry(0.06, 6, 4), s > 0 ? MAGENTA : CYAN, [s * 1.0, ah + 0.04, 2.15]), 2);
    // headlights
    box(0.62, 0.3, 0.06, [s * 0.85, 1.76, 4.5], DARK);
    plane(s > 0 ? EYE_L : EYE_R, 0.54, 0.2, [s * 0.85, 1.76, 4.535], [0, 0, 1], 1.5);
  }
  plane(GRILL, 2.0, 0.4, [0, 1.38, 4.505], [0, 0, 1], 0.9);
  glow(box(1.8, 0.08, 0.1, [0, 3.14, 3.32], AMBER), 1.6);

  // bumper, spikes
  box(2.9, 0.5, 0.46, [0, 0.9, 4.7], ARMOR);
  plane(HAZARD, 2.7, 0.3, [0, 0.9, 4.935], [0, 0, 1]);
  for (const x of [-1.2, -0.4, 0.4, 1.2]) b.spike([x, 0.9, 4.93], [0, 0, 1], 0.35, 0.09, { color: DARK, sides: 6 });
  glow(b.rod([-1.2, 1.28, 4.7], [1.2, 1.28, 4.7], 0.03, MAGENTA, { caps: "flat" }), 1.4);

  // ----- turret -----
  cyl(0.5, 0.55, 0.24, 8, [0, 3.22, 2.75], STEEL);
  box(0.95, 0.4, 0.8, [0, 3.55, 2.75], ARMOR);
  box(0.6, 0.18, 0.5, [0, 3.84, 2.7], DARK);
  glow(box(0.2, 0.12, 0.06, [0, 3.62, 3.16], RED), 2);
  for (const s of [1, -1]) {
    box(0.2, 0.2, 0.5, [s * 0.3, 3.55, 3.2], STEEL);
    b.rod([s * 0.3, 3.55, 3.4], [s * 0.3, 3.55, 4.45], 0.06, DARK, { sides: 6 });
    glow(b.rod([s * 0.3, 3.55, 4.45], [s * 0.3, 3.55, 4.55], 0.075, MAGENTA, { sides: 6, caps: "flat" }), 2);
  }

  // dish
  b.rod([0, 3.1, 1.95], [0, 3.28, 1.88], 0.04, STEEL);
  b.lathe([[0, 0], [0.4, 0.14], [0.4, 0.16], [0, 0.04]], { at: [0, 3.3, 1.88], axis: [0, 0.7, -0.7], color: RIM });

  // ----- coupling -----
  box(1.6, 0.5, 0.5, [0, 1.5, 1.55], DARK);
  for (const x of [-0.4, 0.4]) glow(b.rod([x, 2.1, 1.75], [x, 2.1, 1.35], 0.05, CYAN, { sides: 6 }), 1.2);

  // ----- cargo pod -----
  const hull: [number, number][] = [
    [-1.2, 1.3], [1.2, 1.3], [1.5, 1.65], [1.5, 3.0], [1.15, 3.4], [-1.15, 3.4], [-1.5, 3.0], [-1.5, 1.65],
  ];
  b.extrude(hull, { at: [0, 0, -1.4], x: [1, 0, 0], thickness: 5.6, bevel: 0.06, color: POD });
  const ribOutline = hull.map(([x, y]) => [x * 1.05, (y - 2.35) * 1.04 + 2.35] as [number, number]);
  const ribZ = [1.3, -0.2, -2.6, -4.1];
  for (const z of ribZ) {
    b.extrude(ribOutline, { at: [0, 0, z], x: [1, 0, 0], thickness: 0.16, bevel: 0.03, color: "#23262f" });
    for (const s of [1, -1]) glow(cyl(0.09, 0.09, 0.12, 6, [s * 0.8, 3.52, z], MAGENTA), 1.8);
  }
  // roof details
  glow(box(0.08, 0.03, 5.4, [0, 3.41, -1.4], CYAN), 1.6);
  for (const s of [1, -1]) box(0.5, 0.1, 0.8, [s * 0.7, 3.43, 0.5], DARK);
  cyl(0.22, 0.26, 0.12, 8, [0, 3.46, -1.4], DARK);
  glow(cyl(0.16, 0.16, 0.18, 8, [0, 3.6, -1.4], AMBER), 2);

  // rear defence turret
  cyl(0.3, 0.34, 0.16, 8, [0, 3.48, -3.3], STEEL);
  part(new THREE.SphereGeometry(0.28, 8, 6), ARMOR, [0, 3.65, -3.3]);
  glow(part(new THREE.SphereGeometry(0.07, 6, 4), RED, [0, 3.7, -3.55]), 2);
  for (const s of [1, -1]) b.rod([s * 0.12, 3.75, -3.4], [s * 0.12, 3.75, -4.3], 0.045, DARK, { sides: 6 });

  // side decals and neon
  for (const s of [1, -1]) {
    plane(EMBLEM, 2.0, 1.2, [s * 1.51, 2.35, -1.4], [s, 0, 0], 0.95);
    plane(HAZARD, 1.1, 0.28, [s * 1.505, 1.95, 0.55], [s, 0, 0]);
    plane(PLATE_POD, 0.9, 0.45, [s * 1.505, 2.4, -3.35], [s, 0, 0], 0.6);
    glow(b.rod([s * 1.58, 1.58, 1.1], [s * 1.58, 1.58, -4.1], 0.028, MAGENTA, { sides: 6, caps: "flat" }), 1.6);
    // rear lights
    glow(box(0.4, 0.18, 0.06, [s * 1.05, 0.9, -5.06], RED), 1.8);
  }

  // rear door
  plane(SEAL, 2.4, 1.8, [0, 2.35, -4.215], [0, 0, -1], 0.9);
  for (const y of [1.3, 3.4]) box(2.5, 0.08, 0.06, [0, y, -4.22], "#23262f");

  // rear bumper
  box(2.6, 0.5, 0.4, [0, 0.9, -4.85], ARMOR);
  plane(HAZARD, 1.6, 0.28, [0, 0.9, -5.055], [0, 0, -1]);
  cyl(0.06, 0.06, 0.3, 6, [0, 0.75, -5.15], STEEL, [0, 0, 1]);

  return b.root;
}
