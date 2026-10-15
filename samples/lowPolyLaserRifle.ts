import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import type { Fill } from "../src/context";
import { aim } from "../src/math";
import { catmull, spiral } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Helix-9 Laser Rifle",
  description:
    "A low-poly, flat-coloured sci-fi laser rifle hero weapon, 1.2 m long: an ivory-armoured receiver with layered plates and panel seams over a gunmetal frame, a finned heat sink and copper-coil emitter barrel around a glowing core, a three-prong muzzle with a glowing lens, a raked energy-cell magazine with glowing charge bars, a holographic scope with flip covers and a glowing reticle, an ammo counter screen, picatinny rails, foregrip, laser module, cables, a skeletal adjustable stock, and decals, serials and Helix Arms insignia.",
};

type P2 = [number, number];
type V = [number, number, number];

// ---------------------------------------------------------------- palette
const IV_D = "#b5ab95";
const IV = "#e4dcc8";
const IV_H = "#f7f2e6";
const GM_D = "#252a34";
const GM = "#3a4150";
const GM_H = "#5a6579";
const CHAR = "#17191e";
const OR_D = "#a8401a";
const OR = "#ee6a24";
const OR_H = "#ffa456";
const CU_D = "#7a4120";
const CU = "#b8733b";
const CU_H = "#e4a565";
const CY = "#3fe4ff";
const CY_H = "#bdf8ff";
const CY_D = "#1b6a7e";
const RED = "#ff3d3d";
const LIME = "#7dff8c";

// ---------------------------------------------------------------- drawings
const SCREEN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 100">
  <rect width="170" height="100" fill="#071722"/>
  <rect x="4" y="4" width="162" height="92" fill="none" stroke="#1f7d95" stroke-width="3"/>
  <text x="10" y="74" font-family="monospace" font-weight="bold" font-size="66" fill="#5ff0ff">42</text>
  <text x="96" y="27" font-family="monospace" font-weight="bold" font-size="17" fill="#ffa456">CHG</text>
  <rect x="96" y="36" width="10" height="34" fill="#5ff0ff"/>
  <rect x="109" y="36" width="10" height="34" fill="#5ff0ff"/>
  <rect x="122" y="36" width="10" height="34" fill="#5ff0ff"/>
  <rect x="135" y="36" width="10" height="34" fill="#5ff0ff"/>
  <rect x="148" y="36" width="10" height="34" fill="#16404c"/>
  <text x="10" y="92" font-family="monospace" font-weight="bold" font-size="14" fill="#5ff0ff">SEMI</text>
  <text x="96" y="90" font-family="monospace" font-weight="bold" font-size="14" fill="#7dff8c">RDY</text>
  <rect x="58" y="81" width="30" height="8" fill="#ffa456"/>
</svg>`,
  { size: 512 },
);

const RETICLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#04161e"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="#6ff4ff" stroke-width="3"/>
  <rect x="30.5" y="4" width="3" height="16" fill="#6ff4ff"/>
  <rect x="30.5" y="44" width="3" height="16" fill="#6ff4ff"/>
  <rect x="4" y="30.5" width="16" height="3" fill="#6ff4ff"/>
  <rect x="44" y="30.5" width="16" height="3" fill="#6ff4ff"/>
  <circle cx="32" cy="32" r="3.5" fill="#ff5a3d"/>
</svg>`,
  { size: 128 },
);

const INSIGNIA = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50">
  <rect x="1" y="1" width="118" height="48" rx="4" fill="#252a34"/>
  <rect x="4" y="4" width="112" height="42" rx="3" fill="none" stroke="#ee6a24" stroke-width="2"/>
  <path d="M10 13 C 17 13, 17 37, 24 37 S 31 13, 38 13" fill="none" stroke="#ee6a24" stroke-width="4"/>
  <path d="M10 37 C 17 37, 17 13, 24 13 S 31 37, 38 37" fill="none" stroke="#e4dcc8" stroke-width="4"/>
  <rect x="12.5" y="22" width="3" height="6" fill="#5a6579"/>
  <rect x="32.5" y="22" width="3" height="6" fill="#5a6579"/>
  <text x="45" y="28" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="17" fill="#f7f2e6">HELIX</text>
  <text x="46" y="41" font-family="monospace" font-weight="bold" font-size="9.5" fill="#ffa456">ARMS DIV.</text>
</svg>`,
  { size: 256 },
);

const MODEL_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40">
  <text x="2" y="33" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="#3a4150">HX-9</text>
</svg>`,
  { size: 512 },
);

const SERIAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 24">
  <text x="2" y="18" font-family="monospace" font-weight="bold" font-size="17" fill="#3a4150">SN 09-4471-HX9 LR</text>
</svg>`,
  { size: 512 },
);

const WARNING = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56">
  <path d="M32 2 L62 54 L2 54 Z" fill="#17191e"/>
  <path d="M32 10 L55 50 L9 50 Z" fill="#ee6a24"/>
  <path d="M35 18 L24 37 L31 37 L28 47 L40 31 L33 31 L37 18 Z" fill="#17191e"/>
</svg>`,
  { size: 128 },
);

const DANGER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 22">
  <rect width="160" height="22" fill="#ee6a24"/>
  <rect x="2" y="2" width="156" height="18" fill="none" stroke="#17191e" stroke-width="2"/>
  <text x="80" y="16" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12" fill="#17191e">HIGH ENERGY</text>
</svg>`,
  { size: 512 },
);

const HAZARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 16">
  <rect width="80" height="16" fill="#ee6a24"/>
  <path d="M0 16 L8 0 L16 0 L8 16 Z M16 16 L24 0 L32 0 L24 16 Z M32 16 L40 0 L48 0 L40 16 Z M48 16 L56 0 L64 0 L56 16 Z M64 16 L72 0 L80 0 L72 16 Z" fill="#17191e"/>
</svg>`,
  { size: 256 },
);

const SELECTOR_MARKS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
  <text x="2" y="14" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12" fill="#f7f2e6">S</text>
  <text x="26" y="12" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12" fill="#ffa456">1</text>
  <text x="50" y="14" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12" fill="#ff5a3d">A</text>
</svg>`,
  { size: 256 },
);

const SCOPE_LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 20">
  <rect x="0" y="3" width="5" height="14" fill="#ee6a24"/>
  <text x="9" y="15" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="13" fill="#3a4150">HOLO 4X</text>
</svg>`,
  { size: 256 },
);

const HOLO = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12" fill="none" stroke="#7af6ff" stroke-width="2.6"/>
  <circle cx="16" cy="16" r="2.4" fill="#ff5a3d"/>
  <rect x="15" y="1.5" width="2" height="6" fill="#7af6ff"/>
  <rect x="15" y="24.5" width="2" height="6" fill="#7af6ff"/>
  <rect x="1.5" y="15" width="6" height="2" fill="#7af6ff"/>
  <rect x="24.5" y="15" width="6" height="2" fill="#7af6ff"/>
</svg>`,
  { size: 128 },
);

const TAG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 48">
  <circle cx="14" cy="6" r="2.5" fill="#3a4150"/>
  <text x="14" y="22" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="10" fill="#ee6a24">HX</text>
  <text x="14" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#3a4150">07</text>
</svg>`,
  { size: 128 },
);

const CELL_LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 24">
  <rect width="90" height="24" fill="#e4dcc8"/>
  <rect x="0" y="0" width="14" height="24" fill="#ee6a24"/>
  <text x="19" y="17" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="13" fill="#252a34">4.2 MJ</text>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "lowPolyLaserRifle" });

  // ---------------------------------------------------------------- skeleton
  const YB = 0.255; // bore axis height
  const root = b.joint("rifle", { at: [0, YB, 0] });
  const trigger = b.joint("trigger", { parent: root, at: [0, 0.142, -0.008], dir: [0, -1, 0], role: "hinge" });
  const RAKE = 0.11; // magazine z per m of drop
  const mag = b.joint("magazine", { parent: root, at: [0, 0.15, 0.085], dir: [0, -1, RAKE] });
  const charger = b.joint("chargingHandle", { parent: root, at: [-0.034, 0.2685, 0.075], dir: [0, 0, -1] });
  const selector = b.joint("selector", { parent: root, at: [0.029, 0.165, -0.1], dir: [1, 0, 0], role: "hinge" });
  const stock = b.joint("stock", { parent: root, at: [0, YB - 0.01, -0.2], dir: [0, 0, -1] });
  const YS = 0.364; // scope axis height
  const coverRear = b.joint("scopeCoverRear", {
    parent: root,
    at: [0.037, YS, -0.077],
    dir: [-1, 0, 0],
    role: "hinge",
  });
  const coverFront = b.joint("scopeCoverFront", {
    parent: root,
    at: [0.043, YS, 0.19],
    dir: [-1, 0, 0],
    role: "hinge",
  });

  // ---------------------------------------------------------------- helpers
  type Bin = { bone: Joint; color: string; glow: number; geos: THREE.BufferGeometry[] };
  const bins = new Map<string, Bin>();
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: V,
    o: { dir?: V; up?: V; axis?: "x" | "y" | "z"; bone?: Joint; glow?: number } = {},
  ) => {
    const q = o.dir ? aim(o.dir, o.up, o.axis ?? "y") : new THREE.Quaternion();
    geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at), q, new THREE.Vector3(1, 1, 1)));
    const bone = o.bone ?? root;
    const key = `${bone.name}|${color}|${o.glow ?? 0}`;
    let bin = bins.get(key);
    if (!bin) bins.set(key, (bin = { bone, color, glow: o.glow ?? 0, geos: [] }));
    bin.geos.push(geo.index ? geo.toNonIndexed() : geo);
  };
  const box = (size: V, color: string, at: V, o: { dir?: V; up?: V; bone?: Joint; glow?: number } = {}) =>
    put(new THREE.BoxGeometry(...size), color, at, o);
  // An n-sided disc or post along `dir`, one flat on the +Z (up) side when aimed forward.
  const disc = (
    r: number,
    h: number,
    n: number,
    color: string,
    at: V,
    dir: V,
    o: { bone?: Joint; glow?: number; r2?: number; up?: V } = {},
  ) => {
    const g = new THREE.CylinderGeometry(o.r2 ?? r, r, h, n);
    g.rotateY(Math.PI / n);
    put(g, color, at, { dir, up: o.up, bone: o.bone, glow: o.glow });
  };
  const bolt = (at: V, n: V, o: { bone?: Joint; r?: number; color?: string } = {}) => {
    const r = o.r ?? 0.0034;
    const g = new THREE.CylinderGeometry(r, r, 0.003, 6);
    put(g, o.color ?? GM_H, at, { dir: n, bone: o.bone });
  };

  // A side-view outline (z, y) pushed sideways, centred on x = xc.
  const side = (
    outline: P2[],
    xc: number,
    w: number,
    color: Fill,
    o: { bone?: Joint; bevel?: number; name?: string } = {},
  ) =>
    b.extrude(outline, {
      at: [xc, 0, 0],
      x: [0, 0, 1],
      thickness: w,
      bevel: o.bevel ?? Math.min(0.0025, w * 0.3),
      detail: 0.34,
      color,
      bone: o.bone ?? root,
      name: o.name,
    });
  const pair = (
    outline: P2[],
    xOff: number,
    w: number,
    color: Fill,
    o: { bone?: Joint; bevel?: number; name?: string } = {},
  ) => {
    for (const s of [1, -1])
      side(outline, s * xOff, w, color, { ...o, name: o.name ? `${o.name}${s > 0 ? "L" : "R"}` : undefined });
  };
  const rect = (z0: number, z1: number, y0: number, y1: number, c = 0): P2[] =>
    c > 0
      ? [
          [z0 + c, y0],
          [z1 - c, y0],
          [z1, y0 + c],
          [z1, y1 - c],
          [z1 - c, y1],
          [z0 + c, y1],
          [z0, y1 - c],
          [z0, y0 + c],
        ]
      : [
          [z0, y0],
          [z1, y0],
          [z1, y1],
          [z0, y1],
        ];
  // A straight bar between two side-view points, pushed sideways.
  const strut = (a: P2, c: P2, h: number, xc: number, w: number, color: Fill, bone: Joint, name?: string) => {
    const dz = c[0] - a[0];
    const dy = c[1] - a[1];
    const l = Math.hypot(dz, dy);
    const nz = (-dy / l) * (h / 2);
    const ny = (dz / l) * (h / 2);
    return side(
      [
        [a[0] - nz, a[1] - ny],
        [c[0] - nz, c[1] - ny],
        [c[0] + nz, c[1] + ny],
        [a[0] + nz, a[1] + ny],
      ],
      xc,
      w,
      color,
      { bone, bevel: Math.min(0.003, w * 0.25), name },
    );
  };
  const decal = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: V,
    dir: V,
    o: { bone?: Joint; up?: V; lit?: number; name?: string } = {},
  ) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone: o.bone ?? root,
      at,
      dir,
      axis: "z",
      up: o.up ?? [0, 1, 0],
      texture: tex,
      name: o.name,
    });
    if (o.lit) glow(p, o.lit);
    return p;
  };
  const lathe = (
    outline: P2[],
    at: V,
    color: Fill,
    o: { bone?: Joint; segments?: number; name?: string; group?: string } = {},
  ) =>
    b.lathe(outline, {
      at,
      axis: [0, 0, 1],
      segments: o.segments ?? 8,
      spin: 180 / (o.segments ?? 8),
      color,
      bone: o.bone ?? root,
      name: o.name,
      group: o.group,
    });

  // ================================================================= UPPER RECEIVER
  // Gunmetal frame, ivory armour plates layered over it with seams between them.
  side(
    [
      [-0.17, 0.186],
      [0.206, 0.186],
      [0.206, 0.29],
      [0.196, 0.301],
      [-0.152, 0.301],
      [-0.17, 0.283],
    ],
    0,
    0.06,
    GM_D,
    { name: "receiverFrame", bevel: 0.004 },
  );
  // rear, mid and front armour plates
  const plateRear: P2[] = [
    [-0.162, 0.195],
    [-0.042, 0.195],
    [-0.042, 0.293],
    [-0.147, 0.293],
    [-0.162, 0.278],
  ];
  pair(plateRear, 0.032, 0.009, IV, { name: "plateRear" });
  const plateFront: P2[] = [
    [0.102, 0.195],
    [0.199, 0.195],
    [0.199, 0.282],
    [0.188, 0.293],
    [0.102, 0.293],
  ];
  pair(plateFront, 0.032, 0.009, IV, { name: "plateFront" });
  side(rect(-0.036, 0.096, 0.195, 0.293), 0.032, 0.009, IV, { name: "plateMidL" });
  side(rect(-0.036, 0.096, 0.195, 0.256), -0.032, 0.009, IV, { name: "plateMidLowR" });
  side(rect(-0.036, 0.096, 0.281, 0.293), -0.032, 0.009, IV, { name: "plateMidTopR" });
  // light top trims and darker lower bands on the plates (faked lighting)
  for (const s of [1, -1]) {
    box([0.004, 0.005, 0.11], IV_H, [s * 0.0375, 0.2905, -0.096]);
    box([0.004, 0.005, 0.087], IV_H, [s * 0.0375, 0.2905, 0.145]);
    box([0.003, 0.008, 0.112], IV_D, [s * 0.037, 0.2, -0.1]);
    box([0.003, 0.008, 0.09], IV_D, [s * 0.037, 0.2, 0.15]);
  }
  box([0.003, 0.008, 0.124], IV_D, [0.037, 0.2, 0.03]);
  box([0.003, 0.008, 0.124], IV_D, [-0.037, 0.2, 0.03]);
  box([0.004, 0.005, 0.124], IV_H, [0.0375, 0.2905, 0.03]);
  // receiver top cover strip under the rail
  side(rect(-0.15, 0.198, 0.296, 0.304), 0, 0.05, IV_H, { name: "topCover" });

  // plate bolts
  for (const s of [1, -1]) {
    const x = s * 0.038;
    for (const [z, y] of [
      [-0.153, 0.203],
      [-0.05, 0.203],
      [-0.05, 0.285],
      [-0.138, 0.285],
      [0.11, 0.203],
      [0.19, 0.203],
      [0.11, 0.285],
      [0.182, 0.282],
    ] as P2[])
      bolt([x, y, z], [s, 0, 0]);
  }

  // right side: heat vent louvres on the rear plate
  box([0.004, 0.052, 0.074], OR, [-0.037, 0.244, -0.1], { glow: 0.9 });
  for (let i = 0; i < 6; i++)
    box([0.009, 0.003, 0.068], IV_H, [-0.038, 0.226 + i * 0.0078, -0.1], { dir: [-0.7, 1, 0] });
  for (const z of [-0.139, -0.061]) box([0.006, 0.056, 0.004], GM, [-0.039, 0.244, z]);
  // right side: charging handle slot and handle (slides back on its joint)
  box([0.004, 0.006, 0.13], CHAR, [-0.0305, 0.2685, 0.03]);
  side(rect(0.06, 0.096, 0.261, 0.276, 0.003), -0.036, 0.012, GM_H, { bone: charger, name: "chargerSlide" });
  b.rod([-0.04, 0.2685, 0.082], [-0.062, 0.2685, 0.082], 0.0065, GM, {
    bone: charger,
    section: { ngon: 6 },
    caps: "flat",
    name: "chargerStem",
  });
  b.frustumBox([-0.06, 0.2685, 0.082], [-0.074, 0.2685, 0.082], [0.022, 0.016], [0.026, 0.02], {
    bone: charger,
    color: OR,
    name: "chargerKnob",
  });
  for (const dy of [-0.005, 0, 0.005])
    box([0.002, 0.002, 0.027], OR_D, [-0.075, 0.2685 + dy, 0.082], { bone: charger });

  // left side: ammo / charge counter screen in a raised bezel
  side(rect(-0.03, 0.09, 0.212, 0.286, 0.006), 0.04, 0.008, GM_D, { name: "screenBezel", bevel: 0.002 });
  side(rect(-0.024, 0.084, 0.217, 0.281, 0.004), 0.0435, 0.002, CHAR, { name: "screenWell", bevel: 0.0005 });
  decal(SCREEN, 0.104, 0.061, [0.0458, 0.249, 0.03], [1, 0, 0], { lit: 1.2, name: "ammoCounter" });
  for (const [i, c] of [OR, GM_H, GM_H].entries()) box([0.006, 0.006, 0.01], c, [0.039, 0.2045, 0.0 + i * 0.016]);
  // left side: insignia plate on the rear plate
  decal(INSIGNIA, 0.088, 0.037, [0.038, 0.247, -0.1], [1, 0, 0], { name: "insigniaL" });
  decal(HAZARD, 0.1, 0.009, [0.038, 0.212, -0.1], [1, 0, 0], { name: "hazardRearL" });
  decal(HAZARD, 0.1, 0.009, [-0.038, 0.212, -0.1], [-1, 0, 0], { name: "hazardRearR" });
  // rear face: status LEDs and the stock mount block
  side(rect(-0.176, -0.168, 0.193, 0.222, 0.003), 0, 0.044, CHAR, { name: "ledPanel" });
  for (const [i, c] of [LIME, CY, OR].entries())
    box([0.008, 0.006, 0.004], c, [-0.012 + i * 0.012, 0.2075, -0.177], { glow: 1.4 });
  disc(0.024, 0.02, 8, GM, [0, YB - 0.01, -0.176], [0, 0, 1]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    bolt([0.017 * Math.cos(a), YB - 0.01 + 0.017 * Math.sin(a), -0.187], [0, 0, -1], { r: 0.0026 });
  }

  // ================================================================= LOWER RECEIVER
  side(
    [
      [-0.142, 0.188],
      [0.172, 0.188],
      [0.172, 0.166],
      [0.146, 0.118],
      [0.022, 0.118],
      [0.018, 0.142],
      [-0.118, 0.142],
      [-0.142, 0.162],
    ],
    0,
    0.054,
    GM,
    { name: "lowerReceiver", bevel: 0.004 },
  );
  // magwell lip and side ribs
  for (const s of [1, -1]) {
    side(
      [
        [0.02, 0.114],
        [0.15, 0.114],
        [0.154, 0.124],
        [0.144, 0.132],
        [0.026, 0.132],
        [0.017, 0.124],
      ],
      s * 0.0285,
      0.006,
      GM_H,
      { name: `magwellLip${s > 0 ? "L" : "R"}` },
    );
    side(
      [
        [0.03, 0.131],
        [0.144, 0.131],
        [0.163, 0.162],
        [0.158, 0.168],
        [0.036, 0.168],
        [0.03, 0.162],
      ],
      s * 0.0295,
      0.006,
      IV,
      { name: `magwellPlate${s > 0 ? "L" : "R"}` },
    );
    box([0.003, 0.005, 0.11], IV_D, [s * 0.0315, 0.1335, 0.087]);
    for (const z of [0.04, 0.145]) bolt([s * 0.033, 0.1495, z], [s, 0, 0], { r: 0.0026 });
    box([0.003, 0.003, 0.29], GM_H, [s * 0.0275, 0.186, 0.015]);
  }
  side(rect(0.018, 0.152, 0.114, 0.12), 0, 0.06, GM_H, { name: "magwellFloor" });
  decal(SERIAL, 0.088, 0.0105, [0.0338, 0.1555, 0.09], [1, 0, 0], { name: "serial" });
  // magazine release button (left)
  disc(0.006, 0.006, 6, OR, [0.03, 0.153, 0.01], [1, 0, 0]);
  // selector switch (left), with its marks
  disc(0.011, 0.004, 8, GM_D, [0.0285, 0.165, -0.1], [1, 0, 0]);
  decal(SELECTOR_MARKS, 0.036, 0.022, [0.0283, 0.172, -0.1], [1, 0, 0], { name: "selectorMarks" });
  disc(0.006, 0.006, 6, GM_H, [0.032, 0.165, -0.1], [1, 0, 0], { bone: selector });
  side(
    [
      [-0.1, 0.161],
      [-0.07, 0.163],
      [-0.067, 0.167],
      [-0.1, 0.169],
    ],
    0.035,
    0.004,
    OR,
    { bone: selector, name: "selectorLever", bevel: 0.001 },
  );
  disc(0.0035, 0.004, 6, GM_H, [-0.035, 0.165, -0.1], [-1, 0, 0], { bone: selector });
  // power coupling block at the front of the lower receiver
  side(rect(0.17, 0.192, 0.158, 0.186, 0.004), 0, 0.054, GM_H, { name: "powerCoupling" });
  for (const s of [1, -1]) disc(0.006, 0.008, 6, OR, [s * 0.02, 0.17, 0.196], [0, 0, 1]);

  // ================================================================= PISTOL GRIP
  const gripOutline: P2[] = [
    [-0.126, 0.152],
    [-0.068, 0.146],
    [-0.0737, 0.125],
    [-0.0709, 0.11],
    [-0.0806, 0.093],
    [-0.0784, 0.075],
    [-0.0883, 0.057],
    [-0.0859, 0.04],
    [-0.0958, 0.022],
    [-0.098, 0.012],
    [-0.158, 0.012],
    [-0.153, 0.06],
    [-0.146, 0.1],
    [-0.14, 0.128],
    [-0.142, 0.14],
  ];
  side(gripOutline, 0, 0.034, CHAR, { name: "grip", bevel: 0.004 });
  // grip side panels with ridges
  for (const s of [1, -1]) {
    side(
      [
        [-0.13, 0.135],
        [-0.088, 0.13],
        [-0.1, 0.03],
        [-0.148, 0.03],
        [-0.142, 0.1],
      ],
      s * 0.0175,
      0.004,
      GM,
      { name: `gripPanel${s > 0 ? "L" : "R"}`, bevel: 0.0012 },
    );
    for (let i = 0; i < 7; i++) {
      const y = 0.045 + i * 0.0125;
      const zc = -0.122 + (y - 0.08) * 0.22;
      box([0.003, 0.0035, 0.036], GM_H, [s * 0.0198, y, zc], { dir: [0, 1, 0.22 * 0] });
    }
  }
  side(rect(-0.163, -0.093, 0, 0.014, 0.004), 0, 0.04, GM, { name: "gripCap" });
  side(rect(-0.145, -0.11, 0.003, 0.011), 0, 0.042, OR, { name: "gripCapInsert", bevel: 0.001 });
  side(
    [
      [-0.145, 0.147],
      [-0.131, 0.141],
      [-0.134, 0.1],
      [-0.139, 0.05],
      [-0.154, 0.042],
      [-0.156, 0.06],
      [-0.149, 0.1],
      [-0.143, 0.128],
    ],
    0,
    0.037,
    IV,
    { name: "gripBackstrap", bevel: 0.003 },
  );

  // ================================================================= TRIGGER + GUARD
  b.sweep(
    catmull([
      [0, 0.124, -0.075],
      [0, 0.1, -0.063],
      [0, 0.096, -0.02],
      [0, 0.1, 0.012],
      [0, 0.126, 0.025],
    ]),
    () => [0.005, 0.004],
    { section: "box", color: GM, bone: root, caps: "flat", name: "triggerGuard" },
  );
  side(
    [
      [-0.013, 0.148],
      [-0.002, 0.148],
      [-0.003, 0.13],
      [-0.008, 0.116],
      [-0.016, 0.106],
      [-0.024, 0.104],
      [-0.019, 0.114],
      [-0.014, 0.126],
    ],
    0,
    0.008,
    OR,
    { bone: trigger, name: "triggerBlade", bevel: 0.0015 },
  );
  disc(0.004, 0.03, 6, GM_H, [0, 0.142, -0.008], [1, 0, 0]);

  // ================================================================= MAGAZINE (energy cell)
  const mz = (y: number) => (0.15 - y) * RAKE; // rake offset
  side(
    [
      [0.032, 0.17],
      [0.134, 0.17],
      [0.134 + mz(0.118), 0.118],
      [0.136 + mz(0.03), 0.03],
      [0.128 + mz(0.022), 0.022],
      [0.042 + mz(0.022), 0.022],
      [0.032 + mz(0.03), 0.03],
      [0.032 + mz(0.118), 0.118],
    ],
    0,
    0.046,
    GM,
    { bone: mag, name: "cellBody", bevel: 0.003 },
  );
  side(
    [
      [0.034 + mz(0.022), 0.022],
      [0.142 + mz(0.022), 0.022],
      [0.146 + mz(0.012), 0.012],
      [0.14 + mz(0.004), 0.004],
      [0.04 + mz(0.004), 0.004],
      [0.03 + mz(0.012), 0.012],
    ],
    0,
    0.052,
    OR,
    { bone: mag, name: "cellBase", bevel: 0.003 },
  );
  for (let i = 0; i < 4; i++)
    box([0.054, 0.003, 0.004], OR_D, [0, 0.0055, 0.06 + i * 0.022 + mz(0.004)], { bone: mag });
  for (const s of [1, -1]) {
    // window well, frame ribs and the glowing charge bars
    side(
      [
        [0.046 + mz(0.112), 0.112],
        [0.122 + mz(0.112), 0.112],
        [0.122 + mz(0.04), 0.04],
        [0.046 + mz(0.04), 0.04],
      ],
      s * 0.0235,
      0.003,
      CHAR,
      { bone: mag, bevel: 0.0005, name: `cellWindow${s > 0 ? "L" : "R"}` },
    );
    for (let i = 0; i < 5; i++) {
      const y = 0.048 + i * 0.0135;
      box([0.004, 0.0075, 0.062], i < 4 ? CY : CY_D, [s * 0.0245, y, 0.084 + mz(y)], {
        bone: mag,
        glow: i < 4 ? 1.3 : 0,
        dir: [0, 1, 0],
      });
    }
    for (const z of [0.042, 0.126]) {
      const y = 0.076;
      box([0.005, 0.078, 0.006], GM_H, [s * 0.0245, y, z + mz(y)], { bone: mag, dir: [0, 1, -RAKE] });
    }
    box([0.005, 0.005, 0.088], GM_H, [s * 0.0245, 0.1165, 0.084 + mz(0.1165)], { bone: mag });
    box([0.005, 0.005, 0.088], GM_H, [s * 0.0245, 0.0355, 0.084 + mz(0.0355)], { bone: mag });
    bolt([s * 0.027, 0.0355, 0.05 + mz(0.0355)], [s, 0, 0], { bone: mag, r: 0.0025 });
    bolt([s * 0.027, 0.0355, 0.118 + mz(0.0355)], [s, 0, 0], { bone: mag, r: 0.0025 });
  }
  decal(CELL_LABEL, 0.05, 0.0135, [0.0272, 0.029, 0.085 + mz(0.029)], [1, 0, 0], { bone: mag, name: "cellLabel" });
  // front glow strip
  box([0.012, 0.07, 0.004], CY, [0, 0.077, 0.136 + mz(0.077)], { bone: mag, glow: 1.3, dir: [0, 1, -RAKE] });

  // ================================================================= TOP RAIL
  side(rect(-0.14, 0.42, 0.303, 0.311), 0, 0.022, GM, { name: "railTop", bevel: 0.0015 });
  for (let z = -0.132; z < 0.414; z += 0.0105) box([0.027, 0.006, 0.0055], GM_H, [0, 0.3135, z]);
  box([0.03, 0.012, 0.008], GM, [0, 0.312, 0.418]);

  // ================================================================= SCOPE
  for (const z of [0.0, 0.112]) {
    side(rect(z - 0.012, z + 0.012, 0.31, 0.334, 0.003), 0, 0.034, GM, { name: `scopeMount${z > 0 ? "F" : "R"}` });
    lathe(
      [
        [0.026, 0],
        [0.033, 0],
        [0.033, 0.016],
        [0.026, 0.016],
      ],
      [0, YS, z - 0.008],
      GM,
      { name: `scopeRing${z > 0 ? "F" : "R"}` },
    );
    disc(0.0055, 0.01, 6, OR, [-0.021, 0.322, z], [-1, 0, 0]);
    disc(0.0035, 0.004, 6, GM_H, [0.018, 0.322, z], [1, 0, 0]);
  }
  lathe(
    [
      [0, 0.008],
      [0.021, 0.008],
      [0.023, 0],
      [0.031, 0],
      [0.032, 0.005],
      [0.032, 0.032],
      [0.025, 0.042],
      [0.025, 0.2],
      [0.034, 0.226],
      [0.037, 0.232],
      [0.037, 0.258],
      [0.031, 0.258],
      [0.028, 0.25],
      [0, 0.25],
    ],
    [0, YS, -0.072],
    GM_D,
    { name: "scopeBody" },
  );
  // ivory armour saddle and turrets
  side(
    [
      [-0.03, 0.384],
      [0.13, 0.384],
      [0.145, 0.378],
      [0.145, 0.39],
      [0.125, 0.398],
      [-0.02, 0.398],
      [-0.035, 0.392],
    ],
    0,
    0.036,
    IV,
    { name: "scopeSaddle" },
  );
  for (const s of [1, -1])
    side(rect(-0.025, 0.14, 0.352, 0.384, 0.004), s * 0.02, 0.012, IV, { name: `scopeCheek${s > 0 ? "L" : "R"}` });
  decal(SCOPE_LABEL, 0.03, 0.0075, [-0.0265, 0.368, 0.026], [-1, 0, 0], { name: "scopeLabel" });
  disc(0.011, 0.012, 8, GM, [0, 0.404, 0.055], [0, 1, 0]);
  disc(0.0125, 0.007, 8, GM_H, [0, 0.413, 0.055], [0, 1, 0]);
  box([0.003, 0.002, 0.012], OR, [0, 0.4175, 0.055]);
  for (let i = 0; i < 4; i++) box([0.022, 0.002, 0.004], CHAR, [0, 0.398, -0.012 + i * 0.01]);
  // piggyback holographic sight on the scope saddle: an open window with a floating glowing reticle
  side(rect(0.074, 0.128, 0.396, 0.406, 0.003), 0, 0.028, GM, { name: "holoBase" });
  for (const s of [1, -1]) for (const z of [0.08, 0.122]) box([0.004, 0.026, 0.007], GM, [s * 0.0125, 0.419, z]);
  side(rect(0.074, 0.128, 0.43, 0.436, 0.002), 0, 0.03, IV, { name: "holoHood" });
  box([0.006, 0.006, 0.01], OR, [0.016, 0.401, 0.1]);
  box([0.004, 0.004, 0.008], LIME, [-0.0145, 0.401, 0.09], { glow: 1.5 });
  for (const [dz, dir] of [
    [0.001, [0, 0, -1]],
    [-0.001, [0, 0, 1]],
  ] as [number, V][])
    decal(HOLO, 0.021, 0.021, [0, 0.4185, 0.112 + dz], dir, {
      lit: 1.6,
      name: `holoReticle${dz > 0 ? "Rear" : "Front"}`,
    });
  disc(0.011, 0.012, 8, GM, [-0.031, YS + 0.004, 0.055], [-1, 0, 0]);
  disc(0.0125, 0.007, 8, GM_H, [-0.04, YS + 0.004, 0.055], [-1, 0, 0]);
  box([0.002, 0.012, 0.003], OR, [-0.0445, YS + 0.004, 0.055]);
  // left battery pod with status LED
  side(rect(0.0, 0.07, 0.355, 0.378, 0.005), 0.031, 0.01, GM_H, { name: "scopeBattery" });
  disc(0.007, 0.006, 6, GM, [0.038, 0.3665, 0.083], [0, 0, 1]);
  box([0.003, 0.005, 0.008], LIME, [0.0365, 0.3665, 0.05], { glow: 1.5 });
  for (const z of [0.01, 0.025]) box([0.002, 0.016, 0.004], GM, [0.0365, 0.3665, z]);
  // lenses
  const rearLens = b.part(new THREE.CircleGeometry(0.0215, 8), "#ffffff", {
    bone: root,
    at: [0, YS, -0.0645],
    dir: [0, 0, -1],
    axis: "z",
    texture: RETICLE,
    name: "reticle",
  });
  glow(rearLens, 1.3);
  disc(0.028, 0.003, 8, CY, [0, YS, 0.1785], [0, 0, 1], { glow: 0.9 });
  disc(0.012, 0.004, 8, CY_H, [0, YS, 0.1795], [0, 0, 1], { glow: 1.2 });
  // flip covers, hinged on the left side, posed open after building
  disc(0.034, 0.006, 8, GM, [0, YS, -0.0755], [0, 0, -1], { bone: coverRear });
  disc(0.02, 0.003, 8, IV, [0, YS, -0.0795], [0, 0, -1], { bone: coverRear });
  box([0.01, 0.016, 0.008], GM, [0.032, YS, -0.077], { bone: coverRear });
  box([0.008, 0.012, 0.008], OR, [-0.036, YS, -0.077], { bone: coverRear });
  disc(0.0042, 0.03, 6, GM_H, [0.037, YS, -0.077], [0, 1, 0]);
  box([0.008, 0.008, 0.012], GM, [0.036, YS, -0.069]);
  disc(0.04, 0.006, 8, GM, [0, YS, 0.191], [0, 0, 1], { bone: coverFront });
  disc(0.024, 0.003, 8, IV, [0, YS, 0.1945], [0, 0, 1], { bone: coverFront });
  box([0.01, 0.016, 0.008], GM, [0.038, YS, 0.19], { bone: coverFront });
  box([0.008, 0.012, 0.008], OR, [-0.042, YS, 0.191], { bone: coverFront });
  disc(0.0042, 0.034, 6, GM_H, [0.043, YS, 0.19], [0, 1, 0]);
  box([0.008, 0.008, 0.012], GM, [0.04, YS, 0.182]);

  // ================================================================= HANDGUARD
  side(
    [
      [0.2, 0.204],
      [0.414, 0.204],
      [0.43, 0.218],
      [0.43, 0.286],
      [0.416, 0.3],
      [0.2, 0.3],
    ],
    0,
    0.056,
    GM_D,
    { name: "handguardCore", bevel: 0.004 },
  );
  side(rect(0.205, 0.414, 0.296, 0.304), 0, 0.046, IV_H, { name: "handguardTop" });
  const hgUpper: P2[] = [
    [0.21, 0.246],
    [0.392, 0.246],
    [0.412, 0.262],
    [0.412, 0.284],
    [0.402, 0.294],
    [0.21, 0.294],
  ];
  pair(hgUpper, 0.03, 0.009, IV, { name: "handguardUpper" });
  pair(rect(0.21, 0.296, 0.208, 0.241, 0.004), 0.03, 0.009, IV, { name: "handguardLowRear" });
  pair(
    [
      [0.368, 0.208],
      [0.4, 0.208],
      [0.412, 0.22],
      [0.412, 0.241],
      [0.368, 0.241],
    ],
    0.03,
    0.009,
    IV,
    { name: "handguardLowFront" },
  );
  for (const s of [1, -1]) {
    // vent grille between the lower plates
    box([0.004, 0.032, 0.07], OR, [s * 0.029, 0.2245, 0.332], { glow: 0.9 });
    for (let i = 0; i < 6; i++)
      box([0.007, 0.032, 0.004], GM_H, [s * 0.031, 0.2245, 0.302 + i * 0.012], { dir: [0, 1, 0], up: [s * 0.5, 0, 1] });
    box([0.004, 0.004, 0.2], IV_H, [s * 0.0355, 0.292, 0.3]);
    box([0.003, 0.006, 0.18], IV_D, [s * 0.035, 0.2495, 0.3]);
    for (const [z, y] of [
      [0.218, 0.252],
      [0.218, 0.287],
      [0.385, 0.252],
      [0.395, 0.286],
      [0.218, 0.214],
      [0.288, 0.214],
      [0.288, 0.236],
      [0.376, 0.214],
      [0.402, 0.222],
    ] as P2[])
      bolt([s * 0.0355, y, z], [s, 0, 0], { r: 0.003 });
  }
  decal(MODEL_MARK, 0.09, 0.03, [0.036, 0.27, 0.3], [1, 0, 0], { name: "modelMarkL" });
  decal(MODEL_MARK, 0.09, 0.03, [-0.036, 0.27, 0.3], [-1, 0, 0], { name: "modelMarkR" });
  decal(WARNING, 0.02, 0.0175, [0.036, 0.2245, 0.39], [1, 0, 0], { name: "warningL" });
  decal(DANGER, 0.075, 0.0105, [-0.036, 0.2525, 0.29], [-1, 0, 0], { name: "dangerR" });
  // bottom rail and foregrip
  side(rect(0.24, 0.41, 0.196, 0.205), 0, 0.022, GM, { name: "railBottom", bevel: 0.0015 });
  for (let z = 0.246; z < 0.406; z += 0.0105) box([0.026, 0.005, 0.0055], GM_H, [0, 0.194, z]);
  side(rect(0.305, 0.36, 0.182, 0.2, 0.004), 0, 0.034, GM, { name: "foregripClamp" });
  for (const s of [1, -1]) bolt([s * 0.0175, 0.19, 0.345], [s, 0, 0], { r: 0.003 });
  b.rod([0, 0.186, 0.332], [0, 0.086, 0.344], 0.0165, CHAR, {
    section: { ngon: 8 },
    caps: "flat",
    bone: root,
    name: "foregrip",
  });
  for (const t of [0.25, 0.5, 0.75])
    disc(0.0178, 0.005, 8, GM_H, [0, 0.186 - t * 0.1, 0.332 + t * 0.012], [0, 1, 0.12]);
  disc(0.02, 0.01, 8, OR, [0, 0.081, 0.3445], [0, 1, 0.12], { r2: 0.0175 });
  // laser module (right) with a red lens
  side(rect(0.362, 0.414, 0.211, 0.236, 0.005), -0.043, 0.022, GM, { name: "laserModule" });
  box([0.012, 0.01, 0.03], GM_H, [-0.034, 0.2235, 0.388]);
  disc(0.0075, 0.004, 8, RED, [-0.043, 0.2235, 0.4145], [0, 0, 1], { glow: 1.6 });
  disc(0.0095, 0.004, 8, GM_H, [-0.043, 0.2235, 0.412], [0, 0, 1]);
  box([0.012, 0.006, 0.01], OR, [-0.043, 0.2385, 0.372]);
  // front sight post
  side(
    [
      [0.392, 0.316],
      [0.412, 0.316],
      [0.408, 0.338],
      [0.4, 0.338],
    ],
    0,
    0.008,
    GM,
    { name: "frontSight", bevel: 0.0015 },
  );
  box([0.009, 0.004, 0.004], OR, [0, 0.336, 0.404]);

  // ================================================================= CABLES + CONDUITS
  for (const s of [1, -1]) {
    const cable = catmull([
      [s * 0.02, 0.17, 0.198],
      [s * 0.032, 0.181, 0.24],
      [s * 0.037, 0.186, 0.33],
      [s * 0.035, 0.196, 0.405],
      [s * 0.027, 0.214, 0.436],
    ]);
    b.sweep(cable, 0.0048, {
      section: { ngon: 6 },
      color: s > 0 ? CHAR : GM_D,
      bone: root,
      caps: "flat",
      name: `cable${s > 0 ? "L" : "R"}`,
    });
    for (const t of [0.3, 0.55, 0.8]) {
      const p = cable.at(t);
      disc(0.0062, 0.006, 6, s > 0 ? OR : CU, [p.x, p.y, p.z], cable.tangentAt(t).toArray() as V);
    }
  }
  const pipe = catmull([
    [0.021, 0.302, 0.19],
    [0.024, 0.306, 0.25],
    [0.024, 0.306, 0.38],
    [0.022, 0.294, 0.436],
  ]);
  b.sweep(pipe, 0.0042, { section: { ngon: 6 }, color: CU, bone: root, caps: "flat", name: "coolantPipe" });
  for (const t of [0.12, 0.5, 0.86]) {
    const p = pipe.at(t);
    disc(0.006, 0.005, 6, CU_D, [p.x, p.y, p.z], pipe.tangentAt(t).toArray() as V);
  }

  // ================================================================= EMITTER: heat sink, coils, muzzle
  disc(0.021, 0.07, 6, GM_D, [0, YB, 0.455], [0, 0, 1]);
  disc(0.045, 0.006, 8, GM, [0, YB, 0.433], [0, 0, 1]);
  disc(0.046, 0.0018, 8, CY, [0, YB, 0.4378], [0, 0, 1], { glow: 1.5 });
  for (let i = 0; i < 6; i++) disc(0.047, 0.0028, 8, i % 2 ? GM_H : IV_D, [0, YB, 0.441 + i * 0.0062], [0, 0, 1]);
  disc(0.045, 0.006, 8, GM, [0, YB, 0.4775], [0, 0, 1]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    bolt([0.037 * Math.cos(a), YB + 0.037 * Math.sin(a), 0.481], [0, 0, 1], { r: 0.0026 });
  }
  // glowing core with copper coils between spacer rings
  glow(
    b.rod([0, YB, 0.48], [0, YB, 0.558], 0.0155, CY, {
      section: { ngon: 8 },
      caps: "flat",
      bone: root,
      name: "emitterCore",
    }),
    1.8,
  );
  for (const z of [0.481, 0.5185, 0.556]) disc(0.031, 0.006, 8, GM_H, [0, YB, z], [0, 0, 1]);
  for (const [z0, z1] of [
    [0.4865, 0.5135],
    [0.5235, 0.5505],
  ]) {
    const turns = 3;
    const coil = spiral([0, YB, z0], [0, YB + 0.0215, z0], [0, 0, 1], { turns, pitch: (z1 - z0) / turns });
    b.sweep(coil, 0.0032, {
      section: { ngon: 4 },
      color: CU,
      bone: root,
      caps: "flat",
      name: `coil${z0 < 0.5 ? "A" : "B"}`,
    });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const x = 0.036 * Math.cos(a);
    const y = YB + 0.036 * Math.sin(a);
    b.rod([x, y, 0.477], [x, y, 0.562], 0.0042, y > YB ? CU_H : GM_H, {
      section: { ngon: 6 },
      caps: "flat",
      bone: root,
    });
  }
  lathe(
    [
      [0, 0],
      [0.036, 0],
      [0.041, 0.006],
      [0.041, 0.03],
      [0.035, 0.044],
      [0.025, 0.044],
      [0.022, 0.034],
      [0, 0.034],
    ],
    [0, YB, 0.556],
    GM,
    { name: "muzzleBlock", group: "muzzle" },
  );
  const hazardRing = paint((_p, _n, s) => (((Math.floor((s[1] + s[0] * 1800) / 22.5) % 2) + 2) % 2 ? CHAR : OR));
  lathe(
    [
      [0.03, 0],
      [0.0425, 0],
      [0.0425, 0.016],
      [0.03, 0.016],
    ],
    [0, YB, 0.565],
    hazardRing,
    { name: "muzzleHazard", group: "muzzle" },
  );
  disc(0.021, 0.003, 8, CY_H, [0, YB, 0.5915], [0, 0, 1], { glow: 1.6 });
  disc(0.012, 0.004, 8, "#ffffff", [0, YB, 0.592], [0, 0, 1], { glow: 2 });
  const prongPaint = paint((_p, _n, s) => (s[0] > 0.06 ? OR : GM_H));
  for (const deg of [90, 210, 330]) {
    const a = (deg * Math.PI) / 180;
    const u: V = [Math.cos(a), Math.sin(a), 0];
    b.extrude(
      [
        [0, 0.024],
        [0, 0.041],
        [0.028, 0.041],
        [0.068, 0.031],
        [0.084, 0.022],
        [0.079, 0.017],
        [0.06, 0.021],
        [0.03, 0.026],
      ],
      {
        at: [0, YB, 0.588],
        x: [0, 0, 1],
        y: u,
        thickness: 0.012,
        bevel: 0.003,
        detail: 0.34,
        color: prongPaint,
        bone: root,
        name: `prong${deg}`,
        group: "muzzle",
      },
    );
    box([0.006, 0.004, 0.012], CY, [u[0] * 0.0205, YB + u[1] * 0.0205, 0.653], { dir: u, glow: 1.6 });
  }
  // top spine over the emitter with a radiator comb
  side(
    [
      [0.425, 0.286],
      [0.556, 0.286],
      [0.59, 0.29],
      [0.59, 0.297],
      [0.57, 0.303],
      [0.44, 0.303],
      [0.425, 0.298],
    ],
    0,
    0.012,
    GM,
    { name: "emitterSpine", bevel: 0.002 },
  );
  for (let i = 0; i < 7; i++) box([0.024, 0.011, 0.0032], i % 2 ? GM_H : IV, [0, 0.307, 0.474 + i * 0.0125]);
  box([0.004, 0.003, 0.08], OR, [0, 0.3135, 0.511]);
  disc(0.0318, 0.0016, 8, CY, [0, YB, 0.5185], [0, 0, 1], { glow: 1.4 });
  // data cable from the counter screen up to the scope
  const dataCable = catmull([
    [0.0445, 0.279, 0.072],
    [0.047, 0.303, 0.068],
    [0.041, 0.336, 0.052],
    [0.033, 0.357, 0.04],
  ]);
  b.sweep(dataCable, 0.0025, { section: { ngon: 6 }, color: CHAR, bone: root, caps: "flat", name: "dataCable" });
  disc(0.004, 0.006, 6, OR, [0.0445, 0.282, 0.0715], [0, 1, 0]);
  disc(0.004, 0.006, 6, OR, [0.034, 0.355, 0.041], dataCable.tangentAt(1).toArray() as V);

  // ================================================================= STOCK (slides on the buffer tube)
  b.rod([0, YB - 0.01, -0.18], [0, YB - 0.01, -0.43], 0.0155, GM, {
    section: { ngon: 8 },
    caps: "flat",
    bone: root,
    name: "bufferTube",
  });
  for (let i = 0; i < 7; i++) disc(0.0165, 0.004, 8, CHAR, [0, YB - 0.01, -0.29 - i * 0.02], [0, 0, 1]);
  side(
    rect(-0.212, -0.29, 0.222, 0.272, 0.008)
      .map(([z, y]) => [z, y] as P2)
      .reverse(),
    0,
    0.042,
    GM,
    { bone: stock, name: "stockCollar" },
  );
  box([0.012, 0.01, 0.05], OR, [0, 0.217, -0.25], { bone: stock });
  for (const s of [1, -1])
    for (const z of [-0.222, -0.28]) bolt([s * 0.0215, 0.26, z], [s, 0, 0], { bone: stock, r: 0.0028 });
  strut([-0.215, 0.279], [-0.535, 0.284], 0.022, 0, 0.026, IV, stock, "stockTop");
  strut([-0.27, 0.225], [-0.53, 0.118], 0.02, 0, 0.026, IV, stock, "stockLower");
  strut([-0.33, 0.205], [-0.455, 0.278], 0.014, 0, 0.018, GM_H, stock, "stockBrace");
  strut([-0.528, 0.105], [-0.528, 0.298], 0.022, 0, 0.03, IV, stock, "stockUpright");
  side(rect(-0.44, -0.4, 0.21, 0.27, 0.006), 0, 0.03, GM, { bone: stock, name: "stockTubeCap" });
  side(
    [
      [-0.3, 0.29],
      [-0.47, 0.29],
      [-0.48, 0.299],
      [-0.46, 0.31],
      [-0.31, 0.31],
      [-0.295, 0.3],
    ],
    0,
    0.034,
    CHAR,
    { bone: stock, name: "cheekRest" },
  );
  box([0.036, 0.003, 0.12], OR, [0, 0.3115, -0.385], { bone: stock });
  side(
    [
      [-0.538, 0.094],
      [-0.54, 0.308],
      [-0.556, 0.31],
      [-0.562, 0.29],
      [-0.562, 0.11],
      [-0.554, 0.092],
    ],
    0,
    0.042,
    OR,
    { bone: stock, name: "buttPad" },
  );
  for (let i = 0; i < 9; i++) box([0.044, 0.0035, 0.006], OR_D, [0, 0.12 + i * 0.021, -0.56], { bone: stock });
  for (const s of [1, -1]) {
    for (const [z, y] of [
      [-0.528, 0.12],
      [-0.528, 0.28],
      [-0.51, 0.282],
      [-0.235, 0.28],
    ] as P2[])
      bolt([s * 0.0145, y, z], [s, 0, 0], { bone: stock, r: 0.003 });
    decal(HAZARD, 0.06, 0.008, [s * 0.0145, 0.2815, -0.38], [s, 0, 0], {
      bone: stock,
      name: `stockHazard${s > 0 ? "L" : "R"}`,
    });
  }
  // sling loops
  b.part(new THREE.TorusGeometry(0.011, 0.0028, 4, 8), GM_H, {
    bone: stock,
    at: [0, 0.098, -0.52],
    dir: [1, 0, 0],
    axis: "z",
    flat: true,
    name: "slingLoopRear",
  });
  b.part(new THREE.TorusGeometry(0.011, 0.0028, 4, 8), GM_H, {
    bone: root,
    at: [0.038, 0.214, 0.255],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
    name: "slingLoopFront",
  });
  // spare charge capsule clipped under the stock's top bar (left)
  const capsule = (z0: number, z1: number, r: number, color: string) =>
    b.rod([0.027, 0.255, z0], [0.027, 0.255, z1], r, color, { section: { ngon: 8 }, caps: "flat", bone: stock });
  capsule(-0.335, -0.352, 0.0115, GM);
  glow(capsule(-0.352, -0.428, 0.0092, CY), 1.3);
  capsule(-0.428, -0.445, 0.0115, GM);
  disc(0.006, 0.006, 6, OR, [0.027, 0.255, -0.448], [0, 0, -1], { bone: stock });
  for (const z of [-0.372, -0.39, -0.408]) disc(0.0102, 0.003, 8, GM_H, [0.027, 0.255, z], [0, 0, 1], { bone: stock });
  for (const z of [-0.343, -0.437]) box([0.03, 0.006, 0.008], GM, [0.016, 0.268, z], { bone: stock });
  // dog tag on a bead chain from the front sling loop
  for (let i = 0; i < 6; i++)
    put(new THREE.OctahedronGeometry(0.0022), GM_H, [0.048, 0.208 - i * 0.0052, 0.262 + i * 0.0008]);
  side(rect(0.258, 0.274, 0.15, 0.178, 0.004), 0.048, 0.002, IV_H, { name: "dogTag", bevel: 0.0006 });
  decal(TAG, 0.014, 0.024, [0.0505, 0.164, 0.266], [1, 0, 0], { name: "dogTagText" });
  // stock: lightening holes, gussets, pad trims
  for (const s of [1, -1])
    for (const y of [0.15, 0.19, 0.23])
      disc(0.0062, 0.002, 6, CHAR, [s * 0.0152, y, -0.528], [s, 0, 0], { bone: stock });
  side(
    [
      [-0.518, 0.268],
      [-0.518, 0.236],
      [-0.49, 0.268],
    ],
    0,
    0.018,
    IV_D,
    { bone: stock, name: "gussetTop", bevel: 0.002 },
  );
  side(
    [
      [-0.518, 0.128],
      [-0.518, 0.165],
      [-0.497, 0.14],
    ],
    0,
    0.018,
    IV_D,
    { bone: stock, name: "gussetLow", bevel: 0.002 },
  );
  box([0.043, 0.005, 0.02], OR_H, [0, 0.3095, -0.551], { bone: stock });
  box([0.04, 0.204, 0.004], GM, [0, 0.2, -0.54], { bone: stock });
  box([0.012, 0.19, 0.004], GM, [0, 0.2, -0.563], { bone: stock });
  for (const y of [0.13, 0.27]) bolt([0, y, -0.5655], [0, 0, -1], { bone: stock, r: 0.003 });
  for (const s of [1, -1]) {
    for (const t of [0.2, 0.36, 0.52, 0.68, 0.84])
      disc(0.0048, 0.002, 6, CHAR, [s * 0.0132, 0.225 - 0.107 * t, -0.27 - 0.26 * t], [s, 0, 0], { bone: stock });
    for (const z of [-0.32, -0.425, -0.495])
      disc(0.0045, 0.002, 6, CHAR, [s * 0.0132, 0.28, z], [s, 0, 0], { bone: stock });
  }

  // ================================================================= DETAIL PASS
  for (const s of [1, -1]) {
    // glowing power seams between the armour plates
    box([0.003, 0.0026, 0.19], CY, [s * 0.0345, 0.2435, 0.31], { glow: 1.4 });
    box([0.003, 0.084, 0.003], CY, [s * 0.0352, 0.244, -0.039], { glow: 1.4 });
    // raised secondary plate with slits on the front receiver plate
    side(rect(0.118, 0.186, 0.212, 0.272, 0.006), s * 0.0385, 0.004, IV_H, {
      name: `plateFrontRaised${s > 0 ? "L" : "R"}`,
      bevel: 0.0012,
    });
    for (let i = 0; i < 4; i++) box([0.002, 0.004, 0.044], CHAR, [s * 0.0406, 0.223 + i * 0.012, 0.152]);
    // lower edge trims and rivet rows
    box([0.003, 0.004, 0.37], GM_H, [s * 0.031, 0.1885, 0.018]);
    for (let z = -0.12; z < 0.17; z += 0.036) bolt([s * 0.0285, 0.178, z], [s, 0, 0], { r: 0.0022 });
    // accessory slots on the handguard
    for (const y of [0.262, 0.279]) for (const z of [0.36, 0.385]) box([0.002, 0.006, 0.02], CHAR, [s * 0.0352, y, z]);
  }
  // rear backup sight on the rail
  side(
    [
      [-0.13, 0.316],
      [-0.1, 0.316],
      [-0.104, 0.327],
      [-0.126, 0.327],
    ],
    0,
    0.03,
    GM,
    { name: "rearSightBase", bevel: 0.002 },
  );
  for (const s of [1, -1]) box([0.006, 0.014, 0.008], GM_H, [s * 0.009, 0.333, -0.118]);
  box([0.024, 0.004, 0.006], OR, [0, 0.329, -0.108]);
  // muzzle face bolts between the prongs
  for (const deg of [30, 150, 270]) {
    const a = (deg * Math.PI) / 180;
    bolt([0.031 * Math.cos(a), YB + 0.031 * Math.sin(a), 0.6], [0, 0, 1], { r: 0.0028 });
  }
  // scope eyepiece rubber and front band
  lathe(
    [
      [0.029, 0],
      [0.0345, 0],
      [0.0345, 0.012],
      [0.029, 0.012],
    ],
    [0, YS, -0.07],
    CHAR,
    { name: "eyepieceRubber" },
  );
  lathe(
    [
      [0.024, 0],
      [0.0272, 0],
      [0.0272, 0.007],
      [0.024, 0.007],
    ],
    [0, YS, 0.132],
    OR,
    { name: "scopeBand" },
  );
  for (const s of [1, -1]) {
    // capacitor window on the handguard: three glowing cells behind a dark well
    side(rect(0.214, 0.25, 0.252, 0.288, 0.004), s * 0.0352, 0.003, CHAR, {
      name: `capWell${s > 0 ? "L" : "R"}`,
      bevel: 0.0008,
    });
    for (let i = 0; i < 3; i++) {
      const z = 0.221 + i * 0.011;
      disc(0.0038, 0.03, 6, CY, [s * 0.036, 0.27, z], [0, 1, 0], { glow: 1.3 });
      for (const y of [0.2555, 0.2845]) disc(0.0046, 0.004, 6, GM_H, [s * 0.036, y, z], [0, 1, 0]);
    }
  }
  // right mid plate: raised service plate with bolts and a warning mark
  side(rect(-0.028, 0.088, 0.204, 0.25, 0.006), -0.0385, 0.004, IV_H, { name: "servicePlateR", bevel: 0.0012 });
  for (const [z, y] of [
    [-0.02, 0.211],
    [0.08, 0.211],
    [-0.02, 0.243],
    [0.08, 0.243],
  ] as P2[])
    bolt([-0.0405, y, z], [-1, 0, 0], { r: 0.0026 });
  decal(WARNING, 0.022, 0.019, [-0.042, 0.227, 0.03], [-1, 0, 0], { name: "warningR" });
  decal(SERIAL, 0.088, 0.0105, [-0.0338, 0.1555, 0.09], [-1, 0, 0], { name: "serialR" });

  // ---------------------------------------------------------------- merge the small pieces, one part per bone and colour
  for (const [key, bin] of bins) {
    const merged = mergeGeometries(bin.geos);
    if (!merged) throw new Error(`merge failed for ${key}`);
    const part = b.part(merged, bin.color, {
      bone: bin.bone,
      at: [0, 0, 0],
      flat: true,
      name: `bits.${bin.bone.name}.${bin.color.slice(1)}${bin.glow ? ".glow" : ""}`,
    });
    if (bin.glow) glow(part, bin.glow);
  }

  // flip the scope covers open
  b.pose(coverRear, { axis: [0, 1, 0], deg: -100 });
  b.pose(coverFront, { axis: [0, 1, 0], deg: 100 });

  return b.root;
}
