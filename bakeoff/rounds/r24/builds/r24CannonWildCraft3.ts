// STYLE: "DELFTWARE": the whole gun is a piece of 17th-century Dutch tin-glazed pottery.
// Every surface is glossy white crackle glaze painted in hand-brushed cobalt blue, with a few touches of ochre.
// The carriage is painted tile-border framing with diaper dots, the barrel carries seigaiha waves, lattice and
// bead bands, and the wheels are rosettes. The medallions are a galleon, a tulip, a fleur, an anchor-in-laurel,
// a VOC monogram and a dated banner. The rope is blue-and-white, and a dolphin handle is scaled in cobalt.

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { catmull, cells, createBuilder, mix, noise, paint, rgb, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Delft Naval Gun",
  description:
    "A naval cannon on a stepped carriage, styled as Delftware pottery: crackle-glazed white with cobalt-blue painted borders, galleon and tulip medallions, seigaiha waves, a VOC monogram and a dolphin handle.",
};

type C3 = readonly [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const COB = "#1f419f";
const DEEP = "#132a74";
const WASH = "#7fa1e0";
const PALE = "#c3d5f3";
const OCHRE = "#dfae3e";
const IRON = "#1a3585";
const INKBORE = "#0b1747";
const CREAM = "#f8fafd";

const G_SHADE = rgb("#c3d1e8");
const G_LIGHT = rgb("#fcfdff");
const G_CRACK = rgb("#a9b9d6");
const OCHRE_RGB = rgb(OCHRE);
const COB_RGB = rgb(COB);
const WHITE_RGB = rgb(CREAM);

// ---------------------------------------------------------------------------------------------------------------
// Paint helpers
const band = (x: number, a: number, b: number, soft = 0.003) =>
  Math.max(0, smoothstep(a - soft, a, x) - smoothstep(b, b + soft, x));
const over = (c: C3, ink: C3, a: number): C3 => (a <= 0.001 ? c : mix(c, ink, Math.min(a, 1)));
const cobAt = (p: THREE.Vector3): C3 => mix(COB, DEEP, 0.15 + 0.7 * noise(p, 0.045, 4));
const washAt = (p: THREE.Vector3): C3 => mix(WASH, PALE, noise(p, 0.05, 8));

/** Crackled tin glaze: pale, cool in the shade, with hairline craquelure. */
function glaze(p: THREE.Vector3, n: THREE.Vector3): C3 {
  let c = mix(G_SHADE, G_LIGHT, smoothstep(-0.7, 0.7, n.y));
  c = mix(c, "#e6edf8", 0.5 * noise(p, 0.12, 21));
  const k = cells(p, 0.08, 3);
  return over(c, G_CRACK, 0.3 * (1 - smoothstep(0.02, 0.07, k.d2 - k.d1)));
}

/** Seigaiha (wave scallops): line intensity 0..1 at plane point (u, v) with cell width c. */
function seigaiha(u: number, v: number, c: number): number {
  const R = c * 0.52;
  const rowH = c * 0.25;
  const j0 = Math.floor(v / rowH);
  let best = -1e9;
  let bd = 0;
  for (let j = j0 - 3; j <= j0 + 3; j++) {
    const cy = j * rowH;
    if (Math.abs(cy - v) > R) continue;
    const off = j & 1 ? c / 2 : 0;
    const i = Math.round((u - off) / c);
    for (let di = -1; di <= 1; di++) {
      const cx = (i + di) * c + off;
      const d = Math.hypot(u - cx, v - cy);
      if (d < R && cy > best) {
        best = cy;
        bd = d / R;
      }
    }
  }
  if (best < -1e8) return 0;
  const ln = (k: number, ctr: number) => 1 - smoothstep(0.03, 0.075, Math.abs(k - ctr));
  return Math.max(ln(bd, 0.3), ln(bd, 0.6), ln(bd, 0.93));
}

// Carriage cheek outline in (z, y)
const CHEEK: [number, number][] = [
  [-0.8, 0.17],
  [0.72, 0.27],
  [0.72, 0.92],
  [-0.02, 0.92],
  [-0.02, 0.74],
  [-0.42, 0.74],
  [-0.42, 0.52],
  [-0.8, 0.52],
];

function distOutline(z: number, y: number): number {
  let best = 1e9;
  const m = CHEEK.length;
  for (let i = 0; i < m; i++) {
    const [z0, y0] = CHEEK[i];
    const [z1, y1] = CHEEK[(i + 1) % m];
    const dz = z1 - z0;
    const dy = y1 - y0;
    const t = Math.min(Math.max(((z - z0) * dz + (y - y0) * dy) / (dz * dz + dy * dy), 0), 1);
    best = Math.min(best, Math.hypot(z - (z0 + dz * t), y - (y0 + dy * t)));
  }
  return best;
}

const cheekPaint = paint((p, n) => {
  if (Math.abs(n.x) < 0.5) return cobAt(p);
  const d = distOutline(p.z, p.y);
  let c = glaze(p, n);
  const fx = (((p.z / 0.05) % 1) + 1) % 1 - 0.5;
  const fy = (((p.y / 0.05) % 1) + 1) % 1 - 0.5;
  const dot = d > 0.075 && Math.hypot(fx, fy) * 0.05 < 0.0075 ? 0.8 : 0;
  c = over(c, washAt(p), dot);
  c = over(c, washAt(p), band(d, 0.06, 0.068, 0.002));
  return over(c, cobAt(p), band(d, 0.044, 0.053, 0.002));
});

const AXY = 0.82;
const BZ0 = -0.55;
const INK_BANDS: [number, number][] = [
  [0.005, 0.03],
  [0.055, 0.08],
  [0.1, 0.14],
  [0.16, 0.2],
  [0.23, 0.238],
  [0.662, 0.67],
  [0.715, 0.78],
  [0.795, 0.802],
  [1.36, 1.368],
  [1.395, 1.455],
  [1.47, 1.478],
  [1.865, 1.89],
  [1.97, 2.01],
];
const GOLD_BANDS: [number, number][] = [
  [0.145, 0.155],
  [0.205, 0.218],
  [0.678, 0.7],
  [1.4825, 1.495],
];

const barrelPaint = paint((p, n) => {
  const h = p.z - BZ0;
  const dy = p.y - AXY;
  const r = Math.hypot(p.x, dy);
  if (h > 1.78 && r < 0.085) return INKBORE;
  if (h < -0.005) return over(cobAt(p), washAt(p), band(h, -0.115, -0.1, 0.004));
  if (n.z > 0.8 && h > 1.95) return cobAt(p);
  const arc = Math.atan2(p.x, dy) * 0.15;
  let ink = 0;
  let wash = 0;
  let gold = 0;
  for (const [a, c] of INK_BANDS) ink = Math.max(ink, band(h, a, c));
  for (const [a, c] of GOLD_BANDS) gold = Math.max(gold, band(h, a, c));
  if (h > 0.25 && h < 0.655) {
    const u = arc / 0.055;
    const v = h / 0.055;
    const d1 = Math.abs(u + v - Math.round(u + v));
    const d2 = Math.abs(u - v - Math.round(u - v));
    if (d1 < 0.1 || d2 < 0.1) wash = 1;
    if (d1 < 0.2 && d2 < 0.2) ink = 1;
  } else if (h > 0.805 && h < 1.355) {
    ink = Math.max(ink, seigaiha(arc, h, 0.05));
  } else if (h > 1.5 && h < 1.85) {
    const f = arc / 0.035;
    if (f - Math.floor(f) < 0.3) wash = 1;
  } else if (h > 1.895 && h < 1.965) {
    const fx = (arc / 0.032) % 1;
    const u = (fx < 0 ? fx + 1 : fx) - 0.5;
    const v = (h - 1.93) / 0.032;
    if (Math.hypot(u, v) < 0.38) ink = 1;
  }
  let c = glaze(p, n);
  c = over(c, washAt(p), wash);
  c = over(c, cobAt(p), ink);
  return over(c, OCHRE_RGB, gold);
});

const wheelPaint = (cy: number, cz: number, R: number) =>
  paint((p, n) => {
    const dy = p.y - cy;
    const dz = p.z - cz;
    const r = Math.hypot(dy, dz);
    const a = Math.atan2(dz, dy);
    const c = glaze(p, n);
    if (Math.abs(n.x) < 0.5) return Math.floor((a + Math.PI) / (Math.PI / 8)) % 2 ? cobAt(p) : c;
    let ink = 0;
    let wash = 0;
    if (r > R - 0.03) ink = 1;
    wash = Math.max(wash, band(r, R - 0.05, R - 0.04, 0.002));
    const pet = Math.pow(Math.abs(Math.cos(4 * a)), 1.4);
    const L = 0.07 + (R - 0.07 - 0.07) * pet;
    if (r > 0.07 && r < L) {
      wash = 1;
      if (r > L - 0.008) ink = 1;
      if (Math.abs(Math.sin(4 * a)) * r < 0.003) ink = 1;
    }
    if (r < 0.065) ink = r < 0.02 ? 0 : 1;
    let out = over(c, washAt(p), wash);
    out = over(out, cobAt(p), ink);
    return over(out, OCHRE_RGB, band(r, 0.066, 0.074, 0.002));
  });

const boxPaint = (cell: number) =>
  paint((p, n) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    return over(glaze(p, n), cobAt(p), seigaiha(u, v, cell));
  });

const ropePaint = (len: number) =>
  paint((_p, _n, s) => {
    const turns = len / 0.07;
    const a = (((s[1] - 360 * turns * s[0]) % 180) + 180) % 180;
    return a < 85 ? COB_RGB : WHITE_RGB;
  });

const dolphinPaint = paint((p, n) => {
  const k = cells(p, 0.022, 11);
  let c = glaze(p, n);
  c = over(c, washAt(p), 0.55 * smoothstep(0.1, 0.7, n.y));
  return over(c, cobAt(p), 1 - smoothstep(0.05, 0.15, k.d2 - k.d1));
});

const finialPaint = paint((p, n, s) => {
  const h = s[0];
  let c = glaze(p, n);
  c = over(c, washAt(p), band(h, 0.03, 0.048, 0.003));
  c = over(c, cobAt(p), Math.max(band(h, 0.012, 0.024), band(h, 0.05, 0.06), band(h, 0.09, 0.12)));
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG, cobalt line-work on transparent so the glaze shows through)
const STROKE = `fill="none" stroke="${COB}" stroke-linecap="round" stroke-linejoin="round"`;

const shipSvg = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g ${flip ? 'transform="translate(100 0) scale(-1 1)"' : ""} ${STROKE}>
    <circle cx="50" cy="50" r="47" fill="${CREAM}" stroke-width="3.4"/>
    <circle cx="50" cy="50" r="42" stroke="${WASH}" stroke-width="1.6"/>
    <path d="M36 53V22M54 53V15M72 53V26M84 48L95 42" stroke-width="2.2"/>
    <path d="M28 27H44Q46 36 44 44H28Q26 36 28 27Z" fill="#fff" stroke-width="1.8"/>
    <path d="M45 20H63Q65 31 63 43H45Q43 31 45 20Z" fill="#fff" stroke-width="1.8"/>
    <path d="M64 29H80Q82 37 80 45H64Q62 37 64 29Z" fill="#fff" stroke-width="1.8"/>
    <path d="M36 22L36 17L45 19.5Z M54 15L54 10L63 12.5Z M72 26L72 21L80 23.5Z" fill="${COB}" stroke-width="1"/>
    <path d="M17 56L22 47L33 47L33 53L73 53L86 46L84 58Q60 74 30 68Q20 65 17 56Z" fill="#fff" stroke-width="2.4"/>
    <path d="M20 60Q52 70 83 56" stroke="${WASH}" stroke-width="1.8"/>
    <g fill="${COB}" stroke="none"><circle cx="38" cy="60" r="1.5"/><circle cx="46" cy="61.5" r="1.5"/><circle cx="54" cy="61.5" r="1.5"/><circle cx="62" cy="60.5" r="1.5"/></g>
    <path d="M18 76q5 -6 10 0t10 0t10 0t10 0t10 0t10 0" stroke-width="2"/>
    <path d="M26 84q5 -6 10 0t10 0t10 0t10 0" stroke="${WASH}" stroke-width="2"/>
  </g></svg>`,
    { size: 384 },
  );

const tulipSvg = () =>
  svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
  <g ${STROKE} stroke-width="2.4">
    <path d="M30 98C29 80 31 66 30 52" stroke-width="3.2"/>
    <path d="M30 92C14 86 8 68 10 52C22 58 28 74 30 92Z" fill="${PALE}"/>
    <path d="M30 86C46 80 52 64 50 50C38 56 32 70 30 86Z" fill="${PALE}"/>
    <path d="M30 58C14 56 8 38 12 20C20 26 26 30 30 38C34 30 40 26 48 20C52 38 46 56 30 58Z" fill="#fff"/>
    <path d="M30 58C21 49 21 32 30 12C39 32 39 49 30 58Z" fill="${OCHRE}"/>
    <path d="M30 52V26M24 50Q22 40 26 30M36 50Q38 40 34 30" stroke="${COB}" stroke-width="1.2"/>
    <path d="M14 30Q16 44 24 52M46 30Q44 44 36 52" stroke="${WASH}" stroke-width="1.4"/>
  </g></svg>`,
    { size: 256 },
  );

const wreathSvg = () => {
  let leaves = "";
  for (const side of [1, -1])
    for (let i = 0; i < 9; i++) {
      const phi = ((12 + i * 16) * Math.PI) / 180;
      const x = 50 + side * 37 * Math.sin(phi);
      const y = 50 + 37 * Math.cos(phi);
      const rot = -side * ((phi * 180) / Math.PI);
      leaves += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7.5" ry="3.3" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 2 ? PALE : WASH}" stroke="${COB}" stroke-width="1.3"/>`;
    }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${CREAM}" stroke="${COB}" stroke-width="3"/>
    ${leaves}
    <g ${STROKE} stroke-width="3.6">
      <circle cx="50" cy="24" r="5"/>
      <path d="M41 34H59M50 29V72M30 58Q36 80 50 78Q64 80 70 58"/>
      <path d="M27 60L33 66L35 55Z M73 60L67 66L65 55Z" fill="${COB}" stroke-width="1.5"/>
    </g></svg>`,
    { size: 320 },
  );
};

const vocSvg = () =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${CREAM}" stroke="${COB}" stroke-width="3.4"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="${WASH}" stroke-width="1.6" stroke-dasharray="3 3"/>
    <text x="50" y="78" text-anchor="middle" font-family="serif" font-weight="bold" font-size="66" fill="${COB}">V</text>
    <text x="27" y="50" text-anchor="middle" font-family="serif" font-weight="bold" font-size="26" fill="${COB}">O</text>
    <text x="73" y="50" text-anchor="middle" font-family="serif" font-weight="bold" font-size="26" fill="${COB}">C</text>
    <path d="M30 86Q50 94 70 86" fill="none" stroke="${OCHRE}" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
    { size: 320 },
  );

const bannerSvg = () =>
  svg(
    `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 20L14 6H186L198 20L186 34H14Z" fill="${CREAM}" stroke="${COB}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M8 20L16 11H184L192 20L184 29H16Z" fill="none" stroke="${WASH}" stroke-width="1.2"/>
    <text x="100" y="27.5" text-anchor="middle" font-family="serif" font-weight="bold" font-size="19" letter-spacing="3" fill="${COB}">ANNO 1664</text>
  </svg>`,
    { size: 512 },
  );

const fleurSvg = () =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g ${STROKE} stroke-width="2.6">
    <path d="M50 6C64 26 62 46 50 62C38 46 36 26 50 6Z" fill="${PALE}"/>
    <path d="M43 56C30 60 12 52 12 30C24 32 38 40 44 52Z" fill="#fff"/>
    <path d="M57 56C70 60 88 52 88 30C76 32 62 40 56 52Z" fill="#fff"/>
    <path d="M50 14V54M18 38Q28 46 40 52M82 38Q72 46 60 52" stroke="${WASH}" stroke-width="1.4"/>
    <rect x="28" y="62" width="44" height="8" rx="2" fill="${COB}"/>
    <path d="M50 70V92M40 92H60" stroke-width="3"/>
    <circle cx="22" cy="82" r="4" fill="${OCHRE}" stroke-width="1.6"/>
    <circle cx="78" cy="82" r="4" fill="${OCHRE}" stroke-width="1.6"/>
  </g></svg>`,
    { size: 256 },
  );

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "delft-gun", paintSize: 2048 });

  const SHIP_L = shipSvg(true);
  const SHIP_R = shipSvg(false);
  const TULIP = tulipSvg();
  const FLEUR = fleurSvg();
  const WREATH = wreathSvg();
  const VOC = vocSvg();
  const BANNER = bannerSvg();

  type V = [number, number, number];
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
  const cyl = (r: number, len: number, color: string, at: V, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { at, dir: [1, 0, 0] });

  // ---------------- Carriage cheeks ----------------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    b.extrude(CHEEK, {
      at: [s * 0.23, 0, 0],
      x: [0, 0, 1],
      thickness: 0.09,
      bevel: 0.01,
      color: cheekPaint,
      name: `cheek${tag}`,
    });
    const face = s * 0.2775;
    // medallions on the outer faces
    plane(0.36, 0.36, s > 0 ? SHIP_L : SHIP_R, [face, 0.58, 0.42], [s, 0, 0]);
    plane(0.26, 0.26, FLEUR, [face, 0.48, -0.22], [s, 0, 0]);
    plane(0.15, 0.25, TULIP, [face, 0.36, -0.61], [s, 0, 0]);

    // gilt rivets along the painted border
    const gs: THREE.BufferGeometry[] = [];
    const m = CHEEK.length;
    for (let i = 0; i < m; i++) {
      const [z0, y0] = CHEEK[i];
      const [z1, y1] = CHEEK[(i + 1) % m];
      const dz = z1 - z0;
      const dy = y1 - y0;
      const L = Math.hypot(dz, dy);
      const nz = -dy / L;
      const ny = dz / L;
      const cnt = Math.max(1, Math.round((L - 0.14) / 0.09) + 1);
      for (let k = 0; k < cnt; k++) {
        const t = cnt === 1 ? 0.5 : 0.07 / L + (1 - 0.14 / L) * (k / (cnt - 1));
        gs.push(
          new THREE.SphereGeometry(0.0095, 6, 4)
            .scale(0.6, 1, 1)
            .translate(s * 0.2765, y0 + dy * t + ny * 0.03, z0 + dz * t + nz * 0.03),
        );
      }
    }
    b.part(mergeGeometries(gs)!, OCHRE, { at: [0, 0, 0], name: `rivets${tag}` });

    // capsquare over the trunnion
    b.part(new THREE.BoxGeometry(0.13, 0.018, 0.15), IRON, { at: [s * 0.23, 0.929, 0.2] });
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.15), IRON, { at: [s * 0.2815, 0.88, 0.2] });
    // trunnion end cap
    cyl(0.058, 0.014, COB, [s * 0.304, AXY, 0.2], 12);
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.018, 8), OCHRE, {
      at: [s * 0.31, AXY, 0.2],
      dir: [1, 0, 0],
    });

    // vase finials (tulip-vase urns) on the cheek tops
    for (const [fz, fy, sc] of [
      [0.62, 0.92, 1.1],
      [-0.64, 0.52, 0.8],
    ] as [number, number, number][])
      b.lathe(
        [
          [0, 0],
          [0.04, 0],
          [0.04, 0.012],
          [0.022, 0.024],
          [0.034, 0.045],
          [0.038, 0.062],
          [0.02, 0.082],
          [0.028, 0.092],
          [0.012, 0.108],
          [0, 0.108],
        ].map(([x, y]) => [x * sc, y * sc]) as [number, number][],
        { at: [s * 0.23, fy - 0.004, fz], segments: 8, color: finialPaint },
      );

    // ringbolts: breeching ring and tackle ring
    for (const [rz, ry] of [
      [-0.285, 0.6],
      [0.62, 0.4],
    ] as [number, number][]) {
      b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), IRON, {
        at: [s * 0.292, ry, rz],
        dir: [1, 0, 0],
        axis: "z",
      });
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), IRON, {
        at: [s * 0.282, ry + 0.032, rz],
        dir: [1, 0, 0],
      });
    }
  }

  // ---------------- Between-cheek woodwork ----------------
  b.part(new THREE.BoxGeometry(0.35, 0.1, 0.7), boxPaint(0.045), { at: [0, 0.51, -0.45], name: "bed" });
  b.part(new THREE.BoxGeometry(0.37, 0.14, 0.07), boxPaint(0.04), { at: [0, 0.4, 0.64], name: "breastTransom" });
  b.extrude(
    [
      [-0.64, 0.56],
      [-0.12, 0.56],
      [-0.12, 0.6],
      [-0.64, 0.645],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 0.14, bevel: 0.004, color: boxPaint(0.035), name: "quoin" },
  );
  b.part(new THREE.BoxGeometry(0.06, 0.035, 0.1), IRON, { at: [0, 0.6, -0.69], name: "quoinHandle" });

  // transom bolts through the cheeks
  for (const [bz, by] of [
    [0.64, 0.4],
    [-0.26, 0.31],
  ] as [number, number][]) {
    cyl(0.013, 0.62, IRON, [0, by, bz], 6);
    for (const s of [1, -1]) cyl(0.026, 0.014, IRON, [s * 0.282, by, bz], 8);
  }

  // ---------------- Axles and trucks ----------------
  const trucks: { z: number; y: number; R: number; box: [number, number, number] }[] = [
    { z: 0.5, y: 0.198, R: 0.2, box: [0.62, 0.12, 0.17] },
    { z: -0.62, y: 0.139, R: 0.14, box: [0.62, 0.1, 0.15] },
  ];
  for (const t of trucks) {
    b.part(new THREE.BoxGeometry(...t.box), boxPaint(0.04), { at: [0, t.y, t.z], name: "axletree" });
    cyl(0.03, 0.9, IRON, [0, t.y, t.z], 8);
    for (const s of [1, -1]) {
      const R = t.R;
      b.lathe(
        [
          [0, -0.08],
          [0.06, -0.08],
          [0.062, -0.052],
          [R - 0.025, -0.052],
          [R, -0.038],
          [R, 0.038],
          [R - 0.025, 0.052],
          [0.062, 0.052],
          [0.06, 0.08],
          [0, 0.08],
        ],
        { at: [s * 0.34, t.y, t.z], axis: [1, 0, 0], segments: 16, color: wheelPaint(t.y, t.z, R), name: "truck" },
      );
      cyl(0.042, 0.03, IRON, [s * 0.435, t.y, t.z], 8);
      b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.09, 6), OCHRE, { at: [s * 0.437, t.y, t.z] });
      // gilt studs round the wheel face
      const studs: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        studs.push(
          new THREE.SphereGeometry(0.0085, 5, 3).translate(
            s * 0.3915,
            t.y + Math.cos(a) * (R - 0.0425),
            t.z + Math.sin(a) * (R - 0.0425),
          ),
        );
      }
      b.part(mergeGeometries(studs)!, OCHRE, { at: [0, 0, 0], name: "wheelStuds" });
    }
  }

  // ---------------- Barrel ----------------
  const barrel = b.lathe(
    [
      [0, -0.17],
      [0.04, -0.16],
      [0.065, -0.11],
      [0.05, -0.07],
      [0.04, -0.03],
      [0.09, 0.0],
      [0.17, 0.05],
      [0.18, 0.12],
      [0.2, 0.13],
      [0.2, 0.17],
      [0.182, 0.18],
      [0.178, 0.19],
      [0.158, 0.72],
      [0.168, 0.73],
      [0.168, 0.76],
      [0.158, 0.77],
      [0.125, 1.4],
      [0.134, 1.41],
      [0.134, 1.44],
      [0.124, 1.45],
      [0.102, 1.82],
      [0.12, 1.86],
      [0.145, 1.92],
      [0.145, 2.0],
      [0.07, 2.0],
      [0.07, 1.8],
      [0, 1.8],
    ],
    { at: [0, AXY, BZ0], axis: [0, 0, 1], segments: 16, color: barrelPaint, name: "barrel" },
  );

  // trunnions
  cyl(0.05, 0.6, COB, [0, AXY, 0.2], 10);

  // decals on the barrel
  for (const s of [1, -1]) {
    b.decal(barrel, WREATH, { at: [s * 0.18, 0.86, -0.19], dir: [s, 0, 0], size: [0.2, 0.2] });
    b.decal(barrel, BANNER, { at: [s * 0.115, 0.83, 1.07], dir: [s, 0, 0], size: [0.34, 0.068] });
  }
  b.decal(barrel, VOC, { at: [0, 0.99, -0.02], dir: [0, 1, 0], up: [0, 0, 1], size: [0.19, 0.19] });

  // vent field, touch-hole, fore-sight
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.09), IRON, { at: [0, 0.998, -0.27] });
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 8), INKBORE, { at: [0, 1.003, -0.27] });
  b.part(new THREE.ConeGeometry(0.013, 0.035, 6), IRON, { at: [0, 0.978, 1.34] });

  // breeching rope round the cascabel, out to the cheek ringbolts
  const loopPts: V[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    loopPts.push([Math.sin(a) * 0.066, AXY + Math.cos(a) * 0.066, -0.6]);
  }
  b.sweep(catmull(loopPts, { closed: true }), 0.013, { color: ropePaint(0.42), sides: 6, name: "ropeLoop" });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.066, 0.82, -0.6],
        [s * 0.19, 0.81, -0.56],
        [s * 0.27, 0.72, -0.5],
        [s * 0.31, 0.62, -0.4],
        [s * 0.296, 0.585, -0.285],
      ]),
      0.013,
      { color: ropePaint(0.6), sides: 6, name: "breeching" },
    );
  }

  // ---------------- Dolphin handle ----------------
  const dolphinPath = catmull([
    [0, 0.96, 0.82],
    [0, 1.05, 0.76],
    [0, 1.12, 0.62],
    [0, 1.14, 0.46],
    [0, 1.1, 0.33],
    [0, 1.13, 0.25],
    [0, 1.2, 0.22],
  ]);
  b.sweep(dolphinPath, [0.03, 0.045, 0.045, 0.04, 0.028, 0.02, 0.012], {
    color: dolphinPaint,
    sides: 8,
    name: "dolphin",
  });
  b.spike([0, 0.985, 0.81], [0, 0.955, 0.88], null, 0.022, { color: dolphinPaint, name: "beak" });
  b.extrude(
    [
      [-0.07, 0],
      [0.07, 0],
      [-0.06, 0.07],
    ],
    { at: [0, 1.165, 0.52], x: [0, 0, 1], thickness: 0.012, color: COB, name: "dorsalFin" },
  );
  b.extrude(
    [
      [0, -0.035],
      [0.07, -0.01],
      [0.09, 0.04],
      [0.03, 0.015],
      [0, 0.0],
      [-0.03, 0.015],
      [-0.09, 0.04],
      [-0.07, -0.01],
    ],
    { at: [0, 1.205, 0.21], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: COB, name: "fluke" },
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.008, 6, 4), OCHRE, { at: [s * 0.027, 1.015, 0.785], name: "dolphinEye" });

  // ---------------- Glossy ceramic finish ----------------
  const root = b.root;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats)
      if (m instanceof THREE.MeshStandardMaterial) {
        m.roughness = 0.3;
        m.metalness = 0;
      }
  });
  return root;
}
