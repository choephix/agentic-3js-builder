```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "arctic research outpost",
  description:
    "A stylized Firewatch-inspired arctic field station diorama with a warm cabin, observation tower, radio mast, solar panels, flags, supplies, snowbanks, and scattered ice rocks.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const C = {
    snow: "#f2f4ef",
    snowBlue: "#cbdbe1",
    snowShadow: "#9cb7c4",
    ice: "#82b7c8",
    iceDark: "#426f83",
    pine: "#1c3439",
    pineDark: "#102328",
    pineLight: "#38585a",
    red: "#c54d3f",
    redDark: "#71352f",
    orange: "#e07b42",
    ochre: "#d19b4d",
    cream: "#f4dca3",
    warm: "#f4a64d",
    glass: "#84c6d0",
    glassDark: "#315c68",
    metal: "#55656a",
    metalDark: "#293a40",
    black: "#17242a",
    rope: "#8b6747",
    wood: "#9a6848",
    woodDark: "#563b33",
    white: "#fffdf2",
  };

  const windowTexture = svg(
    `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="96" fill="#17323b"/>
      <rect x="7" y="7" width="114" height="82" rx="3" fill="#294d56" stroke="#102328" stroke-width="7"/>
      <path d="M64 8V88M8 48H120" stroke="#86c8cf" stroke-width="5"/>
      <path d="M16 16L53 43M76 53L111 79" stroke="#d8f3e8" stroke-opacity=".45" stroke-width="5"/>
      <rect x="13" y="13" width="43" height="29" fill="#8dc6c8" opacity=".42"/>
      <rect x="70" y="53" width="43" height="29" fill="#8dc6c8" opacity=".28"/>
    </svg>`,
    { size: 256 },
  );

  const warningTexture = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="128" rx="10" fill="#d19b4d"/>
      <rect x="8" y="8" width="240" height="112" rx="6" fill="none" stroke="#17242a" stroke-width="8"/>
      <path d="M38 95L64 35L90 95Z" fill="#c54d3f" stroke="#17242a" stroke-width="6"/>
      <path d="M64 54V76M64 85V90" stroke="#f4dca3" stroke-width="7"/>
      <text x="111" y="62" fill="#17242a" font-family="sans-serif" font-size="27" font-weight="bold">FIELD</text>
      <text x="111" y="94" fill="#17242a" font-family="sans-serif" font-size="27" font-weight="bold">STATION 07</text>
    </svg>`,
    { size: 256 },
  );

  const solarTexture = svg(
    `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="96" fill="#172d38" stroke="#9fbfc1" stroke-width="4"/>
      <path d="M32 0V96M64 0V96M96 0V96M0 24H128M0 48H128M0 72H128" stroke="#5c8993" stroke-width="2"/>
      <path d="M3 18L30 3M36 42L62 27M69 66L95 51M102 90L126 76" stroke="#b7dfe0" stroke-opacity=".35" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const mapTexture = svg(
    `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="120" fill="#d7bf91"/>
      <path d="M8 87C43 58 49 100 78 68S124 40 170 18" fill="none" stroke="#52726d" stroke-width="5"/>
      <path d="M12 23L63 31L92 13L151 35L167 94L110 84L74 109L22 94Z" fill="none" stroke="#9d7657" stroke-width="3"/>
      <circle cx="91" cy="61" r="8" fill="#c54d3f" stroke="#17242a" stroke-width="4"/>
      <path d="M91 10V35M91 87V112M40 61H67M115 61H142" stroke="#c54d3f" stroke-width="3"/>
      <text x="18" y="18" fill="#17242a" font-family="sans-serif" font-size="12" font-weight="bold">ICE SHELF / NORTH RIDGE</text>
    </svg>`,
    { size: 256 },
  );

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      texture,
      name,
    });

  const cyl = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    sides = 8,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      rotation,
      name,
    });

  const sphere = (
    name: string,
    radius: number,
    at: [number, number, number],
    color: string,
  ) =>
    b.part(new THREE.IcosahedronGeometry(radius, 1), color, {
      at,
      name,
      flat: true,
    });

  const cone = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    sides = 8,
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, sides), color, {
      at,
      name,
      flat: true,
    });

  // Broad, graphic snow island.
  box("snowIsland", [3.75, 0.16, 3.0], [0, 0.08, 0], C.snow);
  box("snowIslandShadow", [3.35, 0.055, 2.45], [0.05, 0.175, -0.08], C.snowBlue);

  // Low angular snow drifts around the footprint.
  for (const [i, p] of [
    [0, [-1.42, 0.27, 0.93]],
    [1, [1.43, 0.25, 0.68]],
    [2, [-1.3, 0.25, -0.92]],
    [3, [1.4, 0.24, -0.98]],
    [4, [0.35, 0.22, 1.22]],
  ] as Array<[number, [number, number, number]]>) {
    cone(`snowdrift${i}`, 0.34, 0.25, p, C.snow, 7);
  }

  // Ice rocks at the perimeter.
  const rocks: Array<[string, [number, number, number], [number, number, number], string]> = [
    ["iceRock0", [-1.72, 0.22, -0.98], [0.26, 0.22, 0.35], C.iceDark],
    ["iceRock1", [1.64, 0.25, -0.35], [0.31, 0.3, 0.22], C.ice],
    ["iceRock2", [-1.66, 0.2, 0.25], [0.21, 0.19, 0.28], C.ice],
    ["iceRock3", [1.72, 0.19, 1.05], [0.22, 0.18, 0.2], C.iceDark],
    ["iceRock4", [-0.9, 0.19, 1.28], [0.3, 0.17, 0.21], C.snowShadow],
  ];
  for (const [name, at, scale, color] of rocks) {
    const p = sphere(name, 1, at, color);
    p.scale.set(...scale);
  }

  // Timber cabin: dark body, bright front, and chunky raised foundation.
  box("cabinFoundation", [1.48, 0.16, 0.96], [-0.28, 0.27, 0.28], C.woodDark);
  box("cabinBody", [1.42, 0.9, 0.9], [-0.28, 0.78, 0.28], C.pine);
  box("cabinFrontPanel", [1.34, 0.78, 0.035], [-0.28, 0.79, 0.748], C.pineLight);
  box("cabinBackBand", [1.48, 0.12, 0.95], [-0.28, 1.2, 0.28], C.redDark);

  // Sloped graphic roof, two overlapping planes.
  box("roofLeft", [0.86, 0.12, 1.08], [-0.72, 1.35, 0.28], C.red, [0, 0, -18]);
  box("roofRight", [0.86, 0.12, 1.08], [0.16, 1.35, 0.28], C.red, [0, 0, 18]);
  box("roofRidge", [0.08, 0.12, 1.13], [-0.28, 1.5, 0.28], C.redDark);
  box("snowRoofLeft", [0.8, 0.075, 1.08], [-0.72, 1.425, 0.28], C.snow, [0, 0, -18]);
  box("snowRoofRight", [0.8, 0.075, 1.08], [0.16, 1.425, 0.28], C.snow, [0, 0, 18]);

  // Cabin front windows, door, latch and warning placard.
  box("windowLeftFrame", [0.37, 0.38, 0.045], [-0.67, 0.91, 0.78], C.metalDark);
  box("windowLeft", [0.31, 0.32, 0.012], [-0.67, 0.91, 0.81], C.glass, undefined, windowTexture);
  box("windowRightFrame", [0.37, 0.38, 0.045], [0.1, 0.91, 0.78], C.metalDark);
  box("windowRight", [0.31, 0.32, 0.012], [0.1, 0.91, 0.81], C.glass, undefined, windowTexture);
  box("frontDoor", [0.32, 0.66, 0.07], [-0.28, 0.68, 0.81], C.wood);
  box("doorInset", [0.24, 0.46, 0.018], [-0.28, 0.7, 0.852], C.woodDark);
  cyl("doorHandle", 0.025, 0.03, [-0.17, 0.72, 0.875], C.ochre, 8, [90, 0, 0]);
  box("warningSign", [0.5, 0.245, 0.015], [-0.28, 1.14, 0.86], C.ochre, undefined, warningTexture);

  // Horizontal timber courses.
  for (let i = 0; i < 5; i++) {
    box(`cabinCourse${i}`, [1.44, 0.025, 0.025], [-0.28, 0.42 + i * 0.19, 0.82], C.woodDark);
  }

  // Chimney and a warm red cap.
  box("chimney", [0.18, 0.5, 0.18], [0.22, 1.66, 0.17], C.metalDark);
  box("chimneyCap", [0.27, 0.08, 0.27], [0.22, 1.92, 0.17], C.red);
  for (let i = 0; i < 3; i++) {
    box(`chimneyBand${i}`, [0.2, 0.025, 0.2], [0.22, 1.55 + i * 0.14, 0.17], C.metal);
  }

  // Warm emergency lamp above the front door.
  box("lampHousing", [0.22, 0.16, 0.13], [-0.28, 1.26, 0.89], C.metalDark);
  const lamp = sphere("lampGlow", 0.075, [-0.28, 1.2, 0.98], C.warm);
  lamp.scale.set(1, 1.2, 0.5);

  // Rear observation tower, clearly taller than the cabin.
  const towerX = 0.82;
  const towerZ = -0.72;
  const towerLegs: Array<[number, number]> = [
    [towerX - 0.32, towerZ - 0.28],
    [towerX + 0.32, towerZ - 0.28],
    [towerX - 0.32, towerZ + 0.28],
    [towerX + 0.32, towerZ + 0.28],
  ];
  for (let i = 0; i < towerLegs.length; i++) {
    const [x, z] = towerLegs[i];
    b.rod([x, 0.22, z], [x, 1.72, z], 0.045, { color: C.woodDark, name: `towerLeg${i}` });
  }
  b.rod([towerX - 0.32, 0.45, towerZ - 0.28], [towerX + 0.32, 0.45, towerZ - 0.28], 0.028, { color: C.wood, name: "towerBraceFrontLow" });
  b.rod([towerX - 0.32, 0.95, towerZ - 0.28], [towerX + 0.32, 1.35, towerZ - 0.28], 0.026, { color: C.wood, name: "towerBraceFrontA" });
  b.rod([towerX + 0.32, 0.95, towerZ - 0.28], [towerX - 0.32, 1.35, towerZ - 0.28], 0.026, { color: C.wood, name: "towerBraceFrontB" });
  b.rod([towerX - 0.32, 0.95, towerZ + 0.28], [towerX + 0.32, 1.35, towerZ + 0.28], 0.026, { color: C.wood, name: "towerBraceBackA" });
  b.rod([towerX + 0.32, 0.95, towerZ + 0.28], [towerX - 0.32, 1.35, towerZ + 0.28], 0.026, { color: C.wood, name: "towerBraceBackB" });
  box("towerPlatform", [0.86, 0.12, 0.73], [towerX, 1.72, towerZ], C.woodDark);
  box("towerCabin", [0.66, 0.38, 0.55], [towerX, 1.96, towerZ], C.pineLight);
  box("towerCabinFront", [0.57, 0.27, 0.035], [towerX, 1.97, towerZ + 0.3], C.glassDark);
  box("towerWindow", [0.43, 0.19, 0.012], [towerX, 1.98, towerZ + 0.325], C.glass, undefined, windowTexture);
  box("towerRoof", [0.76, 0.1, 0.66], [towerX, 2.2, towerZ], C.red, [0, 0, 0]);
  box("towerSnow", [0.7, 0.045, 0.63], [towerX, 2.265, towerZ], C.snow);

  // Radio mast, top beacon and two antenna arms.
  b.rod([towerX, 2.23, towerZ], [towerX, 2.93, towerZ], 0.025, { color: C.metalDark, name: "radioMast" });
  b.rod([towerX - 0.23, 2.65, towerZ], [towerX + 0.23, 2.65, towerZ], 0.014, { color: C.metal, name: "radioCrossbar" });
  b.rod([towerX, 2.65, towerZ], [towerX, 2.65, towerZ + 0.25], 0.012, { color: C.metal, name: "radioRearArm" });
  sphere("radioBeacon", 0.052, [towerX, 2.96, towerZ], C.orange);
  box("mastGuyWireFront", [0.012, 0.012, 1.18], [towerX, 1.58, towerZ + 0.54], C.rope, [35, 0, 0]);
  box("mastGuyWireSide", [1.1, 0.012, 0.012], [towerX - 0.55, 1.58, towerZ], C.rope, [0, 0, -12]);

  // Solar array on the right of the station.
  box("solarRack", [0.78, 0.1, 0.58], [1.28, 0.72, 0.18], C.metalDark, [0, -22, 0]);
  box("solarPanel", [0.72, 0.025, 0.52], [1.28, 0.81, 0.2], C.glassDark, [0, -22, 0], solarTexture);
  for (let i = 0; i < 3; i++) {
    b.rod([0.96 + i * 0.32, 0.39, 0.2], [0.96 + i * 0.32, 0.71, 0.2], 0.018, { color: C.metal, name: `solarSupport${i}` });
  }
  box("solarSnowLip", [0.74, 0.035, 0.04], [1.28, 0.97, 0.43], C.snow, [0, -22, 0]);

  // A-frame sled and fuel canisters in front-right.
  b.rod([0.83, 0.23, 0.72], [1.35, 0.23, 1.05], 0.035, { color: C.wood, name: "sledRunnerL" });
  b.rod([1.08, 0.23, 0.72], [1.6, 0.23, 1.05], 0.035, { color: C.wood, name: "sledRunnerR" });
  b.rod([0.83, 0.23, 0.72], [1.08, 0.23, 0.72], 0.035, { color: C.woodDark, name: "sledFrontCrossbar" });
  b.rod([1.35, 0.23, 1.05], [1.6, 0.23, 1.05], 0.035, { color: C.woodDark, name: "sledRearCrossbar" });
  box("sledCargo", [0.62, 0.25, 0.42], [1.2, 0.48, 0.88], C.red);
  box("sledCargoBand", [0.65, 0.06, 0.45], [1.2, 0.62, 0.88], C.ochre);
  cyl("fuelCan0", 0.11, 0.3, [1.05, 0.77, 0.88], C.redDark, 8);
  cyl("fuelCan1", 0.11, 0.3, [1.35, 0.77, 0.88], C.orange, 8);
  box("fuelCap0", [0.07, 0.035, 0.07], [1.05, 0.94, 0.88], C.metalDark);
  box("fuelCap1", [0.07, 0.035, 0.07], [1.35, 0.94, 0.88], C.metalDark);

  // Generator crate and stacked supply boxes beside the cabin.
  box("generatorCrate", [0.5, 0.4, 0.45], [-1.2, 0.48, 0.3], C.wood);
  box("generatorFace", [0.34, 0.22, 0.018], [-1.2, 0.48, 0.535], C.metalDark);
  cyl("generatorFan", 0.075, 0.025, [-1.2, 0.48, 0.56], C.metal, 10, [90, 0, 0]);
  for (let i = 0; i < 4; i++) {
    box(`crateSlat${i}`, [0.04, 0.42, 0.46], [-1.38 + i * 0.12, 0.48, 0.31], C.woodDark);
  }
  box("supplyBoxA", [0.36, 0.3, 0.32], [-1.0, 0.38, 0.85], C.ochre);
  box("supplyBoxB", [0.28, 0.25, 0.3], [-0.86, 0.64, 0.86], C.red);
  box("supplyLidA", [0.39, 0.035, 0.35], [-1.0, 0.55, 0.85], C.woodDark);
  box("supplyLidB", [0.31, 0.035, 0.32], [-0.86, 0.78, 0.86], C.woodDark);

  // Snow shoes / plank walkway leading to the front door.
  for (let i = 0; i < 5; i++) {
    box(`walkPlank${i}`, [0.48, 0.045, 0.18], [-0.28, 0.23, 0.9 + i * 0.19], C.woodDark, [0, (i % 2 ? 4 : -3), 0]);
  }

  // Flag pole and triangular orange-red expedition flag.
  b.rod([-1.4, 0.2, 1.12], [-1.4, 1.72, 1.12], 0.018, { color: C.metalDark, name: "flagPole" });
  b.extrude(
    [
      [0, 0],
      [0.52, -0.04],
      [0.1, 0.22],
      [0.52, 0.38],
      [0, 0.42],
    ],
    {
      at: [-1.39, 1.62, 1.12],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: C.red,
      name: "expeditionFlag",
    },
  );
  box("flagSnowCap", [0.05, 0.08, 0.05], [-1.4, 1.77, 1.12], C.snow);

  // A second small signal pennant on the tower.
  b.rod([1.35, 1.7, -0.72], [1.35, 2.35, -0.72], 0.012, { color: C.metal, name: "signalPole" });
  b.extrude(
    [
      [0, 0],
      [0.34, -0.03],
      [0.09, 0.16],
      [0, 0.25],
    ],
    {
      at: [1.35, 2.27, -0.72],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.01,
      color: C.ochre,
      name: "signalPennant",
    },
  );

  // Drum-like water tanks behind the cabin.
  for (let i = 0; i < 2; i++) {
    cyl(`waterTank${i}`, 0.16, 0.5, [-0.96 + i * 0.34, 0.54, -0.45], C.metalDark, 10);
    cyl(`waterTankTop${i}`, 0.11, 0.035, [-0.96 + i * 0.34, 0.81, -0.45], C.ice, 10);
    box(`waterTankBand${i}`, [0.35, 0.04, 0.04], [-0.96 + i * 0.34, 0.55, -0.61], C.metal);
  }

  // Snow piles caught on equipment and a few icicles under the roof edge.
  for (let i = 0; i < 7; i++) {
    const x = -0.88 + i * 0.2;
    cone(`roofIcicle${i}`, 0.025 + (i % 2) * 0.012, 0.11 + (i % 3) * 0.045, [x, 1.27, 0.83], C.ice, 6);
  }
  for (let i = 0; i < 4; i++) {
    cone(`platformIcicle${i}`, 0.022, 0.1 + i * 0.025, [0.54 + i * 0.18, 1.67, -1.08], C.ice, 6);
  }

  // Small geometric footsteps in the snow, a graphic trail toward the station.
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 0.11 : -0.11;
    box(`footprint${i}`, [0.11, 0.012, 0.19], [-0.28 + side, 0.19, 1.45 + i * 0.15], C.snowShadow, [0, i % 2 ? 8 : -8, 0]);
  }

  // A few dark poles mark the safe route around the outpost.
  for (let i = 0; i < 5; i++) {
    const x = -1.62 + i * 0.8;
    const z = 1.35 + (i % 2) * 0.12;
    cyl(`routeMarker${i}`, 0.018, 0.42, [x, 0.4, z], C.red, 6);
    box(`routeMarkerTop${i}`, [0.08, 0.09, 0.08], [x, 0.65, z], C.white);
  }

  // Antenna dish silhouette on the cabin's rear corner.
  cyl("dishStem", 0.018, 0.36, [0.47, 1.63, -0.13], C.metalDark, 7);
  const dish = b.part(new THREE.CircleGeometry(0.22, 12), C.metal, {
    at: [0.47, 1.8, -0.16],
    dir: [0, 0.55, 0.83],
    axis: "z",
    name: "radioDish",
  });
  dish.scale.set(1, 0.76, 1);
  cyl("dishReceiver", 0.025, 0.22, [0.47, 1.98, 0.02], C.metalDark, 7, [35, 0, 0]);

  return b.root;
}
```