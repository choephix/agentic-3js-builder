Cause: in `buildCab`, the `b.frustumBox` call uses the same point for both ends (`[0, 2.0, 3.35]` twice), so the path has only one distinct point and `polyline()` throws.

<<<<<<< SEARCH
  b.frustumBox([0, 2.0, 3.35], [0, 2.0, 3.35], [3.6, 0.1], [3.6, 0.1], { bone, color: P.hull, caps: "flat" });
=======
  b.frustumBox([0, 2.0, 3.35], [0, 2.1, 3.35], [3.6, 0.1], [3.6, 0.1], { bone, color: P.hull });
>>>>>>> REPLACE