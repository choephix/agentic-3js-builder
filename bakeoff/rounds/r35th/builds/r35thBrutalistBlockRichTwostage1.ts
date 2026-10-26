import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

export const CONCRETE = "#858984";
export const CONCRETE_LIGHT = "#a5a7a1";
export const CONCRETE_DARK = "#626762";
export const CONCRETE_SHADOW = "#454a48";
export const WINDOW = "#1a2528";
export const WINDOW_BLUE = "#263b40";
export const WINDOW_GLOW = "#536b69";
export const ASPHALT = "#303534";
export const METAL = "#4b504e";
export const RUST = "#694d3d";
export const CHALK = "#c3c3b8";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A large raw-concrete brutalist housing block with a stepped massing, cantilevered upper volume, repetitive recessed windows, heavy balconies, pilotis, roof tower, and severe sculptural buttresses.",
};

export const REQUESTS = [
  {
    id: "entryCanopy",
    kind: "add",
    part: "entryPortal",
    what: "Heavy brutalist entrance canopy in raw CONCRETE_DARK: a deep rectangular slab, two angled concrete brackets, a recessed warm wall lamp, and a small engraved housing-block number in CHALK. Keep the assembly chunky and architectural.",
    at: [0, 2.58, 3.72],
    normal: [0, 0, 1],
    bone: null,
    room: [2.9, 0.85, 1.25],
  },
  {
    id: "entryDoor",
    kind: "add",
    part: "entryPortal",
    what: "Recessed communal entry doors at the central front portal: paired dark glass doors in WINDOW, a thick CONCRETE_LIGHT frame, four narrow vertical handles in METAL, and a shallow threshold step.",
    at: [0, 1.55, 3.4],
    normal: [0, 0, 1],
    bone: null,
    room: [1.85, 1.9, 0.35],
  },
  {
    id: "balconyRails",
    kind: "add",
    part: "balconyFront",
    what: "Raw brutalist balcony guards on the three front balconies: thick precast parapet panels in CONCRETE_LIGHT, narrow repetitive rectangular cut-outs, dark shadow gaps, and four oversized METAL drain scuppers.",
    at: [-3.6, 3.17, 4.34],
    normal: [0, 0, 1],
    bone: null,
    room: [3.1, 0.9, 0.32],
  },
  {
    id: "facadeScreens",
    kind: "add",
    part: "upperCantilever",
    what: "A row of deep vertical brise-soleil screens across the upper cantilever facade, built from alternating CONCRETE_LIGHT fins and dark voids. Use a severe repeating rhythm and leave the window openings readable behind them.",
    at: [1.2, 6.18, 3.82],
    normal: [0, 0, 1],
    bone: null,
    room: [7.7, 1.15, 0.65],
  },
  {
    id: "roofLightBar",
    kind: "add",
    part: "roofCoping",
    what: "A slim architectural light bar along the front roof coping: a dark METAL housing, six alternating CYAN and MAGENTA lamps, two concrete brackets, and a small cable disappearing into the roof.",
    at: [0, 7.28, 3.96],
    normal: [0, 0, 1],
    bone: null,
    room: [2.3, 0.35, 0.42],
  },
  {
    id: "roofVentCluster",
    kind: "add",
    part: "roofDeck",
    what: "A dense rooftop mechanical vent cluster in CONCRETE_DARK and METAL: three square exhaust housings, two short polygonal ducts, louver slats, and a few exposed dark cables. Keep it low and blocky.",
    at: [2.4, 7.42, -1.35],
    normal: [0, 1, 0],
    bone: null,
    room: [2.0, 0.8, 1.65],
  },
  {
    id: "waterTank",
    kind: "add",
    part: "roofTower",
    what: "A squat rooftop water tank assembly behind the stair tower: faceted cylindrical tank in CONCRETE_LIGHT, dark METAL bands, four short support legs, a blocky access hatch, and one thin overflow pipe.",
    at: [-1.45, 8.95, -1.05],
    normal: [0, 1, 0],
    bone: null,
    room: [1.65, 1.25, 1.65],
  },
  {
    id: "sideFireStair",
    kind: "add",
    part: "sideFacadeL",
    what: "External emergency stair on the building's left side: two zig-zagging raw concrete flights, thick landing boxes, dark METAL handrails, and a red emergency placard. The stair must hug the side wall and remain visibly secondary to the block.",
    at: [5.83, 3.35, 0.9],
    normal: [1, 0, 0],
    bone: null,
    room: [1.3, 4.4, 3.15],
  },
  {
    id: "rearBridge",
    kind: "add",
    part: "rearFacade",
    what: "A narrow rear access bridge in CONCRETE_DARK connecting the central stair tower to the rear apartments, with two heavy side parapets, a recessed doorway, and a single METAL service light.",
    at: [0, 5.58, -3.72],
    normal: [0, 0, -1],
    bone: null,
    room: [3.8, 0.9, 0.75],
  },
  {
    id: "roofAntenna",
    kind: "add",
    part: "roofTower",
    what: "Minimal rooftop antenna array in METAL: one square mast, three unequal horizontal rods, two small dish-like plates, and four tension cables anchored to the concrete roof. Keep the silhouette sparse and graphic.",
    at: [0.8, 9.05, -0.35],
    normal: [0, 1, 0],
    bone: null,
    room: [1.6, 2.25, 1.25],
  },
  {
    id: "concreteFrontWeathering",
    kind: "texture",
    part: "mainFacade",
    what: "Paint the exposed front concrete in CONCRETE, CONCRETE_LIGHT, and CONCRETE_DARK as raw poured concrete: broad formwork panels, irregular vertical water stains, subtle aggregate mottling, darker recesses under every slab, and a few restrained repaired-patch rectangles. Do not texture the dark windows.",
  },
  {
    id: "concreteSides",
    kind: "texture",
    part: "sideFacadeL",
    what: "Paint both side masses in CONCRETE and CONCRETE_DARK with large horizontal form-tie bands, vertical runoff streaks below window heads, chipped-looking tonal patches, and a slightly darker lower metre near the plinth.",
  },
  {
    id: "upperConcrete",
    kind: "texture",
    part: "upperCantilever",
    what: "Paint the projecting upper volume with pale CONCRETE_LIGHT top planes, mid-tone CONCRETE wall planes, and hard CONCRETE_SHADOW seams beneath the cantilever. Add a sparse grid of panel joints aligned with the upper windows.",
  },
  {
    id: "roofConcrete",
    kind: "texture",
    part: "roofTower",
    what: "Paint the stair tower and roof coping in weathered CONCRETE_LIGHT and CONCRETE_DARK, with dark damp marks at the base, broad slab-edge bands, small aggregate flecks, and clean clear areas reserved for the roof equipment.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const cube = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });

  const slab = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) => cube(size, at, color, name);

  // ---------------------------------------------------------------------------------------------------------------
  // Grounding, plinth, and the severe stepped silhouette.

  cube([12.8, 0.36, 8.5], [0, 0.18, 0], CONCRETE_DARK, "foundationSlab");
  cube([12.2, 0.52, 8.05], [0, 0.58, 0], CONCRETE, "lowerPlinth");
  cube([11.8, 0.20, 7.82], [0, 0.94, 0], CONCRETE_LIGHT, "plinthCoping");

  cube([11.55, 0.64, 7.72], [0, 0.78, 0], CONCRETE_SHADOW, "podiumShadow");
  cube([11.2, 4.78, 6.68], [0, 3.22, -0.08], CONCRETE, "mainFacade");
  cube([10.35, 1.48, 7.08], [0, 6.14, -0.28], CONCRETE_LIGHT, "upperCantilever");
  cube([11.95, 0.34, 7.78], [0, 7.02, -0.16], CONCRETE_DARK, "roofDeck");
  cube([12.25, 0.20, 7.98], [0, 7.29, -0.16], CONCRETE_LIGHT, "roofCoping");

  cube([4.05, 1.34, 3.75], [0, 7.87, -0.42], CONCRETE_LIGHT, "roofTower");
  cube([4.48, 0.26, 4.12], [0, 8.66, -0.42], CONCRETE_DARK, "roofTowerCap");

  // Broad side returns make the block read as a deep housing complex rather than a facade.
  cube([1.15, 4.58, 7.15], [5.08, 3.28, -0.1], CONCRETE_DARK, "sideFacadeL");
  cube([1.15, 4.58, 7.15], [-5.08, 3.28, -0.1], CONCRETE_DARK, "sideFacadeR");
  cube([0.42, 4.95, 7.35], [5.66, 3.18, -0.1], CONCRETE, "sideReturnL");
  cube([0.42, 4.95, 7.35], [-5.66, 3.18, -0.1], CONCRETE, "sideReturnR");

  // ---------------------------------------------------------------------------------------------------------------
  // Ground-level pilotis and front plinth rhythm.

  const pilotiX = [-4.65, -2.3, 0, 2.3, 4.65];
  for (let i = 0; i < pilotiX.length; i++) {
    cube([0.62, 0.92, 0.76], [pilotiX[i], 1.34, 3.18], CONCRETE_LIGHT, `pilotiFront${i}`);
    cube([0.62, 0.24, 0.96], [pilotiX[i], 0.9, 3.12], CONCRETE_DARK, `pilotiFoot${i}`);
  }

  cube([11.72, 0.22, 0.42], [0, 1.02, 3.56], CONCRETE_DARK, "frontPlinthBeam");
  cube([11.5, 0.20, 0.36], [0, 2.38, 3.49], CONCRETE_LIGHT, "frontBeamLower");
  cube([11.5, 0.20, 0.36], [0, 3.78, 3.49], CONCRETE_LIGHT, "frontBeamMiddle");
  cube([11.5, 0.22, 0.42], [0, 5.28, 3.48], CONCRETE_DARK, "frontBeamUpper");

  // ---------------------------------------------------------------------------------------------------------------
  // Central entry portal. It is deliberately plain enough for the Stage 2 entrance assembly.

  cube([2.05, 2.02, 0.16], [0, 1.78, 3.38], WINDOW, "entryPortal");
  cube([0.26, 2.18, 0.42], [-1.08, 1.78, 3.52], CONCRETE_LIGHT, "entryJambL");
  cube([0.26, 2.18, 0.42], [1.08, 1.78, 3.52], CONCRETE_LIGHT, "entryJambR");
  cube([2.35, 0.28, 0.42], [0, 2.88, 3.52], CONCRETE_LIGHT, "entryLintel");
  cube([2.55, 0.18, 1.12], [0, 0.98, 3.72], CONCRETE_DARK, "entryStep");
  cube([2.20, 0.14, 0.76], [0, 1.08, 3.82], CONCRETE, "entryThreshold");

  // ---------------------------------------------------------------------------------------------------------------
  // Repetitive recessed front windows with chunky precast surrounds.

  const lowerRows = [1.58, 3.02, 4.45];
  const lowerXs = [-4.28, -2.14, 2.14, 4.28];
  let frontWindowId = 0;

  for (let r = 0; r < lowerRows.length; r++) {
    for (let c = 0; c < lowerXs.length; c++) {
      const x = lowerXs[c];
      const y = lowerRows[r];
      const w = 1.48;
      const h = 0.78;
      const glass = (r + c) % 3 === 0 ? WINDOW_BLUE : WINDOW;

      cube([w + 0.18, h + 0.16, 0.12], [x, y, 3.335], CONCRETE_SHADOW, `frontReveal${frontWindowId}`);
      cube([w, h, 0.13], [x, y, 3.405], glass, `frontWindow${frontWindowId}`);
      cube([w + 0.26, 0.12, 0.17], [x, y + h / 2 + 0.08, 3.47], CONCRETE_LIGHT, `frontLintel${frontWindowId}`);
      cube([w + 0.26, 0.12, 0.17], [x, y - h / 2 - 0.08, 3.47], CONCRETE_DARK, `frontSill${frontWindowId}`);
      cube([0.11, h + 0.17, 0.18], [x - w / 2 - 0.08, y, 3.47], CONCRETE_LIGHT, `frontFrameL${frontWindowId}`);
      cube([0.11, h + 0.17, 0.18], [x + w / 2 + 0.08, y, 3.47], CONCRETE_LIGHT, `frontFrameR${frontWindowId}`);
      cube([0.075, h - 0.04, 0.19], [x, y, 3.49], CONCRETE_DARK, `frontMullion${frontWindowId}`);
      frontWindowId++;
    }
  }

  // Small upper openings around the entry make the facade feel inhabited but not domestic.
  const upperRows = [5.03];
  const upperXs = [-4.35, -2.18, 2.18, 4.35];
  for (let c = 0; c < upperXs.length; c++) {
    const x = upperXs[c];
    const y = upperRows[0];
    cube([1.52, 0.76, 0.12], [x, y, 3.405], WINDOW_GLOW, `frontUpperWindow${c}`);
    cube([1.78, 0.14, 0.18], [x, y + 0.49, 3.47], CONCRETE_LIGHT, `frontUpperLintel${c}`);
    cube([1.78, 0.14, 0.18], [x, y - 0.49, 3.47], CONCRETE_DARK, `frontUpperSill${c}`);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Deep projecting balconies on the front elevation.

  const balconyXs = [-3.58, 0, 3.58];
  for (let i = 0; i < balconyXs.length; i++) {
    const x = balconyXs[i];
    cube([2.84, 0.22, 1.32], [x, 2.66, 3.82], CONCRETE_LIGHT, `balconyFront${i}`);
    cube([2.82, 0.62, 0.18], [x, 3.04, 4.43], CONCRETE_DARK, `balconyParapet${i}`);
    cube([0.18, 0.62, 1.35], [x - 1.32, 3.04, 3.8], CONCRETE_LIGHT, `balconySideL${i}`);
    cube([0.18, 0.62, 1.35], [x + 1.32, 3.04, 3.8], CONCRETE_LIGHT, `balconySideR${i}`);
    cube([0.48, 0.68, 0.32], [x - 0.91, 2.24, 3.7], CONCRETE_DARK, `balconyBracketL${i}`);
    cube([0.48, 0.68, 0.32], [x + 0.91, 2.24, 3.7], CONCRETE_DARK, `balconyBracketR${i}`);

    for (let k = -2; k <= 2; k++) {
      cube([0.10, 0.54, 0.15], [x + k * 0.49, 3.04, 4.48], CONCRETE_LIGHT, `balconyTooth${i}_${k + 2}`);
    }
  }

  // Dark undersides emphasize the concrete cantilevers.
  cube([3.08, 0.12, 1.48], [-3.58, 2.48, 3.82], CONCRETE_SHADOW, "balconyUndersideL");
  cube([3.08, 0.12, 1.48], [0, 2.48, 3.82], CONCRETE_SHADOW, "balconyUndersideC");
  cube([3.08, 0.12, 1.48], [3.58, 2.48, 3.82], CONCRETE_SHADOW, "balconyUndersideR");

  // ---------------------------------------------------------------------------------------------------------------
  // Upper cantilever facade: taller openings, massive sill, and a harsh shadow line.

  cube([10.72, 0.32, 0.56], [0, 5.46, 3.65], CONCRETE_SHADOW, "cantileverUnderside");
  cube([10.72, 0.22, 0.42], [0, 6.82, 3.52], CONCRETE_DARK, "cantileverTopBand");

  const cantileverXs = [-3.82, -1.28, 1.28, 3.82];
  for (let i = 0; i < cantileverXs.length; i++) {
    const x = cantileverXs[i];
    cube([1.72, 0.88, 0.12], [x, 6.15, 3.40], i % 2 ? WINDOW_BLUE : WINDOW, `cantileverWindow${i}`);
    cube([1.98, 0.14, 0.22], [x, 6.67, 3.50], CONCRETE_LIGHT, `cantileverLintel${i}`);
    cube([1.98, 0.14, 0.22], [x, 5.63, 3.50], CONCRETE_DARK, `cantileverSill${i}`);
    cube([0.16, 1.12, 0.24], [x - 0.96, 6.15, 3.50], CONCRETE_LIGHT, `cantileverFrameL${i}`);
    cube([0.16, 1.12, 0.24], [x + 0.96, 6.15, 3.50], CONCRETE_LIGHT, `cantileverFrameR${i}`);
  }

  // Massive corners and a few narrow concrete fins give the upper block its fortress-like profile.
  cube([0.48, 1.62, 0.72], [-5.02, 6.12, 3.55], CONCRETE_LIGHT, "upperCornerL");
  cube([0.48, 1.62, 0.72], [5.02, 6.12, 3.55], CONCRETE_LIGHT, "upperCornerR");
  for (let i = 0; i < 5; i++) {
    const x = -4.4 + i * 2.2;
    cube([0.18, 1.35, 0.48], [x, 6.18, 3.82], CONCRETE_LIGHT, `upperFacadeFin${i}`);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Side elevations with narrow horizontal windows and deep vertical fins.

  const sideRows = [1.62, 3.12, 4.58];
  const sideZs = [-2.35, -0.25, 1.85];
  let sideId = 0;

  for (const s of [-1, 1]) {
    for (let r = 0; r < sideRows.length; r++) {
      for (let zIndex = 0; zIndex < sideZs.length; zIndex++) {
        const y = sideRows[r];
        const z = sideZs[zIndex];
        const x = s * 5.69;
        cube([0.12, 0.76, 1.22], [x, y, z], (r + zIndex) % 2 ? WINDOW : WINDOW_BLUE, `sideWindow${sideId}`);
        cube([0.22, 0.14, 1.44], [s * 5.76, y + 0.48, z], CONCRETE_LIGHT, `sideLintel${sideId}`);
        cube([0.22, 0.14, 1.44], [s * 5.76, y - 0.48, z], CONCRETE_DARK, `sideSill${sideId}`);
        cube([0.26, 1.18, 0.18], [s * 5.76, y, z - 0.72], CONCRETE_LIGHT, `sideFrameLow${sideId}`);
        sideId++;
      }
    }

    for (let i = 0; i < 6; i++) {
      const z = -3.12 + i * 1.23;
      cube([0.44, 4.7, 0.27], [s * 5.94, 3.3, z], CONCRETE_LIGHT, `sideFin${s < 0 ? "R" : "L"}${i}`);
    }

    cube([0.32, 4.9, 0.44], [s * 6.12, 3.3, 3.12], CONCRETE_DARK, `sideEdgeFin${s < 0 ? "R" : "L"}`);
    cube([0.32, 4.9, 0.44], [s * 6.12, 3.3, -3.28], CONCRETE_DARK, `sideBackEdgeFin${s < 0 ? "R" : "L"}`);
  }

  // Narrow slots at the side corners break up the long side walls.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      cube([0.12, 0.58, 0.72], [s * 5.73, 1.45 + i * 1.03, 3.03], WINDOW_GLOW, `sideCornerSlot${s < 0 ? "R" : "L"}${i}`);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Rear elevation: visible gaps, service windows, and a central stair tower face.

  cube([11.35, 0.22, 0.42], [0, 1.02, -3.48], CONCRETE_DARK, "rearPlinthBand");
  cube([11.35, 0.20, 0.38], [0, 5.28, -3.48], CONCRETE_LIGHT, "rearUpperBand");

  const rearXs = [-4.35, -2.15, 2.15, 4.35];
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < rearXs.length; i++) {
      const x = rearXs[i];
      const y = r === 0 ? 2.0 : 4.25;
      cube([1.46, 0.82, 0.12], [x, y, -3.43], i % 2 ? WINDOW_BLUE : WINDOW, `rearWindow${r}_${i}`);
      cube([1.72, 0.13, 0.18], [x, y + 0.49, -3.51], CONCRETE_LIGHT, `rearLintel${r}_${i}`);
      cube([1.72, 0.13, 0.18], [x, y - 0.49, -3.51], CONCRETE_DARK, `rearSill${r}_${i}`);
    }
  }

  cube([1.62, 2.08, 0.13], [0, 2.0, -3.45], WINDOW, "rearServiceVoid");
  cube([0.24, 2.32, 0.28], [-0.94, 2.0, -3.57], CONCRETE_LIGHT, "rearServiceJambL");
  cube([0.24, 2.32, 0.28], [0.94, 2.0, -3.57], CONCRETE_LIGHT, "rearServiceJambR");
  cube([2.08, 0.22, 0.32], [0, 3.18, -3.57], CONCRETE_DARK, "rearServiceLintel");

  // ---------------------------------------------------------------------------------------------------------------
  // Roof tower face and stairwell slots.

  cube([3.45, 0.16, 0.24], [0, 7.28, 1.55], CONCRETE_DARK, "towerFrontFoot");
  const towerXs = [-1.22, 0, 1.22];
  for (let i = 0; i < towerXs.length; i++) {
    cube([0.72, 0.62, 0.12], [towerXs[i], 7.82, 1.49], i === 1 ? WINDOW_BLUE : WINDOW, `towerWindow${i}`);
    cube([0.9, 0.13, 0.20], [towerXs[i], 8.2, 1.58], CONCRETE_LIGHT, `towerLintel${i}`);
    cube([0.9, 0.13, 0.20], [towerXs[i], 7.44, 1.58], CONCRETE_DARK, `towerSill${i}`);
  }

  cube([0.16, 1.12, 0.26], [-1.82, 7.86, 1.58], CONCRETE_LIGHT, "towerFinL");
  cube([0.16, 1.12, 0.26], [1.82, 7.86, 1.58], CONCRETE_LIGHT, "towerFinR");
  cube([3.42, 0.16, 0.24], [0, 8.45, 1.54], CONCRETE_DARK, "towerTopShadow");

  // Side slots of the stair tower.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      cube([0.12, 0.58, 0.72], [s * 2.05, 7.55 + i * 0.46, -0.42], WINDOW, `towerSideSlot${s < 0 ? "R" : "L"}${i}`);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Roof parapet blocks, vents, and restrained raw-concrete mechanical placeholders.

  cube([11.65, 0.48, 0.24], [0, 7.5, 3.78], CONCRETE_LIGHT, "roofFrontParapet");
  cube([11.65, 0.48, 0.24], [0, 7.5, -4.08], CONCRETE_DARK, "roofRearParapet");
  cube([0.24, 0.48, 7.65], [-5.72, 7.5, -0.15], CONCRETE_DARK, "roofParapetR");
  cube([0.24, 0.48, 7.65], [5.72, 7.5, -0.15], CONCRETE_LIGHT, "roofParapetL");

  const roofUnits = [
    [-3.7, -1.35, 0.72, 0.42, 0.72],
    [3.6, -1.42, 0.92, 0.48, 0.62],
    [-2.7, 1.65, 0.62, 0.35, 0.6],
    [2.85, 1.62, 0.78, 0.4, 0.72],
  ] as const;

  for (let i = 0; i < roofUnits.length; i++) {
    const [x, z, w, h, d] = roofUnits[i];
    cube([w, h, d], [x, 7.61 + h / 2, z], CONCRETE_DARK, `roofMechanical${i}`);
    cube([w + 0.14, 0.10, d + 0.14], [x, 7.64 + h, z], CONCRETE_LIGHT, `roofMechanicalCap${i}`);
    cube([0.16, 0.20, d * 0.72], [x - w * 0.24, 7.78 + h, z], WINDOW, `roofLouverA${i}`);
    cube([0.16, 0.20, d * 0.72], [x + w * 0.24, 7.78 + h, z], WINDOW, `roofLouverB${i}`);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Heavy sculptural front buttresses. These are blocky trapezoidal supports, not smooth columns.

  b.frustumBox(
    [-5.05, 1.02, 3.05],
    [-4.52, 5.48, 3.08],
    [0.72, 0.70],
    [0.42, 0.48],
    { color: CONCRETE_DARK, name: "buttressFrontR", section: "box" },
  );
  b.frustumBox(
    [5.05, 1.02, 3.05],
    [4.52, 5.48, 3.08],
    [0.72, 0.70],
    [0.42, 0.48],
    { color: CONCRETE_DARK, name: "buttressFrontL", section: "box" },
  );

  b.frustumBox(
    [-5.12, 1.02, -2.86],
    [-4.62, 5.36, -2.95],
    [0.68, 0.66],
    [0.38, 0.46],
    { color: CONCRETE_SHADOW, name: "buttressRearR", section: "box" },
  );
  b.frustumBox(
    [5.12, 1.02, -2.86],
    [4.62, 5.36, -2.95],
    [0.68, 0.66],
    [0.38, 0.46],
    { color: CONCRETE_SHADOW, name: "buttressRearL", section: "box" },
  );

  // Concrete diagonal braces below the balconies.
  for (const x of balconyXs) {
    b.frustumBox(
      [x - 0.96, 1.1, 3.32],
      [x - 0.62, 2.45, 3.74],
      [0.38, 0.38],
      [0.22, 0.28],
      { color: CONCRETE_DARK, name: `balconyDiagonalA${x}` , section: "box" },
    );
    b.frustumBox(
      [x + 0.96, 1.1, 3.32],
      [x + 0.62, 2.45, 3.74],
      [0.38, 0.38],
      [0.22, 0.28],
      { color: CONCRETE_DARK, name: `balconyDiagonalB${x}` , section: "box" },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Foundation steps and a few intentionally simple site-contact elements belonging to the building.

  cube([3.15, 0.16, 0.72], [0, 0.37, 4.05], CONCRETE_LIGHT, "entryStepUpper");
  cube([3.75, 0.16, 0.95], [0, 0.20, 4.28], CONCRETE_DARK, "entryStepLower");
  cube([0.34, 0.68, 0.34], [-5.8, 0.72, 3.38], CONCRETE_SHADOW, "cornerBollardR");
  cube([0.34, 0.68, 0.34], [5.8, 0.72, 3.38], CONCRETE_SHADOW, "cornerBollardL");

  // Side foundation relief blocks create a grounded, infrastructural base.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      cube([0.56, 0.38, 1.15], [s * (4.0 + i * 0.72), 0.99, -3.83], CONCRETE_LIGHT, `rearFoundationBlock${s < 0 ? "R" : "L"}${i}`);
    }
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
