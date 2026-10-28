import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/index";
import { createBuilder, limb, rng, catmull, bezier, paint, mix, smoothstep, svg } from "../../../../src/index";
import type { Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Phoenix",
  description: "A stylized flame phoenix with wings spread: crimson-to-gold plumage, glowing feather tips, gold regalia and a long fan of fire tail feathers.",
};

const DEEP = "#7a0f1c", CRIM = "#d4202a", ORNG = "#ff7a1c", AMBR = "#ffb62e", YEL = "#ffe36a", WHITE = "#fff6c8";
const GOLD = "#f2b73c", GOLD_D = "#a8701a", DARK = "#3a0d16", TEAL = "#38e0d0";
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const D2R = Math.PI / 180;

const keyed = (keys: [number, number, number][]) => (t: number): [number, number] => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const f = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
      return [keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * f, keys[i - 1][2] + (keys[i][2] - keys[i - 1][2]) * f];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
};

const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><path d="M2 30 Q30 -4 62 20 Q34 50 2 30Z" fill="#2a0a12"/><ellipse cx="34" cy="26" rx="13" ry="14" fill="#ffd84a"/><ellipse cx="35" cy="27" rx="6" ry="11" fill="#2a0a12"/><circle cx="29" cy="20" r="4.5" fill="#fff"/><path d="M2 30 Q30 -6 62 20" stroke="#2a0a12" stroke-width="4" fill="none"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 1024 });
  const rand = rng(77);

  // feather plate along dir, flat against normal
  const plate = (root: THREE.Vector3, dir: THREE.Vector3, normal: THREE.Vector3, L: number, W: number,
    color: any, bone: Joint, thick = 0.012, u0 = 0, lift = 0) => {
    const d = dir.clone().normalize();
    const y = new THREE.Vector3().crossVectors(normal, d).normalize();
    if (y.z > 0 && Math.abs(normal.y) > 0.5) y.negate();
    const a = u0 * L;
    const w = (u: number) => W * Math.max(0.05, Math.sin(Math.PI * Math.min(0.97, u * 0.95 + 0.04)) ** 0.6) * (1 - 0.3 * u);
    const us = [0, 0.15, 0.4, 0.65, 0.85].filter((u) => u >= u0);
    if (!us.length || us[0] > u0) us.unshift(u0);
    const pts: OutlinePoint[] = us.map((u) => [u * L, w(u)] as OutlinePoint);
    pts.push([L, 0, "sharp"]);
    for (let i = us.length - 1; i >= 0; i--) pts.push([us[i] * L, -w(us[i])]);
    return b.extrude(pts, {
      at: root.clone().addScaledVector(normal, lift), x: d.toArray() as [number, number, number],
      y: y.toArray() as [number, number, number], thickness: thick, bevel: thick * 0.3, detail: 0.3, color, bone,
    });
  };
  const flamePaint = (L: number, a: string, c: string, d: string) =>
    paint((_p, n, s) => {
      const u = Math.min(1, Math.max(0, s[0] / L));
      const shaft = Math.abs(s[1]) < 0.006 && u < 0.9;
      const col = u < 0.5 ? mix(a, c, smoothstep(0, 0.5, u)) : mix(c, d, smoothstep(0.5, 1, u));
      return shaft ? mix(col, WHITE, 0.5) : col;
    });
  const glowTip = (root: THREE.Vector3, dir: THREE.Vector3, normal: THREE.Vector3, L: number, W: number, bone: Joint, color: string, lift: number) =>
    glow(plate(root, dir, normal, L, W, color, bone, 0.016, 0.78, lift), 1.3);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.0, -0.2], dir: [0, 0.6, 0.4], role: "spine" });
  const bodyPath = catmull([[0, 1.0, -0.2], [0, 1.2, 0.0], [0, 1.45, 0.22], [0, 1.68, 0.36], [0, 1.88, 0.5], [0, 2.0, 0.64]]);
  const tN = bodyPath.closestT([0, 1.68, 0.36]);
  const spine = b.chain("spine", bodyPath.slice(0, tN), { parent: hips, count: 3, role: "spine" });
  const spineTop = spine.spanJoints[2];
  const neck = b.chain("neck", bodyPath.slice(tN, 1), { parent: spineTop, count: 3, role: "neck" });
  const head = b.joint("head", { parent: neck.spanJoints[2], at: bodyPath.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.05, up: -0.06 }), aim: head.local({ forward: 0.25, up: -0.07 }), role: "jaw" });
  const crest = b.joint("crest", { parent: head, at: head.local({ forward: -0.04, up: 0.1 }), aim: head.local({ forward: -0.2, up: 0.25 }), role: "hinge" });

  // ---------- body ----------
  const bodyPaint = paint((_p, n, s) => {
    const belly = smoothstep(0.1, -0.5, n.y);
    const base = mix(CRIM, ORNG, smoothstep(0, 1, s[0] * 1.2));
    return mix(base, mix(AMBR, YEL, 0.4), belly);
  });
  b.sweep(bodyPath, keyed([[0, 0.24, 0.22], [0.25, 0.34, 0.3], [0.5, 0.4, 0.36], [0.7, 0.3, 0.27], [0.88, 0.2, 0.18], [1, 0.14, 0.13]]), {
    bone: [spine, neck], color: bodyPaint, name: "body",
  });
  // chest gem + collar
  glow(b.part(new THREE.OctahedronGeometry(0.07), TEAL, { bone: spineTop, at: [0, 1.62, 0.66], scale: [1, 1.3, 0.6], name: "gem" }), 1.5);
  b.part(new THREE.OctahedronGeometry(0.095), GOLD, { bone: spineTop, at: [0, 1.62, 0.62], scale: [1, 1.3, 0.5], name: "gemSetting" });
  b.part(new THREE.TorusGeometry(0.2, 0.03, 5, 10), GOLD, { bone: neck.spanJoints[0], at: [0, 1.82, 0.46], dir: [0, 0.8, 0.5], axis: "z", name: "collar" });

  // chest/neck fire cards-as-plates
  for (let i = 0; i < 9; i++) {
    const k = i - 4;
    plate(V(k * 0.05, 1.5 + 0.02 * Math.abs(k), 0.5), V(k * 0.12, -0.9, 0.35), V(0, 0, 1), 0.3 - Math.abs(k) * 0.015, 0.06,
      flamePaint(0.3, YEL, AMBR, ORNG), spineTop, 0.012);
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), mix(CRIM, ORNG, 0.3) as any, { bone: head, at: head.local({ forward: 0.04, up: 0.01 }), scale: [0.15, 0.14, 0.18], name: "skull" });
  const upper = bezier(head.local({ forward: 0.13, up: -0.01 }), head.local({ forward: 0.24, up: 0.02 }), head.local({ forward: 0.32, up: -0.02 }), head.local({ forward: 0.32, up: -0.15 }));
  b.sweep(upper, (t) => [0.07 * (1 - t) ** 0.8 + 0.006, 0.085 * (1 - t) ** 0.7 + 0.006], { bone: head, color: GOLD, sides: 8, name: "upperBeak" });
  b.sweep([head.local({ forward: 0.07, up: -0.065 }), head.local({ forward: 0.18, up: -0.075 }), head.local({ forward: 0.28, up: -0.07 })], [0.055, 0.012], { bone: jaw, color: GOLD_D, sides: 8, name: "lowerBeak" });
  for (const s of [1, -1]) {
    const E = head.local({ left: s * 0.118, up: 0.05, forward: 0.1 });
    b.part(new THREE.PlaneGeometry(0.15, 0.11), "#ffffff", {
      bone: head, at: E, dir: V(s * 0.9, 0.1, 0.35).normalize(), axis: "z", texture: EYE, name: "eye",
    });
    b.part(new THREE.TorusGeometry(0.07, 0.01, 4, 8), GOLD, { bone: head, at: E.clone().add(V(s * 0.004, 0, 0)), dir: V(s, 0.1, 0.35), axis: "z", name: "eyeRing" });
  }
  // crest of flame blades
  for (let i = 0; i < 7; i++) {
    const k = i - 3;
    const dir = V(k * 0.18, 0.55, -0.85);
    plate(head.local({ left: k * 0.012, up: 0.12, forward: -0.02 - 0.01 * Math.abs(k) }), dir, V(1, 0, 0), 0.5 - 0.04 * Math.abs(k), 0.07,
      flamePaint(0.5, ORNG, AMBR, YEL), crest, 0.012);
  }

  // ---------- tail: fan of long flame feathers ----------
  const tail = b.chain("tail", catmull([[0, 1.0, -0.36], [0, 0.92, -0.7], [0, 0.82, -1.0]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.14, 0.07], { color: DEEP, name: "tailBase" });
  const d0 = V(0, -0.3, -0.95).normalize();
  const tN2 = new THREE.Vector3().crossVectors(V(1, 0, 0), d0).normalize();
  const tb = V(0, 0.9, -0.6);
  const tbone = tail.spanJoints[1];
  for (let layer = 0; layer < 2; layer++) {
    const n = layer ? 8 : 9;
    for (let i = 0; i < n; i++) {
      const k = i - (n - 1) / 2;
      const dir = d0.clone().applyAxisAngle(tN2, k * 9 * D2R).add(V(0, layer * 0.08 + 0.05 * Math.abs(k) * (i % 2), 0)).normalize();
      const L = (layer ? 1.4 : 1.7) - 0.02 * k * k + (i % 2) * 0.15;
      const lift = layer ? -0.025 : 0.01;
      const cols: [string, string, string] = layer ? [DEEP, CRIM, ORNG] : [CRIM, ORNG, YEL];
      plate(tb, dir, tN2, L, 0.19, flamePaint(L, ...cols), tbone, 0.013, 0, lift);
      glowTip(tb, dir, tN2, L, 0.19, tbone, layer ? AMBR : WHITE, lift);
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const foot = V(s * 0.27, 0.07, 0.22);
    const pts = limb(V(s * 0.2, 0.98, -0.1), foot, [0.36, 0.4, 0.3], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, { parent: hips, names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, keyed([[0, 0.17, 0.17], [0.35, 0.1, 0.1], [0.7, 0.06, 0.06], [1, 0.05, 0.05]]), {
      color: paint((_p, _n, t) => (t[0] > 0.7 ? GOLD : mix(ORNG, AMBR, 0.4))), sides: 8, name: "leg",
    });
    const ank = leg.tip as Joint;
    for (const [tag, ang] of [["A", -28], ["B", 0], ["C", 28]] as [string, number][]) {
      const a = (ang + s * 4) * D2R;
      const dir = V(Math.sin(a), 0, Math.cos(a));
      const p1 = foot.clone().addScaledVector(dir, 0.2).add(V(0, -0.03, 0));
      const toe = b.chain(`toe${tag}${side}`, [foot.clone(), p1], { parent: ank, names: [`toe${tag}${side}1`, `toe${tag}${side}2`], role: "digit" });
      b.sweep(toe, [0.04, 0.03], { color: GOLD, sides: 6, name: "toe" });
      b.sweep(bezier(p1, p1.clone().addScaledVector(dir, 0.07).add(V(0, 0.0, 0)), p1.clone().addScaledVector(dir, 0.12).add(V(0, -0.04, 0))), [0.032, 0], {
        bone: toe.tip as Joint, color: DARK, sides: 6, name: "claw",
      });
    }
    const h1 = foot.clone().add(V(0, -0.0, -0.17));
    const hal = b.chain(`hallux${side}`, [foot.clone(), h1], { parent: ank, names: [`hallux${side}1`, `hallux${side}2`], role: "digit" });
    b.sweep(hal, [0.04, 0.03], { color: GOLD, sides: 6, name: "hallux" });
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`wing${side}`, catmull([[s * 0.3, 1.7, 0.2], [s * 1.2, 1.85, 0.0], [s * 2.0, 1.95, 0.15], [s * 2.7, 2.0, 0.05]]), {
      parent: spineTop, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "wing",
    });
    b.sweep(arm, (t): [number, number] => [0.11 - 0.06 * t, 0.06 - 0.03 * t], { color: DEEP, sides: 8, name: "armTube" });
    // gold bracers
    for (const t of [0.15, 0.55]) {
      const f = arm.at(t);
      b.lathe([[0.07, -0.035], [0.13, -0.035], [0.13, 0.035], [0.07, 0.035]], { at: f, axis: f, bone: arm.jointAt(t), color: GOLD, segments: 8, name: "armBand" });
    }
    const dirOf = (aDeg: number, sl = -0.05) => V(s * Math.sin(aDeg * D2R), sl, -Math.cos(aDeg * D2R)).normalize();
    const rows: { t: number; a: number; L: number; bone: Joint; cols: [string, string, string]; W: number }[] = [];
    for (let i = 0; i < 8; i++) rows.push({ t: 0.1 + 0.28 * (i / 7), a: -10 + 14 * (i / 7), L: 0.8 + 0.2 * (i / 7), bone: arm.spanJoints[0], cols: [DEEP, CRIM, ORNG], W: 0.21 });
    for (let i = 0; i < 9; i++) rows.push({ t: 0.38 + 0.3 * (i / 8), a: 6 + 22 * (i / 8), L: 1.3 - 0.06 * (i / 8), bone: arm.spanJoints[1], cols: [CRIM, ORNG, AMBR], W: 0.19 });
    const pl = [1.55, 1.65, 1.7, 1.7, 1.62, 1.5, 1.38, 1.22, 1.05];
    for (let i = 0; i < 9; i++) rows.push({ t: 0.7 + 0.28 * (i / 8), a: 34 + 60 * (i / 8), L: pl[i], bone: arm.spanJoints[2], cols: [ORNG, AMBR, YEL], W: 0.17 });
    rows.forEach((r, i) => {
      const root = arm.path.at(r.t) as THREE.Vector3;
      const dir = dirOf(r.a);
      const lift = -0.02 + 0.003 * (i % 9);
      plate(root, dir, UP, r.L, r.W, flamePaint(r.L, ...r.cols), r.bone, 0.013, 0, lift);
      glowTip(root, dir, UP, r.L, r.W, r.bone, i % 2 ? WHITE : YEL, lift);
      // covert layer
      plate(root.clone().addScaledVector(dir, 0.05), dir, UP, r.L * 0.4, r.W * 1.05, flamePaint(r.L * 0.4, CRIM, ORNG, AMBR), r.bone, 0.013, 0, 0.03 + 0.002 * (i % 9));
    });
    // wrist gem
    const wf = arm.at(0.7);
    glow(b.part(new THREE.OctahedronGeometry(0.055), TEAL, { bone: arm.spanJoints[2], at: wf.at.clone().add(V(0, 0.1, 0.05)), name: "wristGem" }), 1.5);
    // embers drifting
    for (let i = 0; i < 8; i++) {
      const p = V(s * (1.2 + rand() * 2.0), 2.3 + rand() * 0.6, -0.3 + rand() * 0.6);
      glow(b.part(new THREE.OctahedronGeometry(0.02 + rand() * 0.02), i % 2 ? AMBR : WHITE, { bone: arm.spanJoints[1], at: p, name: "ember" }), 1.6);
    }
  }

  return b.root;
}
