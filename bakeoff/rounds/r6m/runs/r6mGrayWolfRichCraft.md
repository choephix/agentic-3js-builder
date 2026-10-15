```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  paint,
  mix,
  noise,
  mottle,
  grain,
  countershade,
  gradient,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frostmane Wolf",
  description: "Gray wolf standing alert, Warcraft-style: heavy shoulders, shaggy ruff, tribal war paint, on a snowy stone base.",
};

type V = [number, number, number];
const Y0 = 0.1; // top of the base
const P = (x: number, y: number, z: number): V => [x, y + Y0, z];

// palette
const CREAM = "#cfc7b4";
const FUR_D = "#3a3d44";
const FUR_L = "#8d9299";
const DARK = "#23252b";
const NOSE = "#16161a";
const BONE = "#e9e0c8";
const LEATHER = "#5a3a22";
const LEATHER_L = "#7d5632";
const PINK = "#8a5560";

// paints
const back = mottle(grain("#4b4f57", "#8f949b", { size: 0.03, axis: "z", seed: 2 }), "#2e3036", { size: 0.22, seed: 5 });
const coat = countershade(back, grain(CREAM, "#a79f8c", { size: 0.03, axis: "z", seed: 4 }), { level: -0.3, soft: 0.3 });
const legCoat = gradient(coat, "#b9b29f", P(0, 0.5, 0), P(0, 0.14, 0));
const ROCK = mottle("#565961", "#8a8d96", { size: 0.2, seed: 3 });
const BASEP = paint((p, n) => (n.y > 0.6 ? mix("#dde8f2", "#ffffff", noise(p, 0.12, 2)) : ROCK));

// textures
const EYE = svg(
  `<svg viewBox="0 0 60 40"><defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#fff2a0"/><stop offset="0.6" stop-color="#ffb21c"/><stop offset="1" stop-color="#d86a00"/></radialGradient></defs>
  <path d="M3 28 Q28 2 57 12 Q40 38 3 28Z" fill="url(#g)" stroke="#120d08" stroke-width="3.5" stroke-linejoin="round"/>
  <ellipse cx="32" cy="21" rx="4" ry="9" fill="#120d08" transform="rotate(-15 32 21)"/>
  <circle cx="27" cy="17" r="2.2" fill="#fff"/></svg>`,
  { size: 192 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="t" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9a9a9a"/></linearGradient></defs>
  <path d="M4 64 Q6 30 18 2 Q26 30 28 64Z" fill="url(#t)"/></svg>`,
  { size: 96 },
);
const claw = (c: string, rim: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><g fill="${c}" stroke="${rim}" stroke-width="2" stroke-linejoin="round">
    <path d="M8 6 Q14 30 6 58 Q22 36 18 8Z"/><path d="M26 4 Q34 30 26 60 Q42 38 36 6Z"/><path d="M44 6 Q52 30 46 56 Q60 36 54 10Z"/></g></svg>`,
    { size: 160 },
  );
const WARPAINT = claw("#8fdcff", "#1f4a7a");
const EMBLEM = claw("#efe3c0", "#3a1010");
const RUNE = svg(
  `<svg viewBox="0 0 40 60"><rect width="40" height="60" fill="#0b1a2a"/>
  <g stroke="#5fe6ff" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M20 6 V54"/><path d="M8 18 L20 28 L32 18"/><path d="M8 36 L20 46 L32 36"/><circle cx="20" cy="30" r="3"/></g></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: P(0, 0.78, -0.42), dir: [0, 0.05, 1], role: "spine" });
  const bodyPath = catmull([P(0, 0.78, -0.42), P(0, 0.8, -0.1), P(0, 0.83, 0.2), P(0, 0.86, 0.42)]);
  const spine = b.chain("spine", bodyPath, { parent: hips, role: "spine" });
  const neckPath = catmull([P(0, 0.86, 0.4), P(0, 0.97, 0.6), P(0, 1.05, 0.76)]);
  const neck = b.chain("neck", neckPath, { parent: spine.joints[2], role: "neck" });
  const nLast = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: nLast, at: P(0, 1.05, 0.76), aim: P(0, 1.07, 1.0), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 1.0, 0.88), aim: P(0, 0.99, 1.1), role: "jaw" });
  const tailPath = catmull([P(0, 0.8, -0.42), P(0, 0.72, -0.7), P(0, 0.58, -0.92), P(0, 0.4, -1.05)]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 4, role: "tail" });

  // ---------- body ----------
  const body = b.sweep(spine, (t) => [0.12 + 0.05 * t, 0.15 + 0.07 * t], { color: coat, shift: [0, -0.03] });
  const neckS = b.sweep(neck, [0.125, 0.1], { color: coat });
  b.sweep(tail, (t) => 0.07 + 0.05 * Math.sin(t * 2.6) - 0.03 * t, {
    color: gradient(coat, DARK, tailPath.at(0.78), tailPath.at(1)),
  });

  // heavy shoulders and haunches
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: spine.joints[2], at: P(s * 0.15, 0.8, 0.36), scale: [0.1, 0.17, 0.16] });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: hips, at: P(s * 0.16, 0.7, -0.4), scale: [0.1, 0.18, 0.18] });
  }
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: spine.joints[2], at: P(0, 0.74, 0.46), scale: [0.15, 0.17, 0.14] });

  // fur cards
  const bs = b.surface(body);
  b.cards(bs.scatter(200, { rng: R, minDist: 0.055, filter: (h) => h.n.y > -0.2 }), TUFT, {
    size: [0.05, 0.11], lean: 70, bend: 25, flow: [0, -0.25, -1], vary: 0.3, rng: rng(4), color: coat, sink: 0.2,
  });
  b.cards(b.surface(neckS).scatter(60, { rng: rng(5), minDist: 0.05 }), TUFT, {
    size: [0.05, 0.11], lean: 70, bend: 25, flow: [0, -0.25, -1], vary: 0.3, rng: rng(6), color: coat, sink: 0.2,
  });

  // dorsal ridge
  b.along(body, 8, (at) => b.spike(at, at, 0.1, 0.035, { color: FUR_D, section: { ngon: 4 } }));

  // neck ruff rings
  [0.12, 0.4, 0.68].forEach((t, k) => {
    b.ring(neck.at(t), { count: 12, radius: 0.12 - k * 0.008, tilt: -60 }, (it) =>
      b.spike(it, it, 0.17, 0.045, {
        color: it.t > 0.3 && it.t < 0.7 ? CREAM : (it.i + k) % 2 ? FUR_L : FUR_D,
        section: { ngon: 4 },
      }),
    );
  });
  // chest tufts
  for (const x of [-0.1, -0.05, 0, 0.05, 0.1])
    b.spike(P(x, 0.72, 0.52), [0, -1, 0.35], 0.15, 0.04, { color: CREAM, bone: spine.joints[2], section: { ngon: 4 } });

  // collar, pendant
  const ns = b.surface(neckS);
  const cp = neck.at(0.85);
  b.sweep(ns.loop(cp, { lift: 0.012 }), 0.02, { color: LEATHER });
  const front = ns.around(cp.at).at(0, 0);
  if (front) {
    b.spike(front, [0, -1, 0.25], 0.11, 0.028, { color: BONE, bone: nLast });
    b.part(new THREE.SphereGeometry(0.022, 6, 5), LEATHER_L, { bone: nLast, at: front.at });
  }

  // war paint on flanks
  for (const s of [1, -1])
    b.decal(body, WARPAINT, { at: P(s * 0.2, 0.84, 0.18), dir: [s, 0, 0], size: [0.28, 0.28], mirror: s < 0 });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), coat, { bone: head, at: P(0, 1.08, 0.84), scale: [0.11, 0.1, 0.13] });
  b.frustumBox(P(0, 1.05, 0.9), P(0, 1.04, 1.13), [0.14, 0.09], [0.085, 0.065], { bone: head, color: mottle("#a8a291", "#7b7d80", { size: 0.08, seed: 8 }) });
  b.part(new THREE.SphereGeometry(1, 7, 6), NOSE, { bone: head, at: P(0, 1.055, 1.135), scale: [0.035, 0.028, 0.03] });
  b.frustumBox(P(0, 0.985, 0.9), P(0, 0.99, 1.1), [0.11, 0.04], [0.07, 0.03], { bone: jaw, color: CREAM });
  b.frustumBox(P(0, 1.0, 0.92), P(0, 1.0, 1.1), [0.1, 0.012], [0.06, 0.012], { bone: jaw, color: PINK });
  for (const s of [1, -1]) {
    // fangs
    b.spike(P(s * 0.035, 1.0, 1.08), [0, -1, 0.1], 0.05, 0.013, { color: BONE, bone: head });
    b.spike(P(s * 0.03, 1.006, 1.06), [0, 1, 0.1], 0.04, 0.011, { color: BONE, bone: jaw });
    // ears
    b.extrude([[-0.05, 0], [0.05, 0], [0, 0.17, "sharp"]], { at: P(s * 0.06, 1.14, 0.78), x: [s, 0, 0], thickness: 0.025, color: coat, bone: head });
    b.extrude([[-0.03, 0.01], [0.03, 0.01], [0, 0.13, "sharp"]], { at: P(s * 0.06, 1.14, 0.795), x: [s, 0, 0], thickness: 0.012, color: PINK, bone: head });
    // brows
    b.rod(P(s * 0.035, 1.145, 0.93), P(s * 0.1, 1.125, 0.88), 0.016, DARK, { bone: head });
    // cheek ruff
    for (let k = 0; k < 4; k++)
      b.spike(P(s * 0.1, 1.06 - 0.018 * k, 0.78 + 0.02 * k), [s * 0.7, -0.3, -0.7], 0.13, 0.032, { color: k % 2 ? CREAM : FUR_L, bone: head, section: { ngon: 4 } });
    // glowing eyes
    glow(
      b.decal(skull, EYE, { at: P(s * 0.08, 1.11, 0.9), dir: [s * 0.7, 0.15, 0.7], size: [0.075, 0.05], mirror: s > 0 }),
      1.2,
    );
  }

  // ---------- legs ----------
  const makeLeg = (side: string, s: number, front: boolean) => {
    const pts = front
      ? limb(P(s * 0.15, 0.8, 0.38), P(s * 0.15, 0.07, 0.42), [0.3, 0.3, 0.22], [[0, 0, -1], [0, 0, 1]])
      : limb(P(s * 0.16, 0.78, -0.4), P(s * 0.16, 0.07, -0.5), [0.34, 0.34, 0.22], [[0, 0, 1], [0, 0, -1]]);
    const nm = front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`]
      : [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`];
    const leg = b.chain(front ? `legF${side}` : `legH${side}`, pts, {
      parent: front ? spine.joints[2] : hips, names: nm, role: "leg",
    });
    b.sweep(leg, front ? [0.085, 0.065, 0.045, 0.042, 0.05] : [0.1, 0.07, 0.045, 0.04, 0.05], { color: legCoat });
    const end = pts[3];
    b.part(new THREE.SphereGeometry(1, 9, 7), "#8f8a7c", { bone: leg.tip!, at: [end.x, Y0 + 0.045, end.z + 0.05], scale: [0.062, 0.045, 0.11] });
    for (const k of [-1, 0, 1])
      b.spike([end.x + k * 0.035, Y0 + 0.032, end.z + 0.15], [0, -0.1, 1], 0.05, 0.014, { color: DARK, bone: leg.tip! });
    // fur tuft behind elbow/hock
    b.spike([end.x, pts[2].y + 0.02, pts[2].z - 0.03], [0, -0.3, -1], 0.1, 0.03, { color: CREAM, bone: leg.joints[2], section: { ngon: 4 } });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    makeLeg(side, s, true);
    makeLeg(side, s, false);
  }

  // ---------- base & props ----------
  b.lathe([[0, 0], [1.0, 0], [1.05, 0.05], [0.98, 0.09], [0.8, 0.115], [0, 0.13]], { at: [0, 0, 0], bone: hips, color: BASEP, segments: 14 });

  const rock = (x: number, z: number, r: number, sy: number) =>
    b.part(new THREE.DodecahedronGeometry(r, 0), ROCK, { bone: hips, at: P(x, r * sy * 0.6, z), scale: [1, sy, 1], flat: true });
  rock(0.62, 0.2, 0.12, 0.7);
  rock(-0.45, 0.6, 0.1, 0.6);
  rock(0.35, -0.75, 0.14, 0.8);
  rock(-0.3, -0.8, 0.09, 0.7);
  for (const [x, z, r] of [[0.3, 0.55, 0.12], [-0.6, -0.55, 0.14], [0.8, -0.1, 0.1], [-0.15, 0.78, 0.1]] as const)
    b.part(new THREE.SphereGeometry(r, 7, 5), "#f4f8fc", { bone: hips, at: P(x, 0, z), scale: [1, 0.35, 1] });

  // rune stone
  const sa = (25 * Math.PI) / 180;
  const sd: V = [Math.sin(sa), 0, Math.cos(sa)];
  const sc: V = P(-0.68, 0.28, -0.1);
  b.part(new THREE.BoxGeometry(0.3, 0.56, 0.13), ROCK, { bone: hips, at: sc, dir: sd, axis: "z", flat: true });
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.3), "#ffffff", {
      bone: hips, at: [sc[0] + sd[0] * 0.067, sc[1] + 0.02, sc[2] + sd[2] * 0.067], dir: sd, axis: "z", texture: RUNE,
    }),
    1.3,
  );
  b.part(new THREE.BoxGeometry(0.32, 0.05, 0.15), "#f4f8fc", { bone: hips, at: P(-0.68, 0.575, -0.1), dir: sd, axis: "z" });

  // pine
  const PINE = "#1f4a35";
  b.part(new THREE.CylinderGeometry(0.03, 0.045, 0.3, 6), "#4a3220", { bone: hips, at: P(0.72, 0.15, -0.55) });
  [0, 1, 2].forEach((i) => {
    const rr = 0.26 - i * 0.07;
    const y = 0.38 + i * 0.2;
    b.part(new THREE.ConeGeometry(rr, 0.32, 7), PINE, { bone: hips, at: P(0.72, y, -0.55), flat: true });
    b.part(new THREE.ConeGeometry(rr * 0.62, 0.2, 7), "#f4f8fc", { bone: hips, at: P(0.72, y + 0.09, -0.55), flat: true });
  });

  // ice crystals
  [[0.58, 0.58, 0.32, 8], [0.66, 0.5, 0.22, -12], [0.5, 0.5, 0.18, 14], [0.62, 0.66, 0.15, -6]].forEach(([x, z, h, tilt], i) => {
    glow(
      b.part(new THREE.ConeGeometry(0.045, h, 5), i % 2 ? "#a6f0ff" : "#6fd6ff", {
        bone: hips, at: P(x, h / 2, z), rotation: [tilt, 0, tilt * 0.6], flat: true,
      }),
      1.2,
    );
  });

  // banner pole
  b.part(new THREE.CylinderGeometry(0.014, 0.018, 0.95, 6), "#4a3220", { bone: hips, at: P(-0.8, 0.475, 0.4) });
  b.part(new THREE.ConeGeometry(0.03, 0.08, 6), "#c9c9d2", { bone: hips, at: P(-0.8, 0.99, 0.4) });
  b.extrude([[0, 0], [0.3, 0], [0.3, -0.3], [0.15, -0.2], [0, -0.3]], {
    at: P(-0.8, 0.92, 0.4), x: [0, 0, 1], thickness: 0.01, color: "#8e1b1b", bone: hips,
  });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
      bone: hips, at: P(-0.8 + s * 0.008, 0.8, 0.55), dir: [s, 0, 0], axis: "z", texture: EMBLEM,
    });

  return b.root;
}
```