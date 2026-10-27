```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "brutalist housing block",
  description:
    "A monumental raw-concrete brutalist housing block with a heavy podium, pilotis, repetitive recessed windows, projecting balconies, a central stair tower, roof plant and water tanks.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = "#8b8a82";
  const CONCRETE_LIGHT = "#a7a59a";
  const CONCRETE_DARK = "#686963";
  const CONCRETE_WARM = "#77766e";
  const CONCRETE_SHADOW = "#555751";
  const CONCRETE_EDGE = "#b6b3a6";
  const WINDOW = "#18242a";
  const WINDOW_BLUE = "#243e48";
  const WINDOW_LIT = "#c08b56";
  const WINDOW_DARK = "#10181c";
  const METAL = "#3c4240";
  const RAIL = "#252b2a";
  const SIGN = "#c7b890";
  const RED = "#7d4033";
  const WATER = "#47706e";

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  function box(
    size: [number, number, number],
    p: [number, number, number],
    color: string,
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: p,
      name,
      flat: true,
    });
  }

  function slab(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    color = CONCRETE,
    name?: string,
  ) {
    return box([w, h, d], at(x, y, z), color, name);
  }

  function windowPane(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    color = WINDOW,
    name = "recessed-window",
  ) {
    return box([w, h, 0.075], at(x, y, z), color, name);
  }

  function frameWindow(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    color = CONCRETE_DARK,
  ) {
    const t = 0.105;
    windowPane(x, y, z + 0.015, w - t * 2, h - t * 2, WINDOW, "window-glass");
    slab(w, t, 0.16, x, y + h / 2 - t / 2, z, color, "window-head");
    slab(w, t, 0.16, x, y - h / 2 + t / 2, z, color, "window-sill");
    slab(t, h - t * 2, 0.16, x - w / 2 + t / 2, y, z, color, "window-jamb");
    slab(t, h - t * 2, 0.16, x + w / 2 - t / 2, y, z, color, "window-jamb");
  }

  function balcony(
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    side: "left" | "right" | "center",
  ) {
    slab(w, 0.22, d, x, y, z, CONCRETE_LIGHT, "cantilevered-balcony");
    slab(w, 0.18, 0.18, x, y + 0.78, z + d / 2 - 0.1, CONCRETE_EDGE, "balcony-parapet");
    slab(0.18, 0.9, d, x - w / 2 + 0.09, y + 0.45, z, CONCRETE_DARK, "balcony-sidewall");
    slab(0.18, 0.9, d, x + w / 2 - 0.09, y + 0.45, z, CONCRETE_DARK, "balcony-sidewall");

    const railZ = z + d / 2 - 0.21;
    const railY = y + 0.42;
    slab(w - 0.34, 0.07, 0.07, x, railY + 0.29, railZ, RAIL, "balcony-railing-top");
    for (let i = 0; i < 5; i++) {
      const px = x - (w - 0.42) / 2 + (i * (w - 0.42)) / 4;
      slab(0.045, 0.58, 0.045, px, railY, railZ, RAIL, "balcony-railing-bar");
    }

    if (side === "left") {
      slab(0.24, 0.15, d - 0.25, x - w / 2 - 0.13, y + 0.1, z, CONCRETE_SHADOW, "balcony-drip");
    } else if (side === "right") {
      slab(0.24, 0.15, d - 0.25, x + w / 2 + 0.13, y + 0.1, z, CONCRETE_SHADOW, "balcony-drip");
    }
  }

  function pilaster(x: number, z: number, h: number, w = 0.32, d = 0.42) {
    slab(w, h, d, x, 1.4 + h / 2, z, CONCRETE_DARK, "deep-vertical-pilaster");
  }

  function vent(x: number, y: number, z: number, w: number, h: number) {
    box([w, h, 0.07], at(x, y, z), METAL, "mechanical-vent");
    const bars = Math.max(2, Math.floor(w / 0.12));
    for (let i = 0; i < bars; i++) {
      const px = x - w / 2 + 0.07 + (i * (w - 0.14)) / Math.max(1, bars - 1);
      slab(0.018, h - 0.05, 0.025, px, y, z - 0.055, CONCRETE_LIGHT, "vent-louver");
    }
  }

  // ---------------------------------------------------------------------------
  // Grounded podium and monumental plinth
  // ---------------------------------------------------------------------------

  slab(14.8, 0.34, 9.0, 0, 0.17, 0, CONCRETE_DARK, "ground-plinth");
  slab(14.2, 0.42, 8.55, 0, 0.55, 0, CONCRETE, "podium-base");
  slab(13.6, 0.24, 8.15, 0, 0.88, 0.05, CONCRETE_LIGHT, "podium-cap");

  // Low, offset service wings create the asymmetrical massing.
  slab(4.4, 1.6, 7.0, -4.7, 1.7, -0.05, CONCRETE_WARM, "low-west-wing");
  slab(3.4, 1.25, 6.3, 4.9, 1.52, 0.2, CONCRETE_SHADOW, "low-east-wing");
  slab(4.8, 0.22, 7.5, -4.7, 2.52, -0.05, CONCRETE_EDGE, "west-wing-roof");
  slab(3.8, 0.2, 6.7, 4.9, 2.18, 0.2, CONCRETE_EDGE, "east-wing-roof");

  // A dark arcade under the main block.
  slab(11.8, 0.5, 6.9, 0, 1.18, 0, CONCRETE_DARK, "main-block-undercroft");
  const arcadeXs = [-5.1, -3.4, -1.7, 0, 1.7, 3.4, 5.1];
  for (const x of arcadeXs) {
    slab(0.42, 2.05, 6.65, x, 2.12, 0, CONCRETE_LIGHT, "undercroft-pilotis");
  }
  slab(11.8, 0.35, 7.0, 0, 3.18, 0, CONCRETE_EDGE, "podium-transfer-beam");

  // Recessed undercroft bays and service doors.
  for (let i = 0; i < 6; i++) {
    const x = -4.25 + i * 1.7;
    windowPane(x, 1.98, 3.34, 1.1, 1.25, WINDOW_DARK, "dark-arcade-bay");
    slab(1.22, 0.12, 0.22, x, 2.67, 3.39, CONCRETE_DARK, "arcade-lintel");
  }
  box([1.25, 1.72, 0.12], at(5.2, 1.75, 3.42), METAL, "service-door");
  slab(1.45, 0.16, 0.2, 5.2, 2.67, 3.38, CONCRETE_LIGHT, "service-door-lintel");

  // Main tower mass, lifted over the heavy podium.
  slab(11.8, 7.9, 6.8, 0, 7.12, -0.05, CONCRETE, "main-tower-mass");
  slab(12.35, 0.28, 7.35, 0, 3.42, -0.05, CONCRETE_EDGE, "tower-foot-band");

  // Side walls and large vertical structural fins.
  for (const x of [-5.92, 5.92]) {
    slab(0.34, 7.45, 6.85, x, 7.2, -0.05, CONCRETE_DARK, "tower-side-wall");
  }
  for (const x of [-5.55, -3.7, -1.85, 0, 1.85, 3.7, 5.55]) {
    pilaster(x, 3.26, 7.25, x === 0 ? 0.48 : 0.27, 0.34);
  }

  // Floor bands: the repetitive horizontal rhythm is a major brutalist cue.
  for (let floor = 0; floor < 6; floor++) {
    const y = 4.1 + floor * 1.22;
    slab(12.25, 0.16, 7.05, 0, y, -0.03, CONCRETE_EDGE, "continuous-floor-band");
    slab(12.0, 0.11, 0.24, 0, y + 0.18, 3.38, CONCRETE_DARK, "front-shadow-line");
  }

  // ---------------------------------------------------------------------------
  // Front facade: recessed windows, loggias and concrete balcony boxes
  // ---------------------------------------------------------------------------

  const floorY = [4.75, 5.97, 7.19, 8.41, 9.63, 10.85];

  for (let f = 0; f < floorY.length; f++) {
    const y = floorY[f];

    // Narrow paired windows in the outer bays.
    for (const x of [-4.95, -3.72, 3.72, 4.95]) {
      frameWindow(x, y, 3.38, 0.82, 0.7, CONCRETE_DARK);
      if ((f + Math.round(Math.abs(x))) % 4 === 0) {
        windowPane(x, y, 3.43, 0.48, 0.38, WINDOW_LIT, "occasional-lit-window");
      }
    }

    // Central deep loggia, alternating from floor to floor.
    if (f % 2 === 0) {
      balcony(-1.7, y - 0.36, 3.7, 2.85, 1.2, "left");
      balcony(1.7, y - 0.36, 3.7, 2.85, 1.2, "right");
      frameWindow(-1.7, y + 0.03, 3.34, 2.05, 0.77, CONCRETE_SHADOW);
      frameWindow(1.7, y + 0.03, 3.34, 2.05, 0.77, CONCRETE_SHADOW);
    } else {
      balcony(0, y - 0.36, 3.72, 3.35, 1.22, "center");
      frameWindow(-3.0, y + 0.03, 3.34, 1.55, 0.77, CONCRETE_SHADOW);
      frameWindow(3.0, y + 0.03, 3.34, 1.55, 0.77, CONCRETE_SHADOW);
      frameWindow(0, y + 0.03, 3.34, 2.2, 0.77, CONCRETE_SHADOW);
    }

    // Small projecting slab over every window group.
    slab(10.9, 0.12, 0.34, 0, y + 0.49, 3.43, CONCRETE_LIGHT, "window-weather-shelf");
  }

  // Strong central vertical stair / lift tower projecting from the facade.
  slab(2.25, 7.25, 1.15, 0, 7.3, 3.58, CONCRETE_WARM, "central-stair-box");
  slab(2.55, 7.5, 0.16, 0, 7.28, 4.18, CONCRETE_DARK, "stair-tower-front-shadow");
  for (let i = 0; i < 6; i++) {
    const y = 4.78 + i * 1.22;
    windowPane(0, y, 4.29, 1.18, 0.62, i === 2 ? WINDOW_LIT : WINDOW_BLUE, "stairwell-glazing");
    slab(1.36, 0.1, 0.18, 0, y + 0.4, 4.24, CONCRETE_EDGE, "stairwell-lintel");
    slab(1.36, 0.1, 0.18, 0, y - 0.4, 4.24, CONCRETE_DARK, "stairwell-sill");
  }
  slab(0.18, 7.2, 0.22, -1.2, 7.3, 4.2, CONCRETE_LIGHT, "stair-tower-left-edge");
  slab(0.18, 7.2, 0.22, 1.2, 7.3, 4.2, CONCRETE_LIGHT, "stair-tower-right-edge");

  // Roof slab and oversized parapet, with visible service blocks.
  slab(12.8, 0.35, 7.45, 0, 11.18, -0.05, CONCRETE_EDGE, "roof-deck");
  slab(13.0, 0.72, 0.28, 0, 11.55, 3.5, CONCRETE_LIGHT, "roof-front-parapet");
  slab(0.3, 0.72, 7.3, -6.35, 11.55, -0.05, CONCRETE_DARK, "roof-west-parapet");
  slab(0.3, 0.72, 7.3, 6.35, 11.55, -0.05, CONCRETE_DARK, "roof-east-parapet");
  slab(13.0, 0.22, 7.35, 0, 11.9, -0.05, CONCRETE_LIGHT, "roof-cap-shadow");

  slab(3.2, 1.55, 2.2, -3.35, 12.5, -0.35, CONCRETE_SHADOW, "roof-plant-room");
  slab(2.0, 1.25, 1.75, 2.65, 12.35, -0.4, CONCRETE_WARM, "roof-lift-overrun");
  slab(3.55, 0.18, 2.5, -3.35, 13.3, -0.35, CONCRETE_EDGE, "plant-room-cap");
  slab(2.35, 0.16, 2.0, 2.65, 13.03, -0.4, CONCRETE_EDGE, "lift-cap");

  // Roof vents and brutalist mechanical scars.
  for (let i = 0; i < 5; i++) {
    vent(-4.35 + i * 0.48, 12.4, 0.81, 0.3, 0.55);
  }
  for (let i = 0; i < 4; i++) {
    vent(2.0 + i * 0.42, 12.25, 0.52, 0.26, 0.43);
  }

  // ---------------------------------------------------------------------------
  // Roof water tanks: two faceted concrete/metal cylinders and pipework
  // ---------------------------------------------------------------------------

  const tankGeo = new THREE.CylinderGeometry(0.78, 0.84, 1.65, 10);
  const tankTop = new THREE.CylinderGeometry(0.62, 0.62, 0.18, 10);

  for (const x of [-1.25, 0.45]) {
    b.part(tankGeo, CONCRETE_DARK, {
      at: at(x, 13.05, -1.0),
      name: "faceted-water-tank",
      flat: true,
    });
    b.part(tankTop, CONCRETE_LIGHT, {
      at: at(x, 13.93, -1.0),
      name: "water-tank-lid",
      flat: true,
    });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      slab(
        0.07,
        1.45,
        0.07,
        x + Math.cos(a) * 0.77,
        13.03,
        -1.0 + Math.sin(a) * 0.77,
        METAL,
        "tank-vertical-band",
      );
    }
  }

  // Water tank bridge and oversized maintenance pipe.
  slab(2.15, 0.14, 0.14, -0.4, 13.98, -1.0, METAL, "tank-bridge");
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 3.0, 8), METAL, {
    at: at(1.4, 12.85, -1.0),
    name: "roof-water-pipe",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 8), METAL, {
    at: at(1.4, 14.36, -1.0),
    name: "pipe-cap",
    flat: true,
  });

  // ---------------------------------------------------------------------------
  // Side elevations: small punched windows, projecting stair landings and vents
  // ---------------------------------------------------------------------------

  for (const side of [-1, 1]) {
    const x = side * 6.13;
    for (let f = 0; f < 6; f++) {
      const y = floorY[f];
      // Two different window scales keep the side from becoming a flat grid.
      frameWindow(x, y, -2.0, 0.1 + 0.0, 0.001, CONCRETE_DARK); // deliberately tiny structural seam
      box([0.08, 0.66, 1.0], at(x, y, -1.75), WINDOW_BLUE, "side-punched-window");
      box([0.08, 0.48, 0.76], at(x, y, 0.1), f === 4 ? WINDOW_LIT : WINDOW, "side-punched-window");
      slab(0.18, 0.1, 1.25, x + side * 0.08, y + 0.43, -1.75, CONCRETE_LIGHT, "side-window-head");
      slab(0.18, 0.1, 0.96, x + side * 0.08, y + 0.34, 0.1, CONCRETE_LIGHT, "side-window-head");

      if (f % 2 === 0) {
        slab(0.42, 0.18, 2.1, side * 6.38, y - 0.38, 1.45, CONCRETE_LIGHT, "side-landing");
        slab(0.1, 0.75, 2.0, side * 6.58, y + 0.02, 1.45, RAIL, "side-landing-rail");
      }
    }
    // Deep side buttresses.
    for (let i = 0; i < 4; i++) {
      slab(0.55, 7.5, 0.28, side * (5.45 + i * 0.25), 7.35, 2.95, CONCRETE_SHADOW, "side-buttress");
    }
  }

  // ---------------------------------------------------------------------------
  // Entrance monument: broad stair, canopy, recessed doors and signage
  // ---------------------------------------------------------------------------

  const stairSteps = [
    [5.0, 0.24, 1.0, 0.0],
    [4.5, 0.22, 1.0, 0.45],
    [4.0, 0.2, 1.0, 0.88],
    [3.5, 0.18, 1.0, 1.27],
  ] as const;
  for (const [w, h, d, z] of stairSteps) {
    slab(w, h, d, 0, 0.15 + z * 0.42, 4.15 + z, CONCRETE_LIGHT, "entrance-stair");
  }
  slab(4.7, 0.28, 2.0, 0, 3.35, 5.2, CONCRETE_DARK, "entrance-canopy");
  slab(0.34, 2.45, 0.34, -2.0, 2.15, 4.9, CONCRETE_EDGE, "canopy-column");
  slab(0.34, 2.45, 0.34, 2.0, 2.15, 4.9, CONCRETE_EDGE, "canopy-column");
  slab(2.8, 1.85, 0.13, 0, 2.15, 3.48, WINDOW_DARK, "recessed-entrance");
  slab(3.2, 0.18, 0.24, 0, 3.12, 3.46, CONCRETE_EDGE, "entrance-lintel");
  slab(0.18, 1.75, 0.24, -1.52, 2.15, 3.47, CONCRETE_EDGE, "entrance-jamb");
  slab(0.18, 1.75, 0.24, 1.52, 2.15, 3.47, CONCRETE_EDGE, "entrance-jamb");
  slab(0.08, 1.55, 0.05, 0, 2.12, 3.38, SIGN, "entrance-door-mullion");

  // A plain cast-concrete sign plate and block lettering-like bars.
  slab(2.65, 0.65, 0.08, 0, 1.28, 4.67, CONCRETE_LIGHT, "housing-sign-plaque");
  const signBars = [
    [-0.92, 0.2, 0.08, 0.32],
    [-0.48, 0.2, 0.08, 0.32],
    [-0.04, 0.2, 0.08, 0.32],
    [0.40, 0.2, 0.08, 0.32],
    [0.84, 0.2, 0.08, 0.32],
  ] as const;
  for (const [x, y, w, h] of signBars) {
    slab(w, h, 0.025, x, 1.28 + y, 4.63, RED, "cast-sign-mark");
  }

  // A line of low bollards gives the entrance a human scale without becoming scenery.
  for (let i = 0; i < 7; i++) {
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.72, 8), CONCRETE_DARK, {
      at: at(-3.0 + i * 1.0, 0.36, 5.65),
      name: "concrete-bollard",
      flat: true,
    });
  }

  // Exposed diagonal stair braces on the east service wing.
  for (let i = 0; i < 4; i++) {
    const y = 1.05 + i * 0.34;
    const brace = new THREE.BoxGeometry(0.16, 1.05, 0.16);
    const part = b.part(brace, METAL, {
      at: at(6.18, y, -1.6 + i * 1.0),
      name: "external-stair-brace",
      flat: true,
    });
    part.rotation.z = -0.72;
  }

  // Small roof aerial frames, kept chunky and architectural.
  slab(0.12, 1.85, 0.12, 4.5, 12.85, 1.8, METAL, "roof-aerial");
  slab(0.12, 1.85, 0.12, 5.0, 12.85, 1.8, METAL, "roof-aerial");
  slab(0.75, 0.1, 0.1, 4.75, 13.72, 1.8, METAL, "aerial-crossbar");

  // A few controlled warm windows break the concrete mass without turning it into a glowing tower.
  const warmWindows = [
    [-4.95, 5.97],
    [3.72, 7.19],
    [-3.72, 9.63],
    [4.95, 10.85],
    [-3.0, 8.41],
  ] as const;
  for (const [x, y] of warmWindows) {
    windowPane(x, y, 3.45, 0.42, 0.36, WINDOW_LIT, "warm-lit-apartment");
  }

  // Raw concrete seam cuts on the broad west wing, expressed as shallow dark plates.
  for (let i = 0; i < 5; i++) {
    slab(0.045, 1.25, 0.08, -6.72, 1.65, -2.45 + i * 1.1, CONCRETE_SHADOW, "formwork-seam");
  }
  for (let i = 0; i < 7; i++) {
    slab(4.0, 0.035, 0.08, -4.7, 1.05 + i * 0.2, -3.56, CONCRETE_DARK, "horizontal-formwork-seam");
  }

  // Dark roof access door and its chunky frame.
  box([0.88, 1.55, 0.08], at(-3.35, 12.48, 0.78), WINDOW_DARK, "roof-access-door");
  slab(1.1, 0.14, 0.18, -3.35, 13.3, 0.76, CONCRETE_EDGE, "roof-door-lintel");
  slab(0.14, 1.7, 0.18, -3.88, 12.48, 0.76, CONCRETE_EDGE, "roof-door-jamb");
  slab(0.14, 1.7, 0.18, -2.82, 12.48, 0.76, CONCRETE_EDGE, "roof-door-jamb");

  // Keep deterministic construction explicitly tied to the model contract.
  // The value is intentionally only used to choose a repeatable facade accent.
  const accent = rng(17)() > 0.5 ? CONCRETE_LIGHT : CONCRETE_EDGE;
  slab(0.22, 2.0, 0.22, -5.35, 7.3, 3.52, accent, "facade-accent-pier");

  return b.root;
}
```