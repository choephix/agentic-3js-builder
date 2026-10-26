Cause: `chain.joints[index]` is typed as `Joint | null`; these references must be narrowed with a non-null assertion before passing them as `JointRef`.

```ts
<<<<<<< SEARCH
    parent: torso.joints[0],
=======
    parent: torso.joints[0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: torso.joints[0],
=======
    parent: torso.joints[0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: wing.joints[1],
=======
        bone: wing.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: wing.joints[1],
=======
        bone: wing.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: wing.joints[1],
=======
      bone: wing.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: wing.joints[1],
=======
      bone: wing.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: torso.joints[1],
=======
    bone: torso.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: torso.joints[0],
=======
    bone: torso.joints[0]!,
>>>>>>> REPLACE
```