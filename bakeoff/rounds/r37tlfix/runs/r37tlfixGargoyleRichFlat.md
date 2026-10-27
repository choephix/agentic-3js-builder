```ts
// Cause: `.tip` is null when a chain has only one joint per path span; use the Chain itself as the parent/bone, and pass a Frame rather than a Vector3 to `ring()`.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck,
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: spine.tip,
=======
          parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
        wingChains.push(wing);
=======
        wingChains.push(wing);
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.ring(p, { count: 6, radius: 0.008, fromDeg: 0, toDeg: 360 }, (r: any) =>
=======
      b.ring({ at: p, axis: horn.tangentAt(0.25 + j * 0.2) }, { count: 6, radius: 0.008, fromDeg: 0, toDeg: 360 }, (r: any) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
    cone(0.11, 0.22, STONE_LIGHT, [0.34 * s, 1.29, 0.27], spine.tip, "shoulder_boss");
=======
    cone(0.11, 0.22, STONE_LIGHT, [0.34 * s, 1.29, 0.27], spine, "shoulder_boss");
>>>>>>> REPLACE
```