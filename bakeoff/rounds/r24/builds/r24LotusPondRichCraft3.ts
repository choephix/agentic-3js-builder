import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  countershade,
  gradient,
  mottle,
  spots,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Ink Lotus Pond with Frog",
  description:
    "A round pond in the manner of a Chinese ink-wash painting: tall bowl-shaped lotus leaves with pale veins, an open bloom, a half-open bloom, a bud, a dried seed pod and a rolled shoot, floating pads with ripple rings, and a spotted green frog on the front pad. A vermilion seal chop sits at the pond's rim.",
};

const DEG = Math.PI / 180;

// ---------------------------------------------------------------- palette
const INK = "#1b1d1c";
const INK_SOFT = "#3b4541";
const GOLD = "#e2b43a";
const SEED = "#2a281d";
const WART = "#3d5732";
const WEB = "#8fa85a";
const TOE = "#6b8a44";
const PAD = "#cfd685";

type Pal = { base: string; mid: string; tip: string; edge: string };
const PAL_OPEN: Pal = { base: "#fbf3e6", mid: "#f4c6c8", tip: "#d8647f", edge: "#9d4560" };
const PAL_PALE: Pal = { base: "#fdf8ee", mid: "#f8dcd8", tip: "#e79aa8", edge: "#a8607a" };
const PAL_BUD: Pal = { base: "#c9d6a8", mid: "#f1c9c0", tip: "#d6687f", edge: "#7f5a50" };

// frog placement: sits at the middle of the front floating pad
const FX = 0.12;
const FZ = 0.45;
const LEAF_Y = 0.056;
const WATER_Y = 0.05;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- textures
const EYE = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#c8a43a" stroke="#1b1d1c" stroke-width="4"/>
    <circle cx="32" cy="32" r="22" fill="#e6c85a"/>
    <path d="M10 32 Q32 10 54 32 Q32 22 10 32Z" fill="#a8842a"/>
    <ellipse cx="32" cy="33" rx="20" ry="7" fill="#1b1d1c"/>
    <circle cx="23" cy="25" r="4.5" fill="#fff8e0"/>
  </svg>`,
  { size: 128 },
);

const SEAL = svg(
  `<svg viewBox="0 0 64 64">
    <rect x="1" y="1" width="62" height="62" rx="5" fill="#b8302a"/>
    <rect x="6" y="6" width="52" height="52" rx="3" fill="none" stroke="#f3e6cc" stroke-width="2.4"/>
    <g stroke="#f3e6cc" stroke-width="4.2" stroke-linecap="round" fill="none">
      <path d="M14 21 H50"/><path d="M24 13 V29"/><path d="M40 13 V29"/>
      <path d="M20 37 H44"/><path d="M32 29 V37"/>
      <path d="M22 43 H42 V54 H22 Z" stroke-width="3.6"/>
    </g>
  </svg>`,
  { size: 192 },
);

const RIPPLE = svg(
  `<svg viewBox="0 0 100 100">
    <g fill="none" stroke="#3d4a45" stroke-linecap="round">
      <ellipse cx="50" cy="50" rx="46" ry="42" stroke-width="2.2" stroke-dasharray="62 18 30 22 80 40"/>
      <ellipse cx="50" cy="50" rx="34" ry="30" stroke-width="2.6" stroke-dasharray="40 20 70 30"/>
      <ellipse cx="50" cy="50" rx="22" ry="19" stroke-width="3" stroke-dasharray="30 14 50 24"/>
    </g>
  </svg>`,
  { size: 256 },
);

const DOTS = svg(
  `<svg viewBox="0 0 64 64">
    <g fill="#222c27">
      <ellipse cx="14" cy="18" rx="5" ry="3.4" transform="rotate(-20 14 18)"/>
      <ellipse cx="30" cy="12" rx="3.4" ry="2.6"/>
      <ellipse cx="46" cy="22" rx="5.6" ry="3.6" transform="rotate(25 46 22)"/>
      <ellipse cx="22" cy="36" rx="4" ry="3"/>
      <ellipse cx="40" cy="42" rx="3.4" ry="2.6"/>
      <ellipse cx="52" cy="50" rx="4.6" ry="3" transform="rotate(-15 52 50)"/>
      <ellipse cx="12" cy="52" rx="3.4" ry="2.4"/>
      <ellipse cx="32" cy="54" rx="3" ry="2.2"/>
    </g>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- petal geometry helpers
type Pt = [number, number] | [number, number, "sharp"];

const wAt = (t: number, W: number) =>
  W * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(Math.max(t, 0), 1), 0.7)), 0.85);

function petalOutline(t0: number, t1: number, L: number, W: number): Pt[] {
  const n = 5;
  const right: Pt[] = [];
  const left: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const w = wAt(t, W);
    const y = (t - t0) * L;
    if (w < 1e-3) right.push([0, y, "sharp"]);
    else {
      right.push([w, y]);
      left.unshift([-w, y]);
    }
  }
  return [...right, ...left];
}

const petalPaints = new Map<string, ReturnType<typeof paint>>();
function petalPaint(L: number, W: number, t0: number, pal: Pal) {
  const key = `${L.toFixed(3)}|${W.toFixed(3)}|${t0}|${pal.tip}`;
  let p = petalPaints.get(key);
  if (!p) {
    p = paint((_p, _n, s) => {
      const t = Math.min(Math.max(t0 + s[1] / L, 0), 1);
      const fx = Math.abs(s[0]) / (wAt(t, W) + 1e-4);
      let c = t < 0.4 ? mix(pal.base, pal.mid, t / 0.4) : mix(pal.mid, pal.tip, (t - 0.4) / 0.6);
      const v = Math.min(Math.abs(fx), Math.abs(fx - 0.42), Math.abs(fx - 0.8));
      if (v < 0.03 && t > 0.08) c = mix(c, pal.tip, 0.35);
      if (fx > 0.9) c = mix(c, pal.edge, 0.65);
      return c;
    });
    petalPaints.set(key, p);
  }
  return p;
}

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "lotus_pond", paintSize: 2048 });
  const root = b.joint("pond", { at: [0, 0, 0] });

  // ------------------------------------------------------------ pond water
  const ripples: [number, number, number][] = [
    [FX, FZ, 0.47],
    [FX, FZ, 0.58],
    [-0.7, -0.62, 0.1],
    [0.9, -0.5, 0.1],
    [-1.08, -0.02, 0.09],
    [0.05, -0.58, 0.12],
    [0.55, 0.3, 0.09],
    [-0.3, 0.35, 0.09],
    [0.4, -0.88, 0.09],
  ];
  const waterPaint = paint((p, n) => {
    if (n.y < 0.5) return mix(INK_SOFT, "#8f9c94", 0.4);
    const d = Math.hypot(p.x, p.z);
    let c = mix("#dde5d9", "#b8c8bc", noise(p, 0.5, 3));
    c = mix(c, "#8aa197", smoothstep(0.95, 1.3, d) * 0.75);
    if (d > 1.29) c = mix(c, INK_SOFT, 0.75);
    for (const [cx, cz, r] of ripples) {
      const dd = Math.abs(Math.hypot(p.x - cx, p.z - cz) - r);
      if (dd < 0.0045 && noise(p, 0.14, 5) > 0.4) c = mix(c, INK_SOFT, 0.55);
    }
    return c;
  });
  b.lathe(
    [
      [0, 0],
      [1.35, 0],
      [1.35, WATER_Y],
      [0, WATER_Y],
    ],
    { at: [0, 0, 0], segments: 40, color: waterPaint, bone: root },
  );

  // ripple cards at stem bases
  const rippleFrames = [
    { p: [-0.7, -0.62], s: 0.34 },
    { p: [0.9, -0.5], s: 0.3 },
    { p: [-1.08, -0.02], s: 0.28 },
    { p: [0.05, -0.58], s: 0.36 },
    { p: [0.55, 0.3], s: 0.28 },
    { p: [-0.3, 0.35], s: 0.28 },
    { p: [0.4, -0.88], s: 0.28 },
  ];
  rippleFrames.forEach((rf, i) => {
    b.cards([frame([rf.p[0], 0.054, rf.p[1]], [0, 1, 0])], RIPPLE, {
      size: rf.s,
      lean: 90,
      flow: [1, 0, 0],
      mirror: true,
      spin: 180,
      rng: rng(30 + i),
      bone: root,
    });
  });

  // ------------------------------------------------------------ leaves
  const leafPaint = (c: THREE.Vector3, r: number, ax: THREE.Vector3, key: number) =>
    paint((p, n, s) => {
      const d = p.distanceTo(c) / r;
      if (n.dot(ax) < -0.25) return mix("#aebdaa", "#8da38f", noise(p, 0.12, key));
      const t = smoothstep(0.05, 1.0, d) * 0.9 + (noise(p, 0.1, key + 3) - 0.5) * 0.45;
      let col = mix("#27403a", "#7e9e86", t);
      col = mix(col, "#c7d6bb", smoothstep(0.82, 1.0, d + (noise(p, 0.06, key + 7) - 0.5) * 0.25) * 0.8);
      const A = 360 / 17;
      const a = ((s[1] % A) + A) % A;
      const vd = Math.min(a, A - a) * DEG * d * r;
      if (d > 0.06 && vd < 0.0035) col = mix(col, "#d4e0c6", 0.55);
      if (d < 0.05) col = mix(col, INK, 0.7);
      if (d > 0.975) col = mix(col, INK, 0.55);
      return col;
    });

  function lotusLeaf(c: THREE.Vector3, r: number, axis: number[], dish: number, key: number) {
    const ax = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
    const th = 0.006 + r * 0.01;
    const top: [number, number][] = [];
    const bot: [number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      const f = i / 6;
      top.push([f * r, dish * r * f * f]);
      bot.push([f * r, dish * r * f * f - th]);
    }
    const outline = [...top, ...bot.reverse()];
    b.lathe(outline, { at: c, axis: ax, segments: 18, color: leafPaint(c, r, ax, key), bone: root });
    return ax;
  }

  // ------------------------------------------------------------ stems
  function stem(bx: number, bz: number, end: THREE.Vector3, wob: [number, number], r0: number, r1: number) {
    const pts = [
      V(bx, 0.03, bz),
      V(bx + (end.x - bx) * 0.25 + wob[0], end.y * 0.35, bz + (end.z - bz) * 0.25 + wob[1]),
      V(bx + (end.x - bx) * 0.7 - wob[0] * 0.5, end.y * 0.72, bz + (end.z - bz) * 0.7 - wob[1] * 0.5),
      end.clone(),
    ];
    const sw = b.sweep(catmull(pts), [r0, r1], {
      bone: root,
      color: gradient("#24332c", "#5f7f68", [bx, 0.05, bz], [end.x, end.y, end.z]),
      sides: 6,
      caps: "flat",
    });
    for (let i = 0; i < 9; i++) {
      const t = 0.12 + (0.8 * i) / 8;
      const at = sw.at(t, (i * 137) % 360);
      b.spike(at, at, 0.022, 0.0055, { color: INK_SOFT, sides: 5 });
    }
    return sw;
  }

  // floating pads
  const floaters = [
    { x: FX, z: FZ, r: 0.4, dish: 0.05, ax: [0.04, 1, -0.03], key: 1 },
    { x: -0.62, z: 0.2, r: 0.3, dish: 0.07, ax: [0.1, 1, 0.08], key: 2 },
    { x: 0.78, z: 0.72, r: 0.22, dish: 0.08, ax: [-0.08, 1, 0.06], key: 3 },
    { x: -0.2, z: 1.0, r: 0.17, dish: 0.09, ax: [0, 1, 0.05], key: 4 },
  ];
  const dotRng = rng(77);
  floaters.forEach((f, i) => {
    const c = V(f.x, LEAF_Y, f.z);
    lotusLeaf(c, f.r, f.ax, f.dish, f.key);
    if (i === 0) return;
    const frames: ReturnType<typeof frame>[] = [];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + i;
      const rr = f.r * 0.7;
      frames.push(frame([f.x + Math.cos(a) * rr, LEAF_Y + f.dish * f.r * 0.5 + 0.005, f.z + Math.sin(a) * rr], [0, 1, 0]));
    }
    b.cards(frames, DOTS, { size: f.r * 0.32, lean: 90, flow: [1, 0, 0], mirror: true, spin: 180, vary: 0.3, rng: dotRng, bone: root });
  });

  // standing umbrella leaves
  const standing = [
    { x: -0.55, z: -0.42, h: 1.0, r: 0.46, ax: [0.15, 1, 0.55], dish: 0.3, bx: -0.7, bz: -0.62, key: 21, w: [0.05, -0.04] as [number, number] },
    { x: 0.82, z: -0.32, h: 0.78, r: 0.36, ax: [-0.4, 1, 0.45], dish: 0.28, bx: 0.9, bz: -0.5, key: 22, w: [-0.04, 0.05] as [number, number] },
    { x: -1.0, z: 0.1, h: 0.45, r: 0.27, ax: [0.5, 1, 0.35], dish: 0.3, bx: -1.08, bz: -0.02, key: 23, w: [0.03, 0.03] as [number, number] },
  ];
  for (const l of standing) {
    const c = V(l.x, l.h, l.z);
    const ax = lotusLeaf(c, l.r, l.ax, l.dish, l.key);
    stem(l.bx, l.bz, c.clone().addScaledVector(ax, -0.02), l.w, 0.02, 0.014);
  }

  // rolled young shoot
  const shootTop = V(0.3, 0.5, -0.15);
  stem(0.3, -0.12, shootTop, [0.03, -0.02], 0.016, 0.012);
  b.spike(shootTop, [0, 1, 0], 0.17, 0.03, { color: "#a9c395", bone: root, sides: 7 });
  b.spike(shootTop.clone().add(V(0, 0.05, 0)), [0.1, 1, 0], 0.1, 0.03, { color: "#7f9e7a", bone: root, sides: 7 });

  // ------------------------------------------------------------ lotus blooms
  function petal(base: THREE.Vector3, az: number, tilt: number, curl: number, L: number, W: number, pal: Pal) {
    const o = V(Math.cos(az), 0, Math.sin(az));
    const tang = V(-Math.sin(az), 0, Math.cos(az));
    const dirAt = (deg: number) => o.clone().multiplyScalar(Math.sin(deg * DEG)).add(V(0, Math.cos(deg * DEG), 0));
    const split = 0.55;
    const y0 = dirAt(tilt);
    const y1 = dirAt(tilt + curl);
    const mk = (at: THREE.Vector3, y: THREE.Vector3, t0: number, t1: number) =>
      b.extrude(petalOutline(t0, t1, L, W), {
        at,
        x: tang,
        y,
        thickness: [0.006, 0.0015],
        bevel: 0.001,
        color: petalPaint(L, W, t0, pal),
        bone: root,
      });
    mk(base, y0, 0, split);
    const up = base.clone().addScaledVector(y0, L * split).addScaledVector(y1, -0.02 * L);
    mk(up, y1, split, 1);
  }

  function bloom(c: THREE.Vector3, S: number, open: number, pal: Pal, seedKey: number) {
    const specs = [
      { n: 8, L: 0.22, W: 0.056, tilt: 66, curl: 10, off: 0 },
      { n: 7, L: 0.2, W: 0.054, tilt: 45, curl: -8, off: 0.5 },
      { n: 6, L: 0.17, W: 0.048, tilt: 24, curl: -24, off: 0.25 },
    ];
    specs.forEach((sp, ri) => {
      for (let i = 0; i < sp.n; i++) {
        const az = ((i + sp.off) / sp.n) * Math.PI * 2 + ri * 0.4 + seedKey;
        const tilt = sp.tilt * open + 7;
        const curl = sp.curl * open - 8 * (1 - open);
        const base = c.clone().add(V(Math.cos(az), 0, Math.sin(az)).multiplyScalar(0.02 * S)).add(V(0, ri * 0.004 * S, 0));
        petal(base, az, tilt, curl, sp.L * S, sp.W * S, pal);
      }
    });
    // receptacle with seed holes
    b.lathe(
      [
        [0, 0],
        [0.018 * S, 0],
        [0.04 * S, 0.05 * S],
        [0.042 * S, 0.056 * S],
        [0, 0.056 * S],
      ],
      { at: c, segments: 10, color: "#cfc766", bone: root },
    );
    const topY = c.y + 0.056 * S + 0.001;
    b.part(new THREE.CylinderGeometry(0.006 * S, 0.006 * S, 0.002, 6), SEED, { bone: root, at: [c.x, topY, c.z] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.005 * S, 0.005 * S, 0.002, 6), SEED, {
        bone: root,
        at: [c.x + Math.cos(a) * 0.022 * S, topY, c.z + Math.sin(a) * 0.022 * S],
      });
    }
    // stamens
    b.ring(frame([c.x, c.y + 0.03 * S, c.z], [0, 1, 0]), { count: 16, radius: 0.03 * S, tilt: 75 }, (it) =>
      b.spike(it, it, 0.075 * S, 0.004, { color: GOLD, bone: root, sides: 5 }),
    );
  }

  const bloomA = V(0.12, 1.18, -0.62);
  stem(0.05, -0.55, bloomA.clone().add(V(0, -0.01, 0)), [0.04, -0.03], 0.02, 0.014);
  bloom(bloomA, 1, 1, PAL_OPEN, 0);

  const bloomB = V(0.5, 0.62, 0.3);
  stem(0.55, 0.3, bloomB.clone().add(V(0, -0.01, 0)), [-0.04, 0.03], 0.017, 0.012);
  bloom(bloomB, 0.72, 0.55, PAL_PALE, 0.7);

  const budPos = V(-0.3, 0.72, 0.35);
  stem(-0.3, 0.35, budPos.clone().add(V(0, -0.01, 0)), [0.03, 0.03], 0.015, 0.011);
  bloom(budPos, 0.62, 0, PAL_BUD, 0.3);

  // dried seed pod
  const podPos = V(0.4, 0.95, -0.88);
  stem(0.4, -0.88, podPos.clone().add(V(0, 0.01, 0)), [0.05, 0.03], 0.016, 0.011);
  b.lathe(
    [
      [0, 0],
      [0.016, 0],
      [0.05, 0.075],
      [0.06, 0.09],
      [0.06, 0.1],
      [0, 0.1],
    ],
    { at: podPos, segments: 10, color: mottle("#bdbf72", "#8a9158", { size: 0.04, seed: 41 }), bone: root },
  );
  const podTop = podPos.y + 0.1 + 0.001;
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.002, 6), SEED, { bone: root, at: [podPos.x, podTop, podPos.z] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.002, 6), SEED, {
      bone: root,
      at: [podPos.x + Math.cos(a) * 0.034, podTop, podPos.z + Math.sin(a) * 0.034],
    });
  }

  // ------------------------------------------------------------ frog
  const P = (x: number, y: number, z: number) => V(FX + x, LEAF_Y + y, FZ + z);
  const FROG = countershade(
    spots(mottle("#7d9b4e", "#5b7c3d", { size: 0.04, seed: 11 }), "#25321f", { size: 0.036, amount: 0.4, seed: 12 }),
    "#e9e3b6",
    { level: -0.25, soft: 0.3 },
  );

  const spine = b.chain(
    "spine",
    catmull([P(0, 0.053, -0.07), P(0, 0.057, -0.03), P(0, 0.063, 0.005), P(0, 0.07, 0.04)]),
    { parent: root, role: "spine", names: ["hips", "spine2", "chest"] },
  );
  const body = b.sweep(
    spine,
    (t) => [
      0.03 + 0.046 * Math.sin(Math.PI * (0.15 + 0.7 * t)),
      0.026 + 0.026 * Math.sin(Math.PI * (0.15 + 0.7 * t)),
    ],
    { color: FROG, sides: 10 },
  );
  for (const a of [52, -52])
    b.sweep(body.line(a, 0.003), 0.0045, { bone: spine, color: "#b4c277", sides: 5 });

  const hipsJ = spine.joints[0];
  const chestJ = spine.joints[2];
  const head = b.joint("head", { parent: chestJ, at: P(0, 0.075, 0.05), dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 0.064, 0.03), dir: [0, -0.05, 1], role: "jaw" });

  // warts on the back
  for (const hit of b.surface(body).scatter(16, { rng: rng(5), minDist: 0.025, filter: (h) => h.n.y > 0.5 }))
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), WART, hit, { embed: 0.5, scale: [1, 0.6, 1] });

  // head: wide skull, lower jaw, mouth line
  const skullC = P(0, 0.087, 0.09);
  b.part(new THREE.SphereGeometry(1, 12, 8), FROG, { bone: head, at: skullC, scale: [0.066, 0.034, 0.068] });
  b.part(new THREE.SphereGeometry(1, 10, 6), FROG, { bone: jaw, at: P(0, 0.067, 0.095), scale: [0.056, 0.02, 0.062] });
  {
    const k = Math.sqrt(1 - Math.pow(0.014 / 0.034, 2));
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const ph = (-85 + 17 * i) * DEG;
      pts.push(V(skullC.x + Math.sin(ph) * 0.066 * k * 1.02, skullC.y - 0.014, skullC.z + Math.cos(ph) * 0.068 * k * 1.02));
    }
    b.sweep(catmull(pts), 0.0028, { bone: head, color: INK, sides: 4 });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.004, 5, 4), INK, { bone: head, at: P(s * 0.014, 0.105, 0.155) });
    // eardrum discs
    b.part(new THREE.CylinderGeometry(0.0175, 0.0175, 0.004, 10), WART, {
      bone: head,
      at: P(s * 0.061, 0.087, 0.07),
      dir: [s, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.0046, 10), "#a9b86a", {
      bone: head,
      at: P(s * 0.0625, 0.087, 0.07),
      dir: [s, 0, 0],
    });
    // eyes
    const E = P(s * 0.04, 0.118, 0.07);
    const eye = b.part(new THREE.SphereGeometry(0.024, 10, 8), "#c8a43a", { bone: head, at: E });
    const d = V(s * 0.45, 0.3, 0.85).normalize();
    b.decal(eye, EYE, {
      at: E.clone().addScaledVector(d, 0.024),
      dir: d,
      size: [0.036, 0.036],
      mirror: s > 0,
      segments: 8,
      lift: 0.001,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), FROG, {
      bone: head,
      at: E.clone().add(V(0, 0.013, -0.006)),
      scale: [0.027, 0.012, 0.027],
    });
  }

  // toes and webbing
  function toes(base: THREE.Vector3, s: number, angles: number[], lens: number[], bone: ReturnType<typeof b.joint>, web: boolean) {
    const tips = angles.map((a, i) => base.clone().add(V(Math.sin(a * DEG) * s, 0, Math.cos(a * DEG)).multiplyScalar(lens[i])));
    tips.forEach((tip) => {
      b.rod(base, tip, [0.0075, 0.005], { color: TOE, bone, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0085, 6, 4), PAD, { bone, at: tip });
    });
    if (web)
      for (let i = 0; i < tips.length - 1; i++)
        b.slab([base, tips[i], tips[i + 1]], { thickness: 0.002, color: WEB, bone });
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // hind leg
    const hindPts = [
      P(s * 0.065, 0.052, -0.06),
      P(s * 0.115, 0.055, 0.03),
      P(s * 0.095, 0.0145, -0.085),
      P(s * 0.105, 0.0075, -0.03),
    ];
    const hind = b.chain(`hind${side}`, polyline(hindPts), {
      parent: hipsJ,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
    });
    b.sweep(hind, [0.03, 0.034, 0.028, 0.02, 0.015, 0.012, 0.01, 0.008], { color: FROG, sides: 8 });
    toes(hindPts[3], s, [-12, 6, 24, 42], [0.062, 0.078, 0.082, 0.066], hind.joints[hind.joints.length - 1], true);

    // front leg
    const armPts = [
      P(s * 0.062, 0.058, 0.015),
      P(s * 0.088, 0.032, -0.01),
      P(s * 0.078, 0.0105, 0.065),
      P(s * 0.08, 0.0075, 0.08),
    ];
    const arm = b.chain(`arm${side}`, polyline(armPts), {
      parent: chestJ,
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
    });
    b.sweep(arm, [0.022, 0.023, 0.019, 0.014, 0.012, 0.0105, 0.009], { color: FROG, sides: 8 });
    toes(armPts[3], s, [-18, -4, 10, 26], [0.034, 0.042, 0.042, 0.034], arm.joints[arm.joints.length - 1], false);
  }

  // ------------------------------------------------------------ seal chop (vermilion tablet at the rim)
  b.part(new THREE.BoxGeometry(0.12, 0.014, 0.12), "#9b2a24", { bone: root, at: [1.0, 0.007, 1.1], rotation: [0, 20, 0] });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    bone: root,
    at: [1.0, 0.0146, 1.1],
    dir: [0, 1, 0],
    axis: "z",
    up: [-0.342, 0, -0.94],
    texture: SEAL,
  });

  return b.root;
}
