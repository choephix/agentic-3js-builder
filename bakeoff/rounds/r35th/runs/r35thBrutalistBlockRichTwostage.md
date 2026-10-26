<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

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
```

<!-- call: texture -->

```ts
import * as THREE from "three";
import {
  cells,
  createBuilder,
  mix,
  noise,
  paint,
  type Builder,
} from "agentic-3js-builder";

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
    "A large raw-concrete brutalist housing block with stepped massing, cantilevered upper volume, repetitive recessed windows, heavy balconies, pilotis, roof tower, weathered concrete, and severe sculptural buttresses.",
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

const fract = (x: number) => x - Math.floor(x);
const bandDistance = (x: number, period: number) =>
  Math.abs(fract(x / period + 0.5) - 0.5);

const FRONT_CONCRETE = paint((p, n, _s) => {
  let c = n.y > 0.55 ? CONCRETE_LIGHT : n.y < -0.42 ? CONCRETE_DARK : CONCRETE;

  if (n.z > 0.55) {
    const verticalJoint = bandDistance(p.x + 5.6, 2.2);
    const horizontalJoint = bandDistance(p.y - 0.95, 1.42);

    if (verticalJoint < 0.012 || horizontalJoint < 0.014) {
      return CONCRETE_DARK;
    }

    const aggregate = noise(p, 0.22, 17);
    const damp = noise(p, 0.38, 29);
    const stainColumn =
      noise(p, 0.7, 41) > 0.61 &&
      Math.abs(Math.sin(p.x * 8.7 + noise(p, 0.5, 12) * 2.5)) > 0.82 &&
      p.y < 5.3;

    if (stainColumn) {
      c = mix(c, CONCRETE_DARK, 0.20 + 0.25 * damp);
    } else if (aggregate > 0.78) {
      c = mix(c, CONCRETE_LIGHT, 0.10);
    }

    const patchX = bandDistance(p.x + 4.9, 3.15);
    const patchY = bandDistance(p.y - 1.22, 2.37);
    if (patchX < 0.075 && patchY < 0.055 && aggregate > 0.42) {
      c = mix(c, CONCRETE_LIGHT, 0.23);
    }
  }

  if (n.y < -0.55) c = mix(c, CONCRETE_SHADOW, 0.42);
  return c;
});

const SIDE_CONCRETE = paint((p, n, _s) => {
  let c = n.y > 0.55 ? CONCRETE : CONCRETE_DARK;

  if (Math.abs(n.x) > 0.52) {
    const lower = Math.max(0, Math.min(1, (1.45 - p.y) / 0.85));
    c = mix(c, CONCRETE_DARK, 0.24 * lower);

    const tieBand = bandDistance(p.y - 0.72, 1.34);
    if (tieBand < 0.018) return CONCRETE_SHADOW;

    const runoff = noise(p, 0.33, 71);
    const vertical = Math.abs(Math.sin(p.z * 5.4 + runoff * 4.0));
    if (runoff > 0.67 && vertical > 0.68 && p.y < 5.0) {
      c = mix(c, CONCRETE_SHADOW, 0.18 + runoff * 0.12);
    }

    const chip = cells(p, 0.48, 83);
    if (chip.d2 - chip.d1 < 0.075) {
      c = mix(c, CONCRETE_LIGHT, 0.10);
    }
  }

  if (n.y < -0.5) c = mix(c, CONCRETE_SHADOW, 0.30);
  return c;
});

const UPPER_CONCRETE = paint((p, n, _s) => {
  let c = n.y > 0.52 ? CONCRETE_LIGHT : CONCRETE;

  if (n.y < -0.45) return CONCRETE_SHADOW;

  if (n.z > 0.55) {
    const verticalJoint = bandDistance(p.x + 5.0, 2.54);
    const horizontalJoint = bandDistance(p.y - 5.48, 1.18);
    if (verticalJoint < 0.013 || horizontalJoint < 0.016) return CONCRETE_SHADOW;

    const aggregate = noise(p, 0.25, 101);
    if (aggregate > 0.80) c = mix(c, CONCRETE_LIGHT, 0.12);
  }

  if (n.x > 0.55 || n.x < -0.55) {
    const sideJoint = bandDistance(p.z + 3.4, 1.8);
    if (sideJoint < 0.014) c = CONCRETE_DARK;
  }

  return c;
});

const ROOF_CONCRETE = paint((p, n, _s) => {
  let c = n.y > 0.52 ? CONCRETE_LIGHT : CONCRETE;

  if (p.y < 7.55) {
    c = mix(c, CONCRETE_DARK, 0.35);
  }

  if (n.z > 0.52 || Math.abs(n.x) > 0.52) {
    const slabBand = bandDistance(p.y - 7.24, 0.62);
    if (slabBand < 0.022) return CONCRETE_DARK;

    const flecks = noise(p, 0.18, 121);
    if (flecks > 0.81) c = mix(c, CONCRETE_DARK, 0.15);
  }

  if (n.y < -0.5) c = mix(c, CONCRETE_SHADOW, 0.35);
  return c;
});

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const cube = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });

  // Foundation, podium, and the stepped brutalist silhouette.
  cube([12.8, 0.36, 8.5], [0, 0.18, 0], CONCRETE_DARK, "foundationSlab");
  cube([12.2, 0.52, 8.05], [0, 0.58, 0], CONCRETE, "lowerPlinth");
  cube([11.8, 0.20, 7.82], [0, 0.94, 0], CONCRETE_LIGHT, "plinthCoping");

  cube([11.55, 0.64, 7.72], [0, 0.78, 0], CONCRETE_SHADOW, "podiumShadow");
  cube([11.2, 4.78, 6.68], [0, 3.22, -0.08], FRONT_CONCRETE, "mainFacade");
  cube([10.35, 1.48, 7.08], [0, 6.14, -0.28], UPPER_CONCRETE, "upperCantilever");
  cube([11.95, 0.34, 7.78], [0, 7.02, -0.16], ROOF_CONCRETE, "roofDeck");
  cube([12.25, 0.20, 7.98], [0, 7.29, -0.16], ROOF_CONCRETE, "roofCoping");

  cube([4.05, 1.34, 3.75], [0, 7.87, -0.42], ROOF_CONCRETE, "roofTower");
  cube([4.48, 0.26, 4.12], [0, 8.66, -0.42], CONCRETE_DARK, "roofTowerCap");

  // Deep side masses; both use the same weathered side paint.
  cube([1.15, 4.58, 7.15], [5.08, 3.28, -0.1], SIDE_CONCRETE, "sideFacadeL");
  cube([1.15, 4.58, 7.15], [-5.08, 3.28, -0.1], SIDE_CONCRETE, "sideFacadeR");
  cube([0.42, 4.95, 7.35], [5.66, 3.18, -0.1], SIDE_CONCRETE, "sideReturnL");
  cube([0.42, 4.95, 7.35], [-5.66, 3.18, -0.1], SIDE_CONCRETE, "sideReturnR");

  // Pilotis and front plinth rhythm.
  const pilotiX = [-4.65, -2.3, 0, 2.3, 4.65];
  for (let i = 0; i < pilotiX.length; i++) {
    cube([0.62, 0.92, 0.76], [pilotiX[i], 1.34, 3.18], CONCRETE_LIGHT, `pilotiFront${i}`);
    cube([0.62, 0.24, 0.96], [pilotiX[i], 0.9, 3.12], CONCRETE_DARK, `pilotiFoot${i}`);
  }

  cube([11.72, 0.22, 0.42], [0, 1.02, 3.56], CONCRETE_DARK, "frontPlinthBeam");
  cube([11.5, 0.20, 0.36], [0, 2.38, 3.49], CONCRETE_LIGHT, "frontBeamLower");
  cube([11.5, 0.20, 0.36], [0, 3.78, 3.49], CONCRETE_LIGHT, "frontBeamMiddle");
  cube([11.5, 0.22, 0.42], [0, 5.28, 3.48], CONCRETE_DARK, "frontBeamUpper");

  // Central entry portal.
  cube([2.05, 2.02, 0.16], [0, 1.78, 3.38], WINDOW, "entryPortal");
  cube([0.26, 2.18, 0.42], [-1.08, 1.78, 3.52], CONCRETE_LIGHT, "entryJambL");
  cube([0.26, 2.18, 0.42], [1.08, 1.78, 3.52], CONCRETE_LIGHT, "entryJambR");
  cube([2.35, 0.28, 0.42], [0, 2.88, 3.52], CONCRETE_LIGHT, "entryLintel");
  cube([2.55, 0.18, 1.12], [0, 0.98, 3.72], CONCRETE_DARK, "entryStep");
  cube([2.20, 0.14, 0.76], [0, 1.08, 3.82], CONCRETE, "entryThreshold");

  // Recessed lower windows.
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

  // Small upper openings around the entry.
  const upperXs = [-4.35, -2.18, 2.18, 4.35];
  for (let c = 0; c < upperXs.length; c++) {
    const x = upperXs[c];
    const y = 5.03;
    cube([1.52, 0.76, 0.12], [x, y, 3.405], WINDOW_GLOW, `frontUpperWindow${c}`);
    cube([1.78, 0.14, 0.18], [x, y + 0.49, 3.47], CONCRETE_LIGHT, `frontUpperLintel${c}`);
    cube([1.78, 0.14, 0.18], [x, y - 0.49, 3.47], CONCRETE_DARK, `frontUpperSill${c}`);
  }

  // Deep projecting balconies.
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

  cube([3.08, 0.12, 1.48], [-3.58, 2.48, 3.82], CONCRETE_SHADOW, "balconyUndersideL");
  cube([3.08, 0.12, 1.48], [0, 2.48, 3.82], CONCRETE_SHADOW, "balconyUndersideC");
  cube([3.08, 0.12, 1.48], [3.58, 2.48, 3.82], CONCRETE_SHADOW, "balconyUndersideR");

  // Upper cantilever facade.
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

  cube([0.48, 1.62, 0.72], [-5.02, 6.12, 3.55], CONCRETE_LIGHT, "upperCornerL");
  cube([0.48, 1.62, 0.72], [5.02, 6.12, 3.55], CONCRETE_LIGHT, "upperCornerR");
  for (let i = 0; i < 5; i++) {
    const x = -4.4 + i * 2.2;
    cube([0.18, 1.35, 0.48], [x, 6.18, 3.82], CONCRETE_LIGHT, `upperFacadeFin${i}`);
  }

  // Side elevations.
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

  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      cube([0.12, 0.58, 0.72], [s * 5.73, 1.45 + i * 1.03, 3.03], WINDOW_GLOW, `sideCornerSlot${s < 0 ? "R" : "L"}${i}`);
    }
  }

  // Rear elevation.
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

  // Roof tower and stairwell slots.
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

  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      cube([0.12, 0.58, 0.72], [s * 2.05, 7.55 + i * 0.46, -0.42], WINDOW, `towerSideSlot${s < 0 ? "R" : "L"}${i}`);
    }
  }

  // Roof parapets and mechanical placeholders.
  cube([11.65, 0.48, 0.24], [0, 7.5, 3.78], ROOF_CONCRETE, "roofFrontParapet");
  cube([11.65, 0.48, 0.24], [0, 7.5, -4.08], ROOF_CONCRETE, "roofRearParapet");
  cube([0.24, 0.48, 7.65], [-5.72, 7.5, -0.15], ROOF_CONCRETE, "roofParapetR");
  cube([0.24, 0.48, 7.65], [5.72, 7.5, -0.15], ROOF_CONCRETE, "roofParapetL");

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

  // Sculptural buttresses.
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

  // Concrete diagonal balcony braces.
  for (const x of balconyXs) {
    b.frustumBox(
      [x - 0.96, 1.1, 3.32],
      [x - 0.62, 2.45, 3.74],
      [0.38, 0.38],
      [0.22, 0.28],
      { color: CONCRETE_DARK, name: `balconyDiagonalA${x}`, section: "box" },
    );
    b.frustumBox(
      [x + 0.96, 1.1, 3.32],
      [x + 0.62, 2.45, 3.74],
      [0.38, 0.38],
      [0.22, 0.28],
      { color: CONCRETE_DARK, name: `balconyDiagonalB${x}`, section: "box" },
    );
  }

  // Entry steps and site-contact elements.
  cube([3.15, 0.16, 0.72], [0, 0.37, 4.05], CONCRETE_LIGHT, "entryStepUpper");
  cube([3.75, 0.16, 0.95], [0, 0.20, 4.28], CONCRETE_DARK, "entryStepLower");
  cube([0.34, 0.68, 0.34], [-5.8, 0.72, 3.38], CONCRETE_SHADOW, "cornerBollardR");
  cube([0.34, 0.68, 0.34], [5.8, 0.72, 3.38], CONCRETE_SHADOW, "cornerBollardL");

  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      cube([0.56, 0.38, 1.15], [s * (4.0 + i * 0.72), 0.99, -3.83], CONCRETE_LIGHT, `rearFoundationBlock${s < 0 ? "R" : "L"}${i}`);
    }
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addEntryCanopy(b: Builder) {
  const LAMP = "#ffc56b";
  const LAMP_CORE = "#fff2bd";
  const PLATE_INK = "#252927";
  const FORM_DARK = "#555b58";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      name,
      group: "stage2.entryCanopy",
    });

  // The canopy is a deep, low concrete shelf. Its rear edge bites into the facade,
  // while the heavy front fascia gives the entrance a strongly legible silhouette.
  box([2.72, 0.22, 0.82], [0, 2.87, 3.88], CONCRETE_DARK, "entryCanopy");
  box([2.84, 0.28, 0.16], [0, 2.86, 4.29], CONCRETE_SHADOW, "entryCanopyFrontShadow");
  box([2.58, 0.10, 0.76], [0, 3.005, 3.87], CONCRETE_LIGHT, "entryCanopyTopCoping");
  box([2.48, 0.08, 0.74], [0, 2.745, 3.86], FORM_DARK, "entryCanopyUnderside");

  // Thick end blocks make the slab read as precast construction rather than a thin awning.
  box([0.20, 0.34, 0.88], [-1.27, 2.87, 3.89], CONCRETE_LIGHT, "entryCanopyEndL");
  box([0.20, 0.34, 0.88], [1.27, 2.87, 3.89], CONCRETE_LIGHT, "entryCanopyEndR");

  // Four shallow formwork ribs beneath the canopy create a graphic rhythm in shadow.
  for (let i = 0; i < 4; i++) {
    const x = -0.86 + i * 0.575;
    box([0.065, 0.12, 0.68], [x, 2.695, 3.88], CONCRETE_LIGHT, `entryCanopyRib${i}`);
  }

  // Angled concrete brackets, widening into blunt wall plates.
  for (const s of [-1, 1]) {
    const side = s < 0 ? "R" : "L";

    box([0.42, 0.34, 0.12], [s * 0.89, 2.42, 3.53], CONCRETE_LIGHT, `entryBracketWallPlate${side}`);

    b.frustumBox(
      [s * 0.89, 2.48, 3.57],
      [s * 1.02, 2.78, 4.08],
      [0.38, 0.34],
      [0.26, 0.25],
      {
        color: CONCRETE_DARK,
        section: "box",
        flat: true,
        name: `entryBracket${side}`,
        group: "stage2.entryCanopy",
      },
    );

    // Small cap at each bracket's upper bearing point.
    box([0.34, 0.10, 0.28], [s * 1.02, 2.80, 4.08], CONCRETE_LIGHT, `entryBracketCap${side}`);
  }

  // A recessed wall lamp sits between the door and the canopy, protected by the slab.
  box([0.52, 0.30, 0.075], [0, 2.43, 3.535], PLATE_INK, "entryLampRecess");
  box([0.38, 0.22, 0.055], [0, 2.43, 3.585], CONCRETE_DARK, "entryLampHousing");
  box([0.055, 0.24, 0.075], [-0.235, 2.43, 3.57], CONCRETE_LIGHT, "entryLampHousingL");
  box([0.055, 0.24, 0.075], [0.235, 2.43, 3.57], CONCRETE_LIGHT, "entryLampHousingR");

  const lampTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 36">
      <rect width="64" height="36" fill="${LAMP}"/>
      <rect x="6" y="6" width="52" height="24" rx="2" fill="${LAMP_CORE}"/>
      <path d="M10 9 H54 M10 27 H54" stroke="#fff9d7" stroke-width="2" opacity=".85"/>
    </svg>`,
    { size: 128 },
  );

  const lamp = b.part(new THREE.PlaneGeometry(0.30, 0.14), "#ffffff", {
    at: [0, 2.43, 3.622],
    dir: [0, 0, 1],
    axis: "z",
    texture: lampTexture,
    name: "entryWarmLamp",
    group: "stage2.entryCanopy",
  });
  glow(lamp, 1.8);

  // Two tiny metal fasteners keep the lamp housing visually anchored.
  for (const x of [-0.16, 0.16]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8), METAL, {
      at: [x, 2.43, 3.632],
      dir: [0, 0, 1],
      name: `entryLampFastener${x < 0 ? "L" : "R"}`,
      group: "stage2.entryCanopy",
    });
  }

  // A dark inset plaque on the canopy fascia receives the block number.
  box([0.48, 0.22, 0.035], [0, 2.87, 4.382], PLATE_INK, "entryNumberPlaque");
  box([0.39, 0.15, 0.018], [0, 2.87, 4.405], CONCRETE_DARK, "entryNumberInset");

  const numberTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48">
      <text x="60" y="37" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="36" font-weight="700" letter-spacing="5"
        fill="#c3c3b8">21</text>
    </svg>`,
    { size: 192 },
  );

  b.part(new THREE.PlaneGeometry(0.34, 0.135), CHALK, {
    at: [0, 2.87, 4.418],
    dir: [0, 0, 1],
    axis: "z",
    texture: numberTexture,
    name: "entryHousingNumber21",
    group: "stage2.entryCanopy",
  });

  // Thin concrete joint marks across the fascia suggest the canopy was cast in a mould.
  for (let i = 0; i < 5; i++) {
    const x = -0.98 + i * 0.49;
    box([0.018, 0.20, 0.012], [x, 2.87, 4.392], CONCRETE_LIGHT, `entryFasciaJoint${i}`);
  }

  // Chunky threshold extension ties the new canopy to the existing communal doorway.
  box([2.22, 0.12, 0.52], [0, 1.12, 3.88], CONCRETE_DARK, "entryThresholdCanopyShadow");
  box([1.92, 0.08, 0.36], [0, 1.205, 3.94], CONCRETE_LIGHT, "entryThresholdCanopyEdge");
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, mottle, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addEntryDoor(b: Builder) {
  const rawLight = mottle(CONCRETE_LIGHT, CONCRETE, {
    size: 0.18,
    contrast: 0.7,
    seed: 2201,
  });
  const rawDark = mottle(CONCRETE_DARK, CONCRETE_SHADOW, {
    size: 0.16,
    contrast: 0.75,
    seed: 2202,
  });

  const AMBER = "#e6a34d";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string | ReturnType<typeof mottle>,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string | ReturnType<typeof mottle>,
    name: string,
    radialSegments = 8,
    dir?: [number, number, number],
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, radialSegments, 1, false),
      color,
      {
        at,
        name,
        flat: true,
        ...(dir ? { dir, axis: "y" as const } : {}),
      },
    );

  // ---------------------------------------------------------------------------------------------------------------
  // Recessed communal entry doors.

  const doorGlass = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 160">
      <rect width="80" height="160" fill="#111a1d"/>
      <rect x="4" y="4" width="72" height="152" fill="#1f3033" stroke="#0a1011" stroke-width="5"/>
      <path d="M8 142 L37 12 L49 12 L20 142Z" fill="#587174" opacity=".28"/>
      <path d="M42 154 L70 26 L76 26 L51 154Z" fill="#829795" opacity=".16"/>
      <path d="M7 34 H74 M5 105 H75" stroke="#92aaa5" stroke-width="2" opacity=".16"/>
      <path d="M11 150 H69" stroke="#a9b4a9" stroke-width="3" opacity=".32"/>
    </svg>`,
    { size: 256 },
  );

  const entrySign = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 28">
      <rect width="128" height="28" rx="2" fill="#222725"/>
      <rect x="2" y="2" width="124" height="24" fill="none" stroke="#b9b8a5" stroke-width="1"/>
      <text x="64" y="19" text-anchor="middle" font-family="monospace" font-size="13" letter-spacing="3" fill="#d3c8a2">BLOCK 07</text>
    </svg>`,
    { size: 192 },
  );

  // Deep door leaves, kept behind the new concrete frame.
  for (const side of [-1, 1]) {
    const x = side * 0.405;

    box([0.76, 1.58, 0.075], [x, 1.58, 3.435], WINDOW, `s2_entryDoorLeaf${side}`);
    b.part(new THREE.PlaneGeometry(0.69, 1.48), "#ffffff", {
      at: [x, 1.59, 3.478],
      dir: [0, 0, 1],
      axis: "z",
      texture: doorGlass,
      name: `s2_entryDoorGlass${side}`,
    });

    // Lower kick plates and a narrow centre seam make the pair read as operable doors.
    box([0.64, 0.16, 0.025], [x, 0.91, 3.523], METAL, `s2_entryKick${side}`);
    box([0.035, 1.5, 0.025], [side * 0.012, 1.58, 3.525], CONCRETE_SHADOW, `s2_entryDoorSeam${side}`);
  }

  // Heavy inner frame: two side jambs, lintel, and a low threshold sill.
  box([0.18, 1.82, 0.14], [-0.88, 1.58, 3.505], rawLight, "s2_entryFrameR");
  box([0.18, 1.82, 0.14], [0.88, 1.58, 3.505], rawLight, "s2_entryFrameL");
  box([1.94, 0.18, 0.14], [0, 2.46, 3.505], rawLight, "s2_entryFrameTop");
  box([1.92, 0.14, 0.28], [0, 0.73, 3.52], rawDark, "s2_entryThresholdBase");
  box([1.76, 0.08, 0.34], [0, 0.81, 3.55], rawLight, "s2_entryThresholdCap");

  // Four vertical handles, each with a pair of small mounting bosses.
  const handleXs = [-0.59, -0.25, 0.25, 0.59];
  for (let i = 0; i < handleXs.length; i++) {
    const x = handleXs[i];
    cylinder(0.018, 0.29, [x, 1.60, 3.548], METAL, `s2_entryHandle${i}`, 8);

    cylinder(0.035, 0.018, [x, 1.45, 3.558], METAL, `s2_entryHandleMountA${i}`, 8, [0, 0, 1]);
    cylinder(0.035, 0.018, [x, 1.75, 3.558], METAL, `s2_entryHandleMountB${i}`, 8, [0, 0, 1]);
  }

  // Small wall lamps and the dry institutional sign above the doors.
  for (const side of [-1, 1]) {
    box([0.18, 0.24, 0.035], [side * 0.73, 2.26, 3.555], CONCRETE_SHADOW, `s2_entryLampBack${side}`);
    const lamp = box([0.095, 0.14, 0.025], [side * 0.73, 2.26, 3.58], AMBER, `s2_entryLamp${side}`);
    glow(lamp, 1.35);
  }

  b.part(new THREE.PlaneGeometry(0.56, 0.12), "#ffffff", {
    at: [0, 2.27, 3.57],
    dir: [0, 0, 1],
    axis: "z",
    texture: entrySign,
    name: "s2_entrySign",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Three front balcony guard assemblies.

  const balconyCenters = [-3.58, 0, 3.58];

  for (let balcony = 0; balcony < balconyCenters.length; balcony++) {
    const cx = balconyCenters[balcony];

    // Existing solid parapet becomes a deep shadowed backing; the new pieces overlay its front face.
    box([2.76, 0.58, 0.035], [cx, 3.14, 4.532], CONCRETE_SHADOW, `s2_balconyShadow${balcony}`);

    // Thick bottom and top precast rails.
    box([2.86, 0.17, 0.09], [cx, 2.83, 4.555], rawLight, `s2_balconyLowerBeam${balcony}`);
    box([2.86, 0.16, 0.10], [cx, 3.47, 4.555], rawLight, `s2_balconyUpperBeam${balcony}`);

    // Seven substantial piers leave six narrow, regular recessed openings.
    for (let pier = 0; pier < 7; pier++) {
      const x = cx - 1.31 + pier * 0.437;
      box([0.17, 0.52, 0.095], [x, 3.15, 4.558], rawLight, `s2_balconyPier${balcony}_${pier}`);
    }

    // Dark inset lintel strips deepen each opening and stop the guard from reading as a flat fence.
    for (let gap = 0; gap < 6; gap++) {
      const x = cx - 1.092 + gap * 0.437;
      box([0.265, 0.045, 0.045], [x, 3.395, 4.575], WINDOW, `s2_balconyGapHeader${balcony}_${gap}`);
    }

    // Four oversized drain scuppers per balcony, punched through the lower edge.
    for (let drain = 0; drain < 4; drain++) {
      const x = cx - 0.94 + drain * 0.627;
      cylinder(
        0.048,
        0.15,
        [x, 2.79, 4.605],
        METAL,
        `s2_balconyScupper${balcony}_${drain}`,
        8,
        [0, 0, 1],
      );

      // Small dark collar makes each outlet look embedded rather than pasted on.
      cylinder(
        0.072,
        0.018,
        [x, 2.79, 4.532],
        CONCRETE_DARK,
        `s2_balconyScupperCollar${balcony}_${drain}`,
        8,
        [0, 0, 1],
      );
    }
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFacadeScreens(b: Builder) {
  const CYAN = "#63e5d8";
  const MAGENTA = "#dc62c7";

  const box = (
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

  const facadeAt = new THREE.Vector3(1.2, 6.18, 3.82);
  const facadePoint = (x: number, y: number, z: number): [number, number, number] => [
    facadeAt.x + x,
    facadeAt.y + y,
    facadeAt.z + z,
  ];

  // ---------------------------------------------------------------------------------------------------------------
  // Deep vertical brise-soleil screen. The fins project well beyond the upper facade,
  // while the narrow dark panels behind the gaps make the voids read as intentional
  // architectural shadow rather than missing geometry.

  const finCount = 11;
  const finStep = 0.71;
  const firstFin = -3.55;

  for (let i = 0; i < finCount; i++) {
    const x = firstFin + i * finStep;
    const width = i % 3 === 1 ? 0.16 : 0.22;

    box(
      [width, 0.98, 0.50],
      facadePoint(x, 0, 0),
      i % 2 === 0 ? CONCRETE_LIGHT : CONCRETE,
      `s23ScreenFin${i}`,
    );

    // A narrow, deep shadow rebate on the front face gives each precast fin a
    // legible edge under hard lighting.
    box(
      [0.035, 0.78, 0.026],
      facadePoint(x, 0.0, 0.264),
      CONCRETE_DARK,
      `s23ScreenRebate${i}`,
    );

    // Small top edge, like a separately cast coping piece.
    box(
      [width + 0.045, 0.055, 0.535],
      facadePoint(x, -0.505, 0),
      CONCRETE_LIGHT,
      `s23ScreenFootCap${i}`,
    );
  }

  // The ten dark reveals sit behind the fins. Their shallow depth leaves the
  // existing upper windows readable through the rhythm.
  for (let i = 0; i < finCount - 1; i++) {
    const x = firstFin + finStep * i + finStep * 0.5;
    box(
      [0.47, 0.82, 0.055],
      facadePoint(x, 0.0, -0.275),
      WINDOW,
      `s23ScreenVoid${i}`,
    );
  }

  // Continuous top and bottom rails visually bind the individually cast fins.
  box(
    [7.48, 0.075, 0.53],
    facadePoint(0, -0.505, 0),
    CONCRETE_LIGHT,
    "s23ScreenLowerRail",
  );
  box(
    [7.48, 0.075, 0.53],
    facadePoint(0, 0.505, 0),
    CONCRETE_DARK,
    "s23ScreenUpperShadowRail",
  );

  // Four chunky bearing blocks make the screen appear structurally supported,
  // rather than pasted onto the facade.
  for (let i = 0; i < 4; i++) {
    const x = -3.15 + i * 2.10;
    box(
      [0.36, 0.10, 0.48],
      facadePoint(x, -0.555, 0),
      CONCRETE_DARK,
      `s23ScreenBearing${i}`,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Slim luminous roof coping bar. It is intentionally small against the huge
  // concrete mass: a few saturated lamps provide the only jewel-like colour.

  const roofAt = new THREE.Vector3(0, 7.28, 3.96);
  const roofPoint = (x: number, y: number, z: number): [number, number, number] => [
    roofAt.x + x,
    roofAt.y + y,
    roofAt.z + z,
  ];

  box([2.24, 0.15, 0.25], roofPoint(0, 0.075, 0), METAL, "s23RoofLightHousing");
  box([2.30, 0.06, 0.29], roofPoint(0, 0.155, 0.005), CONCRETE_DARK, "s23RoofLightCoping");

  box([0.075, 0.19, 0.31], roofPoint(-1.075, 0.05, 0), METAL, "s23RoofLightEndL");
  box([0.075, 0.19, 0.31], roofPoint(1.075, 0.05, 0), METAL, "s23RoofLightEndR");

  // Concrete bearing brackets descend into the roof coping.
  box([0.17, 0.18, 0.32], roofPoint(-0.91, -0.115, -0.11), CONCRETE_LIGHT, "s23RoofLightBracketL");
  box([0.17, 0.18, 0.32], roofPoint(0.91, -0.115, -0.11), CONCRETE_LIGHT, "s23RoofLightBracketR");

  const lampXs = [-0.875, -0.525, -0.175, 0.175, 0.525, 0.875];
  for (let i = 0; i < lampXs.length; i++) {
    const x = lampXs[i];
    const lampColor = i % 2 === 0 ? CYAN : MAGENTA;

    box(
      [0.275, 0.095, 0.065],
      roofPoint(x, 0.075, 0.145),
      WINDOW,
      `s23RoofLampSocket${i}`,
    );

    const lamp = box(
      [0.205, 0.060, 0.050],
      roofPoint(x, 0.075, 0.178),
      lampColor,
      `s23RoofLamp${i}`,
    );
    glow(lamp, 2.2);
  }

  // Five dark separator bars sharpen the alternating light rhythm.
  for (let i = 0; i < lampXs.length - 1; i++) {
    box(
      [0.028, 0.084, 0.068],
      roofPoint((lampXs[i] + lampXs[i + 1]) * 0.5, 0.075, 0.165),
      CONCRETE_DARK,
      `s23RoofLampDivider${i}`,
    );
  }

  // A small service cable bends down and vanishes behind the coping.
  b.rod(
    roofPoint(0.63, 0.02, 0.02),
    roofPoint(0.63, -0.105, -0.18),
    0.012,
    {
      color: METAL,
      name: "s23RoofLightCable",
      caps: "round",
    },
  );

  box(
    [0.10, 0.035, 0.12],
    roofPoint(0.63, -0.115, -0.18),
    CONCRETE_DARK,
    "s23RoofLightCableClamp",
  );
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addRoofVentCluster(b: Builder) {
  const VENT_BLACK = "#151b1d";
  const CABLE_DARK = "#202728";
  const EDGE_LIGHT = "#b1b3aa";
  const HAZARD_YELLOW = "#d3a62c";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      name,
      group: "roofVentCluster",
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    sides = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      flat: true,
      name,
      group: "roofVentCluster",
    });

  // A low precast service pad anchors the whole mechanical cluster to the roof.
  box([1.72, 0.08, 1.42], [2.4, 7.55, -1.35], CONCRETE_DARK, "ventServicePad");
  box([1.48, 0.045, 1.18], [2.4, 7.615, -1.35], CONCRETE_LIGHT, "ventPadCoping");

  // ---------------------------------------------------------------------------------------------------------------
  // Three square exhaust housings. Each gets a body, cap, corner posts, recessed grille, and louvers.

  const housings = [
    { x: 1.72, z: -1.68, w: 0.43, d: 0.43, h: 0.22, tag: "A" },
    { x: 2.38, z: -1.10, w: 0.48, d: 0.38, h: 0.19, tag: "B" },
    { x: 3.00, z: -1.63, w: 0.39, d: 0.45, h: 0.22, tag: "C" },
  ] as const;

  for (const h of housings) {
    const baseY = 7.63;
    const bodyY = baseY + h.h / 2;
    const topY = baseY + h.h;

    box([h.w, h.h, h.d], [h.x, bodyY, h.z], CONCRETE_DARK, `exhaustHousing${h.tag}`);
    box(
      [h.w + 0.07, 0.035, h.d + 0.07],
      [h.x, topY + 0.018, h.z],
      CONCRETE_LIGHT,
      `exhaustCap${h.tag}`,
    );

    // Four raised corner rails make each unit read as a bolted, panel-built machine.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        box(
          [0.055, h.h + 0.035, 0.055],
          [h.x + sx * (h.w / 2 - 0.035), bodyY + 0.006, h.z + sz * (h.d / 2 - 0.035)],
          EDGE_LIGHT,
          `exhaustCorner${h.tag}_${sx}_${sz}`,
        );
      }
    }

    // A recessed black top opening sits below the pale coping.
    box(
      [h.w - 0.12, 0.014, h.d - 0.12],
      [h.x, topY + 0.039, h.z],
      VENT_BLACK,
      `exhaustOpening${h.tag}`,
    );

    // Top grille bars are deliberately sparse and oversized.
    for (let i = -1; i <= 1; i++) {
      box(
        [h.w - 0.13, 0.018, 0.034],
        [h.x, topY + 0.052, h.z + i * 0.095],
        METAL,
        `exhaustTopGrille${h.tag}_${i + 1}`,
      );
    }

    // Three horizontal louvers on the front (+Z) face.
    for (let i = 0; i < 3; i++) {
      const ly = baseY + 0.052 + i * Math.max(0.048, (h.h - 0.075) / 3);
      box(
        [h.w - 0.12, 0.025, 0.026],
        [h.x, ly, h.z + h.d / 2 + 0.018],
        METAL,
        `exhaustLouver${h.tag}_${i}`,
      );
    }

    // A dark side slot breaks up the otherwise solid square mass.
    box(
      [0.025, h.h - 0.075, h.d * 0.48],
      [h.x - h.w / 2 - 0.018, bodyY, h.z],
      VENT_BLACK,
      `exhaustSideSlot${h.tag}`,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Two short hexagonal roof ducts with collars, dark throats, and little rim segments.

  const ducts = [
    { x: 2.08, z: -1.38, r: 0.135, tag: "L" },
    { x: 2.67, z: -1.83, r: 0.125, tag: "R" },
  ] as const;

  for (const d of ducts) {
    cylinder(d.r + 0.025, 0.035, [d.x, 7.595, d.z], METAL, `ductFoot${d.tag}`, 6);
    cylinder(d.r, 0.225, [d.x, 7.705, d.z], CONCRETE_DARK, `polygonalDuct${d.tag}`, 6);
    cylinder(d.r + 0.018, 0.028, [d.x, 7.825, d.z], EDGE_LIGHT, `ductCollar${d.tag}`, 6);
    cylinder(d.r * 0.72, 0.012, [d.x, 7.846, d.z], VENT_BLACK, `ductThroat${d.tag}`, 6);

    // Three bars over each duct throat suggest a coarse protective grate.
    for (let i = -1; i <= 1; i++) {
      box(
        [0.025, 0.022, d.r * 1.25],
        [d.x + i * 0.052, 7.858, d.z],
        METAL,
        `ductGrate${d.tag}_${i + 1}`,
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Exposed low service cables and rigid conduit, kept visible between the units.

  const cable = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    name: string,
    color = CABLE_DARK,
  ) => b.rod(a, c, radius, { color, name, group: "roofVentCluster" });

  cable([1.50, 7.61, -1.96], [1.72, 7.61, -1.68], 0.014, "cableA");
  cable([1.51, 7.61, -1.96], [2.08, 7.61, -1.38], 0.011, "cableB");
  cable([2.08, 7.61, -1.38], [2.38, 7.61, -1.10], 0.012, "cableC");
  cable([2.38, 7.61, -1.10], [2.67, 7.61, -1.83], 0.011, "cableD");
  cable([2.67, 7.61, -1.83], [3.00, 7.61, -1.63], 0.013, "cableE");
  cable([3.00, 7.61, -1.63], [3.22, 7.61, -1.90], 0.010, "cableF");

  // A short upright conduit rises from the pad into the rear housing.
  cylinder(0.025, 0.19, [2.95, 7.69, -1.28], METAL, "serviceConduit", 8);
  cylinder(0.038, 0.026, [2.95, 7.79, -1.28], EDGE_LIGHT, "serviceConduitCap", 8);
  cable([2.95, 7.59, -1.28], [3.00, 7.64, -1.63], 0.012, "conduitCable", METAL);

  // ---------------------------------------------------------------------------------------------------------------
  // A tiny hazard placard gives the machinery a human maintenance scale.

  const hazard = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 48">
      <rect width="96" height="48" rx="4" fill="#151b1d"/>
      <path d="M4 44 L28 4 H40 L16 44 Z M38 44 L62 4 H74 L50 44 Z M72 44 L92 10 V28 L82 44 Z"
        fill="#d3a62c"/>
      <rect x="47" y="11" width="5" height="20" rx="2" fill="#151b1d"/>
      <circle cx="49.5" cy="37" r="3" fill="#151b1d"/>
      <rect x="2" y="2" width="92" height="44" rx="3" fill="none" stroke="#b1b3aa" stroke-width="2"/>
    </svg>`,
    { size: 96 },
  );

  box([0.22, 0.11, 0.018], [2.38, 7.68, -0.905], VENT_BLACK, "hazardPlate");
  b.part(new THREE.PlaneGeometry(0.18, 0.09), "#ffffff", {
    at: [2.38, 7.68, -0.916],
    dir: [0, 0, 1],
    axis: "z",
    texture: hazard,
    flat: true,
    name: "hazardPlacard",
    group: "roofVentCluster",
  });
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";

export function addWaterTank(b: Builder) {
  const WEATHERED_STEEL = metal("steel", {
    tarnish: 0.48,
    verdigris: 0.08,
    polish: 0.18,
    size: 0.14,
    seed: 25,
  });
  const DARK_IRON = metal("iron", {
    tarnish: 0.34,
    polish: 0.08,
    size: 0.1,
    seed: 31,
  });
  const EMERGENCY_RED = "#a84438";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string | ReturnType<typeof metal>,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });

  const cylinder = (
    radiusTop: number,
    radiusBottom: number,
    height: number,
    at: [number, number, number],
    color: string | ReturnType<typeof metal>,
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), color, {
      at,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string | ReturnType<typeof metal>,
    name: string,
  ) => b.rod(a, z, radius, { color, name, section: { ngon: 6 }, caps: "flat" });

  // ---------------------------------------------------------------------------------------------------------------
  // Rooftop water tank: four feet, a faceted vessel, bands, access hatch, and overflow pipe.

  const tx = -1.45;
  const tz = -1.05;

  // Four squat feet sink into the roof cap, with a visible steel cross-brace frame.
  const tankFeet: [number, number][] = [
    [-0.43, -0.43],
    [0.43, -0.43],
    [-0.43, 0.43],
    [0.43, 0.43],
  ];

  for (let i = 0; i < tankFeet.length; i++) {
    const [dx, dz] = tankFeet[i];
    box(
      [0.16, 0.25, 0.16],
      [tx + dx, 8.91, tz + dz],
      CONCRETE_DARK,
      `s25WaterTankFoot${i}`,
    );
  }

  rod(
    [tx - 0.43, 8.91, tz - 0.43],
    [tx + 0.43, 8.91, tz - 0.43],
    0.025,
    DARK_IRON,
    "s25WaterTankBraceFront",
  );
  rod(
    [tx - 0.43, 8.91, tz + 0.43],
    [tx + 0.43, 8.91, tz + 0.43],
    0.025,
    DARK_IRON,
    "s25WaterTankBraceRear",
  );
  rod(
    [tx - 0.43, 8.91, tz - 0.43],
    [tx - 0.43, 8.91, tz + 0.43],
    0.025,
    DARK_IRON,
    "s25WaterTankBraceLeft",
  );
  rod(
    [tx + 0.43, 8.91, tz - 0.43],
    [tx + 0.43, 8.91, tz + 0.43],
    0.025,
    DARK_IRON,
    "s25WaterTankBraceRight",
  );

  cylinder(0.62, 0.64, 0.055, [tx, 8.995, tz], CONCRETE_DARK, "s25WaterTankBottomRing", 10);
  cylinder(0.59, 0.62, 0.48, [tx, 9.23, tz], CONCRETE_LIGHT, "s25WaterTankBody", 10);

  // Strong horizontal bands make the tank read as an industrial, repaired object.
  cylinder(0.635, 0.635, 0.055, [tx, 9.05, tz], WEATHERED_STEEL, "s25WaterTankBandLow", 10);
  cylinder(0.63, 0.63, 0.055, [tx, 9.40, tz], WEATHERED_STEEL, "s25WaterTankBandHigh", 10);

  // Four vertical seam straps sit on the cardinal facets.
  box([0.055, 0.39, 0.085], [tx - 0.605, 9.23, tz], WEATHERED_STEEL, "s25WaterTankSeamLeft");
  box([0.055, 0.39, 0.085], [tx + 0.605, 9.23, tz], WEATHERED_STEEL, "s25WaterTankSeamRight");
  box([0.085, 0.39, 0.055], [tx, 9.23, tz - 0.605], WEATHERED_STEEL, "s25WaterTankSeamFront");
  box([0.085, 0.39, 0.055], [tx, 9.23, tz + 0.605], WEATHERED_STEEL, "s25WaterTankSeamRear");

  // A shallow conical shoulder and square maintenance hatch cap the tank.
  b.part(new THREE.ConeGeometry(0.47, 0.10, 10), CONCRETE_LIGHT, {
    at: [tx, 9.52, tz],
    name: "s25WaterTankShoulder",
    flat: true,
  });
  box([0.27, 0.085, 0.27], [tx, 9.585, tz], CONCRETE_DARK, "s25WaterTankHatch");
  box([0.19, 0.035, 0.07], [tx, 9.645, tz + 0.07], DARK_IRON, "s25WaterTankHatchHandle");

  // Overflow: an angular pipe rises above the shoulder, turns outward, and drops down the side.
  rod([tx + 0.40, 9.38, tz], [tx + 0.40, 9.61, tz], 0.027, WEATHERED_STEEL, "s25WaterTankOverflowUp");
  rod([tx + 0.40, 9.61, tz], [tx + 0.69, 9.61, tz], 0.027, WEATHERED_STEEL, "s25WaterTankOverflowTurn");
  rod([tx + 0.69, 9.61, tz], [tx + 0.69, 9.29, tz], 0.027, WEATHERED_STEEL, "s25WaterTankOverflowDrop");
  box([0.12, 0.06, 0.12], [tx + 0.69, 9.27, tz], DARK_IRON, "s25WaterTankOverflowOutlet");

  // ---------------------------------------------------------------------------------------------------------------
  // External emergency stair on the model's left side (+X). It is narrow, heavy, and visibly attached to the wall.

  const sx = 6.20;
  const lowerZ0 = 0.06;
  const lowerStepCount = 8;
  const stepZ = 0.17;
  const stepRise = 0.18;

  // Lower flight rises toward the middle landing.
  for (let i = 0; i < lowerStepCount; i++) {
    const z = lowerZ0 + i * stepZ;
    const y = 1.22 + i * stepRise;
    box(
      [0.50, 0.18, 0.25],
      [sx, y, z],
      i % 3 === 0 ? CONCRETE_LIGHT : CONCRETE,
      `s25FireStairLowerStep${i}`,
    );
    box([0.12, 0.21, 0.25], [5.96, y + 0.015, z], CONCRETE_DARK, `s25FireStairLowerWallNib${i}`);
  }

  // Upper flight reverses direction, producing the characteristic zig-zag profile.
  for (let i = 0; i < lowerStepCount; i++) {
    const z = lowerZ0 + (lowerStepCount - 1 - i) * stepZ;
    const y = 2.90 + i * stepRise;
    box(
      [0.50, 0.18, 0.25],
      [sx, y, z],
      i % 3 === 1 ? CONCRETE_LIGHT : CONCRETE,
      `s25FireStairUpperStep${i}`,
    );
    box([0.12, 0.21, 0.25], [5.96, y + 0.015, z], CONCRETE_DARK, `s25FireStairUpperWallNib${i}`);
  }

  // Thick intermediate, top, and bottom landings.
  box([0.58, 0.24, 0.48], [sx, 2.75, 1.40], CONCRETE_LIGHT, "s25FireStairMiddleLanding");
  box([0.58, 0.22, 0.48], [sx, 4.40, -0.10], CONCRETE_LIGHT, "s25FireStairTopLanding");
  box([0.58, 0.22, 0.48], [sx, 1.03, -0.10], CONCRETE_DARK, "s25FireStairBottomLanding");

  // Underside stringers make each flight feel structurally supported.
  b.frustumBox(
    [5.99, 1.17, -0.10],
    [5.99, 2.67, 1.36],
    [0.16, 0.18],
    [0.12, 0.14],
    {
      color: CONCRETE_DARK,
      name: "s25FireStairLowerStringerWall",
      section: "box",
      caps: "flat",
    },
  );
  b.frustumBox(
    [6.39, 1.17, -0.10],
    [6.39, 2.67, 1.36],
    [0.16, 0.18],
    [0.12, 0.14],
    {
      color: CONCRETE_DARK,
      name: "s25FireStairLowerStringerOuter",
      section: "box",
      caps: "flat",
    },
  );
  b.frustumBox(
    [5.99, 2.87, 1.36],
    [5.99, 4.33, -0.10],
    [0.16, 0.18],
    [0.12, 0.14],
    {
      color: CONCRETE_DARK,
      name: "s25FireStairUpperStringerWall",
      section: "box",
      caps: "flat",
    },
  );
  b.frustumBox(
    [6.39, 2.87, 1.36],
    [6.39, 4.33, -0.10],
    [0.16, 0.18],
    [0.12, 0.14],
    {
      color: CONCRETE_DARK,
      name: "s25FireStairUpperStringerOuter",
      section: "box",
      caps: "flat",
    },
  );

  // Outer handrail follows both flights with short vertical posts at the landings.
  rod(
    [6.42, 1.82, -0.10],
    [6.42, 3.38, 1.39],
    0.026,
    DARK_IRON,
    "s25FireStairOuterRailLower",
  );
  rod(
    [6.42, 3.55, 1.39],
    [6.42, 5.02, -0.10],
    0.026,
    DARK_IRON,
    "s25FireStairOuterRailUpper",
  );

  const outerPosts: Array<[number, number, number, number]> = [
    [1.30, 1.82, 1.30, 0.0],
    [2.02, 2.40, 2.02, 0.0],
    [2.78, 3.35, 2.78, 0.0],
    [3.00, 3.56, 3.00, 0.0],
    [3.72, 4.28, 3.72, 0.0],
    [4.36, 5.00, 4.36, 0.0],
  ];

  for (let i = 0; i < outerPosts.length; i++) {
    const [y0, y1, z, _unused] = outerPosts[i];
    rod([6.42, y0, z], [6.42, y1, z], 0.022, DARK_IRON, `s25FireStairOuterPost${i}`);
  }

  // A second, wall-side rail is simpler and partly disappears into the concrete facade.
  rod(
    [5.985, 1.76, -0.08],
    [5.985, 3.29, 1.37],
    0.022,
    DARK_IRON,
    "s25FireStairWallRailLower",
  );
  rod(
    [5.985, 3.48, 1.37],
    [5.985, 4.90, -0.08],
    0.022,
    DARK_IRON,
    "s25FireStairWallRailUpper",
  );

  rod([5.985, 1.40, -0.08], [5.985, 1.82, -0.08], 0.019, DARK_IRON, "s25FireStairWallPostLowerA");
  rod([5.985, 2.36, 0.78], [5.985, 2.78, 0.78], 0.019, DARK_IRON, "s25FireStairWallPostLowerB");
  rod([5.985, 3.00, 1.37], [5.985, 3.48, 1.37], 0.019, DARK_IRON, "s25FireStairWallPostMiddle");
  rod([5.985, 3.72, 0.70], [5.985, 4.18, 0.70], 0.019, DARK_IRON, "s25FireStairWallPostUpperA");
  rod([5.985, 4.42, -0.08], [5.985, 4.90, -0.08], 0.019, DARK_IRON, "s25FireStairWallPostUpperB");

  // Landing guard rails are deliberately blunt rectangular interruptions in the diagonal rhythm.
  rod([6.00, 2.90, 1.40], [6.42, 2.90, 1.40], 0.024, DARK_IRON, "s25FireStairLandingRail");
  rod([6.00, 4.56, -0.10], [6.42, 4.56, -0.10], 0.024, DARK_IRON, "s25FireStairTopRail");

  // Red emergency placard mounted directly to the exposed +X side wall.
  box([0.045, 0.46, 0.34], [5.965, 3.82, 1.74], CONCRETE_DARK, "s25FireStairSignFrame");
  box([0.032, 0.34, 0.25], [6.002, 3.82, 1.74], EMERGENCY_RED, "s25FireStairEmergencyPlacard");
  box([0.018, 0.045, 0.16], [6.026, 3.90, 1.74], CHALK, "s25FireStairSignMarkTop");
  box([0.018, 0.045, 0.16], [6.026, 3.74, 1.74], CHALK, "s25FireStairSignMarkBottom");
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRearBridge(b: Builder) {
  const BRIDGE_LIGHT = "#9b9d96";
  const ANTENNA_DARK = "#303937";
  const LAMP = "#e0a24e";

  const box = (
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

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
      flat: true,
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Rear access bridge: a shallow horizontal concrete gallery immediately outside the rear facade.

  box([3.48, 0.16, 0.62], [0, 5.29, -3.78], CONCRETE_DARK, "rearBridgeDeck");
  box([3.62, 0.18, 0.16], [0, 5.17, -3.72], CONCRETE_SHADOW, "rearBridgeSoffit");
  box([3.62, 0.14, 0.18], [0, 5.42, -3.78], BRIDGE_LIGHT, "rearBridgeDeckEdge");

  // Two heavy parapets, with deliberately deep joints and inset shadow slots.
  for (const z of [-4.02, -3.54]) {
    box([3.55, 0.40, 0.13], [0, 5.59, z], CONCRETE_DARK, `rearParapet_${z}`);
    box([3.68, 0.10, 0.17], [0, 5.80, z], BRIDGE_LIGHT, `rearParapetCap_${z}`);

    for (let i = 0; i < 6; i++) {
      const x = -1.30 + i * 0.52;
      box([0.22, 0.22, 0.018], [x, 5.57, z + (z < -3.8 ? -0.072 : 0.072)], WINDOW, `rearParapetSlot_${z}_${i}`);
      box([0.04, 0.28, 0.025], [x - 0.14, 5.57, z + (z < -3.8 ? -0.084 : 0.084)], CONCRETE_SHADOW, `rearParapetSlotJamb_${z}_${i}`);
      box([0.04, 0.28, 0.025], [x + 0.14, 5.57, z + (z < -3.8 ? -0.084 : 0.084)], CONCRETE_SHADOW, `rearParapetSlotJambB_${z}_${i}`);
    }
  }

  // Short vertical end returns make the gallery read as a cast-in-place bridge rather than a floating shelf.
  for (const x of [-1.72, 1.72]) {
    box([0.16, 0.44, 0.68], [x, 5.57, -3.78], CONCRETE_DARK, `rearBridgeEnd_${x}`);
    box([0.24, 0.10, 0.76], [x, 5.82, -3.78], BRIDGE_LIGHT, `rearBridgeEndCap_${x}`);
  }

  // Recessed communal doorway in the rear wall, set behind the bridge.
  box([1.18, 0.60, 0.11], [0, 5.71, -3.535], WINDOW, "rearBridgeDoorVoid");
  box([0.16, 0.72, 0.24], [-0.67, 5.71, -3.59], BRIDGE_LIGHT, "rearBridgeDoorJambL");
  box([0.16, 0.72, 0.24], [0.67, 5.71, -3.59], BRIDGE_LIGHT, "rearBridgeDoorJambR");
  box([1.48, 0.16, 0.24], [0, 6.08, -3.59], CONCRETE_DARK, "rearBridgeDoorLintel");
  box([1.54, 0.12, 0.28], [0, 5.34, -3.60], CONCRETE_LIGHT, "rearBridgeDoorSill");

  // Door split, two inset panels, and small vertical pull handles.
  box([0.035, 0.58, 0.025], [0, 5.71, -3.606], CONCRETE_DARK, "rearBridgeDoorSplit");
  for (const x of [-0.30, 0.30]) {
    box([0.43, 0.43, 0.018], [x, 5.70, -3.612], WINDOW_BLUE, `rearBridgeDoorPanel_${x}`);
    cylinder(0.018, 0.24, [x + (x < 0 ? 0.14 : -0.14), 5.72, -3.635], METAL, `rearBridgeDoorPull_${x}`, [0, 0, 1], 6);
  }

  // A compact service light above the doorway, with a hood and mounting plate.
  box([0.34, 0.24, 0.07], [0, 6.27, -3.60], METAL, "rearBridgeLightMount");
  box([0.24, 0.12, 0.12], [0, 6.17, -3.66], ANTENNA_DARK, "rearBridgeLightHood");
  const rearLamp = b.part(new THREE.BoxGeometry(0.14, 0.10, 0.035), LAMP, {
    at: [0, 6.14, -3.735],
    name: "rearBridgeServiceLight",
    flat: true,
  });
  glow(rearLamp, 1.4);

  // Four shallow drain scuppers below the outer parapet.
  for (const x of [-1.18, -0.39, 0.39, 1.18]) {
    cylinder(0.035, 0.22, [x, 5.16, -4.025], METAL, `rearBridgeDrain_${x}`, [0, 0, 1], 6);
    box([0.12, 0.06, 0.06], [x, 5.10, -4.03], METAL, `rearBridgeDrainLip_${x}`);
  }

  // Small cast-in-place tie plates at the ends of the bridge.
  for (const x of [-1.53, 1.53]) {
    box([0.18, 0.16, 0.035], [x, 5.31, -4.10], METAL, `rearBridgeTiePlate_${x}`);
    cylinder(0.028, 0.045, [x, 5.33, -4.125], METAL, `rearBridgeTieBolt_${x}`, [0, 0, 1], 6);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Sparse rooftop antenna array: square mast, three unequal crossbars, two dish-like plates, and cables.

  const mastX = 0.80;
  const mastZ = -0.35;

  box([0.32, 0.12, 0.32], [mastX, 8.82, mastZ], CONCRETE_DARK, "antennaConcreteFoot");
  box([0.20, 0.16, 0.20], [mastX, 8.91, mastZ], METAL, "antennaBaseCollar");
  box([0.105, 1.40, 0.105], [mastX, 9.49, mastZ], ANTENNA_DARK, "antennaSquareMast");

  // Three asymmetric horizontal rods, each with a small end cap and a ceramic-looking insulator.
  const rods = [
    { y: 9.18, length: 1.14, thickness: 0.025 },
    { y: 9.52, length: 0.76, thickness: 0.022 },
    { y: 9.86, length: 1.42, thickness: 0.020 },
  ];

  rods.forEach((r, i) => {
    b.rod(
      [mastX - r.length / 2, r.y, mastZ],
      [mastX + r.length / 2, r.y, mastZ],
      r.thickness,
      {
        color: METAL,
        name: `antennaCrossbar_${i}`,
        caps: "flat",
      },
    );

    for (const side of [-1, 1]) {
      const x = mastX + side * (r.length / 2);
      cylinder(0.045, 0.055, [x, r.y, mastZ], ANTENNA_DARK, `antennaEndCap_${i}_${side}`, [1, 0, 0], 6);
      cylinder(0.035, 0.07, [x, r.y + 0.055, mastZ], BRIDGE_LIGHT, `antennaInsulator_${i}_${side}`, [0, 1, 0], 6);
    }
  });

  // Two small shallow dish plates mounted on short lateral arms.
  const dishXs = [0.38, 1.22];
  for (let i = 0; i < dishXs.length; i++) {
    const x = dishXs[i];
    const y = i === 0 ? 9.38 : 9.70;

    b.rod([mastX, y, mastZ], [x, y, mastZ], 0.026, {
      color: METAL,
      name: `antennaDishArm_${i}`,
      caps: "flat",
    });

    cylinder(0.145, 0.035, [x, y, mastZ], ANTENNA_DARK, `antennaDish_${i}`, [0, 0, 1], 8);
    cylinder(0.105, 0.012, [x, y, mastZ + 0.024], METAL, `antennaDishInset_${i}`, [0, 0, 1], 8);
    cylinder(0.035, 0.10, [x, y, mastZ + 0.07], METAL, `antennaDishFeed_${i}`, [0, 0, 1], 6);
    cylinder(0.022, 0.035, [x, y, mastZ + 0.135], BRIDGE_LIGHT, `antennaDishFeedTip_${i}`, [0, 0, 1], 6);
  }

  // Four sharply legible tension cables, anchored to the roof deck around the mast.
  const mastTop: [number, number, number] = [mastX, 10.16, mastZ];
  const anchors: [number, number, number][] = [
    [0.08, 8.84, -0.98],
    [1.52, 8.84, -0.98],
    [0.08, 8.84, 0.25],
    [1.52, 8.84, 0.25],
  ];

  for (let i = 0; i < anchors.length; i++) {
    b.rod(mastTop, anchors[i], 0.009, {
      color: METAL,
      name: `antennaTensionCable_${i}`,
      caps: "flat",
    });
    cylinder(0.045, 0.07, anchors[i], ANTENNA_DARK, `antennaAnchor_${i}`, [0, 1, 0], 6);
  }

  // Tiny lightning-tip cap completes the mast silhouette without making it ornamental.
  b.spike([mastX, 10.16, mastZ], [0, 1, 0], 0.16, 0.045, {
    color: METAL,
    name: "antennaTip",
    caps: "point",
  });
}
```