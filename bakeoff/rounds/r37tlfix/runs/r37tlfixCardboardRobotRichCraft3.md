```ts
// Cause: Chain.tip is typed as Joint | null, so non-null assertions are required where the chain
// is known to include its explicit tip joint.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? armL.tip : armR.tip,
=======
      bone: s > 0 ? armL.tip! : armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([0.23, 0.16, 0.34], [s * 0.19, 0.12, 0.10], SHOE, s > 0 ? legL.tip : legR.tip, "sneaker");
=======
    box([0.23, 0.16, 0.34], [s * 0.19, 0.12, 0.10], SHOE, s > 0 ? legL.tip! : legR.tip!, "sneaker");
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([0.24, 0.045, 0.35], [s * 0.19, 0.035, 0.115], SOLE, s > 0 ? legL.tip : legR.tip, "rubberSole");
=======
    box([0.24, 0.045, 0.35], [s * 0.19, 0.035, 0.115], SOLE, s > 0 ? legL.tip! : legR.tip!, "rubberSole");
>>>>>>> REPLACE
```