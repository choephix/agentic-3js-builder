1. **Rocks dipping below the floor.** The warning comes from the three icosahedron rocks, which sink up to 46 mm under y = 0. I raised each so its lowest point sits just in the base disc.
2. **Skin reads grey and muddy in shadow.** The cel shadow tone was too dark and cool. I warmed and lightened it so the face looks like an anime elf rather than a bruised one.
3. **Mouth reads as a dark frown.** It was the shadowed skin colour. It is now a flat rose-pink lip line, so it stays pink and reads as a small smile.
4. **Fur collar is a cold grey ring.** I gave it a warm cream shadow.
5. **Upper sleeves are bulky next to the forearms.** I slimmed them so the arms read as elegant, not tube-like.

The six fireflies are listed as loose parts but are deliberate floating glow accents, so I left them.

<<<<<<< SEARCH
const SKIN = cel("#fde6d4", "#f3c4b2");
=======
const SKIN = cel("#fff0e2", "#f8d2c0");
>>>>>>> REPLACE

<<<<<<< SEARCH
const FUR = cel("#f8f3e2", "#c9cdd8");
=======
const FUR = cel("#fffaf0", "#e2d5c0");
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: SKIN_DEEP, bone: head, sides: 4 },
=======
    { color: "#c9606c", bone: head, sides: 4 },
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(arm, (t) => armR(t) + 0.012 + 0.014 * t, { from: 0, to: 0.5, color: SLEEVE, caps: { start: "round", end: "flat" } });
=======
    b.sweep(arm, (t) => armR(t) + 0.007 + 0.009 * t, { from: 0, to: 0.5, color: SLEEVE, caps: { start: "round", end: "flat" } });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(ico, ROCK, { bone: root, at: [0.58, 0.05, -0.3], scale: [0.17, 0.11, 0.14], rotation: [0, 35, 0], flat: true });
  b.part(ico, ROCK, { bone: root, at: [0.7, 0.035, -0.12], scale: [0.1, 0.07, 0.09], rotation: [10, 80, 0], flat: true });
  b.part(ico, ROCK, { bone: root, at: [-0.3, 0.04, -0.62], scale: [0.14, 0.09, 0.12], rotation: [0, 12, 8], flat: true });
=======
  b.part(ico, ROCK, { bone: root, at: [0.58, 0.1, -0.3], scale: [0.17, 0.11, 0.14], rotation: [0, 35, 0], flat: true });
  b.part(ico, ROCK, { bone: root, at: [0.7, 0.072, -0.12], scale: [0.1, 0.07, 0.09], rotation: [10, 80, 0], flat: true });
  b.part(ico, ROCK, { bone: root, at: [-0.3, 0.087, -0.62], scale: [0.14, 0.09, 0.12], rotation: [0, 12, 8], flat: true });
>>>>>>> REPLACE