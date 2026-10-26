import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A blocky industrial spaceship galley inspired by the grimy, ribbed interiors of Alien's Nostromo: dark green bulkheads, cream counters, overhead lockers, stove, sink, refrigerator, pipes and heavy mechanical fittings.",
};

export const PALETTE = {
  HULL: "#38433d",
  HULL_DARK: "#202a28",
  HULL_DEEP: "#121917",
  PANEL: "#596158",
  PANEL_LIGHT: "#788076",
  CREAM: "#b8ad91",
  CREAM_LIGHT: "#d1c7aa",
  RUBBER: "#151b1a",
  BLACK: "#090d0d",
  STEEL: "#7b8580",
  STEEL_DARK: "#3e4845",
  ALUMINUM: "#a4aaa0",
  OCHRE: "#a37a42",
  WARNING: "#bd8b37",
  RED: "#8e302b",
  AMBER: "#d7a43b",
  GREEN: "#66826d",
  GLASS: "#304d4a",
  WHITE: "#d8d4b9",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "ceilingPanel",
    what: "A long industrial fluorescent light bar under the ceiling, with a ribbed dark housing, six alternating pale green and amber lamps, and four chunky metal brackets. Keep it functional and rectangular, not futuristic.",
    at: [0, 2.67, 0.15],
    normal: [0, -1, 0],
    bone: null,
    room: [2.2, 0.18, 0.38],
  },
  {
    id: "stoveControls",
    kind: "add",
    part: "stoveFront",
    what: "Four oversized stove knobs and two tiny red indicator lamps on the plain stove fascia. Knobs are cream with black centres; lamps are red and amber.",
    at: [0.72, 1.04, 0.92],
    normal: [0, 0, 1],
    bone: null,
    room: [0.72, 0.22, 0.08],
  },
  {
    id: "sinkFaucet",
    kind: "add",
    part: "sinkBasin",
    what: "A heavy gooseneck faucet behind the sink, made of dark steel pipe with a cream hexagonal mounting collar and two small hot/cold valves.",
    at: [-0.75, 1.22, 0.70],
    normal: [0, 1, 0],
    bone: null,
    room: [0.42, 0.48, 0.28],
  },
  {
    id: "counterLip",
    kind: "add",
    part: "counterTop",
    what: "A thick dark rubber counter lip around the front and side edges, with broad rectangular corner guards. It should make the worktop feel sealed and shipboard.",
    at: [0, 1.13, 1.04],
    normal: [0, 0, 1],
    bone: null,
    room: [2.85, 0.18, 0.08],
  },
  {
    id: "cabinetHandles",
    kind: "add",
    part: "lowerCabinets",
    what: "Rows of rugged vertical pull handles on the lower galley doors, alternating steel and ochre warning-painted handles. Add small dark hinge blocks at the door corners.",
    at: [0, 0.58, 1.06],
    normal: [0, 0, 1],
    bone: null,
    room: [2.8, 0.72, 0.12],
  },
  {
    id: "overheadLatches",
    kind: "add",
    part: "overheadLockers",
    what: "Six large mechanical quarter-turn latches and three narrow black rubber seams across the overhead locker doors. The latches are dull steel circles with ochre centres.",
    at: [0, 2.10, 0.98],
    normal: [0, 0, 1],
    bone: null,
    room: [2.65, 0.60, 0.12],
  },
  {
    id: "pipeManifold",
    kind: "add",
    part: "pipeRack",
    what: "A compact pipe manifold on the rear wall: four parallel pipes, two elbow joints, and a rectangular valve block. Use dark steel, green enamel and tiny red caps.",
    at: [-1.18, 1.62, -1.04],
    normal: [0, 0, 1],
    bone: null,
    room: [0.62, 0.95, 0.20],
  },
  {
    id: "crewPlacard",
    kind: "add",
    part: "rearBulkhead",
    what: "A small bolted cream safety placard on the rear bulkhead with a red diagonal warning stripe and three dark raised bars. Do not use readable text.",
    at: [0.42, 1.62, -1.015],
    normal: [0, 0, 1],
    bone: null,
    room: [0.56, 0.34, 0.04],
  },
  {
    id: "fridgeVents",
    kind: "add",
    part: "refrigerator",
    what: "A bank of deep horizontal ventilation slots and a small green status lamp on the refrigerator door. The slots are recessed black bars with steel rims.",
    at: [1.25, 1.56, 0.99],
    normal: [0, 0, 1],
    bone: null,
    room: [0.68, 0.44, 0.10],
  },
  {
    id: "floorDrain",
    kind: "add",
    part: "floor",
    what: "A square grated floor drain beneath the sink, with a dark inset, four steel rim plates and diagonal crossing bars.",
    at: [-0.72, 0.025, 0.45],
    normal: [0, 1, 0],
    bone: null,
    room: [0.46, 0.04, 0.46],
  },
  {
    id: "hullPatina",
    kind: "texture",
    part: "rearBulkhead",
    what: "Subtle uneven industrial wear in HULL_DARK, PANEL and GREEN: broad vertical grime bands, chipped edges and a few faded olive maintenance patches. Keep it restrained and matte.",
  },
  {
    id: "counterWear",
    kind: "texture",
    part: "counterTop",
    what: "A worn cream enamel surface with darker green-grey edge shading, small scuffs near the sink and stove, and a few thin brown grease marks. No modern polished finish.",
  },
  {
    id: "cabinetNumbers",
    kind: "texture",
    part: "overheadLockers",
    what: "Faded stencilled maintenance markings in CREAM_LIGHT and OCHRE on the locker fronts: small block numerals, arrows and interrupted caution bands, low contrast and weathered.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 0.8 });
  const P = PALETTE;

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: { bevel?: number; rotation?: [number, number, number] } = {},
  ) => {
    const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
    return b.part(geo, color, {
      name,
      at,
      bevel: options.bevel,
      rotation: options.rotation,
    } as any);
  };

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      { name, at, dir },
    );
  };

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { color, name });

  const panel = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color = P.PANEL,
  ) => box(name, size, at, color, { bevel: 0.015 });

  // ---------------------------------------------------------------------------
  // Main room envelope. The front remains open so the galley reads immediately.
  // ---------------------------------------------------------------------------

  box("floor", [3.5, 0.12, 2.55], [0, 0.02, 0], P.HULL_DARK);
  box("floorInset", [3.14, 0.035, 2.18], [0, 0.105, 0.02], P.RUBBER);

  box("rearBulkhead", [3.5, 2.65, 0.16], [0, 1.38, -1.20], P.HULL);
  box("leftBulkhead", [0.16, 2.65, 2.42], [1.67, 1.38, 0], P.HULL_DARK);
  box("rightBulkhead", [0.16, 2.65, 2.42], [-1.67, 1.38, 0], P.HULL_DARK);

  box("ceilingPanel", [3.5, 0.15, 2.55], [0, 2.72, 0], P.HULL_DEEP);
  box("ceilingRibFront", [3.32, 0.11, 0.12], [0, 2.61, 1.07], P.STEEL_DARK);
  box("ceilingRibBack", [3.32, 0.11, 0.12], [0, 2.61, -1.02], P.STEEL_DARK);

  // Structural ribs on the rear wall.
  for (let x = -1.42; x <= 1.42; x += 0.47) {
    box("rearRib", [0.075, 2.38, 0.07], [x, 1.38, -1.095], P.HULL_DARK);
    cylinder("rearRibBolt", 0.025, 0.022, [x, 0.28, -1.045], P.STEEL, [0, 0, 1], 8);
    cylinder("rearRibBolt", 0.025, 0.022, [x, 2.48, -1.045], P.STEEL, [0, 0, 1], 8);
  }

  // Side-wall horizontal rails.
  for (const side of [-1, 1]) {
    for (const y of [0.34, 1.96, 2.40]) {
      box(
        "sideRail",
        [0.10, 0.075, 2.20],
        [side * 1.565, y, 0],
        P.PANEL_LIGHT,
      );
    }
    for (const z of [-0.94, -0.22, 0.50, 0.92]) {
      box(
        "sideWallStudRail",
        [0.11, 0.08, 0.12],
        [side * 1.54, 1.34, z],
        P.STEEL_DARK,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Lower work run and counter.
  // ---------------------------------------------------------------------------

  box("lowerCabinets", [2.95, 0.82, 0.72], [0, 0.62, 0.70], P.HULL);
  box("counterTop", [3.12, 0.16, 0.88], [0, 1.08, 0.70], P.CREAM);
  box("counterFrontBand", [3.10, 0.10, 0.10], [0, 0.98, 1.125], P.RUBBER);
  box("counterBackSplash", [3.04, 0.30, 0.08], [0, 1.26, 0.30], P.PANEL_LIGHT);

  // Counter seam and corner guards.
  box("counterSeamL", [0.025, 0.17, 0.84], [-1.02, 1.10, 0.70], P.HULL_DARK);
  box("counterSeamR", [0.025, 0.17, 0.84], [0.18, 1.10, 0.70], P.HULL_DARK);
  box("counterCornerL", [0.13, 0.20, 0.14], [-1.48, 1.10, 1.08], P.STEEL_DARK);
  box("counterCornerR", [0.13, 0.20, 0.14], [1.48, 1.10, 1.08], P.STEEL_DARK);

  // Three lower doors.
  for (let i = 0; i < 3; i++) {
    const x = -1.12 + i * 0.72;
    panel("lowerCabinetDoor", [0.64, 0.70, 0.045], [x, 0.62, 1.075], i === 1 ? P.PANEL : P.HULL_DARK);
    box("lowerDoorInset", [0.48, 0.54, 0.018], [x, 0.62, 1.104], P.HULL_DEEP);
    box("lowerDoorTopRail", [0.54, 0.035, 0.035], [x, 0.88, 1.125], P.STEEL_DARK);
    box("lowerDoorBottomRail", [0.54, 0.035, 0.035], [x, 0.36, 1.125], P.STEEL_DARK);
    cylinder("lowerDoorHingeTop", 0.026, 0.05, [x - 0.27, 0.86, 1.135], P.STEEL, [0, 0, 1], 8);
    cylinder("lowerDoorHingeBottom", 0.026, 0.05, [x - 0.27, 0.38, 1.135], P.STEEL, [0, 0, 1], 8);
  }

  // Utility drawer bank.
  box("utilityDrawerBank", [0.52, 0.70, 0.06], [1.30, 0.62, 1.09], P.PANEL_LIGHT);
  for (let i = 0; i < 3; i++) {
    const y = 0.39 + i * 0.23;
    box("utilityDrawer", [0.42, 0.17, 0.025], [1.30, y, 1.135], P.HULL_DARK);
    rod("drawerPull", [1.20, y, 1.16], [1.40, y, 1.16], 0.018, P.STEEL);
  }

  // ---------------------------------------------------------------------------
  // Sink, basin and stove.
  // ---------------------------------------------------------------------------

  box("sinkBasin", [0.72, 0.13, 0.52], [-0.78, 1.19, 0.72], P.STEEL_DARK);
  box("sinkInterior", [0.57, 0.025, 0.38], [-0.78, 1.255, 0.72], P.BLACK);
  box("sinkRimFront", [0.76, 0.045, 0.07], [-0.78, 1.30, 0.98], P.ALUMINUM);
  box("sinkRimBack", [0.76, 0.045, 0.07], [-0.78, 1.30, 0.46], P.ALUMINUM);
  box("sinkDrain", [0.13, 0.012, 0.13], [-0.78, 1.285, 0.72], P.HULL_DEEP);

  box("stoveBody", [0.96, 0.72, 0.70], [0.67, 0.66, 0.70], P.HULL_DARK);
  box("stoveFront", [0.92, 0.58, 0.05], [0.67, 0.68, 1.075], P.PANEL);
  box("stoveTop", [0.94, 0.08, 0.68], [0.67, 1.10, 0.70], P.STEEL_DARK);

  for (const x of [0.43, 0.91]) {
    for (const z of [0.53, 0.87]) {
      cylinder("stoveBurner", 0.13, 0.025, [x, 1.16, z], P.BLACK);
      cylinder("burnerRing", 0.095, 0.018, [x, 1.18, z], P.STEEL);
      cylinder("burnerHub", 0.025, 0.025, [x, 1.20, z], P.RUBBER);
    }
  }
  box("stoveFrontLower", [0.80, 0.08, 0.03], [0.67, 0.42, 1.11], P.RUBBER);
  box("stoveHandle", [0.58, 0.045, 0.045], [0.67, 0.48, 1.145], P.STEEL);

  // Oven window.
  box("ovenWindowFrame", [0.70, 0.35, 0.06], [0.67, 0.70, 1.12], P.STEEL_DARK);
  box("ovenWindow", [0.58, 0.22, 0.018], [0.67, 0.70, 1.155], P.GLASS);

  // ---------------------------------------------------------------------------
  // Tall refrigerator / food locker at the right end.
  // ---------------------------------------------------------------------------

  box("refrigerator", [0.72, 1.88, 0.78], [1.25, 1.10, 0.68], P.PANEL);
  box("refrigeratorDoor", [0.62, 1.68, 0.055], [1.25, 1.12, 1.09], P.HULL);
  box("refrigeratorDoorInset", [0.48, 1.43, 0.022], [1.25, 1.10, 1.126], P.HULL_DARK);
  box("refrigeratorTop", [0.80, 0.10, 0.86], [1.25, 2.08, 0.68], P.PANEL_LIGHT);
  box("refrigeratorBottom", [0.80, 0.10, 0.86], [1.25, 0.16, 0.68], P.RUBBER);
  rod("refrigeratorHandle", [1.48, 0.66, 1.16], [1.48, 1.58, 1.16], 0.025, P.STEEL);
  for (const y of [0.30, 1.95]) {
    box("refrigeratorHinge", [0.07, 0.13, 0.06], [0.88, y, 1.15], P.STEEL_DARK);
  }

  // ---------------------------------------------------------------------------
  // Overhead lockers, separated by heavy ribs.
  // ---------------------------------------------------------------------------

  box("overheadLockers", [3.05, 0.76, 0.70], [0, 2.18, 0.70], P.HULL);
  box("overheadLockerBottom", [3.10, 0.09, 0.76], [0, 1.77, 0.70], P.STEEL_DARK);
  box("overheadLockerFace", [2.92, 0.62, 0.055], [0, 2.19, 1.085], P.PANEL);
  box("overheadLockerTopRail", [3.00, 0.075, 0.09], [0, 2.55, 1.07], P.STEEL_DARK);
  box("overheadLockerBottomRail", [3.00, 0.075, 0.09], [0, 1.83, 1.07], P.RUBBER);

  for (let i = 0; i < 4; i++) {
    const x = -1.10 + i * 0.73;
    box("overheadDoorSeam", [0.035, 0.59, 0.025], [x, 2.19, 1.125], P.HULL_DARK);
    box("overheadDoorPanel", [0.62, 0.50, 0.018], [x + 0.29, 2.19, 1.125], P.HULL_DARK);
    box("overheadDoorInset", [0.48, 0.34, 0.018], [x + 0.29, 2.19, 1.145], P.PANEL);
  }

  // ---------------------------------------------------------------------------
  // Ceiling light placeholder surface, vents and side utility cabinets.
  // ---------------------------------------------------------------------------

  box("ceilingLightRecess", [2.25, 0.045, 0.30], [0, 2.62, 0.10], P.BLACK);
  box("ceilingLightFrame", [2.38, 0.07, 0.40], [0, 2.64, 0.10], P.STEEL_DARK);

  for (const x of [-1.25, -0.82, 0.82, 1.25]) {
    box("ceilingVent", [0.23, 0.025, 0.32], [x, 2.625, -0.65], P.HULL_DARK);
    for (let j = -1; j <= 1; j++) {
      box("ceilingVentSlat", [0.18, 0.018, 0.025], [x, 2.65, -0.65 + j * 0.08], P.STEEL);
    }
  }

  // Left-side wall storage and a narrow emergency cabinet.
  box("sideStorage", [0.62, 0.78, 0.44], [-1.35, 1.82, -0.70], P.PANEL);
  box("sideStorageDoor", [0.50, 0.64, 0.035], [-1.35, 1.82, -0.46], P.HULL_DARK);
  rod("sideStorageHandle", [-1.35, 1.82, -0.405], [-1.35, 2.05, -0.405], 0.018, P.OCHRE);

  box("emergencyCabinet", [0.46, 0.86, 0.08], [1.35, 1.62, -1.105], P.CREAM);
  box("emergencyCabinetInset", [0.31, 0.53, 0.025], [1.35, 1.62, -1.15], P.RED);
  box("emergencyCabinetBar", [0.20, 0.035, 0.04], [1.35, 1.62, -1.18], P.WHITE);

  // ---------------------------------------------------------------------------
  // Exposed engineering: conduit, drain, cable bundles and floor anchors.
  // ---------------------------------------------------------------------------

  rod("leftConduit", [-1.45, 0.18, -1.08], [-1.45, 2.46, -1.08], 0.035, P.STEEL_DARK);
  rod("rightConduit", [1.43, 0.18, -1.08], [1.43, 1.00, -1.08], 0.035, P.STEEL_DARK);
  rod("rearConduitTop", [-1.45, 2.44, -1.08], [1.43, 2.44, -1.08], 0.035, P.STEEL_DARK);

  for (const x of [-1.45, 1.43]) {
    for (const y of [0.42, 1.08, 1.76, 2.42]) {
      cylinder("conduitClamp", 0.065, 0.035, [x, y, -1.08], P.STEEL, [0, 0, 1], 8);
    }
  }

  // Four cable bundles tucked beneath the overhead lockers.
  for (let i = 0; i < 4; i++) {
    const x = -1.28 + i * 0.85;
    rod("hangingCable", [x, 1.78, 0.32], [x + 0.05, 1.46, 0.32], 0.014, i % 2 ? P.RED : P.GREEN);
    cylinder("cableGrommet", 0.035, 0.025, [x, 1.79, 0.32], P.RUBBER);
  }

  // Floor plates and anchor bolts.
  for (const x of [-1.48, 1.48]) {
    for (const z of [-1.02, 0.98]) {
      box("floorAnchorPlate", [0.22, 0.035, 0.18], [x, 0.115, z], P.STEEL_DARK);
      cylinder("floorAnchorBolt", 0.025, 0.035, [x, 0.15, z], P.ALUMINUM);
    }
  }

  // Drain requested as a clear, deliberately simple surface.
  box("floorDrain", [0.40, 0.025, 0.40], [-0.78, 0.125, 0.40], P.BLACK);
  box("floorDrainFrameFront", [0.46, 0.04, 0.045], [-0.78, 0.15, 0.61], P.STEEL);
  box("floorDrainFrameBack", [0.46, 0.04, 0.045], [-0.78, 0.15, 0.19], P.STEEL);
  box("floorDrainFrameLeft", [0.045, 0.04, 0.38], [-1.01, 0.15, 0.40], P.STEEL);
  box("floorDrainFrameRight", [0.045, 0.04, 0.38], [-0.55, 0.15, 0.40], P.STEEL);
  for (let i = -1; i <= 1; i++) {
    box(
      "floorDrainBar",
      [0.035, 0.035, 0.36],
      [-0.78 + i * 0.11, 0.17, 0.40],
      P.ALUMINUM,
      { rotation: [0, 0, Math.PI / 8] },
    );
  }

  // Small fasteners and warning blocks make the main shapes feel assembled.
  for (const x of [-1.46, -0.72, 0.02, 0.76, 1.48]) {
    cylinder("counterFastener", 0.018, 0.025, [x, 1.18, 1.10], P.STEEL, [0, 1, 0], 8);
  }
  for (const x of [-1.36, -0.45, 0.45, 1.36]) {
    cylinder("lockerFastener", 0.021, 0.025, [x, 2.50, 1.12], P.OCHRE, [0, 0, 1], 8);
  }

  // Heavy front threshold, deliberately low and not a separate scene prop.
  box("frontThreshold", [3.25, 0.12, 0.16], [0, 0.14, 1.19], P.HULL_DEEP);
  box("frontThresholdTop", [3.08, 0.035, 0.14], [0, 0.22, 1.17], P.STEEL_DARK);

  for (const add of STAGE2) add(b);
  return b.root;
}
