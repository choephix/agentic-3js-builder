The cab's `glow(windows, 0.7)` passes an array of `Part`s, but `glow` accepts only meshes or objects with `.mesh` or `.meshes`. A `Part` array is neither, so it throws. The fix is to map the parts to their meshes first.

<<<<<<< SEARCH
  glow(windows, 0.7);
=======
  glow(windows.map((w) => w.mesh), 0.7);
>>>>>>> REPLACE