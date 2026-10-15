**What the renders show**

The identity cues are the Pyro-style basalt plates with molten seams, a glowing face with horns and flame crest, and the gold trim, emblem and rune halo.

- **Basalt plates:** clearly visible and in proportion.
- **Molten seams and glow:** they read on the torso, arms and stage pool. The face is the weakest cue: the eyes are tiny slits on a dark plate, and the pauldron stacks hide the head in the three-quarter view.
- **Gold trim, emblem and halo:** the emblem and halo read well in front. From behind, the halo's support rod lands on top of the back emblem and looks like a stray cylinder.

**Changes, in priority order**

1. **Face (identity).** Make both eyes about 35% bigger and glow brighter, on a wider, taller face plate. The front and head close-up views will show two bold flame-eyes instead of small slits.
2. **Pauldrons (form and composition).** Lower the three-step shoulder stacks, their spikes and their flames. The head and horns will clear the shoulders in the three-quarter and head views, and the silhouette becomes a clearer head-over-shoulders shape.
3. **Halo support and back emblem (soundness).** Move the rod to start at the low edge of the back slab and raise and shrink the back emblem. In the back view the rod will no longer cross the emblem and will read as a stand holding the halo.
4. **Back pillars (composition).** Shorten the three stage pillars and push them to the rim. The back view will show the golem's legs and back plate instead of a wall of pillars, and the front view keeps its clean silhouette.

<<<<<<< SEARCH
  blk(head, [0, 2.76, 0.585], [0.5, 0.17, 0.04], [0, 0, 0], OBS);
=======
  blk(head, [0, 2.775, 0.585], [0.58, 0.21, 0.04], [0, 0, 0], OBS);
>>>>>>> REPLACE

<<<<<<< SEARCH
    lit(s > 0 ? EYE_A : EYE_B, 0.2, 0.1, head, [s * 0.17, 2.77, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 1.5);
=======
    lit(s > 0 ? EYE_A : EYE_B, 0.27, 0.14, head, [s * 0.15, 2.775, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 2.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.66, 0.16, 0.74, 2.34, 0.9, 14],
      [0.54, 0.14, 0.62, 2.5, 0.95, 20],
      [0.4, 0.14, 0.48, 2.64, 0.99, 26],
=======
      [0.66, 0.16, 0.74, 2.28, 0.9, 14],
      [0.5, 0.13, 0.58, 2.4, 0.94, 20],
      [0.34, 0.12, 0.42, 2.5, 0.97, 26],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike([s * 1.0, 2.7, z], [s * 0.35, 1, 0], 0.26, 0.055, { bone: sh, color: OBS, sides: 6 }),
=======
      b.spike([s * 0.98, 2.57, z], [s * 0.35, 1, 0], 0.22, 0.055, { bone: sh, color: OBS, sides: 6 }),
>>>>>>> REPLACE

<<<<<<< SEARCH
    flames(sh, [[s * 0.98, 2.74, -0.05], [s * 0.98, 2.74, 0.13]], [0.12, 0.3], [0, 0, -1], 25, 20);
=======
    flames(sh, [[s * 0.98, 2.6, -0.05], [s * 0.98, 2.6, 0.13]], [0.12, 0.28], [0, 0, -1], 25, 20);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 2.2, -0.58], [0, 1.94, -0.88], 0.04, GOLD, { bone: spine3 });
=======
  b.rod([0, 1.6, -0.56], [0, 1.94, -0.9], 0.04, GOLD, { bone: spine3 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  lit(EMBLEM, 0.3, 0.3, spine3, [0, 2.02, -0.575], [0, 0, -1], [0, 1, 0], 1.2);
=======
  lit(EMBLEM, 0.26, 0.26, spine3, [0, 2.12, -0.575], [0, 0, -1], [0, 1, 0], 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-1.2, -0.8, 0.75],
    [1.25, -0.75, 0.5],
    [0.5, -1.3, 0.9],
=======
    [-1.4, -0.55, 0.5],
    [1.45, -0.45, 0.42],
    [0.95, -1.15, 0.38],
>>>>>>> REPLACE