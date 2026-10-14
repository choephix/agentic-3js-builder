```ts
import * as THREE from "three";
import { createBuilder, mottle, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Octopus",
  description: "A stylized common octopus resting on the sea floor, with eight splayed, curling arms, suckers, slit-pupil eyes and a jointed beak.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "octopus" });

  const skin = countershade(
    mottle("#d4572f", "#8f2c26", { size: 0.07, seed: 3, contrast: 1.2 }),
    "#f0c4a0",
    { level: -0.2, soft: 0.5 },
  );
  const mantleSkin = mottle("#c24a2b", "#7d2423", { size: 0.09, seed: 8 });

  // Skeleton
  const root = b.joint("root", { at: [0, 0.06, 0], dir: [0, 0, 1] });
  const head = b.joint("head", { parent: root, at: [0, 0.14, -0.02], dir: [0, 1, -0.35], role: "head" });
  const jaw = b.joint("jaw", { parent: root, at: [0, 0.03, 0.06], dir: [0, 0, 1], role: "jaw" });

  // Body disc + mantle
  b.lathe(
    [[0, 0], [0.17, 0], [0.24, 0.035], [0.22, 0.09], [0.12, 0.13], [0, 0.14]],
    { color: skin, at: [0, 0, 0], bone: root, segments: 12, name: "body" },
  );
  const mantle = b.lathe(
    [[0, 0], [0.15, 0.0], [0.2, 0.06], [0.205, 0.14], [0.16, 0.25], [0.09, 0.33], [0, 0.365]],
    { color: mantleSkin, at: [0, 0.08, -0.03], axis: [0, 1, -0.4], bone: head, segments: 10, name: "mantle" },
  );

  // Siphon
  b.capsule([0.1, 0.08, 0.17], [0.13, 0.1, 0.27], 0.022, { color: "#b44a2c", bone: root, name: "siphon" });

  // Beak
  b.spike([0, 0.045, 0.1], [0, -0.3, 1], 0.05, 0.022, { color: "#2a1a14", bone: root, name: "beakUpper" });
  b.spike([0, 0.02, 0.1], [0, 0.2, 1], 0.045, 0.016, { color: "#3a241a", bone: jaw, name: "beakLower" });

  // Eyes
  const surf = b.surface(mantle);
  const ball = new THREE.SphereGeometry(0.045, 8, 6);
  const slit = new THREE.BoxGeometry(0.05, 0.008, 0.014);
  const lid = new THREE.SphereGeometry(0.052, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.45);
  for (const s of [1, -1]) {
    const hit = surf.ray([s * 0.34, 0.24, 0.22], [-s * 0.8, -0.05, -0.55]);
    if (!hit) continue;
    const eye = b.stick(ball, "#e6b84a", hit, { embed: 0.45, name: s > 0 ? "eyeL" : "eyeR", bone: head });
    b.part(slit, "#0d0d10", { frame: eye, at: eye.local([0, 0.04, 0]), bone: head, name: "pupil" });
    b.part(lid, "#a63c27", { frame: eye, at: eye.local([0, 0.006, 0]), bone: head, name: "lid", scale: 1.0 });
  }

  // Arms
  const sucker = new THREE.SphereGeometry(1, 6, 4);
  sucker.scale(1, 0.5, 1);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const p = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const w = 0.05 * Math.sin(i * 1.7 + 0.5);
    const pt = (r: number, y: number, l: number) =>
      d.clone().multiplyScalar(r).addScaledVector(p, l).setY(y);
    const path = [
      pt(0.1, 0.05, 0),
      pt(0.3, 0.048, w * 0.5),
      pt(0.48, 0.04, w),
      pt(0.62, 0.05, w * 0.3),
      pt(0.72, 0.11, -w * 0.5),
      pt(0.76, 0.2, -w),
    ];
    const chain = b.chain(`arm${i + 1}`, path, {
      parent: root,
      count: 5,
      role: "tentacle",
      names: [`arm${i + 1}a`, `arm${i + 1}b`, `arm${i + 1}c`, `arm${i + 1}d`, `arm${i + 1}e`],
      up: [0, 1, 0],
    });
    const sw = b.sweep(chain, (t) => 0.05 * Math.pow(1 - t, 1.1) + 0.006, {
      color: skin,
      sides: 8,
      name: `arm${i + 1}`,
      extend: [0.06, 0],
    });
    for (let k = 0; k < 8; k++) {
      const t = 0.1 + k * 0.1;
      const size = 0.017 * (1 - t) + 0.005;
      for (const ang of [150, 210]) {
        const at = sw.at(t + (ang === 210 ? 0.05 : 0), ang);
        b.stick(sucker, "#f5dcc2", at, { scale: size, embed: 0.3, name: "sucker" });
      }
    }
  }

  return b.root;
}
```