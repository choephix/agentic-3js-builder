import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { catmull, polyline, spiral } from "../../../../src/path";
import { grain, mottle, paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A pot-bellied gnome inventor, 1.2 m with his drooping red hat: goggles, bell, apron and tool belt, and a backpack bristling with gadgets (steam rotor, boiler, dish antenna, lamp pole, telescope, gauge, meshing gears).",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SKIN = "#f1b48c";
const SKIN_DEEP = "#e39a76";
const NOSE = "#e9806c";
const CHEEK = "#f08f86";
const WHITE = "#f7f3ea";
const BEARD_SHADE = "#d9d3c4";
const RED = "#d8433a";
const RED_DARK = "#a82f2c";
const CREAM = "#f3e3b3";
const TEAL = "#3b9d8e";
const TEAL_DARK = "#2c7a70";
const PURPLE = "#6a4fa3";
const PURPLE_LIGHT = "#8a70c4";
const LEATHER = "#a8743f";
const LEATHER_DARK = "#6e4524";
const BOOT = "#7a4a27";
const BOOT_LIGHT = "#9a6436";
const SOLE = "#3a2616";
const BRASS = "#d9a441";
const COPPER = "#c8693a";
const COPPER_DARK = "#9c4a26";
const STEEL = "#aab6c2";
const IRON = "#5b6572";
const DARK = "#2a1d2e";
const MUSTARD = "#e4b13a";
const YELLOW = "#f1cf4c";
const GLASS = "#7fd6e8";
const FLAME = "#ffc861";
const WOOD = "#8a5a32";
const PINK = "#e8a0a0";
const CANVAS = "#cfa874";
const CANVAS_DARK = "#b88c56";
const MOUTH = "#7a2a30";
const PAPER_CORE = "#c9a96a";
const BLUE = "#4a78c8";

// Faceted tubes: few sides, flat shading.
const FLAT = { sides: 6, smooth: false } as const;

const gearOutline = (teeth: number, rOut: number, rIn: number) => {
  const pts: Array<[number, number]> = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    pts.push([Math.cos(a - step * 0.28) * rIn, Math.sin(a - step * 0.28) * rIn]);
    pts.push([Math.cos(a - step * 0.15) * rOut, Math.sin(a - step * 0.15) * rOut]);
    pts.push([Math.cos(a + step * 0.15) * rOut, Math.sin(a + step * 0.15) * rOut]);
    pts.push([Math.cos(a + step * 0.28) * rIn, Math.sin(a + step * 0.28) * rIn]);
  }
  return pts;
};

const circlePts = (cx: number, cy: number, cz: number, r: number, n: number) =>
  Array.from({ length: n }, (_, i): [number, number, number] => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r];
  });

const DIAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="31" fill="#b9822f"/>
<circle cx="32" cy="32" r="26" fill="#f6efdc"/>
<path d="M13 42 A21 21 0 0 1 19 19" stroke="#3aa655" stroke-width="5" fill="none"/>
<path d="M45 19 A21 21 0 0 1 51 42" stroke="#d63c2f" stroke-width="5" fill="none"/>
<path d="M32 9 L32 14 M12 24 L16 27 M52 24 L48 27 M8 34 L14 34 M56 34 L50 34" stroke="#3a2a1a" stroke-width="3" fill="none"/>
<path d="M32 33 L44 19" stroke="#2a2018" stroke-width="3" stroke-linecap="round"/>
<circle cx="32" cy="33" r="4" fill="#2a2018"/>
</svg>`,
  { size: 128 },
);

const gearPts = (() => {
  const n = 8;
  const step = (Math.PI * 2) / n;
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = i * step;
    for (const [da, r] of [
      [-0.28, 23],
      [-0.15, 29],
      [0.15, 29],
      [0.28, 23],
    ] as const)
      out.push(`${(32 + Math.cos(a + da * step) * r).toFixed(2)},${(32 + Math.sin(a + da * step) * r).toFixed(2)}`);
  }
  return out.join(" ");
})();

const GEAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<polygon points="${gearPts}" fill="#f4d98a" stroke="#6b4a1a" stroke-width="3"/>
<circle cx="32" cy="32" r="9" fill="#d8433a" stroke="#6b4a1a" stroke-width="3"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: hips, spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 0.4, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, 0],
      [0, 0.52, 0.01],
      [0, 0.64, 0.015],
      [0, 0.75, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const waist = spine.joints[0];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.745, 0.02], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.8, 0.03], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.86, 0.06], aim: [0, 0.84, 0.17], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const tunicPaint = mottle(TEAL, TEAL_DARK, { size: 0.09, contrast: 0.8, seed: 4 });
  const skinPaint = mottle(SKIN, SKIN_DEEP, { size: 0.07, contrast: 0.6, seed: 2 });
  const trouserPaint = stripes(PURPLE, PURPLE_LIGHT, { size: 0.035, axis: "x", width: 0.25, wobble: 0.05, seed: 6 });
  const beardPaint = grain(WHITE, BEARD_SHADE, { size: 0.012, axis: "y", seed: 1 });
  const hatBase = mottle(RED, RED_DARK, { size: 0.1, contrast: 0.7, seed: 5 });
  const hatPaint = paint((_p, _n, s) => ((((s[1] - 540 * s[0]) % 90) + 90) % 90 < 12 ? CREAM : hatBase));
  const apronPaint = mottle(grain(CANVAS, CANVAS_DARK, { size: 0.012, axis: "y", seed: 8 }), "#8a6a3e", {
    size: 0.06,
    contrast: 0.6,
    seed: 9,
  });
  const tankPaint = mottle(COPPER, COPPER_DARK, { size: 0.05, contrast: 0.8, seed: 11 });
  const packLeather = grain(LEATHER, LEATHER_DARK, { size: 0.02, axis: "y", seed: 3 });
  const packPaint = paint((_p, n, s) => {
    if (Math.abs(n.z) < 0.5) return LEATHER_DARK;
    const patch = (cx: number, cy: number, hx: number, hy: number, col: string) => {
      const ex = Math.abs(s[0] - cx);
      const ey = Math.abs(s[1] - cy);
      if (ex > hx || ey > hy) return null;
      const e = Math.min(hx - ex, hy - ey);
      if (e > 0.006 && e < 0.011) return Math.floor((s[0] + s[1]) / 0.012) % 2 ? CREAM : col;
      return col;
    };
    return (
      patch(-0.12, 0.47, 0.04, 0.032, TEAL) ?? patch(0.13, 0.45, 0.036, 0.03, RED) ?? patch(0.0, 0.8, 0.05, 0.022, BLUE) ?? packLeather
    );
  });

  // -------------------------------------------------------------------------------------------------------------
  // Torso, skirt, belt, straps
  const torsoR = (t: number): [number, number] => {
    const rx = 0.17 + 0.045 * Math.sin(Math.PI * t * 0.85) - 0.06 * t * t * t;
    return [rx, rx * 0.9];
  };
  const torso = b.sweep(spine, torsoR, {
    ...FLAT,
    sides: 8,
    color: tunicPaint,
    shift: [0, -0.02],
    caps: "flat",
  });
  const torsoSurf = b.surface(torso);

  b.lathe(
    [
      [0, 0],
      [0.215, 0],
      [0.2, 0.15],
      [0, 0.15],
    ],
    { at: [0, 0.345, 0.01], segments: 10, color: TEAL_DARK, bone: hips },
  );
  b.lathe(
    [
      [0.205, 0],
      [0.222, 0],
      [0.218, 0.025],
      [0.205, 0.025],
    ],
    { at: [0, 0.345, 0.01], segments: 10, color: MUSTARD, bone: hips },
  );
  // Collar
  b.lathe(
    [
      [0.07, 0],
      [0.115, 0],
      [0.12, 0.035],
      [0.075, 0.03],
    ],
    { at: [0, 0.735, 0.02], segments: 8, color: CREAM, bone: neck },
  );

  // Belt over the apron
  b.sweep(torsoSurf.loop([0, 0.485, 0.0125], { lift: 0.022 }), 0.02, {
    ...FLAT,
    color: LEATHER_DARK,
    bone: spine.joints[1],
  });
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.016), BRASS, { at: [0, 0.485, 0.277], bone: spine.joints[1], flat: true });
  b.part(new THREE.BoxGeometry(0.032, 0.026, 0.02), DARK, { at: [0, 0.485, 0.279], bone: spine.joints[1] });

  // Shoulder straps for the pack, draped on the torso
  for (const s of [1, -1]) {
    const strap = torsoSurf.drape(
      catmull([
        [s * 0.09, 0.8, -0.13],
        [s * 0.105, 0.77, 0.0],
        [s * 0.1, 0.7, 0.14],
        [s * 0.1, 0.6, 0.2],
        [s * 0.1, 0.5, 0.205],
      ]),
      { lift: 0.012 },
    );
    b.sweep(strap, (): [number, number] => [0.022, 0.006], { section: "box", caps: "flat", color: LEATHER });
    b.part(new THREE.BoxGeometry(0.04, 0.032, 0.012), BRASS, { at: strap.at(0.72), bone: chest, flat: true });
  }

  // Apron
  b.extrude(
    [
      [-0.07, 0.71],
      [0.07, 0.71],
      [0.075, 0.68],
      [0.12, 0.6],
      [0.13, 0.5],
      [0.14, 0.36],
      [0.07, 0.34],
      [0, 0.35],
      [-0.07, 0.34],
      [-0.14, 0.36],
      [-0.13, 0.5],
      [-0.12, 0.6],
      [-0.075, 0.68],
    ],
    { at: [0, 0, 0.238], x: [1, 0, 0], thickness: 0.014, bevel: 0.003, color: apronPaint, bone: waist },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.052, 0.375],
        [0.052, 0.375],
        [0.052, 0.45],
        [-0.052, 0.45],
      ],
      { at: [s * 0.07, 0, 0.251], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: LEATHER_DARK, bone: waist },
    );
    for (const k of [1, -1])
      b.part(new THREE.SphereGeometry(0.006, 5, 4), BRASS, { at: [s * 0.07 + k * 0.045, 0.44, 0.259], bone: waist });
    // Screwdrivers hanging from belt loops
    const hx = s * 0.125;
    b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.06, 6), s > 0 ? RED : YELLOW, {
      at: [hx, 0.46, 0.264],
      bone: waist,
      flat: true,
    });
    b.rod([hx, 0.43, 0.264], [hx, 0.35, 0.264], 0.0055, STEEL, { sides: 4, bone: waist });
  }

  // Hammer on the right hip, pouch on the left hip
  b.rod([-0.238, 0.55, 0.1], [-0.238, 0.31, 0.1], 0.013, WOOD, { ...FLAT, bone: waist });
  b.part(new THREE.BoxGeometry(0.05, 0.045, 0.115), STEEL, { at: [-0.238, 0.552, 0.1], bone: waist, flat: true });
  b.part(new THREE.BoxGeometry(0.056, 0.052, 0.02), IRON, { at: [-0.238, 0.552, 0.168], bone: waist, flat: true });
  b.part(new THREE.BoxGeometry(0.04, 0.03, 0.036), LEATHER_DARK, { at: [-0.238, 0.485, 0.1], bone: waist, flat: true });
  b.part(new THREE.BoxGeometry(0.07, 0.1, 0.09), LEATHER, { at: [0.24, 0.43, 0.08], bone: waist, flat: true });
  b.part(new THREE.BoxGeometry(0.076, 0.035, 0.096), LEATHER_DARK, { at: [0.24, 0.482, 0.08], bone: waist, flat: true });
  b.part(new THREE.SphereGeometry(0.01, 6, 4), BRASS, { at: [0.28, 0.465, 0.08], bone: waist });

  // -------------------------------------------------------------------------------------------------------------
  // Neck and head
  b.rod([0, 0.735, 0.02], [0, 0.8, 0.035], 0.055, skinPaint, { ...FLAT, bone: neck });
  b.part(new THREE.IcosahedronGeometry(0.14, 1), skinPaint, {
    at: [0, 0.9, 0.045],
    bone: head,
    scale: [1.0, 0.96, 0.98],
    flat: true,
  });
  // Lower jaw and mouth
  b.part(new THREE.IcosahedronGeometry(0.075, 1), skinPaint, {
    at: [0, 0.84, 0.105],
    bone: jaw,
    scale: [1.1, 0.55, 0.95],
    flat: true,
  });
  b.sweep(
    catmull([
      [-0.04, 0.842, 0.172],
      [0, 0.832, 0.178],
      [0.04, 0.842, 0.172],
    ]),
    0.005,
    { sides: 4, smooth: false, color: MOUTH, bone: jaw },
  );
  // Nose and cheeks
  b.part(new THREE.IcosahedronGeometry(0.042, 1), NOSE, { at: [0, 0.875, 0.175], bone: head, flat: true });
  b.part(new THREE.IcosahedronGeometry(0.01, 0), WHITE, { at: [0.012, 0.89, 0.213], bone: head, flat: true });

  for (const s of [1, -1]) {
    const ex = s * 0.05;
    b.part(new THREE.IcosahedronGeometry(0.034, 1), WHITE, {
      at: [ex, 0.915, 0.155],
      bone: head,
      scale: [1, 1.1, 0.9],
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(0.02, 1), DARK, { at: [ex, 0.912, 0.18], bone: head, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.007, 0), WHITE, {
      at: [ex + s * 0.007, 0.92, 0.198],
      bone: head,
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(0.04, 1), CHEEK, {
      at: [s * 0.088, 0.865, 0.143],
      bone: head,
      scale: [1, 0.8, 0.6],
      flat: true,
    });
    // Bushy eyebrow
    b.sweep(
      catmull([
        [s * 0.088, 0.95, 0.142],
        [s * 0.052, 0.962, 0.164],
        [s * 0.016, 0.952, 0.172],
      ]),
      [0.008, 0.018, 0.01],
      { sides: 5, smooth: false, color: WHITE, bone: head },
    );
    // Moustache sweeping out and curling up
    b.sweep(
      catmull([
        [s * 0.004, 0.868, 0.205],
        [s * 0.045, 0.856, 0.2],
        [s * 0.09, 0.855, 0.172],
        [s * 0.125, 0.875, 0.14],
        [s * 0.135, 0.9, 0.13],
      ]),
      [0.028, 0.024, 0.016, 0.01, 0.004],
      { sides: 5, smooth: false, color: beardPaint, bone: head },
    );
    // Sideburns
    b.sweep(
      catmull([
        [s * 0.128, 0.9, 0.06],
        [s * 0.127, 0.85, 0.085],
        [s * 0.1, 0.81, 0.11],
      ]),
      [0.022, 0.03, 0.03],
      { sides: 6, smooth: false, color: beardPaint, bone: head },
    );
    // Ears: big pointy gnome ears with pink insides
    b.spike([s * 0.12, 0.905, 0.03], [s, 0.35, -0.25], 0.1, 0.04, SKIN, { sides: 5, smooth: false, bone: head });
    b.spike([s * 0.125, 0.9, 0.056], [s, 0.3, -0.1], 0.08, 0.026, PINK, { sides: 5, smooth: false, bone: head });
  }

  // Pencil behind the right ear
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.1, 6), YELLOW, {
    at: [-0.14, 0.938, 0.03],
    dir: [0, 0.15, 1],
    bone: head,
    flat: true,
  });
  b.part(new THREE.ConeGeometry(0.007, 0.022, 6), WOOD, {
    at: [-0.14, 0.942, 0.092],
    dir: [0, 0.15, 1],
    bone: head,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.0075, 0.0075, 0.012, 6), PINK, {
    at: [-0.14, 0.923, -0.02],
    dir: [0, 0.15, 1],
    bone: head,
    flat: true,
  });

  // Beard: long, loft skinned to its own chain under the jaw
  const beardStations = [
    { at: [0, 0.8, 0.105], w: 0.15, h: 0.07 },
    { at: [0, 0.755, 0.19], w: 0.22, h: 0.08 },
    { at: [0, 0.68, 0.255], w: 0.23, h: 0.09 },
    { at: [0, 0.6, 0.265], w: 0.18, h: 0.085 },
    { at: [0, 0.53, 0.255], w: 0.1, h: 0.06 },
    { at: [0, 0.47, 0.245], w: 0.03, h: 0.03 },
  ];
  const beard = b.chain("beard", catmull(beardStations.map((st) => st.at)), {
    parent: jaw,
    names: ["beard1", "beard2", "beard3", "beard4", "beard5"],
  });
  b.loft(beardStations, { sides: 8, smooth: false, color: beardPaint, bone: beard });
  for (const x of [-0.035, 0, 0.035])
    b.spike([x, 0.52, 0.25], [0, -1, 0.1], 0.07, 0.03, WHITE, { sides: 4, smooth: false, bone: beard.joints[4] });

  // -------------------------------------------------------------------------------------------------------------
  // Hat: a long floppy cone on its own joint chain
  const hat = b.chain(
    "hat",
    catmull([
      [0, 0.975, 0.04],
      [0, 1.07, 0.045],
      [0, 1.16, 0.025],
      [0, 1.22, -0.05],
      [0, 1.215, -0.15],
      [0, 1.16, -0.2],
    ]),
    { parent: head, names: ["hat1", "hat2", "hat3", "hat4", "hat5"] },
  );
  const hatSweep = b.sweep(hat, [0.153, 0.142, 0.118, 0.088, 0.055, 0], {
    ...FLAT,
    sides: 8,
    color: hatPaint,
    caps: { start: "flat", end: "point" },
  });
  b.lathe(
    [
      [0.12, 0],
      [0.2, -0.014],
      [0.215, 0.008],
      [0.13, 0.04],
    ],
    { at: [0, 0.965, 0.04], segments: 10, color: RED_DARK, bone: hat.joints[0] },
  );
  b.decal(hatSweep, GEAR, { at: [0, 1.11, 0.17], dir: [0, 0.35, 1], size: [0.07, 0.07] });
  // Goggle strap, brass rims and glowing lenses
  b.sweep(catmull(circlePts(0, 1.02, 0.04, 0.152, 12), { closed: true }), 0.011, {
    sides: 4,
    smooth: false,
    color: LEATHER_DARK,
    bone: hat.joints[0],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.038, 0.009, 5, 10), BRASS, {
      at: [s * 0.058, 1.035, 0.195],
      dir: [0, 0.2, 1],
      axis: "z",
      bone: hat.joints[0],
      flat: true,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.033, 8), GLASS, {
        at: [s * 0.058, 1.035, 0.196],
        dir: [0, 0.2, 1],
        axis: "z",
        bone: hat.joints[0],
      }),
      1,
    );
  }
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.014), BRASS, {
    at: [0, 1.035, 0.197],
    bone: hat.joints[0],
    flat: true,
  });
  // Bell on the hat tip
  b.lathe(
    [
      [0, 0.025],
      [0.018, 0.025],
      [0.032, 0.0],
      [0.04, -0.04],
      [0.046, -0.05],
      [0, -0.05],
    ],
    { at: [0, 1.135, -0.2], segments: 8, color: BRASS, bone: hat.joints[4] },
  );
  b.part(new THREE.IcosahedronGeometry(0.012, 0), DARK, { at: [0, 1.083, -0.2], bone: hat.joints[4], flat: true });

  // -------------------------------------------------------------------------------------------------------------
  // Legs and boots
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.09;
    const pts = limb([x, 0.4, 0], [x, 0.07, 0.012], [0.18, 0.18], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [x, 0, 0.03],
    });
    const ankle = leg.joints[2];
    const legSweep = b.sweep(leg, [0.062, 0.058, 0.05, 0.046], { ...FLAT, color: trouserPaint });
    b.stick(new THREE.CylinderGeometry(0.032, 0.032, 0.014, 6), LEATHER, legSweep.at(0.5, 0), { embed: 0.35 });

    // Boot: curled toe, shaft, folded cuff, brass buckle, sole
    b.sweep(
      catmull([
        [x, 0.062, -0.04],
        [x, 0.058, 0.04],
        [x, 0.068, 0.11],
        [x, 0.095, 0.165],
      ]),
      [0.06, 0.068, 0.058, 0.036],
      { ...FLAT, sides: 7, color: BOOT, bone: ankle },
    );
    b.part(new THREE.CylinderGeometry(0.066, 0.07, 0.09, 7), BOOT, { at: [x, 0.125, 0.01], bone: ankle, flat: true });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 7), BOOT_LIGHT, {
      at: [x, 0.175, 0.012],
      bone: ankle,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.012, 0.04, 0.03), BRASS, { at: [x + s * 0.07, 0.14, 0.01], bone: ankle, flat: true });
    b.frustumBox([x, 0.0125, -0.065], [x, 0.0125, 0.165], [0.12, 0.025], [0.095, 0.025], {
      color: SOLE,
      bone: ankle,
    });
    const toe = b.joint(`toe${side}`, { parent: ankle, at: [x, 0.06, 0.1], dir: [0, 0, 1], role: "digit" });
    b.part(new THREE.IcosahedronGeometry(0.038, 1), BOOT_LIGHT, { at: [x, 0.1, 0.17], bone: toe, flat: true });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms and hands
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = new THREE.Vector3(s * 0.18, 0.68, 0.01);
    const el = new THREE.Vector3(s * 0.31, 0.59, 0.034);
    const wr = new THREE.Vector3(s * 0.43, 0.515, 0.079);
    const arm = b.chain(`arm${side}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const wj = arm.joints[2];
    const fj = arm.joints[1];
    b.sweep(arm, [0.05, 0.048, 0.046, 0.034, 0.03], {
      ...FLAT,
      color: SKIN,
      bands: [[0.52, tunicPaint]],
    });
    // Rolled cream cuff at the elbow, leather bracer with brass band at the wrist
    b.part(new THREE.CylinderGeometry(0.057, 0.057, 0.045, 7), CREAM, { frame: arm.at(0.52), flat: true });
    b.part(new THREE.CylinderGeometry(0.044, 0.042, 0.06, 7), LEATHER, { frame: arm.at(0.9), flat: true });
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 7), BRASS, { frame: arm.at(0.8), flat: true });

    const fd = wr.clone().sub(el).normalize();
    const spread = new THREE.Vector3(0, 0, 1);
    b.part(new THREE.IcosahedronGeometry(0.055, 1), SKIN, {
      at: wr.clone().addScaledVector(fd, 0.035),
      bone: wj,
      flat: true,
    });
    const fingers = [0.026, 0, -0.026];
    fingers.forEach((z, i) => {
      const base = wr.clone().addScaledVector(fd, 0.065).addScaledVector(spread, z);
      const d1 = fd.clone().addScaledVector(spread, z * 3);
      d1.y -= 0.15;
      d1.normalize();
      const d2 = d1.clone();
      d2.y -= 0.35;
      d2.normalize();
      const p1 = base.clone().addScaledVector(d1, 0.045);
      const p2 = p1.clone().addScaledVector(d2, 0.04);
      const ch = b.chain(`finger${i + 1}${side}`, polyline([base, p1, p2]), {
        parent: wj,
        names: [`finger${i + 1}${side}a`, `finger${i + 1}${side}b`],
        role: "digit",
      });
      b.sweep(ch, [0.017, 0.014, 0.011], { ...FLAT, color: SKIN });
    });
    const tb = wr.clone().addScaledVector(fd, 0.03).addScaledVector(spread, 0.05);
    const td = fd.clone().multiplyScalar(0.5).addScaledVector(spread, 0.8);
    td.y -= 0.1;
    td.normalize();
    const t1 = tb.clone().addScaledVector(td, 0.035);
    const t2 = t1.clone().addScaledVector(td, 0.03);
    const thumb = b.chain(`thumb${side}`, polyline([tb, t1, t2]), {
      parent: wj,
      names: [`thumb${side}a`, `thumb${side}b`],
      role: "digit",
    });
    b.sweep(thumb, [0.02, 0.016, 0.012], { ...FLAT, color: SKIN });
    // keep the forearm bone referenced for the bracer rivet
    b.part(new THREE.SphereGeometry(0.007, 5, 4), BRASS, {
      at: wr.clone().addScaledVector(fd, -0.02).add(new THREE.Vector3(0, 0.04, 0)),
      bone: fj,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Backpack of gadgets
  const packOutline: Array<[number, number]> = [
    [-0.15, 0.42],
    [0.15, 0.42],
    [0.17, 0.5],
    [0.18, 0.72],
    [0.14, 0.84],
    [-0.14, 0.84],
    [-0.18, 0.72],
    [-0.17, 0.5],
  ];
  b.extrude(packOutline, {
    at: [0, 0, -0.22],
    x: [1, 0, 0],
    thickness: 0.17,
    bevel: 0.02,
    smoothing: 1,
    color: packPaint,
    bone: chest,
  });
  const rivetPts: Array<[number, number, number]> = [];
  packOutline.forEach((pt, i) => {
    const q = packOutline[(i + 1) % packOutline.length];
    const len = Math.hypot(q[0] - pt[0], q[1] - pt[1]);
    const n = Math.max(1, Math.round(len / 0.055));
    for (let k = 0; k < n; k++) {
      const u = k / n;
      const x = pt[0] + (q[0] - pt[0]) * u;
      const y = pt[1] + (q[1] - pt[1]) * u;
      const dx = -x;
      const dy = 0.63 - y;
      const d = Math.hypot(dx, dy) || 1;
      rivetPts.push([x + (dx / d) * 0.034, y + (dy / d) * 0.034, -0.31]);
    }
  });
  const rivets = mergeGeometries(
    rivetPts.map((p) => new THREE.SphereGeometry(0.0075, 5, 4).translate(p[0], p[1], p[2])),
  );
  if (rivets) b.part(rivets, BRASS, { bone: chest, at: [0, 0, 0] });

  // Lid on a hinge, with straps, lock and a brass handle
  const lid = b.joint("packLid", { parent: chest, at: [0, 0.845, -0.3], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.BoxGeometry(0.31, 0.035, 0.21), LEATHER_DARK, { at: [0, 0.858, -0.215], bone: lid, flat: true });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.035, 0.042, 0.216), LEATHER, { at: [s * 0.1, 0.862, -0.215], bone: lid, flat: true });
  b.part(new THREE.BoxGeometry(0.05, 0.03, 0.016), BRASS, { at: [0, 0.85, -0.106], bone: lid, flat: true });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8, Math.PI), BRASS, {
    at: [0, 0.876, -0.3],
    dir: [0, 0, 1],
    axis: "z",
    bone: lid,
    flat: true,
  });

  // Rear: straps, gauge, meshing gears
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.14, 0.01), LEATHER, { at: [s * 0.1, 0.79, -0.31], bone: chest, flat: true });
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.014), BRASS, { at: [s * 0.1, 0.725, -0.314], bone: chest, flat: true });
  }
  b.part(new THREE.TorusGeometry(0.052, 0.007, 5, 10), BRASS, {
    at: [0, 0.73, -0.309],
    dir: [0, 0, -1],
    axis: "z",
    bone: chest,
    flat: true,
  });
  b.part(new THREE.CircleGeometry(0.052, 10), "#ffffff", {
    at: [0, 0.73, -0.3115],
    dir: [0, 0, -1],
    axis: "z",
    bone: chest,
    texture: DIAL,
  });
  const gearBig = b.joint("gearBig", { parent: chest, at: [0.075, 0.56, -0.31], dir: [0, 0, -1], role: "hinge" });
  const gearSmall = b.joint("gearSmall", { parent: chest, at: [-0.06, 0.605, -0.31], dir: [0, 0, -1], role: "hinge" });
  b.extrude(gearOutline(10, 0.075, 0.058), {
    at: [0.075, 0.56, -0.31],
    x: [1, 0, 0],
    thickness: 0.014,
    bevel: 0.002,
    color: BRASS,
    bone: gearBig,
  });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), DARK, {
    at: [0.075, 0.56, -0.318],
    dir: [0, 0, -1],
    bone: gearBig,
    flat: true,
  });
  b.extrude(gearOutline(8, 0.055, 0.042), {
    at: [-0.06, 0.605, -0.31],
    x: [1, 0, 0],
    thickness: 0.014,
    bevel: 0.002,
    color: COPPER,
    bone: gearSmall,
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), DARK, {
    at: [-0.06, 0.605, -0.318],
    dir: [0, 0, -1],
    bone: gearSmall,
    flat: true,
  });

  // Steam rotor on a mast
  b.rod([0, 0.845, -0.285], [0, 0.965, -0.285], 0.012, STEEL, { sides: 6, smooth: false, bone: chest });
  const rotor = b.joint("rotor", { parent: chest, at: [0, 0.97, -0.285], dir: [0, 1, 0], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.03, 8), BRASS, { at: [0, 0.97, -0.285], bone: rotor, flat: true });
  b.part(new THREE.ConeGeometry(0.02, 0.03, 6), RED, { at: [0, 0.998, -0.285], bone: rotor, flat: true });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    b.extrude(
      [
        [0.02, -0.018],
        [0.1, -0.03],
        [0.13, -0.01],
        [0.13, 0.01],
        [0.1, 0.03],
        [0.02, 0.018],
      ],
      {
        at: [0, 0.97, -0.285],
        x: [Math.cos(a), 0, Math.sin(a)],
        y: [-Math.sin(a), 0, Math.cos(a)],
        thickness: 0.008,
        bevel: 0.002,
        color: paint((_p, _n, s) => (s[0] > 0.1 ? RED : MUSTARD)),
        bone: rotor,
      },
    );
  }

  // Antenna with dish (right), lamp pole with lantern (left)
  const antenna = b.chain(
    "antenna",
    polyline([
      [-0.12, 0.86, -0.19],
      [-0.125, 1.0, -0.19],
      [-0.13, 1.14, -0.19],
    ]),
    { parent: chest, names: ["antenna1", "antenna2"], role: "hinge" },
  );
  b.sweep(antenna, [0.014, 0.01, 0.006], { sides: 6, smooth: false, color: STEEL });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 6), BRASS, {
    at: [-0.125, 1.0, -0.19],
    bone: antenna.joints[1],
    flat: true,
  });
  b.lathe(
    [
      [0, 0],
      [0.05, 0.035],
      [0.053, 0.04],
      [0, 0.012],
    ],
    {
      at: [-0.13, 1.14, -0.19],
      axis: [-0.1, 0.6, 0.7],
      segments: 8,
      color: COPPER,
      bone: antenna.joints[1],
    },
  );
  b.rod([-0.13, 1.14, -0.19], [-0.134, 1.18, -0.153], 0.004, STEEL, { sides: 4, bone: antenna.joints[1] });
  b.part(new THREE.IcosahedronGeometry(0.01, 0), RED, { at: [-0.134, 1.185, -0.15], bone: antenna.joints[1], flat: true });

  b.sweep(
    catmull([
      [0.12, 0.855, -0.19],
      [0.15, 0.99, -0.19],
      [0.22, 1.07, -0.15],
      [0.3, 1.07, -0.08],
      [0.32, 1.04, -0.03],
    ]),
    [0.012, 0.01, 0.008],
    { sides: 5, smooth: false, color: IRON, bone: chest },
  );
  const lantern = b.joint("lanternSwing", {
    parent: chest,
    at: [0.32, 1.035, -0.03],
    dir: [0, -1, 0],
    role: "hinge",
  });
  b.part(new THREE.TorusGeometry(0.014, 0.004, 4, 8), BRASS, { at: [0.32, 1.02, -0.03], bone: lantern, flat: true });
  b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.01, 8), BRASS, { at: [0.32, 0.9, -0.03], bone: lantern, flat: true });
  glow(b.part(new THREE.BoxGeometry(0.044, 0.06, 0.044), FLAME, { at: [0.32, 0.94, -0.03], bone: lantern }), 1.5);
  b.part(new THREE.ConeGeometry(0.04, 0.035, 4), BRASS, {
    at: [0.32, 0.988, -0.03],
    rotation: [0, 45, 0],
    bone: lantern,
    flat: true,
  });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.rod([0.32 + sx * 0.024, 0.905, -0.03 + sz * 0.024], [0.32 + sx * 0.024, 0.97, -0.03 + sz * 0.024], 0.003, BRASS, {
        sides: 4,
        bone: lantern,
      });

  // Left boiler with sight glass, bands, valve and pipe to the rotor
  b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.3, 8), tankPaint, { at: [0.228, 0.6, -0.22], bone: chest, flat: true });
  b.part(new THREE.IcosahedronGeometry(0.056, 1), COPPER, {
    at: [0.228, 0.75, -0.22],
    scale: [1, 0.65, 1],
    bone: chest,
    flat: true,
  });
  b.part(new THREE.IcosahedronGeometry(0.056, 1), COPPER_DARK, {
    at: [0.228, 0.45, -0.22],
    scale: [1, 0.55, 1],
    bone: chest,
    flat: true,
  });
  for (const y of [0.5, 0.7])
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), BRASS, { at: [0.228, y, -0.22], bone: chest, flat: true });
  b.part(new THREE.BoxGeometry(0.014, 0.16, 0.036), BRASS, { at: [0.279, 0.6, -0.22], bone: chest, flat: true });
  glow(b.part(new THREE.BoxGeometry(0.012, 0.14, 0.022), GLASS, { at: [0.286, 0.6, -0.22], bone: chest }), 0.8);
  b.part(new THREE.TorusGeometry(0.024, 0.006, 4, 8), RED, {
    at: [0.228, 0.6, -0.164],
    dir: [0, 0, 1],
    axis: "z",
    bone: chest,
    flat: true,
  });
  b.rod([0.228, 0.6, -0.17], [0.228, 0.6, -0.16], 0.006, BRASS, { sides: 4, bone: chest });
  b.sweep(
    catmull([
      [0.228, 0.79, -0.22],
      [0.2, 0.9, -0.25],
      [0.1, 0.93, -0.3],
      [0.0, 0.9, -0.285],
    ]),
    0.014,
    { sides: 5, smooth: false, color: BRASS, bone: chest },
  );
  b.part(new THREE.TorusGeometry(0.022, 0.005, 4, 8), RED, {
    at: [0.12, 0.93, -0.29],
    dir: [0, 1, 0.2],
    axis: "z",
    bone: chest,
    flat: true,
  });

  // Right side: spyglass strapped on, spring coil
  b.rod([-0.215, 0.74, -0.34], [-0.215, 0.74, -0.24], 0.03, LEATHER_DARK, { sides: 8, smooth: false, bone: chest });
  b.rod([-0.215, 0.74, -0.24], [-0.215, 0.74, -0.14], 0.025, BRASS, { sides: 8, smooth: false, bone: chest });
  b.rod([-0.215, 0.74, -0.14], [-0.215, 0.74, -0.075], 0.02, BRASS, { sides: 8, smooth: false, bone: chest });
  glow(
    b.part(new THREE.CircleGeometry(0.017, 8), GLASS, {
      at: [-0.215, 0.74, -0.0735],
      dir: [0, 0, 1],
      axis: "z",
      bone: chest,
    }),
    0.9,
  );
  for (const z of [-0.29, -0.19])
    b.part(new THREE.TorusGeometry(0.031, 0.006, 4, 8), LEATHER, { at: [-0.215, 0.74, z], bone: chest, flat: true });
  b.sweep(spiral([-0.205, 0.46, -0.2], [-0.175, 0.46, -0.2], [0, 1, 0], { turns: 6, r1: 0.03, pitch: 0.028 }), 0.005, {
    sides: 4,
    smooth: false,
    color: BRASS,
    bone: chest,
  });
  b.rod([-0.205, 0.455, -0.2], [-0.205, 0.635, -0.2], 0.008, STEEL, { sides: 5, bone: chest });
  for (const y of [0.455, 0.632])
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8), IRON, { at: [-0.205, y, -0.2], bone: chest, flat: true });

  // Blueprint scroll tied under the pack
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), CREAM, { at: [0, 0.4, -0.27], dir: [1, 0, 0], bone: chest, flat: true });
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.412, 6), PAPER_CORE, {
    at: [0, 0.4, -0.27],
    dir: [1, 0, 0],
    bone: chest,
    flat: true,
  });
  for (const x of [-0.1, 0.1])
    b.part(new THREE.TorusGeometry(0.043, 0.007, 4, 8), RED, {
      at: [x, 0.4, -0.27],
      dir: [1, 0, 0],
      axis: "z",
      bone: chest,
      flat: true,
    });

  return b.root;
}
