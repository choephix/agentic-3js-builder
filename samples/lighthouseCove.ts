import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { paint } from "../src/paint";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Lighthouse Cove",
  builtBy: "Gemini 3.8 Flash",
  description:
    "A tabletop coastal diorama 1.2 m across on an octagonal wooden plinth: a granite islet crowned by a red-and-white banded lighthouse and lantern room, keeper's cottage with slate roof and chimney, timber jetty with a moored rowboat, layered sea with turquoise shallows and foamy surf, wheeling gulls, seaside flora, and navigation buoy.",
};

// --- Palette ---
const BASE_WOOD = "#251b14";
const BASE_TRIM = "#18110c";
const ROCK_DARK = "#424548";
const ROCK_MID = "#5a5e63";
const ROCK_LIGHT = "#74787d";
const TURF_TOP = "#4d7335";
const TURF_SIDE = "#3b5828";
const PATH_GRAVEL = "#827a6e";

const TOWER_WHITE = "#edece4";
const TOWER_RED = "#b8261e";
const TOWER_TRIM = "#1f2226";
const ROOF_COPPER = "#286650";
const ROOF_SLATE = "#35424b";
const COTTAGE_WALL = "#e2dfd5";
const COTTAGE_WOOD = "#452e1f";
const COTTAGE_STONE = "#56585c";
const GLASS_CYAN = "#9be0e6";

const JETTY_WOOD = "#57483d";
const JETTY_WET = "#332c25";
const BOAT_HULL = "#1a3a60";
const BOAT_SEATS = "#9e744c";

const SEA_DEEP = "#184563";
const SEA_SHALLOW = "#25778f";
const FOAM_WHITE = "#e2f0f5";
const BUOY_RED = "#cf3022";
const BUOY_YELLOW = "#e0a331";

export default function build() {
  const b = createBuilder({ name: "lighthouseCove", paintSize: 1024 });

  // --- SKELETON ---
  const root = b.joint("root", { at: [0, 0, 0] });

  // Lantern housing core (turnable mechanism)
  const lanternLens = b.joint("lanternLens", {
    parent: root,
    at: [-0.15, 0.77, -0.1],
    dir: [0.8, 0, 0.6],
  });

  // Bobbing rowboat on the water
  const rowboat = b.joint("rowboat", {
    parent: root,
    at: [0.38, 0.105, 0.28],
    dir: [-0.9, 0, 0.4],
  });

  // Floating channel buoy
  const buoy = b.joint("buoy", {
    parent: root,
    at: [0.42, 0.105, -0.32],
    dir: [0.08, 0.98, 0.12],
  });

  // Wheeling gulls in flight
  const gull1 = b.joint("gull1", {
    parent: root,
    at: [-0.32, 0.78, 0.18],
    dir: [0.8, 0.05, -0.6],
  });
  const gull1WingL = b.joint("gull1WingL", {
    parent: gull1,
    at: [-0.32, 0.78, 0.18],
    dir: [-0.6, 0.4, 0.2],
  });
  const gull1WingR = b.joint("gull1WingR", {
    parent: gull1,
    at: [-0.32, 0.78, 0.18],
    dir: [0.6, 0.4, -0.2],
  });

  const gull2 = b.joint("gull2", {
    parent: root,
    at: [0.12, 0.82, -0.34],
    dir: [-0.7, -0.05, 0.7],
  });

  // =========================================================================
  // 1. DIORAMA BASE & PLINTH (y = 0 to 0.08, ~1.18m across)
  // =========================================================================
  const plinthOutline: [number, number][] = [];
  const plinthR = 0.58;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    plinthOutline.push([Math.cos(a) * plinthR, Math.sin(a) * plinthR]);
  }

  // Base tier 1 (Floor level y=0 to 0.04)
  b.extrude(plinthOutline, {
    at: [0, 0.02, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.04,
    bevel: 0.008,
    color: BASE_WOOD,
    bone: root,
    group: "plinth",
  });

  // Base tier 2 (y=0.04 to 0.075) with trim edge
  const plinthOutline2 = plinthOutline.map(([x, z]) => [x * 0.97, z * 0.97] as [number, number]);
  b.extrude(plinthOutline2, {
    at: [0, 0.0575, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.035,
    bevel: 0.005,
    color: BASE_TRIM,
    bone: root,
    group: "plinth",
  });

  // Brass Plaque on the front of the plinth (+Z facing)
  const plaqueGeom = new THREE.BoxGeometry(0.14, 0.022, 0.006);
  b.part(plaqueGeom, "#c49a45", {
    bone: root,
    at: [0, 0.038, 0.575],
    rotation: [0, 0, 0],
    group: "plinth",
  });

  // =========================================================================
  // 2. STYLIZED SEA & SHORE FOAM
  // =========================================================================
  const seaWaterOutline = plinthOutline.map(([x, z]) => [x * 0.955, z * 0.955] as [number, number]);

  // Custom water paint: depth gradient + surf rim
  const seaPaint = paint((p) => {
    const dx = p.x - -0.1;
    const dz = p.z - 0.0;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.28) return FOAM_WHITE;
    if (dist < 0.38) return SEA_SHALLOW;
    return SEA_DEEP;
  });

  b.extrude(seaWaterOutline, {
    at: [0, 0.085, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.02,
    color: seaPaint,
    bone: root,
    group: "sea",
  });

  // Organic wave ripple crests
  const waveGeoms: THREE.BufferGeometry[] = [];
  for (let r = 0.29; r <= 0.44; r += 0.05) {
    const waveRing = new THREE.TorusGeometry(r, 0.005, 3, 20);
    waveRing.rotateX(Math.PI / 2);
    waveRing.translate(-0.1, 0.096, 0.0);
    waveGeoms.push(waveRing);
  }
  b.part(mergeGeometries(waveGeoms), FOAM_WHITE, {
    bone: root,
    at: [0, 0, 0],
    group: "sea",
  });

  // =========================================================================
  // 3. ROCKY GRANITE ISLET & CLIFF FORMATIONS
  // =========================================================================
  const isletBaseOutline: [number, number][] = [
    [-0.42, -0.32],
    [-0.38, -0.15],
    [-0.45, 0.12],
    [-0.32, 0.28],
    [-0.12, 0.36],
    [0.08, 0.31],
    [0.18, 0.15],
    [0.22, -0.08],
    [0.12, -0.28],
    [-0.15, -0.38],
  ];

  // Rock cliff stratum 1 (tide-washed dark rock)
  b.extrude(isletBaseOutline, {
    at: [0, 0.12, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    bevel: 0.02,
    color: ROCK_DARK,
    bone: root,
    group: "island",
  });

  // Rock cliff stratum 2 (granite bluffs)
  const isletMidOutline = isletBaseOutline.map(([x, z]) => [x * 0.88 - 0.02, z * 0.88] as [number, number]);
  b.extrude(isletMidOutline, {
    at: [0, 0.18, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    bevel: 0.025,
    color: ROCK_MID,
    bone: root,
    group: "island",
  });

  // Rock cliff stratum 3 (upper bluffs)
  const isletHighOutline = isletBaseOutline.map(([x, z]) => [x * 0.76 - 0.03, z * 0.78 + 0.01] as [number, number]);
  b.extrude(isletHighOutline, {
    at: [0, 0.24, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    bevel: 0.03,
    color: ROCK_LIGHT,
    bone: root,
    group: "island",
  });

  // Coastal turf plateau (top green cap where lighthouse and cottage sit)
  const turfOutline = isletHighOutline.map(([x, z]) => [x * 0.85, z * 0.85] as [number, number]);
  b.extrude(turfOutline, {
    at: [0, 0.285, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.035,
    bevel: 0.012,
    color: TURF_TOP,
    bone: root,
    group: "island",
  });

  // Granite boulders and sea stacks around the shores
  const boulderGeomsDark: THREE.BufferGeometry[] = [];
  const boulderGeomsMid: THREE.BufferGeometry[] = [];
  const rBoulder = rng(42);

  const boulderLocs: [number, number, number, number][] = [
    [-0.38, 0.1, -0.28, 0.06],
    [-0.46, 0.1, -0.05, 0.08],
    [-0.42, 0.1, 0.22, 0.07],
    [-0.22, 0.1, 0.38, 0.06],
    [0.14, 0.1, 0.32, 0.07],
    [0.26, 0.1, 0.08, 0.09],
    [0.24, 0.1, -0.18, 0.07],
    [0.05, 0.1, -0.36, 0.08],
    [-0.18, 0.1, -0.42, 0.06],
    [0.32, 0.095, -0.1, 0.045],
    [-0.3, 0.095, 0.4, 0.04],
    [-0.46, 0.095, 0.08, 0.05],
  ];

  for (const [bx, by, bz, br] of boulderLocs) {
    const geo = new THREE.DodecahedronGeometry(br, 1);
    geo.scale(1 + (rBoulder() - 0.5) * 0.4, 0.7 + rBoulder() * 0.5, 1 + (rBoulder() - 0.5) * 0.4);
    geo.rotateY(rBoulder() * Math.PI);
    geo.translate(bx, by, bz);
    if (by < 0.11) {
      boulderGeomsDark.push(geo);
    } else {
      boulderGeomsMid.push(geo);
    }
  }

  if (boulderGeomsDark.length) {
    b.part(mergeGeometries(boulderGeomsDark), ROCK_DARK, { bone: root, at: [0, 0, 0], group: "rocks" });
  }
  if (boulderGeomsMid.length) {
    b.part(mergeGeometries(boulderGeomsMid), ROCK_MID, { bone: root, at: [0, 0, 0], group: "rocks" });
  }

  // Surf foam collars around the base of splash rocks
  const foamRings: THREE.BufferGeometry[] = [];
  for (const [bx, , bz, br] of boulderLocs) {
    const ring = new THREE.TorusGeometry(br * 1.22, 0.007, 3, 8);
    ring.rotateX(Math.PI / 2);
    ring.translate(bx, 0.096, bz);
    foamRings.push(ring);
  }
  b.part(mergeGeometries(foamRings), FOAM_WHITE, { bone: root, at: [0, 0, 0], group: "sea" });

  // =========================================================================
  // 4. STRIPED LIGHTHOUSE TOWER & LANTERN ROOM
  // =========================================================================
  const LX = -0.15;
  const LZ = -0.1;
  const BASE_Y = 0.3;

  // Sturdy octagonal granite foundation plinth
  const lhPlinth = new THREE.CylinderGeometry(0.12, 0.135, 0.06, 8);
  b.part(lhPlinth, ROCK_MID, { bone: root, at: [LX, BASE_Y + 0.03, LZ], group: "lighthouse" });

  // Alternating red and white tower bands
  const stripeH = 0.07;
  const stripesData = [
    { color: TOWER_WHITE, rB: 0.102, rT: 0.096, y: BASE_Y + 0.06 + stripeH * 0.5 },
    { color: TOWER_RED, rB: 0.096, rT: 0.09, y: BASE_Y + 0.06 + stripeH * 1.5 },
    { color: TOWER_WHITE, rB: 0.09, rT: 0.084, y: BASE_Y + 0.06 + stripeH * 2.5 },
    { color: TOWER_RED, rB: 0.084, rT: 0.078, y: BASE_Y + 0.06 + stripeH * 3.5 },
    { color: TOWER_WHITE, rB: 0.078, rT: 0.072, y: BASE_Y + 0.06 + stripeH * 4.5 },
    { color: TOWER_RED, rB: 0.072, rT: 0.066, y: BASE_Y + 0.06 + stripeH * 5.5 },
  ];

  for (const s of stripesData) {
    const cyl = new THREE.CylinderGeometry(s.rT, s.rB, stripeH, 16);
    b.part(cyl, s.color, { bone: root, at: [LX, s.y, LZ], group: "lighthouse" });
  }

  // Windows up the tower
  const windowGeoms: THREE.BufferGeometry[] = [];
  for (let wi = 0; wi < 3; wi++) {
    const wy = BASE_Y + 0.13 + wi * 0.14;
    const wr = 0.095 - wi * 0.012;
    const win = new THREE.BoxGeometry(0.015, 0.028, 0.01);
    win.translate(LX, wy, LZ - wr);
    windowGeoms.push(win);
  }
  b.part(mergeGeometries(windowGeoms), COTTAGE_WOOD, { bone: root, at: [0, 0, 0], group: "lighthouse" });

  // Gallery observation deck
  const galleryY = BASE_Y + 0.06 + stripeH * 6; // ~0.78m
  const galleryDeck = new THREE.CylinderGeometry(0.088, 0.072, 0.02, 16);
  b.part(galleryDeck, TOWER_TRIM, { bone: root, at: [LX, galleryY + 0.01, LZ], group: "lighthouse" });

  // Gallery railing (clean stylized posts and top rim)
  const railGeoms: THREE.BufferGeometry[] = [];
  const railR = 0.084;
  for (let ri = 0; ri < 8; ri++) {
    const a = (ri * Math.PI) / 4;
    const px = LX + Math.cos(a) * railR;
    const pz = LZ + Math.sin(a) * railR;
    const post = new THREE.CylinderGeometry(0.0035, 0.0035, 0.03, 4);
    post.translate(px, galleryY + 0.035, pz);
    railGeoms.push(post);
  }
  const topRail = new THREE.TorusGeometry(railR, 0.0035, 4, 12);
  topRail.rotateX(Math.PI / 2);
  topRail.translate(LX, galleryY + 0.05, LZ);
  railGeoms.push(topRail);
  b.part(mergeGeometries(railGeoms), TOWER_TRIM, { bone: root, at: [0, 0, 0], group: "lighthouse" });

  // Lantern room enclosure (faceted glass cylinder)
  const lanternGlass = new THREE.CylinderGeometry(0.058, 0.058, 0.06, 8);
  b.part(lanternGlass, GLASS_CYAN, { bone: root, at: [LX, galleryY + 0.05, LZ], group: "lighthouse" });

  // Rotating Fresnel lens core inside lantern (rigged on lanternLens joint)
  const fresnelLens = new THREE.CylinderGeometry(0.025, 0.025, 0.045, 6);
  b.part(fresnelLens, "#ffe359", { bone: lanternLens, at: [LX, galleryY + 0.05, LZ], group: "lighthouse" });

  // Lantern room roof: verdigris copper dome & spire
  const dome = new THREE.SphereGeometry(0.062, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
  b.part(dome, ROOF_COPPER, { bone: root, at: [LX, galleryY + 0.08, LZ], group: "lighthouse" });

  const spire = new THREE.CylinderGeometry(0.005, 0.012, 0.06, 4);
  b.part(spire, ROOF_COPPER, { bone: root, at: [LX, galleryY + 0.135, LZ], group: "lighthouse" });

  const weathervane = new THREE.BoxGeometry(0.035, 0.008, 0.003);
  b.part(weathervane, "#d4af37", { bone: root, at: [LX, galleryY + 0.17, LZ], group: "lighthouse" });

  // =========================================================================
  // 5. KEEPER'S COTTAGE & OUTBUILDINGS
  // =========================================================================
  const CX = 0.06;
  const CZ = -0.04;
  const COTTAGE_Y = 0.3;

  // Whitewashed stone walls
  const cottageWalls = new THREE.BoxGeometry(0.2, 0.12, 0.15);
  b.part(cottageWalls, COTTAGE_WALL, {
    bone: root,
    at: [CX, COTTAGE_Y + 0.06, CZ],
    group: "cottage",
  });

  // Pitched slate gable roof
  const roofOutline: [number, number][] = [
    [-0.09, 0],
    [0, 0.08],
    [0.09, 0],
  ];
  b.extrude(roofOutline, {
    at: [CX, COTTAGE_Y + 0.12, CZ - 0.11],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.22,
    bevel: 0.008,
    color: ROOF_SLATE,
    bone: root,
    group: "cottage",
  });

  // Fieldstone chimney
  const chimney = new THREE.BoxGeometry(0.04, 0.18, 0.04);
  b.part(chimney, COTTAGE_STONE, {
    bone: root,
    at: [CX + 0.085, COTTAGE_Y + 0.12, CZ + 0.04],
    group: "cottage",
  });
  const chimneyPot = new THREE.CylinderGeometry(0.012, 0.014, 0.03, 6);
  b.part(chimneyPot, "#994d38", {
    bone: root,
    at: [CX + 0.085, COTTAGE_Y + 0.22, CZ + 0.04],
    group: "cottage",
  });

  // Front door
  const cottageDoor = new THREE.BoxGeometry(0.032, 0.065, 0.006);
  b.part(cottageDoor, COTTAGE_WOOD, {
    bone: root,
    at: [CX - 0.03, COTTAGE_Y + 0.035, CZ + 0.076],
    group: "cottage",
  });

  // Cottage windows
  const cotWinGeoms: THREE.BufferGeometry[] = [];
  const win1 = new THREE.BoxGeometry(0.035, 0.04, 0.008);
  win1.translate(CX + 0.045, COTTAGE_Y + 0.06, CZ + 0.076);
  cotWinGeoms.push(win1);
  const win2 = new THREE.BoxGeometry(0.008, 0.04, 0.035);
  win2.translate(CX - 0.101, COTTAGE_Y + 0.06, CZ);
  cotWinGeoms.push(win2);
  b.part(mergeGeometries(cotWinGeoms), GLASS_CYAN, { bone: root, at: [0, 0, 0], group: "cottage" });

  // Covered breezeway
  const breezeway = new THREE.BoxGeometry(0.08, 0.07, 0.06);
  b.part(breezeway, COTTAGE_WALL, {
    bone: root,
    at: [(LX + CX) * 0.5 + 0.02, COTTAGE_Y + 0.035, (LZ + CZ) * 0.5 - 0.02],
    group: "cottage",
  });

  // Oil storage shed near path
  const shed = new THREE.BoxGeometry(0.08, 0.065, 0.07);
  b.part(shed, "#694833", {
    bone: root,
    at: [0.18, 0.23, 0.12],
    rotation: [0, -25, 0],
    group: "cottage",
  });
  const shedRoofOutline: [number, number][] = [
    [-0.045, 0],
    [0, 0.03],
    [0.045, 0],
  ];
  b.extrude(shedRoofOutline, {
    at: [0.18, 0.26, 0.08],
    x: [0.4, 0, 0.9],
    y: [0, 1, 0],
    thickness: 0.09,
    color: ROOF_SLATE,
    bone: root,
    group: "cottage",
  });

  // Gravel trail from cottage down to jetty
  const trailPoints: THREE.Vector3[] = [
    new THREE.Vector3(CX - 0.03, COTTAGE_Y + 0.005, CZ + 0.08),
    new THREE.Vector3(0.02, 0.29, 0.12),
    new THREE.Vector3(0.08, 0.25, 0.18),
    new THREE.Vector3(0.16, 0.2, 0.22),
    new THREE.Vector3(0.24, 0.15, 0.24),
    new THREE.Vector3(0.3, 0.12, 0.26),
  ];
  const trailCurve = catmull(trailPoints);
  b.sweep(trailCurve, 0.035, {
    section: "box",
    caps: "flat",
    color: PATH_GRAVEL,
    bone: root,
    group: "island",
  });

  // Stone retaining steps on slope
  const wallGeoms: THREE.BufferGeometry[] = [];
  for (let si = 0; si < 5; si++) {
    const step = new THREE.BoxGeometry(0.07, 0.025, 0.035);
    step.translate(0.12 + si * 0.035, 0.24 - si * 0.025, 0.19 + si * 0.015);
    wallGeoms.push(step);
  }
  b.part(mergeGeometries(wallGeoms), ROCK_MID, { bone: root, at: [0, 0, 0], group: "island" });

  // =========================================================================
  // 6. TIMBER JETTY / PIER & MOORING HARDWARE
  // =========================================================================
  const jettyPosts: THREE.BufferGeometry[] = [];
  const jettyPlanks: THREE.BufferGeometry[] = [];

  const jettyPiles: [number, number][] = [
    [0.3, 0.23],
    [0.3, 0.29],
    [0.37, 0.25],
    [0.37, 0.31],
    [0.44, 0.27],
    [0.44, 0.33],
    [0.51, 0.29],
    [0.51, 0.35],
  ];

  for (const [jx, jz] of jettyPiles) {
    const pile = new THREE.CylinderGeometry(0.01, 0.012, 0.11, 5);
    pile.translate(jx, 0.09, jz);
    jettyPosts.push(pile);
  }

  // Crossbeams supporting deck
  for (let ci = 0; ci < 4; ci++) {
    const p1 = jettyPiles[ci * 2];
    const p2 = jettyPiles[ci * 2 + 1];
    const beam = new THREE.BoxGeometry(0.018, 0.015, 0.08);
    beam.translate((p1[0] + p2[0]) * 0.5, 0.125, (p1[1] + p2[1]) * 0.5);
    jettyPlanks.push(beam);
  }

  // Deck planks
  for (let pi = 0; pi < 14; pi++) {
    const t = pi / 13;
    const px = 0.28 + t * 0.24;
    const pz = 0.255 + t * 0.095;
    const plank = new THREE.BoxGeometry(0.016, 0.008, 0.085);
    plank.rotateY(-0.38);
    plank.translate(px, 0.134, pz);
    jettyPlanks.push(plank);
  }

  // Mooring bollard
  const bollard = new THREE.CylinderGeometry(0.009, 0.01, 0.03, 5);
  bollard.translate(0.5, 0.145, 0.3);
  jettyPosts.push(bollard);

  // Wooden ladder leading down into water
  const ladderRung1 = new THREE.BoxGeometry(0.008, 0.006, 0.03);
  ladderRung1.translate(0.51, 0.11, 0.32);
  const ladderRung2 = new THREE.BoxGeometry(0.008, 0.006, 0.03);
  ladderRung2.translate(0.51, 0.08, 0.32);
  jettyPlanks.push(ladderRung1, ladderRung2);

  b.part(mergeGeometries(jettyPosts), JETTY_WET, { bone: root, at: [0, 0, 0], group: "jetty" });
  b.part(mergeGeometries(jettyPlanks), JETTY_WOOD, { bone: root, at: [0, 0, 0], group: "jetty" });

  // =========================================================================
  // 7. MOORED ROWBOAT (Articulated on rowboat joint)
  // =========================================================================
  const boatLen = 0.18;
  const boatW = 0.075;
  const boatH = 0.04;

  const hullOutline: [number, number][] = [
    [-boatLen * 0.48, 0],
    [-boatLen * 0.35, -boatW * 0.42],
    [0, -boatW * 0.48],
    [boatLen * 0.35, -boatW * 0.38],
    [boatLen * 0.5, 0],
    [boatLen * 0.35, boatW * 0.38],
    [0, boatW * 0.48],
    [-boatLen * 0.35, boatW * 0.42],
  ];

  b.extrude(hullOutline, {
    at: [0.38, 0.105, 0.28],
    x: [0.92, 0, 0.38],
    y: [0, 0, 1],
    thickness: boatH,
    bevel: 0.008,
    color: BOAT_HULL,
    bone: rowboat,
    group: "rowboat",
  });

  const seatGeoms: THREE.BufferGeometry[] = [];
  const seat1 = new THREE.BoxGeometry(0.015, 0.006, 0.055);
  seat1.translate(0, 0.01, -0.035);
  const seat2 = new THREE.BoxGeometry(0.018, 0.006, 0.065);
  seat2.translate(0, 0.01, 0.0);
  const seat3 = new THREE.BoxGeometry(0.015, 0.006, 0.055);
  seat3.translate(0, 0.01, 0.035);
  seatGeoms.push(seat1, seat2, seat3);

  // Pair of wooden oars
  const oar1 = new THREE.CylinderGeometry(0.003, 0.004, 0.13, 4);
  oar1.rotateZ(1.2);
  oar1.rotateY(0.2);
  oar1.translate(-0.01, 0.018, 0.01);
  const oar2 = new THREE.CylinderGeometry(0.003, 0.004, 0.13, 4);
  oar2.rotateZ(-1.1);
  oar2.rotateY(-0.3);
  oar2.translate(0.01, 0.02, -0.01);
  seatGeoms.push(oar1, oar2);

  b.part(mergeGeometries(seatGeoms), BOAT_SEATS, {
    bone: rowboat,
    at: [0.38, 0.105, 0.28],
    group: "rowboat",
  });

  // Mooring rope from rowboat bow to jetty bollard
  const ropeGeo = new THREE.BoxGeometry(0.008, 0.008, 0.12);
  ropeGeo.rotateY(-0.38);
  ropeGeo.translate(0.44, 0.115, 0.3);
  b.part(ropeGeo, "#c2ab80", { bone: root, at: [0, 0, 0], group: "jetty" });

  // =========================================================================
  // 8. FLOATING CHANNEL NAVIGATION BUOY
  // =========================================================================
  const buoyBody = new THREE.CylinderGeometry(0.028, 0.022, 0.05, 8);
  b.part(buoyBody, BUOY_RED, {
    bone: buoy,
    at: [0.42, 0.105, -0.32],
    group: "buoy",
  });
  const buoyCollar = new THREE.TorusGeometry(0.032, 0.007, 4, 8);
  buoyCollar.rotateX(Math.PI / 2);
  b.part(buoyCollar, BUOY_YELLOW, {
    bone: buoy,
    at: [0.42, 0.1, -0.32],
    group: "buoy",
  });
  const buoyTower = new THREE.CylinderGeometry(0.005, 0.015, 0.06, 4);
  b.part(buoyTower, TOWER_TRIM, {
    bone: buoy,
    at: [0.42, 0.155, -0.32],
    group: "buoy",
  });
  const buoyLight = new THREE.DodecahedronGeometry(0.01, 0);
  b.part(buoyLight, "#ffdd44", {
    bone: buoy,
    at: [0.42, 0.19, -0.32],
    group: "buoy",
  });

  // =========================================================================
  // 9. SHORELINE & ISLAND DETAIL (Vegetation, Flowers, Crates, Barrels)
  // =========================================================================
  const propGeomsWood: THREE.BufferGeometry[] = [];
  const propGeomsIron: THREE.BufferGeometry[] = [];

  const barrelPos: [number, number, number][] = [
    [0.14, 0.315, -0.06],
    [0.16, 0.315, -0.04],
    [0.21, 0.245, 0.16],
    [0.32, 0.145, 0.24],
  ];
  for (const [bx, by, bz] of barrelPos) {
    const barrel = new THREE.CylinderGeometry(0.018, 0.018, 0.04, 6);
    barrel.translate(bx, by, bz);
    propGeomsWood.push(barrel);
    const hoop1 = new THREE.TorusGeometry(0.0185, 0.002, 3, 6);
    hoop1.rotateX(Math.PI / 2);
    hoop1.translate(bx, by + 0.012, bz);
    const hoop2 = new THREE.TorusGeometry(0.0185, 0.002, 3, 6);
    hoop2.rotateX(Math.PI / 2);
    hoop2.translate(bx, by - 0.012, bz);
    propGeomsIron.push(hoop1, hoop2);
  }

  const cratePos: [number, number, number, number][] = [
    [0.14, 0.315, -0.02, 0.034],
    [0.17, 0.315, 0.01, 0.028],
    [0.23, 0.245, 0.14, 0.036],
    [0.45, 0.145, 0.32, 0.028],
  ];
  for (const [cx, cy, cz, cs] of cratePos) {
    const crate = new THREE.BoxGeometry(cs, cs, cs);
    crate.translate(cx, cy, cz);
    propGeomsWood.push(crate);
  }

  const trap1 = new THREE.BoxGeometry(0.035, 0.022, 0.022);
  trap1.translate(0.48, 0.145, 0.28);
  propGeomsWood.push(trap1);

  b.part(mergeGeometries(propGeomsWood), COTTAGE_WOOD, { bone: root, at: [0, 0, 0], group: "props" });
  b.part(mergeGeometries(propGeomsIron), TOWER_TRIM, { bone: root, at: [0, 0, 0], group: "props" });

  // Coastal shrubbery
  const shrubGeoms: THREE.BufferGeometry[] = [];
  const shrubLocs: [number, number, number, number][] = [
    [-0.26, 0.3, -0.18, 0.04],
    [-0.22, 0.3, -0.22, 0.035],
    [-0.3, 0.29, 0.04, 0.045],
    [-0.24, 0.3, 0.16, 0.05],
    [-0.1, 0.3, 0.22, 0.04],
    [0.02, 0.28, 0.24, 0.035],
    [-0.04, 0.3, -0.2, 0.04],
    [0.12, 0.26, -0.16, 0.035],
  ];

  for (const [sx, sy, sz, sr] of shrubLocs) {
    const shrub = new THREE.DodecahedronGeometry(sr, 1);
    shrub.scale(1.2, 0.6, 1.0);
    shrub.translate(sx, sy, sz);
    shrubGeoms.push(shrub);
  }
  b.part(mergeGeometries(shrubGeoms), TURF_SIDE, { bone: root, at: [0, 0, 0], group: "flora" });

  // Wildflower cards
  const flowerCardsSvg = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 30 L16 10 M14 20 L8 14 M18 18 L24 12" stroke="#3b6127" stroke-width="2"/>
      <circle cx="16" cy="8" r="5" fill="#f0789a"/>
      <circle cx="8" cy="13" r="3.5" fill="#e85d84"/>
      <circle cx="24" cy="11" r="4" fill="#ff94b2"/>
      <circle cx="16" cy="8" r="1.5" fill="#fff2a1"/>
    </svg>`,
    { size: 128 },
  );

  const flowerFrames: THREE.Vector3[] = [
    new THREE.Vector3(-0.25, 0.305, -0.12),
    new THREE.Vector3(-0.28, 0.305, -0.04),
    new THREE.Vector3(-0.22, 0.305, 0.12),
    new THREE.Vector3(-0.16, 0.305, 0.2),
    new THREE.Vector3(-0.02, 0.305, 0.21),
    new THREE.Vector3(0.04, 0.285, 0.18),
    new THREE.Vector3(0.12, 0.295, -0.12),
  ];

  b.cards(
    flowerFrames.map((p) => frame(p, [0, 1, 0])),
    flowerCardsSvg,
    {
      size: [0.035, 0.045],
      cross: true,
      vary: 0.25,
      bone: root,
      group: "flora",
    },
  );

  // Sea grass cards
  const grassSvg = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 32 C8 20 12 10 10 2 M16 32 C15 18 16 8 18 4 M24 32 C22 22 25 12 28 6 M12 32 C13 24 14 16 13 10 M20 32 C21 23 20 14 22 8" stroke="#5d8236" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  const grassFrames: THREE.Vector3[] = [
    new THREE.Vector3(-0.32, 0.21, 0.2),
    new THREE.Vector3(-0.35, 0.16, 0.12),
    new THREE.Vector3(-0.28, 0.18, -0.18),
    new THREE.Vector3(-0.15, 0.19, -0.28),
    new THREE.Vector3(0.18, 0.18, 0.22),
    new THREE.Vector3(0.22, 0.15, 0.18),
  ];

  b.cards(
    grassFrames.map((p) => frame(p, [0, 1, 0])),
    grassSvg,
    {
      size: [0.045, 0.06],
      cross: true,
      vary: 0.3,
      bone: root,
      group: "flora",
    },
  );

  // =========================================================================
  // 10. WHEELING HERRING GULLS (In flight & perched)
  // =========================================================================
  // Gull 1: Wheeling over cove [gull1 joint at [-0.32, 0.78, 0.18]]
  const gullBody = new THREE.ConeGeometry(0.016, 0.08, 5);
  gullBody.rotateX(-Math.PI / 2);
  b.part(gullBody, "#ffffff", {
    bone: gull1,
    at: [-0.32, 0.78, 0.18],
    dir: [0.8, 0.05, -0.6],
    group: "gulls",
  });

  const gullBeak = new THREE.ConeGeometry(0.004, 0.02, 4);
  gullBeak.rotateX(Math.PI / 2);
  gullBeak.translate(0, 0, 0.045);
  b.part(gullBeak, "#f4b942", {
    bone: gull1,
    at: [-0.32, 0.78, 0.18],
    dir: [0.8, 0.05, -0.6],
    group: "gulls",
  });

  const wingOutline = [
    [0, 0],
    [-0.02, 0.08],
    [0, 0.12, "sharp"],
    [0.02, 0.06],
  ];
  b.extrude(wingOutline, {
    at: [-0.32, 0.78, 0.18],
    x: [-0.6, 0.4, 0.2],
    y: [0, 1, 0],
    thickness: 0.003,
    color: "#e6e8eb",
    bone: gull1WingL,
    group: "gulls",
  });
  b.extrude(wingOutline, {
    at: [-0.32, 0.78, 0.18],
    x: [0.6, 0.4, -0.2],
    y: [0, 1, 0],
    thickness: 0.003,
    color: "#e6e8eb",
    bone: gull1WingR,
    group: "gulls",
  });

  // Gull 2: Gliding near sea [gull2 joint at [0.12, 0.82, -0.34]]
  const gull2Body = new THREE.ConeGeometry(0.014, 0.075, 5);
  gull2Body.rotateX(-Math.PI / 2);
  b.part(gull2Body, "#ffffff", {
    bone: gull2,
    at: [0.12, 0.82, -0.34],
    dir: [-0.7, -0.05, 0.7],
    group: "gulls",
  });

  const wingOutline2 = [
    [0, 0],
    [-0.018, 0.075],
    [0, 0.11, "sharp"],
    [0.018, 0.05],
  ];
  b.extrude(wingOutline2, {
    at: [0.12, 0.82, -0.34],
    x: [0.3, 0.3, 0.7],
    y: [0, 1, 0],
    thickness: 0.003,
    color: "#d8dce2",
    bone: gull2,
    group: "gulls",
  });
  b.extrude(wingOutline2, {
    at: [0.12, 0.82, -0.34],
    x: [-0.3, 0.3, -0.7],
    y: [0, 1, 0],
    thickness: 0.003,
    color: "#d8dce2",
    bone: gull2,
    group: "gulls",
  });

  // Gull 3: Perched on the pier bollard [0.50, 0.165, 0.30]
  const perchedGull = new THREE.ConeGeometry(0.012, 0.05, 4);
  perchedGull.rotateX(0.4);
  perchedGull.translate(0.5, 0.175, 0.3);
  b.part(perchedGull, "#ffffff", { bone: root, at: [0, 0, 0], group: "gulls" });

  return b.root;
}
