1. **Backpack and bedroll hid the head and shoulders.** From the back and three-quarter views the fat teal bedroll sits at head height behind the neck, so the head and hat tip look like they sit on a barrel. I move the bedroll to the bottom of the pack, slimmer, and put the thin blueprint scroll on top instead. I also re-seat the steam pipe and spring antenna on that lower top line. The next render should show a clean neck and shoulder line from behind, with the hat reading as the top of the silhouette.

2. **Pink cheek blobs clump around the nose.** The big flattened spheres read as lumps on either side of the nose. I shrink them and soften the colour, and enlarge the nose, which a gnome needs as its main face feature. The close-up should show a round, readable nose and subtle blush next to clear eyes.

<<<<<<< SEARCH
    if (cheek) b.stick(new THREE.SphereGeometry(0.03, 8, 6), "#f4877f", cheek, { embed: 0.65, scale: [1, 0.3, 0.85], flat: true });
=======
    if (cheek) b.stick(new THREE.SphereGeometry(0.022, 8, 6), "#f2a08a", cheek, { embed: 0.7, scale: [1, 0.25, 0.8], flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
  ball(1, NOSE, [0, G + 0.788, 0.15], head, [0.03, 0.028, 0.032]);
  ball(0.007, "#ffd7cc", [0.007, G + 0.803, 0.18], head);
=======
  ball(1, NOSE, [0, G + 0.786, 0.152], head, [0.041, 0.037, 0.043]);
  ball(0.009, "#ffd7cc", [0.011, G + 0.806, 0.19], head);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const roll = cyl(0.056, 0.056, 0.37, ROLL, [0, G + 0.835, PZ], chest, [1, 0, 0], 10);
  void roll;
  for (const s of [1, -1]) {
    cyl(0.06, 0.06, 0.022, LEATHER2, [s * 0.1, G + 0.835, PZ], chest, [1, 0, 0], 10);
    box(0.026, 0.026, 0.01, GILT, [s * 0.1, G + 0.835, PZ + 0.062], chest);
=======
  const RY = G + 0.285;
  cyl(0.052, 0.052, 0.37, ROLL, [0, RY, PZ], chest, [1, 0, 0], 10);
  for (const s of [1, -1]) {
    cyl(0.056, 0.056, 0.022, LEATHER2, [s * 0.1, RY, PZ], chest, [1, 0, 0], 10);
    box(0.026, 0.026, 0.01, GILT, [s * 0.1, RY, PZ + 0.058], chest);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([-0.19, G + 0.345, BACKZ - 0.03], [0.19, G + 0.345, BACKZ - 0.03], 0.03, "#eadcb2", { bone: chest, sides: 10 });
  for (const s of [1, -1]) {
    cyl(0.02, 0.02, 0.012, "#c9b88a", [s * 0.196, G + 0.345, BACKZ - 0.03], chest, [1, 0, 0], 8);
    cyl(0.033, 0.033, 0.02, "#b83a2a", [s * 0.1, G + 0.345, BACKZ - 0.03], chest, [1, 0, 0], 8);
  }
=======
  b.rod([-0.19, G + 0.8, PZ - 0.02], [0.19, G + 0.8, PZ - 0.02], 0.03, "#eadcb2", { bone: chest, sides: 10 });
  for (const s of [1, -1]) {
    cyl(0.02, 0.02, 0.012, "#c9b88a", [s * 0.196, G + 0.8, PZ - 0.02], chest, [1, 0, 0], 8);
    cyl(0.033, 0.033, 0.02, "#b83a2a", [s * 0.1, G + 0.8, PZ - 0.02], chest, [1, 0, 0], 8);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([-0.09, G + 0.86, PZ + 0.02], [-0.09, G + 0.98, PZ + 0.02], 0.02, COPPER, { bone: chest, sides: 8 });
=======
  b.rod([-0.09, G + 0.78, PZ + 0.02], [-0.09, G + 0.98, PZ + 0.02], 0.02, COPPER, { bone: chest, sides: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  cyl(0.026, 0.026, 0.012, GILT, [-0.09, G + 0.9, PZ + 0.02], chest, [0, 1, 0], 8);
=======
  cyl(0.026, 0.026, 0.012, GILT, [-0.09, G + 0.88, PZ + 0.02], chest, [0, 1, 0], 8);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(coil([0.09, G + 0.88, PZ], [0.09, G + 1.07, PZ], 0.022, 7), 0.0045, { bone: chest, color: BLUED, sides: 5 });
=======
  b.sweep(coil([0.09, G + 0.82, PZ], [0.09, G + 1.05, PZ], 0.022, 8), 0.0045, { bone: chest, color: BLUED, sides: 5 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  ball(0.017, GILT, [0.09, G + 1.085, PZ], chest);
=======
  ball(0.017, GILT, [0.09, G + 1.065, PZ], chest);
>>>>>>> REPLACE