import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A detailed 1979 Alien-inspired spaceship galley: ribbed olive cabinets, steel worktops, induction plates, deep sink, industrial piping, overhead lockers, vents, hazard markings and utilitarian fittings.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const OLIVE = "#59605a";
  const OLIVE_DARK = "#303936";
  const OLIVE_LIGHT = "#798078";
  const STEEL = "#9a9b91";
  const STEEL_DARK = "#353a38";
  const BLACK = "#171c1b";
  const RUBBER = "#202522";
  const ORANGE = "#c76a2b";
  const ORANGE_DARK = "#71361f";
  const YELLOW = "#d7a92b";
  const RED = "#a33b2d";
  const CREAM = "#c9c1a7";
  const GLASS = "#70827c";
  const BLUE = "#4f7377";
  const WHITE = "#d8d7c8";

  type P = [number, number, number];

  const box = (
    size: [number, number, number],
    at: P,
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    at: P,
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 10), color, {
      at,
      ...opts,
    });

  const tube = (a: P, c: P, radius: number, color: string) =>
    b.rod(a, c, radius, { color, caps: "round" });

  const rivet = (x: number, y: number, z: number, r = 0.018, color = STEEL_DARK) =>
    cyl(r, 0.012, [x, y, z], color, { dir: [0, 0, 1] });

  const frontPanel = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    color = OLIVE,
  ) => {
    box([w, h, 0.055], [x, y, z], color);
    box([w - 0.07, 0.018, 0.018], [x, y + h / 2 - 0.035, z + 0.034], OLIVE_LIGHT);
    box([0.018, h - 0.07, 0.018], [x - w / 2 + 0.035, y, z + 0.034], OLIVE_LIGHT);
    rivet(x - w / 2 + 0.035, y - h / 2 + 0.035, z + 0.04);
    rivet(x + w / 2 - 0.035, y - h / 2 + 0.035, z + 0.04);
    rivet(x - w / 2 + 0.035, y + h / 2 - 0.035, z + 0.04);
    rivet(x + w / 2 - 0.035, y + h / 2 - 0.035, z + 0.04);
  };

  // Floor and rear bulkhead: compact walk-in galley footprint.
  box([2.9, 0.08, 2.35], [0, 0.04, 0], STEEL_DARK);
  for (let x = -1.35; x <= 1.35; x += 0.45)
    box([0.018, 0.012, 2.2], [x, 0.095, 0], BLACK);
  for (let z = -1.0; z <= 1.0; z += 0.45)
    box([2.75, 0.012, 0.018], [0, 0.095, z], BLACK);

  box([2.9, 2.45, 0.12], [0, 1.28, -1.08], OLIVE_DARK);
  box([2.7, 2.25, 0.035], [0, 1.3, -1.005], OLIVE);
  box([2.92, 0.08, 2.35], [0, 2.48, 0], OLIVE_DARK);

  // Rear wall ribs.
  for (let x = -1.25; x <= 1.25; x += 0.42) {
    box([0.065, 2.18, 0.11], [x, 1.28, -0.93], STEEL_DARK);
    box([0.025, 2.0, 0.025], [x, 1.28, -0.865], STEEL);
  }
  for (const y of [0.28, 0.78, 1.28, 1.78, 2.28])
    box([2.65, 0.035, 0.03], [0, y, -0.84], STEEL_DARK);

  // Left and right base cabinet carcasses.
  box([1.12, 0.72, 0.72], [-0.88, 0.49, -0.48], OLIVE_DARK);
  box([1.12, 0.72, 0.72], [0.88, 0.49, -0.48], OLIVE_DARK);
  box([0.16, 0.72, 0.72], [-1.42, 0.49, -0.48], STEEL_DARK);
  box([0.16, 0.72, 0.72], [1.42, 0.49, -0.48], STEEL_DARK);

  // Cabinet doors.
  frontPanel(-0.88, 0.50, -0.095, 0.98, 0.57, OLIVE);
  frontPanel(0.88, 0.50, -0.095, 0.98, 0.57, OLIVE);
  box([0.035, 0.035, 0.035], [-0.49, 0.51, -0.015], ORANGE);
  box([0.035, 0.035, 0.035], [0.49, 0.51, -0.015], ORANGE);

  // Worktops, thick layered edge trim.
  box([1.32, 0.13, 0.88], [-0.88, 0.91, -0.48], STEEL);
  box([1.32, 0.035, 0.91], [-0.88, 0.985, -0.48], STEEL_DARK);
  box([1.32, 0.025, 0.91], [-0.88, 1.008, -0.48], CREAM);

  box([1.32, 0.13, 0.88], [0.88, 0.91, -0.48], STEEL);
  box([1.32, 0.035, 0.91], [0.88, 0.985, -0.48], STEEL_DARK);
  box([1.32, 0.025, 0.91], [0.88, 1.008, -0.48], CREAM);

  // Corner bumper and side edge guards.
  for (const x of [-1.47, 1.47])
    tube([x, 0.15, -0.92], [x, 1.02, -0.92], 0.027, ORANGE_DARK);
  tube([-1.52, 1.01, -0.94], [1.52, 1.01, -0.94], 0.022, ORANGE);

  // Deep sink on left counter: rim, basin, drain, faucet.
  box([0.72, 0.035, 0.48], [-0.88, 1.065, -0.48], BLACK);
  box([0.64, 0.13, 0.40], [-0.88, 1.0, -0.48], STEEL_DARK);
  box([0.67, 0.035, 0.46], [-0.88, 1.095, -0.48], STEEL);
  cyl(0.055, 0.018, [-0.88, 1.12, -0.48], BLACK);
  cyl(0.017, 0.26, [-0.88, 1.19, -0.16], STEEL_DARK);
  tube([-0.88, 1.31, -0.16], [-0.88, 1.31, -0.33], 0.018, STEEL_DARK);
  tube([-0.88, 1.31, -0.33], [-0.79, 1.31, -0.42], 0.018, STEEL_DARK);
  cyl(0.028, 0.018, [-0.78, 1.31, -0.42], BLUE, { dir: [0, 0, 1] });
  cyl(0.018, 0.13, [-1.16, 1.14, -0.23], RED);
  cyl(0.018, 0.13, [-0.60, 1.14, -0.23], BLUE);

  // Right counter: four-burner cooking surface.
  box([1.04, 0.035, 0.69], [0.88, 1.10, -0.48], BLACK);
  box([1.02, 0.018, 0.67], [0.88, 1.125, -0.48], STEEL_DARK);
  for (const x of [0.58, 1.18])
    for (const z of [-0.67, -0.29]) {
      cyl(0.13, 0.012, [x, 1.145, z], STEEL);
      cyl(0.095, 0.015, [x, 1.155, z], BLACK);
      cyl(0.058, 0.018, [x, 1.166, z], ORANGE_DARK);
    }
  for (let i = 0; i < 4; i++) {
    cyl(0.018, 0.13, [0.39 + i * 0.15, 1.155, -0.06], STEEL_DARK);
    cyl(0.027, 0.018, [0.39 + i * 0.15, 1.225, -0.06], ORANGE);
  }

  // Lower toe kick and service panels.
  box([2.66, 0.15, 0.08], [0, 0.14, -0.89], BLACK);
  for (const x of [-1.15, -0.38, 0.38, 1.15])
    box([0.32, 0.025, 0.025], [x, 0.23, -0.94], ORANGE_DARK);

  // Upper storage lockers.
  for (const x of [-1.05, -0.35, 0.35, 1.05]) {
    box([0.61, 0.58, 0.38], [x, 1.91, -0.62], OLIVE_DARK);
    frontPanel(x, 1.91, -0.405, 0.50, 0.46, OLIVE);
    box([0.035, 0.035, 0.035], [x, 1.91, -0.375], ORANGE);
  }
  box([2.75, 0.08, 0.42], [0, 2.25, -0.62], STEEL_DARK);
  box([2.78, 0.035, 0.46], [0, 2.30, -0.62], OLIVE_LIGHT);

  // Locker vents and latches.
  for (const x of [-1.05, -0.35, 0.35, 1.05]) {
    for (let i = -2; i <= 2; i++)
      box([0.32, 0.012, 0.012], [x, 1.78 + i * 0.045, -0.165], BLACK);
    cyl(0.025, 0.018, [x + 0.18, 1.91, -0.37], STEEL_DARK, { dir: [0, 0, 1] });
  }

  // Central wall-mounted oven / microwave.
  box([0.78, 0.72, 0.20], [0, 1.32, -0.72], BLACK);
  box([0.70, 0.52, 0.04], [0, 1.36, -0.605], GLASS);
  box([0.64, 0.05, 0.025], [0, 1.62, -0.575], STEEL);
  box([0.10, 0.10, 0.025], [-0.27, 1.64, -0.57], RED);
  box([0.10, 0.10, 0.025], [-0.13, 1.64, -0.57], YELLOW);
  for (const x of [0.20, 0.31])
    cyl(0.025, 0.025, [x, 1.64, -0.57], STEEL, { dir: [0, 0, 1] });
  box([0.58, 0.035, 0.035], [0, 1.10, -0.57], ORANGE_DARK);
  for (const x of [-0.30, 0.30]) rivet(x, 1.08, -0.545, 0.015);

  // Small blue status display and warning placards.
  box([0.25, 0.11, 0.018], [0.72, 1.48, -0.565], BLUE);
  box([0.13, 0.04, 0.012], [0.72, 1.48, -0.55], WHITE);
  box([0.28, 0.16, 0.015], [-0.62, 1.72, -0.57], RED);
  box([0.19, 0.025, 0.018], [-0.62, 1.72, -0.55], YELLOW);

  // Industrial hood above the cooking station.
  box([1.35, 0.16, 0.65], [0.88, 1.59, -0.52], STEEL_DARK);
  box([1.20, 0.08, 0.56], [0.88, 1.48, -0.54], BLACK);
  box([1.08, 0.045, 0.44], [0.88, 1.445, -0.56], STEEL);
  for (const x of [0.42, 0.72, 1.02, 1.32])
    box([0.018, 0.04, 0.38], [x, 1.44, -0.56], BLACK);
  box([0.20, 0.28, 0.22], [1.36, 1.77, -0.52], STEEL_DARK);
  tube([1.36, 1.88, -0.52], [1.36, 2.30, -0.52], 0.075, STEEL_DARK);
  box([1.27, 2.29, -0.52], [0.18, 0.08, 0.20], STEEL_DARK);

  // Hood control strip.
  box([0.66, 0.08, 0.04], [0.88, 1.67, -0.20], OLIVE);
  for (const x of [0.62, 0.78, 0.94, 1.10]) {
    cyl(0.025, 0.025, [x, 1.68, -0.17], x === 0.94 ? RED : YELLOW, {
      dir: [0, 0, 1],
    });
  }

  // Left-side utility column and exposed plumbing.
  box([0.30, 1.82, 0.30], [-1.34, 1.25, -0.62], OLIVE_DARK);
  box([0.18, 1.58, 0.025], [-1.34, 1.25, -0.45], STEEL);
  tube([-1.23, 0.42, -0.30], [-1.23, 1.90, -0.30], 0.035, ORANGE_DARK);
  tube([-1.23, 1.90, -0.30], [-0.72, 1.90, -0.30], 0.035, ORANGE_DARK);
  tube([-1.10, 0.40, -0.18], [-1.10, 1.65, -0.18], 0.025, BLUE);
  tube([-1.10, 1.65, -0.18], [-0.75, 1.65, -0.18], 0.025, BLUE);
  for (const y of [0.58, 1.05, 1.52])
    box([0.34, 0.045, 0.06], [-1.34, y, -0.42], ORANGE_DARK);

  // Right-side vertical service duct.
  box([0.28, 1.92, 0.30], [1.35, 1.28, -0.64], OLIVE_DARK);
  for (const y of [0.42, 0.78, 1.14, 1.50, 1.86])
    box([0.30, 0.035, 0.055], [1.35, y, -0.46], STEEL);
  box([0.16, 0.72, 0.025], [1.35, 1.18, -0.44], BLACK);
  box([0.10, 0.08, 0.025], [1.35, 1.56, -0.43], RED);
  box([0.10, 0.08, 0.025], [1.35, 1.70, -0.43], YELLOW);

  // Hanging rail with mugs, utensils, and hooks.
  tube([-1.12, 1.53, -0.15], [1.15, 1.53, -0.15], 0.022, STEEL);
  for (const x of [-0.92, -0.45, 0.05, 0.52, 0.96]) {
    tube([x, 1.53, -0.15], [x, 1.44, -0.15], 0.012, STEEL_DARK);
    cyl(0.025, 0.02, [x, 1.42, -0.15], ORANGE, { dir: [0, 0, 1] });
  }
  // Mugs.
  for (const x of [-0.92, -0.45, 0.05]) {
    cyl(0.07, 0.12, [x, 1.33, -0.15], CREAM);
    cyl(0.075, 0.018, [x, 1.395, -0.15], STEEL_DARK);
    tube([x + 0.065, 1.35, -0.15], [x + 0.11, 1.35, -0.15], 0.012, CREAM);
  }
  // Long utensils.
  tube([0.52, 1.42, -0.15], [0.52, 1.02, -0.15], 0.014, STEEL);
  tube([0.96, 1.42, -0.15], [0.96, 1.08, -0.15], 0.014, STEEL);
  box([0.08, 0.12, 0.025], [0.52, 1.00, -0.14], STEEL);
  box([0.13, 0.08, 0.025], [0.96, 1.06, -0.14], STEEL);

  // Overhead ceiling conduit and junction boxes.
  tube([-1.25, 2.38, -0.26], [1.20, 2.38, -0.26], 0.035, STEEL_DARK);
  tube([1.20, 2.38, -0.26], [1.20, 2.38, -0.90], 0.035, STEEL_DARK);
  box([0.22, 0.16, 0.22], [-0.72, 2.34, -0.26], STEEL_DARK);
  box([0.12, 0.05, 0.12], [-0.72, 2.43, -0.26], RED);
  box([0.22, 0.16, 0.22], [0.56, 2.34, -0.26], STEEL_DARK);
  box([0.12, 0.05, 0.12], [0.56, 2.43, -0.26], YELLOW);

  // Ceiling fluorescent light housing.
  box([0.78, 0.09, 0.25], [0, 2.40, 0.18], STEEL_DARK);
  box([0.62, 0.022, 0.16], [0, 2.345, 0.18], WHITE);
  for (const x of [-0.28, 0.28]) rivet(x, 2.35, 0.18, 0.014);

  // Hazard stripe plates on the lower front.
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.22;
    box([0.14, 0.025, 0.018], [x, 0.29, -0.948], i % 2 === 0 ? YELLOW : BLACK);
  }

  // A few deliberately oversized Nostromo-style bolts and labels.
  for (const x of [-1.30, -0.70, 0.70, 1.30]) {
    cyl(0.035, 0.025, [x, 2.34, -0.86], STEEL, { dir: [0, 0, 1] });
    box([0.11, 0.035, 0.018], [x, 2.17, -0.86], RED);
  }

  return b.root;
}
