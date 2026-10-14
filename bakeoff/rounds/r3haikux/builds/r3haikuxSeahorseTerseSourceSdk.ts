import * as THREE from "three";
import { catmull, createBuilder, gradient, mix, paint, smoothstep, spiral, stripes } from "../../../../src/index";

export const meta = {
  name: "Seahorse",
  description:
    "A golden seahorse standing on a coiled tail: rust armour rings on amber, coral fins and crown spines, a snout with a hinged lower jaw and big round eyes.",
};

const AMBER = "#f2a03c";
const CREAM = "#ffe7a8";
const RUST = "#b5531d";
const CORAL = "#ff7159";
const GOLD = "#f8bb4e";
const EYE = "#fffaf0";
const PUPIL = "#18151b";

// Trunk and tail: amber on the back, cream on the belly, rust armour rings running round the body.
const hide = paint((_, n) => mix(AMBER, CREAM, smoothstep(-0.15, 0.6, n.z)));
const bodyPaint = stripes(hide, RUST, { size: 0.012, axis: "y", width: 0.3, wobble: 0.35, seed: 3 });

// Head and snout: gold over the crown, paling toward the mouth.
const headPaint = gradient(GOLD, CREAM, [0, 0.19, 0.02], [0, 0.158, 0.09]);

/** A value eased along the body: `stops` are [t, value] pairs, t running 0 (the hips) to 1 (the top of the neck). */
function along(stops: ReadonlyArray<readonly [number, number]>, t: number): number {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [t1, v1] = stops[i];
    if (t <= t1) {
      const [t0, v0] = stops[i - 1];
      const e = 0.5 - 0.5 * Math.cos(Math.PI * ((t - t0) / (t1 - t0)));
      return v0 + (v1 - v0) * e;
    }
  }
  return stops[stops.length - 1][1];
}

/** The tail's radius along its own length: thick where it leaves the hips, a fine point at the tip. */
const tailRadius = (t: number) => 0.0088 - 0.0056 * t;

export default function seahorse() {
  const b = createBuilder({ name: "seahorse" });

  // ---- Skeleton -----------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.072, -0.004] });

  // Trunk: from the hips up through the chest to the base of the neck.
  const spinePath = catmull([
    [0, 0.072, -0.004],
    [0, 0.094, 0.002],
    [0, 0.116, 0.011],
    [0, 0.134, 0.014],
    [0, 0.15, 0.01],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });

  // Neck: angled forward, carrying the head.
  const neckPath = catmull([
    [0, 0.15, 0.01],
    [0, 0.164, 0.021],
    [0, 0.176, 0.03],
  ]);
  const neck = b.chain("neck", neckPath, { parent: spine, names: ["neck1", "neck2"], role: "neck" });

  const headJoint = b.joint("head", { at: [0, 0.176, 0.03], parent: neck, dir: [0, 1, 0.35], role: "head" });

  // The lower jaw hinges under the snout, so the mouth opens.
  const jaw = b.joint("jaw", {
    at: [0, 0.1665, 0.046],
    parent: headJoint,
    dir: [0, -0.0175, 0.038],
    role: "jaw",
  });

  // Tail: a coil that hangs below the body. Its centre height is solved so the lowest point of the curl rests on the floor.
  const TAIL_ROOT: [number, number, number] = [0, 0.072, -0.004];
  const curlAt = (centreY: number) => spiral([0, centreY, 0], TAIL_ROOT, [1, 0, 0], { turns: -1.25, r1: 0.011 });
  const lowest = (centreY: number) => {
    const path = curlAt(centreY);
    let low = Infinity;
    for (let i = 0; i <= 400; i++) {
      const t = i / 400;
      low = Math.min(low, path.at(t).y - tailRadius(t));
    }
    return low;
  };
  let lo = 0;
  let hi = 0.07;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (lowest(mid) < -0.0008) lo = mid;
    else hi = mid;
  }
  const tail = b.chain("tail", curlAt((lo + hi) / 2), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });

  // Fin joints: the dorsal fin on the back, one pectoral fan on each side.
  const dorsal = b.joint("dorsal", { at: [0, 0.12, -0.005], parent: spine, dir: [0, 1, -0.6], role: "fan" });
  const finL = b.joint("finL", { at: [0.0105, 0.143, 0.0115], parent: spine, dir: [0.9, 0, -0.45], role: "fan" });
  const finR = b.joint("finR", { at: [-0.0105, 0.143, 0.0115], parent: spine, dir: [-0.9, 0, -0.45], role: "fan" });

  // ---- Body ---------------------------------------------------------------------------------

  // Trunk and neck as one smooth, faceted body that bends across the spine and neck joints.
  const trunkPath = spinePath.concat(neckPath);
  const J = spinePath.length / trunkPath.length;
  const WIDTH: Array<[number, number]> = [
    [0, 0.0085],
    [0.35 * J, 0.014],
    [0.75 * J, 0.014],
    [J, 0.011],
    [1, 0.0095],
  ];
  const DEPTH: Array<[number, number]> = [
    [0, 0.0105],
    [0.35 * J, 0.0178],
    [0.75 * J, 0.018],
    [J, 0.0135],
    [1, 0.011],
  ];
  // u is the spine chain's own parameter (0 at the hips, 1 at the neck base).
  const depthAt = (u: number) => along(DEPTH, u * J);

  b.sweep(trunkPath, (t: number): [number, number] => [along(WIDTH, t), along(DEPTH, t)], {
    name: "trunk",
    color: bodyPaint,
    bone: [spine, neck],
    section: { ngon: 8 },
  });

  // Prehensile tail: a six-sided tube that tapers into the curl.
  b.sweep(tail, tailRadius, { name: "tail", color: bodyPaint, section: { ngon: 6 } });

  // ---- Head ---------------------------------------------------------------------------------

  // Skull: a faceted, elongated head from the nape to the front of the face.
  b.loft(
    [
      { at: [0, 0.176, 0.012], w: 0.022, h: 0.024 },
      { at: [0, 0.184, 0.029], w: 0.028, h: 0.028 },
      { at: [0, 0.177, 0.046], w: 0.022, h: 0.022 },
    ],
    { name: "head", color: headPaint, bone: headJoint, section: { ngon: 8 } },
  );

  // Upper snout: a long tapering tube that points forward and down.
  b.rod([0, 0.176, 0.042], [0, 0.156, 0.094], [0.0074, 0.0046], {
    name: "snout",
    color: headPaint,
    bone: headJoint,
    caps: "round",
  });

  // Lower jaw, hinged at the back of the snout.
  b.rod([0, 0.1665, 0.046], [0, 0.1505, 0.09], [0.0056, 0.0036], {
    name: "lowerJaw",
    color: headPaint,
    bone: jaw,
    caps: "round",
  });

  // Big round eyes with dark pupils, set on the sides of the head.
  for (const side of [1, -1]) {
    const L = side > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.0085, b.segments(12), b.segments(8)), EYE, {
      name: `eye${L}`,
      at: [side * 0.0125, 0.186, 0.036],
      bone: headJoint,
    });
    b.part(new THREE.SphereGeometry(0.0045, b.segments(8), b.segments(6)), PUPIL, {
      name: `pupil${L}`,
      at: [side * 0.0182, 0.1863, 0.0402],
      bone: headJoint,
    });
  }

  // Coronet: three spines on the crown, and a cheek spine either side.
  b.spike([0, 0.19, 0.024], [0, 1, -0.5], 0.015, 0.003, { name: "crown", color: CORAL, bone: headJoint });
  b.spike([0.006, 0.188, 0.024], [0.35, 1, -0.5], 0.013, 0.0026, {
    name: "crownL",
    color: CORAL,
    bone: headJoint,
  });
  b.spike([-0.006, 0.188, 0.024], [-0.35, 1, -0.5], 0.013, 0.0026, {
    name: "crownR",
    color: CORAL,
    bone: headJoint,
  });
  for (const side of [1, -1]) {
    b.spike([side * 0.0118, 0.17, 0.026], [side, -0.25, -0.7], 0.011, 0.0028, {
      name: side > 0 ? "cheekL" : "cheekR",
      color: RUST,
      bone: headJoint,
    });
  }

  // Small spines along the back of the trunk, sitting on the spine so they ride it.
  for (const u of [0.12, 0.27, 0.42]) {
    b.spike(spine.at(u).moved({ back: depthAt(u) * 0.85 }), [0, 0.35, -1], 0.0075, 0.0022, {
      name: "backSpine",
      color: RUST,
    });
  }

  // ---- Fins ---------------------------------------------------------------------------------

  // Dorsal fin: a thin sail on the back, shaded from coral to gold.
  b.extrude(
    [
      [-0.006, -0.004],
      [0.008, -0.005],
      [0.017, 0.004],
      [0.021, 0.016],
      [0.015, 0.028],
      [0.004, 0.032],
      [-0.006, 0.022],
    ],
    {
      name: "dorsalFin",
      color: gradient(CORAL, GOLD, [0, 0.118, -0.006], [0, 0.152, -0.03]),
      at: [0, 0.12, -0.005],
      bone: dorsal,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.0016,
      bevel: 0.0005,
      smoothing: 1,
    },
  );

  // Pectoral fans: translucent-looking flaps on the sides of the neck, swept back.
  for (const side of [1, -1]) {
    b.extrude(
      [
        [-0.003, -0.004],
        [0.009, -0.007],
        [0.019, -0.002],
        [0.023, 0.007],
        [0.014, 0.014],
        [0.001, 0.011],
      ],
      {
        name: side > 0 ? "pectoralL" : "pectoralR",
        color: CORAL,
        at: side > 0 ? [0.0105, 0.143, 0.0115] : [-0.0105, 0.143, 0.0115],
        bone: side > 0 ? finL : finR,
        x: [0.9 * side, 0, -0.45],
        y: [0, 1, 0],
        thickness: 0.0012,
        bevel: 0.0004,
        smoothing: 1,
      },
    );
  }

  return b.root;
}
