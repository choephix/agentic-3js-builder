// Ukiyo-e octopus: a 3 m woodblock-print octopus after Hokusai and Kuniyoshi. A bulbous mantle and a heavy head with two
// turret eyes sit in the middle of a star of eight arms that lie on the floor, wander in lazy S-curves and lift into
// spiral curls. It is printed, not shaded: flat block colours (Prussian and indigo on the back, vermilion on the
// underside, cream paper, ochre), a bold black key line where back meets belly, and bokashi bands done as stepped flat
// tones: the arms fade from deep to pale blue toward their tips, the mantle steps deep at the crown to pale at the neck.
// The mantle wears seigaiha (rows of concentric wave arcs) and two uzumaki spiral roundels; the back is mottled in
// carved-block dashes; a washi paper fibre grain runs through every colour. Suckers are neat ringed cards on both sides
// of every arm, sized down the taper, and a red hanko seal sits on the crown.
// All patterns are paints in meters or SVG drawings: the eyes (a slit pupil laid out in polar lat-long), the suckers, the seal.
// Skeleton: mantle (root), mantleTip, head, eyeL/eyeR each with an upper and lower lid hinge, and eight 8-joint arm
// chains (armL1..armL4 front to back, armR1..armR4) rooted on the head.
import { PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { DEG } from "../src/math";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { catmull, spiral } from "../src/path";
import type { Path } from "../src/path";
import type { SweepPoint } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Ukiyo-e Octopus",
  description:
    "A 3 m octopus as a Japanese woodblock print: Prussian blue back with stepped bokashi tones, vermilion underside, black carved key lines, seigaiha waves and spiral roundels on the mantle, ringed suckers, slit-pupil eyes with hinged lids and eight curling arms on eight-joint chains.",
};

// ------------------------------------------------------------------------------------------------- Palette
const INK = "#16121a";
const PAPER = "#efe3c4";
const OCHRE = "#d9a13b";
/** Back tones, deep to pale: the bokashi ladder. */
const BLUES = ["#16233d", "#1d3559", "#244c7a", "#3a6f9a", "#6c9db8", "#a8c6c9"] as const;
/** Underside tones, deep to pale. */
const VERM = ["#8f2619", "#b3321f", "#cf4626", "#e0642f", "#eb8b40", "#efb460"] as const;

type C = string | Rgb;

// ------------------------------------------------------------------------------------------------- Pattern kit
const AA = 0.0009;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const fract = (x: number) => x - Math.floor(x);
/** Coverage of a shape whose signed distance is `d` and radius `r`, one texel of edge. */
const cover = (d: number, r: number) => smoothstep(r + AA, r - AA, d);
const over = (base: C, top: C, a: number): C => (a <= 0.001 ? base : a >= 0.999 ? top : mix(base, top, a));
/** How many of the ascending `edges` lie at or below x: a stepped flat tone index. */
const step = (x: number, edges: readonly number[]) => edges.reduce((n, e) => n + (x >= e ? 1 : 0), 0);

/** Washi paper: pale fibres and the odd dark fleck, faint enough to sit under any block colour. */
function washi(c: C, p: Vector3): C {
  const fibre = noise(new Vector3(p.x * 9, p.y * 0.9, p.z * 9), 0.011, 21);
  const fleck = noise(p, 0.007, 8);
  const lit = over(c, PAPER, 0.1 * smoothstep(0.6, 0.82, fibre));
  return over(lit, INK, 0.07 * smoothstep(0.66, 0.86, fleck));
}

/** Seigaiha: rows of concentric arcs, circle radius 1, same-row centres 2 apart, rows 0.5 apart, odd rows shifted 1. */
function seigaiha(x: number, y: number) {
  const jc = Math.floor(y / 0.5);
  let best = { d: 9, row: 0, col: 0 };
  let bestY = 1e9;
  for (let j = jc - 3; j <= jc + 3; j++) {
    const off = (((j % 2) + 2) % 2) * 1;
    const cx = 2 * Math.round((x - off) / 2) + off;
    const cy = j * 0.5;
    const d = Math.hypot(x - cx, y - cy);
    if (d < 1 && cy < bestY) {
      bestY = cy;
      best = { d, row: j, col: Math.round((cx - off) / 2) };
    }
  }
  return best;
}

/** Coverage of an uzumaki spiral line at normalised polar (r, th): three turns to the rim, line 0.16 of a turn wide. */
function spiralLine(r: number, th: number) {
  const k = r * 2.6 - th / (2 * Math.PI);
  return smoothstep(0.2, 0.13, Math.abs(fract(k) - 0.5)) * (r > 0.08 ? 1 : 0);
}

// ------------------------------------------------------------------------------------------------- Arm geometry
/** Arm radius at source t: a fat root tapering to a fine tip. */
const ARM_R = (t: number) => 0.011 + 0.124 * Math.pow(1 - t, 1.35);
const ARM_EDGES = [0.16, 0.34, 0.52, 0.7, 0.86] as const;

/** Woodblock grain: long flat streaks of a deeper tone running along the part, `u` metres along, `deg` round. */
function streaks(u: number, deg: number, seed: number) {
  return smoothstep(0.66, 0.7, noise(new Vector3(u * 0.5, deg * 0.03, 3), 0.06, seed));
}

/** A cream dot with a carved ink ring round it: `d` is the distance to its centre. */
const ringDot = (base: C, d: number, r: number, line: number): C =>
  over(over(base, INK, cover(d, r + line)), PAPER, cover(d, r));

/** Distance to the nearest dot of a hexagonal lattice with the given pitch. */
function hexDots(x: number, y: number, pitch: number) {
  const rowH = pitch * 0.866;
  const row = Math.round(y / rowH);
  let d = 9;
  for (let j = row - 1; j <= row + 1; j++) {
    const cx = Math.round((x - (j % 2 ? pitch / 2 : 0)) / pitch) * pitch + (j % 2 ? pitch / 2 : 0);
    d = Math.min(d, Math.hypot(x - cx, y - j * rowH));
  }
  return d;
}

/** Cumulative dot phase down an arm, per metre of arm: one dot per 3.4 radii, so the row tightens toward the tip. */
const DOT_PITCH = 3.4;
const PHASE_STEPS = 400;
const PHASE = (() => {
  const cum = [0];
  for (let i = 1; i <= PHASE_STEPS; i++)
    cum.push(cum[i - 1] + 1 / (DOT_PITCH * ARM_R((i - 0.5) / PHASE_STEPS)) / PHASE_STEPS);
  return cum;
})();
const phaseAt = (t: number) => {
  const x = clamp(t, 0, 1) * PHASE_STEPS;
  const i = Math.min(Math.floor(x), PHASE_STEPS - 1);
  return PHASE[i] + (PHASE[i + 1] - PHASE[i]) * (x - i);
};

/**
 * The paint of one arm: stepped bokashi blue over the back with a ridge of ringed dots and flank dashes, a bold carved
 * key line, stepped vermilion below and a cream centre line.
 */
function armPaint(length: number) {
  return paint((p, _n, s) => {
    const t = s[0];
    const u = t * length;
    const r = ARM_R(t);
    const deg = ((s[1] % 360) + 360) % 360;
    const dd = Math.min(deg, 360 - deg);
    const rank = step(t + (noise(p, 0.09, 4) - 0.5) * 0.06, ARM_EDGES);
    const lw = clamp(0.008 / r / DEG, 4.5, 18);
    const aa = AA / r / DEG;
    const grain = streaks(u, deg, 13);
    let c: C;
    if (dd < 100) {
      const idx = Math.min(5, rank + 1);
      c = over(BLUES[idx], BLUES[Math.max(0, idx - 1)], grain);
      const ph = length * phaseAt(t);
      const along = (fract(ph) - 0.5) * DOT_PITCH * r;
      c = ringDot(c, Math.hypot(along, dd * DEG * r), 0.2 * r, 0.05 * r + 0.0012);
      const along2 = (fract(ph + 0.5) - 0.5) * DOT_PITCH * r;
      const dash = Math.hypot(Math.max(Math.abs(along2) - 0.55 * r, 0), (dd - 56) * DEG * r);
      c = over(c, INK, cover(dash, 0.09 * r + 0.0008));
      // a paper hairline just above the key line, like the raised lip of a carved block
      const hair = 100 - lw / 2 - 0.0038 / r / DEG;
      c = over(c, PAPER, smoothstep(0.0011 + AA, 0.0011 - AA, Math.abs(dd - hair) * DEG * r));
    } else {
      c = over(VERM[rank], VERM[Math.max(0, rank - 1)], grain);
      if (dd > 166) c = PAPER;
      c = over(c, INK, smoothstep(2.4 + aa, 2.4 - aa, Math.abs(dd - 166)));
    }
    c = over(c, INK, smoothstep(lw / 2 + aa, lw / 2 - aa, Math.abs(dd - 100)));
    return washi(c, p);
  });
}

// ------------------------------------------------------------------------------------------------- Drawings
/**
 * The eye as a lat-long map for a sphere that looks out of its pole: v runs from the pole down (64 px = 180 degrees),
 * u round it. Long axis of the slit pupil at u = 0 and 0.5, so with the pole aimed out and `up` up it lies level.
 */
const EYE = (() => {
  const a = 8.4;
  const b = 3.0;
  const n = 3.4;
  let poly = "M0,0";
  for (let i = 0; i <= 64; i++) {
    const th = (i / 64) * 2 * Math.PI;
    const rho = Math.pow(Math.pow(Math.abs(Math.cos(th)) / a, n) + Math.pow(Math.abs(Math.sin(th)) / b, n), -1 / n);
    poly += ` L${(i * 2).toFixed(1)},${rho.toFixed(2)}`;
  }
  poly += " L128,0 Z";
  const rays = Array.from({ length: 48 }, (_, i) => {
    const x = i * (128 / 48) + 0.6;
    return `<rect x="${x.toFixed(2)}" y="9" width="1.1" height="6.4" fill="${INK}"/>`;
  }).join("");
  return svg(
    `<svg viewBox="0 0 128 64">
      <rect width="128" height="64" fill="${BLUES[2]}"/>
      <rect width="128" height="28" fill="${INK}"/>
      <rect width="128" height="25.4" fill="${PAPER}"/>
      <rect width="128" height="16.4" fill="${INK}"/>
      <rect width="128" height="14.8" fill="${OCHRE}"/>
      <rect width="128" height="10" fill="${VERM[2]}"/>
      ${rays}
      <path d="${poly}" fill="${INK}"/>
      <ellipse cx="19" cy="10.2" rx="2.4" ry="1.5" fill="${PAPER}"/>
    </svg>`,
    { size: 512 },
  );
})();

/** A sucker seen from above: black key line, cream rim, an ochre cup ringed in black, a pip. */
const SUCKER = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="${INK}"/>
    <circle cx="50" cy="50" r="41" fill="${PAPER}"/>
    <circle cx="50" cy="50" r="28" fill="${INK}"/>
    <circle cx="50" cy="50" r="23" fill="${OCHRE}"/>
    <circle cx="50" cy="50" r="9" fill="${INK}"/>
  </svg>`,
  { size: 128 },
);

/** A vermilion hanko seal with cream pseudo-glyph strokes. */
const SEAL = svg(
  `<svg viewBox="0 0 64 64">
    <rect x="2" y="2" width="60" height="60" rx="6" fill="#c92f1f"/>
    <rect x="7" y="7" width="50" height="50" rx="3" fill="none" stroke="${PAPER}" stroke-width="2.6"/>
    <g stroke="${PAPER}" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M17 19 H47"/><path d="M17 32 H47"/><path d="M17 45 H47"/>
      <path d="M32 15 V49"/><path d="M22 24 L16 38"/><path d="M42 24 L48 38"/>
    </g>
    <circle cx="47" cy="46" r="3" fill="${PAPER}"/>
  </svg>`,
  { size: 128 },
);

// ------------------------------------------------------------------------------------------------- Arms
type ArmSpec = {
  side: "L" | "R";
  k: number;
  az: number;
  reach: number;
  wig: number;
  phase: number;
  lift: number;
  r0: number;
  tilt: number;
  turns: number;
  pitch: number;
};

const ARMS: ArmSpec[] = [];
for (const [side, s] of [
  ["L", 1],
  ["R", -1],
] as const) {
  const az = [30, 72, 115, 157];
  const reach = [1.1, 1.18, 1.18, 1.1];
  const wig = [0.15, -0.18, 0.15, -0.13];
  const lift = [0.1, 0.32, 0.44, 0.3];
  const r0 = [0.15, 0.17, 0.16, 0.14];
  const tilt = [50, -32, 22, -26];
  const turns = [1.15, 1.3, 1.2, 1.35];
  for (let k = 0; k < 4; k++)
    ARMS.push({
      side,
      k: k + 1,
      az: s * az[k],
      reach: reach[k],
      wig: s * wig[k],
      phase: k * 0.9,
      lift: lift[k],
      r0: r0[k],
      tilt: s * tilt[k],
      turns: turns[k],
      pitch: (k % 2 ? -1 : 1) * 0.085,
    });
}

const RB = 0.22;

/** One arm's centre line: along the floor in an S, rising into a spiral curl. `guess` is the expected total length. */
function armPath(a: ArmSpec, guess: number): Path {
  const az = a.az * DEG;
  const er = new Vector3(Math.sin(az), 0, Math.cos(az));
  const et = new Vector3(Math.cos(az), 0, -Math.sin(az));
  const pts: Vector3[] = [];
  const u0 = -0.08;
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const u = u0 + ((a.reach - u0) * i) / n;
    const ramp = smoothstep(0.05, 0.6, u);
    const lat = a.wig * Math.sin((u * 2 * Math.PI) / 1.7 + a.phase) * ramp;
    const rise = smoothstep(0.5 * a.reach, a.reach, u);
    const y =
      0.0024 + ARM_R(clamp((u - u0) / guess, 0, 1)) + 0.075 * (1 - smoothstep(-0.08, 0.25, u)) + a.lift * rise * rise;
    pts.push(
      er
        .clone()
        .multiplyScalar(RB + u)
        .addScaledVector(et, lat)
        .setY(y),
    );
  }
  const base = catmull(pts);
  const P = base.at(1);
  const T = base.tangentAt(1).normalize();
  const up = new Vector3(0, 1, 0);
  const n0 = up.clone().addScaledVector(T, -up.dot(T)).normalize();
  const psi = a.tilt * DEG;
  const nn = n0.clone().multiplyScalar(Math.cos(psi)).addScaledVector(T.clone().cross(n0), Math.sin(psi)).normalize();
  const axis = T.clone().cross(nn).normalize();
  const centre = P.clone().addScaledVector(nn, a.r0);
  const coil = spiral(centre, P, axis, { turns: a.turns, r1: 0.045, pitch: a.pitch });
  return base.concat(coil);
}

/** The arm path with its floor height corrected to the real length. */
function armPathFitted(a: ArmSpec) {
  let path = armPath(a, 2.1);
  for (let i = 0; i < 3; i++) path = armPath(a, path.length);
  return path;
}

// ------------------------------------------------------------------------------------------------- Build
export default function build() {
  const b = createBuilder({ name: "ukiyoeOctopus", paintSize: 2048 });

  // ---- Body: head and mantle are one continuous skin over a single curve.
  const bodyPath = catmull([
    [0, 0.42, 0.42],
    [0, 0.47, 0.16],
    [0, 0.62, -0.13],
    [0, 0.87, -0.42],
    [0, 1.04, -0.64],
  ]);
  const Lb = bodyPath.length;
  const mc = bodyPath.at(0.66);

  const mantle = b.joint("mantle", { at: [0, 0.52, -0.05], aim: [0, 0.84, -0.4], role: "spine", group: "body" });
  const mantleTip = b.joint("mantleTip", {
    parent: mantle,
    at: [0, 0.84, -0.4],
    aim: [0, 1.04, -0.64],
    role: "spine",
    group: "body",
  });
  const head = b.joint("head", {
    parent: mantle,
    at: [0, 0.47, 0.16],
    aim: [0, 0.42, 0.42],
    role: "head",
    group: "head",
  });

  // Mantle bokashi, neck to crown: a warm vermilion band, then blue stepping from pale to deep.
  const MANTLE_EDGES = [0.42, 0.5, 0.6, 0.7, 0.82] as const;
  const MANTLE_A = [VERM[3], BLUES[4], BLUES[3], BLUES[2], BLUES[1], BLUES[0]] as const;
  const MANTLE_B = [VERM[4], BLUES[5], BLUES[4], BLUES[3], BLUES[2], BLUES[1]] as const;
  const HEAD_EDGES = [0.1, 0.22] as const;
  const bodyPaint = paint((p, n, s) => {
    const t = s[0];
    const u = t * Lb;
    const deg = ((s[1] % 360) + 360) % 360;
    const dd = Math.min(deg, 360 - deg);
    const wob = (noise(p, 0.1, 6) - 0.5) * 0.05;
    const grain = streaks(u, deg, 17);
    let c: C;
    if (t < 0.36 && dd > 104) {
      // vermilion underside of the head
      c = over(VERM[3], VERM[2], grain);
    } else if (t < 0.36) {
      // head: pale to mid blue in three flat steps, ringed cream dots on a hex lattice
      const idx = 4 - step(t + wob, HEAD_EDGES);
      c = over(BLUES[idx], BLUES[idx - 1], grain);
      c = ringDot(c, hexDots(u, deg * DEG * 0.32, 0.085), 0.017, 0.0055);
    } else {
      // mantle: seigaiha rows, one bokashi tone per band
      const rank = step(t + wob, MANTLE_EDGES);
      const dx = p.y - mc.y;
      const dz = p.z - mc.z;
      const rr = Math.hypot(dx, dz) / 0.2;
      const side = p.x >= 0 ? 1 : -1;
      if (rr < 1 && Math.abs(n.x) > 0.5) {
        // uzumaki roundel
        c = BLUES[1];
        c = over(c, PAPER, spiralLine(rr, Math.atan2(dx, dz * side)));
        c = over(c, INK, smoothstep(0.9, 0.93, rr));
        if (rr > 0.97) c = MANTLE_A[rank];
      } else if (t > 0.9) {
        // crown cap: the waves pinch to a point up here, so it wears concentric rings instead
        const k = fract((u - 0.9 * Lb) / 0.05);
        c = k < 0.5 ? MANTLE_A[rank] : MANTLE_B[rank];
        c = over(c, PAPER, cover(Math.abs(k - 0.5) * 0.05, 0.0013));
        c = over(c, INK, cover(Math.min(k, 1 - k) * 0.05, 0.0026));
      } else {
        const w = seigaiha(deg / 15, u / 0.1);
        const a = MANTLE_A[rank];
        const bb = MANTLE_B[rank];
        c = w.d > 0.72 ? a : w.d > 0.44 ? bb : a;
        if (w.d < 0.11) c = PAPER;
        c = over(c, PAPER, cover(Math.abs(w.d - 0.72), 0.03) + cover(Math.abs(w.d - 0.44), 0.03));
        c = over(c, INK, smoothstep(0.93, 0.965, w.d));
      }
    }
    // carved collar between head and mantle; the key line where the head's back meets its underside
    c = over(c, INK, cover(Math.abs(u - 0.36 * Lb), 0.0035));
    if (t < 0.36) c = over(c, INK, cover(Math.abs(dd - 104) * DEG * 0.32, 0.0045));
    return washi(c, p);
  });

  const radii = [0.15, 0.3, 0.335, 0.3, 0.35, 0.43, 0.43, 0.37, 0.2];
  const body = b.sweep(bodyPath, radii, {
    bone: [head, mantle, mantleTip],
    color: bodyPaint,
    sides: 12,
    group: "body",
    name: "body",
  });

  // ---- Hanko seal on the crown, back left.
  const sealHit = b.surface(body).around(mc).at(180, 12);
  if (sealHit) {
    b.part(new PlaneGeometry(0.14, 0.14), "#ffffff", {
      bone: mantleTip,
      at: sealHit.at.clone().addScaledVector(sealHit.axis, 0.004),
      dir: sealHit.axis,
      axis: "z",
      texture: SEAL,
      group: "body",
      name: "seal",
    });
  }

  // ---- Eyes with lids.
  const ER = 0.12;
  const world = new Vector3(0, 1, 0);
  for (const [S, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const eyeAt = new Vector3(s * 0.31, 0.58, 0.22);
    const gaze = new Vector3(s * 0.85, 0.3, 0.45).normalize();
    const eyeJ = b.joint(`eye${S}`, { parent: head, at: eyeAt, dir: gaze, group: "eyes" });
    b.part(new SphereGeometry(ER, 24, 16), "#ffffff", {
      bone: eyeJ,
      at: eyeAt,
      dir: gaze,
      up: world,
      texture: EYE,
      group: "eyes",
      name: `eye${S}`,
    });
    const upPerp = world.clone().addScaledVector(gaze, -world.dot(gaze)).normalize();
    const lidPaint = paint((p, _n, sc) => {
      const c = sc[1] < 0.05 ? INK : sc[1] < 0.13 ? VERM[2] : BLUES[3];
      return washi(c, p);
    });
    for (const [name, dir, theta] of [
      [`lidUpper${S}`, upPerp, 64],
      [`lidLower${S}`, upPerp.clone().negate(), 54],
    ] as const) {
      const lid = b.joint(name, { parent: eyeJ, at: eyeAt, dir, up: gaze, role: "hinge", group: "eyes" });
      b.part(new SphereGeometry(ER * 1.07, 12, 4, 0, Math.PI * 2, 0, theta * DEG), lidPaint, {
        bone: lid,
        at: eyeAt,
        dir,
        group: "eyes",
        name,
      });
    }
  }

  // ---- Arms: chains on the head, swept in one painted skin each, suckers on both flanks.
  const cardFrames = new Map<number, { frames: SweepPoint[]; tangents: Vector3[] }>();
  const LEVELS = [0.135, 0.105, 0.08, 0.06, 0.045, 0.034, 0.026];
  for (const a of ARMS) {
    const path = armPathFitted(a);
    const chain = b.chain(`arm${a.side}${a.k}`, path, {
      parent: head,
      count: 8,
      names: (i) => `arm${a.side}${a.k}_${i + 1}`,
      role: "tentacle",
      group: `arm${a.side}${a.k}`,
    });
    const tube = b.sweep(chain, ARM_R, {
      color: armPaint(path.length),
      sides: 10,
      group: `arm${a.side}${a.k}`,
      name: `arm${a.side}${a.k}`,
    });
    let t = 0.06;
    while (t < 0.96) {
      const size = 1.05 * ARM_R(t);
      const lvl = LEVELS.reduce((best, l, i) => (Math.abs(l - size) < Math.abs(LEVELS[best] - size) ? i : best), 0);
      const tc = t - LEVELS[lvl] / 2 / path.length;
      for (const deg of [130, 230]) {
        const f = tube.at(tc, deg);
        const side = f.axis.clone().cross(f.tangent).normalize();
        const drop = (LEVELS[lvl] / 2) * Math.abs(side.y) + LEVELS[lvl] * Math.max(0, -f.tangent.y);
        if (f.at.y - drop < 0.004) continue;
        let entry = cardFrames.get(lvl);
        if (!entry) cardFrames.set(lvl, (entry = { frames: [], tangents: [] }));
        entry.frames.push(f);
        entry.tangents.push(f.tangent.clone());
      }
      t += (LEVELS[lvl] * 1.3) / path.length;
    }
  }
  for (const [lvl, { frames, tangents }] of cardFrames)
    b.cards(frames, SUCKER, {
      size: LEVELS[lvl],
      lean: 90,
      flow: (_f, i) => tangents[i],
      sink: 0,
      group: "suckers",
      name: `suckers${lvl}`,
    });

  return b.root;
}
