import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Box Bot Kid",
  "description": "A kid in a homemade cardboard-box robot costume: kraft-brown box torso and box head with a face window, drawn-on control panel, tube gauntlets, mitten hands, sneakers and a rocket pack with tissue-paper flames."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  kraft: "#c9955a",
  kraftDark: "#a5763f",
  kraftLight: "#e3b877",
  tape: "#d9d2c0",
  marker: "#4a3826",
  red: "#d94f3d",
  blue: "#3f6fae",
  skin: "#f2b48c",
  hair: "#5a3a22",
  eyeWhite: "#fdfdfd",
  iris: "#6a4a2c",
  sock: "#f2efe6",
  shoe: "#cd4a32",
  sole: "#f2efe6",
  denim: "#51719c",
  flame: "#ff9d3d",
  flameCore: "#ffe08a",
  foil: "#bcc6cd",
  green: "#4c9e5c",
  amber: "#e7b814",
};
const M = {
  boxTop: [0, 1.02, 0] as [number, number, number],
  faceWindow: [0, 1.21, 0.19] as [number, number, number],
  shoulderL: [0.36, 0.96, 0.03] as [number, number, number],
  shoulderR: [-0.36, 0.96, 0.03] as [number, number, number],
  hipL: [0.13, 0.56, 0] as [number, number, number],
  hipR: [-0.13, 0.56, 0] as [number, number, number],
  packBack: [0, 0.82, -0.23] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torsoBox
  (() => {
function buildTorsoBox({ b, J, P, M }: Ctx) {
  const bone = J.body;

  const kraft = P.kraft;
  const kraftDark = P.kraftDark;
  const kraftLight = P.kraftLight;
  const tape = P.tape;
  const marker = P.marker;
  const red = P.red;
  const green = P.green;
  const amber = P.amber;
  const foil = P.foil;

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    extra: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at,
      name: `torsoBox_${name}`,
      ...extra,
    });

  const cylinder = (
    name: string,
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      bone,
      at,
      dir,
      name: `torsoBox_${name}`,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { bone, color, name: `torsoBox_${name}` });

  // ---------------------------------------------------------------------------
  // Main five-sided shell. The top and bottom remain open so the head and legs
  // can visibly enter the costume.
  // ---------------------------------------------------------------------------

  box("frontWall", [0.68, 0.47, 0.024], [0, 0.785, 0.228], kraft);
  box("backWall", [0.68, 0.47, 0.024], [0, 0.785, -0.228], kraftDark);
  box("leftWall", [0.024, 0.47, 0.432], [0.328, 0.785, 0], kraft);
  box("rightWall", [0.024, 0.47, 0.432], [-0.328, 0.785, 0], kraft);
  box("innerFrontLip", [0.656, 0.018, 0.018], [0, 1.008, 0.215], kraftDark);
  box("innerBackLip", [0.656, 0.018, 0.018], [0, 1.008, -0.215], kraftDark);
  box("innerLeftLip", [0.018, 0.018, 0.408], [0.308, 1.008, 0], kraftDark);
  box("innerRightLip", [0.018, 0.018, 0.408], [-0.308, 1.008, 0], kraftDark);

  // Small irregular-looking overlap pieces give the shell a handmade folded edge.
  box("frontBottomFold", [0.60, 0.018, 0.016], [0.015, 0.558, 0.238], kraftLight);
  box("backBottomFold", [0.48, 0.018, 0.016], [-0.08, 0.558, -0.238], kraftDark);
  box("topFrontFold", [0.46, 0.014, 0.018], [0.08, 1.012, 0.238], kraftLight);

  // ---------------------------------------------------------------------------
  // Packing tape: four vertical corners, bottom reinforcement, and rear patches.
  // ---------------------------------------------------------------------------

  const tapeW = 0.034;
  for (const x of [-0.336, 0.336]) {
    box(`frontCornerTape${x}`, [tapeW, 0.48, 0.008], [x, 0.785, 0.244], tape);
    box(`backCornerTape${x}`, [tapeW, 0.48, 0.008], [x, 0.785, -0.244], tape);
  }
  for (const z of [-0.236, 0.236]) {
    box(`sideCornerTape${z}`, [0.008, 0.48, 0.034], [0, 0.785, z], tape);
  }

  // The hem is made from four separate strips rather than a hidden ring.
  box("hemFront", [0.68, 0.045, 0.012], [0, 0.575, 0.244], tape);
  box("hemBack", [0.68, 0.045, 0.012], [0, 0.575, -0.244], tape);
  box("hemLeft", [0.012, 0.045, 0.432], [0.344, 0.575, 0], tape);
  box("hemRight", [0.012, 0.045, 0.432], [-0.344, 0.575, 0], tape);
  box("shortLowerTape", [0.20, 0.034, 0.014], [0.19, 0.595, 0.252], tape, {
    rotation: [0, 0, -5],
  });

  // Dark hand-drawn seam marks at the front and top edges.
  box("frontTopSeam", [0.57, 0.009, 0.006], [0, 0.995, 0.247], marker, {
    rotation: [0, 0, 1.3],
  });
  box("frontBottomSeam", [0.42, 0.008, 0.006], [-0.12, 0.602, 0.249], marker, {
    rotation: [0, 0, -1.8],
  });
  box("leftTopSeam", [0.006, 0.008, 0.28], [0.345, 0.996, 0.04], marker, {
    rotation: [0, 0.02, 0],
  });

  // ---------------------------------------------------------------------------
  // Arm holes: dark inset discs and thick tape rims on each side wall.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const x = s * 0.344;
    cylinder(`armHole${s}`, 0.074, 0.008, [x, 0.96, 0.03], marker, [s, 0, 0], 16);
    const ring = new THREE.TorusGeometry(0.078, 0.010, 6, 16);
    b.part(ring, tape, {
      bone,
      at: [x + s * 0.006, 0.96, 0.03],
      dir: [s, 0, 0],
      name: `torsoBox_armHoleTape${s}`,
    });
    // Four tiny marker fold ticks around each taped opening.
    rod(
      `holeTickA${s}`,
      [x + s * 0.012, 1.035, 0.03],
      [x + s * 0.012, 1.052, 0.03],
      0.003,
      marker,
    );
    rod(
      `holeTickB${s}`,
      [x + s * 0.012, 0.885, 0.03],
      [x + s * 0.012, 0.868, 0.03],
      0.003,
      marker,
    );
  }

  // ---------------------------------------------------------------------------
  // Front control panel: outlined paper, dials, buttons, slider, and gauge.
  // ---------------------------------------------------------------------------

  box("panelOutline", [0.365, 0.205, 0.012], [0, 0.735, 0.245], marker);
  box("panelPaper", [0.338, 0.178, 0.009], [0, 0.735, 0.253], kraftLight);

  // Panel corner screws / drawn rivets.
  for (const x of [-0.145, 0.145]) {
    for (const y of [0.662, 0.808]) {
      cylinder(`panelRivet${x}${y}`, 0.008, 0.006, [x, y, 0.260], foil, [0, 0, 1], 8);
    }
  }

  // Two foil dials with dark centres and pointer rods.
  for (const s of [-1, 1]) {
    const x = s * 0.090;
    cylinder(`dial${s}`, 0.032, 0.008, [x, 0.772, 0.264], foil, [0, 0, 1], 12);
    cylinder(`dialCentre${s}`, 0.006, 0.010, [x, 0.772, 0.270], marker, [0, 0, 1], 8);
    rod(
      `dialPointer${s}`,
      [x, 0.772, 0.273],
      [x + s * 0.018, 0.793, 0.274],
      0.003,
      marker,
    );
    rod(
      `dialTick${s}`,
      [x - 0.021, 0.772, 0.272],
      [x - 0.026, 0.772, 0.272],
      0.002,
      marker,
    );
  }

  // Three bright buttons in a row.
  cylinder("redButton", 0.015, 0.010, [-0.082, 0.714, 0.266], red, [0, 0, 1], 10);
  cylinder("greenButton", 0.015, 0.010, [0, 0.714, 0.266], green, [0, 0, 1], 10);
  cylinder("amberButton", 0.015, 0.010, [0.082, 0.714, 0.266], amber, [0, 0, 1], 10);

  // Slider slot, slider knob, and a tiny gauge below the dials.
  box("sliderSlot", [0.105, 0.012, 0.006], [0.018, 0.681, 0.268], marker);
  box("sliderKnob", [0.017, 0.024, 0.009], [0.049, 0.681, 0.272], foil);

  cylinder("gaugeFace", 0.029, 0.008, [-0.106, 0.681, 0.268], foil, [0, 0, 1], 16);
  cylinder("gaugeHub", 0.006, 0.010, [-0.106, 0.681, 0.274], marker, [0, 0, 1], 8);
  rod(
    "gaugeNeedle",
    [-0.106, 0.681, 0.277],
    [-0.091, 0.697, 0.278],
    0.003,
    red,
  );
  for (let i = 0; i < 5; i++) {
    const a = -125 + i * 42;
    const rad = (a * Math.PI) / 180;
    rod(
      `gaugeTick${i}`,
      [-0.106 + Math.sin(rad) * 0.021, 0.681 + Math.cos(rad) * 0.021, 0.277],
      [-0.106 + Math.sin(rad) * 0.025, 0.681 + Math.cos(rad) * 0.025, 0.277],
      0.002,
      marker,
    );
  }

  // ---------------------------------------------------------------------------
  // Hand-painted lightning bolt, with a slightly oversized marker under-outline.
  // ---------------------------------------------------------------------------

  const bolt: [number, number, "sharp"][] = [
    [-0.040, -0.070, "sharp"],
    [0.010, -0.070, "sharp"],
    [-0.015, -0.010, "sharp"],
    [0.052, -0.010, "sharp"],
    [-0.030, 0.078, "sharp"],
    [-0.006, 0.018, "sharp"],
    [-0.055, 0.018, "sharp"],
  ];
  const boltOutline: [number, number, "sharp"][] = bolt.map(([x, y]) => [
    x * 1.18,
    y * 1.18,
    "sharp",
  ]);

  b.extrude(boltOutline, {
    at: [0, 0.905, 0.253],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    color: marker,
    bone,
    name: "torsoBox_boltOutline",
  });
  b.extrude(bolt, {
    at: [0, 0.905, 0.260],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.009,
    color: red,
    bone,
    name: "torsoBox_lightningBolt",
  });

  // Small marker hash marks beside the emblem make it feel painted by hand.
  rod("boltScratchL", [-0.104, 0.900, 0.267], [-0.083, 0.910, 0.267], 0.0025, marker);
  rod("boltScratchR", [0.083, 0.884, 0.267], [0.108, 0.892, 0.267], 0.0025, marker);

  // ---------------------------------------------------------------------------
  // Rear mounting detail for the future rocket pack.
  // ---------------------------------------------------------------------------

  box("packPatchL", [0.105, 0.105, 0.010], [0.145, 0.825, -0.244], tape, {
    rotation: [0, 0, -8],
  });
  box("packPatchR", [0.105, 0.105, 0.010], [-0.145, 0.825, -0.244], tape, {
    rotation: [0, 0, 8],
  });
  rod("rearMarkerSeam", [-0.22, 0.945, -0.247], [0.22, 0.945, -0.247], 0.0025, marker);

  // A few exposed kraft-dark fold tabs along the open lower edge.
  box("lowerFoldL", [0.11, 0.018, 0.018], [0.235, 0.565, 0.236], kraftDark, {
    rotation: [0, 0, -3],
  });
  box("lowerFoldR", [0.11, 0.018, 0.018], [-0.235, 0.565, 0.236], kraftDark, {
    rotation: [0, 0, 3],
  });
}
    return buildTorsoBox;
  })(),
  // headBox
  (() => {
function buildHeadBox({ b, J, P, M }: Ctx) {
  const head = J.head ?? J.body;
  const kraft = P.kraft;
  const kraftDark = P.kraftDark;
  const kraftLight = P.kraftLight;
  const tape = P.tape;
  const marker = P.marker;
  const foil = P.foil;

  const wobble = rng(2417);
  const jitter = (amount: number) => (wobble() - 0.5) * amount;

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation: [number, number, number] = [0, 0, 0],
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      bone: head,
      at,
      rotation,
    });
  };

  const cyl = (
    name: string,
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      name,
      bone: head,
      at,
      dir,
    });
  };

  const sphere = (
    name: string,
    radius: number,
    at: [number, number, number],
    color: string,
    segments = 10,
  ) => {
    return b.part(new THREE.SphereGeometry(radius, segments, 6), color, {
      name,
      bone: head,
      at,
      flat: true,
    });
  };

  // ---------------------------------------------------------------------------
  // Cardboard shell. The front is built as four separate panels so the window
  // is a genuine opening rather than a dark decal.
  // ---------------------------------------------------------------------------

  const frontZ = 0.19;
  const wall = 0.024;

  // Back wall and the two side walls.
  box("headBox.backWall", [0.48, 0.38, wall], [0, 1.21, -0.188], kraft);
  box("headBox.sideWallL", [wall, 0.38, 0.352], [0.228, 1.21, 0], kraft);
  box("headBox.sideWallR", [wall, 0.38, 0.352], [-0.228, 1.21, 0], kraft);

  // Top, deliberately a little uneven to sell the handmade shell.
  box(
    "headBox.top",
    [0.48, wall, 0.38],
    [jitter(0.003), 1.389, jitter(0.003)],
    kraftLight,
    [jitter(0.012), jitter(0.008), jitter(0.01)],
  );

  // Front wall around the 0.22 x 0.19 face window.
  box("headBox.frontLeft", [0.12, 0.38, wall], [-0.18, 1.21, frontZ], kraft);
  box("headBox.frontRight", [0.12, 0.38, wall], [0.18, 1.21, frontZ], kraft);
  box("headBox.frontBelowWindow", [0.24, 0.105, wall], [0, 1.0675, frontZ], kraft);
  box("headBox.frontAboveWindow", [0.24, 0.085, wall], [0, 1.3425, frontZ], kraft);

  // A darker inner lining is visible through the opening and under the rim.
  box("headBox.innerBack", [0.446, 0.33, 0.008], [0, 1.21, -0.171], kraftDark);
  box("headBox.innerLeft", [0.008, 0.33, 0.33], [0.214, 1.21, 0], kraftDark);
  box("headBox.innerRight", [0.008, 0.33, 0.33], [-0.214, 1.21, 0], kraftDark);
  box("headBox.innerTop", [0.44, 0.008, 0.34], [0, 1.375, 0], kraftDark);

  // ---------------------------------------------------------------------------
  // Packing tape: strong, pale strips around the window, corners, and roof.
  // ---------------------------------------------------------------------------

  const tapeZ = 0.207;

  box("headBox.windowTapeL", [0.018, 0.21, 0.009], [-0.119, 1.21, tapeZ], tape);
  box("headBox.windowTapeR", [0.018, 0.21, 0.009], [0.119, 1.21, tapeZ], tape);
  box("headBox.windowTapeTop", [0.256, 0.018, 0.009], [0, 1.315, tapeZ], tape);
  box("headBox.windowTapeBottom", [0.256, 0.018, 0.009], [0, 1.105, tapeZ], tape);

  // Front vertical corner tape, with tiny irregular offsets.
  box(
    "headBox.frontCornerL",
    [0.022, 0.382, 0.01],
    [-0.229, 1.21, 0.204],
    tape,
    [0, jitter(0.01), jitter(0.014)],
  );
  box(
    "headBox.frontCornerR",
    [0.022, 0.382, 0.01],
    [0.229, 1.21, 0.204],
    tape,
    [0, jitter(0.01), jitter(0.014)],
  );

  // Tape across the top front and along both roof side edges.
  box("headBox.topFrontTape", [0.47, 0.018, 0.014], [0, 1.405, 0.145], tape);
  box("headBox.roofLeftTape", [0.014, 0.016, 0.34], [0.216, 1.405, 0], tape);
  box("headBox.roofRightTape", [0.014, 0.016, 0.34], [-0.216, 1.405, 0], tape);
  box("headBox.roofBackTape", [0.47, 0.016, 0.014], [0, 1.405, -0.145], tape);

  // Small marker-like seam bars at the bottom of the front wall.
  box("headBox.bottomSeamL", [0.10, 0.006, 0.006], [-0.17, 1.031, 0.207], marker, [0, 0, -0.025]);
  box("headBox.bottomSeamR", [0.10, 0.006, 0.006], [0.17, 1.031, 0.207], marker, [0, 0, 0.025]);

  // Three drawn rivet dots under the face window.
  cyl("headBox.rivetL", 0.009, 0.006, [-0.065, 1.078, 0.211], marker, [0, 0, 1], 8);
  cyl("headBox.rivetC", 0.009, 0.006, [0, 1.078, 0.211], marker, [0, 0, 1], 8);
  cyl("headBox.rivetR", 0.009, 0.006, [0.065, 1.078, 0.211], marker, [0, 0, 1], 8);

  // ---------------------------------------------------------------------------
  // Foil ears: shallow faceted discs sticking from both side walls.
  // ---------------------------------------------------------------------------

  cyl("headBox.earL", 0.045, 0.016, [0.243, 1.21, 0.02], foil, [1, 0, 0], 12);
  cyl("headBox.earR", 0.045, 0.016, [-0.243, 1.21, 0.02], foil, [-1, 0, 0], 12);

  // Dark little centre rivets make the ear discs read as attached hardware.
  cyl("headBox.earPinL", 0.010, 0.019, [0.253, 1.21, 0.02], marker, [1, 0, 0], 8);
  cyl("headBox.earPinR", 0.010, 0.019, [-0.253, 1.21, 0.02], marker, [-1, 0, 0], 8);

  // ---------------------------------------------------------------------------
  // Antenna on the roof, kept inside the requested silhouette.
  // ---------------------------------------------------------------------------

  cyl("headBox.antennaBase", 0.028, 0.014, [0.09, 1.406, 0.02], kraftDark, [0, 1, 0], 10);
  cyl("headBox.antennaRod", 0.008, 0.145, [0.09, 1.482, 0.02], kraftDark, [0, 1, 0], 8);
  sphere("headBox.antennaBall", 0.030, [0.09, 1.565, 0.02], foil, 10);

  // A small dark collar where the rod pierces the cardboard.
  cyl("headBox.antennaCollar", 0.014, 0.008, [0.09, 1.414, 0.02], marker, [0, 1, 0], 8);

  // ---------------------------------------------------------------------------
  // One peeling rear roof flap, a chunky low-poly craft detail.
  // ---------------------------------------------------------------------------

  box(
    "headBox.peelingFlap",
    [0.105, 0.014, 0.075],
    [-0.145, 1.413, -0.178],
    kraftLight,
    [0.18, -0.08, -0.22],
  );
  box(
    "headBox.flapFold",
    [0.108, 0.008, 0.012],
    [-0.145, 1.401, -0.142],
    marker,
    [0.18, -0.08, -0.22],
  );
}
    return buildHeadBox;
  })(),
  // kidFace
  (() => {
function buildKidFace({ b, J, P, M }: Ctx) {
  const head = J.head;
  const bone = head;

  const skin = P.skin;
  const hair = P.hair;
  const marker = P.marker;
  const white = P.eyeWhite;
  const iris = P.iris;
  const blue = P.blue;
  const red = P.red;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    scale?: [number, number, number],
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(geometry, color, {
      bone,
      at,
      scale,
      rotation,
      name: name ? `kidFace.${name}` : undefined,
      group: "kidFace",
      flat: true,
    });

  const sphere = (
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    name: string,
    segments = 12,
    rings = 8,
  ) =>
    part(
      new THREE.SphereGeometry(1, segments, rings),
      color,
      at,
      scale,
      undefined,
      name,
    );

  const box = (
    color: string,
    at: [number, number, number],
    size: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    name: string,
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      undefined,
      rotation,
      name,
    );

  const cylinder = (
    color: string,
    at: [number, number, number],
    radius: number,
    depth: number,
    dir: [number, number, number],
    name: string,
    radialSegments = 10,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius * 0.96, depth, radialSegments, 1),
      color,
      {
        bone,
        at,
        dir,
        axis: "y",
        name: `kidFace.${name}`,
        group: "kidFace",
        flat: true,
      },
    );

  // The kid's neck disappears into the blue shirt collar and the costume torso.
  cylinder("skin", [0, 1.075, 0.035], 0.052, 0.14, [0, 1, 0], "neck", 10);
  cylinder(blue, [0, 1.055, 0.035], 0.066, 0.026, [0, 1, 0], "shirtCollar", 12);

  // Round head, intentionally slightly squashed so it reads as a child peeking through
  // the rectangular robot window.
  sphere(skin, [0, 1.20, 0.06], [0.135, 0.14, 0.135], "roundHead", 16, 10);

  // Small ears, mostly hidden by the cardboard window sides.
  for (const side of [-1, 1]) {
    cylinder(
      skin,
      [side * 0.132, 1.205, 0.055],
      0.029,
      0.018,
      [side, 0, 0],
      `ear${side > 0 ? "L" : "R"}`,
      10,
    );
    sphere(
      "#e79b78",
      [side * 0.145, 1.205, 0.058],
      [0.012, 0.018, 0.021],
      `earInner${side > 0 ? "L" : "R"}`,
      8,
      6,
    );
  }

  // Chunky overlapping hair cap. The back mass sits inside the shell while the
  // top tufts break the perfectly square silhouette of the costume.
  sphere(hair, [0, 1.315, 0.025], [0.132, 0.062, 0.115], "hairBack", 12, 8);
  sphere(hair, [-0.075, 1.318, 0.045], [0.072, 0.062, 0.095], "hairTopL", 10, 7);
  sphere(hair, [0.012, 1.338, 0.035], [0.078, 0.065, 0.10], "hairTopC", 10, 7);
  sphere(hair, [0.082, 1.318, 0.045], [0.068, 0.06, 0.092], "hairTopR", 10, 7);

  // Low-poly fringe blobs overlap the forehead just above the window.
  sphere(hair, [-0.082, 1.285, 0.174], [0.043, 0.035, 0.026], "fringeL", 9, 6);
  sphere(hair, [-0.025, 1.298, 0.181], [0.045, 0.039, 0.025], "fringeC", 9, 6);
  sphere(hair, [0.043, 1.287, 0.178], [0.042, 0.036, 0.025], "fringeR", 9, 6);

  // Eyes: broad white eye shapes, warm brown irises, dark pupils and two
  // separate catchlights per eye. Everything is just proud of the front face.
  for (const side of [-1, 1]) {
    const label = side > 0 ? "L" : "R";
    const x = side * 0.052;

    sphere(white, [x, 1.235, 0.190], [0.037, 0.044, 0.012], `eyeWhite${label}`, 12, 8);
    sphere(marker, [x, 1.235, 0.202], [0.025, 0.031, 0.009], `eyeOutline${label}`, 10, 7);
    sphere(iris, [x, 1.232, 0.211], [0.019, 0.025, 0.007], `iris${label}`, 10, 7);
    sphere("#261b16", [x, 1.232, 0.217], [0.009, 0.017, 0.004], `pupil${label}`, 8, 6);
    sphere(white, [x - side * 0.008, 1.245, 0.222], [0.006, 0.008, 0.003], `catchBig${label}`, 7, 5);
    sphere(white, [x + side * 0.010, 1.225, 0.222], [0.0035, 0.0045, 0.002], `catchSmall${label}`, 6, 4);

    // Friendly, slightly tilted marker eyebrows.
    box(
      marker,
      [x - side * 0.003, 1.282, 0.205],
      [0.057, 0.009, 0.006],
      [0, 0, side * -0.12],
      `brow${label}`,
    );

    // Rosy cheeks sit low and wide, visible around the smile.
    sphere("#e98578", [x + side * 0.031, 1.185, 0.204], [0.019, 0.012, 0.005], `cheek${label}`, 9, 6);
  }

  // A tiny projecting nose gives the face a readable centre line.
  sphere(skin, [0, 1.207, 0.222], [0.014, 0.018, 0.014], "nose", 9, 6);
  sphere("#d98d72", [0, 1.201, 0.233], [0.006, 0.004, 0.003], "noseTip", 7, 5);

  // Open happy smile with a low-poly dark mouth, a warm lower lip edge, and
  // one little tooth glint.
  sphere("#542c2b", [0, 1.155, 0.209], [0.055, 0.027, 0.009], "openSmile", 12, 7);
  sphere("#9b4e4d", [0, 1.146, 0.219], [0.039, 0.008, 0.004], "lowerLip", 9, 5);
  box(white, [0.014, 1.166, 0.220], [0.018, 0.008, 0.004], [0, 0, -0.08], "toothGlint");

  // Marker smile corners and a couple of tiny cheek freckles add handmade charm.
  for (const side of [-1, 1]) {
    box(
      marker,
      [side * 0.057, 1.161, 0.218],
      [0.014, 0.005, 0.004],
      [0, 0, side * 0.32],
      `smileCorner${side > 0 ? "L" : "R"}`,
    );
    sphere(marker, [side * 0.078, 1.191, 0.211], [0.003, 0.003, 0.002], `freckleA${side > 0 ? "L" : "R"}`, 6, 4);
    sphere(marker, [side * 0.069, 1.181, 0.212], [0.0025, 0.0025, 0.002], `freckleB${side > 0 ? "L" : "R"}`, 6, 4);
  }

  // A few uneven hair tips soften the cap and make it feel cut from craft foam
  // rather than manufactured.
  const tuft = (x: number, y: number, z: number, sx: number, rot: number, name: string) =>
    b.part(
      new THREE.ConeGeometry(0.026, 0.075, 6),
      hair,
      {
        bone,
        at: [x, y, z],
        dir: [Math.sin(rot), Math.cos(rot), 0.25],
        axis: "y",
        scale: [sx, 1, 0.8],
        name: `kidFace.${name}`,
        group: "kidFace",
        flat: true,
      },
    );

  tuft(-0.115, 1.35, 0.02, 0.9, -0.35, "hairTipL");
  tuft(0.11, 1.345, 0.02, 0.95, 0.35, "hairTipR");
  tuft(-0.035, 1.365, 0.01, 0.8, -0.08, "hairTipC");
}
    return buildKidFace;
  })(),
  // arms
  (() => {
function buildArms({ b, J, P, M }: Ctx) {
  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const lerp = (a: THREE.Vector3, c: THREE.Vector3, t: number) =>
    a.clone().lerp(c, t);

  const capsule = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => b.capsule(a, c, radius, { color, bone, name });

  const rod = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => b.rod(a, c, radius, { color, bone, name });

  const cylinder = (
    radius: number,
    depth: number,
    at: THREE.Vector3,
    color: string,
    bone: any,
    dir: THREE.Vector3,
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir,
      bone,
      name,
      flat: true,
    });

  const box = (
    size: [number, number, number],
    at: THREE.Vector3,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });

  for (const s of [1, -1]) {
    const arm = s > 0 ? J.armL : J.armR;
    const hand = s > 0 ? J.handL : J.handR;
    const side = s > 0 ? "L" : "R";

    const shoulder = V(s > 0 ? M.shoulderL : M.shoulderR);
    const elbow = V([s * 0.4, 0.75, 0.06]);
    const wrist = V([s * 0.43, 0.55, 0.08]);
    const handCenter = V([s * 0.43, 0.485, 0.085]);

    const armAxis = elbow.clone().sub(shoulder).normalize();
    const gauntletAxis = wrist.clone().sub(elbow).normalize();

    // Blue shirt sleeve, visibly plugging into the taped arm hole.
    const sleeveEnd = lerp(shoulder, elbow, 0.16);
    capsule(
      shoulder.clone().addScaledVector(armAxis, -0.018),
      sleeveEnd,
      0.061,
      P.blue,
      arm,
      `sleeve${side}`,
    );

    // Pale packing-tape collar at the cardboard arm-hole edge.
    const sleeveTapeA = shoulder.clone().addScaledVector(armAxis, -0.012);
    const sleeveTapeB = shoulder.clone().addScaledVector(armAxis, 0.035);
    capsule(
      sleeveTapeA,
      sleeveTapeB,
      0.067,
      P.tape,
      arm,
      `sleeveTape${side}`,
    );

    // A tiny dark seam just below the tape.
    rod(
      shoulder.clone().addScaledVector(armAxis, 0.043),
      shoulder.clone().addScaledVector(armAxis, 0.056),
      0.004,
      P.marker,
      arm,
      `sleeveSeam${side}`,
    );

    // Exposed upper arm.
    const upperArmStart = sleeveEnd.clone().addScaledVector(armAxis, 0.012);
    capsule(
      upperArmStart,
      elbow,
      0.044,
      P.skin,
      arm,
      `upperArm${side}`,
    );

    // Small elbow joint peeking between skin and cardboard.
    capsule(
      elbow.clone().addScaledVector(gauntletAxis, -0.018),
      elbow.clone().addScaledVector(gauntletAxis, 0.028),
      0.049,
      P.skin,
      arm,
      `elbow${side}`,
    );

    // Kraft cardboard gauntlet.
    capsule(
      elbow.clone().addScaledVector(gauntletAxis, 0.008),
      wrist.clone().addScaledVector(gauntletAxis, -0.012),
      0.055,
      P.kraft,
      arm,
      `gauntlet${side}`,
    );

    // Two broad tape rings around each gauntlet.
    for (const [i, t] of [0.22, 0.72].entries()) {
      const center = lerp(elbow, wrist, t);
      const a = center.clone().addScaledVector(gauntletAxis, -0.012);
      const c = center.clone().addScaledVector(gauntletAxis, 0.012);
      capsule(
        a,
        c,
        0.0605,
        P.tape,
        arm,
        `gauntletTape${side}${i}`,
      );
    }

    // A hand-drawn longitudinal stripe on the outward face of the gauntlet.
    const stripeStart = lerp(elbow, wrist, 0.08);
    const stripeEnd = lerp(elbow, wrist, 0.9);
    const stripeOffset = new THREE.Vector3(s * 0.048, 0, 0.018);
    rod(
      stripeStart.clone().add(stripeOffset),
      stripeEnd.clone().add(stripeOffset),
      0.005,
      P.marker,
      arm,
      `gauntletStripe${side}`,
    );

    // A second imperfect marker dash beside the main stripe.
    const dashA = lerp(elbow, wrist, 0.32).add(
      new THREE.Vector3(s * 0.049, 0, -0.012),
    );
    const dashB = lerp(elbow, wrist, 0.52).add(
      new THREE.Vector3(s * 0.049, 0, -0.012),
    );
    rod(dashA, dashB, 0.0035, P.marker, arm, `gauntletDash${side}`);

    // Foil control dial seated on the outward side.
    const dialAt = lerp(elbow, wrist, 0.48).add(
      new THREE.Vector3(s * 0.057, 0, 0.008),
    );
    cylinder(
      0.018,
      0.007,
      dialAt,
      P.foil,
      arm,
      new THREE.Vector3(s, 0, 0),
      `wristDial${side}`,
      12,
    );

    // Dial rim and pointer.
    cylinder(
      0.0205,
      0.0025,
      dialAt.clone().add(new THREE.Vector3(s * 0.004, 0, 0)),
      P.marker,
      arm,
      new THREE.Vector3(s, 0, 0),
      `wristDialRim${side}`,
      12,
    );
    rod(
      dialAt.clone().add(new THREE.Vector3(s * 0.007, 0, 0)),
      dialAt.clone().add(new THREE.Vector3(s * 0.009, 0.018, 0.008)),
      0.0022,
      P.marker,
      arm,
      `wristDialNeedle${side}`,
    );

    // Chunky cardboard mitten: a blocky palm plus a rounded knuckle cap.
    box(
      [0.095, 0.105, 0.068],
      handCenter,
      P.kraft,
      hand,
      `mittenPalm${side}`,
    );
    b.part(new THREE.SphereGeometry(0.052, 8, 6), P.kraftLight, {
      at: handCenter.clone().add(new THREE.Vector3(0, 0.012, 0.008)),
      bone: hand,
      scale: [1.0, 0.82, 0.72],
      name: `mittenKnuckles${side}`,
      flat: true,
    });

    // Inner-side thumb stub, angled slightly forward.
    const thumbBase = handCenter.clone().add(
      new THREE.Vector3(-s * 0.046, -0.008, 0.012),
    );
    const thumbTip = thumbBase.clone().add(
      new THREE.Vector3(-s * 0.028, -0.018, 0.026),
    );
    capsule(
      thumbBase,
      thumbTip,
      0.026,
      P.kraft,
      hand,
      `mittenThumb${side}`,
    );

    // Marker cuff line across the front of the mitten.
    const cuffA = handCenter.clone().add(new THREE.Vector3(-s * 0.043, 0.032, 0.037));
    const cuffB = handCenter.clone().add(new THREE.Vector3(s * 0.043, 0.032, 0.037));
    rod(cuffA, cuffB, 0.0035, P.marker, hand, `mittenCuff${side}`);

    // Two tiny marker stitch marks on the mitten face.
    for (let i = 0; i < 2; i++) {
      const x = handCenter.x + (i === 0 ? -0.018 : 0.018);
      rod(
        new THREE.Vector3(x, handCenter.y - 0.005, handCenter.z + 0.037),
        new THREE.Vector3(x + s * 0.008, handCenter.y + 0.014, handCenter.z + 0.039),
        0.0022,
        P.marker,
        hand,
        `mittenStitch${side}${i}`,
      );
    }

    // A small tape tab hanging from the gauntlet-to-mitten join.
    const tabAt = wrist.clone().add(new THREE.Vector3(0, -0.012, 0.025));
    box(
      [0.025, 0.035, 0.006],
      tabAt,
      P.tape,
      hand,
      `cuffTapeTab${side}`,
    );
  }
}
    return buildArms;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const marker = P.marker ?? "#4a3826";
  const denim = P.denim ?? "#51719c";
  const skin = P.skin ?? "#f2b48c";
  const sock = P.sock ?? "#f2efe6";
  const shoe = P.shoe ?? "#cd4a32";
  const sole = P.sole ?? "#f2efe6";
  const kraftDark = P.kraftDark ?? "#a5763f";

  const add = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    bone: any,
    extra: Record<string, any> = {},
  ) => b.part(geometry, color, { at, bone, flat: true, ...extra });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any,
    extra: Record<string, any> = {},
  ) => b.rod(a, c, radius, { color, bone, section: { ngon: 8 }, ...extra });

  const ring = (
    x: number,
    y: number,
    z: number,
    radius: number,
    thickness: number,
    color: string,
    bone: any,
  ) => {
    const path: [number, number, number][] = [];
    for (let i = 0; i < 17; i++) {
      const a = (i / 16) * Math.PI * 2;
      path.push([x + Math.cos(a) * radius, y, z + Math.sin(a) * radius]);
    }
    b.sweep(path, thickness, {
      color,
      bone,
      caps: "round",
      section: { ngon: 6 },
    });
  };

  const addShoe = (s: number, bone: any) => {
    const x = s * 0.13;

    // Denim shorts leg, tucked into the underside of the costume box.
    add(
      new THREE.BoxGeometry(0.135, 0.075, 0.17),
      denim,
      [x, 0.535, 0.005],
      bone,
    );
    add(
      new THREE.BoxGeometry(0.142, 0.012, 0.176),
      marker,
      [x, 0.498, 0.005],
      bone,
    );
    add(
      new THREE.BoxGeometry(0.092, 0.008, 0.006),
      sock,
      [x, 0.541, 0.09],
      bone,
    );

    // Tiny front pocket and stitched-looking pocket corners.
    add(
      new THREE.BoxGeometry(0.055, 0.045, 0.006),
      denim,
      [x + s * 0.035, 0.535, 0.091],
      bone,
    );
    rod(
      [x + s * 0.008, 0.557, 0.095],
      [x + s * 0.052, 0.557, 0.095],
      0.003,
      marker,
      bone,
    );

    // Bare shin, deliberately chunky and slightly faceted.
    rod([x, 0.505, 0.015], [x, 0.145, 0.02], 0.052, skin, bone, {
      caps: "round",
    });
    add(
      new THREE.SphereGeometry(0.052, 8, 6),
      skin,
      [x, 0.215, 0.02],
      bone,
      { scale: [1, 1.08, 0.95] },
    );

    // Sock cuff and folded rib below the ankle.
    rod([x, 0.158, 0.02], [x, 0.105, 0.02], 0.066, sock, bone);
    ring(x, 0.158, 0.02, 0.061, 0.006, marker, bone);
    ring(x, 0.112, 0.02, 0.064, 0.005, sock, bone);
    add(
      new THREE.BoxGeometry(0.085, 0.014, 0.025),
      marker,
      [x, 0.151, 0.066],
      bone,
    );

    // Red sneaker body: a low box plus a rounded toe, pointing toward +Z.
    add(
      new THREE.BoxGeometry(0.112, 0.068, 0.145),
      shoe,
      [x, 0.064, 0.035],
      J[bone === J.legL ? "footL" : "footR"],
    );
    add(
      new THREE.SphereGeometry(0.058, 9, 6),
      shoe,
      [x, 0.062, 0.112],
      J[bone === J.legL ? "footL" : "footR"],
      { scale: [1, 0.72, 1.18] },
    );

    // Thick white sole, with a slightly projecting toe lip.
    add(
      new THREE.BoxGeometry(0.126, 0.026, 0.205),
      sole,
      [x, 0.014, 0.043],
      J[bone === J.legL ? "footL" : "footR"],
    );
    add(
      new THREE.BoxGeometry(0.132, 0.018, 0.045),
      sole,
      [x, 0.035, 0.137],
      J[bone === J.legL ? "footL" : "footR"],
    );
    add(
      new THREE.BoxGeometry(0.126, 0.009, 0.19),
      marker,
      [x, 0.029, 0.043],
      J[bone === J.legL ? "footL" : "footR"],
    );

    // White toe cap and red side stripe.
    add(
      new THREE.SphereGeometry(0.046, 8, 5),
      sole,
      [x, 0.067, 0.132],
      J[bone === J.legL ? "footL" : "footR"],
      { scale: [1.05, 0.65, 0.7] },
    );
    add(
      new THREE.BoxGeometry(0.012, 0.028, 0.075),
      sole,
      [x + s * 0.059, 0.065, 0.052],
      J[bone === J.legL ? "footL" : "footR"],
      { rotation: [0, 0, s * -0.18] },
    );

    // Tongue and three oversized lace dots.
    add(
      new THREE.BoxGeometry(0.045, 0.008, 0.085),
      sole,
      [x, 0.103, 0.055],
      J[bone === J.legL ? "footL" : "footR"],
    );
    for (let i = 0; i < 3; i++) {
      add(
        new THREE.SphereGeometry(0.009, 6, 4),
        marker,
        [x, 0.111, 0.025 + i * 0.027],
        J[bone === J.legL ? "footL" : "footR"],
      );
    }

    // Two tiny marker seam marks on each shoe side.
    for (const z of [0.005, 0.075]) {
      add(
        new THREE.BoxGeometry(0.004, 0.022, 0.032),
        marker,
        [x + s * 0.058, 0.078, z],
        J[bone === J.legL ? "footL" : "footR"],
        { rotation: [0, 0, s * 0.28] },
      );
    }
  };

  addShoe(1, J.legL);
  addShoe(-1, J.legR);
}
    return buildLegs;
  })(),
  // jetpack
  (() => {
function buildJetpack({ b, J, P, M }: any) {
  const body = J.body;
  const kraft = P.kraft ?? "#c9955a";
  const kraftDark = P.kraftDark ?? "#a5763f";
  const tape = P.tape ?? "#d9d2c0";
  const marker = P.marker ?? "#4a3826";
  const red = P.red ?? "#d94f3d";
  const foil = P.foil ?? "#bcc6cd";
  const flame = P.flame ?? "#ff9d3d";
  const flameCore = P.flameCore ?? "#ffe08a";

  const root = new THREE.Vector3(...(M.packBack ?? [0, 0.82, -0.23]));
  const random = rng(713);

  const addBox = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: string,
    extra: any = {},
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: body,
      at,
      ...extra,
    });
  };

  const addCylinder = (
    radius: number,
    depth: number,
    at: THREE.Vector3,
    color: string,
    dir: THREE.Vector3,
    segments = 10,
    extra: any = {},
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      bone: body,
      at,
      dir,
      ...extra,
    });
  };

  const addSpike = (
    base: THREE.Vector3,
    tip: THREE.Vector3,
    radius: number,
    color: string,
    extra: any = {},
  ) => {
    return b.spike(base, tip, null, radius, {
      bone: body,
      color,
      caps: { start: "round", end: "point" },
      ...extra,
    });
  };

  // The little cardboard backpack shell, tucked against the torso's rear wall.
  addBox([0.34, 0.27, 0.075], [root.x, 0.82, -0.275], kraft, {
    name: "jetpackPack",
  });

  // A darker lower fold gives the pack a visible open-bottom cardboard construction.
  addBox([0.30, 0.035, 0.082], [root.x, 0.685, -0.278], kraftDark, {
    name: "jetpackLowerFold",
  });

  // Raised vertical fold lines on the backpack face.
  for (const x of [-0.115, 0.115]) {
    addBox([0.012, 0.22, 0.006], [x, 0.82, -0.319], kraftDark, {
      name: "jetpackFold",
    });
  }

  // The broad tie-down strap across the pack.
  addBox([0.37, 0.035, 0.014], [0, 0.86, -0.323], tape, {
    name: "jetpackTieStrap",
  });
  addBox([0.035, 0.19, 0.012], [0, 0.82, -0.326], tape, {
    name: "jetpackTieCross",
  });

  // Two mounting patches visibly stuck to the back wall.
  for (const s of [1, -1]) {
    const x = s * 0.14;
    addBox([0.095, 0.082, 0.012], [x, 0.82, -0.325], tape, {
      name: "jetpackMountPatch",
      rotation: [0, random() * 3 - 1.5, s * (random() * 4 - 2)],
    });
    addBox([0.055, 0.022, 0.008], [x, 0.775, -0.333], marker, {
      name: "jetpackPatchMark",
      rotation: [0, 0, s * 8],
    });
  }

  for (const s of [1, -1]) {
    const axis = new THREE.Vector3(s * 0.15, -0.35, -0.92).normalize();
    const thrusterRoot = new THREE.Vector3(s * 0.14, 0.82, -0.31);
    const thrusterEnd = thrusterRoot.clone().addScaledVector(axis, 0.16);
    const mid = thrusterRoot.clone().lerp(thrusterEnd, 0.5);

    // Chunky low-poly cardboard tube.
    b.sweep([thrusterRoot, thrusterEnd], 0.06, {
      bone: body,
      color: kraft,
      caps: "flat",
      sides: 8,
      skin: "rigid",
      name: "jetpackThruster",
    });

    // A darker seam along the upper side of the tube.
    const seamA = thrusterRoot.clone().add(new THREE.Vector3(-s * 0.018, 0.026, -0.006));
    const seamB = thrusterEnd.clone().add(new THREE.Vector3(-s * 0.018, 0.026, -0.006));
    b.rod(seamA, seamB, 0.006, {
      bone: body,
      color: kraftDark,
      name: "jetpackTubeSeam",
    });

    // Red painted identification band around the middle.
    addCylinder(0.063, 0.022, mid, red, axis, 10, {
      name: "jetpackRedBand",
    });

    // Two pale tape bands near the cardboard tube root and nose.
    for (const t of [0.16, 0.78]) {
      const p = thrusterRoot.clone().lerp(thrusterEnd, t);
      addCylinder(0.064, 0.012, p, tape, axis, 10, {
        name: "jetpackTapeRing",
      });
    }

    // Three marker dots running down the exposed outer side.
    const side = new THREE.Vector3(1, 0, 0);
    const radial = new THREE.Vector3().crossVectors(axis, side).normalize();
    for (let i = 0; i < 3; i++) {
      const p = thrusterRoot.clone().lerp(thrusterEnd, 0.24 + i * 0.18);
      p.addScaledVector(radial, 0.058);
      b.part(new THREE.SphereGeometry(0.008, 6, 4), marker, {
        bone: body,
        at: p,
        name: "jetpackMarkerDot",
      });
    }

    // Foil collar at the rear opening, with a dark inner exhaust mouth.
    const rim = thrusterEnd.clone().addScaledVector(axis, 0.006);
    addCylinder(0.067, 0.018, rim, foil, axis, 10, {
      name: "jetpackFoilRim",
    });
    const opening = thrusterEnd.clone().addScaledVector(axis, 0.017);
    addCylinder(0.046, 0.006, opening, marker, axis, 10, {
      name: "jetpackExhaustOpening",
    });

    // Tissue-paper outer flame.
    const flameBase = thrusterEnd.clone().addScaledVector(axis, 0.022);
    const flameTip = flameBase.clone().addScaledVector(axis, 0.135);
    flameTip.x += s * 0.018;
    flameTip.y += 0.008;
    addSpike(flameBase, flameTip, 0.052, flame, {
      name: "jetpackOuterFlame",
    });

    // Slightly bent side tongues make the flame feel cut from crinkled tissue.
    const tongueA = flameBase.clone().addScaledVector(axis, 0.012);
    tongueA.x += s * 0.025;
    tongueA.y += 0.012;
    const tongueATip = tongueA.clone().addScaledVector(axis, 0.078);
    tongueATip.x += s * 0.026;
    tongueATip.y += 0.016;
    addSpike(tongueA, tongueATip, 0.023, flame, {
      name: "jetpackFlameTongue",
    });

    const tongueB = flameBase.clone().addScaledVector(axis, 0.018);
    tongueB.x -= s * 0.022;
    tongueB.y -= 0.004;
    const tongueBTip = tongueB.clone().addScaledVector(axis, 0.067);
    tongueBTip.x -= s * 0.028;
    tongueBTip.y -= 0.012;
    addSpike(tongueB, tongueBTip, 0.019, flame, {
      name: "jetpackFlameTongue",
    });

    // Yellow inner flame, nested just inside the orange cone.
    const coreBase = flameBase.clone().addScaledVector(axis, 0.008);
    const coreTip = coreBase.clone().addScaledVector(axis, 0.092);
    coreTip.x += s * 0.006;
    coreTip.y += 0.006;
    addSpike(coreBase, coreTip, 0.029, flameCore, {
      name: "jetpackFlameCore",
    });

    // One tiny foil rivet where each thruster meets its patch.
    const rivet = thrusterRoot.clone().addScaledVector(axis, -0.008);
    b.part(new THREE.SphereGeometry(0.012, 7, 5), foil, {
      bone: body,
      at: rivet,
      name: "jetpackMountRivet",
    });
  }
}
    return buildJetpack;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "boxBotKid" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.8,0], dir: [0,1,0], role: "spine" });
  J["head"] = b.joint("head", { parent: J["body"], at: [0,1.02,0], dir: [0,1,0], role: "head" });
  J["armL"] = b.joint("armL", { parent: J["body"], at: [0.36,0.96,0.03], dir: [0.17,-1,0.11], role: "arm" });
  J["handL"] = b.joint("handL", { parent: J["armL"], at: [0.43,0.53,0.08], dir: [0.17,-1,0.11], role: "digit" });
  J["armR"] = b.joint("armR", { parent: J["body"], at: [-0.36,0.96,0.03], dir: [-0.17,-1,0.11], role: "arm" });
  J["handR"] = b.joint("handR", { parent: J["armR"], at: [-0.43,0.53,0.08], dir: [-0.17,-1,0.11], role: "digit" });
  J["legL"] = b.joint("legL", { parent: J["body"], at: [0.13,0.56,0], dir: [0,-1,0], role: "leg" });
  J["footL"] = b.joint("footL", { parent: J["legL"], at: [0.13,0.14,0.04], dir: [0,0,1], role: "hinge" });
  J["legR"] = b.joint("legR", { parent: J["body"], at: [-0.13,0.56,0], dir: [0,-1,0], role: "leg" });
  J["footR"] = b.joint("footR", { parent: J["legR"], at: [-0.13,0.14,0.04], dir: [0,0,1], role: "hinge" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
