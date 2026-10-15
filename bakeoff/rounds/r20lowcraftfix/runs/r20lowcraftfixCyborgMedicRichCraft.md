The cause: `surface.around(...).at(90, 35)` returned null because the ray from the pauldron's centre point missed the hemisphere's surface. The hemisphere is open at the bottom and the ray went through a flat or empty direction, so `b.decal` received null. The fix is to use `nearest` with a point on the dome, which always returns a hit.

<<<<<<< SEARCH
const hitL = pdLs.around([0.27, 1.45, 0]).at(90, 35)!;
=======
const hitL = pdLs.nearest([0.37, 1.5, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
const hitR = pdRs.around([-0.27, 1.45, 0]).at(-90, 35)!;
=======
const hitR = pdRs.nearest([-0.37, 1.5, 0]);
>>>>>>> REPLACE