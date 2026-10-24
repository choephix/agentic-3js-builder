```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, spiral, grain, countershade, svg } from "agentic-3js-builder";

export const meta = {
  name: "Celtic Lever Harp",
  description:
    "A walnut lever harp with a curved forepillar and a scroll-tipped neck. Interlaced Celtic knotwork (plait, trefoil, torus-knot and triskele) is inlaid in green, gold and red. It has gold bosses, brass pins and levers, and red and black C and F strings.",
};

// ---------------------------------------------------------------------------------------------------------------
// Knotwork SVG generator: any single closed curve becomes an over/under interlace.

type Pt = [number, number];
const INKC = "#0b1a12";
const GOLD = "#e0b040";
const BRASS = "#c99a3e";

const polyD = (pts: Pt[], closed: boolean) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + (closed ? "Z" : "");

function knot(curve: Pt[], w: number, o: number, fill: string, hi: string, hl: number): string {
  const n = curve.length;
  const cum: number[] = [0];
  for (let i = 0; i < n; i++) {
    const a = curve[i];
    const c = curve[(i + 1) % n];
    cum.push(cum[i] + Math.hypot(c[0] - a[0], c[1] - a[1]));
  }
  const total = cum[n];
  const at = (s0: number): Pt => {
    const s = ((s0 % total) + total) % total;
    let lo = 0;
    let up = n;
    while (up - lo > 1) {
      const m = (lo + up) >> 1;
      if (cum[m] <= s) lo = m;
      else up = m;
    }
    const a = curve[lo];
    const c = curve[(lo + 1) % n];
    const t = (s - cum[lo]) / (cum[lo + 1] - cum[lo] || 1);
    return [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t];
  };
  // every crossing visit along the curve, sorted; even visits go over
  const visits: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = curve[i];
    const a2 = curve[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const c = curve[j];
      const c2 = curve[(j + 1) % n];
      const rx = a2[0] - a[0];
      const ry = a2[1] - a[1];
      const sx = c2[0] - c[0];
      const sy = c2[1] - c[1];
      const den = rx * sy - ry * sx;
      if (Math.abs(den) < 1e-9) continue;
      const qx = c[0] - a[0];
      const qy = c[1] - a[1];
      const t = (qx * sy - qy * sx) / den;
      const u = (qx * ry - qy * rx) / den;
      if (t >= 0 && t < 1 && u >= 0 && u < 1)
        visits.push(cum[i] + t * (cum[i + 1] - cum[i]), cum[j] + u * (cum[j + 1] - cum[j]));
    }
  }
  visits.sort((p, q) => p - q);
  const layers = (d: string, cap: string) =>
    `<path d="${d}" fill="none" stroke="${INKC}" stroke-width="${w + 2 * o}" stroke-linejoin="round" stroke-linecap="${cap}"/>` +
    `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="${cap}"/>` +
    `<path d="${d}" fill="none" stroke="${hi}" stroke-opacity="0.55" stroke-width="${(w * 0.22).toFixed(1)}" stroke-linejoin="round" stroke-linecap="${cap}"/>`;
  let out = layers(polyD(curve, true), "butt");
  visits.forEach((s, k) => {
    if (k % 2) return;
    const pts: Pt[] = [];
    for (let m = -6; m <= 6; m++) pts.push(at(s + (m * hl) / 6));
    out += layers(polyD(pts, false), "butt");
  });
  return out;
}

const trefoil = (cx: number, cy: number, sc: number, n = 360): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = Math.sin(t) + 2 * Math.sin(2 * t);
    const y = Math.cos(t) - 2 * Math.cos(2 * t) + 0.47;
    out.push([cx + x * sc, cy - y * sc]);
  }
  return out;
};
const torus = (cx: number, cy: number, sc: number, p: number, q: number, R: number, r: number, n = 520): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const rad = R + r * Math.cos(q * t);
    out.push([cx + sc * rad * Math.cos(p * t), cy + sc * rad * Math.sin(p * t)]);
  }
  return out;
};
const plait = (cx: number, cy: number, X: number, Y: number, k: number): Pt[] => {
  const n = k * 70;
  const out: Pt[] = [];
  const den = Math.asin(0.98);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    out.push([cx + (X * Math.asin(0.98 * Math.sin(t))) / den, cy + Y * Math.sin(k * t)]);
  }
  return out;
};

const defs = (H: number) => {
  const g = (id: string, a: string, b2: string) =>
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b2}"/></linearGradient>`;
  return `<defs>${g("g", "#5cc66c", "#1c6c3c")}${g("y", "#f6d56e", "#b3801f")}${g("r", "#e65e4e", "#8a2220")}</defs>`;
};
const HI_G = "#d6ffd0";
const HI_Y = "#fff3c4";
const HI_R = "#ffd6cf";
const INLAY = "#16261b";

const PANEL = svg(
  `<svg viewBox="0 0 1100 200" xmlns="http://www.w3.org/2000/svg">${defs(200)}
  <rect x="4" y="4" width="1092" height="192" rx="24" fill="${INLAY}" stroke="${GOLD}" stroke-width="6"/>
  <rect x="16" y="16" width="1068" height="168" rx="14" fill="none" stroke="#8f6a22" stroke-width="3"/>
  <path d="M236 30 V170 M864 30 V170" stroke="${GOLD}" stroke-width="4"/>
  ${knot(trefoil(125, 100, 24), 15, 3, "url(#y)", HI_Y, 12)}
  ${knot(plait(550, 100, 280, 28, 10), 24, 3, "url(#g)", HI_G, 19)}
  ${knot(torus(975, 100, 48, 3, 4, 1, 0.42), 13, 2.5, "url(#r)", HI_R, 11)}
  </svg>`,
  { size: 1400 },
);

const roundel = (inner: string) =>
  svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${defs(200)}
  <circle cx="100" cy="100" r="97" fill="${INLAY}" stroke="${GOLD}" stroke-width="6"/>
  <circle cx="100" cy="100" r="87" fill="none" stroke="#8f6a22" stroke-width="3"/>${inner}</svg>`,
    { size: 400 },
  );
const ROUND_A = roundel(knot(trefoil(100, 100, 27), 17, 3.5, "url(#y)", HI_Y, 15));
const ROUND_B = roundel(knot(torus(100, 100, 48, 3, 4, 1, 0.42), 15, 3, "url(#r)", HI_R, 13));

const strip = (fillId: string, hi: string, k: number, X: number, W: number, H: number, w: number, hl: number) =>
  svg(
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${defs(H)}
  <rect x="3" y="${H * 0.08}" width="${W - 6}" height="${H * 0.84}" rx="${H * 0.14}" fill="${INLAY}" stroke="${GOLD}" stroke-width="4"/>
  ${knot(plait(W / 2, H / 2, X, H * 0.22, k), w, 3.5, `url(#${fillId})`, hi, hl)}
  </svg>`,
    { size: W > 600 ? 1000 : 640 },
  );
const PLAIT_G = strip("g", HI_G, 6, 190, 500, 100, 22, 18);
const PLAIT_R = strip("r", HI_R, 6, 190, 500, 100, 22, 18);
const PLINTH = strip("y", HI_Y, 16, 450, 1000, 100, 20, 16);

const TRISKELE = (() => {
  let arms = "";
  for (let k = 0; k < 3; k++) {
    const pts: Pt[] = [];
    for (let i = 0; i <= 40; i++) {
      const ph = (i / 40) * 4.2;
      const rr = 6 + 15 * ph;
      const a = ph + (k * 2 * Math.PI) / 3;
      pts.push([100 + rr * Math.cos(a), 100 + rr * Math.sin(a)]);
    }
    const d = polyD(pts, false);
    const e = pts[pts.length - 1];
    arms +=
      `<path d="${d}" fill="none" stroke="${INKC}" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="url(#y)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="${HI_Y}" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="10" fill="url(#y)" stroke="${INKC}" stroke-width="3.5"/>`;
  }
  return roundel(arms + `<circle cx="100" cy="100" r="8" fill="url(#r)" stroke="${INKC}" stroke-width="3.5"/>`);
})();

// ---------------------------------------------------------------------------------------------------------------
// Harp geometry constants (meters, strings plane = XY, harp faces +Z)

const neckY = (x: number) => {
  const u = (x + 0.42) / 0.7;
  return 0.96 + 0.205 * (0.5 * u + 0.5 * u * u);
};
const neckSlope = (x: number) => (0.205 * (0.5 + (x + 0.42) / 0.7)) / 0.7;
const neckRy = (x: number) => 0.05 - (0.01 * (x + 0.42)) / 0.7;
const soundY = (x: number) => (0.2912 - x) / 0.606; // string edge of the soundbox rail
const halfT = (y: number) => (0.2 - 0.09 * (y / 0.95)) / 2; // soundbox half thickness at height y
const BAR_N: [number, number, number] = [0.88, 0.4752, 0];
const barPoint = (s: number): [number, number] => [0.143 - 0.4752 * s, 0.88 * s];

export default function build() {
  const b = createBuilder({ name: "celtic-harp" });

  const AX = [-0.475, 0.88, 0] as [number, number, number];
  const WOOD = countershade(
    grain("#7a4526", "#a06838", { size: 0.014, axis: AX }),
    grain("#4e2a16", "#6e3d21", { size: 0.014, axis: AX, seed: 3 }),
    { level: -0.1 },
  );
  const WOOD_NECK = countershade(
    grain("#744123", "#9a6236", { size: 0.013, axis: [1, 0.3, 0], seed: 5 }),
    grain("#4a2814", "#6a3a1f", { size: 0.013, axis: [1, 0.3, 0], seed: 6 }),
    { level: -0.1 },
  );
  const WOOD_PILLAR = countershade(
    grain("#744123", "#9a6236", { size: 0.013, axis: [0, 1, 0], seed: 8 }),
    grain("#4a2814", "#6a3a1f", { size: 0.013, axis: [0, 1, 0], seed: 9 }),
    { level: -0.1 },
  );
  const WOOD_DARK = grain("#4a2814", "#6a3a1f", { size: 0.012, axis: [1, 0, 0], seed: 11 });
  const MAPLE = grain("#d9b070", "#ecce92", { size: 0.01, axis: [-0.6, 0.8, 0], seed: 13 });

  // --- main frame ------------------------------------------------------------------------------------------
  const soundbox = b.extrude(
    [
      [0.01, 0],
      [0.276, 0],
      [-0.3, 0.95],
      [-0.44, 0.95],
    ],
    {
      at: [0, 0, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.2, 0.11],
      bevel: 0.006,
      smoothing: 1,
      color: WOOD,
      name: "soundbox",
    },
  );

  b.extrude(
    [
      [-0.05, 0],
      [0.43, 0],
      [0.43, 0.03],
      [0.4, 0.055],
      [-0.02, 0.055],
      [-0.05, 0.03],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.22, bevel: 0.007, color: WOOD_DARK, name: "plinth" },
  );
  const plinth = b.extrude(
    [
      [-0.05, 0],
      [0.43, 0],
      [0.43, 0.03],
      [0.4, 0.055],
      [-0.02, 0.055],
      [-0.05, 0.03],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.221, color: WOOD_DARK, name: "plinthCore" },
  );

  const neckPath = catmull(
    Array.from({ length: 11 }, (_, i) => {
      const x = -0.42 + (0.7 * i) / 10;
      return [x, neckY(x), 0];
    }),
  );
  const neck = b.sweep(neckPath, (t) => [0.034, 0.05 - 0.01 * t], {
    section: "box",
    up: [0, 0, 1],
    caps: "flat",
    color: WOOD_NECK,
    name: "neck",
  });

  const pillarPath = catmull([
    [0.335, 0.03, 0],
    [0.352, 0.35, 0],
    [0.338, 0.75, 0],
    [0.305, 1.0, 0],
    [0.268, 1.14, 0],
  ]);
  const pillar = b.sweep(pillarPath, (t) => [0.034 - 0.006 * t, 0.04 - 0.006 * t], {
    section: "box",
    up: [0, 0, 1],
    caps: "flat",
    color: WOOD_PILLAR,
    name: "forepillar",
  });

  // soundboard rail on the string edge
  b.sweep(
    [
      [0.2625, 0.03, 0],
      [-0.2859, 0.935, 0],
    ],
    (t) => [0.009, 0.07 - 0.03 * t],
    { section: "box", up: [0, 0, 1], caps: "flat", color: MAPLE, name: "rail" },
  );

  // pillar collar and top cap
  b.part(new THREE.BoxGeometry(0.086, 0.022, 0.106), GOLD, { at: [0.338, 0.066, 0] });
  b.part(new THREE.BoxGeometry(0.17, 0.012, 0.12), GOLD, { at: [-0.375, 0.955, 0], rotation: [0, 0, 17] });

  // --- scroll finial ---------------------------------------------------------------------------------------
  {
    const sx = 0.275;
    const sy = neckY(sx) + 0.002;
    const sl = neckSlope(sx);
    const L = Math.hypot(1, sl);
    const tx = 1 / L;
    const ty = sl / L;
    const rho = 0.05;
    const center = [sx - ty * rho, sy + tx * rho, 0];
    const curl = spiral(center, [sx, sy, 0], [0, 0, 1], { turns: 1.05, r1: 0.012 });
    b.sweep(curl, [0.024, 0.011], { color: GOLD, caps: { start: "flat", end: "round" }, name: "scroll" });
    const tip = curl.at(1);
    b.part(new THREE.SphereGeometry(0.017, 8, 6), GOLD, { at: [tip.x, tip.y, 0], flat: true });
  }

  // --- decal helper ----------------------------------------------------------------------------------------
  const lay = (
    target: Parameters<typeof b.decal>[0],
    tex: Parameters<typeof b.decal>[1],
    at: number[],
    sg: number,
    up: number[],
    size: [number, number],
    segments: number,
  ) => b.decal(target, tex, { at, dir: [0, 0, sg], up, size, segments });

  // soundbox knotwork, both faces
  const soundDecals: { s: number; tex: Parameters<typeof b.decal>[1]; size: [number, number] }[] = [
    { s: 0.15, tex: ROUND_A, size: [0.17, 0.17] },
    { s: 0.58, tex: PANEL, size: [0.55, 0.1] },
    { s: 0.97, tex: ROUND_B, size: [0.09, 0.09] },
  ];
  for (const sg of [1, -1])
    for (const d of soundDecals) {
      const [x, y] = barPoint(d.s);
      lay(soundbox, d.tex, [x, y, sg * halfT(y)], sg, BAR_N, d.size, 14);
    }

  // neck plaits
  for (const x of [-0.3, -0.1, 0.1]) {
    const sl = neckSlope(x);
    const L = Math.hypot(1, sl);
    for (const sg of [1, -1])
      lay(neck, PLAIT_G, [x, neckY(x), sg * neckRy(x)], sg, [-sl / L, 1 / L, 0], [0.19, 0.038], 8);
  }

  // pillar plaits
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const p = pillarPath.at(t);
    const tg = pillarPath.tangentAt(t);
    for (const sg of [1, -1])
      lay(pillar, PLAIT_R, [p.x, p.y, sg * (0.04 - 0.006 * t)], sg, [-tg.y, tg.x, 0], [0.205, 0.04], 8);
  }

  // plinth plaits
  for (const sg of [1, -1]) lay(plinth, PLINTH, [0.19, 0.0275, sg * 0.1105], sg, [0, 1, 0], [0.4, 0.04], 10);

  // --- bosses with triskele at the neck / pillar joint -----------------------------------------------------
  for (const sg of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.014, 20), GOLD, {
      at: [0.265, 1.15, sg * 0.04],
      dir: [0, 0, sg],
    });
    b.part(new THREE.CircleGeometry(0.05, 20), "#ffffff", {
      at: [0.265, 1.15, sg * 0.0475],
      dir: [0, 0, sg],
      axis: "z",
      texture: TRISKELE,
    });
  }

  // --- strings, ferrules, pins, levers ---------------------------------------------------------------------
  const COUNT = 24;
  const ferrules: THREE.BufferGeometry[] = [];
  const pins: THREE.BufferGeometry[] = [];
  const levers: THREE.BufferGeometry[] = [];
  for (let i = 0; i < COUNT; i++) {
    const x = -0.25 + (i * 0.49) / (COUNT - 1);
    const yb = soundY(x);
    const yt = neckY(x) - 0.031;
    const note = i % 7;
    const col = note === 0 ? "#c4302b" : note === 3 ? "#1f1f22" : "#f1e8d0";
    b.rod([x, yb + 0.003, 0], [x, yt, 0], 0.002, col, { sides: 5 });
    ferrules.push(new THREE.SphereGeometry(0.0055, 6, 4).translate(x, yb, 0));
    pins.push(
      new THREE.CylinderGeometry(0.0036, 0.0036, 0.018, 6)
        .rotateX(Math.PI / 2)
        .translate(x, neckY(x) - 0.0255, neckRy(x) + 0.004),
    );
    levers.push(new THREE.BoxGeometry(0.012, 0.01, 0.018).translate(x, neckY(x) - 0.04, 0));
  }
  b.part(mergeGeometries(ferrules)!, BRASS, { at: [0, 0, 0], name: "ferrules" });
  b.part(mergeGeometries(pins)!, BRASS, { at: [0, 0, 0], name: "tuningPins" });
  b.part(mergeGeometries(levers)!, BRASS, { at: [0, 0, 0], name: "levers" });

  // --- gold studs along the soundbox margins ----------------------------------------------------------------
  const studs: THREE.BufferGeometry[] = [];
  for (const sg of [1, -1])
    for (let i = 0; i < 13; i++) {
      const y = 0.08 + i * 0.065;
      const z = sg * (halfT(y) - 0.001);
      studs.push(new THREE.SphereGeometry(0.005, 6, 4).translate(0.01 - 0.4737 * y + 0.014, y, z));
      studs.push(new THREE.SphereGeometry(0.005, 6, 4).translate(0.276 - 0.606 * y - 0.016, y, z));
    }
  b.part(mergeGeometries(studs)!, GOLD, { at: [0, 0, 0], name: "studs" });

  // plinth end studs
  const pst: THREE.BufferGeometry[] = [];
  for (const sg of [1, -1])
    for (const x of [-0.03, 0.41]) pst.push(new THREE.SphereGeometry(0.008, 6, 4).translate(x, 0.028, sg * 0.111));
  b.part(mergeGeometries(pst)!, GOLD, { at: [0, 0, 0], name: "plinthStuds" });

  return b.root;
}
```