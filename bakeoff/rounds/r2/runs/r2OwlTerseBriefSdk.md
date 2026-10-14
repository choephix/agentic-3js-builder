```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Great Horned Owl",
  description: "A stylized, rigged owl made from primitives, with a facial disc, ear tufts, folded wings, a barred chest and talons.",
};

export default function build() {
  const b = createBuilder({ name: "owl" });

  const root = b.joint("root", { at: [0, 0.2, 0] });
  const body = b.joint("spine1", { at: [0, 0.27, 0], parent: root });
  const neck = b.joint("neck1", { at: [0, 0.43, 0.02], parent: body });
  const head = b.joint("head", { at: [0, 0.5, 0.03], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.475, 0.1], parent: head });
  const tail = b.joint("tail1", { at: [0, 0.16, -0.12], parent: root });
  const wingL = b.joint("wingL", { at: [0.15, 0.37, -0.01], parent: body });
  const wingR = b.joint("wingR", { at: [-0.15, 0.37, -0.01], parent: body });
  const hipL = b.joint("hipL", { at: [0.07, 0.16, 0.0], parent: root });
  const hipR = b.joint("hipR", { at: [-0.07, 0.16, 0.0], parent: root });
  const footL = b.joint("footL", { at: [0.07, 0.04, 0.03], parent: hipL });
  const footR = b.joint("footR", { at: [-0.07, 0.04, 0.03], parent: hipR });

  const sph = (s = 1) => new THREE.SphereGeometry(s, 12, 8);
  const cone = (r: number, h: number) => new THREE.ConeGeometry(r, h, 6);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  const C = {
    brown: "#7a5a3a",
    dark: "#3b2a1c",
    mid: "#5e4429",
    buff: "#d9bf94",
    face: "#ecdcbc",
    yellow: "#f2c230",
    black: "#111111",
    beak: "#3c3b36",
    talon: "#25221f",
    leg: "#b99a6a",
  };

  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any, o: any = {}) =>
    b.part(geo, color, { at, bone, ...o });

  // Body
  P(sph(), C.brown, [0, 0.27, 0], body, { scale: [0.15, 0.21, 0.14] });
  P(sph(), C.buff, [0, 0.25, 0.04], body, { scale: [0.11, 0.16, 0.11] });
  // chest barring
  for (let r = 0; r < 6; r++) {
    const dy = -0.13 + r * 0.045;
    for (const x of [-0.06, 0, 0.06]) {
      const xx = x + (r % 2 ? 0.03 : 0);
      const k = 1 - (xx / 0.15) ** 2 - (dy / 0.21) ** 2;
      if (k <= 0.05) continue;
      const z = 0.14 * Math.sqrt(k);
      P(sph(), C.dark, [xx, 0.27 + dy, z + 0.035 * 0.3], body, { scale: [0.012, 0.016, 0.01] });
    }
  }
  // back shoulder mantle
  P(sph(), C.mid, [0, 0.33, -0.05], body, { scale: [0.14, 0.15, 0.1] });

  // Tail
  P(box(0.12, 0.03, 0.2), C.mid, [0, 0.13, -0.2], tail, { dir: [0, 0.3, -1] });
  for (const x of [-0.04, 0, 0.04]) {
    P(box(0.012, 0.032, 0.14), C.buff, [x, 0.125, -0.21], tail, {});
  }

  // Neck + head
  P(sph(), C.brown, [0, 0.43, 0.02], neck, { scale: [0.12, 0.08, 0.1] });
  P(sph(), C.brown, [0, 0.52, 0.0], head, { scale: [0.14, 0.12, 0.12] });
  // facial discs
  for (const s of [1, -1]) {
    P(sph(), C.face, [s * 0.055, 0.51, 0.075], head, { scale: [0.06, 0.07, 0.03] });
    P(new THREE.TorusGeometry(0.068, 0.008, 5, 12), C.dark, [s * 0.055, 0.51, 0.095], head, { scale: [0.95, 1.1, 1] });
    // eye
    P(sph(), C.yellow, [s * 0.056, 0.525, 0.1], head, { scale: [0.032, 0.032, 0.02] });
    P(sph(), C.black, [s * 0.056, 0.525, 0.115], head, { scale: [0.016, 0.016, 0.012] });
    // brow
    P(box(0.07, 0.014, 0.02), C.dark, [s * 0.062, 0.568, 0.1], head, { dir: [0, 1, 0] });
    // ear tuft
    P(cone(0.026, 0.12), C.dark, [s * 0.09, 0.64, 0.0], head, { dir: [s * 0.35, 1, -0.15] });
    P(cone(0.015, 0.09), C.buff, [s * 0.09, 0.635, 0.012], head, { dir: [s * 0.35, 1, -0.15] });
  }
  // beak: upper + lower jaw
  P(cone(0.026, 0.06), C.beak, [0, 0.495, 0.12], head, { dir: [0, -0.7, 1] });
  P(cone(0.018, 0.04), C.beak, [0, 0.468, 0.11], jaw, { dir: [0, -0.2, 1] });

  // Wings (slightly out from body, hanging)
  for (const s of [1, -1]) {
    const w = s === 1 ? wingL : wingR;
    P(sph(), C.brown, [s * 0.185, 0.27, -0.02], w, { scale: [0.04, 0.2, 0.12], dir: [s * 0.15, -1, 0] });
    P(sph(), C.mid, [s * 0.19, 0.2, -0.04], w, { scale: [0.035, 0.12, 0.1], dir: [s * 0.2, -1, -0.1] });
    // flight feather tips
    for (let i = 0; i < 4; i++) {
      P(box(0.025, 0.1, 0.03), i % 2 ? C.dark : C.buff, [s * (0.205 + i * 0.002), 0.1, -0.1 + i * 0.03], w, {});
    }
    // wing spots
    for (let i = 0; i < 3; i++) {
      P(sph(), C.buff, [s * 0.215, 0.3 - i * 0.05, -0.02 - i * 0.01], w, { scale: [0.008, 0.012, 0.02] });
    }
  }

  // Legs & feet
  for (const s of [1, -1]) {
    const hip = s === 1 ? hipL : hipR;
    const foot = s === 1 ? footL : footR;
    const x = s * 0.07;
    P(new THREE.CylinderGeometry(0.035, 0.03, 0.12, 7), C.leg, [x, 0.1, 0.0], hip, {});
    P(sph(), C.buff, [x, 0.16, 0.0], hip, { scale: [0.055, 0.045, 0.06] });
    // toes
    const toes: [number, number][] = [[-0.03, 0.1], [0, 0.12], [0.03, 0.1]];
    for (const [dx, len] of toes) {
      P(box(0.022, 0.02, len), C.leg, [x + dx, 0.02, 0.03 + len / 2], foot, {});
      P(cone(0.012, 0.045), C.talon, [x + dx, 0.015, 0.03 + len + 0.01], foot, { dir: [0, -0.5, 1] });
    }
    P(box(0.025, 0.02, 0.07), C.leg, [x, 0.02, -0.04], foot, {});
    P(cone(0.012, 0.04), C.talon, [x, 0.012, -0.09], foot, { dir: [0, -0.5, -1] });
  }

  return b.root;
}
```