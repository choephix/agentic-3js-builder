```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
} from "agentic-3js-builder";
import {
  pixelTexture,
  tileBox,
  cellPaint,
} from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "BYTE BEAST — Monster Truck",
  description:
    "A pixel-art arena monster truck with enormous block-tread tyres, coral bodywork, mint beadlock wheels, exposed suspension and an arcade-skull racing livery.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "byteBeast", paintSize: 1024 });
  const random = rng(4088);

  const C = {
    ink: "#141b29",
    dark: "#232c3b",
    steel: "#536779",
    steelLight: "#93a8ae",
    rubber: "#252b35",
    rubberLight: "#39434e",
    coral: "#f36946",
    coralLight: "#ff9563",
    coralDark: "#b93436",
    cream: "#ffe8b5",
    mint: "#64e8ba",
    teal: "#209a94",
    tealDark: "#175261",
    glass: "#133e53",
    white: "#fff4d7",
    sand: "#a67b54",
    soil: "#644d41",
    amber: "#ffbc4e",
  };

  // Small, hand-authored pixel alphabet for the livery.
  const alphabet: Record<string, string[]> = {
    A: ["01110", "11011", "11011", "11111", "11011", "11011", "11011"],
    B: ["11110", "11011", "11011", "11110", "11011", "11011", "11110"],
    E: ["11111", "11000", "11000", "11110", "11000", "11000", "11111"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    Y: ["11011", "11011", "01110", "00100", "00100", "00100", "00100"],
    S: ["01111", "11000", "11000", "01110", "00011", "00011", "11110"],
    O: ["01110", "11011", "11011", "11011", "11011", "11011", "01110"],
    F: ["11111", "11000", "11000", "11110", "11000", "11000", "11000"],
    R: ["11110", "11011", "11011", "11110", "11100", "11010", "11011"],
    D: ["11110", "11011", "11011", "11011", "11011", "11011", "11110"],
    N: ["11011", "11011", "11111", "11111", "11111", "11011", "11011"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "0": ["01110", "11011", "11011", "11011", "11011", "11011", "01110"],
    "8": ["01110", "11011", "11011", "01110", "11011", "11011", "01110"],
    "4": ["11011", "11011", "11011", "11111", "00011", "00011", "00011"],
    "X": ["11011", "11011", "01110", "00100", "01110", "11011", "11011"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  };

  type Grid = Parameters<Parameters<typeof pixelTexture>[2]>[0];

  function letters(
    g: Grid,
    word: string,
    x: number,
    y: number,
    color: string,
    scale = 1,
  ) {
    [...word].forEach((ch, index) => {
      const rows = alphabet[ch] ?? alphabet[" "];
      rows.forEach((row, iy) => {
        [...row].forEach((bit, ix) => {
          if (bit !== "1") return;
          for (let sy = 0; sy < scale; sy++)
            for (let sx = 0; sx < scale; sx++)
              g.set(
                x + index * 6 * scale + ix * scale + sx,
                y + iy * scale + sy,
                color,
              );
        });
      });
    });
  }

  const bodyTexture = pixelTexture(64, 64, (g) => {
    g.fill((x, y) => {
      if (y % 32 === 0) return C.coralDark;
      if (y % 32 === 1) return C.coralLight;
      if ((x * 17 + y * 29) % 157 === 0) return C.coralLight;
      if ((x * 11 + y * 7) % 191 === 0) return "#db503e";
      return C.coral;
    });
    for (const [x, y] of [[5, 7], [37, 21], [18, 49], [48, 56]]) {
      for (let i = 0; i < 5; i++) g.set(x + i, y, C.coralLight);
      for (let i = 0; i < 3; i++) g.set(x + i, y + 1, C.coralDark);
    }
  });

  const steelTexture = pixelTexture(48, 48, (g) => {
    g.fill((x, y) => {
      if (x % 24 === 0 || y % 24 === 0) return C.ink;
      if (x % 24 === 1 || y % 24 === 1) return C.steel;
      const d = (x * 13 + y * 29) % 83;
      return d < 2 ? C.steel : C.dark;
    });
    for (const x of [3, 21, 27, 45])
      for (const y of [3, 21, 27, 45]) {
        g.set(x, y, C.steelLight);
        g.set(x + 1, y, C.steel);
        g.set(x, y + 1, C.ink);
      }
  });

  const rubberTexture = pixelTexture(48, 48, (g) => {
    g.fill((x, y) => {
      if ((x + 2 * y) % 19 === 0) return "#424a54";
      if ((x * 7 + y * 11) % 29 === 0) return "#191f2a";
      return C.rubber;
    });
  });

  const glassTexture = pixelTexture(48, 32, (g) => {
    g.fill((x, y) => {
      if (x < 2 || x > 45 || y < 2 || y > 29) return C.ink;
      if (x === 2 || y === 2) return C.teal;
      if (y > 24) return "#102d40";
      if (x + y > 24 && x + y < 31) return "#5abcb8";
      if (x + y > 33 && x + y < 37) return "#2e7f8a";
      if (y < 8) return "#25596e";
      return C.glass;
    });
    for (let x = 6; x < 16; x++) g.set(x, 27, "#477788");
  });

  const hazardTexture = pixelTexture(32, 16, (g) => {
    g.fill((x, y) => {
      if (y < 2 || y > 13) return C.ink;
      return (x + y) % 16 < 8 ? C.cream : C.ink;
    });
  });

  const skullTexture = pixelTexture(48, 48, (g) => {
    g.fill(() => C.ink);
    for (let i = 0; i < 48; i++) {
      g.set(i, 0, C.mint);
      g.set(i, 47, C.mint);
      g.set(0, i, C.mint);
      g.set(47, i, C.mint);
    }
    // Broken, stepped lightning wings.
    for (let y = 8; y < 30; y++) {
      const k = Math.floor(y / 5);
      for (let x = 4 + k; x < 11 + k; x++) {
        g.set(x, y, C.coral);
        g.set(47 - x, y, C.coral);
      }
    }
    g.stamp(
      13,
      6,
      [
        ".....mmmmmmmmmmmm.....",
        "...mmccccccccccccmm...",
        "..mccccccccccccccccm..",
        ".mccccccccccccccccccm.",
        ".mccccccccccccccccccm.",
        "mccccccccccccccccccccm",
        "mccccccccccccccccccccm",
        "mccccccccccccccccccccm",
        "mcccddddccccccddddcccm",
        "mccddddddccccddddddccm",
        "mccddwwddccccddwwddccm",
        "mccddddddccccddddddccm",
        "mcccddddccccccddddcccm",
        ".mccccccccddccccccccm.",
        ".mcccccccddddcccccccm.",
        "..mccccccddddccccccm..",
        "...mccccccccccccccm...",
        "....mccddccddccddm....",
        "....mccddccddccddm....",
        ".....mmmmmmmmmmmm.....",
      ],
      { m: C.mint, c: C.cream, d: C.ink, w: C.coral },
    );
    letters(g, "BYTE", 12, 29, C.mint);
    letters(g, "BEAST", 9, 38, C.cream);
  });

  const numberTexture = pixelTexture(32, 24, (g) => {
    g.fill((x, y) =>
      x < 2 || x > 29 || y < 2 || y > 21 ? C.ink : C.cream,
    );
    letters(g, "08", 5, 5, C.ink, 2);
    g.set(28, 3, C.coral);
    g.set(28, 4, C.coral);
  });

  const plateTexture = pixelTexture(64, 16, (g) => {
    g.fill((x, y) =>
      x < 1 || x > 62 || y < 1 || y > 14 ? C.mint : C.ink,
    );
    letters(g, "BYTE-08", 11, 4, C.cream);
    g.set(3, 7, C.steelLight);
    g.set(60, 7, C.steelLight);
  });

  const sandTexture = pixelTexture(96, 96, (g) => {
    g.fill((x, y) => {
      const hash = (x * 31 + y * 73 + x * y * 3) % 103;
      if (hash < 5) return "#d0a474";
      if (hash < 11) return "#78573f";
      return "#a98159";
    });
  });

  const tyrePaint = cellPaint(0.055, (cell) => {
    const v = cell.random(13);
    if (v < 0.08) return "#424a54";
    if (v > 0.94) return "#181e27";
    return cell.n.y > 0.5 ? "#303844" : "#252b35";
  });

  const root = b.joint("chassis", {
    at: [0, 1.48, 0],
    dir: [0, 0, 1],
  });

  const wheelPositions = [
    { side: 1, z: 1.5, name: "wheelFL" },
    { side: -1, z: 1.5, name: "wheelFR" },
    { side: 1, z: -1.55, name: "wheelRL" },
    { side: -1, z: -1.55, name: "wheelRR" },
  ];

  const wheels = wheelPositions.map((w) => ({
    ...w,
    x: w.side * 1.67,
    y: 1.19,
    bone: b.joint(w.name, {
      at: [w.side * 1.67, 1.19, w.z],
      parent: root,
      dir: [w.side, 0, 0],
      role: "hinge",
    }),
  }));

  type Bone = typeof root;
  type Vec = [number, number, number];

  function box(
    name: string,
    at: Vec,
    size: Vec,
    color: string,
    bone: Bone = root,
    texture?: THREE.Texture,
    rotation: Vec = [0, 0, 0],
  ) {
    const geometry = texture
      ? tileBox(size, texture, 0.045, { rand: random })
      : new THREE.BoxGeometry(...size);
    return b.part(geometry, color, {
      name,
      at,
      bone,
      texture,
      rotation,
    });
  }

  function decal(
    name: string,
    at: Vec,
    size: [number, number],
    texture: THREE.Texture,
    dir: Vec = [0, 0, 1],
    bone: Bone = root,
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      name,
      bone,
      at,
      dir,
      axis: "z",
      texture,
    });
  }

  function cylinder(
    name: string,
    at: Vec,
    radius: number,
    length: number,
    color: string,
    axis: Vec,
    bone: Bone = root,
    segments = 12,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, length, segments),
      color,
      { name, at, bone, dir: axis, flat: true },
    );
  }

  function beam(
    name: string,
    from: Vec,
    to: Vec,
    width: number,
    color: string,
    bone: Bone = root,
  ) {
    return b.frustumBox(from, to, [width, width], [width, width], {
      name,
      color,
      bone,
    });
  }

  // A compact arena tile: layered dirt, not a competing backdrop.
  box("arenaDarkEdge", [0, 0.04, 0], [5.4, 0.08, 6.2], C.soil);
  box(
    "arenaPackedDirt",
    [0, 0.09, 0],
    [5.32, 0.04, 6.12],
    "#ffffff",
    root,
    sandTexture,
  );

  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      box(
        "pressedTyreTrack",
        [side * 1.68, 0.113, 2.45 + i * 0.12],
        [0.65, 0.005, 0.065],
        i % 2 ? "#866144" : "#926b49",
        root,
        undefined,
        [0, side * 13, 0],
      );
    }
  }

  // Underframe. The daylight beneath the body is deliberately left open.
  for (const s of [-1, 1]) {
    box(
      "longitudinalFrameRail",
      [s * 0.57, 1.67, -0.03],
      [0.19, 0.24, 4.42],
      "#ffffff",
      root,
      steelTexture,
    );
  }
  for (const z of [-1.85, -0.5, 0.65, 1.9]) {
    box("frameCrossMember", [0, 1.67, z], [1.4, 0.15, 0.19], C.steel);
  }

  box("centralTransmission", [0, 1.46, 0], [0.58, 0.4, 0.8], C.dark);
  box("transmissionSkid", [0, 1.23, 0], [0.72, 0.1, 0.94], C.steel);
  for (let i = 0; i < 5; i++)
    box(
      "skidCoolingGroove",
      [0, 1.175, -0.33 + i * 0.16],
      [0.52, 0.025, 0.045],
      C.ink,
    );

  for (const z of [1.5, -1.55]) {
    cylinder("solidAxle", [0, 1.19, z], 0.12, 3.25, C.steel, [1, 0, 0]);
    b.part(new THREE.IcosahedronGeometry(0.29, 0), C.dark, {
      at: [0, 1.19, z],
      bone: root,
      name: "differentialHousing",
      scale: [1.12, 0.85, 0.9],
      flat: true,
    });
    cylinder("diffCover", [0, 1.19, z + 0.24], 0.17, 0.04, C.teal, [0, 0, 1], root, 8);
    b.rod([0, 1.39, z], [0, 1.44, 0], 0.065, {
      bone: root,
      color: C.steel,
      sides: 8,
      name: "driveShaft",
    });
    for (const s of [-1, 1]) {
      const bottom: Vec = [s * 1.22, 1.25, z];
      const top: Vec = [s * 0.82, 2.18, z - 0.13];
      b.rod(bottom, top, 0.055, {
        color: C.steelLight,
        bone: root,
        sides: 8,
        name: "shockPiston",
      });
      const low = new THREE.Vector3(...bottom);
      const high = new THREE.Vector3(...top);
      const direction = high.clone().sub(low).normalize();
      const springA = low.clone().lerp(high, 0.24);
      const springB = low.clone().lerp(high, 0.9);
      b.rod(springA, springB, 0.095, {
        bone: root,
        color: C.tealDark,
        sides: 8,
        name: "shockBody",
      });
      // Squared spring collars read as bold pixels rather than fine coils.
      for (let k = 0; k < 7; k++) {
        const p = low.clone().lerp(high, 0.28 + k * 0.09);
        b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.048, 8), C.mint, {
          at: p,
          dir: direction,
          bone: root,
          name: "springCollar",
          flat: true,
        });
      }
      beam(
        "lowerSuspensionLink",
        [s * 0.47, 1.43, z > 0 ? 0.4 : -0.4],
        [s * 1.12, 1.12, z],
        0.095,
        C.coral,
      );
      beam(
        "upperSuspensionLink",
        [s * 0.61, 1.8, z > 0 ? 0.75 : -0.75],
        [s * 1.2, 1.35, z],
        0.075,
        C.steel,
      );
    }
  }

  // Four hero tyres: a faceted carcass, broad staggered tread blocks,
  // a recessed wheel well, beadlock, bolt circle and deep central hub.
  for (const w of wheels) {
    const { x, y, z, side: s, bone } = w;
    b.lathe(
      [
        [0.47, -0.4],
        [0.8, -0.4],
        [0.94, -0.3],
        [0.99, -0.18],
        [0.99, 0.18],
        [0.94, 0.3],
        [0.8, 0.4],
        [0.47, 0.4],
      ],
      {
        at: [x, y, z],
        axis: [s, 0, 0],
        segments: 20,
        color: tyrePaint,
        bone,
        name: "facetedTyreCarcass",
      },
    );

    for (let k = 0; k < 20; k++) {
      for (const lane of [-1, 1]) {
        const angle = (k / 20) * Math.PI * 2 + lane * 0.032;
        box(
          "oversizedStaggeredTread",
          [
            x + lane * 0.214,
            y + 1.012 * Math.cos(angle),
            z + 1.012 * Math.sin(angle),
          ],
          [0.405, 0.145, 0.245],
          "#ffffff",
          bone,
          rubberTexture,
          [(angle * 180) / Math.PI, 0, 0],
        );
      }
    }

    cylinder("wheelRecess", [x + s * 0.37, y, z], 0.51, 0.075, C.ink, [s, 0, 0], bone, 16);
    cylinder("beadlockRim", [x + s * 0.415, y, z], 0.48, 0.07, C.mint, [s, 0, 0], bone, 16);
    cylinder("rimInnerShadow", [x + s * 0.457, y, z], 0.369, 0.025, C.tealDark, [s, 0, 0], bone, 12);
    cylinder("wheelInnerDish", [x + s * 0.475, y, z], 0.3, 0.025, C.steel, [s, 0, 0], bone, 8);

    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      box(
        "rimVent",
        [
          x + s * 0.496,
          y + 0.255 * Math.cos(a),
          z + 0.255 * Math.sin(a),
        ],
        [0.025, 0.13, 0.075],
        C.ink,
        bone,
        undefined,
        [(a * 180) / Math.PI, 0, 0],
      );
      cylinder(
        "beadlockBolt",
        [
          x + s * 0.467,
          y + 0.424 * Math.cos(a),
          z + 0.424 * Math.sin(a),
        ],
        0.025,
        0.022,
        C.cream,
        [s, 0, 0],
        bone,
        6,
      );
    }

    cylinder("hubCollar", [x + s * 0.51, y, z], 0.18, 0.085, C.ink, [s, 0, 0], bone, 8);
    cylinder("coralHubCap", [x + s * 0.565, y, z], 0.13, 0.065, C.coral, [s, 0, 0], bone, 8);
    cylinder("hubCentre", [x + s * 0.604, y, z], 0.056, 0.025, C.cream, [s, 0, 0], bone, 6);

    // Four raised sidewall blocks are deliberately broad and readable.
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + k * Math.PI / 2;
      box(
        "raisedTyreLetterBlock",
        [
          x + s * 0.403,
          y + 0.69 * Math.cos(a),
          z + 0.69 * Math.sin(a),
        ],
        [0.018, 0.058, 0.19],
        C.rubberLight,
        bone,
        undefined,
        [(a * 180) / Math.PI, 0, 0],
      );
    }
  }

  // The simple pickup silhouette sits well above the wheel centres.
  box("bodySill", [0, 2.13, -0.02], [2.12, 0.26, 4.52], "#ffffff", root, bodyTexture);
  box("cabLowerBody", [0, 2.48, -0.1], [2.13, 0.52, 1.79], "#ffffff", root, bodyTexture);
  box("hoodMain", [0, 2.57, 1.47], [2.13, 0.37, 1.34], "#ffffff", root, bodyTexture);
  box("hoodUpperStep", [0, 2.79, 1.4], [1.98, 0.1, 1.22], C.coralLight);
  box("nosePanel", [0, 2.43, 2.19], [2.12, 0.56, 0.2], "#ffffff", root, bodyTexture);

  // Cabin is one broad extruded side profile, with a sloping windscreen.
  b.extrude(
    [
      [-1.04, 2.69],
      [-1.04, 3.36],
      [-0.86, 3.51],
      [0.35, 3.51],
      [0.78, 2.81],
      [0.78, 2.69],
    ],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 2.07,
      color: C.coral,
      bone: root,
      name: "angularCabShell",
    },
  );

  box("roofPixelLip", [0, 3.535, -0.3], [2.2, 0.105, 1.47], C.coralLight);
  box("roofDarkGutter", [0, 3.48, -0.3], [2.25, 0.04, 1.49], C.coralDark);

  // Windshield placed parallel to the cab's slope.
  const windCentre: Vec = [0, 3.15, 0.579];
  decal(
    "wideReflectiveWindshield",
    windCentre,
    [1.83, 0.7],
    glassTexture,
    [0, 0.523, 0.852],
  );
  beam(
    "windshieldCentreMullion",
    [0, 2.866, 0.762],
    [0, 3.431, 0.415],
    0.04,
    C.ink,
  );

  for (const s of [-1, 1]) {
    // Side glass is a true trapezoid, so no corner leaks outside the shell.
    const window = b.slab(
      [
        [s * 1.041, 2.84, -0.89],
        [s * 1.041, 3.37, -0.89],
        [s * 1.041, 3.37, 0.28],
        [s * 1.041, 2.84, 0.61],
      ],
      { thickness: 0.012, color: C.ink, bone: root, name: "sideWindowSeal" },
    );
    b.slab(
      [
        [s * 1.052, 2.88, -0.83],
        [s * 1.052, 3.32, -0.83],
        [s * 1.052, 3.32, 0.25],
        [s * 1.052, 2.88, 0.52],
      ],
      { thickness: 0.009, color: C.glass, bone: root, name: "sideGlass" },
    );
    // Textured inset leaves the sloping front quarter-window intact.
    decal(
      "pixelSideWindowReflection",
      [s * 1.062, 3.1, -0.34],
      [0.88, 0.41],
      glassTexture,
      [s, 0, 0],
    );
    beam(
      "quarterWindowDivider",
      [s * 1.074, 2.87, 0.22],
      [s * 1.074, 3.34, 0.08],
      0.038,
      C.coralDark,
    );
    void window;

    box("doorLowerStripe", [s * 1.075, 2.255, -0.11], [0.025, 0.09, 1.68], C.cream);
    box("doorMintStripe", [s * 1.091, 2.337, -0.11], [0.025, 0.04, 1.68], C.mint);

    decal(
      "arcadeSkullDoorBadge",
      [s * 1.088, 2.55, -0.14],
      [0.61, 0.55],
      skullTexture,
      [s, 0, 0],
    );
    box("doorHandle", [s * 1.115, 2.79, -0.72], [0.045, 0.055, 0.19], C.ink);
    box("doorHandleGlint", [s * 1.14, 2.805, -0.72], [0.012, 0.018, 0.13], C.steelLight);

    beam(
      "mirrorBracket",
      [s * 1.03, 2.98, 0.54],
      [s * 1.33, 3.02, 0.54],
      0.055,
      C.dark,
    );
    box("mirrorHousing", [s * 1.36, 3.05, 0.56], [0.15, 0.25, 0.22], C.ink);
    box("mirrorReflector", [s * 1.36, 3.05, 0.438], [0.105, 0.18, 0.015], C.steelLight);

    // Steps project between, not through, the massive tyres.
    box("cabStepBracket", [s * 1.1, 1.97, -0.08], [0.22, 0.22, 0.54], C.dark);
    box("cabStep", [s * 1.24, 1.92, -0.08], [0.48, 0.09, 0.69], C.steel);
    for (let k = 0; k < 4; k++)
      box(
        "stepGrip",
        [s * 1.27, 1.973, -0.32 + k * 0.16],
        [0.33, 0.018, 0.047],
        C.ink,
      );

    // Short pixel-stepped fenders crown the wheels without hiding them.
    for (const z of [1.5, -1.55]) {
      box("fenderTop", [s * 1.15, 2.43, z], [0.43, 0.13, 1.48], C.coral);
      box("fenderFrontStep", [s * 1.15, 2.34, z + 0.78], [0.43, 0.28, 0.18], C.coralDark);
      box("fenderBackStep", [s * 1.15, 2.34, z - 0.78], [0.43, 0.28, 0.18], C.coralDark);
      box("fenderMintEdge", [s * 1.378, 2.45, z], [0.035, 0.065, 1.49], C.mint);
    }
  }

  // Open rear cargo bed with visibly ribbed floor.
  box("bedFloor", [0, 2.26, -1.69], [1.91, 0.13, 1.15], C.dark);
  for (let k = 0; k < 7; k++)
    box("bedFloorRib", [-0.78 + k * 0.26, 2.34, -1.69], [0.065, 0.035, 1.03], C.steel);
  for (const s of [-1, 1]) {
    box("bedSide", [s * 0.99, 2.52, -1.72], [0.17, 0.42, 1.17], "#ffffff", root, bodyTexture);
    box("bedRailCap", [s * 0.99, 2.755, -1.7], [0.23, 0.065, 1.23], C.ink);
    decal(
      "rearQuarterRaceNumber",
      [s * 1.082, 2.56, -1.71],
      [0.54, 0.34],
      numberTexture,
      [s, 0, 0],
    );
  }
  box("tailgate", [0, 2.51, -2.29], [2.11, 0.44, 0.14], "#ffffff", root, bodyTexture);
  box("tailgateTopCap", [0, 2.75, -2.29], [2.18, 0.065, 0.18], C.ink);
  decal("tailgatePlate", [0, 2.49, -2.368], [0.88, 0.22], plateTexture, [0, 0, -1]);
  box("rearBumper", [0, 2.06, -2.45], [2.28, 0.19, 0.24], C.dark);
  decal("rearBumperHazards", [0, 2.065, -2.575], [1.25, 0.14], hazardTexture, [0, 0, -1]);

  // Braced roll bar, entirely behind the windows.
  for (const s of [-1, 1]) {
    beam("rollBarUpright", [s * 0.79, 2.32, -1.3], [s * 0.79, 3.39, -1.3], 0.105, C.dark);
    beam("rollBarRearBrace", [s * 0.79, 3.32, -1.3], [s * 0.79, 2.37, -2.14], 0.085, C.dark);
    box("rollBarFoot", [s * 0.79, 2.36, -1.3], [0.24, 0.06, 0.25], C.steel);
  }
  beam("rollBarCrossbar", [-0.79, 3.39, -1.3], [0.79, 3.39, -1.3], 0.105, C.dark);
  beam("bedDiagonalBrace", [-0.76, 2.38, -1.32], [0.76, 3.34, -1.32], 0.065, C.steel);

  // Chunky square exhausts rise beside the bed, behind the face of the cab.
  for (const s of [-1, 1]) {
    box("exhaustLower", [s * 0.87, 2.42, -1.07], [0.17, 0.8, 0.17], C.steel);
    box("exhaustUpper", [s * 0.87, 3.02, -1.07], [0.17, 0.4, 0.17], C.steelLight);
    box("exhaustMouth", [s * 0.87, 3.229, -1.07], [0.125, 0.025, 0.125], C.ink);
    box("exhaustBand", [s * 0.87, 2.84, -1.07], [0.2, 0.065, 0.2], C.dark);
  }

  // Front identity: inset black grille, pixel headlamps and heavy bash bar.
  box("grilleRecess", [0, 2.46, 2.307], [1.14, 0.37, 0.035], C.ink);
  for (let k = 0; k < 6; k++)
    box(
      "grilleVerticalTooth",
      [-0.45 + k * 0.18, 2.46, 2.338],
      [0.07, 0.27, 0.035],
      C.steel,
    );
  box("grilleMintHeader", [0, 2.665, 2.335], [1.19, 0.045, 0.035], C.mint);

  for (const s of [-1, 1]) {
    box("headlampFrame", [s * 0.82, 2.48, 2.31], [0.43, 0.37, 0.09], C.ink);
    glow(box("squareHeadlamp", [s * 0.82, 2.5, 2.365], [0.31, 0.23, 0.025], "#ffe9a4"), 1.3);
    box("headlampHorizontalGrid", [s * 0.82, 2.5, 2.384], [0.33, 0.027, 0.02], C.dark);
    box("headlampVerticalGrid", [s * 0.82, 2.5, 2.387], [0.025, 0.24, 0.02], C.dark);
    glow(box("frontAmberMarker", [s * 0.84, 2.252, 2.314], [0.27, 0.065, 0.025], C.amber), 0.8);
    glow(box("rearTailLamp", [s * 0.86, 2.5, -2.374], [0.19, 0.27, 0.035], "#ff4d45"), 0.8);
    box("tailLampDivider", [s * 0.86, 2.5, -2.399], [0.2, 0.035, 0.018], C.ink);
  }

  box("frontBashBumper", [0, 2.035, 2.43], [2.32, 0.23, 0.27], C.dark);
  box("bumperUpperEdge", [0, 2.17, 2.44], [2.37, 0.055, 0.29], C.steel);
  decal("bumperWarningStripe", [0, 2.04, 2.572], [1.29, 0.16], hazardTexture);
  for (const s of [-1, 1]) {
    box("bumperEnd", [s * 1.12, 2.06, 2.39], [0.19, 0.34, 0.39], C.ink);
    beam("frontGuardUpright", [s * 0.59, 2.13, 2.54], [s * 0.59, 2.53, 2.54], 0.075, C.steel);
    b.part(new THREE.TorusGeometry(0.074, 0.023, 4, 8), C.coral, {
      at: [s * 0.77, 1.9, 2.57],
      bone: root,
      name: "towShackle",
    });
  }
  beam("frontGuardCrossbar", [-0.59, 2.53, 2.54], [0.59, 2.53, 2.54], 0.075, C.steel);

  // Hood stripes, racing number and raised intake.
  for (const s of [-1, 1]) {
    box("hoodCreamRaceStripe", [s * 0.67, 2.847, 1.43], [0.16, 0.014, 1.13], C.cream);
    box("hoodMintPinstripe", [s * 0.8, 2.847, 1.43], [0.045, 0.015, 1.13], C.mint);
  }
  box("intakePlinth", [0, 2.87, 1.37], [0.73, 0.09, 0.69], C.coralDark);
  box("intakeScoop", [0, 2.98, 1.36], [0.61, 0.17, 0.55], C.ink);
  box("intakeOpening", [0, 2.989, 1.644], [0.49, 0.095, 0.018], C.tealDark);
  for (let i = 0; i < 4; i++)
    box("intakeSlot", [-0.18 + i * 0.12, 2.989, 1.659], [0.04, 0.082, 0.018], C.mint);

  // Roof-mounted light bar: five visibly separated square pixels.
  for (const s of [-1, 1])
    box("lightBarBracket", [s * 0.69, 3.65, 0.12], [0.09, 0.16, 0.11], C.dark);
  box("roofLightBar", [0, 3.715, 0.12], [1.88, 0.11, 0.17], C.ink);
  for (let k = 0; k < 5; k++) {
    const x = -0.72 + k * 0.36;
    box("roofLampCase", [x, 3.76, 0.15], [0.28, 0.24, 0.19], C.dark);
    glow(box("roofLampPixel", [x, 3.76, 0.251], [0.205, 0.16, 0.02], "#baffdc"), 1.35);
    box("roofLampBrow", [x, 3.887, 0.17], [0.3, 0.035, 0.24], C.ink);
  }

  // Two small rear arena markers and a handful of square dirt chips.
  function arenaCone(x: number, z: number) {
    box("coneRubberFoot", [x, 0.135, z], [0.3, 0.05, 0.3], C.ink);
    b.part(new THREE.CylinderGeometry(0.035, 0.115, 0.31, 4), C.coral, {
      at: [x, 0.315, z],
      bone: root,
      rotation: [0, 45, 0],
      name: "arenaMarkerCone",
    });
    b.part(new THREE.CylinderGeometry(0.067, 0.085, 0.07, 4), C.cream, {
      at: [x, 0.305, z],
      bone: root,
      rotation: [0, 45, 0],
      name: "coneReflectiveBand",
    });
  }
  arenaCone(-2.34, -2.66);
  arenaCone(2.34, -2.66);

  for (let k = 0; k < 17; k++) {
    const s = k % 2 ? 1 : -1;
    const x = s * (2.25 + random() * 0.22);
    const z = -2.35 + random() * 4.75;
    const size = 0.04 + random() * 0.045;
    box(
      "arenaDirtChip",
      [x, 0.11 + size * 0.3, z],
      [size * 1.5, size * 0.6, size],
      k % 3 ? "#c2986b" : "#795d46",
      root,
      undefined,
      [0, Math.floor(random() * 4) * 90, 0],
    );
  }

  // Small title plaque sits flat on the arena's leading edge.
  b.part(new THREE.PlaneGeometry(1.28, 0.32), "#ffffff", {
    at: [0, 0.115, 2.82],
    bone: root,
    texture: plateTexture,
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    name: "arenaTitlePlate",
  });

  return b.root;
}
```