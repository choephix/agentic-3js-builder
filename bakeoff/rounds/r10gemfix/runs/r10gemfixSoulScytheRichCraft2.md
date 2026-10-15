`b.along` on a `Path` yields a `PathPoint` which has no `.normal` property, causing `fr.normal` to evaluate to `undefined` in `b.spike`.

<<<<<<< SEARCH
    // Sharp dorsal thorns along outer rib curve
    b.along(ribCurve, 4, (fr) => {
      b.spike(fr.at, fr.tangent, 0.045, 0.012, {
        bone: root,
        color: DRAGON_BONE_PAINT,
      });
    });
=======
    // Sharp dorsal thorns along outer rib curve
    b.along(ribSweep, 4, (at) => {
      b.spike(at, at, 0.045, 0.012, {
        color: DRAGON_BONE_PAINT,
      });
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const pickCurve = catmull([pickBase, pickMid, pickTip]);
  b.sweep(pickCurve, (t) => 0.042 * (1 - t * 0.82) + 0.006, {
    bone: head,
    color: SHADOW_IRON_PAINT,
    caps: "point",
  });

  // Pick Dorsal Teeth
  b.along(pickCurve, 4, (fr) => {
    b.spike(fr.at, fr.normal, 0.042, 0.012, {
      bone: head,
      color: DRAGON_BONE_PAINT,
    });
  });
=======
  const pickCurve = catmull([pickBase, pickMid, pickTip]);
  const pickSweep = b.sweep(pickCurve, (t) => 0.042 * (1 - t * 0.82) + 0.006, {
    bone: head,
    color: SHADOW_IRON_PAINT,
    caps: "point",
  });

  // Pick Dorsal Teeth
  b.along(pickSweep, 4, (at) => {
    b.spike(at, at, 0.042, 0.012, {
      color: DRAGON_BONE_PAINT,
    });
  });
>>>>>>> REPLACE