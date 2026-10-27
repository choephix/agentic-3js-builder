The errors come from using nullable chain tips as parents/bones, passing plain objects where `Frame`s are required, and supplying tuple coordinates where `Vector3`s are required.

```text
<<<<<<< SEARCH
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
=======
    { parent: spine, names: ["neck", "neckTip"], role: "neck" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.2, 0.78], dir: [0, 0.08, 1], role: "head" });
=======
  const head = b.joint("head", { parent: neck, at: [0, 1.2, 0.78], dir: [0, 0.08, 1], role: "head" });
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(
    [
      { at: [0.13, 1.34, 1.5], axis: [0.08, 0.82, 0.18] },
      { at: [-0.02, 1.52, 1.53], axis: [-0.12, 0.7, 0.25] },
      { at: [0.08, 1.72, 1.48], axis: [0.16, 0.58, 0.2] },
    ],
=======
  b.cards(
    [
      b.frame(new THREE.Vector3(0.13, 1.34, 1.5), new THREE.Vector3(0.08, 0.82, 0.18)),
      b.frame(new THREE.Vector3(-0.02, 1.52, 1.53), new THREE.Vector3(-0.12, 0.7, 0.25)),
      b.frame(new THREE.Vector3(0.08, 1.72, 1.48), new THREE.Vector3(0.16, 0.58, 0.2)),
    ],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.surface(strap).nearest([0.14, 1.08, 0.48]),
      b.surface(strap).nearest([-0.14, 1.08, 0.48]),
=======
      b.surface(strap).nearest(new THREE.Vector3(0.14, 1.08, 0.48)),
      b.surface(strap).nearest(new THREE.Vector3(-0.14, 1.08, 0.48)),
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine,
>>>>>>> REPLACE
```