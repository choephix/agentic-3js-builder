import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  frame,
  grain,
  mix,
  noise,
  paint,
  rgb,
  rng,
  smoothstep,
  stripes,
  svg,
} from "../../../../src/index";
import type { ColorInput, Rgb } from "../../../../src/index";
import { coil, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A whimsical 1920s barnstormer biplane named Bessie: a grinning teal engine cowl, candy-striped struts, bunting between the wings, a waving mustachioed pilot and a goggled dog up front.",
};

type V = [number, number, number];

// ---------------------------------------------------------------- palette
const RED = "#e2463a";
const RED_D = "#a82a26";
const CREAM = "#fff1cf";
const YELLOW = "#ffcf3f";
const YELLOW_D = "#d9962a";
const TEAL = "#27b5a8";
const TEAL_L = "#46d1c2";
const TEAL_D = "#188580";
const NAVY = "#2a3350";
const INK = "#2b1d2e";
const LEATHER = "#8a4a26";
const LEATHER_D = "#5e3018";
const SKIN = "#f4c3a0";
const PINK = "#ff8fa3";
const TIRE = "#2d2a33";
const BRASS_C = "#d9a441";
const TAN = "#d9a066";
const MUZZLE = "#f6dfb8";
const EARS = "#7a4a28";
const STEEL = metal("steel");
const BRASS = metal("brass", { polish: 0.5 });

// ---------------------------------------------------------------- textures
function starPoints(cx: number, cy: number, ro: number, ri: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? ro : ri;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

const GOGGLE_EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#fffdf3"/>
    <circle cx="36" cy="37" r="16" fill="${NAVY}"/>
    <circle cx="36" cy="38" r="10" fill="${INK}"/>
    <circle cx="30" cy="30" r="6" fill="#ffffff"/>
    <circle cx="42" cy="44" r="2.8" fill="#ffffff"/>
    <path d="M8 24 Q20 8 38 8" stroke="#bfeaf2" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const COWL_EYE = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="44" rx="27" ry="33" fill="#fffdf3" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="36" cy="50" rx="15" ry="20" fill="${NAVY}"/>
    <ellipse cx="36" cy="52" rx="9" ry="13" fill="${INK}"/>
    <ellipse cx="31" cy="42" rx="6" ry="8" fill="#ffffff"/>
    <circle cx="43" cy="60" r="3" fill="#ffffff"/>
    <path d="M3 22 Q30 -2 61 16" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SMILE = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="m"><path d="M6 6 C26 52 94 52 114 6 Z"/></clipPath></defs>
    <path d="M6 6 C26 52 94 52 114 6 Z" fill="#4a1c2c"/>
    <g clip-path="url(#m)">
      <ellipse cx="60" cy="46" rx="22" ry="12" fill="${PINK}"/>
      ${[14, 34, 54, 74, 94].map((x) => `<rect x="${x}" y="3" width="18" height="12" rx="2" fill="${CREAM}" stroke="${INK}" stroke-width="1.6"/>`).join("")}
    </g>
    <path d="M6 6 C26 52 94 52 114 6 Z" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M3 8 Q0 2 5 0 M117 8 Q120 2 115 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="${NAVY}" stroke="${CREAM}" stroke-width="4"/>
    <circle cx="50" cy="50" r="36" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>
    <polygon points="${starPoints(50, 51, 31, 13)}" fill="${CREAM}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="50" cy="52" r="8" fill="${RED}" stroke="${INK}" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const NAME = svg(
  `<svg viewBox="0 0 240 44" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${starPoints(22, 22, 14, 6)}" fill="${TEAL}" stroke="${INK}" stroke-width="1.6"/>
    <polygon points="${starPoints(218, 22, 14, 6)}" fill="${TEAL}" stroke="${INK}" stroke-width="1.6"/>
    <text x="120" y="34" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="36" fill="${RED_D}" stroke="${INK}" stroke-width="1.4">Bessie</text>
  </svg>`,
  { size: 640 },
);

const WINDSCREEN = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="94" height="34" rx="7" fill="none" stroke="${BRASS_C}" stroke-width="5"/>
    <path d="M20 32 L36 9" stroke="#e6fbff" stroke-width="5" stroke-linecap="round"/>
    <path d="M36 32 L45 19" stroke="#e6fbff" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const HUB = (() => {
  let wedges = "";
  for (let k = 0; k < 6; k++) {
    const a0 = (k * 60 * Math.PI) / 180;
    const a1 = ((k * 60 + 60) * Math.PI) / 180;
    const p = (a: number) => `${(32 + 28 * Math.cos(a)).toFixed(1)} ${(32 + 28 * Math.sin(a)).toFixed(1)}`;
    wedges += `<path d="M32 32 L${p(a0)} A28 28 0 0 1 ${p(a1)} Z" fill="${k % 2 ? YELLOW : RED}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      ${wedges}
      <circle cx="32" cy="32" r="6" fill="${BRASS_C}" stroke="${INK}" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
})();

const flagTex = (fill: string, dot: string) =>
  svg(
    `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 47 L37 47 L20 5 Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="20" cy="35" r="5" fill="${dot}"/>
    </svg>`,
    { size: 96 },
  );
const FLAGS = [flagTex(RED, CREAM), flagTex(TEAL, YELLOW), flagTex(YELLOW, RED), flagTex(CREAM, TEAL)];

// ---------------------------------------------------------------- paints
const bodyYc = (z: number) => 1.5 + 0.15 * Math.min(Math.max((-z - 0.8) / 3.1, 0), 1);
const shade = (c: Rgb, k: number): Rgb => [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)];

const BODY = paint((p, n) => {
  let c: Rgb = rgb(RED);
  if (n.y < -0.6) c = rgb(CREAM);
  else if (Math.abs(n.x) > 0.6) {
    const d = p.y - bodyYc(p.z);
    if (d > -0.12 && d < 0.12) c = rgb(CREAM);
    else if (d > -0.17 && d <= -0.12) c = rgb(TEAL);
  } else if (n.y > 0.6 && p.z > 1.45 && p.z < 2.3) {
    const k = (Math.floor(p.x / 0.1) + Math.floor(p.z / 0.1)) & 1;
    c = rgb(k ? CREAM : RED);
  }
  c = mix(c, RED_D, 0.28 * smoothstep(0.58, 0.82, noise(p, 0.22, 3)));
  c = mix(c, "#3a2a2a", 0.3 * smoothstep(2.0, 1.2, p.z) * smoothstep(0.55, 0.9, noise(p, 0.25, 8)) * (p.z > 0.8 ? 1 : 0));
  return shade(c, 0.88 + 0.12 * n.y);
});

const wingPaint = (zc: number, tip: number, lead: number) =>
  paint((p, n) => {
    let c: Rgb = n.y >= -0.1 ? rgb(YELLOW) : rgb("#ffe9a8");
    const ax = Math.abs(p.x);
    if (p.z - zc > lead) c = rgb(RED);
    else if (ax > tip) c = rgb(RED);
    else if (ax > tip - 0.09) c = rgb(CREAM);
    else {
      const v = (((p.x / 0.6) % 1) + 1) % 1;
      if (v < 0.035 || v > 0.965) c = mix(c, "#c98a2a", 0.55);
    }
    c = mix(c, YELLOW_D, 0.3 * smoothstep(0.6, 0.85, noise(p, 0.3, 21)));
    return shade(c, 0.9 + 0.1 * n.y);
  });

const woodGrain = grain("#c98a4b", "#9a5f2e", { size: 0.05, axis: "y" });
const PROP = paint((_p, _n, s) => {
  const a = Math.abs(s[1]);
  return a > 1.08 ? YELLOW : a > 1.0 ? INK : woodGrain;
});
const STRUT = paint((p) => (Math.floor(p.y / 0.17) % 2 === 0 ? RED : CREAM));
const RUDDER = paint((p) => (Math.floor((p.y - 1.78) / 0.2) % 2 === 0 ? RED : CREAM));
const cowlBase = countershade(TEAL_L, TEAL_D, { level: 0, soft: 0.6 });
const COWL = paint((_p, _n, s) => (s[0] > 0.05 && s[0] < 0.13 ? CREAM : s[0] > 0.5 && s[0] < 0.57 ? BRASS_C : cowlBase));
const SCARF = stripes(CREAM, RED, { size: 0.2, axis: "z" });

// ---------------------------------------------------------------- geometry helpers
function airfoil(c: number, k: number): Array<[number, number] | [number, number, "sharp"]> {
  const base: Array<[number, number] | [number, number, "sharp"]> = [
    [0.5, 0.015],
    [0.42, 0.06],
    [0.25, 0.1],
    [0, 0.11],
    [-0.25, 0.08],
    [-0.5, 0, "sharp"],
    [-0.25, -0.005],
    [0, -0.015],
    [0.25, -0.01],
    [0.42, -0.015],
  ];
  return base.map((q) => (q.length === 3 ? [q[0] * c, q[1] * c * k, "sharp"] : [q[0] * c, q[1] * c * k]) as [number, number]);
}

const ellipsePts = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 12): V[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy, cz + Math.sin(a) * rz] as V;
  });

const faceZ = (c: V, r: number, x: number, dy: number) =>
  c[2] + Math.sqrt(Math.max(r * r - x * x - dy * dy, 0.0004));

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane" });
  const R = rng(11);

  // ------------------------------------------------------------ skeleton
  const body = b.joint("body", { at: [0, 1.5, 0] });
  const propeller = b.joint("propeller", { parent: body, at: [0, 1.5, 3.06], dir: [0, 0, 1] });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.78, -3.05], dir: [0, 1, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.15, -3.5], dir: [1, 0, 0] });

  const part = (geo: THREE.BufferGeometry, color: ColorInput, at: V, o: Record<string, any> = {}) =>
    b.part(geo, color, { bone: body, at, ...o });
  const ell = (at: V, r: V, color: ColorInput, o: Record<string, any> = {}) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, { bone: body, at, scale: r, ...o });
  const rod = (a: V, c: V, r: number | [number, number], color: ColorInput, o: Record<string, any> = {}) =>
    b.rod(a, c, r, color, { bone: body, ...o });
  const cap = (a: V, c: V, r: number | [number, number], color: ColorInput, o: Record<string, any> = {}) =>
    b.capsule(a, c, r, color, { bone: body, ...o });

  // ------------------------------------------------------------ fuselage
  const fuselage = b.loft(
    [
      { at: [0, 1.5, 2.3], w: 0.8, h: 0.9 },
      { at: [0, 1.5, 1.3], w: 0.86, h: 0.96 },
      { at: [0, 1.5, 0.3], w: 0.84, h: 1.0 },
      { at: [0, 1.5, -0.8], w: 0.64, h: 0.95 },
      { at: [0, 1.52, -2.0], w: 0.44, h: 0.7 },
      { at: [0, 1.6, -3.2], w: 0.22, h: 0.42 },
      { at: [0, 1.66, -3.9], w: 0.12, h: 0.26 },
    ],
    { bone: body, color: BODY, section: "box", caps: "flat", name: "fuselage" },
  );

  // turtledeck + head rest
  ell([0, 2.0, -1.05], [0.3, 0.2, 0.75], RED, { name: "headRest" });
  ell([0, 1.96, -1.9], [0.2, 0.1, 0.7], RED, { name: "turtledeck" });

  // ------------------------------------------------------------ engine cowl with a grin
  const cowl = b.lathe(
    [
      [0, 0, "sharp"],
      [0.6, 0, "sharp"],
      [0.6, 0.55],
      [0.57, 0.75],
      [0.45, 0.9],
      [0.3, 0.96],
      [0, 0.96, "sharp"],
    ],
    { at: [0, 1.5, 2.1], axis: [0, 0, 1], segments: 16, smoothing: 1, color: COWL, bone: body, name: "cowl" },
  );
  const cowlSkin = b.surface(cowl);
  const cc: V = [0, 1.5, 2.0];
  for (const s of [1, -1]) {
    const hit = cowlSkin.around(cc).at(s * 28, 16);
    if (hit) b.decal(cowlSkin, COWL_EYE, { at: hit, size: [0.22, 0.28], mirror: s > 0 });
  }
  const mouth = cowlSkin.around(cc).at(0, -26);
  if (mouth) b.decal(cowlSkin, SMILE, { at: mouth, size: [0.56, 0.24] });

  for (const along of [0.3, 0.53]) {
    b.ring(frame([0, 1.5, 2.1 + along], [0, 0, 1]), { count: 18, radius: along > 0.5 ? 0.597 : 0.6 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.022, 5, 4), BRASS, it, { embed: 0.4, bone: body }),
    );
  }
  // oil cap on top
  part(new THREE.CylinderGeometry(0.06, 0.07, 0.06, 8), BRASS, [0, 2.12, 2.45], { name: "oilCap" });

  // exhaust pipes
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.52, 1.35, 2.5],
        [s * 0.68, 1.2, 2.2],
        [s * 0.72, 1.15, 1.6],
        [s * 0.72, 1.2, 1.0],
      ]),
      [0.055, 0.04],
      { color: BRASS, bone: body, name: "exhaust" },
    );
    part(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 8), "#3a2a2a", [s * 0.72, 1.2, 0.98], { dir: [0, 0, 1], name: "exhaustTip" });
  }

  // ------------------------------------------------------------ propeller
  b.lathe(
    [
      [0, 0, "sharp"],
      [0.2, 0, "sharp"],
      [0.2, 0.05],
      [0.14, 0.2],
      [0.05, 0.3],
      [0, 0.33, "sharp"],
    ],
    { at: [0, 1.5, 3.06], axis: [0, 0, 1], segments: 12, smoothing: 1, color: BRASS, bone: propeller, name: "spinner" },
  );
  const pa = (28 * Math.PI) / 180;
  b.extrude(
    [
      [0, -1.4],
      [0.14, -1.25],
      [0.1, -0.9],
      [0.06, -0.3],
      [0.06, 0.3],
      [0.1, 0.9],
      [0.14, 1.25],
      [0, 1.4],
      [-0.14, 1.25],
      [-0.1, 0.9],
      [-0.06, 0.3],
      [-0.06, -0.3],
      [-0.1, -0.9],
      [-0.14, -1.25],
    ],
    {
      at: [0, 1.5, 3.12],
      x: [Math.cos(pa), Math.sin(pa), 0],
      y: [-Math.sin(pa), Math.cos(pa), 0],
      thickness: 0.05,
      bevel: 0.012,
      smoothing: 1,
      color: PROP,
      bone: propeller,
      name: "propBlades",
    },
  );
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), BRASS, { bone: propeller, at: [0, 1.5, 3.1], dir: [0, 0, 1], name: "propHub" });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.025, 5, 4), "#fff1cf", {
      bone: propeller,
      at: [Math.cos(a) * 0.16, 1.5 + Math.sin(a) * 0.16, 3.14],
      name: "propBolt",
    });
  }

  // ------------------------------------------------------------ wings
  const zU = 0.5,
    yU = 3.1,
    zL = 0.2,
    yL = 1.1;
  const wingU = b.extrude(airfoil(1.7, 1.3), {
    at: [0, yU, zU],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 9.2,
    bevel: 0.02,
    smoothing: 1,
    color: wingPaint(zU, 4.0, 0.62),
    bone: body,
    name: "wingUpper",
  });
  const wingL = b.extrude(airfoil(1.5, 1.3), {
    at: [0, yL, zL],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 8.6,
    bevel: 0.02,
    smoothing: 1,
    color: wingPaint(zL, 3.7, 0.55),
    bone: body,
    name: "wingLower",
  });
  // rounded wingtip bows
  for (const s of [1, -1]) {
    ell([s * 4.6, yU + 0.07, zU], [0.14, 0.11, 0.78], RED, { name: "tipUpper" });
    ell([s * 4.3, yL + 0.06, zL], [0.14, 0.1, 0.68], RED, { name: "tipLower" });
  }
  // nav lights
  glow(part(new THREE.SphereGeometry(0.07, 6, 5), "#ff4a4a", [4.72, yU + 0.07, zU], { name: "navLightL" }), 1.6);
  glow(part(new THREE.SphereGeometry(0.07, 6, 5), "#4aff7a", [-4.72, yU + 0.07, zU], { name: "navLightR" }), 1.6);

  // sunburst roundels
  const upperSkin = b.surface(wingU);
  const lowerSkin = b.surface(wingL);
  for (const s of [1, -1]) {
    const top = upperSkin.ray([s * 2.9, 9, zU], [0, -1, 0]);
    if (top) b.decal(upperSkin, ROUNDEL, { at: top, dir: [0, 1, 0], up: [0, 0, 1], size: [1.05, 1.05], segments: 12 });
    const under = lowerSkin.ray([s * 2.9, -3, zL], [0, 1, 0]);
    if (under) b.decal(lowerSkin, ROUNDEL, { at: under, dir: [0, -1, 0], up: [0, 0, 1], size: [1.0, 1.0], segments: 12 });
  }

  // ailerons
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ail = b.joint(`aileron${side}`, { parent: body, at: [s * 2.3, yU, zU - 0.83], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [
        [0, 0, "sharp"],
        [2.15, 0, "sharp"],
        [2.2, -0.3],
        [2.05, -0.45],
        [0.1, -0.46],
        [0, -0.4, "sharp"],
      ],
      {
        at: [s * 2.3, yU, zU - 0.83],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.06,
        bevel: 0.015,
        smoothing: 1,
        color: RED,
        bone: ail,
        name: `aileron${side}`,
      },
    );
  }

  // ------------------------------------------------------------ cabane, struts, wires, bunting
  for (const s of [1, -1]) {
    rod([s * 0.3, 1.95, 1.85], [s * 0.45, 3.12, 1.25], 0.035, STEEL, { name: "cabaneFront" });
    rod([s * 0.3, 1.95, -0.95], [s * 0.45, 3.12, -0.2], 0.035, STEEL, { name: "cabaneRear" });
    for (const xi of [2.1, 3.8]) {
      for (const dz of [0.45, -0.3]) {
        const lo: V = [s * xi, 1.2, zL + dz];
        const hi: V = [s * xi, 3.12, zU + dz];
        rod(lo, hi, 0.05, STRUT, { name: "strut" });
        part(new THREE.SphereGeometry(0.07, 6, 5), BRASS, [lo[0], lo[1] + 0.12, lo[2]], { name: "strutFitting" });
        part(new THREE.SphereGeometry(0.07, 6, 5), BRASS, [hi[0], hi[1] - 0.14, hi[2]], { name: "strutFitting" });
      }
    }
    // rigging wires
    rod([s * 2.1, 1.2, zL + 0.45], [s * 3.8, 3.12, zU + 0.45], 0.012, INK, { name: "wire" });
    rod([s * 3.8, 1.2, zL + 0.45], [s * 2.1, 3.12, zU + 0.45], 0.012, INK, { name: "wire" });
    rod([s * 0.35, 1.1, 0.5], [s * 2.1, 3.0, zU + 0.45], 0.012, INK, { name: "flyingWire" });
    rod([s * 0.35, 1.9, 0.8], [s * 2.1, 1.25, zL + 0.45], 0.012, INK, { name: "landingWire" });
  }

  const bunting = (a: V, c: V, sag: number, count: number) => {
    const path = catmull([a, [(a[0] + c[0]) / 2, a[1] - sag, (a[2] + c[2]) / 2], c]);
    b.sweep(path, 0.008, { color: INK, bone: body, name: "buntingRope" });
    const frames = [];
    for (let i = 0; i < count; i++) frames.push(frame(path.at((i + 0.5) / count), [0, 1, 0]));
    b.cards(frames, FLAGS, { size: [0.17, 0.23], lean: 180, flow: [0, 0, 1], rng: R, bone: body, vary: 0.1 });
  };
  for (const s of [1, -1]) {
    bunting([s * 2.1, 3.0, zU + 0.45], [s * 3.8, 3.0, zU + 0.45], 0.32, 6);
    bunting([s * 0.45, 3.0, zU + 0.45], [s * 2.1, 3.0, zU + 0.45], 0.28, 5);
  }

  // ------------------------------------------------------------ landing gear
  rod([-1.2, 0.45, 1.0], [1.2, 0.45, 1.0], 0.04, STEEL, { name: "axle" });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    rod([s * 0.42, 1.1, 1.2], [s * 1.2, 0.5, 1.0], 0.055, TEAL, { name: "gearLegFront" });
    rod([s * 0.3, 1.1, 0.55], [s * 1.2, 0.5, 1.0], 0.04, TEAL, { name: "gearLegRear" });
    part(new THREE.SphereGeometry(0.075, 6, 5), BRASS, [s * 0.5, 1.02, 1.15], { name: "gearFitting" });
    // bungee wraps
    for (let i = 0; i < 4; i++) {
      const t = 0.3 + i * 0.1;
      part(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 8), INK, [s * (0.42 + 0.78 * t), 1.1 - 0.6 * t, 1.2 - 0.2 * t], {
        dir: [s * 0.78, -0.6, -0.2],
        name: "bungee",
      });
    }
    const axle: V = [s * 1.2, 0.45, 1.0];
    const wheel = b.joint(`wheel${side}`, { parent: body, at: axle, dir: [s, 0, 0] });
    b.part(new THREE.TorusGeometry(0.32, 0.13, 8, 18), TIRE, { bone: wheel, at: axle, dir: [s, 0, 0], axis: "z", name: `tire${side}` });
    b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12), CREAM, { bone: wheel, at: axle, dir: [s, 0, 0], name: `hub${side}` });
    b.part(new THREE.CircleGeometry(0.22, 16), "#ffffff", {
      bone: wheel,
      at: [axle[0] + s * 0.095, axle[1], axle[2]],
      dir: [s, 0, 0],
      axis: "z",
      texture: HUB,
      name: `hubFace${side}`,
    });
  }

  // tail wheel with a spring
  rod([0, 1.45, -3.3], [0, 0.18, -3.5], 0.035, STEEL, { name: "tailStrut" });
  b.sweep(coil([0, 1.4, -3.31], [0, 0.75, -3.4], 0.06, 7), 0.011, { color: BRASS, bone: body, name: "tailSpring" });
  b.part(new THREE.TorusGeometry(0.1, 0.05, 6, 12), TIRE, { bone: tailWheel, at: [0, 0.15, -3.5], dir: [1, 0, 0], axis: "z", name: "tailTire" });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), CREAM, { bone: tailWheel, at: [0, 0.15, -3.5], dir: [1, 0, 0], name: "tailHub" });

  // ------------------------------------------------------------ tail group
  b.extrude(
    [
      [0.55, 0, "sharp"],
      [0.4, 0.55],
      [0.2, 0.95],
      [-0.1, 1.05, "sharp"],
      [-0.1, 0, "sharp"],
    ],
    { at: [0, 1.78, -2.95], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.09, bevel: 0.02, smoothing: 1, color: TEAL, bone: body, name: "fin" },
  );
  b.extrude(
    [
      [0, 0, "sharp"],
      [0, 1.05, "sharp"],
      [-0.3, 1.12],
      [-0.55, 0.85],
      [-0.62, 0.3],
      [-0.5, -0.05],
    ],
    { at: [0, 1.78, -3.05], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, bevel: 0.015, smoothing: 1, color: RUDDER, bone: rudder, name: "rudder" },
  );
  glow(part(new THREE.SphereGeometry(0.055, 6, 5), "#ff6a4a", [0, 2.9, -3.45], { name: "tailLight" }), 1.6);
  b.part(new THREE.SphereGeometry(0.055, 6, 5), "#ff6a4a", { bone: rudder, at: [0, 2.9, -3.45], name: "tailLightMount" });

  b.extrude(
    [
      [-1.4, -0.25, "sharp"],
      [-1.3, 0.05],
      [-0.4, 0.5],
      [0.4, 0.5],
      [1.3, 0.05],
      [1.4, -0.25, "sharp"],
    ],
    { at: [0, 1.62, -2.9], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.02, smoothing: 1, color: TEAL, bone: body, name: "stabilizer" },
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const el = b.joint(`elevator${side}`, { parent: body, at: [s * 0.05, 1.62, -3.15], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [
        [0, 0, "sharp"],
        [1.4, 0, "sharp"],
        [1.5, -0.28],
        [1.25, -0.46],
        [0.5, -0.5],
        [0, -0.48, "sharp"],
      ],
      {
        at: [s * 0.05, 1.62, -3.15],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.06,
        bevel: 0.015,
        smoothing: 1,
        color: RED,
        bone: el,
        name: `elevator${side}`,
      },
    );
    // tail bracing wires
    rod([s * 1.2, 1.64, -2.95], [0, 2.7, -3.0], 0.01, INK, { name: "tailWire" });
    rod([s * 1.2, 1.6, -3.0], [0, 1.7, -2.4], 0.01, INK, { name: "tailWire" });
  }

  // ------------------------------------------------------------ name on the flanks
  const fusSkin = b.surface(fuselage);
  for (const s of [1, -1]) {
    const hit = fusSkin.ray([s * 3, 1.53, -1.5], [-s, 0, 0]);
    if (hit) b.decal(fusSkin, NAME, { at: hit, dir: [s, 0, 0], up: [0, 1, 0], size: [1.1, 0.2], segments: 12 });
  }

  // ------------------------------------------------------------ cockpits and windscreens
  const cockpit = (z: number, rx: number, rz: number) => {
    part(new THREE.CircleGeometry(1, 14), "#2a1a20", [0, 2.003, z], { rotation: [-90, 0, 0], scale: [rx, rz, 1], name: "cockpitHole" });
    b.sweep(catmull(ellipsePts(0, 2.0, z, rx, rz), { closed: true }), 0.05, { color: LEATHER, bone: body, name: "coaming" });
  };
  cockpit(0.97, 0.3, 0.4);
  cockpit(-0.3, 0.3, 0.42);

  const screen = (z: number, w: number) => {
    const g = new THREE.PlaneGeometry(w, w * 0.45);
    part(g, "#ffffff", [0, 2.14, z], { dir: [0, 0.45, 1], axis: "z", texture: WINDSCREEN, name: "windscreen" });
    part(g, "#ffffff", [0, 2.14, z], { dir: [0, -0.45, -1], axis: "z", texture: WINDSCREEN, name: "windscreenBack" });
  };
  screen(1.55, 0.62);
  screen(0.35, 0.58);

  // ------------------------------------------------------------ goggles + helmet helpers
  const goggles = (c: V, r: number, dy: number, spread: number) => {
    const lens = r * 0.4;
    for (const s of [1, -1]) {
      const x = s * spread;
      const y = c[1] + dy;
      const zf = faceZ(c, r, x, dy);
      const d: V = [s * 0.15, 0, 1];
      b.part(new THREE.CylinderGeometry(lens * 1.14, lens * 1.14, 0.07, 10), BRASS, { bone: body, at: [x, y, zf - 0.005], dir: d, name: "gogglesRim" });
      b.part(new THREE.CircleGeometry(lens, 14), "#ffffff", {
        bone: body,
        at: [x, y, zf + 0.032],
        dir: d,
        axis: "z",
        texture: GOGGLE_EYE,
        name: "gogglesEye",
      });
    }
    part(new THREE.TorusGeometry(r * 1.01, 0.02, 5, 14), LEATHER_D, [c[0], c[1] + dy, c[2]], { rotation: [90, 0, 0], name: "gogglesStrap" });
    part(new THREE.BoxGeometry(spread * 0.9, 0.04, 0.05), BRASS, [0, c[1] + dy, faceZ(c, r, 0, dy) + 0.02], { name: "gogglesBridge" });
  };

  // ------------------------------------------------------------ the pilot
  const pc: V = [0, 2.6, -0.3];
  const pr = 0.21;
  ell([0, 2.2, -0.3], [0.27, 0.3, 0.22], LEATHER, { name: "pilotTorso" });
  ell(pc, [pr, pr * 1.05, pr], SKIN, { name: "pilotHead" });
  part(new THREE.SphereGeometry(pr * 1.07, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), LEATHER_D, [pc[0], pc[1] + 0.01, pc[2] - 0.01], { name: "pilotCap" });
  for (const s of [1, -1]) {
    ell([s * pr * 1.0, pc[1] - 0.03, pc[2] - 0.02], [0.04, 0.08, 0.07], LEATHER_D, { name: "earFlap" });
    ell([s * 0.12, pc[1] - 0.07, faceZ(pc, pr, s * 0.12, -0.07) - 0.01], [0.05, 0.035, 0.03], PINK, { name: "cheek" });
  }
  ell([0, pc[1] + pr * 1.07 + 0.02, pc[2] - 0.03], [0.05, 0.05, 0.05], RED, { name: "pompom" });
  goggles(pc, pr, 0.03, 0.105);
  ell([0, pc[1] - 0.04, faceZ(pc, pr, 0, -0.04) + 0.015], [0.045, 0.04, 0.045], "#e89a7a", { name: "pilotNose" });
  {
    const xs = [-0.18, -0.12, -0.06, 0, 0.06, 0.12, 0.18];
    const dys = [-0.05, -0.09, -0.095, -0.085, -0.095, -0.09, -0.05];
    const pts = xs.map((x, i) => [x, pc[1] + dys[i], faceZ(pc, pr, x, dys[i]) + 0.02] as V);
    b.sweep(catmull(pts), (t: number) => 0.012 + 0.02 * (1 - Math.abs(2 * t - 1)), { color: "#5a3420", bone: body, name: "mustache" });
  }
  // scarf: collar loop plus streaming tail
  part(new THREE.TorusGeometry(0.17, 0.06, 6, 12), CREAM, [0, 2.4, -0.3], { rotation: [90, 0, 0], name: "scarfCollar" });
  b.sweep(
    catmull([
      [0, 2.4, -0.45],
      [0.06, 2.47, -0.75],
      [-0.09, 2.5, -1.15],
      [0.1, 2.44, -1.55],
      [-0.1, 2.52, -1.95],
      [0.07, 2.46, -2.3],
    ]),
    (t: number) => [0.016, 0.1 * (1 - 0.4 * t)],
    { color: SCARF, bone: body, name: "scarfTail" },
  );
  // arms: one waving at the crowd, one on the coaming
  cap([-0.22, 2.3, -0.3], [-0.5, 2.38, -0.3], 0.07, LEATHER, { name: "pilotArmR" });
  cap([-0.5, 2.38, -0.3], [-0.7, 2.7, -0.3], 0.06, LEATHER, { name: "pilotForearmR" });
  ell([-0.73, 2.78, -0.3], [0.08, 0.09, 0.07], CREAM, { name: "waveGlove" });
  ell([-0.8, 2.74, -0.24], [0.035, 0.05, 0.035], CREAM, { name: "waveThumb" });
  cap([0.22, 2.28, -0.3], [0.32, 2.1, -0.05], 0.065, LEATHER, { name: "pilotArmL" });
  ell([0.32, 2.06, -0.0], [0.075, 0.06, 0.08], CREAM, { name: "gripGlove" });

  // ------------------------------------------------------------ the dog up front
  const dc: V = [0, 2.33, 0.97];
  const dr = 0.23;
  ell([0, 2.1, 0.93], [0.24, 0.25, 0.25], TAN, { name: "dogChest" });
  ell(dc, [dr, dr, dr], TAN, { name: "dogHead" });
  ell([0, dc[1] - 0.07, dc[2] + 0.2], [0.1, 0.08, 0.12], MUZZLE, { name: "dogSnout" });
  ell([0, dc[1] - 0.04, dc[2] + 0.33], [0.05, 0.04, 0.04], INK, { name: "dogNose" });
  ell([0, dc[1] - 0.15, dc[2] + 0.29], [0.04, 0.015, 0.07], PINK, { name: "dogTongue" });
  goggles(dc, dr, 0.06, 0.11);
  for (const s of [1, -1]) {
    cap([s * 0.17, dc[1] + 0.12, dc[2] - 0.04], [s * 0.36, dc[1] + 0.1, dc[2] - 0.45], [0.075, 0.035], EARS, { name: "dogEar" });
    cap([s * 0.14, 2.17, dc[2] + 0.02], [s * 0.15, 2.04, dc[2] + 0.33], 0.05, TAN, { name: "dogArm" });
    ell([s * 0.15, 2.04, dc[2] + 0.36], [0.065, 0.045, 0.07], MUZZLE, { name: "dogPaw" });
  }
  part(new THREE.TorusGeometry(0.17, 0.03, 6, 12), RED, [0, dc[1] - 0.2, dc[2] - 0.0], { rotation: [90, 0, 0], name: "dogCollar" });
  part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), BRASS, [0, dc[1] - 0.24, dc[2] + 0.17], { rotation: [90, 0, 0], name: "dogTag" });
  ell([0.02, dc[1] + dr + 0.0, dc[2] - 0.03], [0.04, 0.05, 0.04], EARS, { name: "dogTuft" });

  return b.root;
}
