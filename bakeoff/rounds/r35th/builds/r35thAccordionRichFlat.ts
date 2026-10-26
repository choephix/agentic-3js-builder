import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented low-poly piano accordion with nacre shell panels, black bellows, pearl keys, bass buttons, brass trim, and Italian marquetry.",
};

type P = [number, number, number];
type R = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const SHELL = "#eee3c7";
  const SHELL_LIGHT = "#fff6df";
  const SHELL_SHADOW = "#cbbfa9";
  const PEARL_MINT = "#9ed7cd";
  const PEARL_AQUA = "#64b8b1";
  const PEARL_ROSE = "#e7b6b3";
  const PEARL_LILAC = "#cdb9db";
  const PEARL_BLUE = "#9fbcd2";
  const PEARL_CREAM = "#f6d79d";
  const INK = "#17151d";
  const INK_WARM = "#2b202c";
  const BELLOWS = "#211c26";
  const BELLOWS_RED = "#492b38";
  const BELLOWS_HIGHLIGHT = "#76505a";
  const BRASS = "#c49345";
  const BRASS_LIGHT = "#e5c477";
  const BRASS_DARK = "#694719";
  const KEY_WHITE = "#fff4d4";
  const KEY_SHADOW = "#cfc3a9";
  const KEY_BLACK = "#17131b";
  const BUTTON = "#d8c7dd";
  const BUTTON_DARK = "#6f536f";
  const STRAP = "#30232c";
  const STRAP_HIGHLIGHT = "#5c3f4a";

  let serial = 0;
  const name = (prefix: string) => `${prefix}_${serial++}`;

  const point = (x: number, y: number, z: number): P => [x, y, z];
  const rot = (x = 0, y = 0, z = 0): R => [x, y, z];

  function box(
    size: P,
    at: P,
    color: string,
    rotation: R = [0, 0, 0],
    prefix = "box",
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      flat: true,
      name: name(prefix),
    });
  }

  function roundedBox(
    size: P,
    at: P,
    color: string,
    rotation: R = [0, 0, 0],
    prefix = "roundedBox",
  ) {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    return b.part(g, color, {
      at,
      rotation,
      flat: true,
      name: name(prefix),
    });
  }

  function cylinder(
    radius: number,
    height: number,
    at: P,
    color: string,
    segments = 12,
    prefix = "cylinder",
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      {
        at,
        dir: [0, 0, 1],
        flat: true,
        name: name(prefix),
      },
    );
  }

  function sphere(
    radius: number,
    at: P,
    color: string,
    segments = 10,
    rings = 6,
    prefix = "sphere",
  ) {
    return b.part(
      new THREE.SphereGeometry(radius, segments, rings),
      color,
      {
        at,
        flat: true,
        name: name(prefix),
      },
    );
  }

  function rod(
    a: P,
    c: P,
    radius: number,
    color: string,
    prefix = "rod",
  ) {
    return b.rod(a, c, radius, { color, name: name(prefix) });
  }

  function frontPlate(
    size: P,
    x: number,
    y: number,
    z: number,
    color: string,
    prefix = "frontPlate",
  ) {
    return box(size, point(x, y, z), color, rot(0, 0, 0), prefix);
  }

  const diamondOutline = (s: number): [number, number, "sharp"][] => [
    [0, -s, "sharp"],
    [s, 0, "sharp"],
    [0, s, "sharp"],
    [-s, 0, "sharp"],
  ];

  const octagonOutline = (sx: number, sy: number): [number, number, "sharp"][] => [
    [-sx * 0.55, -sy, "sharp"],
    [sx * 0.55, -sy, "sharp"],
    [sx, -sy * 0.55, "sharp"],
    [sx, sy * 0.55, "sharp"],
    [sx * 0.55, sy, "sharp"],
    [-sx * 0.55, sy, "sharp"],
    [-sx, sy * 0.55, "sharp"],
    [-sx, -sy * 0.55, "sharp"],
  ];

  function frontDiamond(
    x: number,
    y: number,
    z: number,
    size: number,
    color: string,
    prefix = "diamond",
  ) {
    const border = b.extrude(diamondOutline(size), {
      at: point(x, y, z),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      color: BRASS_DARK,
      name: name(`${prefix}_border`),
    });

    b.extrude(diamondOutline(size * 0.72), {
      at: border.local([0, 0, 0.008]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      color,
      name: name(`${prefix}_inlay`),
    });

    b.extrude(
      [
        [0, -size * 0.24, "sharp"],
        [size * 0.24, 0, "sharp"],
        [0, size * 0.24, "sharp"],
        [-size * 0.24, 0, "sharp"],
      ],
      {
        at: border.local([0, 0, 0.014]),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        color: SHELL_LIGHT,
        name: name(`${prefix}_glint`),
      },
    );
  }

  function frontOctagon(
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    color: string,
    prefix = "octagon",
  ) {
    const outer = b.extrude(octagonOutline(sx, sy), {
      at: point(x, y, z),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: BRASS_DARK,
      name: name(`${prefix}_outer`),
    });
    b.extrude(octagonOutline(sx * 0.82, sy * 0.82), {
      at: outer.local([0, 0, 0.008]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      color,
      name: name(`${prefix}_inner`),
    });
  }

  function shellStud(
    x: number,
    y: number,
    z: number,
    radius: number,
    color: string,
    prefix = "stud",
  ) {
    cylinder(radius * 1.35, 0.008, point(x, y, z), BRASS_DARK, 10, `${prefix}_rim`);
    cylinder(radius, 0.011, point(x, y, z + 0.006), color, 10, `${prefix}_pearl`);
    sphere(radius * 0.4, point(x - radius * 0.25, y + radius * 0.25, z + 0.014), SHELL_LIGHT, 7, 4, `${prefix}_shine`);
  }

  function cornerRivet(x: number, y: number, z: number, prefix = "rivet") {
    cylinder(0.008, 0.009, point(x, y, z), BRASS_DARK, 8, `${prefix}_dark`);
    sphere(0.006, point(x, y, z + 0.007), BRASS_LIGHT, 7, 4, `${prefix}_head`);
  }

  // Main shell and deep body.
  box([0.145, 0.565, 0.25], point(0.255, 0.395, 0.0), SHELL_SHADOW, rot(), "left_shell_body");
  box([0.145, 0.565, 0.25], point(-0.255, 0.395, 0.0), SHELL_SHADOW, rot(), "right_shell_body");

  box([0.58, 0.125, 0.27], point(0, 0.095, 0.0), SHELL_SHADOW, rot(), "lower_shell_case");
  box([0.58, 0.125, 0.27], point(0, 0.695, 0.0), SHELL, rot(), "upper_shell_case");

  box([0.39, 0.515, 0.17], point(0, 0.395, 0.018), BELLOWS, rot(), "bellows_core");

  // Front shell plates.
  frontPlate([0.125, 0.535, 0.026], 0.255, 0.395, 0.142, SHELL, "left_front_shell");
  frontPlate([0.125, 0.535, 0.026], -0.255, 0.395, 0.142, SHELL_LIGHT, "right_front_shell");
  frontPlate([0.56, 0.102, 0.025], 0, 0.096, 0.151, SHELL_LIGHT, "lower_front_plate");
  frontPlate([0.56, 0.102, 0.025], 0, 0.696, 0.151, SHELL_LIGHT, "upper_front_plate");

  // Side edge armor and brass frame.
  for (const s of [1, -1]) {
    const xOuter = s * 0.323;
    const xInner = s * 0.188;

    box([0.014, 0.52, 0.035], point(xOuter, 0.395, 0.157), BRASS_DARK, rot(), "side_outer_edge");
    box([0.012, 0.52, 0.018], point(xOuter - s * 0.009, 0.395, 0.18), BRASS_LIGHT, rot(), "side_outer_glint");
    box([0.012, 0.52, 0.032], point(xInner, 0.395, 0.158), BRASS_DARK, rot(), "side_inner_edge");

    box([0.13, 0.014, 0.033], point(s * 0.255, 0.145, 0.158), BRASS_DARK, rot(), "side_bottom_frame");
    box([0.13, 0.014, 0.033], point(s * 0.255, 0.645, 0.158), BRASS_DARK, rot(), "side_top_frame");
    box([0.13, 0.008, 0.016], point(s * 0.255, 0.151, 0.18), BRASS_LIGHT, rot(), "side_bottom_glint");
    box([0.13, 0.008, 0.016], point(s * 0.255, 0.651, 0.18), BRASS_LIGHT, rot(), "side_top_glint");
  }

  // Upper and lower full-width frame bands.
  box([0.57, 0.018, 0.037], point(0, 0.151, 0.158), BRASS_DARK, rot(), "lower_gold_band");
  box([0.57, 0.018, 0.037], point(0, 0.642, 0.158), BRASS_DARK, rot(), "upper_gold_band");
  box([0.53, 0.008, 0.014], point(0, 0.161, 0.181), BRASS_LIGHT, rot(), "lower_gold_highlight");
  box([0.53, 0.008, 0.014], point(0, 0.652, 0.181), BRASS_LIGHT, rot(), "upper_gold_highlight");

  // Bellows: broad pleated leather panels with alternating nacre-like edge flashes.
  const bellowsCount = 11;
  for (let i = 0; i < bellowsCount; i++) {
    const x = -0.18 + i * 0.036;
    const z = i % 2 === 0 ? 0.122 : 0.148;
    const panelColor = i % 3 === 0 ? BELLOWS_RED : BELLOWS;
    box([0.041, 0.472, 0.027], point(x, 0.395, z), panelColor, rot(0, 0, i % 2 ? -1.6 : 1.6), "bellows_pleat");

    if (i < bellowsCount - 1) {
      const seamZ = i % 2 === 0 ? 0.151 : 0.126;
      box([0.006, 0.45, 0.009], point(x + 0.019, 0.395, seamZ), BELLOWS_HIGHLIGHT, rot(0, 0, 0), "bellows_seam");
    }
  }

  box([0.385, 0.022, 0.041], point(0, 0.169, 0.145), BELLOWS_RED, rot(), "bellows_lower_lip");
  box([0.385, 0.022, 0.041], point(0, 0.621, 0.145), BELLOWS_RED, rot(), "bellows_upper_lip");
  box([0.385, 0.009, 0.014], point(0, 0.184, 0.173), BRASS_LIGHT, rot(), "bellows_lower_trim");
  box([0.385, 0.009, 0.014], point(0, 0.636, 0.173), BRASS_LIGHT, rot(), "bellows_upper_trim");

  for (const x of [-0.17, -0.085, 0, 0.085, 0.17]) {
    box([0.008, 0.43, 0.007], point(x, 0.395, 0.169), INK_WARM, rot(), "bellows_vertical_shadow");
  }

  // Piano keyboard on the model's right side (-X).
  frontPlate([0.125, 0.455, 0.032], -0.255, 0.395, 0.169, INK_WARM, "keyboard_well");
  box([0.128, 0.018, 0.041], point(-0.255, 0.152, 0.174), BRASS_DARK, rot(), "keyboard_lower_rail");
  box([0.128, 0.018, 0.041], point(-0.255, 0.636, 0.174), BRASS_DARK, rot(), "keyboard_upper_rail");
  box([0.128, 0.008, 0.013], point(-0.255, 0.164, 0.198), BRASS_LIGHT, rot(), "keyboard_lower_glint");
  box([0.128, 0.008, 0.013], point(-0.255, 0.648, 0.198), BRASS_LIGHT, rot(), "keyboard_upper_glint");

  const whiteKeys = 7;
  const keyLeft = -0.312;
  const keyWidth = 0.0155;
  const keyGap = 0.0022;

  for (let i = 0; i < whiteKeys; i++) {
    const x = keyLeft + i * (keyWidth + keyGap);
    box([keyWidth, 0.424, 0.018], point(x, 0.395, 0.198), i % 2 ? KEY_WHITE : SHELL_LIGHT, rot(), "white_key");
    box([0.0023, 0.416, 0.004], point(x + keyWidth * 0.48, 0.395, 0.209), KEY_SHADOW, rot(), "white_key_seam");
    box([keyWidth * 0.72, 0.012, 0.004], point(x, 0.596, 0.210), SHELL_CREAM, rot(), "white_key_cap");
  }

  const blackKeyBoundaries = [0, 1, 3, 4, 5];
  for (const i of blackKeyBoundaries) {
    const x = keyLeft + keyWidth + i * (keyWidth + keyGap) + keyGap * 0.5;
    box([0.0105, 0.252, 0.026], point(x, 0.492, 0.214), KEY_BLACK, rot(), "black_key");
    box([0.006, 0.008, 0.006], point(x, 0.610, 0.228), BRASS_LIGHT, rot(), "black_key_glint");
  }

  // Bass button panel on the model's left side (+X).
  frontPlate([0.124, 0.455, 0.029], 0.255, 0.395, 0.171, SHELL_SHADOW, "bass_button_well");
  box([0.128, 0.019, 0.038], point(0.255, 0.152, 0.177), BRASS_DARK, rot(), "bass_lower_rail");
  box([0.128, 0.019, 0.038], point(0.255, 0.638, 0.177), BRASS_DARK, rot(), "bass_upper_rail");

  const buttonXs = [0.214, 0.255, 0.296];
  const buttonYs = [0.238, 0.332, 0.426, 0.520, 0.583];

  for (let col = 0; col < buttonXs.length; col++) {
    for (let row = 0; row < buttonYs.length; row++) {
      const x = buttonXs[col];
      const y = buttonYs[row];
      const buttonColor =
        (col + row) % 5 === 0
          ? PEARL_MINT
          : (col + row) % 5 === 1
            ? PEARL_ROSE
            : (col + row) % 5 === 2
              ? PEARL_LILAC
              : BUTTON;

      cylinder(0.019, 0.009, point(x, y, 0.191), BUTTON_DARK, 12, "bass_button_ring");
      cylinder(0.0145, 0.013, point(x, y, 0.199), buttonColor, 12, "bass_button");
      sphere(0.006, point(x - 0.004, y + 0.005, 0.209), SHELL_LIGHT, 7, 4, "bass_button_shine");
    }
  }

  // Extra bass-register marker buttons and a decorative button diamond.
  for (const [x, y] of [
    [0.214, 0.285],
    [0.296, 0.379],
    [0.214, 0.473],
    [0.296, 0.567],
  ] as [number, number][]) {
    cylinder(0.022, 0.006, point(x, y, 0.212), BRASS_DARK, 10, "bass_marker_ring");
    cylinder(0.015, 0.009, point(x, y, 0.217), PEARL_CREAM, 10, "bass_marker");
  }

  // Marquetry tiles on the upper and lower shell cases.
  const topTileXs = [-0.23, -0.115, 0, 0.115, 0.23];
  const topColors = [PEARL_MINT, PEARL_ROSE, PEARL_LILAC, PEARL_AQUA, PEARL_BLUE];

  for (let i = 0; i < topTileXs.length; i++) {
    frontDiamond(topTileXs[i], 0.695, 0.176, 0.034, topColors[i], "top_shell_tile");
    frontDiamond(topTileXs[i], 0.094, 0.176, 0.029, topColors[(i + 2) % topColors.length], "lower_shell_tile");
  }

  frontDiamond(-0.255, 0.238, 0.191, 0.026, PEARL_AQUA, "left_upper_motif");
  frontDiamond(0.255, 0.238, 0.191, 0.026, PEARL_ROSE, "right_upper_motif");
  frontDiamond(-0.255, 0.565, 0.191, 0.026, PEARL_LILAC, "left_lower_motif");
  frontDiamond(0.255, 0.565, 0.191, 0.026, PEARL_BLUE, "right_lower_motif");

  // Shell mosaics along the outer side cases.
  for (const s of [1, -1]) {
    const x = s * 0.255;
    const colors = s > 0
      ? [PEARL_MINT, PEARL_ROSE, PEARL_LILAC, PEARL_CREAM]
      : [PEARL_AQUA, PEARL_BLUE, PEARL_ROSE, PEARL_MINT];

    for (let row = 0; row < 3; row++) {
      const y = 0.275 + row * 0.112;
      frontDiamond(x, y, 0.188, 0.026, colors[row], "side_shell_motif");
    }

    for (const y of [0.208, 0.596]) {
      shellStud(s * 0.310, y, 0.188, 0.009, BRASS_LIGHT, "side_corner_stud");
    }

    for (const y of [0.185, 0.622]) {
      cylinder(0.007, 0.009, point(s * 0.202, y, 0.188), BRASS_DARK, 8, "inner_corner_rivet");
    }
  }

  // Grand central medallion on the upper shell.
  cylinder(0.062, 0.012, point(0, 0.697, 0.187), BRASS_DARK, 16, "upper_medallion_outer");
  cylinder(0.052, 0.014, point(0, 0.697, 0.197), PEARL_LILAC, 16, "upper_medallion_pearl");
  cylinder(0.034, 0.017, point(0, 0.697, 0.209), BRASS_LIGHT, 12, "upper_medallion_gold");
  frontDiamond(0, 0.697, 0.221, 0.022, PEARL_MINT, "upper_medallion_diamond");
  sphere(0.009, point(-0.018, 0.716, 0.231), SHELL_LIGHT, 7, 4, "upper_medallion_glint");

  // Lower shell emblem: a stylized Italian flower.
  cylinder(0.048, 0.011, point(0, 0.094, 0.187), BRASS_DARK, 16, "lower_medallion_outer");
  cylinder(0.039, 0.013, point(0, 0.094, 0.197), PEARL_ROSE, 16, "lower_medallion_pearl");
  for (const [dx, dy, c] of [
    [0, 0.018, PEARL_CREAM],
    [0.016, 0, PEARL_MINT],
    [0, -0.018, PEARL_LILAC],
    [-0.016, 0, PEARL_AQUA],
  ] as [number, number, string][]) {
    cylinder(0.010, 0.008, point(dx, 0.094 + dy, 0.211), c, 9, "flower_petal");
  }
  cylinder(0.009, 0.010, point(0, 0.094, 0.217), BRASS_LIGHT, 10, "flower_center");

  // Tiny inlaid corner diamonds on the upper and lower wide cases.
  for (const x of [-0.285, 0.285]) {
    frontDiamond(x, 0.684, 0.184, 0.018, x > 0 ? PEARL_BLUE : PEARL_ROSE, "upper_corner_inlay");
    frontDiamond(x, 0.107, 0.184, 0.018, x > 0 ? PEARL_ROSE : PEARL_BLUE, "lower_corner_inlay");
  }

  // Decorative perforated grille above the piano keyboard.
  box([0.105, 0.032, 0.018], point(-0.255, 0.615, 0.205), BRASS_DARK, rot(), "keyboard_grille_base");
  for (let i = 0; i < 7; i++) {
    const x = -0.304 + i * 0.016;
    cylinder(0.0042, 0.007, point(x, 0.615, 0.218), PEARL_CREAM, 8, "keyboard_grille_hole");
  }
  box([0.105, 0.018, 0.012], point(-0.255, 0.594, 0.207), BRASS_LIGHT, rot(), "keyboard_grille_lip");

  // A matching decorative grille above the bass buttons.
  box([0.105, 0.032, 0.018], point(0.255, 0.615, 0.205), BRASS_DARK, rot(), "bass_grille_base");
  for (let i = 0; i < 7; i++) {
    const x = 0.206 + i * 0.016;
    cylinder(0.0042, 0.007, point(x, 0.615, 0.218), PEARL_CREAM, 8, "bass_grille_hole");
  }
  box([0.105, 0.018, 0.012], point(0.255, 0.594, 0.207), BRASS_LIGHT, rot(), "bass_grille_lip");

  // Small mother-of-pearl flourishes flanking the bellows.
  for (const s of [1, -1]) {
    const x = s * 0.191;
    for (const y of [0.235, 0.292, 0.55, 0.607]) {
      shellStud(x, y, 0.191, 0.010, s > 0 ? PEARL_CREAM : PEARL_MINT, "bellows_flourish_stud");
    }
  }

  // Upper and lower shell corner rivet sets.
  for (const x of [-0.265, -0.175, 0.175, 0.265]) {
    cornerRivet(x, 0.164, 0.186, "lower_case_rivet");
    cornerRivet(x, 0.628, 0.186, "upper_case_rivet");
  }

  // Back shell and side depth panels, visible in a three-quarter view.
  box([0.43, 0.49, 0.025], point(0, 0.405, -0.14), INK_WARM, rot(), "back_shadow_panel");
  box([0.46, 0.032, 0.026], point(0, 0.17, -0.14), BRASS_DARK, rot(), "back_lower_rail");
  box([0.46, 0.032, 0.026], point(0, 0.64, -0.14), BRASS_DARK, rot(), "back_upper_rail");

  for (const s of [1, -1]) {
    box([0.026, 0.49, 0.21], point(s * 0.327, 0.405, -0.005), BRASS_DARK, rot(), "rear_side_edge");
    box([0.025, 0.45, 0.019], point(s * 0.333, 0.405, -0.112), STRAP, rot(), "rear_side_leather");
  }

  // Shoulder strap anchors and leather harness loops.
  for (const s of [1, -1]) {
    cylinder(0.018, 0.014, point(s * 0.292, 0.615, -0.145), BRASS_DARK, 10, "strap_top_anchor");
    cylinder(0.012, 0.017, point(s * 0.292, 0.615, -0.153), BRASS_LIGHT, 10, "strap_top_pin");

    cylinder(0.018, 0.014, point(s * 0.292, 0.195, -0.145), BRASS_DARK, 10, "strap_bottom_anchor");
    cylinder(0.012, 0.017, point(s * 0.292, 0.195, -0.153), BRASS_LIGHT, 10, "strap_bottom_pin");

    rod(
      point(s * 0.292, 0.605, -0.158),
      point(s * 0.292, 0.205, -0.158),
      0.014,
      STRAP,
      "vertical_shoulder_strap",
    );
    rod(
      point(s * 0.292, 0.595, -0.174),
      point(s * 0.292, 0.215, -0.174),
      0.0045,
      STRAP_HIGHLIGHT,
      "shoulder_strap_stitch",
    );
  }

  // Top lugs and bellows side caps.
  for (const s of [1, -1]) {
    box([0.055, 0.044, 0.09], point(s * 0.198, 0.731, 0.02), SHELL_SHADOW, rot(), "top_lug");
    box([0.063, 0.012, 0.094], point(s * 0.198, 0.751, 0.02), BRASS_DARK, rot(), "top_lug_band");
    cylinder(0.013, 0.012, point(s * 0.198, 0.764, 0.02), BRASS_LIGHT, 10, "top_lug_cap");

    box([0.048, 0.052, 0.095], point(s * 0.198, 0.059, 0.02), SHELL_SHADOW, rot(), "bottom_lug");
    box([0.056, 0.012, 0.099], point(s * 0.198, 0.032, 0.02), BRASS_DARK, rot(), "bottom_lug_band");
  }

  // Stylized musical-note ornament on the upper front, made from simple shell pieces.
  cylinder(0.013, 0.009, point(-0.042, 0.695, 0.215), PEARL_AQUA, 10, "music_note_head");
  box([0.009, 0.066, 0.009], point(-0.030, 0.724, 0.217), PEARL_AQUA, rot(), "music_note_stem");
  box([0.029, 0.010, 0.009], point(-0.020, 0.751, 0.217), PEARL_AQUA, rot(0, 0, -18), "music_note_flag");

  cylinder(0.013, 0.009, point(0.046, 0.683, 0.215), PEARL_ROSE, 10, "second_note_head");
  box([0.009, 0.062, 0.009], point(0.058, 0.711, 0.217), PEARL_ROSE, rot(), "second_note_stem");
  box([0.029, 0.010, 0.009], point(0.069, 0.738, 0.217), PEARL_ROSE, rot(0, 0, -18), "second_note_flag");

  // A row of small shell beads across the lower fascia.
  for (let i = 0; i < 9; i++) {
    const x = -0.22 + i * 0.055;
    const c = i % 3 === 0 ? PEARL_MINT : i % 3 === 1 ? PEARL_ROSE : PEARL_LILAC;
    shellStud(x, 0.126, 0.194, 0.008, c, "lower_fascia_bead");
  }

  // Fine brass seam rails on the face of the broad top and bottom cases.
  for (const x of [-0.30, -0.15, 0, 0.15, 0.30]) {
    box([0.006, 0.074, 0.006], point(x, 0.696, 0.203), BRASS_LIGHT, rot(), "upper_marquetrty_seam");
    box([0.006, 0.072, 0.006], point(x, 0.094, 0.203), BRASS_LIGHT, rot(), "lower_marquetrty_seam");
  }

  // Side-facing brass hinge plates add the characteristic accordion hardware silhouette.
  for (const s of [1, -1]) {
    for (const y of [0.225, 0.395, 0.565]) {
      box([0.014, 0.082, 0.035], point(s * 0.335, y, -0.015), BRASS_DARK, rot(), "side_hinge_plate");
      cylinder(0.012, 0.012, point(s * 0.345, y, -0.015), BRASS_LIGHT, 10, "side_hinge_pin");
      cylinder(0.006, 0.014, point(s * 0.352, y, -0.015), INK, 8, "side_hinge_shadow");
    }
  }

  // Little feet keep the instrument grounded while giving the bottom a finished furniture-like edge.
  for (const x of [-0.245, 0.245]) {
    box([0.075, 0.024, 0.17], point(x, 0.018, -0.015), STRAP, rot(), "rubber_bottom_foot");
    box([0.082, 0.010, 0.18], point(x, 0.007, -0.015), BRASS_DARK, rot(), "foot_brass_edge");
  }

  // Final front outline: bright shell corners, pearl tips, and a dark inset shadow behind the cases.
  for (const s of [1, -1]) {
    for (const y of [0.19, 0.60]) {
      box([0.021, 0.028, 0.022], point(s * 0.316, y, 0.174), BRASS_LIGHT, rot(), "shell_corner_highlight");
      shellStud(s * 0.307, y, 0.191, 0.0065, PEARL_CREAM, "shell_corner_pearl");
    }
  }

  return b.root;
}
