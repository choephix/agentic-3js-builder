1. **Blade colour.** The blade body is too dark navy and swallows the glowing ice, so it doesn't read as frost-forged steel. I brightened the steel tones, which also lifts the rear fluke.
2. **Gold fittings.** The bronze plates and bands read as muddy olive. I switched them to polished gilt so the League-style gold trim pops against the blue and ice.
3. **Haft.** The haft is spindly next to the huge head, so I thickened the core, grip, bands and studs for a heroic, chunky proportion.
4. **Fur collar.** The fur ruff is small and sparse, so I made the tufts bigger and fluffier.
5. **Fluke.** The rear fluke is a dead dark wing with no icy edge, so I added a glowing ice rim along its outer edge to echo the cutting edge.
6. **Plinth.** The plinth top is plain, so I added a ring of snow tufts on the mound to give the setting a windswept, frosty look.

<<<<<<< SEARCH
const BRONZE = shade(metal("brass", { polish: 0.55, tarnish: 0.12 }));
=======
const BRONZE = shade(metal("gilt", { polish: 0.7, tarnish: 0.08 }));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const body: Rgb = mix("#34497a", "#7b93c8", noise(p, 0.1, 2));
=======
    const body: Rgb = mix("#4a68ac", "#a9c4f2", noise(p, 0.1, 2));
>>>>>>> REPLACE

<<<<<<< SEARCH
    0.04,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
=======
    0.046,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 0.26, 0], [0, 0.64, 0], 0.048, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.26, 0.275, 0.63, 0.645, 0.84]) band(y, 0.052, 0.009, haft);
=======
  b.rod([0, 0.26, 0], [0, 0.64, 0], 0.054, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.26, 0.275, 0.63, 0.645, 0.84]) band(y, 0.059, 0.009, haft);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [Math.sin(a) * 0.052, 0.45, Math.cos(a) * 0.052],
=======
      at: [Math.sin(a) * 0.057, 0.45, Math.cos(a) * 0.057],
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.1, 0.2],
=======
    size: [0.13, 0.25],
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Bronze studs and snow dollops around the plinth rim
=======
  // Snow tufts on the mound
  const tufts = b.ring(frame([0, 0.12, 0], [0, 1, 0]), { count: 14, radius: 0.3 });
  b.cards(tufts.items, TUFT, {
    size: [0.09, 0.14],
    lean: 50,
    flow: (f: any) => f.outward,
    bend: 15,
    vary: 0.3,
    spin: 10,
    rng: rng(9),
    color: "#ffffff",
    bone: root,
  });

  // Bronze studs and snow dollops around the plinth rim
>>>>>>> REPLACE

<<<<<<< SEARCH
  crystal(H(-0.39, 0.12), [-1, 0.25, 0], 0.27, 0.04, ICE[1], { bone: head, strength: 0.9 });
=======
  crystal(H(-0.39, 0.12), [-1, 0.25, 0], 0.27, 0.04, ICE[1], { bone: head, strength: 0.9 });
  glow(
    b.sweep(catmull([H(-0.12, 0.19), H(-0.26, 0.22), H(-0.385, 0.125), H(-0.26, 0.045), H(-0.14, -0.005)]), 0.009, {
      color: ICE_EDGE,
      bone: head,
      caps: "point",
      sides: 6,
      name: "flukeRim",
    }),
    0.8,
  );
>>>>>>> REPLACE