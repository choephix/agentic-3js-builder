Cause: `Chain.tip` is typed as `Joint | null`, so nullable tips cannot be passed as parents or bones; use the known terminal entries in each chain’s `joints` array instead.

<<<<<<< SEARCH
  const neck = b.chain("neck", neckPath, {
    parent: torso.tip,
=======
  const neck = b.chain("neck", neckPath, {
    parent: torso.joints[torso.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: neck.tip,
=======
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [side, hand] of [
    [1, armL.tip],
    [-1, armR.tip],
  ] as const) {
=======
  for (const [side, hand] of [
    [1, armL.joints[armL.joints.length - 1]],
    [-1, armR.joints[armR.joints.length - 1]],
  ] as const) {
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: hand,
=======
        bone: hand,
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [side, foot] of [
    [1, legL.tip],
    [-1, legR.tip],
  ] as const) {
=======
  for (const [side, foot] of [
    [1, legL.joints[legL.joints.length - 1]],
    [-1, legR.joints[legR.joints.length - 1]],
  ] as const) {
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: foot,
=======
        bone: foot,
>>>>>>> REPLACE