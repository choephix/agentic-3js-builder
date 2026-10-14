```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "moon jellyfish",
  description:
    "A drifting moon jellyfish: pale translucent-blue bell with four pink horseshoe gonads, a frilly rim of fine tentacles and four ruffled pearly oral arms, lit softly from within.",
};

export default function build() {
  const b = createBuilder({ name: "moon-jellyfish" });
  const R = rng(11);

  // Bell centre. The jelly floats, so its trailing arms keep it off the ground.
  const CY = 1.9;
  const bell = b.joint("bell", { at: [0, CY, 0] });

  // Bell dome: a half sphere flattened vertically, opening downward.
  const dome = new THREE.SphereGeometry(0.35, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 0.6, 1);
  b.part(dome, "#8fd3ff", { at: [0, CY, 0], bone: bell });

  // Lilac rim band at the bell's opening.
  const rimBand = new THREE.TorusGeometry(0.35, 0.02, 8, 36);
  rimBand.rotateX(Math.PI / 2);
  b.part(rimBand, "#e0ccff", { at: [0, CY, 0], bone: bell });

  // Four pink horseshoe gonads, pressed onto the outside of the dome.
  const phi = 0.8;
  for (let i = 0; i < 4; i++) {
    const th = (i * Math.PI) / 2;
    const horse = new THREE.TorusGeometry(0.1, 0.018, 6, 14, Math.PI * 1.4);
    horse.rotateZ(-1.2 * Math.PI); // open gap faces the rim
    horse.rotateX(-(Math.PI / 2 - phi)); // lie on the dome at polar angle phi
    horse.rotateY(th); // spread around the bell
    const p: [number, number, number] = [
      0.37 * Math.sin(phi) * Math.sin(th),
      CY + 0.21 * Math.cos(phi) + 0.02 * Math.cos(phi),
      0.37 * Math.sin(phi) * Math.cos(th),
    ];
    b.part(horse, "#ff6fae", { at: p, bone: bell });
  }

  // Frilly rim: fine tentacles hanging from the bell edge, slightly splayed.
  const N = 40;
  for (let k = 0; k < N; k++) {
    const th = (k / N) * Math.PI * 2;
    const len = 0.08 + R() * 0.05;
    const tent = new THREE.CylinderGeometry(0.007, 0.003, len, 4, 1);
    tent.translate(0, -len / 2, 0); // anchor top at origin
    tent.rotateX(-0.45); // splay outward
    tent.rotateY(th);
    const col = k % 2 === 0 ? "#e6f6ff" : "#d7c6ff";
    b.part(tent, col, { at: [0.35 * Math.sin(th), CY, 0.35 * Math.cos(th)], bone: bell });
  }

  // Oral arms: four long pearly arms trailing below the bell.
  // Shared parametric path so the ruffles sit exactly on the arm.
  const armPoint = (i: number, t: number): [number, number, number] => {
    const a = armAngle(i, t);
    const r = 0.1 + 0.2 * t;
    const y = CY - 0.02 - 0.92 * t;
    return [r * Math.sin(a), y, r * Math.cos(a)];
  };

  for (let i = 0; i < 4; i++) {
    const pts: [number, number, number][] = [];
    for (let j = 0; j <= 7; j++) pts.push(armPoint(i, j / 7));

    const chain = b.chain(`oral${i}`, pts);
    b.sweep(chain, 0.022, { color: "#f1ecff" });

    // Ruffles: flattened frills spaced along the arm, alternating lilac and pearl.
    for (let k = 0; k < 14; k++) {
      const t = (k + 0.5) / 14;
      const ang = armAngle(i, t);
      const frill = new THREE.SphereGeometry(0.03, 6, 4);
      frill.scale(0.9, 0.35, 2.0); // long axis along local Z
      frill.rotateY(ang); // long axis points radially
      const col = k % 2 === 0 ? "#c9a8ff" : "#f7f2ff";
      b.part(frill, col, { at: armPoint(i, t) });
    }
  }

  // Inner glow: a soft light sitting inside the bell.
  const glow = new THREE.PointLight("#bfe9ff", 1.5, 1.5, 2);
  glow.position.set(0, CY - 0.05, 0);
  bell.add(glow);

  return b.root;
}

// Arm sway angle, shared by the arm chain and its ruffles.
function armAngle(i: number, t: number): number {
  const base = (i * Math.PI) / 2 + Math.PI / 4;
  return base + 0.35 * Math.sin(4 * Math.PI * t + i * 1.3) * t;
}
```