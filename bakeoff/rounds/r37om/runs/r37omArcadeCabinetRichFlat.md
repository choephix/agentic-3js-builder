```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Vector 1984",
  description:
    "A stylized 1980s synthwave arcade cabinet with a violet wedge silhouette, glowing CRT marquee, neon trim, joystick, buttons, coin door, vents, rivets, and chunky low-poly construction.",
};

export default function build() {
  const b = createBuilder({ name: "neon-vector-1984", detail: 1 });

  const BLACK = "#090817";
  const DEEP = "#120d26";
  const PANEL = "#21133d";
  const PURPLE = "#6d2fb5";
  const VIOLET = "#a63fff";
  const MAGENTA = "#ff2bbd";
  const PINK = "#ff73dc";
  const CYAN = "#24e7ff";
  const BLUE = "#386bff";
  const ORANGE = "#ff9b35";
  const YELLOW = "#ffe45a";
  const CREAM = "#fff1cf";
  const STEEL = "#65708c";
  const DARK_STEEL = "#252b49";
  const RED = "#ff315e";

  const rand = rng(1984);

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      ...options,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 10,
    options: Record<string, unknown> = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      { at, name, ...options },
    );

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      name,
      ...options,
    });

  const trim = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { color, name, caps: "round" });

  // A deliberately tall, chunky base gives the cabinet a strong arcade silhouette.
  box([0.76, 0.78, 0.58], [0, 0.48, 0], DEEP, "lowerCabinet");
  box([0.72, 0.76, 0.54], [0, 1.14, 0.015], BLACK, "upperCabinet");

  // Feet and bottom shadow rail.
  for (const s of [-1, 1]) {
    box([0.18, 0.08, 0.32], [s * 0.25, 0.04, -0.035], BLACK, `foot${s}`);
    box([0.04, 0.12, 0.36], [s * 0.31, 0.08, 0.035], PURPLE, `footAccent${s}`);
  }
  box([0.78, 0.055, 0.06], [0, 0.105, 0.3], MAGENTA, "bottomGlowRail");
  box([0.78, 0.025, 0.025], [0, 0.145, 0.31], CYAN, "bottomGlowHighlight");

  // Thick side panels define the classic sloped cabinet profile.
  const sideOutline: [number, number][] = [
    [-0.29, 0.12],
    [0.29, 0.12],
    [0.29, 0.98],
    [0.235, 1.26],
    [0.19, 1.68],
    [-0.205, 1.68],
    [-0.27, 1.5],
    [-0.29, 0.98],
  ];

  for (const s of [-1, 1]) {
    const side = b.extrude(sideOutline, {
      at: [s * 0.385, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: PANEL,
      name: `sidePanel${s}`,
    });

    // Side panel inset color blocks and angular synthwave graphics.
    b.extrude(
      [
        [-0.245, 0.22],
        [0.245, 0.22],
        [0.245, 0.9],
        [-0.245, 1.25],
      ],
      {
        at: [s * 0.407, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.008,
        color: DEEP,
        name: `sideInset${s}`,
      },
    );

    b.extrude(
      [
        [-0.23, 0.28],
        [0.18, 0.36],
        [-0.1, 1.12],
        [-0.22, 1.2],
      ],
      {
        at: [s * 0.414, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.006,
        color: PURPLE,
        name: `sidePurpleSlash${s}`,
      },
    );

    b.extrude(
      [
        [-0.205, 0.34],
        [0.15, 0.42],
        [-0.07, 0.53],
        [-0.22, 0.48],
      ],
      {
        at: [s * 0.419, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.006,
        color: MAGENTA,
        name: `sidePinkSlash${s}`,
      },
    );

    // Outer illuminated side rails.
    trim(
      [s * 0.418, 0.15, -0.295],
      [s * 0.418, 0.99, -0.295],
      0.009,
      CYAN,
      `rearSideRail${s}`,
    );
    trim(
      [s * 0.418, 1.0, -0.295],
      [s * 0.418, 1.66, -0.19],
      0.009,
      MAGENTA,
      `upperSideRail${s}`,
    );
    trim(
      [s * 0.418, 1.66, -0.19],
      [s * 0.418, 1.66, 0.19],
      0.009,
      CYAN,
      `topSideRail${s}`,
    );

    // Four little panel fasteners on each side.
    for (const [y, z] of [
      [0.24, -0.24],
      [0.24, 0.23],
      [1.48, -0.19],
      [1.58, 0.18],
    ] as [number, number][]) {
      cyl(0.014, 0.012, [s * 0.428, y, z], STEEL, `sideRivet${s}`, 8, {
        dir: [1, 0, 0],
      });
    }
  }

  // Front lower fascia, with a luminous horizontal stripe.
  box([0.68, 0.3, 0.045], [0, 0.38, 0.302], BLACK, "frontLowerFascia");
  box([0.64, 0.045, 0.012], [0, 0.525, 0.33], PURPLE, "lowerFasciaBand");
  box([0.58, 0.018, 0.012], [0, 0.552, 0.335], CYAN, "lowerFasciaNeon");

  // Coin door assembly.
  box([0.27, 0.28, 0.018], [0, 0.53, 0.335], DARK_STEEL, "coinDoor");
  box([0.235, 0.235, 0.008], [0, 0.53, 0.35], BLACK, "coinDoorInset");
  box([0.16, 0.025, 0.012], [0, 0.62, 0.36], PURPLE, "coinDoorTop");
  box([0.12, 0.1, 0.012], [0, 0.49, 0.36], DEEP, "coinReturn");
  box([0.075, 0.018, 0.014], [0, 0.49, 0.37], MAGENTA, "coinReturnGlow");

  for (const s of [-1, 1]) {
    cyl(0.022, 0.014, [s * 0.075, 0.57, 0.365], STEEL, `coinSlot${s}`, 10, {
      dir: [0, 0, 1],
    });
    cyl(0.008, 0.017, [s * 0.075, 0.57, 0.376], YELLOW, `coinSlotLight${s}`, 8, {
      dir: [0, 0, 1],
    });
  }

  // Upper front screen surround, deliberately oversized like an actual CRT cabinet.
  box([0.64, 0.58, 0.07], [0, 1.29, 0.295], BLACK, "screenHousing");
  box([0.57, 0.48, 0.025], [0, 1.3, 0.34], PURPLE, "screenBezel");
  box([0.52, 0.425, 0.018], [0, 1.3, 0.36], BLACK, "screenInnerBezel");

  const crtTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 384">
      <defs>
        <linearGradient id="bg" x2="0" y2="1">
          <stop stop-color="#121a5c"/>
          <stop offset=".52" stop-color="#27117e"/>
          <stop offset="1" stop-color="#100629"/>
        </linearGradient>
        <linearGradient id="sun" x2="0" y2="1">
          <stop stop-color="#ffdf58"/>
          <stop offset=".35" stop-color="#ff6c57"/>
          <stop offset="1" stop-color="#d516aa"/>
        </linearGradient>
      </defs>
      <rect width="512" height="384" fill="url(#bg)"/>
      <circle cx="384" cy="108" r="58" fill="#ff4fc9" opacity=".7"/>
      <path d="M0 260 Q128 214 256 255 T512 245 V384 H0Z" fill="#130725"/>
      <path d="M0 265 Q128 220 256 260 T512 250" fill="none" stroke="#ff3ac8" stroke-width="5"/>
      <path d="M0 302 H512 M0 332 H512 M0 362 H512" stroke="#2deaff" stroke-width="3" opacity=".8"/>
      <path d="M45 384 L255 267 L467 384" fill="url(#sun)" opacity=".85"/>
      <path d="M0 290 L512 290 M0 318 L512 318 M0 347 L512 347" stroke="#27177e" stroke-width="3"/>
      <text x="256" y="104" text-anchor="middle" font-family="monospace" font-size="42" font-weight="bold" fill="#fff6cf">VECTOR</text>
      <text x="256" y="146" text-anchor="middle" font-family="monospace" font-size="24" fill="#2deaff">DREAMS</text>
      <path d="M90 190 H422" stroke="#ff72df" stroke-width="3"/>
      <text x="256" y="225" text-anchor="middle" font-family="monospace" font-size="19" fill="#ffe45a">INSERT COIN</text>
      <g opacity=".18" stroke="#8fffff" stroke-width="2">
        <path d="M0 20H512M0 42H512M0 64H512M0 86H512M0 108H512M0 130H512M0 152H512M0 174H512M0 196H512M0 218H512M0 240H512M0 262H512M0 284H512M0 306H512M0 328H512M0 350H512M0 372H512"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const screen = b.part(new THREE.PlaneGeometry(0.505, 0.415), "#ffffff", {
    at: [0, 1.3, 0.374],
    dir: [0, 0, 1],
    axis: "z",
    texture: crtTexture,
    name: "crtScreen",
  });
  glow(screen, 1.35);

  // CRT glass reflection bars.
  box([0.45, 0.018, 0.008], [0, 1.47, 0.389], "#8cfbff", "crtReflectionTop");
  box([0.28, 0.012, 0.008], [0.11, 1.42, 0.39], "#ffffff", "crtReflectionGlint");

  // Screen bezel bolts.
  for (const x of [-0.285, 0.285]) {
    for (const y of [1.08, 1.52]) {
      cyl(0.014, 0.014, [x, y, 0.39], STEEL, `bezelBolt${x}${y}`, 8, {
        dir: [0, 0, 1],
      });
      cyl(0.006, 0.018, [x, y, 0.4], CYAN, `bezelBoltGlow${x}${y}`, 8, {
        dir: [0, 0, 1],
      });
    }
  }

  // Control deck projects forward and slopes slightly through stacked chunky layers.
  box([0.73, 0.11, 0.28], [0, 0.91, 0.37], BLACK, "controlDeckBase");
  box([0.69, 0.07, 0.24], [0, 0.985, 0.405], PANEL, "controlDeckTop");
  box([0.65, 0.018, 0.19], [0, 1.028, 0.43], DEEP, "controlDeckInset");
  trim([-0.34, 1.01, 0.53], [0.34, 1.01, 0.53], 0.009, MAGENTA, "deckFrontNeon");
  trim([-0.34, 1.01, 0.285], [-0.34, 1.01, 0.53], 0.007, CYAN, "deckLeftNeon");
  trim([0.34, 1.01, 0.285], [0.34, 1.01, 0.53], 0.007, CYAN, "deckRightNeon");

  // Joystick stalk, collar, and glowing ball.
  cyl(0.018, 0.13, [-0.19, 1.12, 0.41], STEEL, "joystickStem", 8);
  cyl(0.045, 0.016, [-0.19, 1.052, 0.41], MAGENTA, "joystickCollar", 10);
  const stickBall = sphere(0.052, [-0.19, 1.205, 0.41], RED, "joystickBall");
  glow(stickBall, 1.3);

  // Two banks of arcade buttons, with different neon colors.
  const buttons: [number, string, string][] = [
    [-0.06, CYAN, "cyan"],
    [0.035, MAGENTA, "magenta"],
    [0.13, YELLOW, "yellow"],
    [0.225, CYAN, "cyan2"],
  ];
  for (const [x, color, label] of buttons) {
    cyl(0.035, 0.018, [x, 1.078, 0.435], BLACK, `buttonSocket${label}`, 10);
    const button = cyl(0.027, 0.025, [x, 1.096, 0.438], color, `button${label}`, 10);
    glow(button, 1.15);
  }
  for (const [x, color, label] of [
    [-0.275, MAGENTA, "leftAux"],
    [0.275, CYAN, "rightAux"],
  ] as [number, string, string][]) {
    const button = cyl(0.028, 0.022, [x, 1.075, 0.405], color, label, 10);
    glow(button, 1.1);
  }

  // Marquee crown.
  box([0.72, 0.19, 0.12], [0, 1.66, 0.01], BLACK, "marqueeHousing");
  box([0.64, 0.135, 0.025], [0, 1.66, 0.078], PURPLE, "marqueeFrame");
  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 128">
      <defs><linearGradient id="m" x2="1"><stop stop-color="#ff2bbd"/><stop offset=".5" stop-color="#6d2fff"/><stop offset="1" stop-color="#24e7ff"/></linearGradient></defs>
      <rect width="640" height="128" rx="10" fill="#090817"/>
      <rect x="5" y="5" width="630" height="118" rx="8" fill="none" stroke="url(#m)" stroke-width="8"/>
      <text x="320" y="82" text-anchor="middle" font-family="sans-serif" font-style="italic" font-weight="900" font-size="64" fill="#fff1cf" stroke="#ff2bbd" stroke-width="3" paint-order="stroke">NEON VECTOR</text>
    </svg>`,
    { size: 512 },
  );
  const marquee = b.part(new THREE.PlaneGeometry(0.61, 0.122), "#ffffff", {
    at: [0, 1.66, 0.146],
    dir: [0, 0, 1],
    axis: "z",
    texture: marqueeTexture,
    name: "glowingMarquee",
  });
  glow(marquee, 1.45);

  // Marquee frame lights.
  for (const x of [-0.29, -0.145, 0, 0.145, 0.29]) {
    const lamp = sphere(0.012, [x, 1.735, 0.153], x === 0 ? YELLOW : CYAN, `marqueeLamp${x}`);
    glow(lamp, 1.4);
  }

  // Top cap and rear crown highlight.
  box([0.72, 0.04, 0.48], [0, 1.755, -0.015], BLACK, "topCap");
  trim([-0.34, 1.78, -0.24], [0.34, 1.78, -0.24], 0.008, PURPLE, "topRearTrim");
  trim([-0.34, 1.78, 0.24], [0.34, 1.78, 0.24], 0.008, CYAN, "topFrontTrim");

  // Rear ventilation grill, visible around the cabinet sides.
  box([0.42, 0.18, 0.018], [0, 0.91, -0.305], BLACK, "rearVentPanel");
  for (let i = -4; i <= 4; i++) {
    trim(
      [i * 0.04, 0.86, -0.32],
      [i * 0.04 + 0.035, 0.96, -0.32],
      0.006,
      i % 2 === 0 ? PURPLE : BLUE,
      `ventSlat${i}`,
    );
  }

  // A stylized control-panel label and tiny status lights.
  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 64">
      <rect width="256" height="64" rx="8" fill="#120d26"/>
      <text x="128" y="43" text-anchor="middle" font-family="monospace" font-size="31" font-weight="bold" fill="#24e7ff">PLAYER ONE</text>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.22, 0.055), "#ffffff", {
    at: [0.185, 1.076, 0.445],
    dir: [0, 0, 1],
    axis: "z",
    texture: labelTexture,
    name: "playerOneLabel",
  });

  for (const x of [-0.31, -0.285, 0.285, 0.31]) {
    const lamp = sphere(0.009, [x, 1.075, 0.447], x < 0 ? MAGENTA : CYAN, `deckStatus${x}`);
    glow(lamp, 1.2);
  }

  // A few exposed mechanical seams make the object feel manufactured rather than a plain box.
  trim([-0.35, 0.16, 0.31], [-0.35, 0.77, 0.31], 0.006, PURPLE, "leftFrontSeam");
  trim([0.35, 0.16, 0.31], [0.35, 0.77, 0.31], 0.006, PURPLE, "rightFrontSeam");
  trim([-0.35, 0.78, 0.31], [0.35, 0.78, 0.31], 0.006, CYAN, "faciaTopSeam");

  // Tiny warning decals built as colored geometry, not text floating in space.
  box([0.11, 0.055, 0.006], [-0.26, 0.7, 0.342], RED, "warningPlate");
  box([0.075, 0.014, 0.008], [-0.26, 0.714, 0.347], YELLOW, "warningMark");
  box([0.075, 0.014, 0.008], [-0.26, 0.687, 0.347], CREAM, "warningText");

  // Colored corner studs complete the puppet-like low-poly construction.
  for (const s of [-1, 1]) {
    for (const y of [0.18, 0.76, 1.02, 1.57]) {
      const stud = sphere(0.012, [s * 0.366, y, 0.325], y > 0.9 ? CYAN : MAGENTA, `frontStud${s}${y}`);
      glow(stud, 0.9);
    }
  }

  // Deterministic little color variation in the underside buttons.
  for (let i = 0; i < 5; i++) {
    const x = -0.2 + rand() * 0.4;
    const c = i % 2 ? BLUE : PURPLE;
    box([0.018, 0.006, 0.018], [x, 0.19, 0.333], c, `lowerMicroVent${i}`);
  }

  return b.root;
}
```