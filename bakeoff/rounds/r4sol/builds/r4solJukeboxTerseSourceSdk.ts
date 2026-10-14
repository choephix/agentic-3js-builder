import * as THREE from "three";
import {
  createBuilder, frame, rng, paint, grain, svg, bezier, polyline,
  type Fill
} from "../../../../src/index";

export const meta = {
  name: "Starlight Jukebox",
  description: "A walnut and teal vintage jukebox with honey-colored bubble tubes, chrome sunburst grille, a visible record, and a bank of miniature song selections."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Starlight Jukebox", detail: 0.7, paintSize: 1024 });
  const random = rng(1956);
  const root = b.joint("cabinet", { at: [0, 0, 0] });

  const C = {
    teal: "#176568",
    tealLight: "#328b89",
    tealDark: "#123f45",
    black: "#101820",
    glass: "#172c34",
    silver: "#c6d7d7",
    silverDark: "#758e96",
    brass: "#c99a48",
    gold: "#efc975",
    amber: "#f1a73b",
    honey: "#ffcf72",
    cream: "#fff0bd",
    ivory: "#f4e7cb",
    wine: "#762c35",
    red: "#b54743",
    ruby: "#d25b45",
    rubber: "#22272a"
  };

  for (const color of [C.silver, C.silverDark, C.brass, C.gold]) {
    const m = b.material(color);
    m.metalness = 0.78;
    m.roughness = color === C.silver ? 0.24 : 0.32;
  }
  for (const color of [C.teal, C.wine, C.red, C.ruby]) {
    b.material(color).roughness = 0.32;
    b.material(color).metalness = 0.17;
  }
  b.material(C.glass).roughness = 0.24;
  for (const color of [C.amber, C.honey, C.cream]) {
    const m = b.material(color);
    m.emissive.set(color);
    m.emissiveIntensity = color === C.cream ? 0.12 : 0.22;
    m.roughness = 0.3;
  }

  function box(
    name: string, size: number[], at: number[], color: Fill,
    rotation: number[] = [0, 0, 0]
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name, at, rotation, bone: root
    });
  }

  function disc(
    name: string, radius: number, thickness: number,
    at: number[], color: string, direction: number[] = [0, 0, 1],
    sides = 24
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, thickness, sides), color, {
      name, at, dir: direction, up: [0, 1, 0], bone: root
    });
  }

  function frontOutline(
    name: string, points: number[][], z: number,
    thickness: number, color: Fill, bevel = 0
  ) {
    return b.extrude(points, {
      name, at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0],
      thickness, color, bevel, bone: root
    });
  }

  function archOutline(r: number, bottom: number, spring: number, steps = 18) {
    const pts: number[][] = [[-r, bottom], [r, bottom], [r, spring]];
    for (let i = 1; i <= steps; i++) {
      const a = Math.PI * i / steps;
      pts.push([r * Math.cos(a), spring + r * Math.sin(a)]);
    }
    return pts;
  }

  function archPath(r: number, bottom: number, spring: number, z: number) {
    const pts: number[][] = [[-r, bottom, z], [-r, spring, z]];
    for (let i = 1; i <= 24; i++) {
      const a = Math.PI - Math.PI * i / 24;
      pts.push([r * Math.cos(a), spring + r * Math.sin(a), z]);
    }
    pts.push([r, bottom, z]);
    return polyline(pts);
  }

  function star(
    name: string, x: number, y: number, z: number,
    radius: number, color: string, inner = 0.43
  ) {
    const points: number[][] = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + i * Math.PI / 5;
      const r = i % 2 ? radius * inner : radius;
      points.push([x + r * Math.cos(a), y + r * Math.sin(a)]);
    }
    return frontOutline(name, points, z, 0.004, color);
  }

  function textPanel(
    name: string, markup: string, width: number, height: number, at: number[],
    rotation: number[] = [0, 0, 0], resolution = 512
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      name, at, rotation, bone: root, texture: svg(markup, { size: resolution })
    });
  }

  // The substantial cabinet: a simple arched walnut box, with an enamel face.
  const walnut = grain("#48251f", "#764830", { size: 0.014, axis: "y", seed: 18 });
  frontOutline("archedWalnutCabinet", archOutline(0.492, 0.045, 1.154), -0.014, 0.558, walnut, 0.018);
  frontOutline("tealEnamelFace", archOutline(0.482, 0.067, 1.154), 0.270, 0.045, C.teal, 0.012);
  frontOutline("recessedFaceShadow", archOutline(0.395, 0.177, 1.154), 0.301, 0.016, C.tealDark, 0.008);

  // Feet, stepped skirt, and bright horizontal bumper strips.
  for (const x of [-0.36, 0.36]) {
    for (const z of [-0.19, 0.19]) {
      b.part(new THREE.CylinderGeometry(0.043, 0.045, 0.035, 10), C.rubber, {
        name: "rubberFoot", at: [x, 0.0175, z], bone: root
      });
    }
  }
  box("blackUnderPlinth", [0.927, 0.035, 0.543], [0, 0.049, -0.013], C.black);
  box("steppedTealPlinth", [1.004, 0.092, 0.596], [0, 0.102, -0.006], C.tealDark);
  box("upperPlinthLip", [0.971, 0.029, 0.580], [0, 0.161, -0.006], C.teal);
  box("bumperShadow", [0.960, 0.073, 0.012], [0, 0.106, 0.299], C.black);
  for (const y of [0.080, 0.107, 0.134]) {
    box("frontChromeBumper", [0.968, 0.013, 0.021], [0, y, 0.307], C.silver);
    for (const s of [-1, 1]) {
      box("bumperWrappedEnd", [0.014, 0.013, 0.551], [s * 0.480, y, 0.026], C.silverDark);
    }
  }
  box("footerRedInlay", [0.715, 0.034, 0.012], [0, 0.181, 0.308], C.wine);
  box("footerGoldPinstripe", [0.738, 0.004, 0.015], [0, 0.203, 0.310], C.gold);

  // Continuous chrome surround and the distinctive illuminated horseshoe.
  b.sweep(archPath(0.476, 0.208, 1.154, 0.307), 0.012, {
    name: "outerChromeHorseshoe", color: C.silver, sides: 8,
    smooth: false, caps: "round", bone: root, up: [0, 0, 1]
  });
  b.sweep(archPath(0.458, 0.290, 1.154, 0.321), 0.007, {
    name: "outerBronzePinstripe", color: C.brass, sides: 6,
    caps: "round", bone: root, up: [0, 0, 1]
  });
  const amberTube = b.sweep(archPath(0.435, 0.293, 1.154, 0.338), 0.032, {
    name: "honeyBubbleTube", color: C.amber, sides: 10,
    smooth: false, caps: "flat", bone: root, up: [0, 0, 1]
  });
  b.sweep(archPath(0.395, 0.282, 1.154, 0.337), 0.010, {
    name: "innerOpalineTube", color: C.cream, sides: 8,
    caps: "round", bone: root, up: [0, 0, 1]
  });
  b.sweep(archPath(0.376, 0.218, 1.154, 0.337), 0.008, {
    name: "innerBrassSurround", color: C.brass, sides: 6,
    caps: "round", bone: root, up: [0, 0, 1]
  });

  // Flared red sockets give the upright tubes a satisfying mechanical termination.
  for (const s of [-1, 1]) {
    const x = s * 0.435;
    b.lathe([
      [0, 0], [0.032, 0], [0.045, 0.014], [0.049, 0.061],
      [0.044, 0.085], [0.034, 0.116], [0, 0.116]
    ], {
      name: "redBubbleTubeSocket", at: [x, 0.183, 0.338],
      segments: 10, color: C.red, bone: root
    });
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.014, 12), C.silver, {
      name: "socketFootRing", at: [x, 0.201, 0.338], bone: root
    });
    b.part(new THREE.CylinderGeometry(0.0355, 0.0355, 0.012, 12), C.gold, {
      name: "socketUpperFerrule", at: [x, 0.297, 0.338], bone: root
    });
    for (const y of [0.355, 0.455, 0.645, 0.850, 1.085]) {
      b.part(new THREE.TorusGeometry(0.0336, 0.0021, 4, 12), C.brass, {
        name: "uprightTubeCollar", at: [x, y, 0.338],
        rotation: [90, 0, 0], bone: root
      });
    }
  }
  for (let i = 1; i < 20; i++) {
    const a = Math.PI * i / 20;
    b.part(new THREE.TorusGeometry(0.0336, 0.0018, 4, 12), C.brass, {
      name: "archedTubeRib",
      at: [0.435 * Math.cos(a), 1.154 + 0.435 * Math.sin(a), 0.338],
      dir: [-Math.sin(a), Math.cos(a), 0], axis: "z",
      up: [0, 0, 1], bone: root
    });
  }

  // Surface-seated highlights and bubbles, not floating decorations.
  const tubeSurface = b.surface(amberTube);
  const highlight = tubeSurface.drape(archPath(0.435, 0.323, 1.154, 0.405), { lift: 0.001 });
  b.sweep(highlight, 0.0022, {
    name: "bubbleGlassHighlight", color: C.honey, sides: 5, bone: root, caps: "round"
  });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 16; i++) {
      const y = 0.340 + i * 0.048 + random() * 0.009;
      const x = s * 0.435 + (random() - 0.5) * 0.017;
      const hit = tubeSurface.ray([x, y, 0.6], [0, 0, -1]);
      if (hit) {
        const radius = 0.0027 + random() * 0.0024;
        b.stick(new THREE.SphereGeometry(radius, 6, 4), C.cream, hit, {
          name: "bubble", embed: 0.68, scale: [1, 0.7, 1], bone: root
        });
      }
    }
  }

  // The upper display is framed like a miniature proscenium.
  const windowRim = frontOutline(
    "displayBrassBezel", archOutline(0.342, 0.904, 1.145), 0.327, 0.034, C.brass, 0.006
  );
  frontOutline("displayChromeInnerEdge", archOutline(0.329, 0.916, 1.145), 0.347, 0.012, C.silverDark, 0.002);
  frontOutline("midnightDisplayGlass", archOutline(0.320, 0.923, 1.145), 0.358, 0.010, C.glass, 0.002);
  b.sweep(archPath(0.307, 1.170, 1.145, 0.370), 0.003, {
    name: "windowArchEtching", color: C.gold, sides: 5, bone: root,
    caps: "round", up: [0, 0, 1]
  });

  // Scalloped record carrier, vinyl grooves, paper label, spindle, and tonearm.
  const gear: number[][] = [];
  for (let i = 0; i < 48; i++) {
    const a = i * Math.PI * 2 / 48;
    const r = i % 4 < 2 ? 0.119 : 0.124;
    gear.push([r * Math.cos(a), 1.278 + r * Math.sin(a)]);
  }
  frontOutline("recordCarrierScallops", gear, 0.373, 0.007, C.brass);
  disc("recordCarrier", 0.115, 0.007, [0, 1.278, 0.379], C.wine, [0, 0, 1], 32);
  disc("vinylRecord", 0.108, 0.008, [0, 1.278, 0.387], C.black, [0, 0, 1], 40);
  for (const r of [0.052, 0.061, 0.070, 0.079, 0.088, 0.098, 0.104]) {
    b.part(new THREE.TorusGeometry(r, 0.00065, 3, 40), C.silverDark, {
      name: "vinylGroove", at: [0, 1.278, 0.3914], bone: root
    });
  }
  disc("recordPaperLabel", 0.039, 0.002, [0, 1.278, 0.393], C.ruby);
  b.part(new THREE.TorusGeometry(0.034, 0.001, 4, 24), C.gold, {
    name: "recordLabelBorder", at: [0, 1.278, 0.395], bone: root
  });
  disc("spindleHole", 0.0065, 0.002, [0, 1.278, 0.396], C.black, [0, 0, 1], 12);
  disc("chromeSpindle", 0.0028, 0.006, [0, 1.278, 0.400], C.silver, [0, 0, 1], 8);
  textPanel("recordLabelPrinting",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <text x="50" y="33" text-anchor="middle" fill="#fff0bd" font-family="serif" font-size="11" font-weight="bold">STARLIGHT</text>
      <text x="50" y="72" text-anchor="middle" fill="#fff0bd" font-family="sans-serif" font-size="19" font-weight="bold">45</text>
      <path d="M22 79H78" stroke="#fff0bd" stroke-width="1"/>
    </svg>`, 0.068, 0.068, [0, 1.278, 0.397], [0, 0, 0], 256);

  box("tonearmPivotMount", [0.052, 0.034, 0.017], [0.191, 1.347, 0.378], C.tealDark);
  disc("tonearmPivot", 0.019, 0.015, [0.191, 1.347, 0.393], C.silver, [0, 0, 1], 12);
  b.sweep([[0.191, 1.347, 0.406], [0.157, 1.334, 0.412], [0.080, 1.244, 0.414]], 0.0055, {
    name: "bentTonearm", color: C.silver, sides: 6, bone: root, caps: "round"
  });
  box("pickupCartridge", [0.026, 0.041, 0.016], [0.074, 1.242, 0.417], C.ivory, [0, 0, 39]);
  box("pickupNeedleCap", [0.021, 0.008, 0.018], [0.062, 1.229, 0.419], C.black, [0, 0, 39]);
  for (const s of [-1, 1]) {
    disc("displayIndicatorHousing", 0.009, 0.005, [s * 0.222, 1.255, 0.376], C.brass, [0, 0, 1], 10);
    disc("displayIndicatorLens", 0.006, 0.003, [s * 0.222, 1.255, 0.380], C.honey, [0, 0, 1], 10);
    star("displaySmallStar", s * 0.245, 1.316, 0.374, 0.013, C.gold);
  }

  box("brandPlaqueShadow", [0.235, 0.041, 0.008], [0, 1.410, 0.371], C.brass);
  box("brandPlaqueEnamel", [0.223, 0.030, 0.006], [0, 1.410, 0.378], C.wine);
  textPanel("starlightBrand",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 60">
      <text x="220" y="44" text-anchor="middle" fill="#ffe4a1" font-family="Georgia,serif" font-style="italic" font-weight="bold" font-size="46" letter-spacing="3">Starlight</text>
    </svg>`, 0.211, 0.029, [0, 1.410, 0.382], [0, 0, 0], 512);

  // Five rows of separately edged title cards, with their printing on one transparent sheet.
  const titles = [
    ["MOONLIGHT DRIVE", "The Silvertones"], ["BLUE VELVET", "June & the Comets"],
    ["SWEET LITTLE DARLIN'", "The Riviera Four"], ["MIDNIGHT SPECIAL", "The Night Owls"],
    ["ROCK AROUND THE CLOCK", "Billy & His Band"], ["SUMMER IN PARIS", "Ella Rose"],
    ["DREAM A LITTLE DREAM", "The Skylarks"], ["CHERRY SODA", "Bobby Valentine"],
    ["ONLY YOU", "The Golden Notes"], ["GOODNIGHT, SWEETHEART", "The Moonbeams"]
  ];
  let titleArt = "";
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      const i = row * 2 + col;
      const x = col === 0 ? -0.140 : 0.140;
      const y = 1.134 - row * 0.047;
      box("titleCardMetalTray", [0.267, 0.040, 0.007], [x, y, 0.373], C.brass);
      box("ivoryTitleCard", [0.257, 0.032, 0.004], [x, y, 0.380], C.ivory);
      const sx = col * 280 + 11;
      const sy = row * 47 + 4;
      titleArt += `
        <rect x="${sx}" y="${sy}" width="25" height="30" rx="2" fill="#b54743"/>
        <text x="${sx + 12.5}" y="${sy + 20}" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#fff0bd">${i + 1}</text>
        <text x="${sx + 34}" y="${sy + 12}" font-family="sans-serif" font-size="10.1" font-weight="bold" fill="#243238">${titles[i][0]}</text>
        <text x="${sx + 34}" y="${sy + 25}" font-family="Georgia,serif" font-size="9.5" font-style="italic" fill="#762c35">${titles[i][1]}</text>`;
    }
  }
  textPanel("printedSongSelections",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 235">${titleArt}</svg>`,
    0.560, 0.235, [0, 1.035, 0.383], [0, 0, 0], 1024);

  // Projecting red control shelf, ivory pushbuttons, coin slot, and return button.
  const controlBorder = frontOutline("controlShelfChrome", [
    [-0.376, 0.769], [0.376, 0.769], [0.351, 0.926], [-0.351, 0.926]
  ], 0.365, 0.060, C.silver, 0.007);
  const controlFace = frontOutline("controlShelfRedEnamel", [
    [-0.363, 0.780], [0.363, 0.780], [0.340, 0.916], [-0.340, 0.916]
  ], 0.400, 0.018, C.wine, 0.003);
  box("controlShelfTopHighlight", [0.681, 0.006, 0.035], [0, 0.921, 0.402], C.gold);
  box("controlShelfLowerLip", [0.743, 0.008, 0.035], [0, 0.772, 0.399], C.silverDark);

  for (let i = 0; i < 10; i++) {
    const x = (i - 4.5) * 0.060;
    box("buttonBlackSocket", [0.051, 0.066, 0.014], [x, 0.816, 0.416], C.black);
    b.extrude([
      [-0.0215, -0.028], [0.0215, -0.028],
      [0.023, -0.022], [0.023, 0.022],
      [0.018, 0.028], [-0.018, 0.028],
      [-0.023, 0.022], [-0.023, -0.022]
    ], {
      name: "ivorySelectionKey", at: [x, 0.816, 0.432],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.028,
      bevel: 0.003, color: i === 0 || i === 9 ? C.cream : C.ivory, bone: root
    });
    box("keyLowerGoldEdge", [0.033, 0.0025, 0.002], [x, 0.791, 0.447], C.brass);
  }
  let keyArt = "";
  for (let i = 0; i < 10; i++) {
    keyArt += `<text x="${30 + i * 60}" y="29" text-anchor="middle" fill="#26343a" font-family="sans-serif" font-size="19" font-weight="bold">${i + 1}</text>`;
  }
  textPanel("selectionKeyNumerals",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 56">${keyArt}</svg>`,
    0.600, 0.056, [0, 0.816, 0.4475], [0, 0, 0], 768);

  textPanel("selectionInstructions",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 40">
      <text x="250" y="25" text-anchor="middle" fill="#ffe4a1" font-family="sans-serif" font-size="18" letter-spacing="3">MAKE YOUR SELECTION</text>
      <path d="M22 32H478" stroke="#c99a48" stroke-width="1"/>
    </svg>`, 0.338, 0.026, [-0.123, 0.878, 0.411], [0, 0, 0], 512);
  box("coinEscutcheon", [0.170, 0.044, 0.009], [0.227, 0.879, 0.416], C.brass);
  box("coinEscutcheonInset", [0.158, 0.034, 0.003], [0.227, 0.879, 0.422], C.silver);
  box("coinSlot", [0.042, 0.0055, 0.003], [0.219, 0.881, 0.425], C.black);
  box("coinSlotLowerBevel", [0.042, 0.0015, 0.003], [0.219, 0.877, 0.427], C.silverDark);
  disc("coinReturnButton", 0.009, 0.009, [0.286, 0.879, 0.428], C.red, [0, 0, 1], 12);
  textPanel("coinPrice",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 60">
      <text x="45" y="44" text-anchor="middle" fill="#26343a" font-family="serif" font-size="45" font-weight="bold">25¢</text>
    </svg>`, 0.034, 0.023, [0.167, 0.879, 0.425], [0, 0, 0], 256);

  // A perforated woven backing under a bold, primitive-built sunburst grille.
  frontOutline("speakerOuterBezel", [
    [-0.303, 0.216], [0.303, 0.216], [0.345, 0.256], [0.345, 0.687],
    [0.287, 0.756], [-0.287, 0.756], [-0.345, 0.687], [-0.345, 0.256]
  ], 0.327, 0.037, C.brass, 0.008);
  frontOutline("speakerChromeInset", [
    [-0.298, 0.229], [0.298, 0.229], [0.329, 0.265], [0.329, 0.676],
    [0.279, 0.739], [-0.279, 0.739], [-0.329, 0.676], [-0.329, 0.265]
  ], 0.350, 0.011, C.silverDark, 0.003);

  const cloth = paint((p) => {
    const sx = p.x / 0.012;
    const sy = p.y / 0.012;
    const row = Math.floor(sy);
    const u = sx - Math.floor(sx) - 0.5;
    const shifted = sx + (row % 2 ? 0.5 : 0);
    const dx = shifted - Math.floor(shifted) - 0.5;
    const dy = sy - Math.floor(sy) - 0.5;
    if (dx * dx + dy * dy < 0.071) return "#0b171b";
    if (Math.abs(u) > 0.42 || Math.abs(dy) > 0.43) return "#5a5444";
    return "#303d3d";
  });
  frontOutline("wovenSpeakerCloth", [
    [-0.288, 0.239], [0.288, 0.239], [0.315, 0.272], [0.315, 0.669],
    [0.272, 0.725], [-0.272, 0.725], [-0.315, 0.669], [-0.315, 0.272]
  ], 0.360, 0.008, cloth);

  for (let i = 0; i < 8; i++) {
    const y = 0.285 + i * 0.055;
    const width = y > 0.66 ? 0.553 : 0.607;
    b.rod([-width / 2, y, 0.367], [width / 2, y, 0.367], 0.0023, {
      name: "speakerCrosswire", color: C.brass, sides: 5, bone: root
    });
  }
  for (let i = 0; i < 15; i++) {
    const x = -0.300 + i * 0.600 / 14;
    const endY = 0.715 - 0.126 * Math.pow(Math.abs(x) / 0.300, 1.8);
    const startX = (i - 7) * 0.0026;
    b.sweep(bezier(
      [startX, 0.270, 0.378],
      [x * 0.44, 0.401, 0.383],
      [x * 0.87, endY - 0.118, 0.380],
      [x, endY, 0.378]
    ), i === 7 ? 0.0065 : 0.0045, {
      name: "sunburstSpeakerRib", color: i % 2 ? C.gold : C.silver,
      sides: 6, smooth: false, caps: "round", bone: root
    });
  }
  disc("speakerSunburstHub", 0.041, 0.017, [0, 0.272, 0.392], C.brass, [0, 0, 1], 16);
  disc("speakerHubRedEnamel", 0.031, 0.008, [0, 0.272, 0.405], C.wine, [0, 0, 1], 16);
  star("speakerHubStar", 0, 0.272, 0.412, 0.023, C.gold);
  box("grilleLowerChromeRail", [0.555, 0.009, 0.015], [0, 0.230, 0.370], C.silver);

  textPanel("highFidelityFooter",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 42">
      <text x="280" y="27" text-anchor="middle" fill="#ffe4a1" font-family="sans-serif" font-size="19" letter-spacing="6">HIGH FIDELITY • 200</text>
    </svg>`, 0.401, 0.030, [0, 0.181, 0.316], [0, 0, 0], 512);

  // Hardware seated directly on its actual face triangles.
  const controlSurface = b.surface([controlBorder, controlFace]);
  for (const x of [-0.339, 0.339]) {
    for (const y of [0.796, 0.893]) {
      const hit = controlSurface.ray([x, y, 0.7], [0, 0, -1]);
      if (hit) {
        b.stick(new THREE.CylinderGeometry(0.0036, 0.0036, 0.002, 8), C.silver, hit, {
          name: "fasciaScrew", embed: 0, bone: root
        });
        box("screwDriverSlot", [0.0044, 0.0007, 0.0006],
          [hit.at.x, hit.at.y, hit.at.z + 0.0022], C.black);
      }
    }
  }
  const rimSurface = b.surface(windowRim);
  for (const x of [-0.335, 0.335]) {
    for (const y of [0.952, 1.105]) {
      const hit = rimSurface.ray([x, y, 0.7], [0, 0, -1]);
      if (hit) b.stick(new THREE.CylinderGeometry(0.003, 0.003, 0.0018, 8), C.gold, hit, {
        name: "displayBezelRivet", embed: 0, bone: root
      });
    }
  }
  for (const x of [-0.325, 0.325]) {
    for (const y of [0.284, 0.630]) {
      disc("speakerBezelScrew", 0.0035, 0.002, [x, y, 0.351], C.gold, [0, 0, 1], 8);
    }
  }

  // Small crown finial, with wing-like chrome flourishes.
  b.rod([-0.077, 1.615, 0.326], [-0.019, 1.631, 0.330], 0.0045, {
    name: "crownWingL", color: C.silver, sides: 6, bone: root
  });
  b.rod([0.077, 1.615, 0.326], [0.019, 1.631, 0.330], 0.0045, {
    name: "crownWingR", color: C.silver, sides: 6, bone: root
  });
  star("crownStar", 0, 1.634, 0.339, 0.026, C.gold);

  // Finished sides and rear make the object worthwhile to orbit.
  for (const s of [-1, 1]) {
    box("sidePanelGasket", [0.008, 0.628, 0.359], [s * 0.495, 0.644, -0.030], C.tealDark);
    b.extrude([
      [-0.157, -0.285], [0.157, -0.285], [0.166, -0.267],
      [0.166, 0.267], [0.147, 0.285], [-0.147, 0.285],
      [-0.166, 0.267], [-0.166, -0.267]
    ], {
      name: "walnutSideAccessPanel", at: [s * 0.501, 0.644, -0.030],
      x: [0, 0, 1], y: [0, 1, 0], thickness: 0.008,
      bevel: 0.003, color: walnut, bone: root
    });
    for (let i = 0; i < 6; i++) {
      box("sideVentShadow", [0.007, 0.013, 0.233], [s * 0.508, 0.768 + i * 0.026, -0.030], C.black);
      box("sideVentLip", [0.007, 0.003, 0.237], [s * 0.512, 0.775 + i * 0.026, -0.030], C.brass);
    }
    for (const y of [0.379, 0.909]) {
      for (const z of [-0.172, 0.111]) {
        disc("sideAccessScrew", 0.0037, 0.0025, [s * 0.508, y, z],
          C.brass, [s, 0, 0], 8);
      }
    }
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.005, 16), C.brass, {
      name: "sideManufacturerBadge", at: [s * 0.510, 0.514, -0.030],
      dir: [s, 0, 0], bone: root
    });
    b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.003, 16), C.teal, {
      name: "sideBadgeEnamel", at: [s * 0.514, 0.514, -0.030],
      dir: [s, 0, 0], bone: root
    });
    textPanel("sideBadgePrinting",
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text x="50" y="35" text-anchor="middle" fill="#ffe4a1" font-family="serif" font-size="14">STARLIGHT</text>
        <text x="50" y="64" text-anchor="middle" fill="#ffe4a1" font-family="serif" font-size="25" font-weight="bold">200</text>
        <path d="M25 75H75" stroke="#ffe4a1" stroke-width="2"/>
      </svg>`, 0.070, 0.070, [s * 0.517, 0.514, -0.030], [0, s * 90, 0], 256);
  }

  box("rearAccessGasket", [0.784, 1.206, 0.008], [0, 0.713, -0.296], C.black);
  box("rearWalnutAccessDoor", [0.756, 1.176, 0.009], [0, 0.713, -0.304], walnut);
  for (let i = 0; i < 8; i++) {
    box("rearVentSlot", [0.535, 0.013, 0.006], [0, 1.066 + i * 0.025, -0.311], C.black);
    box("rearVentUpperLip", [0.541, 0.003, 0.006], [0, 1.074 + i * 0.025, -0.315], C.tealDark);
  }
  for (const x of [-0.352, 0.352]) {
    for (const y of [0.160, 0.720, 1.265]) {
      disc("rearDoorScrew", 0.004, 0.002, [x, y, -0.312], C.brass, [0, 0, -1], 8);
    }
  }
  box("rearSerialPlate", [0.170, 0.069, 0.003], [0, 0.393, -0.312], C.brass);
  textPanel("rearSerialPrinting",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 138">
      <text x="170" y="36" text-anchor="middle" fill="#26343a" font-family="sans-serif" font-size="23" font-weight="bold">STARLIGHT MODEL 200</text>
      <text x="170" y="65" text-anchor="middle" fill="#26343a" font-family="sans-serif" font-size="15">HIGH FIDELITY MUSIC SYSTEM</text>
      <path d="M25 80H315" stroke="#26343a" stroke-width="2"/>
      <text x="170" y="110" text-anchor="middle" fill="#26343a" font-family="monospace" font-size="18">SERIAL No. 1956–0084</text>
    </svg>`, 0.160, 0.064, [0, 0.393, -0.314], [0, 180, 0], 512);
  box("powerSocketPanel", [0.065, 0.048, 0.012], [0.260, 0.188, -0.316], C.black);
  disc("powerCableSocket", 0.012, 0.008, [0.260, 0.188, -0.325], C.rubber, [0, 0, -1], 10);
  box("rearPowerSwitch", [0.012, 0.020, 0.009], [0.284, 0.188, -0.328], C.red);

  return b.root;
}
