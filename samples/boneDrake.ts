import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { catmull } from "../src/path";
import { countershade, gradient, mottle, scales } from "../src/paint";
import { rng } from "../src/math";

import { glow } from "../kits/glow";

export const meta = {
  name: "Bone Drake",
  description: "A towering undead bone drake with a ribbed skeleton, ragged wings, and necrotic green eyes.",
  style: "Blizzard/Warcraft",
  commit: "34f986c",
};

const BONE = "#d7caa8";
const BONE_HI = "#f1e5c2";
const BONE_DARK = "#655a52";
const SOCKET = "#262029";
const WING = "#4c2435";
const WING_HI = "#783747";
const CLAW = "#302a31";

const NECROTIC = "#90d33f";
const NECROTIC_HI = "#d7ff78";

export default function build() {
  const b = createBuilder({ name: "boneDrake", detail: 0.85, paintSize: 2048 });
  const bonePaint = countershade(
    mottle(BONE, BONE_DARK, { size: 0.34, contrast: 0.38, seed: 17 }),
    "#403a3c",
    { level: -0.18 },
  );
  const wingPaint = mottle(WING, WING_HI, { size: 0.24, contrast: 0.5, seed: 8 });
  const ribPaint = scales(BONE, BONE_DARK, { size: 0.12, width: 0.18, seed: 13 });

  // Skeleton first: a neutral quadruped rest pose, with the wings fully readable.
  const hips = b.joint("hips", { at: [0, 1.55, -0.72], dir: [0, 0.1, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.58, -0.72],
      [0, 1.77, -0.22],
      [0, 1.82, 0.32],
      [0, 1.7, 0.82],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.52, -0.72],
      [0, 1.4, -1.3],
      [0, 1.28, -1.95],
      [0, 1.12, -2.62],
      [0, 1.06, -3.28],
      [0, 1.14, -3.82],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"], role: "tail" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.7, 0.82],
      [0, 1.93, 1.18],
      [0, 2.25, 1.43],
      [0, 2.53, 1.6],
    ]),
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neck3", "neck4"],
      role: "neck",
    },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 2.53, 1.6], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.16, down: 0.12 }),
    aim: head.local({ forward: 0.45, down: 0.08 }),
    role: "jaw",
  });

  const legChains: Chain[] = [];
  const armChains: Chain[] = [];
  const wingChains: Chain[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "R" : "L";
    const hind = b.chain(
      `hindLeg${side}`,
      [
        [s * 0.26, 1.5, -0.62],
        [s * 0.63, 1.16, -0.74],
        [s * 0.7, 0.67, -0.5],
        [s * 0.68, 0.23, -0.17],
        [s * 0.7, 0.085, 0.12],
      ],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    legChains.push(hind);

    const arm = b.chain(
      `frontLeg${side}`,
      [
        [s * 0.3, 1.76, 0.53],
        [s * 0.6, 1.37, 0.7],
        [s * 0.72, 0.86, 0.82],
        [s * 0.68, 0.36, 0.94],
        [s * 0.69, 0.12, 1.08],
      ],
      {
        parent: spine.tip!,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`, `frontFoot${side}`],
        role: "arm",
      },
    );
    armChains.push(arm);

    const wing = b.chain(
      `wingArm${side}`,
      [
        [s * 0.32, 1.88, 0.64],
        [s * 0.82, 2.24, 0.38],
        [s * 1.42, 2.5, 0.0],
        [s * 2.08, 2.28, 0.12],
      ],
      {
        parent: spine.tip!,
        names: [`wingRoot${side}`, `wingElbow${side}`, `wingWrist${side}`, `wingTip${side}`],
        role: "wing",
      },
    );
    wingChains.push(wing);

    const fingerA = b.chain(
      `wingFingerA${side}`,
      [
        [s * 2.08, 2.28, 0.12],
        [s * 2.48, 2.22, 0.3],
        [s * 2.86, 1.9, 0.52],
      ],
      { parent: wing.tip!, names: [`fingerA${side}`, `fingerATip${side}`, `fingerAClaw${side}`], role: "digit" },
    );
    const fingerB = b.chain(
      `wingFingerB${side}`,
      [
        [s * 2.08, 2.28, 0.12],
        [s * 2.4, 1.88, 0.0],
        [s * 2.68, 1.5, 0.16],
      ],
      { parent: wing.tip!, names: [`fingerB${side}`, `fingerBTip${side}`, `fingerBClaw${side}`], role: "digit" },
    );
    wingChains.push(fingerA, fingerB);
  }

  // Main bone masses.
  const torso = b.sweep(spine, (t) => 0.38 + 0.07 * Math.sin(t * Math.PI), {
    color: bonePaint,
    section: { ngon: 8 },
    name: "ribcage",
  });

  const torsoPlates = b.surface(torso).scatter(28, {
    rng: rng(113),
    minDist: 0.14,
    filter: (hit) => hit.n.y > -0.35,
  });
  for (const [i, plate] of torsoPlates.entries()) {
    b.stick(new THREE.ConeGeometry(0.045, 0.016, b.segments(5)), BONE_HI, plate, {
      embed: 0.35,
      name: `torsoPlate${i}`,
    });
  }
  const tailTube = b.sweep(tail, (t) => 0.26 * (1 - t) + 0.045, {
    color: bonePaint,
    section: { ngon: 7 },
    name: "vertebraeTail",
    caps: { start: "round", end: "point" },
  });
  const neckTube = b.sweep(neck, [0.25, 0.14], { color: bonePaint, section: { ngon: 7 }, name: "vertebraeNeck" });
  b.along(tailTube, 8, (at) => {
    for (const deg of [-90, 90]) {
      b.stick(new THREE.SphereGeometry(0.038, b.segments(6), b.segments(4)), BONE_HI, tailTube.at(at.t, deg), {
        embed: 0.42,
        name: `tailKnuckle${Math.round(at.t * 100)}${deg > 0 ? "R" : "L"}`,
      });
    }
  });
  b.along(neckTube, 5, (at) => {
    for (const deg of [-90, 90]) {
      b.stick(new THREE.SphereGeometry(0.055, b.segments(6), b.segments(4)), BONE_HI, neckTube.at(at.t, deg), {
        embed: 0.42,
        name: `neckKnuckle${Math.round(at.t * 100)}${deg > 0 ? "R" : "L"}`,
      });
    }
  });

  for (const leg of legChains) {
    b.sweep(leg, (t) => 0.16 * (1 - t) + 0.065, {
      color: bonePaint,
      section: "box",
      name: `legBones${leg.joints[0].name}`,
    });
  }
  for (const arm of armChains) {
    b.sweep(arm, (t) => 0.125 * (1 - t) + 0.052, {
      color: bonePaint,
      section: "box",
      name: `armBones${arm.joints[0].name}`,
    });
  }
  for (const wing of wingChains) {
    b.sweep(wing, (t) => 0.115 * (1 - t) + 0.032, {
      color: bonePaint,
      section: { ngon: 6 },
      name: `wingBones${wing.joints[0].name}`,
    });
  }

  // Ragged wing membranes are split into two scalloped sails per side.
  for (const s of [1, -1]) {
    const side = s > 0 ? "R" : "L";
    const wing = wingChains[s > 0 ? 0 : 3];
    const fingerA = wingChains[s > 0 ? 1 : 4];
    const fingerB = wingChains[s > 0 ? 2 : 5];
    const midEdge = [
      [s * 0.34, 1.75, 0.59],
      [s * 0.92, 1.8, 0.14],
      [s * 1.52, 1.76, -0.14],
      [s * 2.12, 1.73, 0.0],
    ];
    const lowEdge = [
      [s * 0.4, 1.7, 0.56],
      [s * 1.1, 1.4, -0.18],
      [s * 1.85, 1.25, -0.02],
      [s * 2.7, 1.2, 0.3],
    ];
    b.membrane(wing, midEdge, {
      color: wingPaint,
      thickness: 0.018,
      rows: 5,
      scallop: 0.2,
      name: `wingUpper${side}`,
    });
    b.membrane(fingerA, lowEdge, {
      color: wingPaint,
      thickness: 0.018,
      rows: 5,
      scallop: 0.34,
      name: `wingLower${side}`,
    });
    b.membrane(fingerA, fingerB, {
      color: wingPaint,
      thickness: 0.014,
      rows: 4,
      scallop: 0.3,
      name: `wingFold${side}`,
    });
    for (const [i, edge] of lowEdge.entries()) {
      b.rod(wing.at(i / (lowEdge.length - 1)), edge, 0.014, {
        color: BONE_DARK,
        section: { ngon: 5 },
        name: `wingRib${side}${i}`,
      });
    }
    for (const [i, digit] of [fingerA, fingerB].entries()) {
      const tip = digit.tip!;
      b.spike(tip, tip, 0.18, 0.026, {
        color: CLAW,
        section: { ngon: 5 },
        name: `wingClaw${side}${i}`,
      });
    }
  }

  // Skull, jaw and the layered cheek plates.
  const skull = b.part(new THREE.SphereGeometry(0.34, b.segments(10), b.segments(7)), bonePaint, {
    bone: head,
    at: head.local({ forward: 0.11, up: 0.02 }),
    scale: [1.15, 0.82, 1.28],
    name: "skull",
  });
  const skullPlates = b.surface(skull).scatter(12, {
    rng: rng(119),
    minDist: 0.07,
    filter: (hit) => hit.n.z > 0.1,
  });
  for (const [i, plate] of skullPlates.entries()) {
    b.stick(new THREE.ConeGeometry(0.035, 0.014, b.segments(5)), BONE_HI, plate, {
      embed: 0.28,
      name: `skullPlate${i}`,
    });
  }
  b.sweep(
    catmull([head.local({ forward: 0.16, down: 0.02 }), head.local({ forward: 0.48, down: 0.04 })]),
    [0.16, 0.075],
    { bone: head, color: ribPaint, section: { ngon: 6 }, caps: { start: "round", end: "point" }, name: "upperSnout" },
  );
  b.sweep(
    catmull([jaw.at, head.local({ forward: 0.3, down: 0.18 }), head.local({ forward: 0.52, down: 0.14 })]),
    [0.12, 0.035],
    { bone: jaw, color: bonePaint, section: { ngon: 6 }, caps: { start: "round", end: "point" }, name: "lowerJaw" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.17, b.segments(8), b.segments(5)), bonePaint, {
      bone: head,
      at: head.local([s * 0.25, 0.08, -0.01]),
      scale: [0.7, 0.55, 1.08],
      name: `cheek${s > 0 ? "R" : "L"}`,
    });
    b.part(new THREE.ConeGeometry(0.08, 0.23, b.segments(6)), BONE_HI, {
      bone: head,
      at: head.local([s * 0.2, -0.01, 0.28]),
      dir: head.local([s * 0.1, -0.1, 0.5]),
      name: `browHorn${s > 0 ? "R" : "L"}`,
    });

    const socket = b.part(new THREE.SphereGeometry(0.072, b.segments(8), b.segments(6)), SOCKET, {
      bone: head,
      at: head.local([s * 0.19, 0.16, 0.12]),
      scale: [1.1, 0.65, 1.2],
      name: `eyeSocket${s > 0 ? "R" : "L"}`,
    });
    const eye = b.part(new THREE.SphereGeometry(0.038, b.segments(8), b.segments(5)), NECROTIC, {
      bone: head,
      at: head.local([s * 0.205, 0.205, 0.12]),
      scale: [0.72, 0.35, 1.3],
      name: `glowEye${s > 0 ? "R" : "L"}`,
    });
    glow(eye, 2.2);
    glow(socket, 0);

    const hornRoot = head.moved([s * 0.2, -0.01, 0.18]);
    const hornTip = head.local([s * 0.37, -0.2, -0.22]);
    b.sprout(
      `horn${s > 0 ? "R" : "L"}`,
      hornRoot,
      catmull([hornRoot.at, head.local([s * 0.31, -0.08, 0.02]), hornTip]),
      [0.065, 0.008],
      { count: 0, color: BONE_HI, caps: { start: "round", end: "point" }, name: `horn${s > 0 ? "R" : "L"}` },
    );
  }

  // Broken-looking dorsal plates, ribs and shoulder shields.
  b.along(torso, 11, (at) =>
    b.spike(at, at, 0.16 + 0.12 * Math.sin(at.t * Math.PI), 0.045, {
      color: BONE_HI,
      section: { ngon: 5 },
      name: `dorsalSpike${Math.round(at.t * 100)}`,
    }),
  );
  b.along(tail, 9, (at) =>
    b.spike(at, at, 0.09 * (1 - at.t) + 0.035, 0.026, {
      color: BONE_HI,
      section: { ngon: 5 },
      name: `tailSpike${Math.round(at.t * 100)}`,
    }),
  );
  for (const t of [0.22, 0.42, 0.62, 0.8]) {
    const rib = torso.at(t, 180, 0.01);
    b.spike(rib, rib, 0.09, 0.035, { color: BONE_DARK, section: { ngon: 5 }, name: `sternumRib${Math.round(t * 100)}` });
  }
  for (const s of [1, -1]) {
    const side = s > 0 ? "R" : "L";
    const shoulder = spine.at(0.82);
    b.part(new THREE.SphereGeometry(0.2, b.segments(8), b.segments(5)), bonePaint, {
      bone: shoulder.bone,
      at: [s * 0.38, 1.78, 0.62],
      scale: [1.1, 0.6, 0.8],
      name: `shoulderPlate${side}`,
    });
    b.sweep(
      catmull([
        [s * 0.2, 1.58, 0.12],
        [s * 0.42, 1.36, 0.16],
        [s * 0.56, 1.2, 0.34],
      ]),
      [0.05, 0.025],
      { color: ribPaint, section: { ngon: 5 }, caps: { start: "round", end: "point" }, name: `sideRib${side}` },
    );
  }

  // Feet and hands carry three readable hooked talons each.
  for (const [s, side] of [
    [1, "R"],
    [-1, "L"],
  ] as const) {
    const hind = legChains[s > 0 ? 0 : 1];
    const fore = armChains[s > 0 ? 0 : 1];
    const rearFoot = hind.tip!;
    const frontFoot = fore.tip!;
    for (let i = -1; i <= 1; i++) {
      b.spike(rearFoot.moved([i * 0.055, -0.02, 0.03]), [0, -0.35, 1], 0.22, 0.028, {
        color: CLAW,
        section: { ngon: 5 },
        name: `rearClaw${side}${i + 1}`,
      });
      b.spike(frontFoot.moved([i * 0.045, -0.015, 0.025]), [0, -0.18, 1], 0.16, 0.022, {
        color: CLAW,
        section: { ngon: 5 },
        name: `frontClaw${side}${i + 1}`,
      });
    }
  }

  // Four upper teeth and two lower fangs make the jaw read from the hero angle.
  for (const s of [1, -1]) {
    for (const f of [0.2, 0.34, 0.46]) {
      const tooth = head.moved([s * (0.09 - f * 0.045), f, -0.12]);
      b.spike(tooth, [0, -1, 0], 0.13 - f * 0.06, 0.023, {
        color: BONE_HI,
        section: { ngon: 5 },
        name: `upperTooth${s > 0 ? "R" : "L"}${Math.round(f * 100)}`,
      });
    }
    b.spike(jaw.moved([s * 0.08, 0.23, 0.01]), [0, 1, 0], 0.16, 0.028, {
      color: BONE_HI,
      section: { ngon: 5 },
      name: `lowerFang${s > 0 ? "R" : "L"}`,
    });
  }

  // Small necrotic crystal studs on the spine and wing knuckles.
  b.along(spine, 6, (at) =>
    glow(
      b.part(new THREE.OctahedronGeometry(0.035, 0), NECROTIC_HI, {
        bone: at.bone,
        at: at.moved([0, 0, 0.4]).at,
        name: `spineWisp${Math.round(at.t * 100)}`,
      }),
      1.5,
    ),
  );
  for (const wing of wingChains.slice(0, 2)) {
    b.along(wing, 3, (at) =>
      glow(
        b.part(new THREE.OctahedronGeometry(0.028, 0), NECROTIC, {
          bone: at.bone,
          at: at.at,
          name: `wingWisp${at.bone.name}`,
        }),
        1.2,
      ),
    );
  }

  // A cold painted fade at the tail tip and cheek fissures adds the hand-painted finish.
  b.sweep(tail, (t) => 0.26 * (1 - t) + 0.045, {
    color: gradient(bonePaint, BONE_DARK, [0, 1.4, -2.2], [0, 1.1, -3.82]),
    section: { ngon: 7 },
    from: 0.62,
    name: "tailTipFade",
    caps: { start: "flat", end: "point" },
  });

  return b.root;
}
