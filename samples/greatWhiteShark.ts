import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { paint, mix, smoothstep } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Apex Glide",
  description: "A five-metre great white in a neutral swimming pose, with polished blue-grey countershading, crisp cyan identification markings, articulated fins and jaws, and individually modelled serrated teeth.",
  style: "Overwatch",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "greatWhiteShark", detail: 1, paintSize: 2048 });
  const C = { back: "#3b637c", flank: "#87a8b8", belly: "#e6f2ed", cyan: "#29dce5", dark: "#122635", tooth: "#f4f0dc", gum: "#74515b" };
  const skin = paint((p, n) => {
    const boundary = 0.96 + 0.025 * Math.sin(p.z * 7) + 0.025 * Math.cos(p.z * 13);
    if (p.y < boundary && n.y < 0.25) return C.belly;
    return mix(C.flank, C.back, smoothstep(1.05, 1.66, p.y));
  });
  const finPaint = paint((_p, n) => n.y < -0.2 ? C.belly : mix(C.back, C.flank, Math.max(0, n.y) * 0.5));

  // All moving anatomical appendages are established before the skin.
  const core = b.joint("spineRoot", { at: [0, 1.24, 0.65], dir: [0, 0, 1], role: "spine" });
  const front = b.chain("spine", [[0, 1.24, 0.65], [0, 1.26, 1.15], [0, 1.26, 1.58]], { parent: core, names: ["chest", "neck", "head"], role: "spine" });
  const head = front.tip!;
  const rear = b.chain("tail", [[0, 1.24, 0.65], [0, 1.23, -0.1], [0, 1.22, -0.85], [0, 1.23, -1.5], [0, 1.25, -2.03]], { parent: core, names: ["lumbar", "tailBase", "tailMid", "tailPeduncle", "caudal"], role: "tail" });
  const upper = b.joint("upperJaw", { parent: head, at: [0, 1.18, 1.6], dir: [0, 0, 1], role: "jaw" });
  const lower = b.joint("lowerJaw", { parent: head, at: [0, 0.96, 1.52], dir: [0, -0.12, 1], role: "jaw" });
  const dorsalJoint = b.joint("dorsalFin", { parent: rear.joints[0], at: [0, 1.64, 0.15], dir: [0, 1, -0.3], role: "fan" });
  const secondary = b.joint("secondDorsal", { parent: rear.joints[2], at: [0, 1.48, -1.22], dir: [0, 1, -0.2], role: "fan" });
  const anal = b.joint("analFin", { parent: rear.joints[2], at: [0, 0.97, -1.3], dir: [0, -1, -0.2], role: "fan" });
  const caudalTop = b.joint("caudalUpper", { parent: rear.tip!, at: rear.at(1), dir: [0, 1, -0.5], role: "fan" });
  const caudalBottom = b.joint("caudalLower", { parent: rear.tip!, at: rear.at(1), dir: [0, -1, -0.5], role: "fan" });
  const fins = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    return {
      s, side,
      pectoral: b.joint(`pectoral${side}`, { parent: core, at: [s * 0.36, 0.98, 0.65], dir: [s, -0.28, -0.5], role: "fan" }),
      pelvic: b.joint(`pelvic${side}`, { parent: rear.joints[1], at: [s * 0.22, 0.94, -0.83], dir: [s, -0.2, -0.4], role: "fan" }),
    };
  });

  const body = b.loft([
    { at: [0, 1.25, -2.1], w: 0.11, h: 0.19 },
    { at: [0, 1.24, -1.7], w: 0.20, h: 0.32 },
    { at: [0, 1.22, -1.18], w: 0.42, h: 0.57 },
    { at: [0, 1.22, -0.6], w: 0.73, h: 0.87 },
    { at: [0, 1.24, 0.05], w: 0.99, h: 1.05 },
    { at: [0, 1.24, 0.65], w: 1.01, h: 1.05 },
    { at: [0, 1.26, 1.12], w: 0.89, h: 0.91 },
    { at: [0, 1.25, 1.57], w: 0.70, h: 0.68 },
    { at: [0, 1.27, 1.9], w: 0.47, h: 0.42 },
    { at: [0, 1.26, 2.16], w: 0.06, h: 0.11 },
  ], { color: skin, bone: [rear, core, front], sides: 12, caps: "flat", name: "torpedoBody" });
  const surface = b.surface(body);

  // Separate lower jaw leaves a readable crescent of dark oral cavity and two rows of teeth.
  const jaw = b.loft([
    { at: [0, 0.98, 1.42], w: 0.56, h: 0.24 },
    { at: [0, 0.90, 1.65], w: 0.59, h: 0.19 },
    { at: [0, 0.92, 1.9], w: 0.42, h: 0.12 },
    { at: [0, 0.95, 2.07], w: 0.10, h: 0.065 },
  ], { bone: lower, color: C.belly, sides: 10, caps: "round", name: "lowerJawSkin" });
  b.part(new THREE.SphereGeometry(1, 12, 6), "#311f2d", { bone: upper, at: [0, 1.035, 1.78], scale: [0.275, 0.09, 0.31], name: "oralCavity" });
  const mouthRim = (y: number) => catmull([[-0.29, y + 0.045, 1.51], [-0.275, y, 1.74], [-0.16, y - 0.01, 1.96], [0, y - 0.005, 2.055], [0.16, y - 0.01, 1.96], [0.275, y, 1.74], [0.29, y + 0.045, 1.51]]);
  b.sweep(mouthRim(1.085), 0.019, { bone: upper, color: C.dark, sides: 6, name: "upperLip" });
  b.sweep(mouthRim(0.984), 0.014, { bone: lower, color: C.gum, sides: 6, name: "lowerGums" });
  for (const top of [true, false]) {
    const rim = mouthRim(top ? 1.07 : 0.99);
    for (let i = 0; i < 19; i++) {
      const p = rim.at((i + 0.5) / 19);
      const height = 0.056 + 0.021 * Math.sin(Math.PI * i / 18);
      const bone = top ? upper : lower;
      const tooth = b.extrude([[-0.022, 0], [0.022, 0], [0, top ? -height : height, "sharp"]], { at: p, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.003, color: C.tooth, bone, name: `${top ? "upper" : "lower"}Tooth${i}` });
      for (const side of [-1, 1]) for (let j = 1; j < 4; j++) {
        const t = j / 5;
        b.part(new THREE.OctahedronGeometry(0.0045), C.tooth, { bone, at: tooth.local([side * 0.022 * (1 - t), (top ? -1 : 1) * height * t, 0]), name: `serration${top ? "U" : "L"}${i}_${side}_${j}` });
      }
    }
  }
  // Swept-back paired fins, thick at the shoulder and razor-clean at the tips.
  for (const f of fins) {
    const s = f.s;
    const fin = b.extrude([[0, 0], [0.38, -0.07], [1.05, -0.75, "sharp"], [0.67, -0.64], [0.06, -0.34]], {
      at: f.pectoral, x: [s, -0.25, 0], y: [0, 0, 1], thickness: 0.075, bevel: 0.028,
      color: finPaint, bone: f.pectoral, name: `pectoralSkin${f.side}`,
    });
    b.extrude([[0.19, -0.09], [0.4, -0.16], [0.85, -0.63, "sharp"], [0.62, -0.52]], {
      at: fin.local([0, 0, -s * 0.038]), x: [s, -0.25, 0], y: [0, 0, 1], thickness: 0.003, color: C.cyan, bone: f.pectoral, name: `pectoralStripe${f.side}`,
    });
    b.extrude([[0, 0], [0.25, -0.04], [0.49, -0.36, "sharp"], [0.17, -0.32], [0, -0.19]], {
      at: f.pelvic, x: [s, -0.17, 0], y: [0, 0, 1], thickness: 0.04, bevel: 0.013, color: finPaint, bone: f.pelvic, name: `pelvicSkin${f.side}`,
    });
  }
  b.extrude([[0.42, -0.03], [0.26, 0.18], [-0.08, 0.85, "sharp"], [-0.15, 0.48], [-0.30, 0.13], [-0.52, 0.01, "sharp"]], { x: [0, 0, 1], at: dorsalJoint, thickness: [0.10, 0.008], bevel: 0.025, color: finPaint, bone: dorsalJoint, name: "primaryDorsal" });
  for (const s of [-1, 1]) {
    b.extrude([[0.19, 0.16], [-0.055, 0.69, "sharp"], [-0.09, 0.50], [0.05, 0.20]], { x: [0, 0, 1], at: [s * 0.036, 1.64, 0.15], thickness: 0.005, color: C.cyan, bone: dorsalJoint, name: `dorsalStripe${s}` });
  }
  b.extrude([[0.15, 0], [0.04, 0.22, "sharp"], [-0.05, 0.08], [-0.20, 0]], { x: [0, 0, 1], at: secondary, thickness: [0.055, 0.008], bevel: 0.015, color: finPaint, bone: secondary, name: "secondaryDorsalSkin" });
  b.extrude([[0.13, 0], [-0.04, -0.22, "sharp"], [-0.21, -0.06], [-0.1, 0]], { x: [0, 0, 1], at: anal, thickness: 0.038, bevel: 0.011, color: C.belly, bone: anal, name: "analFinSkin" });
  // Heterocercal caudal fin: larger upper lobe, both swept aft, never a horizontal whale fluke.
  b.extrude([[0.07, -0.05], [-0.08, 0.20], [-0.62, 1.04, "sharp"], [-0.54, 0.59], [-0.29, 0.16], [-0.36, 0], [-0.12, -0.08]], { x: [0, 0, 1], at: caudalTop, thickness: [0.095, 0.008], bevel: 0.026, color: finPaint, bone: caudalTop, name: "caudalUpperSkin" });
  b.extrude([[0.05, 0.06], [-0.12, -0.16], [-0.53, -0.85, "sharp"], [-0.43, -0.42], [-0.27, -0.07], [-0.36, 0]], { x: [0, 0, 1], at: caudalBottom, thickness: 0.056, bevel: 0.019, color: finPaint, bone: caudalBottom, name: "caudalLowerSkin" });
  for (const s of [-1, 1]) {
    b.extrude([[-0.17, 0.20], [-0.53, 0.84, "sharp"], [-0.43, 0.55], [-0.22, 0.18]], { x: [0, 0, 1], at: [s * 0.025, 1.25, -2.03], thickness: 0.005, color: C.cyan, bone: caudalTop, name: `caudalStripe${s}` });
  }
  // Five deep gill slits and their bevel-like light lips follow the actual curved body.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const z = 1.28 - i * 0.108;
      const path = surface.drape(catmull([[s * 0.48, 1.45, z], [s * 0.56, 1.25, z - 0.04], [s * 0.48, 1.01, z - 0.09]]), { lift: 0.005 });
      b.sweep(path, [0.010, 0.016, 0.008], { color: C.dark, sides: 5, name: `gill${s}_${i}` });
      const lip = surface.drape(catmull([[s * 0.48, 1.44, z + 0.027], [s * 0.56, 1.25, z - 0.013], [s * 0.48, 1.02, z - 0.063]]), { lift: 0.006 });
      b.sweep(lip, 0.006, { color: "#b5ccd2", sides: 4, name: `gillLip${s}_${i}` });
    }
    const eyeHit = surface.nearest([s * 0.37, 1.36, 1.62]);
    const socket = b.stick(new THREE.SphereGeometry(0.074, 12, 8), C.dark, eyeHit, { scale: [1.05, 0.44, 0.82], name: `eyeSocket${s}` });
    const eye = b.stick(new THREE.SphereGeometry(0.053, 12, 8), "#08141c", eyeHit, { embed: 0, scale: [1, 0.6, 0.87], name: `eye${s}` });
    b.stick(new THREE.SphereGeometry(0.015, 6, 4), "#e2f9fc", eye.moved([0.017, 0.027, 0.014]), { name: `eyeGlint${s}` });
    b.sweep(surface.drape(catmull([[s * 0.30, 1.47, 1.72], [s * 0.40, 1.45, 1.62], [s * 0.40, 1.39, 1.48]]), { lift: 0.014 }), 0.019, { color: C.back, bone: head, sides: 6, name: `brow${s}` });
    const nostril = surface.nearest([s * 0.15, 1.23, 1.97]);
    b.stick(new THREE.SphereGeometry(0.026, 8, 5), C.dark, nostril, { scale: [1.6, 0.18, 0.52], name: `nostril${s}` });
    // Ampullae pores arranged across the snout, paired scars and a restrained lateral line.
    for (let row = 0; row < 3; row++) for (let i = 0; i < 7; i++) {
      const hit = surface.nearest([s * (0.07 + row * 0.065), 1.45 - row * 0.06, 1.80 + i * 0.038]);
      b.stick(new THREE.SphereGeometry(0.0048, 5, 3), C.back, hit, { scale: [1, 0.15, 1], name: `sensoryPore${s}_${row}_${i}` });
    }
    const lateral = surface.drape(catmull([[s * 0.48, 1.39, 0.65], [s * 0.47, 1.40, 0], [s * 0.31, 1.36, -0.8], [s * 0.11, 1.32, -1.75]]), { lift: 0.002 });
    b.sweep(lateral, 0.0035, { color: "#aac1c9", bone: rear, sides: 4, name: `lateralLine${s}` });
    void socket;
  }
  const marking = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 80"><path d="M8 8h54l-13 17H8zm0 28h40L35 53H8z" fill="#29dce5"/><path d="M75 9h4v46h-4zm9 0h4v46h-4z" fill="#d4e8ed"/><text x="101" y="45" font-family="sans-serif" font-size="34" font-weight="bold" fill="#d4e8ed">07</text><path d="M8 66h152" stroke="#d4e8ed" stroke-width="3"/></svg>`, { size: 512 });
  for (const s of [-1, 1]) b.decal(body, marking, { at: surface.nearest([s * 0.48, 1.46, 0.12]), dir: [s, 0.2, 0], size: [0.42, 0.19], mirror: s < 0, name: `surveyMark${s}` });
  // Model is explicitly swimming: the lower caudal tip clears the ground by 0.30 m.
  const root = b.root;
  const bounds = new THREE.Box3().setFromObject(root, true);
  root.position.y += 0.3 - bounds.min.y;
  void jaw;
  return root;
}
