Cause: `b.spike` already creates a pointed cap, so `caps` is not a valid option in its overload.

<<<<<<< SEARCH
  b.spike([0.19, 6.9, 0.105], [1, 0, 0], 0.115, 0.042, {
    color: P.BRASS,
    caps: "point",
    name: "arrowHead",
    group: "stage2-weather-vane",
  });
=======
  b.spike([0.19, 6.9, 0.105], [1, 0, 0], 0.115, 0.042, {
    color: P.BRASS,
    name: "arrowHead",
    group: "stage2-weather-vane",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.spike(
    [1.12, 4.67, 1.31],
    [0, -1, 0],
    0.075,
    0.035,
    { color: C.BRASS, name: "s2LanternBottomFinial" },
  );
=======
  b.spike(
    [1.12, 4.67, 1.31],
    [0, -1, 0],
    0.075,
    0.035,
    { color: C.BRASS, name: "s2LanternBottomFinial" },
  );
>>>>>>> REPLACE