```ts
import * as THREE from "three";
import { createBuilder, svg, paint, rng } from "agentic-3js-builder";
import { metal, panelled, gaugeTexture } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nostromo Alien Galley",
  description:
    "A dense 1979 industrial spaceship galley kitchen: riveted bulkhead, stained steel cabinets, cooker, sink, pipes, gauges, storage bins, mugs and warning labels.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const STEEL = metal("steel", { polish: 0.32, tarnish: 0.45, size: 0.18, seed: 11 });
  const DARK_STEEL = metal("iron", { polish: 0.18, tarnish: 0.7, size: 0.12, seed: 12 });
  const BRASS = metal("brass", { polish: 0.22, tarnish: 0.5, verdigris: 0.12, seed: 21 });
  const COPPER = metal("copper", { polish: 0.25, tarnish: 0.38, seed: 22 });
  const PANEL = panelled(STEEL, { size: 0.18, aspect: 0.65, rivets: 0.07 });
  const PALE_PANEL = panelled("#9b9b8e", { size: 0.16, aspect: 0.72, rivets: 0.055 });
  const RUBBER = "#17191b";
  const BLACK = "#090b0c";
  const CREAM = "#c9c5a8";
  const ORANGE = "#c46a27";
  const RED = "#a92c20";
  const GREEN = "#83a56d";
  const AMBER = "#e0a33d";
  const GLASS = "#83a79b";

  const warning = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48">
      <rect width="160" height="48" fill="#171817"/>
      <path d="M-10 48L25 0h18L8 48M55 48L90 0h18L73 48M120 48L155 0h18l-35 48" fill="#c27728"/>
      <rect x="3" y="4" width="154" height="40" fill="none" stroke="#e6d7a5" stroke-width="2"/>
      <text x="80" y="31" fill="#e8dfbb" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17">CAUTION</text>
    </svg>`,
    { size: 256 },
  );
  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 72">
      <rect width="220" height="72" rx="3" fill="#b7b39a" stroke="#242621" stroke-width="5"/>
      <text x="12" y="24" fill="#171817" font-family="monospace" font-size="15" font-weight="bold">NOSTROMO</text>
      <text x="12" y="43" fill="#171817" font-family="monospace" font-size="12">GALLEY / DECK 03</text>
      <path d="M12 56h196" stroke="#36372e" stroke-width="3"/>
      <text x="12" y="67" fill="#36372e" font-family="monospace" font-size="8">PROPERTY OF WEYLAND-YUTANI</text>
    </svg>`,
    { size: 256 },
  );
  const danger = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,5 95,90 5,90" fill="#d18a28" stroke="#111" stroke-width="7"/>
      <path d="M50 27v34M50 73v5" stroke="#171717" stroke-width="10" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const display = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 90">
      <rect width="180" height="90" rx="8" fill="#101817" stroke="#7b806f" stroke-width="5"/>
      <path d="M15 67h150M15 51h110M15 35h140" stroke="#81b596" stroke-width="3"/>
      <text x="16" y="22" fill="#a6d4a9" font-family="monospace" font-size="12">THERMAL CORE</text>
      <text x="135" y="67" fill="#d7ad50" font-family="monospace" font-size="16">074</text>
    </svg>`,
    { size: 256 },
  );
  const vent = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
      <rect width="128" height="64" fill="#252827" stroke="#aaa58e" stroke-width="5"/>
      <g stroke="#0d0f0f" stroke-width="7">${Array.from({ length: 8 }, (_, i) => `<path d="M${12 + i * 15} 8v48"/>`).join("")}</g>
    </svg>`,
    { size: 192 },
  );
  const stencilled = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60">
      <rect width="240" height="60" fill="#202322"/>
      <text x="120" y="39" fill="#d5cda9" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="27">FOOD SERVICE</text>
    </svg>`,
    { size: 256 },
  );

  const box = (size: [number, number, number], at: [number, number, number], color: any = STEEL, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, ...extra });

  const cyl = (
    r: number,
    h: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    sides = 12,
  ) => b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at, dir });

  const sphere = (r: number, at: [number, number, number], color: any, seg = 10) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(6, Math.floor(seg * 0.7))), color, { at });

  const rod = (a: [number, number, number], z: [number, number, number], r: number, color: any) =>
    b.rod(a, z, r, { color, sides: 8 });

  const frontPlate = (
    w: number,
    h: number,
    at: [number, number, number],
    texture: any,
    color = "#ffffff",
  ) =>
    b.part(new THREE.PlaneGeometry(w, h), color, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      lift: 0.002,
    });

  // Floor and rear bulkhead.
  box([2.65, 0.055, 1.55], [0, 0.028, 0], DARK_STEEL);
  box([2.65, 2.32, 0.09], [0, 1.16, -0.73], PANEL);
  box([2.65, 0.08, 1.4], [0, 2.28, -0.03], DARK_STEEL);
  box([0.09, 2.2, 1.4], [-1.29, 1.13, -0.02], DARK_STEEL);
  box([0.09, 2.2, 1.4], [1.29, 1.13, -0.02], DARK_STEEL);

  // Bulkhead ribs, bolts and overhead cable trays.
  for (const x of [-1.12, -0.56, 0, 0.56, 1.12]) {
    box([0.045, 2.12, 0.035], [x, 1.15, -0.675], DARK_STEEL);
    for (const y of [0.15, 0.56, 1.02, 1.48, 1.94]) {
      sphere(0.022, [x, y, -0.62], BRASS, 8);
    }
  }
  box([2.35, 0.12, 0.18], [0, 2.09, -0.56], DARK_STEEL);
  box([2.1, 0.06, 0.12], [0, 2.18, -0.44], STEEL);
  for (const x of [-0.86, -0.43, 0, 0.43, 0.86]) cyl(0.035, 0.15, [x, 2.08, -0.42], RUBBER, [0, 0, 1], 8);

  // Lower galley cabinetry.
  box([2.48, 0.72, 0.58], [0, 0.53, -0.37], PANEL);
  box([2.54, 0.09, 0.66], [0, 0.92, -0.34], PALE_PANEL);
  box([2.58, 0.08, 0.7], [0, 0.16, -0.34], DARK_STEEL);
  box([2.5, 0.12, 0.7], [0, 0.99, -0.34], DARK_STEEL);

  for (const x of [-0.99, -0.5, 0, 0.5, 0.99]) {
    box([0.025, 0.65, 0.59], [x, 0.54, -0.35], DARK_STEEL);
    sphere(0.027, [x + (x > 0 ? -0.07 : 0.07), 0.57, -0.035], BRASS, 8);
    sphere(0.027, [x + (x > 0 ? -0.07 : 0.07), 0.44, -0.035], BRASS, 8);
  }
  frontPlate(0.72, 0.19, [-0.78, 0.73, -0.035], warning);
  frontPlate(0.58, 0.17, [0.82, 0.73, -0.035], label);

  // Countertop and edge rails.
  box([2.62, 0.12, 0.72], [0, 1.05, -0.31], PALE_PANEL);
  box([2.68, 0.06, 0.08], [0, 1.115, 0.025], BRASS);
  box([2.55, 0.045, 0.06], [0, 1.04, 0.055], RUBBER);
  for (const x of [-1.16, -0.58, 0, 0.58, 1.16]) sphere(0.026, [x, 1.12, -0.28], BRASS, 8);

  // Sink basin on the left.
  box([0.72, 0.13, 0.43], [-0.78, 1.125, -0.29], BLACK);
  box([0.78, 0.035, 0.49], [-0.78, 1.205, -0.29], BRASS);
  box([0.64, 0.055, 0.34], [-0.78, 1.215, -0.29], DARK_STEEL);
  cyl(0.08, 0.018, [-0.78, 1.25, -0.29], BLACK, [0, 1, 0], 12);
  rod([-0.48, 1.22, -0.4], [-0.32, 1.59, -0.4], 0.035, COPPER);
  rod([-0.32, 1.59, -0.4], [-0.18, 1.59, -0.4], 0.035, COPPER);
  cyl(0.065, 0.035, [-0.32, 1.59, -0.4], BRASS, [1, 0, 0], 10);
  cyl(0.065, 0.035, [-0.18, 1.59, -0.4], BRASS, [1, 0, 0], 10);

  // Cooker module.
  box([0.94, 0.72, 0.59], [0.45, 0.55, -0.37], DARK_STEEL);
  box([0.98, 0.08, 0.66], [0.45, 0.93, -0.34], BLACK);
  box([0.86, 0.035, 0.5], [0.45, 1.205, -0.33], BLACK);
  for (const x of [0.18, 0.55, 0.82]) {
    cyl(0.13, 0.018, [x, 1.235, -0.34], BRASS, [0, 1, 0], 12);
    cyl(0.075, 0.023, [x, 1.25, -0.34], BLACK, [0, 1, 0], 10);
  }
  for (const x of [0.1, 0.38, 0.66, 0.94]) {
    cyl(0.028, 0.04, [x, 0.94, -0.02], BRASS, [0, 0, 1], 8);
    box([0.095, 0.045, 0.018], [x, 0.79, -0.005], RED);
  }
  frontPlate(0.48, 0.16, [0.45, 0.66, -0.03], danger);
  frontPlate(0.42, 0.14, [0.45, 0.48, -0.03], stencilled);

  // Deep oven door and handle.
  box([0.86, 0.34, 0.035], [0.45, 0.48, -0.012], BLACK);
  box([0.7, 0.045, 0.045], [0.45, 0.69, 0.025], BRASS);
  rod([0.16, 0.69, 0.035], [0.74, 0.69, 0.035], 0.025, BRASS);
  for (const x of [0.08, 0.32, 0.56, 0.8]) sphere(0.022, [x, 0.83, 0.02], BRASS, 8);

  // Upper cabinets and shelves.
  box([2.42, 0.55, 0.43], [0, 1.72, -0.42], PALE_PANEL);
  box([2.5, 0.07, 0.48], [0, 1.42, -0.18], DARK_STEEL);
  box([2.48, 0.07, 0.48], [0, 2.02, -0.18], DARK_STEEL);
  for (const x of [-1.0, -0.5, 0, 0.5, 1.0]) {
    box([0.025, 0.52, 0.43], [x, 1.72, -0.41], DARK_STEEL);
    sphere(0.025, [x + 0.09, 1.72, -0.17], BRASS, 8);
  }
  frontPlate(0.9, 0.19, [-0.62, 1.82, -0.165], warning);
  frontPlate(0.62, 0.2, [0.58, 1.82, -0.165], label);

  // Hood over cooker, with industrial vent.
  box([1.15, 0.18, 0.68], [0.42, 1.42, -0.24], DARK_STEEL);
  box([0.88, 0.12, 0.5], [0.42, 1.29, -0.2], BLACK);
  frontPlate(0.56, 0.28, [0.42, 1.43, 0.12], vent);
  for (const x of [0.05, 0.28, 0.51, 0.74]) cyl(0.035, 0.09, [x, 1.48, -0.42], BRASS, [0, 1, 0], 8);

  // Right-side machinery column.
  box([0.3, 1.25, 0.52], [1.08, 1.08, -0.3], PANEL);
  box([0.24, 0.48, 0.04], [1.08, 1.54, -0.02], BLACK);
  frontPlate(0.2, 0.12, [1.08, 1.54, 0.01], display);
  box([0.22, 0.34, 0.035], [1.08, 0.98, -0.02], DARK_STEEL);
  for (const y of [0.82, 0.95, 1.08]) cyl(0.03, 0.025, [1.08, y, 0.015], [RED, AMBER, GREEN][Math.round((y - 0.82) / 0.13)], [0, 0, 1], 8);
  const dialTexture = gaugeTexture({ label: "kPa", needle: 64, red: [70, 118], size: 192 });
  cyl(0.12, 0.035, [1.08, 1.28, 0.02], BRASS, [0, 0, 1], 16);
  b.part(new THREE.CircleGeometry(0.095, 20), "#ffffff", {
    at: [1.08, 1.28, 0.044],
    dir: [0, 0, 1],
    axis: "z",
    texture: dialTexture,
  });
  box([0.19, 0.09, 0.08], [1.08, 0.62, -0.03], RUBBER);
  for (const y of [0.58, 0.7]) cyl(0.025, 0.06, [1.08, y, 0.03], BRASS, [0, 0, 1], 8);

  // Pipes and conduit on the rear wall.
  const pipeRuns: Array<[[number, number, number], [number, number, number], number, any]> = [
    [[-1.12, 0.18, -0.59], [-1.12, 1.95, -0.59], 0.035, COPPER],
    [[-1.12, 0.18, -0.59], [-0.2, 0.18, -0.59], 0.042, BRASS],
    [[0.94, 0.2, -0.58], [0.94, 2.05, -0.58], 0.04, DARK_STEEL],
    [[0.94, 1.96, -0.58], [1.2, 1.96, -0.58], 0.04, COPPER],
    [[-0.85, 1.34, -0.59], [-0.85, 2.12, -0.59], 0.022, RUBBER],
    [[0.2, 1.34, -0.58], [0.2, 2.12, -0.58], 0.022, RUBBER],
  ];
  for (const [a, z, r, c] of pipeRuns) {
    rod(a, z, r, c);
    sphere(r * 1.3, a, BRASS, 8);
    sphere(r * 1.3, z, BRASS, 8);
  }
  for (const y of [0.42, 0.9, 1.4, 1.88]) {
    box([0.08, 0.045, 0.13], [-1.12, y, -0.53], BRASS);
    box([0.08, 0.045, 0.13], [0.94, y, -0.53], BRASS);
  }

  // Open shelves on the left and right.
  box([0.48, 0.045, 0.46], [-1.05, 1.23, 0.04], BRASS);
  box([0.48, 0.045, 0.46], [-1.05, 1.82, 0.04], BRASS);
  box([0.48, 0.045, 0.46], [1.02, 1.25, 0.04], BRASS);
  box([0.48, 0.045, 0.46], [1.02, 1.83, 0.04], BRASS);
  for (const x of [-1.27, -0.83, 0.8, 1.24]) {
    rod([x, 1.2, -0.02], [x, 1.88, -0.02], 0.018, DARK_STEEL);
  }

  // Food tins and ration canisters.
  const tin = (x: number, y: number, z: number, h: number, c: any, band = BRASS) => {
    cyl(0.09, h, [x, y + h / 2, z], c, [0, 1, 0], 10);
    cyl(0.094, 0.018, [x, y + h + 0.01, z], band, [0, 1, 0], 10);
    cyl(0.094, 0.016, [x, y - 0.005, z], DARK_STEEL, [0, 1, 0], 10);
    box([0.13, 0.025, 0.012], [x, y + h * 0.48, z + 0.085], c);
  };
  tin(-1.17, 1.27, 0.02, 0.32, RED);
  tin(-0.98, 1.27, 0.02, 0.28, CREAM);
  tin(-0.82, 1.27, 0.02, 0.36, GREEN);
  tin(-1.16, 1.87, 0.02, 0.26, ORANGE);
  tin(-0.98, 1.87, 0.02, 0.33, CREAM);
  tin(0.9, 1.29, 0.02, 0.3, ORANGE);
  tin(1.08, 1.29, 0.02, 0.25, GREEN);
  tin(1.18, 1.87, 0.02, 0.36, RED);

  // Mugs, bowls and utensils on the counter.
  const mug = (x: number, z: number, c: any) => {
    cyl(0.075, 0.13, [x, 1.31, z], c, [0, 1, 0], 10);
    cyl(0.058, 0.008, [x, 1.38, z], BLACK, [0, 1, 0], 10);
    rod([x + 0.07, 1.36, z], [x + 0.13, 1.36, z], 0.018, c);
  };
  mug(-0.22, -0.3, CREAM);
  mug(0.82, -0.18, ORANGE);
  cyl(0.16, 0.045, [-0.28, 1.235, -0.08], BRASS, [0, 1, 0], 12);
  cyl(0.12, 0.04, [-0.28, 1.27, -0.08], DARK_STEEL, [0, 1, 0], 12);
  rod([0.05, 1.24, -0.02], [0.28, 1.24, -0.02], 0.012, BRASS);
  rod([0.08, 1.25, 0.01], [0.3, 1.25, 0.01], 0.012, BRASS);
  rod([0.11, 1.26, 0.04], [0.33, 1.26, 0.04], 0.012, BRASS);

  // Hanging utensil rail, ladles and hooks.
  rod([-0.72, 1.94, 0.08], [0.62, 1.94, 0.08], 0.018, BRASS);
  for (const x of [-0.58, -0.3, -0.02, 0.26, 0.5]) {
    cyl(0.018, 0.08, [x, 1.88, 0.08], DARK_STEEL, [0, 1, 0], 8);
    rod([x, 1.85, 0.08], [x, 1.58, 0.08], 0.012, BRASS);
  }
  for (const x of [-0.58, -0.3, -0.02, 0.26, 0.5]) sphere(0.032, [x, 1.56, 0.08], BRASS, 8);
  cyl(0.08, 0.025, [-0.58, 1.48, 0.08], BRASS, [0, 0, 1], 10);
  cyl(0.055, 0.025, [-0.3, 1.47, 0.08], BRASS, [0, 0, 1], 10);
  rod([0.48, 1.94, 0.08], [0.48, 1.7, 0.08], 0.018, DARK_STEEL);

  // Ceiling lamps, cable loops and glowing cooker indicators.
  box([0.78, 0.07, 0.25], [-0.42, 2.19, -0.15], DARK_STEEL);
  for (const x of [-0.68, -0.42, -0.16]) {
    cyl(0.055, 0.025, [x, 2.13, -0.15], AMBER, [0, -1, 0], 10);
    glow(
      b.part(new THREE.SphereGeometry(0.035, 8, 6), AMBER, { at: [x, 2.11, -0.15] }),
      1.8,
    );
  }
  rod([0.68, 2.18, -0.2], [0.98, 1.95, -0.2], 0.012, RUBBER);
  rod([0.98, 1.95, -0.2], [0.98, 1.7, -0.2], 0.012, RUBBER);
  for (const x of [0.2, 0.45, 0.7]) {
    const lamp = b.part(new THREE.SphereGeometry(0.025, 8, 6), GREEN, { at: [x, 0.99, 0.03] });
    glow(lamp, 1.4);
  }

  // Small access panels and riveted trim details.
  box([0.46, 0.29, 0.025], [-0.1, 0.33, 0.02], DARK_STEEL);
  box([0.4, 0.2, 0.018], [-0.1, 0.34, 0.038], STEEL);
  for (const x of [-0.27, 0.07]) for (const y of [0.26, 0.42]) sphere(0.018, [x, y, 0.055], BRASS, 8);
  frontPlate(0.36, 0.09, [-0.1, 0.34, 0.052], warning);
  box([0.48, 0.22, 0.025], [0.7, 2.12, -0.02], DARK_STEEL);
  for (const x of [0.5, 0.9]) sphere(0.025, [x, 2.12, 0.02], BRASS, 8);

  // Floor tie-downs and a loose service case.
  for (const x of [-1.13, -0.38, 0.38, 1.13]) {
    cyl(0.055, 0.025, [x, 0.07, 0.48], BRASS, [0, 1, 0], 10);
    cyl(0.03, 0.03, [x, 0.09, 0.48], BLACK, [0, 1, 0], 8);
  }
  box([0.42, 0.24, 0.32], [1.0, 0.19, 0.39], DARK_STEEL);
  box([0.34, 0.025, 0.2], [1.0, 0.33, 0.39], BRASS);
  box([0.25, 0.06, 0.025], [1.0, 0.2, 0.56], RED);
  for (const x of [0.84, 1.16]) sphere(0.025, [x, 0.19, 0.56], BRASS, 8);

  // A few deliberately uneven grime plates and exposed fasteners.
  const grime = paint((p, n) => {
    const v = Math.sin(p.x * 31 + p.z * 19) * 0.5 + 0.5;
    return n.y < -0.2 ? (v > 0.57 ? "#3a342c" : "#555044") : STEEL;
  });
  box([0.38, 0.04, 0.44], [-1.1, 0.2, -0.02], grime);
  box([0.28, 0.035, 0.4], [1.08, 0.2, -0.01], grime);
  for (const x of [-1.22, -0.98, 0.93, 1.2]) {
    sphere(0.024, [x, 0.11, 0.05], BRASS, 8);
    sphere(0.024, [x, 0.11, -0.38], BRASS, 8);
  }

  return b.root;
}
```