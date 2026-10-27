import * as THREE from "three";
import { createBuilder, catmull, polyline, rng } from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype_spitfire", detail: 1 });

  const INK = "#061d3b";
  const BLUE = "#0b3f6f";
  const MID = "#126a9a";
  const CYAN = "#20b9d0";
  const LIGHT = "#8feaf0";
  const PAPER = "#d4ffff";
  const WHITE = "#efffff";
  const SHADOW = "#082c55";
  const GLASS = "#0d789c";
  const RED = "#e85c68";

  const airframe = b.joint("airframe", {
    at: [0, 0.62, -1.65],
    dir: [0, 0, 1],
    role: "spine",
  });

  const fuselagePath = catmull(
    [
      [0, 0.69, -2.15],
      [0, 0.71, -1.8],
      [0, 0.76, -1.2],
      [0, 0.8, -0.35],
      [0, 0.84, 0.55],
      [0, 0.87, 1.35],
      [0, 0.86, 1.92],
      [0, 0.84, 2.18],
    ],
    { tension: 0.35 },
  );

  const fuselage = b.chain("fuselage", fuselagePath, {
    parent: airframe,
    count: 8,
    names: ["tailRoot", "tailBoom", "rearBody", "midBody", "cockpitBody", "noseBody", "engineCowling", "spinnerBase"],
    role: "spine",
  });

  const body = b.sweep(fuselage, (t) => {
    if (t < 0.14) return 0.075 + t * 0.35;
    if (t < 0.5) return 0.125 + t * 0.08;
    if (t < 0.78) return 0.16 - (t - 0.5) * 0.05;
    return 0.145 - (t - 0.78) * 0.28;
  }, {
    color: BLUE,
    sides: 8,
    caps: "round",
    sectors: [
      [125, 235, SHADOW],
      [-30, 30, MID],
    ],
  });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone: airframe,
      rotation,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone: airframe,
      dir,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      bone: airframe,
      scale,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, z, radius, { bone: airframe, color, name, section: { ngon: 6 } });

  // Reinforced central belly and engine deck.
  box([0.22, 0.12, 1.15], [0, 0.67, 0.55], SHADOW, "belly_keel");
  box([0.28, 0.045, 0.72], [0, 0.94, 0.82], MID, "engine_deck");
  box([0.34, 0.035, 0.36], [0, 0.98, 1.33], CYAN, "cowling_panel");

  // Main swept wings: horizontal extrusions in the X/Z plane.
  const wingOutline: [number, number][] = [
    [0, -0.32],
    [1.76, -0.12],
    [2.12, 0.12],
    [1.98, 0.28],
    [0.42, 0.42],
    [0, 0.35],
  ];

  for (const s of [-1, 1]) {
    const wing = b.extrude(wingOutline, {
      at: [s * 0.05, 0.68, 0.22],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.075,
      bevel: 0.018,
      color: BLUE,
      bone: airframe,
      name: s > 0 ? "mainWingL" : "mainWingR",
    });

    // Pale leading-edge strip.
    b.sweep(
      polyline([
        wing.local([s * 0.08, 0.38, 0]),
        wing.local([s * 1.7, 0.12, 0]),
        wing.local([s * 2.02, 0.2, 0]),
      ]),
      0.018,
      { bone: airframe, color: LIGHT, caps: "flat", name: s > 0 ? "wingLeadingL" : "wingLeadingR" },
    );

    // Wing panel seams.
    for (const x of [0.48, 0.9, 1.32, 1.7]) {
      rod(
        [s * x, 0.735, 0.1],
        [s * x, 0.735, 0.39 - x * 0.08],
        0.006,
        CYAN,
        s > 0 ? `wingRibL${x}` : `wingRibR${x}`,
      );
    }

    // RAF-style cyanotype roundels, layered discs on the upper wing.
    cyl(0.27, 0.018, [s * 1.18, 0.735, 0.08], PAPER, s > 0 ? "roundelOuterL" : "roundelOuterR");
    cyl(0.17, 0.021, [s * 1.18, 0.748, 0.08], RED, s > 0 ? "roundelRedL" : "roundelRedR");
    cyl(0.075, 0.024, [s * 1.18, 0.762, 0.08], INK, s > 0 ? "roundelBlueL" : "roundelBlueR");
  }

  // Tailplanes.
  const tailPlane: [number, number][] = [
    [0, -0.22],
    [0.88, -0.1],
    [1.05, 0.04],
    [0.92, 0.19],
    [0, 0.25],
  ];
  for (const s of [-1, 1]) {
    b.extrude(tailPlane, {
      at: [s * 0.02, 0.84, -1.56],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.045,
      bevel: 0.01,
      color: MID,
      bone: airframe,
      name: s > 0 ? "tailplaneL" : "tailplaneR",
    });
    rod([s * 0.18, 0.88, -1.75], [s * 0.82, 0.88, -1.57], 0.007, LIGHT, s > 0 ? "tailHingeL" : "tailHingeR");
  }

  // Vertical fin and rudder, drawn in the Y/Z plane.
  b.extrude(
    [
      [0, 0],
      [0.08, 0.12],
      [0.1, 0.6],
      [0.2, 0.9],
      [0.36, 0.98],
      [0.3, 0.18],
      [0.2, 0],
    ],
    {
      at: [0, 0.82, -1.82],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.014,
      color: BLUE,
      bone: airframe,
      name: "verticalTail",
    },
  );
  rod([0, 1.0, -1.7], [0, 1.65, -1.35], 0.009, LIGHT, "finLeadingEdge");
  rod([0, 0.98, -1.35], [0, 1.02, -1.85], 0.009, CYAN, "rudderHinge");

  // Cockpit fairing and framed canopy.
  box([0.34, 0.08, 0.48], [0, 0.96, 0.75], SHADOW, "cockpitSill");
  sphere(0.25, [0, 1.02, 0.75], GLASS, "canopy", [0.82, 0.55, 1.4]);
  box([0.025, 0.18, 0.54], [0, 1.18, 0.74], LIGHT, "canopySpine");
  for (const s of [-1, 1]) {
    rod([s * 0.08, 1.08, 0.48], [s * 0.17, 1.08, 0.98], 0.012, PAPER, s > 0 ? "canopyFrameL" : "canopyFrameR");
    rod([s * 0.17, 1.08, 0.98], [s * 0.17, 1.02, 0.55], 0.009, CYAN, s > 0 ? "canopyRearFrameL" : "canopyRearFrameR");
  }

  // Engine cowling rings and nose.
  cyl(0.19, 0.06, [0, 0.87, 1.56], LIGHT, "cowlingRing1", [0, 0, 1], 12);
  cyl(0.17, 0.07, [0, 0.87, 1.71], CYAN, "cowlingRing2", [0, 0, 1], 12);
  cyl(0.12, 0.09, [0, 0.87, 1.87], BLUE, "noseRing", [0, 0, 1], 10);
  b.spike([0, 0.87, 1.91], [0, 0, 1], 0.24, 0.105, {
    bone: airframe,
    color: MID,
    name: "spinner",
    caps: "point",
  });

  // Twelve engine ventilation slats around the cowling.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.cos(a) * 0.155;
    const y = 0.87 + Math.sin(a) * 0.155;
    box([0.018, 0.045, 0.18], [x, y, 1.62], PAPER, `cowlingSlat${i}`, [0, a, 0]);
  }

  // Four-bladed propeller, each blade a chunky blueprint silhouette.
  const propBlade: [number, number][] = [
    [0.02, -0.03],
    [0.09, 0.02],
    [0.68, 0.12],
    [0.86, 0.02],
    [0.58, -0.08],
    [0.12, -0.1],
  ];
  for (let i = 0; i < 4; i++) {
    const a = i * 90;
    b.extrude(propBlade, {
      at: [0, 0.87, 2.08],
      x: [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180), 0],
      y: [-Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180), 0],
      thickness: 0.032,
      bevel: 0.008,
      color: i % 2 ? PAPER : LIGHT,
      bone: airframe,
      name: `propBlade${i}`,
    });
  }
  cyl(0.11, 0.12, [0, 0.87, 2.08], RED, "propBoss", [0, 0, 1], 12);
  cyl(0.05, 0.13, [0, 0.87, 2.16], INK, "propCap", [0, 0, 1], 10);

  // Landing gear, wheels, and axle fairings.
  for (const s of [-1, 1]) {
    rod([s * 0.25, 0.62, 0.2], [s * 0.48, 0.2, 0.25], 0.026, SHADOW, s > 0 ? "mainGearL" : "mainGearR");
    cyl(0.13, 0.055, [s * 0.5, 0.14, 0.25], INK, s > 0 ? "wheelL" : "wheelR", [1, 0, 0], 12);
    cyl(0.065, 0.062, [s * 0.5, 0.14, 0.25], LIGHT, s > 0 ? "hubL" : "hubR", [1, 0, 0], 10);
    rod([s * 0.38, 0.31, 0.23], [s * 0.6, 0.31, 0.23], 0.018, CYAN, s > 0 ? "gearFairingL" : "gearFairingR");
  }
  rod([0, 0.5, -1.82], [0, 0.15, -1.88], 0.022, SHADOW, "tailGear");
  cyl(0.09, 0.045, [0, 0.095, -1.9], INK, "tailWheel", [1, 0, 0], 10);

  // Blueprint-style panel lines along the fuselage.
  for (const z of [-1.55, -1.05, -0.45, 0.2, 0.72, 1.16]) {
    b.ring(body.at(Math.max(0, Math.min(1, (z + 2.15) / 4.33))), {
      count: 12,
      radius: 0.002,
      fromDeg: 0,
      toDeg: 360,
    }, (at) => {
      b.part(new THREE.SphereGeometry(0.009, 5, 4), LIGHT, {
        frame: at,
        name: `fuselageRivet${z}`,
        flat: true,
      });
    });
  }

  // Small rows of rivets on the wings.
  for (const s of [-1, 1]) {
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 7; i++) {
        const x = 0.42 + i * 0.22;
        const z = 0.08 + row * 0.09;
        sphere(0.012, [s * x, 0.733, z], PAPER, `wingRivet${s > 0 ? "L" : "R"}_${row}_${i}`);
      }
    }
  }

  // Aileron and elevator hinge lines.
  for (const s of [-1, 1]) {
    rod([s * 0.52, 0.76, 0.35], [s * 1.72, 0.76, 0.18], 0.008, WHITE, s > 0 ? "aileronLineL" : "aileronLineR");
    rod([s * 0.2, 0.9, -1.68], [s * 0.82, 0.9, -1.56], 0.008, WHITE, s > 0 ? "elevatorLineL" : "elevatorLineR");
  }

  // Blueprint annotation-like bars and ID stripes.
  for (const z of [-0.2, -0.05, 0.1]) {
    box([0.19, 0.012, 0.035], [0, 0.965, z], PAPER, `deckMark${z}`);
  }
  box([0.02, 0.025, 0.42], [0, 0.77, -1.92], LIGHT, "tailSerial");
  for (const s of [-1, 1]) {
    box([0.012, 0.025, 0.26], [s * 0.72, 0.77, 0.08], PAPER, s > 0 ? "wingStencilL" : "wingStencilR");
  }

  // Blueprint datum ticks floating just above the ground around the aircraft.
  for (let i = -5; i <= 5; i++) {
    const z = i * 0.45;
    box([0.012, 0.006, 0.12], [1.95, 0.006, z], CYAN, `datumR${i}`);
    box([0.012, 0.006, 0.12], [-1.95, 0.006, z], CYAN, `datumL${i}`);
  }

  return b.root;
}
