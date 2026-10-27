import * as THREE from "three";
import { createBuilder, paint, noise, svg } from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A stylized low-poly piano accordion with iridescent Italian mother-of-pearl cases, pleated bellows, piano keys, grille, pearl buttons, chrome trim, and leather straps.",
};

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const INK = "#17131b";
  const BELLOWS = "#30202b";
  const LEATHER = "#4d171b";
  const WHITE = "#fffdf1";
  const BLACK = "#17131b";
  const GOLD = "#c89b43";
  const BRASS = "#a8792c";
  const RED = "#8f1d28";
  const PEARL = paint((p, n) => {
    const shimmer =
      0.5 +
      0.5 * Math.sin(p.x * 34 + p.z * 21 + p.y * 8 + noise(p, 0.18, 7) * 6);
    const warm = Math.max(0, n.y) * 0.18;
    const r = 0.72 + shimmer * 0.22 + warm;
    const g = 0.78 + shimmer * 0.13 + warm * 0.55;
    const bl = 0.82 + shimmer * 0.18;
    return [Math.min(r, 1), Math.min(g, 1), Math.min(bl, 1)];
  });
  const PEARL_PINK = paint((p, n) => {
    const q = 0.5 + 0.5 * Math.sin(p.x * 28 + p.y * 17 + p.z * 35);
    return [
      Math.min(1, 0.76 + q * 0.2 + Math.max(0, n.y) * 0.08),
      Math.min(1, 0.42 + q * 0.18),
      Math.min(1, 0.48 + q * 0.2),
    ];
  });
  const PEARL_BLUE = paint((p, n) => {
    const q = 0.5 + 0.5 * Math.sin(p.x * 31 - p.y * 19 + p.z * 22);
    return [
      0.42 + q * 0.18,
      0.67 + q * 0.18 + Math.max(0, n.y) * 0.06,
      0.78 + q * 0.16,
    ];
  });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    bevel = 0,
    name = "box",
  ) => {
    const g = new THREE.BoxGeometry(...size);
    if (bevel) {
      // keep the silhouette crisp and puppet-like; bevel is represented by trim pieces
    }
    return b.part(g, color, { at, name });
  };

  const cylinder = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 0, 1],
    name = "cylinder",
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      at,
      dir,
      name,
    });

  // Main silhouette: two ornate wooden shell halves and the dark bellows core.
  box([0.43, 0.86, 0.38], [-0.43, 0.49, 0], PEARL, 0, "bassShell");
  box([0.43, 0.86, 0.38], [0.43, 0.49, 0], PEARL_PINK, 0, "keyboardShell");
  box([0.73, 0.69, 0.26], [0, 0.57, 0], BELLOWS, 0, "bellowsCore");

  // Slightly proud shell panels give the cases their carved, mother-of-pearl presence.
  box([0.035, 0.72, 0.31], [-0.655, 0.52, 0.025], PEARL_BLUE, 0, "bassInset");
  box([0.035, 0.72, 0.31], [0.655, 0.52, 0.025], PEARL, 0, "keyboardInset");

  // Gold perimeter rails, vertical ribs, and bottom feet.
  for (const x of [-0.665, 0.665]) {
    box([0.025, 0.9, 0.035], [x, 0.49, 0.205], GOLD, 0, "sideGoldRail");
    box([0.025, 0.9, 0.035], [x, 0.49, -0.205], GOLD, 0, "sideBackRail");
    box([0.035, 0.035, 0.34], [x, 0.095, 0], GOLD, 0, "bottomRail");
    cylinder(0.055, 0.07, [x, 0.055, 0], BLACK, [0, 1, 0], "rubberFoot");
  }
  for (const x of [-0.49, 0.49]) {
    box([0.025, 0.8, 0.025], [x, 0.49, 0.21], BRASS, 0, "ornamentalRail");
  }

  // Bellows: stacked accordion folds, alternating burgundy leather and gold-edged folds.
  for (let i = 0; i < 10; i++) {
    const y = 0.25 + i * 0.071;
    const depth = 0.285 + (i % 2) * 0.018;
    box([0.76, 0.035, depth], [0, y, 0], i % 2 ? LEATHER : "#241923", 0, "bellowsFold");
    box([0.775, 0.012, depth + 0.01], [0, y + 0.019, 0], GOLD, 0, "bellowsPleat");
  }
  // Bellows side ribs make the folds readable from three-quarter views.
  for (const x of [-0.36, -0.18, 0, 0.18, 0.36]) {
    box([0.025, 0.69, 0.025], [x, 0.57, 0.151], "#6b3340", 0, "bellowsRib");
  }

  // Decorative mother-of-pearl medallions on the bass shell.
  for (const y of [0.24, 0.42, 0.60, 0.78]) {
    cylinder(0.052, 0.018, [-0.665, y, 0.22], PEARL_PINK, [0, 0, 1], "bassPearl");
    cylinder(0.031, 0.022, [-0.677, y, 0.22], GOLD, [0, 0, 1], "bassPearlRing");
  }
  cylinder(0.15, 0.018, [-0.67, 0.53, 0.215], PEARL_BLUE, [0, 0, 1], "bassMedallion");
  cylinder(0.118, 0.022, [-0.682, 0.53, 0.215], GOLD, [0, 0, 1], "bassMedallionTrim");

  // Bass grille: a fan of dark slots and a central crest.
  for (let i = -3; i <= 3; i++) {
    const z = 0.225 + Math.abs(i) * 0.006;
    box([0.018, 0.38, 0.012], [-0.68, 0.53 + i * 0.045, z], INK, 0, "grilleSlot");
  }
  box([0.02, 0.32, 0.014], [-0.684, 0.53, 0.232], GOLD, 0, "grilleCenterBar");

  // Right-hand piano keyboard, vertical like a real accordion.
  const keyboardX = 0.685;
  box([0.06, 0.76, 0.075], [keyboardX, 0.53, 0.22], BLACK, 0, "keyboardBed");
  const keyYs = Array.from({ length: 13 }, (_, i) => 0.205 + i * 0.057);
  for (let i = 0; i < keyYs.length; i++) {
    const y = keyYs[i];
    box([0.075, 0.043, 0.092], [0.72, y, 0.252], i % 7 === 2 || i % 7 === 5 ? WHITE : "#f3ead0", 0, "whiteKey");
    box([0.018, 0.027, 0.105], [0.766, y + 0.017, 0.259], BLACK, 0, "keyShadow");
  }
  for (const i of [1, 2, 4, 5, 6, 8, 9, 11, 12]) {
    box([0.035, 0.034, 0.108], [0.767, keyYs[i] + 0.028, 0.267], BLACK, 0, "blackKey");
  }
  box([0.025, 0.83, 0.025], [0.79, 0.53, 0.245], GOLD, 0, "keyboardGoldEdge");

  // Ornamental front escutcheon on keyboard case.
  cylinder(0.13, 0.018, [0.675, 1.01, 0.21], PEARL_BLUE, [0, 0, 1], "keyboardCrest");
  cylinder(0.103, 0.022, [0.687, 1.01, 0.21], GOLD, [0, 0, 1], "keyboardCrestRing");
  box([0.018, 0.12, 0.02], [0.69, 1.01, 0.23], RED, 0, "crestRuby");
  box([0.018, 0.02, 0.12], [0.69, 1.01, 0.23], RED, 0, "crestRubyCross");

  // Bellows hinges and corner caps.
  for (const x of [-0.61, 0.61]) {
    for (const y of [0.16, 0.93]) {
      cylinder(0.035, 0.055, [x, y, 0.2], BRASS, [0, 0, 1], "hingeCap");
      cylinder(0.014, 0.065, [x, y, 0.225], BLACK, [0, 0, 1], "hingePin");
    }
  }

  // Two crossed leather shoulder straps behind the instrument.
  b.rod([-0.58, 0.96, -0.20], [0.55, 0.17, -0.20], 0.027, {
    color: LEATHER,
    name: "leftShoulderStrap",
  });
  b.rod([0.58, 0.96, -0.20], [-0.55, 0.17, -0.20], 0.027, {
    color: LEATHER,
    name: "rightShoulderStrap",
  });
  for (const p of [
    [-0.43, 0.84, -0.21],
    [0.43, 0.84, -0.21],
    [-0.43, 0.28, -0.21],
    [0.43, 0.28, -0.21],
  ] as [number, number, number][]) {
    cylinder(0.035, 0.018, p, GOLD, [0, 0, 1], "strapRivet");
  }

  // A small mother-of-pearl maker's plaque on the lower front.
  box([0.25, 0.07, 0.012], [0.02, 0.115, 0.17], PEARL_PINK, 0, "makerPlaque");
  const plaqueTexture = svg(
    `<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="50" rx="8" fill="#fff8e8"/>
      <text x="100" y="33" text-anchor="middle" font-family="serif" font-size="23" font-weight="bold" fill="#7b2030">ITALIA</text>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.21, 0.052), WHITE, {
    at: [0.02, 0.115, 0.179],
    dir: [0, 0, 1],
    axis: "z",
    texture: plaqueTexture,
    name: "makerLabel",
  });

  // Small end pins and decorative studs.
  for (const x of [-0.61, 0.61]) {
    for (const y of [0.12, 0.96]) {
      cylinder(0.014, 0.026, [x, y, 0.235], GOLD, [0, 0, 1], "goldStud");
    }
  }

  return b.root;
}
