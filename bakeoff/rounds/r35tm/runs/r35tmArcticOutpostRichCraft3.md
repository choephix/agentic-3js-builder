```ts
import * as THREE from "three";
import { createBuilder, rng, svg, catmull } from "agentic-3js-builder";
import { cel, animeEye, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "arctic-research-outpost",
  description: "A stylized Firewatch-inspired arctic research station diorama with snow, cabin, antenna, solar panels, supply gear, beacon, and polar details.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1, paintSize: 1024 });

  const SNOW = cel("#f4f1e8", "#b8c7d4", { threshold: 0.18 });
  const SNOW_BLUE = cel("#dceaf1", "#8ca9ba", { threshold: 0.12 });
  const ICE = cel("#8dd5df", "#3d8498", { threshold: 0.05 });
  const ROCK = cel("#47515b", "#202b38", { threshold: 0.15 });
  const ROCK_LIGHT = cel("#71818d", "#35424f", { threshold: 0.18 });
  const WOOD = cel("#c86e3e", "#713b34", { threshold: 0.12 });
  const WOOD_DARK = cel("#7b3e32", "#3b2630", { threshold: 0.1 });
  const TRIM = cel("#f2b84b", "#9d572f", { threshold: 0.1 });
  const ROOF = cel("#263f52", "#152536", { threshold: 0.1 });
  const ROOF_LIGHT = cel("#4d7080", "#263d4d", { threshold: 0.1 });
  const METAL = cel("#687f89", "#273b49", { threshold: 0.13 });
  const METAL_DARK = cel("#344a57", "#182833", { threshold: 0.1 });
  const GLASS = cel("#68c9d6", "#24617b", { threshold: 0.02 });
  const ORANGE = "#ee743d";
  const RED = cel("#df493b", "#762f3b", { threshold: 0.1 });
  const YELLOW = cel("#ffd05b", "#ad6139", { threshold: 0.1 });
  const DARK = "#172432";
  const WHITE = "#fff9e9";

  const winTexture = svg(
    `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="96" fill="#21495d"/>
      <path d="M0 67 Q26 45 47 63 T91 55 T128 62 V96 H0Z" fill="#6bc7cf"/>
      <path d="M0 76 Q26 58 52 75 T101 67 T128 70 V96 H0Z" fill="#bce6e3"/>
      <path d="M64 0V96M0 48H128" stroke="#f7c45b" stroke-width="7"/>
      <path d="M9 18h25M94 22h22M14 35h16M86 39h28" stroke="#eff7ee" stroke-width="3" opacity=".8"/>
      <circle cx="105" cy="18" r="7" fill="#fff5bc"/>
    </svg>`,
    { size: 256 },
  );

  const doorTexture = svg(
    `<svg viewBox="0 0 96 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="160" fill="#7d3d32"/>
      <path d="M8 0v160M29 0v160M53 0v160M79 0v160" stroke="#c66b3c" stroke-width="5"/>
      <path d="M0 26h96M0 80h96M0 134h96" stroke="#562f32" stroke-width="4"/>
      <circle cx="75" cy="82" r="7" fill="#f4bd4c"/>
      <path d="M18 15h60v130H18z" fill="none" stroke="#e99547" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const signTexture = svg(
    `<svg viewBox="0 0 256 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="250" height="74" rx="8" fill="#eeb74d" stroke="#241e28" stroke-width="7"/>
      <path d="M24 52 L38 26 L53 52 M31 43h14" fill="none" stroke="#241e28" stroke-width="6"/>
      <text x="69" y="51" font-family="sans-serif" font-weight="900" font-size="27" fill="#241e28">POLAR 07</text>
    </svg>`,
    { size: 512 },
  );

  const warningTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 7L122 112H6Z" fill="#f4bd43" stroke="#241e28" stroke-width="9"/>
      <path d="M64 33v40M64 91v7" stroke="#241e28" stroke-width="13" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const footprintTexture = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 4C19 6 11 24 14 43c2 15 11 25 21 22 10-3 15-18 14-35C48 13 43 3 34 4Z" fill="#7298a4"/>
      <circle cx="17" cy="74" r="5" fill="#7298a4"/><circle cx="28" cy="82" r="5" fill="#7298a4"/>
      <circle cx="40" cy="84" r="5" fill="#7298a4"/><circle cx="50" cy="78" r="4" fill="#7298a4"/>
    </svg>`,
    { size: 128 },
  );

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
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    segments = 10,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      name,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    scale: [number, number, number],
    color: any,
    name?: string,
  ) =>
    b.part(new THREE.IcosahedronGeometry(radius, 1), color, {
      at,
      scale,
      flat: true,
      name,
    });

  const rod = (a: [number, number, number], c: [number, number, number], radius: number, color: any, name?: string) =>
    b.rod(a, c, radius, { color, name, caps: "round" });

  // Snow island and layered ice shelf.
  box([7.2, 0.18, 5.4], [0, 0.09, 0], SNOW_BLUE, undefined, "snow-island");
  box([6.5, 0.12, 4.8], [0, 0.24, 0.05], SNOW, undefined, "snow-cap");
  box([4.2, 0.16, 1.3], [-2.05, 0.32, -1.42], ICE, undefined, "ice-shelf");
  box([2.2, 0.12, 0.8], [2.55, 0.27, 1.65], ICE, undefined, "ice-shelf-east");

  // Faceted snow banks around the perimeter.
  sphere(0.55, [-2.95, 0.55, 1.45], [1.9, 0.7, 0.75], SNOW, "snow-drift");
  sphere(0.42, [2.85, 0.48, -1.65], [1.8, 0.65, 0.72], SNOW, "snow-drift");
  sphere(0.32, [-2.7, 0.43, -1.75], [1.2, 0.55, 0.7], SNOW, "snow-drift");
  sphere(0.3, [2.95, 0.4, 0.65], [1.2, 0.55, 0.75], SNOW_BLUE, "snow-drift");

  // Rocky anchors.
  for (const [x, z, s] of [
    [-3.0, -0.75, 0.32],
    [-2.7, 1.9, 0.28],
    [2.95, -0.25, 0.35],
    [2.45, 1.95, 0.24],
    [0.15, -2.05, 0.3],
  ] as [number, number, number][]) {
    sphere(s, [x, 0.35 * s + 0.25, z], [1.2, 0.85, 1], ROCK, "perimeter-rock");
    sphere(s * 0.65, [x - s * 0.2, 0.35 * s + 0.43, z + s * 0.18], [1, 0.42, 0.8], ROCK_LIGHT, "rock-face");
  }

  // Main research cabin.
  box([2.55, 1.62, 1.82], [-0.25, 1.16, 0.05], WOOD, undefined, "main-cabin");
  box([2.72, 0.16, 1.96], [-0.25, 1.98, 0.05], WOOD_DARK, undefined, "cabin-eave");
  box([2.15, 0.09, 0.08], [-0.25, 1.28, 0.98], TRIM, undefined, "front-trim");
  box([2.15, 0.08, 0.08], [-0.25, 1.9, 0.98], TRIM, undefined, "front-trim");
  box([0.08, 1.42, 0.08], [-1.5, 1.58, 0.98], TRIM, undefined, "front-trim");
  box([0.08, 1.42, 0.08], [1.0, 1.58, 0.98], TRIM, undefined, "front-trim");

  // Snow-loaded pitched roof, two bold graphic planes.
  box([2.95, 0.18, 1.24], [-0.25, 2.38, 0.52], ROOF, [24, 0, 0], "roof-front");
  box([2.95, 0.18, 1.24], [-0.25, 2.38, -0.52], ROOF_LIGHT, [-24, 0, 0], "roof-back");
  box([3.05, 0.15, 0.18], [-0.25, 2.63, 0], SNOW, undefined, "roof-ridge");
  box([2.85, 0.1, 0.22], [-0.25, 2.12, 0.93], SNOW, [24, 0, 0], "snow-roof-lip");
  box([2.85, 0.1, 0.22], [-0.25, 2.12, -0.93], SNOW, [-24, 0, 0], "snow-roof-lip");

  // Front door and two large graphic windows.
  b.part(new THREE.PlaneGeometry(0.52, 1.05), WHITE, {
    at: [-0.82, 0.86, 0.975],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTexture,
    name: "front-door",
  });
  for (const x of [-0.05, 0.62]) {
    b.part(new THREE.PlaneGeometry(0.54, 0.62), WHITE, {
      at: [x, 1.55, 0.981],
      dir: [0, 0, 1],
      axis: "z",
      texture: winTexture,
      name: "front-window",
    });
    box([0.6, 0.055, 0.055], [x, 1.55, 1.005], TRIM, undefined, "window-sill");
  }

  // Side window and emergency warning panel.
  b.part(new THREE.PlaneGeometry(0.72, 0.58), WHITE, {
    at: [-1.535, 1.48, -0.18],
    dir: [-1, 0, 0],
    axis: "z",
    texture: winTexture,
    name: "side-window",
  });
  b.part(new THREE.PlaneGeometry(0.26, 0.26), WHITE, {
    at: [1.045, 1.55, 0.34],
    dir: [1, 0, 0],
    axis: "z",
    texture: warningTexture,
    name: "warning-sign",
  });

  // Cabin sign.
  b.part(new THREE.BoxGeometry(1.48, 0.42, 0.055), WHITE, {
    at: [0.15, 2.15, 1.02],
    texture: signTexture,
    name: "outpost-sign",
  });
  rod([-0.47, 2.02, 1.01], [-0.47, 2.18, 1.01], 0.025, METAL_DARK, "sign-post");
  rod([0.77, 2.02, 1.01], [0.77, 2.18, 1.01], 0.025, METAL_DARK, "sign-post");

  // Chimney with snow cap.
  cyl(0.13, 0.82, [-0.92, 2.7, -0.38], METAL_DARK, 8, undefined, "chimney");
  cyl(0.19, 0.1, [-0.92, 3.12, -0.38], SNOW, 8, undefined, "chimney-snow");
  cyl(0.1, 0.09, [-0.92, 3.18, -0.38], DARK, 8, undefined, "chimney-cap");

  // Small generator annex at the right.
  box([1.15, 0.95, 1.18], [1.55, 0.76, -0.18], WOOD_DARK, undefined, "generator-shed");
  box([1.28, 0.12, 1.3], [1.55, 1.3, -0.18], ROOF, undefined, "generator-roof");
  box([0.75, 0.04, 0.045], [1.55, 0.71, 0.43], TRIM, undefined, "shed-trim");
  b.part(new THREE.PlaneGeometry(0.46, 0.37), WHITE, {
    at: [1.55, 0.86, 0.425],
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
    name: "generator-warning",
  });
  cyl(0.2, 0.5, [1.55, 0.34, -0.78], METAL, 10, undefined, "fuel-cylinder");
  cyl(0.2, 0.07, [1.55, 0.61, -0.78], RED, 10, undefined, "fuel-cap");

  // Raised landing deck and railings.
  box([2.9, 0.16, 0.82], [-0.2, 0.42, 1.16], WOOD_DARK, undefined, "front-deck");
  for (const x of [-1.45, -0.7, 0.05, 0.8, 1.25]) {
    rod([x, 0.43, 1.54], [x, 1.03, 1.54], 0.035, TRIM, "deck-post");
  }
  rod([-1.45, 1.03, 1.54], [1.25, 1.03, 1.54], 0.045, TRIM, "deck-rail");
  rod([-1.45, 0.68, 1.54], [1.25, 0.68, 1.54], 0.025, WOOD, "deck-rail");
  for (const x of [-1.15, -0.4, 0.35, 1.1]) {
    box([0.38, 0.06, 0.72], [x, 0.54, 1.16], WOOD, undefined, "deck-plank");
  }

  // Entrance steps.
  box([0.72, 0.12, 0.38], [-0.82, 0.29, 1.7], WOOD_DARK, undefined, "step");
  box([0.62, 0.1, 0.3], [-0.82, 0.2, 1.91], WOOD, undefined, "step");

  // Radio mast behind the cabin.
  rod([0.92, 2.35, -0.82], [0.92, 4.15, -0.82], 0.035, METAL_DARK, "radio-mast");
  rod([0.55, 2.43, -0.82], [1.29, 2.43, -0.82], 0.025, METAL, "mast-brace");
  rod([0.92, 3.18, -0.82], [0.45, 2.5, -0.82], 0.018, METAL, "mast-brace");
  rod([0.92, 3.18, -0.82], [1.38, 2.5, -0.82], 0.018, METAL, "mast-brace");
  rod([0.92, 3.55, -0.82], [0.92, 3.55, -1.45], 0.018, METAL, "antenna-arm");
  cyl(0.065, 0.18, [0.92, 4.25, -0.82], YELLOW, 8, undefined, "beacon-housing");
  const beacon = b.part(new THREE.SphereGeometry(0.09, 10, 6), ORANGE, {
    at: [0.92, 4.38, -0.82],
    name: "warning-beacon",
  });
  glow(beacon, 2.5);

  // Satellite dish and receiver.
  sphere(0.48, [0.92, 3.42, -1.12], [1.0, 0.22, 1.0], METAL, "satellite-dish");
  rod([0.92, 3.35, -1.12], [0.92, 3.8, -1.12], 0.055, METAL_DARK, "dish-neck");
  rod([0.92, 3.82, -1.12], [0.92, 3.98, -1.12], 0.025, METAL, "dish-feed");
  sphere(0.09, [0.92, 4.02, -1.12], [1, 0.65, 1], YELLOW, "dish-feed-head");

  // Two angled solar-panel arrays on a simple frame.
  rod([2.28, 0.38, -1.05], [2.28, 1.65, -1.05], 0.04, METAL_DARK, "solar-frame");
  rod([3.15, 0.38, -1.05], [3.15, 1.65, -1.05], 0.04, METAL_DARK, "solar-frame");
  for (const z of [-1.1, -0.45]) {
    box([0.78, 0.055, 1.28], [2.72, 1.65, z], GLASS, [18, 0, 0], "solar-panel");
    for (const x of [2.46, 2.72, 2.98]) rod([x, 1.62, z - 0.58], [x, 1.69, z + 0.58], 0.012, METAL_DARK, "solar-grid");
    rod([2.32, 1.65, z], [3.12, 1.65, z], 0.012, METAL_DARK, "solar-grid");
  }

  // Weather instrument mast and anemometer.
  rod([-2.05, 0.35, -1.45], [-2.05, 2.18, -1.45], 0.028, METAL_DARK, "weather-mast");
  rod([-2.05, 2.05, -1.45], [-2.45, 2.25, -1.45], 0.018, METAL, "anemometer-arm");
  rod([-2.05, 2.05, -1.45], [-1.65, 2.25, -1.45], 0.018, METAL, "anemometer-arm");
  rod([-2.05, 2.05, -1.45], [-2.05, 2.05, -1.0], 0.018, METAL, "anemometer-arm");
  for (const p of [
    [-2.48, 2.27, -1.45],
    [-1.62, 2.27, -1.45],
    [-2.05, 2.07, -0.96],
  ] as [number, number, number][]) {
    sphere(0.09, p, [1.1, 0.65, 0.8], YELLOW, "wind-cup");
  }

  // Orange windsock for a vivid Firewatch accent.
  rod([-2.05, 1.58, -1.45], [-2.05, 1.58, -0.82], 0.018, METAL, "windsock-arm");
  b.extrude(
    [
      [0, 0],
      [0.52, 0.05],
      [0.64, 0.16],
      [0.52, 0.28],
      [0, 0.32],
    ],
    {
      at: [-2.05, 1.43, -0.82],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      color: ORANGE,
      bevel: 0.008,
      name: "windsock",
    },
  );

  // Cargo pallets and expedition crates.
  box([0.95, 0.1, 0.72], [-2.0, 0.35, 0.55], WOOD_DARK, undefined, "cargo-pallet");
  for (const x of [-2.35, -2.0, -1.65]) box([0.09, 0.13, 0.76], [x, 0.47, 0.55], WOOD, undefined, "pallet-slat");
  box([0.7, 0.56, 0.62], [-2.03, 0.7, 0.55], WOOD, undefined, "cargo-crate");
  box([0.76, 0.08, 0.68], [-2.03, 0.99, 0.55], TRIM, undefined, "crate-band");
  box([0.55, 0.42, 0.54], [-1.25, 0.59, 0.57], WOOD_DARK, undefined, "small-crate");
  box([0.58, 0.06, 0.58], [-1.25, 0.81, 0.57], YELLOW, undefined, "small-crate-band");

  // Propane tanks and a red emergency canister.
  for (const x of [1.95, 2.28]) {
    cyl(0.16, 0.62, [x, 0.68, 0.7], METAL, 10, [0, 0, 90], "gas-cylinder");
    cyl(0.08, 0.1, [x, 0.68, 1.03], RED, 8, [0, 0, 90], "gas-valve");
  }
  cyl(0.12, 0.42, [2.55, 0.55, 0.63], RED, 10, undefined, "emergency-canister");
  box([0.2, 0.08, 0.24], [2.55, 0.55, 0.76], WHITE, undefined, "canister-label");

  // Flagpole and bold orange station flag.
  rod([1.45, 0.36, 1.82], [1.45, 2.75, 1.82], 0.025, METAL_DARK, "flagpole");
  b.extrude(
    [
      [0, 0],
      [0.74, -0.02],
      [0.58, 0.26],
      [0.74, 0.52],
      [0, 0.44],
    ],
    {
      at: [1.45, 2.48, 1.82],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: ORANGE,
      bevel: 0.004,
      name: "station-flag",
    },
  );
  b.part(new THREE.PlaneGeometry(0.24, 0.12), WHITE, {
    at: [1.8, 2.68, 1.835],
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
    name: "flag-mark",
  });

  // Track of stylized boot prints leading to the station.
  const trail = [
    [-2.65, 0.35, 2.08],
    [-2.3, 0.35, 2.25],
    [-1.94, 0.35, 2.03],
    [-1.58, 0.35, 2.2],
    [-1.2, 0.35, 2.04],
    [-0.85, 0.35, 2.16],
  ] as [number, number, number][];
  trail.forEach((p, i) => {
    b.part(new THREE.PlaneGeometry(0.16, 0.25), "#ffffff", {
      at: [p[0], 0.355, p[2]],
      rotation: [-90, 0, i % 2 ? 18 : -18],
      texture: footprintTexture,
      name: "boot-print",
    });
  });

  // A few snow poles mark the safe route around the deck.
  for (const [x, z] of [
    [-2.8, 1.2],
    [-2.45, 2.0],
    [2.7, 1.3],
    [2.95, 0.95],
  ] as [number, number][]) {
    rod([x, 0.33, z], [x, 0.95, z], 0.025, RED, "snow-marker");
    sphere(0.07, [x, 0.98, z], [1, 0.7, 1], YELLOW, "snow-marker-cap");
  }

  // Snow clumps soften the hard edges of the constructed objects.
  sphere(0.23, [-1.4, 1.98, 0.93], [1.5, 0.32, 0.65], SNOW, "eave-snow");
  sphere(0.19, [0.82, 1.98, 0.94], [1.4, 0.3, 0.6], SNOW, "eave-snow");
  sphere(0.17, [1.1, 1.34, -0.78], [1.3, 0.35, 0.8], SNOW, "shed-snow");
  sphere(0.12, [2.55, 1.0, 0.3], [1.2, 0.4, 0.8], SNOW, "equipment-snow");

  // A graphic aurora ribbon on the rear ice shelf, kept low and scenic.
  const aurora = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 105 Q45 20 92 77 T177 32 T256 56 V128H0Z" fill="#45c6b0" opacity=".85"/>
      <path d="M0 115 Q45 45 91 91 T177 54 T256 75" fill="none" stroke="#c9eeaa" stroke-width="10" opacity=".8"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.4, 1.2), WHITE, {
    at: [0, 0.62, -2.48],
    dir: [0, 0, 1],
    axis: "z",
    texture: aurora,
    name: "aurora-panel",
  });

  return b.root;
}
```