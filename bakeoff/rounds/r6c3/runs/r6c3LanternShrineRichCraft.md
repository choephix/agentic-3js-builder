1. **The ground plot did not hold the tree.** The extrude maps outline y to −z, so the plot sat 0.4 m off-centre and the sakura trunk and basin hung over the back and front edges. I recentre and widen it.
2. **The gold chigi crossing on the roof floated high above the ridge, and the bars were thin.** I lower them and thicken them so they seat on the roof ends.
3. **The sakura canopy read as bare smooth lumps.** I double the blossom cards per blob and enlarge them slightly.
4. **The tree had no connection to the shrine story.** I hang two glowing paper lanterns from its branches, which also links its Electro colour to the torii lanterns.

## Edits

<<<<<<< SEARCH
    plot.push([Math.cos(a) * 2.55 * k, -0.2 + Math.sin(a) * 2.6 * k]);
=======
    plot.push([Math.cos(a) * 2.85 * k, Math.sin(a) * 3.0 * k]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const z of [-0.7, -2.2])
    for (const s of [1, -1]) box(0.07, 0.7, 0.05, GOLD, [0, ridge + 0.2, z], { rot: [s * 35, 0, 0] });
=======
  for (const z of [-0.7, -2.2])
    for (const s of [1, -1]) box(0.09, 0.75, 0.07, GOLD, [0, ridge + 0.08, z], { rot: [s * 35, 0, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // sacred rope round the trunk
=======
  // paper lanterns hanging from the sakura branches
  hangLantern(0.6, 2.76, -1.95, 0.13, 0.3);
  hangLantern(1.98, 2.3, -1.88, 0.11, 0.26);

  // sacred rope round the trunk
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 16; i++) {
=======
    for (let i = 0; i < 30; i++) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(blossomFrames, T.blossom, { size: 0.2, lean: 20, vary: 0.3, spin: 180, rng: R });
=======
  b.cards(blossomFrames, T.blossom, { size: 0.23, lean: 20, vary: 0.35, spin: 180, rng: R });
>>>>>>> REPLACE