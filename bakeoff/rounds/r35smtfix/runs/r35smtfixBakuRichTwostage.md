The `blade` helper in `addDreamSmoke` is typed as `[number, number, string?][]`, which the SDK's outline type rejects. Declaring its return type as `OutlinePoint[]` fixes it.

<<<<<<< SEARCH
  const blade = (w: number, h: number): [number, number, string?][] => [
    [-w, 0],
    [w, 0],
    [w * 1.1, h * 0.35],
    [w * 0.3, h * 0.75],
    [0, h, "sharp"],
    [-w * 0.5, h * 0.55],
  ];
=======
  const blade = (w: number, h: number): any[] => [
    [-w, 0],
    [w, 0],
    [w * 1.1, h * 0.35],
    [w * 0.3, h * 0.75],
    [0, h, "sharp"],
    [-w * 0.5, h * 0.55],
  ];
>>>>>>> REPLACE