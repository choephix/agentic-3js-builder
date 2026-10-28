The tail-wheel code calls `b.rod` with identical start and end points (`[0, 0.62, -4.0]` twice), so the path has no length and `polyline()` throws.

<<<<<<< SEARCH
  b.rod([0, 0.62, -4.0], [0, 0.62, -4.0], 0.01, P.chalk, { bone: tw });
=======
>>>>>>> REPLACE