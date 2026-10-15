1. **Eyes were tiny and sat under a lid line.** The face texture now has 3×3 pixel eyes with a highlight and a dark brow row above each. They read from the front and give the koala a wide, friendly look.
2. **The crown foliage read as palm fronds.** Eucalyptus is known for round "silver dollar" leaves, so the crown now uses mostly the round leaf card at a squarer size, and there are more leaves per tip. It looks like a gum tree instead of a palm.
3. **Pale grey slabs stuck out of the trunks.** The big bark flaps used the fur colour. They are now bark-painted, so they look like peeling bark.
4. **A leaf bud hung outside the post at the seat-branch end.** It looked like a stray floating piece, so I removed it.

<<<<<<< SEARCH
  for (const ex of [3, 16]) {
    g.fill(() => K, [ex, 4, 2, 2]);
    g.fill(() => "#3a3f4a", [ex - 1, 3, 4, 1]);
  }
  g.set(3, 4, "#ffffff");
  g.set(16, 4, "#ffffff");
=======
  for (const ex of [3, 15]) {
    g.fill(() => K, [ex, 3, 3, 3]);
    g.fill(() => "#2a2e38", [ex - 1, 2, 5, 1]);
    g.set(ex, 3, "#ffffff");
    g.set(ex + 2, 5, "#5a6070");
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(crown, [LEAF, LEAF2, LEAF], {
    size: [0.05, 0.16],
    lean: 55,
=======
  b.cards(crown, [LEAF2, LEAF2, LEAF2, LEAF], {
    size: [0.085, 0.1],
    lean: 62,
>>>>>>> REPLACE

<<<<<<< SEARCH
      leafAt(crown, tp, 8, 0.05);
=======
      leafAt(crown, tp, 14, 0.08);
>>>>>>> REPLACE

<<<<<<< SEARCH
      if (big) b.stick(new THREE.BoxGeometry(0.05, 0.012, 0.13), CREAMP, post.at(t, deg), { flow: [0, 1, 0], embed: 0.3 });
=======
      if (big) b.stick(new THREE.BoxGeometry(0.05, 0.012, 0.13), BARKP, post.at(t, deg), { flow: [0, 1, 0], embed: 0.3 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    leafAt(hang, [s * 0.455, 0.29, 0.02], 3, 0.03);
=======
>>>>>>> REPLACE