```ts
import * as THREE from "three";
import { createBuilder, paint } from "agentic-3js-builder";

export const meta = {
  name: "Typewriter",
  description: "A cream-deck office typewriter: black body, rubber platen, paper sheet, pale keys and a red accent.",
};

export default function typewriter() {
  const b = createBuilder({ name: "typewriter" });

  // Root bone for the whole prop; every part below rides it.
  b.joint("body", { at: [0, 0, 0] });

  const BODY = "#2a2d33";
  const DECK = "#d8cdb0";
  const KEY = "#f1ebdc";
  const RED = "#b8322a";
  const CHROME = "#9aa0a6";
  const RUBBER = "#1b1b1b";
  const BRASS = "#c9a24a";

  // Main housing, a black box standing on four feet.
  b.part(new THREE.BoxGeometry(0.44, 0.11, 0.30), BODY, { at: [0, 0.085, -0.02] });

  // Cream keyboard deck sloping up toward the operator.
  b.part(new THREE.BoxGeometry(0.40, 0.02, 0.20), DECK, { at: [0, 0.145, 0.07] });

  // Chrome lip along the front of the deck.
  b.part(new THREE.BoxGeometry(0.40, 0.008, 0.01), CHROME, { at: [0, 0.13, 0.175] });

  // Red maker's panel on the front face.
  b.part(new THREE.BoxGeometry(0.16, 0.035, 0.01), RED, { at: [0, 0.07, 0.135] });

  // Four rubber feet.
  for (const x of [-0.18, 0.18]) {
    for (const z of [-0.12, 0.10]) {
      b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.03, b.segments(10)), RUBBER, {
        at: [x, 0.015, z],
      });
    }
  }

  // Carriage arms rising from the rear of the housing.
  for (const x of [-0.19, 0.19]) {
    b.part(new THREE.BoxGeometry(0.02, 0.10, 0.04), CHROME, { at: [x, 0.19, -0.14] });
  }

  // Rubber platen the paper wraps around.
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.42, b.segments(16)), RUBBER, {
    at: [0, 0.22, -0.14],
    rotation: [0, 0, 90],
  });

  // Brass platen knobs.
  for (const x of [-0.235, 0.235]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.025, b.segments(14)), BRASS, {
      at: [x, 0.22, -0.14],
      rotation: [0, 0, 90],
    });
  }

  // The sheet of paper, with painted text lines.
  const ink = paint((p) => {
    const row = (p.y * 38) % 1;
    const inText = p.x > -0.08 && p.x < 0.08 && row < 0.14;
    return inText ? "#4a4640" : "#f7f4ea";
  });
  b.part(new THREE.BoxGeometry(0.22, 0.26, 0.004), ink, {
    at: [0, 0.36, -0.15],
    rotation: [-8, 0, 0],
  });

  // Keys: four staggered rows on the deck.
  const keyGeometry = new THREE.BoxGeometry(0.026, 0.014, 0.026);
  const rows = [
    { z: 0.02, n: 10 },
    { z: 0.055, n: 11 },
    { z: 0.09, n: 11 },
    { z: 0.125, n: 10 },
  ];
  for (const row of rows) {
    for (let i = 0; i < row.n; i++) {
      const x = (i - (row.n - 1) / 2) * 0.034;
      b.part(keyGeometry, KEY, { at: [x, 0.165, row.z] });
    }
  }

  // Space bar in red.
  b.part(new THREE.BoxGeometry(0.14, 0.014, 0.026), RED, { at: [0, 0.165, 0.158] });

  // Carriage return lever on the right side, drawn as a tube.
  b.rod([0.21, 0.13, 0.0], [0.26, 0.22, 0.06], 0.007, { color: RED, name: "return-lever" });

  return b.root;
}
```