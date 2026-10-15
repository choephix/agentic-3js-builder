// Gray wolf standing alert, Blizzard/Warcraft style: heavy chest and shoulders, big head, oversized paws,
// hand-painted three-tone fur (warm highlight, base, cool shadow), dark guard-hair spikes and glowing amber eyes.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { gradient, mix, mottle, paint, resolve } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { furEdge, shadowOf, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf",
  description:
    "A gray wolf standing alert: broad chest, big head with amber glowing eyes, upright ears, bushy dark-tipped tail, oversized paws, hand-painted fur with guard-hair tufts.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "grayWolf", paintSize: 2048 });

  // ---- palette ----------------------------------------------------------------------------------------------
  const FUR_A = "#8b95a3";
  const FUR_B = "#69717e";
  const FUR_DARK = "#454c58";
  const CREAM = "#d9d3c0";
  const TAN = "#b39a76";
  const TIP = "#24262d";
  const PALE = "#cfc8b4";
  const BRIDGE = "#2f323a";
  const INKC = "#1b1a1f";
  const TOOTH = "#f3efe2";
  const CLAW = "#2a2623";
  const AMBER = "#f5b92c";

  const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
  // Hand-painted three tone: warm highlight, base, hue-shifted shadow.
  const shade = (base: ColorInput) =>
    paint((p, n) => {
      const d = n.dot(KEY);
      const c = resolve(base, p, n);
      if (d > 0.72) return mix(c, "#fff1cf", 0.22);
      if (d > 0.1) return c;
      return shadowOf(c);
    });

  const HY = 1.0;
  const HZ = 0.8;
  const hp = (x: number, y: number, z: number): [number, number, number] => [x, HY + y, HZ + z];

  const coatMottle = mottle(FUR_A, FUR_B, { size: 0.14, seed: 5, contrast: 1.2 });
  const top = furEdge(FUR_DARK, coatMottle, { level: 0.55, teeth: 0.3, period: 0.05 });
  const COAT = shade(furEdge(top, CREAM, { level: -0.4, teeth: 0.25, period: 0.03 }));
  const LEG = shade(
    furEdge(coatMottle, TAN, { axis: [0, 1, 0], by: "position", level: 0.36, teeth: 0.06, period: 0.03, along: [1, 0, 1] }),
  );
  const tailBase = gradient(coatMottle, TIP, [0, 0.42, -1.0], [0, 0.3, -1.2]);
  const tailTop = furEdge(FUR_DARK, tailBase, { level: 0.6, teeth: 0.25, period: 0.05 });
  const TAIL = shade(furEdge(tailTop, CREAM, { level: -0.55, teeth: 0.2, period: 0.03 }));
  const face = furEdge(PALE, top, {
    axis: [0, 0, 1],
    by: "position",
    level: HZ + 0.16,
    teeth: 0.02,
    period: 0.025,
    along: [1, 0, 0],
  });
  const faceMarked = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (n.y > 0.15 && ax < 0.016 + 0.007 * zigzag(p.z / 0.035) && p.z > HZ + 0.1) return BRIDGE;
    if (ax > 0.062 && ax < 0.082 && p.z > HZ + 0.11 && p.z < HZ + 0.14 && p.y < HY && p.y > HY - 0.06) return BRIDGE;
    return face;
  });
  const HEAD = shade(furEdge(faceMarked, CREAM, { level: -0.5, teeth: 0.2, period: 0.025 }));
  const PAW = shade("#6a5f56");

  // ---- skeleton ---------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.7, -0.38] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.7, -0.38],
      [0, 0.72, -0.12],
      [0, 0.73, 0.15],
      [0, 0.72, 0.42],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.72, 0.42],
      [0, 0.87, 0.62],
      [0, HY, HZ],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, HY, HZ], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HY - 0.07, HZ],
    aim: [0, HY - 0.1, HZ + 0.27],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.69, -0.42],
      [0, 0.62, -0.72],
      [0, 0.47, -1.0],
      [0, 0.3, -1.2],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---- body, neck, tail -------------------------------------------------------------------------------------
  const bodyR = (t: number): [number, number] => [
    0.15 - 0.02 * Math.sin(Math.PI * t) + 0.03 * t,
    0.17 + 0.05 * t,
  ];
  const body = b.sweep(spine, bodyR, { color: COAT, shift: [0, -0.04] });
  const neckSweep = b.sweep(neck, (t: number): [number, number] => [0.14 - 0.03 * t, 0.15 - 0.04 * t], { color: COAT });
  const tailSweep = b.sweep(tail, [0.05, 0.1, 0.115, 0.085, 0.03], { color: TAIL });

  // ---- tufts (fur cards) ------------------------------------------------------------------------------------
  const tuftA = svg(
    `<svg viewBox="0 0 32 64"><path d="M2 64 Q6 30 16 0 Q26 30 30 64 Z" fill="#ffffff"/><path d="M16 8 Q15 34 16 64" stroke="#bdbdbd" stroke-width="3" fill="none"/></svg>`,
    { size: 128 },
  );
  const tuftB = svg(
    `<svg viewBox="0 0 32 64"><path d="M4 64 Q4 36 11 14 Q14 6 15 0 Q18 12 24 28 Q30 46 28 64 Z" fill="#ffffff"/><path d="M14 14 Q18 40 16 64" stroke="#c4c4c4" stroke-width="3" fill="none"/></svg>`,
    { size: 128 },
  );
  const tufts = [tuftA, tuftB];

  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(60, { rng: rng(21), minDist: 0.05, filter: (h) => h.n.y > 0.7 }),
    tufts,
    { size: [0.035, 0.1], lean: 70, bend: 25, flow: [0, -0.2, -1], vary: 0.3, rng: rng(22), color: "#30343c", spin: 12 },
  );
  b.cards(
    bodySkin.scatter(50, { rng: rng(23), minDist: 0.05, filter: (h) => h.n.z > 0.35 && h.n.y < 0.35 }),
    tufts,
    { size: [0.05, 0.1], lean: 40, bend: 20, flow: [0, -1, -0.1], vary: 0.25, rng: rng(24), color: "#e3dcc8" },
  );
  const neckSkin = b.surface(neckSweep);
  b.cards(neckSkin.scatter(70, { rng: rng(25), minDist: 0.04, filter: (h) => h.n.y > -0.2 }), tufts, {
    size: [0.05, 0.13],
    lean: 55,
    bend: 30,
    vary: 0.3,
    rng: rng(26),
    color: COAT,
    spin: 10,
  });
  b.cards(
    neckSkin.scatter(24, { rng: rng(27), minDist: 0.05, filter: (h) => h.n.y > 0.7 }),
    tufts,
    { size: [0.04, 0.12], lean: 65, bend: 20, flow: [0, -0.2, -1], vary: 0.3, rng: rng(28), color: "#30343c" },
  );
  b.cards(
    b.surface(tailSweep).scatter(110, { rng: rng(29), minDist: 0.04, filter: (h) => h.n.y > -0.3 }),
    tufts,
    { size: [0.06, 0.13], lean: 60, bend: 25, vary: 0.3, rng: rng(30), color: TAIL, spin: 10 },
  );

  // ---- legs -------------------------------------------------------------------------------------------------
  const hindSweeps: THREE.Object3D[] = [];
  const addPaw = (joint: ReturnType<typeof b.joint>, fx: number, fz: number, big: boolean) => {
    const sx = big ? 0.062 : 0.055;
    const sz = big ? 0.095 : 0.09;
    b.part(new THREE.SphereGeometry(1, 8, 6), PAW, {
      bone: joint,
      at: [fx, 0.05, fz + 0.045],
      scale: [sx, 0.05, sz],
    });
    for (let k = 0; k < 4; k++) {
      const x = fx + (k - 1.5) * 0.03;
      const z = fz + 0.045 + sz * 0.9;
      b.part(new THREE.SphereGeometry(0.022, 6, 5), PAW, { bone: joint, at: [x, 0.03, z], scale: [1, 0.8, 1.2] });
      b.spike([x, 0.024, z + 0.02], [0, -0.3, 1], 0.04, 0.009, { color: CLAW, bone: joint });
    }
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front leg
    const fPts = limb([s * 0.13, 0.6, 0.38], [s * 0.13, 0.075, 0.42], [0.27, 0.25, 0.12], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const front = b.chain(`legF${S}`, fPts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`],
      role: "leg",
      contact: [s * 0.13, 0, 0.42],
    });
    b.sweep(front, [0.1, 0.07, 0.055, 0.05], { color: LEG });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: chest,
      at: [s * 0.14, 0.6, 0.37],
      scale: [0.095, 0.17, 0.15],
    });
    addPaw(front.joints[3], s * 0.13, 0.42, true);

    // hind leg
    const hPts = limb([s * 0.13, 0.66, -0.38], [s * 0.13, 0.075, -0.44], [0.3, 0.28, 0.22], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${S}`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
      contact: [s * 0.13, 0, -0.44],
    });
    const hs = b.sweep(hind, [0.12, 0.08, 0.05, 0.045], { color: LEG });
    hindSweeps.push(...hs.meshes);
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: hind.joints[0],
      at: [s * 0.15, 0.56, -0.4],
      scale: [0.1, 0.19, 0.19],
    });
    addPaw(hind.joints[3], s * 0.13, -0.44, false);
  }
  b.cards(
    b.surface(hindSweeps).scatter(30, { rng: rng(31), minDist: 0.05, filter: (h) => h.n.z < -0.3 && h.at.y > 0.25 }),
    tufts,
    { size: [0.05, 0.1], lean: 60, bend: 20, flow: [0, -1, -0.3], vary: 0.3, rng: rng(32), color: COAT },
  );

  // ---- head -------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD, {
    bone: head,
    at: hp(0, 0.015, 0.03),
    scale: [0.125, 0.115, 0.13],
  });
  const cheeks: Array<ReturnType<typeof b.part>> = [];
  for (const s of [1, -1])
    cheeks.push(
      b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
        bone: head,
        at: hp(s * 0.075, -0.035, 0.04),
        scale: [0.06, 0.06, 0.09],
      }),
    );
  b.sweep([hp(0, -0.015, 0.07), hp(0, -0.045, 0.3)], (t: number): [number, number] => [0.07 - 0.028 * t, 0.06 - 0.02 * t], {
    color: HEAD,
    bone: head,
  });
  b.sweep([hp(0, -0.085, 0.03), hp(0, -0.1, 0.27)], (t: number): [number, number] => [0.052 - 0.024 * t, 0.034 - 0.012 * t], {
    color: HEAD,
    bone: jaw,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), INKC, { bone: head, at: hp(0, -0.04, 0.335), scale: [0.04, 0.03, 0.032] });
  b.part(new THREE.SphereGeometry(0.008, 5, 4), "#6b6f7a", { bone: head, at: hp(0, -0.022, 0.348) });

  const headSkin = b.surface([skull, ...cheeks]);
  b.cards(
    headSkin.scatter(40, {
      rng: rng(41),
      minDist: 0.028,
      filter: (h) => h.n.z < 0.1 && Math.abs(h.n.x) > 0.5 && h.at.y < HY + 0.03,
    }),
    tufts,
    { size: [0.045, 0.1], lean: 70, bend: 25, flow: [0, -0.2, -1], vary: 0.25, rng: rng(42), color: HEAD, spin: 15 },
  );

  for (const s of [1, -1]) {
    // teeth
    b.spike(hp(s * 0.03, -0.07, 0.255), [0, -1, 0], 0.04, 0.011, { color: TOOTH, bone: head });
    b.spike(hp(s * 0.022, -0.09, 0.23), [0, 1, 0], 0.035, 0.009, { color: TOOTH, bone: jaw });
    // lip line
    b.sweep(catmull([hp(s * 0.05, -0.068, 0.1), hp(s * 0.047, -0.073, 0.18), hp(s * 0.028, -0.07, 0.29)]), 0.0045, {
      color: INKC,
      bone: head,
    });
    // whisker dots
    for (let k = 0; k < 3; k++)
      b.part(new THREE.SphereGeometry(0.006, 5, 4), INKC, {
        bone: head,
        at: hp(s * (0.056 - 0.006 * k), -0.035 + (k % 2) * 0.012, 0.17 + k * 0.03),
      });
    // eyes
    b.part(new THREE.SphereGeometry(0.034, 7, 5), BRIDGE, { bone: head, at: hp(s * 0.072, 0.038, 0.108), scale: [0.6, 0.85, 1.2] });
    glow(b.part(new THREE.SphereGeometry(0.026, 8, 6), AMBER, { bone: head, at: hp(s * 0.078, 0.038, 0.115) }), 0.7);
    b.part(new THREE.SphereGeometry(0.011, 6, 4), INKC, { bone: head, at: hp(s * 0.089, 0.038, 0.132) });
    b.part(new THREE.SphereGeometry(0.004, 4, 3), "#ffffff", { bone: head, at: hp(s * 0.088, 0.047, 0.145) });
    // brow
    b.capsule(hp(s * 0.035, 0.075, 0.15), hp(s * 0.092, 0.062, 0.075), 0.018, { color: FUR_DARK, bone: head });
    // ears
    const earPaint = paint((_p, _n, st) => (st[1] > 0.085 ? TIP : COAT));
    const earOutline: Array<[number, number]> = [
      [-0.045, 0],
      [-0.04, 0.07],
      [0, 0.125],
      [0.045, 0.065],
      [0.05, 0],
    ];
    b.extrude(earOutline, {
      at: hp(s * 0.07, 0.085, -0.02),
      x: [1, 0, 0],
      y: [s * 0.3, 1, -0.1],
      thickness: [0.03, 0.008],
      bevel: 0.005,
      color: earPaint,
      bone: head,
    });
    b.extrude(
      [
        [-0.027, 0.01],
        [-0.024, 0.06],
        [0, 0.1],
        [0.027, 0.058],
        [0.03, 0.01],
      ],
      {
        at: hp(s * 0.07, 0.085, -0.02 + 0.016),
        x: [1, 0, 0],
        y: [s * 0.3, 1, -0.1],
        thickness: 0.006,
        color: "#4b3b3f",
        bone: head,
      },
    );
  }

  return b.root;
}
