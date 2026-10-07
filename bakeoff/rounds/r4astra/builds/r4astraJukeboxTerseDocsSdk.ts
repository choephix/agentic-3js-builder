import * as THREE from "three";
import {
  createBuilder,
  polyline,
  grain,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Starlight 45 Jukebox",
  description:
    "A vintage archtop jukebox with honey-lit columns, oxblood cabinetry, a miniature record showcase, printed song cards, ivory selection keys, and a brass sunrise speaker grille.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Starlight45", detail: 1 });
  const cabinet = b.joint("cabinet", { at: [0, 0, 0] });

  const C = {
    wood: "#682c35",
    wine: "#852f3a",
    darkWine: "#381f29",
    teal: "#173e43",
    deepTeal: "#10292e",
    black: "#151c20",
    cloth: "#302c2b",
    gold: "#c79b58",
    brightGold: "#efd198",
    bronze: "#76503b",
    chrome: "#c8d5cf",
    cream: "#f6e8c9",
    ivory: "#fff2d2",
    amber: "#eba44a",
    orange: "#dd7040",
    light: "#ffe8a0",
    lightEnd: "#ffc36c",
    red: "#b94338",
  };

  const wood = grain("#51262d", "#79383d", {
    size: 0.018,
    axis: "y",
    seed: 41,
  });

  function materialFinish(
    material: THREE.Material | THREE.Material[],
    metalness: number,
    roughness: number,
  ) {
    for (const m of Array.isArray(material) ? material : [material]) {
      if (m instanceof THREE.MeshStandardMaterial) {
        m.metalness = metalness;
        m.roughness = roughness;
      }
    }
  }

  function box(
    name: string,
    at: number[],
    size: number[],
    color: string,
    rotation?: number[],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: cabinet,
      name,
      rotation,
    });
  }

  function disc(
    name: string,
    at: number[],
    radius: number,
    depth: number,
    color: string,
    segments = 24,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, depth, segments),
      color,
      { at, dir, bone: cabinet, name },
    );
  }

  function frontRing(
    name: string,
    x: number,
    y: number,
    z: number,
    radius: number,
    width: number,
    color: string,
    segments = 48,
  ) {
    return b.part(
      new THREE.RingGeometry(radius - width / 2, radius + width / 2, segments),
      color,
      { at: [x, y, z], bone: cabinet, name },
    );
  }

  function archOutline(r: number, spring: number, bottom: number) {
    const pts: number[][] = [[-r, bottom], [r, bottom], [r, spring]];
    for (let i = 1; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      pts.push([r * Math.cos(a), spring + r * Math.sin(a)]);
    }
    return pts;
  }

  function archRoute(r: number, bottom: number, z: number) {
    const pts: number[][] = [[-r, bottom, z], [-r, 1.16, z]];
    for (let i = 1; i <= 24; i++) {
      const a = Math.PI * (1 - i / 24);
      pts.push([r * Math.cos(a), 1.16 + r * Math.sin(a), z]);
    }
    pts.push([r, bottom, z]);
    return polyline(pts);
  }

  function faceTexture(
    name: string,
    texture: ReturnType<typeof svg>,
    at: number[],
    size: number[],
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir,
      axis: "z",
      bone: cabinet,
      name,
      texture,
    });
  }

  function screw(x: number, y: number, z: number, back = false) {
    disc("Slotted cabinet screw", [x, y, z], 0.006, 0.004, C.chrome, 8, [
      0, 0, back ? -1 : 1,
    ]);
    box(
      "Screw slot",
      [x, y, z + (back ? -0.0023 : 0.0023)],
      [0.007, 0.0013, 0.0007],
      C.bronze,
      [0, 0, 30],
    );
  }

  // A heavy cabinet sits on four small rubber feet.
  for (const x of [-0.39, 0.39]) {
    for (const z of [-0.24, 0.24]) {
      box("Rubber foot", [x, 0.03, z], [0.15, 0.06, 0.13], C.black);
    }
  }
  box("Floating dark toe kick", [0, 0.079, -0.015], [1.015, 0.085, 0.65], C.darkWine);
  const plinth = box(
    "Chrome plinth",
    [0, 0.108, -0.012],
    [1.075, 0.069, 0.724],
    C.chrome,
  );
  materialFinish(plinth.mesh.material, 0.78, 0.25);
  box("Plinth black reveal", [0, 0.147, -0.012], [1.038, 0.025, 0.69], C.black);
  box("Upper plinth molding", [0, 0.17, -0.012], [1.058, 0.026, 0.706], C.gold);

  b.extrude(archOutline(0.524, 1.16, 0.153), {
    at: [0, 0, -0.02],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.64,
    bevel: 0.011,
    detail: 0.6,
    color: wood,
    bone: cabinet,
    name: "Arched oxblood cabinet",
  });

  const goldenFascia = b.extrude(archOutline(0.514, 1.16, 0.173), {
    at: [0, 0, 0.307],
    x: [1, 0, 0],
    thickness: 0.033,
    bevel: 0.006,
    color: C.gold,
    bone: cabinet,
    name: "Cast brass front perimeter",
  });
  materialFinish(goldenFascia.mesh.material, 0.72, 0.3);

  b.extrude(archOutline(0.494, 1.16, 0.188), {
    at: [0, 0, 0.331],
    x: [1, 0, 0],
    thickness: 0.018,
    color: C.darkWine,
    bone: cabinet,
    name: "Burgundy front field",
  });

  b.sweep(archRoute(0.509, 0.195, 0.342), 0.009, {
    color: C.chrome,
    bone: cabinet,
    sides: 8,
    caps: "round",
    name: "Outer silver pinstripe",
  });
  b.sweep(archRoute(0.391, 0.195, 0.36), 0.009, {
    color: C.brightGold,
    bone: cabinet,
    sides: 8,
    name: "Inner arch pinstripe",
  });

  // Segmented amber light tubes, deliberately substantial rather than neon-thin.
  b.sweep(archRoute(0.456, 0.211, 0.363), 0.060, {
    color: C.bronze,
    bone: cabinet,
    sides: 10,
    caps: "flat",
    name: "Light tube bronze sockets",
  });
  const amberTube = b.sweep(archRoute(0.456, 0.215, 0.395), 0.046, {
    bone: cabinet,
    sides: 10,
    caps: "round",
    bands: [
      [0.115, C.orange],
      [0.885, C.amber],
      [1, C.orange],
    ],
    name: "Amber glass arch",
  });
  const lightTube = b.sweep(archRoute(0.456, 0.224, 0.426), 0.023, {
    bone: cabinet,
    sides: 8,
    caps: "round",
    bands: [
      [0.13, C.lightEnd],
      [0.87, C.light],
      [1, C.lightEnd],
    ],
    name: "Warm illuminated tube cores",
  });
  for (const [tube, strength] of [[amberTube, 0.1], [lightTube, 0.32]] as const) {
    for (const mesh of tube.meshes) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of materials) {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.emissive.copy(m.color);
          m.emissiveIntensity = strength;
          m.roughness = 0.31;
        }
      }
    }
  }

  for (const s of [-1, 1]) {
    for (const y of [0.262, 0.568, 0.876, 1.16]) {
      box("Glass tube retaining collar", [s * 0.456, y, 0.437],
        [0.101, 0.022, 0.038], C.gold);
      box("Collar bright edge", [s * 0.456, y + 0.008, 0.458],
        [0.098, 0.004, 0.006], C.chrome);
    }
  }
  for (const deg of [30, 60, 120, 150]) {
    const a = THREE.MathUtils.degToRad(deg);
    box("Curved arch retaining collar",
      [0.456 * Math.cos(a), 1.16 + 0.456 * Math.sin(a), 0.437],
      [0.1, 0.021, 0.038], C.gold, [0, 0, deg]);
  }

  // Recessed upper showcase.
  b.extrude(archOutline(0.371, 1.16, 0.975), {
    at: [0, 0, 0.355],
    x: [1, 0, 0],
    thickness: 0.024,
    bevel: 0.004,
    color: C.gold,
    bone: cabinet,
    name: "Showcase brass bezel",
  });
  b.extrude(archOutline(0.352, 1.16, 0.991), {
    at: [0, 0, 0.372],
    x: [1, 0, 0],
    thickness: 0.012,
    color: C.deepTeal,
    bone: cabinet,
    name: "Deep teal record showcase",
  });

  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      b.rod(
        [s * 0.146, 1.21, 0.389],
        [s * (0.202 + 0.022 * i), 1.389 - 0.028 * i, 0.389],
        0.0034,
        { color: C.gold, sides: 6, bone: cabinet, name: "Showcase sun ray" },
      );
    }
  }

  disc("Record brass surround", [0, 1.314, 0.386], 0.124, 0.012, C.gold, 48);
  disc("Seven inch record", [0, 1.314, 0.397], 0.116, 0.009, C.black, 48);
  for (const r of [0.059, 0.07, 0.081, 0.092, 0.103, 0.109]) {
    frontRing("Pressed vinyl groove", 0, 1.314, 0.402, r, 0.0009, "#415254");
  }
  disc("Record paper label", [0, 1.314, 0.404], 0.042, 0.004, C.cream, 32);

  const recordLabel = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#f6e8c9"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#852f3a" stroke-width="2"/>
      <text x="50" y="28" text-anchor="middle" font-family="serif" font-size="10"
        font-weight="bold" fill="#852f3a">STARLIGHT</text>
      <text x="50" y=" sixty" fill="none"> </text>
      <text x="50" y="62" text-anchor="middle" font-family="serif"
        font-size="35" font-weight="bold" fill="#173e43">45</text>
      <text x="50" y="80" text-anchor="middle" font-family="sans-serif"
        font-size="7" fill="#852f3a">MICROGROOVE</text>
    </svg>`, { size: 256 });
  faceTexture("Printed record label", recordLabel, [0, 1.314, 0.4065], [0.081, 0.081]);
  disc("Record spindle", [0, 1.314, 0.411], 0.005, 0.009, C.chrome, 10);

  disc("Tonearm pivot", [0.227, 1.249, 0.402], 0.017, 0.023, C.gold, 12);
  b.sweep(polyline([
    [0.227, 1.249, 0.417],
    [0.227, 1.363, 0.417],
    [0.175, 1.392, 0.417],
    [0.077, 1.343, 0.417],
  ]), 0.0055, {
    color: C.chrome, bone: cabinet, sides: 8, name: "Showcase tonearm",
  });
  box("Tonearm cartridge", [0.074, 1.337, 0.419],
    [0.022, 0.025, 0.017], C.cream, [0, 0, -28]);

  b.extrude([
    [-0.181, -0.012], [-0.153, -0.023], [0.153, -0.023],
    [0.181, -0.012], [0.15, 0.022], [-0.15, 0.022],
  ], {
    at: [0, 1.455, 0.397],
    x: [1, 0, 0],
    thickness: 0.012,
    color: C.brightGold,
    bone: cabinet,
    name: "Starlight marque plaque",
  });

  const marque = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 92">
      <text x="330" y="57" text-anchor="middle" font-family="Georgia,serif"
        font-weight="bold" font-size=" fifty" fill="#173e43"></text>
      <text x="330" y="58" text-anchor="middle" font-family="Georgia,serif"
        font-weight="bold" font-size="51" letter-spacing="6" fill="#173e43">STARLIGHT</text>
      <path d="M20 46h30m-15-15v30M610 46h30m-15-15v30"
        stroke="#852f3a" stroke-width="4"/>
    </svg>`, { size: 1024 });
  faceTexture("Starlight lettering", marque, [0, 1.455, 0.404], [0.326, 0.046]);

  // A stepped star crest fastens the arch at its crown.
  b.extrude([
    [0, 0.047], [0.011, 0.013], [0.035, 0], [0.011, -0.012],
    [0, -0.036], [-0.011, -0.012], [-0.035, 0], [-0.011, 0.013],
  ], {
    at: [0, 1.612, 0.451], x: [1, 0, 0], thickness: 0.016,
    color: C.brightGold, bone: cabinet, name: "Crown star",
  });
  disc("Ruby crown center", [0, 1.612, 0.465], 0.012, 0.01, C.red, 10);

  // Individual raised song cards with a shared printed overlay.
  box("Song chart metal frame", [0, 1.084, 0.394], [0.685, 0.235, 0.035], C.chrome);
  box("Song chart dark recess", [0, 1.084, 0.414], [0.658, 0.217, 0.015], C.black);

  const songs = [
    ["A1", "BLUE MOON", "THE MIDNIGHTERS"],
    ["A2", "NIGHT TRAIN", "JIMMY &amp; THE JETS"],
    ["A3", "DREAM A LITTLE", "THE STARLETTES"],
    ["A4", "SHAKE, RATTLE &amp; ROLL", "THE KING PINS"],
    ["B1", "ONLY YOU", "THE HEARTBEATS"],
    ["B2", "ROUTE 66", "THE ROADSTERS"],
    ["B3", "EARTH ANGEL", "THE VELVETS"],
    ["B4", "TWILIGHT TIME", "THE MOONLIGHTS"],
  ];
  let cardArtwork = "";
  songs.forEach(([code, title, artist], i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = col * 342;
    const y = row * 52;
    box("Ivory song title card",
      [col === 0 ? -0.171 : 0.171, 1.166 - row * 0.052, 0.424],
      [0.298, 0.044, 0.008], C.cream);
    cardArtwork += `
      <g transform="translate(${x},${y})">
        <rect width="298" height="44" rx="2" fill="#f6e8c9"/>
        <rect x="3" y="3" width="292" height="38" fill="none" stroke="#c79b58" stroke-width="1.5"/>
        <rect x="8" y="9" width="31" height="26" rx="3" fill="#852f3a"/>
        <text x="23.5" y="27" text-anchor="middle" font-family="sans-serif"
          font-size="13" font-weight="bold" fill="#fff2d2">${code}</text>
        <text x="48" y="19" font-family="sans-serif" font-size="12"
          font-weight="bold" fill="#173e43">${title}</text>
        <text x="48" y="33" font-family="sans-serif" font-size="8"
          letter-spacing="1.2" fill="#76503b">${artist}</text>
      </g>`;
  });
  const chart = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 208">${cardArtwork}</svg>`,
    { size: 1024 },
  );
  faceTexture("Printed song listings", chart, [0, 1.084, 0.4285], [0.64, 0.208]);

  // The selection shelf projects forward of the cabinet.
  box("Selection shelf dark casing", [0, 0.905, 0.393], [0.769, 0.104, 0.147], C.darkWine);
  box("Selection shelf brass top lip", [0, 0.954, 0.407], [0.772, 0.015, 0.155], C.gold);
  box("Selection shelf ivory fascia", [0, 0.905, 0.451], [0.716, 0.071, 0.049], C.cream);
  box("Button bank black bed", [0, 0.906, 0.476], [0.665, 0.057, 0.013], C.black);
  box("Selection shelf silver underside", [0, 0.857, 0.415], [0.755, 0.01, 0.127], C.chrome);

  let keysArtwork = "";
  songs.forEach(([code], i) => {
    const x = -0.28 + i * 0.08;
    box("Selection key " + code, [x, 0.905, 0.488],
      [0.066, 0.043, 0.023], C.ivory);
    box("Selection key beveled top", [x, 0.927, 0.484],
      [0.066, 0.005, 0.026], C.brightGold);
    keysArtwork += `<text x="${40 + i * 80}" y="34" text-anchor="middle"
      font-family="sans-serif" font-size="20" font-weight="bold" fill="#173e43">${code}</text>`;
  });
  const keys = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 50">${keysArtwork}</svg>`,
    { size: 1024 },
  );
  faceTexture("Key legends", keys, [0, 0.905, 0.5002], [0.64, 0.05]);

  box("Coin control panel border", [0, 0.792, 0.373], [0.667, 0.111, 0.039], C.gold);
  box("Coin control enamel panel", [0, 0.792, 0.396], [0.642, 0.088, 0.014], C.teal);
  box("Coin slot chrome plate", [-0.252, 0.794, 0.412], [0.066, 0.07, 0.015], C.chrome);
  box("Coin slot dark opening", [-0.252, 0.798, 0.421], [0.009, 0.043, 0.005], C.black);
  box("Coin slot lower lip", [-0.252, 0.776, 0.424], [0.025, 0.004, 0.009], C.bronze);
  disc("Coin return bezel", [0.249, 0.793, 0.417], 0.032, 0.017, C.gold, 20);
  disc("Coin return button", [0.249, 0.793, 0.43], 0.022, 0.018, C.chrome, 16);

  const price = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 112">
      <text x="250" y="47" text-anchor="middle" font-family="Georgia,serif"
        font-size="40" font-weight="bold" fill="#f6e8c9">25¢ · 2 PLAYS</text>
      <path d="M50 61h400" stroke="#c79b58" stroke-width="2"/>
      <text x="250" y="90" text-anchor="middle" font-family="sans-serif"
        font-size="17" letter-spacing="4" fill="#efd198">SELECT YOUR FAVORITE</text>
    </svg>`, { size: 768 });
  faceTexture("Coin panel instructions", price, [0, 0.792, 0.404], [0.35, 0.078]);
  for (const x of [-0.312, 0.312]) screw(x, 0.792, 0.407);

  // Lower speaker: a dark cloth arch and an explicitly modeled sunrise grille.
  const speakerFrame = archOutline(0.341, 0.43, 0.19);
  b.extrude(speakerFrame, {
    at: [0, 0, 0.357], x: [1, 0, 0], thickness: 0.034,
    bevel: 0.006, color: C.gold, bone: cabinet, name: "Speaker bezel",
  });
  b.extrude(archOutline(0.328, 0.43, 0.195), {
    at: [0, 0, 0.376], x: [1, 0, 0], thickness: 0.013,
    color: C.cloth, bone: cabinet, name: "Speaker cloth backing",
  });

  const speakerCloth = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 561">
      <defs>
        <pattern id="weave" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#302c2b"/>
          <path d="M0 0L12 12M-6 6L6 18M6-6L18 6" stroke="#74604a" stroke-width="2"/>
          <path d="M0 12L12 0M-6 6L6-6M6 18L18 6" stroke="#171d1d" stroke-width="3"/>
        </pattern>
      </defs>
      <path d="M4 561V326A326 326 0 0 1 656 326V561Z" fill="url(#weave)"/>
    </svg>`, { size: 1024 });
  faceTexture("Woven speaker cloth", speakerCloth, [0, 0.4755, 0.384], [0.66, 0.561]);

  b.sweep(polyline(speakerFrame.map(([x, y]) => [x, y, 0.398]), { closed: true }), 0.007, {
    color: C.brightGold, sides: 6, bone: cabinet, name: "Speaker bright border",
  });

  const rayEnds = [
    [-0.321, 0.274], [-0.325, 0.446], [-0.282, 0.591],
    [-0.162, 0.710], [0, 0.752], [0.162, 0.710],
    [0.282, 0.591], [0.325, 0.446], [0.321, 0.274],
  ];
  for (const [x, y] of rayEnds) {
    b.rod([0, 0.241, 0.412], [x, y, 0.412], 0.009, {
      color: C.gold, sides: 6, bone: cabinet, name: "Sunrise grille spoke",
    });
    b.rod([0, 0.25, 0.421], [x * 0.988, y - 0.003, 0.421], 0.0025, {
      color: C.brightGold, sides: 5, bone: cabinet, name: "Grille spoke highlight",
    });
  }
  for (const r of [0.178, 0.292]) {
    const pts: number[][] = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI * i / 24;
      pts.push([r * Math.cos(a), 0.244 + r * Math.sin(a), 0.419]);
    }
    b.sweep(polyline(pts), 0.0045, {
      color: C.gold, sides: 6, bone: cabinet, name: "Concentric sunrise grille arc",
    });
  }
  disc("Speaker medallion rim", [0, 0.252, 0.426], 0.051, 0.024, C.gold, 20);
  disc("Speaker medallion enamel", [0, 0.252, 0.442], 0.04, 0.01, C.teal, 20);
  b.extrude([
    [0, 0.03], [0.007, 0.008], [0.027, 0], [0.007, -0.007],
    [0, -0.026], [-0.007, -0.007], [-0.027, 0], [-0.007, 0.008],
  ], {
    at: [0, 0.252, 0.45], x: [1, 0, 0], thickness: 0.007,
    color: C.brightGold, bone: cabinet, name: "Speaker star emblem",
  });

  for (const s of [-1, 1]) {
    box("Fluted side pillar shadow", [s * 0.369, 0.465, 0.363],
      [0.062, 0.536, 0.032], C.black);
    box("Fluted side pillar enamel", [s * 0.369, 0.465, 0.384],
      [0.05, 0.526, 0.017], C.wine);
    for (let i = -1; i <= 1; i++) {
      box("Art deco pillar flute", [s * 0.369 + i * 0.014, 0.465, 0.4],
        [0.005, 0.484 - Math.abs(i) * 0.033, 0.014], C.gold);
    }
    for (const y of [0.207, 0.722]) {
      box("Pillar end cap", [s * 0.369, y, 0.404], [0.064, 0.022, 0.032], C.chrome);
    }
  }
  box("Front lower bumper", [0, 0.188, 0.38], [0.904, 0.027, 0.065], C.chrome);
  box("Front base gold stripe", [0, 0.134, 0.358], [1.042, 0.008, 0.022], C.brightGold);

  // Side furniture: inset panels, ventilators, pinstripes and recessed handles.
  for (const s of [-1, 1]) {
    box("Side inset dark frame", [s * 0.523, 0.686, -0.025],
      [0.013, 0.875, 0.475], C.darkWine);
    box("Side raised enamel panel", [s * 0.532, 0.688, -0.025],
      [0.012, 0.84, 0.438], C.wine);
    for (const z of [-0.233, 0.183]) {
      box("Side brass pinstripe", [s * 0.54, 0.688, z],
        [0.006, 0.817, 0.005], C.gold);
    }
    for (let i = 0; i < 6; i++) {
      box("Side ventilation recess", [s * 0.542, 0.38 + i * 0.039, -0.026],
        [0.008, 0.014, 0.28], C.darkWine);
      box("Vent lower brass edge", [s * 0.548, 0.374 + i * 0.039, -0.026],
        [0.006, 0.003, 0.275], C.bronze);
    }

    b.extrude([
      [0, 0.13], [0.071, 0.022], [0.071, -0.022], [0, -0.13],
      [-0.071, -0.022], [-0.071, 0.022],
    ], {
      at: [s * 0.545, 0.823, -0.025],
      x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012,
      color: C.gold, bone: cabinet, name: "Side diamond ornament",
    });
    b.extrude([
      [0, 0.096], [0.044, 0], [0, -0.096], [-0.044, 0],
    ], {
      at: [s * 0.554, 0.823, -0.025],
      x: [0, 0, 1], y: [0, 1, 0], thickness: 0.008,
      color: C.teal, bone: cabinet, name: "Side diamond enamel",
    });

    box("Recessed lifting handle plate", [s * 0.545, 1.048, -0.027],
      [0.014, 0.066, 0.203], C.darkWine);
    for (const z of [-0.105, 0.051]) {
      b.rod([s * 0.544, 1.048, z], [s * 0.57, 1.048, z], 0.01, {
        color: C.chrome, bone: cabinet, sides: 8, name: "Handle standoff",
      });
    }
    b.rod([s * 0.57, 1.048, -0.105], [s * 0.57, 1.048, 0.051], 0.012, {
      color: C.chrome, bone: cabinet, sides: 8, name: "Side carry handle",
    });
  }

  // Finished rear service panel, visible when the model is turned around.
  b.sweep(
    polyline(archOutline(0.508, 1.16, 0.177).map(([x, y]) => [x, y, -0.343]), { closed: true }),
    0.007,
    { color: C.bronze, bone: cabinet, sides: 6, name: "Rear cabinet edging" },
  );
  box("Rear service panel border", [0, 0.666, -0.346], [0.79, 0.954, 0.025], C.bronze);
  box("Rear service panel", [0, 0.666, -0.362], [0.753, 0.92, 0.018], C.darkWine);
  for (let i = 0; i < 7; i++) {
    box("Rear cooling louver", [0, 0.91 + i * 0.026, -0.374],
      [0.47, 0.009, 0.009], C.black);
  }
  for (const x of [-0.35, 0.35]) {
    for (const y of [0.241, 0.668, 1.091]) screw(x, y, -0.375, true);
  }
  const serviceLabel = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 210">
      <rect x="4" y="4" width="412" height="202" fill="#e7d7b4" stroke="#76503b" stroke-width="8"/>
      <text x="210" y="54" text-anchor="middle" font-family="serif"
        font-size="32" font-weight="bold" fill="#381f29">STARLIGHT</text>
      <text x="210" y="86" text-anchor="middle" font-family="sans-serif"
        font-size="15" letter-spacing="3" fill="#381f29">HIGH FIDELITY PHONOGRAPH</text>
      <path d="M30 104H390" stroke="#76503b" stroke-width="3"/>
      <text x="34" y="133" font-family="monospace" font-size="17" fill="#381f29">MODEL 45       SERIAL 0058</text>
      <text x="34" y="160" font-family="monospace" font-size="14" fill="#381f29">115 VOLTS AC • 60 CYCLES</text>
      <text x="210" y="190" text-anchor="middle" font-family="sans-serif"
        font-size="12" fill="#381f29">DISCONNECT POWER BEFORE SERVICING</text>
    </svg>`, { size: 512 });
  faceTexture("Rear manufacturer label", serviceLabel, [0, 0.704, -0.373], [0.29, 0.145], [0, 0, -1]);
  disc("Rear cable socket bezel", [0.251, 0.287, -0.376], 0.022, 0.014, C.bronze, 12, [0, 0, -1]);
  disc("Rear cable socket", [0.251, 0.287, -0.386], 0.013, 0.008, C.black, 12, [0, 0, -1]);

  return b.root;
}
