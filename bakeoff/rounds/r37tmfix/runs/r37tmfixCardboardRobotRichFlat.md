Cause: `Chain.tip` is typed as `Joint | null`; these chains have explicit tip joints, so assert the non-null tips before using them as `parent` or `bone`.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.29, 0.19, 0.40, RUBBER, [0.18, 0.105, 0.09], legL.tip, "bootL");
=======
  box(0.29, 0.19, 0.40, RUBBER, [0.18, 0.105, 0.09], legL.tip!, "bootL");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.29, 0.19, 0.40, RUBBER, [-0.18, 0.105, 0.09], legR.tip, "bootR");
=======
  box(0.29, 0.19, 0.40, RUBBER, [-0.18, 0.105, 0.09], legR.tip!, "bootR");
>>>>>>> REPLACE