import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { countershade, gradient, stripes } from "../../../../src/paint";

const COAT = "#c26732";
const DARK = "#552116";
const CREAM = "#f4d7aa";
const CLAW = "#2b1a14";

export function buildQuadruped(scale = 1, detail = 1) {
  const b = createBuilder({ name: `quadruped-${scale}`, detail });
  const s = scale;
  const hips = b.joint("hips", { at: [0, 1.02 * s, 0], role: "spine" });

  const tail = b.chain(
    "tail",
    [
      [-0.0, 1.02 * s, -0.34 * s],
      [0, 1.02 * s, -0.9 * s],
      [0, 1.09 * s, -1.55 * s],
      [0, 1.28 * s, -2.15 * s],
    ],
    { parent: hips, names: ["tailBase", "tailMid", "tailUpper", "tailTip"], role: "tail" },
  );
  const spine = b.chain(
    "spine",
    [
      [0, 1.12 * s, 0.42 * s],
      [0, 1.16 * s, 0.78 * s],
      [0, 1.2 * s, 1.08 * s],
    ],
    { parent: hips, names: ["shoulder", "chest", "neckBase"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      spine.tip!.at,
      [0, 1.3 * s, 1.3 * s],
      [0, 1.4 * s, 1.48 * s],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2", "skull"], role: "neck" },
  );
  const skull = neck.tip!;

  const coat = countershade(stripes(COAT, DARK, { size: 0.22 * s, width: 0.4 }), CREAM, { level: -0.2 });
  const body = b.loft(
    [
      { at: tail.tip!, w: 0.12 * s, h: 0.12 * s },
      { at: [0, 1.09 * s, -1.55 * s], w: 0.28 * s, h: 0.3 * s },
      { at: [0, 1.04 * s, -0.3 * s], w: 0.58 * s, h: 0.62 * s },
      { at: hips, w: 0.76 * s, h: 0.8 * s },
      { at: spine.joints[0], w: 0.82 * s, h: 0.76 * s },
      { at: spine.tip!, w: 0.58 * s, h: 0.58 * s },
      { at: skull, w: 0.4 * s, h: 0.42 * s },
    ],
    { bone: [tail, hips, spine, neck], color: coat, name: "body" },
  );

  const legs = [
    { side: 1, hind: true, root: [0.31 * s, 1.0 * s, -0.42 * s], target: [0.36 * s, 0.12 * s, -0.52 * s] },
    { side: -1, hind: true, root: [-0.31 * s, 1.0 * s, -0.42 * s], target: [-0.36 * s, 0.12 * s, -0.52 * s] },
    { side: 1, hind: false, root: [0.31 * s, 1.12 * s, 0.72 * s], target: [0.36 * s, 0.12 * s, 0.82 * s] },
    { side: -1, hind: false, root: [-0.31 * s, 1.12 * s, 0.72 * s], target: [-0.36 * s, 0.12 * s, 0.82 * s] },
  ] as const;
  for (const leg of legs) {
    const prefix = `${leg.hind ? "hind" : "front"}${leg.side > 0 ? "L" : "R"}`;
    const points = limb(
      leg.root,
      leg.target,
      leg.hind ? [0.52 * s, 0.5 * s, 0.28 * s] : [0.58 * s, 0.52 * s, 0.28 * s],
      [[0, 0, leg.hind ? 1 : -1]],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(prefix, points, {
      parent: hips,
      names: [`${prefix}Hip`, `${prefix}Knee`, `${prefix}Ankle`, `${prefix}Paw`],
      role: "leg",
      contact: leg.target,
    });
    const sweep = b.sweep(chain, (t) => (0.095 - 0.035 * t) * s, {
      color: gradient(coat, DARK, leg.root, leg.target),
      name: `${prefix}Tube`,
      group: "legs",
    });
    const soleHit = sweep.at(1, 180, 0.002 * s);
    b.stick(new THREE.ConeGeometry(0.035 * s, 0.11 * s, b.segments(6)), CLAW, soleHit, {
      embed: 0.35,
      name: `${prefix}Claw`,
      group: "claws",
    });
  }

  const skin = b.surface(body);
  for (const side of [1, -1] as const) {
    const earHit = skin.around(skull.at).at(side * 60, 55);
    if (!earHit) throw new Error(`ear hit missing on side ${side}`);
    b.stick(new THREE.ConeGeometry(0.13 * s, 0.32 * s, b.segments(6)), DARK, earHit, {
      embed: 0.38,
      spin: side * 12,
      name: `Ear${side > 0 ? "L" : "R"}`,
      group: "ears",
    });
  }

  const jaw = b.joint("jaw", {
    parent: skull,
    at: skull.local({ forward: 0.14 * s, down: 0.06 * s }),
    dir: [0, 0, 1],
    role: "jaw",
  });
  b.frustumBox(
    jaw.at,
    jaw.local({ forward: 0.32 * s }),
    [0.26 * s, 0.17 * s],
    [0.18 * s, 0.12 * s],
    { bone: jaw, color: CREAM, name: "jawMuzzle", group: "jaw" },
  );
  b.rod(jaw.local({ forward: 0.02 * s, down: 0.06 * s }), jaw.local({ forward: 0.3 * s, down: 0.05 * s }), 0.012 * s, {
    bone: jaw,
    color: DARK,
    name: "mouth",
    group: "jaw",
  });

  const root = b.root;
  root.userData.probe = { builder: b, skull, jaw, body };
  return root;
}

export default function build() {
  return buildQuadruped(1, 1);
}
