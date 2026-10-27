Cause: `mast.tip` is nullable, so it must be narrowed before using it as a parent or reading `.at`.

<<<<<<< SEARCH
  const windHub = b.joint("windHub", {
    parent: mast.tip,
    at: mast.tip.at,
    dir: [0, 0, 1],
=======
  const mastTip = mast.tip ?? mast.joints[mast.joints.length - 1];
  const windHub = b.joint("windHub", {
    parent: mastTip,
    at: mastTip.at,
    dir: [0, 0, 1],
>>>>>>> REPLACE