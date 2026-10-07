import * as THREE from "three";
import { createBuilder, paint, patches, mix, smoothstep, gradient, frame, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "Young Reticulated Giraffe",
  description:
    "A rigged calf giraffe: chestnut polygon patches outlined in cream, stiff brown mane, fuzzy black-tufted ossicones, big ears, long lashes, a dark tongue peeking out, and cream-socked legs.",
};

const CREAM = "#f3e2b5";
const DARK = "#2b211c";
const BLACK = "#15100d";
const DEG = Math.PI / 180;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "giraffe", paintSize: 2048 });
  const rr = rng(11);

  // ---------- paints ----------
  const patch = patches(CREAM, ["#8f4519", "#a2551f", "#7d3a15", "#9a4d1b"], { size: 0.3, gap: 0.08, seed: 3 });
  const coat = paint((p, n) => {
    let c = patch.at(p, n);
    c = mix(CREAM, c, smoothstep(0.3, 0.62, p.y));
    c = mix(c, CREAM, 0.45 * smoothstep(-0.3, -0.85, n.y));
    return c;
  });
  const face = gradient("#c4955c", "#4e3a30", [0, 2.4, 1.3], [0, 2.3, 1.6]);
  const headPaint = paint((p, n) => mix(patch.at(p, n), face.at(p, n), smoothstep(0.95, 1.2, p.z)));

  // ---------- skeleton ----------
  b.joint("pelvis", { at: [0, 1.4, -0.55], dir: [0, 0, 1] });
  const spine = b.chain("spine", [[0, 1.4, -0.55], [0, 1.42, -0.05], [0, 1.5, 0.5]], {
    names: ["spine1", "spine2"],
    role: "spine",
    parent: "pelvis",
  });
  const neck = b.chain("neck", catmull([[0, 1.5, 0.45], [0, 1.85, 0.62], [0, 2.2, 0.82], [0, 2.4, 0.95]]), {
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    parent: "spine2",
  });
  b.joint("head", { parent: "neck3", at: [0, 2.4, 0.95], dir: [0, -0.1, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 2.33, 1.0], dir: [0, -0.05, 1], role: "jaw" });

  // ---------- torso & neck ----------
  b.sweep(spine, (t) => [0.2 + 0.07 * Math.sin(Math.PI * t), 0.27 + 0.05 * t + 0.03 * Math.sin(Math.PI * t)], {
    color: coat,
    sides: 10,
  });
  const neckSweep = b.sweep(neck, (t) => [0.17 - 0.075 * t, 0.2 - 0.1 * t], { color: coat, sides: 8 });

  // ---------- mane ----------
  for (let i = 0; i < 40; i++) {
    const t = 0.06 + (0.94 * (i + 0.5)) / 40;
    const p = neckSweep.at(t, (rr() - 0.5) * 40);
    const dir = p.axis.clone().addScaledVector(p.tangent, 0.3);
    b.spike(p, dir, 0.08 + 0.05 * rr(), 0.02, { color: i % 3 ? "#5a3418" : "#472812", sides: 4 });
  }

  // ---------- legs ----------
  for (const [S, sx] of [["L", 1], ["R", -1]] as const) {
    const x = sx * 0.2;
    const front = b.chain(`legF${S}`, catmull([[x, 1.2, 0.42], [x, 0.64, 0.45], [x, 0.22, 0.44], [x, 0.1, 0.44]]), {
      names: [`shoulder${S}`, `kneeF${S}`, `fetlockF${S}`, `hoofF${S}`],
      role: "leg",
      parent: "spine2",
    });
    b.sweep(front, (t) => 0.105 - 0.058 * t + 0.014 * Math.exp(-(((t - 0.5) / 0.1) ** 2)), {
      color: coat,
      sides: 7,
      caps: { start: "round", end: "flat" },
    });
    b.part(new THREE.CylinderGeometry(0.052, 0.064, 0.11, 6), DARK, { at: [x, 0.055, 0.44], bone: `hoofF${S}` });

    const rear = b.chain(
      `legH${S}`,
      catmull([[x, 1.25, -0.45], [x, 0.85, -0.32], [x, 0.5, -0.5], [x, 0.2, -0.47], [x, 0.1, -0.47]]),
      {
        names: [`hip${S}`, `knee${S}`, `hock${S}`, `fetlockH${S}`, `hoofH${S}`],
        role: "leg",
        parent: "spine1",
      },
    );
    b.sweep(rear, (t) => 0.14 - 0.092 * t + 0.014 * Math.exp(-(((t - 0.62) / 0.09) ** 2)), {
      color: coat,
      sides: 7,
      caps: { start: "round", end: "flat" },
    });
    b.part(new THREE.CylinderGeometry(0.052, 0.064, 0.11, 6), DARK, { at: [x, 0.055, -0.47], bone: `hoofH${S}` });
  }

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 1.45, -0.58], [0, 1.3, -0.72], [0, 0.95, -0.78], [0, 0.65, -0.78]]), {
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
    parent: "spine1",
  });
  b.sweep(tail, (t) => 0.04 - 0.022 * t, { color: coat, sides: 6 });
  b.spike(tail.at(1), [0, -1, -0.1], 0.22, 0.05, { color: "#2a1a10", sides: 6 });
  b.spike(tail.at(1), [0.3, -1, 0], 0.15, 0.03, { color: "#2a1a10", sides: 4 });
  b.spike(tail.at(1), [-0.3, -1, 0], 0.15, 0.03, { color: "#2a1a10", sides: 4 });

  // ---------- head ----------
  b.loft(
    [
      { at: [0, 2.46, 0.9], w: 0.2, h: 0.24 },
      { at: [0, 2.42, 1.15], w: 0.17, h: 0.2 },
      { at: [0, 2.34, 1.38], w: 0.13, h: 0.14 },
      { at: [0, 2.28, 1.56], w: 0.13, h: 0.12 },
    ],
    { color: headPaint, bone: "head", sides: 8, name: "skull" },
  );
  b.loft(
    [
      { at: [0, 2.34, 1.02], w: 0.11, h: 0.1 },
      { at: [0, 2.23, 1.3], w: 0.1, h: 0.09 },
      { at: [0, 2.2, 1.5], w: 0.1, h: 0.08 },
    ],
    { color: headPaint, bone: "jaw", sides: 8, name: "lowerJaw" },
  );
  b.sweep(catmull([[0, 2.25, 1.4], [0, 2.235, 1.6], [0, 2.19, 1.78]]), (t) => [0.03 - 0.008 * t, 0.014], {
    color: "#3d2530",
    bone: "jaw",
    sides: 6,
    name: "tongue",
  });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), "#7a5a45", { at: [0, 2.5, 1.1], bone: "head", scale: [1, 0.8, 1] });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 6, 5), BLACK, { at: [sx * 0.037, 2.31, 1.61], bone: "head" });

    // eyes + lashes
    const E = new THREE.Vector3(sx * 0.09, 2.46, 1.12);
    b.part(new THREE.SphereGeometry(0.045, 10, 8), "#1a0f0a", { at: E, bone: "head" });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), "#ffffff", {
      at: E.clone().add(new THREE.Vector3(sx * 0.032, 0.012, 0.014)),
      bone: "head",
    });
    for (let k = 0; k < 6; k++) {
      const a = (-15 + k * 22) * DEG;
      const base = E.clone().add(new THREE.Vector3(sx * 0.012, 0.043 * Math.sin(a), 0.043 * Math.cos(a)));
      const dir = new THREE.Vector3(sx * 0.6, Math.sin(a) + 0.2, Math.cos(a)).normalize();
      b.spike(base, dir, 0.07, 0.007, { color: BLACK, bone: "head", sides: 3 });
    }

    // ears
    const out = new THREE.Vector3(sx * 0.9, 0.45, -0.25).normalize();
    const fwd = new THREE.Vector3(0, 0.2, 1);
    const outline: Array<[number, number]> = [[0, -0.035], [0.08, -0.07], [0.18, -0.06], [0.26, 0], [0.18, 0.06], [0.08, 0.07], [0, 0.035]];
    const earAt: [number, number, number] = [sx * 0.09, 2.52, 0.88];
    b.extrude(outline, { color: "#8a5a2e", at: earAt, x: out.toArray(), y: fwd.toArray(), thickness: 0.016, bevel: 0.004, bone: "head" });
    b.extrude(outline.map(([u, v]) => [u * 0.82 + 0.015, v * 0.62] as [number, number]), {
      color: "#d6a08a",
      at: earAt,
      x: out.toArray(),
      y: fwd.toArray(),
      thickness: 0.021,
      bone: "head",
    });

    // ossicones
    const base = new THREE.Vector3(sx * 0.055, 2.55, 0.97);
    const dir = new THREE.Vector3(sx * 0.06, 1, -0.2).normalize();
    const tip = base.clone().addScaledVector(dir, 0.22);
    b.capsule(base, tip, [0.034, 0.026], { color: "#85572f", bone: "head", sides: 6 });
    b.part(new THREE.IcosahedronGeometry(0.045, 0), BLACK, { at: tip, bone: "head" });
    b.spike(tip, dir, 0.1, 0.015, { color: BLACK, bone: "head", sides: 4 });
    b.ring(frame(tip, dir), { count: 6, radius: 0.012, tilt: 40 }, (item) =>
      b.spike(item, item, 0.07, 0.011, { color: BLACK, bone: "head", sides: 4 }),
    );
  }

  return b.root;
}
