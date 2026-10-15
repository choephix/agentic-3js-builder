import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { mix, paint, patches, scales, smoothstep } from "../../../../src/paint";
import type { Paint, Rgb } from "../../../../src/paint";
import { catmull, bezier } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "Phoenix",
  description:
    "A towering flame phoenix perched on an ember rock with wings spread: layered gradient feather rows, streaming ribbon tail, glowing flame wisps, gold filigree collar, circlet, cuffs and tassels, anime eyes.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const GOLD = "#ffc83a";
const GOLD_DARK = "#c98a1e";
const RUBY = "#ff3b2e";
const BEAK_C = "#ffe08a";
const CLAW_C = "#4a2030";
const PALEGOLD = "#fff2b0";
const RAMP = ["#6e1030", "#cf2420", "#ff6a1c", "#ffb22e", "#fff0a8"];

function ramp(t: number, shift = 0): Rgb {
  const x = Math.min(Math.max(t + shift, 0), 1) * (RAMP.length - 1);
  const i = Math.min(Math.floor(x), RAMP.length - 2);
  return mix(RAMP[i], RAMP[i + 1], smoothstep(0.35, 0.65, x - i));
}

function pw(tab: number[][], t: number) {
  if (t <= tab[0][0]) return tab[0][1];
  for (let i = 0; i < tab.length - 1; i++) {
    if (t <= tab[i + 1][0]) {
      const f = (t - tab[i][0]) / (tab[i + 1][0] - tab[i][0]);
      return tab[i][1] + (tab[i + 1][1] - tab[i][1]) * f;
    }
  }
  return tab[tab.length - 1][1];
}

const ANG = [
  [0, 85],
  [0.4, 66],
  [0.77, 40],
  [1, -8],
];
const YUP = [
  [0, -0.05],
  [0.77, 0.05],
  [1, 0.3],
];
const LEN = [
  [0, 0.36],
  [0.4, 0.6],
  [0.77, 0.74],
  [0.85, 0.92],
  [0.93, 1.0],
  [1, 0.72],
];

const FLAME = svg(
  `<svg viewBox="0 0 40 80">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#ffe9a0"/><stop offset="0.45" stop-color="#ff9a24"/><stop offset="1" stop-color="#ff3a14"/>
  </linearGradient></defs>
  <path d="M20 79 C5 64 6 46 15 32 C15 41 19 45 22 42 C20 28 30 22 24 2 C37 20 40 44 36 58 C33 70 28 76 20 79Z" fill="url(#g)"/>
  <path d="M20 78 C12 68 13 56 19 48 C20 56 26 58 27 62 C27 70 24 75 20 78Z" fill="#fff4c2"/>
</svg>`,
  { size: 128 },
);

const FEATHER = svg(
  `<svg viewBox="0 0 32 48">
  <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfcfcf"/>
  </linearGradient></defs>
  <path d="M16 47 C2 36 0 18 16 2 C32 18 30 36 16 47Z" fill="url(#f)"/>
  <path d="M16 44 L16 10" stroke="#b8b8b8" stroke-width="1.6" fill="none"/>
  <path d="M16 36 L8 26 M16 36 L24 26 M16 26 L10 17 M16 26 L22 17" stroke="#c4c4c4" stroke-width="1.3" fill="none"/>
</svg>`,
  { size: 128 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 16 48">
  <circle cx="8" cy="5" r="4" fill="#ffc83a" stroke="#a85a18" stroke-width="1"/>
  <path d="M8 9 L8 18" stroke="#c91f27" stroke-width="2.4"/>
  <path d="M3 20 L13 20 L15 46 L1 46Z" fill="#ffc83a"/>
  <path d="M5 22 L4.5 46 M8 22 L8 46 M11 22 L11.5 46" stroke="#b8701c" stroke-width="1.1"/>
  <path d="M3 20 L13 20" stroke="#c91f27" stroke-width="2.4"/>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 2048 });
  const UP = new THREE.Vector3(0, 1, 0);
  const FOOT_Y = 0.12;

  // ---------- paints ----------
  const BODY = cel(
    furEdge("#d4222a", "#ffc23a", {
      axis: [0, 0.35, -0.65],
      level: -0.15,
      teeth: 0.35,
      period: 0.06,
      ink: "#7a1608",
    }),
  );
  const HEADP = cel(
    furEdge("#d4222a", "#ffc23a", {
      by: "position",
      axis: [0, 1, 0],
      level: 1.345,
      teeth: 0.02,
      period: 0.025,
      along: [1, 0, 0],
    }),
  );
  const BEAK = cel(BEAK_C);
  const LEGP = scales(["#ffbe3c", "#f5a52c"], "#a85a18", { size: 0.035 });
  const ROCK = patches("#ff7a1a", ["#3a2230", "#4a2a3a", "#33202e"], { size: 0.14, gap: 0.07 });

  const featherCache = new Map<string, Paint>();
  const featherPaint = (len: number, shift: number) => {
    const L = Math.max(0.1, Math.round(len / 0.04) * 0.04);
    const key = `${L}|${shift}`;
    let p = featherCache.get(key);
    if (!p) {
      p = cel(
        paint((_p, _n, s) => {
          const u = s[0] / L;
          if (Math.abs(s[1]) < 0.0045 && u > 0.08 && u < 0.93) return PALEGOLD;
          const c = ramp(u, shift);
          const bar = (s[0] + Math.abs(s[1]) * 1.6) % 0.045 < 0.007 && u > 0.15 && u < 0.9;
          return bar ? mix(c, "#4a0c24", 0.35) : c;
        }),
      );
      featherCache.set(key, p);
    }
    return p;
  };
  const ribbonPaint = (shift: number) => cel(paint((_p, _n, s) => ramp(s[0], shift)));

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.62, -0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, -0.1],
      [0, 0.78, 0.12],
      [0, 0.92, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.92, 0.22],
      [0, 1.08, 0.29],
      [0, 1.2, 0.33],
      [0, 1.3, 0.37],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.3, 0.37], dir: [0, 0.12, 1], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 1.335, 0.47], aim: [0, 1.31, 0.6], role: "jaw" });
  const jaw = b.joint("jawTip", { parent: "jaw", at: [0, 1.31, 0.6], dir: [0, 0, 1] });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.6, -0.2],
      [0, 0.52, -0.5],
      [0, 0.42, -0.85],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.44, 0],
      [0.5, 0.03],
      [0.47, 0.07],
      [0.36, 0.095],
      [0.12, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], bone: hips, segments: 10, color: ROCK, name: "plinth" },
  );
  const rr = rng(21);
  for (let i = 0; i < 12; i++) {
    const a = rr() * Math.PI * 2;
    const r = 0.18 + rr() * 0.26;
    glow(
      b.part(new THREE.IcosahedronGeometry(0.014 + rr() * 0.012, 0), "#ffb02e", {
        bone: hips,
        at: [Math.cos(a) * r, 0.1, Math.sin(a) * r],
      }),
      1.5,
    );
  }

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.56, -0.32], w: 0.1, h: 0.08 },
      { at: [0, 0.62, -0.12], w: 0.34, h: 0.3 },
      { at: [0, 0.76, 0.1], w: 0.44, h: 0.46 },
      { at: [0, 0.95, 0.22], w: 0.26, h: 0.3 },
      { at: [0, 1.08, 0.28], w: 0.15, h: 0.17 },
      { at: [0, 1.2, 0.33], w: 0.125, h: 0.14 },
      { at: [0, 1.3, 0.37], w: 0.11, h: 0.12 },
    ],
    { bone: [hips, spine, neck], color: BODY, name: "body" },
  );
  const skin = b.surface(body);
  b.sweep(tail, [0.1, 0.06, 0.03], { color: BODY, name: "tailBase" });

  const bodyHits = skin.scatter(240, {
    rng: rng(3),
    minDist: 0.045,
    filter: (h) => h.n.y > -0.5 && h.at.z > -0.35,
  });
  b.cards(bodyHits, FEATHER, {
    size: [0.08, 0.12],
    lean: 68,
    bend: 25,
    flow: [0, -0.25, -1],
    vary: 0.25,
    spin: 15,
    rng: rng(4),
    color: BODY,
  });

  // collar, beads, pendant
  b.sweep(skin.loop(neck.joints[1], { lift: 0.012 }), 0.016, { color: GOLD, name: "collar" });
  const beadLoop = skin.loop(neck.joints[1], { lift: 0.022 });
  b.along(beadLoop, 16, (at) => b.part(new THREE.SphereGeometry(0.013, 6, 4), GOLD_DARK, { at }));
  const pend = skin.ray([0, 1.12, 1.0], [0, -0.1, -1]);
  if (pend) {
    glow(b.stick(new THREE.OctahedronGeometry(0.035, 0), RUBY, pend, { embed: 0.25 }), 1.3);
    b.cards([frame(pend.at.clone().add(new THREE.Vector3(0, -0.02, 0.02)), [0, 1, 0])], TASSEL, {
      size: [0.05, 0.2],
      lean: 180,
      flow: [0, 0, 1],
    });
  }

  // ---------- head ----------
  const HEADC: [number, number, number] = [0, 1.35, 0.43];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: HEADC,
    scale: [0.085, 0.08, 0.1],
    name: "skull",
  });
  const skullSkin = b.surface(skull);
  const cheek = skullSkin.scatter(40, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.n.z < 0.4 && h.n.y > -0.3,
  });
  b.cards(cheek, FEATHER, {
    size: [0.05, 0.07],
    lean: 70,
    flow: [0, -0.2, -1],
    vary: 0.2,
    rng: rng(12),
    color: HEADP,
  });
  const EYE = animeEye({ iris: "#30e0d4", blush: "#ffb066" });
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HEADC).at(s * 40, 4);
    if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }
  b.sweep(
    bezier([0, 1.355, 0.47], [0, 1.36, 0.6], [0, 1.3, 0.66]),
    [0.05, 0],
    { bone: head, color: BEAK, caps: { start: "flat", end: "point" }, sides: 6, name: "upperBeak" },
  );
  b.sweep(
    bezier([0, 1.3, 0.48], [0, 1.3, 0.57], [0, 1.3, 0.61]),
    [0.034, 0],
    { bone: jaw.parent ?? head, color: BEAK, caps: { start: "flat", end: "point" }, sides: 6, name: "lowerBeak" },
  );
  b.part(new THREE.TorusGeometry(0.072, 0.009, 6, 16), GOLD, {
    bone: head,
    at: [0, 1.395, 0.43],
    rotation: [90, 0, 0],
    scale: [1, 1.15, 1],
    name: "circlet",
  });
  glow(b.part(new THREE.IcosahedronGeometry(0.028, 0), RUBY, { bone: head, at: [0, 1.4, 0.512] }), 1.4);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt = [s * 0.13, 0.6, -0.04];
    const foot = [s * 0.15, FOOT_Y, 0.1];
    const pts = limb(
      hipPt,
      foot,
      [0.26, 0.28, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      contact: [foot[0], 0.1, foot[2]],
    });
    b.sweep(leg, [0.065, 0.05, 0.032, 0.026], { color: LEGP, sides: 8, name: `leg${side}` });
    b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
      bone: leg.joints[0],
      at: [s * 0.14, 0.52, 0.0],
      scale: [0.1, 0.14, 0.12],
    });
    b.part(new THREE.TorusGeometry(0.036, 0.009, 6, 10), GOLD, {
      bone: leg.joints[2],
      at: pts[2].clone().lerp(pts[3], 0.4),
      dir: [0, 1, 0],
      axis: "z",
    });
    const footJoint = leg.joints[3];
    [-30, 0, 30, 180].forEach((deg, k) => {
      const a = (deg * Math.PI) / 180;
      const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const f0 = new THREE.Vector3(foot[0], foot[1], foot[2]);
      const p1 = f0.clone().addScaledVector(dir, 0.07);
      const p2 = f0.clone().addScaledVector(dir, 0.13);
      const toe = b.chain(`toe${k}${side}`, [f0, p1, p2], {
        parent: footJoint,
        names: [`toe${k}${side}A`, `toe${k}${side}B`],
        role: "digit",
      });
      b.sweep(toe, [0.026, 0.02, 0.012], { color: LEGP, sides: 6 });
      b.spike(p2, [dir.x * 0.6, -0.8, dir.z * 0.6], 0.06, 0.013, { color: CLAW_C, sides: 5 });
    });
  }

  // ---------- wings ----------
  const flames: ReturnType<typeof frame>[] = [];
  const wisps: ReturnType<typeof frame>[] = [];
  const tassels: ReturnType<typeof frame>[] = [];
  const leaf = (L: number, W: number): OutlinePoint[] => [
    [0, 0],
    [0.12 * L, 0.4 * W],
    [0.4 * L, 0.5 * W],
    [0.75 * L, 0.36 * W],
    [L, 0, "sharp"],
    [0.75 * L, -0.36 * W],
    [0.4 * L, -0.5 * W],
    [0.12 * L, -0.4 * W],
  ];
  const feather = (bone: Joint, at: THREE.Vector3, d: THREE.Vector3, len: number, wid: number, color: Paint) => {
    const wide = new THREE.Vector3().crossVectors(UP, d).normalize();
    b.extrude(leaf(len, wid), {
      at,
      x: d.toArray(),
      y: wide.toArray(),
      thickness: 0.007,
      smoothing: 1,
      color,
      bone,
    });
  };

  const tert = Array.from({ length: 6 }, (_, i) => 0.06 + (0.32 * i) / 5);
  const sec = Array.from({ length: 8 }, (_, i) => 0.42 + (0.34 * i) / 7);
  const prim = Array.from({ length: 10 }, (_, i) => 0.79 + (0.21 * i) / 9);
  const tVals = [...tert, ...sec, ...prim];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number) => [s * x, y, z];
    const arm = b.chain(
      `wing${side}`,
      catmull([P(0.14, 0.86, 0.08), P(0.6, 1.0, -0.02), P(1.05, 1.18, -0.12), P(1.3, 1.32, -0.16)]),
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "wing",
      },
    );
    const armSweep = b.sweep(arm, [0.075, 0.06, 0.045, 0.03], { color: BODY, name: `arm${side}` });

    const place = (t: number, len: number, wid: number, shift: number, lift: number, dAng = 0, fwd = 0) => {
      const a = ((pw(ANG, t) + dAng) * Math.PI) / 180;
      const d = new THREE.Vector3(s * Math.cos(a), pw(YUP, t), -Math.sin(a)).normalize();
      const base = arm.at(t).at.clone();
      base.y += lift;
      base.z += fwd;
      const bone = t < 0.385 ? arm.joints[0] : t < 0.77 ? arm.joints[1] : arm.joints[2];
      feather(bone, base, d, len, wid, featherPaint(len, shift));
      return { base, d };
    };

    // under layer
    for (const t of tVals) place(t, pw(LEN, t) * 0.94, t > 0.77 ? 0.12 : 0.15, -0.2, -0.014, -3);
    // main flight feathers
    tVals.forEach((t, i) => {
      const L = pw(LEN, t);
      const r = place(t, L, t > 0.77 ? 0.12 : 0.15, 0, i * 0.0012);
      if (t > 0.78) flames.push(frame(r.base.clone().addScaledVector(r.d, L * 0.97), [0, 1, 0]));
    });
    // coverts
    for (let k = 0; k < 14; k++) {
      const t = 0.05 + (0.95 * k) / 13;
      place(t, 0.3 + 0.06 * (1 - t), 0.1, 0.25, 0.018);
    }
    for (let k = 0; k < 12; k++) {
      const t = 0.04 + (0.94 * k) / 11;
      place(t, 0.22, 0.08, 0.4, 0.034, 0, 0.05);
    }

    // arm flames
    for (let k = 0; k < 9; k++) {
      const t = 0.1 + (0.85 * k) / 8;
      wisps.push(frame(arm.at(t).at.clone().add(new THREE.Vector3(0, 0.05, 0)), [0, 1, 0]));
    }

    // gold cuffs, ruby, tassels
    const armSkin = b.surface(armSweep);
    b.sweep(armSkin.loop(arm.joints[1], { lift: 0.012 }), 0.016, { color: GOLD, name: `elbowCuff${side}` });
    b.sweep(armSkin.loop(arm.joints[2], { lift: 0.012 }), 0.016, { color: GOLD, name: `wristCuff${side}` });
    glow(b.stick(new THREE.IcosahedronGeometry(0.04, 0), RUBY, armSweep.at(0.7, 0, 0), { embed: 0.3 }), 1.3);
    tassels.push(frame(new THREE.Vector3(s * 1.05, 1.14, -0.12), [0, 1, 0]));
    tassels.push(frame(new THREE.Vector3(s * 0.6, 0.94, -0.02), [0, 1, 0]));
  }

  // ---------- tail ribbons ----------
  const TL = [0.8, 0.95, 1.1, 1.25, 1.6, 1.25, 1.1, 0.95, 0.8];
  TL.forEach((L, k) => {
    const phi = ((k - 4) * 11 * Math.PI) / 180;
    const sx = Math.sin(phi);
    const cz = Math.cos(phi);
    const y0 = 0.57 - Math.abs(k - 4) * 0.008;
    const yEnd = y0 - 0.12 - L * 0.12;
    const end = new THREE.Vector3(sx * L * 0.7, yEnd + 0.04, -0.26 - cz * L * 0.95);
    b.sweep(
      catmull([
        [sx * 0.02, y0, -0.26],
        [sx * L * 0.25, y0 - 0.03, -0.26 - cz * L * 0.3],
        [sx * L * 0.5, y0 - 0.1 - L * 0.05, -0.26 - cz * L * 0.62],
        end,
      ]),
      (t) => [0.055 * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(t, 1), 0.65)), 0.6) + 0.004, 0.005],
      { color: ribbonPaint(k === 4 ? -0.1 : -0.2), bone: tail.joints[0], sides: 6, name: `tailRibbon${k}` },
    );
    flames.push(frame(end, [0, 1, 0]));
  });

  // ---------- crest ----------
  for (let i = -2; i <= 2; i++) {
    const sx = i * 0.03;
    const ai = Math.abs(i);
    const end = new THREE.Vector3(sx * 4.5, 1.52 - ai * 0.05, -0.08 - (2 - ai) * 0.06);
    b.sweep(
      catmull([[sx * 0.5, 1.42, 0.4], [sx * 1.5, 1.52, 0.3], [sx * 3, 1.58 - ai * 0.03, 0.12], end]),
      (t) => [0.03 * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(t, 1), 0.65)), 0.6) + 0.003, 0.004],
      { color: ribbonPaint(-0.1), bone: head, sides: 6, name: `crest${i + 2}` },
    );
    flames.push(frame(end, [0, 1, 0]));
  }

  // ---------- plinth flames ----------
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    wisps.push(frame(new THREE.Vector3(Math.cos(a) * 0.4, 0.09, Math.sin(a) * 0.4), [0, 1, 0]));
  }

  // ---------- cards ----------
  glow(
    b.cards(flames, FLAME, {
      size: [0.1, 0.22],
      cross: true,
      vary: 0.3,
      rng: rng(5),
      flow: [0, 0, -1],
      bend: 15,
      sink: 0.05,
    }),
    1.3,
  );
  glow(
    b.cards(wisps, FLAME, {
      size: [0.07, 0.16],
      cross: true,
      vary: 0.3,
      rng: rng(6),
      flow: [0, 0, -1],
      bend: 15,
      sink: 0.05,
    }),
    1.3,
  );
  b.cards(tassels, TASSEL, { size: [0.06, 0.24], lean: 180, flow: [0, 0, 1] });

  return b.root;
}
