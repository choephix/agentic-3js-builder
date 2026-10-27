```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An airy Alexander Calder-inspired hanging mobile of black wire arms and brightly colored abstract counterbalanced forms.",
};

const BLACK = "#17161b";
const RED = "#d92d28";
const BLUE = "#1769b0";
const YELLOW = "#f2c62d";
const WHITE = "#f1ead7";
const ORANGE = "#e87932";
const PINK = "#d94d76";
const GREEN = "#5c9870";

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: string,
  rotation: [number, number, number] = [0, 0, 0],
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    rotation,
    flat: true,
  });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  at: [number, number, number],
  color: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
    at,
    flat: true,
  });
}

function wire(
  b: ReturnType<typeof createBuilder>,
  a: [number, number, number],
  c: [number, number, number],
  radius = 0.008,
  color = BLACK,
) {
  return b.rod(a, c, radius, { color, caps: "round" });
}

function hangingLine(
  b: ReturnType<typeof createBuilder>,
  a: [number, number, number],
  c: [number, number, number],
  radius = 0.004,
) {
  return b.rod(a, c, radius, { color: BLACK, caps: "round" });
}

function plate(
  b: ReturnType<typeof createBuilder>,
  outline: [number, number][],
  at: [number, number, number],
  x: [number, number, number],
  color: string,
  thickness = 0.012,
  rotation?: [number, number, number],
) {
  return b.extrude(outline, {
    at,
    x,
    y: [0, 1, 0],
    thickness,
    bevel: 0.003,
    smoothing: 1,
    color,
    rotation,
  });
}

function disc(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  at: [number, number, number],
  color: string,
  x: [number, number, number] = [1, 0, 0],
) {
  const outline: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    outline.push([Math.cos(a) * radius, Math.sin(a) * radius]);
  }
  return plate(b, outline, at, x, color, 0.014);
}

function crescent(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  color: string,
  scale = 1,
  x: [number, number, number] = [1, 0, 0],
) {
  const outline: [number, number][] = [
    [-0.03, 0.34],
    [0.14, 0.29],
    [0.28, 0.16],
    [0.34, -0.02],
    [0.29, -0.2],
    [0.14, -0.31],
    [-0.04, -0.34],
    [0.09, -0.16],
    [0.16, 0.01],
    [0.11, 0.17],
  ].map(([a, c]) => [a * scale, c * scale]);
  return plate(b, outline, at, x, color);
}

function teardrop(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  color: string,
  scale = 1,
  x: [number, number, number] = [1, 0, 0],
) {
  const outline: [number, number][] = [
    [0, 0.34],
    [0.16, 0.22],
    [0.25, 0.03],
    [0.2, -0.17],
    [0.05, -0.31],
    [-0.13, -0.2],
    [-0.2, -0.01],
    [-0.13, 0.17],
  ].map(([a, c]) => [a * scale, c * scale]);
  return plate(b, outline, at, x, color);
}

function triangle(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  color: string,
  scale = 1,
  x: [number, number, number] = [1, 0, 0],
) {
  return plate(
    b,
    [
      [-0.3 * scale, -0.25 * scale],
      [0.34 * scale, -0.2 * scale],
      [0.02 * scale, 0.35 * scale],
    ],
    at,
    x,
    color,
    0.014,
  );
}

function sliver(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  color: string,
  scale = 1,
  x: [number, number, number] = [1, 0, 0],
) {
  return plate(
    b,
    [
      [-0.24 * scale, -0.05 * scale],
      [0.15 * scale, -0.12 * scale],
      [0.3 * scale, 0.02 * scale],
      [0.05 * scale, 0.07 * scale],
      [-0.25 * scale, 0.12 * scale],
    ],
    at,
    x,
    color,
    0.011,
  );
}

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  // A small abstract counterweight at the crown and a nearly invisible suspension thread.
  hangingLine(b, [0, 3.18, 0], [0, 2.93, 0], 0.004);
  sphere(b, 0.035, [0, 3.2, 0], BLACK);
  sphere(b, 0.026, [0, 2.91, 0], BLACK);

  // Crown: a long, slightly asymmetric black arm with a warm red leaf on one end.
  wire(b, [-0.78, 2.84, 0], [0.82, 2.84, 0], 0.011);
  sphere(b, 0.028, [-0.78, 2.84, 0], BLACK);
  sphere(b, 0.028, [0.82, 2.84, 0], BLACK);
  hangingLine(b, [-0.78, 2.84, 0], [-0.78, 2.47, 0], 0.004);
  hangingLine(b, [0.82, 2.84, 0], [0.82, 2.57, 0], 0.004);
  crescent(b, [-0.78, 2.34, 0.02], RED, 0.72);
  disc(b, 0.11, [0.82, 2.48, -0.02], YELLOW);

  // Crown ornaments: a tiny geometric pair that gives the top silhouette a floating rhythm.
  sliver(b, [-0.49, 2.71, 0.02], BLUE, 0.44, [0, 0, 1]);
  sliver(b, [0.45, 2.94, -0.02], WHITE, 0.35, [0, 0, 1]);

  // Second level: a deep crossbar, deliberately offset in depth.
  hangingLine(b, [0, 2.84, 0], [0, 2.49, 0], 0.004);
  wire(b, [-1.02, 2.43, -0.07], [0.96, 2.43, 0.15], 0.010);
  sphere(b, [0.04][0], [0, 2.43, 0], BLACK);
  hangingLine(b, [-1.02, 2.43, -0.07], [-1.02, 1.99, -0.07], 0.004);
  hangingLine(b, [0.96, 2.43, 0.15], [0.96, 2.16, 0.15], 0.004);

  triangle(b, [-1.02, 1.81, -0.07], BLUE, 0.78, [1, 0, 0]);
  teardrop(b, [0.96, 1.83, 0.15], ORANGE, 0.62, [0, 0, 1]);

  // A paired blue/yellow accent suspended just off the long arm.
  hangingLine(b, [-0.38, 2.43, -0.07], [-0.38, 2.15, -0.27], 0.0035);
  disc(b, 0.105, [-0.38, 2.04, -0.27], WHITE, [0, 0, 1]);
  hangingLine(b, [0.37, 2.43, 0.03], [0.37, 2.23, 0.29], 0.0035);
  triangle(b, [0.37, 2.08, 0.29], RED, 0.32, [0, 0, 1]);

  // Third level, crossing the previous one in a different plane.
  hangingLine(b, [0.96, 2.16, 0.15], [0.96, 1.82, 0.15], 0.004);
  wire(b, [0.18, 1.78, 0.23], [1.28, 1.78, -0.18], 0.009);
  sphere(b, 0.024, [0.18, 1.78, 0.23], BLACK);
  sphere(b, 0.024, [1.28, 1.78, -0.18], BLACK);
  hangingLine(b, [0.18, 1.78, 0.23], [0.18, 1.37, 0.23], 0.0035);
  hangingLine(b, [1.28, 1.78, -0.18], [1.28, 1.49, -0.18], 0.0035);
  crescent(b, [0.18, 1.21, 0.23], PINK, 0.68, [0, 0, 1]);
  sliver(b, [1.28, 1.31, -0.18], YELLOW, 0.56, [1, 0.05, 0]);

  // A long lower arm, almost horizontal, with a dramatic white sail and green counterweight.
  hangingLine(b, [0.18, 1.37, 0.23], [0.18, 1.06, 0.23], 0.0035);
  wire(b, [-0.66, 1.02, 0.18], [0.92, 1.02, 0.18], 0.009);
  sphere(b, 0.022, [-0.66, 1.02, 0.18], BLACK);
  sphere(b, 0.022, [0.92, 1.02, 0.18], BLACK);
  hangingLine(b, [-0.66, 1.02, 0.18], [-0.66, 0.65, 0.18], 0.0035);
  hangingLine(b, [0.92, 1.02, 0.18], [0.92, 0.72, 0.18], 0.0035);

  plate(
    b,
    [
      [-0.02, 0.44],
      [0.34, 0.32],
      [0.42, 0.05],
      [0.23, -0.25],
      [-0.14, -0.33],
      [-0.3, -0.05],
      [-0.2, 0.23],
    ],
    [-0.66, 0.39, 0.18],
    [0, 0, 1],
    WHITE,
    0.015,
  );
  disc(b, 0.13, [0.92, 0.58, 0.18], GREEN, [0, 0, 1]);

  // Small lower satellites make the negative space feel intentional rather than empty.
  hangingLine(b, [-0.2, 1.02, 0.18], [-0.2, 0.8, -0.05], 0.003);
  triangle(b, [-0.2, 0.67, -0.05], RED, 0.31, [0, 0, 1]);
  hangingLine(b, [0.42, 1.02, 0.18], [0.42, 0.78, 0.47], 0.003);
  teardrop(b, [0.42, 0.59, 0.47], BLUE, 0.33, [0, 0, 1]);

  // A final tiny mobile at the bottom: black rod, orange blade, and a pale bead.
  hangingLine(b, [0.92, 0.72, 0.18], [0.92, 0.42, 0.18], 0.0035);
  wire(b, [0.64, 0.38, 0.18], [1.2, 0.38, 0.18], 0.007);
  hangingLine(b, [0.64, 0.38, 0.18], [0.64, 0.17, 0.18], 0.0028);
  hangingLine(b, [1.2, 0.38, 0.18], [1.2, 0.27, 0.18], 0.0028);
  sliver(b, [0.64, 0.05, 0.18], ORANGE, 0.36, [0, 0, 1]);
  sphere(b, 0.07, [1.2, 0.17, 0.18], WHITE);

  // A pair of small brass-like black spacers at the major pivots, keeping the construction legible.
  for (const p of [
    [0, 2.84, 0] as [number, number, number],
    [0, 2.49, 0] as [number, number, number],
    [0.96, 2.16, 0.15] as [number, number, number],
    [0.18, 1.37, 0.23] as [number, number, number],
  ]) {
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.035, 8), BLACK, {
      at: p,
      dir: [0, 1, 0],
      flat: true,
    });
  }

  return b.root;
}
```