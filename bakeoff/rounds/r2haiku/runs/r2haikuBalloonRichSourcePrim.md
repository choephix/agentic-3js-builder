```ts
import * as THREE from "three";
import { createBuilder, paint } from "agentic-3js-builder";

export const meta = {
  name: "Hot-air balloon",
  description:
    "A striped hot-air balloon about to take off: sunflower, tomato and sky-blue gores, a checked band, an orange burner, a wicker basket with sandbags and a pennant.",
};

// Envelope: centred on the axis, its base at y = 2.6 m.
const ENVELOPE_Y = 2.6;
const BAND_BOTTOM = 3.95;
const BAND_TOP = 4.5;
const GORES = 12;
const GORE_COLOURS = ["#f7c600", "#e0402a", "#4fb3e8"];
const BAND_COLOURS = ["#fbf6e6", "#1d3b6e"];

// Vertical gores in three colours, with a checked band round the middle. `p` is in model space.
const envelopePaint = paint((p) => {
  const turn = (Math.atan2(p.x, p.z) + Math.PI) / (2 * Math.PI);
  if (p.y > BAND_BOTTOM && p.y < BAND_TOP) {
    const cell = Math.floor(turn * 30);
    const row = Math.floor((p.y - BAND_BOTTOM) / 0.14);
    return BAND_COLOURS[(cell + row) % 2];
  }
  return GORE_COLOURS[Math.floor(turn * GORES) % 3];
});

// Wicker: a basket weave of two woven directions.
const weave = paint((p) => {
  const a = Math.floor((p.x + p.z) / 0.07);
  const b = Math.floor((p.x - p.z) / 0.07);
  return (a + b) & 1 ? "#a77238" : "#6e4620";
});

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon", paintSize: 1024 });
  b.joint("base", { at: [0, 0, 0] });
  b.joint("envelope", { at: [0, ENVELOPE_Y, 0], parent: "base" });

  // The envelope: a lathe of its profile (x = distance from the axis, y = height above its base).
  b.lathe(
    [
      [0, 0],
      [0.55, 0],
      [0.85, 0.3],
      [1.3, 0.7],
      [1.7, 1.5],
      [1.85, 2.3],
      [1.7, 3.0],
      [1.25, 3.6],
      [0.7, 4.0],
      [0.25, 4.15],
      [0, 4.2],
    ],
    {
      name: "envelope",
      color: envelopePaint,
      at: [0, ENVELOPE_Y, 0],
      segments: 20,
      bone: "envelope",
    },
  );

  // Burner: a dark body under the mouth, an orange glowing ring at the mouth.
  b.part(new THREE.CylinderGeometry(0.3, 0.26, 0.5, b.segments(10)), "#3a3a3a", {
    name: "burner",
    at: [0, 2.15, 0],
    bone: "base",
  });
  b.part(new THREE.CylinderGeometry(0.44, 0.38, 0.2, b.segments(12)), "#ff7a1a", {
    name: "burner-mouth",
    at: [0, 2.45, 0],
    bone: "base",
  });

  // Basket: a woven box with a rim.
  b.part(new THREE.BoxGeometry(1.3, 0.9, 0.85), weave, {
    name: "basket",
    at: [0, 0.45, 0],
    bone: "base",
  });
  b.part(new THREE.BoxGeometry(1.42, 0.1, 0.97), "#5b3a1e", {
    name: "basket-rim",
    at: [0, 0.95, 0],
    bone: "base",
  });

  // Burner struts from the rim up to the burner.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.rod([sx * 0.5, 0.95, sz * 0.3], [sx * 0.28, 1.9, sz * 0.16], 0.03, {
        name: "strut",
        color: "#2b2b2b",
        bone: "base",
      });
    }
  }

  // Ropes from the basket corners up to the envelope.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.rod([sx * 0.6, 0.95, sz * 0.4], [sx * 0.88, 3.4, sz * 0.88], 0.018, {
        name: "rope",
        color: "#7a5530",
        bone: "base",
      });
    }
  }

  // Sandbags hanging from the rim on both sides.
  const bags: Array<[number, number, number]> = [
    [0.8, 0.6, -0.15],
    [0.8, 0.5, 0.25],
    [-0.8, 0.56, 0.1],
  ];
  for (const [x, y, z] of bags) {
    b.rod([Math.sign(x) * 0.68, 0.95, z], [x, y + 0.14, z], 0.02, {
      name: "bag-strap",
      color: "#5b3a1e",
      bone: "base",
    });
    b.part(new THREE.SphereGeometry(0.16, b.segments(10), b.segments(7)), "#c8a46a", {
      name: "sandbag",
      at: [x, y, z],
      scale: [1.1, 0.85, 0.8],
      bone: "base",
    });
  }

  // Flag pole on the +X +Z corner, with a pennant.
  b.rod([0.7, 0.95, 0.45], [0.7, 1.95, 0.45], 0.015, {
    name: "flag-pole",
    color: "#e8e8e8",
    bone: "base",
  });
  b.slab(
    [
      [0.7, 1.95, 0.45],
      [0.7, 1.75, 0.45],
      [1.2, 1.85, 0.45],
    ],
    { name: "flag", color: "#e0402a", thickness: 0.01, bone: "base" },
  );

  return b.root;
}
```