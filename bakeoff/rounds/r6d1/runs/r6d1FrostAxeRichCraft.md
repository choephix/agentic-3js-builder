1. **Crescent blade.** The cutting edge was a plain D-shape, which reads as a generic axe. I swept both horns forward and out (top to x 0.36/y 0.41, bottom to x 0.37/y -0.45) and deepened the edge bulge. I moved the glow rim, the edge crystals, the horn crystals and the top-edge crystals to follow. The next render should show a hooked, bearded crescent silhouette with the ice horns growing from the tips.
2. **Haft.** The shaft below the head was a thin bare rod next to a very heavy head. I thickened the core (0.030 to 0.034) and the leather grip (0.037 to 0.042), widened the bronze bands and gilt studs to match, and moved the rune strips out so the thicker core does not bury them. The next render should show a sturdier handle that balances the head, with the rune glow still visible on the front and back faces.

## Edits

<<<<<<< SEARCH
    [0.03, 0.16],
    [0.18, 0.26],
    [0.3, 0.34, "sharp"],
    [0.4, 0.21],
    [0.445, 0.0],
    [0.4, -0.21],
    [0.32, -0.38, "sharp"],
    [0.2, -0.28],
    [0.03, -0.16],
=======
    [0.03, 0.16],
    [0.2, 0.28],
    [0.36, 0.41, "sharp"],
    [0.44, 0.24],
    [0.47, 0.0],
    [0.44, -0.24],
    [0.37, -0.45, "sharp"],
    [0.2, -0.3],
    [0.03, -0.16],
>>>>>>> REPLACE

<<<<<<< SEARCH
      catmull([H(0.295, 0.33), H(0.395, 0.21), H(0.44, 0), H(0.395, -0.21), H(0.315, -0.37)]),
=======
      catmull([H(0.35, 0.385), H(0.43, 0.24), H(0.463, 0), H(0.43, -0.24), H(0.365, -0.43)]),
>>>>>>> REPLACE

<<<<<<< SEARCH
const topEdge = polyline([H(0.04, 0.17), H(0.18, 0.255), H(0.3, 0.335)]);
=======
const topEdge = polyline([H(0.04, 0.17), H(0.2, 0.285), H(0.33, 0.385)]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  crystal(H(0.29, 0.32), [0.35, 1, 0], 0.27, 0.034, ICE[1], { bone: head, strength: 0.9 });
  crystal(H(0.31, -0.36), [0.35, -1, 0], 0.22, 0.03, ICE[0], { bone: head, strength: 0.9 });
  crystal(H(0.27, 0.3), [0.9, 1, 0.3], 0.1, 0.018, ICE[2], { bone: head });
  crystal(H(0.27, 0.3), [0.9, 1, -0.3], 0.1, 0.018, ICE[3], { bone: head });
=======
  crystal(H(0.35, 0.395), [0.45, 1, 0], 0.27, 0.034, ICE[1], { bone: head, strength: 0.9 });
  crystal(H(0.36, -0.435), [0.4, -1, 0], 0.22, 0.03, ICE[0], { bone: head, strength: 0.9 });
  crystal(H(0.3, 0.35), [0.9, 1, 0.3], 0.1, 0.018, ICE[2], { bone: head });
  crystal(H(0.3, 0.35), [0.9, 1, -0.3], 0.1, 0.018, ICE[3], { bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
    0.03,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
=======
    0.034,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 0.27, 0], [0, 0.6, 0], 0.037, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.25, 0.265, 0.605, 0.62, 0.66, 0.84]) band(y, 0.042, 0.009, haft);
=======
  b.rod([0, 0.27, 0], [0, 0.6, 0], 0.042, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.25, 0.265, 0.605, 0.62, 0.66, 0.84]) band(y, 0.047, 0.009, haft);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [Math.sin(a) * 0.04, 0.43, Math.cos(a) * 0.04],
=======
      at: [Math.sin(a) * 0.045, 0.43, Math.cos(a) * 0.045],
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [0, 0.75, sgn * 0.0315],
=======
        at: [0, 0.75, sgn * 0.0365],
>>>>>>> REPLACE