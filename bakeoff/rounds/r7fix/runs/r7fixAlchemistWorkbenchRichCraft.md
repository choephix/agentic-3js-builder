The cause is that the four corner-pillar lathes in the platform loop pass an open outline that never returns to the axis, so its closing edge crosses the outline itself.

<<<<<<< SEARCH
    lathe([[0.085, 0], [0.085, 0.06], [0.06, 0.09], [0.06, 0.19], [0.078, 0.22], [0.078, 0.235]], STONE_DK, [px, F, pz], {
=======
    lathe(solid([[0.085, 0], [0.085, 0.06], [0.06, 0.09], [0.06, 0.19], [0.078, 0.22], [0.078, 0.235]]), STONE_DK, [px, F, pz], {
>>>>>>> REPLACE