import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Octopus",
  description: "Stylized red octopus with a bulbous mantle, eight spread arms with suckers, and rigged eyes and jaw.",
};

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const R = rng(7);
  const skin = "#c8452f";
  const belly = "#f0b49a";
  const dark = "#7d2418";

  const root = b.joint("mantle", { at: [0, 0.22, 0] });

  // Body: mantle and head
  const spine = b.chain("body", [[0, 0.22, 0.02], [0, 0.42, -0.04], [0, 0.66, -0.16]], {
    parent: root,
    role: "spine",
  });
  const body = b.sweep(spine, {
    radius: (t: number) => 0.2 + 0.1 * Math.sin(Math.min(1, t * 1.2) * Math.PI * 0.85) + 0.02,
    color: skin,
    sides: 10,
  });
  const surf = b.surface(body);

  // Eyes
  for (const s of [1, -1]) {
    const hit = surf.nearest([s * 0.22, 0.38, 0.17]);
    b.stick(new THREE.SphereGeometry(0.06, 8, 6), "#f4e9c8", hit);
    const pupil = surf.nearest([s * 0.26, 0.38, 0.22]);
    b.stick(new THREE.BoxGeometry(0.05, 0.02, 0.02), "#111111", pupil);
    const brow = surf.nearest([s * 0.2, 0.46, 0.17]);
    b.stick(new THREE.BoxGeometry(0.13, 0.025, 0.04), dark, brow);
  }

  // Mantle spots
  const spotHits = surf.scatter(26);
  spotHits.forEach((h: any, i: number) => {
    if (i % 2 === 0) b.stick(new THREE.CylinderGeometry(0.02 + R() * 0.02, 0.02, 0.015, 6), dark, h);
  });

  // Beak jaws
  const jawJ = b.joint("jaw", { at: [0, 0.14, 0.2], parent: root });
  b.stick(new THREE.ConeGeometry(0.03, 0.06, 5), "#3a2a20", surf.nearest([0, 0.2, 0.2]));
  b.stick(new THREE.ConeGeometry(0.025, 0.05, 5), "#3a2a20", surf.nearest([0, 0.14, 0.2]));
  void jawJ;

  // Arms
  const N = 8;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.2;
    const dx = Math.sin(a), dz = Math.cos(a);
    const curlSide = i % 2 ? 1 : -1;
    const pts: number[][] = [];
    const len = 0.85 + R() * 0.15;
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      const r = 0.12 + t * len;
      const sway = Math.sin(t * 3.0) * 0.12 * curlSide;
      const px = dx * r + dz * sway;
      const pz = dz * r - dx * sway;
      const py = 0.2 * (1 - t) ** 2 + 0.035 * (1 - (1 - t) ** 2) + (t > 0.85 ? (t - 0.85) * 0.5 : 0);
      pts.push([px, Math.max(py, 0.03) + (k === 0 ? 0.02 : 0), pz]);
    }
    const ch = b.chain("arm" + i, pts, { parent: root, role: "tentacle" });
    const tube = b.sweep(ch, {
      radius: (t: number) => 0.11 * (1 - t) + 0.015,
      color: skin,
      sides: 7,
    });
    b.along(tube, 7, (at: any) => {
      b.stick(new THREE.CylinderGeometry(0.02, 0.025, 0.012, 6), belly, at);
    });
  }

  return b.root;
}
