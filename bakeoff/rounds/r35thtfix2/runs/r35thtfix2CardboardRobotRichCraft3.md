Cause: the digit chains pass a nullable `Chain.tip` as `parent`, and the first chain is being created without an explicit SDK root joint, so the builder’s implicit model root is incorrectly resolved as a parent.

<<<<<<< SEARCH
  const spine = b.chain(
    "spine",
    polyline([
=======
  const root = b.joint("root", {
    at: [0, 0.9, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    polyline([
>>>>>>> REPLACE

<<<<<<< SEARCH
      names: ["pelvis", "spine", "chest", "neck"],
      role: "spine",
    },
  );
=======
      names: ["pelvis", "spine", "chest", "neck"],
      role: "spine",
      parent: root,
    },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = side > 0 ? armL.tip : armR.tip;
=======
    const hand = (side > 0 ? armL.tip : armR.tip)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: hand,
          names: [name, `${name}Tip`],
=======
          parent: hand,
          names: [name, `${name}Tip`],
>>>>>>> REPLACE