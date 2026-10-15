1. **Foxes hidden behind the torii pillars.** The guardians sat at x = ±1.0, right behind the pillars at ±1.15, so the front view barely shows them. I moved them to ±0.85, still clear of the paving and steps.
2. **Foxes read grey, not white.** The shadow tone was dull. A brighter lit tone and a pale lavender shadow now give the ghostly white Inazuma stone-fox look.
3. **Barrels covered the offering table.** The three-quarter view had the barrels stacked in front of the table. I moved the barrel stack to the back right, beside the shrine, and brought the table forward and slightly inward. The table's offerings are now readable and the foreground opens up.
4. **Porch missing a signature detail.** I added a gold suzu bell on a twisted rope above the saisen box, which a Japanese shrine porch expects. It is a small gold focal point on the shrine front.

<<<<<<< SEARCH
const FOXW = cel(mottle("#f3f0f8", "#d9d4ea", { size: 0.16, seed: 4 }));
=======
const FOXW = cel(mottle("#fffafd", "#efe9f8", { size: 0.16, seed: 4 }), "#c9bfe6");
>>>>>>> REPLACE
<<<<<<< SEARCH
  fox(1.0, -0.1, 1);
  fox(-1.0, -0.1, -1);
=======
  fox(0.85, -0.1, 1);
  fox(-0.85, -0.1, -1);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const TX = 1.95;
  const TZ2 = -1.0;
=======
  const TX = 2.0;
  const TZ2 = -0.6;
>>>>>>> REPLACE
<<<<<<< SEARCH
  barrel(1.75, 0.2, GY, 1);
  barrel(2.45, 0.1, GY, 1);
  barrel(2.1, 0.12, GY + 0.6, 0.85);
=======
  barrel(1.65, -2.0, GY, 1);
  barrel(2.25, -1.55, GY, 1);
  barrel(1.98, -1.78, GY + 0.6, 0.85);
>>>>>>> REPLACE
<<<<<<< SEARCH
  put(cyl(0.025, 0.025, 0.006, 10), COIN, [0.08, PT + 0.08 + 0.325, Z0 + 0.46]);
=======
  put(cyl(0.025, 0.025, 0.006, 10), COIN, [0.08, PT + 0.08 + 0.325, Z0 + 0.46]);

  // suzu bell on a twisted rope
  put(cyl(0.018, 0.018, 0.3, 6), ROPE, [0, y0 + 0.85, Zf + 0.2]);
  put(cyl(0.03, 0.03, 0.03, 8), GOLD, [0, y0 + 1.0, Zf + 0.2]);
  put(ball(0.075, 10, 7), GOLD, [0, y0 + 0.64, Zf + 0.2]);
  put(box(0.09, 0.012, 0.01), INKC, [0, y0 + 0.62, Zf + 0.2 + 0.074]);
  put(cyl(0.03, 0.03, 0.012, 8), RED, [0, y0 + 0.715, Zf + 0.2]);
>>>>>>> REPLACE