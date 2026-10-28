```ts
import * as THREE from "three";
import { createBuilder, rng, noise, catmull, polyline } from "agentic-3js-builder";
import { cellPaint, pixelArt } from "agentic-3js-builder/kits/pixel";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Koala on Eucalyptus Branch Stand",
  description: "Pixel-art koala sitting on a eucalyptus branch stand, gripping the branch with its claws, with blue-green leaf cards.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(11);

  // ---------- palette & paints ----------
  const GREYS = ["#4a4f5c", "#656b79", "#838995", "#a2a7b1"];
  const pickRamp = <T,>(r: T[], v: number) => r[Math.max(0, Math.min(r.length - 1, Math.round(v * (r.length - 1))))];
  const FUR = cellPaint(
    0.024,
    (c) => {
      const v = 0.45 + 0.28 * c.n.y + 0.7 * (noise(c.at, 0.09, 3) - 0.5) + 0.12 * (c.random(2) - 0.5);
      const belly = c.n.z > 0.35 && c.at.y > 0.52 && c.at.y < 0.92 && Math.abs(c.at.x) < 0.17;
      if (belly) return c.random(5) > 0.8 ? "#cfc9bd" : "#e6e1d4";
      return pickRamp(GREYS, v);
    },
    { dither: true },
  );
  const LIMB = cellPaint(0.022, (c) => pickRamp(GREYS, 0.4 + 0.25 * c.n.y + 0.5 * (noise(c.at, 0.08, 4) - 0.5)), { dither: true });
  const BARK = cellPaint(
    0.02,
    (c) => pickRamp(["#4a3b34", "#65544a", "#85756a", "#a39382"], 0.4 + 0.2 * c.n.y + 0.5 * (noise(c.at, 0.05, 7) - 0.5) + 0.25 * (c.random(1) - 0.5)),
    { dither: true },
  );
  const WOOD = cellPaint(0.02, (c) => (c.v % 4 === 0 && c.axis === 1 ? "#5b3d22" : pickRamp(["#6e4a2a", "#865c36", "#9c7044"], c.random(3))), { dither: false });
  const CREAM = "#ece6d6";
  const DARK = "#17131c";
  const CLAW = "#cfc7b4";

  // ---------- textures ----------
  const EYE = pixelArt([".kk.", "kwkk", "kkkk", ".kk."], { k: DARK, w: "#ffffff" });
  const SHINE = pixelArt(["hh", "h."], { h: "#8d8a99" });
  const LEAF = svg(
    `<svg viewBox="0 0 32 96"><path d="M16 94 C2 70 2 30 16 2 C30 30 30 70 16 94Z" fill="#6f9f8a"/><path d="M16 94 C2 70 2 30 16 2 L16 94Z" fill="#4f8070"/><path d="M16 92 L16 10" stroke="#b6d6c0" stroke-width="2.5"/><path d="M16 60 L8 46 M16 60 L24 46 M16 40 L10 30 M16 40 L22 30" stroke="#a5cbb4" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const LEAF2 = svg(
    `<svg viewBox="0 0 32 96"><path d="M16 94 C4 72 4 30 16 2 C28 30 28 72 16 94Z" fill="#8bb59a"/><path d="M16 94 C4 72 4 30 16 2 L16 94Z" fill="#628f7c"/><path d="M16 92 L16 10" stroke="#cfe6d2" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  const TUFT = svg(`<svg viewBox="0 0 32 48"><path d="M2 46 L8 6 L14 34 L18 2 L22 34 L30 10 L30 46Z" fill="#e8e8e8" stroke="#9a9a9a" stroke-width="1.5"/></svg>`, { size: 64 });
  const PLAQUE = svg(
    `<svg viewBox="0 0 120 32"><rect width="120" height="32" fill="#2a1d12"/><rect x="2" y="2" width="116" height="28" fill="none" stroke="#d9a845" stroke-width="2"/><text x="60" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#f0c862">KOALA</text></svg>`,
    { size: 256 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.5, -0.05], role: "spine" });
  const spinePath = polyline([[0, 0.5, -0.05], [0, 0.7, -0.03], [0, 0.88, 0.02]]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.tip!;
  const head = b.joint("head", { parent: chest, at: [0, 0.93, 0.04], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.97, 0.1], aim: [0, 0.97, 0.25], role: "jaw" });

  const ball = (r: number[], col: any, at: number[], bone: any, name?: string) =>
    b.part(new THREE.SphereGeometry(1, 8, 6), col, { at, bone, scale: r, flat: true, name });
  const box = (s: number[], col: any, at: number[], bone: any, name?: string) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { at, bone, name });

  // ---------- body ----------
  b.sweep(spine, [0.17, 0.21, 0.17], { color: FUR, sides: 8, smooth: false });
  const rump = ball([0.19, 0.13, 0.17], FUR, [0, 0.44, -0.1], hips, "rump");
  ball([0.07, 0.06, 0.05], "#c9c5bd", [0, 0.42, -0.27], hips, "tail");
  const torsoSkin = b.surface(b.root);
  void torsoSkin;
  // chest fur tufts
  const chestHits = b
    .surface(spine.tip ? b.surface(b.root) : b.root)
    .scatter(0, {});
  void chestHits;

  // ---------- head ----------
  const skull = ball([0.2, 0.155, 0.16], FUR, [0, 1.04, 0.07], head, "skull");
  const cheeks = [1, -1].map((s) => ball([0.07, 0.07, 0.07], "#bfc2c9", [s * 0.13, 0.99, 0.15], head, "cheek"));
  void cheeks;
  const nose = box([0.1, 0.13, 0.07], DARK, [0, 1.04, 0.225], head, "nose");
  b.decal(nose, SHINE, { at: [-0.02, 1.085, 0.262], dir: [0, 0, 1], size: [0.035, 0.035], mirror: false });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: [s * 0.095, 1.1, 0.2], dir: [s * 0.25, 0, 1], size: [0.05, 0.05] });
    // ear
    const ear = ball([0.1, 0.1, 0.05], FUR, [s * 0.2, 1.15, 0.02], head, "ear");
    ball([0.065, 0.07, 0.03], CREAM, [s * 0.2, 1.15, 0.05], head, "earInner");
    const hits = b.surface(ear).scatter(7, { rng: R, minDist: 0.04, filter: (h) => h.n.z > -0.2 });
    b.cards(hits, TUFT, { size: [0.045, 0.06], lean: 50, flow: [s * 0.5, 0.3, 0.2], color: "#e4e0d6" });
  }
  box([0.14, 0.04, 0.13], CREAM, [0, 0.93, 0.15], jaw, "lowerJaw");
  box([0.05, 0.02, 0.03], "#d98a98", [0, 0.935, 0.2], jaw, "tongue");
  // brow tufts
  for (const s of [1, -1]) box([0.07, 0.02, 0.03], "#3c404b", [s * 0.095, 1.145, 0.19], head, "brow");

  // chest ruff cards
  const bodySkin = b.surface(rump);
  b.cards(bodySkin.scatter(8, { rng: R, minDist: 0.05, filter: (h) => h.n.y < 0.5 }), TUFT, { size: [0.05, 0.07], lean: 60, color: "#d8d4c8" });

  // ---------- limbs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      polyline([[s * 0.2, 0.85, 0.03], [s * 0.27, 0.64, 0.14], [s * 0.07, 0.45, 0.3]]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(arm, [0.075, 0.065, 0.05], { color: LIMB, sides: 8, smooth: false });
    const hand = arm.tip!;
    box([0.09, 0.06, 0.1], "#5e6370", [s * 0.065, 0.44, 0.3], hand, "palm");
    for (let i = 0; i < 3; i++) {
      const z = 0.265 + i * 0.037;
      box([0.03, 0.06, 0.028], "#4a4f5c", [s * 0.035, 0.405, z], hand, "finger");
      box([0.016, 0.03, 0.02], CLAW, [s * 0.025, 0.365, z], hand, "claw");
    }
    const leg = b.chain(
      `leg${S}`,
      polyline([[s * 0.15, 0.5, -0.05], [s * 0.28, 0.5, 0.1], [s * 0.1, 0.43, 0.15]]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `foot${S}`], role: "leg" },
    );
    b.sweep(leg, [0.095, 0.075, 0.05], { color: LIMB, sides: 8, smooth: false });
    const foot = leg.tip!;
    box([0.09, 0.05, 0.1], "#5e6370", [s * 0.09, 0.42, 0.17], foot, "sole");
    for (let i = 0; i < 3; i++) box([0.018, 0.02, 0.03], CLAW, [s * (0.06 + i * 0.03), 0.41, 0.235], foot, "toeClaw");
  }

  // ---------- stand ----------
  const base = b.part(new THREE.CylinderGeometry(0.62, 0.66, 0.07, 8), WOOD, { at: [0, 0.035, 0], bone: hips, name: "base" });
  void base;
  b.part(new THREE.CylinderGeometry(0.56, 0.6, 0.015, 8), "#4a321c", { at: [0, 0.075, 0], bone: hips, name: "baseTrim" });
  b.part(new THREE.PlaneGeometry(0.26, 0.07), "#ffffff", { at: [0, 0.087, 0.56], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: PLAQUE, bone: hips });
  const trunk = b.sweep(polyline([[0, 0.06, -0.45], [0, 0.8, -0.46], [0, 1.45, -0.42]]), [0.065, 0.05, 0.035], { color: BARK, sides: 6, bone: hips, smooth: false });
  const branch = b.sweep(polyline([[0, 0.34, -0.45], [0, 0.345, 0], [0, 0.37, 0.52]]), [0.05, 0.042, 0.035], { color: BARK, sides: 6, bone: hips, smooth: false });
  b.rod([0, 0.06, 0.42], [0, 0.34, 0.42], 0.03, BARK, { bone: hips, sides: 6 });
  const twigA = b.sweep(polyline([[0, 1.0, -0.45], [0.2, 1.25, -0.4], [0.42, 1.5, -0.3]]), [0.03, 0.012], { color: BARK, sides: 6, bone: hips });
  const twigB = b.sweep(polyline([[0, 1.15, -0.44], [-0.2, 1.3, -0.4], [-0.38, 1.55, -0.34]]), [0.028, 0.01], { color: BARK, sides: 6, bone: hips });
  const twigC = b.sweep(polyline([[0, 0.36, 0.5], [0.12, 0.5, 0.58], [0.22, 0.66, 0.6]]), [0.02, 0.008], { color: BARK, sides: 6, bone: hips });

  // leaves
  const leafOn = (target: any, n: number, size: number[], seed: number, minDist: number) => {
    const hits = b.surface(target).scatter(n, { rng: rng(seed), minDist, filter: (h) => h.n.y > -0.4 });
    b.cards(hits, [LEAF, LEAF2, LEAF], { size, lean: 55, bend: 25, vary: 0.3, spin: 40, rng: rng(seed + 1), cross: false, flow: [0, -0.4, 0.6] });
  };
  leafOn(twigA, 22, [0.1, 0.24], 21, 0.05);
  leafOn(twigB, 22, [0.1, 0.24], 22, 0.05);
  leafOn(twigC, 10, [0.08, 0.2], 23, 0.04);
  leafOn(trunk, 10, [0.09, 0.2], 24, 0.1);
  leafOn(branch, 6, [0.08, 0.18], 25, 0.12);
  // gum nuts
  for (const p of [[0.3, 1.38, -0.33], [-0.28, 1.43, -0.37], [0.18, 0.6, 0.6]]) ball([0.025, 0.025, 0.025], "#7b6a4a", p, hips, "gumnut");

  return b.root;
}
```