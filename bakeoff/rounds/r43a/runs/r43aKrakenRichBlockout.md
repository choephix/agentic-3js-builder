```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Kraken Rising",
  description: "Blockout of a kraken rising from the water with eight spread tentacles, mantle, eyes and jaw.",
};

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const SKIN = "#3b8fa8";
  const BELLY = "#e9a96b";
  const DARK = "#1f4f66";
  const BEAK = "#f2d9a0";

  const core = b.joint("hips", { at: [0, 1.6, 0], role: "spine" });

  // body spine: rises up into mantle
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.6, 0],
      [0, 2.3, -0.1],
      [0, 3.0, -0.4],
      [0, 3.7, -0.8],
    ]),
    { parent: core, role: "spine", names: ["spine1", "spine2", "spine3", "mantleTip"] },
  );
  b.sweep(spine, [1.1, 0.9, 0.8, 0.2], { color: SKIN });

  // head / front mass
  const head = b.joint("head", { parent: core, at: [0, 1.9, 0.5], dir: [0, 0, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.9, 10, 8), SKIN, { bone: head, at: [0, 1.9, 0.4], scale: [1.1, 0.9, 1] });
  b.part(new THREE.SphereGeometry(0.3, 8, 6), "#ffd84a", { bone: head, at: [0.55, 2.15, 1.1] });
  b.part(new THREE.SphereGeometry(0.3, 8, 6), "#ffd84a", { bone: head, at: [-0.55, 2.15, 1.1] });
  b.part(new THREE.SphereGeometry(0.12, 6, 4), "#111", { bone: head, at: [0.55, 2.15, 1.38] });
  b.part(new THREE.SphereGeometry(0.12, 6, 4), "#111", { bone: head, at: [-0.55, 2.15, 1.38] });

  // jaw: upper and lower beak
  b.part(new THREE.ConeGeometry(0.25, 0.5, 6), BEAK, { bone: head, at: [0, 1.65, 1.35], dir: [0, -0.3, 1] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.5, 1.1], dir: [0, -0.2, 1], role: "jaw" });
  b.part(new THREE.ConeGeometry(0.22, 0.45, 6), BEAK, { bone: jaw, at: [0, 1.4, 1.3], dir: [0, 0.3, 1] });

  // mantle fins
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.8, 3.0, -0.4],
        [s * 1.9, 3.3, -0.7],
        [s * 1.5, 3.9, -0.8],
        [s * 0.5, 3.7, -0.7],
      ],
      { color: DARK, thickness: 0.08, bone: spine.joints[2] },
    );
  }

  // eight tentacles spread, rising from water
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const root: [number, number, number] = [dx * 0.6, 1.5, dz * 0.6];
    const rise = i % 2 ? 2.2 : 1.4;
    const path = catmull([
      root,
      [dx * 1.5, 1.2, dz * 1.5],
      [dx * 2.6, rise, dz * 2.6],
      [dx * 3.6, rise + 0.9, dz * 3.6],
      [dx * 4.3, rise + (i % 2 ? 1.9 : 0.3), dz * 4.3],
    ]);
    const t = b.chain(`tentacle${i + 1}_`, path, { parent: core, role: "tentacle", count: 4 });
    b.sweep(t, [0.42, 0.04], { colors: undefined, color: SKIN, caps: { end: "point" } } as any);
  }

  // water floor disc (sunk slightly)
  b.part(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 10), DARK, { bone: core, at: [0, 0.18, 0] });
  b.part(new THREE.CylinderGeometry(1.1, 1.3, 0.2, 10), BELLY, { bone: core, at: [0, 1.0, 0.2] });

  return b.root;
}
```