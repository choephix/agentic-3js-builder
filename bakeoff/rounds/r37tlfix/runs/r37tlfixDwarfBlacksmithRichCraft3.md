The errors come from nullable `Chain.tip` values being passed as `parent`/`bone`; `spine.tip` is additionally null at runtime because its three names cover its three spans rather than creating a tip joint.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[2],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.tip,
=======
      bone: leg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: arm.tip,
=======
      bone: arm.tip!,
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
      bone: armR.tip,
=======
      bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? armL.joints[0] : armR.joints[0],
=======
      bone: s > 0 ? armL.joints[0] : armR.joints[0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? armL.joints[0] : armR.joints[0],
=======
      bone: s > 0 ? armL.joints[0] : armR.joints[0]!,
>>>>>>> REPLACE
```