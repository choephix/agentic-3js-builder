The cutting edge doubles back through the spine: edge 6→7 (from the tip toward the inner edge) crosses edge 4→5 (the spine just below the tip). I've redrawn the crescent as a spine curve that rises to the tip and an inner edge that stays inside it, so the outline no longer crosses itself. The rest of the model is unchanged.

<<<<<<< SEARCH
  const blade: Array<[number, number] | [number, number, "sharp"]> = [
    [0.0, BLADE_Y - 0.14],
    [0.2, BLADE_Y - 0.1],
    [0.42, BLADE_Y - 0.02],
    [0.6, BLADE_Y + 0.12],
    [0.72, BLADE_Y + 0.3],
    [0.74, BLADE_Y + 0.46],
    [0.8, BLADE_Y + 0.54, "sharp"],
    [0.7, BLADE_Y + 0.4],
    [0.56, BLADE_Y + 0.26],
    [0.4, BLADE_Y + 0.14],
    [0.2, BLADE_Y + 0.08],
    [0.0, BLADE_Y + 0.1],
  ];
=======
  const blade: Array<[number, number] | [number, number, "sharp"]> = [
    // Outer spine, root to tip (convex).
    [0.0, BLADE_Y - 0.14],
    [0.2, BLADE_Y - 0.1],
    [0.42, BLADE_Y - 0.02],
    [0.6, BLADE_Y + 0.12],
    [0.72, BLADE_Y + 0.3],
    [0.8, BLADE_Y + 0.46],
    [0.84, BLADE_Y + 0.56, "sharp"],
    // Inner cutting edge, tip back to root, staying inside the spine (concave).
    [0.66, BLADE_Y + 0.42],
    [0.5, BLADE_Y + 0.3],
    [0.34, BLADE_Y + 0.18],
    [0.18, BLADE_Y + 0.1],
    [0.0, BLADE_Y + 0.1],
  ];
>>>>>>> REPLACE