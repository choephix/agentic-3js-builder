import * as THREE from "three";
import { createBuilder, grain, mottle, svg } from "../../../../src/index";

export const meta = {
  name: "Clockwork dog",
  description:
    "A brass-and-iron wind-up dog: a verdigris-patched brass body, exposed gears, rivets, a clock-face decal on each flank, a winding key and a banded spring tail.",
};

const BRASS = "#c8903e";
const BRASS_DARK = "#8a5a22";
const IRON = "#34302c";
const RUBY = "#d42a1c";
const PATINA = "#4f9a84";

/** Gear outline: two points per tooth, alternating tip and root radius. */
function gear(teeth: number, outer: number, root: number): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outer : root;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

export default function clockworkDog() {
  const b = createBuilder({ name: "clockwork-dog", paintSize: 1024 });

  // Paint: brass grain running along the body, with verdigris patina blotches.
  const bodyPaint = mottle(grain(BRASS, BRASS_DARK, { size: 0.05, axis: "z", seed: 3 }), PATINA, {
    size: 0.16,
    seed: 7,
    contrast: 1.6,
  });

  // Skeleton: torso root, neck, head, hinged lower jaw.
  b.joint("torso", { at: [0, 0.4, 0], dir: [0, 0, 1], role: "spine" });

  const body = b.loft(
    [
      { at: [0, 0.39, -0.36], w: 0.1, h: 0.12 },
      { at: [0, 0.41, -0.22], w: 0.2, h: 0.2 },
      { at: [0, 0.41, 0.0], w: 0.24, h: 0.22 },
      { at: [0, 0.4, 0.18], w: 0.2, h: 0.2 },
      { at: [0, 0.39, 0.27], w: 0.15, h: 0.17 },
    ],
    { color: bodyPaint, bone: "torso", name: "body" },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.4, 0.2],
      [0, 0.47, 0.29],
      [0, 0.55, 0.37],
    ],
    { parent: "torso", names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  b.sweep(neck, [0.085, 0.07, 0.065], { color: bodyPaint, name: "neck" });

  // Brass collar where neck meets body.
  b.lathe(
    [
      [0.095, -0.012],
      [0.108, -0.012],
      [0.108, 0.012],
      [0.095, 0.012],
    ],
    { color: BRASS, at: [0, 0.47, 0.29], axis: [0, 0.66, 0.75], bone: "neck2", name: "collar" },
  );

  b.joint("head", { parent: "neckTip", at: [0, 0.55, 0.37], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.5, 0.42], dir: [0, 0, 1], role: "jaw" });

  // Head: skull, snout, nose, ruby eyes in brass rims, and a hinged brass lower jaw.
  b.capsule([0, 0.55, 0.3], [0, 0.56, 0.44], [0.09, 0.075], { color: bodyPaint, bone: "head", name: "skull" });
  b.capsule([0, 0.54, 0.43], [0, 0.5, 0.6], [0.06, 0.045], { color: bodyPaint, bone: "head", name: "snout" });
  b.part(new THREE.SphereGeometry(0.03, b.segments(10), b.segments(8)), IRON, {
    at: [0, 0.5, 0.6],
    bone: "head",
    name: "nose",
  });
  for (const side of [1, -1]) {
    const x = side * 0.05;
    b.part(new THREE.SphereGeometry(0.024, b.segments(10), b.segments(8)), RUBY, {
      at: [x, 0.58, 0.46],
      bone: "head",
      name: side > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.TorusGeometry(0.03, 0.008, b.segments(6), b.segments(12)), BRASS, {
      at: [x, 0.58, 0.455],
      bone: "head",
      name: side > 0 ? "eyeRimL" : "eyeRimR",
    });
    b.spike([x * 1.2, 0.6, 0.33], [side * 0.3, 1, -0.45], 0.13, 0.035, {
      color: IRON,
      bone: "head",
      name: side > 0 ? "earL" : "earR",
    });
  }
  b.capsule([0, 0.48, 0.42], [0, 0.46, 0.58], [0.04, 0.032], { color: BRASS_DARK, bone: "jaw", name: "jawLower" });

  // Legs: a chain per leg, iron sweep, brass paw on the ankle joint.
  const leg = (side: "L" | "R", x: number, joints: [string, string, string], z: [number, number, number]) => {
    const names = joints.map((j) => `${j}${side}`) as [string, string, string];
    const chain = b.chain(`leg${names[0]}`, [
      [x, 0.4, z[0]],
      [x, 0.22, z[1]],
      [x, 0.06, z[2]],
    ], { parent: "torso", names, role: "leg" });
    b.sweep(chain, [0.06, 0.04, 0.03], { color: IRON, name: `leg${names[0]}` });
    b.capsule([x, 0.035, z[2] + 0.01], [x, 0.035, z[2] + 0.07], [0.036, 0.03], {
      color: BRASS,
      bone: names[2],
      name: `paw${names[2]}`,
    });
  };
  for (const side of ["L", "R"] as const) {
    const x = side === "L" ? 0.11 : -0.11;
    leg(side, x, ["shoulder", "elbow", "wrist"], [0.14, 0.15, 0.14]);
    leg(side, x, ["hip", "knee", "hock"], [-0.2, -0.22, -0.19]);
  }

  // Tail: a banded brass-and-iron spring that curls up.
  const tail = b.chain(
    "tail",
    [
      [0, 0.42, -0.33],
      [0, 0.47, -0.46],
      [0, 0.56, -0.53],
      [0, 0.66, -0.55],
    ],
    { parent: "torso", names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, [0.042, 0.03, 0.02, 0.012], {
    bands: [
      [0.22, BRASS],
      [0.4, IRON],
      [0.6, BRASS],
      [0.78, IRON],
      [1, BRASS],
    ],
    name: "tail",
  });

  // Clockwork: two meshing-looking gears on each flank, with axles.
  b.extrude(gear(12, 0.05, 0.04), {
    color: BRASS,
    at: [0.12, 0.43, -0.02],
    x: [0, 1, 0],
    y: [0, 0, 1],
    thickness: 0.018,
    bevel: 0.004,
    bone: "torso",
    name: "gearBig",
  });
  b.lathe(
    [
      [0, -0.01],
      [0.014, -0.01],
      [0.014, 0.025],
      [0, 0.025],
    ],
    { color: IRON, at: [0.12, 0.43, -0.02], axis: [1, 0, 0], bone: "torso", name: "axleBig" },
  );
  b.extrude(gear(9, 0.034, 0.026), {
    color: BRASS,
    at: [0.12, 0.36, 0.06],
    x: [0, 1, 0],
    y: [0, 0, 1],
    thickness: 0.016,
    bevel: 0.003,
    bone: "torso",
    name: "gearSmall",
  });

  // Winding key on the back.
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.035, 0.012],
      [0.012, 0.02],
      [0.012, 0.07],
      [0.03, 0.08],
      [0.03, 0.09],
      [0, 0.09],
    ],
    { color: BRASS, at: [0, 0.5, -0.06], axis: [0, 1, 0], bone: "torso", name: "windingKey" },
  );

  // Clock-face decals on both flanks, drawn as SVG.
  const dial = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#f1dca0" stroke="#4a2e10" stroke-width="6"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#8a5a22" stroke-width="2"/>
      <g stroke="#4a2e10" stroke-width="4" stroke-linecap="round">
        <line x1="50" y1="16" x2="50" y2="24"/>
        <line x1="84" y1="50" x2="76" y2="50"/>
        <line x1="50" y1="84" x2="50" y2="76"/>
        <line x1="16" y1="50" x2="24" y2="50"/>
      </g>
      <path d="M50 50 L50 28 M50 50 L66 60" stroke="#2a1a08" stroke-width="5" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="6" fill="#c8903e" stroke="#4a2e10" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(body, dial, {
    at: [0.12, 0.42, 0.16],
    dir: [1, 0, 0],
    up: [0, 1, 0],
    size: [0.1, 0.1],
    name: "clockFaceL",
  });
  b.decal(body, dial, {
    at: [-0.12, 0.42, 0.16],
    dir: [-1, 0, 0],
    up: [0, 1, 0],
    size: [0.1, 0.1],
    mirror: true,
    name: "clockFaceR",
  });

  // Rivets along both flanks, kept clear of the gears and clock faces.
  const surface = b.surface(body);
  const rivet = new THREE.SphereGeometry(0.009, b.segments(6), b.segments(4));
  const holes: Array<[number, number, number]> = [
    [-0.02, 0.43, 0.07],
    [0.06, 0.36, 0.06],
    [0.16, 0.42, 0.1],
  ];
  for (const y of [0.33, 0.47]) {
    for (let z = -0.3; z <= 0.24; z += 0.06) {
      if (holes.some(([hz, hy, r]) => Math.hypot(z - hz, y - hy) < r)) continue;
      for (const side of [1, -1]) {
        const hit = surface.ray([side, y, z], [-side, 0, 0]);
        if (hit) b.stick(rivet, BRASS, hit, { embed: 0.45, name: "rivet" });
      }
    }
  }

  return b.root;
}
