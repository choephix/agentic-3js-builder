import * as THREE from "three";
import { createBuilder, catmull, polyline, bezier, offset, paint, scales, mottle, svg, rng } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin & Chick",
  description:
    "A proud emperor penguin parent with a glossy blue-black back, white belly fading into golden chest and ear patches, a long pink-striped beak, and a fluffy grey chick on its big black feet.",
};

const BLACK = "#10141f";
const BLUE = "#22324f";
const GLOSS = "#46618c";
const WHITE = "#f5f2ea";
const YEL = "#f3b12c";
const PINK = "#f07f62";
const FOOT = "#17171b";
const FOOT2 = "#2d2d35";
const CLAW = "#3d3a38";
const CGREY = "#9aa0a8";
const CFLUFF = "#c8ccd2";
const CBLACK = "#16161a";

function hx(c: string): number[] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function lc(a: string, b: string, t: number): string {
  const k = clamp01(t);
  const A = hx(a);
  const B = hx(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("");
}
function ss(e0: number, e1: number, x: number) {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}
function interp(keys: number[], vals: number[], t: number) {
  if (t <= keys[0]) return vals[0];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i]) {
      const u = (t - keys[i - 1]) / (keys[i] - keys[i - 1]);
      const s = u * u * (3 - 2 * u);
      return vals[i - 1] + (vals[i] - vals[i - 1]) * s;
    }
  }
  return vals[vals.length - 1];
}
function backCol(n: THREE.Vector3) {
  let c = lc(BLACK, BLUE, ss(-0.2, 0.9, n.y * 0.8 - n.z * 0.3 + 0.2));
  c = lc(c, GLOSS, ss(0.55, 0.85, n.y) * 0.7);
  return c;
}

export default function build() {
  const b = createBuilder({ name: "emperorPenguin" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.25, 0], role: "spine" });
  const spinePts = [
    [0, 0.25, 0],
    [0, 0.5, -0.01],
    [0, 0.75, -0.02],
    [0, 0.93, 0.0],
  ];
  const spine = b.chain("spine", catmull(spinePts), { parent: hips, names: ["spine1", "spine2", "neck"], role: "spine" });
  const neck = spine.joints[2];
  const head = b.joint("head", { parent: neck, at: [0, 0.95, 0.0], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.955, 0.1], aim: [0, 0.918, 0.232], role: "jaw" });
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.2, -0.12],
      [0, 0.09, -0.22],
      [0, 0.05, -0.28],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---------- body ----------
  const bellyScales = scales(WHITE, "#e7e2d6", { size: 0.022 });
  const bodyPaint = paint((p, n) => {
    const thr = 0.05 + 0.4 * ss(0.45, 0.85, p.y);
    const w = ss(thr - 0.1, thr + 0.1, n.z) * (1 - ss(0.84, 0.9, p.y));
    const yt = ss(0.6, 0.82, p.y);
    const front = lc(WHITE, YEL, yt * 0.92);
    let col = lc(backCol(n), front, w);
    if (p.y > 0.76) {
      const e =
        ss(0.4, 0.62, Math.abs(n.x)) * ss(-0.45, -0.15, n.z) * ss(0.78, 0.86, p.y) * (1 - ss(0.93, 0.98, p.y));
      col = lc(col, YEL, e);
    } else if (w > 0.995 && yt < 0.01) return bellyScales;
    return col;
  });
  const bodyPath = catmull([[0, 0.13, -0.01], ...spinePts.slice(1)].map((q, i) => (i === 0 ? q : q)));
  const rk = [0, 0.12, 0.3, 0.5, 0.7, 0.86, 1];
  const rv = [0.1, 0.165, 0.19, 0.18, 0.14, 0.092, 0.07];
  b.sweep(bodyPath, (t) => [interp(rk, rv, t), interp(rk, rv, t) * 1.06], {
    bone: [hips, spine],
    color: bodyPaint,
    sides: 14,
    shift: (t) => [0, -0.03 * Math.sin(Math.PI * Math.min(1, t * 1.4))],
    name: "body",
  });

  // brood fold over the chick's back
  b.sweep(
    catmull([
      [-0.14, 0.22, 0.05],
      [0, 0.25, 0.155],
      [0.14, 0.22, 0.05],
    ]),
    [0.03, 0.045, 0.03],
    { bone: hips, color: bellyScales, sides: 8, name: "broodFold" },
  );

  // tail
  b.sweep(tail, (t) => [0.055 * (1 - t) + 0.015, 0.018], { color: BLACK, sides: 6, name: "tail" });

  // ---------- head ----------
  const HC = new THREE.Vector3(0, 0.975, 0.02);
  const headPaint = paint((p, n) => {
    const d = p.clone().sub(HC);
    const el = ((d.z + 0.025) / 0.05) ** 2 + ((d.y + 0.035) / 0.055) ** 2;
    const e = (1 - ss(0.6, 1.1, el)) * ss(0.35, 0.6, Math.abs(n.x));
    return lc(backCol(n), YEL, e);
  });
  const headPart = b.part(new THREE.SphereGeometry(0.1, 14, 10).scale(0.92, 0.95, 1.15), headPaint, {
    bone: head,
    at: HC,
    name: "head",
  });

  // beak
  b.sweep(
    bezier([0, 0.97, 0.09], [0, 0.972, 0.17], [0, 0.932, 0.248]),
    (t) => [0.015 * (1 - t) + 0.002, 0.013 * (1 - t) + 0.002],
    { bone: head, color: BLACK, sides: 6, caps: { start: "round", end: "point" }, name: "beakUpper" },
  );
  b.sweep(
    bezier([0, 0.952, 0.1], [0, 0.948, 0.17], [0, 0.918, 0.234]),
    (t) => [0.012 * (1 - t) + 0.002, 0.007 * (1 - t) + 0.0015],
    {
      bone: jaw,
      bands: [
        [0.68, PINK],
        [1, BLACK],
      ],
      sides: 6,
      caps: { start: "round", end: "point" },
      name: "beakLower",
    },
  );

  // eyes
  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const hit = headSurf.around(HC).at(s * 62, 14);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.012, 8, 6), "#050508", hit, { embed: 0.45, bone: head });
    const hl = offset(offset(hit.at, hit.n, 0.009), [0, 1, 0.6], 0.005);
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", { bone: head, at: hl });
  }

  // ---------- flippers ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fl = b.chain(
      `flipper${side}`,
      catmull([
        [s * 0.13, 0.72, -0.01],
        [s * 0.2, 0.55, 0.0],
        [s * 0.255, 0.38, 0.025],
      ]),
      { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" },
    );
    const fp = paint((_p, n) => (n.x * s > -0.15 ? backCol(n) : WHITE));
    b.sweep(fl, (t) => [0.014 * (1 - 0.5 * t), 0.05 * (1 - t * 0.75) + 0.008], {
      color: fp,
      sides: 8,
      name: `flipper${side}`,
    });
  }

  // ---------- legs & feet ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = [s * 0.07, 0.2, 0.02];
    const ankle = [s * 0.085, 0.07, 0.06];
    const toe = [s * 0.1, 0.042, 0.16];
    const leg = b.chain(`leg${side}`, polyline([hip, ankle, toe]), {
      parent: hips,
      names: [`hip${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.1, 0.028, 0.16],
    });
    const ank = leg.joints[1];
    b.capsule(hip, ankle, [0.04, 0.03], { bone: leg.joints[0], color: BLACK, sides: 6 });
    const footPaint = scales(FOOT, FOOT2, { size: 0.009 });
    b.part(new THREE.SphereGeometry(1, 8, 6).scale(0.05, 0.022, 0.055), footPaint, {
      bone: ank,
      at: [s * 0.088, 0.05, 0.085],
    });
    for (const a of [-30, 0, 30]) {
      const ang = ((a + s * 10) * Math.PI) / 180;
      const dir = [Math.sin(ang), 0, Math.cos(ang)];
      const start = [s * 0.088, 0.05, 0.07];
      const len = a === 0 ? 0.11 : 0.085;
      const tip = [start[0] + dir[0] * len, 0.042, start[2] + dir[2] * len];
      b.sweep([start, tip], [0.02, 0.012], { bone: ank, color: footPaint, sides: 6, name: `toe${side}` });
      b.spike(tip, [dir[0], -0.25, dir[2]], 0.026, 0.008, { bone: ank, color: CLAW, sides: 5 });
    }
  }

  // ---------- chick ----------
  const chick = b.chain(
    "chick",
    polyline([
      [0, 0.08, 0.225],
      [0, 0.24, 0.235],
    ]),
    { parent: hips, names: ["chickHips", "chickNeck"], role: "spine" },
  );
  const chickHips = chick.joints[0];
  const chickNeck = chick.joints[1];
  const CH = new THREE.Vector3(0, 0.3, 0.255);
  const chickHead = b.joint("chickHead", { parent: chickNeck, at: [0, 0.28, 0.25], dir: [0, 0.35, 1], role: "head" });
  const chickJaw = b.joint("chickJaw", { parent: chickHead, at: [0, 0.287, 0.315], aim: [0, 0.278, 0.35], role: "jaw" });

  const chickBody = b.part(new THREE.SphereGeometry(0.1, 12, 9).scale(1, 1.06, 0.95), CGREY, {
    bone: chickHips,
    at: [0, 0.157, 0.225],
    name: "chickBody",
  });
  const chickHeadPaint = paint((p, n) => {
    const dy = p.y - CH.y;
    let white = n.z > 0.05 && dy < 0.028 && dy > -0.05;
    if (white && Math.abs(n.x) < 0.17 && dy > -0.008) white = false;
    if (n.y < -0.55) white = true;
    return white ? WHITE : CBLACK;
  });
  const chickHeadPart = b.part(new THREE.SphereGeometry(0.075, 12, 9), chickHeadPaint, {
    bone: chickHead,
    at: CH,
    name: "chickHead",
  });
  // chick beak
  b.sweep([[0, 0.293, 0.31], [0, 0.29, 0.345]], [0.01, 0.0], { bone: chickHead, color: CBLACK, sides: 5, caps: { end: "point" } });
  b.sweep([[0, 0.283, 0.31], [0, 0.279, 0.338]], [0.007, 0.0], { bone: chickJaw, color: "#3a3330", sides: 5, caps: { end: "point" } });
  // chick eyes
  const chSurf = b.surface(chickHeadPart);
  for (const s of [1, -1]) {
    const hit = chSurf.around(CH).at(s * 34, 12);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.013, 8, 6), "#050508", hit, { embed: 0.5, bone: chickHead });
    b.part(new THREE.SphereGeometry(0.004, 5, 4), "#ffffff", {
      bone: chickHead,
      at: offset(offset(hit.at, hit.n, 0.008), [0, 1, 0.5], 0.005),
    });
  }
  // chick flippers & feet
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const cf = b.chain(
      `chickFlipper${side}`,
      polyline([
        [s * 0.085, 0.2, 0.225],
        [s * 0.135, 0.13, 0.255],
      ]),
      { parent: chickHips, names: [`chickShoulder${side}`, `chickHand${side}`], role: "arm" },
    );
    b.sweep(cf, (t) => [0.012, 0.024 * (1 - 0.4 * t)], { color: CGREY, sides: 6 });
    for (const a of [-20, 20]) {
      const ang = ((a + s * 12) * Math.PI) / 180;
      const st = [s * 0.035, 0.065, 0.29];
      b.sweep([st, [st[0] + Math.sin(ang) * 0.035, 0.058, st[2] + Math.cos(ang) * 0.035]], [0.009, 0.006], {
        bone: chickHips,
        color: CBLACK,
        sides: 5,
      });
    }
  }
  // chick fluff
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
      <path d="M16 48 C10 40 4 30 3 18 C6 22 8 24 9 20 C9 12 11 6 13 2 C14 8 15 12 16 14 C17 10 19 6 22 2 C23 8 23 14 23 20 C25 22 27 20 29 17 C28 30 22 40 16 48 Z" fill="#ffffff"/>
      <path d="M16 46 C13 38 10 30 10 22 C13 26 15 26 16 22 C17 26 19 26 22 22 C22 30 19 38 16 46 Z" fill="#cfcfcf"/>
    </svg>`,
    { size: 128 },
  );
  const fluffHits = b.surface(chickBody).scatter(150, { rng: rng(5), minDist: 0.014, filter: (h) => h.n.y > -0.5 && h.n.z > -0.55 });
  b.cards(fluffHits, tuft, { size: [0.03, 0.04], lean: 55, bend: 25, vary: 0.3, spin: 25, rng: rng(6), color: CFLUFF });
  const crownHits = b.surface(chickHeadPart).scatter(14, { rng: rng(8), minDist: 0.012, filter: (h) => h.n.y > 0.55 && h.n.z < 0.3 });
  b.cards(crownHits, tuft, { size: [0.02, 0.03], lean: 30, bend: 20, vary: 0.3, rng: rng(9), color: "#3a3a40", flow: [0, 0.2, -1] });

  // ---------- snow & ice ----------
  b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.52, 0.014],
      [0.32, 0.028],
      [0, 0.031],
    ],
    {
      at: [0, 0, 0],
      bone: hips,
      segments: 18,
      smoothing: 1,
      color: mottle("#eef4fa", "#d3e2ef", { size: 0.15 }),
      name: "snow",
    },
  );
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + R() * 0.5 + 0.4;
    const r = 0.4 + R() * 0.12;
    const sz = 0.025 + R() * 0.03;
    const g = new THREE.IcosahedronGeometry(sz, 0).scale(1, 0.7 + R() * 0.5, 1);
    b.part(g, i % 2 ? "#cfe6f5" : "#e6f1fa", {
      bone: hips,
      at: [Math.sin(a) * r, sz * 0.35, Math.cos(a) * r],
      rotation: [R() * 40, R() * 360, R() * 40],
      flat: true,
      name: "ice",
    });
  }

  return b.root;
}
