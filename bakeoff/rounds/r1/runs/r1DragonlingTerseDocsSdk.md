```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, limb, countershade, spots } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby, big-headed baby dragon: green mottled hide, cream belly, amber back spikes, little horns, small orange wings and a spade-tipped tail. Fully rigged with spine, tail, neck, head, jaw, legs, wings and fingers.",
};

const GREEN = "#62c24c";
const DGREEN = "#3f9a3c";
const CREAM = "#f6e7b4";
const HORN = "#f3e2b8";
const SPIKE = "#e8a33a";
const CLAW = "#fff3d6";
const WING = "#f3895a";
const EYE = "#ffc72a";
const DARK = "#2a1630";
const WHITE = "#ffffff";
const NOSE = "#2c6b2c";
const PINK = "#e8697a";

export default function build() {
  const b = createBuilder({ name: "babyDragon" });

  // ---------- body: tail -> hips -> chest on one curve ----------
  const body = catmull([
    [0, 0.2, -0.95],
    [0, 0.12, -0.72],
    [0, 0.15, -0.45],
    [0, 0.3, -0.15],
    [0, 0.34, 0.02],
    [0, 0.4, 0.16],
  ]);
  const core = b.joint("hips", { at: [0, 0.3, -0.15], role: "spine" });
  const rootT = body.closestT(core.at);
  const front = b.chain("spine", body.slice(rootT, 1), { parent: core, count: 3, role: "spine" });
  const back = b.chain("tail", body.slice(rootT, 0), { parent: core, count: 5, role: "tail" });

  const coat = countershade(spots(GREEN, DGREEN, { size: 0.07, amount: 0.3, seed: 3 }), CREAM, {
    level: -0.25,
    soft: 0.3,
  });
  const bodySweep = b.sweep(body, [0.012, 0.03, 0.05, 0.085, 0.16, 0.14], {
    bone: [back, core, front],
    color: coat,
  });

  // dorsal spikes
  b.along(
    bodySweep,
    11,
    (at) => {
      const k = Math.sin(Math.PI * Math.min(1, Math.max(0, at.t)));
      return b.spike(at, at, 0.03 + 0.06 * k, 0.012 + 0.018 * k, { color: SPIKE, sides: 5 });
    },
    { from: 0.08, to: 0.97 },
  );

  // tail spade
  const tailEnd = back.joints[back.joints.length - 1];
  b.extrude(
    [
      [-0.02, 0],
      [0.03, 0.035],
      [0.07, 0.075],
      [0.15, 0, "sharp"],
      [0.07, -0.075],
      [0.03, -0.035],
    ],
    {
      at: [0, 0.2, -0.95],
      x: [0, 0, -1],
      y: [1, 0, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: SPIKE,
      bone: tailEnd,
    },
  );

  // ---------- neck & head ----------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.4, 0.16],
      [0, 0.47, 0.24],
      [0, 0.55, 0.3],
    ]),
    { parent: front.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const neckSweep = b.sweep(neck, [0.1, 0.082], { color: coat });
  b.along(neckSweep, 3, (at) => b.spike(at, at, 0.045, 0.016, { color: SPIKE, sides: 5 }), { from: 0.2, to: 0.8 });

  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.55, 0.3], dir: [0, -0.1, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.12, 10, 8).scale(1, 0.9, 1), coat, {
    bone: head,
    at: head.local({ forward: 0.04, up: 0.02 }),
  });
  // upper snout
  b.frustumBox(head.local({ forward: 0.08 }), head.local({ forward: 0.25, down: 0.01 }), [0.14, 0.09], [0.09, 0.06], {
    bone: head,
    color: GREEN,
  });
  // jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.055 }),
    aim: head.local({ forward: 0.24, down: 0.055 }),
    role: "jaw",
  });
  b.frustumBox(head.local({ forward: 0.05, down: 0.055 }), head.local({ forward: 0.23, down: 0.055 }), [0.11, 0.03], [0.07, 0.026], {
    bone: jaw,
    color: CREAM,
  });
  b.part(new THREE.SphereGeometry(0.03, 6, 4).scale(1.2, 0.5, 1.3), PINK, {
    bone: jaw,
    at: head.local({ forward: 0.14, down: 0.043 }),
  });

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.036, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.085, forward: 0.12, up: 0.06 }),
    });
    b.part(new THREE.SphereGeometry(0.019, 6, 5), DARK, {
      bone: head,
      at: head.local({ left: s * 0.094, forward: 0.146, up: 0.06 }),
    });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.1, forward: 0.159, up: 0.07 }),
    });
    // brow
    b.rod(
      head.local({ left: s * 0.045, forward: 0.1, up: 0.1 }),
      head.local({ left: s * 0.12, forward: 0.11, up: 0.082 }),
      0.014,
      { bone: head, color: DGREEN, sides: 5 },
    );
    // nostrils
    b.part(new THREE.SphereGeometry(0.012, 5, 4), NOSE, {
      bone: head,
      at: head.local({ left: s * 0.03, forward: 0.245, up: 0.03 }),
    });
    // horns
    b.sweep(
      bezier(
        head.local({ left: s * 0.06, up: 0.09, forward: 0.0 }),
        head.local({ left: s * 0.09, up: 0.17, forward: -0.05 }),
        head.local({ left: s * 0.09, up: 0.2, forward: -0.15 }),
      ),
      [0.032, 0],
      { bone: head, color: HORN, sides: 6, caps: "point" },
    );
    // cheek frills
    b.spike(
      head.local({ left: s * 0.1, forward: 0.0, down: 0.01 }),
      head.local({ left: s * 0.2, forward: -0.06, down: 0.0 }),
      null,
      0.025,
      { bone: head, color: SPIKE, sides: 5 },
    );
    b.spike(
      head.local({ left: s * 0.1, forward: 0.03, down: -0.03 }),
      head.local({ left: s * 0.18, forward: -0.03, down: -0.05 }),
      null,
      0.018,
      { bone: head, color: SPIKE, sides: 5 },
    );
    // fangs
    b.part(new THREE.ConeGeometry(0.01, 0.028, 5), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.05, forward: 0.2, down: 0.05 }),
      dir: [0, -1, 0],
    });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // front leg
    const fRoot: [number, number, number] = [s * 0.14, 0.3, 0.1];
    const fFoot: [number, number, number] = [s * 0.16, 0.04, 0.17];
    const fPts = limb(fRoot, fFoot, [0.15, 0.15], [0, 0, -1]);
    const fLeg = b.chain(`legF${S}`, fPts, {
      parent: front.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
      contact: [fFoot[0], 0, fFoot[2]],
    });
    b.sweep(fLeg, [0.068, 0.045], { color: GREEN });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), GREEN, { bone: fLeg.joints[0], at: fRoot });

    // hind leg
    const hRoot: [number, number, number] = [s * 0.15, 0.28, -0.2];
    const hFoot: [number, number, number] = [s * 0.16, 0.04, -0.16];
    const hPts = limb(hRoot, hFoot, [0.16, 0.16], [0, 0, 1]);
    const hLeg = b.chain(`legH${S}`, hPts, {
      parent: core,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [hFoot[0], 0, hFoot[2]],
    });
    b.sweep(hLeg, [0.08, 0.045], { color: GREEN });
    b.part(new THREE.SphereGeometry(0.095, 8, 6).scale(0.85, 1, 1.1), GREEN, { bone: hLeg.joints[0], at: hRoot });

    // feet
    for (const [leg, foot] of [
      [fLeg, fFoot],
      [hLeg, hFoot],
    ] as const) {
      const tipJoint = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(0.05, 8, 6).scale(1.05, 0.6, 1.3), DGREEN, {
        bone: tipJoint,
        at: [foot[0], 0.03, foot[2] + 0.02],
      });
      for (const dx of [-0.04, 0, 0.04]) {
        b.spike(
          [foot[0] + dx, 0.03, foot[2] + 0.07],
          [foot[0] + dx * 1.3, 0.02, foot[2] + 0.14],
          null,
          0.02,
          { bone: tipJoint, color: CLAW, sides: 5 },
        );
      }
    }

    // ---------- wings ----------
    const sh: [number, number, number] = [s * 0.09, 0.47, 0.05];
    const el: [number, number, number] = [s * 0.25, 0.62, 0.0];
    const wr: [number, number, number] = [s * 0.38, 0.7, -0.04];
    const arm = b.chain(`wing${S}`, [sh, el, wr], {
      parent: front.joints[1],
      names: [`wingBase${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(arm, [0.028, 0.016], { color: DGREEN });
    const wristJoint = arm.tip ?? arm.joints[arm.joints.length - 1];
    const tips: [number, number, number][] = [
      [s * 0.62, 0.8, -0.14],
      [s * 0.6, 0.6, -0.26],
      [s * 0.5, 0.44, -0.26],
    ];
    const fingers = tips.map((tp, i) => {
      const f = b.chain(`finger${S}${i + 1}`, [wr, tp], { parent: wristJoint, role: "digit" });
      b.sweep(f, [0.014, 0.005], { color: DGREEN });
      return f;
    });
    b.membrane(fingers[0], fingers[1], { thickness: 0.008, color: WING, scallop: 0.15 });
    b.membrane(fingers[1], fingers[2], { thickness: 0.008, color: WING, scallop: 0.15 });
    b.membrane(fingers[2], [wr, [s * 0.22, 0.5, -0.1], [s * 0.1, 0.42, -0.12]], {
      thickness: 0.008,
      color: WING,
      bone: front.joints[1],
    });
    // wing thumb claw
    b.spike(wr, [s * 0.4, 0.78, 0.02], null, 0.018, { bone: wristJoint, color: CLAW, sides: 5 });
  }

  return b.root;
}
```