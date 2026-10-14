import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "red-eyed tree frog",
  description:
    "Lime-green tree frog clinging to a leaf, with blue and cream flank stripes, orange sticky toe pads, ruby eyes with black slit pupils, and a startled pose.",
};

const LIME = "#8fe03a";
const LIME_DARK = "#6cbf2a";
const CREAM = "#f3eed8";
const BLUE = "#2a6fdb";
const ORANGE = "#ff7a1a";
const RUBY = "#c4122f";
const BLACK = "#0a0a0a";
const WHITE = "#ffffff";
const LEAF = "#2f8f3a";
const VEIN = "#5fb84a";

const ball = (r: number, w = 12, h = 9) => new THREE.SphereGeometry(r, w, h);

// Body half-widths at a given z, from the body ellipsoid (centre z -0.01).
const BODY_Z = -0.01;
const BODY_HZ = 0.045;
const bodyFactor = (z: number) => {
  const d = (z - BODY_Z) / BODY_HZ;
  return Math.sqrt(Math.max(0, 1 - d * d));
};

export default function build() {
  const b = createBuilder({ name: "red-eyed-tree-frog" });

  // ---- Leaf (prop, sits on the floor, its top at y = 0.004) ----
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.17);
  leafShape.bezierCurveTo(0.12, -0.12, 0.12, 0.12, 0, 0.17);
  leafShape.bezierCurveTo(-0.12, 0.12, -0.12, -0.12, 0, -0.17);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.004,
    bevelEnabled: false,
    curveSegments: 16,
  });
  leafGeo.rotateX(-Math.PI / 2); // lie flat, extrusion goes up to y = 0.004

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.06, BODY_Z] });
  const head = b.joint("head", { at: [0, 0.09, 0.036], parent: hips });

  // ---- Leaf and midrib ----
  b.part(leafGeo, LEAF, { at: [0, 0, 0], bone: hips });
  b.sweep(
    [
      [0, 0.005, -0.15],
      [0, 0.005, -0.05],
      [0, 0.005, 0.05],
      [0, 0.005, 0.15],
    ],
    0.0022,
    { color: VEIN },
  );

  // ---- Body ----
  b.part(ball(1), LIME, {
    at: [0, 0.06, BODY_Z],
    bone: hips,
    scale: [0.034, 0.03, 0.045],
  });
  b.part(ball(1), CREAM, {
    at: [0, 0.047, -0.006],
    bone: hips,
    scale: [0.026, 0.019, 0.04],
  });

  // Flank stripes: blue and cream bands wrapping the sides of the body.
  const stripeZ = [-0.03, -0.006, 0.018];
  stripeZ.forEach((z, i) => {
    const f = bodyFactor(z) * 1.05;
    const rx = 0.034 * f;
    const ry = 0.03 * f;
    const color = i % 2 === 0 ? BLUE : CREAM;
    for (const s of [1, -1]) {
      const path: number[][] = [];
      for (let k = 0; k < 5; k++) {
        const th = 0.45 + k * 0.42;
        path.push([s * rx * Math.sin(th), 0.06 + ry * Math.cos(th), z]);
      }
      b.sweep(path, 0.0045, { color });
    }
  });

  // ---- Head ----
  b.part(ball(1), LIME, {
    at: [0, 0.09, 0.036],
    bone: head,
    scale: [0.03, 0.024, 0.028],
  });

  // ---- Eyes: enormous ruby spheres, black slit pupils, catchlights ----
  for (const s of [1, -1]) {
    const ex = 0.022 * s;
    const ey = 0.1;
    const ez = 0.05;
    b.part(ball(0.016, 14, 10), RUBY, { at: [ex, ey, ez], bone: head });
    b.part(ball(0.008, 8, 6), BLACK, {
      at: [ex, ey, ez + 0.014],
      bone: head,
      scale: [0.35, 1, 0.6],
    });
    b.part(ball(0.0035, 6, 4), WHITE, {
      at: [ex + 0.006 * s, ey + 0.008, ez + 0.011],
      bone: head,
    });
  }

  // ---- Limbs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Front arm: elbow out and forward, wrist planted on the leaf.
    const shoulder = [0.03 * s, 0.074, 0.028] as [number, number, number];
    const elbow = [0.056 * s, 0.062, 0.05] as [number, number, number];
    const wrist = [0.068 * s, 0.032, 0.062] as [number, number, number];
    b.joint("shoulder" + S, { at: shoulder, parent: hips });
    b.joint("elbow" + S, { at: elbow, parent: b.root ? undefined : undefined });
    b.joint("wrist" + S, { at: wrist });
    b.sweep([shoulder, elbow], 0.0068, { color: LIME });
    b.sweep([elbow, wrist], 0.0055, { color: LIME });

    const frontTips: [number, number, number][] = [
      [0.084 * s, 0.0095, 0.07],
      [0.08 * s, 0.0095, 0.082],
      [0.068 * s, 0.0095, 0.088],
    ];
    frontTips.forEach((tip) => {
      b.sweep([wrist, tip], 0.0036, { color: LIME });
      b.part(ball(0.0058, 8, 6), ORANGE, { at: tip, bone: "wrist" + S } as never);
    });

    // Rear leg: thigh, knee raised high, ankle down, long folded foot.
    const hip = [0.03 * s, 0.062, -0.03] as [number, number, number];
    const knee = [0.084 * s, 0.08, -0.02] as [number, number, number];
    const ankle = [0.064 * s, 0.03, -0.07] as [number, number, number];
    b.joint("thigh" + S, { at: hip, parent: hips });
    b.joint("knee" + S, { at: knee });
    b.joint("ankle" + S, { at: ankle });
    b.sweep([hip, knee], 0.0085, { color: LIME });
    b.sweep([knee, ankle], 0.0065, { color: LIME });

    const rearTips: [number, number, number][] = [
      [0.07 * s, 0.0095, -0.09],
      [0.062 * s, 0.0095, -0.1],
      [0.05 * s, 0.0095, -0.106],
      [0.038 * s, 0.0095, -0.1],
    ];
    rearTips.forEach((tip) => {
      b.sweep([ankle, tip], 0.0034, { color: LIME_DARK });
      b.part(ball(0.0058, 8, 6), ORANGE, { at: tip, bone: "ankle" + S } as never);
    });
  }

  return b.root;
}
