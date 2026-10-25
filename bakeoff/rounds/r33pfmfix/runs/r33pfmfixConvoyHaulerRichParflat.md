The cause: in `buildTurret`, the stray line `glow(new THREE.Mesh(), 1) && 0;` passes a bare `THREE.Mesh` with the default material, which is a `MeshBasicMaterial` rather than a `MeshStandardMaterial`, so `glow` throws. The line does nothing useful, so I removed it.

<<<<<<< SEARCH
  glow(new THREE.Mesh(), 1) && 0;
=======
>>>>>>> REPLACE