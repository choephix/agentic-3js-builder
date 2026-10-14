```ts
import * as THREE from "three";
import { createBuilder, paint, mottle, rng } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Island",
  description: "A striped lighthouse with a gallery and glass lantern room, a keeper's hut and a jetty on a tiny rocky island.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lighthouse_island" });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);

  // ---- sea and island ----
  b.lathe([[0, 0], [9, 0], [9, 0.3], [0, 0.3]], {
    color: mottle("#2f7fa6", "#4aa0c4", { size: 1.6, seed: 2 }),
    at: [0, 0, 0],
    segments: 24,
    name: "sea",
  });
  b.lathe([[5.7, 0.28], [7.4, 0.28], [7.4, 0.34], [5.7, 0.34]], {
    color: "#e8f4f7",
    at: [0, 0, 0],
    segments: 24,
    name: "foam",
  });

  const grass = mottle("#5f8f3c", "#80ad4c", { size: 0.8, seed: 4 });
  const rock = mottle("#7b7468", "#575149", { size: 0.9, seed: 3 });
  const islandPaint = paint((p, n) => {
    if (p.y < 0.65) return "#d8c590";
    if (p.y > 2.0 && n.y > 0.5) return grass;
    return rock;
  });
  b.lathe(
    [[0, 0.1], [6.5, 0.1], [6.2, 0.6], [5.2, 1.4], [3.8, 2.2], [2.8, 2.5], [0, 2.6]],
    { color: islandPaint, at: [0, 0, 0], segments: 10, spin: 8, name: "island" },
  );

  // shore rocks
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + rand() * 0.5;
    const r = 5.6 + rand() * 1.6;
    const s = 0.35 + rand() * 0.55;
    b.part(new THREE.DodecahedronGeometry(s, 0), i % 3 ? "#6d675f" : "#8a847a", {
      at: [Math.sin(a) * r, 0.35 + s * 0.2, Math.cos(a) * r],
      rotation: [rand() * 90, rand() * 180, rand() * 90],
      scale: [1, 0.7 + rand() * 0.3, 1],
      flat: true,
      name: "rock",
    });
  }

  // ---- tower ----
  const base = 2.5;
  const H = 9;
  const rAt = (y: number) => 1.6 - 0.65 * ((y - base) / H);
  b.lathe([[0, 0], [2.0, 0], [2.0, 0.35], [1.75, 0.55], [0, 0.55]], {
    color: "#8a857b", at: [0, base - 0.1, 0], segments: 16, name: "plinth",
  });
  const bands = paint((p) => (Math.floor((p.y - base) / 1.5) % 2 === 0 ? "#f1ede4" : "#c7352e"));
  b.lathe([[0, 0], [1.6, 0], [0.95, H], [0, H]], {
    color: bands, at: [0, base, 0], segments: 16, name: "tower",
  });

  // door
  b.part(new THREE.BoxGeometry(0.8, 1.3, 0.3), "#8a857b", { at: [0, base + 0.75, 1.5], name: "doorFrame" });
  b.part(new THREE.BoxGeometry(0.62, 1.15, 0.2), "#5a3a22", { at: [0, base + 0.7, 1.62], name: "door" });
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.2, 10), "#5a3a22", {
    at: [0, base + 1.28, 1.62], rotation: [90, 0, 0], name: "doorArch",
  });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), "#e0b84a", { at: [0.2, base + 0.7, 1.74], name: "knob" });

  // windows
  const wins: Array<[number, number]> = [[5.0, 90], [6.8, 210], [8.4, 330], [10.1, 90]];
  for (const [y, deg] of wins) {
    const th = (deg * Math.PI) / 180;
    const r = rAt(y) - 0.02;
    b.part(new THREE.BoxGeometry(0.4, 0.62, 0.2), "#f1ede4", {
      at: [Math.sin(th) * r, y, Math.cos(th) * r], rotation: [0, deg, 0], name: "windowFrame",
    });
    b.part(new THREE.BoxGeometry(0.26, 0.48, 0.2), "#22344a", {
      at: [Math.sin(th) * (r + 0.04), y, Math.cos(th) * (r + 0.04)], rotation: [0, deg, 0], name: "window",
    });
  }

  // gallery
  const gy = base + H;
  b.lathe([[0, 0], [1.05, 0], [1.95, 0.3], [1.95, 0.4], [0, 0.4]], {
    color: "#3b3f48", at: [0, gy, 0], segments: 16, name: "gallery",
  });
  const railY = gy + 0.4;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.06, 0.8, 0.06), "#2a2d34", {
      at: [Math.sin(a) * 1.85, railY + 0.4, Math.cos(a) * 1.85], name: "railPost",
    });
  }
  b.part(new THREE.TorusGeometry(1.85, 0.045, 5, 24), "#2a2d34", {
    at: [0, railY + 0.8, 0], rotation: [90, 0, 0], name: "railTop",
  });
  b.part(new THREE.TorusGeometry(1.85, 0.03, 5, 24), "#2a2d34", {
    at: [0, railY + 0.4, 0], rotation: [90, 0, 0], name: "railMid",
  });

  // lantern room
  const ly = railY;
  b.lathe([[0, 0], [1.0, 0], [1.0, 0.15], [0, 0.15]], { color: "#c7352e", at: [0, ly - 0.0, 0], segments: 8, name: "lanternBase" });
  b.part(new THREE.CylinderGeometry(0.85, 0.85, 1.3, 8), "#bfe6f0", { at: [0, ly + 0.8, 0], name: "glass" });
  b.part(new THREE.SphereGeometry(0.38, 8, 6), "#fff3a0", { at: [0, ly + 0.8, 0], name: "light" });
  b.part(new THREE.CylinderGeometry(0.1, 0.18, 0.5, 6), "#e0b84a", { at: [0, ly + 0.4, 0], name: "lamp" });
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.08, 1.35, 0.08), "#2a2d34", {
      at: [Math.sin(a) * 0.9, ly + 0.8, Math.cos(a) * 0.9], rotation: [0, (a * 180) / Math.PI, 0], name: "mullion",
    });
  }
  b.lathe([[0, 0], [1.1, 0], [1.1, 0.12], [0, 0.12]], { color: "#2a2d34", at: [0, ly + 1.45, 0], segments: 8, name: "lanternRing" });
  b.lathe([[0, 0], [1.25, 0], [0.06, 0.95], [0, 0.95]], {
    color: "#c7352e", at: [0, ly + 1.57, 0], segments: 8, name: "roof",
  });
  b.part(new THREE.SphereGeometry(0.13, 6, 4), "#e0b84a", { at: [0, ly + 2.55, 0], name: "ball" });
  b.rod([0, ly + 2.6, 0], [0, ly + 3.05, 0], 0.025, { color: "#2a2d34", name: "rod" });

  // ---- keeper's hut ----
  const hx = -3.3;
  const hz = 0.9;
  b.part(new THREE.BoxGeometry(1.7, 2.3, 1.4), "#efe7d6", { at: [hx, 2.75, hz], name: "hut" });
  b.extrude([[-0.9, 0], [0.9, 0], [0, 0.8]], {
    color: "#8a3a2a", at: [hx, 3.9, hz], thickness: 2.0, name: "hutRoof",
  });
  b.part(new THREE.BoxGeometry(0.45, 0.9, 0.1), "#5a3a22", { at: [hx + 0.2, 3.0, hz + 0.72], name: "hutDoor" });
  b.part(new THREE.BoxGeometry(0.4, 0.35, 0.1), "#22344a", { at: [hx - 0.5, 3.3, hz + 0.72], name: "hutWindow" });
  b.part(new THREE.BoxGeometry(0.3, 0.9, 0.3), "#7b7468", { at: [hx - 0.55, 4.3, hz - 0.2], name: "chimney" });

  // ---- jetty ----
  b.part(new THREE.BoxGeometry(1.1, 0.12, 3.8), "#8b6a45", { at: [2.8, 0.7, 7.1], name: "deck" });
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.BoxGeometry(1.14, 0.03, 0.05), "#5c4630", { at: [2.8, 0.77, 5.4 + i * 0.5], name: "plank" });
  }
  for (const zz of [5.4, 6.7, 8.0, 8.9]) {
    for (const xx of [2.3, 3.3]) {
      b.part(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6), "#5c4630", { at: [xx, 0.35, zz], name: "post" });
    }
  }

  // a few grass tufts / bushes on the island
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const r = 2.9 + rand() * 0.6;
    b.part(new THREE.IcosahedronGeometry(0.28 + rand() * 0.15, 0), "#4a7a30", {
      at: [Math.sin(a) * r, 2.4, Math.cos(a) * r], flat: true, name: "bush",
    });
  }

  return b.root;
}
```