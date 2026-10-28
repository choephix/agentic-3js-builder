```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Custom Chopper",
  description: "Blockout of a long-fork chopper motorbike: wheels, frame, tank, seat, bars, engine, exhaust.",
};

export default function build() {
  const b = createBuilder({ name: "chopper" });
  const body = b.joint("body", { at: [0, 0.5, 0] });
  const fork = b.joint("fork", { parent: body, at: [0, 0.75, 0.55], aim: [0, 0.3, 1.2] });
  const wheelF = b.joint("wheelF", { parent: fork, at: [0, 0.33, 1.45] });
  const wheelR = b.joint("wheelR", { parent: body, at: [0, 0.33, -0.85] });

  const TIRE = "#1b1d24", RIM = "#c9d3dc", FRAME = "#2b3a55", TANK = "#f08a1c",
    CHROME = "#9fb0c0", SEAT = "#3a2a22", ENG = "#59626e", GLOW = "#43c6ff";

  const X = [0, 0, 1] as const;
  for (const [w, r] of [[wheelF, 0.33], [wheelR, 0.36]] as const) {
    const at = w.at;
    b.part(new THREE.CylinderGeometry(r, r, 0.14, 14), TIRE, { bone: w, at, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.16, 10), RIM, { bone: w, at, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), CHROME, { bone: w, at, dir: [1, 0, 0] });
  }
  void X;

  // frame
  b.rod([0, 0.62, -0.75], [0, 0.95, 0.5], 0.04, FRAME, { bone: body });
  b.rod([0, 0.45, -0.1], [0, 0.4, 0.55], 0.035, FRAME, { bone: body });
  b.rod([0, 0.62, -0.75], [0, 0.45, -0.1], 0.035, FRAME, { bone: body });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 0.36, -0.85], [s * 0.1, 0.62, -0.7], 0.03, FRAME, { bone: body });
    b.rod([s * 0.09, 0.33, 1.45], [s * 0.09, 0.82, 0.58], 0.03, CHROME, { bone: fork });
    b.rod([s * 0.09, 0.33, -0.85], [s * 0.1, 0.45, -0.1], 0.03, FRAME, { bone: body });
  }

  // tank, seat, engine
  b.part(new THREE.SphereGeometry(0.5, 10, 8), TANK, { bone: body, at: [0, 1.0, 0.25], scale: [0.2, 0.18, 0.4] });
  b.part(new THREE.BoxGeometry(0.28, 0.08, 0.5), SEAT, { bone: body, at: [0, 0.85, -0.4] });
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.38), ENG, { bone: body, at: [0, 0.55, 0.15] });
  b.part(new THREE.BoxGeometry(0.24, 0.12, 0.2), GLOW, { bone: body, at: [0, 0.4, 0.2] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8), CHROME, { bone: body, at: [0, 0.58, -0.4], dir: [0, 0, 1] });

  // exhausts
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 0.5, 0.3], [s * 0.22, 0.4, -0.9], 0.04, CHROME, { bone: body });
  }

  // handlebars and headlight
  b.rod([-0.38, 1.12, 0.62], [0.38, 1.12, 0.62], 0.025, CHROME, { bone: fork });
  for (const s of [1, -1]) b.rod([s * 0.38, 1.12, 0.62], [s * 0.38, 1.1, 0.5], 0.03, SEAT, { bone: fork });
  b.rod([0, 0.82, 0.58], [0, 1.12, 0.62], 0.03, CHROME, { bone: fork });
  b.part(new THREE.SphereGeometry(0.09, 8, 6), GLOW, { bone: fork, at: [0, 0.95, 0.8] });

  return b.root;
}
```