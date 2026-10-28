`b.surface` takes meshes, Parts or Sweeps, not a Chain, so the body sweep must be kept and passed instead of `spine`.

<<<<<<< SEARCH
  b.sweep(spine, (t) => [0.27 + 0.03 * t, 0.32 + 0.03 * t], { color: coat, sides: 12, name: "body" });
=======
  const bodySweep = b.sweep(spine, (t) => [0.27 + 0.03 * t, 0.32 + 0.03 * t], { color: coat, sides: 12, name: "body" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodyMesh = b.surface(spine);
=======
  const bodyMesh = b.surface(bodySweep);
>>>>>>> REPLACE