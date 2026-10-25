The cause is a degenerate `frustumBox` in the cab section: both endpoints are `[0, 1.4, 1.2]`, so it has no length and `polyline()` rejects it. It was a leftover placeholder, so I removed it.

## Edits

<<<<<<< SEARCH
  b.frustumBox([0, 1.4, 1.2], [0, 1.4, 1.2], [2.1, 0.1], [2.1, 0.1], { bone: ch, color: DK });
=======
  P(box(2.1, 0.1, 0.1), DK, [0, 1.4, 1.2]);
>>>>>>> REPLACE