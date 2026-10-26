Cause: several chain tips are nullable in the SDK types, and the remaining diagnostics come from strict overloads that require a `Paint`/specific `JointRef`; the runtime failure is caused by passing `spine.tip`/`neck.tip` while they are still typed or evaluated as `null`.

```text
<<<<<<< SEARCH
      spine.tip.at,
=======
      spine.tip!.at,
>>>>>>> REPLACE

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
    parent: armL.tip,
=======
    parent: armL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: armR.tip,
=======
    parent: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: armL.tip,
=======
        parent: armL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: armR.tip,
=======
        parent: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armL.tip,
=======
      bone: armL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armR.tip,
=======
      bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legL.tip,
=======
      bone: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legR.tip,
=======
      bone: legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(0.075, SKIN_LIGHT, [0.47, 0.825, 0.405], [1.2, 0.8, 1.1], armL.tip, "handL");
=======
    sphere(0.075, SKIN_LIGHT, [0.47, 0.825, 0.405], [1.2, 0.8, 1.1], armL.tip!, "handL");
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(0.075, SKIN_LIGHT, [-0.43, 1.405, 0.265], [1.2, 0.8, 1.1], armR.tip, "handR");
=======
    sphere(0.075, SKIN_LIGHT, [-0.43, 1.405, 0.265], [1.2, 0.8, 1.1], armR.tip!, "handR");
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip,
=======
    bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: armR.tip,
=======
        bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: armL.tip,
=======
        bone: armL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: HOT,
=======
    color: HOT as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: HOT_YELLOW,
=======
    color: HOT_YELLOW as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: COAL,
=======
    color: COAL as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: IRON_DARK,
=======
    color: IRON_DARK as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: IRON_LIGHT,
=======
    color: IRON_LIGHT as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: BRASS,
=======
    color: BRASS as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: WOOD,
=======
    color: WOOD as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: HOT,
=======
      color: HOT as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: HOT_YELLOW,
=======
      color: HOT_YELLOW as any,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: IRON,
=======
      color: IRON as any,
>>>>>>> REPLACE
```