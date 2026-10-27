import * as THREE from "three";
import { createBuilder, catmull, svg } from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint.",
};

export default function build() {
  const b = createBuilder({ name: "spitfire", detail: 1 });

  const NAVY = "#062b45";
  const BLUE = "#0a4664";
  const MID = "#0c5876";
  const CYAN = "#42d6df";
  const PALE = "#b8ffff";
  const INK = "#031a2b";
  const GLASS = "#17647a";
  const RUBBER = "#021622";

  const roundel = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#062b45" stroke="#b8ffff" stroke-width="5"/>
      <circle cx="64" cy="64" r="43" fill="#42d6df" stroke="#b8ffff" stroke-width="3"/>
      <circle cx="64" cy="64" r="25" fill="#062b45" stroke="#b8ffff" stroke-width="3"/>
      <path d="M64 8v112M8 64h112" stroke="#b8ffff" stroke-width="2" opacity=".55"/>
    </svg>`,
    { size: 192 },
  );

  const serial = svg(
    `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="64" fill="#062b45"/>
      <path d="M8 8H232V56H8Z" fill="none" stroke="#b8ffff" stroke-width="4"/>
      <text x="120" y="43" text-anchor="middle" font-family="monospace" font-size="32"
        font-weight="bold" letter-spacing="5" fill="#b8ffff">MK IX</text>
    </svg>`,
    { size: 256 },
  );

  const blueprint = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#062b45"/>
      <g fill="none" stroke="#42d6df" stroke-width="3" opacity=".9">
        <path d="M20 48H236M20 88H236M20 128H236M20 168H236M20 208H236"/>
        <path d="M48 20V236M88 20V236M128 20V236M168 20V236M208 20V236"/>
        <circle cx="128" cy="128" r="86"/>
        <circle cx="128" cy="128" r="48"/>
        <path d="M30 30L226 226M226 30L30 226"/>
      </g>
      <g fill="#b8ffff" font-family="monospace" font-size="18">
        <text x="18" y="24">SPITFIRE</text>
        <text x="166" y="247">01</text>
      </g>
    </svg>`,
    { size: 256 },
  );

  const stripe = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#0a4664"/>
      <path d="M-20 100L28 148M0 68L60 128M20 28L120 128M68 0L128 60M100 -20L148 28"
        stroke="#b8ffff" stroke-width="9" opacity=".8"/>
      <path d="M-20 76L52 148M24 -20L148 104" stroke="#42d6df" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color = BLUE,
    opts: Record<string, unknown> = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, ...opts });

  const cylinder = (
    radius: number,
    depth: number,
    at: [number, number, number],
    dir: [number, number, number],
    color = BLUE,
    radial = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, radial), color, {
      at,
      dir,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color = CYAN,
  ) => b.rod(a, c, radius, { color, sides: 6 });

  const rivet = (at: [number, number, number], r = 0.018) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), PALE, { at });

  // Main fuselage, deliberately faceted and slightly flattened underneath.
  const fuselagePath = catmull([
    [0, 0.78, -1.55],
    [0, 0.79, -1.05],
    [0, 0.82, -0.25],
    [0, 0.86, 0.62],
    [0, 0.91, 1.25],
    [0, 0.9, 1.65],
    [0, 0.84, 1.82],
  ]);
  const fuselage = b.sweep(
    fuselagePath,
    (t) => {
      if (t < 0.12) return 0.18 + t * 0.4;
      if (t < 0.65) return 0.23;
      return 0.23 - (t - 0.65) * 0.27;
    },
    {
      color: BLUE,
      sides: 10,
      section: "circle",
      caps: "round",
      name: "fuselage",
    },
  );

  // Belly keel and dorsal spine.
  b.sweep(
    catmull([
      [0, 0.68, -1.2],
      [0, 0.63, -0.25],
      [0, 0.66, 0.7],
      [0, 0.72, 1.42],
    ]),
    [0.11, 0.07],
    { color: NAVY, sides: 6, caps: "flat", name: "bellyKeel" },
  );
  b.sweep(
    catmull([
      [0, 0.96, -0.95],
      [0, 1.02, -0.25],
      [0, 1.08, 0.5],
      [0, 1.08, 1.12],
    ]),
    [0.07, 0.045],
    { color: MID, sides: 6, caps: "flat", name: "dorsalSpine" },
  );

  // Nose spinner, annular cowling and propeller shaft.
  cylinder(0.2, 0.12, [0, 0.88, 1.78], [0, 0, 1], MID, 12);
  cylinder(0.125, 0.28, [0, 0.89, 1.88], [0, 0, 1], PALE, 10);
  b.part(
    new THREE.ConeGeometry(0.19, 0.36, 12),
    BLUE,
    { at: [0, 0.89, 1.98], dir: [0, 0, 1], name: "spinner" },
  );
  cylinder(0.045, 0.38, [0, 0.89, 2.14], [0, 0, 1], INK, 8);

  // Cowling panel bands.
  for (const z of [1.57, 1.68, 1.79]) {
    b.sweep(
      catmull([
        [-0.16, 0.88, z],
        [0, 0.91, z + 0.005],
        [0.16, 0.88, z],
      ]),
      0.014,
      { color: PALE, sides: 6, caps: "flat", name: "cowlingBand" },
    );
  }

  // Main wings: broad elliptical swept planform built from plates.
  const wingL = b.slab(
    [
      [0, 0.8, 0.25],
      [0.48, 0.79, 0.42],
      [1.28, 0.76, 0.25],
      [1.94, 0.73, -0.08],
      [1.88, 0.73, -0.32],
      [1.12, 0.77, -0.2],
      [0.36, 0.81, 0.02],
    ],
    { color: BLUE, thickness: 0.075, name: "leftMainWing" },
  );
  const wingR = b.slab(
    [
      [0, 0.8, 0.25],
      [-0.48, 0.79, 0.42],
      [-1.28, 0.76, 0.25],
      [-1.94, 0.73, -0.08],
      [-1.88, 0.73, -0.32],
      [-1.12, 0.77, -0.2],
      [-0.36, 0.81, 0.02],
    ],
    { color: BLUE, thickness: 0.075, name: "rightMainWing" },
  );

  // Wing leading edges and panel ribs.
  for (const s of [1, -1]) {
    rod([s * 0.25, 0.84, 0.32], [s * 1.82, 0.76, -0.08], 0.025, PALE);
    rod([s * 0.35, 0.805, 0.03], [s * 1.72, 0.735, -0.28], 0.012, CYAN);
    rod([s * 0.62, 0.84, 0.25], [s * 0.52, 0.83, -0.18], 0.009, CYAN);
    rod([s * 1.03, 0.8, 0.19], [s * 0.96, 0.78, -0.22], 0.009, CYAN);
    rod([s * 1.43, 0.77, 0.03], [s * 1.36, 0.75, -0.25], 0.009, CYAN);
    for (const x of [0.55, 0.95, 1.35, 1.72]) rivet([s * x, 0.825, 0.09], 0.016);
  }

  // Ailerons and wing tips.
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.55, 0.78, -0.2],
        [s * 1.72, 0.7, -0.32],
        [s * 1.83, 0.7, -0.43],
        [s * 0.58, 0.77, -0.38],
      ],
      { color: MID, thickness: 0.04, name: "aileron" },
    );
    box([0.12, 0.08, 0.22], [s * 1.91, 0.72, -0.08], PALE);
    box([0.035, 0.035, 0.18], [s * 1.97, 0.72, -0.08], INK);
  }

  // Tail boom, horizontal stabilizers and elevators.
  b.sweep(
    catmull([
      [0, 0.88, -0.9],
      [0, 0.9, -1.55],
      [0, 0.88, -2.02],
    ]),
    [0.13, 0.055],
    { color: BLUE, sides: 8, caps: "flat", name: "tailBoom" },
  );
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.03, 0.88, -1.65],
        [s * 0.68, 0.85, -1.76],
        [s * 0.86, 0.84, -2.03],
        [s * 0.1, 0.88, -1.93],
      ],
      { color: MID, thickness: 0.055, name: "tailplane" },
    );
    rod([s * 0.08, 0.92, -1.7], [s * 0.73, 0.87, -1.83], 0.016, PALE);
    rod([s * 0.2, 0.85, -1.9], [s * 0.76, 0.82, -2.0], 0.01, CYAN);
  }

  // Vertical fin and rudder.
  b.extrude(
    [
      [0, 0],
      [0.12, 0.04],
      [0.18, 0.38],
      [0.14, 0.7],
      [0.03, 0.82],
      [-0.04, 0.25],
    ],
    {
      at: [0, 0.91, -1.87],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.008,
      color: BLUE,
      name: "tailFin",
    },
  );
  rod([0, 1.18, -1.9], [0, 1.57, -1.76], 0.018, PALE);
  rod([0, 1.25, -1.79], [0, 1.48, -1.69], 0.01, CYAN);

  // Cockpit fairing and framed canopy.
  b.part(new THREE.SphereGeometry(1, 12, 8), GLASS, {
    at: [0, 1.1, -0.48],
    scale: [0.22, 0.17, 0.43],
    name: "canopy",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), GLASS, {
    at: [0, 1.12, -0.1],
    scale: [0.19, 0.15, 0.25],
    name: "rearCanopy",
  });
  for (const s of [1, -1]) {
    rod([s * 0.19, 1.09, -0.72], [s * 0.19, 1.15, -0.14], 0.018, PALE);
    rod([s * 0.19, 1.15, -0.14], [s * 0.13, 1.16, 0.08], 0.016, PALE);
  }
  rod([0, 1.25, -0.7], [0, 1.29, -0.15], 0.018, PALE);
  rod([0, 1.29, -0.15], [0, 1.21, 0.08], 0.014, PALE);
  box([0.025, 0.025, 0.38], [0, 1.29, -0.43], PALE);

  // Exhaust stacks along both sides.
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const z = 0.38 + i * 0.105;
      cylinder(0.023, 0.14, [s * 0.215, 0.83, z], [s, 0, 0], INK, 6);
      cylinder(0.013, 0.145, [s * 0.23, 0.83, z], [s, 0, 0], CYAN, 6);
    }
  }

  // Four-blade propeller with pale blueprint edges.
  for (let i = 0; i < 4; i++) {
    const angle = i * 90 + 18;
    b.extrude(
      [
        [0, -0.045],
        [0.07, -0.075],
        [0.52, -0.105],
        [0.62, -0.045],
        [0.52, 0.015],
        [0.08, 0.07],
        [0, 0.045],
      ],
      {
        at: [0, 0, 2.18],
        x: [Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180), 0],
        y: [-Math.sin(angle * Math.PI / 180), Math.cos(angle * Math.PI / 180), 0],
        thickness: 0.035,
        bevel: 0.006,
        color: MID,
        name: "propellerBlade",
      },
    );
    rod(
      [-0.02, 0, 2.205],
      [0.47, 0.02, 2.205],
      0.012,
      PALE,
    );
  }
  cylinder(0.12, 0.1, [0, 0.89, 2.2], [0, 0, 1], PALE, 10);

  // Landing gear struts, wheels and small fairings.
  for (const s of [1, -1]) {
    rod([s * 0.42, 0.76, 0.18], [s * 0.55, 0.32, 0.0], 0.035, INK);
    rod([s * 0.55, 0.32, 0.0], [s * 0.58, 0.2, 0.02], 0.022, PALE);
    cylinder(0.13, 0.055, [s * 0.59, 0.14, 0.02], [1, 0, 0], RUBBER, 12);
    cylinder(0.075, 0.062, [s * 0.59, 0.14, 0.02], [1, 0, 0], PALE, 10);
    box([0.18, 0.07, 0.25], [s * 0.54, 0.35, 0.02], BLUE);
    for (const x of [0.53, 0.59, 0.65]) rivet([s * x, 0.39, 0.02], 0.012);
  }
  // Tail wheel.
  rod([0, 0.62, -1.52], [0, 0.22, -1.7], 0.025, PALE);
  cylinder(0.08, 0.045, [0, 0.11, -1.72], [1, 0, 0], RUBBER, 10);
  cylinder(0.045, 0.052, [0, 0.11, -1.72], [1, 0, 0], PALE, 8);

  // Access panels, hatch outlines and blueprint seam language.
  for (const s of [1, -1]) {
    box([0.018, 0.12, 0.42], [s * 0.225, 0.93, 0.72], PALE);
    box([0.012, 0.08, 0.25], [s * 0.232, 0.93, 1.08], CYAN);
    for (const z of [-0.85, -0.58, -0.31, -0.04, 0.23, 0.5, 0.77]) {
      rivet([s * 0.235, 0.88, z], 0.012);
    }
  }
  for (const z of [-1.35, -1.05, -0.75]) {
    rod([-0.11, 0.9, z], [0.11, 0.9, z], 0.009, CYAN);
  }

  // Underwing rocket-like fairings and hardpoints, kept graphic rather than realistic.
  for (const s of [1, -1]) {
    for (const x of [0.78, 1.25]) {
      rod([s * x, 0.71, -0.02], [s * x, 0.57, -0.03], 0.035, INK);
      b.part(new THREE.ConeGeometry(0.045, 0.2, 8), PALE, {
        at: [s * x, 0.5, -0.03],
        dir: [0, -1, 0],
        name: "hardpoint",
      });
    }
  }

  // Cyanotype identification markings on the upper wings.
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.42, 0.42), PALE, {
      at: [s * 0.92, 0.845, 0.08],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: roundel,
      name: "wingRoundel",
    });
  }
  b.part(new THREE.PlaneGeometry(0.48, 0.13), PALE, {
    at: [0, 1.105, -1.08],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: serial,
    name: "tailMarking",
  });

  // Blueprint inspection card on the belly, like a technical drawing annotation.
  b.part(new THREE.PlaneGeometry(0.46, 0.46), PALE, {
    at: [0, 0.58, 0.58],
    dir: [0, -1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: blueprint,
    name: "bellyBlueprintPlate",
  });

  // Diagonal decorative identification stripe on the fin.
  b.part(new THREE.PlaneGeometry(0.2, 0.42), PALE, {
    at: [0, 1.32, -1.82],
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    texture: stripe,
    name: "finStripe",
  });

  // Nose inspection dots and leading-edge rivet rhythm.
  for (let i = 0; i < 10; i++) {
    const z = 1.14 + i * 0.065;
    rivet([0.16, 0.99, z], 0.011);
    rivet([-0.16, 0.99, z], 0.011);
  }

  // A compact blueprint title plate floating just behind the cockpit, attached to the aircraft surface.
  box([0.28, 0.018, 0.12], [0, 1.19, -0.92], NAVY);
  rod([-0.1, 1.205, -0.96], [0.1, 1.205, -0.96], 0.008, PALE);
  rod([-0.1, 1.205, -0.91], [0.06, 1.205, -0.91], 0.008, CYAN);
  rod([-0.1, 1.205, -0.86], [0.08, 1.205, -0.86], 0.008, PALE);

  return b.root;
}
