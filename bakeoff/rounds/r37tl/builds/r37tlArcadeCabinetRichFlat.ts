import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description: "A chunky 1980s upright arcade cabinet with synthwave neon trim, CRT screen, marquee, joystick, buttons, coin door, and glowing side art.",
};

export default function build() {
  const b = createBuilder({ name: "neonVectorArcade", detail: 1 });

  const BLACK = "#090817";
  const BODY = "#17132d";
  const BODY2 = "#24183f";
  const EDGE = "#3b2368";
  const PINK = "#ff267f";
  const HOTPINK = "#ff4fa3";
  const CYAN = "#19e6ff";
  const BLUE = "#246bff";
  const PURPLE = "#8c32ff";
  const YELLOW = "#ffe05b";
  const ORANGE = "#ff7a28";
  const WHITE = "#fff5ff";
  const METAL = "#69718e";
  const DARKMETAL = "#20243c";
  const SCREEN = "#060b20";
  const GREEN = "#39ffb0";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, ...options });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, 12, 1),
      color,
      { at, ...options },
    );

  const neonRod = (
    a: [number, number, number],
    z: [number, number, number],
    color: string,
    radius = 0.012,
  ) => glow(b.rod(a, z, radius, { color, caps: "round" }), 2.2);

  const cabinetBottom = 0.03;
  const frontZ = 0.38;
  const backZ = -0.27;

  // Heavy lower cabinet and upper CRT housing.
  box([0.72, 0.82, 0.62], BODY, [0, 0.44, -0.02], {
    name: "lowerCabinet",
  });
  box([0.72, 0.74, 0.48], BODY2, [0, 1.16, -0.03], {
    name: "monitorHousing",
  });

  // Slightly projecting side cheeks establish the classic sloped silhouette.
  box([0.055, 1.43, 0.68], EDGE, [0.39, 0.75, -0.01], {
    name: "sideCheekL",
  });
  box([0.055, 1.43, 0.68], EDGE, [-0.39, 0.75, -0.01], {
    name: "sideCheekR",
  });

  // Front lower fascia.
  box([0.63, 0.24, 0.045], BLACK, [0, 0.18, 0.31], {
    name: "lowerFrontFascia",
  });
  box([0.58, 0.035, 0.02], PURPLE, [0, 0.30, 0.345], {
    name: "fuchsiaFascia",
  });

  // Control deck, angled-looking through layered slabs.
  box([0.68, 0.07, 0.36], BLACK, [0, 0.78, 0.27], {
    name: "controlDeck",
  });
  box([0.62, 0.028, 0.30], BODY2, [0, 0.825, 0.30], {
    name: "controlDeckInset",
  });

  // CRT bezel and screen.
  box([0.57, 0.48, 0.075], BLACK, [0, 1.22, 0.27], {
    name: "crtBezel",
  });
  box([0.505, 0.37, 0.018], DARKMETAL, [0, 1.225, 0.318], {
    name: "screenFrame",
  });

  const screenTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 360">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#07134a"/>
          <stop offset="0.56" stop-color="#160c45"/>
          <stop offset="1" stop-color="#05051d"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#ffe45b"/>
          <stop offset="1" stop-color="#ff3c91"/>
        </linearGradient>
      </defs>
      <rect width="512" height="360" fill="url(#bg)"/>
      <circle cx="390" cy="145" r="65" fill="url(#sun)"/>
      <path d="M0 215 L512 215 L512 360 L0 360Z" fill="#09072f"/>
      <g stroke="#ff258d" stroke-width="3" opacity=".8">
        <path d="M256 215 L256 360 M205 215 L155 360 M307 215 L357 360 M150 215 L35 360 M362 215 L477 360"/>
        <path d="M0 240H512 M0 269H512 M0 303H512 M0 342H512"/>
      </g>
      <path d="M70 245 L118 191 L164 235 L210 165 L255 226 L302 176 L353 235 L409 190 L449 245"
        fill="none" stroke="#28eaff" stroke-width="8"/>
      <text x="256" y="88" text-anchor="middle" font-family="sans-serif" font-size="39"
        font-weight="bold" fill="#fff4ff" stroke="#ff258d" stroke-width="3">VECTOR</text>
      <text x="256" y="122" text-anchor="middle" font-family="sans-serif" font-size="18"
        letter-spacing="5" fill="#2cf4ff">DREAMS</text>
      <text x="256" y="330" text-anchor="middle" font-family="monospace" font-size="13"
        fill="#ffe45b">INSERT COIN</text>
    </svg>`,
    { size: 512 },
  );

  const screen = b.part(
    new THREE.PlaneGeometry(0.49, 0.35),
    WHITE,
    {
      at: [0, 1.225, 0.333],
      dir: [0, 0, 1],
      axis: "z",
      texture: screenTexture,
      name: "crtGlass",
    },
  );
  glow(screen, 0.8);

  // CRT glass highlight and scanline strips.
  box([0.43, 0.008, 0.006], "#7c8cff", [0, 1.37, 0.345], {
    name: "screenReflection",
  });
  for (let i = 0; i < 7; i++) {
    box([0.44, 0.003, 0.004], "#16245a", [0, 1.105 + i * 0.035, 0.347], {
      name: `scanline${i}`,
    });
  }

  // Marquee canopy and glowing title.
  box([0.72, 0.24, 0.17], BLACK, [0, 1.67, 0.14], {
    name: "marqueeHousing",
  });
  box([0.62, 0.16, 0.018], PURPLE, [0, 1.67, 0.235], {
    name: "marqueeFace",
  });

  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 160">
      <defs>
        <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#ff2c9c"/><stop offset=".48" stop-color="#ffec62"/><stop offset="1" stop-color="#27e9ff"/>
        </linearGradient>
      </defs>
      <rect width="640" height="160" fill="#120b2d"/>
      <text x="320" y="105" text-anchor="middle" font-family="sans-serif"
        font-size="72" font-weight="900" font-style="italic" fill="url(#m)"
        stroke="#fff4ff" stroke-width="3">NEON//80</text>
    </svg>`,
    { size: 512 },
  );
  const marquee = b.part(
    new THREE.PlaneGeometry(0.59, 0.145),
    WHITE,
    {
      at: [0, 1.67, 0.251],
      dir: [0, 0, 1],
      axis: "z",
      texture: marqueeTexture,
      name: "marqueeArt",
    },
  );
  glow(marquee, 1.4);

  // Neon perimeter, split into segments for a strong synthwave outline.
  neonRod([-0.37, 0.08, 0.335], [-0.37, 0.70, 0.335], CYAN, 0.014);
  neonRod([-0.37, 0.70, 0.335], [-0.37, 1.50, 0.335], PINK, 0.014);
  neonRod([-0.37, 1.50, 0.335], [-0.29, 1.77, 0.335], CYAN, 0.014);
  neonRod([0.37, 0.08, 0.335], [0.37, 0.70, 0.335], PINK, 0.014);
  neonRod([0.37, 0.70, 0.335], [0.37, 1.50, 0.335], CYAN, 0.014);
  neonRod([0.37, 1.50, 0.335], [0.29, 1.77, 0.335], PINK, 0.014);
  neonRod([-0.37, 0.075, 0.335], [0.37, 0.075, 0.335], PURPLE, 0.012);

  // Side-facing lightning decals as layered geometric fins.
  const lightning: [number, number][] = [
    [-0.17, 0.18],
    [0.02, 0.18],
    [-0.08, 0.43],
    [0.20, 0.43],
    [-0.02, 0.77],
    [-0.17, 0.50],
    [-0.30, 0.50],
  ];
  for (const s of [-1, 1]) {
    const side = b.extrude(lightning, {
      at: [s * 0.423, 0.32, -0.05],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: s > 0 ? PINK : CYAN,
      name: s > 0 ? "sideLightningL" : "sideLightningR",
    });
    glow(side, 1.1);
  }

  // Control panel front trim.
  neonRod([-0.31, 0.845, 0.46], [0.31, 0.845, 0.46], CYAN, 0.009);
  neonRod([-0.31, 0.80, 0.12], [0.31, 0.80, 0.12], PINK, 0.008);

  // Joystick stalk and ball.
  cyl(0.025, 0.13, METAL, [-0.16, 0.91, 0.29], {
    name: "joystickStem",
  });
  const stickBall = cyl(0.062, 0.065, PINK, [-0.16, 0.99, 0.29], {
    name: "joystickBall",
  });
  glow(stickBall, 1.3);
  cyl(0.055, 0.018, DARKMETAL, [-0.16, 0.855, 0.29], {
    name: "joystickBase",
  });

  // Four candy-colored action buttons, each with a dark socket and highlight.
  const buttons: [number, string][] = [
    [-0.015, PINK],
    [0.075, YELLOW],
    [0.165, CYAN],
    [0.255, ORANGE],
  ];
  for (const [x, color] of buttons) {
    cyl(0.034, 0.018, BLACK, [x, 0.856, 0.29], {
      name: "buttonSocket",
    });
    const button = cyl(0.026, 0.028, color, [x, 0.878, 0.29], {
      name: "actionButton",
    });
    glow(button, 1.5);
    cyl(0.012, 0.004, WHITE, [x - 0.008, 0.895, 0.282], {
      name: "buttonHighlight",
    });
  }

  // Small start/select buttons.
  for (const x of [-0.04, 0.04]) {
    const start = cyl(0.016, 0.015, x < 0 ? CYAN : PINK, [x, 0.858, 0.16], {
      name: "smallButton",
    });
    glow(start, 1.2);
  }

  // Coin door assembly.
  box([0.24, 0.30, 0.025], DARKMETAL, [0, 0.43, 0.322], {
    name: "coinDoor",
  });
  box([0.19, 0.235, 0.012], BLACK, [0, 0.45, 0.34], {
    name: "coinDoorInset",
  });
  box([0.10, 0.014, 0.035], METAL, [0, 0.57, 0.354], {
    name: "coinReturn",
  });
  box([0.055, 0.085, 0.012], PURPLE, [0, 0.43, 0.355], {
    name: "coinSlotPanel",
  });
  box([0.025, 0.004, 0.05], YELLOW, [0, 0.43, 0.365], {
    name: "coinSlot",
  });
  const coinGlow = cyl(0.018, 0.008, CYAN, [-0.075, 0.43, 0.365], {
    name: "coinLampL",
  });
  glow(coinGlow, 1.7);
  const coinGlow2 = cyl(0.018, 0.008, PINK, [0.075, 0.43, 0.365], {
    name: "coinLampR",
  });
  glow(coinGlow2, 1.7);

  // Speaker grille with alternating neon slots.
  box([0.29, 0.12, 0.02], BLACK, [0, 0.68, 0.35], {
    name: "speakerGrille",
  });
  for (let i = -4; i <= 4; i++) {
    const slot = box([0.012, 0.075, 0.008], i % 2 ? PINK : CYAN, [i * 0.027, 0.68, 0.365], {
      name: "speakerSlot",
    });
    glow(slot, 0.8);
  }

  // Bolts and corner caps.
  for (const x of [-0.32, 0.32]) {
    for (const y of [0.11, 0.73, 1.52]) {
      cyl(0.012, 0.012, YELLOW, [x, y, 0.35], {
        name: "caseBolt",
      });
    }
  }

  // Tiny power indicator and rear vent hint.
  const power = cyl(0.012, 0.01, GREEN, [0.27, 0.22, 0.355], {
    name: "powerLamp",
  });
  glow(power, 1.6);

  for (let i = -3; i <= 3; i++) {
    box([0.025, 0.11, 0.012], BLACK, [i * 0.055, 1.47, -0.285], {
      name: "rearVent",
    });
  }

  return b.root;
}
