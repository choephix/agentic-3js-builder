```ts
import * as THREE from "three";
import { createBuilder, polyline } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A chunky, playful humanoid child wearing a handmade cardboard robot costume, built as a low-poly craft puppet with an oversized box helmet, open visor, panelled torso, articulated arms, and sturdy boots.",
};

const KRAFT = "#b8793f";
const KRAFT_LIGHT = "#d69a58";
const KRAFT_HIGHLIGHT = "#efbd78";
const KRAFT_DARK = "#70401f";
const EDGE = "#4a2918";
const INNER = "#261b18";
const VISOR = "#172d35";
const EYE = "#f6c84b";
const EYE_DARK = "#9d5b21";
const RUBBER = "#332a27";
const METAL = "#65717a";
const METAL_DARK = "#39434b";
const RED = "#b94332";
const BLUE = "#3d6c91";

export const STAGE2: ((b: Builder) => void)[] = [];

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "helmetShell",
    what: "A handmade cardboard robot light bar across the helmet roof: a narrow kraft housing, two folded brackets, and six tiny lamps alternating CYAN and MAGENTA. Keep the lamps bright and toy-like.",
    at: [0, 2.43, 0.03],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.62, 0.16, 0.18],
  },
  {
    id: "helmetAntenna",
    kind: "add",
    part: "helmetShell",
    what: "A bent cardboard antenna on the helmet's upper left: two short square stalk segments, a red ball tip, and a little folded base collar.",
    at: [0.27, 2.39, 0.02],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.16, 0.28, 0.16],
  },
  {
    id: "chestEmblem",
    kind: "add",
    part: "chestPlate",
    what: "A raised shield-shaped cardboard chest emblem with a dark outline, a bold lightning-bolt symbol, and two tiny folded corner tabs. Use BLUE, KRAFT_HIGHLIGHT, and EDGE.",
    at: [0, 1.62, 0.33],
    normal: [0, 0, 1],
    bone: "spine",
    room: [0.38, 0.32, 0.08],
  },
  {
    id: "armClaws",
    kind: "add",
    part: "handL",
    what: "Two chunky three-finger cardboard claw hands, mirrored left and right. Each finger is a tapered folded tab with dark edge faces, leaving a small gap between digits.",
    at: [0.7, 1.31, 0.04],
    normal: [0, 0, 1],
    bone: "wristL",
    room: [0.34, 0.25, 0.30],
  },
  {
    id: "kneeWarningPlates",
    kind: "add",
    part: "legL",
    what: "Mirrored knee armour plates on both knees: small angled kraft plates with alternating RED and KRAFT_DARK warning chevrons and two cardboard rivets.",
    at: [0.22, 0.62, 0.14],
    normal: [0, 0, 1],
    bone: "kneeL",
    room: [0.28, 0.25, 0.08],
  },
  {
    id: "backpack",
    kind: "add",
    part: "backPack",
    what: "A compact square cardboard power backpack behind the torso, with a central raised box, two side vents, a top handle, and three dangling insulated cables in RED, BLUE, and KRAFT_DARK.",
    at: [0, 1.48, -0.34],
    normal: [0, 0, -1],
    bone: "spine",
    room: [0.72, 0.52, 0.22],
  },
  {
    id: "earBolts",
    kind: "add",
    part: "helmetShell",
    what: "A pair of circular cardboard ear-bolt assemblies on the helmet sides: dark round backing discs, lighter hubs, and four little square fasteners around each hub.",
    at: [0.39, 2.1, 0],
    normal: [1, 0, 0],
    bone: "head",
    room: [0.18, 0.30, 0.34],
  },
  {
    id: "visorGlyph",
    kind: "add",
    part: "visor",
    what: "A small raised cardboard robot face glyph centered on the visor: a gold pixel-style smile and two tiny square signal marks, leaving the main dark visor readable.",
    at: [0, 2.11, 0.34],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.24, 0.14, 0.035],
  },
  {
    id: "bootTreads",
    kind: "add",
    part: "bootL",
    what: "Deep blocky boot tread details on both feet: three transverse rubber strips, a lighter toe cap, and one folded cardboard heel tab per boot.",
    at: [0.2, 0.12, 0.18],
    normal: [0, 0, 1],
    bone: "footL",
    room: [0.35, 0.16, 0.52],
  },
  {
    id: "torsoCables",
    kind: "add",
    part: "torso",
    what: "Two short exposed cardboard-and-string cables running from the chest plate toward the left shoulder, with square anchor blocks and a red connector.",
    at: [-0.3, 1.74, 0.34],
    normal: [0, 0, 1],
    bone: "spine",
    room: [0.3, 0.32, 0.08],
  },
  {
    id: "cardboardGrain",
    kind: "texture",
    part: "torso",
    what: "Paint subtle horizontal corrugated cardboard grain across the torso, chest plate, and shoulder boxes using KRAFT, KRAFT_LIGHT, and KRAFT_HIGHLIGHT. Keep it sparse, handmade, and aligned with each panel.",
  },
  {
    id: "helmetWear",
    kind: "texture",
    part: "helmetShell",
    what: "Add a flat cardboard craft texture to the helmet: slightly lighter top planes, darker folded edges, a few soft scuffs, and tiny irregular tape patches in KRAFT_LIGHT and KRAFT_DARK.",
  },
  {
    id: "limbPanelMarks",
    kind: "texture",
    part: "legL",
    what: "Paint matching folded seams and small hand-drawn registration marks on both leg shells and arm shells in EDGE, KRAFT_HIGHLIGHT, and RED. Do not obscure the joints or silhouette.",
  },
] as const;

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const hips = b.joint("hips", {
    at: [0, 1.02, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.joint("spine", {
    parent: hips,
    at: [0, 1.36, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const neck = b.joint("neck", {
    parent: spine,
    at: [0, 1.82, 0],
    dir: [0, 1, 0],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.08, 0.01],
    dir: [0, 0, 1],
    role: "head",
    group: "helmet",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.91, 0.1],
    dir: [0, 0, 1],
    role: "jaw",
    group: "helmet",
  });

  const leftArmPoints = polyline([
    [0.43, 1.72, 0],
    [0.63, 1.52, 0],
    [0.69, 1.27, 0],
  ]);
  const rightArmPoints = polyline([
    [-0.43, 1.72, 0],
    [-0.63, 1.52, 0],
    [-0.69, 1.27, 0],
  ]);

  const armL = b.chain("armL", leftArmPoints, {
    parent: spine,
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
    contact: [0.69, 1.27, 0],
  });
  const armR = b.chain("armR", rightArmPoints, {
    parent: spine,
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
    contact: [-0.69, 1.27, 0],
  });

  const leftLegPoints = polyline([
    [0.21, 1.04, 0],
    [0.22, 0.68, 0.02],
    [0.20, 0.29, 0.03],
  ]);
  const rightLegPoints = polyline([
    [-0.21, 1.04, 0],
    [-0.22, 0.68, 0.02],
    [-0.20, 0.29, 0.03],
  ]);

  const legL = b.chain("legL", leftLegPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.2, 0, 0.16],
  });
  const legR = b.chain("legR", rightLegPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.2, 0, 0.16],
  });

  const box = (
    name: string,
    at: [number, number, number],
    size: [number, number, number],
    color: string,
    bone: any,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      at,
      bone,
      flat: true,
    });

  const cyl = (
    name: string,
    at: [number, number, number],
    radius: number,
    height: number,
    color: string,
    bone: any,
    dir: [number, number, number] = [1, 0, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      name,
      at,
      bone,
      dir,
      flat: true,
    });

  box("torso", [0, 1.43, 0], [0.86, 0.78, 0.56], KRAFT, spine);
  box("torsoTopFold", [0, 1.83, 0.015], [0.78, 0.06, 0.59], KRAFT_LIGHT, spine);
  box("torsoBottomFold", [0, 1.06, 0.015], [0.79, 0.07, 0.59], KRAFT_DARK, hips);
  box("chestPlate", [0, 1.52, 0.292], [0.56, 0.43, 0.035], KRAFT_LIGHT, spine);
  box("chestInset", [0, 1.51, 0.315], [0.43, 0.29, 0.018], KRAFT_DARK, spine);
  box("chestScreen", [0, 1.55, 0.331], [0.25, 0.12, 0.012], INNER, spine);
  box("chestScreenGlow", [0, 1.55, 0.339], [0.18, 0.045, 0.009], BLUE, spine);
  box("chestLowerPanel", [0, 1.28, 0.295], [0.45, 0.11, 0.028], EDGE, spine);

  box("helmetShell", [0, 2.08, 0.015], [0.70, 0.62, 0.58], KRAFT, head);
  box("helmetTopFold", [0, 2.405, 0.02], [0.72, 0.055, 0.60], KRAFT_LIGHT, head);
  box("helmetLeftFold", [0.355, 2.08, 0.02], [0.045, 0.60, 0.60], KRAFT_DARK, head);
  box("helmetRightFold", [-0.355, 2.08, 0.02], [0.045, 0.60, 0.60], KRAFT_DARK, head);

  box("visor", [0, 2.115, 0.315], [0.52, 0.21, 0.035], VISOR, head);
  box("visorTopRim", [0, 2.245, 0.335], [0.57, 0.045, 0.055], EDGE, head);
  box("visorBottomRim", [0, 1.985, 0.335], [0.57, 0.045, 0.055], EDGE, jaw);
  box("visorEyeL", [0.145, 2.13, 0.344], [0.075, 0.055, 0.012], EYE, head);
  box("visorEyeR", [-0.145, 2.13, 0.344], [0.075, 0.055, 0.012], EYE, head);
  box("visorEyeDarkL", [0.145, 2.13, 0.353], [0.025, 0.052, 0.008], EYE_DARK, head);
  box("visorEyeDarkR", [-0.145, 2.13, 0.353], [0.025, 0.052, 0.008], EYE_DARK, head);

  box("jawBox", [0, 1.91, 0.16], [0.48, 0.13, 0.38], KRAFT_LIGHT, jaw);
  box("mouthSlot", [0, 1.91, 0.362], [0.27, 0.035, 0.012], INNER, jaw);
  box("mouthLowerEdge", [0, 1.85, 0.365], [0.33, 0.035, 0.025], EDGE, jaw);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = s > 0 ? armL.joints[0] : armR.joints[0];
    const elbow = s > 0 ? armL.joints[1] : armR.joints[1];
    const wrist = s > 0 ? armL.joints[2] : armR.joints[2];

    box(`shoulderPad${side}`, [s * 0.48, 1.70, 0], [0.22, 0.27, 0.61], KRAFT_LIGHT, shoulder);
    box(`shoulderEdge${side}`, [s * 0.48, 1.70, 0.315], [0.24, 0.28, 0.035], EDGE, shoulder);

    b.frustumBox(
      armL.at(0).at.clone().set(s * 0.43, 1.70, 0),
      armL.at(0.5).at.clone().set(s * 0.60, 1.51, 0),
      [0.18, 0.18],
      [0.15, 0.15],
      { color: KRAFT, bone: shoulder, name: `upperArm${side}`, section: "box" },
    );
    b.frustumBox(
      armL.at(0.5).at.clone().set(s * 0.60, 1.51, 0),
      armL.at(1).at.clone().set(s * 0.68, 1.28, 0),
      [0.15, 0.15],
      [0.12, 0.12],
      { color: KRAFT_LIGHT, bone: elbow, name: `foreArm${side}`, section: "box" },
    );

    cyl(`elbowCap${side}`, [s * 0.62, 1.49, 0], 0.095, 0.045, EDGE, elbow, [0, 0, 1]);
    box(`hand${side}`, [s * 0.70, 1.22, 0.02], [0.23, 0.20, 0.27], KRAFT_LIGHT, wrist);
    box(`handPalm${side}`, [s * 0.70, 1.22, 0.165], [0.17, 0.14, 0.035], EDGE, wrist);

    box(`hipShell${side}`, [s * 0.22, 0.98, 0], [0.28, 0.22, 0.43], KRAFT_DARK, hips);
    box(`kneeShell${side}`, [s * 0.22, 0.69, 0.02], [0.27, 0.24, 0.43], KRAFT, s > 0 ? legL.joints[1] : legR.joints[1]);
    box(`shinShell${side}`, [s * 0.20, 0.39, 0.03], [0.25, 0.42, 0.39], KRAFT_LIGHT, s > 0 ? legL.joints[1] : legR.joints[1]);
    box(`ankleBand${side}`, [s * 0.20, 0.19, 0.04], [0.28, 0.07, 0.43], EDGE, s > 0 ? legL.joints[2] : legR.joints[2]);
    box(`boot${side}`, [s * 0.20, 0.11, 0.13], [0.36, 0.22, 0.56], RUBBER, s > 0 ? legL.joints[2] : legR.joints[2]);
    box(`bootToe${side}`, [s * 0.20, 0.13, 0.39], [0.37, 0.18, 0.18], KRAFT_DARK, s > 0 ? legL.joints[2] : legR.joints[2]);

    cyl(`shoulderBolt${side}`, [s * 0.51, 1.72, 0.34], 0.055, 0.035, METAL, shoulder, [0, 0, 1]);
    cyl(`kneeBolt${side}`, [s * 0.22, 0.72, 0.245], 0.035, 0.025, METAL_DARK, s > 0 ? legL.joints[1] : legR.joints[1], [0, 0, 1]);
  }

  box("backPack", [0, 1.48, -0.335], [0.62, 0.48, 0.18], KRAFT_DARK, spine);
  box("backPackCore", [0, 1.51, -0.45], [0.32, 0.28, 0.07], KRAFT_LIGHT, spine);
  box("backPackTop", [0, 1.76, -0.39], [0.38, 0.07, 0.12], EDGE, spine);

  box("beltFront", [0, 1.12, 0.28], [0.72, 0.10, 0.05], EDGE, hips);
  box("beltBuckle", [0, 1.12, 0.32], [0.16, 0.13, 0.04], KRAFT_HIGHLIGHT, hips);

  box("helmetCheekL", [0.29, 1.98, 0.28], [0.08, 0.18, 0.06], KRAFT_HIGHLIGHT, head);
  box("helmetCheekR", [-0.29, 1.98, 0.28], [0.08, 0.18, 0.06], KRAFT_HIGHLIGHT, head);

  for (const add of STAGE2) add(b);
  return b.root;
}
```