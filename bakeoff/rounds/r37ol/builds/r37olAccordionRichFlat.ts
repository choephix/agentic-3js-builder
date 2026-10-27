import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A stylized low-poly piano accordion with pearlescent shell panels, black-and-ivory keyboard, folded bellows, bass buttons, grille ornament, straps, rivets, and polished Italian detailing.",
};

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const PEARL = "#f4eee1";
  const PEARL_BLUE = "#b9d8d8";
  const PEARL_PINK = "#e8c6c7";
  const PEARL_GOLD = "#f2d18b";
  const IVORY = "#fff4d4";
  const IVORY_DARK = "#d8c49a";
  const BLACK = "#17151a";
  const EBONY = "#30212d";
  const GOLD = "#b98232";
  const GOLD_LIGHT = "#f1ca69";
  const RED = "#7b1e2b";
  const BELLOWS = "#443044";
  const BELLOWS_LIGHT = "#74516c";
  const STRAP = "#211923";
  const STEEL = "#bfc3c9";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bevel = 0
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (bevel > 0) {
      // A very small bevel is suggested by layered trim rather than modifiers,
      // keeping the puppet-like primitive silhouette crisp.
    }
    return b.part(g, color, { at, flat: true });
  };

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    axis: "x" | "y" | "z" = "y",
    segments = 10
  ) => {
    const g = new THREE.CylinderGeometry(radius, radius, height, segments, 1);
    const dir =
      axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, 1] : [0, 1, 0];
    return b.part(g, color, { at, dir, flat: true });
  };

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    scale?: [number, number, number]
  ) => {
    const g = new THREE.SphereGeometry(radius, 10, 6);
    return b.part(g, color, { at, scale, flat: true });
  };

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string
  ) => b.rod(a, c, radius, { color, section: { ngon: 6 }, caps: "flat" });

  // Main silhouette: two proud pearl-clad cases joined by a concertina.
  const leftCaseX = -0.43;
  const rightCaseX = 0.43;
  const caseY = 0.76;
  const caseW = 0.34;
  const caseH = 1.02;
  const caseD = 0.38;

  box([caseW, caseH, caseD], [leftCaseX, caseY, 0], PEARL);
  box([caseW, caseH, caseD], [rightCaseX, caseY, 0], PEARL_BLUE);

  // Dark lower feet make the object sit firmly on the floor.
  box([0.29, 0.08, 0.42], [leftCaseX, 0.235, 0], EBONY);
  box([0.29, 0.08, 0.42], [rightCaseX, 0.235, 0], EBONY);
  box([0.43, 0.06, 0.46], [0, 0.185, 0], BLACK);

  // Pearl shell corner laminations and top/bottom rails.
  for (const s of [-1, 1]) {
    const x = s * 0.43;
    box([0.025, 0.94, 0.025], [x - s * 0.165, 0.77, 0.205], PEARL_GOLD);
    box([0.025, 0.94, 0.025], [x + s * 0.165, 0.77, 0.205], PEARL_PINK);
    box([0.30, 0.035, 0.43], [x, 1.285, 0], GOLD);
    box([0.30, 0.035, 0.43], [x, 0.255, 0], GOLD);
    box([0.035, 0.88, 0.035], [x, 0.77, 0.205], GOLD_LIGHT);
    box([0.035, 0.88, 0.035], [x, 0.77, -0.205], GOLD);
  }

  // Mother-of-pearl mosaic tiles on both case faces.
  const shellTiles = [
    [PEARL_PINK, 0.0, 0.0],
    [PEARL_BLUE, -0.065, 0.18],
    [PEARL_GOLD, 0.065, 0.18],
    [PEARL_BLUE, -0.07, -0.18],
    [PEARL_PINK, 0.07, -0.18],
  ] as const;

  for (const side of [-1, 1]) {
    const x = side * 0.43;
    for (const [color, dx, dy] of shellTiles) {
      const tile = box(
        [0.22, 0.19, 0.012],
        [x + dx, caseY + dy, 0.201],
        color
      );
      // pearl tile seams
      box([0.23, 0.009, 0.016], [x + dx, caseY + dy + 0.095, 0.209], GOLD);
      box([0.009, 0.20, 0.016], [x + dx + 0.11, caseY + dy, 0.209], GOLD);
      void tile;
    }
  }

  // Central bellows, broad folded pleats in a deep wine-purple.
  const bellowsXs = [-0.255, -0.205, -0.155, -0.105, -0.055, 0, 0.055, 0.105, 0.155, 0.205, 0.255];
  for (let i = 0; i < bellowsXs.length; i++) {
    const x = bellowsXs[i];
    const depth = 0.27 + (i % 2 === 0 ? 0.025 : 0);
    box([0.035, 0.78, depth], [x, 0.77, -0.005], i % 2 ? BELLOWS : BELLOWS_LIGHT);
    box([0.042, 0.018, depth + 0.015], [x, 1.145, -0.005], GOLD);
    box([0.042, 0.018, depth + 0.015], [x, 0.395, -0.005], GOLD);
  }
  box([0.59, 0.045, 0.32], [0, 1.19, 0], GOLD);
  box([0.59, 0.045, 0.32], [0, 0.35, 0], GOLD);

  // Bellows frame caps and hinge pins.
  for (const y of [0.39, 1.15]) {
    box([0.63, 0.045, 0.34], [0, y, 0], EBONY);
    for (const x of [-0.27, -0.135, 0, 0.135, 0.27]) {
      cyl(0.014, 0.36, [x, y, 0.18], GOLD_LIGHT, "z", 8);
    }
  }

  // Piano keyboard mounted on the viewer-facing (+Z) side of the left case.
  const keyboardX = -0.43;
  box([0.31, 0.50, 0.055], [keyboardX, 0.77, 0.225], EBONY);
  box([0.34, 0.055, 0.07], [keyboardX, 1.035, 0.23], GOLD);
  box([0.34, 0.055, 0.07], [keyboardX, 0.505, 0.23], GOLD);

  const whiteCount = 9;
  const keyH = 0.405 / whiteCount;
  for (let i = 0; i < whiteCount; i++) {
    const y = 0.565 + keyH * i;
    box([0.255, keyH - 0.008, 0.047], [keyboardX, y, 0.263], i % 3 === 0 ? IVORY_DARK : IVORY);
    box([0.255, 0.008, 0.052], [keyboardX, y - keyH / 2, 0.29], BLACK);
  }

  // Raised black piano keys, grouped in the recognizable 2-3 rhythm.
  const blackKeys = [1, 2, 4, 5, 6, 8];
  for (const i of blackKeys) {
    const y = 0.565 + keyH * i;
    box([0.17, keyH * 0.58, 0.065], [keyboardX + 0.005, y, 0.30], BLACK);
    box([0.18, 0.012, 0.071], [keyboardX + 0.005, y + keyH * 0.29, 0.32], EBONY);
  }

  // Keyboard end cheeks and pearl surround.
  box([0.055, 0.47, 0.085], [keyboardX - 0.145, 0.77, 0.245], PEARL_PINK);
  box([0.055, 0.47, 0.085], [keyboardX + 0.145, 0.77, 0.245], PEARL_BLUE);
  box([0.32, 0.035, 0.09], [keyboardX, 1.03, 0.255], GOLD_LIGHT);
  box([0.32, 0.035, 0.09], [keyboardX, 0.51, 0.255], GOLD_LIGHT);

  // Bass-button panel on the right case, with a decorative grille.
  const bassX = 0.43;
  box([0.27, 0.54, 0.035], [bassX, 0.78, 0.225], BLACK);
  box([0.29, 0.06, 0.045], [bassX, 1.08, 0.245], GOLD);
  box([0.29, 0.06, 0.045], [bassX, 0.48, 0.245], GOLD);

  const buttonRows = 4;
  const buttonCols = 3;
  for (let row = 0; row < buttonRows; row++) {
    for (let col = 0; col < buttonCols; col++) {
      const y = 0.57 + row * 0.135;
      const z = 0.263;
      const xOffset = (col - 1) * 0.078;
      const c = (row + col) % 3 === 0 ? PEARL_GOLD : (row + col) % 3 === 1 ? IVORY : PEARL_PINK;
      cyl(0.026, 0.018, [bassX + xOffset, y, z], c, "z", 10);
      cyl(0.031, 0.006, [bassX + xOffset, y, z + 0.014], GOLD, "z", 10);
    }
  }

  // Bass grille: dark arch with repeating gold slats.
  box([0.18, 0.16, 0.018], [bassX, 0.98, 0.275], EBONY);
  for (let i = -2; i <= 2; i++) {
    rod(
      [bassX + i * 0.032, 0.91, 0.292],
      [bassX + i * 0.032, 1.05, 0.292],
      0.006,
      GOLD_LIGHT
    );
  }
  rod([bassX - 0.085, 0.91, 0.298], [bassX + 0.085, 0.91, 0.298], 0.008, GOLD);
  rod([bassX - 0.085, 1.05, 0.298], [bassX + 0.085, 1.05, 0.298], 0.008, GOLD);

  // Italian ornamental medallions on both cases.
  for (const side of [-1, 1]) {
    const x = side * 0.43;
    cyl(0.088, 0.018, [x, 0.80, 0.225], GOLD, "z", 16);
    cyl(0.067, 0.020, [x, 0.80, 0.239], RED, "z", 12);
    cyl(0.042, 0.023, [x, 0.80, 0.253], PEARL_GOLD, "z", 10);
    // four little pearl petals
    for (const [dy, dz] of [
      [0.037, 0],
      [-0.037, 0],
      [0, 0.037],
      [0, -0.037],
    ]) {
      sphere(0.014, [x, 0.80 + dy, 0.273 + dz], PEARL);
    }
  }

  // Tiny rivets around each outer shell.
  for (const side of [-1, 1]) {
    const x = side * 0.43;
    for (const y of [0.35, 0.58, 0.98, 1.19]) {
      sphere(0.012, [x - 0.17 * side, y, 0.225], GOLD_LIGHT);
      sphere(0.012, [x + 0.17 * side, y, 0.225], GOLD_LIGHT);
    }
  }

  // Two leather shoulder straps crossing behind the accordion.
  rod([-0.60, 1.24, -0.17], [0.60, 0.34, -0.17], 0.035, STRAP);
  rod([0.60, 1.24, -0.12], [-0.60, 0.34, -0.12], 0.035, STRAP);
  box([0.10, 0.17, 0.035], [-0.43, 1.30, -0.16], GOLD);
  box([0.10, 0.17, 0.035], [0.43, 1.30, -0.16], GOLD);

  // Strap buckles on the front-facing upper shoulders.
  for (const x of [-0.43, 0.43]) {
    box([0.16, 0.10, 0.025], [x, 1.275, 0.225], GOLD);
    box([0.09, 0.035, 0.035], [x, 1.275, 0.245], BLACK);
    sphere(0.017, [x - 0.065, 1.275, 0.252], GOLD_LIGHT);
    sphere(0.017, [x + 0.065, 1.275, 0.252], GOLD_LIGHT);
  }

  // Decorative side hinges, visible as chunky gold discs.
  for (const side of [-1, 1]) {
    const x = side * 0.27;
    for (const y of [0.43, 1.11]) {
      cyl(0.035, 0.035, [x, y, 0.17], GOLD, "x", 10);
      sphere(0.018, [x + side * 0.024, y, 0.17], GOLD_LIGHT);
    }
  }

  // A small pearl-and-gold crown on the top of the right shell.
  box([0.22, 0.028, 0.11], [0.43, 1.34, 0.02], GOLD);
  for (const x of [0.36, 0.43, 0.50]) {
    sphere(0.025, [x, 1.38, 0.02], PEARL_PINK);
  }

  // Front grille emblem: an Italian tricolour-inspired vertical inlay.
  box([0.028, 0.19, 0.012], [0.32, 1.00, 0.222], "#2e8b57");
  box([0.028, 0.19, 0.014], [0.35, 1.00, 0.224], IVORY);
  box([0.028, 0.19, 0.012], [0.38, 1.00, 0.222], "#c7353d");
  cyl(0.035, 0.018, [0.35, 1.00, 0.24], GOLD, "z", 12);

  // Four small floor-contact rubber pads, keeping the instrument grounded.
  for (const x of [-0.55, -0.31, 0.31, 0.55]) {
    cyl(0.035, 0.035, [x, 0.20, 0], BLACK, "y", 8);
  }

  return b.root;
}
