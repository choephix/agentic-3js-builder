import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { catmull } from "../src/path";
import { paint, scales } from "../src/paint";

export const meta = {
  name: "Galapagos giant tortoise",
  description:
    "A low-poly Galapagos giant tortoise standing with its neck stretched forward: a domed scute-plated shell with a raised front arch and a flat plastron, a long wrinkled neck, a hooked horn beak, four columnar scaly legs with clawed feet.",
  style: "low-poly",
  commit: "b816db2",
};

// Palette
const SHELL = ["#8a8442", "#7a7238", "#9a8a4c"];
const SHELL_EDGE = "#3f3b22";
const RIDGE = "#8f8650";
const RIM = "#9a7436";
const PLASTRON = ["#e0cf98", "#cfbd82"];
const SEAM = "#6a5632";
const LEG = ["#6d6443", "#7a6f4a", "#5e5636"];
const LEG_EDGE = "#2f2a18";
const HEAD = ["#5f5d3e", "#6d6a46"];
const HEAD_EDGE = "#2f2c19";
const NECK = "#7c7a55";
const NECK_WRINKLE = "#4a4730";
const THROAT = "#c3b68a";
const BEAK = "#c2a858";
const BEAK_DARK = "#3d3320";
const CLAW = "#e8dfc2";
const EYE = "#17120c";
const LID = "#4a4a33";
const IRIS = "#c58a2a";
const SHINE = "#fff6dc";
const EAR = "#4b4a2f";

// Paints
const shellPaint = scales(SHELL, SHELL_EDGE, { size: 0.16, width: 0.11 });
const plastronPaint = scales(PLASTRON, SEAM, { size: 0.14, width: 0.12 });
const legPaint = scales(LEG, LEG_EDGE, { size: 0.055, width: 0.2 });
const headPaint = scales(HEAD, HEAD_EDGE, { size: 0.03, width: 0.2 });
const neckPaint = paint((_p, _n, s) => ((s[0] * 16) % 1 < 0.28 ? NECK_WRINKLE : NECK));

export default function build() {
  const b = createBuilder({ name: "galapagosTortoise" });

  // Skeleton: root at the body centre, a spine running fore-aft, neck and tail off it.
  const hips = b.joint("hips", { at: [0, 0.4, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.4, -0.36], [0, 0.42, 0.02], [0, 0.46, 0.38]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.46, 0.38], [0, 0.58, 0.56], [0, 0.72, 0.73], [0, 0.8, 0.84]]), {
    parent: spine.joints[1],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 0.8, 0.84], aim: [0, 0.76, 1.0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.79, 0.93], aim: [0, 0.77, 1.02], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.33, -0.44], [0, 0.29, -0.6], [0, 0.26, -0.7]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });

  // Shell: a faceted dome on the hips, flat plastron beneath, raised front arch (the saddleback gate),
  // a pygal plate hanging at the back and a row of low ridge scutes along the top.
  b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), shellPaint, {
    bone: hips,
    at: [0, 0.2, 0],
    scale: [0.4, 0.46, 0.55],
    flat: true,
    group: "shell",
    name: "shell.dome",
  });
  b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), shellPaint, {
    bone: hips,
    at: [0, 0.46, 0.42],
    scale: [0.19, 0.2, 0.2],
    flat: true,
    group: "shell",
    name: "shell.arch",
  });
  b.part(new THREE.SphereGeometry(1, 8, 4), shellPaint, {
    bone: hips,
    at: [0, 0.24, -0.5],
    scale: [0.14, 0.06, 0.07],
    flat: true,
    group: "shell",
    name: "shell.pygal",
  });
  b.part(new THREE.SphereGeometry(1, 12, 3, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastronPaint, {
    bone: hips,
    at: [0, 0.2, 0],
    scale: [0.38, 0.06, 0.52],
    flat: true,
    group: "shell",
    name: "shell.plastron",
  });
  for (const z of [-0.2, 0, 0.2]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), RIDGE, {
      bone: hips,
      at: [0, 0.2 + 0.46 * Math.sqrt(1 - (z / 0.55) ** 2) - 0.01, z],
      scale: [0.05, 0.022, 0.07],
      flat: true,
      group: "shell",
    });
  }
  const ring: number[][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ring.push([0.405 * Math.sin(a), 0.205, 0.56 * Math.cos(a)]);
  }
  b.sweep(catmull(ring, { closed: true }), 0.02, {
    bone: hips,
    sides: 6,
    smooth: false,
    color: RIM,
    group: "shell",
    name: "shell.rim",
  });

  // Neck: wrinkled bands, pale throat on the underside, and thin fold ridges across it.
  b.sweep(neck, [0.075, 0.05], {
    color: neckPaint,
    sectors: [[120, 240, THROAT]],
    sides: 8,
    smooth: false,
    group: "neck",
    name: "neck.tube",
  });
  for (const t of [0.14, 0.3, 0.46, 0.62, 0.78]) {
    const fold = b.ring(neck.at(t), { count: 10, radius: 0.075 - 0.025 * t + 0.001 }).items;
    b.sweep(catmull(fold.map((f) => f.at), { closed: true }), 0.005, {
      sides: 4,
      smooth: false,
      color: NECK_WRINKLE,
      group: "neck",
      name: "neck.fold",
    });
  }

  // Head: flat-topped skull, hooked horn beak with a separate lower jaw, eyes on the sides.
  b.part(new THREE.SphereGeometry(1, 8, 6), headPaint, {
    bone: head,
    at: [0, 0.83, 0.88],
    scale: [0.068, 0.064, 0.11],
    flat: true,
    group: "head",
    name: "head.skull",
  });
  const upperBeak: OutlinePoint[] = [
    [0, 0.02],
    [0.045, 0],
    [0.1, -0.012],
    [0.128, -0.022, "sharp"],
    [0.112, 0.012],
    [0.06, 0.036],
    [0, 0.045],
  ];
  b.extrude(upperBeak, {
    at: [0, 0.8, 0.96],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.004,
    color: BEAK,
    bone: head,
    group: "head",
    name: "beak.upper",
  });
  b.part(new THREE.SphereGeometry(1, 5, 3), BEAK_DARK, {
    bone: head,
    at: [0, 0.812, 1.075],
    scale: [0.03, 0.014, 0.018],
    flat: true,
    group: "head",
    name: "beak.tip",
  });
  const lowerBeak: OutlinePoint[] = [
    [0, 0],
    [0.095, -0.004],
    [0.105, 0.01, "sharp"],
    [0, 0.022],
  ];
  b.extrude(lowerBeak, {
    at: [0, 0.775, 0.955],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.003,
    color: BEAK,
    bone: jaw,
    group: "head",
    name: "beak.lower",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), THROAT, {
    bone: jaw,
    at: [0, 0.765, 0.9],
    scale: [0.045, 0.03, 0.07],
    flat: true,
    group: "head",
    name: "head.chin",
  });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      catmull([
        [s * 0.052, 0.8, 0.97],
        [s * 0.058, 0.792, 0.92],
        [s * 0.062, 0.79, 0.86],
      ]),
      0.0045,
      { sides: 4, smooth: false, color: BEAK_DARK, bone: head, group: "head", name: `mouth.${side}` },
    );
    b.part(new THREE.SphereGeometry(0.0045, 4, 3), BEAK_DARK, {
      bone: head,
      at: [s * 0.01, 0.826, 1.035],
      flat: true,
      group: "head",
      name: `nostril.${side}`,
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), LID, {
      bone: head,
      at: [s * 0.062, 0.845, 0.9],
      flat: true,
      group: "head",
      name: `eye.socket.${side}`,
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), IRIS, {
      bone: head,
      at: [s * 0.07, 0.845, 0.9],
      flat: true,
      group: "head",
      name: `eye.iris.${side}`,
    });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), EYE, {
      bone: head,
      at: [s * 0.077, 0.845, 0.9],
      flat: true,
      group: "head",
      name: `eye.pupil.${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0025, 4, 3), SHINE, {
      bone: head,
      at: [s * 0.08, 0.852, 0.91],
      flat: true,
      group: "head",
      name: `eye.shine.${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), LID, {
      bone: head,
      at: [s * 0.05, 0.874, 0.9],
      scale: [0.02, 0.008, 0.024],
      flat: true,
      group: "head",
      name: `brow.${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 5, 4), EAR, {
      bone: head,
      at: [s * 0.066, 0.826, 0.84],
      scale: [0.003, 0.014, 0.014],
      flat: true,
      group: "head",
      name: `ear.${side}`,
    });
  }

  // Legs: four columnar limbs from the shell, knee bulges, five-clawed front feet and four-clawed hind feet.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const front = b.chain(
      `legF${side}`,
      catmull([
        [s * 0.3, 0.36, 0.3],
        [s * 0.36, 0.2, 0.36],
        [s * 0.34, 0.09, 0.4],
        [s * 0.33, 0.06, 0.44],
      ]),
      { parent: spine.joints[1], names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`, `footF${side}`], role: "leg" },
    );
    b.sweep(front, [0.095, 0.05], { sides: 7, smooth: false, color: legPaint, group: "legs", name: `legF.${side}` });
    b.part(new THREE.SphereGeometry(1, 7, 5), legPaint, {
      bone: front.joints[1],
      at: [s * 0.36, 0.2, 0.36],
      scale: [0.105, 0.095, 0.105],
      flat: true,
      group: "legs",
      name: `knee.F.${side}`,
    });
    const frontFoot = front.joints[3];
    b.part(new THREE.SphereGeometry(1, 8, 5), legPaint, {
      bone: frontFoot,
      at: [s * 0.33, 0.042, 0.44],
      scale: [0.105, 0.04, 0.12],
      flat: true,
      group: "legs",
      name: `foot.F.${side}`,
    });
    for (const dx of [-0.06, -0.03, 0, 0.03, 0.06]) {
      const z = 0.44 + 0.12 * Math.sqrt(1 - (dx / 0.105) ** 2) - 0.012;
      b.spike([s * 0.33 + dx, 0.035, z], [0, -0.18, 1], 0.05, 0.013, { color: CLAW, bone: frontFoot });
    }

    const hind = b.chain(
      `legH${side}`,
      catmull([
        [s * 0.3, 0.34, -0.3],
        [s * 0.36, 0.2, -0.34],
        [s * 0.34, 0.09, -0.36],
        [s * 0.33, 0.06, -0.44],
      ]),
      { parent: hips, names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`, `footH${side}`], role: "leg" },
    );
    b.sweep(hind, [0.105, 0.055], { sides: 7, smooth: false, color: legPaint, group: "legs", name: `legH.${side}` });
    b.part(new THREE.SphereGeometry(1, 7, 5), legPaint, {
      bone: hind.joints[1],
      at: [s * 0.36, 0.2, -0.34],
      scale: [0.115, 0.1, 0.115],
      flat: true,
      group: "legs",
      name: `knee.H.${side}`,
    });
    const hindFoot = hind.joints[3];
    b.part(new THREE.SphereGeometry(1, 8, 5), legPaint, {
      bone: hindFoot,
      at: [s * 0.33, 0.042, -0.44],
      scale: [0.11, 0.04, 0.12],
      flat: true,
      group: "legs",
      name: `foot.H.${side}`,
    });
    for (const dx of [-0.045, -0.015, 0.015, 0.045]) {
      const z = -0.44 - 0.12 * Math.sqrt(1 - (dx / 0.11) ** 2) + 0.012;
      b.spike([s * 0.33 + dx, 0.035, z], [0, -0.18, -1], 0.045, 0.012, { color: CLAW, bone: hindFoot });
    }
  }

  // Tail: short and stubby, hanging from the back of the shell.
  b.sweep(tail, [0.04, 0.018], { sides: 6, smooth: false, color: legPaint, group: "tail", name: "tail" });

  return b.root;
}
