import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { polyline } from "../src/path";
import { coil, gearTrain, metal } from "../kits/clockwork";
import { glow } from "../kits/glow";

const SKIN = "#d99a70";
const SKIN_LIGHT = "#f1b58c";
const HAIR = "#7b3f26";
const BEARD = "#eee1c5";
const HAT = "#6f3d9a";
const HAT_LIGHT = "#9b62c3";
const TUNIC = "#2d8f78";
const TUNIC_LIGHT = "#55b89b";
const BELT = "#5d3326";
const BOOT = "#6c432b";
const BRASS = metal("brass", { tarnish: 0.3, polish: 0.5, seed: 11 });
const COPPER = metal("copper", { tarnish: 0.25, polish: 0.45, seed: 12 });
const STEEL = metal("steel", { tarnish: 0.18, polish: 0.45, seed: 13 });
const IRON = metal("iron", { tarnish: 0.5, polish: 0.18, seed: 14 });
const DARK = "#241c2b";
const EYE = "#fbf3d5";
const GLOW_BLUE = "#62d6ff";
const GLOW_ORANGE = "#ffae42";
const CLOTH_GOLD = "#e3b34e";

export const meta = {
  name: "Gnome Tinkerer",
  description: "A whimsical low-poly gnome engineer with a gadget-packed backpack, tools, gears, and a glowing antenna.",
  style: "whimsical low-poly mix",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer", detail: 0.72 });

  // Skeleton first: compact heroic gnome proportions, with all limbs separated for rigging.
  const hips = b.joint("hips", { at: [0, 0.67, 0], dir: [0, 1, 0], role: "spine", group: "body" });
  const spine = b.chain("spine", polyline([[0, 0.67, 0], [0, 0.89, 0], [0, 1.15, 0]]), {
    parent: hips,
    names: ["pelvis", "chest", "shoulders"],
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", polyline([[0, 1.15, 0], [0, 1.32, 0.015]]), {
    parent: spine.tip!,
    names: ["neck", "neckTop"],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.48, 0.025],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.39, 0.12],
    dir: [0, -0.15, 1],
    role: "jaw",
    group: "head",
  });

  const armL = b.chain("armL", polyline([[0.25, 1.13, 0], [0.43, 1.1, 0.01], [0.59, 1.08, 0.05]]), {
    parent: spine.tip!,
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
    group: "limbs",
  });
  const armR = b.chain("armR", polyline([[-0.25, 1.13, 0], [-0.43, 1.1, 0.01], [-0.59, 1.08, 0.05]]), {
    parent: spine.tip!,
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
    group: "limbs",
  });
  const legL = b.chain("legL", polyline([[0.12, 0.67, 0], [0.16, 0.37, 0.01], [0.16, 0.1, 0.06]]), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    group: "limbs",
  });
  const legR = b.chain("legR", polyline([[-0.12, 0.67, 0], [-0.16, 0.37, 0.01], [-0.16, 0.1, 0.06]]), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
  });

  // Main body: a chunky faceted tunic with a lighter front belly and a golden hem.
  b.sweep(spine, (t) => 0.205 + t * 0.045, {
    section: { ngon: 7 },
    smooth: false,
    color: TUNIC,
    bands: [[0.72, TUNIC_LIGHT], [0.94, TUNIC]],
    sectors: [[-54, 54, TUNIC_LIGHT]],
    name: "tunic",
    group: "body",
  });
  b.sweep(neck, [0.12, 0.1], { section: { ngon: 7 }, color: SKIN, name: "neckSkin", group: "head" });

  // Legs and boots.
  for (const [side, leg] of [[1, legL], [-1, legR]] as const) {
    b.sweep(leg, (t) => 0.095 - t * 0.025, {
      section: { ngon: 6 },
      smooth: false,
      color: TUNIC,
      bands: [[0.58, TUNIC_LIGHT]],
      name: `leg${side > 0 ? "L" : "R"}Pants`,
      group: "limbs",
    });
    b.part(new THREE.BoxGeometry(0.17, 0.105, 0.28), BOOT, {
      bone: leg.tip!,
      at: [side * 0.16, 0.055, 0.11],
      flat: true,
      name: `boot${side > 0 ? "L" : "R"}`,
      group: "limbs",
    });
    b.part(new THREE.BoxGeometry(0.185, 0.035, 0.29), CLOTH_GOLD, {
      bone: leg.tip!,
      at: [side * 0.16, 0.11, 0.11],
      flat: true,
      name: `bootTrim${side > 0 ? "L" : "R"}`,
      group: "limbs",
    });
  }

  // Arms, mitten hands, and three separated digits on each hand.
  for (const [side, arm] of [[1, armL], [-1, armR]] as const) {
    const suffix = side > 0 ? "L" : "R";
    b.sweep(arm, (t) => 0.072 - t * 0.023, {
      section: { ngon: 6 },
      smooth: false,
      color: TUNIC,
      bands: [[0.66, SKIN_LIGHT]],
      name: `arm${suffix}Sleeve`,
      group: "limbs",
    });
    b.part(new THREE.SphereGeometry(0.085, 7, 5), SKIN_LIGHT, {
      frame: arm.tip!,
      flat: true,
      name: `hand${suffix}`,
      group: "limbs",
    });
    const wrist = arm.tip!.at;
    for (const [i, dz] of [-0.035, 0.0, 0.035].entries()) {
      const finger = [side * (0.59 + 0.035 * (i === 1 ? 1 : 0)), 1.075 + (i === 1 ? 0.012 : -0.006), 0.105 + dz];
      b.rod(wrist, finger, 0.015, { color: SKIN, bone: arm.tip!, name: `finger${suffix}${i}`, group: "limbs" });
    }
  }

  // Belt and oversized buckle.
  b.part(new THREE.TorusGeometry(0.215, 0.024, 6, 12), BELT, {
    bone: spine.joints[1],
    at: [0, 0.9, 0],
    flat: true,
    name: "belt",
    group: "body",
  });
  b.part(new THREE.BoxGeometry(0.12, 0.12, 0.035), BRASS, {
    bone: spine.joints[1],
    at: [0, 0.9, 0.225],
    flat: true,
    name: "buckle",
    group: "body",
  });
  for (const z of [0.21, 0.22, 0.23]) {
    b.part(new THREE.SphereGeometry(0.017, 6, 4), CLOTH_GOLD, {
      bone: spine.joints[1],
      at: [0, 0.99, z],
      flat: true,
      name: "tunicButton",
      group: "body",
    });
  }

  // Head, expressive ears, hat, eyes and beard.
  b.part(new THREE.SphereGeometry(0.265, 9, 7), SKIN, {
    bone: head,
    frame: head,
    flat: true,
    name: "headVolume",
    group: "head",
  });
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.09, 7, 5), SKIN_LIGHT, {
      bone: head,
      at: head.local({ right: side * 0.245, up: 0.02 }),
      flat: true,
      name: `ear${side > 0 ? "L" : "R"}`,
      group: "head",
    });
    const eyeAt = head.local({ right: side * 0.095, forward: 0.222, up: 0.055 });
    b.part(new THREE.SphereGeometry(0.052, 8, 6), EYE, {
      bone: head,
      at: eyeAt,
      flat: true,
      name: `eyeWhite${side > 0 ? "L" : "R"}`,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.023, 7, 5), DARK, {
      bone: head,
      at: head.local({ right: side * 0.095, forward: 0.269, up: 0.056 }),
      flat: true,
      name: `pupil${side > 0 ? "L" : "R"}`,
      group: "head",
    });
    b.part(new THREE.TorusGeometry(0.067, 0.009, 5, 10), BRASS, {
      bone: head,
      at: eyeAt,
      dir: [0, 0, 1],
      flat: true,
      name: `goggle${side > 0 ? "L" : "R"}`,
      group: "head",
    });
  }
  b.part(new THREE.SphereGeometry(0.075, 8, 6), SKIN_LIGHT, {
    bone: head,
    at: head.local({ forward: 0.255, up: -0.025 }),
    flat: true,
    name: "roundNose",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.21, 8, 6), BEARD, {
    bone: jaw,
    at: [0, 1.325, 0.145],
    flat: true,
    name: "beardMass",
    group: "head",
  });
  for (const side of [1, -1]) {
    b.spike(head.local({ right: side * 0.07, forward: 0.21, up: -0.03 }), [0, -1, 0.08], 0.18, 0.09, {
      color: BEARD,
      bone: jaw,
      name: `beardTuft${side > 0 ? "L" : "R"}`,
      group: "head",
    });
  }
  b.part(new THREE.SphereGeometry(0.045, 7, 5), HAIR, {
    bone: jaw,
    at: head.local({ right: 0.085, forward: 0.24, up: -0.015 }),
    flat: true,
    name: "moustacheL",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.045, 7, 5), HAIR, {
    bone: jaw,
    at: head.local({ right: -0.085, forward: 0.24, up: -0.015 }),
    flat: true,
    name: "moustacheR",
    group: "head",
  });
  b.part(new THREE.CylinderGeometry(0.255, 0.255, 0.045, 9), HAT_LIGHT, {
    bone: head,
    at: [0, 1.7, 0.01],
    flat: true,
    name: "hatBrim",
    group: "head",
  });
  b.part(new THREE.ConeGeometry(0.21, 0.42, 8), HAT, {
    bone: head,
    at: [0, 1.91, 0.01],
    flat: true,
    name: "hatCone",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.045, 7, 5), CLOTH_GOLD, {
    bone: head,
    at: [0, 2.14, 0.01],
    flat: true,
    name: "hatPom",
    group: "head",
  });
  b.part(new THREE.TorusGeometry(0.19, 0.012, 5, 12), CLOTH_GOLD, {
    bone: head,
    at: [0, 1.72, 0.01],
    flat: true,
    name: "hatBand",
    group: "head",
  });

  // Backpack shell, stitched harness, side canisters, and a small gear train.
  b.part(new THREE.BoxGeometry(0.39, 0.5, 0.23), IRON, {
    bone: hips,
    at: [0, 1.0, -0.18],
    flat: true,
    name: "backpackShell",
    group: "backpack",
  });
  b.part(new THREE.BoxGeometry(0.29, 0.16, 0.035), COPPER, {
    bone: hips,
    at: [0, 0.9, 0.18],
    flat: true,
    name: "frontToolbox",
    group: "backpack",
  });
  for (const side of [1, -1]) {
    b.rod([side * 0.15, 1.23, 0.02], [side * 0.2, 1.18, -0.28], 0.018, { color: BELT, bone: spine.tip!, name: `harness${side > 0 ? "L" : "R"}`, group: "backpack" });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.28, 8), COPPER, {
      bone: hips,
      at: [side * 0.235, 1.0, -0.18],
      flat: true,
      name: `canister${side > 0 ? "L" : "R"}`,
      group: "backpack",
    });
    b.part(new THREE.TorusGeometry(0.075, 0.012, 5, 10), BRASS, {
      bone: hips,
      at: [side * 0.235, 1.14, -0.18],
      flat: true,
      name: `canisterCap${side > 0 ? "L" : "R"}`,
      group: "backpack",
    });
  }
  b.sweep(coil([0.19, 1.17, -0.08], [0.34, 1.14, -0.2], 0.022, 4), 0.008, {
    color: STEEL,
    caps: "round",
    name: "leftCoil",
    group: "backpack",
  });
  b.sweep(coil([-0.19, 1.17, -0.08], [-0.34, 1.14, -0.2], 0.022, 4), 0.008, {
    color: STEEL,
    caps: "round",
    name: "rightCoil",
    group: "backpack",
  });
  const gears = gearTrain(b, {
    at: [0, 1.0, -0.31],
    axis: [0, 0, 1],
    module: 0.012,
    spin: "backGear",
    bone: hips,
    group: "backpack",
    style: "solid",
    gears: [
      { teeth: 18, spokes: 5, color: BRASS },
      { teeth: 10, angle: 115, spokes: 4, color: COPPER },
      { teeth: 12, on: 1, shift: 0.035, holes: 5, color: STEEL },
    ],
  });
  gears.spin(10);

  // Antenna and glowing gadget bulb on the pack.
  b.rod([0, 1.27, -0.2], [0, 1.49, -0.2], 0.012, { color: BRASS, bone: hips, name: "antennaStem", group: "backpack" });
  const bulb = b.part(new THREE.SphereGeometry(0.045, 8, 6), GLOW_ORANGE, {
    bone: hips,
    at: [0, 1.52, -0.2],
    flat: true,
    name: "antennaBulb",
    group: "backpack",
  });
  glow(bulb, 2.2);
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 7, 5), GLOW_BLUE, {
      bone: hips,
      at: [side * 0.11, 1.08, 0.035],
      flat: true,
      name: `toolLight${side > 0 ? "L" : "R"}`,
      group: "backpack",
    });
  }

  // One oversized hand tool: a copper magnifier with a blue glass lens.
  const toolHand = armR.tip!.at;
  b.rod(toolHand, [-0.73, 1.09, 0.16], 0.018, { color: BRASS, bone: armR.tip!, name: "magnifierHandle", group: "tool" });
  b.part(new THREE.TorusGeometry(0.115, 0.018, 6, 12), BRASS, {
    bone: armR.tip!,
    at: [-0.77, 1.1, 0.17],
    dir: [0, 1, 0],
    flat: true,
    name: "magnifierFrame",
    group: "tool",
  });
  const lens = b.part(new THREE.CircleGeometry(0.095, 12), GLOW_BLUE, {
    bone: armR.tip!,
    at: [-0.77, 1.1, 0.17],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
    name: "magnifierLens",
    group: "tool",
  });
  glow(lens, 1.1);

  // A chunky wrench in the opposite hand, with a warm indicator bead.
  const wrenchHand = armL.tip!.at;
  b.rod(wrenchHand, [0.76, 1.1, 0.14], 0.02, { color: STEEL, bone: armL.tip!, name: "wrenchHandle", group: "tool" });
  b.part(new THREE.TorusGeometry(0.075, 0.022, 6, 10), STEEL, {
    bone: armL.tip!,
    at: [0.81, 1.1, 0.15],
    dir: [1, 0, 0],
    flat: true,
    name: "wrenchJaw",
    group: "tool",
  });
  const wrenchBead = b.part(new THREE.SphereGeometry(0.026, 7, 5), GLOW_ORANGE, {
    bone: armL.tip!,
    at: [0.67, 1.1, 0.14],
    flat: true,
    name: "wrenchBead",
    group: "tool",
  });
  glow(wrenchBead, 1.5);

  return b.root;
}
