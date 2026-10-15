The plinth part names `bone: "hips"`, but no joint was ever created, so the builder has no root joint to attach it to. The fix is to create the `hips` root joint before the first part.

<<<<<<< SEARCH
  const rand = rng(21);
=======
  const rand = rng(21);
  const hips = b.joint("hips", { at: [0, 0.5, 0] });
  void hips;
>>>>>>> REPLACE