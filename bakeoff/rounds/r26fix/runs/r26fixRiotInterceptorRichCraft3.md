The `b.frustumBox` call for the cabin base used identical start and end points (`[0, 1.1, 0.9]` twice), so the path had zero length and `polyline()` rejected it. It was a leftover, since the cabin is already built by the `BoxGeometry` right after it, so I removed it.

<<<<<<< SEARCH
  b.frustumBox([0, 1.1, 0.9], [0, 1.1, 0.9], [1.9, 0.01], [1.9, 0.01], { color: HULL, bone: body });
=======
>>>>>>> REPLACE