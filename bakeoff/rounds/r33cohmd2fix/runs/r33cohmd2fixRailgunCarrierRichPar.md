The turret collar `lathe` in `buildHull` has an outline that doubles back on itself: its last points `[1.05, 0.2], [1.05, 0.0], [0, 0.0]` run back across the first edge `[0,0]→[1.25,0]`, so edge 0→1 meets edge 3→4. The fix is a non-self-touching profile.

<<<<<<< SEARCH
      [0, 0],
      [1.25, 0],
      [1.25, 0.12],
      [1.05, 0.2],
      [1.05, 0.0],
      [0, 0.0],
    ],
    { at: [tx, 1.98, tz], bone, color: P.hullDark, segments: 16, name: "hullCollar" },
=======
      [0, 0],
      [1.25, 0],
      [1.25, 0.12],
      [1.05, 0.2],
      [0, 0.2],
    ],
    { at: [tx, 1.98, tz], bone, color: P.hullDark, segments: 16, name: "hullCollar" },
>>>>>>> REPLACE