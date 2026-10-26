Cause: `front.tip`/`rear.tip` can be `null`, and the cloud outline self-intersects; use a valid fallback joint and a simple non-crossing cloud silhouette.

<<<<<<< SEARCH
      bone: front.tip ?? hips,
=======
      bone: front.tip || hips,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: rear.tip ?? hips,
=======
      bone: rear.tip || hips,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const shaped = outline.map(([x, y, mark]) => [
      x * scale,
      y * scale,
      mark,
    ] as [number, number, "sharp"]);
=======
    const safeOutline: Outline = [
      [-0.42, -0.08, "sharp"],
      [-0.34, -0.17, "sharp"],
      [-0.19, -0.18, "sharp"],
      [-0.08, -0.12, "sharp"],
      [0.02, -0.17, "sharp"],
      [0.18, -0.18, "sharp"],
      [0.33, -0.12, "sharp"],
      [0.41, -0.02, "sharp"],
      [0.37, 0.08, "sharp"],
      [0.26, 0.11, "sharp"],
      [0.18, 0.18, "sharp"],
      [0.05, 0.20, "sharp"],
      [-0.06, 0.15, "sharp"],
      [-0.17, 0.22, "sharp"],
      [-0.31, 0.18, "sharp"],
      [-0.40, 0.09, "sharp"],
    ];
    const shaped = safeOutline.map(([x, y, mark]) => [
      x * scale,
      y * scale,
      mark,
    ] as [number, number, "sharp"]);
>>>>>>> REPLACE