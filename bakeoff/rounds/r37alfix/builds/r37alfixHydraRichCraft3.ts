import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  paint,
  spots,
  countershade,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, inkLines, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal low-poly God of War inspired hydra with five snarling heads, armored scales, branching necks, hooked horns, open jaws, muscular legs and a barbed tail.",
};

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const COAT = cel(
    furEdge("#315247", "#152e2d", {
      level: -0.18,
      teeth: 0.16,
      period: 0.12,
      ink: "#10201f",
      inkWidth: 0.035,
    }),
    "#183c3b",
  );
  const BELLY = cel("#b4a06b", "#5a493d");
  const HORN = cel("#d0bd91", "#604b3d");
  const DARK = "#14171b";
  const TEETH = "#e8d6a8";
  const GUM = "#6b2026";
  const SCAR = "#9b302b";
  const GOLD = "#bc8d3d";
  const EYE = animeEye({ iris: "#d85b27", ink: "#100d12", blush: false, size: 384 });

  // ---------------------------------------------------------------------------
  // Skeleton: one root, a broad spine, five independent necks and a tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.86, -0.18], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.02, 0.94, -0.56],
      [0, 1.02, -0.24],
      [0, 1.04, 0.12],
      [0, 1.16, 0.43],
    ]),
    { parent: hips, names: ["pelvis", "torso", "shoulder", "chest"], role: "spine" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.92, -0.55],
      [0, 0.82, -1.05],
      [0.08, 0.67, -1.52],
      [0.22, 0.54, -1.88],
      [0.42, 0.49, -2.16],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  const neckData = [
    { side: -0.48, y: 1.18, z: 0.34, tip: [-0.72, 1.82, 0.72], name: "neckL" },
    { side: -0.24, y: 1.24, z: 0.46, tip: [-0.38, 2.15, 0.92], name: "neckInnerL" },
    { side: 0, y: 1.28, z: 0.51, tip: [0, 2.32, 1.05], name: "neckC" },
    { side: 0.24, y: 1.24, z: 0.46, tip: [0.38, 2.15, 0.92], name: "neckInnerR" },
    { side: 0.48, y: 1.18, z: 0.34, tip: [0.72, 1.82, 0.72], name: "neckR" },
  ];

  const necks: { chain: any; head: any; jaw: any; skull: THREE.Vector3 }[] = [];

  for (const d of neckData) {
    const root = [d.side, d.y, d.z] as [number, number, number];
    const mid = [d.side * 1.08, d.y + 0.28, d.z + 0.12] as [number, number, number];
    const path = catmull([root, mid, d.tip]);
    const neck = b.chain(d.name, path, {
      parent: spine.tip!,
      names: [`${d.name}1`, `${d.name}2`, `${d.name}3`],
      role: "neck",
    });
    const skull = new THREE.Vector3(d.tip[0], d.tip[1], d.tip[2] + 0.11);
    const head = b.joint(`${d.name}Head`, { parent: neck.tip!, at: skull, dir: [0, 0.02, 1], role: "head" });
    const jaw = b.joint(`${d.name}Jaw`, {
      parent: head,
      at: head.local({ forward: 0.11, down: -0.11 }),
      dir: [0, -0.15, 1],
      role: "jaw",
    });
    necks.push({ chain: neck, head, jaw, skull });
  }

  const legSpecs = [
    { s: 1, z: 0.28, x: 0.36, name: "frontL" },
    { s: -1, z: 0.28, x: -0.36, name: "frontR" },
    { s: 1, z: -0.36, x: 0.42, name: "backL" },
    { s: -1, z: -0.36, x: -0.42, name: "backR" },
  ];

  const legs: any[] = [];
  for (const l of legSpecs) {
    const hip = [l.x, 1.02, l.z] as [number, number, number];
    const foot = [l.x * 1.18, 0.14, l.z + (l.z > 0 ? 0.17 : -0.08)] as [number, number, number];
    const pts = limb(hip, foot, [0.39, 0.37, 0.29], [
      [0, 0, l.z > 0 ? 1 : -1],
      [0, 0, l.z > 0 ? -1 : 1],
    ]);
    legs.push(
      b.chain(l.name, pts, {
        parent: hips,
        names: [`${l.name}Hip`, `${l.name}Knee`, `${l.name}Hock`, `${l.name}Paw`],
        role: "leg",
        contact: foot,
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // Continuous anatomy.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, [0.33, 0.39, 0.33, 0.26], {
    bone: spine,
    color: COAT,
    section: { ngon: 8 },
    sides: 8,
    name: "armored torso",
  });

  b.sweep(tail, (t) => 0.21 * (1 - t) + 0.035, {
    bone: tail,
    color: spots(COAT, "#142a2a", { size: 0.18, amount: 0.45, rosette: true, seed: 4 }),
    section: { ngon: 7 },
    name: "barbed tail",
  });

  for (const n of necks) {
    b.sweep(n.chain, (t) => 0.18 - t * 0.065, {
      bone: n.chain,
      color: COAT,
      section: { ngon: 7 },
      sides: 7,
      name: "heavy neck",
    });
  }

  for (const leg of legs) {
    b.sweep(leg, (t) => (t < 0.55 ? 0.14 : 0.105), {
      bone: leg,
      color: COAT,
      section: { ngon: 6 },
      skin: "rigid",
      name: "jointed leg",
    });
    const foot = leg.tip;
    b.part(new THREE.BoxGeometry(0.22, 0.13, 0.34), DARK, {
      bone: foot,
      at: foot.at,
      dir: [0, 1, 0],
      name: "iron-dark paw",
    });
    for (const x of [-0.07, 0, 0.07]) {
      b.spike(
        foot.at,
        [0, 0, 1],
        0.19,
        0.025,
        { color: HORN, bone: foot, name: "claw" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Five heads: skulls, muzzles, jaws, eyes, horns, teeth and scar details.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < necks.length; i++) {
    const n = necks[i];
    const h = n.head;
    const skull = b.part(new THREE.SphereGeometry(0.27, 10, 7), COAT, {
      bone: h,
      at: h.at,
      scale: [1.0, 0.92, 1.18],
      name: `head${i + 1} skull`,
    });

    const muzzle = b.part(new THREE.SphereGeometry(0.17, 8, 6), BELLY, {
      bone: h,
      at: h.local({ forward: 0.27, down: 0.035 }),
      scale: [1.0, 0.72, 1.3],
      name: `head${i + 1} muzzle`,
    });

    const upperJaw = b.sweep(
      catmull([
        h.local({ forward: 0.11, down: -0.02 }),
        h.local({ forward: 0.34, down: -0.035 }),
        h.local({ forward: 0.48, down: -0.02 }),
      ]),
      [0.13, 0.08],
      { bone: h, color: BELLY, section: { ngon: 6 }, name: `head${i + 1} upper jaw` },
    );

    const lowerJaw = b.sweep(
      catmull([
        n.jaw.at,
        n.jaw.local({ forward: 0.2, down: -0.015 }),
        n.jaw.local({ forward: 0.38, down: 0.015 }),
      ]),
      [0.105, 0.025],
      { bone: n.jaw, color: GUM, section: { ngon: 6 }, name: `head${i + 1} open lower jaw` },
    );

    // Eyes are large, angry and deliberately close to the front silhouette.
    const faceSurface = b.surface(skull);
    for (const side of [-1, 1]) {
      const hit = faceSurface.around(h.at).at(side * 42, 8);
      if (hit) {
        b.decal(faceSurface, EYE, {
          at: hit,
          size: [0.115, 0.14],
          lift: 0.006,
          mirror: side > 0,
          name: `head${i + 1} burning eye`,
        });
        b.spike(hit, hit, 0.045, 0.012, { color: INK, name: "eyebrow ridge" });
      }
    }

    // Crown horns: two rear-swept pairs and one central brow horn.
    for (const side of [-1, 1]) {
      const base = h.local({ left: side * 0.16, up: 0.16, back: 0.04 });
      const tip = h.local({ left: side * 0.31, up: 0.42, back: 0.18 });
      b.sweep(
        catmull([base, h.local({ left: side * 0.25, up: 0.28, back: 0.06 }), tip]),
        [0.065, 0.008],
        { bone: h, color: HORN, caps: "point", section: { ngon: 6 }, name: "swept horn" },
      );
    }
    b.spike(
      h.local({ forward: 0.08, up: 0.14 }),
      [0, 0.75, -0.2],
      0.22,
      0.045,
      { color: HORN, bone: h, name: "brow horn" },
    );

    // Jagged teeth lining both jaws.
    for (const side of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const p = n.jaw.local({
          left: side * (0.075 - k * 0.012),
          forward: 0.12 + k * 0.07,
          up: 0.055,
        });
        b.spike(p, [0, -1, 0], 0.095 - k * 0.012, 0.018, {
          color: TEETH,
          bone: n.jaw,
          name: "lower fang",
        });
      }
    }
    for (let k = 0; k < 5; k++) {
      const p = h.local({ left: -0.09 + k * 0.045, forward: 0.22 + (k % 2) * 0.04, down: 0.02 });
      b.spike(p, [0, -1, 0], 0.11, 0.018, { color: TEETH, bone: h, name: "upper fang" });
    }

    // A bold painted scar gives each face a slightly different war-worn identity.
    const scar = b.sweep(
      catmull([
        h.local({ left: 0.16, up: 0.09, forward: 0.17 }),
        h.local({ left: 0.21, up: 0.02, forward: 0.24 }),
        h.local({ left: 0.14, down: 0.08, forward: 0.3 }),
      ]),
      0.012,
      { bone: h, color: SCAR, section: { ngon: 5 }, name: "battle scar" },
    );
  }

  // ---------------------------------------------------------------------------
  // Armor-like dorsal plates, throat scales, tail barbs and a glowing throat.
  // ---------------------------------------------------------------------------

  b.along(spine, 7, (at) =>
    b.spike(at, [0, 1, -0.12], 0.19, 0.055, {
      color: HORN,
      name: "dorsal plate",
    }),
  );

  for (const n of necks) {
    b.along(n.chain, 5, (at) =>
      b.spike(at, [0, 0.65, -0.2], 0.11, 0.035, {
        color: HORN,
        name: "neck scale",
      }),
    );
  }

  b.along(tail, 7, (at) =>
    b.spike(at, [0, 0.3, -1], 0.16, 0.045, {
      color: HORN,
      name: "tail barb",
    }),
  );

  const throat = b.part(new THREE.SphereGeometry(0.1, 8, 6), "#e84d29", {
    bone: necks[2].jaw,
    at: necks[2].jaw.local({ forward: 0.13, down: 0.03 }),
    name: "central ember throat",
  });
  glow(throat, 1.8);

  // Small metal collar bands make the neck roots feel like brutal trophy armor.
  for (const n of necks) {
    const loop = b.surface(n.chain.joints).loop(n.chain.joints[0], { lift: 0.008 });
    b.sweep(loop, 0.018, { color: GOLD, caps: "flat", name: "neck collar" });
  }

  return b.root;
}
