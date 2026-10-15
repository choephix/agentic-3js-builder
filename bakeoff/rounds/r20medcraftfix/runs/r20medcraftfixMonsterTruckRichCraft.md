The cause is a placeholder `rod` in the mud-flap loop whose two endpoints are identical, so `polyline()` sees only one distinct point and throws.

<<<<<<< SEARCH
    rod([s * 1.2, 1.2, 0.0 - 0.0 + 0], [s * 1.2, 1.2, 0.0], 0.001, "#000000"); // placeholder-free no-op removed below
=======
>>>>>>> REPLACE