import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "brutalist-housing-block",
  description: "A raw concrete brutalist housing block with deep balconies, recessed windows, structural fins, rooftop plant and weathered modular façade.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = "#85847d";
  const CONCRETE_LIGHT = "#aaa79d";
  const CONCRETE_DARK = "#666761";
  const CONCRETE_SHADOW = "#4e504d";
  const CONCRETE_WARM = "#918d80";
  const WINDOW = "#17252a";
  const WINDOW_BLUE = "#233b40";
  const GLASS_GLOW = "#526a68";
  const METAL = "#303735";
  const RUST = "#70483a";
  const SOIL = "#3f4038";
  const WHITE = "#d7d5ca";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string = CONCRETE,
    name?: string,
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, name });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 8,
    name?: string,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, radial),
      color,
      { at, name },
    );

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string = METAL,
    name?: string,
  ) => b.rod(a, z, radius, { color, name, caps: "flat" });

  // ---------------------------------------------------------------------------
  // Site plinth and shadow gap
  // ---------------------------------------------------------------------------

  box([8.7, 0.18, 5.8], [0, 0.09, 0], CONCRETE_DARK, "sitePlinth");
  box([8.15, 0.18, 5.3], [0, 0.27, 0], CONCRETE_LIGHT, "foundationCap");
  box([7.75, 0.08, 5.0], [0, 0.39, 0], CONCRETE_SHADOW, "foundationShadow");
  box([7.6, 0.12, 4.9], [0, 0.48, 0], CONCRETE, "groundFloorBase");

  // Main raw-concrete residential mass.
  box([7.55, 4.75, 4.65], [0, 2.88, 0], CONCRETE, "mainHousingMass");

  // Exposed floor bands: the heavy horizontal lines are characteristic of the block.
  for (let i = 0; i < 5; i++) {
    const y = 0.52 + i * 0.93;
    box([7.72, 0.11, 4.78], [0, y, 0], CONCRETE_LIGHT, `floorBand${i}`);
    box([7.68, 0.045, 4.82], [0, y - 0.065, 0], CONCRETE_SHADOW, `floorShadow${i}`);
  }

  // Parapet and roof crown.
  box([7.75, 0.35, 4.85], [0, 5.34, 0], CONCRETE_LIGHT, "roofParapet");
  box([7.95, 0.12, 5.0], [0, 5.56, 0], CONCRETE_DARK, "roofShadow");
  box([7.35, 0.15, 4.55], [0, 5.67, 0], CONCRETE, "roofDeck");

  // ---------------------------------------------------------------------------
  // Front façade: deep recessed window bays and balcony concrete frames
  // ---------------------------------------------------------------------------

  const frontZ = 2.37;
  const rearWindowZ = 2.31;

  // Thick vertical structural piers.
  for (const x of [-3.62, -2.02, -0.42, 1.18, 2.78, 3.62]) {
    box([0.22, 4.72, 0.30], [x, 2.88, 2.30], CONCRETE_LIGHT, `frontPier${x}`);
  }

  // Staggered, almost oppressive balcony boxes.
  const balconyRows = [
    { y: 1.10, side: -1 },
    { y: 2.03, side: 1 },
    { y: 2.96, side: -1 },
    { y: 3.89, side: 1 },
    { y: 4.82, side: -1 },
  ];

  for (let r = 0; r < balconyRows.length; r++) {
    const { y, side } = balconyRows[r];
    const x = side * 1.83;

    box([2.72, 0.14, 1.05], [x, y - 0.36, 2.80], CONCRETE_LIGHT, `balconySlab${r}`);
    box([2.72, 0.16, 0.18], [x, y + 0.42, 3.23], CONCRETE, `balconyFrontBeam${r}`);
    box([0.16, 0.88, 0.20], [x - 1.28, y + 0.02, 3.23], CONCRETE, `balconyLeftWing${r}`);
    box([0.16, 0.88, 0.20], [x + 1.28, y + 0.02, 3.23], CONCRETE, `balconyRightWing${r}`);

    // Brutalist balcony guardrails: thick, sparse and deliberately infrastructural.
    for (let j = -3; j <= 3; j++) {
      const px = x + j * 0.36;
      rod([px, y - 0.31, 3.34], [px, y + 0.35, 3.34], 0.025, METAL, `balconyRailV${r}_${j}`);
    }
    rod([x - 1.28, y + 0.35, 3.34], [x + 1.28, y + 0.35, 3.34], 0.035, METAL, `balconyRailTop${r}`);
    rod([x - 1.28, y - 0.31, 3.34], [x + 1.28, y - 0.31, 3.34], 0.025, METAL, `balconyRailBottom${r}`);
  }

  // Recessed front windows between the balconies.
  for (let floor = 0; floor < 5; floor++) {
    const y = 0.92 + floor * 0.93;
    for (let col = 0; col < 5; col++) {
      const x = -2.95 + col * 1.48;
      const isBalconyBay =
        (floor === 0 && col === 1) ||
        (floor === 1 && col === 3) ||
        (floor === 2 && col === 1) ||
        (floor === 3 && col === 3) ||
        (floor === 4 && col === 1);

      if (!isBalconyBay) {
        box([0.98, 0.56, 0.075], [x, y, rearWindowZ], WINDOW, `frontWindow${floor}_${col}`);
        box([0.045, 0.62, 0.10], [x - 0.49, y, 2.27], CONCRETE_DARK, `windowJambL${floor}_${col}`);
        box([0.045, 0.62, 0.10], [x + 0.49, y, 2.27], CONCRETE_DARK, `windowJambR${floor}_${col}`);
        box([1.08, 0.045, 0.10], [x, y + 0.31, 2.27], CONCRETE_DARK, `windowLintel${floor}_${col}`);
        box([1.08, 0.045, 0.10], [x, y - 0.31, 2.27], CONCRETE_DARK, `windowSill${floor}_${col}`);
        box([0.025, 0.53, 0.085], [x, y, 2.265], GLASS_GLOW, `glassMullion${floor}_${col}`);
      }
    }
  }

  // Balcony doors and the darkness behind them.
  for (let r = 0; r < balconyRows.length; r++) {
    const { y, side } = balconyRows[r];
    const x = side * 1.83;
    box([1.52, 0.66, 0.07], [x, y + 0.03, 2.30], WINDOW_BLUE, `balconyDoor${r}`);
    box([0.035, 0.70, 0.09], [x, y + 0.03, 2.255], GLASS_GLOW, `doorMullion${r}`);
    box([1.62, 0.055, 0.10], [x, y + 0.39, 2.24], CONCRETE_DARK, `doorLintel${r}`);
  }

  // A few projecting shade hoods make the façade less regular.
  for (const [x, y, w] of [
    [-3.0, 1.55, 1.25],
    [2.98, 2.48, 1.2],
    [-3.0, 3.41, 1.25],
    [2.98, 4.34, 1.2],
  ] as [number, number, number][]) {
    box([w, 0.12, 0.54], [x, y + 0.40, 2.52], CONCRETE_LIGHT, "windowSunHood");
    box([0.07, 0.47, 0.12], [x - w / 2, y + 0.18, 2.52], CONCRETE_DARK, "hoodSideL");
    box([0.07, 0.47, 0.12], [x + w / 2, y + 0.18, 2.52], CONCRETE_DARK, "hoodSideR");
  }

  // ---------------------------------------------------------------------------
  // Left and right side façades: blank walls interrupted by narrow slit windows
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const x = s * 3.80;

    for (let floor = 0; floor < 5; floor++) {
      const y = 0.95 + floor * 0.93;
      for (let k = 0; k < 3; k++) {
        const z = -1.55 + k * 1.48;
        box([0.075, 0.48, 0.56], [x + s * 0.012, y, z], WINDOW, `sideWindow${s}_${floor}_${k}`);
        box([0.11, 0.055, 0.68], [x + s * 0.045, y + 0.29, z], CONCRETE_DARK, "sideLintel");
      }
    }

    // Side brise-soleil ribs.
    for (let k = 0; k < 4; k++) {
      const z = -2.15 + k * 1.43;
      box([0.22, 4.7, 0.10], [x + s * 0.13, 2.88, z], CONCRETE_LIGHT, `sideVerticalRib${s}_${k}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Rear service façade, visible around the mass
  // ---------------------------------------------------------------------------

  for (let floor = 0; floor < 5; floor++) {
    const y = 0.91 + floor * 0.93;
    for (let col = 0; col < 4; col++) {
      const x = -2.58 + col * 1.72;
      box([0.82, 0.55, 0.07], [x, y, -2.35], WINDOW, `rearWindow${floor}_${col}`);
      box([0.88, 0.05, 0.12], [x, y + 0.31, -2.30], CONCRETE_DARK, "rearLintel");
    }
  }
  box([1.32, 2.15, 0.18], [2.62, 1.52, -2.40], CONCRETE_SHADOW, "rearStairTower");
  box([0.86, 0.66, 0.06], [2.62, 1.35, -2.51], WINDOW, "rearStairWindowA");
  box([0.86, 0.66, 0.06], [2.62, 2.20, -2.51], WINDOW, "rearStairWindowB");

  // ---------------------------------------------------------------------------
  // Rooftop plant: stair overrun, service hut, water tanks and vent stacks
  // ---------------------------------------------------------------------------

  box([2.25, 1.18, 1.72], [-1.58, 6.27, 0.15], CONCRETE_LIGHT, "roofStairOverrun");
  box([1.45, 0.34, 0.16], [-1.58, 6.85, 0.15], CONCRETE_DARK, "roofStairCap");
  box([0.76, 0.48, 0.07], [-1.58, 6.32, 1.03], WINDOW, "roofStairGlazing");
  box([0.76, 0.48, 0.07], [-1.58, 6.32, -0.73], WINDOW, "roofStairBackGlazing");

  box([1.42, 0.92, 1.22], [1.52, 6.10, -0.55], CONCRETE, "roofServiceBox");
  box([1.55, 0.12, 1.34], [1.52, 6.60, -0.55], CONCRETE_LIGHT, "roofServiceCrown");

  // Water tank drums with dark support frames.
  for (const x of [0.55, 1.62]) {
    cyl(0.42, 0.82, [x, 6.20, 0.72], CONCRETE_LIGHT, 10, "waterTank");
    cyl(0.45, 0.08, [x, 6.63, 0.72], CONCRETE_DARK, 10, "tankLid");
    rod([x - 0.31, 5.77, 0.46], [x - 0.31, 5.77, 0.98], 0.035, METAL, "tankLeg");
    rod([x + 0.31, 5.77, 0.46], [x + 0.31, 5.77, 0.98], 0.035, METAL, "tankLeg");
    rod([x - 0.31, 5.77, 0.46], [x + 0.31, 5.77, 0.46], 0.035, METAL, "tankBrace");
  }

  // Vent stacks and capped pipes.
  for (const [x, z, h] of [
    [-2.72, -0.88, 0.7],
    [-2.40, -0.88, 0.46],
    [2.72, 1.18, 0.66],
    [2.98, 1.18, 0.42],
  ] as [number, number, number][]) {
    cyl(0.11, h, [x, 5.77 + h / 2, z], METAL, 8, "roofVent");
    cyl(0.17, 0.07, [x, 5.77 + h, z], RUST, 8, "ventCap");
  }

  // A tiny rooftop access ladder.
  for (let i = 0; i < 6; i++) {
    const y = 5.65 + i * 0.23;
    rod([-3.55, y, 1.28], [-3.55, y, 1.70], 0.018, METAL, "ladderRung");
  }
  rod([-3.55, 5.65, 1.28], [-3.55, 6.80, 1.28], 0.026, METAL, "ladderRail");
  rod([-3.55, 5.65, 1.70], [-3.55, 6.80, 1.70], 0.026, METAL, "ladderRail");

  // ---------------------------------------------------------------------------
  // Ground-level inhabitation: recessed entry, refuse alcove, low planting
  // ---------------------------------------------------------------------------

  box([1.76, 1.92, 0.18], [-2.42, 1.27, 2.47], CONCRETE_SHADOW, "entryRecess");
  box([1.32, 1.48, 0.075], [-2.42, 1.28, 2.39], WINDOW, "entryGlass");
  box([0.10, 1.62, 0.14], [-3.08, 1.28, 2.30], CONCRETE_LIGHT, "entryJambL");
  box([0.10, 1.62, 0.14], [-1.76, 1.28, 2.30], CONCRETE_LIGHT, "entryJambR");
  box([1.56, 0.12, 0.20], [-2.42, 2.08, 2.30], CONCRETE_LIGHT, "entryLintel");
  box([1.94, 0.13, 1.04], [-2.42, 2.30, 2.70], CONCRETE_DARK, "entryCanopy");
  box([1.76, 0.10, 0.95], [-2.42, 2.19, 2.96], CONCRETE_LIGHT, "entryCanopyTop");

  // Entry door divisions and handle.
  box([0.035, 1.36, 0.085], [-2.42, 1.29, 2.27], GLASS_GLOW, "entryDoorSplit");
  cyl(0.026, 0.17, [-2.25, 1.28, 2.22], METAL, 8, "entryHandle");
  
  box([1.15, 0.85, 0.75], [2.75, 0.78, 2.68], CONCRETE_DARK, "refuseAlcove");
  box([0.98, 0.52, 0.10], [2.75, 0.73, 3.08], METAL, "refuseDoor");
  box([0.98, 0.08, 0.72], [2.75, 1.22, 2.68], CONCRETE_LIGHT, "refuseLintel");

  // Hard-edged planters and sparse architectural shrubs.
  for (const [x, z, w] of [
    [-3.42, 2.92, 0.72],
    [-2.48, 2.92, 0.52],
    [2.05, 2.92, 0.85],
    [3.15, 2.92, 0.52],
  ] as [number, number, number][]) {
    box([w, 0.38, 0.48], [x, 0.68, z], CONCRETE_DARK, "planter");
    box([w - 0.10, 0.10, 0.38], [x, 0.90, z], SOIL, "planterSoil");
    for (let j = 0; j < 3; j++) {
      const px = x - w * 0.28 + j * w * 0.28;
      rod([px, 0.92, z], [px + (j - 1) * 0.08, 1.22 + (j % 2) * 0.14, z + (j - 1) * 0.06], 0.035, "#4b5a43", "plantStem");
    }
  }

  // Brutalist drainage pipes at the building edges.
  for (const s of [-1, 1]) {
    rod([s * 3.48, 0.53, 2.46], [s * 3.48, 5.30, 2.46], 0.045, METAL, "frontDrainPipe");
    rod([s * 3.48, 0.53, 2.46], [s * 3.48, 0.53, 1.78], 0.055, RUST, "drainOutlet");
  }

  // Long diagonal repair scars / construction joints, kept as raised concrete strips.
  rod([-3.28, 1.02, 2.455], [-2.18, 2.00, 2.455], 0.018, CONCRETE_DARK, "repairScarA");
  rod([1.92, 3.00, 2.455], [3.08, 4.04, 2.455], 0.018, CONCRETE_DARK, "repairScarB");
  rod([-3.10, 4.12, -2.39], [-1.95, 3.13, -2.39], 0.018, CONCRETE_DARK, "rearRepairScar");

  return b.root;
}
