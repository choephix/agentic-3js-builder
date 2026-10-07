import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Forest Spirit",
  description: "A gentle antlered woodland spirit with a mossy cloak, glowing eyes and floating leaf-lights.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });
  const r = rng(7);

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.8, 0] });
  const spine = b.joint("spine", { at: [0, 1.15, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.5, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.75, 0.05], parent: chest });
  const head = b.joint("head", { at: [0, 1.9, 0.08], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.88, 0.2], parent: head });

  const legs: Record<string, any> = {};
  for (const [s, x] of [["L", 0.16], ["R", -0.16]] as const) {
    const hip = b.joint("hip" + s, { at: [x, 0.8, 0], parent: hips });
    const knee = b.joint("knee" + s, { at: [x, 0.42, 0.04], parent: hip });
    const foot = b.joint("foot" + s, { at: [x, 0.08, 0.02], parent: knee });
    legs[s] = { hip, knee, foot };
    const sh = b.joint("shoulder" + s, { at: [x * 1.9, 1.62, 0], parent: chest });
    const el = b.joint("elbow" + s, { at: [x * 2.4, 1.3, 0.05], parent: sh });
    const hand = b.joint("hand" + s, { at: [x * 2.7, 1.0, 0.15], parent: el });
    legs[s + "a"] = { sh, el, hand };
  }

  const bark = "#5b4030", barkD = "#3e2b20", moss = "#4f8a3a", mossL = "#8fc255";
  const cream = "#e8dfc4", glow = "#9dffb0", leaf = "#c8d84a", leafO = "#e08a30";

  // Body: robed cone
  b.part(new THREE.CylinderGeometry(0.2, 0.42, 1.0, 8), moss, { at: [0, 0.95, 0], bone: spine });
  b.part(new THREE.CylinderGeometry(0.34, 0.22, 0.5, 8), mossL, { at: [0, 1.5, 0], bone: chest });
  b.part(new THREE.CylinderGeometry(0.46, 0.5, 0.16, 8), barkD, { at: [0, 0.5, 0], bone: hips });
  // hem tufts
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.09, 0.28, 4), i % 2 ? moss : mossL, {
      at: [Math.sin(a) * 0.46, 0.5, Math.cos(a) * 0.46], bone: hips,
    });
  }
  // shoulder mantle
  b.part(new THREE.SphereGeometry(0.4, 8, 5), mossL, { at: [0, 1.65, -0.02], bone: chest, scale: [1.2, 0.5, 0.9] } as any);
  // belt and pendant
  b.part(new THREE.TorusGeometry(0.27, 0.03, 4, 10), bark, { at: [0, 1.2, 0], bone: spine, aim: [0, 1, 0] } as any);
  b.part(new THREE.OctahedronGeometry(0.07), glow, { at: [0, 1.2, 0.28], bone: spine });

  // Neck & head
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.2, 6), cream, { at: [0, 1.78, 0.03], bone: neck });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), cream, { at: [0, 1.95, 0.06], bone: head, scale: [1, 1.05, 1] } as any);
  // snout / upper jaw
  b.part(new THREE.BoxGeometry(0.14, 0.08, 0.16), cream, { at: [0, 1.92, 0.24], bone: head });
  b.part(new THREE.BoxGeometry(0.04, 0.03, 0.04), barkD, { at: [0, 1.96, 0.33], bone: head });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.11, 0.04, 0.14), cream, { at: [0, 1.85, 0.23], bone: jaw });
  // eyes
  for (const x of [0.08, -0.08]) {
    b.part(new THREE.SphereGeometry(0.045, 6, 4), glow, { at: [x, 1.99, 0.2], bone: head });
    b.part(new THREE.SphereGeometry(0.02, 4, 3), "#1a3020", { at: [x, 1.99, 0.24], bone: head });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 8), "#3a6a2a", { at: [x * 2.1, 1.95, 0.0], bone: head, aim: [1, 0, 0] } as any);
  }
  // ears
  for (const x of [0.2, -0.2]) {
    b.part(new THREE.ConeGeometry(0.06, 0.26, 4), cream, { at: [x * 1.2, 2.0, -0.02], bone: head, aim: [x * 5, 0.3, -0.1] } as any);
  }
  // leaf crown
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i / 6) * Math.PI;
    b.part(new THREE.ConeGeometry(0.04, 0.12, 4), i % 2 ? leaf : leafO, {
      at: [Math.sin(a) * 0.2, 2.1, -0.02 + Math.cos(a) * 0.05], bone: head,
    });
  }

  // Antlers
  for (const s of [1, -1]) {
    const base = [0.1 * s, 2.1, -0.02];
    let p = base.slice();
    const trunk = [
      [0.1, 2.1, -0.02], [0.2, 2.35, -0.05], [0.3, 2.6, -0.1], [0.34, 2.85, -0.12],
    ].map(q => [q[0] * s, q[1], q[2]]);
    for (let i = 0; i < trunk.length - 1; i++) {
      b.rod(trunk[i], trunk[i + 1], 0.035 - i * 0.007, bark, { bone: head } as any);
    }
    const tines = [
      [1, [0.5, 2.55, 0.0]], [2, [0.5, 2.85, -0.12]], [3, [0.18, 3.05, -0.12]], [1, [0.12, 2.5, 0.12]],
    ] as const;
    tines.forEach(([i, t]) => {
      const from = trunk[Math.min(i, 3)];
      b.rod(from, [t[0] * s, t[1], t[2]], 0.02, bark, { bone: head } as any);
      b.part(new THREE.SphereGeometry(0.03, 4, 3), glow, { at: [t[0] * s, t[1], t[2]], bone: head });
    });
    void p;
  }

  // Legs
  for (const s of ["L", "R"]) {
    const l = legs[s];
    const x = s === "L" ? 0.16 : -0.16;
    b.rod([x, 0.8, 0], [x, 0.42, 0.04], 0.055, bark, { bone: l.hip } as any);
    b.rod([x, 0.42, 0.04], [x, 0.1, 0.02], 0.045, bark, { bone: l.knee } as any);
    b.part(new THREE.BoxGeometry(0.12, 0.06, 0.24), barkD, { at: [x, 0.03, 0.08], bone: l.foot });
    for (const dx of [-0.04, 0, 0.04]) {
      b.part(new THREE.ConeGeometry(0.02, 0.06, 4), cream, { at: [x + dx, 0.03, 0.22], bone: l.foot, aim: [0, 0, 1] } as any);
    }
    // Arms
    const a = legs[s + "a"];
    const ax = x * 1.9, ex = x * 2.4, hx = x * 2.7;
    b.rod([ax, 1.62, 0], [ex, 1.3, 0.05], 0.05, mossL, { bone: a.sh } as any);
    b.rod([ex, 1.3, 0.05], [hx, 1.0, 0.15], 0.04, cream, { bone: a.el } as any);
    b.part(new THREE.SphereGeometry(0.06, 6, 4), cream, { at: [hx, 0.97, 0.16], bone: a.hand });
    for (const dx of [-0.04, 0, 0.04]) {
      b.part(new THREE.CylinderGeometry(0.012, 0.01, 0.12, 4), cream, { at: [hx + dx * 0.8, 0.88, 0.18], bone: a.hand });
    }
  }

  // Floating leaf-lights
  for (let i = 0; i < 12; i++) {
    const a = r() * Math.PI * 2, rad = 0.6 + r() * 0.4, y = 0.6 + r() * 1.6;
    b.part(new THREE.OctahedronGeometry(0.05 + r() * 0.03), i % 3 === 0 ? glow : i % 3 === 1 ? leaf : leafO, {
      at: [Math.sin(a) * rad, y, Math.cos(a) * rad], bone: chest,
    });
  }

  // Mushrooms on shoulder/back
  for (const [x, y, z, sc] of [[0.3, 1.8, -0.1, 1], [0.15, 1.85, -0.2, 0.7], [-0.32, 1.75, -0.05, 0.8]] as const) {
    b.part(new THREE.CylinderGeometry(0.015 * sc, 0.02 * sc, 0.1 * sc, 5), cream, { at: [x, y, z], bone: chest });
    b.part(new THREE.SphereGeometry(0.06 * sc, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), "#d14a3a", { at: [x, y + 0.05 * sc, z], bone: chest });
  }

  return b.root;
}
