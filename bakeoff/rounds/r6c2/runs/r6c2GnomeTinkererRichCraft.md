1. **Eyes:** they sit tight under the hat brim and read small. I enlarged the decals and lowered them a little so they carry the face.
2. **Hands:** palms, fingers and thumbs were tiny next to the heavy sleeves, so I made them chunkier and slightly longer, as the brief asks for puppet-style hands.

I left everything else as is, since the renders show no floating or clipped parts.

<<<<<<< SEARCH
    const hit = headSkin.around(C).at(s * 27, 4);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.062, 0.072], lift: 0.002, mirror: s > 0 });
=======
    const hit = headSkin.around(C).at(s * 29, 0);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.074, 0.086], lift: 0.002, mirror: s > 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.capsule(P(...wristP).addScaledVector(d, 0.01), P(...wristP).addScaledVector(d, 0.065), 0.034, SKIN, {
=======
    b.capsule(P(...wristP).addScaledVector(d, 0.01), P(...wristP).addScaledVector(d, 0.065), 0.041, SKIN, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      ["index", 0.026, 0.044],
      ["middle", 0.009, 0.048],
      ["ring", -0.009, 0.044],
      ["pinky", -0.026, 0.035],
=======
      ["index", 0.03, 0.052],
      ["middle", 0.01, 0.058],
      ["ring", -0.01, 0.052],
      ["pinky", -0.03, 0.042],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(fc, [0.0125, 0.0095], { color: SKIN, sides: 6 });
=======
      b.sweep(fc, [0.0145, 0.011], { color: SKIN, sides: 6 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(tc, [0.016, 0.012], { color: SKIN, sides: 6 });
=======
    b.sweep(tc, [0.02, 0.015], { color: SKIN, sides: 6 });
>>>>>>> REPLACE