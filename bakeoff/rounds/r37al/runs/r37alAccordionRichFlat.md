```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A stylized low-poly piano accordion with iridescent mother-of-pearl cases, ribbed black bellows, piano keys, bass buttons, grille, trim, buckles and leather shoulder straps.",
};

export default function build() {
  const b = createBuilder({ name: "italian_mother_of_pearl_accordion", detail: 1 });

  const IVORY = "#fff4d0";
  const IVORY_HI = "#fffbed";
  const PEARL = "#d9f0df";
  const PEARL_PINK = "#f2c9d9";
  const PEARL_BLUE = "#b9d9ef";
  const PEARL_GOLD = "#ead59a";
  const EBONY = "#17151c";
  const EBONY_HI = "#302737";
  const BELLOWS = "#241b28";
  const RED = "#7d1727";
  const RED_HI = "#b73542";
  const BRASS = "#c99942";
  const BRASS_HI = "#f1d47b";
  const LEATHER = "#32151b";
  const LEATHER_HI = "#6f2830";
  const SHADOW = "#110f15";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    opts: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
    opts: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      ...opts,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    opts: any = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      ...opts,
    });

  const pearlTile = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    bevel = 0.006,
  ) => {
    box([w, h, 0.012], color, [x, y, 0.205], { bevel });
  };

  // Main silhouette: two deep ornate cases enclosing a dark concertina bellows.
  box([0.245, 0.72, 0.34], SHADOW, [-0.265, 0.405, 0], { name: "bass_case_core" });
  box([0.245, 0.72, 0.34], SHADOW, [0.265, 0.405, 0], { name: "keyboard_case_core" });

  // Rounded-looking upper and lower shoulders.
  box([0.29, 0.11, 0.35], RED, [-0.26, 0.77, 0], { name: "bass_top_shoulder" });
  box([0.29, 0.11, 0.35], RED, [0.26, 0.77, 0], { name: "keyboard_top_shoulder" });
  box([0.29, 0.11, 0.35], RED, [-0.26, 0.045, 0], { name: "bass_bottom_shoulder" });
  box([0.29, 0.11, 0.35], RED, [0.26, 0.045, 0], { name: "keyboard_bottom_shoulder" });

  // Front mother-of-pearl mosaic panels on both cases.
  const bassX = -0.265;
  const keyX = 0.265;
  const tileColors = [PEARL, PEARL_PINK, PEARL_BLUE, PEARL_GOLD, IVORY_HI];

  for (const side of [-1, 1]) {
    const x = side < 0 ? bassX : keyX;
    const sideName = side < 0 ? "bass" : "treble";
    const panelW = 0.205;
    const panelH = 0.49;
    box([panelW, panelH, 0.018], PEARL, [x, 0.405, 0.184], {
      name: `${sideName}_mother_of_pearl_panel`,
    });

    const cols = 3;
    const rows = 5;
    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        const c = tileColors[(ix + iy * 2 + (side < 0 ? 1 : 0)) % tileColors.length];
        const px = x - 0.067 + ix * 0.067;
        const py = 0.22 + iy * 0.092;
        pearlTile(px, py, 0.057, 0.078, c, 0.003);
      }
    }

    // Fine diagonal-looking jewel strips.
    for (let i = 0; i < 4; i++) {
      box([0.012, 0.43, 0.009], BRASS_HI, [x - 0.096 + i * 0.064, 0.405, 0.198], {
        rotation: [0, 0, i % 2 ? -8 : 8],
        name: `${sideName}_gold_inlay_${i}`,
      });
    }

    // Outer case rails.
    box([0.025, 0.59, 0.028], BRASS, [x - 0.122, 0.405, 0.19]);
    box([0.025, 0.59, 0.028], BRASS, [x + 0.122, 0.405, 0.19]);
    box([0.235, 0.025, 0.028], BRASS, [x, 0.105, 0.19]);
    box([0.235, 0.025, 0.028], BRASS, [x, 0.705, 0.19]);
  }

  // Bellows: broad dark folds, visibly expanding in the middle.
  const foldCount = 11;
  for (let i = 0; i < foldCount; i++) {
    const t = i / (foldCount - 1);
    const x = -0.135 + t * 0.27;
    const width = i === 0 || i === foldCount - 1 ? 0.024 : 0.018;
    const height = 0.56 - Math.abs(t - 0.5) * 0.07;
    box([width, height, 0.30], BELLOWS, [x, 0.405, 0.0], {
      name: `bellows_fold_${i}`,
    });
    box([width * 0.42, height + 0.018, 0.012], RED_HI, [x, 0.405, 0.157], {
      name: `bellows_front_ridge_${i}`,
    });
    box([width * 0.42, height + 0.018, 0.012], SHADOW, [x, 0.405, -0.157], {
      name: `bellows_back_ridge_${i}`,
    });
  }

  // Bellows top and bottom leather binding.
  box([0.29, 0.035, 0.33], LEATHER_HI, [0, 0.705, 0]);
  box([0.29, 0.035, 0.33], LEATHER_HI, [0, 0.105, 0]);
  box([0.31, 0.025, 0.35], BRASS, [0, 0.728, 0]);
  box([0.31, 0.025, 0.35], BRASS, [0, 0.082, 0]);

  // Bass side grille, a dark inset rectangle with decorative brass bars.
  box([0.19, 0.19, 0.018], EBONY, [-0.265, 0.535, 0.214], {
    name: "bass_grille_inset",
  });
  for (let i = -3; i <= 3; i++) {
    cyl(0.006, 0.18, BRASS_HI, [-0.265 + i * 0.024, 0.535, 0.23], [0, 0, 1], 8, {
      name: `grille_vertical_${i + 3}`,
    });
  }
  for (let i = -2; i <= 2; i++) {
    box([0.18, 0.008, 0.008], BRASS, [-0.265, 0.535 + i * 0.035, 0.238], {
      rotation: [0, 0, i % 2 ? -10 : 10],
    });
  }
  sphere(0.027, BRASS_HI, [-0.265, 0.535, 0.249], { name: "grille_center_ornament" });

  // Bass buttons: four rows of pearl buttons, each with a brass socket.
  const buttonRows = [
    { y: 0.25, count: 3, offset: -0.034 },
    { y: 0.35, count: 4, offset: 0.0 },
    { y: 0.45, count: 4, offset: -0.017 },
    { y: 0.55, count: 3, offset: 0.018 },
    { y: 0.65, count: 3, offset: -0.018 },
  ];
  for (let r = 0; r < buttonRows.length; r++) {
    const row = buttonRows[r];
    for (let i = 0; i < row.count; i++) {
      const x = -0.265 + row.offset + (i - (row.count - 1) / 2) * 0.054;
      cyl(0.019, 0.012, BRASS, [x, row.y, 0.237], [0, 0, 1], 10, {
        name: `bass_button_socket_${r}_${i}`,
      });
      sphere(0.015, [IVORY_HI, PEARL_PINK, PEARL_BLUE][(i + r) % 3], [x, row.y, 0.247], {
        name: `bass_button_${r}_${i}`,
      });
    }
  }

  // Treble keyboard housing and lip.
  box([0.225, 0.47, 0.105], EBONY, [0.265, 0.39, 0.205], {
    name: "keyboard_well",
  });
  box([0.235, 0.055, 0.13], BRASS, [0.265, 0.66, 0.215], {
    name: "keyboard_upper_lip",
  });
  box([0.235, 0.045, 0.13], BRASS, [0.265, 0.145, 0.215], {
    name: "keyboard_lower_lip",
  });

  // Piano keys facing the player (+Z): 15 white keys and raised black keys.
  const whiteCount = 15;
  const whiteW = 0.218 / whiteCount;
  for (let i = 0; i < whiteCount; i++) {
    const y = 0.185 + (i + 0.5) * (0.41 / whiteCount);
    box([0.19, 0.024, 0.095], i % 4 === 0 ? IVORY_HI : IVORY, [0.265, y, 0.276], {
      name: `white_key_${i}`,
    });
    box([0.19, 0.004, 0.006], SHADOW, [0.265, y - 0.014, 0.326], {
      name: `key_seam_${i}`,
    });
  }

  const blackKeyPositions = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13];
  for (let i = 0; i < blackKeyPositions.length; i++) {
    const k = blackKeyPositions[i];
    const y = 0.185 + k * (0.41 / whiteCount);
    box([0.125, 0.028, 0.074], EBONY_HI, [0.265, y, 0.333], {
      name: `black_key_${i}`,
    });
    box([0.087, 0.006, 0.008], BRASS, [0.265, y + 0.006, 0.372]);
  }

  // Decorative treble emblem above the keyboard: mother-of-pearl diamond and central stud.
  const emblem = b.extrude(
    [
      [0, 0.09],
      [0.065, 0],
      [0, -0.09],
      [-0.065, 0],
    ],
    {
      at: [0.265, 0.72, 0.222],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: PEARL_GOLD,
      name: "treble_diamond_emblem",
    },
  );
  sphere(0.018, BRASS_HI, [0.265, 0.72, 0.241], { name: "emblem_center_stud" });

  // Side hinge caps and corner rivets.
  for (const side of [-1, 1]) {
    const x = side * 0.397;
    for (const y of [0.12, 0.69]) {
      cyl(0.022, 0.032, BRASS, [x, y, 0.0], [1, 0, 0], 8);
      sphere(0.011, BRASS_HI, [x + side * 0.018, y, 0], {});
    }
    for (const y of [0.13, 0.68]) {
      for (const z of [-0.14, 0.14]) {
        sphere(0.013, BRASS_HI, [x - side * 0.008, y, z], {
          name: `corner_rivet_${side}_${y}_${z}`,
        });
      }
    }
  }

  // Rear shoulder straps: two leather bands arching behind the instrument.
  const strapPathL = [
    [-0.36, 0.69, -0.17],
    [-0.47, 0.58, -0.22],
    [-0.49, 0.25, -0.22],
    [-0.36, 0.12, -0.17],
  ];
  const strapPathR = [
    [0.36, 0.69, -0.17],
    [0.47, 0.58, -0.22],
    [0.49, 0.25, -0.22],
    [0.36, 0.12, -0.17],
  ];
  for (const [name, points] of [
    ["left_shoulder_strap", strapPathL],
    ["right_shoulder_strap", strapPathR],
  ] as const) {
    b.sweep(points, 0.028, {
      color: LEATHER,
      section: { ngon: 6 },
      caps: "round",
      name,
    });
    b.sweep(points, 0.012, {
      color: LEATHER_HI,
      section: { ngon: 5 },
      caps: "round",
      name: `${name}_highlight`,
    });
  }

  // Buckles at the upper strap anchors.
  for (const side of [-1, 1]) {
    const x = side * 0.36;
    box([0.07, 0.055, 0.018], BRASS, [x, 0.675, -0.19], {
      name: `strap_buckle_${side}`,
    });
    box([0.038, 0.026, 0.022], SHADOW, [x, 0.675, -0.204]);
    cyl(0.009, 0.03, BRASS_HI, [x, 0.675, -0.217], [0, 0, 1], 8);
  }

  // Small feet keep the lowest body above the floor.
  for (const x of [-0.35, 0.35]) {
    box([0.11, 0.025, 0.17], LEATHER, [x, 0.0125, -0.02], {
      name: "accordion_foot",
    });
    sphere(0.021, BRASS, [x, 0.019, 0.09]);
  }

  // A pair of tiny mother-of-pearl maker's medallions on the lower corners.
  for (const side of [-1, 1]) {
    cyl(0.034, 0.009, PEARL_BLUE, [side * 0.34, 0.17, 0.225], [0, 0, 1], 12, {
      name: `maker_medallion_${side}`,
    });
    cyl(0.021, 0.011, PEARL_PINK, [side * 0.34, 0.17, 0.232], [0, 0, 1], 10);
    sphere(0.008, BRASS_HI, [side * 0.34, 0.17, 0.241]);
  }

  return b.root;
}
```