```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description:
    "A chunky 1980s upright arcade cabinet in synthwave colors, with glowing marquee, CRT screen, control deck, joystick, buttons, coin door, side neon trim, vents, feet, and retro vector artwork.",
};

export default function build() {
  const b = createBuilder({ name: "synthwaveArcade", detail: 1 });

  const PURPLE = "#241343";
  const DEEP = "#100b25";
  const BLACK = "#080713";
  const EDGE = "#35145d";
  const MAGENTA = "#ff238f";
  const PINK = "#ff68c7";
  const CYAN = "#16e6ff";
  const BLUE = "#3478ff";
  const VIOLET = "#793dff";
  const ORANGE = "#ff853d";
  const YELLOW = "#ffe36e";
  const WHITE = "#fff5ff";
  const METAL = "#8c789d";
  const DARKMETAL = "#322a4a";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    opts: any = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, ...opts });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    opts: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, opts.segments ?? 12), color, {
      at,
      ...opts,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    opts: any = {},
  ) => b.part(new THREE.SphereGeometry(radius, 10, 6), color, { at, ...opts });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    opts: any = {},
  ) => b.rod(a, c, radius, { color, ...opts });

  const frontZ = 0.355;

  // Main stepped cabinet silhouette.
  box([0.72, 0.18, 0.62], DEEP, [0, 0.10, 0]);
  box([0.68, 0.72, 0.54], PURPLE, [0, 0.53, -0.015]);
  box([0.68, 0.64, 0.48], PURPLE, [0, 1.14, -0.01]);
  box([0.70, 0.20, 0.54], EDGE, [0, 1.56, -0.015]);
  box([0.76, 0.12, 0.58], BLACK, [0, 1.69, -0.01]);

  // Broad side cheek plates, giving the cabinet its unmistakable arcade profile.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.53, 0],
        [0.53, 0.56],
        [0.45, 0.72],
        [0.16, 0.84],
        [0, 0.84],
      ],
      {
        at: [s * 0.355, 0.28, -0.25],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.025,
        color: EDGE,
        bevel: 0.008,
        name: `sidePlate${s}`,
      },
    );

    // Magenta and cyan side lightning graphics.
    rod(
      [s * 0.37, 0.39, -0.265],
      [s * 0.37, 0.95, -0.265],
      0.009,
      MAGENTA,
    );
    rod(
      [s * 0.37, 0.95, -0.265],
      [s * 0.37, 1.38, -0.265],
      0.009,
      CYAN,
    );
    rod(
      [s * 0.37, 0.39, -0.285],
      [s * 0.37, 0.74, -0.285],
      0.006,
      CYAN,
    );
    rod(
      [s * 0.37, 0.74, -0.285],
      [s * 0.37, 1.33, -0.285],
      0.006,
      MAGENTA,
    );

    // Decorative side bolts.
    for (const y of [0.35, 0.64, 1.05, 1.42]) {
      cyl(0.018, 0.012, METAL, [s * 0.382, y, -0.16], {
        dir: [s, 0, 0],
        segments: 8,
      });
    }
  }

  // Bottom plinth and little adjustable feet.
  box([0.78, 0.10, 0.64], BLACK, [0, 0.205, 0]);
  box([0.80, 0.035, 0.66], MAGENTA, [0, 0.258, 0.01]);
  for (const s of [-1, 1]) {
    cyl(0.055, 0.06, DARKMETAL, [s * 0.27, 0.04, -0.19], {
      segments: 8,
    });
    cyl(0.055, 0.06, DARKMETAL, [s * 0.27, 0.04, 0.20], {
      segments: 8,
    });
  }

  // CRT screen bezel and inset glass.
  box([0.57, 0.53, 0.055], BLACK, [0, 1.23, frontZ], {
    rotation: [-7, 0, 0],
  });
  box([0.51, 0.43, 0.018], VIOLET, [0, 1.235, frontZ + 0.034], {
    rotation: [-7, 0, 0],
  });

  const screenTexture = svg(
    `<svg viewBox="0 0 256 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="180" fill="#080713"/>
      <path d="M0 142 Q65 110 126 142 T256 138" fill="none" stroke="#ff238f" stroke-width="4"/>
      <path d="M0 151 Q65 119 126 151 T256 147" fill="none" stroke="#793dff" stroke-width="3"/>
      <path d="M0 158 L256 158 M0 169 L256 169" stroke="#3478ff" stroke-width="2"/>
      <circle cx="128" cy="76" r="38" fill="none" stroke="#16e6ff" stroke-width="5"/>
      <path d="M128 38 L128 114 M90 76 L166 76" stroke="#ff68c7" stroke-width="3"/>
      <path d="M28 118 L62 65 L92 112 L126 48 L164 111 L205 57 L235 118" fill="none" stroke="#ffe36e" stroke-width="4"/>
      <text x="128" y="28" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#fff5ff">NEON RAID</text>
    </svg>`,
    { size: 256 },
  );
  const screen = b.part(new THREE.PlaneGeometry(0.47, 0.39), WHITE, {
    at: [0, 1.235, frontZ + 0.052],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [-7, 0, 0],
    texture: screenTexture,
    name: "CRTScreen",
  });
  glow(screen, 1.7);

  // CRT glass highlight and scanline bars.
  box([0.43, 0.008, 0.008], CYAN, [0, 1.35, frontZ + 0.065], {
    rotation: [-7, 0, 0],
  });
  box([0.36, 0.006, 0.006], PINK, [0, 1.12, frontZ + 0.066], {
    rotation: [-7, 0, 0],
  });

  // Screen corner screws.
  for (const x of [-0.285, 0.285]) {
    for (const y of [1.00, 1.46]) {
      cyl(0.013, 0.012, METAL, [x, y, frontZ + 0.044], {
        dir: [0, 0, 1],
        segments: 8,
      });
    }
  }

  // Control deck, angled toward the player.
  box([0.73, 0.12, 0.33], BLACK, [0, 0.78, 0.285], {
    rotation: [-11, 0, 0],
  });
  box([0.67, 0.025, 0.29], VIOLET, [0, 0.842, 0.292], {
    rotation: [-11, 0, 0],
  });

  // Front lip neon strips.
  rod([-0.32, 0.75, 0.435], [0.32, 0.75, 0.435], 0.012, MAGENTA);
  rod([-0.30, 0.785, 0.448], [0.30, 0.785, 0.448], 0.006, CYAN);

  // Joystick shaft and ball.
  cyl(0.022, 0.17, METAL, [-0.17, 0.90, 0.36], {
    dir: [0, 1, 0],
    segments: 10,
  });
  sphere(0.065, MAGENTA, [-0.17, 1.00, 0.36]);
  sphere(0.045, PINK, [-0.17, 1.015, 0.397]);
  cyl(0.052, 0.018, BLACK, [-0.17, 0.835, 0.36], {
    segments: 12,
  });

  // Six luminous arcade buttons.
  const buttons: Array<[number, string]> = [
    [-0.045, CYAN],
    [0.035, MAGENTA],
    [0.115, YELLOW],
    [0.195, ORANGE],
  ];
  for (const [dx, col] of buttons) {
    cyl(0.034, 0.019, BLACK, [dx, 0.86, 0.385], {
      dir: [0, 1, 0],
      segments: 12,
      rotation: [-11, 0, 0],
    });
    const p = cyl(0.026, 0.023, col, [dx, 0.88, 0.39], {
      dir: [0, 1, 0],
      segments: 12,
      rotation: [-11, 0, 0],
    });
    glow(p, 1.25);
  }
  for (const dx of [-0.29, -0.22]) {
    const p = cyl(0.026, 0.018, dx < -0.25 ? CYAN : MAGENTA, [dx, 0.86, 0.35], {
      dir: [0, 1, 0],
      segments: 12,
      rotation: [-11, 0, 0],
    });
    glow(p, 1.1);
  }

  // Small printed control labels.
  box([0.11, 0.018, 0.032], WHITE, [-0.17, 0.858, 0.454], {
    rotation: [-11, 0, 0],
  });
  box([0.13, 0.014, 0.026], CYAN, [0.14, 0.858, 0.454], {
    rotation: [-11, 0, 0],
  });

  // Marquee housing.
  box([0.72, 0.19, 0.10], BLACK, [0, 1.70, 0.30]);
  box([0.66, 0.14, 0.016], MAGENTA, [0, 1.70, 0.36]);

  const marqueeTexture = svg(
    `<svg viewBox="0 0 500 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#ff238f"/><stop offset=".5" stop-color="#793dff"/><stop offset="1" stop-color="#16e6ff"/></linearGradient></defs>
      <rect width="500" height="100" fill="#100b25"/>
      <text x="250" y="72" text-anchor="middle" font-family="sans-serif" font-style="italic" font-weight="900" font-size="62" fill="url(#g)" stroke="#fff5ff" stroke-width="2">STAR//BYTE</text>
      <path d="M20 84 H480" stroke="#ffe36e" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );
  const marquee = b.part(new THREE.PlaneGeometry(0.62, 0.125), WHITE, {
    at: [0, 1.70, 0.365],
    dir: [0, 0, 1],
    axis: "z",
    texture: marqueeTexture,
    name: "GlowingMarquee",
  });
  glow(marquee, 2);

  // Marquee top and side neon piping.
  rod([-0.36, 1.81, 0.285], [0.36, 1.81, 0.285], 0.012, CYAN);
  rod([-0.36, 1.60, 0.285], [-0.36, 1.81, 0.285], 0.010, MAGENTA);
  rod([0.36, 1.60, 0.285], [0.36, 1.81, 0.285], 0.010, MAGENTA);

  // Coin door on the lower front.
  box([0.29, 0.30, 0.025], DARKMETAL, [0, 0.47, frontZ + 0.015]);
  box([0.25, 0.26, 0.012], BLACK, [0, 0.47, frontZ + 0.033]);
  box([0.19, 0.025, 0.006], MAGENTA, [0, 0.57, frontZ + 0.042]);
  box([0.15, 0.012, 0.006], CYAN, [0, 0.39, frontZ + 0.042]);

  // Coin slot, return slot, and coin lamp.
  box([0.045, 0.13, 0.012], BLACK, [-0.065, 0.48, frontZ + 0.046]);
  box([0.014, 0.075, 0.008], METAL, [-0.065, 0.48, frontZ + 0.054]);
  box([0.09, 0.014, 0.010], METAL, [0.075, 0.53, frontZ + 0.046]);
  const coinLamp = sphere(0.019, ORANGE, [0.075, 0.43, frontZ + 0.052]);
  glow(coinLamp, 1.8);

  // Lower front decorative bars and vent grille.
  for (let i = 0; i < 7; i++) {
    box([0.018, 0.16, 0.012], i % 2 ? CYAN : MAGENTA, [-0.23 + i * 0.077, 0.29, frontZ + 0.035], {
      rotation: [0, 0, -18],
    });
  }
  for (let i = 0; i < 8; i++) {
    box([0.018, 0.10, 0.012], DARKMETAL, [-0.14 + i * 0.04, 0.665, frontZ + 0.03], {
      rotation: [0, 0, 12],
    });
  }

  // Speaker perforations under the screen.
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const x = -0.18 + col * 0.045 + (row % 2) * 0.012;
      const y = 0.98 + row * 0.035;
      cyl(0.008, 0.006, BLACK, [x, y, frontZ + 0.022], {
        dir: [0, 0, 1],
        segments: 8,
      });
    }
  }

  // Side-facing illuminated logo badges.
  for (const s of [-1, 1]) {
    const badge = b.part(new THREE.CircleGeometry(0.10, 8), MAGENTA, {
      at: [s * 0.39, 1.17, -0.08],
      dir: [s, 0, 0],
      axis: "z",
      name: `sideLogo${s}`,
    });
    glow(badge, 1.2);
    cyl(0.065, 0.012, CYAN, [s * 0.402, 1.17, -0.08], {
      dir: [s, 0, 0],
      segments: 8,
    });
    sphere(0.018, YELLOW, [s * 0.411, 1.17, -0.08]);
  }

  // Aerial-style top vents and rear ridge details.
  for (let i = 0; i < 5; i++) {
    box([0.08, 0.018, 0.14], DARKMETAL, [-0.24 + i * 0.12, 1.82, -0.08], {
      rotation: [0, 0, 0],
    });
  }
  rod([-0.31, 1.86, -0.24], [0.31, 1.86, -0.24], 0.008, BLUE);
  rod([-0.30, 0.31, -0.29], [0.30, 0.31, -0.29], 0.008, VIOLET);

  return b.root;
}
```