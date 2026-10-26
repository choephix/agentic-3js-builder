import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  limb,
  rng,
  paint,
  spots,
  countershade,
  svg,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal, low-poly God of War-inspired five-headed hydra with armored scales, snarling jaws, horns, claws, muscular legs, and a heavy spined tail.",
};

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const SCALE = "#6f1718";
  const SCALE_DARK = "#351016";
  const BELLY = "#b87545";
  const HORN = "#d8b27a";
  const CLAW = "#19151b";
  const MOUTH = "#4d1018";
  const TONGUE = "#d94b58";
  const EYE_GLOW = animeEye({
    iris: "#ffd32f",
    irisLight: "#fff4a0",
    irisDark: "#9b2414",
    ink: "#160b10",
    blush: false,
    brow: true,
    size: 256,
  });

  const COAT = furEdge(
    cel(SCALE, "#3b1017"),
    cel(BELLY, "#7c392e"),
    {
      level: -0.18,
      teeth: 0.24,
      period: 0.16,
      along: [0, 0, 1],
      ink: "#240d12",
      inkWidth: 0.025,
    },
  );

  const ARMOR = spots(COAT, ["#8f2720", "#52141a", "#c44d2e"], {
    size: 0.28,
    amount: 0.62,
    rosette: true,
    seed: 19,
  });

  const headPaint = countershade(
    cel("#85211c", "#3d1118"),
    cel("#d28a56", "#71342c"),
    { level: -0.05, soft: 0.28 },
  );

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: a single root, a massive torso chain, four planted legs, one tail, five necks and jaws.

  const hips = b.joint("hips", {
    at: [0, 0.92, -0.1],
    dir: [0, 0.2, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.98, -0.72],
    [0, 1.08, -0.32],
    [0, 1.12, 0.14],
    [0, 1.2, 0.52],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["pelvis", "spineMid", "shoulder"],
    role: "spine",
  });
  const torso = b.sweep(spine, (t) => 0.36 + 0.12 * Math.sin(Math.PI * t), {
    color: ARMOR,
    section: "box",
    sides: 8,
  });

  const legTargets: [number, number, number][] = [
    [0.42, 0.18, 0.34],
    [-0.42, 0.18, 0.34],
    [0.46, 0.18, -0.52],
    [-0.46, 0.18, -0.52],
  ];
  const legRoots: [number, number, number][] = [
    [0.29, 1.03, 0.4],
    [-0.29, 1.03, 0.4],
    [0.3, 0.96, -0.42],
    [-0.3, 0.96, -0.42],
  ];
  const legNames = [
    ["legFL", "kneeFL", "ankleFL", "pawFL"],
    ["legFR", "kneeFR", "ankleFR", "pawFR"],
    ["legHL", "kneeHL", "ankleHL", "pawHL"],
    ["legHR", "kneeHR", "ankleHR", "pawHR"],
  ];

  const legs: any[] = [];
  legTargets.forEach((target, i) => {
    const side = target[0] > 0 ? 1 : -1;
    const rear = target[2] < 0;
    const points = limb(
      legRoots[i],
      target,
      rear ? [0.32, 0.34, 0.28] : [0.3, 0.34, 0.28],
      [
        [0, 0, rear ? -1 : 1],
        [0, 0, rear ? 1 : -1],
      ],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(legNames[i][0], points, {
      parent: spine.joints[rear ? 0 : 2],
      names: legNames[i],
      role: "leg",
      contact: target,
    });
    const tube = b.sweep(chain, (t) => 0.105 - t * 0.045, {
      color: ARMOR,
      section: "box",
      skin: "smooth",
    });
    legs.push({ chain, tube, side });
  });

  const tailPath = catmull([
    [0, 0.9, -0.7],
    [0, 0.72, -1.18],
    [0.03, 0.62, -1.62],
    [0.12, 0.68, -2.02],
    [0.27, 0.83, -2.35],
    [0.44, 1.02, -2.57],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });
  const tailTube = b.sweep(tail, (t) => 0.22 * (1 - t) + 0.035, {
    color: ARMOR,
    section: "box",
    caps: "round",
  });

  const neckSpecs = [
    { x: -0.46, z: 0.46, lean: [-0.42, 0.3, 0.25], name: "neckL2" },
    { x: -0.23, z: 0.59, lean: [-0.2, 0.55, 0.22], name: "neckL1" },
    { x: 0, z: 0.65, lean: [0, 0.7, 0.28], name: "neckC" },
    { x: 0.23, z: 0.59, lean: [0.2, 0.55, 0.22], name: "neckR1" },
    { x: 0.46, z: 0.46, lean: [0.42, 0.3, 0.25], name: "neckR2" },
  ];

  const necks: any[] = [];
  neckSpecs.forEach((spec, i) => {
    const base: [number, number, number] = [spec.x, 1.22, spec.z];
    const mid: [number, number, number] = [
      spec.x + spec.lean[0] * 0.25,
      1.65,
      spec.z + spec.lean[2] * 0.2,
    ];
    const crown: [number, number, number] = [
      spec.x + spec.lean[0],
      2.13 + (i === 2 ? 0.1 : 0),
      spec.z + spec.lean[2] + spec.lean[1],
    ];
    const path = catmull([base, mid, crown]);
    const neck = b.chain(spec.name, path, {
      parent: spine.joints[2],
      names: [`${spec.name}Base`, `${spec.name}Mid`, `${spec.name}Tip`],
      role: "neck",
    });
    const tube = b.sweep(neck, (t) => 0.18 - 0.045 * t, {
      color: ARMOR,
      section: "box",
      caps: "round",
    });

    const neckTip = neck.joints[neck.joints.length - 1];
    const head = b.joint(`head${i + 1}`, {
      parent: neckTip,
      at: neckTip.at,
      dir: [spec.lean[0] * 0.25, 0.05, 1],
      role: "head",
      group: "heads",
    });

    const jaw = b.joint(`jaw${i + 1}`, {
      parent: head,
      at: head.local({ forward: 0.08, down: 0.1 }),
      dir: [spec.lean[0] * 0.1, -0.14, 1],
      role: "jaw",
      group: "jaws",
    });

    necks.push({ neck, tube, head, jaw, spec });
  });

  // ------------------------------------------------------------------------------------------------
  // Torso armor and limbs.

  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    ARMOR,
    {
      bone: hips,
      at: [0, 1.05, -0.08],
      scale: [0.55, 0.4, 0.8],
      name: "shoulderMass",
      group: "body",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 10, 6),
    BELLY,
    {
      bone: hips,
      at: [0, 0.98, 0.18],
      scale: [0.39, 0.28, 0.52],
      name: "bellyPlate",
      group: "body",
    },
  );

  for (const leg of legs) {
    const tip = leg.chain.tip;
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      ARMOR,
      {
        bone: tip,
        at: tip.at,
        scale: [0.14, 0.1, 0.19],
        name: "clawedPaw",
        group: "limbs",
      },
    );
    for (const s of [-1, 0, 1]) {
      const toeBase = tip.local([s * 0.055, -0.015, 0.13]);
      const toeTip = tip.local([s * 0.07, -0.035, 0.28]);
      b.spike(toeBase, toeTip, null, 0.026, {
        color: CLAW,
        caps: "point",
        name: "toeClaw",
        group: "claws",
      });
    }
    b.sweep(
      catmull([
        tip.local([-0.11, 0.05, 0.03]),
        tip.local([-0.12, 0.12, 0.02]),
        tip.local([-0.1, 0.2, 0]),
      ]),
      0.035,
      { color: HORN, caps: "point", name: "ankleSpike" },
    );
  }

  // Large dorsal spines over the back.
  b.along(spine, 7, (at: any) =>
    b.spike(at, at, 0.17 + 0.08 * Math.sin(at.t * Math.PI), 0.055, {
      color: HORN,
      group: "dorsalSpines",
      name: "backSpine",
    }),
  );

  // Tail spikes and a blade-like terminal barb.
  b.along(tailTube, 9, (at: any) =>
    b.spike(at, at, 0.13 * (1 - at.t) + 0.045, 0.034, {
      color: HORN,
      group: "tailSpines",
      name: "tailSpike",
    }),
  );
  b.spike(tail.at(1), tail.at(1), 0.42, 0.09, {
    color: HORN,
    group: "tail",
    name: "tailBarb",
  });

  // ------------------------------------------------------------------------------------------------
  // Five heads: skull, cheek plates, muzzle, separate upper/lower jaws, teeth, horns, ears and eyes.

  const tooth = (jaw: any, x: number, forward: number, y: number, length: number) => {
    const base = jaw.local([x, forward, y]);
    b.spike(base, [0, -1, 0], length, 0.018, {
      color: "#f4dfb0",
      group: "teeth",
      name: "fang",
    });
  };

  necks.forEach(({ head, jaw, tube, spec }, i) => {
    const skull = b.part(
      new THREE.SphereGeometry(1, 12, 8),
      headPaint,
      {
        bone: head,
        at: head.at,
        scale: [0.25, 0.27, 0.32],
        name: `skull${i + 1}`,
        group: "heads",
      },
    );

    const brow = b.part(
      new THREE.SphereGeometry(1, 8, 5),
      ARMOR,
      {
        bone: head,
        at: head.local({ forward: 0.08, up: 0.17 }),
        scale: [0.25, 0.13, 0.2],
        name: "browRidge",
        group: "faceArmor",
      },
    );

    const muzzle = b.part(
      new THREE.SphereGeometry(1, 10, 6),
      furEdge(BELLY, "#54201f", {
        level: 0.04,
        teeth: 0.09,
        period: 0.04,
        axis: [0, 0, 1],
        by: "position",
        along: [1, 0, 0],
      }),
      {
        bone: head,
        at: head.local({ forward: 0.28, down: 0.02 }),
        scale: [0.19, 0.15, 0.22],
        name: "muzzle",
        group: "face",
      },
    );

    const upperJaw = b.part(
      new THREE.BoxGeometry(0.34, 0.13, 0.3),
      MOUTH,
      {
        bone: head,
        at: head.local({ forward: 0.32, down: 0.1 }),
        name: "upperJaw",
        group: "jaw",
      },
    );

    const lowerJaw = b.part(
      new THREE.BoxGeometry(0.31, 0.11, 0.27),
      MOUTH,
      {
        bone: jaw,
        at: jaw.local({ forward: 0.17, down: 0.04 }),
        name: "lowerJaw",
        group: "jaw",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.25, 0.045, 0.2),
      TONGUE,
      {
        bone: jaw,
        at: jaw.local({ forward: 0.19, down: 0.018 }),
        name: "tongue",
        group: "mouth",
      },
    );

    // Eyes are conformed to the skull after the skull is built.
    const faceSurface = b.surface(skull);
    for (const side of [-1, 1]) {
      const hit = faceSurface.around(head.at).at(side * 38, 8);
      if (hit) {
        b.decal(faceSurface, EYE_GLOW, {
          at: hit,
          size: [0.095, 0.13],
          segments: 6,
          lift: 0.006,
          mirror: side > 0,
          name: "glowingEye",
          group: "eyes",
        });
      }

      // Heavy temple horns.
      const hornBase = head.local({
        left: side * 0.16,
        up: 0.16,
        forward: 0.03,
      });
      const hornMid = head.local({
        left: side * 0.26,
        up: 0.3,
        forward: -0.02,
      });
      const hornTip = head.local({
        left: side * 0.34,
        up: 0.45,
        forward: -0.06,
      });
      b.sweep(catmull([hornBase, hornMid, hornTip]), [0.07, 0.008], {
        color: HORN,
        caps: { start: "round", end: "point" },
        name: "curvedHorn",
        group: "horns",
      });

      // Small backward-facing cheek horns.
      b.spike(
        head.local({ left: side * 0.21, up: 0.04, back: 0.12 }),
        [side * 0.45, 0.2, -0.25],
        0.19,
        0.035,
        { color: HORN, group: "horns", name: "cheekHorn" },
      );
    }

    // Teeth on both jaws, intentionally oversized and readable.
    for (const x of [-0.12, 0, 0.12]) {
      tooth(head, x, 0.39, -0.12, 0.105);
      tooth(jaw, x, 0.19, 0.015, 0.08);
    }

    // A forked tongue.
    const tongueRoot = jaw.local({ forward: 0.29, down: 0.01 });
    b.sweep(
      catmull([
        tongueRoot,
        jaw.local({ forward: 0.42, down: 0.015 }),
        jaw.local({ forward: 0.56, left: 0.035, down: 0.005 }),
      ]),
      [0.025, 0.006],
      { color: TONGUE, caps: { start: "round", end: "point" }, name: "tongueForkL" },
    );
    b.sweep(
      catmull([
        tongueRoot,
        jaw.local({ forward: 0.42, down: 0.015 }),
        jaw.local({ forward: 0.56, right: 0.035, down: 0.005 }),
      ]),
      [0.025, 0.006],
      { color: TONGUE, caps: { start: "round", end: "point" }, name: "tongueForkR" },
    );

    // Neck mane: broad triangular plates marching from shoulder to skull.
    const maneTex = svg(
      `<svg viewBox="0 0 32 64">
        <path d="M2 62 L14 4 L21 23 L28 3 L30 62 Z" fill="#e5ad62"/>
        <path d="M5 62 L14 12 L17 62 M20 62 L28 12 L27 62" stroke="#7f281d" stroke-width="3" fill="none"/>
      </svg>`,
      { size: 96 },
    );
    const maneHits = b.surface(tube).scatter(13, {
      rng: rng(300 + i),
      minDist: 0.055,
      filter: (h: any) => h.n.y > -0.2 && h.at.y > 1.28,
    });
    b.cards(maneHits, maneTex, {
      size: [0.11, 0.28],
      lean: 38,
      bend: 12,
      vary: 0.22,
      color: "#7d211d",
      group: "neckMane",
    });

    // Hinged jaw pose: every mouth is visibly open.
    b.pose(jaw, { axis: [1, 0, 0], deg: -18 });
  });

  // ------------------------------------------------------------------------------------------------
  // Scales and ritual scars: broad, blocky plates rather than a smooth skin.

  const torsoSurface = b.surface([torso, tailTube]);
  const plateHits = torsoSurface.scatter(44, {
    rng: rng(811),
    minDist: 0.09,
    filter: (h: any) => h.n.y > -0.45,
  });
  for (const hit of plateHits) {
    const r = 0.045 + 0.018 * (hit.at.y > 1.1 ? 1 : 0);
    b.stick(
      new THREE.ConeGeometry(r, r * 0.55, 5),
      hit.at.y < 0.95 ? BELLY : HORN,
      hit,
      {
        embed: 0.48,
        spin: 18,
        group: "individualScales",
        name: "armorScale",
      },
    );
  }

  // Neck rings give each head a ceremonial, war-god silhouette.
  necks.forEach(({ tube }, i) => {
    const centerline = tube.curve();
    const ring = b.surface(tube).loop(centerline.at(0.52), {
      dir: centerline.tangentAt(0.52),
      lift: 0.008,
    });
    b.sweep(ring, 0.026, {
      color: i === 2 ? HORN : "#3a1118",
      name: "neckWarBand",
      group: "ornament",
    });
    b.along(ring, 7, (at: any) =>
      b.part(new THREE.SphereGeometry(0.022, 6, 4), HORN, {
        at,
        group: "rivets",
        name: "bandRivet",
      }),
    );
  });

  // Scar-like dark ridges along the central skulls.
  necks.forEach(({ head }, i) => {
    b.sweep(
      catmull([
        head.local({ back: 0.2, up: 0.18 }),
        head.local({ forward: 0.02, up: 0.24 }),
        head.local({ forward: 0.23, up: 0.17 }),
      ]),
      0.018,
      {
        color: SCALE_DARK,
        caps: "round",
        name: "facialScar",
        group: "scars",
      },
    );
    if (i === 2) {
      b.spike(head.local({ forward: 0.02, up: 0.25 }), [0, 1, 0.2], 0.22, 0.045, {
        color: HORN,
        name: "crownSpike",
        group: "crown",
      });
    }
  });

  // A few broad shoulder blades make the silhouette feel armored and game-boss-like.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.18, 0.04, "sharp"],
        [0.27, 0.22, "sharp"],
        [0.12, 0.36, "sharp"],
        [0.02, 0.22, "sharp"],
      ],
      {
        at: spine.at(0.72).local({ left: side * 0.3, up: -0.02, back: 0.02 }),
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        color: HORN,
        bone: spine.joints[2],
        name: "shoulderBlade",
        group: "armorPlates",
      },
    );
  }

  // Open jaw hinge rods and small metal-like bone studs.
  necks.forEach(({ head, jaw }) => {
    b.rod(
      head.local({ left: -0.18, down: 0.08, forward: 0.15 }),
      jaw.local({ left: -0.18, up: 0.03, forward: 0.12 }),
      0.018,
      { color: HORN, name: "jawHinge", group: "jawMechanism" },
    );
    b.rod(
      head.local({ left: 0.18, down: 0.08, forward: 0.15 }),
      jaw.local({ left: 0.18, up: 0.03, forward: 0.12 }),
      0.018,
      { color: HORN, name: "jawHinge", group: "jawMechanism" },
    );
  });

  return b.root;
}
