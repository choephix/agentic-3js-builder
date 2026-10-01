import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { svg } from "../src/texture";
import { paint } from "../src/paint";
import { glow } from "../kits/glow";

export const meta = {
  name: "Synthwave Hoverbike",
  description:
    "Riderless 1980s synthwave hoverbike: glossy black-magenta fairing, neon trim, glowing hover pads and twin thrusters.",
};

const BLACK = "#0b0b14";
const MAGENTA = "#c4009e";
const PINK = "#ff2bd6";
const CYAN = "#00eaff";
const HOTPINK = "#ff1a6c";
const CHROME = "#c9d2dc";
const DARKCHROME = "#5a6470";
const GLASS = "#1a2b4a";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "synthwaveHoverbike" });

  const chassis = b.joint("chassis", { at: [0, 0.78, 0] });
  const steer = b.joint("steer", {
    parent: chassis,
    at: [0, 1.0, 0.62],
    dir: [0, -1, 0.15],
    role: "hinge",
  });
  const padL = b.joint("padL", { parent: chassis, at: [0.3, 0.44, 0.1], dir: [0, -1, 0], role: "hinge" });
  const padR = b.joint("padR", { parent: chassis, at: [-0.3, 0.44, 0.1], dir: [0, -1, 0], role: "hinge" });
  const flapL = b.joint("flapL", { parent: chassis, at: [0.14, 0.88, -1.06], dir: [0, 0.2, -1], role: "hinge" });
  const flapR = b.joint("flapR", { parent: chassis, at: [-0.14, 0.88, -1.06], dir: [0, 0.2, -1], role: "hinge" });

  // ---- main fairing ----
  const bodyPaint = paint((p, _n, _s) => {
    const nose = Math.max(0, (p.z - 0.4) / 0.75);
    const tail = Math.max(0, (-p.z - 0.55) / 0.55);
    if (nose > 0.55 || tail > 0.62) return MAGENTA;
    return BLACK;
  });
  b.loft(
    [
      { at: [0, 0.8, 1.1], w: 0.12, h: 0.12 },
      { at: [0, 0.8, 0.85], w: 0.32, h: 0.28 },
      { at: [0, 0.83, 0.4], w: 0.46, h: 0.36 },
      { at: [0, 0.83, -0.1], w: 0.52, h: 0.38 },
      { at: [0, 0.81, -0.6], w: 0.48, h: 0.36 },
      { at: [0, 0.79, -1.0], w: 0.38, h: 0.32 },
    ],
    { bone: chassis, color: bodyPaint },
  );

  // Rounded nose cap
  b.part(new THREE.SphereGeometry(0.09, 10, 8), MAGENTA, {
    bone: chassis,
    at: [0, 0.8, 1.1],
    scale: [0.8, 0.8, 1.0],
  });

  // Canopy windshield: glossy blue glass bubble, proud of the body
  b.part(new THREE.SphereGeometry(0.22, 12, 8), GLASS, {
    bone: chassis,
    at: [0, 1.08, 0.28],
    scale: [0.85, 0.55, 1.4],
  });
  // glowing canopy base rim sitting on the body top
  glow(
    b.part(new THREE.TorusGeometry(0.2, 0.015, 6, 16), CYAN, {
      bone: chassis,
      at: [0, 1.0, 0.28],
      rotation: [90, 0, 0],
      scale: [1, 1.4, 1],
    }),
    1.5,
  );

  // Headlamp at nose front
  b.part(new THREE.CylinderGeometry(0.095, 0.105, 0.07, 12), CHROME, {
    bone: chassis,
    at: [0, 0.78, 1.12],
    dir: [0, -0.05, 1],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.07, 12, 8), "#fff6d8", {
      bone: chassis,
      at: [0, 0.78, 1.15],
      scale: [1, 1, 0.5],
    }),
    2.2,
  );
  glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), CYAN, { bone: chassis, at: [0, 0.862, 1.1] }), 1.8);
  // ---- neon trim: flank lines hugging the body surface ----
  for (const s of [1, -1]) {
    const col = s > 0 ? CYAN : PINK;
    glow(
      b.sweep(
        [
          [s * 0.17, 0.74, 1.0],
          [s * 0.25, 0.78, 0.5],
          [s * 0.28, 0.78, -0.1],
          [s * 0.26, 0.76, -0.65],
          [s * 0.2, 0.74, -0.97],
        ],
        0.013,
        { bone: chassis, color: col },
      ),
      1.8,
    );
    glow(
      b.sweep(
        [
          [s * 0.12, 0.95, 0.75],
          [s * 0.22, 1.0, 0.3],
          [s * 0.25, 1.0, -0.3],
          [s * 0.22, 0.95, -0.75],
        ],
        0.009,
        { bone: chassis, color: HOTPINK },
      ),
      1.8,
    );
  }

  // ---- handlebars on steering joint, swept back toward the saddle ----
  b.capsule([0, 1.0, 0.52], [0, 1.2, 0.56], 0.03, { bone: steer, color: DARKCHROME });
  for (const s of [1, -1]) {
    b.capsule([s * 0.02, 1.2, 0.56], [s * 0.28, 1.2, 0.52], 0.022, { bone: steer, color: CHROME });
    b.capsule([s * 0.28, 1.2, 0.52], [s * 0.36, 1.18, 0.32], 0.028, { bone: steer, color: BLACK });
    glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), CYAN, { bone: steer, at: [s * 0.37, 1.18, 0.3] }), 1.8);
  }
  glow(b.part(new THREE.BoxGeometry(0.18, 0.025, 0.06), PINK, { bone: steer, at: [0, 1.19, 0.58] }), 1.6);

  // ---- saddle ----
  b.part(new THREE.BoxGeometry(0.32, 0.12, 0.6), BLACK, { bone: chassis, at: [0, 1.02, -0.35] });
  glow(b.part(new THREE.BoxGeometry(0.34, 0.03, 0.62), HOTPINK, { bone: chassis, at: [0, 0.97, -0.35] }), 1.2);
  // saddle backrest hump
  b.part(new THREE.SphereGeometry(0.12, 10, 8), MAGENTA, {
    bone: chassis,
    at: [0, 1.05, -0.66],
    scale: [1.2, 0.7, 0.8],
  });

  // ---- hover pads: stacked so every layer touches ----
  for (const [s, j] of [
    [1, padL],
    [-1, padR],
  ] as const) {
    const pad = j as typeof padL;
    b.capsule([s * 0.2, 0.66, 0.1], [s * 0.3, 0.5, 0.1], 0.04, { bone: chassis, color: DARKCHROME });
    // pad body 0.40..0.50
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.1, 10), MAGENTA, {
      bone: pad,
      at: [s * 0.3, 0.45, 0.1],
      scale: [1, 1, 1.6],
    });
    // glow ring 0.36..0.40 touches body bottom
    glow(
      b.part(new THREE.CylinderGeometry(0.145, 0.165, 0.04, 10), CYAN, {
        bone: pad,
        at: [s * 0.3, 0.38, 0.1],
        scale: [1, 1, 1.6],
      }),
      2.0,
    );
    // white-hot core 0.30..0.355 touches ring bottom (lowest = 0.30)
    glow(
      b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.055, 8), "#ffffff", {
        bone: pad,
        at: [s * 0.3, 0.328, 0.1],
        scale: [1, 1, 1.6],
      }),
      2.5,
    );
  }

  // ---- twin exhaust thrusters + flaps ----
  for (const [s, fj] of [
    [1, flapL],
    [-1, flapR],
  ] as const) {
    const f = fj as typeof flapL;
    // dark nozzle shell: wide opening at the rear
    b.part(new THREE.CylinderGeometry(0.13, 0.11, 0.35, 10), DARKCHROME, {
      bone: chassis,
      at: [s * 0.14, 0.79, -0.95],
      dir: [0, 0, -1],
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), HOTPINK, {
        bone: chassis,
        at: [s * 0.14, 0.79, -1.12],
        dir: [0, 0, -1],
      }),
      2.5,
    );
    glow(
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 8), "#ffd9ec", {
        bone: chassis,
        at: [s * 0.14, 0.79, -1.12],
        dir: [0, 0, -1],
      }),
      2.5,
    );
    // flap plate standing above the nozzle on its hinge joint
    b.extrude(
      [
        [-0.04, 0],
        [0.04, 0],
        [0.03, 0.16, "sharp"],
        [-0.03, 0.16, "sharp"],
      ],
      { at: [s * 0.14, 0.9, -1.02], thickness: 0.02, color: BLACK, bone: f },
    );
  }

  // ---- tail fins: broad faces sideways, neon on trailing edge ----
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [-0.35, 0.02],
        [-0.42, 0.3, "sharp"],
        [-0.1, 0.12],
      ],
      { at: [s * 0.16, 0.92, -0.68], thickness: 0.025, bevel: 0.005, color: BLACK, bone: chassis },
    );
    glow(b.rod([s * 0.16, 0.96, -1.0], [s * 0.16, 1.2, -1.07], 0.01, { bone: chassis, color: CYAN }), 1.8);
  }
  b.extrude(
    [
      [0, 0],
      [-0.3, 0],
      [-0.36, 0.34, "sharp"],
      [-0.05, 0.1],
    ],
    { at: [0, 0.95, -0.72], x: [0, 0, -1], thickness: 0.025, bevel: 0.005, color: MAGENTA, bone: chassis },
  );

  // ---- sunset-gradient decals on both flanks ----
  const sunset = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ff1a6c"/><stop offset="0.5" stop-color="#ff7b2b"/><stop offset="1" stop-color="#ffe14d"/>
      </linearGradient></defs>
      <circle cx="64" cy="38" r="22" fill="url(#g)"/>
      <rect x="34" y="34" width="60" height="3" fill="#0b0b14"/>
      <rect x="34" y="40" width="60" height="3" fill="#0b0b14"/>
      <rect x="34" y="46" width="60" height="2.5" fill="#0b0b14"/>
      <rect x="0" y="56" width="128" height="2" fill="#00eaff"/>
      <rect x="0" y="60" width="128" height="2" fill="#ff2bd6"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.decal(chassis, sunset, {
      at: [s * 0.27, 0.82, -0.15],
      dir: [-s, 0, 0],
      size: [0.55, 0.28],
      bone: chassis,
    });
  }

  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.7), CHROME, { bone: chassis, at: [0, 0.62, -0.1] });

  return b.root;
}
