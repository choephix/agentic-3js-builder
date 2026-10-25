The railgun section uses `V3` as a class, but the module only defines `const V = THREE.Vector3;`, so `V3` was never declared.

<<<<<<< SEARCH
  const V = THREE.Vector3;
=======
  const V3 = THREE.Vector3;
>>>>>>> REPLACE