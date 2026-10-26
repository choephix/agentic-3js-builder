Cause: the hatch decoration calls `rod()` twice with identical start and end points, creating zero-length paths.

<<<<<<< SEARCH
    rod([side * 0.505, hatchY, hatchZ + 0.32], [side * 0.505, hatchY, hatchZ + 0.32], 0.008, PALE);
    rod([side * 0.505, hatchY, hatchZ - 0.32], [side * 0.505, hatchY, hatchZ - 0.32], 0.008, PALE);
=======
    rod([side * 0.505, hatchY, hatchZ + 0.32], [side * 0.505, hatchY + 0.16, hatchZ + 0.32], 0.008, PALE);
    rod([side * 0.505, hatchY, hatchZ - 0.32], [side * 0.505, hatchY + 0.16, hatchZ - 0.32], 0.008, PALE);
>>>>>>> REPLACE