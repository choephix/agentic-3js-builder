```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Emperor dragonfly",
  description:
    "Emperor dragonfly hovering over a pond: electric blue segmented abdomen with black dorsal marks, apple-green thorax, huge turquoise compound eyes, four glassy golden-tinted wings with a dark vein net, six legs tucked beneath.",
};

type P = [number, number, number];

const Y = 0.25; // hover height above the pond, metres

const BLUE = "#1c6bff";
const TAIL = "#0b2fb3";
const BLACK = "#101010";
const GREEN = "#9ccf3e";
const TURQ = "#22c3c0";
const GLINT = "#8ff7ea";
const WING = "#eee3b4";
const VEIN = "#1a1a1a";
const LEG = "#2a2a2a";

function mix(a: P, c: P, t: number): P {
  return [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
}

function mirror(p: P): P {
  return [-p[0], p[1], p[2]];
}

// Position along a polyline edge, p in [0, n-1] (fractional index).
function sampleEdge(edge: P[], p: number): P {
  const i = Math.min(Math.floor(p), edge.length - 2);
  return mix(edge[i], edge[i + 1], p - i);
}

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly" });

  // Root joint: the body sits at hover height.
  b.joint("body", { at: [0, Y, 0] });

  // ---- Head: two huge turquoise compound eyes that wrap the head ----
  const eyeZ = 0.03;
  for (const s of [1, -1]) {
    const x = s * 0.0068;
    b.part(new THREE.SphereGeometry(0.0125, 14, 10), TURQ, {
      at: [x, Y + 0.006, eyeZ],
      scale: [1.0, 1.05, 1.15],
    });
    // Facet glints across the eye surface
    for (const [gx, gy, gz] of [
      [0.0045, 0.0095, 0.0105],
      [0.0095, 0.0035, 0.0095],
      [0.0025, 0.0005, 0.0125],
    ] as P[]) {
      b.part(new THREE.SphereGeometry(0.0021, 6, 5), GLINT, {
        at: [s * 0.0068 + s * (gx - 0.0068) * 0.5, Y + 0.006 + gy, eyeZ + gz - 0.004],
      });
    }
  }

  // ---- Thorax: apple green, stout and rounded ----
  b.part(new THREE.SphereGeometry(0.0095, 12, 9), GREEN, {
    at: [0, Y + 0.004, 0.012],
    scale: [1.0, 1.1, 1.5],
  });
  // Dark shoulder stripes on the thorax top
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.0036, 0.002, 0.0065), BLACK, {
      at: [s * 0.0032, Y + 0.0132, 0.012],
    });
  }

  // ---- Abdomen: long, slim, segmented, electric blue with dorsal marks ----
  const segSpacing = 0.0082;
  const zAt = (k: number) => -0.010 - segSpacing * k;
  const radii = [0.0062, 0.0064, 0.0060, 0.0056, 0.0052, 0.0048, 0.0044, 0.0041, 0.0040, 0.0047];

  const abdPts: P[] = [];
  for (let k = 0; k <= 10; k++) abdPts.push([0, Y, zAt(k)]);
  b.chain("abdomen", abdPts);

  for (let k = 0; k < 10; k++) {
    const r = radii[k];
    const color = k >= 8 ? TAIL : BLUE;
    const a: P = [0, Y, zAt(k)];
    const c: P = [0, Y, zAt(k + 1)];

    const seg = b.sweep([a, c], r, { color });
    // Rounded joint between segments
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: a });

    // Black dorsal mark on top of each segment, seated on the surface
    const zm = (zAt(k) + zAt(k + 1)) / 2;
    const hit = b.surface(seg).nearest([0, Y + r, zm]);
    b.stick(new THREE.BoxGeometry(0.0030, 0.0010, 0.0046), BLACK, hit);
  }
  // Tail tip: a small dark cap
  b.part(new THREE.SphereGeometry(0.0036, 8, 6), BLACK, { at: [0, Y, zAt(10)] });

  // ---- Wings: four glassy wings held flat and wide ----
  const WY = Y + 0.014;

  const forewingLead: P[] = [
    [0.004, WY, 0.012],
    [0.020, WY, 0.017],
    [0.040, WY, 0.016],
    [0.056, WY, 0.011],
    [0.062, WY, 0.003],
  ];
  const forewingTrail: P[] = [
    [0.004, WY, 0.005],
    [0.020, WY, 0.008],
    [0.040, WY, 0.006],
    [0.055, WY, 0.001],
    [0.058, WY, -0.005],
  ];
  const hindwingLead: P[] = [
    [0.004, WY, -0.002],
    [0.020, WY, 0.000],
    [0.038, WY, -0.003],
    [0.050, WY, -0.009],
    [0.054, WY, -0.018],
  ];
  const hindwingTrail: P[] = [
    [0.004, WY, -0.012],
    [0.020, WY, -0.016],
    [0.036, WY, -0.020],
    [0.046, WY, -0.023],
    [0.050, WY, -0.030],
  ];

  const wingPairs: [P[], P[]][] = [
    [forewingLead, forewingTrail],
    [hindwingLead, hindwingTrail],
  ];

  for (const [lead, trail] of wingPairs) {
    for (const side of [1, -1]) {
      const A = side > 0 ? lead : lead.map(mirror);
      const B = side > 0 ? trail : trail.map(mirror);

      // Membrane skin with a faint golden sheen
      b.membrane(A, B, { color: WING });

      // Longitudinal veins
      for (const f of [0.33, 0.66]) {
        const path: P[] = A.map((p, i) => mix(p, B[i], f));
        b.sweep(path, 0.0006, { color: VEIN });
      }

      // Cross veins making the fine net
      for (let p = 0.5; p <= 3.5; p += 0.5) {
        const a = sampleEdge(A, p);
        const c = sampleEdge(B, p);
        b.sweep([a, c], 0.0005, { color: VEIN });
      }

      // Dark pterostigma near the forewing tip
      if (lead === forewingLead) {
        const ps = mix(sampleEdge(A, 3.6), sampleEdge(B, 3.6), 0.3);
        b.part(new THREE.BoxGeometry(0.0055, 0.0008, 0.0022), VEIN, { at: ps });
      }
    }
  }

  // ---- Six thin legs, tucked forward under the thorax ----
  const legZ = [0.016, 0.006, -0.004];
  const legNames = ["F", "M", "R"];
  for (let i = 0; i < 3; i++) {
    for (const side of [1, -1]) {
      const z = legZ[i];
      const s = side;
      const hip: P = [s * 0.006, Y - 0.008, z];
      const knee: P = [s * 0.017, Y - 0.020, z + 0.008];
      const foot: P = [s * 0.009, Y - 0.030, z + 0.016];
      const name = `leg${legNames[i]}${side > 0 ? "L" : "R"}`;
      b.chain(name, [hip, knee, foot]);
      b.sweep([hip, knee, foot], 0.0007, { color: LEG });
      b.part(new THREE.SphereGeometry(0.0011, 6, 5), LEG, { at: knee });
    }
  }

  return b.root;
}
```