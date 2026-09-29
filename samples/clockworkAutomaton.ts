// A Victorian clockwork automaton, 1.9 m tall: the menace of an exposed robot endoskeleton, built in dark iron, brass,
// copper and walnut instead of chrome. A skull-like iron face with glowing lens eyes and a hinged jaw; a ribcage of
// iron bands round a huge open gear train and a mainspring barrel; a coil-sprung abdomen with a balance wheel and an
// escapement; piston-and-cog joints at shoulders, elbows, hips, knees and ankles; cable tendons; riveted plates torn
// open in places; a butterfly winding key and a fly-ball governor on the back; hands of linkage fingers.
// Steampunk carried as metal and as drawing: every surface is a paint (polished and tarnished brass, copper, dark
// iron, blued steel, walnut grain with brass inlay), plates are extruded shields with engraved borders and rivets
// painted from their own coordinates, and the many wheels are svg() toothed gears stacked in layers on arbors, with
// extruded, real-toothed gears at the joints. Gauges, the belly clock, the lens irises, the mainspring face, the
// escape wheel and the scroll engravings are svg() drawings.
import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Path as ShapePath,
  PlaneGeometry,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import type { Fill, JointRef } from "../src/context";
import { limb } from "../src/ik";
import { DEG, rng } from "../src/math";
import { grain, mix, noise, paint, resolve, smoothstep } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";
import { catmull, polyline, spiral } from "../src/path";
import type { Chain } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Clockwork Automaton",
  description:
    "A Victorian clockwork automaton in iron, brass, copper and walnut: a skull face with glowing lens eyes and a hinged jaw, an iron-band ribcage round a huge open gear train and mainspring, sprung abdomen with balance wheel and escapement, piston-and-cog joints, cable tendons, torn riveted plates, a butterfly winding key, a fly-ball governor and articulated finger linkages.",
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
const FE = metal({ lo: "#1f1e21", hi: "#5f6068", tarn: "#0a090b", tarnAmt: 0.3, verd: 0, sheen: 0.35, seed: 5 });
const FE_L = metal({ lo: "#36363b", hi: "#85878f", tarn: "#101012", tarnAmt: 0.22, verd: 0, sheen: 0.5, seed: 8 });
const STEEL = metal({ lo: "#20305e", hi: "#6a82c4", tarn: "#0e1428", tarnAmt: 0.25, verd: 0, sheen: 0.4, seed: 6 });
const WALNUT = (() => {
  const wood = grain("#2c170a", "#7a4a26", { size: 0.0055, axis: [0.18, 1, 0.08], seed: 4 });
  return paint((p, n) => mix(resolve(wood, p, n), "#d2a06a", 0.22 * smoothstep(0.55, 1, n.y)));
})();

// Flat colours for small hardware (pins, teeth, rivets, cables).
const BR_HI = "#efc85f";
const BR = "#c9973a";
const BR_LO = "#8a642a";
const IR1 = "#1f1e25";
const IR2 = "#34333d";
const IR3 = "#575866";
const STEELB = "#2c4282";
const CABLE = "#241f1c";

const INK: Rgb = [0.13, 0.08, 0.04];
const GLINT: Rgb = [1, 0.93, 0.66];

// ---------------------------------------------------------------------------------------------------------------
// Engraved plates. The outline of a chamfered plate and the paint drawn from its own [x, y] in meters: an engraved
// border, a second hairline, corner rivets, and (walnut) a brass inlay line.
function octOutline(w: number, h: number, cham: number) {
  const c = Math.min(cham, w * 0.3, h * 0.3);
  const x = w / 2;
  const y = h / 2;
  return [
    [-x + c, -y],
    [x - c, -y],
    [x, -y + c],
    [x, y - c],
    [x - c, y],
    [-x + c, y],
    [-x, y - c],
    [-x, -y + c],
  ] as Array<[number, number]>;
}

function platePaint(w: number, h: number, base: ColorInput, inlay = false) {
  return paint((p, n, s) => {
    const ax = Math.abs(s[0]);
    const ay = Math.abs(s[1]);
    let col: Rgb = resolve(base, p, n);
    const edge = Math.min(w / 2 - ax, h / 2 - ay);
    let ink = 0;
    if (inlay) {
      if (edge > 0.0055 && edge < 0.0085) col = mix(col, "#e6b957", 0.95);
    } else {
      if (edge > 0.0032 && edge < 0.0048) ink = 0.9;
      if (edge > 0.0085 && edge < 0.0096) ink = 0.55;
    }
    if (w > 0.03 && h > 0.03) {
      const dr = Math.hypot(ax - (w / 2 - 0.0115), ay - (h / 2 - 0.0115));
      if (dr < 0.0026) col = mix(col, GLINT, 0.7);
      else if (dr < 0.0034) ink = 1;
    }
    return ink > 0 ? mix(col, INK, ink * 0.75) : col;
  });
}

/** A jagged torn edge along the right side of a plate: monotone in y so it never crosses itself. */
function tornOutline(w: number, h: number, seed: number) {
  const r = rng(seed);
  const x = w / 2;
  const y = h / 2;
  const out: Array<[number, number] | [number, number, "sharp"]> = [
    [-x + 0.008, -y],
    [x - 0.01, -y],
  ];
  const n = 6;
  for (let k = 1; k <= n; k++) {
    const yy = -y + (h * k) / (n + 1);
    const bite = k % 2 ? w * (0.04 + r() * 0.1) : w * (0.22 + r() * 0.36);
    out.push([x - bite, yy + (r() - 0.5) * h * 0.03, "sharp"]);
  }
  out.push([x - 0.012, y], [-x + 0.008, y], [-x, y - 0.01], [-x, -y + 0.01]);
  return out;
}

function tornPaint(w: number, h: number, base: ColorInput) {
  return paint((p, n, s) => {
    const ax = Math.abs(s[0]);
    const ay = Math.abs(s[1]);
    let col: Rgb = resolve(base, p, n);
    let ink = 0;
    const edge = Math.min(s[0] + w / 2, w / 2 - ay + 0 * ax, h / 2 - ay);
    if (edge > 0.0032 && edge < 0.0048) ink = 0.9;
    // scorched, rusty rim along the tear
    const tear = smoothstep(w / 2 - 0.035, w / 2 - 0.004, s[0]);
    col = mix(col, "#4a2410", tear * 0.6 * smoothstep(0.3, 0.7, noise(p, 0.012, 5)));
    const dr = Math.hypot(s[0] + w / 2 - 0.0115, ay - (h / 2 - 0.0115));
    if (dr < 0.0026) col = mix(col, GLINT, 0.7);
    else if (dr < 0.0034) ink = 1;
    return ink > 0 ? mix(col, INK, ink * 0.75) : col;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings. Everything is drawn pale grey or white so the part's tint (brass, copper, iron) colours it and the
// engraving darkens the tint.
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

/** A ratchet / escape wheel: saw teeth, spoked. */
function sawSvg(teeth: number, spokes: number) {
  const R = 48;
  const root = R * 0.8;
  const rimIn = R * 0.66;
  const hub = R * 0.2;
  const step = TAU / teeth;
  const pt = (r: number, a: number) => `${(50 + r * Math.sin(a)).toFixed(2)} ${(50 - r * Math.cos(a)).toFixed(2)}`;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    d += `${i ? "L" : "M"}${pt(root, a)}L${pt(R, a + 0.78 * step)}L${pt(root, a + 0.84 * step)}`;
  }
  d += "Z";
  for (let k = 0; k < spokes; k++) {
    const a = ((k + 0.5) * TAU) / spokes;
    const h = (TAU / spokes) * 0.5 * 0.6;
    d += `M${pt(rimIn, a - h)}A${rimIn} ${rimIn} 0 0 1 ${pt(rimIn, a + h)}L${pt(hub * 1.25, a + h * 0.7)}A${hub * 1.25} ${hub * 1.25} 0 0 0 ${pt(hub * 1.25, a - h * 0.7)}Z`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.4" cy="0.35" r="0.85"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b4b4b4"/></radialGradient></defs>
      <path d="${d}" fill="url(#g)" fill-rule="evenodd" stroke="#4d4d4d" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="${(hub * 1.25).toFixed(2)}" fill="url(#g)" stroke="#4d4d4d" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="${(hub * 0.5).toFixed(2)}" fill="none" stroke="#656565" stroke-width="1.6"/>
    </svg>`,
    { size: 256 },
  );
}

const GEAR_T8 = gearSvg(8, 0, { tooth: 0.22, hub: 0.3 });
const GEAR_T10 = gearSvg(10, 4, { rim: 0.62, hub: 0.26 });
const GEAR_T12 = gearSvg(12, 5, { rim: 0.7 });
const GEAR_T16 = gearSvg(16, 6, { dots: true });
const GEAR_T22 = gearSvg(22, 4, { tooth: 0.11, rim: 0.78, hub: 0.16 });
const GEAR_T30 = gearSvg(30, 0, { tooth: 0.09, dots: true });
const SAW_ESCAPE = sawSvg(15, 5);

/** The gear drawing whose tooth count suits a wheel of radius r at one common tooth pitch. */
function gearFor(r: number) {
  if (r < 0.02) return GEAR_T8;
  if (r < 0.03) return GEAR_T10;
  if (r < 0.042) return GEAR_T12;
  if (r < 0.06) return GEAR_T16;
  if (r < 0.085) return GEAR_T22;
  return GEAR_T30;
}

/** The mainspring seen through the open barrel: a coil of flat steel wound about the arbor. */
function springSvg() {
  let d = "";
  const turns = 6.2;
  const n = 260;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * TAU;
    const r = 9 + 33 * t;
    d += `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
  }
  let dots = "";
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU;
    dots += `<circle cx="${(50 + 45 * Math.cos(a)).toFixed(2)}" cy="${(50 + 45 * Math.sin(a)).toFixed(2)}" r="1.5" fill="#f0f0f0" stroke="#444" stroke-width="0.6"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.4" cy="0.35" r="0.9"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#a8a8a8"/></radialGradient></defs>
      <circle cx="50" cy="50" r="49" fill="#3a3a3a"/>
      <circle cx="50" cy="50" r="43" fill="#b8b8b8"/>
      <path d="${d}" stroke="#f0f0f0" stroke-width="3.2" fill="none" stroke-linejoin="round"/>
      <path d="${d}" stroke="#4a4a4a" stroke-width="0.9" fill="none" stroke-linejoin="round" transform="translate(0.9 0.9)"/>
      <circle cx="50" cy="50" r="49" fill="none" stroke="#e8e8e8" stroke-width="2"/>
      ${dots}
      <circle cx="50" cy="50" r="8.5" fill="url(#g)" stroke="#333" stroke-width="1.4"/>
      <rect x="46.5" y="46.5" width="7" height="7" fill="#555"/>
    </svg>`,
    { size: 256 },
  );
}
const SPRING_FACE = springSvg();

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

/** The belly clock: cream enamel, roman numerals, minute track, a seconds sub-dial. The hands are parts on joints. */
function clockSvg() {
  const pt = (r: number, deg: number) =>
    `${(50 + r * Math.sin(deg * DEG)).toFixed(2)} ${(50 - r * Math.cos(deg * DEG)).toFixed(2)}`;
  const roman = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  let marks = "";
  for (let i = 0; i < 60; i++) {
    const a = i * 6;
    marks += `<path d="M${pt(44, a)} L${pt(i % 5 ? 41.5 : 39, a)}" stroke="#2a1d10" stroke-width="${i % 5 ? 0.7 : 1.5}"/>`;
  }
  let nums = "";
  roman.forEach((r, i) => {
    const [x, y] = pt(32, i * 30).split(" ");
    nums += `<text x="${x}" y="${(Number(y) + 3).toFixed(1)}" text-anchor="middle" font-family="serif" font-weight="bold" font-size="8.4" fill="#2a1d10">${r}</text>`;
  });
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#f0e6c8" stroke="#3a2a14" stroke-width="2.4"/>
      <circle cx="50" cy="50" r="45.5" fill="none" stroke="#3a2a14" stroke-width="0.8"/>
      ${marks}${nums}
      <circle cx="50" cy="68" r="7.5" fill="none" stroke="#3a2a14" stroke-width="0.9"/>
      <path d="M50 68 L53.5 63" stroke="#7a1a14" stroke-width="0.9"/>
      <text x="50" y="42" text-anchor="middle" font-family="serif" font-style="italic" font-size="4.6" fill="#3a2a14">Automaton</text>
    </svg>`,
    { size: 256 },
  );
}
const CLOCK = clockSvg();

/**
 * The lens eye as a map for a hemisphere whose top pole looks out (8 rings, 5 rows each): a white-hot core with a
 * glint, an amber iris of radial blades, an ember limbus, a brass iris ring with ticks and a dark housing.
 */
function eyeSvg() {
  let blades = "";
  for (let i = 0; i < 40; i++)
    blades += `<rect x="${i * 2}" y="5" width="2" height="6" fill="${i % 2 ? "#ffe066" : "#ffa21f"}"/>`;
  let ticks = "";
  for (let i = 0; i < 20; i++) ticks += `<rect x="${i * 4 + 1.6}" y="14.6" width="0.9" height="3.6" fill="#3a2410"/>`;
  return svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="40" fill="#1c150e"/>
      <rect y="0" width="80" height="5" fill="#fff7cc"/>
      ${blades}
      <rect y="11" width="80" height="3.4" fill="#d9541a"/>
      <rect y="14.4" width="80" height="4.6" fill="#e8b850"/>
      ${ticks}
      <rect y="19" width="80" height="1.1" fill="#4a2f12"/>
      <rect y="20.1" width="80" height="8" fill="#6a4a1e"/>
      <ellipse cx="14" cy="1.8" rx="6" ry="1.3" fill="#ffffff"/>
      <ellipse cx="46" cy="1.2" rx="3" ry="0.8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
}
const EYE = eyeSvg();

/** Scrollwork cartouche: a lozenge with mirrored spirals, drawn white so the tint darkens it into engraving. */
function scrollSvg() {
  let s = "";
  for (const m of [-1, 1]) {
    const X = (v: number) => 50 + m * v;
    s += `<path d="M${X(8)} 30 C${X(20)} 30 ${X(26)} 20 ${X(20)} 15 C${X(15)} 11 ${X(10)} 16 ${X(14)} 19" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${X(8)} 30 C${X(20)} 30 ${X(28)} 40 ${X(22)} 45 C${X(17)} 49 ${X(12)} 44 ${X(16)} 41" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${X(30)} 30 L${X(44)} 30" stroke="#fff" stroke-width="1.2"/><circle cx="${X(46)}" cy="30" r="1.6" fill="#fff"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8 L62 30 L50 52 L38 30Z" stroke="#fff" stroke-width="1.6" fill="none"/>
      <path d="M50 14 L58 30 L50 46 L42 30Z" stroke="#fff" stroke-width="1" fill="none"/>
      <circle cx="50" cy="30" r="3" fill="#fff"/>${s}
    </svg>`,
    { size: 256 },
  );
}
const SCROLL = scrollSvg();

/** A chevron and lozenge band for straps. */
function bandSvg() {
  let s = "";
  for (let i = 0; i < 12; i++)
    s += `<path d="M${i * 8 + 1} 2 L${i * 8 + 6} 7 L${i * 8 + 1} 12" stroke="#fff" stroke-width="1.5" fill="none"/>`;
  return svg(
    `<svg viewBox="0 0 96 14" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0.8 H96 M0 13.2 H96" stroke="#fff" stroke-width="1.2"/>${s}
    </svg>`,
    { size: 256 },
  );
}
const BAND = bandSvg();

/** Maker's plaque: a cartouche with a scrolled border and lettering. */
const PLAQUE = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bdbdbd"/></linearGradient></defs>
    <path d="M8 4 H72 Q78 4 78 10 V30 Q78 36 72 36 H8 Q2 36 2 30 V10 Q2 4 8 4Z" fill="url(#p)" stroke="#3c3c3c" stroke-width="2.2"/>
    <path d="M9 8 H71 Q74 8 74 11 V29 Q74 32 71 32 H9 Q6 32 6 29 V11 Q6 8 9 8Z" fill="none" stroke="#666" stroke-width="1.1"/>
    <text x="40" y="19" text-anchor="middle" font-family="serif" font-weight="bold" font-size="8.4" letter-spacing="0.6" fill="#333">HOROLOGICAL</text>
    <text x="40" y="28.6" text-anchor="middle" font-family="serif" font-weight="bold" font-size="6.6" letter-spacing="1" fill="#333">No. 7 * LONDON 1859</text>
    <circle cx="9" cy="10" r="1.6" fill="#888" stroke="#333" stroke-width="0.7"/><circle cx="71" cy="10" r="1.6" fill="#888" stroke="#333" stroke-width="0.7"/>
    <circle cx="9" cy="30" r="1.6" fill="#888" stroke="#333" stroke-width="0.7"/><circle cx="71" cy="30" r="1.6" fill="#888" stroke="#333" stroke-width="0.7"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Geometry made by hand: a real toothed gear (an extruded outline with windows), joined geometries, flat shading.
const polar = (r: number, a: number): [number, number] => [r * Math.cos(a), r * Math.sin(a)];

type GearSpec = {
  teeth: number;
  R: number;
  depth: number;
  tooth?: number;
  spokes?: number;
  rim?: number;
  hub?: number;
  /** A round hole through the middle: a ring gear that goes round a limb. */
  bore?: number;
};

function gearGeo(o: GearSpec) {
  const root = o.R * (1 - (o.tooth ?? 0.16));
  const step = TAU / o.teeth;
  const shape = new Shape();
  for (let i = 0; i < o.teeth; i++) {
    const a = i * step;
    const pts = [
      polar(root, a - 0.3 * step),
      polar(o.R, a - 0.15 * step),
      polar(o.R, a + 0.15 * step),
      polar(root, a + 0.3 * step),
    ];
    pts.forEach(([x, y], k) => (i === 0 && k === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  }
  const spokes = o.spokes ?? 0;
  if (spokes > 0) {
    const rimIn = o.R * (o.rim ?? 0.68);
    const hubR = o.R * (o.hub ?? 0.24);
    for (let k = 0; k < spokes; k++) {
      const a = ((k + 0.5) * TAU) / spokes;
      const h = (TAU / spokes) * 0.5 * 0.62;
      const pts = [
        polar(rimIn, a - h),
        polar(rimIn, a),
        polar(rimIn, a + h),
        polar(hubR, a + h * 0.8),
        polar(hubR, a),
        polar(hubR, a - h * 0.8),
      ];
      const hole = new ShapePath();
      pts.forEach(([x, y], j) => (j ? hole.lineTo(x, y) : hole.moveTo(x, y)));
      shape.holes.push(hole);
    }
  }
  if (o.bore) {
    const hole = new ShapePath();
    for (let k = 0; k < 8; k++) {
      const [x, y] = polar(o.bore, (k / 8) * TAU);
      if (k) hole.lineTo(x, y);
      else hole.moveTo(x, y);
    }
    shape.holes.push(hole);
  }
  const g = new ExtrudeGeometry(shape, { depth: o.depth, bevelEnabled: false, curveSegments: 1, steps: 1 });
  g.translate(0, 0, -o.depth / 2);
  return g;
}

function merge(...geos: BufferGeometry[]) {
  const data = { position: [] as number[], normal: [] as number[], uv: [] as number[] };
  for (const source of geos) {
    const g = source.index ? source.toNonIndexed() : source;
    for (const key of ["position", "normal", "uv"] as const) {
      const a = g.getAttribute(key);
      for (let i = 0; i < a.array.length; i++) data[key].push(a.array[i]);
    }
  }
  const out = new BufferGeometry();
  out.setAttribute("position", new Float32BufferAttribute(data.position, 3));
  out.setAttribute("normal", new Float32BufferAttribute(data.normal, 3));
  out.setAttribute("uv", new Float32BufferAttribute(data.uv, 2));
  return out;
}

/** Faceted shading: unindexed with face normals. */
function flat<T extends BufferGeometry>(geo: T): BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.computeVertexNormals();
  return g;
}

/** An axis: a limb segment with its own frame, `u` toward one face and `r` toward the other, points by `p(t, x, y)`. */
function axisOf(a: Vector3, to: Vector3, uHint: Vector3, rHint: Vector3) {
  const d = to.clone().sub(a);
  const len = d.length();
  d.divideScalar(len);
  const u = uHint.clone().addScaledVector(d, -uHint.dot(d)).normalize();
  const r = rHint.clone().addScaledVector(d, -rHint.dot(d));
  r.addScaledVector(u, -r.dot(u)).normalize();
  return {
    a,
    to,
    d,
    u,
    r,
    len,
    p: (t: number, x = 0, y = 0) =>
      a
        .clone()
        .addScaledVector(d, len * t)
        .addScaledVector(r, x)
        .addScaledVector(u, y),
  };
}

/** `o` moved along each `[direction, distance]`. */
const add = (o: Vector3, ...terms: Array<[Vector3, number]>) => {
  const out = o.clone();
  for (const [v, k] of terms) out.addScaledVector(v, k);
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "clockworkAutomaton", paintSize: 2048 });

  const FRONT = V(0, 0, 1);
  const UP = V(0, 1, 0);
  const SIDES = [
    [1, "L"],
    [-1, "R"],
  ] as const;
  /** The part group the helpers below file their parts under. */
  let grp = "torso";

  // ------------------------------------------------------------------------------------------------ Skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine", group: "pelvis" });
  const spine = b.chain(
    "spine",
    [
      [0, 1.04, -0.02],
      [0, 1.17, -0.04],
      [0, 1.31, -0.065],
      [0, 1.5, -0.075],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" },
  );
  const [spine1, spine2, chest] = spine.joints;
  const neck = b.chain(
    "neck",
    [
      [0, 1.51, -0.05],
      [0, 1.61, -0.02],
      [0, 1.7, 0.01],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck", group: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.7, 0.01],
    dir: [0, 1, 0],
    role: "head",
    group: "head",
  });
  const HC = V(0, 1.8, 0.05); // the skull's centre
  const H = (x: number, y: number, z: number) => V(HC.x + x, HC.y + y, HC.z + z);
  const jaw = b.joint("jaw", {
    parent: head,
    at: H(0, -0.04, -0.03),
    aim: H(0, -0.085, 0.08),
    role: "jaw",
    group: "head",
  });
  const gaze = (s: number) => V(s * 0.1, -0.02, 1).normalize();
  const eyeJoint = SIDES.map(([s, side]) =>
    b.joint(`eye${side}`, { parent: head, at: H(s * 0.042, 0.008, 0.078), dir: gaze(s), group: "head" }),
  );

  const ARM_TILT = 35 * DEG;
  const armSk = SIDES.map(([s, side]) => {
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.055, 1.495, 0.0],
      aim: [s * 0.255, 1.49, 0.015],
      group: "arms",
    });
    const dir = V(s * Math.cos(ARM_TILT), -Math.sin(ARM_TILT), 0);
    const S = V(s * 0.255, 1.49, 0.015);
    const E = add(S, [dir, 0.34]);
    const W = add(E, [dir, 0.31]);
    const K = add(W, [dir, 0.11]);
    const arm = b.chain(`arm${side}`, [S, E, W, K], {
      parent: clavicle,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: "arms",
    });
    const [shoulder, elbow, wrist] = arm.joints;
    // hand frame: u toward the back of the hand (up), r forward
    const upper = axisOf(S, E, UP, FRONT);
    const fore = axisOf(E, W, UP, FRONT);
    const palm = axisOf(W, K, UP, FRONT);
    const FINGERS: Array<[string, number, number, number[]]> = [
      ["index", 0.038, 5, [0.043, 0.031, 0.025]],
      ["middle", 0.013, 0, [0.048, 0.035, 0.028]],
      ["ring", -0.013, -4, [0.043, 0.031, 0.025]],
      ["pinky", -0.036, -9, [0.035, 0.025, 0.02]],
    ];
    const fingers = FINGERS.map(([name, off, splay, lens]) => {
      const dir2 = palm.d
        .clone()
        .addScaledVector(palm.r, Math.tan(splay * DEG))
        .normalize();
      const pts = [palm.p(1, off, 0)];
      for (const l of lens) pts.push(add(pts[pts.length - 1], [dir2, l]));
      const chain = b.chain(`${name}${side}`, pts, { parent: wrist, role: "digit", up: [0, 1, 0], group: "hands" });
      return { name, chain, pts, dir: dir2 };
    });
    const tDir = palm.d
      .clone()
      .multiplyScalar(0.55)
      .addScaledVector(palm.r, 0.78)
      .addScaledVector(palm.u, -0.3)
      .normalize();
    const tPts = [palm.p(0.22, 0.046, -0.008)];
    for (const l of [0.038, 0.034, 0.03]) tPts.push(add(tPts[tPts.length - 1], [tDir, l]));
    const thumb = b.chain(`thumb${side}`, tPts, { parent: wrist, role: "digit", up: [0, 1, 0], group: "hands" });
    return {
      s,
      side,
      clavicle,
      dir,
      S,
      E,
      W,
      K,
      arm,
      shoulder,
      elbow,
      wrist,
      upper,
      fore,
      palm,
      fingers,
      thumb,
      tPts,
      tDir,
    };
  });

  const legSk = SIDES.map(([s, side]) => {
    const hp = V(s * 0.125, 0.985, 0);
    const ankle = V(s * 0.125, 0.105, 0);
    const [hp0, knee, an] = limb(hp, ankle, [0.452, 0.44], [0, 0, 1]);
    const ball = V(s * 0.125, 0.045, 0.125);
    const toe = V(s * 0.125, 0.032, 0.235);
    const leg = b.chain(`leg${side}`, [hp0, knee, an, ball, toe], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.125, 0, 0.09],
      group: "legs",
    });
    const [hipJ, kneeJ, ankleJ, toeJ] = leg.joints;
    const thigh = axisOf(hp0, knee, FRONT, V(s, 0, 0));
    const shin = axisOf(knee, an, FRONT, V(s, 0, 0));
    return { s, side, leg, hipJ, kneeJ, ankleJ, toeJ, hp: hp0, knee, ankle: an, ball, toe, thigh, shin };
  });

  // ------------------------------------------------------------------------------------------------ Helpers
  const box = (bone: JointRef, at: Vector3, d: Vector3, u: Vector3, w: number, len: number, h: number, fill: Fill) =>
    b.part(new BoxGeometry(w, len, h), fill, { bone, at, dir: d, up: u, group: grp });

  const cyl = (bone: JointRef, at: Vector3, dir: Vector3, r: number, len: number, sides: number, fill: Fill, r2 = r) =>
    b.part(new CylinderGeometry(r2, r, len, sides), fill, { bone, at, dir, group: grp });

  const rodTo = (bone: JointRef, a: Vector3, c: Vector3, r: number, fill: Fill, sides = 6) =>
    b.rod(a, c, r, { bone, color: fill, sides, group: grp });

  const ball = (bone: JointRef, at: Vector3, r: number, fill: Fill, scale: number | [number, number, number] = 1) =>
    b.part(new SphereGeometry(r, 8, 6), fill, { bone, at, scale, group: grp });

  /** A flat band round an axis: a short hollow cylinder. */
  const band = (
    bone: JointRef,
    at: Vector3,
    axis: Vector3,
    rr: number,
    width: number,
    thick: number,
    fill: Fill,
    segs = 12,
  ) =>
    b.lathe(
      [
        [rr, -width / 2],
        [rr + thick, -width / 2],
        [rr + thick, width / 2],
        [rr, width / 2],
      ],
      { at, axis, segments: segs, color: fill, bone, group: grp },
    );

  /** A flat drawing laid on a surface, facing `n`, its top toward `up`. */
  const decal = (
    bone: JointRef,
    tex: Texture,
    tint: string,
    at: Vector3,
    n: Vector3,
    up: Vector3,
    w: number,
    h: number,
  ) => b.part(new PlaneGeometry(w, h), tint, { bone, at, dir: n, axis: "z", up, texture: tex, group: grp });

  /** An svg gear wheel seen from both faces: two planes back to back. */
  const gearPlane = (bone: JointRef, at: Vector3, n: Vector3, up: Vector3, r: number, tex: Texture, tint: string) => {
    const size = (2 * r * 50) / 48;
    for (const k of [1, -1])
      b.part(new PlaneGeometry(size, size), tint, {
        bone,
        at: add(at, [n, k * 0.0007]),
        dir: n.clone().multiplyScalar(k),
        axis: "z",
        up,
        texture: tex,
        group: grp,
      });
  };

  /** A real toothed gear: extruded outline with windows, its axis along `n`. */
  const gear3 = (bone: JointRef, at: Vector3, n: Vector3, up: Vector3, spec: GearSpec, fill: Fill, boss = true) => {
    const g = gearGeo(spec);
    const geo =
      boss && !spec.bore
        ? merge(g, new CylinderGeometry(spec.R * 0.17, spec.R * 0.17, spec.depth * 2.3, 6).rotateX(Math.PI / 2))
        : g;
    return b.part(geo, fill, { bone, at, dir: n, axis: "z", up, group: grp });
  };

  /** An extruded, engraved plate lying in the plane spanned by `xdir` and `ydir`. */
  const plate = (
    bone: JointRef,
    at: Vector3,
    xdir: Vector3,
    ydir: Vector3,
    w: number,
    h: number,
    base: ColorInput,
    o: { thick?: number; cham?: number; inlay?: boolean } = {},
  ) =>
    b.extrude(octOutline(w, h, o.cham ?? 0.012), {
      at,
      x: xdir,
      y: ydir,
      thickness: o.thick ?? 0.008,
      bevel: 0.0022,
      detail: 0.3,
      color: platePaint(w, h, base, o.inlay),
      bone,
      group: grp,
    });

  /** A torn plate: jagged along its local +x edge, with a rusty scorched rim. */
  const torn = (
    bone: JointRef,
    at: Vector3,
    xdir: Vector3,
    ydir: Vector3,
    w: number,
    h: number,
    base: ColorInput,
    seed: number,
  ) =>
    b.extrude(tornOutline(w, h, seed), {
      at,
      x: xdir,
      y: ydir,
      thickness: 0.0075,
      bevel: 0.002,
      detail: 0.3,
      color: tornPaint(w, h, base),
      bone,
      group: grp,
    });

  /** A helical spring of round wire about `axis`. */
  const coil = (
    bone: JointRef,
    center: Vector3,
    from: Vector3,
    axis: Vector3,
    turns: number,
    pitch: number,
    wire: number,
    fill: Fill,
  ) =>
    b.sweep(spiral(center, from, axis, { turns, pitch }), wire, {
      bone,
      color: fill,
      sides: 5,
      detail: 0.55,
      group: grp,
    });

  /** A piston: barrel on one bone, polished ram on another, meeting inside. */
  const piston = (boneA: JointRef, boneB: JointRef, a: Vector3, c: Vector3, r: number, barrel: Fill = MID) => {
    const dir = c.clone().sub(a).normalize();
    const total = c.distanceTo(a);
    const mid = add(a, [dir, total * 0.56]);
    rodTo(boneA, a, mid, r, barrel, 8);
    cyl(boneA, add(a, [dir, 0.004]), dir, r * 1.3, 0.008, 8, IR2);
    cyl(boneA, mid, dir, r * 1.3, 0.007, 8, BR);
    rodTo(boneB, add(a, [dir, total * 0.4]), c, r * 0.42, STEEL, 6);
    ball(boneB, c, r * 0.7, BR_HI);
  };

  const ellipse = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 12) =>
    Array.from({ length: n }, (_, k) => V(cx + rx * Math.cos((k / n) * TAU), cy, cz + rz * Math.sin((k / n) * TAU)));

  const TINTS = ["#e8c060", "#d98a55", "#a9a3b5", "#f4dc86", "#9db0e0"];

  // ================================================================================================ Pelvis
  grp = "pelvis";
  box(hips, V(0, 0.99, 0), UP, FRONT, 0.33, 0.1, 0.17, FE);
  box(hips, V(0, 0.93, 0.01), UP, FRONT, 0.1, 0.05, 0.13, FE_L);
  b.sweep(catmull(ellipse(0, 1.05, 0, 0.18, 0.105, 12), { closed: true }), [0.005, 0.012], {
    bone: hips,
    color: MID,
    section: "box",
    up: [0, 1, 0],
    group: grp,
  });
  // the belly plate: walnut with brass inlay, a scroll engraving above the clock
  plate(hips, V(0, 0.978, 0.097), V(1, 0, 0), UP, 0.21, 0.116, WALNUT, { thick: 0.012, inlay: true });
  decal(hips, SCROLL, "#3a2410", V(0, 0.943, 0.1035), FRONT, UP, 0.06, 0.026);
  decal(hips, BAND, "#3a2410", V(0, 1.05, 0.1062), FRONT, UP, 0.07, 0.013);
  // belly clock with hands stopped at ten past ten
  const clockAt = V(0, 0.992, 0.1035);
  b.part(new CircleGeometry(0.034, 16), "#ffffff", {
    bone: hips,
    at: add(clockAt, [FRONT, 0.0012]),
    dir: FRONT,
    axis: "z",
    up: UP,
    texture: CLOCK,
    group: grp,
  });
  b.part(new TorusGeometry(0.0355, 0.0045, 5, 16), POL, {
    bone: hips,
    at: add(clockAt, [FRONT, 0.0015]),
    dir: FRONT,
    axis: "z",
    group: grp,
  });
  for (const [name, deg, len, w] of [
    ["clockHour", -60, 0.02, 0.0032],
    ["clockMinute", 60, 0.03, 0.0022],
  ] as const) {
    const hand = b.joint(name, { parent: hips, at: add(clockAt, [FRONT, 0.005]), dir: FRONT, group: grp });
    const tip = add(clockAt, [FRONT, 0.005], [V(Math.sin(deg * DEG), Math.cos(deg * DEG), 0), len]);
    b.rod(add(clockAt, [FRONT, 0.005]), tip, w, { bone: hand, color: IR1, sides: 4, group: grp });
  }
  cyl(hips, add(clockAt, [FRONT, 0.005]), FRONT, 0.004, 0.005, 8, BR_HI);
  plate(hips, V(0, 0.995, -0.093), V(1, 0, 0), UP, 0.17, 0.09, OLD, { thick: 0.008 });
  gearPlane(hips, V(0, 0.995, -0.1), FRONT, UP, 0.05, GEAR_T16, TINTS[0]);
  gearPlane(hips, V(0.08, 1.02, -0.1), FRONT, UP, 0.03, GEAR_T12, TINTS[1]);
  gearPlane(hips, V(-0.078, 0.965, -0.1), FRONT, UP, 0.034, GEAR_T12, TINTS[3]);
  for (const s of [1, -1]) gearPlane(hips, V(s * 0.078, 0.99, 0.1085), FRONT, UP, 0.03, GEAR_T12, TINTS[s > 0 ? 1 : 0]);

  // ================================================================================================ Spine and abdomen
  grp = "abdomen";
  const spineZ = (y: number) => {
    const pts: Array<[number, number]> = [
      [1.05, -0.03],
      [1.17, -0.06],
      [1.31, -0.115],
      [1.45, -0.135],
      [1.52, -0.135],
    ];
    for (let i = 1; i < pts.length; i++)
      if (y <= pts[i][0])
        return pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * (y - pts[i - 1][0])) / (pts[i][0] - pts[i - 1][0]);
    return pts[pts.length - 1][1];
  };
  const boneAt = (y: number) => (y < 1.04 ? hips : y < 1.17 ? spine1 : y < 1.31 ? spine2 : chest);
  b.sweep(catmull([1.04, 1.16, 1.3, 1.44, 1.51].map((y) => V(0, y, spineZ(y)))), 0.013, {
    bone: spine,
    color: FE_L,
    sides: 6,
    group: grp,
  });
  for (let k = 0; k < 13; k++) {
    const y = 1.065 + k * 0.034;
    const big = k % 3 === 0;
    cyl(boneAt(y), V(0, y, spineZ(y)), UP, big ? 0.031 : 0.024, big ? 0.018 : 0.022, 6, big ? MID : IR3);
  }
  // the abdomen's coil spring, wound about the bending spine
  {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 44; i++) {
      const t = i / 44;
      const y = 1.07 + t * 0.225;
      const a = t * 5.4 * TAU;
      pts.push(V(0.07 * Math.cos(a), y, spineZ(y) + 0.05 + 0.07 * Math.sin(a)));
    }
    b.sweep(catmull(pts), 0.0055, { bone: spine, color: STEEL, sides: 5, detail: 0.55, group: grp });
  }
  for (const [s] of SIDES) {
    piston(hips, chest, V(s * 0.135, 1.05, 0.005), V(s * 0.15, 1.31, -0.02), 0.019);
    // cable tendons up the front of the belly
    b.sweep(catmull([V(s * 0.09, 1.06, 0.05), V(s * 0.11, 1.17, 0.055), V(s * 0.14, 1.3, 0.055)]), 0.0038, {
      bone: spine,
      color: CABLE,
      sides: 5,
      group: grp,
    });
  }
  // balance wheel and escapement in a bridge of iron, jewelled
  {
    const bp = V(0, 1.165, 0.074);
    plate(spine1, bp, V(1, 0, 0), UP, 0.116, 0.116, FE_L, { thick: 0.008, cham: 0.02 });
    for (const k of [-1, 1]) {
      rodTo(spine1, V(k * 0.05, 1.165, 0.02), V(k * 0.05, 1.165, 0.118), 0.0038, BR, 6);
      cyl(spine1, V(k * 0.05, 1.165, 0.118), FRONT, 0.007, 0.005, 6, BR_HI);
    }
    box(spine1, V(0, 1.165, 0.119), V(1, 0, 0), FRONT, 0.012, 0.11, 0.006, MID);
    const wc = V(0, 1.165, 0.095);
    const wheel = b.joint("balanceWheel", { parent: spine1, at: wc, dir: FRONT, group: grp });
    b.part(new TorusGeometry(0.046, 0.0055, 5, 16), POL, { bone: wheel, at: wc, dir: FRONT, axis: "z", group: grp });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + 0.5;
      rodTo(wheel, wc, add(wc, [V(Math.cos(a), Math.sin(a), 0), 0.046]), 0.0032, MID, 5);
      ball(wheel, add(wc, [V(Math.cos(a + 0.5), Math.sin(a + 0.5), 0), 0.046]), 0.0085, BR_HI);
    }
    cyl(wheel, wc, FRONT, 0.0085, 0.012, 8, BR_HI);
    b.sweep(
      spiral(add(wc, [FRONT, -0.004]), add(wc, [FRONT, -0.004], [V(1, 0, 0), 0.006]), FRONT, {
        turns: 4.5,
        r1: 0.032,
        pitch: 0,
      }),
      0.0009,
      {
        bone: wheel,
        color: STEELB,
        sides: 4,
        group: grp,
      },
    );
    for (const [x, y] of [
      [-0.036, 1.19],
      [0.038, 1.14],
      [0.0, 1.128],
    ])
      ball(spine1, V(x, y, 0.0805), 0.0042, "#b0182a");
    // escape wheel with its pallet anchor
    const ec = V(0.062, 1.25, 0.098);
    const esc = b.joint("escapeWheel", { parent: spine1, at: ec, dir: FRONT, group: grp });
    gearPlane(esc, ec, FRONT, UP, 0.027, SAW_ESCAPE, "#e8c060");
    cyl(esc, ec, FRONT, 0.004, 0.02, 6, BR_HI);
    rodTo(spine1, V(0.062, 1.25, 0.075), V(0.062, 1.25, 0.09), 0.005, BR, 6);
    b.extrude(
      [
        [-0.03, -0.02],
        [-0.024, -0.024],
        [0, 0.012],
        [0.024, -0.024],
        [0.03, -0.02],
        [0.004, 0.03],
        [-0.004, 0.03],
      ],
      {
        at: V(0.03, 1.212, 0.104),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        color: STEEL,
        bone: spine1,
        group: grp,
      },
    );
  }

  // ================================================================================================ Ribcage
  grp = "ribcage";
  const CZ = 0.012;
  const ribPaint = paint((p, n, s) => (fract(s[0] * 8.5) < 0.1 ? resolve(MID, p, n) : resolve(FE, p, n)));
  const RIBS: Array<[number, number, number]> = [
    [1.317, 0.178, 0.12],
    [1.366, 0.2, 0.137],
    [1.415, 0.21, 0.147],
    [1.463, 0.202, 0.142],
    [1.503, 0.17, 0.117],
  ];
  const ribPt = (y0: number, rx: number, rz: number, s: number, deg: number) =>
    V(s * rx * Math.sin(deg * DEG), y0 - 0.032 * (1 - (deg - 38) / 134), CZ + rz * Math.cos(deg * DEG));
  const frontEnds: Vector3[][] = [[], []];
  for (const [s] of SIDES)
    for (const [y0, rx, rz] of RIBS) {
      const pts = [38, 55, 75, 95, 115, 135, 155, 172].map((deg) => ribPt(y0, rx, rz, s, deg));
      b.sweep(catmull(pts), [0.0052, 0.012], {
        bone: chest,
        color: ribPaint,
        section: "box",
        up: [0, 1, 0],
        detail: 0.6,
        group: grp,
      });
      frontEnds[s > 0 ? 0 : 1].push(pts[0]);
    }
  for (const ends of frontEnds) {
    b.sweep(polyline(ends), 0.0062, { bone: chest, color: POL, sides: 6, group: grp });
    for (const e of ends) cyl(chest, e, V(0, 1, 0.1), 0.009, 0.012, 6, BR_HI);
  }
  // collar yoke across the shoulders and the ring gear round the neck's base
  b.sweep(
    catmull([
      V(-0.24, 1.488, 0.0),
      V(-0.12, 1.518, 0.012),
      V(0, 1.526, 0.02),
      V(0.12, 1.518, 0.012),
      V(0.24, 1.488, 0.0),
    ]),
    [0.034, 0.0052],
    { bone: chest, color: MID, section: "box", up: [0, 1, 0], group: grp },
  );
  gear3(chest, V(0, 1.522, -0.045), UP, FRONT, { teeth: 12, R: 0.055, depth: 0.01, bore: 0.03, tooth: 0.2 }, POL);

  // the flanks: a train of real cogs on an iron backing on the left, a torn plate with gears showing on the right
  {
    const X = V(1, 0, 0);
    plate(chest, V(0.221, 1.405, 0.0), V(0, 0, 1), UP, 0.17, 0.2, FE_L, { thick: 0.008 });
    gear3(chest, V(0.236, 1.445, 0.025), X, UP, { teeth: 14, R: 0.06, depth: 0.012, spokes: 5, rim: 0.7 }, POL);
    gear3(chest, V(0.236, 1.398, -0.058), X, UP, { teeth: 10, R: 0.04, depth: 0.012, spokes: 4, tooth: 0.2 }, COP);
    gear3(chest, V(0.236, 1.33, -0.02), X, UP, { teeth: 10, R: 0.042, depth: 0.012, spokes: 4, tooth: 0.2 }, MID);
    gear3(chest, V(0.236, 1.34, 0.06), X, UP, { teeth: 8, R: 0.03, depth: 0.012, tooth: 0.22 }, OLD);
    torn(chest, V(-0.222, 1.405, 0.0), V(0, 0, -1), UP, 0.17, 0.2, MID, 5);
    const gc = V(-0.216, 1.4, -0.02);
    const NX = V(-1, 0, 0);
    cyl(chest, gc, NX, 0.006, 0.02, 6, BR_HI);
    gearPlane(chest, add(gc, [NX, 0.004]), NX, UP, 0.05, GEAR_T16, "#d98a55");
    gearPlane(chest, add(gc, [NX, 0.004], [UP, -0.07], [FRONT, 0.045]), NX, UP, 0.034, GEAR_T12, "#e8c060");
    gearPlane(chest, add(gc, [NX, 0.004], [UP, 0.062], [FRONT, -0.052]), NX, UP, 0.03, GEAR_T12, "#a9a3b5");
  }

  // ------------------------------------------------------------------------------------------------ The gear train
  grp = "gearTrain";
  /** The whole train is drawn on a 1.4 m axis and grown by K to fill the open chest. */
  const K = 1.15;
  const GX = (x: number) => x * K;
  const GY = (y: number) => 1.4 + (y - 1.4) * K;
  const chestGear = (x: number, y: number, z: number, r: number, tint: string, joint?: JointRef) =>
    gearPlane(joint ?? chest, V(GX(x), GY(y), z), FRONT, UP, r * K, gearFor(r * K), tint);
  /** A train of meshing (`ang`) and compound (`dz`: a second wheel on the same arbor, one layer back) gears. */
  const train = (
    x0: number,
    y0: number,
    z0: number,
    r0: number,
    steps: Array<{ r: number; ang: number } | { r: number; dz: number }>,
    first = 0,
  ) => {
    let x = x0;
    let y = y0;
    let z = z0;
    let r = r0;
    let k = first;
    chestGear(x, y, z, r, TINTS[k++ % TINTS.length]);
    for (const step of steps) {
      if ("ang" in step) {
        const dist = (r + step.r) * 0.93;
        x += dist * Math.cos(step.ang * DEG);
        y += dist * Math.sin(step.ang * DEG);
      } else {
        cyl(chest, V(GX(x), GY(y), z - step.dz / 2), FRONT, 0.0036, Math.abs(step.dz) + 0.014, 6, BR_HI);
        z += step.dz;
      }
      r = step.r;
      chestGear(x, y, z, r, TINTS[k++ % TINTS.length]);
    }
  };
  // the mainspring barrel: a brass drum with its coil visible, its toothed ring behind
  const barrelAt = V(GX(-0.03), GY(1.385), 0.075);
  const barrel = b.joint("mainspring", { parent: chest, at: barrelAt, dir: FRONT, group: grp });
  b.lathe(
    [
      [0, -0.016],
      [0.062 * K, -0.016],
      [0.065 * K, -0.012],
      [0.065 * K, 0.012],
      [0.062 * K, 0.016],
      [0, 0.016],
    ],
    { at: barrelAt, axis: FRONT, segments: 16, color: MID, bone: barrel, group: grp },
  );
  b.part(new CircleGeometry(0.0605 * K, 20), "#d0d6ea", {
    bone: barrel,
    at: add(barrelAt, [FRONT, 0.0166]),
    dir: FRONT,
    axis: "z",
    up: UP,
    texture: SPRING_FACE,
    group: grp,
  });
  cyl(barrel, add(barrelAt, [FRONT, 0.02]), FRONT, 0.0085, 0.008, 6, BR_HI);
  gearPlane(barrel, add(barrelAt, [FRONT, -0.023]), FRONT, UP, 0.07 * K, GEAR_T22, "#e8c060");
  train(0.0555, 1.403, 0.052, 0.024, [
    { r: 0.04, dz: -0.022 },
    { r: 0.028, ang: 75 },
    { r: 0.032, dz: -0.022 },
    { r: 0.045, ang: 200 },
    { r: 0.022, dz: -0.022 },
    { r: 0.05, ang: 250 },
    { r: 0.03, dz: -0.022 },
    { r: 0.052, ang: 330 },
    { r: 0.026, dz: -0.022 },
    { r: 0.06, ang: 160 },
  ]);
  chestGear(-0.07, 1.475, 0.052, 0.028, TINTS[2]);
  chestGear(-0.08, 1.312, 0.052, 0.026, TINTS[1]);
  chestGear(0, 1.4, -0.082, 0.098, "#8f8ca0");
  chestGear(0.005, 1.4, -0.098, 0.05, TINTS[0]);
  chestGear(-0.02, 1.36, -0.06, 0.06, TINTS[4]);
  // a heavy toothed flywheel high in the cage, in real teeth
  gear3(chest, V(-0.062, 1.462, 0.0), FRONT, UP, { teeth: 16, R: 0.048, depth: 0.014, spokes: 5, rim: 0.7 }, COP);

  // gauges bolted over the front ribs
  const gauge = (name: string, s: number, y: number, r: number, needleDeg: number) => {
    const rib = RIBS.reduce((best, cur) => (Math.abs(cur[0] - y) < Math.abs(best[0] - y) ? cur : best));
    const deg = Math.asin(Math.min(0.99, 0.166 / rib[1])) / DEG;
    const base = ribPt(rib[0], rib[1], rib[2], s, deg);
    base.y = y;
    const n = V((s * Math.sin(deg * DEG)) / rib[1], 0, Math.cos(deg * DEG) / rib[2]).normalize();
    const gUp = UP.clone().addScaledVector(n, -UP.dot(n)).normalize();
    const at = add(base, [n, 0.008]);
    b.lathe(
      [
        [0, -0.014],
        [r * 1.12, -0.014],
        [r * 1.12, 0.008],
        [0, 0.008],
      ],
      { at, axis: n, segments: 12, color: MID, bone: chest, group: grp },
    );
    b.part(new CircleGeometry(r * 0.96, 16), "#ffffff", {
      bone: chest,
      at: add(at, [n, 0.0091]),
      dir: n,
      axis: "z",
      up: gUp,
      texture: DIAL,
      group: grp,
    });
    b.part(new TorusGeometry(r * 1.02, r * 0.14, 5, 14), POL, {
      bone: chest,
      at: add(at, [n, 0.0085]),
      dir: n,
      axis: "z",
      group: grp,
    });
    const needle = b.joint(name, { parent: chest, at: add(at, [n, 0.0096]), dir: n, group: grp });
    const v = gUp.clone().applyAxisAngle(n, -needleDeg * DEG);
    rodTo(needle, add(at, [n, 0.0096]), add(at, [n, 0.0096], [v, r * 0.85]), r * 0.05, IR1, 4);
    cyl(needle, add(at, [n, 0.0106]), n, r * 0.16, 0.002, 8, BR_HI);
    return { at, n };
  };
  const gA = gauge("needleChestL", 1, 1.44, 0.034, 55);
  const gB = gauge("needleChestR", -1, 1.44, 0.034, -35);
  // a copper pipe from each gauge across the belly to the barrel
  for (const [s, g] of [
    [1, gA],
    [-1, gB],
  ] as const)
    b.sweep(
      catmull([
        add(g.at, [g.n, -0.01], [UP, -0.036]),
        V(s * 0.15, 1.395, 0.13),
        V(s * 0.1, 1.362, 0.14),
        V(s * 0.03, 1.315, 0.142),
      ]),
      0.0036,
      { bone: chest, color: COP, sides: 6, group: grp },
    );

  // ================================================================================================ The back
  grp = "back";
  const BZ = -0.175;
  const BY = 1.41;
  gearPlane(chest, V(0, BY, BZ), V(0, 0, 1), UP, 0.11, GEAR_T30, "#e8c060");
  gearPlane(chest, V(0, BY, BZ - 0.022), V(0, 0, 1), UP, 0.06, GEAR_T16, "#f4dc86");
  for (const [ang, r, tint] of [
    [35, 0.05, "#d98a55"],
    [215, 0.042, "#a9a3b5"],
    [320, 0.034, "#e8c060"],
    [125, 0.036, "#9db0e0"],
  ] as const) {
    const dist = (0.11 + r) * 0.93;
    gearPlane(
      chest,
      V(dist * Math.cos(ang * DEG), BY + dist * Math.sin(ang * DEG), BZ),
      V(0, 0, 1),
      UP,
      r,
      gearFor(r),
      tint,
    );
  }
  // winding key: a butterfly bow on a fluted shaft
  {
    const keyAt = V(0, BY, BZ - 0.026);
    const back = V(0, 0, -1);
    const key = b.joint("windKey", { parent: chest, at: keyAt, dir: back, group: grp });
    cyl(key, add(keyAt, [back, 0.02]), back, 0.011, 0.07, 8, POL);
    cyl(key, add(keyAt, [back, 0.004]), back, 0.02, 0.012, 8, MID);
    const wing = (s: number) =>
      (
        [
          [0.01, -0.01],
          [0.04, -0.042],
          [0.09, -0.05],
          [0.112, -0.018],
          [0.104, 0.024],
          [0.068, 0.05],
          [0.03, 0.036],
          [0.01, 0.01],
        ] as Array<[number, number]>
      ).map(([x, y]) => [s * x, y] as [number, number]);
    for (const s of [1, -1])
      b.extrude(s > 0 ? wing(1) : wing(-1).reverse(), {
        at: add(keyAt, [back, 0.052]),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.011,
        bevel: 0.0025,
        detail: 0.3,
        color: POL,
        bone: key,
        group: grp,
      });
    cyl(key, add(keyAt, [back, 0.052]), back, 0.018, 0.02, 8, BR);
    for (const s of [1, -1]) ball(key, add(keyAt, [back, 0.052], [V(s, 0, 0), 0.074]), 0.009, BR_HI);
  }
  // back plates: intact and engraved on the left, torn and peeling on the right, a maker's plaque below
  plate(chest, V(0.152, 1.478, -0.212), V(1, 0, 0), UP, 0.12, 0.092, POL, { thick: 0.008 });
  torn(chest, V(-0.152, 1.478, -0.212), V(1, 0, 0), UP, 0.12, 0.092, MID, 9);
  plate(chest, V(0, 1.31, -0.205), V(1, 0, 0), UP, 0.09, 0.044, OLD, { thick: 0.008 });
  decal(chest, PLAQUE, "#e8c060", V(0, 1.31, -0.2104), V(0, 0, -1), UP, 0.076, 0.038);
  for (const [s] of SIDES)
    for (const y of [1.44, 1.515]) rodTo(chest, V(s * 0.152, y, -0.21), V(s * 0.152, y, -0.09), 0.0045, BR_LO, 5);
  // flywheel and fly-ball governor low on the back
  {
    const fc = V(0.115, 1.31, -0.19);
    const back = V(0, 0, -1);
    const fly = b.joint("flywheel", { parent: spine2, at: fc, dir: back, group: grp });
    gear3(fly, fc, back, UP, { teeth: 18, R: 0.068, depth: 0.02, spokes: 5, rim: 0.72, hub: 0.2, tooth: 0.13 }, MID);
    for (let k = 0; k < 5; k++) {
      const a = ((k + 0.5) * TAU) / 5;
      b.part(new CylinderGeometry(0.0095, 0.0095, 0.026, 6), FE, {
        bone: fly,
        at: add(fc, [V(Math.cos(a), Math.sin(a), 0), 0.048]),
        dir: back,
        group: grp,
      });
    }
    rodTo(spine2, V(0.115, 1.31, -0.12), add(fc, [back, 0.022]), 0.007, BR, 6);
    const gc = V(-0.115, 1.335, -0.185);
    const gov = b.joint("governor", { parent: spine2, at: gc, dir: UP, group: grp });
    rodTo(gov, add(gc, [UP, -0.055]), add(gc, [UP, 0.06]), 0.005, BR, 6);
    cyl(gov, add(gc, [UP, 0.06]), UP, 0.014, 0.013, 8, MID);
    cyl(gov, add(gc, [UP, -0.03]), UP, 0.012, 0.013, 8, MID);
    for (const s of [1, -1]) {
      const bl = add(gc, [V(s, 0, 0), 0.058], [UP, 0.005]);
      rodTo(gov, add(gc, [UP, 0.06]), bl, 0.003, BR_HI, 5);
      rodTo(gov, add(gc, [UP, -0.03]), bl, 0.003, BR_HI, 5);
      ball(gov, bl, 0.02, MID);
    }
    rodTo(spine2, V(-0.115, 1.335, -0.12), gc, 0.0045, BR_LO, 5);
    // a worm on the spindle
    b.sweep(
      spiral(add(gc, [UP, -0.02]), add(gc, [UP, -0.02], [V(1, 0, 0), 0.009]), UP, { turns: 5, pitch: 0.007 }),
      0.002,
      {
        bone: gov,
        color: BR_HI,
        sides: 4,
        group: grp,
      },
    );
  }
  // copper pipes up the flanks, with hex unions
  for (const [s] of SIDES) {
    const pipe = b.sweep(
      catmull([
        V(s * 0.135, 1.05, -0.07),
        V(s * 0.185, 1.2, -0.09),
        V(s * 0.222, 1.33, -0.085),
        V(s * 0.235, 1.45, -0.05),
        V(s * 0.22, 1.51, -0.02),
      ]),
      0.0115,
      { bone: spine, color: COP, sides: 6, group: grp },
    );
    b.along(pipe, 4, (at) =>
      b.stick(new CylinderGeometry(0.019, 0.019, 0.022, 6), POL, at, { embed: 0.5, group: grp }),
    );
  }

  // ================================================================================================ Neck
  grp = "neck";
  b.sweep(neck, [0.027, 0.025, 0.022], { color: FE_L, sides: 6, detail: 0.4, group: grp });
  {
    const N = (t: number, x = 0, z = 0) => {
      const [a, m, c] = [V(0, 1.51, -0.05), V(0, 1.61, -0.02), V(0, 1.7, 0.01)];
      const q = t < 0.5 ? a.clone().lerp(m, t * 2) : m.clone().lerp(c, (t - 0.5) * 2);
      return q.add(V(x, 0, z));
    };
    for (const [x, z] of [
      [0.033, 0],
      [-0.033, 0],
      [0, 0.03],
      [0, -0.03],
    ])
      b.sweep(polyline([N(0, x, z), N(0.5, x, z), N(1, x, z)]), 0.0034, {
        bone: neck,
        color: CABLE,
        sides: 5,
        group: grp,
      });
    b.sweep(spiral(N(0, 0, 0), N(0, 0.037, 0), V(0, 0.19, 0.06).normalize(), { turns: 7, pitch: 0.027 }), 0.003, {
      bone: neck,
      color: BR_HI,
      sides: 5,
      group: grp,
    });
  }
  b.along(neck, 3, (at) => b.stick(new CylinderGeometry(0.043, 0.043, 0.011, 10), MID, at, { embed: 0.5, group: grp }));

  // ================================================================================================ Head
  grp = "head";
  const BLACK = "#08070a";
  // cranium: an open iron dome with a dark bowl inside it, the gears of the mind turning in the opening
  b.part(flat(new SphereGeometry(1, 10, 7, 0, TAU, 0.9, Math.PI - 0.9)), FE, {
    bone: head,
    at: H(0, 0.028, -0.014),
    scale: [0.093, 0.096, 0.108],
    group: grp,
  });
  b.part(flat(new SphereGeometry(1, 8, 5, 0, TAU, 1.05, Math.PI - 1.05)), IR1, {
    bone: head,
    at: H(0, 0.028, -0.014),
    scale: [0.086, 0.089, 0.1],
    group: grp,
  });
  b.part(new TorusGeometry(0.073, 0.0065, 5, 16), MID, {
    bone: head,
    at: H(0, 0.0855, -0.014),
    dir: UP,
    axis: "z",
    scale: [1, 1.12, 1],
    group: grp,
  });
  {
    const top = H(0, 0.084, 0.0);
    gearPlane(head, add(top, [UP, -0.008], [FRONT, 0.03]), UP, FRONT, 0.046, GEAR_T16, TINTS[0]);
    gearPlane(head, add(top, [UP, -0.016], [FRONT, 0.03], [V(1, 0, 0), 0.066]), UP, FRONT, 0.026, GEAR_T10, TINTS[1]);
    gearPlane(head, add(top, [UP, -0.02], [FRONT, -0.012], [V(1, 0, 0), -0.04]), UP, FRONT, 0.03, GEAR_T12, TINTS[3]);
    cyl(head, add(top, [UP, -0.02], [FRONT, 0.03]), UP, 0.0038, 0.03, 6, BR_HI);
    cyl(head, add(top, [UP, -0.02], [FRONT, 0.03], [V(1, 0, 0), 0.066]), UP, 0.0034, 0.03, 6, BR_HI);
    cyl(head, add(top, [UP, -0.02], [FRONT, -0.012], [V(1, 0, 0), -0.04]), UP, 0.0034, 0.03, 6, BR_HI);
  }
  // brass hoops over the dome
  for (const s of [1, -1]) {
    const x0 = 0.08 * s;
    const k = Math.sqrt(1 - (x0 / (0.093 * 1.05)) ** 2);
    const pts = [-100, -75, -50, -25, 0, 25, 50, 75, 100].map((deg) =>
      H(x0, 0.028 + 0.096 * 1.05 * k * Math.cos(deg * DEG), -0.014 + 0.108 * 1.05 * k * Math.sin(deg * DEG)),
    );
    b.sweep(catmull(pts.filter((p) => p.y > 1.71)), 0.0052, { bone: head, color: MID, sides: 5, group: grp });
  }
  gearPlane(head, H(0, 0.02, -0.128), V(0, 0, 1), UP, 0.05, GEAR_T16, TINTS[0]);
  gearPlane(head, H(0.056, -0.03, -0.12), V(0, 0, 1), UP, 0.026, GEAR_T10, TINTS[1]);
  gearPlane(head, H(-0.052, 0.06, -0.118), V(0, 0, 1), UP, 0.022, GEAR_T10, TINTS[3]);
  cyl(head, H(0, 0.02, -0.132), V(0, 0, -1), 0.009, 0.008, 6, BR_HI);
  // brow with a chevron band, mid-face, nose
  box(head, H(0, 0.046, 0.088), UP, FRONT, 0.185, 0.03, 0.045, FE);
  decal(head, BAND, "#e8c060", H(0, 0.046, 0.1112), FRONT, UP, 0.13, 0.0182);
  box(head, H(0, -0.05, 0.04), UP, FRONT, 0.13, 0.085, 0.11, FE_L);
  box(head, H(0, -0.008, 0.094), UP, FRONT, 0.026, 0.06, 0.02, MID);
  b.extrude(
    [
      [-0.016, -0.024],
      [0.016, -0.024],
      [0, 0.022],
    ],
    { at: H(0, -0.036, 0.0955), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: BLACK, bone: head, group: grp },
  );
  for (const [s] of SIDES) {
    box(head, H(s * 0.077, -0.03, 0.05), V(s * 0.3, -1, 0.25), FRONT, 0.03, 0.06, 0.055, FE);
    // eye socket, bezel and the glowing lens on its own joint
    const socket = H(s * 0.043, 0.008, 0.078);
    cyl(head, add(socket, [FRONT, 0.008]), FRONT, 0.034, 0.02, 10, BLACK);
    b.part(new TorusGeometry(0.0335, 0.0048, 5, 14), POL, {
      bone: head,
      at: add(socket, [FRONT, 0.019]),
      dir: FRONT,
      axis: "z",
      group: grp,
    });
    b.part(new SphereGeometry(0.0265, 12, 8, 0, TAU, 0, Math.PI / 2), "#ffffff", {
      bone: eyeJoint[s > 0 ? 0 : 1],
      at: add(socket, [FRONT, 0.007]),
      dir: gaze(s),
      texture: EYE,
      group: grp,
      name: `lens${s > 0 ? "L" : "R"}`,
    });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + 0.4;
      ball(head, add(socket, [FRONT, 0.02], [V(Math.cos(a), Math.sin(a), 0), 0.0335]), 0.0032, BR_HI);
    }
    // jaw hinge: a gear on the skull meshing a smaller one on the jaw, under the big ear gear
    gear3(head, H(s * 0.086, -0.034, -0.03), V(s, 0, 0), UP, { teeth: 10, R: 0.03, depth: 0.008, spokes: 4 }, MID);
    gear3(jaw, H(s * 0.086, -0.078, -0.012), V(s, 0, 0), UP, { teeth: 8, R: 0.022, depth: 0.008, tooth: 0.22 }, COP);
    gear3(
      head,
      H(s * 0.093, 0.032, -0.03),
      V(s, 0, 0),
      UP,
      { teeth: 14, R: 0.05, depth: 0.011, spokes: 5, rim: 0.7 },
      POL,
    );
    gear3(head, H(s * 0.095, 0.07, 0.03), V(s, 0, 0), UP, { teeth: 9, R: 0.028, depth: 0.01, tooth: 0.2 }, OLD);
    b.sweep(catmull([H(s * 0.07, 0.02, 0.07), H(s * 0.078, -0.04, 0.076), H(s * 0.056, -0.1, 0.066)]), 0.0028, {
      bone: [head, jaw],
      color: CABLE,
      sides: 5,
      group: grp,
    });
    rodTo(head, H(s * 0.06, -0.02, 0.09), H(s * 0.06, -0.075, 0.098), 0.0055, BR, 6);
  }
  // teeth: brass upper row on the skull, a lower row on the jaw
  box(head, H(0, -0.09, 0.096), UP, FRONT, 0.11, 0.01, 0.012, BR_LO);
  for (let k = 0; k < 8; k++) box(head, H(-0.049 + k * 0.014, -0.1, 0.099), UP, FRONT, 0.011, 0.02, 0.008, BR_HI);
  // the hinged jaw
  for (const [s] of SIDES) rodTo(jaw, H(s * 0.075, -0.048, -0.024), H(s * 0.052, -0.11, 0.084), 0.0115, FE_L, 6);
  box(jaw, H(0, -0.11, 0.088), UP, FRONT, 0.104, 0.024, 0.03, FE);
  box(jaw, H(0, -0.098, 0.096), UP, FRONT, 0.1, 0.008, 0.012, BR_LO);
  for (let k = 0; k < 7; k++) box(jaw, H(-0.042 + k * 0.014, -0.089, 0.098), UP, FRONT, 0.011, 0.018, 0.008, BR);
  gearPlane(jaw, H(0, -0.114, 0.104), FRONT, UP, 0.02, GEAR_T10, "#d98a55");
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // ================================================================================================ Arms and hands
  for (const a of armSk) {
    const { s, clavicle, S, E, W, arm, shoulder, elbow, wrist, upper, fore, palm } = a;
    const isR = s < 0;
    grp = "arms";
    b.sweep(arm, [0.04, 0.037, 0.032, 0.026], { color: FE, sides: 8, detail: 0.4, group: grp });

    // shoulder: a drum with a big cog on each face, a ring gear and hoops down the arm, a piston up from the ribs
    cyl(clavicle, S, FRONT, 0.052, 0.11, 10, FE_L);
    gear3(clavicle, add(S, [FRONT, 0.064]), FRONT, UP, { teeth: 14, R: 0.066, depth: 0.012, spokes: 5, rim: 0.7 }, POL);
    gear3(
      clavicle,
      add(S, [FRONT, -0.064]),
      FRONT,
      UP,
      { teeth: 14, R: 0.066, depth: 0.012, spokes: 5, rim: 0.7 },
      OLD,
    );
    cyl(clavicle, add(S, [FRONT, 0.082]), FRONT, 0.015, 0.015, 6, BR_HI);
    gear3(
      shoulder,
      upper.p(0.13),
      upper.d,
      upper.u,
      { teeth: 16, R: 0.066, depth: 0.009, bore: 0.044, tooth: 0.2 },
      MID,
    );
    band(shoulder, upper.p(0.13), upper.d, 0.042, 0.02, 0.005, BR);
    band(shoulder, upper.p(0.24), upper.d, 0.046, 0.012, 0.006, OLD);
    band(shoulder, upper.p(0.34), upper.d, 0.045, 0.012, 0.006, MID);
    cyl(chest, V(s * 0.243, 1.3, 0.02), V(s, 0, 0), 0.012, 0.04, 6, BR);
    piston(chest, shoulder, V(s * 0.262, 1.3, 0.02), upper.p(0.3, 0, -0.058), 0.014);
    b.sweep(
      catmull([
        V(s * 0.09, 1.535, 0.035),
        V(s * 0.17, 1.55, 0.05),
        add(S, [UP, 0.05], [FRONT, 0.05]),
        upper.p(0.34, 0.035, 0.038),
      ]),
      0.004,
      {
        bone: [clavicle, shoulder],
        color: CABLE,
        sides: 5,
        group: grp,
      },
    );

    // upper arm: walnut cover, engraved side plates, coil spring, pipe and cables
    plate(shoulder, upper.p(0.56, 0, 0.044), upper.d, upper.r, 0.11, 0.06, WALNUT, { thick: 0.009, inlay: true });
    plate(shoulder, upper.p(0.56, 0.044, 0), upper.d, upper.u, 0.11, 0.056, POL, { thick: 0.007 });
    gearPlane(shoulder, upper.p(0.56, 0.052, 0.01), upper.r, upper.d, 0.026, GEAR_T12, TINTS[3]);
    if (isR) torn(shoulder, upper.p(0.56, -0.044, 0), upper.d.clone().negate(), upper.u, 0.11, 0.056, MID, 3);
    else plate(shoulder, upper.p(0.56, -0.044, 0), upper.d, upper.u, 0.11, 0.056, MID, { thick: 0.007 });
    coil(shoulder, upper.p(0.74), upper.p(0.74, 0.056, 0), upper.d, 4.5, 0.0215, 0.0036, STEEL);
    const armCable = (t0: number, x: number, y: number, col: Fill, r: number) =>
      b.sweep(catmull([upper.p(t0, x, y), upper.p(1, x, y), fore.p(0.5, x, y), fore.p(1, x, y)]), r, {
        bone: arm,
        color: col,
        sides: 5,
        group: grp,
      });
    armCable(0.4, 0.024, -0.038, CABLE, 0.004);
    armCable(0.4, -0.022, -0.038, CABLE, 0.004);
    const pipe = b.sweep(
      catmull([
        upper.p(0.36, -0.048, 0.012),
        upper.p(0.95, -0.048, 0.012),
        fore.p(0.5, -0.048, 0.012),
        fore.p(0.96, -0.038, 0.008),
      ]),
      0.0082,
      {
        bone: arm,
        color: COP,
        sides: 6,
        group: grp,
      },
    );
    b.along(pipe, 4, (at) =>
      b.stick(new CylinderGeometry(0.0138, 0.0138, 0.015, 6), POL, at, { embed: 0.5, group: grp }),
    );

    // elbow: an axle across the joint with meshing cogs on both faces and pistons alongside
    cyl(shoulder, E, upper.u, 0.014, 0.15, 8, BR);
    for (const k of [1, -1]) {
      const face = add(E, [upper.u, k * 0.06]);
      gear3(
        shoulder,
        face,
        upper.u.clone().multiplyScalar(k),
        upper.d,
        { teeth: 12, R: 0.055, depth: 0.011, spokes: 5, rim: 0.7 },
        k > 0 ? POL : MID,
      );
      gear3(
        elbow,
        add(face, [fore.d, 0.0828]),
        upper.u.clone().multiplyScalar(k),
        upper.d,
        { teeth: 9, R: 0.034, depth: 0.011, tooth: 0.2 },
        k > 0 ? COP : OLD,
      );
      cyl(shoulder, add(E, [upper.u, k * 0.08]), upper.u, 0.017, 0.013, 6, BR_HI);
    }
    for (const k of [1, -1]) piston(shoulder, elbow, upper.p(0.44, k * 0.078, 0), fore.p(0.2, k * 0.078, 0), 0.0115);

    // forearm: walnut cover, brass side plates, a ring gear round the arm, a worm, bands
    plate(elbow, fore.p(0.5, 0, 0.038), fore.d, fore.r, 0.12, 0.056, WALNUT, { thick: 0.009, inlay: true });
    plate(elbow, fore.p(0.4, 0.038, 0), fore.d, fore.u, 0.1, 0.046, POL, { thick: 0.007 });
    gearPlane(elbow, fore.p(0.3, 0.046, 0), fore.r, fore.d, 0.022, GEAR_T10, TINTS[0]);
    gearPlane(elbow, fore.p(0.3 + 0.036 / fore.len, 0.046, 0.015), fore.r, fore.d, 0.016, GEAR_T8, TINTS[1]);
    if (isR) plate(elbow, fore.p(0.4, -0.038, 0), fore.d, fore.u, 0.1, 0.046, OLD, { thick: 0.007 });
    else torn(elbow, fore.p(0.4, -0.038, 0), fore.d.clone().negate(), fore.u, 0.1, 0.046, MID, 6);
    band(elbow, fore.p(0.7), fore.d, 0.034, 0.02, 0.005, BR);
    gear3(elbow, fore.p(0.7), fore.d, fore.u, { teeth: 18, R: 0.058, depth: 0.009, bore: 0.038, tooth: 0.2 }, MID);
    band(elbow, fore.p(0.14), fore.d, 0.037, 0.012, 0.006, MID);
    band(elbow, fore.p(0.94), fore.d, 0.033, 0.012, 0.006, OLD);
    {
      const w0 = fore.p(0.3, -0.066, 0.006);
      const w1 = fore.p(0.56, -0.066, 0.006);
      rodTo(elbow, w0, w1, 0.0075, IR3, 6);
      b.sweep(spiral(w0, add(w0, [fore.u, 0.0115]), fore.d, { turns: 10, pitch: w1.distanceTo(w0) / 10 }), 0.0024, {
        bone: elbow,
        color: BR_HI,
        sides: 4,
        group: grp,
      });
      cyl(elbow, w0, fore.d, 0.011, 0.008, 6, BR);
      cyl(elbow, w1, fore.d, 0.011, 0.008, 6, BR);
    }
    // wrist: a ball, a ring and small cogs
    grp = "hands";
    ball(wrist, W, 0.036, FE_L);
    band(wrist, W, palm.d, 0.034, 0.022, 0.007, MID);
    gear3(wrist, add(W, [palm.u, 0.04]), palm.u, palm.d, { teeth: 9, R: 0.03, depth: 0.008, tooth: 0.22 }, COP);
    // palm: an iron block, a brass back plate with a cog, the knuckle bar
    box(wrist, palm.p(0.5, 0, 0), palm.d, palm.u, 0.096, 0.11, 0.022, FE_L);
    plate(wrist, palm.p(0.5, 0, 0.0145), palm.d, palm.r, 0.09, 0.088, POL, { thick: 0.005, cham: 0.016 });
    gear3(
      wrist,
      palm.p(0.5, 0, 0.0225),
      palm.u,
      palm.d,
      { teeth: 10, R: 0.028, depth: 0.007, spokes: 4, rim: 0.65 },
      BR_HI,
    );
    cyl(wrist, palm.p(1), palm.r, 0.0095, 0.12, 8, BR);
    // fingers: box-section linkage with a pin at every joint, a pointed tip and a tendon from the forearm
    const finger = (chain: Chain, pts: Vector3[], off: number, wide: number) => {
      b.sweep(chain, (t) => [wide * (1 - 0.3 * t), wide * 0.78 * (1 - 0.25 * t)], {
        section: "box",
        caps: { start: "flat", end: "point" },
        bands: [
          [0.36, BR],
          [0.68, BR_LO],
          [1, BR_HI],
        ],
        group: grp,
      });
      chain.joints.forEach((j, i) => cyl(j, pts[i], palm.r, wide * 0.72, wide * 2.5, 6, IR1));
      const under = palm.u.clone().multiplyScalar(-wide * 0.95);
      b.sweep(
        catmull([
          fore.p(0.45, off * 0.7, -0.03),
          fore.p(1, off * 0.8, -0.03),
          palm.p(0.5, off, -0.014),
          add(pts[0], [under, 1]),
          add(pts[1], [under, 1]),
          add(pts[3], [under, 0.8]),
        ]),
        0.0022,
        { bone: [arm, chain], color: CABLE, sides: 4, group: grp },
      );
    };
    for (const f of a.fingers) {
      const off = f.pts[0].clone().sub(palm.p(1)).dot(palm.r);
      finger(f.chain, f.pts, off, f.name === "pinky" ? 0.0085 : 0.0105);
    }
    finger(a.thumb, a.tPts, 0.05, 0.0112);
  }

  // ================================================================================================ Legs and feet
  for (const l of legSk) {
    const { s, leg, hipJ, kneeJ, ankleJ, toeJ, hp, knee, ankle, ball: ballAt, thigh, shin } = l;
    const isR = s < 0;
    const X = V(s, 0, 0);
    grp = "legs";
    b.sweep(leg, [0.058, 0.055, 0.047, 0.04, 0.035], {
      from: 0,
      to: leg.ts[2],
      color: FE,
      sides: 8,
      detail: 0.4,
      group: grp,
    });

    // hip: a socket drum, a big cog on the pelvis meshing a smaller one on the thigh, a flexor piston
    cyl(hips, V(s * 0.148, hp.y, 0), X, 0.056, 0.11, 10, FE_L);
    gear3(
      hips,
      V(s * 0.21, hp.y, 0),
      X,
      UP,
      { teeth: 14, R: 0.07, depth: 0.013, spokes: 5, rim: 0.7 },
      s > 0 ? POL : MID,
    );
    gear3(
      hipJ,
      V(s * 0.21, hp.y - 0.102, 0),
      X,
      UP,
      { teeth: 9, R: 0.04, depth: 0.013, tooth: 0.2 },
      s > 0 ? COP : OLD,
    );
    cyl(hips, V(s * 0.222, hp.y, 0), X, 0.015, 0.012, 6, BR_HI);
    piston(hips, hipJ, V(s * 0.12, 1.03, 0.09), thigh.p(0.2, 0.056, 0.064), 0.015, COP);

    // thigh: walnut front, an engraved side plate (torn open on the left, showing gears), rear spring rods, a ring gear
    plate(hipJ, thigh.p(0.65, 0, 0.068), thigh.d, thigh.r, 0.11, 0.1, WALNUT, { thick: 0.009, inlay: true });
    plate(hipJ, thigh.p(0.36, 0, 0.066), thigh.d, thigh.r, 0.15, 0.095, FE_L, { thick: 0.008 });
    gearPlane(hipJ, thigh.p(0.26, 0, 0.075), thigh.u, thigh.d, 0.032, GEAR_T12, TINTS[3]);
    gearPlane(hipJ, thigh.p(0.26 + 0.0525 / thigh.len, 0, 0.075), thigh.u, thigh.d, 0.024, GEAR_T10, TINTS[1]);
    gearPlane(
      hipJ,
      thigh.p(0.26 + (0.0525 + 0.0484) / thigh.len, 0, 0.075),
      thigh.u,
      thigh.d,
      0.028,
      GEAR_T12,
      TINTS[0],
    );
    if (!isR) {
      gearPlane(hipJ, thigh.p(0.45, 0.06, 0), thigh.r, thigh.d, 0.04, GEAR_T12, TINTS[1]);
      gearPlane(hipJ, thigh.p(0.63, 0.06, 0.034), thigh.r, thigh.d, 0.028, GEAR_T10, TINTS[0]);
      gearPlane(hipJ, thigh.p(0.6, 0.06, -0.028), thigh.r, thigh.d, 0.032, GEAR_T12, TINTS[3]);
      cyl(hipJ, thigh.p(0.45, 0.056, 0), thigh.r, 0.008, 0.012, 6, BR_HI);
      torn(hipJ, thigh.p(0.5, 0.068, 0), thigh.d, thigh.u, 0.22, 0.09, MID, 12);
    } else plate(hipJ, thigh.p(0.5, 0.068, 0), thigh.d, thigh.u, 0.22, 0.09, POL, { thick: 0.008 });
    plate(hipJ, thigh.p(0.5, -0.068, 0), thigh.d, thigh.u, 0.2, 0.09, OLD, { thick: 0.008 });
    for (const x of [-0.032, 0.032]) {
      rodTo(hipJ, thigh.p(0.18, x, -0.078), thigh.p(0.86, x, -0.078), 0.009, STEEL, 6);
      coil(hipJ, thigh.p(0.2, x, -0.078), thigh.p(0.2, x + 0.023, -0.078), thigh.d, 9, 0.0325, 0.003, BR_HI);
    }
    band(hipJ, thigh.p(0.1), thigh.d, 0.058, 0.014, 0.006, MID);
    band(hipJ, thigh.p(0.8), thigh.d, 0.051, 0.02, 0.005, BR);
    gear3(hipJ, thigh.p(0.8), thigh.d, thigh.u, { teeth: 18, R: 0.074, depth: 0.01, bore: 0.054, tooth: 0.2 }, MID);

    // knee: a drum, cogs on both faces, a kneecap, twin pistons
    cyl(hipJ, knee, X, 0.055, 0.15, 10, FE_L);
    for (const k of [1, -1]) {
      const face = add(knee, [X, k * 0.098]);
      gear3(
        hipJ,
        face,
        X.clone().multiplyScalar(k),
        UP,
        { teeth: 12, R: 0.062, depth: 0.013, spokes: 5, rim: 0.7 },
        k > 0 ? POL : OLD,
      );
      gear3(
        kneeJ,
        add(face, [shin.d, 0.093]),
        X.clone().multiplyScalar(k),
        UP,
        { teeth: 8, R: 0.038, depth: 0.013, tooth: 0.2 },
        k > 0 ? COP : MID,
      );
      cyl(hipJ, add(knee, [X, k * 0.112]), X, 0.018, 0.012, 6, BR_HI);
    }
    b.part(new SphereGeometry(1, 8, 4, 0, TAU, 0, Math.PI / 2), POL, {
      bone: hipJ,
      at: add(knee, [FRONT, 0.034]),
      dir: FRONT,
      scale: [0.04, 0.045, 0.04],
      group: grp,
    });
    for (const k of [1, -1])
      piston(hipJ, kneeJ, thigh.p(0.74, k * 0.058, 0.056), shin.p(0.24, k * 0.058, 0.056), 0.0115);

    // shin: walnut guard, engraved plate, a calf pump behind, bands, a ring gear, crossed tendons
    plate(kneeJ, shin.p(0.27, 0, 0.05), shin.d, shin.r, 0.13, 0.08, WALNUT, { thick: 0.009, inlay: true });
    plate(kneeJ, shin.p(0.6, 0, 0.052), shin.d, shin.r, 0.15, 0.085, FE_L, { thick: 0.008 });
    gearPlane(kneeJ, shin.p(0.5, 0, 0.061), shin.u, shin.d, 0.03, GEAR_T12, TINTS[0]);
    gearPlane(kneeJ, shin.p(0.5 + 0.0502 / shin.len, 0, 0.061), shin.u, shin.d, 0.024, GEAR_T10, TINTS[1]);
    gearPlane(kneeJ, shin.p(0.5 + (0.0502 + 0.0484) / shin.len, 0, 0.061), shin.u, shin.d, 0.028, GEAR_T12, TINTS[3]);
    plate(kneeJ, shin.p(0.45, 0.052, 0), shin.d, shin.u, 0.2, 0.07, isR ? MID : POL, { thick: 0.007 });
    piston(kneeJ, ankleJ, shin.p(0.2, 0, -0.066), V(s * 0.125, 0.125, -0.066), 0.022, COP);
    band(kneeJ, shin.p(0.08), shin.d, 0.046, 0.014, 0.006, MID);
    band(kneeJ, shin.p(0.9), shin.d, 0.037, 0.02, 0.005, BR);
    gear3(kneeJ, shin.p(0.9), shin.d, shin.u, { teeth: 16, R: 0.06, depth: 0.009, bore: 0.042, tooth: 0.2 }, OLD);
    for (const k of [1, -1])
      b.sweep(
        catmull([
          thigh.p(0.55, k * 0.03, -0.055),
          knee.clone().add(V(-k * 0.005 * s, 0, -0.05)),
          shin.p(0.55, -k * 0.03, -0.05),
          shin.p(0.84, -k * 0.02, -0.04),
        ]),
        0.004,
        {
          bone: leg,
          color: CABLE,
          sides: 5,
          group: grp,
        },
      );

    // ankle: drum, cogs, the boot
    cyl(kneeJ, ankle, X, 0.045, 0.11, 10, FE_L);
    gear3(
      kneeJ,
      add(ankle, [X, 0.072]),
      X,
      UP,
      { teeth: 12, R: 0.05, depth: 0.012, spokes: 5, rim: 0.7 },
      s > 0 ? MID : POL,
    );
    gear3(
      ankleJ,
      add(ankle, [X, 0.072], [V(0, -0.043, -0.058), 1]),
      X,
      UP,
      { teeth: 8, R: 0.03, depth: 0.012, tooth: 0.2 },
      s > 0 ? OLD : COP,
    );
    cyl(kneeJ, add(ankle, [X, 0.085]), X, 0.014, 0.012, 6, BR_HI);
    const fx = s * 0.125;
    box(ankleJ, V(fx, 0.011, 0.025), FRONT, UP, 0.125, 0.2, 0.022, FE);
    box(ankleJ, V(fx, 0.057, -0.03), FRONT, UP, 0.115, 0.09, 0.07, FE_L);
    box(ankleJ, V(fx, 0.03, -0.077), FRONT, UP, 0.117, 0.006, 0.03, POL);
    box(ankleJ, V(fx, 0.072, 0.055), V(0, -0.33, 1), UP, 0.108, 0.13, 0.04, FE_L);
    plate(ankleJ, V(fx, 0.089, 0.045), V(1, 0, 0), V(0, 0.32, 0.95), 0.1, 0.1, WALNUT, { thick: 0.007, inlay: true });
    cyl(ankleJ, ballAt, X, 0.015, 0.135, 8, BR);
    box(toeJ, V(fx, 0.011, 0.18), FRONT, UP, 0.125, 0.1, 0.022, FE);
    box(toeJ, V(fx, 0.042, 0.18), FRONT, UP, 0.118, 0.108, 0.04, FE_L);
    box(toeJ, V(fx, 0.0645, 0.18), FRONT, UP, 0.12, 0.11, 0.008, MID);
    b.spike(V(fx, 0.042, 0.232), FRONT, 0.016, 0.026, { bone: toeJ, color: POL, sides: 4, group: grp });
    for (const k of [1, -1]) cyl(ankleJ, V(fx + k * 0.046, 0.066, 0.09), V(0, 0.4, 1), 0.007, 0.02, 6, BR_HI);
  }

  return b.root;
}
