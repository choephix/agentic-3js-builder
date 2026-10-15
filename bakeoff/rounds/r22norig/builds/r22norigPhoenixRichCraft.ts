import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { mix, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Phoenix",
  description: "A cel-shaded flame phoenix with spread feathered wings, long trailing tail plumes, gold filigree and glowing pyro embers, perched on a charred ember plinth.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const RED = "#e8372a";
const DEEP = "#8c1730";
const ORANGE = "#ff8a1c";
const GOLD = "#ffd45a";
const CREAM = "#fff2c4";
const BEAK = "#f2b13a";
const CLAW = "#4a1f2c";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

type Stops = ReadonlyArray<readonly [number, string]>;
function ramp(u: number, stops: Stops) {
  if (u <= stops[0][0]) return mix(stops[0][1], stops[0][1], 0);
  for (let i = 1; i < stops.length; i++) {
    if (u <= stops[i][0]) {
      const a = stops[i - 1];
      const c = stops[i];
      return mix(a[1], c[1], (u - a[0]) / (c[0] - a[0]));
    }
  }
  const last = stops[stops.length - 1][1];
  return mix(last, last, 0);
}

function featherPaint(L: number, stops: Stops): Paint {
  return cel(
    paint((_p, _n, s) => {
      if (Math.abs(s[1]) < 0.006 && s[0] > 0.04 * L) return CREAM;
      return ramp(s[0] / L, stops);
    }),
  );
}

const FEATHER_TEX = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b0202c"/><stop offset="0.5" stop-color="#ff6a1c"/><stop offset="1" stop-color="#ffd45a"/></linearGradient></defs><path d="M16 62 C4 48 2 28 16 2 C30 28 28 48 16 62Z" fill="url(#g)" stroke="#6b1425" stroke-width="2"/><path d="M16 60 L16 8" stroke="#fff2c4" stroke-width="2.5"/></svg>`,
  { size: 128 },
);

const FLAME_TEX = svg(
  `<svg viewBox="0 0 64 128"><path d="M32 2 C44 36 62 52 56 88 C52 114 14 120 8 88 C4 58 24 42 32 2Z" fill="#ff5a1a"/><path d="M32 30 C42 56 52 68 48 94 C44 112 18 114 16 92 C14 72 28 60 32 30Z" fill="#ffa229"/><path d="M32 62 C38 76 42 84 38 100 C35 110 24 110 24 98 C22 86 30 78 32 62Z" fill="#fff0a0"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(7);

  // ---------- plinth ----------
  const stone = cel(paint((p) => ramp(0.5 + 0.5 * Math.sin(p.x * 23 + p.z * 17) * Math.cos(p.z * 11), [[0, "#3a2630"], [1, "#5b3b44"]])));
  b.lathe(
    [
      [0, 0],
      [0.64, 0],
      [0.64, 0.05],
      [0.54, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 14, color: stone },
  );
  const rimPts: number[][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rimPts.push([Math.sin(a) * 0.5, 0.105, Math.cos(a) * 0.5]);
  }
  glow(b.sweep(catmull(rimPts, { closed: true }), 0.012, "#ff9a2a", { sides: 5 }), 1.2);

  // ---------- body, neck ----------
  const bodyPaint = cel(furEdge(RED, GOLD, { level: -0.25, teeth: 0.22, period: 0.03, ink: INK }));
  const bodyPath = catmull([
    [0, 0.88, -0.38],
    [0, 0.98, -0.05],
    [0, 1.1, 0.25],
    [0, 1.38, 0.42],
    [0, 1.6, 0.48],
  ]);
  const body = b.sweep(bodyPath, [0.1, 0.2, 0.245, 0.14, 0.095], bodyPaint, { sides: 10 });

  // gold neck collars
  for (const t of [0.72, 0.8]) {
    const at = body.at(t);
    b.part(new THREE.TorusGeometry(at.radius * 1.12, 0.012, 5, 14), GOLD, { at, dir: at.tangent, axis: "z" });
  }

  // chest gem with gold setting
  const gemAt: [number, number, number] = [0, 1.12, 0.51];
  b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 12), GOLD, { at: gemAt, dir: [0, 0.1, 1], axis: "z" });
  glow(b.part(new THREE.OctahedronGeometry(0.045), "#ffe27a", { at: [0, 1.12, 0.53] }), 1.5);

  // breast + neck feather cards
  const hits = b.surface(body).scatter(240, { rng: rng(3), minDist: 0.05, filter: (h) => h.n.y > -0.4 });
  b.cards(hits, FEATHER_TEX, { size: [0.075, 0.15], lean: 62, bend: 20, vary: 0.3, rng: rng(4), spin: 8 });

  // ---------- head ----------
  const HEAD_C = V(0, 1.64, 0.5);
  const headPaint = cel(furEdge(RED, CREAM, { by: "position", level: 1.58, teeth: 0.02, period: 0.03, along: [1, 0, 0] }));
  const head = b.part(new THREE.SphereGeometry(0.125, 12, 9), headPaint, { at: HEAD_C, scale: [1, 1, 1.08] });
  const skin = b.surface(head);
  const EYE = animeEye({ iris: "#ffb81c", blush: false });
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 52, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.062, 0.085], mirror: s > 0 });
  }
  // beak
  b.spike([0, 1.625, 0.6], [0, -0.22, 1], 0.2, 0.052, BEAK, { sides: 6 });
  b.spike([0, 1.585, 0.6], [0, 0.0, 1], 0.15, 0.036, "#d9902a", { sides: 6 });
  // brow gem
  glow(b.part(new THREE.OctahedronGeometry(0.025), "#ffe27a", { at: [0, 1.745, 0.56] }), 1.5);
  // cheek feathers
  for (const s of [1, -1]) {
    b.spike([s * 0.1, 1.6, 0.46], [s * 0.7, -0.1, -0.7], 0.2, 0.035, ORANGE, { sides: 5 });
    b.spike([s * 0.09, 1.57, 0.45], [s * 0.6, -0.4, -0.7], 0.16, 0.03, GOLD, { sides: 5 });
  }

  // crest plumes
  const crestCols = [DEEP, RED, ORANGE, GOLD, ORANGE, RED, DEEP];
  for (let i = 0; i < 7; i++) {
    const x0 = (i - 3) * 0.028;
    const k = i - 3;
    const path = catmull([
      [x0, 1.74, 0.5],
      [k * 0.07, 1.9 - Math.abs(k) * 0.03, 0.4],
      [k * 0.14, 2.0 - Math.abs(k) * 0.08, 0.12],
      [k * 0.2, 1.98 - Math.abs(k) * 0.12, -0.12],
    ]);
    b.sweep(path, (t) => [0.03 * (1 - t) + 0.006, 0.008], cel(crestCols[i]), { caps: "point" });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.11, 8, 6), cel(RED), { at: [s * 0.14, 0.92, 0.0], scale: [0.9, 1.1, 1.1] });
    const leg = b.sweep(
      catmull([
        [s * 0.14, 0.92, 0.0],
        [s * 0.16, 0.66, 0.13],
        [s * 0.13, 0.36, 0.0],
        [s * 0.13, 0.14, 0.06],
      ]),
      [0.06, 0.04, 0.026, 0.022],
      cel(ORANGE),
      { sides: 7 },
    );
    for (const t of [0.6, 0.85]) {
      const at = leg.at(t);
      b.part(new THREE.TorusGeometry(at.radius * 1.15, 0.01, 5, 10), GOLD, { at, dir: at.tangent, axis: "z" });
    }
    b.part(new THREE.SphereGeometry(0.04, 6, 4), cel(ORANGE), { at: [s * 0.13, 0.12, 0.06] });
    for (const dx of [-0.07, 0, 0.07]) {
      const dir: [number, number, number] = [s * 0.13 * 0 + dx * 2, -0.04, 1];
      b.spike([s * 0.13, 0.11, 0.06], dir, 0.19, 0.022, cel(ORANGE), { sides: 5 });
      b.spike([s * 0.13 + dx * 0.4 * 2 + dx, 0.1, 0.24], [dx * 1.5, -0.45, 1], 0.07, 0.016, CLAW, { sides: 5 });
    }
    b.spike([s * 0.13, 0.11, 0.06], [0, 0, -1], 0.13, 0.02, cel(ORANGE), { sides: 5 });
  }

  // ---------- wings ----------
  const N = new THREE.Vector3(0, 1, 0.15);
  const tips: THREE.Vector3[] = [];
  const feather = (root: THREE.Vector3, d: THREE.Vector3, L: number, w: number, pal: Paint) => {
    const x = d.clone().normalize();
    const y = N.clone().cross(x).normalize();
    b.extrude(
      [
        [0, 0],
        [L * 0.25, w * 0.5],
        [L * 0.7, w * 0.45],
        [L, 0, "sharp"],
        [L * 0.7, -w * 0.45],
        [L * 0.25, -w * 0.5],
      ],
      { at: root, x, y, thickness: 0.008, smoothing: 1, color: pal },
    );
  };

  for (const s of [1, -1]) {
    const S = V(s * 0.2, 1.18, 0.08);
    const E = V(s * 0.7, 1.42, 0.14);
    const W = V(s * 1.25, 1.95, 0.0);
    const H = V(s * 1.75, 2.25, -0.1);
    const arm = catmull([S, E, W]);

    // secondaries
    const nS = 9;
    for (let i = 0; i < nS; i++) {
      const t = i / (nS - 1);
      const root = arm.at(0.1 + 0.9 * t);
      root.y += i * 0.0012;
      const d = V(s * (0.1 + 0.5 * t), 0.03, -1);
      const L = 0.62 + 0.3 * Math.sin(Math.PI * (0.2 + 0.7 * t));
      feather(root, d, L, 0.2, featherPaint(L, [[0, DEEP], [0.35, RED], [0.75, ORANGE], [1, GOLD]]));
    }
    // primaries
    const nP = 9;
    for (let i = 0; i < nP; i++) {
      const k = i / (nP - 1);
      const root = W.clone().lerp(H, k);
      root.y += 0.004 + i * 0.0012;
      const a = (55 - 50 * k) * (Math.PI / 180);
      const d = V(s * Math.cos(a), 0.27 * Math.cos(a) + 0.05, -Math.sin(a) * 0.9);
      const L = 0.7 + 0.25 * Math.sin(Math.PI * (0.15 + 0.7 * k));
      feather(root, d, L, 0.17, featherPaint(L, [[0, DEEP], [0.3, RED], [0.65, ORANGE], [1, GOLD]]));
      tips.push(root.clone().addScaledVector(d.clone().normalize(), L * 0.98));
    }
    // secondary coverts
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const root = arm.at(0.08 + 0.92 * t);
      root.y += 0.014 + i * 0.001;
      root.z += 0.07;
      const d = V(s * (0.1 + 0.5 * t), 0.03, -1);
      feather(root, d, 0.4, 0.15, featherPaint(0.4, [[0, RED], [0.5, ORANGE], [1, GOLD]]));
    }
    // primary coverts
    for (let i = 0; i < 7; i++) {
      const k = i / 6;
      const root = W.clone().lerp(H, k);
      root.y += 0.016 + i * 0.001;
      root.z += 0.05;
      const a = (50 - 45 * k) * (Math.PI / 180);
      const d = V(s * Math.cos(a), 0.27 * Math.cos(a) + 0.05, -Math.sin(a) * 0.9);
      feather(root, d, 0.36, 0.13, featherPaint(0.36, [[0, ORANGE], [0.6, GOLD], [1, CREAM]]));
    }
    // arm bone and gold fittings
    b.sweep(arm, [0.075, 0.05, 0.035], cel(RED), { sides: 7 });
    b.sweep([W, H], [0.036, 0.02], cel(DEEP), { sides: 6 });
    b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 10), GOLD, { at: W, dir: W.clone().sub(E), axis: "z" });
    b.spike(H, [s * 1, 0.5, 0.2], 0.16, 0.025, BEAK, { sides: 5 });
    // leading-edge feather cards
    const fr = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => frame(arm.at(t).add(V(0, 0.05, 0.05)), [0, 1, 0]));
    b.cards(fr, FEATHER_TEX, { size: [0.08, 0.16], lean: 70, flow: [s * 0.4, 0, -1], bend: 15, rng: rng(11), vary: 0.2 });
  }

  // wingtip flames
  glow(
    b.cards(
      tips.map((p) => frame(p, [0, 1, 0])),
      FLAME_TEX,
      { size: [0.1, 0.24], cross: true, rng: rng(21), vary: 0.2 },
    ),
    1,
  );

  // ---------- tail ----------
  const tailCols: Stops[] = [
    [[0, DEEP], [0.4, RED], [0.8, ORANGE], [1, GOLD]],
    [[0, RED], [0.5, ORANGE], [1, GOLD]],
  ];
  const tailTips: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const k = (i - 4) / 4;
    const ak = Math.abs(k);
    const end: [number, number, number] = [k * 0.6, 0.28 + 0.14 * ak, -2.15 + 0.7 * ak];
    const path = catmull([
      [k * 0.02, 0.9, -0.4],
      [k * 0.15, 0.78, -1.0],
      [k * 0.35, 0.5 + 0.1 * ak, -1.55 + 0.3 * ak],
      end,
    ]);
    const len = path.length;
    b.sweep(path, (t) => [0.012 + 0.075 * Math.sin(Math.PI * Math.pow(t, 0.7)), 0.008], cel(
      paint((_p, _n, s) => ramp(s[0], tailCols[i % 2])),
    ), { caps: "point" });
    // gold eye spot
    const t0 = 0.8;
    const sp = path.at(t0);
    b.part(new THREE.SphereGeometry(0.035, 6, 4), GOLD, { at: sp.clone().add(V(0, 0.01, 0)), dir: path.tangentAt(t0), axis: "z", scale: [1, 0.3, 1.5] });
    if (len > 0) tailTips.push(path.at(1));
  }
  glow(
    b.cards(
      tailTips.map((p) => frame(p, [0, 1, 0])),
      FLAME_TEX,
      { size: [0.12, 0.3], cross: true, rng: rng(31), vary: 0.2 },
    ),
    1,
  );

  // ---------- ember details ----------
  const flameFrames = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    flameFrames.push(frame([Math.sin(a) * 0.56, 0.1, Math.cos(a) * 0.56], [0, 1, 0]));
  }
  glow(b.cards(flameFrames, FLAME_TEX, { size: [0.12, 0.26], cross: true, rng: rng(41), vary: 0.3 }), 1);

  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.3 + R() * 0.9;
    glow(b.part(new THREE.OctahedronGeometry(0.014 + R() * 0.012), i % 3 ? "#ffb347" : "#ffe27a", { at: [Math.sin(a) * r, 0.5 + R() * 1.6, Math.cos(a) * r - 0.2] }), 1.4);
  }

  return b.root;
}
