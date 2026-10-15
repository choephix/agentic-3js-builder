1. **Camels are the hero but read small and llama-like.** I scaled the two adults from 1.2 to 1.4 and the baby from 0.72 to 0.85. I also enlarged the hump so the silhouette reads as a camel. The next render should show camels clearly bigger against the palms and tents, each with a visible hump.

2. **Camel heads were cluttered.** The forelock spike read as a third horn, the neck mane spikes were oversized, and the eyes were tiny. I shrank the forelock and both mane rows, and enlarged the eyes and their highlights. The close-up should show a calmer head with clear round eyes and no stray horn.

3. **The baby camel was hidden behind camel 1 and the signpost.** I moved it to the front-left, walking alongside its mother (facing the same way, with clear sand between them). I also nudged the adults so they don't crowd the pond rim or the cushions. The baby should now be visible in all views.

4. **Floor warning (135 mm below y = 0).** I couldn't find a part that dips below the base; the base lathe sits at y = 0 and everything else rests at `TOP` or higher. It may be a bounding-box artefact from the skinned camel meshes, so I made no speculative change there.

<<<<<<< SEARCH
    E(coat, P(0, 0.298, -0.015), kind === "baby" ? 0.034 : 0.044, kind === "baby" ? 0.045 : 0.058, 0.058, mid);
=======
    E(coat, P(0, 0.3, -0.015), kind === "baby" ? 0.04 : 0.052, kind === "baby" ? 0.05 : 0.064, 0.066, mid);
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.spike(lo, lo, s(0.024), s(0.014), { color: o_mane(coat), bone: neck.joints[Math.min(3, Math.floor(t * 4))], sides: 5 });
=======
      b.spike(lo, lo, s(0.016), s(0.01), { color: o_mane(coat), bone: neck.joints[Math.min(3, Math.floor(t * 4))], sides: 5 });
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.spike(hi, hi, s(0.022), s(0.01), { color: o_mane(coat), bone: neck.joints[Math.min(3, Math.floor((0.2 + i * 0.16) * 4))] });
=======
      b.spike(hi, hi, s(0.014), s(0.007), { color: o_mane(coat), bone: neck.joints[Math.min(3, Math.floor((0.2 + i * 0.16) * 4))] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.spike(hl(0, 0.03, 0.0), D(0, 0.8, -0.5), s(0.03), s(0.014), { color: o_mane(coat), bone: head });
=======
    b.spike(hl(0, 0.032, 0.0), D(0, 0.8, -0.5), s(0.016), s(0.01), { color: o_mane(coat), bone: head });
>>>>>>> REPLACE
<<<<<<< SEARCH
      const eye = ell(INK, hl(sd * 0.028, 0.016, 0.035), s(0.0125), s(0.0125), s(0.0125), {
=======
      const eye = ell(INK, hl(sd * 0.03, 0.016, 0.035), s(0.017), s(0.017), s(0.017), {
>>>>>>> REPLACE
<<<<<<< SEARCH
      E("#ffffff", hl(sd * 0.0385, 0.0245, 0.045), 0.0048, 0.0048, 0.0048, head);
=======
      E("#ffffff", hl(sd * 0.043, 0.022, 0.044), 0.006, 0.006, 0.006, head);
>>>>>>> REPLACE
<<<<<<< SEARCH
  camel("", -0.52, 0.5, 0.9, 1.2, "packs", COAT_A);
  camel("2", 0.1, 0.72, -1.2, 1.2, "rugs", COAT_B);
  camel("3", -0.88, 0.1, 0.6, 0.72, "baby", COAT_C);
=======
  camel("", -0.6, 0.45, 0.9, 1.4, "packs", COAT_A);
  camel("2", 0.05, 0.8, -1.2, 1.4, "rugs", COAT_B);
  camel("3", -0.55, 0.82, 0.9, 0.85, "baby", COAT_C);
>>>>>>> REPLACE