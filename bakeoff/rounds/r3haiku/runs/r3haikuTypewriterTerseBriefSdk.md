```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "typewriter",
  description: "A boxy desktop typewriter with a rubber platen, chrome carriage arms, a sloped key deck and lettered keys.",
};

// Height of the sloped key deck's top surface at a given depth (z).
// The deck is rotated 0.25 rad about X, so its top falls toward the front.
const DECK_TILT = 0.25;
const deckY = (z: number) => 0.1907 - Math.tan(DECK_TILT) * (z - 0.0737);

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  b.joint("base", { at: [0, 0, 0] });

  const BODY = "#1f2226";
  const DECK = "#2c3036";
  const KEY = "#f2ead6";
  const KEY_DOT = "#3a3632";
  const CHROME = "#b9bec7";
  const RUBBER = "#222222";
  const RED = "#c8412b";
  const PAPER = "#fbf7ec";
  const FOOT = "#111111";

  // Main housing
  b.part(new THREE.BoxGeometry(0.44, 0.12, 0.34), BODY, { at: [0, 0.10, 0] });

  // Feet, touching the floor
  for (const x of [-0.19, 0.19]) {
    for (const z of [-0.14, 0.14]) {
      b.part(new THREE.BoxGeometry(0.05, 0.04, 0.05), FOOT, { at: [x, 0.02, z] });
    }
  }

  // Chrome side trims
  for (const x of [-0.222, 0.222]) {
    b.part(new THREE.BoxGeometry(0.006, 0.05, 0.30), CHROME, { at: [x, 0.11, 0] });
  }

  // Sloped key deck, front lower than back
  const deck = new THREE.BoxGeometry(0.42, 0.03, 0.20);
  deck.rotateX(DECK_TILT);
  b.part(deck, DECK, { at: [0, 0.175, 0.07] });

  // Rows of keys on the deck, each tilted to lie flat on the slope
  const rows: { z: number; offset: number; count: number }[] = [
    { z: 0.02, offset: 0.0, count: 10 },
    { z: 0.06, offset: 0.018, count: 10 },
    { z: 0.10, offset: 0.036, count: 10 },
  ];
  for (const row of rows) {
    const y = deckY(row.z);
    for (let i = 0; i < row.count; i++) {
      const x = -0.162 + row.offset + i * 0.036;
      const cap = new THREE.BoxGeometry(0.026, 0.016, 0.026);
      cap.rotateX(DECK_TILT);
      b.part(cap, KEY, { at: [x, y + 0.008, row.z] });

      const dot = new THREE.BoxGeometry(0.010, 0.003, 0.010);
      dot.rotateX(DECK_TILT);
      b.part(dot, KEY_DOT, { at: [x, y + 0.0175, row.z - 0.002] });
    }
  }

  // Space bar
  const zSpace = 0.14;
  const space = new THREE.BoxGeometry(0.16, 0.016, 0.026);
  space.rotateX(DECK_TILT);
  b.part(space, KEY, { at: [0, deckY(zSpace) + 0.008, zSpace] });

  // Platen housing sitting on the rear of the body
  b.part(new THREE.BoxGeometry(0.40, 0.06, 0.10), BODY, { at: [0, 0.19, -0.12] });

  // Chrome carriage arms rising from the housing
  for (const x of [-0.21, 0.21]) {
    b.part(new THREE.BoxGeometry(0.02, 0.14, 0.08), CHROME, { at: [x, 0.29, -0.13] });
  }

  // Rubber platen roller along X
  const roller = new THREE.CylinderGeometry(0.028, 0.028, 0.40, 20);
  roller.rotateZ(Math.PI / 2);
  b.part(roller, RUBBER, { at: [0, 0.36, -0.13] });

  // Roller end caps in chrome
  for (const x of [-0.205, 0.205]) {
    const cap = new THREE.CylinderGeometry(0.034, 0.034, 0.012, 16);
    cap.rotateZ(Math.PI / 2);
    b.part(cap, CHROME, { at: [x, 0.36, -0.13] });
  }

  // Paper sheet wrapped over the roller and rising up
  const paper = new THREE.BoxGeometry(0.22, 0.14, 0.004);
  paper.rotateX(-0.08);
  b.part(paper, PAPER, { at: [0, 0.43, -0.135] });

  // Line-space lever (left) and carriage-return lever (right) in red
  for (const x of [-0.235, 0.235]) {
    const lever = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 10);
    lever.rotateZ(Math.PI / 2);
    b.part(lever, RED, { at: [x, 0.2, -0.10] });
  }

  // Small chrome bell on the carriage arm
  const bell = new THREE.SphereGeometry(0.018, 12, 8);
  b.part(bell, CHROME, { at: [0.21, 0.37, -0.20] });

  return b.root;
}
```