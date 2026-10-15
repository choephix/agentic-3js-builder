1. **Flames read as a comb of candles.** Every feather tip carries an upright flame card, so the wing edges look like rows of candles. Wing and tail flames now lean back with `flow` and `lean` so they stream behind the plumage. I also trimmed the secondary-feather flames to every other feather so the rows stop repeating.
2. **Head and eyes are too small for the style.** Genshin-style creatures read through big expressive eyes and a slightly larger head, so I enlarged the skull and the eye decals. I shifted the skull back a little so the beak stays long and visible.
3. **Chest is a tangle of gold cards.** I reduced the chest tuft count so the cel-shaded red-and-cream chest and the ruby gem and sigil show through.

<<<<<<< SEARCH
    bone: head, at: head.local({ forward: 0.05, up: 0.03 }), scale: [0.085, 0.08, 0.1],
=======
    bone: head, at: head.local({ forward: 0.035, up: 0.035 }), scale: [0.092, 0.086, 0.105],
>>>>>>> REPLACE
<<<<<<< SEARCH
      size: [0.075, 0.052],
=======
      size: [0.095, 0.067],
>>>>>>> REPLACE
<<<<<<< SEARCH
  const chestHits = skin.scatter(70, {
=======
  const chestHits = skin.scatter(45, {
>>>>>>> REPLACE
<<<<<<< SEARCH
      feather(t, ang, L, 0.16, -0.02, "sec", -0.006, true);
=======
      feather(t, ang, L, 0.16, -0.02, "sec", -0.006, i % 2 === 0);
>>>>>>> REPLACE
<<<<<<< SEARCH
          size: [0.11, 0.24], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(51 + (s > 0 ? 0 : 7)), bone,
=======
          size: [0.13, 0.3], lean: 55, bend: 25, flow: [0, 0.25, -1], cross: true, vary: 0.3, rng: rng(51 + (s > 0 ? 0 : 7)), bone,
>>>>>>> REPLACE
<<<<<<< SEARCH
      size: [0.14, 0.3], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.25, rng: rng(41), bone: tail.joints[0],
=======
      size: [0.16, 0.38], lean: 45, bend: 25, flow: [0, 0.2, -1], cross: true, vary: 0.25, rng: rng(41), bone: tail.joints[0],
>>>>>>> REPLACE