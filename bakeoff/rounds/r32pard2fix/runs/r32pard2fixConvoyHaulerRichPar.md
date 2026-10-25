Cause: in `buildCab`, a leftover placeholder `b.sweep` was given two identical points `[[0,0,0],[0,0,0]]`, which `polyline()` rejects because it needs at least 2 distinct points. It was a zero-radius, zero-strength dummy, so removing it changes nothing visible.

<<<<<<< SEARCH
  lit(
    b.sweep(
      new THREE.CatmullRomCurve3([]) as any ? [[0, 0, 0], [0, 0, 0]] : [[0, 0, 0], [0, 0, 0]],
      0.001,
      { bone, color: P.neonCyan },
    ),
    0,
  );
=======
>>>>>>> REPLACE