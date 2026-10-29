<!-- call: plan -->

```json
{
  "name": "Strandwalker",
  "description": "A Theo Jansen-style wind-walking beach creature built from pale PVC tube trusses, with a flapping spine wing, a wind-eating bow and two rows of linked legs striding the sand.",
  "builderName": "strandwalker",
  "size": [2.5, 2.1, 6.2],
  "layout": "A long horizontal tube-truss spine runs the full 6.2 m from nose at z=+3.0 to tail at z=-3.0, riding 0.95 m above the beach on two parallel trains of walking legs (left legs at x≈+1.05, right at x≈-1.05), three legs per side spread along z from +2.4 to -2.4; each leg is the classic Strandbeest linkage — a triangle of rigid tubes from hip, a knee knuckle, a long lower shank and a flat paddle foot, feet flat on y=0. On top of the spine amidships sits a single great wing: a thin spar frame 2.2 m wide across x, rising to y=2.1, cloth panels stretched between tubes, hinged to flap. The bow at the front is the creature's mouth: a fan of short open tubes angled into the wind with a small red crank hub. The stern carries a bundle of wind-stomach bottles and one tall tail fin of stretched sail cloth. The style shows everywhere as skeletal tube frames: every member is a thin cylinder or slim box truss, every connection is a visible dark joint cuff or red pivot hub, pale canvas panels glow against the tubes, and nothing is skinned — the machine reads as bone and ligament from every angle. Front view: bow tubes flared, wing spreading left-right above, legs descending in a forest of thin tubes to paddle feet. The lowest points (the feet) touch y=0.",
  "palette": {
    "tube": "#e8dcc2",
    "tubeShade": "#c9b98f",
    "jointDark": "#3a3f47",
    "crankRed": "#c8452a",
    "sail": "#e2d5ab",
    "sailEdge": "#8f2f22",
    "spineDark": "#5b5648",
    "bottleTeal": "#4e8f86",
    "sand": "#d9c08a"
  },
  "mounts": {
    "spineCenter": [0, 1.5, 0],
    "noseMount": [0, 1.55, 2.7],
    "tailMount": [0, 1.5, -2.7],
    "wingRoot": [0, 1.95, 0.4],
    "hipLineL": [1.05, 1.2, 0],
    "hipLineR": [-1.05, 1.2, 0]
  },
  "joints": [
    { "name": "spine0", "at": [0, 1.5, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spineF", "parent": "spine0", "at": [0, 1.5, 1.5], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spineB", "parent": "spine0", "at": [0, 1.5, -1.5], "dir": [0, 0, 1], "role": "spine" },
    { "name": "nose", "parent": "spineF", "at": [0, 1.55, 2.7], "dir": [0, 0.1, 1], "role": "neck" },
    { "name": "tailRoot", "parent": "spineB", "at": [0, 1.5, -2.7], "dir": [0, 0, -1], "role": "tail" },
    { "name": "wingHinge", "parent": "spine0", "at": [0, 1.95, 0.4], "dir": [1, 0, 0], "role": "hinge" },
    { "name": "hipFL", "parent": "spineF", "at": [1.05, 1.2, 1.9], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipFM", "parent": "spine0", "at": [1.05, 1.2, 0.6], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipFB", "parent": "spineB", "at": [1.05, 1.2, -0.7], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipFR", "parent": "spineF", "at": [-1.05, 1.2, 1.9], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipMR", "parent": "spine0", "at": [-1.05, 1.2, 0.6], "dir": [0, -1, 0], "role": "leg" },
    { "name": "hipBR", "parent": "spineB", "at": [-1.05, 1.2, -0.7], "dir": [0, -1, 0], "role": "leg" }
  ],
  "parts": [
    {
      "id": "spineCore",
      "builds": "The full-length tube truss spine from nose to tail: a horizontal ladder of paired top and bottom chord tubes along z (top chord at y=1.55, bottom at y=1.15) joined by diagonal zig-zag web tubes and dark joint cuffs at every node, cross-braced triangles so the frame reads skeletal from every side. At the bow (z=+2.7..+3.05) the spine flares into the wind mouth: a fan of 9 short open tubes angled up and outward into the wind, ringed by a red crank hub disc, with a small mesh screen grille of thin crossed tubes. Mid-spine carries a row of small red pivot hubs on both sides at the hip mounts, plus a few tiny tube stubs and a hanging thin sensor antenna tube near the front. Colours: main chords in tube, diagonals in tubeShade, all cuffs and node blocks in jointDark, crank and hub details in crankRed, the antenna tip in crankRed.",
      "box": [[-0.55, 0.95, -3.05], [0.55, 1.85, 3.1]],
      "attaches": "Roots at spineCenter and runs through spineF, spineB and nose joints; hands the hip sockets on hipLineL/hipLineR to the leg trains, the wingRoot platform to wingMast, noseMount to itself (bow ends there), and tailMount to the stern.",
      "joints": ["spine0", "spineF", "spineB", "nose"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wingMast",
      "builds": "The great flapping wing above the spine: a central mast tube rising from the spine at wingRoot to y=2.05, carrying a horizontal main spar 2.2 m across x (from x=-1.1 to x=+1.1), with a lighter secondary spar behind it and thin rib tubes connecting them into four bays. Stretched between the spars are sail-cloth panels (thin flat slabs) in sail with darker sailEdge trim strips along the leading edge and a small red pennant flag at the left wingtip. Dark joint cuffs sit at the spar-mast crossings and at the wingHinge pivot; a small red crank arm connects mast to spine so the wing reads as wind-driven. The whole wing is tilted a few degrees and built to be flappable about the hinge.",
      "box": [[-1.2, 1.8, 0.05], [1.2, 2.1, 1.5]],
      "attaches": "Roots on the spine's top chord at mount wingRoot and the joint wingHinge; meets spineCore only there, nothing below y=1.8.",
      "joints": ["wingHinge", "spine0"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "legTrainL",
      "builds": "The left row of three walking legs at x≈+1.05, one per hip joint (hipFL z=+1.9, hipFM z=+0.6, hipFB z=-0.7). Each leg is the Strandbeest linkage built from tubes: a short hip crank tube leaving the socket with a red pivot hub, a triangular rigid frame of three tubes down to a knee knuckle (dark joint cuff), a long lower shank tube angling down and forward, and a lower-joint cuff from which a flat paddle foot (a thin slab, 0.34 long × 0.16 wide) lands flat on y=0. A thin diagonal stay tube ties the leg frame back to a mid point so the triangle silhouette is unmistakable. All three legs are identical but phase-staggered slightly. Additional knee/shank joints are created inside this part parented to its hip. Colours: tubes and shanks in tube, diagonal stays in tubeShade, all knuckles, cuffs and hubs in jointDark, pivot hubs and foot edge strips in crankRed, paddle foot top in sail.",
      "box": [[0.3, 0, 2.55], [1.3, 1.45, -2.55]],
      "attaches": "One leg socket per hip joint (hipFL, hipFM, hipFB) at mount hipLineL; upper crank ends meet the spineCore side hubs; feet land flat on the floor.",
      "joints": ["hipFL", "hipFM", "hipFB"],
      "floor": true,
      "budget": 220
    },
    {
      "id": "legTrainR",
      "builds": "The mirror of legTrainL on the right at x≈-1.05: three identical Strandbeest linkage legs on hipFR (z=+1.9), hipMR (z=+0.6), hipBR (z=-0.7), each with hip crank and red pivot hub, triangular tube frame to a dark knee knuckle, long lower shank, and a flat paddle foot landing on y=0, with a thin diagonal stay tube. Phase-staggered differently from the left row so the gait reads. Colours exactly as the left train: tube, tubeShade, jointDark, crankRed, sail foot tops.",
      "box": [[-1.3, 0, -2.55], [-0.3, 1.45, 2.55]],
      "attaches": "One leg socket per hip joint (hipFR, hipMR, hipBR) at mount hipLineR; upper crank ends meet the spineCore side hubs; feet land flat on the floor.",
      "joints": ["hipFR", "hipMR", "hipBR"],
      "floor": true,
      "budget": 220
    },
    {
      "id": "stern",
      "builds": "The tail assembly behind z=-2.7: a short horizontal tail boom of two tubes leaving the tailMount, then the wind-stomach — a tight bundle of 6 rounded bottles (capsules) in bottleTeal strapped to a small frame with dark straps and one red valve cap on the top bottle — plus a tall triangular tail fin of stretched sail cloth rising from the boom tip to y=2.0, panelled in sail with a sailEdge border and two thin batten tubes across it. The boom ends in a small dark tail knob. Colours: boom tubes in tube, frame in spineDark, straps and knob in jointDark, bottles in bottleTeal, valve in crankRed, fin in sail and sailEdge.",
      "box": [[-0.75, 1.0, -3.25], [0.75, 2.0, -2.55]],
      "attaches": "Roots on the spine end at mount tailMount on joint tailRoot; overlaps spineCore only at the boom root z=-2.55..-2.7.",
      "joints": ["tailRoot"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: legTrainL -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLegTrainL({ b, J, P, M }: Ctx) {
  const tube = P.tube;
  const shade = P.tubeShade;
  const dark = P.jointDark;
  const red = P.crankRed;
  const sail = P.sail;
  const rand = rng(7319);

  const rod = (a: THREE.Vector3 | number[], c: THREE.Vector3 | number[], r: number, color: string, bone?: any) => {
    return b.rod(a, c, r, {
      color,
      bone,
      caps: "flat",
      sides: 8,
      name: "legTrainL.member",
      group: "legTrainL",
    });
  };

  const cuff = (at: THREE.Vector3 | number[], axis: THREE.Vector3 | number[], radius = 0.075, length = 0.13, color = dark, bone?: any) => {
    const part = b.part(new THREE.CylinderGeometry(radius, radius, length, 8), color, {
      at,
      dir: axis,
      bone,
      name: "legTrainL.cuff",
      group: "legTrainL",
      flat: true,
    });
    return part;
  };

  const hub = (at: THREE.Vector3 | number[], bone: any, radius = 0.105, color = red) => {
    return b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      bone,
      name: "legTrainL.pivotHub",
      group: "legTrainL",
      flat: true,
    });
  };

  const addLeg = (index: number, hip: any, z: number, phase: number) => {
    const x = 1.05;

    // The stagger gives the three linkages a readable walking rhythm while
    // remaining a neutral, mechanically plausible resting pose.
    const forward = Math.sin(phase) * 0.18;
    const knee = new THREE.Vector3(0.58 + forward, 0.66, z + 0.13);
    const ankle = new THREE.Vector3(0.82 - forward * 0.45, 0.105, z - 0.18);
    const heel = new THREE.Vector3(0.89 - forward * 0.45, 0.105, z - 0.31);
    const toe = new THREE.Vector3(0.89 - forward * 0.45, 0.105, z - 0.65);

    const kneeJ = b.joint(`legTrainLKnee${index}`, {
      parent: hip,
      at: knee,
      dir: [0, -1, 0],
      role: "hinge",
      group: "legTrainL",
    });
    const ankleJ = b.joint(`legTrainLAnkle${index}`, {
      parent: kneeJ,
      at: ankle,
      dir: [0, 0, -1],
      role: "hinge",
      group: "legTrainL",
    });
    const footJ = b.joint(`legTrainLFoot${index}`, {
      parent: ankleJ,
      at: heel,
      dir: [0, 0, -1],
      role: "digit",
      group: "legTrainL",
    });

    // Short crank from the spine socket, with a dark bearing and bright pin.
    const crankEnd = new THREE.Vector3(0.78, 1.03, z + 0.22 + Math.sin(phase) * 0.05);
    rod(hip.at, crankEnd, 0.038, tube, hip);
    cuff(hip.at, [0, 1, 0], 0.095, 0.15, dark, hip);
    hub(hip.at, hip, 0.12, red);
    hub(crankEnd, hip, 0.07, red);

    // The unmistakable triangular upper linkage:
    // socket → knee, socket → ankle, knee → ankle.
    rod(crankEnd, knee, 0.034, tube, kneeJ);
    rod(hip.at, knee, 0.031, shade, hip);
    rod(hip.at, ankle, 0.031, tube, ankleJ);
    rod(knee, ankle, 0.043, tube, ankleJ);

    // Cross-stay makes the triangle read from the front and side.
    const stay = new THREE.Vector3(0.98, 0.92, z - 0.02);
    rod(knee, stay, 0.021, shade, kneeJ);
    rod(stay, ankle, 0.021, shade, ankleJ);
    cuff(stay, [0, -1, 0], 0.045, 0.09, dark, kneeJ);

    // Large lower shank, deliberately leaning forward in the walking pose.
    rod(knee, heel, 0.052, tube, ankleJ);
    rod(knee, new THREE.Vector3(0.70, 0.33, z - 0.08), 0.022, shade, kneeJ);
    cuff(knee, [0, -1, 0], 0.095, 0.16, dark, kneeJ);
    hub(knee, kneeJ, 0.078, red);
    cuff(ankle, [0, 0, -1], 0.082, 0.14, dark, ankleJ);
    hub(ankle, ankleJ, 0.062, red);

    // Flat paddle foot: broad, thin, and genuinely touching the beach.
    const foot = b.slab(
      [
        [0.98, 0.08, z + 0.11],
        [0.98, 0.08, z - 0.56],
        [0.80, 0.08, z - 0.64],
        [0.80, 0.08, z + 0.03],
      ],
      {
        color: sail,
        thickness: 0.035,
        bone: footJ,
        name: "legTrainL.paddle",
        group: "legTrainL",
      },
    );

    // Red perimeter rails and toe bumper emphasize the paddle silhouette.
    rod([0.98, 0.105, z + 0.11], [0.98, 0.105, z - 0.56], 0.014, red, footJ);
    rod([0.80, 0.105, z + 0.03], [0.80, 0.105, z - 0.64], 0.014, red, footJ);
    rod([0.80, 0.105, z - 0.64], [0.98, 0.105, z - 0.56], 0.017, red, footJ);
    cuff([0.89, 0.105, z - 0.64], [0, 1, 0], 0.035, 0.07, dark, footJ);

    // Small paired bolts on each paddle make the flat foot read as fabricated.
    for (const dz of [-0.46, -0.22, 0.02]) {
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.018, 8), red, {
        at: [0.87, 0.12, z + dz],
        dir: [0, 1, 0],
        bone: footJ,
        name: "legTrainL.footBolt",
        group: "legTrainL",
        flat: true,
      });
    }

    // A second narrow ligament returns from the lower joint toward the socket.
    rod(ankle, new THREE.Vector3(1.16, 0.78, z + 0.18), 0.019, shade, ankleJ);
    rod(new THREE.Vector3(1.16, 0.78, z + 0.18), hip.at, 0.019, shade, hip);
  };

  addLeg(0, J.hipFL, 1.9, 0.0);
  addLeg(1, J.hipFM, 0.6, 2.05);
  addLeg(2, J.hipFB, -0.7, 4.15);

  // A slim longitudinal synchronising rail links the three hip pivots,
  // visually tying this train into the spine's side hubs.
  const railA = new THREE.Vector3(1.05, 1.2, 2.08);
  const railB = new THREE.Vector3(1.05, 1.2, -0.88);
  rod(railA, railB, 0.022, shade, J.hipFM);
  for (const z of [1.9, 0.6, -0.7]) {
    cuff([1.05, 1.2, z], [0, 0, 1], 0.045, 0.12, dark, J.hipFM);
    hub([1.05, 1.2, z], J.hipFM, 0.055, red);
  }
}
```

<!-- call: wingMast -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildWingMast({ b, J, P, M }: Ctx) {
  const tube = P.tube;
  const shade = P.tubeShade;
  const dark = P.jointDark;
  const red = P.crankRed;
  const sail = P.sail;
  const edge = P.sailEdge;

  const hinge = J.wingHinge;
  const root = M.wingRoot as [number, number, number];

  const mastBase: [number, number, number] = [root[0], 1.96, root[2]];
  const mastTop: [number, number, number] = [0, 2.065, 0.72];

  // A dedicated hinge child gives the wing a recognisable flap pivot without
  // introducing any geometry below the specified wing box.
  const hatch = b.joint("wingMastHatch", {
    parent: hinge,
    at: mastBase,
    dir: [0, 1, 0],
    role: "hinge",
    group: "wingMast",
  });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any = hatch,
    name?: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      bone,
      name,
      group: "wingMast",
      caps: "round",
      sides: 8,
    });

  const cuff = (
    p: [number, number, number],
    radius = 0.055,
    color = dark,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, 0.075, 8), color, {
      at: p,
      bone: hatch,
      dir: [0, 1, 0],
      name,
      group: "wingMast",
      flat: true,
    });

  // Central mast, with a short rear heel and a visible cap.
  rod(mastBase, [0, 2.01, 0.58], 0.035, tube, hatch, "wingMast.mastHeel");
  rod([0, 2.01, 0.58], mastTop, 0.044, tube, hatch, "wingMast.mast");
  cuff(mastBase, 0.06, dark, "wingMast.hingeCuff");
  cuff(mastTop, 0.055, dark, "wingMast.mastCap");

  // Two long spars form the upper and lower edges of the sail.
  const left = 1.1;
  const mainY = 2.055;
  const rearY = 2.015;
  const frontZ = 0.34;
  const rearZ = 1.34;

  const mainA: [number, number, number] = [-left, mainY, frontZ];
  const mainB: [number, number, number] = [left, mainY, frontZ];
  const rearA: [number, number, number] = [-left * 0.96, rearY, rearZ];
  const rearB: [number, number, number] = [left * 0.96, rearY, rearZ];

  rod(mainA, mainB, 0.032, tube, hatch, "wingMast.mainSpar");
  rod(rearA, rearB, 0.024, shade, hatch, "wingMast.secondarySpar");

  // Four bays: their panels are deliberately separate, like stitched
  // membranes on a kinetic sculpture.
  const xs = [-1.1, -0.55, 0, 0.55, 1.1];
  for (let i = 0; i < 4; i++) {
    const x0 = xs[i] + 0.018;
    const x1 = xs[i + 1] - 0.018;

    const p0: [number, number, number] = [x0, mainY - 0.012, frontZ + 0.018];
    const p1: [number, number, number] = [x1, mainY - 0.012, frontZ + 0.018];
    const p2: [number, number, number] = [x1, rearY - 0.012, rearZ - 0.018];
    const p3: [number, number, number] = [x0, rearY - 0.012, rearZ - 0.018];

    b.slab([p0, p1, p2, p3], {
      color: sail,
      thickness: 0.012,
      bone: hatch,
      group: "wingMast",
      name: `wingMast.sailBay${i}`,
    });

    // Fine red seam down each bay boundary.
    const seam0: [number, number, number] = [xs[i], mainY + 0.006, frontZ + 0.01];
    const seam1: [number, number, number] = [xs[i], rearY + 0.006, rearZ - 0.01];
    rod(seam0, seam1, 0.009, edge, hatch, `wingMast.seam${i}`);
  }

  // Ribs run from the leading spar to the secondary spar.
  for (let i = 0; i <= 4; i++) {
    const x = xs[i];
    const a: [number, number, number] = [x, mainY + 0.012, frontZ];
    const c: [number, number, number] = [
      x * 0.96,
      rearY + 0.012,
      rearZ,
    ];
    rod(a, c, 0.014, shade, hatch, `wingMast.rib${i}`);
    cuff(a, 0.035, dark, `wingMast.frontCuff${i}`);
    cuff(c, 0.031, dark, `wingMast.rearCuff${i}`);
  }

  // Heavy leading-edge and trailing-edge trim.
  rod(
    [-left, mainY + 0.018, frontZ],
    [left, mainY + 0.018, frontZ],
    0.012,
    edge,
    hatch,
    "wingMast.leadingTrim",
  );
  rod(
    [-left * 0.96, rearY + 0.018, rearZ],
    [left * 0.96, rearY + 0.018, rearZ],
    0.009,
    edge,
    hatch,
    "wingMast.trailingTrim",
  );

  // Short triangular braces make the mast read as a trussed structure.
  rod([0, 2.02, 0.58], [-0.55, mainY, frontZ], 0.016, shade, hatch, "wingMast.braceL");
  rod([0, 2.02, 0.58], [0.55, mainY, frontZ], 0.016, shade, hatch, "wingMast.braceR");
  rod([0, 2.02, 0.58], [0, rearY, rearZ], 0.014, shade, hatch, "wingMast.rearBrace");

  // Red crank arm from the hinge to the mast, with a pivot disc at each end.
  const crankTop: [number, number, number] = [0.085, 2.025, 0.69];
  rod([0.085, 1.965, 0.4], crankTop, 0.019, red, hinge, "wingMast.crank");
  b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.026, 12), red, {
    at: [0.085, 1.965, 0.4],
    bone: hinge,
    dir: [0, 1, 0],
    group: "wingMast",
    name: "wingMast.crankHub",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 10), red, {
    at: crankTop,
    bone: hatch,
    dir: [1, 0, 0],
    group: "wingMast",
    name: "wingMast.crankPin",
    flat: true,
  });

  // Small pennant on the creature's left wingtip (+X).
  const pennantBase: [number, number, number] = [1.095, 2.055, frontZ];
  rod(pennantBase, [1.095, 2.09, 0.62], 0.009, edge, hatch, "wingMast.pennantPole");
  b.extrude(
    [
      [0, 0],
      [0.27, -0.035],
      [0.18, -0.13],
      [0, -0.1, "sharp"],
    ],
    {
      at: [1.095, 2.09, 0.62],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.009,
      bevel: 0.002,
      color: red,
      bone: hatch,
      group: "wingMast",
      name: "wingMast.pennant",
    },
  );

  // Tiny pale cap and dark pivot washer at the main mast crossing.
  cuff([0, mainY, frontZ], 0.048, dark, "wingMast.mainCrossing");
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.018, 10), red, {
    at: [0, mainY + 0.035, frontZ],
    bone: hatch,
    dir: [0, 1, 0],
    group: "wingMast",
    name: "wingMast.crossPin",
    flat: true,
  });
}
```

<!-- call: legTrainR -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLegTrainR({ b, J, P, M }: Ctx) {
  const tube = P.tube;
  const tubeShade = P.tubeShade;
  const jointDark = P.jointDark;
  const crankRed = P.crankRed;
  const sail = P.sail;

  const hipNames = ["hipFR", "hipMR", "hipBR"];
  const zStarts = [1.9, 0.6, -0.7];
  const phases = [0.10, -0.05, 0.16];

  const cuff = (name: string, at: [number, number, number], bone: any, radius = 0.075) => {
    return b.part(
      new THREE.SphereGeometry(radius, 8, 6),
      jointDark,
      { name, group: "legTrainR", bone, at },
    );
  };

  const pivot = (name: string, at: [number, number, number], bone: any, radius = 0.058) => {
    return b.part(
      new THREE.SphereGeometry(radius, 8, 6),
      crankRed,
      { name, group: "legTrainR", bone, at },
    );
  };

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any,
  ) => {
    return b.rod(a, c, radius, {
      name,
      group: "legTrainR",
      color,
      bone,
      caps: "flat",
      section: { ngon: 6 },
    });
  };

  for (let i = 0; i < 3; i++) {
    const hip = J[hipNames[i]];
    const z = zStarts[i];
    const phase = phases[i];

    // The right-hand train is deliberately offset in x and phase from the left train.
    const hipAt: [number, number, number] = [-1.05, 1.2, z];

    const kneeAt: [number, number, number] = [
      -0.72,
      0.72 + phase,
      z + 0.18 - phase * 0.35,
    ];

    const ankleAt: [number, number, number] = [
      -0.94,
      0.185,
      z + 0.38 + phase * 0.45,
    ];

    const footAt: [number, number, number] = [
      -0.94,
      0.018,
      z + 0.42 + phase * 0.45,
    ];

    const crankAt: [number, number, number] = [
      -0.82,
      1.04 + phase * 0.35,
      z - 0.20 - phase * 0.2,
    ];

    const rearCrankAt: [number, number, number] = [
      -1.23,
      0.98 - phase * 0.25,
      z + 0.08,
    ];

    const knee = b.joint(`legTrainR${i}Knee`, {
      parent: hip,
      at: kneeAt,
      dir: [
        ankleAt[0] - kneeAt[0],
        ankleAt[1] - kneeAt[1],
        ankleAt[2] - kneeAt[2],
      ],
      role: "leg",
      group: "legTrainR",
    });

    const ankle = b.joint(`legTrainR${i}Ankle`, {
      parent: knee,
      at: ankleAt,
      dir: [0, -1, 0],
      role: "hinge",
      group: "legTrainR",
    });

    const foot = b.joint(`legTrainR${i}Foot`, {
      parent: ankle,
      at: footAt,
      dir: [0, 0, 1],
      role: "digit",
      group: "legTrainR",
    });

    // Short rotating hip crank and its two visible pivot bosses.
    rod(`legTrainR${i}Crank`, hipAt, crankAt, 0.031, tube, hip);
    pivot(`legTrainR${i}HipPivot`, hipAt, hip, 0.078);
    pivot(`legTrainR${i}CrankPivot`, crankAt, hip, 0.047);

    // A rear crank gives the upper linkage the characteristic Strandbeest triangle.
    rod(`legTrainR${i}RearCrank`, hipAt, rearCrankAt, 0.027, tubeShade, hip);
    pivot(`legTrainR${i}RearPivot`, rearCrankAt, hip, 0.041);

    // Main triangular frame: upper forward member, upper rear stay, and lower return.
    rod(`legTrainR${i}UpperForward`, crankAt, kneeAt, 0.035, tube, hip);
    rod(`legTrainR${i}UpperRear`, rearCrankAt, kneeAt, 0.030, tubeShade, hip);
    rod(`legTrainR${i}TriangleBase`, crankAt, rearCrankAt, 0.024, tubeShade, hip);

    // Long lower shank and a second diagonal tie-back make the leg read as a rigid truss.
    rod(`legTrainR${i}LongShank`, kneeAt, ankleAt, 0.040, tube, knee);
    rod(`legTrainR${i}DiagonalStay`, rearCrankAt, ankleAt, 0.024, tubeShade, hip);
    rod(`legTrainR${i}LowerReturn`, kneeAt, footAt, 0.026, tube, knee);

    cuff(`legTrainR${i}KneeCuff`, kneeAt, knee, 0.083);
    cuff(`legTrainR${i}AnkleCuff`, ankleAt, ankle, 0.071);
    cuff(`legTrainR${i}FootCuff`, footAt, foot, 0.058);

    // Flat sand paddle, aligned along z and kept exactly on the floor.
    b.part(
      new THREE.BoxGeometry(0.17, 0.036, 0.34),
      sail,
      {
        name: `legTrainR${i}Paddle`,
        group: "legTrainR",
        bone: foot,
        at: footAt,
      },
    );

    // Red edge rails protect the paddle and visually connect it to the crank system.
    const frontEdge: [number, number, number] = [
      footAt[0],
      0.041,
      footAt[2] + 0.155,
    ];
    const backEdge: [number, number, number] = [
      footAt[0],
      0.041,
      footAt[2] - 0.155,
    ];

    rod(
      `legTrainR${i}PaddleFrontRail`,
      [-1.025, 0.041, frontEdge[2]],
      [-0.855, 0.041, frontEdge[2]],
      0.012,
      crankRed,
      foot,
    );
    rod(
      `legTrainR${i}PaddleBackRail`,
      [-1.025, 0.041, backEdge[2]],
      [-0.855, 0.041, backEdge[2]],
      0.012,
      crankRed,
      foot,
    );

    // Two small transverse braces across the paddle emphasize the open skeletal construction.
    rod(
      `legTrainR${i}PaddleBraceA`,
      [-1.015, 0.052, footAt[2] - 0.065],
      [-0.865, 0.052, footAt[2] - 0.065],
      0.009,
      tubeShade,
      foot,
    );
    rod(
      `legTrainR${i}PaddleBraceB`,
      [-1.015, 0.052, footAt[2] + 0.065],
      [-0.865, 0.052, footAt[2] + 0.065],
      0.009,
      tubeShade,
      foot,
    );
  }
}
```

<!-- call: spineCore -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildSpineCore({ b, J, P, M }: Ctx) {
  const tube = P.tube;
  const shade = P.tubeShade;
  const dark = P.jointDark;
  const red = P.crankRed;

  const spine0 = J.spine0;
  const spineF = J.spineF;
  const spineB = J.spineB;
  const nose = J.nose;

  const boneAt = (p: [number, number, number]) => {
    if (p[2] > 1.25) return spineF;
    if (p[2] < -1.25) return spineB;
    return spine0;
  };

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone = boneAt(a),
  ) => {
    b.rod(a, c, radius, { color, bone, caps: "flat" });
  };

  const capsule = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone = boneAt(a),
  ) => {
    b.capsule(a, c, radius, { color, bone });
  };

  const node = (
    p: [number, number, number],
    radius = 0.065,
    color = dark,
    bone = boneAt(p),
  ) => {
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      bone,
      flat: true,
    });
  };

  const cuff = (
    p: [number, number, number],
    length = 0.14,
    radius = 0.075,
    color = dark,
    bone = boneAt(p),
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, length, 8), color, {
      at: p,
      bone,
      flat: true,
    });
  };

  const hub = (
    p: [number, number, number],
    radius = 0.09,
    color = red,
    bone = boneAt(p),
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, 0.045, 12), color, {
      at: p,
      bone,
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(radius * 0.34, radius * 0.34, 0.052, 10), dark, {
      at: p,
      bone,
      dir: [1, 0, 0],
      flat: true,
    });
  };

  // Main ladder: paired chord tubes, deliberately faceted and slightly warm.
  const zs = [-3.02, -2.52, -2.02, -1.52, -1.02, -0.52, 0, 0.52, 1.02, 1.52, 2.02, 2.52, 3.02];
  const top: [number, number, number][] = zs.map((z) => [0, 1.55, z]);
  const bottom: [number, number, number][] = zs.map((z) => [0, 1.15, z]);

  for (let i = 0; i < zs.length - 1; i++) {
    rod(top[i], top[i + 1], 0.035, tube);
    rod(bottom[i], bottom[i + 1], 0.035, tube);
  }

  // Broad end caps and repeated dark node collars.
  for (let i = 0; i < zs.length; i++) {
    const bone = boneAt(top[i]);
    cuff(top[i], 0.12, 0.058, dark, bone);
    cuff(bottom[i], 0.12, 0.058, dark, bone);
    node([0, 1.55, zs[i]], 0.056, dark, bone);
    node([0, 1.15, zs[i]], 0.056, dark, bone);
  }

  // Alternating zig-zag webbing on both visible sides of the ladder.
  for (let i = 0; i < zs.length - 1; i++) {
    const z0 = zs[i];
    const z1 = zs[i + 1];
    if (i % 2 === 0) {
      rod([0, 1.55, z0], [0, 1.15, z1], 0.025, shade);
      rod([0, 1.15, z0], [0, 1.55, z1], 0.025, shade);
    } else {
      rod([0, 1.55, z0], [0, 1.15, z1], 0.022, shade);
    }
  }

  // Side outriggers: the spine hands obvious sockets to both rows of legs.
  for (const s of [1, -1]) {
    for (const z of [1.9, 0.6, -0.7]) {
      const socket: [number, number, number] = [s * 1.05, 1.2, z];
      const shoulder: [number, number, number] = [s * 0.08, 1.36, z];
      rod(shoulder, socket, 0.032, shade);
      rod([s * 0.08, 1.58, z - 0.16], socket, 0.025, tube);
      node(socket, 0.075, dark);
      hub(socket, 0.102, red);
      rod([s * 0.91, 1.2, z - 0.12], socket, 0.018, shade);
      rod([s * 0.91, 1.2, z + 0.12], socket, 0.018, shade);
    }
  }

  // Cross braces on the underside make triangular truss silhouettes from front and rear.
  for (let i = 1; i < zs.length - 1; i += 2) {
    rod([-0.16, 1.19, zs[i] - 0.24], [0.16, 1.19, zs[i] + 0.24], 0.018, shade);
    rod([0.16, 1.19, zs[i] - 0.24], [-0.16, 1.19, zs[i] + 0.24], 0.018, shade);
  }

  // A small top platform for the wing mast, with four dark mounting blocks.
  const platformA: [number, number, number] = [-0.28, 1.61, 0.18];
  const platformB: [number, number, number] = [0.28, 1.61, 0.18];
  const platformC: [number, number, number] = [-0.28, 1.61, 0.68];
  const platformD: [number, number, number] = [0.28, 1.61, 0.68];
  rod(platformA, platformB, 0.028, tube, spine0);
  rod(platformC, platformD, 0.028, tube, spine0);
  rod(platformA, platformC, 0.026, shade, spine0);
  rod(platformB, platformD, 0.026, shade, spine0);
  for (const p of [platformA, platformB, platformC, platformD]) node(p, 0.052, dark, spine0);

  // Bow wind mouth: a red throat ring and nine flared open intake tubes.
  const throat: [number, number, number] = [0, 1.55, 2.72];
  const throatOuter: [number, number, number] = [0, 1.55, 2.86];
  rod([0, 1.55, 2.48], throat, 0.043, tube, nose);
  hub(throat, 0.13, red, nose);
  cuff(throatOuter, 0.17, 0.09, dark, nose);

  const fanAngles = [-62, -46.5, -31, -15.5, 0, 15.5, 31, 46.5, 62];
  for (let i = 0; i < fanAngles.length; i++) {
    const a = fanAngles[i] * Math.PI / 180;
    const x = Math.sin(a) * 0.48;
    const y = 1.55 + Math.cos(a) * 0.32;
    const end: [number, number, number] = [x, y, 3.08];
    const base: [number, number, number] = [
      Math.sin(a) * 0.105,
      1.55 + Math.cos(a) * 0.07,
      2.76,
    ];
    rod(base, end, 0.025, i % 2 ? tube : shade, nose);
    node(end, 0.038, dark, nose);
  }

  // Intake grille: two crossed screens just behind the fan mouths.
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.18;
    rod([x, 1.25, 2.88], [x, 1.85, 2.88], 0.014, shade, nose);
    rod([x - 0.22, 1.35, 2.90], [x + 0.22, 1.75, 2.90], 0.012, tube, nose);
  }
  rod([-0.42, 1.55, 2.88], [0.42, 1.55, 2.88], 0.018, dark, nose);

  // Little crank arm projecting from the bow hub.
  rod([0, 1.55, 2.79], [0.22, 1.72, 2.91], 0.026, red, nose);
  node([0.22, 1.72, 2.91], 0.045, dark, nose);

  // Small repeating red pivot markers on each side of the amidships rail.
  for (const s of [1, -1]) {
    for (const z of [1.45, 0.45, -0.55, -1.55]) {
      const p: [number, number, number] = [s * 0.26, 1.36, z];
      hub(p, 0.052, red, boneAt(p));
      rod([s * 0.08, 1.36, z], [s * 0.31, 1.36, z], 0.016, shade, boneAt(p));
    }
  }

  // Three small service stubs beneath the frame.
  for (const z of [1.85, 0.15, -1.55]) {
    rod([0, 1.15, z], [0, 1.03, z - 0.08], 0.018, shade, boneAt([0, 1.15, z]));
    node([0, 1.03, z - 0.08], 0.032, dark, boneAt([0, 1.15, z]));
  }

  // Hanging sensor antenna near the front, with a bright red bead.
  const antennaBase: [number, number, number] = [0.24, 1.48, 1.95];
  const antennaTip: [number, number, number] = [0.24, 0.98, 1.88];
  rod(antennaBase, antennaTip, 0.012, dark, spineF);
  node(antennaTip, 0.035, red, spineF);
  rod([0.18, 1.5, 1.95], [0.30, 1.5, 1.95], 0.015, tube, spineF);

  // A final pair of diagonal nose braces visually closes the truss before the mouth.
  rod([-0.26, 1.55, 2.22], [0.26, 1.15, 2.68], 0.024, shade, spineF);
  rod([0.26, 1.55, 2.22], [-0.26, 1.15, 2.68], 0.024, shade, spineF);
  node([-0.26, 1.55, 2.22], 0.045, dark, spineF);
  node([0.26, 1.55, 2.22], 0.045, dark, spineF);
}
```

<!-- call: stern -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildStern({ b, J, P, M }: any) {
  const bone = J.tailRoot;
  const tube = P.tube ?? "#e8dcc2";
  const tubeShade = P.tubeShade ?? "#c9b98f";
  const dark = P.jointDark ?? "#3a3f47";
  const red = P.crankRed ?? "#c8452a";
  const sail = P.sail ?? "#e2d5ab";
  const edge = P.sailEdge ?? "#8f2f22";
  const teal = P.bottleTeal ?? "#4e8f86";
  const spine = P.spineDark ?? "#5b5648";

  const rod = (a: any, c: any, r: number, color: string, name = "sternMember") =>
    b.rod(a, c, r, { color, bone, name });

  // Twin tail-boom chords, rooted into the supplied tail mount.
  rod([0.16, 1.57, -2.66], [0.24, 1.50, -3.18], 0.035, tube, "sternBoomL");
  rod([-0.16, 1.57, -2.66], [-0.24, 1.50, -3.18], 0.035, tube, "sternBoomR");
  rod([0, 1.48, -2.66], [0, 1.48, -3.20], 0.022, spine, "sternBoomSpine");
  rod([0.16, 1.57, -2.66], [-0.16, 1.57, -2.66], 0.026, dark, "sternRootBrace");
  rod([0.24, 1.50, -3.18], [-0.24, 1.50, -3.18], 0.026, dark, "sternTipBrace");

  for (const x of [-0.16, 0.16]) {
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.055, 8), dark, {
      bone,
      at: [x, 1.57, -2.67],
      dir: [0, 0, 1],
      name: "sternRootCuff",
    });
  }

  b.part(new THREE.SphereGeometry(0.075, 8, 6), dark, {
    bone,
    at: [0, 1.48, -3.22],
    name: "sternTailKnob",
  });

  // Six rounded wind-stomach bottles in two rows.
  const bottlePositions = [
    [-0.30, 1.25, -2.91],
    [0.00, 1.25, -2.91],
    [0.30, 1.25, -2.91],
    [-0.30, 1.55, -2.91],
    [0.00, 1.55, -2.91],
    [0.30, 1.55, -2.91],
  ];

  bottlePositions.forEach((p: number[], i: number) => {
    b.capsule(
      p,
      [p[0], p[1] + 0.10, p[2]],
      0.075,
      { color: teal, bone, name: `sternBottle${i}` },
    );

    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.035, 8), dark, {
      bone,
      at: [p[0], p[1] + 0.205, p[2]],
      name: "sternBottleNeck",
    });
  });

  // Bottle rack.
  rod([-0.39, 1.15, -2.82], [0.39, 1.15, -2.82], 0.018, spine, "sternRackLow");
  rod([-0.39, 1.72, -2.82], [0.39, 1.72, -2.82], 0.018, spine, "sternRackHigh");
  rod([-0.40, 1.15, -3.01], [-0.40, 1.72, -3.01], 0.018, spine, "sternRackSideL");
  rod([0.40, 1.15, -3.01], [0.40, 1.72, -3.01], 0.018, spine, "sternRackSideR");

  // Two dark retaining straps, each doubled for a clear mechanical silhouette.
  for (const z of [-2.84, -3.00]) {
    rod([-0.44, 1.12, z], [0.44, 1.12, z], 0.025, dark, "sternStrapLower");
    rod([-0.44, 1.70, z], [0.44, 1.70, z], 0.025, dark, "sternStrapUpper");
  }

  // Red valve cap above the central upper bottle.
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 8), red, {
    bone,
    at: [0, 1.82, -2.91],
    name: "sternValveCap",
  });

  // A tall, narrow triangular sail fin.
  const fin = [
    [-0.055, 1.58, -3.12],
    [0.055, 1.58, -3.12],
    [0.055, 2.00, -2.72],
    [-0.055, 2.00, -2.72],
  ];

  b.slab(fin, {
    color: sail,
    thickness: 0.012,
    bone,
    name: "sternSailFin",
  });

  // Contrasting perimeter and two horizontal battens.
  rod([-0.065, 1.56, -3.14], [0.065, 1.56, -3.14], 0.014, edge, "sternFinFoot");
  rod([0.065, 1.56, -3.14], [0.065, 2.02, -2.70], 0.014, edge, "sternFinEdgeR");
  rod([-0.065, 1.56, -3.14], [-0.065, 2.02, -2.70], 0.014, edge, "sternFinEdgeL");
  rod([-0.065, 2.02, -2.70], [0.065, 2.02, -2.70], 0.014, edge, "sternFinTop");
  rod([-0.06, 1.73, -2.98], [0.06, 1.73, -2.98], 0.012, tubeShade, "sternBattenLower");
  rod([-0.06, 1.87, -2.84], [0.06, 1.87, -2.84], 0.012, tubeShade, "sternBattenUpper");

  // Small hinged hatch and valve stem, parented beneath tailRoot.
  const hatch = b.joint("sternHatch", {
    parent: bone,
    at: [0, 1.82, -2.91],
    dir: [0, 1, 0],
    role: "hinge",
  });

  b.part(new THREE.BoxGeometry(0.13, 0.025, 0.10), dark, {
    bone: hatch,
    at: [0, 1.84, -2.91],
    name: "sternHatchPlate",
  });

  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8), red, {
    bone: hatch,
    at: [0, 1.91, -2.91],
    name: "sternValveStem",
  });
}
```