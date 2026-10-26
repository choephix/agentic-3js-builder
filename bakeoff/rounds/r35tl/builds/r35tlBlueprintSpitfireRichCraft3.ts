import * as THREE from "three";
import { createBuilder, catmull, svg } from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with elliptical wings, cockpit canopy, propeller, tailplane, wheels, panel lines, and RAF roundels.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#061f3b";
  const BLUE = "#0a3158";
  const MID = "#14527d";
  const CYAN = "#63e7ef";
  const PALE = "#b9ffff";
  const GLOW = "#80f7ff";
  const DARK = "#031426";
  const RED = "#ef6e72";

  const fuselagePath = catmull([
    [0, 1.34, -5.15],
    [0, 1.43, -4.35],
    [0, 1.48, -2.8],
    [0, 1.53, -0.8],
    [0, 1.56, 1.2],
    [0, 1.57, 2.65],
    [0, 1.58, 3.45],
    [0, 1.58, 4.0],
    [0, 1.56, 4.45],
  ]);

  const fuselage = b.sweep(fuselagePath, (t) => {
    const r = Math.sin(Math.PI * Math.min(1, Math.max(0, t * 1.08))) ** 0.42;
    return [0.18 + 0.62 * r, 0.18 + 0.60 * r];
  }, {
    color: BLUE,
    caps: "round",
    sides: 8,
    name: "fuselage",
    group: "airframe",
  });

  // A subtle lighter belly panel makes the aircraft silhouette readable in blueprint style.
  b.sweep(fuselagePath, (t) => 0.18 + 0.6 * Math.sin(Math.PI * Math.min(1, t * 1.08)) ** 0.42, {
    color: MID,
    sectors: [[112, 248, MID]],
    sides: 8,
    caps: "none",
    name: "belly-panel",
    group: "airframe",
  });

  // Fuselage panel rings and blueprint contour bands.
  for (const z of [-4.55, -3.6, -2.45, -1.15, 0.25, 1.55, 2.55, 3.45]) {
    const r = 0.18 + 0.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, (z + 5.15) / 9.6))) ** 0.42;
    b.part(
      new THREE.TorusGeometry(r * 0.97, 0.012, 5, 16),
      CYAN,
      { at: [0, 1.55, z], rotation: [Math.PI / 2, 0, 0], name: `fuselage-ring-${z}`, group: "blueprint-lines" },
    );
  }

  const wingOutline: [number, number][] = [
    [0, -1.55],
    [1.7, -1.38],
    [4.35, -0.82],
    [5.45, 0.05],
    [5.2, 0.42],
    [3.9, 0.72],
    [2.05, 1.05],
    [0, 1.2],
  ];

  for (const side of [-1, 1]) {
    b.extrude(wingOutline.map(([x, z]) => [side * x, z] as [number, number]), {
      at: [0, 1.42, -0.1],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.12, 0.055],
      bevel: 0.025,
      smoothing: 1,
      color: BLUE,
      name: side < 0 ? "starboard-wing" : "port-wing",
      group: "wings",
    });

    // Leading-edge highlight, trailing edge, and aileron division.
    b.rod(
      [side * 0.5, 1.57, -1.48],
      [side * 5.05, 1.57, 0.32],
      0.018,
      CYAN,
      { name: `wing-leading-edge-${side}`, group: "blueprint-lines" },
    );
    b.rod(
      [side * 1.9, 1.48, 0.9],
      [side * 4.95, 1.48, 0.42],
      0.014,
      PALE,
      { name: `wing-trailing-edge-${side}`, group: "blueprint-lines" },
    );
    b.rod(
      [side * 3.3, 1.53, 0.55],
      [side * 4.72, 1.53, 0.38],
      0.012,
      CYAN,
      { name: `aileron-line-${side}`, group: "blueprint-lines" },
    );

    // Wing root fairing.
    b.sweep(catmull([
      [side * 0.15, 1.52, -1.0],
      [side * 0.72, 1.5, -0.65],
      [side * 1.35, 1.49, 0.25],
      [side * 1.8, 1.48, 0.8],
    ]), [0.12, 0.06], {
      color: MID,
      caps: "round",
      sides: 6,
      name: `wing-root-fairing-${side}`,
      group: "airframe",
    });
  }

  // Tailplane and vertical fin.
  const tailOutline: [number, number][] = [
    [0, -4.25],
    [1.35, -4.18],
    [2.45, -3.75],
    [2.18, -3.38],
    [1.1, -3.52],
    [0, -3.38],
  ];
  for (const side of [-1, 1]) {
    b.extrude(tailOutline.map(([x, z]) => [side * x, z] as [number, number]), {
      at: [0, 1.55, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.08, 0.035],
      bevel: 0.015,
      color: MID,
      name: side < 0 ? "tailplane-right" : "tailplane-left",
      group: "tail",
    });
    b.rod(
      [side * 0.28, 1.62, -4.1],
      [side * 2.25, 1.62, -3.76],
      0.013,
      CYAN,
      { name: `tailplane-line-${side}`, group: "blueprint-lines" },
    );
  }

  b.extrude([
    [-0.09, -4.28],
    [-0.09, -3.75],
    [-0.72, -3.45],
    [-0.62, -2.95],
    [0.62, -2.95],
    [0.72, -3.45],
    [0.09, -3.75],
    [0.09, -4.28],
  ], {
    at: [0, 1.55, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.08,
    bevel: 0.015,
    color: MID,
    name: "vertical-fin",
    group: "tail",
  });

  b.rod([0, 1.58, -4.2], [0, 2.75, -3.08], 0.018, CYAN, {
    name: "fin-leading-edge",
    group: "blueprint-lines",
  });
  b.rod([0, 1.57, -3.12], [0, 1.57, -4.22], 0.012, PALE, {
    name: "tail-spine-line",
    group: "blueprint-lines",
  });

  // Cockpit tub, armored headrest, and framed canopy.
  b.part(new THREE.BoxGeometry(0.82, 0.2, 1.15), DARK, {
    at: [0, 1.84, 1.0],
    name: "cockpit-tub",
    group: "cockpit",
  });
  b.part(new THREE.SphereGeometry(0.46, 10, 6), MID, {
    at: [0, 1.95, 0.15],
    scale: [0.95, 0.72, 1.55],
    name: "headrest",
    group: "cockpit",
  });
  const canopy = b.part(new THREE.SphereGeometry(0.57, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), CYAN, {
    at: [0, 2.03, 1.32],
    scale: [0.9, 0.58, 1.42],
    name: "blue-canopy",
    group: "cockpit",
  });
  b.rod([-0.43, 2.05, 0.82], [-0.48, 2.08, 1.83], 0.022, PALE, {
    name: "canopy-frame-left",
    group: "blueprint-lines",
  });
  b.rod([0.43, 2.05, 0.82], [0.48, 2.08, 1.83], 0.022, PALE, {
    name: "canopy-frame-right",
    group: "blueprint-lines",
  });
  b.rod([0, 2.48, 0.82], [0, 2.5, 1.82], 0.018, PALE, {
    name: "canopy-frame-center",
    group: "blueprint-lines",
  });

  // Nose spinner and three-bladed propeller.
  b.part(new THREE.ConeGeometry(0.46, 0.72, 10), MID, {
    at: [0, 1.56, 4.72],
    dir: [0, 0, 1],
    name: "spinner",
    group: "engine",
  });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 10), PALE, {
    at: [0, 1.56, 5.08],
    dir: [0, 0, 1],
    name: "prop-hub",
    group: "propeller",
  });

  const blade = [
    [0, 0],
    [0.12, 0.08],
    [0.3, 0.42],
    [0.22, 1.05],
    [0.06, 1.38],
    [-0.05, 1.02],
    [-0.1, 0.42],
  ] as [number, number][];
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const x = Math.cos(a), z = Math.sin(a);
    const px = -z, pz = x;
    const pts = blade.map(([u, v]) => [x * v + px * u, z * v + pz * u] as [number, number]);
    b.extrude(pts, {
      at: [0, 1.56, 5.1],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.035,
      bevel: 0.012,
      color: PALE,
      name: `propeller-blade-${i}`,
      group: "propeller",
    });
  }

  // Exhaust stacks and machine-gun ports.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = 2.15 + i * 0.25;
      b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 6), CYAN, {
        at: [side * 0.49, 1.58, z],
        dir: [side, 0, 0],
        name: `exhaust-${side}-${i}`,
        group: "engine",
      });
    }
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 8), PALE, {
        at: [side * (2.5 + i * 0.38), 1.58, 0.18],
        dir: [0, 1, 0],
        name: `gun-port-${side}-${i}`,
        group: "weapons",
      });
    }
  }

  // RAF-style wing roundels: concentric cyan and red discs.
  for (const side of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.48, 0.48, 0.018, 24), CYAN, {
      at: [side * 3.05, 1.52, -0.18],
      dir: [0, 1, 0],
      name: `roundel-cyan-${side}`,
      group: "markings",
    });
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.024, 20), RED, {
      at: [side * 3.05, 1.54, -0.18],
      dir: [0, 1, 0],
      name: `roundel-red-${side}`,
      group: "markings",
    });
  }

  // Blueprint arrow-like panel markings on the fuselage.
  const markings = svg(`
    <svg viewBox="0 0 256 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 48h176M158 18l34 30-34 30" fill="none" stroke="#b9ffff" stroke-width="7"/>
      <path d="M28 18v60M62 18v60M96 18v60" stroke="#63e7ef" stroke-width="3"/>
    </svg>`, { size: 256 });

  b.part(new THREE.PlaneGeometry(0.7, 0.26), PALE, {
    at: [0.64, 1.63, -1.15],
    dir: [1, 0, 0],
    axis: "z",
    texture: markings,
    name: "fuselage-blueprint-mark",
    group: "markings",
  });

  // Main landing gear and wheels, resting just above y=0.
  for (const side of [-1, 1]) {
    b.rod([side * 1.25, 1.34, -0.3], [side * 1.35, 0.34, -0.42], 0.055, MID, {
      name: `landing-strut-${side}`,
      group: "landing-gear",
    });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 10), DARK, {
      at: [side * 1.38, 0.23, -0.46],
      dir: [1, 0, 0],
      name: `wheel-${side}`,
      group: "landing-gear",
    });
    b.part(new THREE.TorusGeometry(0.16, 0.018, 5, 12), CYAN, {
      at: [side * 1.45, 0.23, -0.46],
      rotation: [0, Math.PI / 2, 0],
      name: `wheel-rim-${side}`,
      group: "blueprint-lines",
    });
  }

  b.rod([0, 1.34, -3.55], [0, 0.22, -3.72], 0.045, MID, {
    name: "tail-wheel-strut",
    group: "landing-gear",
  });
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 8), DARK, {
    at: [0, 0.11, -3.75],
    dir: [1, 0, 0],
    name: "tail-wheel",
    group: "landing-gear",
  });

  // Fine longitudinal blueprint lines.
  for (const side of [-1, 1]) {
    b.rod([side * 0.18, 1.72, -4.1], [side * 0.28, 1.75, 3.55], 0.008, CYAN, {
      name: `fuselage-longitudinal-${side}`,
      group: "blueprint-lines",
    });
    b.rod([side * 0.3, 1.42, -1.1], [side * 4.75, 1.42, 0.25], 0.008, CYAN, {
      name: `wing-chord-line-${side}`,
      group: "blueprint-lines",
    });
  }

  return b.root;
}
