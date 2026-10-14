import * as THREE from "three";
import { countershade, createBuilder, frame, gradient, rng, stripes } from "../../../../src/index";

export const meta = {
  name: "Lighthouse on a tiny island",
  description: "A red-and-white striped lighthouse with a lit lantern room, a keeper's cottage and rocks on a small grassy island.",
};

const IRON = "#2b2b2e";

export default function lighthouse() {
  const b = createBuilder({ name: "lighthouse", detail: 1, paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });

  // Sea: a flat disc just under the island's base.
  b.part(new THREE.CircleGeometry(16, 40), "#2c6e8f", {
    at: [0, -0.12, 0],
    rotation: [-90, 0, 0],
  });

  // The island: a squat turned rock, grass on top and rock on the sides.
  b.lathe(
    [
      [0, -0.25],
      [7.6, -0.25],
      [9.2, -0.05],
      [10.0, 0.5],
      [9.4, 1.2],
      [7.2, 1.7],
      [4.2, 2.0],
      [0, 2.1],
    ],
    {
      name: "island",
      color: countershade("#6e9a4c", "#7d7266", { level: 0.45, soft: 0.3 }),
      at: [0, 0, 0],
      segments: 10,
    },
  );

  // Rocks around the shoreline.
  const random = rng(7);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + random() * 0.5;
    const d = 9.8 + random() * 1.0;
    const r = 0.35 + random() * 0.25;
    b.part(new THREE.DodecahedronGeometry(r, 0), i % 2 ? "#8a847b" : "#6f6a64", {
      at: [Math.sin(a) * d, 0.15, Math.cos(a) * d],
      rotation: [random() * 360, random() * 360, random() * 360],
    });
  }

  // Shrubs.
  const bush = (x: number, y: number, z: number, r: number) =>
    b.part(new THREE.SphereGeometry(r, b.segments(8), b.segments(6)), "#4f7d3a", { at: [x, y, z] });
  bush(-2.8, 2.0, 2.2, 0.8);
  bush(-4.6, 1.9, -1.6, 0.6);
  bush(6.0, 1.8, 1.5, 0.7);

  // Keeper's cottage.
  const cx = 4.2;
  const cz = -2.6;
  b.part(new THREE.BoxGeometry(3, 2.2, 2.6), "#efe6cf", { at: [cx, 3.0, cz] });
  b.part(new THREE.ConeGeometry(2.2, 1.6, 4), "#7a2e26", {
    at: [cx, 4.8, cz],
    rotation: [0, 45, 0],
  });
  b.part(new THREE.BoxGeometry(0.6, 1.2, 0.08), "#4a2c1d", { at: [cx, 2.45, -1.27] });
  b.part(new THREE.BoxGeometry(0.6, 0.6, 0.08), "#ffd98a", { at: [cx - 1.0, 3.2, -1.27] });
  b.part(new THREE.BoxGeometry(0.6, 0.6, 0.08), "#ffd98a", { at: [cx + 1.0, 3.2, -1.27] });

  // The tower: a tapered turned body with red-and-white bands.
  b.lathe(
    [
      [0, -0.4],
      [2.1, -0.4],
      [2.0, 0.5],
      [1.6, 6.0],
      [1.3, 10.8],
      [0, 10.8],
    ],
    {
      name: "tower",
      color: stripes("#f4f1ea", "#c8362b", { size: 2.4, axis: "y", width: 0.5, wobble: 0.1 }),
      at: [0, 2.0, 0],
    },
  );

  // Gallery deck.
  b.lathe(
    [
      [0, 0],
      [1.8, 0],
      [1.95, 0.12],
      [1.95, 0.3],
      [0, 0.3],
    ],
    { name: "gallery", color: "#3a3a3e", at: [0, 12.6, 0] },
  );

  // Gallery railing: posts round the deck and a top rail.
  b.ring(frame([0, 12.9, 0], [0, 1, 0]), { count: 16, radius: 1.8 }, (it) => {
    b.rod(it, it.moved({ up: 0.9 }), 0.035, { color: IRON });
  });
  b.lathe(
    [
      [1.76, 0],
      [1.9, 0],
      [1.9, 0.08],
      [1.76, 0.08],
    ],
    { name: "rail", color: IRON, at: [0, 13.8, 0], segments: 16 },
  );

  // The lantern room: a warm glowing glass drum.
  b.lathe(
    [
      [0, 0],
      [1.05, 0],
      [1.05, 2.2],
      [0, 2.2],
    ],
    {
      name: "lantern",
      color: gradient("#ffb84a", "#fff6c8", [0, 12.9, 0], [0, 15.1, 0]),
      at: [0, 12.9, 0],
      segments: 14,
    },
  );

  // Iron glazing bars over the glass.
  b.ring(frame([0, 12.9, 0], [0, 1, 0]), { count: 8, radius: 1.07 }, (it) => {
    b.rod(it, it.moved({ up: 2.2 }), 0.04, { color: IRON });
  });

  // Red dome roof and a finial.
  b.lathe(
    [
      [0, 0],
      [1.5, 0],
      [1.25, 0.35],
      [0.7, 0.7],
      [0, 0.82],
    ],
    { name: "roof", color: "#a8322a", at: [0, 15.0, 0], segments: 14 },
  );
  b.spike([0, 15.82, 0], [0, 1, 0], 0.6, 0.06, { color: IRON, name: "finial" });

  return b.root;
}
