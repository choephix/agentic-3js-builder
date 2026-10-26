Cause: `Surface.loop()` was given the neck tube’s outward surface frame, so its cutting plane was tangent to the tube and missed it instead of using the neck centerline tangent.

<<<<<<< SEARCH
  necks.forEach(({ tube }, i) => {
    const ring = b.surface(tube).loop(tube.at(0.52), { lift: 0.008 });
=======
  necks.forEach(({ tube }, i) => {
    const centerline = tube.curve();
    const ring = b.surface(tube).loop(centerline.at(0.52), {
      dir: centerline.tangentAt(0.52),
      lift: 0.008,
    });
>>>>>>> REPLACE