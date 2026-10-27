```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { metal, panelled, INK, GLINT } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Nostromo Alien Spaceship Galley Kitchen",
  description:
    "A detailed industrial spaceship galley kitchen in the grimy, ribbed, utilitarian style of Alien's Nostromo.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const STEEL = metal("iron", { tarnish: 0.72, polish: 0.12, size: 0.16, seed: 11 });
  const DARK_STEEL = metal("steel", { tarnish: 0.55, polish: 0.2, size: 0.11, seed: 12 });
  const WARM_STEEL = metal("bronze", { tarnish: 0.58, verdigris: 0.12, polish: 0.18, size: 0.13, seed: 13 });
  const COPPER = metal("copper", { tarnish: 0.5, verdigris: 0.2, polish: 0.2, seed: 14 });
  const BRASS = metal("brass", { tarnish: 0.55, polish: 0.35, size: 0.08, seed: 15 });

  const FLOOR = "#25272a";
  const RUBBER = "#111315";
  const PANEL = panelled(STEEL, { size: 0.18, aspect: 0.55, rivets: 0.08 });
  const PANEL_DARK = panelled(DARK_STEEL, { size: 0.2, aspect: 0.6, rivets: 0.1 });
  const OFFWHITE = "#b8b39e";
  const CREAM = "#d0c9ab";
  const WARNING = "#d29a28";
  const RED = "#9d3027";
  const GREEN = "#6c8b62";
  const BLUE = "#63829a";
  const GLASS = "#263b3d";
  const LIGHT = "#d8d6b5";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    rotation?: [number, number, number],
    name?: string,
    radial = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial, 1), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const sphere = (radius: number, at: [number, number, number], color: any, name?: string) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, { at, name, flat: true });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    name?: string,
  ) => b.rod(a, c, radius, color, { name, caps: "round", sides: 8 });

  const rivet = (x: number, y: number, z: number, color: any = BRASS) =>
    sphere(0.018, [x, y, z], color, "panel-rivet");

  const screwLine = (x0: number, x1: number, y: number, z: number, color: any = BRASS) => {
    for (let x = x0; x <= x1 + 0.001; x += 0.18) rivet(x, y, z, color);
  };

  // Floor and rear bulkhead.
  box([3.65, 0.08, 2.12], [0, 0.04, 0], FLOOR, undefined, "deck");
  box([3.65, 2.95, 0.12], [0, 1.5, -0.99], PANEL_DARK, undefined, "rear-bulkhead");
  box([0.12, 2.95, 2.05], [-1.77, 1.5, 0], PANEL_DARK, undefined, "left-bulkhead");
  box([0.12, 2.95, 2.05], [1.77, 1.5, 0], PANEL_DARK, undefined, "right-bulkhead");

  // Deck tread strips and perimeter threshold.
  for (let x = -1.62; x <= 1.62; x += 0.27) {
    box([0.16, 0.018, 1.85], [x, 0.092, 0], "#343638", [0, 0, 0], "deck-tread");
  }
  box([3.48, 0.12, 0.08], [0, 0.11, 0.94], WARM_STEEL, undefined, "front-threshold");
  box([0.08, 0.12, 1.86], [-1.68, 0.11, 0], WARM_STEEL, undefined, "left-threshold");
  box([0.08, 0.12, 1.86], [1.68, 0.11, 0], WARM_STEEL, undefined, "right-threshold");

  // Rear upper cable trays and ribbing.
  box([3.28, 0.16, 0.28], [0, 2.72, -0.87], DARK_STEEL, undefined, "upper-cable-tray");
  box([3.28, 0.12, 0.2], [0, 2.44, -0.89], STEEL, undefined, "upper-lip");
  for (let x = -1.55; x <= 1.55; x += 0.31) {
    box([0.055, 2.24, 0.08], [x, 1.45, -0.90], WARM_STEEL, undefined, "bulkhead-rib");
  }
  for (const x of [-1.55, -1.05, -0.55, -0.05, 0.45, 0.95, 1.45]) {
    cyl(0.045, 0.18, [x, 2.78, -0.72], RUBBER, [90, 0, 0], "cable-clamp");
  }

  // Main lower cabinet carcass.
  box([3.38, 0.82, 0.72], [0, 0.57, -0.47], PANEL, undefined, "lower-cabinet-body");
  box([3.48, 0.11, 0.82], [0, 1.03, -0.47], DARK_STEEL, undefined, "counter-support");
  box([3.48, 0.13, 0.82], [0, 1.11, -0.47], WARM_STEEL, undefined, "countertop");
  box([3.47, 0.05, 0.82], [0, 1.19, -0.47], "#777266", undefined, "counter-edge");

  // Lower cabinet doors and drawers.
  const doors = [
    [-1.48, 0.52, 0.43],
    [-0.98, 0.52, 0.43],
    [-0.48, 0.52, 0.43],
    [0.88, 0.52, 0.52],
    [1.43, 0.52, 0.48],
  ];
  for (const [x, y, w] of doors) {
    box([w - 0.025, 0.62, 0.035], [x, y, 0.0], PANEL_DARK, undefined, "lower-door");
    box([w - 0.11, 0.045, 0.022], [x, y + 0.27, 0.025], STEEL, undefined, "door-recess");
    box([w * 0.42, 0.025, 0.012], [x, y + 0.27, 0.049], BRASS, undefined, "door-handle");
    rivet(x - w / 2 + 0.035, y - 0.26, 0.027);
    rivet(x + w / 2 - 0.035, y - 0.26, 0.027);
    rivet(x - w / 2 + 0.035, y + 0.26, 0.027);
    rivet(x + w / 2 - 0.035, y + 0.26, 0.027);
  }

  // Left wall-mounted overhead lockers.
  box([1.66, 0.71, 0.48], [-0.84, 2.0, -0.63], PANEL, undefined, "overhead-locker-bank");
  for (const x of [-1.43, -0.86, -0.29]) {
    box([0.52, 0.58, 0.04], [x, 2.0, -0.365], PANEL_DARK, undefined, "overhead-door");
    box([0.22, 0.026, 0.016], [x, 1.98, -0.335], BRASS, undefined, "overhead-grip");
    rivet(x - 0.2, 2.23, -0.335);
    rivet(x + 0.2, 2.23, -0.335);
  }

  // Right overhead locker with an open-looking service bay.
  box([1.35, 0.72, 0.48], [0.9, 2.0, -0.63], PANEL_DARK, undefined, "right-overhead-body");
  box([1.15, 0.48, 0.035], [0.9, 2.0, -0.365], RUBBER, undefined, "open-service-bay");
  box([1.0, 0.055, 0.04], [0.9, 2.25, -0.33], STEEL, undefined, "service-bay-top");
  box([1.0, 0.055, 0.04], [0.9, 1.75, -0.33], STEEL, undefined, "service-bay-bottom");
  for (const x of [0.45, 0.7, 0.95, 1.2, 1.45]) {
    rod([x, 1.81, -0.34], [x, 2.18, -0.34], 0.012, COPPER, "service-wire");
  }
  cyl(0.07, 0.018, [1.38, 2.1, -0.30], RED, [90, 0, 0], "warning-lamp");
  cyl(0.07, 0.018, [1.2, 2.1, -0.30], GREEN, [90, 0, 0], "status-lamp");

  // Left countertop sink.
  box([0.97, 0.06, 0.58], [-1.12, 1.21, -0.48], DARK_STEEL, undefined, "sink-rim");
  box([0.73, 0.13, 0.37], [-1.12, 1.13, -0.48], RUBBER, undefined, "sink-basin");
  box([0.55, 0.035, 0.03], [-1.12, 1.205, -0.70], WARM_STEEL, undefined, "sink-front-lip");
  cyl(0.035, 0.04, [-1.12, 1.25, -0.48], RUBBER, undefined, "drain");
  cyl(0.025, 0.36, [-1.12, 1.39, -0.72], COPPER, undefined, "faucet-stem");
  rod([-1.12, 1.56, -0.72], [-1.12, 1.56, -0.55], 0.025, COPPER, "faucet-spout");
  cyl(0.045, 0.025, [-1.22, 1.29, -0.72], RED, [90, 0, 0], "hot-tap");
  cyl(0.045, 0.025, [-1.02, 1.29, -0.72], BLUE, [90, 0, 0], "cold-tap");

  // Center induction / burner block.
  box([1.03, 0.065, 0.64], [0.0, 1.22, -0.45], RUBBER, undefined, "stove-blacktop");
  for (const x of [-0.34, 0.34]) {
    cyl(0.22, 0.018, [x, 1.265, -0.47], DARK_STEEL, undefined, "burner-ring", 16);
    cyl(0.14, 0.02, [x, 1.278, -0.47], RUBBER, undefined, "burner-center", 12);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      rod([x + Math.cos(a) * 0.1, 1.29, -0.47 + Math.sin(a) * 0.1],
        [x + Math.cos(a) * 0.18, 1.29, -0.47 + Math.sin(a) * 0.18], 0.009, BRASS, "burner-spoke");
    }
  }
  box([0.92, 0.07, 0.04], [0, 1.32, -0.78], STEEL, undefined, "stove-control-rail");
  for (const x of [-0.36, -0.12, 0.12, 0.36]) {
    cyl(0.055, 0.035, [x, 1.37, -0.79], WARM_STEEL, [90, 0, 0], "stove-knob", 8);
    cyl(0.017, 0.041, [x, 1.37, -0.813], RED, [90, 0, 0], "knob-mark", 6);
  }

  // Oven unit on the right.
  box([1.13, 1.0, 0.7], [1.06, 0.59, -0.48], PANEL_DARK, undefined, "oven-body");
  box([0.93, 0.58, 0.055], [1.06, 0.62, -0.105], DARK_STEEL, undefined, "oven-door");
  box([0.72, 0.37, 0.026], [1.06, 0.66, -0.073], GLASS, undefined, "oven-window");
  box([0.64, 0.025, 0.025], [1.06, 0.95, -0.045], BRASS, undefined, "oven-handle");
  for (const x of [0.68, 1.44]) {
    rivet(x, 0.33, -0.04);
    rivet(x, 0.91, -0.04);
  }
  box([0.86, 0.16, 0.04], [1.06, 1.08, -0.12], RUBBER, undefined, "oven-controls");
  for (const x of [0.78, 1.02, 1.26, 1.5]) {
    cyl(0.038, 0.03, [x, 1.08, -0.145], BRASS, [90, 0, 0], "oven-control", 8);
  }
  cyl(0.026, 0.018, [1.45, 1.08, -0.17], RED, [90, 0, 0], "oven-light", 8);

  // Side-mounted vertical service cylinder and brackets.
  cyl(0.18, 0.82, [-1.52, 1.47, 0.36], DARK_STEEL, undefined, "wall-cylinder", 12);
  cyl(0.19, 0.045, [-1.52, 1.88, 0.36], BRASS, undefined, "cylinder-cap", 12);
  cyl(0.19, 0.045, [-1.52, 1.06, 0.36], BRASS, undefined, "cylinder-foot", 12);
  box([0.07, 0.23, 0.58], [-1.73, 1.47, 0.36], STEEL, undefined, "cylinder-bracket");
  rod([-1.52, 1.76, 0.36], [-1.52, 2.18, 0.36], 0.018, COPPER, "cylinder-pipe");
  rod([-1.52, 2.18, 0.36], [-0.92, 2.18, 0.36], 0.018, COPPER, "cylinder-pipe-top");

  // Exposed utility pipes under the overhead cabinets.
  rod([-1.64, 1.55, -0.23], [1.64, 1.55, -0.23], 0.025, COPPER, "hot-manifold");
  rod([-1.64, 1.64, -0.28], [1.64, 1.64, -0.28], 0.018, BLUE, "cold-manifold");
  for (const x of [-1.35, -0.72, -0.1, 0.55, 1.22]) {
    rod([x, 1.55, -0.23], [x, 1.28, -0.23], 0.012, COPPER, "drop-pipe");
    cyl(0.035, 0.04, [x, 1.28, -0.23], BRASS, [90, 0, 0], "pipe-valve", 8);
  }

  // Hanging utensil rack.
  box([1.32, 0.045, 0.055], [-0.12, 1.91, -0.16], DARK_STEEL, undefined, "utensil-rail");
  for (const x of [-0.62, -0.34, -0.06, 0.22, 0.5]) {
    rod([x, 1.89, -0.16], [x, 1.7, -0.16], 0.009, BRASS, "utensil-hook");
  }
  rod([-0.62, 1.69, -0.16], [-0.62, 1.43, -0.16], 0.018, STEEL, "ladle-handle");
  sphere(0.07, [-0.62, 1.39, -0.16], STEEL, "ladle-bowl");
  rod([-0.34, 1.69, -0.16], [-0.34, 1.46, -0.16], 0.014, STEEL, "knife-handle");
  box([0.11, 0.025, 0.19], [-0.34, 1.38, -0.16], STEEL, [0, 0, 12], "knife-blade");
  rod([-0.06, 1.69, -0.16], [-0.06, 1.42, -0.16], 0.018, WARM_STEEL, "spatula-handle");
  box([0.15, 0.025, 0.13], [-0.06, 1.34, -0.16], WARM_STEEL, undefined, "spatula-head");

  // Small food-storage canisters on the counter.
  const canisters = [
    [-1.52, -0.72, OFFWHITE],
    [-1.32, -0.72, CREAM],
    [0.49, -0.72, BLUE],
    [0.68, -0.72, GREEN],
  ] as const;
  for (const [x, z, col] of canisters) {
    cyl(0.075, 0.22, [x, 1.38, z], col, undefined, "ration-canister", 10);
    cyl(0.082, 0.018, [x, 1.5, z], BRASS, undefined, "canister-lid", 10);
    box([0.095, 0.045, 0.008], [x, 1.38, z + 0.075], RED, undefined, "canister-label");
  }

  // Rear control panel above the stove.
  box([1.05, 0.62, 0.055], [0.05, 1.98, -0.36], DARK_STEEL, undefined, "control-panel");
  box([0.86, 0.42, 0.018], [0.05, 2.0, -0.325], RUBBER, undefined, "control-panel-face");
  for (const x of [-0.29, -0.05, 0.19, 0.43]) {
    cyl(0.045, 0.025, [x, 2.12, -0.305], BRASS, [90, 0, 0], "control-dial", 8);
    cyl(0.022, 0.02, [x, 1.88, -0.31], x < 0 ? RED : GREEN, [90, 0, 0], "control-light", 8);
  }
  for (let i = 0; i < 5; i++) {
    box([0.07, 0.018, 0.018], [-0.3 + i * 0.15, 2.0, -0.305], i === 2 ? WARNING : LIGHT, undefined, "panel-mark");
  }

  // Warning stripe plates and industrial labels.
  box([0.42, 0.035, 0.018], [-1.48, 1.01, 0.035], WARNING, undefined, "hazard-plate");
  for (let i = 0; i < 6; i++) {
    box([0.035, 0.045, 0.022], [-1.66 + i * 0.075, 1.01, 0.052], INK, [0, 0, -35], "hazard-stripe");
  }
  box([0.34, 0.18, 0.025], [0.54, 0.88, 0.035], RED, undefined, "oven-warning-label");
  box([0.23, 0.025, 0.01], [0.54, 0.89, 0.052], LIGHT, undefined, "label-line");
  box([0.18, 0.025, 0.01], [0.54, 0.84, 0.052], LIGHT, undefined, "label-line");

  // Riveted lower seams and feet.
  screwLine(-1.6, 1.6, 0.19, 0.03);
  for (const x of [-1.52, -0.52, 0.52, 1.52]) {
    box([0.16, 0.08, 0.52], [x, 0.18, -0.47], RUBBER, undefined, "cabinet-foot");
    cyl(0.07, 0.035, [x, 0.13, -0.47], BRASS, undefined, "foot-pad", 8);
  }

  // Ceiling utility trunk and fluorescent light.
  box([3.0, 0.16, 0.26], [0, 2.82, 0.15], PANEL_DARK, undefined, "ceiling-trunk");
  box([1.45, 0.06, 0.17], [0, 2.69, 0.12], LIGHT, undefined, "fluorescent-light");
  box([1.2, 0.018, 0.12], [0, 2.65, 0.12], "#e7ddb3", undefined, "light-emitter");
  for (const x of [-1.4, 1.4]) {
    rod([x, 2.83, 0.15], [x, 2.48, 0.15], 0.018, STEEL, "ceiling-brace");
  }

  // A few deliberately heavy Nostromo-style wall ribs and junction boxes.
  for (const x of [-1.58, 1.58]) {
    box([0.22, 1.82, 0.16], [x, 1.44, -0.72], PANEL, [0, 0, x > 0 ? -8 : 8], "side-wall-rib");
    for (const y of [0.45, 1.1, 1.75, 2.38]) rivet(x > 0 ? x - 0.11 : x + 0.11, y, -0.62);
  }
  box([0.38, 0.34, 0.16], [1.49, 2.3, -0.74], DARK_STEEL, undefined, "junction-box");
  box([0.22, 0.08, 0.018], [1.49, 2.31, -0.645], RED, undefined, "junction-warning");
  rod([1.28, 2.2, -0.64], [0.98, 2.2, -0.64], 0.012, COPPER, "junction-wire");
  rod([1.7, 2.15, -0.64], [1.7, 1.62, -0.64], 0.012, COPPER, "junction-wire");

  return b.root;
}
```