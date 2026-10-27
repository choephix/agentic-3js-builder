```ts
import * as THREE from "three";
import { createBuilder, mottle, grain, svg } from "agentic-3js-builder";

export const meta = {
  name: "brutalist housing block",
  description:
    "A raw-concrete brutalist housing block with stepped masses, deep shadowed windows, cantilevered balconies, rooftop machinery, service stairs, and weathered facade detail.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = mottle("#85827b", "#5f5e5a", { size: 0.34, contrast: 1.5, seed: 17 });
  const LIGHT_CONCRETE = mottle("#a19d94", "#706e69", { size: 0.28, contrast: 1.2, seed: 23 });
  const DARK_CONCRETE = grain("#5a5955", "#77746d", { size: 0.09, axis: "y", seed: 11 });
  const SHADOW = "#27292a";
  const GLASS = "#182426";
  const GLASS_BLUE = "#243d42";
  const RUST = "#713e2d";
  const METAL = "#3b3e3d";
  const PALE = "#b8b3a7";
  const ORANGE = "#c56d3d";
  const YELLOW = "#d49a45";

  const windowTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#172325"/>
      <rect x="7" y="7" width="114" height="114" fill="#233b3e" stroke="#090d0e" stroke-width="7"/>
      <path d="M12 63H116M63 12V116" stroke="#090f10" stroke-width="7"/>
      <path d="M16 17L54 54M75 17L111 51M17 110L52 76M76 75L111 110" stroke="#6b8a88" stroke-opacity=".23" stroke-width="3"/>
      <path d="M17 28H51M78 97H109" stroke="#b1c5b6" stroke-opacity=".34" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  const narrowWindowTexture = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="128" fill="#121a1b"/>
      <rect x="8" y="7" width="48" height="114" fill="#29484b" stroke="#080d0d" stroke-width="5"/>
      <path d="M32 8V120" stroke="#0c1213" stroke-width="5"/>
      <path d="M13 20L27 34M39 83L53 98" stroke="#a9c7bd" stroke-opacity=".3" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  const entranceTexture = svg(
    `<svg viewBox="0 0 128 192" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="192" fill="#101516"/>
      <rect x="12" y="10" width="104" height="172" fill="#273638" stroke="#938d7c" stroke-width="5"/>
      <path d="M64 12V180" stroke="#0d1213" stroke-width="5"/>
      <circle cx="55" cy="98" r="4" fill="#d8aa56"/><circle cx="73" cy="98" r="4" fill="#d8aa56"/>
      <path d="M24 27H104M24 164H104" stroke="#b5c1af" stroke-opacity=".3" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  const signTexture = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="#171918"/>
      <text x="128" y="43" text-anchor="middle" font-family="sans-serif" font-size="31" font-weight="bold" letter-spacing="5" fill="#d3cbb8">UNIT 17</text>
    </svg>`,
    { size: 256 },
  );

  function box(
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color: any,
    name: string,
  ) {
    return b.part(new THREE.BoxGeometry(sx, sy, sz), color, {
      at: [x, y, z],
      name,
      flat: true,
    });
  }

  function cylinder(
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
    color: any,
    name: string,
    segments = 10,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at: [x, y, z],
      name,
      flat: true,
    });
  }

  function frontWindow(
    x: number,
    y: number,
    w: number,
    h: number,
    z: number,
    texture = windowTexture,
    name = "window",
  ) {
    box(x, y, z - 0.025, w + 0.065, h + 0.065, 0.08, SHADOW, `${name}-reveal`);
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at: [x, y, z + 0.025],
      dir: [0, 0, 1],
      axis: "z",
      texture,
      name: `${name}-glass`,
    });
  }

  function sideWindow(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    name: string,
  ) {
    box(x + 0.025, y, z, 0.08, h + 0.065, w + 0.065, SHADOW, `${name}-reveal`);
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at: [x + 0.07, y, z],
      dir: [1, 0, 0],
      axis: "z",
      texture: narrowWindowTexture,
      name: `${name}-glass`,
    });
  }

  // Heavy plinth and a broken, stepped podium.
  box(0, 0.11, 0, 3.65, 0.22, 2.45, DARK_CONCRETE, "foundation-plinth");
  box(0, 0.32, 0, 3.42, 0.25, 2.22, CONCRETE, "podium-cap");
  box(-0.96, 0.70, 0.02, 1.55, 0.72, 1.95, CONCRETE, "left-podium");
  box(0.88, 0.63, -0.03, 1.75, 0.58, 1.88, LIGHT_CONCRETE, "right-podium");
  box(0.03, 0.85, -0.05, 1.46, 0.38, 1.72, DARK_CONCRETE, "recessed-courtyard-wall");

  // Tall central housing slab and two offset side wings.
  box(0.02, 2.17, -0.02, 2.38, 2.52, 1.52, CONCRETE, "central-housing-slab");
  box(-1.25, 1.62, -0.02, 0.72, 1.68, 1.72, LIGHT_CONCRETE, "left-stair-tower");
  box(1.23, 1.47, -0.08, 0.70, 1.38, 1.82, CONCRETE, "right-stair-tower");

  // Brutalist overhangs and floor plates.
  box(0.02, 1.05, 0.05, 2.62, 0.12, 1.87, LIGHT_CONCRETE, "first-floor-band");
  box(0.02, 2.02, 0.05, 2.62, 0.13, 1.90, LIGHT_CONCRETE, "second-floor-band");
  box(0.02, 2.91, 0.05, 2.70, 0.15, 1.96, DARK_CONCRETE, "roof-overhang");
  box(-1.05, 1.16, 0.88, 0.82, 0.14, 0.80, CONCRETE, "left-balcony-slab");
  box(-1.05, 1.91, 0.88, 0.82, 0.14, 0.80, CONCRETE, "left-balcony-upper");
  box(0.91, 1.25, 0.91, 0.84, 0.14, 0.84, LIGHT_CONCRETE, "right-balcony-slab");
  box(0.91, 2.03, 0.91, 0.84, 0.14, 0.84, LIGHT_CONCRETE, "right-balcony-upper");

  // Deep front window grid.
  const frontRows = [1.36, 1.78, 2.25, 2.67];
  for (let r = 0; r < frontRows.length; r++) {
    const y = frontRows[r];
    frontWindow(-0.78, y, 0.40, 0.27, 0.775, windowTexture, `front-left-${r}`);
    frontWindow(-0.26, y, 0.38, 0.27, 0.775, narrowWindowTexture, `front-mid-left-${r}`);
    frontWindow(0.28, y, 0.38, 0.27, 0.775, narrowWindowTexture, `front-mid-right-${r}`);
    frontWindow(0.78, y, 0.42, 0.27, 0.775, windowTexture, `front-right-${r}`);
  }

  // Vertical fins make the main facade feel massive and load-bearing.
  for (const x of [-1.20, -0.56, 0.02, 0.59, 1.20]) {
    box(x, 2.03, 0.86, 0.085, 1.82, 0.13, LIGHT_CONCRETE, `facade-fin-${x}`);
  }

  // Side tower windows.
  for (let i = 0; i < 3; i++) {
    sideWindow(-1.63, 1.18 + i * 0.39, 0.12, 0.38, 0.25, `left-side-window-${i}`);
    sideWindow(1.61, 1.04 + i * 0.37, 0.13, 0.40, 0.24, `right-side-window-${i}`);
  }

  // Podium shops and recessed entry.
  frontWindow(-0.84, 0.63, 0.54, 0.35, 1.03, windowTexture, "podium-shop-left");
  frontWindow(0.02, 0.63, 0.54, 0.35, 1.03, windowTexture, "podium-shop-center");
  frontWindow(0.84, 0.63, 0.54, 0.35, 1.03, windowTexture, "podium-shop-right");

  box(0, 0.73, 1.04, 0.44, 0.78, 0.12, SHADOW, "entry-recess");
  b.part(new THREE.PlaneGeometry(0.34, 0.68), "#ffffff", {
    at: [0, 0.73, 1.115],
    dir: [0, 0, 1],
    axis: "z",
    texture: entranceTexture,
    name: "communal-entry-door",
  });
  box(0, 1.18, 1.10, 0.75, 0.055, 0.045, PALE, "entry-lintel");

  // Balustrades: deliberately chunky concrete uprights and thin dark metal rails.
  for (const side of [-1, 1]) {
    const cx = side < 0 ? -1.05 : 0.91;
    const y0 = side < 0 ? 1.23 : 1.33;
    for (let j = 0; j < 4; j++) {
      const x = cx - 0.34 + j * 0.225;
      b.rod([x, y0, 1.24], [x, y0 + 0.43, 1.24], 0.025, { color: METAL, name: `railing-post-${side}-${j}` });
    }
    b.rod([cx - 0.40, y0 + 0.43, 1.24], [cx + 0.40, y0 + 0.43, 1.24], 0.027, {
      color: METAL,
      name: `railing-top-${side}`,
    });
    b.rod([cx - 0.40, y0 + 0.18, 1.24], [cx + 0.40, y0 + 0.18, 1.24], 0.018, {
      color: METAL,
      name: `railing-mid-${side}`,
    });
  }

  // Exposed external stair / fire escape on the right facade.
  for (let i = 0; i < 7; i++) {
    const y = 0.72 + i * 0.29;
    const z = 0.78 - i * 0.13;
    box(1.60, y, z, 0.42, 0.075, 0.29, DARK_CONCRETE, `fire-stair-step-${i}`);
    b.rod([1.81, y + 0.04, z - 0.13], [1.81, y + 0.28, z - 0.13], 0.018, {
      color: METAL,
      name: `fire-stair-rail-${i}`,
    });
  }

  // Roof service huts and mechanical equipment.
  box(-0.70, 3.20, -0.10, 0.85, 0.48, 0.70, DARK_CONCRETE, "roof-service-hut");
  box(0.52, 3.17, -0.12, 0.72, 0.42, 0.62, LIGHT_CONCRETE, "roof-lift-hut");
  box(-0.70, 3.49, -0.10, 0.96, 0.08, 0.80, CONCRETE, "service-hut-cap");
  box(0.52, 3.43, -0.12, 0.82, 0.07, 0.72, CONCRETE, "lift-hut-cap");

  // Pair of black rooftop water tanks with collars and pipes.
  for (const x of [-0.74, 0.69]) {
    cylinder(x, 3.78, -0.12, 0.25, 0.48, SHADOW, `water-tank-${x}`, 12);
    cylinder(x, 4.03, -0.12, 0.19, 0.035, METAL, `water-tank-lid-${x}`, 12);
    cylinder(x, 3.54, -0.12, 0.29, 0.045, RUST, `water-tank-collar-${x}`, 12);
    b.rod([x + 0.17, 3.55, -0.12], [x + 0.17, 4.20, -0.12], 0.018, {
      color: METAL,
      name: `tank-pipe-${x}`,
    });
  }

  // Roof guardrail and antenna mast.
  for (const x of [-1.35, -0.45, 0.45, 1.35]) {
    b.rod([x, 3.03, 0.64], [x, 3.35, 0.64], 0.018, { color: METAL, name: `roof-rail-post-${x}` });
  }
  b.rod([-1.35, 3.35, 0.64], [1.35, 3.35, 0.64], 0.022, { color: METAL, name: "roof-guardrail" });
  b.rod([0.04, 3.02, -0.48], [0.04, 4.38, -0.48], 0.018, { color: METAL, name: "antenna-mast" });
  b.rod([-0.25, 4.12, -0.48], [0.34, 4.12, -0.48], 0.012, { color: METAL, name: "antenna-crossbar" });
  b.rod([-0.15, 4.28, -0.48], [0.23, 4.28, -0.48], 0.010, { color: METAL, name: "antenna-topbar" });

  // A projecting apartment sign and a few rough facade stains/patches.
  box(0.02, 3.13, 0.94, 1.02, 0.31, 0.07, SHADOW, "roof-sign-frame");
  b.part(new THREE.PlaneGeometry(0.91, 0.225), "#ffffff", {
    at: [0.02, 3.13, 0.985],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "unit-sign",
  });

  // Concrete expansion joints and deliberately uneven repair plates.
  for (const y of [1.04, 1.99, 2.89]) {
    box(-1.47, y, 0.87, 0.035, 0.022, 0.025, SHADOW, `horizontal-joint-left-${y}`);
    box(1.45, y, 0.87, 0.035, 0.022, 0.025, SHADOW, `horizontal-joint-right-${y}`);
  }
  box(-1.25, 2.35, 0.89, 0.22, 0.34, 0.018, RUST, "rusted-repair-plate");
  box(1.25, 1.72, 0.94, 0.18, 0.25, 0.018, PALE, "patched-concrete-plate");
  box(-0.37, 2.55, 0.91, 0.11, 0.27, 0.018, DARK_CONCRETE, "water-streak");
  box(0.55, 1.38, 0.91, 0.07, 0.31, 0.018, DARK_CONCRETE, "another-water-streak");

  // Small painted maintenance marks on the podium.
  for (const x of [-1.02, -0.84, -0.66, 0.62, 0.80, 0.98]) {
    box(x, 0.965, 1.11, 0.035, 0.035, 0.012, ORANGE, `paint-mark-${x}`);
  }
  box(0, 0.995, 1.11, 0.20, 0.035, 0.012, YELLOW, "paint-mark-center");

  // A few angular concrete buttresses emphasize the raw structural language.
  for (const side of [-1, 1]) {
    const x = side * 1.40;
    b.frustumBox(
      [x, 0.39, 0.68],
      [x + side * 0.18, 2.87, 0.68],
      [0.22, 0.34],
      [0.15, 0.22],
      { color: CONCRETE, name: `sloping-buttress-${side}` },
    );
  }

  return b.root;
}
```