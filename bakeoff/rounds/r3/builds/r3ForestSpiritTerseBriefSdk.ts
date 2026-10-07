import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Forest Spirit",
  description: "A tall, antlered moss-cloaked woodland spirit with a bone mask, glowing eyes, leaf collar and mushrooms on its back.",
};

export default function build() {
  const b = createBuilder({ name: "forest_spirit" });
  const R = rng(7);

  const moss = "#4f7a3a", mossDark = "#355a2c", bark = "#5b3f2a", bone = "#e8e0c8";
  const glow = "#9ff7c8", leaf = "#7fb04a", leafDark = "#a8c24e", red = "#c8452f", cream = "#f2e6c9";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.75, 0] });
  const spine = b.joint("spine", { at: [0, 0.95, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.12, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.27, 0.03], parent: chest });
  const head = b.joint("head", { at: [0, 1.38, 0.05], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.31, 0.1], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.78, -0.2], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.74, -0.45], parent: tail1 });

  const sides = [1, -1];
  const nm = (s: number) => (s > 0 ? "L" : "R");
  const arms: Record<string, any> = {};
  const legs: Record<string, any> = {};
  for (const s of sides) {
    const sh = b.joint("shoulder" + nm(s), { at: [0.24 * s, 1.17, 0], parent: chest });
    const el = b.joint("elbow" + nm(s), { at: [0.5 * s, 1.07, 0.06], parent: sh });
    const ha = b.joint("hand" + nm(s), { at: [0.74 * s, 0.98, 0.12], parent: el });
    arms[nm(s)] = { sh, el, ha };
    const hp = b.joint("hip" + nm(s), { at: [0.13 * s, 0.72, 0], parent: hips });
    const kn = b.joint("knee" + nm(s), { at: [0.13 * s, 0.4, 0.06], parent: hp });
    const an = b.joint("ankle" + nm(s), { at: [0.13 * s, 0.11, -0.02], parent: kn });
    legs[nm(s)] = { hp, kn, an };
  }

  const ell = (rx: number, ry: number, rz: number, seg = 8) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 2));
    g.scale(rx, ry, rz);
    return g;
  };

  // torso
  b.part(ell(0.2, 0.3, 0.17), moss, { at: [0, 0.98, 0], bone: spine });
  b.part(ell(0.24, 0.17, 0.18), mossDark, { at: [0, 1.15, 0], bone: chest });
  b.part(new THREE.ConeGeometry(0.4, 0.62, 8, 1, true), mossDark, { at: [0, 0.62, 0], bone: hips });
  b.part(new THREE.CylinderGeometry(0.22, 0.3, 0.3, 8), moss, { at: [0, 0.85, 0], bone: hips });
  // hem tufts
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.spike([Math.sin(a) * 0.37, 0.34, Math.cos(a) * 0.37], [0, -1, 0], 0.16 + R() * 0.08, 0.05, { bone: hips } as any);
  }
  // belt of rope and charm
  b.part(new THREE.TorusGeometry(0.22, 0.02, 5, 10), bark, { at: [0, 0.86, 0], bone: hips });
  b.part(ell(0.04, 0.05, 0.03, 6), red, { at: [0, 0.82, 0.23], bone: hips });

  // neck + head
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.16, 7), bark, { at: [0, 1.27, 0.02], bone: neck });
  b.part(ell(0.17, 0.17, 0.18), bone, { at: [0, 1.4, 0.04], bone: head });
  b.part(new THREE.BoxGeometry(0.12, 0.07, 0.14), bone, { at: [0, 1.34, 0.2], bone: head });
  b.part(new THREE.BoxGeometry(0.04, 0.03, 0.03), bark, { at: [0, 1.375, 0.275], bone: head });
  b.part(new THREE.BoxGeometry(0.11, 0.03, 0.14), cream, { at: [0, 1.285, 0.19], bone: jaw });
  for (const s of sides) {
    b.part(ell(0.045, 0.06, 0.03, 6), "#16301f", { at: [0.075 * s, 1.43, 0.19], bone: head });
    b.part(ell(0.025, 0.035, 0.02, 6), glow, { at: [0.075 * s, 1.43, 0.215], bone: head });
    // ears
    b.spike([0.16 * s, 1.43, 0], [0.8 * s, 0.25, -0.3], 0.18, 0.05, { bone: head } as any);
    // antlers
    const base = [0.08 * s, 1.54, 0.0];
    const t1 = [0.2 * s, 1.78, -0.04];
    b.spike(base, t1, null, 0.028, { bone: head } as any);
    b.spike([0.15 * s, 1.67, -0.02], [0.32 * s, 1.78, 0.08], null, 0.02, { bone: head } as any);
    b.spike([0.18 * s, 1.74, -0.04], [0.14 * s, 1.95, -0.1], null, 0.018, { bone: head } as any);
    b.spike(t1, [0.32 * s, 1.9, -0.1], null, 0.016, { bone: head } as any);
    b.spike([0.12 * s, 1.6, -0.01], [0.3 * s, 1.62, -0.1], null, 0.018, { bone: head } as any);
    // leaf on antler
    b.part(ell(0.05, 0.015, 0.03, 5), leaf, { at: [0.32 * s, 1.79, 0.09], bone: head });
  }

  // leaf collar
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.spike([Math.sin(a) * 0.14, 1.23, Math.cos(a) * 0.12], [Math.sin(a), -0.35, Math.cos(a)], 0.16, 0.05, { bone: chest } as any);
  }

  // arms and hands
  for (const s of sides) {
    const a = arms[nm(s)];
    b.part(ell(0.07, 0.07, 0.07, 6), mossDark, { at: [0.24 * s, 1.17, 0], bone: a.sh });
    b.spike(a.sh, a.el, null, 0.05, { bone: a.sh } as any);
    b.spike(a.el, a.ha, null, 0.04, { bone: a.el } as any);
    b.part(ell(0.045, 0.045, 0.045, 6), bark, { at: [0.5 * s, 1.07, 0.06], bone: a.el });
    b.part(ell(0.05, 0.03, 0.06, 6), bone, { at: [0.76 * s, 0.98, 0.13], bone: a.ha });
    for (let f = -1; f <= 1; f++) {
      b.spike([0.79 * s, 0.98, 0.13 + f * 0.03], [1 * s, -0.1, f * 0.35], 0.1, 0.012, { bone: a.ha } as any);
    }
  }

  // legs
  for (const s of sides) {
    const l = legs[nm(s)];
    b.spike(l.hp, l.kn, null, 0.075, { bone: l.hp } as any);
    b.part(ell(0.065, 0.065, 0.065, 6), bark, { at: [0.13 * s, 0.4, 0.06], bone: l.kn });
    b.spike(l.kn, l.an, null, 0.06, { bone: l.kn } as any);
    b.part(new THREE.BoxGeometry(0.1, 0.06, 0.2), bark, { at: [0.13 * s, 0.03, 0.03], bone: l.an });
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.05), bone, { at: [0.13 * s, 0.03, 0.15], bone: l.an });
  }

  // tail: fluffy
  b.part(ell(0.07, 0.07, 0.16, 7), moss, { at: [0, 0.78, -0.27], bone: tail1 });
  b.part(ell(0.09, 0.1, 0.2, 7), leafDark, { at: [0, 0.74, -0.5], bone: tail2 });

  // mushrooms on back
  const shrooms = [[0.1, 1.12, -0.15, 0.06], [-0.12, 1.02, -0.16, 0.045], [0.0, 1.2, -0.14, 0.04]];
  for (const [x, y, z, r] of shrooms) {
    b.part(new THREE.CylinderGeometry(r * 0.3, r * 0.4, r * 1.6, 6), cream, { at: [x, y + r * 0.6, z], bone: chest });
    b.part(ell(r, r * 0.55, r, 7), red, { at: [x, y + r * 1.5, z], bone: chest });
    b.part(ell(r * 0.2, r * 0.1, r * 0.2, 5), cream, { at: [x + r * 0.2, y + r * 1.95, z], bone: chest });
  }

  // fireflies/glow motes around
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2;
    b.part(new THREE.IcosahedronGeometry(0.015, 0), glow, { at: [Math.sin(a) * 0.5, 0.8 + R() * 0.8, Math.cos(a) * 0.5], bone: spine });
  }

  return b.root;
}
