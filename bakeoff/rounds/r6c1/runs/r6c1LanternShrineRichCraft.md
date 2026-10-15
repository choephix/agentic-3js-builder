1. **Lowest point sat below the floor.** The sakura trunk started at y = 0.17 with a 0.27 m round cap, which poked 0.1 m under the ground. I start it higher so the cap stays inside the plot.
2. **The blossom canopy had harsh magenta undersides.** The auto-derived cel shadow turns pink to dark maroon. I give the three pink blob paints soft explicit lilac-pink shadow tones, which suits Genshin's sakura much better.
3. **The kitsune guardians were hidden behind the stone lanterns and torii pillars.** I move the toro lanterns outward and forward (x ±1.55, z 0.55) so the foxes and shrine front read in the front and three-quarter views. I also update the keep-out list so grass and flowers don't grow through them.
4. **The kasagi (torii top beam) read as flat black.** I lift it to a deep indigo-violet tone, like Inazuma's lacquered beams.

<<<<<<< SEARCH
  const PINK_A = cel(mottle("#fbb8d0", "#f59bbf", { size: 0.3, seed: 6 }));
  const PINK_B = cel(mottle("#f8a4c4", "#f08bb4", { size: 0.25, seed: 7 }));
  const PINK_C = cel(mottle("#ffc9dc", "#fbb0cb", { size: 0.35, seed: 8 }));
=======
  const PINK_A = cel(mottle("#fbb8d0", "#f59bbf", { size: 0.3, seed: 6 }), "#d78fc0");
  const PINK_B = cel(mottle("#f8a4c4", "#f08bb4", { size: 0.25, seed: 7 }), "#cf84b8");
  const PINK_C = cel(mottle("#ffc9dc", "#fbb0cb", { size: 0.35, seed: 8 }), "#dca0cc");
>>>>>>> REPLACE

<<<<<<< SEARCH
    catmull([[1.75, G - 0.05, -1.95], [1.7, 0.9, -1.98], [1.5, 1.8, -1.95], [1.25, 2.6, -1.85], [1.0, 3.3, -1.8]]),
=======
    catmull([[1.75, G + 0.1, -1.95], [1.7, 0.9, -1.98], [1.5, 1.8, -1.95], [1.25, 2.6, -1.85], [1.0, 3.3, -1.8]]),
>>>>>>> REPLACE

<<<<<<< SEARCH
  toro(1.3, SZ);
  toro(-1.3, SZ);
=======
  toro(1.6, 0.5);
  toro(-1.6, 0.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [1.3, SZ, 0.5], [-1.3, SZ, 0.5], [1.15, -0.55, 0.4],
=======
    [1.6, 0.5, 0.5], [-1.6, 0.5, 0.5], [1.15, -0.55, 0.4],
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(len * 1.05, 0.2, 0.44, BLACK, [(x0 + x1) / 2, (y0 + y1) / 2, TZ], {
=======
    box(len * 1.05, 0.2, 0.44, cel("#3a2d58", "#241a3a"), [(x0 + x1) / 2, (y0 + y1) / 2, TZ], {
>>>>>>> REPLACE