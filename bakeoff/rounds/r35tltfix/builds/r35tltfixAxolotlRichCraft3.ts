import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A cheerful low-poly axolotl with a round pink body, huge shiny eyes, tiny feet, and flamboyant frilly pink gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const PINK = cel("#e987a9", "#b84f78");
  const BELLY = cel("#ffd7df", "#eaa0b5");
  const GILL = cel("#ff9fc0", "#d95786");
  const GILL_LIGHT = cel("#ffc2d6", "#eb719d");
  const DARK = INK;
  const CREAM = cel("#fff6e8", "#e7c4c2");
  const MOUTH = "#7e294e";
  const WATER_BLUE = "#b6e9ec";

  // -------------------------------------------------------------------------
  // Skeleton first: one central spine, a neck/head, a tail, and four relaxed
  // little limbs. The pose is neutral and easy to rig.
  // -------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.47, 0.02],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.47, -0.65],
    [0, 0.49, -0.25],
    [0, 0.51, 0.16],
    [0, 0.62, 0.38],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineTail", "spineMid", "spineChest"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.72, 0.47],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.65, 0.66],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "head",
  });

  const tailPath = catmull([
    [0, 0.46, -0.25],
    [0, 0.40, -0.78],
    [0, 0.30, -1.22],
    [0, 0.20, -1.58],
    [0, 0.14, -1.84],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });

  const legData = [
    { s: 1, z: 0.23, side: "L" },
    { s: -1, z: 0.23, side: "R" },
    { s: 1, z: -0.31, side: "L" },
    { s: -1, z: -0.31, side: "R" },
  ];

  const legs: { chain: ReturnType<typeof b.chain>; s: number; front: boolean }[] = [];
  for (let i = 0; i < legData.length; i++) {
    const d = legData[i];
    const front = d.z > 0;
    const root: [number, number, number] = [
      d.s * (front ? 0.19 : 0.21),
      0.43,
      d.z,
    ];
    const foot: [number, number, number] = [
      d.s * (front ? 0.32 : 0.36),
      0.13,
      d.z + (front ? 0.08 : -0.08),
    ];
    const points = limb(
      root,
      foot,
      front ? [0.18, 0.16] : [0.20, 0.18],
      [[0, 0, front ? 1 : -1]],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(`leg${d.side}${front ? "Front" : "Hind"}`, points, {
      parent: hips,
      names: [
        `${front ? "shoulder" : "hip"}${d.side}`,
        `${front ? "elbow" : "knee"}${d.side}`,
        `ankle${d.side}${front ? "F" : "H"}`,
      ],
      role: "leg",
      contact: foot,
    });
    legs.push({ chain, s: d.s, front });
  }

  // -------------------------------------------------------------------------
  // Main silhouette: soft chibi body, pale belly, big rounded head, and taper.
  // -------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.23 + 0.025 * Math.sin(t * Math.PI), {
    color: furEdge(PINK, BELLY, {
      level: -0.12,
      teeth: 0.18,
      period: 0.16,
      along: [0, 0, 1],
    }),
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "softBody",
    group: "body",
  });

  b.sweep(tail, (t) => 0.18 * (1 - t) + 0.018, {
    color: furEdge(PINK, BELLY, {
      level: -0.15,
      teeth: 0.12,
      period: 0.15,
      along: [0, 0, 1],
    }),
    section: { ngon: 7 },
    caps: "round",
    name: "taperedTail",
    group: "body",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, [0.105, 0.075], {
      color: PINK,
      section: { ngon: 7 },
      caps: "round",
      name: leg.front ? "frontLeg" : "hindLeg",
      group: "limbs",
    });
  }

  // Tiny webbed toes, separated for a puppet-like readable silhouette.
  for (const leg of legs) {
    const end = leg.chain.tip.at;
    for (let j = -1; j <= 1; j++) {
      const toeEnd: [number, number, number] = [
        end.x + leg.s * 0.055,
        0.075,
        end.z + j * 0.045 + (leg.front ? 0.035 : -0.025),
      ];
      b.rod(end, toeEnd, 0.025, {
        color: BELLY,
        caps: "round",
        section: { ngon: 6 },
        name: "toe",
        group: "digits",
      });
      b.part(new THREE.SphereGeometry(0.026, 6, 4), GILL, {
        bone: leg.chain.tip,
        at: toeEnd,
        name: "toeTip",
        group: "digits",
      });
    }
  }

  // Head mass, cheek puffs, and a pale lower muzzle.
  const skull = b.part(
    new THREE.SphereGeometry(1, 16, 12),
    PINK,
    {
      bone: head,
      at: [0, 0.77, 0.48],
      scale: [0.34, 0.31, 0.32],
      name: "roundSkull",
      group: "head",
    } as any,
  );

  // Explicit cheek geometry keeps this compatible with strict TS runtimes.
  b.part(new THREE.SphereGeometry(0.19, 10, 8), PINK, {
    bone: head,
    at: [-0.20, 0.72, 0.51],
    name: "cheekR",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.19, 10, 8), PINK, {
    bone: head,
    at: [0.20, 0.72, 0.51],
    name: "cheekL",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.145, 10, 7), BELLY, {
    bone: jaw,
    at: [0, 0.665, 0.69],
    scale: [1.28, 0.72, 0.72],
    name: "muzzle",
    group: "face",
  });

  // A separate upper/lower mouth makes the jaw hinge obvious.
  b.rod([0, 0.675, 0.805], [0, 0.67, 0.82], 0.014, {
    color: MOUTH,
    bone: jaw,
    caps: "round",
    name: "mouthLine",
    group: "face",
  });
  b.part(new THREE.SphereGeometry(0.028, 7, 5), "#f4a0b7", {
    bone: jaw,
    at: [0, 0.65, 0.81],
    scale: [2.5, 0.55, 0.45],
    name: "smile",
    group: "face",
  });

  // -------------------------------------------------------------------------
  // Huge shiny eyes: white eyeballs, dark pupils, warm highlights, and brows.
  // -------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const x = s * 0.125;
    b.part(new THREE.SphereGeometry(0.105, 12, 9), CREAM, {
      bone: head,
      at: [x, 0.855, 0.665],
      scale: [1, 1.12, 0.72],
      name: s > 0 ? "eyeL" : "eyeR",
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.067, 10, 8), DARK, {
      bone: head,
      at: [x, 0.875, 0.724],
      scale: [0.72, 1.0, 0.38],
      name: s > 0 ? "pupilL" : "pupilR",
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.019, 7, 5), "#ffffff", {
      bone: head,
      at: [x - s * 0.018, 0.902, 0.75],
      name: "eyeSparkle",
      group: "face",
    });
    b.rod(
      [x - s * 0.075, 0.95, 0.685],
      [x + s * 0.065, 0.965, 0.70],
      0.012,
      { color: DARK, bone: head, caps: "round", name: "brow", group: "face" },
    );
  }

  // Small nostrils and rosy cheek dots.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), DARK, {
      bone: jaw,
      at: [s * 0.045, 0.735, 0.805],
      name: "nostril",
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.022, 7, 5), "#f28aab", {
      bone: head,
      at: [s * 0.205, 0.725, 0.625],
      name: "blush",
      group: "face",
    });
  }

  // -------------------------------------------------------------------------
  // Signature frilly gills. Each side has a chunky pink base and three
  // branching, leaf-like filaments, all extended outward in a rest pose.
  // -------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const base: [number, number, number] = [s * 0.245, 0.82, 0.43];

    b.part(new THREE.SphereGeometry(0.085, 9, 7), GILL, {
      bone: head,
      at: base,
      scale: [1.15, 1.35, 0.8],
      name: s > 0 ? "gillBaseL" : "gillBaseR",
      group: "gills",
    });

    const branches = [
      { y: 0.16, z: 0.07, len: 0.24, r: 0.026 },
      { y: 0.08, z: 0.015, len: 0.30, r: 0.031 },
      { y: -0.005, z: -0.05, len: 0.235, r: 0.024 },
    ];

    for (let i = 0; i < branches.length; i++) {
      const q = branches[i];
      const root: [number, number, number] = [
        s * 0.285,
        0.82 + q.y,
        0.43 + q.z,
      ];
      const tip: [number, number, number] = [
        s * (0.285 + q.len),
        0.82 + q.y + (i - 1) * 0.035,
        0.43 + q.z + 0.055,
      ];
      const mid: [number, number, number] = [
        s * (0.285 + q.len * 0.50),
        0.82 + q.y + (i - 1) * 0.02,
        0.43 + q.z + 0.025,
      ];

      const filament = catmull([root, mid, tip]);
      b.sweep(filament, [q.r, 0.006], {
        color: i === 1 ? GILL_LIGHT : GILL,
        section: { ngon: 6 },
        caps: "point",
        name: `gillFilament${s > 0 ? "L" : "R"}${i}`,
        group: "gills",
      });

      // Side barbs make the gills visibly frilly rather than merely tentacles.
      for (let k = 0; k < 3; k++) {
        const t = 0.25 + k * 0.25;
        const p = filament.at(t);
        const barb: [number, number, number] = [
          p.x + s * 0.055,
          p.y + (k % 2 === 0 ? 0.045 : -0.04),
          p.z + 0.025,
        ];
        b.spike(p, barb, null, 0.014, {
          color: GILL_LIGHT,
          name: "gillFrill",
          group: "gills",
        });
      }
    }
  }

  // A few pale belly spots and decorative fin rays along the tail.
  const bodySurface = b.surface(spine);
  for (const h of bodySurface.scatter(14, {
    rng: rng(22),
    minDist: 0.075,
    filter: (hit) => hit.n.y < -0.05,
  })) {
    b.stick(new THREE.SphereGeometry(0.018, 6, 4), "#fff0ee", h, {
      embed: 0.45,
      name: "bellySpot",
      group: "markings",
    });
  }

  for (let i = 0; i < 7; i++) {
    const t = 0.16 + i * 0.105;
    const p = tail.at(t);
    const finTip: [number, number, number] = [
      p.at.x,
      p.at.y + 0.08 * Math.sin(t * Math.PI),
      p.at.z,
    ];
    b.spike(p, [0, 1, 0], 0.07 * Math.sin(t * Math.PI), 0.018, {
      color: BELLY,
      name: "tailFinRay",
      group: "tail",
    });
  }

  // Give the otherwise static head a small soft cheek decal-like accent.
  const blushTexture = animeEye({ iris: "#ef79a4", brow: false, blush: false, size: 128 });
  // Tiny transparent-friendly cards are kept behind the eyes as graphic accents.
  b.part(new THREE.PlaneGeometry(0.045, 0.025), "#ffffff", {
    bone: head,
    at: [-0.205, 0.735, 0.70],
    dir: [0, 0, 1],
    axis: "z",
    texture: blushTexture,
    name: "cheekGraphicR",
    group: "face",
  });
  b.part(new THREE.PlaneGeometry(0.045, 0.025), "#ffffff", {
    bone: head,
    at: [0.205, 0.735, 0.70],
    dir: [0, 0, 1],
    axis: "z",
    texture: blushTexture,
    mirror: true,
    name: "cheekGraphicL",
    group: "face",
  } as any);

  return b.root;
}
