The cause is that `Chain.tip` is nullable when a chain’s names do not create a tip joint, and the pearl geometry call is hitting an incompatible Three.js constructor overload.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
    bone: [head, ...neck.joints, spine.tip],
=======
    bone: [head, ...neck.joints, spine.joints[spine.joints.length - 1]],
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.050, 8, 6), PALE, {
      at: p,
      texture: dreamPearl,
      name: "dream-pearl",
    });
=======
    bead(b, p, 0.050, PALE, undefined, "dream-pearl");
>>>>>>> REPLACE