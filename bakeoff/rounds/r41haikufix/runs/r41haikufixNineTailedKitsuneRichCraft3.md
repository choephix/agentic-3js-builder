The chain's `tip` is `Joint | null`, but the paw part's `bone` option accepts `JointRef | undefined`, so a null tip has to become `undefined`. The paw's `at` is set explicitly, so the part still lands on the foot.

<<<<<<< SEARCH
      bone: c.tip,
=======
      bone: c.tip ?? undefined,
>>>>>>> REPLACE