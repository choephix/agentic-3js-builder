Cause: `Sweep` has no `.path`, and `glow()` rejects painted parts; use the original crown path and a flat colour for glowing veins.

```text
<<<<<<< SEARCH
    const vein = b.sweep(
      catmull([bx, mid, tx]),
      [0.012, 0.004],
      { color: veinPaint, caps: "round", name: "leaf-central-vein", group: "leaf-veins" },
    );
=======
    const vein = b.sweep(
      catmull([bx, mid, tx]),
      [0.012, 0.004],
      { color: AQUA, caps: "round", name: "leaf-central-vein", group: "leaf-veins" },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const crownStem = b.sweep(
    catmull([
      [0.02, 1.98, 0],
      [0.03, 2.18, 0.015],
      [-0.03, 2.34, 0],
      [0, 2.52, 0],
    ]),
    [0.06, 0.018],
    { color: stemPaint, sides: 7, name: "crown-stalk", group: "flower" },
  );
=======
  const crownPath = catmull([
    [0.02, 1.98, 0],
    [0.03, 2.18, 0.015],
    [-0.03, 2.34, 0],
    [0, 2.52, 0],
  ]);
  const crownStem = b.sweep(
    crownPath,
    [0.06, 0.018],
    { color: stemPaint, sides: 7, name: "crown-stalk", group: "flower" },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    [b.sweep(crownStem.path, 0.02, { color: AQUA, caps: "round", name: "flower-light-stem" }).at(1, 0, 0.02)],
=======
    [b.sweep(crownPath, 0.02, { color: AQUA, caps: "round", name: "flower-light-stem" }).at(1, 0, 0.02)],
>>>>>>> REPLACE
```