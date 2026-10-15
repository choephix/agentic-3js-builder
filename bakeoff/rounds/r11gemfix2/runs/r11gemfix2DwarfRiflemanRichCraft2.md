The inner bore profile of `bellOutline` returned to `y = 0` at `x = 0.022`, causing the returning edge to collide with the base edge along the axis.

## Edits

<<<<<<< SEARCH
  const bellOutline: [number, number][] = [
    [0.0, 0.0],
    [0.035, 0.0],
    [0.042, 0.03],
    [0.056, 0.06],
    [0.082, 0.1],
    [0.098, 0.12], // Outer lip
    [0.088, 0.12],
    [0.076, 0.1], // Inner hollow bore
    [0.046, 0.06],
    [0.03, 0.03],
    [0.022, 0.0],
    [0.0, 0.0],
  ];
=======
  const bellOutline: [number, number][] = [
    [0.0, 0.0],
    [0.035, 0.0],
    [0.042, 0.03],
    [0.056, 0.06],
    [0.082, 0.1],
    [0.098, 0.12], // Outer lip
    [0.088, 0.12],
    [0.074, 0.1], // Inner hollow bore
    [0.05, 0.06],
    [0.03, 0.03],
    [0.0, 0.03],
  ];
>>>>>>> REPLACE