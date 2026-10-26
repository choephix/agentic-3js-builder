import * as THREE from "three";
import { type Builder, createBuilder, catmull, cells, mix, noise, paint, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

const ROOT = "#24123d";
const ROOT_LIT = "#4b2465";
const STEM = "#183b58";
const STEM_LIT = "#28728a";
const LEAF = "#1c766d";
const LEAF_LIT = "#45c7a4";
const LEAF_DARK = "#12434e";
const PETAL = "#61349b";
const PETAL_LIT = "#a85fe0";
const PETAL_EDGE = "#dd87f3";
const CYAN = "#35f4e4";
const MAGENTA = "#ff4fd8";
const AMBER = "#ffd36a";

const leafPaint = paint((p, n) => {
  const lower = Math.max(0, Math.min(1, (p.y - 0.8) / 0.75));
  const vein = Math.max(0, 1 - Math.abs(p.x + p.z * 0.12) / 0.055);
  const cellular = cells(p, 0.075, 41);
  const speck = cellular.d1 < 0.16 && cellular.id > 0.73;

  let c = mix(LEAF_DARK, LEAF, lower * 0.68 + 0.12);
  c = mix(c, LEAF_LIT, vein * 0.72);
  if (n.y < -0.15) c = mix(c, LEAF_DARK, 0.42);
  if (speck) c = mix(c, CYAN, 0.68);
  return c;
});

const petalPaint = paint((p, n) => {
  const radial = Math.sqrt(p.x * p.x + (p.z - 0.04) * (p.z - 0.04));
  const tip = Math.min(1, Math.max(0, (radial - 0.1) / 0.65));
  const bands = 0.5 + 0.5 * Math.sin(Math.atan2(p.x, p.z - 0.04) * 5 + radial * 38);
  let c = mix(PETAL, PETAL_LIT, 0.22 + tip * 0.58 + bands * 0.08);
  if (tip > 0.84) c = mix(c, PETAL_EDGE, (tip - 0.84) / 0.16);
  if (n.y < -0.1) c = mix(c, PETAL, 0.28);
  return c;
});

const stalkPaint = paint((p, n) => {
  const band = 0.5 + 0.5 * Math.sin(p.y * 29 + p.z * 18);
  const streak = Math.abs(Math.sin(p.y * 24 + p.x * 31 + p.z * 13)) > 0.965;
  let c = mix(STEM, STEM_LIT, band * 0.28 + Math.max(0, n.y) * 0.2);
  if (n.y < -0.25) c = mix(c, "#101b43", 0.5);
  if (streak && n.z > -0.2) c = mix(c, CYAN, 0.7);
  return c;
});

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "Avatar-inspired alien flora with painted bioluminescent leaf veins, radial violet flower petals, and banded cyan-streaked stalks.",
};

export const REQUESTS = [
  {
    id: "leafTexture",
    kind: "texture",
    part: "leafL",
    what: "Paint both fan leaves with dark lower edges, teal centers, bright raised veins, and sparse cyan speckles.",
  },
  {
    id: "petalTexture",
    kind: "texture",
    part: "crownPetals",
    what: "Paint violet-to-lilac petals with crisp luminous rims and faint radial bands.",
  },
  {
    id: "stalkTexture",
    kind: "texture",
    part: "mainStalk",
    what: "Paint the stalk and branches with layered teal bands, indigo undersides, and narrow cyan streaks.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function orb(
  b: Builder,
  at: [number, number, number],
  color: string,
  name: string,
  scale: [number, number, number] = [0.05, 0.06, 0.05],
) {
  const part = b.part(new THREE.SphereGeometry(1, 8, 6), color, {
    at,
    scale,
    name,
  });
  glow(part, 1.8);
  return part;
}

function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  b.part(
    new THREE.CylinderGeometry(0.2, 0.3, 0.12, 8),
    ROOT,
    { at: [0, 0.1, 0], name: "rootPlate", group: "roots" },
  );

  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    ROOT_LIT,
    {
      at: [0, 0.2, 0],
      scale: [0.42, 0.2, 0.34],
      name: "rootBulb",
      group: "roots",
    },
  );

  b.part(
    new THREE.TorusGeometry(0.3, 0.055, 6, 14),
    ROOT,
    {
      at: [0, 0.17, 0],
      rotation: [90, 0, 0],
      name: "rootCollar",
      group: "roots",
    },
  );

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a);
    const z = Math.cos(a);
    b.sweep(
      catmull([
        [x * 0.16, 0.14, z * 0.16],
        [x * 0.34, 0.075, z * 0.34],
        [x * 0.52, 0.035, z * 0.52],
      ]),
      [0.06, 0.018],
      {
        color: ROOT_LIT,
        sides: 7,
        name: `rootFinger${i}`,
        group: "roots",
      },
    );
    orb(
      b,
      [x * 0.5, 0.045, z * 0.5],
      i % 2 ? MAGENTA : CYAN,
      `rootTip${i}`,
      [0.033, 0.025, 0.033],
    );
  }

  b.sweep(
    catmull([
      [0, 0.25, 0],
      [0.015, 0.68, -0.015],
      [-0.025, 1.13, 0.01],
      [0.04, 1.55, 0.015],
      [0, 1.86, 0.03],
    ]),
    (t) => 0.12 - t * 0.045,
    {
      color: stalkPaint,
      sides: 8,
      name: "mainStalk",
      group: "stalk",
    },
  );

  b.sweep(
    catmull([
      [-0.015, 0.68, 0],
      [-0.18, 0.8, 0],
      [-0.4, 0.98, 0.015],
      [-0.57, 1.12, 0.02],
    ]),
    [0.055, 0.018],
    { color: stalkPaint, name: "branchL", group: "stalk" },
  );

  b.sweep(
    catmull([
      [0.02, 0.86, 0],
      [0.17, 0.92, -0.005],
      [0.38, 1.0, 0.015],
      [0.58, 1.02, 0.02],
    ]),
    [0.05, 0.016],
    { color: stalkPaint, name: "branchR", group: "stalk" },
  );

  b.slab(
    [
      [-0.44, 0.98, 0.025],
      [-0.63, 1.12, 0.03],
      [-0.88, 1.34, 0.02],
      [-0.92, 1.53, 0.03],
      [-0.7, 1.46, 0.04],
      [-0.5, 1.25, 0.035],
    ],
    { color: leafPaint, thickness: 0.025, name: "leafL", group: "leaves" },
  );

  b.slab(
    [
      [0.43, 0.98, 0.025],
      [0.63, 1.0, 0.03],
      [0.88, 1.14, 0.02],
      [0.94, 1.34, 0.03],
      [0.72, 1.31, 0.04],
      [0.5, 1.16, 0.035],
    ],
    { color: leafPaint, thickness: 0.025, name: "leafR", group: "leaves" },
  );

  b.slab(
    [
      [-0.12, 0.67, 0.02],
      [-0.29, 0.73, 0.17],
      [-0.54, 0.82, 0.25],
      [-0.61, 0.99, 0.21],
      [-0.38, 0.91, 0.12],
      [-0.18, 0.79, 0.05],
    ],
    { color: leafPaint, thickness: 0.022, name: "lowLeafL", group: "leaves" },
  );

  b.slab(
    [
      [0.11, 0.76, 0.01],
      [0.29, 0.82, 0.14],
      [0.55, 0.88, 0.18],
      [0.62, 1.04, 0.13],
      [0.39, 0.98, 0.09],
      [0.18, 0.86, 0.03],
    ],
    { color: leafPaint, thickness: 0.022, name: "lowLeafR", group: "leaves" },
  );

  b.sweep(
    catmull([
      [-0.03, 1.23, 0.05],
      [-0.22, 1.34, 0.16],
      [-0.42, 1.28, 0.31],
      [-0.55, 1.1, 0.39],
      [-0.7, 1.17, 0.42],
    ]),
    (t) => 0.026 - t * 0.016,
    { color: PETAL, sides: 6, name: "frontTendrilL", group: "tendrils" },
  );

  b.sweep(
    catmull([
      [0.03, 1.23, 0.05],
      [0.22, 1.34, 0.16],
      [0.42, 1.3, 0.31],
      [0.55, 1.13, 0.39],
      [0.7, 1.21, 0.43],
    ]),
    (t) => 0.026 - t * 0.016,
    { color: PETAL, sides: 6, name: "frontTendrilR", group: "tendrils" },
  );

  orb(b, [-0.7, 1.17, 0.42], CYAN, "tendrilBudL", [0.075, 0.06, 0.075]);
  orb(b, [0.7, 1.21, 0.43], MAGENTA, "tendrilBudR", [0.075, 0.06, 0.075]);

  const crownCore = orb(b, [0, 1.93, 0.04], AMBER, "crownCore", [
    0.16,
    0.13,
    0.16,
  ]);

  b.part(
    new THREE.SphereGeometry(1, 10, 7),
    "#9b227e",
    {
      at: [0, 1.88, 0.035],
      scale: [0.22, 0.08, 0.22],
      name: "crownCup",
      group: "crown",
    },
  );

  const petalAngles = [0, 72, 144, 216, 288];
  petalAngles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const px = Math.cos(a);
    const pz = -Math.sin(a);

    b.slab(
      [
        [dx * 0.08, 1.96, 0.04 + dz * 0.08],
        [dx * 0.42 + px * 0.16, 2.04, 0.04 + dz * 0.42 + pz * 0.16],
        [dx * 0.72, 2.11 + (i % 2) * 0.045, 0.04 + dz * 0.72],
        [dx * 0.42 - px * 0.16, 2.04, 0.04 + dz * 0.42 - pz * 0.16],
      ],
      {
        color: petalPaint,
        thickness: 0.025,
        name: `crownPetal${i}`,
        group: "crownPetals",
      },
    );
  });

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a);
    const z = Math.cos(a);
    b.rod(
      [x * 0.16, 1.98, 0.04 + z * 0.16],
      [x * 0.29, 2.05, 0.04 + z * 0.29],
      0.009,
      {
        color: i % 2 ? MAGENTA : CYAN,
        name: `crownFilament${i}`,
        group: "crown",
      },
    );
    orb(
      b,
      [x * 0.32, 2.06, 0.04 + z * 0.32],
      i % 2 ? MAGENTA : CYAN,
      `crownLamp${i}`,
      [0.035, 0.045, 0.035],
    );
  }

  for (const s of [-1, 1]) {
    b.slab(
      [
        [s * 0.05, 1.92, 0.03],
        [s * 0.22, 1.79, -0.02],
        [s * 0.05, 1.84, 0.12],
      ],
      {
        color: PETAL,
        thickness: 0.022,
        name: `crownSepal${s > 0 ? "L" : "R"}`,
        group: "crownPetals",
      },
    );
  }

  orb(b, [0.02, 0.66, 0.115], CYAN, "stalkGlowLower", [0.048, 0.06, 0.025]);
  orb(b, [-0.02, 1.06, 0.105], MAGENTA, "stalkGlowMiddle", [0.045, 0.055, 0.025]);
  orb(b, [0.02, 1.45, 0.09], CYAN, "stalkGlowUpper", [0.04, 0.05, 0.025]);

  for (const add of STAGE2) add(b);

  return b.root;
}

export default build;

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addCrownLightRing(b: Builder) {
  const CYAN = "#35f4e4";
  const MAGENTA = "#ff4fd8";
  const VIOLET = "#24123d";
  const VIOLET_LIT = "#61349b";
  const AMBER = "#ffd36a";

  const center = new THREE.Vector3(0, 1.98, 0.04);
  const ringRadius = 0.29;
  const lampY = 2.085;

  const point = (angle: number, radius = ringRadius, y = lampY) =>
    new THREE.Vector3(
      center.x + Math.sin(angle) * radius,
      y,
      center.z + Math.cos(angle) * radius,
    );

  const lampPoints: THREE.Vector3[] = [];

  // A dark-violet floating support ring gives the lamps a clear silhouette.
  b.part(
    new THREE.TorusGeometry(0.285, 0.012, 5, 32),
    VIOLET,
    {
      at: [center.x, lampY - 0.018, center.z],
      rotation: [0, 0, 0],
      name: "s2CrownLampOrbit",
      group: "stage2-crown-lights",
    },
  );

  // Eight short radial braces connect the crown core to the orbit.
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const lamp = point(angle);
    const inner = point(angle, 0.105, 2.015);

    b.rod(inner, lamp, 0.009, {
      color: VIOLET_LIT,
      caps: "flat",
      name: `s2LampStem${i}`,
      group: "stage2-crown-lights",
    });

    // A second, thinner diagonal filament makes each connection feel grown rather
    // than mechanically radial.
    const filamentEnd = new THREE.Vector3(
      center.x + Math.sin(angle + Math.PI / 2) * 0.105,
      2.025,
      center.z + Math.cos(angle + Math.PI / 2) * 0.105,
    );
    b.rod(filamentEnd, lamp, 0.0045, {
      color: VIOLET,
      caps: "flat",
      name: `s2LampFilament${i}`,
      group: "stage2-crown-lights",
    });

    lampPoints.push(lamp);
  }

  // Seed-lamps: deliberately faceted, alternating cyan and magenta.
  for (let i = 0; i < lampPoints.length; i++) {
    const p = lampPoints[i];
    const color = i % 2 === 0 ? CYAN : MAGENTA;

    const lamp = b.part(
      new THREE.IcosahedronGeometry(0.052, 1),
      color,
      {
        at: [p.x, p.y, p.z],
        scale: [0.82, 1.25, 0.82],
        name: `s2SeedLamp${i}`,
        group: "stage2-crown-lights",
      },
    );
    glow(lamp, 2.35);

    // A dark collar roots each luminous seed into its support filament.
    b.part(
      new THREE.TorusGeometry(0.052, 0.008, 5, 8),
      VIOLET,
      {
        at: [p.x, p.y - 0.045, p.z],
        name: `s2SeedCollar${i}`,
        group: "stage2-crown-lights",
      },
    );

    // Tiny bright cap on each seed, like a bioluminescent aperture.
    const cap = b.part(
      new THREE.SphereGeometry(0.014, 6, 4),
      i % 2 === 0 ? AMBER : "#fff0ff",
      {
        at: [p.x, p.y + 0.042, p.z],
        name: `s2SeedHighlight${i}`,
        group: "stage2-crown-lights",
      },
    );
    glow(cap, 1.8);

    // Four short crystal rays at each seed make the lamps read from every view.
    const rayRadius = 0.075;
    for (let r = 0; r < 4; r++) {
      const ra = r * Math.PI * 0.5 + (i % 2) * 0.18;
      const dx = Math.sin(ra);
      const dz = Math.cos(ra);
      const rayBase: [number, number, number] = [
        p.x + dx * 0.035,
        p.y,
        p.z + dz * 0.035,
      ];
      const rayTip: [number, number, number] = [
        p.x + dx * rayRadius,
        p.y + (r % 2 === 0 ? 0.008 : -0.008),
        p.z + dz * rayRadius,
      ];
      const ray = b.spike(
        rayBase,
        rayTip,
        null,
        0.009,
        {
          color: color,
          name: `s2SeedRay${i}_${r}`,
          group: "stage2-crown-lights",
        },
      );
      glow(ray, 1.4);
    }
  }

  // A small inner amber nucleus floats just above the crown core, visually tying
  // the alternating lamps back to the flower's existing golden center.
  const nucleus = b.part(
    new THREE.OctahedronGeometry(0.07, 1),
    AMBER,
    {
      at: [center.x, 2.02, center.z],
      scale: [1, 0.72, 1],
      name: "s2CrownNucleus",
      group: "stage2-crown-lights",
    },
  );
  glow(nucleus, 1.7);

  // Eight small beads sit between the lamp supports, making the orbit feel
  // articulated and organic instead of like a plain geometric hoop.
  for (let i = 0; i < 8; i++) {
    const angle = ((i + 0.5) * Math.PI * 2) / 8;
    const p = point(angle, 0.245, 2.075);
    const bead = b.part(
      new THREE.SphereGeometry(0.016, 6, 4),
      i % 2 === 0 ? MAGENTA : CYAN,
      {
        at: [p.x, p.y, p.z],
        name: `s2OrbitBead${i}`,
        group: "stage2-crown-lights",
      },
    );
    glow(bead, 1.55);
  }
}
    return addCrownLightRing;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addPetalVeins(b: Builder) {
  const vein = (a: [number, number, number], c: [number, number, number], color: string, name: string, radius = 0.008) => {
    const rib = b.rod(a, c, radius, {
      color,
      caps: "round",
      sides: 6,
      name,
      group: "stage2PetalVeins",
    });
    glow(rib, 1.7);
    return rib;
  };

  const bead = (
    at: [number, number, number],
    color: string,
    name: string,
    scale: [number, number, number],
  ) => {
    const part = b.part(
      new THREE.SphereGeometry(1, 8, 6),
      color,
      {
        at,
        scale,
        name,
        group: "stage2PetalVeins",
      },
    );
    glow(part, 2.1);
    return part;
  };

  // The five broad petals from stage 1 are radial around the amber crown core.
  // Their veins sit just above the upper face of each slab and taper toward the tips.
  const crownCenter: [number, number, number] = [0, 2.065, 0.04];
  const petalAngles = [0, 72, 144, 216, 288];

  petalAngles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const px = Math.cos(a);
    const pz = -Math.sin(a);

    const point = (
      along: number,
      across: number,
      lift: number,
    ): [number, number, number] => [
      dx * along + px * across,
      2.055 + lift + along * 0.055,
      0.04 + dz * along + pz * across,
    ];

    const root = point(0.105, 0, 0.016);
    const shoulder = point(0.3, 0, 0.025);
    const tip = point(0.64, 0, 0.04);

    vein(root, shoulder, CYAN, `s22_petal${i}_midRoot`, 0.010);
    vein(shoulder, tip, PETAL_EDGE, `s22_petal${i}_midTip`, 0.006);

    // Paired organic ribs fork from the midrib and follow the petal's two edges.
    const leftStart = point(0.27, 0, 0.027);
    const leftKnee = point(0.43, 0.115, 0.033);
    const leftEnd = point(0.59, 0.125, 0.043);
    vein(leftStart, leftKnee, CYAN, `s22_petal${i}_leftLower`, 0.006);
    vein(leftKnee, leftEnd, PETAL_EDGE, `s22_petal${i}_leftUpper`, 0.0045);

    const rightStart = point(0.37, 0, 0.032);
    const rightKnee = point(0.51, -0.11, 0.038);
    const rightEnd = point(0.65, -0.105, 0.046);
    vein(rightStart, rightKnee, CYAN, `s22_petal${i}_rightLower`, 0.006);
    vein(rightKnee, rightEnd, PETAL_EDGE, `s22_petal${i}_rightUpper`, 0.0045);

    // Two smaller forks make the pattern feel grown rather than manufactured.
    const nearFork = point(0.2, 0, 0.02);
    vein(
      nearFork,
      point(0.31, 0.065, 0.027),
      PETAL_EDGE,
      `s22_petal${i}_nearLeft`,
      0.004,
    );
    vein(
      nearFork,
      point(0.32, -0.065, 0.027),
      PETAL_EDGE,
      `s22_petal${i}_nearRight`,
      0.004,
    );

    // A luminous terminal bud locks the rib visually to the petal tip.
    bead(point(0.65, 0, 0.045), i % 2 === 0 ? CYAN : PETAL_EDGE, `s22_petal${i}_tipBud`, [
      0.018,
      0.012,
      0.018,
    ]);
  });

  // Five front-facing stalk nodes. Each has a recessed collar, a glowing capsule,
  // a four-point flare, and a tiny white-cyan glint for a readable bioluminescent core.
  const nodes: Array<[number, number]> = [
    [0.006, 0.56],
    [-0.004, 0.83],
    [-0.018, 1.10],
    [0.006, 1.39],
    [0.022, 1.66],
  ];

  nodes.forEach(([x, y], i) => {
    const z = 0.112;

    b.part(
      new THREE.TorusGeometry(0.043, 0.009, 5, 10),
      STEM,
      {
        at: [x, y, z - 0.004],
        rotation: [Math.PI / 2, 0, 0],
        name: `s22_stalkNode${i}_collar`,
        group: "stage2StalkNodes",
      },
    );

    const core = b.part(
      new THREE.SphereGeometry(1, 8, 6),
      CYAN,
      {
        at: [x, y, z + 0.008],
        scale: [0.027, 0.038, 0.012],
        name: `s22_stalkNode${i}_core`,
        group: "stage2StalkNodes",
      },
    );
    glow(core, 2.6);

    const flare = (a: [number, number, number], c: [number, number, number], suffix: string) => {
      const star = b.rod(a, c, 0.0045, {
        color: CYAN,
        caps: "round",
        sides: 5,
        name: `s22_stalkNode${i}_${suffix}`,
        group: "stage2StalkNodes",
      });
      glow(star, 2.2);
    };

    flare([x - 0.055, y, z + 0.01], [x + 0.055, y, z + 0.01], "flareX");
    flare([x, y - 0.065, z + 0.01], [x, y + 0.065, z + 0.01], "flareY");

    // Short diagonal rays break the perfect four-point symmetry at alternating nodes.
    if (i % 2 === 0) {
      flare([x - 0.028, y - 0.028, z + 0.012], [x + 0.028, y + 0.028, z + 0.012], "flareDiagA");
      flare([x - 0.028, y + 0.028, z + 0.012], [x + 0.028, y - 0.028, z + 0.012], "flareDiagB");
    }

    const glint = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      "#f4fff5",
      {
        at: [x - 0.008, y + 0.012, z + 0.024],
        scale: [0.007, 0.010, 0.004],
        name: `s22_stalkNode${i}_glint`,
        group: "stage2StalkNodes",
      },
    );
    glow(glint, 3);
  });

  // Tiny connecting filaments between adjacent stalk nodes reinforce that the lights
  // are part of one living vascular system rather than separate ornaments.
  for (let i = 0; i < nodes.length - 1; i++) {
    const [x0, y0] = nodes[i];
    const [x1, y1] = nodes[i + 1];
    const filament = b.rod(
      [x0, y0 + 0.045, 0.114],
      [x1, y1 - 0.045, 0.114],
      0.0025,
      {
        color: CYAN_DARK,
        caps: "round",
        sides: 5,
        name: `s22_stalkVascularFilament${i}`,
        group: "stage2StalkNodes",
      },
    );
    glow(filament, 0.8);
  }
}
    return addPetalVeins;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addLeftLeafLamps(b: Builder) {
  const PEARL = "#fff6ff";
  const surface = b.surface(b.root);

  const lamps: Array<{
    p: [number, number, number];
    side: number;
    size: number;
  }> = [
    { p: [-0.585, 1.205, 0.052], side: -1, size: 0.034 },
    { p: [-0.705, 1.325, 0.055], side: 1, size: 0.039 },
    { p: [-0.815, 1.435, 0.052], side: -1, size: 0.031 },
  ];

  lamps.forEach(({ p, side, size }, i) => {
    const hit = surface.nearest(p);

    const lamp = b.stick(
      new THREE.SphereGeometry(1, 8, 6),
      CYAN,
      hit,
      {
        embed: 0.28,
        scale: [size, size * 0.82, size],
        name: `leftLeafLamp${i}`,
        group: "leaf-lamps",
      },
    );
    glow(lamp, 2.1);

    // A pearl-like glint is seated slightly above each glowing bead.
    const glintPoint: [number, number, number] = [
      p[0] - 0.008,
      p[1] + size * 0.34,
      p[2] + 0.018,
    ];
    const glint = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      PEARL,
      {
        at: glintPoint,
        scale: [size * 0.22, size * 0.16, size * 0.12],
        name: `leftLeafLamp${i}Highlight`,
        group: "leaf-lamps",
      },
    );
    glow(glint, 1.25);

    // Short magenta filaments fork toward the leaf margin, remaining inside the reserved leaf room.
    const root: [number, number, number] = [
      p[0] + side * size * 0.25,
      p[1] - size * 0.08,
      p[2] + 0.005,
    ];
    const mid: [number, number, number] = [
      p[0] + side * (0.036 + i * 0.003),
      p[1] + 0.012,
      p[2] + 0.015,
    ];
    const tip: [number, number, number] = [
      p[0] + side * (0.066 + i * 0.004),
      p[1] + 0.035,
      p[2] + 0.022,
    ];

    b.sweep([root, mid, tip], [0.006, 0.0022], {
      color: MAGENTA,
      sides: 5,
      caps: "round",
      name: `leftLeafFilament${i}`,
      group: "leaf-lamps",
    });

    // A second, thinner cyan branch gives each lamp the characteristic alien forked-vein detail.
    const branchTip: [number, number, number] = [
      p[0] + side * (0.047 + i * 0.003),
      p[1] - 0.032,
      p[2] + 0.018,
    ];
    b.rod(
      [p[0] + side * size * 0.12, p[1] - 0.006, p[2] + 0.008],
      branchTip,
      0.0025,
      CYAN_DARK,
      {
        caps: "round",
        name: `leftLeafVeinFork${i}`,
        group: "leaf-lamps",
      },
    );

    const tipLamp = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      MAGENTA,
      {
        at: tip,
        scale: [0.009, 0.012, 0.007],
        name: `leftLeafFilamentTip${i}`,
        group: "leaf-lamps",
      },
    );
    glow(tipLamp, 1.35);
  });

  // A narrow luminous central vein links the three beads into one intentional motif.
  b.rod(
    [-0.56, 1.19, 0.061],
    [-0.84, 1.455, 0.061],
    0.004,
    CYAN_DARK,
    {
      caps: "round",
      name: "leftLeafLampVein",
      group: "leaf-lamps",
    },
  );
}
    return addLeftLeafLamps;
  })(),
);
// add4
STAGE2.push(
  (() => {
const PEARL = "#fff7dc";
const CUT = "#100b25";

function addRightLeafLamps(b: Builder) {
  // Right fan leaf: a raised central vein makes the three lanterns read as attached
  // rather than floating ornaments.
  b.rod(
    [0.43, 0.995, 0.065],
    [0.91, 1.315, 0.065],
    0.012,
    {
      color: LEAF_DARK,
      caps: "round",
      name: "s24RightLeafVein",
      group: "leafLamps",
    },
  );

  const lamps: [number, number, number][] = [
    [0.54, 1.045, 0.082],
    [0.68, 1.145, 0.086],
    [0.82, 1.245, 0.079],
  ];

  lamps.forEach(([x, y, z], i) => {
    const lamp = b.part(
      new THREE.SphereGeometry(1, 8, 6),
      MAGENTA,
      {
        at: [x, y, z],
        scale: [0.043, 0.052, 0.035],
        name: `s24RightLamp${i}`,
        group: "leafLamps",
      },
    );
    glow(lamp, 1.7);

    // A small cyan collar gives each bead a readable mechanical-organic socket.
    const collar = b.part(
      new THREE.TorusGeometry(0.038, 0.006, 5, 8),
      CYAN_DARK,
      {
        at: [x, y - 0.006, z - 0.003],
        rotation: [90, 0, 0],
        name: `s24RightLampCollar${i}`,
        group: "leafLamps",
      },
    );
    glow(collar, 0.8);

    // Pearl highlight, biased toward the viewer and slightly upward.
    const highlight = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      PEARL,
      {
        at: [x - 0.012, y + 0.016, z + 0.031],
        scale: [0.009, 0.012, 0.006],
        name: `s24RightLampHighlight${i}`,
        group: "leafLamps",
      },
    );
    glow(highlight, 2.2);

    // Short paired cyan filaments branch from each lantern into the leaf tissue.
    const side = i % 2 === 0 ? 1 : -1;
    const leftEnd: [number, number, number] = [
      x - 0.075,
      y - 0.018 + side * 0.006,
      z + 0.006,
    ];
    const rightEnd: [number, number, number] = [
      x + 0.064,
      y + 0.024 - side * 0.005,
      z + 0.005,
    ];

    b.rod(
      [x - 0.025, y - 0.008, z - 0.004],
      leftEnd,
      0.006,
      {
        color: CYAN,
        caps: "round",
        name: `s24RightFilamentL${i}`,
        group: "leafLamps",
      },
    );
    b.rod(
      [x + 0.022, y + 0.01, z - 0.003],
      rightEnd,
      0.006,
      {
        color: CYAN,
        caps: "round",
        name: `s24RightFilamentR${i}`,
        group: "leafLamps",
      },
    );

    const leftTip = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      CYAN,
      {
        at: leftEnd,
        scale: [0.012, 0.012, 0.008],
        name: `s24RightFilamentTipL${i}`,
        group: "leafLamps",
      },
    );
    glow(leftTip, 1.5);

    const rightTip = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      CYAN,
      {
        at: rightEnd,
        scale: [0.012, 0.012, 0.008],
        name: `s24RightFilamentTipR${i}`,
        group: "leafLamps",
      },
    );
    glow(rightTip, 1.5);
  });

  // Six new chunky floor-hugging mycelial fingers. Their paths begin inside the
  // bulb, so the rounded additions visibly grow out of the existing root mass.
  const roots: Array<{
    end: [number, number, number];
    bend: [number, number, number];
    cut: [number, number, number];
  }> = [
    {
      end: [0.58, 0.034, 0.04],
      bend: [0.28, 0.075, 0.035],
      cut: [0.39, 0.094, 0.044],
    },
    {
      end: [0.38, 0.032, 0.42],
      bend: [0.19, 0.07, 0.24],
      cut: [0.28, 0.09, 0.31],
    },
    {
      end: [-0.18, 0.034, 0.57],
      bend: [-0.08, 0.072, 0.3],
      cut: [-0.12, 0.093, 0.43],
    },
    {
      end: [-0.57, 0.033, 0.19],
      bend: [-0.28, 0.074, 0.1],
      cut: [-0.39, 0.094, 0.14],
    },
    {
      end: [-0.43, 0.032, -0.34],
      bend: [-0.23, 0.07, -0.18],
      cut: [-0.32, 0.092, -0.25],
    },
    {
      end: [0.2, 0.033, -0.54],
      bend: [0.1, 0.072, -0.29],
      cut: [0.14, 0.094, -0.42],
    },
  ];

  roots.forEach(({ end, bend, cut }, i) => {
    b.sweep(
      catmull([
        [0, 0.125, 0],
        [bend[0] * 0.48, 0.105, bend[2] * 0.48],
        bend,
        end,
      ]),
      (t) => 0.075 * (1 - t) + 0.027 * t,
      {
        color: ROOT_LIT,
        sides: 7,
        caps: "round",
        name: `s24MyceliumFinger${i}`,
        group: "mycelium",
      },
    );

    // Faceted cyan growth-tip, sunk slightly into the rounded root end.
    const tip = b.part(
      new THREE.SphereGeometry(1, 7, 5),
      CYAN,
      {
        at: [end[0], end[1] + 0.012, end[2]],
        scale: [0.042, 0.028, 0.042],
        name: `s24MyceliumTip${i}`,
        group: "mycelium",
      },
    );
    glow(tip, 1.9);

    // A triangular dark cut-mark sits on the upper ridge of each root.
    const [cx, cy, cz] = cut;
    const tangent = new THREE.Vector3(end[0] - bend[0], 0, end[2] - bend[2]).normalize();
    const across = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(0.026);
    const point = new THREE.Vector3(cx, cy + 0.012, cz).addScaledVector(tangent, 0.035);
    const a = new THREE.Vector3(cx, cy + 0.012, cz).sub(across);
    const c = new THREE.Vector3(cx, cy + 0.012, cz).add(across);

    b.slab(
      [
        [a.x, a.y, a.z],
        [point.x, point.y + 0.012, point.z],
        [c.x, c.y, c.z],
      ],
      {
        color: CUT,
        thickness: 0.006,
        name: `s24MyceliumCut${i}`,
        group: "mycelium",
      },
    );

    // One tiny amber spark per cut makes the marks feel biologically active
    // without competing with the requested cyan tips.
    const spark = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      AMBER,
      {
        at: [cx, cy + 0.022, cz],
        scale: [0.009, 0.014, 0.009],
        name: `s24MyceliumSpark${i}`,
        group: "mycelium",
      },
    );
    glow(spark, 1.25);
  });
}
    return addRightLeafLamps;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addTendrilBeads(b: Builder) {
  const CORD = "#351957";
  const HIGHLIGHT = "#eaffff";

  type P = [number, number, number];

  const lerp = (a: P, c: P, t: number): P => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];

  const samplePolyline = (points: P[], t: number): P => {
    const scaled = t * (points.length - 1);
    const i = Math.min(points.length - 2, Math.floor(scaled));
    return lerp(points[i], points[i + 1], scaled - i);
  };

  const bead = (
    at: P,
    color: string,
    name: string,
    side: number,
    index: number,
  ) => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const part = b.part(geo, color, {
      at,
      scale: [
        0.034 + 0.004 * ((index + side + 3) % 3),
        0.052 + 0.006 * ((index * 2 + side + 5) % 3),
        0.034 + 0.004 * ((index * 3 + side + 1) % 3),
      ],
      rotation: [
        (index * 17 + side * 11) % 24,
        (index * 31 + side * 19) % 40,
        (index * 23 + side * 7) % 32,
      ],
      name,
      group: "tendrilBeads",
    });
    glow(part, color === CYAN ? 2.4 : 2.1);

    const highlight = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      HIGHLIGHT,
      {
        at: [at[0] - 0.009, at[1] + 0.014, at[2] + 0.022],
        scale: [0.008, 0.011, 0.006],
        name: `${name}Highlight`,
        group: "tendrilBeads",
      },
    );
    glow(highlight, 3);
  };

  const left: P[] = [
    [-0.03, 1.23, 0.05],
    [-0.22, 1.34, 0.16],
    [-0.42, 1.28, 0.31],
    [-0.55, 1.1, 0.39],
    [-0.7, 1.17, 0.42],
  ];

  const right: P[] = [
    [0.03, 1.23, 0.05],
    [0.22, 1.34, 0.16],
    [0.42, 1.3, 0.31],
    [0.55, 1.13, 0.39],
    [0.7, 1.21, 0.43],
  ];

  const buildString = (points: P[], side: number, label: string) => {
    const beadPoints: P[] = [];
    const count = 7;

    for (let i = 0; i < count; i++) {
      const t = 0.12 + (i / (count - 1)) * 0.82;
      const p = samplePolyline(points, t);

      // A tiny outward lift keeps the ornaments visibly seated on the tendril.
      const lifted: P = [
        p[0],
        p[1] + 0.006 + 0.003 * (i % 2),
        p[2] + 0.012,
      ];
      beadPoints.push(lifted);

      bead(
        lifted,
        i % 2 === 0 ? CYAN : MAGENTA,
        `${label}Bead${i}`,
        side,
        i,
      );
    }

    // Continuous hair-thin cord behind the beads.
    b.sweep(catmull(points), 0.006, {
      color: CORD,
      sides: 5,
      caps: "round",
      name: `${label}Cord`,
      group: "tendrilBeads",
    });

    // Short visible collars between each neighboring bead make the strand feel assembled.
    for (let i = 0; i < beadPoints.length - 1; i++) {
      b.rod(beadPoints[i], beadPoints[i + 1], 0.008, {
        color: CORD,
        caps: "flat",
        sides: 5,
        name: `${label}Connector${i}`,
        group: "tendrilBeads",
      });
    }

    // A tiny terminal droplet reinforces the alien seed-lamp motif.
    const tip = beadPoints[beadPoints.length - 1];
    const terminal: P = [tip[0], tip[1] + 0.035, tip[2] + 0.01];
    b.rod(tip, terminal, 0.005, {
      color: CORD,
      caps: "flat",
      sides: 5,
      name: `${label}TerminalStem`,
      group: "tendrilBeads",
    });
    bead(
      terminal,
      side < 0 ? MAGENTA : CYAN,
      `${label}TerminalBead`,
      side,
      9,
    );
  };

  buildString(left, -1, "tendrilL");
  buildString(right, 1, "tendrilR");
}
    return addTendrilBeads;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addCrownHalo(b: Builder) {
  const CYAN_HALO = typeof CYAN !== "undefined" ? CYAN : "#35f4e4";
  const MAGENTA_HALO = typeof MAGENTA !== "undefined" ? MAGENTA : "#ff4fd8";
  const AMBER_HALO = typeof AMBER !== "undefined" ? AMBER : "#ffd36a";
  const INK_GLYPH = typeof INK !== "undefined" ? INK : "#160c2a";

  const haloArc = (
    points: [number, number, number][],
    color: string,
    name: string,
    radius = 0.012,
  ) => {
    const arc = b.sweep(polyline(points), radius, {
      color,
      sides: 6,
      caps: "round",
      name,
      group: "s26CrownHalo",
    });
    glow(arc, 1.8);
    return arc;
  };

  // Three nested, deliberately faceted arcs make a hovering alien crown rather
  // than a smooth terrestrial ring. Each arc is slightly staggered in depth.
  const outer: [number, number, number][] = [
    [-0.38, 2.235, 0.035],
    [-0.31, 2.34, 0.035],
    [-0.16, 2.425, 0.035],
    [0.00, 2.455, 0.035],
    [0.17, 2.425, 0.035],
    [0.32, 2.34, 0.035],
    [0.38, 2.235, 0.035],
  ];
  const middle: [number, number, number][] = [
    [-0.30, 2.245, 0.062],
    [-0.245, 2.325, 0.062],
    [-0.125, 2.385, 0.062],
    [0.00, 2.405, 0.062],
    [0.13, 2.385, 0.062],
    [0.25, 2.325, 0.062],
    [0.30, 2.245, 0.062],
  ];
  const inner: [number, number, number][] = [
    [-0.22, 2.255, 0.09],
    [-0.18, 2.31, 0.09],
    [-0.09, 2.35, 0.09],
    [0.00, 2.365, 0.09],
    [0.10, 2.35, 0.09],
    [0.18, 2.31, 0.09],
    [0.22, 2.255, 0.09],
  ];

  haloArc(outer, CYAN_HALO, "s26HaloOuter", 0.014);
  haloArc(middle, MAGENTA_HALO, "s26HaloMiddle", 0.011);
  haloArc(inner, AMBER_HALO, "s26HaloInner", 0.008);

  // Angular cap stones at the ends keep the arcs readable from the front.
  const capGeo = new THREE.OctahedronGeometry(0.025, 0);
  const capPoints: [number, number, number][] = [
    [-0.38, 2.235, 0.035],
    [0.38, 2.235, 0.035],
    [-0.30, 2.245, 0.062],
    [0.30, 2.245, 0.062],
  ];
  capPoints.forEach((at, i) => {
    const p = b.part(capGeo.clone(), i < 2 ? CYAN_HALO : MAGENTA_HALO, {
      at,
      name: `s26HaloCap${i}`,
      group: "s26CrownHalo",
    });
    glow(p, 2);
  });

  // Three suspended droplets beneath the halo, each with a dark violet neck,
  // a luminous body, and a tiny pale specular bead.
  const droplets: Array<{
    x: number;
    y: number;
    z: number;
    color: string;
  }> = [
    { x: -0.235, y: 2.205, z: 0.055, color: CYAN_HALO },
    { x: 0.00, y: 2.175, z: 0.075, color: AMBER_HALO },
    { x: 0.235, y: 2.205, z: 0.055, color: MAGENTA_HALO },
  ];

  droplets.forEach((d, i) => {
    b.rod(
      [d.x, d.y + 0.018, d.z],
      [d.x, d.y - 0.025, d.z],
      0.006,
      INK_GLYPH,
      {
        name: `s26DropletCord${i}`,
        group: "s26CrownHalo",
      },
    );

    const droplet = b.part(
      new THREE.SphereGeometry(1, 8, 6),
      d.color,
      {
        at: [d.x, d.y - 0.055, d.z],
        scale: [0.035, 0.052, 0.026],
        name: `s26Droplet${i}`,
        group: "s26CrownHalo",
      },
    );
    glow(droplet, 2.2);

    const glint = b.part(
      new THREE.SphereGeometry(1, 6, 4),
      "#fff8d0",
      {
        at: [d.x - 0.009, d.y - 0.041, d.z + 0.021],
        scale: [0.007, 0.009, 0.004],
        name: `s26DropletGlint${i}`,
        group: "s26CrownHalo",
      },
    );
    glow(glint, 2.5);
  });

  // ROOT GLYPH ----------------------------------------------------------------
  // A dark three-lobed backing gives the small symbol a crisp silhouette on the
  // rounded bulb. Three cyan lobes overlap into one simple alien trefoil.
  const glyphZ = 0.365;
  const lobes: Array<[number, number]> = [
    [-0.072, 0.205],
    [0.072, 0.205],
    [0.00, 0.135],
  ];

  lobes.forEach(([x, y], i) => {
    b.part(
      new THREE.CircleGeometry(0.067, 8),
      INK_GLYPH,
      {
        at: [x, y, glyphZ],
        dir: [0, 0, 1],
        axis: "z",
        name: `s26GlyphOutline${i}`,
        group: "s26RootGlyph",
      },
    );
  });

  // Dark connecting spine and lower point turn the three circles into a single
  // emblem instead of three unrelated dots.
  b.part(
    new THREE.BoxGeometry(0.075, 0.115, 0.012),
    INK_GLYPH,
    {
      at: [0, 0.202, glyphZ - 0.003],
      dir: [0, 0, 1],
      axis: "z",
      rotation: [0, 0, 0],
      name: "s26GlyphSpine",
      group: "s26RootGlyph",
    },
  );

  const cyanLobes: Array<[number, number]> = [
    [-0.072, 0.205],
    [0.072, 0.205],
    [0.00, 0.135],
  ];

  cyanLobes.forEach(([x, y], i) => {
    const lobe = b.part(
      new THREE.CircleGeometry(i === 2 ? 0.045 : 0.047, 8),
      CYAN_HALO,
      {
        at: [x, y, glyphZ + 0.008],
        dir: [0, 0, 1],
        axis: "z",
        name: `s26GlyphCyan${i}`,
        group: "s26RootGlyph",
      },
    );
    glow(lobe, 1.6);
  });

  // A narrow luminous triangular spear unifies the trefoil and points downward.
  const glyphPoint = b.slab(
    [
      [-0.028, 0.165, glyphZ + 0.012],
      [0.028, 0.165, glyphZ + 0.012],
      [0.00, 0.068, glyphZ + 0.012],
    ],
    {
      color: CYAN_HALO,
      thickness: 0.008,
      name: "s26GlyphPoint",
      group: "s26RootGlyph",
    },
  );
  glow(glyphPoint, 1.6);

  const glyphDot = b.part(
    new THREE.SphereGeometry(1, 8, 6),
    MAGENTA_HALO,
    {
      at: [0, 0.175, glyphZ + 0.022],
      scale: [0.018, 0.018, 0.008],
      name: "s26GlyphHeart",
      group: "s26RootGlyph",
    },
  );
  glow(glyphDot, 2.3);

  // Three tiny radial ticks make the glyph feel etched and biotechnological.
  const ticks: Array<[[number, number, number], [number, number, number]]> = [
    [[-0.12, 0.205, glyphZ + 0.014], [-0.145, 0.22, glyphZ + 0.014]],
    [[0.12, 0.205, glyphZ + 0.014], [0.145, 0.22, glyphZ + 0.014]],
    [[0, 0.065, glyphZ + 0.014], [0, 0.0, glyphZ + 0.014]],
  ];

  ticks.forEach(([a, c], i) => {
    b.rod(a, c, 0.006, MAGENTA_HALO, {
      name: `s26GlyphTick${i}`,
      group: "s26RootGlyph",
    });
  });
}
    return addCrownHalo;
  })(),
);
