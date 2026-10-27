import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "A stylized Firewatch-inspired arctic research station diorama with a warm cabin, snow berms, antenna mast, solar panels, crates, fuel drums, radio equipment, and a windsock.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const NAVY = "#182b45";
  const DEEP = "#102033";
  const BLUE = "#315477";
  const ICE = "#b9d8e8";
  const SNOW = "#e8f3f4";
  const SNOW2 = "#c8e1e9";
  const SHADOW = "#8eb2c5";
  const WOOD = "#9b5e38";
  const WOOD_DARK = "#663c2b";
  const RED = "#c45147";
  const ORANGE = "#ee8d42";
  const YELLOW = "#f6ca62";
  const BLACK = "#101923";
  const STEEL = "#6e8794";
  const GLASS = "#87c6d4";
  const GREEN = "#587d68";

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
      flat: true,
      name,
      group: "outpost",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    rotation?: [number, number, number],
    segments = 10,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      flat: true,
      name,
      group: "outpost",
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      flat: true,
      name,
      group: "outpost",
    });

  const frontPanel = svg(
    `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="100" fill="#e8f3f4"/>
      <rect x="6" y="6" width="168" height="88" rx="5" fill="none" stroke="#182b45" stroke-width="6"/>
      <path d="M18 74 L53 25 L82 60 L109 38 L162 78" fill="none" stroke="#315477" stroke-width="8"/>
      <circle cx="132" cy="28" r="12" fill="#ee8d42"/>
      <text x="90" y="88" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#182b45">POLAR FIELD UNIT</text>
    </svg>`,
    { size: 256 },
  );

  const warning = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8 L94 90 H6 Z" fill="#ee8d42" stroke="#182b45" stroke-width="7"/>
      <path d="M50 30 V61" stroke="#182b45" stroke-width="9"/>
      <circle cx="50" cy="76" r="5" fill="#182b45"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // Snowy diorama island and graphic shadow patches
  // ---------------------------------------------------------------------------

  box([3.7, 0.18, 3.0], [0, 0.09, 0], SNOW2, undefined, "snowIsland");
  box([3.35, 0.08, 2.65], [0, 0.22, 0], SNOW, undefined, "snowTop");

  const snowMounds: Array<[number, number, number, number, number, number]> = [
    [-1.45, 0.3, -1.0, 0.7, 0.24, 0.5],
    [1.5, 0.3, -0.95, 0.7, 0.22, 0.45],
    [-1.55, 0.28, 0.95, 0.55, 0.2, 0.4],
    [1.45, 0.29, 0.95, 0.6, 0.2, 0.36],
    [0.1, 0.28, 1.2, 0.9, 0.16, 0.3],
  ];
  for (const [x, y, z, sx, sy, sz] of snowMounds) {
    sphere(0.5, [x, y + sy * 0.35, z], SNOW, "snowDrift").mesh.scale.set(
      sx,
      sy,
      sz,
    );
  }

  // angular blue shadow facets in the snow
  box([1.1, 0.012, 0.18], [-1.15, 0.265, 0.15], SHADOW, [0, 0.15, 0], "snowShadow");
  box([0.75, 0.012, 0.16], [1.2, 0.265, 0.28], SHADOW, [0, -0.4, 0], "snowShadow");
  box([0.9, 0.012, 0.12], [0.35, 0.265, -1.12], SHADOW, [0, 0.45, 0], "snowShadow");

  // ---------------------------------------------------------------------------
  // Raised foundation, cabin floor, walls and bold red roof
  // ---------------------------------------------------------------------------

  box([1.72, 0.14, 1.34], [0, 0.39, -0.08], WOOD_DARK, undefined, "foundation");
  for (const x of [-0.72, 0.72]) {
    for (const z of [-0.57, 0.42]) {
      box([0.13, 0.32, 0.13], [x, 0.25, z], WOOD_DARK, undefined, "foundationPost");
    }
  }

  box([1.58, 0.92, 1.18], [0, 0.9, -0.08], WOOD, undefined, "cabinBody");
  box([1.62, 0.08, 1.2], [0, 1.37, -0.08], WOOD_DARK, undefined, "roofBeam");

  // dark horizontal timber courses
  for (const y of [0.56, 0.78, 1.0, 1.22]) {
    box([1.63, 0.025, 1.2], [0, y, -0.08], WOOD_DARK, undefined, "wallTimber");
  }

  // pitched roof as two chunky slabs
  box([1.85, 0.12, 0.93], [-0.42, 1.55, -0.08], RED, [0, 0, -28], "roofLeft");
  box([1.85, 0.12, 0.93], [0.42, 1.55, -0.08], RED, [0, 0, 28], "roofRight");
  box([1.9, 0.1, 0.08], [0, 1.77, -0.08], WOOD_DARK, undefined, "ridgeCap");

  // front door and frame, cabin faces +Z
  box([0.34, 0.63, 0.035], [0, 0.83, 0.525], NAVY, undefined, "frontDoor");
  box([0.42, 0.05, 0.055], [0, 1.17, 0.55], WOOD_DARK, undefined, "doorLintel");
  box([0.05, 0.67, 0.055], [-0.2, 0.83, 0.55], WOOD_DARK, undefined, "doorFrame");
  box([0.05, 0.67, 0.055], [0.2, 0.83, 0.55], WOOD_DARK, undefined, "doorFrame");
  cyl(0.025, 0.04, [0.11, 0.84, 0.575], YELLOW, [90, 0, 0], 8, "doorHandle");

  // front windows, warm interior glow
  for (const x of [-0.53, 0.53]) {
    box([0.36, 0.3, 0.035], [x, 1.02, 0.525], GLASS, undefined, "frontWindow");
    box([0.39, 0.035, 0.05], [x, 1.18, 0.55], WOOD_DARK, undefined, "windowTrim");
    box([0.39, 0.035, 0.05], [x, 0.86, 0.55], WOOD_DARK, undefined, "windowTrim");
    box([0.035, 0.34, 0.05], [x - 0.19, 1.02, 0.55], WOOD_DARK, undefined, "windowTrim");
    box([0.035, 0.34, 0.05], [x + 0.19, 1.02, 0.55], WOOD_DARK, undefined, "windowTrim");
    box([0.025, 0.3, 0.055], [x, 1.02, 0.58], YELLOW, undefined, "windowGlow");
  }

  // side window and side-mounted vent
  box([0.035, 0.38, 0.52], [0.81, 1.02, -0.08], GLASS, undefined, "sideWindow");
  box([0.045, 0.42, 0.58], [0.84, 1.02, -0.08], WOOD_DARK, undefined, "sideWindowFrame");
  box([0.035, 0.36, 0.42], [0.86, 0.72, -0.08], NAVY, undefined, "utilityVent");
  for (let i = 0; i < 5; i++) {
    box([0.02, 0.025, 0.34], [0.89, 0.61 + i * 0.055, -0.08], STEEL, [0, 0, -8], "ventSlat");
  }

  // chimney and snow cap
  cyl(0.09, 0.55, [-0.55, 1.85, -0.17], BLACK, undefined, 8, "chimney");
  box([0.2, 0.08, 0.2], [-0.55, 2.13, -0.17], SNOW, undefined, "chimneySnow");
  cyl(0.12, 0.04, [-0.55, 2.1, -0.17], BLACK, undefined, 8, "chimneyCap");

  // ---------------------------------------------------------------------------
  // Porch, stairs and fuel / supply clutter
  // ---------------------------------------------------------------------------

  box([0.9, 0.09, 0.42], [0, 0.42, 0.73], WOOD_DARK, undefined, "porch");
  box([0.72, 0.09, 0.2], [0, 0.32, 0.91], WOOD, undefined, "porchStep");
  for (const x of [-0.36, 0.36]) {
    box([0.08, 0.62, 0.08], [x, 0.73, 0.77], WOOD_DARK, undefined, "porchPost");
  }
  box([0.9, 0.08, 0.08], [0, 1.05, 0.77], WOOD_DARK, undefined, "porchRail");

  // stacked supply crates
  const crates: Array<[number, number, number, number]> = [
    [-1.22, 0.47, 0.37, 0],
    [-1.22, 0.7, 0.37, 0],
    [-1.22, 0.47, 0.7, 0],
    [1.18, 0.46, 0.48, 0],
    [1.18, 0.68, 0.48, 0],
  ];
  for (const [x, y, z] of crates) {
    box([0.36, 0.2, 0.32], [x, y, z], WOOD, undefined, "supplyCrate");
    box([0.38, 0.025, 0.035], [x, y + 0.1, z + 0.17], WOOD_DARK, undefined, "crateBand");
    box([0.025, 0.2, 0.035], [x, y, z + 0.17], WOOD_DARK, undefined, "crateBand");
  }

  // orange fuel drums
  for (const [x, z] of [
    [-1.45, 0.48],
    [-1.45, 0.75],
    [1.48, 0.55],
  ] as Array<[number, number]>) {
    cyl(0.13, 0.34, [x, 0.52, z], ORANGE, [0, 0, 90], 10, "fuelDrum");
    cyl(0.115, 0.018, [x, 0.52, z - 0.18], BLACK, [0, 0, 90], 10, "drumEnd");
    box([0.025, 0.22, 0.02], [x + 0.13, 0.52, z], YELLOW, [0, 0, 90], "drumStripe");
  }

  // ---------------------------------------------------------------------------
  // Radio mast, dish, beacon and wind sock
  // ---------------------------------------------------------------------------

  const mastX = 1.0;
  cyl(0.035, 2.0, [mastX, 1.25, -0.63], STEEL, undefined, 8, "radioMast");
  cyl(0.05, 0.08, [mastX, 0.29, -0.63], STEEL, undefined, 8, "mastFoot");
  for (const y of [0.72, 1.14, 1.56]) {
    box([0.8, 0.025, 0.025], [mastX, y, -0.63], STEEL, [0, 0, 12], "mastBrace");
    box([0.025, 0.025, 0.8], [mastX, y, -0.63], STEEL, [12, 0, 0], "mastBrace");
  }
  cyl(0.065, 0.05, [mastX, 2.27, -0.63], BLACK, undefined, 8, "antennaTop");
  cyl(0.018, 0.38, [mastX, 2.47, -0.63], STEEL, undefined, 8, "antennaRod");
  sphere(0.055, [mastX, 2.67, -0.63], RED, "radioBeacon");

  // satellite dish, facing up and slightly forward
  cyl(0.06, 0.15, [0.93, 1.72, -0.63], STEEL, undefined, 8, "dishStem");
  b.part(new THREE.SphereGeometry(0.3, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.48), STEEL, {
    at: [0.93, 1.86, -0.63],
    rotation: [-0.55, 0, 0],
    flat: true,
    name: "satelliteDish",
    group: "outpost",
  });
  cyl(0.018, 0.44, [0.93, 2.03, -0.47], BLACK, [0.55, 0, 0], 8, "dishFeed");

  // windsock pole and segmented sock
  cyl(0.025, 1.28, [-0.98, 0.9, -0.7], STEEL, undefined, 8, "windsockPole");
  const sock = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 8 L92 14 L98 20 L92 26 L2 32 Z" fill="#ee8d42" stroke="#182b45" stroke-width="3"/>
      <path d="M25 10 L25 30 M50 12 L50 28 M75 13 L75 27" stroke="#e8f3f4" stroke-width="7"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.82, 0.33), "#ffffff", {
    at: [-1.36, 1.46, -0.7],
    dir: [-1, 0.05, 0],
    axis: "z",
    texture: sock,
    name: "windsock",
    group: "outpost",
  });
  cyl(0.05, 0.05, [-0.98, 1.53, -0.7], RED, [0, 0, 90], 8, "windsockRing");

  // ---------------------------------------------------------------------------
  // Solar array on a separate tripod
  // ---------------------------------------------------------------------------

  for (const [x, z] of [
    [-0.85, 1.0],
    [-0.25, 1.0],
    [-0.85, 1.47],
    [-0.25, 1.47],
  ] as Array<[number, number]>) {
    box([0.5, 0.035, 0.38], [x, 0.78, z], NAVY, [0.28, 0, 0], "solarPanel");
    box([0.46, 0.012, 0.012], [x, 0.8, z], ICE, [0.28, 0, 0], "panelHighlight");
    box([0.012, 0.012, 0.34], [x, 0.8, z], ICE, [0.28, 0, 0], "panelHighlight");
  }
  cyl(0.045, 0.75, [-0.55, 0.52, 1.25], STEEL, undefined, 8, "solarPole");
  box([0.9, 0.06, 0.06], [-0.55, 0.28, 1.25], STEEL, undefined, "solarFoot");
  box([0.06, 0.06, 0.85], [-0.55, 0.28, 1.25], STEEL, undefined, "solarFoot");

  // ---------------------------------------------------------------------------
  // Bold graphic sign and hazard placard
  // ---------------------------------------------------------------------------

  box([0.72, 0.48, 0.045], [0.03, 1.02, 0.585], NAVY, undefined, "signBacking");
  b.part(new THREE.PlaneGeometry(0.64, 0.35), "#ffffff", {
    at: [0.03, 1.02, 0.612],
    dir: [0, 0, 1],
    axis: "z",
    texture: frontPanel,
    name: "researchSign",
    group: "outpost",
  });

  box([0.25, 0.26, 0.04], [1.34, 0.98, 0.59], ORANGE, undefined, "hazardSignBacking");
  b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", {
    at: [1.34, 0.98, 0.617],
    dir: [0, 0, 1],
    axis: "z",
    texture: warning,
    name: "hazardSign",
    group: "outpost",
  });

  // ---------------------------------------------------------------------------
  // Small lived-in details: snowmobile, radio box, antenna cable, flag
  // ---------------------------------------------------------------------------

  // snowmobile silhouette
  box([0.72, 0.18, 0.3], [1.05, 0.43, 1.0], RED, [0, 0, -8], "snowmobileBody");
  box([0.32, 0.13, 0.28], [0.91, 0.59, 1.0], NAVY, [0, 0, -8], "snowmobileSeat");
  box([0.55, 0.035, 0.07], [1.08, 0.23, 1.0], BLACK, [0, 0, -8], "snowmobileSki");
  box([0.06, 0.42, 0.06], [1.27, 0.61, 1.0], STEEL, [0, 0, -12], "snowmobileHandle");
  cyl(0.17, 0.06, [0.79, 0.3, 0.88], BLACK, [90, 0, 0], 10, "snowmobileTrack");
  cyl(0.17, 0.06, [1.3, 0.3, 0.88], BLACK, [90, 0, 0], 10, "snowmobileTrack");

  // external radio cabinet
  box([0.36, 0.55, 0.25], [1.5, 0.7, -0.4], BLUE, undefined, "radioCabinet");
  box([0.27, 0.22, 0.02], [1.5, 0.84, -0.535], BLACK, undefined, "radioFace");
  for (let i = 0; i < 3; i++) {
    cyl(0.025, 0.025, [1.42 + i * 0.08, 0.82, -0.555], YELLOW, [90, 0, 0], 8, "radioKnob");
  }
  box([0.12, 0.02, 0.04], [1.5, 0.96, -0.55], GREEN, undefined, "radioLight");

  // cable from cabin to radio mast
  b.rod([0.69, 1.28, -0.52], [1.0, 1.62, -0.63], 0.012, { color: BLACK, name: "radioCable" });
  b.rod([1.0, 0.65, -0.63], [1.5, 0.72, -0.4], 0.01, { color: BLACK, name: "groundCable" });

  // small blue flag on roof
  cyl(0.018, 0.5, [-0.08, 1.92, 0.05], STEEL, undefined, 8, "flagPole");
  box([0.3, 0.16, 0.025], [0.08, 2.09, 0.05], BLUE, undefined, "flag");
  box([0.08, 0.08, 0.035], [0.0, 2.09, 0.07], SNOW, undefined, "flagMark");

  // a few stylized ice chunks around the footprint
  for (const [x, y, z, sx, sy, sz] of [
    [-1.7, 0.32, -0.2, 0.16, 0.25, 0.12],
    [1.72, 0.32, 0.1, 0.13, 0.3, 0.18],
    [-0.3, 0.3, -1.28, 0.2, 0.18, 0.12],
    [0.65, 0.3, 1.3, 0.14, 0.22, 0.18],
  ] as Array<[number, number, number, number, number, number]>) {
    box([sx, sy, sz], [x, y, z], ICE, [0, 0.2, 0.15], "iceChunk");
  }

  return b.root;
}
