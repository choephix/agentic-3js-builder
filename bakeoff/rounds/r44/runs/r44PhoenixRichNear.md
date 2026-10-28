```ts
import * as THREE from "three";
import type { OutlinePoint } from "agentic-3js-builder";
import { createBuilder, limb, rng, bezier, catmull, countershade, mix, paint, scales, smoothstep, svg } from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Phoenix",
  description: "A Genshin-style fire phoenix perched with wings spread: cream-gold breast, flame-gradient feathers with glowing tips, long tail plumes, flame crest and gold ornaments.",
};

const CRIMSON = "#a8200f", RED = "#e8381a", ORANGE = "#ff7a1c", AMBER = "#ffb02e", YELLOW = "#ffe27a";
const CREAM = "#fff1c9", CREAM_D = "#f2cf8a", GOLD = "#f0b432", GOLD_D = "#a96f18", DARK = "#4a1410", EYE = "#35e0d0";
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const D = Math.PI / 180;

type Row = [number, number, number];
const FLIGHT: Row[] = [[0, 0.1, 0.1], [0.15, 0.4, 0.55], [0.7, 0.42, 0.6], [0.9, 0.25, 0.35], [1, 0, 0]];
const PLUME: Row[] = [[0, 0.1, 0.1], [0.12, 0.45, 0.45], [0.55, 0.5, 0.5], [0.85, 0.3, 0.3], [1, 0, 0]];
const FLAME: Row[] = [[0, 0.3, 0.3], [0.25, 0.5, 0.45], [0.55, 0.3, 0.3], [0.8, 0.12, 0.1], [1, 0, 0]];

function rowAt(rows: Row[], u: number): [number, number] {
  for (let i = 1; i < rows.length; i++)
    if (u <= rows[i][0]) {
      const f = (u - rows[i - 1][0]) / (rows[i][0] - rows[i - 1][0]);
      return [rows[i - 1][1] + (rows[i][1] - rows[i - 1][1]) * f, rows[i - 1][2] + (rows[i][2] - rows[i - 1][2]) * f];
    }
  return [0, 0];
}
function outline(rows: Row[], L: number, W: number, u0 = 0): OutlinePoint[] {
  const [l0, t0] = rowAt(rows, u0);
  const pts: Row[] = [[u0, l0, t0], ...rows.filter((r) => r[0] > u0)];
  const out: OutlinePoint[] = pts.map((r, i): OutlinePoint => (i === pts.length - 1 ? [L, 0, "sharp"] : [r[0] * L, r[1] * W]));
  for (let i = pts.length - 2; i >= 0; i--) out.push([pts[i][0] * L, -pts[i][2] * W]);
  return out;
}
const keyed = (keys: [number, number][]) => (t: number): [number, number] => {
  let r = keys[keys.length - 1][1];
  for (let i = 1; i < keys.length; i++)
    if (t <= keys[i][0]) {
      const f = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
      r = keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * f;
      break;
    }
  return [r, r];
};

const FEATHER = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 1 L27 22 L24 44 L16 63 L8 44 L5 22 Z" fill="#ececec"/><path d="M16 4 L16 62" stroke="#a4a4a4" stroke-width="2"/></svg>`, { size: 128 });
const EYE_TEX = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><path d="M3 30 Q32 -4 61 22 Q32 50 3 30Z" fill="#3a0e0a"/><circle cx="34" cy="26" r="14" fill="#35e0d0"/><circle cx="34" cy="27" r="7" fill="#08302e"/><circle cx="28" cy="20" r="4.5" fill="#fff"/><path d="M3 30 Q32 -6 62 20" stroke="#3a0e0a" stroke-width="4" fill="none"/></svg>`, { size: 192 });
const EMBLEM = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#f0b432" stroke-width="6"/><path d="M50 12 C70 34 74 52 62 68 C60 56 54 52 50 56 C46 52 40 56 38 68 C26 52 30 34 50 12Z" fill="#ff7a1c" stroke="#a8200f" stroke-width="3"/><path d="M50 36 C58 48 58 58 50 66 C42 58 42 48 50 36Z" fill="#ffe27a"/></svg>`, { size: 256 });

export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 2048 });
  const rand = rng(77);

  type PlateOpts = { root: THREE.Vector3; dir: THREE.Vector3; normal: THREE.Vector3; ref: THREE.Vector3; rows: Row[]; L: number; W: number; thick: number; color: string | Paint; bone: Joint; lift?: number; u0?: number; name?: string };
  const plate = (o: PlateOpts) => {
    const dir = o.dir.clone().normalize();
    const y = new THREE.Vector3().crossVectors(o.normal, dir).normalize();
    if (y.dot(o.ref) < 0) y.negate();
    return b.extrude(outline(o.rows, o.L, o.W, o.u0 ?? 0), {
      at: o.root.clone().addScaledVector(o.normal, o.lift ?? 0), x: dir, y, thickness: o.thick, bevel: o.thick * 0.3, detail: 0.34, color: o.color, bone: o.bone, name: o.name,
    });
  };
  const flamePaint = (L: number, a: string, m: string, c: string) =>
    paint((_p, _n, s) => {
      const u = s[0] / L;
      if (Math.abs(s[1]) < 0.006 && u > 0.04 && u < 0.95) return YELLOW;
      return u < 0.4 ? mix(a, m, u / 0.4) : mix(m, c, smoothstep(0.4, 0.9, u));
    });
  const flameFeather = (o: Omit<PlateOpts, "color" | "thick"> & { a?: string; m?: string; c?: string }) => {
    const base = { ...o, thick: 0.013, color: flamePaint(o.L, o.a ?? CRIMSON, o.m ?? RED, o.c ?? ORANGE) };
    plate(base);
    glow(plate({ ...o, thick: 0.017, color: YELLOW, u0: 0.82, name: "tip" }), 1.4);
  };

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.85, -0.15], dir: [0, 0.6, 0.4], role: "spine" });
  const bodyPath = catmull([[0, 0.85, -0.15], [0, 0.98, 0.05], [0, 1.2, 0.25], [0, 1.45, 0.38], [0, 1.65, 0.5], [0, 1.84, 0.62]]);
  const tN = bodyPath.closestT([0, 1.2, 0.25]);
  const spine = b.chain("spine", bodyPath.slice(0, tN), { parent: hips, count: 3, role: "spine" });
  const top = spine.joints[2];
  const neck = b.chain("neck", bodyPath.slice(tN, 1), { parent: top, count: 3, role: "neck" });
  const head = b.joint("head", { parent: neck.joints[2], at: bodyPath.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.05, up: -0.06 }), aim: head.local({ forward: 0.25, up: -0.07 }), role: "jaw" });
  const crest = b.joint("crest", { parent: head, at: head.local({ forward: -0.03, up: 0.1 }), aim: head.local({ forward: -0.2, up: 0.25 }), role: "hinge" });

  // body
  const bodyPaint = countershade(
    scales([RED, ORANGE, RED], CRIMSON, { size: 0.08, width: 0.1 }),
    scales(CREAM, CREAM_D, { size: 0.07, width: 0.1 }),
    { level: -0.05, soft: 0.3 },
  );
  const body = b.sweep(bodyPath, keyed([[0, 0.2], [0.25, 0.3], [0.5, 0.34], [0.65, 0.28], [0.8, 0.17], [1, 0.12]]), {
    bone: [spine, neck], color: paint((_p, _n, s) => (s[0] > 0.74 ? CREAM : bodyPaint)), name: "body",
  });
  const skin = b.surface(body);
  b.sweep(skin.loop(neck.joints[0], { lift: 0.01 }), [0.028, 0.012], { section: "box", color: GOLD, name: "collar" });
  const chestHit = skin.ray([0, 1.35, 2], [0, 0, -1]);
  if (chestHit) {
    b.stick(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 8), GOLD, chestHit, { embed: 0.4 });
    glow(b.stick(new THREE.OctahedronGeometry(0.065), YELLOW, chestHit.moved([0, 0.03, 0]), { embed: 0.2 }), 1.6);
  }
  b.cards(skin.scatter(120, { rng: rng(3), minDist: 0.08, filter: (h) => h.at.y > 0.95 && h.n.z > 0 && h.n.y > -0.7 }), FEATHER, { size: [0.12, 0.2], lean: 58, flow: [0, -1, -0.1], bend: 18, vary: 0.2, rng: rng(4), color: CREAM });
  b.cards(skin.scatter(80, { rng: rng(5), minDist: 0.09, filter: (h) => h.n.y > 0.4 && h.at.y > 1.0 }), FEATHER, { size: [0.13, 0.22], lean: 62, flow: [0, -0.3, -1], bend: 16, vary: 0.25, rng: rng(6), color: ORANGE });

  // head
  b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, { bone: head, at: head.local({ forward: 0.03, up: 0.01 }), scale: [0.115, 0.11, 0.14], name: "skull" });
  const skullP = b.part(new THREE.SphereGeometry(1, 12, 8), ORANGE, { bone: head, at: head.local({ forward: 0.0, up: 0.03 }), scale: [0.108, 0.09, 0.13], name: "skullTop" });
  b.sweep(bezier(head.local({ forward: 0.1, up: -0.01 }), head.local({ forward: 0.2, up: 0.02 }), head.local({ forward: 0.27, up: -0.01 }), head.local({ forward: 0.26, up: -0.1 })),
    (t) => [0.055 * (1 - t) ** 0.8 + 0.005, 0.07 * (1 - t) ** 0.7 + 0.005], { bone: head, color: (t) => (t > 0.85 ? GOLD_D : GOLD), sides: 8, name: "upperBeak" });
  b.sweep([head.local({ forward: 0.06, up: -0.055 }), head.local({ forward: 0.16, up: -0.062 }), head.local({ forward: 0.23, up: -0.05 })], [0.04, 0.01], { bone: jaw, color: GOLD_D, sides: 8, name: "lowerBeak" });
  for (const s of [1, -1]) {
    const E = head.local({ left: s * 0.085, up: 0.04, forward: 0.07 });
    b.decal(skullP, EYE_TEX, { at: E, dir: [s * 0.9, 0.15, 0.4], size: [0.11, 0.082], mirror: s < 0, name: "eye" });
    glow(b.part(new THREE.SphereGeometry(0.01, 5, 4), "#ffffff", { bone: head, at: head.local({ left: s * 0.1, up: 0.05, forward: 0.09 }) }), 1.2);
    b.part(new THREE.SphereGeometry(0.01, 5, 4), DARK, { bone: head, at: head.local({ left: s * 0.025, forward: 0.17, up: 0.015 }) });
  }
  // flame crest
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++) {
      const e = (10 + k * 16) * D;
      const dir = V(s * 0.25, Math.sin(e), -Math.cos(e));
      flameFeather({ root: head.local({ left: s * 0.03, up: 0.1, forward: -0.02 - k * 0.012 }), dir, normal: V(1, 0, 0), ref: UP, rows: FLIGHT, L: 0.32 + 0.05 * Math.sin((k / 3) * Math.PI), W: 0.1, bone: crest, lift: s * 0.002 * k, a: ORANGE, m: AMBER, c: YELLOW });
    }
  flameFeather({ root: head.local({ up: 0.12, forward: -0.03 }), dir: V(0, 0.7, -0.7), normal: V(1, 0, 0), ref: UP, rows: FLIGHT, L: 0.42, W: 0.12, bone: crest, a: ORANGE, m: AMBER, c: YELLOW });

  // tail plumes
  const tailJ = b.joint("tail1", { parent: hips, at: [0, 0.92, -0.35], dir: [0, -0.2, -1], role: "tail" });
  const tailJ2 = b.joint("tail2", { parent: tailJ, at: [0, 0.88, -0.65], dir: [0, -0.3, -1], role: "tail" });
  b.sweep([V(0, 0.95, -0.25), V(0, 0.9, -0.7)], [0.12, 0.07], { bone: tailJ, color: RED, sides: 8, name: "tailBase" });
  const d0 = V(0, -0.25, -1).normalize();
  const tn = new THREE.Vector3().crossVectors(V(1, 0, 0), d0).normalize();
  const tb = V(0, 0.9, -0.6);
  for (let layer = 0; layer < 2; layer++) {
    const n = layer ? 6 : 7;
    for (let i = 0; i < n; i++) {
      const k = i - (n - 1) / 2;
      const dir = d0.clone().applyAxisAngle(tn, k * 0.16 * (layer ? 1.0 : 0.9));
      const L = (layer ? 1.2 : 1.7) - 0.05 * k * k;
      const cols = layer ? [DARK, CRIMSON, RED] : [CRIMSON, RED, AMBER];
      flameFeather({ root: tb.clone().addScaledVector(V(1, 0, 0), k * 0.02), dir, normal: tn, ref: V(1, 0, 0), rows: layer ? PLUME : FLIGHT, L, W: 0.2, bone: tailJ2, lift: layer ? -0.03 : 0.005 * (3 - Math.abs(k)), a: cols[0], m: cols[1], c: cols[2] });
    }
  }

  // legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const foot = V(s * 0.2, 0.05, 0.22);
    const pts = limb(V(s * 0.16, 0.8, -0.05), foot, [0.3, 0.32, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${k}`, pts, { parent: hips, names: [`hip${k}`, `knee${k}`, `hock${k}`, `ankle${k}`], role: "leg", contact: [foot.x, 0, foot.z] });
    b.sweep(leg, keyed([[0, 0.12], [0.4, 0.07], [0.75, 0.04], [1, 0.035]]), { color: (t) => (t > 0.5 ? GOLD : CREAM_D), sides: 8, name: "leg" });
    b.cards(b.surface(leg.joints[0]).scatter(14, { rng: rng(9 + (s > 0 ? 1 : 2)), minDist: 0.07, filter: (h) => h.at.y > 0.6 }), FEATHER, { size: [0.1, 0.16], lean: 55, flow: [0, -1, 0], rng: rng(10), color: CREAM });
    const ankle = leg.tip as Joint;
    for (const [tag, ang] of [["A", -28], ["B", 0], ["C", 28]] as [string, number][]) {
      const a = (ang + s * 4) * D, dir = V(Math.sin(a), 0, Math.cos(a));
      const p0 = foot.clone(), p1 = foot.clone().addScaledVector(dir, 0.14).setY(0.035), p2 = p1.clone().addScaledVector(dir, 0.12).setY(0.03);
      const toe = b.chain(`toe${tag}${k}`, [p0, p1, p2], { parent: ankle, names: [`toe${tag}${k}1`, `toe${tag}${k}2`, `toe${tag}${k}3`], role: "digit" });
      b.sweep(toe, [0.036, 0.028], { color: GOLD, sides: 6, name: "toe" });
      b.sweep(bezier(p2, p2.clone().addScaledVector(dir, 0.06).setY(0.04), p2.clone().addScaledVector(dir, 0.1).setY(0.012)), [0.03, 0], { bone: toe.tip as Joint, color: GOLD_D, sides: 6, name: "claw" });
    }
    const h1 = foot.clone().add(V(0, 0.0, -0.1)).setY(0.035);
    const hal = b.chain(`hallux${k}`, [foot.clone().setY(0.05), h1, h1.clone().add(V(0, 0, -0.08))], { parent: ankle, names: [`hallux${k}1`, `hallux${k}2`, `hallux${k}3`], role: "digit" });
    b.sweep(hal, [0.034, 0.026], { color: GOLD, sides: 6, name: "hallux" });
  }

  // wings
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const arm = b.chain(`wing${k}`, catmull([[s * 0.25, 1.35, 0.15], [s * 0.9, 1.55, -0.05], [s * 1.6, 1.7, 0.1], [s * 2.15, 1.75, 0]]), { parent: top, names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`], role: "wing" });
    b.sweep(arm, (t): [number, number] => [0.1 - 0.05 * t, 0.055 - 0.025 * t], { color: (t) => (t < 0.5 ? CREAM : ORANGE), sides: 8, name: "armTube" });
    const pd = V(s * 0.38, 1.48, 0.17);
    b.lathe([[0, 0], [0.15, 0], [0.12, 0.07], [0.06, 0.11], [0, 0.12]], { at: pd, axis: [s, 0, 0], bone: arm.joints[0], color: GOLD, segments: 8, name: "pauldron" });
    glow(b.part(new THREE.OctahedronGeometry(0.04), YELLOW, { bone: arm.joints[0], at: pd.clone().add(V(s * 0.1, 0.0, 0)) }), 1.6);
    const dirOf = (a: number) => V(s * Math.sin(a * D), -0.04, -Math.cos(a * D)).normalize();
    type Fe = { t: number; bone: Joint; a: number; L: number; W: number; c: [string, string, string] };
    const fe: Fe[] = [];
    for (let i = 0; i < 6; i++) fe.push({ t: 0.08 + 0.25 * (i / 5), bone: arm.joints[0], a: -14 + 12 * (i / 5), L: 0.7 + 0.1 * (i / 5), W: 0.2, c: [CRIMSON, RED, ORANGE] });
    for (let i = 0; i < 8; i++) fe.push({ t: 0.36 + 0.28 * (i / 7), bone: arm.joints[1], a: 0 + 16 * (i / 7), L: 1.05 - 0.07 * (i / 7), W: 0.18, c: [RED, ORANGE, AMBER] });
    const prim = [1.2, 1.28, 1.34, 1.36, 1.32, 1.24, 1.14, 1.02, 0.88];
    for (let i = 0; i < 9; i++) fe.push({ t: 0.68 + 0.3 * (i / 8), bone: arm.joints[2], a: 30 + 62 * (i / 8), L: prim[i], W: 0.15, c: [ORANGE, AMBER, YELLOW] });
    fe.forEach((f, i) => {
      const root = arm.path.at(f.t), dir = dirOf(f.a);
      flameFeather({ root, dir, normal: UP, ref: V(0, 0, 1), rows: FLIGHT, L: f.L, W: f.W, bone: f.bone, lift: -0.02 + 0.003 * (i % 9), a: f.c[0], m: f.c[1], c: f.c[2] });
      plate({ root: root.clone().addScaledVector(dir, 0.05), dir, normal: UP, ref: V(0, 0, 1), rows: PLUME, L: 0.4 * f.L + 0.08, W: f.W, thick: 0.013, color: flamePaint(0.4 * f.L + 0.08, GOLD_D, AMBER, YELLOW), bone: f.bone, lift: 0.03 + 0.002 * (i % 9), name: "covert" });
    });
    for (let i = 0; i < 10; i++) {
      const t = 0.05 + 0.9 * (i / 9);
      plate({ root: arm.path.at(t).add(V(0, 0, 0.02)), dir: dirOf(20 + 60 * (i / 9)), normal: UP, ref: V(0, 0, 1), rows: PLUME, L: 0.2, W: 0.14, thick: 0.014, color: flamePaint(0.2, CREAM_D, CREAM, YELLOW), bone: arm.jointAt(t), lift: 0.07 + 0.002 * i, name: "leadCovert" });
    }
    // drifting embers
    for (let i = 0; i < 6; i++) {
      const p = V(s * (1.2 + rand() * 1.4), 1.8 + rand() * 0.5, -0.6 + rand() * 0.6);
      glow(b.part(new THREE.OctahedronGeometry(0.02 + rand() * 0.02), i % 2 ? AMBER : YELLOW, { bone: arm.joints[2], at: p, name: "ember" }), 1.6);
    }
  }

  // chest emblem
  b.decal(body, EMBLEM, { at: [0, 1.15, 0.5], dir: [0, 0.1, 1], size: [0.26, 0.26], name: "emblem" });

  return b.root;
}
```