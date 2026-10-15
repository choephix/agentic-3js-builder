import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  paint,
  mix,
  noise,
  grain,
  svg,
  rng,
} from "../../../../src/index";
import type { Fill } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Veyrath — Dragonbone Soul Scythe",
  description:
    "A monumental, game-stylized soul scythe: segmented dragonbone crescent, spectral cutting edge, horned dragon skull, captive soul crystal and rib-cage ferrule. Ivory, blackened violet steel, antique gold and luminous ghost jade.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "DragonboneSoulScythe", paintSize: 2048 });
  const rand = rng(48117);
  const root = b.joint("weapon", { at: [0, 0, 0] });

  // Broad presentation plane is XY. Both sides of the weapon are finished.
  // This translation centres the complete silhouette, not merely the handle.
  const X = 0.225;
  const P = (x: number, y: number, z = 0) => [x + X, y, z];
  const path = (pts: number[][]) =>
    pts.map(([x, y, z = 0]) => P(x, y, z));

  const C = {
    ink: "#161623",
    recess: "#202130",
    purple: "#332d46",
    steel: "#45445b",
    steelLight: "#6e7185",
    leather: "#302b40",
    leatherEdge: "#756171",
    ivory: "#e9dfbd",
    pale: "#fff1ce",
    boneShadow: "#9f9e80",
    gold: "#bf9952",
    goldLight: "#f0d28a",
    goldDark: "#6a573b",
    tealDark: "#164f50",
    teal: "#278d80",
    mint: "#67e7ba",
    soul: "#8affd5",
    whiteSoul: "#d4ffe9",
  };

  const bone = paint((p, n) => {
    const age = noise(p, 0.105, 19);
    const fine = noise(p, 0.012, 32);
    let color = mix("#a4aa8a", "#eee3bd", 0.52 + n.y * 0.24 + n.z * 0.08);
    color = mix(color, "#fff1d0", fine * 0.12);
    return mix(color, "#797d68", Math.max(0, age - 0.56) * 0.6);
  });
  const oldBone = grain("#92977e", "#d6cfab", {
    size: 0.014,
    axis: "y",
    seed: 7,
  });
  const metal = paint((p, n) => {
    const fleck = noise(p, 0.038, 7);
    return mix(
      "#242434",
      "#626779",
      0.19 + Math.max(0, n.y) * 0.30 + Math.abs(n.z) * 0.12 + fleck * 0.16,
    );
  });
  const gold = paint((p, n) =>
    mix("#77603b", "#e1c17c", 0.40 + n.y * 0.22 + noise(p, 0.035, 3) * 0.24),
  );
  const leather = paint((p, n) =>
    mix("#242333", "#554355", 0.25 + noise(p, 0.018, 28) * 0.34 + n.y * 0.10),
  );

  const tex = (body: string, viewBox = "0 0 128 128", size = 256) =>
    svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`, { size });

  const eyeTex = tex(`
    <path d="M7 65 L33 27 L115 16 L99 77 L42 108 Z" fill="#122c32"/>
    <path d="M17 64 L40 38 L105 28 L89 73 L42 94 Z" fill="#2caa91"/>
    <path d="M35 62 L55 42 L96 35 L77 71 L47 84 Z" fill="#8bffd4"/>
    <path d="M65 38 L69 54 L59 82 L55 66 Z" fill="#f2fff0"/>
    <path d="M24 66 L43 54 M78 42 L91 38" fill="none"
      stroke="#d8fff0" stroke-width="4" stroke-linecap="round"/>
  `);

  const crackTex = tex(`
    <g fill="none" stroke-linejoin="miter">
      <path d="M72 3 L66 27 L77 43 L59 58 L64 78 L43 101 L39 124
               M77 43 L102 39 L117 23 M59 58 L34 53 L20 65
               M64 78 L86 89 L91 111"
        stroke="#777b69" stroke-width="4"/>
      <path d="M76 3 L70 27 L81 43 M68 78 L47 101"
        stroke="#fff0cb" stroke-width="2.5"/>
    </g>
  `);

  const runeTextures = [
    tex(`
      <path d="M64 8 L95 34 L64 59 L33 34 Z M64 59 V118
               M33 77 L64 96 L94 77"
        fill="none" stroke="#193c3d" stroke-width="15" stroke-linejoin="miter"/>
      <path d="M64 8 L95 34 L64 59 L33 34 Z M64 59 V118
               M33 77 L64 96 L94 77"
        fill="none" stroke="#83ebbf" stroke-width="6"/>
    `),
    tex(`
      <path d="M35 18 V88 L64 116 L93 88 V18 M35 48 L64 26 L93 48
               M64 26 V84"
        fill="none" stroke="#173f40" stroke-width="15"/>
      <path d="M35 18 V88 L64 116 L93 88 V18 M35 48 L64 26 L93 48
               M64 26 V84"
        fill="none" stroke="#83ebbf" stroke-width="6"/>
    `),
    tex(`
      <path d="M64 9 L28 52 L64 79 L100 52 Z M64 79 V119
               M38 98 H90 M64 9 V57"
        fill="none" stroke="#193c3d" stroke-width="15"/>
      <path d="M64 9 L28 52 L64 79 L100 52 Z M64 79 V119
               M38 98 H90 M64 9 V57"
        fill="none" stroke="#83ebbf" stroke-width="6"/>
    `),
  ];

  const soulSeal = tex(`
    <path d="M64 5 L110 36 L105 91 L64 123 L23 91 L18 36 Z"
      fill="#1c3138" stroke="#c1a767" stroke-width="5"/>
    <path d="M64 18 L97 43 L93 83 L64 108 L35 83 L31 43 Z"
      fill="none" stroke="#4d927d" stroke-width="3"/>
    <path d="M71 24 C88 46 76 49 83 61 C98 80 78 100 62 98
             C39 96 33 77 48 61 C57 53 50 45 61 35
             C57 54 68 59 65 69 C78 58 68 46 71 24 Z"
      fill="#83ffd0"/>
    <path d="M57 74 L63 69 L67 75 L63 88 Z" fill="#efffe7"/>
    <path d="M45 79 L55 81 M72 81 L81 77"
      stroke="#183e3c" stroke-width="4"/>
  `);

  const wrapTex = tex(`
    <rect width="128" height="128" fill="#352f44"/>
    <path d="M-32 16 L32 80 L96 16 L160 80
             M-32 80 L32 144 L96 80 L160 144
             M-32 -48 L32 16 L96 -48 L160 16"
      stroke="#6c5669" stroke-width="8" fill="none"/>
    <path d="M-32 18 L32 82 L96 18 L160 82
             M-32 82 L32 146 L96 82 L160 146"
      stroke="#a38183" stroke-width="2.5" fill="none"/>
    <g fill="#c4a16b">
      <path d="M32 51 L37 57 L32 63 L27 57 Z"/>
      <path d="M96 51 L101 57 L96 63 L91 57 Z"/>
      <path d="M64 20 L69 26 L64 32 L59 26 Z"/>
      <path d="M64 84 L69 90 L64 96 L59 90 Z"/>
    </g>
  `);

  const engravingTex = tex(`
    <path d="M12 68 L32 42 L47 57 L64 20 L82 57 L98 42 L116 68
             M18 89 L42 75 L64 105 L87 75 L110 89"
      fill="none" stroke="#8d9074" stroke-width="5"/>
    <path d="M16 68 L32 47 L47 62 L64 27 L82 62 L98 47 L112 68"
      fill="none" stroke="#fff0ca" stroke-width="2.6"/>
    <circle cx="64" cy="70" r="7" fill="#567768"/>
  `);

  function plate(
    name: string,
    outline: number[][],
    fill: Fill,
    thickness = 0.08,
    z = 0,
    bevel = 0,
  ) {
    return b.extrude(outline, {
      at: P(0, 0, z),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color: fill,
      bone: root,
      name,
    });
  }

  function ball(
    name: string,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    fill: Fill,
  ) {
    return b.part(new THREE.SphereGeometry(1, 8, 6), fill, {
      at: P(x, y, z),
      scale: [sx, sy, sz],
      bone: root,
      name,
      flat: true,
    });
  }

  function rod(name: string, pts: number[][], radius: number | number[], fill: Fill) {
    return b.sweep(catmull(path(pts)), radius, {
      color: fill,
      bone: root,
      sides: 6,
      smooth: false,
      caps: "flat",
      name,
    });
  }

  function horn(name: string, pts: number[][], radius: number, fill: Fill = bone) {
    return b.sweep(catmull(path(pts)), [radius, radius * 0.82, radius * 0.43, 0], {
      color: fill,
      bone: root,
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      name,
    });
  }

  function band(y: number, radius: number, height: number, fill: Fill, name: string) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 8), fill, {
      at: P(0.55, y),
      bone: root,
      name,
    });
  }

  function drawing(
    name: string,
    texture: THREE.Texture,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    side = 1,
    angle = 0,
    luminous = false,
  ) {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at: P(x, y, z),
      dir: [0, 0, side],
      axis: "z",
      up: [Math.sin(angle), Math.cos(angle), 0],
      texture,
      bone: root,
      name,
    });
    if (luminous) glow(part, 0.8);
    return part;
  }

  // ---------------------------------------------------------------------------
  // Blade: a solid angular crescent with a visibly thick spine and knife edge.
  // ---------------------------------------------------------------------------

  const outer = [
    [0.40, 2.43],
    [0.02, 2.62],
    [-0.43, 2.67],
    [-0.84, 2.55],
    [-1.17, 2.28],
    [-1.39, 1.94],
    [-1.50, 1.30],
  ];
  const boneInner = [
    [0.32, 2.28],
    [-0.02, 2.44],
    [-0.43, 2.45],
    [-0.72, 2.35],
    [-0.98, 2.15],
    [-1.19, 1.84],
    [-1.50, 1.30],
  ];
  const edge = [
    [0.30, 2.12],
    [-0.05, 2.22],
    [-0.42, 2.23],
    [-0.75, 2.13],
    [-1.03, 1.94],
    [-1.27, 1.64],
    [-1.50, 1.30],
  ];
  const bladeOutline = [...outer, ...edge.slice(0, -1).reverse()];
  plate("Crescent_blackened_dragonsteel", bladeOutline, metal, 0.105, 0, 0.012);

  // Continuous spectral edge. Thin bright hairline sits inside a darker jade bevel.
  const bevelInner = edge.map((e, i) => {
    const q = boneInner[i];
    return [e[0] * 0.73 + q[0] * 0.27, e[1] * 0.73 + q[1] * 0.27];
  });
  const edgeOutline = [...bevelInner, ...edge.slice(0, -1).reverse()];
  for (const side of [1, -1]) {
    glow(plate(`Spectral_cutting_bevel_${side}`, edgeOutline, C.teal, 0.012, side * 0.055), 0.5);

    for (let i = 0; i < edge.length - 1; i++) {
      const a = edge[i];
      const d = edge[i + 1];
      const ai = bevelInner[i];
      const di = bevelInner[i + 1];
      const f = 0.25;
      glow(
        plate(
          `Ghost_edge_${side}_${i}`,
          [
            a,
            d,
            [d[0] + (di[0] - d[0]) * f, d[1] + (di[1] - d[1]) * f],
            [a[0] + (ai[0] - a[0]) * f, a[1] + (ai[1] - a[1]) * f],
          ].filter((p, j, list) => j === 0 || p[0] !== list[j - 1][0] || p[1] !== list[j - 1][1]),
          C.soul,
          0.009,
          side * 0.064,
        ),
        1.1,
      );
    }
  }

  // The outer crescent is six individually carved dragon vertebral plates.
  for (let i = 0; i < outer.length - 1; i++) {
    const a = outer[i];
    const d = outer[i + 1];
    const c = boneInner[i + 1];
    const e = boneInner[i];
    const cx = (a[0] + d[0] + c[0] + e[0]) / 4;
    const cy = (a[1] + d[1] + c[1] + e[1]) / 4;
    const corners = i === 5 ? [a, d, e] : [a, d, c, e];
    const shrunk = corners.map(([x, y]) => [
      cx + (x - cx) * 0.967,
      cy + (y - cy) * 0.967,
    ]);
    plate(`Dragonbone_spine_plate_${i}`, shrunk, i % 2 ? bone : oldBone, 0.145, 0, 0.009);

    if (i < 5) {
      for (const side of [1, -1]) {
        drawing(
          `Bone_plate_carving_${side}_${i}`,
          engravingTex,
          cx,
          cy,
          side * 0.075,
          i < 3 ? 0.19 : 0.125,
          i < 3 ? 0.10 : 0.09,
          side,
          i * 0.30 - 0.12,
        );
        ball(`Spine_rivet_${side}_${i}`, cx, cy + 0.035, side * 0.079, 0.014, 0.014, 0.009, gold);
      }
    }
  }

  // A narrow dark structural seam remains visible between ivory and steel.
  for (const side of [1, -1]) {
    rod(
      `Blade_inlaid_gold_channel_${side}`,
      boneInner.slice(0, 6).map(([x, y]) => [x, y - 0.007, side * 0.066]),
      0.009,
      gold,
    );

    const runePos = [
      [0.00, 2.335, -0.14],
      [-0.29, 2.337, 0.08],
      [-0.57, 2.285, 0.29],
      [-0.82, 2.145, 0.53],
      [-1.04, 1.955, 0.65],
    ];
    runePos.forEach(([x, y, angle], i) => {
      drawing(
        `Soul_script_${side}_${i}`,
        runeTextures[i % 3],
        x,
        y,
        side * 0.057,
        i > 2 ? 0.065 : 0.075,
        i > 2 ? 0.095 : 0.115,
        side,
        angle,
        true,
      );
    });
  }

  // External osseous thorns reinforce the sickle silhouette.
  [
    { base: [0.00, 2.59], bend: [-0.03, 2.76], tip: [-0.13, 2.83], r: 0.065 },
    { base: [-0.45, 2.63], bend: [-0.53, 2.79], tip: [-0.65, 2.80], r: 0.060 },
    { base: [-0.86, 2.50], bend: [-1.00, 2.61], tip: [-1.12, 2.60], r: 0.049 },
    { base: [-1.19, 2.23], bend: [-1.34, 2.29], tip: [-1.44, 2.24], r: 0.038 },
  ].forEach((q, i) => {
    horn(`Crescent_dorsal_fang_${i}`, [
      [...q.base, 0],
      [...q.bend, 0],
      [...q.tip, 0],
    ], q.r);
  });

  // ---------------------------------------------------------------------------
  // Pole and lower counterweight.
  // ---------------------------------------------------------------------------

  b.sweep(path([[0.55, 0.19, 0], [0.55, 2.18, 0]]), 0.052, {
    color: metal,
    bone: root,
    sides: 8,
    smooth: false,
    caps: "flat",
    name: "Continuous_octagonal_tang",
  });

  // A bone heel protects the end of the shaft, above a ground-touching spike.
  plate(
    "Pommel_black_iron_spear",
    [[0.55, 0], [0.435, 0.20], [0.45, 0.32], [0.65, 0.32], [0.665, 0.20]],
    metal,
    0.115,
    0,
    0.009,
  );
  for (const side of [1, -1]) {
    plate(
      `Pommel_ivory_cheek_${side}`,
      [[0.55, 0.045], [0.475, 0.205], [0.485, 0.285], [0.53, 0.255]],
      bone,
      0.025,
      side * 0.061,
    );
    glow(plate(
      `Pommel_soul_sliver_${side}`,
      [[0.55, 0.072], [0.567, 0.215], [0.55, 0.27], [0.533, 0.215]],
      C.mint,
      0.012,
      side * 0.068,
    ), 0.8);
  }
  band(0.30, 0.083, 0.045, gold, "Pommel_gold_socket");
  band(0.345, 0.067, 0.032, C.ink, "Pommel_socket_shadow");

  // Two separated grip zones; raised bindings remain readable in silhouette.
  const grips = [
    { start: 0.39, end: 0.93, radius: 0.063 },
    { start: 1.04, end: 1.36, radius: 0.059 },
  ];
  grips.forEach((g, gi) => {
    b.part(new THREE.CylinderGeometry(g.radius, g.radius, g.end - g.start, 8), "#ffffff", {
      at: P(0.55, (g.start + g.end) / 2),
      texture: wrapTex,
      bone: root,
      name: `Woven_leather_grip_${gi}`,
    });

    const turns = gi === 0 ? 10 : 6;
    for (let i = 0; i < turns; i++) {
      const yy = g.start + (i + 0.5) * (g.end - g.start) / turns;
      const pts: number[][] = [];
      for (let j = 0; j <= 8; j++) {
        const a = (j / 8) * Math.PI * 2;
        pts.push([
          0.55 + Math.sin(a) * (g.radius + 0.002),
          yy + (j / 8 - 0.5) * 0.032,
          Math.cos(a) * (g.radius + 0.002),
        ]);
      }
      rod(`Raised_grip_binding_${gi}_${i}`, pts, 0.009, i % 3 === 0 ? C.leatherEdge : leather);
    }

    for (const yy of [g.start - 0.008, g.end + 0.008]) {
      band(yy, g.radius + 0.013, 0.024, gold, `Grip_${gi}_gold_ferrule_${yy}`);
      band(yy, g.radius + 0.016, 0.006, C.goldLight, `Grip_${gi}_ferrule_lip_${yy}`);
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        ball(
          `Grip_${gi}_ferrule_stud_${yy}_${k}`,
          0.55 + Math.sin(a) * (g.radius + 0.013),
          yy,
          Math.cos(a) * (g.radius + 0.013),
          0.009, 0.010, 0.009,
          C.goldLight,
        );
      }
    }
  });

  // Ivory knuckle between the grips with a small ancestral seal.
  band(0.985, 0.075, 0.068, bone, "Ivory_grip_separator");
  for (const side of [1, -1]) {
    plate(
      `Grip_separator_mount_${side}`,
      [[0.50, 0.985], [0.55, 1.033], [0.60, 0.985], [0.55, 0.94]],
      C.goldDark,
      0.016,
      side * 0.076,
    );
    drawing("Grip_separator_seal", soulSeal, 0.55, 0.987, side * 0.086, 0.065, 0.073, side);
  }

  // ---------------------------------------------------------------------------
  // Soul chamber: a faceted suspended crystal contained by skeletal ribs.
  // ---------------------------------------------------------------------------

  band(1.405, 0.089, 0.055, gold, "Soul_cage_lower_collar");
  band(1.80, 0.104, 0.067, gold, "Soul_cage_upper_collar");

  const crystal = b.part(new THREE.OctahedronGeometry(1, 0), C.mint, {
    at: P(0.55, 1.605, 0),
    scale: [0.103, 0.212, 0.099],
    bone: root,
    name: "Captive_soul_crystal",
    flat: true,
  });
  glow(crystal, 1.25);

  for (const side of [1, -1]) {
    plate(
      `Crystal_deep_facet_${side}`,
      [[0.55, 1.815], [0.465, 1.605], [0.55, 1.393], [0.522, 1.605]],
      C.teal,
      0.007,
      side * 0.065,
    );
    glow(plate(
      `Crystal_hot_core_${side}`,
      [[0.56, 1.76], [0.59, 1.61], [0.55, 1.46], [0.54, 1.62]],
      C.whiteSoul,
      0.008,
      side * 0.082,
    ), 1.2);
  }

  // Four bowed structural ribs, with three transverse bone clasps.
  for (const s of [1, -1]) {
    for (const zSide of [1, -1]) {
      rod(
        `Soul_cage_long_rib_${s}_${zSide}`,
        [
          [0.55 + s * 0.055, 1.405, zSide * 0.035],
          [0.55 + s * 0.145, 1.50, zSide * 0.065],
          [0.55 + s * 0.158, 1.67, zSide * 0.070],
          [0.55 + s * 0.065, 1.805, zSide * 0.035],
        ],
        [0.024, 0.032, 0.026, 0.022],
        bone,
      );
    }

    for (let i = 0; i < 3; i++) {
      const y = 1.48 + i * 0.12;
      rod(
        `Cage_transverse_claw_${s}_${i}`,
        [
          [0.55 + s * 0.135, y + 0.045, -0.07],
          [0.55 + s * 0.167, y + 0.015, 0],
          [0.55 + s * 0.128, y - 0.015, 0.09],
          [0.55 + s * 0.075, y - 0.035, 0.115],
        ],
        [0.022, 0.028, 0.022, 0.009],
        i === 1 ? oldBone : bone,
      );
    }
  }

  // The gold front and back keystones leave the crystal itself unobscured.
  for (const side of [1, -1]) {
    plate(
      `Cage_upper_keystone_${side}`,
      [[0.55, 1.70], [0.473, 1.79], [0.55, 1.88], [0.627, 1.79]],
      gold,
      0.032,
      side * 0.104,
      0.004,
    );
    drawing(
      `Cage_keystone_emblem_${side}`,
      soulSeal,
      0.55, 1.79, side * 0.123,
      0.099, 0.127, side, 0, true,
    );
  }

  // Upper neck vertebrae link the pole to the skull.
  for (let i = 0; i < 4; i++) {
    const y = 1.88 + i * 0.066;
    band(y, 0.09 + i * 0.009, 0.043, i % 2 ? oldBone : bone, `Neck_vertebra_${i}`);
    for (const s of [1, -1]) {
      horn(
        `Neck_lateral_process_${i}_${s}`,
        [
          [0.55 + s * 0.06, y, 0],
          [0.55 + s * (0.12 + i * 0.012), y + 0.01, 0.007],
          [0.55 + s * (0.145 + i * 0.012), y - 0.035, 0.01],
        ],
        0.029,
        bone,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Dragon skull: angular silhouette, deep eye sockets, separate lower mandible.
  // ---------------------------------------------------------------------------

  const skullOutline = [
    [0.81, 2.28],
    [0.68, 2.43],
    [0.47, 2.45],
    [0.28, 2.34],
    [0.19, 2.25],
    [-0.035, 2.20],
    [-0.065, 2.125],
    [0.075, 2.075],
    [0.26, 2.135],
    [0.38, 2.11],
    [0.51, 2.04],
    [0.70, 2.10],
    [0.83, 2.18],
  ];
  plate("Dragon_cranium", skullOutline, bone, 0.32, 0, 0.023);

  plate(
    "Separate_lower_mandible",
    [
      [0.70, 2.11],
      [0.60, 1.955],
      [0.35, 1.935],
      [0.07, 1.995],
      [-0.015, 2.055],
      [0.035, 2.095],
      [0.30, 2.025],
      [0.48, 2.035],
      [0.55, 2.12],
    ],
    oldBone,
    0.22,
    0,
    0.012,
  );

  for (const side of [1, -1]) {
    // A black inset shape, rather than a round eyeball, gives the skull its stare.
    plate(
      `Dragon_eye_socket_${side}`,
      [
        [0.265, 2.255],
        [0.375, 2.365],
        [0.60, 2.365],
        [0.555, 2.23],
        [0.385, 2.185],
      ],
      C.ink,
      0.019,
      side * 0.165,
      0.004,
    );
    drawing(
      `Ghost_dragon_eye_${side}`,
      eyeTex,
      0.431, 2.278, side * 0.178,
      0.255, 0.16, side, -0.13, true,
    );

    // Heavy overhanging brows and cheek struts frame the glowing negative space.
    plate(
      `Skull_angry_brow_${side}`,
      [
        [0.235, 2.27],
        [0.345, 2.387],
        [0.632, 2.405],
        [0.592, 2.35],
        [0.365, 2.335],
      ],
      bone,
      0.065,
      side * 0.177,
      0.009,
    );
    plate(
      `Skull_cheek_strut_${side}`,
      [[0.60, 2.35], [0.68, 2.335], [0.655, 2.15], [0.50, 2.105], [0.53, 2.18]],
      bone,
      0.055,
      side * 0.169,
      0.006,
    );
    plate(
      `Dragon_nostril_${side}`,
      [[0.008, 2.178], [0.113, 2.211], [0.153, 2.183], [0.083, 2.14], [0.005, 2.14]],
      C.recess,
      0.012,
      side * 0.164,
    );
    plate(
      `Jaw_inset_${side}`,
      [[0.18, 2.008], [0.37, 1.976], [0.54, 1.99], [0.56, 2.025], [0.36, 2.008]],
      C.boneShadow,
      0.009,
      side * 0.116,
    );
    ball("Jaw_hinge_shadow", 0.647, 2.105, side * 0.145, 0.066, 0.067, 0.025, C.ink);
    ball("Jaw_hinge_bone", 0.647, 2.105, side * 0.172, 0.052, 0.053, 0.022, bone);
    ball("Jaw_hinge_pin", 0.647, 2.105, side * 0.194, 0.017, 0.018, 0.009, gold);

    drawing(
      `Cranium_age_crack_${side}`,
      crackTex,
      0.715, 2.285, side * 0.162,
      0.112, 0.16, side, -0.22,
    );

    // Long canine plus smaller teeth, clearly separated from the lower jaw.
    for (let i = 0; i < 4; i++) {
      const x = 0.085 + i * 0.093;
      const topY = 2.112 + i * 0.013;
      const length = i === 2 ? 0.132 : 0.071 + i * 0.008;
      horn(
        `Upper_dragon_tooth_${side}_${i}`,
        [
          [x, topY, side * 0.107],
          [x - 0.006, topY - length * 0.65, side * 0.12],
          [x - 0.03, topY - length, side * 0.113],
        ],
        i === 2 ? 0.031 : 0.023,
      );
    }

    for (let i = 0; i < 3; i++) {
      const x = 0.17 + i * 0.105;
      horn(
        `Lower_dragon_tooth_${side}_${i}`,
        [
          [x, 2.013 - i * 0.006, side * 0.08],
          [x - 0.01, 2.057 - i * 0.004, side * 0.085],
          [x - 0.025, 2.076 - i * 0.003, side * 0.08],
        ],
        0.019,
      );
    }
  }

  // Paired swept horns; changing depth reveals both in three-quarter views.
  for (const side of [1, -1]) {
    horn(
      `Great_dragon_horn_${side}`,
      [
        [0.635, 2.38, side * 0.105],
        [0.82, 2.47, side * 0.15],
        [0.99, 2.66, side * 0.14],
        [1.05, 2.86, side * 0.09],
      ],
      0.096,
      bone,
    );
    horn(
      `Dragon_temple_horn_${side}`,
      [
        [0.73, 2.24, side * 0.09],
        [0.91, 2.29, side * 0.13],
        [1.01, 2.40, side * 0.12],
      ],
      0.063,
      oldBone,
    );
    horn(
      `Dragon_jaw_hook_${side}`,
      [
        [0.69, 2.09, side * 0.07],
        [0.82, 2.035, side * 0.11],
        [0.87, 2.105, side * 0.10],
      ],
      0.045,
      bone,
    );

    // Engraved gold horn-root cuffs, aligned along the horn's own growth.
    b.rod(
      P(0.68, 2.405, side * 0.117),
      P(0.738, 2.431, side * 0.13),
      [0.084, 0.078],
      { color: gold, bone: root, sides: 8, name: `Horn_root_cuff_${side}` },
    );
    for (let i = 0; i < 3; i++) {
      ball(
        `Horn_cuff_stud_${side}_${i}`,
        0.699 + i * 0.016,
        2.428 + i * 0.008,
        side * 0.202,
        0.009, 0.009, 0.008,
        C.goldLight,
      );
    }
  }

  // Forehead ridge: broad, overlapping, not a mass of tiny spikes.
  for (let i = 0; i < 3; i++) {
    const x = 0.29 + i * 0.115;
    plate(
      `Cranial_midline_scale_${i}`,
      [
        [x - 0.085, 2.33 + i * 0.023],
        [x + 0.025, 2.46 + i * 0.012],
        [x + 0.14, 2.405 + i * 0.015],
        [x + 0.025, 2.335 + i * 0.022],
      ],
      i === 1 ? oldBone : bone,
      0.19 - i * 0.027,
      0,
      0.008,
    );
  }

  // ---------------------------------------------------------------------------
  // Small integrated relic chains. These balance the blade without extra scenery.
  // ---------------------------------------------------------------------------

  for (let c = 0; c < 2; c++) {
    const x = 0.79 + c * 0.14;
    const yTop = 2.05 + c * 0.19;
    const count = c === 0 ? 7 : 8;
    rod(
      `Relic_chain_attachment_${c}`,
      [[0.73, yTop + 0.025, -0.035], [x, yTop, -0.035]],
      0.017,
      gold,
    );
    for (let i = 0; i < count; i++) {
      const yy = yTop - i * 0.046;
      const xx = x + Math.sin(i * 0.37) * 0.018;
      b.part(new THREE.TorusGeometry(0.022, 0.0055, 4, 8), gold, {
        at: P(xx, yy, -0.035),
        rotation: i % 2 ? [0, 65, 0] : [0, 0, 0],
        scale: [0.83, 1.23, 1],
        bone: root,
        name: `Relic_chain_${c}_link_${i}`,
      });
    }
    const yy = yTop - count * 0.046;
    const xx = x + Math.sin((count - 1) * 0.37) * 0.018;
    ball(`Relic_cap_${c}`, xx, yy, -0.035, 0.033, 0.027, 0.032, gold);
    horn(
      `Dangling_dragon_fang_${c}`,
      [
        [xx, yy - 0.012, -0.035],
        [xx + 0.023, yy - 0.085, -0.035],
        [xx - 0.012, yy - 0.16, -0.03],
      ],
      0.032,
    );
    glow(ball(
      `Relic_soul_bead_${c}`,
      xx, yy - 0.035, 0,
      0.013, 0.024, 0.009,
      C.mint,
    ), 0.8);
  }

  // Sparse carved wear on the large bone plates, never across the luminous edge.
  for (const side of [1, -1]) {
    for (let i = 0; i < 10; i++) {
      const u = rand();
      const seg = Math.floor(u * 4);
      const t = u * 4 - seg;
      const a = outer[seg];
      const d = outer[seg + 1];
      const ai = boneInner[seg];
      const di = boneInner[seg + 1];
      const x = (a[0] + (d[0] - a[0]) * t) * 0.62
        + (ai[0] + (di[0] - ai[0]) * t) * 0.38;
      const y = (a[1] + (d[1] - a[1]) * t) * 0.62
        + (ai[1] + (di[1] - ai[1]) * t) * 0.38;
      const len = 0.018 + rand() * 0.025;
      b.rod(
        P(x - 0.008, y + len / 2, side * 0.075),
        P(x + 0.008, y - len / 2, side * 0.075),
        0.0028,
        { color: C.boneShadow, bone: root, sides: 4, name: `Bone_toolmark_${side}_${i}` },
      );
    }
  }

  return b.root;
}
