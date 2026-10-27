```ts
// Cause: Chain.tip is nullable when the chain has no explicit tip joint; use the Chain itself as a parent, assert known limb tips, and query surfaces with a valid SurfaceTarget.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
    at: neck.tip.at,
=======
    parent: neck,
    at: neck.at(1).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: spine.tip,
=======
        parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: foot,
=======
      bone: foot!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: hand,
=======
      bone: hand!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const chestHit = b.surface(spine).around(spine.at(0.72).at).at(0, 8);
=======
  const chestHit = b.surface(b.root).around(spine.at(0.72).at).at(0, 8);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(spine, SIGIL, {
=======
    b.decal(b.root, SIGIL, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(spine, CRACK, {
=======
    b.decal(b.root, CRACK, {
>>>>>>> REPLACE
```