import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { glow } from "../kits/glow";

const COLORS = {
  ground: "#465342",
  groundLight: "#667354",
  canvas: "#c59b61",
  canvasLight: "#d7b477",
  canvasDark: "#806044",
  trim: "#38515b",
  trimLight: "#6d8a83",
  wood: "#70452c",
  woodLight: "#9b6235",
  woodDark: "#3c261e",
  iron: "#252b2a",
  ironLight: "#59625d",
  stone: "#67655c",
  stoneLight: "#8b8676",
  stoneDark: "#454640",
  bed: "#3e6b63",
  bedLight: "#6f8f78",
  bedDark: "#294744",
  blanket: "#a44e38",
  rope: "#ad8252",
  ember: "#ff8a24",
  flame: "#ffc928",
  flameTip: "#fff1a0",
  pot: "#303a38",
  potLight: "#5d6d66",
  leather: "#6f3f2c",
};

export const meta = {
  name: "Low-poly campsite set",
  description: "A richly dressed low-poly campsite with an A-frame tent, bedroll, campfire, cooking tripod and stacked firewood.",
  style: "low-poly",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "campsiteSet", detail: 0.8 });
  const root = b.joint("campRoot", { at: [0, 0, 0], role: "fan" });
  const random = rng(92841);

  const box = (name: string, at: [number, number, number], size: [number, number, number], color: string, rotation: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(...size), color, { name, bone: root, at, rotation, flat: true });
  const ico = (name: string, at: [number, number, number], radius: number, color: string, detail = 0) =>
    b.part(new THREE.IcosahedronGeometry(radius, detail), color, { name, bone: root, at, flat: true });
  const cyl = (name: string, at: [number, number, number], radius: number, height: number, color: string, segments = 8, rotation: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, { name, bone: root, at, rotation, flat: true });
  const rod = (name: string, a: [number, number, number], z: [number, number, number], radius: number, color: string, section: "circle" | "box" = "circle") =>
    b.rod(a, z, radius, { name, bone: root, color, section, sides: section === "circle" ? 6 : undefined, caps: "flat", smooth: false });

  // A low irregular patch keeps the arrangement grounded without becoming a display plinth.
  box("groundPatch", [0, 0.035, 0], [2.9, 0.07, 2.35], COLORS.ground, [0, 0.7, 0]);
  const groundRocks: Array<[number, number]> = [
    [-1.24, -0.84], [-1.38, 0.12], [-0.92, 0.9], [-0.12, 1.03], [0.42, 1.02], [1.25, 0.84], [1.38, -0.56], [0.88, -0.98], [-0.34, -1.03],
  ];
  groundRocks.forEach(([x, z], i) => ico(`groundRock${i}`, [x, 0.085, z], 0.075 + random() * 0.035, i % 3 === 0 ? COLORS.groundLight : COLORS.stoneDark));

  // Tent: two faceted sloping cloth planes, triangular end caps, and strong dark trim.
  const eaveL: [number, number, number] = [-1.18, 0.1, -0.88];
  const eaveR: [number, number, number] = [0.16, 0.1, -0.88];
  const ridgeA: [number, number, number] = [-0.51, 1.55, -0.88];
  const eaveL2: [number, number, number] = [-1.18, 0.1, 0.43];
  const eaveR2: [number, number, number] = [0.16, 0.1, 0.43];
  const ridgeB: [number, number, number] = [-0.51, 1.55, 0.43];
  b.slab([eaveL, ridgeA, ridgeB, eaveL2], { name: "tentLeftSlope", bone: root, color: COLORS.canvas, thickness: 0.035 });
  b.slab([eaveR, eaveR2, ridgeB, ridgeA], { name: "tentRightSlope", bone: root, color: COLORS.canvasLight, thickness: 0.035 });
  b.slab([eaveL2, ridgeB, eaveR2], { name: "tentFrontGable", bone: root, color: COLORS.canvasLight, thickness: 0.035 });
  b.slab([eaveL, eaveR, ridgeA], { name: "tentBackGable", bone: root, color: COLORS.canvasDark, thickness: 0.035 });
  // Door flap is a dark triangular inset with a lighter fold and toggle.
  b.slab([[-0.98, 0.12, 0.455], [-0.51, 1.42, 0.455], [-0.04, 0.12, 0.455]], { name: "tentDoor", bone: root, color: COLORS.canvasDark, thickness: 0.018 });
  b.slab([[-0.51, 0.17, 0.468], [-0.51, 1.37, 0.468], [-0.47, 1.28, 0.468], [-0.47, 0.19, 0.468]], { name: "doorFold", bone: root, color: COLORS.trimLight, thickness: 0.012 });
  ico("doorToggle", [-0.46, 0.76, 0.49], 0.035, COLORS.rope);
  // Pole and canvas seams.
  rod("ridgePole", ridgeA, ridgeB, 0.026, COLORS.trim, "circle");
  rod("leftEaveTrim", eaveL, eaveL2, 0.024, COLORS.trim, "circle");
  rod("rightEaveTrim", eaveR, eaveR2, 0.024, COLORS.trim, "circle");
  rod("frontLeftTrim", eaveL2, ridgeB, 0.02, COLORS.trimLight, "circle");
  rod("frontRightTrim", eaveR2, ridgeB, 0.02, COLORS.trimLight, "circle");
  // Guy lines and four little stakes.
  const stakes: Array<[[number, number, number], [number, number, number]]> = [
    [[-1.18, 0.13, 0.4], [-1.43, 0.06, 0.64]], [[0.16, 0.13, 0.4], [0.48, 0.06, 0.64]],
    [[-1.18, 0.13, -0.84], [-1.42, 0.06, -1.08]], [[0.16, 0.13, -0.84], [0.45, 0.06, -1.05]],
  ];
  stakes.forEach(([high, low], i) => {
    rod(`guyLine${i}`, high, low, 0.009, COLORS.rope);
    rod(`stake${i}`, [low[0], 0.02, low[2]], [low[0], 0.18, low[2]], 0.018, COLORS.woodDark, "box");
  });
  // A small rolled blanket peeking out beside the tent.
  b.capsule([0.34, 0.22, -0.83], [0.34, 0.22, 0.02], 0.19, { name: "bedroll", bone: root, color: COLORS.bed, section: "circle", sides: 8, caps: "round", smooth: false });
  box("bedrollBlanket", [0.34, 0.3, -0.38], [0.36, 0.08, 0.28], COLORS.blanket, [0.08, 0, 0]);
  box("bedrollStrapA", [0.34, 0.27, -0.65], [0.43, 0.025, 0.045], COLORS.leather, [0, 0, 0]);
  box("bedrollStrapB", [0.34, 0.27, -0.16], [0.43, 0.025, 0.045], COLORS.leather, [0, 0, 0]);
  box("bedrollPillow", [0.34, 0.39, 0.04], [0.3, 0.12, 0.26], COLORS.bedLight, [0.12, 0, 0]);
  box("bedrollButton", [0.34, 0.47, -0.04], [0.08, 0.025, 0.08], COLORS.trim, [0, 0, 0]);

  // Ring of ten stones, each intentionally individually faceted and slightly irregular.
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const r = 0.46 + (random() - 0.5) * 0.05;
    const x = 0.84 + Math.cos(angle) * r;
    const z = 0.43 + Math.sin(angle) * r;
    ico(`fireStone${i}`, [x, 0.14 + random() * 0.025, z], 0.14 + random() * 0.025, i % 2 ? COLORS.stone : COLORS.stoneLight);
  }
  // Crossed firewood with cut end caps and bark bands.
  rod("fireLogA", [0.52, 0.26, 0.22], [1.15, 0.26, 0.64], 0.095, COLORS.wood, "circle");
  rod("fireLogB", [1.16, 0.36, 0.23], [0.53, 0.36, 0.66], 0.095, COLORS.woodLight, "circle");
  rod("fireLogC", [0.6, 0.46, 0.4], [1.08, 0.46, 0.4], 0.082, COLORS.woodDark, "circle");
  [0.52, 1.15, 0.53, 1.16, 0.6, 1.08].forEach((x, i) => cyl(`logEnd${i}`, [x, i < 2 ? 0.26 : i < 4 ? 0.36 : 0.46, i < 2 ? i === 0 ? 0.22 : 0.64 : i < 4 ? i === 2 ? 0.23 : 0.66 : 0.4], 0.06, 0.008, COLORS.woodLight, 7, [Math.PI / 2, 0, 0]));
  // Tripod, suspended pot, lid and a blocky bail handle.
  const apex: [number, number, number] = [0.84, 1.38, 0.43];
  rod("tripodLegL", apex, [0.35, 0.06, 0.78], 0.026, COLORS.iron, "box");
  rod("tripodLegR", apex, [1.33, 0.06, 0.78], 0.026, COLORS.iron, "box");
  rod("tripodLegBack", apex, [0.84, 0.06, -0.08], 0.026, COLORS.iron, "box");
  rod("potChain", apex, [0.84, 0.88, 0.43], 0.012, COLORS.ironLight);
  const pot = b.lathe([[0.2, 0.58], [0.28, 0.64], [0.3, 0.82], [0.25, 0.9], [0.18, 0.92], [0.15, 0.58]], { name: "cookPot", bone: root, at: [0.84, 0, 0.43], axis: [0, 1, 0], segments: 8, color: COLORS.pot });
  // Two broad bail/side handles make the pot read at a glance.
  rod("potHandleL", [0.56, 0.79, 0.43], [0.46, 1.0, 0.43], 0.018, COLORS.ironLight);
  rod("potHandleR", [1.12, 0.79, 0.43], [1.22, 1.0, 0.43], 0.018, COLORS.ironLight);
  cyl("potLid", [0.84, 0.94, 0.43], 0.23, 0.035, COLORS.potLight, 8);
  ico("potKnob", [0.84, 0.99, 0.43], 0.045, COLORS.potLight);
  void pot;

  // Layered, glowing angular flame, plus a handful of ember cubes.
  const flameOuter = b.part(new THREE.ConeGeometry(0.25, 0.7, 5), COLORS.ember, { name: "flameOuter", bone: root, at: [0.84, 0.65, 0.43], rotation: [0.08, 0.2, -0.12], flat: true });
  const flameInner = b.part(new THREE.ConeGeometry(0.14, 0.48, 5), COLORS.flame, { name: "flameInner", bone: root, at: [0.84, 0.74, 0.43], rotation: [-0.1, -0.22, 0.08], flat: true });
  const flameTipPart = b.part(new THREE.ConeGeometry(0.07, 0.27, 4), COLORS.flameTip, { name: "flameTip", bone: root, at: [0.84, 0.97, 0.43], rotation: [0.1, 0.18, 0], flat: true });
  glow(flameOuter, 1.35);
  glow(flameInner, 1.6);
  glow(flameTipPart, 1.8);
  for (let i = 0; i < 8; i++) {
    const a = random() * Math.PI * 2;
    const rr = 0.22 + random() * 0.18;
    const ember = b.part(new THREE.BoxGeometry(0.025, 0.025, 0.025), COLORS.flame, { name: `ember${i}`, bone: root, at: [0.84 + Math.cos(a) * rr, 0.38 + random() * 0.5, 0.43 + Math.sin(a) * rr], rotation: [a, a * 0.7, 0], flat: true });
    glow(ember, 1.2);
  }

  // Neatly stacked spare logs behind the fire, with rope lash and leafy kindling.
  rod("stackLog0", [1.13, 0.15, -0.75], [1.13, 0.15, -0.2], 0.105, COLORS.woodLight, "circle");
  rod("stackLog1", [1.13, 0.32, -0.75], [1.13, 0.32, -0.2], 0.105, COLORS.wood, "circle");
  rod("stackLog2", [1.0, 0.49, -0.75], [1.0, 0.49, -0.2], 0.105, COLORS.woodDark, "circle");
  rod("stackLog3", [1.26, 0.49, -0.75], [1.26, 0.49, -0.2], 0.105, COLORS.woodLight, "circle");
  box("logStackLash", [1.13, 0.28, -0.48], [0.28, 0.035, 0.035], COLORS.rope, [0, 0, 0]);
  box("logStackLash2", [1.13, 0.28, -0.47], [0.035, 0.035, 0.48], COLORS.rope, [0, 0, 0]);
  for (let i = 0; i < 5; i++) {
    const x = 0.93 + random() * 0.4;
    const z = -0.04 - random() * 0.22;
    rod(`kindling${i}`, [x, 0.08, z], [x + (random() - 0.5) * 0.16, 0.2, z + (random() - 0.5) * 0.08], 0.018, COLORS.woodLight, "circle");
  }

  // A little hanging lantern and a canvas tie-back finish the lived-in story details.
  rod("lanternHook", [0.06, 1.05, 0.22], [0.06, 1.3, 0.22], 0.012, COLORS.iron);
  box("lanternFrame", [0.06, 0.91, 0.22], [0.15, 0.2, 0.15], COLORS.iron, [0, 0, 0]);
  const lantern = b.part(new THREE.OctahedronGeometry(0.075, 0), COLORS.flame, { name: "lanternGlow", bone: root, at: [0.06, 0.91, 0.22], flat: true });
  glow(lantern, 1.4);
  rod("tieBack", [-0.08, 0.55, 0.46], [-0.08, 0.55, 0.56], 0.014, COLORS.rope);
  ico("tieToggle", [-0.08, 0.56, 0.58], 0.028, COLORS.rope);

  return b.root;
}
