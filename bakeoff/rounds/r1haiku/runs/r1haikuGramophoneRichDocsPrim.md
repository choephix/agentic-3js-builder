This is a single module of primitives: a walnut cabinet with a pale inlaid pattern, a lathe-turned morning-glory horn with a green-patina brass finish, a record and tonearm, a side crank and claw feet. I have not run it, so check the output in the viewer.

```ts
import * as THREE from "three";
import { createBuilder, frame, grain, mottle, spots } from "agentic-3js-builder";

export const meta = {
  name: "Antique gramophone",
  description:
    "Walnut cabinet with pale floral inlay, a brass morning-glory horn with warm green patina, a black record with a red label, a silver tonearm, a side crank and claw feet.",
};

const WALNUT_L = "#7a4b2a";
const WALNUT_D = "#422613";
const PALE = "#e9dcc0";
const BLACK = "#121212";
const RED = "#b3202a";
const SILVER = "#c9ced6";
const BRASS = "#c9a24a";
const PATINA = "#6f9276";

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // Paints
  const wood = spots(grain(WALNUT_L, WALNUT_D, { size: 0.06, axis: "x", seed: 4 }), PALE, {
    size: 0.1,
    amount: 0.2,
    rosette: true,
    seed: 5,
  });
  const woodDark = grain(WALNUT_D, "#2c190c", { size: 0.05, axis: "x", seed: 9 });
  const brass = mottle(BRASS, PATINA, { size: 0.12, contrast: 0.6, seed: 2 });

  // Root skeleton joint (the gramophone is rigid scenery)
  b.joint("cabinet", { at: [0, 0, 0] });

  // Cabinet body and top moulding
  b.part(new THREE.BoxGeometry(0.5, 0.34, 0.46), wood, { at: [0, 0.27, 0] });
  b.part(new THREE.BoxGeometry(0.54, 0.03, 0.5), woodDark, { at: [0, 0.455, 0] });

  // Claw feet: a leg, a ball and three toes at each corner
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 0.21;
      const z = sz * 0.19;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 8), brass, { at: [x, 0.05, z] });
      b.part(new THREE.SphereGeometry(0.035, 8, 6), brass, { at: [x, 0.03, z] });
      for (const [ox, oz] of [
        [1, 0],
        [-0.5, 0.87],
        [-0.5, -0.87],
      ])
        b.spike([x, 0.04, z], [ox * 0.5, -0.8, oz * 0.5], 0.05, 0.012, { color: brass });
    }

  // Turntable platter, record, red label and spindle
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.014, 24), brass, { at: [0, 0.477, 0] });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.012, 32), BLACK, { at: [0, 0.4905, 0] });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.002, 20), RED, { at: [0, 0.498, 0] });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 8), SILVER, { at: [0, 0.5, 0] });

  // Tonearm: pivot post, silver arm and head
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10), brass, { at: [0.19, 0.5, -0.14] });
  b.rod([0.19, 0.52, -0.14], [0.1, 0.53, 0.02], 0.008, { color: SILVER });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.04), SILVER, { at: [0.1, 0.527, 0.03] });

  // Horn: a lathe-turned flaring bell from a neck at the back of the cabinet
  const N = [0, 0.6, -0.2];
  const dv = new THREE.Vector3(0, 0.4, 0.5).normalize();
  const L = 0.64;
  const Nv = new THREE.Vector3(...N);
  const Mv = Nv.clone().addScaledVector(dv, L);
  const M = [Mv.x, Mv.y, Mv.z];
  const D = [dv.x, dv.y, dv.z];

  // Support from the cabinet to the horn neck
  b.rod([0, 0.47, -0.2], N, 0.018, { color: brass });

  // Profile as [radius, distance along the horn]: outer flare up, inner wall back down
  const outer = [
    [0.022, 0],
    [0.028, 0.15],
    [0.055, 0.3],
    [0.11, 0.5],
    [0.21, 0.7],
    [0.31, 0.87],
    [0.34, 1],
  ];
  const inner = [
    [0.325, 1],
    [0.3, 0.87],
    [0.2, 0.7],
    [0.1, 0.5],
    [0.045, 0.3],
    [0.018, 0.15],
    [0.012, 0],
  ];
  const profile = [...outer, ...inner].map(([r, t]) => [r, t * L]);
  b.lathe(profile, { at: N, axis: D, segments: 14, smoothing: 0, color: brass });

  // Flared rim and scalloped morning-glory petals around the mouth
  b.part(new THREE.TorusGeometry(0.34, 0.01, 6, 20), brass, { at: M, dir: D, axis: "z" });
  b.ring(frame(M, D), { count: 10, radius: 0.345 }, (item) =>
    b.part(new THREE.SphereGeometry(0.04, 6, 4), brass, { at: item }),
  );

  // Side crank on the cabinet's left (+X) flank
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 16), brass, {
    at: [0.265, 0.3, 0.05],
    rotation: [0, 0, 90],
  });
  b.rod([0.265, 0.3, 0.05], [0.3, 0.3, 0.05], 0.01, { color: brass });
  b.rod([0.3, 0.3, 0.05], [0.3, 0.3, 0.14], 0.008, { color: brass });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), woodDark, { at: [0.3, 0.3, 0.15] });

  return b.root;
}
```