```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gunblade",
  description: "Final Fantasy style revolver gunblade: steel blade with a barrel along the spine, a revolver cylinder, gold wing guard, leather grip and a glowing blue gem.",
};

// Palette (top level so stage 2 can use the names)
export const STEEL = "#c9d3e0";
export const STEEL_LIGHT = "#f2f6fb";
export const STEEL_DARK = "#7b8798";
export const GUNMETAL = "#3a4152";
export const GUNMETAL_DARK = "#222733";
export const GOLD = "#e3b04b";
export const GOLD_DARK = "#a8741f";
export const LEATHER = "#3b2a22";
export const LEATHER_LIGHT = "#5c4034";
export const CRYSTAL = "#4fd2ff";
export const CRYSTAL_DEEP = "#1b6fc4";
export const RED = "#b3262e";
export const BLACK = "#0d0f14";

export const STAGE2: ((b: Builder) => void)[] = [];

export const REQUESTS = [
  {
    id: "bladeEmblem",
    kind: "add",
    part: "bladeSideL",
    what: "Lion-head emblem engraved on the blade's left face near the ricasso, as a small raised relief in GOLD with GOLD_DARK outline, plus two tiny rivets either side. Mirror a plainer version on the right face.",
    at: [0.0135, 0.78, 0.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.03, 0.14, 0.09],
  },
  {
    id: "wingGuardFiligree",
    kind: "add",
    part: "guardWingL",
    what: "Ornate filigree on both gold wing guards: layered feather-like ridges in GOLD_DARK and GOLD_LIGHT-ish trims, small studs along the edges.",
    at: [0.04, 0.56, 0.07],
    normal: [1, 0, 0],
    bone: null,
    room: [0.04, 0.1, 0.16],
  },
  {
    id: "cylinderEngraving",
    kind: "add",
    part: "cylinder",
    what: "Engraved rings, tiny screws and a gold bezel around each of the six chamber holes on both faces of the revolver cylinder; chamber rims in GOLD, tiny CRYSTAL lights between chambers.",
    at: [0.035, 0.5, 0.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.03, 0.13, 0.13],
  },
  {
    id: "muzzleDetail",
    kind: "add",
    part: "barrel",
    what: "Muzzle brake at the barrel tip: ventilated slots, a gold crown ring and a small front sight blade, plus a fine ring of grooves under it.",
    at: [0, 1.2, -0.06],
    normal: [0, 1, 0],
    bone: null,
    room: [0.07, 0.1, 0.07],
  },
  {
    id: "hammerTrigger",
    kind: "add",
    part: "hammer",
    what: "Detailed hammer spur with knurling, a trigger with a small pivot pin and a spring behind it, in GUNMETAL_DARK and STEEL.",
    at: [0, 0.47, -0.075],
    normal: [0, 0, -1],
    bone: null,
    room: [0.05, 0.12, 0.08],
  },
  {
    id: "gripFittings",
    kind: "add",
    part: "grip",
    what: "Crossed leather wrapping bands with gold studs at the top and bottom of the grip and a small red cloth tassel strap wrapped around the middle.",
    at: [0, 0.22, 0],
    normal: [0, 0, 1],
    bone: null,
    room: [0.08, 0.3, 0.08],
  },
  {
    id: "pommelCharm",
    kind: "add",
    part: "pommel",
    what: "A short silver chain hanging from the pommel ring ending in a lion-head pendant charm (GOLD) with a tiny CRYSTAL eye. Chain hangs but must not go below y = 0 more than 2 cm; keep it coiled beside the pommel.",
    at: [0, 0.02, 0.04],
    normal: [0, 0, 1],
    bone: null,
    room: [0.1, 0.1, 0.1],
  },
  {
    id: "bladeSpineTeeth",
    kind: "add",
    part: "bladeSideL",
    what: "Decorative notches and small gold clamps joining the barrel to the blade spine, three of them evenly along the barrel with bolts.",
    at: [0, 0.9, -0.055],
    normal: [0, 0, -1],
    bone: null,
    room: [0.07, 0.5, 0.05],
  },
  {
    id: "bladeEtching",
    kind: "texture",
    part: "bladeSideL",
    what: "Fine etched steel look on both blade faces: brushed streaks along the length, a lighter bevel near the edge, faint blue-tinted rune line down the fuller in CRYSTAL, and subtle battle scratches.",
  },
  {
    id: "gripLeather",
    kind: "texture",
    part: "grip",
    what: "Dark stitched leather in LEATHER and LEATHER_LIGHT with diagonal wrap seams and worn highlights.",
  },
  {
    id: "cylinderMetal",
    kind: "texture",
    part: "cylinder",
    what: "Polished silver-steel with gold inlaid lines and slight bluing near chambers, matching the STEEL and GOLD palette.",
  },
];

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  const box = (w: number, h: number, d: number, color: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, name, flat: true, ...(rot ? { rotation: rot } : {}) });
  const cylX = (r: number, len: number, color: string, at: number[], name: string, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir: [1, 0, 0], name, flat: true });

  // ---- pommel
  b.lathe(
    [[0, 0], [0.026, 0.004], [0.04, 0.025], [0.036, 0.05], [0.026, 0.07], [0.024, 0.085], [0, 0.085]],
    { at: [0, 0, 0], segments: 8, color: GOLD, name: "pommel" },
  );
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), CRYSTAL, { at: [0, 0.004, 0], name: "pommelGem" }), 1.4);
  b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 10), GOLD_DARK, { at: [0, 0.06, 0], rotation: [90, 0, 0], name: "pommelRing", flat: true });

  // ---- grip
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), LEATHER, { at: [0, 0.235, 0], name: "grip", flat: true });
  for (let i = 0; i < 7; i++) {
    b.part(new THREE.TorusGeometry(0.0215, 0.0035, 4, 8), i % 2 ? LEATHER_LIGHT : GOLD_DARK, {
      at: [0, 0.11 + i * 0.04, 0], rotation: [90, 0, 0], name: "gripWrap" + i, flat: true,
    });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.022, 0.02, 8), GOLD, { at: [0, 0.395, 0], name: "gripCollar", flat: true });
  b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.02, 8), GOLD, { at: [0, 0.095, 0], name: "gripBase", flat: true });

  // ---- receiver
  box(0.05, 0.13, 0.12, GUNMETAL, [0, 0.45, 0.0], "receiver");
  box(0.056, 0.03, 0.125, GOLD_DARK, [0, 0.395, 0.0], "receiverBand");
  // trigger guard and trigger
  for (const x of [0.02, -0.02]) {
    b.part(new THREE.TorusGeometry(0.05, 0.007, 4, 12, Math.PI), GOLD, {
      at: [x * 0.0, 0.405, 0.045], dir: [1, 0, 0], axis: "z", rotation: [0, 0, 0], name: "triggerGuardArc" + (x > 0 ? "L" : "R"), flat: true,
      ...{},
    }).mesh.visible = false; // placeholder removed below
  }
  // proper trigger guard: rods + bottom bar
  box(0.012, 0.012, 0.09, GOLD, [0, 0.355, 0.09], "triggerGuardBottom");
  box(0.012, 0.07, 0.012, GOLD, [0, 0.39, 0.135], "triggerGuardFront");
  box(0.012, 0.012, 0.03, GOLD, [0, 0.425, 0.12], "triggerGuardTop");
  box(0.01, 0.045, 0.012, STEEL, [0, 0.4, 0.07], "trigger", [20, 0, 0]);
  // hammer
  box(0.018, 0.06, 0.018, GUNMETAL_DARK, [0, 0.515, -0.075], "hammer", [-30, 0, 0]);
  box(0.022, 0.016, 0.03, STEEL_DARK, [0, 0.5, -0.07], "hammerBase");

  // ---- revolver cylinder
  cylX(0.058, 0.07, STEEL, [0, 0.52, 0.01], "cylinder", 12);
  for (const s of [1, -1]) {
    cylX(0.062, 0.008, GOLD, [s * 0.036, 0.52, 0.01], "cylinderRim" + (s > 0 ? "L" : "R"), 12);
    cylX(0.02, 0.01, GOLD_DARK, [s * 0.04, 0.52, 0.01], "cylinderHub" + (s > 0 ? "L" : "R"), 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cylX(0.011, 0.01, BLACK, [s * 0.04, 0.52 + Math.cos(a) * 0.038, 0.01 + Math.sin(a) * 0.038], "chamber", 6);
    }
  }

  // ---- wing guards (gold), extruded in YZ plane, one per side
  const wing: [number, number][] = [[-0.07, 0.0], [0.0, 0.03], [0.1, 0.035], [0.17, 0.005], [0.12, -0.02], [0.05, -0.045], [-0.03, -0.04]];
  for (const s of [1, -1]) {
    b.extrude(wing, {
      at: [s * 0.04, 0.56, 0.0], x: [0, 0, 1], thickness: 0.012, bevel: 0.002, color: GOLD,
      name: "guardWing" + (s > 0 ? "L" : "R"),
    });
    box(0.012, 0.012, 0.14, GOLD_DARK, [s * 0.047, 0.565, 0.04], "guardWingRidge" + (s > 0 ? "L" : "R"));
    box(0.012, 0.07, 0.012, GOLD_DARK, [s * 0.047, 0.575, -0.04], "guardBack" + (s > 0 ? "L" : "R"));
  }
  // blade holder block
  box(0.05, 0.03, 0.12, GOLD_DARK, [0, 0.575, 0.0], "bladeSeat");
  // crystal gem on the receiver front
  glow(b.part(new THREE.OctahedronGeometry(0.018, 0), CRYSTAL, { at: [0, 0.575, 0.075], scale: [0.8, 1.4, 0.8], name: "gem", flat: true }), 1.5);
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), GOLD, { at: [0, 0.575, 0.066], dir: [0, 0, 1], axis: "z", name: "gemSetting", flat: true });

  // ---- blade
  const bladeOutline: [number, number][] = [
    [-0.045, 0.0], [0.065, 0.0], [0.068, 0.06], [0.06, 0.62], [0.0, 0.8, ] as any,
    [-0.045, 0.74],
  ];
  const blade = bladeOutline.map((p) => [p[0], p[1]] as [number, number]);
  // tip point: make a long angled tip
  blade[4] = [0.008, 0.82];
  blade[3] = [0.062, 0.62];
  blade.splice(4, 0, [0.045, 0.74]);
  const thick = 0.022;
  for (const s of [1, -1]) {
    // blade body split into two half-slabs so each face is its own named part
    b.extrude(blade, {
      at: [s * thick * 0.25, 0.58, 0.0], x: [0, 0, 1], thickness: thick * 0.5, color: STEEL,
      name: "bladeSide" + (s > 0 ? "L" : "R"),
    });
    // fuller groove
    box(0.002, 0.5, 0.016, STEEL_DARK, [s * (thick * 0.5 + 0.0005), 0.9, 0.0], "fuller" + (s > 0 ? "L" : "R"));
    // ricasso gold plate
    box(0.003, 0.08, 0.1, GOLD_DARK, [s * (thick * 0.5 + 0.001), 0.63, 0.005], "ricasso" + (s > 0 ? "L" : "R"));
  }
  // sharpened edge
  b.extrude([[0.04, 0.12], [0.068, 0.12], [0.064, 0.62], [0.05, 0.7], [0.04, 0.7]], {
    at: [0, 0.58, 0.0], x: [0, 0, 1], thickness: 0.012, color: STEEL_LIGHT, name: "bladeEdge",
  });
  b.extrude([[0.058, 0.1], [0.069, 0.1], [0.065, 0.62], [0.02, 0.81], [0.01, 0.815], [0.03, 0.7]], {
    at: [0, 0.58, 0.0], x: [0, 0, 1], thickness: 0.005, color: STEEL_LIGHT, name: "bladeEdgeTip",
  });

  // ---- barrel along spine
  box(0.036, 0.62, 0.034, GUNMETAL, [0, 0.9, -0.062], "barrel");
  box(0.028, 0.6, 0.012, GUNMETAL_DARK, [0, 0.9, -0.083], "barrelBack");
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 8), GOLD, { at: [0, 1.225, -0.062], name: "muzzleRing", flat: true });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), BLACK, { at: [0, 1.245, -0.062], name: "muzzle", flat: true });
  for (const y of [0.7, 0.9, 1.1]) {
    box(0.044, 0.025, 0.044, GOLD_DARK, [0, y, -0.062], "barrelClamp");
  }
  box(0.01, 0.03, 0.01, STEEL, [0, 1.23, -0.085], "frontSight");

  for (const add of STAGE2) add(b);
  return b.root;
}
```