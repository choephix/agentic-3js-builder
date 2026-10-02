import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { cel, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

const BASALT = cel("#384451", "#17212c", { threshold: 0.18 });
const BASALT_2 = cel("#56616b", "#252d37", { threshold: 0.2 });
const BASALT_EDGE = inkLines(BASALT_2, { levels: [0.18], axis: [0, 1, 0], width: 0.07 });
const CHARCOAL = cel("#202934", "#0d1118", { threshold: 0.12 });
const GOLD = cel("#e7a83e", "#874e1d", { threshold: 0.22 });
const EMBER = "#ff5a1f";
const EMBER_HOT = "#ffd36a";
const RUNE = "#ff8a2b";

export const meta = {
  name: "Basalt Ember Golem",
  description: "A broad-shouldered lava golem assembled from faceted basalt plates, molten seams, and glowing runic details.",
  style: "Genshin Impact",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "lavaGolem", detail: 1 });

  // Skeleton first: a neutral, readable rest pose with every appendage separated.
  const hips = b.joint("hips", { at: [0, 1.25, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.28, 0],
      [0, 1.62, 0.02],
      [0, 1.96, 0.03],
      [0, 2.18, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest", "shoulderBase"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.18, 0.02],
      [0, 2.37, 0.04],
      [0, 2.53, 0.08],
    ]),
    { parent: spine.tip!, names: ["neck", "head", "headTip"], role: "neck" },
  );
  const head = neck.tip!;
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.40, 0.28],
    aim: [0, 2.35, 0.65],
    role: "jaw",
  });

  const armChains: typeof spine[] = [];
  const legChains: typeof spine[] = [];
  const fingerChains: typeof spine[] = [];
  const toeChains: typeof spine[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      polyline([
        [s * 0.50, 2.04, 0.02],
        [s * 0.78, 1.88, 0.02],
        [s * 0.98, 1.58, 0.12],
        [s * 1.13, 1.46, 0.22],
      ]),
      {
        parent: spine.tip!,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "arm",
      },
    );
    armChains.push(arm);

    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.30, 1.28, 0],
        [s * 0.40, 0.82, 0.02],
        [s * 0.43, 0.33, 0.10],
        [s * 0.43, 0.20, 0.31],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        role: "leg",
        contact: [s * 0.43, 0.20, 0.31],
      },
    );
    legChains.push(leg);

    // Three separated, spread digits per hand.
    const hand = arm.tip!;
    for (let d = 0; d < 3; d++) {
      const spread = (d - 1) * 0.12;
      const finger = b.chain(
        `finger${side}${d + 1}`,
        polyline([
          hand.at,
          [s * (1.16 + d * 0.02), 1.40 + Math.abs(d - 1) * 0.025, 0.26 + spread],
          [s * (1.23 + d * 0.025), 1.35 + Math.abs(d - 1) * 0.04, 0.29 + spread * 1.4],
        ]),
        { parent: hand, names: [`digit${side}${d + 1}`, `tip${side}${d + 1}`], role: "digit" },
      );
      fingerChains.push(finger);
    }
    for (let d = 0; d < 2; d++) {
      const toe = b.chain(
        `toe${side}${d + 1}`,
        polyline([
          [s * 0.43, 0.16, 0.57],
          [s * (0.37 + d * 0.12), 0.13, 0.70],
          [s * (0.35 + d * 0.14), 0.12, 0.80],
        ]),
        { parent: leg.tip!, names: [`toe${side}${d + 1}`, `toeTip${side}${d + 1}`], role: "digit" },
      );
      toeChains.push(toe);
    }
  }

  // Faceted body masses: oversized heroic shoulders, chest, and head.
  b.sweep(spine, (t) => 0.43 + 0.08 * Math.sin(Math.PI * t), {
    color: BASALT,
    section: { ngon: 8 },
    caps: "round",
    name: "basaltCore",
  });
  b.sweep(neck, [0.27, 0.22], {
    color: BASALT_2,
    section: { ngon: 7 },
    caps: "round",
    name: "basaltNeck",
  });

  b.part(new THREE.IcosahedronGeometry(0.55, 1), BASALT_EDGE, {
    bone: spine.tip!,
    at: [0, 1.93, 0.02],
    scale: [1.15, 0.82, 0.78],
    flat: true,
    name: "chestPlate",
  });
  b.part(new THREE.BoxGeometry(0.82, 0.42, 0.60), CHARCOAL, {
    bone: hips,
    at: [0, 1.25, -0.01],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    flat: true,
    name: "pelvisPlate",
  });
  b.part(new THREE.IcosahedronGeometry(0.40, 1), BASALT_EDGE, {
    bone: head,
    at: [0, 2.58, 0.12],
    scale: [1.08, 1.15, 0.90],
    flat: true,
    name: "skull",
  });
  b.part(new THREE.BoxGeometry(0.44, 0.20, 0.36), CHARCOAL, {
    bone: jaw,
    at: [0, 2.34, 0.35],
    flat: true,
    name: "lowerJaw",
  });

  // Heavy limb sweeps and plated extremities.
  for (let i = 0; i < armChains.length; i++) {
    const s = i === 0 ? 1 : -1;
    const arm = armChains[i];
    b.sweep(arm, (t) => 0.17 - t * 0.045, {
      color: BASALT,
      section: { ngon: 6 },
      caps: "round",
      name: `armStone${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.48, 0.32, 0.46), BASALT_2, {
      bone: arm.joints[0],
      at: arm.joints[0].at,
      flat: true,
      name: `shoulderPauldron${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.IcosahedronGeometry(0.22, 0), BASALT_EDGE, {
      bone: arm.tip!,
      at: arm.tip!.at,
      scale: [1.1, 0.92, 1.2],
      flat: true,
      name: `fist${s > 0 ? "L" : "R"}`,
    });
  }
  for (let i = 0; i < legChains.length; i++) {
    const s = i === 0 ? 1 : -1;
    const leg = legChains[i];
    b.sweep(leg, (t) => 0.20 - t * 0.06, {
      color: BASALT,
      section: { ngon: 6 },
      caps: "round",
      name: `legStone${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.40, 0.25, 0.62), CHARCOAL, {
      bone: leg.tip!,
      at: [s * 0.43, 0.125, 0.34],
      flat: true,
      name: `foot${s > 0 ? "L" : "R"}`,
    });
  }
  for (let i = 0; i < fingerChains.length; i++) {
    b.sweep(fingerChains[i], [0.055, 0.014], {
      color: BASALT_2,
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
      name: `fingerStone${i}`,
    });
  }
  for (let i = 0; i < toeChains.length; i++) {
    b.sweep(toeChains[i], [0.045, 0.012], {
      color: BASALT_2,
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
      name: `toeStone${i}`,
    });
  }

  // Gold ornament gives the otherwise dark basalt a Genshin-style silhouette.
  b.part(new THREE.TorusGeometry(0.46, 0.028, 6, 12), GOLD, {
    bone: hips,
    at: [0, 1.39, 0],
    rotation: [0, 0, 0],
    flat: true,
    name: "waistGoldRing",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.10, 0.48, 0.07), GOLD, {
      bone: spine.tip!,
      at: [s * 0.46, 1.92, 0.31],
      rotation: [0, 0, s * 18],
      flat: true,
      name: `chestGoldTrim${s > 0 ? "L" : "R"}`,
    });
  }

  // Molten seams: readable orange cracks run across each plate and glow independently.
  const crack = (a: THREE.Vector3 | number[], z: THREE.Vector3 | number[], name: string) =>
    glow(b.rod(a, z, 0.018, { color: EMBER, name }), 1.8);
  crack([-0.07, 1.42, 0.45], [0.02, 1.82, 0.47], "seamChestLeft");
  crack([0.11, 1.78, 0.47], [0.03, 2.12, 0.40], "seamChestRight");
  crack([-0.28, 2.15, 0.26], [-0.02, 2.39, 0.24], "seamNeck");
  crack([-0.16, 2.59, 0.48], [0.12, 2.62, 0.47], "seamBrow");
  for (const s of [1, -1]) {
    crack([s * 0.50, 1.97, 0.24], [s * 0.72, 1.90, 0.22], `seamShoulder${s > 0 ? "L" : "R"}`);
    crack([s * 0.78, 1.80, 0.18], [s * 0.96, 1.58, 0.26], `seamArm${s > 0 ? "L" : "R"}`);
    crack([s * 0.31, 1.16, 0.24], [s * 0.42, 0.90, 0.20], `seamThigh${s > 0 ? "L" : "R"}`);
    crack([s * 0.43, 0.68, 0.22], [s * 0.43, 0.40, 0.28], `seamShin${s > 0 ? "L" : "R"}`);
  }
  crack([0.07, 1.50, -0.42], [-0.10, 1.94, -0.41], "seamBackSpine");
  crack([-0.34, 2.00, -0.31], [0.34, 2.00, -0.31], "seamBackShoulders");

  // Eyes and mouth core burn hot enough to read at a distance.
  for (const s of [1, -1]) {
    const eyeSocket = b.part(new THREE.SphereGeometry(0.105, 8, 6), CHARCOAL, {
      bone: head,
      at: [s * 0.17, 2.60, 0.48],
      scale: [1, 1.2, 0.55],
      flat: true,
      name: `eyeSocket${s > 0 ? "L" : "R"}`,
    });
    void eyeSocket;
    glow(
      b.part(new THREE.SphereGeometry(0.052, 8, 5), EMBER_HOT, {
        bone: head,
        at: [s * 0.17, 2.60, 0.535],
        scale: [1, 1.35, 0.45],
        flat: true,
        name: `moltenEye${s > 0 ? "L" : "R"}`,
      }),
      2.2,
    );
  }
  glow(b.rod([-0.14, 2.38, 0.54], [0.14, 2.38, 0.54], 0.022, { color: RUNE, name: "moltenMouth" }), 2);

  // A few faceted crown shards and glowing rune blocks complete the silhouette.
  for (const s of [1, -1]) {
    b.spike([s * 0.22, 2.90, 0.10], [s * 0.18, 0.34, -0.02], 0.28, 0.10, {
      color: BASALT_2,
      bone: head,
      name: `crownShard${s > 0 ? "L" : "R"}`,
    });
    glow(
      b.part(new THREE.BoxGeometry(0.045, 0.16, 0.025), RUNE, {
        at: [s * 0.22, 2.03, 0.43],
        rotation: [0, 0, s * 20],
        flat: true,
        name: `chestRune${s > 0 ? "L" : "R"}`,
      }),
      1.5,
    );
  }

  return b.root;
}
