import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { rng } from "../src/math";
import { countershade, paint, scales, mottle } from "../src/paint";
import { glow } from "../kits/glow";


export const meta = {
  name: "Frost Wyrm",
  description: "A skeletal ice dragon with tattered frost wings, jagged horns, and a heroic Warcraft silhouette.",
  style: "Blizzard/Warcraft",
  commit: "34f986c",
};

const BONE = "#d9eff2";
const BONE_LIGHT = "#f4ffff";
const BONE_SHADE = "#7fabb8";
const BONE_DARK = "#385968";
const ICE = "#77d9ed";
const ICE_DARK = "#247e9b";
const MEMBRANE = "#244e67";
const MEMBRANE_LIGHT = "#4c9db3";
const EYE = "#b9ffff";
const MOUTH = "#172832";
const RUNE = "#84f4ff";
const CLAW = "#e8fbff";

const icePaint = countershade(
  scales(mottle(BONE_SHADE, BONE, { size: 0.16, contrast: 0.55, seed: 18 }), BONE_LIGHT, {
    size: 0.085,
    width: 0.018,
    seed: 22,
  }),
  BONE_DARK,
  { level: -0.28, soft: 0.6 },
);

const membranePaint = paint((_p, _n, s) => {
  const edge = s[1] < 0.13 || s[1] > 0.88;
  const rib = Math.abs(((s[0] * 9.0) % 1) - 0.5) < 0.055;
  return edge ? MEMBRANE_LIGHT : rib ? ICE_DARK : MEMBRANE;
});

export default function build() {
  const b = createBuilder({ name: "frostWyrm", detail: 1.15, paintSize: 2048 });

  // One grounded root and a complete, animation-friendly skeleton.
  const hips = b.joint("hips", { at: [0, 1.34, -0.05], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.34, -0.46],
      [0, 1.48, 0.02],
      [0, 1.62, 0.48],
      [0, 1.72, 0.84],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", count: 3 },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.72, 0.84],
      [0, 1.96, 1.02],
      [0, 2.25, 1.08],
      [0, 2.52, 1.2],
    ]),
    { parent: spine.joints[spine.joints.length - 1], names: ["neck1", "neck2", "neck3"], role: "neck", count: 3 },
  );
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 2.65, 1.26], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.12 }),
    aim: head.local({ forward: 0.52, down: 0.16 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.36, -0.36],
      [0, 1.22, -0.82],
      [0, 1.08, -1.3],
      [0, 0.92, -1.78],
      [0, 0.72, -2.14],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail", count: 4 },
  );

  const hindLegs = [];
  const foreLegs = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hind = b.chain(
      `hindLeg${side}`,
      polyline([
        [s * 0.42, 1.34, -0.18],
        [s * 0.67, 0.88, -0.32],
        [s * 0.72, 0.3, 0.02],
        [s * 0.76, 0.12, 0.33],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg", count: 3 },
    );
    hindLegs.push(hind);

    const fore = b.chain(
      `foreLeg${side}`,
      polyline([
        [s * 0.42, 1.74, 0.62],
        [s * 0.77, 1.24, 0.82],
        [s * 1.08, 0.63, 1.0],
        [s * 1.18, 0.12, 1.14],
      ]),
      { parent: spine.joints[spine.joints.length - 1], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "arm", count: 3 },
    );
    foreLegs.push(fore);
  }

  const wings = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${side}`,
      polyline([
        [s * 0.46, 1.88, 0.48],
        [s * 1.04, 2.25, 0.24],
        [s * 1.72, 2.42, -0.04],
        [s * 2.18, 2.1, -0.4],
        [s * 2.46, 1.64, -0.82],
      ]),
      { parent: spine.joints[spine.joints.length - 1], names: [`wingRoot${side}`, `wingElbow${side}`, `wingWrist${side}`, `wingTip${side}`], role: "wing", count: 4 },
    );
    wings.push(wing);
    const trailing = polyline([
      [s * 0.46, 1.88, 0.48],
      [s * 0.92, 1.55, -0.02],
      [s * 1.48, 1.35, -0.54],
      [s * 1.98, 1.22, -0.94],
      [s * 2.46, 1.64, -0.82],
    ]);
    b.membrane(wing, trailing, {
      color: membranePaint,
      thickness: 0.018,
      rows: 4,
      cols: 7,
      scallop: 0.12,
      name: `tatteredWing${side}`,
      group: "wings",
    });
    b.sweep(wing, [0.032, 0.018], {
      color: BONE_LIGHT,
      section: { ngon: 5 },
      caps: "flat",
      group: "wingBones",
      name: `wingArmature${side}`,
    });
    // The torn trailing edge is deliberately stepped, like old battle damage.
    const tearPoints: [number, number, number][] = [
      [s * 1.0, 1.55, -0.08],
      [s * 1.5, 1.35, -0.58],
      [s * 2.0, 1.22, -1.0],
    ];
    for (const [i, p] of tearPoints.entries()) {
      b.spike(p, [0, -1, -0.1], 0.16 + i * 0.01, 0.014, {
        color: MEMBRANE_LIGHT,
        bone: wing.joints[Math.min(2, wing.joints.length - 1)],
      });
    }
  }

  // Main body and tail: broad heroic ribs with a heavy pale belly.
  const bodyPath = catmull([
    [0, 1.32, -0.52],
    [0, 1.48, 0.02],
    [0, 1.63, 0.48],
    [0, 1.73, 0.84],
  ]);
  const body = b.sweep(bodyPath, (t) => 0.35 - t * 0.1, {
    bone: [hips, ...spine.joints],
    color: icePaint,
    section: { ngon: 8 },
    sectors: [[115, 245, BONE_LIGHT]],
    group: "body",
    name: "armoredBody",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.23, 0), BONE_SHADE, {
      bone: hips,
      at: hips.local({ left: s * 0.3, up: -0.02, back: 0.02 }),
      scale: [1.15, 0.8, 1.25],
      flat: true,
      name: `pelvisPlate${s > 0 ? "L" : "R"}`,
      group: "armor",
    });
  }
  const tailTube = b.sweep(tail, (t) => 0.18 * (1 - t) + 0.028, {
    color: icePaint,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "taperedTail",
  });
  const neckTube = b.sweep(neck, (t) => 0.2 - t * 0.095, {
    color: icePaint,
    section: { ngon: 7 },
    group: "neck",
    name: "icyNeck",
  });
  for (const at of [0.12, 0.32, 0.52, 0.72, 0.9]) {
    b.spike(neckTube.at(at), neckTube.at(at), 0.105 - at * 0.04, 0.026, {
      color: BONE_LIGHT,
      group: "neckRidges",
    });
  }

  for (const [i, at] of [0.06, 0.19, 0.32, 0.45, 0.58, 0.71, 0.84, 0.94].entries()) {
    b.spike(body.at(at), body.at(at), 0.11 + (1 - at) * 0.08, 0.034, {
      color: BONE_LIGHT,
      name: `dorsalRidge${i}`,
      group: "ridges",
    });
  }
  for (const at of [0.06, 0.2, 0.34, 0.48, 0.62, 0.76, 0.9]) {
    b.spike(tailTube.at(at), tailTube.at(at), 0.09 * (1 - at) + 0.035, 0.022, { color: BONE_LIGHT, group: "tailRidges" });
  }
  for (const at of [0.14, 0.32, 0.5, 0.68, 0.84]) {
    const rib = b.sweep(body.line(at * 0.8), [0.018, 0.008], { color: BONE_SHADE, caps: "flat", group: "ribs" });
    void rib;
  }

  // Limb bones are intentionally angular and visibly assembled.
  for (const [index, leg] of [...hindLegs, ...foreLegs].entries()) {
    b.sweep(leg, (t) => 0.115 - t * 0.045, {
      color: index % 2 ? BONE_SHADE : icePaint,
      section: { ngon: 6 },
      group: "limbs",
      name: `limbBone${index}`,
    });
    const foot = leg.tip;
    b.sweep(polyline([foot!.at, foot!.local({ forward: 0.22, down: 0.015 })]), [0.07, 0.035], {
      color: BONE_DARK,
      section: { ngon: 5 },
      group: "feet",
      name: `footPad${index}`,
    });
    for (const toe of [-1, 0, 1]) {
      const toeBase = foot!.local({ left: toe * 0.055, forward: 0.12, down: 0.02 });
      b.spike(toeBase, [0, -0.22, 0.35], 0.18, 0.018, { color: CLAW, group: "talons" });
    }
  }

  // Skull, jaw and crown are separate pieces so the jaw can animate open.
  const skull = b.part(new THREE.IcosahedronGeometry(0.34, 1), icePaint, {
    bone: head,
    at: head.local({ forward: 0.1, up: 0.03 }),
    scale: [1.08, 0.9, 1.42],
    flat: true,
    name: "skull",
    group: "head",
  });
  void skull;
  const snout = b.part(new THREE.ConeGeometry(0.22, 0.58, 6), BONE_LIGHT, {
    bone: head,
    at: head.local({ forward: 0.43, down: 0.01 }),
    dir: head.local({ forward: 1 }),
    scale: [1, 1, 1],
    name: "upperSnout",
    group: "head",
  });
  const lowerJaw = b.sweep(polyline([jaw.at, jaw.local({ forward: 0.48, down: 0.03 })]), [0.14, 0.07], {
    bone: jaw,
    color: BONE_SHADE,
    section: { ngon: 6 },
    caps: { start: "flat", end: "point" },
    name: "lowerJaw",
    group: "jaw",
  });
  void snout;
  void lowerJaw;
  b.part(new THREE.BoxGeometry(0.3, 0.07, 0.34), MOUTH, {
    bone: jaw,
    at: jaw.local({ forward: 0.18, up: 0.01 }),
    name: "openMouth",
    group: "jaw",
  });

  // Crown horns and cheek spikes.
  for (const s of [1, -1]) {
    const cheek = b.spike(head.local({ left: s * 0.22, back: 0.02, up: -0.03 }), [s * 0.65, 0.35, -0.12], 0.3, 0.065, {
      color: BONE_LIGHT,
      bone: head,
      group: "horns",
      name: `cheekHorn${s > 0 ? "L" : "R"}`,
    });
    void cheek;
    b.spike(head.local({ left: s * 0.13, back: 0.04, up: 0.24 }), [s * 0.25, 0.84, -0.15], 0.38, 0.075, {
      color: BONE_LIGHT,
      bone: head,
      group: "horns",
      name: `crownHorn${s > 0 ? "L" : "R"}`,
    });
    b.spike(head.local({ left: s * 0.27, back: -0.01, up: 0.13 }), [s * 0.72, 0.58, -0.12], 0.24, 0.045, {
      color: BONE_SHADE,
      bone: head,
      group: "horns",
      name: `templeSpike${s > 0 ? "L" : "R"}`,
    });
  }

  // Ice-blue eyes and painted brow plates.
  for (const s of [1, -1]) {
    const eye = glow(
      b.part(new THREE.SphereGeometry(0.065, 10, 6), EYE, {
        bone: head,
        at: head.local({ left: s * 0.2, forward: 0.43, up: 0.09 }),
        name: `glacierEye${s > 0 ? "L" : "R"}`,
        group: "face",
      }),
      2.4,
    );
    void eye;
    b.sweep(polyline([
      head.local({ left: s * 0.27, forward: 0.17, up: 0.18 }),
      head.local({ left: s * 0.12, forward: 0.32, up: 0.2 }),
    ]), [0.028, 0.012], { color: BONE_DARK, bone: head, caps: "flat", group: "brows" });
  }

  // Teeth are little readable ice shards in both jaws.
  for (const s of [1, -1]) {
    for (const i of [0, 1, 2]) {
      b.spike(jaw.local({ left: s * (0.06 + i * 0.065), forward: 0.2 + i * 0.09, up: 0.08 }), [0, -1, 0.05], 0.12, 0.018, {
        color: CLAW,
        bone: jaw,
        group: "teeth",
      });
      b.spike(head.local({ left: s * (0.06 + i * 0.065), forward: 0.2 + i * 0.09, down: 0.04 }), [0, 1, 0.05], 0.1, 0.014, {
        color: CLAW,
        bone: head,
        group: "teeth",
      });
    }
  }

  // Frost rune plates and shoulder armor break up the large surfaces.
  const runeGeo = new THREE.OctahedronGeometry(0.07, 0);
  const runePoints: [number, number, number][] = [
    [0, 1.7, 0.48],
    [0, 1.88, 0.73],
    [0, 2.08, 0.92],
  ];
  for (const [i, p] of runePoints.entries()) {
    glow(
      b.part(runeGeo, RUNE, {
        bone: neck.joints[Math.min(i, neck.joints.length - 1)],
        at: p,
        name: `frostRune${i}`,
        group: "magic",
      }),
      1.8,
    );
  }
  for (const s of [1, -1]) {
    for (const i of [0, 1, 2]) {
      const shoulderHit = body.at(0.52 + i * 0.08, s * 72);
      b.stick(new THREE.CylinderGeometry(0.1 - i * 0.015, 0.08 - i * 0.012, 0.035, 6), BONE_SHADE, shoulderHit, {
        embed: 0.35,
        spin: s * 20,
        name: `shoulderPlate${s > 0 ? "L" : "R"}${i}`,
        group: "armor",
      });
    }
  }

  // A few hanging ice shards sell the cold, ruined creature silhouette.
  const chestSurface = b.surface(body);
  for (const [i, hit] of chestSurface.scatter(13, {
    rng: rng(67),
    minDist: 0.12,
    filter: (h) => h.n.y < -0.12 && h.at.z > -0.1,
  }).entries()) {
    b.spike(hit, [0, -1, 0], 0.06 + (i % 3) * 0.025, 0.014, { color: ICE, group: "hangingIce" });
  }


  return b.root;
}
