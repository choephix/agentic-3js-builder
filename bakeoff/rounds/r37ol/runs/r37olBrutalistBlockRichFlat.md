```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "brutalist housing block",
  description: "A raw-concrete brutalist housing block with stepped massing, recessed windows, balconies, rooftop plant, and heavy structural ribs.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = "#85827b";
  const CONCRETE_LIGHT = "#a29e93";
  const CONCRETE_DARK = "#65635f";
  const CONCRETE_WARM = "#928d82";
  const SHADOW = "#302f2d";
  const GLASS = "#18252a";
  const GLASS_BLUE = "#243a40";
  const METAL = "#4b4b46";
  const RUST = "#7b4430";
  const CURTAIN = "#b17c52";
  const LIGHT = "#d3b879";
  const WATER = "#374e51";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color = CONCRETE,
    name = "concrete-block",
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });
  };

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    sides = 8,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      name,
      flat: true,
    });
  };

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, z, radius, color, { name });

  // ---------------------------------------------------------------------------------------------------------------
  // Foundation, plinth, and the deliberately over-scaled ground podium.

  box([20.4, 0.42, 12.2], [0, 0.21, 0], CONCRETE_DARK, "buried-foundation");
  box([19.6, 0.62, 11.5], [0, 0.58, 0], CONCRETE, "podium-plinth");
  box([18.7, 0.24, 10.8], [0, 1.01, 0], CONCRETE_LIGHT, "podium-cap");
  box([16.8, 0.3, 9.4], [0, 1.27, -0.1], CONCRETE_DARK, "shadowed-podium-recess");

  // Low concrete site fragments, kept close to the building footprint.
  box([3.6, 0.38, 1.15], [-7.1, 1.42, 4.0], CONCRETE_WARM, "entry-bench-left");
  box([3.6, 0.38, 1.15], [7.1, 1.42, 4.0], CONCRETE_WARM, "entry-bench-right");
  box([1.8, 0.42, 1.8], [-7.7, 1.54, -3.8], CONCRETE_DARK, "service-block");
  box([1.3, 0.34, 2.8], [7.7, 1.5, -3.3], CONCRETE_LIGHT, "utility-seat");

  // ---------------------------------------------------------------------------------------------------------------
  // Main stepped slab: broad, heavy, asymmetrical, with a recessed central void.

  box([15.8, 19.6, 5.8], [0, 11.1, -0.25], CONCRETE, "main-housing-slab");
  box([13.6, 3.7, 6.8], [0, 21.95, -0.15], CONCRETE_LIGHT, "top-step");
  box([11.4, 2.0, 7.8], [0, 24.8, -0.05], CONCRETE_DARK, "roof-parapet");
  box([4.8, 16.8, 0.95], [0, 10.8, 3.1], CONCRETE_DARK, "front-structural-mask");
  box([3.7, 16.0, 0.62], [-5.9, 10.7, 3.55], CONCRETE_LIGHT, "left-front-pier");
  box([3.1, 14.8, 0.62], [5.9, 10.3, 3.55], CONCRETE_WARM, "right-front-pier");

  // Offset side wings and the visible stepped terraces.
  box([4.2, 12.4, 7.0], [-9.0, 8.0, -0.7], CONCRETE_DARK, "west-wing");
  box([4.0, 9.4, 7.0], [9.0, 6.5, -0.55], CONCRETE_WARM, "east-wing");
  box([5.4, 2.8, 7.3], [-7.9, 15.65, -0.5], CONCRETE_LIGHT, "west-setback");
  box([5.0, 2.5, 7.4], [7.8, 12.35, -0.42], CONCRETE_DARK, "east-setback");
  box([4.5, 1.5, 7.8], [-7.4, 18.0, -0.4], CONCRETE_WARM, "west-roof-step");
  box([4.0, 1.25, 7.8], [7.2, 15.0, -0.4], CONCRETE_LIGHT, "east-roof-step");

  // Deep roof rim and roof machinery.
  box([14.6, 0.5, 0.55], [0, 25.85, 3.5], CONCRETE_LIGHT, "front-roof-rim");
  box([14.6, 0.5, 0.55], [0, 25.85, -3.55], CONCRETE_DARK, "rear-roof-rim");
  box([0.6, 1.7, 6.7], [-3.4, 26.9, -0.1], CONCRETE_DARK, "roof-stairhead");
  box([2.5, 2.0, 2.5], [3.2, 26.7, -0.4], CONCRETE_WARM, "roof-machine-room");
  box([1.7, 1.0, 1.7], [3.2, 28.2, -0.4], WATER, "water-tank");
  cyl(0.78, 1.35, [3.2, 29.35, -0.4], METAL, "tank-cap", 10);
  box([3.3, 0.18, 3.3], [3.2, 28.7, -0.4], CONCRETE_LIGHT, "tank-platform");

  // ---------------------------------------------------------------------------------------------------------------
  // Recessed front windows. Every opening is outlined by concrete lintels and side returns.

  const floors = [3.25, 5.7, 8.15, 10.6, 13.05, 15.5, 17.95, 20.4];
  const columns = [-5.05, -2.65, 2.65, 5.05];

  for (let fi = 0; fi < floors.length; fi++) {
    const y = floors[fi];
    for (let ci = 0; ci < columns.length; ci++) {
      const x = columns[ci];
      const wide = ci === 1 || ci === 2;
      const w = wide ? 1.72 : 1.18;
      const h = fi % 3 === 1 ? 1.32 : 1.58;
      const z = 3.48;

      box([w + 0.32, h + 0.3, 0.42], [x, y, z], CONCRETE_DARK, `window-recess-${fi}-${ci}`);
      box([w, h, 0.075], [x, y, z + 0.24], fi % 4 === 0 ? GLASS_BLUE : GLASS, `window-glass-${fi}-${ci}`);

      // Concrete mullion and occasional warm curtain panel.
      if (wide) box([0.12, h, 0.09], [x, y, z + 0.3], CONCRETE_LIGHT, `window-mullion-${fi}-${ci}`);
      if ((fi + ci) % 5 === 0)
        box([w * 0.32, h * 0.72, 0.025], [x - w * 0.12, y + 0.02, z + 0.345], CURTAIN, `curtain-${fi}-${ci}`);
    }

    // Strong continuous floor band, broken at the central mask.
    box([4.0, 0.18, 0.56], [-7.0, y - 0.93, 3.3], CONCRETE_LIGHT, `left-floor-band-${fi}`);
    box([4.0, 0.18, 0.56], [7.0, y - 0.93, 3.3], CONCRETE_WARM, `right-floor-band-${fi}`);
  }

  // Central blind concrete stair/core face, punctured by tiny square ventilation slots.
  box([3.9, 15.6, 0.48], [0, 11.2, 3.75], CONCRETE_DARK, "central-blank-core");
  for (let i = 0; i < 12; i++) {
    const y = 4.1 + i * 1.18;
    box([0.5, 0.22, 0.06], [0, y, 4.02], SHADOW, `core-vent-${i}`);
    box([0.14, 0.22, 0.05], [-0.62, y, 4.03], LIGHT, `core-vent-light-${i}`);
  }

  // Entrance: a deep slot with an oversized canopy and stair fins.
  box([4.3, 3.8, 1.2], [0, 2.95, 3.45], SHADOW, "entry-void");
  box([5.3, 0.38, 2.7], [0, 5.05, 4.15], CONCRETE_LIGHT, "entry-canopy");
  box([0.35, 3.4, 2.7], [-2.15, 3.1, 4.1], CONCRETE_WARM, "entry-jamb-left");
  box([0.35, 3.4, 2.7], [2.15, 3.1, 4.1], CONCRETE_WARM, "entry-jamb-right");
  box([2.7, 2.5, 0.08], [0, 3.0, 4.12], GLASS_BLUE, "entry-glazing");
  box([1.0, 0.18, 0.14], [0, 2.0, 4.2], RUST, "entry-door");

  // ---------------------------------------------------------------------------------------------------------------
  // Cantilevered balconies, repeated but not perfectly regular.

  const balconyRows = [
    { y: 5.2, x: -5.0, w: 3.3, d: 1.35 },
    { y: 7.65, x: 5.0, w: 3.0, d: 1.25 },
    { y: 12.55, x: -5.0, w: 3.5, d: 1.45 },
    { y: 15.0, x: 5.0, w: 3.0, d: 1.25 },
    { y: 17.45, x: -5.0, w: 3.3, d: 1.35 },
    { y: 19.9, x: 5.0, w: 3.2, d: 1.4 },
    { y: 22.35, x: -3.9, w: 4.8, d: 1.5 },
  ];

  for (let i = 0; i < balconyRows.length; i++) {
    const q = balconyRows[i];
    const z = 4.1;
    box([q.w, 0.28, q.d], [q.x, q.y, z], CONCRETE_LIGHT, `balcony-slab-${i}`);
    box([q.w + 0.12, 0.22, 0.24], [q.x, q.y + 1.25, z + 0.57], CONCRETE_DARK, `balcony-front-edge-${i}`);
    box([0.22, 1.35, 0.22], [q.x - q.w / 2 + 0.14, q.y, z + 0.5], CONCRETE_WARM, `balcony-side-left-${i}`);
    box([0.22, 1.35, 0.22], [q.x + q.w / 2 - 0.14, q.y, z + 0.5], CONCRETE_WARM, `balcony-side-right-${i}`);

    for (let j = 0; j < 5; j++) {
      const gx = q.x - q.w / 2 + 0.28 + (j * (q.w - 0.56)) / 4;
      rod([gx, q.y - 0.1, z + 0.22], [gx, q.y + 1.2, z + 0.22], 0.035, METAL, `balcony-rail-${i}-${j}`);
    }
  }

  // Side-wing windows: narrow horizontal slits emphasizing the bunker-like mass.
  for (let i = 0; i < 5; i++) {
    const y = 4.1 + i * 2.28;
    box([0.08, 0.74, 2.65], [-11.08, y, -0.7], GLASS, `west-side-window-${i}`);
    box([0.08, 0.74, 2.15], [11.05, y + 0.35, -0.55], GLASS_BLUE, `east-side-window-${i}`);
    box([0.25, 0.16, 3.0], [-11.2, y - 0.5, -0.7], CONCRETE_LIGHT, `west-side-lintel-${i}`);
    box([0.25, 0.16, 2.5], [11.18, y - 0.5, -0.55], CONCRETE_DARK, `east-side-lintel-${i}`);
  }

  // Vertical ventilation stacks and a dramatic projecting end wall.
  box([0.8, 10.8, 1.0], [-11.35, 8.8, 2.2], CONCRETE_LIGHT, "west-end-fin");
  box([0.8, 7.8, 1.0], [11.35, 7.1, 2.0], CONCRETE_DARK, "east-end-fin");
  for (let i = 0; i < 7; i++) {
    box([0.3, 0.8, 0.7], [-11.78, 4.0 + i * 1.55, 2.25], SHADOW, `west-vent-${i}`);
    box([0.3, 0.62, 0.7], [11.78, 4.0 + i * 1.35, 2.05], SHADOW, `east-vent-${i}`);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Rooftop parapet teeth, antenna frames, and water overflow details.

  for (let i = 0; i < 9; i++) {
    const x = -5.8 + i * 1.45;
    box([0.44, 0.65, 0.72], [x, 26.35, 3.5], CONCRETE_LIGHT, `parapet-tooth-${i}`);
  }

  rod([-4.7, 26.35, -2.6], [-4.7, 29.0, -2.6], 0.045, METAL, "antenna-mast");
  rod([-5.6, 27.75, -2.6], [-3.8, 27.75, -2.6], 0.035, METAL, "antenna-crossbar");
  rod([-5.25, 28.25, -2.6], [-4.15, 28.25, -2.6], 0.028, METAL, "antenna-upper-crossbar");

  cyl(0.075, 0.55, [4.05, 29.55, -0.4], RUST, "overflow-pipe", 8);
  box([0.75, 0.18, 0.75], [4.0, 30.0, -0.4], CONCRETE_DARK, "tank-lid");

  // A few raw patch plates and construction scars give the façade scale and material character.
  box([0.9, 0.12, 0.035], [-6.8, 6.4, 3.96], RUST, "repair-scar-a");
  box([1.5, 0.1, 0.035], [6.4, 14.2, 3.96], CONCRETE_WARM, "repair-scar-b");
  box([0.55, 0.1, 0.035], [-3.1, 21.0, 3.96], RUST, "repair-scar-c");
  box([2.0, 0.1, 0.035], [3.7, 9.2, 3.96], CONCRETE_LIGHT, "repair-scar-d");

  return b.root;
}
```