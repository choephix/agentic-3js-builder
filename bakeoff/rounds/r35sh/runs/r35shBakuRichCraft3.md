```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  frame,
  limb,
  mix,
  noise,
  paint,
  rgb,
  rng,
  smoothstep,
  stripes,
  svg,
} from "agentic-3js-builder";
import type { ColorInput, DirectionInput, Joint, OutlinePoint, PointInput, Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "baku",
  description:
    "Baku, the dream-eating tapir spirit, as a Japanese woodblock print: Prussian-blue body with a cream wave-patterned saddle, vermilion flame mane, tiger paws, ox tail, elephant trunk and tusks, a shimenawa rope with paper shide, and a glowing dream wisp curling off its trunk.",
};

// ---------------------------------------------------------------- palette (limited, like a block print)
const INK = "#15131f";
const INDIGO = "#1d3b78";
const INDIGO_DK = "#102250";
const INDIGO_LT = "#4f7cc0";
const VERM = "#d93a1e";
const GOLD = "#e9bf45";
const OCHRE = "#d8a03c";
const CREAM = "#f2e6c4";
const IVORY = "#f4ecd6";
const PAPER = "#f8f3e6";
const PALE = "#a9c6e0";
const LINE_BLUE = "#3a5f95";
const ROSE = "#e98a7a";
const LILAC = "#cbbcf5";
const STRAW = "#e6d291";
const STRAW_DK = "#a98a4c";

type V = [number, number, number];
const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const zig = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// seigaiha (blue ocean waves): returns distance from the owning arc's centre, 0..1 (1 = outside)
function seigaiha(u: number, v: number, R: number) {
  const rowH = R * 0.5;
  const j0 = Math.floor(v / rowH);
  let best = Infinity;
  let bd = 1;
  for (let j = j0 - 2; j <= j0 + 2; j++) {
    const cy = j * rowH;
    const off = (((j % 2) + 2) % 2) * R;
    const cx = Math.round((u - off) / (2 * R)) * 2 * R + off;
    const d = Math.hypot(u - cx, v - cy);
    if (d < R && cy < best) {
      best = cy;
      bd = d / R;
    }
  }
  return bd;
}

// paper fibre: a faint mottling every woodblock print has
const paperGrain = (p: THREE.Vector3) => 0.93 + 0.12 * noise(p, 0.018, 11);
const washi = (fn: (p: THREE.Vector3, n: THREE.Vector3) => string | Rgb) =>
  paint((p, n) => {
    const c = rgb(fn(p, n));
    const g = paperGrain(p);
    return [Math.min(c[0] * g, 1), Math.min(c[1] * g, 1), Math.min(c[2] * g, 1)] as Rgb;
  });

// bokashi gradation: dark indigo on top fading to lighter blue below, with faint brush streaks
const blueAt = (p: THREE.Vector3, n: THREE.Vector3): Rgb => {
  let c = mix(INDIGO_LT, INDIGO, smoothstep(-0.7, 0.8, n.y));
  c = mix(c, INDIGO_DK, 0.55 * smoothstep(0.7, 1, n.y));
  const streak = noise(V3(p.x * 5, p.y * 5, p.z), 0.06, 4);
  return mix(c, INDIGO_DK, 0.28 * smoothstep(0.55, 0.8, streak));
};

const bodyPaint = washi((p, n) => {
  const zf = 0.3 + 0.05 * zig(p.y / 0.11);
  const zr = -0.6 + 0.05 * zig(p.y / 0.11 + 0.5);
  const edge = Math.min(zf - p.z, p.z - zr);
  if (edge > 0) {
    if (edge < 0.008) return INK;
    if (edge < 0.02) return VERM;
    if (edge < 0.026) return INK;
    if (n.y < -0.55) return CREAM;
    const v = Math.abs(n.y) > 0.6 ? p.x + 1 : p.y;
    const d = seigaiha(p.z, v, 0.06);
    const k = d * 4;
    const band = Math.floor(k);
    const f = k - band;
    if (d > 0.97 || f < 0.1) return LINE_BLUE;
    return band % 2 ? PALE : CREAM;
  }
  return blueAt(p, n);
});

const headPaint = washi((p, n) => {
  const lip = 1.36 + 0.03 * zig(p.x / 0.05);
  if (p.z > lip) return p.z < lip + 0.008 ? INK : CREAM;
  if (p.z > lip - 0.008) return INK;
  return blueAt(p, n);
});

const pawStripes = stripes(OCHRE, INK, { size: 0.05, axis: "y", width: 0.38, wobble: 0.3, seed: 3 });
const pawTop = stripes(OCHRE, INK, { size: 0.045, axis: "z", width: 0.38, wobble: 0.3, seed: 5 });
const legUpper = washi(blueAt);
const legPaint = paint((p) => {
  const edge = 0.3 + 0.03 * zig(p.x / 0.04 + p.z / 0.04);
  if (Math.abs(p.y - edge) < 0.006) return INK;
  return p.y < edge ? pawStripes : legUpper;
});

const trunkPaint = paint((p, n, s) => {
  const t = s[0];
  const g = paperGrain(p);
  let c: Rgb;
  if (t > 0.9) c = rgb(CREAM);
  else if ([0.3, 0.5, 0.7].some((r) => Math.abs(t - r) < 0.018)) c = rgb(GOLD);
  else if (((t * 24) % 1) < 0.07) c = rgb(INDIGO_DK);
  else c = mix(INDIGO_LT, INDIGO, smoothstep(-0.6, 0.8, n.y));
  return [Math.min(c[0] * g, 1), Math.min(c[1] * g, 1), Math.min(c[2] * g, 1)] as Rgb;
});

const tailPaint = paint((p, n, s) => {
  const g = paperGrain(p);
  const ring = [0.25, 0.5, 0.75].some((r) => Math.abs(s[0] - r) < 0.03);
  const c = ring ? rgb(GOLD) : mix(INDIGO_LT, INDIGO_DK, smoothstep(-0.6, 0.8, n.y));
  return [c[0] * g, c[1] * g, c[2] * g] as Rgb;
});

// twisted straw rope
const ropePaint = paint((_p, _n, s) => {
  const f = (((s[1] / 360 + s[0] * 34) % 1) + 1) % 1;
  return f < 0.5 ? STRAW : STRAW_DK;
});

// ---------------------------------------------------------------- outlines
const FLAME: OutlinePoint[] = [
  [-0.18, 0, "sharp"],
  [0.28, 0, "sharp"],
  [0.45, 0.3],
  [0.75, 0.7],
  [1.05, 1, "sharp"],
  [0.55, 0.82],
  [0.2, 0.6],
  [0.0, 0.3],
];

const SHIDE: OutlinePoint[] = [
  [0.03, 0, "sharp"],
  [0.03, -0.04, "sharp"],
  [0.0, -0.07, "sharp"],
  [0.03, -0.1, "sharp"],
  [0.0, -0.13, "sharp"],
  [0.03, -0.16, "sharp"],
  [0.0, -0.19, "sharp"],
  [-0.05, -0.19, "sharp"],
  [-0.02, -0.16, "sharp"],
  [-0.05, -0.13, "sharp"],
  [-0.02, -0.1, "sharp"],
  [-0.05, -0.07, "sharp"],
  [-0.02, -0.04, "sharp"],
  [-0.02, 0, "sharp"],
];

const scaleOutline = (o: OutlinePoint[], k: number): OutlinePoint[] =>
  o.map((q): OutlinePoint => (q.length === 3 ? [q[0] * k, q[1] * k, "sharp"] : [q[0] * k, q[1] * k]));

const growOutline = (o: OutlinePoint[], g: number): OutlinePoint[] => {
  const cx = o.reduce((a, q) => a + q[0], 0) / o.length;
  const cy = o.reduce((a, q) => a + q[1], 0) / o.length;
  return o.map(
    (q): OutlinePoint =>
      q.length === 3
        ? [cx + (q[0] - cx) * g, cy + (q[1] - cy) * g, "sharp"]
        : [cx + (q[0] - cx) * g, cy + (q[1] - cy) * g],
  );
};

const ellipse = (rx: number, ry: number, cy: number, n = 16): OutlinePoint[] =>
  Array.from({ length: n }, (_, i): OutlinePoint => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });

const capOf = (rx: number, ry: number, cy: number, yc: number, n = 8): OutlinePoint[] => {
  const s0 = Math.asin((yc - cy) / ry);
  return Array.from({ length: n + 1 }, (_, i): OutlinePoint => {
    const a = s0 + ((Math.PI - 2 * s0) * i) / n;
    return [Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });
};

export default function build() {
  const b = createBuilder({ name: "baku", paintSize: 2048 });

  // ------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="s"><path d="M18 56 Q56 26 98 44 Q62 76 18 56Z"/></clipPath></defs>
      <path d="M4 62 Q10 6 116 2 Q84 24 66 22 Q34 28 22 64Z" fill="${VERM}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M10 56 Q55 14 108 44 Q64 86 10 56Z" fill="${INK}"/>
      <path d="M18 56 Q56 26 98 44 Q62 76 18 56Z" fill="#f6edd0"/>
      <g clip-path="url(#s)">
        <circle cx="58" cy="51" r="21" fill="${GOLD}"/>
        <circle cx="58" cy="51" r="21" fill="none" stroke="${VERM}" stroke-width="4"/>
        <circle cx="58" cy="51" r="9" fill="${INK}"/>
        <circle cx="51" cy="44" r="4.5" fill="#ffffff"/>
      </g>
      <path d="M12 57 Q55 18 110 42" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M104 40 L119 30" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const CLOUD = svg(
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 64 C4 50 16 38 30 43 C32 22 58 16 68 31 C80 16 104 24 101 45 C116 44 117 64 106 68 Z" fill="${VERM}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M34 56 C34 46 48 46 48 54 C48 60 40 60 40 54" stroke="${GOLD}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M70 54 C70 42 86 42 86 52 C86 58 78 58 78 52" stroke="${GOLD}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M16 74 Q40 62 60 74 T106 74" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 320 },
  );

  const SEAL = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="3" fill="${VERM}"/>
      <path d="M10 10 H30 M20 10 V30 M10 20 H30 M10 30 H30" stroke="#f8f3e6" stroke-width="3.6" fill="none" stroke-linecap="square"/>
    </svg>`,
    { size: 128 },
  );

  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><mask id="m"><rect width="100" height="100" fill="#ffffff"/><circle cx="60" cy="42" r="22" fill="#000000"/></mask></defs>
      <circle cx="50" cy="50" r="47" fill="${INK}"/>
      <circle cx="50" cy="50" r="42" fill="${GOLD}"/>
      <circle cx="50" cy="50" r="34" fill="${INDIGO_DK}"/>
      <circle cx="48" cy="52" r="24" fill="${CREAM}" mask="url(#m)"/>
      <path d="M72 62 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3z" fill="${VERM}"/>
      <path d="M70 30 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" fill="${GOLD}"/>
    </svg>`,
    { size: 256 },
  );

  const STAR = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 0 Q23 17 40 20 Q23 23 20 40 Q17 23 0 20 Q17 17 20 0Z" fill="#ffe28a"/></svg>`,
    { size: 96 },
  );

  // grey hair lock: tinted by the card colour, ink lines stay dark
  const TUFT = svg(
    `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 88 C4 60 14 30 36 3 C32 30 37 60 34 88 Z" fill="#ffffff" stroke="#2a2a2a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M16 84 C16 60 22 38 32 14" stroke="#8a8a8a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M24 86 C26 64 30 44 34 26" stroke="#8a8a8a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------ helpers
  const plate = (
    o: OutlinePoint[],
    at: PointInput,
    x: DirectionInput,
    y: DirectionInput,
    t: number,
    fill: ColorInput,
    extra: { gr?: number; smoothing?: number; bone?: Joint } = {},
  ) => {
    const smoothing = extra.smoothing ?? 0;
    b.extrude(growOutline(o, extra.gr ?? 1.15), { at, x, y, thickness: t * 0.8, color: INK, smoothing, bone: extra.bone });
    return b.extrude(o, { at, x, y, thickness: t, color: fill, smoothing, bone: extra.bone });
  };

  const flameBlade = (at: PointInput, k: number, tilt: number, fill: string, inner: string) => {
    const x: DirectionInput = [0, 0, -1];
    const y: DirectionInput = [tilt, 1, 0];
    plate(scaleOutline(FLAME, k), at, x, y, 0.03, fill, { smoothing: 1 });
    b.extrude(scaleOutline(FLAME, k * 0.55), { at, x, y, thickness: 0.036, color: inner, smoothing: 1 });
  };

  // ------------------------------------------------------------ skeleton
  const bodyPts: V[] = [
    [0, 0.76, -0.95],
    [0, 0.83, -0.65],
    [0, 0.85, -0.3],
    [0, 0.83, 0.1],
    [0, 0.85, 0.45],
    [0, 0.87, 0.75],
    [0, 0.84, 0.95],
  ];
  const body = catmull(bodyPts);
  const pelvisT = body.closestT(V3(0, 0.85, -0.3));
  const shoulderT = body.closestT(V3(0, 0.85, 0.45));
  const hips = b.joint("hips", { at: body.at(pelvisT) });
  const rump = b.chain("rump", body.slice(pelvisT, 0), { parent: hips, count: 3, role: "spine" });
  const spine = b.chain("spine", body.slice(pelvisT, shoulderT), { parent: hips, count: 4, role: "spine" });
  const neck = b.chain("neck", body.slice(shoulderT, 1), { parent: spine, count: 3, role: "neck" });
  const head = b.joint("head", { parent: neck, at: body.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.65, 1.0], aim: [0, 0.63, 1.3], role: "jaw" });

  const trunkPts: V[] = [
    [0, 0.79, 1.42],
    [0, 0.74, 1.58],
    [0, 0.64, 1.7],
    [0, 0.52, 1.74],
    [0, 0.45, 1.82],
    [0, 0.47, 1.92],
  ];
  const trunk = b.chain("trunk", catmull(trunkPts), { parent: head, count: 5, role: "tentacle" });
  const trunkTip = trunk.joints[trunk.joints.length - 1];

  const tailPts: V[] = [
    [0, 0.76, -0.95],
    [0, 0.78, -1.15],
    [0, 0.68, -1.3],
    [0, 0.52, -1.34],
    [0, 0.38, -1.3],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: rump, count: 4, role: "tail" });

  // ------------------------------------------------------------ body
  const bodyKeys = bodyPts.map((p) => body.closestT(V3(p[0], p[1], p[2])));
  const BODY_R: [number, number][] = [
    [0.15, 0.17],
    [0.27, 0.29],
    [0.31, 0.32],
    [0.3, 0.31],
    [0.29, 0.3],
    [0.23, 0.25],
    [0.17, 0.19],
  ];
  const bodyRadius = (t: number): [number, number] => {
    let i = 0;
    while (i < bodyKeys.length - 2 && t > bodyKeys[i + 1]) i++;
    const k = smoothstep(bodyKeys[i], bodyKeys[i + 1], t);
    const a = BODY_R[i];
    const c = BODY_R[i + 1];
    return [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k];
  };
  const bodySw = b.sweep(body, bodyRadius, {
    bone: [rump, hips, spine, neck],
    color: bodyPaint,
    shift: [0, -0.02],
    sides: 10,
  });
  const bodySurf = b.surface(bodySw);

  const sideHit = (s: number, y: number, z: number) => bodySurf.ray([s * 2, y, z], [-s, 0, 0]);

  // cloud scrolls, a vermilion seal on the left haunch
  for (const s of [1, -1]) {
    const hc = sideHit(s, 0.9, -0.78);
    if (hc) b.decal(bodySw, CLOUD, { at: hc, size: [0.34, 0.23], segments: 12, mirror: s < 0 });
    const sh = sideHit(s, 0.9, 0.58);
    if (sh) b.decal(bodySw, CLOUD, { at: sh, size: [0.28, 0.19], segments: 12, mirror: s < 0, roll: s * 8 });
  }
  const sealHit = sideHit(1, 0.66, -0.88);
  if (sealHit) b.decal(bodySw, SEAL, { at: sealHit, size: [0.07, 0.07], segments: 6 });

  // ------------------------------------------------------------ head
  const skull = b.loft(
    [
      { at: [0, 0.88, 0.86], w: 0.42, h: 0.44 },
      { at: [0, 0.88, 1.04], w: 0.4, h: 0.42 },
      { at: [0, 0.84, 1.22], w: 0.3, h: 0.32 },
      { at: [0, 0.8, 1.38], w: 0.22, h: 0.24 },
      { at: [0, 0.78, 1.46], w: 0.18, h: 0.2 },
    ],
    { bone: head, color: headPaint },
  );
  const hs = b.surface(skull);

  b.frustumBox([0, 0.63, 1.0], [0, 0.62, 1.32], [0.26, 0.08], [0.14, 0.06], { bone: jaw, color: CREAM });

  // trunk
  const trunkSw = b.sweep(trunk, (t: number) => 0.088 - 0.05 * t, { color: trunkPaint, sides: 8 });
  for (const s of [1, -1]) {
    const nh = b.surface(trunkSw).ray([s * 0.022, 0.475, 2.3], [0, 0, -1]);
    if (nh) b.stick(new THREE.SphereGeometry(0.012, 6, 4), INK, nh, { embed: 0.4, bone: trunkTip });
  }

  // eyes, brows and kumadori cheek stripes
  for (const s of [1, -1]) {
    const eh = hs.ray([s * 1, 0.93, 1.12], [-s, 0, 0]);
    if (eh) b.decal(skull, EYE, { at: eh, dir: [s * 0.85, 0.1, 0.5], size: [0.17, 0.128], segments: 12, mirror: s < 0 });

    const brow = catmull([V3(s * 0.12, 1.0, 1.26), V3(s * 0.17, 1.055, 1.13), V3(s * 0.185, 1.06, 1.0), V3(s * 0.17, 1.02, 0.9)]);
    b.sweep(hs.drape(brow, { lift: 0.012 }), [0.008, 0.022, 0.016, 0.004], { color: INK, sides: 6, bone: head });
    b.sweep(hs.drape(brow, { lift: 0.02 }), [0.004, 0.011, 0.008, 0.002], { color: VERM, sides: 6, bone: head });

    for (const k of [0, 1]) {
      const stripe = catmull([
        V3(s * 0.17, 0.83 - k * 0.04, 1.22 - k * 0.04),
        V3(s * 0.2, 0.78 - k * 0.04, 1.1 - k * 0.04),
        V3(s * 0.19, 0.74 - k * 0.04, 0.96 - k * 0.04),
      ]);
      b.sweep(hs.drape(stripe, { lift: 0.01 }), [0.014, 0.004], { color: k ? INK : VERM, sides: 5, bone: head });
    }

    // tusks
    const th = hs.ray([s * 1, 0.76, 1.3], [-s, 0, 0]);
    if (th) {
      const p0 = th.at.clone().addScaledVector(th.n, -0.03);
      const ctrl = p0.clone().add(V3(s * 0.12, -0.07, 0.0));
      const end = p0.clone().add(V3(s * 0.13, -0.17, 0.14));
      b.sweep(bezier(p0, ctrl, end), [0.03, 0.004], { bone: head, color: IVORY, sides: 6, caps: { start: "flat", end: "point" } });
    }
  }

  // forehead emblem: gold roundel with a crescent moon
  const topHit = hs.ray([0, 2, 1.18], [0, -1, 0]);
  if (topHit) b.decal(skull, EMBLEM, { at: topHit, up: [0, 0, 1], size: [0.13, 0.13], segments: 10 });

  // forelock flames
  [0.84, 0.96, 1.08].forEach((z, i) => {
    const h = hs.ray([0, 2, z], [0, -1, 0]);
    if (h) flameBlade(h, 0.2 - i * 0.02, 0, i === 1 ? GOLD : VERM, i === 1 ? VERM : GOLD);
  });

  // cheek ruff and beard
  const ruff = hs.scatter(30, {
    rng: rng(3),
    minDist: 0.05,
    filter: (h) => Math.abs(h.at.x) > 0.13 && h.at.z > 0.88 && h.at.z < 1.12 && h.at.y < 0.86 && h.at.y > 0.72,
  });
  b.cards(ruff, TUFT, { size: [0.08, 0.17], lean: 60, flow: [0, -0.2, -1], bend: 20, vary: 0.25, rng: rng(4), color: VERM });
  b.cards(
    [-0.06, -0.02, 0.02, 0.06].map((x, i) => frame([x, 0.6, 1.14 - Math.abs(x) * 1.5 - i * 0.0], [0, 1, 0])),
    TUFT,
    { size: [0.06, 0.16], lean: 170, flow: [0, 0, 1], cross: true, color: CREAM, bone: jaw },
  );

  // ears: round, indigo, cream-tipped
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base = V3(s * 0.15, 1.04, 0.9);
    const ear = b.joint(`ear${side}`, { parent: head, at: base, dir: [s * 0.5, 1, -0.2], role: "hinge" });
    const ex: DirectionInput = [s * 0.7, 0, -0.7];
    const ey: DirectionInput = [s * 0.35, 1, 0];
    plate(ellipse(0.075, 0.115, 0.115), base, ex, ey, 0.024, INDIGO, { bone: ear });
    b.extrude(ellipse(0.04, 0.065, 0.095), { at: base, x: ex, y: ey, thickness: 0.03, color: ROSE, bone: ear });
    b.extrude(capOf(0.075, 0.115, 0.115, 0.168), { at: base, x: ex, y: ey, thickness: 0.03, color: CREAM, bone: ear });
  }

  // ------------------------------------------------------------ legs and paws
  const pawBuild = (bone: Joint, x: number, z: number, toes: number[]) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), pawTop, {
      bone,
      at: [x, 0.075, z + 0.05],
      scale: [0.105, 0.078, 0.14],
      flat: true,
    });
    toes.forEach((off) => {
      const zt = z + 0.15 - 0.45 * Math.abs(off);
      b.part(new THREE.SphereGeometry(1, 6, 4), OCHRE, {
        bone,
        at: [x + off, 0.032, zt],
        scale: [0.028, 0.027, 0.04],
        flat: true,
      });
      b.spike([x + off, 0.03, zt + 0.03], [0, -0.25, 1], 0.06, 0.012, { bone, color: IVORY, sides: 5 });
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.2;

    const fp = limb([x, 0.72, 0.42], [x, 0.1, 0.47], [0.34, 0.32], [[0, 0, -1]]);
    const fleg = b.chain(`legF${side}`, fp, {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [x, 0, 0.5],
    });
    b.sweep(fleg, (t: number) => 0.115 - 0.055 * t, { color: legPaint, sides: 8 });
    pawBuild(fleg.tip ?? fleg.joints[fleg.joints.length - 1], x, 0.47, [-0.07, -0.024, 0.024, 0.07]);

    const hp = limb(
      [x, 0.74, -0.6],
      [x, 0.1, -0.62],
      [0.3, 0.3, 0.14],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hleg = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
      contact: [x, 0, -0.58],
    });
    b.sweep(hleg, (t: number) => 0.06 + 0.07 * (1 - t) * (1 - t), { color: legPaint, sides: 8 });
    pawBuild(hleg.tip ?? hleg.joints[hleg.joints.length - 1], x, -0.62, [-0.05, 0, 0.05]);
  }

  // ------------------------------------------------------------ tail (ox tail with tuft)
  b.sweep(tail, (t: number) => 0.05 - 0.02 * t, { color: tailPaint, sides: 6 });
  const tailTipJoint = tail.joints[tail.joints.length - 1];
  const tuftFrames = (r: number, y: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return frame([Math.cos(a) * r, y, -1.3 + Math.sin(a) * r], [0, 1, 0]);
    });
  const tuftFlow = (_f: unknown, i: number): DirectionInput => {
    const a = (i / 6) * Math.PI * 2;
    return [Math.cos(a), -0.2, Math.sin(a)];
  };
  b.cards(tuftFrames(0.02, 0.4), TUFT, { size: [0.11, 0.26], lean: 150, flow: tuftFlow, bend: 20, vary: 0.2, rng: rng(5), color: VERM, bone: tailTipJoint });
  b.cards(tuftFrames(0.015, 0.39), TUFT, { size: [0.08, 0.18], lean: 140, flow: tuftFlow, bend: 20, vary: 0.2, rng: rng(6), color: GOLD, bone: tailTipJoint });

  // ------------------------------------------------------------ mane: flame blades along the spine
  const maneFrom = 0.3;
  const maneTo = 0.95;
  for (let i = 0; i < 16; i++) {
    const t = maneFrom + ((maneTo - maneFrom) * (i + 0.5)) / 16;
    flameBlade(bodySw.at(t), 0.13 + 0.17 * smoothstep(0.3, 0.95, t), 0, VERM, GOLD);
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 12; i++) {
      const t = maneFrom + 0.05 + ((maneTo - maneFrom - 0.05) * (i + 0.5)) / 12;
      flameBlade(bodySw.at(t, s * 42), 0.09 + 0.12 * smoothstep(0.3, 0.95, t), s * 0.6, ROSE, CREAM);
    }
  }

  // ------------------------------------------------------------ shimenawa rope, shide and bell
  const ropeLoop = bodySurf.loop(neck.joints[1], { lift: 0.035 });
  b.sweep(ropeLoop, 0.03, { color: ropePaint, sides: 6 });
  let cy = 0;
  let low = ropeLoop.at(0);
  for (let i = 0; i < 32; i++) {
    const q = ropeLoop.at(i / 32);
    cy += q.y / 32;
    if (q.y < low.y) low = q;
  }
  const NSHIDE = 14;
  for (let i = 0; i < NSHIDE; i++) {
    const t = (i + 0.5) / NSHIDE;
    const q = ropeLoop.at(t);
    if (q.y > cy - 0.04) continue;
    plate(SHIDE, q, ropeLoop.tangentAt(t), [0, 1, 0], 0.006, PAPER, { gr: 1.25 });
  }
  b.part(new THREE.SphereGeometry(0.045, 8, 6), GOLD, { at: low.clone().add(V3(0, -0.07, 0)), flat: true });
  b.part(new THREE.BoxGeometry(0.05, 0.008, 0.008), INK, { at: low.clone().add(V3(0, -0.085, 0.04)) });
  b.rod(low, low.clone().add(V3(0, -0.04, 0)), 0.006, { color: VERM, sides: 5 });

  // ------------------------------------------------------------ dream wisp curling off the trunk
  const swirl = catmull([
    V3(0, 0.47, 1.93),
    V3(0.14, 0.58, 2.08),
    V3(0.02, 0.8, 2.15),
    V3(-0.14, 1.0, 2.05),
    V3(0, 1.22, 1.9),
    V3(0.1, 1.4, 1.78),
  ]);
  glow(b.sweep(swirl, [0.03, 0.006], { bone: trunkTip, color: LILAC, sides: 6 }), 0.9);
  [
    { t: 0.3, c: GOLD },
    { t: 0.55, c: PALE },
    { t: 0.8, c: ROSE },
  ].forEach(({ t, c }) => {
    glow(b.part(new THREE.IcosahedronGeometry(0.045, 0), c, { bone: trunkTip, at: swirl.at(t), flat: true }), 1.2);
  });
  const sparkles = [0.18, 0.42, 0.68, 0.92].map((t) => {
    const q = swirl.at(t);
    return frame(q.clone().add(V3(0.07 * (t > 0.5 ? -1 : 1), -0.04, 0.02)), [0, 1, 0]);
  });
  glow(b.cards(sparkles, STAR, { size: 0.08, sink: 0, bone: trunkTip }), 1.3);

  return b.root;
}
```