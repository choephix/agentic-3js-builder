The cause is the stray line `lit(new THREE.Mesh(), 0)`: a bare `Mesh` has no `MeshStandardMaterial`, so `glow` throws. The fix is to delete it.

<<<<<<< SEARCH
  lit(new THREE.Mesh(), 0) as any; // no-op placeholder avoided below
=======
>>>>>>> REPLACE