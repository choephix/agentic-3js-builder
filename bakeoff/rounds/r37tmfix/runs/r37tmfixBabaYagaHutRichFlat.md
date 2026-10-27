Cause: `chain.tip` is typed as `Joint | null`, but `bone` accepts a non-null `JointRef`; these chains explicitly include tip joints.

<<<<<<< SEARCH
      bone: s > 0 ? legL.tip : legR.tip,
=======
      bone: s > 0 ? legL.tip! : legR.tip!,
>>>>>>> REPLACE