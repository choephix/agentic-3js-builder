Cause: `TEAL` is undefined, and the textured wall passes the `WALL` paint instead of a string tint.

<<<<<<< SEARCH
  const wall = box([1.43, 0.73, 0.98], [0, 1.50, 0], WALL, {
=======
  const wall = box([1.43, 0.73, 0.98], [0, 1.50, 0], WALL_LIT, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.36, 0.57, 0.075], [-0.30, 1.43, 0.56], TEAL, {
=======
  box([0.36, 0.57, 0.075], [-0.30, 1.43, 0.56], TEAL_LIT, {
>>>>>>> REPLACE