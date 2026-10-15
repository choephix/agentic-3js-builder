import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { catmull } from "../../../../src/path";

export const meta = {
  name: "African Bush Elephant",
  description:
    "A towering low-poly adult African bush elephant: faceted wrinkled grey hide dusted red-brown at the feet, huge Africa-shaped ears, long curved ivory tusks and a ringed trunk, fully rigged.",
  style: "low-poly",
  commit: "88fc1f0",
};

const GREY_A = "#8d8780";
const GREY_B = "#746e68";
const DEEP = "#4a4440";
const BELLY = "#a39a92";
const DUST = "#a67c58";
const IVORY = "#e8dcc0";
const IVORY_BASE = "#7a6a58";
const NAIL = "#d2c7b0";
const DARK = "#231e1c";
const AMBER = "#c98a2b";
const MOUTH = "#9a6a66";
const EAR_IN = "#b08c85";

export default function build() {
  const b = createBuilder({ name: "africanElephant" });

  // Hide: cloudy grey, creases from cell borders, lighter belly, dust on the lower legs.
  const skin = paint((p, n) => {
    const m = noise(p, 0.9, 5);
    const base = mix(GREY_A, GREY_B, m);
    const c = cells(p, 0.3, 2);
    const crease = 1 - smoothstep(0.02, 0.12, c.d2 - c.d1);
    const lit = mix(BELLY, base, smoothstep(-0.6, 0.5, n.y));
    const creased = mix(lit, DEEP, crease * 0.5);
    const dust = smoothstep(0.9, 0.0, p.y) * (0.55 + 0.4 * noise(p, 0.25, 8));
    return mix(creased, DUST, Math.min(dust, 0.9));
  });

  // Trunk: skin with dark wrinkle rings along its length.
  const trunkSkin = paint((p, n, s) => {
    const base = skin.at(p, n);
    const ring = smoothstep(0.55, 0.85, Math.sin(s[0] * 120));
    return mix(base, DEEP, ring * 0.7);
  });

  // Ear: pinker toward the inside, creased veins.
  const earSkin = paint((p, n, s) => {
    const c = cells(p, 0.25, 4);
    const crease = 1 - smoothstep(0.02, 0.1, c.d2 - c.d1);
    const base = mix(GREY_B, EAR_IN, smoothstep(0.2, 1.1, s[0]) * 0.8);
    return mix(mix(base, GREY_A, noise(p, 0.5, 3) * 0.4), DEEP, crease * 0.4);
  });

  // ---- Skeleton and body --------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 2.4, -0.85] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.4, -0.85],
      [0, 2.45, -0.2],
      [0, 2.5, 0.3],
      [0, 2.45, 0.75],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  b.sweep(
    spine,
    (t): [number, number] => {
      const s = Math.sin(Math.PI * (0.12 + 0.76 * t));
      return [0.6 + 0.22 * s, 0.74 + 0.2 * s];
    },
    { color: skin, sides: 10, smooth: false, shift: [0, -0.1] },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 2.45, 0.75],
      [0, 2.5, 1.25],
    ],
    { parent: spine.joints[3], names: ["neck1", "neckTip"], role: "neck" },
  );
  b.sweep(neck, [0.6, 0.52], { color: skin, sides: 10, smooth: false });

  // Haunches and shoulders: heavy masses on their bones.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 9, 7), skin, {
      bone: spine.joints[0],
      at: [s * 0.62, 2.2, -0.85],
      scale: [0.4, 0.72, 0.68],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 9, 7), skin, {
      bone: spine.joints[2],
      at: [s * 0.68, 2.25, 0.6],
      scale: [0.36, 0.7, 0.6],
      flat: true,
    });
  }

  // Backbone ridge: a few low bumps.
  for (let i = 0; i < 5; i++) {
    const z = -1.0 + i * 0.4;
    b.part(new THREE.SphereGeometry(1, 6, 4), skin, {
      bone: spine.joints[Math.min(3, Math.floor(i * 0.7))],
      at: [0, 3.2 - Math.abs(z - 0.1) * 0.06, z],
      scale: [0.17, 0.07, 0.2],
      flat: true,
    });
  }

  // ---- Legs ---------------------------------------------------------------------------------------------
  const makeLeg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const z = front ? 0.6 : -0.75;
    const tag = front ? "F" : "H";
    const pts = limb(
      [s * 0.55, 1.9, z],
      [s * 0.55, 0.32, z],
      [0.85, 0.85],
      [front ? [0, 0, -1] : [0, 0, 1]],
    );
    const leg = b.chain(`leg${tag}${side}`, pts, {
      parent: front ? spine.joints[2] : spine.joints[0],
      names: [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`],
      role: "leg",
      contact: [s * 0.55, 0, z],
    });
    const w = front ? 0.4 : 0.44;
    b.sweep(leg, (t) => w - 0.1 * t, { color: skin, sides: 8, smooth: false });
    const foot = leg.joints[leg.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.34, 0.36, 0.14, 8), skin, {
      bone: foot,
      at: [s * 0.55, 0.06, z],
      flat: true,
    });
    for (const dx of [-0.2, -0.07, 0.07, 0.2]) {
      b.part(new THREE.ConeGeometry(0.06, 0.12, 5), NAIL, {
        bone: foot,
        at: [s * 0.55 + dx, 0.07, z + 0.31 - Math.abs(dx) * 0.3],
        dir: [0, 0.15, 1],
        flat: true,
      });
    }
  };
  for (const s of [1, -1]) {
    makeLeg(s, true);
    makeLeg(s, false);
  }

  // ---- Head ---------------------------------------------------------------------------------------------
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.5, 1.25],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.0, 1.85],
    aim: [0, 1.85, 2.2],
    role: "jaw",
    group: "head",
  });

  b.part(new THREE.SphereGeometry(1, 11, 8), skin, {
    bone: head,
    at: [0, 2.55, 1.55],
    scale: [0.5, 0.6, 0.55],
    flat: true,
  });
  for (const s of [1, -1]) {
    // Forehead domes, cheeks, brows
    b.part(new THREE.SphereGeometry(1, 8, 6), skin, {
      bone: head,
      at: [s * 0.2, 3.0, 1.55],
      scale: [0.28, 0.24, 0.3],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), skin, {
      bone: head,
      at: [s * 0.28, 2.3, 1.85],
      scale: [0.24, 0.3, 0.3],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), skin, {
      bone: head,
      at: [s * 0.4, 2.72, 1.78],
      scale: [0.12, 0.07, 0.15],
      flat: true,
    });
    // Eyes
    b.part(new THREE.SphereGeometry(0.05, 7, 5), AMBER, { bone: head, at: [s * 0.44, 2.63, 1.8] });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), DARK, { bone: head, at: [s * 0.475, 2.63, 1.82] });
  }
  // Muzzle and lips
  b.part(new THREE.SphereGeometry(1, 9, 7), skin, {
    bone: head,
    at: [0, 2.25, 1.95],
    scale: [0.3, 0.4, 0.3],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.4, 0.14, 0.4), MOUTH, { bone: jaw, at: [0, 1.98, 1.95], flat: true });
  b.part(new THREE.BoxGeometry(0.3, 0.1, 0.3), skin, { bone: jaw, at: [0, 1.94, 2.0], flat: true });
  // Crown bristles
  for (const [x, z] of [
    [0, 1.6],
    [0.12, 1.7],
    [-0.12, 1.7],
    [0.1, 1.45],
    [-0.1, 1.45],
  ]) {
    b.spike([x, 3.22, z], [0, 1, 0.2], 0.12, 0.025, DARK, { bone: head });
  }

  // ---- Ears ---------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0.35],
        [0.4, 0.35],
        [0.85, 0.15],
        [1.25, -0.2],
        [1.35, -0.7],
        [1.1, -1.2],
        [0.75, -1.45, "sharp"],
        [0.45, -1.15],
        [0.2, -0.7],
        [0, -0.35],
      ],
      {
        at: [s * 0.44, 2.95, 1.45],
        x: [s * 0.85, 0, -0.5],
        thickness: 0.05,
        bevel: 0.01,
        smoothing: 1,
        color: earSkin,
        bone: head,
        name: `ear${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---- Tusks --------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.27, 2.18, 1.9],
        [s * 0.38, 1.7, 2.25],
        [s * 0.44, 1.35, 2.85],
        [s * 0.4, 1.5, 3.55],
      ]),
      [0.085, 0.012],
      {
        color: IVORY,
        bands: [[0.1, IVORY_BASE]],
        bone: head,
        sides: 7,
        smooth: false,
        caps: { start: "flat", end: "point" },
      },
    );
  }

  // ---- Trunk --------------------------------------------------------------------------------------------
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.2, 1.95],
      [0, 1.65, 2.3],
      [0, 1.0, 2.45],
      [0, 0.5, 2.4],
      [0, 0.28, 2.75],
    ]),
    { parent: head, names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"], role: "tentacle" },
  );
  b.sweep(trunk, (t) => 0.22 - 0.12 * t, { color: trunkSkin, sides: 8, smooth: false });
  const trunkTip = trunk.joints[trunk.joints.length - 1];
  b.spike([0, 0.3, 2.72], [0, 0.25, 1], 0.12, 0.05, skin, { bone: trunkTip });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), DARK, { bone: trunkTip, at: [0.04, 0.27, 2.83] });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), DARK, { bone: trunkTip, at: [-0.04, 0.27, 2.83] });

  // ---- Tail ---------------------------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.4, -1.5],
      [0, 1.9, -1.75],
      [0, 1.2, -1.75],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );
  b.sweep(tail, [0.08, 0.04], { color: skin, sides: 7, smooth: false });
  const tailTip = tail.joints[tail.joints.length - 1];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.spike([0, 1.25, -1.75], [Math.cos(a) * 0.4, -1, Math.sin(a) * 0.4], 0.3, 0.025, DARK, { bone: tailTip });
  }

  return b.root;
}
