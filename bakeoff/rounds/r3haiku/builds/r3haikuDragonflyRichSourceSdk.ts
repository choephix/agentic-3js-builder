import * as THREE from "three";
import { createBuilder, frame, mottle, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Emperor dragonfly",
  description: "An emperor dragonfly hovering with wings spread flat: electric-blue abdomen, apple-green thorax, turquoise wraparound eyes and veined golden-sheen wings.",
};

const BLUE = "#1f7bff";
const DEEP = "#0a3fb0";
const BLACK = "#0b0d12";
const GREEN = "#9be03c";
const GREEN_DEEP = "#6fbf2a";
const TURQ = "#2ec9c4";
const TURQ_DEEP = "#127d8c";

/** Forewing and hindwing drawn as one vein net with a golden sheen, tip at the top of the image. */
function wingSvg(): string {
  const hw = (u: number) => 4 + 3 * Math.sin(Math.PI * 0.9 * u);
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const y = 100 - 98 * u;
    const w = hw(u);
    left.push(`${(12 - w).toFixed(2)},${y.toFixed(2)}`);
    right.push(`${(12 + w).toFixed(2)},${y.toFixed(2)}`);
  }
  const lines: string[] = [];
  for (let k = -3; k <= 3; k++) {
    lines.push(`<line x1="${(12 + k * 1.2).toFixed(2)}" y1="100" x2="${(12 + k * 0.8).toFixed(2)}" y2="4"/>`);
  }
  for (let y = 8; y <= 96; y += 4) {
    const w = hw((100 - y) / 98);
    lines.push(`<line x1="${(12 - w).toFixed(2)}" y1="${y}" x2="${(12 + w).toFixed(2)}" y2="${(y + 1.2).toFixed(2)}"/>`);
  }
  const stigma = hw(0.12);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 100">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff1c2" stop-opacity="0.72"/>
      <stop offset="0.5" stop-color="#cfeaff" stop-opacity="0.62"/>
      <stop offset="1" stop-color="#ffd98a" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <polygon points="${[...left, ...right.reverse()].join(" ")}" fill="url(#sheen)" stroke="#1b2a36" stroke-width="0.35"/>
  <g stroke="#1b2a36" stroke-width="0.16" opacity="0.85">${lines.join("")}</g>
  <rect x="${(12 + stigma - 3.2).toFixed(2)}" y="12" width="3" height="4.5" fill="#4a2e12"/>
</svg>`;
}

/** Blue abdomen with a black dorsal line and black dorsal blotches on alternate segments. */
const abdomen = paint((_p, _n, s) => {
  const t = s[0];
  const deg = s[1];
  const dorsal = Math.min(deg, 360 - deg);
  const seg = Math.floor(t * 10);
  const f = (t * 10) % 1;
  if (dorsal < 22) return BLACK;
  if (dorsal < 50 && f > 0.35 && f < 0.7 && seg % 2 === 1) return BLACK;
  return seg % 2 === 0 ? BLUE : DEEP;
});

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly", paintSize: 1024 });

  // Skeleton: thorax is the root, the head and the abdomen chain hang from it.
  b.joint("thorax", { at: [0, 0.07, 0] });
  b.joint("head", { at: [0, 0.072, 0.022], parent: "thorax", role: "head" });

  // Thorax: a fat, apple-green egg with mottled blue-green patches.
  b.loft(
    [
      { at: [0, 0.07, -0.014], w: 0.006, h: 0.007 },
      { at: [0, 0.07, -0.004], w: 0.013, h: 0.013 },
      { at: [0, 0.072, 0.008], w: 0.014, h: 0.014 },
      { at: [0, 0.072, 0.017], w: 0.01, h: 0.01 },
    ],
    {
      color: mottle(GREEN, GREEN_DEEP, { size: 0.012 }),
      bone: "thorax",
      name: "thorax",
    },
  );

  // Abdomen: a long slim chain of eight joints, tapering to the tip.
  const tail = b.chain(
    "tail",
    [
      [0, 0.07, -0.016],
      [0, 0.07, -0.085],
    ],
    { parent: "thorax", count: 8, role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.0034 - 0.0011 * t + 0.0009 * Math.sin(Math.PI * Math.min(t * 1.1, 1)), {
    color: abdomen,
    sides: 8,
    name: "abdomen",
  });

  // Claspers at the tail tip.
  b.spike([0.0009, 0.07, -0.083], [0.5, -0.25, -1], 0.009, 0.0013, { color: BLACK, name: "clasperL" });
  b.spike([-0.0009, 0.07, -0.083], [-0.5, -0.25, -1], 0.009, 0.0013, { color: BLACK, name: "clasperR" });

  // Eyes: huge turquoise spheres that meet over the top of the head.
  const eyePaint = mottle(TURQ, TURQ_DEEP, { size: 0.005 });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0088, b.segments(14), b.segments(10)), eyePaint, {
      at: [sx * 0.0048, 0.0745, 0.0205],
      bone: "head",
      name: sx > 0 ? "eyeL" : "eyeR",
    });
  }

  // Six thin legs, three pairs, folded under the thorax.
  const legSets: Array<[string, number[][]]> = [
    [
      "F",
      [
        [0.005, 0.066, 0.014],
        [0.014, 0.05, 0.024],
        [0.006, 0.043, 0.032],
      ],
    ],
    [
      "M",
      [
        [0.005, 0.065, 0.002],
        [0.015, 0.049, 0.008],
        [0.01, 0.042, 0.014],
      ],
    ],
    [
      "H",
      [
        [0.005, 0.063, -0.012],
        [0.014, 0.049, -0.01],
        [0.009, 0.042, -0.004],
      ],
    ],
  ];
  for (const [k, pts] of legSets) {
    for (const [s, sx] of [
      ["L", 1],
      ["R", -1],
    ] as const) {
      const path = pts.map(([x, y, z]) => [x * sx, y, z] as [number, number, number]);
      const name = `leg${k}${s}`;
      const leg = b.chain(name, path, {
        parent: "thorax",
        names: [`hip${k}${s}`, `knee${k}${s}`, `foot${k}${s}`],
        role: "leg",
      });
      b.sweep(leg, 0.0007, { color: "#15171c", sides: 6, name });
    }
  }

  // Wings: four vein-net cards lying flat and spread wide, forewing and hindwing on each side.
  const wingTexture = svg(wingSvg(), { size: 256 });
  const wingKinds = [
    { x: 0.004, z: 0.01, w: 0.0105, h: 0.05, fz: 0.18, name: "forewing" },
    { x: 0.004, z: -0.006, w: 0.0125, h: 0.046, fz: -0.12, name: "hindwing" },
  ];
  for (const sx of [1, -1]) {
    for (const wg of wingKinds) {
      b.cards([frame([sx * wg.x, 0.086, wg.z], [0, 1, 0])], wingTexture, {
        size: [wg.w, wg.h],
        lean: 90,
        flow: [sx, 0, wg.fz],
        bone: "thorax",
        name: `${wg.name}${sx > 0 ? "L" : "R"}`,
      });
    }
  }

  return b.root;
}
