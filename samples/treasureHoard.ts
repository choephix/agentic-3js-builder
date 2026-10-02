import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { glow } from "../kits/glow";

const GOLD = "#f6b83f";
const GOLD_LIGHT = "#ffe39a";
const GOLD_DARK = "#a85a1e";
const CHEST = "#702b2f";
const CHEST_LIGHT = "#9e3e39";
const CHEST_DARK = "#321b27";
const IRON = "#26304b";
const RUBY = "#e83f67";
const SAPPHIRE = "#27a9e8";
const AMETHYST = "#9b59ff";
const EMERALD = "#35dc9a";
const CITRINE = "#f7df57";
const FLOOR = "#352349";

export const meta = {
  name: "League Treasure Hoard",
  description: "A richly dressed League of Legends treasure hoard with a strapped chest, jewel-crowned goblets, a radiant crown, and hundreds of scattered coins.",
  style: "League of Legends",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "treasureHoard", detail: 0.9 });
  const root = b.joint("hoardRoot", { at: [0, 0, 0], role: "spine" });
  const random = rng(90417);
  let serial = 0;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: { rotation?: [number, number, number]; scale?: number | [number, number, number]; name?: string; glow?: number } = {},
  ) => {
    const rotation = options.rotation?.map((angle) => (angle * 180) / Math.PI) as [number, number, number] | undefined;
    const item = b.part(geometry, color, {
      bone: root,
      at,
      rotation,
      scale: options.scale,
      name: options.name ?? `hoardDetail${serial++}`,
      flat: true,
    });
    if (options.glow) glow(item, options.glow);
    return item;
  };
  const box = (size: [number, number, number], color: string, at: [number, number, number], rotation: [number, number, number] = [0, 0, 0], name?: string) =>
    part(new THREE.BoxGeometry(...size), color, at, { rotation, name });
  const cylinder = (rTop: number, rBottom: number, height: number, color: string, at: [number, number, number], rotation: [number, number, number] = [0, 0, 0], name?: string) =>
    part(new THREE.CylinderGeometry(rTop, rBottom, height, b.segments(10), 1), color, at, { rotation, name });
  const cone = (radius: number, height: number, color: string, at: [number, number, number], rotation: [number, number, number] = [0, 0, 0], name?: string, glowStrength?: number) =>
    part(new THREE.ConeGeometry(radius, height, b.segments(7), 1), color, at, { rotation, name, glow: glowStrength });
  const sphere = (radius: number, color: string, at: [number, number, number], scale: [number, number, number] = [1, 1, 1], name?: string, glowStrength?: number) =>
    part(new THREE.SphereGeometry(radius, b.segments(9), b.segments(6)), color, at, { scale, name, glow: glowStrength });
  const torus = (major: number, minor: number, color: string, at: [number, number, number], rotation: [number, number, number] = [0, 0, 0], name?: string) =>
    part(new THREE.TorusGeometry(major, minor, b.segments(6), b.segments(14)), color, at, { rotation, name });

  // A low violet presentation shadow makes the warm gold hoard read as a single silhouette.
  cylinder(1.08, 1.18, 0.035, FLOOR, [0, 0.018, 0.08], [0, 0, 0], "hoardShadow");
  torus(1.08, 0.018, AMETHYST, [0, 0.038, 0.08], [Math.PI / 2, 0, 0], "shadowRim");

  // Chest: broad heroic silhouette, with painted redwood panels and chunky iron corners.
  box([1.18, 0.62, 0.72], CHEST_DARK, [0, 0.39, 0.08], [0, 0, 0], "chestBody");
  box([1.07, 0.48, 0.035], CHEST, [0, 0.4, 0.455], [0, 0, 0], "chestFrontPanel");
  box([0.96, 0.09, 0.025], CHEST_LIGHT, [0, 0.23, 0.477], [0, 0, 0], "chestPaintBandLower");
  box([0.96, 0.075, 0.025], CHEST_LIGHT, [0, 0.57, 0.477], [0, 0, 0], "chestPaintBandUpper");
  // Gold rails and iron shadow strips on all four faces.
  for (const x of [-0.49, 0.49]) {
    box([0.075, 0.68, 0.08], GOLD, [x, 0.4, 0.46], [0, 0, 0], `chestFrontStrap${x}`);
    box([0.075, 0.68, 0.055], GOLD_DARK, [x, 0.4, -0.31], [0, 0, 0], `chestBackStrap${x}`);
    box([0.09, 0.68, 0.075], IRON, [x, 0.4, 0.45], [0, 0, 0], `chestIronEdge${x}`);
    for (const y of [0.16, 0.66]) {
      sphere(0.043, GOLD_LIGHT, [x * 0.99, y, 0.515], [1, 0.7, 0.55], `chestRivet${x}${y}`);
    }
  }
  // Corner caps, bottom feet and a heavy lock plate.
  for (const x of [-0.56, 0.56]) for (const z of [-0.25, 0.41]) {
    box([0.11, 0.13, 0.10], IRON, [x, 0.14, z], [0, 0, 0], `chestCorner${x}${z}`);
    sphere(0.035, GOLD, [x * 0.98, 0.16, z + (z > 0 ? 0.06 : -0.05)], [1, 0.8, 0.7], `cornerStud${x}${z}`);
  }
  box([0.2, 0.22, 0.055], GOLD, [0, 0.42, 0.515], [0, 0, 0], "lockPlate");
  box([0.105, 0.13, 0.065], GOLD_LIGHT, [0, 0.43, 0.55], [0, 0, 0], "lockPlateInset");
  cylinder(0.052, 0.052, 0.017, CHEST_DARK, [0, 0.45, 0.59], [Math.PI / 2, 0, 0], "lockKeyhole");
  torus(0.088, 0.014, GOLD_DARK, [0, 0.42, 0.557], [0, 0, 0], "lockRing");

  // A faceted, slightly arched lid: layered slats sell the curved construction.
  const lidSlats = [
    [-0.31, 0.87, 0.34, -8], [-0.18, 0.93, 0.29, -5], [0, 0.965, 0.24, 0], [0.18, 0.93, 0.29, 5], [0.31, 0.87, 0.34, 8],
  ] as const;
  for (const [z, y, depth, tilt] of lidSlats) {
    box([1.18, 0.12, depth], CHEST, [0, y, z], [tilt * Math.PI / 180, 0, 0], `lidSlat${z}`);
    box([1.02, 0.025, 0.035], CHEST_LIGHT, [0, y + 0.066, z], [tilt * Math.PI / 180, 0, 0], `lidHighlight${z}`);
  }
  for (const z of [-0.31, -0.03, 0.25, 0.48]) {
    const y = z === 0.48 ? 0.78 : 0.83 + 0.11 * (1 - Math.min(1, Math.abs(z) / 0.5));
    const tilt = z > 0 ? -10 : 10;
    box([0.07, 0.19, 0.07], GOLD, [0, y, z], [tilt * Math.PI / 180, 0, 0], `lidRib${z}`);
    sphere(0.034, GOLD_LIGHT, [0, y + 0.1, z], [1, 0.7, 0.7], `lidRibStud${z}`);
  }
  box([0.16, 0.12, 0.08], IRON, [0, 0.71, 0.47], [0, 0, 0], "hingePlate");
  for (const x of [-0.45, 0.45]) {
    box([0.08, 0.18, 0.1], IRON, [x, 0.77, 0.29], [0, 0, 0], `lidSupport${x}`);
    cylinder(0.032, 0.032, 0.16, GOLD_DARK, [x, 0.74, 0.34], [0, 0, Math.PI / 2], `lidHingePin${x}`);
  }
  for (let i = 0; i < 7; i++) {
    cylinder(0.038, 0.038, 0.014, [GOLD_LIGHT, GOLD, GOLD_DARK][i % 3], [-0.3 + i * 0.1, 0.716 + (i % 2) * 0.008, 0.29], [0.08, i * 0.3, -0.05], `chestInteriorCoin${i}`);
  }

  // Two goblets, each built as a readable silhouette with rim, stem, foot and jewel.
  const makeGoblet = (x: number, z: number, tilt: number, accent: string, tag: string) => {
    cone(0.13, 0.23, GOLD, [x, 0.26, z], [tilt, 0, tilt * 0.35], `${tag}Cup`);
    torus(0.115, 0.018, GOLD_LIGHT, [x, 0.38, z], [Math.PI / 2 + tilt, 0, tilt * 0.35], `${tag}Rim`);
    cylinder(0.027, 0.027, 0.19, GOLD_DARK, [x, 0.105, z], [tilt, 0, tilt * 0.35], `${tag}Stem`);
    torus(0.09, 0.018, GOLD, [x, 0.025, z], [Math.PI / 2, 0, 0], `${tag}Foot`);
    cylinder(0.065, 0.065, 0.018, GOLD_LIGHT, [x, 0.4, z], [tilt, 0, tilt * 0.35], `${tag}Liquid`);
    sphere(0.044, accent, [x, 0.385, z + 0.025], [1, 0.8, 0.7], `${tag}GobletGem`, 1.2);
    for (const a of [-45, 0, 45]) {
      sphere(0.012, GOLD_LIGHT, [x + Math.sin((a * Math.PI) / 180) * 0.105, 0.38, z + Math.cos((a * Math.PI) / 180) * 0.105], [1, 1, 0.8], `${tag}RimStud${a}`);
    }
  };
  makeGoblet(-0.73, 0.51, -0.12, RUBY, "gobletL");
  makeGoblet(0.75, -0.34, 0.1, SAPPHIRE, "gobletR");

  // The crown sits in front of the lid: a gold circlet and seven asymmetric jewel points.
  const crownX = 0.42;
  const crownZ = 0.47;
  torus(0.19, 0.028, GOLD, [crownX, 0.2, crownZ], [Math.PI / 2, 0, 0], "crownCirclet");
  cylinder(0.17, 0.17, 0.045, GOLD_DARK, [crownX, 0.19, crownZ], [0, 0, 0], "crownBand");
  const crownAccents = [RUBY, SAPPHIRE, EMERALD, AMETHYST, CITRINE, RUBY, SAPPHIRE];
  for (let i = 0; i < 7; i++) {
    const a = -1.0 + (i / 6) * 2.0;
    const x = crownX + Math.sin(a) * 0.17;
    const z = crownZ + Math.cos(a) * 0.17;
    const peak = 0.47 + (i === 3 ? 0.19 : i % 2 === 0 ? 0.12 : 0.08);
    cone(0.046, peak, GOLD, [x, 0.24 + peak / 2, z], [Math.sin(a) * 0.28, 0, Math.cos(a) * 0.18], `crownPoint${i}`);
    sphere(0.031, crownAccents[i], [x, 0.24 + peak + 0.012, z], [1, 0.75, 0.75], `crownJewel${i}`, 1.5);
  }
  sphere(0.054, RUBY, [crownX, 0.205, crownZ + 0.19], [1, 1, 0.55], "crownFrontRuby", 1.3);

  // Hundreds of individual coins, with layered piles and occasional oversized medallions.
  const coinColors = [GOLD, GOLD_LIGHT, GOLD_DARK, "#d7872e"];
  for (let i = 0; i < 118; i++) {
    let x = (random() * 2 - 1) * 0.98;
    let z = (random() * 2 - 1) * 0.91;
    // Leave the chest's footprint mostly clear while keeping coins tucked around its silhouette.
    if (z > -0.28 && z < 0.46 && Math.abs(x) < 0.67) {
      x += x < 0 ? -0.38 : 0.38;
      z += z < 0 ? -0.22 : 0.28;
    }
    const pile = Math.max(0, 1 - Math.hypot(x * 0.8, (z + 0.06) * 0.85));
    const y = 0.04 + pile * (0.04 + random() * 0.12);
    const radius = 0.038 + random() * 0.027;
    const tilt = (random() - 0.5) * 0.55;
    const lean = (random() - 0.5) * 0.55;
    cylinder(radius, radius, 0.016 + random() * 0.009, coinColors[i % coinColors.length], [x, y, z], [tilt, random() * Math.PI * 2, lean], `coin${i}`);
    if (i % 17 === 0) {
      torus(radius * 0.62, 0.006, GOLD_DARK, [x, y + 0.012, z], [Math.PI / 2 + tilt, random() * Math.PI * 2, lean], `coinEngraving${i}`);
    }
  }
  // Three larger coins are easy focal reads from the hero camera.
  for (let i = 0; i < 5; i++) {
    const x = -0.8 + i * 0.39;
    const z = i % 2 ? 0.72 : -0.72;
    cylinder(0.09, 0.09, 0.022, GOLD_LIGHT, [x, 0.065, z], [0.12 * (i % 2 ? 1 : -1), i * 0.7, 0.08], `medallion${i}`);
    torus(0.06, 0.009, GOLD_DARK, [x, 0.08, z], [Math.PI / 2 + 0.12 * (i % 2 ? 1 : -1), i * 0.7, 0.08], `medallionRing${i}`);
    sphere(0.018, [RUBY, SAPPHIRE, EMERALD, AMETHYST, CITRINE][i], [x, 0.092, z], [1, 0.35, 1], `medallionGem${i}`, 1.1);
  }

  // A spray of cut gems, arranged as little triads so the hoard has strong LoL accent colour.
  const gemColors = [RUBY, SAPPHIRE, EMERALD, AMETHYST, CITRINE];
  const gemPositions: [number, number, number][] = [
    [-0.91, 0.12, -0.12], [-0.78, 0.16, 0.04], [-0.62, 0.11, 0.78], [0.78, 0.12, 0.39], [0.93, 0.1, 0.08],
    [0.55, 0.16, -0.7], [0.23, 0.1, -0.8], [-0.25, 0.12, -0.82], [-0.46, 0.13, -0.64], [0.99, 0.14, -0.6],
    [-0.84, 0.11, 0.68], [0.38, 0.13, 0.78], [0.1, 0.15, -0.55], [-0.18, 0.18, -0.42], [0.65, 0.22, 0.66],
    [-0.55, 0.18, 0.42], [0.9, 0.2, 0.7], [-0.96, 0.14, -0.69], [0.18, 0.13, 0.72], [-0.35, 0.16, 0.84],
  ];
  gemPositions.forEach(([x, y, z], i) => {
    const size = 0.045 + (i % 4) * 0.012;
    const gem = part(new THREE.OctahedronGeometry(size, 0), gemColors[i % gemColors.length], [x, y + size, z], {
      rotation: [random() * 0.7, random() * Math.PI, random() * 0.7],
      name: `cutGem${i}`,
      glow: i % 3 === 0 ? 1.35 : 0,
    });
    // A tiny gold collar grounds the crystal where it pierces the pile.
    torus(size * 0.62, 0.008, GOLD_DARK, [x, y + 0.018, z], [Math.PI / 2, 0, 0], `gemCollar${i}`);
    void gem;
  });

  // Loose ribbons of treasure: short bars and beads hint at broken jewellery among the coins.
  for (let i = 0; i < 12; i++) {
    const x = -0.92 + (i % 6) * 0.34;
    const z = i < 6 ? -0.52 + (i % 3) * 0.09 : 0.57 + (i % 3) * 0.1;
    const length = 0.12 + (i % 3) * 0.035;
    box([length, 0.018, 0.032], i % 2 ? GOLD : GOLD_LIGHT, [x, 0.08 + (i % 2) * 0.018, z], [0, (i * 0.55) % 1.3, (i % 2 ? 1 : -1) * 0.18], `jewelleryBar${i}`);
    sphere(0.024, gemColors[(i + 2) % gemColors.length], [x + length / 2, 0.1, z], [1, 0.8, 1], `jewelleryBead${i}`, i % 4 === 0 ? 1.2 : 0);
  }

  return b.root;
}
