import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented low-poly piano accordion with black bellows, pearl-inlaid end cases, gold trim, piano keys, bass buttons, grillework, straps, rivets, and carved Italian scroll motifs.",
};

export default function build() {
  const b = createBuilder({ name: "italianMotherOfPearlAccordion", detail: 1 });

  const IVORY = "#f5ead0";
  const BLACK = "#17151a";
  const BELLOWS = "#241b1c";
  const DEEP_BELLOWS = "#0d0b0e";
  const PEARL = "#e9f2e5";
  const PEARL_BLUE = "#b9d5d8";
  const PEARL_PINK = "#efd0cb";
  const PEARL_GOLD = "#e7c98b";
  const GOLD = "#b8792d";
  const GOLD_LIGHT = "#f4cf72";
  const GOLD_DARK = "#704019";
  const WOOD = "#5c2920";
  const LEATHER = "#30191b";
  const RED = "#9d3037";
  const DARK_RED = "#4a151d";
  const BUTTON = "#c8d6cb";
  const BUTTON_DARK = "#45636a";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, name });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name?: string,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      name,
      scale,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
    });

  const ring = (
    radius: number,
    tube: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 0, 1],
    name?: string,
  ) =>
    b.part(new THREE.TorusGeometry(radius, tube, 5, 12), color, {
      at,
      dir,
      name,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, name });

  const frontPanel = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    name: string,
  ) => {
    box([w, h, 0.025], [x, y, 0.274], color, name);
    rod([x - w / 2, y - h / 2, 0.292], [x + w / 2, y - h / 2, 0.292], 0.009, GOLD_DARK, `${name}_bottom`);
    rod([x - w / 2, y + h / 2, 0.292], [x + w / 2, y + h / 2, 0.292], 0.009, GOLD_DARK, `${name}_top`);
    rod([x - w / 2, y - h / 2, 0.292], [x - w / 2, y + h / 2, 0.292], 0.009, GOLD_DARK, `${name}_left`);
    rod([x + w / 2, y - h / 2, 0.292], [x + w / 2, y + h / 2, 0.292], 0.009, GOLD_DARK, `${name}_right`);
  };

  const pearlTile = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    name: string,
  ) => {
    frontPanel(x, y, w, h, color, name);
    ring(Math.min(w, h) * 0.23, 0.006, [x, y, 0.31], GOLD_LIGHT, [0, 0, 1], `${name}_halo`);
    sphere(0.014, [x, y, 0.324], PEARL_GOLD, `${name}_jewel`, [1, 1, 0.35]);
  };

  // Main end cabinets. The bottom edge is just above the floor.
  box([0.23, 1.12, 0.54], [-0.52, 0.61, 0], WOOD, "bassCase");
  box([0.23, 1.12, 0.54], [0.52, 0.61, 0], WOOD, "pianoCase");

  // Warm shell-colored outer strips and corner caps.
  for (const x of [-0.52, 0.52]) {
    box([0.245, 1.08, 0.045], [x, 0.61, 0.274], PEARL, `caseFront_${x}`);
    box([0.245, 1.08, 0.035], [x, 0.61, -0.274], PEARL_BLUE, `caseBack_${x}`);
    box([0.04, 1.12, 0.56], [x - 0.105, 0.61, 0], GOLD_DARK, `caseEdgeL_${x}`);
    box([0.04, 1.12, 0.56], [x + 0.105, 0.61, 0], GOLD_DARK, `caseEdgeR_${x}`);
    box([0.245, 0.045, 0.56], [x, 0.075, 0], GOLD, `caseFootRail_${x}`);
    box([0.245, 0.045, 0.56], [x, 1.145, 0], GOLD_LIGHT, `caseTopRail_${x}`);
  }

  // Pearl mosaic on both end plates.
  const tileColors = [PEARL, PEARL_BLUE, PEARL_PINK, PEARL_GOLD];
  for (const side of [-1, 1]) {
    const x = side * 0.52;
    const rows = 4;
    const cols = 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const yy = 0.22 + r * 0.20;
        const zz = 0.205 + c * 0.105;
        // A shallow side-facing mosaic strip gives the cases an inlaid shell edge.
        box(
          [0.024, 0.145, 0.08],
          [x + side * 0.128, yy, zz - 0.30],
          tileColors[(r + c + (side > 0 ? 1 : 0)) % tileColors.length],
          `sideMosaic_${side}_${r}_${c}`,
        );
      }
    }
  }

  pearlTile(-0.52, 0.80, 0.14, 0.22, PEARL_PINK, "bassMedallion");
  pearlTile(0.52, 0.80, 0.14, 0.22, PEARL_BLUE, "pianoMedallion");

  // Large Italian scrollwork: mirrored curls around the medallions.
  for (const side of [-1, 1]) {
    const x = side * 0.52;
    const z = 0.31;
    rod([x - side * 0.055, 0.91, z], [x + side * 0.055, 0.97, z], 0.012, GOLD_LIGHT, `scrollStem_${side}`);
    rod([x + side * 0.055, 0.97, z], [x + side * 0.078, 1.03, z], 0.010, GOLD, `scrollUpper_${side}`);
    rod([x + side * 0.078, 1.03, z], [x + side * 0.045, 1.075, z], 0.009, GOLD_LIGHT, `scrollUpper2_${side}`);
    rod([x - side * 0.055, 0.69, z], [x + side * 0.055, 0.63, z], 0.012, GOLD_LIGHT, `scrollLower_${side}`);
    rod([x + side * 0.055, 0.63, z], [x + side * 0.078, 0.57, z], 0.010, GOLD, `scrollLower2_${side}`);
    rod([x + side * 0.078, 0.57, z], [x + side * 0.045, 0.525, z], 0.009, GOLD_LIGHT, `scrollLower3_${side}`);
    ring(0.052, 0.009, [x + side * 0.066, 1.045, z], GOLD, [0, 0, 1], `scrollCurlTop_${side}`);
    ring(0.052, 0.009, [x + side * 0.066, 0.555, z], GOLD, [0, 0, 1], `scrollCurlBottom_${side}`);
  }

  // The bellows core, hidden behind the pleats.
  box([0.78, 0.82, 0.42], [0, 0.62, 0], DEEP_BELLOWS, "bellowsCore");

  // Pleated bellows: broad dark folds, pale edge highlights, and gold end seams.
  const pleatXs = [-0.39, -0.30, -0.21, -0.12, -0.03, 0.06, 0.15, 0.24, 0.33, 0.40];
  for (let i = 0; i < pleatXs.length; i++) {
    const x = pleatXs[i];
    const lean = i % 2 === 0 ? 0.012 : -0.012;
    box([0.052, 0.86, 0.46], [x, 0.62, 0], BELLOWS, `bellowsFold_${i}`);
    box([0.012, 0.88, 0.475], [x + lean, 0.62, 0.238], DARK_RED, `bellowsFrontRib_${i}`);
    box([0.012, 0.88, 0.475], [x - lean, 0.62, -0.238], GOLD_DARK, `bellowsBackRib_${i}`);
    rod([x, 0.20, 0.242], [x, 1.04, 0.242], 0.006, GOLD, `bellowsFrontStitch_${i}`);
  }

  // Bellows corner bands and leather-looking top and bottom straps.
  for (const x of [-0.42, 0.42]) {
    box([0.035, 0.89, 0.49], [x, 0.62, 0], GOLD, `bellowsEndBand_${x}`);
  }
  box([0.82, 0.055, 0.49], [0, 1.065, 0], LEATHER, "upperBellowsBinding");
  box([0.82, 0.055, 0.49], [0, 0.175, 0], LEATHER, "lowerBellowsBinding");

  // Decorative studs along bellows bindings.
  for (let i = 0; i < 9; i++) {
    const x = -0.36 + i * 0.09;
    sphere(0.012, [x, 1.098, 0.22], GOLD_LIGHT, `upperStud_${i}`, [1, 1, 0.4]);
    sphere(0.012, [x, 0.142, 0.22], GOLD_LIGHT, `lowerStud_${i}`, [1, 1, 0.4]);
  }

  // Piano keyboard on the right-hand cabinet, facing the viewer.
  const keyX = 0.66;
  const whiteKeys = 11;
  for (let i = 0; i < whiteKeys; i++) {
    const y = 0.25 + i * 0.073;
    box([0.13, 0.063, 0.062], [keyX, y, 0.315], IVORY, `whiteKey_${i}`);
    rod([keyX - 0.062, y - 0.030, 0.349], [keyX + 0.062, y - 0.030, 0.349], 0.003, GOLD_DARK, `keySeam_${i}`);
    sphere(0.006, [keyX + 0.054, y, 0.353], GOLD_LIGHT, `keyPin_${i}`);
  }
  const blackIndices = [0, 1, 3, 4, 5, 7, 8, 10];
  for (let i = 0; i < blackIndices.length; i++) {
    const k = blackIndices[i];
    const y = 0.25 + k * 0.073 + 0.038;
    box([0.105, 0.040, 0.075], [keyX + 0.014, y, 0.357], BLACK, `blackKey_${i}`);
    box([0.018, 0.038, 0.010], [keyX + 0.064, y, 0.398], GOLD_DARK, `blackKeyTip_${i}`);
  }
  box([0.16, 0.055, 0.035], [keyX, 0.20, 0.33], GOLD, "keyboardBottomRail");
  box([0.16, 0.055, 0.035], [keyX, 1.06, 0.33], GOLD_LIGHT, "keyboardTopRail");

  // Bass-button board on the left case.
  box([0.17, 0.66, 0.035], [-0.66, 0.64, 0.315], DARK_RED, "bassButtonInset");
  const buttonRows = 5;
  const buttonCols = 3;
  for (let r = 0; r < buttonRows; r++) {
    for (let c = 0; c < buttonCols; c++) {
      const y = 0.38 + r * 0.13;
      const z = 0.275 + c * 0.055;
      const col = (r + c) % 3 === 0 ? PEARL_PINK : (r + c) % 3 === 1 ? BUTTON : PEARL_BLUE;
      cyl(0.025, 0.018, [-0.66, y, z], col, [0, 0, 1], 10, `bassButton_${r}_${c}`);
      ring(0.030, 0.004, [-0.66, y, z + 0.012], GOLD, [0, 0, 1], `bassButtonRing_${r}_${c}`);
    }
  }
  box([0.19, 0.045, 0.04], [-0.66, 0.25, 0.325], GOLD, "bassBottomRail");
  box([0.19, 0.045, 0.04], [-0.66, 1.03, 0.325], GOLD_LIGHT, "bassTopRail");

  // Bass grille above the buttons: alternating slats with pearl corners.
  box([0.18, 0.16, 0.025], [-0.66, 0.94, 0.347], BLACK, "bassGrille");
  for (let i = 0; i < 6; i++) {
    const y = 0.875 + i * 0.026;
    rod([-0.735, y, 0.365], [-0.585, y, 0.365], 0.006, GOLD_LIGHT, `grilleSlat_${i}`);
  }
  for (const y of [0.855, 1.02]) {
    for (const z of [0.275, 0.405]) {
      sphere(0.012, [-0.66, y, z], PEARL_GOLD, `grilleCorner_${y}_${z}`);
    }
  }

  // Long gold hinge and case hardware down the inner edges.
  for (const side of [-1, 1]) {
    const x = side * 0.405;
    rod([x, 0.18, -0.285], [x, 1.06, -0.285], 0.016, GOLD_DARK, `rearHinge_${side}`);
    for (let i = 0; i < 6; i++) {
      cyl(0.026, 0.025, [x, 0.25 + i * 0.145, -0.305], GOLD_LIGHT, [0, 0, 1], 8, `hingePin_${side}_${i}`);
    }
  }

  // Piano-side heraldic badge and small mother-of-pearl diamonds.
  box([0.12, 0.11, 0.018], [0.52, 0.47, 0.322], RED, "heraldicBadge");
  ring(0.060, 0.008, [0.52, 0.47, 0.337], GOLD_LIGHT, [0, 0, 1], "heraldicRing");
  const diamond = new THREE.OctahedronGeometry(0.038, 0);
  for (const side of [-1, 1]) {
    b.part(diamond, PEARL_GOLD, {
      at: [0.52, 0.47 + side * 0.115, 0.34],
      dir: [0, 0, 1],
      name: `heraldicDiamond_${side}`,
      scale: [1, 1, 0.35],
    });
  }

  // Small feet keep the lowest surfaces at the floor and add a furniture-like silhouette.
  for (const x of [-0.60, -0.44, 0.44, 0.60]) {
    cyl(0.045, 0.06, [x, 0.03, -0.18], BLACK, [0, 1, 0], 8, `foot_${x}`);
    sphere(0.047, [x, 0.005, -0.18], GOLD_DARK, `footPad_${x}`, [1, 0.22, 1]);
  }

  // Shoulder strap anchors, visible above and behind the cases.
  for (const side of [-1, 1]) {
    const x = side * 0.52;
    cyl(0.035, 0.025, [x, 1.16, -0.18], GOLD, [0, 1, 0], 10, `strapAnchorTop_${side}`);
    cyl(0.035, 0.025, [x, 0.20, -0.18], GOLD, [0, 1, 0], 10, `strapAnchorBottom_${side}`);
    rod([x, 1.16, -0.19], [x, 0.20, -0.19], 0.022, LEATHER, `strapVertical_${side}`);
  }

  // A top carry handle spanning the two cabinets.
  rod([-0.48, 1.17, -0.22], [0.48, 1.17, -0.22], 0.025, LEATHER, "carryHandle");
  for (const x of [-0.43, 0.43]) {
    cyl(0.038, 0.06, [x, 1.16, -0.22], GOLD, [0, 1, 0], 10, `handleSocket_${x}`);
    sphere(0.027, [x, 1.20, -0.22], GOLD_LIGHT, `handleSocketCap_${x}`);
  }

  // End-grain shell flecks: tiny pearl diamonds laid over each main case.
  for (const side of [-1, 1]) {
    const x = side * 0.52;
    for (let i = 0; i < 10; i++) {
      const y = 0.25 + (i % 5) * 0.16;
      const z = 0.195 + (i % 2) * 0.10;
      b.part(new THREE.OctahedronGeometry(0.015, 0), i % 2 ? PEARL_BLUE : PEARL_PINK, {
        at: [x, y, z],
        dir: [0, 0, 1],
        scale: [1, 1, 0.28],
        name: `shellFleck_${side}_${i}`,
      });
    }
  }

  // Brass corner rivets around the two cabinet faces.
  for (const side of [-1, 1]) {
    const x = side * 0.52;
    for (const y of [0.12, 1.10]) {
      for (const z of [0.17, 0.40]) {
        sphere(0.016, [x, y, z], GOLD_LIGHT, `caseRivet_${side}_${y}_${z}`, [1, 1, 0.35]);
      }
    }
  }

  return b.root;
}
