Cause: gear 2 in the backpack train had no `from`, so it meshed with gear 1 (the previous gear) at -120°, which put it almost on top of gear 0. It now meshes with gear 0.

<<<<<<< SEARCH
    gears: [{ teeth: 16, spokes: 4 }, { teeth: 10, angle: 70 }, { teeth: 12, angle: -120, holes: 3 }],
=======
    gears: [{ teeth: 16, spokes: 4 }, { teeth: 10, angle: 70 }, { teeth: 12, from: 0, angle: -120, holes: 3 }],
>>>>>>> REPLACE