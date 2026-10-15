`surface.loop()` returns a Path, so `collarLoop.at(0.5)` is a `Vector3` with no `.at` property, and `throat.at` was undefined. I wrapped the point as `{ at: ... }` so every later `throat.at` use works unchanged.

<<<<<<< SEARCH
  const throat = collarLoop.at(0.5);
=======
  const throat = { at: new THREE.Vector3().copy(collarLoop.at(0.5)) };
>>>>>>> REPLACE