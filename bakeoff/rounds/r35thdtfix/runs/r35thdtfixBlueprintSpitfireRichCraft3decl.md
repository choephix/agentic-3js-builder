Cause: two `rod()` calls for the access-panel “tiny” edges used identical start and end points, creating zero-length polylines.

<<<<<<< SEARCH
      rod([side * 0.66, 1.95, z - 0.24], [side * 0.66, 1.95, z - 0.24], 0.012, PALE, `panelTiny${side}${i}`);
      rod([side * 0.66, 1.95, z + 0.24], [side * 0.66, 1.95, z + 0.24], 0.012, PALE, `panelTiny2${side}${i}`);
=======
      rod([side * 0.61, 1.95, z - 0.24], [side * 0.66, 1.95, z - 0.24], 0.012, PALE, `panelTiny${side}${i}`);
      rod([side * 0.61, 1.95, z + 0.24], [side * 0.66, 1.95, z + 0.24], 0.012, PALE, `panelTiny2${side}${i}`);
>>>>>>> REPLACE