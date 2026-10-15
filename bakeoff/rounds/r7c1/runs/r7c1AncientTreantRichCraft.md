1. **Head lost between the shoulders.** The head reads small and boxy next to the shoulder mounds and crown. I enlarged the skull slightly, shrank the shoulder burl and moss cap, and trimmed the crown blobs about 12%. The face and antlers now read above the shoulders.
2. **Eyes too small and the beard hides the chest sigil.** The glowing amber eyes are bigger and brighter. The beard roots and moss strands are shorter, so the teal sigil, the main Warcraft-rune cue, is clear.
3. **Arms are thin sticks under huge shoulders.** I thickened the arms and fingers so the limbs carry the same chunky weight as the trunk.
4. **Shelf fungi float off the bark.** They are bigger and sunk deeper into the trunk, so they read as growing on it.
5. **Cheek knobs look like stuck-on balls.** I pushed them back and made them smaller so they read as bark ruffs.

<<<<<<< SEARCH
  const skull = b.part(ico(), BARK_HEAD, { bone: head, at: HC, scale: [0.37, 0.38, 0.37], flat: true, rotation: [0, 0, 0] });
=======
  const skull = b.part(ico(), BARK_HEAD, { bone: head, at: HC, scale: [0.42, 0.42, 0.4], flat: true, rotation: [0, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    blob(head, P(s * 0.27, 3.08, 0.46), 0.13, BARK_DARK);
=======
    blob(head, P(s * 0.3, 3.08, 0.4), 0.11, BARK_DARK);
>>>>>>> REPLACE
<<<<<<< SEARCH
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.17, 0.105], mirror: s > 0 }), 1.3);
=======
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.22, 0.135], mirror: s > 0 }), 1.7);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const len = 0.45 + (1 - Math.abs(u)) * 0.25 + R() * 0.1;
=======
    const len = 0.3 + (1 - Math.abs(u)) * 0.15 + R() * 0.08;
>>>>>>> REPLACE
<<<<<<< SEARCH
  hang(beardPts, jaw, [0.1, 0.4], 61);
=======
  hang(beardPts, jaw, [0.09, 0.24], 61);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const crown = crownDefs.map(([at, r]) => blob(head, at, [r, r * 0.85, r], LEAF_PAINT));
=======
  const crown = crownDefs.map(([at, r]) => blob(head, at, [r * 0.88, r * 0.75, r * 0.88], LEAF_PAINT));
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.sweep(arm, [0.21, 0.19, 0.15, 0.12], { color: BARK_LIMB, sides: 8 });
=======
    b.sweep(arm, [0.26, 0.23, 0.2, 0.16], { color: BARK_LIMB, sides: 8 });
>>>>>>> REPLACE
<<<<<<< SEARCH
    blob(arm.joints[0], P(s * 0.92, 2.82, -0.02), [0.4, 0.3, 0.4], BARK_TRUNK);
    const cap = blob(arm.joints[0], P(s * 0.92, 3.02, -0.02), [0.3, 0.14, 0.3], MOSS);
=======
    blob(arm.joints[0], P(s * 0.92, 2.78, -0.02), [0.36, 0.28, 0.36], BARK_TRUNK);
    const cap = blob(arm.joints[0], P(s * 0.94, 2.96, -0.02), [0.26, 0.11, 0.26], MOSS);
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.sweep(f, [0.048, 0.014], { color: k % 2 ? BARK_DARK : BARK_LIMB, sides: 6, caps: { start: "round", end: "point" } });
=======
      b.sweep(f, [0.062, 0.016], { color: k % 2 ? BARK_DARK : BARK_LIMB, sides: 6, caps: { start: "round", end: "point" } });
>>>>>>> REPLACE
<<<<<<< SEARCH
      const at: V = [hit.at.x - hit.n.x * 0.03, hit.at.y, hit.at.z - hit.n.z * 0.03];
      b.part(new THREE.CylinderGeometry(0.17 * sc, 0.14 * sc, 0.045, 8, 1, false, -Math.PI / 2, Math.PI), SHELF, {
=======
      const at: V = [hit.at.x - hit.n.x * 0.07, hit.at.y, hit.at.z - hit.n.z * 0.07];
      b.part(new THREE.CylinderGeometry(0.25 * sc, 0.2 * sc, 0.06, 8, 1, false, -Math.PI / 2, Math.PI), SHELF, {
>>>>>>> REPLACE