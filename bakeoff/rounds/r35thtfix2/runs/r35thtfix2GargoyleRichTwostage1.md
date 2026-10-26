Cause: Explicit `count` values make `spine.tip` and `neck.tip` null, but they were used as parents and as the head position.

<<<<<<< SEARCH
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip!,
    names: ["neck", "neckTip"],
    role: "neck",
    count: 2,
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: neck.tip!.at,
=======
  const neck = b.chain("neck", neckPath, {
    parent: spine,
    names: ["neck", "neckTip"],
    role: "neck",
    count: 2,
  });

  const head = b.joint("head", {
    parent: neck,
    at: neck.at(1).at,
>>>>>>> REPLACE