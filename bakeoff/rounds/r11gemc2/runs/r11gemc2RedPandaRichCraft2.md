`offset()` returned a `THREE.Vector3` whose coordinates were indexed as an array (`bellPos[0]..[2]`) instead of vector properties, evaluating to `NaN`/`undefined` in the tassel sweep path.

<<<<<<< SEARCH
  // Golden bell and twin hanging silk tassels
  const bellPos = offset(broochPos, [0, -1, 0], 0.03);
  b.part(new THREE.SphereGeometry(0.012, 10, 8), GOLD, {
=======
  // Golden bell and twin hanging silk tassels
  const bellPos: [number, number, number] = [
    broochPos[0],
    broochPos[1] - 0.03,
    broochPos[2],
  ];
  b.part(new THREE.SphereGeometry(0.012, 10, 8), GOLD, {
>>>>>>> REPLACE