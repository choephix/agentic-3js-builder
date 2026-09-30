import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { catmull } from "../src/path";
import { cel, INK } from "../kits/toon";

const RED = cel("#b8322e", "#691d2a");
const CREAM = cel("#f2e1bf", "#c68c83");
const FIN = cel("#c64135", "#76202b");
const SPINE = cel("#d8b68b", "#80614f");
const GOLD = cel("#efa33b", "#9b431c");
const DARK = INK;

export const meta = {
  name: "Red Lionfish · Astra",
  description: "A stylized red lionfish with striped armor, fanned rays, venomous dorsal spines, and a fully articulated swimming rig.",
};

export default function build() {
  const b = createBuilder({ name: "redLionfishAstra", detail: 0.8 });

  // Skeleton first: the body runs from tail to face, with separate chains for every animated fin.
  const bodyPath = catmull([
    [0, 0.33, -0.12],
    [0, 0.34, -0.06],
    [0, 0.345, 0.015],
    [0, 0.35, 0.085],
    [0, 0.35, 0.14],
  ]);
  const bodyRoot = b.joint("bodyRoot", { at: [0, 0.33, -0.12], dir: [0, 0, 1], role: "spine" });
  const body = b.chain("body", bodyPath, {
    parent: bodyRoot,
    count: 4,
    names: ["bodyBase", "bodyMid", "bodyFront", "bodyHead", "bodyTip"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.33, -0.115],
    [0, 0.33, -0.165],
    [0, 0.33, -0.205],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: body.joints[0],
    count: 2,
    names: ["tailBase", "tailMid", "tailTip"],
    role: "tail",
  });

  const head = b.joint("head", {
    parent: body.joints[body.joints.length - 1],
    at: [0, 0.35, 0.14],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.31, 0.17],
    dir: [0, -0.18, 1],
    role: "jaw",
  });

  const dorsalPoints = Array.from({ length: 8 }, (_, i) => [0, 0.402, -0.105 + i * 0.035] as const);
  const dorsal = b.chain("dorsal", dorsalPoints, {
    parent: body.joints[2],
    count: 7,
    names: ["dorsal0", "dorsal1", "dorsal2", "dorsal3", "dorsal4", "dorsal5", "dorsal6", "dorsal7"],
    role: "fan",
  });

  const pectoralRays: Array<Array<{ side: number; chain: Chain }>> = [];
  for (const side of [1, -1]) {
    const sideRays: Array<{ side: number; chain: Chain }> = [];
    const tips = [
      [0.19, 0.39, 0.105],
      [0.225, 0.365, 0.07],
      [0.245, 0.34, 0.025],
      [0.23, 0.31, -0.025],
      [0.19, 0.29, -0.075],
    ];
    for (let i = 0; i < tips.length; i++) {
      const [x, y, z] = tips[i];
      const root: [number, number, number] = [side * 0.055, 0.35, 0.045];
      const mid: [number, number, number] = [side * (0.095 + i * 0.012), y + 0.006, 0.045 + (z - 0.045) * 0.38];
      const path = catmull([root, mid, [side * x, y, z]]);
      const chain = b.chain(`pect${side > 0 ? "L" : "R"}${i}`, path, {
        parent: body.joints[2],
        count: 2,
        names: [`pect${side > 0 ? "L" : "R"}${i}Base`, `pect${side > 0 ? "L" : "R"}${i}Mid`, `pect${side > 0 ? "L" : "R"}${i}Tip`],
        role: "fan",
      });
      sideRays.push({ side, chain });
      b.sweep(chain, [0.009, 0.002], { color: SPINE, caps: "point", section: { ngon: 5 } });
    }
    pectoralRays.push(sideRays);
  }

  // Main striped skin. Broad bands keep the lionfish's high-contrast vertical pattern readable.
  b.sweep(body, (t) => 0.062 - 0.014 * t, {
    color: RED,
    bands: [
      [0.16, CREAM],
      [0.29, RED],
      [0.43, CREAM],
      [0.57, RED],
      [0.71, CREAM],
      [0.84, RED],
    ],
    section: { ngon: 8 },
    shift: (t) => [0, -0.004 + 0.006 * t],
  });
  b.sweep(tail, (t) => 0.036 - 0.022 * t, {
    bands: [[0.45, CREAM], [0.72, RED]],
    color: RED,
    section: { ngon: 7 },
    caps: "round",
  });

  b.part(
    new THREE.SphereGeometry(1, b.segments(10), b.segments(7)),
    RED,
    { bone: head, at: [0, 0.35, 0.145], scale: [0.07, 0.062, 0.072], flat: true },
  );
  b.part(new THREE.SphereGeometry(1, b.segments(8), b.segments(5)), CREAM, {
    bone: head,
    at: [0, 0.327, 0.198],
    scale: [0.052, 0.038, 0.042],
    flat: true,
  });
  b.rod(jaw.at, [0, 0.292, 0.242], 0.014, { bone: jaw, color: CREAM, caps: "round" });

  // Eyes and short gill marks sit on both cheeks; the lower jaw remains a separate hinge.
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.017, b.segments(7), b.segments(5)), GOLD, {
      bone: head,
      at: [side * 0.053, 0.376, 0.176],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.007, b.segments(6), b.segments(4)), DARK, {
      bone: head,
      at: [side * 0.059, 0.379, 0.187],
      flat: true,
    });
    b.rod([side * 0.057, 0.323, 0.115], [side * 0.064, 0.365, 0.098], 0.004, { bone: head, color: DARK });
    b.rod([side * 0.059, 0.315, 0.107], [side * 0.066, 0.352, 0.091], 0.0025, { bone: head, color: FIN });
  }

  // Five independent pectoral rays with scalloped membranes between them.
  for (const sideRays of pectoralRays) {
    for (let i = 0; i < sideRays.length - 1; i++) {
      b.membrane(sideRays[i].chain, sideRays[i + 1].chain, {
        color: FIN,
        thickness: 0.004,
        rows: 2,
        scallop: 0.2,
        bone: sideRays[i].chain,
      });
    }
  }

  // Dorsal fan: long separated venom spines, joined only by frayed scalloped membranes.
  const dorsalBases: THREE.Vector3[] = [];
  const dorsalTips: THREE.Vector3[] = [];
  const dorsalLengths = [0.10, 0.135, 0.16, 0.175, 0.155, 0.13, 0.105, 0.08];
  for (let i = 0; i < dorsalLengths.length; i++) {
    const base = dorsal.at(i / (dorsalLengths.length - 1));
    const len = dorsalLengths[i];
    const tip = base.at.clone().add(new THREE.Vector3(0, len, -0.014));
    dorsalBases.push(base.at.clone());
    dorsalTips.push(tip);
    b.spike(base, [0, 1, -0.1], len, 0.0065, { bone: base.bone, color: SPINE, caps: "point" });
    if (i < dorsalLengths.length - 1) {
      const next = dorsal.at((i + 1) / (dorsalLengths.length - 1));
      const nextTip = next.at.clone().add(new THREE.Vector3(0, dorsalLengths[i + 1], -0.014));
      b.membrane([base.at, tip], [next.at, nextTip], {
        color: FIN,
        thickness: 0.0035,
        rows: 2,
        scallop: 0.26,
        bone: dorsal,
      });
    }
  }

  // Rounded caudal fin, held by the last tail bone so it flexes in the rig.
  b.slab(
    [
      [0, 0.315, -0.205],
      [0.04, 0.282, -0.208],
      [0.06, 0.255, -0.21],
      [0.048, 0.305, -0.212],
      [0.065, 0.385, -0.212],
      [0.035, 0.415, -0.21],
      [0, 0.402, -0.208],
      [-0.035, 0.415, -0.21],
      [-0.065, 0.385, -0.212],
      [-0.048, 0.305, -0.212],
      [-0.06, 0.255, -0.21],
      [-0.04, 0.282, -0.208],
    ],
    { color: FIN, thickness: 0.008, bone: tail.joints[tail.joints.length - 1] },
  );

  // Feathery supra-orbital tentacles, each with little side barbs.
  for (const side of [1, -1]) {
    const root = head.moved([side * 0.035, 0.05, 0.02]);
    const tentacle = b.sprout(
      `tentacle${side > 0 ? "L" : "R"}`,
      root,
      catmull([
        root,
        [side * 0.045, 0.45, 0.155],
        [side * 0.055, 0.485, 0.135],
      ]),
      [0.008, 0.0025],
      { count: 2, role: "tentacle", names: [`tent${side > 0 ? "L" : "R"}Base`, `tent${side > 0 ? "L" : "R"}Mid`, `tent${side > 0 ? "L" : "R"}Tip`], color: SPINE, caps: "point" },
    );
    for (const t of [0.36, 0.62, 0.82]) {
      const at = tentacle.sweep.at(t);
      b.spike(at, at, 0.018, 0.002, { color: SPINE, caps: "point" });
      b.spike(at, at, 0.014, 0.0015, { color: SPINE, caps: "point" });
    }
  }

  return b.root;
}
