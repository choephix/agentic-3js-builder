import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin",
  description: "A stylized, rigged emperor penguin with separate jaw, flippers, legs and tail.",
};

export default function build() {
  const b = createBuilder({ name: "penguin" });

  const BLACK = "#1b1f27", WHITE = "#f4f4f0", GOLD = "#f2b928", PALE = "#f6e08a";
  const ORANGE = "#f08a24", BEAK = "#e2661c", DARK = "#2a2a2e";

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.4, 0] });
  const spine = b.joint("spine", { at: [0, 0.6, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.82, 0.02], parent: spine });
  const head = b.joint("head", { at: [0, 0.9, 0.03], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.89, 0.1], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.14, -0.2], parent: hips });

  const ang = 0.45, upperLen = 0.17;
  const sides: Array<[string, number]> = [["L", 1], ["R", -1]];
  const J: Record<string, any> = {};
  for (const [n, s] of sides) {
    const sh: [number, number, number] = [s * 0.22, 0.74, 0.0];
    J["shoulder" + n] = b.joint("shoulder" + n, { at: sh, parent: spine });
    const el: [number, number, number] = [sh[0] + s * upperLen * Math.sin(ang), sh[1] - upperLen * Math.cos(ang), 0];
    J["elbow" + n] = b.joint("elbow" + n, { at: el, parent: J["shoulder" + n] });
    J["hip" + n] = b.joint("hip" + n, { at: [s * 0.09, 0.12, 0.03], parent: hips });
    J["ankle" + n] = b.joint("ankle" + n, { at: [s * 0.09, 0.04, 0.04], parent: J["hip" + n] });
  }

  const ell = (rx: number, ry: number, rz: number, w = 12, h = 9) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(rx, ry, rz);
    return g;
  };

  // ---- body ----
  b.part(ell(0.25, 0.43, 0.23), BLACK, { at: [0, 0.5, -0.02], bone: spine });
  b.part(ell(0.215, 0.37, 0.2), WHITE, { at: [0, 0.49, 0.06], bone: spine });
  b.part(ell(0.17, 0.12, 0.14), PALE, { at: [0, 0.76, 0.1], bone: spine });
  b.part(ell(0.14, 0.12, 0.13), BLACK, { at: [0, 0.85, 0.0], bone: neck });

  // ---- head ----
  b.part(ell(0.115, 0.12, 0.125), BLACK, { at: [0, 0.93, 0.03], bone: head });
  for (const [n, s] of sides) {
    b.part(ell(0.02, 0.055, 0.045, 8, 6), GOLD, { at: [s * 0.105, 0.9, 0.0], bone: head });
    b.part(ell(0.022, 0.022, 0.022, 8, 6), DARK, { at: [s * 0.086, 0.955, 0.095], bone: head });
    b.part(ell(0.007, 0.007, 0.007, 6, 4), WHITE, { at: [s * 0.094, 0.962, 0.113], bone: head });
  }
  // beak: upper and lower
  const up = new THREE.ConeGeometry(0.035, 0.15, 5);
  up.rotateX(Math.PI / 2);
  up.scale(1, 0.75, 1);
  b.part(up, DARK, { at: [0, 0.915, 0.19], bone: head });
  const low = new THREE.ConeGeometry(0.028, 0.12, 5);
  low.rotateX(Math.PI / 2);
  low.scale(1, 0.55, 1);
  b.part(low, BEAK, { at: [0, 0.885, 0.16], bone: jaw });
  b.part(new THREE.BoxGeometry(0.012, 0.012, 0.1), ORANGE, { at: [0.035, 0.918, 0.17], bone: head });
  b.part(new THREE.BoxGeometry(0.012, 0.012, 0.1), ORANGE, { at: [-0.035, 0.918, 0.17], bone: head });

  // ---- flippers, legs, feet ----
  for (const [n, s] of sides) {
    const sh = J["shoulder" + n], el = J["elbow" + n];
    const g1 = ell(0.035, upperLen * 0.7, 0.09, 8, 6);
    g1.translate(0, -upperLen * 0.5, 0);
    g1.rotateZ(s * ang);
    b.part(g1, BLACK, { at: [s * 0.22, 0.74, 0], bone: sh });

    const g2 = ell(0.03, 0.14, 0.075, 8, 6);
    g2.translate(0, -0.12, 0);
    g2.rotateZ(s * (ang + 0.08));
    const elp = el.position ? el.position.clone() : null;
    const ex = 0.22 * s + s * upperLen * Math.sin(ang);
    const ey = 0.74 - upperLen * Math.cos(ang);
    b.part(g2, BLACK, { at: [ex, ey, 0], bone: el });
    void elp;

    const leg = new THREE.CylinderGeometry(0.035, 0.04, 0.1, 6);
    b.part(leg, ORANGE, { at: [s * 0.09, 0.08, 0.03], bone: J["hip" + n] });

    const ank = J["ankle" + n];
    b.part(ell(0.06, 0.02, 0.09, 8, 5), ORANGE, { at: [s * 0.09, 0.02, 0.06], bone: ank });
    for (const t of [-1, 0, 1]) {
      const toe = ell(0.018, 0.016, 0.05, 6, 4);
      toe.rotateY(t * 0.35);
      b.part(toe, ORANGE, { at: [s * 0.09 + t * 0.04, 0.018, 0.14], bone: ank });
    }
  }

  // ---- tail ----
  const tg = new THREE.ConeGeometry(0.08, 0.2, 5);
  tg.rotateX(-Math.PI / 2 - 0.5);
  tg.scale(1, 0.4, 1);
  b.part(tg, BLACK, { at: [0, 0.1, -0.3], bone: tail1 });

  return b.root;
}
