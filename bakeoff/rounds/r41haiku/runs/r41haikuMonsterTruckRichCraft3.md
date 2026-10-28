```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { cellPaint, pixelArt, pixelTexture, stepped, tileBox } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "monster-truck",
  description: "Pixel-art monster truck on four huge knobbly tyres, with a flame-painted bed, a glass cab and chrome stacks.",
};

export default function build() {
  const b = createBuilder({ name: "monster-truck" });

  // Pixel scale: one texel is 4 cm on the body and the cab.
  const TEXEL = 0.04;

  // Palette
  const RED = "#d62828";
  const RED_DARK = "#a31b1b";
  const FRAME = "#222831";
  const BUMPER = "#15151c";
  const RIM = "#f2c12e";
  const HUB = "#f5f5f0";
  const CHROME = "#c0c6d0";
  const LIGHT = "#ffe27a";

  // Textures
  const FLAME = pixelTexture(32, 16, (g) => {
    g.fill((x, y) => {
      if (y >= 9) return (x + y) % 4 < 2 ? "#ff5a2a" : "#ffb13b";
      if (y === 8) return "#ff8a2a";
      return x % 8 === 0 ? "#5c1018" : "#7a1620";
    });
  });

  const GLASS = pixelArt(
    [
      "kkkkkkkkkkkkkkkk",
      "kbbwwbbbbbbbbbbk",
      "kbwbbbbbbbbbbbbk",
      "kbbbbbbbbbbbbbbk",
      "kbbbbbbbbbbbbbbk",
      "kbbbbbbbbbbbwbbk",
      "kbbbbbbbbbbbbbbk",
      "kkkkkkkkkkkkkkkk",
    ],
    { k: "#15151c", b: "#3aa6d8", w: "#d8f4ff" },
  );

  const STAR = pixelArt(
    [
      "...yy...",
      "...yy...",
      "yyyyyyyy",
      ".yyyyyy.",
      "..yyyy..",
      ".yy..yy.",
      ".y....y.",
      "........",
    ],
    { y: "#ffd23f" },
  );

  // Tyres: pixel tread, a random mix of two blacks per cell
  const TYRE = cellPaint(0.06, (c) => (c.random(7) < 0.35 ? "#0b0b0f" : "#23232b"));

  // Skeleton: one hull joint, four wheel joints
  const hull = b.joint("hull", { at: [0, 1.25, 0] });

  const wheel = (name: string, x: number, z: number) => {
    const j = b.joint(name, { parent: hull, at: [x, 1.25, z] });
    const c: [number, number, number] = [x, 1.25, z];
    const side = Math.sign(x);
    // Tyre: 2.5 m across, 0.9 m wide, axle along X
    b.part(new THREE.CylinderGeometry(1.25, 1.25, 0.9, 18), TYRE, { bone: j, at: c, rotation: [0, 0, 90] });
    // Rim and hub
    b.part(new THREE.CylinderGeometry(0.72, 0.72, 0.92, 12), RIM, { bone: j, at: c, rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.96, 10), HUB, { bone: j, at: c, rotation: [0, 0, 90] });
    // Five lug nuts on the outer face
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const at: [number, number, number] = [x + side * 0.49, 1.25 + 0.45 * Math.cos(a), z + 0.45 * Math.sin(a)];
      b.part(new THREE.SphereGeometry(0.06, 6, 4), CHROME, { bone: j, at });
    }
    return j;
  };

  wheel("wheelFL", 1.45, 1.8);
  wheel("wheelFR", -1.45, 1.8);
  wheel("wheelRL", 1.45, -1.8);
  wheel("wheelRR", -1.45, -1.8);

  // Chassis frame
  b.part(new THREE.BoxGeometry(2.3, 0.35, 4.8), FRAME, { bone: hull, at: [0, 2.0, 0] });

  // Rear flame-painted bed
  b.part(tileBox([2.2, 1.6, 2.4], FLAME, TEXEL), "#ffffff", {
    bone: hull,
    at: [0, 2.85, -1.2],
    texture: FLAME,
  });

  // Cab
  b.part(new THREE.BoxGeometry(2.1, 1.4, 1.5), RED, { bone: hull, at: [0, 3.2, 0.9] });
  b.part(new THREE.BoxGeometry(2.2, 0.16, 1.6), RED_DARK, { bone: hull, at: [0, 4.02, 0.9] });

  // Windshield as a drawn card on the cab front
  b.part(new THREE.PlaneGeometry(1.6, 0.7), "#ffffff", {
    bone: hull,
    at: [0, 3.35, 1.66],
    dir: [0, 0, 1],
    axis: "z",
    texture: GLASS,
  });

  // Star badges on both doors
  b.part(new THREE.PlaneGeometry(0.35, 0.35), "#ffffff", {
    bone: hull,
    at: [1.065, 3.1, 0.9],
    dir: [1, 0, 0],
    axis: "z",
    texture: STAR,
  });
  b.part(new THREE.PlaneGeometry(0.35, 0.35), "#ffffff", {
    bone: hull,
    at: [-1.065, 3.1, 0.9],
    dir: [-1, 0, 0],
    axis: "z",
    texture: STAR,
  });

  // Hood
  b.part(new THREE.BoxGeometry(1.9, 0.45, 1.3), RED, { bone: hull, at: [0, 2.5, 2.2] });

  // Pixel-stepped grille, a rounded slot on the hood front
  const grilleOutline = stepped(
    [
      [-8, 8],
      [-8, 8],
      [-7, 7],
      [-7, 7],
      [-5, 5],
      [-3, 3],
    ],
    0.04,
    { rows: true },
  );
  b.part(
    new THREE.BoxGeometry(0.01, 0.01, 0.01),
    BUMPER,
    { bone: hull, at: [0, 2.3, 2.86] },
  );
  b.extrude(grilleOutline, {
    at: [0, 2.3, 2.86],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.1,
    color: BUMPER,
    bone: hull,
  });

  // Headlights
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8), LIGHT, {
      bone: hull,
      at: [s * 0.7, 2.6, 2.86],
      rotation: [90, 0, 0],
    });
  }

  // Bumpers
  b.part(new THREE.BoxGeometry(2.5, 0.25, 0.2), BUMPER, { bone: hull, at: [0, 1.6, 2.95] });
  b.part(new THREE.BoxGeometry(2.5, 0.25, 0.2), BUMPER, { bone: hull, at: [0, 1.6, -2.55] });

  // Chrome exhaust stacks with caps
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8), CHROME, { bone: hull, at: [s * 1.15, 3.4, 1.9] });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 8), BUMPER, { bone: hull, at: [s * 1.15, 4.19, 1.9] });
  }

  // Roof light bar
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(0.26, 0.1, 0.14), LIGHT, {
      bone: hull,
      at: [-0.6 + i * 0.4, 4.14, 1.4],
    });
  }

  return b.root;
}
```