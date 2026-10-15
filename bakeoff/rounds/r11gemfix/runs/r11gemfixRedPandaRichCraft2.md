The cause is numeric indexing (`bellPos[0]`, `bellPos[1]`, `bellPos[2]`) on `bellPos`, which is a `THREE.Vector3` returned by `offset()`, yielding `undefined` (serialized as `null`).

## Edits

<<<<<<< SEARCH
  // Dual Silk Tassels (Red & Gold) swaying against chest
  b.sweep([[bellPos[0] + 0.006, bellPos[1], bellPos[2]], [bellPos[0] + 0.01, bellPos[1] - 0.04, bellPos[2] + 0.005], [bellPos[0] + 0.012, bellPos[1] - 0.075, bellPos[2] + 0.008]], [0.0045, 0.0018], {
    bone: chest,
    color: GOLD,
    sides: 6,
  });
  b.sweep([[bellPos[0] - 0.006, bellPos[1], bellPos[2]], [bellPos[0] - 0.01, bellPos[1] - 0.04, bellPos[2] + 0.005], [bellPos[0] - 0.012, bellPos[1] - 0.075, bellPos[2] + 0.008]], [0.0045, 0.0018], {
    bone: chest,
    color: CORD_RED,
    sides: 6,
  });
=======
  // Dual Silk Tassels (Red & Gold) swaying against chest
  b.sweep(
    [
      [bellPos.x + 0.006, bellPos.y, bellPos.z],
      [bellPos.x + 0.01, bellPos.y - 0.04, bellPos.z + 0.005],
      [bellPos.x + 0.012, bellPos.y - 0.075, bellPos.z + 0.008],
    ],
    [0.0045, 0.0018],
    {
      bone: chest,
      color: GOLD,
      sides: 6,
    }
  );
  b.sweep(
    [
      [bellPos.x - 0.006, bellPos.y, bellPos.z],
      [bellPos.x - 0.01, bellPos.y - 0.04, bellPos.z + 0.005],
      [bellPos.x - 0.012, bellPos.y - 0.075, bellPos.z + 0.008],
    ],
    [0.0045, 0.0018],
    {
      bone: chest,
      color: CORD_RED,
      sides: 6,
    }
  );
>>>>>>> REPLACE