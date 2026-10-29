<!-- call: plan -->

```json
{
  "name": "Bauhaus Songbird",
  "description": "A stylized songbird perched on a bare branch display stand, built as bold Bauhaus geometry — circles, triangles and bars in primary red, yellow and blue, edged in black and warm wood tones.",
  "builderName": "bauhausSongbird",
  "size": [0.7, 0.9, 1.5],
  "layout": "A bird robustly proportioned as pure geometry stands perched on a horizontal branch that runs along Z. The branch rests on y = 0 through two short splayed trunk stumps at its back half, its front tip reaching z ≈ +0.7 and its back fork to z ≈ −0.7 at a perch height of about 0.56 m. From the front (looking at +Z): the bird's round cream-ringed black dot eyes sit either side of a bold triangular blue-and-yellow beak pointing straight at the viewer, a red breast circle fills the chest below, wings fold as flat black-edged bars along each flank, and a stiff triangular tail fan of alternating red/blue bars sweeps back and slightly down to z ≈ −0.32. The head is a near-sphere riding high and forward on a short neck, crested with one yellow triangle feather. Legs are slim black bars from body to the perch, ending in three-toed feet gripped around the branch top at the perchTop mount. Every surface is a flat colour from the palette; details — eye rings, beak halves, wing bars, tail stripes, branch bark bands and leaf sprigs (yellow circle + blue triangle + red disc) — are small separate parts seated on the surface, with black trim outlining the signature shapes. All leaf and bird colour blocks are flat primaries with hard edges; wood parts carry warm tan wood with dark bark bands.",
  "palette": {
    "red": "#d94436",
    "yellow": "#f0c229",
    "blue": "#2b5ea7",
    "black": "#1d1b1a",
    "cream": "#f2ecdd",
    "warmGrey": "#b9ac9a",
    "wood": "#c98d4f",
    "woodDark": "#7a5230",
    "bark": "#4a3423",
    "leafTeal": "#2e7d6b",
    "beakDark": "#f5a623",
    "eyeWhite": "#faf7f0"
  },
  "mounts": {
    "trunkBase": [0, 0, -0.55],
    "perchTop": [0, 0.56, 0.02],
    "branchTipF": [0, 0.6, 0.68],
    "branchTipB": [0, 0.62, -0.7]
  },
  "joints": [
    { "name": "perch", "at": [0, 0, -0.55], "dir": [0, 1, 0], "role": "spine" },
    { "name": "birdBody", "parent": "perch", "at": [0, 0.63, 0], "dir": [0, 0.15, 1], "role": "spine" },
    { "name": "head", "parent": "birdBody", "at": [0, 0.72, 0.09], "dir": [0, 0.35, 1], "role": "neck" },
    { "name": "tail", "parent": "birdBody", "at": [0, 0.64, -0.11], "dir": [0, 0.12, -1], "role": "tail" },
    { "name": "wingL", "parent": "birdBody", "at": [0.07, 0.66, -0.02], "dir": [1, -0.2, -0.3], "role": "wing" },
    { "name": "wingR", "parent": "birdBody", "at": [-0.07, 0.66, -0.02], "dir": [-1, -0.2, -0.3], "role": "wing" },
    { "name": "legL", "parent": "birdBody", "at": [0.045, 0.555, 0.02], "dir": [0, -1, 0.15], "role": "leg" },
    { "name": "legR", "parent": "birdBody", "at": [-0.045, 0.555, 0.02], "dir": [0, -1, 0.15], "role": "leg" }
  ],
  "parts": [
    {
      "id": "branchStand",
      "builds": "The display stand: a thick branch running along Z whose top surface at y ≈ 0.56 forms the bird's perch. Build it as a lofted tapered tube along a gently bowing path from branchTipB (z −0.7, y 0.62) through the perch area (z 0.02, y 0.545, radius ≈ 0.045) to branchTipF (z 0.68, y 0.60), radius easing to a rounded 0.025 at each tip, in warm 'wood' with a 'woodDark' underside shading and two or three dark 'bark' band rings swept as thin overlays partway along. At the back half, the main trunk drops from the branch down to the floor: a frustumBox from branch level (z ≈ −0.5) to y = 0 at trunkBase, flanked by two shorter splayed stump legs angling out to roughly x ±0.28, z −0.35, each ending in a flat 'woodDark' foot pad resting exactly on y = 0. Trim the junctions with small black collar rings. Decorate the stand with Bauhaus accents only where the brief allows: one sprig of three flat geometric leaves (a yellow circle disc, a blue triangle, a red small disc, each a thin extrude or slab on its own tiny stem rod of 'bark') rising from the branch near z ≈ 0.35 and z ≈ −0.35, plus a single red ring band around the trunk near its foot. Keep the wood simpler and quieter than the bird so the primaries stay the hero.",
      "box": [[-0.35, 0, -0.75], [0.35, 0.62, 0.75]],
      "attaches": "Stands alone on the floor via trunkBase and its two stump feet; the bird's feet grip the branch top at mount perchTop; the loft ends at branchTipF and branchTipB.",
      "joints": ["perch"],
      "floor": true,
      "budget": 240
    },
    {
      "id": "birdTorso",
      "builds": "The bird's body: a plump egg-shaped loft from the tail root to the chest, roughly 0.24 m long and 0.13 m wide, centred on birdBody, its belly bottom at y ≈ 0.56 just above the branch. Colour it as hard geometric blocks: cream belly underneath switching along the dorsal clock to red on the back and headward chest, split by a clean black zig-zag fur edge or a crisp painted seam line so the two blocks meet in an assertive graphic boundary; a single black band ring wraps the body where breast meets belly. Fold each wing as a flat layered form along its side riding wingL / wingR: a black-edged 'blue' wing plate (a thin extrude or membrane hugging the flank from shoulder to tail root) with two overlapping feather bars — one 'yellow', one 'cream' — laid as narrower extrudes on top of it, tips squared like cut paper. At the rear, mount a stiff triangular tail fan riding the tail joint: a slab or extruded triangle spreading about 0.18 m wide, painted as three lengthwise stripes (red centre, blue edges) separated by black seam parts, tipping back and slightly down. Finish the chest with one circular red breast medallion slightly darker-rimmed in black so it reads as a deliberate Bauhaus circle from the front. Nothing on the body occludes the face line to +Z.",
      "box": [[-0.14, 0.5, -0.34], [0.14, 0.74, 0.2]],
      "attaches": "Rides birdBody; its lower belly sits 1–2 cm above the branch top at perchTop (feet from birdFeet bridge the gap); its front face meets birdHead at the neck, its rear hands the tail fan off at the tail joint; wings align with the head part's sides at z ≈ 0.09.",
      "joints": ["birdBody", "tail", "wingL", "wingR"],
      "floor": false,
      "budget": 260
    },
    {
      "id": "birdHead",
      "builds": "The head, the model's signature piece, riding the head joint aimed up-and-forward: a near-sphere about 0.11 m across in 'blue', its lower half dipping into the red chest so the two meet in a clean seam. The face is settled first and nothing sits in front of it: two big round eyes placed wide — each built as a stack of parts: a cream eye ring disc seated on the skull surface, a black pupil dome at its centre, and a tiny yellow glint stud offset upward-left, so each eye reads as a bold target from the front. The beak is a chunky triangular cone assembly pointing straight along +Z: an upper cone half in 'yellow' and a slightly shorter lower half in 'beakDark' (orange), separated by a visible black hinge line so the two jaws read as separate openable shapes; a small black nostril stud on each side of the upper beak. On the crown, one stylized crest: a single bold yellow triangle feather (thin extrude, black edge) leaning back from the top of the head. Add two flat cream cheek crescents as thin decal-like slabs beside the beak base, and a thin black ring where head meets neck as trim. Keep every feature pushed large and graphic: the eyes and beak together should fill the front silhouette.",
      "box": [[-0.09, 0.68, 0.1], [0.09, 0.85, 0.36]],
      "attaches": "Sits on the head joint at [0, 0.72, 0.09]; its rear lower edge meets the birdTorso neck seam at z ≈ 0.1; the beak tip is the model's forward-most point at z ≈ 0.34.",
      "joints": ["head"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "birdFeet",
      "builds": "The legs and gripping feet: from each leg joint, a slim black bar leg (thin rod or capsule, r ≈ 0.008) dropping about 0.07 m from the body's underside to the branch top at perchTop. Each foot is an assembly of three forward toes plus one back toe, built as short bent black rods or capsules that curl down and wrap around the branch's curved top surface — use surface queries on the branch or place toes by hand hugging the perch radius, toes splayed at roughly ±25° either side of forward. Give each toe a tiny yellow claw stud at its tip so a spark of primary colour anchors the base of the model. Add a small cream feather-cuff ring where each leg meets the belly, and a black ankle band mid-leg as trim. Both feet stand firmly on the perch at z ≈ 0.02, mirrored in x, symmetric about the model's centre plane.",
      "box": [[-0.12, 0.5, -0.08], [0.12, 0.6, 0.1]],
      "attaches": "Rides legL and legR under birdBody; leg tops meet the birdTorso belly at y ≈ 0.56; toes grip the branch top exactly at mount perchTop.",
      "joints": ["legL", "legR"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: birdFeet -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildBirdFeet({ b, J, P, M }: any) {
  const BLACK = P.black;
  const CREAM = P.cream;
  const YELLOW = P.yellow;

  const legRadius = 0.008;
  const toeRadius = 0.0055;
  const perch = M.perchTop ?? [0, 0.56, 0.02];

  const v = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const add = (a: number[], d: number[]) => [a[0] + d[0], a[1] + d[1], a[2] + d[2]];

  const rod = (
    a: number[],
    c: number[],
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    b.rod(a, c, radius, {
      color,
      bone,
      caps: "round",
      sides: 8,
      name,
      group: "birdFeet",
    });
  };

  const bead = (at: number[], radius: number, color: string, bone: any, name: string) => {
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      name,
      group: "birdFeet",
      flat: true,
    });
  };

  const torus = (
    at: number[],
    major: number,
    minor: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    b.part(new THREE.TorusGeometry(major, minor, 6, 12), color, {
      at,
      bone,
      rotation: [90, 0, 0],
      name,
      group: "birdFeet",
      flat: true,
    });
  };

  const buildFoot = (side: number, leg: any, tag: string) => {
    const x = side * 0.045;
    const legTop = [x, 0.563, 0.02];
    const ankle = [x, 0.535, 0.02];

    rod(legTop, ankle, legRadius, BLACK, leg, `leg_${tag}`);
    torus(legTop, 0.014, 0.0032, CREAM, leg, `featherCuff_${tag}`);
    torus([x, 0.542, 0.02], 0.0105, 0.0022, BLACK, leg, `ankleBand_${tag}`);

    // Three broad forward toes, fanned toward the front of the branch.
    const forward = [
      [side * 0.012, 0.006, 0.052],
      [side * 0.004, -0.002, 0.067],
      [-side * 0.010, -0.003, 0.054],
    ];

    forward.forEach((d, i) => {
      const mid = add(ankle, [d[0] * 0.45, -0.010, d[2] * 0.48]);
      const tip = add(ankle, [d[0], -0.038 + d[1], d[2]]);
      rod(ankle, mid, toeRadius, BLACK, leg, `toeF${i + 1}a_${tag}`);
      rod(mid, tip, toeRadius * 0.82, BLACK, leg, `toeF${i + 1}b_${tag}`);
      bead(tip, 0.0062, YELLOW, leg, `clawF${i + 1}_${tag}`);
    });

    // A shorter rear toe curls around the back side of the perch.
    const rearMid = [x - side * 0.004, 0.527, -0.012];
    const rearTip = [x - side * 0.008, 0.507, -0.043];
    rod(ankle, rearMid, toeRadius, BLACK, leg, `toeRearA_${tag}`);
    rod(rearMid, rearTip, toeRadius * 0.82, BLACK, leg, `toeRearB_${tag}`);
    bead(rearTip, 0.0062, YELLOW, leg, `clawRear_${tag}`);

    // Small yellow toe caps tucked against the branch give a readable grip silhouette.
    bead([x + side * 0.006, 0.518, 0.047], 0.0045, YELLOW, leg, `toeSpark_${tag}`);
  };

  buildFoot(1, J.legL, "L");
  buildFoot(-1, J.legR, "R");
}
```

<!-- call: birdHead -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildBirdHead({ b, J, P, M }: any) {
  const head = J.head;
  const BLUE = P.blue;
  const YELLOW = P.yellow;
  const BLACK = P.black;
  const CREAM = P.cream;
  const ORANGE = P.beakDark;

  const at = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];

  // Rounded blue head, deliberately oversized so the bird reads immediately.
  b.part(new THREE.SphereGeometry(0.092, 14, 10), BLUE, {
    bone: head,
    at: at(0, 0.765, 0.175),
    scale: [1.0, 1.0, 1.08],
    name: "birdHeadSkull",
    group: "birdHead",
  });

  // Black neck collar, a simple graphic ring where blue head meets red breast.
  b.part(new THREE.TorusGeometry(0.052, 0.008, 6, 14), BLACK, {
    bone: head,
    at: at(0, 0.718, 0.115),
    rotation: [Math.PI / 2, 0, 0],
    name: "birdHeadNeckCollar",
    group: "trim",
  });

  // Separate jaw hinges make the beak an animatable two-piece assembly.
  const upperJaw = b.joint("birdHeadUpperJaw", {
    parent: head,
    at: at(0, 0.765, 0.205),
    dir: [0, 0.02, 1],
    role: "jaw",
    group: "birdHead",
  });
  const lowerJaw = b.joint("birdHeadLowerJaw", {
    parent: head,
    at: at(0, 0.748, 0.205),
    dir: [0, -0.02, 1],
    role: "jaw",
    group: "birdHead",
  });

  // Cream target-like eye rings, seated just proud of the front of the skull.
  for (const side of [-1, 1]) {
    const ex = side * 0.047;
    b.part(new THREE.CylinderGeometry(0.029, 0.029, 0.009, 16), CREAM, {
      bone: head,
      at: at(ex, 0.785, 0.244),
      dir: [0, 0, 1],
      name: `birdHeadEyeRing${side < 0 ? "R" : "L"}`,
      group: "face",
    });

    b.part(new THREE.SphereGeometry(0.019, 10, 7), BLACK, {
      bone: head,
      at: at(ex, 0.785, 0.251),
      name: `birdHeadPupil${side < 0 ? "R" : "L"}`,
      group: "face",
    });

    // Tiny yellow offset glint, exaggerated as Bauhaus punctuation.
    b.part(new THREE.SphereGeometry(0.0055, 7, 5), YELLOW, {
      bone: head,
      at: at(ex - side * 0.006, 0.794, 0.268),
      name: `birdHeadEyeGlint${side < 0 ? "R" : "L"}`,
      group: "face",
    });
  }

  // Triangular upper and lower beak halves pointing directly toward +Z.
  b.part(new THREE.ConeGeometry(0.047, 0.115, 3), YELLOW, {
    bone: upperJaw,
    at: at(0, 0.773, 0.265),
    dir: [0, 0, 1],
    rotation: [0, 0, Math.PI / 2],
    name: "birdHeadUpperBeak",
    group: "beak",
  });

  b.part(new THREE.ConeGeometry(0.041, 0.086, 3), ORANGE, {
    bone: lowerJaw,
    at: at(0, 0.735, 0.253),
    dir: [0, 0, 1],
    rotation: [0, 0, -Math.PI / 2],
    name: "birdHeadLowerBeak",
    group: "beak",
  });

  // Strong black mouth hinge line spanning the beak.
  b.rod(at(-0.037, 0.752, 0.244), at(0.037, 0.752, 0.244), 0.004, BLACK, {
    bone: upperJaw,
    caps: "flat",
    name: "birdHeadBeakHinge",
    group: "trim",
  });

  // Two nostril studs on the upper beak.
  for (const side of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.006, 7, 5), BLACK, {
      bone: upperJaw,
      at: at(side * 0.022, 0.783, 0.295),
      name: `birdHeadNostril${side < 0 ? "R" : "L"}`,
      group: "beak",
    });
  }

  // Flat cream cheek crescents: layered discs clipped visually by the beak silhouette.
  for (const side of [-1, 1]) {
    b.part(new THREE.CircleGeometry(0.026, 10, 0.25, Math.PI * 1.5), CREAM, {
      bone: head,
      at: at(side * 0.064, 0.755, 0.238),
      dir: [0, 0, 1],
      name: `birdHeadCheek${side < 0 ? "R" : "L"}`,
      group: "face",
    });
  }

  // Black silhouette behind the yellow crown feather.
  b.extrude(
    [
      [-0.027, 0],
      [0.027, 0],
      [0.018, 0.047],
      [0.004, 0.094, "sharp"],
      [-0.015, 0.054],
    ],
    {
      bone: head,
      at: at(0, 0.823, 0.145),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      color: BLACK,
      name: "birdHeadCrestOutline",
      group: "crest",
    },
  );

  b.extrude(
    [
      [-0.019, 0],
      [0.019, 0],
      [0.012, 0.041],
      [0.003, 0.078, "sharp"],
      [-0.011, 0.045],
    ],
    {
      bone: head,
      at: at(0, 0.826, 0.153),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: YELLOW,
      name: "birdHeadCrestFeather",
      group: "crest",
    },
  );
}
```

<!-- call: branchStand -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  polyline,
  rng,
} from "agentic-3js-builder";

export function buildBranchStand({ b, J, P, M }: Ctx) {
  const wood = P.wood;
  const woodDark = P.woodDark;
  const bark = P.bark;
  const black = P.black;
  const red = P.red;
  const yellow = P.yellow;
  const blue = P.blue;

  const perch = J.perch;

  // Main gently bowed perch. The square-ish low-poly section keeps the stand graphic
  // while the rounded caps make both branch ends feel carved rather than cut off.
  const branchPath = catmull(
    [
      [0, 0.62, -0.70],
      [0, 0.585, -0.43],
      [0, 0.545, 0.02],
      [0, 0.565, 0.38],
      [0, 0.60, 0.68],
    ],
    { tension: 0.35 },
  );

  const branch = b.sweep(branchPath, (t) => {
    if (t < 0.08) return 0.025;
    if (t > 0.92) return 0.025;
    const q = Math.min(t / 0.12, (1 - t) / 0.12, 1);
    return 0.025 + 0.022 * q;
  }, {
    bone: perch,
    color: wood,
    sides: 8,
    section: "circle",
    caps: "round",
    sectors: [
      [112, 248, woodDark],
    ],
    name: "branchMain",
    group: "branchStand",
  });

  // Three crisp bark bands seated on the branch surface.
  for (const t of [0.18, 0.48, 0.77]) {
    const at = branch.at(t);
    const band = b.ring(at, {
      count: 10,
      radius: at.radius + 0.002,
      name: `barkBand${Math.round(t * 100)}`,
      parent: perch,
      group: "branchStand",
    });
    b.sweep(polyline([...band.items, band.items[0]], { closed: true }), 0.006, {
      bone: perch,
      color: bark,
      caps: "none",
      sides: 6,
      name: `barkBand${Math.round(t * 100)}`,
      group: "branchStand",
    });
  }

  // Main rear trunk, broad at its floor end and tucked under the back half
  // of the branch.
  b.frustumBox(
    [0, 0.555, -0.49],
    [0, 0.09, -0.55],
    [0.105, 0.11],
    [0.16, 0.15],
    {
      bone: perch,
      color: wood,
      name: "trunk",
      group: "branchStand",
    },
  );

  // Two splayed braces give the display stand a stable, unmistakably geometric base.
  for (const s of [-1, 1]) {
    const root: [number, number, number] = [s * 0.025, 0.31, -0.48];
    const foot: [number, number, number] = [s * 0.275, 0.055, -0.35];

    b.frustumBox(root, foot, [0.055, 0.065], [0.075, 0.065], {
      bone: perch,
      color: woodDark,
      name: `splayedStump${s > 0 ? "L" : "R"}`,
      group: "branchStand",
    });

    b.part(new THREE.BoxGeometry(0.18, 0.035, 0.12), woodDark, {
      bone: perch,
      at: [s * 0.275, 0.018, -0.35],
      name: `footPad${s > 0 ? "L" : "R"}`,
      group: "branchStand",
    });
  }

  // Dark collars at the brace junctions and a single Bauhaus red band near the foot.
  for (const s of [-1, 1]) {
    const collarPath = catmull([
      [s * 0.025, 0.30, -0.48],
      [s * 0.025, 0.34, -0.48],
      [s * 0.025, 0.38, -0.47],
    ]);
    b.sweep(collarPath, 0.063, {
      bone: perch,
      color: black,
      sides: 8,
      caps: "flat",
      name: `junctionCollar${s > 0 ? "L" : "R"}`,
      group: "branchStand",
    });
  }

  const redBand = b.ring(frame([0, 0.135, -0.535], [0, 1, 0]), {
    count: 12,
    radius: 0.115,
    parent: perch,
    name: "redTrunkBand",
    group: "branchStand",
  });
  b.sweep(polyline([...redBand.items, redBand.items[0]], { closed: true }), 0.012, {
    bone: perch,
    color: red,
    caps: "none",
    sides: 6,
    name: "redTrunkBand",
    group: "branchStand",
  });

  // Small geometric leaf sprig at the forward side of the branch.
  const stemA = [0, 0.59, 0.31] as [number, number, number];
  const stemATip = [0.015, 0.72, 0.34] as [number, number, number];
  b.rod(stemA, stemATip, 0.006, { bone: perch, color: bark, caps: "flat", name: "leafStemF" });

  b.part(new THREE.CircleGeometry(0.035, 12), yellow, {
    bone: perch,
    at: [0.015, 0.75, 0.34],
    dir: [0, 1, 0],
    axis: "z",
    name: "yellowLeafF",
    group: "branchStand",
  });
  b.extrude(
    [[0, 0], [0.06, 0], [0.03, 0.075], [0, 0.10, "sharp"]],
    {
      bone: perch,
      at: [0.015, 0.70, 0.35],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: blue,
      name: "blueLeafF",
      group: "branchStand",
    },
  );
  b.part(new THREE.CircleGeometry(0.022, 10), red, {
    bone: perch,
    at: [-0.055, 0.69, 0.34],
    dir: [0, 1, 0],
    axis: "z",
    name: "redLeafF",
    group: "branchStand",
  });

  // A second, quieter sprig at the rear, mirrored in spirit but not mechanically.
  const stemB = [0, 0.595, -0.30] as [number, number, number];
  const stemBTip = [-0.025, 0.715, -0.34] as [number, number, number];
  b.rod(stemB, stemBTip, 0.006, { bone: perch, color: bark, caps: "flat", name: "leafStemB" });

  b.part(new THREE.CircleGeometry(0.03, 12), yellow, {
    bone: perch,
    at: [-0.025, 0.745, -0.34],
    dir: [0, 1, 0],
    axis: "z",
    name: "yellowLeafB",
    group: "branchStand",
  });
  b.extrude(
    [[0, 0], [-0.055, 0], [-0.028, 0.07], [0, 0.095, "sharp"]],
    {
      bone: perch,
      at: [-0.025, 0.70, -0.34],
      x: [-1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: blue,
      name: "blueLeafB",
      group: "branchStand",
    },
  );
  b.part(new THREE.CircleGeometry(0.02, 10), red, {
    bone: perch,
    at: [0.045, 0.69, -0.34],
    dir: [0, 1, 0],
    axis: "z",
    name: "redLeafB",
    group: "branchStand",
  });

  // A few tiny dark pegs under the perch visually tie the branch to its support.
  for (const z of [-0.52, -0.43]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 8), bark, {
      bone: perch,
      at: [0, 0.515, z],
      name: `underPeg${z}`,
      group: "branchStand",
    });
  }

  return b.root;
}
```

<!-- call: birdTorso -->

```ts
import * as THREE from "three";
import { polyline } from "agentic-3js-builder";

export function buildBirdTorso({ b, J, P, M }: Ctx) {
  const RED = P.red;
  const YELLOW = P.yellow;
  const BLUE = P.blue;
  const BLACK = P.black;
  const CREAM = P.cream;
  const BEAK = P.beakDark ?? "#f5a623";

  const bodyPath = polyline([
    [-0.005, 0.635, -0.235],
    [0, 0.66, -0.14],
    [0, 0.675, -0.025],
    [0, 0.685, 0.095],
    [0, 0.675, 0.17],
  ]);

  const body = b.sweep(bodyPath, (t) => {
    const belly = 0.057 + 0.014 * Math.sin(Math.PI * t);
    const width = 0.082 + 0.018 * Math.sin(Math.PI * t);
    return [width, belly];
  }, {
    bone: J.body,
    color: RED,
    section: "circle",
    sides: 8,
    caps: "round",
    sectors: [
      [108, 252, CREAM],
    ],
    name: "torsoEgg",
    group: "birdTorso",
  });

  // A strong black Bauhaus seam where breast meets belly.
  const beltAt = body.at(0.57);
  const bellyLoop = b.surface(body).loop(beltAt, { dir: [0, 0, 1], lift: 0.003 });
  b.sweep(bellyLoop, 0.006, {
    bone: J.body,
    color: BLACK,
    caps: "none",
    sides: 6,
    name: "bellySeam",
    group: "birdTorso",
  });

  // Tail fan: black silhouette, then three crisp coloured wedges.
  const tailBase = [-0.0, 0.665, -0.205] as [number, number, number];
  const fanOutline: [number, number][] = [
    [-0.105, -0.015],
    [0, 0.12],
    [0.105, -0.015],
    [0.075, -0.135],
    [0, -0.17],
    [-0.075, -0.135],
  ];

  b.extrude(fanOutline, {
    at: tailBase,
    x: [1, 0, 0],
    y: [0, 1, -0.28],
    thickness: 0.018,
    bevel: 0.004,
    color: BLACK,
    bone: J.tail,
    name: "tailFanOutline",
    group: "birdTorso",
  });

  const tailWedges: [number, string, number][] = [
    [-0.074, BLUE, 0.047],
    [-0.023, RED, 0.046],
    [0.027, BLUE, 0.047],
  ];
  for (const [x, color, w] of tailWedges) {
    const outline: [number, number][] = [
      [x - w / 2, -0.012],
      [x, 0.098],
      [x + w / 2, -0.012],
      [x + w * 0.34, -0.126],
      [x, -0.153],
      [x - w * 0.34, -0.126],
    ];
    b.extrude(outline, {
      at: tailBase,
      x: [1, 0, 0],
      y: [0, 1, -0.28],
      thickness: 0.024,
      bevel: 0.002,
      color,
      bone: J.tail,
      name: `tailStripe${x}`,
      group: "birdTorso",
    });
  }

  // Folded wing silhouettes.  The outlines are deliberately squared and poster-like.
  const wingOutline: [number, number][] = [
    [-0.145, 0.018],
    [-0.105, 0.092],
    [0.025, 0.102],
    [0.135, 0.043],
    [0.105, -0.018],
    [-0.02, -0.038],
  ];

  for (const side of [1, -1]) {
    const wing = side > 0 ? J.wingL : J.wingR;
    const x = side * 0.086;

    b.extrude(wingOutline, {
      at: [x, 0.665, -0.015],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: BLACK,
      bone: wing,
      name: `wing${side}Outline`,
      group: "birdTorso",
    });

    const blueOutline: [number, number][] = [
      [-0.126, 0.014],
      [-0.09, 0.073],
      [0.018, 0.082],
      [0.112, 0.038],
      [0.088, -0.004],
      [-0.016, -0.024],
    ];
    b.extrude(blueOutline, {
      at: [x + side * 0.006, 0.665, -0.014],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.002,
      color: BLUE,
      bone: wing,
      name: `wing${side}Blue`,
      group: "birdTorso",
    });

    // Two cut-paper feather bars laid diagonally across the blue plate.
    const yellowBar: [number, number][] = [
      [-0.095, 0.056],
      [0.012, 0.068],
      [0.019, 0.045],
      [-0.089, 0.031],
    ];
    const creamBar: [number, number][] = [
      [-0.078, 0.022],
      [0.075, 0.006],
      [0.08, -0.015],
      [-0.07, 0.001],
    ];

    for (const [label, outline, color] of [
      ["yellow", yellowBar, YELLOW],
      ["cream", creamBar, CREAM],
    ] as const) {
      b.extrude(outline, {
        at: [x + side * 0.019, 0.665, -0.012],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.0015,
        color,
        bone: wing,
        name: `wing${side}${label}`,
        group: "birdTorso",
      });
    }

    // Small black diagonal separator between the feather bars.
    b.rod(
      [x + side * 0.027, 0.697, -0.055],
      [x + side * 0.027, 0.686, 0.065],
      0.004,
      { color: BLACK, bone: wing, name: `wing${side}Separator`, group: "birdTorso" },
    );
  }

  // Bold circular breast medallion, facing directly toward +Z.
  const medallionCenter = [0, 0.64, 0.171] as [number, number, number];
  b.part(new THREE.CylinderGeometry(0.061, 0.061, 0.012, 16), BLACK, {
    at: medallionCenter,
    dir: [0, 0, 1],
    bone: J.body,
    name: "breastMedallionRim",
    group: "birdTorso",
  });
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.015, 16), RED, {
    at: [0, 0.64, 0.179],
    dir: [0, 0, 1],
    bone: J.body,
    name: "breastMedallion",
    group: "birdTorso",
  });

  // A few tiny black studs make the otherwise flat geometry read as constructed,
  // without competing with the head and beak.
  for (const side of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, {
      at: [side * 0.105, 0.69, 0.075],
      bone: J.body,
      name: `torsoRivet${side}`,
      group: "birdTorso",
    });
  }

  return body;
}
```