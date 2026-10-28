import * as THREE from "three";
import { createBuilder, rng, catmull, noise, mix, smoothstep } from "../../../../src/index";
import { cellPaint, pick, snapColor } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description: "A chunky pixel-art koala sitting on a eucalyptus branch stand, arms and feet gripping the wood, with big fluffy ears, a huge nose and hanging gum leaves.",
};

const FUR = ["#4a4d58", "#646876", "#80848f", "#9fa3ac", "#bfc2c8"].map((c) => snapColor(c, 32));
const CREAM = ["#a9a28f", "#d4ceb9", "#efe9d6"].map((c) => snapColor(c, 32));
const BARK = ["#3a2a20", "#5b4132", "#7d5e48", "#a0826a"];
const LEAF = ["#2c4a3a", "#3f6a52", "#5f8f70", "#8db69a"];
const NOSE = "#16131a";
const PINK = "#d99aa6";
const CLAW = "#2a2328";

const T = 0.02;
const fur = cellPaint(T, (c) => c.pick(FUR, 0.42 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.09, 3) - 0.5) + 0.12 * (c.random(1) - 0.5)), { dither: true });
const cream = cellPaint(T, (c) => c.pick(CREAM, 0.55 + 0.6 * (noise(c.at, 0.07, 5) - 0.5) + 0.25 * (c.random(2) - 0.5)), { dither: true });
const bark = cellPaint(0.016, (c) => c.pick(BARK, 0.35 + 0.5 * (noise(c.at, 0.1, 8) - 0.5) + 0.35 * (c.random(4) - 0.4) + 0.2 * c.n.y), { dither: true });
const leafP = cellPaint(0.012, (c) => c.pick(LEAF, 0.3 + 0.5 * c.random(7) + 0.2 * c.n.y));

export default function build() {
  const b = createBuilder({ name: "koala", paintSize: 2048 });
  const r = rng(5);

  const root = b.joint("stand", { at: [0, 0.02, 0], dir: [0, 1, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.5, -0.02], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.72, 0.0], dir: [0, 1, 0.1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.84, 0.03], dir: [0, 1, 0.2], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.9, 0.03], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.86, 0.1], aim: [0, 0.85, 0.2], role: "jaw" });

  const box = (w: number, h: number, d: number, col: any, at: number[], bone: any, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at, bone, name });

  // ---- stand
  b.part(new THREE.CylinderGeometry(0.3, 0.33, 0.06, 8), bark, { at: [0, 0.03, -0.1], bone: root, name: "base" });
  b.part(new THREE.CylinderGeometry(0.22, 0.25, 0.03, 8), bark, { at: [0, 0.075, -0.1], bone: root, name: "base2" });
  b.rod([0, 0.06, -0.4], [0, 0.44, -0.4], [0.085, 0.07], { bone: root, color: bark, section: { ngon: 6 }, name: "post" });
  const branch = catmull([[0, 0.42, -0.42], [0, 0.42, -0.1], [0, 0.43, 0.3], [0, 0.52, 0.65]]);
  b.sweep(branch, [0.065, 0.045], { bone: root, color: bark, section: { ngon: 6 }, name: "branch" });
  // knots
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), bark, { at: [0.06, 0.45, 0.5], bone: root });
  b.part(new THREE.BoxGeometry(0.04, 0.04, 0.04), bark, { at: [-0.05, 0.4, -0.3], bone: root });

  // leaves
  const leafOutline: [number, number][] = [[0, 0], [0.04, 0.025], [0.12, 0.035], [0.2, 0.012], [0.24, 0, ], [0.2, -0.02], [0.12, -0.035], [0.04, -0.025]];
  const leaf = (at: number[], ang: number, scale: number, drop = true) => {
    const a = ang;
    b.extrude(leafOutline.map(([x, y]) => [x * scale, y * scale] as [number, number]), {
      at,
      x: drop ? [Math.sin(a) * 0.35, -1, Math.cos(a) * 0.35] : [Math.cos(a), 0, Math.sin(a)],
      y: drop ? [Math.cos(a), 0, -Math.sin(a)] : [0, 1, 0],
      thickness: 0.008,
      color: leafP,
      bone: root,
      name: "leaf",
    });
  };
  for (let i = 0; i < 16; i++) {
    const t = 0.55 + 0.45 * (i / 15);
    const p = branch.at(t);
    const side = i % 2 ? 1 : -1;
    leaf([p.x + side * 0.05, p.y + 0.02, p.z], side * (1.2 + r() * 0.6) + (i % 3) * 0.4, 1 + r() * 0.5);
  }
  for (let i = 0; i < 6; i++) {
    const p = branch.at(0.03 + i * 0.06);
    leaf([p.x, p.y + 0.06, p.z], i * 1.1, 1.2, false);
  }
  b.rod([0, 0.44, -0.4], [0.3, 0.7, -0.45], 0.014, { bone: root, color: bark, section: { ngon: 4 }, name: "twig" });
  for (let i = 0; i < 6; i++) leaf([0.12 + i * 0.035, 0.52 + i * 0.03, -0.42], 0.6 + i * 0.7, 1.2);

  // ---- torso
  box(0.34, 0.2, 0.28, fur, [0, 0.52, -0.03], hips, "pelvis");
  box(0.38, 0.34, 0.3, fur, [0, 0.7, 0], chest, "torso");
  box(0.26, 0.3, 0.05, cream, [0, 0.68, 0.16], chest, "belly");
  box(0.3, 0.1, 0.24, fur, [0, 0.86, 0.02], neck, "neck");

  // ---- head
  box(0.4, 0.3, 0.3, fur, [0, 1.0, 0.03], head, "skull");
  box(0.3, 0.07, 0.1, fur, [0, 1.17, 0.08], head, "crown");
  box(0.2, 0.14, 0.06, cream, [0, 0.92, 0.18], head, "muzzle");
  box(0.1, 0.13, 0.08, NOSE, [0, 1.0, 0.2], head, "nose");
  box(0.12, 0.025, 0.02, "#4e4a57", [0, 1.065, 0.245], head, "noseTop");
  box(0.03, 0.03, 0.01, "#6c6878", [-0.02, 1.04, 0.245], head, "noseShine");
  box(0.2, 0.06, 0.2, cream, [0, 0.855, 0.12], jaw, "lowerJaw");
  box(0.08, 0.025, 0.04, PINK, [0, 0.895, 0.17], jaw, "tongue");
  for (const s of [1, -1]) {
    // eyes
    box(0.055, 0.055, 0.03, NOSE, [s * 0.11, 1.06, 0.185], head, "eye");
    box(0.02, 0.02, 0.012, "#ffffff", [s * 0.1, 1.075, 0.205], head, "eyeShine");
    // cheek tufts
    box(0.08, 0.1, 0.08, cream, [s * 0.2, 0.93, 0.08], head, "cheek");
    box(0.06, 0.07, 0.06, cream, [s * 0.23, 0.87, 0.04], head, "cheek2");
    // ears
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: [s * 0.18, 1.12, 0.0], dir: [s * 0.5, 1, 0], role: "hinge" });
    box(0.2, 0.2, 0.05, fur, [s * 0.22, 1.2, -0.01], ear, "ear");
    box(0.24, 0.12, 0.045, fur, [s * 0.22, 1.2, -0.012], ear, "earW");
    box(0.14, 0.14, 0.03, cream, [s * 0.22, 1.2, 0.02], ear, "earIn");
    box(0.08, 0.08, 0.035, "#e8e0cc", [s * 0.22, 1.2, 0.04], ear, "earFluff");
    box(0.06, 0.08, 0.035, "#e8e0cc", [s * 0.25, 1.28, 0.03], ear, "earFluff2");
  }

  // ---- arms, hugging the branch
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${k}`, [[s * 0.22, 0.8, 0.04], [s * 0.26, 0.6, 0.2], [s * 0.08, 0.5, 0.3]], {
      parent: chest, role: "arm", names: [`shoulder${k}`, `elbow${k}`, `hand${k}`],
    });
    b.sweep(arm, [0.075, 0.06, 0.05], { color: fur, section: "box", name: `arm${k}` });
    const hand = arm.tip!;
    box(0.09, 0.07, 0.1, fur, [s * 0.075, 0.5, 0.3], hand, "palm");
    for (let i = 0; i < 3; i++) {
      box(0.022, 0.07, 0.022, CLAW, [s * (0.035 + i * 0.03), 0.43, 0.3 + (i - 1) * 0.03], hand, "finger");
    }
    box(0.04, 0.04, 0.04, cream, [s * 0.27, 0.62, 0.24], arm.joints[1], "elbowPatch");
  }
  // ---- legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${k}`, [[s * 0.15, 0.52, -0.02], [s * 0.24, 0.5, 0.16], [s * 0.1, 0.43, 0.12]], {
      parent: hips, role: "leg", names: [`hip${k}`, `knee${k}`, `foot${k}`], contact: [s * 0.1, 0, 0.12],
    });
    b.sweep(leg, [0.1, 0.08, 0.055], { color: fur, section: "box", name: `leg${k}` });
    const foot = leg.tip!;
    box(0.09, 0.06, 0.12, "#4f4f5a", [s * 0.1, 0.43, 0.14], foot, "sole");
    for (let i = 0; i < 3; i++) box(0.02, 0.025, 0.04, CLAW, [s * (0.07 + i * 0.027), 0.42, 0.21], foot, "toe");
  }
  box(0.14, 0.1, 0.1, cream, [0, 0.46, -0.16], hips, "rump");

  return b.root;
}
