// A crocheted amigurumi narwhal, 35 cm from fluke to tusk tip. Every surface is yarn: one gauge of single-crochet
// V stitches (about 1 cm) is painted over the whole toy, in rows that count from each piece's starting ring (the
// snout, the tusk tip, the flipper tips). Stitch counts per row follow the girth, so the rounds increase and decrease
// the way a pattern would; colour changes happen on whole stitches (the stair-stepped cream belly, the stripe rows on
// the tail and back, the pink embroidered cheeks). The tusk is a cream cone with two strands of yarn wound round it.
// Safety-bead eyes, an embroidered smile, a striped scarf with a tasselled end, a woven-in yarn tail.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng, vec } from "../src/math";
import type { V3 } from "../src/math";
import { noise, paint, rgb, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { catmull, polyline, spiral } from "../src/path";
import type { Path } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Amigurumi Narwhal",
  description:
    "A 35 cm crocheted narwhal toy: pastel-blue single-crochet body with a stair-stepped cream belly and colour-change stripes, embroidered smile and pink cheeks, safety-bead eyes, a two-strand yarn-wound tusk, lavender flippers and fluke with cream tips, and a striped tasselled scarf.",
};

// ---------------------------------------------------------------------------------------------------------------
// Yarn
const BLUE = rgb("#9fcaea");
const BLUE_DEEP = rgb("#7db0dc");
const LAV = rgb("#c8b8ea");
const CREAM = rgb("#fff2dc");
const MINT = rgb("#a7e2c8");
const PINK = rgb("#f8b2c6");
const PINK_DEEP = rgb("#f28fac");
const BUTTER = rgb("#fbdc86");
const FLOSS = "#7b3f58"; // embroidery floss for the smile
const BEAD = "#241a33"; // safety-bead eyes
const GLINT = "#ffffff";

const ROW_H = 0.0092; // one gauge for the whole toy, meters per row
const STITCH_W = 0.0102; // and per stitch

const TAU = Math.PI * 2;
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const fract = (x: number) => x - Math.floor(x);

/** A deterministic number in [0, 1) for two integers. */
function unit(a: number, b: number) {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Piecewise cosine interpolation through `[x, y]` keys sorted by x. */
function curve(keys: readonly (readonly [number, number])[]) {
  return (x: number) => {
    if (x <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [x1, y1] = keys[i];
      if (x <= x1) {
        const [x0, y0] = keys[i - 1];
        const s = (1 - Math.cos(((x - x0) / (x1 - x0)) * Math.PI)) / 2;
        return y0 + (y1 - y0) * s;
      }
    }
    return keys[keys.length - 1][1];
  };
}

/** Shade `base` by how much of a strand's crown is here: 0 in the gap between stitches, 1 on top. */
function shade(base: Rgb, f: number, fuzz: number): Rgb {
  const out: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const b = base[i];
    const dark = b * (0.42 + 0.5 * b); // deeper, more saturated shadow, so pastels stay coloured
    const light = Math.min(1, b * 1.05 + 0.03);
    out[i] = Math.min(1, (dark + (light - dark) * f) * fuzz);
  }
  return out;
}

/**
 * The strands of one single-crochet stitch: a V of two slanting, twisted plies whose point faces c = 0. `a` runs across
 * the cell and `c` along the row, both 0..1; `w` and `h` are the cell's size in meters. Returns 0 in the gaps and
 * up to 1 on the crown of a ply.
 */
function vLegs(a: number, c: number, w: number, h: number) {
  const x = a * w;
  const y = c * h;
  const rho = 0.235 * w;
  let best = 0;
  for (let k = 0; k < 2; k++) {
    const ax = (k ? 0.75 : 0.25) * w;
    const ay = 1.12 * h;
    const bx = (k ? 0.535 : 0.465) * w;
    const by = -0.12 * h;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = clamp01(((x - ax) * dx + (y - ay) * dy) / len2);
    const ex = x - (ax + dx * t);
    const ey = y - (ay + dy * t);
    const d = Math.hypot(ex, ey);
    if (d >= rho) continue;
    const across = (ex * dy - ey * dx) / Math.sqrt(len2) / rho; // signed -1..1 across the ply
    const tube = Math.pow(1 - (d / rho) * (d / rho), 0.62);
    const twist = 0.5 + 0.5 * Math.sin(((t * Math.sqrt(len2) * 1.0) / 0.0024) * TAU * 0.5 + across * 1.4);
    best = Math.max(best, tube * (0.84 + 0.16 * twist));
  }
  return best;
}

type Stitch = {
  row: number;
  col: number;
  n: number;
  id: number;
  /** Row-centre height and the stitch's centre on the dorsal clock, for colour rules. */
  z: number;
  deg: number;
};

const stitch: Stitch = { row: 0, col: 0, n: 1, id: 0, z: 0, deg: 0 };

function render(color: Rgb, a: number, c: number, w: number, p: Vector3, id: number): Rgb {
  const f = vLegs(a, c, w, ROW_H);
  const fuzz = 0.955 + 0.075 * noise(p, 0.005, 7) + (id - 0.5) * 0.05;
  return shade(color, f, fuzz);
}

// ---------------------------------------------------------------------------------------------------------------
/** Rows of a tube that starts at one end: stitches per row from the girth there, coordinates for the paint. */
class Gauge {
  readonly rows: number;
  readonly rowH: number;
  readonly info: Array<{ n: number; perim: number; a: number; b: number; z: number }> = [];
  private readonly tAt: Float64Array;
  private readonly sAt: Float64Array;
  private readonly total: number;

  constructor(
    path: Path,
    radius: (t: number) => readonly [number, number],
    private readonly fromEnd: boolean,
    dorsalWide: boolean,
    rowMultiple = 1,
  ) {
    const N = 600;
    this.tAt = new Float64Array(N + 1);
    this.sAt = new Float64Array(N + 1);
    let prev = path.at(0);
    let prevR = radius(0);
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const q = path.at(t);
      const r = radius(t);
      const dr = (r[0] + r[1]) / 2 - (prevR[0] + prevR[1]) / 2;
      this.tAt[i] = t;
      this.sAt[i] = this.sAt[i - 1] + Math.hypot(q.distanceTo(prev), dr);
      prev = q;
      prevR = r;
    }
    this.total = this.sAt[N];
    this.rows = Math.max(rowMultiple, Math.round(this.total / ROW_H / rowMultiple) * rowMultiple);
    this.rowH = this.total / this.rows;
    for (let row = 0; row < this.rows; row++) {
      const s = (row + 0.5) * this.rowH;
      const t = this.tOf(fromEnd ? this.total - s : s);
      const [rx, ry] = radius(t);
      const perim = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
      this.info.push({
        n: Math.max(6, Math.round(perim / STITCH_W)),
        perim,
        a: dorsalWide ? rx : ry,
        b: dorsalWide ? ry : rx,
        z: path.at(t).z,
      });
    }
  }

  private tOf(s: number) {
    let lo = 0;
    let hi = this.sAt.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (this.sAt[m] < s) lo = m;
      else hi = m;
    }
    const span = this.sAt[hi] - this.sAt[lo] || 1;
    return this.tAt[lo] + ((s - this.sAt[lo]) / span) * (this.tAt[hi] - this.tAt[lo]);
  }

  private sOf(t: number) {
    const x = t * (this.sAt.length - 1);
    const i = Math.min(Math.floor(x), this.sAt.length - 2);
    return this.sAt[i] + (x - i) * (this.sAt[i + 1] - this.sAt[i]);
  }

  /** Fill the shared `stitch` for the surface point (t, deg); returns the in-cell coordinates and stitch width. */
  at(t: number, deg: number) {
    const s = this.fromEnd ? this.total - this.sOf(t) : this.sOf(t);
    const u = s / this.rowH;
    const row = Math.min(Math.max(Math.floor(u), 0), this.rows - 1);
    const c = clamp01(u - row);
    const info = this.info[row];
    // arc fraction round the section from the dorsal point (a circle for most parts; an ellipse for flat strips)
    const alpha = deg * (Math.PI / 180);
    let frac = deg / 360;
    if (Math.abs(info.a - info.b) > 0.06 * info.a) {
      let phi = Math.atan2(Math.sin(alpha) / info.b, Math.cos(alpha) / info.a);
      if (phi < 0) phi += TAU;
      frac = ellipseArc(phi, info.a, info.b) / ellipseArc(TAU, info.a, info.b);
    }
    const x = frac * info.n;
    const col = Math.min(Math.floor(x), info.n - 1);
    stitch.row = row;
    stitch.col = col;
    stitch.n = info.n;
    stitch.id = unit(row * 7 + 3, col * 13 + 1);
    stitch.z = info.z;
    stitch.deg = ((col + 0.5) / info.n) * 360;
    return { a: clamp01(x - col), c, w: info.perim / info.n };
  }
}

function ellipseArc(phi: number, a: number, b: number) {
  // point (b sin, a cos) about the dorsal point: speed sqrt(b² cos² + a² sin²)
  const steps = Math.max(2, Math.ceil(phi / 0.4));
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const t = ((i + 0.5) / steps) * phi;
    sum += Math.sqrt(b * b * Math.cos(t) ** 2 + a * a * Math.sin(t) ** 2);
  }
  return (sum * phi) / steps;
}

/** A paint that crochets a tube: stitches round its section, rows along it, colour chosen per whole stitch. */
function tubeYarn(gauge: Gauge, pick: (st: Stitch, p: Vector3) => Rgb, tOfPoint?: (p: Vector3) => number) {
  return paint((p, _n, s) => {
    const { a, c, w } = gauge.at(tOfPoint ? tOfPoint(p) : s[0], s[1]);
    return render(pick(stitch, p), a, c, w, p, stitch.id);
  });
}

/**
 * A paint that crochets a flat piece worked from its tip: rows are planes across `tip → base`, columns run sideways.
 * `pick` gets the row counted from the tip.
 */
function flatYarn(tip: V3, base: V3, pick: (row: number, id: number, p: Vector3) => Rgb) {
  const o = vec(tip);
  const d = vec(base).sub(o);
  const length = d.length();
  d.normalize();
  const side = new Vector3(0, 1, 0).cross(d).normalize();
  const rows = Math.max(1, Math.round(length / ROW_H));
  const rowH = length / rows;
  const rel = new Vector3();
  return paint((p) => {
    rel.subVectors(p, o);
    const u = rel.dot(d) / rowH;
    const row = Math.floor(u);
    const v = rel.dot(side) / STITCH_W + 0.5;
    const col = Math.floor(v);
    const id = unit(row * 7 + 3, col * 13 + 1);
    return render(pick(row, id, p), fract(v), u - row, STITCH_W, p, id);
  });
}

/** A yarn strand: diagonal plies twisting along it, in two tones. */
function strandYarn(length: number, base: Rgb) {
  return paint((_p, _n, s) => {
    const q = (s[0] * length) / 0.0052 + s[1] / 360;
    const ridge = Math.pow(Math.abs(Math.sin(q * Math.PI)), 0.7);
    return shade(base, 0.16 + 0.84 * ridge, 1);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings
// A tassel: five strands knotted together at the bottom (which sits on the frame) and fraying out toward the top.
const TASSEL = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke-linecap="round" stroke-width="8">
      <path d="M24 58 Q10 36 6 8" stroke="#f8b2c6"/>
      <path d="M24 58 Q40 36 42 8" stroke="#a7e2c8"/>
      <path d="M24 58 Q16 34 17 5" stroke="#fff2dc"/>
      <path d="M24 58 Q32 34 31 5" stroke="#f8b2c6"/>
      <path d="M24 58 Q24 34 24 3" stroke="#a7e2c8"/>
    </g>
    <rect x="12" y="46" width="24" height="12" rx="5" fill="#f28fac"/>
  </svg>`,
  { size: 192 },
);

// A woven-in yarn end: one short curled strand with a frayed tip.
const YARN_END = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 48 Q10 30 20 20 Q26 13 18 4" fill="none" stroke="#9fcaea" stroke-width="7" stroke-linecap="round"/>
    <path d="M14 48 Q10 30 20 20 Q26 13 18 4" fill="none" stroke="#7db0dc" stroke-width="2"
      stroke-linecap="round" stroke-dasharray="3 5"/>
  </svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "amigurumiNarwhal", paintSize: 2048 });
  const random = rng(11);

  // ---------------------------------------------------------------- Profile
  // The body runs from the tail tip (z = -0.134) to the snout (z = 0.078) as one stuffed tube: a long taper into
  // a domed head. Its belly sits on the floor at the widest round; the tail curls up so the fluke floats.
  const Y0 = 0.057;
  const HEAD_Z0 = 0.012; // centre of the head dome
  const HEAD_A = 0.066; // dome half-length
  const radiusOfZ = (z: number) => {
    if (z > HEAD_Z0) return Y0 * Math.sqrt(Math.max(0, 1 - ((z - HEAD_Z0) / HEAD_A) ** 2));
    return bodyR(z);
  };
  const bodyR = curve([
    [-0.134, 0.0055],
    [-0.124, 0.0095],
    [-0.108, 0.0152],
    [-0.09, 0.022],
    [-0.07, 0.032],
    [-0.05, 0.0425],
    [-0.03, 0.0525],
    [-0.01, 0.0565],
    [HEAD_Z0, 0.057],
  ]);
  const centreY = (z: number) => (z >= -0.03 ? Y0 : Y0 + 0.045 * ((-0.03 - z) / 0.104) ** 1.7);
  const Z_SNOUT = HEAD_Z0 + HEAD_A * 0.9995;
  const bodyPath = catmull(
    [-0.134, -0.1, -0.07, -0.045, -0.02, 0.0, 0.02, 0.045, 0.065, Z_SNOUT].map((z): V3 => [0, centreY(z), z]),
  );
  const bodyRadii = (t: number): [number, number] => {
    const r = radiusOfZ(bodyPath.at(t).z);
    return [r * 1.04, r];
  };
  const HEAD_C: V3 = [0, Y0, HEAD_Z0];

  // ---------------------------------------------------------------- Skeleton
  const rootAt: V3 = [0, Y0, -0.03];
  const root = b.joint("root", { at: rootAt, role: "spine", group: "body" });
  const spine = b.chain("spine", polyline([rootAt, [0, Y0, 0.0], [0, Y0, 0.026]]), {
    parent: root,
    names: ["spine1", "spine2"],
    role: "spine",
    group: "body",
  });
  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, Y0, 0.026],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const tRoot = bodyPath.closestT(root.at);
  const tail = b.chain("tail", bodyPath.slice(tRoot, 0), {
    parent: root,
    count: 4,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
    group: "tail",
  });

  // ---------------------------------------------------------------- Stitch colour on the body
  const gauge = new Gauge(bodyPath, bodyRadii, true, false);
  const STRIPE_BAND = [MINT, MINT, CREAM, MINT, MINT];
  const CHEEKS = [
    { deg: 103, z: 0.043 },
    { deg: 257, z: 0.043 },
  ];
  const bodyYarn = tubeYarn(gauge, (st) => {
    // pink embroidered cheeks: whole stitches, ragged at the edge
    for (const cheek of CHEEKS) {
      let dDeg = Math.abs(st.deg - cheek.deg);
      if (dDeg > 180) dDeg = 360 - dDeg;
      const dz = Math.abs(st.z - cheek.z);
      const d = Math.hypot(dz, ((dDeg * Math.PI) / 180) * 0.054 * 0.9);
      const k = 1 - d / 0.019;
      if (k > 0.05 + 0.5 * st.id) return st.id > 0.7 ? PINK_DEEP : PINK;
    }
    // stripes: the tail alternates two rows lavender, two rows blue; the back carries a band of colour changes
    const z = st.z;
    if (st.row >= 22) return (st.row >> 1) & 1 ? BLUE : LAV;
    if (st.row >= 15 && st.row <= 19) return STRIPE_BAND[st.row - 15];
    // the belly is cream, stepped stitch by stitch
    if (st.deg > 122 && st.deg < 238 && z < 0.078) return CREAM;
    // a few darker stitches scattered on the back
    if ((st.deg < 105 || st.deg > 255) && z > -0.08 && z < 0.045 && st.id < 0.07) return BLUE_DEEP;
    return BLUE;
  });

  // ---------------------------------------------------------------- Body
  const bodyMesh = b.sweep(bodyPath, bodyRadii, {
    bone: [tail, root, spine, head],
    color: bodyYarn,
    sides: 20,
    detail: 1.4,
    caps: { start: "round", end: "round" },
    group: "body",
    name: "body",
  });
  const skin = b.surface(bodyMesh);
  const onBody = (az: number, el: number, from: V3 = HEAD_C) => {
    const hit = skin.around(from).at(az, el);
    if (!hit) throw new Error(`narwhal: nothing at azimuth ${az}, elevation ${el}`);
    return hit;
  };

  // ---------------------------------------------------------------- Tusk
  // A stuffed cone worked from its tip, with two strands of yarn (butter, pink) wound round it in a left-handed helix.
  const base = onBody(0, 9);
  const TUSK_DIR = vec([0, 0.16, 1]).normalize();
  const TUSK_LEN = 0.11;
  const TUSK_R0 = 0.0128;
  const TUSK_R1 = 0.0024;
  const tuskR = (a: number) => TUSK_R0 * Math.pow(TUSK_R1 / TUSK_R0, a / TUSK_LEN);
  const tuskTip = base.at.clone().addScaledVector(TUSK_DIR, TUSK_LEN);
  const tuskPath = polyline([base.at, tuskTip]);
  const tuskGauge = new Gauge(tuskPath, (t) => [tuskR(t * TUSK_LEN), tuskR(t * TUSK_LEN)], true, false);
  const tusk = b.sprout("tusk", base, tuskPath, (t) => tuskR(t * TUSK_LEN), {
    count: 2,
    names: ["tusk1", "tusk2"],
    color: tubeYarn(tuskGauge, (st) => (st.row === 0 ? BUTTER : CREAM)),
    sides: 12,
    caps: { end: "round" },
    group: "tusk",
    name: "tusk",
  });
  const across = vec([0, 1, 0]).addScaledVector(TUSK_DIR, -TUSK_DIR.y).normalize();
  const WRAP_FROM = 0.009;
  const WRAP_TO = 0.101;
  const WRAP_TURNS = 2.5;
  const PITCH = (WRAP_TO - WRAP_FROM) / WRAP_TURNS;
  const wrapR0 = 0.0034;
  const wrapR1 = 0.002;
  const strands: Array<[number, Rgb]> = [
    [1, BUTTER],
    [-1, PINK],
  ];
  for (const [sign, yarn] of strands) {
    const centre = base.at.clone().addScaledVector(TUSK_DIR, WRAP_FROM);
    const r0 = tuskR(WRAP_FROM) + wrapR0 * 0.5;
    const r1 = tuskR(WRAP_TO) + wrapR1 * 0.5;
    const helix = spiral(centre, centre.clone().addScaledVector(across, sign * r0), TUSK_DIR, {
      turns: -WRAP_TURNS,
      r1,
      pitch: PITCH,
    });
    b.sweep(helix, [wrapR0, wrapR1], {
      bone: tusk.chain!,
      color: strandYarn(helix.length, yarn),
      sides: 6,
      caps: "round",
      group: "tusk",
      name: sign > 0 ? "wrapButter" : "wrapPink",
    });
  }

  // ---------------------------------------------------------------- Face
  // Safety-bead eyes with a glint, and a smile stitched in floss across the front of the muzzle.
  for (const s of [1, -1]) {
    const hit = onBody(s * 40, 5);
    const R = 0.0098;
    const eye = b.stick(new SphereGeometry(R, 12, 8), BEAD, hit, {
      embed: 0.4,
      bone: head,
      group: "face",
      name: "eye",
    });
    const n = vec(hit.n);
    const up = vec([0, 1, 0]).addScaledVector(n, -n.y).normalize();
    const fwd = vec([0, 0, 1]).addScaledVector(n, -n.z).addScaledVector(up, -up.z).normalize();
    const shine = n.clone().add(up.multiplyScalar(0.62)).add(fwd.multiplyScalar(0.4)).normalize();
    const glint = eye.at
      .clone()
      .addScaledVector(n, R * 0.2)
      .addScaledVector(shine, R * 0.92);
    b.part(new SphereGeometry(0.0026, 6, 4), GLINT, { at: glint, bone: head, group: "face", name: "glint" });
  }
  const smilePts = [-26, -14, 0, 14, 26].map((az, i) => {
    const el = [-8, -17, -21, -17, -8][i];
    return onBody(az, el).at;
  });
  const smile = skin.drape(catmull(smilePts), { lift: 0.0008 });
  b.sweep(smile, 0.0019, { bone: head, color: FLOSS, sides: 5, caps: "round", group: "face", name: "smile" });

  // ---------------------------------------------------------------- Flippers
  // Stubby stuffed paddles worked from the tip, lavender with two cream rows at the end.
  const flipperR = (t: number): [number, number] => {
    const taper = 1 - 0.5 * smoothstep(0.5, 1, t);
    return [0.0185 * (0.82 + 0.18 * Math.sin(Math.PI * Math.min(1, t * 1.1))) * taper, 0.0072 * (1 - 0.3 * t)];
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = onBody(s * 90, -22, [0, Y0, -0.006]);
    const tip: V3 = [root.at.x + s * 0.05, root.at.y - 0.02, root.at.z - 0.014];
    const mid: V3 = [root.at.x + s * 0.025, root.at.y - 0.009, root.at.z - 0.006];
    b.sprout(`flipper${side}`, root, catmull([root.at, mid, tip]), flipperR, {
      count: 2,
      names: [`flipper${side}1`, `flipper${side}2`],
      role: "arm",
      up: [0, 1, 0],
      sides: 10,
      caps: { end: "round" },
      color: flatYarn(tip, root.at, (row, id) => (row < 2 ? CREAM : id < 0.06 ? CREAM : LAV)),
      group: "flipper",
      name: `flipper${side}`,
    });
  }

  // ---------------------------------------------------------------- Fluke
  // Two flat lobes, one 2-joint chain each, leaf-shaped and worked from the tips like the flippers.
  const tailTip = bodyPath.at(0);
  const lobeR = (() => {
    const w = curve([
      [0, 0.0135],
      [0.3, 0.0235],
      [0.7, 0.0205],
      [0.9, 0.0125],
      [1, 0.0035],
    ]);
    return (t: number): [number, number] => [w(t), 0.0064 * (1 - 0.4 * t)];
  })();
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tip: V3 = [s * 0.07, tailTip.y + 0.013, -0.153];
    const mid: V3 = [s * 0.036, tailTip.y + 0.005, -0.141];
    const lobe = b.chain(`fluke${side}`, catmull([tailTip, mid, tip]), {
      parent: tail.joints[3],
      names: [`fluke${side}1`, `fluke${side}2`],
      up: [0, 1, 0],
      role: "fan",
      group: "fluke",
    });
    b.sweep(lobe, lobeR, {
      sides: 10,
      caps: { start: "round", end: "round" },
      color: flatYarn(tip, tailTip.toArray() as V3, (row, id) => (row < 2 ? CREAM : id < 0.05 ? BLUE : LAV)),
      group: "fluke",
      name: `fluke${side}`,
    });
  }

  // ---------------------------------------------------------------- Scarf
  // A chunky tube of striped crochet round the neck (pink pair, cream, mint pair, cream) with a flat tail lying on the
  // left flank and ending in a tassel.
  const SCARF_STRIPES = [PINK, PINK, CREAM, MINT, MINT, CREAM];
  const drapedLoop = skin.drape(
    catmull(
      Array.from({ length: 14 }, (_, i): V3 => {
        const th = Math.PI + (i / 14) * TAU; // the seam sits under the belly
        return [0.07 * Math.sin(th), Y0 + 0.07 * Math.cos(th), 0.03 - 0.013 * Math.cos(th)];
      }),
      { closed: true },
    ),
    { lift: 0.002 },
  );
  // The belly rests on the floor, so the underside of the scarf is pressed up into it: no sample sits lower than one
  // tube radius above y = 0. The top sample stays a hit so the loop keeps the body's skin weights.
  const SCARF_R: [number, number] = [0.0086, 0.0086];
  const loopSamples = Array.from({ length: 28 }, (_, i) => drapedLoop.at(i / 28));
  const scarfLoop = catmull(
    loopSamples.map((p, i) =>
      i === 14 ? skin.nearest(p).moved([0, 0.002, 0]) : vec([p.x, Math.max(p.y, SCARF_R[0] + 0.0008), p.z]),
    ),
    { closed: true },
  );
  const scarfGauge = new Gauge(scarfLoop, () => SCARF_R, false, false, 6);
  b.sweep(scarfLoop, SCARF_R, {
    sides: 12,
    // rows count by angle round the body: the closed tube's own t jumps back to 0 across its seam
    color: tubeYarn(
      scarfGauge,
      (st) => SCARF_STRIPES[st.row % 6],
      (p) => fract(Math.atan2(p.x, p.y - Y0) / TAU - 0.5),
    ),
    group: "scarf",
    name: "scarf",
  });

  const flank = (z: number, y: number) => {
    const hit = skin.ray([0.2, y, z], [-1, 0, 0]);
    if (!hit) throw new Error(`narwhal: flank ray missed at z=${z}`);
    return hit;
  };
  const stripPath = skin.drape(
    catmull([flank(0.03, 0.066).at, flank(0.01, 0.065).at, flank(-0.01, 0.062).at, flank(-0.03, 0.058).at]),
    { lift: 0.0026 },
  );
  const STRIP_R: [number, number] = [0.0095, 0.0036];
  const stripGauge = new Gauge(stripPath, () => STRIP_R, false, true);
  const strip = b.sweep(stripPath, STRIP_R, {
    up: [1, 0, 0],
    sides: 10,
    caps: "round",
    color: tubeYarn(stripGauge, (st) => SCARF_STRIPES[st.row % 6]),
    group: "scarf",
    name: "scarfTail",
  });
  const end = strip.at(1);
  b.cards([frame(end, end.tangent), frame(end, end.tangent)], TASSEL, {
    size: [0.024, 0.034],
    lean: 10,
    flow: [0, -1, 0],
    cross: true,
    spin: 35,
    vary: 0.08,
    rng: random,
    sink: 0.2,
    group: "scarf",
    name: "tassel",
  });

  // ---------------------------------------------------------------- Woven-in yarn end
  // A short curl of the body yarn poking out of the back, where the last round was fastened off.
  const tuck = skin.nearest([0, Y0 + 0.052, -0.052]);
  b.cards([tuck], YARN_END, {
    size: [0.014, 0.022],
    lean: 25,
    flow: [0, 0.3, -1],
    cross: true,
    sink: 0.25,
    group: "body",
    name: "yarnEnd",
  });

  return b.root;
}
