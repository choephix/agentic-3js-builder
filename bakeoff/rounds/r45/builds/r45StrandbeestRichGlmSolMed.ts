import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, line, polyline, rng } from "../../../../src/index";

export const meta = {
  "name": "Ventus Ambulare",
  "description": "A Theo Jansen style wind-walking beach creature: pale PVC tube skeleton with jointed walking legs, a ribbed spine, a tall fabric wing sail and wind-organ pipes, resting on tidal sand."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  tube: "#d9c98a",
  tubeLight: "#efe6bd",
  tubeDark: "#8a7b4a",
  knuckle: "#3a3428",
  sail: "#f2ead4",
  sailEdge: "#c8b071",
  rope: "#b8894a",
  rust: "#a04a28",
  pennant: "#d94f2a",
  lens: "#2a2620",
  lensRim: "#efe6bd",
};
const M = {
  mastBase: [0, 2.95, 0.9] as [number, number, number],
  bowNeck: [0, 3.2, 2.4] as [number, number, number],
  tailRoot: [0, 2.85, -2.1] as [number, number, number],
  yokeL: [1.35, 2.75, 0.3] as [number, number, number],
  yokeR: [-1.35, 2.75, 0.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // keel
  (() => {
function buildKeel({ b, J, P, M }: Ctx) {
  const tube = P.tube;
  const light = P.tubeLight;
  const dark = P.tubeDark;
  const knuckle = P.knuckle;
  const rust = P.rust;
  const lens = P.lens;
  const lensRim = P.lensRim;

  const spine0 = J.spine0;
  const spine1 = J.spine1;
  const spine2 = J.spine2;
  const neck1 = J.neck1;
  const head = J.head;

  const cyl = (
    radius: number,
    depth: number,
    radial = 8,
    color = tube,
    at: THREE.Vector3 | number[] = [0, 0, 0],
    bone: any = spine0,
    dir: THREE.Vector3 | number[] = [0, 1, 0],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, radial), color, {
      at,
      bone,
      dir,
      name,
      flat: true,
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | number[],
    bone: any = spine0,
    name?: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
      flat: true,
    });

  const rod = (
    a: THREE.Vector3 | number[],
    z: THREE.Vector3 | number[],
    radius: number,
    color: string,
    bone: any = spine0,
    name?: string,
  ) => b.rod(a, z, radius, { color, bone, section: { ngon: 8 }, name });

  const ringBand = (
    on: any,
    radius: number,
    color: string,
    name: string,
    count = 14,
  ) => {
    const r = b.ring(on, { count, radius, name });
    return b.sweep(catmull(r.items, { closed: true }), 0.012, {
      color,
      bone: on.bone ?? on,
      caps: "none",
      section: { ngon: 6 },
      name,
    });
  };

  const jointDisc = (
    at: any,
    radius: number,
    color: string,
    name: string,
    axis: THREE.Vector3 | number[] = [1, 0, 0],
  ) => {
    const p = at.at ?? at;
    cyl(radius, 0.035, 10, color, p, at.bone ?? spine0, axis, name);
    cyl(
      radius * 0.48,
      0.043,
      8,
      rust,
      p,
      at.bone ?? spine0,
      axis,
      `${name}_bolt`,
    );
  };

  const bracket = (
    at: THREE.Vector3 | number[],
    size: [number, number, number],
    rotation: [number, number, number],
    name: string,
  ) => box(size, rust, at, spine0, name, rotation);

  const spinePath = catmull(
    [spine0.at, spine1.at, spine2.at],
    { tension: 0.12 },
  );

  const backbone = b.sweep(spinePath, (t) => 0.14 - 0.04 * t, {
    bone: [spine0, spine1, spine2],
    color: tube,
    section: { ngon: 8 },
    caps: "round",
    name: "keel.backbone",
  });

  ringBand(spine0, 0.145, light, "keel.spineRing0");
  ringBand(spine1, 0.125, light, "keel.spineRing1");
  ringBand(spine2, 0.105, light, "keel.spineRing2");

  const dorsalSpots = [
    spine0.at.clone().add(new THREE.Vector3(0, 0.14, 0)),
    spine1.at.clone().add(new THREE.Vector3(0, 0.12, 0)),
    spine2.at.clone().add(new THREE.Vector3(0, 0.10, 0)),
  ];
  for (let i = 0; i < dorsalSpots.length; i++) {
    cyl(
      0.035,
      0.18,
      8,
      rust,
      dorsalSpots[i],
      [spine0, spine1, spine2][i],
      [0, 1, 0],
      `keel.dorsalClamp${i}`,
    );
  }

  const neckPath = catmull(
    [spine0.at, neck1.at, head.at],
    { tension: 0.18 },
  );

  const neck = b.sweep(neckPath, (t) => 0.105 - 0.035 * t, {
    bone: [spine0, neck1, head],
    color: tube,
    section: { ngon: 8 },
    caps: "round",
    name: "keel.neck",
  });

  ringBand(neck1, 0.108, light, "keel.neckCollar", 12);

  const neckBraceA = neck1.at.clone().add(new THREE.Vector3(-0.11, 0.0, -0.09));
  const neckBraceB = neck1.at.clone().add(new THREE.Vector3(0.11, 0.0, -0.09));
  rod(neckBraceA, neckBraceB, 0.018, dark, neck1, "keel.neckBrace");
  bracket(
    neck1.at.clone().add(new THREE.Vector3(0, -0.035, -0.01)),
    [0.18, 0.08, 0.12],
    [0.15, 0, 0],
    "keel.neckBracket",
  );

  const headCore = head.at.clone();
  const noseOffsets: Array<[number, number, number, number]> = [
    [-0.18, -0.075, 0.28, 0.24],
    [-0.09, 0.015, 0.36, 0.30],
    [0.0, 0.045, 0.45, 0.34],
    [0.09, 0.015, 0.36, 0.30],
    [0.18, -0.075, 0.28, 0.24],
  ];

  for (let i = 0; i < noseOffsets.length; i++) {
    const [x, y, length, lean] = noseOffsets[i];
    const start = headCore.clone().add(new THREE.Vector3(x * 0.55, y, 0.10));
    const end = start.clone().add(
      new THREE.Vector3(x * 0.35, y * 0.45, length),
    );
    rod(start, end, 0.048, i % 2 === 0 ? tube : light, head, `keel.nose${i}`);
    cyl(
      0.058,
      0.028,
      8,
      dark,
      start,
      head,
      [0, 0, 1],
      `keel.noseSocket${i}`,
    );
    if (lean > 0.25) {
      const collar = start.clone().addScaledVector(
        end.clone().sub(start).normalize(),
        length * 0.56,
      );
      cyl(
        0.056,
        0.022,
        8,
        light,
        collar,
        head,
        end.clone().sub(start).normalize(),
        `keel.noseCollar${i}`,
      );
    }
  }

  const eyeY = headCore.y + 0.015;
  const eyeZ = headCore.z + 0.205;
  for (const s of [-1, 1]) {
    const eyeAt = new THREE.Vector3(s * 0.155, eyeY, eyeZ);
    const stalkEnd = eyeAt.clone().add(new THREE.Vector3(0, 0, -0.105));
    rod(stalkEnd, eyeAt, 0.018, light, head, `keel.eyeStalk${s}`);
    cyl(
      0.095,
      0.028,
      12,
      lensRim,
      eyeAt,
      head,
      [0, 0, 1],
      `keel.eyeRim${s}`,
    );
    cyl(
      0.072,
      0.034,
      12,
      lens,
      eyeAt.clone().add(new THREE.Vector3(0, 0, 0.006)),
      head,
      [0, 0, 1],
      `keel.eyeLens${s}`,
    );
    cyl(
      0.018,
      0.04,
      8,
      rust,
      eyeAt.clone().add(new THREE.Vector3(0, 0, 0.026)),
      head,
      [0, 0, 1],
      `keel.eyePin${s}`,
    );
  }

  const brow = catmull(
    [
      new THREE.Vector3(-0.29, headCore.y + 0.12, headCore.z + 0.16),
      new THREE.Vector3(-0.16, headCore.y + 0.20, headCore.z + 0.20),
      new THREE.Vector3(0.0, headCore.y + 0.23, headCore.z + 0.22),
      new THREE.Vector3(0.16, headCore.y + 0.20, headCore.z + 0.20),
      new THREE.Vector3(0.29, headCore.y + 0.12, headCore.z + 0.16),
    ],
  );
  b.sweep(brow, 0.026, {
    bone: head,
    color: dark,
    section: { ngon: 6 },
    caps: "round",
    name: "keel.brow",
  });

  const headBand = catmull(
    [
      new THREE.Vector3(-0.25, headCore.y + 0.01, headCore.z + 0.015),
      new THREE.Vector3(0, headCore.y - 0.035, headCore.z + 0.02),
      new THREE.Vector3(0.25, headCore.y + 0.01, headCore.z + 0.015),
    ],
  );
  b.sweep(headBand, 0.014, {
    bone: head,
    color: light,
    section: { ngon: 6 },
    name: "keel.headBrace",
  });

  const ribStations = [1.9, 1.22, 0.52, -0.18, -0.98, -1.8];
  for (let i = 0; i < ribStations.length; i++) {
    const z = ribStations[i];
    const rib = catmull([
      new THREE.Vector3(-0.02, 2.90, z),
      new THREE.Vector3(-0.27, 3.09, z),
      new THREE.Vector3(-0.45, 3.04, z),
      new THREE.Vector3(-0.52, 2.86, z),
      new THREE.Vector3(0.02, 2.90, z),
      new THREE.Vector3(0.27, 3.09, z),
      new THREE.Vector3(0.45, 3.04, z),
      new THREE.Vector3(0.52, 2.86, z),
    ]);
    b.sweep(rib, 0.034, {
      bone: spine0,
      color: light,
      section: { ngon: 7 },
      caps: "round",
      name: `keel.rib${i}`,
    });
    bracket(
      new THREE.Vector3(0, 2.86, z),
      [0.13, 0.10, 0.10],
      [0, 0.25, 0],
      `keel.ribBracket${i}`,
    );
    cyl(
      0.05,
      0.024,
      8,
      rust,
      new THREE.Vector3(0.075, 2.91, z),
      spine0,
      [1, 0, 0],
      `keel.ribBolt${i}`,
    );
  }

  const headerA = new THREE.Vector3(-0.43, 2.78, 2.58);
  const headerB = new THREE.Vector3(0.43, 2.78, 2.58);
  rod(headerA, headerB, 0.034, dark, spine0, "keel.bowOrganHeader");

  const pipeXs = [-0.39, -0.26, -0.13, 0, 0.13, 0.26, 0.39];
  const pipeLengths = [0.58, 0.82, 0.66, 1.02, 0.72, 0.9, 0.54];
  for (let i = 0; i < pipeXs.length; i++) {
    const x = pipeXs[i];
    const top = new THREE.Vector3(x, 2.77, 2.58);
    const bottom = new THREE.Vector3(x, 2.77 - pipeLengths[i], 2.58);
    b.sweep(polyline([top, bottom]), [0.043, 0.030], {
      bone: spine0,
      color: i % 2 ? tube : dark,
      section: { ngon: 8 },
      caps: { start: "flat", end: "round" },
      name: `keel.organPipe${i}`,
    });
    const collarFrame = frame(bottom, [0, -1, 0]);
    const collar = b.ring(collarFrame, {
      count: 10,
      radius: 0.038,
      name: `keel.organCollar${i}`,
    });
    b.sweep(catmull(collar.items, { closed: true }), 0.010, {
      bone: spine0,
      color: rust,
      caps: "none",
      section: { ngon: 6 },
      name: `keel.organCollar${i}`,
    });
    cyl(
      0.021,
      0.05,
      7,
      rust,
      top,
      spine0,
      [0, 1, 0],
      `keel.organHanger${i}`,
    );
  }

  const headerClampL = new THREE.Vector3(-0.42, 2.82, 2.58);
  const headerClampR = new THREE.Vector3(0.42, 2.82, 2.58);
  bracket(
    headerClampL,
    [0.10, 0.12, 0.13],
    [0, 0.25, 0],
    "keel.headerClampL",
  );
  bracket(
    headerClampR,
    [0.10, 0.12, 0.13],
    [0, -0.25, 0],
    "keel.headerClampR",
  );

  const lowerBowBrace = catmull([
    new THREE.Vector3(-0.42, 2.76, 2.54),
    new THREE.Vector3(-0.25, 2.68, 2.47),
    new THREE.Vector3(0, 2.66, 2.42),
    new THREE.Vector3(0.25, 2.68, 2.47),
    new THREE.Vector3(0.42, 2.76, 2.54),
  ]);
  b.sweep(lowerBowBrace, 0.014, {
    bone: spine0,
    color: rope ?? dark,
    section: { ngon: 6 },
    caps: "round",
    name: "keel.organBrace",
  });

  jointDisc(spine0, 0.075, knuckle, "keel.spineKnuckle0", [1, 0, 0]);
  jointDisc(spine1, 0.068, knuckle, "keel.spineKnuckle1", [1, 0, 0]);
  jointDisc(spine2, 0.060, knuckle, "keel.spineKnuckle2", [1, 0, 0]);
  jointDisc(neck1, 0.060, knuckle, "keel.neckKnuckle", [1, 0, 0]);
  jointDisc(head, 0.052, knuckle, "keel.headKnuckle", [1, 0, 0]);

  const noseTieL = new THREE.Vector3(-0.27, 3.57, 3.13);
  const noseTieR = new THREE.Vector3(0.27, 3.57, 3.13);
  rod(noseTieL, noseTieR, 0.010, rust, head, "keel.faceTie");
  cyl(
    0.026,
    0.03,
    7,
    rust,
    noseTieL,
    head,
    [0, 0, 1],
    "keel.faceTieL",
  );
  cyl(
    0.026,
    0.03,
    7,
    rust,
    noseTieR,
    head,
    [0, 0, 1],
    "keel.faceTieR",
  );
}
    return buildKeel;
  })(),
  // sail
  (() => {
function buildSail({ b, J, P, M }: Ctx) {
  const tube = P.tube;
  const light = P.tubeLight;
  const dark = P.tubeDark;
  const sail = P.sail;
  const edge = P.sailEdge;
  const rope = P.rope;
  const rust = P.rust;
  const ink = P.tubeDark;
  const knuckle = P.knuckle;

  const mastBase = M.mastBase;
  const mastTop: [number, number, number] = [0, 5.88, 1.05];

  // ---------------------------------------------------------------------------------------------------------------
  // Mast skeleton: a deliberately segmented, faceted PVC pole with a little lean toward the bow.

  const mastPath = catmull(
    [
      mastBase,
      [0, 3.7, 0.94],
      [0, 4.75, 1.0],
      mastTop,
    ],
    { tension: 0.15 },
  );

  const mast = b.chain("sailMast", mastPath, {
    parent: J.spine0,
    names: ["sailMastBase", "sailMastMid", "sailMastUpper", "sailMastTop"],
    role: "spine",
  });

  b.sweep(mast, (t) => 0.09 * (1 - t) + 0.04 * t, {
    color: tube,
    section: { ngon: 8 },
    caps: "round",
    name: "sail.mast",
    group: "sail",
  });

  // Pale collars make the mast read as assembled from short lengths.
  for (const t of [0.02, 0.34, 0.67, 0.98]) {
    const at = mast.at(t);
    const collar = b.ring(at, { count: 8, radius: 0.095, fromDeg: 0, toDeg: 360 });
    const collarPath = polyline(collar.items.map((item) => item.at), { closed: true });
    b.sweep(collarPath, 0.012, {
      color: light,
      bone: at.bone,
      section: { ngon: 6 },
      caps: "none",
      name: `sail.mastCollar${Math.round(t * 100)}`,
      group: "sail",
    });
  }

  // A dark mounting collar and two rust clamp plates at the base.
  const baseRing = b.ring(mast.at(0), { count: 10, radius: 0.105 });
  b.sweep(
    polyline(baseRing.items.map((item) => item.at), { closed: true }),
    0.018,
    {
      color: dark,
      bone: J.spine0,
      caps: "none",
      name: "sail.mastFootCollar",
      group: "sail",
    },
  );

  for (const x of [-0.085, 0.085]) {
    b.part(new THREE.BoxGeometry(0.035, 0.16, 0.12), rust, {
      bone: J.spine0,
      at: [x, 3.02, 0.9],
      dir: [0, 1, 0],
      name: `sail.mastFootBracket${x > 0 ? "L" : "R"}`,
      group: "sail",
    });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 8), ink, {
      bone: J.spine0,
      at: [x, 3.02, 0.965],
      dir: [0, 0, 1],
      name: `sail.mastFootBolt${x > 0 ? "L" : "R"}`,
      group: "sail",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Boom and forward wing spar.

  const boomStart: [number, number, number] = [0, 3.0, 0.97];
  const boomEnd: [number, number, number] = [0, 3.0, -0.22];
  const boomPath = polyline([boomStart, [0, 3.01, 0.45], boomEnd]);

  b.sweep(boomPath, 0.06, {
    color: tube,
    bone: J.spine0,
    section: { ngon: 8 },
    caps: "round",
    name: "sail.boom",
    group: "sail",
  });

  const forwardSparPath = polyline([
    [0, 3.005, 0.94],
    [0, 3.015, 1.38],
    [0, 3.02, 1.8],
  ]);

  b.sweep(forwardSparPath, 0.045, {
    color: light,
    bone: J.spine0,
    section: { ngon: 8 },
    caps: "round",
    name: "sail.forwardWingSpar",
    group: "sail",
  });

  // Rust end fittings give the spars a bolted, industrial silhouette.
  for (const p of [
    [0, 3.0, -0.22],
    [0, 3.02, 1.8],
  ] as [number, number, number][]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.045, 8), rust, {
      bone: J.spine0,
      at: p,
      dir: [1, 0, 0],
      name: "sail.sparEndFitting",
      group: "sail",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main taut triangular cloth. It is a profile-facing membrane in the Y/Z plane.

  const clothMast = polyline([
    [0, 3.06, 0.99],
    [0, 3.72, 0.96],
    [0, 4.5, 0.99],
    [0, 5.72, 1.04],
  ]);

  const clothTrailing = polyline([
    [0, 3.01, -0.16],
    [0, 3.64, 0.12],
    [0, 4.45, 0.43],
    [0, 5.72, 1.04],
  ]);

  b.membrane(clothMast, clothTrailing, {
    color: sail,
    bone: J.spine0,
    thickness: 0.018,
    rows: 7,
    cols: 12,
    detail: 1,
    scallop: 0.015,
    name: "sail.cloth",
    group: "sail",
  });

  // Contrasting PVC-colored edge tubes: mast edge, diagonal trailing edge, and bottom boom edge.
  b.sweep(clothMast, 0.018, {
    color: edge,
    bone: J.spine0,
    section: { ngon: 6 },
    caps: "round",
    name: "sail.leadingEdge",
    group: "sail",
  });

  b.sweep(clothTrailing, 0.019, {
    color: edge,
    bone: J.spine0,
    section: { ngon: 6 },
    caps: "round",
    name: "sail.trailingEdge",
    group: "sail",
  });

  const clothBottom = polyline([
    [0, 3.01, -0.16],
    [0, 3.01, 0.98],
  ]);

  b.sweep(clothBottom, 0.017, {
    color: edge,
    bone: J.spine0,
    section: { ngon: 6 },
    caps: "round",
    name: "sail.footEdge",
    group: "sail",
  });

  // Small repeated seam tabs along the cloth edge.
  for (let i = 0; i < 6; i++) {
    const t = 0.08 + i * 0.17;
    const p = clothTrailing.at(t);
    b.part(new THREE.BoxGeometry(0.028, 0.055, 0.022), edge, {
      bone: J.spine0,
      at: p,
      dir: [0, 0.7, 0.7],
      name: `sail.edgeTab${i}`,
      group: "sail",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Three diagonal rope stays, each with a dark/rust knot at both ends.

  const stayPairs: Array<[[number, number, number], [number, number, number]]> = [
    [
      [0, 3.02, -0.13],
      [0, 3.72, 0.96],
    ],
    [
      [0, 3.02, 0.25],
      [0, 4.5, 1.0],
    ],
    [
      [0, 3.02, 0.62],
      [0, 5.28, 1.03],
    ],
  ];

  stayPairs.forEach(([a, z], i) => {
    b.sweep(polyline([a, z]), 0.012, {
      color: rope,
      bone: J.spine0,
      section: { ngon: 6 },
      caps: "round",
      name: `sail.stay${i}`,
      group: "rigging",
    });

    for (const [p, n] of [
      [a, [0, 0, 1]],
      [z, [0, 1, 0]],
    ] as Array<[[number, number, number], [number, number, number]]>) {
      b.part(new THREE.SphereGeometry(0.035, 8, 5), knuckle, {
        bone: J.spine0,
        at: p,
        name: `sail.stayKnot${i}`,
        group: "rigging",
      });
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), rust, {
        bone: J.spine0,
        at: p,
        dir: n,
        name: `sail.stayBolt${i}`,
        group: "rigging",
      });
    }
  });

  // A second pair of stays reaches outward in X, making the sail visibly three-dimensional.
  for (const side of [-1, 1]) {
    const a: [number, number, number] = [side * 0.02, 3.02, 0.15];
    const z: [number, number, number] = [side * 0.7, 4.72, 1.01];
    b.sweep(polyline([a, z]), 0.009, {
      color: rope,
      bone: J.spine0,
      section: { ngon: 6 },
      caps: "round",
      name: `sail.crossStay${side > 0 ? "L" : "R"}`,
      group: "rigging",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Masthead finial and coral pennant.

  const finial = b.lathe(
    [
      [0, 0],
      [0.065, 0],
      [0.075, 0.025],
      [0.045, 0.07],
      [0.03, 0.13],
      [0, 0.17],
    ],
    {
      at: mastTop,
      axis: [0, 1, 0],
      segments: 8,
      color: light,
      bone: mast.tip,
      name: "sail.mastheadFinial",
      group: "sail",
    },
  );

  const pennantAt: [number, number, number] = [0, 5.91, 1.05];
  b.extrude(
    [
      [0, 0],
      [0.62, -0.015],
      [0.48, -0.16],
      [0.1, -0.12],
      [0, -0.04],
    ],
    {
      at: pennantAt,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 0,
      color: P.pennant,
      bone: mast.tip,
      name: "sail.coralPennant",
      group: "sail",
    },
  );

  // A dark diagonal painted-looking stripe is a separate geometric ribbon.
  b.sweep(
    polyline([
      [0, 5.895, 1.12],
      [0, 5.83, 1.48],
    ]),
    0.012,
    {
      color: ink,
      bone: mast.tip,
      section: { ngon: 5 },
      caps: "round",
      name: "sail.pennantStripe",
      group: "sail",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Wind vane: a rust arrow pointing into +Z, with two triangular-looking arrow braces.

  const vaneRoot: [number, number, number] = [0, 4.35, 1.0];
  const vaneTip: [number, number, number] = [0, 4.35, 1.38];

  b.sweep(polyline([vaneRoot, vaneTip]), 0.018, {
    color: rust,
    bone: mast.joints[1],
    section: { ngon: 6 },
    caps: "round",
    name: "sail.windVaneStem",
    group: "sail",
  });

  b.spike(vaneTip, [0, 0, 1], 0.14, 0.042, {
    color: rust,
    bone: mast.joints[1],
    section: { ngon: 6 },
    name: "sail.windVaneArrow",
    group: "sail",
  });

  b.sweep(
    polyline([
      [0, 4.35, 1.27],
      [0.075, 4.35, 1.19],
    ]),
    0.012,
    {
      color: rust,
      bone: mast.joints[1],
      section: { ngon: 6 },
      caps: "round",
      name: "sail.vaneFletchL",
      group: "sail",
    },
  );

  b.sweep(
    polyline([
      [0, 4.35, 1.27],
      [-0.075, 4.35, 1.19],
    ]),
    0.012,
    {
      color: rust,
      bone: mast.joints[1],
      section: { ngon: 6 },
      caps: "round",
      name: "sail.vaneFletchR",
      group: "sail",
    },
  );

  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 8), knuckle, {
    bone: mast.joints[1],
    at: vaneRoot,
    dir: [1, 0, 0],
    name: "sail.vanePivot",
    group: "sail",
  });

  // A small rust washer beneath the boom gives the shared mast mount a strong visual connection.
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.025, 10), rust, {
    bone: J.spine0,
    at: [0, 2.985, 0.98],
    dir: [0, 1, 0],
    name: "sail.mastWasher",
    group: "sail",
  });

  return b.root;
}
    return buildSail;
  })(),
  // stern
  (() => {
function buildStern({ b, J, P, M }: Ctx) {
  const tube = P.tube;
  const light = P.tubeLight;
  const dark = P.tubeDark;
  const knuckle = P.knuckle;
  const sail = P.sail;
  const sailEdge = P.sailEdge;
  const rope = P.rope;
  const rust = P.rust;

  const tailRoot = new THREE.Vector3(...M.tailRoot);
  const tailTip = new THREE.Vector3(0, 2.40, -3.72);

  const tailPath = catmull(
    [
      tailRoot,
      J.tail1.at,
      J.tail2.at,
      [0, 2.48, -3.42],
      tailTip,
    ],
    { tension: 0.18 },
  );

  const tail = b.sweep(tailPath, (t) => 0.09 * (1 - t) + 0.03 * t, {
    bone: [J.spine2, J.tail1, J.tail2],
    color: tube,
    sides: 8,
    caps: "round",
    name: "stern.tailTube",
    group: "stern",
  });

  const tailBandPath = tailPath.slice(0.22, 0.38);
  b.sweep(tailBandPath, [0.094, 0.086], {
    bone: J.tail1,
    color: dark,
    sides: 8,
    caps: "flat",
    name: "stern.tailDarkBand",
    group: "stern",
  });

  const tailCollar = (
    at: THREE.Vector3,
    axis: THREE.Vector3,
    radius: number,
    name: string,
  ) => {
    b.part(
      new THREE.TorusGeometry(radius, 0.012, 6, 12),
      dark,
      {
        at,
        dir: axis,
        bone: J.tail1,
        name,
        group: "stern",
      },
    );
  };

  tailCollar(J.tail1.at, J.tail1.axis, 0.098, "stern.tail1Collar");

  const tail2Disc = b.part(
    new THREE.CylinderGeometry(0.108, 0.108, 0.052, 10),
    knuckle,
    {
      at: J.tail2.at,
      dir: J.tail2.axis,
      bone: J.tail2,
      name: "stern.tail2Knuckle",
      group: "stern",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.045, 0.045, 0.064, 8),
    rust,
    {
      at: J.tail2.at,
      dir: J.tail2.axis,
      bone: J.tail2,
      name: "stern.tail2RustHub",
      group: "stern",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.018, 0.018, 0.09, 6),
    light,
    {
      at: J.tail2.at,
      dir: J.tail2.axis,
      bone: J.tail2,
      name: "stern.tail2Axle",
      group: "stern",
      flat: true,
    },
  );

  const rootWrap = (
    at: THREE.Vector3,
    axis: THREE.Vector3,
    radius: number,
    name: string,
  ) => {
    b.part(
      new THREE.TorusGeometry(radius, 0.009, 6, 12),
      rope,
      {
        at,
        dir: axis,
        bone: J.tail1,
        name,
        group: "stern",
      },
    );
  };

  rootWrap(new THREE.Vector3(0, 2.765, -2.53), tailPath.tangentAt(0.47), 0.079, "stern.finRootWrapA");
  rootWrap(new THREE.Vector3(0, 2.66, -2.65), tailPath.tangentAt(0.52), 0.074, "stern.finRootWrapB");
  rootWrap(new THREE.Vector3(0, 2.56, -3.34), tailPath.tangentAt(0.76), 0.054, "stern.finRootWrapC");

  const fin = (
    centerZ: number,
    baseY: number,
    halfSpan: number,
    height: number,
    bone: any,
    name: string,
  ) => {
    const front = new THREE.Vector3(0, baseY, centerZ - halfSpan);
    const tip = new THREE.Vector3(0, baseY + height, centerZ);
    const back = new THREE.Vector3(0, baseY, centerZ + halfSpan);

    b.membrane(
      [front, tip],
      [back, tip],
      {
        bone,
        color: sail,
        thickness: 0.018,
        rows: 3,
        cols: 5,
        name,
        group: "stern",
      },
    );

    b.rod(front, tip, 0.012, sailEdge, {
      bone,
      caps: "round",
      name: `${name}.leadingEdge`,
      group: "stern",
    });
    b.rod(tip, back, 0.012, sailEdge, {
      bone,
      caps: "round",
      name: `${name}.trailingEdge`,
      group: "stern",
    });
    b.rod(back, front, 0.010, sailEdge, {
      bone,
      caps: "round",
      name: `${name}.rootEdge`,
      group: "stern",
    });

    b.part(
      new THREE.BoxGeometry(0.055, 0.045, 0.06),
      rust,
      {
        at: front,
        bone,
        name: `${name}.frontBracket`,
        group: "stern",
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.055, 0.045, 0.06),
      rust,
      {
        at: back,
        bone,
        name: `${name}.backBracket`,
        group: "stern",
        flat: true,
      },
    );
  };

  fin(-2.62, 2.70, 0.34, 0.38, J.tail1, "stern.finA");
  fin(-3.38, 2.54, 0.28, 0.40, J.tail2, "stern.finB");

  const stabilizerOutline: [number, number, "sharp"][] = [
    [-0.46, -0.10, "sharp"],
    [-0.30, 0.11, "sharp"],
    [0.34, 0.12, "sharp"],
    [0.52, -0.06, "sharp"],
    [0.28, -0.14, "sharp"],
    [-0.30, -0.15, "sharp"],
  ];

  const stabilizer = b.extrude(stabilizerOutline, {
    at: J.tail2.at,
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.022,
    bevel: 0.004,
    smoothing: 0,
    color: sail,
    bone: J.tail2,
    name: "stern.horizontalStabilizer",
    group: "stern",
  });

  const stabilizerFront = stabilizer.local([-0.46, -0.10, 0.015]);
  const stabilizerTip = stabilizer.local([0.34, 0.12, 0.015]);
  const stabilizerRear = stabilizer.local([0.52, -0.06, 0.015]);

  b.rod(stabilizerFront, stabilizerTip, 0.011, sailEdge, {
    bone: J.tail2,
    name: "stern.stabilizerLeadingTrim",
    group: "stern",
  });
  b.rod(stabilizerTip, stabilizerRear, 0.011, sailEdge, {
    bone: J.tail2,
    name: "stern.stabilizerTrailingTrim",
    group: "stern",
  });

  const stabilizerRoot = new THREE.Vector3(0, J.tail2.at.y, J.tail2.at.z);
  b.rod(stabilizerRoot, J.tail2.at, 0.016, rust, {
    bone: J.tail2,
    name: "stern.stabilizerBrace",
    group: "stern",
  });

  const organHeaderA = new THREE.Vector3(-0.72, 2.38, -2.30);
  const organHeaderB = new THREE.Vector3(0.72, 2.38, -2.30);

  b.rod(organHeaderA, organHeaderB, 0.035, dark, {
    bone: J.tail1,
    sides: 8,
    name: "stern.rearOrganHeader",
    group: "stern",
  });

  b.part(
    new THREE.BoxGeometry(0.11, 0.12, 0.10),
    rust,
    {
      at: [-0.58, 2.40, -2.30],
      bone: J.tail1,
      name: "stern.organClampL",
      group: "stern",
      flat: true,
    },
  );
  b.part(
    new THREE.BoxGeometry(0.11, 0.12, 0.10),
    rust,
    {
      at: [0.58, 2.40, -2.30],
      bone: J.tail1,
      name: "stern.organClampR",
      group: "stern",
      flat: true,
    },
  );

  const pipeXs = [-0.62, -0.32, 0, 0.32, 0.62];
  const pipeLengths = [0.34, 0.48, 0.60, 0.43, 0.31];

  pipeXs.forEach((x, i) => {
    const len = pipeLengths[i];
    const outward = x === 0 ? 0 : Math.sign(x) * 0.075;
    const start = new THREE.Vector3(x, 2.37, -2.30);
    const end = new THREE.Vector3(x + outward, 2.37 + len, -2.30);

    b.rod(start, end, [0.027, 0.021], dark, {
      bone: J.tail1,
      sides: 7,
      caps: "flat",
      name: `stern.organPipe${i + 1}`,
      group: "stern",
    });

    const axis = end.clone().sub(start).normalize();

    b.part(
      new THREE.TorusGeometry(0.032, 0.009, 6, 10),
      rust,
      {
        at: start.clone().addScaledVector(axis, 0.045),
        dir: axis,
        bone: J.tail1,
        name: `stern.organPipe${i + 1}BaseCollar`,
        group: "stern",
      },
    );

    b.part(
      new THREE.TorusGeometry(0.024, 0.008, 6, 10),
      rust,
      {
        at: end.clone().addScaledVector(axis, -0.035),
        dir: axis,
        bone: J.tail1,
        name: `stern.organPipe${i + 1}MouthCollar`,
        group: "stern",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.035, 6),
      light,
      {
        at: end,
        dir: axis,
        bone: J.tail1,
        name: `stern.organPipe${i + 1}MouthCap`,
        group: "stern",
        flat: true,
      },
    );
  });

  const lowerBraceA = new THREE.Vector3(-0.68, 2.31, -2.30);
  const lowerBraceB = new THREE.Vector3(0.68, 2.31, -2.30);
  b.rod(lowerBraceA, lowerBraceB, 0.010, rope, {
    bone: J.tail1,
    name: "stern.organLowerTie",
    group: "stern",
  });

  b.rod(
    new THREE.Vector3(-0.70, 2.41, -2.30),
    new THREE.Vector3(-0.70, 2.31, -2.30),
    0.014,
    rust,
    {
      bone: J.tail1,
      name: "stern.organClampTieL",
      group: "stern",
    },
  );
  b.rod(
    new THREE.Vector3(0.70, 2.41, -2.30),
    new THREE.Vector3(0.70, 2.31, -2.30),
    0.014,
    rust,
    {
      bone: J.tail1,
      name: "stern.organClampTieR",
      group: "stern",
    },
  );

  const rearRope = catmull(
    [
      [-0.16, 2.73, -2.49],
      [-0.20, 2.71, -2.62],
      [-0.15, 2.67, -2.76],
    ],
    { tension: 0.4 },
  );
  b.sweep(rearRope, 0.008, {
    bone: J.tail1,
    color: rope,
    sides: 6,
    caps: "round",
    name: "stern.finRootLashingL",
    group: "stern",
  });

  const rearRopeR = catmull(
    [
      [0.16, 2.73, -2.49],
      [0.20, 2.71, -2.62],
      [0.15, 2.67, -2.76],
    ],
    { tension: 0.4 },
  );
  b.sweep(rearRopeR, 0.008, {
    bone: J.tail1,
    color: rope,
    sides: 6,
    caps: "round",
    name: "stern.finRootLashingR",
    group: "stern",
  });
}
    return buildStern;
  })(),
  // legsL
  (() => {
function buildLegsL({ b, J, P, M }: Ctx) {
  const rand = rng(417);
  const tube = P.tube;
  const tubeLight = P.tubeLight;
  const tubeDark = P.tubeDark;
  const knuckle = P.knuckle;
  const rust = P.rust;
  const rope = P.rope;

  const flat = { flat: true };

  const v = (p: any) => new THREE.Vector3(p[0], p[1], p[2]);
  const point = (p: any) => [p.x, p.y, p.z] as [number, number, number];

  const addRod = (
    a: any,
    c: any,
    radius: number,
    color: string,
    bone: any,
    name: string,
    caps: "round" | "flat" = "round",
  ) => {
    return b.rod(a, c, radius, {
      color,
      bone,
      caps,
      section: { ngon: 6 },
      name,
      ...flat,
    });
  };

  const addDisc = (at: any, radius: number, depth: number, color: string, bone: any, name: string) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, 12, 1), color, {
      at,
      bone,
      dir: [1, 0, 0],
      name,
      ...flat,
    });
  };

  const addRim = (at: any, radius: number, tubeRadius: number, color: string, bone: any, name: string) => {
    return b.part(new THREE.TorusGeometry(radius, tubeRadius, 6, 12), color, {
      at,
      bone,
      dir: [1, 0, 0],
      name,
      ...flat,
    });
  };

  const addBolt = (at: any, bone: any, name: string, scale = 1) => {
    return b.part(new THREE.SphereGeometry(0.026 * scale, 8, 6), rust, {
      at,
      bone,
      name,
      ...flat,
    });
  };

  const addBracket = (at: any, bone: any, name: string) => {
    b.part(new THREE.BoxGeometry(0.13, 0.11, 0.08), rust, {
      at,
      bone,
      name,
      ...flat,
    });
    b.part(new THREE.BoxGeometry(0.075, 0.125, 0.095), tubeDark, {
      at: [at[0] + 0.035, at[1] + 0.005, at[2]],
      bone,
      name: `${name}Plate`,
      ...flat,
    });
    addBolt([at[0] + 0.075, at[1], at[2] + 0.045], bone, `${name}Bolt`);
  };

  const makeFoot = (foot: any, bone: any, id: string, forward: number) => {
    const p = v(foot);
    const z0 = -0.25 + forward;
    const z1 = 0.25 + forward;

    const paddle = b.extrude(
      [
        [z0, -0.105],
        [z1, -0.105],
        [z1 + 0.035, 0.105],
        [z0 - 0.045, 0.105],
      ],
      {
        at: [p.x, 0.026, p.z],
        x: [0, 0, 1],
        y: [1, 0, 0],
        thickness: 0.052,
        bevel: 0.006,
        smoothing: 0,
        bone,
        color: tubeDark,
        name: `${id}Paddle`,
      },
    );

    addRod(
      [p.x - 0.098, 0.058, p.z + z0 + 0.025],
      [p.x - 0.098, 0.058, p.z + z1 - 0.025],
      0.012,
      tubeLight,
      bone,
      `${id}OuterRim`,
      "flat",
    );
    addRod(
      [p.x + 0.098, 0.058, p.z + z0 + 0.025],
      [p.x + 0.098, 0.058, p.z + z1 - 0.025],
      0.012,
      tubeLight,
      bone,
      `${id}InnerRim`,
      "flat",
    );

    b.part(new THREE.BoxGeometry(0.19, 0.018, 0.035), tubeLight, {
      at: [p.x, 0.062, p.z + z0 + 0.035],
      bone,
      name: `${id}ToeBrace`,
      ...flat,
    });

    return paddle;
  };

  const makeCrank = (hip: any, knee: any, foot: any, bone: any, id: string, side = 1) => {
    const h = v(hip);
    const k = v(knee);
    const f = v(foot);

    const axleCenter = new THREE.Vector3(h.x + 0.075, h.y, h.z);
    addRod(
      [h.x - 0.018, h.y, h.z],
      [h.x + 0.145, h.y, h.z],
      0.019,
      tubeDark,
      bone,
      `${id}Axle`,
      "flat",
    );

    addDisc(point(axleCenter), 0.14, 0.035, rust, bone, `${id}Crank`);
    addRim(point(axleCenter), 0.112, 0.012, tubeLight, bone, `${id}CrankRim`);

    const center = axleCenter.clone();
    for (let spoke = 0; spoke < 6; spoke++) {
      const a = (spoke / 6) * Math.PI * 2 + Math.PI / 6;
      const end = center.clone().add(new THREE.Vector3(0, Math.cos(a) * 0.105, Math.sin(a) * 0.105));
      addRod(point(center), point(end), 0.012, rust, bone, `${id}Spoke${spoke}`, "flat");
      addBolt(point(end), bone, `${id}SpokeBolt${spoke}`, 0.72);
    }

    const shinMid = k.clone().lerp(f, 0.48);
    const crankPin = center.clone().add(new THREE.Vector3(0.052 * side, -0.082, 0.025));
    addRod(point(crankPin), point(shinMid), 0.012, rope, bone, `${id}TieRod`, "flat");
    addBolt(point(crankPin), bone, `${id}CrankPin`, 0.8);
    addBolt(point(shinMid), bone, `${id}ShinPin`, 0.72);
  };

  const makeLeg = (index: number, z: number, spineBone: any, forward: number) => {
    const hip = J[`hipL${index}`];
    const knee = J[`kneeL${index}`];
    const foot = J[`footL${index}`];

    const hp = v(hip.at);
    const kp = v(knee.at);
    const fp = v(foot.at);

    const id = `legsL${index}`;

    // Three-sided outer yoke. The upper node is seated on the backbone,
    // while the two lower branches converge on the hip socket.
    const upper = new THREE.Vector3(0.5, 2.84, z);
    const branchA = new THREE.Vector3(1.12, 2.77, z + 0.23);
    const branchB = new THREE.Vector3(1.12, 2.77, z - 0.23);
    const apex = new THREE.Vector3(1.35, 2.75, z);

    addRod(point(upper), point(branchA), 0.05, tube, spineBone, `${id}YokeUpperA`);
    addRod(point(branchA), point(apex), 0.05, tube, hip, `${id}YokeFront`);
    addRod(point(apex), point(branchB), 0.05, tube, hip, `${id}YokeRear`);
    addRod(point(branchB), point(upper), 0.05, tube, spineBone, `${id}YokeLower`);
    addRod(point(upper), point(apex), 0.035, tubeLight, spineBone, `${id}YokeDiagonal`);

    addBracket(point(upper), spineBone, `${id}SpineBracket`);
    addDisc(point(hp), 0.09, 0.055, knuckle, hip, `${id}HipKnuckle`);
    addRim(point(hp), 0.075, 0.011, tubeLight, hip, `${id}HipRim`);
    addBolt([hp.x + 0.041, hp.y, hp.z], hip, `${id}HipBolt`, 1.15);

    // Main articulated members use the already-authored skeleton joints.
    b.sweep([hip.at, knee.at], 0.075, {
      color: tube,
      bone: [hip, knee],
      section: { ngon: 6 },
      caps: "round",
      name: `${id}Thigh`,
      ...flat,
    });

    b.sweep([knee.at, foot.at], 0.06, {
      color: tubeLight,
      bone: [knee, foot],
      section: { ngon: 6 },
      caps: "round",
      name: `${id}Shin`,
      ...flat,
    });

    addDisc(point(kp), 0.082, 0.052, knuckle, knee, `${id}KneeKnuckle`);
    addRim(point(kp), 0.068, 0.010, tubeLight, knee, `${id}KneeRim`);
    addBolt([kp.x + 0.039, kp.y, kp.z], knee, `${id}KneeBolt`, 0.95);

    const shinAxis = kp.clone().lerp(fp, 0.46);
    addRod(
      [kp.x + 0.032, kp.y - 0.012, kp.z],
      point(shinAxis),
      0.018,
      tubeDark,
      knee,
      `${id}ShinCuff`,
      "flat",
    );

    makeFoot(foot.at, foot, id, forward);
    makeCrank(hip.at, knee.at, foot.at, hip, id, 1);

    // Small engineering collars at the three principal pivots.
    addRod(
      [hp.x - 0.01, hp.y, hp.z],
      [hp.x + 0.01, hp.y, hp.z],
      0.105,
      tubeDark,
      hip,
      `${id}HipCollar`,
      "flat",
    );
    addRod(
      [kp.x - 0.008, kp.y, kp.z],
      [kp.x + 0.008, kp.y, kp.z],
      0.096,
      tubeDark,
      knee,
      `${id}KneeCollar`,
      "flat",
    );

    // A pair of tiny diagonal control links makes the yoke read as a working
    // articulated mechanism rather than merely a support frame.
    const controlA = hp.clone().add(new THREE.Vector3(0.02, 0.02, 0.075));
    const controlB = kp.clone().add(new THREE.Vector3(0.02, 0.08, -0.06));
    addRod(point(controlA), point(controlB), 0.014, rope, hip, `${id}ControlLinkA`, "flat");

    const controlC = hp.clone().add(new THREE.Vector3(0.02, 0.02, -0.075));
    const controlD = kp.clone().add(new THREE.Vector3(0.02, 0.08, 0.06));
    addRod(point(controlC), point(controlD), 0.014, rope, hip, `${id}ControlLinkB`, "flat");
  };

  const stations = [
    { i: 1, z: 2.0, spine: J.spine0, forward: 0.035 },
    { i: 2, z: 0.3, spine: J.spine1, forward: 0.0 },
    { i: 3, z: -1.4, spine: J.spine2, forward: -0.02 },
  ];

  for (const station of stations) {
    makeLeg(station.i, station.z, station.spine, station.forward);
  }

  // Reinforced central yoke plate, located exactly on the shared yokeL mount.
  const yoke = M.yokeL ?? [1.35, 2.75, 0.3];
  b.part(new THREE.BoxGeometry(0.18, 0.16, 0.22), rust, {
    at: yoke,
    bone: J.hipL2,
    name: "legsLSharedYokePlate",
    ...flat,
  });
  addRim(yoke, 0.105, 0.012, tubeLight, J.hipL2, "legsLSharedYokeRing");
  addBolt([yoke[0] + 0.095, yoke[1], yoke[2]], J.hipL2, "legsLSharedYokeBolt", 1.25);
}
    return buildLegsL;
  })(),
  // legsR
  (() => {
function buildLegsR({ b, J, P, M }: Ctx) {
  const tube = P.tube;
  const light = P.tubeLight;
  const dark = P.tubeDark;
  const knuckle = P.knuckle;
  const rust = P.rust;
  const rope = P.rope;

  const v = (p: any) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);

  const addRod = (
    a: any,
    c: any,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    b.rod(v(a), v(c), radius, {
      color,
      bone,
      section: { ngon: 6 },
      name,
      group: "legsR",
    });
  };

  const addDisc = (
    at: any,
    radius: number,
    depth: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, depth, 10, 1, false),
      color,
      {
        at: v(at),
        bone,
        dir: [-1, 0, 0],
        name,
        group: "legsR",
        flat: true,
      },
    );
  };

  const addBolt = (at: any, radius: number, bone: any, name: string) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius * 0.88, 0.035, 8, 1, false),
      rust,
      {
        at: v(at),
        bone,
        dir: [-1, 0, 0],
        name,
        group: "legsR",
        flat: true,
      },
    );
  };

  const addWasher = (at: any, radius: number, bone: any, name: string) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, 0.018, 10, 1, false),
      light,
      {
        at: v(at),
        bone,
        dir: [-1, 0, 0],
        name,
        group: "legsR",
        flat: true,
      },
    );
  };

  const footBlade = (foot: THREE.Vector3, zStation: number, index: number, forward: number) => {
    const centre = new THREE.Vector3(foot.x, 0.026, foot.z + forward * 0.015);

    // The outline is drawn in the z/x plane and extruded only 5 cm along Y.
    const outline: [number, number, "sharp"][] = [
      [-0.28, -0.085, "sharp"],
      [0.24, -0.075, "sharp"],
      [0.29, 0.075, "sharp"],
      [-0.22, 0.085, "sharp"],
    ];

    b.extrude(outline, {
      at: centre,
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.05,
      bevel: 0.006,
      color: dark,
      bone: J[`footR${index}`],
      name: `legsRFootBlade${index}`,
      group: "legsR",
    });

    // Pale wear rail along the upper edge of the paddle.
    addRod(
      new THREE.Vector3(foot.x - 0.19, 0.058, foot.z - 0.17 + forward * 0.015),
      new THREE.Vector3(foot.x + 0.21, 0.058, foot.z + 0.18 + forward * 0.015),
      0.012,
      light,
      J[`footR${index}`],
      `legsRFootRail${index}`,
    );

    // Two small transverse tread bars make the foot read as fabricated rather than organic.
    for (let q = -1; q <= 1; q += 2) {
      addRod(
        new THREE.Vector3(foot.x - 0.075, 0.062, foot.z + q * 0.135 + forward * 0.015),
        new THREE.Vector3(foot.x + 0.075, 0.062, foot.z + q * 0.135 + forward * 0.015),
        0.009,
        tube,
        J[`footR${index}`],
        `legsRFootTread${index}_${q > 0 ? "A" : "B"}`,
      );
    }

    addBolt(
      new THREE.Vector3(foot.x - 0.035, 0.065, foot.z + forward * 0.015),
      0.022,
      J[`footR${index}`],
      `legsRFootBolt${index}`,
    );
  };

  const buildLeg = (index: number, zStation: number, forward: number) => {
    const hip = v(J[`hipR${index}`].at);
    const knee = v(J[`kneeR${index}`].at);
    const foot = v(J[`footR${index}`].at);

    const hipBone = J[`hipR${index}`];
    const kneeBone = J[`kneeR${index}`];
    const footBone = J[`footR${index}`];

    // Three-point yoke: a rigid triangular bracket tying the leg socket into the keel.
    const spineBolt = new THREE.Vector3(-0.52, 2.91, zStation);
    const upperRear = new THREE.Vector3(-0.67, 2.77, zStation - 0.34);
    const lowerInner = new THREE.Vector3(-0.82, 2.47, zStation + 0.05);

    addRod(
      spineBolt,
      hip,
      0.05,
      tube,
      hipBone,
      `legsRYokeOuter${index}`,
    );
    addRod(
      spineBolt,
      upperRear,
      0.048,
      tube,
      hipBone,
      `legsRYokeUpper${index}`,
    );
    addRod(
      upperRear,
      lowerInner,
      0.045,
      tube,
      hipBone,
      `legsRYokeBack${index}`,
    );
    addRod(
      lowerInner,
      hip,
      0.045,
      tube,
      hipBone,
      `legsRYokeLower${index}`,
    );

    // A short diagonal brace is deliberately darker, giving the yoke a layered steel-frame silhouette.
    addRod(
      new THREE.Vector3(-0.66, 2.82, zStation + 0.18),
      new THREE.Vector3(-1.11, 2.73, zStation - 0.04),
      0.028,
      dark,
      hipBone,
      `legsRYokeDiagonal${index}`,
    );

    // Rusted rectangular-looking clamp at the keel attachment.
    b.part(
      new THREE.BoxGeometry(0.16, 0.13, 0.12),
      rust,
      {
        at: new THREE.Vector3(-0.53, 2.91, zStation),
        bone: hipBone,
        name: `legsRYokeBracket${index}`,
        group: "legsR",
        flat: true,
      },
    );
    addBolt(
      new THREE.Vector3(-0.60, 2.91, zStation),
      0.027,
      hipBone,
      `legsRYokeBolt${index}`,
    );

    // Hip bearing: dark outer cheek, pale backing washer, and a bright rust axle stud.
    addDisc(
      new THREE.Vector3(hip.x - 0.045, hip.y, hip.z),
      0.092,
      0.075,
      knuckle,
      hipBone,
      `legsRHipKnuckle${index}`,
    );
    addWasher(
      new THREE.Vector3(hip.x + 0.008, hip.y, hip.z),
      0.067,
      hipBone,
      `legsRHipWasher${index}`,
    );
    addBolt(
      new THREE.Vector3(hip.x - 0.092, hip.y, hip.z),
      0.026,
      hipBone,
      `legsRHipBolt${index}`,
    );

    // Main moving links.
    addRod(hip, knee, 0.075, tube, hipBone, `legsRThigh${index}`);
    addRod(knee, foot, 0.06, light, kneeBone, `legsRShin${index}`);

    // A second slim parallel rail on the thigh emphasizes the characteristic Jansen linkage.
    addRod(
      new THREE.Vector3(hip.x + 0.025, hip.y - 0.045, hip.z),
      new THREE.Vector3(knee.x + 0.025, knee.y + 0.05, knee.z),
      0.018,
      dark,
      hipBone,
      `legsRThighRail${index}`,
    );

    // Knee joint and pale rim.
    addDisc(
      new THREE.Vector3(knee.x - 0.045, knee.y, knee.z),
      0.084,
      0.07,
      knuckle,
      kneeBone,
      `legsRKneeKnuckle${index}`,
    );
    addWasher(
      new THREE.Vector3(knee.x - 0.09, knee.y, knee.z),
      0.062,
      kneeBone,
      `legsRKneeRim${index}`,
    );
    addBolt(
      new THREE.Vector3(knee.x - 0.12, knee.y, knee.z),
      0.022,
      kneeBone,
      `legsRKneeBolt${index}`,
    );

    // Crank disk on the hip, with six spokes laid out in its YZ plane.
    const crankCentre = new THREE.Vector3(hip.x - 0.12, hip.y, hip.z);
    addDisc(
      crankCentre,
      0.14,
      0.045,
      rust,
      hipBone,
      `legsRCrankDisc${index}`,
    );
    addDisc(
      new THREE.Vector3(hip.x - 0.148, hip.y, hip.z),
      0.047,
      0.018,
      knuckle,
      hipBone,
      `legsRCrankHub${index}`,
    );

    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2 + Math.PI / 6;
      const start = new THREE.Vector3(
        crankCentre.x - 0.026,
        crankCentre.y + Math.cos(a) * 0.035,
        crankCentre.z + Math.sin(a) * 0.035,
      );
      const end = new THREE.Vector3(
        crankCentre.x - 0.026,
        crankCentre.y + Math.cos(a) * 0.112,
        crankCentre.z + Math.sin(a) * 0.112,
      );
      addRod(start, end, 0.014, rust, hipBone, `legsRCrankSpoke${index}_${s}`);
    }

    // Tie rod from the lower crank pin to the shin midpoint.
    const shinMid = knee.clone().lerp(foot, 0.52);
    const crankPin = new THREE.Vector3(
      crankCentre.x - 0.035,
      crankCentre.y - 0.095,
      crankCentre.z + (index === 1 ? 0.025 : -0.035),
    );
    addRod(
      crankPin,
      new THREE.Vector3(shinMid.x - 0.035, shinMid.y, shinMid.z),
      0.012,
      rope,
      hipBone,
      `legsRTieRod${index}`,
    );
    addBolt(crankPin, 0.019, hipBone, `legsRCrankPin${index}`);

    // Small stop collar around the lower shin.
    addRod(
      new THREE.Vector3(shinMid.x - 0.03, shinMid.y - 0.035, shinMid.z),
      new THREE.Vector3(shinMid.x - 0.03, shinMid.y + 0.035, shinMid.z),
      0.018,
      rust,
      kneeBone,
      `legsRShinCollar${index}`,
    );

    footBlade(foot, zStation, index, forward);
  };

  buildLeg(1, 2.0, 1);
  buildLeg(2, 0.3, 0);
  buildLeg(3, -1.4, -1);
}
    return buildLegsR;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "strandBeast" });
  const J: Record<string, Joint> = {};
  J["spine0"] = b.joint("spine0", { at: [0,2.95,1.6], dir: [0,0,1], role: "spine" });
  J["spine1"] = b.joint("spine1", { parent: J["spine0"], at: [0,2.9,0.4], dir: [0,0,1], role: "spine" });
  J["spine2"] = b.joint("spine2", { parent: J["spine1"], at: [0,2.9,-0.9], dir: [0,0,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["spine0"], at: [0,3.25,2.5], dir: [0,0.45,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck1"], at: [0,3.65,3.15], dir: [0,0.2,1], role: "head" });
  J["tail1"] = b.joint("tail1", { parent: J["spine2"], at: [0,2.75,-2.1], dir: [0,-0.1,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,2.6,-2.9], dir: [0,-0.15,-1], role: "tail" });
  J["hipL1"] = b.joint("hipL1", { parent: J["spine0"], at: [1.35,2.75,2], dir: [0.25,-1,0], role: "leg" });
  J["kneeL1"] = b.joint("kneeL1", { parent: J["hipL1"], at: [1.75,1.5,2], dir: [0.15,-1,0], role: "leg" });
  J["footL1"] = b.joint("footL1", { parent: J["kneeL1"], at: [1.85,0.05,1.9], dir: [0.05,-1,-0.25], role: "digit" });
  J["hipL2"] = b.joint("hipL2", { parent: J["spine1"], at: [1.35,2.75,0.3], dir: [0.25,-1,0], role: "leg" });
  J["kneeL2"] = b.joint("kneeL2", { parent: J["hipL2"], at: [1.75,1.5,0.3], dir: [0.15,-1,0], role: "leg" });
  J["footL2"] = b.joint("footL2", { parent: J["kneeL2"], at: [1.85,0.05,0.2], dir: [0.05,-1,-0.25], role: "digit" });
  J["hipL3"] = b.joint("hipL3", { parent: J["spine2"], at: [1.35,2.75,-1.4], dir: [0.25,-1,0], role: "leg" });
  J["kneeL3"] = b.joint("kneeL3", { parent: J["hipL3"], at: [1.75,1.5,-1.4], dir: [0.15,-1,0], role: "leg" });
  J["footL3"] = b.joint("footL3", { parent: J["kneeL3"], at: [1.85,0.05,-1.5], dir: [0.05,-1,-0.25], role: "digit" });
  J["hipR1"] = b.joint("hipR1", { parent: J["spine0"], at: [-1.35,2.75,2], dir: [-0.25,-1,0], role: "leg" });
  J["kneeR1"] = b.joint("kneeR1", { parent: J["hipR1"], at: [-1.75,1.5,2], dir: [-0.15,-1,0], role: "leg" });
  J["footR1"] = b.joint("footR1", { parent: J["kneeR1"], at: [-1.85,0.05,1.9], dir: [-0.05,-1,-0.25], role: "digit" });
  J["hipR2"] = b.joint("hipR2", { parent: J["spine1"], at: [-1.35,2.75,0.3], dir: [-0.25,-1,0], role: "leg" });
  J["kneeR2"] = b.joint("kneeR2", { parent: J["hipR2"], at: [-1.75,1.5,0.3], dir: [-0.15,-1,0], role: "leg" });
  J["footR2"] = b.joint("footR2", { parent: J["kneeR2"], at: [-1.85,0.05,0.2], dir: [-0.05,-1,-0.25], role: "digit" });
  J["hipR3"] = b.joint("hipR3", { parent: J["spine2"], at: [-1.35,2.75,-1.4], dir: [-0.25,-1,0], role: "leg" });
  J["kneeR3"] = b.joint("kneeR3", { parent: J["hipR3"], at: [-1.75,1.5,-1.4], dir: [-0.15,-1,0], role: "leg" });
  J["footR3"] = b.joint("footR3", { parent: J["kneeR3"], at: [-1.85,0.05,-1.5], dir: [-0.05,-1,-0.25], role: "digit" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
