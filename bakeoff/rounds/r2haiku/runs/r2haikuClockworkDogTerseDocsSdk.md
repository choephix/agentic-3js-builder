```ts
import * as THREE from "three";
import { catmull, createBuilder, limb, line, rng, scales, stripes } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "clockwork-dog",
  description: "A brass-and-copper clockwork hound: riveted barrel body, gear on the flank, winding key, coil tail and glowing amber eyes.",
};

export default function build() {
  const b = createBuilder({ name: "clockwork-dog" });

  const BRASS = "#d4a94f";
  const BRASS_DARK = "#8a6428";
  const COPPER = "#b8733a";
  const IRON = "#3a3e46";
  const LEATHER = "#5a3a24";
  const GLOW = "#ffb13b";
  const IVORY = "#f3ead2";

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.42, -0.22], aim: [0, 0.42, -0.1], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, -0.22],
      [0, 0.43, -0.02],
      [0, 0.44, 0.16],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip ?? spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.44, 0.16],
      [0, 0.6, 0.28],
      [0, 0.76, 0.38],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.76, 0.38],
    aim: [0, 0.74, 0.56],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.08, up: -0.05 }),
    aim: head.local({ forward: 0.3, up: -0.06 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.42, -0.22],
      [0, 0.5, -0.36],
      [0, 0.6, -0.44],
      [0, 0.7, -0.47],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // ---- Barrel body ----------------------------------------------------------
  const bodyPaint = scales(BRASS, BRASS_DARK, { size: 0.08, width: 0.008 });
  const torso = b.sweep(spine, (t: number) => [0.11 + 0.03 * t, 0.12], { color: bodyPaint });
  const surf = b.surface(torso);

  // Riveted band around the chest
  const band = surf.loop(spine.at(0.6), { lift: 0.006 });
  b.sweep(band, 0.01, { color: BRASS_DARK });

  // Clockwork gears on the left flank
  const gearA = surf.nearest([0.2, 0.44, 0.04]);
  b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 14), BRASS, gearA, { embed: 0.3 });
  b.ring(gearA, { count: 14, radius: 0.045 }, (tooth) =>
    b.stick(new THREE.BoxGeometry(0.012, 0.012, 0.012), BRASS, tooth, { embed: 0.3 }),
  );

  const gearB = surf.nearest([0.2, 0.47, 0.15]);
  b.stick(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 10), COPPER, gearB, { embed: 0.3 });
  b.ring(gearB, { count: 8, radius: 0.026 }, (tooth) =>
    b.stick(new THREE.BoxGeometry(0.008, 0.008, 0.008), COPPER, tooth, { embed: 0.3 }),
  );

  // Winding key on the top of the hips
  const keyHit = surf.nearest([0, 0.7, -0.1]);
  b.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.022, 0.01],
      [0.008, 0.018],
      [0.008, 0.05],
      [0, 0.05],
    ],
    { at: keyHit, color: BRASS, segments: 10 },
  );

  // Scattered rivets over the barrel, kept clear of the gears and key
  const rivetHits = surf.scatter(36, {
    rng: rng(11),
    minDist: 0.05,
    filter: (h) =>
      h.n.y > -0.4 &&
      h.at.distanceTo(gearA.at) > 0.1 &&
      h.at.distanceTo(gearB.at) > 0.07 &&
      h.at.distanceTo(keyHit.at) > 0.08,
  });
  for (const h of rivetHits) {
    b.stick(new THREE.SphereGeometry(0.008, 5, 4), BRASS, h, { embed: 0.5 });
  }

  // ---- Neck and head -------------------------------------------------------
  b.sweep(neck, (t: number) => 0.06 + 0.01 * t, { color: IRON });

  const headColor = COPPER;
  b.frustumBox(head.local({ forward: -0.06 }), head.local({ forward: 0.12 }), [0.15, 0.14], [0.13, 0.13], {
    bone: head,
    color: headColor,
  });
  b.frustumBox(
    head.local({ forward: 0.12 }),
    head.local({ forward: 0.27, up: -0.01 }),
    [0.1, 0.08],
    [0.07, 0.065],
    { bone: head, color: headColor },
  );
  b.part(new THREE.SphereGeometry(0.022, 8, 6), IRON, {
    bone: head,
    at: head.local({ forward: 0.27, up: -0.01 }),
  });

  // Lower jaw, hinged at the back of the snout
  b.frustumBox(
    jaw.local({ forward: -0.02 }),
    jaw.local({ forward: 0.17, up: -0.005 }),
    [0.08, 0.045],
    [0.06, 0.035],
    { bone: jaw, color: headColor },
  );
  for (const f of [0.05, 0.1, 0.15]) {
    for (const s of [1, -1]) {
      b.spike(jaw.local({ left: s * 0.03, forward: f, up: -0.02 }), [0, 1, 0], 0.022, 0.005, {
        bone: jaw,
        color: IVORY,
      });
    }
  }

  // Leather ears: flat plates in the side plane
  const earOutline: OutlinePoint[] = [
    [-0.035, 0],
    [0.035, 0],
    [0.02, 0.1],
    [-0.01, 0.13],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: head.local({ left: s * 0.05, forward: -0.03, up: 0.06 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: LEATHER,
      bone: head,
    });
  }

  // Amber glass eyes with brass rings and dark pupils
  for (const s of [1, -1]) {
    const eyeC = head.local({ left: s * 0.072, forward: 0.1, up: 0.025 });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), GLOW, { bone: head, at: eyeC });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), IRON, {
      bone: head,
      at: head.local({ left: s * 0.084, forward: 0.127, up: 0.025 }),
    });
    const gaze = line(eyeC, head.local({ left: s * 0.2, forward: 0.1, up: 0.025 }));
    b.ring(gaze, { count: 8, radius: 0.036 }, (stud) =>
      b.stick(new THREE.BoxGeometry(0.008, 0.008, 0.008), BRASS, stud, { embed: 0.2 }),
    );
  }

  // ---- Legs ------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // Front leg: shoulder, elbow, paw
    const foreP = limb([s * 0.11, 0.42, 0.18], [s * 0.11, 0.03, 0.2], [0.21, 0.2], [[0, 0, -1]]);
    const fore = b.chain(`foreLeg${sd}`, foreP, {
      parent: chest,
      names: [`shoulderF${sd}`, `elbowF${sd}`, `pawF${sd}`],
      role: "leg",
    });
    b.sweep(fore, (t: number) => 0.035 - 0.01 * t, { color: IRON });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { bone: fore.joints[1], at: fore.joints[1].at });
    const forePaw = fore.tip ?? fore.joints[fore.joints.length - 1];
    b.frustumBox(forePaw.local({ forward: -0.03 }), forePaw.local({ forward: 0.06 }), [0.05, 0.04], [0.045, 0.035], {
      bone: forePaw,
      color: BRASS_DARK,
    });

    // Hind leg: hip, knee forward, hock back, paw
    const hindP = limb(
      [s * 0.11, 0.42, -0.2],
      [s * 0.11, 0.03, -0.12],
      [0.17, 0.17, 0.1],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`hindLeg${sd}`, hindP, {
      parent: hips,
      names: [`hipH${sd}`, `kneeH${sd}`, `hockH${sd}`, `pawH${sd}`],
      role: "leg",
    });
    b.sweep(hind, (t: number) => 0.055 - 0.02 * t, { color: IRON });
    for (const j of [hind.joints[1], hind.joints[2]]) {
      b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { bone: j, at: j.at });
    }
    const hindPaw = hind.tip ?? hind.joints[hind.joints.length - 1];
    b.frustumBox(hindPaw.local({ forward: -0.03 }), hindPaw.local({ forward: 0.06 }), [0.05, 0.04], [0.045, 0.035], {
      bone: hindPaw,
      color: BRASS_DARK,
    });
  }

  // ---- Coiled spring tail ---------------------------------------------------
  b.sweep(tail, (t: number) => 0.035 - 0.015 * t, {
    color: stripes(BRASS, BRASS_DARK, { size: 0.04 }),
  });
  const coilGeo = (R: number) => new THREE.TorusGeometry(R, 0.004, 5, 10).rotateX(Math.PI / 2);
  b.along(tail, 5, (at) => {
    b.part(coilGeo(0.035 - 0.015 * at.t + 0.004), COPPER, { frame: at });
  });

  return b.root;
}
```