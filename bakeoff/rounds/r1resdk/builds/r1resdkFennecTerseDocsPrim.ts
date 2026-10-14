import * as THREE from "three";
import { createBuilder, catmull, rng, countershade, gradient } from "../../../../src/index";

export const meta = { name: "Fennec Fox", description: "Small desert fox with huge ears, bushy tail, rigged rest pose." };

export default function build() {
  const b = createBuilder({ name: "fennec" });
  const SAND = "#e3b982", CREAM = "#f6e8cf", DARK = "#2a1d17", PINK = "#e8a6a0", TIP = "#4a3a30", NOSE = "#161010";
  const coat = countershade(SAND, CREAM, { level: -0.2 });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.27, -0.12], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.27, -0.12], [0, 0.29, 0.05], [0, 0.31, 0.2]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", catmull([[0, 0.31, 0.2], [0, 0.37, 0.3], [0, 0.4, 0.36]]), { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.4, 0.36], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.37, 0.4], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain("tail", catmull([[0, 0.28, -0.18], [0, 0.26, -0.4], [0, 0.2, -0.6], [0, 0.12, -0.78]]), { parent: hips, role: "tail", count: 4 });
  b.sweep(tail, (t) => 0.055 + 0.04 * Math.sin(t * 3) , { color: gradient(coat, TIP, [0, 0.15, -0.7], [0, 0.1, -0.8]) });

  // Body
  b.sweep(catmull([[0, 0.27, -0.2], [0, 0.29, 0.0], [0, 0.31, 0.22]]), (t) => [0.085 + 0.02 * Math.sin(t * 3), 0.09 + 0.015 * Math.sin(t * 3)], { bone: [hips, spine.joints[0], spine.joints[1]], color: coat, sides: 8 });
  b.sweep(neck, [0.065, 0.06], { color: coat });

  // Head
  b.part(new THREE.SphereGeometry(0.1, 10, 8), coat, { bone: head, at: [0, 0.41, 0.38], scale: [1.1, 0.9, 1] });
  b.frustumBox([0, 0.395, 0.43], [0, 0.385, 0.52], [0.09, 0.07], [0.04, 0.04], { bone: head, color: CREAM });
  b.part(new THREE.SphereGeometry(0.018, 6, 5), NOSE, { bone: head, at: [0, 0.39, 0.525] });
  // lower jaw
  b.frustumBox([0, 0.37, 0.41], [0, 0.368, 0.49], [0.06, 0.02], [0.03, 0.015], { bone: jaw, color: CREAM });

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.017, 6, 5), DARK, { bone: head, at: [s * 0.055, 0.43, 0.44] });
    b.extrude([[0, 0], [0.04, 0.012], [0.07, 0.03], [0.06, 0.036], [0.02, 0.02]], { at: [s * 0.065, 0.435, 0.435], x: [s, 0.2, 0], y: [0, 1, 0], thickness: 0.006, color: DARK, bone: head });
    // ears
    const ear = b.extrude([[-0.05, 0], [0.05, 0], [0.065, 0.12], [0.03, 0.26, "sharp"], [-0.02, 0.15]], {
      at: [s * 0.07, 0.46, 0.34], x: [s, 0, -0.25], y: [s * 0.35, 1, -0.05], thickness: 0.012, bevel: 0.003, color: SAND, bone: head,
    });
    b.extrude([[-0.03, 0.01], [0.03, 0.01], [0.04, 0.12], [0.02, 0.21], [-0.01, 0.13]], {
      at: [s * 0.07, 0.46, 0.347], x: [s, 0, -0.25], y: [s * 0.35, 1, -0.05], thickness: 0.012, color: PINK, bone: head,
    });
    void ear;

    // legs
    for (const [z, nm] of [[0.16, "F"], [-0.2, "H"]] as [number, string][]) {
      const x = s * 0.07;
      const side = s > 0 ? "L" : "R";
      const top: [number, number, number] = [x, 0.26, z];
      const mid: [number, number, number] = [x, 0.14, z + (nm === "H" ? -0.02 : 0)];
      const foot: [number, number, number] = [x, 0.025, z + 0.02];
      const leg = b.chain(`leg${nm}${side}`, [top, mid, foot], { parent: nm === "F" ? spine.joints[1] : hips, role: "leg", names: [`hip${nm}${side}`, `knee${nm}${side}`, `ankle${nm}${side}`] });
      b.sweep(leg, [0.04, 0.025], { color: coat });
      b.part(new THREE.BoxGeometry(0.05, 0.03, 0.09), DARK, { bone: leg.tip ?? leg.joints[1], at: [x, 0.015, z + 0.045] });
    }
  }

  return b.root;
}
