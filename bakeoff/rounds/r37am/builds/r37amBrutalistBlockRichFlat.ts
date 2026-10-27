import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Monumental Brutalist Housing Block",
  description:
    "A raw-concrete brutalist housing megastructure with stepped massing, deep recessed windows, projecting balconies, monumental columns, rooftop service blocks, water tanks, vents, and expressive structural braces.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = "#8b8b82";
  const CONCRETE_LIGHT = "#a7a69a";
  const CONCRETE_DARK = "#686a64";
  const CONCRETE_WARM = "#96958a";
  const SHADOW = "#343b3d";
  const WINDOW = "#18252a";
  const WINDOW_BLUE = "#243b40";
  const FRAME = "#555b57";
  const METAL = "#3e4644";
  const RUST = "#744b36";
  const SAFETY = "#c36a28";
  const PALE = "#bbb9a6";
  const GREEN = "#3d5540";
  const WATER = "#536b70";

  const box = (
    w: number,
    h: number,
    d: number,
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, {
      at,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    axis: "x" | "y" | "z" = "y",
    name?: string,
    segments = 8,
  ) => {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
    const rotation =
      axis === "x"
        ? [0, 0, 90]
        : axis === "z"
          ? [90, 0, 0]
          : undefined;
    return b.part(geometry, color, {
      at,
      rotation,
      name,
      flat: true,
    });
  };

  const beam = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, name, section: { ngon: 4 } });

  const frontWindow = (
    x: number,
    y: number,
    w: number,
    h: number,
    z = 3.43,
    color = WINDOW,
    name = "recessed-window",
  ) => {
    box(w, h, 0.12, [x, y, z], color, name);
    box(0.055, h + 0.09, 0.18, [x - w / 2 - 0.035, y, z + 0.035], FRAME, "window-side-jamb");
    box(0.055, h + 0.09, 0.18, [x + w / 2 + 0.035, y, z + 0.035], FRAME, "window-side-jamb");
    box(w + 0.1, 0.055, 0.18, [x, y + h / 2 + 0.035, z + 0.035], FRAME, "window-lintel");
    box(w + 0.1, 0.055, 0.18, [x, y - h / 2 - 0.035, z + 0.035], FRAME, "window-sill");
  };

  const sideWindow = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    side: 1 | -1,
    color = WINDOW,
  ) => {
    box(0.12, h, w, [x, y, z], color, "side-recessed-window");
    box(0.18, h + 0.09, 0.055, [x + side * 0.035, y, z - w / 2 - 0.035], FRAME, "side-jamb");
    box(0.18, h + 0.09, 0.055, [x + side * 0.035, y, z + w / 2 + 0.035], FRAME, "side-jamb");
    box(0.18, 0.055, w + 0.1, [x + side * 0.035, y + h / 2 + 0.035, z], FRAME, "side-lintel");
    box(0.18, 0.055, w + 0.1, [x + side * 0.035, y - h / 2 - 0.035, z], FRAME, "side-sill");
  };

  const balcony = (x: number, y: number, z: number, w: number, d: number) => {
    box(w, 0.28, d, [x, y, z], CONCRETE_LIGHT, "projecting-balcony-slab");
    box(w, 0.95, 0.16, [x, y + 0.53, z + d / 2 - 0.07], CONCRETE_DARK, "balcony-parapet");
    box(0.16, 0.95, d, [x - w / 2 + 0.08, y + 0.53, z], CONCRETE_DARK, "balcony-cheek");
    box(0.16, 0.95, d, [x + w / 2 - 0.08, y + 0.53, z], CONCRETE_DARK, "balcony-cheek");
    for (let i = 0; i < 5; i++) {
      const px = x - w / 2 + 0.25 + i * ((w - 0.5) / 4);
      beam([px, y + 0.12, z + d / 2 + 0.02], [px, y + 0.88, z + d / 2 + 0.02], 0.025, METAL, "balcony-rail");
    }
  };

  const planter = (x: number, y: number, z: number, w: number, d: number) => {
    box(w, 0.3, d, [x, y, z], CONCRETE_DARK, "concrete-planter");
    box(w - 0.08, 0.12, d - 0.08, [x, y + 0.18, z], GREEN, "planter-soil");
    for (let i = 0; i < 4; i++) {
      const px = x - w / 2 + 0.15 + i * ((w - 0.3) / 3);
      beam([px, y + 0.22, z], [px + (i % 2 ? 0.08 : -0.06), y + 0.62 + (i % 3) * 0.08, z], 0.035, GREEN, "planter-stem");
    }
  };

  // ---------------------------------------------------------------------------
  // Grounded podium and severe stepped plinth
  // ---------------------------------------------------------------------------

  box(12.8, 0.9, 8.8, [0, 0.45, 0], CONCRETE_DARK, "sunken-foundation-plinth");
  box(12.2, 1.35, 8.35, [0, 1.45, 0], CONCRETE, "podium-base");
  box(11.6, 1.1, 7.85, [0, 2.65, 0], CONCRETE_LIGHT, "podium-cap");
  box(10.8, 0.45, 7.4, [0, 3.42, 0], CONCRETE_DARK, "podium-shadow-joint");

  // Heavy podium pilotis and dark undercroft.
  for (const x of [-5.1, -3.4, 3.4, 5.1]) {
    box(0.48, 2.9, 0.72, [x, 2.0, 3.18], CONCRETE_LIGHT, "front-pilotis");
    box(0.48, 2.9, 0.72, [x, 2.0, -3.18], CONCRETE_DARK, "rear-pilotis");
  }
  for (const x of [-5.8, -2.0, 2.0, 5.8]) {
    box(0.5, 2.75, 0.62, [x, 2.0, 0], CONCRETE_WARM, "podium-column");
  }

  // Deep black openings beneath the upper building.
  box(8.2, 2.15, 0.18, [0, 2.05, 3.86], SHADOW, "undercroft-darkness");
  box(8.2, 2.15, 0.18, [0, 2.05, -3.86], SHADOW, "rear-undercroft-darkness");
  box(0.18, 2.15, 5.1, [-5.92, 2.05, 0], SHADOW, "left-undercroft-darkness");
  box(0.18, 2.15, 5.1, [5.92, 2.05, 0], SHADOW, "right-undercroft-darkness");

  // Low podium public windows / brutalist shopfronts.
  for (const x of [-4.5, -2.25, 0, 2.25, 4.5]) {
    box(1.55, 1.25, 0.1, [x, 2.22, 3.99], WINDOW_BLUE, "podium-glazing");
    box(0.1, 1.42, 0.14, [x - 0.84, 2.22, 4.02], FRAME, "podium-window-jamb");
    box(0.1, 1.42, 0.14, [x + 0.84, 2.22, 4.02], FRAME, "podium-window-jamb");
    box(1.7, 0.1, 0.14, [x, 2.93, 4.02], FRAME, "podium-window-head");
  }

  // ---------------------------------------------------------------------------
  // Main elevated housing slab: a monolithic 11-storey block
  // ---------------------------------------------------------------------------

  box(10.5, 15.15, 6.65, [0, 10.75, 0], CONCRETE, "main-housing-slab");
  box(10.92, 0.36, 6.98, [0, 3.58, 0], CONCRETE_LIGHT, "slab-bottom-edge");
  box(10.92, 0.34, 6.98, [0, 18.30, 0], CONCRETE_DARK, "roof-edge-shadow");
  box(0.32, 15.2, 6.95, [-5.38, 10.82, 0], CONCRETE_DARK, "left-blank-end-wall");
  box(0.32, 15.2, 6.95, [5.38, 10.82, 0], CONCRETE_WARM, "right-blank-end-wall");

  // Front facade floor bands, giving the block a cast-in-place rhythm.
  for (let floor = 0; floor < 10; floor++) {
    const y = 4.05 + floor * 1.38;
    box(10.72, 0.18, 0.18, [0, y - 0.67, 3.39], CONCRETE_DARK, "horizontal-cast-joint");
  }

  // Repeated front housing windows, deliberately irregular in balcony placement.
  const floorYs = [4.65, 6.03, 7.41, 8.79, 10.17, 11.55, 12.93, 14.31, 15.69, 17.07];
  for (let i = 0; i < floorYs.length; i++) {
    const y = floorYs[i];
    frontWindow(-3.95, y, 1.32, 0.82, 3.42, i % 3 === 0 ? WINDOW_BLUE : WINDOW, "front-window-left");
    frontWindow(-2.35, y, 1.05, 0.82, 3.42, WINDOW, "front-window-small");
    frontWindow(2.35, y, 1.05, 0.82, 3.42, i % 2 ? WINDOW_BLUE : WINDOW, "front-window-small");
    frontWindow(3.95, y, 1.32, 0.82, 3.42, WINDOW, "front-window-right");
  }

  // Central service/stair core rising through the front like a heavy concrete scar.
  box(1.72, 14.75, 0.5, [0, 10.92, 3.55], CONCRETE_DARK, "projecting-stair-core");
  box(1.04, 13.8, 0.12, [0, 10.9, 3.84], WINDOW, "stair-core-slot");
  for (let i = 0; i < 9; i++) {
    const y = 4.45 + i * 1.38;
    box(1.22, 0.075, 0.16, [0, y, 3.91], CONCRETE_LIGHT, "stair-slot-sill");
  }
  box(2.25, 0.32, 6.95, [0, 18.15, 0], CONCRETE_LIGHT, "stair-core-crown");

  // Recessed entrances and giant entry canopy.
  box(2.3, 2.2, 0.22, [0, 4.15, 3.96], SHADOW, "monumental-entry-recess");
  box(1.25, 1.92, 0.1, [0, 4.05, 4.1], WINDOW_BLUE, "entry-glass");
  box(0.18, 2.15, 0.28, [-1.16, 4.12, 4.02], CONCRETE_LIGHT, "entry-jamb");
  box(0.18, 2.15, 0.28, [1.16, 4.12, 4.02], CONCRETE_LIGHT, "entry-jamb");
  box(3.15, 0.32, 1.55, [0, 5.38, 4.18], CONCRETE_LIGHT, "entry-canopy");
  beam([-1.3, 5.2, 4.08], [-1.3, 4.28, 4.08], 0.055, METAL, "canopy-tie");
  beam([1.3, 5.2, 4.08], [1.3, 4.28, 4.08], 0.055, METAL, "canopy-tie");

  // ---------------------------------------------------------------------------
  // Balconies and projecting living units on the front
  // ---------------------------------------------------------------------------

  balcony(-3.25, 6.05, 3.86, 2.65, 1.15);
  balcony(3.25, 8.81, 3.86, 2.65, 1.15);
  balcony(-3.25, 11.57, 3.86, 2.65, 1.15);
  balcony(3.25, 14.33, 3.86, 2.65, 1.15);
  balcony(-3.25, 17.09, 3.86, 2.65, 1.15);

  planter(-3.25, 6.30, 3.42, 1.5, 0.28);
  planter(3.25, 9.06, 3.42, 1.5, 0.28);
  planter(-3.25, 11.82, 3.42, 1.5, 0.28);
  planter(3.25, 14.58, 3.42, 1.5, 0.28);
  planter(-3.25, 17.34, 3.42, 1.5, 0.28);

  // Concrete balcony underslung brackets, a repeated sawtooth shadow.
  for (const [x, y] of [
    [-4.2, 6.05],
    [-2.3, 6.05],
    [2.3, 8.81],
    [4.2, 8.81],
    [-4.2, 11.57],
    [-2.3, 11.57],
    [2.3, 14.33],
    [4.2, 14.33],
    [-4.2, 17.09],
    [-2.3, 17.09],
  ] as [number, number][]) {
    beam([x, y - 0.12, 3.3], [x, y - 0.62, 3.84], 0.11, CONCRETE_DARK, "balcony-bracket");
  }

  // Side elevations: narrow strip windows and alternating punched voids.
  for (const side of [-1, 1] as const) {
    const x = side * 5.48;
    for (let floor = 0; floor < 10; floor++) {
      const y = floorYs[floor];
      sideWindow(x, y, -2.15, 1.02, 0.82, side, floor % 2 ? WINDOW_BLUE : WINDOW);
      if (floor % 2 === 0) sideWindow(x, y, 0.1, 0.72, 0.82, side, WINDOW);
      if (floor % 3 !== 1) sideWindow(x, y, 2.2, 0.9, 0.82, side, WINDOW);
    }
  }

  // Side fire stairs expressed as external concrete zig-zag flights.
  for (const side of [-1, 1] as const) {
    const x = side * 5.78;
    box(0.38, 11.0, 1.5, [x, 10.1, 3.0], CONCRETE_DARK, "side-fire-stair-tower");
    for (let i = 0; i < 9; i++) {
      const y = 4.55 + i * 1.18;
      box(0.88, 0.16, 1.9, [x - side * 0.3, y, 3.0], CONCRETE_LIGHT, "external-stair-landing");
      beam(
        [x - side * 0.68, y + 0.08, 2.1],
        [x - side * 0.68, y + 0.08, 3.9],
        0.035,
        METAL,
        "stair-handrail",
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Rear elevation: deep service slots, ducts, and a faceted brutalist rhythm
  // ---------------------------------------------------------------------------

  box(10.72, 0.32, 0.22, [0, 4.0, -3.42], CONCRETE_LIGHT, "rear-floor-band");
  for (let floor = 0; floor < 10; floor++) {
    const y = floorYs[floor];
    for (const x of [-3.7, -2.05, 2.05, 3.7]) {
      box(1.18, 0.68, 0.12, [x, y, -3.43], WINDOW, "rear-window");
      box(0.08, 0.82, 0.16, [x - 0.65, y, -3.48], FRAME, "rear-jamb");
      box(0.08, 0.82, 0.16, [x + 0.65, y, -3.48], FRAME, "rear-jamb");
    }
    box(10.6, 0.13, 0.16, [0, y - 0.63, -3.49], CONCRETE_DARK, "rear-cast-line");
  }

  // Large rear service void and laundry bridge.
  box(2.15, 7.8, 0.2, [0, 10.8, -3.5], SHADOW, "rear-service-void");
  box(1.4, 7.0, 0.12, [0, 10.8, -3.62], WINDOW_BLUE, "rear-stair-glass");
  for (let i = 0; i < 6; i++) {
    box(1.65, 0.12, 0.15, [0, 7.0 + i * 1.35, -3.72], CONCRETE_LIGHT, "rear-stair-landing");
  }

  // ---------------------------------------------------------------------------
  // Roofline: parapets, service sheds, water tanks, vents, and crude machinery
  // ---------------------------------------------------------------------------

  box(11.35, 0.65, 7.25, [0, 18.78, 0], CONCRETE_DARK, "roof-parapet-base");
  box(11.75, 0.48, 0.42, [0, 19.28, 3.42], CONCRETE_LIGHT, "front-roof-parapet");
  box(11.75, 0.48, 0.42, [0, 19.28, -3.42], CONCRETE_LIGHT, "rear-roof-parapet");
  box(0.42, 0.48, 6.5, [-5.58, 19.28, 0], CONCRETE_LIGHT, "left-roof-parapet");
  box(0.42, 0.48, 6.5, [5.58, 19.28, 0], CONCRETE_LIGHT, "right-roof-parapet");

  // Offset rooftop plant rooms create the characteristic stepped skyline.
  box(3.25, 1.95, 2.55, [-3.25, 20.42, -0.8], CONCRETE, "roof-mechanical-room");
  box(2.1, 1.35, 2.0, [1.7, 20.12, -0.25], CONCRETE_WARM, "roof-stair-headhouse");
  box(2.4, 0.8, 1.6, [3.65, 19.82, 1.3], CONCRETE_DARK, "roof-utility-box");
  box(3.7, 0.2, 2.9, [-3.25, 21.45, -0.8], CONCRETE_LIGHT, "mechanical-room-cap");

  // Repeated roof vents.
  for (const x of [-4.35, -3.4, -2.45, 2.8, 3.6, 4.4]) {
    cyl(0.18, 0.72, [x, 19.78, 2.15], METAL, "y", "roof-vent", 8);
    box(0.42, 0.12, 0.42, [x, 20.16, 2.15], CONCRETE_DARK, "roof-vent-cap");
  }

  // Water tanks on rough concrete legs.
  for (const x of [-1.0, 0.45]) {
    for (const z of [-1.4, 0.05]) {
      box(0.16, 1.25, 0.16, [x, 20.15, z], METAL, "tank-leg");
    }
  }
  cyl(0.78, 1.25, [-0.28, 21.0, -0.68], WATER, "y", "rooftop-water-tank", 12);
  cyl(0.8, 0.14, [-0.28, 21.68, -0.68], METAL, "y", "tank-lid", 12);
  cyl(0.12, 0.55, [-0.28, 22.0, -0.68], METAL, "y", "tank-neck", 8);
  box(1.95, 0.08, 0.08, [-0.28, 21.35, -1.48], METAL, "tank-pipe");
  beam([-1.25, 21.35, -1.48], [-1.25, 19.55, -1.48], 0.04, METAL, "tank-downpipe");

  // Tall communications mast and crude antenna geometry.
  cyl(0.075, 2.8, [2.75, 21.35, -1.0], METAL, "y", "roof-mast", 8);
  beam([2.75, 22.6, -1.0], [1.9, 22.15, -1.0], 0.035, METAL, "antenna-arm");
  beam([2.75, 22.6, -1.0], [3.6, 22.15, -1.0], 0.035, METAL, "antenna-arm");
  beam([2.75, 22.6, -1.0], [2.75, 22.15, -0.2], 0.035, METAL, "antenna-arm");
  cyl(0.11, 0.16, [2.75, 22.78, -1.0], SAFETY, "y", "aviation-light", 8);

  // Roof access guardrails.
  for (const x of [-4.7, -1.8, 1.3, 4.4]) {
    beam([x, 19.52, 3.0], [x, 20.2, 3.0], 0.03, METAL, "roof-guardrail-post");
  }
  beam([-4.7, 20.2, 3.0], [4.4, 20.2, 3.0], 0.035, METAL, "roof-guardrail");
  beam([-4.7, 19.55, 3.0], [4.4, 19.55, 3.0], 0.025, METAL, "roof-guardrail-low");

  // ---------------------------------------------------------------------------
  // Monumental external braces: diagonals make the silhouette unmistakably civic
  // ---------------------------------------------------------------------------

  for (const side of [-1, 1] as const) {
    const x = side * 5.62;
    beam([x, 4.1, 3.55], [x, 9.1, 3.55], 0.12, CONCRETE_DARK, "vertical-end-brace");
    beam([x, 9.1, 3.55], [x, 13.9, 3.55], 0.12, CONCRETE_LIGHT, "vertical-end-brace");
    beam([x, 13.9, 3.55], [x, 18.25, 3.55], 0.12, CONCRETE_DARK, "vertical-end-brace");
    beam([x, 4.25, 3.66], [x, 8.75, 3.66], 0.075, CONCRETE_WARM, "diagonal-facade-brace");
    beam([x, 8.75, 3.66], [x, 13.35, 3.66], 0.075, CONCRETE_WARM, "diagonal-facade-brace");
    beam([x, 13.35, 3.66], [x, 17.95, 3.66], 0.075, CONCRETE_WARM, "diagonal-facade-brace");
  }

  // Exposed vertical rainwater pipes add scale and human wear.
  for (const x of [-5.1, 5.1, -1.0, 1.0]) {
    cyl(0.045, 15.0, [x, 10.9, 3.72], RUST, "y", "rainwater-pipe", 6);
    box(0.16, 0.16, 0.11, [x, 4.2, 3.74], METAL, "pipe-collar");
    box(0.16, 0.16, 0.11, [x, 10.4, 3.74], METAL, "pipe-collar");
    box(0.16, 0.16, 0.11, [x, 16.6, 3.74], METAL, "pipe-collar");
  }

  // Satellite dishes / maintenance objects on one side of the roof.
  cyl(0.055, 1.3, [4.6, 20.2, -2.1], METAL, "y", "dish-mast", 8);
  b.part(new THREE.SphereGeometry(0.62, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), FRAME, {
    at: [4.6, 20.85, -2.1],
    rotation: [180, 0, 0],
    name: "satellite-dish",
    flat: true,
  });
  beam([4.6, 20.9, -2.1], [4.6, 21.55, -2.1], 0.025, METAL, "dish-feed-arm");

  // Small signs and color accents, kept subordinate to the concrete mass.
  box(1.8, 0.42, 0.06, [3.0, 4.1, 4.16], SAFETY, "entry-number-panel");
  box(1.25, 0.08, 0.065, [3.0, 4.1, 4.205], PALE, "entry-number-mark");
  box(0.08, 0.65, 0.09, [-5.75, 5.2, 3.96], SAFETY, "fire-sign");
  box(0.08, 0.65, 0.09, [5.75, 12.4, 3.96], SAFETY, "fire-sign");

  // A few isolated concrete scars / patch plates break the perfect repetition.
  box(0.42, 1.85, 0.08, [-4.75, 8.95, 3.52], CONCRETE_LIGHT, "patched-concrete-scar");
  box(0.3, 1.15, 0.08, [4.72, 13.1, 3.52], CONCRETE_DARK, "patched-concrete-scar");
  box(0.58, 0.28, 0.08, [-2.9, 15.1, 3.52], PALE, "patched-concrete-scar");
  box(0.22, 0.92, 0.08, [2.82, 6.75, 3.52], CONCRETE_WARM, "patched-concrete-scar");

  return b.root;
}
