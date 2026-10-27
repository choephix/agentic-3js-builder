Cause: nullable chain tips were passed where the SDK requires a definite joint, and `surface()` was given a `Chain` instead of the neck’s `Sweep`.

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(neck, [0.17, 0.125], {
=======
    const neckTube = b.sweep(neck, [0.17, 0.125], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const leg = b.chain(`legChain${i}`, points, {
=======
    const leg = b.chain(`legChain${i}`, points, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg, [0.085, 0.055], {
=======
    const foot = leg.tip!;
    b.sweep(leg, [0.085, 0.055], {
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
        at: leg.tip.at,
=======
        bone: foot,
        at: foot.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
        [0, -0.03, 1],
        0.09,
        0.012,
        { color: CREAM, bone: leg.tip, group: "talons" },
=======
        [0, -0.03, 1],
        0.09,
        0.012,
        { color: CREAM, bone: foot, group: "talons" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = b.surface(neck).loop(neck.joints[1], { lift: 0.012 });
=======
  const collar = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
>>>>>>> REPLACE