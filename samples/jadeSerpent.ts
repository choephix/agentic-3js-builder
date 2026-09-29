// Jade feathered serpent, carved Mesoamerican greenstone. A ~3 m serpent coiled in a beehive spiral with its neck
// reared up, a three-row feather ruff on group joints around the head, an open fanged mouth (upper and lower jaw on
// separate joints, forked cinnabar tongue) and a rattle of six jade beads on the tail tip.
// Style: everything is stone. The body is one faceted (8-sided) tube whose paint is layered translucent-looking
// jade (four green strata, pale veins, a lit-from-above glow) with the carving painted into it from the tube's own
// coordinates: a dorsal band of stepped-fret scrolls between incised frame lines with turquoise and shell inlays,
// feather-scale scallops on the flanks, transverse plates on the pale belly, turquoise mosaic rings on the thin tail
// and mosaic bands round the body. Every groove is drawn with a lit rim on one edge and a shaded rim on the other so
// it reads as cut relief. The ruff feathers are bevelled jade plaques extruded from an outline, carved with a rachis,
// barbs and a border, with turquoise (or shell and obsidian) mosaic tips. Eyes (obsidian, turquoise, shell), the
// pectoral and the ear spools are svg() drawings; teeth are shell, the palate and tongue cinnabar, and jade feather
// cards stand as a mane along the neck.
import { CircleGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { cells, mix, noise, paint, rgb, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { catmull, polyline, spiral } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Jade Feathered Serpent",
  description:
    "Carved Mesoamerican jade serpent coiled in a spiral and reared up: stepped-fret and feather-scale relief, turquoise mosaic and shell inlay, a three-row plumed ruff on joints, a fanged open mouth with obsidian-and-turquoise eyes and a jade rattle.",
};

const TAU = Math.PI * 2;
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------------------------------------------------------
// Stone palette. Jade strata, inlays and ink for the grooves.
type Pal = { deep: string; mid: string; light: string; pale: string; vein: string };
const BODY_PAL: Pal = { deep: "#0c4a3a", mid: "#278a66", light: "#54bb92", pale: "#a4e2c4", vein: "#e0f8e8" };
const BELLY_PAL: Pal = { deep: "#5f9a70", mid: "#8fc890", light: "#b6e2a8", pale: "#e2f3c8", vein: "#f6fbe4" };
const RUFF_DARK: Pal = { deep: "#08362b", mid: "#146b4d", light: "#26996c", pale: "#5cc79a", vein: "#a6ecc8" };
const RUFF_LIGHT: Pal = { deep: "#2a7d5a", mid: "#4fb283", light: "#82d8a6", pale: "#c0efc6", vein: "#e8f9d8" };
const HEAD_PAL: Pal = { deep: "#0f5240", mid: "#2b9068", light: "#58bf94", pale: "#a8e4c2", vein: "#dcf7e2" };
const SCUTE_PAL: Pal = { deep: "#0f5a44", mid: "#23926a", light: "#44b688", pale: "#8fdcb4", vein: "#cdf2dc" };

const INK = rgb("#0a2c24");
const RIM = rgb("#d4f7cf");
const SHELL = "#f1ecda";
const OBSIDIAN = "#0b0c10";
const CINNABAR = "#a3231b";
const TQ = ["#0f9d92", "#22bfae", "#0c8482", "#4ed8c3"].map((c) => rgb(c));
const SHELL_RGB = rgb(SHELL);
const OBS_RGB = rgb(OBSIDIAN);

/** Inlay / ink codes returned by motifs: 0 nothing, 1 ink groove, 2..5 turquoise tones, 6 shell, 7 obsidian. */
function codeColor(code: number): Rgb {
  if (code === 1) return INK;
  if (code >= 2 && code <= 5) return TQ[code - 2];
  return code === 6 ? SHELL_RGB : OBS_RGB;
}

const hash2 = (i: number, j: number, seed = 0) => {
  let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Layered translucent-looking jade: four soft strata from big and mid noise, a lit-from-above glow and pale veins. */
function jadeTone(p: Vector3, n: Vector3, seed: number, pal: Pal): Rgb {
  const big = noise(p, 0.2, seed);
  const mid = noise(p, 0.06, seed + 3);
  const fine = noise(p, 0.014, seed + 7);
  const t = big * 0.48 + mid * 0.34 + fine * 0.18 + 0.13 * (n.y - 0.15);
  let c: Rgb = mix(pal.deep, pal.mid, smoothstep(0.34, 0.44, t));
  c = mix(c, pal.light, smoothstep(0.5, 0.6, t));
  c = mix(c, pal.pale, smoothstep(0.63, 0.73, t));
  const cell = cells(p, 0.085, seed + 11);
  const border = 1 - smoothstep(0, 0.06, cell.d2 - cell.d1);
  const vein = border * smoothstep(0.52, 0.68, noise(p, 0.07, seed + 13));
  return mix(c, pal.vein, vein * 0.55);
}

const jadeFlat = (pal: Pal, seed: number) => paint((p, n) => jadeTone(p, n, seed, pal));

/** Groove sampling distance: a lit rim one side of every groove, a shaded rim the other, so lines read as carved. */
const E = 0.0032;
function relief(base: Rgb, a: number, c: number, motif: (a: number, c: number) => number): Rgb {
  const m = motif(a, c);
  if (m) return codeColor(m);
  if (motif(a - E, c - E) === 1) return mix(base, RIM, 0.6);
  if (motif(a + E, c + E) === 1) return mix(base, INK, 0.5);
  return base;
}

// ---------------------------------------------------------------------------------------------------------------
// Relief motifs, in meters along (a) and across (c) a surface.

/** Square spiral (a stepped scroll): one cell wide arm, one cell gap. 1 = carved. */
function stepFret(n: number) {
  const g = Array.from({ length: n }, () => Array<number>(n).fill(0));
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < n && y < n;
  const canGo = (x: number, y: number, dx: number, dy: number) =>
    inside(x + dx, y + dy) && !g[y + dy][x + dx] && !(inside(x + 2 * dx, y + 2 * dy) && g[y + 2 * dy][x + 2 * dx]);
  let x = 0;
  let y = 0;
  let dx = 1;
  let dy = 0;
  g[0][0] = 1;
  for (let k = 0; k < n * n; k++) {
    if (!canGo(x, y, dx, dy)) {
      [dx, dy] = [-dy, dx];
      if (!canGo(x, y, dx, dy)) break;
    }
    x += dx;
    y += dy;
    g[y][x] = 1;
  }
  return g;
}
const FRET = stepFret(7);
const CS = 0.0125; // one carved cell, in meters

const MT = 0.0115; // one mosaic tile, in meters
/** Inlaid tiles with dark stucco gaps: mostly turquoise in four tones, the odd shell or obsidian tile. */
function mosaic(x: number, y: number, seed: number) {
  if (fract(x / MT) < 0.16 || fract(y / MT) < 0.16) return 1;
  const h = hash2(Math.floor(x / MT), Math.floor(y / MT), seed);
  return h < 0.06 ? 6 : h < 0.11 ? 7 : 2 + Math.floor(((h - 0.11) / 0.89) * 4);
}
/** Feather-scale scallops: rounded free edges toward the tail, staggered rows. */
function scallop(a: number, c: number) {
  const ch = 0.017;
  const cw = 0.024;
  const i = Math.floor(a / ch);
  const fu = a / ch - i;
  const w = c / cw + (i & 1 ? 0.5 : 0);
  const fv = w - Math.floor(w) - 0.5;
  const edge = 0.5 + 0.4 * (2 * fv) * (2 * fv);
  return Math.abs(fu - edge) < 0.11 ? 1 : 0;
}

/** The thin tail: mosaic rings between incised lines. */
function tailRings(a: number, c: number) {
  const f = fract(a / 0.058);
  if (f < 0.07 || (f > 0.31 && f < 0.38)) return 1;
  return f > 0.38 ? 0 : mosaic(a, c, 3);
}

/** Dorsal band of a body 6-7 cm in radius: frame lines round alternating stepped scrolls, inlay between them. */
function dorsalFret(a: number, c: number) {
  const u = a / CS;
  const v = c / CS;
  const av = Math.abs(v);
  if (av > 4.2 && av < 5.2) return 1;
  if (av >= 3.5) return 0;
  const iu = Math.floor(u / 8);
  const ju = u - iu * 8;
  if (ju >= 7) {
    if (av < 0.65) return 6;
    if (av < 1.7) return 2 + Math.floor(hash2(iu, 1, 5) * 4);
    return 0;
  }
  const col = iu & 1 ? 6 - Math.floor(ju) : Math.floor(ju);
  return FRET[Math.floor(v + 3.5)][col];
}

/** Head top: forward-pointing chevron rows between two incised lines. */
function headChevrons(a: number, c: number) {
  if (Math.abs(c) > 0.045) return 0;
  return fract((a - 0.7 * Math.abs(c)) / 0.02) < 0.14 ? 1 : 0;
}

type SkinOptions = {
  len: number;
  radiusAt: (t: number) => number;
  body: Pal;
  belly: Pal;
  seed: number;
  head?: boolean;
};

/** The carved skin: dorsal band, flank scallops, belly plates, tail rings, all one paint on the tube's [t, deg]. */
function skinPaint(o: SkinOptions) {
  return paint((p, n, s) => {
    const a = s[0] * o.len;
    const d = ((((s[1] + 180) % 360) + 360) % 360) - 180;
    const r = o.radiusAt(s[0]);
    const c = d * DEG * r;
    const bellyMix = smoothstep(120, 145, Math.abs(d));
    const body = jadeTone(p, n, o.seed, o.body);
    const base = bellyMix > 0 ? mix(body, jadeTone(p, n, o.seed + 40, o.belly), bellyMix) : body;
    const motif = (aa: number, cc: number) => {
      if (!o.head && r < 0.046) return tailRings(aa, cc);
      if (!o.head) {
        const f = fract(aa / 0.34) * 0.34;
        if (f < 0.05 && aa > 0.5) return f < 0.004 || f > 0.046 ? 1 : mosaic(aa, cc, 3);
      }
      const deg = Math.abs(cc) / (r * DEG);
      if (Math.abs(cc) < 5.4 * CS) return o.head ? headChevrons(aa, cc) : dorsalFret(aa, cc);
      if (deg < 126) return scallop(aa, cc);
      if (deg < 134) return Math.abs((deg - 130) * DEG * r) < 0.0026 ? 1 : 0;
      return fract(aa / 0.022) < 0.11 ? 1 : 0;
    };
    return relief(base, a, c, motif);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Feathers of the ruff: bevelled plaques carved from their own outline coordinates.
const FEATHER: readonly (readonly [number, number])[] = [
  [0, 0.3],
  [0.1, 0.62],
  [0.28, 0.92],
  [0.52, 1],
  [0.74, 0.84],
  [0.9, 0.5],
  [1, 0],
];

function featherHalf(u: number) {
  for (let i = 1; i < FEATHER.length; i++) {
    const [u1, f1] = FEATHER[i];
    if (u <= u1) {
      const [u0, f0] = FEATHER[i - 1];
      return f0 + ((f1 - f0) * (u - u0)) / (u1 - u0);
    }
  }
  return 0;
}

function featherOutline(L: number, w: number) {
  const lower = FEATHER.slice(0, -1).map(([u, f]) => [u * L, -f * w] as [number, number]);
  const upper = FEATHER.slice(0, -1)
    .map(([u, f]) => [u * L, f * w] as [number, number])
    .reverse();
  return [...lower, [L, 0, "sharp"] as [number, number, "sharp"], ...upper];
}

const TIP_START = 0.66;
function featherPaint(L: number, w: number, pal: Pal, tiles: readonly number[], seed: number) {
  const motif = (x: number, y: number) => {
    const u = x / L;
    const ay = Math.abs(y);
    const edge = featherHalf(Math.min(Math.max(u, 0), 1)) * w - ay;
    if (edge < 0) return 0;
    if (edge > 0.0015 && edge < 0.0046) return 1;
    if (ay < 0.0017 && u > 0.04 && u < 0.95) return 1;
    if (u > TIP_START && edge > 0.0046) {
      if (Math.abs(u - TIP_START) < 0.011) return 1;
      if (u > TIP_START + 0.011 && edge > 0.0075) {
        const gx = fract(x / 0.0115);
        const gy = fract(y / 0.0115);
        if (gx < 0.16 || gy < 0.16) return 1;
        return tiles[Math.floor(hash2(Math.floor(x / 0.0115), Math.floor(y / 0.0115), seed) * tiles.length)];
      }
      return 0;
    }
    if (u > 0.1 && edge > 0.006 && ay > 0.0032 && fract((x - 1.3 * ay) / 0.017) < 0.15) return 1;
    return 0;
  };
  return paint((p, n, s) => {
    const [x, y] = s;
    const u = x / L;
    const edge = featherHalf(Math.min(Math.max(u, 0), 1)) * w - Math.abs(y);
    let base = jadeTone(p, n, seed, pal);
    base = mix(base, pal.light, 0.55 * (1 - smoothstep(0.004, 0.014, edge)));
    base = mix(base, pal.deep, 0.5 * (1 - smoothstep(0, 0.35, u)));
    return relief(base, x, y, motif);
  });
}

/** A jade feather for the mane cards: layered greens, rachis, barbs, a mosaic tip. Drawn opaque; alpha cuts it out. */
function featherCard() {
  const P = "M20 90 L17.5 78 C7 62 4 38 11 20 C14 11 17.5 5 20 1 C22.5 5 26 11 29 20 C36 38 33 62 22.5 78 Z";
  let barbs = "";
  for (let y = 24; y < 80; y += 5.5)
    barbs += `<path d="M20 ${y + 7} L9 ${y - 4} M20 ${y + 7} L31 ${y - 4}" stroke="#062a20" stroke-width="1.15" fill="none"/>`;
  let tiles = "";
  const tq = ["#0f9d92", "#22bfae", "#0c8482", "#4ed8c3", "#f1ecda"];
  for (let iy = 0; iy < 5; iy++)
    for (let ix = 0; ix < 7; ix++)
      tiles += `<rect x="${7 + ix * 4.9}" y="${1 + iy * 4.6}" width="4.5" height="4.2" fill="${tq[Math.floor(hash2(ix, iy, 9) * 4.2)]}"/>`;
  return svg(
    `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0a3a2a"/><stop offset="0.45" stop-color="#1f8656"/><stop offset="1" stop-color="#4dbf88"/></linearGradient>
        <linearGradient id="s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></linearGradient>
        <clipPath id="c"><path d="${P}"/></clipPath>
      </defs>
      <path d="${P}" fill="url(#g)"/>
      <g clip-path="url(#c)">${barbs}<g>${tiles}</g><rect x="0" y="0" width="40" height="90" fill="url(#s)"/>
        <path d="M0 24.5 H40" stroke="#062a20" stroke-width="1.3"/></g>
      <path d="M20 88 L20 6" stroke="#062a20" stroke-width="1.6" fill="none"/>
      <path d="M21.4 88 L21.4 6" stroke="#b7f0c0" stroke-width="0.7" fill="none"/>
      <path d="${P}" fill="none" stroke="#04211a" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );
}

/** Eye: obsidian bezel, shell ring, turquoise iris with a slit pupil and a glint. */
function eyeTexture() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#0b0c10"/>
      <circle cx="32" cy="32" r="27" fill="#f1ecda"/>
      <circle cx="32" cy="32" r="21" fill="#0c8482"/>
      <circle cx="32" cy="32" r="16.5" fill="#22bfae"/>
      <circle cx="32" cy="32" r="12" fill="#4ed8c3"/>
      <ellipse cx="32" cy="32" rx="4.6" ry="13.5" fill="#0b0c10"/>
      <circle cx="26.5" cy="24.5" r="3" fill="#ffffff"/>
      <circle cx="32" cy="32" r="21" fill="none" stroke="#04211a" stroke-width="1.6"/>
    </svg>`,
    { size: 128 },
  );
}

/** Pectoral and ear-spool disc: jade rim, ring of turquoise tiles, shell ring, obsidian field, four-petal glyph. */
function discTexture() {
  let ring = "";
  for (let k = 0; k < 20; k++)
    ring += `<rect x="-4.3" y="-41" width="8.6" height="10" fill="${TQ_HEX[k % 4]}" stroke="#05201a" stroke-width="1.1" transform="rotate(${k * 18})"/>`;
  let petals = "";
  for (let k = 0; k < 4; k++)
    petals += `<circle cx="0" cy="-9.5" r="8.2" fill="${TQ_HEX[(k + 1) % 4]}" stroke="#05201a" stroke-width="1" transform="rotate(${k * 90})"/>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#0f5a3d" stroke="#05201a" stroke-width="2"/>
      <g transform="translate(50 50)">
        ${ring}
        <circle r="29.5" fill="#f1ecda" stroke="#05201a" stroke-width="1.6"/>
        <circle r="23" fill="#0b0c10"/>
        ${petals}
        <circle r="5.2" fill="#f1ecda" stroke="#05201a" stroke-width="1"/>
      </g>
    </svg>`,
    { size: 192 },
  );
}
const TQ_HEX = ["#0f9d92", "#22bfae", "#0c8482", "#4ed8c3"];

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "jadeSerpent", paintSize: 2048 });

  // ------------------------------------------------------------------ the body curve, tail tip to head
  // A beehive coil: tail tip rises at the centre, the body winds out and down for 1.6 turns, the neck leaves the
  // outer turn heading forward and rears up in a gentle S. The head looks forward and down.
  const CX = 0;
  const CZ = -0.12;
  const COIL = { turns: 1.6, r0: 0.08, r1: 0.19, y0: 0.32, y1: 0.0775 };
  const coilPoint = (s: number) => {
    const ang = Math.PI / 2 + COIL.turns * TAU * (1 - s);
    const r = COIL.r0 + (COIL.r1 - COIL.r0) * s;
    return V(CX + r * Math.sin(ang), COIL.y0 + (COIL.y1 - COIL.y0) * s, CZ + r * Math.cos(ang));
  };
  const coilPts = Array.from({ length: 25 }, (_, i) => coilPoint(i / 24));
  const bodyPts: Vector3[] = [
    V(CX, 0.5, CZ),
    V(CX, 0.42, CZ),
    V(CX - 0.03, 0.36, CZ + 0.01),
    V(CX - 0.068, 0.335, CZ + 0.02),
    ...coilPts,
    V(0.19, 0.0795, -0.04),
    V(0.18, 0.1, 0.05),
    V(0.11, 0.15, 0.16),
    V(0.03, 0.25, 0.24),
    V(-0.03, 0.38, 0.28),
    V(-0.03, 0.5, 0.28),
    V(-0.01, 0.62, 0.3),
    V(0, 0.72, 0.36),
    V(0, 0.79, 0.45),
  ];
  const body = catmull(bodyPts);
  const L = body.length;
  const rootT = body.closestT(coilPoint(1));
  const cutT = body.closestT(coilPoint(0.42));
  const tipT = body.closestT(coilPoint(0));

  // Radius by t: thin tail tip, thickest through the coil, slimmer neck under the head.
  const keys: Array<[number, number]> = [
    [0, 0.028],
    [tipT, 0.033],
    [tipT + (rootT - tipT) * 0.45, 0.058],
    [tipT + (rootT - tipT) * 0.75, 0.067],
    [rootT, 0.072],
    [rootT + (1 - rootT) * 0.45, 0.064],
    [1, 0.054],
  ];
  const radiusAt = (t: number) => {
    for (let i = 1; i < keys.length; i++)
      if (t <= keys[i][0]) {
        const [t0, r0] = keys[i - 1];
        const [t1, r1] = keys[i];
        return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
      }
    return keys[keys.length - 1][1];
  };

  // ------------------------------------------------------------------ skeleton
  const core = b.joint("core", { at: coilPoint(1), role: "spine", group: "body" });
  const neck = b.chain("neck", body.slice(rootT, 1), { parent: core, count: 9, role: "neck", group: "neck" });
  const spine = b.chain("spine", body.slice(rootT, cutT), { parent: core, count: 9, role: "spine", group: "body" });
  const tail = b.chain("tail", body.slice(cutT, 0), {
    parent: spine.joints[spine.joints.length - 1],
    count: 10,
    role: "tail",
    group: "tail",
  });

  const skin = skinPaint({
    len: L,
    radiusAt,
    body: BODY_PAL,
    belly: BELLY_PAL,
    seed: 1,
  });
  const bodyTube = b.sweep(body, radiusAt, {
    bone: [tail, spine, core, neck],
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
    color: skin,
    group: "body",
  });

  // ------------------------------------------------------------------ rattle: six jade beads on three joints
  const rattleAxis = V(0, 1, 0);
  const rattleBase = V(CX, 0.5, CZ);
  const rattle = b.chain("rattle", polyline([rattleBase, rattleBase.clone().addScaledVector(rattleAxis, 0.25)]), {
    parent: tail.joints[tail.joints.length - 1],
    count: 3,
    role: "tail",
    group: "rattle",
  });
  const beadR = [0.037, 0.043, 0.046, 0.044, 0.038, 0.029];
  const beadPal: Pal[] = [SCUTE_PAL, RUFF_DARK, SCUTE_PAL, RUFF_DARK, SCUTE_PAL, RUFF_DARK];
  beadR.forEach((r, i) => {
    const h = 0.056;
    const at = rattleBase.clone().addScaledVector(rattleAxis, -0.006 + i * 0.044);
    b.lathe(
      [
        [0, 0],
        [r * 0.72, 0],
        [r, h * 0.28],
        [r, h * 0.62],
        [r * 0.7, h],
        [0, h],
      ],
      {
        at,
        axis: rattleAxis,
        segments: 6,
        spin: 30 * (i & 1),
        color: jadeFlat(beadPal[i], 30 + i),
        bone: rattle.joints[Math.floor(i / 2)],
        group: "rattle",
      },
    );
    // carved turquoise band round each bead's waist
    b.lathe(
      [
        [r * 0.99, h * 0.4],
        [r * 1.05, h * 0.42],
        [r * 1.05, h * 0.52],
        [r * 0.99, h * 0.54],
      ],
      {
        at,
        axis: rattleAxis,
        segments: 6,
        spin: 30 * (i & 1),
        color: TQ_HEX[i % 4],
        bone: rattle.joints[Math.floor(i / 2)],
        group: "rattle",
      },
    );
  });

  // ------------------------------------------------------------------ head
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.at(1),
    dir: [0, -0.3, 1],
    role: "head",
    group: "head",
  });
  const H = (x: number, y: number, z: number) => head.local([x, y, z]);
  const HD = (x: number, y: number, z: number) => head.dir([x, y, z]);

  type Station = { y: number; w: number; h: number; z: number };
  const UPPER: Station[] = [
    { y: -0.07, w: 0.12, h: 0.11, z: 0 },
    { y: 0.035, w: 0.17, h: 0.115, z: 0.006 },
    { y: 0.09, w: 0.155, h: 0.095, z: 0.012 },
    { y: 0.15, w: 0.13, h: 0.075, z: 0.018 },
    { y: 0.2, w: 0.11, h: 0.064, z: 0.024 },
  ];
  const LOWER: Station[] = [
    { y: 0, w: 0.12, h: 0.055, z: -0.065 },
    { y: 0.06, w: 0.115, h: 0.05, z: -0.06 },
    { y: 0.115, w: 0.1, h: 0.046, z: -0.046 },
    { y: 0.165, w: 0.088, h: 0.042, z: -0.032 },
    { y: 0.195, w: 0.078, h: 0.038, z: -0.026 },
  ];
  const at = (st: Station[], y: number) => {
    for (let i = 1; i < st.length; i++)
      if (y <= st[i].y) {
        const k = (y - st[i - 1].y) / (st[i].y - st[i - 1].y);
        const m = (f: (s: Station) => number) => f(st[i - 1]) + (f(st[i]) - f(st[i - 1])) * k;
        return { w: m((s) => s.w), h: m((s) => s.h), z: m((s) => s.z) };
      }
    const s = st[st.length - 1];
    return { w: s.w, h: s.h, z: s.z };
  };
  const upperBottom = (y: number) => {
    const s = at(UPPER, y);
    return s.z - s.h / 2;
  };
  const lowerTop = (y: number) => {
    const s = at(LOWER, y);
    return s.z + s.h / 2;
  };

  const headSkin = skinPaint({
    len: 0.3,
    radiusAt: () => 0.06,
    body: HEAD_PAL,
    belly: BELLY_PAL,
    seed: 2,
    head: true,
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H(0, 0, -0.055),
    aim: H(0, 0.3, -0.055),
    role: "jaw",
    group: "jaw",
  });
  b.loft(
    UPPER.map((s) => ({ at: H(0, s.y, s.z), w: s.w, h: s.h })),
    { bone: head, sides: 8, smooth: false, color: headSkin, group: "head" },
  );
  b.loft(
    LOWER.map((s) => ({ at: H(0, s.y, s.z), w: s.w, h: s.h })),
    { bone: jaw, sides: 8, smooth: false, color: jadeFlat(RUFF_LIGHT, 6), group: "jaw" },
  );
  // palate and gum: cinnabar slabs inside the mouth
  b.frustumBox(
    H(0, 0.02, upperBottom(0.02) + 0.004),
    H(0, 0.175, upperBottom(0.175) + 0.004),
    [0.08, 0.016],
    [0.055, 0.012],
    {
      bone: head,
      color: CINNABAR,
      group: "head",
    },
  );
  b.frustumBox(H(0, 0.03, lowerTop(0.03) - 0.004), H(0, 0.175, lowerTop(0.175) - 0.004), [0.08, 0.016], [0.05, 0.012], {
    bone: jaw,
    color: "#8a1b16",
    group: "jaw",
  });
  // forked tongue lying on the jaw and reaching past the snout
  b.extrude(
    [
      [0, -0.022],
      [0.16, -0.017],
      [0.25, -0.017],
      [0.3, -0.03, "sharp"],
      [0.262, 0, "sharp"],
      [0.3, 0.03, "sharp"],
      [0.25, 0.017],
      [0.16, 0.017],
      [0, 0.022],
    ],
    {
      at: H(0, 0.03, lowerTop(0.03) + 0.004),
      x: HD(0, 1, -0.05),
      y: HD(1, 0, 0),
      thickness: 0.012,
      bevel: 0.003,
      color: CINNABAR,
      bone: jaw,
      group: "jaw",
    },
  );

  // teeth: shell inlay. Big upper fangs, small even rows, two short lower fangs
  const tooth = (base: Vector3, dir: Vector3, len: number, r: number, bone: typeof head) =>
    b.spike(base, dir, len, r, { bone, color: SHELL, sides: 5, smooth: false, group: bone === head ? "head" : "jaw" });
  for (const s of [1, -1]) {
    tooth(H(s * 0.042, 0.14, upperBottom(0.14) + 0.006), HD(0, 0.12, -1), 0.09, 0.0135, head);
    for (let i = 0; i < 5; i++) {
      const y = 0.025 + i * 0.027;
      const w = at(UPPER, y).w * 0.5 * 0.85;
      tooth(H(s * w, y, upperBottom(y) + 0.006), HD(0, 0.1, -1), 0.026 - i * 0.001, 0.007, head);
    }
    for (let i = 0; i < 5; i++) {
      const y = 0.025 + i * 0.032;
      const w = at(LOWER, y).w * 0.5 * 0.82;
      tooth(H(s * w, y, lowerTop(y) - 0.006), HD(0, -0.05, 1), 0.026, 0.007, jaw);
    }
    tooth(H(s * 0.03, 0.16, lowerTop(0.16) - 0.006), HD(0, 0.1, 1), 0.056, 0.01, jaw);
  }

  // eyes: jade socket with an obsidian, turquoise and shell disc
  const EYE = eyeTexture();
  for (const s of [1, -1]) {
    const socket = H(s * 0.07, 0.07, 0.035);
    b.part(new SphereGeometry(0.038, 7, 5), jadeFlat(HEAD_PAL, 8), {
      bone: head,
      at: socket,
      scale: [1, 1.2, 0.9],
      group: "head",
    });
    const n = HD(s * 0.85, 0.35, 0.25).normalize();
    b.part(new CircleGeometry(0.029, 12), "#ffffff", {
      bone: head,
      at: socket.clone().addScaledVector(n, 0.0388),
      dir: n,
      axis: "z",
      up: HD(0, 0, 1),
      texture: EYE,
      group: "head",
    });
    // heavy brow ridge above the eye and a spiky cheek scute behind it
    b.sweep([H(s * 0.035, 0.13, 0.068), H(s * 0.075, 0.075, 0.078), H(s * 0.095, 0.02, 0.062)], [0.013, 0.02, 0.013], {
      bone: head,
      sides: 6,
      smooth: false,
      color: jadeFlat(SCUTE_PAL, 9),
      group: "head",
    });
    b.spike(H(s * 0.09, 0.0, 0.02), HD(s * 0.7, -0.5, 0.35), 0.065, 0.019, {
      bone: head,
      sides: 4,
      smooth: false,
      color: jadeFlat(SCUTE_PAL, 10),
      group: "head",
    });
  }

  // curled nose scroll and nostrils
  const noseTip = H(0, 0.205, 0.03);
  b.sweep(
    spiral(noseTip.clone().addScaledVector(HD(0, 0, 1), 0.03), noseTip, HD(1, 0, 0), { turns: 1.1, r1: 0.012 }),
    [0.014, 0.006],
    {
      bone: head,
      sides: 5,
      smooth: false,
      color: jadeFlat(SCUTE_PAL, 11),
      caps: { end: "point" },
      group: "head",
    },
  );
  for (const s of [1, -1])
    b.part(new SphereGeometry(0.009, 5, 4), OBSIDIAN, { bone: head, at: H(s * 0.028, 0.175, 0.054), group: "head" });

  // forehead crown: a turquoise mosaic diamond and a row of pyramid crest scutes behind it
  const mosaicPaint = paint((p, n, s) => relief(jadeTone(p, n, 21, HEAD_PAL), s[0], s[1], (x, y) => mosaic(x, y, 21)));
  b.extrude(
    [
      [-0.05, 0],
      [-0.005, -0.038],
      [0.05, 0],
      [-0.005, 0.038],
    ],
    {
      at: H(0, 0.075, 0.056),
      x: HD(0, 1, -0.07),
      y: HD(1, 0, 0),
      thickness: 0.012,
      bevel: 0.003,
      color: mosaicPaint,
      bone: head,
      group: "head",
    },
  );
  for (let i = 0; i < 4; i++)
    b.spike(
      H(0, -0.05 + i * 0.03, at(UPPER, -0.05 + i * 0.03).z + at(UPPER, -0.05 + i * 0.03).h / 2 - 0.004),
      HD(0, -0.3, 1),
      0.05 - i * 0.008,
      0.02 - i * 0.002,
      {
        bone: head,
        sides: 4,
        smooth: false,
        color: jadeFlat(SCUTE_PAL, 12 + i),
        group: "head",
      },
    );

  // ------------------------------------------------------------------ the ruff: three rows of jade feathers
  const ruffLine = frame(H(0, -0.05, 0), HD(0, 1, 0));
  type Row = {
    name: string;
    count: number;
    radius: number;
    tilt: number;
    len: number;
    half: number;
    pal: Pal;
    tiles: number[];
    offset: number;
    joints: number;
    seed: number;
  };
  const ROWS: Row[] = [
    {
      name: "ruffA",
      count: 14,
      radius: 0.085,
      tilt: -70,
      len: 0.42,
      half: 0.038,
      pal: RUFF_DARK,
      tiles: [2, 3, 4, 5],
      offset: 0,
      joints: 7,
      seed: 40,
    },
    {
      name: "ruffB",
      count: 14,
      radius: 0.072,
      tilt: -50,
      len: 0.31,
      half: 0.037,
      pal: RUFF_LIGHT,
      tiles: [6, 2, 3, 7, 2, 4, 2, 5],
      offset: 360 / 28,
      joints: 7,
      seed: 50,
    },
    {
      name: "ruffC",
      count: 12,
      radius: 0.064,
      tilt: -24,
      len: 0.19,
      half: 0.031,
      pal: RUFF_DARK,
      tiles: [2, 4, 5, 3],
      offset: 360 / 24,
      joints: 6,
      seed: 60,
    },
  ];
  for (const row of ROWS) {
    const lens = [row.len, row.len * 0.8];
    const paints = lens.map((l) => featherPaint(l, row.half, row.pal, row.tiles, row.seed));
    b.ring(
      ruffLine,
      {
        count: row.count,
        radius: row.radius,
        tilt: row.tilt,
        fromDeg: row.offset,
        toDeg: row.offset + 360,
        joints: row.joints,
        name: row.name,
        parent: head,
        role: "fan",
        group: "ruff",
      },
      (item) => {
        const k = item.i & 1;
        b.extrude(featherOutline(lens[k], row.half), {
          at: item,
          x: item.axis,
          y: item.dir([1, 0, 0]),
          thickness: 0.011,
          bevel: 0.0035,
          detail: 0.34,
          smoothing: 1,
          color: paints[k],
          group: "ruff",
        });
      },
    );
  }
  // collar of faceted jade hiding the feather roots, with a mosaic band
  const collarPaint = paint((p, n, s) => {
    const base = jadeTone(p, n, 31, RUFF_DARK);
    return s[0] < 0.012 || s[0] > 0.036 ? base : relief(base, s[1] * DEG * 0.09, s[0], (x, y) => mosaic(x, y, 31));
  });
  b.lathe(
    [
      [0.052, -0.02],
      [0.085, -0.008],
      [0.093, 0.012],
      [0.086, 0.04],
      [0.056, 0.05],
      [0.05, 0.02],
    ],
    { at: H(0, -0.07, 0), axis: HD(0, 1, 0), segments: 10, color: collarPaint, bone: head, group: "ruff" },
  );

  // ------------------------------------------------------------------ ornaments: pectoral, shell beads, ear spools
  const DISC = discTexture();
  const pendantT = rootT + 0.72 * (1 - rootT);
  const pendantJoint = neck.joints[6];
  const pend = bodyTube.at(pendantT, 180);
  const pn = pend.axis;
  b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.058, 0.006],
      [0.058, 0.012],
      [0.052, 0.018],
      [0, 0.018],
    ],
    {
      at: pend.at.clone().addScaledVector(pn, -0.006),
      axis: pn,
      segments: 10,
      color: jadeFlat(SCUTE_PAL, 70),
      bone: pendantJoint,
      group: "neck",
    },
  );
  b.part(new CircleGeometry(0.047, 14), "#ffffff", {
    bone: pendantJoint,
    at: pend.at.clone().addScaledVector(pn, 0.0125),
    dir: pn,
    axis: "z",
    up: [0, 1, 0],
    texture: DISC,
    group: "neck",
  });
  b.ring(neck.at(0.72), { count: 12, radius: 0.068 }, (item) =>
    b.part(new SphereGeometry(0.0125, 6, 4), SHELL, { frame: item, bone: pendantJoint, group: "neck" }),
  );
  for (const s of [1, -1]) {
    const c = H(s * 0.088, 0.03, -0.01);
    const n = HD(s, 0, 0.1).normalize();
    b.lathe(
      [
        [0, 0],
        [0.026, 0],
        [0.03, 0.006],
        [0.03, 0.012],
        [0.026, 0.016],
        [0, 0.016],
      ],
      { at: c, axis: n, segments: 8, color: jadeFlat(SCUTE_PAL, 80), bone: head, group: "head" },
    );
    b.part(new CircleGeometry(0.0255, 12), "#ffffff", {
      bone: head,
      at: c.clone().addScaledVector(n, 0.0175),
      dir: n,
      axis: "z",
      up: HD(0, 0, 1),
      texture: DISC,
      group: "head",
    });
  }

  // ------------------------------------------------------------------ dorsal pyramids and a plume mane
  const scuteMain = jadeFlat(BODY_PAL, 91);
  b.along(
    bodyTube,
    44,
    (dorsal) => {
      const r = dorsal.radius;
      b.spike(dorsal, dorsal, r * 0.7, r * 0.38, { sides: 4, smooth: false, color: scuteMain, group: "body" });
    },
    { from: 0.03, to: rootT + 0.02 },
  );
  const mane = b.along(bodyTube, 26, () => undefined, { from: rootT + 0.03, to: 0.93 });
  b.cards(mane, featherCard(), {
    size: [0.09, 0.18],
    lean: 52,
    bend: 22,
    flow: (f) => f.dir([0, 0, -1]),
    vary: 0.22,
    spin: 10,
    rng: rng(5),
    sink: 0.18,
    group: "mane",
  });

  // ------------------------------------------------------------------ rest pose: mouth open
  b.pose(jaw, { axis: [1, 0, 0], deg: 26 });

  return b.root;
}
