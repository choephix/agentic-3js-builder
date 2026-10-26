import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description:
    "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with swept elliptical wings, cockpit canopy, three-bladed propeller, landing gear, panel lines, rivets, RAF roundels, and blueprint annotations.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#08263d";
  const DEEP = "#0b3550";
  const BLUE = "#155473";
  const MID = "#247997";
  const CYAN = "#70efff";
  const PALE = "#c1fbff";
  const GLOW = "#8fffff";
  const SHADOW = "#061b2b";
  const RUBBER = "#071521";
  const RED = "#d85b6c";

  const roundel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="59" fill="#081e32" stroke="#b8ffff" stroke-width="4"/>
      <circle cx="64" cy="64" r="45" fill="#4ed9ec"/>
      <circle cx="64" cy="64" r="29" fill="#092a45"/>
      <path d="M64 38 L70 57 L90 57 L74 69 L80 88 L64 76 L48 88 L54 69 L38 57 L58 57 Z"
        fill="#c7ffff" opacity=".9"/>
    </svg>`,
    { size: 256 },
  );

  const serial = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 72">
      <rect width="320" height="72" rx="8" fill="#08263d" stroke="#8fffff" stroke-width="4"/>
      <text x="160" y="48" text-anchor="middle" font-family="monospace"
        font-size="38" font-weight="bold" letter-spacing="5" fill="#bfffff">BP-39</text>
    </svg>`,
    { size: 256 },
  );

  const blueprintLabel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120">
      <rect x="3" y="3" width="414" height="114" fill="#08263d" stroke="#8fffff" stroke-width="5"/>
      <text x="210" y="45" text-anchor="middle" font-family="monospace" font-size="25"
        font-weight="bold" fill="#bfffff">SUPERMARINE</text>
      <text x="210" y="78" text-anchor="middle" font-family="monospace" font-size="23"
        fill="#70efff">SPITFIRE Mk IX</text>
      <text x="210" y="103" text-anchor="middle" font-family="monospace" font-size="13"
        fill="#70efff">BLUEPRINT / FLIGHT READY</text>
    </svg>`,
    { size: 420 },
  );

  const canopyGlass = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#c9ffff" stop-opacity=".78"/>
          <stop offset=".42" stop-color="#3ac4df" stop-opacity=".35"/>
          <stop offset="1" stop-color="#062943" stop-opacity=".9"/>
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="64" rx="56" ry="48" fill="url(#g)" stroke="#bfffff" stroke-width="5"/>
      <path d="M18 63 Q64 30 110 62" fill="none" stroke="#d5ffff" stroke-width="4"/>
      <path d="M64 18 Q58 53 64 108" fill="none" stroke="#70efff" stroke-width="3"/>
      <path d="M28 31 Q43 16 62 14" fill="none" stroke="#ffffff" stroke-width="5" opacity=".75"/>
    </svg>`,
    { size: 256 },
  );

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color = BLUE,
    rotation?: [number, number, number],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });
  }

  function cylinder(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
    name?: string,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
      flat: true,
    });
  }

  function rod(
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color = CYAN,
    name?: string,
  ) {
    return b.rod(a, c, radius, { color, caps: "flat", name });
  }

  function rivet(at: [number, number, number], radius = 0.028, color = PALE) {
    return b.part(new THREE.SphereGeometry(radius, 6, 4), color, {
      at,
      name: "rivet",
      flat: true,
    });
  }

  // Main fuselage: a broad elliptical fighter body tapering into a pointed tail.
  const fuselage = b.loft(
    [
      { at: [0, 1.38, -3.25], w: 0.16, h: 0.18 },
      { at: [0, 1.38, -2.75], w: 0.48, h: 0.48 },
      { at: [0, 1.42, -1.55], w: 0.78, h: 0.86 },
      { at: [0, 1.48, -0.15], w: 0.98, h: 1.02 },
      { at: [0, 1.52, 1.10], w: 0.92, h: 0.96 },
      { at: [0, 1.52, 2.25], w: 0.70, h: 0.72 },
      { at: [0, 1.52, 2.92], w: 0.39, h: 0.42 },
      { at: [0, 1.52, 3.32], w: 0.08, h: 0.10 },
    ],
    { color: DEEP, section: { ngon: 8 }, detail: 1 },
  );

  // Belly keel and prominent dorsal spine.
  b.sweep(
    catmull([
      [0, 1.05, -2.35],
      [0, 1.08, -1.2],
      [0, 1.13, 0.5],
      [0, 1.20, 2.25],
    ]),
    [0.16, 0.09],
    { color: SHADOW, section: "box", caps: "flat" },
  );
  b.sweep(
    catmull([
      [0, 1.91, -1.65],
      [0, 1.94, -0.55],
      [0, 1.92, 0.55],
      [0, 1.80, 1.50],
    ]),
    [0.055, 0.025],
    { color: CYAN, section: { ngon: 6 }, caps: "point" },
  );

  // Nose cone, spinner, and engine intake ring.
  b.spike([0, 1.53, 2.92], [0, 0, 1], 0.62, 0.38, {
    color: BLUE,
    caps: "point",
    name: "noseCone",
  });
  cylinder(0.40, 0.08, [0, 1.53, 2.83], CYAN, [0, 0, 1], 12, "intakeRing");
  cylinder(0.29, 0.10, [0, 1.53, 3.02], SHADOW, [0, 0, 1], 12, "spinnerBase");
  b.spike([0, 1.53, 3.04], [0, 0, 1], 0.34, 0.28, {
    color: PALE,
    caps: "point",
    name: "spinner",
  });

  // Broad elliptical main wings, with swept leading edges and clipped tips.
  const wingL = b.slab(
    [
      [0.15, 1.43, 0.95],
      [1.45, 1.43, 0.85],
      [3.30, 1.43, 0.35],
      [3.55, 1.43, -0.02],
      [3.18, 1.43, -0.34],
      [1.28, 1.43, -0.45],
      [0.18, 1.43, -0.15],
    ],
    { color: BLUE, thickness: 0.11, name: "mainWingL" },
  );
  const wingR = b.slab(
    [
      [-0.15, 1.43, 0.95],
      [-1.45, 1.43, 0.85],
      [-3.30, 1.43, 0.35],
      [-3.55, 1.43, -0.02],
      [-3.18, 1.43, -0.34],
      [-1.28, 1.43, -0.45],
      [-0.18, 1.43, -0.15],
    ],
    { color: BLUE, thickness: 0.11, name: "mainWingR" },
  );

  // Wing roots and leading-edge blueprint highlights.
  rod([0.18, 1.50, 0.85], [3.22, 1.50, 0.26], 0.025, CYAN, "leadingEdgeL");
  rod([-0.18, 1.50, 0.85], [-3.22, 1.50, 0.26], 0.025, CYAN, "leadingEdgeR");
  rod([0.22, 1.48, -0.38], [2.96, 1.48, -0.28], 0.018, CYAN, "flapLineL");
  rod([-0.22, 1.48, -0.38], [-2.96, 1.48, -0.28], 0.018, CYAN, "flapLineR");
  rod([0.54, 1.50, 0.72], [0.54, 1.50, -0.36], 0.014, PALE, "wingPanelL");
  rod([-0.54, 1.50, 0.72], [-0.54, 1.50, -0.36], 0.014, PALE, "wingPanelR");
  rod([1.78, 1.50, 0.68], [1.78, 1.50, -0.30], 0.012, CYAN, "aileronL");
  rod([-1.78, 1.50, 0.68], [-1.78, 1.50, -0.30], 0.012, CYAN, "aileronR");

  // Tailplane and rudder.
  b.slab(
    [
      [0.10, 1.60, -2.15],
      [1.55, 1.60, -2.45],
      [1.88, 1.60, -2.68],
      [1.62, 1.60, -2.88],
      [0.12, 1.60, -2.62],
    ],
    { color: MID, thickness: 0.075, name: "tailplaneL" },
  );
  b.slab(
    [
      [-0.10, 1.60, -2.15],
      [-1.55, 1.60, -2.45],
      [-1.88, 1.60, -2.68],
      [-1.62, 1.60, -2.88],
      [-0.12, 1.60, -2.62],
    ],
    { color: MID, thickness: 0.075, name: "tailplaneR" },
  );
  rod([0.16, 1.66, -2.18], [1.68, 1.66, -2.64], 0.018, CYAN, "tailEdgeL");
  rod([-0.16, 1.66, -2.18], [-1.68, 1.66, -2.64], 0.018, CYAN, "tailEdgeR");

  const fin = b.extrude(
    [
      [0, 0, "sharp"],
      [0.12, 0, "sharp"],
      [0.76, 0.20, "sharp"],
      [0.66, 0.95, "sharp"],
      [0.40, 1.38, "sharp"],
      [0.19, 1.58, "sharp"],
    ],
    {
      at: [-0.055, 1.62, -2.36],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.11,
      bevel: 0.015,
      color: MID,
      name: "verticalTail",
    },
  );
  rod([0, 1.68, -2.32], [0, 2.98, -1.90], 0.018, CYAN, "rudderEdge");

  // Raised bubble canopy and cockpit sill.
  const canopy = b.part(
    new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
    BLUE,
    {
      at: [0, 1.93, 0.08],
      scale: [0.53, 0.46, 0.88],
      name: "bubbleCanopy",
      texture: canopyGlass,
    },
  );
  rod([-0.50, 1.82, -0.48], [0, 2.25, 0.73], 0.028, PALE, "canopyFrameL");
  rod([0.50, 1.82, -0.48], [0, 2.25, 0.73], 0.028, PALE, "canopyFrameR");
  rod([0, 2.24, 0.72], [0, 2.28, -0.48], 0.024, CYAN, "canopySpine");
  rod([-0.47, 1.82, -0.52], [0.47, 1.82, -0.52], 0.035, PALE, "cockpitSill");

  // Instrument panel and tiny headrest.
  box([0.66, 0.07, 0.08], [0, 1.91, 0.68], SHADOW, [-18, 0, 0], "instrumentPanel");
  for (let i = -2; i <= 2; i++) {
    cylinder(0.028, 0.025, [i * 0.11, 1.96, 0.72], GLOW, [0, 1, 0], 8, "dial");
  }
  box([0.30, 0.25, 0.12], [0, 1.88, -0.57], SHADOW, undefined, "headrest");

  // Landing gear: sturdy struts, wheels, and cyan hub caps.
  for (const s of [-1, 1]) {
    rod([s * 0.62, 1.15, 0.20], [s * 0.90, 0.28, 0.34], 0.055, SHADOW, "mainStrut");
    cylinder(0.21, 0.12, [s * 0.92, 0.22, 0.38], RUBBER, [1, 0, 0], 12, "mainWheel");
    cylinder(0.085, 0.125, [s * 0.99, 0.22, 0.38], CYAN, [1, 0, 0], 10, "wheelHub");
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2;
      rivet([s * 1.045, 0.22 + Math.cos(a) * 0.055, 0.38 + Math.sin(a) * 0.055], 0.012, PALE);
    }
  }
  rod([0, 1.20, -2.45], [0, 0.18, -2.52], 0.035, SHADOW, "tailWheelStrut");
  cylinder(0.12, 0.07, [0, 0.12, -2.55], RUBBER, [1, 0, 0], 10, "tailWheel");

  // Three-bladed propeller, mounted in front of the spinner.
  const propCenter: [number, number, number] = [0, 1.53, 3.38];
  cylinder(0.12, 0.22, propCenter, PALE, [0, 0, 1], 10, "propBoss");

  for (let i = 0; i < 3; i++) {
    const a = (i * 120 * Math.PI) / 180;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const vx = -uy;
    const vy = ux;
    const at: [number, number, number] = [
      propCenter[0] + ux * 0.46,
      propCenter[1] + uy * 0.46,
      propCenter[2] + 0.025,
    ];
    b.extrude(
      [
        [-0.07, -0.10],
        [0.09, -0.18],
        [0.25, -0.95],
        [0.10, -1.32],
        [-0.13, -1.16],
        [-0.19, -0.36],
      ],
      {
        at,
        x: [ux, uy, 0],
        y: [vx, vy, 0],
        thickness: 0.065,
        bevel: 0.012,
        color: MID,
        name: `propBlade${i + 1}`,
      },
    );
    rod(
      [
        propCenter[0] + ux * 0.12,
        propCenter[1] + uy * 0.12,
        propCenter[2] + 0.07,
      ],
      [
        propCenter[0] + ux * 1.05,
        propCenter[1] + uy * 1.05,
        propCenter[2] + 0.07,
      ],
      0.014,
      CYAN,
      `propHighlight${i + 1}`,
    );
  }

  // Engine exhaust stacks under both sides of the nose.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const z = 1.52 + i * 0.16;
      cylinder(0.035, 0.16, [s * 0.48, 1.16, z], SHADOW, [0, 0, 1], 6, "exhaustStack");
      cylinder(0.018, 0.02, [s * 0.48, 1.16, z + 0.09], CYAN, [0, 0, 1], 6, "exhaustLip");
    }
  }

  // Blueprint rivet runs along fuselage and wing roots.
  for (let i = 0; i < 13; i++) {
    const z = -1.95 + i * 0.34;
    rivet([0.51, 1.54, z], 0.022);
    rivet([-0.51, 1.54, z], 0.022);
    rivet([0.38, 1.83, z], 0.018, CYAN);
    rivet([-0.38, 1.83, z], 0.018, CYAN);
  }
  for (let i = 0; i < 8; i++) {
    const x = 0.72 + i * 0.34;
    rivet([x, 1.51, 0.35 - i * 0.055], 0.021);
    rivet([-x, 1.51, 0.35 - i * 0.055], 0.021);
  }

  // Surface blueprint seams and access panels.
  rod([-0.72, 1.89, 1.00], [0.72, 1.89, 1.00], 0.012, CYAN, "topPanel");
  rod([-0.76, 1.89, 1.34], [0.76, 1.89, 1.34], 0.012, CYAN, "topPanel2");
  rod([0.67, 1.30, 1.55], [0.67, 1.30, 2.35], 0.012, PALE, "nosePanelL");
  rod([-0.67, 1.30, 1.55], [-0.67, 1.30, 2.35], 0.012, PALE, "nosePanelR");
  box([0.56, 0.012, 0.34], [0, 1.98, -1.48], SHADOW, undefined, "accessPanel");
  rod([-0.28, 1.99, -1.30], [0.28, 1.99, -1.30], 0.009, PALE, "accessPanelLine");
  rod([-0.28, 1.99, -1.66], [0.28, 1.99, -1.66], 0.009, PALE, "accessPanelLine");

  // RAF-style roundels on the upper wings.
  b.part(new THREE.CircleGeometry(0.36, 24), PALE, {
    at: [1.76, 1.505, 0.20],
    dir: [0, 1, 0],
    axis: "z",
    texture: roundel,
    name: "roundelL",
  });
  b.part(new THREE.CircleGeometry(0.36, 24), PALE, {
    at: [-1.76, 1.505, 0.20],
    dir: [0, 1, 0],
    axis: "z",
    texture: roundel,
    name: "roundelR",
  });

  // Serial marking and technical blueprint plate on the rear fuselage.
  b.part(new THREE.PlaneGeometry(0.60, 0.14), PALE, {
    at: [0.52, 1.55, -1.70],
    dir: [1, 0, 0],
    axis: "z",
    texture: serial,
    name: "serialMark",
  });
  b.part(new THREE.PlaneGeometry(0.72, 0.20), PALE, {
    at: [0, 1.14, -1.05],
    dir: [0, -1, 0],
    axis: "z",
    texture: blueprintLabel,
    name: "blueprintLabel",
  });

  // Small cyan guide arrows and schematic reference bars around the airframe.
  rod([3.38, 1.55, 0.12], [3.72, 1.55, 0.12], 0.010, PALE, "wingTipDatumL");
  rod([-3.38, 1.55, 0.12], [-3.72, 1.55, 0.12], 0.010, PALE, "wingTipDatumR");
  rod([3.72, 1.55, 0.12], [3.62, 1.55, 0.19], 0.010, PALE, "arrowL1");
  rod([3.72, 1.55, 0.12], [3.62, 1.55, 0.05], 0.010, PALE, "arrowL2");
  rod([-3.72, 1.55, 0.12], [-3.62, 1.55, 0.19], 0.010, PALE, "arrowR1");
  rod([-3.72, 1.55, 0.12], [-3.62, 1.55, 0.05], 0.010, PALE, "arrowR2");

  // A slim transparent-looking antenna mast and aerial wire.
  rod([0, 2.02, -0.72], [0, 2.54, -1.45], 0.018, PALE, "antennaMast");
  rod([0, 2.54, -1.45], [0, 2.02, -2.35], 0.009, CYAN, "aerialWire");

  return b.root;
}
