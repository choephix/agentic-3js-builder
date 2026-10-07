```ts
import * as THREE from "three";
import { createBuilder, paint, countershade, smoothstep, mix, rng } from "agentic-3js-builder";

export const meta = {
  name: "Fennec Fox",
  description: "Stylized rigged fennec fox with oversized ears, bushy dark-tipped tail, jointed legs and a separate lower jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "fennec_fox" });
  const COAT = "#e4b67c";
  const CREAM = "#f8ead2";
  const DARK = "#2a1d18";
  const PINK = "#e9a9a0";
  const coat = countershade(COAT, CREAM, { level: -0.1, soft: 0.45 });

  const sphere = (r = 1) => new THREE.SphereGeometry(r, 10, 8);

  // ---- spine ----
  b.joint("hips", { at: [0, 0.17, -0.17], dir: [0, 0, 1] });
  const spine = b.chain("spine", b.catmullPath ? [] : [[0, 0.17, -0.17], [0, 0.18, -0.02], [0, 0.2, 0.14]], {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  b.sweep(spine, [0.05, 0.068, 0.064], { color: coat, extend: [0.03, 0.02], name: "body" });
  b.part(sphere(), CREAM, { at: [0, 0.165, 0.13], scale: [0.05, 0.05, 0.05], bone: "chest" });

  // ---- neck & head ----
  const neck = b.chain("neck", [[0, 0.2, 0.14], [0, 0.265, 0.19]], {
    parent: "chest",
    names: ["neck", "head"],
    role: "neck",
  });
  b.sweep(neck, [0.044, 0.04], { color: coat, name: "neckTube" });
  b.part(sphere(), coat, { at: [0, 0.27, 0.2], scale: [0.058, 0.052, 0.056], bone: "head", name: "skull" });
  b.part(new THREE.CylinderGeometry(0.017, 0.034, 0.07, 7), COAT, {
    at: [0, 0.257, 0.265],
    dir: [0, -0.08, 1],
    bone: "head",
    name: "snout",
  });
  b.part(sphere(), DARK, { at: [0, 0.263, 0.302], scale: [0.012, 0.01, 0.011], bone: "head", name: "nose" });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.part(sphere(), CREAM, { at: [s * 0.042, 0.248, 0.215], scale: [0.03, 0.03, 0.035], bone: "head", name: "cheek" + S });
    b.part(sphere(), DARK, { at: [s * 0.033, 0.284, 0.244], scale: [0.009, 0.011, 0.008], bone: "head", name: "eye" + S });
    b.part(sphere(), "#ffffff", { at: [s * 0.035, 0.288, 0.251], scale: [0.003, 0.003, 0.003], bone: "head", name: "glint" + S });
    // dark tear stripe
    b.part(new THREE.BoxGeometry(0.005, 0.03, 0.008), "#8a5a3a", {
      at: [s * 0.036, 0.262, 0.249], bone: "head", rotation: [0, 0, s * -10], name: "tear" + S,
    });
    // ears
    const earJ = b.joint("ear" + S, { parent: "head", at: [s * 0.036, 0.305, 0.195], dir: [s * 0.35, 1, -0.1] });
    const xd = new THREE.Vector3(s, -0.35 * s * s * s * 0 + (s > 0 ? -0.35 : 0.35), 0);
    const yd = new THREE.Vector3(s * 0.35, 1, -0.1);
    const normal = new THREE.Vector3().crossVectors(xd, yd).normalize();
    const outline: Array<[number, number]> = [[-0.03, 0], [0.03, 0], [0.046, 0.07], [0.028, 0.15], [0, 0.185], [-0.02, 0.15], [-0.04, 0.07]];
    b.extrude(outline, { color: COAT, at: [s * 0.036, 0.305, 0.195], x: xd, y: yd, thickness: 0.01, bevel: 0.002, bone: earJ, name: "ear" + S });
    const inner: Array<[number, number]> = [[-0.02, 0.012], [0.02, 0.012], [0.03, 0.07], [0.016, 0.135], [0, 0.16], [-0.012, 0.135], [-0.026, 0.07]];
    b.extrude(inner, {
      color: PINK,
      at: new THREE.Vector3(s * 0.036, 0.305, 0.195).addScaledVector(normal, 0.003),
      x: xd, y: yd, thickness: 0.008, bone: earJ, name: "earInner" + S,
    });
    b.extrude([[-0.03, 0.15], [0.028, 0.15], [0, 0.185]], {
      color: "#6b4a38", at: new THREE.Vector3(s * 0.036, 0.305, 0.195), x: xd, y: yd, thickness: 0.0115, bone: earJ, name: "earTip" + S,
    });
  }

  // jaw
  b.joint("jaw", { parent: "head", at: [0, 0.247, 0.235], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.CylinderGeometry(0.012, 0.025, 0.06, 7), CREAM, {
    at: [0, 0.241, 0.268], dir: [0, -0.03, 1], bone: "jaw", name: "lowerJaw",
  });

  // ---- tail ----
  const tail = b.chain(
    "tail",
    [[0, 0.18, -0.2], [0, 0.17, -0.31], [0, 0.12, -0.4], [0, 0.07, -0.47]],
    { parent: "hips", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tailPaint = paint((p, n) => {
    const tip = smoothstep(-0.4, -0.45, p.z);
    const base = n.y < -0.2 ? mix(COAT, CREAM, 0.6) : mix(COAT, "#d29f68", 0.3);
    return mix(base, DARK, tip);
  });
  b.sweep(tail, [0.03, 0.045, 0.05, 0.026], { color: tailPaint, extend: [0.01, 0.01], name: "tail" });

  // ---- legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const front = b.chain(
      "foreLeg" + S,
      [[s * 0.04, 0.15, 0.1], [s * 0.042, 0.09, 0.085], [s * 0.04, 0.04, 0.105], [s * 0.04, 0.014, 0.115]],
      { parent: "spine2", names: ["shoulder" + S, "elbow" + S, "wrist" + S, "paw" + S], role: "leg" },
    );
    b.sweep(front, [0.024, 0.016, 0.012, 0.011], { color: paint((p, n) => mix(COAT, "#c8955c", smoothstep(0.09, 0.0, p.y) * 0.8)), name: "foreLeg" + S });
    b.part(sphere(), CREAM, { at: [s * 0.04, 0.012, 0.128], scale: [0.02, 0.014, 0.03], bone: "paw" + S, name: "forePaw" + S });

    const hind = b.chain(
      "hindLeg" + S,
      [[s * 0.05, 0.16, -0.17], [s * 0.058, 0.11, -0.13], [s * 0.05, 0.06, -0.2], [s * 0.048, 0.014, -0.178]],
      { parent: "hips", names: ["hip" + S, "knee" + S, "hock" + S, "hindPaw" + S], role: "leg" },
    );
    b.sweep(hind, [0.032, 0.02, 0.013, 0.011], { color: paint((p) => mix(COAT, "#c8955c", smoothstep(0.09, 0.0, p.y) * 0.8)), name: "hindLeg" + S });
    b.part(sphere(), COAT, { at: [s * 0.055, 0.14, -0.16], scale: [0.036, 0.05, 0.055], bone: "hip" + S, name: "thigh" + S });
    b.part(sphere(), CREAM, { at: [s * 0.048, 0.012, -0.165], scale: [0.02, 0.014, 0.03], bone: "hindPaw" + S, name: "hindPawPad" + S });
  }

  return b.root;
}
```

Not run: `b.catmullPath` is not an SDK member, and the spine chain still takes the points array through that line's fallback. The SDK exports no `catmull` here, so the spine, neck and tail go in as polylines.