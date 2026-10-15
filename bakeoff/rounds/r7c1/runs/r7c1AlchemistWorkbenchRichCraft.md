1. **Hanging herbs read as near-black.** Their cards hang from frames facing down, so they shade as undersides. The bundles, the lavender and the sack sprigs now get a glow of 0.6, which keeps their texture colours at full strength like the rest of the bright, saturated cel palette.
2. **The back rack boards are much darker than the tabletop.** That makes the rack a dead brown slab behind the glowing props. I lightened the two board grains so the warm wood supports the potions, gold trim and herbs.
3. **The setting is static.** The Genshin signature is Anemo wind, so I added two glowing spiral wind ribbons rising off the transmutation platform and a scatter of drifting teal motes. They frame the bench and echo the floating Vision, rings and runes, and they sit clear of the stool, barrel, sack and pillars.

<<<<<<< SEARCH
  const WOOD_Y = cel(grain("#a56f3d", "#8a5629", { size: 0.03, axis: "y", seed: 4 }));
  const WOOD_Y2 = cel(grain("#946034", "#7c4d26", { size: 0.03, axis: "y", seed: 6 }));
=======
  const WOOD_Y = cel(grain("#c48a52", "#a86f3a", { size: 0.03, axis: "y", seed: 4 }));
  const WOOD_Y2 = cel(grain("#b57b46", "#9a6232", { size: 0.03, axis: "y", seed: 6 }));
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(items, tex, { size, lean: 0, cross: true, rng: R, vary: 0.2, sink: 0 });
=======
    glow(b.cards(items, tex, { size, lean: 0, cross: true, rng: R, vary: 0.2, sink: 0 }), 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(items, LEAF, { size: [0.07, 0.2], lean: 0, cross: true, rng: R, vary: 0.2, sink: 0.05 });
=======
    glow(b.cards(items, LEAF, { size: [0.07, 0.2], lean: 0, cross: true, rng: R, vary: 0.2, sink: 0.05 }), 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
  return b.root;
=======
  // ------------------------------------------------------------------ Anemo wind ribbons and motes
  for (const [cx, cz, tr] of [
    [-1.05, -0.5, 2.2],
    [1.08, -0.62, -2],
  ] as [number, number, number][]) {
    glow(
      b.sweep(
        spiral([cx, F + 0.06, cz], [cx + 0.26, F + 0.06, cz], [0, 1, 0], { turns: tr, r1: 0.08, pitch: 0.3 }),
        [0.014, 0.002],
        { color: TEAL_G, bone: root, sides: 4 } as any,
      ),
      1,
    );
  }
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.9 + R() * 0.45;
    gem(
      [rr * Math.cos(a), F + 0.25 + R() * 1.2, rr * Math.sin(a)],
      0.008 + R() * 0.008,
      i % 3 ? TEAL_G : "#bafff0",
      1.4,
      [1, 1.3, 1],
    );
  }

  return b.root;
>>>>>>> REPLACE