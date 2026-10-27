import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "wind-walking beach creature",
  description:
    "A stylized Theo Jansen-inspired kinetic beach walker assembled from faceted tubes, triangulated legs, hubs, braces, sails, and bright mechanical joints.",
};

export default function build() {
  const b = createBuilder({ name: "windWalker", detail: 1 });

  const IVORY = "#e7d8b7";
  const BONE = "#c7b48d";
  const SAND = "#9b8061";
  const DARK = "#28353b";
  const BLUE = "#376b78";
  const TURQUOISE = "#55a9a0";
  const ORANGE = "#d87938";
  const RED = "#a94735";
  const BLACK = "#172126";
  const PALE = "#f5ebcf";

  const tube = 0.027;
  const jointRadius = 0.052;
  const footRadius = 0.034;

  const box = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: string,
    bone?: any,
    rotation?: [number, number, number],
  ) => {
    return b.part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      {
        at,
        bone,
        rotation,
        flat: true,
      },
    );
  };

  const hub = (at: any, color = ORANGE, bone?: any, scale = 1) => {
    return b.part(
      new THREE.SphereGeometry(jointRadius * scale, 8, 6),
      color,
      {
        at,
        bone,
        flat: true,
      },
    );
  };

  const collar = (at: any, axis: [number, number, number], radius: number, color: string, bone?: any) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, 0.025, 8),
      color,
      {
        at,
        dir: axis,
        bone,
        flat: true,
      },
    );
  };

  // ------------------------------------------------------------------------------------------------
  // Skeleton: a long, segmented thorax with a short forward neck and a small wind-catcher head.

  const spinePath = catmull([
    [0, 0.82, -0.98],
    [0, 0.84, -0.68],
    [0, 0.86, -0.34],
    [0, 0.86, 0.02],
    [0, 0.84, 0.38],
    [0, 0.82, 0.72],
    [0, 0.79, 1.02],
  ]);

  const spine = b.chain("spine", spinePath, {
    count: 7,
    names: ["pelvis", "spine2", "spine3", "spine4", "spine5", "chest", "shoulder"],
    role: "spine",
  });

  const neck = b.chain(
    "neck",
    catmull([
      spine.at(1).at,
      [0, 0.91, 1.18],
      [0, 1.03, 1.30],
    ]),
    {
      parent: "shoulder",
      count: 2,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.07, 1.34],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: "head",
    at: [0, 0.99, 1.43],
    dir: [0, -0.12, 0.99],
    role: "jaw",
    group: "head",
  });

  // Twelve articulated legs. Each leg is a readable three-link chain, splayed in a neutral rest pose.
  const legSpecs = [
    { side: 1, z: -0.78, lean: 0.08 },
    { side: -1, z: -0.78, lean: 0.08 },
    { side: 1, z: -0.42, lean: 0.12 },
    { side: -1, z: -0.42, lean: 0.12 },
    { side: 1, z: -0.06, lean: 0.14 },
    { side: -1, z: -0.06, lean: 0.14 },
    { side: 1, z: 0.30, lean: 0.14 },
    { side: -1, z: 0.30, lean: 0.14 },
    { side: 1, z: 0.64, lean: 0.11 },
    { side: -1, z: 0.64, lean: 0.11 },
    { side: 1, z: 0.91, lean: 0.08 },
    { side: -1, z: 0.91, lean: 0.08 },
  ];

  const legs: any[] = [];

  for (let i = 0; i < legSpecs.length; i++) {
    const spec = legSpecs[i];
    const s = spec.side;
    const sideName = s > 0 ? "L" : "R";
    const n = Math.floor(i / 2) + 1;
    const root = [s * 0.13, 0.83, spec.z] as [number, number, number];
    const knee = [s * (0.36 + spec.lean), 0.53, spec.z + s * 0.075] as [number, number, number];
    const ankle = [s * (0.49 + spec.lean * 1.3), 0.22, spec.z - s * 0.08] as [number, number, number];
    const foot = [s * (0.57 + spec.lean), 0.055, spec.z + s * 0.08] as [number, number, number];

    const parent = spine.nearestJoint(root) ?? spine.joints[0];
    const chain = b.chain(
      `leg${sideName}${n}`,
      [root, knee, ankle, foot],
      {
        parent: parent.name,
        names: [`hip${sideName}${n}`, `knee${sideName}${n}`, `ankle${sideName}${n}`, `foot${sideName}${n}`],
        role: "leg",
        contact: foot,
      },
    );

    const color = i % 3 === 0 ? IVORY : i % 3 === 1 ? BONE : BLUE;
    b.sweep(chain, (t: number) => t < 0.34 ? tube * 1.18 : t < 0.7 ? tube : tube * 0.82, {
      color,
      sides: 6,
      caps: "round",
      group: "legs",
    });

    legs.push({ s, n, root, knee, ankle, foot, chain, parent, color });
  }

  // ------------------------------------------------------------------------------------------------
  // Main body tube and its segmented exoskeleton.

  b.sweep(spine, (t: number) => 0.13 - 0.018 * Math.abs(t - 0.5), {
    color: DARK,
    sides: 8,
    caps: "round",
    group: "body",
  });

  b.sweep(neck, [0.095, 0.06], {
    color: BLUE,
    sides: 7,
    caps: "round",
    group: "body",
  });

  for (let i = 0; i < spine.joints.length; i++) {
    const p = spine.joints[i].at;
    collar(p, [0, 0, 1], 0.145 - i * 0.006, i % 2 === 0 ? ORANGE : PALE, spine.joints[i]);
    hub(p, i % 2 === 0 ? ORANGE : TURQUOISE, spine.joints[i], 0.72);
  }

  // Side rails make the thorax feel like a real truss rather than one simple tube.
  for (let i = 0; i < 6; i++) {
    const a = spine.at(i / 6).at;
    const c = spine.at((i + 1) / 6).at;
    for (const s of [-1, 1]) {
      const aa = new THREE.Vector3(s * 0.105, a.y + 0.045, a.z);
      const cc = new THREE.Vector3(s * 0.105, c.y + 0.045, c.z);
      b.rod(aa, cc, 0.014, {
        color: TURQUOISE,
        caps: "flat",
        group: "bodyRails",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Leg hubs, diagonal braces, and characteristic Jansen triangular linkages.

  for (const leg of legs) {
    const s = leg.s;
    const p0 = new THREE.Vector3(...leg.root);
    const p1 = new THREE.Vector3(...leg.knee);
    const p2 = new THREE.Vector3(...leg.ankle);
    const p3 = new THREE.Vector3(...leg.foot);

    hub(leg.root, ORANGE, leg.chain.joints[0], 1.0);
    hub(leg.knee, iColor(leg.n), leg.chain.joints[1], 0.9);
    hub(leg.ankle, RED, leg.chain.joints[2], 0.82);
    hub(leg.foot, BLACK, leg.chain.tip, 0.55);

    collar(leg.root, [1, 0, 0], 0.073, BLACK, leg.chain.joints[0]);
    collar(leg.knee, [1, 0, 0], 0.062, ORANGE, leg.chain.joints[1]);
    collar(leg.ankle, [1, 0, 0], 0.05, PALE, leg.chain.joints[2]);

    // Rearward upper diagonal: the instantly recognizable triangular strut.
    b.rod(p0, new THREE.Vector3(s * 0.39, 0.73, leg.root[2] - s * 0.12), 0.018, {
      color: PALE,
      group: "triangulation",
    });

    // Long diagonal from hip toward ankle.
    b.rod(p0, p2, 0.019, {
      color: DARK,
      group: "triangulation",
    });

    // Cross-brace from knee toward a point behind the ankle.
    b.rod(
      p1,
      new THREE.Vector3(s * 0.51, 0.28, leg.root[2] + s * 0.16),
      0.016,
      {
        color: ORANGE,
        group: "triangulation",
      },
    );

    // A second thin rod follows the lower link, offset slightly in z for layered depth.
    b.rod(
      new THREE.Vector3(p1.x, p1.y + 0.026, p1.z + s * 0.018),
      new THREE.Vector3(p3.x, p3.y + 0.026, p3.z + s * 0.018),
      0.012,
      {
        color: TURQUOISE,
        group: "triangulation",
      },
    );

    // Wide, flat sand shoe.
    box([0.12, 0.045, 0.20], [p3.x + s * 0.025, 0.035, p3.z + 0.025], BLACK, leg.chain.tip);
    box([0.082, 0.018, 0.145], [p3.x + s * 0.028, 0.068, p3.z + 0.025], ORANGE, leg.chain.tip);

    // Small toe bars emphasize that the feet are mechanical rather than animal paws.
    b.rod(
      new THREE.Vector3(p3.x - s * 0.035, 0.072, p3.z - 0.065),
      new THREE.Vector3(p3.x + s * 0.06, 0.072, p3.z - 0.065),
      0.009,
      { color: PALE, group: "feet" },
    );
    b.rod(
      new THREE.Vector3(p3.x - s * 0.035, 0.072, p3.z + 0.005),
      new THREE.Vector3(p3.x + s * 0.06, 0.072, p3.z + 0.005),
      0.009,
      { color: PALE, group: "feet" },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Crown, wind sail, and forward sensory tubes.

  // A low dorsal spine of alternating fins, like a beach wind-catcher.
  const crestOutline: [number, number, "sharp"][] = [
    [0, 0],
    [0.09, 0.0],
    [0.075, 0.16],
    [0.17, 0.28, "sharp"],
    [0.22, 0.0],
    [0.30, 0.0],
    [0.40, 0.22, "sharp"],
    [0.47, 0.0],
    [0.57, 0.0],
    [0.70, 0.14, "sharp"],
    [0.76, 0.0],
    [0.84, 0.0],
    [0.93, 0.11, "sharp"],
    [1.0, 0.0],
  ];

  const crest = b.extrude(crestOutline, {
    at: [0, 0.93, -0.62],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.018,
    bevel: 0.004,
    color: ORANGE,
    bone: spine.joints[1],
    group: "windSail",
  });

  // A rear wind fan, deliberately asymmetrical like a kinetic sculpture's sail.
  const sail = b.extrude(
    [
      [0, 0, "sharp"],
      [0.42, 0.02],
      [0.34, 0.23],
      [0.18, 0.47, "sharp"],
      [0.05, 0.61],
      [0, 0.61],
    ],
    {
      at: [0, 0.88, -0.95],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      color: TURQUOISE,
      bone: spine.joints[0],
      group: "windSail",
    },
  );

  // Sail spars.
  const sailRoot = new THREE.Vector3(0, 0.9, -0.95);
  b.rod(sailRoot, new THREE.Vector3(0.42, 0.92, -0.95), 0.014, { color: BLACK, group: "windSail" });
  b.rod(sailRoot, new THREE.Vector3(0.18, 1.37, -0.95), 0.014, { color: BLACK, group: "windSail" });
  b.rod(
    new THREE.Vector3(0.18, 1.37, -0.95),
    new THREE.Vector3(0.42, 0.92, -0.95),
    0.011,
    { color: ORANGE, group: "windSail" },
  );

  // Mirror a smaller sail on the right, producing a clear biplane silhouette.
  const sailR = b.extrude(
    [
      [0, 0, "sharp"],
      [0.34, 0.02],
      [0.26, 0.2],
      [0.13, 0.39, "sharp"],
      [0.04, 0.52],
      [0, 0.52],
    ],
    {
      at: [0, 0.88, -0.95],
      x: [-1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: RED,
      bone: spine.joints[0],
      group: "windSail",
    },
  );

  // Head: a boxy tube cage with a separate lower jaw.
  b.sweep(
    catmull([
      [-0.11, 1.06, 1.28],
      [-0.14, 1.10, 1.44],
      [-0.08, 1.08, 1.57],
    ]),
    [0.075, 0.035],
    {
      color: IVORY,
      sides: 6,
      caps: "round",
      bone: head,
      group: "head",
    },
  );

  b.sweep(
    catmull([
      [0.11, 1.06, 1.28],
      [0.14, 1.10, 1.44],
      [0.08, 1.08, 1.57],
    ]),
    [0.075, 0.035],
    {
      color: IVORY,
      sides: 6,
      caps: "round",
      bone: head,
      group: "head",
    },
  );

  b.rod([-0.11, 1.06, 1.28], [0.11, 1.06, 1.28], 0.027, { color: BLUE, group: "head" });
  b.rod([-0.14, 1.10, 1.44], [0.14, 1.10, 1.44], 0.022, { color: ORANGE, group: "head" });
  b.rod([-0.08, 1.08, 1.57], [0.08, 1.08, 1.57], 0.018, { color: BLACK, group: "head" });

  // Lower jaw is a separate hinged tube assembly.
  b.sweep(
    catmull([
      [-0.075, 1.005, 1.38],
      [0, 0.965, 1.52],
      [0.075, 1.005, 1.38],
    ]),
    [0.024, 0.016],
    {
      color: RED,
      sides: 6,
      caps: "round",
      bone: jaw,
      group: "jaw",
    },
  );

  // Two forward feelers.
  const feelerL = b.sprout(
    "feelerL",
    head,
    catmull([
      [0.06, 1.09, 1.53],
      [0.15, 1.16, 1.70],
      [0.25, 1.11, 1.79],
    ]),
    [0.014, 0.004],
    {
      count: 2,
      names: ["feelL1", "feelL2"],
      role: "tentacle",
      color: ORANGE,
      caps: { end: "point", start: "round" },
      group: "head",
    },
  );

  const feelerR = b.sprout(
    "feelerR",
    head,
    catmull([
      [-0.06, 1.09, 1.53],
      [-0.15, 1.16, 1.70],
      [-0.25, 1.11, 1.79],
    ]),
    [0.014, 0.004],
    {
      count: 2,
      names: ["feelR1", "feelR2"],
      role: "tentacle",
      color: ORANGE,
      caps: { end: "point", start: "round" },
      group: "head",
    },
  );

  // Antenna tips.
  hub([0.25, 1.11, 1.79], PALE, feelerL.chain?.tip, 0.5);
  hub([-0.25, 1.11, 1.79], PALE, feelerR.chain?.tip, 0.5);

  // Bright circular eye plates.
  for (const s of [-1, 1]) {
    b.part(
      new THREE.CylinderGeometry(0.048, 0.048, 0.018, 10),
      PALE,
      {
        at: [s * 0.105, 1.10, 1.49],
        dir: [0, 0, 1],
        axis: "y",
        bone: head,
        flat: true,
        group: "face",
      },
    );
    b.part(
      new THREE.SphereGeometry(0.021, 8, 5),
      BLACK,
      {
        at: [s * 0.105, 1.10, 1.505],
        bone: head,
        flat: true,
        group: "face",
      },
    );
  }

  // Vent-like ribs under the thorax, giving the silhouette a hollow fabricated feel.
  for (let i = 0; i < 7; i++) {
    const p = spine.at(i / 6).at;
    const z = p.z;
    b.rod([-0.105, 0.74, z], [0.105, 0.74, z], 0.012, {
      color: SAND,
      group: "underside",
    });
  }

  // A small rear counterweight and tail fork.
  const rear = spine.at(0).at;
  b.rod([0, 0.84, -0.99], [0, 0.75, -1.25], 0.028, { color: DARK, group: "tail" });
  b.rod([-0.16, 0.75, -1.22], [0, 0.75, -1.25], 0.018, { color: ORANGE, group: "tail" });
  b.rod([0.16, 0.75, -1.22], [0, 0.75, -1.25], 0.018, { color: ORANGE, group: "tail" });
  hub([0, 0.75, -1.25], TURQUOISE, spine.joints[0], 0.8);

  // Small repeated washers along the body: detail that reads well at a distance.
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const p = spine.at(t).at;
    b.part(
      new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8),
      i % 2 ? ORANGE : PALE,
      {
        at: [0.135, p.y + 0.01, p.z],
        dir: [1, 0, 0],
        bone: spine.at(t).bone,
        flat: true,
        group: "washers",
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8),
      i % 2 ? ORANGE : PALE,
      {
        at: [-0.135, p.y + 0.01, p.z],
        dir: [-1, 0, 0],
        bone: spine.at(t).bone,
        flat: true,
        group: "washers",
      },
    );
  }

  return b.root;

  function iColor(n: number) {
    return n % 3 === 0 ? TURQUOISE : n % 3 === 1 ? PALE : ORANGE;
  }
}
