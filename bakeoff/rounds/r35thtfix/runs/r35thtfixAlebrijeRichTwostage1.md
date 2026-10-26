```ts
// Cause: chain.tip is typed as Joint | null, so tip-based parents, bones, positions, and frames must be narrowed with `!` after defining chains with an explicit tip joint.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
        at: leg.tip.at,
=======
        bone: leg.tip!,
        at: leg.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip.moved([-0.13, 0, 0]),
=======
    tail.tip!.moved([-0.13, 0, 0]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip.moved([0, 0.03, 0]),
=======
    tail.tip!.moved([0, 0.03, 0]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    tail.tip.moved([0.13, 0, 0]),
=======
    tail.tip!.moved([0.13, 0, 0]),
>>>>>>> REPLACE
```