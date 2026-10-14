import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Garden Snail",
  description: "A stylized garden snail with a spiral banded shell, eye stalks, lower tentacles and a jawed mouth, rigged and in a rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });
  const r = rng(7);

  // ---- skeleton ----
  const root = b.joint("root", { at: [0, 0.01, 0] });
  const tail1 = b.joint("tail1", { at: [0, 0.008, -0.03], parent: root, role: "tail" });
  const tail2 = b.joint("tail2", { at: [0, 0.005, -0.055], parent: tail1, role: "tail" });
  const neck = b.joint("neck", { at: [0, 0.012, 0.03], parent: root, role: "neck" });
  const head = b.joint("head", { at: [0, 0.02, 0.055], parent: neck, role: "head" });
  const jaw = b.joint("jaw", { at: [0, 0.014, 0.066], parent: head, role: "jaw" });
  const shell = b.joint("shell", { at: [0, 0.03, -0.01], parent: root });
  const tentUL = b.joint("tentUpperL", { at: [0.006, 0.026, 0.062], parent: head, role: "tentacle" });
  const tentUR = b.joint("tentUpperR", { at: [-0.006, 0.026, 0.062], parent: head, role: "tentacle" });
  const tentLL = b.joint("tentLowerL", { at: [0.007, 0.018, 0.07], parent: head, role: "tentacle" });
  const tentLR = b.joint("tentLowerR", { at: [-0.007, 0.018, 0.07], parent: head, role: "tentacle" });

  const skin = "#c9b08a";
  const skinDark = "#a38a66";
  const sole = "#e6d3a8";

  // ---- foot / body: row of flattened ellipsoids ----
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const t = i / N; // 0 tail -> 1 head
    const z = -0.07 + t * 0.125;
    const taper = Math.pow(Math.sin(Math.min(1, t * 1.15 + 0.08) * Math.PI * 0.5), 0.7);
    const rad = 0.004 + 0.008 * taper;
    const y = rad * 0.85 + (t > 0.7 ? (t - 0.7) * 0.035 : 0);
    const bone = z < -0.043 ? tail2 : z < -0.005 ? tail1 : z < 0.045 ? root : neck;
    b.part(new THREE.SphereGeometry(rad, 8, 6), skin, {
      at: [0, y, z],
      bone,
      scale: [1.0, 0.85, 1.9],
    });
  }
  // sole strip
  for (let i = 0; i < 6; i++) {
    const z = -0.05 + i * 0.019;
    b.part(new THREE.BoxGeometry(0.018, 0.003, 0.024), sole, {
      at: [0, 0.0015, z],
      bone: z < -0.04 ? tail2 : z < 0 ? tail1 : root,
    });
  }
  // head
  b.part(new THREE.SphereGeometry(0.0105, 8, 6), skin, { at: [0, 0.02, 0.058], bone: head, scale: [1, 0.95, 1.15] });
  b.part(new THREE.SphereGeometry(0.006, 7, 5), skinDark, { at: [0, 0.019, 0.07], bone: head, scale: [1.1, 0.8, 1] });
  // mouth: upper and lower lips
  b.part(new THREE.BoxGeometry(0.011, 0.003, 0.006), "#8a6a4a", { at: [0, 0.0175, 0.0735], bone: head });
  b.part(new THREE.BoxGeometry(0.009, 0.003, 0.006), "#6e5238", { at: [0, 0.0125, 0.0725], bone: jaw });
  b.part(new THREE.SphereGeometry(0.0007, 5, 4), "#2a1a12", { at: [0.002, 0.0195, 0.0768], bone: head });
  b.part(new THREE.SphereGeometry(0.0007, 5, 4), "#2a1a12", { at: [-0.002, 0.0195, 0.0768], bone: head });

  // back bumps (wrinkles)
  for (let i = 0; i < 22; i++) {
    const z = -0.065 + r() * 0.12;
    const x = (r() - 0.5) * 0.012;
    const t = (z + 0.07) / 0.125;
    const rad = 0.004 + 0.008 * Math.pow(Math.sin(Math.min(1, t * 1.15 + 0.08) * Math.PI * 0.5), 0.7);
    const y = rad * 1.45 + (t > 0.7 ? (t - 0.7) * 0.035 : 0) - Math.abs(x) * 0.2;
    b.part(new THREE.SphereGeometry(0.0013 + r() * 0.0008, 5, 4), skinDark, {
      at: [x, y, z],
      bone: z < -0.043 ? tail2 : z < -0.005 ? tail1 : z < 0.04 ? root : neck,
    });
  }

  // ---- tentacles ----
  const stalk = (base: number[], tip: number[], bone: THREE.Object3D, rad: number, eye: boolean) => {
    b.spike(base, tip, null, rad, { color: skin, bone } as any);
    b.part(new THREE.SphereGeometry(rad * (eye ? 1.5 : 1.1), 7, 5), eye ? skinDark : skin, { at: tip, bone });
    if (eye) {
      b.part(new THREE.SphereGeometry(rad * 0.7, 6, 5), "#15110e", {
        at: [tip[0] * 1.15, tip[1] + rad * 0.2, tip[2] + rad * 1.0],
        bone,
      });
    }
  };
  stalk([0.006, 0.026, 0.062], [0.012, 0.052, 0.078], tentUL, 0.0022, true);
  stalk([-0.006, 0.026, 0.062], [-0.012, 0.052, 0.078], tentUR, 0.0022, true);
  stalk([0.007, 0.018, 0.07], [0.011, 0.0135, 0.088], tentLL, 0.0015, false);
  stalk([-0.007, 0.018, 0.07], [-0.011, 0.0135, 0.088], tentLR, 0.0015, false);

  // ---- shell: spiral of spheres in the y-z plane ----
  const whorls = 3;
  const per = 28;
  const total = whorls * per;
  const cy = 0.058;
  const cz = -0.012;
  const colA = "#a8672d";
  const colB = "#7a431c";
  const colC = "#d9a45a";
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const ang = 2.2 + t * whorls * Math.PI * 2;
    const R = 0.003 + 0.021 * t;
    const rad = 0.005 + 0.0155 * Math.pow(t, 0.9);
    const x = (0.5 - t) * 0.006;
    const band = Math.floor(i / (per / 6)) % 2;
    const col = i > total - 3 ? colC : band ? colB : colA;
    b.part(new THREE.SphereGeometry(rad, 9, 7), col, {
      at: [x, cy + R * Math.sin(ang), cz + R * Math.cos(ang)],
      bone: shell,
      scale: [0.92, 1, 1],
    });
  }
  // apex and lip of the shell
  b.part(new THREE.SphereGeometry(0.005, 7, 5), colC, { at: [0.003, cy, cz], bone: shell });
  // mantle collar where shell meets body
  b.part(new THREE.SphereGeometry(0.0095, 8, 6), skinDark, {
    at: [0, 0.019, 0.026],
    bone: root,
    scale: [1.05, 0.8, 1.5],
  });

  return b.root;
}
