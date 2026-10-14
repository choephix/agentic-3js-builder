import * as THREE from "three";
import { createBuilder, mottle, stripes } from "../../../../src/index";

export const meta = {
  name: "Lighthouse on a tiny island",
  description: "A red-and-white striped lighthouse with a glowing lantern on a small sandy island, with a keeper's hut, rocks and a bush, standing in the sea.",
};

export default function lighthouse() {
  const b = createBuilder({ name: "lighthouse", paintSize: 1024 });

  // The island is the one joint everything rests on.
  b.joint("island", { at: [0, 0, 0] });

  // Sea: a shallow disc just under the floor.
  b.part(new THREE.CylinderGeometry(9, 9, 0.2, 24), "#2f7fa6", { at: [0, -0.1, 0] });

  // Island: a low sandy dome, mottled like wet sand.
  b.lathe(
    [
      [0, -0.1],
      [5.5, -0.1],
      [6.0, 0.25],
      [5.2, 0.7],
      [3.0, 0.95],
      [0, 1.05],
    ],
    {
      name: "island",
      color: mottle("#e8d29a", "#c7a467", { size: 1.5, seed: 3 }),
      at: [0, 0, 0],
      segments: 16,
    },
  );

  // Tower: a tapering lathe with horizontal red bands.
  b.lathe(
    [
      [0, 0],
      [2.4, 0],
      [2.3, 0.8],
      [1.5, 11.2],
      [0, 11.2],
    ],
    {
      name: "tower",
      color: stripes("#f2efe6", "#c63d2c", { size: 1.8, axis: "y", width: 0.45, seed: 5 }),
      at: [0, 0.8, 0],
      segments: 16,
    },
  );

  // Door at the foot of the tower, facing the viewer.
  b.part(new THREE.BoxGeometry(0.6, 1.1, 0.25), "#4a2e1d", { at: [0, 1.35, 2.05] });

  // Two windows with white frames, one above the other.
  for (const [y, z] of [
    [6.0, 1.95],
    [9.0, 1.72],
  ] as const) {
    b.part(new THREE.BoxGeometry(0.46, 0.66, 0.12), "#f4f1ea", { at: [0, y, z + 0.02] });
    b.part(new THREE.BoxGeometry(0.34, 0.54, 0.14), "#2b3a48", { at: [0, y, z + 0.05] });
  }

  // Gallery deck and railing around the lantern.
  b.part(new THREE.CylinderGeometry(2.0, 1.7, 0.3, 12), "#3a3a3a", { at: [0, 12.15, 0] });
  b.part(new THREE.TorusGeometry(1.95, 0.04, 6, 24), "#2a2a2a", {
    at: [0, 12.5, 0],
    rotation: [90, 0, 0],
  });

  // Lantern: a glowing core framed by dark posts.
  b.part(new THREE.CylinderGeometry(1.0, 1.0, 1.8, 8), "#fff3b8", { at: [0, 13.2, 0] });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.12, 1.8, 0.12), "#2a2a2a", {
      at: [1.05 * Math.sin(a), 13.2, 1.05 * Math.cos(a)],
    });
  }

  // Lantern roof, finial and ball.
  b.part(new THREE.ConeGeometry(1.45, 0.9, 8), "#a8322a", { at: [0, 14.55, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), "#d9b34a", { at: [0, 15.0, 0] });
  b.part(new THREE.SphereGeometry(0.12, 8, 6), "#d9b34a", { at: [0, 15.25, 0] });

  // Keeper's hut with a red roof on the far side of the island.
  b.part(new THREE.BoxGeometry(1.7, 1.3, 1.5), "#e8e0cf", { at: [3.2, 1.0, -1.2] });
  b.part(new THREE.ConeGeometry(1.25, 0.8, 4), "#b33a2a", {
    at: [3.2, 2.05, -1.2],
    rotation: [0, 45, 0],
  });
  b.part(new THREE.BoxGeometry(0.4, 0.7, 0.1), "#4a2e1d", { at: [3.2, 0.9, -0.44] });
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.1), "#9fd8e8", { at: [3.7, 1.2, -0.44] });

  // Bush beside the hut.
  b.part(new THREE.SphereGeometry(0.7, 10, 8), "#4f8a3c", { at: [-2.4, 1.0, -2.0] });

  // Rocks around the shore.
  b.part(new THREE.DodecahedronGeometry(0.5), "#7a7a84", { at: [-2.8, 0.6, 2.4] });
  b.part(new THREE.DodecahedronGeometry(0.4), "#8c8a93", { at: [-3.6, 0.3, 0.8] });
  b.part(new THREE.DodecahedronGeometry(0.35), "#6d6c76", { at: [1.8, 0.6, 3.4] });

  return b.root;
}
