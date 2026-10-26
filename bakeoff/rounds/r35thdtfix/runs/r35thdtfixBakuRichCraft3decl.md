Cause: `Surface.loop()` was given a surface point with its default tangent-plane normal, so the cutting plane missed the neck; the collar must be cut using the neck’s centerline direction.

<<<<<<< SEARCH
  const collarPoint = neckSweep.at(0.62, 90, 0.012);
  const collarLoop = neckSurface.loop(collarPoint, { lift: 0.012 });
=======
  const collarPoint = neckSweep.at(0.62, 90, 0.012);
  const collarLoop = neckSurface.loop(collarPoint, {
    dir: neck.at(0.62).tangent,
    lift: 0.012,
  });
>>>>>>> REPLACE