import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Sleepy Koala",
  description: "A drowsy ash-grey koala hugging a eucalyptus trunk, munching a sprig of leaves.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });

  const GREY = "#9a9ca0", DGREY = "#6f7176", CREAM = "#efe5cf", BLACK = "#1c1b1d";
  const BROWN = "#4a2f20", BARK = "#8a7a68", BARK2 = "#6d5f50", LEAF1 = "#6f9f8f", LEAF2 = "#4f8a78", LEAF3 = "#8fb8a0";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.32, -0.02] });
  const spine = b.joint("spine", { at: [0, 0.5, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.62, 0.04], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.74, 0.07], parent: chest });
  const head = b.joint("head", { at: [0, 0.82, 0.1], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.76, 0.14], parent: head });
  const earL = b.joint("earL", { at: [0.14, 0.92, 0.07], parent: head });
  const earR = b.joint("earR", { at: [-0.14, 0.92, 0.07], parent: head });
  const shL = b.joint("shoulderL", { at: [0.15, 0.65, 0.07], parent: chest });
  const elL = b.joint("elbowL", { at: [0.2, 0.58, 0.2], parent: shL });
  const haL = b.joint("handL", { at: [0.1, 0.72, 0.27], parent: elL });
  const shR = b.joint("shoulderR", { at: [-0.15, 0.65, 0.07], parent: chest });
  const elR = b.joint("elbowR", { at: [-0.2, 0.56, 0.2], parent: shR });
  const haR = b.joint("handR", { at: [-0.09, 0.6, 0.31], parent: elR });
  const hipL = b.joint("hipL", { at: [0.15, 0.3, 0.0], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.2, 0.26, 0.18], parent: hipL });
  const footL = b.joint("footL", { at: [0.09, 0.27, 0.3], parent: kneeL });
  const hipR = b.joint("hipR", { at: [-0.15, 0.3, 0.0], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.2, 0.26, 0.18], parent: hipR });
  const footR = b.joint("footR", { at: [-0.09, 0.27, 0.3], parent: kneeR });

  const sph = (r: number) => new THREE.SphereGeometry(r, 10, 8);
  const ball = (p: number[], r: number, col: string, bone: any, s?: number[]) =>
    b.part(sph(r), col, { at: p, bone, ...(s ? { scale: s } : {}) } as any);

  const seg = (a: number[], c: number[], r: number, col: string, bone: any) => {
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const L = Math.hypot(d[0], d[1], d[2]);
    const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    b.part(new THREE.CapsuleGeometry(r, Math.max(0.01, L - 2 * r), 4, 8), col, { at: m, dir: d, bone } as any);
  };
  const claws = (p: number[], dir: number[], bone: any, spread = 0.03) => {
    for (let i = -1; i <= 1; i++) {
      const q = [p[0] + i * spread, p[1], p[2]];
      b.part(new THREE.ConeGeometry(0.009, 0.045, 5), "#2a2628", {
        at: [q[0] + dir[0] * 0.03, q[1] + dir[1] * 0.03, q[2] + dir[2] * 0.03],
        dir, bone,
      } as any);
    }
  };

  // body
  ball([0, 0.36, -0.02], 0.21, GREY, hips, [1.05, 0.95, 1]);
  ball([0, 0.58, 0.02], 0.17, GREY, chest, [1, 1.1, 0.9]);
  ball([0, 0.57, 0.12], 0.13, CREAM, chest, [1, 1.2, 0.5]);
  ball([0, 0.43, 0.14], 0.11, CREAM, spine, [1, 1, 0.5]);
  ball([0, 0.3, -0.14], 0.1, DGREY, hips, [1.2, 0.8, 0.8]); // rump tuft
  ball([0, 0.72, 0.06], 0.1, GREY, neck);

  // head
  ball([0, 0.83, 0.1], 0.155, GREY, head, [1.12, 0.95, 1]);
  ball([0.1, 0.78, 0.17], 0.065, GREY, head, [1, 0.9, 0.9]);
  ball([-0.1, 0.78, 0.17], 0.065, GREY, head, [1, 0.9, 0.9]);
  ball([0, 0.78, 0.2], 0.07, CREAM, head, [1.1, 0.8, 0.9]);
  // cheek fluff
  for (const s of [1, -1]) {
    ball([s * 0.15, 0.78, 0.1], 0.04, CREAM, head);
    ball([s * 0.13, 0.74, 0.13], 0.035, CREAM, head);
  }
  // nose
  ball([0, 0.825, 0.252], 0.05, BLACK, head, [1.05, 1.5, 0.75]);
  ball([0.016, 0.838, 0.285], 0.008, "#3a393c", head);
  ball([-0.016, 0.838, 0.285], 0.008, "#3a393c", head);
  // lower jaw
  b.part(new THREE.BoxGeometry(0.09, 0.025, 0.08), CREAM, { at: [0, 0.742, 0.19], bone: jaw } as any);
  ball([0, 0.745, 0.232], 0.012, DGREY, jaw);
  // upper lip line
  b.part(new THREE.BoxGeometry(0.1, 0.008, 0.06), DGREY, { at: [0, 0.764, 0.2], bone: head } as any);

  // sleepy eyes
  for (const s of [1, -1]) {
    ball([s * 0.075, 0.862, 0.225], 0.024, BROWN, head, [1, 0.9, 0.6]);
    ball([s * 0.078, 0.866, 0.236], 0.008, BLACK, head);
    ball([s * 0.075, 0.876, 0.226], 0.03, DGREY, head, [1.1, 0.8, 0.8]); // heavy lid
    b.part(new THREE.BoxGeometry(0.06, 0.005, 0.01), "#55575c", { at: [s * 0.075, 0.862, 0.248], bone: head } as any);
  }

  // ears
  for (const [s, ear] of [[1, earL], [-1, earR]] as [number, any][]) {
    ball([s * 0.15, 0.93, 0.07], 0.09, GREY, ear, [1, 1, 0.55]);
    ball([s * 0.15, 0.93, 0.1], 0.07, CREAM, ear, [0.95, 0.95, 0.5]);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ball([s * 0.15 + Math.cos(a) * 0.082, 0.93 + Math.sin(a) * 0.082, 0.08], 0.025, CREAM, ear);
    }
  }

  // trunk & base
  b.part(new THREE.CylinderGeometry(0.45, 0.48, 0.04, 14), BARK2, { at: [0, 0.02, 0.15], bone: hips } as any);
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 1.25, 9), BARK, { at: [0, 0.62, 0.3], bone: hips } as any);
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(0.02, 0.18, 0.02), BARK2, { at: [Math.cos(i * 1.3) * 0.082, 0.2 + i * 0.2, 0.3 + Math.sin(i * 1.3) * 0.082], bone: hips } as any);
  }
  // seat stub
  seg([0, 0.2, 0.3], [0, 0.2, -0.08], 0.045, BARK, hips);
  // side twig at top
  seg([0, 1.05, 0.3], [0.15, 1.2, 0.3], 0.018, BARK, hips);
  seg([0, 0.95, 0.3], [-0.16, 1.1, 0.32], 0.016, BARK, hips);

  // limbs
  seg([0.15, 0.65, 0.07], [0.2, 0.58, 0.2], 0.055, GREY, shL);
  seg([0.2, 0.58, 0.2], [0.1, 0.72, 0.27], 0.045, GREY, elL);
  seg([-0.15, 0.65, 0.07], [-0.2, 0.56, 0.2], 0.055, GREY, shR);
  seg([-0.2, 0.56, 0.2], [-0.09, 0.6, 0.31], 0.045, GREY, elR);
  seg([0.15, 0.3, 0.0], [0.2, 0.26, 0.18], 0.07, GREY, hipL);
  seg([0.2, 0.26, 0.18], [0.09, 0.27, 0.3], 0.05, GREY, kneeL);
  seg([-0.15, 0.3, 0.0], [-0.2, 0.26, 0.18], 0.07, GREY, hipR);
  seg([-0.2, 0.26, 0.18], [-0.09, 0.27, 0.3], 0.05, GREY, kneeR);

  // paws
  ball([0.1, 0.72, 0.27], 0.045, DGREY, haL, [1, 1, 1.1]);
  ball([-0.09, 0.6, 0.31], 0.045, DGREY, haR, [1, 1, 1.1]);
  ball([0.09, 0.27, 0.3], 0.048, DGREY, footL, [1, 1, 1.1]);
  ball([-0.09, 0.27, 0.3], 0.048, DGREY, footR, [1, 1, 1.1]);
  // claws wrapping the trunk
  for (const [p, bone] of [
    [[-0.075, 0.6, 0.355], haR], [[0.075, 0.27, 0.355], footL], [[-0.075, 0.27, 0.355], footR],
  ] as [number[], any][]) {
    for (let i = -1; i <= 1; i++) {
      b.part(new THREE.ConeGeometry(0.009, 0.045, 5), "#2a2628", {
        at: [p[0] + 0.0, p[1] + i * 0.028, p[2] + 0.02], dir: [0.4 * Math.sign(p[0]) * -1, 0, 0.8], bone,
      } as any);
    }
  }
  claws([0.1, 0.73, 0.32], [0, 0, 1], haL);

  // eucalyptus sprig held to mouth
  const leaf = (p: number[], d: number[], len: number, col: string, bone: any) => {
    b.part(new THREE.SphereGeometry(0.5, 6, 4), col, {
      at: p, dir: d, scale: [len * 0.4, len, len * 0.1], bone,
    } as any);
  };
  seg([0.1, 0.71, 0.3], [0.025, 0.77, 0.275], 0.008, BARK, haL);
  seg([0.1, 0.71, 0.3], [0.2, 0.62, 0.34], 0.008, BARK, haL);
  const leaves: [number[], number[], number, string][] = [
    [[0.03, 0.78, 0.29], [-1, 0.5, 0.6], 0.07, LEAF1],
    [[0.04, 0.775, 0.3], [0.3, 1, 0.5], 0.07, LEAF2],
    [[0.15, 0.66, 0.32], [1, -0.2, 0.7], 0.09, LEAF3],
    [[0.2, 0.62, 0.34], [1, -1, 0.5], 0.09, LEAF1],
    [[0.17, 0.64, 0.33], [0.2, -1, 0.8], 0.08, LEAF2],
  ];
  for (const [p, d, l, c] of leaves) leaf(p, d, l, c, haL);
  // leafy crown on trunk twigs
  const crown: [number[], number[], number, string][] = [
    [[0.17, 1.22, 0.3], [1, 1, 0], 0.13, LEAF1],
    [[0.1, 1.15, 0.33], [0.5, 1, 0.8], 0.12, LEAF2],
    [[-0.18, 1.12, 0.33], [-1, 1, 0.3], 0.13, LEAF3],
    [[-0.1, 1.05, 0.38], [-0.3, 0.6, 1], 0.12, LEAF1],
    [[0.02, 1.28, 0.3], [0, 1, 0.2], 0.14, LEAF2],
    [[0.2, 1.12, 0.36], [1, 0.3, 0.6], 0.11, LEAF3],
  ];
  for (const [p, d, l, c] of crown) leaf(p, d, l, c, hips);

  return b.root;
}
