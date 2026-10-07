```ts
import * as THREE from "three";
import { createBuilder, countershade, mottle, spots, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Frog",
  description:
    "A sitting green frog with bulging gold eyes, a jointed jaw, long webbed hind legs and splayed fingers, rigged skeleton-first in a neutral rest pose.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "frog" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- skeleton core
  b.joint("root", { at: [0, 0.036, -0.045] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.036, -0.045],
      [0, 0.042, -0.01],
      [0, 0.046, 0.025],
    ],
    { role: "spine", names: ["spine1", "spine2"], parent: "root" },
  );
  b.joint("head", { parent: "spine2", at: [0, 0.046, 0.025], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.034, 0.03], dir: [0, 0, 1], role: "jaw" });

  // ---- paints
  const coat = spots(mottle("#5aa63f", "#3f8a2e", { size: 0.02, seed: 3 }), "#2b5f22", {
    size: 0.016,
    amount: 0.35,
    seed: 5,
  });
  const skin = countershade(coat, "#e6e3b0", { level: -0.1, soft: 0.3 });
  const limbSkin = countershade(
    stripes(mottle("#58a43e", "#418c30", { size: 0.02, seed: 8 }), "#2b5f22", {
      size: 0.014,
      axis: "x",
      width: 0.3,
      wobble: 0.4,
      seed: 2,
    }),
    "#dfe0a8",
    { level: -0.2, soft: 0.3 },
  );
  const jawSkin = countershade("#4f9c3b", "#efe9c0", { level: -0.5, soft: 0.3 });

  // ---- body
  b.loft(
    [
      { at: [0, 0.03, -0.058], w: 0.035, h: 0.035 },
      { at: [0, 0.036, -0.045], w: 0.078, h: 0.062 },
      { at: [0, 0.038, -0.015], w: 0.088, h: 0.07 },
      { at: [0, 0.04, 0.015], w: 0.074, h: 0.06 },
      { at: [0, 0.046, 0.04], w: 0.06, h: 0.046 },
    ],
    { color: skin, bone: [spine], sides: 12, name: "body" },
  );

  // ---- head: upper and lower jaw
  b.loft(
    [
      { at: [0, 0.052, 0.02], w: 0.07, h: 0.034 },
      { at: [0, 0.052, 0.04], w: 0.064, h: 0.032 },
      { at: [0, 0.052, 0.058], w: 0.048, h: 0.026 },
      { at: [0, 0.051, 0.079], w: 0.024, h: 0.018 },
    ],
    { color: skin, bone: "head", sides: 10, name: "upperJaw" },
  );
  b.loft(
    [
      { at: [0, 0.031, 0.034], w: 0.056, h: 0.012 },
      { at: [0, 0.031, 0.056], w: 0.042, h: 0.011 },
      { at: [0, 0.031, 0.077], w: 0.02, h: 0.009 },
    ],
    { color: jawSkin, bone: "jaw", sides: 8, name: "lowerJaw" },
  );

  // nostrils, eyes, eardrums
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0028, 6, 4), "#1e3a18", { at: [sx * 0.006, 0.0605, 0.07], bone: "head" });
    b.part(new THREE.CylinderGeometry(0.0105, 0.0105, 0.003, 10), "#7fb35a", {
      at: [sx * 0.035, 0.051, 0.018],
      rotation: [0, 0, 90],
      bone: "head",
    });
    const c = V(sx * 0.026, 0.07, 0.038);
    b.part(new THREE.SphereGeometry(0.014, 10, 8), "#dca621", { at: c, bone: "head" });
    b.part(new THREE.SphereGeometry(0.0148, 10, 5, 0, Math.PI * 2, 0, 1.1), "#4a9a38", { at: c, bone: "head" });
    const d = V(sx * 0.35, 0.15, 0.92).normalize();
    b.part(new THREE.SphereGeometry(0.0065, 8, 6), "#0b0b0b", {
      at: c.clone().addScaledVector(d, 0.0123),
      scale: [1.1, 0.55, 0.5],
      bone: "head",
    });
  }

  // ---- limbs
  for (const [sx, S] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // hind leg
    const hip = V(sx * 0.04, 0.036, -0.042);
    const knee = V(sx * 0.07, 0.03, 0.0);
    const ankle = V(sx * 0.064, 0.014, -0.05);
    const ball = V(sx * 0.064, 0.005, -0.012);
    const leg = b.chain(`leg${S}`, [hip, knee, ankle, ball], {
      role: "leg",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      parent: "root",
    });
    b.sweep(leg, [0.017, 0.013, 0.0075, 0.006], { color: limbSkin, sides: 8, name: `hindLeg${S}` });
    const foot = leg.joints[3];
    const lat = [-0.014, -0.006, 0.003, 0.012, 0.022];
    const len = [0.026, 0.034, 0.04, 0.038, 0.03];
    const tips: THREE.Vector3[] = [];
    lat.forEach((l, i) => {
      const tip = V(ball.x + sx * l, 0.004, ball.z + len[i]);
      const mid = ball.clone().lerp(tip, 0.5);
      mid.y = 0.0045;
      tips.push(tip);
      const toe = b.chain(`toe${i + 1}${S}`, [ball, mid, tip], {
        role: "digit",
        names: [`toe${i + 1}${S}a`, `toe${i + 1}${S}b`, `toe${i + 1}${S}tip`],
        parent: foot,
      });
      b.sweep(toe, [0.0036, 0.0026], { color: "#5aa63f", sides: 6, name: `toe${i + 1}${S}` });
      b.part(new THREE.SphereGeometry(0.0045, 6, 5), "#b4c872", { at: tip, bone: toe.tip! });
    });
    const web: THREE.Vector3[] = [ball.clone().setY(0.0035)];
    tips.forEach((t, i) => {
      web.push(t.clone().setY(0.0035));
      if (i < tips.length - 1) {
        const m = t.clone().lerp(tips[i + 1], 0.5).lerp(ball, 0.4);
        web.push(m.setY(0.0035));
      }
    });
    b.slab(web, { color: "#78b657", thickness: 0.002, bone: foot, name: `web${S}` });

    // foreleg
    const sh = V(sx * 0.034, 0.034, 0.02);
    const el = V(sx * 0.052, 0.02, 0.008);
    const wr = V(sx * 0.05, 0.007, 0.03);
    const palm = V(sx * 0.05, 0.004, 0.04);
    const arm = b.chain(`arm${S}`, [sh, el, wr, palm], {
      role: "arm",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      parent: "spine2",
    });
    b.sweep(arm, [0.011, 0.009, 0.006, 0.005], { color: limbSkin, sides: 8, name: `foreArm${S}` });
    const hand = arm.joints[3];
    const flat = [-0.011, -0.004, 0.004, 0.011];
    const flen = [0.016, 0.021, 0.021, 0.016];
    flat.forEach((l, i) => {
      const tip = V(palm.x + sx * l, 0.003, palm.z + flen[i]);
      const f = b.chain(`finger${i + 1}${S}`, [palm, tip], {
        role: "digit",
        names: [`finger${i + 1}${S}`, `finger${i + 1}${S}tip`],
        parent: hand,
      });
      b.sweep(f, [0.0032, 0.0024], { color: "#5aa63f", sides: 6, name: `finger${i + 1}${S}` });
      b.part(new THREE.SphereGeometry(0.0042, 6, 5), "#b4c872", { at: tip, bone: f.tip! });
    });
  }

  return b.root;
}
```