Cause: the pintle gun's muzzle line `b.rod([0.45, 1.52, -1.2], [0.45, 1.52, -1.2], 0.06, DARK)` has identical endpoints, so the path has a single distinct point and `polyline()` throws.

## Edits

<<<<<<< SEARCH
  b.rod([0.45, 1.52, -1.2], [0.45, 1.52, -1.2], 0.06, DARK);
=======
  b.rod([0.45, 1.52, -1.2], [0.45, 1.52, -1.05], 0.06, DARK);
>>>>>>> REPLACE