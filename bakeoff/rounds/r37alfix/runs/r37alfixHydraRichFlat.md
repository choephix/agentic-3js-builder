The errors come from using nullable `.tip` handles where the supplied `names` arrays create no tip joint, plus callbacks/options that do not match the SDK overloads.

```ts
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: chain.tip,
=======
      parent: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: foot,
=======
        bone: leg.joints[leg.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(tail, 8, (at: any, i: number) =>
=======
  b.along(tail, 8, (at: any) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.tip,
=======
      bone: tail.joints[tail.joints.length - 1],
>>>>>>> REPLACE