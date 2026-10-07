```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  polyline,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Starlite 57 Jukebox",
  description:
    "A chrome-trimmed 1950s diner jukebox with three luminous arch tubes, a glass-covered record changer, miniature song cards and pushbuttons, and a starburst speaker grille.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Starlite 57", detail: 1 });
  const cabinet = b.joint("cabinet", { at: [0, 0, 0] });

  const C = {
    body: "#58292e",
    face: "#163d43",
    black: "#111c22",
    rubber: "#182023",
    chrome: "#c9d9db",
    bright: "#eef1e8",
    darkChrome: "#61777b",
    gold: "#c99b52",
    cream: "#f2dfb4",
    paper: "#fff2cf",
    red: "#b83237",
    record: "#161a20",
    recordEdge: "#454a50",
    inner: "#c5b48d",
    neonRed: "#ff493f",
    neonAmber: "#ffc24a",
    neonTeal: "#22dccc",
    redLight: "#ffd9c6",
    amberLight: "#fff0bd",
    tealLight: "#c6fff2",
    glass: "#b1e5df",
    glint: "#e5fff8",
  };

  const box = (
    name: string,
    at: number[],
    size: number[],
    color: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: cabinet,
      name,
    });

  function outlineArch(
    radius: number,
    spring: number,
    bottom: number,
    steps = 28,
  ): number[][] {
    const p: number[][] = [
      [-radius, bottom],
      [radius, bottom],
      [radius, spring],
    ];
    for (let i = 1; i <= steps; i++) {
      const a = (i / steps) * Math.PI;
      p.push([radius * Math.cos(a), spring + radius * Math.sin(a)]);
    }
    return p;
  }

  function shapeOf(outline: number[][], holes: number[][][] = []) {
    const shape = new THREE.Shape();
    outline.forEach((p, i) =>
      i === 0 ? shape.moveTo(p[0], p[1]) : shape.lineTo(p[0], p[1]),
    );
    shape.closePath();
    for (const hole of holes) {
      const path = new THREE.Path();
      [...hole].reverse().forEach((p, i) =>
        i === 0 ? path.moveTo(p[0], p[1]) : path.lineTo(p[0], p[1]),
      );
      path.closePath();
      shape.holes.push(path);
    }
    return shape;
  }

  function plate(
    name: string,
    outline: number[][],
    z: number,
    thickness: number,
    color: string,
  ) {
    return b.extrude(outline, {
      at: [0, 0, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      color,
      bone: cabinet,
      name,
    });
  }

  function archPath(r: number, z: number, bottom = 0.15) {
    const p: number[][] = [
      [-r, bottom, z],
      [-r, 1.0, z],
    ];
    for (let i = 1; i <= 30; i++) {
      const a = Math.PI - (Math.PI * i) / 30;
      p.push([r * Math.cos(a), 1.0 + r * Math.sin(a), z]);
    }
    p.push([r, bottom, z]);
    return polyline(p);
  }

  function label(
    name: string,
    at: number[],
    width: number,
    height: number,
    markup: string,
    viewBox = "0 0 600 120",
    resolution = 512,
    direction: number[] = [0, 0, 1],
  ) {
    const texture = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${markup}</svg>`,
      { size: resolution },
    );
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir: direction,
      axis: "z",
      up: [0, 1, 0],
      bone: cabinet,
      texture,
      name,
    });
  }

  function screws(
    target: Parameters<typeof b.surface>[0],
    points: number[][],
    name: string,
  ) {
    const surface = b.surface(target);
    points.forEach((p, i) => {
      const hit = surface.nearest(p);
      const screw = b.stick(
        new THREE.CylinderGeometry(0.0036, 0.0036, 0.0022, 8),
        C.bright,
        hit,
        { name: `${name}_screw${i}`, embed: 0.25 },
      );
      b.stick(
        new THREE.BoxGeometry(0.004, 0.0004, 0.00075),
        C.darkChrome,
        frame(screw.local([0, 0.0013, 0]), hit.n),
        { name: `${name}_slot${i}`, embed: 0 },
      );
    });
  }

  // A weighty, chamfered plinth, with its rubber feet actually on the floor.
  for (const x of [-0.405, 0.405]) {
    for (const z of [-0.235, 0.235]) {
      box("rubberFoot", [x, 0.018, z], [0.135, 0.036, 0.12], C.rubber);
    }
  }
  const footprint = [
    [-0.475, -0.335],
    [0.475, -0.335],
    [0.527, -0.283],
    [0.527, 0.283],
    [0.475, 0.335],
    [-0.475, 0.335],
    [-0.527, 0.283],
    [-0.527, -0.283],
  ];
  b.extrude(footprint, {
    at: [0, 0.067, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.09,
    color: C.black,
    bone: cabinet,
    name: "heavyPlinth",
  });
  b.extrude(footprint, {
    at: [0, 0.113, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.018,
    color: C.chrome,
    bone: cabinet,
    name: "plinthChromeCap",
  });
  box("plinthFrontLip", [0, 0.058, 0.338], [0.952, 0.012, 0.009], C.chrome);
  box("plinthRedPinstripe", [0, 0.083, 0.338], [0.944, 0.008, 0.009], C.red);

  // The record window is a real opening through the cabinet, not a drawing
  // on an opaque front.
  const outerProfile = outlineArch(0.49, 1.0, 0.115);
  const windowOpening = outlineArch(0.326, 1.0, 0.956);
  b.part(
    new THREE.ExtrudeGeometry(shapeOf(outerProfile, [windowOpening]), {
      depth: 0.55,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      bevelSegments: 1,
      curveSegments: 12,
      steps: 1,
    }),
    C.body,
    { at: [0, 0, -0.27], bone: cabinet, name: "archedEnamelCabinet" },
  );
  b.part(
    new THREE.ExtrudeGeometry(
      shapeOf(outlineArch(0.477, 1.0, 0.126), [windowOpening]),
      { depth: 0.018, bevelEnabled: false, steps: 1 },
    ),
    C.face,
    { at: [0, 0, 0.289], bone: cabinet, name: "petrolEnamelFascia" },
  );

  b.sweep(archPath(0.493, 0.306, 0.125), 0.012, {
    color: C.chrome,
    sides: 8,
    caps: "flat",
    bone: cabinet,
    name: "outerChromeArch",
  });
  b.sweep(archPath(0.483, -0.278, 0.128), 0.009, {
    color: C.darkChrome,
    sides: 8,
    caps: "flat",
    bone: cabinet,
    name: "rearChromePiping",
  });

  // Three continuous luminous acrylic horseshoes, each with fine chrome
  // separators, segment collars, and a highlight seated on its actual skin.
  const luminousArches = [
    { r: 0.452, tube: 0.019, color: C.neonRed, light: C.redLight },
    { r: 0.405, tube: 0.017, color: C.neonAmber, light: C.amberLight },
    { r: 0.36, tube: 0.013, color: C.neonTeal, light: C.tealLight },
  ];
  luminousArches.forEach((a, index) => {
    const path = archPath(a.r, 0.337, 0.155);
    const tube = b.sweep(path, a.tube, {
      color: a.color,
      sides: 10,
      caps: "flat",
      bone: cabinet,
      name: `luminousArch${index}`,
    });
    const highlight = b.surface(tube).drape(archPath(a.r, 0.41, 0.161), {
      lift: 0.0006,
    });
    b.sweep(highlight, 0.0018, {
      color: a.light,
      sides: 5,
      caps: "flat",
      bone: cabinet,
      name: `archReflection${index}`,
    });

    const collar = (p: number[], tangent: number[]) => {
      const d = new THREE.Vector3(...tangent).normalize().multiplyScalar(0.0045);
      const center = new THREE.Vector3(...p);
      b.rod(center.clone().sub(d), center.clone().add(d), a.tube + 0.0022, {
        color: C.chrome,
        sides: 10,
        bone: cabinet,
        name: `tubeCollar${index}`,
      });
    };
    for (const s of [-1, 1]) {
      for (const y of [0.176, 0.385, 0.683, 0.975]) {
        collar([s * a.r, y, 0.337], [0, 1, 0]);
      }
    }
    for (const degrees of [35, 70, 110, 145]) {
      const t = THREE.MathUtils.degToRad(degrees);
      collar(
        [a.r * Math.cos(t), 1 + a.r * Math.sin(t), 0.337],
        [-Math.sin(t), Math.cos(t), 0],
      );
    }
  });

  for (const r of [0.427, 0.382, 0.338]) {
    b.sweep(archPath(r, 0.33, 0.148), r === 0.338 ? 0.006 : 0.004, {
      color: C.chrome,
      sides: 6,
      caps: "flat",
      bone: cabinet,
      name: "archChromeSeparator",
    });
  }

  for (const s of [-1, 1]) {
    box("columnShoe", [s * 0.409, 0.147, 0.34], [0.153, 0.047, 0.063], C.chrome);
    for (let j = 0; j < 4; j++) {
      box(
        "shoeFlute",
        [s * 0.409, 0.132 + j * 0.008, 0.374],
        [0.136, 0.0022, 0.002],
        j % 2 ? C.gold : C.darkChrome,
      );
    }
  }

  // A winged name badge bridges the illuminated crown.
  const badge = b.extrude(
    [
      [-0.154, -0.017], [-0.108, 0.011], [-0.075, 0.011],
      [-0.061, 0.034], [0.061, 0.034], [0.075, 0.011],
      [0.108, 0.011], [0.154, -0.017], [0.074, -0.017],
      [0.053, -0.034], [-0.053, -0.034], [-0.074, -0.017],
    ],
    {
      at: [0, 1.435, 0.371],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      color: C.chrome,
      bone: cabinet,
      name: "wingedCrownBadge",
    },
  );
  box("crownBadgeInset", [0, 1.439, 0.383], [0.178, 0.041, 0.008], C.red);
  label(
    "StarliteLogo",
    [0, 1.44, 0.388],
    0.165,
    0.034,
    `<text x="300" y="83" text-anchor="middle" fill="#fff2cf"
      font-family="Georgia,serif" font-style="italic" font-weight="bold"
      font-size="83" letter-spacing="5">Starlite</text>`,
  );
  for (const s of [-1, 1]) {
    b.rod([s * 0.098, 1.428, 0.382], [s * 0.131, 1.422, 0.382], 0.0018, {
      color: C.darkChrome,
      bone: cabinet,
      sides: 5,
    });
  }
  b.extrude(
    [[0, 0.029], [0.022, 0], [0, -0.026], [-0.022, 0]],
    {
      at: [0, 1.489, 0.345],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.023,
      color: C.gold,
      bone: cabinet,
      name: "crownDiamond",
    },
  );
  b.extrude(
    [[0, 0.017], [0.012, 0], [0, -0.016], [-0.012, 0]],
    {
      at: [0, 1.489, 0.359],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      color: C.neonRed,
      bone: cabinet,
      name: "crownRuby",
    },
  );
  screws(badge, [[-0.083, 1.433, 0.41], [0.083, 1.433, 0.41]], "crown");

  // Window bezel and the warm interior of the changer compartment.
  plate("changerBackWall", outlineArch(0.325, 1, 0.956), -0.258, 0.016, C.inner);
  b.part(
    new THREE.ExtrudeGeometry(
      shapeOf(
        outlineArch(0.339, 1, 0.947),
        [outlineArch(0.313, 1, 0.974)],
      ),
      { depth: 0.025, bevelEnabled: false },
    ),
    C.chrome,
    { at: [0, 0, 0.308], bone: cabinet, name: "domedWindowBezel" },
  );
  b.sweep(archPath(0.317, 0.334, 0.975), 0.0035, {
    color: C.gold,
    sides: 6,
    caps: "flat",
    bone: cabinet,
    name: "windowInnerLip",
  });
  box("windowSill", [0, 0.972, 0.329], [0.634, 0.024, 0.042], C.chrome);
  box("windowSillShadow", [0, 0.977, 0.352], [0.603, 0.005, 0.004], C.black);

  for (let i = -3; i <= 3; i++) {
    const x = i * 0.064;
    const top = 1 + Math.sqrt(0.302 * 0.302 - x * x) - 0.025;
    b.rod([x, 0.992, -0.242], [x, top, -0.242], 0.004, {
      color: i % 2 === 0 ? C.gold : C.chrome,
      sides: 6,
      bone: cabinet,
      name: "changerBackFlute",
    });
  }

  // The horizontal stack of individual vinyl discs.
  b.part(new THREE.CylinderGeometry(0.224, 0.229, 0.024, 40), C.darkChrome, {
    at: [0, 0.993, 0.107],
    bone: cabinet,
    name: "changerTurntable",
  });
  b.part(new THREE.CylinderGeometry(0.211, 0.216, 0.007, 40), C.chrome, {
    at: [0, 1.007, 0.107],
    bone: cabinet,
    name: "turntablePolishedRim",
  });
  for (let i = 0; i < 9; i++) {
    const y = 1.015 + i * 0.009;
    b.part(new THREE.CylinderGeometry(0.198, 0.198, 0.006, 40), C.record, {
      at: [0, y, 0.107],
      bone: cabinet,
      name: `vinylRecord${i + 1}`,
    });
    b.part(new THREE.CylinderGeometry(0.1975, 0.1975, 0.0011, 40), C.recordEdge, {
      at: [0, y + 0.0028, 0.107],
      bone: cabinet,
      name: `vinylEdge${i + 1}`,
    });
  }
  const recordTop = 1.0905;
  for (const r of [0.079, 0.103, 0.129, 0.157, 0.181]) {
    b.part(new THREE.TorusGeometry(r, 0.00065, 3, 40), C.recordEdge, {
      at: [0, recordTop, 0.107],
      rotation: [90, 0, 0],
      bone: cabinet,
      name: "recordGroove",
    });
  }
  b.part(new THREE.CylinderGeometry(0.053, 0.053, 0.0015, 32), C.red, {
    at: [0, recordTop + 0.001, 0.107],
    bone: cabinet,
    name: "redRecordLabel",
  });
  b.part(new THREE.TorusGeometry(0.036, 0.0012, 4, 24), C.gold, {
    at: [0, recordTop + 0.002, 0.107],
    rotation: [90, 0, 0],
    bone: cabinet,
    name: "recordLabelGoldRing",
  });
  b.rod([0, 1.084, 0.107], [0, 1.118, 0.107], 0.007, {
    color: C.chrome,
    sides: 8,
    bone: cabinet,
    name: "recordSpindle",
  });

  // Mechanical picker: vertical shaft, gear, articulated arm, cartridge, needle.
  box("changerMotorHousing", [0.222, 1.021, 0.023], [0.065, 0.066, 0.091], C.red);
  b.rod([0.222, 1.016, 0.047], [0.222, 1.186, 0.047], 0.012, {
    color: C.chrome,
    sides: 10,
    bone: cabinet,
    name: "pickerPivotShaft",
  });
  b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.012, 16), C.gold, {
    at: [0.222, 1.113, 0.071],
    dir: [0, 0, 1],
    bone: cabinet,
    name: "pickerDriveWheel",
  });
  b.ring(frame([0.222, 1.113, 0.078], [0, 0, 1]), {
    count: 8,
    radius: 0.025,
  }, (at) => {
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), C.darkChrome, {
      at,
      bone: cabinet,
      name: "driveWheelScrew",
    });
  });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.019, 12), C.gold, {
    at: [0.222, 1.184, 0.047],
    bone: cabinet,
    name: "pickerPivotCap",
  });
  const armPath = polyline([
    [0.222, 1.187, 0.047],
    [0.089, 1.205, 0.09],
    [-0.069, 1.166, 0.185],
  ]);
  b.sweep(armPath, 0.011, {
    section: "box",
    color: C.chrome,
    caps: "flat",
    bone: cabinet,
    name: "recordPickerArm",
  });
  b.rod([0.207, 1.172, 0.047], [-0.055, 1.153, 0.184], 0.0032, {
    color: C.black,
    sides: 6,
    bone: cabinet,
    name: "pickerArmUnderLink",
  });
  box("pickupCartridge", [-0.069, 1.15, 0.185], [0.047, 0.028, 0.035], C.gold);
  box("pickupCartridgeInsert", [-0.069, 1.134, 0.185], [0.034, 0.008, 0.029], C.black);
  b.rod([-0.069, 1.131, 0.191], [-0.063, 1.096, 0.199], 0.0018, {
    color: C.chrome,
    sides: 5,
    bone: cabinet,
    name: "stylus",
  });
  box("cartridgeRedStripe", [-0.069, 1.15, 0.204], [0.034, 0.004, 0.002], C.red);

  label(
    "highFidelityWindowMark",
    [0, 1.254, 0.323],
    0.246,
    0.044,
    `<path d="M12 63H145M455 63H588" stroke="#c99b52" stroke-width="5"/>
     <text x="300" y="79" text-anchor="middle" font-size="70"
       font-family="Georgia,serif" font-weight="bold" fill="#fff2cf">HI · FI</text>`,
  );

  // A shallow convex glass pane, trimmed to the arched opening.
  const glassPositions: number[] = [];
  const glassUV: number[] = [];
  const glassIndices: number[] = [];
  const rows = 20, cols = 20;
  const glassR = 0.311;
  const bottom = 0.976;
  const top = 1.311;
  for (let iy = 0; iy <= rows; iy++) {
    const v = iy / rows;
    const y = bottom + (top - bottom) * v;
    const halfWidth =
      y <= 1 ? glassR : Math.sqrt(Math.max(0, glassR * glassR - (y - 1) ** 2));
    for (let ix = 0; ix <= cols; ix++) {
      const u = ix / cols;
      const x = (u * 2 - 1) * halfWidth;
      const bulge = 0.025 * (1 - (x / glassR) ** 2) * Math.sin(Math.PI * v);
      glassPositions.push(x, y, 0.336 + bulge);
      glassUV.push(u, v);
    }
  }
  for (let iy = 0; iy < rows; iy++) {
    for (let ix = 0; ix < cols; ix++) {
      const a = iy * (cols + 1) + ix;
      const d = a + cols + 1;
      glassIndices.push(a, a + 1, d + 1, a, d + 1, d);
    }
  }
  const glassGeometry = new THREE.BufferGeometry();
  glassGeometry.setAttribute("position", new THREE.Float32BufferAttribute(glassPositions, 3));
  glassGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(glassUV, 2));
  glassGeometry.setIndex(glassIndices);
  glassGeometry.computeVertexNormals();
  const glass = b.part(glassGeometry, C.glass, {
    at: [0, 0, 0],
    bone: cabinet,
    name: "convexDomedGlass",
  });
  for (const path of [
    [[-0.266, 1.04, 0.40], [-0.247, 1.13, 0.40], [-0.203, 1.205, 0.40]],
    [[-0.238, 1.071, 0.40], [-0.217, 1.14, 0.40]],
  ]) {
    b.sweep(b.surface(glass).drape(polyline(path), { lift: 0.001 }), 0.003, {
      color: C.glint,
      sides: 5,
      caps: "round",
      bone: cabinet,
      name: "windowReflection",
    });
  }

  // Fifteen individually framed title cards and their chrome pushbuttons.
  const selectionFrame = box(
    "selectionPanelChrome",
    [0, 0.826, 0.329],
    [0.65, 0.239, 0.04],
    C.chrome,
  );
  box("selectionPanelInset", [0, 0.826, 0.353], [0.623, 0.215, 0.014], C.black);
  const songs = [
    ["BLUE MOON", "MOONLIGHT SERENADE"],
    ["ROCK AROUND", "SATURDAY NIGHT"],
    ["SWEET LORRAINE", "ONLY YOU"],
    ["CHERRY SODA", "LITTLE DARLIN'"],
    ["THE STROLL", "DREAM BOAT"],
    ["EARTH ANGEL", "SILVER LINING"],
    ["SHAKE & ROLL", "BOOGIE SHOES"],
    ["LOVE LETTERS", "A KISS GOODNIGHT"],
    ["SUMMER DRIVE", "RADIO ROMANCE"],
    ["PEGGY SUE", "DINER AT MIDNIGHT"],
    ["STARDUST", "SENTIMENTAL JOURNEY"],
    ["TEQUILA", "JUMPIN' JACK"],
    ["HEART & SOUL", "SLOW DANCE"],
    ["SUGAR TIME", "JUKEBOX BABY"],
    ["GOODNIGHT", "SEE YOU LATER"],
  ];
  const xmlEscape = (s: string) => s.replace(/&/g, "&amp;");
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const n = row * 5 + col;
      const x = (col - 2) * 0.12;
      const y = 0.911 - row * 0.069;
      const key = `${String.fromCharCode(65 + row)}${col + 1}`;
      box("titleCardRim", [x, y, 0.366], [0.112, 0.036, 0.009], C.darkChrome);
      box("titleCardPaper", [x, y, 0.372], [0.105, 0.029, 0.004], C.paper);
      label(
        `title_${key}`,
        [x, y, 0.3745],
        0.103,
        0.028,
        `<rect width="360" height="96" fill="#fff2cf"/>
         <rect x="0" y="0" width="40" height="96" fill="#b83237"/>
         <text x="20" y="56" text-anchor="middle" fill="#fff2cf"
           font-family="Arial,sans-serif" font-size="26" font-weight="bold">${key}</text>
         <path d="M49 49H352" stroke="#c5b48d" stroke-width="2"/>
         <text x="54" y="34" fill="#23343a" font-family="Arial,sans-serif"
           font-size="20" font-weight="bold">${xmlEscape(songs[n][0])}</text>
         <text x="54" y="77" fill="#23343a" font-family="Arial,sans-serif"
           font-size="17">${xmlEscape(songs[n][1])}</text>`,
        "0 0 360 96",
        384,
      );
      box("pushbuttonSocket", [x, y - 0.0265, 0.365], [0.097, 0.019, 0.013], C.face);
      box("chromeSelectionButton", [x, y - 0.0265, 0.381], [0.087, 0.015, 0.025], C.chrome);
      box("buttonTopHighlight", [x, y - 0.022, 0.395], [0.075, 0.002, 0.002], C.bright);
      box("buttonCenterMark", [x, y - 0.027, 0.395], [0.024, 0.003, 0.002],
        n === 7 ? C.neonTeal : C.red);
    }
  }
  screws(selectionFrame, [
    [-0.315, 0.929, 0.39], [0.315, 0.929, 0.39],
    [-0.315, 0.722, 0.39], [0.315, 0.722, 0.39],
  ], "selection");

  // Pricing plaque, horizontal coin slot and red coin-return button.
  const coinRail = box("coinRail", [0, 0.669, 0.333], [0.643, 0.062, 0.032], C.chrome);
  box("pricePlaque", [-0.151, 0.669, 0.353], [0.283, 0.045, 0.009], C.face);
  label(
    "pricing",
    [-0.151, 0.669, 0.359],
    0.272,
    0.04,
    `<text x="300" y="47" text-anchor="middle" font-family="Arial,sans-serif"
       font-weight="bold" font-size="36" letter-spacing="4" fill="#fff2cf">10¢ A SELECTION</text>
     <text x="300" y="96" text-anchor="middle" font-family="Georgia,serif"
       font-weight="bold" font-size="37" fill="#ffc24a">3 PLAYS · 25¢</text>`,
  );
  box("coinSlotRecess", [0.219, 0.68, 0.353], [0.095, 0.019, 0.01], C.darkChrome);
  box("coinSlot", [0.219, 0.68, 0.359], [0.076, 0.006, 0.004], C.black);
  box("coinSlotUpperLip", [0.219, 0.687, 0.36], [0.093, 0.003, 0.006], C.bright);
  label(
    "insertCoinLegend", [0.219, 0.654, 0.355], 0.144, 0.015,
    `<text x="300" y="84" text-anchor="middle" font-family="Arial,sans-serif"
      font-size="67" font-weight="bold" letter-spacing="5" fill="#23343a">INSERT COIN</text>`,
  );
  b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.009, 12), C.darkChrome, {
    at: [0.097, 0.671, 0.356], dir: [0, 0, 1], bone: cabinet, name: "coinReturnBezel",
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12), C.red, {
    at: [0.097, 0.671, 0.364], dir: [0, 0, 1], bone: cabinet, name: "coinReturnButton",
  });
  screws(coinRail, [[-0.312, 0.669, 0.39], [0.307, 0.669, 0.39]], "coinRail");

  // Recessed woven speaker cloth, followed by substantial metal starburst rays.
  const speakerOutline = [
    [-0.28, 0.199], [0.28, 0.199], [0.324, 0.238], [0.324, 0.573],
    [0.285, 0.613], [-0.285, 0.613], [-0.324, 0.573], [-0.324, 0.238],
  ];
  const speakerFrame = plate("speakerChromeSurround", speakerOutline, 0.324, 0.036, C.chrome);
  const clothOutline = speakerOutline.map(([x, y]) => [x * 0.941, 0.406 + (y - 0.406) * 0.918]);
  plate("speakerGoldInnerBorder", clothOutline, 0.346, 0.009, C.gold);
  const clothShape = clothOutline.map(([x, y]) => [x * 0.973, 0.406 + (y - 0.406) * 0.961]);
  const clothGeometry = new THREE.ShapeGeometry(shapeOf(clothShape));
  const positions = clothGeometry.getAttribute("position");
  const uv: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    uv.push((positions.getX(i) + 0.3) / 0.6, (positions.getY(i) - 0.21) / 0.39);
  }
  clothGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  const clothTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 468">
       <defs>
         <pattern id="weave" width="18" height="18" patternUnits="userSpaceOnUse">
           <rect width="18" height="18" fill="#18292c"/>
           <path d="M-9 9L9-9M0 18L18 0M9 27L27 9M-9 9L9 27M0 0L18 18M9-9L27 9"
             fill="none" stroke="#8b754f" stroke-width="1.9"/>
           <circle cx="9" cy="9" r="3.2" fill="#0e1b20"/>
         </pattern>
       </defs>
       <rect width="720" height="468" fill="url(#weave)"/>
       <circle cx="360" cy="234" r="172" fill="none" stroke="#0b2023" stroke-opacity=".5" stroke-width="13"/>
       <circle cx="360" cy="234" r="128" fill="none" stroke="#0b2023" stroke-opacity=".4" stroke-width="9"/>
     </svg>`,
    { size: 768 },
  );
  b.part(clothGeometry, "#ffffff", {
    at: [0, 0, 0.353],
    texture: clothTexture,
    bone: cabinet,
    name: "wovenSpeakerGrille",
  });

  const centerY = 0.406;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const dx = Math.cos(a), dy = Math.sin(a);
    const length = 1 / Math.pow(
      Math.pow(Math.abs(dx) / 0.292, 4) + Math.pow(Math.abs(dy) / 0.174, 4),
      0.25,
    );
    const p = (r: number, sideways = 0) => [
      dx * r - dy * sideways,
      centerY + dy * r + dx * sideways,
      0.365,
    ];
    if (i % 3 === 0) {
      b.slab([p(0.046, -0.011), p(length), p(0.046, 0.011)], {
        thickness: 0.006,
        color: C.chrome,
        bone: cabinet,
        name: "starburstLongRay",
      });
    } else {
      b.rod(p(0.054), p(length), i % 2 ? 0.0028 : 0.0036, {
        color: i % 2 ? C.gold : C.bright,
        sides: 5,
        bone: cabinet,
        name: "starburstFineRay",
      });
    }
  }
  b.part(new THREE.CylinderGeometry(0.057, 0.062, 0.018, 16), C.chrome, {
    at: [0, centerY, 0.374], dir: [0, 0, 1], bone: cabinet, name: "speakerCenterBezel",
  });
  b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.012, 16), C.red, {
    at: [0, centerY, 0.387], dir: [0, 0, 1], bone: cabinet, name: "speakerRubyMedallion",
  });
  b.extrude(
    [
      [0, 0.038], [0.006, 0.008], [0.033, 0], [0.006, -0.007],
      [0, -0.038], [-0.006, -0.007], [-0.033, 0], [-0.006, 0.008],
    ],
    {
      at: [0, centerY, 0.397],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      color: C.cream,
      bone: cabinet,
      name: "fourPointSpeakerStar",
    },
  );
  screws(speakerFrame, [
    [-0.297, 0.25, 0.39], [0.297, 0.25, 0.39],
    [-0.297, 0.561, 0.39], [0.297, 0.561, 0.39],
  ], "speaker");

  box("lowerNameplateBorder", [0, 0.164, 0.325], [0.329, 0.032, 0.021], C.gold);
  box("lowerNameplate", [0, 0.164, 0.339], [0.314, 0.023, 0.009], C.black);
  label(
    "modelLegend", [0, 0.164, 0.345], 0.302, 0.019,
    `<text x="300" y="79" text-anchor="middle" font-family="Arial,sans-serif"
      font-size="58" letter-spacing="5" fill="#f2dfb4">MODEL 57 · STEREOPHONIC</text>`,
  );

  // Side panels are finished too: cream enamel, streamlined colored spears,
  // carrying handles and small countersunk fasteners.
  for (const s of [-1, 1]) {
    const sideOutline = [
      [-0.202, 0.22], [0.155, 0.22], [0.2, 0.274],
      [0.2, 0.892], [0.114, 0.967], [-0.202, 0.902],
    ];
    const sideFrame = b.extrude(sideOutline, {
      at: [s * 0.489, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      color: C.chrome,
      bone: cabinet,
      name: "sideChromePanel",
    });
    b.extrude(
      [
        [-0.184, 0.242], [0.144, 0.242], [0.181, 0.285],
        [0.181, 0.882], [0.109, 0.943], [-0.184, 0.884],
      ],
      {
        at: [s * 0.499, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.006,
        color: C.cream,
        bone: cabinet,
        name: "sideCreamEnamel",
      },
    );
    b.extrude(
      [
        [-0.132, 0.284], [-0.066, 0.323], [0.145, 0.767],
        [0.145, 0.852], [0.093, 0.899], [0.032, 0.64],
      ],
      {
        at: [s * 0.505, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.005,
        color: C.face,
        bone: cabinet,
        name: "sideStreamlineSpear",
      },
    );
    for (let j = 0; j < 3; j++) {
      b.rod(
        [s * 0.51, 0.292, -0.151 + j * 0.015],
        [s * 0.51, 0.868 - j * 0.017, 0.061 + j * 0.018],
        0.0024,
        { color: j === 1 ? C.red : C.gold, sides: 5, bone: cabinet, name: "sideSpeedLine" },
      );
    }
    for (const z of [-0.134, 0.011]) {
      box("handleMount", [s * 0.512, 0.803, z], [0.026, 0.035, 0.031], C.darkChrome);
      b.rod([s * 0.51, 0.809, z], [s * 0.548, 0.809, z], 0.01, {
        color: C.chrome, sides: 8, bone: cabinet, name: "handleStandoff",
      });
    }
    b.rod([s * 0.548, 0.809, -0.134], [s * 0.548, 0.809, 0.011], 0.012, {
      color: C.chrome, sides: 8, bone: cabinet, name: "sideCarryingHandle",
    });
    screws(sideFrame, [
      [s * 0.55, 0.244, -0.183],
      [s * 0.55, 0.256, 0.159],
      [s * 0.55, 0.891, -0.182],
      [s * 0.55, 0.91, 0.117],
    ], "side");
  }

  // Quiet rear service details.
  const back = box("rearServicePanel", [0, 0.608, -0.284], [0.758, 0.896, 0.016], C.darkChrome);
  box("rearPanelInset", [0, 0.608, -0.295], [0.724, 0.862, 0.008], C.black);
  for (let i = 0; i < 11; i++) {
    box("rearCoolingLouver", [0, 0.948 - i * 0.024, -0.302], [0.559, 0.008, 0.009], C.body);
    box("rearLouverLip", [0, 0.952 - i * 0.024, -0.308], [0.556, 0.002, 0.004], C.darkChrome);
  }
  label(
    "rearManufacturersPlate",
    [0, 0.357, -0.302],
    0.256,
    0.083,
    `<rect width="600" height="180" rx="8" fill="#dacba6"/>
     <rect x="9" y="9" width="582" height="162" rx="5" fill="none" stroke="#23343a" stroke-width="4"/>
     <text x="300" y="57" text-anchor="middle" font-family="Georgia,serif"
       font-size="39" font-weight="bold" fill="#23343a">STARLITE MUSIC CO.</text>
     <text x="300" y="101" text-anchor="middle" font-family="Arial,sans-serif"
       font-size="25" fill="#23343a">MODEL 57 — HIGH FIDELITY</text>
     <text x="300" y="144" text-anchor="middle" font-family="Arial,sans-serif"
       font-size="22" fill="#23343a">115 VOLTS · SERIAL No. 057193</text>`,
    "0 0 600 180",
    512,
    [0, 0, -1],
  );
  screws(back, [
    [-0.359, 0.183, -0.34], [0.359, 0.183, -0.34],
    [-0.359, 1.03, -0.34], [0.359, 1.03, -0.34],
  ], "rear");

  // Preserve the builder's shared materials while giving the chrome, enamel,
  // luminous acrylic, and glass their distinct finishes.
  const root = b.root;
  const processed = new Set<THREE.Material>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (processed.has(material)) continue;
      processed.add(material);
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const hex = `#${material.color.getHexString()}`;
      if (hex === C.chrome || hex === C.bright) {
        material.metalness = 0.68;
        material.roughness = hex === C.bright ? 0.17 : 0.23;
      } else if (hex === C.darkChrome || hex === C.gold) {
        material.metalness = 0.58;
        material.roughness = 0.29;
      } else if (hex === C.body || hex === C.face || hex === C.red) {
        material.metalness = 0.18;
        material.roughness = 0.31;
      } else if ([C.neonRed, C.neonAmber, C.neonTeal].includes(hex)) {
        material.emissive.set(hex);
        material.emissiveIntensity = 0.65;
        material.roughness = 0.23;
        material.metalness = 0.04;
      } else if ([C.redLight, C.amberLight, C.tealLight].includes(hex)) {
        material.emissive.set(hex);
        material.emissiveIntensity = 0.85;
        material.roughness = 0.2;
      } else if (hex === C.glass) {
        material.transparent = true;
        material.opacity = 0.13;
        material.depthWrite = false;
        material.roughness = 0.12;
        material.metalness = 0.08;
        material.side = THREE.DoubleSide;
      } else if (hex === C.glint) {
        material.transparent = true;
        material.opacity = 0.4;
        material.depthWrite = false;
        material.roughness = 0.18;
        material.emissive.set(C.glint);
        material.emissiveIntensity = 0.12;
      } else if (hex === C.record) {
        material.roughness = 0.34;
        material.metalness = 0.1;
      }
    }
  });
  return root;
}
```