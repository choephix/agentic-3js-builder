```ts
import * as THREE from "three";
import { createBuilder, spiral, paint, mix, mottle, spots, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Garden Snail",
  description: "A rigged garden snail with a striped spiral shell, eye stalks, lower tentacles and a two-part jaw.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });

  // Skeleton
  b.joint("root", { at: [0, 0.007, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.0035, -0.05],
      [0, 0.007, -0.02],
      [0, 0.0085, 0.015],
      [0, 0.012, 0.038],
    ],
    { parent: "root", role: "spine", names: ["spine1", "spine2", "spine3", "head"] },
  );

  // Body
  const skin = spots(mottle("#b9a27c", "#8f785a", { size: 0.012 }), "#5f4f38", { size: 0.007, amount: 0.3 });
  b.sweep(
    spine,
    (t) => {
      const f = Math.sqrt(Math.min(1, t / 0.3));
      const k = 1 - 0.3 * t;
      return [0.0105 * f * k, 0.0072 * f * k];
    },
    { color: skin, name: "body" },
  );
  // Foot sole
  b.part(new THREE.BoxGeometry(0.022, 0.004, 0.075), "#dccaa0", { at: [0, 0.002, -0.008], bone: "spine2" });
  b.part(new THREE.BoxGeometry(0.014, 0.004, 0.03), "#dccaa0", { at: [0, 0.002, -0.052], bone: "spine1" });

  // Head
  b.part(new THREE.SphereGeometry(0.0078, 8, 6), skin, { at: [0, 0.0125, 0.0405], bone: "head", scale: [1, 0.9, 1.05] });

  // Jaw
  b.joint("jaw", { parent: "head", at: [0, 0.0085, 0.043], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.008, 0.003, 0.004), "#4a3a2c", { at: [0, 0.0105, 0.0465], bone: "head" });
  b.part(new THREE.BoxGeometry(0.007, 0.0025, 0.0045), "#c98a7a", { at: [0, 0.0078, 0.0455], bone: "jaw" });

  // Tentacles
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const stalk = b.chain(
      "eyeStalk" + side,
      [
        [sx * 0.004, 0.017, 0.04],
        [sx * 0.007, 0.028, 0.046],
        [sx * 0.009, 0.04, 0.05],
      ],
      { parent: "head", role: "tentacle", names: [`eyeStalk${side}1`, `eyeStalk${side}2`, `eyeStalk${side}3`] },
    );
    b.sweep(stalk, [0.0019, 0.0011], { color: "#a69078", name: "stalk" + side });
    b.part(new THREE.SphereGeometry(0.0026, 6, 5), "#15110e", { at: [sx * 0.009, 0.0405, 0.0505], bone: `eyeStalk${side}3` });
    b.part(new THREE.SphereGeometry(0.0007, 4, 3), "#ffffff", {
      at: [sx * 0.0098, 0.0415, 0.0527],
      bone: `eyeStalk${side}3`,
    });

    const tent = b.chain(
      "tentacle" + side,
      [
        [sx * 0.005, 0.011, 0.045],
        [sx * 0.009, 0.0085, 0.057],
      ],
      { parent: "head", role: "tentacle", names: [`tentacle${side}1`, `tentacle${side}2`] },
    );
    b.sweep(tent, [0.0013, 0.0007], { color: "#b29c82", name: "tent" + side });
  }

  // Shell
  const center: [number, number, number] = [0, 0.024, -0.012];
  b.joint("shell", { parent: "spine2", at: center, dir: [1, 0, 0] });
  const r0 = 0.012;
  const path = spiral(center, [0, center[1], center[2] + r0], [1, 0, 0], { turns: 3.2, r1: 0.0025, pitch: 0.0025 });
  const base = [0.82, 0.62, 0.34] as const;
  const dark = [0.4, 0.24, 0.12] as const;
  const shellPaint = paint((p, n, s) => {
    const k = ((s[1] / 360) * 5) % 1;
    const stripe = smoothstep(0.0, 0.08, k) * smoothstep(0.42, 0.34, k);
    const tone = mix(base, [0.9, 0.74, 0.45], Math.min(1, s[0] * 0.8));
    return mix(tone, dark, stripe * 0.9);
  });
  b.sweep(path, (t) => 0.55 * r0 * Math.pow(0.21, t), {
    color: shellPaint,
    bone: "shell",
    sides: 8,
    name: "shell",
    caps: { start: "round", end: "point" },
  });
  // Aperture lip
  b.part(new THREE.TorusGeometry(0.0062, 0.0012, 4, 8), "#e8c9a0", {
    at: [0, center[1], center[2] + r0],
    rotation: [0, 90, 0],
    bone: "shell",
  });

  return b.root;
}
```