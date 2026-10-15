```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, paint, mix, gradient, countershade, mottle, svg } from "agentic-3js-builder";
import { cel, animeEye } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Phoenix of the Ember Court",
  description: "A cel-shaded flame phoenix with spread wings, layered flame feathers, gold regalia and a pyro-emblem brazier base.",
};

const DEG = Math.PI / 180;
const DEEP = "#a8130f";
const RED = "#e8381c";
const ORANGE = "#ff8a1e";
const YELLOW = "#ffd23a";
const PALE = "#fff3a8";
const GOLD = "#f2c14e";
const DGOLD = "#b8862a";
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = v(0, 1, 0);

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(11);

  const BODY = cel(countershade(RED, ORANGE, { level: -0.1 }));
  const HEADC = cel(countershade(ORANGE, YELLOW, { level: -0.2 }));
  const GOLDC = cel(GOLD, DGOLD);
  const BEAK = cel("#ffb02e", "#d97a1a");

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.95, -0.1], [0, 1.05, 0.2], [0, 1.22, 0.42]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.22, 0.42], [0, 1.42, 0.52], [0, 1.6, 0.66]]), {
    parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1).at, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head, at: head.local({ forward: 0.1, down: 0.045 }), aim: head.local({ forward: 0.3, down: 0.05 }), role: "jaw",
  });
  const tail = b.chain("tail", catmull([[0, 0.95, -0.15], [0, 0.9, -0.6], [0, 0.72, -1.15], [0, 0.5, -1.6]]), {
    parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail",
  });

  // ---------- helpers ----------
  const pcache = new Map<string, ReturnType<typeof paint>>();
  function featherPaint(L: number, cols: string[]) {
    const key = cols.join() + Math.round(L * 10);
    let p = pcache.get(key);
    if (!p) {
      p = paint((_p, _n, s) => {
        const t = Math.min(Math.max(s[0] / L, 0), 1);
        let c = t < 0.5 ? mix(cols[0], cols[1], t * 2) : mix(cols[1], cols[2], (t - 0.5) * 2);
        if (Math.abs(s[1]) < 0.007 && t > 0.05 && t < 0.9) c = mix(c, PALE, 0.55);
        return c;
      });
      pcache.set(key, p);
    }
    return p;
  }
  function featherOutline(L: number, w: number): [number, number, "sharp"?][] {
    return [
      [0, 0], [0.2 * L, 0.5 * w], [0.7 * L, 0.45 * w], [L, 0, "sharp"],
      [0.78 * L, -0.2 * w], [0.55 * L, -0.5 * w], [0.15 * L, -0.45 * w],
    ] as any;
  }
  function feather(root: THREE.Vector3, d: THREE.Vector3, L: number, w: number, thick: number, bone: any, cols: string[], n: THREE.Vector3) {
    const dd = d.clone().normalize();
    const y = new THREE.Vector3().crossVectors(n, dd).normalize();
    return b.extrude(featherOutline(L, w) as any, {
      at: root, x: dd.toArray() as any, y: y.toArray() as any, thickness: thick, bone, color: featherPaint(L, cols),
    });
  }
  function flame(at: THREE.Vector3, x: number[], h: number, w: number, color: string, bone: any, str = 1.2) {
    const o: any = [[-w, 0], [w, 0], [w * 0.9, h * 0.35], [w * 0.35, h * 0.7], [0, h, "sharp"], [-w * 0.4, h * 0.62], [-w * 0.95, h * 0.3]];
    return glow(b.extrude(o, { at, x: x as any, y: [0, 1, 0], thickness: 0.02, color, bone }), str);
  }

  // ---------- body ----------
  b.sweep(spine, [0.2, 0.27, 0.19], { color: BODY });
  b.sweep(neck, [0.15, 0.1, 0.085], { color: HEADC });
  b.sweep(tail, [0.14, 0.08, 0.04, 0.02], { color: BODY });
  // gold collar
  const nc = neck.at(0.3);
  b.part(new THREE.TorusGeometry(0.14, 0.028, 5, 10), GOLDC, { at: nc.at, dir: nc.axis, axis: "z", bone: neck.joints[0] });
  // chest ruff
  for (let i = -2; i <= 2; i++) {
    feather(v(i * 0.07, 1.04 - Math.abs(i) * 0.02, 0.42), v(i * 0.12, -0.85, 0.35), 0.34 - Math.abs(i) * 0.03, 0.12, 0.012,
      spine.joints[1], [ORANGE, YELLOW, PALE], v(1, 0, 0));
  }

  // ---------- head ----------
  const hc = head.local({ forward: 0.05, up: 0.02 });
  const skull = b.part(new THREE.SphereGeometry(0.1, 10, 8), HEADC, { bone: head, at: hc, scale: [1, 1.05, 1] });
  b.part(new THREE.ConeGeometry(0.05, 0.22, 5), BEAK, {
    bone: head, at: head.local({ forward: 0.22, down: 0.005 }), dir: head.dir([0, 1, -0.22]), scale: [1, 1, 0.75],
  });
  b.part(new THREE.ConeGeometry(0.04, 0.16, 5), BEAK, {
    bone: jaw, at: jaw.local([0, 0.085, 0]), dir: jaw.axis, scale: [1, 1, 0.6],
  });
  glow(b.part(new THREE.OctahedronGeometry(0.03), "#ff3a5c", { bone: head, at: head.local({ forward: 0.07, up: 0.115 }) }), 1.3);
  const eye = animeEye({ iris: "#ff4a1a" });
  const sk = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = sk.around(skull.at).at(s * 58, 4)!;
    b.decal(sk, eye, { at: hit, size: [0.058, 0.08], mirror: s > 0 });
  }
  // crest
  const crest: [number, number, number, number][] = [
    [0, 0.6, -1, 0.52], [0.35, 0.45, -1, 0.44], [-0.35, 0.45, -1, 0.44], [0.75, 0.3, -1, 0.3], [-0.75, 0.3, -1, 0.3],
  ];
  for (const [x, y, z, L] of crest)
    feather(head.local({ up: 0.085, forward: 0.0 }), v(x, y, z), L, 0.1, 0.012, head, [ORANGE, YELLOW, PALE], v(1, 0, 0));

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb(v(s * 0.13, 0.9, 0.02), v(s * 0.14, 0.3, 0.1), [0.28, 0.3, 0.12], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`], role: "leg" });
    b.sweep(leg, [0.05, 0.035, 0.03], { color: GOLDC });
    b.part(new THREE.SphereGeometry(0.11, 8, 6), cel(ORANGE), { bone: leg.joints[0], at: pts[0].clone().add(v(0, -0.1, 0)), scale: [1, 1.5, 1.2] });
    const F = pts[3];
    b.part(new THREE.TorusGeometry(0.045, 0.014, 4, 8), GOLDC, { bone: leg.joints[2], at: pts[2], dir: [0, 1, 0], axis: "z" });
    for (const k of [-1, 0, 1]) b.spike(F, v(k * 0.4, -0.15, 1).normalize().toArray() as any, 0.17, 0.026, { color: GOLDC, bone: leg.tip! });
    b.spike(F, [0, -0.1, -1], 0.1, 0.024, { color: GOLDC, bone: leg.tip! });
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `wing${S}`,
      catmull([v(s * 0.15, 1.2, 0.2), v(s * 0.55, 1.48, 0.08), v(s * 1.0, 1.62, -0.08), v(s * 1.35, 1.56, -0.18)]),
      { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "wing" },
    );
    b.sweep(arm, [0.09, 0.06, 0.04, 0.02], { color: BODY });
    const wr = arm.at(0.66);
    b.part(new THREE.TorusGeometry(0.06, 0.02, 4, 8), GOLDC, { bone: arm.joints[2], at: wr.at, dir: wr.axis, axis: "z" });
    const layer = (N: number, t0: number, t1: number, a0: number, a1: number, L0: number, L1: number, w: number, cols: string[], lift: number, th: number) => {
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const t = t0 + (t1 - t0) * u;
        const a = (a0 + (a1 - a0) * u) * DEG;
        const d = v(s * Math.cos(a), 0.1 - 0.12 * u, -Math.sin(a));
        const root = arm.at(t).at.clone().add(v(0, lift, 0));
        feather(root, d, L0 + (L1 - L0) * u, w, th, arm.jointAt(t), cols, UP);
      }
    };
    layer(11, 0.97, 0.17, 8, 80, 0.95, 0.5, 0.2, [RED, ORANGE, PALE], -0.01, 0.012);
    layer(10, 0.92, 0.2, 14, 70, 0.6, 0.35, 0.17, [DEEP, ORANGE, YELLOW], 0.02, 0.012);
    layer(8, 0.9, 0.2, 20, 75, 0.3, 0.22, 0.12, [DEEP, RED, ORANGE], 0.045, 0.012);
    flame(arm.at(0.95).at.clone().add(v(0, 0.05, 0)), [s, 0, 0], 0.22, 0.05, YELLOW, arm.joints[2]);
  }

  // ---------- tail ----------
  const troot = tail.at(0.2).at;
  for (let i = -4; i <= 4; i++) {
    const a = (i / 4) * 38 * DEG;
    const k = Math.abs(i) / 4;
    feather(troot.clone().add(v(0, 0.015 * (4 - Math.abs(i)) * 0.3, 0)), v(Math.sin(a) * 0.8, -0.1 - 0.12 * k, -Math.cos(a)),
      1.35 - 0.4 * k, 0.2, 0.012, tail.joints[0], i % 2 ? [RED, ORANGE, YELLOW] : [DEEP, ORANGE, PALE], UP);
  }
  for (const s of [1, -1]) {
    const a = tail.at(0.4).at;
    const tip = v(s * 0.55, 0.38, -2.7);
    b.sweep(bezier(a, v(s * 0.3, 1.0, -1.4), v(s * 0.9, 0.7, -2.2), tip), [0.045, 0.0], {
      bone: tail.joints[2], color: gradient(RED, YELLOW, a, tip), caps: { end: "point" },
    });
    flame(tip.clone().add(v(0, 0.0, 0.1)), [s, 0, 0], 0.2, 0.05, YELLOW, tail.joints[2], 1.5);
  }

  // ---------- base ----------
  const STONE = cel(mottle("#5d4a58", "#3e2e41", { size: 0.12, seed: 3 }));
  b.lathe([[0, 0], [0.72, 0], [0.72, 0.06], [0.62, 0.1], [0.56, 0.2], [0.63, 0.24], [0.63, 0.28], [0, 0.28]], {
    at: [0, 0, 0], bone: hips, color: STONE, segments: 16,
  });
  b.part(new THREE.TorusGeometry(0.62, 0.03, 4, 24), GOLDC, { bone: hips, at: [0, 0.285, 0], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.TorusGeometry(0.72, 0.025, 4, 24), GOLDC, { bone: hips, at: [0, 0.05, 0], dir: [0, 1, 0], axis: "z" });
  const EMB = svg(`<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#2a1020" stroke="#f2c14e" stroke-width="4"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="#b8862a" stroke-width="1.5"/>
    <path d="M32 8 C40 20 48 26 46 40 C45 50 38 56 32 56 C24 56 18 50 18 40 C18 32 24 28 26 20 C28 26 30 24 32 8 Z" fill="#e8381c" stroke="#ffd23a" stroke-width="2"/>
    <path d="M32 28 C37 35 40 38 38 45 C37 50 34 52 32 52 C28 52 26 49 26 45 C26 40 30 36 32 28 Z" fill="#ffd23a"/>
  </svg>`, { size: 192 });
  glow(b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", { bone: hips, at: [0, 0.14, 0.592], dir: [0, 0.12, 1], axis: "z", texture: EMB }), 0.8);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    flame(v(Math.sin(a) * 0.52, 0.275, Math.cos(a) * 0.52), [Math.cos(a), 0, -Math.sin(a)], 0.2 + 0.12 * ((i * 7) % 3) / 2, 0.06, i % 2 ? ORANGE : YELLOW, hips);
  }
  // floating embers
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.9 + rand() * 0.9;
    glow(b.part(new THREE.OctahedronGeometry(0.025 + rand() * 0.03), i % 2 ? YELLOW : ORANGE, {
      bone: hips, at: [Math.sin(a) * r, 0.5 + rand() * 1.8, Math.cos(a) * r],
    }), 1.4);
  }

  return b.root;
}
```