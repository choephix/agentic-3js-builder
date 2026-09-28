// Great Hammerhead Shark (Sphyrna mokarran), 4.0 m.
// A majestic pelagic apex predator in a swimming rest pose: a broad, wing-like cephalofoil with distinct anterior
// scallops and lateral eye turrets, an enormous falcate first dorsal fin, sweeping pectoral fins whose tips touch
// the floor at y = 0, a smaller second dorsal and anal fin, and a dramatic heterocercal caudal fin whose upper
// lobe continues the vertebral column. The ventral mouth is built with separate upper and articulated lower jaws,
// posed open to display interlocking double rows of triangular teeth and a fleshy oral cavity. Five pairs of vertical
// gill slits line the neck flanks, ampullae of Lorenzini pores pepper the ventral rostrum, paired pelvic fins feature
// male claspers, and lateral keels stabilise the caudal peduncle.
import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  SphereGeometry,
  Vector3,
} from "three";
import { createBuilder } from "../src/builder";
import { offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import { catmull, polyline } from "../src/path";

export const meta = {
  name: "Hammerhead Shark",
  description:
    "A 4 m great hammerhead shark in a swimming rest pose: broad scalloped cephalofoil, tall falcate dorsal fin, heterocercal tail, and an open toothy ventral jaw.",
  builtBy: "Gemini 3.8 Flash",
};

const DORSAL = "#2c3640";
const FLANK = "#4e5c6b";
const LATERAL = "#728190";
const VENTRAL = "#eef1f3";
const FIN_TIP = "#14181d";
const MOUTH = "#d48882";
const TOOTH = "#f8f5ee";
const EYE = "#9ea578";
const PUPIL = "#0c0f12";
const EYELID = "#263038";
const GILL = "#14181c";
const PORE = "#252e36";
const NOSTRIL = "#192026";
const CLASPER = "#566472";

/** Triangular prism shark tooth pointing from base toward tip. */
function toothGeometry(width: number, height: number, thickness: number) {
  const hw = width / 2;
  const ht = thickness / 2;
  const vertices = [
    // base vertices (0..3)
    -hw,
    0,
    -ht,
    hw,
    0,
    -ht,
    hw,
    0,
    ht,
    -hw,
    0,
    ht,
    // tip vertex (4)
    0,
    height,
    0,
  ];
  const indices = [
    // base
    0, 2, 1, 0, 3, 2,
    // front face
    3, 2, 4,
    // back face
    1, 0, 4,
    // left face
    0, 3, 4,
    // right face
    2, 1, 4,
  ];
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export default function build() {
  const b = createBuilder({ name: "hammerheadShark" });
  const random = rng(7);

  // ---------------------------------------------------------------- Skeleton & Spine
  // Root joint `hips` at the pelvic region / center of the lower vertebral column.
  const hipsPos: V3 = [0, 0.59, -0.45];
  const hips = b.joint("hips", { at: hipsPos, role: "spine", group: "body" });

  // Forward spine through mid-torso, chest, and neck to skull base.
  // 4 spans -> 4 joints: spine1 (mid torso), chest (1st dorsal & pectoral fins), neck1 (gills), neck2 (skull base).
  const spineCurve = catmull([hipsPos, [0, 0.6, 0.05], [0, 0.6, 0.45], [0, 0.6, 0.85], [0, 0.6, 1.15]]);
  const spine = b.chain("spine", spineCurve, {
    parent: hips,
    names: ["spine1", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[1];
  const neck1 = spine.joints[2];
  const neck2 = spine.joints[3];

  // Head joint at the base of the cephalofoil.
  const skull = b.joint("head", {
    parent: neck2,
    at: [0, 0.6, 1.15],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  // Articulated Lower Jaw joint located at the posterior mandibular hinge.
  const jawHinge: V3 = [0, 0.525, 0.9];
  const jaw = b.joint("jaw", {
    parent: skull,
    at: jawHinge,
    aim: [0, 0.51, 1.08],
    role: "jaw",
    group: "jaw",
  });

  // Backward spine through abdomen, pelvic area, peduncle, and extending into the upper caudal lobe.
  // 6 spans -> 6 joints: tail1 (2nd dorsal & anal fin root), tail2 (peduncle), tail3 (precaudal base),
  // caudal1 (lower lobe & fork), caudal2 (mid upper lobe), caudal3 (distal upper lobe).
  const tailCurve = catmull([
    hipsPos,
    [0, 0.58, -0.9],
    [0, 0.58, -1.3],
    [0, 0.58, -1.65],
    [0, 0.72, -1.95],
    [0, 0.96, -2.25],
    [0, 1.26, -2.55],
  ]);
  const tail = b.chain("tail", tailCurve, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "caudal1", "caudal2", "caudal3"],
    role: "tail",
    group: "tail",
  });
  const tail1 = tail.joints[0];
  const tail2 = tail.joints[1];
  const tail3 = tail.joints[2];
  const caudal1 = tail.joints[3];
  const caudal2 = tail.joints[4];
  const caudal3 = tail.joints[5];

  // ---------------------------------------------------------------- Main Fusiform Body Trunk
  // Lofted anterior body stations running forward from hips to neck, skinned smoothly to `spine`.
  const trunkStations = [
    { at: [0, 0.59, -0.48], w: 0.41, h: 0.37 }, // slight overlap with tail tube
    { at: [0, 0.59, -0.45], w: 0.43, h: 0.38 }, // hips
    { at: [0, 0.6, 0.05], w: 0.56, h: 0.46 }, // mid torso (spine1)
    { at: [0, 0.6, 0.45], w: 0.6, h: 0.5 }, // chest / 1st dorsal root (chest)
    { at: [0, 0.6, 0.85], w: 0.54, h: 0.42 }, // gills (neck1)
    { at: [0, 0.6, 1.15], w: 0.44, h: 0.32 }, // neck / skull base (neck2)
  ] as const;

  const bellySag = (t: number) => Math.sin(Math.PI * t) * -0.025;
  const bodyTrunk = b.loft(trunkStations, {
    bone: spine,
    color: FLANK,
    sectors: [
      [-56, 56, DORSAL],
      [100, 126, LATERAL],
      [126, 234, VENTRAL],
      [234, 260, LATERAL],
    ],
    shift: (t) => [0, bellySag(t)],
    sides: 14,
    group: "body",
  });

  // ---------------------------------------------------------------- Posterior Tail Tube & Spine
  // Smoothly swept tail tube from hips through caudal peduncle to the tip of the upper caudal lobe.
  // Directly swept on the `tail` chain so all 6 tail vertebrae skin and flex smoothly!
  const tailRadii = (t: number): readonly [number, number] => {
    if (t <= 0.55) {
      // Hips to precaudal base (t = 0..0.55)
      const u = t / 0.55;
      const rx = 0.215 * (1 - u) + 0.05 * u;
      const ry = 0.19 * (1 - u) + 0.07 * u;
      return [rx, ry] as const;
    } else {
      // Upper caudal fin spine extending to tip (t = 0.55..1.0)
      const u = (t - 0.55) / 0.45;
      const rx = 0.05 * (1 - 0.82 * u);
      const ry = 0.07 * (1 - 0.82 * u);
      return [rx, ry] as const;
    }
  };

  b.sweep(tail, tailRadii, {
    color: FLANK,
    sectors: [
      [-56, 56, DORSAL],
      [100, 126, LATERAL],
      [126, 234, VENTRAL],
      [234, 260, LATERAL],
    ],
    sides: 14,
    caps: "round",
    group: "tail",
  });

  // Subtle sensory lateral lines along both flanks from neck to caudal peduncle.
  for (const s of [1, -1]) {
    // Anterior flank lateral line on spine
    const latLineFwd = [
      [s * 0.22, 0.61, 0.95],
      [s * 0.26, 0.61, 0.85],
      [s * 0.29, 0.61, 0.45],
      [s * 0.27, 0.6, 0.05],
      [s * 0.21, 0.59, -0.45],
    ].map((p) => new Vector3(...p));
    b.sweep(catmull(latLineFwd), 0.007, {
      bone: spine,
      color: LATERAL,
      caps: "round",
      group: "body",
    });

    // Posterior flank lateral line on tail
    const latLineAft = [
      [s * 0.21, 0.59, -0.45],
      [s * 0.15, 0.58, -0.9],
      [s * 0.09, 0.58, -1.3],
      [s * 0.05, 0.58, -1.62],
    ].map((p) => new Vector3(...p));
    b.sweep(catmull(latLineAft), 0.006, {
      bone: tail,
      color: LATERAL,
      caps: "round",
      group: "tail",
    });
  }

  // ---------------------------------------------------------------- Cephalofoil (The Hammerhead)
  // Central cranial block connecting neck to anterior rostrum.
  const rostrumStations = [
    { at: [0, 0.6, 1.15], w: 0.42, h: 0.28 },
    { at: [0, 0.6, 1.25], w: 0.4, h: 0.22 },
    { at: [0, 0.6, 1.34], w: 0.36, h: 0.16 },
    { at: [0, 0.6, 1.41], w: 0.3, h: 0.12 },
  ] as const;
  b.loft(rostrumStations, {
    bone: skull,
    color: FLANK,
    sectors: [
      [-55, 55, DORSAL],
      [120, 240, VENTRAL],
    ],
    sides: 12,
    group: "head",
  });

  // Dorsal cranial sensory ridge along rostrum midline
  b.sweep(
    polyline([
      [0, 0.69, 1.15],
      [0, 0.67, 1.27],
      [0, 0.64, 1.38],
    ]),
    (t) => [0.03 * (1 - 0.5 * t), 0.012],
    { bone: skull, color: DORSAL, caps: "round", group: "head" },
  );

  // Lateral cephalofoil wings (left and right hydrofoils).
  for (const s of [1, -1]) {
    // Hydrofoil wing swept laterally along X.
    const wingStations = [
      { at: [s * 0.12, 0.6, 1.27], w: 0.36, h: 0.15 },
      { at: [s * 0.24, 0.6, 1.3], w: 0.34, h: 0.12 },
      { at: [s * 0.38, 0.6, 1.29], w: 0.3, h: 0.095 },
      { at: [s * 0.48, 0.6, 1.27], w: 0.26, h: 0.085 },
      { at: [s * 0.54, 0.6, 1.25], w: 0.2, h: 0.08 },
    ] as const;
    b.loft(wingStations, {
      bone: skull,
      color: FLANK,
      up: [0, 1, 0],
      sectors: [
        [-55, 55, DORSAL],
        [125, 235, VENTRAL],
      ],
      sides: 12,
      group: "head",
    });

    // Anterior scalloped leading edge of cephalofoil.
    // Characteristic median scallop and lateral indentation of the great hammerhead.
    const leadingScallop = [
      [s * 0.03, 0.6, 1.42],
      [s * 0.18, 0.6, 1.45], // outer median lobe
      [s * 0.36, 0.6, 1.42], // lateral indentation
      [s * 0.48, 0.6, 1.38], // pre-nare curve
      [s * 0.54, 0.6, 1.34], // lateral bulb leading corner
    ].map((p) => new Vector3(...p));
    b.sweep(catmull(leadingScallop), (t) => [0.035 * (1 - 0.4 * t), 0.045 * (1 - 0.4 * t)], {
      bone: skull,
      color: DORSAL,
      up: [0, 1, 0],
      caps: "round",
      group: "head",
    });

    // Posterior wing trailing edge taper (airfoil trailing edge).
    const trailingEdge = [
      [s * 0.15, 0.6, 1.12],
      [s * 0.32, 0.6, 1.15],
      [s * 0.45, 0.6, 1.18],
      [s * 0.53, 0.6, 1.19],
    ].map((p) => new Vector3(...p));
    b.sweep(catmull(trailingEdge), (t) => [0.02 * (1 - 0.3 * t), 0.015], {
      bone: skull,
      color: FLANK,
      up: [0, 1, 0],
      caps: "round",
      group: "head",
    });

    // Lateral eye pod (terminal bulb housing the lateral eye and nasal groove).
    const bulbA: V3 = [s * 0.53, 0.6, 1.18];
    const bulbB: V3 = [s * 0.53, 0.6, 1.33];
    b.capsule(bulbA, bulbB, [0.042, 0.038], {
      bone: skull,
      color: FLANK,
      sectors: [
        [-60, 60, DORSAL],
        [120, 240, VENTRAL],
      ],
      sides: 12,
      group: "head",
    });

    // Lateral eyeball at the extreme outer edge of the cephalofoil.
    const eyeCenter: V3 = [s * 0.565, 0.6, 1.26];
    // Eyeball sclera
    b.part(new SphereGeometry(0.022, b.segments(12), b.segments(8)), EYE, {
      bone: skull,
      at: eyeCenter,
      dir: [s, 0, 0.2],
      group: "head",
    });
    // Dark pupil facing outward and slightly forward
    b.part(new SphereGeometry(0.013, b.segments(10), b.segments(8)), PUPIL, {
      bone: skull,
      at: offset(eyeCenter, [s, 0, 0.2], 0.012),
      dir: [s, 0, 0.2],
      group: "head",
    });
    // Protective cartilaginous eyelid rim
    b.sweep(
      polyline(
        [
          [s * 0.562, 0.622, 1.25],
          [s * 0.566, 0.6, 1.282],
          [s * 0.562, 0.578, 1.25],
          [s * 0.558, 0.6, 1.238],
        ].map((p) => new Vector3(...p)),
        { closed: true },
      ),
      0.005,
      { bone: skull, color: EYELID, group: "head" },
    );

    // Incurrent nare (nostril) on the anterior ventral edge near the eye.
    const narePos: V3 = [s * 0.49, 0.562, 1.36];
    b.part(new CylinderGeometry(0.006, 0.006, 0.024, 6), NOSTRIL, {
      bone: skull,
      at: narePos,
      rotation: [0, 0, 90],
      group: "head",
    });
    // Pre-narial groove flap
    b.part(new BoxGeometry(0.014, 0.005, 0.02), DORSAL, {
      bone: skull,
      at: [narePos[0], narePos[1] + 0.006, narePos[2] + 0.008],
      group: "head",
    });

    // Ampullae of Lorenzini: electroreceptive pores scattered on the ventral rostrum.
    for (let p = 0; p < 12; p++) {
      const u = random();
      const px = s * (0.05 + u * 0.42);
      const pz = 1.22 + random() * 0.16;
      const py = 0.545 - (1 - u) * 0.02;
      b.part(new CylinderGeometry(0.0035, 0.0035, 0.004, 6), PORE, {
        bone: skull,
        at: [px, py, pz],
        group: "head",
      });
    }
  }

  // ---------------------------------------------------------------- Ventral Mouth & Articulated Jaws
  // Upper jaw ceiling and dental arcade (parented to skull).
  const mouthCenter: V3 = [0, 0.53, 0.98];
  b.part(new BoxGeometry(0.24, 0.03, 0.18), MOUTH, {
    bone: skull,
    at: mouthCenter,
    group: "head",
  });

  // Upper jaw teeth: primary active outer arch of triangular teeth pointing downward.
  const upperTeethCount = 14;
  for (let i = 0; i < upperTeethCount; i++) {
    const t = (i / (upperTeethCount - 1)) * 2 - 1; // -1 to 1
    const tx = t * 0.11;
    const tz = 1.06 - t * t * 0.08;
    const ty = 0.518;
    const toothGeo = toothGeometry(0.014, 0.022, 0.006);
    b.part(toothGeo, TOOTH, {
      bone: skull,
      at: [tx, ty, tz],
      rotation: [180, 0, t * 15],
      group: "head",
    });
  }

  // Upper jaw inner replacement row (slightly recessed, offset stagger).
  const upperInnerCount = 12;
  for (let i = 0; i < upperInnerCount; i++) {
    const t = (i / (upperInnerCount - 1)) * 2 - 1;
    const tx = t * 0.095;
    const tz = 1.03 - t * t * 0.07;
    const ty = 0.522;
    const toothGeo = toothGeometry(0.012, 0.018, 0.005);
    b.part(toothGeo, TOOTH, {
      bone: skull,
      at: [tx, ty, tz],
      rotation: [180, 0, t * 12],
      group: "head",
    });
  }

  // Lower jaw fleshy tongue / cavity bed.
  b.capsule(jaw.at, jaw.local([0, 0.0, 0.14]), [0.08, 0.06], {
    bone: jaw,
    color: MOUTH,
    group: "jaw",
  });
  // Lower jaw chin / ventral mandible casing.
  b.capsule(jaw.local([0, -0.02, 0.02]), jaw.local([0, -0.02, 0.17]), [0.09, 0.065], {
    bone: jaw,
    color: VENTRAL,
    group: "jaw",
  });

  // Lower jaw outer teeth: primary arch pointing upward.
  const lowerTeethCount = 12;
  for (let i = 0; i < lowerTeethCount; i++) {
    const t = (i / (lowerTeethCount - 1)) * 2 - 1;
    const lx = t * 0.095;
    const lz = 0.15 - t * t * 0.07;
    const ly = 0.015;
    const toothGeo = toothGeometry(0.013, 0.02, 0.005);
    b.part(toothGeo, TOOTH, {
      bone: jaw,
      at: jaw.local([lx, ly, lz]),
      rotation: [0, 0, -t * 15],
      group: "jaw",
    });
  }

  // Lower jaw inner replacement row.
  const lowerInnerCount = 10;
  for (let i = 0; i < lowerInnerCount; i++) {
    const t = (i / (lowerInnerCount - 1)) * 2 - 1;
    const lx = t * 0.08;
    const lz = 0.125 - t * t * 0.06;
    const ly = 0.012;
    const toothGeo = toothGeometry(0.011, 0.017, 0.0045);
    b.part(toothGeo, TOOTH, {
      bone: jaw,
      at: jaw.local([lx, ly, lz]),
      rotation: [0, 0, -t * 12],
      group: "jaw",
    });
  }

  // Labial furrows / mouth corner folds on both sides
  for (const s of [1, -1]) {
    b.capsule(jaw.local([s * 0.105, -0.01, 0.03]), jaw.local([s * 0.115, 0.005, 0.07]), 0.01, {
      bone: jaw,
      color: FLANK,
      group: "jaw",
    });
  }

  // ---------------------------------------------------------------- Gill Slits (5 pairs)
  // Five vertical curved slits on each neck flank just anterior to the pectoral girdle.
  for (const s of [1, -1]) {
    const gillZs = [0.72, 0.76, 0.8, 0.84, 0.88];
    const gillHeights = [0.13, 0.14, 0.15, 0.14, 0.13];
    for (let g = 0; g < 5; g++) {
      const gz = gillZs[g];
      const gh = gillHeights[g];
      const gx = s * (0.245 + g * 0.006);
      const slitCurve = polyline([
        [gx, 0.6 + gh * 0.5, gz - 0.01],
        [gx + s * 0.008, 0.6, gz],
        [gx, 0.6 - gh * 0.5, gz + 0.01],
      ]);
      // Raised rim
      b.sweep(slitCurve, 0.006, {
        bone: neck1,
        color: GILL,
        caps: "round",
        group: "body",
      });
      // Dark internal backing slot
      b.part(new BoxGeometry(0.008, gh * 0.8, 0.014), GILL, {
        bone: neck1,
        at: [gx - s * 0.006, 0.6, gz],
        rotation: [0, s * 12, 0],
        group: "body",
      });
    }
  }

  // ---------------------------------------------------------------- First Dorsal Fin
  // The signature giant falcate dorsal fin of the great hammerhead, towering on the chest.
  const dorsalFinPolygon = [
    [0, 0.84, 0.52], // base anterior
    [0, 1.05, 0.48], // leading edge 1
    [0, 1.28, 0.42], // leading edge 2
    [0, 1.5, 0.33], // leading edge 3
    [0, 1.62, 0.24], // fin apex tip
    [0, 1.58, 0.21], // apex trailing corner
    [0, 1.34, 0.23], // concave trailing curve 1
    [0, 1.12, 0.23], // concave trailing curve 2
    [0, 0.94, 0.2], // concave trailing curve 3
    [0, 0.85, 0.12], // free rear tip
    [0, 0.82, 0.22], // base posterior
  ].map((p) => new Vector3(...p));

  b.slab(dorsalFinPolygon, {
    color: DORSAL,
    thickness: 0.032,
    bone: chest,
    group: "body",
  });

  // Dark dusky tip at the dorsal fin apex.
  b.spike([0, 1.52, 0.28], [0, 1.62, 0.24], null, 0.018, {
    bone: chest,
    color: FIN_TIP,
    group: "body",
  });

  // ---------------------------------------------------------------- Second Dorsal Fin
  // Falcate posterior dorsal fin on `tail1`.
  const dorsal2FinPolygon = [
    [0, 0.66, -0.98],
    [0, 0.78, -1.04],
    [0, 0.86, -1.12], // apex
    [0, 0.83, -1.14],
    [0, 0.72, -1.15],
    [0, 0.65, -1.24], // free rear tip
    [0, 0.64, -1.14],
  ].map((p) => new Vector3(...p));

  b.slab(dorsal2FinPolygon, {
    color: DORSAL,
    thickness: 0.02,
    bone: tail1,
    group: "tail",
  });

  // ---------------------------------------------------------------- Pectoral Fins (Pair)
  // Large falcate hydrofoils sweeping outward, downward, and backward from the chest.
  // Rigged with 2-joint chains (`role: "wing"`) parented to `chest`.
  // The fin tips reach y = 0.000m to touch the floor resting plane!
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const pecRoot: V3 = [s * 0.27, 0.48, 0.58];
    const pecMid: V3 = [s * 0.56, 0.245, 0.38];
    // With thickness 0.024 (half-thickness 0.012) and normal tilt, setting y = 0.0113
    // ensures the lowest vertex lands exactly at y = 0.000m on the floor!
    const pecTip: V3 = [s * 0.82, 0.0113, 0.15];

    const pecChain = b.chain(`pectoral${side}`, [pecRoot, pecMid, pecTip], {
      parent: chest,
      names: [`pectoral${side}1`, `pectoral${side}2`],
      role: "wing",
      contact: [s * 0.82, 0.0, 0.15],
      group: `wing${side}`,
    });

    const pecPolygon = [
      pecRoot,
      [s * 0.42, 0.36, 0.48], // leading edge 1
      [s * 0.64, 0.17, 0.34], // leading edge 2
      pecTip, // apex tip touches ground at y = 0.000m
      [s * 0.76, 0.045, 0.14], // tip trailing edge
      [s * 0.58, 0.2, 0.24], // concave trailing edge 1
      [s * 0.42, 0.33, 0.36], // trailing edge 2
      [s * 0.28, 0.42, 0.44], // base posterior
    ].map((p) => new Vector3(...p));

    b.slab(pecPolygon, {
      color: FLANK,
      thickness: 0.024,
      bone: pecChain.joints[0],
      group: `wing${side}`,
    });

    // Dusky black ventral tip marking on pectoral fin.
    b.spike([s * 0.72, 0.07, 0.2], pecTip, null, 0.022, {
      bone: pecChain.joints[1],
      color: FIN_TIP,
      group: `wing${side}`,
    });
  }

  // ---------------------------------------------------------------- Pelvic Fins & Claspers (Pair)
  // Paired horizontal fins located ventrally at the pelvic girdle (`hips`).
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const pelvicPolygon = [
      [s * 0.14, 0.43, -0.42],
      [s * 0.26, 0.36, -0.52],
      [s * 0.3, 0.32, -0.62], // tip
      [s * 0.24, 0.36, -0.63],
      [s * 0.14, 0.42, -0.62],
    ].map((p) => new Vector3(...p));

    b.slab(pelvicPolygon, {
      color: VENTRAL,
      thickness: 0.016,
      bone: hips,
      group: `pelvic${side}`,
    });

    // Male claspers along medial pelvic margin
    b.capsule([s * 0.06, 0.41, -0.48], [s * 0.05, 0.38, -0.68], [0.014, 0.009], {
      bone: hips,
      color: CLASPER,
      group: `pelvic${side}`,
    });
  }

  // ---------------------------------------------------------------- Anal Fin
  // Ventral fin positioned under the caudal peduncle on `tail1`.
  const analFinPolygon = [
    [0, 0.44, -1.02],
    [0, 0.32, -1.1],
    [0, 0.22, -1.18], // tip
    [0, 0.26, -1.2],
    [0, 0.38, -1.21],
    [0, 0.46, -1.26], // free rear tip
    [0, 0.47, -1.16],
  ].map((p) => new Vector3(...p));

  b.slab(analFinPolygon, {
    color: VENTRAL,
    thickness: 0.018,
    bone: tail1,
    group: "tail",
  });

  // ---------------------------------------------------------------- Caudal Keels & Precaudal Pits
  // Lateral horizontal keels on the caudal peduncle on `tail2`.
  for (const s of [1, -1]) {
    b.capsule([s * 0.06, 0.58, -1.45], [s * 0.04, 0.58, -1.68], [0.012, 0.006], {
      bone: tail2,
      color: FLANK,
      group: "tail",
    });
  }

  // Precaudal pits (crescent notches at dorsal and ventral tail fin base)
  b.part(new BoxGeometry(0.012, 0.012, 0.024), DORSAL, {
    bone: tail3,
    at: [0, 0.645, -1.66],
    group: "tail",
  });
  b.part(new BoxGeometry(0.012, 0.012, 0.024), VENTRAL, {
    bone: tail3,
    at: [0, 0.525, -1.66],
    group: "tail",
  });

  // ---------------------------------------------------------------- Heterocercal Caudal Fin (Tail)
  // Lower caudal lobe (hypural lobe extending ventrally from caudal base) on `tail3`.
  const lowerLobePolygon = [
    [0, 0.56, -1.66], // base ventral
    [0, 0.44, -1.78],
    [0, 0.28, -1.92], // lower tip
    [0, 0.32, -1.95],
    [0, 0.48, -1.95],
    [0, 0.72, -1.94], // meeting the caudal fork
    [0, 0.6, -1.8],
  ].map((p) => new Vector3(...p));

  b.slab(lowerLobePolygon, {
    color: FLANK,
    thickness: 0.022,
    bone: tail3,
    group: "tail",
  });

  // Upper caudal lobe: divided along vertebrae caudal1, caudal2, caudal3 so the dramatic
  // upper lobe flexes smoothly with the vertebral column!
  // Proximal upper lobe section on `caudal1`
  const upperLobeProx = [
    [0, 0.64, -1.65],
    [0, 0.8, -1.9],
    [0, 0.72, -1.94], // fork notch
    [0, 0.62, -1.82],
    [0, 0.58, -1.68],
  ].map((p) => new Vector3(...p));
  b.slab(upperLobeProx, {
    color: DORSAL,
    thickness: 0.026,
    bone: caudal1,
    group: "tail",
  });

  // Medial upper lobe section on `caudal2`
  const upperLobeMed = [
    [0, 0.8, -1.9],
    [0, 1.04, -2.22],
    [0, 0.94, -2.25],
    [0, 0.72, -1.94],
  ].map((p) => new Vector3(...p));
  b.slab(upperLobeMed, {
    color: DORSAL,
    thickness: 0.024,
    bone: caudal2,
    group: "tail",
  });

  // Distal upper lobe section with subterminal notch on `caudal3`
  const upperLobeDist = [
    [0, 1.04, -2.22],
    [0, 1.25, -2.5],
    [0, 1.34, -2.62], // apex tip
    [0, 1.3, -2.64],
    [0, 1.25, -2.58], // subterminal notch indent
    [0, 1.18, -2.54],
    [0, 0.94, -2.25],
  ].map((p) => new Vector3(...p));
  b.slab(upperLobeDist, {
    color: DORSAL,
    thickness: 0.02,
    bone: caudal3,
    group: "tail",
  });

  // ---------------------------------------------------------------- Dermal Denticle Highlights
  // Subtle scattered placoid scales along upper flanks for tactile puppet character.
  const skin = b.surface(bodyTrunk);
  for (const hit of skin.scatter(24, {
    rng: random,
    minDist: 0.1,
    filter: (h) => h.n.y > 0.15 && Math.abs(h.at.x) > 0.12 && h.at.z > -0.35 && h.at.z < 0.75,
  })) {
    b.stick(new ConeGeometry(0.008, 0.024, b.segments(6)), DORSAL, hit, {
      embed: 0.5,
      scale: 0.7 + random() * 0.5,
      group: "body",
    });
  }

  // ---------------------------------------------------------------- Pose Adjustment
  // Rest pose: open the lower jaw slightly to display teeth and mouth interior.
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
