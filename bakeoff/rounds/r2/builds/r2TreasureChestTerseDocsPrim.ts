import * as THREE from "three";
import { createBuilder, paint, stripes, grain, mottle } from "../../../../src/index";

export const meta = {
  name: "Treasure Chest",
  description: "Iron-banded wooden treasure chest with an open lid, gold coins and gems spilling out.",
};

export default function build() {
  const b = createBuilder({ name: "chest" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: base, at: [0, 0.5, -0.3], dir: [1, 0, 0] });

  const WOOD = grain("#7a4a24", "#5e3818", { size: 0.04, axis: "x" });
  const WOOD2 = grain("#8a5628", "#6a4020", { size: 0.04, axis: "x" });
  const IRON = "#3a3d46";
  const GOLD = "#f2c230";
  const GOLD2 = "#d99a14";
  const DARK = "#1c130c";
  const RED = "#d02840";
  const BLUE = "#2f8fe0";
  const GREEN = "#2fc070";

  // body (width 0.9 x, depth 0.6 z, height 0.5)
  b.part(new THREE.BoxGeometry(0.9, 0.46, 0.6), WOOD, { bone: base, at: [0, 0.25, 0] });
  // interior dark and gold pile
  b.part(new THREE.BoxGeometry(0.8, 0.02, 0.5), DARK, { bone: base, at: [0, 0.485, 0] });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 4), DARK, { bone: base, at: [0, 0.01, 0] });
  // base rim planks
  b.part(new THREE.BoxGeometry(0.94, 0.05, 0.64), IRON, { bone: base, at: [0, 0.025, 0] });
  b.part(new THREE.BoxGeometry(0.94, 0.04, 0.64), IRON, { bone: base, at: [0, 0.49, 0] });
  // gold pile (open chest)
  const pile = new THREE.SphereGeometry(0.36, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  pile.scale(1.1, 0.35, 0.7);
  b.part(pile, GOLD, { bone: base, at: [0, 0.48, 0], flat: true });

  // vertical bands and corner posts
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.06, 0.5, 0.06), IRON, { bone: base, at: [sx * 0.45, 0.25, sz * 0.3] });
      b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD2, { bone: base, at: [sx * 0.45, 0.5, sz * 0.3] });
    }
    b.part(new THREE.BoxGeometry(0.1, 0.44, 0.02), IRON, { bone: base, at: [sx * 0.22, 0.25, 0.305] });
    for (const ry of [0.1, 0.4]) {
      b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), GOLD2, {
        bone: base, at: [sx * 0.22, ry, 0.318], dir: [0, 0, 1],
      });
    }
  }

  // lock plate
  b.part(new THREE.BoxGeometry(0.12, 0.14, 0.02), GOLD2, { bone: base, at: [0, 0.38, 0.31] });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 6), DARK, { bone: base, at: [0, 0.39, 0.325], dir: [0, 0, 1] });
  b.part(new THREE.BoxGeometry(0.014, 0.05, 0.025), DARK, { bone: base, at: [0, 0.355, 0.325] });

  // lid: opened ~100 degrees about hinge at back top edge
  const lidGroup = (y: number, z: number) => [0, y, z] as [number, number, number];
  const lidHalf = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 10, 1, false, 0, Math.PI);
  lidHalf.rotateZ(Math.PI / 2);
  lidHalf.rotateX(-Math.PI / 2);
  // After rotations, arc spans over +Y and +Z side relative to hinge; build in lid local then pose
  const lidArc = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 10, 1, false, -Math.PI / 2, Math.PI);
  lidArc.rotateZ(Math.PI / 2); // axis along X
  // arc faces +Y after: theta -90..90 around Y originally -> check by posing visually: put center at lid+z
  b.part(lidArc, WOOD2, { bone: lid, at: [0, 0.0, 0.3], rotation: [0, 0, 0], flat: true });
  // lid end caps (half discs)
  for (const sx of [-1, 1]) {
    const cap = new THREE.CircleGeometry(0.3, 10, 0, Math.PI);
    b.part(cap, WOOD, { bone: lid, at: [sx * 0.45, 0, 0.3], dir: [sx, 0, 0], axis: "z", up: [0, 1, 0] });
  }
  // lid bands
  for (const sx of [-1, 1]) {
    const band = new THREE.CylinderGeometry(0.31, 0.31, 0.1, 10, 1, true, -Math.PI / 2, Math.PI);
    band.rotateZ(Math.PI / 2);
    b.part(band, IRON, { bone: lid, at: [sx * 0.22, 0, 0.3], flat: true });
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.62), IRON, { bone: lid, at: [sx * 0.22, 0.0, 0.0] });
  }
  b.part(new THREE.BoxGeometry(0.94, 0.04, 0.04), IRON, { bone: lid, at: [0, 0.0, 0.62] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.96, 6), IRON, { bone: lid, at: [0, 0, 0], dir: [1, 0, 0] });
  void lidGroup; void lidHalf; void stripes; void mottle; void paint;

  // open the lid
  b.pose(lid, { axis: [1, 0, 0], deg: -110 });

  // coins scattered on pile and floor
  const r = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < 22; i++) {
    const a = r() * Math.PI * 2, d = r() * 0.28;
    const g = new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8);
    b.part(g, i % 3 ? GOLD : GOLD2, {
      bone: base, at: [Math.cos(a) * d * 1.3, 0.56 - d * 0.35 + r() * 0.03, Math.sin(a) * d * 0.8],
      rotation: [r() * 60 - 30, r() * 180, r() * 60 - 30], flat: true,
    });
  }
  for (let i = 0; i < 9; i++) {
    const g = new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8);
    b.part(g, GOLD, {
      bone: base, at: [-0.3 + r() * 0.8, 0.006, 0.4 + r() * 0.3],
      rotation: [0, r() * 180, 0], flat: true,
    });
  }
  // gems
  const gems: [string, number[]][] = [
    [RED, [-0.15, 0.6, 0.05]], [BLUE, [0.18, 0.6, -0.05]], [GREEN, [0.02, 0.62, -0.12]], [RED, [0.5, 0.03, 0.55]],
  ];
  for (const [c, p] of gems) {
    b.part(new THREE.OctahedronGeometry(0.05, 0), c, { bone: base, at: [p[0], p[1], p[2]], flat: true });
  }
  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.1), DARK, { bone: base, at: [sx * 0.4, 0.0, sz * 0.25] });

  // lift model so it rests on floor: feet at y~0 centred; base box starts at 0.02
  return b.root;
}
