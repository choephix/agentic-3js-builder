import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Dutch Windmill",
  description: "A cheerful Animal Crossing-style Dutch windmill with a tapered brick tower, bright roof, balcony, windows, door, and four wooden sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const BRICK = "#c66f55";
  const BRICK_LIGHT = "#e39a72";
  const BRICK_DARK = "#93483f";
  const CREAM = "#fff1c5";
  const CREAM_DARK = "#d9b978";
  const ROOF = "#477f73";
  const ROOF_LIGHT = "#73aa91";
  const WOOD = "#704535";
  const WOOD_LIGHT = "#a66b4e";
  const DARK = "#263b43";
  const GLASS = "#78b9bd";
  const GOLD = "#e9bd55";
  const FLOWER = "#e87d70";
  const LEAF = "#5e9b61";
  const STONE = "#b8aa91";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    dir?: [number, number, number],
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      flat: true,
    });

  const ring = (
    radius: number,
    tube: number,
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.TorusGeometry(radius, tube, 6, 20), color, {
      at,
      rotation,
      flat: true,
    });

  // Low stone foundation, just wide enough to ground the tower.
  cyl(0.7, 0.12, STONE, [0, 0.06, 0], undefined, 10);
  ring(0.58, 0.035, CREAM_DARK, [0, 0.13, 0]);
  ring(0.67, 0.028, STONE, [0, 0.15, 0]);

  // Main tapered brick tower.
  b.part(
    new THREE.CylinderGeometry(0.43, 0.62, 2.12, 12, 1, false),
    BRICK,
    { at: [0, 1.18, 0], flat: true },
  );

  // Warm mortar-like horizontal courses.
  for (const y of [0.28, 0.62, 0.96, 1.3, 1.64, 1.98]) {
    ring(0.62 - (y - 0.16) * 0.085, 0.018, CREAM_DARK, [0, y, 0]);
  }

  // Irregular decorative brick accents around the lower body.
  const brickRows = [
    { y: 0.31, r: 0.605, phase: 0 },
    { y: 0.48, r: 0.57, phase: 1 },
    { y: 0.65, r: 0.535, phase: 0 },
    { y: 0.82, r: 0.50, phase: 1 },
  ];
  for (const row of brickRows) {
    for (let i = 0; i < 10; i++) {
      const a = (i + row.phase * 0.5) * 36 * Math.PI / 180;
      const x = Math.sin(a) * row.r;
      const z = Math.cos(a) * row.r;
      box(
        [0.12, 0.105, 0.018],
        i % 3 === 0 ? BRICK_LIGHT : BRICK_DARK,
        [x, row.y, z],
        [0, a, 0],
      );
    }
  }

  // Tiny foundation corner stones.
  for (const s of [-1, 1]) {
    box([0.18, 0.14, 0.18], CREAM_DARK, [s * 0.48, 0.2, 0.28]);
    box([0.18, 0.14, 0.18], CREAM_DARK, [s * 0.48, 0.2, -0.28]);
  }

  // Front door with chunky frame, handle, and arched-looking cap.
  box([0.34, 0.58, 0.055], WOOD, [0, 0.43, 0.595]);
  box([0.27, 0.5, 0.018], WOOD_LIGHT, [0, 0.43, 0.63]);
  for (const x of [-0.105, 0.105]) {
    box([0.035, 0.54, 0.07], CREAM, [x, 0.43, 0.655]);
  }
  box([0.32, 0.055, 0.075], CREAM, [0, 0.72, 0.64]);
  box([0.39, 0.06, 0.07], CREAM, [0, 0.77, 0.63]);
  cyl(0.025, 0.04, GOLD, [0.09, 0.43, 0.685], [0, 0, 1], 8);

  // Door step.
  box([0.46, 0.08, 0.22], STONE, [0, 0.08, 0.67]);
  box([0.36, 0.045, 0.19], CREAM_DARK, [0, 0.145, 0.68]);

  // Side windows: dark inset squares with pale muntins.
  for (const side of [-1, 1]) {
    const x = side * 0.47;
    box([0.035, 0.25, 0.26], DARK, [x, 1.22, 0.08], [0, 0, side * 8]);
    box([0.045, 0.035, 0.28], CREAM, [x + side * 0.025, 1.22, 0.08], [0, 0, side * 8]);
    box([0.045, 0.25, 0.035], CREAM, [x + side * 0.026, 1.22, 0.08], [0, 0, side * 8]);
    box([0.05, 0.045, 0.31], CREAM_DARK, [x + side * 0.035, 1.39, 0.08], [0, 0, side * 8]);
  }

  // Front windows at two levels.
  for (const y of [1.18, 1.72]) {
    box([0.27, 0.25, 0.045], DARK, [0, y, 0.47]);
    box([0.235, 0.21, 0.016], GLASS, [0, y, 0.5]);
    box([0.025, 0.23, 0.025], CREAM, [0, y, 0.52]);
    box([0.25, 0.025, 0.025], CREAM, [0, y, 0.52]);
    box([0.34, 0.045, 0.08], CREAM, [0, y - 0.17, 0.51]);
    box([0.34, 0.035, 0.08], CREAM_DARK, [0, y - 0.205, 0.51]);
  }

  // Small flower boxes under the lower windows.
  for (const side of [-1, 1]) {
    box([0.33, 0.1, 0.12], WOOD, [side * 0.03, 0.93, 0.57]);
    for (let i = -2; i <= 2; i++) {
      cyl(0.035, 0.12, LEAF, [side * (i * 0.055), 1.04, 0.57], undefined, 6);
      cyl(0.028, 0.035, FLOWER, [side * (i * 0.055), 1.11, 0.57], undefined, 7);
    }
  }

  // Upper white collar and balcony under the cap.
  ring(0.43, 0.045, CREAM, [0, 2.22, 0]);
  ring(0.49, 0.035, CREAM_DARK, [0, 2.28, 0]);
  ring(0.57, 0.04, WOOD, [0, 2.34, 0]);

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    box(
      [0.035, 0.25, 0.035],
      WOOD_LIGHT,
      [Math.sin(a) * 0.54, 2.41, Math.cos(a) * 0.54],
      [0, a, 0],
    );
  }
  ring(0.58, 0.045, WOOD, [0, 2.28, 0]);
  ring(0.61, 0.035, CREAM_DARK, [0, 2.53, 0]);

  // Cap and cheerful teal roof.
  b.part(
    new THREE.ConeGeometry(0.61, 0.42, 12),
    ROOF,
    { at: [0, 2.72, 0], flat: true },
  );
  ring(0.6, 0.035, ROOF_LIGHT, [0, 2.52, 0]);
  ring(0.18, 0.025, GOLD, [0, 2.95, 0]);

  // Little finial.
  cyl(0.045, 0.16, GOLD, [0, 3.04, 0], undefined, 8);
  b.part(new THREE.SphereGeometry(0.07, 8, 5), GOLD, {
    at: [0, 3.14, 0],
    flat: true,
  });

  // Front axle block and hub, deliberately oversized for a friendly toy silhouette.
  box([0.34, 0.34, 0.11], WOOD, [0, 2.15, 0.48]);
  box([0.22, 0.22, 0.14], CREAM, [0, 2.15, 0.56]);
  cyl(0.13, 0.18, WOOD, [0, 2.15, 0.64], [0, 0, 1], 12);
  cyl(0.09, 0.2, GOLD, [0, 2.15, 0.75], [0, 0, 1], 10);
  b.part(new THREE.SphereGeometry(0.13, 10, 6), GOLD, {
    at: [0, 2.15, 0.86],
    flat: true,
  });

  // Four broad wooden sails in the front plane.
  const hub: [number, number, number] = [0, 2.15, 0.91];
  const bladeAngles = [45, 135, 225, 315];
  for (const deg of bladeAngles) {
    const a = deg * Math.PI / 180;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const inner: [number, number, number] = [
      hub[0] + dx * 0.1,
      hub[1] + dy * 0.1,
      0.94,
    ];
    const outer: [number, number, number] = [
      hub[0] + dx * 0.91,
      hub[1] + dy * 0.91,
      0.94,
    ];
    b.frustumBox(
      inner,
      outer,
      [0.15, 0.06],
      [0.095, 0.045],
      { color: WOOD_LIGHT, section: "box", caps: "flat" },
    );

    // Pale inner sail cloth, offset toward the viewer.
    const clothA: [number, number, number] = [
      hub[0] + dx * 0.2,
      hub[1] + dy * 0.2,
      0.975,
    ];
    const clothB: [number, number, number] = [
      hub[0] + dx * 0.78,
      hub[1] + dy * 0.78,
      0.975,
    ];
    b.frustumBox(
      clothA,
      clothB,
      [0.095, 0.028],
      [0.055, 0.018],
      { color: CREAM, section: "box", caps: "flat" },
    );

    // Cross braces on each sail.
    const px = -dy;
    const py = dx;
    const braceA: [number, number, number] = [
      hub[0] + dx * 0.34 + px * 0.055,
      hub[1] + dy * 0.34 + py * 0.055,
      1.0,
    ];
    const braceB: [number, number, number] = [
      hub[0] + dx * 0.73 - px * 0.055,
      hub[1] + dy * 0.73 - py * 0.055,
      1.0,
    ];
    b.rod(braceA, braceB, 0.018, { color: WOOD, caps: "flat" });
  }

  // Hub cap and a tiny gold center pin in front of the sails.
  cyl(0.11, 0.12, WOOD, [0, 2.15, 1.035], [0, 0, 1], 10);
  cyl(0.055, 0.14, GOLD, [0, 2.15, 1.12], [0, 0, 1], 10);

  // Painted heart emblem below the sails.
  b.part(
    new THREE.SphereGeometry(0.12, 8, 5),
    FLOWER,
    { at: [-0.08, 1.93, 0.55], scale: [1, 1, 0.25], flat: true },
  );
  b.part(
    new THREE.SphereGeometry(0.12, 8, 5),
    FLOWER,
    { at: [0.08, 1.93, 0.55], scale: [1, 1, 0.25], flat: true },
  );
  b.part(
    new THREE.ConeGeometry(0.16, 0.2, 4),
    FLOWER,
    { at: [0, 1.82, 0.55], rotation: [0, 0, 180], scale: [1, 1, 0.3], flat: true },
  );

  // A few chunky grass tufts around the foundation, kept subordinate to the building.
  for (const x of [-0.78, -0.68, 0.76, 0.86]) {
    b.part(
      new THREE.ConeGeometry(0.035, 0.22, 5),
      LEAF,
      { at: [x, 0.2, 0.18], rotation: [0, 0, x > 0 ? -18 : 18], flat: true },
    );
  }

  return b.root;
}
