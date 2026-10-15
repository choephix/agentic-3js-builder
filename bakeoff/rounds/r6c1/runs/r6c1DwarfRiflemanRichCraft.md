1. **Sunk rocks:** the scattered rocks hung up to 46 mm below the floor. I raised them to sit on the surface and enlarged the base slightly so the ring of rocks still fits.
2. **Signpost clashing with the arm:** in the front view the board hid behind the left forearm and its text was cut off. I moved the post and board outward, and bent the left arm out a little so the hand clears the sign.
3. **Face reads as three red balls:** the nose and rosy cheeks merged into one cluster and the eyes were tiny. I shrank and softened the nose and cheeks and enlarged the eye decals, so the blue eyes now carry the face.
4. **Knee guards look like silver golf balls:** I flattened and shrank them and tightened the gold ring.
5. **Black skateboard slabs under the boots:** I replaced the iron plates with a smaller dark-leather sole that belongs to the boot.
6. **Blunderbuss too spindly:** I thickened the barrel and its gold bands so it reads as a hero prop at distance.

<<<<<<< SEARCH
const NOSE_P = tone("#d9674f");
=======
const NOSE_P = tone("#dd8566");
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(STEEL_P, knee.at.clone().add(V(0, 0.0, 0.085)), knee, [0.06, 0.055, 0.04]);
    torus(GOLD_P, 0.045, 0.007, knee.at.clone().add(V(0, 0, 0.1)), [0, 0, 1], knee);
=======
    blob(STEEL_P, knee.at.clone().add(V(0, 0.0, 0.08)), knee, [0.048, 0.05, 0.026]);
    torus(GOLD_P, 0.04, 0.007, knee.at.clone().add(V(0, 0, 0.092)), [0, 0, 1], knee);
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(IRON_P, [0.14, 0.04, 0.27], [fx, 0.018, 0.06], ankle);
=======
    box(LEATHER_D_P, [0.13, 0.03, 0.25], [fx, 0.015, 0.06], ankle);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const target: [number, number, number] = s > 0 ? [0.43, 0.62, 0.06] : [H.x, H.y, H.z];
=======
    const target: [number, number, number] = s > 0 ? [0.46, 0.64, 0.1] : [H.x, H.y, H.z];
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.024, 0.12],
      [0.024, 0.42],
      [0.03, 0.46],
=======
      [0.03, 0.12],
      [0.03, 0.42],
      [0.037, 0.46],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0.24, 0.03],
    [0.37, 0.03],
=======
    [0.24, 0.036],
    [0.37, 0.036],
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.052, 0.033], segments: 8 });
=======
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.072, 0.045], segments: 10, mirror: s < 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(tone("#e57d62"), [s * 0.095, 1.11, 0.15], head, [0.05, 0.04, 0.04]);
=======
    blob(tone("#e8957a"), [s * 0.105, 1.105, 0.135], head, [0.04, 0.03, 0.03]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  blob(NOSE_P, [0, 1.135, 0.205], head, [0.047, 0.052, 0.05]);
=======
  blob(NOSE_P, [0, 1.135, 0.205], head, [0.04, 0.042, 0.042]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.62, 0.66, 0.025, 8), BASE_TOP, {
=======
  b.part(new THREE.CylinderGeometry(0.68, 0.72, 0.025, 8), BASE_TOP, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const x = Math.cos(a) * (0.56 + R() * 0.05);
    const z = Math.sin(a) * (0.73 + R() * 0.05);
=======
    const x = Math.cos(a) * (0.62 + R() * 0.05);
    const z = Math.sin(a) * (0.8 + R() * 0.05);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [x, s * 0.35, z],
=======
      at: [x, s * 0.7, z],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0.5, 0, -0.33], [0.5, 0.72, -0.33], 0.026, WOOD_P, { bone: root, sides: 6, smooth: false });
=======
  b.rod([0.6, 0, -0.33], [0.6, 0.72, -0.33], 0.026, WOOD_P, { bone: root, sides: 6, smooth: false });
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0.5, 0.6, -0.3], x: [1, 0.06, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: WOOD_P, bone: root },
=======
    { at: [0.6, 0.6, -0.3], x: [1, 0.06, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: WOOD_P, bone: root },
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: [0.485, 0.604, -0.2885],
=======
    at: [0.585, 0.604, -0.2885],
>>>>>>> REPLACE

<<<<<<< SEARCH
  blob(SNOW_P, [0.5, 0.735, -0.33], root, [0.04, 0.02, 0.04]);
  torus(IRON_P, 0.028, 0.005, [0.5, 0.55, -0.33], [0, 1, 0], root);
=======
  blob(SNOW_P, [0.6, 0.735, -0.33], root, [0.04, 0.02, 0.04]);
  torus(IRON_P, 0.028, 0.005, [0.6, 0.55, -0.33], [0, 1, 0], root);
>>>>>>> REPLACE