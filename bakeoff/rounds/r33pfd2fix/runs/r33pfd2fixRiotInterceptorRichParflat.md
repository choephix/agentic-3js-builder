The first hood `b.extrude` call in `buildChassisFront` passes `thickness: 0`, which `extrude` rejects (it needs a positive thickness, or a taper with at least one end above 0). That call is a stray duplicate of the per-side hood panels built in the loop right after it, so I removed it.

<<<<<<< SEARCH
  b.extrude(
    [[0, 0], [2.2, 0], [2.2, 0.28], [0.1, 0.62], [0, 0.62]],
    { at: [-1.2, 0.9, 0.8], x: [0, 0, 1], y: [0, 1, 0], thickness: 0, color: P.hull, bone },
  );
  for (const s of [1, -1]) {
=======
  for (const s of [1, -1]) {
>>>>>>> REPLACE