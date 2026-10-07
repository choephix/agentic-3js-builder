import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = { name: "Sea Turtle", description: "A green sea turtle with domed scute shell, paddle flippers and jointed jaws, in a rest pose." };

export default function build() {
  const b = createBuilder({ name: "seaTurtle" });
  const r = rng(7);

  const shellC = "#5b6b2e", shellD = "#3f4a22", skin = "#8fa35a", skinD = "#6d7f41", belly = "#e3d59a", dark = "#1d1d14";

  // skeleton
  const root = b.joint("root", { at: [0, 0.3, 0] });
  const spine = b.joint("spine", { at: [0, 0.32, 0.1], parent: root });
  const neck1 = b.joint("neck1", { at: [0, 0.3, 0.45], parent: spine });
  const neck2 = b.joint("neck2", { at: [0, 0.32, 0.62], parent: neck1 });
  const head = b.joint("head", { at: [0, 0.33, 0.78], parent: neck2 });
  const jaw = b.joint("jaw", { at: [0, 0.3, 0.86], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.28, -0.5], parent: root });
  const tail2 = b.joint("tail2", { at: [0, 0.27, -0.62], parent: tail1 });

  const side = (s: number, n: string) => {
    const S = s > 0 ? "L" : "R";
    const fs = b.joint("shoulder" + S, { at: [s * 0.3, 0.27, 0.3], parent: spine });
    const fe = b.joint("elbow" + S, { at: [s * 0.55, 0.25, 0.4], parent: fs });
    const fw = b.joint("flipperTip" + S, { at: [s * 0.95, 0.24, 0.5], parent: fe });
    const hs = b.joint("hip" + S, { at: [s * 0.2, 0.25, -0.35], parent: root });
    const hk = b.joint("knee" + S, { at: [s * 0.36, 0.24, -0.5], parent: hs });
    const ht = b.joint("hindTip" + S, { at: [s * 0.5, 0.23, -0.65], parent: hk });
    return { fs, fe, fw, hs, hk, ht };
  };
  const L = side(1, "L"), R = side(-1, "R");

  // shell dome
  b.part(new THREE.SphereGeometry(1, 10, 7), shellC, { at: [0, 0.34, 0], bone: spine, scale: [0.46, 0.22, 0.62] } as any);
  // plastron
  b.part(new THREE.SphereGeometry(1, 10, 5), belly, { at: [0, 0.2, 0], bone: root, scale: [0.4, 0.09, 0.56] } as any);
  // rim
  b.part(new THREE.TorusGeometry(1, 0.03, 4, 14), shellD, { at: [0, 0.27, 0], bone: spine, scale: [0.47, 0.64, 1], rot: undefined } as any);

  // scutes: central row, side rows
  const scute = (x: number, z: number, sx: number, sz: number, c: string) => {
    const y = 0.34 + 0.22 * Math.sqrt(Math.max(0, 1 - (x / 0.46) ** 2 - (z / 0.62) ** 2)) + 0.005;
    b.part(new THREE.CylinderGeometry(0.5, 0.6, 0.05, 6), c, { at: [x, y, z], bone: spine, scale: [sx, 1, sz] } as any);
  };
  for (let i = 0; i < 5; i++) scute(0, -0.38 + i * 0.19, 0.16, 0.1, i % 2 ? shellD : "#7a8a3a");
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    scute(s * 0.26, -0.27 + i * 0.19, 0.14, 0.1, i % 2 ? "#7a8a3a" : shellD);
    scute(s * 0.4, -0.2 + i * 0.15 + r() * 0.01, 0.07, 0.07, shellD);
  }

  // neck and head
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.4, 7), skin, { at: [0, 0.31, 0.6], bone: neck1, rotation: [Math.PI / 2, 0, 0] } as any);
  b.part(new THREE.SphereGeometry(0.15, 8, 6), skin, { at: [0, 0.33, 0.8], bone: head, scale: [1, 0.85, 1.2] } as any);
  b.part(new THREE.BoxGeometry(0.15, 0.05, 0.14), skinD, { at: [0, 0.31, 0.92], bone: head } as any);
  b.part(new THREE.BoxGeometry(0.14, 0.035, 0.13), belly, { at: [0, 0.27, 0.9], bone: jaw } as any);
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.035, 6, 5), "#f2f0e0", { at: [s * 0.11, 0.38, 0.84], bone: head } as any);
    b.part(new THREE.SphereGeometry(0.02, 6, 5), dark, { at: [s * 0.135, 0.38, 0.86], bone: head } as any);
    b.part(new THREE.BoxGeometry(0.02, 0.012, 0.02), dark, { at: [s * 0.03, 0.34, 0.99], bone: head } as any);
  }
  b.part(new THREE.BoxGeometry(0.3, 0.03, 0.06), skinD, { at: [0, 0.4, 0.74], bone: head } as any);

  // flippers
  const flip = (a: THREE.Object3D, tip: THREE.Object3D, s: number, sx: number, sz: number, len: number, z: number, ang: number) => {
    b.part(new THREE.SphereGeometry(0.1, 7, 5), skin, { at: [s * 0.32, 0.26, z], bone: a, scale: [1.2, 0.7, 1.2] } as any);
    b.part(new THREE.SphereGeometry(1, 8, 5), skin, { at: [s * (0.32 + len * 0.5), 0.245, z + ang * len * 0.5], bone: tip, scale: [len * 0.5, 0.025, sz], rotation: [0, -s * ang * 1.0, 0] } as any);
    b.part(new THREE.SphereGeometry(1, 6, 4), skinD, { at: [s * (0.32 + len * 0.95), 0.245, z + ang * len * 0.95], bone: tip, scale: [0.05, 0.02, 0.05] } as any);
  };
  flip(L.fs, L.fw, 1, 1, 0.1, 0.65, 0.3, 0.25);
  flip(R.fs, R.fw, -1, 1, 0.1, 0.65, 0.3, 0.25);
  flip(L.hs, L.ht, 1, 1, 0.07, 0.3, -0.45, -0.5);
  flip(R.hs, R.ht, -1, 1, 0.07, 0.3, -0.45, -0.5);

  // tail
  b.part(new THREE.ConeGeometry(0.06, 0.2, 5), skin, { at: [0, 0.27, -0.66], bone: tail1, rotation: [-Math.PI / 2, 0, 0] } as any);

  // skin spots on flippers
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1;
    b.part(new THREE.SphereGeometry(0.02, 5, 4), "#c9b96a", { at: [s * (0.5 + r() * 0.4), 0.262, 0.35 + r() * 0.15], bone: s > 0 ? L.fe : R.fe } as any);
  }

  return b.root;
}
