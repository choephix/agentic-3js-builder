Cause: nullable chain tips were passed as joint references, and `role` was supplied to `sweep`, which does not accept that option.

```ts
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
      role: "leg",
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    { bone: trunk.tip, at: trunk.tip.at, scale: [1.2, 0.7, 0.9], name: "trunk nostril end" },
=======
    { bone: trunk.tip!, at: trunk.tip!.at, scale: [1.2, 0.7, 0.9], name: "trunk nostril end" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { bone: trunk.tip, at: [s * 0.045, 1.025, 1.55], name: "nostril glint" },
=======
      { bone: trunk.tip!, at: [s * 0.045, 1.025, 1.55], name: "nostril glint" },
>>>>>>> REPLACE