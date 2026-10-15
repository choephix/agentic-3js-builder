Cause: the arm and leg radius functions return a one-element array (`[r] as unknown as number`), which the sweep reads as `[rx, ry]` with `ry` undefined, so those tubes get NaN vertices and the thigh-rune decal's `surface.nearest` finds no triangle.

<<<<<<< SEARCH
    const tube = b.sweep(arm, (t) => [interp(t, [[0, 0.46], [0.5, 0.4], [0.95, 0.3], [1, 0.3]])[0]] as unknown as number, { sides: 9, color: BARK_ARM, name: `arm${S}` });
=======
    const tube = b.sweep(arm, (t) => interp(t, [[0, 0.46], [0.5, 0.4], [0.95, 0.3], [1, 0.3]])[0], { sides: 9, color: BARK_ARM, name: `arm${S}` });
>>>>>>> REPLACE

<<<<<<< SEARCH
    legTubes.push(b.sweep(leg, (t) => [interp(t, [[0, 0.5], [0.45, 0.42], [0.8, 0.33], [1, 0.34]])[0]] as unknown as number, { sides: 9, color: BARK_LEG, name: `leg${S}` }));
=======
    legTubes.push(b.sweep(leg, (t) => interp(t, [[0, 0.5], [0.45, 0.42], [0.8, 0.33], [1, 0.34]])[0], { sides: 9, color: BARK_LEG, name: `leg${S}` }));
>>>>>>> REPLACE