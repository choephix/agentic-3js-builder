import * as THREE from "three";
import { createBuilder, grain, mix, mottle, noise, paint, rng, svg } from "../../../../src/index";
import type { Rgb } from "../../../../src/index";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass telescope with leather-wrapped sections, engraved rings, a finder scope, a rubber eyecup and focusing knobs, on a turned mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

// Layout in meters: +Y up, the telescope points toward +Z, and its left side is +X.

/** Along the tube from eyepiece to objective: tilted 30° up toward +Z. */
const D = new THREE.Vector3(0, 0.5, Math.sqrt(3) / 2);
/** Across the tube, pointing up from it. */
const U = new THREE.Vector3(0, Math.sqrt(3) / 2, -0.5);
const SIDE = new THREE.Vector3(1, 0, 0);

/** The altitude axle, through the middle of the tube. */
const AXLE = new THREE.Vector3(0, 1.06, 0);
const TUBE_LENGTH = 0.66;
/** The eyepiece end of the tube: the origin of its lathes. */
const AT = AXLE.clone().addScaledVector(D, -TUBE_LENGTH / 2);

/** Where the three legs meet. */
const HUB = new THREE.Vector3(0, 0.84, 0);
const YOKE_Y = 0.925;
const TRAY_Y = 0.316;
const TRAY_Z = -0.135;

// Palette

const BRASS_DARK = "#5a3a10";
const BRASS_MID = "#c79a45";
const BRASS_HI = "#fbe7a6";
const LIGHT = new THREE.Vector3(0.45, 0.8, 0.4).normalize();
const WOOD_LIGHT = "#9b5a2a";
const WOOD_DARK = "#4a2010";
const LEATHER_LIGHT = "#7e4b28";
const LEATHER_DARK = "#4b2a15";
const STITCH = "#e6d3a2";
const RUBBER = "#1b1917";
const GLASS = "#1d4a5e";

// Heights along the tube (from the eyepiece end) where leather is wrapped and rings are engraved.

const WRAPS: Array<[number, number]> = [
  [0.17, 0.215],
  [0.31, 0.37],
  [0.505, 0.56],
];
const GROOVES = [0.04, 0.1, 0.125, 0.23, 0.39, 0.53, 0.61, 0.63, 0.65];

// Paints

/** Polished brass: a ramp lit from above, faint streaks, and fine grooves (and ticks) cut at heights along s[0]. */
function brass(grooves: readonly number[] = [], ticks?: readonly [number, number]) {
  return paint((p, n, s) => {
    const [h, deg] = s;
    const lit = Math.max(n.dot(LIGHT), 0);
    const sky = 0.5 + 0.5 * n.y;
    const streak = noise(p, 0.011, 5) - 0.5;
    const t = Math.min(Math.max(0.1 + 0.55 * lit + 0.25 * sky + 0.35 * streak, 0), 1);
    let color: Rgb = t < 0.5 ? mix(BRASS_DARK, BRASS_MID, t * 2) : mix(BRASS_MID, BRASS_HI, (t - 0.5) * 2);
    const groove = grooves.some((g) => Math.abs(h - g) < 0.0012);
    const tick = ticks !== undefined && h > ticks[0] && h < ticks[1] && deg % 9 < 1.3;
    if (groove || tick) color = mix(color, "#2a1805", 0.85);
    return color;
  });
}

/** Mahogany: long streaks running along `axis`. */
function mahogany(axis: readonly number[] | THREE.Vector3 = [0, 1, 0]) {
  return grain(WOOD_LIGHT, WOOD_DARK, { size: 0.03, axis, seed: 4 });
}

const hide = mottle(LEATHER_LIGHT, LEATHER_DARK, { size: 0.02, seed: 3, contrast: 1.2 });

/** Leather wraps: mottled hide with a row of stitches just inside each wrap's two edges. */
const leather = paint((_p, _n, s) => {
  const [h, deg] = s;
  const edge = Math.min(...WRAPS.flatMap(([from, to]) => [Math.abs(h - from - 0.005), Math.abs(h - to + 0.005)]));
  return edge < 0.0011 && deg % 8 < 4.2 ? STITCH : hide;
});

// Turned profiles, as (radius, height) pairs along each part's axis

const TUBE_PROFILE: Array<[number, number]> = [
  [0, 0.02],
  [0.016, 0.02],
  [0.016, 0.06],
  [0.0195, 0.064],
  [0.0195, 0.074],
  [0.016, 0.078],
  [0.016, 0.1],
  [0.0235, 0.104],
  [0.0245, 0.14],
  [0.0245, 0.152],
  [0.0295, 0.164],
  [0.031, 0.17],
  [0.031, 0.595],
  [0.0335, 0.6],
  [0.0335, 0.61],
  [0.036, 0.618],
  [0.036, 0.63],
  [0.0385, 0.64],
  [0.0385, 0.655],
  [0.036, 0.66],
  [0, 0.66],
];
const EYECUP: Array<[number, number]> = [
  [0, 0],
  [0.017, 0],
  [0.0215, 0.004],
  [0.0235, 0.012],
  [0.0205, 0.021],
  [0.0165, 0.027],
  [0, 0.027],
];
const OBJECTIVE: Array<[number, number]> = [
  [0, 0.655],
  [0.033, 0.655],
  [0.033, 0.664],
  [0, 0.664],
];
const FINDER: Array<[number, number]> = [
  [0, 0],
  [0.0095, 0],
  [0.0095, 0.012],
  [0.0125, 0.02],
  [0.0125, 0.176],
  [0.0165, 0.184],
  [0.0165, 0.2],
  [0, 0.2],
];
const FINDER_GLASS: Array<[number, number]> = [
  [0, 0.2],
  [0.0145, 0.2],
  [0.0145, 0.204],
  [0, 0.204],
];
const KNOB: Array<[number, number]> = [
  [0, 0],
  [0.023, 0],
  [0.0255, 0.004],
  [0.0255, 0.01],
  [0.0225, 0.014],
  [0, 0.014],
];
const ALT_KNOB: Array<[number, number]> = [
  [0, 0],
  [0.016, 0],
  [0.022, 0.007],
  [0.022, 0.02],
  [0.015, 0.031],
  [0.005, 0.035],
  [0, 0.035],
];
const HUB_BLOCK: Array<[number, number]> = [
  [0, 0],
  [0.04, 0],
  [0.052, 0.03],
  [0.054, 0.06],
  [0.046, 0.095],
  [0.036, 0.11],
  [0, 0.11],
];
const AZIMUTH: Array<[number, number]> = [
  [0, 0],
  [0.056, 0],
  [0.058, 0.008],
  [0.05, 0.016],
  [0.018, 0.022],
  [0.014, 0.026],
  [0.014, 0.046],
  [0, 0.046],
];
const SHOE: Array<[number, number]> = [
  [0, 0],
  [0.0185, 0],
  [0.0185, 0.012],
  [0.0175, 0.03],
  [0.0175, 0.045],
  [0, 0.045],
];
const FERRULE: Array<[number, number]> = [
  [0, 0],
  [0.0275, 0],
  [0.0275, 0.02],
  [0.0235, 0.024],
  [0, 0.024],
];

/** A turned mahogany leg from its foot up to the hub, with a bead near the bottom. */
function legProfile(length: number): Array<[number, number]> {
  return [
    [0, 0],
    [0.0125, 0],
    [0.0135, 0.02],
    [0.0165, 0.05],
    [0.019, 0.22],
    [0.0165, 0.27],
    [0.025, 0.31],
    [0.025, 0.345],
    [0.0165, 0.38],
    [0.0185, 0.5],
    [0.0215, 0.74],
    [0.022, 0.84],
    [0.019, 0.89],
    [0, length],
  ];
}

/** A solid leather band around the tube, with slightly rounded edges. */
function wrapProfile(from: number, to: number): Array<[number, number]> {
  return [
    [0, from],
    [0.0325, from],
    [0.0338, from + 0.002],
    [0.0338, to - 0.002],
    [0.0325, to],
    [0, to],
  ];
}

/** The rolled star chart: parchment, a star field with constellation lines, and a grid, drawn as SVG. */
function starChart() {
  const random = rng(21);
  const stars: Array<[number, number]> = [];
  const dots: string[] = [];
  for (let i = 0; i < 60; i++) {
    const a = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * 46;
    const x = 70 + r * Math.cos(a);
    const y = 74 + r * Math.sin(a);
    stars.push([x, y]);
    const size = 0.5 + 1.7 * random() ** 3;
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(2)}" fill="#1c2640"/>`);
  }
  const lines: string[] = [];
  stars.forEach(([x, y], i) => {
    let near = -1;
    let gap = Infinity;
    stars.forEach(([u, v], j) => {
      const d = Math.hypot(u - x, v - y);
      if (j !== i && d < gap) {
        near = j;
        gap = d;
      }
    });
    if (near >= 0 && gap < 15 && random() < 0.5) {
      const [u, v] = stars[near];
      lines.push(
        `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${u.toFixed(1)}" y2="${v.toFixed(1)}" stroke="#2d3c63" stroke-width="0.6"/>`,
      );
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 200">
<rect width="140" height="200" fill="#ecdcb0"/>
<rect x="5" y="5" width="130" height="190" fill="none" stroke="#6b4a24" stroke-width="1.6"/>
<rect x="8.5" y="8.5" width="123" height="183" fill="none" stroke="#6b4a24" stroke-width="0.5"/>
<circle cx="70" cy="74" r="50" fill="#d6c08e" stroke="#5b3e1c" stroke-width="1"/>
<circle cx="70" cy="74" r="32" fill="none" stroke="#5b3e1c" stroke-width="0.4" stroke-dasharray="2 2"/>
<circle cx="70" cy="74" r="16" fill="none" stroke="#5b3e1c" stroke-width="0.4" stroke-dasharray="2 2"/>
<line x1="20" y1="74" x2="120" y2="74" stroke="#5b3e1c" stroke-width="0.4"/>
<line x1="70" y1="24" x2="70" y2="124" stroke="#5b3e1c" stroke-width="0.4"/>
${lines.join("\n")}
${dots.join("\n")}
<text x="70" y="146" text-anchor="middle" font-family="Georgia, serif" font-size="8" fill="#3d2a14">CARTA CELESTIS</text>
<text x="70" y="158" text-anchor="middle" font-family="Georgia, serif" font-size="5" fill="#3d2a14">Lat. 52 N - Epoch 1850</text>
</svg>`;
}

export default function brassTelescope() {
  const b = createBuilder({ name: "brass-explorer-telescope" });

  const plainBrass = brass();
  const tubeBrass = brass(GROOVES, [0.026, 0.036]);
  const knurledBrass = brass([], [0.003, 0.011]);
  const wood = mahogany();

  // Skeleton: the stand is the root, and the tube swings on its altitude axle.
  b.joint("stand", { at: [0, 0, 0], dir: [0, 1, 0] });
  b.joint("tube", { parent: "stand", at: AXLE, dir: D, up: U.clone().negate(), role: "hinge" });

  // Tripod: three turned mahogany legs splayed from the hub, each with brass shoe and ferrule.
  const feet = [0, 120, 240].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return new THREE.Vector3(0.42 * Math.sin(a), 0, 0.42 * Math.cos(a));
  });
  for (const foot of feet) {
    const up = HUB.clone().sub(foot).normalize();
    const length = HUB.distanceTo(foot);
    b.lathe(legProfile(length), {
      color: mahogany(up),
      at: foot,
      axis: up,
      segments: 12,
      bone: "stand",
      name: "leg",
    });
    b.lathe(SHOE, { color: plainBrass, at: foot, axis: up, segments: 12, bone: "stand", name: "shoe" });
    b.lathe(FERRULE, {
      color: plainBrass,
      at: foot.clone().addScaledVector(up, length - 0.16),
      axis: up,
      segments: 12,
      bone: "stand",
      name: "ferrule",
    });
  }

  b.lathe(HUB_BLOCK, { color: wood, at: [0, 0.78, 0], segments: 16, bone: "stand", name: "hub" });
  b.lathe(AZIMUTH, { color: plainBrass, at: [0, 0.89, 0], segments: 16, bone: "stand", name: "azimuth" });

  // Altitude yoke: a brass U with its axle through the tube, and a mahogany slow-motion knob.
  b.sweep(
    [
      [-0.075, AXLE.y, 0],
      [-0.075, YOKE_Y, 0],
      [0.075, YOKE_Y, 0],
      [0.075, AXLE.y, 0],
    ],
    0.008,
    { color: plainBrass, bone: "stand", name: "yoke" },
  );
  b.rod([-0.095, AXLE.y, 0], [0.095, AXLE.y, 0], 0.0065, { color: plainBrass, bone: "stand", name: "axle" });
  b.lathe(ALT_KNOB, {
    color: wood,
    at: [-0.095, AXLE.y, 0],
    axis: [-1, 0, 0],
    segments: 16,
    bone: "stand",
    name: "altitude knob",
  });

  // A mahogany spreader between the back legs carries the tray.
  const onLeg = (foot: THREE.Vector3, y: number) => foot.clone().lerp(HUB, y / HUB.y);
  b.rod(onLeg(feet[2], 0.3), onLeg(feet[1], 0.3), 0.0095, {
    color: mahogany(SIDE),
    bone: "stand",
    name: "spreader",
  });

  // The tray: a wooden plate with a low rim.
  b.extrude(
    [
      [-0.18, -0.08],
      [0.18, -0.08],
      [0.18, 0.08],
      [-0.18, 0.08],
    ],
    {
      color: wood,
      at: [0, TRAY_Y, TRAY_Z],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      bevel: 0.003,
      bone: "stand",
      name: "tray",
    },
  );
  const rim = (w: number, d: number, x: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, 0.02, d), wood, {
      at: [x, TRAY_Y + 0.016, z],
      bone: "stand",
      name: "tray rim",
    });
  rim(0.36, 0.008, 0, TRAY_Z + 0.076);
  rim(0.36, 0.008, 0, TRAY_Z - 0.076);
  rim(0.008, 0.16, 0.176, TRAY_Z);
  rim(0.008, 0.16, -0.176, TRAY_Z);

  // The rolled star chart on the tray, with its red ribbon.
  const chart = svg(starChart(), { size: 512 });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 20), "#ffffff", {
    texture: chart,
    at: [0, TRAY_Y + 0.028, TRAY_Z],
    rotation: [0, 0, 90],
    bone: "stand",
    name: "star chart",
  });
  b.part(new THREE.CylinderGeometry(0.0235, 0.0235, 0.014, 20, 1, true), "#7e2418", {
    at: [0.07, TRAY_Y + 0.028, TRAY_Z],
    rotation: [0, 0, 90],
    bone: "stand",
    name: "ribbon",
  });

  // The tube, on its own joint: eyepiece end at AT, objective toward +Z.
  b.lathe(EYECUP, { color: RUBBER, at: AT, axis: D, segments: 16, bone: "tube", name: "eyecup" });
  b.lathe(TUBE_PROFILE, { color: tubeBrass, at: AT, axis: D, segments: 16, bone: "tube", name: "tube body" });
  for (const [from, to] of WRAPS)
    b.lathe(wrapProfile(from, to), {
      color: leather,
      at: AT,
      axis: D,
      segments: 16,
      bone: "tube",
      name: "leather wrap",
    });
  b.lathe(OBJECTIVE, { color: GLASS, at: AT, axis: D, segments: 16, bone: "tube", name: "objective" });

  // Two focusing knobs on the focuser, one each side.
  const focus = AT.clone().addScaledVector(D, 0.122);
  b.lathe(KNOB, {
    color: knurledBrass,
    at: focus.clone().addScaledVector(SIDE, 0.02),
    axis: SIDE,
    segments: 20,
    bone: "tube",
    name: "focus knob",
  });
  b.lathe(KNOB, {
    color: knurledBrass,
    at: focus.clone().addScaledVector(SIDE, -0.02),
    axis: SIDE.clone().negate(),
    segments: 20,
    bone: "tube",
    name: "focus knob",
  });

  // The finder scope on top of the tube, clamped by two brass posts.
  const finder = AT.clone().addScaledVector(D, 0.25).addScaledVector(U, 0.056);
  b.lathe(FINDER, { color: plainBrass, at: finder, axis: D, segments: 16, bone: "tube", name: "finder" });
  b.lathe(FINDER_GLASS, {
    color: GLASS,
    at: finder,
    axis: D,
    segments: 16,
    bone: "tube",
    name: "finder glass",
  });
  for (const h of [0.27, 0.41]) {
    const base = AT.clone().addScaledVector(D, h);
    b.rod(base.clone().addScaledVector(U, 0.02), base.clone().addScaledVector(U, 0.05), 0.0045, {
      color: plainBrass,
      bone: "tube",
      name: "finder mount",
    });
  }

  return b.root;
}
