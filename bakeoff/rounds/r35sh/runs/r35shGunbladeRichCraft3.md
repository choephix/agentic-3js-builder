```ts
import * as THREE from "three";
import { createBuilder, catmull, mix, paint, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Lionheart Gunblade",
  description:
    "A Final Fantasy style gunblade: a broad silver blade with a blued spine-barrel, a revolver cylinder and hammer, a winged lion guard, glowing materia, glowing runes and a lion pendant on a chain. It stands tip-down on the floor.",
};

type V = [number, number, number];

// ------------------------------------------------------------------ palette
const GOLD = metal("gilt", { tarnish: 0.12, size: 0.05, seed: 3 });
const BRASS = metal("brass", { size: 0.04 });
const SILVER = metal("steel", { polish: 0.75, tarnish: 0.06, size: 0.12, seed: 8 });
const BLUED = metal("blued", { size: 0.05, seed: 2 });
const IRON = metal("iron", { size: 0.05 });
const COBALT = "#2a56c8";
const NAVY = "#141a3e";
const DARK = "#0d0c14";
const CHAIN = metal("steel", { polish: 0.9, tarnish: 0.02, size: 0.03, seed: 5 });

// ------------------------------------------------------------------ constants
const BLADE_TOP = 0.88; // where the blade meets the hilt block
const BT = 0.011; // blade thickness
const FACE_Z = BT / 2 + 0.0012; // z of decals lying on the blade faces
const BX = -0.072; // x of barrel and revolver cylinder (on the spine side)
const CY = 0.89; // cylinder centre height
const HX = -0.025; // hilt centreline x (grip, frame, pommel)

// ------------------------------------------------------------------ textures
const lionSvg = (coin: boolean) => {
  let mane = "";
  const n = 16;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 47 : 36;
    mane += `${(50 + Math.sin(a) * r).toFixed(1)},${(50 - Math.cos(a) * r).toFixed(1)} `;
  }
  const k = coin ? 0.78 : 1;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${coin ? `<circle cx="50" cy="50" r="48" fill="#1b2a63" stroke="#e0aa3c" stroke-width="4"/>` : ""}
      <g transform="translate(50 50) scale(${k}) translate(-50 -50)" stroke-linejoin="round" stroke-linecap="round">
        <polygon points="${mane}" fill="#e0aa3c" stroke="#4a2e08" stroke-width="2.4"/>
        <circle cx="50" cy="50" r="30" fill="#c98a22" stroke="#4a2e08" stroke-width="2"/>
        <circle cx="33" cy="33" r="7" fill="#f3cf6e" stroke="#4a2e08" stroke-width="2.2"/>
        <circle cx="67" cy="33" r="7" fill="#f3cf6e" stroke="#4a2e08" stroke-width="2.2"/>
        <ellipse cx="50" cy="55" rx="20" ry="22" fill="#f3cf6e" stroke="#4a2e08" stroke-width="2.4"/>
        <path d="M36 47 L47 51 L38 55 Z" fill="#2a1606"/>
        <path d="M64 47 L53 51 L62 55 Z" fill="#2a1606"/>
        <path d="M34 42 L47 46 M66 42 L53 46" stroke="#4a2e08" stroke-width="2.8" fill="none"/>
        <polygon points="43,58 57,58 50,66" fill="#3a1c10"/>
        <path d="M50 66 L50 71 M50 71 Q44 77 37 73 M50 71 Q56 77 63 73" stroke="#4a2e08" stroke-width="2.2" fill="none"/>
        <circle cx="41" cy="68" r="1.4" fill="#4a2e08"/><circle cx="59" cy="68" r="1.4" fill="#4a2e08"/>
      </g>
    </svg>`,
    { size: 256 },
  );
};
const LION = lionSvg(false);
const COIN = lionSvg(true);

const etchSvg = () => {
  let diamonds = "";
  for (let i = 0; i < 9; i++) {
    const y = 48 + i * 40;
    diamonds += `<polygon points="31,${y - 9} 38,${y} 31,${y + 9} 24,${y}" fill="#e0aa3c" stroke="#4a2e08" stroke-width="1.6"/>`;
    if (i < 8) diamonds += `<circle cx="31" cy="${y + 20}" r="3.2" fill="#2a56c8"/>`;
  }
  return svg(
    `<svg viewBox="0 0 60 400" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 24 L11 380" stroke="#46506a" stroke-width="4" fill="none"/>
      <path d="M15.5 24 L15.5 380" stroke="#ffffff" stroke-width="2" opacity="0.8" fill="none"/>
      <path d="M50 30 L50 370" stroke="#e0aa3c" stroke-width="3" fill="none"/>
      <path d="M52.5 30 L52.5 370" stroke="#4a2e08" stroke-width="1.5" fill="none"/>
      ${diamonds}
      <path d="M11 396 L31 372 L50 396" stroke="#e0aa3c" stroke-width="3" fill="none"/>
      <path d="M11 6 Q31 -2 50 6" stroke="#e0aa3c" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 512 },
  );
};

const runeSvg = () => {
  const glyphs = [
    "M8 4 L8 26 M8 15 L22 6 M8 15 L22 24",
    "M15 3 L15 27 M6 10 L24 20",
    "M7 5 L23 5 L7 25 L23 25",
    "M8 4 L22 15 L8 26 M22 4 L22 26",
    "M15 4 L6 26 M15 4 L24 26 M9 18 L21 18",
    "M6 15 L15 4 L24 15 L15 26 Z",
  ];
  let out = "";
  for (let i = 0; i < 12; i++)
    out += `<path transform="translate(0 ${i * 30})" d="${glyphs[(i * 5 + 2) % glyphs.length]}" stroke="#8ff6ff" stroke-width="3" fill="none"/>`;
  return svg(
    `<svg viewBox="0 0 30 360" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round">${out}</svg>`,
    { size: 512 },
  );
};

const plateSvg = () =>
  svg(
    `<svg viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="4" width="132" height="82" rx="10" fill="#141a3e" stroke="#e0aa3c" stroke-width="4"/>
      <rect x="11" y="11" width="118" height="68" rx="6" fill="none" stroke="#7a5a22" stroke-width="2"/>
      <path d="M16 74 Q16 46 40 46 Q56 46 56 60 Q56 70 46 70" stroke="#e0aa3c" stroke-width="3" fill="none"/>
      <path d="M124 74 Q124 46 100 46 Q84 46 84 60 Q84 70 94 70" stroke="#e0aa3c" stroke-width="3" fill="none"/>
      <path d="M16 16 Q16 40 40 40 M124 16 Q124 40 100 40" stroke="#e0aa3c" stroke-width="3" fill="none"/>
      <path d="M44 16 L70 8 L96 16" stroke="#e0aa3c" stroke-width="3" fill="none"/>
      <circle cx="70" cy="76" r="4" fill="#2a56c8" stroke="#e0aa3c" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

const ETCH = etchSvg();
const RUNES = runeSvg();
const PLATE = plateSvg();

// ------------------------------------------------------------------ builder + helpers
const b = createBuilder({ name: "gunblade" });

const part = (geo: THREE.BufferGeometry, color: any, at: V, o: object = {}) =>
  b.part(geo, color, { at, flat: true, ...o });

const plane = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, o: object = {}) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });

/** A drawing on both faces of a flat thing: front faces +Z, back faces -Z. */
const bothSides = (tex: THREE.Texture, w: number, h: number, x: number, y: number, z: number, lit = 0) => {
  for (const s of [1, -1]) {
    const p = plane(tex, w, h, [x, y, s * z], [0, 0, s]);
    if (lit) glow(p, lit);
  }
};

const cyl = (r0: number, r1: number, h: number, sides: number, color: any, at: V, o: object = {}) =>
  part(new THREE.CylinderGeometry(r0, r1, h, sides), color, at, o);

const box = (w: number, h: number, d: number, color: any, at: V, o: object = {}) =>
  part(new THREE.BoxGeometry(w, h, d), color, at, o);

const ball = (r: number, color: any, at: V, ws = 6, hs = 4) => part(new THREE.SphereGeometry(r, ws, hs), color, at);

const materia = (x: number, y: number, z: number, side: number, core: string, rim: string) => {
  part(new THREE.TorusGeometry(0.0175, 0.0045, 5, 10), GOLD, [x, y, z]);
  glow(part(new THREE.SphereGeometry(0.0135, 8, 6), core, [x, y, z + side * 0.004]), 1.1);
  glow(part(new THREE.SphereGeometry(0.0085, 6, 5), rim, [x, y, z + side * 0.007]), 1.4);
  glow(part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", [x - 0.004, y + 0.005, z + side * 0.013]), 1.8);
};

// ------------------------------------------------------------------ blade
const edgeX = (y: number) => (y < 0.12 ? 0.018 + (y / 0.12) * 0.032 : y < 0.26 ? 0.05 + ((y - 0.12) / 0.14) * 0.012 : 0.062);
const BLADE_BASE = metal("steel", { polish: 0.9, tarnish: 0.04, size: 0.2, seed: 4 });
const bladePaint = paint((_p, n, s) => {
  if (Math.abs(n.z) < 0.5) return "#cfd8e6";
  const d = edgeX(s[1]) - s[0];
  if (d < 0.012) return "#f6faff";
  if (d < 0.018) return "#9aa6bd";
  if (s[0] < -0.05) return "#8a93a6";
  return mix(BLADE_BASE.at(_p, n), "#d8e2f2", 0.15);
});

const bladeOutline: Array<[number, number] | [number, number, "sharp"]> = [
  [-0.06, BLADE_TOP],
  [-0.06, 0.16],
  [0.018, 0.0, "sharp"],
  [0.05, 0.12],
  [0.062, 0.26],
  [0.062, BLADE_TOP],
];
b.extrude(bladeOutline, {
  at: [0, 0, 0],
  x: [1, 0, 0],
  thickness: BT,
  bevel: 0.0025,
  color: bladePaint,
  name: "blade",
});

// thick blued spine along the back of the blade
b.extrude(
  [
    [-0.064, BLADE_TOP],
    [-0.064, 0.2],
    [-0.05, 0.165, "sharp"],
    [-0.036, 0.2],
    [-0.036, BLADE_TOP],
  ],
  { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.022, bevel: 0.003, color: BLUED, name: "spine" },
);
for (const y of [0.22, 0.3, 0.38]) box(0.016, 0.018, 0.027, GOLD, [-0.056, y, 0], { name: "spineNotch" });

// engravings
bothSides(ETCH, 0.075, 0.5, -0.012, 0.47, FACE_Z);
bothSides(RUNES, 0.03, 0.36, 0.04, 0.47, FACE_Z + 0.0003, 1.2);
bothSides(LION, 0.072, 0.072, 0.0, 0.792, FACE_Z + 0.0004);
for (const s of [1, -1])
  for (const x of [-0.04, -0.013, 0.013, 0.04]) ball(0.0048, GOLD, [x, 0.862, s * (BT / 2 + 0.0005)]);

// ------------------------------------------------------------------ barrel on the spine
b.rod([BX, 0.845, 0], [BX, 0.47, 0], 0.0125, IRON, { sides: 8, caps: "flat", name: "barrel" });
for (const y of [0.8, 0.68, 0.57]) cyl(0.021, 0.021, 0.014, 8, GOLD, [BX + 0.002, y, 0], { name: "barrelClamp" });
cyl(0.014, 0.0195, 0.032, 8, GOLD, [BX, 0.487, 0], { name: "muzzle" });
part(new THREE.CircleGeometry(0.0105, 8), DARK, [BX, 0.4705, 0], { dir: [0, -1, 0], axis: "z", up: [0, 0, 1] });
box(0.006, 0.022, 0.012, GOLD, [BX, 0.5, 0.0185], { name: "frontSight" });

// ------------------------------------------------------------------ revolver cylinder
cyl(0.037, 0.037, 0.1, 6, BLUED, [BX, CY, 0], { name: "cylinder" });
cyl(0.0395, 0.0395, 0.01, 6, GOLD, [BX, CY + 0.047, 0], { name: "cylinderRingTop" });
cyl(0.0395, 0.0395, 0.01, 6, GOLD, [BX, CY - 0.047, 0], { name: "cylinderRingBottom" });
for (let k = 0; k < 6; k++) {
  const phi = 30 + 60 * k;
  const a = (phi * Math.PI) / 180;
  box(0.012, 0.048, 0.003, DARK, [BX + 0.0325 * Math.sin(a), CY, 0.0325 * Math.cos(a)], {
    rotation: [0, phi, 0],
    name: "flute",
  });
  const c = (k * 60 * Math.PI) / 180;
  const cx = BX + Math.sin(c) * 0.021;
  const cz = Math.cos(c) * 0.021;
  part(new THREE.CircleGeometry(0.0085, 8), DARK, [cx, CY - 0.0508, cz], { dir: [0, -1, 0], axis: "z", up: [0, 0, 1] });
  cyl(0.0045, 0.0045, 0.005, 6, BRASS, [cx, CY - 0.0525, cz], { name: "bullet" });
}
cyl(0.008, 0.008, 0.02, 6, SILVER, [BX, CY - 0.052, 0], { name: "cylinderPin" });

// ------------------------------------------------------------------ hilt block: collar, frame, hammer
box(0.14, 0.03, 0.036, GOLD, [HX, 0.895, 0], { name: "collar" });
box(0.14, 0.006, 0.04, COBALT, [HX, 0.895, 0], { name: "collarInlay" });
box(0.14, 0.1, 0.05, BLUED, [HX, 0.96, 0], { name: "frame" });
box(0.148, 0.008, 0.056, GOLD, [HX, 0.912, 0], { name: "frameBase" });
box(0.148, 0.008, 0.056, GOLD, [HX, 1.012, 0], { name: "frameStrap" });
for (const x of [-0.095, 0.045]) box(0.008, 0.1, 0.056, GOLD, [x, 0.962, 0], { name: "frameEdge" });
bothSides(PLATE, 0.122, 0.078, HX, 0.962, 0.0256);

// materia: three on the front, two on the back
materia(-0.062, 0.962, 0.0275, 1, "#1fbf55", "#8dffb0");
materia(-0.025, 0.962, 0.0275, 1, "#2a78e6", "#9fd2ff");
materia(0.012, 0.962, 0.0275, 1, "#d42a45", "#ff9aa8");
materia(-0.044, 0.962, -0.0275, -1, "#8a3be0", "#d9b0ff");
materia(-0.006, 0.962, -0.0275, -1, "#e0b020", "#fff0a0");

for (const s of [1, -1])
  for (const x of [-0.09, 0.04])
    for (const y of [0.924, 1.0]) ball(0.0042, GOLD, [x, y, s * 0.0272]);

// hammer
b.extrude(
  [
    [0, 0],
    [0.03, 0],
    [0.03, 0.03],
    [0, 0.045],
    [-0.03, 0.05],
    [-0.035, 0.035],
    [-0.012, 0.025],
  ],
  { at: [-0.08, 1.018, 0], x: [1, 0, 0], thickness: 0.012, bevel: 0.002, color: IRON, name: "hammer" },
);
ball(0.006, GOLD, [-0.075, 1.03, 0.0065]);
ball(0.006, GOLD, [-0.075, 1.03, -0.0065]);

// trigger guard + trigger
b.sweep(
  catmull([
    [0.045, 1.0, 0],
    [0.088, 0.992, 0],
    [0.106, 0.955, 0],
    [0.09, 0.922, 0],
    [0.05, 0.914, 0],
  ]),
  0.007,
  { color: GOLD, sides: 6, caps: "flat", name: "triggerGuard" },
);
b.sweep(
  catmull([
    [0.038, 0.99, 0],
    [0.058, 0.962, 0],
    [0.053, 0.936, 0],
  ]),
  [0.006, 0.003],
  { color: SILVER, sides: 6, name: "trigger" },
);

// ------------------------------------------------------------------ winged guard on the edge side
const wing: Array<[number, number] | [number, number, "sharp"]> = [
  [0, 0.03],
  [0.05, 0.04],
  [0.11, 0.02],
  [0.17, -0.03, "sharp"],
  [0.12, -0.01],
  [0.14, -0.07, "sharp"],
  [0.08, -0.03],
  [0.09, -0.1, "sharp"],
  [0.03, -0.04],
  [0, -0.03],
];
b.extrude(wing, { at: [0.04, 0.86, 0], x: [1, 0, 0], thickness: 0.016, bevel: 0.003, color: SILVER, name: "wing" });
for (const s of [1, -1]) {
  const z = s * 0.0085;
  b.rod([0.07, 0.868, z], [0.19, 0.835, z], 0.0018, GOLD, { sides: 4, name: "wingLine" });
  b.rod([0.07, 0.858, z], [0.165, 0.798, z], 0.0018, GOLD, { sides: 4, name: "wingLine" });
  b.rod([0.065, 0.848, z], [0.13, 0.765, z], 0.0018, GOLD, { sides: 4, name: "wingLine" });
  glow(part(new THREE.OctahedronGeometry(0.0125), "#4aa8ff", [0.058, 0.872, s * 0.0095]), 1.3);
  part(new THREE.TorusGeometry(0.0145, 0.0028, 4, 8), GOLD, [0.058, 0.872, s * 0.0092]);
}

// ------------------------------------------------------------------ grip
const gripPaint = paint((_p, n, s) => {
  const a = (((s[1] - 1500 * s[0]) % 60) + 60) % 60;
  const c = (((s[1] + 1500 * s[0]) % 60) + 60) % 60;
  if (a < 8 && c < 8) return COBALT;
  if (a < 9 || c < 9) return "#120c10";
  return n.y > 0.5 ? "#4d3340" : "#3b2530";
});
b.sweep(
  [
    [HX, 1.02, 0],
    [HX, 1.22, 0],
  ],
  (t: number) => 0.021 + 0.004 * Math.sin(Math.PI * t),
  { color: gripPaint, sides: 8, caps: "flat", name: "grip" },
);
cyl(0.028, 0.025, 0.022, 8, GOLD, [HX, 1.026, 0], { name: "ferruleLow" });
cyl(0.025, 0.029, 0.022, 8, GOLD, [HX, 1.216, 0], { name: "ferruleHigh" });
for (const y of [1.075, 1.165]) cyl(0.0255, 0.0255, 0.006, 8, GOLD, [HX, y, 0], { name: "gripRing" });

// pommel + chain ring
b.lathe(
  [
    [0, 0],
    [0.03, 0],
    [0.034, 0.01],
    [0.03, 0.028],
    [0.019, 0.046],
    [0.009, 0.054],
    [0, 0.056],
  ],
  { at: [HX, 1.226, 0], segments: 8, color: GOLD, name: "pommel" },
);
cyl(0.0345, 0.0345, 0.006, 8, COBALT, [HX, 1.236, 0], { name: "pommelBand" });
part(new THREE.TorusGeometry(0.017, 0.0042, 5, 10), GOLD, [HX, 1.292, 0], { rotation: [0, 90, 0], name: "pommelRing" });

// ------------------------------------------------------------------ chain and lion pendant
const chain = catmull([
  [HX, 1.288, 0.017],
  [-0.018, 1.2, 0.058],
  [0.0, 1.1, 0.07],
  [0.025, 1.02, 0.064],
  [0.04, 0.98, 0.058],
]);
const linkA = new THREE.TorusGeometry(0.0075, 0.0019, 5, 8).scale(0.8, 1.5, 1);
const linkB = linkA.clone().rotateY(Math.PI / 2);
const LINKS = 18;
for (let i = 0; i < LINKS; i++) {
  const t = (i + 0.5) / LINKS;
  b.part((i % 2 ? linkB : linkA).clone(), CHAIN, {
    at: chain.at(t),
    dir: chain.tangentAt(t),
    axis: "y",
    flat: true,
    name: "chainLink",
  });
}
const PX = 0.04;
const PY = 0.95;
const PZ = 0.058;
part(new THREE.TorusGeometry(0.006, 0.0016, 4, 8), GOLD, [PX, 0.98, PZ], { rotation: [0, 90, 0], name: "pendantLoop" });
cyl(0.026, 0.026, 0.008, 10, GOLD, [PX, PY, PZ], { dir: [0, 0, 1], name: "pendant" });
part(new THREE.TorusGeometry(0.026, 0.003, 4, 12), GOLD, [PX, PY, PZ + 0.004], { name: "pendantRim" });
part(new THREE.TorusGeometry(0.026, 0.003, 4, 12), GOLD, [PX, PY, PZ - 0.004], { name: "pendantRimBack" });
plane(COIN, 0.049, 0.049, [PX, PY, PZ + 0.0046], [0, 0, 1]);
plane(COIN, 0.049, 0.049, [PX, PY, PZ - 0.0046], [0, 0, -1]);

// ------------------------------------------------------------------ done
export default function build(): THREE.Object3D {
  return b.root;
}
```