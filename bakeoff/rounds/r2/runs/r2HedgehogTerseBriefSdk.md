```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Hedgehog",
  description: "A stylized low-poly hedgehog with banded spines, a pointed snout, a jaw, and four legs.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const r = rng(7);

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.07, -0.06] });
  const spine = b.joint("spine", { at: [0, 0.075, 0.0], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.07, 0.07], parent: spine });
  const head = b.joint("head", { at: [0, 0.06, 0.1], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.04, 0.12], parent: head });
  const tail = b.joint("tail1", { at: [0, 0.06, -0.13], parent: hips });

  const legs: Record<string, THREE.Vector3 | any> = {};
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    for (const [pos, z] of [["F", 0.06], ["B", -0.1]] as const) {
      const hip = b.joint(`hip${pos}${side}`, { at: [sx * 0.045, 0.05, z], parent: pos === "F" ? spine : hips });
      const foot = b.joint(`foot${pos}${side}`, { at: [sx * 0.05, 0.012, z + 0.005], parent: hip });
      legs[pos + side] = { hip, foot, sx, z };
    }
  }

  // Colours
  const DARK = "#4a3426", TAN = "#b58d5e", CREAM = "#e8d3ae", PINK = "#d9a08f", BLACK = "#1a1412", WHITE = "#ffffff";

  // Belly/body
  const c = new THREE.Vector3(0, 0.075, -0.03);
  const rad = new THREE.Vector3(0.09, 0.07, 0.115);
  b.part(new THREE.SphereGeometry(1, 12, 9), CREAM, { at: [0, 0.07, -0.02], scale: [0.082, 0.062, 0.108], bone: spine });
  b.part(new THREE.SphereGeometry(1, 12, 9), DARK, { at: [0, 0.085, -0.04], scale: [0.088, 0.062, 0.11], bone: spine });

  // Spines
  const cone = new THREE.ConeGeometry(0.007, 0.05, 4);
  let placed = 0, tries = 0;
  while (placed < 380 && tries < 5000) {
    tries++;
    const th = r() * Math.PI * 2;
    const y = r() * 1.15 - 0.15;
    const q = Math.sqrt(1 - Math.min(1, y * y));
    const d = new THREE.Vector3(Math.cos(th) * q, y, Math.sin(th) * q);
    if (d.z > 0.7 && d.y < 0.6) continue; // face opening
    if (d.y < -0.1 && Math.abs(d.x) < 0.5) continue;
    const p = c.clone().add(d.clone().multiply(rad));
    const n = d.clone().divide(rad).normalize();
    const dir = n.clone().add(new THREE.Vector3(0, 0.25, -0.45)).normalize();
    const len = 0.045 + r() * 0.015;
    const at = p.clone().addScaledVector(dir, len * 0.4);
    const col = placed % 3 === 0 ? CREAM : placed % 3 === 1 ? TAN : DARK;
    b.part(cone, col, { at: [at.x, at.y, at.z], dir: [dir.x, dir.y, dir.z], bone: spine });
    placed++;
  }

  // Head
  b.part(new THREE.SphereGeometry(1, 10, 8), TAN, { at: [0, 0.062, 0.115], scale: [0.05, 0.045, 0.058], bone: head });
  const snout = new THREE.ConeGeometry(0.036, 0.075, 7);
  snout.rotateX(Math.PI / 2);
  b.part(snout, CREAM, { at: [0, 0.055, 0.15], scale: [1, 0.8, 1], bone: head });
  b.part(new THREE.SphereGeometry(0.01, 8, 6), BLACK, { at: [0, 0.056, 0.19], bone: head });
  b.part(new THREE.BoxGeometry(0.04, 0.012, 0.05), PINK, { at: [0, 0.036, 0.145], bone: jaw });
  // forehead fringe
  for (let i = 0; i < 9; i++) {
    const a = -0.9 + i * 0.225;
    const x = Math.sin(a) * 0.045, z = 0.115 + Math.cos(a) * 0.01;
    b.part(new THREE.ConeGeometry(0.006, 0.035, 4), i % 2 ? DARK : TAN, {
      at: [x, 0.098, z], dir: [x * 4, 0.6, -0.5], bone: head });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 8, 6), BLACK, { at: [s * 0.03, 0.073, 0.15], bone: head });
    b.part(new THREE.SphereGeometry(0.003, 5, 4), WHITE, { at: [s * 0.033, 0.077, 0.157], bone: head });
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, { at: [s * 0.04, 0.09, 0.1], scale: [0.012, 0.016, 0.006], bone: head });
  }

  // Tail nub
  b.part(new THREE.ConeGeometry(0.01, 0.025, 5), DARK, { at: [0, 0.06, -0.14], dir: [0, 0, -1], bone: tail });

  // Legs
  for (const k of Object.keys(legs)) {
    const { hip, foot, sx, z } = legs[k];
    b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.04, 6), PINK, { at: [sx * 0.048, 0.03, z], bone: hip });
    b.part(new THREE.BoxGeometry(0.026, 0.012, 0.042), PINK, { at: [sx * 0.05, 0.006, z + 0.01], bone: foot });
    for (let t = -1; t <= 1; t++) {
      b.part(new THREE.BoxGeometry(0.005, 0.005, 0.01), BLACK, { at: [sx * 0.05 + t * 0.008, 0.004, z + 0.034], bone: foot });
    }
  }

  return b.root;
}
```