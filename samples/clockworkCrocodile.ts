// A four metre clockwork crocodile, Victorian steampunk gone wild: a great ticking clock face set into its back,
// a boiler with a smoking stack behind it, riveted brass-and-copper scute plates shingled down the neck and tail,
// and cogs in every gap. Metal is all paint (polished, tarnished and verdigris brass, copper, blued steel, iron)
// with seams and rivets painted from the surface coordinates. Every gear is an svg() toothed wheel on a plane, with a
// rim ring and hub for thickness, meshed tooth to gap: a gearbox on each flank (gear train and roller chain), gear
// trains along both sides of the tail, hip and shoulder drums, and a gear-and-crank linkage at each jaw hinge, a
// drive gear on the skull turning a gear on the jaw, and a crank wheel that pushes the jaw through a connecting rod.
// Hands, gears, the winding key and the balance wheel are joints.
import {
  BufferGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import type { Fill } from "../src/context";
import { limb } from "../src/ik";
import type { OutlinePoint } from "../src/outline";
import { aim, DEG, rng } from "../src/math";
import { mix, noise, paint, resolve, smoothstep } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";
import { catmull } from "../src/path";
import type { SweepPoint } from "../src/sweep";
import type { Chain, Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Clockwork Crocodile",
  description:
    "A 4 m steampunk clockwork crocodile: a great ticking clock face with jointed hands set into its back, a boiler and smoking stack, shingled engraved scute plates, gearboxes with roller chains on the flanks, meshing gear trains down the tail, and brass teeth in a jaw driven by a visible gear-and-crank linkage. Glowing lamp eyes, piston legs, hip drums.",
};

const TAU = Math.PI * 2;
const fract = (x: number) => x - Math.floor(x);
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Metals as paints: polish is a streaky warm sheen on up-facing surfaces, tarnish is dark blotches, verdigris
// gathers where the surface faces away from the light.
const VERD: Rgb = [0.27, 0.68, 0.56];
const SHEEN: Rgb = [1, 0.9, 0.62];
const INK: Rgb = [0.13, 0.08, 0.04];
const GLINT: Rgb = [1, 0.93, 0.66];

type Metal = { lo: string; hi: string; tarn: string; tarnAmt: number; verd: number; sheen: number; seed: number };
function metal(m: Metal) {
  return paint((p, n) => {
    const big = noise(p, 0.09, m.seed);
    const fine = noise(p, 0.012, m.seed + 5);
    let c: Rgb = mix(m.lo, m.hi, smoothstep(0.2, 0.8, big) * 0.75 + fine * 0.25);
    c = mix(c, m.tarn, m.tarnAmt * smoothstep(0.45, 0.8, noise(p, 0.04, m.seed + 9)));
    if (m.verd)
      c = mix(c, VERD, m.verd * smoothstep(0.58, 0.72, noise(p, 0.02, m.seed + 13)) * smoothstep(0.75, -0.3, n.y));
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
const SMOKE = paint((p, n) =>
  mix(mix("#8a8580", "#cdc7bf", noise(p, 0.09, 41)), "#ebe6de", smoothstep(0.2, 1, n.y) * 0.5),
);
const BRASS_OLD = metal({
  lo: "#8a6224",
  hi: "#c99a45",
  tarn: "#2e1c0a",
  tarnAmt: 0.35,
  verd: 0.08,
  sheen: 0.2,
  seed: 7,
});
const IRONB = metal({ lo: "#1a1e2a", hi: "#4c5670", tarn: "#07080c", tarnAmt: 0.5, verd: 0, sheen: 0.25, seed: 8 });
const SILVER = metal({ lo: "#7c8290", hi: "#eef2f8", tarn: "#3a3e48", tarnAmt: 0.2, verd: 0, sheen: 0.5, seed: 9 });

// Gear tints: the drawings are pale grey, the tint makes them metal.
const T_BRASS = "#e6b95c";
const T_COPPER = "#d98552";
const T_STEEL = "#8ea0d2";
const T_BRONZE = "#b98a44";
const T_GOLD = "#f7d980";

// ---------------------------------------------------------------------------------------------------------------
// Engraving painted from a plate's own [x, y] in meters.
function halfAt(pts: readonly (readonly [number, number])[], x: number) {
  for (let i = 1; i < pts.length; i++) {
    const [x1, h1] = pts[i];
    if (x <= x1) {
      const [x0, h0] = pts[i - 1];
      return h0 + ((h1 - h0) * (x - x0)) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
}

/** A shingle scute: pointed shield, half length `l`, half width `w` (outline centred, points toward +x). */
function scuteProfile(l: number, w: number) {
  return [
    [-l, 0.84 * w],
    [0.1 * l, w],
    [l, 0.42 * w],
  ] as [number, number][];
}
function scuteOutline(l: number, w: number): OutlinePoint[] {
  const P = scuteProfile(l, w);
  const lower = P.map(([x, y]) => [x, -y] as [number, number]);
  const upper = [...P].reverse();
  return [...lower, [l * 1.02, 0, "sharp"], ...upper];
}

/** Engraved scute: border line, rib, chevrons, two rivets, the tip tempered. */
function scutePaint(l: number, w: number, base: ColorInput, tip: ColorInput) {
  const P = scuteProfile(l, w);
  const prof = P.map(([x, y]) => [(x + l) / (2 * l), y] as [number, number]);
  return paint((p, n, s) => {
    const [x, y] = s;
    const ay = Math.abs(y);
    const hw = halfAt(prof, (x + l) / (2 * l)) * 1;
    const edge = Math.min(hw - ay, l - x);
    let col: Rgb = resolve(base, p, n);
    col = mix(col, resolve(tip, p, n), smoothstep(0.45 * l, 0.95 * l, x));
    let ink = 0;
    if (edge > 0.0035 && edge < 0.0065) ink = 1;
    if (ay < 0.0016 && x > -l * 0.7 && x < l * 0.85) ink = 1;
    if (edge > 0.009 && x > -l * 0.6 && ay > 0.003 && fract((x - ay * 1.1) / 0.011) < 0.22) ink = 0.8;
    const rx = -l + 0.016;
    const dr = Math.hypot(x - rx, ay - w * 0.42);
    if (dr < 0.0034) col = mix(col, GLINT, 0.7);
    else if (dr < 0.0052) ink = 1;
    return ink > 0 ? mix(col, INK, ink * 0.75) : col;
  });
}

/** A rectangular iron/brass plate: double border, corner rivets, engraved rule lines. */
function platePaint(w: number, h: number, base: ColorInput, rule = true) {
  return paint((p, n, s) => {
    const [x, y] = s;
    const ex = w / 2 - Math.abs(x);
    const ey = h / 2 - Math.abs(y);
    const e = Math.min(ex, ey);
    let col: Rgb = resolve(base, p, n);
    let ink = 0;
    if (e > 0.008 && e < 0.0115) ink = 1;
    if (rule && e > 0.022 && e < 0.0245) ink = 0.7;
    const d = Math.hypot(ex - 0.022, ey - 0.022);
    if (d < 0.0055) col = mix(col, GLINT, 0.65);
    else if (d < 0.0078) ink = 1;
    return ink > 0 ? mix(col, INK, ink * 0.75) : col;
  });
}

/** Rows of rivets on bands and seams: for lathes, `s` is [height, deg]. */
function bandedPaint(base: ColorInput, band: ColorInput, rows: readonly number[], halfW: number, rivetsPer: number) {
  return paint((p, n, s) => {
    const [h, deg] = s;
    let col: Rgb = resolve(base, p, n);
    for (const r of rows) {
      const d = Math.abs(h - r);
      if (d < halfW) col = resolve(band, p, n);
      if (d < halfW && d > halfW - 0.004) col = mix(col, INK, 0.7);
      if (d < halfW * 0.4) {
        const f = fract((deg / 360) * rivetsPer) - 0.5;
        if (Math.hypot(f * 0.03, d) < 0.0055) col = mix(col, GLINT, 0.7);
      }
    }
    return col;
  });
}

/** Riveted hull plating: seams every `pitch` meters along a sweep of length L, rivets beside them. */
function hullPaint(L: number, pitch: number, top: Fill, side: Fill, belly: Fill) {
  return paint((p, n, s) => {
    const d = (s[0] * L) / pitch;
    const f = d - Math.floor(d);
    let c: Rgb = n.y > 0.45 ? resolve(top, p, n) : n.y > -0.4 ? resolve(side, p, n) : resolve(belly, p, n);
    if (f < 0.06) c = mix(c, INK, 0.75);
    else if (f > 0.1 && f < 0.17) {
      const r = fract(s[1] / 8) - 0.5;
      if (Math.abs(r) < 0.16 && Math.abs(f - 0.135) < 0.028) c = mix(c, GLINT, 0.7);
    }
    return c;
  });
}

/** Roller chain: alternating light and dark links along a closed sweep of length L. */
function chainPaint(L: number) {
  return paint((p, n, s) => {
    const link = Math.floor((s[0] * L) / 0.014);
    return link % 2 ? resolve(STEEL, p, n) : resolve(POL, p, n);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings. Pale grey, so the part's tint colours them and the engraving darkens the tint.
type GearTex = { tex: Texture; teeth: number };

/** A gear: toothed rim, windows between spokes (transparent), hub, rivet ring. Tooth 0 points up. */
function gearSvg(
  teeth: number,
  spokes: number,
  o: { tooth?: number; rim?: number; hub?: number; dots?: boolean; ratchet?: boolean; round?: boolean } = {},
): GearTex {
  const R = 48;
  const root = R * (1 - (o.tooth ?? 0.14));
  const rimIn = R * (o.rim ?? 0.68);
  const hub = R * (o.hub ?? 0.2);
  const step = TAU / teeth;
  const pt = (r: number, a: number) => `${(50 + r * Math.sin(a)).toFixed(2)} ${(50 - r * Math.cos(a)).toFixed(2)}`;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    if (o.ratchet) d += `${i ? "L" : "M"}${pt(root, a)}L${pt(R, a + 0.8 * step)}L${pt(root, a + 0.86 * step)}`;
    else if (o.round)
      d += `${i ? "L" : "M"}${pt(root, a - 0.32 * step)}L${pt(R * 0.985, a - 0.2 * step)}L${pt(R, a)}L${pt(R * 0.985, a + 0.2 * step)}L${pt(root, a + 0.32 * step)}`;
    else
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
  const tex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.4" cy="0.35" r="0.85"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b4b4b4"/></radialGradient></defs>
      <path d="${d}" fill="url(#g)" fill-rule="evenodd" stroke="#4d4d4d" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="${(hub * 1.25).toFixed(2)}" fill="url(#g)" stroke="#4d4d4d" stroke-width="1.6"/>
      ${ring(hub * 0.5, 1.8)}
      ${ring(rimIn + 1.5, 1.3)}
      ${o.dots ? ring((rimIn + root) / 2 + 2, 2, `stroke-dasharray="1.8 3.6"`) : ""}
    </svg>`,
    { size: 192 },
  );
  return { tex, teeth };
}

const G_BIG = gearSvg(20, 6, { dots: true });
const G_MID = gearSvg(16, 5, { rim: 0.7 });
const G_SMALL = gearSvg(12, 4, { rim: 0.62, hub: 0.26 });
const G_FINE = gearSvg(30, 0, { tooth: 0.09, dots: true });
const G_CROSS = gearSvg(24, 4, { tooth: 0.11, rim: 0.78, hub: 0.16 });
const G_SPROCKET = gearSvg(14, 7, { round: true, tooth: 0.12, rim: 0.66, hub: 0.18 });
const G_RATCHET = gearSvg(18, 5, { ratchet: true, tooth: 0.16, rim: 0.66 });

/** A pressure dial: cream face, ticks, numerals, a red zone. */
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
    { size: 192 },
  );
}
const DIAL = dialSvg();

/** The great clock face: cream enamel, minute track, Roman numerals, engraved rings and a maker's line. */
function clockFaceSvg() {
  const pt = (r: number, deg: number) =>
    `${(100 + r * Math.sin(deg * DEG)).toFixed(2)} ${(100 - r * Math.cos(deg * DEG)).toFixed(2)}`;
  let ticks = "";
  for (let i = 0; i < 60; i++) {
    const five = i % 5 === 0;
    ticks += `<path d="M${pt(95, i * 6)} L${pt(five ? 86 : 90.5, i * 6)}" stroke="${five ? "#8f2418" : "#2a1d10"}" stroke-width="${five ? 2.6 : 1.1}"/>`;
  }
  const rom = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  let nums = "";
  rom.forEach((t, i) => {
    const [x, y] = pt(73, i * 30).split(" ");
    nums += `<text x="${x}" y="${(Number(y) + 6).toFixed(1)}" text-anchor="middle" font-family="serif" font-weight="bold" font-size="${t.length > 2 ? 15 : 17}" fill="#231810">${t}</text>`;
  });
  let rays = "";
  for (let i = 0; i < 48; i++)
    rays += `<path d="M${pt(24, i * 7.5)} L${pt(i % 2 ? 40 : 46, i * 7.5)}" stroke="#a08a5c" stroke-width="0.8"/>`;
  let scallop = "";
  for (let i = 0; i < 24; i++)
    scallop += `<path d="M${pt(56, i * 15)} A5 5 0 0 1 ${pt(56, i * 15 + 15)}" stroke="#b09a6c" stroke-width="0.9" fill="none"/>`;
  return svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="99" fill="#4a3216"/>
      <circle cx="100" cy="100" r="97" fill="#eadfbc"/>
      <circle cx="100" cy="100" r="97" fill="none" stroke="#2a1d10" stroke-width="1.4"/>
      <circle cx="100" cy="100" r="96" fill="none" stroke="#b09a6c" stroke-width="3.5" stroke-dasharray="2 3.2"/>
      <circle cx="100" cy="100" r="83" fill="none" stroke="#2a1d10" stroke-width="1"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke="#2a1d10" stroke-width="0.9"/>
      ${scallop}${rays}${ticks}${nums}
      <circle cx="100" cy="100" r="20" fill="#d9caa0" stroke="#2a1d10" stroke-width="1"/>
      <text x="100" y="47" text-anchor="middle" font-family="serif" font-weight="bold" font-size="7.6" letter-spacing="1" fill="#3a2a14">TICK &amp; TOCK</text>
      <text x="100" y="157" text-anchor="middle" font-family="serif" font-weight="bold" font-size="6.4" letter-spacing="0.8" fill="#3a2a14">CROCODILUS HOROLOGICUS</text>
      <text x="100" y="166" text-anchor="middle" font-family="serif" font-size="5.6" letter-spacing="0.6" fill="#3a2a14">No. 1861 * LONDON</text>
    </svg>`,
    { size: 1024 },
  );
}
const CLOCK_FACE = clockFaceSvg();

/** A glowing lamp lens for a sphere whose top pole looks out: white-hot core, yellow and amber rings, fluted rays. */
function lampSvg() {
  let rays = "";
  for (let i = 0; i < 40; i++)
    rays += `<rect x="${i * 2}" y="6" width="2" height="9" fill="${i % 2 ? "#ffe680" : "#ffd04a"}" opacity="0.85"/>`;
  return svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="40" fill="#5c3a12"/>
      <rect y="0" width="80" height="6" fill="#fffbe4"/>
      <rect y="6" width="80" height="5" fill="#fff08c"/>
      <rect y="11" width="80" height="4" fill="#ffc934"/>
      ${rays}
      <rect y="15" width="80" height="4" fill="#ff9420"/>
      <rect y="19" width="80" height="2" fill="#3a2208"/>
      <rect y="21" width="80" height="4" fill="#b8843a"/>
    </svg>`,
    { size: 192 },
  );
}
const LAMP = lampSvg();

// ---------------------------------------------------------------------------------------------------------------
/** Geometry merged in model space: one mesh per bone, fill and texture, so hundreds of small pieces cost a few parts. */
type Lot = { bone: Joint; fill: Fill; tex?: Texture; group: string; geos: BufferGeometry[] };
class Batch {
  private lots = new Map<string, Lot>();
  private ids = new Map<unknown, number>();
  private id(x: unknown) {
    let v = this.ids.get(x);
    if (v === undefined) {
      v = this.ids.size;
      this.ids.set(x, v);
    }
    return v;
  }
  add(
    bone: Joint,
    fill: Fill,
    geo: BufferGeometry,
    at: Vector3,
    quat: Quaternion,
    group: string,
    tex?: Texture,
    scale = new Vector3(1, 1, 1),
  ) {
    const key = `${bone.name}|${this.id(fill)}|${tex ? this.id(tex) : -1}|${group}`;
    let lot = this.lots.get(key);
    if (!lot) {
      lot = { bone, fill, tex, group, geos: [] };
      this.lots.set(key, lot);
    }
    lot.geos.push(geo.clone().applyMatrix4(new Matrix4().compose(at, quat, scale)));
  }
  flush(b: Builder) {
    for (const lot of this.lots.values()) {
      const flats = lot.geos.map((g) => (g.index ? g.toNonIndexed() : g));
      const cat = (name: string) => {
        const arrays = flats.map((g) => g.getAttribute(name).array as ArrayLike<number>);
        const out = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
        let o = 0;
        for (const a of arrays) {
          out.set(a, o);
          o += a.length;
        }
        return out;
      };
      const geo = new BufferGeometry();
      geo.setAttribute("position", new Float32BufferAttribute(cat("position"), 3));
      geo.setAttribute("normal", new Float32BufferAttribute(cat("normal"), 3));
      geo.setAttribute("uv", new Float32BufferAttribute(cat("uv"), 2));
      b.part(geo, lot.fill, {
        bone: lot.bone,
        at: [0, 0, 0],
        texture: lot.tex,
        group: lot.group,
        name: `${lot.group}Batch`,
      });
    }
    this.lots.clear();
  }
}

/** A flat frame to lay things out in: origin, facing `n`, `up` in the plane, `right` = up x n (as seen from outside). */
type Panel = { o: Vector3; n: Vector3; up: Vector3; right: Vector3 };
function panel(o: Vector3, nIn: Vector3, upHint = V(0, 1, 0), flip = false): Panel {
  const n = nIn.clone().normalize();
  let up = upHint.clone().addScaledVector(n, -upHint.dot(n));
  if (up.lengthSq() < 1e-6) up = V(0, 0, 1).addScaledVector(n, -n.z);
  up.normalize();
  const right = new Vector3().crossVectors(up, n).normalize();
  return { o: o.clone(), n, up, right: flip ? right.negate() : right };
}
const place = (P: Panel, x: number, y: number, h = 0) =>
  P.o.clone().addScaledVector(P.right, x).addScaledVector(P.up, y).addScaledVector(P.n, h);
const inPlane = (P: Panel, a: number) => P.right.clone().multiplyScalar(Math.cos(a)).addScaledVector(P.up, Math.sin(a));

/** The joint of a chain whose position is closest to `p`. */
function nearestJoint(joints: readonly Joint[], p: Vector3) {
  let best = joints[0];
  let bestD = Infinity;
  for (const j of joints) {
    const d = j.at.distanceToSquared(p);
    if (d < bestD) {
      bestD = d;
      best = j;
    }
  }
  return best;
}

type GDef = {
  name: string;
  r: number;
  g: GearTex;
  tint: string;
  at?: [number, number];
  from?: number;
  ang?: number;
  phase?: number;
  spin?: boolean;
};

/** A sturdy chamfered rectangle outline, centred. */
function chamfered(w: number, h: number, c: number): [number, number][] {
  return [
    [-w / 2 + c, -h / 2],
    [w / 2 - c, -h / 2],
    [w / 2, -h / 2 + c],
    [w / 2, h / 2 - c],
    [w / 2 - c, h / 2],
    [-w / 2 + c, h / 2],
    [-w / 2, h / 2 - c],
    [-w / 2, -h / 2 + c],
  ];
}

export default function build() {
  const b = createBuilder({ name: "clockworkCrocodile", paintSize: 2048 });
  const random = rng(11);
  const batch = new Batch();

  // ------------------------------------------------------------------------------------------------ Skeleton
  const bodyStations = [
    { at: [0, 0.2, -2.05], w: 0.06, h: 0.06 },
    { at: [0, 0.24, -1.85], w: 0.12, h: 0.13 },
    { at: [0, 0.32, -1.5], w: 0.22, h: 0.24 },
    { at: [0, 0.41, -1.15], w: 0.34, h: 0.35 },
    { at: [0, 0.5, -0.8], w: 0.52, h: 0.44 },
    { at: [0, 0.57, -0.4], w: 0.68, h: 0.48 },
    { at: [0, 0.61, 0.0], w: 0.74, h: 0.5 },
    { at: [0, 0.62, 0.4], w: 0.74, h: 0.5 },
    { at: [0, 0.61, 0.75], w: 0.62, h: 0.44 },
    { at: [0, 0.6, 1.0], w: 0.5, h: 0.38 },
    { at: [0, 0.6, 1.2], w: 0.4, h: 0.32 },
  ] as const;
  const curve = catmull(bodyStations.map((s) => s.at));
  const hipsT = curve.closestT([0, 0.57, -0.35]);
  const neckT = curve.closestT([0, 0.62, 0.86]);
  const hips = b.joint("hips", { at: [0, 0.57, -0.35], role: "spine", group: "body" });
  const tail = b.chain("tail", curve.slice(hipsT, 0), { parent: hips, count: 9, role: "tail", group: "tail" });
  const spine = b.chain("spine", curve.slice(hipsT, neckT), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", curve.slice(neckT, 1), {
    parent: spine.joints[2],
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "neck",
  });
  const headDir = V(0, -0.05, 1);
  const skull = b.joint("head", {
    parent: neck.joints[1],
    at: curve.at(1),
    dir: headDir,
    role: "head",
    group: "head",
  });

  // ------------------------------------------------------------------------------------------------ Body
  const bodyLen = curve.length;
  const hull = hullPaint(bodyLen, 0.27, BRASS_OLD, COP, IRONB);
  const body = b.loft(bodyStations, {
    bone: [tail, hips, spine, neck],
    color: hull,
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "none" },
    group: "body",
    name: "hull",
  });
  const bodySurf = b.surface(body);

  // ------------------------------------------------------------------------------------------------ Gears
  /** One toothed wheel: two drawn faces, a rim ring, a hub nut; `spin` gives it a joint at its centre. */
  const gear = (o: {
    name?: string;
    bone: Joint;
    at: Vector3;
    n: Vector3;
    up: Vector3;
    r: number;
    g: GearTex;
    tint: string;
    group: string;
    spin?: boolean;
    thick?: number;
    boss?: number;
    rim?: Fill;
  }) => {
    const thick = o.thick ?? Math.max(0.008, o.r * 0.13);
    const bone = o.spin ? b.joint(o.name ?? "gear", { parent: o.bone, at: o.at, dir: o.n, group: o.group }) : o.bone;
    const qz = aim(o.n, o.up, "z");
    const qy = aim(o.n);
    const back = aim(o.n.clone().negate(), o.up, "z");
    const put = (geo: BufferGeometry, fill: Fill, at: Vector3, quat: Quaternion, tex?: Texture) => {
      if (o.spin) b.part(geo, fill, { bone, at, quat, texture: tex, group: o.group });
      else batch.add(bone, fill, geo, at, quat, o.group, tex);
    };
    const size = (2 * o.r * 50) / 48;
    const h = thick / 2 + 0.0012;
    put(new PlaneGeometry(size, size), o.tint, o.at.clone().addScaledVector(o.n, h), qz, o.g.tex);
    put(new PlaneGeometry(size, size), o.tint, o.at.clone().addScaledVector(o.n, -h), back, o.g.tex);
    put(new CylinderGeometry(o.r * 0.865, o.r * 0.865, thick, Math.max(8, o.g.teeth), 1, true), o.rim ?? MID, o.at, qy);
    put(new CylinderGeometry(o.r * 0.13, o.r * 0.13, thick + 0.016, 6), POL, o.at, qy);
    if (o.boss)
      put(
        new CylinderGeometry(o.r * 0.1, o.r * 0.1, o.boss, 6),
        OLD,
        o.at.clone().addScaledVector(o.n, -(thick / 2 + o.boss / 2)),
        qy,
      );
    return bone;
  };

  /**
   * A cluster of meshing gears on a panel. The first def has `at` (panel x, y in meters); the others hang off an
   * earlier one (`from`) in direction `ang` (degrees, counter-clockwise from panel right), snapped to that gear's
   * nearest tooth and spaced at mesh distance, with their own tooth 0 turned so a gap faces the parent.
   * `base` is the plane distance from the panel origin for the first layer; meshed neighbours alternate layers.
   */
  const cluster = (
    P: Panel,
    defs: GDef[],
    o: {
      bone: Joint;
      boneFor?: (c: Vector3) => Joint;
      group: string;
      base: number;
      depth?: (c: Vector3) => number;
      boss?: number;
    },
  ) => {
    const centres: [number, number][] = [];
    const phis: number[] = [];
    const layers: number[] = [];
    const joints: Joint[] = [];
    defs.forEach((d) => {
      let c: [number, number];
      let phi: number;
      let layer = 0;
      if (d.from === undefined) {
        c = d.at!;
        phi = (d.phase ?? 0) * DEG;
      } else {
        const p = defs[d.from];
        const stepP = TAU / p.g.teeth;
        const k = Math.round(((d.ang ?? 0) * DEG - phis[d.from]) / stepP);
        const a = phis[d.from] + k * stepP;
        const dist = 0.935 * (p.r + d.r);
        c = [centres[d.from][0] + Math.cos(a) * dist, centres[d.from][1] + Math.sin(a) * dist];
        phi = a + Math.PI - TAU / d.g.teeth / 2;
        layer = layers[d.from] ^ 1;
      }
      centres.push(c);
      phis.push(phi);
      layers.push(layer);
      const flat = place(P, c[0], c[1], 0);
      const depth = o.depth ? o.depth(flat) : o.base;
      const at = place(P, c[0], c[1], depth + layer * 0.007);
      joints.push(
        gear({
          name: d.name,
          bone: o.boneFor ? o.boneFor(flat) : o.bone,
          at,
          n: P.n,
          up: inPlane(P, phi),
          r: d.r,
          g: d.g,
          tint: d.tint,
          group: o.group,
          spin: d.spin,
          boss: o.boss ?? (o.depth ? Math.max(0.02, depth) : undefined),
        }),
      );
    });
    return { centres, joints };
  };

  // ------------------------------------------------------------------------------------------------ Head
  const hs = 1.1;
  const head = b.region({ at: skull, scale: hs, quat: aim(headDir, [0, 1, 0], "z") });
  const upperKeys = [
    [-0.12, 0, 0.42, 0.24],
    [0.04, 0.02, 0.46, 0.19],
    [0.16, 0.015, 0.4, 0.16],
    [0.3, 0, 0.3, 0.12],
    [0.44, -0.008, 0.24, 0.1],
    [0.56, -0.01, 0.2, 0.09],
    [0.66, -0.012, 0.23, 0.095],
    [0.74, -0.015, 0.15, 0.07],
  ] as const;
  const EMBER = "#e0561c";
  const EMBER_DARK = "#7a2a0e";
  const headPaint = hullPaint(0.9, 0.2, MID, COP, OLD);
  const upper = b.loft(
    upperKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w: w * hs, h: h * hs })),
    {
      bone: skull,
      color: headPaint,
      sectors: [[132, 228, EMBER_DARK]],
      sides: 8,
      smooth: false,
      group: "head",
      name: "upperJaw",
    },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.07, -0.02],
    aim: [0, -0.075, 0.7],
    role: "jaw",
    group: "jaw",
  });
  const lowerKeys = [
    [-0.1, -0.075, 0.36, 0.09],
    [0.04, -0.095, 0.4, 0.1],
    [0.16, -0.095, 0.34, 0.085],
    [0.3, -0.09, 0.25, 0.07],
    [0.44, -0.086, 0.2, 0.06],
    [0.56, -0.084, 0.18, 0.056],
    [0.66, -0.082, 0.2, 0.06],
    [0.72, -0.08, 0.14, 0.05],
  ] as const;
  const lower = b.loft(
    lowerKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w: w * hs, h: h * hs })),
    {
      bone: jaw,
      color: hullPaint(0.9, 0.2, MID, OLD, FE),
      sectors: [[-52, 52, EMBER]],
      sides: 8,
      smooth: false,
      group: "jaw",
      name: "lowerJaw",
    },
  );

  // Teeth: brass cones seated on rays cast at the real jaw surfaces, merged one part per jaw.
  const upperSurface = b.surface(upper);
  const lowerSurface = b.surface(lower);
  const halfW = (keys: readonly (readonly number[])[], z: number) => {
    for (let i = 1; i < keys.length; i++)
      if (z <= keys[i][0]) {
        const t = (z - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return (keys[i - 1][2] + (keys[i][2] - keys[i - 1][2]) * t) / 2;
      }
    return keys[keys.length - 1][2] / 2;
  };
  for (const s of [1, -1]) {
    for (let i = 0; i < 12; i++) {
      const z = 0.7 - i * 0.052;
      const hit = upperSurface.ray(head.p([s * halfW(upperKeys, z) * 0.72, -0.4, z]), head.d([0, 1, 0]));
      if (!hit) continue;
      const len = (0.04 + random() * 0.01) * (i === 2 || i === 6 ? 1.4 : i > 8 ? 0.75 : 1);
      const dir = head.d([s * 0.16, -1, 0.05]).normalize();
      batch.add(
        skull,
        POL,
        new ConeGeometry(len * 0.32, len, 5),
        hit.at.clone().addScaledVector(dir, -len * 0.25),
        aim(dir.clone().negate()),
        "head",
      );
    }
    for (let i = 0; i < 11; i++) {
      const z = 0.66 - i * 0.055;
      const hit = lowerSurface.ray(head.p([s * halfW(lowerKeys, z) * 0.7, 0.4, z]), head.d([0, -1, 0]));
      if (!hit) continue;
      const len = (0.036 + random() * 0.01) * (i === 3 ? 1.5 : i > 8 ? 0.75 : 1);
      const dir = head.d([s * 0.12, 1, 0.04]).normalize();
      batch.add(
        jaw,
        POL,
        new ConeGeometry(len * 0.32, len, 5),
        hit.at.clone().addScaledVector(dir, len * 0.25),
        aim(dir.clone().negate()),
        "jaw",
      );
    }
  }

  // Lamp eyes: brass turrets on the back of the skull, each a bezel round a glowing lens under a rain hood.
  for (const s of [1, -1]) {
    const socket = head.p([s * 0.14, 0.125, 0.04]);
    const gaze = head.d([s * 0.5, 0.5, 0.7]).normalize();
    b.lathe(
      [
        [0, -0.07],
        [0.09, -0.07],
        [0.108, -0.035],
        [0.108, 0.01],
        [0.092, 0.024],
        [0, 0.024],
      ],
      { at: socket, axis: gaze, segments: 10, color: MID, bone: skull, group: "head", name: "lampHousing" },
    );
    b.part(new SphereGeometry(0.09, 12, 8), "#ffffff", {
      bone: skull,
      at: socket.clone().addScaledVector(gaze, 0.046),
      dir: gaze,
      texture: LAMP,
      group: "head",
      name: "lampLens",
    });
    b.part(new TorusGeometry(0.098, 0.012, 5, 12), POL, {
      bone: skull,
      at: socket.clone().addScaledVector(gaze, 0.03),
      dir: gaze,
      axis: "z",
      group: "head",
    });
    const cageUp = head.d([0, 1, 0]);
    for (let k = -1; k <= 1; k++) {
      const base = socket.clone().addScaledVector(gaze, 0.032);
      const side = new Vector3().crossVectors(gaze, cageUp).normalize();
      b.rod(
        base
          .clone()
          .addScaledVector(side, k * 0.055)
          .addScaledVector(cageUp, 0.036),
        base
          .clone()
          .addScaledVector(side, k * 0.02)
          .addScaledVector(gaze, 0.07)
          .addScaledVector(cageUp, 0.03),
        0.006,
        { bone: skull, color: POL, sides: 5, group: "head" },
      );
    }
  }

  // Nostril vents at the snout tip and a forehead pressure gauge.
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0, 0],
        [0.026, 0],
        [0.03, 0.012],
        [0.024, 0.02],
        [0, 0.02],
      ],
      {
        at: head.p([s * 0.045, 0.028, 0.72]),
        axis: head.d([s * 0.3, 1, 0.5]),
        segments: 8,
        color: POL,
        bone: skull,
        group: "head",
      },
    );
    b.part(new CylinderGeometry(0.015, 0.015, 0.006, 6), FE, {
      bone: skull,
      at: head.p([s * 0.045, 0.028, 0.72]).addScaledVector(head.d([s * 0.3, 1, 0.5]).normalize(), 0.019),
      dir: head.d([s * 0.3, 1, 0.5]),
      group: "head",
    });
  }
  {
    const fh = upperSurface.ray(head.p([0, 0.4, 0.28]), head.d([0, -1, 0]));
    if (fh) {
      const gp = panel(fh.at, fh.axis, head.d([0, 0, 1]));
      b.lathe(
        [
          [0, -0.01],
          [0.05, -0.01],
          [0.05, 0.014],
          [0, 0.014],
        ],
        { at: fh.at, axis: fh.axis, segments: 10, color: MID, bone: skull, group: "head" },
      );
      b.part(new CircleGeometry(0.043, 16), "#ffffff", {
        bone: skull,
        at: place(gp, 0, 0, 0.0155),
        dir: fh.axis,
        axis: "z",
        up: gp.up,
        texture: DIAL,
        group: "head",
      });
      b.part(new TorusGeometry(0.048, 0.006, 5, 12), POL, {
        bone: skull,
        at: place(gp, 0, 0, 0.014),
        dir: fh.axis,
        axis: "z",
        group: "head",
      });
    }
  }

  // cheek and crown gears on the snout and skull
  for (const s of [1, -1]) {
    const ch = upperSurface.ray(head.p([s * 0.4, 0, 0.34]), head.d([-s, 0, 0]));
    if (ch) {
      const CH = panel(ch.at, ch.axis, head.d([0, 1, 0]), s < 0);
      cluster(
        CH,
        [
          { name: "cheekGear", at: [0, 0], r: 0.05, g: G_MID, tint: T_BRASS, phase: 0 },
          { name: "cheekGearB", from: 0, ang: 210, r: 0.033, g: G_SMALL, tint: T_COPPER },
        ],
        { bone: skull, group: "head", base: 0.012 },
      );
    }
  }
  {
    const cr = upperSurface.ray(head.p([0, 0.4, 0.15]), head.d([0, -1, 0]));
    if (cr) {
      const CR = panel(cr.at, cr.axis, head.d([0, 0, 1]));
      cluster(CR, [{ name: "crownGear", at: [0, 0], r: 0.06, g: G_BIG, tint: T_BRASS, phase: 0 }], {
        bone: skull,
        group: "head",
        base: 0.012,
      });
    }
  }
  // Rest pose: jaw open one tooth of the hinge gear (22.5 degrees), so the gears stay meshed.
  batch.flush(b);
  b.pose(jaw, { axis: head.d([1, 0, 0]), deg: 22.5 });

  // ---- jaw linkage on each cheek: a gear on the jaw meshes a drive gear on the skull, whose crank wheel pushes the
  // jaw through a connecting rod; a hydraulic piston runs beside it. Coordinates: f forward, u up, h out of the cheek.
  const hingeAxis = head.d([1, 0, 0]).normalize();
  const openRot = (p: Vector3) =>
    p
      .clone()
      .sub(jaw.at)
      .applyAxisAngle(hingeAxis, 22.5 * DEG)
      .add(jaw.at);
  const F = head.d([0, 0, 1]).normalize();
  const U = head.d([0, 1, 0]).normalize();
  const dirFU = (a: number) => F.clone().multiplyScalar(Math.cos(a)).addScaledVector(U, Math.sin(a));
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const N = head.d([s, 0, 0]).normalize();
    const jp = (f: number, u: number, h: number) =>
      jaw.at
        .clone()
        .addScaledVector(F, f)
        .addScaledVector(U, u)
        .addScaledVector(N, 0.26 + h);
    b.extrude(chamfered(0.48, 0.36, 0.06), {
      at: jp(0.12, 0.07, -0.005),
      x: F,
      y: U,
      thickness: 0.05,
      bevel: 0.006,
      color: platePaint(0.48, 0.36, IRONB),
      bone: skull,
      group: "jawGear",
      name: `jawPlate${side}`,
    });
    const theta = 70 * DEG;
    const jawGearAt = jp(0, 0, 0.04);
    gear({
      bone: jaw,
      at: jawGearAt,
      n: N,
      up: dirFU(theta),
      r: 0.11,
      g: G_MID,
      tint: T_BRASS,
      group: "jawGear",
      rim: OLD,
      thick: 0.014,
    });
    const driveAt = jawGearAt
      .clone()
      .addScaledVector(dirFU(theta), 0.935 * (0.11 + 0.07))
      .addScaledVector(N, 0.007);
    gear({
      name: `jawDrive${side}`,
      bone: skull,
      at: driveAt,
      n: N,
      up: dirFU(theta + Math.PI - TAU / G_SMALL.teeth / 2),
      r: 0.07,
      g: G_SMALL,
      tint: T_COPPER,
      group: "jawGear",
      spin: true,
      thick: 0.014,
    });
    const crankAt = driveAt.clone().addScaledVector(N, 0.022);
    const crank = gear({
      name: `jawCrank${side}`,
      bone: skull,
      at: crankAt,
      n: N,
      up: dirFU(0.4),
      r: 0.062,
      g: G_CROSS,
      tint: T_GOLD,
      group: "jawGear",
      spin: true,
      thick: 0.012,
    });
    const pinAt = crankAt
      .clone()
      .addScaledVector(dirFU(215 * DEG), 0.034)
      .addScaledVector(N, 0.02);
    b.part(new CylinderGeometry(0.009, 0.009, 0.034, 6), POL, { bone: crank, at: pinAt, dir: N, group: "jawGear" });
    const lug = openRot(jp(0.21, -0.035, 0.055));
    b.rod(pinAt.clone().addScaledVector(N, 0.006), lug, 0.008, {
      bone: jaw,
      color: SILVER,
      sides: 6,
      group: "jawGear",
    });
    b.part(new SphereGeometry(0.016, 6, 5), POL, { bone: jaw, at: lug, group: "jawGear" });
    const top = jp(-0.03, 0.19, 0.07);
    const barrelEnd = jp(0.1, 0.11, 0.07);
    b.rod(top, barrelEnd, 0.021, { bone: skull, color: MID, sides: 8, group: "jawGear", name: "jawPiston" });
    b.rod(barrelEnd, openRot(jp(0.25, -0.03, 0.07)), 0.009, {
      bone: jaw,
      color: SILVER,
      sides: 6,
      group: "jawGear",
    });
    b.part(new SphereGeometry(0.02, 6, 4), POL, { bone: skull, at: top, group: "jawGear" });
  }

  // ------------------------------------------------------------------------------------------------ Legs
  const legPaint = hullPaint(1.2, 0.2, MID, COP, OLD);
  const legs: Chain[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    for (const front of [true, false]) {
      const footR = 0.036;
      const root = front ? V(s * 0.37, 0.47, 0.74) : V(s * 0.37, 0.47, -0.3);
      const target = front ? V(s * 0.64, footR + 0.01, 0.9) : V(s * 0.64, footR + 0.01, -0.16);
      const leg = b.chain(
        front ? `arm${side}` : `leg${side}`,
        limb(
          root,
          target,
          [0.34, 0.32, 0.16],
          [
            [s, 0.3, front ? -0.5 : 0.5],
            [0, 1, -0.5],
          ],
          { sole: [s * 0.35, -0.3, 1] },
        ),
        {
          parent: front ? spine.joints[2] : hips,
          names: front
            ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
            : [`hip${side}`, `knee${side}`, `ankle${side}`],
          role: "leg",
          group: front ? `legF${side}` : `legH${side}`,
        },
      );
      legs.push(leg);
      const T = leg.ts;
      const grp = front ? `legF${side}` : `legH${side}`;
      b.sweep(
        leg,
        (t) => {
          const r =
            t < T[1] ? 0.1 - 0.035 * (t / T[1]) : t < T[2] ? 0.065 - 0.015 * ((t - T[1]) / (T[2] - T[1])) : 0.05;
          const ry = t < T[2] ? r : 0.036;
          return [r * 1.05, ry];
        },
        { color: legPaint, sides: 8, smooth: false, group: grp },
      );
      const j = leg.joints;
      // hip/shoulder drum on the outside of the root with two meshed gears on its face
      const drumC = root.clone().add(V(s * 0.06, 0, 0));
      b.lathe(
        [
          [0, -0.05],
          [0.125, -0.05],
          [0.135, -0.035],
          [0.135, 0.035],
          [0.125, 0.05],
          [0, 0.05],
        ],
        {
          at: drumC,
          axis: [s, 0, 0],
          segments: 12,
          color: bandedPaint(MID, POL, [-0.035, 0.035], 0.008, 22),
          bone: j[0],
          group: grp,
          name: "drum",
        },
      );
      const DP = panel(drumC.clone().add(V(s * 0.05, 0, 0)), V(s, 0, 0), V(0, 1, 0));
      cluster(
        DP,
        [
          {
            name: `${front ? "gearShoulder" : "gearHip"}${side}`,
            at: [0, 0],
            r: 0.1,
            g: G_BIG,
            tint: T_BRASS,
            phase: 90,
            spin: true,
          },
          {
            name: `${front ? "pinionShoulder" : "pinionHip"}${side}`,
            from: 0,
            ang: front ? 230 : 300,
            r: 0.055,
            g: G_SMALL,
            tint: T_COPPER,
            spin: true,
          },
        ],
        { bone: j[0], group: grp, base: 0.006 },
      );
      // knee joint drum and a gear face
      const kp = j[1].at;
      b.lathe(
        [
          [0, -0.05],
          [0.075, -0.05],
          [0.08, -0.04],
          [0.08, 0.04],
          [0.075, 0.05],
          [0, 0.05],
        ],
        {
          at: kp.clone().add(V(s * 0.0, 0, 0)),
          axis: [s, 0, 0],
          segments: 10,
          color: OLD,
          bone: j[1],
          group: grp,
          name: "kneeDrum",
        },
      );
      const KP = panel(kp.clone().add(V(s * 0.05, 0, 0)), V(s, 0, 0), V(0, 1, 0));
      gear({
        bone: j[1],
        at: place(KP, 0, 0, 0.006),
        n: KP.n,
        up: V(0, 1, 0),
        r: 0.06,
        g: G_SPROCKET,
        tint: T_GOLD,
        group: grp,
        rim: MID,
      });
      // piston: brass barrel on the upper segment, steel rod down to the lower one
      const off = V(s * 0.6, 0, front ? 0.8 : 0.8)
        .normalize()
        .multiplyScalar(0.085);
      const a0 = j[0].at.clone().lerp(j[1].at, 0.18).add(off);
      const a1 = j[0].at.clone().lerp(j[1].at, 0.82).add(off);
      const a2 = j[1].at.clone().lerp(j[2].at, 0.45).add(off.clone().multiplyScalar(0.8));
      b.rod(a0, a1, 0.024, { bone: j[0], color: MID, sides: 8, group: grp, name: "piston" });
      b.rod(a1, a2, 0.01, { bone: j[1], color: SILVER, sides: 6, group: grp, name: "pistonRod" });
      for (const p of [a0, a1]) b.part(new SphereGeometry(0.03, 6, 4), POL, { bone: j[0], at: p, group: grp });
      b.part(new SphereGeometry(0.018, 6, 4), POL, { bone: j[1], at: a2, group: grp });
      // a meshed pair lying on top of the upper segment
      const LP = panel(
        j[0].at
          .clone()
          .lerp(j[1].at, 0.5)
          .add(V(0, 0.1, 0)),
        V(s * 0.15, 1, 0),
        V(0, 0, 1),
        s < 0,
      );
      cluster(
        LP,
        [
          { name: "legGear", at: [0, 0], r: 0.07, g: G_MID, tint: T_GOLD, phase: 0 },
          { name: "legGearB", from: 0, ang: 200, r: 0.045, g: G_SMALL, tint: T_COPPER },
        ],
        { bone: j[0], group: grp, base: 0.008 },
      );

      // digits: four two-joint chains lying on the floor
      const tip = leg.at(1);
      const end = j[2];
      const fwd = tip.tangent.clone().setY(0).normalize();
      const outward = new Vector3(fwd.z, 0, -fwd.x).multiplyScalar(s);
      const lens = [0.11, 0.15, 0.15, 0.12];
      const spread = [-38, -12, 12, 38];
      for (let i = 0; i < 4; i++) {
        const base = tip.at
          .clone()
          .addScaledVector(outward, (i - 1.5) * 0.05)
          .addScaledVector(fwd, -0.02);
        base.y = footR + 0.006;
        const dir = fwd.clone().applyAxisAngle(V(0, 1, 0), s * spread[i] * DEG);
        const m = base.clone().addScaledVector(dir, lens[i] * 0.55);
        const e = base.clone().addScaledVector(dir, lens[i]);
        m.y = footR * 0.9 + 0.006;
        e.y = footR * 0.75 + 0.006;
        const prefix = front ? "finger" : "toe";
        const ch = b.chain(`${prefix}${side}${i + 1}`, [base, m, e], {
          parent: end,
          names: [`${prefix}${side}${i + 1}a`, `${prefix}${side}${i + 1}b`],
          role: "digit",
          group: grp,
        });
        b.sweep(ch, (t) => [footR * 1.05 * (1 - 0.3 * t), footR * (1 - 0.25 * t)], {
          color: legPaint,
          sides: 6,
          smooth: false,
          group: grp,
        });
        b.spike(ch.at(1).at, dir.clone().setY(-0.25), 0.05, footR * 0.7, {
          bone: ch.joints[1],
          color: STEEL,
          sides: 5,
          group: grp,
        });
      }
    }
  }

  // ------------------------------------------------------------------------------------------------ Clock
  const chestBone = spine.joints[1];
  const clockC = V(0, 1.2, 0.05);
  const clockN = V(0, 0.6, 0.8).normalize();
  const clockUp = V(0, 0.8, -0.6).normalize();
  const CP = panel(clockC, clockN, clockUp);
  const clock = b.joint("clockFace", { parent: chestBone, at: clockC, dir: clockN, group: "clock" });
  b.lathe(
    [
      [0, -0.15],
      [0.3, -0.15],
      [0.335, -0.12],
      [0.335, -0.03],
      [0, -0.03],
    ],
    {
      at: clockC,
      axis: clockN,
      segments: 20,
      color: bandedPaint(COP, POL, [-0.06, -0.12], 0.014, 40),
      bone: clock,
      group: "clock",
      name: "clockDrum",
    },
  );
  b.lathe(
    [
      [0.275, -0.03],
      [0.345, -0.03],
      [0.35, 0],
      [0.335, 0.04],
      [0.3, 0.055],
      [0.275, 0.03],
    ],
    { at: clockC, axis: clockN, segments: 24, color: POL, bone: clock, group: "clock", name: "clockBezel" },
  );
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * TAU;
    batch.add(
      clock,
      MID,
      new SphereGeometry(0.009, 5, 3),
      place(CP, Math.cos(a) * 0.322, Math.sin(a) * 0.322, 0.048),
      new Quaternion(),
      "clock",
    );
  }
  b.part(new CircleGeometry(0.288, 40), "#ffffff", {
    bone: clock,
    at: place(CP, 0, 0, -0.018),
    dir: clockN,
    axis: "z",
    up: clockUp,
    texture: CLOCK_FACE,
    group: "clock",
    name: "clockFace",
  });
  const HOUR: OutlinePoint[] = [
    [-0.035, -0.008],
    [0.02, -0.012],
    [0.06, -0.012],
    [0.085, -0.03],
    [0.125, 0, "sharp"],
    [0.085, 0.03],
    [0.06, 0.012],
    [0.02, 0.012],
    [-0.035, 0.008],
  ];
  const MINUTE: OutlinePoint[] = [
    [-0.045, -0.007],
    [0.05, -0.009],
    [0.13, -0.009],
    [0.155, -0.02],
    [0.245, 0, "sharp"],
    [0.155, 0.02],
    [0.13, 0.009],
    [0.05, 0.009],
    [-0.045, 0.007],
  ];
  const SECOND: OutlinePoint[] = [
    [-0.07, -0.006],
    [-0.05, -0.006],
    [0.26, -0.0028],
    [0.272, 0, "sharp"],
    [0.26, 0.0028],
    [-0.05, 0.006],
    [-0.07, 0.006],
  ];
  const hand = (name: string, h: number, clockwiseDeg: number, outline: OutlinePoint[], color: Fill) => {
    const j = b.joint(name, { parent: clock, at: place(CP, 0, 0, h), dir: clockN, group: "clock" });
    const d = inPlane(CP, (90 - clockwiseDeg) * DEG);
    const y = new Vector3().crossVectors(clockN, d).normalize();
    b.extrude(outline, {
      at: place(CP, 0, 0, h),
      x: d,
      y,
      thickness: 0.006,
      bevel: 0.0015,
      color,
      bone: j,
      group: "clock",
      name,
    });
    return j;
  };
  hand("hourHand", 0.004, 305, HOUR, STEEL);
  hand("minuteHand", 0.012, 62, MINUTE, STEEL);
  hand("secondHand", 0.02, 252, SECOND, COP);
  b.part(new CylinderGeometry(0.022, 0.022, 0.012, 12), POL, {
    bone: clock,
    at: place(CP, 0, 0, 0.03),
    dir: clockN,
    group: "clock",
  });
  b.part(new SphereGeometry(0.014, 8, 5), POL, { bone: clock, at: place(CP, 0, 0, 0.038), group: "clock" });

  // Movement on the back of the drum: a gear train, a ticking balance wheel with its hairspring.
  const RP = panel(place(CP, 0, 0, -0.15), clockN.clone().negate(), clockUp);
  cluster(
    RP,
    [
      { name: "gearClockMain", at: [0, -0.03], r: 0.12, g: G_BIG, tint: T_BRASS, phase: 20, spin: true },
      { name: "gearClockA", from: 0, ang: 20, r: 0.07, g: G_MID, tint: T_COPPER, spin: true },
      { name: "gearClockB", from: 0, ang: 165, r: 0.075, g: G_CROSS, tint: T_GOLD, spin: true },
      { name: "gearClockC", from: 1, ang: 75, r: 0.045, g: G_SMALL, tint: T_STEEL, spin: true },
      { name: "gearClockD", from: 2, ang: 115, r: 0.05, g: G_SMALL, tint: T_BRASS, spin: true },
      { name: "gearClockE", from: 0, ang: 260, r: 0.05, g: G_FINE, tint: T_BRONZE, spin: true },
    ],
    { bone: clock, group: "clockMovement", base: 0.012 },
  );
  {
    const bc = place(RP, 0, 0.215, 0.03);
    const balance = gear({
      name: "balanceWheel",
      bone: clock,
      at: bc,
      n: RP.n,
      up: RP.up,
      r: 0.072,
      g: G_CROSS,
      tint: T_STEEL,
      group: "clockMovement",
      spin: true,
      rim: STEEL,
    });
    const pts: Vector3[] = [];
    for (let i = 0; i <= 26; i++) {
      const a = (i / 26) * 4.2 * TAU;
      const r = 0.008 + (0.05 - 0.008) * (i / 26);
      pts.push(
        bc
          .clone()
          .addScaledVector(RP.right, Math.cos(a) * r)
          .addScaledVector(RP.up, Math.sin(a) * r)
          .addScaledVector(RP.n, 0.016),
      );
    }
    b.sweep(catmull(pts), 0.0025, { bone: balance, color: STEEL, sides: 4, group: "clockMovement" });
  }
  // Struts brace the drum to the back.
  for (const [x, y, h] of [
    [0.22, 0.22, -0.11],
    [-0.22, 0.22, -0.11],
    [0.335, 0, -0.09],
    [-0.335, 0, -0.09],
  ] as const) {
    const from = place(CP, x, y, h);
    const hit = bodySurf.ray([from.x, 2, from.z], [0, -1, 0]);
    if (hit) {
      b.rod(from, hit.at, 0.02, { bone: chestBone, color: MID, sides: 6, group: "clock" });
      b.part(new CylinderGeometry(0.036, 0.036, 0.012, 8), POL, {
        bone: chestBone,
        at: hit.at,
        dir: hit.axis,
        group: "clock",
      });
    }
  }
  // Winding key on the side of the drum.
  {
    const kp = place(CP, 0.345, 0, -0.09);
    const key = b.joint("windingKey", { parent: clock, at: kp, dir: [1, 0, 0], group: "clock" });
    b.lathe(
      [
        [0, -0.02],
        [0.03, -0.02],
        [0.03, 0.008],
        [0.02, 0.014],
        [0, 0.014],
      ],
      { at: kp, axis: [1, 0, 0], segments: 6, color: MID, bone: clock, group: "clock" },
    );
    b.part(new CylinderGeometry(0.008, 0.008, 0.09, 6), POL, {
      bone: key,
      at: kp.clone().add(V(0.05, 0, 0)),
      dir: [1, 0, 0],
      group: "clock",
    });
    for (const s of [1, -1])
      b.extrude(
        [
          [0, -0.012],
          [0.03, -0.03],
          [0.07, -0.03],
          [0.085, 0],
          [0.07, 0.03],
          [0.03, 0.03],
          [0, 0.012],
        ],
        {
          at: kp.clone().add(V(0.1, 0, 0)),
          x: [0, 0, s],
          y: [0, 1, 0],
          thickness: 0.012,
          bevel: 0.003,
          color: POL,
          bone: key,
          group: "clock",
        },
      );
  }

  // ------------------------------------------------------------------------------------------------ Boiler and stack
  const boilerC = V(0, 0.85, -0.8);
  const boiler = b.lathe(
    [
      [0, -0.4],
      [0.06, -0.395],
      [0.11, -0.37],
      [0.15, -0.33],
      [0.155, -0.3],
      [0.155, 0.3],
      [0.15, 0.33],
      [0.11, 0.37],
      [0.06, 0.395],
      [0, 0.4],
    ],
    {
      at: boilerC,
      axis: [0, 0, 1],
      segments: 14,
      color: bandedPaint(COP, POL, [-0.3, -0.12, 0.12, 0.3], 0.02, 30),
      bone: hips,
      group: "boiler",
      name: "boiler",
    },
  );
  void boiler;
  for (const s of [1, -1]) {
    // gauge with a housing, dial, bezel and bracket
    const gp = panel(boilerC.clone().add(V(s * 0.158, 0.02, -0.05)), V(s, 0, 0));
    b.lathe(
      [
        [0, -0.02],
        [0.062, -0.02],
        [0.062, 0.012],
        [0, 0.012],
      ],
      { at: gp.o, axis: [s, 0, 0], segments: 12, color: MID, bone: hips, group: "boiler" },
    );
    b.part(new CircleGeometry(0.052, 16), "#ffffff", {
      bone: hips,
      at: place(gp, 0, 0, 0.0135),
      dir: gp.n,
      axis: "z",
      up: gp.up,
      texture: DIAL,
      group: "boiler",
    });
    b.part(new TorusGeometry(0.058, 0.008, 5, 14), POL, {
      bone: hips,
      at: place(gp, 0, 0, 0.012),
      dir: gp.n,
      axis: "z",
      group: "boiler",
    });
    // steam pipe from the boiler's front to the clock drum, with couplings
    const pipe = catmull([
      boilerC.clone().add(V(s * 0.09, 0.1, 0.36)),
      boilerC.clone().add(V(s * 0.16, 0.1, 0.5)),
      V(s * 0.22, 1.0, -0.2),
      V(s * 0.3, 1.1, -0.02),
    ]);
    b.sweep(pipe, 0.019, { bone: chestBone, color: COP, sides: 6, group: "boiler", name: "steamPipe" });
    b.along(pipe, 3, (at) => {
      batch.add(chestBone, POL, new CylinderGeometry(0.03, 0.03, 0.036, 6), at.at, aim(at.axis), "boiler");
    });
  }
  // safety valve: a stub, a spring and a weight ball
  {
    const vb = boilerC.clone().add(V(0, 0.154, -0.16));
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.04, 0.02],
        [0.022, 0.03],
        [0.022, 0.07],
        [0.03, 0.08],
        [0, 0.08],
      ],
      { at: vb, axis: [0, 1, 0], segments: 8, color: POL, bone: hips, group: "boiler" },
    );
    b.part(new SphereGeometry(0.036, 8, 6), OLD, { bone: hips, at: vb.clone().add(V(0, 0.115, 0)), group: "boiler" });
  }
  // the stack: a flared brass chimney with bands, soot inside, and four faceted puffs of smoke above
  const stackBase = boilerC.clone().add(V(0, 0.14, 0.26));
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.1, 0.03],
      [0.07, 0.055],
      [0.055, 0.1],
      [0.052, 0.4],
      [0.07, 0.45],
      [0.095, 0.51],
      [0.088, 0.535],
      [0.06, 0.525],
      [0, 0.52],
    ],
    {
      at: stackBase,
      axis: [0, 1, 0],
      segments: 12,
      color: bandedPaint(MID, POL, [0.07, 0.22, 0.4], 0.016, 24),
      bone: hips,
      group: "boiler",
      name: "stack",
    },
  );
  b.part(new CylinderGeometry(0.062, 0.062, 0.004, 12), FE, {
    bone: hips,
    at: stackBase.clone().add(V(0, 0.531, 0)),
    group: "boiler",
  });
  const puffs: [number, number, number, number][] = [
    [0, 0.6, 0.0, 0.08],
    [0.02, 0.74, -0.09, 0.105],
    [-0.03, 0.9, -0.22, 0.13],
    [0.03, 1.07, -0.4, 0.155],
    [0.09, 0.72, -0.05, 0.06],
    [-0.08, 0.86, -0.16, 0.075],
    [0.1, 1.0, -0.3, 0.09],
  ];
  puffs.forEach(([x, y, z, r], i) => {
    b.part(new IcosahedronGeometry(r, 1), SMOKE, {
      bone: hips,
      at: stackBase.clone().add(V(x, y, z)),
      rotation: [i * 27, i * 41, 0],
      scale: [1, 0.86, 1],
      group: "smoke",
      name: `smoke${i + 1}`,
    });
  });

  // ------------------------------------------------------------------------------------------------ Flank gearboxes
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const hit = bodySurf.ray([s * 2, 0.58, 0.2], [-s, 0, 0]);
    const face = (hit ? Math.abs(hit.at.x) : 0.4) + 0.05;
    const GP = panel(V(s * face, 0.58, 0.2), V(s, 0, 0), V(0, 1, 0), s < 0);
    b.extrude(chamfered(0.92, 0.48, 0.06), {
      at: place(GP, 0, 0, -0.08),
      x: GP.right,
      y: GP.up,
      thickness: 0.16,
      bevel: 0.01,
      color: platePaint(0.92, 0.48, MID),
      bone: chestBone,
      group: `gearbox${side}`,
      name: `gearboxFrame${side}`,
    });
    b.extrude(chamfered(0.82, 0.38, 0.05), {
      at: place(GP, 0, 0, 0.005),
      x: GP.right,
      y: GP.up,
      thickness: 0.012,
      color: platePaint(0.82, 0.38, IRONB),
      bone: chestBone,
      group: `gearbox${side}`,
      name: `gearboxPlate${side}`,
    });
    const { centres } = cluster(
      GP,
      [
        { name: `gearFlankA${side}`, at: [-0.2, -0.02], r: 0.105, g: G_BIG, tint: T_BRASS, phase: 30, spin: true },
        { name: `gearFlankB${side}`, from: 0, ang: 25, r: 0.06, g: G_MID, tint: T_COPPER, spin: true },
        { name: `gearFlankC${side}`, from: 0, ang: 150, r: 0.08, g: G_CROSS, tint: T_GOLD, spin: true },
        { name: `gearFlankD${side}`, from: 1, ang: 0, r: 0.04, g: G_SMALL, tint: T_BRONZE, spin: true },
        { name: `gearFlankE${side}`, from: 2, ang: 250, r: 0.04, g: G_SMALL, tint: T_STEEL, spin: true },
        { name: `gearFlankF${side}`, from: 0, ang: 250, r: 0.05, g: G_FINE, tint: T_STEEL, spin: true },
        { name: `sprocketFlankA${side}`, at: [0.21, 0.07], r: 0.08, g: G_SPROCKET, tint: T_BRASS, spin: true },
        { name: `sprocketFlankB${side}`, at: [0.21, -0.12], r: 0.058, g: G_SPROCKET, tint: T_COPPER, spin: true },
      ],
      { bone: chestBone, group: `gearbox${side}`, base: 0.02 },
    );
    // roller chain round the two sprockets
    const [ax, ay] = centres[6];
    const [bx, by] = centres[7];
    const dirAB = Math.atan2(by - ay, bx - ax);
    const loop: Vector3[] = [];
    const ra = 0.08 * 0.88;
    const rb = 0.058 * 0.88;
    for (let k = 0; k <= 8; k++) {
      const a = dirAB + Math.PI / 2 + (k * Math.PI) / 8;
      loop.push(place(GP, ax + Math.cos(a) * ra, ay + Math.sin(a) * ra, 0.024));
    }
    for (let k = 0; k <= 8; k++) {
      const a = dirAB - Math.PI / 2 + (k * Math.PI) / 8;
      loop.push(place(GP, bx + Math.cos(a) * rb, by + Math.sin(a) * rb, 0.024));
    }
    const loopPath = catmull(loop, { closed: true });
    b.sweep(loopPath, 0.0065, {
      bone: chestBone,
      color: chainPaint(loopPath.length),
      sides: 6,
      group: `gearbox${side}`,
      name: `chain${side}`,
    });
    // corner bolts
    for (const [x, y] of [
      [-0.39, 0.16],
      [0.39, 0.16],
      [-0.39, -0.16],
      [0.39, -0.16],
    ] as const)
      batch.add(
        chestBone,
        POL,
        new CylinderGeometry(0.013, 0.013, 0.012, 6),
        place(GP, x, y, 0.014),
        aim(GP.n),
        `gearbox${side}`,
      );
  }

  // ------------------------------------------------------------------------------------------------ Tail gear train
  const tailCentreY = (z: number) => curve.at(curve.closestT([0, 0.4, z])).y;
  const tailKinds: [number, GearTex, string][] = [
    [0.13, G_BIG, T_BRASS],
    [0.11, G_CROSS, T_COPPER],
    [0.095, G_MID, T_GOLD],
    [0.08, G_SPROCKET, T_BRASS],
    [0.068, G_SMALL, T_STEEL],
    [0.058, G_MID, T_COPPER],
    [0.049, G_SMALL, T_BRONZE],
    [0.041, G_FINE, T_BRASS],
    [0.034, G_SMALL, T_STEEL],
  ];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const TP = panel(V(0, 0, 0), V(s, 0, 0), V(0, 1, 0));
    const z0 = -0.62;
    const defs: GDef[] = tailKinds.map(([r, g, tint], i) =>
      i === 0
        ? { name: `gearTail${side}1`, at: [-s * z0, tailCentreY(z0)], r, g, tint, phase: 0, spin: true }
        : { name: `gearTail${side}${i + 1}`, from: i - 1, ang: s > 0 ? -12 : 192, r, g, tint, spin: true },
    );
    cluster(TP, defs, {
      bone: tail.joints[0],
      boneFor: (c) => nearestJoint(tail.joints, c),
      group: "tailGears",
      base: 0.02,
      depth: (c) => {
        const hit = bodySurf.ray([s * 2, c.y, c.z], [-s, 0, 0]);
        return (hit ? Math.abs(hit.at.x) : 0.05) + 0.018;
      },
    });
  }
  // escape wheel across the tail tip
  {
    const tipJoint = tail.joints[tail.joints.length - 1];
    gear({
      name: "escapeWheel",
      bone: tipJoint,
      at: V(0, 0.2, -2.15),
      n: V(1, 0, 0),
      up: V(0, 1, 0),
      r: 0.09,
      g: G_RATCHET,
      tint: T_GOLD,
      group: "tail",
      spin: true,
      thick: 0.02,
    });
    b.rod([0, 0.2, -2.15], [0, 0.2, -2.05], 0.012, { bone: tipJoint, color: SILVER, sides: 6, group: "tail" });
  }
  // ratchet-tooth crest plates along the top of the tail
  const CREST: OutlinePoint[] = [
    [-0.05, 0],
    [0.05, 0],
    [0.05, 0.03],
    [-0.035, 0.115, "sharp"],
    [-0.05, 0.03],
  ];
  for (let z = -1.66; z > -2.0; z -= 0.085) {
    const k = 0.7 + 0.3 * ((z + 2.1) / 0.45);
    const pt = body.at(curve.closestT([0, 0.5, z]), 0);
    b.extrude(CREST, {
      at: pt,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.016 * k + 0.004,
      bevel: 0.004,
      color: Math.round(-z * 10) % 2 ? MID : COP,
      bone: nearestJoint(tail.joints, pt.at),
      group: "crest",
    });
  }

  // ------------------------------------------------------------------------------------------------ Neck gearboxes and collars
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const hit = bodySurf.ray([s * 2, 0.6, 1.0], [-s, 0, 0]);
    const NP = panel(V(s * ((hit ? Math.abs(hit.at.x) : 0.25) + 0.035), 0.6, 1.0), V(s, 0, 0), V(0, 1, 0), s < 0);
    b.extrude(chamfered(0.36, 0.28, 0.05), {
      at: place(NP, 0, 0, -0.05),
      x: NP.right,
      y: NP.up,
      thickness: 0.11,
      bevel: 0.008,
      color: platePaint(0.36, 0.28, IRONB),
      bone: neck.joints[0],
      group: `neckGears${side}`,
    });
    cluster(
      NP,
      [
        { name: `gearNeck${side}`, at: [-0.06, 0], r: 0.095, g: G_MID, tint: T_BRASS, phase: 40, spin: true },
        { name: `gearNeck${side}B`, from: 0, ang: 20, r: 0.06, g: G_SMALL, tint: T_COPPER, spin: true },
        { name: `gearNeck${side}C`, from: 0, ang: 200, r: 0.05, g: G_CROSS, tint: T_GOLD, spin: true },
      ],
      { bone: neck.joints[0], group: `neckGears${side}`, base: 0.014 },
    );
  }
  const collar = (z: number, r: number, bone: Joint, color: Fill) => {
    const t = curve.closestT([0, 0.5, z]);
    const ring: Vector3[] = [];
    for (let a = 0; a < 360; a += 30) ring.push(body.at(t, a, r * 0.6).at);
    b.sweep(catmull(ring, { closed: true }), r, { bone, color, sides: 6, group: "collars", name: "collar" });
  };
  collar(0.9, 0.018, neck.joints[0], POL);
  collar(1.05, 0.018, neck.joints[1], MID);
  collar(1.17, 0.02, neck.joints[1], POL);
  collar(-1.3, 0.016, tail.joints[3], POL);
  collar(-1.62, 0.013, tail.joints[5], MID);
  collar(-1.9, 0.011, tail.joints[7], POL);

  // ------------------------------------------------------------------------------------------------ Scute plates
  const dims = (z: number) => {
    for (let i = 1; i < bodyStations.length; i++) {
      const z1 = bodyStations[i].at[2];
      if (z <= z1) {
        const z0 = bodyStations[i - 1].at[2];
        const t = (z - z0) / (z1 - z0);
        return [
          bodyStations[i - 1].w + (bodyStations[i].w - bodyStations[i - 1].w) * t,
          bodyStations[i - 1].h + (bodyStations[i].h - bodyStations[i - 1].h) * t,
        ] as const;
      }
    }
    return [bodyStations[bodyStations.length - 1].w, bodyStations[bodyStations.length - 1].h] as const;
  };
  const paints = new Map<string, Fill>();
  const shingle = (pt: SweepPoint, l: number, w: number, base: Fill, tip: Fill, key: string) => {
    let color = paints.get(key);
    if (!color) {
      color = scutePaint(l, w, base, tip);
      paints.set(key, color);
    }
    const n = pt.n.clone().normalize();
    const back = V(0, 0, -1);
    const d = back.addScaledVector(n, -back.dot(n)).normalize();
    const xd = d.clone().addScaledVector(n, 0.22).normalize();
    const yd = new Vector3().crossVectors(n, xd).normalize();
    b.extrude(scuteOutline(l, w), {
      at: pt,
      x: xd,
      y: yd,
      thickness: 0.012,
      bevel: 0.0035,
      smoothing: 1,
      detail: 0.34,
      color,
      group: "scutes",
    });
  };
  const rowColors: [Fill, string][] = [
    [MID, "mid"],
    [COP, "cop"],
    [OLD, "old"],
    [POL, "pol"],
  ];
  const rows = (z0: number, z1: number, step: number, angles: (hw: number) => number[], l: number, w: number) => {
    let row = 0;
    for (let z = z0; z > z1; z -= step, row++) {
      const t = curve.closestT([0, 0.5, z]);
      const [bw, bh] = dims(z);
      const [base, key] = rowColors[row % 4];
      for (const a of angles((bw + bh) / 2)) shingle(body.at(t, a), l, w, base, OLD, `${key}${l}${w}`);
    }
  };
  // neck and shoulders, in front of the clock
  rows(1.18, 0.5, 0.085, () => [-66, -54, -42, 42, 54, 66], 0.062, 0.05);
  // outer back either side of the boiler
  rows(-0.46, -1.16, 0.09, () => [-68, -50, 50, 68], 0.062, 0.048);
  // tail: three across, then two, then one
  rows(-1.22, -1.5, 0.085, () => [-52, 52], 0.052, 0.04);
  rows(-1.55, -1.85, 0.085, () => [-45, 0, 45], 0.042, 0.032);
  // upper flanks in front of the shoulders and behind the hips
  rows(1.12, 0.72, 0.1, () => [-84, 84], 0.05, 0.04);
  rows(-0.32, -1.1, 0.1, () => [-88, 88], 0.052, 0.04);
  // gear bays lying flat on the shoulders and the base of the tail
  {
    const bayHit = bodySurf.ray([0, 2, 0.84], [0, -1, 0]);
    if (bayHit) {
      const BP = panel(V(0, bayHit.at.y, 0.84), V(0, 1, 0), V(0, 0, 1));
      b.extrude(chamfered(0.34, 0.62, 0.06), {
        at: place(BP, 0, 0, -0.045),
        x: BP.right,
        y: BP.up,
        thickness: 0.1,
        bevel: 0.008,
        color: platePaint(0.34, 0.62, MID),
        bone: neck.joints[0],
        group: "bayNeck",
      });
      b.extrude(chamfered(0.28, 0.56, 0.05), {
        at: place(BP, 0, 0, 0.007),
        x: BP.right,
        y: BP.up,
        thickness: 0.012,
        color: platePaint(0.28, 0.56, IRONB),
        bone: neck.joints[0],
        group: "bayNeck",
      });
      cluster(
        BP,
        [
          { name: "gearBayNeckA", at: [0, 0.12], r: 0.1, g: G_BIG, tint: T_BRASS, phase: 20, spin: true },
          { name: "gearBayNeckB", from: 0, ang: 235, r: 0.06, g: G_MID, tint: T_COPPER, spin: true },
          { name: "gearBayNeckC", from: 0, ang: 305, r: 0.07, g: G_CROSS, tint: T_GOLD, spin: true },
          { name: "gearBayNeckD", from: 0, ang: 90, r: 0.055, g: G_SMALL, tint: T_STEEL, spin: true },
        ],
        { bone: neck.joints[0], group: "bayNeck", base: 0.022 },
      );
    }
    const tailHit = bodySurf.ray([0, 2, -1.5], [0, -1, 0]);
    if (tailHit) {
      const TB = panel(V(0, 0, -1.5), V(0, 1, 0), V(0, 0, 1));
      cluster(
        TB,
        [
          { name: "gearBayTailA", at: [0, 0.1], r: 0.07, g: G_SPROCKET, tint: T_BRASS, phase: 0, spin: true },
          { name: "gearBayTailB", from: 0, ang: 260, r: 0.05, g: G_MID, tint: T_COPPER, spin: true },
          { name: "gearBayTailC", from: 1, ang: 250, r: 0.038, g: G_SMALL, tint: T_GOLD, spin: true },
        ],
        {
          bone: tail.joints[4],
          boneFor: (c) => nearestJoint(tail.joints, c),
          group: "bayTail",
          base: 0.02,
          boss: 0.05,
          depth: (c) => {
            const hit = bodySurf.ray([c.x, 2, c.z], [0, -1, 0]);
            return (hit ? hit.at.y : 0.4) + 0.03;
          },
        },
      );
    }
  }

  batch.flush(b);
  return b.root;
}
