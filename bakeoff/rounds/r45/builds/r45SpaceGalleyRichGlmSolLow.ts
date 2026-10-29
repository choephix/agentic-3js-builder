import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Nostromo Galley",
  "description": "The cramped, worn mess galley of a 1970s commercial towing vessel: a grated deck, a central mess table under a lit dome, a beverage dispenser wall, a prep counter and a hatch, all in worn beige panels with yellow trim and glowing green screens."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  deckPlate: "#4a4f58",
  deckGrate: "#2b2e36",
  deckEdge: "#6a6f78",
  hullBeige: "#b8b09a",
  panelOlive: "#7a7a62",
  panelBrown: "#5c5044",
  trimYellow: "#e7b814",
  trimOrange: "#d97a1e",
  hazardBlack: "#1c1c1c",
  steelPipe: "#8a8d94",
  pipeRust: "#8a5a32",
  machineGrey: "#6d7480",
  tableTop: "#555a64",
  consoleInk: "#22262e",
  seatCushion: "#3c3a45",
  domeRim: "#9aa0a8",
  ventDark: "#3a3f4a",
  cupWhite: "#d8d4c8",
  canisterRed: "#b03a2a",
  screenGreen: "#7dffa0",
  screenAmber: "#ffc247",
  lightWhite: "#eef2ff",
};
const M = {
  deckTop: [0, 0.16, 0] as [number, number, number],
  tableAnchor: [0, 0.16, 0.4] as [number, number, number],
  domeRing: [0, 2.3, 0.4] as [number, number, number],
  backPlane: [0, 1.3, -2.4] as [number, number, number],
  portPlane: [-1.4, 1.3, 0] as [number, number, number],
  starPlane: [1.4, 1.3, 0] as [number, number, number],
  ceilingUnder: [0, 2.4, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // floorDeck
  (() => {
function buildFloorDeck({ b, J, P, M }: Ctx) {
  const C = P as Record<string, string>;
  const deckY = M.deckTop[1];

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name: name ?? "floorDeck.box",
      group: "floorDeck",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 10,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      name: name ?? "floorDeck.cylinder",
      group: "floorDeck",
    });

  const bolt = (x: number, z: number, name: string) =>
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 6), C.hazardBlack, {
      at: [x, deckY + 0.006, z],
      name,
      group: "floorDeck",
    });

  // Six short feet and the dark structural underside. The feet reach exactly to y = 0.
  const feet: [number, number][] = [
    [-1.35, -2.08],
    [0, -2.08],
    [1.35, -2.08],
    [-1.35, 2.08],
    [0, 2.08],
    [1.35, 2.08],
  ];
  feet.forEach(([x, z], i) =>
    box([0.22, 0.08, 0.22], [x, 0.04, z], C.deckGrate, undefined, `floorDeck.foot${i}`),
  );
  box([3.2, 0.08, 4.8], [0, 0.12, 0], C.deckGrate, undefined, "floorDeck.underslab");
  box([3.08, 0.075, 4.68], [0, 0.1575, 0], C.deckPlate, undefined, "floorDeck.walkingPlate");

  // Repeated transverse anti-slip/grating bars, slightly proud of the plate.
  for (let i = 0; i < 19; i++) {
    const z = -2.25 + i * 0.25;
    box([2.92, 0.012, 0.095], [0, 0.166, z], C.deckGrate, undefined, `floorDeck.grate${i}`);
    // Small broken highlights make the bars read as individual worn steel pieces.
    if (i % 3 === 1)
      box([0.34, 0.006, 0.102], [-1.18, 0.175, z], C.deckEdge, undefined, `floorDeck.grateWear${i}`);
  }

  // Heavy perimeter edging, with slightly raised corner caps.
  box([3.2, 0.075, 0.08], [0, 0.205, -2.36], C.deckEdge, undefined, "floorDeck.edgeBack");
  box([3.2, 0.075, 0.08], [0, 0.205, 2.36], C.deckEdge, undefined, "floorDeck.edgeFront");
  box([0.08, 0.075, 4.56], [-1.56, 0.205, 0], C.deckEdge, undefined, "floorDeck.edgePort");
  box([0.08, 0.075, 4.56], [1.56, 0.205, 0], C.deckEdge, undefined, "floorDeck.edgeStarboard");
  for (const x of [-1.5, 1.5]) {
    for (const z of [-2.3, 2.3])
      box([0.13, 0.045, 0.13], [x, 0.26, z], C.deckEdge, undefined, "floorDeck.cornerCap");
  }

  // Front threshold/ramp and alternating 45-degree hazard chevrons.
  box([3.0, 0.045, 0.16], [0, 0.02, 2.49], C.deckEdge, undefined, "floorDeck.frontStep");
  const chevronX = [-1.3, -0.78, -0.26, 0.26, 0.78, 1.3];
  chevronX.forEach((x, i) =>
    box(
      [0.34, 0.018, 0.09],
      [x, 0.235, 2.385],
      i % 2 ? C.hazardBlack : C.trimYellow,
      [0, i % 2 ? -45 : 45, 0],
      `floorDeck.chevron${i}`,
    ),
  );

  // Two square drain grates with cross slats.
  const drain = (x: number, z: number, tag: string) => {
    box([0.28, 0.012, 0.28], [x, 0.178, z], C.ventDark, undefined, `${tag}.plate`);
    for (const d of [-0.09, 0, 0.09]) {
      box([0.025, 0.018, 0.24], [x + d, 0.19, z], C.deckEdge, undefined, `${tag}.x${d}`);
      box([0.24, 0.018, 0.025], [x, 0.192, z + d], C.deckEdge, undefined, `${tag}.z${d}`);
    }
  };
  drain(-0.9, -1.4, "floorDeck.drainPort");
  drain(0.8, 1.3, "floorDeck.drainStarboard");

  // Three deliberately irregular-looking scuff/patch plates.
  box([0.42, 0.008, 0.27], [-1.18, 0.177, 0.72], C.panelBrown, [0, 7, 0], "floorDeck.scuffA");
  box([0.31, 0.008, 0.38], [0.52, 0.178, -1.02], C.panelBrown, [0, -11, 0], "floorDeck.scuffB");
  box([0.48, 0.008, 0.22], [1.05, 0.178, -0.25], C.panelBrown, [0, 4, 0], "floorDeck.scuffC");
  box([0.16, 0.006, 0.025], [-1.18, 0.185, 0.72], C.deckEdge, [0, 7, 0], "floorDeck.scuffSeam");

  // Stanchion sockets beside the table, with raised cleat lugs.
  for (const [x, z, s] of [
    [-0.58, 0.92, 1],
    [0.58, -0.12, -1],
  ] as [number, number, number][]) {
    b.part(new THREE.TorusGeometry(0.06, 0.012, 6, 10), C.steelPipe, {
      at: [x, 0.19, z],
      rotation: [90, 0, 0],
      name: "floorDeck.stanchionRing",
      group: "floorDeck",
    });
    box([0.13, 0.025, 0.035], [x + s * 0.045, 0.225, z], C.steelPipe, [0, s * 12, 0], "floorDeck.cleat");
    cyl(0.018, 0.035, [x - s * 0.04, 0.225, z], C.deckEdge, 8, undefined, "floorDeck.cleatPin");
  }

  // Four prominent hex bolts at the plate joins.
  bolt(-1.42, -2.22, "floorDeck.boltFL");
  bolt(1.42, -2.22, "floorDeck.boltFR");
  bolt(-1.42, 2.22, "floorDeck.boltBL");
  bolt(1.42, 2.22, "floorDeck.boltBR");

  // A few inset seam bars and small inspection studs break up the broad industrial plate.
  for (const x of [-1.05, 0.0, 1.05]) {
    box([0.018, 0.01, 4.38], [x, 0.178, 0], C.panelBrown, undefined, "floorDeck.longSeam");
    for (const z of [-1.9, -0.7, 0.5, 1.7])
      cyl(0.012, 0.01, [x, 0.19, z], C.deckEdge, 6, undefined, "floorDeck.seamRivet");
  }

  // Small dark triangular-looking corner blocks along the front threshold.
  for (const x of [-1.46, 1.46]) {
    box([0.16, 0.022, 0.14], [x, 0.225, 2.28], C.hazardBlack, [0, 45, 0], "floorDeck.thresholdBlock");
    cyl(0.014, 0.012, [x, 0.245, 2.28], C.trimYellow, 6, undefined, "floorDeck.thresholdBolt");
  }

  return b.root;
}
    return buildFloorDeck;
  })(),
  // messTable
  (() => {
function buildMessTable({ b, J, P, M }: Ctx) {
  const A = M.tableAnchor as [number, number, number];
  const Y = A[1];

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name: name ?? "messTable.box",
      group: "messTable",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 12,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      name: name ?? "messTable.cylinder",
      group: "messTable",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, name: name ?? "messTable.rod", group: "messTable" });

  const rim = P.trimYellow;
  const grey = P.machineGrey;
  const dark = P.consoleInk;
  const steel = P.steelPipe;
  const seat = P.seatCushion;
  const table = P.tableTop;
  const edge = P.deckEdge;
  const amber = P.screenAmber;
  const green = P.screenGreen;
  const black = P.hazardBlack;
  const white = P.lightWhite;
  const dome = P.domeRim;
  const red = P.canisterRed;

  // Pedestal: broad foot, heavy shaft, twin yellow collars, and upper flange.
  cyl(0.29, 0.055, [A[0], Y + 0.028, A[2]], grey, 12, "messTable.pedestalFoot");
  cyl(0.245, 0.055, [A[0], Y + 0.057, A[2]], rim, 12, "messTable.pedestalFootTrim");
  cyl(0.22, 0.57, [A[0], Y + 0.34, A[2]], grey, 12, "messTable.pedestal");
  cyl(0.226, 0.035, [A[0], Y + 0.18, A[2]], rim, 12, "messTable.lowerYellowRing");
  cyl(0.226, 0.035, [A[0], Y + 0.59, A[2]], rim, 12, "messTable.upperYellowRing");
  cyl(0.31, 0.06, [A[0], Y + 0.64, A[2]], grey, 12, "messTable.tableFlange");

  // Octagonal top and its raised dark rim.
  cyl(0.51, 0.08, [A[0], Y + 0.70, A[2]], table, 8, "messTable.octagonalTop");
  cyl(0.515, 0.026, [A[0], Y + 0.755, A[2]], edge, 8, "messTable.topEdge");
  cyl(0.445, 0.012, [A[0], Y + 0.772, A[2]], dark, 8, "messTable.consoleDeck");

  // Recessed circular table markings and four small corner fasteners.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    cyl(0.012, 0.008, [A[0] + Math.cos(a) * 0.39, Y + 0.775, A[2] + Math.sin(a) * 0.39], black, 8, "messTable.rivet");
  }

  // Angled console wedge, leaning toward -Z.
  const console = box([0.62, 0.18, 0.30], [0, Y + 0.875, A[2] - 0.09], dark, [-20 * Math.PI / 180, 0, 0], "messTable.consoleWedge");
  box([0.57, 0.018, 0.025], [0, Y + 0.975, A[2] - 0.155], rim, [-20 * Math.PI / 180, 0, 0], "messTable.consoleTopTrim");

  // Three glowing instrument screens mounted on the sloped face.
  const screenXs = [-0.20, 0, 0.20];
  screenXs.forEach((x, i) => {
    box([0.145, 0.105, 0.014], [x, Y + 0.978, A[2] - 0.235], i === 1 ? amber : green, [-20 * Math.PI / 180, 0, 0], `messTable.screen${i}`);
    glow(b.part(new THREE.BoxGeometry(0.115, 0.072, 0.004), i === 1 ? amber : green, {
      at: [x, Y + 0.987, A[2] - 0.248],
      rotation: [-20 * Math.PI / 180, 0, 0],
      name: `messTable.glowingScreen${i}`,
      group: "messTable",
    }), 1.8);
    box([0.152, 0.012, 0.018], [x, Y + 0.925, A[2] - 0.224], black, [-20 * Math.PI / 180, 0, 0], "messTable.screenBezel");
  });

  // Six push buttons in two rows, each with a dark square bezel.
  for (let i = 0; i < 6; i++) {
    const x = -0.22 + (i % 3) * 0.22;
    const z = A[2] - 0.015 - Math.floor(i / 3) * 0.095;
    box([0.047, 0.014, 0.047], [x, Y + 0.795, z], black, undefined, "messTable.buttonBezel");
    cyl(0.016, 0.018, [x, Y + 0.812, z], amber, 8, "messTable.amberButton");
  }

  // Yellow-outline diagnostic plate with dark inset.
  box([0.22, 0.014, 0.11], [0.29, Y + 0.795, A[2] + 0.20], rim, undefined, "messTable.diagramOutline");
  box([0.185, 0.018, 0.075], [0.29, Y + 0.807, A[2] + 0.20], dark, undefined, "messTable.diagramInset");
  for (let i = 0; i < 3; i++)
    rod([0.22 + i * 0.055, Y + 0.818, A[2] + 0.17], [0.34 - i * 0.025, Y + 0.818, A[2] + 0.23], 0.006, amber, "messTable.diagramLine");

  // Four compact radial bench seats.
  const seats = [
    { x: 0, z: 1.23, yaw: 0 },
    { x: 0, z: -0.43, yaw: Math.PI },
    { x: -0.84, z: 0.40, yaw: -Math.PI / 2 },
    { x: 0.84, z: 0.40, yaw: Math.PI / 2 },
  ];
  seats.forEach((s, i) => {
    const sx = s.x, sz = s.z;
    const side = i < 2 ? [0.52, 0.28, 0.42] as [number, number, number] : [0.42, 0.28, 0.52] as [number, number, number];
    box(side, [sx, Y + 0.21, sz], seat, undefined, `messTable.seat${i}`);
    // steel splayed legs
    const lx = side[0] * 0.34, lz = side[2] * 0.34;
    rod([sx - lx, Y + 0.09, sz - lz], [sx - lx * 0.72, Y + 0.01, sz - lz * 0.72], 0.025, steel, "messTable.seatLeg");
    rod([sx + lx, Y + 0.09, sz + lz], [sx + lx * 0.72, Y + 0.01, sz + lz * 0.72], 0.025, steel, "messTable.seatLeg");
    // low reclining back, kept clear of the tabletop
    const bx = sx - Math.sin(s.yaw) * 0.20;
    const bz = sz - Math.cos(s.yaw) * 0.20;
    box(
      side[0] > side[2] ? [0.50, 0.28, 0.075] : [0.075, 0.28, 0.50],
      [bx, Y + 0.48, bz],
      seat,
      [0, s.yaw + (s.yaw === 0 || Math.abs(s.yaw) === Math.PI ? 0.26 : 0), 0],
      `messTable.seatBack${i}`,
    );
    // bright piping strip along the top of each back
    const px = side[0] > side[2] ? 0.45 : 0.06;
    const pz = side[0] > side[2] ? 0.06 : 0.45;
    box([px, 0.025, pz], [bx, Y + 0.635, bz], rim, undefined, "messTable.seatPiping");
  });

  // Dome: lower hemisphere suspended from the ceiling ring.
  const domeGeo = new THREE.SphereGeometry(0.55, 10, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  b.part(domeGeo, dome, { at: [0, 2.30, A[2]], name: "messTable.acrylicDome", group: "messTable" });
  cyl(0.57, 0.055, [0, 2.305, A[2]], rim, 24, "messTable.domeRim");
  cyl(0.51, 0.025, [0, 2.335, A[2]], white, 24, "messTable.domeLight");
  glow(b.part(new THREE.CylinderGeometry(0.47, 0.47, 0.018, 24), white, {
    at: [0, 2.348, A[2]],
    name: "messTable.domeGlow",
    group: "messTable",
  }), 1.5);

  // Six radial armature lugs and eight small light studs around the rim.
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const x = Math.cos(a) * 0.50, z = A[2] + Math.sin(a) * 0.50;
    rod([x * 0.72, 2.35, A[2] + (z - A[2]) * 0.72], [x, 2.35, z], 0.018, steel, "messTable.domeArm");
    cyl(0.028, 0.045, [x, 2.355, z], steel, 8, "messTable.domeLug");
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    cyl(0.014, 0.018, [Math.cos(a) * 0.485, 2.372, A[2] + Math.sin(a) * 0.485], white, 8, "messTable.domeStud");
  }

  // Two ceiling cable whips, slightly asymmetrical and visibly industrial.
  rod([-0.46, 2.34, A[2] - 0.12], [-0.52, 2.61, A[2] - 0.22], 0.009, black, "messTable.cableL");
  rod([0.44, 2.34, A[2] + 0.15], [0.53, 2.60, A[2] + 0.24], 0.009, black, "messTable.cableR");
  cyl(0.018, 0.04, [-0.52, 2.63, A[2] - 0.22], black, 8, "messTable.cableClip");
  cyl(0.018, 0.04, [0.53, 2.62, A[2] + 0.24], black, 8, "messTable.cableClip");

  // Worn red square service decal on the pedestal.
  box([0.102, 0.102, 0.012], [0.225, Y + 0.39, A[2] + 0.205], red, [0, Math.PI / 2, 0], "messTable.wornPedestalDecal");
  box([0.055, 0.012, 0.012], [0.225, Y + 0.39, A[2] + 0.213], black, [0, Math.PI / 2, 0], "messTable.decalMark");
}
    return buildMessTable;
  })(),
  // dispenserWall
  (() => {
function buildDispenserWall({ b, J, P, M }: Ctx) {
  const deck = M.deckTop as [number, number, number];
  const C = (name: string) => P[name] ?? P.hullBeige;
  const y0 = deck[1];
  const zWall = -2.4;
  const front = -2.335;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone: J.body,
      name: name ? `dispenserWall.${name}` : undefined,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name?: string,
    segments = 10,
    dir?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone: J.body,
      dir,
      name: name ? `dispenserWall.${name}` : undefined,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      bone: J.body,
      name: name ? `dispenserWall.${name}` : undefined,
    });

  // Structural back plate and broad modular field.
  box([3.2, 2.34, 0.09], [0, y0 + 1.17, zWall], C("panelBrown"), "backing");
  const panelXs = [-1.27, -0.63, 0.03, 0.69, 1.35];
  const panelWs = [0.60, 0.60, 0.60, 0.60, 0.42];
  for (let i = 0; i < panelXs.length; i++) {
    box([panelWs[i], 1.69, 0.035], [panelXs[i], y0 + 0.92, -2.345], C("hullBeige"), `field${i}`);
    box([0.018, 1.69, 0.012], [panelXs[i] - panelWs[i] / 2, y0 + 0.92, -2.364], C("panelBrown"), `seamL${i}`);
    box([0.018, 1.69, 0.012], [panelXs[i] + panelWs[i] / 2, y0 + 0.92, -2.364], C("panelBrown"), `seamR${i}`);
  }

  // Horizontal recessed seams and industrial stripes.
  box([3.18, 0.034, 0.018], [0, y0 + 0.43, -2.372], C("panelBrown"), "lowerSeam");
  box([3.18, 0.05, 0.025], [0, y0 + 1.74, -2.372], C("trimYellow"), "goldStripe");
  box([3.18, 0.035, 0.022], [0, y0 + 0.44, -2.375], C("panelOlive"), "oliveStripe");
  box([3.18, 0.028, 0.025], [0, y0 + 2.27, -2.365], C("deckEdge"), "topCap");

  // Rivet rows on panel joins.
  for (const x of [-1.57, -0.97, -0.33, 0.33, 0.99, 1.56]) {
    for (const y of [y0 + 0.11, y0 + 0.82, y0 + 1.68, y0 + 2.28]) {
      sphere(0.008, [x, y, -2.382], C("deckEdge"), "rivet");
    }
  }

  // Machine cabinet, projecting into the room.
  box([0.96, 1.08, 0.68], [-0.52, y0 + 0.72, -2.02], C("machineGrey"), "dispenserCabinet");
  box([1.04, 0.10, 0.76], [-0.52, y0 + 0.12, -2.02], C("hazardBlack"), "machinePlinth");
  box([0.78, 0.78, 0.025], [-0.52, y0 + 0.78, -1.665], C("consoleInk"), "darkFace");
  box([0.84, 0.035, 0.05], [-0.52, y0 + 1.28, -1.655], C("deckEdge"), "cabinetTopLip");
  box([0.055, 0.92, 0.028], [-1.00, y0 + 0.72, -1.67], C("trimYellow"), "cabinetLeftTrim");
  box([0.055, 0.92, 0.028], [-0.04, y0 + 0.72, -1.67], C("trimYellow"), "cabinetRightTrim");

  // Machine face inset panels and green data display.
  box([0.30, 0.20, 0.018], [-0.52, y0 + 1.22, -1.645], C("consoleInk"), "dataBezel");
  const data = box([0.24, 0.13, 0.008], [-0.52, y0 + 1.22, -1.632], C("screenGreen"), "dataScreen");
  glow(data, 1.8);
  for (let i = 0; i < 5; i++) {
    box([0.012, 0.07, 0.01], [-0.62 + i * 0.05, y0 + 1.17, -1.625], i % 2 ? C("screenAmber") : C("screenGreen"), "screenBar");
  }

  // Three nozzle bays, spouts, handles and drip tray.
  for (let i = 0; i < 3; i++) {
    const x = -0.78 + i * 0.26;
    box([0.20, 0.22, 0.025], [x, y0 + 0.88, -1.635], C("ventDark"), "nozzleBay");
    cyl(0.026, 0.18, [x, y0 + 0.86, -1.53], C("steelPipe"), "nozzleStem", 8, [0, 0, 1]);
    cyl(0.035, 0.075, [x, y0 + 0.86, -1.43], C("steelPipe"), "nozzleTip", 8, [0, 0, 1]);
    cyl(0.018, 0.08, [x, y0 + 0.99, -1.64], C("trimYellow"), "nozzleButton", 8);
  }
  box([0.76, 0.055, 0.25], [-0.52, y0 + 0.56, -1.56], C("deckEdge"), "dripTray");
  box([0.66, 0.018, 0.18], [-0.52, y0 + 0.60, -1.52], C("ventDark"), "dripInset");
  box([0.76, 0.025, 0.025], [-0.52, y0 + 0.63, -1.405], C("steelPipe"), "trayLip");

  // Indicator tower.
  for (let i = 0; i < 4; i++) {
    const lamp = cyl(
      0.034,
      0.018,
      [-0.13, y0 + 0.68 + i * 0.14, -1.64],
      i === 1 ? C("screenAmber") : C("screenGreen"),
      "indicator",
      10,
      [0, 0, 1],
    );
    glow(lamp, 2);
  }
  box([0.08, 0.62, 0.018], [-0.13, y0 + 0.88, -1.65], C("consoleInk"), "indicatorPanel");

  // Cup shelf beneath machine.
  box([0.95, 0.045, 0.30], [-0.52, y0 + 0.36, -1.84], C("deckEdge"), "cupShelf");
  box([0.94, 0.03, 0.025], [-0.52, y0 + 0.40, -1.68], C("steelPipe"), "shelfRail");
  for (let i = 0; i < 5; i++) {
    const x = -0.84 + i * 0.16;
    cyl(0.05, 0.075, [x, y0 + 0.47, -1.82], C("cupWhite"), "mug", 10);
    cyl(0.038, 0.012, [x, y0 + 0.515, -1.82], C("consoleInk"), "mugOpening", 10);
    b.rod([x + 0.045, y0 + 0.48, -1.82], [x + 0.085, y0 + 0.48, -1.82], 0.008, {
      color: C("cupWhite"),
      bone: J.body,
      name: "dispenserWall.mugHandle",
    });
  }

  // Lockers to starboard of dispenser.
  for (let j = 0; j < 2; j++) {
    const x = 0.34 + j * 0.42;
    box([0.37, 1.62, 0.10], [x, y0 + 1.02, -2.305], C("panelOlive"), `locker${j}`);
    box([0.035, 1.45, 0.035], [x - 0.125, y0 + 1.02, -2.245], C("trimYellow"), "lockerHandle");
    box([0.035, 1.45, 0.035], [x + 0.125, y0 + 1.02, -2.245], C("panelBrown"), "lockerSeam");
    for (let k = 0; k < 4; k++) {
      box([0.22, 0.022, 0.018], [x, y0 + 1.60 + k * 0.055, -2.235], C("ventDark"), "lockerLouvre");
    }
    box([0.17, 0.14, 0.018], [x, y0 + 0.55, -2.235], C("canisterRed"), "lockerStencil");
    box([0.12, 0.012, 0.028], [x, y0 + 0.55, -2.215], C("hazardBlack"), "stencilMark");
  }

  // Three full-height service conduits between lockers and starboard corner.
  for (let i = 0; i < 3; i++) {
    const x = 0.98 + i * 0.16;
    cyl(0.026, 2.18, [x, y0 + 1.09, -2.255], C("steelPipe"), "verticalConduit", 8);
    for (let k = 0; k < 5; k++) {
      cyl(0.041, 0.025, [x, y0 + 0.38 + k * 0.40, -2.255], C("pipeRust"), "conduitClamp", 8);
    }
  }

  // Junction box and warning band.
  box([0.30, 0.30, 0.12], [1.30, y0 + 1.42, -2.26], C("machineGrey"), "junctionBox");
  box([0.31, 0.045, 0.025], [1.30, y0 + 1.43, -2.19], C("trimYellow"), "junctionBand");
  box([0.20, 0.11, 0.025], [1.30, y0 + 1.55, -2.18], C("hazardBlack"), "junctionLabel");
  for (let i = 0; i < 3; i++) {
    box([0.04, 0.015, 0.012], [1.22 + i * 0.07, y0 + 1.55, -2.16], C("trimYellow"), "warningDash");
  }

  // Clipboard-sized pale data panel at the far corner.
  box([0.33, 0.48, 0.035], [1.40, y0 + 0.88, -2.255], C("panelBrown"), "clipboardBacking");
  box([0.27, 0.39, 0.018], [1.40, y0 + 0.88, -2.225], C("cupWhite"), "clipboardFace");
  box([0.17, 0.035, 0.018], [1.40, y0 + 1.03, -2.205], C("screenGreen"), "clipboardHeader");
  for (let i = 0; i < 5; i++) {
    box([0.19, 0.012, 0.008], [1.40, y0 + 0.93 - i * 0.055, -2.204], C("panelBrown"), "clipboardLine");
  }
  cyl(0.045, 0.018, [1.40, y0 + 1.13, -2.20], C("steelPipe"), "clipboardClip", 8, [0, 0, 1]);

  // Small lower service labels and pipe junction details.
  box([1.05, 0.035, 0.025], [0.66, y0 + 0.25, -2.365], C("panelBrown"), "lowerServicePanel");
  for (let i = 0; i < 8; i++) {
    sphere(0.008, [0.16 + i * 0.14, y0 + 0.25, -2.385], C("deckEdge"), "lowerRivet");
  }
  box([0.12, 0.32, 0.025], [-1.48, y0 + 0.78, -2.37], C("trimYellow"), "cornerTrim");
  box([0.12, 0.32, 0.025], [1.52, y0 + 0.78, -2.37], C("trimYellow"), "cornerTrim");
}
    return buildDispenserWall;
  })(),
  // prepCounter
  (() => {
function buildPrepCounter({ b, J, P, M }: Ctx) {
  const B = P.hullBeige;
  const O = P.panelOlive;
  const BR = P.panelBrown;
  const Y = P.trimYellow;
  const BLK = P.hazardBlack;
  const STEEL = P.steelPipe;
  const RUST = P.pipeRust;
  const GREY = P.machineGrey;
  const EDGE = P.deckEdge;
  const WHITE = P.cupWhite;
  const RED = P.canisterRed;
  const AMBER = P.screenAmber;
  const DARK = P.ventDark;
  const LIGHT = P.lightWhite;

  const rootBone = J.body;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    opts: Partial<THREE.Mesh> & { bone?: any; name?: string } = {},
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: opts.bone ?? rootBone,
      name: opts.name,
    });
  };

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    opts: { radial?: number; bone?: any; name?: string; rotation?: [number, number, number] } = {},
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, opts.radial ?? 10),
      color,
      {
        at,
        bone: opts.bone ?? rootBone,
        rotation: opts.rotation,
        name: opts.name,
      },
    );
  };

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone: rootBone,
      name,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, z, radius, { color, bone: rootBone, name, caps: "round" });

  const plate = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) => box(size, at, color, { name });

  // ---------------------------------------------------------------------------
  // Port wall: segmented worn field panels, recessed seams and corner posts.
  // ---------------------------------------------------------------------------

  plate([0.16, 2.34, 0.92], [-1.52, 1.33, -1.94], B, "portWall.panelA");
  plate([0.16, 2.34, 0.92], [-1.52, 1.33, -0.96], B, "portWall.panelB");
  plate([0.16, 2.34, 0.92], [-1.52, 1.33, 0.02], B, "portWall.panelC");
  plate([0.16, 2.34, 0.92], [-1.52, 1.33, 1.00], B, "portWall.panelD");
  plate([0.16, 2.34, 0.92], [-1.52, 1.33, 1.98], B, "portWall.panelE");

  for (const z of [-1.48, -0.49, 0.49, 1.49]) {
    plate([0.022, 2.28, 0.035], [-1.425, 1.33, z], BR, "portWall.recessedSeam");
  }

  plate([0.035, 0.055, 4.78], [-1.405, 1.91, 0], Y, "portWall.yellowBelt");
  plate([0.034, 0.045, 4.76], [-1.406, 0.61, 0], O, "portWall.lowerBelt");

  for (const z of [-2.36, 2.36]) {
    plate([0.11, 2.34, 0.09], [-1.395, 1.33, z], BR, "portWall.cornerPost");
    for (const y of [0.34, 0.72, 1.12, 1.52, 1.90, 2.28]) {
      sphere(0.014, [-1.33, y, z - (z > 0 ? 0.055 : -0.055)], EDGE, "portWall.rivet");
    }
  }

  // Additional small rivet rows across panel joins.
  for (const z of [-1.48, -0.49, 0.49, 1.49]) {
    for (const y of [0.32, 2.32]) {
      for (let i = 0; i < 4; i++) {
        sphere(0.012, [-1.37, y, z - 0.28 + i * 0.19], EDGE, "portWall.joinRivet");
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Main prep counter cabinet, plinth, drawers, pulls and worktop.
  // ---------------------------------------------------------------------------

  plate([0.42, 0.90, 2.82], [-1.345, 0.64, -0.50], GREY, "counter.cabinet");
  plate([0.035, 0.025, 2.82], [-1.115, 0.98, -0.50], EDGE, "counter.topShadow");
  plate([0.04, 0.10, 2.90], [-1.345, 0.18, -0.50], BLK, "counter.kickplate");

  // Two long drawer fronts, deliberately slightly mismatched for a worn industrial look.
  plate([0.028, 0.31, 1.30], [-1.115, 0.48, -1.18], BR, "drawer.lower");
  plate([0.028, 0.31, 1.30], [-1.114, 0.82, -1.18], BR, "drawer.upper");
  plate([0.029, 0.31, 1.30], [-1.115, 0.48, 0.20], BR, "drawer.lower2");
  plate([0.029, 0.31, 1.30], [-1.114, 0.82, 0.20], BR, "drawer.upper2");

  for (const z of [-1.18, 0.20]) {
    rod([-1.08, 0.49, z - 0.38], [-1.08, 0.49, z + 0.38], 0.018, STEEL, "drawer.pullLower");
    rod([-1.08, 0.83, z - 0.38], [-1.08, 0.83, z + 0.38], 0.018, STEEL, "drawer.pullUpper");
    sphere(0.026, [-1.08, 0.49, z - 0.41], STEEL, "pullMount");
    sphere(0.026, [-1.08, 0.49, z + 0.41], STEEL, "pullMount");
    sphere(0.026, [-1.08, 0.83, z - 0.41], STEEL, "pullMount");
    sphere(0.026, [-1.08, 0.83, z + 0.41], STEEL, "pullMount");
  }

  plate([0.52, 0.045, 2.95], [-1.32, 1.115, -0.50], EDGE, "counter.worktop");
  plate([0.05, 0.13, 2.96], [-1.13, 1.19, -0.50], EDGE, "counter.frontLip");
  plate([0.08, 0.13, 2.95], [-1.48, 1.18, -0.50], GREY, "counter.backSplash");

  // Worktop seams and corner fasteners.
  for (const z of [-1.88, -0.22, 0.86]) {
    sphere(0.018, [-1.11, 1.145, z], BLK, "worktopBolt");
  }

  // ---------------------------------------------------------------------------
  // Boiler urn: faceted body, lid, yellow band, handle, spout and pilot lamp.
  // ---------------------------------------------------------------------------

  cyl(0.18, 0.27, [-1.34, 1.29, -1.35], STEEL, { radial: 10, name: "urn.body" });
  cyl(0.192, 0.026, [-1.34, 1.435, -1.35], Y, { radial: 10, name: "urn.yellowBand" });
  cyl(0.135, 0.035, [-1.34, 1.455, -1.35], GREY, { radial: 10, name: "urn.lid" });
  cyl(0.045, 0.038, [-1.34, 1.49, -1.35], STEEL, { radial: 8, name: "urn.knob" });
  rod([-1.51, 1.37, -1.35], [-1.51, 1.58, -1.35], 0.018, STEEL, "urn.handleL");
  rod([-1.17, 1.37, -1.35], [-1.17, 1.58, -1.35], 0.018, STEEL, "urn.handleR");
  rod([-1.51, 1.58, -1.35], [-1.17, 1.58, -1.35], 0.018, STEEL, "urn.handleTop");
  rod([-1.16, 1.34, -1.35], [-1.03, 1.39, -1.35], 0.035, STEEL, "urn.spout");
  cyl(0.035, 0.045, [-1.00, 1.405, -1.35], STEEL, { radial: 8, rotation: [0, 0, Math.PI / 2], name: "urn.spoutTip" });
  cyl(0.028, 0.035, [-1.17, 1.38, -1.18], AMBER, { radial: 8, rotation: [Math.PI / 2, 0, 0], name: "urn.pilot" });
  glow(b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8), AMBER, {
    at: [-1.17, 1.38, -1.155],
    bone: rootBone,
    rotation: [Math.PI / 2, 0, 0],
    name: "urn.pilotGlow",
  }), 1.5);

  // Tray stack.
  for (let i = 0; i < 2; i++) {
    cyl(0.17, 0.018, [-1.34, 1.145 + i * 0.026, -0.78], WHITE, {
      radial: 12,
      name: "tray.plate",
    });
    cyl(0.125, 0.008, [-1.34, 1.16 + i * 0.026, -0.78], EDGE, {
      radial: 12,
      name: "tray.rim",
    });
  }

  // Two squeeze bottles with caps.
  for (const z of [-0.45, -0.16]) {
    cyl(0.065, 0.18, [-1.34, 1.25, z], RED, { radial: 8, name: "squeezeBottle" });
    cyl(0.038, 0.045, [-1.34, 1.365, z], WHITE, { radial: 8, name: "squeezeCap" });
    plate([0.012, 0.055, 0.085], [-1.265, 1.27, z], Y, "bottleLabel");
  }

  // ---------------------------------------------------------------------------
  // Overhead cabinet and louvres.
  // ---------------------------------------------------------------------------

  plate([0.43, 0.52, 2.42], [-1.385, 1.94, -0.48], O, "overheadCabinet");
  plate([0.035, 0.035, 2.42], [-1.145, 1.70, -0.48], BR, "overheadBottomSeam");
  plate([0.04, 0.06, 2.47], [-1.15, 2.20, -0.48], Y, "overheadTopTrim");

  for (const z of [-1.28, -0.48, 0.32]) {
    plate([0.035, 0.34, 0.035], [-1.145, 1.94, z], Y, "cabinetHandle");
    sphere(0.018, [-1.11, 1.94, z - 0.13], STEEL, "handleRivet");
    sphere(0.018, [-1.11, 1.94, z + 0.13], STEEL, "handleRivet");
  }

  // Dark louvre strips on the cabinet's lower front.
  for (let i = 0; i < 6; i++) {
    plate([0.018, 0.025, 2.10], [-1.125, 1.77 + i * 0.027, -0.48], DARK, "cabinetLouvre");
  }

  // ---------------------------------------------------------------------------
  // Mug rail and six hanging mugs with simplified angular handles.
  // ---------------------------------------------------------------------------

  rod([-1.13, 1.59, -1.70], [-1.13, 1.59, 0.75], 0.023, STEEL, "mugRail");
  for (let i = 0; i < 6; i++) {
    const z = -1.56 + i * 0.43;
    rod([-1.13, 1.56, z], [-1.13, 1.45, z], 0.012, STEEL, "mugHook");
    cyl(0.052, 0.105, [-1.13, 1.39, z], WHITE, { radial: 8, name: "hangingMug" });
    cyl(0.042, 0.008, [-1.13, 1.445, z], DARK, { radial: 8, name: "mugLip" });
    // Handles face inward toward the wall.
    rod([-1.08, 1.40, z], [-1.02, 1.40, z], 0.012, WHITE, "mugHandle");
    rod([-1.02, 1.40, z], [-1.02, 1.34, z], 0.012, WHITE, "mugHandle");
    rod([-1.02, 1.34, z], [-1.08, 1.34, z], 0.012, WHITE, "mugHandle");
  }

  // ---------------------------------------------------------------------------
  // Tall storage rack toward the front of the port wall.
  // ---------------------------------------------------------------------------

  for (const z of [1.25, 2.18]) {
    rod([-1.47, 0.22, z], [-1.47, 1.72, z], 0.026, STEEL, "rack.upright");
    cyl(0.042, 0.035, [-1.47, 0.22, z], EDGE, { radial: 8, name: "rack.foot" });
  }

  for (const y of [0.55, 1.02, 1.49]) {
    plate([0.32, 0.035, 1.02], [-1.32, y, 1.715], EDGE, "rack.shelf");
    plate([0.035, 0.10, 1.04], [-1.15, y + 0.05, 1.715], BR, "rack.shelfLip");
  }

  // Four red canisters distributed across the shelves.
  const cans: [number, number][] = [
    [0.65, 1.49],
    [0.98, 1.49],
    [0.65, 1.02],
    [0.98, 1.02],
  ];
  for (const [y, z] of cans) {
    cyl(0.075, 0.23, [-1.31, y + 0.13, z], RED, { radial: 8, name: "rack.canister" });
    cyl(0.052, 0.025, [-1.31, y + 0.255, z], STEEL, { radial: 8, name: "canisterCap" });
    plate([0.012, 0.075, 0.09], [-1.225, y + 0.13, z], Y, "canisterStripe");
  }

  // White storage box on the highest shelf.
  plate([0.18, 0.20, 0.30], [-1.30, 1.62, 1.72], WHITE, "rack.whiteBox");
  plate([0.012, 0.08, 0.24], [-1.205, 1.62, 1.72], Y, "rack.whiteBoxLabel");

  // Base hazard plate with alternating diagonal bars.
  plate([0.035, 0.28, 0.88], [-1.105, 0.35, 1.72], BLK, "rack.hazardBase");
  for (let i = 0; i < 5; i++) {
    const z = 1.34 + i * 0.19;
    const bar = box([0.012, 0.24, 0.07], [-1.08, 0.35, z], Y, {
      name: "rack.hazardChevron",
    });
    bar.mesh.rotation.y = i % 2 === 0 ? -0.62 : 0.62;
  }

  // Small hooks on the rack's side.
  for (const y of [0.62, 1.10, 1.58]) {
    rod([-1.14, y, 1.18], [-1.02, y, 1.18], 0.018, STEEL, "rack.hook");
    sphere(0.026, [-1.02, y, 1.18], STEEL, "rack.hookEnd");
  }

  // ---------------------------------------------------------------------------
  // Wall lamp: housing, yellow guard, bright rectangular emitter.
  // ---------------------------------------------------------------------------

  plate([0.10, 0.30, 0.32], [-1.43, 1.53, 1.96], GREY, "wallLamp.housing");
  plate([0.025, 0.19, 0.23], [-1.365, 1.53, 1.96], Y, "wallLamp.guard");
  const lamp = b.part(new THREE.BoxGeometry(0.012, 0.13, 0.20), LIGHT, {
    at: [-1.345, 1.53, 1.96],
    bone: rootBone,
    name: "wallLamp.glowStrip",
  });
  glow(lamp, 1.8);
  sphere(0.018, [-1.36, 1.68, 1.96], STEEL, "wallLamp.rivet");
  sphere(0.018, [-1.36, 1.38, 1.96], STEEL, "wallLamp.rivet");

  // ---------------------------------------------------------------------------
  // Exposed pipe details and rust collars along the wall/counter junction.
  // ---------------------------------------------------------------------------

  rod([-1.47, 0.22, -2.12], [-1.47, 1.62, -2.12], 0.025, STEEL, "servicePipe");
  rod([-1.47, 0.22, -2.02], [-1.47, 1.62, -2.02], 0.020, STEEL, "servicePipe");
  for (const y of [0.46, 0.86, 1.26]) {
    cyl(0.038, 0.055, [-1.47, y, -2.12], RUST, {
      radial: 8,
      rotation: [0, 0, Math.PI / 2],
      name: "rustClamp",
    });
    cyl(0.033, 0.055, [-1.47, y, -2.02], RUST, {
      radial: 8,
      rotation: [0, 0, Math.PI / 2],
      name: "rustClamp",
    });
  }

  // A few deliberate worn patches on the beige wall.
  plate([0.018, 0.12, 0.20], [-1.405, 1.22, -1.70], BR, "wallWearPatch");
  plate([0.018, 0.08, 0.31], [-1.404, 0.88, 0.88], BR, "wallWearPatch");
  plate([0.018, 0.16, 0.12], [-1.404, 2.08, 1.28], O, "wallWearPatch");

  // Small overhead suspension bolts to make the cabinet visibly attached.
  for (const z of [-1.55, -0.48, 0.59]) {
    cyl(0.025, 0.06, [-1.40, 2.27, z], STEEL, {
      radial: 8,
      name: "cabinetHanger",
    });
  }
}
    return buildPrepCounter;
  })(),
  // hatchWall
  (() => {
function buildHatchWall({ b, J, P, M }: any) {
  const C = P;
  const wallX = 1.585;
  const faceX = 1.505;
  const top = 2.5;
  const floor = 0.16;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    opts: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone: J.body,
      name: `hatchWall${name}`,
      ...opts,
    });

  const cyl = (
    radius: number,
    length: number,
    at: [number, number, number],
    color: string,
    name: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, length, segments, 1),
      color,
      {
        at,
        dir,
        bone: J.body,
        name: `hatchWall${name}`,
      },
    );

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, z, radius, { bone: J.body, color, name: `hatchWall${name}` });

  const rivet = (z: number, y: number, name: string, x = 1.525) =>
    b.part(new THREE.SphereGeometry(0.018, 7, 5), C.deckEdge, {
      at: [x, y, z],
      bone: J.body,
      name: `hatchWall${name}`,
    });

  // Main starboard bulkhead, broken into deliberately mismatched industrial panels.
  box([0.13, 2.34, 1.02], [1.535, 1.33, -1.89], C.hullBeige, "PanelBack");
  box([0.13, 2.34, 1.02], [1.535, 1.33, -0.84], C.panelOlive, "PanelMid");
  box([0.13, 2.34, 0.93], [1.535, 1.33, 1.79], C.hullBeige, "PanelFront");

  // Recessed vertical seams and end posts.
  for (const z of [-1.405, -0.32, 1.31, 2.285]) {
    box([0.025, 2.27, 0.035], [1.455, 1.335, z], C.panelBrown, "VerticalSeam");
  }
  box([0.025, 2.3, 0.09], [1.45, 1.33, -2.34], C.panelBrown, "BackCornerPost");
  box([0.025, 2.3, 0.09], [1.45, 1.33, 2.34], C.panelBrown, "FrontCornerPost");

  // Horizontal trim, with a darker shadow seam below it.
  box([0.17, 0.055, 4.7], [1.49, 1.90, 0], C.trimYellow, "GoldBelt");
  box([0.18, 0.025, 4.68], [1.475, 1.845, 0], C.panelBrown, "BeltShadow");
  box([0.16, 0.035, 4.62], [1.485, 0.62, 0], C.panelBrown, "LowerBelt");

  // Rivet rows across panel joins.
  for (const z of [-2.28, -1.42, -0.35, 1.30, 2.28]) {
    for (const y of [0.34, 1.04, 1.76, 2.34]) rivet(z, y, "Rivet");
  }

  // Entry hatch surround, centered on z=1.1. Deep side cheeks make the frame project toward the room.
  const hz = 1.1;
  box([0.30, 1.64, 0.15], [1.35, 1.26, 0.60], C.machineGrey, "HatchJambRear");
  box([0.30, 1.64, 0.15], [1.35, 1.26, 1.60], C.machineGrey, "HatchJambFront");
  box([0.30, 0.16, 0.85], [1.35, 2.02, hz], C.machineGrey, "HatchHeader");
  box([0.30, 0.16, 0.85], [1.35, 0.50, hz], C.machineGrey, "HatchSill");

  // Yellow inner rim and black recessed shadow.
  box([0.035, 1.37, 0.055], [1.185, 1.25, 0.69], C.trimYellow, "HatchGoldRear");
  box([0.035, 1.37, 0.055], [1.185, 1.25, 1.51], C.trimYellow, "HatchGoldFront");
  box([0.035, 0.055, 0.78], [1.185, 1.94, hz], C.trimYellow, "HatchGoldTop");
  box([0.035, 0.055, 0.78], [1.185, 0.56, hz], C.trimYellow, "HatchGoldBottom");
  box([0.07, 1.18, 0.74], [1.185, 1.27, hz], C.hazardBlack, "HatchRecess");
  box([0.09, 1.04, 0.66], [1.14, 1.27, hz], C.panelOlive, "HatchDoor");

  // Door panel ribs and warning chevrons on both jambs.
  for (const z of [0.63, 1.57]) {
    for (let i = 0; i < 5; i++) {
      const y = 0.72 + i * 0.27;
      box([0.025, 0.14, 0.035], [1.115, y, z], i % 2 ? C.hazardBlack : C.trimYellow, "HatchChevron");
    }
  }

  // Large wheel latch: axle points through the wall, spokes lie in the YZ plane.
  cyl(0.13, 0.08, [1.07, 1.25, 1.10], C.steelPipe, "WheelHub", [1, 0, 0], 12);
  cyl(0.18, 0.035, [1.02, 1.25, 1.10], C.steelPipe, "WheelOuter", [1, 0, 0], 12);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    rod(
      [1.00, 1.25 + Math.sin(a) * 0.025, 1.10 + Math.cos(a) * 0.025],
      [1.00, 1.25 + Math.sin(a) * 0.145, 1.10 + Math.cos(a) * 0.145],
      0.018,
      C.steelPipe,
      "WheelSpoke",
    );
  }
  cyl(0.045, 0.10, [1.00, 1.25, 1.10], C.pipeRust, "WheelCenter", [1, 0, 0], 8);

  // Status lamp and stencil beside the latch.
  cyl(0.045, 0.018, [1.00, 1.76, 1.10], C.screenGreen, "StatusLamp", [1, 0, 0], 10);
  box([0.025, 0.16, 0.27], [1.00, 1.43, 1.39], C.hazardBlack, "StencilBacking");
  box([0.012, 0.11, 0.21], [0.98, 1.43, 1.39], C.cupWhite, "StencilPlate");
  box([0.016, 0.012, 0.13], [0.965, 1.48, 1.39], C.canisterRed, "StencilMark");

  // Twin service pipes across the upper wall.
  for (const y of [2.02, 2.13]) {
    rod([1.38, y, -2.18], [1.38, y, 2.18], 0.035, C.steelPipe, "UpperPipe");
    for (let z = -2; z <= 2; z += 0.5)
      box([0.13, 0.16, 0.045], [1.43, y, z], C.panelBrown, "PipeClamp");
  }

  // Rust hand valve and T junction toward the forward end.
  rod([1.38, 2.075, 0.80], [1.38, 1.74, 0.80], 0.035, C.pipeRust, "ValveStem");
  cyl(0.11, 0.035, [1.30, 1.74, 0.80], C.pipeRust, "ValveWheel", [1, 0, 0], 10);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    rod(
      [1.27, 1.74 + Math.sin(a) * 0.025, 0.80 + Math.cos(a) * 0.025],
      [1.27, 1.74 + Math.sin(a) * 0.09, 0.80 + Math.cos(a) * 0.09],
      0.012,
      C.pipeRust,
      "ValveSpoke",
    );
  }

  // First-aid box and raised red cross.
  box([0.07, 0.34, 0.42], [1.37, 1.40, 0.18], C.cupWhite, "FirstAidBox");
  box([0.025, 0.19, 0.055], [1.325, 1.40, 0.18], C.canisterRed, "FirstAidCrossV");
  box([0.025, 0.055, 0.19], [1.325, 1.40, 0.18], C.canisterRed, "FirstAidCrossH");
  box([0.04, 0.18, 0.50], [1.43, 1.06, -0.15], C.panelBrown, "MapHolder");
  box([0.018, 0.13, 0.42], [1.405, 1.07, -0.15], C.cupWhite, "MapSheet");

  // Back-corner tool rack.
  box([0.08, 1.04, 0.08], [1.35, 0.68, -2.02], C.ventDark, "ToolRackPost");
  box([0.08, 0.06, 0.48], [1.34, 0.34, -2.02], C.deckEdge, "ToolRackFoot");
  box([0.08, 0.06, 0.48], [1.34, 1.05, -2.02], C.deckEdge, "ToolRackTop");
  for (const z of [-2.17, -1.94])
    rod([1.28, 0.52, z], [1.28, 0.88, z], 0.018, C.deckEdge, "ToolHook");
  rod([1.25, 0.42, -2.13], [1.25, 1.04, -2.13], 0.025, C.steelPipe, "Wrench");
  rod([1.22, 0.43, -1.91], [1.22, 1.12, -1.91], 0.026, C.pipeRust, "PryBar");
  box([1.19, 0.14, 0.42], [1.18, 1.22, -2.02], C.hazardBlack, "ToolShadow");

  // Wall lamp above the hatch, with a projecting housing and emissive-looking flat strip.
  box([0.18, 0.16, 0.34], [1.37, 2.31, 1.10], C.machineGrey, "LampHousing");
  box([0.035, 0.09, 0.27], [1.255, 2.31, 1.10], C.lightWhite, "LampGlow");
  box([0.025, 0.025, 0.32], [1.23, 2.23, 1.10], C.trimYellow, "LampLowerTrim");

  // Small lower service plates, bolts, and corner wear details.
  for (const z of [-1.55, -0.95, 1.92]) {
    box([0.035, 0.20, 0.26], [1.47, 0.31, z], C.panelBrown, "LowerServicePatch");
    for (const y of [0.23, 0.39]) rivet(z - 0.10, y, "ServiceRivet");
  }
}
    return buildHatchWall;
  })(),
  // ceiling
  (() => {
function buildCeiling({ b, J, P, M }: any) {
  const deck = P.deckPlate ?? "#4a4f58";
  const grate = P.deckGrate ?? "#2b2e36";
  const edge = P.deckEdge ?? "#6a6f78";
  const beige = P.hullBeige ?? "#b8b09a";
  const olive = P.panelOlive ?? "#7a7a62";
  const brown = P.panelBrown ?? "#5c5044";
  const yellow = P.trimYellow ?? "#e7b814";
  const orange = P.trimOrange ?? "#d97a1e";
  const black = P.hazardBlack ?? "#1c1c1c";
  const pipe = P.steelPipe ?? "#8a8d94";
  const rust = P.pipeRust ?? "#8a5a32";
  const machine = P.machineGrey ?? "#6d7480";
  const vent = P.ventDark ?? "#3a3f4a";
  const white = P.lightWhite ?? "#eef2ff";
  const green = P.screenGreen ?? "#7dffa0";

  const at = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];
  const box = (
    size: [number, number, number],
    p: [number, number, number],
    color: string,
    name?: string,
  ) => b.part(new THREE.BoxGeometry(...size), color, { at: p, name: name ?? "ceilingBox" });

  const cyl = (
    r: number,
    h: number,
    p: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 10), color, {
      at: p,
      dir,
      name: name ?? "ceilingCylinder",
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    r: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, r, { color, name: name ?? "ceilingRod", caps: "round" });

  const rivetRow = (a: [number, number, number], c: [number, number, number], count: number) => {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const p: [number, number, number] = [
        a[0] + (c[0] - a[0]) * t,
        a[1] + (c[1] - a[1]) * t,
        a[2] + (c[2] - a[2]) * t,
      ];
      cyl(0.018, 0.012, p, edge, [0, 1, 0], "ceilingRivet");
    }
  };

  // Thin upper closure: the top is intentionally plain and heavy.
  box([3.2, 0.12, 4.8], at(0, 2.79, 0), deck, "ceilingTopPlate");

  // Dark infill bays between the structural members.
  for (const x of [-1.2, -0.4, 0.4, 1.2]) {
    box([0.68, 0.045, 4.62], at(x, 2.405, 0), brown, "ceilingInfill");
    box([0.68, 0.018, 4.56], at(x, 2.432, 0), olive, "ceilingInfillInner");
  }

  // Three deep longitudinal beams, with bright lower edge rails and riveted faces.
  for (const x of [-0.8, 0, 0.8]) {
    box([0.20, 0.20, 4.8], at(x, 2.52, 0), deck, "longitudinalBeam");
    box([0.035, 0.035, 4.72], at(x - 0.085, 2.405, 0), yellow, "beamYellowEdge");
    box([0.035, 0.035, 4.72], at(x + 0.085, 2.405, 0), yellow, "beamYellowEdge");
    rivetRow(at(x - 0.095, 2.57, -2.22), at(x - 0.095, 2.57, 2.22), 12);
    rivetRow(at(x + 0.095, 2.57, -2.22), at(x + 0.095, 2.57, 2.22), 12);
  }

  // Cross beams make the ceiling unmistakably modular.
  for (const z of [-1.2, 1.2]) {
    box([3.2, 0.20, 0.20], at(0, 2.52, z), deck, "crossBeam");
    box([3.08, 0.035, 0.035], at(0, 2.405, z - 0.085), yellow, "crossBeamTrim");
    box([3.08, 0.035, 0.035], at(0, 2.405, z + 0.085), yellow, "crossBeamTrim");
    rivetRow(at(-1.42, 2.57, z - 0.095), at(1.42, 2.57, z - 0.095), 12);
    rivetRow(at(-1.42, 2.57, z + 0.095), at(1.42, 2.57, z + 0.095), 12);
  }

  // Fat service conduits follow the ceiling grid.
  for (const x of [-1.15, 1.15]) {
    rod(at(x, 2.67, -2.18), at(x, 2.67, 2.18), 0.06, pipe, "fatConduit");
    for (const z of [-1.8, -0.9, 0, 0.9, 1.8]) {
      cyl(0.073, 0.045, at(x, 2.67, z), rust, [0, 0, 1], "conduitRustCollar");
    }
  }

  // A sagging black cable crossing the central bay.
  rod(at(-1.0, 2.58, -1.45), at(-0.35, 2.47, -0.75), 0.014, black, "cableSag");
  rod(at(-0.35, 2.47, -0.75), at(0.35, 2.47, -0.75), 0.014, black, "cableSag");
  rod(at(0.35, 2.47, -0.75), at(1.0, 2.58, -1.45), 0.014, black, "cableSag");

  // Two recessed ventilation grilles, each with a dark plate and cross slats.
  for (const [x, z] of [[-1.18, 0.75], [1.18, 0.75]] as [number, number][]) {
    box([0.52, 0.025, 0.30], at(x, 2.405, z), vent, "ceilingVent");
    for (const dx of [-0.18, -0.06, 0.06, 0.18])
      box([0.025, 0.018, 0.26], at(x + dx, 2.425, z), grate, "ventSlat");
    box([0.46, 0.018, 0.025], at(x, 2.426, z), grate, "ventCrossSlat");
  }

  // Four industrial light troughs in the open ceiling bays.
  const lights: any[] = [];
  for (const [x, z] of [[-0.4, -1.65], [0.4, -1.65], [-1.2, 1.65], [1.2, 1.65]] as [number, number][]) {
    box([0.78, 0.055, 0.16], at(x, 2.405, z), machine, "lightHousing");
    box([0.68, 0.012, 0.105], at(x, 2.438, z), yellow, "lightYellowRim");
    const lamp = box([0.58, 0.012, 0.075], at(x, 2.448, z), white, "glowingLightStrip");
    lights.push(lamp);
    glow(lamp, 1.8);
    for (const dz of [-0.07, 0.07]) cyl(0.014, 0.012, at(x, 2.45, z + dz), edge, [0, 1, 0], "lightFastener");
  }

  // Central ceiling plate supporting the table dome.
  box([1.45, 0.045, 1.45], at(0, 2.405, 0.4), machine, "domeCeilingPlate");
  cyl(0.64, 0.035, at(0, 2.445, 0.4), yellow, [0, 1, 0], "domeCollarBase");
  cyl(0.49, 0.055, at(0, 2.47, 0.4), vent, [0, 1, 0], "domeOpenThroat");

  // A visibly segmented yellow collar, with six radial armature brackets.
  const ring = b.part(new THREE.TorusGeometry(0.60, 0.035, 6, 18), yellow, {
    at: at(0, 2.475, 0.4),
    rotation: [0, 0, 0],
    name: "domeYellowCollar",
  });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = 0 + Math.sin(a) * 0.47;
    const z = 0.4 + Math.cos(a) * 0.47;
    rod(at(Math.sin(a) * 0.16, 2.475, 0.4 + Math.cos(a) * 0.16), at(x, 2.475, z), 0.018, pipe, "domeRadialArm");
    cyl(0.035, 0.055, at(x, 2.475, z), pipe, [0, 1, 0], "domeMountLug");
  }

  // Eight small pale studs around the rim.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    cyl(
      0.018,
      0.018,
      at(Math.sin(a) * 0.56, 2.515, 0.4 + Math.cos(a) * 0.56),
      white,
      [0, 1, 0],
      "domeLightStud",
    );
  }

  // Small hazard blocks at structural beam intersections.
  for (const x of [-0.8, 0.8]) {
    for (const z of [-1.2, 1.2]) {
      box([0.13, 0.035, 0.13], at(x, 2.635, z), black, "beamJoinHazard");
      box([0.045, 0.04, 0.14], at(x - 0.04, 2.66, z), yellow, "beamJoinYellow");
    }
  }

  // A few olive inspection patches break up the otherwise repetitive ceiling.
  box([0.42, 0.018, 0.16], at(-1.35, 2.61, -0.35), olive, "inspectionPatch");
  box([0.18, 0.018, 0.38], at(1.35, 2.61, 0.35), olive, "inspectionPatch");
}
    return buildCeiling;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "nostromoGalley" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
