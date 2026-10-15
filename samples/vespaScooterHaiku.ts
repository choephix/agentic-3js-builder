import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { mix, noise, paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Italian delivery scooter",
  description:
    "A mint-teal Vespa-style scooter at real size: a rear rack carrying a closed plank crate and an open crate of lemons, bread, leaves and a glowing parcel crystal, with gold filigree, tassels, a cel-shaded headlamp and a number plate.",
  style: "Genshin/anime mix",
  commit: "b816db2",
};

// ---- palette: cel-shaded, bright, Genshin-like accents -----------------------------------------
const BODY = cel(paint((p, _n) => (p.y < 0.44 ? "#ffe6b8" : "#3ccab3"))); // cream skirt, mint body
const SEAT = cel("#e8553f", "#a8322e");
const GOLD = cel("#ffd45c", "#c98b33");
const SILVER = cel("#e6edf5", "#8d99ad");
const TYRE = cel("#3a3f55", "#1f2232");
const FLOOR = cel("#2f3548", "#1b1f2e");
const GRIP = cel("#4c5570", "#2a3045");
const LEATHER = cel("#7a4426", "#43230f");
const LEMON = cel("#ffd23f", "#d9921c");
const BREAD = cel(paint((_p, _n, s) => (Math.cos((s[1] * Math.PI) / 180) > 0.8 && (s[0] * 8) % 1 < 0.25 ? "#fff3d6" : "#e9ad62")));
const LAMP = "#fff6c2"; // glowing flat colours
const TAIL = "#ff5a4a";
const CRYSTAL = "#8ff8ff";
const MIRROR = "#cfe9f5";
const FENDER = cel("#3ccab3", "#1f8f98");
const ROPE = cel("#d9b67a", "#a0763a");

// Planks: a dark seam every period, a soft grain between.
const plank = (light: string, dark: string, period: number, seed: number) =>
  paint((p, _n) => {
    const row = p.y / period;
    if (row - Math.floor(row) < 0.09) return dark;
    return mix(light, dark, 0.3 * noise(p, 0.06, seed));
  });
const WOOD = cel(plank("#e0a262", "#7d4b27", 0.05, 7));

// ---- textures ------------------------------------------------------------------------------------
const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
<g fill="none" stroke="#ffd45c" stroke-width="5" stroke-linecap="round">
<path d="M8 84 C6 40 44 18 68 40 C86 58 62 80 50 64 C40 50 58 36 70 46"/>
<path d="M192 84 C194 40 156 18 132 40 C114 58 138 80 150 64 C160 50 142 36 130 46"/>
<path d="M70 46 C84 22 116 22 130 46"/>
<path d="M30 92 H170" stroke-width="3"/>
<circle cx="100" cy="66" r="6" stroke-width="4"/>
<path d="M92 90 L100 98 L108 90" stroke-width="3"/>
</g></svg>`,
  { size: 512 },
);

const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<g fill="none" stroke="#9ffcff" stroke-width="4" stroke-linecap="round">
<circle cx="50" cy="50" r="44"/>
<circle cx="50" cy="50" r="34" stroke-width="2.5"/>
<path d="M50 12 L80 67 L20 67 Z" stroke-width="3.5"/>
<path d="M50 88 L80 33 L20 33 Z" stroke-width="3.5"/>
<circle cx="50" cy="50" r="5" fill="#9ffcff"/>
</g></svg>`,
  { size: 256 },
);

const dial = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(50 + r * Math.sin(a)).toFixed(2)} ${(50 - r * Math.cos(a)).toFixed(2)}`;
};
const ticks = Array.from({ length: 11 }, (_, i) => {
  const deg = -120 + i * 24;
  return `<path d="M${dial(36, deg)} L${dial(44, deg)}"/>`;
}).join("");
const GAUGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="49" fill="#fff6e0" stroke="#b08a3a" stroke-width="6"/>
<g stroke="#2a2030" stroke-width="3" stroke-linecap="round" fill="none">${ticks}</g>
<path d="M50 50 L${dial(30, 50)}" stroke="#e8553f" stroke-width="4" stroke-linecap="round"/>
<circle cx="50" cy="50" r="6" fill="#2a2030"/>
</svg>`,
  { size: 256 },
);

const LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
<rect x="4" y="4" width="152" height="92" rx="10" fill="#fff4da" stroke="#8a5a36" stroke-width="5"/>
<rect x="14" y="14" width="132" height="72" rx="6" fill="none" stroke="#e0a85a" stroke-width="2.5"/>
<path d="M30 60 q10 -20 20 -6 q-4 16 -20 6 Z" fill="#6fd46b" stroke="#2f8f4e" stroke-width="2.5"/>
<ellipse cx="54" cy="56" rx="24" ry="17" fill="#ffd23f" stroke="#c98b00" stroke-width="3" transform="rotate(-20 54 56)"/>
<text x="106" y="50" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#5a3420" text-anchor="middle">LIMONI</text>
<text x="106" y="74" font-family="Georgia, serif" font-size="13" fill="#5a3420" text-anchor="middle">FRESCHI</text>
</svg>`,
  { size: 512 },
);

const LEAF = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<path d="M20 78 C2 58 2 26 20 2 C38 26 38 58 20 78 Z" fill="#6fd46b" stroke="#2f8f4e" stroke-width="3"/>
<path d="M20 74 V12" fill="none" stroke="#2f8f4e" stroke-width="2.5"/>
</svg>`,
  { size: 128 },
);

// Hanging tassel: the drawing's bottom (its root) is the bead, which sits at the grip.
const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 90">
<rect x="11" y="76" width="18" height="12" rx="4" fill="#ffd45c" stroke="#b97f2a" stroke-width="2"/>
<g stroke="#ffd45c" stroke-width="3" stroke-linecap="round">
<path d="M14 76 V6"/><path d="M18 76 V2"/><path d="M22 76 V4"/><path d="M26 76 V8"/><path d="M10 74 Q8 40 12 10"/>
</g></svg>`,
  { size: 256 },
);

const PLATE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 70">
<rect x="2" y="2" width="216" height="66" rx="8" fill="#fffdf4" stroke="#1d2a5a" stroke-width="4"/>
<text x="110" y="50" font-family="Arial, sans-serif" font-weight="bold" font-size="40" fill="#1d2a5a" text-anchor="middle">AB 123 CD</text>
</svg>`,
  { size: 512 },
);

const PENNANT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
<path d="M4 6 H154 Q160 6 156 14 L140 50 L156 86 Q160 94 154 94 H4 Z" fill="#3ccab3" stroke="#ffd45c" stroke-width="7" stroke-linejoin="round"/>
<path d="M22 50 H120" stroke="#ffe6b8" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 12"/>
</svg>`,
  { size: 256 },
);

// Glowing wisp curl for the crystal cards.
const WISP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<path d="M20 78 C4 60 36 46 20 30 C8 18 30 8 24 2" fill="none" stroke="#8ff8ff" stroke-width="5" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

// Side panel outline, in (z, y): front bottom, nose, headset, seat line, cowl, tail, skirt.
const PANEL: [number, number][] = [
  [0.6, 0.36], [0.66, 0.46], [0.68, 0.64], [0.62, 0.84], [0.48, 0.9], [0.3, 0.8],
  [-0.1, 0.75], [-0.4, 0.76], [-0.62, 0.74], [-0.8, 0.68], [-0.92, 0.56], [-0.96, 0.42],
  [-0.9, 0.36], [-0.62, 0.36], [0.1, 0.36],
];
const TOP_EDGE: [number, number][] = [
  [0.48, 0.9], [0.3, 0.8], [-0.1, 0.75], [-0.4, 0.76], [-0.62, 0.74], [-0.8, 0.68], [-0.92, 0.56],
];
// Front shield, in (x, y): a rounded apron over the floorboard.
const SHIELD: [number, number][] = [
  [-0.2, 0.34], [0.2, 0.34], [0.23, 0.56], [0.22, 0.84], [0.12, 0.97], [-0.12, 0.97], [-0.22, 0.84], [-0.23, 0.56],
];
const LEMONS: [number, number, number][] = [
  [-0.11, 1.065, -0.76], [0.01, 1.065, -0.77], [0.12, 1.065, -0.8], [-0.1, 1.065, -0.9],
  [0.04, 1.065, -0.92], [0.13, 1.065, -0.97], [-0.12, 1.065, -1.02], [-0.01, 1.065, -1.03],
  [0.06, 1.12, -0.8], [-0.05, 1.12, -0.87], [0.1, 1.12, -0.91], [-0.04, 1.12, -0.98],
];
const LEAVES: [number, number, number][] = [
  [-0.07, 1.16, -0.82], [0.04, 1.15, -0.9], [0.15, 1.13, -0.86], [-0.14, 1.13, -0.9], [0.0, 1.14, -0.98],
  [-0.02, 1.14, -0.78],
];

export default function build() {
  const b = createBuilder({ name: "vespaScooter" });

  // ---- skeleton --------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 0.36, 0], role: "spine" });
  const steer = b.joint("steer", { parent: chassis, at: [0, 0.86, 0.56], dir: [0, 0.994, -0.11], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, 0.14, 0.66], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: chassis, at: [0, 0.14, -0.62], dir: [1, 0, 0], role: "hinge" });
  const seat = b.joint("seat", { parent: chassis, at: [0, 0.78, 0.08], role: "hinge" });
  const lid = b.joint("lid", { parent: chassis, at: [0, 1.21, -1.12], role: "hinge" });

  // ---- wheels: tyre, chrome rim, gold hub, five bolts a side, axle ----------------------------
  for (const [bone, hub] of [
    [wheelF, [0, 0.14, 0.66]],
    [wheelR, [0, 0.14, -0.62]],
  ] as const) {
    const [, y, z] = hub;
    b.part(new THREE.TorusGeometry(0.115, 0.026, 8, 24), TYRE, { bone, at: hub, dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.094, 0.094, 0.05, 24), SILVER, { bone, at: hub, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 12), GOLD, { bone, at: hub, dir: [1, 0, 0] });
    for (const s of [1, -1])
      for (let k = 0; k < 5; k++) {
        const a = (k * 72 * Math.PI) / 180;
        b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, {
          bone,
          at: [s * 0.028, y + 0.066 * Math.cos(a), z + 0.066 * Math.sin(a)],
        });
      }
    b.rod([-0.06, y, z], [0.06, y, z], 0.011, { bone, color: SILVER });
  }

  // ---- front fork and steering head -------------------------------------------------------------
  for (const s of [1, -1])
    b.rod([s * 0.06, 0.14, 0.66], [s * 0.05, 0.84, 0.6], [0.012, 0.018], { bone: steer, color: SILVER });
  b.rod([0, 0.84, 0.56], [0, 1.0, 0.58], [0.022, 0.02], { bone: steer, color: SILVER });
  b.sweep(
    catmull([
      [0.3, 1.02, 0.4],
      [0.22, 1.04, 0.5],
      [0.1, 1.02, 0.57],
      [0, 1.0, 0.59],
      [-0.1, 1.02, 0.57],
      [-0.22, 1.04, 0.5],
      [-0.3, 1.02, 0.4],
    ]),
    0.017,
    { bone: steer, color: SILVER },
  );
  // handlebar bell, a turned gold dome
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.034, 0.015],
      [0.022, 0.03],
      [0, 0.04],
    ],
    { at: [0.2, 1.05, 0.5], axis: [0, 1, 0], color: GOLD, bone: steer, smoothing: 1 },
  );

  for (const s of [1, -1]) {
    // grips with gold caps, a tassel hanging from each
    b.rod([s * 0.27, 1.02, 0.42], [s * 0.4, 1.02, 0.38], [0.026, 0.022], { bone: steer, color: LEATHER });
    b.part(new THREE.SphereGeometry(0.022, 10, 8), GOLD, { bone: steer, at: [s * 0.4, 1.02, 0.38] });
    b.cards([frame([s * 0.4, 1.0, 0.38], [0, 1, 0])], TASSEL, {
      size: [0.05, 0.13],
      lean: 180,
      flow: [0, 0, 1],
      bone: steer,
    });
    // mirror on a chrome stalk, with a gold ring
    b.rod([s * 0.3, 1.02, 0.4], [s * 0.36, 1.2, 0.34], [0.008, 0.007], { bone: steer, color: SILVER });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 20), MIRROR, {
      bone: steer,
      at: [s * 0.36, 1.2, 0.335],
      dir: [0, 0, 1],
    });
    b.part(new THREE.TorusGeometry(0.06, 0.007, 6, 20), GOLD, { bone: steer, at: [s * 0.36, 1.2, 0.33] });
  }
  // gauge pod on the shield top, with a painted dial
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 20), GOLD, { bone: steer, at: [0, 1.0, 0.64], dir: [0, 0, 1] });
  b.part(new THREE.CircleGeometry(0.044, 24), "#ffffff", {
    bone: steer,
    at: [0, 1.0, 0.663],
    dir: [0, 0, 1],
    axis: "z",
    texture: GAUGE,
  });

  // headlamp: chrome bucket, gold ring, glowing lens
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 20), SILVER, { bone: steer, at: [0, 0.84, 0.77], dir: [0, 0, 1] });
  b.part(new THREE.TorusGeometry(0.09, 0.011, 8, 24), GOLD, { bone: steer, at: [0, 0.84, 0.797] });
  glow(b.part(new THREE.CylinderGeometry(0.074, 0.074, 0.012, 20), LAMP, { bone: steer, at: [0, 0.84, 0.797], dir: [0, 0, 1] }), 1.5);

  // ---- body -------------------------------------------------------------------------------------
  // floorboard, rubber grip ribs and the tunnel behind the shield
  b.part(new THREE.BoxGeometry(0.34, 0.05, 1.2), FLOOR, { bone: chassis, at: [0, 0.335, 0.06] });
  for (let i = 0; i < 8; i++)
    b.part(new THREE.BoxGeometry(0.3, 0.008, 0.014), GRIP, { bone: chassis, at: [0, 0.365, -0.4 + i * 0.12] });
  b.part(new THREE.BoxGeometry(0.34, 0.08, 0.92), BODY, { bone: chassis, at: [0, 0.7, -0.22] });

  // side panels: extruded profile, ink outline, gold trims, filigree decal
  for (const s of [1, -1]) {
    const panel = b.extrude(PANEL, {
      x: [0, 0, 1],
      at: [s * 0.2, 0, 0],
      thickness: 0.06,
      bevel: 0.015,
      color: BODY,
      bone: chassis,
    });
    b.sweep(
      polyline(
        PANEL.map(([z, y]) => [s * 0.2325, y, z]),
        { closed: true },
      ),
      0.0045,
      { bone: chassis, color: INK },
    );
    b.sweep(
      polyline(
        TOP_EDGE.map(([z, y]) => [s * 0.236, y, z]),
      ),
      0.007,
      { bone: chassis, color: GOLD },
    );
    b.sweep(
      polyline([
        [s * 0.236, 0.38, 0.62],
        [s * 0.236, 0.38, -0.9],
      ]),
      0.006,
      { bone: chassis, color: GOLD },
    );
    b.decal(panel, FILIGREE, { at: [s * 0.23, 0.6, -0.2], dir: [s, 0, 0], size: [0.34, 0.17] });
  }

  // front shield with gold rim, gold medallion and a glowing rune
  const shield = b.extrude(SHIELD, {
    at: [0, 0, 0.7],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.1,
    bevel: 0.02,
    color: BODY,
    bone: chassis,
  });
  b.sweep(
    polyline(
      SHIELD.map(([x, y]) => [x, y, 0.75]),
      { closed: true },
    ),
    0.008,
    { bone: chassis, color: GOLD },
  );
  b.part(new THREE.TorusGeometry(0.075, 0.012, 8, 24), GOLD, { bone: chassis, at: [0, 0.6, 0.757] });
  glow(b.decal(shield, RUNE, { at: [0, 0.6, 0.752], dir: [0, 0, 1], size: [0.13, 0.13] }), 1.2);

  // seat on the hinge: a box-section saddle with gold piping and a backrest
  const seatPath = catmull([
    [0, 0.78, 0.12],
    [0, 0.8, -0.1],
    [0, 0.8, -0.4],
    [0, 0.78, -0.6],
  ]);
  b.sweep(seatPath, (t) => [0.17 - 0.03 * t, 0.035], { section: "box", bone: seat, color: SEAT });
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.168, 0.8, 0.1],
        [s * 0.168, 0.815, -0.1],
        [s * 0.168, 0.815, -0.4],
        [s * 0.168, 0.8, -0.58],
      ]),
      0.008,
      { bone: seat, color: GOLD },
    );
  b.capsule([0, 0.82, -0.6], [0, 0.9, -0.66], 0.04, { bone: seat, color: SEAT });

  // amber turn indicators, one each side of the shield
  for (const s of [1, -1])
    glow(b.part(new THREE.SphereGeometry(0.02, 8, 6), "#ffb347", { bone: chassis, at: [s * 0.238, 0.6, 0.64] }), 1.2);

  // exhaust, rear lamp with gold ring, number plate
  b.sweep(
    catmull([
      [0.09, 0.31, -0.5],
      [0.12, 0.25, -0.68],
      [0.12, 0.2, -0.82],
      [0.1, 0.24, -0.96],
    ]),
    0.022,
    { bone: chassis, color: SILVER },
  );
  glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), TAIL, { bone: chassis, at: [0, 0.5, -0.955], dir: [0, 0, 1] }), 1.2);
  b.part(new THREE.TorusGeometry(0.052, 0.008, 6, 18), GOLD, { bone: chassis, at: [0, 0.5, -0.945] });
  b.part(new THREE.PlaneGeometry(0.22, 0.07), "#ffffff", {
    bone: chassis,
    at: [0, 0.4, -0.945],
    dir: [0, 0, -1],
    axis: "z",
    texture: PLATE,
  });

  // rear fender: a curved band over the rear wheel, in the body paint
  const fender: number[][] = [];
  for (let i = 0; i <= 6; i++) {
    const f = ((20 + i * 23.33) * Math.PI) / 180;
    fender.push([0, 0.14 + 0.2 * Math.sin(f), -0.62 + 0.2 * Math.cos(f)]);
  }
  b.sweep(catmull(fender), () => [0.12, 0.022], { section: "box", bone: chassis, color: FENDER });
  // side vents: three dark louvres behind the shield
  for (const s of [1, -1])
    for (const y of [0.6, 0.64, 0.68])
      b.rod([s * 0.236, y, -0.42], [s * 0.236, y, -0.62], 0.007, { bone: chassis, color: FLOOR });

  // tail cowl: a rounded panel closing the rear between the side panels
  b.extrude(
    [
      [-0.2, 0.36],
      [0.2, 0.36],
      [0.21, 0.5],
      [0.19, 0.68],
      [0.1, 0.76],
      [-0.1, 0.76],
      [-0.19, 0.68],
      [-0.21, 0.5],
    ],
    { at: [0, 0, -0.9], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08, bevel: 0.015, color: BODY, bone: chassis },
  );

  // ---- rear rack ----------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.44, 0.03, 0.56), SILVER, { bone: chassis, at: [0, 0.795, -0.92] });
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 0.8, -0.62], [s * 0.2, 0.8, -1.22], [0.012, 0.012], { bone: chassis, color: GOLD });
    b.rod([s * 0.19, 0.7, -0.66], [s * 0.19, 0.78, -0.66], [0.014, 0.014], { bone: chassis, color: GOLD });
  }

  // ---- bottom crate: closed plank box, gold corner brackets, label on each side, one strap ---------
  b.part(new THREE.BoxGeometry(0.4, 0.2, 0.48), WOOD, { bone: chassis, at: [0, 0.91, -0.9] });
  for (const sx of [1, -1])
    for (const sz of [-0.66, -1.14])
      b.part(new THREE.BoxGeometry(0.03, 0.2, 0.03), GOLD, { bone: chassis, at: [sx * 0.2, 0.91, sz] });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.22, 0.1375), "#ffffff", {
      bone: chassis,
      at: [s * 0.2065, 0.9, -0.9],
      dir: [s, 0, 0],
      axis: "z",
      texture: LABEL,
    });
  b.sweep(
    polyline(
      [
        [0.205, 0.99, -0.645],
        [-0.205, 0.99, -0.645],
        [-0.205, 0.99, -1.155],
        [0.205, 0.99, -1.155],
      ],
      { closed: true },
    ),
    0.011,
    { bone: chassis, color: LEATHER },
  );

  // rope lashing round the top crate, with a knot on the front corner
  b.sweep(
    polyline(
      [
        [0.19, 1.13, -0.665],
        [-0.19, 1.13, -0.665],
        [-0.19, 1.13, -1.135],
        [0.19, 1.13, -1.135],
      ],
      { closed: true },
    ),
    0.009,
    { bone: chassis, color: ROPE },
  );
  b.part(new THREE.SphereGeometry(0.016, 8, 6), ROPE, { bone: chassis, at: [0.19, 1.13, -0.665] });

  // ---- top crate: open plank box with a lid propped open at the back --------------------------------
  b.part(new THREE.BoxGeometry(0.36, 0.02, 0.44), WOOD, { bone: chassis, at: [0, 1.02, -0.9] });
  b.part(new THREE.BoxGeometry(0.02, 0.18, 0.44), WOOD, { bone: chassis, at: [-0.17, 1.12, -0.9] });
  b.part(new THREE.BoxGeometry(0.02, 0.18, 0.44), WOOD, { bone: chassis, at: [0.17, 1.12, -0.9] });
  b.part(new THREE.BoxGeometry(0.36, 0.18, 0.02), WOOD, { bone: chassis, at: [0, 1.12, -0.69] });
  b.part(new THREE.BoxGeometry(0.36, 0.18, 0.02), WOOD, { bone: chassis, at: [0, 1.12, -1.11] });
  // the lid, 30 degrees open from its back edge, is hinged on `lid`
  b.part(new THREE.BoxGeometry(0.38, 0.02, 0.45), WOOD, {
    bone: lid,
    at: [0, 1.3225, -0.925],
    rotation: [-30, 0, 0],
  });

  // cargo: lemons in two layers, two loaves, leaves, and a glowing parcel crystal
  for (const [x, y, z] of LEMONS)
    b.part(new THREE.SphereGeometry(0.045, 10, 8), LEMON, { bone: chassis, at: [x, y, z], scale: [1, 0.85, 1] });
  b.capsule([-0.15, 1.19, -0.84], [0.1, 1.2, -0.86], 0.03, { bone: chassis, color: BREAD });
  b.capsule([-0.08, 1.19, -0.98], [0.16, 1.2, -0.99], 0.03, { bone: chassis, color: BREAD });
  b.cards(
    LEAVES.map((p) => frame(p, [0, 1, 0])),
    LEAF,
    { size: [0.05, 0.11], lean: 55, flow: [0, 0, 1], vary: 0.3, spin: 60, rng: rng(5), bone: chassis },
  );
  glow(b.spike([0.14, 1.11, -0.74], [0.15, 1.3, -0.72], null, 0.03, { bone: chassis, color: CRYSTAL }), 1.4);
  glow(b.spike([-0.15, 1.12, -0.95], [-0.16, 1.24, -0.95], null, 0.022, { bone: chassis, color: CRYSTAL }), 1.4);
  // glowing wisps curling off the crystal
  glow(
    b.cards(
      [frame([0.12, 1.16, -0.76], [0, 1, 0]), frame([-0.13, 1.2, -0.9], [0, 1, 0]), frame([0.02, 1.2, -0.95], [0, 1, 0])],
      WISP,
      { size: [0.05, 0.1], lean: 25, flow: [0, 0, 1], vary: 0.3, rng: rng(9), bone: chassis },
    ),
    1.2,
  );

  // delivery pennant on a chrome pole at the top crate's front corner
  b.rod([0.17, 1.21, -0.7], [0.17, 1.42, -0.7], 0.008, { bone: chassis, color: SILVER });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD, { bone: chassis, at: [0.17, 1.42, -0.7] });
  b.part(new THREE.PlaneGeometry(0.13, 0.08), "#ffffff", { bone: chassis, at: [0.237, 1.36, -0.7], texture: PENNANT });

  return b.root;
}
