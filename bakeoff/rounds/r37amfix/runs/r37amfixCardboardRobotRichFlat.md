Cause: `Chain.tip` is typed as `Joint | null`; these parent references must assert that the explicitly created tip joint exists.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
    at: [0, 1.34, 0],
=======
    parent: spine.tip!,
    at: [0, 1.34, 0],
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: spine.tip,
      names: ["shoulderL", "elbowL", "wristL"],
=======
      parent: spine.tip!,
      names: ["shoulderL", "elbowL", "wristL"],
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: spine.tip,
      names: ["shoulderR", "elbowR", "wristR"],
=======
      parent: spine.tip!,
      names: ["shoulderR", "elbowR", "wristR"],
>>>>>>> REPLACE