import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { coil, gearTrain, metal, panelled } from "../kits/clockwork";
import { glow } from "../kits/glow";

const IRON = metal("iron", { polish: 0.35, tarnish: 0.35, seed: 11 });
const STEEL = metal("steel", { polish: 0.6, tarnish: 0.18, seed: 12 });
const BRASS = metal("brass", { polish: 0.72, tarnish: 0.16, seed: 13 });
const BLUED = metal("blued", { polish: 0.45, tarnish: 0.1, seed: 14 });
const BASE = panelled(IRON, { size: 0.13, aspect: 0.75, rivets: 0.045 });
const RED = "#c84c36";
const RED_DARK = "#70251f";
const BLACK = "#171b22";
const RUBBER = "#272b30";
const BULB = "#fff0a6";
const WARM = "#ffc45b";

export const meta = {
  name: "Articulated Desk Lamp",
  description:
    "A spring-balanced Anglepoise desk lamp with a weighted clockwork base, articulated arm hinges, visible tension coils, cable, and a glowing bulb in its tilting shade.",
};

export default function build() {
  const b = createBuilder({ name: "articulatedDeskLamp", detail: 0.82, paintSize: 1024 });
  const baseSwivel = b.joint("baseSwivel", {
    at: [0, 0.18, 0],
    dir: [0, 1, 0],
    role: "hinge",
    group: "base",
  });

  // A broad, weighted cast base, turntable, and a little exposed gear train make the mechanism read immediately.
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.205, 0.045],
      [0.22, 0.085],
      [0.205, 0.13],
      [0.16, 0.17],
      [0.09, 0.185],
      [0, 0.185],
    ],
    { at: [0, 0, 0], bone: baseSwivel, segments: 14, color: BASE, name: "weightedBase", group: "base" },
  );
  b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.035, 12), IRON, {
    bone: baseSwivel,
    at: [0, 0.197, 0],
    name: "turntable",
    group: "base",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.078, 0.09, 0.05, 10), BRASS, {
    bone: baseSwivel,
    at: [0, 0.238, 0],
    name: "swivelCap",
    group: "base",
    flat: true,
  });

  const drive = gearTrain(b, {
    at: [0, 0.245, 0.118],
    axis: [0, 0, 1],
    module: 0.0065,
    thickness: 0.014,
    style: "solid",
    spin: "baseGear",
    bone: baseSwivel,
    group: "base",
    gears: [
      { teeth: 20, spokes: 5, bore: 0.012, color: BRASS },
      { teeth: 11, from: 0, angle: 112, spokes: 4, bore: 0.008, color: STEEL },
    ],
  });
  drive.spin(9);

  const bolts = b.ring(baseSwivel, { count: 8, radius: 0.166, fromDeg: 22.5 });
  for (const bolt of bolts.items)
    b.part(new THREE.SphereGeometry(0.015, 7, 4), BRASS, {
      at: bolt,
      bone: baseSwivel,
      name: `baseBolt${bolt.i}`,
      group: "base",
      flat: true,
    });
  b.part(new THREE.BoxGeometry(0.08, 0.038, 0.012), WARM, {
    at: [0, 0.105, 0.215],
    bone: baseSwivel,
    name: "makerBadge",
    group: "base",
  });

  // The lower arm chain gives the rig a recognisable shoulder and elbow. The shade gets its own hinge below.
  const arm = b.chain(
    "arm",
    [
      [0, 0.29, 0.02],
      [0, 0.82, 0.25],
    ],
    {
      parent: baseSwivel,
      names: ["lowerArm", "elbow"],
      role: "arm",
      group: "arm",
    },
  );
  const lowerArm = arm.joints[0];
  const elbow = arm.tip!;
  const shadeTilt = b.joint("shadeTilt", {
    parent: elbow,
    at: [0, 1.125, 0.5],
    dir: [0, 0.25, -1],
    role: "hinge",
    group: "shade",
  });

  const lowerA = [0, 0.29, 0.02] as const;
  const lowerB = [0, 0.82, 0.25] as const;
  const upperA = lowerB;
  const upperB = [0, 1.125, 0.5] as const;

  // Twin square-section rails keep the characteristic parallel-arm silhouette.
  for (const side of [-1, 1] as const) {
    b.rod([side * 0.065, lowerA[1], lowerA[2]], [side * 0.065, lowerB[1], lowerB[2]], 0.018, {
      bone: lowerArm,
      color: STEEL,
      section: "box",
      skin: "rigid",
      name: `lowerRail${side}`,
      group: "arm",
    });
    b.rod([side * 0.065, upperA[1], upperA[2]], [side * 0.065, upperB[1], upperB[2]], 0.018, {
      bone: elbow,
      color: STEEL,
      section: "box",
      skin: "rigid",
      name: `upperRail${side}`,
      group: "arm",
    });
  }
  // Cross links at each hinge and the little triangular lift links beside the springs.
  b.rod([-0.095, lowerA[1], lowerA[2]], [0.095, lowerA[1], lowerA[2]], 0.014, {
    bone: lowerArm,
    color: BRASS,
    section: "box",
    name: "baseCrossLink",
    group: "arm",
  });
  b.rod([-0.095, lowerB[1], lowerB[2]], [0.095, lowerB[1], lowerB[2]], 0.014, {
    bone: elbow,
    color: BRASS,
    section: "box",
    name: "elbowCrossLink",
    group: "arm",
  });
  b.rod([-0.085, upperB[1], upperB[2]], [0.085, upperB[1], upperB[2]], 0.014, {
    bone: elbow,
    color: BRASS,
    section: "box",
    name: "shadeCrossLink",
    group: "arm",
  });

  // Two honest coil springs on each arm, with short metal links into their mounts.
  for (const side of [-1, 1] as const) {
    const lowerSpringA = [side * 0.11, lowerA[1] + 0.012, lowerA[2] + 0.022] as const;
    const lowerSpringB = [side * 0.11, lowerB[1] - 0.012, lowerB[2] - 0.022] as const;
    b.sweep(coil(lowerSpringA, lowerSpringB, 0.026, 13), 0.006, {
      bone: lowerArm,
      color: BLUED,
      sides: 6,
      caps: "round",
      name: `lowerSpring${side}`,
      group: "springs",
    });
    b.rod([side * 0.11, lowerA[1] - 0.03, lowerA[2] - 0.01], lowerSpringA, 0.009, {
      bone: lowerArm,
      color: BRASS,
      name: `lowerSpringLink${side}`,
      group: "springs",
    });

    const upperSpringA = [side * 0.11, upperA[1] + 0.012, upperA[2] + 0.018] as const;
    const upperSpringB = [side * 0.11, upperB[1] - 0.012, upperB[2] - 0.018] as const;
    b.sweep(coil(upperSpringA, upperSpringB, 0.022, 10), 0.0055, {
      bone: elbow,
      color: BLUED,
      sides: 6,
      caps: "round",
      name: `upperSpring${side}`,
      group: "springs",
    });
    b.rod([side * 0.11, upperA[1] + 0.025, upperA[2] + 0.01], upperSpringA, 0.008, {
      bone: elbow,
      color: BRASS,
      name: `upperSpringLink${side}`,
      group: "springs",
    });
  }

  // The black power cable stays just in front of each arm and drops behind the weighted base.
  b.rod([0.105, 0.2, 0.08], [0.105, lowerA[1], lowerA[2] + 0.045], 0.008, {
    bone: baseSwivel,
    color: RUBBER,
    name: "baseCable",
    group: "cable",
  });
  b.rod([0.105, lowerA[1], lowerA[2] + 0.045], [0.105, lowerB[1], lowerB[2] + 0.045], 0.008, {
    bone: lowerArm,
    color: RUBBER,
    name: "lowerCable",
    group: "cable",
  });
  b.rod([0.105, upperA[1], upperA[2] + 0.045], [0.105, upperB[1], upperB[2] + 0.035], 0.008, {
    bone: elbow,
    color: RUBBER,
    name: "upperCable",
    group: "cable",
  });

  // Low-poly hinge pins make all four articulation points readable in the flex shots.
  for (const [name, at, bone, radius] of [
    ["lowerHingePin", lowerA, lowerArm, 0.046],
    ["elbowHingePin", lowerB, elbow, 0.052],
    ["shadeHingePin", upperB, shadeTilt, 0.043],
  ] as const) {
    b.part(new THREE.CylinderGeometry(radius, radius, 0.13, 10), BRASS, {
      at,
      bone,
      dir: [1, 0, 0],
      name,
      group: "hinges",
      flat: true,
    });
  }

  // A faceted spun shade, with an inner dark lip and a separately emissive bulb.
  b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.19, -0.19],
      [0.205, -0.215],
      [0.18, -0.225],
      [0.045, -0.038],
      [0, -0.038],
    ],
    {
      at: shadeTilt.at,
      axis: shadeTilt.axis,
      segments: 12,
      smoothing: 0,
      color: RED,
      bone: shadeTilt,
      name: "conicalShade",
      group: "shade",
    },
  );
  b.part(new THREE.TorusGeometry(0.194, 0.012, 6, 16), RED_DARK, {
    at: shadeTilt.local([0, -0.215, 0]),
    bone: shadeTilt,
    dir: shadeTilt.axis,
    axis: "z",
    name: "shadeRim",
    group: "shade",
    flat: true,
  });
  const bulb = b.part(new THREE.SphereGeometry(0.068, 10, 6), BULB, {
    at: shadeTilt.local([0, -0.075, 0]),
    bone: shadeTilt,
    name: "glowingBulb",
    group: "shade",
  });
  glow(bulb, 2.2);
  b.part(new THREE.CylinderGeometry(0.032, 0.038, 0.055, 8), BRASS, {
    at: shadeTilt.local([0, -0.01, 0]),
    bone: shadeTilt,
    dir: shadeTilt.axis,
    name: "bulbSocket",
    group: "shade",
    flat: true,
  });

  // A small switch tab on the rear of the base and an insulating cable entry.
  b.part(new THREE.BoxGeometry(0.035, 0.07, 0.025), BLACK, {
    at: [0, 0.22, -0.18],
    bone: baseSwivel,
    name: "powerSwitch",
    group: "base",
  });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 8), RUBBER, {
    at: [0, 0.185, -0.21],
    bone: baseSwivel,
    dir: [0, 0, 1],
    name: "cableGrommet",
    group: "base",
    flat: true,
  });

  // Keep the authoring deterministic even though the design itself is deliberately ordered, not random.
  rng(23);
  return b.root;
}
