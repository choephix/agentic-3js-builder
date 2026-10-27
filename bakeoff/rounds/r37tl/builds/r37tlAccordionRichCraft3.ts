import * as THREE from "three";
import { createBuilder, svg, paint, rng } from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented upright piano accordion with pearlescent shell cases, black-and-cream piano keys, bass buttons, pleated bellows, brass trim, straps, and Italian floral inlay.",
};

export default function build() {
  const b = createBuilder({ name: "italian_mother_of_pearl_accordion", detail: 1 });

  const INK = "#20151b";
  const BLACK = "#17151b";
  const IVORY = "#fff3d1";
  const CREAM = "#e9d4a8";
  const BRASS = "#bd7b28";
  const BRASS_HI = "#f0c35d";
  const BRASS_DARK = "#684018";
  const RED = "#8d1e2d";
  const WINE = "#421322";
  const BELLOWS = "#4d2021";
  const LEATHER = "#30201c";
  const PEARL = paint((p, n) => {
    const wave =
      0.5 +
      0.5 *
        Math.sin(
          p.x * 42 +
            p.y * 25 +
            p.z * 31 +
            Math.sin(p.x * 17 + p.y * 11) * 1.8,
        );
    const light = 0.65 + 0.35 * Math.max(0, n.y);
    const r = 0.75 + 0.18 * wave;
    const g = 0.82 + 0.14 * wave;
    const bl = 0.82 + 0.16 * wave;
    return [Math.min(1, r * light), Math.min(1, g * light), Math.min(1, bl * light)];
  });
  const PEARL_PINK = paint((p, n) => {
    const q = 0.5 + 0.5 * Math.sin(p.x * 38 - p.y * 29 + p.z * 17);
    return [
      0.84 + q * 0.12 + Math.max(n.y, 0) * 0.04,
      0.65 + q * 0.16,
      0.68 + q * 0.18,
    ];
  });

  const floral = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <defs>
        <radialGradient id="p"><stop stop-color="#fffdf4"/><stop offset=".45" stop-color="#f4c8d0"/><stop offset="1" stop-color="#9d566e"/></radialGradient>
        <linearGradient id="g" x2="1" y2="1"><stop stop-color="#fff6bf"/><stop offset=".5" stop-color="#c98745"/><stop offset="1" stop-color="#63301e"/></linearGradient>
      </defs>
      <rect width="256" height="256" fill="#7b1e31" opacity=".98"/>
      <path d="M128 256 C105 200 112 166 128 128 C145 167 151 201 128 256" fill="none" stroke="url(#g)" stroke-width="8"/>
      <path d="M128 150 C91 128 62 110 43 73 M128 151 C164 126 195 104 215 67 M128 124 C102 92 91 66 95 35 M128 124 C155 92 166 63 162 32"
        fill="none" stroke="#e5a84f" stroke-width="6" stroke-linecap="round"/>
      <g fill="url(#p)" stroke="#f7d98b" stroke-width="4">
        <circle cx="43" cy="73" r="21"/><circle cx="215" cy="67" r="21"/>
        <circle cx="95" cy="35" r="20"/><circle cx="162" cy="32" r="20"/>
        <circle cx="128" cy="128" r="25"/>
      </g>
      <g fill="#fffce9">
        <circle cx="36" cy="66" r="5"/><circle cx="208" cy="60" r="5"/>
        <circle cx="89" cy="28" r="5"/><circle cx="156" cy="25" r="5"/>
        <circle cx="121" cy="119" r="6"/>
      </g>
      <path d="M16 232 Q128 206 240 232" fill="none" stroke="#f5d27c" stroke-width="5"/>
      <path d="M28 220 Q128 195 228 220" fill="none" stroke="#4a1522" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );

  const medallion = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs><radialGradient id="m"><stop stop-color="#fffef5"/><stop offset=".55" stop-color="#e3a9c2"/><stop offset="1" stop-color="#754163"/></radialGradient></defs>
      <circle cx="64" cy="64" r="58" fill="#63182d" stroke="#f2c769" stroke-width="6"/>
      <circle cx="64" cy="64" r="43" fill="url(#m)" stroke="#a96631" stroke-width="4"/>
      <path d="M64 98 C42 83 42 55 64 30 C85 55 86 83 64 98Z" fill="#7c1730" stroke="#f2d98a" stroke-width="4"/>
      <path d="M64 79 C50 68 52 49 64 37 C76 49 78 68 64 79Z" fill="#f4d99a"/>
      <circle cx="64" cy="57" r="6" fill="#92243b"/>
    </svg>`,
    { size: 256 },
  );

  const trim = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 256">
      <rect width="64" height="256" fill="#5c1728"/>
      <path d="M32 0 L49 32 L32 64 L15 32 Z M32 64 L49 96 L32 128 L15 96 Z M32 128 L49 160 L32 192 L15 160 Z M32 192 L49 224 L32 256 L15 224 Z"
        fill="#e6b84d" stroke="#fff0a2" stroke-width="4"/>
      <path d="M8 0V256 M56 0V256" stroke="#f5d77d" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    name: string,
    extra: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      name,
      flat: true,
      ...extra,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    name: string,
    segments = 12,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius * 0.94, height, segments, 1),
      color,
      { at, dir: [0, 0, 1], name, flat: true },
    );

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      name,
      flat: true,
    });

  // The accordion is deliberately broad and upright, with its lowest hardware at y = 0.025.
  const leftCase = box([0.34, 1.16, 0.32], [-0.37, 0.62, 0], PEARL, "bass_case");
  const rightCase = box([0.34, 1.16, 0.32], [0.37, 0.62, 0], PEARL, "piano_case");

  // Dark red side rails make the silhouette read immediately as an accordion.
  box([0.045, 1.17, 0.35], [-0.56, 0.62, 0], WINE, "bass_outer_rail");
  box([0.045, 1.17, 0.35], [0.56, 0.62, 0], WINE, "piano_outer_rail");
  box([0.055, 1.18, 0.36], [-0.19, 0.62, 0], BRASS_DARK, "bass_inner_rail");
  box([0.055, 1.18, 0.36], [0.19, 0.62, 0], BRASS_DARK, "piano_inner_rail");

  // Pearl front plaques, inset slightly toward the viewer.
  box([0.285, 0.98, 0.012], [-0.37, 0.63, 0.169], PEARL, "bass_front_shell");
  box([0.285, 0.98, 0.012], [0.37, 0.63, 0.169], PEARL, "piano_front_shell");

  // Burgundy floral silk-like panels, each with its own gold border.
  box([0.225, 0.72, 0.014], [-0.37, 0.68, 0.18], RED, "bass_floral_panel", {
    texture: floral,
  });
  box([0.225, 0.72, 0.014], [0.37, 0.68, 0.18], RED, "piano_floral_panel", {
    texture: floral,
  });

  // Vertical gold corners and horizontal shell bands.
  for (const x of [-0.505, -0.235, 0.235, 0.505]) {
    box([0.018, 1.02, 0.018], [x, 0.63, 0.195], BRASS_HI, `gold_corner_${x}`);
  }
  for (const x of [-0.37, 0.37]) {
    for (const y of [0.12, 1.14]) {
      box([0.29, 0.025, 0.03], [x, y, 0.19], BRASS_HI, `shell_band_${x}_${y}`);
    }
  }

  // Decorative medallions.
  for (const x of [-0.37, 0.37]) {
    b.part(new THREE.CircleGeometry(0.095, 20), "#ffffff", {
      at: [x, 0.63, 0.199],
      dir: [0, 0, 1],
      axis: "z",
      texture: medallion,
      name: `mother_of_pearl_medallion_${x}`,
    });
    cylinder(0.108, 0.012, [x, 0.63, 0.187], BRASS, `medallion_rim_${x}`, 20);
    b.part(new THREE.CircleGeometry(0.092, 20), "#ffffff", {
      at: [x, 0.63, 0.2],
      dir: [0, 0, 1],
      axis: "z",
      texture: medallion,
      name: `medallion_face_${x}`,
    });
  }

  // Bellows: a deep burgundy accordion of alternating folds between the two cases.
  const foldCount = 11;
  for (let i = 0; i < foldCount; i++) {
    const x = -0.17 + (i / (foldCount - 1)) * 0.34;
    const dark = i % 2 === 0;
    box(
      [0.027, 0.83, 0.245],
      [x, 0.62, -0.005],
      dark ? BELLOWS : "#79303a",
      `bellows_fold_${i}`,
      { rotation: [0, dark ? -7 : 7, 0] },
    );
    // Gold glints on the exposed top edge of every fold.
    box([0.022, 0.82, 0.012], [x, 0.62, 0.126], BRASS_DARK, `bellows_edge_${i}`, {
      rotation: [0, dark ? -7 : 7, 0],
    });
  }
  box([0.035, 0.9, 0.28], [-0.175, 0.62, -0.01], LEATHER, "bellows_left_frame");
  box([0.035, 0.9, 0.28], [0.175, 0.62, -0.01], LEATHER, "bellows_right_frame");
  box([0.39, 0.05, 0.29], [0, 1.075, -0.01], BRASS_DARK, "bellows_top_cap");
  box([0.39, 0.05, 0.29], [0, 0.165, -0.01], BRASS_DARK, "bellows_bottom_cap");

  // Piano keyboard on the viewer-facing side of the right cabinet.
  const keyY0 = 0.22;
  const whiteCount = 14;
  const keyH = 0.061;
  const keyGap = 0.004;
  const whiteW = 0.225 / whiteCount;
  for (let i = 0; i < whiteCount; i++) {
    const y = keyY0 + i * (keyH + keyGap) + keyH * 0.5;
    box(
      [0.235, keyH, 0.075],
      [0.37, y, 0.225],
      IVORY,
      `ivory_key_${i}`,
      { rotation: [0, 0, 0] },
    );
    box([0.238, 0.009, 0.014], [0.37, y - keyH * 0.49, 0.27], BRASS_DARK, `key_seam_${i}`);
  }
  // Black keys, placed between characteristic white key pairs.
  const blackAfter = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
  for (let i = 0; i < blackAfter.length; i++) {
    const y = keyY0 + (blackAfter[i] + 1) * (keyH + keyGap) - keyGap * 0.5;
    box([0.14, keyH * 0.62, 0.09], [0.345, y, 0.275], BLACK, `ebony_key_${i}`);
    sphere(0.012, [0.345, y + keyH * 0.24, 0.325], BRASS_HI, `key_glint_${i}`);
  }
  box([0.27, 0.035, 0.09], [0.37, 0.18, 0.225], BRASS, "keyboard_bottom_rail");
  box([0.27, 0.035, 0.09], [0.37, 1.13, 0.225], BRASS, "keyboard_top_rail");

  // Bass-button board on the left front.
  box([0.255, 0.76, 0.025], [-0.37, 0.63, 0.2], WINE, "bass_button_board");
  const bassRows = 5;
  const bassCols = 3;
  for (let r = 0; r < bassRows; r++) {
    for (let c = 0; c < bassCols; c++) {
      const x = -0.455 + c * 0.085;
      const y = 0.35 + r * 0.14 + (c === 1 ? 0.025 : 0);
      cylinder(0.027, 0.022, [x, y, 0.225], c === 1 ? CREAM : BRASS_HI, `bass_button_${r}_${c}`, 12);
      cylinder(0.019, 0.025, [x, y, 0.241], c === 1 ? PEARL_PINK : PEARL, `bass_button_face_${r}_${c}`, 12);
      sphere(0.006, [x - 0.008, y + 0.009, 0.258], "#fffbe4", `button_highlight_${r}_${c}`);
    }
  }

  // Ornamental grille over the bass reeds.
  box([0.21, 0.12, 0.018], [-0.37, 0.96, 0.22], BRASS_DARK, "bass_grille_back");
  for (let i = 0; i < 9; i++) {
    const y = 0.91 + i * 0.014;
    box([0.18, 0.006, 0.025], [-0.37, y, 0.238], BRASS_HI, `grille_bar_${i}`);
  }
  for (const x of [-0.45, -0.29]) {
    box([0.012, 0.14, 0.026], [x, 0.967, 0.238], BRASS_HI, `grille_side_${x}`);
  }

  // Shell-colored shoulder corners and pearl rivets.
  for (const x of [-0.51, -0.23, 0.23, 0.51]) {
    for (const y of [0.12, 1.14]) {
      sphere(0.017, [x, y, 0.21], PEARL_PINK, `pearl_rivet_${x}_${y}`);
      sphere(0.005, [x - 0.005, y + 0.006, 0.225], "#fffce8", `rivet_shine_${x}_${y}`);
    }
  }

  // Top crown: a small raised gold crest between the cabinets.
  box([0.72, 0.045, 0.16], [0, 1.24, 0], BRASS_DARK, "top_crown_base");
  box([0.58, 0.06, 0.13], [0, 1.285, 0], BRASS, "top_crown_gold");
  b.extrude(
    [
      [-0.16, 0],
      [-0.1, 0.09],
      [-0.025, 0.05],
      [0, 0.15, "sharp"],
      [0.025, 0.05],
      [0.1, 0.09],
      [0.16, 0],
    ],
    {
      at: [0, 1.31, 0.08],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      color: PEARL_PINK,
      name: "crown_shell_crest",
    },
  );

  // Bottom feet and a narrow grounding bar, keeping the instrument stable on the floor.
  box([0.24, 0.06, 0.36], [-0.37, 0.035, 0], LEATHER, "left_foot");
  box([0.24, 0.06, 0.36], [0.37, 0.035, 0], LEATHER, "right_foot");
  box([0.84, 0.035, 0.28], [0, 0.018, -0.01], BRASS_DARK, "bottom_stabilizer");
  for (const x of [-0.37, 0.37]) {
    cylinder(0.045, 0.018, [x, 0.012, -0.11], BRASS, `rubber_brass_end_${x}`, 10);
  }

  // Back harness straps, visible as leather loops around the upper shoulders.
  box([0.045, 0.72, 0.04], [-0.63, 0.72, -0.08], LEATHER, "rear_left_strap");
  box([0.045, 0.72, 0.04], [0.63, 0.72, -0.08], LEATHER, "rear_right_strap");
  box([0.045, 0.1, 0.06], [-0.63, 0.4, 0.02], BRASS_DARK, "left_strap_buckle");
  box([0.045, 0.1, 0.06], [0.63, 0.4, 0.02], BRASS_DARK, "right_strap_buckle");

  // Small pearl buttons at the upper corners add the handcrafted Italian-instrument feel.
  for (const x of [-0.48, -0.26, 0.26, 0.48]) {
    cylinder(0.015, 0.015, [x, 1.105, 0.205], PEARL, `upper_pearl_${x}`, 10);
  }

  return b.root;
}
