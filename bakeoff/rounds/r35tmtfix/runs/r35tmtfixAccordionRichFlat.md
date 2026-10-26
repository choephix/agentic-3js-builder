Cause: two `pearlTile` trim boxes passed 2D `[x, y]` positions, but `b.part` requires 3D `[x, y, z]` points.

<<<<<<< SEARCH
    box([w + 0.012, 0.008, 0.006], BRASS_DARK, [x, y - h / 2]);
    box([w + 0.012, 0.008, 0.006], BRASS_LIGHT, [x, y + h / 2]);
=======
    box([w + 0.012, 0.008, 0.006], BRASS_DARK, [x, y - h / 2, z + 0.003]);
    box([w + 0.012, 0.008, 0.006], BRASS_LIGHT, [x, y + h / 2, z + 0.003]);
>>>>>>> REPLACE