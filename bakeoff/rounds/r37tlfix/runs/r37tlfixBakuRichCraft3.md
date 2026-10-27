Cause: several chains were given nullable `.tip` handles because their `names` arrays created no tip joint; the dream cards used a plain object instead of an SDK `Frame`, and `ChainPoint` has no `radius` property.

```ts
<<<<<<< SEARCH
  catmull,
  polyline,
  rng,
=======
  catmull,
  frame,
  polyline,
  rng,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neck1", "neck2", "neck3"],
=======
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[spine.joints.length - 1],
    names: ["neck1", "neck2", "neck3"],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: neck.tip,
=======
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
      color: GOLD,
=======
      bone: spine.joints[spine.joints.length - 1],
      color: GOLD,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [
        {
          at: new THREE.Vector3(...d.at),
          axis: new THREE.Vector3(...d.n).normalize(),
        } as any,
      ],
=======
      [frame(new THREE.Vector3(...d.at), new THREE.Vector3(...d.n).normalize())],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const at = trunk.at(i / 6);
    b.ring(at, { count: 8, radius: at.radius ? at.radius * 0.98 : 0.095 }, (r) =>
=======
    const at = trunk.at(i / 6);
    b.ring(at, { count: 8, radius: 0.095 }, (r) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: trunk.tip,
    at: [0, 0.61, 0.93],
=======
    bone: trunk.joints[trunk.joints.length - 1],
    at: [0, 0.61, 0.93],
>>>>>>> REPLACE
```