Cause: nullable `.tip` handles were passed where the SDK requires a definite `JointRef`, and `b.along` callbacks accept only one frame parameter.

```text
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: hindChain.tip,
=======
      bone: hindChain.joints[hindChain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: foreChain.tip,
=======
      bone: foreChain.joints[foreChain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: hindChain.tip,
=======
      bone: hindChain.joints[hindChain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: foreChain.tip,
=======
      bone: foreChain.joints[foreChain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: spine.tip,
=======
        parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: spine.tip,
=======
        parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(tailTube, 6, (at, i) => {
    const h = 0.11 * (1 - i / 7);
    b.spike(at, at, h, 0.035 * (1 - i / 8), {
=======
  b.along(tailTube, 6, (at) => {
    const h = 0.11 * (1 - at.t / 7);
    b.spike(at, at, h, 0.035 * (1 - at.t / 8), {
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(spine, 4, (at, i) => {
    b.spike(at, [0, 1, -0.15], 0.13 - i * 0.018, 0.045 - i * 0.006, {
=======
  b.along(spine, 4, (at) => {
    b.spike(at, [0, 1, -0.15], 0.13 - at.t * 0.018, 0.045 - at.t * 0.006, {
>>>>>>> REPLACE
```