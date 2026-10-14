import * as THREE from "three";
import { createBuilder, paint, catmull } from "../../../../src/index";

export const meta = {
  name: "lighthouse",
  description: "A striped lighthouse on a small grassy rock in the sea, with a glowing lantern room and a railed gallery.",
};

const RED = "#c8372d";
const WHITE = "#f4f1ea";
const ROCK = "#6f7a6b";
const GRASS = "#6aa84f";
const BUSH = "#3f7d3a";
const WATER = "#2b7bb9";
const GLASS = "#ffe59a";
const ROOF = "#3d4a5c";
const BRASS = "#c9a54a";
const WIN = "#1f2d3d";
const DOOR = "#4a2e1f";
const RAIL = "#2b2f36";

// Tower radius at height y (a gentle taper from base to top).
const towerR = (y: number) => 2.0 - (0.7 * (y - 1.2)) / 8.3;

// Point on a tower at angle theta (0 = front, +Z) and height y, pushed out by `out`.
const onTower = (theta: number, y: number, out: number): [number, number, number] => {
  const r = towerR(y) + out;
  return [Math.sin(theta) * r, y, Math.cos(theta) * r];
};

// Points on a horizontal circle.
const circle = (r: number, y: number, n: number): number[][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.sin(a) * r, y, Math.cos(a) * r];
  });

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  const base = b.joint("base", { at: [0, 0, 0] });

  // Sea: a thin disc whose surface is the ground line.
  b.lathe(
    [
      [0, -0.2],
      [7, -0.2],
      [7, 0],
      [0, 0],
    ],
    { at: [0, 0, 0], bone: base, segments: 24, color: WATER },
  );

  // Island: a lumpy rock with a grassy top.
  const islandPaint = paint((_p, n) => (n.y > 0.6 ? GRASS : ROCK));
  b.lathe(
    [
      [0, -0.15],
      [3.4, -0.15],
      [4.1, 0.2],
      [4.2, 0.7],
      [3.7, 1.1],
      [2.6, 1.4],
      [1.2, 1.5],
      [0, 1.5],
    ],
    { at: [0, 0, 0], bone: base, smoothing: 1, segments: 16, color: islandPaint },
  );

  // Rocks and a bush on the island.
  b.part(new THREE.DodecahedronGeometry(0.45, 0), ROCK, {
    at: [2.6, 1.2, 1.1],
    rotation: [10, 30, 5],
    flat: true,
    bone: base,
  });
  b.part(new THREE.DodecahedronGeometry(0.6, 0), ROCK, {
    at: [-2.9, 1.1, -1.6],
    rotation: [20, 10, 40],
    flat: true,
    bone: base,
  });
  b.part(new THREE.IcosahedronGeometry(0.55, 0), BUSH, {
    at: [-2.2, 1.6, -0.9],
    flat: true,
    bone: base,
  });

  // Tower: a tapered striped shaft.
  const towerPaint = paint((p) => (Math.floor(p.y / 1.4) % 2 ? WHITE : RED));
  b.lathe(
    [
      [0, 1.2],
      [2.0, 1.2],
      [1.3, 9.5],
      [0, 9.5],
    ],
    { at: [0, 0, 0], bone: base, segments: 16, color: towerPaint },
  );

  // Door and windows set on the tower wall.
  b.part(new THREE.BoxGeometry(0.8, 1.6, 0.22), DOOR, {
    at: onTower(0, 2.3, 0.06),
    rotation: [0, 0, 0],
    bone: base,
  });
  for (const theta of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    for (const y of [4.6, 7.4]) {
      b.part(new THREE.BoxGeometry(0.36, 0.6, 0.16), WIN, {
        at: onTower(theta, y, 0.02),
        rotation: [0, (theta * 180) / Math.PI, 0],
        bone: base,
      });
    }
  }

  // Gallery deck.
  b.lathe(
    [
      [0, 9.5],
      [2.0, 9.5],
      [1.95, 9.7],
      [0, 9.7],
    ],
    { at: [0, 0, 0], bone: base, segments: 16, color: RAIL },
  );

  // Railing: posts and a closed top rail.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.sin(a) * 1.85;
    const z = Math.cos(a) * 1.85;
    b.rod([x, 9.7, z], [x, 10.5, z], 0.03, { color: RAIL, bone: base });
  }
  b.sweep(catmull(circle(1.85, 10.5, 16), { closed: true }), 0.035, { color: RAIL, bone: base });

  // Lantern room: glowing glass drum with dark frame bars.
  b.lathe(
    [
      [0, 9.7],
      [1.15, 9.7],
      [1.15, 11.2],
      [0, 11.2],
    ],
    { at: [0, 0, 0], bone: base, segments: 14, color: GLASS },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a) * 1.17;
    const z = Math.cos(a) * 1.17;
    b.rod([x, 9.7, z], [x, 11.2, z], 0.04, { color: RAIL, bone: base });
  }

  // Roof: a turned dome.
  b.lathe(
    [
      [0, 11.2],
      [1.4, 11.2],
      [1.3, 11.45],
      [0.9, 11.8],
      [0.45, 12.05],
      [0, 12.15],
    ],
    { at: [0, 0, 0], bone: base, smoothing: 1, segments: 14, color: ROOF },
  );

  // Brass ball and pole with a small flag.
  b.part(new THREE.SphereGeometry(0.12, 8, 6), BRASS, { at: [0, 12.25, 0], bone: base });
  b.rod([0, 12.15, 0], [0, 12.7, 0], 0.025, { color: RAIL, bone: base });
  b.extrude(
    [
      [0, 0],
      [0.7, 0.22],
      [0, 0.44],
    ],
    { at: [0, 12.4, 0.02], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: RED, bone: base },
  );

  return b.root;
}
