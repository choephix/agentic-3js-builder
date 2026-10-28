```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { paint, mix, noise, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder";

export const meta = {
  name: "Roadside Shrine",
  description: "A small Inazuma-style roadside shrine: torii gate, stone lanterns, shrine hall and offerings.",
};

const VERM = "#c9372c";
const VERM_D = "#8e1f22";
const GOLD = "#f0c04a";
const WOODD = "#3a2a2a";
const ROOF = "#4a4a68";
const ROOF_L = "#6c6c92";
const CREAM = "#f3e6c8";
const PURPLE = "#7a55b8";
const PINK = "#f4a8c0";

const stone = paint((p, n) => {
  let c = mix("#9a9aa8", "#c6c6d0", noise(p, 0.12, 3));
  c = mix(c, "#5e8a4a", smoothstep(0.6, 0.8, noise(p, 0.1, 7)) * (1 - smoothstep(0.1, 0.5, p.y)) * 0.7);
  if (n.y < -0.3) c = mix(c, "#6a6a7c", 0.4);
  return c;
});
const wood = paint((p, n) => mix(mix("#6a3b28", "#8a5238", noise(p, 0.08, 2)), "#3a2018", n.y < 0 ? 0.3 : 0));

const ema = svg(
  `<svg viewBox="0 0 60 60"><path d="M6 20 L30 4 L54 20 V56 H6Z" fill="#d9b27a" stroke="#6a4020" stroke-width="3"/><circle cx="30" cy="34" r="12" fill="#c9372c"/><path d="M30 24 Q38 34 30 44 Q22 34 30 24Z" fill="#f3e6c8"/></svg>`,
  { size: 128 },
);
const paper = svg(
  `<svg viewBox="0 0 30 60"><path d="M4 0 H26 L24 20 L28 32 L22 44 L26 58 H4Z" fill="#f6f0e0" stroke="#c9b890" stroke-width="2"/><path d="M15 6 V50" stroke="#c9372c" stroke-width="3"/></svg>`,
  { size: 96 },
);
const plaque = svg(
  `<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#1e1a2a" stroke="#f0c04a" stroke-width="4"/><path d="M40 10 L56 40 H24Z" fill="none" stroke="#f0c04a" stroke-width="4"/><circle cx="40" cy="30" r="5" fill="#f0c04a"/></svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "roadsideShrine" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const part = (g: THREE.BufferGeometry, c: any, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone: root, at, ...o });
  const box = (s: [number, number, number], at: [number, number, number], c: any, o: any = {}) =>
    part(new THREE.BoxGeometry(...s), c, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, at: [number, number, number], c: any, o: any = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, o);

  // ground and path
  cyl(2.6, 2.7, 0.1, 10, [0, 0.04, 0], stone);
  for (let i = 0; i < 5; i++) box([0.7, 0.04, 0.5], [(i % 2) * 0.06 - 0.03, 0.1, 2.2 - i * 0.5], stone);

  // torii
  const T = 2.1;
  for (const s of [-1, 1]) {
    cyl(0.12, 0.14, 2.6, 8, [s * 0.95, 1.4, T], VERM);
    cyl(0.17, 0.17, 0.14, 8, [s * 0.95, 0.17, T], stone);
    cyl(0.145, 0.145, 0.07, 8, [s * 0.95, 2.3, T], WOODD);
  }
  box([2.7, 0.14, 0.2], [0, 2.38, T], VERM);
  box([3.4, 0.14, 0.3], [0, 2.8, T], WOODD);
  box([3.5, 0.1, 0.34], [0, 2.92, T], VERM);
  for (const s of [-1, 1]) {
    box([0.5, 0.14, 0.3], [s * 1.8, 2.9, T], WOODD, { rotation: [0, 0, s * 12] });
  }
  box([0.14, 0.4, 0.14], [0, 2.6, T], VERM_D);
  b.part(new THREE.PlaneGeometry(0.4, 0.26), "#ffffff", {
    bone: root, at: [0, 2.6, T + 0.08], dir: [0, 0, 1], axis: "z", texture: plaque,
  });
  // shimenawa rope
  b.sweep(
    [[-0.85, 2.2, T + 0.14], [-0.4, 2.1, T + 0.14], [0.4, 2.1, T + 0.14], [0.85, 2.2, T + 0.14]],
    0.04, { color: "#d8c28a", bone: root, sides: 6 },
  );
  for (const x of [-0.5, 0, 0.5])
    b.cards([{ at: new THREE.Vector3(x, 2.1, T + 0.14), axis: new THREE.Vector3(0, 1, 0) } as any], paper, {
      size: [0.14, 0.3], lean: 180, flow: [0, 0, 1], bone: root, sink: 0,
    });

  // shrine hall
  box([1.5, 0.2, 1.3], [0, 0.2, -0.6], stone);
  box([1.3, 0.14, 1.1], [0, 0.37, -0.6], stone);
  for (const x of [-0.5, 0.5]) for (const z of [-1.0, -0.2]) cyl(0.07, 0.07, 1.0, 8, [x, 0.95, z], VERM);
  box([1.1, 0.9, 0.8], [0, 0.89, -0.7], CREAM);
  box([0.5, 0.7, 0.04], [0, 0.78, -0.29], WOODD);
  glow(box([0.3, 0.5, 0.02], [0, 0.78, -0.27], "#ffd27a"), 0.8);
  b.lathe([[0, 0], [1.2, 0], [0.95, 0.12], [0.5, 0.4], [0.12, 0.62], [0, 0.66]], {
    at: [0, 1.42, -0.6], segments: 4, spin: 45, color: ROOF, bone: root,
  });
  b.lathe([[1.22, 0], [1.26, 0.03], [1.0, 0.15], [0.96, 0.12]], {
    at: [0, 1.42, -0.6], segments: 4, spin: 45, color: ROOF_L, bone: root,
  });
  cyl(0.05, 0.08, 0.3, 6, [0, 2.2, -0.6], GOLD);
  part(new THREE.OctahedronGeometry(0.1, 0), GOLD, [0, 2.4, -0.6]);
  // bell and rope
  cyl(0.1, 0.12, 0.14, 8, [0, 1.3, 0.0], GOLD);
  b.rod([0, 1.23, 0], [0, 0.6, 0.0], 0.025, { color: "#d8c28a", bone: root, sides: 5 });
  box([0.1, 0.1, 0.1], [0, 1.28, -0.1], WOODD);

  // lanterns
  for (const s of [-1, 1]) {
    const x = s * 1.5;
    const z = 0.9;
    cyl(0.28, 0.32, 0.12, 8, [x, 0.12, z], stone);
    cyl(0.1, 0.12, 0.8, 8, [x, 0.58, z], stone);
    cyl(0.2, 0.14, 0.1, 8, [x, 1.03, z], stone);
    cyl(0.17, 0.17, 0.3, 8, [x, 1.23, z], stone);
    glow(cyl(0.12, 0.12, 0.2, 8, [x, 1.23, z], "#ffc766"), 1.3);
    cyl(0.04, 0.4, 0.22, 8, [x, 1.5, z], ROOF);
    cyl(0.01, 0.01, 0.01, 6, [x, 1.65, z], GOLD);
    part(new THREE.SphereGeometry(0.06, 6, 4), GOLD, [x, 1.65, z]);
  }

  // offerings
  box([0.9, 0.12, 0.3], [0, 0.5, 0.1], WOODD);
  for (const [i, x] of [-0.3, 0, 0.3].entries()) {
    cyl(0.07, 0.07, 0.04, 8, [x, 0.58, 0.1], i === 1 ? PINK : CREAM);
    part(new THREE.SphereGeometry(0.06, 6, 4), i === 1 ? PINK : "#f6f6ee", [x, 0.64, 0.1], { scale: [1, 0.8, 1] });
  }
  cyl(0.06, 0.05, 0.1, 8, [0.38, 0.19, 0.55], "#e8e0c8");
  cyl(0.05, 0.04, 0.06, 8, [-0.35, 0.18, 0.5], PURPLE);
  // ema board rack
  for (const s of [-1, 1]) cyl(0.03, 0.03, 0.9, 6, [s * 0.5 + 0.9, 0.55, -0.5], WOODD);
  box([1.1, 0.06, 0.06], [0.9 + 0.0, 1.0, -0.5], WOODD);
  for (const [i, x] of [0.55, 0.85, 1.15, 1.45].entries()) {
    b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
      bone: root, at: [x - 0.0 + 0.0, 0.84, -0.46], dir: [0, 0, 1], axis: "z", texture: ema, rotation: [0, 0, 0],
    });
    if (i > 2) break;
  }
  // sakura tree
  b.sweep([[-1.9, 0.1, -1.2], [-1.85, 0.8, -1.2], [-1.6, 1.5, -1.2]], [0.16, 0.08], {
    color: wood, bone: root, sides: 6,
  });
  const blossom = [PINK, "#f8c6d6", "#e98fb0"];
  [[-1.6, 1.9, -1.2, 0.6], [-2.0, 1.75, -1.3, 0.45], [-1.3, 1.75, -1.0, 0.45], [-1.7, 2.2, -1.1, 0.4]].forEach(
    ([x, y, z, r], i) => part(new THREE.IcosahedronGeometry(r, 1), blossom[i % 3], [x, y, z], { flat: true }),
  );

  return b.root;
}
```