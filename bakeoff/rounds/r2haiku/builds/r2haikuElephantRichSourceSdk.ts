import * as THREE from "three";
import { createBuilder, mix, noise, paint, smoothstep } from "../../../../src/index";

export const meta = {
  name: "African elephant calf",
  description:
    "A gentle African elephant calf in a dusty slate-grey wrinkled hide, with huge fan ears, a curling trunk, stubby tusks, lashed brown eyes, a tufted tail and padded feet.",
};

const SLATE = "#5f6065";
const DUST = "#8e6b5d";
const PINK = "#e3a9a3";
const IVORY = "#efe6d0";
const NAIL = "#ece4d2";
const INK = "#1d1714";
const TUFT = "#4a3a31";

export default function africanElephantCalf() {
  const b = createBuilder({ name: "african-elephant-calf", detail: 1, paintSize: 1024 });

  // Wrinkled, dusty hide: cloudy slate blotches with fine contour creases.
  const hide = paint((p) => {
    const cloud = smoothstep(0.4, 0.6, noise(p, 0.12, 3));
    const base = mix(SLATE, DUST, cloud);
    const crease = Math.abs(noise(p, 0.035, 9) - 0.5);
    return mix(base, "#3f3d40", smoothstep(0.025, 0.005, crease) * 0.6);
  });

  // Inner ears flush pink where they face the head.
  const ear = (side: number) => paint((p, n) => (n.x * side < -0.35 ? PINK : hide));

  // Root and spine: the body is skinned along this chain.
  b.joint("root", { at: [0, 0.8, -0.4] });
  const spine = b.chain("spine", [[0, 0.8, -0.4], [0, 0.8, 0], [0, 0.86, 0.3]], {
    names: ["spine1", "spine2"],
    role: "spine",
  });

  b.loft(
    [
      { at: [0, 0.74, -0.5], w: 0.42, h: 0.5 },
      { at: [0, 0.76, -0.1], w: 0.52, h: 0.56 },
      { at: [0, 0.78, 0.2], w: 0.5, h: 0.56 },
      { at: [0, 0.8, 0.38], w: 0.36, h: 0.44 },
    ],
    { name: "body", color: hide, bone: spine, sides: 12 },
  );

  // Neck and head.
  const neck = b.chain("neck", [[0, 0.86, 0.3], [0, 0.98, 0.6]], {
    names: ["neck1"],
    parent: "spine2",
    role: "neck",
  });
  b.sweep(neck, (t) => 0.12 - 0.02 * t, { name: "neck", color: hide, sides: 10 });

  b.joint("head", { parent: "neck1", at: [0, 1.0, 0.6], dir: [0, 0.2, 1] });
  b.part(new THREE.SphereGeometry(0.16, b.segments(14), b.segments(10)), hide, {
    name: "head",
    bone: "head",
    at: [0, 1.0, 0.6],
    scale: [0.95, 1, 1.08],
  });

  // Separate lower jaw, hinged at the front of the head.
  b.joint("jaw", { parent: "head", at: [0, 0.93, 0.66], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.11, 0.035, 0.16), hide, {
    name: "jaw",
    bone: "jaw",
    at: [0, 0.915, 0.74],
  });

  // Fan-shaped ears, flaring outward.
  const EAR: [number, number][] = [
    [-0.02, 0.13],
    [0.07, 0.12],
    [0.11, 0.05],
    [0.12, -0.04],
    [0.09, -0.12],
    [0, -0.14],
    [-0.08, -0.1],
    [-0.1, -0.02],
    [-0.09, 0.07],
  ];
  for (const side of [1, -1]) {
    b.extrude(EAR, {
      name: side > 0 ? "earL" : "earR",
      at: [side * 0.19, 0.98, 0.6],
      x: [0, 0, 1],
      y: [side * 0.3, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      bone: "head",
      color: ear(side),
    });
  }

  // Curious trunk curling forward and down, then up at the finger tip.
  const trunk = b.chain(
    "trunk",
    [
      [0, 0.97, 0.6],
      [0, 0.9, 0.86],
      [0, 0.78, 0.98],
      [0.05, 0.7, 0.96],
    ],
    { names: ["trunk1", "trunk2", "trunk3"], parent: "head", role: "tentacle" },
  );
  b.sweep(trunk, (t) => 0.075 - 0.04 * t, { name: "trunk", color: hide, sides: 10 });
  b.part(new THREE.SphereGeometry(0.03, b.segments(8), b.segments(6)), hide, {
    name: "trunkTip",
    bone: "trunk3",
    at: trunk.at(1).at,
  });

  // Stubby baby tusks.
  for (const side of [1, -1])
    b.spike([side * 0.07, 0.93, 0.73], [side * 0.15, -0.25, 1], 0.1, 0.014, {
      name: side > 0 ? "tuskL" : "tuskR",
      color: IVORY,
      bone: "head",
    });

  // Kind brown eyes with long lashes and a catchlight.
  for (const side of [1, -1]) {
    const x = side * 0.13;
    b.part(new THREE.SphereGeometry(0.022, b.segments(8), b.segments(6)), INK, {
      name: side > 0 ? "eyeL" : "eyeR",
      bone: "head",
      at: [x, 1.03, 0.695],
    });
    b.part(new THREE.SphereGeometry(0.006, b.segments(5), b.segments(4)), "#ffffff", {
      bone: "head",
      at: [x + side * 0.008, 1.04, 0.715],
    });
    for (let k = 0; k < 5; k++) {
      const dx = (k - 2) * 0.012;
      b.rod(
        [x + dx, 1.05, 0.7],
        [x + dx * 1.6 + side * 0.006, 1.075, 0.712],
        0.0025,
        { name: "lash", color: INK, bone: "head" },
      );
    }
  }

  // Four stout legs: hip, knee, ankle as one chain each, with a padded foot and pale toenails.
  const LEGS = [
    { id: "FL", x: 1, front: true },
    { id: "FR", x: -1, front: true },
    { id: "HL", x: 1, front: false },
    { id: "HR", x: -1, front: false },
  ];
  for (const { id, x, front } of LEGS) {
    const hip: [number, number, number] = front ? [x * 0.17, 0.72, 0.18] : [x * 0.17, 0.7, -0.3];
    const knee: [number, number, number] = front ? [x * 0.17, 0.4, 0.2] : [x * 0.19, 0.38, -0.27];
    const ankle: [number, number, number] = front ? [x * 0.17, 0.1, 0.22] : [x * 0.17, 0.1, -0.24];
    const leg = b.chain(`leg${id}`, [hip, knee, ankle], {
      names: [`upper${id}`, `lower${id}`, `foot${id}`],
      parent: front ? "spine2" : "spine1",
      role: "leg",
    });
    b.sweep(leg, (t) => 0.1 - 0.035 * t, { name: `leg${id}`, color: hide, sides: 10 });

    const [ax, , az] = ankle;
    const bone = `foot${id}`;
    b.part(new THREE.SphereGeometry(0.088, b.segments(10), b.segments(8)), hide, {
      name: `pad${id}`,
      bone,
      at: [ax, 0.047, az + 0.02],
      scale: [1, 0.55, 1.12],
    });
    for (const dx of [-0.04, 0, 0.04])
      b.part(new THREE.SphereGeometry(0.02, b.segments(6), b.segments(4)), NAIL, {
        name: "toenail",
        bone,
        at: [ax + dx, 0.03, az + 0.105],
        scale: [1, 0.8, 0.7],
      });
  }

  // Little tufted tail.
  const tail = b.chain("tail", [[0, 0.8, -0.5], [0, 0.76, -0.64], [0, 0.68, -0.7]], {
    names: ["tail1", "tail2"],
    parent: "root",
    role: "tail",
  });
  b.sweep(tail, (t) => 0.028 - 0.014 * t, { name: "tail", color: hide, sides: 6 });
  const tip = tail.at(1).at;
  b.part(new THREE.SphereGeometry(0.035, b.segments(8), b.segments(6)), TUFT, {
    name: "tailTuft",
    bone: "tail2",
    at: tip,
  });
  for (const dir of [
    [0, -1, -0.2],
    [0.4, -1, 0],
    [-0.4, -1, 0],
  ])
    b.spike(tip, dir, 0.05, 0.008, { name: "tuftHair", color: TUFT, bone: "tail2" });

  return b.root;
}
