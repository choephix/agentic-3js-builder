1. **Eyes are almost invisible.** The anime eyes are the style's signature, but at 0.07 m and 42° they sit half-buried beside the snout box and read as dark dots. I enlarged the decal, moved it further round the skull and raised it, so the golden iris shows from front and three-quarter.
2. **Whiskers droop like bag handles.** They hang half a metre below the chin with tassels and look like loops on the front view. I swept them out and back along the cheeks as flowing dragon whiskers, ending in a gold blade fan.
3. **Cloud mane reads as grey and pink boulders.** The cel shadow tones were too dark and the side puffs on the neck were heavy. I lightened the shadow tones to pastel and shrank and thinned the neck-side puffs so the mane is airy and the streamers show.
4. **Belly reads muddy brown.** The belly scale outline and shadow made the underside look like tan mud. I lightened the outline to a pale gold so the cream belly reads against the jade back.

<<<<<<< SEARCH
const WHITE_C = cel("#ffffff", "#c2d6f6");
const CYAN_C = cel("#c4efff", "#82b4ec");
const PINK_C = cel("#ffd5e8", "#e89cc6");
=======
const WHITE_C = cel("#ffffff", "#d6e4fc");
const CYAN_C = cel("#c9f1ff", "#9ccaf4");
const PINK_C = cel("#ffd9ea", "#f2b6d6");
>>>>>>> REPLACE

<<<<<<< SEARCH
const BELLYS = cel(scales(["#fff0cb", "#ffe5b0", "#fbeacb"], "#d9a35e", { size: 0.05, width: 0.15, seed: 4 }));
=======
const BELLYS = cel(scales(["#fff6d8", "#ffeec2", "#fdf0d6"], "#ecc98a", { size: 0.05, width: 0.15, seed: 4 }), "#f4d3a0");
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 6; i++) puff(neckS.at(0.1 + i * 0.16, s * 65), 0.065, PUFFS[Math.floor(R() * 4)]);
=======
    for (let i = 0; i < 5; i++) puff(neckS.at(0.14 + i * 0.18, s * 70), 0.048, PUFFS[Math.floor(R() * 4)]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      const hit = skullSkin.around(skullC).at(s * 42, 3);
      if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.07, 0.096], mirror: s > 0 });
=======
      const hit = skullSkin.around(skullC).at(s * 55, 10);
      if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.105, 0.144], mirror: s > 0, lift: 0.004 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      hp(s * 0.34, -0.13, 0.18),
      hp(s * 0.42, -0.3, 0.0),
      hp(s * 0.44, -0.5, -0.1),
=======
      hp(s * 0.34, -0.07, 0.12),
      hp(s * 0.46, -0.1, -0.1),
      hp(s * 0.52, -0.1, -0.36),
>>>>>>> REPLACE

<<<<<<< SEARCH
    fan(hp(s * 0.44, -0.5, -0.1), V(s * 0.1, -1, -0.2), V(1, 0, 0), 3, 0.6, 0.16, 0.04, GOLD_PAL, head);
=======
    fan(hp(s * 0.52, -0.1, -0.36), V(s * 0.35, -0.1, -1), V(0, 1, 0), 3, 0.7, 0.2, 0.045, GOLD_PAL, head);
>>>>>>> REPLACE