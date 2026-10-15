1. **Haft:** the haft was near-black purple and vanished against the plinth, so I lifted it to a lighter frost-violet grain.
2. **Fur wrap:** the cards shaded to flat grey because they face sideways. I gave them a gentle self-lit boost so they read as white frost fur.
3. **Blade edge:** the cutting edge faded into the backdrop and had no signature League-style bright rim. I added a thin glowing ice edge that sticks out past the steel.

## Edits

<<<<<<< SEARCH
const WOOD = grain("#4b3b66", "#2a2140", { size: 0.012, axis: "y", seed: 4 });
=======
const WOOD = grain("#7a68a8", "#43386a", { size: 0.012, axis: "y", seed: 4 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(ringItems, FUR, {
=======
    glow(b.cards(ringItems, FUR, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      rng: rng(5),
    });
=======
      rng: rng(5),
    }), 0.45);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // glowing inlay + runes
=======
  // glowing ice rim along the cutting edge
  glow(
    b.extrude(
      [
        [0.345, 0.31],
        [0.45, 0.14],
        [0.495, 0],
        [0.45, -0.14],
        [0.375, -0.31],
        [0.33, -0.27],
        [0.4, -0.13],
        [0.43, 0],
        [0.4, 0.13],
        [0.33, 0.27],
      ],
      {
        at: AT_HEAD,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        color: ICE_B,
        bone: head,
        name: "edgeRim",
      },
    ),
    0.6,
  );

  // glowing inlay + runes
>>>>>>> REPLACE