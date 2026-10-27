import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { metal, gearGeometry } from "../../../../kits/clockwork";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: an oversized faceted sword fused with a revolver drum, trigger assembly, mechanical guard, blue fuller, gold fittings, and engraved hardware.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = "#252d3a";
  const STEEL_LIGHT = "#596678";
  const STEEL_DARK = "#111722";
  const BLUE = "#1b6eaa";
  const BLUE_LIGHT = "#4bd1ef";
  const GOLD = "#d99a32";
  const GOLD_LIGHT = "#ffd36a";
  const RED = "#9e2638";
  const GRIP = "#17151b";
  const GRIP_HI = "#3b3340";
  const INK = "#090b11";
  const GLASS = "#7ae9ff";

  const brass = metal("brass", { polish: 0.5, tarnish: 0.12 });
  const gunmetal = metal("steel", { polish: 0.28, tarnish: 0.22 });
  const blueSteel = metal("blued", { polish: 0.42, tarnish: 0.12 });

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    options: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      ...options,
    });

  const cyl = (
    name: string,
    radius: number,
    depth: number,
    at: [number, number, number],
    color: any,
    sides = 10,
    options: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, sides), color, {
      at,
      dir: [0, 0, 1],
      name,
      ...options,
    });

  const sphere = (
    name: string,
    radius: number,
    at: [number, number, number],
    color: any,
    options: any = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      name,
      ...options,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    options: any = {},
  ) => b.rod(a, c, radius, color, { name, ...options });

  const plate = (
    name: string,
    outline: any[],
    at: [number, number, number],
    thickness: number,
    color: any,
    x: [number, number, number] = [1, 0, 0],
    y: [number, number, number] = [0, 1, 0],
    options: any = {},
  ) =>
    b.extrude(outline, {
      at,
      x,
      y,
      thickness,
      bevel: thickness * 0.22,
      smoothing: 0,
      color,
      name,
      ...options,
    });

  // -----------------------------------------------------------------------------------------------
  // Main blade: broad, angular, gunmetal greatsword silhouette.

  const bladeOutline = [
    [-0.105, 0],
    [-0.145, 0.13],
    [-0.165, 0.72],
    [-0.145, 0.94],
    [-0.075, 1.23],
    [0, 1.48, "sharp"],
    [0.075, 1.23],
    [0.145, 0.94],
    [0.165, 0.72],
    [0.105, 0],
  ];

  plate("bladeCore", bladeOutline, [0, 0.66, 0], 0.074, gunmetal);

  // Dark rear bevel and bright side bevels make the blade read as forged and faceted.
  plate(
    "bladeLeftBevel",
    [
      [-0.105, 0.02],
      [-0.145, 0.15],
      [-0.155, 0.71],
      [-0.13, 0.92],
      [-0.062, 1.23],
      [0, 1.43],
      [-0.03, 1.18],
      [-0.085, 0.9],
      [-0.095, 0.12],
    ],
    [-0.002, 0.66, 0.041],
    0.009,
    STEEL_LIGHT,
  );

  plate(
    "bladeRightBevel",
    [
      [0.105, 0.02],
      [0.145, 0.15],
      [0.155, 0.71],
      [0.13, 0.92],
      [0.062, 1.23],
      [0, 1.43],
      [0.03, 1.18],
      [0.085, 0.9],
      [0.095, 0.12],
    ],
    [0.002, 0.66, 0.043],
    0.009,
    STEEL_DARK,
  );

  // Long blue fuller / magical channel.
  plate(
    "blueFuller",
    [
      [-0.035, 0.08],
      [-0.058, 0.27],
      [-0.062, 0.78],
      [-0.035, 1.11],
      [0, 1.34, "sharp"],
      [0.035, 1.11],
      [0.062, 0.78],
      [0.058, 0.27],
      [0.035, 0.08],
    ],
    [0, 0.66, 0.049],
    0.012,
    BLUE,
  );

  plate(
    "fullerHighlight",
    [
      [-0.012, 0.15],
      [-0.019, 0.35],
      [-0.018, 0.85],
      [0, 1.22, "sharp"],
      [0.013, 0.86],
      [0.012, 0.35],
    ],
    [0, 0.66, 0.058],
    0.006,
    BLUE_LIGHT,
  );

  // Small segmented glyphs in the fuller.
  for (let i = 0; i < 7; i++) {
    const y = 0.84 + i * 0.07;
    box(`fullerRune${i}`, [0.026, 0.012, 0.008], [0, y, 0.064], i % 2 ? BLUE_LIGHT : GOLD, {
      rotation: [0, 0, i % 2 ? 18 : -18],
    });
  }

  // Blade tip crown and tiny central point cap.
  plate(
    "tipCrown",
    [
      [-0.052, 1.2],
      [-0.025, 1.38],
      [0, 1.49, "sharp"],
      [0.025, 1.38],
      [0.052, 1.2],
      [0.018, 1.31],
      [0, 1.43, "sharp"],
      [-0.018, 1.31],
    ],
    [0, 0.66, 0.065],
    0.008,
    GOLD,
  );

  // -----------------------------------------------------------------------------------------------
  // Hilt and crossguard.

  box("guardSpine", [0.52, 0.105, 0.11], [0, 0.62, 0.005], STEEL_DARK);
  box("guardFace", [0.46, 0.062, 0.125], [0, 0.655, 0.058], gunmetal);

  plate(
    "guardWingL",
    [
      [0, 0],
      [0.16, 0.015],
      [0.245, 0.095],
      [0.22, 0.135],
      [0.075, 0.09],
    ],
    [-0.02, 0.595, 0.06],
    0.025,
    STEEL_LIGHT,
  );
  plate(
    "guardWingR",
    [
      [0, 0],
      [-0.16, 0.015],
      [-0.245, 0.095],
      [-0.22, 0.135],
      [-0.075, 0.09],
    ],
    [0.02, 0.595, 0.06],
    0.025,
    STEEL_DARK,
  );

  // Gold guard inlay and end caps.
  box("guardGoldInlay", [0.26, 0.018, 0.014], [0, 0.69, 0.126], GOLD);
  for (const s of [-1, 1]) {
    cyl(`guardBolt${s}`, 0.027, 0.018, [s * 0.19, 0.65, 0.13], GOLD_LIGHT, 8);
    sphere(`guardStud${s}`, 0.022, [s * 0.225, 0.607, 0.075], BLUE_LIGHT);
  }

  // -----------------------------------------------------------------------------------------------
  // Revolver drum seated at the front of the guard.

  cyl("revolverDrum", 0.145, 0.115, [0, 0.59, 0.135], STEEL_DARK, 12);
  cyl("drumFrontPlate", 0.132, 0.022, [0, 0.59, 0.205], gunmetal, 12);
  cyl("drumGoldRing", 0.108, 0.012, [0, 0.59, 0.222], GOLD, 12);
  cyl("drumHub", 0.042, 0.03, [0, 0.59, 0.238], BLUE, 10);
  cyl("drumHubPin", 0.018, 0.038, [0, 0.59, 0.26], GOLD_LIGHT, 8);

  // Six chamber mouths, rotated around the axle in the x/y plane.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.sin(a) * 0.082;
    const y = 0.59 + Math.cos(a) * 0.082;
    cyl(`chamber${i}`, 0.025, 0.019, [x, y, 0.238], INK, 8);
    cyl(`chamberRim${i}`, 0.032, 0.009, [x, y, 0.229], GOLD, 8);
    sphere(`chamberGlow${i}`, 0.009, [x, y, 0.252], i === 0 ? RED : STEEL_LIGHT);
  }

  // A toothed decorative ring behind the drum.
  const gear = {
    teeth: 12,
    module: 0.012,
    thickness: 0.035,
    bore: 0.055,
    spokes: 0,
  };
  b.part(gearGeometry(gear), brass, {
    at: [0, 0.59, 0.073],
    dir: [0, 0, 1],
    name: "brassDrumGear",
  });

  // -----------------------------------------------------------------------------------------------
  // Gun barrel / blade shoulder. It visually locks the sword and firearm together.

  rod("barrelTop", [-0.09, 0.77, 0.09], [0.09, 1.22, 0.09], 0.038, STEEL_DARK);
  rod("barrelTopHighlight", [-0.045, 0.8, 0.125], [0.045, 1.19, 0.125], 0.012, BLUE_LIGHT);
  cyl("muzzleCollar", 0.078, 0.07, [0, 1.22, 0.09], GOLD, 10);
  cyl("muzzleDark", 0.051, 0.084, [0, 1.22, 0.132], INK, 10);
  cyl("muzzleInner", 0.027, 0.091, [0, 1.22, 0.181], BLUE_LIGHT, 8);

  // Side locking plates.
  for (const s of [-1, 1]) {
    plate(
      `shoulderPlate${s}`,
      [
        [0, 0],
        [s * 0.08, 0.01],
        [s * 0.125, 0.08],
        [s * 0.095, 0.18],
        [s * 0.025, 0.21],
      ],
      [0, 0.69, s * 0.035],
      0.018,
      s > 0 ? STEEL_LIGHT : STEEL_DARK,
      [1, 0, 0],
      [0, 1, 0],
    );
    cyl(`shoulderRivet${s}`, 0.018, 0.02, [s * 0.083, 0.79, s * 0.065], GOLD_LIGHT, 8);
    cyl(`shoulderRivetLower${s}`, 0.014, 0.02, [s * 0.045, 0.72, s * 0.067], BLUE_LIGHT, 8);
  }

  // -----------------------------------------------------------------------------------------------
  // Grip, pommel, trigger and trigger guard.

  b.capsule([0, 0.53, -0.035], [0, 0.12, -0.16], 0.082, GRIP, {
    name: "angledGrip",
    sides: 8,
  });

  // Grip face panels and a bright diagonal wrap.
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = 0;
    const y = 0.48 - t * 0.31;
    const z = -0.09 - t * 0.07;
    box(`gripPanel${i}`, [0.115, 0.032, 0.018], [x, y, z + 0.073], i % 2 ? GRIP_HI : GRIP, {
      rotation: [0, 0, -8],
    });
  }

  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    rod(
      `gripWrap${i}`,
      [-0.075, 0.47 - t * 0.29, -0.09 - t * 0.07],
      [0.075, 0.44 - t * 0.29, -0.095 - t * 0.07],
      0.009,
      i === 2 ? GOLD : BLUE,
    );
  }

  // Trigger guard as a squared, angular loop.
  rod("triggerGuardTop", [-0.095, 0.54, 0.075], [0.095, 0.54, 0.075], 0.018, GOLD);
  rod("triggerGuardLeft", [-0.095, 0.54, 0.075], [-0.075, 0.33, 0.055], 0.018, GOLD);
  rod("triggerGuardRight", [0.095, 0.54, 0.075], [0.075, 0.33, 0.055], 0.018, GOLD);
  rod("triggerGuardBottom", [-0.075, 0.33, 0.055], [0.075, 0.33, 0.055], 0.018, GOLD);

  // Trigger and trigger pivot.
  rod("trigger", [0, 0.515, 0.112], [0, 0.405, 0.106], 0.018, RED);
  cyl("triggerPivot", 0.027, 0.027, [0, 0.515, 0.13], GOLD_LIGHT, 8);
  cyl("triggerTip", 0.022, 0.025, [0, 0.405, 0.12], BLUE_LIGHT, 8);

  // Pommel with jewel and flared end.
  plate(
    "pommelFlare",
    [
      [-0.08, 0],
      [0.08, 0],
      [0.11, 0.055],
      [0.075, 0.11],
      [-0.075, 0.11],
      [-0.11, 0.055],
    ],
    [0, 0.04, -0.16],
    0.09,
    STEEL_DARK,
  );
  cyl("pommelGoldBand", 0.088, 0.024, [0, 0.082, -0.16], GOLD, 10);
  sphere("pommelJewel", 0.044, [0, 0.022, -0.215], RED);
  sphere("pommelJewelGlow", 0.018, [0, 0.03, -0.255], GLASS);

  // -----------------------------------------------------------------------------------------------
  // Mechanical side rails, rivets and fantasy ornament.

  for (const s of [-1, 1]) {
    rod(`sideRail${s}`, [s * 0.19, 0.72, 0.015], [s * 0.18, 1.08, 0.02], 0.014, GOLD);
    rod(`sideRailBlue${s}`, [s * 0.2, 0.76, 0.035], [s * 0.19, 1.03, 0.035], 0.008, BLUE_LIGHT);

    for (let i = 0; i < 5; i++) {
      const y = 0.76 + i * 0.075;
      cyl(`railBolt${s}_${i}`, 0.016, 0.019, [s * 0.177, y, 0.044], GOLD_LIGHT, 8);
    }
  }

  // Repeating blade spine notches.
  for (let i = 0; i < 8; i++) {
    const y = 0.76 + i * 0.075;
    box(`bladeNotch${i}`, [0.21, 0.018, 0.012], [0, y, -0.047], i % 2 ? STEEL_LIGHT : BLUE, {
      rotation: [0, 0, i % 2 ? 8 : -8],
    });
  }

  // Three large emblem plates on the front: a Final Fantasy-like angular crest.
  plate(
    "crestUpper",
    [
      [-0.045, 0],
      [0.045, 0],
      [0.07, 0.05],
      [0, 0.14, "sharp"],
      [-0.07, 0.05],
    ],
    [0, 0.83, 0.073],
    0.014,
    GOLD,
  );
  plate(
    "crestMiddle",
    [
      [-0.03, 0],
      [0.03, 0],
      [0.065, 0.035],
      [0, 0.09, "sharp"],
      [-0.065, 0.035],
    ],
    [0, 0.98, 0.074],
    0.014,
    BLUE_LIGHT,
  );
  plate(
    "crestLower",
    [
      [-0.034, 0],
      [0.034, 0],
      [0.052, 0.03],
      [0, 0.075, "sharp"],
      [-0.052, 0.03],
    ],
    [0, 1.095, 0.074],
    0.014,
    RED,
  );

  // Fine edge studs along the guard and blade root.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      sphere(
        `edgeStud${s}_${i}`,
        0.012,
        [s * (0.105 + (i % 2) * 0.018), 0.72 + i * 0.045, 0.064],
        i % 2 ? GOLD : BLUE_LIGHT,
      );
    }
  }

  // A short rear counterweight gives the silhouette the characteristic firearm heft.
  box("rearCounterweight", [0.22, 0.15, 0.12], [0, 0.48, -0.11], STEEL_DARK);
  plate(
    "counterweightTrim",
    [
      [-0.09, 0],
      [0.09, 0],
      [0.115, 0.045],
      [0.065, 0.11],
      [-0.065, 0.11],
      [-0.115, 0.045],
    ],
    [0, 0.41, -0.178],
    0.016,
    GOLD,
  );
  cyl("counterweightPin", 0.026, 0.022, [0, 0.45, -0.245], BLUE_LIGHT, 8);

  // Floating blade-edge glints, kept as chunky geometric facets rather than smooth decoration.
  for (let i = 0; i < 5; i++) {
    const y = 0.9 + i * 0.1;
    plate(
      `edgeGlint${i}`,
      [
        [0, 0],
        [0.018, 0.012],
        [0.012, 0.055],
        [0, 0.074],
        [-0.008, 0.038],
      ],
      [0.14, y, 0.049],
      0.006,
      i % 2 ? GOLD_LIGHT : STEEL_LIGHT,
    );
  }

  return b.root;
}
