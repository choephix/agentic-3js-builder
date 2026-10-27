```ts
import * as THREE from "three";
import {
  createBuilder,
  polyline,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with swept wings, elliptical tips, canopy, propeller, panel lines, markings, and landing gear.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#061c36";
  const DEEP = "#082d52";
  const BLUE = "#0b4670";
  const MID = "#12658d";
  const CYAN = "#35c9df";
  const PALE = "#a9f5f2";
  const WHITE = "#d8ffff";
  const ACCENT = "#64e8ef";

  const blueprintTexture = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="128" fill="#082d52"/>
      <g fill="none" stroke="#9af7f2" stroke-width="2" opacity=".9">
        <path d="M8 18H248M8 34H248M8 50H248M8 66H248M8 82H248M8 98H248M8 114H248"/>
        <path d="M16 8V120M40 8V120M64 8V120M88 8V120M112 8V120M136 8V120M160 8V120M184 8V120M208 8V120M232 8V120"/>
        <circle cx="128" cy="64" r="34"/>
        <circle cx="128" cy="64" r="27"/>
        <path d="M128 24V104M88 64H168"/>
      </g>
      <g fill="#d8ffff" font-family="monospace" font-size="11">
        <text x="12" y="15">MARK IX</text>
        <text x="184" y="15">R.A.F.</text>
        <text x="103" y="121">BLUEPRINT</text>
      </g>
    </svg>`,
    { size: 256, pixelated: true },
  );

  const round = (g: THREE.BufferGeometry, color: string, at: [number, number, number], name: string, dir?: [number, number, number]) =>
    b.part(g, color, { at, ...(dir ? { dir } : {}), name, flat: true });

  // Main fuselage: broad at the cockpit, tapering toward the tail.
  const fuselagePath = polyline([
    [0, 1.18, -2.15],
    [0, 1.22, -1.55],
    [0, 1.28, -0.65],
    [0, 1.34, 0.30],
    [0, 1.42, 0.78],
    [0, 1.48, 1.18],
    [0, 1.42, 1.58],
    [0, 1.26, 1.92],
    [0, 1.08, 2.25],
  ]);
  const fuselage = b.sweep(fuselagePath, (t) => {
    if (t < 0.16) return 0.26 + t * 0.45;
    if (t < 0.55) return 0.34;
    return 0.34 - (t - 0.55) * 0.47;
  }, {
    color: BLUE,
    sides: 8,
    caps: "round",
    name: "fuselage",
  });

  // Cyanotype dorsal spine and pale belly stripe.
  b.sweep(polyline([
    [0, 1.42, -1.62],
    [0, 1.58, -0.72],
    [0, 1.66, 0.18],
    [0, 1.69, 0.85],
    [0, 1.58, 1.45],
  ]), [0.045, 0.022], {
    color: CYAN,
    sides: 6,
    caps: "flat",
    name: "dorsalSpine",
  });
  b.sweep(polyline([
    [0, 0.96, -1.52],
    [0, 0.99, -0.55],
    [0, 1.03, 0.45],
    [0, 1.02, 1.18],
  ]), [0.09, 0.035], {
    color: DEEP,
    sides: 6,
    caps: "flat",
    name: "bellyKeel",
  });

  // Nose and spinner.
  round(new THREE.CylinderGeometry(0.24, 0.29, 0.27, 10), DEEP, [0, 1.2, 2.23], "noseCone", [0, 0, 1]);
  round(new THREE.ConeGeometry(0.19, 0.42, 10), CYAN, [0, 1.2, 2.55], "spinner", [0, 0, 1]);
  round(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 8), PALE, [0, 1.2, 2.68], "spinnerTip", [0, 0, 1]);

  // Wings: angular blocky silhouettes with elliptical-ish stepped tips.
  const wingOutline: [number, number][] = [
    [0.03, -0.52],
    [0.28, -0.50],
    [1.05, -0.38],
    [1.82, -0.22],
    [2.42, 0.02],
    [2.58, 0.16],
    [2.48, 0.31],
    [1.82, 0.38],
    [1.05, 0.42],
    [0.28, 0.34],
    [0.03, 0.28],
  ];

  for (const side of [-1, 1]) {
    const wing = b.extrude(wingOutline, {
      at: [side * 0.02, 1.25, 0.10],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.075, 0.045],
      bevel: 0.018,
      smoothing: 0,
      color: BLUE,
      name: side > 0 ? "wingL" : "wingR",
    });

    // Bright leading edge.
    b.sweep(polyline([
      [side * 0.18, 1.34, 0.38],
      [side * 0.82, 1.34, 0.34],
      [side * 1.48, 1.29, 0.27],
      [side * 2.18, 1.23, 0.18],
      [side * 2.48, 1.19, 0.11],
    ]), [0.035, 0.018], {
      color: CYAN,
      sides: 6,
      caps: "flat",
      name: side > 0 ? "leadingEdgeL" : "leadingEdgeR",
    });

    // Wing trailing flap and aileron strips.
    b.extrude([
      [0.12, -0.39],
      [1.00, -0.31],
      [1.92, -0.16],
      [2.32, 0.00],
      [1.92, 0.10],
      [1.00, 0.18],
      [0.12, 0.20],
    ], {
      at: [side * 0.06, 1.205, -0.19],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.035,
      color: MID,
      name: side > 0 ? "aileronL" : "aileronR",
    });

    // Three structural blueprint ribs per wing.
    for (const x of [0.56, 1.20, 1.82]) {
      b.rod(
        [side * x, 1.305, -0.31 + x * 0.045],
        [side * x, 1.305, 0.27 - x * 0.035],
        0.012,
        { color: PALE, caps: "flat", name: side > 0 ? "wingRibL" : "wingRibR" },
      );
    }

    // Cannon housings.
    for (const z of [0.12, 0.42]) {
      b.rod(
        [side * 1.20, 1.30, z],
        [side * 1.20, 1.30, z + 0.43],
        0.028,
        { color: INK, caps: "flat", name: side > 0 ? "cannonL" : "cannonR" },
      );
    }

    // Small cyan circular RAF roundel.
    round(new THREE.CylinderGeometry(0.13, 0.13, 0.018, 16), PALE, [side * 1.18, 1.31, -0.03], side > 0 ? "roundelL" : "roundelR", [0, 1, 0]);
    round(new THREE.CylinderGeometry(0.075, 0.075, 0.024, 16), MID, [side * 1.18, 1.325, -0.03], side > 0 ? "roundelCoreL" : "roundelCoreR", [0, 1, 0]);
  }

  // Cockpit bathtub and canopy.
  round(new THREE.SphereGeometry(0.31, 10, 6), DEEP, [0, 1.64, 0.05], "cockpitBath");
  const canopy = round(new THREE.SphereGeometry(0.29, 12, 8), MID, [0, 1.77, 0.18], "canopy");
  canopy.mesh.scale.set(0.78, 0.60, 1.45);
  round(new THREE.BoxGeometry(0.035, 0.40, 0.48), PALE, [0, 1.79, 0.18], "canopySpine");
  for (const side of [-1, 1]) {
    b.rod([side * 0.16, 1.75, -0.08], [side * 0.18, 1.70, 0.42], 0.016, {
      color: PALE,
      caps: "flat",
      name: side > 0 ? "canopyFrameL" : "canopyFrameR",
    });
  }
  round(new THREE.PlaneGeometry(0.30, 0.21), WHITE, [0, 1.79, 0.37], "canopyBlueprint", [0, 0, 1]);
  b.part(new THREE.PlaneGeometry(0.30, 0.21), WHITE, {
    at: [0, 1.79, 0.372],
    dir: [0, 0, 1],
    axis: "z",
    texture: blueprintTexture,
    name: "canopyGrid",
  });

  // Tailplane and vertical fin.
  for (const side of [-1, 1]) {
    b.extrude([
      [0.02, -0.28],
      [0.58, -0.22],
      [0.92, -0.04],
      [0.82, 0.10],
      [0.32, 0.15],
      [0.02, 0.12],
    ], {
      at: [side * 0.03, 1.36, -1.58],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.055,
      bevel: 0.012,
      color: BLUE,
      name: side > 0 ? "tailplaneL" : "tailplaneR",
    });
    b.sweep(polyline([
      [side * 0.08, 1.42, -1.80],
      [side * 0.48, 1.43, -1.71],
      [side * 0.84, 1.43, -1.57],
    ]), [0.025, 0.014], { color: CYAN, sides: 6, caps: "flat", name: "tailEdge" });
  }

  b.extrude([
    [0, -0.32],
    [0.18, -0.22],
    [0.28, 0.08],
    [0.22, 0.54],
    [0.12, 0.78],
    [0.02, 0.87],
    [-0.08, 0.65],
    [-0.16, 0.18],
    [-0.13, -0.20],
  ], {
    at: [0, 1.40, -1.72],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.012,
    color: BLUE,
    name: "verticalTail",
  });
  b.sweep(polyline([
    [0, 1.42, -1.83],
    [0, 1.57, -1.62],
    [0, 1.91, -1.35],
  ]), [0.025, 0.012], { color: CYAN, sides: 6, caps: "flat", name: "tailRidge" });

  // Propeller hub and four broad blades in a neutral cross.
  round(new THREE.CylinderGeometry(0.13, 0.13, 0.20, 10), PALE, [0, 1.2, 2.77], "propHub", [0, 0, 1]);
  for (const side of [-1, 1]) {
    b.sweep(polyline([
      [side * 0.08, 1.20, 2.78],
      [side * 0.34, 1.20, 2.80],
      [side * 0.72, 1.20, 2.85],
    ]), [0.075, 0.018], {
      color: MID,
      sides: 5,
      caps: "round",
      name: side > 0 ? "propBladeL" : "propBladeR",
    });
    b.sweep(polyline([
      [0, 1.20 + side * 0.08, 2.78],
      [0, 1.20 + side * 0.34, 2.80],
      [0, 1.20 + side * 0.72, 2.85],
    ]), [0.075, 0.018], {
      color: MID,
      sides: 5,
      caps: "round",
      name: side > 0 ? "propBladeUp" : "propBladeDown",
    });
  }

  // Exhaust stacks on both sides.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const z = 1.18 + i * 0.11;
      round(new THREE.CylinderGeometry(0.027, 0.035, 0.18, 6), INK, [side * 0.30, 1.28, z], side > 0 ? "exhaustL" : "exhaustR", [side, 0, 0]);
    }
  }

  // Main landing gear and wheels. Lowest point is y = 0.055.
  for (const side of [-1, 1]) {
    b.rod([side * 0.48, 1.16, 0.18], [side * 0.70, 0.42, 0.05], 0.045, {
      color: PALE,
      caps: "flat",
      name: side > 0 ? "gearStrutL" : "gearStrutR",
    });
    round(new THREE.CylinderGeometry(0.16, 0.16, 0.09, 10), INK, [side * 0.70, 0.18, 0.05], side > 0 ? "wheelL" : "wheelR", [1, 0, 0]);
    round(new THREE.CylinderGeometry(0.065, 0.065, 0.098, 10), PALE, [side * 0.70, 0.18, 0.05], side > 0 ? "hubL" : "hubR", [1, 0, 0]);
  }
  b.rod([0, 1.01, -1.72], [0, 0.22, -1.78], 0.035, { color: PALE, caps: "flat", name: "tailWheelStrut" });
  round(new THREE.CylinderGeometry(0.09, 0.09, 0.065, 9), INK, [0, 0.10, -1.80], "tailWheel", [1, 0, 0]);

  // Blueprint measurement arrows and small identification bars.
  b.rod([-2.62, 1.08, 0.08], [2.62, 1.08, 0.08], 0.006, { color: PALE, caps: "flat", name: "spanDatum" });
  b.rod([-2.62, 1.08, 0.08], [-2.48, 1.08, 0.18], 0.006, { color: PALE, caps: "flat", name: "datumArrowL" });
  b.rod([2.62, 1.08, 0.08], [2.48, 1.08, 0.18], 0.006, { color: PALE, caps: "flat", name: "datumArrowR" });

  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      round(new THREE.SphereGeometry(0.025, 6, 4), ACCENT, [side * (0.48 + i * 0.10), 1.48, -0.78], "panelRivet");
    }
  }

  return b.root;
}
```