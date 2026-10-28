```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A double-bladed frost battle axe with icy steel blades, glowing rune inlays, gold trim, a wrapped haft, hanging fur and tassel, ice crystals, on a small stone stand. League of Legends style.",
};

const ICE = "#9fe6ff";
const GOLD = "#e8b84a";
const GOLD_D = "#a6741f";
const NAVY = "#1c2a55";
const FUR = "#e9f2fa";
const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

const steel = paint((p, n) => {
  const d = n.dot(KEY);
  const base = mix("#3a5f9a", "#cdeeff", smoothstep(-0.5, 0.9, d));
  return mix(base, "#ffffff", smoothstep(0.7, 0.85, noise(p, 0.05, 3)) * 0.35);
});
const wood = paint((p, n) => {
  const d = n.dot(KEY);
  const g = Math.sin(p.y * 90 + noise(p, 0.05, 2) * 6) * 0.5 + 0.5;
  return mix(mix("#2a1a2e", "#5b3a55", smoothstep(-0.5, 0.9, d)), "#14091a", g * 0.2);
});
const stone = paint((p, n) => mix(mix("#4a5470", "#8e9ab8", noise(p, 0.12, 5)), "#dfe8f6", smoothstep(0.5, 1, n.y) * 0.4));

const RUNE = svg(
  `<svg viewBox="0 0 60 120"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30 6 L30 114 M30 30 L48 48 L30 66 M30 66 L12 84 L30 102" stroke="#19b6ff" stroke-width="12"/>
  <path d="M30 6 L30 114 M30 30 L48 48 L30 66 M30 66 L12 84 L30 102" stroke="#e8fdff" stroke-width="4"/></g></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1c2a55" stroke="#e8b84a" stroke-width="5"/>
  <path d="M32 8 L38 28 L56 32 L38 36 L32 56 L26 36 L8 32 L26 28Z" fill="#b8f0ff"/>
  <circle cx="32" cy="32" r="5" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const FURTUFT = svg(
  `<svg viewBox="0 0 40 60"><path d="M20 0 Q4 20 6 60 Q20 50 20 30 Q20 50 34 60 Q36 20 20 0Z" fill="#f2f8ff" stroke="#b9cde6" stroke-width="2"/>
  <path d="M20 4 Q14 24 20 54" stroke="#cfe0f2" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "frostAxe", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: Record<string, unknown> = {}) =>
    b.part(g, c, { bone: root, at, ...o });
  const lathe = (o: OutlinePoint[], at: number[], c: any, seg = 10, ax = [0, 1, 0]) =>
    b.lathe(o, { at, axis: ax, segments: seg, color: c, bone: root });

  // stand
  lathe([[0, 0], [0.42, 0], [0.42, 0.06], [0.38, 0.09], [0, 0.09]], [0, 0, 0], stone, 8);
  lathe([[0, 0.09], [0.3, 0.09], [0.28, 0.13], [0, 0.13]], [0, 0, 0], stone, 8);
  lathe([[0.27, 0.12], [0.31, 0.12], [0.31, 0.135], [0.27, 0.135]], [0, 0, 0], GOLD, 16);
  for (let k = 0; k < 6; k++) {
    const a = k * 60 * Math.PI / 180;
    glow(P(new THREE.ConeGeometry(0.03, 0.14 + R() * 0.08, 5), ICE, [Math.sin(a) * 0.34, 0.14, Math.cos(a) * 0.34], { flat: true }), 1.2);
  }
  lathe([[0, 0.13], [0.07, 0.13], [0.05, 0.2], [0.04, 0.22], [0, 0.22]], [0, 0, 0], GOLD_D, 8);

  // haft
  b.rod([0, 0.2, 0], [0, 1.5, 0], 0.03, { sides: 8, color: wood, bone: root, caps: "flat", name: "haft" });
  // wrapped grip
  const wrap = paint((p) => (((p.y * 30 + Math.atan2(p.z, p.x) / 6.28) % 1 + 1) % 1 < 0.35 ? "#e8b84a" : "#2a3f7a"));
  b.rod([0, 0.45, 0], [0, 0.95, 0], 0.037, { sides: 8, color: wrap, bone: root, caps: "flat", name: "grip" });
  for (const y of [0.45, 0.95, 1.1]) lathe([[0.03, 0], [0.052, 0], [0.052, 0.025], [0.03, 0.025]], [0, y, 0], GOLD, 8);
  // pommel spike
  lathe([[0, 0], [0.05, 0.01], [0.04, 0.05], [0, 0.1]], [0, 0.17, 0], GOLD, 8, [0, -1, 0]);
  lathe([[0, 0.2], [0.05, 0.2], [0.065, 0.24], [0.04, 0.3], [0, 0.3]], [0, 0, 0], GOLD_D, 8);

  // head hub
  const HY = 1.38;
  lathe([[0, -0.1], [0.07, -0.08], [0.085, -0.04], [0.085, 0.04], [0.07, 0.08], [0, 0.1]], [0, HY, 0], NAVY, 10);
  lathe([[0.06, 0.1], [0.095, 0.1], [0.095, 0.125], [0.06, 0.125]], [0, HY, 0], GOLD, 10);
  lathe([[0.06, -0.125], [0.095, -0.125], [0.095, -0.1], [0.06, -0.1]], [0, HY, 0], GOLD, 10);
  // top spike
  lathe([[0, 0], [0.045, 0], [0.03, 0.1], [0, 0.26]], [0, HY + 0.125, 0], steel, 6);
  glow(P(new THREE.OctahedronGeometry(0.03, 0), ICE, [0, HY + 0.125, 0], { scale: [1, 1.4, 1], flat: true }), 1.5);

  // blades (mirror)
  const blade: OutlinePoint[] = [
    [0, -0.12], [0.1, -0.2], [0.2, -0.36], [0.3, -0.4, "sharp"], [0.34, -0.2],
    [0.37, 0.0, "sharp"], [0.34, 0.2], [0.3, 0.4, "sharp"], [0.2, 0.36], [0.1, 0.2], [0, 0.12],
  ];
  const inner: OutlinePoint[] = [[0.1, -0.05], [0.2, -0.14], [0.26, 0], [0.2, 0.14], [0.1, 0.05]];
  for (const s of [1, -1]) {
    b.extrude(blade, { at: [0, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.012, smoothing: 1, color: steel, bone: root, name: "blade" });
    b.extrude(inner, { at: [s * 0.0, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.062, bevel: 0.006, color: NAVY, bone: root, name: "bladeInlay" });
    for (const f of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.07, 0.14), "#ffffff", {
          bone: root, at: [s * 0.19, HY, f * 0.0325], dir: [0, 0, f], axis: "z", texture: RUNE,
        }),
        1.5,
      );
      // blade edge gleam
      b.rod([s * 0.37, HY - 0.15, 0], [s * 0.37, HY + 0.15, 0], 0.012, { sides: 4, color: "#ffffff", bone: root, name: "edge" });
    }
    // frost spikes along back of blade
    for (let k = 0; k < 3; k++) {
      glow(P(new THREE.ConeGeometry(0.018, 0.08, 4), ICE, [s * (0.12 + k * 0.08), HY + 0.18 - k * 0.0, 0.0], { rotation: [0, 0, -s * 60], flat: true }), 1.2);
    }
    // fur trim hanging from hub
  }
  // emblem on hub both faces
  for (const f of [1, -1])
    b.part(new THREE.CircleGeometry(0.06, 14), "#ffffff", { bone: root, at: [0, HY, f * 0.087], dir: [0, 0, f], axis: "z", texture: EMBLEM });

  // fur and tassel
  const fur = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return b.frameAt ? null : null, a;
  });
  void fur;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    P(new THREE.ConeGeometry(0.028, 0.12 + R() * 0.04, 5), FUR, [Math.sin(a) * 0.05, 1.07, Math.cos(a) * 0.05], { rotation: [180, 0, 0], flat: true });
  }
  b.sweep(catmull([[0.05, 1.1, 0.0], [0.1, 1.0, 0.02], [0.12, 0.88, 0.03], [0.1, 0.74, 0.03]]), [0.012, 0.006], { color: "#c93a3a", sides: 5, bone: root, name: "cord" });
  P(new THREE.SphereGeometry(0.022, 6, 5), GOLD, [0.1, 0.74, 0.03]);
  b.spike([0.1, 0.73, 0.03], [0, -1, 0], 0.12, 0.022, { color: "#c93a3a", sides: 6, bone: root, name: "tassel" });
  P(new THREE.PlaneGeometry(0.1, 0.15), "#ffffff", [0, 0, 0], { visible: false } as any);

  return b.root;
}
```