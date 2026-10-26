```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A stylized upright piano accordion with pearlescent shell casings, burgundy bellows, a vertical piano keyboard, bass buttons, gold piping, and leather straps.",
};

export const REQUESTS = [
  {
    id: "bassButtonArray",
    kind: "add",
    part: "bassPanel",
    what: "Add a rich array of small round bass and chord buttons across the bass panel: three staggered columns, alternating PEARL, PEARL_GREEN, and PEARL_PINK caps, each with a tiny GOLD rim and a dark burgundy shadow.",
    at: [0.505, 0.92, 0.255],
    normal: [0, 0, 1],
    bone: null,
    room: [0.06, 0.76, 0.08],
  },
  {
    id: "bellowsMedallion",
    kind: "add",
    part: "bellowsFace",
    what: "Place a small Italian filigree medallion centered high on the bellows: a dark burgundy oval backing, a GOLD rim, and a stylized PEARL treble-clef emblem. Keep it shallow and flush to the front.",
    at: [0, 1.29, 0.218],
    normal: [0, 0, 1],
    bone: null,
    room: [0.2, 0.18, 0.04],
  },
  {
    id: "registerSwitches",
    kind: "add",
    part: "keyboardPanel",
    what: "Add five compact register switches above the piano keys, each as a short ivory slider with a burgundy slot and a tiny GOLD cap. Arrange them in one neat horizontal row.",
    at: [-0.475, 1.425, 0.3],
    normal: [0, 0, 1],
    bone: null,
    room: [0.13, 0.11, 0.1],
  },
  {
    id: "trebleNameplate",
    kind: "add",
    part: "trebleShell",
    what: "Add a slim GOLD nameplate on the upper treble casing, with a dark burgundy inset and raised cream lettering reading 'ITALIA'. Use a small rounded plaque, not a floating sign.",
    at: [-0.405, 1.38, 0.255],
    normal: [0, 0, 1],
    bone: null,
    room: [0.11, 0.12, 0.035],
  },
  {
    id: "bassGrille",
    kind: "add",
    part: "bassShell",
    what: "Build a decorative bass grille on the upper half of the bass casing: a shallow burgundy inset with six small horizontal GOLD slots and a thin PEARL border, all seated on the shell.",
    at: [0.405, 1.27, 0.255],
    normal: [0, 0, 1],
    bone: null,
    room: [0.12, 0.2, 0.035],
  },
  {
    id: "bellowsCornerClips",
    kind: "add",
    part: "bellowsFace",
    what: "Add four small GOLD bellows corner clips where the burgundy bellows meet the top and bottom rails. Each clip should be a chunky low-poly bracket with a tiny pearl rivet.",
    at: [-0.255, 0.38, 0.225],
    normal: [0, 0, 1],
    bone: null,
    room: [0.08, 0.09, 0.06],
  },
  {
    id: "strapBuckles",
    kind: "add",
    part: "topCap",
    what: "Add paired GOLD shoulder-strap buckles at the top shoulders, one on each side of the accordion. They should be squat rectangular buckles with dark leather through their centers.",
    at: [-0.34, 1.505, -0.03],
    normal: [0, 1, 0],
    bone: null,
    room: [0.16, 0.08, 0.16],
  },
  {
    id: "lowerFootStuds",
    kind: "add",
    part: "bottomCap",
    what: "Add four small GOLD protective studs around the lower corners, two visible on the front and two peeking around the sides. Keep them integrated into the lower rail.",
    at: [-0.34, 0.13, 0.21],
    normal: [0, 0, 1],
    bone: null,
    room: [0.18, 0.1, 0.06],
  },
  {
    id: "pearlEdgeRivets",
    kind: "add",
    part: "trebleShell",
    what: "Add a restrained row of tiny GOLD rivets following the outer front frame of both shell casings, with evenly spaced low-poly heads and no rivets across the clear center inlay.",
    at: [-0.495, 0.83, 0.26],
    normal: [0, 0, 1],
    bone: null,
    room: [0.04, 1.02, 0.035],
  },
  {
    id: "shellMosaic",
    kind: "texture",
    part: "trebleShell",
    what: "Paint the treble shell as Italian mother-of-pearl: broad angular cream, blush, and mint nacre facets with subtle ivory highlights, a restrained burgundy border shadow, and a clean clear center for the nameplate.",
  },
  {
    id: "bassMosaic",
    kind: "texture",
    part: "bassShell",
    what: "Paint the bass shell with a rich mother-of-pearl mosaic using PEARL, PEARL_GREEN, and PEARL_PINK, arranged as large radial fan facets around the button field while preserving the GOLD frame.",
  },
  {
    id: "bellowsLeather",
    kind: "texture",
    part: "bellowsFace",
    what: "Texture the bellows face as alternating deep burgundy leather folds with slightly lighter wine-red ridges, subtle vertical grain, and a soft worn highlight on the forward-facing pleats.",
  },
  {
    id: "keyboardPearl",
    kind: "texture",
    part: "keyboardPanel",
    what: "Give the keyboard surround a restrained warm ivory nacre texture with faint pink-green mother-of-pearl shimmer, leaving every white and black piano key crisp and readable.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const PALETTE = {
  PEARL: "#f3ead5",
  PEARL_BRIGHT: "#fff8e9",
  PEARL_GREEN: "#cce6d9",
  PEARL_PINK: "#efc9d0",
  PEARL_BLUE: "#c9dce0",
  IVORY: "#fff4d8",
  BURGUNDY: "#4b2035",
  BURGUNDY_DARK: "#281522",
  WINE: "#74334d",
  WINE_LIGHT: "#a85a6b",
  GOLD: "#c99138",
  GOLD_BRIGHT: "#f0c96d",
  BLACK: "#17131a",
  KEY_WHITE: "#fff9e8",
  KEY_SHADOW: "#d7cbb8",
  STRAP: "#2c1820",
  STRAP_EDGE: "#6d3a39",
  RUBBER: "#201b22",
} as const;

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-piano-accordion", detail: 1 });

  const C = PALETTE;

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      rotation,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir: [0, 0, 1],
      name,
      flat: true,
    });

  const shellSide = (s: number, sideName: "treble" | "bass") => {
    const shellX = s * 0.405;
    const faceName = sideName === "treble" ? "trebleShell" : "bassShell";
    const panelName = sideName === "treble" ? "keyboardPanel" : "bassPanel";

    box([0.22, 1.36, 0.43], C.PEARL, [shellX, 0.83, 0], faceName);

    box(
      [0.17, 1.11, 0.035],
      sideName === "treble" ? C.PEARL_BRIGHT : C.PEARL_GREEN,
      [shellX, 0.83, 0.235],
      panelName,
    );

    box([0.025, 1.08, 0.035], C.GOLD, [shellX - s * 0.078, 0.83, 0.258], `${sideName}FrameOuter`);
    box([0.025, 1.08, 0.035], C.GOLD, [shellX + s * 0.078, 0.83, 0.258], `${sideName}FrameInner`);
    box([0.17, 0.026, 0.035], C.GOLD, [shellX, 1.365, 0.258], `${sideName}FrameTop`);
    box([0.17, 0.026, 0.035], C.GOLD, [shellX, 0.295, 0.258], `${sideName}FrameBottom`);

    box(
      [0.13, 0.028, 0.04],
      C.BURGUNDY,
      [shellX, 1.338, 0.264],
      `${sideName}UpperWineTrim`,
    );
    box(
      [0.13, 0.028, 0.04],
      C.BURGUNDY,
      [shellX, 0.325, 0.264],
      `${sideName}LowerWineTrim`,
    );

    const diamond = [
      [-0.062, 0],
      [0, 0.18],
      [0.062, 0],
      [0, -0.18],
    ] as [number, number][];

    b.extrude(diamond, {
      at: [shellX, 0.84, 0.267],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: sideName === "treble" ? C.PEARL_PINK : C.PEARL_BLUE,
      name: `${sideName}PearlDiamond`,
    });

    b.part(new THREE.TorusGeometry(0.088, 0.008, 6, 12), C.GOLD_BRIGHT, {
      at: [shellX, 0.84, 0.276],
      dir: [0, 0, 1],
      axis: "z",
      name: `${sideName}DiamondRing`,
      flat: true,
    });

    box(
      [0.045, 0.52, 0.018],
      C.PEARL_GREEN,
      [shellX - s * 0.045, 0.84, 0.279],
      `${sideName}MintFacet`,
      [0, 0, s * 14],
    );

    box(
      [0.035, 0.46, 0.02],
      C.PEARL_PINK,
      [shellX + s * 0.05, 0.84, 0.281],
      `${sideName}RoseFacet`,
      [0, 0, -s * 18],
    );

    const cornerPositions: [number, number][] = [
      [-0.072, 1.29],
      [0.072, 1.29],
      [-0.072, 0.38],
      [0.072, 0.38],
    ];

    cornerPositions.forEach(([dx, y], i) => {
      b.part(new THREE.SphereGeometry(0.024, 8, 5), C.GOLD_BRIGHT, {
        at: [shellX + dx, y, 0.281],
        name: `${sideName}CornerStud${i}`,
        flat: true,
      });
    });
  };

  const addBurgundy = (size: [number, number, number], at: [number, number, number], name: string) =>
    box(size, C.BURGUNDY, at, name);

  const addPearl = (size: [number, number, number], at: [number, number, number], name: string) =>
    box(size, C.PEARL_BRIGHT, at, name);

  // Central bellows block and the dark rear body.
  box([0.61, 1.23, 0.34], C.BURGUNDY_DARK, [0, 0.84, -0.005], "bellowsCore");
  box([0.59, 1.18, 0.032], C.BURGUNDY, [0, 0.84, 0.178], "bellowsFace");
  box([0.59, 1.18, 0.026], C.BURGUNDY_DARK, [0, 0.84, -0.183], "bellowsBack");

  // Vertical bellows folds. The wider wine strips make the accordion read immediately from the front.
  const foldCount = 11;
  for (let i = 0; i < foldCount; i++) {
    const x = -0.255 + i * 0.051;
    const color = i % 2 === 0 ? C.WINE : C.WINE_LIGHT;
    box([0.018, 1.13, 0.034], color, [x, 0.84, 0.205], `bellowsFold${i}`);
    box([0.008, 1.08, 0.012], C.GOLD, [x + 0.012, 0.84, 0.226], `bellowsFoldHighlight${i}`);
  }

  // Small dark valleys between the pleats keep the front face from reading as a flat red panel.
  for (let i = 0; i < 10; i++) {
    const x = -0.229 + i * 0.051;
    box([0.012, 1.08, 0.015], C.BURGUNDY_DARK, [x, 0.84, 0.228], `bellowsValley${i}`);
  }

  // Bellows rails, deliberately chunky and clear for later corner clips.
  box([0.63, 0.105, 0.38], C.PEARL_BRIGHT, [0, 1.465, 0], "topCap");
  box([0.63, 0.105, 0.38], C.PEARL, [0, 0.215, 0], "bottomCap");
  box([0.59, 0.035, 0.4], C.GOLD, [0, 1.411, 0.214], "topFrontGoldRail");
  box([0.59, 0.035, 0.4], C.GOLD, [0, 0.269, 0.214], "bottomFrontGoldRail");
  box([0.58, 0.028, 0.37], C.BURGUNDY, [0, 1.432, 0.218], "topWineRail");
  box([0.58, 0.028, 0.37], C.BURGUNDY, [0, 0.249, 0.218], "bottomWineRail");

  // Pearl side casings.
  shellSide(-1, "treble");
  shellSide(1, "bass");

  // Rounded upper and lower shell corners.
  for (const s of [-1, 1]) {
    const side = s < 0 ? "treble" : "bass";
    for (const y of [1.47, 0.195]) {
      b.part(new THREE.SphereGeometry(0.12, 8, 5), C.PEARL_BRIGHT, {
        at: [s * 0.405, y, 0],
        scale: [1, 0.48, 1.65],
        name: `${side}RoundedCorner${y > 1 ? "Top" : "Bottom"}`,
        flat: true,
      });
    }
  }

  // Piano keyboard surround on the model-right / treble side.
  box([0.16, 0.93, 0.06], C.BURGUNDY_DARK, [-0.503, 0.87, 0.263], "keyboardPanel");
  box([0.145, 0.91, 0.022], C.PEARL_BRIGHT, [-0.503, 0.87, 0.299], "keyboardIvoryBed");
  box([0.018, 0.91, 0.038], C.GOLD, [-0.582, 0.87, 0.302], "keyboardOuterTrim");
  box([0.018, 0.91, 0.038], C.GOLD, [-0.424, 0.87, 0.302], "keyboardInnerTrim");

  // White piano keys, stacked vertically as on a compact accordion keyboard.
  const whiteKeyY = 0.445;
  const whiteKeyStep = 0.074;
  const whiteKeyCount = 12;
  for (let i = 0; i < whiteKeyCount; i++) {
    const y = whiteKeyY + i * whiteKeyStep;
    box(
      [0.135, 0.067, 0.052],
      i % 4 === 0 ? C.KEY_WHITE : C.IVORY,
      [-0.503, y, 0.332],
      `whiteKey${i}`,
    );
    box([0.135, 0.006, 0.056], C.KEY_SHADOW, [-0.503, y - 0.033, 0.361], `keyGap${i}`);
  }

  // Black keys sit slightly forward and bridge the relevant white-key gaps.
  const blackKeyIndices = [1, 2, 4, 5, 6, 8, 9, 11];
  blackKeyIndices.forEach((index, i) => {
    const y = whiteKeyY + index * whiteKeyStep - 0.037;
    box([0.095, 0.043, 0.075], C.BLACK, [-0.486, y, 0.367], `blackKey${i}`);
    box([0.074, 0.009, 0.02], C.GOLD, [-0.486, y + 0.021, 0.407], `blackKeyHighlight${i}`);
  });

  // Small pearl cheeks beside the key column.
  box([0.033, 0.84, 0.026], C.PEARL_PINK, [-0.593, 0.87, 0.333], "keyboardRoseCheek");
  box([0.033, 0.84, 0.026], C.PEARL_GREEN, [-0.413, 0.87, 0.333], "keyboardMintCheek");

  // Register rail above the keys. Stage 2 can add the more elaborate switch mechanisms in the clear space.
  box([0.135, 0.045, 0.06], C.BURGUNDY_DARK, [-0.503, 1.422, 0.313], "registerRail");
  for (let i = 0; i < 5; i++) {
    const x = -0.557 + i * 0.027;
    cylinder(0.012, 0.045, i % 2 ? C.PEARL_GREEN : C.PEARL_PINK, [x, 1.422, 0.35], `registerBlank${i}`, 8);
  }

  // Bass button field on the model-left / bass side.
  box([0.17, 0.92, 0.042], C.BURGUNDY_DARK, [0.405, 0.86, 0.266], "bassPanel");
  const bassXs = [0.347, 0.405, 0.463];
  const bassYs = [0.51, 0.705, 0.90, 1.095, 1.29];
  let buttonIndex = 0;
  for (let row = 0; row < bassYs.length; row++) {
    for (let col = 0; col < bassXs.length; col++) {
      const x = bassXs[col] + (row % 2 ? 0.012 : 0);
      const y = bassYs[row];
      cylinder(0.034, 0.018, C.GOLD, [x, y, 0.299], `bassButtonBase${buttonIndex}`, 10);
      cylinder(
        0.025,
        0.022,
        (row + col) % 3 === 0 ? C.PEARL_PINK : (row + col) % 3 === 1 ? C.PEARL_GREEN : C.PEARL_BRIGHT,
        [x, y, 0.316],
        `bassButton${buttonIndex}`,
        10,
      );
      buttonIndex++;
    }
  }

  // A restrained bass-side frame keeps the buttons seated in a readable field.
  box([0.022, 0.92, 0.035], C.GOLD, [0.315, 0.86, 0.318], "bassFrameOuter");
  box([0.022, 0.92, 0.035], C.GOLD, [0.495, 0.86, 0.318], "bassFrameInner");
  box([0.18, 0.022, 0.035], C.GOLD, [0.405, 0.332, 0.318], "bassFrameBottom");
  box([0.18, 0.022, 0.035], C.GOLD, [0.405, 1.39, 0.318], "bassFrameTop");

  // A few large, flat nacre facets make the shell material read before textures are added.
  for (const s of [-1, 1]) {
    const side = s < 0 ? "treble" : "bass";
    box(
      [0.026, 0.26, 0.012],
      C.PEARL_GREEN,
      [s * 0.335, 1.16, 0.329],
      `${side}UpperMintFacet`,
      [0, 0, s * 22],
    );
    box(
      [0.026, 0.28, 0.012],
      C.PEARL_PINK,
      [s * 0.475, 0.58, 0.329],
      `${side}LowerRoseFacet`,
      [0, 0, -s * 18],
    );
    box(
      [0.022, 0.22, 0.012],
      C.PEARL_BLUE,
      [s * 0.47, 1.13, 0.33],
      `${side}UpperBlueFacet`,
      [0, 0, -s * 28],
    );
  }

  // Front-facing shoulder strap anchors.
  for (const s of [-1, 1]) {
    box([0.045, 0.12, 0.05], C.STRAP, [s * 0.285, 1.48, 0.225], `strapTopAnchor${s}`);
    box([0.045, 0.12, 0.05], C.STRAP, [s * 0.285, 0.20, 0.225], `strapBottomAnchor${s}`);
    cylinder(0.025, 0.018, C.GOLD, [s * 0.285, 1.49, 0.262], `strapTopRivet${s}`, 8);
    cylinder(0.025, 0.018, C.GOLD, [s * 0.285, 0.19, 0.262], `strapBottomRivet${s}`, 8);
  }

  // Leather shoulder straps run behind the instrument, giving the silhouette a practical accordion profile.
  for (const s of [-1, 1]) {
    b.capsule(
      [s * 0.29, 1.43, -0.23],
      [s * 0.29, 0.29, -0.23],
      0.024,
      {
        color: C.STRAP,
        name: `rearShoulderStrap${s}`,
        section: { ngon: 6 },
      },
    );
    box([0.065, 0.13, 0.025], C.STRAP_EDGE, [s * 0.29, 1.31, -0.23], `upperStrapLeather${s}`);
    box([0.065, 0.13, 0.025], C.STRAP_EDGE, [s * 0.29, 0.41, -0.23], `lowerStrapLeather${s}`);
  }

  // Low rubber feet keep the lowest point just above the floor.
  for (const s of [-1, 1]) {
    box([0.19, 0.055, 0.28], C.RUBBER, [s * 0.405, 0.045, -0.02], `rubberFoot${s}`);
    box([0.20, 0.018, 0.29], C.GOLD, [s * 0.405, 0.078, 0.19], `footFrontPlate${s}`);
  }

  // Small gold corner rails tie the two shell colors into the central bellows.
  for (const s of [-1, 1]) {
    box([0.035, 1.14, 0.035], C.GOLD_BRIGHT, [s * 0.292, 0.84, 0.225], `bellowsSideRail${s}`);
    box([0.032, 1.12, 0.027], C.BURGUNDY, [s * 0.275, 0.84, 0.236], `bellowsSideWineRail${s}`);
  }

  // A rear center spine is visible at the top and bottom and gives the bellows a finished edge.
  box([0.07, 1.18, 0.11], C.BURGUNDY_DARK, [0, 0.84, -0.22], "rearCenterSpine");
  box([0.09, 0.08, 0.13], C.PEARL, [0, 1.46, -0.22], "rearTopSpineCap");
  box([0.09, 0.08, 0.13], C.PEARL, [0, 0.22, -0.22], "rearBottomSpineCap");

  // Stage 2 appends its detail builders here.
  for (const add of STAGE2) add(b);

  return b.root;
}
```