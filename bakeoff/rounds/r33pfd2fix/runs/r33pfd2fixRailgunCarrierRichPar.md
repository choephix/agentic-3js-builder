The turret's `b.frustumBox` call in `buildRailgun` passes identical start and end points (`[0, 2.1, -0.9]` twice), so the sweep path has zero length and `polyline()` rejects it. I gave the box a real length along z so it spans the housing's top plate.

<<<<<<< SEARCH
  b.frustumBox([0, 2.1, -0.9], [0, 2.1, -0.9], [1.5, 0.1], [1.5, 0.1], { bone: T, color: P.hull });
=======
  b.frustumBox([0, 2.1, -1.4], [0, 2.1, -0.4], [1.5, 0.1], [1.5, 0.1], { bone: T, color: P.hull });
>>>>>>> REPLACE