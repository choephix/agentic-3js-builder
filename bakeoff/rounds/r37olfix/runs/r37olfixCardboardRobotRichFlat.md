```ts
// Cause: spine.tip, legL.tip, legR.tip, and arm.tip are nullable in the SDK types; assert they exist because these chains include tip joints.

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
    const foot = s > 0 ? legL.tip.at : legR.tip.at;
=======
    const foot = s > 0 ? legL.tip!.at : legR.tip!.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([0.23, 0.17, 0.36], BOOT, [foot.x, 0.09, 0.10], s > 0 ? legL.tip : legR.tip, "oversized-boot");
=======
    box([0.23, 0.17, 0.36], BOOT, [foot.x, 0.09, 0.10], s > 0 ? legL.tip! : legR.tip!, "oversized-boot");
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = arm.tip.at;
=======
    const hand = arm.tip!.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const bone = arm.tip;
=======
    const bone = arm.tip!;
>>>>>>> REPLACE
```