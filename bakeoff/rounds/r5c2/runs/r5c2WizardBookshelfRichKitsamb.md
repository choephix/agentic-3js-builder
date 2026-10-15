1. The back panel is a near-black void in every view, so the painted starry sky and the books in front of it get lost. I make the sky self-lit.
2. The three bays are dark caves under their shelves. I add glowing under-shelf light strips so the tomes, orbs and potions read as lit by magic, which suits the anime look.
3. The gable roof is a flat yellow slab and the biggest plain surface at the top of the silhouette. I give it gilded shingle scales with a dark seam so it matches the detail below it.

<<<<<<< SEARCH
  put(new THREE.PlaneGeometry(1.38, 1.28), "#ffffff", [0, 1.47, -0.186], [0, 0, 0], CASE, { texture: T.starry });
=======
  glow(put(new THREE.PlaneGeometry(1.38, 1.28), "#ffffff", [0, 1.47, -0.186], [0, 0, 0], CASE, { texture: T.starry }), 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(1.44, 0.022, 0.012, GILT, 0, y, 0.213);
=======
    box(1.44, 0.022, 0.012, GILT, 0, y, 0.213);
    if (y > 1) glow(box(1.38, 0.008, 0.03, y > 1.5 ? "#e3c8ff" : "#b9f4ff", 0, y - 0.024, 0.17), 1.1);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 21; i++) box(0.032, 0.03, 0.02, GILT, -0.7 + i * 0.07, 2.085, 0.225);
=======
  for (let i = 0; i < 21; i++) box(0.032, 0.03, 0.02, GILT, -0.7 + i * 0.07, 2.085, 0.225);
  glow(box(1.38, 0.008, 0.03, "#ffe9a0", 0, 2.092, 0.17), 1.1);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.extrude(gable(1.13), { at: [0, TOP, CZ(0.02)], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.3, bevel: 0.006, color: GILT, bone: root });
=======
  const ROOF = scales(["#f0c458", "#dcaa3c", "#e8b84a"], "#7a5a22", { size: 0.06, width: 0.16, seed: 9 });
  b.extrude(gable(1.13), { at: [0, TOP, CZ(0.02)], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.3, bevel: 0.006, color: ROOF, bone: root });
>>>>>>> REPLACE