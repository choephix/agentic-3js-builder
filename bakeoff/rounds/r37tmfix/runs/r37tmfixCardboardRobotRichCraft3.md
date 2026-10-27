Cause: `Chain.tip` is typed as `Joint | null`, while these SDK options require a non-null `JointRef`; these chains explicitly include named tip joints, so assert their presence.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone: arm.tip,
=======
      bone: arm.tip!,
>>>>>>> REPLACE
<<<<<<< SEARCH
    seam([s * 0.76, 0.86, 0.205], [0.12, 0.018, 0.012], arm.tip, EDGE_CARD);
=======
    seam([s * 0.76, 0.86, 0.205], [0.12, 0.018, 0.012], arm.tip!, EDGE_CARD);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box([0.29, 0.18, 0.38], [s * 0.2, 0.1, 0.12], RUBBER, leg.tip);
=======
    box([0.29, 0.18, 0.38], [s * 0.2, 0.1, 0.12], RUBBER, leg.tip!);
>>>>>>> REPLACE