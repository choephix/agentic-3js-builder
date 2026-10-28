The blade outline went along the top edge from the root to (1.0, 0.05), then jumped to the tip at (1.28, -0.46) and came back along the lower edge, so the segment to the tip crossed the lower edge near (0.85, -0.1). I replaced the top edge with a smooth arc that rises, swings out to a hooked point at (1.28, -0.46), and returns along a lower edge that stays below the upper one.

<<<<<<< SEARCH
      ...upper.map(([x, y]) => [x, y] as [number, number]),
      [1.28, -0.46, "sharp"],
      [0.85, -0.1],
      [0.6, -0.08],
      [0.3, -0.08],
      [0, -0.12],
=======
      [0, 0.0],
      [0.3, 0.16],
      [0.7, 0.2],
      [1.05, 0.0],
      [1.28, -0.46, "sharp"],
      [0.98, -0.2],
      [0.7, -0.1],
      [0.3, -0.08],
      [0, -0.12],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [0.85, -0.1],
        [1.28, -0.46, "sharp"],
        [0.9, -0.135],
=======
        [0.7, -0.1],
        [0.98, -0.2],
        [1.28, -0.46, "sharp"],
        [1.0, -0.25],
        [0.72, -0.135],
>>>>>>> REPLACE