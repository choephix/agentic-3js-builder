// A Victorian clockwork great horned owl perched on a brass steam pipe, half a metre from the floor to the tips of
// its ear tufts. Steampunk carried as metal: every surface is a paint (polished brass with streaky sheen, tarnished
// brass with verdigris in the shade, copper, blued iron, heat-tempered steel) and the feathers are riveted plates.
// Big plates (wings, tail, ear tufts) are extruded shields whose engraving (edge line, rib, chevrons, scales,
// lozenges and rivets) is painted from the plate's own coordinates. The coat is a scatter of drawn brass plate cards
// with scrollwork. Gear teeth, the lens-eye irises, the gauge dials, the maker's plaque and the base ring scroll are
// svg() drawings. Open movement in the chest (turning gears, mainspring), gear drums and springs at both wing roots,
// gauges, copper pipes, a winding key on the back and a valve wheel on the perch are all on joints.
import { CircleGeometry, CylinderGeometry, PlaneGeometry, SphereGeometry, TorusGeometry, Vector3 } from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import type { Fill, JointRef } from "../src/context";
import { limb } from "../src/ik";
import { DEG, rng } from "../src/math";
import { mix, noise, paint, resolve, smoothstep } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Clockwork Owl",
  description:
    "A Victorian clockwork great horned owl on a brass steam-pipe perch: riveted, engraved brass-and-copper plate feathers, an open movement of turning gears and a mainspring in the chest, gear drums and springs at the wing roots, glass-lens eyes with iris rings and hinged lids, pressure gauges, copper pipes and a winding key.",
};

const TAU = Math.PI * 2;
const fract = (x: number) => x - Math.floor(x);
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Metals as paints. Polish is a streaky warm sheen on up-facing surfaces; tarnish is dark blotches; patina is
// verdigris that gathers where the surface faces away from the light.
const VERD: Rgb = [0.27, 0.68, 0.56];
const SHEEN: Rgb = [1, 0.9, 0.62];

type Metal = { lo: string; hi: string; tarn: string; tarnAmt: number; verd: number; sheen: number; seed: number };
function metal(m: Metal) {
  return paint((p, n) => {
    const big = noise(p, 0.07, m.seed);
    const fine = noise(p, 0.009, m.seed + 5);
    let c: Rgb = mix(m.lo, m.hi, smoothstep(0.2, 0.8, big) * 0.75 + fine * 0.25);
    c = mix(c, m.tarn, m.tarnAmt * smoothstep(0.45, 0.8, noise(p, 0.03, m.seed + 9)));
    if (m.verd)
      c = mix(c, VERD, m.verd * smoothstep(0.58, 0.72, noise(p, 0.016, m.seed + 13)) * smoothstep(0.75, -0.3, n.y));
    if (m.sheen) c = mix(c, SHEEN, m.sheen * smoothstep(0.5, 1, n.y) * smoothstep(0.35, 0.75, fine));
    const ao = 0.8 + 0.2 * smoothstep(-0.9, 0.4, n.y);
    return [c[0] * ao, c[1] * ao, c[2] * ao] as Rgb;
  });
}

const POL = metal({ lo: "#d6a23a", hi: "#ffe692", tarn: "#7a5a22", tarnAmt: 0.1, verd: 0, sheen: 0.6, seed: 1 });
const MID = metal({ lo: "#aa7a30", hi: "#e4b65a", tarn: "#4a3014", tarnAmt: 0.45, verd: 0.22, sheen: 0.3, seed: 2 });
const OLD = metal({ lo: "#7e5a2a", hi: "#b88e46", tarn: "#2a1a0a", tarnAmt: 0.75, verd: 0.7, sheen: 0.1, seed: 3 });
const COP = metal({ lo: "#a44622", hi: "#ec8652", tarn: "#3a1a0e", tarnAmt: 0.4, verd: 0.45, sheen: 0.35, seed: 4 });
const FE = metal({ lo: "#22212a", hi: "#6a6d7c", tarn: "#0b0a0d", tarnAmt: 0.4, verd: 0, sheen: 0.3, seed: 5 });
const STEEL = metal({ lo: "#20305e", hi: "#6a82c4", tarn: "#0e1428", tarnAmt: 0.25, verd: 0, sheen: 0.4, seed: 6 });
const BLUED = paint((p, n) => {
  // heat-tempered steel: straw, purple, blue by height along the model
  const t = smoothstep(0.0, 1.0, noise(p, 0.05, 31));
  return mix(mix("#9a7a3c", "#5c3f8a", t), "#243c7c", smoothstep(0.3, 0.9, t) * 0.7 * (0.6 + 0.4 * n.y));
});

/** Metals blended by a slow field: what a card of the coat is tinted with, so the plates read as mixed old stock. */
const COAT = paint((p, n) => {
  const t = noise(p, 0.055, 21);
  const a = resolve(POL, p, n);
  const m = resolve(MID, p, n);
  const o = resolve(OLD, p, n);
  const c = resolve(COP, p, n);
  const first = mix(a, m, smoothstep(0.25, 0.55, t));
  const second = mix(first, o, smoothstep(0.55, 0.72, noise(p, 0.04, 22)));
  const third = mix(second, c, smoothstep(0.6, 0.78, t) * 0.9);
  return mix(third, resolve(FE, p, n), smoothstep(0.68, 0.8, noise(p, 0.05, 23)));
});

// ---------------------------------------------------------------------------------------------------------------
// Riveted plates. The outline of a plate feather, and the engraving painted from its own [x, y] in meters.
const PROFILE: readonly (readonly [number, number])[] = [
  [0, 0.35],
  [0.15, 0.75],
  [0.5, 1],
  [0.82, 0.8],
  [0.965, 0.38],
  [1, 0],
];
const TUFT: readonly (readonly [number, number])[] = [
  [0, 0.5],
  [0.2, 0.95],
  [0.5, 0.85],
  [0.8, 0.5],
  [0.95, 0.2],
  [1, 0],
];

function halfAt(profile: readonly (readonly [number, number])[], u: number) {
  for (let i = 1; i < profile.length; i++) {
    const [u1, f1] = profile[i];
    if (u <= u1) {
      const [u0, f0] = profile[i - 1];
      return f0 + ((f1 - f0) * (u - u0)) / (u1 - u0);
    }
  }
  return 0;
}

function plateOutline(L: number, w: number, profile: readonly (readonly [number, number])[]) {
  const lower = profile.slice(0, -1).map(([u, f]) => [u * L, -f * w] as [number, number]);
  const upper = profile
    .slice(0, -1)
    .map(([u, f]) => [u * L, f * w] as [number, number])
    .reverse();
  return [...lower, [L, 0, "sharp"] as const, ...upper];
}

const INK: Rgb = [0.13, 0.08, 0.04];
const GLINT: Rgb = [1, 0.93, 0.66];

/** Engraved plate: border line, rib, and a hatch (0 chevrons, 1 scales, 2 lozenges), riveted at the root, the tip tempered. */
function plate(
  L: number,
  w: number,
  base: ColorInput,
  tip: ColorInput,
  kind: number,
  profile: readonly (readonly [number, number])[] = PROFILE,
  rivets = true,
) {
  const pitch = 0.0078;
  const scaleRow = 0.0075;
  return paint((p, n, s) => {
    const [x, y] = s;
    const u = x / L;
    const ay = Math.abs(y);
    const hw = halfAt(profile, Math.min(Math.max(u, 0), 1)) * w;
    let col: Rgb = resolve(base, p, n);
    const temper = smoothstep(0.62, 0.92, u);
    if (temper > 0) col = mix(col, resolve(tip, p, n), temper);
    const edge = hw - ay;
    let ink = 0;
    if (edge > 0.002 && edge < 0.0033) ink = 1;
    if (ay < 0.0008 && u > 0.05 && u < 0.95) ink = 1;
    if (edge > 0.0045 && u > 0.12 && u < 0.94 && ay > 0.0016) {
      if (kind === 0) {
        if (fract((x - ay * 1.25) / pitch) < 0.2) ink = 0.85;
      } else if (kind === 1) {
        const row = Math.floor(x / scaleRow);
        const off = row & 1 ? 0.5 : 0;
        const cy = (Math.round(y / scaleRow - off) + off) * scaleRow;
        const cx = (row + 1) * scaleRow;
        if (x < cx && Math.abs(Math.hypot(x - cx, y - cy) - scaleRow * 0.62) < 0.00065) ink = 0.85;
      } else if (fract((x + ay) / (pitch * 1.4)) < 0.13 || fract((x - ay) / (pitch * 1.4)) < 0.13) ink = 0.8;
    }
    if (rivets && L > 0.08) {
      const rx = 0.12 * L;
      const ry = halfAt(profile, 0.12) * w * 0.55;
      const dr = Math.hypot(x - rx, ay - ry);
      if (dr < 0.0019) col = mix(col, GLINT, 0.6);
      else if (dr < 0.0026) ink = 1;
    }
    if (ink > 0) col = mix(col, INK, ink * 0.75);
    return col;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings. Everything is drawn pale grey so the part's tint (brass, copper, iron) colours it and the engraving
// darkens the tint.
const LINE = "#5a5a5a";

/** A brass plate feather for the coat: shaded like a curved shield, engraved, riveted. kind: 0 chevron, 1 scales, 2 scroll. */
function plateCard(kind: number) {
  const P = "M20 55 C8 54 3 44 3.5 30 C4 14 11 4 20 1.5 C29 4 36 14 36.5 30 C37 44 32 54 20 55Z";
  const inner = `transform="translate(20 28) scale(0.84) translate(-20 -28)"`;
  let etch = "";
  if (kind === 0) {
    etch += `<path d="M20 6 L20 50" stroke="${LINE}" stroke-width="1.1" fill="none"/>`;
    for (let y = 16; y < 50; y += 4.6)
      etch += `<path d="M20 ${y} L10.5 ${y - 6.5} M20 ${y} L29.5 ${y - 6.5}" stroke="${LINE}" stroke-width="1" fill="none"/>`;
  } else if (kind === 1) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 5; c++) {
        const cx = 6 + c * 7 + (r % 2 ? 3.5 : 0);
        const cy = 12 + r * 5.6;
        etch += `<path d="M${cx - 3.6} ${cy} A3.6 3.6 0 0 0 ${cx + 3.6} ${cy}" stroke="${LINE}" stroke-width="1" fill="none"/>`;
      }
  } else {
    etch += `<path d="M20 50 C20 40 20 30 20 12" stroke="${LINE}" stroke-width="1" fill="none"/>`;
    for (const s of [-1, 1]) {
      const X = (v: number) => 20 + s * v;
      etch += `<path d="M20 44 C${X(10)} 42 ${X(12)} 34 ${X(7)} 31 C${X(3)} 29 ${X(3)} 35 ${X(6)} 35" stroke="${LINE}" stroke-width="1.1" fill="none"/>`;
      etch += `<path d="M20 30 C${X(9)} 28 ${X(11)} 20 ${X(6)} 17 C${X(3)} 15 ${X(3)} 21 ${X(5.5)} 21" stroke="${LINE}" stroke-width="1.1" fill="none"/>`;
      etch += `<path d="M20 16 C${X(6)} 14 ${X(7)} 9 ${X(4)} 8" stroke="${LINE}" stroke-width="1" fill="none"/>`;
    }
  }
  const rivet = (cx: number, cy: number) =>
    `<circle cx="${cx}" cy="${cy}" r="2.2" fill="url(#rv)" stroke="#404040" stroke-width="0.9"/><circle cx="${cx - 0.6}" cy="${cy - 0.7}" r="0.6" fill="#fff"/>`;
  return svg(
    `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e2e2e2"/><stop offset="1" stop-color="#9c9c9c"/></linearGradient>
        <linearGradient id="h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="0.32" stop-color="#fff" stop-opacity="0.4"/><stop offset="0.55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.34"/></linearGradient>
        <radialGradient id="rv" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8f8f8f"/></radialGradient>
        <clipPath id="c"><path d="${P}" ${inner}/></clipPath>
      </defs>
      <path d="${P}" fill="url(#v)"/>
      <path d="${P}" fill="url(#h)"/>
      <g clip-path="url(#c)">${etch}</g>
      <path d="${P}" ${inner} fill="none" stroke="#7d7d7d" stroke-width="0.9"/>
      <path d="${P}" fill="none" stroke="#3b3b3b" stroke-width="1.7" stroke-linejoin="round"/>
      ${rivet(10.5, 46)}${rivet(29.5, 46)}
    </svg>`,
    { size: 256 },
  );
}

/** A gear: toothed rim, windows between spokes (transparent), hub, dotted rivet ring. */
function gearSvg(
  teeth: number,
  spokes: number,
  o: { tooth?: number; rim?: number; hub?: number; dots?: boolean } = {},
) {
  const R = 48;
  const root = R * (1 - (o.tooth ?? 0.14));
  const rimIn = R * (o.rim ?? 0.68);
  const hub = R * (o.hub ?? 0.2);
  const step = TAU / teeth;
  const pt = (r: number, a: number) => `${(50 + r * Math.sin(a)).toFixed(2)} ${(50 - r * Math.cos(a)).toFixed(2)}`;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    d += `${i ? "L" : "M"}${pt(root, a - 0.3 * step)}L${pt(R, a - 0.16 * step)}L${pt(R, a + 0.16 * step)}L${pt(root, a + 0.3 * step)}`;
  }
  d += "Z";
  for (let k = 0; k < spokes; k++) {
    const a = ((k + 0.5) * TAU) / spokes;
    const h = (TAU / spokes) * 0.5 * 0.6;
    d += `M${pt(rimIn, a - h)}A${rimIn} ${rimIn} 0 0 1 ${pt(rimIn, a + h)}L${pt(hub * 1.25, a + h * 0.7)}A${hub * 1.25} ${hub * 1.25} 0 0 0 ${pt(hub * 1.25, a - h * 0.7)}Z`;
  }
  const ring = (r: number, w: number, extra = "") =>
    `<circle cx="50" cy="50" r="${r.toFixed(2)}" fill="none" stroke="#656565" stroke-width="${w}" ${extra}/>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.4" cy="0.35" r="0.85"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b4b4b4"/></radialGradient></defs>
      <path d="${d}" fill="url(#g)" fill-rule="evenodd" stroke="#4d4d4d" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="${(hub * 1.25).toFixed(2)}" fill="url(#g)" stroke="#4d4d4d" stroke-width="1.5"/>
      ${ring(hub * 0.5, 1.6)}
      ${ring(rimIn + 1.5, 1.2)}
      ${o.dots ? ring((rimIn + root) / 2 + 2, 1.8, `stroke-dasharray="1.6 3.4"`) : ""}
    </svg>`,
    { size: 256 },
  );
}

const GEAR_BIG = gearSvg(18, 6, { dots: true });
const GEAR_MID = gearSvg(14, 5, { rim: 0.7 });
const GEAR_SMALL = gearSvg(10, 4, { rim: 0.62, hub: 0.26 });
const GEAR_FINE = gearSvg(28, 0, { tooth: 0.09, dots: true });
const GEAR_CROSS = gearSvg(22, 4, { tooth: 0.11, rim: 0.78, hub: 0.16 });

/** A pressure dial: cream face, ticks, numerals, a red zone. The needle is a part on a joint. */
function dialSvg() {
  const pt = (r: number, deg: number) =>
    `${(50 + r * Math.sin(deg * DEG)).toFixed(2)} ${(50 - r * Math.cos(deg * DEG)).toFixed(2)}`;
  let ticks = "";
  for (let i = 0; i <= 20; i++) {
    const a = -135 + (i * 270) / 20;
    ticks += `<path d="M${pt(42, a)} L${pt(i % 2 ? 37.5 : 33.5, a)}" stroke="#2a1d10" stroke-width="${i % 2 ? 1.6 : 2.6}"/>`;
  }
  let nums = "";
  for (let i = 0; i <= 10; i += 2) {
    const a = -135 + (i * 270) / 10;
    const [x, y] = pt(25.5, a).split(" ");
    nums += `<text x="${x}" y="${(Number(y) + 3.2).toFixed(1)}" text-anchor="middle" font-family="serif" font-weight="bold" font-size="10" fill="#2a1d10">${i}</text>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#efe3c2" stroke="#3a2a14" stroke-width="2.5"/>
      <path d="M${pt(40, 81)} A40 40 0 0 1 ${pt(40, 135)}" stroke="#b3261e" stroke-width="6" fill="none"/>
      ${ticks}${nums}
      <text x="50" y="70" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#2a1d10">PSI</text>
      <circle cx="50" cy="50" r="3" fill="#2a1d10"/>
    </svg>`,
    { size: 256 },
  );
}
const DIAL = dialSvg();

/**
 * The lens eye as a map for a sphere whose top pole looks out. Each of the 8 sphere rings is 5 rows tall: black
 * pupil with a glint, amber iris with radial blades, dark limbus, a brass iris ring with ticks, dark housing.
 */
function eyeSvg() {
  let blades = "";
  for (let i = 0; i < 40; i++)
    blades += `<rect x="${i * 2}" y="5" width="2" height="4.6" fill="${i % 2 ? "#ffd464" : "#e8862a"}"/>`;
  let ticks = "";
  for (let i = 0; i < 20; i++) ticks += `<rect x="${i * 4 + 1.6}" y="10.4" width="0.9" height="4" fill="#3a2410"/>`;
  return svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="40" fill="#1c150e"/>
      <rect y="0" width="80" height="5" fill="#0a0808"/>
      ${blades}
      <rect y="9.6" width="80" height="0.9" fill="#3a1a08"/>
      <rect y="10.5" width="80" height="4.5" fill="#f2c25a"/>
      ${ticks}
      <rect y="15" width="80" height="1.1" fill="#4a2f12"/>
      <rect y="16.1" width="80" height="4" fill="#8a5a22"/>
      <ellipse cx="14" cy="2.6" rx="5" ry="1.5" fill="#ffffff"/>
      <ellipse cx="46" cy="1.6" rx="2.4" ry="0.8" fill="#fff6d8"/>
      <ellipse cx="14" cy="7.3" rx="6" ry="1.2" fill="#fff2b8" opacity="0.5"/>
    </svg>`,
    { size: 256 },
  );
}
const EYE = eyeSvg();

/** Scroll ring engraved on the perch base: eight spiral flourishes between two rules. */
function scrollRing() {
  let motifs = "";
  for (let k = 0; k < 8; k++)
    motifs += `<g transform="rotate(${k * 45} 50 50)">
      <path d="M50 9 C58 9 62 17 56 20 C52 22 48 18 51 16" stroke="${LINE}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M50 9 C42 9 38 17 44 20 C48 22 52 18 49 16" stroke="${LINE}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M50 22 L50 30" stroke="${LINE}" stroke-width="1.4"/>
      <path d="M50 24 C46 26 44 30 47 32 M50 24 C54 26 56 30 53 32" stroke="${LINE}" stroke-width="1.1" fill="none"/>
    </g>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="none" stroke="${LINE}" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="34" fill="none" stroke="${LINE}" stroke-width="1.6"/>
      ${motifs}
    </svg>`,
    { size: 512 },
  );
}
const SCROLL_RING = scrollRing();

/** Maker's plaque: a cartouche with a scrolled border and lettering. */
const PLAQUE = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bdbdbd"/></linearGradient></defs>
    <path d="M8 4 H72 Q78 4 78 10 V30 Q78 36 72 36 H8 Q2 36 2 30 V10 Q2 4 8 4Z" fill="url(#p)" stroke="#3c3c3c" stroke-width="2.2"/>
    <path d="M9 8 H71 Q74 8 74 11 V29 Q74 32 71 32 H9 Q6 32 6 29 V11 Q6 8 9 8Z" fill="none" stroke="#666" stroke-width="1.1"/>
    <text x="40" y="19" text-anchor="middle" font-family="serif" font-weight="bold" font-size="8.4" letter-spacing="0.6" fill="#333">HOROLOGICAL</text>
    <text x="40" y="28.6" text-anchor="middle" font-family="serif" font-weight="bold" font-size="6.6" letter-spacing="1" fill="#333">No. 1859 * LONDON</text>
    <circle cx="9" cy="10" r="1.6" fill="#888" stroke="#333" stroke-width="0.7"/><circle cx="71" cy="10" r="1.6" fill="#888" stroke="#333" stroke-width="0.7"/>
    <circle cx="9" cy="30" r="1.6" fill="#888" stroke="#333" stroke-width="0.7"/><circle cx="71" cy="30" r="1.6" fill="#888" stroke="#333" stroke-width="0.7"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "clockworkOwl", paintSize: 2048 });
  const random = rng(11);

  const PY = 0.062; // perch pipe axis height
  const PR = 0.012; // perch pipe radius
  const RT = PR + 0.0055; // toe path radius around the pipe

  const plateTex = [plateCard(0), plateCard(1), plateCard(2)];

  // ------------------------------------------------------------------------------------------------ Skeleton
  const perch = b.joint("perch", { at: [0, 0, 0], group: "perch" });
  const hips = b.joint("hips", { parent: perch, at: [0, 0.14, -0.03], dir: [0, 1, 0.2], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.14, -0.03],
      [0, 0.19, -0.012],
      [0, 0.245, 0.01],
      [0, 0.3, 0.035],
    ],
    { parent: hips, role: "spine", group: "body" },
  );
  const chest = spine.joints[1];
  const upper = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 0.3, 0.035],
      [0, 0.318, 0.043],
      [0, 0.335, 0.05],
    ],
    { parent: upper, role: "neck", group: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, 1, 0.35], role: "head", group: "head" });

  // ------------------------------------------------------------------------------------------------ Perch
  const hex = (r: number, len: number, at: Vector3, dir: Vector3, color: Fill = OLD) =>
    b.part(new CylinderGeometry(r, r, len, 6), color, { bone: perch, at, dir, group: "perch" });

  // base: a squat octagonal flange, with an engraved scroll ring laid on it and eight bolts
  b.lathe(
    [
      [0, 0],
      [0.078, 0],
      [0.078, 0.009],
      [0.07, 0.014],
      [0.03, 0.0165],
      [0.024, 0.03],
      [0, 0.03],
    ],
    { at: [0, 0, 0], bone: perch, segments: 8, spin: 22.5, color: OLD, group: "perch" },
  );
  b.part(new PlaneGeometry(0.128, 0.128), "#d9b25e", {
    bone: perch,
    at: [0, 0.0172, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: SCROLL_RING,
    group: "perch",
  });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU;
    hex(0.0058, 0.006, V(Math.sin(a) * 0.056, 0.0175, Math.cos(a) * 0.056), V(0, 1, 0), POL);
  }
  // pipe: stem, unions, T and end plugs
  b.rod([0, 0.02, 0], [0, PY, 0], PR, { bone: perch, color: OLD, sides: 12, group: "perch" });
  hex(0.019, 0.012, V(0, 0.041, 0), V(0, 1, 0), MID);
  b.part(new CylinderGeometry(0.0175, 0.0175, 0.004, 12), POL, { bone: perch, at: [0, 0.033, 0], group: "perch" });
  b.part(new CylinderGeometry(0.0175, 0.0175, 0.004, 12), POL, { bone: perch, at: [0, 0.049, 0], group: "perch" });
  b.rod([-0.255, PY, 0], [0.255, PY, 0], PR, { bone: perch, color: OLD, sides: 12, group: "perch" });
  for (const s of [1, -1]) {
    hex(0.0175, 0.02, V(s * 0.12, PY, 0), V(1, 0, 0), MID);
    b.part(new CylinderGeometry(0.0185, 0.0185, 0.004, 12), POL, {
      bone: perch,
      at: [s * 0.135, PY, 0],
      dir: [1, 0, 0],
      group: "perch",
    });
    b.part(new CylinderGeometry(0.0185, 0.0185, 0.004, 12), POL, {
      bone: perch,
      at: [s * 0.105, PY, 0],
      dir: [1, 0, 0],
      group: "perch",
    });
    hex(0.0165, 0.016, V(s * 0.258, PY, 0), V(1, 0, 0), POL);
    // a flange with four bolts at the ends
    b.part(new CylinderGeometry(0.0185, 0.0185, 0.005, 12), MID, {
      bone: perch,
      at: [s * 0.24, PY, 0],
      dir: [1, 0, 0],
      group: "perch",
    });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU + Math.PI / 4;
      hex(0.0028, 0.007, V(s * 0.24, PY + Math.sin(a) * 0.0145, Math.cos(a) * 0.0145), V(1, 0, 0), POL);
    }
  }

  // ------------------------------------------------------------------------------------------------ Owl helpers
  /** A frame on a surface point: origin, outward normal, and the in-plane up and left directions, for laying things out flat. */
  const surfaceBasis = (at: Vector3, n: Vector3) => {
    const up = V(0, 1, 0).addScaledVector(n, -n.y).normalize();
    const left = new Vector3().crossVectors(up, n).normalize();
    const place = (x: number, y: number, h: number) =>
      at.clone().addScaledVector(left, x).addScaledVector(up, y).addScaledVector(n, h);
    return { up, left, place };
  };

  /** A flat plate of the coat's own kind on a joint: extruded shield, engraved by its paint. */
  const plateAt = (o: {
    name: string;
    bone: JointRef;
    at: Vector3;
    d: Vector3;
    up: Vector3;
    L: number;
    w: number;
    color: Fill;
    group: string;
    thick?: number;
    profile?: readonly (readonly [number, number])[];
  }) => {
    const d = o.d.clone().normalize();
    const N = o.up.clone().addScaledVector(d, -o.up.dot(d)).normalize();
    const y = new Vector3().crossVectors(N, d).normalize();
    return b.extrude(plateOutline(o.L, o.w, o.profile ?? PROFILE), {
      at: o.at,
      x: d,
      y,
      thickness: o.thick ?? 0.0026,
      smoothing: 1,
      color: o.color,
      bone: o.bone,
      group: o.group,
      name: o.name,
    });
  };

  // ------------------------------------------------------------------------------------------------ Torso
  // Dark blued-iron chassis under the coat; the brass plates ride on it and the gaps read as machinery.
  const torso = b.loft(
    [
      { at: [0, 0.128, -0.02], w: 0.1, h: 0.11 },
      { at: [0, 0.165, -0.012], w: 0.155, h: 0.15 },
      { at: [0, 0.215, 0.0], w: 0.175, h: 0.165 },
      { at: [0, 0.265, 0.02], w: 0.165, h: 0.15 },
      { at: [0, 0.305, 0.038], w: 0.12, h: 0.1 },
      { at: [0, 0.335, 0.05], w: 0.085, h: 0.08 },
    ],
    { bone: [spine, neck], color: FE, sides: 12, group: "body" },
  );
  const skin = b.surface(torso);
  const front = (y: number, x = 0) => skin.ray([x, y, 0.5], [0, 0, -1])!;
  const backHit = (y: number, x = 0) => skin.ray([x, y, -0.5], [0, 0, 1])!;

  // Chest movement: a brass case, a floor of dark iron, gears in layers, a mainspring.
  const chestHit = front(0.212);
  const cb = surfaceBasis(chestHit.at, chestHit.axis);
  const cn = chestHit.axis;
  const CASE_R = 0.037;
  b.lathe(
    [
      [0, 0.001],
      [0.033, 0.001],
      [0.033, 0.01],
      [0.036, 0.0135],
      [0.041, 0.0135],
      [0.041, -0.025],
      [0, -0.025],
    ],
    { at: chestHit.at, axis: cn, segments: 16, color: MID, bone: chest, group: "chestMovement" },
  );
  b.part(new CylinderGeometry(0.033, 0.033, 0.002, 16), FE, {
    bone: chest,
    at: cb.place(0, 0, 0.0018),
    dir: cn,
    group: "chestMovement",
  });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU;
    b.part(new SphereGeometry(0.0021, 6, 4), POL, {
      bone: chest,
      at: cb.place(Math.sin(a) * 0.0385, Math.cos(a) * 0.0385, 0.0138),
      scale: [1, 1, 0.7],
      group: "chestMovement",
    });
  }

  const gear = (
    name: string,
    parent: JointRef,
    at: Vector3,
    n: Vector3,
    up: Vector3,
    r: number,
    tex: Texture,
    tint: string,
    group: string,
    pin = true,
  ) => {
    const joint = b.joint(name, { parent, at, dir: n, group });
    b.part(new PlaneGeometry((2 * r * 50) / 48, (2 * r * 50) / 48), tint, {
      bone: joint,
      at,
      dir: n,
      axis: "z",
      up,
      texture: tex,
      group,
    });
    if (pin)
      b.part(new CylinderGeometry(r * 0.13, r * 0.13, 0.004, 8), POL, {
        bone: joint,
        at: at.clone().addScaledVector(n, 0.0018),
        dir: n,
        group,
      });
    return joint;
  };
  const cg = (name: string, x: number, y: number, h: number, r: number, tex: Texture, tint: string) =>
    gear(name, chest, cb.place(x, y, h), cn, cb.up, r, tex, tint, "chestMovement");
  cg("gearChestBig", 0, 0, 0.0038, 0.03, GEAR_FINE, "#5d5a63");
  cg("gearChestA", -0.0105, 0.0055, 0.0064, 0.0175, GEAR_MID, "#e0b45a");
  cg("gearChestB", 0.0135, -0.0085, 0.0064, 0.0135, GEAR_SMALL, "#d07a4a");
  cg("gearChestC", 0.0125, 0.0155, 0.0092, 0.0082, GEAR_CROSS, "#f0cf70");
  cg("gearChestD", -0.0175, -0.0135, 0.0092, 0.0095, GEAR_SMALL, "#e0b45a");
  // Mainspring: a flat coil over the middle of the gears, on its own arbor.
  const springJoint = b.joint("mainspring", {
    parent: chest,
    at: cb.place(0, 0, 0.0118),
    dir: cn,
    group: "chestMovement",
  });
  {
    const c = cb.place(0, 0, 0.0118);
    const pts: Vector3[] = [];
    for (let i = 0; i <= 44; i++) {
      const a = (i / 44) * 3.4 * TAU;
      const r = 0.0034 + (0.0128 - 0.0034) * (i / 44);
      pts.push(
        c
          .clone()
          .addScaledVector(cb.left, Math.cos(a) * r)
          .addScaledVector(cb.up, Math.sin(a) * r),
      );
    }
    b.sweep(catmull(pts), 0.00095, { bone: springJoint, color: STEEL, sides: 4, group: "chestMovement" });
    b.part(new CylinderGeometry(0.0038, 0.0038, 0.009, 8), POL, {
      bone: springJoint,
      at: c.clone().addScaledVector(cn, -0.0035),
      dir: cn,
      group: "chestMovement",
    });
  }

  // Gauges: cans on the chest with a dial, bezel and needle.
  const gauge = (
    name: string,
    parent: JointRef,
    hit: { at: Vector3; axis: Vector3 },
    r: number,
    needleDeg: number,
    group: string,
    bone: JointRef,
  ) => {
    const gb = surfaceBasis(hit.at, hit.axis);
    const n = hit.axis;
    b.lathe(
      [
        [0, -0.012],
        [r * 1.12, -0.012],
        [r * 1.12, 0.008],
        [0, 0.008],
      ],
      { at: hit.at, axis: n, segments: 12, color: MID, bone, group },
    );
    b.part(new CircleGeometry(r * 0.96, 16), "#ffffff", {
      bone,
      at: gb.place(0, 0, 0.0091),
      dir: n,
      axis: "z",
      up: gb.up,
      texture: DIAL,
      group,
    });
    b.part(new TorusGeometry(r * 1.02, r * 0.14, 5, 14), POL, {
      bone,
      at: gb.place(0, 0, 0.0085),
      dir: n,
      axis: "z",
      group,
    });
    const needle = b.joint(name, { parent, at: gb.place(0, 0, 0.0096), dir: n, group });
    const v = gb.up.clone().applyAxisAngle(n, -needleDeg * DEG);
    b.part(new CylinderGeometry(r * 0.05, r * 0.05, r * 0.95, 4), "#1c1210", {
      bone: needle,
      at: gb.place(0, 0, 0.0096).addScaledVector(v, r * 0.4),
      dir: v,
      group,
    });
    b.part(new CylinderGeometry(r * 0.16, r * 0.16, 0.002, 8), POL, {
      bone: needle,
      at: gb.place(0, 0, 0.0106),
      dir: n,
      group,
    });
  };
  const gaugeA = front(0.272, 0.056);
  const gaugeB = front(0.178, -0.06);
  gauge("needleChestA", chest, gaugeA, 0.0165, 55, "gauges", upper);
  gauge("needleChestB", chest, gaugeB, 0.0125, -35, "gauges", chest);

  // Copper pipes between the case, the gauges and round the flank, on the chest surface, with hex couplings.
  const pipeSweeps = [] as { at: (t: number) => Vector3 }[];
  const pipe = (through: Vector3[], color: Fill, r: number, couplings: number, bone: typeof chest) => {
    const path = skin.drape(catmull(through), { lift: 0.014 });
    const tube = b.sweep(path, r, { color, sides: 6, bone, group: "pipes" });
    pipeSweeps.push({ at: (t) => path.at(t) });
    b.along(path, couplings, (at) => {
      b.stick(new CylinderGeometry(r * 1.9, r * 1.9, r * 2.6, 6), POL, at, { embed: 0.5, bone, group: "pipes" });
    });
    return tube;
  };
  {
    const s1 = front(0.245, 0.03);
    const s2 = front(0.262, 0.046);
    pipe([s1.at, s2.at, gaugeA.at.clone().add(V(-0.012, -0.01, 0))], COP, 0.0028, 2, upper);
    const t1 = front(0.19, -0.037);
    const t2 = front(0.18, -0.048);
    pipe([t1.at, t2.at, gaugeB.at.clone().add(V(0.012, 0.005, 0))], COP, 0.0028, 2, chest);
    // a long run from the case round the right flank to the back
    pipe(
      [
        front(0.222, -0.038).at,
        front(0.235, -0.065).at,
        skin.ray([-0.5, 0.235, 0.015], [1, 0, 0])!.at,
        backHit(0.232, -0.065).at,
        backHit(0.225, -0.03).at,
      ],
      OLD,
      0.0034,
      4,
      chest,
    );
  }
  const shoulderDrumAt = (s: number) => V(s * 0.095, 0.278, 0);
  const keyHit = backHit(0.222);
  const exhaustAt = (s: number) => backHit(0.268, s * 0.045).at;

  // Coat: drawn brass plates scattered over the chassis, leaving the movement, gauges and pipes clear.
  {
    const pipePts: Vector3[] = [];
    for (const p of pipeSweeps) for (let i = 0; i <= 16; i++) pipePts.push(p.at(i / 16));
    const clear = (h: { at: Vector3 }) => {
      if (h.at.distanceTo(chestHit.at) < CASE_R + 0.02) return false;
      if (h.at.distanceTo(gaugeA.at) < 0.032 || h.at.distanceTo(gaugeB.at) < 0.028) return false;
      for (const s of [1, -1]) {
        const d = shoulderDrumAt(s);
        if (Math.hypot(h.at.x - d.x, h.at.y - d.y) < 0.04 && h.at.z < 0.045) return false;
      }
      for (const p of pipePts) if (h.at.distanceTo(p) < 0.016) return false;
      if (h.at.distanceTo(keyHit.at) < 0.032) return false;
      for (const s of [1, -1]) if (h.at.distanceTo(exhaustAt(s)) < 0.03) return false;
      return true;
    };
    const hits = skin.scatter(300, { rng: rng(3), minDist: 0.0225, filter: clear });
    b.cards(hits, plateTex, {
      size: [0.036, 0.05],
      lean: 66,
      bend: 14,
      flow: [0, -1, 0],
      vary: 0.14,
      spin: 7,
      rng: random,
      color: COAT,
      group: "coat",
    });
  }

  // Maker's plaque on the belly and a plain brass throat collar.
  {
    const ph = front(0.145, 0);
    const pb = surfaceBasis(ph.at, ph.axis);
    b.part(new PlaneGeometry(0.036, 0.018), "#e6bd62", {
      bone: hips,
      at: pb.place(0, 0, 0.003),
      dir: ph.axis,
      axis: "z",
      up: pb.up,
      texture: PLAQUE,
      group: "body",
      name: "plaque",
    });
  }

  // Winding key on the back: a hex boss, a stem and a butterfly bow, all on a joint that turns.
  {
    const kh = backHit(0.222);
    const kb = surfaceBasis(kh.at, kh.axis);
    const n = kh.axis;
    b.lathe(
      [
        [0, -0.01],
        [0.0135, -0.01],
        [0.0135, 0.004],
        [0.008, 0.006],
        [0, 0.006],
      ],
      { at: kh.at, axis: n, segments: 6, color: MID, bone: chest, group: "key" },
    );
    const key = b.joint("windingKey", { parent: chest, at: kb.place(0, 0, 0.005), dir: n, group: "key" });
    b.part(new CylinderGeometry(0.0034, 0.0034, 0.03, 8), POL, {
      bone: key,
      at: kb.place(0, 0, 0.02),
      dir: n,
      group: "key",
    });
    for (const s of [1, -1])
      b.extrude(
        [
          [0, -0.004],
          [0.011, -0.011],
          [0.024, -0.011],
          [0.03, 0.0],
          [0.025, 0.012],
          [0.012, 0.014],
          [0, 0.004],
        ],
        {
          at: kb.place(0, 0, 0.0345),
          x: kb.left.clone().multiplyScalar(s),
          y: kb.up,
          thickness: 0.004,
          smoothing: 1,
          color: POL,
          bone: key,
          group: "key",
        },
      );
    b.part(new SphereGeometry(0.0055, 8, 6), MID, { bone: key, at: kb.place(0, 0, 0.0345), group: "key" });
  }
  // Two exhaust stacks at the shoulders of the back.
  for (const s of [1, -1]) {
    const eh = backHit(0.268, s * 0.045);
    const base = eh.at;
    const out = [base, base.clone().add(V(s * 0.004, 0.026, -0.018)), base.clone().add(V(s * 0.012, 0.05, -0.024))];
    b.sweep(catmull(out), 0.0048, { color: COP, sides: 6, bone: upper, group: "pipes" });
    b.lathe(
      [
        [0, 0],
        [0.0075, 0],
        [0.0115, 0.01],
        [0.0105, 0.011],
        [0.0065, 0.004],
        [0, 0.004],
      ],
      { at: out[2], axis: [s * 0.15, 1, -0.2], segments: 8, color: POL, bone: upper, group: "pipes" },
    );
    b.part(new CylinderGeometry(0.0095, 0.0095, 0.006, 6), MID, {
      bone: upper,
      at: base.clone().add(V(s * 0.002, 0.008, -0.006)),
      dir: [0, 1, 0],
      group: "pipes",
    });
  }

  // ------------------------------------------------------------------------------------------------ Neck
  b.sweep(neck, [0.036, 0.034, 0.03], { color: OLD, sides: 10, group: "neck" });
  {
    const collar0 = b.ring(neck.at(0.02), { count: 18, radius: 0.058 }, () => undefined);
    b.cards(collar0.items, plateTex, {
      size: [0.036, 0.046],
      lean: 60,
      bend: 12,
      flow: [0, -1, 0],
      vary: 0.1,
      rng: random,
      color: COAT,
      group: "coat",
    });
    const collar = b.ring(neck.at(0.35), { count: 16, radius: 0.043 }, () => undefined);
    b.cards(collar.items, plateTex, {
      size: [0.03, 0.038],
      lean: 48,
      bend: 12,
      flow: [0, -1, 0],
      vary: 0.1,
      rng: random,
      color: COAT,
      group: "coat",
    });
    const collar2 = b.ring(neck.at(0.78), { count: 14, radius: 0.04 }, () => undefined);
    b.cards(collar2.items, plateTex, {
      size: [0.028, 0.034],
      lean: 40,
      bend: 12,
      flow: [0, -1, 0],
      vary: 0.1,
      rng: random,
      color: COAT,
      group: "coat",
    });
  }

  // ------------------------------------------------------------------------------------------------ Head
  const HY = 0.365;
  const HZ = 0.06;
  const H = (x: number, y: number, z: number) => V(x, HY + y, HZ + z);
  const skull = b.part(new SphereGeometry(1, 14, 10), MID, {
    bone: head,
    at: H(0, 0, 0),
    scale: [0.07, 0.05, 0.058],
    group: "head",
    name: "skull",
  });
  // Clockwork crown: a gear drum between the tufts.
  {
    const c = H(0, 0.046, 0.004);
    b.lathe(
      [
        [0, -0.01],
        [0.0225, -0.01],
        [0.0225, 0.005],
        [0.019, 0.0072],
        [0, 0.0072],
      ],
      { at: c, axis: [0, 1, 0], segments: 10, color: POL, bone: head, group: "head" },
    );
    gear(
      "gearCrown",
      head,
      c.clone().add(V(0, 0.0081, 0)),
      V(0, 1, 0),
      V(0, 0, 1),
      0.0175,
      GEAR_MID,
      "#c08a3a",
      "head",
      false,
    );
  }

  const gaze = (s: number) => V(s * 0.22, -0.03, 1).normalize();
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const a = gaze(s);
    const D = H(s * 0.036, -0.002, 0.047);
    const db = surfaceBasis(D, a);
    // facial disc: a dished copper plate with a rolled brass rim, engraved with concentric rules and rays
    const discPaint = paint((p, n) => {
      const d = p.clone().sub(D);
      const along = d.dot(a);
      const radial = d.addScaledVector(a, -along);
      const r = radial.length();
      const ang = Math.atan2(radial.dot(db.left), radial.dot(db.up));
      let c: Rgb = resolve(COP, p, n);
      if (r > 0.029) c = resolve(POL, p, n);
      let ink = 0;
      for (const ring of [0.0235, 0.0295, 0.0325]) if (Math.abs(r - ring) < 0.00042) ink = 1;
      if (r > 0.0245 && r < 0.0288 && fract((ang / TAU) * 40) < 0.16) ink = 0.8;
      if (r > 0.02 && r < 0.0235 && fract((ang / TAU) * 20 + 0.5) < 0.1) ink = 0.7;
      return ink ? mix(c, INK, ink * 0.75) : c;
    });
    b.lathe(
      [
        [0, -0.01],
        [0.037, -0.01],
        [0.037, 0.008],
        [0.033, 0.012],
        [0.028, 0.008],
        [0.016, 0.003],
        [0, 0.002],
      ],
      { at: D, axis: a, segments: 16, color: discPaint, bone: head, group: "head", name: `disc${side}` },
    );
    // lens eye: glass ball drawn with an iris, in a polished bezel, under a hinged lid
    const eyeC = D.clone().addScaledVector(a, 0.0075);
    b.part(new SphereGeometry(0.0172, 10, 8), "#ffffff", {
      bone: head,
      at: eyeC,
      dir: a,
      texture: EYE,
      group: "head",
      name: `eye${side}`,
    });
    b.part(new TorusGeometry(0.0182, 0.0032, 5, 14), POL, {
      bone: head,
      at: D.clone().addScaledVector(a, 0.0045),
      dir: a,
      axis: "z",
      group: "head",
    });
    const lid = b.joint(`lid${side}`, { parent: head, at: eyeC, dir: [0, 1, 0], role: "hinge", group: "head" });
    b.part(new SphereGeometry(0.0225, 10, 5, 0, TAU, 0, Math.PI / 2), MID, {
      bone: lid,
      at: eyeC,
      dir: [0, 1, 0],
      group: "head",
      name: `lidShell${side}`,
    });
    b.pose(lid, { axis: [1, 0, 0], deg: -55 });
    // brow band with rivets
    b.sweep(
      catmull([
        H(s * 0.006, 0.043, 0.056),
        H(s * 0.03, 0.053, 0.05),
        H(s * 0.057, 0.045, 0.037),
        H(s * 0.069, 0.022, 0.02),
      ]),
      0.0045,
      {
        bone: head,
        color: POL,
        sides: 6,
        group: "head",
      },
    );
    for (const [x, y, z] of [
      [0.022, 0.0518, 0.053],
      [0.042, 0.0508, 0.046],
      [0.06, 0.037, 0.03],
    ])
      b.part(new SphereGeometry(0.0033, 6, 4), COP, { bone: head, at: H(s * x, y, z), group: "head" });

    // ear tuft: a hinged socket with a gear, and three tall engraved plates fanned about it
    const base = H(s * 0.042, 0.043, -0.004);
    const d0 = V(s * 0.3, 1, -0.16).normalize();
    const ear = b.joint(`ear${side}`, { parent: head, at: base, dir: d0, role: "hinge", group: "ears" });
    b.part(new CylinderGeometry(0.0115, 0.0115, 0.012, 8), MID, { bone: ear, at: base, dir: [s, 0, 0], group: "ears" });
    b.part(new CylinderGeometry(0.0035, 0.0035, 0.016, 6), POL, { bone: ear, at: base, dir: [s, 0, 0], group: "ears" });
    const tuftUp = V(s * 0.6, 0, 1);
    [
      [0, 0.08, 0.0145, 0, 0.0],
      [s * 14, 0.066, 0.013, 1, 0.0025],
      [-s * 11, 0.054, 0.0115, 2, 0.0025],
    ].forEach(([yaw, L, w, kind, lift], i) => {
      const d = d0
        .clone()
        .applyAxisAngle(V(0, 1, 0), yaw * DEG)
        .normalize();
      plateAt({
        name: `tuft${side}${i + 1}`,
        bone: ear,
        at: base
          .clone()
          .addScaledVector(d0, 0.004)
          .addScaledVector(tuftUp.clone().normalize(), i * 0.0026 + lift),
        d,
        up: tuftUp,
        L,
        w,
        color: plate(L, w, i === 1 ? COP : POL, BLUED, kind, TUFT, false),
        group: "ears",
        thick: 0.0024,
        profile: TUFT,
      });
    });
    gear(
      `gearEar${side}`,
      ear,
      base.clone().addScaledVector(V(s, 0, 0), 0.0068),
      V(s, 0, 0),
      V(0, 1, 0),
      0.0092,
      GEAR_SMALL,
      "#f0cf70",
      "ears",
      false,
    );
  }

  // Beak: a hooked dark upper on the head, a separate lower on the jaw.
  b.sweep(
    catmull([H(0, -0.004, 0.047), H(0, -0.005, 0.07), H(0, -0.014, 0.085), H(0, -0.034, 0.091)]),
    (t) => [0.0125 * (1 - t) + 0.0012, 0.0115 * (1 - t) + 0.0012],
    {
      bone: head,
      color: FE,
      sides: 6,
      caps: { start: "flat", end: "point" },
      group: "beak",
      name: "beakUpper",
    },
  );
  b.part(new CylinderGeometry(0.0138, 0.0138, 0.005, 8), POL, {
    bone: head,
    at: H(0, -0.0045, 0.05),
    dir: [0, 0, 1],
    group: "beak",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H(0, -0.018, 0.043),
    aim: H(0, -0.028, 0.09),
    role: "jaw",
    group: "beak",
  });
  b.sweep(
    catmull([H(0, -0.019, 0.047), H(0, -0.026, 0.07), H(0, -0.031, 0.086)]),
    (t) => [0.0092 * (1 - t) + 0.0012, 0.006 * (1 - t) + 0.0012],
    {
      bone: jaw,
      color: FE,
      sides: 6,
      caps: { start: "flat", end: "point" },
      group: "beak",
      name: "beakLower",
    },
  );
  b.pose(jaw, { axis: jaw.dir([1, 0, 0]), deg: 7 });

  // Cheek and crown plates: cards over the skull, clear of the facial discs, the crown drum and the tufts.
  {
    const skullSkin = b.surface(skull);
    const hits = skullSkin.scatter(80, {
      rng: rng(5),
      minDist: 0.019,
      filter: (h) =>
        h.at.z < HZ + 0.03 &&
        Math.hypot(h.at.x, h.at.z - (HZ + 0.004)) > 0.03 &&
        Math.hypot(Math.abs(h.at.x) - 0.042, h.at.z - (HZ - 0.004)) > 0.02,
    });
    b.cards(hits, plateTex, {
      size: [0.03, 0.038],
      lean: 62,
      bend: 12,
      vary: 0.1,
      spin: 6,
      rng: random,
      color: COAT,
      group: "coat",
    });
  }

  // ------------------------------------------------------------------------------------------------ Wings
  // Half open: raised from the body with the feathers fanned outward and down, showing the drum, spring and spars.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const S = V(s * 0.095, 0.278, 0);
    const E = V(s * 0.165, 0.3, -0.055);
    const W = V(s * 0.225, 0.255, -0.04);
    const Ht = V(s * 0.268, 0.234, -0.062);
    const wing = `wing${side}`;
    const arm = b.chain(wing, [S, E, W, Ht], {
      parent: upper,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
      group: wing,
    });
    const [shoulder, elbow, wrist] = arm.joints;
    const armTube = b.sweep(arm, [0.0125, 0.011, 0.009, 0.005], { color: OLD, sides: 8, group: wing });

    // shoulder drum with a turning gear on each face
    b.lathe(
      [
        [0, 0],
        [0.026, 0],
        [0.0285, 0.0035],
        [0.0285, 0.0465],
        [0.026, 0.05],
        [0, 0.05],
      ],
      { at: S.clone().add(V(0, 0, -0.025)), axis: [0, 0, 1], segments: 12, color: MID, bone: shoulder, group: wing },
    );
    gear(
      `gearShoulder${side}`,
      shoulder,
      S.clone().add(V(0, 0, 0.0262)),
      V(0, 0, 1),
      V(0, 1, 0),
      0.0225,
      GEAR_BIG,
      s > 0 ? "#e2b45a" : "#d8895a",
      wing,
    );
    gear(
      `gearShoulderBack${side}`,
      shoulder,
      S.clone().add(V(0, 0, -0.0262)),
      V(0, 0, -1),
      V(0, 1, 0),
      0.0225,
      GEAR_CROSS,
      s > 0 ? "#d8895a" : "#e2b45a",
      wing,
    );
    // elbow and wrist housings
    for (const [j, at, r] of [
      [elbow, E, 0.0145],
      [wrist, W, 0.0125],
    ] as const) {
      b.part(new SphereGeometry(r, 8, 6), MID, { bone: j, at, group: wing });
      b.part(new CylinderGeometry(r * 0.42, r * 0.42, r * 2.6, 6), POL, { bone: j, at, dir: [0, 0, 1], group: wing });
    }
    // exposed spring coiled around the upper arm
    {
      const axis = E.clone().sub(S).normalize();
      const u = new Vector3().crossVectors(axis, V(0, 1, 0)).normalize();
      const v = new Vector3().crossVectors(axis, u).normalize();
      const pts: Vector3[] = [];
      const turns = 6;
      const N = turns * 8;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const a = t * turns * TAU;
        pts.push(
          S.clone()
            .lerp(E, 0.2 + 0.58 * t)
            .addScaledVector(u, Math.cos(a) * 0.0185)
            .addScaledVector(v, Math.sin(a) * 0.0185),
        );
      }
      b.sweep(polyline(pts), 0.0018, { bone: shoulder, color: STEEL, sides: 4, group: wing });
    }
    // steam pipe along the leading edge
    b.sweep(
      catmull([
        S.clone().add(V(0, 0.03, 0.01)),
        S.clone()
          .lerp(E, 0.5)
          .add(V(0, 0.032, 0.014)),
        E.clone().add(V(0, 0.024, 0.012)),
        E.clone()
          .lerp(W, 0.6)
          .add(V(0, 0.015, 0.008)),
      ]),
      0.0034,
      {
        bone: shoulder,
        color: COP,
        sides: 6,
        group: wing,
      },
    );

    // feather fan: plates on their own joints
    const dOut = V(s, 0.08, -0.15).normalize();
    const back0 = V(0, -1, -0.8);
    const back = back0.clone().addScaledVector(dOut, -back0.dot(dOut)).normalize();
    let Nw = new Vector3().crossVectors(dOut, back).normalize();
    if (Nw.y < 0) Nw.negate();
    const dirAt = (deg: number) =>
      dOut
        .clone()
        .multiplyScalar(Math.cos(deg * DEG))
        .addScaledVector(back, Math.sin(deg * DEG))
        .normalize();
    const PL = [0.11, 0.14, 0.15, 0.15, 0.14, 0.13, 0.12];
    for (let i = 0; i < 7; i++) {
      const d = dirAt(i * 10);
      const root = Ht.clone()
        .lerp(W, i / 6)
        .addScaledVector(Nw, 0.004 + i * 0.0026);
      const fj = b.joint(`primary${i + 1}${side}`, { parent: wrist, at: root, dir: d, role: "digit", group: wing });
      plateAt({
        name: `primary${i + 1}${side}`,
        bone: fj,
        at: root,
        d,
        up: Nw,
        L: PL[i],
        w: 0.019,
        color: plate(PL[i], 0.019, i % 2 ? MID : POL, BLUED, i % 3),
        group: wing,
      });
    }
    for (let k = 0; k < 6; k++) {
      const d = dirAt(70 + k * 7.5);
      const root = W.clone()
        .lerp(E, (k + 0.5) / 6.5)
        .addScaledVector(Nw, 0.02 + k * 0.0026);
      const L = 0.145 - k * 0.004;
      const fj = b.joint(`secondary${k + 1}${side}`, { parent: elbow, at: root, dir: d, role: "digit", group: wing });
      plateAt({
        name: `secondary${k + 1}${side}`,
        bone: fj,
        at: root,
        d,
        up: Nw,
        L,
        w: 0.02,
        color: plate(L, 0.02, k % 2 ? POL : COP, FE, (k + 1) % 3),
        group: wing,
      });
    }
    // covert plates over the arm
    {
      const hits = b.surface(armTube).scatter(16, {
        rng: rng(30 + (s > 0 ? 0 : 1)),
        minDist: 0.017,
        filter: (h) => h.n.y > -0.2,
      });
      b.cards(hits, plateTex, {
        size: [0.03, 0.04],
        lean: 66,
        bend: 12,
        flow: back,
        vary: 0.1,
        spin: 6,
        rng: random,
        color: COAT,
        group: wing,
      });
    }
  }

  // ------------------------------------------------------------------------------------------------ Tail
  {
    const R = V(0, 0.147, -0.078);
    b.part(new SphereGeometry(0.0155, 8, 6), MID, { bone: hips, at: R, group: "tail" });
    const d0 = V(0, -0.6, -1).normalize();
    for (let i = 0; i < 5; i++) {
      const yaw = (i - 2) * 15;
      const d = d0
        .clone()
        .applyAxisAngle(V(0, 1, 0), yaw * DEG)
        .normalize();
      const tj = b.joint(`tail${i + 1}`, { parent: hips, at: R, dir: d, role: "tail", group: "tail" });
      const L = 0.155 - Math.abs(i - 2) * 0.008;
      plateAt({
        name: `tail${i + 1}`,
        bone: tj,
        at: R.clone().addScaledVector(V(0, 1, 0), 0.006 + i * 0.0026),
        d,
        up: V(0, 1, 0),
        L,
        w: 0.026,
        color: plate(L, 0.026, i % 2 ? COP : POL, FE, [1, 0, 2, 0, 1][i]),
        group: "tail",
      });
    }
    b.part(new CylinderGeometry(0.0075, 0.0075, 0.05, 8), POL, { bone: hips, at: R, dir: [1, 0, 0], group: "tail" });
  }

  // ------------------------------------------------------------------------------------------------ Legs and talons
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const x = s * 0.046;
    const foot = V(x, PY + RT, 0);
    const pts = limb(
      V(x, 0.178, -0.006),
      foot,
      [0.04, 0.035, 0.028],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [x, PY + PR, 0],
      group: `leg${side}`,
    });
    const legTube = b.sweep(leg, [0.021, 0.0165, 0.0125, 0.0105], { color: OLD, sides: 8, group: `leg${side}` });
    const ankle = leg.joints[2];
    b.cards(
      b.surface(legTube).scatter(10, { rng: rng(50 + (s > 0 ? 0 : 1)), minDist: 0.013, filter: (h) => h.at.y > 0.107 }),
      plateTex,
      {
        size: [0.026, 0.034],
        lean: 70,
        bend: 10,
        flow: [0, -1, 0],
        vary: 0.1,
        rng: random,
        color: COAT,
        group: `leg${side}`,
      },
    );
    // four toes wrapped over the pipe: three forward, one back; a talon at each tip
    const toes = [
      { dx: -0.011, fwd: 1 },
      { dx: 0, fwd: 1 },
      { dx: 0.011, fwd: 1 },
      { dx: 0, fwd: -1 },
    ];
    toes.forEach(({ dx, fwd }, idx) => {
      const deg = [4, 42, 82, 118];
      const at = (a: number) => {
        const th = fwd * a * DEG;
        return V(x + dx * (0.6 + (0.5 * a) / 118), PY + RT * Math.cos(th), RT * Math.sin(th));
      };
      const toe = b.chain(`toe${side}${idx + 1}`, catmull(deg.map(at)), {
        parent: ankle,
        names: (i) => `toe${side}${idx + 1}_${i + 1}`,
        role: "digit",
        group: `leg${side}`,
      });
      b.sweep(toe, [0.0068, 0.0052, 0.0038], { color: MID, sides: 6, caps: { end: "round" }, group: `leg${side}` });
      const th = fwd * 118 * DEG;
      const tang = V(0, -Math.sin(th), Math.cos(th)).multiplyScalar(fwd);
      const inward = V(0, -Math.cos(th), -Math.sin(th));
      const talon = tang.multiplyScalar(0.85).addScaledVector(inward, 0.55).normalize();
      b.spike(at(118), talon, 0.02, 0.0042, { bone: toe.joints[2], color: FE, sides: 5, group: `leg${side}` });
    });
  }

  // ------------------------------------------------------------------------------------------------ Perch fittings
  {
    // gauge on the front of the pipe, valve wheel on the back
    b.rod([0, 0.036, 0.008], [0, 0.036, 0.038], 0.0062, { bone: perch, color: COP, sides: 6, group: "perch" });
    gauge(
      "needlePerch",
      perch,
      { at: V(0, 0.04, 0.046), axis: V(0, 0.32, 0.95).normalize() },
      0.0215,
      50,
      "perch",
      perch,
    );
    b.rod([0, 0.036, -0.008], [0, 0.036, -0.034], 0.0062, { bone: perch, color: COP, sides: 6, group: "perch" });
    hex(0.009, 0.012, V(0, 0.036, -0.036), V(0, 0, 1), MID);
    const wheel = b.joint("valveWheel", { parent: perch, at: [0, 0.038, -0.046], dir: [0, 0, -1], group: "perch" });
    b.part(new TorusGeometry(0.016, 0.0026, 5, 14), FE, {
      bone: wheel,
      at: [0, 0.038, -0.046],
      dir: [0, 0, -1],
      axis: "z",
      group: "perch",
    });
    for (const rot of [0, 60, 120])
      b.part(new CylinderGeometry(0.0018, 0.0018, 0.032, 4), FE, {
        bone: wheel,
        at: [0, 0.038, -0.046],
        rotation: [0, 0, rot],
        group: "perch",
      });
    b.part(new SphereGeometry(0.0048, 6, 4), POL, { bone: wheel, at: [0, 0.038, -0.047], group: "perch" });
  }

  return b.root;
}
