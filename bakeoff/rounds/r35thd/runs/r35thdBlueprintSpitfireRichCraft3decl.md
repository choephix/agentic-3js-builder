```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  paint,
  polyline,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Cyanotype Spitfire",
  description:
    "A stylized low-poly Spitfire fighter plane rendered as a richly detailed cyanotype blueprint, with panel lines, rivets, canopy framing, propeller, landing gear, wing roundels and blueprint annotations.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1, paintSize: 2048 });
  const random = rng(1940);

  const NAVY = "#031a2c";
  const DEEP = "#052b45";
  const BLUE = "#075477";
  const BLUE2 = "#0b7092";
  const CYAN = "#55dce6";
  const PALE = "#b7f8f3";
  const WHITE = "#e3ffff";
  const INK = "#021321";
  const GLASS = "#176d8b";
  const GLASS_LIGHT = "#62dbe5";
  const RUBBER = "#06131d";
  const HUB = "#8ceef0";
  const RED = "#d46b7d";

  const AIRFRAME = paint((_p, n, _s) => {
    if (n.y > 0.42) return BLUE2;
    if (n.y < -0.42) return DEEP;
    return BLUE;
  });

  const AIRFRAME_LIGHT = paint((_p, n, _s) => {
    if (n.y > 0.3) return "#1984a0";
    if (n.y < -0.5) return "#042238";
    return "#0c6284";
  });

  const GLASS_PAINT = paint((_p, n, _s) => {
    if (n.y > 0.45) return GLASS_LIGHT;
    if (n.z > 0.35) return "#2a91a8";
    return GLASS;
  });

  const TYRE = paint((_p, n, _s) => (n.y > 0.2 ? "#102c3a" : RUBBER));

  const ROUND_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="116" fill="#031a2c" stroke="#b7f8f3" stroke-width="8"/>
      <circle cx="128" cy="128" r="83" fill="#b7f8f3"/>
      <circle cx="128" cy="128" r="57" fill="#0b7092"/>
      <path d="M128 68 L142 113 L190 113 L151 141 L166 188 L128 159 L90 188 L105 141 L66 113 L114 113 Z" fill="#e3ffff"/>
      <circle cx="128" cy="128" r="116" fill="none" stroke="#55dce6" stroke-width="3" stroke-dasharray="7 9"/>
    </svg>`,
    { size: 512 },
  );

  const SERIAL_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 100">
      <rect width="420" height="100" rx="9" fill="#031a2c" stroke="#b7f8f3" stroke-width="5"/>
      <path d="M20 76 H400 M20 22 H400" stroke="#55dce6" stroke-width="2" stroke-dasharray="8 7"/>
      <text x="210" y="61" text-anchor="middle" font-family="monospace" font-size="36" font-weight="bold" fill="#e3ffff">MK IX // EN-742</text>
    </svg>`,
    { size: 512 },
  );

  const BLUEPRINT_LABEL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150">
      <rect x="3" y="3" width="494" height="144" fill="#031a2c" stroke="#55dce6" stroke-width="6"/>
      <path d="M25 38 H475 M25 112 H475" stroke="#0b7092" stroke-width="3"/>
      <text x="250" y="77" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="bold" letter-spacing="5" fill="#e3ffff">SPITFIRE</text>
      <text x="250" y="102" text-anchor="middle" font-family="monospace" font-size="15" letter-spacing="3" fill="#55dce6">FIGHTER AIRCRAFT / 1944</text>
    </svg>`,
    { size: 512 },
  );

  const CANOPY_MARK = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
      <path d="M20 140 Q48 30 90 18 Q132 30 160 140" fill="none" stroke="#b7f8f3" stroke-width="7"/>
      <path d="M42 135 Q62 57 90 42 Q118 57 138 135" fill="none" stroke="#55dce6" stroke-width="4"/>
      <path d="M90 28 V140 M32 120 H148" stroke="#e3ffff" stroke-width="3" opacity=".8"/>
      <path d="M28 139 L58 91 M152 139 L122 91" stroke="#55dce6" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const PANEL_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
      <rect width="320" height="180" fill="#031a2c"/>
      <g stroke="#55dce6" fill="none" stroke-width="3">
        <circle cx="70" cy="88" r="48"/><circle cx="70" cy="88" r="32"/>
        <circle cx="175" cy="88" r="53"/><circle cx="175" cy="88" r="35"/>
        <circle cx="262" cy="88" r="39"/><circle cx="262" cy="88" r="24"/>
        <path d="M70 88 L90 58 M175 88 L161 49 M262 88 L283 61"/>
        <path d="M20 22 H300 M20 158 H300"/>
      </g>
      <g fill="#b7f8f3" font-family="monospace" font-size="13">
        <text x="45" y="145">RPM</text><text x="150" y="145">ALT</text><text x="247" y="145">OIL</text>
      </g>
    </svg>`,
    { size: 512 },
  );

  const prop = (a: THREE.Vector3, c: THREE.Vector3) =>
    c.clone().sub(a).normalize();

  function rod(
    a: THREE.Vector3 | readonly number[],
    c: THREE.Vector3 | readonly number[],
    radius: number,
    color: string | ReturnType<typeof paint> = CYAN,
    name?: string,
  ) {
    return b.rod(a, c, radius, color, {
      caps: "round",
      section: { ngon: 6 },
      name,
    });
  }

  function capsule(
    a: THREE.Vector3 | readonly number[],
    c: THREE.Vector3 | readonly number[],
    radius: number,
    color: string | ReturnType<typeof paint>,
    name?: string,
  ) {
    return b.capsule(a, c, radius, color, {
      name,
      section: { ngon: 8 },
    });
  }

  function ball(
    at: THREE.Vector3 | readonly number[],
    radius: number,
    color: string | ReturnType<typeof paint>,
    name?: string,
  ) {
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      flat: true,
      name,
    });
  }

  function orientedBox(
    size: readonly [number, number, number],
    at: THREE.Vector3 | readonly number[],
    color: string | ReturnType<typeof paint>,
    dir?: THREE.Vector3 | readonly number[],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      dir,
      flat: true,
      name,
    });
  }

  function ellipseRing(
    z: number,
    y: number,
    rx: number,
    ry: number,
    segments = 16,
  ) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * rx, y + Math.sin(a) * ry, z));
    }
    return polyline(points, { closed: true });
  }

  // ---------------------------------------------------------------------------
  // Fuselage: a long, slightly flattened, faceted blueprint body.

  const fuselagePath = catmull([
    [0, 1.76, 4.52],
    [0, 1.76, 4.12],
    [0, 1.75, 3.25],
    [0, 1.74, 2.05],
    [0, 1.77, 0.45],
    [0, 1.82, -1.25],
    [0, 1.88, -2.75],
    [0, 1.94, -3.78],
    [0, 2.0, -4.52],
  ]);

  const fuselage = b.sweep(
    fuselagePath,
    (t) => {
      if (t < 0.08) return [0.14 + t * 2.1, 0.15 + t * 2.1];
      if (t < 0.22) return [0.30 + (t - 0.08) * 1.65, 0.34 + (t - 0.08) * 1.85];
      if (t < 0.58) return [0.57 + Math.sin(t * 8) * 0.035, 0.66 + Math.sin(t * 7) * 0.045];
      if (t < 0.8) return [0.52 - (t - 0.58) * 0.8, 0.60 - (t - 0.58) * 0.8];
      return [0.34 - (t - 0.8) * 1.25, 0.40 - (t - 0.8) * 1.35];
    },
    {
      color: AIRFRAME,
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "fuselage",
    },
  );

  // Blueprint contour rings around the fuselage.
  const contourStations = [
    [4.04, 1.76, 0.30, 0.34],
    [3.48, 1.75, 0.48, 0.54],
    [2.55, 1.74, 0.61, 0.70],
    [1.35, 1.75, 0.61, 0.70],
    [0.1, 1.77, 0.60, 0.68],
    [-1.3, 1.82, 0.53, 0.61],
    [-2.7, 1.88, 0.44, 0.52],
    [-3.75, 1.95, 0.32, 0.39],
  ] as const;

  for (let i = 0; i < contourStations.length; i++) {
    const [z, y, rx, ry] = contourStations[i];
    b.sweep(ellipseRing(z, y, rx * 1.012, ry * 1.012), 0.014, {
      color: i % 2 ? CYAN : PALE,
      caps: "none",
      sides: 5,
      name: `fuselageFrame${i}`,
    });
  }

  // Longitudinal panel seams.
  const bodySeamZ = [-3.6, -2.6, -1.5, -0.35, 0.9, 2.1, 3.15];
  for (const side of [-1, 1]) {
    for (let row = 0; row < 3; row++) {
      const x = side * (0.28 + row * 0.17);
      const pts = bodySeamZ.map((z, i) =>
        new THREE.Vector3(
          x,
          1.76 + 0.26 * Math.sin((i / (bodySeamZ.length - 1)) * Math.PI),
          z,
        ),
      );
      b.sweep(catmull(pts), 0.011, {
        color: row === 1 ? PALE : CYAN,
        caps: "round",
        sides: 5,
        name: `longitudinalSeam${side > 0 ? "L" : "R"}${row}`,
      });
    }
  }

  // Tail cone and rear service ring.
  rod([0, 1.98, -3.7], [0, 2.0, -4.48], 0.018, PALE, "tailSpine");
  for (const z of [-4.05, -4.3, -4.48]) {
    b.sweep(ellipseRing(z, 1.98, z === -4.48 ? 0.1 : 0.25, z === -4.48 ? 0.12 : 0.28), 0.017, {
      color: CYAN,
      caps: "none",
      name: `tailRing${z}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Main wing panels.

  const wingOutline: [number, number, "sharp"][] = [
    [0.86, 0, "sharp"],
    [0.64, 2.25, "sharp"],
    [0.43, 4.65, "sharp"],
    [0.16, 5.48, "sharp"],
    [-0.17, 5.62, "sharp"],
    [-0.42, 5.42, "sharp"],
    [-0.82, 3.8, "sharp"],
    [-1.0, 1.05, "sharp"],
    [-1.02, 0, "sharp"],
  ];

  const wingParts: ReturnType<typeof b.extrude>[] = [];
  for (const side of [-1, 1]) {
    const wing = b.extrude(wingOutline, {
      at: [0, 1.42, 0.32],
      x: [0, 0, 1],
      y: [side, 0, 0],
      thickness: [0.16, 0.22],
      bevel: 0.025,
      smoothing: 1,
      color: AIRFRAME_LIGHT,
      name: `mainWing${side > 0 ? "L" : "R"}`,
    });
    wingParts.push(wing);

    // Leading and trailing edge blueprint lines.
    rod(
      [side * 0.12, 1.58, 1.10],
      [side * 5.42, 1.57, 0.48],
      0.026,
      PALE,
      `wingLeadingEdge${side}`,
    );
    rod(
      [side * 0.15, 1.55, -0.72],
      [side * 5.35, 1.54, -0.17],
      0.021,
      CYAN,
      `wingTrailingEdge${side}`,
    );

    // Wing structural ribs.
    const ribs = [0.7, 1.3, 2.0, 2.8, 3.6, 4.35, 5.05];
    for (let i = 0; i < ribs.length; i++) {
      const x = side * ribs[i];
      const frontZ = 0.95 - ribs[i] * 0.095;
      const backZ = -0.76 + ribs[i] * 0.11;
      rod(
        [x, 1.575, frontZ],
        [x, 1.575, backZ],
        i % 2 ? 0.012 : 0.017,
        i % 2 ? CYAN : PALE,
        `wingRib${side}${i}`,
      );
    }

    // Aileron seam and flap hinge.
    rod(
      [side * 2.8, 1.595, -0.43],
      [side * 5.3, 1.585, -0.15],
      0.019,
      PALE,
      `aileronHinge${side}`,
    );
    rod(
      [side * 0.5, 1.6, -0.73],
      [side * 2.7, 1.59, -0.48],
      0.016,
      CYAN,
      `flapHinge${side}`,
    );

    // Outer wingtip marker lights.
    ball([side * 5.43, 1.59, 0.22], 0.075, side > 0 ? "#9cf5ed" : "#db849a", `navLight${side}`);
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.018, 8), WHITE, {
      at: [side * 5.43, 1.59, 0.22],
      dir: [0, 1, 0],
      name: `navLightCap${side}`,
    });

    // Wing root fillet strips.
    rod(
      [side * 0.18, 1.61, 1.0],
      [side * 0.18, 1.61, -0.87],
      0.033,
      CYAN,
      `wingRoot${side}`,
    );

    // Two cannon barrels beneath each wing.
    for (const [j, x] of [side * 2.45, side * 3.55].entries()) {
      const y = 1.12 + j * 0.015;
      rod([x, y, 0.15], [x, y, 0.72], 0.043, INK, `cannon${side}${j}`);
      b.part(new THREE.CylinderGeometry(0.073, 0.073, 0.035, 10), PALE, {
        at: [x, y, 0.72],
        dir: [0, 0, 1],
        name: `cannonPort${side}${j}`,
      });
      ball([x, y, 0.745], 0.026, INK, `cannonBore${side}${j}`);
    }

    // Small machine-gun ports farther outboard.
    for (const x of [side * 4.25, side * 4.72]) {
      rod([x, 1.2, 0.02], [x, 1.2, 0.42], 0.022, INK, `machineGun${side}${x}`);
      ball([x, 1.2, 0.43], 0.034, PALE, `machineGunPort${side}${x}`);
    }

    // Rivet rows.
    for (let i = 0; i < 12; i++) {
      const x = side * (0.42 + i * 0.42);
      const frontZ = 0.78 - i * 0.06;
      const backZ = -0.7 + i * 0.075;
      ball([x, 1.585, frontZ], 0.018, PALE, `frontRivet${side}${i}`);
      ball([x, 1.585, backZ], 0.016, CYAN, `backRivet${side}${i}`);
    }
  }

  // Roundel decals on top of both wings.
  for (const side of [-1, 1]) {
    b.decal(wingParts[side > 0 ? 1 : 0], ROUND_TEXTURE, {
      at: [side * 3.2, 1.58, 0.15],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [1.14, 1.14],
      lift: 0.012,
      segments: 8,
      mirror: side > 0,
      name: `wingRoundel${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Tailplanes.

  const tailplaneOutline: [number, number, "sharp"][] = [
    [0.48, 0, "sharp"],
    [0.28, 1.85, "sharp"],
    [0.02, 2.22, "sharp"],
    [-0.34, 2.05, "sharp"],
    [-0.56, 0.14, "sharp"],
    [-0.52, 0, "sharp"],
  ];

  for (const side of [-1, 1]) {
    b.extrude(tailplaneOutline, {
      at: [0, 1.94, -3.34],
      x: [0, 0, 1],
      y: [side, 0, 0],
      thickness: [0.1, 0.14],
      bevel: 0.015,
      smoothing: 1,
      color: AIRFRAME_LIGHT,
      name: `tailplane${side}`,
    });

    rod(
      [side * 0.12, 2.08, -2.86],
      [side * 2.08, 2.07, -3.05],
      0.018,
      PALE,
      `tailplaneFront${side}`,
    );
    rod(
      [side * 0.15, 2.08, -3.76],
      [side * 2.0, 2.07, -3.66],
      0.015,
      CYAN,
      `tailplaneRear${side}`,
    );
    rod(
      [side * 1.15, 2.09, -3.02],
      [side * 1.15, 2.09, -3.67],
      0.012,
      CYAN,
      `tailplaneRib${side}`,
    );
  }

  // Vertical fin and rudder.
  const fin = b.extrude(
    [
      [0.0, 0, "sharp"],
      [0.22, 0.07, "sharp"],
      [0.68, 0.7, "sharp"],
      [0.96, 1.48, "sharp"],
      [0.91, 2.02, "sharp"],
      [0.7, 2.42, "sharp"],
      [0.42, 2.56, "sharp"],
      [0.2, 2.4, "sharp"],
      [0.05, 1.75, "sharp"],
      [-0.04, 0.18, "sharp"],
    ],
    {
      at: [0, 1.78, -4.27],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.13, 0.17],
      bevel: 0.018,
      smoothing: 1,
      color: AIRFRAME,
      name: "verticalFin",
    },
  );

  b.extrude(
    [
      [0.02, 0, "sharp"],
      [0.24, 0.12, "sharp"],
      [0.65, 0.62, "sharp"],
      [0.77, 1.48, "sharp"],
      [0.57, 2.25, "sharp"],
      [0.22, 2.43, "sharp"],
      [0.1, 1.4, "sharp"],
      [-0.01, 0.1, "sharp"],
    ],
    {
      at: [0.085, 1.82, -4.25],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.006,
      color: BLUE2,
      name: "rudder",
    },
  );

  rod([0.08, 1.93, -4.2], [0.08, 4.02, -3.38], 0.018, PALE, "finLeadingEdge");
  rod([0.08, 1.9, -4.24], [0.08, 3.0, -3.18], 0.014, CYAN, "rudderHinge");
  rod([-0.08, 1.92, -4.2], [-0.08, 3.98, -3.38], 0.012, CYAN, "finFarEdge");

  // ---------------------------------------------------------------------------
  // Engine cowling, spinner and propeller.

  for (const z of [3.62, 3.87, 4.12]) {
    const r = z === 3.62 ? 0.53 : z === 3.87 ? 0.43 : 0.29;
    b.sweep(ellipseRing(z, 1.76, r, r * 0.98), 0.022, {
      color: PALE,
      caps: "none",
      sides: 6,
      name: `cowlingRing${z}`,
    });
  }

  for (const side of [-1, 1]) {
    rod([side * 0.08, 1.76, 3.45], [side * 0.5, 1.76, 4.15], 0.017, CYAN, `cowlingSeam${side}`);
    rod([side * 0.18, 1.45, 3.52], [side * 0.33, 1.45, 4.08], 0.016, PALE, `cowlingLowerSeam${side}`);
  }

  b.part(new THREE.CylinderGeometry(0.27, 0.31, 0.44, 10), AIRFRAME_LIGHT, {
    at: [0, 1.76, 4.27],
    dir: [0, 0, 1],
    flat: true,
    name: "propellerHub",
  });

  b.spike([0, 1.76, 4.42], [0, 0, 1], 0.62, 0.32, {
    color: BLUE2,
    caps: { start: "flat", end: "point" },
    sides: 8,
    name: "spinner",
  });

  // Four broad prop blades in a cyanotype blueprint silhouette.
  const bladeOutline: [number, number, "sharp"][] = [
    [0.12, -0.105, "sharp"],
    [0.42, -0.16, "sharp"],
    [1.35, -0.14, "sharp"],
    [1.68, -0.035, "sharp"],
    [1.58, 0.10, "sharp"],
    [1.02, 0.17, "sharp"],
    [0.35, 0.13, "sharp"],
    [0.12, 0.08, "sharp"],
  ];

  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.18;
    const radial = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const tangent = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    b.extrude(bladeOutline, {
      at: [0, 1.76, 4.43],
      x: radial,
      y: tangent,
      thickness: 0.095,
      bevel: 0.012,
      smoothing: 1,
      color: i % 2 ? BLUE2 : AIRFRAME_LIGHT,
      name: `propellerBlade${i}`,
    });
    rod(
      radial.clone().multiplyScalar(0.25).add(new THREE.Vector3(0, 1.76, 4.5)),
      radial.clone().multiplyScalar(1.52).add(new THREE.Vector3(0, 1.76, 4.5)),
      0.014,
      PALE,
      `propellerBladeLine${i}`,
    );
  }

  ball([0, 1.76, 4.68], 0.075, PALE, "spinnerNose");
  b.decal(fuselage, BLUEPRINT_LABEL, {
    at: [0.0, 2.38, 2.72],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.82, 0.25],
    lift: 0.012,
    segments: 8,
    name: "noseBlueprintLabel",
  });

  // ---------------------------------------------------------------------------
  // Cockpit and canopy.

  orientedBox([0.64, 0.25, 0.72], [0, 2.05, -1.28], INK, undefined, "cockpitInterior");
  orientedBox([0.46, 0.62, 0.22], [0, 2.27, -1.53], NAVY, undefined, "seatBack");
  orientedBox([0.34, 0.06, 0.52], [0, 2.03, -1.02], PALE, undefined, "instrumentShelf");

  const canopyPath = catmull([
    [0, 1.9, -0.55],
    [0, 2.28, -0.73],
    [0, 2.48, -1.08],
    [0, 2.43, -1.43],
    [0, 2.16, -1.77],
  ]);

  const canopy = b.sweep(
    canopyPath,
    (t) => [0.47 - t * 0.18, 0.27 - t * 0.07],
    {
      color: GLASS_PAINT,
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "round" },
      name: "canopy",
    },
  );

  const canopyRail = [
    [[-0.42, 2.22, -0.72], [-0.37, 2.45, -1.14], [-0.27, 2.3, -1.65]],
    [[0.42, 2.22, -0.72], [0.37, 2.45, -1.14], [0.27, 2.3, -1.65]],
    [[-0.04, 2.48, -0.78], [-0.04, 2.5, -1.55]],
    [[0.04, 2.48, -0.78], [0.04, 2.5, -1.55]],
  ] as const;

  for (const [i, rail] of canopyRail.entries()) {
    b.sweep(catmull(rail), 0.024, {
      color: PALE,
      sides: 6,
      caps: "round",
      name: `canopyRail${i}`,
    });
  }

  rod([-0.4, 2.18, -0.68], [0.4, 2.18, -0.68], 0.028, PALE, "canopyFrontRail");
  rod([-0.28, 2.27, -1.68], [0.28, 2.27, -1.68], 0.022, CYAN, "canopyRearRail");

  b.decal(canopy, CANOPY_MARK, {
    at: [0, 2.49, -1.1],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.32, 0.32],
    lift: 0.006,
    segments: 6,
    name: "canopyBlueprintMark",
  });

  // Instrument panel visible through the windscreen.
  b.part(new THREE.PlaneGeometry(0.52, 0.28), WHITE, {
    at: [0, 2.14, -0.93],
    dir: [0, 0.45, 1],
    axis: "z",
    texture: PANEL_TEXTURE,
    name: "instrumentPanel",
  });

  // ---------------------------------------------------------------------------
  // Landing gear.

  for (const side of [-1, 1]) {
    const wheelX = side * 1.18;
    const wheelCenter = new THREE.Vector3(wheelX, 0.31, 0.23);
    const strutTop = new THREE.Vector3(side * 0.93, 1.23, 0.1);

    rod(strutTop, wheelCenter, 0.075, INK, `mainGearStrut${side}`);
    rod(
      new THREE.Vector3(side * 0.82, 1.22, 0.06),
      new THREE.Vector3(side * 1.1, 0.48, 0.23),
      0.034,
      PALE,
      `mainGearBrace${side}`,
    );

    b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.18, 12), TYRE, {
      at: wheelCenter,
      dir: [1, 0, 0],
      flat: true,
      name: `mainWheel${side}`,
    });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.195, 10), HUB, {
      at: wheelCenter,
      dir: [1, 0, 0],
      flat: true,
      name: `mainHub${side}`,
    });
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.21, 8), INK, {
      at: wheelCenter,
      dir: [1, 0, 0],
      name: `mainAxle${side}`,
    });

    for (let j = 0; j < 8; j++) {
      const a = (j / 8) * Math.PI * 2;
      const p = new THREE.Vector3(
        wheelX + side * 0.102,
        wheelCenter.y + Math.cos(a) * 0.105,
        wheelCenter.z + Math.sin(a) * 0.105,
      );
      rod(
        new THREE.Vector3(p.x - side * 0.015, p.y, p.z),
        new THREE.Vector3(p.x + side * 0.015, p.y, p.z),
        0.011,
        PALE,
        `hubSpoke${side}${j}`,
      );
    }
  }

  // Tailwheel assembly.
  const tailWheel = new THREE.Vector3(0, 0.2, -3.55);
  rod([0, 1.12, -3.42], tailWheel, 0.05, INK, "tailGearStrut");
  rod([-0.1, 0.48, -3.5], [0.1, 0.48, -3.5], 0.027, PALE, "tailGearBrace");
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 10), TYRE, {
    at: tailWheel,
    dir: [1, 0, 0],
    flat: true,
    name: "tailWheel",
  });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 8), HUB, {
    at: tailWheel,
    dir: [1, 0, 0],
    name: "tailWheelHub",
  });

  // ---------------------------------------------------------------------------
  // Blueprint rivets, access hatches and surface annotations.

  for (const side of [-1, 1]) {
    const x = side * 0.635;
    for (let i = 0; i < 18; i++) {
      const z = 2.85 - i * 0.32;
      const y = 1.77 + Math.sin(i * 0.8) * 0.06;
      ball([x + (random() - 0.5) * 0.009, y, z], 0.014, PALE, `fuselageRivet${side}${i}`);
    }

    for (let i = 0; i < 6; i++) {
      const z = 1.05 - i * 0.42;
      ball([side * 0.59, 1.48, z], 0.018, CYAN, `lowerRivet${side}${i}`);
    }

    // Rectangular access panels built as thin slabs with cyan borders.
    const panelZ = [-0.15, 0.62, 1.38];
    for (let i = 0; i < panelZ.length; i++) {
      const z = panelZ[i];
      rod([side * 0.66, 1.95, z - 0.24], [side * 0.66, 1.95, z + 0.24], 0.012, PALE, `panelV${side}${i}`);
      rod([side * 0.66, 1.95, z - 0.24], [side * 0.66, 1.95, z - 0.24], 0.012, PALE, `panelTiny${side}${i}`);
      rod([side * 0.66, 1.95, z + 0.24], [side * 0.66, 1.95, z + 0.24], 0.012, PALE, `panelTiny2${side}${i}`);
    }

    b.decal(fuselage, SERIAL_TEXTURE, {
      at: [side * 0.66, 1.93, 0.18],
      dir: [side, 0, 0],
      up: [0, 1, 0],
      size: [0.76, 0.18],
      lift: 0.009,
      segments: 8,
      mirror: side < 0,
      name: `sideSerial${side}`,
    });
  }

  // A small fin-flash graphic on the vertical tail.
  const finFlash = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 180">
      <path d="M8 10 H82 V56 H8Z" fill="#d46b7d"/>
      <path d="M8 56 H82 V103 H8Z" fill="#b7f8f3"/>
      <path d="M8 103 H82 V170 H8Z" fill="#0b7092"/>
      <path d="M8 10 H82 V170 H8Z" fill="none" stroke="#e3ffff" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  b.decal(fin, finFlash, {
    at: [0.072, 3.2, -3.6],
    dir: [1, 0, 0],
    up: [0, 1, 0],
    size: [0.16, 0.55],
    lift: 0.012,
    segments: 6,
    name: "tailFlash",
  });

  // Cyan blueprint dimension arrows and datum marks attached to the plane.
  rod([-5.0, 1.7, 0.96], [-5.0, 1.7, -0.72], 0.012, PALE, "leftWingDatum");
  rod([5.0, 1.7, 0.96], [5.0, 1.7, -0.72], 0.012, PALE, "rightWingDatum");
  rod([-5.0, 1.7, 0.96], [-4.82, 1.7, 0.82], 0.012, PALE, "leftDatumTickA");
  rod([-5.0, 1.7, -0.72], [-4.82, 1.7, -0.58], 0.012, PALE, "leftDatumTickB");
  rod([5.0, 1.7, 0.96], [4.82, 1.7, 0.82], 0.012, PALE, "rightDatumTickA");
  rod([5.0, 1.7, -0.72], [4.82, 1.7, -0.58], 0.012, PALE, "rightDatumTickB");

  // Small inspection lights and pitot tube.
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.018, 8), WHITE, {
    at: [0, 2.02, 4.17],
    dir: [0, 1, 0],
    name: "noseInspectionLight",
  });

  rod([0, 1.72, 4.62], [0, 1.72, 5.18], 0.022, PALE, "pitotTube");
  ball([0, 1.72, 5.2], 0.045, CYAN, "pitotTip");
  rod([-0.09, 1.72, 4.82], [0.09, 1.72, 4.82], 0.012, PALE, "pitotBrace");

  // Blueprint stencil panels near the tail.
  b.decal(fuselage, BLUEPRINT_LABEL, {
    at: [0.0, 1.43, -2.8],
    dir: [0, -1, 0],
    up: [0, 0, -1],
    size: [0.62, 0.18],
    lift: 0.01,
    segments: 8,
    mirror: true,
    name: "bellyStencil",
  });

  // A final set of pale-blue fasteners around the engine cowling.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const p = new THREE.Vector3(
      Math.cos(a) * 0.48,
      1.76 + Math.sin(a) * 0.47,
      3.91,
    );
    ball(p, 0.024, PALE, `cowlingFastener${i}`);
  }

  // Keep the blueprint aesthetic crisp and faceted.
  b.root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return b.root;
}
```