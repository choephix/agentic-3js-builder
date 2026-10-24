import * as THREE from "three";
import {
  createBuilder,
  rng,
  offset,
  catmull,
  bezier,
  paint,
  noise,
  cells,
  mix,
  smoothstep,
  resolve,
  svg,
} from "../../../../src/index";
import type { ColorInput, Paint, Rgb, SurfaceCoords } from "../../../../src/index";

export const meta = {
  name: "Knitted Octopus",
  description:
    "Hand-knitted wool amigurumi octopus: stockinette-stitch coral body with peach polka dots, sleepy lidded eyes with bar pupils, felt cheeks, a teal ribbed collar, eight striped tentacles with knitted donut suckers and teal tips, a little bow, a sewn-on heart and a hand-made label.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CORAL = "#f0705f";
const CORAL_D = "#c24a4f";
const STRIPE = "#ff9f86";
const SPOT = "#ffbea4";
const CREAM = "#fff1da";
const LIP = "#ffd2b8";
const TEAL = "#2aa7a1";
const TEAL_D = "#1d7c7e";
const IRIS = "#f6b73c";
const IRIS_D = "#c9781f";
const INKC = "#2b1a28";
const PINK = "#ff9db2";
const WHITE = "#fffaf0";
const MOUTH = "#5a1f2e";

const TAU = Math.PI * 2;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const md = (a: number, m: number) => ((a % m) + m) % m;
const UPV: [number, number, number] = [0, 1, 0];

function h2(a: number, b: number) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// Fresh geometry each time: the builder may bake placement into what it is given.
const sph = () => new THREE.SphereGeometry(1, 12, 8);
const donut = () => new THREE.TorusGeometry(1, 0.42, 5, 10).rotateX(Math.PI / 2);
const dimple = () => new THREE.CylinderGeometry(1, 1, 0.3, 8);

// ---------------------------------------------------------------------------------------------------------------
// Knitting: stockinette V stitches painted from a stitch-space coordinate map.
type Coord = (p: THREE.Vector3, n: THREE.Vector3, s: SurfaceCoords) => [number, number];
type Pick = (row: number, col: number, p: THREE.Vector3, n: THREE.Vector3, s: SurfaceCoords) => ColorInput;

function knit(coord: Coord, pick: Pick, seed = 1): Paint {
  return paint((p, n, s) => {
    const [u, v] = coord(p, n, s);
    const col = Math.floor(u);
    const row = Math.floor(v);
    const fu = u - col;
    const fv = v - row;
    // two strands of a "V": legs meet at the bottom centre and spread upward
    const d = Math.abs(Math.abs(fu - 0.5) - (0.1 + 0.3 * fv));
    const ridge = 1 - smoothstep(0.05, 0.2, d);
    const base = resolve(pick(row, col, p, n, s), p, n);
    const jit = 0.93 + 0.14 * h2(col + seed * 13, row);
    const fuzz = 0.92 + 0.16 * noise(p, 0.012, seed);
    const light = (0.86 + 0.16 * n.y) * jit * fuzz;
    const dark: Rgb = [base[0] * 0.5, base[1] * 0.4, base[2] * 0.5];
    const lit: Rgb = [Math.min(1, base[0] * 1.08), Math.min(1, base[1] * 1.08), Math.min(1, base[2] * 1.08)];
    const c = mix(dark, lit, ridge);
    const hi = d < 0.045 ? 0.06 : 0;
    const out: Rgb = [
      Math.min(1, c[0] * light + hi),
      Math.min(1, c[1] * light + hi),
      Math.min(1, c[2] * light + hi),
    ];
    return out;
  });
}

// ---- body: rows are concentric about the vertical axis (a spiral amigurumi dome), stitch count follows circumference
const BC = V(0, 0.3, -0.03);
const BR = 0.2;
const ROW = 0.0105;
const STW = 0.0125;

function rowInfo(row: number) {
  const phiC = Math.min(Math.max(((row + 0.5) * ROW) / BR, 0.06), Math.PI - 0.06);
  return { phiC, N: Math.max(5, Math.round((TAU * BR * Math.sin(phiC)) / STW)) };
}
const bodyCoord: Coord = (p) => {
  const d = p.clone().sub(BC);
  const R = d.length() || 1e-6;
  const phi = Math.acos(Math.min(1, Math.max(-1, d.y / R)));
  const v = (phi * BR) / ROW;
  const { N } = rowInfo(Math.floor(v));
  const az = Math.atan2(d.x, d.z);
  return [(az / TAU + 0.5) * N, v];
};
const bodyCache = new Map<number, ColorInput>();
const bodyPick: Pick = (row, col) => {
  const key = row * 4096 + col;
  const hit = bodyCache.get(key);
  if (hit) return hit;
  const { phiC, N } = rowInfo(row);
  const az = ((col + 0.5) / N - 0.5) * TAU;
  const q = V(
    BC.x + BR * Math.sin(phiC) * Math.sin(az),
    BC.y + BR * Math.cos(phiC),
    BC.z + BR * Math.sin(phiC) * Math.cos(az),
  );
  let out: ColorInput = CORAL;
  const frontFace = q.z > 0.04 && q.y < 0.4;
  if (phiC < 2.1 && !frontFace) {
    const c = cells(q, 0.075, 5);
    if (c.id > 0.4 && c.d1 < 0.17 + 0.13 * c.id) out = SPOT;
  }
  bodyCache.set(key, out);
  return out;
};
const BODYKNIT = knit(bodyCoord, bodyPick, 1);
const CREAMKNIT = knit(bodyCoord, () => CREAM, 2);
const LIPKNIT = knit(bodyCoord, () => LIP, 3);

// ---- tentacles
const tentRad = (t: number) => 0.011 + 0.041 * Math.pow(1 - t, 1.6);
const tentPaints = new Map<number, Paint>();
function tentPaint(k: number, len: number): Paint {
  let pnt = tentPaints.get(k);
  if (pnt) return pnt;
  const coord: Coord = (_p, _n, s) => {
    const v = (s[0] * len) / ROW;
    const row = Math.floor(v);
    const t = Math.min(1, ((row + 0.5) * ROW) / len);
    const N = Math.max(3, Math.round((TAU * tentRad(t)) / STW));
    const a = md(s[1] / 360, 1);
    return [a * N, v];
  };
  pnt = knit(
    coord,
    (row) => {
      const t = ((row + 0.5) * ROW) / len;
      if (t > 0.82) return TEAL;
      return md(row, 8) >= 6 ? STRIPE : CORAL;
    },
    7 + k,
  );
  tentPaints.set(k, pnt);
  return pnt;
}

// ---- collar band: ribbed teal with cream dashes
const BANDKNIT = knit(
  (_p, _n, s) => [s[0] / 0.009, (s[1] / 360) * 70],
  (row, col) => (md(row, 5) === 0 && md(col, 2) === 0 ? CREAM : TEAL),
  4,
);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const CHEEK = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="35" rx="46" ry="31" fill="#ff93ad"/>
    <ellipse cx="50" cy="35" rx="37" ry="23" fill="none" stroke="#ffd6e0" stroke-width="3.2" stroke-dasharray="7 5" stroke-linecap="round"/>
    <path d="M30 40 l8 -10 M46 44 l8 -10 M62 40 l8 -10" stroke="#ff6f93" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);

const SMILE = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16 Q36 52 60 24 Q84 52 108 16" stroke="${INKC}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M60 4 L60 24" stroke="${INKC}" stroke-width="5" stroke-linecap="round"/>
    <path d="M22 28 l4 5 M40 38 l2 6 M80 38 l-2 6 M98 28 l-4 5" stroke="#6b3a4c" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const HEART = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 90 C8 60 4 30 26 18 C40 12 50 22 50 31 C50 22 60 12 74 18 C96 30 92 60 50 90 Z" fill="#ff6f8f" stroke="#7a2c3a" stroke-width="4" stroke-linejoin="round"/>
    <g transform="translate(10 9) scale(.8)">
      <path d="M50 90 C8 60 4 30 26 18 C40 12 50 22 50 31 C50 22 60 12 74 18 C96 30 92 60 50 90 Z" fill="none" stroke="#ffe2e8" stroke-width="3.4" stroke-dasharray="7 6" stroke-linecap="round"/>
    </g>
    <path d="M30 34 Q34 28 40 30" stroke="#ffc2d0" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const LABEL = svg(
  `<svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="116" height="60" rx="8" fill="#fff1da" stroke="#c9a27a" stroke-width="3"/>
    <rect x="9" y="9" width="102" height="46" rx="5" fill="none" stroke="${TEAL}" stroke-width="2.6" stroke-dasharray="7 5"/>
    <text x="60" y="34" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="23" fill="${TEAL_D}">OCTO</text>
    <text x="60" y="48" text-anchor="middle" font-family="Georgia, serif" font-size="9.5" fill="${CORAL_D}">hand knit - 100% wool</text>
  </svg>`,
  { size: 256 },
);

const FUZZ = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 48 Q14 30 8 8" stroke="#ffffff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M16 48 Q18 28 25 12" stroke="#ffffff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M16 48 Q16 26 18 3" stroke="#ffffff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "octopus", paintSize: 2048 });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.1, 0],
      [0, 0.2, -0.005],
      [0, 0.3, -0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine, at: [0, 0.28, 0.0], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.19, 0.07], aim: [0, 0.185, 0.2], role: "jaw" });

  // ---- body: knitted dome with a flat underside hidden by the collar
  const body = b.sweep(spine, [0.15, 0.185, 0.2, 0.2], {
    color: BODYKNIT,
    sides: 18,
    caps: { start: "flat", end: "round" },
  });
  const skin = b.surface(body);
  const frontHit = (x: number, y: number) => skin.ray([x, y, 1], [0, 0, -1])!;

  // ---- collar band where the tentacles emerge
  b.lathe(
    [
      [0.125, -0.022],
      [0.165, -0.026],
      [0.182, -0.014],
      [0.182, 0.014],
      [0.165, 0.026],
      [0.125, 0.022],
    ],
    { at: [0, 0.125, 0], segments: 28, smoothing: 1, color: BANDKNIT, bone: hips, name: "collar" },
  );

  // ---- eyes: felt eyeball, amber iris, horizontal bar pupil, heavy knitted lid, yarn lashes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = frontHit(s * 0.088, 0.272);
    const nrm = hit.n.clone().normalize();
    const eyeC = offset(hit.at, nrm, 0.006);
    const upV = V(0, 1, 0).addScaledVector(nrm, -nrm.y).normalize();
    const sideV = new THREE.Vector3().crossVectors(upV, nrm).normalize();
    const at = (f: number, u = 0, sd = 0) =>
      eyeC.clone().addScaledVector(nrm, f).addScaledVector(upV, u).addScaledVector(sideV, sd);
    const eye = b.joint(`eye${side}`, { parent: head, at: eyeC, dir: nrm });
    const lid = b.joint(`lid${side}`, { parent: head, at: eyeC, dir: nrm, role: "hinge" });
    const orient = { dir: nrm, axis: "z" as const, up: UPV };

    b.part(sph(), WHITE, { bone: eye, at: eyeC, scale: [0.056, 0.056, 0.056], ...orient, name: `eyeball${side}` });
    b.part(sph(), IRIS_D, { bone: eye, at: at(0.04), scale: [0.046, 0.046, 0.018], ...orient, name: `irisRim${side}` });
    b.part(sph(), IRIS, { bone: eye, at: at(0.044), scale: [0.04, 0.04, 0.02], ...orient, name: `iris${side}` });
    b.part(sph(), INKC, { bone: eye, at: at(0.056), scale: [0.032, 0.017, 0.012], ...orient, name: `pupil${side}` });
    b.part(sph(), WHITE, {
      bone: eye,
      at: at(0.066, 0.012, -s * 0.012),
      scale: [0.0085, 0.0085, 0.0085],
      ...orient,
      name: `shine${side}`,
    });
    b.part(sph(), WHITE, {
      bone: eye,
      at: at(0.064, -0.01, s * 0.014),
      scale: [0.005, 0.005, 0.005],
      ...orient,
      name: `shineSmall${side}`,
    });

    // sleepy lid: a knitted cap, lower toward the outer corner
    const lidGeo = new THREE.SphereGeometry(1, 14, 6, 0, TAU, 0, 1.0).rotateZ(-s * 0.25);
    b.part(lidGeo, BODYKNIT, { bone: lid, at: eyeC, scale: [0.064, 0.064, 0.064], ...orient, name: `lid${side}` });

    // lashes: three embroidered flicks at the outer corner
    for (let i = 0; i < 3; i++) {
      const u = 0.042 - i * 0.012;
      const sd = s * (0.034 + 0.008 * i);
      const f = Math.sqrt(Math.max(0.064 * 0.064 - u * u - sd * sd, 0.0001));
      const base = at(f, u, sd);
      const dir = new THREE.Vector3()
        .addScaledVector(sideV, s * 0.9)
        .addScaledVector(upV, 0.55 - 0.35 * i)
        .addScaledVector(nrm, 0.1);
      b.spike(base, dir, 0.032, 0.0036, { color: INKC, bone: lid, sides: 5, name: `lash${side}${i}` });
    }
  }

  // ---- mouth: plump upper lip, dark gap, small lower jaw on its own joint
  {
    const hu = frontHit(0, 0.208);
    const hg = frontHit(0, 0.185);
    const hl = frontHit(0, 0.166);
    b.part(sph(), MOUTH, {
      bone: head,
      at: offset(hg.at, hg.n, 0.006),
      scale: [0.046, 0.0075, 0.022],
      name: "mouthGap",
    });
    const upper = b.part(sph(), CREAMKNIT, {
      bone: head,
      at: offset(hu.at, hu.n, 0.005),
      scale: [0.052, 0.022, 0.03],
      name: "lipUpper",
    });
    const lower = b.part(sph(), LIPKNIT, {
      bone: jaw,
      at: offset(hl.at, hl.n, 0.008),
      scale: [0.042, 0.018, 0.027],
      name: "lipLower",
    });
    b.decal([upper, lower], SMILE, { at: [0, 0.188, 0.17], dir: [0, 0, 1], size: [0.085, 0.043], name: "smile" });
  }

  // ---- cheeks, heart patch and label
  for (const s of [1, -1]) {
    const h = frontHit(s * 0.125, 0.19);
    b.decal(skin, CHEEK, { at: h, size: [0.065, 0.046], name: s > 0 ? "cheekL" : "cheekR" });
  }
  {
    const hh = skin.around(BC).at(-82, 14)!;
    b.decal(skin, HEART, { at: hh, size: [0.072, 0.072], name: "heartPatch" });
    const hl = skin.around(BC).at(180, -22)!;
    b.decal(skin, LABEL, { at: hl, size: [0.095, 0.05], name: "label" });
  }

  // ---- tentacles: eight, mirrored pairs, curled tips; knitted donut suckers along each
  const RR = [0.09, 0.16, 0.23, 0.3, 0.355, 0.39, 0.385, 0.355];
  const LAT = [0, 0, 0.01, 0.03, 0.065, 0.11, 0.15, 0.17];
  const YY = [0.105, 0.078, 0.036, 0.031, 0.04, 0.065, 0.105, 0.14];
  const LS = [0.85, 0.95, 1.05, 1.12];
  const LSC = [1, 1, 0.9, 0.5];
  const fuzzHits: any[] = [];
  const tentSweeps: any[] = [];

  for (let k = 0; k < 4; k++) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const a = (s * (22.5 + 45 * k) * Math.PI) / 180;
      const d = V(Math.sin(a), 0, Math.cos(a));
      const e = V(Math.cos(a), 0, -Math.sin(a));
      const pts = RR.map((r, i) => {
        const rr = r <= 0.16 ? r : 0.16 + (r - 0.16) * LS[k];
        const lat = s * LAT[i] * LSC[k];
        return V(d.x * rr + e.x * lat, YY[i], d.z * rr + e.z * lat);
      });
      const path = catmull(pts);
      const ch = b.chain(`tent${side}${k}`, path, {
        parent: hips,
        count: 6,
        names: (i: number) => `tent${side}${k}_${i + 1}`,
        role: "tentacle",
      });
      const sw = b.sweep(ch, tentRad, {
        color: tentPaint(k, path.length),
        sides: 10,
        caps: { start: "flat", end: "round" },
        name: `tentacle${side}${k}`,
      });
      tentSweeps.push(sw);

      // suckers in a zig-zag double row
      for (let i = 0; i < 9; i++) {
        const t = 0.22 + i * 0.065;
        const ang = (i % 2 ? 1 : -1) * 50;
        const sp = sw.at(t, ang);
        const r = 0.5 * tentRad(t) + 0.002;
        b.stick(donut(), CREAM, sp, { embed: 0.3, scale: [r, r * 0.75, r] });
        b.stick(dimple(), PINK, sp, { embed: 0.6, scale: [r * 0.62, r * 0.6, r * 0.62] });
      }

      // fuzz away from the teal tip and the hub
      const tip = path.at(1);
      const hs = b.surface(sw).scatter(30, {
        rng: rng(100 + k * 2 + (s > 0 ? 0 : 1)),
        minDist: 0.03,
        filter: (h: any) => h.at.distanceTo(tip) > 0.1 && Math.hypot(h.at.x, h.at.z) > 0.19 && h.n.y > -0.2,
      });
      fuzzHits.push(...hs);
    }
  }

  // ---- wool fuzz
  const bodyFuzz = skin.scatter(220, {
    rng: rng(5),
    minDist: 0.028,
    filter: (h: any) => h.n.y > -0.2 && !(h.at.z > 0.02 && h.at.y > 0.14 && h.at.y < 0.4),
  });
  b.cards(bodyFuzz, FUZZ, {
    size: [0.016, 0.024],
    lean: 65,
    bend: 25,
    vary: 0.4,
    rng: rng(6),
    color: BODYKNIT,
    name: "fuzzBody",
  });
  b.cards(fuzzHits, FUZZ, {
    size: [0.016, 0.024],
    lean: 65,
    bend: 25,
    vary: 0.4,
    rng: rng(8),
    color: CORAL,
    name: "fuzzTentacles",
  });

  // ---- bow on the top left of the head
  {
    const bh = skin.around(BC).at(52, 60)!;
    const bn = bh.n.clone().normalize();
    const A = new THREE.Vector3().crossVectors(bn, V(0, 0, 1));
    if (A.lengthSq() < 1e-4) A.set(1, 0, 0);
    A.normalize();
    const B = new THREE.Vector3().crossVectors(bn, A).normalize();
    const P = offset(bh.at, bn, 0.006);
    const pt = (x: number, y: number, z: number) =>
      P.clone().addScaledVector(A, x).addScaledVector(B, y).addScaledVector(bn, z);
    const loopBase: [number, number][] = [
      [0.006, 0],
      [0.03, 0.022],
      [0.062, 0.027],
      [0.072, 0],
      [0.062, -0.027],
      [0.03, -0.022],
    ];
    for (const g of [1, -1]) {
      const loop = loopBase.map(([x, y], i) => pt(g * x, y, 0.014 + 0.006 * Math.sin((i / 6) * Math.PI)));
      b.sweep(catmull(loop, { closed: true }), 0.0085, { color: TEAL, sides: 6, bone: head, name: "bowLoop" });
      b.sweep(
        bezier(pt(0, 0, 0.01), pt(g * 0.02, -0.03, 0.014), pt(g * 0.045, -0.055, 0.008), pt(g * 0.05, -0.088, 0.004)),
        [0.008, 0.005],
        { color: TEAL, sides: 6, bone: head, name: "bowTail" },
      );
    }
    b.part(sph(), TEAL_D, { bone: head, at: pt(0, 0, 0.013), scale: [0.017, 0.015, 0.015], name: "bowKnot" });
  }

  // ---- loose yarn end at the back
  {
    const th = skin.around(BC).at(212, 18)!;
    const tn = th.n.clone().normalize();
    const p0 = offset(th.at, tn, -0.005);
    const p1 = offset(p0, tn, 0.05);
    const p2 = p1.clone().add(V(0.03, -0.02, -0.03));
    const p3 = p2.clone().add(V(0.012, -0.055, -0.01));
    b.sweep(bezier(p0, p1, p2, p3), [0.0055, 0.0035], { color: CORAL_D, sides: 5, bone: spine.joints[2], name: "yarnTail" });
  }

  return b.root;
}
