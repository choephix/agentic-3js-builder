import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  limb,
} from "../../../../src/index";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal low-poly five-headed hydra with crimson scales, bronze horns, open jaws, teeth, heavy limbs, and a crown of necks in a God of War-inspired style.",
};

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const INK = "#160f12";
  const SCALE = "#342329";
  const SCALE_LIT = "#5a3030";
  const SCALE_EDGE = "#8b4a38";
  const BELLY = "#9b6650";
  const HORN = "#c69a62";
  const HORN_DARK = "#70492f";
  const GUM = "#762c32";
  const TONGUE = "#c6534e";
  const EYE = "#ffbd35";
  const PUPIL = "#170c0a";
  const CLAW = "#d0a866";
  const BRONZE = "#8d5b39";
  const BRONZE_HI = "#c18b50";
  const SCAR = "#b33e35";

  const sphere = (r: number, w = 10, h = 7) =>
    new THREE.SphereGeometry(r, w, h);

  const box = (x: number, y: number, z: number) =>
    new THREE.BoxGeometry(x, y, z);

  const cyl = (r: number, h: number, sides = 8) =>
    new THREE.CylinderGeometry(r, r, h, sides);

  const cone = (r: number, h: number, sides = 7) =>
    new THREE.ConeGeometry(r, h, sides);

  const hips = b.joint("hips", {
    at: [0, 0.92, -0.08],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.92, -0.48],
    [0, 0.98, -0.18],
    [0, 1.02, 0.18],
    [0, 1.12, 0.5],
    [0, 1.2, 0.72],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    count: 5,
    names: ["pelvis", "back1", "back2", "shoulders", "chest"],
    role: "spine",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.45],
      [0, 0.72, -0.9],
      [0, 0.48, -1.3],
      [0, 0.3, -1.64],
      [0, 0.2, -1.9],
      [0, 0.18, -2.08],
    ]),
    {
      parent: hips,
      count: 6,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      role: "tail",
    },
  );

  const legData = [
    { side: "L", x: 0.43, z: 0.38, front: true },
    { side: "R", x: -0.43, z: 0.38, front: true },
    { side: "L", x: 0.42, z: -0.28, front: false },
    { side: "R", x: -0.42, z: -0.28, front: false },
  ] as const;

  const legs: { side: string; chain: any; pts: THREE.Vector3[] }[] = [];
  for (const leg of legData) {
    const target: [number, number, number] = [
      leg.x * 1.06,
      0.18,
      leg.z + (leg.front ? 0.08 : -0.08),
    ];
    const root: [number, number, number] = [
      leg.x * 0.82,
      0.98,
      leg.z,
    ];
    const pts = limb(
      root,
      target,
      leg.front ? [0.34, 0.34, 0.28] : [0.38, 0.34, 0.27],
      [
        [0, 0, leg.front ? 1 : -1],
        [0, 0, leg.front ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(`leg${leg.side}${leg.front ? "F" : "H"}`, pts, {
      parent: hips,
      names: [
        `hip${leg.side}${leg.front ? "F" : "H"}`,
        `knee${leg.side}${leg.front ? "F" : "H"}`,
        `ankle${leg.side}${leg.front ? "F" : "H"}`,
      ],
      role: "leg",
      contact: target,
    });
    legs.push({ side: leg.side, chain, pts });
  }

  const neckSpecs = [
    { id: "L1", x: 0.7, baseY: 1.16, top: [0.92, 2.25, 0.62] as [number, number, number], outward: 0.26 },
    { id: "L2", x: 0.34, baseY: 1.27, top: [0.46, 2.48, 0.78] as [number, number, number], outward: 0.13 },
    { id: "C", x: 0, baseY: 1.3, top: [0, 2.72, 0.82] as [number, number, number], outward: 0 },
    { id: "R2", x: -0.34, baseY: 1.27, top: [-0.46, 2.48, 0.78] as [number, number, number], outward: -0.13 },
    { id: "R1", x: -0.7, baseY: 1.16, top: [-0.92, 2.25, 0.62] as [number, number, number], outward: -0.26 },
  ];

  const necks: {
    id: string;
    chain: any;
    head: any;
    jaw: any;
    top: [number, number, number];
  }[] = [];

  for (const n of neckSpecs) {
    const start: [number, number, number] = [n.x, n.baseY, 0.45];
    const path = catmull([
      start,
      [n.x * 1.04, n.baseY + 0.28, 0.51],
      [n.top[0] * 0.92, n.top[1] - 0.35, 0.58],
      n.top,
    ]);
    const neck = b.chain(`neck${n.id}`, path, {
      parent: spine.joints[spine.joints.length - 1],
      count: 4,
      names: [`neck${n.id}Base`, `neck${n.id}Mid`, `neck${n.id}Rise`, `neck${n.id}Tip`],
      role: "neck",
    });

    const head = b.joint(`head${n.id}`, {
      parent: neck.joints[neck.joints.length - 1],
      at: n.top,
      dir: [n.outward, 0.08, 1],
      role: "head",
      group: "heads",
    });

    const jaw = b.joint(`jaw${n.id}`, {
      parent: head,
      at: head.local({ forward: 0.18, down: 0.055 }),
      aim: head.local({ forward: 0.55, down: 0.2 }),
      role: "jaw",
      group: "jaws",
    });

    necks.push({ id: n.id, chain: neck, head, jaw, top: n.top });
  }

  // Main anatomy.
  b.sweep(spine, (t) => 0.29 - 0.035 * t, {
    color: SCALE,
    section: "box",
    sides: 8,
    bands: [[0.48, SCALE_LIT], [0.82, SCALE]],
  });

  b.sweep(tail, (t) => 0.19 * (1 - t) + 0.025, {
    color: SCALE,
    section: "box",
    sides: 7,
    bands: [[0.72, SCALE_EDGE], [0.9, HORN_DARK], [1, HORN]],
  });

  for (const leg of legs) {
    b.sweep(leg.chain, [0.14, 0.105], {
      color: SCALE,
      section: "box",
      sides: 7,
    });
  }

  for (const n of necks) {
    b.sweep(n.chain, (t) => 0.18 - 0.045 * t, {
      color: SCALE_LIT,
      section: "box",
      sides: 8,
      bands: [[0.35, SCALE], [0.72, SCALE_LIT]],
    });

    const h = n.head;
    b.part(sphere(0.27, 10, 7), SCALE_LIT, {
      bone: h,
      at: h.at,
      scale: [1.05, 0.96, 1.12],
      name: `skull${n.id}`,
      group: "heads",
    });

    b.part(sphere(0.17, 9, 6), BELLY, {
      bone: h,
      at: h.local({ forward: 0.19, down: 0.02 }),
      scale: [1.0, 0.72, 1.2],
      name: `muzzle${n.id}`,
      group: "heads",
    });

    // Brow ridges.
    for (const s of [-1, 1]) {
      b.part(box(0.16, 0.055, 0.09), BRONZE, {
        bone: h,
        at: h.local([s * 0.12, 0.1, 0.1]),
        rotation: [s * -12, 0, s * 10],
        name: `brow${n.id}${s}`,
      });

      b.part(sphere(0.045, 7, 5), EYE, {
        bone: h,
        at: h.local([s * 0.115, 0.15, 0.115]),
        name: `eye${n.id}${s}`,
      });

      b.part(sphere(0.018, 6, 4), PUPIL, {
        bone: h,
        at: h.local([s * 0.115, 0.184, 0.13]),
        name: `pupil${n.id}${s}`,
      });
    }

    // Upper snout and dark mouth seam.
    b.sweep(
      catmull([
        h.local({ forward: 0.12, down: 0.02 }),
        h.local({ forward: 0.34, down: 0.015 }),
        h.local({ forward: 0.54, down: 0.015 }),
      ]),
      [0.15, 0.08],
      { bone: h, color: BELLY, section: "box", caps: "round" },
    );

    b.sweep(
      catmull([
        h.local({ forward: 0.13, down: 0.08 }),
        h.local({ forward: 0.38, down: 0.12 }),
        h.local({ forward: 0.55, down: 0.14 }),
      ]),
      [0.075, 0.025],
      { bone: h, color: INK, section: "box", caps: "flat" },
    );

    // Lower jaw is a separate animated chain/bone.
    b.sweep(
      catmull([
        n.jaw.at,
        h.local({ forward: 0.36, down: 0.19 }),
        h.local({ forward: 0.57, down: 0.16 }),
      ]),
      [0.1, 0.025],
      { bone: n.jaw, color: GUM, section: "box", caps: "round" },
    );

    b.part(sphere(0.075, 8, 5), TONGUE, {
      bone: n.jaw,
      at: h.local({ forward: 0.34, down: 0.16 }),
      scale: [0.7, 0.35, 1.7],
      name: `tongue${n.id}`,
    });

    // Crown horns and cheek spikes.
    const hornBases = [
      h.local({ left: 0.18, up: 0.2, back: 0.02 }),
      h.local({ right: 0.18, up: 0.2, back: 0.02 }),
      h.local({ left: 0.08, up: 0.25, back: 0.09 }),
      h.local({ right: 0.08, up: 0.25, back: 0.09 }),
    ];
    for (let i = 0; i < hornBases.length; i++) {
      const p = hornBases[i];
      const side = i % 2 === 0 ? 1 : -1;
      b.spike(
        p,
        [side * 0.38, 0.62, -0.12],
        0.25,
        0.075,
        { color: HORN, bone: h, name: `horn${n.id}${i}` },
      );
    }

    // Side frills.
    for (const s of [-1, 1]) {
      b.extrude(
        [
          [0, 0],
          [0.11, 0.08],
          [0.17, 0.28],
          [0.06, 0.22],
          [0.02, 0.08],
        ],
        {
          at: h.local([s * 0.22, 0.03, -0.03]),
          x: [s, 0, 0],
          thickness: 0.035,
          color: BRONZE,
          bone: h,
          name: `cheekFrill${n.id}${s}`,
        },
      );
    }

    // Teeth along both sides of the open mouth.
    for (const s of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const p = h.local({
          left: s * (0.045 + i * 0.037),
          forward: 0.24 + i * 0.075,
          down: 0.105,
        });
        b.spike(p, [0, -1, 0.03], 0.095 - i * 0.008, 0.024, {
          color: CLAW,
          bone: h,
          name: `upperTooth${n.id}${s}${i}`,
        });

        const q = h.local({
          left: s * (0.045 + i * 0.037),
          forward: 0.25 + i * 0.075,
          down: 0.18,
        });
        b.spike(q, [0, 1, 0.02], 0.075 - i * 0.006, 0.021, {
          color: CLAW,
          bone: n.jaw,
          name: `lowerTooth${n.id}${s}${i}`,
        });
      }
    }
  }

  // Shoulder armor-like plates and ribs.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const p: [number, number, number] = [s * (0.18 + i * 0.085), 1.15 + i * 0.015, 0.38 + i * 0.07];
      b.part(cone(0.13 - i * 0.014, 0.12, 6), BRONZE, {
        at: p,
        dir: [s * 0.25, 0.15, 1],
        axis: "y",
        bone: spine.joints[Math.min(i + 1, spine.joints.length - 1)],
        name: `shoulderPlate${s}${i}`,
      });
    }
  }

  // Belly plates, broad and readable.
  for (let i = 0; i < 7; i++) {
    const z = 0.48 - i * 0.16;
    b.part(box(0.34 - i * 0.012, 0.045, 0.16), BELLY, {
      at: [0, 0.84 - Math.abs(z - 0.1) * 0.08, z],
      rotation: [i % 2 ? -8 : 8, 0, 0],
      bone: spine.joints[Math.min(4, Math.floor(i / 2))],
      name: `bellyPlate${i}`,
    });
  }

  // Hooves and hooked claws.
  for (const leg of legs) {
    const end = leg.pts[leg.pts.length - 1];
    b.part(box(0.18, 0.12, 0.25), HORN_DARK, {
      at: [end.x, 0.19, end.z + 0.045],
      bone: leg.chain.joints[leg.chain.joints.length - 1],
      name: `hoof${leg.side}${end.z > 0 ? "F" : "H"}`,
    });
    for (const s of [-1, 1]) {
      b.spike(
        [end.x + s * 0.045, 0.16, end.z + 0.13],
        [s * 0.16, -0.03, 0.25],
        0.14,
        0.026,
        { color: CLAW, bone: leg.chain.tip, name: `claw${leg.side}${s}` },
      );
    }
  }

  // Dorsal spines along the back and tail.
  for (let i = 0; i < 11; i++) {
    const z = 0.72 - i * 0.22;
    const y = z > -0.3 ? 1.29 : 0.7 - (z + 0.3) * 0.18;
    const height = z > 0.35 ? 0.16 : 0.12;
    b.spike(
      [0, y, z],
      [0, height, -0.1],
      height,
      0.055,
      {
        color: HORN,
        bone:
          z > 0.35
            ? spine.joints[spine.joints.length - 1]
            : tail.nearestJoint([0, y, z]),
        name: `backSpine${i}`,
      },
    );
  }

  // Surface-mounted scale studs give the torso a layered monster hide.
  const bodySurface = b.surface([b.root]);
  const scaleHits = bodySurface.scatter(42, {
    rng: rng(23),
    minDist: 0.09,
    filter: (hit: any) =>
      hit.at.y > 0.42 && hit.at.y < 1.35 && hit.at.z > -1.25,
  });

  for (let i = 0; i < scaleHits.length; i++) {
    const hit = scaleHits[i];
    b.stick(
      new THREE.ConeGeometry(0.055, 0.045, 6),
      i % 3 === 0 ? SCALE_EDGE : SCALE_LIT,
      hit,
      {
        embed: 0.48,
        name: `scale${i}`,
        spin: (i * 47) % 360,
      },
    );
  }

  // Torn battle scars across the central chest.
  for (let i = 0; i < 4; i++) {
    b.part(box(0.018, 0.12 + i * 0.025, 0.012), SCAR, {
      at: [-0.12 + i * 0.08, 1.12 - i * 0.015, 0.78],
      rotation: [0, i * 8 - 12, -18 + i * 7],
      bone: spine.tip,
      name: `scar${i}`,
    });
  }

  // Open the jaws into an aggressive resting pose.
  for (const n of necks) {
    b.pose(n.jaw, {
      axis: [1, 0, 0],
      deg: -18,
    });
  }

  return b.root;
}
