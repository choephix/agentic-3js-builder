import * as THREE from "three";
import {
  createBuilder,
  frame,
  polyline,
  bezier,
  grain,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Stardust Jukebox",
  description:
    "A full-size, cathedral-arched 1950s jukebox with amber and turquoise light rails, a visible 45 RPM record, printed song cards, ivory selection keys, and an Art Deco brass speaker grille.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "stardustJukebox", detail: 1 });
  const root = b.joint("cabinetRoot", { at: [0, 0, 0] });

  const C = {
    wood: "#57242c",
    woodLight: "#783a39",
    wine: "#812d35",
    darkWine: "#421d28",
    navy: "#18343c",
    black: "#10181c",
    rubber: "#202426",
    chrome: "#bfd5d8",
    silverDark: "#60777e",
    gold: "#d9ab55",
    goldLight: "#f1d28b",
    brassDark: "#947342",
    cream: "#f4e5bc",
    amber: "#ffc35b",
    orange: "#efa13f",
    teal: "#4dd3c6",
    tealLight: "#b9f4df",
    red: "#bd443c",
    grooves: "#354146",
    white: "#fff7db",
  };

  const wood = grain(C.wood, C.woodLight, {
    size: 0.009,
    axis: "y",
    seed: 57,
  });

  const cy = 1.10;

  function box(
    w: number,
    h: number,
    d: number,
    at: [number, number, number],
    color: string,
    name: string,
  ) {
    return b.part(new THREE.BoxGeometry(w, h, d), color, {
      at,
      bone: root,
      name,
    });
  }

  function frontDisc(
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 24,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, depth, segments),
      color,
      { at, dir: [0, 0, 1], bone: root, name, flat: true },
    );
  }

  function octagon(w: number, h: number, cut: number): OutlinePoint[] {
    return [
      [-w / 2 + cut, -h / 2],
      [w / 2 - cut, -h / 2],
      [w / 2, -h / 2 + cut],
      [w / 2, h / 2 - cut],
      [w / 2 - cut, h / 2],
      [-w / 2 + cut, h / 2],
      [-w / 2, h / 2 - cut],
      [-w / 2, -h / 2 + cut],
    ];
  }

  function archOutline(r: number, bottom: number): OutlinePoint[] {
    const points: OutlinePoint[] = [
      [-r, bottom],
      [r, bottom],
      [r, cy],
    ];
    for (let i = 1; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      points.push([r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return points;
  }

  function horseshoe(
    outer: number,
    inner: number,
    bottom: number,
  ): OutlinePoint[] {
    const points: OutlinePoint[] = [
      [outer, bottom],
      [outer, cy],
    ];
    for (let i = 1; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      points.push([outer * Math.cos(a), cy + outer * Math.sin(a)]);
    }
    points.push([-outer, bottom], [-inner, bottom], [-inner, cy]);
    for (let i = 1; i <= 24; i++) {
      const a = Math.PI - (i / 24) * Math.PI;
      points.push([inner * Math.cos(a), cy + inner * Math.sin(a)]);
    }
    points.push([inner, bottom]);
    return points;
  }

  function archPath(r: number, bottom: number, z: number) {
    const points: number[][] = [
      [-r, bottom, z],
      [-r, cy, z],
    ];
    for (let i = 1; i <= 32; i++) {
      const a = Math.PI - (i / 32) * Math.PI;
      points.push([r * Math.cos(a), cy + r * Math.sin(a), z]);
    }
    points.push([r, bottom, z]);
    return polyline(points);
  }

  function frontPlate(
    outline: OutlinePoint[],
    at: [number, number, number],
    thickness: number,
    color: string,
    name: string,
    bevel = 0,
  ) {
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      bone: root,
      name,
    });
  }

  function lettering(
    markup: string,
    width: number,
    height: number,
    at: [number, number, number],
    name: string,
    size = 512,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone: root,
      texture: svg(markup, { size }),
      name,
    });
  }

  // A deep wooden shell, sitting on a stepped furniture plinth.
  for (const x of [-0.365, 0.365]) {
    for (const z of [-0.225, 0.225]) {
      box(0.12, 0.036, 0.115, [x, 0.018, z], C.rubber, "rubberFoot");
    }
  }
  box(0.985, 0.035, 0.665, [0, 0.0455, 0], C.darkWine, "plinthLower");
  box(0.961, 0.066, 0.645, [0, 0.091, 0], C.wine, "plinthEnamel");
  box(0.976, 0.013, 0.655, [0, 0.1305, 0], C.chrome, "plinthChromeLip");
  box(0.934, 0.008, 0.008, [0, 0.074, 0.327], C.gold, "basePinstripe");
  box(0.89, 0.012, 0.014, [0, 0.108, 0.329], C.goldLight, "baseFrontRail");

  b.extrude(archOutline(0.465, 0.126), {
    at: [0, 0, -0.01],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.58,
    bevel: 0.009,
    color: wood,
    bone: root,
    name: "archedWalnutCabinet",
  });
  frontPlate(
    archOutline(0.449, 0.147),
    [0, 0, 0.292],
    0.025,
    C.darkWine,
    "frontEnamelFascia",
    0.004,
  );
  frontPlate(
    archOutline(0.329, 0.151),
    [0, 0, 0.311],
    0.021,
    C.navy,
    "centralEnamelField",
    0.003,
  );

  // Concentric horseshoe mouldings: thick luminous panels, not smooth neon blobs.
  const rings = [
    { outer: 0.458, inner: 0.440, z: 0.321, depth: 0.057, color: C.gold, name: "outerBrassMoulding" },
    { outer: 0.442, inner: 0.377, z: 0.339, depth: 0.044, color: C.amber, name: "amberLightPanels" },
    { outer: 0.432, inner: 0.387, z: 0.363, depth: 0.012, color: C.orange, name: "amberPanelCenters" },
    { outer: 0.378, inner: 0.359, z: 0.325, depth: 0.055, color: C.gold, name: "innerBrassMoulding" },
    { outer: 0.359, inner: 0.340, z: 0.351, depth: 0.032, color: C.teal, name: "turquoiseLightPanels" },
    { outer: 0.340, inner: 0.326, z: 0.337, depth: 0.043, color: C.chrome, name: "innerChromeReveal" },
  ];
  for (const ring of rings) {
    frontPlate(
      horseshoe(ring.outer, ring.inner, 0.151),
      [0, 0, ring.z],
      ring.depth,
      ring.color,
      ring.name,
      0.002,
    );
  }

  b.sweep(archPath(0.453, 0.158, 0.353), 0.006, {
    color: C.goldLight,
    bone: root,
    sides: 6,
    smooth: false,
    caps: "flat",
    name: "outerBrightBead",
  });
  b.sweep(archPath(0.410, 0.172, 0.375), 0.005, {
    color: C.white,
    bone: root,
    sides: 6,
    caps: "flat",
    name: "amberLightFilament",
  });
  b.sweep(archPath(0.3495, 0.172, 0.371), 0.0038, {
    color: C.tealLight,
    bone: root,
    sides: 6,
    caps: "flat",
    name: "turquoiseLightFilament",
  });

  // Brass sleeve joints give the arched diffuser its classic ribbed rhythm.
  b.along(
    archPath(0.410, 0.172, 0.376),
    29,
    (at) => {
      b.part(new THREE.BoxGeometry(0.060, 0.011, 0.023), C.gold, {
        frame: frame(at, at.axis, [0, 0, 1]),
        bone: root,
        name: "lampPanelSleeve",
      });
      b.part(new THREE.BoxGeometry(0.055, 0.0035, 0.025), C.goldLight, {
        frame: frame(at, at.axis, [0, 0, 1]),
        bone: root,
        name: "sleeveHighlight",
      });
    },
  );

  // Bubbles in the two upright amber columns.
  const amberSurface = b.surface(
    root.object.children.filter((o) => o.name === "amberPanelCenters"),
  );
  // Querying the named part directly is more robust than relying on descendants.
  // These small studs use the already-built front fascia as their seating surface.
  const fasciaSurface = b.surface(root);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const y = 0.225 + i * 0.095;
      const hit = fasciaSurface.ray([s * 0.416, y, 0.6], [0, 0, -1]);
      if (hit) {
        b.stick(
          new THREE.SphereGeometry(i % 3 === 0 ? 0.008 : 0.0055, 6, 4),
          C.white,
          hit,
          { embed: 0.46, name: "lightColumnBubble" },
        );
      }
    }
    box(0.086, 0.036, 0.065, [s * 0.410, 0.167, 0.337], C.gold, "columnFootSocket");
    box(0.063, 0.009, 0.067, [s * 0.410, 0.183, 0.339], C.chrome, "socketLip");
  }
  void amberSurface;

  // Upper record chamber, with a black vinyl disc and a separate metal tonearm.
  frontPlate(
    archOutline(0.315, 1.076),
    [0, 0, 0.330],
    0.015,
    C.black,
    "recordWindowRecess",
  );

  const windowBorder = archOutline(0.315, 1.076).map((p) => [
    p[0],
    p[1],
    0.343,
  ]);
  b.sweep(polyline(windowBorder, { closed: true }), 0.0044, {
    color: C.brassDark,
    bone: root,
    sides: 6,
    caps: "flat",
    name: "recordWindowBeading",
  });

  frontDisc(0.139, 0.013, [0, 1.252, 0.346], C.black, "vinyl45", 48);
  for (const r of [0.132, 0.124, 0.116, 0.108, 0.100, 0.092, 0.082, 0.071, 0.059]) {
    b.part(new THREE.TorusGeometry(r, 0.0009, 3, 48), C.grooves, {
      at: [0, 1.252, 0.353],
      bone: root,
      name: "vinylGroove",
    });
  }
  frontDisc(0.044, 0.0025, [0, 1.252, 0.354], C.red, "recordLabel", 32);
  lettering(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="98" fill="#bd443c"/>
      <circle cx="100" cy="100" r="87" fill="none" stroke="#f4e5bc" stroke-width="3"/>
      <text x="100" y="59" text-anchor="middle" fill="#fff7db" font-family="Georgia,serif" font-style="italic" font-size="24">Stardust</text>
      <text x="100" y="143" text-anchor="middle" fill="#fff7db" font-family="Arial,sans-serif" font-size="16" letter-spacing="3">45 RPM</text>
      <path d="M29 96H68M132 96H171" stroke="#f4e5bc" stroke-width="3"/>
    </svg>`,
    0.086,
    0.086,
    [0, 1.252, 0.356],
    "printedRecordLabel",
    256,
  );
  frontDisc(0.011, 0.005, [0, 1.252, 0.359], C.chrome, "spindleBoss", 12);
  frontDisc(0.0043, 0.002, [0, 1.252, 0.363], C.black, "spindleHole", 10);

  frontDisc(0.019, 0.014, [0.238, 1.122, 0.351], C.gold, "tonearmPivot", 12);
  frontDisc(0.011, 0.017, [0.238, 1.122, 0.355], C.chrome, "tonearmPivotCap", 12);
  b.sweep(
    polyline([
      [0.238, 1.122, 0.363],
      [0.235, 1.292, 0.363],
      [0.188, 1.341, 0.363],
      [0.100, 1.306, 0.368],
    ]),
    0.007,
    {
      color: C.chrome,
      bone: root,
      sides: 6,
      caps: "round",
      name: "bentTonearm",
    },
  );
  b.part(new THREE.BoxGeometry(0.037, 0.019, 0.022), C.cream, {
    at: [0.103, 1.304, 0.371],
    rotation: [0, 0, 23],
    bone: root,
    name: "tonearmCartridge",
  });
  box(0.012, 0.006, 0.012, [0.094, 1.293, 0.369], C.black, "stylus");

  frontDisc(0.029, 0.007, [-0.238, 1.176, 0.347], C.gold, "rpmBadgeBorder", 16);
  frontDisc(0.023, 0.009, [-0.238, 1.176, 0.351], C.navy, "rpmBadgeEnamel", 16);
  lettering(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <text x="50" y="62" text-anchor="middle" font-family="Arial,sans-serif"
        font-weight="bold" font-size="47" fill="#f4e5bc">45</text>
      <text x="50" y="82" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="13" fill="#f4e5bc" letter-spacing="4">RPM</text>
    </svg>`,
    0.042,
    0.042,
    [-0.238, 1.176, 0.357],
    "rpmBadgePrint",
    192,
  );

  // Short radial etchings following the upper window.
  for (let i = 0; i < 11; i++) {
    const a = ((24 + i * 13.2) * Math.PI) / 180;
    b.rod(
      [0.290 * Math.cos(a), cy + 0.290 * Math.sin(a), 0.341],
      [0.308 * Math.cos(a), cy + 0.308 * Math.sin(a), 0.341],
      0.002,
      { color: C.gold, bone: root, sides: 4, name: "windowSunray" },
    );
  }

  // An enamel crown badge, proud of the light arch.
  frontPlate(
    octagon(0.272, 0.074, 0.015),
    [0, 1.504, 0.392],
    0.023,
    C.gold,
    "brandBadgeBorder",
    0.003,
  );
  frontPlate(
    octagon(0.248, 0.052, 0.009),
    [0, 1.504, 0.406],
    0.007,
    C.navy,
    "brandBadgeEnamel",
    0.001,
  );
  lettering(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120">
      <path d="M31 36L38 53L55 60L38 67L31 84L24 67L7 60L24 53Z
               M569 36L576 53L593 60L576 67L569 84L562 67L545 60L562 53Z"
            fill="#f1d28b"/>
      <text x="300" y="78" text-anchor="middle" fill="#fff7db"
        font-family="Georgia,serif" font-style="italic" font-weight="bold"
        font-size="65" letter-spacing="3">Stardust</text>
    </svg>`,
    0.235,
    0.047,
    [0, 1.504, 0.411],
    "stardustMarquee",
  );

  // Twelve paper song cards behind a substantial chrome selection bezel.
  frontPlate(
    octagon(0.622, 0.269, 0.016),
    [0, 0.935, 0.337],
    0.033,
    C.chrome,
    "selectionWindowChrome",
    0.004,
  );
  frontPlate(
    octagon(0.589, 0.239, 0.007),
    [0, 0.935, 0.357],
    0.008,
    C.gold,
    "selectionWindowInnerRim",
    0.002,
  );
  const titles = [
    ["BLUE MOON", "THE MIDNIGHT QUARTET"],
    ["ROCK AROUND THE CLOCK", "BILL AND THE COMETS"],
    ["ONLY YOU", "THE VELVET VOICES"],
    ["EARTH ANGEL", "THE STREETLIGHTS"],
    ["SHAKE, RATTLE AND ROLL", "THE SATURDAY FIVE"],
    ["DREAM A LITTLE DREAM", "ELLA AND THE ORCHESTRA"],
    ["JAILHOUSE ROCK", "THE KING"],
    ["AT THE HOP", "DANNY AND THE JUNIORS"],
    ["MISTER SANDMAN", "THE CHORDETTES"],
    ["STARDUST", "THE NIGHT TRAIN TRIO"],
    ["SWEET SIXTEEN", "THE BLUE NOTES"],
    ["GOODNIGHT, SWEETHEART", "THE SPANIELS"],
  ];
  let cards = "";
  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 6; row++) {
      const index = col * 6 + row;
      const x = 9 + col * 298;
      const y = 31 + row * 32;
      cards += `
        <rect x="${x}" y="${y}" width="283" height="29" rx="2"
          fill="${row % 2 ? "#f5e9cb" : "#fff7e5"}" stroke="#b7ad91" stroke-width="1.3"/>
        <rect x="${x + 4}" y="${y + 4}" width="29" height="21" rx="2" fill="#a83a35"/>
        <text x="${x + 18.5}" y="${y + 19}" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="#fff5db">${String(index + 1).padStart(2, "0")}</text>
        <text x="${x + 42}" y="${y + 13}" font-family="Arial,sans-serif"
          font-size="10.8" font-weight="bold" letter-spacing=".45" fill="#20353b">${titles[index][0]}</text>
        <text x="${x + 42}" y="${y + 24}" font-family="Arial,sans-serif"
          font-size="7.5" letter-spacing="1" fill="#7a6d55">${titles[index][1]}</text>`;
    }
  }
  lettering(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240">
      <rect width="600" height="240" fill="#dfd1ad"/>
      <rect x="0" y="0" width="600" height="25" fill="#233c43"/>
      <text x="300" y="18" text-anchor="middle" fill="#fff2ce"
        font-family="Arial,sans-serif" font-size="13" font-weight="bold"
        letter-spacing="5">YOUR FAVORITES • HIGH FIDELITY</text>
      ${cards}
      <text x="300" y="235" text-anchor="middle" fill="#746547"
        font-family="Arial,sans-serif" font-size="8" letter-spacing="3">PUSH LETTER • PUSH NUMBER • ENJOY THE MUSIC</text>
    </svg>`,
    0.564,
    0.224,
    [0, 0.936, 0.363],
    "printedSongCards",
    1024,
  );
  box(0.009, 0.219, 0.009, [0, 0.936, 0.367], C.chrome, "songCardCenterMullion");
  for (const s of [-1, 1]) {
    for (const y of [0.822, 1.048]) {
      frontDisc(0.004, 0.003, [s * 0.297, y, 0.356], C.silverDark, "selectionBezelScrew", 8);
    }
  }

  // Raised mechanical keys, each with its own engraved face.
  frontPlate(
    octagon(0.606, 0.095, 0.012),
    [0, 0.748, 0.343],
    0.033,
    C.chrome,
    "keyboardChromeHousing",
    0.004,
  );
  frontPlate(
    octagon(0.577, 0.072, 0.007),
    [0, 0.748, 0.364],
    0.009,
    C.navy,
    "keyboardDarkInset",
  );
  const keys = ["A", "B", "C", "D", "E", "1", "2", "3", "4", "5"];
  keys.forEach((key, i) => {
    const x = (i - 4.5) * 0.051;
    const selected = i === 2;
    box(0.043, 0.045, 0.028, [x, 0.741, 0.387], C.brassDark, "keySocket");
    box(
      0.038,
      0.039,
      0.029,
      [x, selected ? 0.738 : 0.743, selected ? 0.388 : 0.394],
      selected ? C.red : C.cream,
      `selectionKey${key}`,
    );
    lettering(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
        <text x="40" y="57" text-anchor="middle" font-family="Arial,sans-serif"
          font-weight="bold" font-size="48" fill="${selected ? "#fff7db" : "#20373e"}">${key}</text>
      </svg>`,
      0.028,
      0.028,
      [x, selected ? 0.738 : 0.743, selected ? 0.403 : 0.409],
      `keyEngraving${key}`,
      128,
    );
  });
  lettering(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 35">
      <text x="300" y="25" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="20" letter-spacing="6" fill="#f4e5bc">MAKE YOUR SELECTION</text>
    </svg>`,
    0.379,
    0.013,
    [0, 0.778, 0.370],
    "keyboardInstruction",
    512,
  );

  // Price plaque and a real recessed coin-slot shape.
  frontPlate(octagon(0.142, 0.033, 0.004), [-0.213, 0.683, 0.349], 0.012, C.gold, "pricePlaque");
  lettering(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 60">
      <rect width="320" height="60" rx="4" fill="#a33633"/>
      <text x="160" y="43" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="35" font-weight="bold" fill="#fff0c5">25¢ • 2 PLAYS</text>
    </svg>`,
    0.13,
    0.024,
    [-0.213, 0.683, 0.357],
    "pricePlaquePrint",
    384,
  );
  frontPlate(octagon(0.117, 0.033, 0.004), [0.228, 0.683, 0.351], 0.017, C.chrome, "coinSlotBezel");
  box(0.073, 0.005, 0.003, [0.226, 0.684, 0.362], C.black, "coinSlot");
  box(0.016, 0.016, 0.018, [0.272, 0.682, 0.364], C.gold, "coinReturnButton");

  // Chamfered lower speaker surround and woven dark acoustic cloth.
  frontPlate(
    octagon(0.629, 0.493, 0.033),
    [0, 0.425, 0.337],
    0.026,
    C.gold,
    "speakerOuterFrame",
    0.003,
  );
  frontPlate(
    octagon(0.603, 0.466, 0.027),
    [0, 0.425, 0.352],
    0.008,
    C.black,
    "speakerRecess",
  );
  lettering(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 400">
      <defs>
        <pattern id="weave" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#253033"/>
          <path d="M0 3H12M0 9H12" stroke="#47504a" stroke-width="1"/>
          <path d="M3 0V12M9 0V12" stroke="#161e21" stroke-width="2"/>
          <rect x="3" y="3" width="2" height="2" fill="#8f805c"/>
          <rect x="9" y="9" width="2" height="2" fill="#72694e"/>
        </pattern>
      </defs>
      <rect width="512" height="400" fill="url(#weave)"/>
    </svg>`,
    0.558,
    0.433,
    [0, 0.426, 0.357],
    "wovenSpeakerCloth",
    768,
  );

  // Actual brass diamond lattice, clipped to the grille's rectangular field.
  const xmin = -0.272;
  const xmax = 0.272;
  const ymin = 0.212;
  const ymax = 0.642;
  for (const slope of [-1.15, 1.15]) {
    for (let intercept = -0.12; intercept < 0.98; intercept += 0.044) {
      const candidates: [number, number][] = [];
      for (const x of [xmin, xmax]) {
        const y = slope * x + intercept;
        if (y >= ymin && y <= ymax) candidates.push([x, y]);
      }
      for (const y of [ymin, ymax]) {
        const x = (y - intercept) / slope;
        if (x > xmin && x < xmax) candidates.push([x, y]);
      }
      if (candidates.length === 2) {
        b.rod(
          [candidates[0][0], candidates[0][1], 0.362],
          [candidates[1][0], candidates[1][1], 0.362],
          0.0021,
          {
            color: C.brassDark,
            bone: root,
            sides: 4,
            smooth: false,
            name: "speakerDiamondWire",
          },
        );
      }
    }
  }

  // The heavier fan ribs sit in front of the mesh, converging at the bottom.
  for (const s of [-1, 1]) {
    for (const x of [0.085, 0.172, 0.255]) {
      b.sweep(
        bezier(
          [s * 0.015, 0.226, 0.376],
          [s * x * 0.22, 0.349, 0.376],
          [s * x * 0.81, 0.531, 0.376],
          [s * x, 0.641, 0.376],
        ),
        0.008,
        {
          color: C.goldLight,
          bone: root,
          sides: 6,
          smooth: false,
          caps: "flat",
          name: "artDecoFanRib",
        },
      );
    }
  }
  b.rod([0, 0.226, 0.376], [0, 0.641, 0.376], 0.0075, {
    color: C.chrome,
    bone: root,
    sides: 6,
    name: "speakerCenterSpine",
  });
  b.rod([-0.270, 0.644, 0.368], [0.270, 0.644, 0.368], 0.0055, {
    color: C.goldLight,
    bone: root,
    sides: 6,
    name: "grilleTopRail",
  });

  frontPlate(
    [[0, -0.076], [0.056, 0], [0, 0.076], [-0.056, 0]],
    [0, 0.425, 0.386],
    0.015,
    C.gold,
    "speakerDiamondMedallion",
    0.002,
  );
  frontPlate(
    [[0, -0.057], [0.039, 0], [0, 0.057], [-0.039, 0]],
    [0, 0.425, 0.396],
    0.005,
    C.navy,
    "diamondEnamelInset",
  );
  frontPlate(
    [
      [0, 0.033],
      [0.006, 0.009],
      [0.023, 0],
      [0.006, -0.009],
      [0, -0.033],
      [-0.006, -0.009],
      [-0.023, 0],
      [-0.006, 0.009],
    ],
    [0, 0.425, 0.401],
    0.004,
    C.white,
    "speakerFourPointStar",
  );
  frontDisc(0.027, 0.01, [0, 0.223, 0.375], C.gold, "fanFootMedallion", 12);
  frontDisc(0.018, 0.012, [0, 0.223, 0.379], C.chrome, "fanFootInset", 12);

  lettering(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 45">
      <text x="350" y="32" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="23" letter-spacing="6" fill="#f4e5bc">STEREOPHONIC • HIGH FIDELITY</text>
    </svg>`,
    0.440,
    0.023,
    [0, 0.166, 0.329],
    "lowerFidelityInscription",
    768,
  );

  // Side panels, vents and fine inlay make the cabinet read from every angle.
  for (const s of [-1, 1]) {
    box(0.012, 0.711, 0.397, [s * 0.466, 0.650, -0.014], C.gold, "sidePanelBorder");
    box(0.014, 0.688, 0.373, [s * 0.473, 0.650, -0.014], C.darkWine, "sidePanelEnamel");
    box(0.015, 0.651, 0.337, [s * 0.479, 0.650, -0.014], C.wine, "sidePanelCenter");
    box(0.005, 0.262, 0.247, [s * 0.489, 0.659, -0.031], C.black, "sideVentRecess");
    for (let i = 0; i < 9; i++) {
      box(
        0.009,
        0.012,
        0.243,
        [s * 0.493, 0.550 + i * 0.027, -0.031],
        C.woodLight,
        "sideVentLouver",
      );
    }
    for (const y of [0.365, 0.397, 0.933]) {
      b.rod(
        [s * 0.489, y, -0.175],
        [s * 0.489, y, 0.141],
        0.0024,
        {
          color: C.gold,
          bone: root,
          sides: 4,
          caps: "flat",
          name: "sideBrassInlay",
        },
      );
    }
    for (const y of [0.324, 0.976]) {
      for (const z of [-0.179, 0.151]) {
        b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 8), C.goldLight, {
          at: [s * 0.490, y, z],
          dir: [s, 0, 0],
          bone: root,
          name: "sidePanelScrew",
        });
      }
    }
  }

  // Rear seam, service door, ventilation and a small manufacturer's plate.
  b.sweep(archPath(0.452, 0.154, -0.298), 0.004, {
    color: C.brassDark,
    bone: root,
    sides: 6,
    caps: "flat",
    name: "rearCabinetSeam",
  });
  box(0.648, 0.799, 0.013, [0, 0.658, -0.306], C.darkWine, "rearServiceDoor");
  box(0.615, 0.766, 0.006, [0, 0.658, -0.315], C.wood, "rearDoorInset");
  for (const x of [-0.301, 0.301]) {
    for (const y of [0.295, 1.021]) {
      b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.003, 8), C.brassDark, {
        at: [x, y, -0.320],
        dir: [0, 0, -1],
        bone: root,
        name: "serviceDoorScrew",
      });
    }
  }
  for (let i = 0; i < 10; i++) {
    box(0.447, 0.009, 0.006, [0, 1.106 + i * 0.022, -0.302], C.black, "rearCoolingSlot");
  }
  box(0.197, 0.089, 0.004, [0, 0.877, -0.321], C.brassDark, "rearManufacturerPlate");
  b.part(new THREE.PlaneGeometry(0.182, 0.075), "#ffffff", {
    at: [0, 0.877, -0.324],
    dir: [0, 0, -1],
    axis: "z",
    bone: root,
    texture: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 165">
        <rect width="400" height="165" fill="#b99960"/>
        <rect x="8" y="8" width="384" height="149" fill="none" stroke="#453e32" stroke-width="3"/>
        <text x="200" y="48" text-anchor="middle" font-family="Georgia,serif"
          font-size="33" font-style="italic" fill="#263237">Stardust</text>
        <text x="200" y="80" text-anchor="middle" font-family="Arial,sans-serif"
          font-size="17" letter-spacing="3" fill="#263237">MODEL 57 • HIGH FIDELITY</text>
        <text x="200" y="111" text-anchor="middle" font-family="Arial,sans-serif"
          font-size="14" fill="#263237">SERIAL No. 0057-045 • 115 V AC</text>
        <text x="200" y="139" text-anchor="middle" font-family="Arial,sans-serif"
          font-size="12" letter-spacing="2" fill="#263237">STARDUST MUSIC COMPANY</text>
      </svg>`,
      { size: 512 },
    ),
    name: "manufacturerPlatePrint",
  });
  frontPlate(
    octagon(0.082, 0.034, 0.005),
    [0, 0.624, -0.323],
    0.008,
    C.silverDark,
    "rearDoorLatch",
  );
  box(0.037, 0.006, 0.012, [0, 0.624, -0.332], C.black, "rearLatchSlot");

  // Finish the shared flat-colour materials: enamel, polished trim and warm lamps.
  const result = b.root;
  result.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const hex = `#${material.color.getHexString()}`;
      if ([C.chrome, C.silverDark].includes(hex)) {
        material.metalness = 0.82;
        material.roughness = 0.27;
      } else if ([C.gold, C.goldLight, C.brassDark].includes(hex)) {
        material.metalness = 0.70;
        material.roughness = 0.34;
      } else if ([C.navy, C.wine, C.darkWine].includes(hex)) {
        material.metalness = 0.17;
        material.roughness = 0.35;
      } else if ([C.amber, C.orange].includes(hex)) {
        material.roughness = 0.32;
        material.emissive.set(C.amber);
        material.emissiveIntensity = 0.22;
      } else if ([C.teal, C.tealLight].includes(hex)) {
        material.roughness = 0.30;
        material.emissive.set(C.teal);
        material.emissiveIntensity = 0.17;
      } else if (hex === C.cream) {
        material.roughness = 0.43;
      } else if (hex === C.black || hex === C.grooves) {
        material.roughness = 0.40;
      }
    }
  });

  return result;
}
