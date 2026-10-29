import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame, line } from "../../../../src/index";

export const meta = {
  "name": "Cardboard Robo-Kid",
  "description": "A kid in a homemade cardboard robot costume: a taped-up kraft box torso with drawn dials and a bottle-cap jetpack, a box helmet with the kid's real face peeking through a cutout window, cardboard tube arms with box mitts, and craft boots."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  kraft: "#c99a5f",
  kraftPale: "#ddb87f",
  kraftDark: "#a1733c",
  tape: "#e6d3ab",
  silver: "#a9b2b8",
  ink: "#3a2c1c",
  red: "#e04a35",
  blue: "#2f6fbe",
  denim: "#56789f",
  yellow: "#f0c23c",
  green: "#3f9d4f",
  white: "#f4efe4",
  skin: "#efbd96",
  hair: "#6b4a2e",
  blush: "#f2a07c",
  tee: "#e07a3c",
  sole: "#5c4630",
};
const M = {
  neckHole: [0, 1.36, 0.05] as [number, number, number],
  shoulderL: [0.45, 1.18, 0.02] as [number, number, number],
  shoulderR: [-0.45, 1.18, 0.02] as [number, number, number],
  legL: [0.2, 0.57, 0] as [number, number, number],
  legR: [-0.2, 0.57, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torsoBox
  (() => {
function buildTorsoBox({ b, J, P, M }: any) {
  const bone = J.chest ?? J.hips;
  const K = P.kraft ?? P.hull ?? "#c99a5f";
  const KP = P.kraftPale ?? "#ddb87f";
  const KD = P.kraftDark ?? "#a1733c";
  const T = P.tape ?? "#e6d3ab";
  const S = P.silver ?? "#a9b2b8";
  const I = P.ink ?? "#3a2c1c";
  const R = P.red ?? "#e04a35";
  const B = P.blue ?? "#2f6fbe";
  const Y = P.yellow ?? "#f0c23c";
  const G = P.green ?? "#3f9d4f";
  const W = P.white ?? "#f4efe4";

  const box = (size: [number, number, number], at: [number, number, number], color = K, name = "torsoBox") =>
    b.part(new THREE.BoxGeometry(...size), color, { at, bone, name });

  const cyl = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    name = "torsoCylinder",
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir,
      bone,
      name,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name = "torsoRod",
  ) => b.rod(a, c, radius, { color, bone, name });

  const slab = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name = "torsoSlab",
  ) => box(size, at, color, name);

  // Main box: a deliberately assembled six-panel cardboard shell.
  slab([0.88, 0.82, 0.035], [0, 0.97, 0.282], KP, "frontPanel");
  slab([0.88, 0.82, 0.035], [0, 0.97, -0.282], K, "backPanel");
  slab([0.035, 0.82, 0.565], [0.422, 0.97, 0], K, "leftPanel");
  slab([0.035, 0.82, 0.565], [-0.422, 0.97, 0], K, "rightPanel");
  slab([0.88, 0.035, 0.565], [0, 0.575, 0], KD, "bottomPanel");
  slab([0.88, 0.035, 0.565], [0, 1.365, 0], KP, "topPanel");

  // Corrugated edge strips, slightly proud of the panels.
  const edge = 0.026;
  const front = 0.303;
  slab([edge, 0.84, 0.018], [-0.427, 0.97, front], KD, "frontEdgeL");
  slab([edge, 0.84, 0.018], [0.427, 0.97, front], KD, "frontEdgeR");
  slab([0.88, edge, 0.018], [0, 0.565, front], KD, "frontEdgeBottom");
  slab([0.88, edge, 0.018], [0, 1.375, front], KD, "frontEdgeTop");
  slab([edge, 0.84, 0.018], [-0.427, 0.97, -front], KD, "backEdgeL");
  slab([edge, 0.84, 0.018], [0.427, 0.97, -front], KD, "backEdgeR");
  slab([0.88, edge, 0.018], [0, 0.565, -front], KD, "backEdgeBottom");
  slab([0.88, edge, 0.018], [0, 1.375, -front], KD, "backEdgeTop");

  // Vertical front tape seam and short horizontal reinforcing tape.
  slab([0.06, 0.79, 0.012], [0, 0.97, 0.322], T, "frontTapeSeam");
  slab([0.86, 0.045, 0.012], [0, 1.315, 0.323], T, "topTape");
  slab([0.86, 0.045, 0.012], [0, 0.625, 0.323], T, "bottomTape");

  // A row of tiny corrugation ridges on the front edges.
  for (let i = 0; i < 11; i++) {
    const y = 0.61 + i * 0.071;
    slab([0.008, 0.035, 0.012], [-0.443, y, 0.318], KD, "corrugationL");
    slab([0.008, 0.035, 0.012], [0.443, y, 0.318], KD, "corrugationR");
  }

  // Brad rivets on front and rear corners.
  for (const x of [-0.405, 0.405]) {
    for (const y of [0.60, 1.34]) {
      cyl(0.014, 0.008, [x, y, 0.326], S, [0, 0, 1], "frontBrad", 8);
      cyl(0.014, 0.008, [x, y, -0.326], S, [0, 0, -1], "backBrad", 8);
    }
  }
  for (const z of [-0.24, 0.24]) {
    cyl(0.012, 0.008, [0.447, 0.97, z], S, [1, 0, 0], "sideBrad", 8);
    cyl(0.012, 0.008, [-0.447, 0.97, z], S, [-1, 0, 0], "sideBrad", 8);
  }

  // Side arm holes: dark inset discs, kraft rim, and tape collar.
  for (const s of [1, -1]) {
    cyl(0.091, 0.008, [s * 0.444, 1.18, 0.02], KD, [s, 0, 0], "armHole", 16);
    cyl(0.103, 0.018, [s * 0.456, 1.18, 0.02], T, [s, 0, 0], "armHoleTape", 16);
    cyl(0.079, 0.012, [s * 0.468, 1.18, 0.02], I, [s, 0, 0], "armHoleDark", 16);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const y = 1.18 + Math.sin(a) * 0.101;
      const z = 0.02 + Math.cos(a) * 0.101;
      cyl(0.006, 0.022, [s * 0.47, y, z], KD, [s, 0, 0], "holeFlute", 6);
    }
  }

  // Neck opening collar and top corrugated flap.
  cyl(0.115, 0.028, [0, 1.39, 0.03], T, [0, 1, 0], "neckTapeCollar", 16);
  cyl(0.094, 0.032, [0, 1.407, 0.03], KD, [0, 1, 0], "neckOpening", 16);
  slab([0.23, 0.018, 0.16], [0.19, 1.398, -0.02], KD, "topFlap");
  slab([0.18, 0.012, 0.10], [0.19, 1.412, 0.02], T, "topFlapTape");

  // Dial gauge backing, face and ink ring.
  cyl(0.116, 0.012, [-0.15, 1.08, 0.326], I, [0, 0, 1], "dialInkRim", 20);
  cyl(0.106, 0.014, [-0.15, 1.08, 0.334], W, [0, 0, 1], "dialPaper", 20);
  cyl(0.097, 0.005, [-0.15, 1.08, 0.344], KP, [0, 0, 1], "dialWarmFace", 20);
  // Dial ticks and coloured marker segments.
  for (let i = 0; i < 11; i++) {
    const a = (-135 + i * 27) * Math.PI / 180;
    const r0 = 0.073;
    const r1 = i % 2 === 0 ? 0.094 : 0.084;
    const p0: [number, number, number] = [-0.15 + Math.sin(a) * r0, 1.08 + Math.cos(a) * r0, 0.352];
    const p1: [number, number, number] = [-0.15 + Math.sin(a) * r1, 1.08 + Math.cos(a) * r1, 0.352];
    rod(p0, p1, i === 7 ? 0.006 : 0.003, i === 7 ? R : Y, "dialTick");
  }
  rod([-0.15, 1.08, 0.357], [-0.105, 1.135, 0.357], 0.006, I, "dialNeedle");
  cyl(0.012, 0.012, [-0.15, 1.08, 0.363], I, [0, 0, 1], "dialPivot", 10);
  slab([0.12, 0.012, 0.008], [-0.15, 1.025, 0.363], I, "dialLabel");

  // Three colourful control buttons with silver bases and dark outline rings.
  const buttonData: [number, string][] = [
    [1.16, R],
    [1.02, Y],
    [0.88, G],
  ];
  for (const [y, color] of buttonData) {
    cyl(0.044, 0.012, [0.20, y, 0.326], I, [0, 0, 1], "buttonOutline", 16);
    cyl(0.039, 0.015, [0.20, y, 0.337], S, [0, 0, 1], "buttonBase", 16);
    cyl(0.032, 0.024, [0.20, y, 0.353], color, [0, 0, 1], "button", 12);
    cyl(0.007, 0.005, [0.19, y + 0.012, 0.369], W, [0, 0, 1], "buttonGlint", 8);
  }

  // Hand-cut red paper heart, built from overlapping pointed paper pieces.
  const heart = new THREE.Shape();
  heart.moveTo(0, -0.045);
  heart.lineTo(-0.058, 0.018);
  heart.quadraticCurveTo(-0.064, 0.073, 0, 0.043);
  heart.quadraticCurveTo(0.064, 0.073, 0.058, 0.018);
  heart.lineTo(0, -0.045);
  const heartGeo = new THREE.ExtrudeGeometry(heart, { depth: 0.008, bevelEnabled: false, curveSegments: 3 });
  heartGeo.translate(0, 0, -0.004);
  b.part(heartGeo, R, { at: [-0.15, 0.84, 0.345], bone, name: "paperHeart" });
  rod([-0.15, 0.805, 0.355], [-0.15, 0.875, 0.355], 0.003, "#b82e29", "heartFold");

  // Label plate and childish marker scribbles.
  slab([0.21, 0.075, 0.012], [0.16, 0.72, 0.33], W, "nameLabel");
  slab([0.21, 0.008, 0.012], [0.16, 0.682, 0.338], KD, "labelBottom");
  rod([0.085, 0.735, 0.342], [0.125, 0.748, 0.342], 0.003, I, "scribble1");
  rod([0.13, 0.748, 0.342], [0.17, 0.732, 0.342], 0.003, I, "scribble2");
  rod([0.175, 0.732, 0.342], [0.22, 0.748, 0.342], 0.003, I, "scribble3");
  rod([0.10, 0.715, 0.342], [0.155, 0.702, 0.342], 0.0025, I, "scribble4");
  rod([0.17, 0.704, 0.342], [0.215, 0.718, 0.342], 0.0025, I, "scribble5");

  // Marker doodles: lightning bolts and stars on the front corners.
  rod([-0.35, 1.25, 0.337], [-0.325, 1.22, 0.337], 0.004, I, "doodleBolt");
  rod([-0.325, 1.22, 0.337], [-0.35, 1.20, 0.337], 0.004, I, "doodleBolt");
  rod([-0.35, 1.20, 0.337], [-0.31, 1.20, 0.337], 0.004, I, "doodleBolt");
  rod([0.31, 0.67, 0.337], [0.36, 0.70, 0.337], 0.003, I, "doodleSlash");
  rod([0.36, 0.70, 0.337], [0.32, 0.75, 0.337], 0.003, I, "doodleSlash");

  // Back plate, bottle-cap jetpack, bands, nozzles and doodles.
  slab([0.52, 0.57, 0.025], [0, 0.93, -0.315], KD, "jetpackBackPlate");
  for (const s of [-1, 1]) {
    const x = s * 0.16;
    cyl(0.091, 0.24, [x, 0.92, -0.405], K, [0, 0, 1], "boosterTank", 12);
    cyl(0.096, 0.018, [x, 0.92, -0.285], T, [0, 0, 1], "boosterTopTape", 12);
    cyl(0.098, 0.035, [x, 0.92, -0.405], Y, [0, 0, 1], "yellowBoosterBand", 12);
    cyl(0.078, 0.018, [x, 0.92, -0.535], KD, [0, 0, 1], "boosterNozzle", 10);
    const cone = new THREE.ConeGeometry(0.065, 0.10, 8);
    b.part(cone, KD, { at: [x, 0.92, -0.585], dir: [0, 0, -1], bone, name: "boosterCone" });
    rod([x - 0.035, 0.94, -0.51], [x + 0.035, 0.90, -0.51], 0.003, I, "jetDoodle");
    rod([x + 0.035, 0.94, -0.51], [x - 0.035, 0.90, -0.51], 0.003, I, "jetDoodle");
  }
  cyl(0.018, 0.06, [0, 1.13, -0.342], S, [0, 0, 1], "jetpackMount", 8);

  // A few raised tape tabs make the construction feel physically assembled.
  slab([0.08, 0.10, 0.014], [-0.34, 1.36, 0.327], T, "tapeTabL");
  slab([0.08, 0.10, 0.014], [0.34, 1.36, 0.327], T, "tapeTabR");
  slab([0.07, 0.09, 0.014], [-0.34, 0.58, 0.327], T, "tapeTabBottomL");
  slab([0.07, 0.09, 0.014], [0.34, 0.58, 0.327], T, "tapeTabBottomR");
}
    return buildTorsoBox;
  })(),
  // helmet
  (() => {
function buildHelmet({ b, J, P, M }: Ctx) {
  const kraft = P.kraft;
  const kraftPale = P.kraftPale;
  const kraftDark = P.kraftDark;
  const tape = P.tape;
  const silver = P.silver;
  const ink = P.ink;
  const skin = P.skin;
  const hair = P.hair;
  const blush = P.blush;
  const white = P.white;
  const red = P.red;

  const head = J.head;
  const jaw = J.jaw;
  const neck = J.neck;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bone: any = head,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at,
      name,
      flat: true,
    });

  const disc = (
    radius: number,
    at: [number, number, number],
    color: string,
    bone: any = head,
    name?: string,
    depth = 0.012,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      bone,
      at,
      dir: [0, 0, 1],
      axis: "z",
      name,
      flat: true,
    });

  const frontBar = (
    size: [number, number],
    at: [number, number, number],
    color: string,
    bone: any = head,
    name?: string,
  ) => box([size[0], size[1], 0.018], at, color, bone, name);

  const sideBar = (
    size: [number, number],
    at: [number, number, number],
    color: string,
    bone: any = head,
    name?: string,
  ) => box([0.018, size[0], size[1]], at, color, bone, name);

  // Main five-sided-feeling cardboard helmet shell.
  box([0.52, 0.50, 0.54], [0, 1.63, 0], kraft, head, "helmetShell");

  // Slightly lighter front panel, like a replacement flap taped onto the box.
  box([0.455, 0.415, 0.012], [0, 1.635, 0.273], kraftPale, head, "frontFlap");

  // Corrugated dark strips along the helmet's silhouette.
  const edge = 0.026;
  frontBar([0.52, edge], [0, 1.875, 0.282], kraftDark, head, "topFrontEdge");
  frontBar([0.52, edge], [0, 1.385, 0.282], kraftDark, head, "bottomFrontEdge");
  frontBar([edge, 0.50], [0.247, 1.63, 0.282], kraftDark, head, "leftFrontEdge");
  frontBar([edge, 0.50], [-0.247, 1.63, 0.282], kraftDark, head, "rightFrontEdge");

  sideBar([0.50, edge], [0.282, 1.63, 0], kraftDark, head, "leftSideTopEdge");
  sideBar([0.50, edge], [-0.282, 1.63, 0], kraftDark, head, "rightSideTopEdge");
  box([0.026, 0.50, 0.026], [0.247, 1.63, -0.247], kraftDark, head, "backLeftEdge");
  box([0.026, 0.50, 0.026], [-0.247, 1.63, -0.247], kraftDark, head, "backRightEdge");

  // Bottom tape rim, meeting the torso's neck collar.
  box([0.56, 0.045, 0.57], [0, 1.395, 0], tape, neck, "helmetBottomTape");
  frontBar([0.56, 0.022], [0, 1.405, 0.288], kraftDark, neck, "bottomTapeCorrugation");

  // Small strips of tape running over the top corners.
  box([0.055, 0.035, 0.31], [0.205, 1.892, -0.01], tape, head, "topTapeL");
  box([0.055, 0.035, 0.31], [-0.205, 1.892, -0.01], tape, head, "topTapeR");

  // Window opening: dark cut edge first, then face set just inside it.
  box([0.335, 0.275, 0.018], [0, 1.635, 0.285], kraftDark, head, "windowCutEdge");
  box([0.292, 0.232, 0.012], [0, 1.635, 0.298], skin, head, "faceThroughWindow");

  // A soft, broad lower face/chin rides the jaw so it can open independently.
  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    skin,
    {
      bone: jaw,
      at: [0, 1.585, 0.307],
      scale: [0.125, 0.083, 0.035],
      name: "movingChin",
      flat: true,
    },
  );

  // White eye ovals, with dark pupils and tiny square-ish highlights.
  for (const s of [-1, 1]) {
    disc(0.040, [s * 0.078, 1.657, 0.319], white, head, `eyeWhite${s}`);
    disc(0.018, [s * 0.078, 1.657, 0.337], ink, head, `eyePupil${s}`, 0.009);
    disc(0.0055, [s * 0.070, 1.668, 0.344], white, head, `eyeGlint${s}`, 0.006);

    // Blush patches are deliberately offset outward, like marker-painted cheeks.
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      blush,
      {
        bone: head,
        at: [s * 0.103, 1.602, 0.321],
        scale: [0.031, 0.015, 0.008],
        name: `blush${s}`,
        flat: true,
      },
    );

    // Angular brows made from two short marker strokes.
    b.rod(
      [s * 0.115, 1.704, 0.326],
      [s * 0.035, 1.716, 0.326],
      0.009,
      { color: ink, bone: head, name: `brow${s}` },
    );

    // Two tiny lower lashes / cheek marks.
    b.rod(
      [s * 0.112, 1.645, 0.337],
      [s * 0.127, 1.638, 0.337],
      0.004,
      { color: ink, bone: head, name: `lash${s}` },
    );
  }

  // Nose bump.
  b.part(
    new THREE.SphereGeometry(0.018, 8, 6),
    skin,
    {
      bone: head,
      at: [0, 1.625, 0.342],
      scale: [1, 0.8, 0.7],
      name: "nose",
      flat: true,
    },
  );

  // Smiling mouth on the separate jaw piece: two short curved-looking marker strokes.
  b.rod(
    [-0.045, 1.565, 0.344],
    [0, 1.552, 0.348],
    0.005,
    { color: ink, bone: jaw, name: "smileL" },
  );
  b.rod(
    [0, 1.552, 0.348],
    [0.045, 1.565, 0.344],
    0.005,
    { color: ink, bone: jaw, name: "smileR" },
  );

  // Four chunky hair fringe flaps overlapping the window's top edge.
  const fringe = [
    [-0.145, 1.755, 0.311, -0.10],
    [-0.050, 1.765, 0.315, -0.14],
    [0.050, 1.765, 0.315, -0.14],
    [0.145, 1.752, 0.311, -0.10],
  ] as const;

  for (let i = 0; i < fringe.length; i++) {
    const [x, y, z, lean] = fringe[i];
    const tuft = b.extrude(
      [
        [-0.038, 0],
        [0.038, 0],
        [0.027, -0.075],
        [0, -0.105],
        [-0.027, -0.075],
      ],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, lean],
        thickness: 0.014,
        color: hair,
        bone: head,
        bevel: 0.004,
        name: `hairFringe${i}`,
      },
    );
    // Small dark root line gives each flap a handmade cut edge.
    b.rod(
      [x - 0.028, y + 0.004, z + 0.010],
      [x + 0.028, y + 0.004, z + 0.010],
      0.003,
      { color: kraftDark, bone: head, name: `hairRoot${i}` },
    );
    void tuft;
  }

  // Silver brad rivets on the front corners and lower shell corners.
  const rivets: [number, number, number][] = [
    [-0.228, 1.855, 0.300],
    [0.228, 1.855, 0.300],
    [-0.228, 1.410, 0.300],
    [0.228, 1.410, 0.300],
    [-0.228, 1.855, -0.272],
    [0.228, 1.855, -0.272],
    [-0.228, 1.410, -0.272],
    [0.228, 1.410, -0.272],
  ];
  rivets.forEach((p, i) => disc(0.012, p, silver, head, `brad${i}`, 0.009));

  // Side bolts: cylinders aimed sideways, with dark marker rings at their bases.
  for (const s of [-1, 1]) {
    const x = s * 0.276;
    b.part(
      new THREE.CylinderGeometry(0.040, 0.040, 0.035, 10),
      kraft,
      {
        bone: head,
        at: [x, 1.66, 0.06],
        dir: [s, 0, 0],
        name: `sideBolt${s}`,
        flat: true,
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.048, 0.048, 0.006, 12),
      ink,
      {
        bone: head,
        at: [s * 0.258, 1.66, 0.06],
        dir: [s, 0, 0],
        name: `sideBoltRing${s}`,
        flat: true,
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.031, 0.031, 0.040, 10),
      kraftPale,
      {
        bone: head,
        at: [s * 0.295, 1.66, 0.06],
        dir: [s, 0, 0],
        name: `sideBoltCap${s}`,
        flat: true,
      },
    );
  }

  // Antenna base tape collar.
  b.part(
    new THREE.CylinderGeometry(0.035, 0.040, 0.055, 10),
    tape,
    {
      bone: head,
      at: [0, 1.895, 0],
      name: "antennaTape",
      flat: true,
    },
  );
  b.rod(
    [0, 1.91, 0],
    [0, 2.12, 0],
    0.008,
    { color: kraftDark, bone: head, name: "antennaRod" },
  );
  b.part(
    new THREE.SphereGeometry(0.045, 10, 6),
    red,
    {
      bone: head,
      at: [0, 2.145, 0],
      name: "antennaRedBall",
      flat: true,
    },
  );
  b.part(
    new THREE.SphereGeometry(0.017, 8, 5),
    white,
    {
      bone: head,
      at: [-0.014, 2.160, 0.032],
      name: "antennaGlint",
      flat: true,
    },
  );

  // A few hand-drawn marker scratches on the side panels.
  b.rod(
    [0.270, 1.735, 0.08],
    [0.270, 1.685, 0.08],
    0.003,
    { color: ink, bone: head, name: "sideDoodleA" },
  );
  b.rod(
    [0.270, 1.675, 0.08],
    [0.270, 1.635, 0.105],
    0.003,
    { color: ink, bone: head, name: "sideDoodleB" },
  );
  b.rod(
    [-0.270, 1.535, 0.08],
    [-0.270, 1.585, 0.08],
    0.003,
    { color: ink, bone: head, name: "sideDoodleC" },
  );
}
    return buildHelmet;
  })(),
  // armL
  (() => {
function buildArmL({ b, J, P, M }: Ctx) {
  const kraft = P.kraft;
  const dark = P.kraftDark;
  const tape = P.tape;
  const tee = P.tee;
  const ink = P.ink;
  const silver = P.silver;

  const shoulder = J.shoulderL;
  const elbow = J.elbowL;
  const wrist = J.wristL;

  const shoulderAt = shoulder.at;
  const elbowAt = elbow.at;
  const wristAt = wrist.at;

  const midway = (a: THREE.Vector3, c: THREE.Vector3) =>
    new THREE.Vector3().addVectors(a, c).multiplyScalar(0.5);

  const direction = (a: THREE.Vector3, c: THREE.Vector3) =>
    new THREE.Vector3().subVectors(c, a).normalize();

  const segment = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    const d = direction(a, c);
    const mid = midway(a, c);
    return b.sweep([a, c], radius, {
      color,
      bone,
      caps: "round",
      sides: 8,
      name,
      section: "circle",
    });
  };

  const collar = (
    center: THREE.Vector3,
    axis: THREE.Vector3,
    radius: number,
    length: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, length, 10, 1, false),
      color,
      {
        at: center,
        dir: axis,
        bone,
        name,
        flat: true,
      },
    );
  };

  // Cardboard tube upper arm, rooted exactly at the shoulder hole.
  segment(
    shoulderAt,
    elbowAt,
    0.07,
    kraft,
    shoulder,
    "armL.upperCardboardTube",
  );

  // Slightly darker inset strip along the lower/outside edge of the upper tube,
  // suggesting a folded cardboard seam.
  const upperSeamA = new THREE.Vector3(0.489, 1.151, 0.076);
  const upperSeamB = new THREE.Vector3(0.689, 0.951, 0.076);
  b.sweep([upperSeamA, upperSeamB], 0.009, {
    color: dark,
    bone: shoulder,
    caps: "flat",
    sides: 6,
    name: "armL.upperFoldSeam",
  });

  // Tee shirt showing inside the shoulder opening.
  const shoulderDir = direction(shoulderAt, elbowAt);
  const shoulderSleeveCenter = shoulderAt
    .clone()
    .addScaledVector(shoulderDir, 0.035);
  collar(
    shoulderSleeveCenter,
    shoulderDir,
    0.085,
    0.07,
    tee,
    shoulder,
    "armL.teeSleeveRing",
  );

  // Tape wrapped over the cardboard/tee junction.
  const tapeShoulderCenter = shoulderAt
    .clone()
    .addScaledVector(shoulderDir, 0.075);
  collar(
    tapeShoulderCenter,
    shoulderDir,
    0.078,
    0.027,
    tape,
    shoulder,
    "armL.shoulderTapeRim",
  );

  // Two small tape bands crossing the sleeve ring for handmade construction.
  const tapeBand1 = shoulderAt
    .clone()
    .addScaledVector(shoulderDir, 0.02);
  const tapeBand2 = shoulderAt
    .clone()
    .addScaledVector(shoulderDir, 0.095);
  collar(tapeBand1, shoulderDir, 0.087, 0.012, tape, shoulder, "armL.sleeveTapeA");
  collar(tapeBand2, shoulderDir, 0.08, 0.012, tape, shoulder, "armL.sleeveTapeB");

  // Cardboard forearm.
  segment(
    elbowAt,
    wristAt,
    0.065,
    kraft,
    elbow,
    "armL.forearmCardboardTube",
  );

  // Bold corrugated-looking elbow cuff: dark core plus four lighter flutes.
  const elbowDir = direction(shoulderAt, wristAt);
  collar(elbowAt, elbowDir, 0.075, 0.065, dark, elbow, "armL.elbowCorrugatedCuff");
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const radial = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const fluteCenter = elbowAt.clone().addScaledVector(radial, 0.068);
    b.part(
      new THREE.BoxGeometry(0.012, 0.072, 0.012),
      kraft,
      {
        at: fluteCenter,
        dir: elbowDir,
        bone: elbow,
        name: `armL.elbowFlute${i}`,
        flat: true,
      },
    );
  }

  // A narrow tan tape cuff immediately above the mitten.
  const wristDir = direction(elbowAt, wristAt);
  const cuffCenter = wristAt.clone().addScaledVector(wristDir, -0.018);
  collar(cuffCenter, wristDir, 0.073, 0.042, tape, wrist, "armL.wristTapeCuff");

  // Chunky cardboard box mitten.
  const mittCenter = new THREE.Vector3(0.78, 0.62, 0.03);
  b.part(
    new THREE.BoxGeometry(0.2, 0.2, 0.16),
    kraft,
    {
      at: mittCenter,
      bone: wrist,
      name: "armL.boxMitt",
      flat: true,
    },
  );

  // Dark folded edge strips on all visible mitten edges.
  const edgePieces: Array<[THREE.Vector3, THREE.Vector3]> = [
    [new THREE.Vector3(0.78, 0.525, 0.114), new THREE.Vector3(0.78, 0.715, 0.114)],
    [new THREE.Vector3(0.685, 0.62, 0.114), new THREE.Vector3(0.875, 0.62, 0.114)],
    [new THREE.Vector3(0.685, 0.62, -0.054), new THREE.Vector3(0.875, 0.62, -0.054)],
    [new THREE.Vector3(0.685, 0.525, 0.03), new THREE.Vector3(0.685, 0.715, 0.03)],
    [new THREE.Vector3(0.875, 0.525, 0.03), new THREE.Vector3(0.875, 0.715, 0.03)],
  ];

  edgePieces.forEach(([a, c], i) => {
    b.rod(a, c, 0.012, {
      color: dark,
      bone: wrist,
      caps: "flat",
      sides: 5,
      name: `armL.mittFold${i}`,
    });
  });

  // A small inward-facing thumb block, tucked toward the torso.
  b.part(
    new THREE.BoxGeometry(0.055, 0.075, 0.065),
    kraft,
    {
      at: new THREE.Vector3(0.685, 0.595, 0.035),
      bone: wrist,
      name: "armL.cardboardThumb",
      flat: true,
    },
  );

  // Thumb fold line and two tiny silver brads on the mitten.
  b.rod(
    new THREE.Vector3(0.681, 0.575, 0.07),
    new THREE.Vector3(0.681, 0.625, 0.07),
    0.004,
    {
      color: ink,
      bone: wrist,
      caps: "flat",
      sides: 5,
      name: "armL.thumbInkFold",
    },
  );

  for (const [i, p] of [
    [0, new THREE.Vector3(0.704, 0.705, 0.114)],
    [1, new THREE.Vector3(0.856, 0.705, 0.114)],
  ] as Array<[number, THREE.Vector3]>) {
    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8),
      silver,
      {
        at: p,
        dir: [0, 0, 1],
        bone: wrist,
        name: `armL.mittBrad${i}`,
        flat: true,
      },
    );
  }

  // Three hand-drawn marker knuckle strokes on the front face.
  const knuckleYs = [0.655, 0.625, 0.595];
  knuckleYs.forEach((y, i) => {
    const a = new THREE.Vector3(0.748, y, 0.115);
    const c = new THREE.Vector3(0.812, y + (i === 1 ? -0.006 : 0.004), 0.115);
    b.rod(a, c, 0.005, {
      color: ink,
      bone: wrist,
      caps: "flat",
      sides: 5,
      name: `armL.mittKnuckle${i}`,
    });
  });

  // A few short, irregular marker hatch marks make the cardboard feel handmade.
  b.rod(
    new THREE.Vector3(0.704, 0.545, 0.116),
    new THREE.Vector3(0.73, 0.555, 0.116),
    0.003,
    { color: ink, bone: wrist, caps: "flat", sides: 5, name: "armL.mittDoodleA" },
  );
  b.rod(
    new THREE.Vector3(0.83, 0.55, 0.116),
    new THREE.Vector3(0.855, 0.542, 0.116),
    0.003,
    { color: ink, bone: wrist, caps: "flat", sides: 5, name: "armL.mittDoodleB" },
  );

  // A tiny kraft-dark patch where the wrist cuff disappears into the mitt.
  b.part(
    new THREE.BoxGeometry(0.13, 0.025, 0.13),
    dark,
    {
      at: new THREE.Vector3(0.78, 0.715, 0.03),
      bone: wrist,
      name: "armL.mittNeckFold",
      flat: true,
    },
  );
}
    return buildArmL;
  })(),
  // armR
  (() => {
function buildArmR({ b, J, P, M }: Ctx) {
  const kraft = P.kraft;
  const kraftDark = P.kraftDark;
  const tape = P.tape;
  const tee = P.tee;
  const ink = P.ink;
  const silver = P.silver;

  const shoulder = J.shoulderR;
  const elbow = J.elbowR;
  const wrist = J.wristR;

  const upper = b.rod(shoulder, elbow, 0.07, {
    color: kraft,
    bone: shoulder,
    section: { ngon: 8 },
    caps: "round",
    name: "armR.upperTube",
    group: "armR",
  });

  const forearm = b.rod(elbow, wrist, 0.065, {
    color: kraft,
    bone: elbow,
    section: { ngon: 8 },
    caps: "round",
    name: "armR.forearmTube",
    group: "armR",
  });

  const shoulderDir = new THREE.Vector3(-0.7, -0.7, 0).normalize();
  const elbowDir = new THREE.Vector3(-0.4, -0.9, 0).normalize();
  const wristDir = new THREE.Vector3(-0.15, -0.98, 0).normalize();

  const sleeve = b.part(
    new THREE.CylinderGeometry(0.085, 0.085, 0.075, 10),
    tee,
    {
      bone: shoulder,
      at: shoulder.at.clone().addScaledVector(shoulderDir, 0.035),
      dir: shoulderDir,
      axis: "y",
      name: "armR.teeSleeve",
      group: "armR",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.091, 0.091, 0.018, 10),
    tape,
    {
      bone: shoulder,
      at: shoulder.at.clone().addScaledVector(shoulderDir, 0.075),
      dir: shoulderDir,
      axis: "y",
      name: "armR.shoulderTapeRim",
      group: "armR",
    },
  );

  const elbowBand = b.part(
    new THREE.CylinderGeometry(0.076, 0.076, 0.045, 8),
    kraftDark,
    {
      bone: elbow,
      at: elbow.at,
      dir: elbowDir,
      axis: "y",
      name: "armR.elbowCorrugatedBand",
      group: "armR",
    },
  );

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const radial = new THREE.Vector3(Math.cos(a) * 0.077, 0, Math.sin(a) * 0.077);
    b.part(
      new THREE.BoxGeometry(0.008, 0.052, 0.012),
      kraftDark,
      {
        bone: elbow,
        at: elbow.at.clone().add(radial),
        dir: elbowDir,
        axis: "y",
        name: `armR.elbowFlute${i}`,
        group: "armR",
      },
    );
  }

  b.part(
    new THREE.CylinderGeometry(0.073, 0.073, 0.035, 10),
    tape,
    {
      bone: wrist,
      at: wrist.at.clone().addScaledVector(wristDir, -0.012),
      dir: wristDir,
      axis: "y",
      name: "armR.wristTapeCuff",
      group: "armR",
    },
  );

  const mittCenter = new THREE.Vector3(-0.78, 0.62, 0.03);
  const mitt = b.part(
    new THREE.BoxGeometry(0.2, 0.2, 0.16),
    kraft,
    {
      bone: wrist,
      at: mittCenter,
      name: "armR.boxMitt",
      group: "armR",
    },
  );

  const edge = 0.008;
  const x0 = -0.78;
  const y0 = 0.62;
  const z0 = 0.03;

  const edgeParts: Array<[THREE.Vector3, [number, number, number], string]> = [
    [new THREE.Vector3(x0 - 0.096, y0, z0), [edge, 0.216, edge], "left"],
    [new THREE.Vector3(x0 + 0.096, y0, z0), [edge, 0.216, edge], "right"],
    [new THREE.Vector3(x0, y0 + 0.096, z0), [0.216, edge, edge], "top"],
    [new THREE.Vector3(x0, y0 - 0.096, z0), [0.216, edge, edge], "bottom"],
    [new THREE.Vector3(x0, y0, z0 - 0.076), [0.216, 0.216, edge], "back"],
  ];

  for (const [at, size, label] of edgeParts) {
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), kraftDark, {
      bone: wrist,
      at,
      name: `armR.mittCorrugated.${label}`,
      group: "armR",
    });
  }

  // Thumb block points inward toward the torso.
  b.part(
    new THREE.BoxGeometry(0.055, 0.07, 0.07),
    kraft,
    {
      bone: wrist,
      at: new THREE.Vector3(-0.675, 0.59, 0.025),
      name: "armR.mittThumb",
      group: "armR",
    },
  );

  // Small silver brads on the front corners.
  for (const x of [-0.86, -0.70]) {
    for (const y of [0.54, 0.70]) {
      b.part(
        new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8),
        silver,
        {
          bone: wrist,
          at: new THREE.Vector3(x, y, 0.114),
          dir: [0, 0, 1],
          axis: "y",
          name: "armR.mittBrad",
          group: "armR",
        },
      );
    }
  }

  // Three hand-drawn marker strokes on the front face.
  const knuckles = [
    [-0.835, 0.655, 0.116],
    [-0.78, 0.665, 0.117],
    [-0.725, 0.655, 0.116],
  ] as const;

  for (let i = 0; i < knuckles.length; i++) {
    const [x, y, z] = knuckles[i];
    b.rod(
      [x - 0.018, y - 0.012, z],
      [x + 0.018, y + 0.012, z],
      0.004,
      {
        color: ink,
        bone: wrist,
        caps: "round",
        name: `armR.knuckleMark${i}`,
        group: "armR",
      },
    );
  }

  // A tiny taped seam where the mitt meets the cuff.
  b.part(
    new THREE.BoxGeometry(0.15, 0.018, 0.17),
    tape,
    {
      bone: wrist,
      at: new THREE.Vector3(-0.78, 0.715, 0.03),
      name: "armR.mittNeckTape",
      group: "armR",
    },
  );

  return { sleeve, mitt, upper, forearm };
}
    return buildArmR;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const denim = P.denim;
  const white = P.white;
  const kraft = P.kraft;
  const dark = P.kraftDark;
  const tape = P.tape;
  const sole = P.sole;
  const red = P.red;
  const ink = P.ink;

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: any,
    name: string,
  ) => b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    name,
    flat: true,
  });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    bone: any,
    name: string,
    segments = 10,
  ) => b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    bone,
    name,
    flat: true,
  });

  const rod = (
    a: any,
    c: any,
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, {
    color,
    bone: a.bone ?? a,
    caps: "round",
    section: { ngon: 8 },
    name,
  });

  const addBootDetails = (s: number, foot: any) => {
    const x = s * 0.2;
    const bone = foot;

    // Broad sole, sunk just enough to make y = 0 the contact plane.
    box([0.24, 0.02, 0.34], sole, [x, 0.01, 0.065], bone, `boot${s > 0 ? "L" : "R"}_sole`);

    // Main handmade cardboard boot.
    box([0.22, 0.13, 0.32], kraft, [x, 0.075, 0.06], bone, `boot${s > 0 ? "L" : "R"}_box`);

    // Dark corrugated toe strip on the front face.
    box([0.22, 0.026, 0.018], dark, [x, 0.078, 0.224], bone, `boot${s > 0 ? "L" : "R"}_toeEdge`);

    // Tape ankle strap.
    box([0.235, 0.025, 0.335], tape, [x, 0.135, 0.06], bone, `boot${s > 0 ? "L" : "R"}_ankleTape`);

    // Three small marker lace crosses on the front.
    const laceZ = 0.226;
    for (let i = 0; i < 3; i++) {
      const y = 0.045 + i * 0.035;
      box([0.052, 0.008, 0.009], ink, [x, y, laceZ], bone, `boot${s > 0 ? "L" : "R"}_laceH${i}`);
      box([0.009, 0.008, 0.052], ink, [x, y, laceZ + 0.002], bone, `boot${s > 0 ? "L" : "R"}_laceV${i}`);
    }

    // Red paper patch on the outward-facing side.
    const outerX = x + s * 0.116;
    box([0.008, 0.045, 0.042], red, [outerX, 0.075, 0.075], bone, `boot${s > 0 ? "L" : "R"}_patch`);

    // Tiny ink mark over the patch.
    box([0.009, 0.006, 0.026], ink, [outerX + s * 0.005, 0.075, 0.075], bone, `boot${s > 0 ? "L" : "R"}_patchMark`);
    box([0.009, 0.026, 0.006], ink, [outerX + s * 0.005, 0.075, 0.075], bone, `boot${s > 0 ? "L" : "R"}_patchMark2`);
  };

  const addLeg = (s: number, hip: any, knee: any, foot: any) => {
    const side = s > 0 ? "L" : "R";

    // Pants are intentionally visible above and behind the boots.
    rod(hip, knee, 0.07, denim, `pants${side}_upper`);
    rod(knee, foot, 0.068, denim, `pants${side}_lower`);

    // White sock band immediately above the boot.
    cylinder(0.073, 0.032, white, [s * 0.2, 0.155, 0.025], foot, `sock${side}`, 10);

    // A second thin denim cuff makes the costume layering readable.
    cylinder(0.075, 0.018, denim, [s * 0.2, 0.185, 0.02], knee, `pants${side}_cuff`, 10);

    addBootDetails(s, foot);
  };

  addLeg(1, J.hipL, J.kneeL, J.footL);
  addLeg(-1, J.hipR, J.kneeR, J.footR);
}
    return buildLegs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cardboardRoboKid" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.78,0], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,1,0], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.3,0], dir: [0,1,0], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.42,0], dir: [0,1,0], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.53,0.2], dir: [0,-0.25,1], role: "jaw" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.45,1.18,0.02], dir: [0.7,-0.7,0], role: "arm", group: "armL" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.65,0.98,0.02], dir: [0.4,-0.9,0], role: "arm", group: "armL" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.76,0.72,0.03], dir: [0.15,-0.98,0], role: "arm", group: "armL" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.45,1.18,0.02], dir: [-0.7,-0.7,0], role: "arm", group: "armR" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.65,0.98,0.02], dir: [-0.4,-0.9,0], role: "arm", group: "armR" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.76,0.72,0.03], dir: [-0.15,-0.98,0], role: "arm", group: "armR" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.2,0.62,0], dir: [0,-1,0], role: "leg", group: "legL" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.2,0.34,0], dir: [0,-1,0], role: "leg", group: "legL" });
  J["footL"] = b.joint("footL", { parent: J["kneeL"], at: [0.2,0.11,0.05], dir: [0,0.15,1], role: "leg", group: "legL" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.2,0.62,0], dir: [0,-1,0], role: "leg", group: "legR" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.2,0.34,0], dir: [0,-1,0], role: "leg", group: "legR" });
  J["footR"] = b.joint("footR", { parent: J["kneeR"], at: [-0.2,0.11,0.05], dir: [0,0.15,1], role: "leg", group: "legR" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
