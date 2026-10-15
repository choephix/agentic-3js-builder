1. **Face read.** The eyes were tiny slits half-hidden by the brow, beard cards and big red cheek balls. I widened the eye decals (0.052 to 0.072 m) and moved them slightly outward, shrank and lowered the cheeks, and slimmed the nose. The next render should show two clear blue eyes under the brows, with the nose and cheeks no longer competing with them.
2. **Beard cards no longer cover the face.** The tufts were scattered over the top of the jaw blob, up to cheek and nose height. I limited them to hits below y = 1.05, so they only hang from the chin down. The upper face should now be open and the beard should still read as a full braided mass with its two braids.
3. **Floor penetration.** The warning came from the ring rocks, whose centres were too low and whose tilt could dip them 46 mm below the floor. I raised them and reduced their tilt. The next render should report no below-floor warning, and the rocks should still sit on the snow ring.

<<<<<<< SEARCH
    const hit = skin.around(HC).at(s * 24, -4);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.052, 0.033], segments: 8 });
=======
    const hit = skin.around(HC).at(s * 26, -4);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.072, 0.045], segments: 8 });
>>>>>>> REPLACE
<<<<<<< SEARCH
    blob(tone("#e57d62"), [s * 0.095, 1.11, 0.15], head, [0.05, 0.04, 0.04]);
=======
    blob(tone("#e5896c"), [s * 0.112, 1.098, 0.13], head, [0.04, 0.03, 0.03]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  blob(NOSE_P, [0, 1.135, 0.205], head, [0.047, 0.052, 0.05]);
=======
  blob(NOSE_P, [0, 1.128, 0.2], head, [0.04, 0.045, 0.043]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const hits = beardSurf.scatter(90, { rng: rng(5), minDist: 0.035, filter: (h) => h.n.z > -0.1 });
=======
  const hits = beardSurf.scatter(90, {
    rng: rng(5),
    minDist: 0.035,
    filter: (h) => h.n.z > -0.1 && h.at.y < 1.05,
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
      at: [x, s * 0.35, z],
=======
      at: [x, s * 0.7, z],
>>>>>>> REPLACE
<<<<<<< SEARCH
      rotation: [R() * 30, R() * 360, R() * 30],
=======
      rotation: [R() * 12, R() * 360, R() * 12],
>>>>>>> REPLACE