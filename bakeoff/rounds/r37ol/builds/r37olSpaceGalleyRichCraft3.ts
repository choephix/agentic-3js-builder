import * as THREE from "three";
import { createBuilder, rng, svg } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A cramped, grimy industrial spaceship galley in the style of Alien's 1979 Nostromo: ribbed bulkheads, olive cabinets, a deep sink, stove, oven, refrigerator, overhead pipes, warning labels, utility conduits, and a few sickly green indicators.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const INK = "#171916";
  const VOID = "#0b0d0c";
  const BULK = "#343936";
  const BULK_DARK = "#202421";
  const OLIVE = "#59604a";
  const OLIVE_DARK = "#373d31";
  const RUBBER = "#111411";
  const STEEL = metal("steel", { tarnish: 0.72, polish: 0.12, size: 0.12, seed: 14 });
  const OLD_BRASS = metal("brass", { tarnish: 0.82, verdigris: 0.3, polish: 0.08, size: 0.08, seed: 8 });
  const COPPER = metal("copper", { tarnish: 0.62, verdigris: 0.25, polish: 0.13, size: 0.1, seed: 19 });
  const PANEL = panelled(OLIVE, { size: 0.16, aspect: 0.75, rivets: 0.055 });
  const PANEL_DARK = panelled(OLIVE_DARK, { size: 0.12, aspect: 0.8, rivets: 0.045 });
  const RED = "#a52e25";
  const AMBER = "#e4a43b";
  const GREEN = "#78b77a";
  const CREAM = "#d4c89c";

  const part = (
    geo: THREE.BufferGeometry,
    color: any,
    at: [number, number, number],
    options: any = {},
  ) => b.part(geo, color, { at, ...options });

  const box = (
    size: [number, number, number],
    color: any,
    at: [number, number, number],
    options: any = {},
  ) =>
    part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, {
      flat: true,
      ...options,
    });

  const cyl = (
    radius: number,
    height: number,
    color: any,
    at: [number, number, number],
    options: any = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, options.segments ?? 10, 1),
      color,
      at,
      { flat: true, ...options },
    );

  const sphere = (
    radius: number,
    color: any,
    at: [number, number, number],
    options: any = {},
  ) =>
    part(new THREE.SphereGeometry(radius, options.segments ?? 8, options.rings ?? 5), color, at, {
      flat: true,
      ...options,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: any,
    options: any = {},
  ) => b.rod(a, z, radius, { color, section: { ngon: 8 }, ...options });

  const label = (
    text: string,
    at: [number, number, number],
    size: [number, number],
    color = CREAM,
  ) => {
    const tex = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80">
        <rect width="320" height="80" fill="#151815"/>
        <rect x="4" y="4" width="312" height="72" fill="none" stroke="#988f6b" stroke-width="4"/>
        <text x="160" y="53" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" letter-spacing="2" fill="${color}">${text}</text>
      </svg>`,
      { size: 256, pixelated: true },
    );
    return part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", at, {
      dir: [0, 0, 1],
      axis: "z",
      texture: tex,
      name: `label_${text}`,
    });
  };

  const hazard = (at: [number, number, number], w = 0.18, h = 0.09) => {
    const tex = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80">
        <rect width="160" height="80" fill="#1b1d18"/>
        <path d="M12 68 L40 12 L68 68 Z" fill="#c59635" stroke="#111" stroke-width="5"/>
        <path d="M40 27 L40 49 M40 57 L40 61" stroke="#151515" stroke-width="7"/>
        <path d="M80 12 H148 V68 H80 Z" fill="#a63c2c"/>
        <text x="114" y="49" text-anchor="middle" font-family="sans-serif" font-size="23" font-weight="bold" fill="#efe0a0">CAUTION</text>
      </svg>`,
      { size: 256, pixelated: true },
    );
    return part(new THREE.PlaneGeometry(w, h), "#ffffff", at, {
      dir: [0, 0, 1],
      axis: "z",
      texture: tex,
      name: "hazard-decal",
    });
  };

  // Floor plinth and rear wall: a compact, claustrophobic room-sized prop group.
  box([2.65, 0.08, 1.58], RUBBER, [0, 0.04, 0.0]);
  box([2.58, 0.12, 1.52], BULK_DARK, [0, 0.13, 0.0]);
  box([2.72, 2.05, 0.11], BULK_DARK, [0, 1.12, -0.74]);
  box([0.12, 2.05, 1.58], BULK_DARK, [-1.30, 1.12, 0]);
  box([0.12, 2.05, 1.58], BULK_DARK, [1.30, 1.12, 0]);

  // Rear wall ribs and service panels.
  for (const x of [-1.13, -0.78, -0.43, 0, 0.43, 0.78, 1.13]) {
    box([0.065, 1.92, 0.10], BULK, [x, 1.13, -0.665]);
    box([0.025, 1.72, 0.018], "#555b4e", [x - 0.028, 1.13, -0.607]);
  }
  box([0.88, 0.64, 0.08], PANEL_DARK, [-0.78, 1.56, -0.60]);
  box([0.88, 0.64, 0.08], PANEL_DARK, [0.78, 1.56, -0.60]);
  label("GALLEY 04", [-0.78, 1.58, -0.555], [0.54, 0.12]);
  label("FOOD / WATER", [0.78, 1.58, -0.555], [0.58, 0.12]);

  // Main counter run, thick industrial lip.
  box([2.42, 0.16, 0.58], BULK_DARK, [0, 0.98, -0.31]);
  box([2.34, 0.11, 0.52], STEEL, [0, 1.105, -0.31]);
  box([2.38, 0.055, 0.59], OLIVE_DARK, [0, 1.18, -0.31]);
  box([2.45, 0.11, 0.08], STEEL, [0, 1.23, -0.59]);
  box([2.45, 0.11, 0.08], STEEL, [0, 1.23, -0.03]);

  // Lower cabinet carcasses and individual doors.
  box([0.74, 0.72, 0.48], PANEL, [-0.82, 0.59, -0.27]);
  box([0.74, 0.72, 0.48], PANEL, [0.0, 0.59, -0.27]);
  box([0.74, 0.72, 0.48], PANEL, [0.82, 0.59, -0.27]);
  for (const x of [-0.82, 0, 0.82]) {
    box([0.66, 0.53, 0.026], OLIVE_DARK, [x, 0.58, 0.015]);
    box([0.58, 0.035, 0.035], STEEL, [x, 0.84, 0.038]);
    cyl(0.018, 0.035, OLD_BRASS, [x - 0.16, 0.84, 0.055], { dir: [0, 0, 1] });
    cyl(0.018, 0.035, OLD_BRASS, [x + 0.16, 0.84, 0.055], { dir: [0, 0, 1] });
  }
  label("STOW", [-0.82, 0.59, 0.04], [0.30, 0.075]);
  label("DRY", [0, 0.59, 0.04], [0.22, 0.075]);
  label("WASTE", [0.82, 0.59, 0.04], [0.32, 0.075]);

  // Deep sink on the left with drain and gooseneck tap.
  box([0.65, 0.14, 0.42], STEEL, [-0.78, 1.255, -0.31]);
  box([0.54, 0.08, 0.31], VOID, [-0.78, 1.35, -0.31]);
  box([0.47, 0.035, 0.25], "#292e29", [-0.78, 1.39, -0.31]);
  cyl(0.045, 0.012, STEEL, [-0.78, 1.412, -0.31], { dir: [0, 1, 0], segments: 12 });
  rod([-0.42, 1.39, -0.32], [-0.42, 1.64, -0.32], 0.025, COPPER);
  b.sweep(
    [
      [-0.42, 1.64, -0.32],
      [-0.39, 1.69, -0.32],
      [-0.30, 1.70, -0.32],
    ],
    0.025,
    { color: COPPER, caps: "round" },
  );
  cyl(0.035, 0.08, OLD_BRASS, [-0.55, 1.38, -0.05], { dir: [0, 0, 1] });
  cyl(0.035, 0.08, OLD_BRASS, [-1.00, 1.38, -0.05], { dir: [0, 0, 1] });

  // Four-burner cooking unit and heavy raised grates.
  box([0.72, 0.10, 0.43], RUBBER, [0.13, 1.32, -0.31]);
  box([0.64, 0.025, 0.36], STEEL, [0.13, 1.39, -0.31]);
  for (const x of [-0.08, 0.34]) {
    for (const z of [-0.42, -0.20]) {
      cyl(0.10, 0.025, INK, [x, 1.425, z], { segments: 10 });
      cyl(0.035, 0.03, OLD_BRASS, [x, 1.447, z], { segments: 8 });
    }
  }
  for (const x of [-0.22, 0.22]) rod([x, 1.46, -0.53], [x, 1.46, -0.08], 0.012, STEEL);
  for (const z of [-0.53, -0.08]) rod([-0.22, 1.46, z], [0.22, 1.46, z], 0.012, STEEL);
  label("HOT SURFACE", [0.13, 1.405, -0.055], [0.42, 0.065], AMBER);

  // Oven module on the right, with inset window and latches.
  box([0.70, 0.74, 0.54], PANEL_DARK, [0.80, 0.62, 0.25]);
  box([0.58, 0.47, 0.035], INK, [0.80, 0.66, 0.535]);
  box([0.51, 0.30, 0.018], "#303832", [0.80, 0.68, 0.558]);
  box([0.48, 0.035, 0.035], STEEL, [0.80, 0.92, 0.572]);
  for (const x of [0.58, 1.02]) {
    cyl(0.023, 0.045, OLD_BRASS, [x, 0.91, 0.595], { dir: [0, 0, 1] });
    cyl(0.012, 0.05, RUBBER, [x, 0.91, 0.622], { dir: [0, 0, 1] });
  }
  label("OVEN 180", [0.80, 0.47, 0.558], [0.38, 0.07], AMBER);
  hazard([0.80, 0.87, 0.59], 0.22, 0.10);

  // Wall-mounted refrigerator / food locker above counter.
  box([0.62, 0.76, 0.42], PANEL_DARK, [-0.78, 1.95, -0.40]);
  box([0.54, 0.62, 0.025], OLIVE, [-0.78, 1.95, -0.185]);
  box([0.46, 0.035, 0.04], STEEL, [-0.78, 2.19, -0.16]);
  box([0.07, 0.47, 0.025], BULK_DARK, [-0.51, 1.95, -0.155]);
  for (const y of [1.75, 1.98, 2.21]) cyl(0.018, 0.035, OLD_BRASS, [-0.63, y, -0.15], { dir: [0, 0, 1] });
  label("COLD STORE", [-0.78, 1.72, -0.154], [0.38, 0.075]);

  // Upper open shelf and hanging mug / ration canisters.
  box([1.24, 0.075, 0.43], STEEL, [0.45, 1.77, -0.18]);
  box([1.20, 0.055, 0.08], BULK_DARK, [0.45, 1.83, -0.18]);
  rod([-0.14, 1.82, 0.01], [1.03, 1.82, 0.01], 0.018, OLD_BRASS);
  for (const x of [0.02, 0.31, 0.60, 0.89]) {
    cyl(0.065, 0.16, x === 0.31 ? RED : STEEL, [x, 1.96, -0.15], { segments: 8 });
    cyl(0.071, 0.018, OLD_BRASS, [x, 2.045, -0.15], { segments: 8 });
  }
  cyl(0.09, 0.12, "#b3a87f", [0.78, 1.74, -0.15], { dir: [0, 1, 0], segments: 10 });
  cyl(0.065, 0.14, VOID, [0.78, 1.81, -0.15], { dir: [0, 1, 0], segments: 10 });

  // Overhead cable tray, pipes, and a chunky ventilation hood.
  box([2.30, 0.12, 0.34], BULK_DARK, [0, 2.15, -0.23]);
  box([1.10, 0.18, 0.68], PANEL_DARK, [0.25, 2.04, -0.32]);
  box([0.88, 0.04, 0.46], VOID, [0.25, 1.94, -0.32]);
  for (const x of [-1.05, -0.72, -0.39, 0.95, 1.16]) {
    rod([x, 2.17, -0.60], [x, 2.17, 0.43], 0.022, STEEL);
  }
  rod([-1.12, 2.28, -0.55], [1.15, 2.28, -0.55], 0.028, COPPER);
  rod([-1.10, 2.36, -0.42], [0.48, 2.36, -0.42], 0.018, STEEL);
  rod([0.48, 2.36, -0.42], [0.92, 2.16, -0.42], 0.018, STEEL);
  for (const x of [-1.04, -0.84, -0.64, 0.92, 1.08]) {
    cyl(0.035, 0.045, OLD_BRASS, [x, 2.25, -0.55], { dir: [0, 1, 0], segments: 8 });
  }

  // Right-side utility panel with retro switches, meter and warning stripes.
  box([0.18, 1.03, 0.58], PANEL_DARK, [1.17, 1.55, 0.30]);
  box([0.12, 0.73, 0.035], INK, [1.17, 1.59, 0.605]);
  for (let i = 0; i < 5; i++) {
    box([0.035, 0.07, 0.025], i === 2 ? RED : GREEN, [1.09, 1.88 - i * 0.14, 0.63]);
    box([0.035, 0.07, 0.025], i === 3 ? AMBER : STEEL, [1.25, 1.88 - i * 0.14, 0.63]);
  }
  cyl(0.095, 0.025, STEEL, [1.17, 1.34, 0.63], { dir: [0, 0, 1], segments: 16 });
  cyl(0.063, 0.032, "#b2a879", [1.17, 1.34, 0.65], { dir: [0, 0, 1], segments: 16 });
  rod([1.17, 1.34, 0.675], [1.20, 1.40, 0.68], 0.008, RED);
  label("POWER", [1.17, 1.10, 0.635], [0.22, 0.06], AMBER);
  hazard([1.17, 1.99, 0.64], 0.16, 0.08);

  // Small blinking controls.
  const lights: THREE.Object3D[] = [];
  lights.push(part(new THREE.SphereGeometry(0.025, 8, 5), GREEN, [-0.14, 1.49, -0.04]));
  lights.push(part(new THREE.SphereGeometry(0.025, 8, 5), RED, [0.00, 1.49, -0.04]));
  lights.push(part(new THREE.SphereGeometry(0.025, 8, 5), AMBER, [0.14, 1.49, -0.04]));
  for (const l of lights) glow(l, 1.8);

  // Repeated rivets give the silhouette that cast-metal industrial character.
  const rivetXs = [-1.18, -0.88, -0.58, -0.28, 0.28, 0.58, 0.88, 1.18];
  for (const x of rivetXs) {
    sphere(0.018, OLD_BRASS, [x, 1.27, -0.635], { segments: 7, rings: 4 });
    sphere(0.018, OLD_BRASS, [x, 0.25, -0.635], { segments: 7, rings: 4 });
  }

  // Floor drain, loose hose, and a battered service crate at the edge of the galley.
  box([0.34, 0.025, 0.28], STEEL, [-1.02, 0.205, 0.48]);
  box([0.25, 0.012, 0.19], VOID, [-1.02, 0.224, 0.48]);
  for (const x of [-1.10, -1.02, -0.94]) rod([x, 0.23, 0.39], [x, 0.23, 0.57], 0.008, STEEL);
  box([0.38, 0.32, 0.36], PANEL_DARK, [1.02, 0.34, 0.54]);
  box([0.29, 0.23, 0.025], OLIVE, [1.02, 0.36, 0.73]);
  box([0.24, 0.025, 0.035], STEEL, [1.02, 0.49, 0.75]);
  label("RATIONS", [1.02, 0.34, 0.748], [0.25, 0.055]);

  // A thick coiled hose hangs beside the sink.
  const hose: [number, number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const a = t * Math.PI * 2.3;
    hose.push([-1.17 + Math.cos(a) * (0.10 - 0.035 * t), 1.43 - t * 0.56, 0.50 + Math.sin(a) * (0.10 - 0.035 * t)]);
  }
  b.sweep(hose, 0.018, { color: RUBBER, caps: "round", section: { ngon: 8 } });

  // Stencilled labels and final grime-colored edge pieces.
  label("NO OPEN FLAME", [0.14, 1.52, -0.045], [0.42, 0.07], CREAM);
  label("AUTHORIZED CREW", [0.42, 2.04, -0.52], [0.48, 0.07], CREAM);
  hazard([-0.34, 1.24, -0.645], 0.20, 0.09);

  // A few exposed bolts along the side uprights.
  for (const x of [-1.24, 1.24]) {
    for (const y of [0.28, 0.72, 1.16, 1.60, 2.00]) {
      cyl(0.022, 0.035, OLD_BRASS, [x, y, -0.61], { dir: [0, 0, 1], segments: 8 });
    }
  }

  return b.root;
}
