```ts
import * as THREE from "three";
import type { OutlinePoint } from "agentic-3js-builder";
import { createBuilder, limb, rng, catmull, bezier, countershade, mix, paint, smoothstep, svg } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Phoenix",
  description: "A cel-styled fire phoenix with spread flame-feather wings, golden trim, a long streaming tail and a glowing pyro gem.",
};

const DEEP = "#8a1020", RED = "#e02a1c", ORANGE = "#ff7a1a", YELLOW = "#ffc933", PALE = "#fff2a8";
const GOLD = "#f2b73c", GOLD_D = "#a8701a", DARK = "#2a0c14", EYE = "#fff6c0";
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const D2R = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 1024 });
  const rand = rng(77);

  const hips = b.joint("hips", { at: [0, 1.2, -0.2], dir: [0, 0.6, 0.4], role: "spine" });
  const bodyPath = catmull([[0, 1.2, -0.2], [0, 1.4, 0.02], [0, 1.7, 0.25], [0, 2.0, 0.42], [0, 2.22, 0.52], [0, 2.38, 0.66]]);
  const tN = bodyPath.closestT([0, 2.0, 0.42]);
  const spine = b.chain("spine", bodyPath.slice(0, tN), { parent: hips, count: 3, role: "spine" });
  const chest = spine.joints[2];
  const neck = b.chain("neck", bodyPath.slice(tN, 1), { parent: chest, count: 3, role: "neck" });
  const head = b.joint("head", { parent: neck.joints[2], at: bodyPath.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.06, up: -0.08 }), aim: head.local({ forward: 0.3, up: -0.09 }), role: "jaw" });
  const crest = b.joint("crest", { parent: head, at: head.local({ forward: -0.05, up: 0.12 }), aim: head.local({ forward: -0.25, up: 0.25 }), role: "hinge" });

  // feather helper
  const outline = (L: number, W: number): OutlinePoint[] => [
    [0, -0.25 * W], [0.3 * L, -0.5 * W], [0.75 * L, -0.4 * W], [L, 0, "sharp"], [0.8 * L, 0.45 * W], [0.3 * L, 0.55 * W], [0, 0.25 * W],
  ];
  const flamePaint = (L: number, a: string, m: string, c: string) =>
    paint((_p, n, s) => {
      const u = Math.min(1, Math.max(0, s[0] / L));
      const col = u < 0.5 ? mix(a, m, smoothstep(0, 0.5, u)) : mix(m, c, smoothstep(0.5, 1, u));
      return n.y < -0.4 ? mix(col, DEEP, 0.3) : Math.abs(s[1]) < 0.006 ? mix(col, PALE, 0.5) : col;
    });
  const feather = (root: THREE.Vector3, dir: THREE.Vector3, L: number, W: number, color: any, bone: Joint, y?: THREE.Vector3, th = 0.014) => {
    const x = dir.clone().normalize();
    const yy = y ?? new THREE.Vector3().crossVectors(UP, x).normalize();
    return b.extrude(outline(L, W), { at: root, x, y: yy, thickness: th, bevel: th * 0.3, detail: 0.4, color, bone });
  };

  // body
  const rad = (t: number): [number, number] => {
    const k = [0.29, 0.4, 0.46, 0.42, 0.3, 0.2, 0.15];
    const f = t * 6, i = Math.min(5, Math.floor(f)), u = f - i;
    const r = k[i] + (k[i + 1] - k[i]) * u;
    return [r, r * 0.92];
  };
  const body = b.sweep(bodyPath, rad, {
    bone: [spine, neck],
    color: countershade(mix(RED, ORANGE, 0.3), paint((p) => mix(YELLOW, PALE, smoothstep(1.4, 2.2, p.y))), { level: -0.15, soft: 0.3 }),
    name: "body",
  });
  const skin = b.surface(body);
  b.sweep(skin.loop(neck.joints[0], { lift: 0.012 }), [0.03, 0.012], { section: "box", color: GOLD, name: "collar" });
  const hit = skin.ray([0, 1.8, 2], [0, 0, -1]);
  if (hit) {
    b.stick(new THREE.CylinderGeometry(0.1, 0.11, 0.04, 8), GOLD, hit, { embed: 0.4 });
    glow(b.stick(new THREE.OctahedronGeometry(0.075), ORANGE, hit.moved([0, 0.04, 0]), { embed: 0.2, name: "pyroGem" }), 1.6);
  }
  // breast feather fringe
  const tuft = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 2 Q30 30 22 50 L16 63 L10 50 Q2 30 16 2Z" fill="#ffffff"/><path d="M16 8 L16 58" stroke="#c9c9c9" stroke-width="2"/></svg>`, { size: 96 });
  b.cards(skin.scatter(120, { rng: rng(3), minDist: 0.08, filter: (h) => h.at.y > 1.3 && h.at.y < 2.2 && h.n.z > 0 }), tuft, { size: [0.12, 0.2], lean: 55, flow: [0, -1, -0.1], bend: 20, vary: 0.25, rng: rng(4), color: YELLOW });

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), mix(ORANGE, YELLOW, 0.4) as any, { bone: head, at: head.local({ forward: 0.04, up: 0.01 }), scale: [0.17, 0.16, 0.2], name: "skull" });
  const up = bezier(head.local({ forward: 0.15, up: -0.015 }), head.local({ forward: 0.27, up: 0.03 }), head.local({ forward: 0.37, up: -0.01 }), head.local({ forward: 0.37, up: -0.16 }));
  b.sweep(up, (t) => [0.08 * (1 - t) ** 0.8 + 0.006, 0.095 * (1 - t) ** 0.7 + 0.006], { bone: head, color: GOLD, sides: 8, name: "upperBeak" });
  b.sweep([head.local({ forward: 0.08, up: -0.075 }), head.local({ forward: 0.22, up: -0.085 }), head.local({ forward: 0.33, up: -0.065 })], [0.06, 0.014], { bone: jaw, color: GOLD_D, sides: 8, name: "lowerBeak" });
  const eyeTex = svg(`<svg viewBox="0 0 64 48"><path d="M3 30 Q32 -4 61 24 Q32 50 3 30Z" fill="#2a0c14"/><circle cx="34" cy="26" r="15" fill="#ffb21e"/><circle cx="34" cy="27" r="8" fill="#6a1010"/><circle cx="28" cy="20" r="5" fill="#fff"/><path d="M2 30 Q30 -8 62 22" stroke="#2a0c14" stroke-width="4" fill="none"/></svg>`, { size: 160 });
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, { at: head.local({ left: s * 0.12, up: 0.05, forward: 0.1 }), dir: [s * 0.9, 0.1, 0.4], size: [0.12, 0.09], mirror: s < 0, name: "eye" });
    b.spike(head.local({ left: s * 0.1, up: 0.1, forward: 0.12 }), [s * 0.6, 0.5, -0.4], 0.2, 0.025, { bone: head, color: ORANGE, sides: 4 });
  }
  // flame crest
  for (let k = 0; k < 5; k++) {
    const e = (20 + k * 16) * D2R, w = (k - 2) * 0.05;
    const dir = V(0, Math.sin(e), -Math.cos(e));
    const L = 0.55 - Math.abs(k - 2) * 0.07;
    const col = flamePaint(L, RED, ORANGE, YELLOW);
    feather(head.local({ left: w, up: 0.13, forward: -0.03 - k * 0.01 }), dir, L, 0.1, col, crest, V(1, 0, 0), 0.02);
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 1.15, -0.36], [0, 1.0, -0.7], [0, 0.85, -1.0]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.15, 0.08], { color: RED, name: "tailBase" });
  const tb = V(0, 1.0, -0.65);
  for (let i = 0; i < 9; i++) {
    const k = i - 4;
    const dir = V(k * 0.12, -0.35 - 0.02 * Math.abs(k), -1).normalize();
    const L = 2.0 - 0.1 * Math.abs(k) + 0.1 * Math.sin(i * 2);
    feather(tb.clone().add(V(k * 0.02, 0, 0)), dir, L, 0.2, flamePaint(L, DEEP, i % 2 ? RED : ORANGE, i % 3 ? YELLOW : PALE), tail.joints[1], undefined, 0.016);
  }

  // legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hip = V(s * 0.22, 1.1, -0.1), foot = V(s * 0.3, 0.07, 0.3);
    const pts = limb(hip, foot, [0.4, 0.5, 0.38], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${sd}`, pts, { parent: hips, names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `ankle${sd}`], role: "leg" });
    b.sweep(leg, (t): [number, number] => [0.16 - 0.1 * t, 0.16 - 0.1 * t], { color: (t) => (t > 0.72 ? GOLD : ORANGE), sides: 8 });
    const ank = leg.tip as Joint;
    for (const a of [-28, 0, 28]) {
      const r = (a + s * 3) * D2R, d = V(Math.sin(r), 0, Math.cos(r));
      const tip = foot.clone().addScaledVector(d, 0.3).add(V(0, -0.045, 0));
      b.rod(foot, tip, [0.05, 0.03], { bone: ank, color: GOLD, sides: 6 });
      b.spike(tip, d, 0.1, 0.03, { bone: ank, color: DARK, sides: 6 });
    }
    b.spike(foot.clone().add(V(0, 0, -0.02)), V(0, -0.1, -1), 0.2, 0.045, { bone: ank, color: GOLD, sides: 6 });
  }

  // wings
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const arm = b.chain(`wing${sd}`, catmull([[s * 0.3, 1.95, 0.22], [s * 1.3, 2.1, 0.0], [s * 2.2, 2.25, 0.2], [s * 2.9, 2.3, 0.1]]), { parent: chest, names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`], role: "wing" });
    b.sweep(arm, (t): [number, number] => [0.12 - 0.06 * t, 0.06 - 0.03 * t], { color: RED, sides: 8 });
    b.lathe([[0.07, -0.03], [0.14, -0.03], [0.14, 0.03], [0.07, 0.03]], { at: arm.at(0.4), axis: arm.at(0.4), bone: arm.joints[1], color: GOLD, segments: 8 });
    const dirOf = (a: number) => V(s * Math.sin(a * D2R), -0.05, -Math.cos(a * D2R)).normalize();
    const lay = (n: number, t0: number, t1: number, a0: number, a1: number, L0: number, L1: number, W: number, bone: Joint, lift: number, c: [string, string, string]) => {
      for (let i = 0; i < n; i++) {
        const f = n > 1 ? i / (n - 1) : 0;
        const L = L0 + (L1 - L0) * Math.sin(f * Math.PI * 0.9 + 0.2) / 1;
        feather(arm.path.at(t0 + (t1 - t0) * f).add(V(0, lift + 0.004 * i, 0)), dirOf(a0 + (a1 - a0) * f), L, W, flamePaint(L, c[0], c[1], c[2]), bone);
      }
    };
    lay(9, 0.62, 0.98, 14, 92, 1.0, 1.55, 0.17, arm.joints[2], -0.02, [RED, ORANGE, YELLOW]);
    lay(9, 0.28, 0.6, 70, 100, 1.05, 1.3, 0.2, arm.joints[1], -0.02, [DEEP, RED, ORANGE]);
    lay(6, 0.05, 0.28, 95, 108, 0.7, 0.9, 0.22, arm.joints[0], -0.02, [DEEP, RED, ORANGE]);
    lay(12, 0.08, 0.95, 40, 85, 0.35, 0.5, 0.13, arm.joints[1], 0.04, [ORANGE, YELLOW, PALE]);
    glow(b.part(new THREE.OctahedronGeometry(0.05), ORANGE, { bone: arm.joints[2], at: arm.at(0.74).at.clone().add(V(0, 0.09, 0.04)) }), 1.6);
    // ember sparks
    for (let i = 0; i < 6; i++)
      glow(b.part(new THREE.OctahedronGeometry(0.02 + rand() * 0.02), i % 2 ? YELLOW : ORANGE, { bone: arm.joints[2], at: [s * (2.2 + rand() * 1.3), 2.5 + rand() * 0.6, -0.5 + rand() * 0.8] }), 1.6);
  }
  return b.root;
}
```