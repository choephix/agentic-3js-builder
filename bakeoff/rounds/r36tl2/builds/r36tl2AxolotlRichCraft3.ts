import * as THREE from "three";
import { createBuilder, catmull, frame, line, rng } from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A cute low-poly axolotl with a rounded body, expressive eyes, broad tail, and frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi_axolotl", detail: 1 });

  const SKIN = cel("#e99aa8", "#b95d78");
  const BELLY = cel("#ffd4c9", "#eea6a5");
  const GILL = cel("#ff7198", "#c9366d");
  const GILL_LIGHT = cel("#ffb2bd", "#ed5c87");
  const DARK = INK;
  const EYE_BLUE = "#58c8dc";
  const WHITE = "#fff8f3";
  const MOUTH = "#7d3152";
  const PAW = cel("#f5a9b2", "#c96782");

  // ---------------------------------------------------------------------------
  // Skeleton: one root, a central body chain, head, tail, and four short legs.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.34, -0.24],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.34, -0.34],
    [0, 0.37, -0.08],
    [0, 0.39, 0.18],
    [0, 0.43, 0.37],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
    count: 4,
  });

  const tailPath = catmull([
    [0, 0.34, -0.28],
    [0, 0.31, -0.58],
    [0, 0.27, -0.9],
    [0, 0.21, -1.18],
    [0, 0.15, -1.4],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    count: 5,
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.48, 0.42],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.39, 0.53],
    dir: [0, -0.16, 0.98],
    role: "jaw",
    group: "face",
  });

  // Four simple relaxed legs, spread clearly like a chibi salamander.
  const legData = [
    { side: 1, z: 0.18, name: "legFL", target: [0.3, 0.08, 0.28] as [number, number, number] },
    { side: -1, z: 0.18, name: "legFR", target: [-0.3, 0.08, 0.28] as [number, number, number] },
    { side: 1, z: -0.2, name: "legHL", target: [0.34, 0.08, -0.25] as [number, number, number] },
    { side: -1, z: -0.2, name: "legHR", target: [-0.34, 0.08, -0.25] as [number, number, number] },
  ];

  const legs: { chain: ReturnType<typeof b.chain>; side: number; front: boolean }[] = [];

  for (const d of legData) {
    const root = [d.side * 0.13, 0.34, d.z] as [number, number, number];
    const knee = [d.side * 0.24, 0.2, d.z + (d.z > 0 ? 0.035 : -0.03)] as [
      number,
      number,
      number,
    ];
    const path = catmull([root, knee, d.target]);
    const chain = b.chain(d.name, path, {
      parent: hips,
      names: [`${d.name}Hip`, `${d.name}Knee`, `${d.name}Ankle`],
      role: "leg",
      count: 3,
      contact: d.target,
    });
    legs.push({ chain, side: d.side, front: d.z > 0 });
  }

  // ---------------------------------------------------------------------------
  // Main body and tail: broad, soft, low-poly tubes.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.205 + 0.025 * Math.sin(t * Math.PI), {
    color: furEdge(SKIN, BELLY, {
      level: -0.02,
      teeth: 0.08,
      period: 0.12,
      along: [0, 0, 1],
    }),
    sides: 8,
    section: "circle",
    name: "rounded_body",
    group: "body",
  });

  b.sweep(tail, (t) => 0.18 * (1 - t) + 0.018, {
    color: furEdge(SKIN, BELLY, {
      level: -0.08,
      teeth: 0.06,
      period: 0.1,
      along: [0, 0, 1],
    }),
    sides: 7,
    section: "circle",
    name: "tapered_tail",
    group: "body",
    caps: { start: "round", end: "point" },
  });

  // Tail fin, a broad translucent-looking pink silhouette.
  b.extrude(
    [
      [0, 0],
      [0.17, 0.18],
      [0.13, 0.43],
      [0.08, 0.7],
      [0, 0.9],
      [-0.08, 0.7],
      [-0.13, 0.43],
      [-0.17, 0.18],
    ],
    {
      at: [0, 0.17, -0.92],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.008,
      smoothing: 1,
      color: cel("#f3a4b0", "#c76580"),
      bone: tail.joints[2],
      name: "tail_fin",
      group: "tail",
    },
  );

  // Legs and rounded webby feet.
  for (const d of legs) {
    b.sweep(d.chain, [0.075, 0.055], {
      color: SKIN,
      sides: 7,
      section: "circle",
      name: `${d.chain.joints[0].name}_limb`,
      group: "legs",
    });

    const foot = d.chain.tip;
    b.part(new THREE.SphereGeometry(0.075, 8, 5), PAW, {
      bone: foot,
      at: foot.at,
      scale: [1.15, 0.6, 1.35],
      name: `${foot.name}_webbed_foot`,
      group: "legs",
    });

    for (let toe = -1; toe <= 1; toe++) {
      const x = d.side * (0.04 + toe * 0.035);
      const z = foot.at.z + (d.front ? 0.035 : -0.035) + toe * 0.012;
      b.sweep(
        [
          [x, 0.075, z],
          [x + d.side * 0.025, 0.045, z + (d.front ? 0.045 : -0.045)],
        ],
        [0.018, 0.004],
        {
          color: PAW,
          sides: 6,
          caps: { start: "round", end: "point" },
          name: `${foot.name}_toe${toe + 2}`,
          group: "digits",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Head, muzzle, belly patch, mouth, and eyes.
  // ---------------------------------------------------------------------------

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, {
    bone: head,
    at: head.at,
    scale: [0.29, 0.255, 0.3],
    name: "large_round_head",
    group: "head",
  });

  b.part(new THREE.SphereGeometry(1, 10, 7), BELLY, {
    bone: head,
    at: head.local({ forward: 0.235, down: 0.065 }),
    scale: [0.2, 0.12, 0.09],
    name: "cream_muzzle",
    group: "face",
  });

  b.sweep(
    [
      [0, 0.405, 0.53],
      [0, 0.39, 0.585],
    ],
    [0.014, 0.006],
    {
      bone: jaw,
      color: MOUTH,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: "smiling_mouth",
      group: "face",
    },
  );

  const eyeTexture = animeEye({
    iris: EYE_BLUE,
    irisLight: "#b9f4fa",
    irisDark: "#197f9e",
    ink: DARK,
    blush: false,
    size: 256,
  });

  const headSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const eyeHit = headSurface.around(head.at).at(s * 38, 8);
    if (eyeHit) {
      b.decal(headSurface, eyeTexture, {
        at: eyeHit,
        size: [0.105, 0.135],
        lift: 0.004,
        mirror: s > 0,
        segments: 7,
        name: s > 0 ? "eyeL" : "eyeR",
        group: "face",
      });
    }

    // Tiny cheek freckles give the face extra axolotl character.
    const cheek = headSurface.around(head.at).at(s * 72, -14);
    if (cheek) {
      for (let i = 0; i < 3; i++) {
        const p = cheek.moved([0.018 * (i - 1), 0.006, 0.012 * (i % 2)]);
        b.stick(new THREE.SphereGeometry(0.009, 6, 4), "#d45e79", p, {
          embed: 0.25,
          name: `cheek_spot_${s}_${i}`,
          group: "face",
        });
      }
    }
  }

  // Soft belly patch, explicitly seated low on the body.
  b.part(new THREE.SphereGeometry(1, 12, 8), BELLY, {
    bone: spine.joints[1],
    at: [0, 0.3, 0.16],
    scale: [0.17, 0.17, 0.14],
    name: "belly_patch",
    group: "body",
  });

  // ---------------------------------------------------------------------------
  // Signature frilly external gills: three swept pink branches on each side,
  // with little connecting membranes for a fan-like silhouette.
  // ---------------------------------------------------------------------------

  const gillRootY = 0.56;
  for (const s of [-1, 1]) {
    const root = [s * 0.205, gillRootY, 0.36] as [number, number, number];
    const branchEnds = [
      [s * 0.43, 0.73, 0.37] as [number, number, number],
      [s * 0.47, 0.58, 0.39] as [number, number, number],
      [s * 0.42, 0.43, 0.41] as [number, number, number],
    ];

    for (let i = 0; i < branchEnds.length; i++) {
      const end = branchEnds[i];
      const mid = [s * 0.32, 0.57 + (i - 1) * 0.055, 0.39] as [number, number, number];
      const branch = catmull([root, mid, end]);
      b.sweep(branch, [0.035, 0.008], {
        color: GILL,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `gill${s > 0 ? "L" : "R"}_branch${i + 1}`,
        group: "gills",
      });

      // Fine outer filament, deliberately thinner and brighter.
      const tip = [end[0] + s * 0.065, end[1] + (i - 1) * 0.018, end[2] + 0.015] as [
        number,
        number,
        number,
      ];
      b.sweep([end, tip], [0.012, 0.001], {
        color: GILL_LIGHT,
        sides: 5,
        caps: { start: "round", end: "point" },
        name: `gill${s > 0 ? "L" : "R"}_filament${i + 1}`,
        group: "gills",
      });
    }

    // Broad frill between the upper and lower branches.
    b.membrane(
      [
        root,
        [s * 0.31, 0.62, 0.39],
        branchEnds[0],
      ],
      [
        root,
        [s * 0.32, 0.51, 0.39],
        branchEnds[2],
      ],
      {
        color: GILL_LIGHT,
        thickness: 0.008,
        rows: 3,
        cols: 8,
        scallop: 0.18,
        name: `gill${s > 0 ? "L" : "R"}_frill`,
        group: "gills",
      },
    );

    // A dark pink root collar makes the frills visibly attach to the skull.
    b.part(new THREE.SphereGeometry(0.052, 8, 5), GILL, {
      bone: head,
      at: root,
      scale: [1.0, 1.25, 0.7],
      name: `gill${s > 0 ? "L" : "R"}_root`,
      group: "gills",
    });
  }

  // Small dorsal spots, sparse and deterministic, to break up the large simple body.
  const bodySurface = b.surface(spine);
  const spots = bodySurface.scatter(18, {
    rng: rng(42),
    minDist: 0.09,
    filter: (h) => h.n.y > 0.15 && h.at.z > -0.45 && h.at.z < 0.28,
  });
  for (let i = 0; i < spots.length; i++) {
    b.stick(new THREE.SphereGeometry(0.018, 6, 4), "#c65f7b", spots[i], {
      embed: 0.35,
      name: `dorsal_spot_${i}`,
      group: "body_detail",
    });
  }

  return b.root;
}
