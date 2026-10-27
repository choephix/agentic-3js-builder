Cause: nullable chain endpoints (`tip`) were passed where the SDK requires a definite joint, and the head/gill parents inherited that nullability; the toe capsule also needs its colour supplied through the supported overload.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const foot = chain.tip.at;
=======
    const foot = chain.tip!.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(b, foot, [0.082, 0.043, 0.095], LIMB_PAINT, chain.tip, `${label}.palm`, 8);
=======
    sphere(b, foot, [0.082, 0.043, 0.095], LIMB_PAINT, chain.tip!, `${label}.palm`, 8);
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
=======
        bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.capsule(toeBase, toeTip, 0.018, {
        color: BELLY_PAINT,
=======
      b.capsule(toeBase, toeTip, 0.018, BELLY_PAINT, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.tip,
=======
      bone: tail.tip!,
>>>>>>> REPLACE