import * as THREE from "three";
import { cells, createBuilder, mix, noise, paint, smoothstep } from "../../../../src/index";
import type { OutlineInput } from "../../../../src/index";

export const meta = {
  name: "Emperor dragonfly",
  description: "An emperor dragonfly hovering level, electric-blue abdomen, apple-green thorax, turquoise eyes and four veined glassy wings.",
};

const BLUE = "#1f6fe8";
const BLACK = "#11151b";
const GREEN = "#9ed36a";
const TURQ = "#2ad4c8";
const GLASS = "#e4f2f7";
const VEIN = "#22323c";
const GOLD = "#e9c46a";

/** Glassy wing: a fine Voronoi net of dark veins over a faint golden sheen. */
function wingPaint(seed: number) {
  return paint((p) => {
    const c = cells(p, 0.009, seed);
    const vein = smoothstep(0.07, 0.02, c.d2 - c.d1);
    const sheen = smoothstep(0.5, 0.8, noise(p, 0.04, seed));
    return mix(mix(GLASS, GOLD, sheen * 0.35), VEIN, vein * 0.8);
  });
}

const FOREWING: OutlineInput = [
  [0, -0.004],
  [0.02, -0.006],
  [0.05, -0.003],
  [0.056, 0.002],
  [0.042, 0.006],
  [0.012, 0.006],
  [0, 0.002],
];

const HINDWING: OutlineInput = [
  [0, -0.005],
  [0.022, -0.008],
  [0.04, -0.007],
  [0.044, 0],
  [0.032, 0.008],
  [0.01, 0.009],
  [0, 0.004],
];

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly", detail: 1, paintSize: 1024 });

  // Skeleton: thorax is the root, head and abdomen hang off it, wings and legs too.
  b.joint("thorax", { at: [0, 0.2, 0], role: "spine" });
  b.joint("head", { parent: "thorax", at: [0, 0.205, 0.024], role: "head" });

  // Thorax: apple-green body with black shoulder stripes.
  b.part(new THREE.SphereGeometry(0.0095, 12, 8), GREEN, {
    name: "thorax",
    bone: "thorax",
    at: [0, 0.2, 0.004],
    scale: [1.05, 1.05, 1.7],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.0022, 0.0042, 0.0075), BLACK, {
      name: `stripe${s > 0 ? "L" : "R"}`,
      bone: "thorax",
      at: [0.0085 * s, 0.2, 0],
    });
  }

  // Head: dark core under two huge wraparound turquoise eyes.
  b.part(new THREE.SphereGeometry(0.0085, 12, 8), BLACK, { name: "head", bone: "head", at: [0, 0.2, 0.026] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0105, 14, 10), TURQ, {
      name: `eye${s > 0 ? "L" : "R"}`,
      bone: "head",
      at: [0.0058 * s, 0.2065, 0.026],
    });
  }

  // Abdomen: long slim tail-chain, electric blue with a black dorsal stripe and a slightly clubbed tip.
  const abdomen = b.chain(
    "abdomen",
    [
      [0, 0.2, -0.006],
      [0, 0.2, -0.088],
    ],
    { parent: "thorax", count: 5, role: "tail" },
  );
  b.sweep(
    abdomen,
    (t: number) =>
      0.003 + 0.0012 * Math.sin(Math.PI * Math.min(t * 1.1, 1)) + 0.001 * Math.max(0, (t - 0.8) / 0.2),
    {
      name: "abdomen",
      color: BLUE,
      sectors: [[-28, 28, BLACK]],
      sides: 8,
    },
  );

  // Wings: four flat, veined panes held out to each side.
  const wing = (name: string, side: 1 | -1, root: [number, number, number], outline: OutlineInput, seed: number) => {
    const joint = b.joint(name, { parent: "thorax", at: root, role: "wing" });
    b.extrude(outline, {
      name,
      color: wingPaint(seed),
      at: root,
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0004,
      smoothing: 1,
      bone: joint,
    });
  };
  wing("forewingL", 1, [0.003, 0.211, 0.006], FOREWING, 3);
  wing("forewingR", -1, [-0.003, 0.211, 0.006], FOREWING, 5);
  wing("hindwingL", 1, [0.003, 0.211, -0.004], HINDWING, 7);
  wing("hindwingR", -1, [-0.003, 0.211, -0.004], HINDWING, 9);

  // Six thin legs tucked under the body: hip, knee, foot, mirrored left and right.
  const legs: Array<[string, [number, number, number], [number, number, number], [number, number, number]]> = [
    ["legF", [0.004, 0.196, 0.012], [0.016, 0.19, 0.024], [0.01, 0.183, 0.04]],
    ["legM", [0.005, 0.196, 0.0], [0.02, 0.189, -0.002], [0.014, 0.182, 0.012]],
    ["legH", [0.004, 0.196, -0.012], [0.016, 0.188, -0.02], [0.008, 0.183, -0.034]],
  ];
  for (const [name, hip, knee, foot] of legs) {
    for (const s of [1, -1]) {
      const pts = [hip, knee, foot].map(([x, y, z]) => [x * s, y, z]);
      const side = s > 0 ? "L" : "R";
      const chain = b.chain(`${name}${side}`, pts, { parent: "thorax", role: "leg" });
      b.sweep(chain, 0.0007, { name: `${name}${side}`, color: BLACK, sides: 5 });
    }
  }

  return b.root;
}
