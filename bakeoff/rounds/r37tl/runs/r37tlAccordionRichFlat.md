```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly detailed low-poly piano accordion with iridescent Italian mother-of-pearl cases, pleated bellows, piano keys, bass buttons, grillework, pearl inlays, straps, buckles, and brass trim.",
};

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const PEARL = "#e9e2d0";
  const PEARL_HI = "#fff9e9";
  const PEARL_PINK = "#e4bdc5";
  const PEARL_BLUE = "#a9c5ce";
  const PEARL_GREEN = "#aecdbd";
  const PEARL_DARK = "#9c8794";
  const BLACK = "#17151a";
  const BLACK_HI = "#302a32";
  const BELLOWS = "#59404a";
  const BELLOWS_HI = "#8c6370";
  const BRASS = "#c89845";
  const BRASS_HI = "#f0cc72";
  const STEEL = "#70727a";
  const RED = "#8b2935";
  const STRAP = "#28202a";
  const WHITE = "#fffdf5";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, ...options });

  const roundedBox = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bevel = 0.012,
  ) => {
    const shape = new THREE.Shape();
    const w = size[0] / 2;
    const h = size[1] / 2;
    const r = Math.min(bevel, w * 0.45, h * 0.45);
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: size[2],
      bevelEnabled: true,
      bevelThickness: bevel * 0.45,
      bevelSize: bevel * 0.45,
      bevelSegments: 1,
    });
    geo.translate(0, 0, -size[2] / 2);
    return b.part(geo, color, { at });
  };

  const cylinder = (
    radius: number,
    depth: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir,
    });

  const pearlStud = (x: number, y: number, z: number, color = PEARL_HI, r = 0.012) => {
    cylinder(r, 0.008, color, [x, y, z], [0, 0, 1], 10);
    cylinder(r * 0.42, 0.010, BRASS_HI, [x, y, z + 0.005], [0, 0, 1], 8);
  };

  const rivet = (x: number, y: number, z: number, r = 0.006) => {
    cylinder(r, 0.008, BRASS_HI, [x, y, z], [0, 0, 1], 8);
  };

  // Main composition: two chunky cases with the bellows opening between them.
  const leftX = -0.205;
  const rightX = 0.205;
  const caseY = 0.245;
  const caseW = 0.155;
  const caseH = 0.39;
  const caseD = 0.255;

  roundedBox([caseW, caseH, caseD], PEARL, [leftX, caseY, 0], 0.018);
  roundedBox([caseW, caseH, caseD], PEARL, [rightX, caseY, 0], 0.018);

  // Dark undersides give the instrument a solid resting contact.
  box([0.145, 0.035, 0.24], BLACK, [leftX, 0.055, 0]);
  box([0.145, 0.035, 0.24], BLACK, [rightX, 0.055, 0]);

  // Layered mother-of-pearl front plates.
  box([0.126, 0.285, 0.012], PEARL_HI, [leftX, 0.265, 0.134]);
  box([0.126, 0.285, 0.012], PEARL_PINK, [rightX, 0.265, 0.134]);
  box([0.096, 0.255, 0.008], PEARL_BLUE, [leftX, 0.265, 0.142]);
  box([0.096, 0.255, 0.008], PEARL_HI, [rightX, 0.265, 0.142]);

  // Front plate border rails and corner caps.
  for (const x of [leftX, rightX]) {
    box([0.132, 0.012, 0.018], BRASS, [x, 0.115, 0.145]);
    box([0.132, 0.012, 0.018], BRASS_HI, [x, 0.415, 0.145]);
    box([0.012, 0.285, 0.018], BRASS, [x - 0.061, 0.265, 0.145]);
    box([0.012, 0.285, 0.018], BRASS_HI, [x + 0.061, 0.265, 0.145]);
    for (const y of [0.125, 0.405]) {
      pearlStud(x - 0.052, y, 0.158, PEARL_HI, 0.009);
      pearlStud(x + 0.052, y, 0.158, PEARL_GREEN, 0.009);
    }
  }

  // Jewel-like repeating inlay rosettes on each shell.
  for (const x of [leftX, rightX]) {
    for (const y of [0.19, 0.265, 0.34]) {
      pearlStud(x, y, 0.157, y === 0.265 ? PEARL_PINK : PEARL_BLUE, 0.015);
      for (const s of [-1, 1]) {
        pearlStud(x + s * 0.022, y, 0.157, PEARL_GREEN, 0.006);
        pearlStud(x, y + s * 0.022, 0.157, PEARL_HI, 0.006);
      }
    }
  }

  // Side shell stripes, giving the instrument its unmistakable polished furniture silhouette.
  for (const x of [leftX - 0.082, leftX + 0.082, rightX - 0.082, rightX + 0.082]) {
    box([0.009, 0.31, 0.21], BRASS, [x, 0.265, 0]);
    box([0.006, 0.27, 0.215], PEARL_DARK, [x + (x < 0 ? 0.006 : -0.006), 0.265, 0]);
  }

  // Bellows: broad pleated blocks between the cases, with visible front and rear folds.
  const bellowsXs = [-0.135, -0.105, -0.075, -0.045, -0.015, 0.015, 0.045, 0.075, 0.105, 0.135];
  bellowsXs.forEach((x, i) => {
    const width = i === 0 || i === bellowsXs.length - 1 ? 0.028 : 0.024;
    const c = i % 2 === 0 ? BELLOWS_HI : BELLOWS;
    box([width, 0.27, 0.205], c, [x, 0.245, 0]);
    box([width * 0.48, 0.282, 0.010], BLACK, [x, 0.245, 0.108]);
    box([width * 0.48, 0.282, 0.010], BLACK, [x, 0.245, -0.108]);
  });

  // Bellows frame rails.
  for (const x of [-0.145, 0.145]) {
    box([0.018, 0.31, 0.228], BRASS, [x, 0.245, 0]);
    for (const y of [0.105, 0.385]) {
      box([0.025, 0.014, 0.245], BRASS_HI, [x, y, 0]);
    }
  }

  // Piano keyboard mounted on the right-hand case, facing +Z.
  const keyboardX = 0.205;
  box([0.142, 0.175, 0.030], BLACK, [keyboardX, 0.255, 0.153]);
  box([0.145, 0.020, 0.038], BRASS, [keyboardX, 0.355, 0.157]);
  box([0.145, 0.014, 0.038], BRASS_HI, [keyboardX, 0.155, 0.157]);

  const whiteKeys = 8;
  const keyW = 0.142 / whiteKeys;
  for (let i = 0; i < whiteKeys; i++) {
    const y = 0.172 + i * 0.022;
    box([0.115, 0.017, 0.034], i % 3 === 0 ? WHITE : PEARL_HI, [keyboardX, y, 0.174]);
    box([0.115, 0.003, 0.005], BLACK, [keyboardX, y + 0.009, 0.192]);
  }

  // Black keys in the characteristic 2-3 grouping.
  for (const i of [1, 2, 4, 5, 6]) {
    const y = 0.172 + i * 0.022 - 0.010;
    box([0.075, 0.012, 0.042], BLACK, [keyboardX, y, 0.192]);
    box([0.055, 0.004, 0.008], BLACK_HI, [keyboardX, y - 0.006, 0.214]);
  }

  // Piano key end cap and small ivory badge.
  box([0.15, 0.012, 0.045], BRASS_HI, [keyboardX, 0.255, 0.207]);
  pearlStud(keyboardX, 0.255, 0.232, PEARL_GREEN, 0.011);

  // Left-hand bass panel and grille.
  box([0.118, 0.205, 0.024], BLACK, [leftX, 0.25, 0.151]);
  box([0.105, 0.185, 0.008], PEARL_DARK, [leftX, 0.25, 0.167]);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const y = 0.176 + row * 0.037;
      const z = 0.172 + col * 0.027;
      cylinder(0.009, 0.009, BLACK, [leftX, y, z], [1, 0, 0], 8);
      cylinder(0.006, 0.005, BRASS_HI, [leftX + 0.008, y, z], [1, 0, 0], 8);
    }
  }

  // Decorative grille slats on the bass side.
  for (let i = -3; i <= 3; i++) {
    box([0.012, 0.155, 0.006], BRASS, [leftX + i * 0.015, 0.25, 0.181]);
  }

  // Bass-side pearl medallion and rosette.
  cylinder(0.039, 0.010, BRASS_HI, [leftX, 0.36, 0.182], [0, 0, 1], 16);
  cylinder(0.031, 0.012, PEARL_PINK, [leftX, 0.36, 0.189], [0, 0, 1], 16);
  cylinder(0.018, 0.014, PEARL_BLUE, [leftX, 0.36, 0.197], [0, 0, 1], 12);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    pearlStud(leftX + Math.cos(a) * 0.025, 0.36 + Math.sin(a) * 0.025, 0.200, PEARL_HI, 0.0045);
  }

  // A small red bellows release lever and its brass pivot.
  box([0.018, 0.070, 0.030], RED, [0.105, 0.105, 0.158]);
  cylinder(0.014, 0.012, BRASS_HI, [0.105, 0.145, 0.177], [0, 0, 1], 10);

  // Shoulder straps crossing behind the instrument.
  // Built as chunky dark rods with brass adjustment blocks.
  b.rod([-0.27, 0.40, -0.125], [0.27, 0.47, -0.125], 0.018, {
    color: STRAP,
    caps: "round",
  });
  b.rod([-0.27, 0.13, -0.125], [0.27, 0.08, -0.125], 0.018, {
    color: STRAP,
    caps: "round",
  });
  for (const x of [-0.255, 0.255]) {
    box([0.035, 0.055, 0.018], BRASS, [x, x > 0 ? 0.45 : 0.39, -0.13]);
    box([0.020, 0.032, 0.022], BRASS_HI, [x, x > 0 ? 0.45 : 0.39, -0.143]);
  }

  // Four feet, with tiny pearl/brass caps.
  for (const x of [-0.25, 0.25]) {
    for (const z of [-0.085, 0.085]) {
      cylinder(0.018, 0.035, BLACK, [x, 0.035, z], [0, 1, 0], 8);
      cylinder(0.012, 0.006, BRASS_HI, [x, 0.056, z], [0, 1, 0], 8);
    }
  }

  // Dense rows of case rivets make the silhouette read as a crafted Italian instrument.
  for (const x of [leftX, rightX]) {
    for (const z of [-0.125, 0.125]) {
      for (let i = 0; i < 7; i++) {
        const y = 0.12 + i * 0.048;
        rivet(x + (z > 0 ? 0.071 : -0.071), y, z, 0.0045);
      }
    }
  }

  // A final central nameplate: "ITALIA" rendered as repeated pearl tiles rather than text.
  box([0.112, 0.026, 0.008], BRASS, [0, 0.465, 0.092]);
  const letters = [
    [0.0, 0.0],
    [0.018, 0.0],
    [0.036, 0.0],
    [-0.036, 0.0],
    [-0.018, 0.0],
  ];
  for (const [x, y] of letters) {
    pearlStud(x, 0.465 + y, 0.098, PEARL_HI, 0.006);
  }

  return b.root;
}
```