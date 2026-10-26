```ts
// Cause: nullable chain tips were passed where the SDK requires a definite JointRef; the jaw/trunk tip and hoof bone helpers need non-null assertions.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: typeof hindL.tip,
=======
    bone: NonNullable<typeof hindL.tip>,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const whiskerBone = upperJaw.tip;
=======
  const whiskerBone = upperJaw.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: lowerJaw.joints[lowerJaw.joints.length - 1],
=======
    bone: lowerJaw.joints[lowerJaw.joints.length - 1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: upperJaw.joints[1],
=======
        bone: upperJaw.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.joints[chain.joints.length - 1],
=======
        bone: chain.joints[chain.joints.length - 1]!,
>>>>>>> REPLACE
```