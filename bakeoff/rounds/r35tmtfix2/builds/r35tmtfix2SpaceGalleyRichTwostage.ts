import * as THREE from "three";
import { type Builder, createBuilder, noise, paint, rng } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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

const HULL_PATINA = paint((p, n) => {
  const vertical = 0.5 + 0.5 * Math.sin(p.x * 17.0 + noise(p, 0.42, 31) * 4.0);
  const grime = noise(p, 0.24, 17);
  const olivePatch = noise(p, 0.16, 53);
  if (Math.abs(n.z) > 0.55 && olivePatch > 0.77 && vertical > 0.42) return "#53634f";
  if (grime > 0.72) return "#252f2b";
  if (vertical > 0.78 && n.y > -0.25) return "#4a554d";
  return "#38433d";
});

const COUNTER_WEAR = paint((p, n) => {
  const edge = Math.max(Math.abs(p.x) / 1.55, Math.abs(p.z - 0.70) / 0.48);
  const scuff = noise(p, 0.075, 67);
  const grease = noise(new THREE.Vector3(p.x * 1.8, p.y, p.z * 2.4), 0.12, 73);
  if (n.y < 0.15 || edge > 0.86) return "#596158";
  if (grease > 0.79 && p.z > 0.38 && p.z < 1.02) return "#796d58";
  if (scuff > 0.76 && Math.abs(p.x) < 1.35) return "#9c957e";
  if (scuff < 0.12 && n.y > 0.55) return "#aaa187";
  return "#b8ad91";
});

const CABINET_NUMBERS = paint((p, n) => {
  const base = p.z > 0.98 ? "#596158" : "#38433d";
  if (n.z > 0.45) {
    const band = Math.floor((p.x + 1.55) / 0.73);
    const localX = ((p.x + 1.55) % 0.73 + 0.73) % 0.73;
    const localY = ((p.y - 1.83) % 0.72 + 0.72) % 0.72;
    const caution = localY > 0.53 && (localX < 0.045 || localX > 0.22);
    const stencilBar =
      (band % 3 === 0 && localX > 0.25 && localX < 0.30 && localY > 0.18 && localY < 0.43) ||
      (band % 3 === 1 && localX > 0.34 && localX < 0.39 && localY > 0.22 && localY < 0.48) ||
      (band % 3 === 2 && localX > 0.43 && localX < 0.48 && localY > 0.14 && localY < 0.39);
    if (caution && noise(p, 0.09, 81) > 0.35) return "#a37a42";
    if (stencilBar && noise(p, 0.055, 83) > 0.32) return "#b8ad91";
  }
  return base;
});

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 0.8 });
  const P = PALETTE;

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: ColorInput,
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
    color: ColorInput = P.PANEL,
  ) => box(name, size, at, color, { bevel: 0.015 });

  // ---------------------------------------------------------------------------
  // Main room envelope. The front remains open so the galley reads immediately.
  // ---------------------------------------------------------------------------

  box("floor", [3.5, 0.12, 2.55], [0, 0.02, 0], P.HULL_DARK);
  box("floorInset", [3.14, 0.035, 2.18], [0, 0.105, 0.02], P.RUBBER);

  box("rearBulkhead", [3.5, 2.65, 0.16], [0, 1.38, -1.20], HULL_PATINA);
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
  box("counterTop", [3.12, 0.16, 0.88], [0, 1.08, 0.70], COUNTER_WEAR);
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

  box("overheadLockers", [3.05, 0.76, 0.70], [0, 2.18, 0.70], CABINET_NUMBERS);
  box("overheadLockerBottom", [3.10, 0.09, 0.76], [0, 1.77, 0.70], P.STEEL_DARK);
  box("overheadLockerFace", [2.92, 0.62, 0.055], [0, 2.19, 1.085], CABINET_NUMBERS);
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const HOUSING = "#202927";
  const HOUSING_EDGE = "#46534d";
  const STEEL = "#8b9185";
  const RUBBER = "#101615";
  const PALE_GREEN = "#b9d6a3";
  const AMBER = "#d8a64b";

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    position: [number, number, number],
  ) =>
    b.part(geometry, color, {
      name: `s2_${name}`,
      at: position,
    });

  const box = (
    name: string,
    size: [number, number, number],
    position: [number, number, number],
    color: string,
  ) =>
    part(name, new THREE.BoxGeometry(size[0], size[1], size[2]), color, position);

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    position: [number, number, number],
    color: string,
    segments = 8,
    direction: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      {
        name: `s2_${name}`,
        at: position,
        dir: direction,
      },
    );

  // Main pressed-metal trough. Its top is tucked just under the ceiling panel.
  box("lightHousing", [2.16, 0.075, 0.31], at(0, 2.625, 0.15), HOUSING);
  box("lightHousingLowerLip", [2.20, 0.035, 0.35], at(0, 2.579, 0.15), HOUSING_EDGE);
  box("lightHousingDarkInset", [2.03, 0.018, 0.255], at(0, 2.557, 0.15), RUBBER);

  // Folded side rails and end cheeks give the fixture the heavy, practical silhouette
  // of a shipboard fluorescent unit.
  box("frontFoldedRail", [2.20, 0.055, 0.045], at(0, 2.585, 0.325), STEEL);
  box("backFoldedRail", [2.20, 0.055, 0.045], at(0, 2.585, -0.025), STEEL);
  box("leftEndCheek", [0.075, 0.115, 0.36], at(-1.075, 2.605, 0.15), HOUSING_EDGE);
  box("rightEndCheek", [0.075, 0.115, 0.36], at(1.075, 2.605, 0.15), HOUSING_EDGE);
  box("leftEndBlackSeal", [0.022, 0.055, 0.27], at(-1.118, 2.575, 0.15), RUBBER);
  box("rightEndBlackSeal", [0.022, 0.055, 0.27], at(1.118, 2.575, 0.15), RUBBER);

  // Six short, deliberately chunky lamp sections. Small dark gaps make the
  // alternating tubes read clearly instead of becoming one glowing rectangle.
  const lampX = [-0.84, -0.504, -0.168, 0.168, 0.504, 0.84];
  const lampColors = [PALE_GREEN, AMBER, PALE_GREEN, AMBER, PALE_GREEN, AMBER];

  lampX.forEach((x, i) => {
    const lamp = box(
      `lamp${i}`,
      [0.285, 0.024, 0.205],
      at(x, 2.548, 0.15),
      lampColors[i],
    );
    glow(lamp, i % 2 === 0 ? 1.2 : 1.05);

    // Dark end collars and narrow metal retainers keep each lamp seated.
    box(`lamp${i}LeftCollar`, [0.018, 0.035, 0.22], at(x - 0.145, 2.548, 0.15), RUBBER);
    box(`lamp${i}RightCollar`, [0.018, 0.035, 0.22], at(x + 0.145, 2.548, 0.15), RUBBER);
    box(`lamp${i}FrontRetainer`, [0.30, 0.012, 0.018], at(x, 2.535, 0.265), STEEL);
    box(`lamp${i}BackRetainer`, [0.30, 0.012, 0.018], at(x, 2.535, 0.035), STEEL);
  });

  // Raised longitudinal ribs break up the top of the housing and imply a
  // folded service cover.
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.235;
    box("housingRib", [0.025, 0.034, 0.265], at(x, 2.682, 0.15), HOUSING_EDGE);
    if (Math.abs(i) === 2 || Math.abs(i) === 4) {
      cylinder("ribFastener", 0.018, 0.012, at(x, 2.699, 0.15), STEEL, 8);
    }
  }

  // Four ceiling brackets: square standoffs, straps, and visible bolt heads.
  for (const x of [-0.78, -0.26, 0.26, 0.78]) {
    box("ceilingBracketStandoff", [0.12, 0.055, 0.12], at(x, 2.712, 0.15), HOUSING_EDGE);
    box("ceilingBracketFoot", [0.20, 0.025, 0.15], at(x, 2.746, 0.15), HOUSING_EDGE);
    box("bracketFrontStrap", [0.035, 0.11, 0.34], at(x - 0.062, 2.654, 0.15), STEEL);
    box("bracketBackStrap", [0.035, 0.11, 0.34], at(x + 0.062, 2.654, 0.15), STEEL);
    cylinder("bracketBoltFront", 0.021, 0.014, at(x - 0.062, 2.701, 0.34), STEEL, 8, [0, 0, 1]);
    cylinder("bracketBoltBack", 0.021, 0.014, at(x + 0.062, 2.701, -0.04), STEEL, 8, [0, 0, 1]);
  }

  // Two little cable glands emerge from the rear edge, with short dark conduits
  // disappearing into the ceiling.
  for (const x of [-0.72, 0.72]) {
    cylinder("cableGland", 0.035, 0.035, at(x, 2.691, -0.005), RUBBER, 8, [0, 0, 1]);
    b.rod(
      at(x, 2.70, -0.01),
      at(x, 2.748, -0.01),
      0.018,
      { color: RUBBER, name: "s2_ceilingConduit" },
    );
  }

  // A small service label and a pair of amber warning tabs add the last layer
  // of utilitarian detail without turning the fixture into a modern object.
  box("serviceLabel", [0.22, 0.008, 0.09], at(0.53, 2.588, 0.349), STEEL);
  box("serviceLabelInk", [0.15, 0.006, 0.018], at(0.53, 2.584, 0.355), RUBBER);
  box("warningTabLeft", [0.13, 0.012, 0.045], at(-0.95, 2.584, 0.352), AMBER);
  box("warningTabRight", [0.13, 0.012, 0.045], at(0.95, 2.584, 0.352), AMBER);

  // Two recessed screw heads on each end cheek.
  for (const x of [-1.09, 1.09]) {
    for (const z of [0.04, 0.26]) {
      cylinder("endCheekScrew", 0.014, 0.012, at(x, 2.61, z), STEEL, 8, [1, 0, 0]);
    }
  }
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addStoveControls(b: Builder) {
  const P = PALETTE;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      name,
      ...options,
    });

  const knob = (
    x: number,
    y: number,
    z: number,
    index: number,
  ) => {
    // Short cream rotary body, with a black inset cap and a tiny pointer notch.
    part(
      new THREE.CylinderGeometry(0.047, 0.052, 0.035, 10),
      P.CREAM_LIGHT,
      [x, y, z],
      `stoveKnob${index}`,
      { dir: [0, 0, 1] },
    );
    part(
      new THREE.CylinderGeometry(0.027, 0.027, 0.039, 10),
      P.BLACK,
      [x, y, z + 0.006],
      `stoveKnobCentre${index}`,
      { dir: [0, 0, 1] },
    );
    part(
      new THREE.BoxGeometry(0.008, 0.024, 0.006),
      P.WHITE,
      [x, y + 0.011, z + 0.027],
      `stoveKnobPointer${index}`,
    );
    part(
      new THREE.BoxGeometry(0.075, 0.012, 0.008),
      P.STEEL_DARK,
      [x, y - 0.064, z + 0.023],
      `stoveKnobLabelRail${index}`,
    );
  };

  // The four large, deliberately old-fashioned controls fill the reserved stove fascia.
  const knobXs = [0.43, 0.62, 0.81, 1.00];
  knobXs.forEach((x, i) => knob(x, 1.035, 0.968, i + 1));

  // Two recessed pilot lamps, one red and one amber, with metal bezels.
  for (const [i, x, color] of [
    [1, 0.49, P.RED],
    [2, 0.95, P.AMBER],
  ] as const) {
    part(
      new THREE.CylinderGeometry(0.027, 0.027, 0.012, 10),
      P.BLACK,
      [x, 0.925, 0.975],
      `stoveLampBezel${i}`,
      { dir: [0, 0, 1] },
    );
    part(
      new THREE.SphereGeometry(0.017, 8, 5),
      color,
      [x, 0.925, 0.984],
      `stoveLamp${i}`,
    );
    part(
      new THREE.SphereGeometry(0.005, 6, 4),
      P.WHITE,
      [x - 0.006, 0.931, 0.998],
      `stoveLampGlint${i}`,
    );
  }

  // A narrow engraved divider and a screw pair make the control strip read as a mounted fascia.
  part(
    new THREE.BoxGeometry(0.62, 0.014, 0.009),
    P.STEEL_DARK,
    [0.72, 1.105, 0.977],
    "stoveControlUpperRail",
  );
  for (const x of [0.36, 1.08]) {
    part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8),
      P.ALUMINUM,
      [x, 1.105, 0.984],
      "stoveControlScrew",
      { dir: [0, 0, 1] },
    );
  }

  // ---------------------------------------------------------------------------
  // Sink faucet: a heavy squared gooseneck assembled from low-poly pipe runs.
  // ---------------------------------------------------------------------------

  const pipe = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    name: string,
    color = P.STEEL_DARK,
  ) => b.rod(a, c, radius, { color, name });

  // Mount is behind the basin, rising from the rear counter ledge.
  part(
    new THREE.CylinderGeometry(0.078, 0.088, 0.035, 6),
    P.CREAM,
    [-0.75, 1.315, 0.48],
    "faucetHexCollar",
  );
  part(
    new THREE.CylinderGeometry(0.045, 0.052, 0.045, 8),
    P.STEEL_DARK,
    [-0.75, 1.35, 0.48],
    "faucetMountSocket",
  );

  pipe([-0.75, 1.35, 0.48], [-0.75, 1.58, 0.48], 0.034, "faucetRise");
  pipe([-0.75, 1.58, 0.48], [-0.75, 1.58, 0.64], 0.034, "faucetReach");
  pipe([-0.75, 1.58, 0.64], [-0.75, 1.48, 0.70], 0.034, "faucetElbow");
  pipe([-0.75, 1.48, 0.70], [-0.75, 1.405, 0.70], 0.030, "faucetSpout");

  part(
    new THREE.CylinderGeometry(0.036, 0.030, 0.022, 8),
    P.ALUMINUM,
    [-0.75, 1.394, 0.70],
    "faucetSpoutTip",
  );

  // Elbow collars break up the pipe into believable serviceable sections.
  part(
    new THREE.TorusGeometry(0.038, 0.008, 6, 10, Math.PI * 1.35),
    P.ALUMINUM,
    [-0.75, 1.58, 0.64],
    "faucetElbowBand",
    { rotation: [Math.PI / 2, 0, 0] },
  );
  part(
    new THREE.BoxGeometry(0.075, 0.018, 0.075),
    P.STEEL,
    [-0.75, 1.46, 0.70],
    "faucetSpoutBlock",
  );

  // Hot and cold valve wheels sit either side of the upright.
  for (const [side, x, color] of [
    ["hot", -0.86, P.RED],
    ["cold", -0.64, P.GREEN],
  ] as const) {
    part(
      new THREE.CylinderGeometry(0.038, 0.038, 0.040, 8),
      P.CREAM,
      [x, 1.375, 0.48],
      `faucet${side}ValveStem`,
      { dir: [0, 0, 1] },
    );
    part(
      new THREE.TorusGeometry(0.048, 0.010, 6, 10),
      P.STEEL_DARK,
      [x, 1.375, 0.505],
      `faucet${side}ValveWheel`,
      { rotation: [Math.PI / 2, 0, 0] },
    );
    part(
      new THREE.CylinderGeometry(0.021, 0.021, 0.018, 8),
      color,
      [x, 1.375, 0.528],
      `faucet${side}ValveMarker`,
      { dir: [0, 0, 1] },
    );
    part(
      new THREE.BoxGeometry(0.010, 0.034, 0.008),
      P.WHITE,
      [x, 1.404, 0.542],
      `faucet${side}ValvePointer`,
    );
  }

  // Two dark retaining straps and a small service plate anchor the faucet visually to the sink.
  part(
    new THREE.BoxGeometry(0.18, 0.025, 0.012),
    P.RUBBER,
    [-0.75, 1.337, 0.475],
    "faucetMountStrapFront",
  );
  part(
    new THREE.BoxGeometry(0.18, 0.025, 0.012),
    P.RUBBER,
    [-0.75, 1.337, 0.535],
    "faucetMountStrapBack",
  );
  part(
    new THREE.BoxGeometry(0.22, 0.018, 0.10),
    P.PANEL_LIGHT,
    [-0.75, 1.322, 0.48],
    "faucetServicePlate",
  );
  for (const x of [-0.84, -0.66]) {
    part(
      new THREE.CylinderGeometry(0.010, 0.010, 0.012, 8),
      P.STEEL_DARK,
      [x, 1.337, 0.43],
      "faucetServiceBolt",
      { dir: [0, 1, 0] },
    );
  }
}
    return addStoveControls;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addCounterLip(b: Builder) {
  const P = PALETTE;

  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    dir?: [number, number, number],
  ) =>
    b.part(geometry, color, {
      name,
      at,
      ...(dir ? { dir } : {}),
    });

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
  ) =>
    part(
      name,
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
    );

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 8,
  ) =>
    part(
      name,
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      at,
      dir,
    );

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { name, color });

  // ---------------------------------------------------------------------------
  // Sealed counter lip: a continuous front gasket, side returns and chunky
  // corner blocks. The lip sits just outside the existing cream worktop.
  // ---------------------------------------------------------------------------

  box("counterLipFront", [3.02, 0.105, 0.075], [0, 1.105, 1.145], P.RUBBER);

  box("counterLipLeftReturn", [0.075, 0.105, 0.73], [-1.525, 1.105, 0.725], P.RUBBER);
  box("counterLipRightReturn", [0.075, 0.105, 0.73], [1.525, 1.105, 0.725], P.RUBBER);

  box("counterLipLeftCorner", [0.18, 0.15, 0.16], [-1.485, 1.115, 1.105], P.STEEL_DARK);
  box("counterLipRightCorner", [0.18, 0.15, 0.16], [1.485, 1.115, 1.105], P.STEEL_DARK);

  box("counterLipLeftCornerCap", [0.12, 0.045, 0.12], [-1.485, 1.215, 1.105], P.PANEL_LIGHT);
  box("counterLipRightCornerCap", [0.12, 0.045, 0.12], [1.485, 1.215, 1.105], P.PANEL_LIGHT);

  // Raised gasket seam running along the black front lip.
  box("counterLipFrontSeam", [2.74, 0.018, 0.012], [0, 1.155, 1.187], P.HULL_DEEP);
  box("counterLipFrontLowerSeam", [2.72, 0.018, 0.012], [0, 1.065, 1.187], P.HULL_DEEP);

  // Four broad inspection plates break up the uninterrupted rubber strip.
  for (let i = 0; i < 4; i++) {
    const x = -1.08 + i * 0.72;
    box("counterLipInspectionPlate", [0.24, 0.075, 0.018], [x, 1.108, 1.19], P.STEEL_DARK);

    for (const dx of [-0.085, 0.085]) {
      cylinder(
        "counterLipInspectionBolt",
        0.014,
        0.022,
        [x + dx, 1.108, 1.207],
        P.ALUMINUM,
        [0, 0, 1],
        8,
      );
    }
  }

  // Small regularly spaced fasteners make the lip read as a removable shipboard
  // seal rather than a floating decorative strip.
  for (const x of [-1.40, -0.70, 0, 0.70, 1.40]) {
    cylinder(
      "counterLipFrontFastener",
      0.019,
      0.026,
      [x, 1.105, 1.192],
      P.ALUMINUM,
      [0, 0, 1],
      8,
    );
  }

  for (const side of [-1, 1]) {
    for (const z of [0.52, 0.91]) {
      cylinder(
        "counterLipSideFastener",
        0.018,
        0.024,
        [side * 1.57, 1.105, z],
        P.ALUMINUM,
        [1, 0, 0],
        8,
      );
    }
  }

  // Warning-painted corner tabs, inset into the steel corner guards.
  box("counterLipWarningLeft", [0.055, 0.055, 0.105], [-1.485, 1.145, 1.155], P.OCHRE);
  box("counterLipWarningRight", [0.055, 0.055, 0.105], [1.485, 1.145, 1.155], P.OCHRE);

  // ---------------------------------------------------------------------------
  // Lower cabinet handles. Each door receives a thick vertical pull, two
  // cylindrical stand-offs, a small backing plate and dark corner hinges.
  // ---------------------------------------------------------------------------

  const doorCenters = [-1.12, -0.40, 0.32];

  for (let i = 0; i < doorCenters.length; i++) {
    const x = doorCenters[i];
    const handleColor = i % 2 === 0 ? P.STEEL : P.OCHRE;

    box(
      "cabinetHandleBackplate",
      [0.105, 0.34, 0.026],
      [x, 0.62, 1.135],
      P.HULL_DEEP,
    );

    rod(
      "cabinetVerticalPull",
      [x, 0.485, 1.185],
      [x, 0.755, 1.185],
      0.027,
      handleColor,
    );

    // Squared-off end collars emphasize the heavy industrial grip.
    cylinder(
      "cabinetHandleCollarBottom",
      0.046,
      0.045,
      [x, 0.485, 1.185],
      P.STEEL_DARK,
      [0, 0, 1],
      8,
    );
    cylinder(
      "cabinetHandleCollarTop",
      0.046,
      0.045,
      [x, 0.755, 1.185],
      P.STEEL_DARK,
      [0, 0, 1],
      8,
    );

    // Stand-offs project toward the viewer from the cabinet face.
    rod(
      "cabinetHandleStandoffBottom",
      [x, 0.485, 1.115],
      [x, 0.485, 1.185],
      0.022,
      P.STEEL_DARK,
    );
    rod(
      "cabinetHandleStandoffTop",
      [x, 0.755, 1.115],
      [x, 0.755, 1.185],
      0.022,
      P.STEEL_DARK,
    );

    // A narrow central wear stripe on each backing plate.
    box(
      "cabinetHandleBackingStripe",
      [0.025, 0.27, 0.012],
      [x, 0.62, 1.153],
      i % 2 === 0 ? P.OCHRE : P.PANEL_LIGHT,
    );

    // Two hinge blocks at the left edge of each lower door.
    const hingeX = x - 0.275;
    for (const y of [0.40, 0.84]) {
      box(
        "cabinetDoorHingeBlock",
        [0.075, 0.105, 0.055],
        [hingeX, y, 1.145],
        P.HULL_DEEP,
      );
      cylinder(
        "cabinetDoorHingePin",
        0.018,
        0.072,
        [hingeX, y, 1.182],
        P.STEEL,
        [0, 0, 1],
        8,
      );
    }

    // Small warning tabs beside alternating handles.
    if (i % 2 === 1) {
      box(
        "cabinetWarningTab",
        [0.12, 0.045, 0.018],
        [x + 0.11, 0.885, 1.145],
        P.OCHRE,
      );
      box(
        "cabinetWarningTabDark",
        [0.12, 0.012, 0.012],
        [x + 0.11, 0.855, 1.157],
        P.HULL_DEEP,
      );
    }
  }

  // Utility drawer handle reinforcement, tying the new pulls into the adjacent
  // drawer bank without adding a separate prop.
  for (const y of [0.39, 0.62, 0.85]) {
    box("utilityHandleMountLeft", [0.045, 0.07, 0.035], [1.18, y, 1.155], P.HULL_DEEP);
    box("utilityHandleMountRight", [0.045, 0.07, 0.035], [1.42, y, 1.155], P.HULL_DEEP);
    cylinder("utilityHandleCapLeft", 0.018, 0.025, [1.18, y, 1.18], P.ALUMINUM, [0, 0, 1], 8);
    cylinder("utilityHandleCapRight", 0.018, 0.025, [1.42, y, 1.18], P.ALUMINUM, [0, 0, 1], 8);
  }
}
    return addCounterLip;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addOverheadLatches(b: Builder) {
  const C = PALETTE;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(geometry, color, {
      at,
      name,
      ...(rotation ? { rotation } : {}),
    } as any);

  const faceCylinder = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 12,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, depth, segments),
      color,
      at,
      name,
      [90, 0, 0],
    );

  // The locker face is a broad, slightly inset panel. Keep all additions
  // within the request's clear box, with their faces just proud of the panel.
  const faceZ = 1.012;
  const frontZ = 1.030;

  // Three deep vertical gasket seams divide the four locker doors.
  for (const [i, x] of [-0.73, 0, 0.73].entries()) {
    part(
      new THREE.BoxGeometry(0.026, 0.57, 0.018),
      C.RUBBER,
      [x, 2.10, faceZ],
      `s24_lockerSeam_${i}`,
    );

    // A pair of tiny steel-ended fasteners makes each seam read as a
    // replaceable pressure gasket rather than a painted line.
    for (const [j, y] of [1.86, 2.34].entries()) {
      faceCylinder(
        0.015,
        0.022,
        [x, y, frontZ],
        C.STEEL_DARK,
        `s24_seamFastener_${i}_${j}`,
        8,
      );
    }
  }

  // Six quarter-turn catches: two on each of the three major door bays.
  // Each is layered like a real latch: dark mounting boss, steel bezel,
  // ochre indicator plug, black index slot, and four small rivets.
  const xs = [-1.10, 0, 1.10];
  const ys = [1.94, 2.27];

  for (let xi = 0; xi < xs.length; xi++) {
    for (let yi = 0; yi < ys.length; yi++) {
      const x = xs[xi];
      const y = ys[yi];
      const id = xi * 2 + yi;
      const turn = id % 2 === 0 ? 18 : -18;

      faceCylinder(
        0.091,
        0.026,
        [x, y, 0.998],
        C.HULL_DEEP,
        `s24_latchBacking_${id}`,
        12,
      );

      faceCylinder(
        0.073,
        0.031,
        [x, y, 1.012],
        C.STEEL_DARK,
        `s24_latchBezel_${id}`,
        12,
      );

      faceCylinder(
        0.051,
        0.036,
        [x, y, 1.028],
        C.STEEL,
        `s24_latchFace_${id}`,
        10,
      );

      faceCylinder(
        0.030,
        0.041,
        [x, y, 1.040],
        C.OCHRE,
        `s24_latchIndicator_${id}`,
        8,
      );

      // The offset black slot is the visual cue that these are quarter-turn
      // catches, not simple buttons.
      part(
        new THREE.BoxGeometry(0.012, 0.046, 0.009),
        C.BLACK,
        [x, y, 1.064],
        `s24_latchSlot_${id}`,
        [0, 0, turn],
      );

      // Four recessed/riveted corners around each round mechanism.
      const rivetRadius = 0.061;
      const rivets: [number, number][] = [
        [-rivetRadius, -rivetRadius],
        [rivetRadius, -rivetRadius],
        [rivetRadius, rivetRadius],
        [-rivetRadius, rivetRadius],
      ];

      for (const [ri, [dx, dy]] of rivets.entries()) {
        faceCylinder(
          0.0105,
          0.018,
          [x + dx, y + dy, 1.045],
          ri % 2 === 0 ? C.ALUMINUM : C.STEEL_DARK,
          `s24_latchRivet_${id}_${ri}`,
          8,
        );
      }
    }
  }

  // Short upper and lower keeper bars give each latch a convincing load path
  // into the locker skin while remaining inside the reserved room.
  for (let i = 0; i < xs.length; i++) {
    for (const y of [1.84, 2.40]) {
      part(
        new THREE.BoxGeometry(0.28, 0.018, 0.014),
        C.STEEL_DARK,
        [xs[i], y, 1.022],
        `s24_latchKeeper_${i}_${y < 2 ? "lower" : "upper"}`,
      );
    }
  }
}
    return addOverheadLatches;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addPipeManifold(b: Builder) {
  const P = PALETTE;

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    quat?: THREE.Quaternion,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name: `s25_${name}`,
      at,
      ...(quat ? { quat } : {}),
    });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      name: `s25_${name}`,
      at,
      dir,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { color, name: `s25_${name}` });

  // ---------------------------------------------------------------------------
  // Compact rear-wall pipe manifold.
  // The manifold is deliberately dense and slightly asymmetrical, like a
  // service assembly bolted into the original ship rather than a clean panel.
  // ---------------------------------------------------------------------------

  const z = -1.005;
  const pipeZ = -0.955;
  const xs = [-1.405, -1.265, -1.125, -0.985];

  // Dark backing plate and lower valve shelf.
  box("manifoldBacking", [0.56, 0.84, 0.045], [-1.195, 1.61, z], P.HULL_DEEP);
  box("manifoldTopClamp", [0.60, 0.075, 0.12], [-1.195, 2.035, pipeZ], P.STEEL_DARK);
  box("manifoldBottomShelf", [0.60, 0.075, 0.13], [-1.195, 1.17, pipeZ], P.STEEL_DARK);

  // Four parallel enamelled risers, each with dark collars and red terminal caps.
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const enamel = i === 1 || i === 3 ? P.GREEN : P.STEEL_DARK;

    rod(
      `verticalPipe${i}`,
      [x, 1.24, pipeZ],
      [x, 1.96, pipeZ],
      0.026,
      enamel,
    );

    cylinder(`lowerPipeCollar${i}`, 0.050, 0.035, [x, 1.285, pipeZ], P.RUBBER);
    cylinder(`upperPipeCollar${i}`, 0.050, 0.035, [x, 1.91, pipeZ], P.STEEL);

    cylinder(
      `redPipeCap${i}`,
      0.034,
      0.025,
      [x, 2.005, pipeZ],
      i === 2 ? P.AMBER : P.RED,
      [0, 1, 0],
      8,
    );

    cylinder(
      `capCentre${i}`,
      0.012,
      0.030,
      [x, 2.023, pipeZ],
      P.BLACK,
      [0, 1, 0],
      6,
    );
  }

  // Lower horizontal collector and the short branches feeding each riser.
  rod(
    "collector",
    [-1.47, 1.24, pipeZ],
    [-0.92, 1.24, pipeZ],
    0.038,
    P.STEEL_DARK,
  );

  for (let i = 0; i < xs.length; i++) {
    rod(
      `branch${i}`,
      [xs[i], 1.24, pipeZ],
      [xs[i], 1.31, pipeZ],
      0.031,
      P.GREEN,
    );
    cylinder(
      `branchBolt${i}`,
      0.025,
      0.022,
      [xs[i], 1.24, -0.925],
      P.ALUMINUM,
      [0, 0, 1],
      8,
    );
  }

  // Two square elbow assemblies at the top, with short side outlets.
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? -1.405 : -0.985;
    const x1 = x0 + side * 0.12;

    rod(
      `elbowVertical${side}`,
      [x0, 1.91, pipeZ],
      [x0, 2.00, pipeZ],
      0.040,
      P.STEEL_DARK,
    );
    rod(
      `elbowHorizontal${side}`,
      [x0, 2.00, pipeZ],
      [x1, 2.00, pipeZ],
      0.040,
      P.STEEL_DARK,
    );

    box(
      `elbowBlock${side}`,
      [0.105, 0.105, 0.085],
      [x0 + side * 0.045, 1.995, pipeZ],
      P.STEEL,
    );

    cylinder(
      `elbowRedPlug${side}`,
      0.026,
      0.030,
      [x1, 2.00, pipeZ],
      P.RED,
      [1, 0, 0],
      8,
    );
  }

  // Central rectangular valve block, layered like a cast housing.
  box("valveHousing", [0.27, 0.23, 0.105], [-1.195, 1.43, -0.935], P.STEEL_DARK);
  box("valveFace", [0.20, 0.14, 0.018], [-1.195, 1.43, -0.875], P.GREEN);
  box("valveFaceInset", [0.12, 0.055, 0.012], [-1.195, 1.43, -0.862], P.BLACK);

  // A horizontal handwheel and axle project from the valve face.
  rod(
    "valveAxle",
    [-1.195, 1.43, -0.86],
    [-1.195, 1.43, -0.77],
    0.018,
    P.STEEL,
  );
  cylinder(
    "valveWheel",
    0.082,
    0.018,
    [-1.195, 1.43, -0.745],
    P.OCHRE,
    [0, 0, 1],
    10,
  );
  cylinder(
    "valveWheelHub",
    0.026,
    0.026,
    [-1.195, 1.43, -0.765],
    P.BLACK,
    [0, 0, 1],
    8,
  );

  // Four small mounting feet and a narrow vertical inspection strip.
  for (const x of [-1.46, -0.93]) {
    for (const y of [1.20, 2.02]) {
      box("manifoldMount", [0.075, 0.055, 0.075], [x, y, -0.925], P.STEEL_DARK);
      cylinder("manifoldMountBolt", 0.014, 0.025, [x, y, -0.878], P.ALUMINUM, [0, 0, 1], 6);
    }
  }

  box("inspectionStrip", [0.035, 0.55, 0.018], [-0.875, 1.62, -0.875], P.OCHRE);
  for (let i = 0; i < 4; i++) {
    box(
      "inspectionMark",
      [0.018, 0.055, 0.008],
      [-0.875, 1.35 + i * 0.18, -0.862],
      i === 2 ? P.RED : P.BLACK,
    );
  }

  // ---------------------------------------------------------------------------
  // Cream safety placard on the rear bulkhead.
  // ---------------------------------------------------------------------------

  const placardAt: [number, number, number] = [0.42, 1.62, -0.965];

  box("placardBacking", [0.58, 0.36, 0.032], placardAt, P.CREAM);
  box("placardInnerFace", [0.51, 0.29, 0.014], [0.42, 1.62, -0.943], P.CREAM_LIGHT);

  // Dark perimeter rails make the sign look bolted and slightly overbuilt.
  box("placardRailTop", [0.57, 0.026, 0.035], [0.42, 1.785, -0.925], P.HULL_DEEP);
  box("placardRailBottom", [0.57, 0.026, 0.035], [0.42, 1.455, -0.925], P.HULL_DEEP);
  box("placardRailLeft", [0.026, 0.31, 0.035], [0.145, 1.62, -0.925], P.HULL_DEEP);
  box("placardRailRight", [0.026, 0.31, 0.035], [0.695, 1.62, -0.925], P.HULL_DEEP);

  // Broad diagonal red caution stripe, broken around the raised central bars.
  const stripeQuat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    -Math.PI / 6,
  );
  box(
    "placardStripeA",
    [0.29, 0.045, 0.014],
    [0.245, 1.555, -0.906],
    P.RED,
    stripeQuat,
  );
  box(
    "placardStripeB",
    [0.20, 0.045, 0.014],
    [0.575, 1.685, -0.906],
    P.RED,
    stripeQuat,
  );

  // Three raised dark maintenance bars, intentionally non-readable.
  for (let i = 0; i < 3; i++) {
    box(
      "placardRaisedBar",
      [0.20 - i * 0.025, 0.030, 0.022],
      [0.37 + i * 0.025, 1.70 - i * 0.075, -0.895],
      P.HULL_DEEP,
    );
  }

  // Small green service indicator and a tiny ochre corner tab.
  cylinder("placardGreenLamp", 0.025, 0.018, [0.205, 1.50, -0.895], P.GREEN, [0, 0, 1], 8);
  box("placardCornerTab", [0.09, 0.035, 0.018], [0.61, 1.50, -0.895], P.OCHRE);

  // Four substantial fasteners, each with a darker socket beneath it.
  for (const x of [0.17, 0.67]) {
    for (const y of [1.49, 1.75]) {
      cylinder("placardSocket", 0.033, 0.012, [x, y, -0.905], P.HULL_DEEP, [0, 0, 1], 8);
      cylinder("placardBolt", 0.021, 0.018, [x, y, -0.887], P.STEEL, [0, 0, 1], 8);
      box("placardBoltSlot", [0.022, 0.006, 0.006], [x, y, -0.875], P.BLACK);
    }
  }

  // A pair of thin lower edge scuff strips gives the sign the same hard-use
  // language as the rest of the galley without introducing extra scenery.
  box("placardScuffL", [0.15, 0.012, 0.009], [0.27, 1.485, -0.875], P.OCHRE);
  box("placardScuffR", [0.10, 0.012, 0.009], [0.53, 1.485, -0.875], P.STEEL_DARK);
}
    return addPipeManifold;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addFridgeVents(b: Builder) {
  const P = PALETTE;

  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => b.part(geometry, color, { name, at, ...options } as any);

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    part(
      name,
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      options,
    );

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    part(
      name,
      new THREE.CylinderGeometry(radius, radius, height, 12),
      color,
      at,
      { dir: [0, 0, 1], ...options },
    );

  // ---------------------------------------------------------------------------
  // Refrigerator ventilation bank.
  // The door front is just beyond z = 1.12. The dark recesses sink into a
  // stepped steel surround, making the vents read as pressed and serviceable.
  // ---------------------------------------------------------------------------

  const ventX = 1.25;
  const ventZ = 1.135;
  const ventRows = [1.405, 1.475, 1.545, 1.615, 1.685, 1.755];

  box(
    "fridgeVentBacking",
    [0.52, 0.43, 0.025],
    [ventX, 1.58, 1.126],
    P.STEEL_DARK,
  );

  // Outer steel frame, deliberately asymmetric like a repaired shipboard panel.
  box("fridgeVentFrameTop", [0.58, 0.035, 0.045], [ventX, 1.815, ventZ], P.STEEL);
  box("fridgeVentFrameBottom", [0.58, 0.035, 0.045], [ventX, 1.345, ventZ], P.STEEL);
  box("fridgeVentFrameLeft", [0.035, 0.47, 0.045], [0.955, 1.58, ventZ], P.STEEL);
  box("fridgeVentFrameRight", [0.035, 0.47, 0.045], [1.545, 1.58, ventZ], P.STEEL_DARK);

  for (let i = 0; i < ventRows.length; i++) {
    const y = ventRows[i];
    const width = i === 0 || i === ventRows.length - 1 ? 0.43 : 0.49;

    // Recessed black slot.
    box(
      `fridgeVentSlot${i}`,
      [width, 0.030, 0.018],
      [ventX, y, 1.143],
      P.BLACK,
    );

    // Bright lower rim and a darker upper lip give each slot depth.
    box(
      `fridgeVentLowerRim${i}`,
      [width + 0.025, 0.012, 0.025],
      [ventX, y - 0.024, 1.153],
      P.ALUMINUM,
    );
    box(
      `fridgeVentUpperLip${i}`,
      [width + 0.018, 0.012, 0.018],
      [ventX, y + 0.024, 1.151],
      P.STEEL_DARK,
    );
  }

  // Short vertical dividers break the vents into real stamped sections.
  for (const x of [1.045, 1.25, 1.455]) {
    box(
      "fridgeVentDivider",
      [0.018, 0.39, 0.025],
      [x, 1.58, 1.155],
      P.STEEL_DARK,
    );
  }

  // Four small countersunk fasteners at the ventilation frame.
  for (const x of [0.99, 1.51]) {
    for (const y of [1.37, 1.79]) {
      cylinder(
        "fridgeVentFastener",
        0.018,
        0.018,
        [x, y, 1.164],
        P.ALUMINUM,
        { segments: 8 },
      );
      box(
        "fridgeVentFastenerSlot",
        [0.018, 0.004, 0.006],
        [x, y, 1.176],
        P.BLACK,
      );
    }
  }

  // Green status lamp, with a recessed black bezel and a tiny steel hood.
  cylinder(
    "fridgeStatusBezel",
    0.060,
    0.026,
    [1.515, 1.245, 1.145],
    P.BLACK,
    { segments: 12 },
  );
  const lamp = cylinder(
    "fridgeStatusLamp",
    0.038,
    0.018,
    [1.515, 1.245, 1.166],
    P.GREEN,
    { segments: 12 },
  );
  glow(lamp, 1.35);

  box(
    "fridgeStatusLampTop",
    [0.12, 0.018, 0.025],
    [1.515, 1.302, 1.157],
    P.STEEL_DARK,
  );
  box(
    "fridgeStatusLampLabel",
    [0.14, 0.026, 0.012],
    [1.515, 1.185, 1.171],
    P.CREAM,
  );

  // A small service notch beside the vent bank.
  box(
    "fridgeVentServiceNotch",
    [0.07, 0.16, 0.025],
    [0.965, 1.12, 1.145],
    P.BLACK,
  );
  box(
    "fridgeVentServiceNotchRail",
    [0.085, 0.018, 0.035],
    [0.965, 1.12, 1.161],
    P.OCHRE,
  );

  // ---------------------------------------------------------------------------
  // Floor drain beneath the sink.
  // The existing floor sits around y=.12, so all of this is kept low and
  // slightly proud of the rubber deck, with a heavy sealed rim.
  // ---------------------------------------------------------------------------

  const drainX = -0.78;
  const drainZ = 0.40;
  const drainY = 0.177;

  box(
    "drainInset",
    [0.39, 0.018, 0.39],
    [drainX, drainY - 0.012, drainZ],
    P.BLACK,
  );

  // Four separate rim plates, with tiny gaps at the corners.
  box("drainRimFront", [0.45, 0.045, 0.055], [drainX, drainY, 0.625], P.STEEL);
  box("drainRimBack", [0.45, 0.045, 0.055], [drainX, drainY, 0.175], P.STEEL);
  box("drainRimLeft", [0.055, 0.045, 0.39], [-1.005, drainY, drainZ], P.STEEL);
  box("drainRimRight", [0.055, 0.045, 0.39], [-0.555, drainY, drainZ], P.STEEL_DARK);

  // Recessed inner rim gives a second, darker step before the grate.
  box(
    "drainInnerFront",
    [0.36, 0.018, 0.028],
    [drainX, drainY + 0.024, 0.585],
    P.STEEL_DARK,
  );
  box(
    "drainInnerBack",
    [0.36, 0.018, 0.028],
    [drainX, drainY + 0.024, 0.215],
    P.STEEL_DARK,
  );
  box(
    "drainInnerLeft",
    [0.028, 0.018, 0.34],
    [-0.965, drainY + 0.024, drainZ],
    P.STEEL_DARK,
  );
  box(
    "drainInnerRight",
    [0.028, 0.018, 0.34],
    [-0.595, drainY + 0.024, drainZ],
    P.STEEL_DARK,
  );

  // Three crossing bars in each direction form a coarse, unmistakable grate.
  for (let i = -1; i <= 1; i++) {
    box(
      "drainGrateBarA",
      [0.034, 0.034, 0.37],
      [drainX + i * 0.115, drainY + 0.042, drainZ],
      P.ALUMINUM,
      { rotation: [0, Math.PI / 8, 0] },
    );
    box(
      "drainGrateBarB",
      [0.034, 0.034, 0.37],
      [drainX + i * 0.115, drainY + 0.047, drainZ],
      P.STEEL_DARK,
      { rotation: [0, -Math.PI / 8, 0] },
    );
  }

  // Four round drain bolts, each with a dark centre slot.
  for (const x of [drainX - 0.175, drainX + 0.175]) {
    for (const z of [drainZ - 0.175, drainZ + 0.175]) {
      cylinder(
        "drainBolt",
        0.026,
        0.032,
        [x, drainY + 0.045, z],
        P.ALUMINUM,
        { segments: 8 },
      );
      box(
        "drainBoltSlot",
        [0.027, 0.006, 0.006],
        [x, drainY + 0.065, z],
        P.BLACK,
        { rotation: [0, Math.PI / 4, 0] },
      );
    }
  }

  // Short diagonal corner braces make the grate feel like a removable service hatch.
  box(
    "drainCornerBraceA",
    [0.12, 0.025, 0.025],
    [drainX - 0.135, drainY + 0.054, drainZ - 0.135],
    P.OCHRE,
    { rotation: [0, Math.PI / 4, 0] },
  );
  box(
    "drainCornerBraceB",
    [0.12, 0.025, 0.025],
    [drainX + 0.135, drainY + 0.054, drainZ + 0.135],
    P.OCHRE,
    { rotation: [0, Math.PI / 4, 0] },
  );
}
    return addFridgeVents;
  })(),
);
