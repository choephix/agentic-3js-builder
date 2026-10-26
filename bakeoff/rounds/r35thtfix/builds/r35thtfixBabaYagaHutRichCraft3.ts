import * as THREE from "three";
import {
  createBuilder,
  countershade,
  grain,
  mottle,
  polyline,
  rng,
  stripes,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A crooked Slavic folk-art hut with painted logs, a red shingled roof, ornate windows, a carved door, chimney, and two expressive chicken legs.",
};

const WOOD = grain("#754126", "#321811", {
  size: 0.075,
  axis: "x",
  seed: 17,
});
const WOOD_DARK = grain("#4b271b", "#1f110e", {
  size: 0.06,
  axis: "x",
  seed: 19,
});
const WOOD_LIGHT = grain("#a76536", "#4b2418", {
  size: 0.09,
  axis: "x",
  seed: 21,
});
const ROOF = mottle("#b73d43", "#571d2b", {
  size: 0.14,
  contrast: 1.3,
  seed: 31,
});
const ROOF_DARK = "#4b1722";
const LEG = countershade(
  stripes("#d58a32", "#7f3f1c", {
    size: 0.085,
    axis: "y",
    width: 0.27,
    wobble: 0.08,
    seed: 41,
  }),
  "#71351b",
  { level: -0.35, soft: 0.25 },
);
const LEG_DARK = "#512415";
const CREAM = "#f1d39a";
const CREAM_LIGHT = "#ffe9b5";
const RED = "#b72f37";
const RED_DARK = "#6f1f2b";
const BLUE = "#23628a";
const BLUE_DARK = "#173653";
const TEAL = "#267c79";
const TEAL_DARK = "#164c54";
const GOLD = "#e1a83e";
const GOLD_DARK = "#8e5b21";
const BLACK = "#211519";
const WINDOW_FRAME = "#163f4a";

const TRIM_TEXTURE = svg(
  `<svg viewBox="0 0 160 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="24" fill="#b72f37"/>
    <path d="M0 4h160M0 20h160" stroke="#f6d89b" stroke-width="4"/>
    <path d="M0 12l8-7 8 7-8 7z M32 12l8-7 8 7-8 7z M64 12l8-7 8 7-8 7z M96 12l8-7 8 7-8 7z M128 12l8-7 8 7-8 7z"
      fill="#23628a" stroke="#f6d89b" stroke-width="2"/>
    <path d="M16 12l8-5 8 5-8 5z M48 12l8-5 8 5-8 5z M80 12l8-5 8 5-8 5z M112 12l8-5 8 5-8 5z M144 12l8-5 8 5-8 5z"
      fill="#e1a83e"/>
  </svg>`,
  { size: 256 },
);

const ROOF_TEXTURE = svg(
  `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" fill="#9d2f39"/>
    <path d="M0 16h96M0 32h96M0 48h96M0 64h96M0 80h96" stroke="#5c1c29" stroke-width="5"/>
    <path d="M0 10h96M0 42h96M0 74h96" stroke="#dd6660" stroke-width="3"/>
    <path d="M12 0v16M36 16v16M60 0v16M84 16v16M12 32v16M36 48v16M60 32v16M84 48v16M12 64v16M36 80v16M60 64v16M84 80v16"
      stroke="#f0bd62" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const DOOR_TEXTURE = svg(
  `<svg viewBox="0 0 72 112" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="112" rx="4" fill="#6e2b24"/>
    <path d="M8 4h56v104H8z" fill="#8e3c2b" stroke="#30181a" stroke-width="4"/>
    <path d="M17 104V42Q17 19 36 13Q55 19 55 42v62" fill="#a95032" stroke="#f0c477" stroke-width="4"/>
    <path d="M36 25v70M22 59h28" stroke="#e8b258" stroke-width="3"/>
    <path d="M36 67l7-7-7-7-7 7z" fill="#23628a" stroke="#f6d89b" stroke-width="2"/>
    <circle cx="48" cy="63" r="4" fill="#e1a83e" stroke="#4a2717" stroke-width="2"/>
    <path d="M13 100h46" stroke="#35181a" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

const WINDOW_TEXTURE = svg(
  `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" fill="#164c54"/>
    <rect x="8" y="8" width="80" height="80" fill="#f5d994" stroke="#102f3b" stroke-width="5"/>
    <path d="M48 8v80M8 48h80" stroke="#164c54" stroke-width="7"/>
    <path d="M17 17h23v23H17zM56 17h23v23H56zM17 56h23v23H17zM56 56h23v23H56z"
      fill="#3b88a0" stroke="#f4c968" stroke-width="3"/>
    <path d="M29 29l6 6 6-6M67 29l-6 6-6-6M29 67l6-6 6 6M67 67l-6-6-6 6"
      fill="none" stroke="#c73743" stroke-width="3"/>
    <circle cx="48" cy="48" r="7" fill="#d94b4c" stroke="#f4dd9b" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const SUN_TEXTURE = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="30" fill="#e1a83e" stroke="#55231e" stroke-width="6"/>
    <circle cx="64" cy="64" r="18" fill="#f4d27d" stroke="#b72f37" stroke-width="4"/>
    <path d="M64 3v26M64 99v26M3 64h26M99 64h26M21 21l19 19M88 88l19 19M107 21L88 40M40 88L21 107"
      stroke="#b72f37" stroke-width="8" stroke-linecap="round"/>
    <path d="M56 56q8-8 16 0M55 74q9 7 18 0" fill="none" stroke="#55231e" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const FLOWER_TEXTURE = svg(
  `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" fill="#f0d39b"/>
    <path d="M48 12v72M12 48h72" stroke="#23628a" stroke-width="3"/>
    <path d="M48 48c-23-12-27-29-12-34 12-4 19 10 12 34z
             M48 48c23-12 27-29 12-34-12-4-19 10-12 34z
             M48 48c-23 12-27 29-12 34 12 4 19-10 12-34z
             M48 48c23 12 27 29 12 34-12 4-19-10-12-34z"
      fill="#b72f37" stroke="#55231e" stroke-width="3"/>
    <circle cx="48" cy="48" r="8" fill="#e1a83e" stroke="#55231e" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

function build() {
  const b = createBuilder({
    name: "baba-yaga-hut",
    detail: 1,
    paintSize: 1024,
  });

  const hutRoot = b.joint("hutRoot", {
    at: [0, 0.94, 0],
    role: "spine",
    group: "hut",
  });

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    rotation?: [number, number, number],
    texture?: THREE.Texture,
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: hutRoot,
      rotation,
      texture,
      name,
      group: "hut",
    });
  }

  function frontPanel(
    width: number,
    height: number,
    at: [number, number, number],
    texture: THREE.Texture,
    name: string,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone: hutRoot,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      name,
      group: "ornament",
    });
  }

  function sidePanel(
    side: number,
    width: number,
    height: number,
    at: [number, number, number],
    texture: THREE.Texture,
    name: string,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone: hutRoot,
      dir: [side, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture,
      name,
      group: "ornament",
    });
  }

  function timber(
    a: [number, number, number],
    c: [number, number, number],
    radius = 0.073,
    color: any = WOOD,
    name?: string,
  ) {
    return b.rod(a, c, radius, {
      bone: hutRoot,
      color,
      section: { ngon: 8 },
      caps: "round",
      name,
      group: "logs",
    });
  }

  // ---------------------------------------------------------------------------
  // The two articulated chicken legs.

  const legLPath = polyline([
    [0.34, 0.98, 0.015],
    [0.44, 0.70, -0.025],
    [0.29, 0.34, 0.025],
    [0.30, 0.105, 0.105],
  ]);

  const legRPath = polyline([
    [-0.34, 0.98, 0.015],
    [-0.44, 0.70, -0.025],
    [-0.29, 0.34, 0.025],
    [-0.30, 0.105, 0.105],
  ]);

  const legL = b.chain("legL", legLPath, {
    parent: hutRoot,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    group: "legs",
    contact: [0.30, 0, 0.34],
  });

  const legR = b.chain("legR", legRPath, {
    parent: hutRoot,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    group: "legs",
    contact: [-0.30, 0, 0.34],
  });

  const legTubeL = b.sweep(legL, [0.078, 0.066, 0.052, 0.036], {
    color: LEG,
    section: { ngon: 6 },
    caps: "round",
    group: "legs",
    name: "scalyLegL",
  });

  const legTubeR = b.sweep(legR, [0.078, 0.066, 0.052, 0.036], {
    color: LEG,
    section: { ngon: 6 },
    caps: "round",
    group: "legs",
    name: "scalyLegR",
  });

  for (const side of [1, -1]) {
    const leg = side > 0 ? legL : legR;
    const tube = side > 0 ? legTubeL : legTubeR;

    b.part(new THREE.SphereGeometry(0.082, 8, 6), LEG, {
      at: leg.joints[1].at,
      bone: leg.joints[1],
      scale: [1, 0.9, 1],
      name: side > 0 ? "kneeLKnuckle" : "kneeRKnuckle",
      group: "legs",
    });

    b.part(new THREE.SphereGeometry(0.06, 8, 6), LEG, {
      at: leg.joints[2].at,
      bone: leg.joints[2],
      name: side > 0 ? "ankleLKnuckle" : "ankleRKnuckle",
      group: "legs",
    });

    // Flat scaly rings travel with the leg rather than floating in model space.
    for (const t of [0.18, 0.38, 0.58, 0.78, 0.93]) {
      b.stick(
        new THREE.CylinderGeometry(0.059, 0.059, 0.018, 8),
        LEG_DARK,
        leg.at(t),
        {
          embed: 0.08,
          name: side > 0 ? "legLScaleBand" : "legRScaleBand",
          group: "legs",
        },
      );
    }

    // A backward-pointing spur gives each leg a readable chicken silhouette.
    b.spike(leg.at(0.47), [0, 0, -1], 0.13, 0.025, {
      color: LEG_DARK,
      caps: { start: "round", end: "point" },
      name: side > 0 ? "spurL" : "spurR",
      group: "legs",
    });

    const foot = leg.at(1).at.clone();
    const toeBase = foot.clone().add(new THREE.Vector3(0, 0.012, 0.055));

    const toes = [
      new THREE.Vector3(toeBase.x, 0.035, toeBase.z + 0.255),
      new THREE.Vector3(toeBase.x + side * 0.135, 0.035, toeBase.z + 0.205),
      new THREE.Vector3(toeBase.x - side * 0.13, 0.035, toeBase.z + 0.19),
      new THREE.Vector3(toeBase.x, 0.04, toeBase.z - 0.09),
    ];

    toes.forEach((tip, i) => {
      b.sweep(polyline([toeBase, tip]), [0.031, 0.008], {
        color: LEG,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        group: "feet",
        name: `${side > 0 ? "toeL" : "toeR"}${i + 1}`,
      });
    });

    // Small dark claw tips are deliberately separate, like painted folk-art accents.
    toes.slice(0, 3).forEach((tip, i) => {
      b.spike(tip, [0, -0.15, 1], 0.045, 0.009, {
        color: BLACK,
        caps: { start: "round", end: "point" },
        name: `${side > 0 ? "clawL" : "clawR"}${i + 1}`,
        group: "feet",
      });
    });

    void tube;
  }

  // ---------------------------------------------------------------------------
  // Lower floor and log cabin body.

  box([1.06, 0.085, 0.75], [0, 0.935, 0], WOOD_DARK, undefined, undefined, "underfloor");

  const frontLogs: any[] = [];
  const rearLogs: any[] = [];
  const sideLogs: any[] = [];

  const logHeights = [1.005, 1.125, 1.245, 1.365, 1.485];

  for (let i = 0; i < logHeights.length; i++) {
    const y = logHeights[i];

    frontLogs.push(
      timber(
        [-0.60, y, 0.365],
        [0.60, y, 0.365],
        0.076,
        i % 2 === 0 ? WOOD : WOOD_LIGHT,
        `frontLog${i + 1}`,
      ),
    );

    rearLogs.push(
      timber(
        [0.60, y, -0.365],
        [-0.60, y, -0.365],
        0.076,
        i % 2 === 0 ? WOOD_DARK : WOOD,
        `rearLog${i + 1}`,
      ),
    );

    sideLogs.push(
      timber(
        [0.555, y, -0.405],
        [0.555, y, 0.405],
        0.076,
        i % 2 === 0 ? WOOD_LIGHT : WOOD,
        `leftLog${i + 1}`,
      ),
    );

    sideLogs.push(
      timber(
        [-0.555, y, 0.405],
        [-0.555, y, -0.405],
        0.076,
        i % 2 === 0 ? WOOD : WOOD_DARK,
        `rightLog${i + 1}`,
      ),
    );
  }

  // Four darker corner posts make the stacked logs read as a constructed hut.
  for (const x of [-0.555, 0.555]) {
    for (const z of [-0.405, 0.405]) {
      timber(
        [x, 0.98, z],
        [x, 1.56, z],
        0.068,
        WOOD_DARK,
        `cornerPost${x > 0 ? "L" : "R"}${z > 0 ? "F" : "B"}`,
      );
    }
  }

  // Roughly circular dark knots are seated on the actual front log surfaces.
  const logSurface = b.surface(frontLogs);
  const knotPositions: [number, number, number][] = [
    [-0.49, 1.02, 0.5],
    [0.38, 1.11, 0.5],
    [-0.50, 1.29, 0.5],
    [0.43, 1.42, 0.5],
    [0.16, 1.51, 0.5],
    [-0.48, 1.50, 0.5],
  ];

  for (let i = 0; i < knotPositions.length; i++) {
    const hit = logSurface.nearest(knotPositions[i]);
    b.stick(
      new THREE.CylinderGeometry(0.032, 0.032, 0.011, 8),
      WOOD_DARK,
      hit,
      {
        embed: 0.42,
        name: `woodKnot${i + 1}`,
        group: "logs",
      },
    );
  }

  // End grain disks at the side corners.
  for (const side of [1, -1]) {
    for (let i = 0; i < logHeights.length; i += 2) {
      b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.012, 8), WOOD_LIGHT, {
        at: [side * 0.635, logHeights[i], 0.03],
        bone: hutRoot,
        dir: [side, 0, 0],
        name: `${side > 0 ? "left" : "right"}EndGrain${i}`,
        group: "logs",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Front gable, door, window, and carved folk decoration.

  const gable = b.extrude(
    [
      [-0.55, 0],
      [0.55, 0],
      [0.0, 0.43, "sharp"],
    ],
    {
      at: [0, 1.515, 0.432],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.008,
      color: CREAM,
      bone: hutRoot,
      name: "creamGable",
      group: "front",
    },
  );

  // Decorative blue and red gable border strips.
  box([1.08, 0.034, 0.045], [0, 1.535, 0.478], BLUE_DARK, undefined, undefined, "gableBaseTrim");
  box([0.045, 0.32, 0.045], [-0.525, 1.69, 0.478], RED, undefined, undefined, "gableLeftTrim");
  box([0.045, 0.32, 0.045], [0.525, 1.69, 0.478], RED, undefined, undefined, "gableRightTrim");

  // A folk-art sun sits high on the gable.
  b.part(new THREE.CircleGeometry(0.105, 16), "#ffffff", {
    at: [0, 1.835, 0.475],
    bone: hutRoot,
    dir: [0, 0, 1],
    axis: "z",
    texture: SUN_TEXTURE,
    name: "sunGable",
    group: "ornament",
  });

  // Three small raised diamond carvings below it.
  const diamond: [number, number, "sharp"][] = [
    [0, 0.055, "sharp"],
    [0.055, 0, "sharp"],
    [0, -0.055, "sharp"],
    [-0.055, 0, "sharp"],
  ];

  for (const x of [-0.23, 0.23]) {
    b.extrude(diamond, {
      at: [x, 1.69, 0.49],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: x < 0 ? RED : BLUE,
      bone: hutRoot,
      name: x < 0 ? "gableRedDiamond" : "gableBlueDiamond",
      group: "ornament",
    });
  }

  // Door body and its chunky painted frame.
  box([0.34, 0.49, 0.065], [-0.205, 1.235, 0.403], WOOD_DARK, undefined, undefined, "doorBody");
  box([0.052, 0.535, 0.082], [-0.405, 1.245, 0.414], BLUE_DARK, undefined, undefined, "doorFrameL");
  box([0.052, 0.535, 0.082], [-0.005, 1.245, 0.414], BLUE_DARK, undefined, undefined, "doorFrameR");
  box([0.455, 0.052, 0.084], [-0.205, 1.505, 0.414], BLUE_DARK, undefined, undefined, "doorFrameTop");
  frontPanel(0.30, 0.46, [-0.205, 1.235, 0.446], DOOR_TEXTURE, "paintedDoor");

  b.part(new THREE.SphereGeometry(0.025, 8, 6), GOLD, {
    at: [-0.075, 1.235, 0.493],
    bone: hutRoot,
    name: "doorHandle",
    group: "ornament",
  });

  // Window surround and painted glass.
  box([0.36, 0.35, 0.075], [0.285, 1.285, 0.407], WINDOW_FRAME, undefined, undefined, "windowBlock");
  box([0.405, 0.045, 0.085], [0.285, 1.485, 0.421], RED_DARK, undefined, undefined, "windowTopTrim");
  box([0.045, 0.39, 0.085], [0.075, 1.285, 0.421], RED_DARK, undefined, undefined, "windowLeftTrim");
  box([0.045, 0.39, 0.085], [0.495, 1.285, 0.421], RED_DARK, undefined, undefined, "windowRightTrim");
  frontPanel(0.285, 0.285, [0.285, 1.285, 0.456], WINDOW_TEXTURE, "paintedFrontWindow");

  // Raised mullions over the glass.
  box([0.022, 0.275, 0.025], [0.285, 1.285, 0.477], CREAM_LIGHT, undefined, undefined, "windowMullionV");
  box([0.275, 0.022, 0.025], [0.285, 1.285, 0.477], CREAM_LIGHT, undefined, undefined, "windowMullionH");

  // Side windows make the diorama readable from three-quarter views.
  for (const side of [1, -1]) {
    box([0.075, 0.28, 0.30], [side * 0.595, 1.30, -0.02], WINDOW_FRAME, undefined, undefined, `sideWindowBlock${side}`);
    sidePanel(
      side,
      0.225,
      0.225,
      [side * 0.64, 1.30, -0.02],
      WINDOW_TEXTURE,
      `paintedSideWindow${side}`,
    );
    b.part(new THREE.BoxGeometry(0.018, 0.225, 0.225), CREAM_LIGHT, {
      at: [side * 0.655, 1.30, -0.02],
      bone: hutRoot,
      name: `sideWindowFrame${side}`,
      group: "ornament",
    });
  }

  // A wide patterned band under the eaves.
  box([1.22, 0.095, 0.085], [0, 1.585, 0.425], RED_DARK, undefined, undefined, "frontEaveFascia");
  frontPanel(1.16, 0.095, [0, 1.588, 0.474], TRIM_TEXTURE, "paintedEaveTrim");

  // Small hanging painted fringe.
  for (let i = 0; i < 9; i++) {
    const x = -0.52 + i * 0.13;
    b.part(new THREE.ConeGeometry(0.026, 0.09, 6), i % 2 ? BLUE : RED, {
      at: [x, 1.552, 0.49],
      bone: hutRoot,
      name: `eaveTassel${i + 1}`,
      group: "ornament",
    });
  }

  // A floral medallion beside the door.
  b.part(new THREE.CircleGeometry(0.075, 12), "#ffffff", {
    at: [-0.48, 1.24, 0.463],
    bone: hutRoot,
    dir: [0, 0, 1],
    axis: "z",
    texture: FLOWER_TEXTURE,
    name: "doorFlower",
    group: "ornament",
  });

  // ---------------------------------------------------------------------------
  // Crooked red roof, tile bars, ridge, and chimney.

  for (const side of [1, -1]) {
    box(
      [1.48, 0.105, 0.76],
      [0, 1.805, side * 0.255],
      "#ffffff",
      [side * 35, 0, 0],
      ROOF_TEXTURE,
      side > 0 ? "frontRoof" : "backRoof",
    );

    // Dark raised courses sit over the painted roof tiles.
    for (let row = 0; row < 6; row++) {
      const u = row / 5;
      const z = side * (0.51 * (1 - u));
      const y = 1.625 + 0.385 * u;
      b.rod(
        [-0.70, y, z],
        [0.70, y, z],
        0.016,
        {
          bone: hutRoot,
          color: ROOF_DARK,
          section: { ngon: 6 },
          caps: "round",
          name: side > 0 ? `frontRoofCourse${row}` : `backRoofCourse${row}`,
          group: "roof",
        },
      );
    }
  }

  b.rod(
    [-0.78, 2.025, 0],
    [0.78, 2.025, 0],
    0.056,
    {
      bone: hutRoot,
      color: ROOF_DARK,
      section: { ngon: 8 },
      caps: "round",
      name: "roofRidge",
      group: "roof",
    },
  );

  // Bright ridge beads and a little folk-art finial.
  for (const x of [-0.56, -0.28, 0, 0.28, 0.56]) {
    b.part(new THREE.SphereGeometry(0.027, 8, 6), GOLD, {
      at: [x, 2.043, 0],
      bone: hutRoot,
      name: "ridgeBead",
      group: "roof",
    });
  }

  b.part(new THREE.ConeGeometry(0.065, 0.15, 8), RED, {
    at: [0, 2.12, 0],
    bone: hutRoot,
    name: "ridgeFinial",
    group: "roof",
  });

  // Slightly leaning brick chimney, anchored through the roof.
  box([0.17, 0.31, 0.18], [0.32, 2.115, -0.055], RED_DARK, [0, 0, -7], undefined, "chimney");
  box([0.225, 0.055, 0.235], [0.32, 2.285, -0.055], WOOD_DARK, [0, 0, -7], undefined, "chimneyCap");
  box([0.18, 0.035, 0.19], [0.32, 2.318, -0.055], CREAM, [0, 0, -7], undefined, "chimneyCapTop");

  // Short brick-colored bands make the chimney handmade rather than plain.
  for (const y of [2.02, 2.12, 2.22]) {
    box([0.185, 0.018, 0.195], [0.32, y, -0.055], RED, [0, 0, -7], undefined, "chimneyBand");
  }

  // ---------------------------------------------------------------------------
  // Small surface accents on the legs and hut.

  // A pair of red ankle ribbons, seated on the articulated leg frames.
  b.stick(
    new THREE.CylinderGeometry(0.058, 0.058, 0.028, 8),
    RED,
    legL.at(0.72),
    { embed: 0.05, name: "ankleRibbonL", group: "legs" },
  );
  b.stick(
    new THREE.CylinderGeometry(0.058, 0.058, 0.028, 8),
    RED,
    legR.at(0.72),
    { embed: 0.05, name: "ankleRibbonR", group: "legs" },
  );

  // A few gold studs along the corner posts.
  for (const side of [1, -1]) {
    for (const z of [-0.405, 0.405]) {
      for (const y of [1.08, 1.34]) {
        b.part(new THREE.SphereGeometry(0.018, 7, 5), GOLD, {
          at: [side * 0.615, y, z],
          bone: hutRoot,
          name: "cornerStud",
          group: "ornament",
        });
      }
    }
  }

  // Low-poly painted capstones at the two hip sockets.
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.095, 8, 6), WOOD_DARK, {
      at: [side * 0.34, 0.98, 0.015],
      bone: hutRoot,
      scale: [1.1, 0.65, 1.0],
      name: side > 0 ? "hipSocketL" : "hipSocketR",
      group: "legs",
    });
  }

  return b.root;
}

export default build;
