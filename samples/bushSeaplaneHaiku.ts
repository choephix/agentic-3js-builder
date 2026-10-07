import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, furEdge, inkLines, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Bush Seaplane on Floats",
  description:
    "A high-wing bush seaplane on twin pontoon floats, about 9.4 m long with a 14.6 m span and 3 m height. Ivory cabin with a teal lower hull, coral tail and aileron accents, gold trim and filigree, hanging tassels, a cylinder-headed radial nose, and cyan hydro glyphs and crystals that glow. Genshin-style cel shading; the propeller, ailerons, rudder and elevators are hinged.",
  style: "Genshin Impact",
  commit: "b816db2",
};

// Palette: ivory cabin, teal lower hull, coral tail, gold trim, sky-blue floats, plum cylinder heads, cyan hydro glow.
const IVORY = "#fff1d0";
const TEAL = "#2ec9c0";
const GOLD = "#f7c44e";
const CORAL = "#ff6f57";
const SKY = "#5cc0f5";
const DEEP = "#2a5fc4";
const PLUM = "#3a2d63";
const RIB = "#f0d79a";
const GLOW_CYAN = "#8ef6ff";
const GLOW_GOLD = "#ffd66b";

// Cel-shaded materials: each colour is a lit tone and a hue-shifted shadow tone.
const GOLD_C = cel(GOLD);
const PLUM_C = cel(PLUM);
const CORAL_C = cel(CORAL);

// Outlines (the drawing's coordinates in metres, as the extrude/lathe helpers take them).
const WING_OUT: OutlinePoint[] = [
  [7.3, 0.55],
  [7.3, -0.3],
  [4.6, -0.3],
  [4.6, -0.95],
  [-4.6, -0.95],
  [-4.6, -0.3],
  [-7.3, -0.3],
  [-7.3, 0.55],
  [-1.6, 0.95],
  [1.6, 0.95],
];
const AILERON_OUT: OutlinePoint[] = [
  [0, 0.02],
  [2.7, 0.02],
  [2.7, -0.62],
  [0, -0.62],
];
const BLADE_OUT: OutlinePoint[] = [
  [-0.1, 0.18],
  [-0.13, 0.65],
  [-0.08, 1.25],
  [0.05, 1.25],
  [0.1, 0.65],
  [0.1, 0.18],
];
const COWL_OUT: OutlinePoint[] = [
  [0, 0],
  [0.56, 0],
  [0.66, 0.24],
  [0.7, 0.62],
  [0.66, 0.98],
  [0.52, 1.18],
  [0.3, 1.28],
  [0, 1.3],
];
const SPINNER_OUT: OutlinePoint[] = [
  [0, 0],
  [0.2, 0],
  [0.24, 0.1],
  [0.2, 0.3],
  [0.12, 0.5],
  [0.04, 0.62],
  [0, 0.68],
];
const FIN_OUT: OutlinePoint[] = [
  [-2.6, 1.6],
  [-3.45, 2.55],
  [-3.7, 2.98],
  [-3.95, 2.98],
  [-3.95, 1.95],
  [-3.2, 1.6],
];
const STAB_OUT: OutlinePoint[] = [
  [-2.35, 0],
  [2.35, 0],
  [2.35, 0.55],
  [-2.35, 0.55],
];
const ELEV_OUT: OutlinePoint[] = [
  [0.2, 0],
  [2.3, 0],
  [2.3, 0.4],
  [0.2, 0.4],
];
const RUDDER_OUT: OutlinePoint[] = [
  [0, 0],
  [0.5, 0.04],
  [0.56, 0.85],
  [0.04, 0.95],
];

// Paints. Each is a raw colour pattern, then wrapped in cel() so it shades two-tone against the key light.
const FUSE = cel(
  inkLines(
    paint((p) =>
      p.z < -2.8
        ? CORAL
        : furEdge(IVORY, TEAL, {
            by: "position",
            axis: [0, 1, 0],
            level: 1.2,
            teeth: 0.08,
            period: 0.16,
            along: [0, 0, 1],
            ink: GOLD,
            inkWidth: 0.012,
          }),
    ),
    { levels: [0], axis: [1, 0, 0], width: 0.05, ink: INK },
  ),
);
const COWL = cel(paint((_p, _n, s) => (s[0] < 0.14 || Math.abs(s[0] - 0.92) < 0.03 ? GOLD : TEAL)));
const FLOAT = cel(
  paint((p) =>
    Math.abs(p.z + 1.4) < 0.07 || Math.abs(p.z - 1.25) < 0.06
      ? GOLD
      : furEdge(SKY, DEEP, {
          by: "position",
          axis: [0, 1, 0],
          level: 0.16,
          teeth: 0.05,
          period: 0.2,
          along: [0, 0, 1],
          ink: GOLD,
          inkWidth: 0.01,
        }),
  ),
);
const WING = cel(paint((p) => (p.y < 2.4 ? TEAL : p.z > 0.8 || Math.abs(p.x) > 6.95 ? GOLD : Math.abs(p.x % 1.25) < 0.025 ? RIB : IVORY)));
const AILERON = cel(paint((_p, _n, s) => (s[1] < -0.55 ? GOLD : CORAL)));
const STAB = cel(paint((p) => (p.z > -3.07 ? GOLD : IVORY)));
const FIN = cel(paint((p) => (p.y > 2.9 ? GOLD : CORAL)));
const RUDDER = cel(paint((_p, _n, s) => (s[1] > 0.8 || (s[1] > 0.38 && s[1] < 0.44) ? GOLD : IVORY)));
const PROP = cel(paint((_p, _n, s) => (s[1] > 1.0 ? GOLD : IVORY)));
const SPINNER = cel(paint((_p, _n, s) => (s[0] > 0.2 && s[0] < 0.3 ? TEAL : GOLD)));

// Textures. Gold filigree, glass with pilots, tassels, the cyan hydro glyph.
const DEFS = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2fdff"/><stop offset="0.45" stop-color="#8ad9ff"/><stop offset="1" stop-color="#2f6fc4"/></linearGradient></defs>`;
let panes = "";
for (const x of [34, 168, 302, 436, 570]) {
  panes +=
    `<rect x="${x}" y="12" width="116" height="84" rx="26" fill="url(#g)" stroke="${GOLD}" stroke-width="10"/>` +
    `<circle cx="${x + 58}" cy="46" r="12" fill="${PLUM}" opacity="0.75"/>` +
    `<path d="M${x + 34} 96 Q${x + 36} 64 ${x + 58} 62 Q${x + 80} 64 ${x + 82} 96 Z" fill="${PLUM}" opacity="0.75"/>` +
    `<path d="M${x + 16} 84 L${x + 44} 22 L${x + 56} 22 L${x + 28} 84 Z" fill="#ffffff" opacity="0.55"/>` +
    `<path d="M${x + 66} 84 L${x + 86} 36 L${x + 94} 36 L${x + 76} 84 Z" fill="#ffffff" opacity="0.35"/>`;
}
const WINDOWS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 110">${DEFS}<rect x="0" y="0" width="720" height="7" fill="${GOLD}"/><rect x="0" y="103" width="720" height="7" fill="${GOLD}"/>${panes}</svg>`,
  { size: 1024 },
);
const WINDSHIELD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">${DEFS}<path d="M4 98 L36 6 L164 6 L196 98 Z" fill="url(#g)" stroke="${GOLD}" stroke-width="9" stroke-linejoin="round"/><path d="M70 8 L62 96 M100 6 L100 96 M130 8 L138 96" stroke="${GOLD}" stroke-width="6"/></svg>`,
  { size: 512 },
);
const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140">` +
    `<g fill="none" stroke="${GOLD}" stroke-width="7" stroke-linecap="round">` +
    `<path d="M100 134 C100 104 62 100 46 82 C30 64 38 36 58 34 C76 32 82 52 70 62 C60 70 46 62 52 52"/>` +
    `<path d="M100 134 C100 104 138 100 154 82 C170 64 162 36 142 34 C124 32 118 52 130 62 C140 70 154 62 148 52"/>` +
    `<path d="M22 126 Q100 104 178 126"/><circle cx="100" cy="22" r="11"/></g>` +
    `<circle cx="100" cy="22" r="4" fill="${GOLD}"/></svg>`,
  { size: 512 },
);
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="${GLOW_CYAN}" stroke-width="5" stroke-linecap="round">` +
    `<circle cx="50" cy="50" r="44"/><path d="M50 14 L82 70 L18 70 Z"/><path d="M22 40 A32 32 0 0 1 78 40"/><path d="M50 50 L50 88"/></g>` +
    `<circle cx="50" cy="50" r="7" fill="${GLOW_CYAN}"/></svg>`,
  { size: 256 },
);
const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">` +
    `<path d="M20 84 L8 2 M20 84 L13 2 M20 84 L20 2 M20 84 L27 2 M20 84 L32 2" stroke="${CORAL}" stroke-width="3.5" stroke-linecap="round" fill="none"/>` +
    `<rect x="11" y="68" width="18" height="6" rx="2" fill="${GOLD}"/><rect x="13" y="82" width="14" height="16" rx="6" fill="${GOLD}"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "bushSeaplane", detail: 1.5, paintSize: 2048 });

  // Skeleton: one fixed airframe, and hinged wing, propeller, rudder and elevator joints.
  const root = b.joint("airframe", { at: [0, 0, 0] });
  const wing = b.joint("wing", { parent: root, at: [0, 2.42, 0], dir: [0, 0, 1], role: "wing" });
  const aileronL = b.joint("aileronL", { parent: wing, at: [4.6, 2.42, -0.3], dir: [0, 0, -1], role: "hinge" });
  const aileronR = b.joint("aileronR", { parent: wing, at: [-4.6, 2.42, -0.3], dir: [0, 0, -1], role: "hinge" });
  const prop = b.joint("propeller", { parent: root, at: [0, 1.5, 4.5], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: root, at: [0, 1.95, -3.95], dir: [0, 1, 0], role: "hinge" });
  const elevatorL = b.joint("elevatorL", { parent: root, at: [0.2, 1.9, -3.55], dir: [0, 0, -1], role: "hinge" });
  const elevatorR = b.joint("elevatorR", { parent: root, at: [-0.2, 1.9, -3.55], dir: [0, 0, -1], role: "hinge" });

  // Fuselage: a loft from the radial nose back to a tapered tail cone.
  const fuselage = b.loft(
    [
      { at: [0, 1.5, 3.2], w: 0.9, h: 1.15 },
      { at: [0, 1.5, 2.5], w: 1.22, h: 1.45 },
      { at: [0, 1.55, 1.0], w: 1.3, h: 1.5 },
      { at: [0, 1.55, -1.0], w: 1.26, h: 1.46 },
      { at: [0, 1.55, -2.4], w: 0.94, h: 1.12 },
      { at: [0, 1.6, -3.4], w: 0.52, h: 0.8 },
      { at: [0, 1.75, -4.1], w: 0.22, h: 0.42 },
    ],
    { bone: root, color: FUSE },
  );
  const skin = b.surface(fuselage);

  // Gold collars cut round the cabin and tail, each studded with rivets.
  for (const z of [2.65, -2.75]) {
    const collar = skin.loop([0, 1.55, z], { dir: [0, 0, 1], lift: 0.02 });
    b.sweep(collar, 0.025, { color: GOLD_C });
    b.along(collar, 16, (at) => b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD_C, { at }));
  }

  // Cabin glass, the windscreen, filigree behind the cabin and glowing runes on the tail cone.
  for (const side of [1, -1]) {
    b.decal(skin, WINDOWS, { at: skin.nearest([side * 0.55, 1.95, 0]), dir: [side, 0, 0], size: [3.6, 0.55] });
    b.decal(skin, FILIGREE, { at: skin.nearest([side * 0.45, 1.5, -2.2]), dir: [side, 0, 0], size: [0.8, 0.56] });
    glow(b.decal(skin, RUNE, { at: skin.nearest([side * 0.3, 1.6, -3.1]), dir: [side, 0, 0], size: [0.36, 0.36] }));
  }
  b.decal(skin, WINDSHIELD, { at: skin.nearest([0, 2.1, 1.9]), dir: [0, 0.6, 1], size: [1.3, 0.62] });

  // Radial nose: a teal cowl with gold rims, a gold spinner, cylinder heads round the cowl and two exhaust stacks.
  b.lathe(COWL_OUT, { at: [0, 1.5, 3.0], axis: [0, 0, 1], bone: root, smoothing: 1, segments: 16, color: COWL });
  b.ring(frame([0, 1.5, 3.75], [0, 0, 1]), { count: 9, radius: 0.66 }, (item) =>
    b.stick(new THREE.CylinderGeometry(0.08, 0.1, 0.18, 8), PLUM_C, item, { embed: 0.35, bone: root }),
  );
  for (const side of [1, -1]) {
    b.rod([side * 0.32, 0.92, 3.7], [side * 0.62, 0.66, 4.1], 0.045, { color: GOLD_C, bone: root });
  }

  // Propeller: a spinner and two blades on the hinge joint, gold tips.
  b.lathe(SPINNER_OUT, { at: [0, 1.5, 4.2], axis: [0, 0, 1], bone: prop, smoothing: 1, segments: 14, color: SPINNER });
  for (const side of [1, -1]) {
    b.extrude(BLADE_OUT, {
      at: [0, 1.5, 4.5],
      x: [1, 0, 0],
      y: [0, side, 0],
      thickness: 0.05,
      bevel: 0.015,
      bone: prop,
      color: PROP,
    });
  }

  // Wing: one tapered planform with a gold leading edge and ribs, ailerons on hinge joints at the trailing edge.
  const wingPart = b.extrude(WING_OUT, {
    at: [0, 2.42, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.22,
    bevel: 0.05,
    bone: wing,
    color: WING,
  });
  const wingSkin = b.surface(wingPart);
  for (const side of [1, -1]) {
    b.extrude(AILERON_OUT, {
      at: [side * 4.6, 2.42, -0.3],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.12,
      bevel: 0.04,
      bone: side > 0 ? aileronL : aileronR,
      color: AILERON,
    });
    b.decal(wingSkin, FILIGREE, { at: wingSkin.nearest([side * 2.6, 2.55, 0]), dir: [0, 1, 0], size: [0.9, 0.63] });
    glow(b.part(new THREE.SphereGeometry(0.08, 8, 6), side > 0 ? GLOW_GOLD : GLOW_CYAN, {
      bone: wing,
      at: [side * 7.36, 2.46, 0.1],
    }));
    b.rod([side * 3.6, 2.44, 0.85], [side * 3.6, 2.44, 1.4], 0.018, { color: GOLD_C, bone: wing });
  }

  // Tail: a coral fin with a gold cap and a glowing crystal, flowing coral ribbons, a rudder, a stabiliser with
  // coral elevators.
  const fin = b.extrude(FIN_OUT, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.07,
    bevel: 0.025,
    bone: root,
    color: FIN,
  });
  const finSkin = b.surface(fin);
  for (const side of [1, -1]) {
    b.decal(finSkin, FILIGREE, { at: finSkin.nearest([side * 0.04, 2.2, -3.2]), dir: [side, 0, 0], size: [0.8, 0.56] });
    b.sweep(
      catmull([
        [0, 2.95, -3.85],
        [side * 0.15, 2.8, -4.5],
        [side * 0.3, 2.45, -5.2],
        [side * 0.35, 2.05, -5.9],
      ]),
      (t) => [0.05 - 0.02 * t, 0.007],
      { bone: root, caps: "flat", bands: [[0.8, CORAL_C], [1, GOLD_C]] },
    );
  }
  glow(b.part(new THREE.OctahedronGeometry(0.09), GLOW_CYAN, { bone: root, at: [0, 3.07, -3.82], flat: true }));
  b.extrude(RUDDER_OUT, {
    at: [0, 1.95, -3.95],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.02,
    bone: rudder,
    color: RUDDER,
  });
  b.extrude(STAB_OUT, {
    at: [0, 1.9, -3.0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.09,
    bevel: 0.03,
    bone: root,
    color: STAB,
  });
  for (const side of [1, -1]) {
    b.extrude(ELEV_OUT, {
      at: [0, 1.9, -3.55],
      x: [side, 0, 0],
      y: [0, 0, -1],
      thickness: 0.07,
      bevel: 0.025,
      bone: side > 0 ? elevatorL : elevatorR,
      color: CORAL_C,
    });
  }

  // Floats: twin sky-blue pontoons with gold bands, a waterline edge, filigree, a raised bow with a glowing crystal
  // and a deck rail.
  for (const side of [1, -1]) {
    const float = b.loft(
      [
        { at: [side * 2.1, 0.17, -3.2], w: 0.12, h: 0.34 },
        { at: [side * 2.1, 0.25, -2.6], w: 0.36, h: 0.5 },
        { at: [side * 2.1, 0.31, -0.5], w: 0.52, h: 0.62 },
        { at: [side * 2.1, 0.31, 1.8], w: 0.5, h: 0.6 },
        { at: [side * 2.1, 0.42, 2.9], w: 0.34, h: 0.5 },
        { at: [side * 2.1, 0.6, 3.5], w: 0.1, h: 0.32 },
      ],
      { bone: root, color: FLOAT },
    );
    const floatSkin = b.surface(float);
    b.decal(floatSkin, FILIGREE, { at: floatSkin.nearest([side * 2.4, 0.33, -0.3]), dir: [side, 0, 0], size: [0.55, 0.39] });
    b.rod([side * 2.1, 0.6, 2.75], [side * 2.1, 0.9, 2.75], 0.03, { color: GOLD_C, bone: root });
    glow(b.part(new THREE.OctahedronGeometry(0.1), GLOW_CYAN, { bone: root, at: [side * 2.1, 1.02, 2.75], flat: true }));
    b.rod([side * 2.1, 0.58, -1.8], [side * 2.1, 0.58, 1.6], 0.022, { color: GOLD_C, bone: root });
  }

  // Struts: fuselage to floats, floats to wing, fuselage to wing, plus cross-braces, gold bolts and a tail skid.
  for (const side of [1, -1]) {
    b.rod(skin.nearest([side * 0.6, 1.0, 1.4]), [side * 2.1, 0.5, 1.5], 0.035, { color: GOLD_C, bone: root });
    b.rod(skin.nearest([side * 0.6, 1.0, -1.4]), [side * 2.1, 0.5, -1.3], 0.035, { color: GOLD_C, bone: root });
    b.rod([side * 2.1, 0.66, 0.2], [side * 4.1, 2.27, 0.0], 0.045, { color: GOLD_C, bone: root });
    b.rod(skin.nearest([side * 0.6, 1.95, 1.0]), [side * 3.2, 2.27, 0.9], 0.04, { color: GOLD_C, bone: root });
    b.rod(skin.nearest([side * 0.6, 1.95, -0.9]), [side * 3.2, 2.27, -0.8], 0.04, { color: GOLD_C, bone: root });
    for (const bo of [
      { at: [side * 3.2, 2.27, 0.9], bone: root },
      { at: [side * 3.2, 2.27, -0.8], bone: root },
      { at: [side * 4.1, 2.27, 0.0], bone: wing },
      { at: [side * 2.1, 0.62, 0.2], bone: root },
    ]) {
      b.part(new THREE.SphereGeometry(0.045, 6, 4), GOLD_C, { bone: bo.bone, at: bo.at });
    }
  }
  for (const z of [-1.2, 1.9]) b.rod([-2.1, 0.45, z], [2.1, 0.45, z], 0.03, { color: GOLD_C, bone: root });
  b.rod([0, 1.3, -3.55], [0, 0.1, -3.95], 0.03, { color: GOLD_C, bone: root });

  // Tassels hanging from the wingtips and the stabiliser tips.
  b.cards(
    [
      frame([7.0, 2.2, -0.1], [0, 1, 0]),
      frame([7.0, 2.2, 0.2], [0, 1, 0]),
      frame([-7.0, 2.2, -0.1], [0, 1, 0]),
      frame([-7.0, 2.2, 0.2], [0, 1, 0]),
    ],
    TASSEL,
    { size: [0.12, 0.5], lean: 180, flow: [0, 0, 1], bone: wing },
  );
  b.cards([frame([2.3, 1.85, -3.3], [0, 1, 0]), frame([-2.3, 1.85, -3.3], [0, 1, 0])], TASSEL, {
    size: [0.09, 0.36],
    lean: 180,
    flow: [0, 0, 1],
    bone: root,
  });

  return b.root;
}
