```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  limb,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal five-headed hydra built as a low-poly God of War monster: plated serpent body, rooted necks, separate jaws, horns, fangs, red war markings, heavy limbs, and a crown of dorsal spines.",
};

const IRON = "#211d22";
const IRON_HI = "#40383a";
const IRON_DARK = "#120f13";
const SCALE = "#594339";
const SCALE_HI = "#88634b";
const BELLY = "#9a7659";
const BONE = "#d6b58a";
const BONE_DARK = "#7d5b43";
const MOUTH = "#35151b";
const GUM = "#7f2630";
const BLOOD = "#9d1d26";
const WAR_RED = "#b52b27";
const EYE_RED = "#ff3a22";
const EYE_GOLD = "#ffb52e";
const CLAW = "#d6c39e";
const BRONZE = "#9b6b38";
const BRONZE_HI = "#d09b50";
const INK = "#0b090c";

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one rooted spine, tail, four grounded legs, and five necks.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.72, -0.18],
    dir: [0, 0.1, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.69, -0.95],
    [0, 0.72, -0.52],
    [0, 0.76, -0.12],
    [0, 0.82, 0.28],
    [0, 0.88, 0.60],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "chest"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.69, -0.62],
    [0, 0.61, -1.08],
    [0, 0.48, -1.48],
    [0, 0.34, -1.82],
    [0, 0.24, -2.08],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const legTargets: Record<string, [number, number, number]> = {
    legLFront: [0.43, 0.13, 0.42],
    legRFront: [-0.43, 0.13, 0.42],
    legLBack: [0.46, 0.13, -0.55],
    legRBack: [-0.46, 0.13, -0.55],
  };

  const legRoots: Record<string, [number, number, number]> = {
    legLFront: [0.28, 0.67, 0.34],
    legRFront: [-0.28, 0.67, 0.34],
    legLBack: [0.27, 0.65, -0.45],
    legRBack: [-0.27, 0.65, -0.45],
  };

  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const name of Object.keys(legTargets)) {
    const side = name.includes("L") ? "L" : "R";
    const front = name.includes("Front");
    const root = legRoots[name];
    const target = legTargets[name];
    const points = limb(
      root,
      target,
      [0.34, 0.31, 0.24],
      [
        [0, 0, front ? 1 : -1],
        [0, 0, front ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    legs[name] = b.chain(name, points, {
      parent: hips,
      names: [
        `${name}Hip`,
        `${name}Knee`,
        `${name}Ankle`,
        `${name}Foot`,
      ],
      role: "leg",
      contact: target,
    });
  }

  const neckData = [
    {
      id: "L2",
      x: 0.64,
      y: 1.00,
      z: 0.40,
      head: [0.78, 2.08, 0.68] as [number, number, number],
      scale: 0.92,
    },
    {
      id: "L1",
      x: 0.31,
      y: 1.02,
      z: 0.51,
      head: [0.40, 2.24, 0.86] as [number, number, number],
      scale: 0.98,
    },
    {
      id: "C",
      x: 0,
      y: 1.05,
      z: 0.55,
      head: [0, 2.42, 0.98] as [number, number, number],
      scale: 1.08,
    },
    {
      id: "R1",
      x: -0.31,
      y: 1.02,
      z: 0.51,
      head: [-0.40, 2.24, 0.86] as [number, number, number],
      scale: 0.98,
    },
    {
      id: "R2",
      x: -0.64,
      y: 1.00,
      z: 0.40,
      head: [-0.78, 2.08, 0.68] as [number, number, number],
      scale: 0.92,
    },
  ];

  const necks: Record<string, ReturnType<typeof b.chain>> = {};
  const headJoints: Record<string, ReturnType<typeof b.joint>> = {};

  for (const n of neckData) {
    const path = catmull([
      [n.x, n.y, n.z],
      [n.x * 1.05, 1.30, n.z + 0.05],
      [n.head[0] * 0.92, 1.72, n.head[2] - 0.08],
      n.head,
    ]);
    necks[n.id] = b.chain(`neck${n.id}`, path, {
      parent: spine.tip ?? spine.joints[spine.joints.length - 1],
      names: [
        `neck${n.id}Base`,
        `neck${n.id}Mid`,
        `neck${n.id}Rise`,
        `neck${n.id}Tip`,
      ],
      role: "neck",
    });
    const neckTip = necks[n.id].tip ?? necks[n.id].joints[n.necksLength ?? 0];
    headJoints[n.id] = b.joint(`head${n.id}`, {
      parent: neckTip,
      at: n.head,
      dir: [n.head[0] * 0.15, -0.02, 1],
      role: "head",
      group: "heads",
    });
  }

  // ---------------------------------------------------------------------------
  // Main hide: faceted, muscular, with a dark back and a warm plated belly.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.39 - t * 0.07, {
    color: IRON,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    group: "body",
    name: "armoredBody",
    sectors: [
      [-55, 55, IRON_HI],
      [120, 240, BELLY],
    ],
  });

  const tailSweep = b.sweep(tail, (t) => 0.25 * (1 - t) + 0.035, {
    color: SCALE,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    bands: [
      [0.60, IRON],
      [0.82, SCALE_HI],
      [1, BONE_DARK],
    ],
    group: "tail",
    name: "serratedTail",
  });

  // Belly plates as overlapping low-poly slabs.
  for (let i = 0; i < 7; i++) {
    const z = -0.64 + i * 0.20;
    const y = 0.79 + Math.cos((i / 6) * Math.PI) * 0.035;
    b.part(
      new THREE.CylinderGeometry(0.14 - i * 0.007, 0.16 - i * 0.007, 0.035, 6),
      BELLY,
      {
        bone: spine.joints[Math.min(i, spine.joints.length - 1)],
        at: [0, y - 0.30, z],
        dir: [0, 1, 0],
        name: `bellyPlate${i}`,
        group: "belly",
      },
    );
  }

  // Dorsal spines create the unmistakable hydra silhouette.
  for (let i = 0; i < 11; i++) {
    const z = -0.95 + i * 0.16;
    const y = 0.96 + (i > 5 ? (i - 5) * 0.035 : 0);
    const len = i < 3 ? 0.16 : i < 8 ? 0.22 : 0.17;
    b.spike([0, y, z], [0, y + len, z - 0.035], null, 0.075, {
      color: BONE_DARK,
      bone: spine.joints[Math.min(4, Math.floor(i / 2))],
      group: "spines",
      name: `dorsalSpine${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Legs: thick, crooked, clawed supports.
  // ---------------------------------------------------------------------------

  for (const [name, chain] of Object.entries(legs)) {
    const legColor = name.includes("Front") ? IRON_HI : IRON;
    b.sweep(chain, (t) => 0.105 - t * 0.035, {
      color: legColor,
      section: { ngon: 6 },
      caps: "round",
      group: "legs",
      name: name,
    });

    const foot = chain.tip ?? chain.joints[chain.joints.length - 1];
    const footPoint = legTargets[name];
    b.part(
      new THREE.SphereGeometry(0.105, 7, 5),
      IRON_DARK,
      {
        bone: foot,
        at: footPoint,
        scale: [1.15, 0.65, 1.3],
        name: `${name}Paw`,
        group: "legs",
      },
    );

    const s = name.includes("L") ? 1 : -1;
    for (let i = -1; i <= 1; i++) {
      const clawBase: [number, number, number] = [
        footPoint[0] + s * i * 0.045,
        0.105,
        footPoint[2] + 0.06,
      ];
      b.spike(
        clawBase,
        [clawBase[0] + s * i * 0.025, 0.055, clawBase[2] + 0.12],
        null,
        0.018,
        {
          color: CLAW,
          bone: foot,
          group: "claws",
          name: `${name}Claw${i + 2}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Neck armor and throat ridges.
  // ---------------------------------------------------------------------------

  for (const n of neckData) {
    const neck = necks[n.id];
    b.sweep(neck, (t) => 0.19 * (1 - t * 0.28), {
      color: SCALE,
      section: { ngon: 7 },
      caps: "round",
      group: "necks",
      name: `neckTube${n.id}`,
      sectors: [
        [-60, 60, SCALE_HI],
        [120, 240, BELLY],
      ],
    });

    for (let i = 0; i < 4; i++) {
      const at = neck.at(0.15 + i * 0.18);
      b.part(
        new THREE.ConeGeometry(0.105 - i * 0.012, 0.10, 6),
        BRONZE,
        {
          bone: at.bone,
          at: at.at,
          dir: at.normal,
          name: `neckGorget${n.id}${i}`,
          group: "armor",
        },
      );
    }

    // Side fins make each neck read individually instead of merging into a bush.
    const root = neck.at(0.32);
    for (const s of [1, -1]) {
      b.extrude(
        [
          [0, 0],
          [0.18, 0.06],
          [0.12, 0.24],
          [0.02, 0.31],
        ],
        {
          at: root.at,
          x: [s, 0, 0],
          y: [0, 1, 0],
          thickness: 0.025,
          bevel: 0.008,
          color: BONE_DARK,
          bone: root.bone,
          group: "neckFins",
          name: `neckFin${n.id}${s > 0 ? "L" : "R"}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Head construction. Each head has a skull, brow, upper muzzle, separate jaw,
  // eyes, nostrils, horns, cheek blades, and prominent teeth.
  // ---------------------------------------------------------------------------

  const headTexture = undefined;

  function buildHead(
    id: string,
    h: ReturnType<typeof b.joint>,
    size: number,
    index: number,
  ) {
    const headAt = h.at;
    const forward = (d: number) => h.local({ forward: d });
    const local = (p: { left?: number; up?: number; forward?: number }) =>
      h.local(p);

    const skull = b.part(
      new THREE.SphereGeometry(1, 10, 7),
      IRON_HI,
      {
        bone: h,
        at: headAt,
        scale: [0.255 * size, 0.29 * size, 0.31 * size],
        texture: headTexture,
        group: "heads",
        name: `skull${id}`,
      },
    );

    // Heavy brow shelf.
    for (const s of [1, -1]) {
      b.part(
        new THREE.BoxGeometry(0.12 * size, 0.055 * size, 0.18 * size),
        IRON_DARK,
        {
          bone: h,
          at: local({ left: s * 0.105 * size, up: 0.125 * size, forward: 0.175 * size }),
          dir: [0, 0, 1],
          group: "faces",
          name: `brow${id}${s > 0 ? "L" : "R"}`,
        },
      );
    }

    // Upper muzzle and nose bridge.
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      SCALE_HI,
      {
        bone: h,
        at: local({ up: -0.015 * size, forward: 0.235 * size }),
        scale: [0.19 * size, 0.14 * size, 0.20 * size],
        group: "faces",
        name: `muzzle${id}`,
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      IRON_DARK,
      {
        bone: h,
        at: local({ up: -0.005 * size, forward: 0.36 * size }),
        scale: [0.13 * size, 0.10 * size, 0.075 * size],
        group: "faces",
        name: `nose${id}`,
      },
    );

    // Separate jaw joint and lower jaw, deliberately slightly open.
    const jaw = b.joint(`jaw${id}`, {
      parent: h,
      at: h.local({ up: -0.105 * size, forward: 0.18 * size }),
      dir: [0, -0.28, 1],
      role: "jaw",
      group: "jaws",
    });

    b.sweep(
      catmull([
        jaw.at,
        jaw.local({ up: -0.035 * size, forward: 0.12 * size }),
        jaw.local({ up: -0.06 * size, forward: 0.32 * size }),
      ]),
      [0.12 * size, 0.07 * size],
      {
        bone: jaw,
        color: IRON,
        section: { ngon: 6 },
        caps: "round",
        group: "jaws",
        name: `lowerJaw${id}`,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.18 * size, 0.018 * size, 0.14 * size),
      GUM,
      {
        bone: jaw,
        at: jaw.local({ up: 0.005 * size, forward: 0.235 * size }),
        dir: [0, 0, 1],
        group: "mouth",
        name: `gum${id}`,
      },
    );

    // Eyes: black sockets, glowing red irises, tiny gold cores.
    for (const s of [1, -1]) {
      const eyeAt = local({
        left: s * 0.125 * size,
        up: 0.055 * size,
        forward: 0.235 * size,
      });

      b.part(
        new THREE.SphereGeometry(0.058 * size, 8, 6),
        INK,
        {
          bone: h,
          at: eyeAt,
          group: "eyes",
          name: `eyeSocket${id}${s > 0 ? "L" : "R"}`,
        },
      );

      const iris = b.part(
        new THREE.SphereGeometry(0.040 * size, 8, 5),
        EYE_RED,
        {
          bone: h,
          at: local({
            left: s * 0.125 * size,
            up: 0.055 * size,
            forward: 0.282 * size,
          }),
          group: "eyes",
          name: `eye${id}${s > 0 ? "L" : "R"}`,
        },
      );
      glow(iris, 2.2);

      const pupil = b.part(
        new THREE.SphereGeometry(0.017 * size, 6, 4),
        EYE_GOLD,
        {
          bone: h,
          at: local({
            left: s * 0.125 * size,
            up: 0.055 * size,
            forward: 0.318 * size,
          }),
          group: "eyes",
          name: `pupil${id}${s > 0 ? "L" : "R"}`,
        },
      );
      glow(pupil, 3);
    }

    // Nostrils and cheek vents.
    for (const s of [1, -1]) {
      b.part(
        new THREE.SphereGeometry(0.018 * size, 6, 4),
        INK,
        {
          bone: h,
          at: local({
            left: s * 0.055 * size,
            up: 0.02 * size,
            forward: 0.407 * size,
          }),
          group: "faceDetails",
          name: `nostril${id}${s > 0 ? "L" : "R"}`,
        },
      );

      b.spike(
        local({ left: s * 0.19 * size, up: -0.005 * size, forward: 0.14 * size }),
        local({ left: s * 0.31 * size, up: -0.015 * size, forward: 0.16 * size }),
        null,
        0.038 * size,
        {
          color: SCALE_HI,
          bone: h,
          group: "cheeks",
          name: `cheekBlade${id}${s > 0 ? "L" : "R"}`,
        },
      );
    }

    // Horn pair, sweeping outward and backward.
    for (const s of [1, -1]) {
      const hornBase = local({
        left: s * 0.16 * size,
        up: 0.17 * size,
        forward: 0.005,
      });
      const hornTip = local({
        left: s * 0.28 * size,
        up: 0.39 * size,
        forward: -0.12 * size,
      });
      b.spike(hornBase, hornTip, null, 0.055 * size, {
        color: BONE_DARK,
        bone: h,
        group: "horns",
        name: `horn${id}${s > 0 ? "L" : "R"}`,
      });

      const hornRidge = b.rod(
        local({
          left: s * 0.205 * size,
          up: 0.245 * size,
          forward: -0.035 * size,
        }),
        local({
          left: s * 0.255 * size,
          up: 0.35 * size,
          forward: -0.10 * size,
        }),
        0.012 * size,
        {
          color: BONE,
          bone: h,
          group: "horns",
          name: `hornRidge${id}${s > 0 ? "L" : "R"}`,
        },
      );
      void hornRidge;
    }

    // Three teeth per side on both upper and lower jaw.
    for (const s of [1, -1]) {
      for (let i = 0; i < 3; i++) {
        const x = s * (0.055 + i * 0.045) * size;
        const z = (0.235 + i * 0.045) * size;
        b.spike(
          local({ left: x, up: -0.075 * size, forward: z }),
          [0, -1, 0],
          0.105 * size,
          0.021 * size,
          {
            color: CLAW,
            bone: h,
            group: "teeth",
            name: `upperFang${id}${s > 0 ? "L" : "R"}${i}`,
          },
        );

        b.spike(
          jaw.local({ left: x, up: -0.045 * size, forward: z }),
          [0, 1, 0],
          0.072 * size,
          0.016 * size,
          {
            color: BONE,
            bone: jaw,
            group: "teeth",
            name: `lowerFang${id}${s > 0 ? "L" : "R"}${i}`,
          },
        );
      }
    }

    // A red war-paint stripe running from crown toward the nose.
    for (let i = 0; i < 4; i++) {
      b.part(
        new THREE.BoxGeometry(0.028 * size, 0.018 * size, 0.085 * size),
        WAR_RED,
        {
          bone: h,
          at: local({
            left: 0,
            up: 0.18 * size - i * 0.015 * size,
            forward: 0.07 * size + i * 0.065 * size,
          }),
          dir: [0, 0, 1],
          group: "warPaint",
          name: `warStripe${id}${i}`,
        },
      );
    }

    // A compact crown of three backward-facing skull spikes.
    for (let i = 0; i < 3; i++) {
      b.spike(
        local({
          left: (i - 1) * 0.075 * size,
          up: 0.21 * size,
          forward: -0.12 * size,
        }),
        local({
          left: (i - 1) * 0.10 * size,
          up: 0.34 * size,
          forward: -0.27 * size,
        }),
        null,
        0.035 * size,
        {
          color: BONE_DARK,
          bone: h,
          group: "crown",
          name: `crown${id}${i}`,
        },
      );
    }

    // Small bronze cheek studs.
    for (const s of [1, -1]) {
      for (let i = 0; i < 2; i++) {
        b.part(
          new THREE.SphereGeometry(0.022 * size, 6, 4),
          BRONZE_HI,
          {
            bone: h,
            at: local({
              left: s * (0.20 + i * 0.035) * size,
              up: (-0.08 + i * 0.05) * size,
              forward: 0.17 * size,
            }),
            group: "armor",
            name: `cheekStud${id}${s > 0 ? "L" : "R"}${i}`,
          },
        );
      }
    }
  }

  for (let i = 0; i < neckData.length; i++) {
    const n = neckData[i];
    buildHead(n.id, headJoints[n.id], n.scale, i);
  }

  // ---------------------------------------------------------------------------
  // Body scale scatter: a restrained amount of geometric detail, concentrated
  // on the upper silhouette and shoulders.
  // ---------------------------------------------------------------------------

  const bodySurface = b.surface([body, tailSweep]);
  const scaleHits = bodySurface.scatter(42, {
    rng: rng(73),
    minDist: 0.115,
    filter: (hit) => hit.n.y > -0.18 && hit.at.y > 0.55,
  });

  for (let i = 0; i < scaleHits.length; i++) {
    const hit = scaleHits[i];
    const scalePart = b.stick(
      new THREE.ConeGeometry(0.055, 0.035, 5),
      i % 3 === 0 ? SCALE_HI : SCALE,
      hit,
      {
        embed: 0.35,
        spin: (i * 47) % 360,
        group: "scales",
        name: `backScale${i}`,
      },
    );
    void scalePart;
  }

  // Shoulder plates and large bronze studs make the torso feel armored rather
  // than merely serpentine.
  for (const s of [1, -1]) {
    const shoulder = spine.at(0.58);
    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      IRON_HI,
      {
        bone: shoulder.bone,
        at: [s * 0.30, 0.88, 0.27],
        scale: [0.17, 0.13, 0.20],
        group: "shoulders",
        name: `shoulderPad${s > 0 ? "L" : "R"}`,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.035, 7, 5),
      BRONZE_HI,
      {
        bone: shoulder.bone,
        at: [s * 0.36, 0.91, 0.39],
        group: "armor",
        name: `shoulderStud${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Tail barb ring.
  const tailEnd = tail.at(0.72);
  for (const s of [-1, 1]) {
    b.spike(
      tailEnd.at,
      [s * 0.17, 0.02, 0.02],
      0.18,
      0.045,
      {
        color: BONE_DARK,
        bone: tailEnd.bone,
        group: "tail",
        name: `tailBarb${s > 0 ? "L" : "R"}`,
      },
    );
  }

  return b.root;
}
```