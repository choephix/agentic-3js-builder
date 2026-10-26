```ts
// Cause: nullable chain tips were passed where the SDK requires a JointRef, Paints were restricted to string-only helper parameters, one sharp outline tuple was incomplete, and sparkSeeds was destructured from the whole array instead of one seed row.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: any,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: any,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: any,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: any,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0, 0],
    [0.105, 0.018, "sharp"],
=======
    [0, 0, "sharp"],
    [0.105, 0.018, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: C.leatherDark ?? C.leather,
=======
    color: C.leather,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const [sx, sy, sz, nominalLength, radius] = sparkSeeds;
=======
    const [sx, sy, sz, nominalLength, radius] = sparkSeeds[i];
>>>>>>> REPLACE
```