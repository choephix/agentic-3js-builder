import * as THREE from "three";
import { createBuilder, rng, catmull, limb } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Five-Headed Hydra",
  description: "A brutal, low-poly God of War-inspired five-headed hydra with armored scales, horned skulls, glowing red eyes, open jaws, heavy limbs, and a barbed tail.",
};

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const COAT = cel(furEdge("#4c5a38", "#1c211a", {
    level: -0.16,
    teeth: 0.18,
    period: 0.08,
    ink: "#17130f",
    inkWidth: 0.025,
  }));
  const DARK_COAT = cel("#24291d", "#0d100d");
  const BELLY = cel("#8b8060", "#3e3829");
  const HORN = cel("#c5b48b", "#5a4c39");
  const BONE = cel("#e7d7ad", "#746247");
  const SCAR = "#8f3027";
  const BLOOD = "#b51f26";
  const EYE = "#ff3b25";
  const EYE_GLOW = "#ffb13b";
  const METAL = "#332c25";
  const BRASS = "#9e762d";
  const CLAW = "#d9c49a";

  const grey = (r: number, g: number, b0: number, rough = 0.78) => {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(r, g, b0),
      roughness: rough,
      metalness: 0.03,
    });
    return m;
  };

  // ---------------------------------------------------------------------------
  // Skeleton first: one broad spine, five neck chains, four legs, and tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.82, -0.12],
    dir: [0, 0.05, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [-0.02, 0.82, -0.95],
    [0, 0.91, -0.48],
    [0, 0.88, 0],
    [0, 0.94, 0.42],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineRear", "spineMid", "spineFront"],
    role: "spine",
  });

  const neckSpecs = [
    { n: "neckL", x: 0.42, z: 0.30, tip: [0.67, 1.82, 0.73], dir: [0.10, 0.22, 0.98] },
    { n: "neckR", x: -0.42, z: 0.30, tip: [-0.67, 1.82, 0.73], dir: [-0.10, 0.22, 0.98] },
    { n: "neckC", x: 0, z: 0.38, tip: [0, 2.08, 0.76], dir: [0, 0.20, 1] },
    { n: "neckFL", x: 0.20, z: 0.18, tip: [0.30, 1.68, 1.04], dir: [0.13, 0.12, 0.99] },
    { n: "neckFR", x: -0.20, z: 0.18, tip: [-0.30, 1.68, 1.04], dir: [-0.13, 0.12, 0.99] },
  ];

  const necks: { chain: any; head: any; jaw: any; spec: typeof neckSpecs[number] }[] = [];

  for (const s of neckSpecs) {
    const base: [number, number, number] = [s.x, 0.90, s.z];
    const mid: [number, number, number] = [s.x * 1.08, 1.34, s.z + 0.16];
    const path = catmull([base, mid, s.tip]);
    const chain = b.chain(s.n, path, {
      parent: spine.tip,
      count: 3,
      names: [`${s.n}Base`, `${s.n}Mid`, `${s.n}Top`],
      role: "neck",
    });
    const head = b.joint(`${s.n.replace("neck", "head")}`, {
      parent: chain.tip,
      at: s.tip,
      dir: s.dir,
      role: "head",
      group: "head",
    });
    const jaw = b.joint(`${s.n.replace("neck", "jaw")}`, {
      parent: head,
      at: head.local({ forward: 0.02, down: 0.13 }),
      dir: head.local({ forward: 0.55, down: 0.22 }),
      role: "jaw",
      group: "jaw",
    });
    necks.push({ chain, head, jaw, spec: s });
  }

  const tailPath = catmull([
    [0, 0.78, -0.82],
    [0, 0.68, -1.30],
    [0.05, 0.52, -1.72],
    [0.18, 0.43, -2.08],
    [0.12, 0.50, -2.42],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: spine.joints[0],
    count: 5,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const legTargets = [
    { side: 1, z: 0.35, name: "legFL", x: 0.48 },
    { side: -1, z: 0.35, name: "legFR", x: -0.48 },
    { side: 1, z: -0.56, name: "legHL", x: 0.47 },
    { side: -1, z: -0.56, name: "legHR", x: -0.47 },
  ];

  const legs: any[] = [];
  for (const l of legTargets) {
    const root: [number, number, number] = [l.x, 0.84, l.z];
    const foot: [number, number, number] = [l.x * 1.12, 0.18, l.z + (l.z > 0 ? 0.08 : -0.10)];
    const points = limb(root, foot, [0.34, 0.34, 0.28], [
      [0, 0, l.z > 0 ? 1 : -1],
      [0, 0, l.z > 0 ? -1 : 1],
    ]);
    const leg = b.chain(l.name, points, {
      parent: hips,
      names: [`${l.name}Hip`, `${l.name}Knee`, `${l.name}Ankle`, `${l.name}Foot`],
      role: "leg",
      contact: foot,
    });
    legs.push(leg);
  }

  // ---------------------------------------------------------------------------
  // Main body and armor silhouette.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.43 - 0.08 * t, {
    color: COAT,
    section: { ngon: 8 },
    caps: "round",
    name: "massive-scaled-torso",
    group: "body",
  });

  b.sweep(spinePath, (t) => 0.49 - 0.09 * t, {
    color: DARK_COAT,
    shift: [0, -0.12],
    section: { ngon: 8 },
    caps: "none",
    name: "dark-belly",
    group: "body",
  });

  // Shoulder armor plates and dorsal ridges.
  for (const z of [-0.28, 0.05, 0.38]) {
    b.part(
      new THREE.BoxGeometry(0.78, 0.08, 0.22),
      METAL,
      {
        bone: spine.tip,
        at: [0, 1.13, z],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        name: `shoulder-plate-${z}`,
        group: "armor",
      },
    );
  }

  for (let i = 0; i < 6; i++) {
    const z = 0.34 - i * 0.26;
    b.part(
      new THREE.ConeGeometry(0.11 - i * 0.009, 0.28 - i * 0.018, 6),
      BONE,
      {
        bone: spine.joints[Math.min(spine.joints.length - 1, 2)],
        at: [0, 1.22 - i * 0.025, z],
        dir: [0, 1, 0],
        name: `back-spine-${i}`,
        group: "spines",
      },
    );
  }

  // Side ribs, large overlapping plates.
  for (const side of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = 0.28 - i * 0.22;
      b.part(
        new THREE.BoxGeometry(0.055, 0.25, 0.18),
        i % 2 ? BRASS : METAL,
        {
          bone: spine.joints[Math.min(2, i % spine.joints.length)],
          at: [side * (0.43 + i * 0.012), 0.82, z],
          rotation: [0, side * 0.15, side * 0.18],
          name: `rib-plate-${side}-${i}`,
          group: "armor",
        },
      );
      b.part(
        new THREE.SphereGeometry(0.035, 7, 5),
        BRASS,
        {
          bone: spine.joints[Math.min(2, i % spine.joints.length)],
          at: [side * 0.49, 0.91, z + 0.04],
          name: `rivet-${side}-${i}`,
          group: "armor",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Legs, feet, toes, claws.
  // ---------------------------------------------------------------------------

  for (let li = 0; li < legs.length; li++) {
    const leg = legs[li];
    const side = li % 2 === 0 ? 1 : -1;
    const fore = li < 2;
    b.sweep(leg, (t) => 0.14 - 0.055 * t, {
      color: COAT,
      section: { ngon: 6 },
      skin: "smooth",
      name: `muscular-leg-${li}`,
      group: "limbs",
    });

    const foot = leg.tip;
    b.part(
      new THREE.BoxGeometry(0.24, 0.16, 0.34),
      DARK_COAT,
      {
        bone: foot,
        at: foot.at,
        dir: [0, 0, 1],
        name: `heavy-foot-${li}`,
        group: "limbs",
      },
    );

    for (let toe = -1; toe <= 1; toe++) {
      const p: [number, number, number] = [
        foot.at.x + toe * 0.075,
        0.12,
        foot.at.z + (fore ? 0.20 : -0.20),
      ];
      b.spike(p, [0, -0.08, fore ? 1 : -1], 0.17, 0.045, {
        color: CLAW,
        bone: foot,
        name: `claw-${li}-${toe}`,
        group: "claws",
      });
    }
  }

  // Knee guards.
  for (let i = 0; i < legs.length; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    b.part(
      new THREE.SphereGeometry(0.16, 7, 5),
      METAL,
      {
        bone: legs[i].joints[1],
        at: legs[i].joints[1].at,
        scale: [1.05, 0.75, 0.72],
        name: `iron-knee-${i}`,
        group: "armor",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Five heads: skulls, jaws, muzzles, eyes, horns, teeth, tongues and scars.
  // ---------------------------------------------------------------------------

  const eyeTexture = animeEye({
    iris: EYE,
    irisLight: EYE_GLOW,
    irisDark: "#4d1013",
    ink: INK,
    blush: false,
    brow: true,
    size: 256,
  });

  necks.forEach((n, index) => {
    const head = n.head;
    const jaw = n.jaw;
    const s = n.spec.x === 0 ? 1.08 : 0.94;

    b.part(
      new THREE.SphereGeometry(0.31, 10, 7),
      COAT,
      {
        bone: head,
        at: head.at,
        scale: [s, 1.03, 1.16],
        name: `skull-${index}`,
        group: "heads",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.32 * s, 0.22, 0.38),
      BELLY,
      {
        bone: head,
        at: head.local({ forward: 0.25, down: 0.08 }),
        dir: head.dir([0, 0, 1]),
        name: `muzzle-${index}`,
        group: "heads",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.105, 8, 5),
      "#24171a",
      {
        bone: head,
        at: head.local({ forward: 0.46, down: 0.09 }),
        scale: [1.15, 0.7, 0.65],
        name: `nose-${index}`,
        group: "face",
      },
    );

    // Open lower jaw and red mouth cavity.
    b.part(
      new THREE.BoxGeometry(0.30 * s, 0.12, 0.43),
      DARK_COAT,
      {
        bone: jaw,
        at: jaw.local({ forward: 0.20, down: 0.02 }),
        dir: jaw.dir([0, 0, 1]),
        name: `lower-jaw-${index}`,
        group: "jaw",
      },
    );
    b.part(
      new THREE.BoxGeometry(0.27 * s, 0.018, 0.34),
      BLOOD,
      {
        bone: jaw,
        at: jaw.local({ forward: 0.24, down: 0.075 }),
        dir: jaw.dir([0, 0, 1]),
        name: `mouth-${index}`,
        group: "jaw",
      },
    );

    // Eye decals are mounted to the skull's forward surface.
    for (const side of [1, -1]) {
      const eyeAt = head.local({
        left: side * 0.135 * s,
        up: 0.045,
        forward: 0.245,
      });
      b.decal(head, eyeTexture, {
        at: eyeAt,
        dir: head.dir([0, 0, 1]),
        up: [0, 1, 0],
        size: [0.105, 0.145],
        lift: 0.006,
        mirror: side > 0,
        name: `burning-eye-${index}-${side}`,
        group: "face",
      });
    }

    // Brow ridges.
    for (const side of [1, -1]) {
      b.part(
        new THREE.CapsuleGeometry(0.035, 0.18, 4, 6),
        COAT,
        {
          bone: head,
          at: head.local({ left: side * 0.13 * s, up: 0.13, forward: 0.25 }),
          dir: head.dir([0, 0.25, 1]),
          rotation: [0, 0, side * 0.35],
          name: `brow-${index}-${side}`,
          group: "face",
        },
      );
    }

    // Crown horns, cheek horns, and jaw teeth.
    for (const side of [1, -1]) {
      b.spike(
        head.local({ left: side * 0.18, up: 0.18, back: 0.02 }),
        head.dir([side * 0.28, 0.82, -0.22]),
        0.34,
        0.075,
        { color: HORN, bone: head, name: `crown-horn-${index}-${side}`, group: "horns" },
      );
      b.spike(
        head.local({ left: side * 0.25, up: -0.02, forward: 0.06 }),
        head.dir([side * 0.35, 0.05, 0.85]),
        0.22,
        0.05,
        { color: HORN, bone: head, name: `cheek-horn-${index}-${side}`, group: "horns" },
      );
    }

    for (let tooth = 0; tooth < 5; tooth++) {
      const side = tooth % 2 === 0 ? 1 : -1;
      const x = (Math.floor(tooth / 2) - 1) * 0.085;
      b.spike(
        jaw.local({ left: x, up: 0.055, forward: 0.24 + (tooth % 2) * 0.035 }),
        [0, -1, 0],
        0.10 + (tooth === 2 ? 0.035 : 0),
        0.026,
        { color: BONE, bone: jaw, name: `fang-${index}-${tooth}`, group: "teeth" },
      );
    }

    // Red warpaint scars.
    for (const side of [1, -1]) {
      b.part(
        new THREE.BoxGeometry(0.012, 0.16, 0.028),
        SCAR,
        {
          bone: head,
          at: head.local({ left: side * 0.265, up: 0.02, forward: 0.13 }),
          rotation: [0.25, side * 0.25, side * 0.45],
          name: `warpaint-${index}-${side}`,
          group: "scars",
        },
      );
    }

    // Short dorsal mane plates down each neck.
    b.along(n.chain, 6, (at: any) =>
      b.spike(at, at, 0.12, 0.035, {
        color: BONE,
        name: `neck-spine-${index}`,
        group: "spines",
      }),
    );
  });

  // ---------------------------------------------------------------------------
  // Tail, tail armor, and a dramatic terminal barb.
  // ---------------------------------------------------------------------------

  const tailSweep = b.sweep(tail, (t) => 0.18 * (1 - t) + 0.025, {
    color: COAT,
    section: { ngon: 7 },
    bands: [[0.68, DARK_COAT], [0.88, BONE]],
    name: "barbed-tail",
    group: "tail",
  });

  b.along(tail, 8, (at: any, i: number) =>
    b.spike(at, at, 0.13 - i * 0.008, 0.035, {
      color: BONE,
      name: `tail-barb-${i}`,
      group: "tail",
    }),
  );

  b.spike(
    tail.at(1),
    [0.12, 0.15, -0.12],
    0.48,
    0.09,
    {
      color: HORN,
      bone: tail.tip,
      name: "tail-terminal-stinger",
      group: "tail",
    },
  );

  // A few heavy rivets and scar strips make the silhouette read at a distance.
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(
        new THREE.SphereGeometry(0.026, 6, 4),
        BRASS,
        {
          bone: hips,
          at: [side * 0.44, 1.03, -0.55 + i * 0.24],
          name: `torso-rivet-${side}-${i}`,
          group: "armor",
        },
      );
    }
  }

  return b.root;
}
