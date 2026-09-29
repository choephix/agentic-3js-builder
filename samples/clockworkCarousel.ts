// A wind-up music-box carousel on an ornate round base, about 0.6 m across and 0.6 m tall: a striped, scalloped
// canopy with bunting, pennants and a string of bulbs; a lantern-cage column of turning gears and a flyball governor;
// a base whose bays are glazed windows onto gear trains, a spring barrel, an escapement and the pin cylinder and steel
// comb of the music box; a crank on the side; five carved, painted riders on twisted brass poles (horse, swan, pig,
// rooster and a little dragon); bunny and mouse spectators, a ticket booth, a balloon seller and confetti.
// Style: cute toy clockwork. Metals are paints (polished gilt, warm brass, rose gold, copper, blued steel), the wood
// and enamel are pastel gradient paints, and the coats, blankets and saddles are painted from each rider's own
// coordinates. Gear teeth, spoked windows, the canopy mandala, plaques, signs and dials are geometry or svg() drawings.
import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  Matrix4,
  Path,
  PlaneGeometry,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { aim, DEG, rng } from "../src/math";
import { mix, noise, paint, scales, smoothstep } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Clockwork Carousel",
  builtBy: "Claude Sonnet 5.5",
  description:
    "A wind-up music-box carousel diorama in polished brass and pastel enamel: striped canopy with bunting and bulbs, a gear-tower column, glazed base bays onto gear trains and a pin-cylinder music comb, twisted brass poles carrying a rigged horse, swan, pig, rooster and dragon, plus a crank, bunny and mouse spectators, a ticket booth, a balloon seller and confetti.",
};

const TAU = Math.PI * 2;
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
type N3 = readonly [number, number, number];
const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------------------------------------------------------
// Layout, in meters.
const RING = 0.155; // radius of the ring the riders and poles stand on
const LEDGE_Y = 0.108; // top of the cornice: the ledge the spectators stand on
const DECK_Y = 0.127; // top of the turning platform
const CAN_Y = 0.39; // underside of the canopy

// ---------------------------------------------------------------------------------------------------------------
// Metals as paints: a streaky warm sheen on up-facing surfaces, tarnish blotches, a little verdigris in the shade.
const VERD: Rgb = [0.27, 0.68, 0.56];
const SHEEN: Rgb = [1, 0.93, 0.7];
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
    const ao = 0.84 + 0.16 * smoothstep(-0.9, 0.4, n.y);
    return [c[0] * ao, c[1] * ao, c[2] * ao] as Rgb;
  });
}
const POL = metal({ lo: "#e4aa38", hi: "#fff2ac", tarn: "#8a6224", tarnAmt: 0.05, verd: 0, sheen: 0.7, seed: 1 });
const MID = metal({ lo: "#c88c30", hi: "#f2c664", tarn: "#6a4818", tarnAmt: 0.22, verd: 0.05, sheen: 0.4, seed: 2 });
const ROSEG = metal({ lo: "#dc8c80", hi: "#ffd8ca", tarn: "#8a4a3e", tarnAmt: 0.1, verd: 0, sheen: 0.6, seed: 3 });
const COP = metal({ lo: "#c85a2c", hi: "#f6966a", tarn: "#5a2a14", tarnAmt: 0.25, verd: 0.12, sheen: 0.4, seed: 4 });
const STEEL = metal({ lo: "#8a9ab8", hi: "#eaf2ff", tarn: "#46526c", tarnAmt: 0.15, verd: 0, sheen: 0.6, seed: 5 });
const GEARS: Fill[] = [POL, COP, ROSEG, STEEL, MID];

// Pastel enamel: lighter where the surface faces up, a shade deeper underneath.
const enamel = (base: string, hi: string, lo: string) =>
  paint((_p, n) => mix(mix(lo, base, smoothstep(-0.8, 0.1, n.y)), hi, smoothstep(0.3, 1, n.y) * 0.7));
const E_CREAM = enamel("#fff0d6", "#ffffff", "#f0d4ae");
const E_PINK = enamel("#ffa6bc", "#ffd8e2", "#e884a0");
const E_ROSE = enamel("#f0668c", "#ff9ab6", "#c44a72");
const E_MINT = enamel("#9ce2c2", "#d4fbe8", "#72c4a2");
const E_SKY = enamel("#98cff2", "#d2ecff", "#70a8d8");
const E_LAV = enamel("#c6a8f2", "#e6d6ff", "#a288d4");
const E_LEMON = enamel("#ffe27a", "#fff4b8", "#e8be50");
const E_CORAL = enamel("#ff7c5e", "#ffb098", "#d85a44");
const E_RED = enamel("#e83a4e", "#ff7a86", "#b02440");

const E_PLUM = enamel("#5a3a7a", "#8a62aa", "#3c2458");
const E_WINE = enamel("#84539c", "#b088d0", "#5c3376");
const E_WHITE = enamel("#fbfbff", "#ffffff", "#dde4f2");

const DARK = "#2a2036";
const WHITE = "#ffffff";
const WARM = "#fff0a8";

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers.

/** Merge geometries into one (position, normal, uv), for hundreds of tiny identical-colour details as one part. */
function merge(list: BufferGeometry[]) {
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  for (const g0 of list) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    const t = g.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      if (n) nor.push(n.getX(i), n.getY(i), n.getZ(i));
      else nor.push(0, 1, 0);
      if (t) uv.push(t.getX(i), t.getY(i));
      else uv.push(0, 0);
    }
  }
  const out = new BufferGeometry();
  out.setAttribute("position", new Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new Float32BufferAttribute(nor, 3));
  out.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  return out;
}

/** A pile of small geometries placed in model space, flushed as one part. */
class Bin {
  private readonly list: BufferGeometry[] = [];
  add(g: BufferGeometry, at: Vector3, o: { quat?: Quaternion; scale?: Vector3 | number } = {}) {
    const s = typeof o.scale === "number" ? V(o.scale, o.scale, o.scale) : (o.scale ?? V(1, 1, 1));
    this.list.push(g.clone().applyMatrix4(new Matrix4().compose(at, o.quat ?? new Quaternion(), s)));
  }
  /** A rod from a to c. */
  rod(a: Vector3, c: Vector3, r0: number, r1 = r0, sides = 5, open = false) {
    const d = c.clone().sub(a);
    this.add(new CylinderGeometry(r1, r0, d.length(), sides, 1, open), a.clone().add(c).multiplyScalar(0.5), {
      quat: aim(d, undefined, "y"),
    });
  }
  get empty() {
    return this.list.length === 0;
  }
  geometry() {
    return merge(this.list);
  }
}

/** A gear outline with teeth, optionally with spoke windows, extruded and centred on its axis (local z), plus a boss. */
function gearGeo(teeth: number, mod: number, depth: number, spokes = 0, spin = 0) {
  const pitch = (teeth * mod) / 2;
  const R = pitch + mod * 0.85;
  const root = pitch - mod * 0.95;
  const step = TAU / teeth;
  const pt = (r: number, a: number): [number, number] => [r * Math.cos(a), r * Math.sin(a)];
  const shape = new Shape();
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [r, o] of [
      [root, -0.3],
      [R, -0.15],
      [R, 0.15],
      [root, 0.3],
    ] as const) {
      const [x, y] = pt(r, a + o * step);
      if (i === 0 && o === -0.3) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
  }
  shape.closePath();
  const hub = pitch * 0.3;
  if (spokes > 0) {
    const rim = root * 0.8;
    const rh = hub * 1.55;
    const w = mod * 0.75;
    const span = TAU / spokes;
    for (let i = 0; i < spokes; i++) {
      const a0 = i * span;
      const so = Math.min(w / rim, span / 2 - 0.08);
      const si = Math.min(w / rh, span / 2 - 0.06);
      const hole = new Path();
      const [x0, y0] = pt(rim, a0 + so);
      hole.moveTo(x0, y0);
      for (let j = 1; j <= 3; j++) {
        const [x, y] = pt(rim, a0 + so + ((span - 2 * so) * j) / 3);
        hole.lineTo(x, y);
      }
      for (let j = 0; j <= 2; j++) {
        const [x, y] = pt(rh, a0 + span - si - ((span - 2 * si) * j) / 2);
        hole.lineTo(x, y);
      }
      hole.closePath();
      shape.holes.push(hole);
    }
  }
  const body = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
  body.translate(0, 0, -depth / 2);
  const boss = new CylinderGeometry(hub, hub, depth * 1.9, 8).rotateX(Math.PI / 2);
  const out = merge([body, boss]);
  if (spin) out.rotateZ(spin * DEG);
  return { geometry: out, R, pitch };
}

/** A barley-twist pole along local y, centred on the origin. */
function barleyTwist(len: number, r: number, turns: number, lobes = 3, sides = 12, rings = 26) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const twist = turns * TAU * t;
    for (let j = 0; j < sides; j++) {
      const th = (j / sides) * TAU;
      const rad = r * (0.7 + 0.3 * Math.cos(lobes * th));
      const a = th + twist;
      pos.push(rad * Math.cos(a), -len / 2 + len * t, rad * Math.sin(a));
      uv.push(j / sides, t);
    }
  }
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j;
      const b = i * sides + ((j + 1) % sides);
      const c = (i + 1) * sides + j;
      const d = (i + 1) * sides + ((j + 1) % sides);
      idx.push(a, c, b, b, c, d);
    }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A lathe with flat facets. Profile points are [radius, height]; the first vertex is at +z. */
function lathe(profile: readonly (readonly [number, number])[], segments: number) {
  const g = new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    segments,
  ).toNonIndexed();
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Rider-local frames: a rider is designed in millimetres (x left, y up, z forward, origin at the pole), then set on
// the ring with a yaw and a scale.
class Xf {
  readonly q: Quaternion;
  private readonly qi: Quaternion;
  constructor(
    readonly pos: Vector3,
    yaw: number,
    readonly k = 1,
  ) {
    this.q = new Quaternion().setFromAxisAngle(V(0, 1, 0), yaw);
    this.qi = this.q.clone().invert();
  }
  m(mm: number) {
    return mm * this.k * 0.001;
  }
  p(x: number, y: number, z: number) {
    return V(x, y, z)
      .multiplyScalar(this.k * 0.001)
      .applyQuaternion(this.q)
      .add(this.pos);
  }
  d(x: number, y: number, z: number) {
    return V(x, y, z).applyQuaternion(this.q).normalize();
  }
  /** A model-space point in rider millimetres. */
  local(p: Vector3) {
    return p
      .clone()
      .sub(this.pos)
      .applyQuaternion(this.qi)
      .multiplyScalar(1000 / this.k);
  }
  localDir(n: Vector3) {
    return n.clone().applyQuaternion(this.qi);
  }
  rot(e: N3 = [0, 0, 0]) {
    return this.q.clone().multiply(new Quaternion().setFromEuler(new Euler(e[0] * DEG, e[1] * DEG, e[2] * DEG)));
  }
}
/** A paint written in a rider's own millimetres and local normal. */
const lp = (xf: Xf, fn: (l: Vector3, n: Vector3, p: Vector3) => ColorInput) =>
  paint((p, n) => fn(xf.local(p), xf.localDir(n), p));

// ---------------------------------------------------------------------------------------------------------------
// Drawings. Metal drawings are pale so the part's tint colours them.
const NS = 'xmlns="http://www.w3.org/2000/svg"';

function cog(cx: number, cy: number, teeth: number, ro: number, rr: number, rot = 0) {
  const step = TAU / teeth;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = rot + i * step;
    const q = (r: number, o: number) =>
      `${(cx + r * Math.sin(a + o * step)).toFixed(2)} ${(cy - r * Math.cos(a + o * step)).toFixed(2)}`;
    d += `${i ? "L" : "M"}${q(rr, -0.32)}L${q(ro, -0.17)}L${q(ro, 0.17)}L${q(rr, 0.32)}`;
  }
  return `${d}Z`;
}
const hole = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

/** A spoked gear decal, drawn pale for tinting. */
function gearDecal(teeth: number, spokes: number) {
  let d = cog(50, 50, teeth, 48, 41);
  for (let i = 0; i < spokes; i++) {
    const a = ((i + 0.5) * TAU) / spokes;
    d += hole(50 + 24 * Math.sin(a), 50 - 24 * Math.cos(a), 9);
  }
  return svg(
    `<svg viewBox="0 0 100 100" ${NS}>
      <path d="${d}" fill="#f6f6f6" fill-rule="evenodd" stroke="#5c5c5c" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="33" fill="none" stroke="#9a9a9a" stroke-width="1.2" stroke-dasharray="1.6 3.2"/>
      <circle cx="50" cy="50" r="11" fill="#ffffff" stroke="#5c5c5c" stroke-width="2"/>
      <circle cx="50" cy="50" r="3.6" fill="#7a7a7a"/>
    </svg>`,
    { size: 192 },
  );
}
const GEAR_DECAL = gearDecal(14, 5);
const GEAR_FINE = gearDecal(24, 6);

/** Gilt rosette medallion for the riders' flanks. */
const ROSETTE = svg(
  `<svg viewBox="0 0 100 100" ${NS}>
    ${Array.from({ length: 8 }, (_, i) => `<ellipse cx="50" cy="24" rx="10" ry="22" transform="rotate(${i * 45} 50 50)" fill="#ffffff" stroke="#6a6a6a" stroke-width="2.4"/>`).join("")}
    ${Array.from({ length: 8 }, (_, i) => `<ellipse cx="50" cy="34" rx="6" ry="12" transform="rotate(${i * 45 + 22.5} 50 50)" fill="#dcdcdc" stroke="#6a6a6a" stroke-width="2"/>`).join("")}
    <circle cx="50" cy="50" r="13" fill="#ffffff" stroke="#6a6a6a" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="5" fill="#8a8a8a"/>
  </svg>`,
  { size: 128 },
);

/** Glass: pale streaks and corner glints on transparent, so the gears show through. */
const GLASS = svg(
  `<svg viewBox="0 0 160 70" ${NS}>
    <polygon points="24,70 34,70 70,0 60,0" fill="#eaf8ff"/>
    <polygon points="40,70 43,70 79,0 76,0" fill="#eaf8ff"/>
    <polygon points="126,70 132,70 160,20 160,10" fill="#eaf8ff"/>
    <polygon points="0,0 10,0 0,10" fill="#eaf8ff"/>
    <polygon points="160,70 150,70 160,60" fill="#eaf8ff"/>
  </svg>`,
  { size: 320 },
);

/** Gilt cartouche with the maker's name. */
const PLAQUE = svg(
  `<svg viewBox="0 0 160 36" ${NS}>
    <rect x="1.5" y="1.5" width="157" height="33" rx="10" fill="#f3d27a" stroke="#7a4a1c" stroke-width="3"/>
    <rect x="6" y="6" width="148" height="24" rx="7" fill="none" stroke="#b07a2c" stroke-width="1.6"/>
    <path d="M12 18q6-9 12 0q-6 9-12 0M148 18q-6-9-12 0q6 9 12 0" fill="none" stroke="#7a4a1c" stroke-width="2"/>
    <text x="80" y="22.5" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="12" fill="#5a2e10" textLength="122" lengthAdjust="spacingAndGlyphs">CLOCKWORK CAROUSEL</text>
  </svg>`,
  { size: 640 },
);

const TICKETS = svg(
  `<svg viewBox="0 0 80 24" ${NS}>
    <rect x="1.5" y="1.5" width="77" height="21" rx="5" fill="#e83a4e" stroke="#ffe27a" stroke-width="2.4"/>
    <text x="40" y="17" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="14" fill="#fff4dc" letter-spacing="1">TICKETS</text>
  </svg>`,
  { size: 320 },
);

/** Cream dial with brass ring, ticks and two hands. */
const DIAL = svg(
  `<svg viewBox="0 0 100 100" ${NS}>
    <circle cx="50" cy="50" r="48" fill="#e2b040" stroke="#7a4a1c" stroke-width="2"/>
    <circle cx="50" cy="50" r="40" fill="#fff6df" stroke="#7a4a1c" stroke-width="1.6"/>
    ${Array.from({ length: 12 }, (_, i) => `<line x1="50" y1="14" x2="50" y2="${i % 3 ? 20 : 25}" stroke="#4a2a10" stroke-width="${i % 3 ? 2 : 3.4}" transform="rotate(${i * 30} 50 50)"/>`).join("")}
    <line x1="50" y1="50" x2="50" y2="24" stroke="#4a2a10" stroke-width="3" stroke-linecap="round" transform="rotate(35 50 50)"/>
    <line x1="50" y1="50" x2="50" y2="17" stroke="#e83a4e" stroke-width="2.2" stroke-linecap="round" transform="rotate(-70 50 50)"/>
    <circle cx="50" cy="50" r="4" fill="#e2b040" stroke="#4a2a10" stroke-width="1.4"/>
  </svg>`,
  { size: 192 },
);

/** The canopy's underside: a sunburst of pink and cream wedges with a ring of little cogs and a gilt hub. */
const MANDALA = svg(
  `<svg viewBox="0 0 200 200" ${NS}>
    <circle cx="100" cy="100" r="99" fill="#5a3a7a"/>
    ${Array.from({ length: 24 }, (_, i) => {
      const a0 = (i * TAU) / 24;
      const a1 = ((i + 1) * TAU) / 24;
      const p = (r: number, a: number) => `${(100 + r * Math.sin(a)).toFixed(1)} ${(100 - r * Math.cos(a)).toFixed(1)}`;
      return `<path d="M${p(24, a0)}L${p(90, a0)}A90 90 0 0 1 ${p(90, a1)}L${p(24, a1)}Z" fill="${i % 2 ? "#fff0d6" : "#ffa6bc"}"/>`;
    }).join("")}
    <circle cx="100" cy="100" r="90" fill="none" stroke="#e2b040" stroke-width="4"/>
    <circle cx="100" cy="100" r="58" fill="none" stroke="#e2b040" stroke-width="2.4"/>
    ${Array.from({ length: 12 }, (_, i) => {
      const a = (i * TAU) / 12;
      const cx = 100 + 74 * Math.sin(a);
      const cy = 100 - 74 * Math.cos(a);
      return `<path d="${cog(cx, cy, 9, 11, 8.2, a)}${hole(cx, cy, 3)}" fill="#f4c852" fill-rule="evenodd" stroke="#7a4a1c" stroke-width="1.4"/>`;
    }).join("")}
    <path d="${cog(100, 100, 16, 27, 22)}${hole(100, 100, 6)}" fill="#f4c852" fill-rule="evenodd" stroke="#7a4a1c" stroke-width="2"/>
    ${Array.from({ length: 24 }, (_, i) => `<circle cx="${(100 + 95 * Math.sin((i * TAU) / 24)).toFixed(1)}" cy="${(100 - 95 * Math.cos((i * TAU) / 24)).toFixed(1)}" r="2" fill="#fff0d6"/>`).join("")}
  </svg>`,
  { size: 512 },
);

/** A coiled mainspring on its barrel face, pale for tinting. */
const SPRING = svg(
  `<svg viewBox="0 0 100 100" ${NS}>
    <circle cx="50" cy="50" r="48" fill="#dcdcdc" stroke="#5c5c5c" stroke-width="2.4"/>
    <path d="${Array.from({ length: 60 }, (_, i) => {
      const t = i / 59;
      const a = t * 5.6 * TAU;
      const r = 7 + 34 * t;
      return `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
    }).join("")}" fill="none" stroke="#4a4a4a" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="6" fill="#ffffff" stroke="#5c5c5c" stroke-width="2"/>
  </svg>`,
  { size: 192 },
);

/** A flat hairspring for the balance wheel. */
const HAIRSPRING = svg(
  `<svg viewBox="0 0 100 100" ${NS}>
    <path d="${Array.from({ length: 50 }, (_, i) => {
      const t = i / 49;
      const a = t * 4.4 * TAU;
      const r = 4 + 40 * t;
      return `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
    }).join("")}" fill="none" stroke="#dcdcdc" stroke-width="3.6" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "clockworkCarousel", paintSize: 2048 });
  const random = rng(7);
  const UP = V(0, 1, 0);
  const rad = (a: number) => V(Math.sin(a), 0, Math.cos(a));
  const tang = (a: number) => V(Math.cos(a), 0, -Math.sin(a));
  const yaw = (a: number) => new Quaternion().setFromAxisAngle(UP, a);
  const flush = (bin: Bin, color: Fill, bone: Joint, group: string) => {
    if (!bin.empty) b.part(bin.geometry(), color, { bone, at: [0, 0, 0], group });
  };

  // ------------------------------------------------------------------------------------------------ Skeleton
  const root = b.joint("root", { at: [0, 0, 0], group: "base" });
  const platform = b.joint("platform", { parent: root, at: [0, DECK_Y, 0], dir: [0, 1, 0], group: "platform" });
  const canopy = b.joint("canopy", { parent: root, at: [0, CAN_Y, 0], dir: [0, 1, 0], group: "canopy" });
  const crank = b.joint("crank", { parent: root, at: [0.19, 0.057, 0], dir: [1, 0, 0], group: "base" });

  /** A gear on its own joint (so it can turn), or a static one on `parent`. axis: the shaft; up: the outline's y. */
  const gear = (
    name: string | null,
    parent: Joint,
    at: Vector3,
    axis: Vector3,
    upv: Vector3,
    teeth: number,
    mod: number,
    depth: number,
    spokes: number,
    color: Fill,
    group: string,
    spin = 0,
  ) => {
    const g = gearGeo(teeth, mod, depth, spokes, spin);
    const bone = name ? b.joint(name, { parent, at, dir: axis, group }) : parent;
    b.part(g.geometry, color, { bone, at, dir: axis, axis: "z", up: upv, group });
    return { bone, R: g.R, pitch: g.pitch };
  };

  // ================================================================================================ BASE
  {
    const wood = paint((p, n) => {
      const g = noise(p, 0.012, 3);
      const base = mix("#9ce2c2", "#bff0d8", smoothstep(-0.5, 1, n.y) * 0.6 + g * 0.2);
      const r = Math.hypot(p.x, p.z);
      if (p.y < 0.006 && r > 0.29) return "#e2aa3a";
      return base;
    });
    // plinth: a stepped, gilt-edged foot
    b.part(
      lathe(
        [
          [0, 0],
          [0.296, 0],
          [0.3, 0.004],
          [0.3, 0.012],
          [0.288, 0.018],
          [0.272, 0.022],
          [0, 0.022],
        ],
        16,
      ),
      wood,
      { bone: root, at: [0, 0, 0], group: "base" },
    );
    // gilt beading round the plinth
    b.part(new TorusGeometry(0.3003, 0.0026, 4, 32), POL, {
      bone: root,
      at: [0, 0.0125, 0],
      dir: UP,
      axis: "z",
      up: V(0, 0, 1),
      group: "base",
    });
    const trim = new Bin();
    for (let i = 0; i < 16; i++)
      trim.add(
        new SphereGeometry(0.0034, 5, 3),
        rad((i * 22.5 + 11.25) * DEG)
          .multiplyScalar(0.3)
          .setY(0.0125),
      );
    flush(trim, POL, root, "base");
    // inner core the bays look onto: an octagonal drum with flats facing the bays
    b.part(new CylinderGeometry(0.1948, 0.1948, 0.072, 8), E_WINE, {
      bone: root,
      at: [0, 0.058, 0],
      rotation: [0, 22.5, 0],
      group: "base",
    });
    // cornice: overhanging ledge, its top a pastel checker ring
    const ledge = paint((p, n) => {
      const r = Math.hypot(p.x, p.z);
      if (n.y < 0.5) return r > 0.262 ? POL : E_PLUM;
      const cell = Math.floor((Math.atan2(p.x, p.z) / TAU + 1) * 48) + Math.floor(r / 0.0148);
      return cell % 2 ? "#fff0d6" : "#ffb8c8";
    });
    b.part(
      lathe(
        [
          [0, 0.092],
          [0.262, 0.092],
          [0.262, 0.094],
          [0.273, 0.096],
          [0.277, 0.102],
          [0.276, 0.108],
          [0, 0.108],
        ],
        24,
      ),
      ledge,
      { bone: root, at: [0, 0, 0], group: "base" },
    );

    const bays = new Bin();
    const gilt = new Bin();
    const pillar = lathe(
      [
        [0, 0],
        [0.0105, 0],
        [0.0115, 0.005],
        [0.008, 0.009],
        [0.0068, 0.013],
        [0.0062, 0.03],
        [0.0062, 0.05],
        [0.0082, 0.058],
        [0.0072, 0.062],
        [0.0108, 0.066],
        [0.0108, 0.07],
        [0, 0.07],
      ],
      8,
    );
    for (let k = 0; k < 8; k++) {
      const a = k * 45 * DEG;
      const at = rad(a + 22.5 * DEG).multiplyScalar(0.2555);
      at.y = 0.022;
      gilt.add(pillar, at);
      // acorn finial on the cornice above each pillar
      gilt.add(new SphereGeometry(0.0062, 8, 6), V(at.x * 1.055, 0.1105, at.z * 1.055), { scale: V(1, 1.25, 1) });
      // window frame: top and bottom rails and a plate for the glass
      for (const y of [0.0925, 0.0235]) {
        bays.add(new BoxGeometry(0.15, 0.0055, 0.008), rad(a).multiplyScalar(0.2445).setY(y), { quat: yaw(a) });
      }
      // glass and a plaque or medallion on the plinth face
      b.part(new PlaneGeometry(0.16, 0.068), "#e8f6ff", {
        bone: root,
        at: rad(a).multiplyScalar(0.2465).setY(0.058),
        dir: rad(a),
        axis: "z",
        up: UP,
        texture: GLASS,
        group: "base",
      });
      if (k === 0)
        b.part(new PlaneGeometry(0.098, 0.022), "#ffffff", {
          bone: root,
          at: rad(a).multiplyScalar(0.3018).setY(0.0115),
          dir: rad(a),
          axis: "z",
          up: UP,
          texture: PLAQUE,
          group: "base",
        });
      else
        b.part(new PlaneGeometry(0.02, 0.02), k % 2 ? "#ffd66b" : "#ffb0a0", {
          bone: root,
          at: rad(a).multiplyScalar(0.3018).setY(0.0115),
          dir: rad(a),
          axis: "z",
          up: UP,
          texture: k % 2 ? GEAR_DECAL : GEAR_FINE,
          group: "base",
        });
    }
    // gilt beads around the cornice and warm bulbs along its top edge
    const bulbs = new Bin();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      gilt.add(new SphereGeometry(0.0028, 5, 3), rad(a).multiplyScalar(0.2775).setY(0.1005));
      if (i % 2 === 0)
        bulbs.add(
          new SphereGeometry(0.0038, 6, 4),
          rad(a + 0.05)
            .multiplyScalar(0.2705)
            .setY(0.1095),
        );
    }
    flush(bays, POL, root, "base");
    flush(gilt, POL, root, "base");
    flush(bulbs, WARM, root, "base");

    // ---------------------------------------------------------------------------------- gear trains in the bays
    const MOD = 0.0028;
    const bayAt = (k: number, t: number, y: number, layer: number) =>
      rad(k * 45 * DEG)
        .multiplyScalar(0.19 + layer * 0.0115)
        .addScaledVector(tang(k * 45 * DEG), t)
        .setY(y);
    type G = { teeth: number; ang?: number; layer?: number; same?: boolean; spokes?: number };
    let colorIx = 0;
    const made: Record<number, number> = {};
    const train = (k: number, t0: number, y0: number, seq: G[]) => {
      let t = t0;
      let y = y0;
      let prev = 0;
      seq.forEach((g, i) => {
        if (i > 0 && !g.same) {
          const ang = (g.ang ?? 0) * DEG;
          const d = (prev + g.teeth) * MOD * 0.5;
          t += Math.cos(ang) * d;
          y += Math.sin(ang) * d;
        }
        const layer = g.layer ?? (g.same ? 1 : 0);
        gear(
          `gearBay${k}_${(made[k] = (made[k] ?? -1) + 1)}`,
          root,
          bayAt(k, t, y, layer),
          rad(k * 45 * DEG),
          UP,
          g.teeth,
          MOD,
          0.0045,
          g.spokes ?? (g.teeth >= 14 ? 5 : 0),
          GEARS[colorIx++ % GEARS.length],
          "gearTrain",
          i % 2 ? 180 / g.teeth : 0,
        );
        if (!g.same) prev = g.teeth;
      });
    };
    train(1, -0.038, 0.057, [
      { teeth: 18 },
      { teeth: 12, ang: 10 },
      { teeth: 10, same: true },
      { teeth: 16, ang: -15 },
    ]);
    train(3, -0.038, 0.05, [{ teeth: 14 }, { teeth: 14, ang: 20 }, { teeth: 12, ang: -20 }, { teeth: 10, same: true }]);
    train(5, -0.045, 0.062, [{ teeth: 12 }, { teeth: 18, ang: -10 }, { teeth: 10, ang: 15 }]);
    train(7, -0.02, 0.057, [{ teeth: 20 }, { teeth: 10, ang: 0 }, { teeth: 12, same: true }]);
    // front bay: the music box. Two drive gears at the ends of the barrel.
    train(0, 0.052, 0.06, [{ teeth: 10, layer: 1 }]);
    train(0, -0.052, 0.06, [{ teeth: 10, layer: 1 }]);

    // barrel, pins and comb
    {
      const c0 = V(0, 0.06, 0.204);
      const barrel = b.joint("pinBarrel", { parent: root, at: c0, dir: [1, 0, 0], group: "musicBox" });
      b.part(new CylinderGeometry(0.0215, 0.0215, 0.088, 12), MID, {
        bone: barrel,
        at: c0,
        dir: [1, 0, 0],
        group: "musicBox",
      });
      for (const x of [-0.045, 0.045])
        b.part(new CylinderGeometry(0.0235, 0.0235, 0.004, 12), POL, {
          bone: barrel,
          at: c0.clone().add(V(x, 0, 0)),
          dir: [1, 0, 0],
          group: "musicBox",
        });
      const pins = new Bin();
      const pinG = new ConeGeometry(0.0017, 0.0042, 4);
      for (let i = 0; i < 44; i++) {
        const u = -0.038 + 0.076 * random();
        const phi = (-1.2 + 2.4 * random()) * 1.15;
        const dir = V(0, Math.sin(phi), Math.cos(phi));
        pins.add(
          pinG,
          c0
            .clone()
            .add(V(u, 0, 0))
            .addScaledVector(dir, 0.0225),
          { quat: aim(dir, undefined, "y") },
        );
      }
      flush(pins, "#fff3c0", barrel, "musicBox");
      // steel comb with graded tines, bedded on a gilt block
      const comb = new Bin();
      const n = 22;
      for (let i = 0; i < n; i++) {
        const x = -0.05 + (0.1 * i) / (n - 1);
        const len = 0.0135 + 0.0085 * (1 - i / (n - 1));
        const base = V(x, 0.032, 0.236);
        const dir = V(0, 0.7, -0.71).normalize();
        comb.add(new BoxGeometry(0.0022, 0.0009, len), base.clone().addScaledVector(dir, len / 2), {
          quat: aim(dir, undefined, "z"),
        });
      }
      flush(comb, STEEL, root, "musicBox");
      b.part(new BoxGeometry(0.108, 0.012, 0.012), MID, { bone: root, at: [0, 0.0295, 0.2385], group: "musicBox" });
      b.part(new BoxGeometry(0.108, 0.006, 0.006), STEEL, { bone: root, at: [0, 0.0365, 0.2345], group: "musicBox" });
      for (const x of [-0.05, 0.05])
        b.part(new SphereGeometry(0.0034, 6, 4), POL, { bone: root, at: [x, 0.0295, 0.2452], group: "musicBox" });
    }

    // crank bay (east): a big gear on the crank shaft, and the crank itself
    {
      gear(null, crank, bayAt(2, 0, 0.057, 0), V(1, 0, 0), UP, 20, 0.0028, 0.005, 6, MID, "crank");
      gear(
        "gearBay2_pinion",
        root,
        bayAt(2, -0.0448, 0.057, 0),
        V(1, 0, 0),
        UP,
        12,
        0.0028,
        0.0045,
        0,
        STEEL,
        "gearTrain",
      );
      b.rod([0.17, 0.057, 0], [0.306, 0.057, 0], 0.0042, { bone: crank, color: POL, sides: 8, group: "crank" });
      const arm = V(0.306, 0.057, 0);
      const tip = arm.clone().add(V(0, -0.0225, -0.0225).multiplyScalar(1.15));
      b.capsule(arm, tip, 0.0058, { bone: crank, color: MID, sides: 8, group: "crank" });
      b.part(new CylinderGeometry(0.0085, 0.0085, 0.006, 10), POL, {
        bone: crank,
        at: arm.clone().add(V(0.003, 0, 0)),
        dir: [1, 0, 0],
        group: "crank",
      });
      b.rod(tip, tip.clone().add(V(0.028, 0, 0)), 0.0036, { bone: crank, color: POL, sides: 8, group: "crank" });
      b.part(new SphereGeometry(0.0095, 8, 6), E_RED, {
        bone: crank,
        at: tip.clone().add(V(0.0375, 0, 0)),
        group: "crank",
      });
      b.part(new CylinderGeometry(0.012, 0.012, 0.0045, 10), POL, {
        bone: root,
        at: [0.2695, 0.057, 0],
        dir: [1, 0, 0],
        group: "base",
      });
    }

    // back bay (south): the mainspring barrel with its coil face, and a pinion
    {
      const c = bayAt(4, -0.018, 0.057, 1);
      const ax = rad(4 * 45 * DEG);
      const barrel = b.joint("mainspringBarrel", { parent: root, at: c, dir: ax, group: "gearTrain" });
      b.part(new CylinderGeometry(0.03, 0.03, 0.012, 14), STEEL, { bone: barrel, at: c, dir: ax, group: "gearTrain" });
      b.part(new CylinderGeometry(0.0335, 0.0335, 0.003, 14), MID, {
        bone: barrel,
        at: c.clone().addScaledVector(ax, -0.0065),
        dir: ax,
        group: "gearTrain",
      });
      b.part(new PlaneGeometry(0.052, 0.052), "#c8d4ee", {
        bone: barrel,
        at: c.clone().addScaledVector(ax, 0.0066),
        dir: ax,
        axis: "z",
        up: UP,
        texture: SPRING,
        group: "gearTrain",
      });
      train(4, 0.034, 0.046, [{ teeth: 12 }, { teeth: 10, ang: 60 }]);
    }

    // west bay: escapement (escape wheel + anchor) and a balance wheel with its hairspring
    {
      const ax = rad(6 * 45 * DEG);
      gear("escapeWheel", root, bayAt(6, -0.028, 0.052, 0), ax, UP, 14, 0.0028, 0.0045, 0, POL, "escapement");
      const c = bayAt(6, -0.028, 0.052, 0);
      // anchor: an arc band over the wheel with two pallets, a stem and a pivot
      const anchor = b.joint("escapeAnchor", {
        parent: root,
        at: c.clone().add(V(0, 0.033, 0).addScaledVector(ax, 0.006)),
        dir: ax,
        group: "escapement",
      });
      const ring = new Shape();
      const ro = 0.0285;
      const ri = 0.0245;
      const pts: [number, number][] = [];
      for (let i = 0; i <= 6; i++) {
        const a = (55 + (70 * i) / 6) * DEG;
        pts.push([ro * Math.cos(a), ro * Math.sin(a) - 0.0]);
      }
      for (let i = 6; i >= 0; i--) {
        const a = (55 + (70 * i) / 6) * DEG;
        pts.push([ri * Math.cos(a), ri * Math.sin(a)]);
      }
      pts.forEach(([x, y], i) => (i ? ring.lineTo(x, y) : ring.moveTo(x, y)));
      ring.closePath();
      const bandG = new ExtrudeGeometry(ring, { depth: 0.0032, bevelEnabled: false });
      bandG.translate(0, 0, -0.0016);
      b.part(bandG, STEEL, {
        bone: anchor,
        at: c.clone().addScaledVector(ax, 0.006),
        dir: ax,
        axis: "z",
        up: UP,
        group: "escapement",
      });
      b.part(new CylinderGeometry(0.0022, 0.0022, 0.02, 6), STEEL, {
        bone: anchor,
        at: c
          .clone()
          .add(V(0, 0.0295, 0))
          .addScaledVector(ax, 0.006),
        dir: UP,
        group: "escapement",
      });
      b.part(new SphereGeometry(0.0038, 6, 4), COP, {
        bone: anchor,
        at: c
          .clone()
          .add(V(0, 0.04, 0))
          .addScaledVector(ax, 0.006),
        group: "escapement",
      });
      const bc = bayAt(6, 0.03, 0.056, 1);
      const bal = b.joint("balanceWheel", { parent: root, at: bc, dir: ax, group: "escapement" });
      b.part(new TorusGeometry(0.0225, 0.0028, 5, 14), COP, {
        bone: bal,
        at: bc,
        dir: ax,
        axis: "z",
        up: UP,
        group: "escapement",
      });
      for (const rot of [0, 60, 120]) {
        const u = tang(6 * 45 * DEG)
          .multiplyScalar(Math.cos(rot * DEG))
          .addScaledVector(UP, Math.sin(rot * DEG));
        b.rod(bc.clone().addScaledVector(u, -0.0225), bc.clone().addScaledVector(u, 0.0225), 0.0017, {
          bone: bal,
          color: COP,
          sides: 4,
          group: "escapement",
        });
      }
      b.part(new PlaneGeometry(0.036, 0.036), "#ffe7a8", {
        bone: bal,
        at: bc.clone().addScaledVector(ax, 0.0036),
        dir: ax,
        axis: "z",
        up: UP,
        texture: HAIRSPRING,
        group: "escapement",
      });
      b.part(new SphereGeometry(0.0036, 6, 4), POL, {
        bone: bal,
        at: bc.clone().addScaledVector(ax, 0.0046),
        group: "escapement",
      });
    }

    // ---------------------------------------------------------------------------------- the turning deck
    const deck = paint((p, n) => {
      if (n.y < 0.5) return MID;
      const r = Math.hypot(p.x, p.z);
      if (r > 0.202 && r < 0.214) return POL;
      if (r < 0.088 && r > 0.078) return POL;
      const wedge = Math.floor((Math.atan2(p.x, p.z) / TAU + 1) * 20);
      const flowerRing =
        Math.abs(r - 0.135) < 0.006 && fract((Math.atan2(p.x, p.z) / TAU + 1) * 20) < 0.5 ? E_LEMON : null;
      if (flowerRing) return flowerRing;
      return wedge % 2 ? "#fff0d6" : "#ffc6d4";
    });
    b.part(
      lathe(
        [
          [0, 0],
          [0.208, 0],
          [0.2155, 0.003],
          [0.2155, 0.016],
          [0.208, 0.019],
          [0, 0.019],
        ],
        24,
      ),
      deck,
      { bone: platform, at: [0, 0.108, 0], group: "platform" },
    );
    b.part(new TorusGeometry(0.2115, 0.0028, 5, 32), POL, {
      bone: platform,
      at: [0, 0.1265, 0],
      dir: UP,
      axis: "z",
      up: V(0, 0, 1),
      group: "platform",
    });
    // ring of small gears set into the deck's rim
    const rim = new Bin();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      const g = gearGeo(8, 0.002, 0.003, 0, i * 20);
      const q = aim(rad(a), UP, "z");
      rim.add(g.geometry, rad(a).multiplyScalar(0.2165).setY(0.1175), { quat: q });
    }
    flush(rim, POL, platform, "platform");
    // pedestal at the heart of the deck
    b.part(
      lathe(
        [
          [0, 0],
          [0.076, 0],
          [0.08, 0.006],
          [0.07, 0.012],
          [0.06, 0.022],
          [0.04, 0.026],
          [0, 0.026],
        ],
        16,
      ),
      MID,
      { bone: platform, at: [0, DECK_Y, 0], group: "platform" },
    );
    b.part(new PlaneGeometry(0.112, 0.112), "#ffe08a", {
      bone: platform,
      at: [0, DECK_Y + 0.0268, 0],
      dir: UP,
      axis: "z",
      up: V(0, 0, 1),
      texture: GEAR_FINE,
      group: "platform",
    });
  }

  // ================================================================================================ COLUMN
  {
    const shaft = 0.0065;
    b.rod([0, DECK_Y + 0.02, 0], [0, CAN_Y + 0.004, 0], shaft, {
      bone: platform,
      color: POL,
      sides: 8,
      group: "column",
    });
    // lantern cage: four posts and three rings
    const cage = new Bin();
    for (let i = 0; i < 4; i++) {
      const a = (45 + i * 90) * DEG;
      const p = rad(a).multiplyScalar(0.066);
      cage.rod(V(p.x, DECK_Y + 0.024, p.z), V(p.x, CAN_Y - 0.004, p.z), 0.0046, 0.0046, 6);
      cage.add(new SphereGeometry(0.0072, 8, 6), V(p.x, CAN_Y - 0.004, p.z));
      cage.add(new SphereGeometry(0.0072, 8, 6), V(p.x, DECK_Y + 0.024, p.z));
    }
    for (const y of [DECK_Y + 0.028, 0.262, CAN_Y - 0.01])
      cage.add(new TorusGeometry(0.066, 0.0032, 4, 16).rotateX(Math.PI / 2), V(0, y, 0));
    flush(cage, MID, platform, "column");

    // stacked gears on the shaft, each with a meshing planet on a pin
    const levels: { y: number; teeth: number; planet: number; ang: number; spokes: number }[] = [
      { y: 0.172, teeth: 22, planet: 10, ang: 0, spokes: 6 },
      { y: 0.206, teeth: 16, planet: 10, ang: 90, spokes: 5 },
      { y: 0.24, teeth: 24, planet: 12, ang: 180, spokes: 7 },
      { y: 0.324, teeth: 18, planet: 10, ang: 270, spokes: 6 },
      { y: 0.358, teeth: 12, planet: 8, ang: 0, spokes: 0 },
    ];
    const MODC = 0.0034;
    levels.forEach((lv, i) => {
      const at = V(0, lv.y, 0);
      const main = gear(
        `gearColumn${i + 1}`,
        platform,
        at,
        UP,
        V(0, 0, 1),
        lv.teeth,
        MODC,
        0.006,
        lv.spokes,
        GEARS[i % GEARS.length],
        "column",
        0,
      );
      const d = main.pitch + (lv.planet * MODC) / 2;
      const a = lv.ang * DEG;
      const pat = V(Math.sin(a) * d, lv.y, Math.cos(a) * d);
      gear(
        `gearColumnPlanet${i + 1}`,
        platform,
        pat,
        UP,
        V(0, 0, 1),
        lv.planet,
        MODC,
        0.006,
        0,
        GEARS[(i + 2) % GEARS.length],
        "column",
        180 / lv.planet,
      );
      b.rod([pat.x, lv.y - 0.014, pat.z], [pat.x, lv.y + 0.014, pat.z], 0.0022, {
        bone: platform,
        color: STEEL,
        sides: 6,
        group: "column",
      });
    });
    // vertical gears geared across the tiers
    const vert: { y: number; teeth: number; a: number; r: number }[] = [
      { y: 0.223, teeth: 14, a: 45, r: 0.04 },
      { y: 0.282, teeth: 16, a: 225, r: 0.038 },
      { y: 0.34, teeth: 12, a: 135, r: 0.034 },
    ];
    vert.forEach((v, i) => {
      const ang = v.a * DEG;
      const at = V(Math.sin(ang) * v.r, v.y, Math.cos(ang) * v.r);
      const axis = tang(ang);
      gear(
        `gearColumnCross${i + 1}`,
        platform,
        at,
        axis,
        UP,
        v.teeth,
        0.003,
        0.005,
        v.teeth >= 14 ? 5 : 0,
        GEARS[(i + 3) % GEARS.length],
        "column",
        0,
      );
    });
    // flyball governor between the tiers
    {
      const gy = 0.283;
      const gov = b.joint("governor", { parent: platform, at: [0, gy, 0], dir: [0, 1, 0], group: "column" });
      b.part(new CylinderGeometry(0.0095, 0.0095, 0.008, 8), POL, {
        bone: gov,
        at: [0, gy - 0.014, 0],
        dir: UP,
        group: "column",
      });
      b.part(new CylinderGeometry(0.0095, 0.0095, 0.008, 8), POL, {
        bone: gov,
        at: [0, gy + 0.03, 0],
        dir: UP,
        group: "column",
      });
      for (const s of [1, -1]) {
        const ball = V(s * 0.03, gy + 0.008, 0);
        b.rod([s * 0.007, gy + 0.03, 0], ball, 0.0018, { bone: gov, color: STEEL, sides: 5, group: "column" });
        b.rod([s * 0.007, gy - 0.012, 0], ball, 0.0018, { bone: gov, color: STEEL, sides: 5, group: "column" });
        b.part(new SphereGeometry(0.0078, 8, 6), COP, { bone: gov, at: ball, group: "column" });
      }
    }
    // hub sleeve where the shaft meets the canopy, and a gilt collar on the deck
    b.part(new CylinderGeometry(0.014, 0.014, 0.012, 10), POL, {
      bone: canopy,
      at: [0, CAN_Y - 0.01, 0],
      dir: UP,
      group: "canopy",
    });
    b.part(new CylinderGeometry(0.014, 0.018, 0.008, 10), MID, {
      bone: platform,
      at: [0, DECK_Y + 0.03, 0],
      dir: UP,
      group: "column",
    });
  }

  // ================================================================================================ CANOPY
  {
    const stripe = paint((p, n) => {
      if (n.y < -0.5) return E_PLUM;
      const a = (Math.atan2(p.x, p.z) / TAU + 1) * 12;
      const f = fract(a);
      if (f < 0.045 || f > 0.955) return POL;
      return Math.floor(a) % 2 ? E_CREAM : E_PINK;
    });
    b.part(
      lathe(
        [
          [0, -0.004],
          [0.27, -0.004],
          [0.272, 0.003],
          [0.262, 0.016],
          [0.235, 0.03],
          [0.19, 0.05],
          [0.14, 0.07],
          [0.09, 0.09],
          [0.05, 0.105],
          [0.024, 0.118],
          [0, 0.122],
        ],
        12,
      ),
      stripe,
      { bone: canopy, at: [0, CAN_Y, 0], group: "canopy" },
    );
    b.part(new CircleGeometry(0.2655, 40), "#ffffff", {
      bone: canopy,
      at: [0, CAN_Y - 0.0062, 0],
      dir: [0, -1, 0],
      axis: "z",
      up: V(0, 0, 1),
      texture: MANDALA,
      group: "canopy",
    });
    // rim: a gilt ring with bulbs at every seam, and scalloped valance tabs
    b.part(new TorusGeometry(0.2705, 0.0038, 5, 36), POL, {
      bone: canopy,
      at: [0, CAN_Y - 0.0005, 0],
      dir: UP,
      axis: "z",
      up: V(0, 0, 1),
      group: "canopy",
    });
    const bulbs = new Bin();
    const tassels = new Bin();
    const bunting: Bin[] = [new Bin(), new Bin(), new Bin(), new Bin()];
    const string = new Bin();
    const flagG = new BufferGeometry();
    flagG.setAttribute(
      "position",
      new Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0, -1, 0, -0.5, 0, 0, 0, -1, 0, 0.5, 0, 0], 3),
    );
    flagG.setAttribute(
      "normal",
      new Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1], 3),
    );
    const brim = (i: number) =>
      rad((i * 30 * Math.PI) / 180)
        .multiplyScalar(0.2715)
        .setY(CAN_Y - 0.001);
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 + 15) * DEG;
      const w = 0.069;
      const out: [number, number][] = [
        [w, 0],
        [w, -0.011],
      ];
      for (let j = 1; j < 8; j++) {
        const th = (j / 8) * Math.PI;
        out.push([w * Math.cos(th), -0.011 - 0.02 * Math.sin(th)]);
      }
      out.push([-w, -0.011], [-w, 0]);
      b.extrude(out, {
        at: rad(a)
          .multiplyScalar(0.2635)
          .setY(CAN_Y - 0.002),
        x: tang(a),
        y: UP,
        thickness: 0.0034,
        bevel: 0.0009,
        color: i % 2 ? E_PINK : E_CREAM,
        bone: canopy,
        group: "canopy",
      });
      tassels.add(
        new SphereGeometry(0.0046, 6, 4),
        rad(a)
          .multiplyScalar(0.2665)
          .setY(CAN_Y - 0.035),
      );
      bulbs.add(new SphereGeometry(0.0062, 8, 6), brim(i));
      // a sagging string of pennants from this seam to the next
      const p0 = brim(i);
      const p1 = brim(i + 1);
      const at = (t: number) =>
        p0
          .clone()
          .lerp(p1, t)
          .multiplyScalar(1)
          .add(V(0, -0.014 * 4 * t * (1 - t), 0))
          .multiplyScalar(1.012);
      for (let s = 0; s < 5; s++) string.rod(at(s / 5), at((s + 1) / 5), 0.0011, 0.0011, 3, true);
      for (let f = 0; f < 5; f++) {
        const t = 0.12 + (f * 0.76) / 4;
        const c = at(t);
        bunting[(i + f) % 4].add(flagG, c, { quat: yaw(a), scale: V(0.011, 0.014, 1) });
      }
    }
    flush(bulbs, WARM, canopy, "canopy");
    flush(tassels, POL, canopy, "canopy");
    flush(string, POL, canopy, "canopy");
    [E_ROSE, E_MINT, E_LEMON, E_SKY].forEach((c, i) => flush(bunting[i], c, canopy, "canopy"));

    // gear medallions on the roof panels
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 + 15) * DEG;
      const n = rad(a).multiplyScalar(0.39).setY(0.92).normalize();
      b.part(new PlaneGeometry(0.052, 0.052), i % 2 ? "#ffd66b" : "#ffb8a8", {
        bone: canopy,
        at: rad(a)
          .multiplyScalar(0.1845)
          .setY(CAN_Y + 0.0505)
          .addScaledVector(n, 0.002),
        dir: n,
        axis: "z",
        up: UP,
        texture: i % 2 ? GEAR_DECAL : GEAR_FINE,
        group: "canopy",
      });
    }

    // turret with the crown gear, a mast, flags and a finial
    b.part(
      lathe(
        [
          [0, 0],
          [0.028, 0],
          [0.028, 0.008],
          [0.019, 0.012],
          [0.019, 0.022],
          [0.025, 0.026],
          [0, 0.028],
        ],
        10,
      ),
      POL,
      { bone: canopy, at: [0, CAN_Y + 0.116, 0], group: "canopy" },
    );
    gear("gearCrown", canopy, V(0, CAN_Y + 0.15, 0), UP, V(0, 0, 1), 14, 0.0042, 0.0045, 5, COP, "canopy");
    b.rod([0, CAN_Y + 0.15, 0], [0, CAN_Y + 0.212, 0], 0.0018, { bone: canopy, color: POL, sides: 6, group: "canopy" });
    b.part(new SphereGeometry(0.0055, 8, 6), POL, { bone: canopy, at: [0, CAN_Y + 0.214, 0], group: "canopy" });
    [E_ROSE, E_MINT, E_LEMON].forEach((c, i) => {
      const a = (i * 120 + 30) * DEG;
      const ax = tang(a);
      b.extrude(
        [
          [0, 0],
          [0.05, 0.0025],
          [0.04, 0.0115],
          [0.052, 0.022],
          [0, 0.022],
        ],
        {
          at: V(0, CAN_Y + 0.16 + i * 0.017, 0),
          x: ax
            .clone()
            .add(V(0, -0.14, 0))
            .normalize(),
          y: UP.clone().add(ax.clone().multiplyScalar(0.14)).normalize(),
          thickness: 0.0022,
          bevel: 0.0005,
          color: c,
          bone: canopy,
          group: "canopy",
        },
      );
    });
  }

  // ================================================================================================ RIDERS
  const ringAt = (deg: number) => V(Math.sin(deg * DEG) * RING, 0, Math.cos(deg * DEG) * RING);
  const twist = barleyTwist(0.292, 0.0058, 2.6, 3, 9, 20);
  const poleAngles = [0, 72, 144, 216, 288];
  poleAngles.forEach((deg) => {
    const p = ringAt(deg);
    b.part(twist.clone(), POL, { bone: platform, at: [p.x, 0.266, p.z], group: "poles" });
    b.part(new CylinderGeometry(0.0062, 0.011, 0.012, 8), MID, {
      bone: platform,
      at: [p.x, DECK_Y + 0.004, p.z],
      dir: UP,
      group: "poles",
    });
    b.part(new SphereGeometry(0.0088, 8, 6), POL, { bone: platform, at: [p.x, DECK_Y + 0.011, p.z], group: "poles" });
    b.part(new CylinderGeometry(0.0095, 0.0095, 0.006, 8), MID, {
      bone: canopy,
      at: [p.x, CAN_Y - 0.009, p.z],
      dir: UP,
      group: "poles",
    });
    b.part(new SphereGeometry(0.0072, 8, 6), POL, { bone: canopy, at: [p.x, CAN_Y - 0.007, p.z], group: "poles" });
  });

  /** Everything a rider needs, in rider millimetres. */
  const kit = (xf: Xf, group: string) => {
    const P = (a: N3) => xf.p(a[0], a[1], a[2]);
    const ell = (bone: Joint, c: N3, r: N3, color: Fill, rot?: N3, seg: [number, number] = [8, 6]) =>
      b.part(new SphereGeometry(1, seg[0], seg[1]), color, {
        bone,
        at: P(c),
        quat: xf.rot(rot),
        scale: [xf.m(r[0]), xf.m(r[1]), xf.m(r[2])],
        group,
      });
    const cap = (bone: Joint, a: N3, c: N3, r0: number, r1: number, color: Fill, sides = 6) =>
      b.capsule(P(a), P(c), [xf.m(r0), xf.m(r1)], { bone, color, sides, group });
    const cone = (bone: Joint, base: N3, dir: N3, len: number, r: number, color: Fill, sides = 5) =>
      b.spike(P(base), xf.d(dir[0], dir[1], dir[2]), xf.m(len), xf.m(r), { bone, color, sides, group });
    const binEll = (bin: Bin, c: N3, r: N3, rot?: N3, seg: [number, number] = [8, 6]) =>
      bin.add(new SphereGeometry(1, seg[0], seg[1]), P(c), {
        quat: xf.rot(rot),
        scale: V(xf.m(r[0]), xf.m(r[1]), xf.m(r[2])),
      });
    const binCone = (bin: Bin, base: N3, dir: N3, len: number, r: number, sides = 5) => {
      const d = xf.d(dir[0], dir[1], dir[2]);
      bin.add(new ConeGeometry(xf.m(r), xf.m(len), sides), P(base).addScaledVector(d, xf.m(len) / 2), {
        quat: aim(d, undefined, "y"),
      });
    };
    /** Big glossy eyes on a skull ellipsoid, both sides. dir: where the left eye looks from the skull centre. */
    const eyes = (dark: Bin, glint: Bin, c: N3, r: N3, dir: N3, er: number) => {
      for (const s of [1, -1]) {
        const d = V(dir[0] * s, dir[1], dir[2]).normalize();
        const surf = V(c[0] + r[0] * d.x, c[1] + r[1] * d.y, c[2] + r[2] * d.z);
        const nrm = V(d.x / r[0], d.y / r[1], d.z / r[2]).normalize();
        const cen = surf.clone().addScaledVector(nrm, -er * 0.35);
        dark.add(new SphereGeometry(1, 8, 6), P([cen.x, cen.y, cen.z]), { scale: xf.m(er) });
        const g1 = cen
          .clone()
          .addScaledVector(nrm, er * 0.58)
          .add(V(0, er * 0.42, er * 0.16));
        glint.add(new SphereGeometry(1, 6, 4), P([g1.x, g1.y, g1.z]), { scale: xf.m(er * 0.3) });
        const g2 = cen
          .clone()
          .addScaledVector(nrm, er * 0.62)
          .add(V(-s * er * 0.3, -er * 0.4, er * 0.05));
        glint.add(new SphereGeometry(1, 6, 4), P([g2.x, g2.y, g2.z]), { scale: xf.m(er * 0.15) });
      }
    };
    /** A chain through rider points with a skinned tube over it. */
    const limb = (
      names: string[],
      pts: N3[],
      radii: number[],
      color: Fill,
      parent: Joint,
      role: "leg" | "tail" | "neck" | "wing" | "arm",
      sides = 6,
    ) => {
      const ch = b.chain(names[0], pts.map(P), { parent, names, role, group });
      b.sweep(
        ch,
        radii.map((r) => xf.m(r)),
        { color, sides, group },
      );
      return ch;
    };
    const hoof = (bone: Joint, a: N3, c: N3, r0: number, r1: number, len: number, color: Fill, sides = 6) => {
      const d = P(c).sub(P(a)).normalize();
      b.part(new CylinderGeometry(xf.m(r0), xf.m(r1), xf.m(len), sides), color, {
        bone,
        at: P(c).addScaledVector(d, -xf.m(1)),
        dir: d,
        group,
      });
    };
    const decal = (bone: Joint, tex: Texture, tint: string, c: N3, n: N3, size: number) =>
      b.part(new PlaneGeometry(xf.m(size), xf.m(size)), tint, {
        bone,
        at: P(c),
        dir: xf.d(n[0], n[1], n[2]),
        axis: "z",
        up: xf.d(0, 1, 0),
        texture: tex,
        group,
      });
    const outline = (pts: [number, number][]): [number, number][] => pts.map(([u, v]) => [xf.m(u), xf.m(v)]);
    return { P, ell, cap, cone, binEll, binCone, eyes, limb, hoof, decal, outline };
  };

  // ------------------------------------------------------------------------------------------------ Horse
  {
    const xf = new Xf(ringAt(0).setY(0.245), 0 + Math.PI / 2, 0.95);
    const g = "horse";
    const K = kit(xf, g);
    const { P } = K;
    const body = b.joint("horseBody", {
      parent: platform,
      at: P([0, 0, 0]),
      dir: xf.d(0, 0, 1),
      role: "spine",
      group: g,
    });
    const neck = b.joint("horseNeck", {
      parent: body,
      at: P([0, 16, 36]),
      aim: P([0, 50, 54]),
      role: "neck",
      group: g,
    });
    const head = b.joint("horseHead", {
      parent: neck,
      at: P([0, 50, 54]),
      aim: P([0, 56, 84]),
      role: "head",
      group: g,
    });
    const jaw = b.joint("horseJaw", { parent: head, at: P([0, 46, 68]), aim: P([0, 38, 88]), role: "jaw", group: g });

    const coat = lp(xf, (l, n, p) => {
      const ang = (Math.atan2(Math.abs(l.x), l.y) * 180) / Math.PI;
      if (Math.abs(l.z) < 22 && l.y > 4 && ang < 66 && l.y < 32) {
        if (Math.abs(l.z) > 18.5 || ang > 62) return POL;
        const d = Math.abs(fract(l.z / 7.5) - 0.5) + Math.abs(fract(l.x / 7.5) - 0.5);
        return d < 0.3 ? "#ff9db8" : "#f0668c";
      }
      if (l.z > 93 && l.y < 60) return "#ff9db8";
      if (l.y < -34 && Math.abs(l.z) < 90) return "#ffc0d0";
      const dapple = noise(p, 0.018, 4) > 0.64 && (l.z > 18 || l.z < -20) && l.y > -8;
      if (dapple) return "#d2dcf0";
      return n.y < -0.4 ? "#f4dcbc" : E_CREAM;
    });
    K.ell(body, [0, 0, 0], [27, 26, 44], coat);
    K.ell(body, [0, 3, 28], [25, 27, 24], coat);
    K.ell(body, [0, 2, -28], [26, 26, 24], coat);
    // carved saddle with pommel, cantle and studs
    K.ell(body, [0, 25, 0], [18, 6.5, 18], E_ROSE);
    K.ell(body, [0, 29, 14], [7, 6.5, 4], E_ROSE);
    K.ell(body, [0, 30, -14], [10, 8, 4.5], E_ROSE);
    const studs = new Bin();
    for (const z of [-14, 14])
      for (const s of [1, -1]) K.binEll(studs, [s * 8, 31, z + (z < 0 ? 4 : -4)], [1.8, 1.8, 1.8], undefined, [6, 4]);
    K.ell(body, [0, 2, 56], [5.5, 5.5, 2.6], POL);
    for (const s of [1, -1]) K.decal(body, ROSETTE, "#ffd66b", [s * 27.6, -3, 2], [s, 0, 0], 18);

    K.cap(neck, [0, 18, 36], [0, 52, 56], 17, 12, coat);
    K.ell(head, [0, 58, 62], [20, 21, 22], coat);
    K.ell(head, [0, 47, 86], [11.5, 11, 19], coat, [18, 0, 0]);
    K.ell(jaw, [0, 37, 84], [8.5, 4.8, 15], "#ffc0d0", [18, 0, 0]);
    const dark = new Bin();
    const glint = new Bin();
    K.eyes(dark, glint, [0, 58, 62], [20, 21, 22], [0.85, 0.28, 0.5], 8);
    for (const s of [1, -1]) {
      K.binEll(dark, [s * 5.5, 43, 103], [2.2, 2.8, 1.6], [18, 0, 0], [6, 4]);
      K.cone(head, [s * 10, 76, 54], [s * 0.25, 1, -0.35], 20, 6.6, coat, 4);
      K.cone(head, [s * 10, 75, 56], [s * 0.25, 1, -0.3], 13, 3.8, "#ffb0c4", 4);
    }
    // bridle
    b.part(new TorusGeometry(xf.m(12), xf.m(1.3), 4, 10), POL, {
      bone: head,
      at: P([0, 47, 84]),
      quat: xf.rot([18, 0, 0]),
      group: g,
    });
    for (const s of [1, -1])
      b.rod(P([s * 11.5, 50, 84]), P([s * 17, 68, 68]), xf.m(1), { bone: head, color: POL, sides: 4, group: g });
    // mane down the neck and a forelock
    const mane = new Bin();
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      K.binCone(mane, [0, 60 - 36 * t, 54 - 18 * t], [0, 0.55, -0.85], 14, 5, 4);
    }
    const fore = new Bin();
    for (const [dx, dz] of [
      [-5, 0],
      [0, 2],
      [5, 0],
    ] as const)
      K.binCone(fore, [dx, 77, 62 + dz], [dx * 0.05, 0.45, 0.9], 14, 4.6, 4);
    flush(mane, E_LAV, neck, g);
    flush(fore, E_LAV, head, g);
    flush(studs, POL, body, g);
    flush(dark, DARK, head, g);
    flush(glint, WHITE, head, g);
    K.limb(
      ["horseTail1", "horseTail2", "horseTail3"],
      [
        [0, 12, -50],
        [0, 20, -70],
        [0, 14, -88],
        [0, 0, -98],
      ],
      [8.5, 7, 5, 2.5],
      E_LAV,
      body,
      "tail",
    );
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const front: N3[] = [
        [s * 17, -14, 32],
        [s * 19, -33, 50],
        [s * 19, -30, 68],
        [s * 19, -42, 75],
      ];
      const hind: N3[] = [
        [s * 17, -12, -32],
        [s * 20, -30, -48],
        [s * 20, -47, -66],
        [s * 20, -58, -82],
      ];
      for (const [nm, pts, rr] of [
        ["F", front, [10, 8, 6.2, 5]],
        ["H", hind, [11, 8, 6.2, 5]],
      ] as const) {
        const ch = K.limb(
          [`horseHip${nm}${side}`, `horseKnee${nm}${side}`, `horseFetlock${nm}${side}`],
          [...pts],
          [...rr],
          coat,
          body,
          "leg",
        );
        K.hoof(ch.joints[2], pts[2], pts[3], 5, 6.4, 6.5, POL);
      }
    }
  }

  // ------------------------------------------------------------------------------------------------ Swan
  {
    const xf = new Xf(ringAt(72).setY(0.225), 72 * DEG + Math.PI / 2, 1);
    const g = "swan";
    const K = kit(xf, g);
    const { P } = K;
    const body = b.joint("swanBody", {
      parent: platform,
      at: P([0, 0, 0]),
      dir: xf.d(0, 0, 1),
      role: "spine",
      group: g,
    });
    const neckPts: N3[] = [
      [0, 14, 34],
      [0, 30, 50],
      [0, 50, 53],
      [0, 62, 45],
      [0, 66, 52],
    ];
    const neck = K.limb(
      ["swanNeck1", "swanNeck2", "swanNeck3", "swanNeck4"],
      neckPts,
      [16, 12, 9.5, 8.5, 9],
      E_WHITE,
      body,
      "neck",
      8,
    );
    const head = b.joint("swanHead", {
      parent: neck.joints[3],
      at: P([0, 66, 52]),
      aim: P([0, 66, 64]),
      role: "head",
      group: g,
    });
    const jaw = b.joint("swanJaw", { parent: head, at: P([0, 62, 60]), aim: P([0, 60, 76]), role: "jaw", group: g });

    const feathers = scales(["#ffffff", "#f2f8ff"], "#c8dcf2", { size: 0.0125, width: 0.16, seed: 4 });
    const coat = lp(xf, (l) =>
      l.y > 56 && l.z > 56 && l.y < 80 && Math.hypot(l.x, l.y - 68, l.z - 66) < 14 ? "#8fd0f4" : E_WHITE,
    );
    K.ell(body, [0, 0, 0], [28, 25, 46], feathers, [-8, 0, 0]);
    K.ell(body, [0, 11, -42], [15, 13, 21], feathers, [-28, 0, 0]);
    const plumes = new Bin();
    for (const [dx, dy] of [
      [-8, -6],
      [0, 0],
      [8, -6],
      [-4, 4],
      [4, 4],
    ] as const)
      K.binEll(plumes, [dx, 20 + dy * 0.4, -56], [3.2, 2, 15], [-38 + dy, dx * 1.6, 0], [6, 4]);
    flush(plumes, "#eaf3ff", body, g);
    K.ell(head, [0, 70, 56], [12, 12, 14], coat);
    K.ell(head, [0, 66, 67], [6.5, 4.2, 11], E_CORAL);
    K.ell(jaw, [0, 62, 67], [5.4, 2.2, 9.5], E_LEMON);
    const dark = new Bin();
    const glint = new Bin();
    K.eyes(dark, glint, [0, 70, 56], [12, 12, 14], [0.9, 0.35, 0.3], 6.2);
    for (const s of [1, -1]) K.binEll(dark, [s * 2.4, 68.5, 77.5], [1.4, 1.4, 1.4], undefined, [5, 4]);
    // gilt coronet
    const crown = new Bin();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      K.binCone(
        crown,
        [Math.sin(a) * 7.5, 81, 55 + Math.cos(a) * 7.5],
        [Math.sin(a) * 0.3, 1, Math.cos(a) * 0.3],
        9,
        2.8,
        4,
      );
    }
    K.binEll(crown, [0, 81, 55], [8, 2.4, 8], undefined, [8, 4]);
    flush(crown, POL, head, g);
    // raised wings: a bone tube along the leading edge and a scalloped, scale-engraved feather plate
    const wingPaint = paint((_p, _n, uv) => {
      const d = 0.6 * (uv[0] / xf.m(1) - 8) - 0.8 * (uv[1] / xf.m(1) + 8);
      return mix("#ffffff", "#8fc8f2", smoothstep(-13, -4, d));
    });
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const wpts: N3[] = [
        [s * 25, 10, 14],
        [s * 26, 24, 4],
        [s * 27, 36, -14],
        [s * 27, 46, -36],
      ];
      const wing = b.chain(`swanWing${side}`, wpts.map(P), {
        parent: body,
        names: [1, 2, 3].map((i) => `swanWing${side}${i}`),
        role: "wing",
        group: g,
      });
      b.sweep(wing, [xf.m(3.4), xf.m(3), xf.m(2.4), xf.m(1.8)], { color: E_WHITE, sides: 6, group: g });
      const outline: [number, number][] = [
        [0, -2],
        [6, 14],
        [20, 26],
        [40, 34],
        [62, 40],
        [78, 44],
      ];
      for (let j = 0; j < 6; j++)
        for (const [t, off] of [
          [(j + 0.35) / 6, 8],
          [(j + 0.85) / 6, -2],
        ] as const)
          outline.push([78 - 70 * t + 0.6 * off, 44 - 52 * t - 0.8 * off]);
      b.extrude(K.outline(outline), {
        at: P([s * 26.4, 8, 14]),
        x: xf.d(0, 0, -1),
        y: xf.d(s * 0.25, 1, 0),
        thickness: xf.m(3.4),
        bevel: xf.m(0.8),
        color: wingPaint,
        bone: wing.joints[0],
        group: g,
      });
      K.decal(body, ROSETTE, "#ffd66b", [s * 27.8, -6, 12], [s, 0, 0], 14);
    }
    // blue cushion saddle with tassels
    K.ell(body, [0, 22, -2], [19, 6.5, 17], E_SKY);
    const tas = new Bin();
    for (const s of [1, -1])
      for (const z of [-16, 12]) K.binEll(tas, [s * 17, 24, z], [2.4, 2.4, 2.4], undefined, [6, 4]);
    K.binEll(tas, [0, 28, -2], [4, 2.4, 4], undefined, [6, 4]);
    flush(tas, POL, body, g);
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const lpts: N3[] = [
        [s * 12, -16, -4],
        [s * 12, -27, -1],
        [s * 12, -37, 3],
        [s * 12, -42, 9],
      ];
      const ch = K.limb(
        [`swanHip${side}`, `swanKnee${side}`, `swanAnkle${side}`],
        lpts,
        [4, 3, 2.6, 2.4],
        E_CORAL,
        body,
        "leg",
      );
      b.part(new SphereGeometry(1, 8, 4), E_CORAL, {
        bone: ch.joints[2],
        at: P([s * 12, -42, 12]),
        quat: xf.rot(),
        scale: [xf.m(9), xf.m(1.8), xf.m(10)],
        group: g,
      });
    }
    flush(dark, DARK, head, g);
    flush(glint, WHITE, head, g);
  }

  // ------------------------------------------------------------------------------------------------ Pig
  {
    const xf = new Xf(ringAt(144).setY(0.232), 144 * DEG + Math.PI / 2, 0.93);
    const g = "pig";
    const K = kit(xf, g);
    const { P } = K;
    const body = b.joint("pigBody", {
      parent: platform,
      at: P([0, 0, 0]),
      dir: xf.d(0, 0, 1),
      role: "spine",
      group: g,
    });
    const head = b.joint("pigHead", { parent: body, at: P([0, 6, 30]), aim: P([0, 6, 60]), role: "head", group: g });
    const jaw = b.joint("pigJaw", { parent: head, at: P([0, -4, 48]), aim: P([0, -8, 66]), role: "jaw", group: g });
    const skin = lp(xf, (l, n) => {
      if (Math.abs(l.z) < 24 && l.y > 4 && Math.atan2(Math.abs(l.x), l.y) < 1.15 && l.y < 32) {
        if (Math.abs(l.z) > 20.5) return POL;
        const d = Math.hypot(fract(l.z / 9) - 0.5, fract(l.x / 9) - 0.5);
        return d < 0.24 ? "#ffffff" : "#8ee0bc";
      }
      if (l.z > 40 && Math.hypot(l.x - Math.sign(l.x) * 15, l.y - 2, l.z - 54) < 6) return "#ff7fa0";
      return n.y < -0.4 ? "#f28fac" : E_PINK;
    });
    K.ell(body, [0, 0, 0], [31, 29, 41], skin);
    K.ell(body, [0, 26, 0], [18, 6, 16], E_MINT);
    const studs = new Bin();
    for (const s of [1, -1])
      for (const z of [-10, 10]) K.binEll(studs, [s * 10, 30, z], [1.9, 1.9, 1.9], undefined, [6, 4]);
    flush(studs, POL, body, g);
    for (const s of [1, -1]) K.decal(body, ROSETTE, "#ffd66b", [s * 31.6, -6, 2], [s, 0, 0], 16);
    K.ell(head, [0, 8, 46], [23, 21, 20], skin);
    K.ell(head, [0, 3, 64], [12.5, 10.5, 7], E_ROSE);
    K.ell(jaw, [0, -9, 54], [11, 4.6, 11], E_PINK);
    const dark = new Bin();
    const glint = new Bin();
    K.eyes(dark, glint, [0, 8, 46], [23, 21, 20], [0.72, 0.36, 0.62], 5.6);
    for (const s of [1, -1]) {
      K.binEll(dark, [s * 4.6, 3, 70.5], [2.2, 3, 1.4], undefined, [6, 4]);
      K.cone(head, [s * 13, 24, 40], [s * 0.6, 0.4, 0.7], 17, 9.5, E_PINK, 4);
      K.cone(head, [s * 13, 24, 40.5], [s * 0.6, 0.4, 0.7], 12, 6, "#ff88a8", 4);
    }
    // bow between the ears
    const bow = new Bin();
    for (const s of [1, -1]) K.binCone(bow, [s * 1.5, 30, 46], [s * 1, 0.55, 0.15], 9, 4.2, 4);
    K.binEll(bow, [0, 30, 46], [2.6, 2.6, 2.6], undefined, [6, 4]);
    flush(bow, E_LAV, head, g);
    flush(dark, DARK, head, g);
    flush(glint, WHITE, head, g);
    K.limb(
      ["pigTail1", "pigTail2", "pigTail3"],
      [
        [0, 14, -38],
        [0, 22, -50],
        [7, 30, -52],
        [10, 34, -44],
      ],
      [4.4, 3.4, 2.6, 1.8],
      E_PINK,
      body,
      "tail",
    );
    for (const s of [1, -1])
      for (const [nm, z] of [
        ["F", 25],
        ["H", -25],
      ] as const) {
        const side = s > 0 ? "L" : "R";
        const pts: N3[] = [
          [s * 19, -16, z],
          [s * 22, -32, z + Math.sign(z) * 3],
          [s * 22, -44, z + Math.sign(z) * 5],
        ];
        const ch = K.limb([`pigHip${nm}${side}`, `pigKnee${nm}${side}`], pts, [10, 8, 7], skin, body, "leg");
        K.hoof(ch.joints[1], pts[1], pts[2], 6.6, 7.6, 7, E_CREAM, 6);
      }
  }

  // ------------------------------------------------------------------------------------------------ Rooster
  {
    const xf = new Xf(ringAt(216).setY(0.248), 216 * DEG + Math.PI / 2, 0.95);
    const g = "rooster";
    const K = kit(xf, g);
    const { P } = K;
    const body = b.joint("roosterBody", {
      parent: platform,
      at: P([0, 0, 0]),
      dir: xf.d(0, 0, 1),
      role: "spine",
      group: g,
    });
    const neck = b.joint("roosterNeck", {
      parent: body,
      at: P([0, 20, 24]),
      aim: P([0, 44, 32]),
      role: "neck",
      group: g,
    });
    const head = b.joint("roosterHead", {
      parent: neck,
      at: P([0, 44, 32]),
      aim: P([0, 58, 38]),
      role: "head",
      group: g,
    });
    const jaw = b.joint("roosterJaw", { parent: head, at: P([0, 55, 43]), aim: P([0, 53, 56]), role: "jaw", group: g });
    const feathers = scales(["#ff9a5e", "#ffb074", "#f68448"], "#c4502c", { size: 0.0115, width: 0.13, seed: 6 });
    const coat = lp(xf, (l) => {
      if (l.z > 6 && l.y < 30 && l.y > -12 && l.z < 42) return "#fff0d2";
      if (l.y > 44) return "#fff0d2";
      if (Math.abs(l.z) < 18 && l.y > 12 && l.y < 32 && Math.abs(l.x) < 16)
        return l.y > 28 || Math.abs(l.z) > 15 ? POL : E_MINT;
      return feathers;
    });
    K.ell(body, [0, 0, 0], [24, 26, 36], coat, [12, 0, 0]);
    K.ell(body, [0, 6, 22], [20, 21, 17], coat);
    K.ell(body, [0, 27, 0], [15, 5.5, 14], E_MINT);
    const studs = new Bin();
    for (const s of [1, -1])
      for (const z of [-8, 8]) K.binEll(studs, [s * 8, 30, z], [1.8, 1.8, 1.8], undefined, [6, 4]);
    flush(studs, POL, body, g);
    K.cap(neck, [0, 20, 24], [0, 46, 32], 13, 10.5, coat);
    K.ell(head, [0, 60, 37], [13, 14, 14], coat);
    K.cone(head, [0, 59, 46], [0, -0.08, 1], 15, 6.4, E_LEMON, 4);
    K.cone(jaw, [0, 55, 46], [0, -0.16, 1], 11, 4.8, "#f5b640", 4);
    K.ell(jaw, [0, 47, 44], [3.2, 7, 2.6], E_RED);
    const dark = new Bin();
    const glint = new Bin();
    K.eyes(dark, glint, [0, 60, 37], [13, 14, 14], [0.85, 0.22, 0.5], 4.6);
    for (const s of [1, -1]) K.binEll(dark, [s * 2, 61, 52], [1.1, 1.1, 1.1], undefined, [5, 4]);
    b.extrude(
      K.outline([
        [-10, 0],
        [-11, 8],
        [-6, 12],
        [-4.5, 7],
        [0, 15],
        [4, 7],
        [6, 12],
        [11, 7],
        [10, 0],
      ]),
      {
        at: P([0, 71, 37]),
        x: xf.d(0, 0, 1),
        y: xf.d(0, 1, 0),
        thickness: xf.m(5),
        bevel: xf.m(1),
        smoothing: 1,
        color: E_RED,
        bone: head,
        group: g,
      },
    );
    flush(dark, DARK, head, g);
    flush(glint, WHITE, head, g);
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const wpts: N3[] = [
        [s * 23, 14, 14],
        [s * 26, 4, -4],
        [s * 26, -6, -24],
        [s * 22, -10, -40],
      ];
      const wing = b.chain(`roosterWing${side}`, wpts.map(P), {
        parent: body,
        names: [1, 2, 3].map((i) => `roosterWing${side}${i}`),
        role: "wing",
        group: g,
      });
      const wcol = scales(["#5cc4c0", "#78d6cc", "#4aaeb8"], "#2a7c8c", { size: 0.011, width: 0.14, seed: 8 });
      b.sweep(wing, (t) => [xf.m(13 - 6 * t), xf.m(2.6)], {
        color: wcol,
        section: "box",
        up: xf.d(s, 0, 0),
        caps: { start: "flat", end: "point" },
        group: g,
      });
    }
    // tail: a rising chain with a fan of teal-blue plumes
    const tail = K.limb(
      ["roosterTail1", "roosterTail2"],
      [
        [0, 14, -32],
        [0, 30, -46],
        [0, 50, -56],
      ],
      [6, 5, 3],
      E_MINT,
      body,
      "tail",
    );
    const plumeCol = paint((p) => mix("#3ec0b4", "#7a68d8", smoothstep(0.26, 0.4, p.y) * 0.9));
    for (let i = -2; i <= 2; i++) {
      const a = i * 0.5;
      const path = catmull([
        P([0, 22, -36]),
        P([a * 10, 44, -54 - Math.abs(i) * 2]),
        P([a * 22, 66, -62 - Math.abs(i) * 4]),
        P([a * 30, 82, -50 - Math.abs(i) * 4]),
      ]);
      b.sweep(path, [xf.m(2.5), xf.m(7), xf.m(6), xf.m(2.6), xf.m(0.4)], {
        color: plumeCol,
        sides: 6,
        bone: tail.joints[1],
        group: g,
      });
    }
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const lpts: N3[] = [
        [s * 11, -22, -2],
        [s * 13, -36, 2],
        [s * 13, -48, -3],
        [s * 13, -52, 6],
      ];
      const ch = K.limb(
        [`roosterHip${side}`, `roosterKnee${side}`, `roosterAnkle${side}`],
        lpts,
        [4.4, 3.2, 2.6, 2.4],
        E_LEMON,
        body,
        "leg",
      );
      const toes = new Bin();
      const base = P([s * 13, -50, 4]);
      for (const [dx, dz] of [
        [-7, 15],
        [0, 18],
        [7, 15],
        [0, -10],
      ] as const)
        toes.rod(base, P([s * 13 + dx, -53, 4 + dz]), xf.m(1.6), xf.m(1.1), 5);
      flush(toes, E_LEMON, ch.joints[2], g);
    }
  }

  // ------------------------------------------------------------------------------------------------ Dragon
  {
    const xf = new Xf(ringAt(288).setY(0.224), 288 * DEG + Math.PI / 2, 0.92);
    const g = "dragon";
    const K = kit(xf, g);
    const { P } = K;
    const body = b.joint("dragonBody", {
      parent: platform,
      at: P([0, 0, 0]),
      dir: xf.d(0, 0, 1),
      role: "spine",
      group: g,
    });
    const neck = K.limb(
      ["dragonNeck1", "dragonNeck2"],
      [
        [0, 10, 32],
        [0, 24, 42],
        [0, 38, 46],
      ],
      [15, 12, 11],
      "#7fdcb8",
      body,
      "neck",
      8,
    );
    const head = b.joint("dragonHead", {
      parent: neck.joints[1],
      at: P([0, 38, 46]),
      aim: P([0, 40, 66]),
      role: "head",
      group: g,
    });
    const jaw = b.joint("dragonJaw", { parent: head, at: P([0, 36, 62]), aim: P([0, 33, 80]), role: "jaw", group: g });
    const hide = scales(["#84dfba", "#72d2b0", "#94e6c4"], "#3f9c86", { size: 0.0105, width: 0.13, seed: 9 });
    const coat = lp(xf, (l) => {
      if (l.y < -6 && l.z > -34 && l.z < 40 && Math.abs(l.x) < 20)
        return fract(l.z / 8.5) < 0.62 ? "#fff0d0" : "#ffd9a4";
      if (Math.abs(l.z) < 18 && l.y > 12 && l.y < 30 && Math.abs(l.x) < 17)
        return l.y > 27 || Math.abs(l.z) > 15 ? POL : E_LEMON;
      return hide;
    });
    // fixed neck skin must match: repaint the neck tube by the same hide
    K.ell(body, [0, 0, 0], [24, 23, 38], coat);
    K.ell(body, [0, 26, 0], [15, 5.5, 14], E_LEMON);
    const studs = new Bin();
    for (const s of [1, -1])
      for (const z of [-8, 8]) K.binEll(studs, [s * 8, 29, z], [1.8, 1.8, 1.8], undefined, [6, 4]);
    flush(studs, POL, body, g);
    for (const s of [1, -1]) K.decal(body, ROSETTE, "#ffd66b", [s * 24.6, -4, 2], [s, 0, 0], 15);
    K.ell(head, [0, 44, 54], [21, 18, 20], hide);
    K.ell(head, [0, 39, 70], [13, 9.5, 12], "#a0eccc");
    K.ell(jaw, [0, 33, 71], [10.5, 4.6, 12], "#ffe4b0");
    const dark = new Bin();
    const glint = new Bin();
    K.eyes(dark, glint, [0, 44, 54], [21, 18, 20], [0.8, 0.32, 0.55], 6.6);
    const teeth = new Bin();
    for (const s of [1, -1]) {
      K.binEll(dark, [s * 5, 42, 79], [1.9, 2.2, 1.4], undefined, [6, 4]);
      K.binCone(teeth, [s * 6, 35, 76], [0, -1, 0.1], 4.5, 1.4, 4);
      K.cone(head, [s * 10, 58, 46], [s * 0.4, 0.75, -0.5], 17, 4.4, POL, 5);
      K.ell(head, [s * 20, 45, 50], [2, 8, 9], E_LAV, [0, 0, s * 20]);
    }
    flush(teeth, "#ffffff", head, g);
    flush(dark, DARK, head, g);
    flush(glint, WHITE, head, g);
    // back spikes
    const spikes = new Bin();
    [
      [0, 34, 46],
      [0, 22, 30],
    ].forEach(() => undefined);
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const z = 40 - 100 * t;
      const y = 22 * Math.sqrt(Math.max(0, 1 - (z / 38) ** 2)) + (z < -38 ? 3 : 0);
      K.binCone(spikes, [0, i < 3 ? y - 2 : Math.max(y, 8) + (z < -38 ? 8 : 0), z], [0, 1, -0.5], 9 - t * 3, 3.6, 4);
    }
    flush(spikes, E_LAV, body, g);
    // wings: arm chain with a scalloped membrane and finger struts
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const S: N3 = [s * 20, 14, 10];
      const M: N3 = [s * 38, 36, 2];
      const W: N3 = [s * 52, 52, -8];
      const arm = b.chain(`dragonWing${side}`, [P(S), P(M), P(W)], {
        parent: body,
        names: [`dragonWing${side}1`, `dragonWing${side}2`],
        role: "wing",
        group: g,
      });
      b.sweep(arm, [xf.m(3.4), xf.m(2.8), xf.m(2.2)], { color: POL, sides: 5, group: g });
      const e1 = P(W).sub(P(S)).normalize();
      const back = xf.d(0, 0, -1);
      const e2 = back.clone().addScaledVector(e1, -back.dot(e1)).normalize();
      const L = P(W).distanceTo(P(S)) / xf.m(1);
      const tipsUV: [number, number][] = [
        [L + 20, 26],
        [L * 0.95, 56],
        [L * 0.55, 58],
      ];
      const notch = (a: [number, number], c: [number, number]): [number, number] => {
        const mx = (a[0] + c[0]) / 2;
        const my = (a[1] + c[1]) / 2;
        return [mx + (L * 0.5 - mx) * 0.35, my + (22 - my) * 0.35];
      };
      b.extrude(
        K.outline([
          [0, 0],
          [L, 0],
          tipsUV[0],
          notch(tipsUV[0], tipsUV[1]),
          tipsUV[1],
          notch(tipsUV[1], tipsUV[2]),
          tipsUV[2],
          [L * 0.14, 34],
        ]),
        {
          at: P(S),
          x: e1,
          y: e2,
          thickness: xf.m(2),
          color: paint((_p, _n, uv) => mix("#c8aaf4", "#ffc4dc", smoothstep(0, 0.045, uv[1]))),
          bone: arm.joints[0],
          group: g,
        },
      );
      for (const [u, v] of tipsUV)
        b.rod(P(W), P(S).addScaledVector(e1, xf.m(u)).addScaledVector(e2, xf.m(v)), xf.m(1.1), {
          bone: arm.joints[1],
          color: POL,
          sides: 4,
          group: g,
        });
    }
    const tail = K.limb(
      ["dragonTail1", "dragonTail2", "dragonTail3", "dragonTail4"],
      [
        [0, 4, -36],
        [0, 6, -54],
        [4, 14, -70],
        [8, 22, -84],
        [8, 28, -96],
      ],
      [12, 9.5, 6.5, 4.6, 2.6],
      hide,
      body,
      "tail",
      8,
    );
    b.extrude(
      K.outline([
        [0, 0],
        [-7.5, 8],
        [0, 22],
        [7.5, 8],
      ]),
      {
        at: P([8, 28, -96]),
        x: xf.d(1, 0, 0),
        y: xf.d(0.25, 0.55, -0.8),
        thickness: xf.m(2.4),
        bevel: xf.m(0.6),
        color: E_LAV,
        bone: tail.joints[3],
        group: g,
      },
    );
    for (const s of [1, -1])
      for (const [nm, z] of [
        ["F", 20],
        ["H", -20],
      ] as const) {
        const side = s > 0 ? "L" : "R";
        const pts: N3[] = [
          [s * 16, -14, z],
          [s * 19, -30, z + Math.sign(z) * 3],
          [s * 19, -40, z + Math.sign(z) * 5],
        ];
        const ch = K.limb([`dragonHip${nm}${side}`, `dragonKnee${nm}${side}`], pts, [9, 7, 6], hide, body, "leg");
        const claws = new Bin();
        for (const dx of [-5, 0, 5])
          K.binCone(claws, [s * 19 + dx, -40, z + Math.sign(z) * 5], [dx * 0.05, -0.4, 1], 8, 2.4, 4);
        flush(claws, POL, ch.joints[1], g);
      }
  }

  // ================================================================================================ SPECTATORS, BOOTH
  const ledgeSpot = (deg: number, r: number) => V(Math.sin(deg * DEG) * r, LEDGE_Y, Math.cos(deg * DEG) * r);

  // ---- bunny with a cotton-candy cone
  {
    const a = 34;
    const xf = new Xf(ledgeSpot(a, 0.245), (a + 28) * DEG, 1);
    const K = kit(xf, "bunny");
    const fur = lp(xf, (l, n) =>
      n.y < -0.5 ? "#f0e0e8" : l.z > 6 && l.y > 34 && Math.abs(l.x) > 8 && l.y < 44 ? "#ffc0d0" : E_WHITE,
    );
    K.ell(root, [0, 19, 0], [15, 18, 13], fur);
    K.ell(root, [0, 47, 3], [16, 14, 14], fur);
    K.ell(root, [0, 12, -13], [5.5, 5.5, 5.5], "#ffffff");
    for (const s of [1, -1]) {
      K.ell(root, [s * 8, 3, 5], [6, 3, 8], fur);
      K.ell(root, [s * 7, 73, 0], [4.6, 17, 3], fur, [0, 0, s * -10]);
      K.ell(root, [s * 7.6, 72, 2], [2.6, 13, 1.6], "#ffa6bc", [0, 0, s * -10]);
      K.cap(root, [s * 13, 30, 3], [s * 15, 22, 12], 3.4, 3, fur);
    }
    K.ell(root, [0, 42, 16], [6, 4.4, 4], "#ffffff");
    K.ell(root, [0, 43, 19.5], [2.3, 1.7, 1.5], "#ff7fa0");
    const dark = new Bin();
    const glint = new Bin();
    K.eyes(dark, glint, [0, 47, 3], [16, 14, 14], [0.55, 0.25, 0.85], 3.3);
    flush(dark, DARK, root, "bunny");
    flush(glint, WHITE, root, "bunny");
    // bow tie
    const bow = new Bin();
    for (const s of [1, -1]) K.binCone(bow, [s * 1.5, 34, 10], [s * 1, 0.1, 0.5], 7, 3.2, 4);
    K.binEll(bow, [0, 34, 10.5], [2.2, 2.2, 2.2], undefined, [6, 4]);
    flush(bow, E_LAV, root, "bunny");
    // cotton candy on a stick
    b.rod(K.P([-15, 22, 12]), K.P([-15, 56, 12]), 1.3e-3, { bone: root, color: "#f2e4c0", sides: 5, group: "bunny" });
    const candy = paint((p) => mix("#ffc6dc", "#ffffff", noise(p, 0.008, 3)));
    K.ell(root, [-15, 62, 12], [11, 10, 11], candy);
    K.ell(root, [-21, 58, 14], [6, 6, 6], candy);
    K.ell(root, [-9, 68, 10], [6, 6, 6], candy);
  }

  // ---- mouse with a ticket
  {
    const a = -16;
    const xf = new Xf(ledgeSpot(a, 0.245), (a - 32) * DEG, 1);
    const K = kit(xf, "mouse");
    const fur = lp(xf, (l, n) =>
      n.y < -0.5 ? "#a8b4cc" : l.y < 36 && l.z > 4 && Math.abs(l.x) < 9 ? "#fff0e0" : E_SKY,
    );
    K.ell(root, [0, 17, 0], [13, 16, 11], fur);
    K.ell(root, [0, 40, 3], [13, 12, 13], fur);
    K.ell(root, [0, 37, 15], [6.5, 5.5, 6.5], fur);
    K.ell(root, [0, 38, 20], [2.4, 2, 2], "#ff7fa0");
    for (const s of [1, -1]) {
      K.ell(root, [s * 8, 3, 5], [5, 2.6, 7], fur);
      K.ell(root, [s * 14, 52, -1], [9.4, 9.4, 2.4], fur, [0, s * -22, 0]);
      K.ell(root, [s * 14.6, 52, 0.4], [6.2, 6.2, 1.6], "#ffa6bc", [0, s * -22, 0]);
      K.cap(root, [s * 11, 27, 3], [s * 13, 22, 11], 3, 2.8, fur);
    }
    const dark = new Bin();
    const glint = new Bin();
    K.eyes(dark, glint, [0, 40, 3], [13, 12, 13], [0.55, 0.3, 0.8], 3.4);
    flush(dark, DARK, root, "mouse");
    flush(glint, WHITE, root, "mouse");
    const whisk = new Bin();
    for (const s of [1, -1])
      for (const dy of [-2, 1.5])
        whisk.rod(K.P([s * 5, 37 + dy, 19]), K.P([s * 19, 37 + dy * 3, 19]), 0.25e-3, 0.25e-3, 3);
    flush(whisk, DARK, root, "mouse");
    b.sweep(
      catmull([K.P([0, 9, -9]), K.P([0, 5, -22]), K.P([6, 8, -34]), K.P([10, 16, -38])]),
      [0.0028, 0.0024, 0.0018, 0.001],
      { color: "#ffa6bc", bone: root, sides: 5, group: "mouse" },
    );
    // a big paper ticket
    b.part(new BoxGeometry(0.03, 0.0016, 0.017), E_LEMON, {
      bone: root,
      at: K.P([-15, 32, 14]),
      quat: xf.rot([70, 0, 14]),
      group: "mouse",
    });
    b.part(new PlaneGeometry(0.014, 0.014), "#e8506a", {
      bone: root,
      at: K.P([-15, 32.5, 14.4]),
      quat: xf.rot([70, 0, 14]),
      dir: xf.d(-0.05, 0.6, 0.85),
      axis: "z",
      up: xf.d(0, 1, 0),
      texture: GEAR_DECAL,
      group: "mouse",
    });
  }

  // ---- ticket booth
  {
    const a = -58;
    const xf = new Xf(ledgeSpot(a, 0.24), a * DEG, 1);
    const K = kit(xf, "booth");
    const walls = lp(xf, (l, n) => {
      if (n.z > 0.6 && l.y > 18 && l.y < 42 && Math.abs(l.x) < 22) return E_PLUM;
      if (l.y < 4) return POL;
      return fract((l.x + 200) / 11) < 0.5 ? E_LEMON : E_CREAM;
    });
    b.part(new BoxGeometry(xf.m(64), xf.m(56), xf.m(50)), walls, {
      bone: root,
      at: K.P([0, 28, 0]),
      quat: xf.rot(),
      group: "booth",
    });
    // counter shelf and awning
    b.part(new BoxGeometry(xf.m(56), xf.m(3), xf.m(14)), POL, {
      bone: root,
      at: K.P([0, 17.5, 30]),
      quat: xf.rot(),
      group: "booth",
    });
    const roof = paint((p, n) => {
      if (n.y < -0.4) return E_PLUM;
      const c = Math.floor((p.x + p.z) * 2000) % 2;
      return c ? E_ROSE : E_CREAM;
    });
    b.part(new ConeGeometry(xf.m(47), xf.m(34), 4), roof, {
      bone: root,
      at: K.P([0, 73, 0]),
      quat: xf.rot([0, 45, 0]),
      group: "booth",
    });
    b.part(new SphereGeometry(xf.m(3.2), 8, 6), POL, { bone: root, at: K.P([0, 92, 0]), group: "booth" });
    b.part(new PlaneGeometry(xf.m(50), xf.m(14.5), 1, 1), "#ffffff", {
      bone: root,
      at: K.P([0, 52, 26]),
      dir: xf.d(0, 0, 1),
      axis: "z",
      up: xf.d(0, 1, 0),
      texture: TICKETS,
      group: "booth",
    });
    b.part(new PlaneGeometry(xf.m(18), xf.m(18)), "#ffffff", {
      bone: root,
      at: K.P([0, 63, 25.5]),
      dir: xf.d(0, 0.1, 1),
      axis: "z",
      up: xf.d(0, 1, 0),
      texture: DIAL,
      group: "booth",
    });
    // ticket strips and a little bell
    const strips = new Bin();
    [-14, -4, 8].forEach((x, i) =>
      strips.add(new BoxGeometry(xf.m(7), xf.m(0.8), xf.m(15)), K.P([x, 19.6, 30 + (i % 2) * 2]), {
        quat: xf.rot([0, x, 0]),
      }),
    );
    flush(strips, WHITE, root, "booth");
    for (const s of [1, -1]) {
      b.part(new CylinderGeometry(xf.m(3), xf.m(3), xf.m(58), 6), POL, {
        bone: root,
        at: K.P([s * 32, 29, 25]),
        group: "booth",
      });
      b.part(new PlaneGeometry(xf.m(14), xf.m(14)), s > 0 ? "#ffd66b" : "#ffb0a0", {
        bone: root,
        at: K.P([s * 33, 34, 0]),
        dir: xf.d(s, 0, 0),
        axis: "z",
        up: xf.d(0, 1, 0),
        texture: GEAR_DECAL,
        group: "booth",
      });
    }
  }

  // ---- balloon seller: a round little bear with a bunch of balloons
  {
    const a = 116;
    const xf = new Xf(ledgeSpot(a, 0.244), (a - 25) * DEG, 1.05);
    const K = kit(xf, "seller");
    const fur = "#dca66a";
    const apron = lp(xf, (l, n) =>
      n.z > 0.35 && l.y < 36 && l.y > -2
        ? fract(l.x / 8 + 40) < 0.5
          ? "#ffffff"
          : "#9ce2c2"
        : n.y < -0.5
          ? "#b88450"
          : "#e4b076",
    );
    K.ell(root, [0, 24, 0], [20, 23, 17], apron);
    K.ell(root, [0, 57, 3], [18.5, 16, 16.5], "#e8b47a");
    K.ell(root, [0, 52.5, 17], [9.5, 7.5, 6], "#fff0d6");
    K.ell(root, [0, 55, 22], [3.2, 2.3, 2], DARK);
    for (const s of [1, -1]) {
      K.ell(root, [s * 10, 3, 6], [7.5, 3.4, 10], fur);
      K.ell(root, [s * 15, 73, -1], [7.4, 7.4, 4.4], "#e8b47a");
      K.ell(root, [s * 15, 73, 1.8], [4.2, 4.2, 2.6], "#ffb8c8");
      K.ell(root, [s * 12, 47, 15], [3.4, 2.2, 1.2], "#ffa0b4");
    }
    K.cap(root, [-16, 34, 2], [-22, 22, 10], 4.6, 4, "#e8b47a");
    const hand = [24, 70, 12] as const;
    K.cap(root, [16, 36, 2], [21, 52, 8], 4.6, 4.2, "#e8b47a");
    K.cap(root, [21, 52, 8], hand, 4.2, 4.2, "#e8b47a");
    K.ell(root, [...hand], [4.8, 4.8, 4.8], "#e8b47a");
    const dark = new Bin();
    const glint = new Bin();
    K.eyes(dark, glint, [0, 57, 3], [18.5, 16, 16.5], [0.5, 0.3, 0.85], 3.5);
    flush(dark, DARK, root, "seller");
    flush(glint, WHITE, root, "seller");
    // a boater hat
    const hat = paint((_p, n, s) =>
      n.y > 0.6 ? E_LEMON : s[0] > 0 ? (fract(s[1] / 45) < 0.5 ? E_ROSE : E_CREAM) : E_LEMON,
    );
    b.lathe(
      [
        [0, 0],
        [xf.m(20), 0],
        [xf.m(20), xf.m(2)],
        [xf.m(12), xf.m(3)],
        [xf.m(12), xf.m(12)],
        [0, xf.m(12)],
      ],
      { at: K.P([0, 69, 3]), axis: [0, 1, 0], segments: 10, color: hat, bone: root, group: "seller" },
    );
    // the bunch: strings meeting at the hand, balloons above
    const strings = new Bin();
    const knots = new Bin();
    const cols: Fill[] = [E_PINK, E_MINT, E_LEMON, E_SKY, E_LAV, E_CORAL, E_ROSE];
    const h = K.P([...hand]);
    cols.forEach((c, i) => {
      const th = (i / cols.length) * TAU + 0.6;
      const lift = 0.1 + 0.05 * ((i * 3) % 4);
      const spread = 0.028 + 0.018 * ((i * 5) % 3);
      const top = V(h.x + Math.sin(th) * spread, h.y + lift + 0.05, h.z + Math.cos(th) * spread);
      const base = top.clone().add(V(0, -0.02, 0));
      strings.rod(h, base, 0.0004, 0.0004, 3);
      knots.add(new ConeGeometry(0.0022, 0.0045, 4), base.clone().add(V(0, -0.001, 0)), {
        quat: new Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI),
      });
      b.part(new SphereGeometry(1, 8, 6), c, { bone: root, at: top, scale: [0.0175, 0.021, 0.0175], group: "seller" });
    });
    flush(strings, "#f2ecdc", root, "seller");
    flush(knots, "#ffb0c4", root, "seller");
  }

  // ---- confetti, scattered on the ledge and in the air
  {
    const cols = ["#ff7fa0", "#ffe27a", "#8fd0f4", "#9ce2c2", "#c6a8f2", "#ffa070"];
    const bins = cols.map(() => new Bin());
    const flat = new PlaneGeometry(0.011, 0.0055);
    const flip = new Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI);
    for (let i = 0; i < 130; i++) {
      const air = i < 100;
      const a = random() * TAU;
      const r = air ? 0.05 + random() * 0.26 : 0.215 + random() * 0.06;
      const y = air ? 0.14 + random() * 0.43 : LEDGE_Y + 0.0012;
      const q = air
        ? new Quaternion().setFromEuler(new Euler(random() * TAU, random() * TAU, random() * TAU))
        : new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, random() * TAU));
      const at = V(Math.sin(a) * r, y, Math.cos(a) * r);
      const bin = bins[i % bins.length];
      bin.add(flat, at, { quat: q });
      bin.add(flat, at, { quat: q.clone().multiply(flip) });
    }
    bins.forEach((bn, i) => flush(bn, cols[i], root, "confetti"));
  }

  return b.root;
}
