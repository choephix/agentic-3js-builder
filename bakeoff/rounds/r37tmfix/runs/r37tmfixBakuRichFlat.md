```ts
// Cause: nullable Chain.tip and RingItem.bone values were passed where the SDK requires a definite joint; the ear outlines also inferred plain two-number tuples instead of sharp outline points.

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.chain.tip,
=======
        bone: leg.chain.joints[leg.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.chain.tip,
=======
        bone: leg.chain.joints[leg.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
          bone: item.bone,
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.13, 0],
=======
    [-0.13, 0, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0.11, 0],
=======
    [0.11, 0, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [-0.085, 0.025],
=======
        [-0.085, 0.025, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [0.06, 0.025],
=======
        [0.06, 0.025, "sharp"],
>>>>>>> REPLACE
```