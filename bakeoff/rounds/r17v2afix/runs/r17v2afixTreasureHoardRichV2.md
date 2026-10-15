The cause is that `build()` ends without `return b.root`, so the app received `undefined`. The final `part(...)` also cloned the dais lathe into a stray copy at y = -5, which would put geometry far below the floor. I replaced it with the plain `b.lathe` call, flushed the merged coin batches, and added the return.

<<<<<<< SEARCH
  part(
    b.lathe(
      [
        [0, 0],
        [1.27, 0],
        [1.33, 0.035],
        [1.28, D],
        [0, D],
      ],
      { at: [0, 0, 0], bone: root, segments: 14, color: daisPaint, name: "dais" },
    ).mesh.geometry.clone(),
    "#000000",
    { at: [0, -5, 0] },
  );
=======
  b.lathe(
    [
      [0, 0],
      [1.27, 0],
      [1.33, 0.035],
      [1.28, D],
      [0, D],
    ],
    { at: [0, 0, 0], bone: root, segments: 14, color: daisPaint, name: "dais" },
  );

  // Flush the merged coin batches (one part per tone).
  (Object.keys(coinBatches) as Tone[]).forEach((tone) => {
    if (coinBatches[tone].length) part(merge(coinBatches[tone]), COIN_PAINT[tone], { at: [0, 0, 0], name: `coins_${tone}` });
  });

  return b.root;
>>>>>>> REPLACE