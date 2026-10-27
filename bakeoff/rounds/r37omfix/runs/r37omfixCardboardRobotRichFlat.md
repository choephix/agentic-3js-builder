The cause is that chain `.tip` is typed as `Joint | null`; these appendage chains always have a tip, so assert it non-null when assigning or passing it as a bone.

```ts
<<<<<<< SEARCH
  const neck = spine.tip;
=======
  const neck = spine.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = side === 1 ? armL.tip : armR.tip;
=======
    const hand = (side === 1 ? armL.tip : armR.tip)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.23, 0.12, 0.34], [0.17, 0.065, 0.12], SHOE, legL.tip, "shoeL");
=======
  box([0.23, 0.12, 0.34], [0.17, 0.065, 0.12], SHOE, legL.tip!, "shoeL");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.23, 0.12, 0.34], [-0.17, 0.065, 0.12], SHOE, legR.tip, "shoeR");
=======
  box([0.23, 0.12, 0.34], [-0.17, 0.065, 0.12], SHOE, legR.tip!, "shoeR");
>>>>>>> REPLACE

<<<<<<< SEARCH
  strip([0.19, 0.025, 0.035], [0.17, 0.112, 0.285], TAPE, legL.tip, "shoeStripeL");
=======
  strip([0.19, 0.025, 0.035], [0.17, 0.112, 0.285], TAPE, legL.tip!, "shoeStripeL");
>>>>>>> REPLACE

<<<<<<< SEARCH
  strip([0.19, 0.025, 0.035], [-0.17, 0.112, 0.285], TAPE, legR.tip, "shoeStripeR");
=======
  strip([0.19, 0.025, 0.035], [-0.17, 0.112, 0.285], TAPE, legR.tip!, "shoeStripeR");
>>>>>>> REPLACE

<<<<<<< SEARCH
  round(0.115, [side * 0.58, 0.67, 0.075], SKIN, hand, [1, 1.05, 0.9], `hand${side}`);
=======
  round(0.115, [side * 0.58, 0.67, 0.075], SKIN, hand!, [1, 1.05, 0.9], `hand${side}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
  round(0.045, [side * 0.665, 0.69, 0.08], SKIN, hand, [1.2, 0.8, 0.75], `thumb${side}`);
=======
  round(0.045, [side * 0.665, 0.69, 0.08], SKIN, hand!, [1.2, 0.8, 0.75], `thumb${side}`);
>>>>>>> REPLACE
```