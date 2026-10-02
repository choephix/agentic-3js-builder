import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import type { PartOptions } from "../src/parts";
import type { SweepOptions } from "../src/sweep";
import { cel, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

const HULL = inkLines(cel("#642f68", "#321f4f"), { levels: [0.22], axis: [0, 1, 0], width: 0.035 });
const HULL_DARK = cel("#3b214f", "#241735");
const WOOD = cel("#b66649", "#6e3345");
const WOOD_LIGHT = cel("#d69256", "#92503f");
const SAIL = cel("#f7e7c7", "#cdb5b0");
const SAIL_BLUE = cel("#8ad5df", "#4b789d");
const SAIL_ROSE = cel("#e08aa0", "#934e78");
const GOLD = cel("#f5c86c", "#a66349");
const GOLD_DARK = cel("#b87845", "#5c3040");
const ROPE = cel("#ead49c", "#99715f");
const TEAL = "#55e4df";
const CRYSTAL = "#78f4f0";
const GLASS = "#8cf7ff";

export const meta = {
  name: "Aetherwind Galleon",
  description: "A hovering high-fantasy anime sky galleon with layered sails, glowing aether crystals, ornate hull trim, and hinged twin propellers.",
  style: "high-fantasy anime",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "skyshipGalleon", detail: 1 });
  const root = b.joint("hullRoot", { at: [0, 0.65, 0], role: "spine" });

  const box = (name: string, size: [number, number, number], at: [number, number, number], color: Fill, extra: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, name, ...extra });
  const cyl = (name: string, radius: number, height: number, at: [number, number, number], color: Fill, extra: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, { at, flat: true, name, ...extra });
  const sphere = (name: string, radius: number, at: [number, number, number], color: Fill, extra: PartOptions = {}) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, { at, flat: true, name, ...extra });
  const rod = (name: string, a: [number, number, number], z: [number, number, number], radius: number, color: Fill, extra: SweepOptions = {}) =>
    b.rod(a, z, radius, { color, name, ...extra });
  const torus = (name: string, at: [number, number, number], major: number, minor: number, color: Fill, extra: PartOptions = {}) =>
    b.part(new THREE.TorusGeometry(major, minor, 6, 12), color, { at, flat: true, name, ...extra });

  // The faceted keel and stepped upper deck establish a broad, readable galleon silhouette.
  b.loft(
    [
      { at: [0, 1.55, -4.0], w: 3.0, h: 1.55 },
      { at: [0, 1.22, -3.25], w: 4.25, h: 2.0 },
      { at: [0, 1.05, -1.5], w: 4.9, h: 2.25 },
      { at: [0, 1.02, 0.5], w: 5.05, h: 2.35 },
      { at: [0, 1.16, 2.45], w: 4.65, h: 2.15 },
      { at: [0, 1.48, 3.75], w: 3.45, h: 1.85 },
      { at: [0, 1.9, 4.65], w: 1.65, h: 1.15 },
      { at: [0, 2.16, 5.0], w: 0.25, h: 0.25 },
    ],
    { color: HULL, sides: 8, name: "facetedHull", group: "hull", bone: root },
  );
  box("upperDeck", [4.35, 0.22, 6.5], [0, 2.16, 0.35], WOOD, { bone: root });
  box("bowDeck", [2.0, 0.26, 1.9], [0, 2.42, 3.72], WOOD_LIGHT, { bone: root });
  box("sternDeck", [3.45, 0.25, 1.45], [0, 2.48, -3.18], WOOD_LIGHT, { bone: root });
  box("keelShadow", [1.0, 0.23, 7.4], [0, 0.57, 0.3], HULL_DARK, { bone: root });

  // Layered rails, plank lines, and gold scroll-like bands make the large hull read as painted wood.
  for (const s of [-1, 1]) {
    rod(`sideRail${s}`, [s * 2.31, 2.65, -2.95], [s * 2.17, 2.73, 3.25], 0.075, GOLD, { bone: root });
    rod(`sideRailLower${s}`, [s * 2.34, 1.42, -3.05], [s * 2.22, 1.42, 3.55], 0.045, GOLD_DARK, { bone: root });
    rod(`sideBelt${s}`, [s * 2.42, 1.07, -2.4], [s * 2.22, 1.14, 3.35], 0.045, WOOD_LIGHT, { bone: root });
    rod(`sidePlankTop${s}`, [s * 2.39, 2.02, -2.8], [s * 2.35, 2.02, 3.0], 0.025, GOLD_DARK, { bone: root });
    for (let i = 0; i < 7; i++) {
      const z = -2.65 + i * 0.85;
      rod(`plankRivet${s}_${i}`, [s * 2.39, 1.49, z], [s * 2.39, 1.49, z + 0.05], 0.07, GOLD, { bone: root });
    }
  }
  for (const s of [-1, 1]) {
    for (const z of [-1.72, -0.22, 1.28]) {
      torus(`hullPortholeRing${s}_${z}`, [s * 2.47, 1.86, z], 0.15, 0.028, GOLD, { rotation: [0, 0, s * Math.PI / 2], bone: root });
      const porthole = b.part(new THREE.BoxGeometry(0.045, 0.2, 0.2), GLASS, { at: [s * 2.49, 1.86, z], flat: true, name: `hullPorthole${s}_${z}`, bone: root });
      glow(porthole, 1.5);
    }
  }
  b.extrude([[0, 0.34], [0.28, 0], [0, -0.34], [-0.28, 0]], {
    at: [0.06, 4.62, -0.1],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.018,
    bevel: 0.008,
    color: TEAL,
    bone: root,
    name: "mainSailDiamond",
    group: "sails",
  });
  b.extrude([[0, 0.2], [0.17, 0], [0, -0.2], [-0.17, 0]], {
    at: [-0.06, 4.62, 0.48],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.018,
    bevel: 0.008,
    color: SAIL_ROSE,
    bone: root,
    name: "mainSailRoseDiamond",
    group: "sails",
  });
  rod("keelGold", [0, 0.71, -3.1], [0, 0.78, 3.9], 0.07, GOLD, { bone: root });
  rod("bowSpine", [0, 1.15, 3.25], [0, 2.65, 5.1], 0.11, GOLD, { bone: root });
  for (const s of [-1, 1]) {
    rod(`bowCheek${s}`, [s * 0.35, 1.2, 3.35], [s * 0.08, 2.55, 4.85], 0.07, GOLD_DARK, { bone: root });
  }

  // Stern cabin with a stepped anime-style roof, glowing windows, and corner braces.
  box("sternCabin", [2.7, 1.2, 1.25], [0, 3.0, -2.85], WOOD, { bone: root });
  box("sternCabinRoof", [3.05, 0.2, 1.55], [0, 3.66, -2.85], GOLD_DARK, { bone: root });
  box("sternRoofCap", [2.45, 0.17, 1.25], [0, 3.82, -2.85], WOOD_LIGHT, { bone: root });
  for (const s of [-1, 1]) {
    box(`cabinWindow${s}`, [0.07, 0.34, 0.52], [s * 1.38, 3.22, -2.9], GLASS, { bone: root });
    glow(b.part(new THREE.BoxGeometry(0.075, 0.38, 0.56), GLASS, { at: [s * 1.425, 3.22, -2.9], flat: true, name: `glowWindow${s}`, bone: root }), 1.8);
    box(`cabinBrace${s}`, [0.13, 1.2, 0.13], [s * 1.4, 3.02, -3.47], GOLD, { bone: root });
    box(`cabinPillar${s}`, [0.13, 1.1, 0.13], [s * 1.4, 3.02, -2.22], GOLD, { bone: root });
  }
  box("sternWindowFront", [0.7, 0.32, 0.08], [0, 3.2, -2.22], GLASS, { bone: root });
  glow(b.part(new THREE.BoxGeometry(0.74, 0.34, 0.08), GLASS, { at: [0, 3.2, -2.17], flat: true, name: "sternWindowGlow", bone: root }), 1.7);
  for (const s of [-1, 1]) {
    rod(`cabinRoofTrim${s}`, [s * 1.42, 3.88, -3.53], [s * 1.42, 3.88, -2.17], 0.04, GOLD, { bone: root });
  }

  // Three masts and their cross spars.
  const masts = [
    { id: "aft", z: -2.22, h: 6.55, r: 0.13 },
    { id: "main", z: 0.0, h: 7.45, r: 0.17 },
    { id: "fore", z: 2.35, h: 6.85, r: 0.13 },
  ];
  for (const mast of masts) {
    rod(`${mast.id}Mast`, [0, 2.3, mast.z], [0, mast.h, mast.z], mast.r, GOLD_DARK, { bone: root });
    rod(`${mast.id}MastHighlight`, [0.045, 2.42, mast.z], [0.045, mast.h - 0.1, mast.z], 0.035, GOLD, { bone: root });
    box(`${mast.id}Foot`, [0.42, 0.16, 0.42], [0, 2.29, mast.z], GOLD, { bone: root });
  }
  rod("mainYard", [-2.22, 5.02, 0], [2.22, 5.02, 0], 0.105, WOOD_LIGHT, { bone: root });
  rod("mainTopYard", [-1.45, 6.42, 0], [1.45, 6.42, 0], 0.08, GOLD_DARK, { bone: root });
  rod("aftYard", [-1.3, 4.64, -2.22], [1.3, 4.64, -2.22], 0.085, WOOD_LIGHT, { bone: root });
  rod("foreYard", [-1.35, 4.92, 2.35], [1.35, 4.92, 2.35], 0.085, WOOD_LIGHT, { bone: root });

  // Full sails: broad polygonal silhouettes with warm anime cel shading and sewn gold ribs.
  const sails = [
    {
      id: "mainSail",
      at: [0, 3.18, -0.03] as [number, number, number],
      outline: [[-1.95, 0], [1.92, 0], [1.6, 1.05], [1.32, 2.4], [0.86, 3.1], [-1.12, 3.14], [-1.72, 2.2]],
      color: SAIL,
    },
    {
      id: "foreSail",
      at: [0, 3.02, 2.34] as [number, number, number],
      outline: [[-1.1, 0], [1.42, 0], [1.16, 1.0], [0.82, 2.25], [0.32, 2.74], [-0.65, 2.78], [-1.0, 1.75]],
      color: SAIL_BLUE,
    },
    {
      id: "aftSail",
      at: [0, 3.0, -2.22] as [number, number, number],
      outline: [[-1.5, 0], [1.15, 0], [0.94, 1.0], [0.63, 2.14], [-0.55, 2.55], [-1.28, 1.72]],
      color: SAIL_ROSE,
    },
  ];
  for (const sail of sails) {
    b.extrude(sail.outline, {
      at: sail.at,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.035, 0.012],
      bevel: 0.018,
      smoothing: 1,
      color: sail.color,
      bone: root,
      name: sail.id,
      group: "sails",
    });
  }
  // Sail panels and bright edging are deliberately separate primitive strokes for a hand-painted read.
  for (const s of [-1, 1]) {
    rod(`mainSailVertical${s}`, [0.03, 3.25, s * 0.1], [0.03, 6.18, s * 0.1], 0.025, GOLD_DARK, { bone: root });
  }
  rod("mainSailBottomTrim", [0.04, 3.2, -1.86], [0.04, 3.2, 1.82], 0.042, GOLD, { bone: root });
  rod("foreSailBottomTrim", [0.04, 3.06, 1.3], [0.04, 3.06, 3.75], 0.036, GOLD, { bone: root });
  rod("aftSailBottomTrim", [0.04, 3.04, -3.57], [0.04, 3.04, -1.08], 0.036, GOLD, { bone: root });
  for (const z of [-1.22, -0.34, 0.55, 1.35]) rod(`mainSailSeam${z}`, [0.05, 3.3 + (z + 1.9) * 0.16, z], [0.05, 5.88 - Math.abs(z) * 0.1, z], 0.016, GOLD_DARK, { bone: root });
  for (const z of [1.63, 2.22, 2.82, 3.36]) rod(`foreSailSeam${z}`, [0.05, 3.1 + (z - 1.4) * 0.2, z], [0.05, 5.35 - (z - 2.4) * 0.12, z], 0.014, GOLD_DARK, { bone: root });
  for (const z of [-3.1, -2.5, -1.9, -1.42]) rod(`aftSailSeam${z}`, [0.05, 3.08 + (z + 3.55) * 0.18, z], [0.05, 5.0 - Math.abs(z + 2.2) * 0.1, z], 0.014, GOLD_DARK, { bone: root });

  // Rigging web: diagonal ropes, stays, and little gold eyelets.
  const rig = [
    [[0, 7.44, 0], [2.3, 2.66, 3.7]],
    [[0, 7.44, 0], [-2.3, 2.66, 3.7]],
    [[0, 7.44, 0], [2.35, 2.68, -3.35]],
    [[0, 7.44, 0], [-2.35, 2.68, -3.35]],
    [[0, 6.55, -2.22], [2.25, 2.67, 3.45]],
    [[0, 6.85, 2.35], [-2.2, 2.67, -3.2]],
  ] as [number, number, number][][];
  rig.forEach((r, i) => rod(`rigging${i}`, r[0], r[1], 0.018, ROPE, { bone: root }));
  for (const s of [-1, 1]) {
    for (const z of [-2.2, 0, 2.35]) sphere(`rigEye${s}_${z}`, 0.055, [s * 2.3, 2.72, z], GOLD, { bone: root });
  }

  // Deck clutter: crates, casks, coil reels, and lantern pylons to sell this as a lived-in ship.
  box("crateA", [0.58, 0.48, 0.58], [1.18, 2.56, 1.25], WOOD_LIGHT, { bone: root });
  box("crateB", [0.5, 0.42, 0.5], [1.2, 3.0, 1.22], WOOD, { bone: root });
  box("crateBandA", [0.62, 0.08, 0.08], [1.18, 2.56, 0.98], GOLD_DARK, { bone: root });
  box("crateBandB", [0.62, 0.08, 0.08], [1.18, 2.56, 1.52], GOLD_DARK, { bone: root });
  for (const s of [-1, 1]) {
    cyl(`deckCask${s}`, 0.34, 0.58, [s * 1.15, 2.56, -0.45], WOOD_LIGHT, { bone: root });
    torus(`deckCaskBand${s}`, [s * 1.15, 2.56, -0.45], 0.34, 0.028, GOLD_DARK, { rotation: [Math.PI / 2, 0, 0], bone: root });
    torus(`coilReel${s}`, [s * 1.05, 2.68, 1.85], 0.34, 0.035, ROPE, { rotation: [Math.PI / 2, 0, 0], bone: root });
    cyl(`coilHub${s}`, 0.07, 0.14, [s * 1.05, 2.68, 1.85], GOLD_DARK, { rotation: [Math.PI / 2, 0, 0], bone: root });
  }
  for (const s of [-1, 1]) {
    const lantern = b.part(new THREE.SphereGeometry(0.16, 8, 6), GLASS, { at: [s * 1.62, 3.12, 0.8], flat: true, name: `deckLantern${s}`, bone: root });
    glow(lantern, 2.3);
    rod(`lanternPole${s}`, [s * 1.62, 2.56, 0.8], [s * 1.62, 2.98, 0.8], 0.035, GOLD, { bone: root });
    box(`lanternCap${s}`, [0.3, 0.06, 0.3], [s * 1.62, 3.28, 0.8], GOLD_DARK, { bone: root });
  }

  // Four side cannons on chunky carriages, each with a muzzle ring and a gold sight bead.
  for (const s of [-1, 1]) {
    for (const z of [-1.35, 1.15]) {
      box(`cannonCarriage${s}_${z}`, [0.62, 0.22, 0.48], [s * 1.78, 2.47, z], HULL_DARK, { bone: root });
      rod(`cannonBarrel${s}_${z}`, [s * 1.85, 2.65, z], [s * 2.48, 2.78, z], 0.13, HULL_DARK, { bone: root });
      torus(`cannonMuzzle${s}_${z}`, [s * 2.47, 2.78, z], 0.14, 0.028, GOLD, { rotation: [0, 0, Math.PI / 2], bone: root });
      sphere(`cannonSight${s}_${z}`, 0.045, [s * 2.2, 2.92, z], GOLD, { bone: root });
    }
  }

  // Glowing aether crystals hang beneath the keel; their lowest points remain 0.5 m above the ground.
  const crystalPositions: [number, number, number][] = [
    [-1.28, 0.78, -1.85],
    [1.28, 0.78, -1.85],
    [-1.0, 0.69, 0.35],
    [1.0, 0.69, 0.35],
    [0, 0.7, 2.45],
  ];
  crystalPositions.forEach((p, i) => {
    const crystal = b.part(new THREE.ConeGeometry(0.18, 0.42, 6), CRYSTAL, { at: p, flat: true, name: `aetherCrystal${i}`, bone: root });
    glow(crystal, 2.4);
    rod(`crystalMount${i}`, [p[0], p[1] + 0.18, p[2]], [p[0], p[1] + 0.42, p[2]], 0.035, GOLD_DARK, { bone: root });
  });
  for (const z of [-2.0, -1.0, 0, 1.0, 2.0]) {
    const rune = b.part(new THREE.TorusGeometry(0.19, 0.018, 5, 10), TEAL, { at: [0, 0.68, z], rotation: [Math.PI / 2, 0, 0], flat: true, name: `keelRune${z}`, bone: root });
    glow(rune, 1.8);
  }

  // Hinged twin propellers at the stern, with sculpted three-blade fans and luminous hubs.
  const propellerL = b.joint("propellerL", { parent: root, at: [2.62, 1.46, -3.52], dir: [0, 0, 1], role: "hinge" });
  const propellerR = b.joint("propellerR", { parent: root, at: [-2.62, 1.46, -3.52], dir: [0, 0, 1], role: "hinge" });
  for (const s of [-1, 1]) {
    const prop = s === 1 ? propellerL : propellerR;
    rod(`propShaft${s}`, [s * 1.8, 1.46, -3.52], [s * 2.62, 1.46, -3.52], 0.12, GOLD_DARK, { bone: prop });
    const hub = b.part(new THREE.SphereGeometry(0.28, 10, 6), CRYSTAL, { at: [s * 2.62, 1.46, -3.52], flat: true, name: `propHub${s}`, bone: prop });
    glow(hub, 2.4);
    torus(`propHubRing${s}`, [s * 2.62, 1.46, -3.52], 0.3, 0.045, GOLD, { rotation: [Math.PI / 2, 0, 0], bone: prop });
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + 0.2;
      const ex: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
      const ey: [number, number, number] = [-Math.sin(a), Math.cos(a), 0];
      b.extrude(
        [[0, -0.08], [0.36, -0.06], [0.78, 0.18], [0.87, 0.34], [0.26, 0.25], [-0.06, 0.1]],
        { at: [s * 2.62, 1.46, -3.52], x: ex, y: ey, thickness: 0.06, bevel: 0.02, smoothing: 1, color: GOLD, bone: prop, name: `propBlade${s}_${i}`, group: "propellers" },
      );
    }
  }

  // A hinged stern rudder and a small rudder-gem keep the moving hardware legible in the rig.
  const rudder = b.joint("rudder", { parent: root, at: [0, 1.72, -4.03], dir: [0, -0.15, -1], role: "hinge" });
  b.extrude(
    [[-0.55, -0.45], [0.55, -0.45], [0.46, 0.28], [0.28, 1.35], [0, 1.62, "sharp"], [-0.28, 1.35], [-0.46, 0.28]],
    { at: [0, 1.72, -4.02], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, bevel: 0.025, smoothing: 1, color: HULL, bone: rudder, name: "rudderBlade", group: "rudder" },
  );
  rod("rudderHinge", [-0.58, 1.72, -4.04], [0.58, 1.72, -4.04], 0.08, GOLD, { bone: rudder });
  const rudderGem = b.part(new THREE.SphereGeometry(0.12, 8, 6), CRYSTAL, { at: [0, 2.75, -4.08], flat: true, name: "rudderGem", bone: rudder });
  glow(rudderGem, 2.2);

  // Decorative flags and a crown-like bow pennant finish the high-fantasy silhouette.
  b.extrude([[0, 0], [0.9, 0.03], [0.5, -0.32], [0, -0.58]], { at: [0, 7.44, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.025, color: SAIL_ROSE, bone: root, name: "mainPennant" });
  b.extrude([[0, 0], [0.62, -0.02], [0.26, -0.28], [0, -0.42]], { at: [0, 6.84, 2.35], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.022, color: SAIL_BLUE, bone: root, name: "forePennant" });
  rod("bowCrownLeft", [-0.6, 2.6, 4.72], [0, 3.1, 5.08], 0.045, GOLD, { bone: root });
  rod("bowCrownRight", [0.6, 2.6, 4.72], [0, 3.1, 5.08], 0.045, GOLD, { bone: root });
  sphere("bowCrownGem", 0.13, [0, 3.12, 5.08], CRYSTAL, { bone: root });
  const model = b.root;
  model.position.y += 0.64;
  return model;
}
