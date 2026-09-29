// A clockwork stag automaton, two metres from the floor to the tips of its antlers. Steampunk carried as metal: every
// surface is a paint (polished and tarnished brass, copper, blued steel, iron), riveted panel seams are painted from
// position, and the mechanism is real geometry. The antlers are branching gear trains: a beam of meshing cogs
// shrinking as it climbs, with tines that branch off it as trains of smaller cogs, each tooth phase computed so
// neighbours interlock. The barrel is an open ribcage of slim brass hoops around layered, meshing wheels (a flywheel and
// four planes of trains on each side), a pendulum heart hung beside an escapement, mainspring barrels on the cowl
// ends, a mainspring coil round the keel and an openwork movement plate. The legs carry pistons, coil springs, knee
// gears and cloven iron hooves; the neck is telescoping collars with gear trains down both sides and a mane of cog
// cards; cowls and thighs are scattered with cog cards. Gear teeth, the lens eyes, the chest clock, dials, the
// maker's plaque, the mainspring faces and the openwork plate are svg() drawings.
import {
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  PlaneGeometry,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import type { Quaternion, Texture } from "three";
import { createBuilder } from "../src/builder";
import type { JointRef } from "../src/context";
import { limb } from "../src/ik";
import { aim, DEG, lerp, rng } from "../src/math";
import { mix, noise, paint, resolve, smoothstep } from "../src/paint";
import type { ColorInput, Paint, Rgb } from "../src/paint";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Clockwork Stag",
  description:
    "A brass-and-copper clockwork stag: antlers that are branching trains of meshing cogs, an open ribcage of hoops around layered spinning wheels, a flywheel, an escapement and a pendulum heart, pistons and springs in the legs, gear trains down the neck, lens eyes, a chest clock and a maker's plaque on the flank.",
};

const TAU = Math.PI * 2;
const fract = (x: number) => x - Math.floor(x);
const mod = (x: number, m: number) => ((x % m) + m) % m;
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Metals as paints. Polish is a streaky warm sheen on up-facing surfaces; tarnish is dark blotches; patina is
// verdigris that gathers where the surface faces away from the light.
const VERD: Rgb = [0.27, 0.68, 0.56];
const SHEEN: Rgb = [1, 0.9, 0.62];
const INK: Rgb = [0.13, 0.08, 0.04];
const GLINT: Rgb = [1, 0.93, 0.66];

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
  // heat-tempered steel: straw, purple, blue drifting across the model
  const t = smoothstep(0.0, 1.0, noise(p, 0.05, 31));
  return mix(mix("#9a7a3c", "#5c3f8a", t), "#243c7c", smoothstep(0.3, 0.9, t) * 0.7 * (0.6 + 0.4 * n.y));
});

/** Riveted panels: a metal with dark seams on a grid that follows the dominant face, a bevel glint and rivet rows. */
function panelled(base: ColorInput, cell = 0.13) {
  return paint((p, n) => {
    const col = resolve(base, p, n);
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const cv = cell * 0.7;
    const fu = fract(u / cell);
    const fv = fract(v / cv);
    let out: Rgb = col;
    if (fu < 0.02 || fv < 0.028) out = mix(col, INK, 0.85);
    else if (fu < 0.045 || fv < 0.06) out = mix(col, GLINT, 0.28);
    else {
      const rivetU = fu > 0.075 && fu < 0.105 && Math.abs(fract(v / 0.034) - 0.5) < 0.16;
      const rivetV = fv > 0.09 && fv < 0.125 && Math.abs(fract(u / 0.034) - 0.5) < 0.16;
      if (rivetU || rivetV) out = mix(col, GLINT, 0.7);
    }
    return out;
  });
}
const PBRASS = panelled(MID);
const PCOP = panelled(COP, 0.15);
const PIRON = panelled(FE, 0.12);
const PPOL = panelled(POL, 0.14);

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

/** Dark blued steel with copper flecks: the tint for cog cards laid on the brass cowl, so they read against it. */
const CARD_DARK = paint((p, n) =>
  mix(resolve(STEEL, p, n), resolve(COP, p, n), smoothstep(0.45, 0.6, noise(p, 0.05, 41))),
);

/** What gear faces are made from, in turn. */
const GEAR_BASES: readonly Paint[] = [POL, MID, COP, OLD, STEEL, POL, BLUED, MID, COP, FE];

// ---------------------------------------------------------------------------------------------------------------
// Drawings. Grey drawings take the part's tint (brass, copper), the engraving darkens it.
const LINE = "#5a5a5a";

/** A gear drawn as a card: toothed rim, windows between the spokes (transparent), hub, dotted rivet ring. */
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
const CARD_GEARS = [
  gearSvg(18, 6, { dots: true }),
  gearSvg(14, 5, { rim: 0.7 }),
  gearSvg(10, 4, { rim: 0.62, hub: 0.26 }),
  gearSvg(22, 4, { tooth: 0.11, rim: 0.78, hub: 0.16 }),
  gearSvg(12, 3, { rim: 0.64, hub: 0.24 }),
];

/** A clock face: cream dial, minute ticks, roman numerals, two hands. */
function clockSvg() {
  const pt = (r: number, deg: number) =>
    `${(50 + r * Math.sin(deg * DEG)).toFixed(2)} ${(50 - r * Math.cos(deg * DEG)).toFixed(2)}`;
  const xy = (r: number, deg: number) => [50 + r * Math.sin(deg * DEG), 50 - r * Math.cos(deg * DEG)];
  let ticks = "";
  for (let i = 0; i < 60; i++)
    ticks += `<path d="M${pt(45, i * 6)} L${pt(i % 5 ? 42 : 38.5, i * 6)}" stroke="#2a1d10" stroke-width="${i % 5 ? 0.7 : 1.5}"/>`;
  const roman = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  let nums = "";
  roman.forEach((t, i) => {
    const [x, y] = xy(31, i * 30);
    nums += `<text x="${x.toFixed(1)}" y="${(y + 3.2).toFixed(1)}" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#2a1d10">${t}</text>`;
  });
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#efe3c2" stroke="#3a2a14" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="#7a5a30" stroke-width="0.8"/>
      ${ticks}${nums}
      <path d="M50 50 L${pt(21, 302)}" stroke="#1c1210" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M50 50 L${pt(34, 58)}" stroke="#1c1210" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M50 50 L${pt(12, 180)}" stroke="#a02a20" stroke-width="1"/>
      <circle cx="50" cy="50" r="3.4" fill="#b8892f" stroke="#2a1d10" stroke-width="1"/>
    </svg>`,
    { size: 256 },
  );
}
const CLOCK = clockSvg();

/** A pressure dial with a red zone and a needle at `needle` degrees (0 straight up). */
function gaugeSvg(needle: number) {
  const pt = (r: number, deg: number) =>
    `${(50 + r * Math.sin(deg * DEG)).toFixed(2)} ${(50 - r * Math.cos(deg * DEG)).toFixed(2)}`;
  let ticks = "";
  for (let i = 0; i <= 20; i++) {
    const a = -135 + (i * 270) / 20;
    ticks += `<path d="M${pt(42, a)} L${pt(i % 2 ? 37.5 : 33.5, a)}" stroke="#2a1d10" stroke-width="${i % 2 ? 1.6 : 2.6}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#efe3c2" stroke="#3a2a14" stroke-width="2.5"/>
      <path d="M${pt(40, 81)} A40 40 0 0 1 ${pt(40, 135)}" stroke="#b3261e" stroke-width="6" fill="none"/>
      ${ticks}
      <text x="50" y="72" text-anchor="middle" font-family="serif" font-weight="bold" font-size="10" fill="#2a1d10">PSI</text>
      <path d="M50 50 L${pt(36, needle)}" stroke="#1c1210" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="4" fill="#b8892f" stroke="#2a1d10" stroke-width="1"/>
    </svg>`,
    { size: 256 },
  );
}
const GAUGE_A = gaugeSvg(48);
const GAUGE_B = gaugeSvg(-40);

/** Glass lens eye as a map for a sphere whose top pole looks out: pupil, teal iris blades, a toothed brass ring. */
function eyeSvg() {
  let blades = "";
  for (let i = 0; i < 40; i++)
    blades += `<rect x="${i * 2}" y="5" width="2" height="4.6" fill="${i % 2 ? "#a4f4e4" : "#2aa896"}"/>`;
  let teeth = "";
  for (let i = 0; i < 20; i++) teeth += `<rect x="${i * 4 + 1}" y="10.5" width="2" height="4.5" fill="#f2c25a"/>`;
  return svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="40" fill="#1c150e"/>
      <rect y="0" width="80" height="5" fill="#06090a"/>
      ${blades}
      <rect y="9.6" width="80" height="0.9" fill="#0a3a34"/>
      <rect y="10.5" width="80" height="4.5" fill="#6a4a1a"/>
      ${teeth}
      <rect y="15" width="80" height="1.1" fill="#4a2f12"/>
      <rect y="16.1" width="80" height="4" fill="#8a5a22"/>
      <ellipse cx="14" cy="2.6" rx="5" ry="1.5" fill="#ffffff"/>
      <ellipse cx="46" cy="1.6" rx="2.4" ry="0.8" fill="#e8fffa"/>
      <ellipse cx="14" cy="7.3" rx="6" ry="1.2" fill="#dcfff6" opacity="0.5"/>
    </svg>`,
    { size: 256 },
  );
}
const EYE = eyeSvg();

/** Maker's plaque: a cartouche with a scrolled border and lettering. */
const PLAQUE = svg(
  `<svg viewBox="0 0 80 32" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bdbdbd"/></linearGradient></defs>
    <path d="M8 2 H72 Q78 2 78 8 V24 Q78 30 72 30 H8 Q2 30 2 24 V8 Q2 2 8 2Z" fill="url(#p)" stroke="#3c3c3c" stroke-width="2"/>
    <path d="M9 6 H71 Q74 6 74 9 V23 Q74 26 71 26 H9 Q6 26 6 23 V9 Q6 6 9 6Z" fill="none" stroke="#666" stroke-width="1"/>
    <text x="40" y="14.6" text-anchor="middle" font-family="serif" font-weight="bold" font-size="6.2" letter-spacing="0.3" fill="#333">CERVUS HOROLOGICUS</text>
    <text x="40" y="22.4" text-anchor="middle" font-family="serif" font-weight="bold" font-size="4.7" letter-spacing="0.5" fill="#333">No. 7 * WORKS OF LONDON * 1878</text>
    <circle cx="9" cy="9" r="1.5" fill="#888" stroke="#333" stroke-width="0.7"/><circle cx="71" cy="9" r="1.5" fill="#888" stroke="#333" stroke-width="0.7"/>
    <circle cx="9" cy="23" r="1.5" fill="#888" stroke="#333" stroke-width="0.7"/><circle cx="71" cy="23" r="1.5" fill="#888" stroke="#333" stroke-width="0.7"/>
  </svg>`,
  { size: 512 },
);

/** A mainspring barrel face: a steel spiral in a toothed housing. */
function springSvg() {
  let d = "";
  const turns = 5;
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * turns * TAU;
    const r = 7 + (i / 120) * 32;
    d += `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#d0d0d0" stroke="#3c3c3c" stroke-width="2.2"/>
      <circle cx="50" cy="50" r="43" fill="#8c8c8c" stroke="#4a4a4a" stroke-width="1.4"/>
      <path d="${d}" fill="none" stroke="#f4f4f4" stroke-width="2.6" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="#3a3a3a" stroke-width="0.7" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="7" fill="#e6e6e6" stroke="#333" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="2.4" fill="#555"/>
    </svg>`,
    { size: 256 },
  );
}
const SPRING = springSvg();

/** An openwork movement plate: big round windows for the wheels, engraved rings round each, screws and scrollwork. */
function bridgeSvg() {
  const holes: [number, number, number][] = [
    [110, 150, 88],
    [262, 96, 54],
    [300, 212, 62],
    [192, 255, 26],
    [350, 50, 20],
  ];
  let d = "M20 4H380Q396 4 396 20V280Q396 296 380 296H20Q4 296 4 280V20Q4 4 20 4Z";
  let etch = "";
  for (const [x, y, r] of holes) {
    d += `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    etch += `<circle cx="${x}" cy="${y}" r="${r + 6}" fill="none" stroke="${LINE}" stroke-width="2"/>`;
    etch += `<circle cx="${x}" cy="${y}" r="${r + 12}" fill="none" stroke="${LINE}" stroke-width="1" stroke-dasharray="3 4"/>`;
  }
  const screw = (x: number, y: number, k: number) =>
    `<circle cx="${x}" cy="${y}" r="7" fill="#dcdcdc" stroke="#333" stroke-width="1.8"/><path d="M${x - 5} ${y} L${x + 5} ${y}" stroke="#333" stroke-width="2" transform="rotate(${k * 37} ${x} ${y})"/>`;
  const screws = [
    [28, 28],
    [372, 28],
    [28, 272],
    [372, 272],
    [205, 150],
    [205, 22],
    [140, 285],
  ]
    .map(([x, y], k) => screw(x, y, k))
    .join("");
  const scroll = `<path d="M232 190 C240 160 262 158 270 172 C276 184 262 190 258 180 M232 190 C226 214 200 216 196 200" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M60 24 C90 10 120 10 150 24 M250 24 C280 10 310 10 340 24 M60 278 C80 290 100 290 120 278" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`;
  return svg(
    `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#a8a8a8"/></linearGradient></defs>
      <path d="${d}" fill="url(#b)" fill-rule="evenodd" stroke="#3a3a3a" stroke-width="3"/>
      <path d="M14 14H386V286H14Z" fill="none" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
      ${etch}${scroll}${screws}
    </svg>`,
    { size: 512 },
  );
}
const BRIDGE = bridgeSvg();

// ---------------------------------------------------------------------------------------------------------------
// Gear geometry. A gear of N teeth at module m has pitch radius rp = N m / 2; two gears of one module mesh when
// their centres are rp1 + rp2 apart and their teeth are out of phase, which `meshTheta` works out.
type Basis = { q: Quaternion; a: Vector3; e1: Vector3; e2: Vector3 };
type Cog = { c: Vector3; N: number; m: number; rp: number; theta: number; ba: Basis };

/** A gear frame: local +Z along `a`, local +Y leaning toward `up`; tooth angles run from e1 toward e2. */
function basisOf(a: Vector3, up: Vector3 = V(0, 1, 0)): Basis {
  const an = a.clone().normalize();
  const u = Math.abs(an.dot(up)) > 0.95 ? V(0, 0, 1) : up;
  const q = aim(an, u, "z");
  return { q, a: an, e1: V(1, 0, 0).applyQuaternion(q), e2: V(0, 1, 0).applyQuaternion(q) };
}

/** Toothed gear outline: 4 corners a tooth on big gears, 3 on small ones, tooth phase `theta`. */
function toothedOutline(N: number, rp: number, m: number, theta: number) {
  const ro = rp + 0.9 * m;
  const rr = rp - 1.1 * m;
  const step = TAU / N;
  const big = rp >= 0.05;
  const pts: Vector2[] = [];
  const at = (r: number, a: number) => pts.push(new Vector2(r * Math.cos(a), r * Math.sin(a)));
  for (let k = 0; k < N; k++) {
    const a = theta + k * step;
    if (big) {
      at(rr, a - 0.42 * step);
      at(ro, a - 0.17 * step);
      at(ro, a + 0.17 * step);
      at(rr, a + 0.42 * step);
    } else {
      at(rr, a - 0.5 * step);
      at(ro, a - 0.15 * step);
      at(ro, a + 0.15 * step);
    }
  }
  return pts;
}

/** Windows between the spokes of a big wheel, as holes in the shape. */
function spokeWindows(shape: Shape, spokes: number, rp: number, theta: number) {
  const outer = rp * 0.74;
  const hub = Math.max(rp * 0.26, 0.012) * 1.3;
  const w = Math.max(0.004, rp * 0.05);
  const half = TAU / spokes / 2;
  const ho = half - w / outer;
  const hi = half - w / hub;
  for (let k = 0; k < spokes; k++) {
    const a = theta + (k + 0.5) * (TAU / spokes);
    const hole = new Shape();
    const p = (r: number, ang: number) => new Vector2(r * Math.cos(ang), r * Math.sin(ang));
    const pts = [
      p(outer, a - ho),
      p(outer, a - ho / 3),
      p(outer, a + ho / 3),
      p(outer, a + ho),
      p(hub, a + hi),
      p(hub, a - hi),
    ];
    hole.setFromPoints(pts);
    shape.holes.push(hole);
  }
}

function centred(geo: ExtrudeGeometry, thick: number) {
  geo.translate(0, 0, -thick / 2);
  return geo;
}

function gearGeometry(N: number, rp: number, m: number, theta: number, thick: number, spokes: number) {
  const shape = new Shape(toothedOutline(N, rp, m, theta));
  if (spokes > 0 && rp >= 0.05) spokeWindows(shape, spokes, rp, theta);
  return centred(new ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 1 }), thick);
}

/** Escape wheel: a ratchet wheel with saw teeth and windows. */
function escapeGeometry(N: number, ro: number, thick: number) {
  const rr = ro * 0.8;
  const step = TAU / N;
  const pts: Vector2[] = [];
  for (let k = 0; k < N; k++) {
    const a = k * step;
    pts.push(new Vector2(rr * Math.cos(a), rr * Math.sin(a)));
    pts.push(new Vector2(ro * Math.cos(a + 0.3 * step), ro * Math.sin(a + 0.3 * step)));
  }
  const shape = new Shape(pts);
  spokeWindows(shape, 5, ro * 1.1, 0.3);
  return centred(new ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 1 }), thick);
}

/**
 * Engraving for a gear face: a root ring, and on big wheels a rivet ring, drawn from the face's own plane. The
 * teeth and rim sides keep the plain metal.
 */
function gearPaint(base: Paint, c: Vector3, ba: Basis, rp: number, m: number) {
  const big = rp >= 0.05;
  return paint((p, n) => {
    const col = resolve(base, p, n);
    if (Math.abs(n.x * ba.a.x + n.y * ba.a.y + n.z * ba.a.z) < 0.7) return col;
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const dz = p.z - c.z;
    const x = dx * ba.e1.x + dy * ba.e1.y + dz * ba.e1.z;
    const y = dx * ba.e2.x + dy * ba.e2.y + dz * ba.e2.z;
    const r = Math.hypot(x, y);
    let ink = 0;
    if (Math.abs(r - (rp - 2.3 * m)) < 0.00075) ink = 0.8;
    if (big) {
      const rd = rp * 0.87;
      const arc = Math.abs(fract(Math.atan2(y, x) / (TAU / 16) + 0.5) - 0.5) * (TAU / 16) * rd;
      if (Math.hypot(r - rd, arc) < 0.0022) return mix(col, GLINT, 0.75);
      if (Math.abs(r - rp * 0.74) < 0.0007) ink = 0.7;
    } else if (Math.abs(r - rp * 0.4) < 0.0006) ink = 0.7;
    return ink > 0 ? mix(col, INK, ink * 0.75) : col;
  });
}

/** Phase for a gear at `c` so it interlocks with `prev` (both measured in `ba`'s plane). */
function meshTheta(prev: Cog, c: Vector3, N: number, ba: Basis) {
  const rp = (N * prev.m) / 2;
  const d = c.clone().sub(prev.c);
  const phi = Math.atan2(d.dot(ba.e2), d.dot(ba.e1));
  const step = TAU / prev.N;
  const delta = mod(prev.theta - phi, step);
  return phi + Math.PI - (delta * prev.rp + (step * prev.rp) / 2) / rp;
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "clockworkStag", paintSize: 2048 });
  const random = rng(5);

  // ------------------------------------------------------------------------------------------------ Skeleton
  const hips = b.joint("hips", { at: [0, 1.06, -0.56], dir: [0, 0.06, 1], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.06, -0.56],
      [0, 1.075, -0.36],
      [0, 1.097, -0.16],
      [0, 1.12, 0.04],
      [0, 1.143, 0.24],
      [0, 1.168, 0.44],
      [0, 1.19, 0.6],
    ]),
    { parent: hips, role: "spine", group: "body" },
  );
  const chest = spine.joints[5];
  const neckPath = catmull([
    [0, 1.19, 0.6],
    [0, 1.28, 0.72],
    [0, 1.37, 0.85],
    [0, 1.44, 0.97],
    [0, 1.49, 1.07],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chest, role: "neck", group: "neck" });
  const HD = V(0, -0.42, 1).normalize();
  const head = b.joint("head", { at: neck.at(1), dir: HD, role: "head", group: "head" });
  const H = b.region({ at: head, quat: aim(HD, [0, 1, 0], "z"), bone: head });

  /** The spine joint nearest a z, for parts that ride the barrel. */
  const spineAt = (z: number): Joint =>
    spine.joints.reduce((best, j) => (Math.abs(j.at.z - z) < Math.abs(best.at.z - z) ? j : best));

  // ------------------------------------------------------------------------------------------------ Gears
  let cogCount = 0;
  type CogOptions = {
    at: Vector3;
    N: number;
    m: number;
    ba: Basis;
    theta: number;
    thick?: number;
    spokes?: number;
    base?: Paint;
    bone: JointRef;
    spin?: string;
    group: string;
    boss?: Paint;
  };
  /** One gear as real geometry: extruded toothed outline, engraved face paint, a hub boss, optionally its own spin joint. */
  const cog = (o: CogOptions): Cog => {
    const thick = o.thick ?? 0.012;
    const rp = (o.N * o.m) / 2;
    const base = o.base ?? GEAR_BASES[cogCount++ % GEAR_BASES.length];
    const bone = o.spin ? b.joint(o.spin, { parent: o.bone, at: o.at, dir: o.ba.a, group: o.group }) : o.bone;
    b.part(gearGeometry(o.N, rp, o.m, o.theta, thick, o.spokes ?? 0), gearPaint(base, o.at, o.ba, rp, o.m), {
      bone,
      at: o.at,
      quat: o.ba.q,
      group: o.group,
    });
    const rb = Math.max(0.0055, rp * 0.2);
    b.part(new CylinderGeometry(rb, rb, thick * 1.7, 8), o.boss ?? POL, {
      bone,
      at: o.at,
      dir: o.ba.a,
      group: o.group,
    });
    return { c: o.at.clone(), N: o.N, m: o.m, rp, theta: o.theta, ba: o.ba };
  };

  /** A gear tangent to `prev` along `dir`, its teeth phased to interlock. */
  const meshed = (
    prev: Cog,
    dir: Vector3,
    N: number,
    o: Omit<CogOptions, "at" | "N" | "m" | "theta" | "ba">,
    ba = prev.ba,
  ) => {
    const rp = (N * prev.m) / 2;
    const at = prev.c.clone().addScaledVector(dir, prev.rp + rp);
    return cog({ ...o, at, N, m: prev.m, ba, theta: meshTheta(prev, at, N, ba) });
  };

  type Step = { N: number; ang: number; from?: number; spokes?: number; spin?: string };
  /**
   * A branching train of gears lying in a plane of constant x: the first at (z, y), each step tangent to an earlier
   * one at angle `ang` (degrees from +z toward +y).
   */
  const train = (o: {
    x: number;
    m: number;
    z: number;
    y: number;
    N: number;
    spokes?: number;
    spin?: string;
    steps: Step[];
    group: string;
    thick?: number;
    bone?: JointRef;
    bases?: readonly Paint[];
  }) => {
    const ba = basisOf(V(1, 0, 0));
    const list: Cog[] = [];
    const boneAt = (z: number) => o.bone ?? spineAt(z);
    const first = cog({
      at: V(o.x, o.y, o.z),
      N: o.N,
      m: o.m,
      ba,
      theta: 0,
      thick: o.thick,
      spokes: o.spokes,
      bone: boneAt(o.z),
      spin: o.spin,
      group: o.group,
      base: o.bases?.[0],
    });
    list.push(first);
    o.steps.forEach((s, i) => {
      const prev = list[s.from ?? list.length - 1];
      const dir = V(0, Math.sin(s.ang * DEG), Math.cos(s.ang * DEG));
      const rp = (s.N * o.m) / 2;
      const zc = prev.c.z + dir.z * (prev.rp + rp);
      list.push(
        meshed(prev, dir, s.N, {
          thick: o.thick,
          spokes: s.spokes,
          bone: boneAt(zc),
          spin: s.spin,
          group: o.group,
          base: o.bases?.[(i + 1) % o.bases.length],
        }),
      );
    });
    return list;
  };

  // ------------------------------------------------------------------------------------------------ Barrel: ribcage
  // Hoops are squared-off ellipses that narrow toward the belly and slope back at the keel; the same functions say
  // where the wheels have room.
  const spineY = (z: number) => 1.075 + 0.1125 * (z + 0.36);
  const ribTop = (z: number) => spineY(z) + 0.02;
  const ribBot = (z: number) => 0.8 - 0.1 * (z + 0.34);
  const ribW = (z: number) => 0.175 + 0.03 * Math.sin(Math.PI * Math.min(Math.max((z + 0.34) / 0.72, 0), 1));
  const RIB_P = 2.5;
  /** The hoop at z as a point on its ring: beta 0 at the back, 90° at the side, 180° at the belly. */
  const ribPoint = (z: number, beta: number) => {
    const cx = Math.sin(beta);
    const cy = Math.cos(beta);
    const yt = ribTop(z);
    const yb = ribBot(z);
    const e = 2 / RIB_P;
    return V(
      ribW(z) * Math.sign(cx) * Math.abs(cx) ** e * (0.88 + 0.12 * cy),
      (yt + yb) / 2 + ((yt - yb) / 2) * Math.sign(cy) * Math.abs(cy) ** e,
      z - 0.025 * (1 - cy),
    );
  };
  const RIB_Z = [-0.34, -0.26, -0.18, -0.1, -0.02, 0.06, 0.14, 0.22, 0.3, 0.38];
  RIB_Z.forEach((z0, i) => {
    const pts: Vector3[] = [];
    for (let k = 0; k < 16; k++) pts.push(ribPoint(z0, (k / 16) * TAU));
    b.sweep(catmull(pts, { closed: true }), 0.0085, {
      bone: spineAt(z0),
      color: i % 2 ? OLD : POL,
      sides: 6,
      group: "ribs",
    });
  });
  // dorsal saddle: a plated strip along the back over the hoops, and the keel and mainspring coil below them
  b.sweep(spine, [0.07, 0.012], { section: "box", from: 0.18, to: 0.84, color: PBRASS, caps: "flat", group: "body" });
  const keelPts: Vector3[] = [];
  for (let k = 0; k <= 8; k++) {
    const z = -0.34 + (k / 8) * 0.72;
    keelPts.push(V(0, ribBot(z) - 0.004, z));
  }
  b.sweep(catmull(keelPts), 0.016, { bone: spine, color: COP, sides: 8, group: "body" });
  {
    const keel = catmull(keelPts);
    const turns = 13;
    const per = 6;
    const pts: Vector3[] = [];
    for (let i = 0; i <= turns * per; i++) {
      const t = i / (turns * per);
      const a = t * turns * TAU;
      const c = keel.at(0.02 + 0.96 * t);
      pts.push(V(c.x + 0.032 * Math.sin(a), c.y + 0.032 * Math.cos(a), c.z));
    }
    b.sweep(catmull(pts), 0.0055, { bone: spine, color: STEEL, sides: 4, group: "body" });
  }

  // ------------------------------------------------------------------------------------------------ Barrel: cowls
  const chestCowl = b.loft(
    [
      { at: [0, 0.98, 0.4], w: 0.36, h: 0.46 },
      { at: [0, 1.02, 0.5], w: 0.36, h: 0.46 },
      { at: [0, 1.08, 0.6], w: 0.26, h: 0.38 },
      { at: [0, 1.14, 0.68], w: 0.16, h: 0.26 },
    ],
    { bone: chest, color: PBRASS, sides: 8, caps: { start: "flat", end: "round" }, group: "body" },
  );
  const hipCowl = b.loft(
    [
      { at: [0, 1.04, -0.36], w: 0.34, h: 0.36 },
      { at: [0, 1.05, -0.5], w: 0.4, h: 0.42 },
      { at: [0, 1.06, -0.65], w: 0.36, h: 0.38 },
      { at: [0, 1.07, -0.8], w: 0.2, h: 0.22 },
    ],
    { bone: hips, color: PCOP, sides: 8, caps: { start: "flat", end: "round" }, group: "body" },
  );

  // ------------------------------------------------------------------------------------------------ Helpers
  const bolt = (at: Vector3, dir: Vector3, bone: JointRef, r: number, group: string, color: Paint = POL) =>
    b.part(new CylinderGeometry(r, r, r * 1.7, 6), color, { bone, at, dir, group });
  /** A ring collar round a tube: a short thick disc with chamfered edges, on `bone`. */
  const collar = (at: Vector3, axis: Vector3, r: number, len: number, color: Paint, bone: JointRef, group: string) =>
    b.lathe(
      [
        [0, -len / 2],
        [r, -len / 2],
        [r + 0.006, -len / 4],
        [r + 0.006, len / 4],
        [r, len / 2],
        [0, len / 2],
      ],
      { at, axis, segments: 10, color, bone, group },
    );
  /** A coil spring from a to e, a helix of `turns` round the a→e axis. */
  const coil = (a: Vector3, e: Vector3, R: number, turns: number, wire: number, bone: JointRef, group: string) => {
    const axis = e.clone().sub(a);
    const len = axis.length();
    axis.normalize();
    const u = new Vector3().crossVectors(axis, V(1, 0, 0)).normalize();
    const v = new Vector3().crossVectors(axis, u).normalize();
    const pts: Vector3[] = [];
    for (let i = 0; i <= turns * 6; i++) {
      const t = i / (turns * 6);
      const ang = t * turns * TAU;
      pts.push(
        a
          .clone()
          .addScaledVector(axis, len * t)
          .addScaledVector(u, R * Math.cos(ang))
          .addScaledVector(v, R * Math.sin(ang)),
      );
    }
    b.sweep(catmull(pts), wire, { bone, color: STEEL, sides: 4, group });
  };
  /** A hydraulic ram: a cylinder on the upper bone from a0 to a1, its rod running on to a clevis at a2 on the lower bone. */
  const piston = (upper: JointRef, lower: JointRef, a0: Vector3, a1: Vector3, a2: Vector3, group: string) => {
    const axis = a1.clone().sub(a0).normalize();
    b.rod(a0, a1, 0.02, { bone: upper, color: PCOP, sides: 8, caps: "flat", group });
    for (const end of [a0, a1])
      b.part(new CylinderGeometry(0.026, 0.026, 0.014, 8), POL, { bone: upper, at: end, dir: axis, group });
    b.rod(a1.clone().addScaledVector(axis, -0.05), a2, 0.0085, { bone: lower, color: STEEL, sides: 6, group });
    b.part(new SphereGeometry(0.016, 6, 5), POL, { bone: lower, at: a2, group });
  };

  // ------------------------------------------------------------------------------------------------ Movement
  // Layered wheels between the hoops: four planes of trains on each side, every gear tangent to the one it grows
  // from, and a movement plate at the middle with round windows.
  const MOVE = "movement";
  const DARK: readonly Paint[] = [STEEL, COP, FE, BLUED, COP, STEEL, FE];
  const move = (o: Omit<Parameters<typeof train>[0], "group" | "thick" | "bases">) =>
    train({ ...o, group: MOVE, thick: 0.012, bases: DARK });
  move({
    x: 0.098,
    m: 0.0066,
    z: -0.1,
    y: 0.95,
    N: 34,
    spokes: 6,
    spin: "flywheelL",
    steps: [
      { N: 18, ang: 25, spin: "gearL1", spokes: 4 },
      { N: 11, ang: -45 },
      { N: 12, ang: 190, from: 0 },
    ],
  });
  move({
    x: 0.07,
    m: 0.0058,
    z: -0.15,
    y: 0.92,
    N: 26,
    spokes: 5,
    spin: "gearL2",
    steps: [
      { N: 16, ang: 22, from: 0 },
      { N: 11, ang: 68, from: 1 },
      { N: 22, ang: -38, from: 1, spokes: 5 },
    ],
  });
  move({
    x: 0.042,
    m: 0.005,
    z: 0.02,
    y: 0.98,
    N: 16,
    steps: [
      { N: 12, ang: 200, from: 0 },
      { N: 20, ang: 330, from: 0, spokes: 4 },
    ],
  });
  move({
    x: 0.02,
    m: 0.0056,
    z: -0.02,
    y: 0.94,
    N: 22,
    spokes: 5,
    steps: [
      { N: 14, ang: 150, from: 0 },
      { N: 10, ang: 50, from: 0 },
      { N: 16, ang: -55, from: 0, spokes: 4 },
      { N: 9, ang: -10, from: 3 },
    ],
  });
  move({
    x: -0.098,
    m: 0.0066,
    z: 0,
    y: 0.95,
    N: 30,
    spokes: 5,
    spin: "flywheelR",
    steps: [
      { N: 20, ang: 190, from: 0, spokes: 4 },
      { N: 14, ang: 140, from: 0 },
      { N: 12, ang: 20, from: 0 },
    ],
  });
  move({
    x: -0.07,
    m: 0.0058,
    z: -0.06,
    y: 1.0,
    N: 24,
    spokes: 5,
    spin: "gearR2",
    steps: [
      { N: 18, ang: -70, from: 0, spokes: 4 },
      { N: 13, ang: -5, from: 1 },
      { N: 10, ang: 40, from: 0 },
    ],
  });
  move({
    x: -0.042,
    m: 0.005,
    z: -0.15,
    y: 0.97,
    N: 14,
    steps: [
      { N: 9, ang: 30, from: 0 },
      { N: 18, ang: -30, from: 0, spokes: 4 },
    ],
  });
  move({
    x: -0.02,
    m: 0.0056,
    z: -0.1,
    y: 0.98,
    N: 20,
    spokes: 4,
    steps: [
      { N: 12, ang: 20, from: 0 },
      { N: 9, ang: 80, from: 1 },
      { N: 15, ang: 210, from: 0 },
      { N: 10, ang: -70, from: 0 },
    ],
  });
  // the movement plate, double-sided, between the two sides
  for (const k of [1, -1])
    b.part(new PlaneGeometry(0.36, 0.27), "#e2b45a", {
      bone: spineAt(-0.06),
      at: V(k * 0.0015, 0.95, -0.06),
      dir: [k, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: BRIDGE,
      group: MOVE,
    });

  // Pendulum heart, hung from an arbor beside the escapement, in the open pocket at the front of the barrel.
  const PZ = 0.3;
  const PY = 1.115;
  const pendulum = b.joint("pendulumHeart", { parent: spineAt(PZ), at: [0, PY, PZ], dir: [0, -1, 0], group: MOVE });
  b.rod([-0.03, PY, PZ], [0.056, PY, PZ], 0.006, { bone: pendulum, color: POL, sides: 6, group: MOVE });
  for (const x of [-0.03, 0.056])
    b.rod([x, PY, PZ], [x, PY + 0.03, PZ], 0.005, { bone: spineAt(PZ), color: OLD, sides: 6, group: MOVE });
  b.rod([0, PY, PZ], [0, PY - 0.19, PZ], 0.0045, { bone: pendulum, color: STEEL, sides: 6, group: MOVE });
  b.part(new SphereGeometry(0.014, 6, 5), POL, { bone: pendulum, at: [0, PY - 0.12, PZ], group: MOVE });
  const heart = (k: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 20; i++) {
      const t = (i / 20) * TAU;
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5;
      pts.push([x * 0.00344 * k, y * 0.00344 * k]);
    }
    return pts;
  };
  const bobAt = V(0, PY - 0.235, PZ);
  const heartOpts = { at: bobAt, x: [0, 0, 1], y: [0, 1, 0], bone: pendulum, group: MOVE } as const;
  b.extrude(heart(1), { ...heartOpts, thickness: 0.034, bevel: 0.004, color: PPOL });
  b.extrude(heart(0.74), { ...heartOpts, thickness: 0.044, color: "#ff6a2a" });
  b.extrude(heart(0.42), { ...heartOpts, thickness: 0.05, color: "#ffd27a" });
  for (const [x, y] of [
    [-0.036, 0.03],
    [0.036, 0.03],
    [0, -0.05],
  ])
    bolt(V(0.019, bobAt.y + y, PZ + x), V(1, 0, 0), pendulum, 0.005, MOVE);

  // escapement: a ratchet wheel and a pallet anchor above it, on their own joints
  const EX = 0.045;
  const EY = PY - 0.09;
  const escape = b.joint("escapeWheel", { parent: spineAt(PZ), at: [EX, EY, PZ], dir: [1, 0, 0], group: MOVE });
  b.part(escapeGeometry(15, 0.05, 0.01), STEEL, {
    bone: escape,
    at: [EX, EY, PZ],
    quat: basisOf(V(1, 0, 0)).q,
    group: MOVE,
  });
  b.part(new CylinderGeometry(0.008, 0.008, 0.02, 8), POL, {
    bone: escape,
    at: [EX, EY, PZ],
    dir: [1, 0, 0],
    group: MOVE,
  });
  const anchor = b.joint("anchor", { parent: spineAt(PZ), at: [EX, PY, PZ], dir: [0, -1, 0], group: MOVE });
  {
    const R1 = 0.074;
    const R0 = 0.062;
    const on = (r: number, deg: number): [number, number] => [r * Math.cos(deg * DEG), -0.09 + r * Math.sin(deg * DEG)];
    b.extrude(
      [
        on(R1, 50),
        on(R1, 70),
        on(R1, 90),
        on(R1, 110),
        on(R1, 130),
        on(0.05, 126),
        on(R0, 120),
        on(R0, 110),
        on(R0, 90),
        on(R0, 70),
        on(R0, 60),
        on(0.05, 54),
      ],
      { at: [EX, PY, PZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: POL, bone: anchor, group: MOVE },
    );
    b.rod([EX, PY, PZ], [EX, PY - 0.02, PZ], 0.006, { bone: anchor, color: POL, sides: 6, group: MOVE });
  }

  // ------------------------------------------------------------------------------------------------ Drums and plates
  // Shoulder and haunch drums: wheel trains on the outside of the cowls, spaced off on posts.
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    train({
      x: s * 0.235,
      m: 0.0072,
      z: 0.46,
      y: 0.985,
      N: 26,
      spokes: 5,
      spin: `shoulderDrum${side}`,
      steps: [
        { N: 14, ang: 75 },
        { N: 9, ang: 150, from: 1 },
      ],
      group: "drums",
      bone: chest,
    });
    b.rod([s * 0.19, 0.985, 0.46], [s * 0.235, 0.985, 0.46], 0.011, {
      bone: chest,
      color: OLD,
      sides: 8,
      group: "drums",
    });
    train({
      x: s * 0.262,
      m: 0.0072,
      z: -0.53,
      y: 0.985,
      N: 30,
      spokes: 5,
      spin: `haunchDrum${side}`,
      steps: [
        { N: 14, ang: 125 },
        { N: 9, ang: 60, from: 1 },
      ],
      group: "drums",
      bone: hips,
    });
    b.rod([s * 0.2, 0.985, -0.53], [s * 0.262, 0.985, -0.53], 0.012, {
      bone: hips,
      color: OLD,
      sides: 8,
      group: "drums",
    });
  }

  // Flank plates on the lower ribs: the maker's plaque on the left, two gauges on the right.
  for (const s of [1, -1] as const) {
    const z0 = -0.02;
    const beta = 0.75;
    const P = ribPoint(z0, beta);
    const hi = ribPoint(z0, beta - 0.02);
    const lo = ribPoint(z0, beta + 0.02);
    P.x *= s;
    P.z = z0;
    const up = V(s * (hi.x - lo.x), hi.y - lo.y, 0).normalize();
    const n = V(up.y * s, -up.x * s, 0).normalize();
    const bone = spineAt(z0);
    b.extrude(
      [
        [-0.15, -0.058],
        [0.15, -0.058],
        [0.15, 0.058],
        [-0.15, 0.058],
      ],
      {
        at: P.clone().addScaledVector(n, 0.024),
        x: [0, 0, 1],
        y: up,
        thickness: 0.008,
        bevel: 0.002,
        smoothing: 1,
        color: PBRASS,
        bone,
        group: "plates",
      },
    );
    for (const dz of [-0.135, 0.135])
      for (const dv of [-0.045, 0.045])
        bolt(
          P.clone()
            .addScaledVector(n, 0.03)
            .addScaledVector(up, dv)
            .add(V(0, 0, dz)),
          n,
          bone,
          0.006,
          "plates",
        );
    for (const dz of [-0.06, 0.06])
      b.rod(
        P.clone().add(V(0, 0, dz)),
        P.clone()
          .addScaledVector(n, 0.024)
          .add(V(0, 0, dz)),
        0.007,
        { bone, color: OLD, sides: 6, group: "plates" },
      );
    if (s > 0)
      b.part(new PlaneGeometry(0.27, 0.108), "#e6bd62", {
        bone,
        at: P.clone().addScaledVector(n, 0.033),
        dir: n,
        axis: "z",
        up,
        texture: PLAQUE,
        group: "plates",
        name: "plaque",
      });
    else
      [
        [GAUGE_A, -0.07],
        [GAUGE_B, 0.07],
      ].forEach(([tex, dz]) => {
        const at = P.clone()
          .addScaledVector(n, 0.033)
          .add(V(0, 0, dz as number));
        b.part(new CircleGeometry(0.04, 20), "#ffffff", {
          bone,
          at,
          dir: n,
          axis: "z",
          up,
          texture: tex as Texture,
          group: "plates",
        });
        b.part(new TorusGeometry(0.043, 0.0055, 5, 16), POL, {
          bone,
          at: at.clone().addScaledVector(n, -0.001),
          dir: n,
          axis: "z",
          group: "plates",
        });
      });
  }

  // Chest clock on the front of the cowl.
  {
    const hit = b.surface(chestCowl).ray([0, 1.14, 1.4], [0, -0.06, -1]);
    if (hit) {
      const n = hit.axis.clone();
      b.part(new CylinderGeometry(0.066, 0.066, 0.03, 16), OLD, {
        bone: chest,
        at: hit.at.clone().addScaledVector(n, 0.0),
        dir: n,
        group: "clock",
      });
      const at = hit.at.clone().addScaledVector(n, 0.0155);
      b.part(new CircleGeometry(0.058, 24), "#ffffff", {
        bone: chest,
        at,
        dir: n,
        axis: "z",
        up: [0, 1, 0],
        texture: CLOCK,
        group: "clock",
      });
      b.part(new TorusGeometry(0.06, 0.008, 6, 20), POL, {
        bone: chest,
        at: at.clone().addScaledVector(n, -0.002),
        dir: n,
        axis: "z",
        group: "clock",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------ Neck
  const neckR = (t: number) => 0.078 - 0.028 * t;
  const neckTube = b.sweep(neck, neckR, { color: STEEL, sides: 8, group: "neck" });
  [0.05, 0.2, 0.36, 0.52, 0.68, 0.84].forEach((t, i) => {
    const fr = neck.at(t);
    collar(fr.at, fr.axis, neckR(t) + 0.03, 0.036, i % 2 ? PCOP : PPOL, fr.bone ?? "neck1", "neck");
  });
  // Gear trains down both sides of the neck, each gear tangent to the last along the neck's tangent.
  for (const s of [1, -1] as const) {
    const ba = basisOf(V(1, 0, 0));
    const m = 0.0052;
    let t = 0.07;
    let prev: Cog | null = null;
    [26, 20, 16, 13, 10].forEach((N, i) => {
      const rp = (N * m) / 2;
      const spin = i === 0 ? `neckGear${s > 0 ? "L" : "R"}` : undefined;
      if (!prev) {
        const at = neck
          .at(t)
          .at.clone()
          .add(V(s * 0.112, 0, 0));
        prev = cog({ at, N, m, ba, theta: 0, thick: 0.011, spokes: 5, bone: neck.joints[0], spin, group: "neck" });
      } else {
        t += (prev.rp + rp) / neckPath.length;
        prev = meshed(prev, neck.at(Math.min(t, 1)).axis, N, {
          thick: 0.011,
          bone: neck.joints[Math.min(i, 3)],
          group: "neck",
        });
      }
      b.rod([0, prev.c.y, prev.c.z], prev.c, 0.0045, {
        bone: neck.joints[Math.min(i, 3)],
        color: OLD,
        sides: 6,
        group: "neck",
      });
    });
  }
  // a mane of cog cards down the crest
  {
    const frames = [];
    for (let i = 0; i < 12; i++) for (const ang of [-24, 0, 24]) frames.push(neckTube.at(0.08 + i * 0.075, ang));
    b.cards(frames, CARD_GEARS, {
      size: 0.07,
      lean: 58,
      flow: (_f, i) => [(i % 2 ? 1 : -1) * 0.7, -0.15, -0.6],
      vary: 0.3,
      spin: 40,
      rng: random,
      color: COAT,
      sink: 0.2,
      group: "mane",
    });
  }

  // ------------------------------------------------------------------------------------------------ Head
  const jaw = b.joint("jaw", {
    parent: head,
    at: H.p([0, -0.065, 0]),
    aim: H.p([0, -0.095, 0.27]),
    role: "jaw",
    group: "jaw",
  });
  b.loft(
    [
      { at: H.p([0, 0.035, -0.07]), w: 0.15, h: 0.22 },
      { at: H.p([0, 0.03, 0.05]), w: 0.16, h: 0.22 },
      { at: H.p([0, 0.0, 0.17]), w: 0.115, h: 0.15 },
      { at: H.p([0, -0.02, 0.27]), w: 0.085, h: 0.1 },
      { at: H.p([0, -0.03, 0.335]), w: 0.075, h: 0.085 },
    ],
    { bone: head, color: PBRASS, sides: 8, group: "head" },
  );
  b.capsule(H.p([0, -0.09, 0.02]), H.p([0, -0.105, 0.29]), [0.037, 0.024], {
    bone: jaw,
    color: PCOP,
    sides: 8,
    group: "jaw",
  });
  // meshing tooth racks, upper pointing down, lower up, half a pitch apart
  const rack = (len: number, teeth: number, h: number, dir: 1 | -1, phase: number) => {
    const p = len / teeth;
    const pts: [number, number][] = [
      [0, 0],
      [len, 0],
    ];
    for (let i = teeth - 1; i >= 0; i--) {
      const x0 = i * p + phase * p;
      pts.push([x0 + 0.85 * p, dir * h], [x0 + 0.5 * p, dir * h], [x0 + 0.2 * p, dir * 0.35 * h]);
    }
    return pts;
  };
  b.extrude(rack(0.17, 8, 0.015, -1, 0), {
    at: H.p([0, -0.062, 0.09]),
    x: H.d([0, 0, 1]),
    y: H.d([0, 1, 0]),
    thickness: 0.05,
    color: PPOL,
    bone: head,
    group: "head",
  });
  b.extrude(rack(0.17, 8, 0.015, 1, 0.5), {
    at: H.p([0, -0.072, 0.09]),
    x: H.d([0, 0, 1]),
    y: H.d([0, 1, 0]),
    thickness: 0.05,
    color: PPOL,
    bone: jaw,
    group: "jaw",
  });
  H.part(new BoxGeometry(0.078, 0.08, 0.045), PIRON, { at: [0, -0.033, 0.355], group: "head" });
  for (const s of [1, -1])
    H.part(new SphereGeometry(0.011, 5, 4), "#0c0a0a", {
      at: [s * 0.018, -0.028, 0.379],
      scale: [1, 0.7, 0.5],
      group: "head",
    });
  // forehead star wheel
  cog({
    at: H.p([0, 0.105, 0.02]),
    N: 12,
    m: 0.0045,
    ba: basisOf(H.d([0, 0.85, 0.5]), H.d([0, 0, 1])),
    theta: 0,
    thick: 0.01,
    bone: head,
    group: "head",
    boss: OLD,
  });
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const gaze: [number, number, number] = [s * 0.62, 0.25, 0.74];
    H.part(new SphereGeometry(0.036, 10, 8), "#ffffff", {
      at: [s * 0.076, 0.045, 0.085],
      dir: gaze,
      texture: EYE,
      group: "head",
      name: `eye${side}`,
    });
    H.part(new TorusGeometry(0.04, 0.008, 5, 12), POL, {
      at: [s * 0.081, 0.048, 0.09],
      dir: gaze,
      axis: "z",
      group: "head",
    });
    H.part(new BoxGeometry(0.03, 0.014, 0.09), PPOL, { at: [s * 0.076, 0.092, 0.08], group: "head" });
    // cheek wheel on the skull, its pinion on the jaw
    const ba = basisOf(V(s, 0, 0));
    const big = cog({
      at: H.p([s * 0.093, 0.0, 0.03]),
      N: 16,
      m: 0.0052,
      ba,
      theta: 0,
      thick: 0.01,
      bone: head,
      group: "head",
    });
    meshed(big, H.d([0, -0.75, 0.66]), 9, { thick: 0.01, bone: jaw, group: "jaw" });
    // ear trumpet on a hinge
    const base = H.p([s * 0.075, 0.045, -0.06]);
    const d = H.d([s * 0.9, 0.05, -0.4]).normalize();
    const ear = b.joint(`ear${side}`, { parent: head, at: base, dir: d, role: "hinge", group: "ears" });
    b.lathe(
      [
        [0.014, 0],
        [0.066, 0.14],
        [0.06, 0.145],
        [0.008, 0.009],
      ],
      { at: base, axis: d, segments: 10, color: PPOL, bone: ear, group: "ears" },
    );
    b.part(new TorusGeometry(0.064, 0.006, 5, 12), OLD, {
      bone: ear,
      at: base.clone().addScaledVector(d, 0.145),
      dir: d,
      axis: "z",
      group: "ears",
    });
    b.part(new CylinderGeometry(0.02, 0.02, 0.04, 8), MID, { bone: ear, at: base, dir: [s, 0, 0], group: "ears" });
    cog({
      at: base.clone().add(V(s * 0.026, 0, 0)),
      N: 12,
      m: 0.0042,
      ba,
      theta: 0,
      thick: 0.008,
      bone: ear,
      group: "ears",
    });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // ------------------------------------------------------------------------------------------------ Antlers
  // A beam of meshing cogs climbing from a coronet on the skull, shrinking as it goes, and tines that branch off
  // it as trains of smaller cogs. All beam gears lie in one plane; each tine is turned about its own growth
  // direction so the rack fans out and reads from the front as well as the side.
  const MA = 0.0075;
  const BEAM_N = [16, 15, 13, 11, 9];
  const PHIS = [30, 44, 58, 72];
  const TINES = [
    { at: 1, name: "brow", g: [0.3, 0.45, 0.84], N: [9, 8, 8], bend: 9, roll: 60 },
    { at: 2, name: "bez", g: [0.35, 0.55, 0.75], N: [9, 8, 7], bend: 8, roll: -50 },
    { at: 3, name: "trez", g: [0.95, 0.2, -0.25], N: [8, 8], bend: 8, roll: 30 },
    { at: 2, name: "rear", g: [0.5, -0.05, -0.86], N: [8, 7], bend: 6, roll: 70 },
    { at: 4, name: "crownA", g: [0.9, 0.42, 0.1], N: [8, 8], bend: 6, roll: -30 },
    { at: 4, name: "crownB", g: [-0.1, 0.55, 0.83], N: [8, 8], bend: 5, roll: 70 },
    { at: 4, name: "crownC", g: [0.3, 0.25, -0.9], N: [8, 7], bend: 5, roll: 0 },
  ] as const;
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const W = V(s * 0.85, 0, -0.53);
    const U = V(0, 1, 0);
    const A = V(s * 0.53, 0, 0.85);
    const ba = basisOf(A, U);
    const inPlane = (deg: number) =>
      W.clone()
        .multiplyScalar(Math.cos(deg * DEG))
        .addScaledVector(U, Math.sin(deg * DEG));
    const rps = BEAM_N.map((N) => (N * MA) / 2);
    const centres: Vector3[] = [H.p([s * 0.075, 0.11, -0.04])];
    PHIS.forEach((phi, i) => centres.push(centres[i].clone().addScaledVector(inPlane(phi), rps[i] + rps[i + 1])));
    const beam = b.chain(`antler${side}`, centres, {
      parent: head,
      names: [1, 2, 3, 4].map((k) => `antler${side}${k}`),
      role: "hinge",
      group: "antlers",
    });
    const beamJoint = (i: number) => beam.joints[Math.min(i, 3)];
    const beamCogs: Cog[] = [];
    BEAM_N.forEach((N, i) => {
      const o = { thick: 0.011, bone: beamJoint(i), spin: `cogAntler${side}${i + 1}`, group: "antlers" };
      beamCogs.push(
        i === 0
          ? cog({ at: centres[0], N, m: MA, ba, theta: 0, spokes: 6, ...o })
          : meshed(beamCogs[i - 1], inPlane(PHIS[i - 1]), N, { ...o, spokes: 5 }),
      );
      if (i > 0)
        b.rod(
          centres[i - 1].clone().addScaledVector(ba.a, 0.011),
          centres[i].clone().addScaledVector(ba.a, 0.011),
          0.0034,
          { bone: beamJoint(i), color: POL, sides: 5, group: "antlers" },
        );
    });
    b.spike(centres[4].clone().addScaledVector(inPlane(PHIS[3]), rps[4] * 0.5), inPlane(PHIS[3]), 0.07, 0.012, {
      bone: beamJoint(4),
      color: POL,
      sides: 6,
      group: "antlers",
    });

    for (const t of TINES) {
      const root = beamCogs[t.at];
      const g = V(t.g[0] * s, t.g[1], t.g[2]).normalize();
      const ak = A.clone()
        .addScaledVector(g, -A.dot(g))
        .normalize()
        .applyAxisAngle(g, t.roll * DEG);
      const tb = basisOf(ak, U);
      const tj = b.joint(`tine${side}${t.name}`, {
        parent: beamJoint(t.at),
        at: root.c.clone().addScaledVector(g, root.rp),
        dir: g,
        group: "antlers",
      });
      let prev: Cog = root;
      let dir = g.clone();
      t.N.forEach((N) => {
        const cur = meshed(prev, dir, N, { thick: 0.011, bone: tj, group: "antlers" }, tb);
        b.rod(prev.c.clone().addScaledVector(ak, 0.011), cur.c.clone().addScaledVector(ak, 0.011), 0.003, {
          bone: tj,
          color: POL,
          sides: 5,
          group: "antlers",
        });
        // curve the train upward: turn about the plane axis whichever way lifts it
        const up = dir.clone().applyAxisAngle(ak, t.bend * DEG);
        const down = dir.clone().applyAxisAngle(ak, -t.bend * DEG);
        dir = up.y > down.y ? up : down;
        prev = cur;
      });
      b.spike(prev.c.clone().addScaledVector(dir, prev.rp * 0.5), dir, 0.075, 0.012, {
        bone: tj,
        color: POL,
        sides: 6,
        group: "antlers",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------ Legs

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const gx = basisOf(V(1, 0, 0));
    /** Knee-side gear pair: a wheel on the upper bone with a pinion on the lower one tangent to it. */
    const kneeGears = (
      pts: Vector3[],
      i: number,
      upper: JointRef,
      lower: JointRef,
      N: number,
      Np: number,
      m: number,
      group: string,
    ) => {
      const j = pts[i];
      const along = pts[i + 1].clone().sub(j);
      const dir = V(0, along.y, along.z).normalize();
      const big = cog({
        at: V(j.x + s * 0.095, j.y, j.z),
        N,
        m,
        ba: gx,
        theta: 0,
        thick: 0.011,
        spokes: N >= 20 ? 5 : 0,
        bone: upper,
        group,
      });
      meshed(big, dir, Np, { thick: 0.011, bone: lower, group });
    };
    const legDetail = (pts: Vector3[], chain: { joints: readonly Joint[] }, group: string, N1: number, N2: number) => {
      const [j0, j1, j2] = chain.joints;
      const off = V(s * 0.058, 0, 0);
      const P = (a: number, b2: number, t: number) => lerp(pts[a], pts[b2], t).add(off);
      piston(j0, j1, P(0, 1, 0.18), P(0, 1, 0.86), P(1, 2, 0.32), group);
      kneeGears(pts, 1, j0, j1, N1, 10, 0.0064, group);
      kneeGears(pts, 2, j1, j2, N2, 7, 0.0064, group);
      coil(lerp(pts[2], pts[3], 0.12), lerp(pts[2], pts[3], 0.9), 0.045, 6, 0.0045, j2, group);
      for (const i of [1, 2, 3])
        collar(
          pts[i],
          pts[i]
            .clone()
            .sub(pts[i - 1])
            .normalize(),
          i === 3 ? 0.04 : 0.05,
          0.036,
          i % 2 ? PPOL : PCOP,
          chain.joints[i - 1],
          group,
        );
    };
    const hoof = (foot: Vector3, parent: Joint, ext: string, group: string) => {
      const toe = b.joint(`toe${ext}`, { parent, at: foot, dir: [0, -0.3, 1], group });
      for (const k of [-1, 1])
        b.part(new BoxGeometry(0.03, 0.07, 0.085), PIRON, {
          bone: toe,
          at: V(foot.x + k * 0.019, 0.035, foot.z + 0.012),
          group,
        });
      b.part(new SphereGeometry(0.04, 8, 6), PPOL, {
        bone: toe,
        at: V(foot.x, 0.08, foot.z + 0.004),
        scale: [1, 0.6, 1.2],
        group,
      });
    };

    const fp = limb(
      [s * 0.135, 1.0, 0.46],
      [s * 0.145, 0.07, 0.5],
      [0.3, 0.33, 0.29, 0.08],
      [
        [0, 0, -1],
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const front = b.chain(`legF${side}`, fp, {
      parent: chest,
      names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`, `fetlockF${side}`],
      role: "leg",
      contact: [s * 0.145, 0, 0.5],
      group: `legF${side}`,
    });
    b.sweep(front, [0.056, 0.043, 0.035, 0.03, 0.028, 0.028], {
      bands: [
        [0.5, PCOP],
        [1, PBRASS],
      ],
      sides: 8,
      group: `legF${side}`,
    });
    legDetail(fp, front, `legF${side}`, 20, 12);
    hoof(fp[4], front.joints[3], `F${side}`, `legF${side}`);

    const hp = limb(
      [s * 0.15, 1.0, -0.52],
      [s * 0.15, 0.07, -0.58],
      [0.35, 0.35, 0.27, 0.08],
      [
        [0, 0, 1],
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const hind = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hipH${side}`, `kneeH${side}`, `hockH${side}`, `fetlockH${side}`],
      role: "leg",
      contact: [s * 0.15, 0, -0.58],
      group: `legH${side}`,
    });
    const thighTube = b.sweep(
      hind,
      (t) => {
        const thigh = Math.max(0, 1 - t / 0.36);
        return [0.034 + 0.055 * thigh, 0.038 + 0.065 * thigh];
      },
      {
        bands: [
          [0.5, PCOP],
          [1, PBRASS],
        ],
        sides: 8,
        group: `legH${side}`,
      },
    );
    legDetail(hp, hind, `legH${side}`, 20, 12);
    hoof(hp[4], hind.joints[3], `H${side}`, `legH${side}`);
    const thighHits = b
      .surface(thighTube)
      .scatter(16, { rng: rng(20 + (s > 0 ? 1 : 0)), minDist: 0.06, filter: (h) => h.at.y > 0.74 });
    b.cards(thighHits, CARD_GEARS, {
      size: 0.055,
      lean: 90,
      flow: [0, -1, 0],
      vary: 0.2,
      spin: 180,
      rng: random,
      color: POL,
      group: "cogs",
    });
  }

  // ------------------------------------------------------------------------------------------------ Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.08, -0.82],
      [0, 1.12, -0.87],
      [0, 1.16, -0.9],
      [0, 1.2, -0.92],
    ]),
    { parent: hips, count: 3, role: "tail", group: "tail" },
  );
  b.sweep(tail, [0.045, 0.03, 0.022], { color: PCOP, sides: 8, group: "tail" });
  {
    const C = V(0, 1.25, -0.96);
    const pts: Vector3[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * 2.4 * TAU + 0.3;
      const r = 0.02 + (i / steps) * 0.055;
      pts.push(V(0, C.y + r * Math.sin(a), C.z + r * Math.cos(a)));
    }
    b.sweep(catmull(pts), 0.0055, { bone: tail.joints[2], color: STEEL, sides: 4, group: "tail" });
    const t1 = cog({
      at: V(0.02, C.y, C.z),
      N: 16,
      m: 0.005,
      ba: basisOf(V(1, 0, 0)),
      theta: 0,
      thick: 0.01,
      bone: tail.joints[2],
      spin: "tailWheel",
      group: "tail",
      base: POL,
    });
    meshed(t1, V(0, -0.5, -0.86), 9, { thick: 0.01, bone: tail.joints[2], group: "tail" });
  }

  // ------------------------------------------------------------------------------------------------ Back: key, stacks, cards
  {
    const KZ = 0.05;
    const key = b.joint("windingKey", { parent: spineAt(KZ), at: [0, 1.14, KZ], dir: [0, 1, 0], group: "key" });
    b.lathe(
      [
        [0, 0],
        [0.026, 0],
        [0.026, 0.012],
        [0.014, 0.018],
        [0, 0.018],
      ],
      { at: [0, 1.14, KZ], segments: 6, color: MID, bone: spineAt(KZ), group: "key" },
    );
    b.rod([0, 1.14, KZ], [0, 1.24, KZ], 0.008, { bone: key, color: POL, sides: 8, group: "key" });
    b.extrude(
      [
        [0, -0.012],
        [0.03, -0.03],
        [0.09, -0.035],
        [0.115, 0],
        [0.095, 0.045],
        [0.045, 0.055],
        [0, 0.02],
        [-0.045, 0.055],
        [-0.095, 0.045],
        [-0.115, 0],
        [-0.09, -0.035],
        [-0.03, -0.03],
      ],
      {
        at: [0, 1.27, KZ],
        x: [0.7, 0, 0.7],
        y: [0, 1, 0],
        thickness: 0.012,
        smoothing: 1,
        color: POL,
        bone: key,
        group: "key",
      },
    );
    b.part(new SphereGeometry(0.014, 8, 6), OLD, { bone: key, at: [0, 1.27, KZ], group: "key" });
  }
  for (const s of [1, -1]) {
    const base = V(s * 0.09, 1.25, -0.64);
    b.rod(base, base.clone().add(V(s * 0.01, 0.16, -0.02)), 0.017, {
      bone: hips,
      color: PCOP,
      sides: 8,
      group: "stacks",
    });
    b.lathe(
      [
        [0, 0],
        [0.028, 0],
        [0.036, 0.03],
        [0.032, 0.034],
        [0.022, 0.012],
        [0, 0.012],
      ],
      { at: base.clone().add(V(s * 0.01, 0.16, -0.02)), segments: 8, color: PPOL, bone: hips, group: "stacks" },
    );
    b.part(new CylinderGeometry(0.03, 0.03, 0.018, 6), MID, {
      bone: hips,
      at: base.clone().add(V(s * 0.004, 0.06, -0.008)),
      group: "stacks",
    });
  }
  {
    const drums = [V(0.235, 0.985, 0.46), V(-0.235, 0.985, 0.46), V(0.262, 0.985, -0.53), V(-0.262, 0.985, -0.53)];
    const spots = [V(0, 1.15, 0.72), V(0, 1.15, 0.05), V(0.09, 1.32, -0.64), V(-0.09, 1.32, -0.64)];
    const keep = (h: { at: Vector3; n: Vector3 }) =>
      h.n.y > -0.15 &&
      Math.abs(h.n.z) < 0.85 &&
      drums.every((d) => h.at.distanceTo(d) > 0.17) &&
      spots.every((p) => h.at.distanceTo(p) > 0.07);
    for (const [cowl, bone, count, tint] of [
      [chestCowl, chest, 55, CARD_DARK],
      [hipCowl, hips, 60, POL],
    ] as const) {
      const hits = b.surface(cowl).scatter(count, { rng: rng(9), minDist: 0.08, filter: keep });
      b.cards(hits, CARD_GEARS, {
        size: 0.075,
        lean: 90,
        flow: [0, -0.4, 1],
        vary: 0.25,
        spin: 180,
        rng: random,
        color: tint,
        bone,
        group: "cogs",
      });
    }
  }

  // Mainspring barrels on the flat ends of the two cowls, facing into the cage.
  for (const [z, y, dz, bone] of [
    [0.4, 0.98, -1, chest],
    [-0.36, 1.04, 1, hips],
  ] as const) {
    const at = V(0, y, z + dz * 0.004);
    b.part(new CircleGeometry(0.115, 20), "#e6bd62", {
      bone,
      at,
      dir: [0, 0, dz],
      axis: "z",
      up: [0, 1, 0],
      texture: SPRING,
      group: MOVE,
    });
    b.part(new TorusGeometry(0.118, 0.008, 5, 20), POL, { bone, at, dir: [0, 0, dz], axis: "z", group: MOVE });
  }
  b.pose(pendulum, { axis: [1, 0, 0], deg: 12 });
  return b.root;
}
