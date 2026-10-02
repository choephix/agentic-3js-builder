import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { rng } from "../src/math";
import { grain } from "../src/paint";
import type { Fill } from "../src/context";
import { svg } from "../src/texture";
import { cel } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Lantern Shrine",
  description: "A roadside torii shrine dressed with glowing lanterns, offerings, charms and mossy stones.",
  style: "Genshin Impact",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "lanternShrine", detail: 1.1, paintSize: 1024 });
  const root = b.joint("shrineRoot", { at: [0, 0, 0], role: "spine" });

  const STONE = cel("#7f8ca8", "#4e5677");
  const STONE_LIGHT = cel("#aeb8c9", "#6b7291");
  const WOOD = cel("#a92e3d", "#5b1e38");
  const WOOD_DARK = cel("#66223c", "#351b36");
  const GOLD = cel("#f1bd4e", "#a95535");
  const PAPER = cel("#fff1c7", "#d89b88");
  const JADE = cel("#39c5a3", "#207b8c");
  const JADE_DARK = cel("#197f83", "#164b70");
  const AMBER = "#ffc15b";
  const RED = "#d54a48";
  const GREEN = cel("#78af67", "#35635c");
  const WOOD_GRAIN = grain(WOOD, WOOD_DARK, { size: 0.16, axis: "y", seed: 12 });
  const STONE_GRAIN = grain(STONE, "#39465f", { size: 0.24, axis: "z", seed: 5 });

  const addBox = (name: string, size: [number, number, number], at: [number, number, number], color: Fill, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: root,
      at,
      rotation,
      flat: true,
      name,
    });

  // Three broad foundation courses make the little shrine feel planted beside a road.
  addBox("foundationLower", [2.65, 0.16, 1.55], [0, 0.08, -0.02], STONE_GRAIN);
  addBox("foundationMiddle", [2.35, 0.18, 1.3], [0, 0.25, -0.02], STONE);
  addBox("foundationTop", [1.95, 0.14, 1.08], [0, 0.41, -0.02], STONE_LIGHT);
  addBox("frontStep", [1.3, 0.11, 0.34], [0, 0.52, 0.67], STONE_GRAIN);
  for (const s of [-1, 1]) {
    addBox(`foundationCorner${s}`, [0.12, 0.12, 0.16], [s * 1.2, 0.4, 0.63], JADE_DARK);
    addBox(`mossLine${s}`, [0.42, 0.025, 0.06], [s * 0.83, 0.5, 0.63], GREEN);
  }

  // Recessed altar house behind the gate.
  addBox("altarBack", [1.42, 1.03, 0.2], [0, 1.0, -0.34], WOOD_DARK);
  addBox("altarBackTopTrim", [1.22, 0.07, 0.05], [0, 1.42, -0.45], GOLD);
  addBox("altarBackBottomTrim", [1.22, 0.07, 0.05], [0, 0.58, -0.45], GOLD);
  addBox("altarBackLeftTrim", [0.07, 0.83, 0.05], [-0.58, 1.0, -0.45], GOLD);
  addBox("altarBackRightTrim", [0.07, 0.83, 0.05], [0.58, 1.0, -0.45], GOLD);
  addBox("altarPanel", [1.13, 0.73, 0.035], [0, 1.03, -0.225], WOOD_GRAIN);
  addBox("altarSill", [1.48, 0.13, 0.3], [0, 0.59, -0.14], GOLD);
  addBox("altarBase", [1.58, 0.12, 0.42], [0, 0.51, -0.2], WOOD_DARK);
  addBox("altarHeader", [1.55, 0.14, 0.3], [0, 1.55, -0.18], GOLD);
  for (const s of [-1, 1]) {
    addBox(`altarPost${s}`, [0.12, 1.06, 0.18], [s * 0.65, 1.04, -0.17], WOOD);
    addBox(`altarPostTrim${s}`, [0.16, 0.07, 0.22], [s * 0.65, 1.45, -0.17], GOLD);
  }

  // Layered, slightly upswept roof, with a gold ridge and jewel finials.
  addBox("roofFront", [1.9, 0.12, 0.48], [0, 1.76, 0.08], WOOD_GRAIN, [-14, 0, 0]);
  addBox("roofBack", [1.9, 0.12, 0.48], [0, 1.83, -0.34], WOOD_GRAIN, [14, 0, 0]);
  addBox("roofUpperFront", [1.55, 0.11, 0.35], [0, 1.94, 0.01], GOLD, [-12, 0, 0]);
  addBox("roofUpperBack", [1.55, 0.11, 0.35], [0, 1.99, -0.3], GOLD, [12, 0, 0]);
  addBox("roofRidge", [1.72, 0.11, 0.13], [0, 2.07, -0.15], WOOD_DARK);
  for (const s of [-1, 1]) {
    b.spike([s * 0.88, 1.79, 0.18], [s * 0.12, 0.08, 0], 0.22, 0.045, { bone: root, color: GOLD, caps: "point", name: `roofEaveFinial${s}` });
    b.spike([s * 0.82, 2.09, -0.15], [0, 0.16, 0], 0.16, 0.06, { bone: root, color: JADE, caps: "point", name: `roofJewel${s}` });
  }

  // Torii pillars and the characteristic curved kasagi beam.
  for (const s of [-1, 1]) {
    addBox(`toriiPillar${s}`, [0.22, 2.03, 0.22], [s * 0.98, 1.39, 0.32], WOOD_GRAIN);
    addBox(`toriiPillarFoot${s}`, [0.34, 0.14, 0.34], [s * 0.98, 0.42, 0.32], GOLD);
    addBox(`toriiPillarCap${s}`, [0.34, 0.12, 0.3], [s * 0.98, 2.38, 0.32], WOOD);
    addBox(`pillarGoldBandA${s}`, [0.25, 0.055, 0.26], [s * 0.98, 1.75, 0.32], GOLD);
    addBox(`pillarGoldBandB${s}`, [0.25, 0.055, 0.26], [s * 0.98, 1.91, 0.32], GOLD);
  }
  b.sweep(
    catmull([
      [-1.28, 2.43, 0.32], [-1.04, 2.53, 0.32], [-0.55, 2.59, 0.32],
      [0, 2.61, 0.32], [0.55, 2.59, 0.32], [1.04, 2.53, 0.32], [1.28, 2.43, 0.32],
    ]),
    0.11,
    { bone: root, color: WOOD_GRAIN, section: { ngon: 6 }, caps: "round", name: "toriiKasagi" },
  );
  addBox("toriiNuki", [2.15, 0.14, 0.17], [0, 2.19, 0.32], WOOD);
  addBox("toriiNukiGold", [1.88, 0.055, 0.2], [0, 2.1, 0.32], GOLD);

  // Rope, paper zig-zags and a hanging jade charm below the crossbeam.
  b.sweep(catmull([[-1.05, 2.08, 0.44], [-0.52, 2.02, 0.44], [0, 2.0, 0.44], [0.52, 2.02, 0.44], [1.05, 2.08, 0.44]]), 0.028, {
    bone: root, color: GOLD, section: { ngon: 6 }, caps: "round", name: "shimenawaRope",
  });
  for (const x of [-0.72, -0.24, 0.24, 0.72]) {
    b.extrude([[0, 0], [0.1, 0], [0.075, -0.11], [0.04, -0.19, "sharp"], [-0.04, -0.19, "sharp"], [-0.075, -0.11], [-0.1, 0]], {
      at: [x, 2.03, 0.45], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.004, smoothing: 1, color: PAPER, bone: root, name: `shide${x}`,
    });
  }
  b.rod([0, 2.03, 0.46], [0, 1.73, 0.46], 0.012, { bone: root, color: JADE_DARK, name: "charmCord" });
  b.lathe([[0, 0], [0.07, 0], [0.085, 0.035], [0.055, 0.12], [0, 0.15]], { at: [0, 1.56, 0.46], segments: 8, color: JADE, bone: root, name: "jadeCharm" });

  // Two elaborate lanterns, each with a glowing core, frame, roof and tassel.
  const lanternRune = svg(`<svg viewBox="0 0 64 64"><path d="M32 7 L38 25 L56 32 L38 39 L32 57 L26 39 L8 32 L26 25 Z" fill="#fff1a2"/><circle cx="32" cy="32" r="8" fill="#ffb63f"/><path d="M14 15 Q32 5 50 15 M14 49 Q32 59 50 49" fill="none" stroke="#7de1c5" stroke-width="4"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.36, 0.4), "#ffffff", { bone: root, at: [0, 1.0, -0.452], dir: [0, 0, -1], axis: "z", texture: lanternRune, name: "altarBackRune" });
  for (const s of [-1, 1]) {
    const x = s * 1.42;
    addBox(`lanternPost${s}`, [0.12, 1.22, 0.12], [x, 1.0, 0.55], WOOD_DARK);
    addBox(`lanternPostFoot${s}`, [0.26, 0.1, 0.26], [x, 0.47, 0.55], GOLD);
    addBox(`lanternArm${s}`, [0.58, 0.08, 0.08], [s * 1.19, 1.55, 0.55], GOLD);
    addBox(`lanternFrameBack${s}`, [0.34, 0.46, 0.06], [x, 1.31, 0.49], WOOD_DARK);
    addBox(`lanternFrameLeft${s}`, [0.045, 0.46, 0.07], [x - 0.15, 1.31, 0.68], GOLD);
    addBox(`lanternFrameRight${s}`, [0.045, 0.46, 0.07], [x + 0.15, 1.31, 0.68], GOLD);
    addBox(`lanternFrameTop${s}`, [0.34, 0.045, 0.07], [x, 1.53, 0.68], GOLD);
    addBox(`lanternFrameBottom${s}`, [0.34, 0.045, 0.07], [x, 1.09, 0.68], GOLD);
    const light = addBox(`lanternGlow${s}`, [0.23, 0.31, 0.23], [x, 1.31, 0.55], AMBER);
    glow(light, 1.8);
    addBox(`lanternRoof${s}`, [0.48, 0.1, 0.44], [x, 1.59, 0.55], WOOD);
    addBox(`lanternRoofGold${s}`, [0.33, 0.04, 0.31], [x, 1.67, 0.55], GOLD);
    addBox(`lanternBase${s}`, [0.4, 0.06, 0.4], [x, 1.05, 0.55], GOLD);
    b.part(new THREE.PlaneGeometry(0.18, 0.2), "#ffffff", { bone: root, at: [x, 1.31, 0.675], dir: [0, 0, 1], axis: "z", texture: lanternRune, name: `lanternRune${s}` });
    b.spike([x, 0.99, 0.55], [0, -1, 0], 0.2, 0.035, { bone: root, color: PAPER, caps: "point", name: `lanternTassel${s}` });
  }

  // Offering table, rice bowl, fruit, incense, and a small painted prayer tablet.
  addBox("offeringTableTop", [1.08, 0.1, 0.43], [0, 0.91, 0.98], WOOD_GRAIN);
  addBox("offeringTableApron", [0.93, 0.12, 0.08], [0, 0.8, 0.79], GOLD);
  for (const s of [-1, 1]) addBox(`offeringLeg${s}`, [0.12, 0.42, 0.12], [s * 0.42, 0.62, 0.98], WOOD_DARK);
  b.lathe([[0, 0], [0.16, 0], [0.18, 0.045], [0.14, 0.11], [0.09, 0.14], [0, 0.14]], { at: [-0.27, 1.02, 0.98], segments: 10, color: JADE_DARK, bone: root, name: "offeringBowl" });
  b.lathe([[0, 0], [0.1, 0], [0.13, 0.05], [0.07, 0.13], [0, 0.15]], { at: [-0.27, 1.13, 0.98], segments: 8, color: PAPER, bone: root, name: "riceMound" });
  for (const [i, x] of [-0.02, 0.18, 0.38].entries()) {
    b.part(new THREE.SphereGeometry(0.09, 8, 6), i === 1 ? RED : AMBER, { bone: root, at: [x, 1.05, 0.97], flat: true, name: `offeringFruit${i}` });
    b.spike([x, 1.13, 0.97], [0, 1, 0], 0.045, 0.012, { bone: root, color: GREEN, caps: "point", name: `fruitLeaf${i}` });
  }
  addBox("incenseTray", [0.26, 0.04, 0.16], [0.28, 1.0, 1.1], GOLD);
  for (const x of [0.22, 0.28, 0.34]) b.rod([x, 1.02, 1.1], [x + 0.015, 1.28, 1.1], 0.009, { bone: root, color: PAPER, name: `incense${x}` });
  addBox("prayerTablet", [0.28, 0.42, 0.045], [0.35, 1.25, 0.82], WOOD);
  addBox("prayerTabletTrim", [0.33, 0.035, 0.055], [0.35, 1.47, 0.82], GOLD);
  b.part(new THREE.PlaneGeometry(0.14, 0.25), "#ffffff", { bone: root, at: [0.35, 1.26, 0.849], dir: [0, 0, 1], axis: "z", texture: lanternRune, name: "prayerTabletMark" });

  // Roadside dressing: mossy stones, tiny flowers and jade leaf cards.
  const leafTexture = svg(`<svg viewBox="0 0 32 48"><path d="M16 46 Q4 27 8 8 Q23 11 27 25 Q24 39 16 46Z" fill="#58c99a"/><path d="M16 43 Q16 27 10 12" fill="none" stroke="#e3f2a9" stroke-width="3"/></svg>`, { size: 96 });
  const leafFrames = [
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), GREEN, { bone: root, at: [-1.15, 0.54, 0.85], name: "leafAnchorL" }),
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), GREEN, { bone: root, at: [1.1, 0.54, 0.77], name: "leafAnchorR" }),
  ];
  for (const [i, anchor] of leafFrames.entries()) {
    b.cards([anchor], leafTexture, { size: [0.16, 0.32], lean: 18, flow: [0, 0.1, 1], mirror: i === 1, sink: 0.02, color: GREEN, rng: rng(40 + i) });
  }
  const roadsideStones: [number, number, number][] = [[-1.26, 0.55, 0.98], [1.27, 0.55, 0.98], [-1.04, 0.55, -0.64], [0.98, 0.55, -0.58]];
  for (const [i, p] of roadsideStones.entries()) {
    b.part(new THREE.DodecahedronGeometry(0.16 + i * 0.005, 0), STONE_GRAIN, { bone: root, at: p, flat: true, name: `roadsideStone${i}` });
  }
  for (const s of [-1, 1]) {
    b.spike([s * 1.18, 0.57, 0.9], [0, 1, 0], 0.18, 0.025, { bone: root, color: GOLD, caps: "point", name: `flowerStem${s}` });
    b.lathe([[0, 0], [0.04, 0], [0.06, 0.035], [0, 0.08]], { at: [s * 1.18, 0.74, 0.9], segments: 6, color: AMBER, bone: root, name: `flowerHead${s}` });
  }

  return b.root;
}
