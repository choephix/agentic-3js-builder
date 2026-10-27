import * as THREE from "three";
import { createBuilder, catmull, polyline, svg } from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint model.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#062c46";
  const DEEP = "#041c31";
  const BLUE = "#0b5274";
  const MID = "#167da0";
  const LIGHT = "#62d5e6";
  const PAPER = "#b7f0ec";
  const GLASS = "#163e66";
  const Y = 0.22;

  const box = (size: [number, number, number], at: [number, number, number], color = BLUE, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, ...opts });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color = BLUE,
    dir: [number, number, number] = [0, 1, 0],
    opts: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 12, 1), color, {
      at,
      dir,
      ...opts,
    });

  // Main airframe: a long faceted elliptical fuselage, nose toward +Z.
  const fuselagePath = catmull([
    [0, 1.02, -4.25],
    [0, 1.05, -3.35],
    [0, 1.08, -2.1],
    [0, 1.12, -0.55],
    [0, 1.22, 1.15],
    [0, 1.26, 2.35],
    [0, 1.15, 3.25],
    [0, 0.94, 3.82],
    [0, 0.60, 4.18],
  ]);

  const fuselage = b.sweep(
    fuselagePath,
    (t) => {
      if (t < 0.14) return [0.38 + t * 0.35, 0.34 + t * 0.3];
      if (t < 0.42) return [0.53, 0.44];
      if (t < 0.72) return [0.62, 0.50];
      return [0.62 - (t - 0.72) * 1.6, 0.5 - (t - 0.72) * 1.3];
    },
    {
      color: BLUE,
      section: "box",
      sides: 8,
      caps: "round",
      name: "faceted-fuselage",
    },
  );

  // Pale underside belly panel, evocative of blueprint sectional shading.
  b.sweep(fuselagePath.slice(0.16, 0.9), (t) => [0.535, 0.445], {
    color: (t: number) => (t < 0.66 ? MID : BLUE),
    section: "box",
    sectors: [[112, 248, PAPER]],
    caps: "flat",
    name: "belly-panel",
  });

  // Wing roots and elegant elliptical wings, swept slightly backward.
  const wingL = polyline([
    [0.18, 1.08, 1.15],
    [1.55, 0.99, 0.88],
    [4.95, 0.72, 0.12],
    [5.32, 0.62, -0.42],
    [2.65, 0.88, -0.24],
    [0.25, 1.08, 0.72],
  ], { closed: true });

  const wingR = polyline([
    [-0.18, 1.08, 1.15],
    [-1.55, 0.99, 0.88],
    [-4.95, 0.72, 0.12],
    [-5.32, 0.62, -0.42],
    [-2.65, 0.88, -0.24],
    [-0.25, 1.08, 0.72],
  ], { closed: true });

  b.sweep(wingL, 0.12, { color: MID, section: "box", caps: "flat", name: "left-wing" });
  b.sweep(wingR, 0.12, { color: MID, section: "box", caps: "flat", name: "right-wing" });

  // Wingtip navigation lights.
  b.part(new THREE.SphereGeometry(0.16, 8, 5), LIGHT, { at: [5.05, 0.68, 0.02], flat: true });
  b.part(new THREE.SphereGeometry(0.16, 8, 5), LIGHT, { at: [-5.05, 0.68, 0.02], flat: true });

  // Tailplane and vertical fin.
  const tailL = polyline([
    [0.1, 1.0, -2.72],
    [1.42, 0.99, -3.05],
    [2.55, 0.88, -3.62],
    [1.25, 0.96, -3.78],
    [0.1, 1.0, -3.25],
  ], { closed: true });

  const tailR = polyline([
    [-0.1, 1.0, -2.72],
    [-1.42, 0.99, -3.05],
    [-2.55, 0.88, -3.62],
    [-1.25, 0.96, -3.78],
    [-0.1, 1.0, -3.25],
  ], { closed: true });

  b.sweep(tailL, 0.09, { color: BLUE, section: "box", caps: "flat", name: "left-tailplane" });
  b.sweep(tailR, 0.09, { color: BLUE, section: "box", caps: "flat", name: "right-tailplane" });

  b.extrude(
    [
      [-0.06, 0],
      [0.06, 0],
      [0.42, 0.34],
      [0.53, 1.42],
      [0.31, 2.18],
      [-0.02, 2.02],
      [-0.15, 0.65],
    ],
    {
      at: [0, 1.03, -3.12],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.14,
      bevel: 0.025,
      color: MID,
      name: "vertical-tail",
    },
  );

  // Canopy: low faceted cockpit with a pale-blue frame and dark glass.
  b.part(new THREE.SphereGeometry(0.78, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), GLASS, {
    at: [0, 1.68, -0.12],
    scale: [0.72, 0.55, 1.22],
    rotation: [-0.12, 0, 0],
    flat: true,
    name: "cockpit-glass",
  });

  box([0.12, 0.66, 1.72], [0, 1.67, -0.06], LIGHT, {
    name: "canopy-spine",
    rotation: [0, 0, 0],
  });
  box([1.35, 0.08, 0.10], [0, 1.43, 0.65], LIGHT, { name: "canopy-front-frame" });
  box([1.22, 0.08, 0.10], [0, 1.46, -0.79], LIGHT, { name: "canopy-rear-frame" });

  // Nose spinner and three broad propeller blades.
  cyl(0.52, 0.62, [0, 1.05, 4.25], LIGHT, [0, 0, 1], { name: "spinner" });
  const propHub = cyl(0.18, 0.28, [0, 1.05, 4.63], PAPER, [0, 0, 1], { name: "propeller-hub" });

  for (const angle of [0, 120, 240]) {
    const a = (angle * Math.PI) / 180;
    const x = Math.cos(a) * 1.32;
    const y = 1.05 + Math.sin(a) * 1.32;
    b.part(new THREE.BoxGeometry(0.23, 2.42, 0.065), LIGHT, {
      at: [x, y, 4.68],
      rotation: [0, 0, -a],
      flat: true,
      name: `propeller-blade-${angle}`,
    });
    b.part(new THREE.BoxGeometry(0.30, 0.08, 0.08), PAPER, {
      at: [Math.cos(a) * 1.98, 1.05 + Math.sin(a) * 1.98, 4.69],
      rotation: [0, 0, -a],
      name: `propeller-tip-${angle}`,
    });
  }

  // Exhaust stacks along both sides of the nose.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const z = 2.62 + i * 0.22;
      cyl(0.055, 0.24, [s * 0.58, 1.18, z], INK, [s, 0, 0], {
        name: `exhaust-${s}-${i}`,
        rotation: [0, 0.18 * s, 0],
      });
    }
  }

  // Radiator chin and wing-root fairings.
  box([0.72, 0.28, 0.72], [0, 0.72, 2.88], DEEP, { name: "radiator-chin" });
  for (const s of [-1, 1]) {
    b.sweep(
      [
        [s * 0.34, 0.95, 1.32],
        [s * 0.75, 0.82, 0.92],
        [s * 1.38, 0.70, 0.45],
      ],
      [0.20, 0.13],
      { color: BLUE, section: "box", caps: "round", name: `wing-fairing-${s}` },
    );
  }

  // Blueprint-style national roundels on the upper wings: concentric flat discs.
  const roundel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#b7f0ec" stroke="#062c46" stroke-width="4"/>
      <circle cx="50" cy="50" r="30" fill="#167da0" stroke="#062c46" stroke-width="3"/>
      <circle cx="50" cy="50" r="15" fill="#062c46"/>
    </svg>`,
    { size: 256 },
  );

  for (const s of [-1, 1]) {
    b.part(new THREE.CircleGeometry(0.52, 24), PAPER, {
      at: [s * 2.85, 0.86, 0.42],
      dir: [0, 1, 0],
      axis: "z",
      texture: roundel,
      rotation: [0, 0, s * 0.16],
      name: `wing-roundel-${s}`,
    });
  }

  // Blueprint labels and fine linework as thin structural strips.
  const line = (a: [number, number, number], c: [number, number, number], r = 0.018, color = LIGHT, name = "blueprint-line") =>
    b.rod(a, c, r, { color, caps: "flat", name });

  line([-4.7, 0.86, 0.03], [-1.7, 1.04, 0.72], 0.018, LIGHT, "left-wing-spar");
  line([4.7, 0.86, 0.03], [1.7, 1.04, 0.72], 0.018, LIGHT, "right-wing-spar");
  line([-2.32, 0.96, -3.56], [-0.42, 1.08, -2.91], 0.014, LIGHT, "left-tail-spar");
  line([2.32, 0.96, -3.56], [0.42, 1.08, -2.91], 0.014, LIGHT, "right-tail-spar");

  // Ground-contact landing gear, chunky but subordinate to the aircraft.
  for (const s of [-1, 1]) {
    line([s * 1.05, 0.92, 0.68], [s * 1.18, 0.34, 0.52], 0.075, INK, `main-strut-${s}`);
    cyl(0.20, 0.11, [s * 1.23, 0.20, 0.47], INK, [1, 0, 0], { name: `main-wheel-${s}` });
  }
  line([0, 0.74, 3.05], [0, 0.29, 3.16], 0.055, INK, "tail-strut");
  cyl(0.13, 0.08, [0, 0.14, 3.18], INK, [1, 0, 0], { name: "tail-wheel" });

  // Small blueprint registration bars and a tail serial plate.
  box([0.62, 0.035, 0.035], [0, 1.48, -2.92], PAPER, { name: "tail-marking" });
  box([0.36, 0.025, 0.025], [0, 1.50, -3.04], LIGHT, { name: "tail-marking-small" });

  return b.root;
}
