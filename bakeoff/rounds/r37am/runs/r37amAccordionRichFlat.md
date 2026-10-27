```ts
import * as THREE from "three";
import { createBuilder, paint, noise, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented low-poly piano accordion with pearlescent end cabinets, black bellows, piano keys, bass buttons, gold trim, shell inlays, grillework, and floral Italian decoration.",
};

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const IVORY = "#fff2d1";
  const PEARL = "#f5e8cf";
  const SHELL_PINK = "#e6a6ad";
  const SHELL_MINT = "#8fc8b5";
  const SHELL_BLUE = "#9ebbd0";
  const SHELL_LILAC = "#b59dbf";
  const SHELL_GOLD = "#e4bd68";
  const GOLD = "#bd7b28";
  const GOLD_LIGHT = "#f4d58b";
  const DARK_GOLD = "#704016";
  const EBONY = "#21191b";
  const BELLOWS = "#302126";
  const BELLOWS_HIGHLIGHT = "#68424a";
  const KEY_BLACK = "#171316";
  const RED = "#9f3036";
  const GREEN = "#3f806d";
  const BLUE = "#3c6d9a";
  const INK = "#291820";

  const pearl = paint((p, n) => {
    const a = noise(p, 0.12, 17);
    const c = noise(p, 0.035, 31);
    if (n.y > 0.45 && c > 0.68) return SHELL_GOLD;
    if (a < 0.27) return SHELL_PINK;
    if (a < 0.48) return PEARL;
    if (a < 0.7) return SHELL_MINT;
    return SHELL_BLUE;
  });

  const pearlSoft = paint((p, n) => {
    const a = noise(p, 0.16, 9);
    if (n.z > 0.45 && a > 0.72) return SHELL_PINK;
    if (a > 0.55) return PEARL;
    if (a > 0.3) return SHELL_LILAC;
    return SHELL_BLUE;
  });

  const box = (
    size: [number, number, number],
    color: any,
    at: [number, number, number],
    name: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(...size);
    if (bevel > 0) {
      // A second, slightly smaller shell gives the broad beveled puppet-like rim.
      b.part(g, color, { at, name });
    } else {
      b.part(g, color, { at, name });
    }
  };

  const cyl = (
    radius: number,
    height: number,
    color: any,
    at: [number, number, number],
    name: string,
    sides = 10,
    dir: [number, number, number] = [0, 1, 0],
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      dir,
      name,
      flat: true,
    });
  };

  const sphere = (
    radius: number,
    color: any,
    at: [number, number, number],
    name: string,
    scale?: [number, number, number],
  ) => {
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      scale,
      name,
      flat: true,
    });
  };

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: any,
    name: string,
  ) => b.rod(a, z, radius, { color, name, caps: "round" });

  const panel = (
    x: number,
    color: any,
    name: string,
    front = true,
  ) => {
    const z = front ? 0.278 : -0.278;
    box([0.285, 0.76, 0.018], color, [x, 0.83, z], name);
    box([0.245, 0.72, 0.012], pearlSoft, [x, 0.83, front ? 0.289 : -0.289], `${name}-inset`);
  };

  // -------------------------------------------------------------------------------------------
  // Main cabinets: two squat, heavy Italian end boxes, raised just above the floor.
  // -------------------------------------------------------------------------------------------

  box([0.32, 0.98, 0.56], pearl, [-0.59, 0.78, 0], "left-shell-cabinet");
  box([0.32, 0.98, 0.56], pearl, [0.59, 0.78, 0], "right-shell-cabinet");

  // Dark inner collars make the bellows look deeply socketed.
  box([0.10, 0.88, 0.47], DARK_GOLD, [-0.405, 0.82, 0], "left-inner-collar");
  box([0.10, 0.88, 0.47], DARK_GOLD, [0.405, 0.82, 0], "right-inner-collar");

  // Broad pearloid front and rear panels.
  panel(-0.59, pearlSoft, "left-front-panel", true);
  panel(0.59, pearlSoft, "right-front-panel", true);
  panel(-0.59, pearl, "left-rear-panel", false);
  panel(0.59, pearl, "right-rear-panel", false);

  // Top and bottom cap plates.
  for (const x of [-0.59, 0.59]) {
    box([0.30, 0.035, 0.54], GOLD, [x, 1.295, 0], `top-gold-cap-${x}`);
    box([0.30, 0.035, 0.54], DARK_GOLD, [x, 0.265, 0], `bottom-dark-cap-${x}`);
    box([0.255, 0.015, 0.48], GOLD_LIGHT, [x, 1.316, 0], `top-cap-highlight-${x}`);
  }

  // Gold perimeter trim on the front faces.
  for (const x of [-0.59, 0.59]) {
    const x0 = x - 0.135;
    const x1 = x + 0.135;
    const y0 = 0.47;
    const y1 = 1.20;
    const z = 0.304;
    rod([x0, y0, z], [x1, y0, z], 0.009, GOLD, `trim-bottom-${x}`);
    rod([x0, y1, z], [x1, y1, z], 0.009, GOLD_LIGHT, `trim-top-${x}`);
    rod([x0, y0, z], [x0, y1, z], 0.009, GOLD, `trim-left-${x}`);
    rod([x1, y0, z], [x1, y1, z], 0.009, GOLD_LIGHT, `trim-right-${x}`);
    for (const yy of [0.49, 1.18]) {
      for (const xx of [x0, x1]) sphere(0.018, SHELL_GOLD, [xx, yy, 0.316], `trim-rivet-${x}-${xx}-${yy}`);
    }
  }

  // -------------------------------------------------------------------------------------------
  // Central concertina bellows. A deep box plus repeated angular pleat ribs.
  // -------------------------------------------------------------------------------------------

  box([0.82, 0.84, 0.43], BELLOWS, [0, 0.83, 0], "bellows-core");

  const pleatXs = [-0.37, -0.30, -0.23, -0.16, -0.09, 0, 0.09, 0.16, 0.23, 0.30, 0.37];
  for (let i = 0; i < pleatXs.length; i++) {
    const x = pleatXs[i];
    box([0.027, 0.87, 0.455], i % 2 ? BELLOWS_HIGHLIGHT : EBONY, [x, 0.83, 0], `bellows-pleat-${i}`);
    box([0.010, 0.80, 0.018], GOLD, [x, 0.83, 0.235], `bellows-front-stitch-${i}`);
    box([0.010, 0.80, 0.014], GOLD, [x, 0.83, -0.235], `bellows-rear-stitch-${i}`);
  }

  // Top and bottom bellows rails.
  box([0.82, 0.045, 0.47], DARK_GOLD, [0, 1.27, 0], "bellows-top-rail");
  box([0.82, 0.045, 0.47], DARK_GOLD, [0, 0.39, 0], "bellows-bottom-rail");
  box([0.76, 0.014, 0.46], GOLD_LIGHT, [0, 1.296, 0], "bellows-top-highlight");

  // Little corner screws where the bellows meet the cabinets.
  for (const x of [-0.42, 0.42]) {
    for (const y of [0.43, 1.24]) {
      cyl(0.016, 0.012, GOLD_LIGHT, [x, y, 0.245], `bellows-corner-${x}-${y}`, 8, [0, 0, 1]);
    }
  }

  // -------------------------------------------------------------------------------------------
  // Piano keyboard on the viewer-facing side of the right cabinet.
  // -------------------------------------------------------------------------------------------

  box([0.26, 0.86, 0.055], EBONY, [0.58, 0.80, 0.315], "keyboard-bed");

  const whiteCount = 13;
  const whiteH = 0.056;
  const whiteStart = 0.43;
  for (let i = 0; i < whiteCount; i++) {
    const y = whiteStart + i * whiteH + whiteH * 0.5;
    box([0.205, whiteH - 0.004, 0.075], IVORY, [0.58, y, 0.355], `piano-white-${i}`);
    box([0.205, 0.006, 0.006], GOLD, [0.58, y + whiteH * 0.5 - 0.003, 0.394], `piano-key-seam-${i}`);
  }

  const blackKeys = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
  for (let i = 0; i < blackKeys.length; i++) {
    const k = blackKeys[i];
    const y = whiteStart + (k + 1) * whiteH;
    box([0.125, 0.034, 0.09], KEY_BLACK, [0.625, y, 0.397], `piano-black-${i}`);
    box([0.11, 0.006, 0.012], SHELL_GOLD, [0.625, y - 0.013, 0.445], `black-key-glint-${i}`);
  }

  // Keyboard end cheeks and a pearl nameplate.
  box([0.23, 0.035, 0.095], GOLD, [0.58, 0.415, 0.35], "keyboard-lower-cheek");
  box([0.23, 0.035, 0.095], GOLD, [0.58, 1.185, 0.35], "keyboard-upper-cheek");
  box([0.13, 0.075, 0.008], SHELL_PINK, [0.58, 0.285, 0.414], "keyboard-nameplate");
  rod([0.53, 0.285, 0.421], [0.63, 0.285, 0.421], 0.004, GOLD_LIGHT, "keyboard-nameplate-line");

  // -------------------------------------------------------------------------------------------
  // Bass button board on left cabinet.
  // -------------------------------------------------------------------------------------------

  box([0.235, 0.66, 0.035], INK, [-0.59, 0.83, 0.315], "bass-button-board");
  const buttonRows = [
    [0.51, 0.63, 0.75, 0.87, 0.99, 1.11],
    [0.55, 0.67, 0.79, 0.91, 1.03, 1.15],
    [0.51, 0.63, 0.75, 0.87, 0.99, 1.11],
  ];
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < buttonRows[col].length; row++) {
      const y = buttonRows[col][row];
      const x = -0.665 + col * 0.075;
      cyl(0.026, 0.018, [SHELL_PINK, SHELL_MINT, SHELL_BLUE][(row + col) % 3], [x, y, 0.345], `bass-button-${col}-${row}`, 10, [0, 0, 1]);
      cyl(0.014, 0.006, GOLD_LIGHT, [x, y, 0.358], `bass-button-cap-${col}-${row}`, 8, [0, 0, 1]);
    }
  }

  // Two larger bass register switches.
  for (const y of [0.43, 1.22]) {
    cyl(0.043, 0.022, SHELL_GOLD, [-0.59, y, 0.345], `bass-register-${y}`, 10, [0, 0, 1]);
    cyl(0.025, 0.008, RED, [-0.59, y, 0.36], `bass-register-red-${y}`, 8, [0, 0, 1]);
  }

  // -------------------------------------------------------------------------------------------
  // Ornamental Italian shell mosaics on both large front panels.
  // -------------------------------------------------------------------------------------------

  const flower = (cx: number, cy: number, side: number, tag: string) => {
    // Central medallion.
    cyl(0.062, 0.018, SHELL_GOLD, [cx, cy, 0.324], `${tag}-medallion`, 12, [0, 0, 1]);
    cyl(0.035, 0.021, SHELL_PINK, [cx, cy, 0.338], `${tag}-medallion-pink`, 10, [0, 0, 1]);

    const petals = [
      [0, 0.10, SHELL_MINT],
      [0, -0.10, SHELL_BLUE],
      [0.10, 0, SHELL_LILAC],
      [-0.10, 0, SHELL_PINK],
      [0.073, 0.073, SHELL_GOLD],
      [-0.073, 0.073, SHELL_MINT],
      [0.073, -0.073, SHELL_BLUE],
      [-0.073, -0.073, SHELL_LILAC],
    ];
    for (let i = 0; i < petals.length; i++) {
      const [dx, dy, c] = petals[i] as [number, number, any];
      cyl(0.034, 0.014, c, [cx + dx * side, cy + dy, 0.326], `${tag}-petal-${i}`, 8, [0, 0, 1]);
    }

    // Four curling gold leaves.
    rod([cx - 0.13 * side, cy, 0.325], [cx - 0.18 * side, cy + 0.07, 0.325], 0.008, GOLD, `${tag}-leaf-l`);
    rod([cx + 0.13 * side, cy, 0.325], [cx + 0.18 * side, cy - 0.07, 0.325], 0.008, GOLD, `${tag}-leaf-r`);
    rod([cx, cy + 0.13, 0.325], [cx + 0.065 * side, cy + 0.18, 0.325], 0.008, GOLD_LIGHT, `${tag}-leaf-t`);
    rod([cx, cy - 0.13, 0.325], [cx - 0.065 * side, cy - 0.18, 0.325], 0.008, GOLD_LIGHT, `${tag}-leaf-b`);
  };

  flower(-0.59, 0.84, 1, "left-floral");
  flower(0.59, 0.84, -1, "right-floral");

  // Tiny surrounding shell studs form a starburst around each medallion.
  for (const x of [-0.59, 0.59]) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const xx = x + Math.cos(a) * 0.19;
      const yy = 0.84 + Math.sin(a) * 0.29;
      cyl(0.011, 0.012, i % 2 ? SHELL_GOLD : IVORY, [xx, yy, 0.323], `star-stud-${x}-${i}`, 7, [0, 0, 1]);
    }
  }

  // Decorative shell diamonds above and below the flowers.
  for (const x of [-0.59, 0.59]) {
    for (const [yy, cc] of [
      [0.48, SHELL_BLUE],
      [1.20, SHELL_PINK],
    ] as [number, any][]) {
      const diamond = b.extrude(
        [
          [0, 0.045],
          [0.038, 0],
          [0, -0.045],
          [-0.038, 0],
        ],
        {
          at: [x, yy, 0.326],
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.012,
          color: cc,
          name: `shell-diamond-${x}-${yy}`,
        },
      );
      void diamond;
    }
  }

  // -------------------------------------------------------------------------------------------
  // Grilles and vents: pearl cabinet edge bars, dark openings, gold bars.
  // -------------------------------------------------------------------------------------------

  for (const x of [-0.59, 0.59]) {
    box([0.20, 0.16, 0.018], EBONY, [x, 0.58, 0.324], `vent-dark-${x}`);
    for (let i = -2; i <= 2; i++) {
      rod([x - 0.075, 0.58 + i * 0.027, 0.338], [x + 0.075, 0.58 + i * 0.027, 0.338], 0.006, GOLD, `vent-bar-${x}-${i}`);
    }
    box([0.20, 0.014, 0.022], GOLD_LIGHT, [x, 0.675, 0.34], `vent-top-${x}`);
    box([0.20, 0.014, 0.022], DARK_GOLD, [x, 0.485, 0.34], `vent-bottom-${x}`);
  }

  // A small crown-like flourish on each upper cabinet corner.
  for (const s of [-1, 1]) {
    const x = s * 0.59;
    for (let i = -1; i <= 1; i++) {
      const yy = 1.16 + Math.abs(i) * 0.045;
      cyl(0.014, 0.018, GOLD_LIGHT, [x + i * 0.06, yy, 0.337], `crown-${s}-${i}`, 8, [0, 0, 1]);
    }
  }

  // -------------------------------------------------------------------------------------------
  // Rear shoulder strap anchors and visible leather strap loops.
  // -------------------------------------------------------------------------------------------

  for (const x of [-0.59, 0.59]) {
    cyl(0.035, 0.024, GOLD, [x, 1.13, -0.29], `rear-strap-upper-${x}`, 10, [0, 0, 1]);
    cyl(0.035, 0.024, GOLD, [x, 0.47, -0.29], `rear-strap-lower-${x}`, 10, [0, 0, 1]);
    rod([x, 1.13, -0.315], [x, 0.47, -0.315], 0.018, RED, `rear-strap-${x}`);
  }

  // -------------------------------------------------------------------------------------------
  // Front crest and maker's plaque, the final unmistakable Italian flourish.
  // -------------------------------------------------------------------------------------------

  const plaqueTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64">
      <rect x="2" y="2" width="236" height="60" rx="10" fill="#f7dfaa" stroke="#5b2e18" stroke-width="5"/>
      <path d="M22 45 Q45 13 68 45 M172 45 Q195 13 218 45" fill="none" stroke="#a03a3f" stroke-width="6"/>
      <text x="120" y="39" text-anchor="middle" font-family="serif" font-size="27" font-weight="bold" fill="#5b2e18">ITALIA</text>
    </svg>`,
    { size: 256 },
  );

  b.part(new THREE.BoxGeometry(0.19, 0.075, 0.012), GOLD, {
    at: [0.59, 1.12, 0.339],
    name: "maker-plaque-frame",
  });
  b.part(new THREE.PlaneGeometry(0.17, 0.045), IVORY, {
    at: [0.59, 1.12, 0.348],
    dir: [0, 0, 1],
    axis: "z",
    texture: plaqueTex,
    name: "maker-plaque-italia",
  });

  // Crown crest above the bellows, like a carved pearloid instrument badge.
  b.extrude(
    [
      [0, 0],
      [0.12, 0],
      [0.085, 0.075],
      [0.04, 0.15],
      [0, 0.105],
      [-0.04, 0.15],
      [-0.085, 0.075],
      [-0.12, 0],
    ],
    {
      at: [0, 1.31, 0.02],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.006,
      color: SHELL_GOLD,
      name: "top-crown-crest",
    },
  );

  // A handful of gleaming shell rivets along the central front rail.
  for (let i = 0; i < 9; i++) {
    const x = -0.34 + i * 0.085;
    sphere(0.014, i % 3 === 0 ? SHELL_PINK : GOLD_LIGHT, [x, 1.31, 0.255], `front-rail-rivet-${i}`);
  }

  return b.root;
}
```