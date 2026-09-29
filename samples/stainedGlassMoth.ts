// Stained glass luna moth: an Art Nouveau Tiffany-lamp showpiece, 0.62 m across, wings spread flat as if pinned in a
// lamp. Each wing is a leaded glass panel: an `svg()` drawing of jewel-toned panes (jade, emerald, celadon, amber,
// rose, garnet, plum, cobalt, opalescent white) split by dark lead came that follows whiplash curves out of a glass
// roundel eyespot, with soldered joints and margin cabochons. The drawing sits as a decal on both faces of an
// extruded lead-rimmed slab of the same outline, with raised lead ribs over the main veins. The body is patinated
// bronze: a mottled bronze-and-verdigris paint, segment grooves, collar hoops, projected whiplash filigree curls,
// a cobalt glass jewel in a bezel, jade glass eyes, a coiled proboscis, bronze plume-cards for the fur and
// bipectinate antennae combed with bronze barb-cards.
import * as THREE from "three";
import type { JointRef } from "../src/context";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import type { V3 } from "../src/math";
import { mix, mottle, noise, paint, smoothstep } from "../src/paint";
import { catmull, spiral } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Stained glass moth",
  description:
    "A 0.62 m Art Nouveau luna moth pinned flat like a Tiffany lamp: leaded jewel-glass wings with whiplash lead came and glass roundel eyespots, and a patinated-bronze filigree body with feathery antennae.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette. Glass first, then lead and bronze.
const JADE = "#2eaa7c";
const EMERALD = "#16805c";
const CELADON = "#a6e0bb";
const SEAFOAM = "#54c9b0";
const LIME = "#c1df6b";
const AMBER = "#f0a12a";
const HONEY = "#f6c65a";
const ROSE = "#d9476f";
const GARNET = "#a01f48";
const PLUM = "#63307f";
const COBALT = "#2748b8";
const SKY = "#4f86e0";
const OPAL = "#f4efdf";
const PEARL = "#f1d2d8";

const LEAD = "#22202a";
const LEAD_RIB = "#3a3947";
const RIM = "#2f2d3b";
const SOLDER = "#4a4955";
const BRONZE = "#a8763a";
const BRONZE_LT = "#d3a55c";
const BRONZE_DK = "#5f3f20";
const VERD = "#4f9c86";
const VERD_DK = "#2f6f60";
const EYE_GLASS = "#0f7a58";
const GLINT = "#fff6dc";

type P2 = [number, number];
const f1 = (n: number) => n.toFixed(1);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A colour moved toward white (t > 0) or black (t < 0). */
const shade = (hex: string, t: number) =>
  `#${new THREE.Color(hex).lerp(new THREE.Color(t > 0 ? "#ffffff" : "#000000"), Math.abs(t)).getHexString()}`;

// ---------------------------------------------------------------------------------------------------------------
// Wing art. Coordinates are meters in the wing's own plane: u runs forward, v runs outward from the hinge (left wing).

interface WingSpec {
  seed: number;
  /** Outline control points, drawn through a closed catmull; a third element "sharp" keeps a corner pointed. */
  ctrl: Array<P2 | [number, number, "sharp"]>;
  /** Where the veins radiate from: the centre of the roundel eyespot. */
  hub: P2;
  /** Vein directions in degrees around the hub, ascending; the last pane wraps to the first vein + 360. */
  angles: number[];
  /** Ring boundaries as shares of the way from hub to margin; the last is 1. */
  rings: number[];
  /** Vein numbers that get a raised lead rib. */
  ribs: number[];
  /** Sectors whose centre direction falls in this range (degrees) belong to the costal margin. */
  costal: [number, number];
  /** Roundel half axes in meters: across the wing (u) and along it (v). */
  eye: [number, number];
  /** Whiplash sway of the veins, share of their length, and how many S waves they carry. */
  sway: number;
  waves: number;
  /** A bronze whiplash tendril that continues a wing tip into a scroll: the tip, its heading, the side it curls to, its radius. */
  tendril: { tip: P2; dir: P2; toward: P2; r: number };
}

const FOREWING: WingSpec = {
  seed: 31,
  ctrl: [
    [0.015, -0.005],
    [0.03, 0.06],
    [0.034, 0.13],
    [0.02, 0.2],
    [-0.006, 0.25],
    [-0.04, 0.285],
    [-0.085, 0.298, "sharp"],
    [-0.11, 0.265],
    [-0.13, 0.22],
    [-0.145, 0.17],
    [-0.148, 0.115],
    [-0.13, 0.06],
    [-0.1, 0.02],
    [-0.07, 0.0],
    [-0.045, -0.008],
  ],
  hub: [-0.058, 0.135],
  angles: [-55, -22, 8, 38, 62, 82, 99, 116, 138, 165, 195, 228, 252, 268],
  rings: [0.22, 0.4, 0.57, 0.73, 0.86, 1],
  ribs: [1, 4, 7, 10, 12],
  costal: [-45, 96],
  eye: [0.02, 0.025],
  sway: 0.075,
  waves: 1.5,
  tendril: { tip: [-0.092, 0.298], dir: [-0.35, 0.94], toward: [-1, 0], r: 0.011 },
};

const HINDWING: WingSpec = {
  seed: 47,
  ctrl: [
    [0.03, -0.005],
    [0.04, 0.07],
    [0.028, 0.14],
    [-0.005, 0.195],
    [-0.06, 0.228],
    [-0.115, 0.238],
    [-0.17, 0.228],
    [-0.215, 0.215],
    [-0.255, 0.208],
    [-0.295, 0.203],
    [-0.33, 0.196, "sharp"],
    [-0.305, 0.17],
    [-0.265, 0.148],
    [-0.215, 0.128],
    [-0.165, 0.103],
    [-0.125, 0.068],
    [-0.09, 0.03],
    [-0.06, -0.008],
  ],
  hub: [-0.09, 0.115],
  angles: [-40, -10, 15, 40, 62, 84, 104, 122, 140, 156, 172, 195, 235, 270, 300],
  rings: [0.2, 0.38, 0.55, 0.71, 0.85, 1],
  ribs: [1, 4, 7, 9, 11],
  costal: [-50, 55],
  eye: [0.021, 0.026],
  sway: 0.06,
  waves: 1.25,
  tendril: { tip: [-0.33, 0.196], dir: [-1, 0.15], toward: [0, 1], r: 0.014 },
};

interface Pane {
  pts: P2[];
  base: string;
  opal: boolean;
  grad: [P2, P2];
  glint: [P2, P2];
  centre: P2;
  area: number;
  margin: boolean;
  i: number;
  j: number;
}

/** One wing's outline in meters and the grid of glass panes drawn inside it. */
interface WingArt {
  outline: P2[];
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
  /** A point on the whiplash grid: vein number, share of the way out, and optionally that vein's reach. */
  at(x: number, b: number, r?: number): P2;
  reachAt(x: number): number;
  /** The drawing as SVG; `flip` mirrors it left to right. */
  draw(flip: boolean): string;
}

/** Everything about one wing's drawing that doesn't depend on which way it is mirrored. */
function makeWing(spec: WingSpec): WingArt {
  const rand = rng(spec.seed);
  // A "sharp" corner becomes three close points, so the catmull turns tightly there instead of rounding it off.
  const knots: V3[] = spec.ctrl.flatMap(([u, v, sharp], k, all) => {
    if (!sharp) return [[u, v, 0] as V3];
    const near = (o: number): V3 => {
      const [pu, pv] = all[(k + o + all.length) % all.length];
      const d = Math.hypot(pu - u, pv - v);
      return [u + ((pu - u) / d) * 0.012, v + ((pv - v) / d) * 0.012, 0];
    };
    return [near(-1), [u, v, 0] as V3, near(1)];
  });
  const path = catmull(knots, { closed: true });
  const COUNT = 130;
  const outline: P2[] = Array.from({ length: COUNT }, (_, k) => {
    const p = path.at(k / COUNT);
    return [p.x, p.y];
  });
  const PAD = 0.003;
  const uMin = Math.min(...outline.map((p) => p[0])) - PAD;
  const uMax = Math.max(...outline.map((p) => p[0])) + PAD;
  const vMin = Math.min(...outline.map((p) => p[1])) - PAD;
  const vMax = Math.max(...outline.map((p) => p[1])) + PAD;
  const [hu, hv] = spec.hub;
  const N = spec.angles.length;
  const J = spec.rings.length;

  /** Distance from the hub to the outline along a direction. */
  const reach = (phi: number) => {
    const dx = Math.cos(phi);
    const dy = Math.sin(phi);
    let best = 0;
    for (let k = 0; k < outline.length; k++) {
      const [ax, ay] = outline[k];
      const [bx, by] = outline[(k + 1) % outline.length];
      const ex = bx - ax;
      const ey = by - ay;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = ((ax - hu) * ey - (ay - hv) * ex) / den;
      const s = ((ax - hu) * dy - (ay - hv) * dx) / den;
      if (t > 0 && s >= 0 && s <= 1) best = Math.max(best, t);
    }
    return best;
  };
  /** Vein direction at the continuous vein number x (0..N, wrapping). */
  const angle = (x: number) => {
    const i = Math.floor(x) % N;
    const f = x - Math.floor(x);
    const a0 = spec.angles[i];
    let a1 = spec.angles[(i + 1) % N];
    if (i === N - 1) a1 += 360;
    return ((a0 + (a1 - a0) * f) * Math.PI) / 180;
  };
  const reachAt = (x: number) => reach(angle(x));
  const wrap = (x: number) => (2 * Math.PI * x) / N;
  /** A point on the whiplash grid: vein number x, share b of the way out. */
  const at = (x: number, b: number, r = reachAt(x)): P2 => {
    const phi = angle(x);
    const phase = 0.6 + 1.7 * Math.sin(wrap(x) * 2 + 0.4) + 0.9 * Math.sin(wrap(x) * 3 + 1.1);
    const sway = spec.sway * r * Math.sin(Math.PI * b) * Math.sin(2 * Math.PI * spec.waves * b + phase);
    return [hu + Math.cos(phi) * b * r - Math.sin(phi) * sway, hv + Math.sin(phi) * b * r + Math.cos(phi) * sway];
  };
  const level = (j: number, x: number) => {
    if (j < 0) return 0;
    if (j >= J - 1) return 1;
    return spec.rings[j] + 0.03 * Math.sin(wrap(x) * 2 + j * 2.1) + 0.02 * Math.sin(wrap(x) * 5 + j * 1.3);
  };
  const cross = (x0: number, x1: number, j: number, m: number) =>
    Array.from({ length: m + 1 }, (_, k) => {
      const x = x0 + ((x1 - x0) * k) / m;
      return at(x, level(j, x));
    });
  const vein = (x: number, b0: number, b1: number, m: number) => {
    const r = reachAt(x);
    return Array.from({ length: m + 1 }, (_, k) => at(x, b0 + ((b1 - b0) * k) / m, r));
  };

  // Panes, coloured by ring and position.
  const panes: Pane[] = [];
  const prev: string[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < J; j++) {
      const pts = [
        ...cross(i, i + 1, j - 1, 5),
        ...vein(i + 1, level(j - 1, i + 1), level(j, i + 1), 5).slice(1),
        ...cross(i + 1, i, j, 5).slice(1),
        ...vein(i, level(j, i), level(j - 1, i), 5).slice(1, -1),
      ];
      let phi = (angle(i + 0.5) * 180) / Math.PI;
      phi = ((((phi + 180) % 360) + 360) % 360) - 180;
      const costal = phi >= spec.costal[0] && phi <= spec.costal[1];
      const outer = j === J - 1;
      const band = j === J - 2;
      let base: string;
      const r = rand();
      if (outer) base = costal ? [GARNET, AMBER, PLUM, HONEY][(i + (i >> 2)) % 4] : i % 2 ? ROSE : AMBER;
      else if (band) base = costal ? (i % 2 ? PLUM : ROSE) : r < 0.16 ? COBALT : r < 0.24 ? SKY : EMERALD;
      else if (j === 0) base = i % 2 ? HONEY : AMBER;
      else {
        const pool = [JADE, EMERALD, CELADON, SEAFOAM, JADE, LIME, CELADON, OPAL, COBALT, ROSE];
        base = pool[Math.floor(r * (j === 1 ? 8 : pool.length))];
        if (base === prev[j]) base = pool[Math.floor(rand() * 7)];
        if (base === prev[j]) base = JADE;
      }
      prev[j] = base;
      let cx = 0;
      let cy = 0;
      let area = 0;
      for (const [x, y] of pts) {
        cx += x;
        cy += y;
      }
      cx /= pts.length;
      cy /= pts.length;
      for (let k = 0; k < pts.length; k++) {
        const [x0, y0] = pts[k];
        const [x1, y1] = pts[(k + 1) % pts.length];
        area += x0 * y1 - x1 * y0;
      }
      const dir = rand() * Math.PI * 2;
      const size = Math.sqrt(Math.abs(area) / 2);
      const q = (k: number): P2 => [cx + Math.cos(dir + k) * size * 0.5, cy + Math.sin(dir + k) * size * 0.5];
      const g0 = pts[Math.floor(rand() * pts.length)];
      const g1 = pts[Math.floor(rand() * pts.length)];
      panes.push({
        pts,
        base,
        opal: base === OPAL,
        grad: [q(0), q(Math.PI)],
        glint: [
          [cx + (g0[0] - cx) * 0.55, cy + (g0[1] - cy) * 0.55],
          [cx + (g1[0] - cx) * 0.4, cy + (g1[1] - cy) * 0.4],
        ],
        centre: [cx, cy],
        area: Math.abs(area) / 2,
        margin: outer,
        i,
        j,
      });
    }
  }

  /** The drawing as SVG, in millimetres; `flip` mirrors it left to right (the underside, or the right wing). */
  const draw = (flip: boolean) => {
    const W = (uMax - uMin) * 1000;
    const H = (vMax - vMin) * 1000;
    const X = (u: number) => (flip ? (uMax - u) * 1000 : (u - uMin) * 1000);
    const Y = (v: number) => (vMax - v) * 1000;
    const pt = (p: P2) => `${f1(X(p[0]))} ${f1(Y(p[1]))}`;
    const poly = (pts: P2[], close = true) => `M${pts.map(pt).join("L")}${close ? "Z" : ""}`;
    const defs: string[] = [];
    const body: string[] = [];

    // Glass panes.
    panes.forEach((pane, k) => {
      const lo = shade(pane.base, pane.opal ? 0.0 : 0.3);
      const hi = pane.opal ? PEARL : shade(pane.base, -0.16);
      const [a, b] = pane.grad;
      defs.push(
        `<linearGradient id="g${k}" gradientUnits="userSpaceOnUse" x1="${f1(X(a[0]))}" y1="${f1(Y(a[1]))}" x2="${f1(X(b[0]))}" y2="${f1(Y(b[1]))}"><stop offset="0" stop-color="${lo}"/><stop offset="1" stop-color="${hi}"/></linearGradient>`,
      );
      body.push(`<path d="${poly(pane.pts)}" fill="url(#g${k})"/>`);
      const [g0, g1] = pane.glint;
      body.push(
        `<path d="M${pt(g0)}Q${pt(pane.centre)} ${pt(g1)}" fill="none" stroke="#ffffff" stroke-opacity="${pane.opal ? 0.5 : 0.3}" stroke-width="1.6" stroke-linecap="round"/>`,
      );
      if (pane.opal) {
        const streak = (t: number, c: string) => {
          const p0: P2 = [
            pane.centre[0] + (pane.pts[1][0] - pane.centre[0]) * t,
            pane.centre[1] + (pane.pts[1][1] - pane.centre[1]) * t,
          ];
          const p1: P2 = [
            pane.centre[0] + (pane.pts[7][0] - pane.centre[0]) * t,
            pane.centre[1] + (pane.pts[7][1] - pane.centre[1]) * t,
          ];
          return `<path d="M${pt(p0)}Q${pt(pane.centre)} ${pt(p1)}" fill="none" stroke="${c}" stroke-opacity="0.55" stroke-width="4.5" stroke-linecap="round"/>`;
        };
        body.push(streak(0.6, SEAFOAM), streak(0.3, ROSE));
      }
    });

    // Lead came: veins, rings, then a thin sheen on top.
    const lead: string[] = [];
    const sheen: string[] = [];
    const line = (pts: P2[], w: number) => {
      lead.push(`<path d="${poly(pts, false)}" stroke-width="${w}"/>`);
      sheen.push(`<path d="${poly(pts, false)}" stroke-width="${f1(w * 0.22)}"/>`);
    };
    for (let i = 0; i < N; i++) line(vein(i, 0, 1, 26), spec.ribs.includes(i) ? 4.4 : 3.1);
    for (let j = 0; j < J - 1; j++) line(cross(0, N, j, N * 4), j === J - 2 ? 4.2 : 3.1);
    body.push(`<g fill="none" stroke="${LEAD}" stroke-linecap="round" stroke-linejoin="round">${lead.join("")}</g>`);
    body.push(
      `<g fill="none" stroke="#9a99ab" stroke-opacity="0.55" stroke-linecap="round" stroke-linejoin="round" transform="translate(-0.7 -0.7)">${sheen.join("")}</g>`,
    );
    // Solder blobs at the joints.
    const blobs: string[] = [];
    for (let i = 0; i < N; i++)
      for (let j = 0; j < J - 1; j++) {
        const p = at(i, level(j, i));
        blobs.push(`<circle cx="${f1(X(p[0]))}" cy="${f1(Y(p[1]))}" r="${j === J - 2 ? 3.2 : 2.5}"/>`);
      }
    body.push(`<g fill="${SOLDER}" stroke="${LEAD}" stroke-width="0.9">${blobs.join("")}</g>`);

    // Cabochon jewels in the margin panes.
    let jk = 0;
    for (const pane of panes) {
      if (!pane.margin || pane.i % 2 !== 0) continue;
      const r = clamp(0.3 * Math.sqrt(pane.area) * 1000, 3.5, 8.5);
      const colour = [COBALT, ROSE, OPAL, SKY, GARNET][jk++ % 5];
      defs.push(
        `<radialGradient id="j${jk}" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="${shade(colour, 0.55)}"/><stop offset="0.5" stop-color="${colour}"/><stop offset="1" stop-color="${shade(colour, -0.3)}"/></radialGradient>`,
      );
      const cx = X(pane.centre[0]);
      const cy = Y(pane.centre[1]);
      body.push(
        `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r + 1.6)}" fill="${LEAD}"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="url(#j${jk})"/><circle cx="${f1(cx - r * 0.3)}" cy="${f1(cy - r * 0.35)}" r="${f1(r * 0.24)}" fill="#ffffff" fill-opacity="0.75"/>`,
      );
    }

    // The roundel eyespot at the hub: a rose window of petals round amber, cobalt and pearl glass.
    {
      const cx = X(hu);
      const cy = Y(hv);
      const rx = spec.eye[0] * 1000;
      const ry = spec.eye[1] * 1000;
      const ell = (s: number, fill: string, extra = "") =>
        `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx * s)}" ry="${f1(ry * s)}" fill="${fill}" ${extra}/>`;
      const ringPt = (s: number, th: number) => `${f1(cx + Math.cos(th) * rx * s)} ${f1(cy + Math.sin(th) * ry * s)}`;
      const petals = 14;
      const petal: string[] = [];
      for (let k = 0; k < petals; k++) {
        const t0 = (k / petals) * Math.PI * 2;
        const t1 = ((k + 1) / petals) * Math.PI * 2;
        const tm = (t0 + t1) / 2;
        petal.push(
          `<path d="M${ringPt(1.1, t0)}L${ringPt(1.5, t0)}Q${ringPt(1.68, tm)} ${ringPt(1.5, t1)}L${ringPt(1.1, t1)}Z" fill="${k % 2 ? ROSE : HONEY}" stroke="${LEAD}" stroke-width="2.4" stroke-linejoin="round"/>`,
        );
      }
      defs.push(
        `<radialGradient id="ea"><stop offset="0.6" stop-color="${shade(AMBER, 0.35)}"/><stop offset="1" stop-color="${AMBER}"/></radialGradient>`,
        `<radialGradient id="ec" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="${SKY}"/><stop offset="0.6" stop-color="${COBALT}"/><stop offset="1" stop-color="${shade(COBALT, -0.35)}"/></radialGradient>`,
        `<radialGradient id="ep" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.7" stop-color="${OPAL}"/><stop offset="1" stop-color="${PEARL}"/></radialGradient>`,
      );
      body.push(
        ell(1.72, LEAD),
        petal.join(""),
        ell(1.1, "url(#ea)", `stroke="${LEAD}" stroke-width="3.4"`),
        ell(0.8, "url(#ec)", `stroke="${LEAD}" stroke-width="3"`),
        ell(0.5, "url(#ep)", `stroke="${LEAD}" stroke-width="2.6"`),
        `<path d="M${ringPt(0.42, Math.PI * 1.05)}Q${ringPt(0.05, Math.PI * 1.4)} ${ringPt(0.42, Math.PI * 1.95)}Q${ringPt(0.15, Math.PI * 1.5)} ${ringPt(0.42, Math.PI * 1.05)}Z" fill="${PLUM}" stroke="${LEAD}" stroke-width="1.2"/>`,
        `<ellipse cx="${f1(cx - rx * 0.22)}" cy="${f1(cy - ry * 0.3)}" rx="${f1(rx * 0.16)}" ry="${f1(ry * 0.1)}" fill="#ffffff" fill-opacity="0.85"/>`,
        `<ellipse cx="${f1(cx - rx * 0.55)}" cy="${f1(cy - ry * 0.5)}" rx="${f1(rx * 0.12)}" ry="${f1(ry * 0.07)}" fill="#ffffff" fill-opacity="0.55" transform="rotate(-30 ${f1(cx - rx * 0.55)} ${f1(cy - ry * 0.5)})"/>`,
      );
    }

    const rim = poly(outline);
    return `<svg viewBox="0 0 ${f1(W)} ${f1(H)}" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="wing"><path d="${rim}"/></clipPath>${defs.join("")}</defs>
      <g clip-path="url(#wing)">${body.join("")}
        <path d="${rim}" fill="none" stroke="${LEAD}" stroke-width="11" stroke-linejoin="round"/>
        <path d="${rim}" fill="none" stroke="#9a99ab" stroke-opacity="0.45" stroke-width="1.2" stroke-linejoin="round" transform="translate(${flip ? 5.2 : -5.2} 5.2) scale(1)"/>
      </g></svg>`;
  };

  return { outline, uMin, uMax, vMin, vMax, at, reachAt, draw };
}

// ---------------------------------------------------------------------------------------------------------------
// Bronze textures for the fur and the antenna barbs.
const PLUME = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 48 C5 38 7 16 16 1 C25 16 27 38 16 48Z" fill="${BRONZE_LT}" stroke="${BRONZE_DK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M16 45 C14 32 14 18 16 7" fill="none" stroke="${BRONZE_DK}" stroke-width="2" stroke-linecap="round"/>
    <path d="M16 36 C12 33 9 29 8 24 M16 36 C20 33 23 29 24 24 M16 25 C13 22 11 19 11 15 M16 25 C19 22 21 19 21 15" fill="none" stroke="${VERD_DK}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M16 1 C21 9 22 15 20 20 C17 14 16 8 16 1Z" fill="${VERD}" stroke="${BRONZE_DK}" stroke-width="1.2"/>
  </svg>`,
  { size: 128 },
);

const BARBS = svg(
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 48 C21 34 12 20 3 5 C13 22 20 36 27 48Z" fill="${BRONZE_LT}" stroke="${BRONZE_DK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M24 48 C27 34 36 20 45 5 C35 22 28 36 21 48Z" fill="${BRONZE_LT}" stroke="${BRONZE_DK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M24 48 C23 36 20 24 16 10 C22 24 26 36 28 48Z" fill="${VERD}" stroke="${BRONZE_DK}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M24 48 C25 36 28 24 32 10 C26 24 22 36 20 48Z" fill="${VERD}" stroke="${BRONZE_DK}" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "stainedGlassMoth" });

  /** Height of the body axis above the floor; the legs carry the moth on it. */
  const Y0 = 0.088;

  // Skeleton: thorax root, abdomen chain, head, wings, antennae, legs.
  const thorax = b.joint("thorax", { at: [0, Y0, 0.015], dir: [0, 0, 1], group: "body" });
  const head = b.joint("head", {
    parent: thorax,
    at: [0, Y0 + 0.004, 0.07],
    aim: [0, Y0 + 0.008, 0.12],
    role: "head",
    group: "head",
  });
  const abdPts: V3[] = [
    [0, Y0, -0.025],
    [0, Y0 - 0.002, -0.09],
    [0, Y0 - 0.006, -0.16],
    [0, Y0 - 0.012, -0.245],
  ];
  const abdomen = b.chain("abdomen", catmull(abdPts), { parent: thorax, count: 5, role: "tail", group: "body" });

  // Body: one skinned tube from the neck to the abdomen tip, painted bronze with verdigris in the recesses.
  const patina = paint((p, n) => {
    const wob = noise(p, 0.045, 3);
    const fleck = noise(p, 0.012, 9);
    const low = smoothstep(0.1, -0.7, n.y);
    const green = smoothstep(0.5, 0.78, wob * 0.72 + fleck * 0.28 + low * 0.35);
    const f = (-p.z - 0.025) / 0.044;
    const groove = p.z < -0.02 ? 1 - smoothstep(0.03, 0.15, Math.abs(f - Math.round(f))) : 0;
    const metal = mix(
      mix(BRONZE_DK, BRONZE, smoothstep(0.2, 0.75, wob + fleck * 0.25)),
      BRONZE_LT,
      smoothstep(0.62, 0.95, fleck) * 0.5,
    );
    return mix(mix(metal, mix(VERD, VERD_DK, fleck), green), BRONZE_DK, groove * 0.75);
  });
  const bodyPath = catmull([[0, Y0 + 0.006, 0.08] as V3, [0, Y0 + 0.004, 0.02] as V3, ...abdPts]);
  const bodyTube = b.sweep(bodyPath, [0.021, 0.036, 0.042, 0.038, 0.031, 0.029, 0.026, 0.021, 0.015, 0.007], {
    bone: [abdomen, thorax],
    color: patina,
    sides: 10,
    group: "body",
    name: "body",
  });
  const skin = b.surface(bodyTube);

  // Collar hoops on the abdomen joints.
  abdomen.joints.forEach((joint, k) => {
    const radius = bodyTube.at(bodyPath.closestT(joint.at)).radius;
    b.part(new THREE.TorusGeometry(radius + 0.0012, k === 0 ? 0.0034 : 0.0026, 4, 10), k % 2 ? BRONZE_LT : BRONZE, {
      bone: joint,
      at: joint.at,
      dir: joint.dir([0, 1, 0]),
      axis: "z",
      group: "body",
      name: "hoop",
    });
  });

  // Filigree: whiplash curls projected onto the thorax and abdomen backs.
  const wire = (pts: P2[], bone: JointRef, radius = 0.0022, color = BRONZE_LT) => {
    const hits = pts.map(([x, z]) => skin.ray([x, Y0 + 0.4, z], [0, -1, 0]));
    const line = hits.flatMap((h) => (h ? [h.at.clone().addScaledVector(h.n, 0.0006)] : []));
    if (line.length < 3) return;
    b.sweep(catmull(line), [radius, radius * 0.8], {
      bone,
      color,
      sides: 5,
      detail: 0.45,
      group: "body",
      name: "filigree",
    });
  };
  for (const s of [1, -1]) {
    wire(
      [
        [0, 0.07],
        [s * 0.01, 0.058],
        [s * 0.022, 0.046],
        [s * 0.034, 0.034],
        [s * 0.038, 0.02],
        [s * 0.03, 0.01],
        [s * 0.02, 0.012],
        [s * 0.018, 0.022],
        [s * 0.026, 0.027],
        [s * 0.029, 0.021],
      ],
      thorax,
    );
    wire(
      [
        [0, 0.006],
        [s * 0.012, -0.002],
        [s * 0.024, -0.012],
        [s * 0.03, -0.024],
        [s * 0.024, -0.034],
        [s * 0.014, -0.03],
        [s * 0.014, -0.022],
        [s * 0.021, -0.022],
      ],
      thorax,
      0.002,
      BRONZE,
    );
    // Abdomen: a lyre curl on every segment, riding that segment's bone.
    abdomen.joints.forEach((joint, k) => {
      if (k === 0 || k > 4) return;
      const z = -0.025 - 0.044 * k - 0.022;
      const r = 0.017 - k * 0.002;
      const scroll = spiral([s * (r + 0.004), Y0, z], [s * 0.003, Y0, z], [0, 1, 0], { turns: s * -1.1, r1: r * 0.3 });
      wire(
        Array.from({ length: 12 }, (_, m) => {
          const p = scroll.at(m / 11);
          return [p.x, p.z] as P2;
        }),
        joint,
        0.0018,
        k % 2 ? BRONZE_LT : VERD,
      );
    });
  }

  // A cobalt glass jewel in a bezel on the thorax.
  {
    const crown = skin.ray([0, Y0 + 0.4, 0.028], [0, -1, 0]);
    if (crown) {
      b.stick(new THREE.SphereGeometry(0.0105, 8, 5), COBALT, crown, {
        embed: 0.45,
        bone: thorax,
        scale: [1, 0.7, 1.15],
      });
      b.part(new THREE.TorusGeometry(0.0115, 0.0028, 5, 12), BRONZE_LT, {
        bone: thorax,
        at: crown.at.clone().addScaledVector(crown.n, 0.0018),
        dir: crown.n,
        axis: "z",
        name: "bezel",
      });
    }
  }

  // Fuzz: bronze plume-cards over the thorax and the front of the abdomen.
  const fuzzTint = paint((p) => mix("#ffffff", "#b9e2cf", smoothstep(0.55, 0.8, noise(p, 0.05, 7))));
  const fuzz = (
    count: number,
    minDist: number,
    size: [number, number],
    seed: number,
    filter: (h: THREE.Vector3) => boolean,
  ) =>
    b.cards(skin.scatter(count, { rng: rng(seed), minDist, filter: (h) => filter(h.at) && h.n.y > -0.35 }), PLUME, {
      size,
      lean: 62,
      bend: 20,
      vary: 0.3,
      spin: 25,
      rng: rng(seed + 1),
      color: fuzzTint,
      name: "fur",
      group: "body",
    });
  fuzz(190, 0.011, [0.02, 0.036], 5, (p) => p.z > -0.045);
  fuzz(80, 0.022, [0.022, 0.034], 9, (p) => p.z <= -0.045 && p.z > -0.16);

  // Head: bronze skull, jade glass compound eyes in bezels, a cobalt brow jewel, a coiled proboscis, crest curls.
  b.part(new THREE.SphereGeometry(0.027, 9, 7), mottle(BRONZE_DK, VERD_DK, { size: 0.02, seed: 4 }), {
    bone: head,
    at: [0, Y0 + 0.008, 0.092],
    name: "skull",
    group: "head",
  });
  for (const s of [1, -1]) {
    const eyeAt = new THREE.Vector3(s * 0.02, Y0 + 0.012, 0.1);
    const gaze = new THREE.Vector3(s * 0.8, 0.25, 0.55);
    b.part(new THREE.SphereGeometry(0.0155, 8, 6), EYE_GLASS, {
      bone: head,
      at: eyeAt,
      dir: gaze,
      name: "eye",
      group: "head",
    });
    b.part(new THREE.TorusGeometry(0.0142, 0.0026, 5, 12), BRONZE_LT, {
      bone: head,
      at: eyeAt.clone().addScaledVector(gaze.clone().normalize(), 0.0016),
      dir: gaze,
      axis: "z",
      name: "eyeBezel",
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.0038, 5, 4), GLINT, {
      bone: head,
      at: eyeAt.clone().add(new THREE.Vector3(s * 0.006, 0.008, 0.009)),
      name: "glint",
      group: "head",
    });
    // Crest curl sweeping back over the head from between the antennae.
    b.sweep(
      catmull([
        [s * 0.01, Y0 + 0.033, 0.098],
        [s * 0.02, Y0 + 0.05, 0.088],
        [s * 0.034, Y0 + 0.054, 0.068],
        [s * 0.04, Y0 + 0.042, 0.054],
        [s * 0.033, Y0 + 0.034, 0.058],
      ] as V3[]),
      [0.0022, 0.0012],
      { bone: head, color: BRONZE_LT, sides: 5, detail: 0.5, name: "crest", group: "head" },
    );
  }
  b.part(new THREE.SphereGeometry(0.0072, 6, 4), COBALT, {
    bone: head,
    at: [0, Y0 + 0.024, 0.112],
    name: "browJewel",
    group: "head",
  });
  b.sweep(
    spiral([0, Y0 - 0.02, 0.116], [0, Y0 - 0.008, 0.118], [1, 0, 0], { turns: 1.3, r1: 0.004 }),
    [0.0026, 0.001],
    { bone: head, color: BRONZE, sides: 5, detail: 0.45, name: "proboscis", group: "head" },
  );

  // Antennae: a bronze stem on a four-bone chain, combed with bipectinate barb-cards.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stem = b.chain(
      `antenna${side}`,
      catmull([
        [s * 0.014, Y0 + 0.03, 0.095],
        [s * 0.04, Y0 + 0.06, 0.135],
        [s * 0.082, Y0 + 0.07, 0.18],
        [s * 0.125, Y0 + 0.058, 0.215],
      ] as V3[]),
      { parent: head, count: 4, role: "tentacle", group: "head" },
    );
    const tube = b.sweep(stem, [0.0028, 0.0012], { color: BRONZE, sides: 5, name: "antenna", group: "head" });
    const rows: [number, number, [number, number]][] = [
      [5, 0.08, [0.045, 0.034]],
      [5, 0.42, [0.038, 0.029]],
      [5, 0.72, [0.026, 0.02]],
    ];
    for (const [count, from, size] of rows) {
      const ts = Array.from({ length: count }, (_, k) => from + (k / count) * 0.3);
      const stations = ts.map((t) => tube.at(t, 0));
      b.cards(stations, BARBS, {
        size,
        lean: 90,
        flow: (_f, i) => stations[i].tangent,
        cross: true,
        sink: 0.05,
        name: "barbs",
        group: "head",
      });
    }
  }

  // Legs: three pairs, femur up and out, tibia down, tarsus to the floor.
  const legs: [string, number, [number, number]][] = [
    ["F", 0.04, [0.08, 0.09]],
    ["M", 0.015, [0.098, 0.03]],
    ["H", -0.012, [0.082, -0.06]],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [tag, z, [fx, fz]] of legs) {
      const pts = limb(
        [s * 0.02, Y0 - 0.037, z],
        [s * fx, 0.0034, fz],
        [0.04, 0.055, 0.036],
        [
          [s * 0.3, 1, 0],
          [s, -0.3, 0],
        ],
      );
      const leg = b.chain(`leg${tag}${side}`, pts, {
        parent: thorax,
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`],
        role: "leg",
        contact: [s * fx, 0, fz],
        group: "legs",
      });
      b.sweep(leg, [0.0055, 0.0024], {
        bands: [
          [0.4, BRONZE],
          [0.78, VERD_DK],
          [1, BRONZE_DK],
        ],
        sides: 6,
        name: "leg",
        group: "legs",
      });
    }
  }

  // Wings: hinge joint, lead-rimmed extruded slab, glass decals top and bottom, raised lead ribs.
  const art = { fore: makeWing(FOREWING), hind: makeWing(HINDWING) };
  const glass = {
    fore: [svg(art.fore.draw(false), { size: 1400 }), svg(art.fore.draw(true), { size: 1400 })],
    hind: [svg(art.hind.draw(false), { size: 1400 }), svg(art.hind.draw(true), { size: 1400 })],
  };
  const THICK = 0.0055;
  const DECAL = THICK / 2 + 0.0012;
  const wing = (
    tag: string,
    spec: WingSpec,
    wingArt: WingArt,
    textures: THREE.Texture[],
    s: number,
    O: THREE.Vector3,
    tiltDeg: number,
  ) => {
    const side = s > 0 ? "L" : "R";
    const t = (tiltDeg * Math.PI) / 180;
    const V = new THREE.Vector3(s * Math.cos(t), Math.sin(t), 0);
    const N = new THREE.Vector3(-s * Math.sin(t), Math.cos(t), 0);
    const world = (u: number, v: number, h = 0) =>
      O.clone()
        .add(new THREE.Vector3(0, 0, u))
        .addScaledVector(V, v)
        .addScaledVector(N, h);
    const hinge = b.joint(`${tag}${side}`, { parent: thorax, at: O, dir: V, role: "wing", group: `wing${side}` });
    const group = `wing${side}`;

    b.extrude(
      wingArt.outline.map(([u, v]) => [s * u, v] as [number, number]),
      {
        at: O,
        x: [0, 0, s],
        y: V,
        thickness: THICK,
        bevel: 0.0014,
        detail: 0.34,
        color: RIM,
        bone: hinge,
        group,
        name: `${tag}Came`,
      },
    );

    const W = wingArt.uMax - wingArt.uMin;
    const H = wingArt.vMax - wingArt.vMin;
    const centre = world((wingArt.uMin + wingArt.uMax) / 2, (wingArt.vMin + wingArt.vMax) / 2);
    // The top decal reads the drawing left to right along the wing's forward axis; the bottom decal is its mirror.
    const top = textures[s < 0 ? 1 : 0];
    const bottom = textures[s < 0 ? 0 : 1];
    b.part(new THREE.PlaneGeometry(W, H), "#ffffff", {
      texture: top,
      bone: hinge,
      at: centre.clone().addScaledVector(N, DECAL),
      dir: N,
      up: V,
      axis: "z",
      group,
      name: `${tag}GlassTop`,
    });
    b.part(new THREE.PlaneGeometry(W, H), "#ffffff", {
      texture: bottom,
      bone: hinge,
      at: centre.clone().addScaledVector(N, -DECAL),
      dir: N.clone().negate(),
      up: V,
      axis: "z",
      group,
      name: `${tag}GlassBottom`,
    });

    // Raised lead ribs over the main veins.
    for (const i of spec.ribs) {
      const r = wingArt.reachAt(i);
      const pts = Array.from({ length: 15 }, (_, k) => {
        const [u, v] = wingArt.at(i, 0.13 + (0.86 * k) / 14, r);
        return world(u, v, DECAL + 0.0012);
      });
      b.sweep(catmull(pts), [0.0019, 0.0013], { bone: hinge, color: LEAD_RIB, sides: 5, group, name: `${tag}Rib` });
    }

    // Bronze whiplash tendril: the wing tip runs on into a scroll in the wing's plane.
    {
      const { tip, dir, toward, r } = spec.tendril;
      const from = world(tip[0], tip[1]);
      const heading = world(dir[0], dir[1]).sub(world(0, 0)).normalize();
      const towardW = world(toward[0], toward[1]).sub(world(0, 0));
      const perp = N.clone().cross(heading);
      if (perp.dot(towardW) < 0) perp.negate();
      const centre = from.clone().addScaledVector(perp, r);
      const axis = N.clone();
      if (axis.clone().cross(from.clone().sub(centre)).dot(heading) < 0) axis.negate();
      b.sweep(spiral(centre, from, axis, { turns: 1.05, r1: r * 0.3 }), [0.0024, 0.0012], {
        bone: hinge,
        color: BRONZE_LT,
        sides: 5,
        detail: 0.6,
        group,
        name: `${tag}Tendril`,
      });
    }
  };
  for (const s of [1, -1]) {
    wing("forewing", FOREWING, art.fore, glass.fore, s, new THREE.Vector3(s * 0.012, Y0 + 0.008, 0.035), 10);
    wing("hindwing", HINDWING, art.hind, glass.hind, s, new THREE.Vector3(s * 0.012, Y0 - 0.004, -0.06), 6);
  }

  return b.root;
}
