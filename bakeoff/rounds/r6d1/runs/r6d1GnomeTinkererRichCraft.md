1. **Face (identity).** The hat brim sits on the eyes and brows, so the eyes read tiny and a white brow stroke crosses the eye in the three-quarter and head renders.
   - I raise the whole hat and its trim by 2.2 cm.
   - I enlarge the eye decals from 0.05×0.058 to 0.068×0.078 and set them slightly wider apart.
   - I lower and thin the brows so they sit clear of the brim.
   - I shrink the nose a little.
   - The next render should show big, clear green eyes under visible brows, with a bit of forehead below the brim.
2. **Boots (soundness).** The pants end at the ankle, so each cream cuff shows an empty brown cup, which looks like a bucket from the back. I add a pants-coloured tube rising out of each cuff, so the legs read as tucked into the boots.

## Edits

<<<<<<< SEARCH
    [0, G + 0.87, 0.005],
    [0, G + 0.99, 0.0],
    [0, G + 1.1, -0.04],
    [0, G + 1.19, -0.12],
    [0, G + 1.23, -0.22],
    [0, G + 1.22, -0.31],
=======
    [0, G + 0.892, 0.005],
    [0, G + 1.012, 0.0],
    [0, G + 1.122, -0.04],
    [0, G + 1.212, -0.12],
    [0, G + 1.252, -0.22],
    [0, G + 1.242, -0.31],
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0, G + 0.872, 0.005], axis: [0, 1, 0.1], segments: 20, smoothing: 1, color: HAT_TRIM, bone: head },
=======
    { at: [0, G + 0.894, 0.005], axis: [0, 1, 0.1], segments: 20, smoothing: 1, color: HAT_TRIM, bone: head },
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hit = headSkin.around(C).at(s * 26, 2);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.05, 0.058], lift: 0.002 });
=======
    const hit = headSkin.around(C).at(s * 28, 0);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.068, 0.078], lift: 0.002 });
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.012, G + 0.868, 0.128],
        [s * 0.05, G + 0.883, 0.123],
        [s * 0.093, G + 0.862, 0.095],
        [s * 0.108, G + 0.835, 0.07],
      ]),
      [0.022, 0.014, 0.01],
=======
        [s * 0.012, G + 0.866, 0.131],
        [s * 0.05, G + 0.877, 0.125],
        [s * 0.093, G + 0.858, 0.097],
        [s * 0.108, G + 0.832, 0.07],
      ]),
      [0.016, 0.012, 0.008],
>>>>>>> REPLACE

<<<<<<< SEARCH
  ball(1, NOSE, [0, G + 0.795, 0.153], head, [0.034, 0.032, 0.036]);
  ball(0.008, "#ffd7cc", [0.008, G + 0.812, 0.186], head);
=======
  ball(1, NOSE, [0, G + 0.788, 0.15], head, [0.03, 0.028, 0.032]);
  ball(0.007, "#ffd7cc", [0.007, G + 0.803, 0.18], head);
>>>>>>> REPLACE

<<<<<<< SEARCH
    cyl(0.07, 0.066, 0.034, CUFF, [x, G + 0.13, -0.005], ankle, [0, 1, 0], 10);
=======
    cyl(0.07, 0.066, 0.034, CUFF, [x, G + 0.13, -0.005], ankle, [0, 1, 0], 10);
    cyl(0.05, 0.052, 0.07, PANTS, [x, G + 0.155, -0.005], ankle, [0, 1, 0], 10);
>>>>>>> REPLACE