```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Green Sea Turtle",
  description:
    "Heart-style olive and caramel scuted shell, pale plastron, blunt head with beak, wide front flippers, short rear flippers and a remora riding underneath.",
};

export default function build() {
  const b = createBuilder({ name: "seaTurtle" });
  const Y0 = 0.2;
  const body = b.joint("body", { at: [0, Y0, 0], role: "spine" } as any);
  const neck = b.joint("neck", { at: [0, Y0 + 0.01, 0.42], parent: body, role: "neck" } as any);
  const head = b.joint("head", { at: [0, Y0 + 0.02, 0.58], parent: neck, role: "head" } as any);
  const jaw = b.joint("jaw", { at: [0, Y0 - 0.005, 0.64], parent: head, role: "jaw" } as any);

  const ell = (r: number[], rotY = 0, w = 10, h = 7) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(r[0], r[1], r[2]);
    g.rotateY(rotY);
    return g;
  };
  const P = (g: THREE.BufferGeometry, c: string, at: number[], bone: any) =>
    b.part(g, c, { at, bone } as any);

  // shell
  const A = 0.4, B = 0.17, C = 0.52, SY = Y0 - 0.02;
  const hemi = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  hemi.scale(A, B, C);
  P(hemi, "#6b6a2c", [0, SY, 0], body);
  P(ell([0.34, 0.06, 0.46], 0, 12, 6), "#e8d78a", [0, Y0 - 0.03, 0], body);
  P(ell([0.4, 0.03, 0.52], 0, 12, 5), "#5a3f22", [0, SY, 0], body);
  // heart notch lobes at back rim
  P(ell([0.12, 0.05, 0.1], 0, 8, 5), "#6b6a2c", [0.12, SY + 0.03, -0.46], body);
  P(ell([0.12, 0.05, 0.1], 0, 8, 5), "#6b6a2c", [-0.12, SY + 0.03, -0.46], body);

  const onShell = (x: number, z: number, k = 1.0) => {
    const t = 1 - (x / A) ** 2 - (z / C) ** 2;
    if (t <= 0.02) return null;
    const y = SY + B * Math.sqrt(t);
    const n = [x / A ** 2, (y - SY) / B ** 2, z / C ** 2];
    return { p: [x * k, y * k + (k === 1 ? 0 : 0), z * k], n };
  };
  const plate = (x: number, z: number, r: number, i: number) => {
    const h = onShell(x, z);
    if (!h) return;
    const col = i % 2 ? "#c58a3c" : "#8a8a35";
    const edge = "#4a2e17";
    const p = [h.p[0], h.p[1] + 0.003, h.p[2]];
    b.part(new THREE.CylinderGeometry(r * 1.12, r * 1.12, 0.012, 6), edge, { at: p, dir: h.n } as any);
    const q = [h.p[0] + h.n[0] * 0.003, h.p[1] + 0.009, h.p[2] + h.n[2] * 0.003];
    b.part(new THREE.CylinderGeometry(r * 0.9, r * 0.95, 0.014, 6), col, { at: q, dir: h.n } as any);
    b.part(new THREE.CylinderGeometry(r * 0.4, r * 0.45, 0.016, 6), i % 2 ? "#a96f2a" : "#6f7029", {
      at: [q[0], q[1] + 0.004, q[2]], dir: h.n,
    } as any);
  };
  [-0.3, -0.1, 0.1, 0.3].forEach((z, i) => plate(0, z, 0.085, i));
  [-0.24, -0.04, 0.17].forEach((z, i) => {
    plate(0.21, z, 0.08, i + 1);
    plate(-0.21, z, 0.08, i + 1);
  });
  [-0.12, 0.08, 0.26].forEach((z, i) => {
    plate(0.33, z - 0.02, 0.05, i);
    plate(-0.33, z - 0.02, 0.05, i);
  });
  // marginal scutes
  for (let i = 0; i < 22; i++) {
    const f = (i / 22) * Math.PI * 2;
    const E = 0.08;
    const x = A * Math.cos(f) * Math.cos(E) * 0.99, z = C * Math.sin(f) * Math.cos(E) * 0.99;
    const y = SY + B * Math.sin(E) + 0.005;
    const n = [x / A ** 2, 0.4, z / C ** 2];
    if (Math.abs(z + 0.46) < 0.12 && Math.abs(x) < 0.04) continue;
    b.part(new THREE.BoxGeometry(0.07, 0.02, 0.05), i % 2 ? "#4a2e17" : "#d8c47a", { at: [x, y, z], dir: n } as any);
  }

  // neck and head
  P(ell([0.085, 0.075, 0.12], 0, 8, 6), "#7d8040", [0, Y0 + 0.01, 0.46], neck);
  P(ell([0.095, 0.08, 0.115], 0, 9, 6), "#7d8040", [0, Y0 + 0.025, 0.6], head);
  P(ell([0.07, 0.05, 0.07], 0, 8, 5), "#8a8c4a", [0, Y0 + 0.035, 0.67], head);
  P(new THREE.BoxGeometry(0.075, 0.025, 0.07), "#d9c27a", [0, Y0 + 0.0, 0.7], head); // upper beak
  P(new THREE.ConeGeometry(0.03, 0.04, 4).rotateX(Math.PI / 2), "#c9a85a", [0, Y0 - 0.005, 0.74], head);
  P(new THREE.BoxGeometry(0.065, 0.016, 0.07), "#c9b36a", [0, Y0 - 0.022, 0.675], jaw);
  P(ell([0.05, 0.015, 0.05], 0, 6, 4), "#e8d9a0", [0, Y0 - 0.038, 0.64], jaw);
  // cream-edged scales
  [[0, 0.64], [0.04, 0.6], [-0.04, 0.6], [0, 0.57], [0.045, 0.655], [-0.045, 0.655]].forEach(([x, z], i) => {
    P(ell([0.03, 0.008, 0.028], 0, 6, 4), "#efe3b0", [x, Y0 + 0.098 - Math.abs(x) * 0.4 - (z > 0.62 ? 0.02 : 0), z], head);
    P(ell([0.022, 0.01, 0.02], 0, 6, 4), "#6f7a38", [x, Y0 + 0.103 - Math.abs(x) * 0.4 - (z > 0.62 ? 0.02 : 0), z], head);
  });
  // eyes
  for (const s of [1, -1]) {
    P(ell([0.022, 0.022, 0.022], 0, 6, 5), "#efe3b0", [s * 0.083, Y0 + 0.04, 0.645], head);
    P(ell([0.018, 0.02, 0.018], 0, 6, 5), "#1b120a", [s * 0.095, Y0 + 0.04, 0.65], head);
    P(ell([0.005, 0.005, 0.005], 0, 4, 3), "#ffffff", [s * 0.103, Y0 + 0.048, 0.66], head);
    P(ell([0.03, 0.007, 0.02], 0, 5, 3), "#efe3b0", [s * 0.085, Y0 + 0.07, 0.65], head); // brow
    P(ell([0.008, 0.006, 0.008], 0, 4, 3), "#3a3a1a", [s * 0.018, Y0 + 0.02, 0.735], head); // nostril
  }

  // flippers
  const flipper = (s: number, name: string, root: number[], len: number, wid: number, rot: number, col: string) => {
    const fl = b.joint(name + "1", { at: root, parent: body, role: "arm" } as any);
    const dx = Math.cos(rot) * len * 0.5, dz = -Math.sin(rot) * len * 0.5;
    const tip = b.joint(name + "2", { at: [root[0] + s * dx * 1.1, root[1] - 0.01, root[2] + dz * 1.1], parent: fl, role: "arm" } as any);
    const mid = [root[0] + s * dx, root[1] - 0.005, root[2] + dz];
    const r = s * rot;
    P(ell([len * 0.32, 0.016, wid], r, 8, 5), col, [root[0] + s * dx * 0.55, root[1], root[2] + dz * 0.55], fl);
    P(ell([len * 0.32, 0.013, wid * 0.75], r, 8, 5), col, [root[0] + s * dx * 1.45, root[1] - 0.01, root[2] + dz * 1.45], tip);
    // pale edge and claw/stripes
    P(ell([len * 0.5, 0.008, wid * 0.4], r, 8, 4), "#e8d78a", [mid[0], mid[1] - 0.012, mid[2]], fl);
    P(new THREE.ConeGeometry(0.012, 0.04, 4).rotateZ(-s * Math.PI / 2).rotateY(r), "#3a2a18",
      [root[0] + s * dx * 2.0, root[1] - 0.015, root[2] + dz * 2.0], tip);
    for (let k = 0; k < 3; k++) {
      const t = 0.5 + k * 0.45;
      P(ell([0.02, 0.006, 0.03], r, 5, 3), "#efe3b0", [root[0] + s * dx * t * 1.1, root[1] + 0.013, root[2] + dz * t * 1.1 + 0.01], k < 1 ? fl : tip);
    }
  };
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    flipper(s, "frontFlipper" + n, [s * 0.3, Y0 - 0.02, 0.24], 0.8, 0.075, 0.3, "#6f7438");
    flipper(s, "rearFlipper" + n, [s * 0.24, Y0 - 0.03, -0.38], 0.28, 0.065, 0.7, "#6f7438");
  }
  // tail
  const tail = b.joint("tail1", { at: [0, Y0 - 0.02, -0.5], parent: body, role: "tail" } as any);
  P(new THREE.ConeGeometry(0.035, 0.14, 5).rotateX(-Math.PI / 2), "#6f7438", [0, Y0 - 0.025, -0.57], tail);

  // remora
  const rem = b.joint("remora", { at: [0, 0.035, -0.02], parent: body } as any);
  P(ell([0.03, 0.028, 0.12], 0, 8, 5), "#5d6670", [0, 0.035, -0.02], rem);
  P(ell([0.025, 0.012, 0.07], 0, 8, 4), "#cfd5d8", [0, 0.015, -0.01], rem);
  P(ell([0.028, 0.008, 0.08], 0, 8, 4), "#2d343b", [0, 0.066, 0.0], rem);
  for (let k = 0; k < 4; k++)
    P(new THREE.BoxGeometry(0.05, 0.003, 0.004), "#aeb6bb", [0, 0.073, -0.03 + k * 0.02], rem);
  P(new THREE.ConeGeometry(0.035, 0.05, 4).rotateX(-Math.PI / 2).scale(0.3, 1, 1), "#4a525b", [0, 0.035, -0.17], rem);
  P(new THREE.BoxGeometry(0.004, 0.06, 0.04), "#4a525b", [0, 0.035, -0.19], rem);
  P(ell([0.006, 0.02, 0.025], 0, 4, 3), "#4a525b", [0.04, 0.02, -0.01], rem);
  P(ell([0.006, 0.02, 0.025], 0, 4, 3), "#4a525b", [-0.04, 0.02, -0.01], rem);
  for (const s of [1, -1]) P(ell([0.006, 0.006, 0.006], 0, 4, 3), "#0c0c0c", [s * 0.024, 0.04, 0.07], rem);

  return b.root;
}
```