```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented low-poly piano accordion with pearl-inlaid cabinets, gold filigree, pleated bellows, piano keys, bass buttons, grillework, rivets, and leather fittings.",
};

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const INK = "#24151a";
  const EBONY = "#302025";
  const BELLOWS = "#4d2831";
  const BELLOWS_LIGHT = "#8e4d53";
  const PEARL = "#efe7d2";
  const PEARL_BLUE = "#b9d6d4";
  const PEARL_ROSE = "#ddb7ae";
  const PEARL_GOLD = "#f5d98a";
  const GOLD = "#c78b32";
  const GOLD_LIGHT = "#f4ca65";
  const BRASS = "#8e5c20";
  const IVORY = "#fff4d2";
  const KEY_SHADOW = "#d4bfa0";
  const BLACK = "#171317";
  const LEATHER = "#321d1c";
  const RED = "#9e2637";
  const GREEN = "#426b52";

  let serial = 0;
  const tag = (s: string) => `${s}_${serial++}`;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (bevel > 0) {
      // A small bevel-like highlight is supplied separately; keeping the primary primitive crisp.
    }
    return b.part(g, color, { at, name: tag(name) });
  };

  const cyl = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    name: string,
    radial = 10,
    dir: [number, number, number] = [0, 1, 0],
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, radial), color, {
      at,
      dir,
      name: tag(name),
    });
  };

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
    seg = 8,
  ) => b.part(new THREE.SphereGeometry(radius, seg, Math.max(4, Math.floor(seg * 0.65))), color, {
    at,
    name: tag(name),
  });

  const diamond = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    color: string,
    name: string,
    thickness = 0.006,
  ) => {
    return b.extrude(
      [
        [0, h / 2, "sharp"],
        [w / 2, 0, "sharp"],
        [0, -h / 2, "sharp"],
        [-w / 2, 0, "sharp"],
      ],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness,
        bevel: 0.001,
        color,
        name: tag(name),
      },
    );
  };

  const pearlDot = (x: number, y: number, z: number, color = PEARL_GOLD, r = 0.009) =>
    cyl(r, 0.008, [x, y, z], color, "pearl-rivet", 8, [0, 0, 1]);

  const goldLine = (
    a: [number, number, number],
    c: [number, number, number],
    radius = 0.006,
    name = "gold-trim",
  ) => b.rod(a, c, radius, { color: GOLD_LIGHT, name: tag(name) });

  // Overall silhouette: compact, upright, with the treble cabinet on the model's +X.
  const floorY = 0.035;
  const bodyBottom = 0.07;
  const bodyTop = 0.91;
  const front = 0.19;
  const back = -0.13;

  // Feet and little bottom rails keep the instrument grounded.
  for (const x of [-0.215, 0.215]) {
    box([0.17, 0.045, 0.18], [x, floorY + 0.022, -0.005], LEATHER, "rubber-foot");
    cyl(0.026, 0.012, [x, floorY + 0.048, front - 0.012], GOLD, "foot-cap", 8, [0, 1, 0]);
  }
  box([0.47, 0.035, 0.20], [0, 0.095, -0.005], BRASS, "bottom-rail");
  box([0.43, 0.016, 0.014], [0, 0.116, front + 0.008], GOLD_LIGHT, "bottom-gilt-line");

  // Left bass cabinet, central bellows, right treble cabinet.
  box([0.19, 0.76, 0.26], [-0.205, 0.48, 0], EBONY, "bass-cabinet");
  box([0.19, 0.76, 0.26], [0.205, 0.48, 0], EBONY, "treble-cabinet");
  box([0.035, 0.67, 0.235], [0, 0.485, 0], BELLOWS, "bellows-core");

  // Cabinet top and bottom caps, made deliberately chunky like carved Italian furniture.
  for (const x of [-0.205, 0.205]) {
    box([0.215, 0.055, 0.29], [x, 0.865, 0], BRASS, "cabinet-top-cap");
    box([0.215, 0.05, 0.29], [x, 0.105, 0], BRASS, "cabinet-bottom-cap");
    box([0.195, 0.022, 0.285], [x, 0.897, 0], GOLD, "top-cap-gilt");
    box([0.195, 0.018, 0.285], [x, 0.077, 0], GOLD, "bottom-cap-gilt");
  }

  // Pearl faceplates on the two carved wooden cabinets.
  box([0.165, 0.64, 0.014], [-0.205, 0.49, front + 0.015], PEARL, "bass-pearl-face");
  box([0.165, 0.64, 0.014], [0.205, 0.49, front + 0.015], PEARL, "treble-pearl-face");

  // Layered cabinet frames.
  for (const x of [-0.205, 0.205]) {
    goldLine([x - 0.083, 0.17, front + 0.026], [x + 0.083, 0.17, front + 0.026], 0.006, "lower-frame");
    goldLine([x - 0.083, 0.81, front + 0.026], [x + 0.083, 0.81, front + 0.026], 0.006, "upper-frame");
    goldLine([x - 0.083, 0.17, front + 0.026], [x - 0.083, 0.81, front + 0.026], 0.006, "side-frame");
    goldLine([x + 0.083, 0.17, front + 0.026], [x + 0.083, 0.81, front + 0.026], 0.006, "side-frame");
    for (const yy of [0.18, 0.80]) {
      pearlDot(x - 0.074, yy, front + 0.034);
      pearlDot(x + 0.074, yy, front + 0.034);
    }
  }

  // Bellows: many visible alternating pleats, with dark recesses between them.
  for (let i = 0; i < 13; i++) {
    const y = 0.18 + i * 0.052;
    const shade = i % 2 === 0 ? BELLOWS_LIGHT : BELLOWS;
    box([0.12, 0.019, 0.255], [0, y, 0], shade, "bellows-fold");
    box([0.145, 0.008, 0.018], [0, y + 0.011, front + 0.005], GOLD, "bellows-front-edge");
    // Concertina folds peek out on either side of the central block.
    box([0.022, 0.026, 0.245], [-0.022, y + 0.006, 0], shade, "bellows-left-rib");
    box([0.022, 0.026, 0.245], [0.022, y + 0.006, 0], shade, "bellows-right-rib");
  }
  // Bellows corner guards.
  for (const x of [-0.028, 0.028]) {
    box([0.012, 0.68, 0.265], [x, 0.49, 0], GOLD, "bellows-corner");
  }

  // Bass register grille on the upper left cabinet.
  box([0.13, 0.16, 0.012], [-0.205, 0.75, front + 0.03], INK, "bass-grille");
  for (let i = -3; i <= 3; i++) {
    box([0.012, 0.135, 0.008], [-0.205 + i * 0.018, 0.75, front + 0.039], GOLD_LIGHT, "grille-bar");
  }
  box([0.145, 0.014, 0.014], [-0.205, 0.835, front + 0.032], GOLD, "grille-top");
  box([0.145, 0.014, 0.014], [-0.205, 0.665, front + 0.032], GOLD, "grille-bottom");

  // Bass buttons: three tidy rows of pearl and black buttons.
  const bassRows = [
    { y: 0.29, n: 3, off: 0 },
    { y: 0.405, n: 4, off: 0.012 },
    { y: 0.52, n: 4, off: 0 },
    { y: 0.635, n: 3, off: 0.012 },
  ];
  for (const row of bassRows) {
    for (let i = 0; i < row.n; i++) {
      const x = -0.245 + (i + 0.5) * (0.08 / row.n) + row.off;
      cyl(0.019, 0.013, [x, row.y, front + 0.039], i % 3 === 0 ? PEARL_BLUE : PEARL, "bass-button", 10, [0, 0, 1]);
      cyl(0.009, 0.004, [x, row.y, front + 0.048], GOLD, "button-cap", 8, [0, 0, 1]);
    }
  }

  // Small register switches and a decorative bass medallion.
  for (let i = 0; i < 4; i++) {
    box([0.026, 0.055, 0.018], [-0.205 + (i - 1.5) * 0.038, 0.585, front + 0.039], PEARL_ROSE, "register-switch");
    pearlDot(-0.205 + (i - 1.5) * 0.038, 0.585, front + 0.052, GOLD_LIGHT, 0.006);
  }
  cyl(0.036, 0.012, [-0.205, 0.235, front + 0.034], GOLD, "bass-medallion", 16, [0, 0, 1]);
  cyl(0.026, 0.008, [-0.205, 0.235, front + 0.043], PEARL_BLUE, "bass-medallion-pearl", 16, [0, 0, 1]);
  diamond(-0.205, 0.235, front + 0.049, 0.027, 0.027, GOLD, "bass-medallion-star");

  // Treble side: a raised keyboard frame.
  box([0.17, 0.66, 0.045], [0.205, 0.47, front + 0.032], BRASS, "keyboard-well");
  box([0.153, 0.64, 0.018], [0.205, 0.47, front + 0.061], BLACK, "keyboard-bed");

  // Piano keys, vertical in the front view. White keys are individual readable primitives.
  const keyCount = 13;
  const keyH = 0.64 / keyCount;
  for (let i = 0; i < keyCount; i++) {
    const y = 0.17 + keyH * (i + 0.5);
    box([0.132, keyH - 0.004, 0.025], [0.205, y, front + 0.078], i % 2 ? IVORY : "#fff9e8", "ivory-key");
    box([0.132, 0.004, 0.006], [0.205, y - keyH / 2 + 0.002, front + 0.092], KEY_SHADOW, "key-seam");
  }

  // Black keys use the standard piano spacing, leaving gaps at E-F and B-C.
  const blackAfter = [0, 1, 3, 4, 5, 7, 8, 10, 11];
  for (const i of blackAfter) {
    const y = 0.17 + keyH * (i + 1);
    box([0.085, keyH * 0.62, 0.035], [0.185, y, front + 0.101], BLACK, "black-key");
    box([0.075, 0.008, 0.007], [0.185, y + keyH * 0.29, front + 0.121], EBONY, "black-key-highlight");
  }
  // Keyboard side cheeks.
  box([0.018, 0.665, 0.052], [0.122, 0.47, front + 0.065], GOLD, "keyboard-left-cheek");
  box([0.018, 0.665, 0.052], [0.288, 0.47, front + 0.065], GOLD, "keyboard-right-cheek");

  // Treble grille above the keys, with a floral pearl ornament.
  box([0.13, 0.105, 0.014], [0.205, 0.805, front + 0.034], INK, "treble-grille");
  for (let i = -3; i <= 3; i++) {
    box([0.012, 0.083, 0.008], [0.205 + i * 0.018, 0.805, front + 0.044], GOLD_LIGHT, "treble-grille-bar");
  }
  cyl(0.028, 0.012, [0.205, 0.695, front + 0.041], GOLD, "treble-flower-center", 12, [0, 0, 1]);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    pearlDot(0.205 + Math.cos(a) * 0.035, 0.695 + Math.sin(a) * 0.035, front + 0.043,
      i % 2 ? PEARL_BLUE : PEARL_ROSE, 0.014);
  }

  // Mother-of-pearl marquetry: large diamonds, small stars, and a central vertical motif.
  for (const x of [-0.205, 0.205]) {
    diamond(x, 0.39, front + 0.034, 0.074, 0.12, x < 0 ? PEARL_BLUE : PEARL_ROSE, "large-pearl-diamond");
    diamond(x, 0.39, front + 0.042, 0.043, 0.071, PEARL, "diamond-inset");
    diamond(x, 0.57, front + 0.035, 0.046, 0.073, x < 0 ? PEARL_ROSE : PEARL_BLUE, "upper-pearl-diamond");
    diamond(x, 0.235, front + 0.035, 0.046, 0.073, x < 0 ? PEARL_ROSE : PEARL_BLUE, "lower-pearl-diamond");

    pearlDot(x - 0.045, 0.57, front + 0.046, GOLD_LIGHT, 0.008);
    pearlDot(x + 0.045, 0.57, front + 0.046, GOLD_LIGHT, 0.008);
    pearlDot(x - 0.045, 0.39, front + 0.046, GOLD_LIGHT, 0.008);
    pearlDot(x + 0.045, 0.39, front + 0.046, GOLD_LIGHT, 0.008);
    pearlDot(x - 0.045, 0.235, front + 0.046, GOLD_LIGHT, 0.008);
    pearlDot(x + 0.045, 0.235, front + 0.046, GOLD_LIGHT, 0.008);
  }

  // Fine gold scrollwork on each face: curling rods and pearl terminals.
  for (const s of [-1, 1]) {
    const x = s * 0.205;
    b.sweep(
      [
        [x - 0.052, 0.70, front + 0.046],
        [x - 0.018, 0.74, front + 0.046],
        [x + 0.018, 0.70, front + 0.046],
        [x + 0.052, 0.74, front + 0.046],
      ],
      0.004,
      { color: GOLD_LIGHT, name: tag("filigree-scroll") },
    );
    b.sweep(
      [
        [x - 0.052, 0.31, front + 0.046],
        [x - 0.018, 0.27, front + 0.046],
        [x + 0.018, 0.31, front + 0.046],
        [x + 0.052, 0.27, front + 0.046],
      ],
      0.004,
      { color: GOLD_LIGHT, name: tag("filigree-scroll") },
    );
    for (const yy of [0.27, 0.31, 0.70, 0.74]) pearlDot(x + (yy < 0.5 ? 0.052 : -0.052), yy, front + 0.052, PEARL_GOLD, 0.007);
  }

  // Side ribs and brass hinge lines make the instrument readable in three-quarter view.
  for (const x of [-0.31, 0.31]) {
    box([0.018, 0.70, 0.025], [x, 0.49, 0], BRASS, "side-rib");
    box([0.009, 0.62, 0.018], [x, 0.49, front - 0.008], GOLD_LIGHT, "side-rib-highlight");
    for (const y of [0.17, 0.32, 0.47, 0.62, 0.78]) {
      cyl(0.009, 0.014, [x, y, -0.02], GOLD, "side-rivet", 8, [1, 0, 0]);
    }
  }

  // Top carrying handle and metal mounting ears.
  for (const x of [-0.19, 0.19]) {
    cyl(0.016, 0.04, [x, 0.925, 0], GOLD, "handle-mount", 8, [0, 1, 0]);
    cyl(0.011, 0.028, [x, 0.947, 0], BRASS, "handle-pin", 8, [0, 1, 0]);
  }
  b.sweep(
    [
      [-0.19, 0.947, 0],
      [-0.135, 0.985, 0],
      [0.135, 0.985, 0],
      [0.19, 0.947, 0],
    ],
    0.018,
    { color: LEATHER, name: tag("carrying-handle") },
  );
  b.sweep(
    [
      [-0.19, 0.947, 0.005],
      [-0.135, 0.985, 0.005],
      [0.135, 0.985, 0.005],
      [0.19, 0.947, 0.005],
    ],
    0.006,
    { color: GOLD, name: tag("handle-stitch") },
  );

  // Rear shoulder-strap glimpses, visible beyond the cabinets.
  b.rod([-0.30, 0.20, -0.14], [-0.30, 0.77, -0.14], 0.018, {
    color: LEATHER,
    name: tag("left-shoulder-strap"),
  });
  b.rod([0.30, 0.20, -0.14], [0.30, 0.77, -0.14], 0.018, {
    color: LEATHER,
    name: tag("right-shoulder-strap"),
  });
  for (const x of [-0.30, 0.30]) {
    box([0.048, 0.07, 0.018], [x, 0.24, -0.145], GOLD, "strap-buckle");
    box([0.048, 0.07, 0.018], [x, 0.73, -0.145], GOLD, "strap-buckle");
    pearlDot(x, 0.24, -0.158, PEARL, 0.008);
    pearlDot(x, 0.73, -0.158, PEARL, 0.008);
  }

  // A final heraldic crest on the top of the treble cabinet.
  diamond(0.205, 0.866, front + 0.045, 0.052, 0.052, PEARL_BLUE, "treble-crest");
  cyl(0.009, 0.012, [0.205, 0.866, front + 0.079], GOLD_LIGHT, "crest-stud", 8, [0, 0, 1]);

  return b.root;
}
```