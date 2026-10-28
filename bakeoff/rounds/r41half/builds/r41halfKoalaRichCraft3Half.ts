import * as THREE from "three";
import { createBuilder, rng, limb, offset } from "../../../../src/index";
import { cellPaint, pixelArt, pixelTexture, pick, tileBox } from "../../../../kits/pixel";

export const meta = { name: "Pixel koala on eucalyptus stand", description: "Pixel-art koala hugging a eucalyptus trunk mounted on a wooden stand." };

const T = 0.02;
const FUR = ["#4b4f5a", "#6a6f7c", "#8a8f9a", "#a9adb6"];
const CREAM = ["#d9d4c4", "#efe9d8", "#fbf6e8"];
const BARK = ["#6b5a48", "#8a7a64", "#a69580", "#bfb09a"];
const WOOD = ["#4a2f1a", "#63421f", "#7c5629"];
const DARK = "#17151c";

const fur = cellPaint(T, (c) => c.pick(FUR, 0.3 + 0.5 * noiseish(c.u, c.v, c.depth) + 0.2 * c.n.y), { dither: true });
const belly = cellPaint(T, (c) => c.pick(CREAM, 0.3 + 0.6 * noiseish(c.u, c.v, c.depth)), { dither: true });
const bark = cellPaint(T, (c) => c.pick(BARK, 0.15 + 0.7 * noiseish(c.u, 0, c.depth) + 0.15 * c.random(2)), { dither: true });
const wood = cellPaint(T, (c) => pick(WOOD, (c.v % 3) / 3 + 0.15 * c.random(1)));
const bodyPaint = cellPaint(T, (c) => (c.n.z > 0.35 && c.at.y < 0.78 ? c.pick(CREAM, 0.4 + 0.5 * c.random(4)) : c.pick(FUR, 0.3 + 0.5 * noiseish(c.u, c.v, c.depth) + 0.2 * c.n.y)), { dither: true });

function noiseish(a: number, b: number, c: number) {
  const h = Math.sin(a * 12.9898 + b * 78.233 + c * 37.7) * 43758.5453;
  return h - Math.floor(h);
}

const LEAF = pixelArt(
  [
    "...gg...",
    "..gGGg..",
    ".gGGhGg.",
    ".gGhGGg.",
    "gGGhGGGg",
    "gGGhGGGg",
    ".gGhGGg.",
    "..gghg..",
    "....h...",
  ],
  { g: "#2f6a4a", G: "#4c9a6a", h: "#8fcf9a" },
);
const EYE = pixelArt(["kkk", "kwk", "kkk"], { k: DARK, w: "#ffffff" });
const SIGN = pixelTexture(16, 8, (g) => {
  g.fill(() => "#d8b878");
  g.fill((x, y) => (x === 0 || y === 0 || x === 15 || y === 7 ? "#63421f" : undefined));
  g.stamp(3, 2, ["k.k.kkk", "kk..k.k", "k.k.kkk"], { k: "#3a2a14" });
});

export default function build() {
  const b = createBuilder({ name: "koala" });
  const hips = b.joint("hips", { at: [0, 0.4, 0.17], role: "spine" });

  // Stand
  b.part(tileBox([0.6, 0.06, 0.6], pixelTexture(32, 32, (g) => g.fill((x, y) => WOOD[(y >> 2) % 3])), T), "#ffffff", {
    bone: hips, at: [0, 0.03, 0.05],
    texture: pixelTexture(32, 32, (g) => g.fill((x, y) => WOOD[(y >> 2) % 3])),
  });
  b.part(new THREE.BoxGeometry(0.5, 0.04, 0.5), wood, { bone: hips, at: [0, 0.08, 0.05] });
  b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", { bone: hips, at: [0, 0.04, 0.355], dir: [0, 0, 1], axis: "z", texture: SIGN });

  // Trunk
  b.sweep([[0, 0.1, 0], [0, 1.45, 0]], 0.065, { bone: hips, color: bark, section: { ngon: 6 }, caps: "flat" });
  const branches: THREE.Vector3[][] = [];
  const r = rng(5);
  const leafFrames: any[] = [];
  for (const [s, y, h] of [[1, 1.05, 0.28], [-1, 1.2, 0.3]] as const) {
    const tip = [s * 0.4, y + h, -0.05];
    const sw = b.sweep([[s * 0.04, y, 0], [s * 0.2, y + h * 0.5, -0.02], tip], [0.03, 0.012], { bone: hips, color: bark, section: { ngon: 5 } });
    b.along(sw, 4, (at) => { leafFrames.push(at); });
    b.sweep([[0, 1.4, 0], [s * 0.08, 1.52, 0.03]], [0.025, 0.01], { bone: hips, color: bark, section: { ngon: 5 } });
    leafFrames.push(b.along(b.sweep([[0, 1.42, 0], [s * 0.1, 1.55, 0]], 0.008, { bone: hips, color: bark }), 2, () => {})[0]);
  }
  b.cards(leafFrames, LEAF, { size: [0.12, 0.14], lean: 55, bend: 20, vary: 0.25, spin: 40, rng: r, cross: true, flow: [0, -0.3, 1] });

  // Skeleton
  const spine = b.chain("spine", [[0, 0.4, 0.17], [0, 0.62, 0.19], [0, 0.78, 0.2]], {
    parent: hips, names: ["spine1", "spine2", "neckBase"], role: "spine",
  });
  const neck = spine.tip!;
  b.sweep(spine, (t) => [0.15 - 0.02 * t, 0.15], { color: bodyPaint, section: "box", caps: "flat" });
  b.part(new THREE.BoxGeometry(0.34, 0.16, 0.26), fur, { bone: hips, at: [0, 0.33, 0.14] }); // rump

  const head = b.joint("head", { parent: neck, at: [0, 0.8, 0.2], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.8, 0.27], aim: [0, 0.8, 0.37], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.34, 0.26, 0.26), fur, { bone: head, at: [0, 0.92, 0.22] });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.1), belly, { bone: head, at: [0, 0.86, 0.33] }); // muzzle
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.06), DARK, { bone: head, at: [0, 0.92, 0.39] }); // big nose
  b.part(new THREE.BoxGeometry(0.16, 0.04, 0.12), belly, { bone: jaw, at: [0, 0.785, 0.31] });
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.04), "#c9707a", { bone: jaw, at: [0, 0.808, 0.35] });
  for (const s of [1, -1]) {
    const e = b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", { bone: head, at: [s * 0.085, 0.97, 0.354], dir: [0, 0, 1], axis: "z", texture: EYE });
    void e;
    b.part(new THREE.BoxGeometry(0.15, 0.15, 0.06), fur, { bone: head, at: [s * 0.2, 1.04, 0.2] });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.05), belly, { bone: head, at: [s * 0.2, 1.04, 0.235] });
    b.part(new THREE.BoxGeometry(0.06, 0.12, 0.06), belly, { bone: head, at: [s * 0.18, 0.85, 0.3] }); // cheek fluff
  }

  // Limbs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.15, 0.68, 0.2];
    const hand: [number, number, number] = [s * 0.085, 0.66, 0.0];
    const arm = b.chain(`arm${L}`, limb(sh, hand, [0.13, 0.12], [[s, 0, 0.3]]), {
      parent: spine.joints[1], names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm",
    });
    b.sweep(arm, [0.055, 0.045], { color: fur, section: "box" });
    const hb = arm.tip!;
    b.part(new THREE.BoxGeometry(0.07, 0.07, 0.07), DARK, { bone: hb, at: [s * 0.085, 0.66, -0.01] });
    for (const dy of [-0.025, 0, 0.025])
      b.part(new THREE.BoxGeometry(0.02, 0.02, 0.05), "#e8e2d0", { bone: hb, at: [s * 0.05, 0.66 + dy, -0.04] });

    const hp: [number, number, number] = [s * 0.12, 0.4, 0.17];
    const foot: [number, number, number] = [s * 0.09, 0.28, 0.01];
    const leg = b.chain(`leg${L}`, limb(hp, foot, [0.2, 0.2], [[s, 0, 1]]), {
      parent: hips, names: [`hip${L}`, `knee${L}`, `foot${L}`], role: "leg",
    });
    b.sweep(leg, [0.075, 0.05], { color: fur, section: "box" });
    b.part(new THREE.BoxGeometry(0.08, 0.06, 0.1), DARK, { bone: leg.tip!, at: [s * 0.09, 0.28, 0.0] });
    for (const dy of [-0.025, 0.025])
      b.part(new THREE.BoxGeometry(0.02, 0.02, 0.04), "#e8e2d0", { bone: leg.tip!, at: [s * 0.06, 0.28 + dy, -0.04] });
  }

  return b.root;
}
