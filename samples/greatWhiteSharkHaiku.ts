import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Great White Shark",
  description:
    "A 4.7 m great white shark swimming 0.3 m above the floor. Slate countershaded hull with cut panel seams, a single orange accent on the flank, fin tips, eye lenses and chevron decals, and a jaw with teeth.",
  style: "Overwatch",
  commit: "b816db2",
};

// Body centre height. The belly's lowest point sits on y = 0.30 m, the swimming height.
const YC = 0.67;

// Hull profile along the body: [z, half-width rx, half-height ry] in metres. Nose at +z.
const PROF: readonly (readonly [number, number, number])[] = [
  [-1.9, 0.1, 0.13],
  [-1.5, 0.22, 0.24],
  [-1.0, 0.31, 0.32],
  [-0.3, 0.36, 0.37],
  [0.4, 0.36, 0.37],
  [1.0, 0.34, 0.34],
  [1.4, 0.3, 0.29],
  [1.8, 0.21, 0.2],
  [2.1, 0.12, 0.11],
  [2.3, 0.02, 0.02],
];

function prof(z: number): [number, number] {
  for (let i = 1; i < PROF.length; i++) {
    const [z1, rx1, ry1] = PROF[i];
    if (z <= z1) {
      const [z0, rx0, ry0] = PROF[i - 1];
      const k = (z - z0) / (z1 - z0);
      return [rx0 + (rx1 - rx0) * k, ry0 + (ry1 - ry0) * k];
    }
  }
  const [, rx, ry] = PROF[PROF.length - 1];
  return [rx, ry];
}

// Underside height of the snout at sideways offset x.
function under(x: number, z: number) {
  const [rx, ry] = prof(z);
  return YC - ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
}

// Lower jaw centreline height under the snout.
const jawY = (z: number) => YC - 0.92 * prof(z)[1] - 0.06;

// Palette: cool slate countershade, one hard orange accent.
const BACK = "#2f4a63";
const FLANK = "#7f97ab";
const BELLY = "#eef3f6";
const SEAM = "#16202c";
const VISOR = "#1c2a3b";
const ACCENT = "#ff7a1a";
const FIN = "#34506a";
const STEEL = "#c9d3dc";
const DARK = "#111820";
const TEETH = "#f7f3e8";
const JAW = "#9db0c0";

// Hull: hard three-tone colour blocking, panel seams every 0.46 m, a segmented orange flank stripe, a dark snout visor.
const HULL = paint((p, n) => {
  if (p.z < 1.7 && Math.abs(p.z / 0.46 - Math.round(p.z / 0.46)) * 0.46 < 0.006) return SEAM;
  if (
    Math.abs(n.x) > 0.6 &&
    Math.abs(p.y - (YC - 0.055)) < 0.018 &&
    p.z > -1.55 &&
    p.z < 1.25 &&
    (p.z + 1.55) % 0.9 < 0.78
  )
    return ACCENT;
  if (p.z > 1.6 && n.y > 0.5) return VISOR;
  if (n.y > 0.25) return BACK;
  if (n.y > -0.25) return FLANK;
  return BELLY;
});

// Fins: slate with an orange tip on the marked edge.
const DORSAL_PAINT = paint((_p, _n, s) => (s[1] > 0.4 ? ACCENT : FIN));
const PEC_PAINT = paint((_p, _n, s) => (s[0] > 0.6 ? ACCENT : FIN));
const CAUDAL_PAINT = paint((_p, _n, s) => (s[1] > 0.55 ? ACCENT : FIN));

// Outlines (metres, drawn in each part's own axes; see extrude in docs/api.md).
const DORSAL: OutlinePoint[] = [
  [0.36, 0],
  [0.3, 0.16],
  [0.16, 0.34],
  [0.02, 0.5, "sharp"],
  [-0.14, 0.32],
  [-0.3, 0.1],
  [-0.42, 0],
];
const DORSAL2: OutlinePoint[] = [
  [0.24, 0],
  [0.1, 0.12],
  [-0.02, 0.24, "sharp"],
  [-0.2, 0.08],
  [-0.3, 0],
];
const PECTORAL: OutlinePoint[] = [
  [0, 0],
  [0.3, 0.03],
  [0.6, 0.09],
  [0.735, 0.15, "sharp"],
  [0.525, 0.18],
  [0.26, 0.195],
  [0, 0.165],
];
const PELVIC: OutlinePoint[] = [
  [0, 0],
  [0.3, 0.02],
  [0.24, 0.1, "sharp"],
  [0, 0.09],
];
const ANAL: OutlinePoint[] = [
  [0.26, 0.02],
  [-0.02, -0.06, "sharp"],
  [-0.3, 0.02],
];
const CAUDAL: OutlinePoint[] = [
  [0.2, 0.14],
  [-0.1, 0.32],
  [-0.42, 0.58],
  [-0.62, 0.8, "sharp"],
  [-0.5, 0.42],
  [-0.42, 0.14],
  [-0.5, -0.1],
  [-0.58, -0.3, "sharp"],
  [-0.28, -0.18],
  [0.2, -0.14],
];

// Chevron panel decal for the flanks: dark plate, three orange chevrons.
const CHEV = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 44">
    <rect x="1" y="1" width="118" height="42" rx="7" fill="#141c26"/>
    <rect x="5" y="5" width="110" height="34" rx="4" fill="none" stroke="#ff7a1a" stroke-width="1.5"/>
    <polygon points="16,11 28,22 16,33 22,33 34,22 22,11" fill="#ff7a1a"/>
    <polygon points="46,11 58,22 46,33 52,33 64,22 52,11" fill="#ff7a1a"/>
    <polygon points="76,11 88,22 76,33 82,33 94,22 82,11" fill="#ff7a1a"/>
  </svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "greatWhiteShark", paintSize: 2048 });

  // Skeleton: hips at the body centre, a five-joint spine from tail to head, tail and head off it.
  const hips = b.joint("hips", { at: [0, YC, -0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, YC, -1.9],
      [0, YC, -1.2],
      [0, YC, -0.5],
      [0, YC, 0.2],
      [0, YC, 0.9],
      [0, YC, 1.6],
    ],
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4", "spine5"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[4], at: [0, YC, 1.6], aim: [0, YC, 2.3], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, jawY(1.5), 1.5],
    aim: [0, jawY(1.5), 2.2],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    [
      [0, YC, -1.9],
      [0, YC - 0.01, -2.2],
      [0, YC - 0.03, -2.45],
    ],
    { parent: spine.joints[0], names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );

  // Body: one tapered sweep from the tail to the snout, skinned across the spine and head.
  const bodyPath = polyline(Array.from({ length: 22 }, (_, i) => [0, YC, -1.9 + i * 0.2] as [number, number, number]));
  const body = b.sweep(
    bodyPath,
    (t: number) => {
      const [rx, ry] = prof(-1.9 + 4.2 * t);
      return [rx, ry];
    },
    { bone: [hips, spine, head], sides: 12, color: HULL, caps: { start: "flat", end: "point" } },
  );
  const skin = b.surface(body);

  // Lower jaw: a tapered plate following the snout underside, hinged at the back of the mouth.
  const jawPath = catmull([
    [0, jawY(1.5), 1.5],
    [0, jawY(1.8), 1.8],
    [0, jawY(2.0), 2.0],
    [0, jawY(2.15), 2.15],
  ]);
  b.sweep(jawPath, (t: number) => [0.15 - 0.05 * t, 0.02], {
    bone: jaw,
    sides: 8,
    color: JAW,
    caps: { start: "round", end: "round" },
  });

  // Dark mouth seam between the jaws.
  b.sweep(
    catmull([
      [0, jawY(1.6) + 0.03, 1.6],
      [0, jawY(1.9) + 0.03, 1.9],
      [0, jawY(2.1) + 0.03, 2.1],
    ]),
    0.008,
    { bone: head, color: DARK, sides: 6 },
  );

  // Teeth: triangular cones in two rows, upper on the head, lower on the jaw.
  for (let i = 0; i < 13; i++) {
    const x = -0.13 + (0.26 * i) / 12;
    const z = 2.15 - 0.22 * (x / 0.13) ** 2;
    b.part(new THREE.ConeGeometry(0.022, 0.07, 3), TEETH, {
      at: [x, under(x, z) - 0.02, z],
      dir: [0, -1, 0],
      bone: head,
    });
  }
  for (let i = 0; i < 11; i++) {
    const x = (-0.13 + (0.26 * i) / 10) * 0.9;
    const z = 2.1 - 0.22 * (x / 0.13) ** 2;
    b.part(new THREE.ConeGeometry(0.02, 0.065, 3), TEETH, {
      at: [x, jawY(z) + 0.05, z],
      dir: [0, 1, 0],
      bone: jaw,
    });
  }

  // Fins.
  b.extrude(DORSAL, {
    at: [0, YC + 0.33, -0.1],
    thickness: [0.08, 0.02],
    bevel: 0.012,
    smoothing: 1,
    color: DORSAL_PAINT,
    bone: spine.joints[2],
  });
  b.extrude(DORSAL2, {
    at: [0, YC + 0.27, -1.15],
    thickness: [0.05, 0.015],
    bevel: 0.01,
    smoothing: 1,
    color: FIN,
    bone: spine.joints[1],
  });
  b.extrude(ANAL, {
    at: [0, YC - 0.3, -1.65],
    thickness: 0.04,
    bevel: 0.008,
    color: FIN,
    bone: spine.joints[0],
  });
  b.extrude(CAUDAL, {
    at: [0, YC, -1.8],
    thickness: 0.05,
    bevel: 0.012,
    smoothing: 1,
    color: CAUDAL_PAINT,
    bone: tail.joints[1],
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pec = b.chain(
      `pectoral${side}`,
      [
        [s * 0.2, YC - 0.12, 0.95],
        [s * 0.6, YC - 0.14, 0.84],
        [s * 0.95, YC - 0.17, 0.72],
      ],
      { parent: spine.joints[4], names: [`pectoral${side}1`, `pectoral${side}2`, `pectoral${side}Tip`], role: "wing" },
    );
    b.extrude(PECTORAL, {
      at: [s * 0.2, YC - 0.12, 0.95],
      x: [s, 0, 0],
      y: [0, 0, -1],
      thickness: [0.06, 0.02],
      bevel: 0.01,
      smoothing: 1,
      color: PEC_PAINT,
      bone: pec.joints[0],
    });
    b.extrude(PELVIC, {
      at: [s * 0.18, YC - 0.3, -0.75],
      x: [s, 0, 0],
      y: [0, 0, -1],
      thickness: 0.03,
      bevel: 0.006,
      color: FIN,
      bone: spine.joints[0],
    });
  }

  // Lateral keels along the caudal peduncle.
  for (const s of [1, -1]) {
    b.sweep(
      polyline([
        [s * 0.2, YC - 0.02, -1.55],
        [s * 0.09, YC - 0.02, -2.0],
      ]),
      [0.02, 0.008],
      { bone: spine.joints[0], color: FIN, sides: 6 },
    );
  }

  // Eyes: dark domes on the snout sides, each with an orange lens.
  for (const s of [1, -1]) {
    const eye = skin.nearest([s * 0.3, YC + 0.06, 1.74]);
    b.stick(new THREE.SphereGeometry(0.055, 10, 8), DARK, eye, { embed: 0.45 });
    glow(b.stick(new THREE.SphereGeometry(0.026, 8, 6), ACCENT, eye.moved([0, 0.045, 0]), { embed: 0.5 }));
  }

  // Gill slits: five dark arcs per flank, draped onto the hull.
  for (const s of [1, -1]) {
    for (const gz of [0.82, 0.95, 1.08, 1.21, 1.34]) {
      const slit = skin.drape(
        catmull([
          [s * 0.5, YC + 0.2, gz + 0.05],
          [s * 0.5, YC, gz],
          [s * 0.5, YC - 0.2, gz - 0.04],
        ]),
        { lift: 0.004 },
      );
      b.sweep(slit, 0.011, { color: DARK, sides: 6 });
    }
  }

  // Panel rivets either side of the flank stripe, in the middle of each panel.
  for (const s of [1, -1]) {
    for (let k = -3; k <= 2; k++) {
      const z = k * 0.46 + 0.23;
      for (const y of [YC - 0.13, YC + 0.07]) {
        b.stick(new THREE.SphereGeometry(0.014, 6, 4), STEEL, skin.nearest([s * 0.4, y, z]), { embed: 0.5 });
      }
    }
  }

  // Chevron decals on each flank above the stripe.
  for (const s of [1, -1]) {
    b.decal(body, CHEV, {
      at: [s * 0.4, YC + 0.12, 0.3],
      dir: [s, 0, 0],
      size: [0.44, 0.16],
      mirror: s < 0,
    });
  }

  // Smaller chevrons on the flank over the tail.
  for (const s of [1, -1]) {
    b.decal(body, CHEV, { at: [s * 0.3, YC + 0.1, -1.2], dir: [s, 0, 0], size: [0.3, 0.11], mirror: s < 0 });
  }

  // Nostrils: two dark dots under the snout.
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), DARK, skin.nearest([s * 0.07, under(s * 0.07, 2.05) - 0.02, 2.05]), {
      embed: 0.5,
    });
  }

  // Ampullae pores: small dark dots over the snout.
  for (const h of skin.scatter(40, { rng: rng(11), minDist: 0.045, filter: (h) => h.at.z > 1.8 && h.n.y < 0.5 })) {
    b.stick(new THREE.SphereGeometry(0.007, 4, 3), DARK, h, { embed: 0.5 });
  }

  return b.root;
}
