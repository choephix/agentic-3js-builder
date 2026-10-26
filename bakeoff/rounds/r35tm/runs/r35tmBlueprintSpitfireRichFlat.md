```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, rng } from "agentic-3js-builder";

export const meta = {
  name: "Cyanotype Spitfire",
  description:
    "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with elliptical wings, cockpit canopy, three-blade propeller, landing gear, panel lines, rivets, and blueprint insignia.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const NAVY = "#092840";
  const DEEP = "#061a2e";
  const BLUE = "#0d4e72";
  const MID = "#147da0";
  const CYAN = "#49d9e8";
  const PALE = "#b9f5f4";
  const WHITE = "#e7ffff";
  const ACCENT = "#72eef1";
  const SHADOW = "#08344e";

  const fuselagePath = catmull([
    [0, 1.45, -5.65],
    [0, 1.47, -4.85],
    [0, 1.49, -3.75],
    [0, 1.52, -2.1],
    [0, 1.56, 0.0],
    [0, 1.61, 2.1],
    [0, 1.66, 3.55],
    [0, 1.7, 4.15],
    [0, 1.71, 4.48],
  ]);

  const fuselage = b.sweep(
    fuselagePath,
    (t) => {
      const r = Math.sin(Math.PI * Math.min(1, t * 1.08));
      const taper = t > 0.78 ? 1 - (t - 0.78) * 2.8 : 1;
      return [0.45 * r * taper + 0.035, 0.47 * r * taper + 0.035];
    },
    {
      color: BLUE,
      sides: 10,
      caps: { start: "point", end: "point" },
      name: "fuselage",
      group: "airframe",
    },
  );

  const upperBody = b.sweep(
    catmull([
      [0, 1.67, -3.9],
      [0, 1.82, -2.7],
      [0, 1.91, -1.0],
      [0, 1.95, 0.65],
      [0, 1.9, 1.85],
    ]),
    (t) => [0.34 - t * 0.055, 0.34 - t * 0.045],
    {
      color: MID,
      sides: 8,
      caps: "flat",
      name: "upper-fuselage",
      group: "airframe",
    },
  );

  const belly = b.sweep(
    catmull([
      [0, 1.33, -4.0],
      [0, 1.18, -2.5],
      [0, 1.13, -0.4],
      [0, 1.19, 2.1],
      [0, 1.34, 3.65],
    ]),
    (t) => [0.36 - t * 0.1, 0.24 - t * 0.035],
    {
      color: DEEP,
      sides: 8,
      caps: "flat",
      name: "belly",
      group: "airframe",
    },
  );

  const wingL = b.slab(
    [
      [0.15, 1.51, 1.25],
      [1.45, 1.51, 1.3],
      [3.3, 1.5, 1.1],
      [4.72, 1.49, 0.25],
      [4.95, 1.48, -0.75],
      [4.34, 1.48, -1.48],
      [2.4, 1.49, -1.24],
      [0.55, 1.5, -0.72],
    ],
    { color: BLUE, thickness: 0.105, name: "left-main-wing", group: "wings" },
  );

  const wingR = b.slab(
    [
      [-0.15, 1.51, 1.25],
      [-1.45, 1.51, 1.3],
      [-3.3, 1.5, 1.1],
      [-4.72, 1.49, 0.25],
      [-4.95, 1.48, -0.75],
      [-4.34, 1.48, -1.48],
      [-2.4, 1.49, -1.24],
      [-0.55, 1.5, -0.72],
    ],
    { color: BLUE, thickness: 0.105, name: "right-main-wing", group: "wings" },
  );

  const wingTopL = b.slab(
    [
      [0.25, 1.575, 1.16],
      [1.7, 1.575, 1.12],
      [3.35, 1.575, 0.93],
      [4.48, 1.575, 0.2],
      [4.57, 1.575, -0.57],
      [4.08, 1.575, -1.13],
      [2.35, 1.575, -0.98],
      [0.55, 1.575, -0.58],
    ],
    { color: MID, thickness: 0.018, name: "left-wing-face", group: "panels" },
  );

  const wingTopR = b.slab(
    [
      [-0.25, 1.575, 1.16],
      [-1.7, 1.575, 1.12],
      [-3.35, 1.575, 0.93],
      [-4.48, 1.575, 0.2],
      [-4.57, 1.575, -0.57],
      [-4.08, 1.575, -1.13],
      [-2.35, 1.575, -0.98],
      [-0.55, 1.575, -0.58],
    ],
    { color: MID, thickness: 0.018, name: "right-wing-face", group: "panels" },
  );

  const tailL = b.slab(
    [
      [0.1, 1.56, -4.3],
      [1.35, 1.56, -4.12],
      [2.05, 1.56, -4.58],
      [1.45, 1.56, -5.15],
      [0.2, 1.56, -5.05],
    ],
    { color: BLUE, thickness: 0.09, name: "left-tailplane", group: "tail" },
  );

  const tailR = b.slab(
    [
      [-0.1, 1.56, -4.3],
      [-1.35, 1.56, -4.12],
      [-2.05, 1.56, -4.58],
      [-1.45, 1.56, -5.15],
      [-0.2, 1.56, -5.05],
    ],
    { color: BLUE, thickness: 0.09, name: "right-tailplane", group: "tail" },
  );

  const verticalTail = b.extrude(
    [
      [-0.03, 0.0],
      [0.58, 0.0],
      [0.78, 0.38],
      [0.68, 1.2],
      [0.38, 1.72],
      [0.08, 1.92],
      [-0.03, 1.82],
    ],
    {
      at: [0, 1.62, -4.72],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.018,
      color: BLUE,
      name: "vertical-tail",
      group: "tail",
    },
  );

  const rudderInset = b.extrude(
    [
      [0.03, 0.18],
      [0.46, 0.25],
      [0.61, 0.48],
      [0.54, 1.12],
      [0.28, 1.58],
      [0.08, 1.7],
    ],
    {
      at: [0, 1.69, -4.735],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      color: MID,
      name: "rudder-inset",
      group: "panels",
    },
  );

  const cockpit = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    DEEP,
    {
      at: [0, 2.05, 0.42],
      scale: [0.58, 0.39, 1.0],
      name: "cockpit-canopy",
      group: "cockpit",
      flat: true,
    },
  );

  const cockpitRear = b.part(
    new THREE.SphereGeometry(1, 10, 7),
    BLUE,
    {
      at: [0, 2.0, -0.38],
      scale: [0.56, 0.34, 0.55],
      name: "canopy-rear",
      group: "cockpit",
      flat: true,
    },
  );

  const canopyRimL = b.rod(
    [-0.56, 2.02, -0.34],
    [-0.42, 2.27, 0.28],
    0.025,
    { color: CYAN, caps: "round", name: "canopy-left-rim", group: "cockpit" },
  );
  const canopyRimR = b.rod(
    [0.56, 2.02, -0.34],
    [0.42, 2.27, 0.28],
    0.025,
    { color: CYAN, caps: "round", name: "canopy-right-rim", group: "cockpit" },
  );
  const canopySpine = b.rod(
    [0, 2.34, -0.5],
    [0, 2.34, 0.5],
    0.022,
    { color: PALE, caps: "round", name: "canopy-spine", group: "cockpit" },
  );
  const canopyFront = b.rod(
    [-0.42, 2.27, 0.28],
    [0.42, 2.27, 0.28],
    0.021,
    { color: CYAN, caps: "round", name: "canopy-front-frame", group: "cockpit" },
  );
  const canopyRearBar = b.rod(
    [-0.53, 2.08, -0.44],
    [0.53, 2.08, -0.44],
    0.024,
    { color: CYAN, caps: "round", name: "canopy-rear-frame", group: "cockpit" },
  );

  const noseRing = b.part(
    new THREE.CylinderGeometry(0.49, 0.52, 0.12, 12),
    DEEP,
    {
      at: [0, 1.71, 4.18],
      dir: [0, 0, 1],
      name: "nose-ring",
      group: "engine",
    },
  );

  const spinner = b.part(
    new THREE.ConeGeometry(0.31, 0.62, 10),
    MID,
    {
      at: [0, 1.71, 4.57],
      dir: [0, 0, 1],
      name: "propeller-spinner",
      group: "propeller",
    },
  );

  const spinnerTip = b.part(
    new THREE.SphereGeometry(0.12, 8, 5),
    PALE,
    {
      at: [0, 1.71, 4.9],
      name: "spinner-cap",
      group: "propeller",
    },
  );

  const blade = (angle: number, side: number) => {
    const a = angle * Math.PI / 180;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const rotate = (x: number, y: number): [number, number, number] => [
      x * ca - y * sa,
      y * ca + x * sa,
      4.82,
    ];
    const points = [
      rotate(0.05, 0.03),
      rotate(0.19, 0.13),
      rotate(0.31, 0.68),
      rotate(0.22, 1.18),
      rotate(0.05, 1.34),
      rotate(-0.08, 0.98),
      rotate(-0.13, 0.35),
    ];
    return b.slab(points, {
      color: side > 0 ? CYAN : MID,
      thickness: 0.075,
      name: `propeller-blade-${angle}`,
      group: "propeller",
    });
  };

  blade(0, 1);
  blade(120, -1);
  blade(240, 1);

  const exhaustL = b.along(
    catmull([
      [-0.37, 1.55, 2.8],
      [-0.42, 1.53, 3.15],
      [-0.43, 1.54, 3.55],
    ]),
    5,
    (at) =>
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 6), DEEP, {
        at,
        dir: [0, 0, 1],
        name: "left-exhaust",
        group: "engine",
      }),
  );

  const exhaustR = b.along(
    catmull([
      [0.37, 1.55, 2.8],
      [0.42, 1.53, 3.15],
      [0.43, 1.54, 3.55],
    ]),
    5,
    (at) =>
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 6), DEEP, {
        at,
        dir: [0, 0, 1],
        name: "right-exhaust",
        group: "engine",
      }),
  );

  const wingPanel = (s: number, z: number, span: number, color = CYAN) =>
    b.rod(
      [s * 0.58, 1.595, z],
      [s * span, 1.595, z - 0.02],
      0.012,
      { color, caps: "flat", name: `wing-panel-${s}-${z}`, group: "panels" },
    );

  wingPanel(1, 0.98, 4.38);
  wingPanel(-1, 0.98, 4.38);
  wingPanel(1, 0.47, 4.58);
  wingPanel(-1, 0.47, 4.58);
  wingPanel(1, -0.18, 4.68, PALE);
  wingPanel(-1, -0.18, 4.68, PALE);
  wingPanel(1, -0.82, 4.25);
  wingPanel(-1, -0.82, 4.25);

  const wingRib = (s: number, z: number) =>
    b.rod(
      [s * 1.0, 1.603, z],
      [s * 4.4, 1.603, z - 0.03],
      0.009,
      { color: SHADOW, caps: "flat", name: `wing-rib-${s}-${z}`, group: "panels" },
    );

  wingRib(1, 0.8);
  wingRib(-1, 0.8);
  wingRib(1, -0.52);
  wingRib(-1, -0.52);

  const fuselagePanel = (z: number, r: number, color = CYAN) =>
    b.ring(fuselage.at(fuselagePath.closestT([0, 1.55, z])), {
      count: 10,
      radius: r,
      fromDeg: 0,
      toDeg: 360,
      name: `fuselage-ring-${z}`,
      role: "fan",
    }, (item) =>
      b.part(
        new THREE.BoxGeometry(0.018, 0.018, 0.12),
        color,
        {
          frame: item,
          scale: [1, 1, 0.3],
          name: `fuselage-rivet-ring-${z}`,
          group: "panels",
        },
      ),
    );

  fuselagePanel(-2.8, 0.37, PALE);
  fuselagePanel(-1.7, 0.41, CYAN);
  fuselagePanel(2.45, 0.37, CYAN);
  fuselagePanel(3.35, 0.31, PALE);

  const wingRootL = b.rod(
    [0.38, 1.59, 1.18],
    [0.75, 1.59, -0.83],
    0.018,
    { color: PALE, caps: "flat", name: "left-wing-root-seam", group: "panels" },
  );
  const wingRootR = b.rod(
    [-0.38, 1.59, 1.18],
    [-0.75, 1.59, -0.83],
    0.018,
    { color: PALE, caps: "flat", name: "right-wing-root-seam", group: "panels" },
  );

  const aileronL = b.rod(
    [3.2, 1.6, -0.88],
    [4.33, 1.6, -0.78],
    0.018,
    { color: ACCENT, caps: "flat", name: "left-aileron", group: "controls" },
  );
  const aileronR = b.rod(
    [-3.2, 1.6, -0.88],
    [-4.33, 1.6, -0.78],
    0.018,
    { color: ACCENT, caps: "flat", name: "right-aileron", group: "controls" },
  );

  const elevatorL = b.rod(
    [0.25, 1.61, -4.5],
    [1.7, 1.61, -4.62],
    0.017,
    { color: ACCENT, caps: "flat", name: "left-elevator", group: "controls" },
  );
  const elevatorR = b.rod(
    [-0.25, 1.61, -4.5],
    [-1.7, 1.61, -4.62],
    0.017,
    { color: ACCENT, caps: "flat", name: "right-elevator", group: "controls" },
  );

  const gearStrutL = b.rod(
    [0.82, 1.32, 0.52],
    [1.06, 0.27, 0.55],
    0.06,
    { color: CYAN, caps: "round", name: "left-main-strut", group: "landing-gear" },
  );
  const gearStrutR = b.rod(
    [-0.82, 1.32, 0.52],
    [-1.06, 0.27, 0.55],
    0.06,
    { color: CYAN, caps: "round", name: "right-main-strut", group: "landing-gear" },
  );

  const wheelL = b.part(
    new THREE.CylinderGeometry(0.22, 0.22, 0.11, 10),
    DEEP,
    {
      at: [1.06, 0.19, 0.55],
      dir: [1, 0, 0],
      name: "left-wheel",
      group: "landing-gear",
    },
  );
  const wheelR = b.part(
    new THREE.CylinderGeometry(0.22, 0.22, 0.11, 10),
    DEEP,
    {
      at: [-1.06, 0.19, 0.55],
      dir: [1, 0, 0],
      name: "right-wheel",
      group: "landing-gear",
    },
  );

  const wheelHubL = b.part(
    new THREE.CylinderGeometry(0.075, 0.075, 0.125, 8),
    PALE,
    {
      at: [1.06, 0.19, 0.55],
      dir: [1, 0, 0],
      name: "left-wheel-hub",
      group: "landing-gear",
    },
  );
  const wheelHubR = b.part(
    new THREE.CylinderGeometry(0.075, 0.075, 0.125, 8),
    PALE,
    {
      at: [-1.06, 0.19, 0.55],
      dir: [1, 0, 0],
      name: "right-wheel-hub",
      group: "landing-gear",
    },
  );

  const tailWheelStrut = b.rod(
    [0, 1.24, -3.75],
    [0, 0.22, -3.92],
    0.035,
    { color: CYAN, caps: "round", name: "tail-wheel-strut", group: "landing-gear" },
  );
  const tailWheel = b.part(
    new THREE.CylinderGeometry(0.13, 0.13, 0.075, 9),
    DEEP,
    {
      at: [0, 0.13, -3.98],
      dir: [1, 0, 0],
      name: "tail-wheel",
      group: "landing-gear",
    },
  );

  const roundel = (x: number, z: number, side: number) => {
    const base = b.part(
      new THREE.CylinderGeometry(0.38, 0.38, 0.018, 24),
      PALE,
      {
        at: [x, 1.615, z],
        dir: [0, 1, 0],
        name: `roundel-outer-${side}`,
        group: "markings",
      },
    );
    const inner = b.part(
      new THREE.CylinderGeometry(0.24, 0.24, 0.022, 20),
      BLUE,
      {
        at: [x, 1.628, z],
        dir: [0, 1, 0],
        name: `roundel-inner-${side}`,
        group: "markings",
      },
    );
    const hub = b.part(
      new THREE.CylinderGeometry(0.105, 0.105, 0.026, 16),
      CYAN,
      {
        at: [x, 1.642, z],
        dir: [0, 1, 0],
        name: `roundel-hub-${side}`,
        group: "markings",
      },
    );
    return { base, inner, hub };
  };

  roundel(2.75, 0.08, 1);
  roundel(-2.75, 0.08, -1);

  const fuselageStripe1 = b.sweep(
    catmull([
      [0.0, 1.84, -1.02],
      [0.0, 1.91, -0.3],
      [0.0, 1.95, 0.46],
      [0.0, 1.92, 1.04],
    ]),
    0.012,
    {
      color: PALE,
      sides: 6,
      caps: "flat",
      name: "fuselage-spine-line",
      group: "markings",
    },
  );

  const fuselageStripeL = b.rod(
    [-0.41, 1.74, -1.1],
    [-0.39, 1.74, 1.2],
    0.012,
    { color: CYAN, caps: "flat", name: "left-fuselage-panel-line", group: "markings" },
  );
  const fuselageStripeR = b.rod(
    [0.41, 1.74, -1.1],
    [0.39, 1.74, 1.2],
    0.012,
    { color: CYAN, caps: "flat", name: "right-fuselage-panel-line", group: "markings" },
  );

  const noseChevronL = b.rod(
    [-0.34, 1.87, 3.15],
    [-0.18, 1.95, 3.55],
    0.018,
    { color: PALE, caps: "round", name: "nose-chevron-left", group: "markings" },
  );
  const noseChevronR = b.rod(
    [0.34, 1.87, 3.15],
    [0.18, 1.95, 3.55],
    0.018,
    { color: PALE, caps: "round", name: "nose-chevron-right", group: "markings" },
  );

  const machineGunL = b.rod(
    [-0.2, 1.75, 1.82],
    [-0.2, 1.75, 3.8],
    0.014,
    { color: PALE, caps: "flat", name: "left-machine-gun-line", group: "weapons" },
  );
  const machineGunR = b.rod(
    [0.2, 1.75, 1.82],
    [0.2, 1.75, 3.8],
    0.014,
    { color: PALE, caps: "flat", name: "right-machine-gun-line", group: "weapons" },
  );

  const gunPortL = b.part(
    new THREE.CylinderGeometry(0.045, 0.045, 0.025, 8),
    DEEP,
    {
      at: [-0.2, 1.77, 3.77],
      dir: [0, 0, 1],
      name: "left-gun-port",
      group: "weapons",
    },
  );
  const gunPortR = b.part(
    new THREE.CylinderGeometry(0.045, 0.045, 0.025, 8),
    DEEP,
    {
      at: [0.2, 1.77, 3.77],
      dir: [0, 0, 1],
      name: "right-gun-port",
      group: "weapons",
    },
  );

  const antenna = b.rod(
    [0, 2.24, -0.72],
    [0, 2.85, -1.62],
    0.012,
    { color: PALE, caps: "round", name: "radio-antenna", group: "cockpit" },
  );

  const antennaTip = b.part(
    new THREE.SphereGeometry(0.035, 6, 4),
    CYAN,
    {
      at: [0, 2.85, -1.62],
      name: "radio-antenna-tip",
      group: "cockpit",
    },
  );

  const tailNumber = b.part(
    new THREE.BoxGeometry(0.025, 0.28, 0.14),
    PALE,
    {
      at: [0.46, 1.75, -4.7],
      name: "tail-mark-1",
      group: "markings",
    },
  );
  const tailNumber2 = b.part(
    new THREE.BoxGeometry(0.025, 0.28, 0.14),
    PALE,
    {
      at: [0.38, 1.75, -4.7],
      name: "tail-mark-2",
      group: "markings",
    },
  );

  const panelDome = b.part(
    new THREE.SphereGeometry(0.09, 8, 5),
    CYAN,
    {
      at: [0, 2.0, -2.55],
      name: "fuselage-inspection-dome",
      group: "panels",
    },
  );

  const smallRivet = (p: [number, number, number], name: string) =>
    b.part(new THREE.SphereGeometry(0.018, 6, 4), PALE, {
      at: p,
      name,
      group: "rivets",
    });

  const rivetZ = [-0.7, 0.0, 0.7];
  for (const s of [1, -1]) {
    for (let i = 0; i < rivetZ.length; i++) {
      const z = rivetZ[i];
      smallRivet([s * 1.65, 1.61, z], `wing-rivet-${s}-${i}-a`);
      smallRivet([s * 2.25, 1.61, z - 0.05], `wing-rivet-${s}-${i}-b`);
      smallRivet([s * 3.05, 1.61, z - 0.1], `wing-rivet-${s}-${i}-c`);
    }
  }

  const tailRivetZ = [-4.5, -4.8, -5.05];
  for (const s of [1, -1]) {
    for (let i = 0; i < tailRivetZ.length; i++) {
      smallRivet([s * 0.9, 1.61, tailRivetZ[i]], `tail-rivet-${s}-${i}`);
    }
  }

  const frontPanel = b.rod(
    [-0.43, 1.63, 3.73],
    [0.43, 1.63, 3.73],
    0.014,
    { color: PALE, caps: "flat", name: "engine-cowl-front-seam", group: "panels" },
  );
  const rearPanel = b.rod(
    [-0.42, 1.65, 2.48],
    [0.42, 1.65, 2.48],
    0.014,
    { color: CYAN, caps: "flat", name: "engine-cowl-rear-seam", group: "panels" },
  );

  const leftCowl = b.sweep(
    catmull([
      [-0.46, 1.72, 2.2],
      [-0.48, 1.77, 2.8],
      [-0.44, 1.79, 3.45],
      [-0.35, 1.8, 3.85],
    ]),
    0.014,
    {
      color: PALE,
      sides: 6,
      caps: "flat",
      name: "left-cowl-seam",
      group: "panels",
    },
  );
  const rightCowl = b.sweep(
    catmull([
      [0.46, 1.72, 2.2],
      [0.48, 1.77, 2.8],
      [0.44, 1.79, 3.45],
      [0.35, 1.8, 3.85],
    ]),
    0.014,
    {
      color: PALE,
      sides: 6,
      caps: "flat",
      name: "right-cowl-seam",
      group: "panels",
    },
  );

  const wingTipL = b.part(
    new THREE.SphereGeometry(0.075, 7, 5),
    PALE,
    {
      at: [4.56, 1.51, -0.57],
      name: "left-wingtip-light",
      group: "lights",
    },
  );
  const wingTipR = b.part(
    new THREE.SphereGeometry(0.075, 7, 5),
    CYAN,
    {
      at: [-4.56, 1.51, -0.57],
      name: "right-wingtip-light",
      group: "lights",
    },
  );

  const blueprintArrow = b.rod(
    [0, 0.08, -5.85],
    [0, 0.08, 5.15],
    0.008,
    { color: SHADOW, caps: "flat", name: "blueprint-centerline", group: "blueprint-detail" },
  );

  const landingGuideL = b.rod(
    [1.06, 0.06, 0.55],
    [1.06, 0.06, -0.15],
    0.009,
    { color: CYAN, caps: "flat", name: "left-ground-guide", group: "blueprint-detail" },
  );
  const landingGuideR = b.rod(
    [-1.06, 0.06, 0.55],
    [-1.06, 0.06, -0.15],
    0.009,
    { color: CYAN, caps: "flat", name: "right-ground-guide", group: "blueprint-detail" },
  );

  const floorDatum = b.rod(
    [-5.4, 0.025, -6.0],
    [5.4, 0.025, -6.0],
    0.008,
    { color: SHADOW, caps: "flat", name: "blueprint-datum", group: "blueprint-detail" },
  );

  return b.root;
}
```