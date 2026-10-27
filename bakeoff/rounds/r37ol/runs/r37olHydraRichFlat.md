```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, rng, limb } from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Five-Headed Hydra",
  description: "A brutal, low-poly God of War-inspired five-headed hydra with armored scales, horns, jaws, claws, and a whipping tail.",
};

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const SCALE = "#76362b";
  const SCALE_SHADOW = "#321b20";
  const BELLY = "#c48b55";
  const BELLY_DARK = "#704139";
  const HORN = "#d8b67b";
  const HORN_DARK = "#73533d";
  const CLAW = "#e1c58e";
  const EYE_GOLD = "#ffbd29";
  const MOUTH = "#28151b";
  const GUM = "#933b42";
  const BLOOD = "#7d1725";
  const ARMOR = "#312d35";
  const BRONZE = "#a36c3d";

  const COAT = cel(
    furEdge(SCALE, BELLY, {
      level: -0.16,
      teeth: 0.28,
      period: 0.08,
      ink: SCALE_SHADOW,
      inkWidth: 0.035,
    }),
    SCALE_SHADOW,
  );
  const HEAD_COAT = cel(
    furEdge("#8f4532", "#d49a5c", {
      by: "position",
      axis: [0, 1, 0],
      level: 1.73,
      teeth: 0.045,
      period: 0.07,
      ink: SCALE_SHADOW,
      inkWidth: 0.012,
    }),
    "#3d2024",
  );
  const EYE = animeEye({ iris: EYE_GOLD, ink: "#170f18", blush: false, size: 256 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one heavy root spine, four legs, a tail, and five necks.

  const hips = b.joint("hips", {
    at: [0, 0.86, -0.18],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.86, -0.72],
    [0, 0.92, -0.36],
    [0, 0.98, 0.08],
    [0, 1.04, 0.43],
    [0, 1.1, 0.7],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "shoulders"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.83, -0.68],
    [0, 0.7, -1.12],
    [0, 0.58, -1.55],
    [0.08, 0.48, -1.93],
    [0.2, 0.43, -2.24],
    [0.34, 0.52, -2.47],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const legData = [
    { side: 1, z: -0.42, name: "legL", foot: [0.42, 0.1, -0.55] as [number, number, number] },
    { side: -1, z: -0.42, name: "legR", foot: [-0.42, 0.1, -0.55] as [number, number, number] },
    { side: 1, z: 0.38, name: "legFL", foot: [0.47, 0.1, 0.56] as [number, number, number] },
    { side: -1, z: 0.38, name: "legFR", foot: [-0.47, 0.1, 0.56] as [number, number, number] },
  ];

  const legs: { chain: any; side: number }[] = [];
  for (const d of legData) {
    const root: [number, number, number] = [d.side * 0.31, 0.91, d.z];
    const points = limb(root, d.foot, [0.34, 0.32, 0.22], [
      [0, 0, d.z > 0 ? 1 : -1],
      [0, 0, d.z > 0 ? -1 : 1],
    ], { sole: [0, 1, 0] });
    const chain = b.chain(d.name, points, {
      parent: hips,
      names: [`${d.name}Hip`, `${d.name}Knee`, `${d.name}Ankle`, `${d.name}Foot`],
      role: "leg",
      contact: d.foot,
    });
    legs.push({ chain, side: d.side });
  }

  const neckSpecs = [
    { x: -0.54, z: 0.52, lean: -0.34, name: "neckL" },
    { x: -0.27, z: 0.72, lean: -0.16, name: "neckInnerL" },
    { x: 0, z: 0.78, lean: 0, name: "neckCenter" },
    { x: 0.27, z: 0.72, lean: 0.16, name: "neckInnerR" },
    { x: 0.54, z: 0.52, lean: 0.34, name: "neckR" },
  ];

  const necks: { chain: any; head: any; jaw: any; x: number }[] = [];
  for (const n of neckSpecs) {
    const neckPath = catmull([
      [n.x * 0.6, 1.03, n.z],
      [n.x * 0.76, 1.28, n.z + 0.04],
      [n.x * 0.88, 1.59, n.z + 0.06],
      [n.x + n.lean * 0.25, 1.88, n.z + 0.1],
      [n.x + n.lean, 2.1, n.z + 0.2],
    ]);
    const neck = b.chain(n.name, neckPath, {
      parent: spine.tip,
      names: [`${n.name}1`, `${n.name}2`, `${n.name}3`, `${n.name}4`, `${n.name}Tip`],
      role: "neck",
    });
    const h = neck.tip;
    const head = b.joint(`${n.name}Head`, {
      parent: h,
      at: h.at,
      dir: [n.lean * 0.45, -0.05, 1],
      role: "head",
      group: "heads",
    });
    const jaw = b.joint(`${n.name}Jaw`, {
      parent: head,
      at: head.local({ forward: 0.03, down: 0.03 }),
      dir: [n.lean * 0.25, -0.22, 0.98],
      role: "jaw",
      group: "jaws",
    });
    necks.push({ chain: neck, head, jaw, x: n.x });
  }

  // ---------------------------------------------------------------------------
  // Main body and tail: broad, muscular, faceted tubes.

  b.sweep(spine, (t) => 0.34 - t * 0.08, {
    color: COAT,
    sides: 8,
    section: "circle",
    name: "armored-spine",
    group: "body",
  });

  b.sweep(tail, (t) => 0.27 * (1 - t) + 0.035, {
    color: COAT,
    sides: 8,
    bands: [
      [0.72, SCALE_SHADOW],
      [0.9, HORN_DARK],
      [1, HORN],
    ],
    name: "barbed-tail",
    group: "tail",
  });

  // Belly plates and shoulder armor.
  const belly = b.sweep(
    catmull([
      [0, 0.7, -0.48],
      [0, 0.73, -0.05],
      [0, 0.78, 0.35],
      [0, 0.84, 0.68],
    ]),
    [0.2, 0.13],
    { color: cel(BELLY, BELLY_DARK), sides: 6, name: "belly-plates", group: "armor" },
  );

  for (let i = 0; i < 8; i++) {
    const p = spine.at(0.12 + i * 0.105);
    b.stick(
      new THREE.ConeGeometry(0.09 - i * 0.004, 0.16 - i * 0.006, 6),
      ARMOR,
      p.moved([0, p.radius + 0.025, 0]),
      { embed: 0.55, spin: 90, name: `back-plate-${i}` },
    );
  }

  // ---------------------------------------------------------------------------
  // Legs: thick upper limbs, angular shins, armored knees, three talons.

  for (const { chain, side } of legs) {
    b.sweep(chain, (t) => (t < 0.48 ? 0.145 : t < 0.76 ? 0.105 : 0.07), {
      color: COAT,
      sides: 7,
      name: `leg-muscle-${side}`,
      group: "legs",
    });

    const knee = chain.at(0.45);
    b.stick(new THREE.IcosahedronGeometry(0.145, 0), ARMOR, knee, {
      embed: 0.42,
      name: `iron-knee-${side}`,
      group: "armor",
    });

    const foot = chain.at(0.88);
    for (let i = -1; i <= 1; i++) {
      const toeBase = foot.moved([i * 0.055, -0.045, 0.02]);
      b.spike(toeBase, [i * 0.22, -0.12, 0.98], 0.2, 0.035, {
        color: CLAW,
        caps: "point",
        name: `talon-${side}-${i}`,
        group: "claws",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Five necks: thick serpentine columns with dorsal spines and throat plates.

  for (let k = 0; k < necks.length; k++) {
    const n = necks[k];
    b.sweep(n.chain, (t) => 0.19 - t * 0.055, {
      color: COAT,
      sides: 7,
      name: `neck-flesh-${k}`,
      group: "necks",
    });

    b.sweep(n.chain, (t) => 0.135 - t * 0.035, {
      color: cel(BELLY, BELLY_DARK),
      sides: 6,
      sectors: [[100, 260, cel(BELLY, BELLY_DARK)]],
      from: 0.12,
      name: `neck-throat-${k}`,
      group: "necks",
    });

    for (let i = 0; i < 6; i++) {
      const p = n.chain.at(0.16 + i * 0.13);
      b.spike(
        p.moved([0, p.radius * 0.9, 0]),
        p.moved([0, p.radius + 0.19 - i * 0.018, -0.025]),
        null,
        0.045,
        {
          color: HORN,
          caps: "point",
          name: `neck-spine-${k}-${i}`,
          group: "spines",
        },
      );
    }

    for (let i = 0; i < 4; i++) {
      const p = n.chain.at(0.32 + i * 0.14);
      b.stick(
        new THREE.CylinderGeometry(0.09 - i * 0.01, 0.11 - i * 0.01, 0.045, 6),
        ARMOR,
        p.moved([0, -p.radius * 0.8, 0]),
        { embed: 0.35, name: `throat-plate-${k}-${i}`, group: "armor" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Heads: heavy skulls, cheek plates, crowns of horns, glowing eyes, nostrils.

  for (let k = 0; k < necks.length; k++) {
    const { head, jaw, x } = necks[k];

    const skull = b.part(
      new THREE.SphereGeometry(0.255, 9, 7),
      HEAD_COAT,
      {
        bone: head,
        at: head.local({ forward: 0.03 }),
        scale: [1.0, 0.92, 1.28],
        flat: true,
        name: `skull-${k}`,
        group: "heads",
      },
    );

    const brow = b.part(
      new THREE.BoxGeometry(0.38, 0.11, 0.19),
      ARMOR,
      {
        bone: head,
        at: head.local({ forward: 0.135, up: 0.11 }),
        rotation: [0.12, 0, x * 0.12],
        name: `brow-plate-${k}`,
        group: "armor",
      },
    );

    const muzzle = b.part(
      new THREE.SphereGeometry(0.18, 8, 5),
      cel("#a54b35", "#4d2729"),
      {
        bone: head,
        at: head.local({ forward: 0.255, down: 0.025 }),
        scale: [1.04, 0.72, 1.18],
        flat: true,
        name: `muzzle-${k}`,
        group: "heads",
      },
    );

    const upperJaw = b.part(
      new THREE.BoxGeometry(0.25, 0.13, 0.29),
      cel("#8d3d31", "#3c2027"),
      {
        bone: head,
        at: head.local({ forward: 0.29, down: 0.08 }),
        rotation: [0.05, 0, 0],
        name: `upper-jaw-${k}`,
        group: "jaws",
      },
    );

    const lowerJaw = b.part(
      new THREE.BoxGeometry(0.22, 0.105, 0.28),
      cel("#7b302c", "#321b22"),
      {
        bone: jaw,
        at: jaw.local({ forward: 0.16, down: 0.08 }),
        rotation: [-0.03, 0, 0],
        name: `lower-jaw-${k}`,
        group: "jaws",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.18, 0.018, 0.23),
      MOUTH,
      {
        bone: jaw,
        at: jaw.local({ forward: 0.225, up: 0.005 }),
        name: `mouth-dark-${k}`,
        group: "jaws",
      },
    );

    // Teeth form a readable, exaggerated silhouette.
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        b.spike(
          head.local({ left: s * (0.065 + i * 0.045), forward: 0.345, down: 0.02 }),
          [0, -0.95, 0.08],
          0.085 + (i === 1 ? 0.035 : 0),
          0.022,
          { color: CLAW, caps: "point", name: `upper-fang-${k}-${s}-${i}`, group: "teeth" },
        );
        b.spike(
          jaw.local({ left: s * (0.06 + i * 0.04), forward: 0.245, up: 0.02 }),
          [0, 0.92, 0.1],
          0.07,
          0.019,
          { color: CLAW, caps: "point", name: `lower-fang-${k}-${s}-${i}`, group: "teeth" },
        );
      }
    }

    // Eyes are decals for a strong front-facing God of War silhouette.
    const headSurface = b.surface(skull);
    for (const s of [-1, 1]) {
      const eyeHit = headSurface.around(head.at).at(s * 42, 8);
      if (eyeHit) {
        b.decal(headSurface, EYE, {
          at: eyeHit,
          size: [0.105, 0.13],
          lift: 0.006,
          mirror: s > 0,
          name: `burning-eye-${k}-${s}`,
          group: "face",
        });
      }
    }

    // Nostril embers and cheek rivets.
    for (const s of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.027, 6, 4), BLOOD, {
        bone: head,
        at: head.local({ left: s * 0.08, forward: 0.382, down: 0.035 }),
        name: `nostril-${k}-${s}`,
        group: "face",
      });
      b.part(new THREE.SphereGeometry(0.025, 6, 4), BRONZE, {
        bone: head,
        at: head.local({ left: s * 0.16, forward: 0.12, up: 0.02 }),
        name: `cheek-rivet-${k}-${s}`,
        group: "armor",
      });
    }

    // Crown horns: two swept rear horns and two side horns.
    for (const s of [-1, 1]) {
      const browBase = head.local({ left: s * 0.13, up: 0.17, back: 0.02 });
      const hornPath = catmull([
        browBase,
        head.local({ left: s * 0.2, up: 0.28, back: 0.05 }),
        head.local({ left: s * 0.25, up: 0.39, back: 0.12 }),
        head.local({ left: s * 0.2, up: 0.46, back: 0.25 }),
      ]);
      b.sweep(hornPath, [0.052, 0.008], {
        color: HORN,
        sides: 6,
        caps: { start: "round", end: "point" },
        bone: head,
        name: `crown-horn-${k}-${s}`,
        group: "horns",
      });

      b.spike(
        head.local({ left: s * 0.22, up: 0.08, back: 0.02 }),
        [s * 0.85, 0.3, -0.2],
        0.18,
        0.038,
        { color: HORN_DARK, caps: "point", name: `temple-horn-${k}-${s}`, group: "horns" },
      );
    }

    // Small forehead crest.
    b.spike(
      head.local({ up: 0.18, back: 0.02 }),
      [0, 0.9, -0.2],
      0.13,
      0.045,
      { color: BRONZE, caps: "point", name: `forehead-crest-${k}`, group: "armor" },
    );
  }

  // ---------------------------------------------------------------------------
  // Tail barbs and a few large scars / bronze war plates.

  for (let i = 0; i < 7; i++) {
    const p = tail.at(0.15 + i * 0.105);
    b.spike(
      p.moved([0, p.radius * 0.7, 0]),
      p.moved([0, p.radius + 0.13 - i * 0.01, -0.025]),
      null,
      0.04,
      { color: HORN, caps: "point", name: `tail-barb-${i}`, group: "spines" },
    );
  }

  for (const z of [-0.28, 0.03, 0.34]) {
    b.part(
      new THREE.BoxGeometry(0.33, 0.08, 0.16),
      ARMOR,
      {
        bone: spine.joints[2],
        at: [0, 1.12, z],
        rotation: [0, 0, 0],
        name: `shoulder-armor-${z}`,
        group: "armor",
      },
    );
  }

  // A pair of short, brutal shoulder spikes completes the silhouette.
  for (const s of [-1, 1]) {
    b.spike(
      [s * 0.28, 1.16, 0.36],
      [s * 0.95, 0.28, 0.12],
      0.25,
      0.065,
      { color: HORN, caps: "point", name: `shoulder-spike-${s}`, group: "spines" },
    );
  }

  return b.root;
}
```