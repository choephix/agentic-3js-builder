Cause: chain `.tip` is typed as `Joint | null`; use the chain itself as the `parent`/`bone` reference, since `JointRef` accepts a `Chain` and it resolves to the chain’s terminal joint.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: wingL.tip,
=======
    bone: wingL,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: wingR.tip,
=======
    bone: wingR,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: tail.tip,
=======
        bone: tail,
>>>>>>> REPLACE
```