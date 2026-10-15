1. **Floor contact.** The lowest point is 135 mm under y = 0, which is deeper than the 2% allowance. The root joint sat at y = 0.1 with all geometry hung on it, which is the most likely cause, so I moved the root to the origin so every vertex is stored against the floor reference. I could not find a single offending part in the code, so this is unconfirmed; the next report will show whether it worked.
2. **Camel crowding.** In the left cluster the mother camel, baby camel, signpost and lantern overlap into one brown mass, and the mother hides the pond. I moved the mother forward and out to the left, put the baby beside her, and scaled the baby up from 0.6 to 0.7 so its collar and garland read.
3. **Second camel.** I shifted it a little so its rug-and-lantern load clears the first palm and the pond edge.

<<<<<<< SEARCH
  const root = b.joint("base", { at: [0, 0.1, 0] });
=======
  const root = b.joint("base", { at: [0, 0, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  camel("", -0.55, 0.55, 0.9, 1, "packs", COAT_A);
  camel("2", 0.0, 0.75, -0.7, 1, "rugs", COAT_B);
  camel("3", -0.85, 0.22, 0.6, 0.6, "baby", COAT_C);
=======
  camel("", -0.62, 0.6, 0.75, 1, "packs", COAT_A);
  camel("2", 0.02, 0.78, -0.6, 1, "rugs", COAT_B);
  camel("3", -0.9, 0.36, 0.4, 0.7, "baby", COAT_C);
>>>>>>> REPLACE