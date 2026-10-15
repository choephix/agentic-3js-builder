1. **Torch flames and halos.** The halo is a large, sparsely dithered orange cloud that reads as confetti, and the flame itself is small and pinkish-red. I make the flame about 30% bigger in hot orange, yellow and white-yellow. The halo gets a tighter, denser texture, a smaller plane and a lower glow strength, so it reads as a warm wash on the brick.
2. **Ribcage looks like horns on the skull.** The ribs stand in a line behind the skull, so from the front they read as antlers. I lay the spine along x, off to the left of the skull, so it reads as a ribcage on the floor. I also nudge the femurs clear of the ribs.

<<<<<<< SEARCH
  const FLAME_O = stepped([[-2, 2], [-3, 3], [-3, 3], [-3, 2], [-2, 3], [-2, 2], [-1, 2], [-1, 1], [0, 1]], 0.02, { rows: true });
  const FLAME_M = stepped([[-1.5, 1.5], [-2, 2], [-2, 1.5], [-1.5, 2], [-1, 1.5], [-0.5, 1]], 0.02, { rows: true });
  const FLAME_I = stepped([[-1, 1], [-1, 1], [-1, 0.5], [-0.5, 1]], 0.02, { rows: true });
=======
  const FLAME_O = stepped([[-2, 2], [-3, 3], [-3, 3], [-3, 2], [-2, 3], [-2, 2], [-1, 2], [-1, 1], [0, 1]], 0.026, { rows: true });
  const FLAME_M = stepped([[-1.5, 1.5], [-2, 2], [-2, 1.5], [-1.5, 2], [-1, 1.5], [-0.5, 1]], 0.026, { rows: true });
  const FLAME_I = stepped([[-1, 1], [-1, 1], [-1, 0.5], [-0.5, 1]], 0.026, { rows: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
      glow(b.extrude(FLAME_O, { at: fb, x: ori, thickness: 0.045, color: "#e8431a", bone: fj }), 1);
      glow(b.extrude(FLAME_M, { at: fb, x: ori, thickness: 0.055, color: "#ff9a2a", bone: fj }), 1.1);
      glow(b.extrude(FLAME_I, { at: fb, x: ori, thickness: 0.065, color: "#fff0a0", bone: fj }), 1.2);
=======
      glow(b.extrude(FLAME_O, { at: fb, x: ori, thickness: 0.045, color: "#ff7a1a", bone: fj }), 1);
      glow(b.extrude(FLAME_M, { at: fb, x: ori, thickness: 0.055, color: "#ffc040", bone: fj }), 1.1);
      glow(b.extrude(FLAME_I, { at: fb, x: ori, thickness: 0.065, color: "#fff6b8", bone: fj }), 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(plane(0.55, 0.55, "#ffffff", [x, fb.y + 0.1, -0.79], { texture: HALO }), 0.8);
=======
    glow(plane(0.4, 0.4, "#ffffff", [x, fb.y + 0.08, -0.79], { texture: HALO }), 0.55);
>>>>>>> REPLACE

<<<<<<< SEARCH
      return v * 0.95 > bayer(x, y) ? (v > 0.55 ? "#ffb347" : "#ff6a1a") : "";
=======
      if (v > 0.6) return "#ffa63a";
      return v * 1.5 > bayer(x, y) ? "#c4561a" : "";
>>>>>>> REPLACE

<<<<<<< SEARCH
  femur(-1.12, 0.68, 30, 0.34);
  femur(-1.1, 0.7, -35, 0.32, 0.034);
=======
  femur(-1.12, 0.84, 30, 0.34);
  femur(-1.1, 0.86, -35, 0.32, 0.034);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const spineX = -0.72;
  for (let i = 0; i < 6; i++) box(0.045, 0.035, 0.04, BONEP, [spineX, FY + 0.02, 0.2 + i * 0.075]);
  for (let i = 1; i < 6; i++) {
    const z = 0.2 + i * 0.075;
=======
  const spineZ = 0.4;
  for (let i = 0; i < 6; i++) box(0.04, 0.035, 0.045, BONEP, [-1.3 + i * 0.075, FY + 0.02, spineZ]);
  for (let i = 1; i < 6; i++) {
    const xr = -1.3 + i * 0.075;
>>>>>>> REPLACE

<<<<<<< SEARCH
      ].map(([u, yy]) => [spineX + s * u * k, FY + yy * k + 0.005, z]);
=======
      ].map(([u, yy]) => [xr, FY + yy * k + 0.005, spineZ + s * u * k]);
>>>>>>> REPLACE