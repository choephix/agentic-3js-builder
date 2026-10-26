import * as THREE from "three";
import { type Builder, createBuilder, paint, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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

const CARDBOARD_GRAIN = paint((p, n, s) => {
  const corrugation = Math.sin((p.y + p.z * 0.035) * 92) * 0.5 + 0.5;
  const sparse = Math.sin(p.x * 31 + p.z * 17 + p.y * 11) * 0.5 + 0.5;
  if (corrugation > 0.92 && sparse > 0.28) return KRAFT_HIGHLIGHT;
  if (corrugation < 0.12) return KRAFT_DARK;
  if (n.y > 0.55) return KRAFT_LIGHT;
  return KRAFT;
});

const HELMET_WEAR = paint((p, n, s) => {
  const scuff = Math.sin(p.x * 43 + p.y * 19 + p.z * 67) * 0.5 + 0.5;
  const tape = Math.sin(p.x * 17 - p.y * 29 + p.z * 13) * 0.5 + 0.5;
  if (tape > 0.965 && scuff > 0.48) return KRAFT_LIGHT;
  if (scuff < 0.08) return KRAFT_DARK;
  if (n.y > 0.58) return KRAFT_LIGHT;
  return KRAFT;
});

const LIMB_PANEL_MARKS = paint((p, n, s) => {
  const seam = Math.abs(Math.sin(p.y * 34 + p.x * 3)) > 0.985;
  const registration = Math.sin(p.x * 71 + p.y * 23 + p.z * 17) > 0.985;
  if (registration) return RED;
  if (seam) return EDGE;
  if (n.y > 0.52) return KRAFT_HIGHLIGHT;
  return KRAFT;
});

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

  box("torso", [0, 1.43, 0], [0.86, 0.78, 0.56], CARDBOARD_GRAIN, spine);
  box("torsoTopFold", [0, 1.83, 0.015], [0.78, 0.06, 0.59], KRAFT_LIGHT, spine);
  box("torsoBottomFold", [0, 1.06, 0.015], [0.79, 0.07, 0.59], KRAFT_DARK, hips);
  box("chestPlate", [0, 1.52, 0.292], [0.56, 0.43, 0.035], CARDBOARD_GRAIN, spine);
  box("chestInset", [0, 1.51, 0.315], [0.43, 0.29, 0.018], CARDBOARD_GRAIN, spine);
  box("chestScreen", [0, 1.55, 0.331], [0.25, 0.12, 0.012], INNER, spine);
  box("chestScreenGlow", [0, 1.55, 0.339], [0.18, 0.045, 0.009], BLUE, spine);
  box("chestLowerPanel", [0, 1.28, 0.295], [0.45, 0.11, 0.028], EDGE, spine);

  box("helmetShell", [0, 2.08, 0.015], [0.70, 0.62, 0.58], HELMET_WEAR, head);
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

    box(`shoulderPad${side}`, [s * 0.48, 1.70, 0], [0.22, 0.27, 0.61], CARDBOARD_GRAIN, shoulder);
    box(`shoulderEdge${side}`, [s * 0.48, 1.70, 0.315], [0.24, 0.28, 0.035], EDGE, shoulder);

    b.frustumBox(
      armL.at(0).at.clone().set(s * 0.43, 1.70, 0),
      armL.at(0.5).at.clone().set(s * 0.60, 1.51, 0),
      [0.18, 0.18],
      [0.15, 0.15],
      { color: LIMB_PANEL_MARKS, bone: shoulder, name: `upperArm${side}`, section: "box" },
    );
    b.frustumBox(
      armL.at(0.5).at.clone().set(s * 0.60, 1.51, 0),
      armL.at(1).at.clone().set(s * 0.68, 1.28, 0),
      [0.15, 0.15],
      [0.12, 0.12],
      { color: LIMB_PANEL_MARKS, bone: elbow, name: `foreArm${side}`, section: "box" },
    );

    cyl(`elbowCap${side}`, [s * 0.62, 1.49, 0], 0.095, 0.045, EDGE, elbow, [0, 0, 1]);
    box(`hand${side}`, [s * 0.70, 1.22, 0.02], [0.23, 0.20, 0.27], KRAFT_LIGHT, wrist);
    box(`handPalm${side}`, [s * 0.70, 1.22, 0.165], [0.17, 0.14, 0.035], EDGE, wrist);

    box(`hipShell${side}`, [s * 0.22, 0.98, 0], [0.28, 0.22, 0.43], KRAFT_DARK, hips);
    box(`kneeShell${side}`, [s * 0.22, 0.69, 0.02], [0.27, 0.24, 0.43], LIMB_PANEL_MARKS, s > 0 ? legL.joints[1] : legR.joints[1]);
    box(`shinShell${side}`, [s * 0.20, 0.39, 0.03], [0.25, 0.42, 0.39], LIMB_PANEL_MARKS, s > 0 ? legL.joints[1] : legR.joints[1]);
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const CYAN = "#39d9d5";
  const MAGENTA = "#d94ca8";
  const WIRE = "#3a2520";

  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      name: `s21_${name}`,
      bone: "head",
      at,
      flat: true,
      ...extra,
    });

  // Main folded cardboard housing, seated just above the helmet's top fold.
  part(
    "lightBarHousing",
    new THREE.BoxGeometry(0.58, 0.065, 0.12),
    KRAFT_LIGHT,
    [0, 2.445, 0.03],
  );

  // Dark underside makes the bar read as a separate folded craft assembly.
  part(
    "lightBarUnderside",
    new THREE.BoxGeometry(0.53, 0.018, 0.105),
    EDGE,
    [0, 2.406, 0.03],
  );

  // Raised top strip and end caps add visible layered cardboard construction.
  part(
    "lightBarTopFold",
    new THREE.BoxGeometry(0.49, 0.018, 0.075),
    KRAFT_HIGHLIGHT,
    [0, 2.486, 0.03],
  );
  for (const s of [-1, 1]) {
    part(
      `lightBarEndCap${s > 0 ? "L" : "R"}`,
      new THREE.BoxGeometry(0.035, 0.078, 0.135),
      KRAFT_DARK,
      [s * 0.292, 2.445, 0.03],
    );

    // Two folded mounting feet disappear into the helmet's top plane.
    part(
      `lightBarBracket${s > 0 ? "L" : "R"}`,
      new THREE.BoxGeometry(0.075, 0.045, 0.105),
      KRAFT_DARK,
      [s * 0.215, 2.405, 0.03],
    );
    part(
      `lightBarBracketFace${s > 0 ? "L" : "R"}`,
      new THREE.BoxGeometry(0.055, 0.012, 0.112),
      KRAFT_HIGHLIGHT,
      [s * 0.215, 2.426, 0.03],
    );
  }

  // Six chunky toy lamps, alternating cyan and magenta.
  const lampX = [-0.22, -0.132, -0.044, 0.044, 0.132, 0.22];
  for (let i = 0; i < lampX.length; i++) {
    const color = i % 2 === 0 ? CYAN : MAGENTA;

    const lamp = part(
      `lamp${i + 1}`,
      new THREE.CylinderGeometry(0.024, 0.028, 0.032, 8),
      color,
      [lampX[i], 2.505, 0.03],
    );
    glow(lamp, 1.6);

    // Small dark collars keep each lens anchored to the cardboard roof.
    part(
      `lampCollar${i + 1}`,
      new THREE.CylinderGeometry(0.031, 0.031, 0.009, 8),
      WIRE,
      [lampX[i], 2.486, 0.03],
    );

    // Tiny pale cap highlights give the lenses a handmade, dimensional sparkle.
    const glint = part(
      `lampGlint${i + 1}`,
      new THREE.BoxGeometry(0.009, 0.006, 0.006),
      "#fff2c4",
      [lampX[i] - 0.008, 2.518, 0.052],
    );
    glow(glint, 1.2);
  }

  // Two short drawn-looking seams across the top fold.
  for (const x of [-0.09, 0.09]) {
    part(
      `topSeam${x < 0 ? "L" : "R"}`,
      new THREE.BoxGeometry(0.012, 0.021, 0.081),
      EDGE,
      [x, 2.496, 0.03],
    );
  }

  // Four square rivets on the end faces complete the cardboard craft language.
  for (const s of [-1, 1]) {
    for (const z of [-0.012, 0.072]) {
      part(
        `endRivet${s > 0 ? "L" : "R"}${z < 0 ? "A" : "B"}`,
        new THREE.BoxGeometry(0.008, 0.012, 0.012),
        KRAFT_HIGHLIGHT,
        [s * 0.313, 2.445, z],
      );
    }
  }
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addHelmetAntenna(b: Builder) {
  const head = "head";
  const spine = "spine";

  // ─────────────────────────────────────────────────────────────────────────
  // s22 helmet antenna: a folded square mast with a crooked tip and red cap.
  // The helmet's top fold reaches about y = 2.432, so the collar sinks into it.
  // ─────────────────────────────────────────────────────────────────────────

  b.part(
    new THREE.CylinderGeometry(0.057, 0.061, 0.026, 6),
    EDGE,
    {
      name: "s22AntennaBaseCollar",
      bone: head,
      at: [0.27, 2.425, 0.02],
      flat: true,
    },
  );

  b.part(
    new THREE.BoxGeometry(0.108, 0.026, 0.085),
    KRAFT_LIGHT,
    {
      name: "s22AntennaFoldedBase",
      bone: head,
      at: [0.27, 2.446, 0.02],
      flat: true,
    },
  );

  b.frustumBox(
    [0.27, 2.438, 0.02],
    [0.27, 2.492, 0.02],
    [0.047, 0.047],
    [0.036, 0.036],
    {
      name: "s22AntennaMast",
      bone: head,
      color: KRAFT,
      section: "box",
      caps: "flat",
    },
  );

  b.frustumBox(
    [0.27, 2.492, 0.02],
    [0.315, 2.508, 0.02],
    [0.036, 0.036],
    [0.026, 0.026],
    {
      name: "s22AntennaBentTip",
      bone: head,
      color: KRAFT_LIGHT,
      section: "box",
      caps: "flat",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.052, 0.018, 0.05),
    EDGE,
    {
      name: "s22AntennaTipBand",
      bone: head,
      at: [0.304, 2.504, 0.02],
      rotation: [0, 0, -20],
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.036, 8, 5),
    RED,
    {
      name: "s22AntennaRedBeacon",
      bone: head,
      at: [0.332, 2.514, 0.02],
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.012, 6, 4),
    KRAFT_HIGHLIGHT,
    {
      name: "s22AntennaBeaconGlint",
      bone: head,
      at: [0.319, 2.531, 0.008],
      flat: true,
    },
  );

  // ─────────────────────────────────────────────────────────────────────────
  // s22 chest emblem: dark shield outline, inset blue shield, gold lightning,
  // folded corner tabs, and four visible cardboard rivets.
  // ─────────────────────────────────────────────────────────────────────────

  const shieldOuter: [number, number][] = [
    [-0.165, 0.115],
    [0.165, 0.115],
    [0.145, -0.055],
    [0.0, -0.155],
    [-0.145, -0.055],
  ];

  const shieldInner: [number, number][] = [
    [-0.132, 0.088],
    [0.132, 0.088],
    [0.113, -0.038],
    [0.0, -0.115],
    [-0.113, -0.038],
  ];

  b.extrude(shieldOuter, {
    name: "s22ChestShieldOutline",
    group: "chestEmblem",
    bone: spine,
    at: [0, 1.625, 0.343],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.024,
    bevel: 0.004,
    color: EDGE,
  });

  b.extrude(shieldInner, {
    name: "s22ChestBlueShield",
    group: "chestEmblem",
    bone: spine,
    at: [0, 1.625, 0.362],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.018,
    bevel: 0.003,
    color: BLUE,
  });

  const lightning: [number, number][] = [
    [-0.018, 0.095],
    [0.073, 0.095],
    [0.018, 0.005],
    [0.061, 0.005],
    [-0.067, -0.105],
    [-0.025, -0.026],
    [-0.067, -0.026],
  ];

  b.extrude(lightning, {
    name: "s22ChestLightning",
    group: "chestEmblem",
    bone: spine,
    at: [0, 1.625, 0.382],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.002,
    color: KRAFT_HIGHLIGHT,
  });

  const tabGeo = new THREE.BoxGeometry(0.045, 0.034, 0.018);
  b.part(tabGeo, KRAFT_HIGHLIGHT, {
    name: "s22ChestTabL",
    group: "chestEmblem",
    bone: spine,
    at: [-0.145, 1.715, 0.391],
    rotation: [0, 0, -18],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.045, 0.034, 0.018), KRAFT_HIGHLIGHT, {
    name: "s22ChestTabR",
    group: "chestEmblem",
    bone: spine,
    at: [0.145, 1.715, 0.391],
    rotation: [0, 0, 18],
    flat: true,
  });

  const rivet = (name: string, x: number, y: number) =>
    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8),
      KRAFT_HIGHLIGHT,
      {
        name,
        group: "chestEmblem",
        bone: spine,
        at: [x, y, 0.397],
        dir: [0, 0, 1],
        flat: true,
      },
    );

  rivet("s22ChestRivetTL", -0.125, 1.70);
  rivet("s22ChestRivetTR", 0.125, 1.70);
  rivet("s22ChestRivetBL", -0.105, 1.555);
  rivet("s22ChestRivetBR", 0.105, 1.555);

  // Two tiny dark registration marks make the emblem feel hand-cut rather than
  // machine-perfect, while staying within the cleared chest room.
  b.part(
    new THREE.BoxGeometry(0.038, 0.009, 0.008),
    EDGE,
    {
      name: "s22ChestHandMarkL",
      group: "chestEmblem",
      bone: spine,
      at: [-0.19, 1.60, 0.397],
      rotation: [0, 0, -12],
      flat: true,
    },
  );
  b.part(
    new THREE.BoxGeometry(0.038, 0.009, 0.008),
    EDGE,
    {
      name: "s22ChestHandMarkR",
      group: "chestEmblem",
      bone: spine,
      at: [0.19, 1.60, 0.397],
      rotation: [0, 0, 12],
      flat: true,
    },
  );
}
    return addHelmetAntenna;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addArmClaws(b: Builder) {
  const clawFinger = (
    side: number,
    index: number,
    xOffset: number,
    y: number,
    bone: string,
  ) => {
    const x = side * (0.70 + xOffset);
    const base: [number, number, number] = [x, y, 0.145];
    const tip: [number, number, number] = [
      x + side * (index === 1 ? 0.008 : 0),
      y + (index === 0 ? -0.008 : index === 2 ? 0.008 : 0),
      0.325,
    ];

    b.frustumBox(base, tip, [0.052, 0.068], [0.038, 0.054], {
      bone,
      color: KRAFT_LIGHT,
      section: "box",
      name: `s23ClawFinger${side > 0 ? "L" : "R"}${index}`,
    });

    b.part(
      new THREE.BoxGeometry(0.044, 0.058, 0.018),
      EDGE,
      {
        bone,
        at: [tip[0], tip[1], 0.332],
        name: `s23ClawTip${side > 0 ? "L" : "R"}${index}`,
        flat: true,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.012, 0.072, 0.018),
      KRAFT_DARK,
      {
        bone,
        at: [x - side * 0.026, y, 0.238],
        name: `s23ClawFold${side > 0 ? "L" : "R"}${index}`,
        flat: true,
      },
    );
  };

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    const wrist = side > 0 ? "wristL" : "wristR";

    b.part(
      new THREE.BoxGeometry(0.215, 0.19, 0.035),
      KRAFT_HIGHLIGHT,
      {
        bone: wrist,
        at: [side * 0.70, 1.22, 0.17],
        name: `s23ClawPalmPlate${sideName}`,
        flat: true,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.13, 0.035, 0.028),
      EDGE,
      {
        bone: wrist,
        at: [side * 0.70, 1.315, 0.185],
        name: `s23ClawPalmFold${sideName}`,
        flat: true,
      },
    );

    clawFinger(side, 0, -0.066, 1.145, wrist);
    clawFinger(side, 1, 0, 1.22, wrist);
    clawFinger(side, 2, 0.066, 1.145, wrist);

    for (let i = 0; i < 2; i++) {
      b.part(
        new THREE.CylinderGeometry(0.018, 0.018, 0.026, 8),
        KRAFT_DARK,
        {
          bone: wrist,
          at: [side * (0.655 + i * 0.09), 1.235, 0.194],
          dir: [0, 0, 1],
          name: `s23ClawRivet${sideName}${i}`,
          flat: true,
        },
      );
    }
  }

  const kneeOutline: [number, number][] = [
    [-0.115, -0.075],
    [0.115, -0.075],
    [0.13, 0.035],
    [0.065, 0.095],
    [-0.065, 0.095],
    [-0.13, 0.035],
  ];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    const bone = side > 0 ? "kneeL" : "kneeR";
    const cx = side * 0.22;
    const cy = 0.69;
    const z = 0.255;

    b.extrude(kneeOutline, {
      at: [cx, cy, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.006,
      smoothing: 0,
      bone,
      color: KRAFT_LIGHT,
      name: `s23KneePlate${sideName}`,
    });

    b.part(
      new THREE.BoxGeometry(0.235, 0.018, 0.012),
      EDGE,
      {
        bone,
        at: [cx, cy - 0.082, 0.278],
        name: `s23KneePlateBottom${sideName}`,
        flat: true,
      },
    );

    const chevrons = [
      { y: cy - 0.035, color: RED, flip: -1 },
      { y: cy + 0.018, color: KRAFT_DARK, flip: 1 },
      { y: cy + 0.071, color: RED, flip: -1 },
    ];

    chevrons.forEach((mark, i) => {
      const halfW = 0.034;
      const halfH = 0.020;
      const left: [number, number, number] = [
        cx - halfW,
        mark.y + mark.flip * halfH,
        0.282,
      ];
      const point: [number, number, number] = [cx, mark.y - mark.flip * halfH, 0.282];
      const right: [number, number, number] = [
        cx + halfW,
        mark.y + mark.flip * halfH,
        0.282,
      ];

      b.rod(left, point, 0.008, {
        bone,
        color: mark.color,
        caps: "flat",
        name: `s23KneeChevronA${sideName}${i}`,
      });
      b.rod(point, right, 0.008, {
        bone,
        color: mark.color,
        caps: "flat",
        name: `s23KneeChevronB${sideName}${i}`,
      });
    });

    for (const dx of [-0.082, 0.082]) {
      b.part(
        new THREE.CylinderGeometry(0.014, 0.014, 0.018, 8),
        KRAFT_DARK,
        {
          bone,
          at: [cx + dx, cy - 0.052, 0.292],
          dir: [0, 0, 1],
          name: `s23KneeRivet${sideName}${dx < 0 ? "A" : "B"}`,
          flat: true,
        },
      );
    }
  }
}
    return addArmClaws;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addBackpack(b: Builder) {
  const VENT = "#26343a";
  const COPPER = "#b8643c";
  const CYAN = "#50c5bd";
  const TAPE = "#e5b66d";
  const RUBBER = "#332a27";

  const bone = "spine";

  const box = (
    name: string,
    at: [number, number, number],
    size: [number, number, number],
    color: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name: `s24_${name}`,
      bone,
      at,
      flat: true,
    });

  const cylinder = (
    name: string,
    at: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    segments = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      name: `s24_${name}`,
      bone,
      at,
      dir: [0, 0, 1],
      flat: true,
    });

  // Raised central power block, seated just behind the existing backpack core.
  box("powerCore", [0, 1.49, -0.495], [0.28, 0.25, 0.075], KRAFT);
  box("powerCoreFace", [0, 1.49, -0.538], [0.205, 0.165, 0.012], KRAFT_LIGHT);
  box("powerCoreInset", [0, 1.49, -0.547], [0.145, 0.105, 0.009], EDGE);

  // A little stacked indicator window, like a hand-cut robot battery meter.
  box("meterFrame", [0, 1.505, -0.555], [0.095, 0.055, 0.008], INNER);
  box("meterA", [-0.028, 1.505, -0.561], [0.018, 0.026, 0.006], RED);
  box("meterB", [0, 1.505, -0.561], [0.018, 0.026, 0.006], COPPER);
  box("meterC", [0.028, 1.505, -0.561], [0.018, 0.026, 0.006], CYAN);

  // Four folded corner straps and oversized cardboard rivets.
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      box(
        `cornerStrap${sx > 0 ? "L" : "R"}${sy > 0 ? "T" : "B"}`,
        [sx * 0.255, 1.49 + sy * 0.19, -0.502],
        [0.045, 0.055, 0.018],
        TAPE,
      );
      cylinder(
        `cornerRivet${sx > 0 ? "L" : "R"}${sy > 0 ? "T" : "B"}`,
        [sx * 0.255, 1.49 + sy * 0.19, -0.517],
        0.018,
        0.012,
        KRAFT_HIGHLIGHT,
        8,
      );
    }
  }

  // Side vent housings with three dark slats each.
  for (const sx of [-1, 1]) {
    box(`ventHousing${sx > 0 ? "L" : "R"}`, [sx * 0.245, 1.48, -0.505], [0.105, 0.24, 0.028], KRAFT_DARK);
    for (let i = -1; i <= 1; i++) {
      box(
        `ventSlat${sx > 0 ? "L" : "R"}${i + 2}`,
        [sx * 0.245, 1.48 + i * 0.052, -0.525],
        [0.072, 0.018, 0.012],
        VENT,
      );
    }
    box(`ventTopTape${sx > 0 ? "L" : "R"}`, [sx * 0.245, 1.615, -0.526], [0.082, 0.018, 0.014], TAPE);
  }

  // Raised folded rim around the rear module.
  box("rimTop", [0, 1.685, -0.492], [0.58, 0.035, 0.032], KRAFT_HIGHLIGHT);
  box("rimBottom", [0, 1.295, -0.492], [0.58, 0.035, 0.032], KRAFT_DARK);
  box("rimLeft", [0.285, 1.49, -0.492], [0.035, 0.36, 0.032], KRAFT_HIGHLIGHT);
  box("rimRight", [-0.285, 1.49, -0.492], [0.035, 0.36, 0.032], KRAFT_HIGHLIGHT);

  // Square top handle: two short brackets and a thick bridge.
  box("handleBracketL", [0.14, 1.80, -0.405], [0.055, 0.16, 0.07], EDGE);
  box("handleBracketR", [-0.14, 1.80, -0.405], [0.055, 0.16, 0.07], EDGE);
  box("handleBridge", [0, 1.885, -0.405], [0.34, 0.055, 0.07], KRAFT_LIGHT);
  box("handleGrip", [0, 1.905, -0.445], [0.245, 0.045, 0.045], TAPE);

  // A small folded warning label on the upper rear panel.
  box("warningLabel", [0, 1.70, -0.525], [0.20, 0.075, 0.012], KRAFT_HIGHLIGHT);
  box("warningStripeA", [-0.055, 1.70, -0.534], [0.024, 0.065, 0.008], RED);
  box("warningStripeB", [0.0, 1.70, -0.534], [0.024, 0.065, 0.008], EDGE);
  box("warningStripeC", [0.055, 1.70, -0.534], [0.024, 0.065, 0.008], RED);

  // Three insulated cables hang from the lower edge, kept short so they remain inside the cleared room.
  const cable = (
    name: string,
    points: [number, number, number][],
    color: string,
  ) =>
    b.sweep(points, [0.014, 0.010], {
      name: `s24_${name}`,
      bone,
      color,
      section: { ngon: 6 },
      caps: "round",
      detail: 1,
    });

  cable(
    "cableRed",
    [
      [-0.16, 1.30, -0.515],
      [-0.17, 1.235, -0.532],
      [-0.13, 1.17, -0.52],
    ],
    RED,
  );
  cable(
    "cableBlue",
    [
      [0, 1.30, -0.52],
      [0.02, 1.225, -0.548],
      [0.06, 1.165, -0.528],
    ],
    BLUE,
  );
  cable(
    "cableDark",
    [
      [0.16, 1.30, -0.515],
      [0.18, 1.245, -0.54],
      [0.14, 1.185, -0.525],
    ],
    RUBBER,
  );

  // Chunky plug blocks at the ends of the cables.
  box("plugRed", [-0.13, 1.155, -0.525], [0.065, 0.05, 0.042], RED);
  box("plugBlue", [0.06, 1.15, -0.533], [0.065, 0.05, 0.042], BLUE);
  box("plugDark", [0.14, 1.17, -0.53], [0.065, 0.05, 0.042], RUBBER);

  // Two lower cardboard feet protect the cable roots and make the pack feel assembled.
  box("lowerGuardL", [-0.22, 1.285, -0.505], [0.10, 0.035, 0.04], TAPE);
  box("lowerGuardR", [0.22, 1.285, -0.505], [0.10, 0.035, 0.04], TAPE);
}
    return addBackpack;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addEarBolts(b: Builder) {
  const box = (
    name: string,
    at: [number, number, number],
    size: [number, number, number],
    color: string,
    bone: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      at,
      bone,
      flat: true,
    });

  const disc = (
    name: string,
    at: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    side: number,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      name,
      at,
      bone: "head",
      dir: [side, 0, 0],
      flat: true,
    });

  // Two layered, deliberately overbuilt cardboard ear-bolt mechanisms.
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const outward = side;

    disc(
      `s25EarBacking${tag}`,
      [side * 0.374, 2.10, 0],
      0.132,
      0.038,
      EDGE,
      outward,
    );

    disc(
      `s25EarBackingInset${tag}`,
      [side * 0.397, 2.10, 0],
      0.108,
      0.018,
      KRAFT_DARK,
      outward,
    );

    disc(
      `s25EarHub${tag}`,
      [side * 0.411, 2.10, 0],
      0.056,
      0.028,
      KRAFT_LIGHT,
      outward,
    );

    disc(
      `s25EarHubCap${tag}`,
      [side * 0.428, 2.10, 0],
      0.031,
      0.018,
      KRAFT_HIGHLIGHT,
      outward,
    );

    // Four square folded fasteners sit around each circular hub.
    const boltRadius = 0.084;
    const boltSize = 0.034;
    const boltPositions: [number, number][] = [
      [boltRadius, 0],
      [0, boltRadius],
      [-boltRadius, 0],
      [0, -boltRadius],
    ];

    for (let i = 0; i < boltPositions.length; i++) {
      const [dy, dz] = boltPositions[i];
      box(
        `s25EarFastener${tag}${i}`,
        [side * 0.432, 2.10 + dy, dz],
        [0.026, boltSize, boltSize],
        i % 2 === 0 ? KRAFT_HIGHLIGHT : KRAFT_LIGHT,
        "head",
      );

      // Tiny dark crease on the outer edge makes each fastener read as folded card.
      box(
        `s25EarFastenerCrease${tag}${i}`,
        [side * 0.447, 2.10 + dy, dz],
        [0.006, boltSize * 0.72, boltSize * 0.72],
        EDGE,
        "head",
      );
    }

    // A short radial seam breaks up the otherwise perfectly machined cardboard disc.
    box(
      `s25EarSeam${tag}`,
      [side * 0.441, 2.10, 0.074],
      [0.008, 0.012, 0.092],
      EDGE,
      "head",
    );
  }

  const glyphDark = EDGE;
  const glyphGold = KRAFT_HIGHLIGHT;

  // A dark pixel underlay gives the raised gold face glyph a hand-cut outline.
  box("s25GlyphUnderSmile", [0, 2.055, 0.361], [0.174, 0.032, 0.012], glyphDark, "head");
  box("s25GlyphUnderLeft", [-0.078, 2.082, 0.361], [0.032, 0.058, 0.012], glyphDark, "head");
  box("s25GlyphUnderRight", [0.078, 2.082, 0.361], [0.032, 0.058, 0.012], glyphDark, "head");

  // Gold pixel smile: squared corners, a low center, and a bright central tooth.
  box("s25GlyphSmileBase", [0, 2.056, 0.371], [0.142, 0.018, 0.012], glyphGold, "head");
  box("s25GlyphSmileLeft", [-0.061, 2.080, 0.371], [0.020, 0.047, 0.012], glyphGold, "head");
  box("s25GlyphSmileRight", [0.061, 2.080, 0.371], [0.020, 0.047, 0.012], glyphGold, "head");
  box("s25GlyphSmileTooth", [0, 2.070, 0.375], [0.028, 0.023, 0.012], KRAFT_LIGHT, "head");

  // Two tiny square signal marks float above the smile without competing with the eyes.
  box("s25GlyphSignalL", [-0.086, 2.178, 0.369], [0.026, 0.026, 0.012], glyphGold, "head");
  box("s25GlyphSignalR", [0.086, 2.178, 0.369], [0.026, 0.026, 0.012], glyphGold, "head");

  // Small dark registration ticks make the marks feel taped and hand-aligned.
  box("s25GlyphTickL", [-0.086, 2.178, 0.377], [0.010, 0.010, 0.008], EDGE, "head");
  box("s25GlyphTickR", [0.086, 2.178, 0.377], [0.010, 0.010, 0.008], EDGE, "head");
}
    return addEarBolts;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addBootTreads(b: Builder) {
  const treadBox = (
    name: string,
    at: [number, number, number],
    size: [number, number, number],
    color: string,
    bone: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      at,
      bone,
      flat: true,
    });

  const bootBones = [
    { side: "L", x: 0.2, bone: "ankleL" },
    { side: "R", x: -0.2, bone: "ankleR" },
  ];

  for (const { side, x, bone } of bootBones) {
    // Three broad, inset-looking rubber tread bars across each toe.
    for (let i = 0; i < 3; i++) {
      const z = 0.255 + i * 0.075;
      treadBox(
        `s26_bootTread${side}_${i}`,
        [x, 0.075, z],
        [0.31, 0.045, 0.045],
        RUBBER,
        bone,
      );

      // A narrow kraft highlight on the upper edge makes each tread read as folded material.
      treadBox(
        `s26_bootTreadEdge${side}_${i}`,
        [x, 0.102, z + 0.006],
        [0.285, 0.012, 0.012],
        KRAFT_DARK,
        bone,
      );
    }

    // Lighter toe cap, slightly proud of the existing dark boot.
    treadBox(
      `s26_bootToeCap${side}`,
      [x, 0.145, 0.445],
      [0. thirty ?? 0.30, 0.105, 0.035],
      KRAFT_LIGHT,
      bone,
    );

    // Folded heel tab at the rear edge, with a dark crease beneath it.
    treadBox(
      `s26_bootHeelTab${side}`,
      [x, 0.19, -0.145],
      [0.24, 0.13, 0.035],
      KRAFT,
      bone,
    );
    treadBox(
      `s26_bootHeelCrease${side}`,
      [x, 0.132, -0.162],
      [0.19, 0.018, 0.018],
      EDGE,
      bone,
    );

    // Two small square rivets on each toe cap.
    for (const sx of [-1, 1]) {
      treadBox(
        `s26_bootRivet${side}_${sx > 0 ? "L" : "R"}`,
        [x + sx * 0.105, 0.205, 0.448],
        [0.025, 0.025, 0.012],
        KRAFT_HIGHLIGHT,
        bone,
      );
    }
  }

  const cableBox = (
    name: string,
    at: [number, number, number],
    size: [number, number, number],
    color: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      at,
      bone: "spine",
      flat: true,
    });

  // Two stepped anchor blocks on the left side of the chest.
  cableBox("s26_cableAnchorUpper", [-0.235, 1.735, 0.345], [0.075, 0.07, 0.045], KRAFT_LIGHT);
  cableBox("s26_cableAnchorLower", [-0.30, 1.625, 0.345], [0.075, 0.07, 0.045], KRAFT_LIGHT);
  cableBox("s26_cableAnchorUpperCrease", [-0.235, 1.735, 0.371], [0.052, 0.012, 0.012], EDGE);
  cableBox("s26_cableAnchorLowerCrease", [-0.30, 1.625, 0.371], [0.052, 0.012, 0.012], EDGE);

  // Short diagonal cardboard/string runs, kept inside the requested clear chest room.
  b.rod(
    [-0.19, 1.735, 0.373],
    [-0.405, 1.785, 0.373],
    0.012,
    KRAFT_DARK,
    { bone: "spine", name: "s26_cableUpper", caps: "round" },
  );
  b.rod(
    [-0.255, 1.625, 0.373],
    [-0.405, 1.69, 0.373],
    0.012,
    EDGE,
    { bone: "spine", name: "s26_cableLower", caps: "round" },
  );

  // Bright connector block where both cables disappear toward the shoulder.
  cableBox("s26_cableConnector", [-0.405, 1.735, 0.374], [0.075, 0.095, 0.055], RED);
  cableBox("s26_cableConnectorBand", [-0.405, 1.735, 0.405], [0.045, 0.055, 0.012], KRAFT_HIGHLIGHT);
  cableBox("s26_cableConnectorSlot", [-0.405, 1.735, 0.413], [0.028, 0.025, 0.008], INNER);
}
    return addBootTreads;
  })(),
);
