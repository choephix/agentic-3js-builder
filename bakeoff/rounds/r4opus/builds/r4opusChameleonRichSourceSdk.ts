import * as THREE from "three";
import {
  createBuilder,
  paint,
  rgb,
  mix,
  smoothstep,
  noise,
  cells,
  catmull,
  bezier,
  spiral,
  polyline,
  svg,
  frame,
  rng,
} from "../../../../src/index";
import type { Rgb } from "../../../../src/index";

export const meta = {
  name: "Panther Chameleon on a Twig",
  description:
    "A stylized low-poly panther chameleon gripping a propped twig with mitten feet: turquoise head fading through lime to a sunset-orange coiled tail, white lateral stripe, magenta-red bars, ridged casque and independently aimed turret eyes.",
};

type V = [number, number, number];
const D2R = Math.PI / 180;
const TY = 0.15; // twig centreline height
const twigR = (t: number) => 0.0138 - 0.0062 * t;
const twigRz = (z: number) => twigR((z + 0.34) / 0.67);

// ---------- colour helpers ----------
const STOPS: ReadonlyArray<readonly [number, string]> = [
  [0, "#14c4cf"],
  [0.2, "#29d4ae"],
  [0.4, "#8fd92c"],
  [0.58, "#e3cf2a"],
  [0.76, "#ff8a26"],
  [1, "#e9452a"],
];
function hue(u: number): Rgb {
  const x = Math.min(Math.max(u, 0), 1);
  for (let k = 0; k < STOPS.length - 1; k++) {
    const [a, ca] = STOPS[k];
    const [bb, cb] = STOPS[k + 1];
    if (x <= bb) return mix(ca, cb, (x - a) / (bb - a));
  }
  return rgb(STOPS[STOPS.length - 1][1]);
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const shade = (c: Rgb, k: number): Rgb => [clamp01(c[0] * k), clamp01(c[1] * k), clamp01(c[2] * k)];
const uZ = (z: number) => clamp01((0.6 * (0.157 - z)) / 0.232);
const sym = (deg: number) => {
  const d = ((deg % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
};
const barCol = (u: number) => mix("#d6264e", "#8c1730", smoothstep(0.35, 0.9, u));

// ---------- paints ----------
const bodyPaint = paint((p, _n, s) => {
  const u = uZ(p.z);
  const a = sym(s[1]);
  let c = shade(hue(u), 0.88 + 0.22 * noise(p, 0.01, 4));
  const sp = cells(p, 0.0055, 11);
  if (sp.d1 < 0.17 && sp.id > 0.62) c = mix(c, "#fff8d8", 0.5);
  c = mix(c, shade(c, 0.74), smoothstep(32, 6, a));
  const wob = 0.006 * (noise(p, 0.018, 7) - 0.5);
  const f = (p.z + wob + 1) / 0.027;
  const d = Math.abs(f - Math.round(f));
  const bw = 0.17 * smoothstep(14, 40, a) * smoothstep(114, 96, a) * (0.7 + 0.5 * noise(p, 0.01, 8));
  if (bw > 0.02) c = mix(c, barCol(u), smoothstep(bw + 0.035, bw - 0.035, d));
  const a0 = 121 + 5 * Math.sin(p.z * 150) + 8 * (noise(p, 0.02, 9) - 0.5);
  const half = 6.5;
  if (a > a0 + half) c = mix(c, "#eef6d6", 0.22 + 0.5 * smoothstep(148, 172, a));
  c = mix(c, "#f7faee", smoothstep(half + 1.8, half - 1.8, Math.abs(a - a0)));
  return c;
});

const tailPaint = paint((p, _n, s) => {
  const t = s[0];
  const u = 0.6 + 0.4 * t;
  let c = shade(hue(u), 0.88 + 0.22 * noise(p, 0.008, 5));
  const sp = cells(p, 0.005, 12);
  if (sp.d1 < 0.17 && sp.id > 0.65) c = mix(c, "#fff1c8", 0.45);
  const f = t / 0.075 + 0.25 * (noise(p, 0.012, 14) - 0.5);
  const d = Math.abs(f - Math.round(f));
  c = mix(c, barCol(u), 0.9 * smoothstep(0.2, 0.13, d) * smoothstep(0.02, 0.06, t));
  return c;
});

const limbPaint = paint((p) => {
  let c = shade(hue(uZ(p.z) + 0.05), 0.82 + 0.22 * noise(p, 0.006, 31));
  const cl = cells(p, 0.005, 33);
  if (cl.d1 < 0.2 && cl.id > 0.55) c = mix(c, "#fff6d0", 0.45);
  return c;
});

const headPaint = paint((p, _n, s) => {
  const a = sym(s[1]);
  let c = shade(hue(uZ(p.z)), 0.9 + 0.18 * noise(p, 0.007, 61));
  if (a > 55 && a < 125 && p.z > 0.088 && p.z < 0.145) {
    const f = (p.z + (p.y - 0.226) * 0.9) / 0.011;
    const d = Math.abs(f - Math.round(f));
    c = mix(c, "#ff6f3c", smoothstep(0.2, 0.12, d) * 0.85);
  }
  c = mix(c, "#f5f8ea", smoothstep(118, 132, a));
  return c;
});

const jawPaint = paint((p, _n, s) => {
  const a = sym(s[1]);
  const base = shade(hue(0.04), 1.05);
  let c: Rgb = mix("#f5f8ea", base, smoothstep(95, 135, a));
  if (a > 140) {
    const fr = (((p.x / 0.0045) % 1) + 1) % 1;
    c = mix(c, "#f5f8ea", smoothstep(0.18, 0.1, Math.abs(fr - 0.5)) * 0.8);
  }
  return shade(c, 0.93 + 0.12 * noise(p, 0.006, 51));
});

const casquePaint = paint((p, _n, s) => {
  let c = shade(hue(uZ(p.z) * 0.8), 0.9 + 0.15 * noise(p, 0.006, 71));
  const fr = (((s[1] / 0.0042) % 1) + 1) % 1;
  const dark = smoothstep(0.38, 0.47, Math.abs(fr - 0.5));
  c = shade(c, 1 - 0.22 * dark);
  c = mix(c, "#ff8f3d", 0.75 * smoothstep(0.252, 0.268, p.y));
  return c;
});

const eyePaint = paint((p, _n, s) => {
  const h = s[0];
  const deg = ((s[1] % 360) + 360) % 360;
  const ray = Math.floor(deg / 22.5) % 2 === 0;
  let c: Rgb = ray ? rgb("#ff7d33") : rgb("#25c9b8");
  if (h > 0.0075) c = mix(c, "#f7e36a", 0.6);
  if (h < -0.004) c = rgb("#22c2b8");
  return shade(c, 0.9 + 0.15 * noise(p, 0.003, 41));
});

function barkPaint(axis: THREE.Vector3, ends: boolean) {
  const ax = axis.clone().normalize();
  const q = new THREE.Vector3();
  return paint((p, n) => {
    if (ends && Math.abs(n.dot(ax)) > 0.85) {
      return mix("#d9b27a", "#b0814f", smoothstep(0.4, 0.6, noise(p, 0.003, 21)));
    }
    q.copy(p).addScaledVector(ax, -0.88 * p.dot(ax));
    const g = noise(q, 0.0035, 13);
    let c = mix("#4f3322", "#7b583a", smoothstep(0.3, 0.7, g));
    c = shade(c, 0.85 + 0.3 * noise(p, 0.02, 15));
    const l = noise(p, 0.028, 17);
    if (l > 0.6) c = mix(c, mix("#9cae74", "#d0d49a", noise(p, 0.006, 19)), smoothstep(0.6, 0.66, l));
    return c;
  });
}

const leafSvg = (fill: string, shadeCol: string, vein: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
<path d="M32 127 C31 112 5 94 5 60 C5 30 21 9 32 1 C43 9 59 30 59 60 C59 94 33 112 32 127 Z" fill="${fill}"/>
<path d="M32 1 C43 9 59 30 59 60 C59 94 33 112 32 127 Z" fill="${shadeCol}"/>
<path d="M32 124 L32 8" stroke="${vein}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M32 96 L15 80 M32 76 L11 58 M32 56 L15 38 M32 96 L49 80 M32 76 L53 58 M32 56 L49 38" stroke="${vein}" stroke-width="1.4" fill="none" opacity="0.85" stroke-linecap="round"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "pantherChameleon", paintSize: 1024 });

  // ---------- skeleton ----------
  b.joint("base", { at: [0, 0, 0] });
  b.joint("pelvis", { at: [0, 0.212, -0.06], parent: "base", dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.212, -0.06],
      [0, 0.218, -0.01],
      [0, 0.222, 0.04],
      [0, 0.226, 0.07],
    ]),
    { parent: "pelvis", role: "spine" },
  );
  b.joint("neck", { at: [0, 0.226, 0.07], parent: "spine3", dir: [0, 0.1, 1], role: "neck" });
  b.joint("head", { at: [0, 0.229, 0.088], parent: "neck", dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { at: [0, 0.218, 0.086], parent: "head", dir: [0, -0.03, 1], role: "jaw" });
  const gazeL = new THREE.Vector3(0.55, 0.3, 0.78).normalize();
  const gazeR = new THREE.Vector3(-0.6, -0.22, -0.55).normalize();
  const eyeL = b.joint("eyeL", { at: [0.0135, 0.236, 0.112], parent: "head", dir: gazeL });
  const eyeR = b.joint("eyeR", { at: [-0.0135, 0.236, 0.112], parent: "head", dir: gazeR });

  const tailPath = bezier([0, 0.208, -0.066], [0, 0.236, -0.09], [0, 0.25, -0.112], [0, 0.25, -0.135]).concat(
    spiral([0, 0.22, -0.135], [0, 0.25, -0.135], [-1, 0, 0], { turns: 1.8, r1: 0.006, pitch: 0.0035 }),
  );
  const tail = b.chain("tail", tailPath, { parent: "pelvis", count: 10, role: "tail" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.208, -0.078], w: 0.022, h: 0.03 },
      { at: [0, 0.214, -0.05], w: 0.033, h: 0.058 },
      { at: [0, 0.219, -0.01], w: 0.037, h: 0.074 },
      { at: [0, 0.222, 0.03], w: 0.037, h: 0.07 },
      { at: [0, 0.226, 0.062], w: 0.031, h: 0.052 },
      { at: [0, 0.229, 0.09], w: 0.028, h: 0.04 },
    ],
    { color: bodyPaint, bone: [spine, "neck"], sides: 14 },
  );

  const tailSweep = b.sweep(tail, (t: number) => 0.0028 + 0.0102 * Math.pow(1 - t, 1.15), {
    color: tailPaint,
    sides: 10,
  });

  // dorsal crest
  b.along(
    body,
    16,
    (pt) => {
      const h = 0.0045 + 0.004 * Math.sin(Math.PI * pt.t);
      const col = pt.t < 0.33 ? "#ffb04a" : pt.t < 0.66 ? "#d8ec58" : "#7ee8c0";
      b.stick(new THREE.ConeGeometry(0.0021, h, 4), col, pt, { embed: 0.3 });
    },
    { from: 0.06, to: 0.86 },
  );
  for (let k = 0; k < 4; k++) {
    const pt = tailSweep.at(0.03 + 0.035 * k, 0);
    b.stick(new THREE.ConeGeometry(0.0018, 0.0042 - 0.0006 * k, 4), "#ff9a3a", pt, { embed: 0.3 });
  }
  // ventral tubercles
  for (let k = 0; k < 10; k++) {
    const pt = body.at(0.12 + 0.07 * k, 180);
    b.stick(new THREE.SphereGeometry(0.0019, 6, 4), "#f6f8ec", pt, { embed: 0.4 });
  }

  // ---------- head ----------
  const headSection = { section: "circle" as const, sides: 8, smooth: false };
  b.loft(
    [
      { at: [0, 0.232, 0.08], w: 0.03, h: 0.034 },
      { at: [0, 0.235, 0.105], w: 0.03, h: 0.03 },
      { at: [0, 0.231, 0.13], w: 0.024, h: 0.022 },
      { at: [0, 0.226, 0.148], w: 0.014, h: 0.013 },
      { at: [0, 0.224, 0.157], w: 0.007, h: 0.007 },
    ],
    { color: headPaint, bone: "head", ...headSection },
  );
  const jawSweep = b.loft(
    [
      { at: [0, 0.212, 0.082], w: 0.026, h: 0.022 },
      { at: [0, 0.212, 0.105], w: 0.026, h: 0.018 },
      { at: [0, 0.215, 0.13], w: 0.019, h: 0.012 },
      { at: [0, 0.218, 0.15], w: 0.009, h: 0.007 },
    ],
    { color: jawPaint, bone: "jaw", ...headSection },
  );
  for (let k = 0; k < 5; k++) {
    const pt = jawSweep.at(0.15 + 0.13 * k, 180);
    b.stick(new THREE.ConeGeometry(0.0014, 0.003, 4), "#f6f8ec", pt, { embed: 0.3 });
  }

  // casque (ridged helmet)
  const casque: Array<[number, number]> = [
    [0.074, 0.229],
    [0.078, 0.255],
    [0.086, 0.268],
    [0.098, 0.271],
    [0.112, 0.263],
    [0.126, 0.249],
    [0.138, 0.236],
    [0.12, 0.234],
    [0.098, 0.236],
    [0.084, 0.233],
  ];
  b.extrude(casque, {
    at: [0, 0, 0],
    color: casquePaint,
    thickness: [0.014, 0.0025],
    bevel: 0.0012,
    bone: "head",
  });
  for (let i = 1; i < 6; i++) {
    const [z0, y0] = casque[i];
    const [z1, y1] = casque[i + 1];
    const len = Math.hypot(z1 - z0, y1 - y0);
    const n = Math.max(1, Math.round(len / 0.008));
    const dir: V = [0, (z1 - z0) / len, -(y1 - y0) / len];
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n;
      const z = z0 + (z1 - z0) * f + dir[2] * 0.0012;
      const y = y0 + (y1 - y0) * f + dir[1] * 0.0012;
      b.part(new THREE.ConeGeometry(0.0022, 0.0055, 4), "#ffa04a", { at: [0, y, z], dir, bone: "head" });
    }
  }
  // brow / canthal ridges and nostrils
  for (const s of [1, -1]) {
    b.capsule([s * 0.0115, 0.2465, 0.103], [s * 0.006, 0.234, 0.146], 0.0021, {
      color: "#55dccb",
      bone: "head",
      sides: 6,
    });
    b.capsule([s * 0.012, 0.246, 0.1], [s * 0.007, 0.257, 0.082], 0.002, {
      color: "#55dccb",
      bone: "head",
      sides: 6,
    });
    b.part(new THREE.SphereGeometry(0.0011, 6, 4), "#1d2a2a", { at: [s * 0.0055, 0.2275, 0.151], bone: "head" });
  }

  // turret eyes
  const EYE: Array<[number, number]> = [
    [0, -0.011],
    [0.0075, -0.0082],
    [0.0108, -0.002],
    [0.0105, 0.003],
    [0.0078, 0.0072],
    [0.0042, 0.0098],
    [0.0026, 0.0106],
    [0, 0.0104],
  ];
  for (const [eye, nm] of [
    [eyeL, "eyeL"],
    [eyeR, "eyeR"],
  ] as const) {
    b.lathe(EYE, { at: eye, axis: eye, color: eyePaint, segments: 12, bone: nm });
    b.part(new THREE.SphereGeometry(0.0031, 10, 8), "#121212", { at: eye.local([0, 0.0096, 0]), bone: nm });
    b.part(new THREE.SphereGeometry(0.0009, 6, 4), "#ffffff", { at: eye.local([0.0011, 0.0121, 0.0011]), bone: nm });
  }

  // ---------- legs with mitten feet ----------
  const limb = (side: 1 | -1, front: boolean, zf: number) => {
    const S = side === 1 ? "L" : "R";
    const names = front ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`] : [`hip${S}`, `knee${S}`, `ankle${S}`];
    const root: V = front ? [side * 0.014, 0.205, 0.046] : [side * 0.013, 0.2, -0.045];
    const mid: V = front ? [side * 0.044, 0.19, 0.033] : [side * 0.043, 0.188, -0.03];
    const W: V = [side * 0.008, 0.173, zf];
    const chain = b.chain(front ? `arm${S}` : `leg${S}`, polyline([root, mid, W]), {
      parent: front ? "spine3" : "spine1",
      names,
      role: "leg",
      contact: [0, TY + twigRz(zf), zf],
    });
    b.sweep(chain, [front ? 0.0078 : 0.0084, 0.0048], { color: limbPaint, sides: 9 });
    b.part(new THREE.SphereGeometry(0.0062, 8, 6), limbPaint, { at: W, bone: names[2] });
    const R = twigRz(zf) + 0.0042;
    const P = (deg: number, dz: number): V => [R * Math.sin(deg * D2R), TY + R * Math.cos(deg * D2R), zf + dz];
    const digit = (kind: "In" | "Out", angles: number[], dz: number, r0: number) => {
      const pts: V[] = [[W[0], W[1] - 0.002, zf + dz * 0.5], ...angles.map((a) => P(a, dz))];
      const nm = `${front ? "finger" : "toe"}${kind}${S}`;
      const ch = b.chain(nm, catmull(pts), { parent: names[2], count: 2, names: [`${nm}1`, `${nm}2`], role: "digit" });
      b.sweep(ch, [r0, r0 * 0.72], { color: limbPaint, sides: 7 });
      const f = ch.at(0.9);
      b.spike(f, f, 0.0055, 0.0014, { color: "#3a2a20", sides: 5 });
    };
    // one bundle crosses over the twig, the other wraps the near side: a clasping mitten
    digit("In", [-side * 25, -side * 72, -side * 118], front ? 0.0035 : -0.0035, front ? 0.0052 : 0.0046);
    digit("Out", [side * 40, side * 82, side * 122], front ? -0.0035 : 0.0035, front ? 0.0045 : 0.0052);
  };
  limb(1, true, 0.07);
  limb(-1, true, 0.05);
  limb(1, false, -0.064);
  limb(-1, false, -0.042);

  // ---------- twig, props and leaves ----------
  const twigPath = catmull([
    [0, TY - 0.008, -0.34],
    [0, TY - 0.002, -0.2],
    [0, TY, -0.09],
    [0, TY, 0],
    [0, TY, 0.09],
    [0.002, TY + 0.003, 0.2],
    [0.006, TY + 0.01, 0.33],
  ]);
  b.sweep(twigPath, twigR, {
    color: barkPaint(new THREE.Vector3(0, 0, 1), true),
    bone: "base",
    sides: 7,
    smooth: false,
    caps: "flat",
  });
  const supportBark = barkPaint(new THREE.Vector3(0, 1, 0), false);
  b.sweep(
    catmull([
      [0, TY - 0.004, -0.255],
      [0.03, 0.095, -0.285],
      [0.052, 0.035, -0.31],
      [0.06, 0.006, -0.32],
    ]),
    [0.009, 0.012],
    { color: supportBark, bone: "base", sides: 7, smooth: false, caps: { start: "round", end: "flat" } },
  );
  b.sweep(
    catmull([
      [0.001, TY + 0.002, 0.22],
      [-0.035, 0.09, 0.25],
      [-0.058, 0.032, 0.268],
      [-0.064, 0.006, 0.274],
    ]),
    [0.0085, 0.0115],
    { color: supportBark, bone: "base", sides: 7, smooth: false, caps: { start: "round", end: "flat" } },
  );
  // broken stubs
  b.rod([0, TY, 0.115], [0.017, TY + 0.011, 0.126], [0.005, 0.0035], {
    color: "#6b4a30",
    bone: "base",
    sides: 6,
    smooth: false,
  });
  b.rod([0, TY, -0.125], [-0.018, TY - 0.006, -0.132], [0.005, 0.0035], {
    color: "#6b4a30",
    bone: "base",
    sides: 6,
    smooth: false,
  });

  // rocks and moss at the support feet
  const rock = (at: V, r: number, sy: number, rot: number, color: string) =>
    b.part(new THREE.DodecahedronGeometry(r, 0), color, {
      at,
      scale: [1.25, sy, 1],
      rotation: [0, rot, 0],
      bone: "base",
      flat: true,
    });
  rock([0.062, 0.015, -0.322], 0.036, 0.5, 20, "#857f74");
  rock([0.054, 0.027, -0.316], 0.022, 0.32, 60, "#5f8f38");
  rock([-0.064, 0.015, 0.276], 0.034, 0.5, -35, "#78736a");
  rock([-0.058, 0.026, 0.282], 0.02, 0.32, 10, "#7aa646");
  rock([0.09, 0.005, -0.29], 0.009, 0.6, 40, "#9a958a");
  rock([-0.09, 0.005, 0.25], 0.01, 0.6, 15, "#6f6b63");
  rock([0.035, 0.004, -0.36], 0.007, 0.6, 70, "#857f74");

  // leafy twiglets
  const leafFrames: ReturnType<typeof frame>[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const twiglet = (pts: V[], leaves: number, side0: number) => {
    const path = catmull(pts);
    b.sweep(path, [0.0042, 0.0018], { color: "#6b4a30", bone: "base", sides: 6 });
    for (let k = 0; k < leaves; k++) {
      const t = 0.4 + (0.6 * (k + 1)) / leaves;
      const tan = path.tangentAt(t);
      const across = tan.clone().cross(up).normalize();
      const s = (k + side0) % 2 === 0 ? 1 : -1;
      const dir =
        k === leaves - 1
          ? tan.clone()
          : tan.clone().multiplyScalar(0.6).addScaledVector(across, s).addScaledVector(up, 0.25).normalize();
      leafFrames.push(frame(path.at(t), dir));
    }
  };
  twiglet(
    [
      [0, TY + 0.004, -0.2],
      [0.025, 0.182, -0.225],
      [0.05, 0.203, -0.25],
      [0.078, 0.214, -0.272],
    ],
    5,
    0,
  );
  twiglet(
    [
      [0, TY + 0.004, 0.19],
      [-0.02, 0.19, 0.205],
      [-0.045, 0.215, 0.218],
      [-0.07, 0.232, 0.228],
    ],
    5,
    1,
  );
  twiglet(
    [
      [0.005, 0.157, 0.305],
      [0.012, 0.172, 0.36],
      [0.02, 0.19, 0.392],
    ],
    4,
    0,
  );
  twiglet(
    [
      [0, TY - 0.004, -0.3],
      [-0.03, 0.135, -0.322],
      [-0.056, 0.13, -0.345],
    ],
    3,
    1,
  );
  const leafA = svg(leafSvg("#4f9d3a", "#3b7e2c", "#c4e08a"), { size: 128 });
  const leafB = svg(leafSvg("#6db342", "#4e9333", "#dcefa0"), { size: 128 });
  b.cards(leafFrames, [leafA, leafB], {
    size: [0.03, 0.06],
    flow: [0, -1, 0],
    lean: 12,
    bend: 30,
    vary: 0.2,
    spin: 15,
    rng: rng(5),
    bone: "base",
    sink: 0.05,
  });

  return b.root;
}
