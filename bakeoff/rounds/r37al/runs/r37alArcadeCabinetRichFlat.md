```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "synthwave-arcade-cabinet",
  description:
    "A stylized 1980s upright arcade cabinet with a glowing CRT, neon magenta and cyan trim, marquee, joystick, buttons, coin door, vents, speakers, and pixel-art side graphics.",
};

export default function build() {
  const b = createBuilder({ name: "synthwaveArcade", detail: 1 });

  const BLACK = "#090817";
  const DEEP = "#120d29";
  const PURPLE = "#29125c";
  const VIOLET = "#5520a4";
  const MAGENTA = "#ff2bbd";
  const HOTPINK = "#ff4edb";
  const CYAN = "#18e8ff";
  const BLUE = "#196bff";
  const ELECTRIC = "#8c6cff";
  const YELLOW = "#ffe45c";
  const ORANGE = "#ff7938";
  const WHITE = "#fff5ff";
  const GREY = "#3b3450";
  const DARKGREY = "#1a1728";
  const METAL = "#756b91";
  const COIN = "#ffd76a";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...options,
    });
  };

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 12), color, {
      at,
      ...options,
    });
  };

  const neonBar = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
  ) => {
    return glow(
      box(size, color, at, {
        rotation,
        name: "neonBar",
      }),
      2.2,
    );
  };

  // Overall cabinet footprint: 0.78 m wide, 0.72 m deep, 1.82 m tall.
  // A broad lower plinth makes the machine feel planted on the floor.
  box([0.82, 0.10, 0.70], BLACK, [0, 0.05, 0.0], { name: "floorPlinth" });
  box([0.74, 0.06, 0.62], VIOLET, [0, 0.12, 0.0], { name: "plinthInset" });
  neonBar([0.68, 0.018, 0.018], CYAN, [0, 0.145, 0.315]);
  neonBar([0.68, 0.018, 0.018], MAGENTA, [0, 0.145, -0.315]);

  // Lower cabinet body.
  box([0.74, 0.73, 0.62], DEEP, [0, 0.50, 0.0], { name: "lowerCabinet" });
  box([0.69, 0.64, 0.025], PURPLE, [0, 0.50, 0.314], { name: "frontLowerPanel" });

  // Lower side shells, slightly proud of the main body for a layered arcade silhouette.
  box([0.035, 0.70, 0.65], VIOLET, [0.385, 0.52, 0.0], { name: "sideShellL" });
  box([0.035, 0.70, 0.65], VIOLET, [-0.385, 0.52, 0.0], { name: "sideShellR" });
  neonBar([0.018, 0.66, 0.018], MAGENTA, [0.405, 0.53, 0.326]);
  neonBar([0.018, 0.66, 0.018], MAGENTA, [-0.405, 0.53, 0.326]);

  // The control deck projects forward and slopes down toward the player.
  box([0.76, 0.17, 0.46], BLACK, [0, 0.87, 0.115], {
    rotation: [-8, 0, 0],
    name: "controlDeckShell",
  });
  box([0.70, 0.035, 0.39], PURPLE, [0, 0.93, 0.125], {
    rotation: [-8, 0, 0],
    name: "controlDeckSurface",
  });
  neonBar([0.63, 0.018, 0.018], CYAN, [0, 0.855, 0.345], [0, 0, 0]);
  neonBar([0.62, 0.018, 0.018], MAGENTA, [0, 0.975, -0.075], [-8, 0, 0]);

  // Small deck lip, with an inset dark underside.
  box([0.72, 0.055, 0.07], BLACK, [0, 0.78, 0.36], {
    rotation: [-8, 0, 0],
    name: "deckLip",
  });
  box([0.56, 0.025, 0.035], CYAN, [0, 0.792, 0.397], {
    rotation: [-8, 0, 0],
    name: "deckLipLight",
  });

  // Upper monitor housing, set back from the control panel.
  box([0.74, 0.76, 0.54], DEEP, [0, 1.30, -0.035], {
    rotation: [-4, 0, 0],
    name: "monitorHousing",
  });
  box([0.035, 0.74, 0.57], VIOLET, [0.385, 1.30, -0.035], {
    rotation: [-4, 0, 0],
    name: "monitorSideL",
  });
  box([0.035, 0.74, 0.57], VIOLET, [-0.385, 1.30, -0.035], {
    rotation: [-4, 0, 0],
    name: "monitorSideR",
  });

  // Strong diagonal side rails define the classic wedge profile.
  box([0.022, 0.68, 0.025], MAGENTA, [0.407, 1.30, 0.24], {
    rotation: [0, 0, -10],
    name: "sideRailFrontL",
  });
  box([0.022, 0.68, 0.025], MAGENTA, [-0.407, 1.30, 0.24], {
    rotation: [0, 0, 10],
    name: "sideRailFrontR",
  });
  box([0.022, 0.62, 0.025], CYAN, [0.407, 1.30, -0.28], {
    rotation: [0, 0, 8],
    name: "sideRailBackL",
  });
  box([0.022, 0.62, 0.025], CYAN, [-0.407, 1.30, -0.28], {
    rotation: [0, 0, -8],
    name: "sideRailBackR",
  });

  // CRT bezel and layered screen surround.
  box([0.62, 0.52, 0.065], BLACK, [0, 1.34, 0.255], {
    rotation: [-4, 0, 0],
    name: "screenBezel",
  });
  box([0.57, 0.47, 0.022], VIOLET, [0, 1.345, 0.292], {
    rotation: [-4, 0, 0],
    name: "screenFrame",
  });

  const glass = box([0.505, 0.375, 0.012], "#29124d", [0, 1.35, 0.309], {
    rotation: [-4, 0, 0],
    name: "crtGlass",
  });
  glow(glass, 0.35);

  // CRT display: a dark purple screen with a bright synthwave horizon.
  const screen = box([0.47, 0.34, 0.006], "#100b28", [0, 1.35, 0.318], {
    rotation: [-4, 0, 0],
    name: "crtScreen",
  });
  glow(screen, 0.7);

  // Scanlines and display geometry, each a separate bold graphic strip.
  for (let i = 0; i < 7; i++) {
    const y = 1.205 + i * 0.045;
    const line = box([0.445, 0.006, 0.008], i % 2 ? "#32106b" : "#4b1890", [0, y, 0.326], {
      rotation: [-4, 0, 0],
      name: "scanline",
    });
    glow(line, 0.8);
  }

  // A stylized glowing horizon and sun.
  const sun = cyl(0.075, 0.008, ORANGE, [0, 1.37, 0.333], {
    dir: [0, 0, 1],
    axis: "z",
    name: "sunDisc",
  });
  glow(sun, 1.8);
  for (let i = 0; i < 4; i++) {
    const y = 1.34 + i * 0.018;
    const stripe = box([0.14 - i * 0.018, 0.006, 0.008], MAGENTA, [0, y, 0.338], {
      rotation: [-4, 0, 0],
      name: "sunStripe",
    });
    glow(stripe, 1.5);
  }

  // Perspective grid: cyan road lines converge toward the monitor center.
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.055;
    const road = box([0.008, 0.16, 0.008], CYAN, [x, 1.215, 0.342], {
      rotation: [-4, i * 2.2, 0],
      name: "screenGridLong",
    });
    glow(road, 1.2);
  }
  for (let i = 0; i < 4; i++) {
    const y = 1.19 + i * 0.035;
    const horizon = box([0.42 - i * 0.04, 0.006, 0.008], CYAN, [0, y, 0.344], {
      rotation: [-4, 0, 0],
      name: "screenGridCross",
    });
    glow(horizon, 1.2);
  }

  // Upper bezel highlights and corner bolts.
  box([0.54, 0.018, 0.018], CYAN, [0, 1.615, 0.315], {
    rotation: [-4, 0, 0],
    name: "screenTopGlow",
  });
  box([0.54, 0.018, 0.018], MAGENTA, [0, 1.075, 0.30], {
    rotation: [-4, 0, 0],
    name: "screenBottomGlow",
  });

  for (const x of [-0.285, 0.285]) {
    for (const y of [1.12, 1.57]) {
      cyl(0.012, 0.012, YELLOW, [x, y, 0.34], {
        dir: [0, 0, 1],
        axis: "z",
        name: "bezelBolt",
      });
    }
  }

  // Marquee crown and its dark cap.
  box([0.80, 0.12, 0.58], BLACK, [0, 1.765, -0.015], {
    rotation: [-3, 0, 0],
    name: "marqueeCrown",
  });
  box([0.70, 0.07, 0.035], MAGENTA, [0, 1.755, 0.29], {
    rotation: [-3, 0, 0],
    name: "marqueePanel",
  });
  box([0.62, 0.045, 0.018], CYAN, [0, 1.755, 0.312], {
    rotation: [-3, 0, 0],
    name: "marqueeGlow",
  });
  glow(
    box([0.56, 0.032, 0.012], "#ffb6fa", [0, 1.755, 0.326], {
      rotation: [-3, 0, 0],
      name: "marqueeWhiteCore",
    }),
    2.5,
  );

  // Marquee lettering represented as chunky individual bars: "N E O N".
  const letterY = 1.755;
  const letterZ = 0.337;
  const letters: Array<[number, number, number, number]> = [
    [-0.235, 0.048, 0.012, 0.045],
    [-0.235, 0.015, 0.012, 0.045],
    [-0.235, -0.018, 0.012, 0.045],
    [-0.235, -0.051, 0.012, 0.045],
    [-0.075, 0.05, 0.012, 0.045],
    [-0.075, 0.0, 0.012, 0.045],
    [-0.075, -0.05, 0.012, 0.045],
    [0.075, 0.05, 0.012, 0.045],
    [0.075, 0.0, 0.012, 0.045],
    [0.075, -0.05, 0.012, 0.045],
    [0.225, 0.05, 0.012, 0.045],
    [0.225, 0.0, 0.012, 0.045],
    [0.225, -0.05, 0.012, 0.045],
  ];
  for (const [x, y, w, h] of letters) {
    glow(
      box([w, h, 0.008], WHITE, [x, letterY + y, letterZ], {
        rotation: [-3, 0, 0],
        name: "marqueeLetter",
      }),
      2,
    );
  }

  // Control panel fascia and service separation line.
  box([0.68, 0.07, 0.025], BLACK, [0, 0.70, 0.326], { name: "controlFascia" });
  box([0.56, 0.012, 0.012], CYAN, [0, 0.716, 0.343], { name: "fasciaLine" });

  // Joystick base and upright shaft.
  cyl(0.075, 0.022, BLACK, [-0.18, 0.965, 0.12], { name: "joystickBase" });
  cyl(0.052, 0.018, METAL, [-0.18, 0.986, 0.12], { name: "joystickCollar" });
  cyl(0.014, 0.16, METAL, [-0.18, 1.055, 0.12], { name: "joystickStem" });
  const knob = cyl(0.052, 0.052, MAGENTA, [-0.18, 1.145, 0.12], {
    name: "joystickBall",
  });
  glow(knob, 1.25);
  cyl(0.030, 0.058, CYAN, [-0.18, 1.145, 0.12], {
    name: "joystickBallInset",
  });

  // Four arcade buttons in a jaunty synthwave palette.
  const buttons = [
    { x: 0.055, y: 0.995, color: MAGENTA },
    { x: 0.145, y: 0.995, color: CYAN },
    { x: 0.235, y: 0.995, color: YELLOW },
    { x: 0.325, y: 0.995, color: ORANGE },
  ];
  for (const button of buttons) {
    cyl(0.032, 0.018, BLACK, [button.x, button.y, 0.12], { name: "buttonBezel" });
    const part = cyl(0.025, 0.025, button.color, [button.x, button.y + 0.014, 0.12], {
      name: "arcadeButton",
    });
    glow(part, 1.4);
  }

  // Small start/select buttons.
  for (const x of [-0.01, 0.075]) {
    cyl(0.018, 0.015, BLACK, [x, 0.998, -0.035], { name: "smallButtonBezel" });
    cyl(0.012, 0.018, WHITE, [x, 1.009, -0.035], { name: "smallButton" });
  }

  // Speaker grille panel.
  box([0.40, 0.18, 0.025], BLACK, [0, 0.61, 0.337], { name: "speakerPanel" });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 11; col++) {
      const x = -0.22 + col * 0.044;
      const y = 0.555 + row * 0.045;
      cyl(0.007, 0.008, CYAN, [x, y, 0.355], {
        dir: [0, 0, 1],
        axis: "z",
        name: "speakerHole",
      });
    }
  }
  box([0.43, 0.012, 0.012], MAGENTA, [0, 0.70, 0.355], { name: "speakerTrim" });

  // Coin door assembly.
  box([0.31, 0.25, 0.028], BLACK, [0, 0.355, 0.342], { name: "coinDoorFrame" });
  box([0.27, 0.205, 0.014], DARKGREY, [0, 0.36, 0.36], { name: "coinDoorInset" });
  box([0.22, 0.015, 0.012], VIOLET, [0, 0.455, 0.374], { name: "coinDoorTopTrim" });
  box([0.20, 0.012, 0.012], CYAN, [0, 0.265, 0.374], { name: "coinDoorBottomTrim" });

  // Coin slot, return slot, and glowing service button.
  box([0.085, 0.018, 0.012], METAL, [0, 0.405, 0.374], { name: "coinSlot" });
  box([0.05, 0.012, 0.009], BLACK, [0, 0.405, 0.382], { name: "coinSlotGap" });
  box([0.11, 0.014, 0.010], METAL, [0, 0.335, 0.374], { name: "returnSlot" });
  const service = cyl(0.025, 0.018, COIN, [0.09, 0.405, 0.377], {
    dir: [0, 0, 1],
    axis: "z",
    name: "serviceLamp",
  });
  glow(service, 1.5);
  for (const x of [-0.115, 0.115]) {
    cyl(0.012, 0.012, METAL, [x, 0.31, 0.377], {
      dir: [0, 0, 1],
      axis: "z",
      name: "coinDoorBolt",
    });
    cyl(0.012, 0.012, METAL, [x, 0.445, 0.377], {
      dir: [0, 0, 1],
      axis: "z",
      name: "coinDoorBolt",
    });
  }

  // Side art on both cheeks: stepped synthwave mountain and sun motif.
  for (const side of [-1, 1]) {
    const sideX = side * 0.411;
    box([0.008, 0.30, 0.24], BLACK, [sideX, 1.30, -0.01], { name: "sideArtBacking" });
    const sunSide = cyl(0.07, 0.012, ORANGE, [sideX, 1.38, 0.13], {
      dir: [side, 0, 0],
      axis: "z",
      name: "sideArtSun",
    });
    glow(sunSide, 1.4);

    box([0.012, 0.012, 0.28], CYAN, [sideX, 1.20, -0.03], {
      rotation: [0, 0, side * -22],
      name: "sideArtRay",
    });
    box([0.012, 0.012, 0.28], MAGENTA, [sideX, 1.20, -0.11], {
      rotation: [0, 0, side * 25],
      name: "sideArtRay",
    });
    box([0.012, 0.11, 0.025], ELECTRIC, [sideX, 1.17, -0.12], {
      rotation: [0, 0, side * -22],
      name: "sideArtMountain",
    });
    box([0.012, 0.19, 0.025], BLUE, [sideX, 1.22, -0.06], {
      rotation: [0, 0, side * 22],
      name: "sideArtMountain",
    });
    box([0.012, 0.27, 0.025], MAGENTA, [sideX, 1.28, 0.01], {
      rotation: [0, 0, side * 7],
      name: "sideArtMountain",
    });
    for (let i = 0; i < 4; i++) {
      box([0.012, 0.009, 0.20 - i * 0.035], CYAN, [sideX, 1.07 - i * 0.028, -0.16 + i * 0.008], {
        rotation: [0, 0, side * 0],
        name: "sideArtHorizon",
      });
    }
  }

  // Rear vent stack, visible around the cabinet silhouette.
  box([0.46, 0.30, 0.025], BLACK, [0, 1.38, -0.325], { name: "rearVentPanel" });
  for (let i = 0; i < 6; i++) {
    box([0.32, 0.012, 0.012], i % 2 ? MAGENTA : CYAN, [0, 1.27 + i * 0.045, -0.344], {
      name: "rearVent",
    });
  }

  // Four chunky leveling feet.
  for (const x of [-0.28, 0.28]) {
    for (const z of [-0.23, 0.23]) {
      cyl(0.055, 0.07, BLACK, [x, 0.015, z], { name: "levelingFoot" });
      cyl(0.040, 0.015, METAL, [x, 0.052, z], { name: "footPad" });
    }
  }

  // Floor-facing shadow slab, keeping the visual base crisp and intentional.
  box([0.92, 0.012, 0.78], "#05040b", [0, 0.002, 0], { name: "groundShadow" });

  return b.root;
}
```