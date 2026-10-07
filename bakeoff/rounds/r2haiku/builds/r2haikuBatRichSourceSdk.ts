import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle } from "../../../../src/index";

export const meta = {
  name: "Fruit bat with fig",
  description: "A fluffy golden-brown fruit bat, wings spread wide, clutching a half-eaten fig in its feet.",
};

type V = [number, number, number];

export default function fruitBat() {
  const b = createBuilder({ name: "fruit-bat", detail: 1, paintSize: 1024 });

  const fur = countershade(mottle("#b9782f", "#8c5322", { size: 0.05, seed: 3 }), "#ebcb93", {
    level: 0.1,
    soft: 0.4,
  });
  const skin = mottle("#2b2d35", "#464955", { size: 0.06, seed: 7 });
  const dark = "#2a2b31";
  const ink = "#120a07";
  const figSkin = mottle("#6d2a5e", "#8a3a6f", { size: 0.03, seed: 11 });

  // ---- Skeleton -----------------------------------------------------------
  b.joint("torso", { at: [0, 0.2, 0], dir: [0, 1, 0] });
  b.joint("pelvis", { parent: "torso", at: [0, 0.13, -0.03], dir: [0, 1, 0] });
  b.joint("chest", { parent: "torso", at: [0, 0.28, 0.05], dir: [0, 1, 0.3] });
  b.joint("head", { parent: "chest", at: [0, 0.33, 0.1], dir: [0, 1, 0.4] });

  // ---- Head: fox-like face -------------------------------------------------
  const head = b.part(new THREE.SphereGeometry(0.058, b.segments(12), b.segments(8)), fur, {
    bone: "head",
    at: [0, 0.33, 0.1],
    name: "head",
  });
  const snout = b.capsule([0, 0.325, 0.13], [0, 0.305, 0.19], [0.032, 0.026], {
    color: fur,
    bone: "head",
    name: "snout",
  });
  const noseHit = b.surface(snout).nearest([0, 0.31, 0.215]);
  const nose = b.stick(new THREE.SphereGeometry(0.013, b.segments(8), b.segments(6)), "#0d0908", noseHit, {
    embed: 0.35,
    name: "nose",
  });
  b.stick(new THREE.SphereGeometry(0.004, 6, 4), "#ffffff", b.surface(nose).nearest(nose.local([0.004, 0.011, 0.004])), {
    embed: 0.1,
    name: "noseGlint",
  });

  for (const s of ["L", "R"] as const) {
    const sx = s === "L" ? 1 : -1;

    // Big dark eyes, sunk into the head so they bulge out.
    const eye = b.stick(
      new THREE.SphereGeometry(0.021, b.segments(10), b.segments(8)),
      ink,
      b.surface(head).nearest([0.03 * sx, 0.345, 0.15]),
      { embed: 0.25, name: `eye${s}` },
    );
    b.stick(new THREE.SphereGeometry(0.0065, 6, 4), "#ffffff", b.surface(eye).nearest(eye.local([0, 0.02, 0.008])), {
      embed: 0.2,
      name: `eyeGlint${s}`,
    });

    // Pointed ears.
    b.spike([0.03 * sx, 0.37, 0.09], [0.35 * sx, 1, -0.1], 0.05, 0.013, {
      color: fur,
      bone: "head",
      name: `ear${s}`,
    });
  }

  // ---- Body: a fluffy loft from belly to shoulders -------------------------
  b.loft(
    [
      { at: [0, 0.12, -0.03], w: 0.11, h: 0.11 },
      { at: [0, 0.19, 0], w: 0.16, h: 0.16 },
      { at: [0, 0.27, 0.05], w: 0.14, h: 0.13 },
    ],
    { color: fur, bone: ["pelvis", "torso", "chest"], name: "body" },
  );

  // Fluff ruff round the chest: little cones standing out from the body.
  b.ring({ frame: b.joint("chest", {}) } as never, { count: 0 }, () => {}); // placeholder removed below
  return finish(b, fur, skin, dark, ink, figSkin);
}

function finish(
  b: ReturnType<typeof createBuilder>,
  fur: ReturnType<typeof mottle>,
  skin: ReturnType<typeof mottle>,
  dark: string,
  ink: string,
  figSkin: ReturnType<typeof mottle>,
) {
  const chest = b.ring("chest", { count: 12, radius: 0.07 }, (item) => {
    b.stick(new THREE.ConeGeometry(0.01, 0.035, 5), fur, item, { embed: 0.35, name: "tuft" });
  });
  void chest;
  void ink;

  for (const s of ["L", "R"] as const) {
    const sx = s === "L" ? 1 : -1;
    const P = (x: number, y: number, z: number): V => [x * sx, y, z];

    // Legs: thigh, shin and foot gripping the fig.
    const leg = b.chain(
      `leg${s}`,
      [P(0.045, 0.15, -0.02), P(0.07, 0.1, 0.05), P(0.04, 0.075, 0.1)],
      { names: [`thigh${s}`, `shin${s}`, `foot${s}`], parent: "pelvis", role: "leg" },
    );
    b.sweep(leg, 0.011, { color: fur, name: `leg${s}` });
    const footTip = P(0.04, 0.075, 0.1);
    b.rod(footTip, P(0.01, 0.06, 0.12), 0.004, { color: dark, bone: `foot${s}`, name: `toe${s}1` });
    b.rod(footTip, P(0.03, 0.05, 0.12), 0.004, { color: dark, bone: `foot${s}`, name: `toe${s}2` });

    // Wing: shoulder, elbow, wrist, with a thumb claw hooked on the wrist.
    const S = P(0.05, 0.25, 0.02);
    const E = P(0.2, 0.36, 0.0);
    const W = P(0.38, 0.42, -0.02);
    const wing = b.chain(`wing${s}`, [S, E, W], {
      names: [`arm${s}`, `forearm${s}`, `hand${s}`],
      parent: "torso",
      role: "wing",
    });
    b.sweep(wing, { radius: [0.01, 0.004], color: dark, name: `arm${s}` });

    // Finger bones fanning from the wrist; their rods show the wing's ribs.
    const fingers: V[] = [P(0.6, 0.46, -0.06), P(0.56, 0.36, -0.1), P(0.46, 0.3, -0.13)];
    fingers.forEach((tip, i) => {
      const name = `finger${"ABC"[i]}${s}`;
      b.joint(name, { parent: `hand${s}`, at: W, aim: tip });
      b.rod(W, tip, [0.006, 0.003], { color: dark, bone: name, name: `finger${"ABC"[i]}${s}` });
    });

    // Leathery membrane from the arm to the trailing edge, which runs from the body to the outer finger.
    const trailing: V[] = [
      P(0.06, 0.15, -0.03),
      P(0.2, 0.2, -0.08),
      P(0.36, 0.25, -0.12),
      fingers[2],
    ];
    b.membrane(wing, trailing, { color: skin, thickness: 0.004, rows: 6, name: `wingSkin${s}` });

    // Thumb claw: a small hook at the wrist.
    const claw = catmull([
      P(0.36, 0.43, 0.02),
      P(0.37, 0.455, 0.035),
      P(0.365, 0.47, 0.05),
      P(0.35, 0.465, 0.045),
    ]);
    b.sweep(claw, { radius: [0.004, 0.0012], color: "#e8dcc0", bone: `hand${s}`, name: `thumb${s}` });
  }

  // ---- The fig: a half-eaten fruit on the ground, with exposed pink flesh ----
  const fig = b.lathe(
    [
      [0, 0],
      [0.028, 0.003],
      [0.044, 0.018],
      [0.05, 0.042],
      [0.047, 0.066],
      [0.034, 0.085],
      [0.018, 0.094],
      [0, 0.097],
    ],
    { color: figSkin, at: [0, 0, 0.07], name: "fig" },
  );
  b.rod([0, 0.095, 0.07], [0, 0.11, 0.07], 0.004, { color: dark, name: "stalk" });

  const biteHit = b.surface(fig).nearest([0.02, 0.06, 0.12]);
  b.stick(new THREE.SphereGeometry(0.022, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#e8505f", biteHit, {
    embed: 0.45,
    name: "fleshBite",
  });

  return b.root;
}
