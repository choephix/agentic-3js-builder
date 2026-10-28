Cause: the leftover dead scaffolding passes a `Surface` into `b.surface()` (line 77), and the `scale` option on the ball helper's part isn't typed for a `number[]` (line 146 is `b.cards` `size`, which wants a number or a `[number, number]` tuple, not `number[]`).

<<<<<<< SEARCH
  const torsoSkin = b.surface(b.root);
  void torsoSkin;
  // chest fur tufts
  const chestHits = b
    .surface(spine.tip ? b.surface(b.root) : b.root)
    .scatter(0, {});
  void chestHits;
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  const leafOn = (target: any, n: number, size: number[], seed: number, minDist: number) => {
=======
  const leafOn = (target: any, n: number, size: [number, number], seed: number, minDist: number) => {
>>>>>>> REPLACE