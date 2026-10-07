import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Hover Muscle Car",
  description:
    "A retro-future two-door muscle car parked on four gimballed hover thruster pods, with quad headlamps, a graphite-and-orange racing stripe, a raked fastback and twin rear thruster nozzles.",
  style: "Overwatch",
  commit: "b816db2",
};

// Crisp colour blocking: pearl white and graphite over one strong accent (safety orange).
// Cyan and red are light, not paint: thruster glow and lamps.
const BODY = "#eef2f4";
const GRAPH = "#2b3139";
const DARK = "#171b21";
const TRIM = "#b9c3ca";
const ORANGE = "#ff6a1a";
const GLASS = "#16262f";
const GLASS_HI = "#4d7184";
const CYAN = "#8ff5ff";
const LAMP = "#f4ffff";
const RED = "#ff3d26";

const wrap = (v: number, m: number) => ((v % m) + m) % m;

// Body panels are keyed to model-space point p and outward normal n, so every part sharing a paint lines up.
const bodyPaint = paint((p, n) => {
  if (p.y < 0.36) return GRAPH; // lower rocker and skirt
  if (n.z > 0.8) {
    // nose: slatted grille between the lamps
    if (Math.abs(p.x) < 0.25 && p.y > 0.4 && p.y < 0.6) return wrap(p.y, 0.024) < 0.012 ? DARK : GRAPH;
    return BODY;
  }
  if (n.z < -0.8) return p.y < 0.66 ? GRAPH : BODY; // tail valance
  if (Math.abs(n.x) > 0.8) {
    // flanks
    if (p.y > 0.5 && p.y < 0.56) return ORANGE; // accent stripe
    if (p.z > 1.0 && p.z < 1.36 && p.y > 0.4 && p.y < 0.48) return wrap(p.y, 0.02) < 0.01 ? DARK : BODY; // intake louvres
    if (Math.abs(p.y - 0.84) < 0.008) return GRAPH; // belt line
    if ((Math.abs(p.z - 0.88) < 0.008 || Math.abs(p.z + 0.23) < 0.008) && p.y < 0.84) return GRAPH; // door gaps
  }
  return BODY;
});

const hoodPaint = paint((p, n) => {
  if (n.z > 0.8) return GRAPH;
  if (n.y > 0.8) {
    const a = Math.abs(p.x);
    if (a > 0.3 && a < 0.37) return ORANGE; // twin racing stripes
    if (a > 0.385 && a < 0.4) return GRAPH; // pinstripe
  }
  return BODY;
});

const cabinPaint = paint((p, n) => {
  if (n.y > 0.95) return BODY; // roof
  if (Math.abs(n.x) > 0.8) {
    // side glass with a B-pillar; the surround is body colour
    const inside = p.y > 0.88 && p.y < 1.16 && p.z < 0.78 && p.z > -1.38;
    if (!inside || Math.abs(p.z + 0.4) < 0.05) return BODY;
  }
  return wrap(p.z * 0.9 + p.y * 1.6, 0.45) < 0.07 ? GLASS_HI : GLASS;
});

const podPaint = paint((p) => {
  if (p.y < 0.06) return DARK; // nozzle lip
  if (p.y > 0.1 && p.y < 0.13) return ORANGE; // accent band
  if (p.y > 0.36) return GRAPH; // gimbal cap
  return BODY;
});

const sigil = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="47" fill="${ORANGE}"/><path d="M18 60 L50 28 L82 60 L72 60 L50 38 L28 60 Z" fill="${DARK}"/><path d="M18 80 L50 48 L82 80 L72 80 L50 58 L28 80 Z" fill="${DARK}"/></svg>`,
  { size: 128 },
);

const plate = svg(
  `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="352" height="112" rx="14" fill="#f3f0e6" stroke="${DARK}" stroke-width="6"/><rect x="20" y="86" width="320" height="10" fill="${ORANGE}"/><text x="180" y="66" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="46" fill="${DARK}">VX-7 HOVER</text></svg>`,
  { size: 512 },
);

// Half-profile of one hover pod (radius, height), spun about its vertical axis.
const POD: [number, number][] = [
  [0, 0.02],
  [0.11, 0.02],
  [0.14, 0.0],
  [0.19, 0.05],
  [0.2, 0.12],
  [0.2, 0.3],
  [0.22, 0.34],
  [0.22, 0.37],
  [0.18, 0.4],
  [0, 0.4],
];

export default function build() {
  const b = createBuilder({ name: "hoverMuscleCar", paintSize: 2048 });

  // Skeleton: a root hull with hinged doors, hood, rear wing and four gimballed thruster pods.
  const hull = b.joint("hull", { at: [0, 0.5, 0], role: "spine" });
  const hood = b.joint("hood", { parent: hull, at: [0, 0.7, 2.24], role: "hinge" });
  const doorJ = {
    L: b.joint("doorL", { parent: hull, at: [0.93, 0.58, 0.86], role: "hinge" }),
    R: b.joint("doorR", { parent: hull, at: [-0.93, 0.58, 0.86], role: "hinge" }),
  };
  const wing = b.joint("wing", { parent: hull, at: [0, 0.98, -1.98], role: "hinge" });
  const pods = [
    { name: "podFL", x: 0.8, z: 1.46 },
    { name: "podFR", x: -0.8, z: 1.46 },
    { name: "podRL", x: 0.8, z: -1.46 },
    { name: "podRR", x: -0.8, z: -1.46 },
  ].map((p) => ({ ...p, joint: b.joint(p.name, { parent: hull, at: [p.x, 0.4, p.z], role: "hinge" }) }));

  // Main hull: a side profile extruded across the car with bevelled edges, tapering from wide haunches to narrower shoulders.
  b.extrude(
    [
      [2.34, 0.3],
      [2.33, 0.62],
      [1.7, 0.68],
      [0.92, 0.74],
      [-1.2, 0.84],
      [-1.95, 0.8],
      [-2.3, 0.7],
      [-2.36, 0.3],
    ],
    { at: [0, 0, 0], thickness: [1.92, 1.66], bevel: 0.05, smoothing: 1, color: bodyPaint, bone: hull, name: "hull" },
  );

  // Greenhouse: fastback glass with a body-coloured roof and pillars.
  b.extrude(
    [
      [1.0, 0.7],
      [0.4, 1.24],
      [0.26, 1.31],
      [-0.58, 1.32],
      [-1.1, 1.04],
      [-1.62, 0.84],
      [-1.64, 0.7],
    ],
    { at: [0, 0, 0], thickness: [1.66, 1.2], bevel: 0.035, smoothing: 1, color: cabinPaint, bone: hull, name: "cabin" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.025, 0.02, 0.8).translate(s * 0.58, 1.3, -0.2), TRIM, { bone: hull, at: [0, 0, 0] });
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Fender haunches flaring out over the wheel-less sides.
    b.extrude(
      [
        [-0.85, 0.4],
        [-2.22, 0.4],
        [-2.34, 0.62],
        [-2.22, 0.86],
        [-0.85, 0.86],
      ],
      { at: [s * 0.95, 0, 0], thickness: 0.1, bevel: 0.03, smoothing: 1, color: bodyPaint, bone: hull, name: `haunchRear${side}` },
    );
    b.extrude(
      [
        [1.0, 0.4],
        [2.05, 0.4],
        [2.2, 0.6],
        [2.05, 0.82],
        [1.0, 0.82],
      ],
      { at: [s * 0.93, 0, 0], thickness: 0.1, bevel: 0.03, smoothing: 1, color: bodyPaint, bone: hull, name: `haunchFront${side}` },
    );
    glow(b.part(new THREE.BoxGeometry(0.025, 0.05, 0.07).translate(s * 0.99, 0.6, 2.12), ORANGE, { bone: hull, at: [0, 0, 0] }), 1.2);
    glow(b.part(new THREE.BoxGeometry(0.025, 0.05, 0.07).translate(s * 1.01, 0.6, -2.2), RED, { bone: hull, at: [0, 0, 0] }), 1.2);
    const bolts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 7; i++) bolts.push(new THREE.SphereGeometry(0.011, 6, 4).translate(s * 1.0, 0.47, -0.95 - i * 0.19));
    for (let i = 0; i < 3; i++) bolts.push(new THREE.SphereGeometry(0.011, 6, 4).translate(s * 0.98, 0.45, 1.5 + i * 0.18));
    b.part(mergeGeometries(bolts), TRIM, { bone: hull, at: [0, 0, 0], name: `bolts${side}` });

    // Door: hinged at its leading edge, with a door handle and a wing mirror that swing with it.
    const j = s > 0 ? doorJ.L : doorJ.R;
    const door = b.extrude(
      [
        [0.86, 0.36],
        [-0.22, 0.36],
        [-0.22, 0.8],
        [0.86, 0.8],
      ],
      { at: [s * 0.93, 0, 0], thickness: 0.06, bevel: 0.012, smoothing: 1, color: bodyPaint, bone: j, name: `door${side}` },
    );
    b.decal(door, sigil, { at: [s * 0.97, 0.66, 0.3], dir: [s, 0, 0], size: [0.22, 0.22] });
    b.part(new THREE.BoxGeometry(0.03, 0.025, 0.14).translate(s * 0.975, 0.62, -0.06), DARK, { bone: j, at: [0, 0, 0] });
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.13).translate(s * 0.98, 0.84, 0.92), DARK, { bone: j, at: [0, 0, 0] });

    // Quad headlamps: a silver bezel and a cool lens for each.
    for (const x of [0.36, 0.66]) {
      b.part(new THREE.CylinderGeometry(0.105, 0.11, 0.04, 20), TRIM, {
        bone: hull,
        at: [s * x, 0.5, 2.335],
        dir: [0, 0, 1],
      });
      glow(
        b.part(new THREE.CircleGeometry(0.085, 20), LAMP, {
          bone: hull,
          at: [s * x, 0.5, 2.358],
          dir: [0, 0, 1],
          axis: "z",
        }),
        1.4,
      );
    }

    // Twin rear thruster nozzles, each with a trim ring and a glowing core.
    b.part(new THREE.CylinderGeometry(0.15, 0.12, 0.22, 18), DARK, { bone: hull, at: [s * 0.45, 0.44, -2.4], dir: [0, 0, -1] });
    b.part(new THREE.CylinderGeometry(0.165, 0.165, 0.025, 18), TRIM, { bone: hull, at: [s * 0.45, 0.44, -2.49], dir: [0, 0, -1] });
    glow(
      b.part(new THREE.CircleGeometry(0.1, 18), CYAN, {
        bone: hull,
        at: [s * 0.45, 0.44, -2.515],
        dir: [0, 0, -1],
        axis: "z",
      }),
      1.4,
    );
  }

  // Hood: hinged at the nose, with a dark scoop in the centre.
  b.extrude(
    [
      [2.26, 0.68],
      [2.28, 0.76],
      [1.3, 0.84],
      [1.0, 0.84],
      [1.0, 0.72],
    ],
    { at: [0, 0, 0], thickness: 1.46, bevel: 0.02, smoothing: 1, color: hoodPaint, bone: hood, name: "hood" },
  );
  b.frustumBox([0, 0.83, 1.9], [0, 0.83, 1.46], [0.5, 0.1], [0.42, 0.08], { bone: hood, color: DARK });
  b.part(new THREE.BoxGeometry(0.46, 0.02, 0.03).translate(0, 0.885, 1.9), TRIM, { bone: hood, at: [0, 0, 0] });

  // Rear wing on a hinge: a dark plate on two uprights, with orange end plates.
  b.extrude(
    [
      [-1.92, 1.0],
      [-2.28, 1.0],
      [-2.3, 1.04],
      [-1.92, 1.08],
    ],
    { at: [0, 0, 0], thickness: 1.3, bevel: 0.01, color: DARK, bone: wing, name: "wing" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.22, 0.08).translate(s * 0.42, 0.9, -2.05), DARK, { bone: wing, at: [0, 0, 0] });
    b.part(new THREE.BoxGeometry(0.03, 0.14, 0.34).translate(s * 0.655, 1.02, -2.1), ORANGE, { bone: wing, at: [0, 0, 0] });
  }

  // Hover pods: each a lathe with a recessed nozzle, six louvre fins and a glowing core, on its own gimbal joint.
  for (const p of pods) {
    b.lathe(POD, {
      at: [p.x, 0, p.z],
      bone: p.joint,
      axis: [0, 1, 0],
      segments: 16,
      smoothing: 0,
      color: podPaint,
      name: `${p.name}Body`,
    });
    const fins: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.016, 0.13, 0.05);
      g.rotateY(a);
      g.translate(p.x + Math.sin(a) * 0.205, 0.27, p.z + Math.cos(a) * 0.205);
      fins.push(g);
    }
    b.part(mergeGeometries(fins), DARK, { bone: p.joint, at: [0, 0, 0], name: `${p.name}Louvres` });
    b.part(new THREE.TorusGeometry(0.205, 0.012, 6, 16).rotateX(Math.PI / 2).translate(p.x, 0.385, p.z), TRIM, {
      bone: p.joint,
      at: [0, 0, 0],
      name: `${p.name}Gimbal`,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.1, 20), CYAN, {
        bone: p.joint,
        at: [p.x, 0.012, p.z],
        dir: [0, -1, 0],
        axis: "z",
      }),
      1.6,
    );
  }

  // Light bar across the nose and tail, under-body glow and the roof aerial.
  b.part(new THREE.BoxGeometry(1.16, 0.025, 0.03).translate(0, 0.36, 2.36), CYAN, { bone: hull, at: [0, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(1.46, 0.04, 0.03).translate(0, 0.64, -2.33), RED, { bone: hull, at: [0, 0, 0] }), 1.2);
  glow(b.part(new THREE.BoxGeometry(0.06, 0.02, 3.2).translate(0, 0.285, 0), CYAN, { bone: hull, at: [0, 0, 0] }), 1.2);
  b.frustumBox([0, 0.31, 2.26], [0, 0.31, 2.4], [1.46, 0.05], [1.4, 0.05], { bone: hull, color: DARK });
  b.part(new THREE.BoxGeometry(1.5, 0.05, 0.12).translate(0, 0.305, -2.3), DARK, { bone: hull, at: [0, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6).translate(0, 1.43, -0.3), DARK, { bone: hull, at: [0, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.022, 8, 6).translate(0, 1.55, -0.3), ORANGE, { bone: hull, at: [0, 0, 0] }), 1.5);

  // Rear plate on the tail valance.
  b.part(new THREE.PlaneGeometry(0.34, 0.11), "#ffffff", {
    bone: hull,
    at: [0, 0.5, -2.345],
    dir: [0, 0, -1],
    axis: "z",
    texture: plate,
  });

  return b.root;
}
