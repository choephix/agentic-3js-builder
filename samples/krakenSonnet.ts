import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { mix, mottle, paint } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Sector, Sweep } from "../src/sweep";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Kraken, Rising",
  description:
    "A towering armoured kraken heaving out of the sea, eight arms and two club-tipped feeding tentacles spread wide, with glowing orange suckers, plated sleeves, a snapped harpoon and a stolen anchor.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const INK = "#161a46";
const DEEP = "#262b82";
const SIDE = "#3b44b4";
const LIGHT = "#6573e2";
const CREAM = "#f3dfcc";
const PEACH = "#e9b59d";
const ICE = "#e7eefb";
const ICE_D = "#b4c4e6";
const STEEL = "#59629a";
const STEEL_D = "#2d3366";
const ORANGE = "#ff7a1f";
const GOLD = "#ffc247";
const MAROON = "#4a1830";
const WOOD = "#8a5a33";
const IRON = "#3d4152";
const ROPE = "#c9a56a";
const WATER_D = "#1c6a8a";
const WATER = "#2e8fae";
const WATER_L = "#6fc7da";
const FOAM = "#eafcff";
const SHELL = "#d8ccae";

// ---------------------------------------------------------------- helpers
function keyed(keys: number[], t: number) {
  const n = keys.length - 1;
  const x = Math.min(Math.max(t, 0), 1) * n;
  const i = Math.min(Math.floor(x), n - 1);
  const u = x - i;
  const p0 = keys[Math.max(i - 1, 0)];
  const p1 = keys[i];
  const p2 = keys[i + 1];
  const p3 = keys[Math.min(i + 2, n)];
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u)
  );
}

const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#fff2b0"/><stop offset="0.45" stop-color="#ffb02e"/>
    <stop offset="0.85" stop-color="#ff6a14"/><stop offset="1" stop-color="#c8400a"/></radialGradient></defs>
  <circle cx="64" cy="64" r="62" fill="url(#g)"/>
  <circle cx="64" cy="64" r="60" fill="none" stroke="#ffd98a" stroke-width="3"/>
  <path d="M64 6 L64 22 M64 106 L64 122 M6 64 L22 64 M106 64 L122 64" stroke="#c8400a" stroke-width="4"/>
  <rect x="22" y="50" width="84" height="28" rx="14" fill="#1a0b22"/>
  <rect x="30" y="56" width="68" height="6" rx="3" fill="#3b1544"/>
  <circle cx="92" cy="34" r="10" fill="#ffffff"/><circle cx="40" cy="92" r="5" fill="#fff3c8"/></svg>`,
  { size: 256 },
);

const GLYPH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200">
  <g fill="none" stroke="#ff7a1f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M50 8 L50 192"/>
    <path d="M18 40 L50 64 L82 40"/><path d="M18 84 L50 108 L82 84"/><path d="M26 128 L50 146 L74 128"/>
    <circle cx="50" cy="172" r="12"/>
  </g>
  <circle cx="50" cy="172" r="5" fill="#ffc247"/></svg>`,
  { size: 256 },
);

const SCAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g stroke="#e7eefb" stroke-width="6" stroke-linecap="round" fill="none">
    <path d="M14 10 L50 94"/><path d="M38 6 L72 88"/><path d="M64 4 L92 70"/></g></svg>`,
  { size: 192 },
);

const KELP_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120">
  <path d="M20 118 C4 96 34 80 17 56 C7 36 29 20 20 2 C35 22 13 38 26 58 C39 82 8 98 20 118Z" fill="#3c9a72"/>
  <path d="M20 112 C12 92 28 78 19 58 C14 40 24 26 20 10" fill="none" stroke="#7fd6a4" stroke-width="2.5"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "kraken", paintSize: 2048 });
  const rand = rng(11);
  const CZ = 0.62; // plan centre of the arm crown (z)

  // ------------------------------------------------------------ skeleton: body
  const bodyPath = catmull([
    [0, 2.45, 0.62],
    [0, 3.4, 0.45],
    [0, 5.1, -0.05],
    [0, 6.8, -0.75],
    [0, 8.4, -1.55],
  ]);
  const core = b.joint("core", { at: [0, 3.4, 0.45], role: "spine" });
  const rootT = bodyPath.closestT(core.at);
  const mantle = b.chain("mantle", bodyPath.slice(rootT, 1), { parent: core, count: 5, role: "spine" });
  const head = b.joint("head", { parent: core, at: [0, 3.1, 0.65], aim: [0, 3.1, 2.5], role: "head" });

  const bodyR = (t: number) => keyed([1.3, 1.8, 1.9, 1.76, 1.46, 1.06, 0.55, 0.08], t);
  const bellyN = (n: THREE.Vector3) => n.z > 0.8 || n.y < -0.5;

  const topSkin = mottle(DEEP, SIDE, { size: 1.0, contrast: 0.7, seed: 3 });
  const sideSkin = mottle(SIDE, LIGHT, { size: 0.8, contrast: 0.6, seed: 5 });
  const bellySkin = mottle(CREAM, PEACH, { size: 0.7, contrast: 0.6, seed: 8 });
  const bodyLen = bodyPath.length;
  const mantlePaint = paint((_p, n, s) => {
    const ring = (((s[0] * bodyLen) / 0.55) % 1 + 1) % 1;
    const belly = bellyN(n);
    if (s[0] > 0.34 && s[0] < 0.96 && ring < 0.045) return belly ? PEACH : INK;
    if (Math.abs(n.z - 0.8) < 0.03 && n.y > -0.5) return ORANGE;
    if (belly) return bellySkin;
    return n.y > 0.35 || n.z < -0.45 ? topSkin : sideSkin;
  });

  const bodyS = b.sweep(bodyPath, (t) => bodyR(t), {
    bone: [mantle, core],
    color: mantlePaint,
    sides: 14,
  });
  const skin = b.surface(bodyS);
  const tipJoint = mantle.joints[mantle.joints.length - 1];

  // tail crest on the mantle tip
  b.spike(bodyPath.at(0.97), bodyPath.tangentAt(1), 0.8, 0.16, { color: ICE, bone: tipJoint, sides: 8 });
  glow(b.spike(bodyPath.at(1.0), bodyPath.tangentAt(1), 0.62, 0.075, { color: ORANGE, bone: tipJoint, sides: 6 }));

  // ------------------------------------------------------------ mantle armour
  const mantleBones = mantle.joints;
  const mantleBoneAt = (t: number) => mantleBones[Math.min(mantleBones.length - 1, Math.floor(((t - rootT) / (1 - rootT)) * mantleBones.length))];
  const frontN = (t: number) => {
    const T = bodyPath.tangentAt(t);
    return new THREE.Vector3(0, -T.z, T.y).normalize();
  };
  // dorsal crest: a row of swept-back spines down the back
  for (let k = 0; k < 7; k++) {
    const t = 0.34 + 0.085 * k;
    const r = bodyR(t);
    const P = bodyPath.at(t);
    const back = frontN(t).multiplyScalar(-1);
    const hit = skin.nearest(P.clone().addScaledVector(back, r + 0.5));
    const T = bodyPath.tangentAt(t);
    b.spike(hit, hit.n.clone().multiplyScalar(0.6).addScaledVector(T, 0.8), 0.62 - k * 0.035, 0.2 - k * 0.012, {
      color: ICE,
      bone: mantleBoneAt(t),
      sides: 6,
    });
    glow(
      b.spike(hit.moved([0, 0.0, 0]), hit.n.clone().multiplyScalar(0.6).addScaledVector(T, 0.8), 0.7 - k * 0.035, 0.07, {
        color: ORANGE,
        bone: mantleBoneAt(t),
        sides: 5,
      }),
      1.1,
    );
  }

  // armour bands: steel collar at the neck, then white bars with glowing seams up the mantle
  const collarSpecs: [number, number, string][] = [
    [0.04, 0.17, STEEL],
    [0.3, 0.15, ICE],
    [0.5, 0.13, ICE],
    [0.68, 0.11, ICE],
    [0.84, 0.09, ICE],
  ];
  for (const [u, rad, col] of collarSpecs) {
    const lp = skin.loop(mantle.at(u), { lift: 0.02 });
    b.sweep(lp, rad, { color: col, sides: 6 });
    const lp2 = skin.loop(mantle.at(Math.min(0.97, u + 0.04)), { lift: 0.015 });
    glow(b.sweep(lp2, rad * 0.3, { color: ORANGE, sides: 5 }), 1.1);
  }

  // glowing chevron lines on the flanks
  for (const s of [1, -1]) {
    const pts: THREE.Vector3[] = [];
    for (let t = 0.4; t <= 0.93; t += 0.045) {
      const r = bodyR(t) * 1.012;
      const P = bodyPath.at(t);
      const phi = (46 + (t - 0.4) * 30) * DEG;
      pts.push(
        P.clone()
          .addScaledVector(new THREE.Vector3(s, 0, 0), r * Math.sin(phi))
          .addScaledVector(frontN(t), r * Math.cos(phi)),
      );
    }
    glow(b.sweep(catmull(pts), (t) => 0.05 * (1 - t * 0.6) + 0.015, { bone: [mantle, core], color: ORANGE, sides: 5 }), 1.1);
  }

  // glowing sensor dots over the shoulders
  for (const hit of skin.scatter(26, {
    rng: rand,
    minDist: 0.55,
    filter: (h) => Math.abs(h.n.x) > 0.45 && h.at.y > 4.0 && h.at.y < 7.4,
  })) {
    glow(b.stick(new THREE.SphereGeometry(0.075, 6, 4), GOLD, hit, { embed: 0.3 }), 1.2);
  }

  // glyph tattoos + scar
  for (const s of [1, -1]) {
    const gh = skin.nearest([s * 3, 5.6, -0.45]);
    glow(
      b.decal(bodyS, GLYPH, { at: gh.at, dir: gh.n, size: [0.56, 1.12], mirror: s < 0, lift: 0.004, name: `glyph${s > 0 ? "L" : "R"}` }),
      1.1,
    );
  }
  {
    const sh = skin.nearest([-3, 3.9, 0.55]);
    b.decal(bodyS, SCAR, { at: sh.at, dir: sh.n, size: [0.8, 0.8], roll: -12, lift: 0.004, name: "scar" });
  }

  // barnacles
  for (const hit of skin.scatter(10, {
    rng: rng(21),
    minDist: 0.5,
    filter: (h) => h.at.y < 4.4 && h.at.y > 2.7 && h.n.z < 0.3 && h.n.y > -0.2,
  })) {
    b.stick(new THREE.ConeGeometry(0.12, 0.16, 7), SHELL, hit, { embed: 0.25 });
    b.stick(new THREE.ConeGeometry(0.075, 0.12, 6), ICE_D, hit.moved([0.1, 0, 0.06]), { embed: 0.25 });
  }

  // ------------------------------------------------------------ fins
  const fm = bodyPath.at(0.5);
  const fmDir = bodyPath.at(0.93).clone().sub(fm).normalize();
  const fLen = 3.1;
  const L = bodyLen;
  const bodyRat = (u: number) => bodyR(0.5 + u / L) * 0.82;
  for (const s of [1, -1]) {
    const finJ = b.joint(`fin${s > 0 ? "L" : "R"}`, {
      parent: mantleBoneAt(0.55),
      at: [s * bodyR(0.55) * 0.9, fm.y + 0.4, fm.z - 0.3],
      dir: [s * 1, 0.2, -0.1],
      role: "fan",
    });
    const us = [0, 0.78, 1.55, 2.33, fLen];
    const bottom = us.map((u) => [u, bodyRat(u)]);
    const wid = [0.45, 1.1, 1.55, 1.2, 0.35];
    const outline: [number, number][] = [];
    for (const [u, v] of bottom) outline.push([u, v]);
    outline.push([fLen + 0.2, bodyRat(fLen) + 0.18]);
    for (let i = us.length - 2; i >= 0; i--) outline.push([us[i] + (i === 0 ? 0 : 0.05), bottom[i][1] + wid[i]]);
    b.extrude(outline, {
      at: fm,
      x: [fmDir.x, fmDir.y, fmDir.z],
      y: [s, 0.3, -0.12],
      thickness: [0.12, 0.05],
      bevel: 0.03,
      smoothing: 1,
      bone: finJ,
      color: paint((p, _n, sc) => {
        const ang = Math.atan2(sc[1] - 0.9, sc[0] + 0.3) * 5.0;
        const ray = (((ang % 1) + 1) % 1) < 0.2;
        const out = Math.abs(p.x) - bodyR(0.7);
        if (ray && out > 0.2) return ORANGE;
        if (out > 1.0) return LIGHT;
        if (out > 0.45) return SIDE;
        return DEEP;
      }),
      name: `fin${s > 0 ? "L" : "R"}`,
    });
  }

  // ------------------------------------------------------------ eyes, brow, mouth
  const center = core.at;
  const ER = 0.78; // eyeball radius
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eh = skin.around(center).at(s * 55, 26);
    if (!eh) throw new Error("no eye hit");
    const gaze = eh.n.clone().add(new THREE.Vector3(0, -0.05, 0.35)).normalize();
    const pos = eh.at.clone().addScaledVector(eh.n, 0.3);
    const eye = b.part(new THREE.SphereGeometry(ER, 14, 10), STEEL_D, { bone: head, at: pos, dir: gaze, axis: "z", name: `eye${side}` });
    glow(
      b.decal(eye, EYE, {
        at: pos.clone().addScaledVector(gaze, ER),
        dir: gaze,
        size: [ER * 1.8, ER * 1.8],
        mirror: s < 0,
        segments: 12,
        lift: 0.004,
        bone: head,
        name: `iris${side}`,
      }),
      1.25,
    );
    b.part(new THREE.TorusGeometry(ER * 0.97, 0.1, 6, 18), ICE, {
      bone: head,
      at: pos.clone().addScaledVector(gaze, ER * 0.2),
      dir: gaze,
      axis: "z",
      name: `socket${side}`,
    });
    b.part(new THREE.TorusGeometry(ER * 0.97, 0.035, 5, 18), ORANGE, {
      bone: head,
      at: pos.clone().addScaledVector(gaze, ER * 0.3),
      dir: gaze,
      axis: "z",
      name: `socketLine${side}`,
    });
    const brow = b.ring(frame(pos, gaze), { count: 7, radius: ER * 1.18, fromDeg: -95, toDeg: 95 });
    b.sweep(catmull(brow.items), (t) => [0.21 - 0.08 * Math.abs(t - 0.5), 0.1], {
      section: "box",
      color: ICE,
      bone: head,
      caps: "flat",
      name: `brow${side}`,
    });
    const browLine = b.ring(frame(pos.clone().addScaledVector(gaze, 0.08), gaze), {
      count: 7,
      radius: ER * 1.2,
      fromDeg: -80,
      toDeg: 80,
    });
    glow(
      b.sweep(catmull(browLine.items), 0.035, { color: ORANGE, bone: head, sides: 5, name: `browGlow${side}` }),
      1.1,
    );
    // lashes of the brow: small spikes
    for (const it of brow.items.filter((_, i) => i % 2 === 0)) b.spike(it, it, 0.26, 0.06, { color: STEEL, bone: head, sides: 5 });
  }

  // mouth: lips, glowing throat, ring of teeth and a hooked beak on separate upper and lower jaws
  const mh = skin.around([0, 2.45, 0.62]).at(0, -45);
  if (!mh) throw new Error("no mouth hit");
  const f = mh.n.clone();
  const up = new THREE.Vector3(0, f.z, -f.y).normalize();
  const jaw = b.joint("jaw", {
    parent: head,
    at: mh.at.clone().addScaledVector(f, -0.3),
    aim: mh.at.clone().addScaledVector(f, 0.8),
    role: "jaw",
  });
  b.part(new THREE.TorusGeometry(0.72, 0.17, 6, 14), PEACH, { bone: head, at: mh.at, dir: f, axis: "z", name: "lips" });
  b.part(new THREE.CircleGeometry(0.66, 14), MAROON, { bone: head, at: mh.at.clone().addScaledVector(f, 0.03), dir: f, axis: "z", name: "throat" });
  glow(
    b.part(new THREE.CircleGeometry(0.4, 12), ORANGE, { bone: head, at: mh.at.clone().addScaledVector(f, 0.05), dir: f, axis: "z", name: "throatGlow" }),
    0.9,
  );
  const teethRing = b.ring(frame(mh.at.clone().addScaledVector(f, 0.12), f), { count: 12, radius: 0.62 });
  for (const it of teethRing.items) b.spike(it, mh.at.clone().addScaledVector(f, 0.42), null, 0.06, { color: ICE, bone: head, sides: 5 });
  const K = 1.5; // beak scale
  const beakBase = mh.at.clone().addScaledVector(f, -0.1);
  const beakPaint = paint((_p, _n, s) => (s[0] > 0.78 * K ? GOLD : s[0] > 0.3 * K ? ICE_D : STEEL_D));
  b.extrude(
    [
      [-0.15 * K, 0.32 * K],
      [0.25 * K, 0.34 * K],
      [0.58 * K, 0.18 * K],
      [0.78 * K, -0.14 * K, "sharp"],
      [0.52 * K, 0.0],
      [0.22 * K, 0.02 * K],
      [-0.15 * K, 0.0],
    ],
    { at: beakBase, x: [f.x, f.y, f.z], y: [up.x, up.y, up.z], thickness: 0.5, bevel: 0.06, bone: head, color: beakPaint, name: "beakUpper" },
  );
  b.extrude(
    [
      [-0.15 * K, -0.03 * K],
      [0.28 * K, -0.05 * K],
      [0.55 * K, 0.09 * K, "sharp"],
      [0.42 * K, -0.1 * K],
      [0.18 * K, -0.3 * K],
      [-0.15 * K, -0.32 * K],
    ],
    { at: beakBase, x: [f.x, f.y, f.z], y: [up.x, up.y, up.z], thickness: 0.4, bevel: 0.06, bone: jaw, color: beakPaint, name: "beakLower" },
  );

  // ------------------------------------------------------------ arms
  type ArmSpec = { id: string; theta: number; pts: number[][]; feed?: boolean; count: number };
  const specs: ArmSpec[] = [
    {
      id: "A",
      theta: 44,
      count: 7,
      pts: [[0.9, 2.35, 0], [1.9, 1.8, -2], [2.9, 1.0, -5], [4.0, 0.5, -8], [5.2, 0.4, -8], [6.4, 0.4, -4], [7.4, 0.5, 2], [8.1, 1.0, 10]],
    },
    {
      id: "B",
      theta: 80,
      count: 7,
      pts: [[0.9, 2.5, 0], [2.1, 2.8, 2], [3.2, 3.7, 5], [4.1, 5.0, 9], [4.8, 6.3, 14], [5.4, 7.3, 22], [6.1, 7.5, 32], [6.6, 6.8, 42]],
    },
    {
      id: "C",
      theta: 112,
      count: 7,
      pts: [[0.9, 2.35, 0], [1.8, 1.8, -1], [2.7, 1.0, -4], [3.8, 0.5, -8], [5.0, 0.4, -13], [6.0, 0.45, -8], [6.8, 0.7, -2], [7.2, 1.3, 6]],
    },
    {
      id: "D",
      theta: 146,
      count: 7,
      pts: [[0.9, 2.45, 0], [1.8, 2.9, 1], [2.7, 4.0, 3], [3.4, 5.4, 7], [4.0, 6.5, 11], [4.6, 7.3, 15], [5.3, 7.3, 19], [5.8, 6.4, 24]],
    },
    {
      id: "F",
      theta: 172,
      feed: true,
      count: 8,
      pts: [[1.0, 2.5, 0], [1.9, 3.2, -8], [2.8, 4.5, -20], [3.4, 6.0, -33], [3.7, 7.6, -40], [3.6, 8.8, -45], [3.0, 9.4, -52], [2.2, 9.0, -60]],
    },
  ];

  const ARM_KEYS = [0.72, 0.64, 0.52, 0.4, 0.28, 0.17, 0.09, 0.045];
  const FEED_KEYS = [0.3, 0.24, 0.19, 0.16, 0.14, 0.13, 0.14, 0.4, 0.46, 0.1];
  const droplets: THREE.Vector3[] = [];
  const armSweeps: Record<string, Sweep> = {};

  for (const spec of specs) {
    const keys = spec.feed ? FEED_KEYS : ARM_KEYS;
    const R = (t: number) => Math.max(0.03, keyed(keys, t));
    const toPoint = (p: number[], s: number): [number, number, number] => {
      const a = (spec.theta + p[2]) * DEG * s;
      return [p[0] * Math.sin(a), p[1], CZ + p[0] * Math.cos(a)];
    };
    const pts = spec.pts.map((p) => [...p]);
    for (let it = 0; it < 3; it++) {
      const path = catmull(pts.map((p) => toPoint(p, 1)));
      pts.forEach((p, i) => {
        if (spec.pts[i][1] <= 0.5) p[1] = R(path.closestT(toPoint(p, 1))) * 0.97;
      });
    }
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const path = catmull(pts.map((p) => toPoint(p, s)));
      const names = Array.from({ length: spec.count }, (_, i) => `arm${spec.id}${side}${i + 1}`);
      const chain = b.chain(`arm${spec.id}${side}`, path, { parent: core, count: spec.count, names, role: "tentacle" });
      const pin = (base: typeof topSkin, line: string) =>
        paint((_p, _n, s) => ((((s[0] * chain.length) / 0.5) % 1) + 1) % 1 < 0.06 ? line : base);
      const sectors: Sector[] = spec.feed
        ? [
            [-70, 70, DEEP, 0, 0.74],
            [110, 250, CREAM, 0, 0.74],
          ]
        : [
            [-65, 65, pin(topSkin, INK)],
            [112, 248, pin(bellySkin, PEACH)],
          ];
      const sw = b.sweep(chain, R, {
        color: spec.feed ? (t: number) => (t < 0.74 ? SIDE : PEACH) : pin(sideSkin, DEEP),
        sectors,
        sides: spec.feed ? 8 : 10,
        name: `arm${spec.id}${side}`,
      });
      armSweeps[`${spec.id}${side}`] = sw;

      // bevelled armour rings up the arm, every other one with a glowing seam
      const rings: [number, number][] = spec.feed
        ? [[0.07, 0.24], [0.26, 0.18], [0.46, 0.15]]
        : [[0.05, 0.34], [0.17, 0.26], [0.3, 0.2], [0.46, 0.16]];
      rings.forEach(([ct, h], k) => {
        const cp = chain.at(ct);
        const r = R(ct) * 0.97;
        const th = 0.05 + r * 0.16;
        b.lathe(
          [[r, -h / 2], [r + th * 0.6, -h / 2], [r + th, -h / 2 + th * 0.6], [r + th, h / 2 - th * 0.6], [r + th * 0.6, h / 2], [r, h / 2]],
          { at: cp, axis: cp.axis, segments: 10, color: k === 0 ? STEEL : ICE, name: `ring${spec.id}${side}${k}` },
        );
        if (k === 0) {
          const bolts = b.ring(cp, { count: 7, radius: r + th });
          for (const it of bolts.items) b.stick(new THREE.SphereGeometry(0.06, 6, 4), STEEL_D, it, { embed: 0.3 });
        }
        if (k % 2 === 0) {
          const seam = chain.at(ct + (h / 2 + 0.03) / chain.length);
          glow(
            b.lathe([[r, -0.02], [r + th * 0.8, -0.02], [r + th * 0.8, 0.02], [r, 0.02]], {
              at: seam,
              axis: seam.axis,
              segments: 10,
              color: ORANGE,
              name: `seam${spec.id}${side}${k}`,
            }),
            1.1,
          );
        }
      });

      // glowing dorsal strip
      glow(
        b.sweep(sw.line(0, 0.012), (t) => R(t) * 0.17 + 0.012, {
          from: spec.feed ? 0.08 : 0.58,
          to: spec.feed ? 0.74 : 0.97,
          bone: chain,
          color: ORANGE,
          sides: 5,
          name: `strip${spec.id}${side}`,
        }),
        1.1,
      );

      // suckers: one zig-zag row on the belly
      const nS = spec.feed ? 7 : 11;
      const t0 = spec.feed ? 0.1 : 0.14;
      const t1 = spec.feed ? 0.7 : 0.88;
      for (let k = 0; k < nS; k++) {
        const t = t0 + (k / (nS - 1)) * (t1 - t0);
        const hit = sw.at(t, 180 + (k % 2 ? 28 : -28));
        if (hit.at.y < 0.5) continue;
        const rs = R(t) * 0.55;
        b.stick(new THREE.CylinderGeometry(rs, rs * 1.14, rs * 0.75, 9), PEACH, hit, { embed: 0.35 });
        glow(b.stick(new THREE.CylinderGeometry(rs * 0.62, rs * 0.62, rs * 0.5, 8), ORANGE, hit.moved([0, rs * 0.27, 0]), { embed: 0.4 }), 1.1);
      }

      // club suckers on the feeding tentacles
      if (spec.feed) {
        for (let ring = 0; ring < 4; ring++) {
          const t = 0.8 + ring * 0.05;
          for (let a = 0; a < 5; a++) {
            const hit = sw.at(t, a * 72 + (ring % 2) * 36);
            const rs = R(t) * 0.27;
            b.stick(new THREE.CylinderGeometry(rs, rs * 1.15, rs * 0.7, 8), ICE, hit, { embed: 0.35 });
            glow(b.stick(new THREE.CylinderGeometry(rs * 0.6, rs * 0.6, rs * 0.5, 7), ORANGE, hit.moved([0, rs * 0.25, 0]), { embed: 0.4 }), 1.2);
          }
        }
        glow(b.spike(chain.at(1), chain.at(1), 0.3, 0.085, { color: ORANGE, bone: chain.joints[chain.joints.length - 1], sides: 6 }), 1.2);
      }
      if (!spec.feed) {
        glow(b.spike(chain.at(1), chain.at(1), 0.22, 0.06, { color: ORANGE, bone: chain.joints[chain.joints.length - 1], sides: 5 }), 1.2);
      }

      // foam wake along the arms lying in the sea
      if (spec.id === "A" || spec.id === "C") {
        for (let k = 0; k < 6; k++) {
          const t = 0.3 + k * 0.1;
          const p = path.at(t);
          const T = path.tangentAt(t);
          const yaw = Math.atan2(T.x, T.z) / DEG;
          for (const o of [1, -1]) {
            const off = R(t) + 0.12 + rand() * 0.1;
            b.part(new THREE.SphereGeometry(0.2, 6, 4), FOAM, {
              bone: core,
              at: [p.x + o * T.z * off, 0.12, p.z - o * T.x * off],
              rotation: [0, yaw, 0],
              scale: [0.9, 0.35, 1.7],
            });
          }
        }
      }

      // droplet positions near the raised arms
      if (spec.id === "B" || spec.id === "D" || spec.feed) {
        for (let k = 0; k < 5; k++) {
          const p = path.at(0.35 + rand() * 0.6);
          droplets.push(p.clone().add(new THREE.Vector3((rand() - 0.5) * 1.2, -0.5 - rand() * 1.2, (rand() - 0.5) * 1.2)));
        }
      }
    }
  }

  // ------------------------------------------------------------ story props
  // anchor hung on the left B arm
  {
    const sw = armSweeps["BL"];
    const hit = sw.at(0.8, 180);
    const bone = hit.bone ?? core;
    const ax = hit.at.x;
    const az = hit.at.z;
    const ay = hit.at.y - 0.05;
    for (let i = 0; i < 7; i++) {
      b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), IRON, {
        bone,
        at: [ax, ay - 0.17 - i * 0.2, az],
        rotation: [0, i % 2 ? 90 : 0, 0],
        scale: [1, 1.4, 1],
        name: `chain${i}`,
      });
    }
    const top = ay - 1.7;
    b.part(new THREE.TorusGeometry(0.17, 0.045, 6, 10), IRON, { bone, at: [ax, top, az], name: "anchorRing" });
    b.rod([ax, top - 0.15, az], [ax, top - 1.55, az], 0.055, { color: IRON, bone, sides: 6, name: "anchorShank" });
    b.rod([ax - 0.45, top - 0.42, az], [ax + 0.45, top - 0.42, az], 0.045, { color: WOOD, bone, sides: 6, name: "anchorStock" });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), IRON, { bone, at: [ax - 0.45, top - 0.42, az] });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), IRON, { bone, at: [ax + 0.45, top - 0.42, az] });
    const crown = catmull([
      [ax - 0.58, top - 1.1, az],
      [ax - 0.38, top - 1.46, az],
      [ax, top - 1.62, az],
      [ax + 0.38, top - 1.46, az],
      [ax + 0.58, top - 1.1, az],
    ]);
    b.sweep(crown, 0.06, { color: IRON, bone, sides: 6, name: "anchorCrown" });
    for (const s of [1, -1]) {
      b.extrude(
        [
          [0, 0],
          [0.2, 0.14],
          [0.02, 0.32, "sharp"],
          [-0.12, 0.1],
        ],
        { at: [ax + s * 0.6, top - 1.2, az], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.08, bevel: 0.015, bone, color: IRON, name: `fluke${s > 0 ? "L" : "R"}` },
      );
    }
  }

  // two snapped harpoons with a sagging rope
  {
    const h1 = skin.nearest([2.0, 5.6, -0.5]);
    const h2 = skin.nearest([1.9, 4.0, 1.0]);
    const ends: THREE.Vector3[] = [];
    for (const h of [h1, h2]) {
      const dir = h.n.clone().add(new THREE.Vector3(0.2, 0.45, 0.35)).normalize();
      const bone = h.bone ?? core;
      const tip = h.at.clone().addScaledVector(dir, 2.0);
      b.rod(h.at.clone().addScaledVector(dir, -0.05), tip, 0.07, { color: WOOD, bone, sides: 6 });
      b.spike(h.at.clone().addScaledVector(dir, 0.5), dir.clone().negate(), 0.8, 0.14, { color: IRON, bone, sides: 6 });
      b.part(new THREE.TorusGeometry(0.075, 0.025, 5, 8), STEEL, { bone, at: h.at.clone().addScaledVector(dir, 0.45), dir, axis: "z" });
      b.part(new THREE.TorusGeometry(0.06, 0.03, 5, 8), ROPE, { bone, at: tip.clone().addScaledVector(dir, -0.15), dir, axis: "z" });
      ends.push(tip.clone().addScaledVector(dir, -0.15));
    }
    const mid = ends[0].clone().add(ends[1]).multiplyScalar(0.5).add(new THREE.Vector3(0.5, -0.9, 0));
    b.sweep(bezier(ends[0], mid, mid, ends[1]), 0.03, { color: ROPE, bone: h1.bone ?? core, sides: 5, name: "rope" });
  }

  // kelp draped over the shoulders and an arm
  {
    const frames: Frame[] = [];
    const bs = armSweeps["BR"];
    for (const t of [0.4, 0.55, 0.7]) frames.push(frame(bs.at(t, 0).at, [0, 1, 0]));
    for (const s of [1, -1]) frames.push(frame(bodyS.at(0.62, s > 0 ? 90 : -90).at, [0, 1, 0]));
    b.cards(frames, KELP_TEX, { size: [0.5, 1.8], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rng(4), cross: true });
  }

  // ------------------------------------------------------------ sea
  const seaBase = mottle(WATER_D, WATER, { size: 1.6, contrast: 0.8, seed: 9 });
  const waterPaint = paint((p, _n, _s) => {
    const d = Math.hypot(p.x, p.z - CZ);
    if (d > 9.3) return FOAM;
    if (d > 8.4) return mix(WATER, FOAM, (d - 8.4) / 1.0);
    const k = d * 0.62;
    if (Math.abs((((k % 1) + 1) % 1) - 0.5) < 0.022) return mix(WATER_L, FOAM, 0.5);
    return seaBase;
  });
  b.lathe(
    [
      [0, 0],
      [9.4, 0],
      [9.55, 0.06],
      [9.45, 0.15],
      [8.2, 0.12],
      [5, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, CZ], segments: 36, color: waterPaint, bone: core, name: "sea" },
  );
  for (const rr of [3.4, 6.0]) {
    b.lathe(
      [
        [rr - 0.2, 0.08],
        [rr - 0.07, 0.2],
        [rr + 0.07, 0.2],
        [rr + 0.2, 0.08],
      ],
      { at: [0, 0, CZ], segments: 36, color: "#bfeaf2", bone: core, name: `ripple${rr}` },
    );
  }
  for (const p of droplets) {
    const r = 0.07 + rand() * 0.1;
    b.part(new THREE.SphereGeometry(r, 6, 4), rand() > 0.5 ? WATER_L : FOAM, { bone: core, at: p, scale: [1, 1.35, 1] });
  }

  return b.root;
}
