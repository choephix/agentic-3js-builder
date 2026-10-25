The turret code called `b.frustumBox` with identical start and end points (`[0, 2.72, hz]` twice), so the path had no distinct points and `polyline()` threw. The call was an empty placeholder, so I removed it.

<<<<<<< SEARCH
  b.frustumBox([0, 2.72, hz], [0, 2.72, hz], [0, 0], [0, 0], { bone: yaw, color: ARMOR }).meshes;
=======
>>>>>>> REPLACE