```ts
// Cause: nullable chain tips must be narrowed before being used as JointRef values, and b.along() callback frames do not expose a t property.

<<<<<<< SEARCH
          parent: frontLeg.tip,
=======
          parent: frontLeg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: rearLeg.tip,
=======
          parent: rearLeg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
=======
        bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        0.72 + 0.16 * at.t,
=======
        0.72 + 0.16 * (at.i / 4),
>>>>>>> REPLACE
```