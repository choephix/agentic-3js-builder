1. **Lowest point 33 mm under the floor.** The rotated rim stones dipped through the base. I raised them so nothing goes below y = 0.
2. **Shoulder and haunch spheres.** They read as grey balls stuck on the sides. I shrank them and moved them inward so they sit in the body line.
3. **Back ridge spikes.** They looked like black needles standing straight up. They now sweep back, are shorter and wider, and have a lighter tip.
4. **Face and eyes.** The dark brow slabs covered the eyes and the amber was barely visible. I made the brows smaller and higher, enlarged the eye decals and raised their glow.
5. **Style signature.** I added Frostwolf blue war-paint streaks under each eye, in the Warcraft spirit.
6. **Leg colour.** The fawn mix turned the legs brown against a grey body. I reduced it so the coat reads as one wolf.
7. **Loose banner tassels.** They hung 25 mm below the banner. I moved them up so they attach to the swallowtail corners.

<<<<<<< SEARCH
    c = mix(c, FAWN, smoothstep(0.55, 0.22, p.y - FLOOR) * 0.55);
=======
    c = mix(c, FAWN, smoothstep(0.35, 0.1, p.y - FLOOR) * 0.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(P(s * 0.175, 0.7, 0.4), [0.125, 0.17, 0.2], FUR, fleg.joints[0]);
=======
    blob(P(s * 0.16, 0.68, 0.4), [0.105, 0.15, 0.17], FUR, fleg.joints[0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(P(s * 0.17, 0.66, -0.4), [0.125, 0.21, 0.22], FUR, hleg.joints[0]);
=======
    blob(P(s * 0.155, 0.67, -0.4), [0.1, 0.17, 0.19], FUR, hleg.joints[0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      const dir = f.n.clone().multiplyScalar(0.75).addScaledVector(f.tangent, -0.8);
      blade({ at: f, along: dir, side: [1, 0, 0], len: len * (0.85 + 0.3 * ((i * 7) % 3) / 2), w, root: "#2f3139", tip: "#8a8e96" });
=======
      const dir = f.n.clone().multiplyScalar(0.5).addScaledVector(f.tangent, -1.1);
      blade({ at: f, along: dir, side: [1, 0, 0], len: len * 0.8 * (0.85 + 0.3 * ((i * 7) % 3) / 2), w: w * 1.6, root: "#2f3139", tip: "#a9adb4" });
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [0.088, 0.056],
=======
      size: [0.1, 0.066],
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(eye, 0.55);
    b.part(new THREE.BoxGeometry(0.09, 0.024, 0.06), "#3b3d45", {
=======
    glow(eye, 0.9);
    b.part(new THREE.BoxGeometry(0.075, 0.016, 0.05), "#3b3d45", {
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: hp(s * 0.086, 0.066, 0.123),
=======
      at: hp(s * 0.088, 0.09, 0.115),
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const e of eyeP) c = mix(c, "#24212a", smoothstep(0.066, 0.032, p.distanceTo(e)) * 0.85);
=======
    for (const e of eyeP) {
      const stripe =
        smoothstep(0.012, 0.005, Math.abs(p.x - e.x * 1.12)) *
        smoothstep(e.y - 0.01, e.y - 0.025, p.y) *
        smoothstep(e.y - 0.09, e.y - 0.07, p.y) *
        smoothstep(0.1, 0.03, Math.abs(p.z - e.z));
      c = mix(c, "#2f86d8", stripe * 0.9);
    }
    for (const e of eyeP) c = mix(c, "#24212a", smoothstep(0.066, 0.032, p.distanceTo(e)) * 0.85);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [x * 0.97, 0.08, z * 0.97],
=======
      at: [x * 0.97, 0.12, z * 0.97],
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [bx + s * 0.16, FLOOR + 0.35, bz],
=======
      at: [bx + s * 0.16, FLOOR + 0.4, bz],
>>>>>>> REPLACE