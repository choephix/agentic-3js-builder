import * as THREE from "three";
import { type Builder, createBuilder, noise, paint, type Fill, catmull, svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";

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

const C = PALETTE;

function nacreShell(centerX: number, treble: boolean) {
  const facets = treble
    ? [C.PEARL, C.PEARL_PINK, C.PEARL_GREEN, C.PEARL_BRIGHT, C.PEARL_BLUE]
    : [C.PEARL, C.PEARL_GREEN, C.PEARL_PINK, C.PEARL_BRIGHT, C.PEARL_BLUE];

  return paint((p, n, _s) => {
    const dx = p.x - centerX;
    const dy = p.y - 0.84;

    if (n.z > 0.3) {
      const edge =
        Math.max(Math.abs(dx) / 0.11, Math.abs(dy) / 0.68) > 0.91;
      if (edge) return C.BURGUNDY;

      if (treble && Math.abs(dx) < 0.052 && Math.abs(dy) < 0.205) {
        return C.PEARL_BRIGHT;
      }

      const angle = Math.atan2(dy, dx);
      const drift = noise(p, 0.18, treble ? 31 : 47);
      const sector = Math.floor(
        ((angle + Math.PI) / (Math.PI * 2)) * 9 + drift * 0.8,
      );
      const shimmer = noise(p, 0.07, treble ? 71 : 89);

      if (shimmer > 0.86) return C.PEARL_BRIGHT;
      return facets[((sector % facets.length) + facets.length) % facets.length];
    }

    if (n.y > 0.5) return C.PEARL_BRIGHT;
    if (n.y < -0.45) return C.PEARL;
    return noise(p, 0.12, treble ? 101 : 113) > 0.62
      ? C.PEARL_GREEN
      : C.PEARL;
  });
}

const TREBLE_NACRE = nacreShell(-0.405, true);
const BASS_NACRE = nacreShell(0.405, false);

const BELLOWS_LEATHER = paint((p, n, _s) => {
  const fold = Math.floor((p.x + 0.3) / 0.051);
  const grain = noise(p, 0.045, 173);
  const base = fold % 2 === 0 ? C.WINE : C.BURGUNDY;

  if (n.z > 0.55 && fold % 2 === 0 && grain > 0.61) {
    return C.WINE_LIGHT;
  }
  if (grain < 0.18) return C.BURGUNDY_DARK;
  return base;
});

const KEYBOARD_NACRE = paint((p, n, _s) => {
  const shimmer = noise(p, 0.055, 227);
  if (n.z > 0.3) {
    if (shimmer > 0.79) return C.PEARL_PINK;
    if (shimmer < 0.22) return C.PEARL_GREEN;
    if (shimmer > 0.58) return C.PEARL_BRIGHT;
  }
  return C.IVORY;
});

export default function build() {
  const b = createBuilder({
    name: "italian-mother-of-pearl-piano-accordion",
    detail: 1,
  });

  const box = (
    size: [number, number, number],
    color: Fill,
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
    const shellPaint = sideName === "treble" ? TREBLE_NACRE : BASS_NACRE;

    box([0.22, 1.36, 0.43], shellPaint, [shellX, 0.83, 0], faceName);

    box(
      [0.17, 1.11, 0.035],
      sideName === "treble" ? C.PEARL_BRIGHT : C.PEARL_GREEN,
      [shellX, 0.83, 0.235],
      panelName,
    );

    box(
      [0.025, 1.08, 0.035],
      C.GOLD,
      [shellX - s * 0.078, 0.83, 0.258],
      `${sideName}FrameOuter`,
    );
    box(
      [0.025, 1.08, 0.035],
      C.GOLD,
      [shellX + s * 0.078, 0.83, 0.258],
      `${sideName}FrameInner`,
    );
    box([0.17, 0.026, 0.035], C.GOLD, [shellX, 1.365, 0.258], `${sideName}FrameTop`);
    box(
      [0.17, 0.026, 0.035],
      C.GOLD,
      [shellX, 0.295, 0.258],
      `${sideName}FrameBottom`,
    );

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

  box([0.61, 1.23, 0.34], C.BURGUNDY_DARK, [0, 0.84, -0.005], "bellowsCore");
  box([0.59, 1.18, 0.032], BELLOWS_LEATHER, [0, 0.84, 0.178], "bellowsFace");
  box([0.59, 1.18, 0.026], C.BURGUNDY_DARK, [0, 0.84, -0.183], "bellowsBack");

  const foldCount = 11;
  for (let i = 0; i < foldCount; i++) {
    const x = -0.255 + i * 0.051;
    const color = i % 2 === 0 ? C.WINE : C.WINE_LIGHT;
    box([0.018, 1.13, 0.034], color, [x, 0.84, 0.205], `bellowsFold${i}`);
    box(
      [0.008, 1.08, 0.012],
      C.GOLD,
      [x + 0.012, 0.84, 0.226],
      `bellowsFoldHighlight${i}`,
    );
  }

  for (let i = 0; i < 10; i++) {
    const x = -0.229 + i * 0.051;
    box(
      [0.012, 1.08, 0.015],
      C.BURGUNDY_DARK,
      [x, 0.84, 0.228],
      `bellowsValley${i}`,
    );
  }

  box([0.63, 0.105, 0.38], C.PEARL_BRIGHT, [0, 1.465, 0], "topCap");
  box([0.63, 0.105, 0.38], C.PEARL, [0, 0.215, 0], "bottomCap");
  box([0.59, 0.035, 0.4], C.GOLD, [0, 1.411, 0.214], "topFrontGoldRail");
  box([0.59, 0.035, 0.4], C.GOLD, [0, 0.269, 0.214], "bottomFrontGoldRail");
  box([0.58, 0.028, 0.37], C.BURGUNDY, [0, 1.432, 0.218], "topWineRail");
  box([0.58, 0.028, 0.37], C.BURGUNDY, [0, 0.249, 0.218], "bottomWineRail");

  shellSide(-1, "treble");
  shellSide(1, "bass");

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

  box(
    [0.16, 0.93, 0.06],
    KEYBOARD_NACRE,
    [-0.503, 0.87, 0.263],
    "keyboardPanel",
  );
  box([0.145, 0.91, 0.022], C.PEARL_BRIGHT, [-0.503, 0.87, 0.299], "keyboardIvoryBed");
  box([0.018, 0.91, 0.038], C.GOLD, [-0.582, 0.87, 0.302], "keyboardOuterTrim");
  box([0.018, 0.91, 0.038], C.GOLD, [-0.424, 0.87, 0.302], "keyboardInnerTrim");

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

  const blackKeyIndices = [1, 2, 4, 5, 6, 8, 9, 11];
  blackKeyIndices.forEach((index, i) => {
    const y = whiteKeyY + index * whiteKeyStep - 0.037;
    box([0.095, 0.043, 0.075], C.BLACK, [-0.486, y, 0.367], `blackKey${i}`);
    box(
      [0.074, 0.009, 0.02],
      C.GOLD,
      [-0.486, y + 0.021, 0.407],
      `blackKeyHighlight${i}`,
    );
  });

  box([0.033, 0.84, 0.026], C.PEARL_PINK, [-0.593, 0.87, 0.333], "keyboardRoseCheek");
  box([0.033, 0.84, 0.026], C.PEARL_GREEN, [-0.413, 0.87, 0.333], "keyboardMintCheek");

  box([0.135, 0.045, 0.06], C.BURGUNDY_DARK, [-0.503, 1.422, 0.313], "registerRail");
  for (let i = 0; i < 5; i++) {
    const x = -0.557 + i * 0.027;
    cylinder(
      0.012,
      0.045,
      i % 2 ? C.PEARL_GREEN : C.PEARL_PINK,
      [x, 1.422, 0.35],
      `registerBlank${i}`,
      8,
    );
  }

  box([0.17, 0.92, 0.042], C.BURGUNDY_DARK, [0.405, 0.86, 0.266], "bassPanel");
  const bassXs = [0.347, 0.405, 0.463];
  const bassYs = [0.51, 0.705, 0.9, 1.095, 1.29];
  let buttonIndex = 0;
  for (let row = 0; row < bassYs.length; row++) {
    for (let col = 0; col < bassXs.length; col++) {
      const x = bassXs[col] + (row % 2 ? 0.012 : 0);
      const y = bassYs[row];
      cylinder(0.034, 0.018, C.GOLD, [x, y, 0.299], `bassButtonBase${buttonIndex}`, 10);
      cylinder(
        0.025,
        0.022,
        (row + col) % 3 === 0
          ? C.PEARL_PINK
          : (row + col) % 3 === 1
            ? C.PEARL_GREEN
            : C.PEARL_BRIGHT,
        [x, y, 0.316],
        `bassButton${buttonIndex}`,
        10,
      );
      buttonIndex++;
    }
  }

  box([0.022, 0.92, 0.035], C.GOLD, [0.315, 0.86, 0.318], "bassFrameOuter");
  box([0.022, 0.92, 0.035], C.GOLD, [0.495, 0.86, 0.318], "bassFrameInner");
  box([0.18, 0.022, 0.035], C.GOLD, [0.405, 0.332, 0.318], "bassFrameBottom");
  box([0.18, 0.022, 0.035], C.GOLD, [0.405, 1.39, 0.318], "bassFrameTop");

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

  for (const s of [-1, 1]) {
    box([0.045, 0.12, 0.05], C.STRAP, [s * 0.285, 1.48, 0.225], `strapTopAnchor${s}`);
    box([0.045, 0.12, 0.05], C.STRAP, [s * 0.285, 0.2, 0.225], `strapBottomAnchor${s}`);
    cylinder(0.025, 0.018, C.GOLD, [s * 0.285, 1.49, 0.262], `strapTopRivet${s}`, 8);
    cylinder(0.025, 0.018, C.GOLD, [s * 0.285, 0.19, 0.262], `strapBottomRivet${s}`, 8);
  }

  for (const s of [-1, 1]) {
    b.capsule([s * 0.29, 1.43, -0.23], [s * 0.29, 0.29, -0.23], 0.024, {
      color: C.STRAP,
      name: `rearShoulderStrap${s}`,
      section: { ngon: 6 },
    });
    box(
      [0.065, 0.13, 0.025],
      C.STRAP_EDGE,
      [s * 0.29, 1.31, -0.23],
      `upperStrapLeather${s}`,
    );
    box(
      [0.065, 0.13, 0.025],
      C.STRAP_EDGE,
      [s * 0.29, 0.41, -0.23],
      `lowerStrapLeather${s}`,
    );
  }

  for (const s of [-1, 1]) {
    box([0.19, 0.055, 0.28], C.RUBBER, [s * 0.405, 0.045, -0.02], `rubberFoot${s}`);
    box([0.2, 0.018, 0.29], C.GOLD, [s * 0.405, 0.078, 0.19], `footFrontPlate${s}`);
  }

  for (const s of [-1, 1]) {
    box(
      [0.035, 1.14, 0.035],
      C.GOLD_BRIGHT,
      [s * 0.292, 0.84, 0.225],
      `bellowsSideRail${s}`,
    );
    box(
      [0.032, 1.12, 0.027],
      C.BURGUNDY,
      [s * 0.275, 0.84, 0.236],
      `bellowsSideWineRail${s}`,
    );
  }

  box([0.07, 1.18, 0.11], C.BURGUNDY_DARK, [0, 0.84, -0.22], "rearCenterSpine");
  box([0.09, 0.08, 0.13], C.PEARL, [0, 1.46, -0.22], "rearTopSpineCap");
  box([0.09, 0.08, 0.13], C.PEARL, [0, 0.22, -0.22], "rearBottomSpineCap");

  for (const add of STAGE2) add(b);

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addBassButtonArray(b: Builder) {
  const C = PALETTE;
  const anchorX = 0.505;
  const frontZ = 0.31;

  const addPart = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
  ) =>
    b.part(geometry, color, {
      at,
      name: `s21_${name}`,
      flat: true,
    });

  const addButton = (x: number, y: number, radius: number, color: string, index: number) => {
    // A dark burgundy socket gives every button a visible shadow against the shell.
    addPart(
      new THREE.CylinderGeometry(radius + 0.004, radius + 0.004, 0.014, 10, 1),
      C.BURGUNDY_DARK,
      [x, y, frontZ - 0.021],
      `buttonShadow_${index}`,
    );

    // Separate low-poly torus so the gold rim catches the light around the nacre cap.
    addPart(
      new THREE.TorusGeometry(radius + 0.001, 0.0026, 6, 12),
      C.GOLD_BRIGHT,
      [x, y, frontZ - 0.010],
      `buttonGoldRim_${index}`,
    );

    // Slightly tapered caps read as pearl buttons rather than flat discs.
    addPart(
      new THREE.CylinderGeometry(radius * 0.88, radius, 0.022, 10, 1),
      color,
      [x, y, frontZ + 0.001],
      `buttonPearlCap_${index}`,
    );
  };

  const pearlColors = [C.PEARL_BRIGHT, C.PEARL_GREEN, C.PEARL_PINK];
  const ys = [0.595, 0.702, 0.809, 0.916, 1.023, 1.130, 1.237];
  const offsets = [-0.019, 0, 0.019];
  let index = 0;

  // Three staggered columns, deliberately larger and more jewel-like than the original button field.
  for (let row = 0; row < ys.length; row++) {
    const stagger = row % 2 === 0 ? -0.0028 : 0.0028;
    for (let col = 0; col < 3; col++) {
      const x = anchorX + offsets[col] + stagger;
      const radius = col === 1 ? 0.0112 : 0.0102;
      const color = pearlColors[(row * 2 + col) % pearlColors.length];
      addButton(x, ys[row], radius, color, index++);
    }
  }

  // Fine gold rails frame the added button field without hiding the pearl casing.
  addPart(
    new THREE.BoxGeometry(0.005, 0.70, 0.012),
    C.GOLD,
    [anchorX - 0.029, 0.916, frontZ + 0.004],
    "buttonFieldRailLeft",
  );
  addPart(
    new THREE.BoxGeometry(0.005, 0.70, 0.012),
    C.GOLD,
    [anchorX + 0.029, 0.916, frontZ + 0.004],
    "buttonFieldRailRight",
  );

  // Small pearl-and-gold terminal rivets make the frame feel fitted into the shell.
  const terminalYs = [0.548, 1.284];
  let rivet = 0;
  for (const y of terminalYs) {
    for (const dx of [-0.029, 0, 0.029]) {
      addPart(
        new THREE.CylinderGeometry(0.007, 0.007, 0.010, 8, 1),
        C.GOLD_BRIGHT,
        [anchorX + dx, y, frontZ + 0.006],
        `fieldTerminalRivet_${rivet++}`,
      );
    }
  }

  // Tiny diamond ornaments cap the array and echo the larger mother-of-pearl diamonds on the casing.
  const ornament: [number, number, "sharp"][] = [
    [-0.013, 0, "sharp"],
    [0, 0.016, "sharp"],
    [0.013, 0, "sharp"],
    [0, -0.016, "sharp"],
  ];

  for (const y of [0.535, 1.297]) {
    b.extrude(ornament, {
      at: [anchorX, y, frontZ + 0.010],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: C.GOLD_BRIGHT,
      name: `s21_buttonFieldDiamond_${y > 1 ? "top" : "bottom"}`,
    });
  }
}
    return addBassButtonArray;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBellowsMedallion(b: Builder) {
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
      color,
      name,
      rotation,
      flat: true,
    });

  const frontCylinder = (
    radius: number,
    depth: number,
    color: string,
    at: [number, number, number],
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir: [0, 0, 1],
      axis: "y",
      name,
      flat: true,
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Bellows medallion: a shallow burgundy oval with a faceted gold bezel and a raised pearl treble clef.

  b.extrude(
    [
      [-0.071, -0.047],
      [-0.046, -0.061],
      [0.046, -0.061],
      [0.071, -0.047],
      [0.078, 0],
      [0.071, 0.047],
      [0.046, 0.061],
      [-0.046, 0.061],
      [-0.071, 0.047],
      [-0.078, 0],
    ],
    {
      at: [0, 1.29, 0.228],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.003,
      color: C.BURGUNDY_DARK,
      name: "bellowsMedallionBacking",
    },
  );

  b.part(new THREE.TorusGeometry(0.061, 0.006, 6, 18), C.GOLD_BRIGHT, {
    at: [0, 1.29, 0.234],
    dir: [0, 0, 1],
    axis: "z",
    scale: [1.22, 0.86, 1],
    name: "bellowsMedallionGoldBezel",
    flat: true,
  });

  b.part(new THREE.TorusGeometry(0.052, 0.0027, 5, 18), C.PEARL_GREEN, {
    at: [0, 1.29, 0.237],
    dir: [0, 0, 1],
    axis: "z",
    scale: [1.22, 0.86, 1],
    name: "bellowsMedallionPearlInset",
    flat: true,
  });

  // Four tiny bezel studs make the medallion feel like a fitted Italian instrument ornament.
  for (const [x, y, i] of [
    [-0.068, 1.29, 0],
    [0.068, 1.29, 1],
    [0, 1.343, 2],
    [0, 1.237, 3],
  ] as [number, number, number][]) {
    frontCylinder(0.006, 0.006, C.GOLD, [x, y, 0.24], `bellowsMedallionRivet${i}`, 8);
    frontCylinder(0.0032, 0.007, C.PEARL_BRIGHT, [x, y, 0.244], `bellowsMedallionRivetPearl${i}`, 7);
  }

  // A broad, continuous low-poly treble-clef stroke.
  const clefPath = catmull([
    [0.018, 1.242, 0.237],
    [0.037, 1.247, 0.237],
    [0.044, 1.262, 0.237],
    [0.033, 1.276, 0.237],
    [0.004, 1.279, 0.237],
    [-0.026, 1.271, 0.237],
    [-0.035, 1.254, 0.237],
    [-0.026, 1.244, 0.237],
    [-0.006, 1.245, 0.237],
    [0.016, 1.257, 0.237],
    [0.022, 1.279, 0.237],
    [0.016, 1.309, 0.237],
    [0.001, 1.332, 0.237],
    [-0.014, 1.345, 0.237],
    [-0.008, 1.354, 0.237],
    [0.012, 1.356, 0.237],
    [0.031, 1.347, 0.237],
    [0.037, 1.333, 0.237],
    [0.029, 1.321, 0.237],
    [0.010, 1.318, 0.237],
    [-0.007, 1.327, 0.237],
  ]);

  b.sweep(clefPath, 0.006, {
    color: C.PEARL_BRIGHT,
    caps: "round",
    sides: 7,
    name: "bellowsTrebleClef",
  });

  // A small gold shadow stroke gives the pearl emblem a jewelry-like edge without making it noisy.
  const clefAccent = catmull([
    [0.022, 1.244, 0.234],
    [0.041, 1.258, 0.234],
    [0.027, 1.276, 0.234],
    [0.001, 1.278, 0.234],
  ]);
  b.sweep(clefAccent, 0.0022, {
    color: C.GOLD,
    caps: "round",
    sides: 6,
    name: "bellowsTrebleClefAccent",
  });

  // A pearl bead at the visual crossing anchors the clef to the medallion.
  frontCylinder(0.009, 0.009, C.PEARL_PINK, [0.009, 1.309, 0.244], "bellowsClefBead", 8);
  frontCylinder(0.004, 0.011, C.GOLD_BRIGHT, [0.009, 1.309, 0.249], "bellowsClefBeadRim", 8);

  // ---------------------------------------------------------------------------------------------------------------
  // Register switches: five compact ivory sliders on burgundy slots above the keys.

  const switchXs = [-0.557, -0.530, -0.503, -0.476, -0.449];

  box([0.128, 0.076, 0.012], C.BURGUNDY_DARK, [-0.503, 1.423, 0.348], "registerSwitchRail");

  for (let i = 0; i < switchXs.length; i++) {
    const x = switchXs[i];
    const y = 1.423 + (i % 2 === 0 ? 0.002 : -0.002);

    // Recessed wine-colored slot.
    box([0.017, 0.057, 0.009], C.BURGUNDY, [x, y, 0.356], `registerSlot${i}`);

    // Ivory slider body, chamfer-like layered from a broad base and a smaller face.
    box([0.014, 0.039, 0.014], C.IVORY, [x, y, 0.364], `registerIvorySlider${i}`);
    box([0.009, 0.027, 0.006], C.PEARL_BRIGHT, [x, y + 0.002, 0.374], `registerSliderHighlight${i}`);

    // Gold cap at the upper end of each switch.
    frontCylinder(0.006, 0.009, C.GOLD_BRIGHT, [x, y + 0.019, 0.38], `registerGoldCap${i}`, 8);
  }

  // Fine gold line along the top of the switch bank and two end screws.
  box([0.132, 0.008, 0.009], C.GOLD, [-0.503, 1.467, 0.354], "registerRailGoldTop");
  for (const [x, i] of [
    [-0.565, 0],
    [-0.441, 1],
  ] as [number, number][]) {
    frontCylinder(0.005, 0.008, C.GOLD_BRIGHT, [x, 1.467, 0.36], `registerRailEndStud${i}`, 8);
  }

  // Tiny pearl dots below the switches echo the shell's nacre palette and visually separate the bank from the keys.
  for (let i = 0; i < switchXs.length; i++) {
    frontCylinder(
      0.003,
      0.006,
      i % 2 ? C.PEARL_GREEN : C.PEARL_PINK,
      [switchXs[i], 1.383, 0.355],
      `registerPearlDot${i}`,
      7,
    );
  }
}
    return addBellowsMedallion;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addTrebleNameplate(b: Builder) {
  const GOLD = "#c99138";
  const GOLD_BRIGHT = "#f0c96d";
  const BURGUNDY = "#4b2035";
  const BURGUNDY_DARK = "#281522";
  const PEARL = "#f3ead5";
  const IVORY = "#fff4d8";

  const center: [number, number, number] = [-0.405, 1.38, 0.262];

  const roundedOutline = (width: number, height: number, radius: number) =>
    [
      [-width / 2 + radius, -height / 2],
      [width / 2 - radius, -height / 2],
      [width / 2, -height / 2 + radius],
      [width / 2, height / 2 - radius],
      [width / 2 - radius, height / 2],
      [-width / 2 + radius, height / 2],
      [-width / 2, height / 2 - radius],
      [-width / 2, -height / 2 + radius],
    ] as [number, number][];

  // Thick, softly rounded gold mounting plate. Its back edge is slightly buried in the
  // treble casing so the plaque reads as fitted hardware rather than a floating sign.
  b.extrude(roundedOutline(0.106, 0.078, 0.012), {
    at: center,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.011,
    bevel: 0.004,
    smoothing: 1,
    color: GOLD,
    name: "trebleNameplateGoldMount",
    group: "trebleNameplate",
  });

  // Pearl-colored inner lip, leaving a visible gold border around the burgundy field.
  b.extrude(roundedOutline(0.094, 0.066, 0.009), {
    at: [-0.405, 1.38, 0.270],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.0025,
    smoothing: 1,
    color: PEARL,
    name: "trebleNameplatePearlLip",
    group: "trebleNameplate",
  });

  const plaqueArt = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 132">
      <rect x="5" y="5" width="230" height="122" rx="22" fill="#281522"/>
      <path d="M25 39 Q45 17 68 29 M172 29 Q195 17 215 39"
        fill="none" stroke="#c99138" stroke-width="4" stroke-linecap="round"/>
      <path d="M25 93 Q45 115 68 103 M172 103 Q195 115 215 93"
        fill="none" stroke="#c99138" stroke-width="4" stroke-linecap="round"/>
      <path d="M42 32 l8 8 l-8 8 l-8-8 Z M198 32 l8 8 l-8 8 l-8-8 Z"
        fill="#f0c96d"/>
      <path d="M42 84 l8 8 l-8 8 l-8-8 Z M198 84 l8 8 l-8 8 l-8-8 Z"
        fill="#f0c96d"/>
      <path d="M82 22 Q120 10 158 22 M82 110 Q120 122 158 110"
        fill="none" stroke="#74334d" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  // Printed wine-colored field and fine gold flourishes sit just above the pearl lip.
  b.part(new THREE.PlaneGeometry(0.084, 0.052), "#ffffff", {
    at: [-0.405, 1.38, 0.276],
    dir: [0, 0, 1],
    axis: "z",
    texture: plaqueArt,
    name: "trebleNameplateBurgundyInset",
    group: "trebleNameplate",
  });

  // Tiny pearl-and-gold corner studs pin the inset down.
  const studPositions: [number, number][] = [
    [-0.442, 1.402],
    [-0.368, 1.402],
    [-0.442, 1.358],
    [-0.368, 1.358],
  ];

  for (let i = 0; i < studPositions.length; i++) {
    const [x, y] = studPositions[i];
    b.part(new THREE.CylinderGeometry(0.0048, 0.0048, 0.004, 8), GOLD_BRIGHT, {
      at: [x, y, 0.280],
      dir: [0, 0, 1],
      name: `trebleNameplateStud${i}`,
      group: "trebleNameplate",
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0025, 6, 4), PEARL, {
      at: [x, y, 0.283],
      name: `trebleNameplateStudPearl${i}`,
      group: "trebleNameplate",
      flat: true,
    });
  }

  // Block-letter lettering is built as shallow raised cream tiles. The compact pixel
  // construction stays legible at accordion scale and gives the word actual relief.
  const glyphs: Record<string, readonly string[]> = {
    I: ["111", "010", "010", "010", "111"],
    T: ["111", "010", "010", "010", "010"],
    A: ["010", "101", "111", "101", "101"],
    L: ["100", "100", "100", "100", "111"],
  };

  const word = "ITALIA";
  const cellW = 0.00335;
  const cellH = 0.00455;
  const pitchX = 0.01225;
  const pitchY = 0.00545;
  const startX = -0.405 - ((word.length - 1) * pitchX) / 2;
  const startY = 1.38 - (2 * pitchY);

  let letterPart = 0;
  for (let letter = 0; letter < word.length; letter++) {
    const glyph = glyphs[word[letter]];
    const x0 = startX + letter * pitchX;

    for (let row = 0; row < glyph.length; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        if (glyph[row][col] !== "1") continue;

        b.part(new THREE.BoxGeometry(cellW, cellH, 0.0032), IVORY, {
          at: [
            x0 + (col - 1) * cellW * 1.02,
            startY + (4 - row) * pitchY,
            0.282,
          ],
          name: `trebleNameplateLetter${letterPart++}`,
          group: "trebleNameplate",
          flat: true,
        });
      }
    }
  }

  // A slim pearl highlight along the lower edge catches the nacreous casing light.
  b.part(new THREE.BoxGeometry(0.065, 0.0022, 0.0028), PEARL, {
    at: [-0.405, 1.345, 0.282],
    name: "trebleNameplateLowerHighlight",
    group: "trebleNameplate",
    flat: true,
  });

  // Two miniature gold rosettes flank the lettering without competing with it.
  for (const x of [-0.449, -0.361]) {
    b.part(new THREE.TorusGeometry(0.0058, 0.0013, 5, 10), GOLD_BRIGHT, {
      at: [x, 1.38, 0.283],
      dir: [0, 0, 1],
      axis: "z",
      name: `trebleNameplateRosette${x < -0.4 ? "L" : "R"}`,
      group: "trebleNameplate",
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0019, 6, 4), BURGUNDY_DARK, {
      at: [x, 1.38, 0.2845],
      name: `trebleNameplateRosetteCore${x < -0.4 ? "L" : "R"}`,
      group: "trebleNameplate",
      flat: true,
    });
  }
}
    return addTrebleNameplate;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addBassGrille(b: Builder) {
  const C = PALETTE;

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });

  const pearlRivet = (at: [number, number, number], name: string, scale = 1) =>
    b.part(new THREE.SphereGeometry(0.009 * scale, 8, 5), C.PEARL_BRIGHT, {
      at,
      name,
      flat: true,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Decorative bass grille. It is mounted slightly proud of the shell so it remains readable among the upper
  // button row, while the burgundy inset still appears to be part of the casing.
  const gx = 0.405;
  const gy = 1.315;
  const gz = 0.334;

  box([0.112, 0.112, 0.014], C.BURGUNDY_DARK, [gx, gy, gz], "s24BassGrilleInset");

  // Thin nacre frame.
  box([0.118, 0.009, 0.018], C.PEARL_BRIGHT, [gx, gy + 0.057, gz + 0.009], "s24BassGrilleBorderTop");
  box([0.118, 0.009, 0.018], C.PEARL_GREEN, [gx, gy - 0.057, gz + 0.009], "s24BassGrilleBorderBottom");
  box([0.009, 0.105, 0.018], C.PEARL_PINK, [gx - 0.055, gy, gz + 0.009], "s24BassGrilleBorderLeft");
  box([0.009, 0.105, 0.018], C.PEARL_BRIGHT, [gx + 0.055, gy, gz + 0.009], "s24BassGrilleBorderRight");

  // Six short horizontal gold slots, arranged as a compact twin-column grille.
  const slotXs = [gx - 0.027, gx + 0.027];
  const slotYs = [gy - 0.034, gy, gy + 0.034];
  let slotIndex = 0;
  for (let row = 0; row < slotYs.length; row++) {
    for (let col = 0; col < slotXs.length; col++) {
      const x = slotXs[col];
      const y = slotYs[row];
      box([0.034, 0.008, 0.012], C.GOLD_BRIGHT, [x, y, gz + 0.017], `s24BassGrilleSlot${slotIndex}`);
      pearlRivet([x - 0.019, y, gz + 0.024], `s24BassGrilleSlotRivetA${slotIndex}`, 0.48);
      pearlRivet([x + 0.019, y, gz + 0.024], `s24BassGrilleSlotRivetB${slotIndex}`, 0.48);
      slotIndex++;
    }
  }

  // Small pearl corner studs make the grille read as fitted Italian decorative hardware.
  for (const [dx, dy, i] of [
    [-0.048, -0.046, 0],
    [0.048, -0.046, 1],
    [-0.048, 0.046, 2],
    [0.048, 0.046, 3],
  ] as const) {
    pearlRivet([gx + dx, gy + dy, gz + 0.025], `s24BassGrilleCornerRivet${i}`, 0.72);
  }

  // A tiny central nacre lozenge adds a signature mother-of-pearl glint without competing with the bass buttons.
  b.extrude(
    [
      [-0.012, 0],
      [0, 0.014, "sharp"],
      [0.012, 0],
      [0, -0.014, "sharp"],
    ],
    {
      at: [gx, gy, gz + 0.026],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      color: C.PEARL_PINK,
      name: "s24BassGrilleCenterLozenge",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Four chunky bellows corner clips. The low-poly L silhouettes bridge the wine rails and bellows edge, with a
  // pearl rivet at each visible fastening point.
  const clipOutline: [number, number, "sharp"][] = [
    [-0.032, -0.034, "sharp"],
    [0.032, -0.034, "sharp"],
    [0.032, -0.017, "sharp"],
    [-0.010, -0.017, "sharp"],
    [-0.010, 0.034, "sharp"],
    [-0.032, 0.034, "sharp"],
  ];

  const clipSites = [
    { x: -0.255, y: 0.322, label: "LowerLeft" },
    { x: 0.255, y: 0.322, label: "LowerRight" },
    { x: -0.255, y: 1.385, label: "UpperLeft" },
    { x: 0.255, y: 1.385, label: "UpperRight" },
  ];

  for (const site of clipSites) {
    b.extrude(clipOutline, {
      at: [site.x, site.y, 0.241],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.003,
      color: C.GOLD_BRIGHT,
      name: `s24BellowsCornerClip${site.label}`,
    });

    // A dark wine underlay peeks just beyond the gold edge and seats the clip into the leather.
    box(
      [0.044, 0.048, 0.012],
      C.BURGUNDY_DARK,
      [site.x, site.y + 0.006, 0.223],
      `s24BellowsCornerClipShadow${site.label}`,
    );

    pearlRivet(
      [site.x, site.y + 0.003, 0.265],
      `s24BellowsCornerClipPearl${site.label}`,
      0.82,
    );
  }
}
    return addBassGrille;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addStrapBuckles(b: Builder) {
  const C = PALETTE;

  const bucklePart = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });
  };

  const buckleStud = (at: [number, number, number], color: string, name: string) => {
    return b.part(new THREE.SphereGeometry(0.008, 8, 5), color, {
      at,
      name,
      flat: true,
    });
  };

  for (const side of [-1, 1]) {
    const label = side < 0 ? "L" : "R";
    const x = side * 0.34;
    const yBase = 1.514;
    const yFrame = 1.522;
    const z = -0.03;

    // A leather tongue continues beneath the buckle toward the rear strap.
    bucklePart(
      [0.034, 0.009, 0.142],
      C.STRAP,
      [x, yBase, z - 0.012],
      `s25LeatherThroughBuckle${label}`,
    );
    bucklePart(
      [0.023, 0.004, 0.112],
      C.STRAP_EDGE,
      [x, yBase + 0.006, z - 0.012],
      `s25LeatherEdgeHighlight${label}`,
    );

    // Squat low-poly rectangular buckle frame.
    bucklePart(
      [0.012, 0.014, 0.108],
      C.GOLD,
      [x - side * 0.045, yFrame, z],
      `s25BuckleOuterRail${label}`,
    );
    bucklePart(
      [0.012, 0.014, 0.108],
      C.GOLD,
      [x + side * 0.045, yFrame, z],
      `s25BuckleInnerRail${label}`,
    );
    bucklePart(
      [0.078, 0.014, 0.012],
      C.GOLD_BRIGHT,
      [x, yFrame, z - 0.048],
      `s25BuckleFrontRail${label}`,
    );
    bucklePart(
      [0.078, 0.014, 0.012],
      C.GOLD,
      [x, yFrame, z + 0.048],
      `s25BuckleRearRail${label}`,
    );

    // Narrow raised highlights give the gold a faceted, hand-made rim.
    bucklePart(
      [0.005, 0.005, 0.091],
      C.GOLD_BRIGHT,
      [x - side * 0.051, yFrame + 0.009, z],
      `s25BuckleOuterHighlight${label}`,
    );
    bucklePart(
      [0.005, 0.005, 0.091],
      C.GOLD_BRIGHT,
      [x + side * 0.039, yFrame + 0.009, z],
      `s25BuckleInnerHighlight${label}`,
    );
    bucklePart(
      [0.062, 0.005, 0.005],
      C.GOLD_BRIGHT,
      [x, yFrame + 0.009, z - 0.043],
      `s25BuckleFrontHighlight${label}`,
    );

    // Chunky corner castings soften the rectangular frame without making it smooth.
    const corners: [number, number, string][] = [
      [-0.045, -0.048, "FrontOuter"],
      [0.045, -0.048, "FrontInner"],
      [-0.045, 0.048, "RearOuter"],
      [0.045, 0.048, "RearInner"],
    ];
    corners.forEach(([dx, dz, corner]) => {
      buckleStud(
        [x + dx, yFrame + 0.008, z + dz],
        corner === "FrontOuter" || corner === "RearInner" ? C.GOLD_BRIGHT : C.GOLD,
        `s25BuckleCorner${corner}${label}`,
      );
    });

    // The small central tongue visibly passes over the dark leather.
    bucklePart(
      [0.008, 0.012, 0.061],
      C.GOLD_BRIGHT,
      [x, yFrame + 0.011, z - 0.005],
      `s25BuckleTongue${label}`,
    );
    bucklePart(
      [0.014, 0.008, 0.014],
      C.GOLD,
      [x, yFrame + 0.014, z - 0.035],
      `s25BuckleTongueTip${label}`,
    );

    // Tiny nacre insets echo the accordion's shell: one rose and one mint.
    buckleStud(
      [x - side * 0.045, yFrame + 0.014, z - 0.047],
      C.PEARL_PINK,
      `s25BuckleRoseInlay${label}`,
    );
    buckleStud(
      [x + side * 0.045, yFrame + 0.014, z + 0.047],
      C.PEARL_GREEN,
      `s25BuckleMintInlay${label}`,
    );

    // Two small gold keeper blocks make the buckle feel anchored to the shoulder strap.
    bucklePart(
      [0.026, 0.012, 0.018],
      C.GOLD,
      [x - side * 0.026, yBase + 0.011, z + 0.066],
      `s25BuckleRearKeeper${label}`,
    );
    bucklePart(
      [0.026, 0.012, 0.018],
      C.GOLD,
      [x + side * 0.026, yBase + 0.011, z - 0.066],
      `s25BuckleFrontKeeper${label}`,
    );

    // A pair of dark stitch bars grounds the leather visibly inside the gold frame.
    bucklePart(
      [0.021, 0.004, 0.006],
      C.BURGUNDY_DARK,
      [x, yFrame + 0.016, z - 0.024],
      `s25LeatherStitchFront${label}`,
    );
    bucklePart(
      [0.021, 0.004, 0.006],
      C.BURGUNDY_DARK,
      [x, yFrame + 0.016, z + 0.024],
      `s25LeatherStitchRear${label}`,
    );
  }
}
    return addStrapBuckles;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addLowerFootStuds(b: Builder) {
  const GOLD = metal("gilt", {
    polish: 0.72,
    tarnish: 0.08,
    size: 0.035,
    seed: 26,
  });
  const GOLD_DARK = metal("brass", {
    polish: 0.34,
    tarnish: 0.2,
    size: 0.045,
    seed: 27,
  });

  const PEARL = "#fff8e9";
  const PEARL_PINK = "#efc9d0";
  const BURGUNDY = "#4b2035";

  const frontStud = (x: number, index: number) => {
    b.part(new THREE.BoxGeometry(0.058, 0.046, 0.009), PEARL_PINK, {
      at: [x, 0.16, 0.216],
      name: `s26LowerStudEscutcheon${index}`,
      flat: true,
    });

    b.part(
      new THREE.CylinderGeometry(0.025, 0.027, 0.012, 10),
      GOLD_DARK,
      {
        at: [x, 0.16, 0.222],
        dir: [0, 0, 1],
        name: `s26LowerStudCollar${index}`,
        flat: true,
      },
    );

    b.part(
      new THREE.TorusGeometry(0.014, 0.0025, 6, 10),
      GOLD,
      {
        at: [x, 0.16, 0.228],
        dir: [0, 0, 1],
        axis: "z",
        name: `s26LowerStudRing${index}`,
        flat: true,
      },
    );

    b.part(new THREE.SphereGeometry(0.012, 8, 5), GOLD, {
      at: [x, 0.16, 0.229],
      name: `s26LowerStudCap${index}`,
      flat: true,
    });

    b.part(new THREE.SphereGeometry(0.0055, 7, 4), PEARL, {
      at: [x, 0.16, 0.239],
      name: `s26LowerStudPearl${index}`,
      flat: true,
    });
  };

  const sideStud = (side: number, index: number) => {
    b.part(new THREE.BoxGeometry(0.009, 0.046, 0.058), PEARL_PINK, {
      at: [side * 0.512, 0.16, 0.0],
      name: `s26SideStudEscutcheon${index}`,
      flat: true,
    });

    b.part(
      new THREE.CylinderGeometry(0.025, 0.027, 0.012, 10),
      GOLD_DARK,
      {
        at: [side * 0.518, 0.16, 0.0],
        dir: [side, 0, 0],
        name: `s26SideStudCollar${index}`,
        flat: true,
      },
    );

    b.part(
      new THREE.TorusGeometry(0.014, 0.0025, 6, 10),
      GOLD,
      {
        at: [side * 0.524, 0.16, 0.0],
        dir: [side, 0, 0],
        axis: "z",
        name: `s26SideStudRing${index}`,
        flat: true,
      },
    );

    b.part(new THREE.SphereGeometry(0.012, 8, 5), GOLD, {
      at: [side * 0.526, 0.16, 0.0],
      name: `s26SideStudCap${index}`,
      flat: true,
    });

    b.part(new THREE.SphereGeometry(0.0055, 7, 4), PEARL, {
      at: [side * 0.537, 0.16, 0.0],
      name: `s26SideStudPearl${index}`,
      flat: true,
    });
  };

  // Two front-facing protective studs and two studs just wrapping around the side edges.
  frontStud(-0.34, 0);
  frontStud(0.34, 1);
  sideStud(-1, 0);
  sideStud(1, 1);

  const rivetYs = [0.41, 0.555, 0.70, 0.845, 0.99, 1.135, 1.28];

  const outerRivet = (x: number, y: number, side: number, i: number) => {
    // A tiny burgundy socket makes the gold heads read as seated rivets rather than floating beads.
    b.part(
      new THREE.CylinderGeometry(0.0135, 0.0145, 0.006, 8),
      BURGUNDY,
      {
        at: [x, y, 0.266],
        dir: [0, 0, 1],
        name: `s26OuterRivetSocket${side < 0 ? "R" : "L"}${i}`,
        flat: true,
      },
    );

    b.part(
      new THREE.TorusGeometry(0.013, 0.002, 6, 9),
      GOLD_DARK,
      {
        at: [x, y, 0.269],
        dir: [0, 0, 1],
        axis: "z",
        name: `s26OuterRivetBezel${side < 0 ? "R" : "L"}${i}`,
        flat: true,
      },
    );

    b.part(new THREE.SphereGeometry(0.0085, 7, 4), GOLD, {
      at: [x, y, 0.272],
      name: `s26OuterRivetHead${side < 0 ? "R" : "L"}${i}`,
      flat: true,
    });
  };

  // The two outer vertical gold rails are riveted; the center inlays remain completely clear.
  for (let i = 0; i < rivetYs.length; i++) {
    outerRivet(-0.483, rivetYs[i], -1, i);
    outerRivet(0.483, rivetYs[i], 1, i);
  }

  // Small pearl corner accents terminate each rivet run without crossing into the inlays.
  for (const side of [-1, 1]) {
    for (const y of [0.365, 1.325]) {
      b.part(new THREE.SphereGeometry(0.0105, 7, 4), PEARL, {
        at: [side * 0.483, y, 0.272],
        name: `s26RivetEndPearl${side < 0 ? "R" : "L"}${y > 1 ? "Top" : "Bottom"}`,
        flat: true,
      });
    }
  }
}
    return addLowerFootStuds;
  })(),
);
