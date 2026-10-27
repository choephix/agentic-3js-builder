Cause: `Chain.tip` is nullable because a chain may not include a tip joint; use the chain’s final joint explicitly wherever a parent or bone requires a definite `Joint`.

```ts
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: neck.tip,
=======
      parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: z > 0.35 ? spine.tip : tail.nearestJoint([0, y, z]),
=======
        bone:
          z > 0.35
            ? spine.joints[spine.joints.length - 1]
            : tail.nearestJoint([0, y, z]),
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.chain.tip,
=======
      bone: leg.chain.joints[leg.chain.joints.length - 1],
>>>>>>> REPLACE