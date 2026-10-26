Cause: the toe rods passed `leg.chain.tip` as `bone`, but this chain has no tip joint, so `tip` is `null`.

<<<<<<< SEARCH
      b.rod([x, 0.18, z], toeEnd, 0.034, {
        color: SKIN,
        bone: leg.chain.tip,
        section: { ngon: 5 },
      });
=======
      b.rod([x, 0.18, z], toeEnd, 0.034, {
        color: SKIN,
        bone: leg.chain.joints[2],
        section: { ngon: 5 },
      });
>>>>>>> REPLACE