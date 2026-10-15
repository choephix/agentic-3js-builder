1. **Stool and barrel blocked the workbench.** In the front and low views they hide the lower shelf and the table's left and right sides. I moved the stool and barrel to the platform's front corners, still inside the stone edge and clear of the pylons and table legs, so the whole bench reads.
2. **The sack sat on top of the barrel's old spot.** I moved it to the right-back so the three bulky props no longer cluster.
3. **The platform had no alchemy of its own.** I added a bubbling iron cauldron with a glowing green brew, a fire of amber flame cones and crossed logs, and a wooden ladle, on the left side of the platform. It is the signature alchemist prop, it fills the empty left side, and its glow is a strong Genshin-style accent next to the teal Anemo light.
4. **Cauldron colours.** The iron stays in the cool blue-violet range so the warm wood and the teal rune circle keep the palette.

<<<<<<< SEARCH
    const sx = -0.5;
    const sz = 0.82;
=======
    const sx = -0.9;
    const sz = 0.6;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const bxp = 0.6;
    const bzp = 0.82;
=======
    const bxp = 0.9;
    const bzp = 0.55;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const kx = 1.0;
    const kz = 0.3;
=======
    const kx = 1.1;
    const kz = -0.12;
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ------------------------------------------------------------------ Anemo wind ribbons and motes
=======
  // ------------------------------------------------------------------ bubbling cauldron
  {
    const qx = -1.05;
    const qz = 0.0;
    for (let k = 0; k < 3; k++) {
      const a = (k * 120 + 90) * DEG;
      rod([qx + 0.17 * Math.sin(a), F + 0.13, qz + 0.17 * Math.cos(a)], [qx + 0.21 * Math.sin(a), F, qz + 0.21 * Math.cos(a)], 0.022, IRON);
    }
    // fire under the pot
    rod([qx - 0.12, F + 0.02, qz - 0.1], [qx + 0.12, F + 0.03, qz + 0.1], 0.025, WOOD_DKY);
    rod([qx + 0.12, F + 0.02, qz - 0.1], [qx - 0.12, F + 0.03, qz + 0.1], 0.025, WOOD_DKY);
    glow(cyl(0, 0.08, 0.13, 6, AMBER, [qx, F + 0.08, qz]), 1.5);
    glow(cyl(0, 0.045, 0.1, 6, "#fff0a0", [qx, F + 0.07, qz]), 1.6);
    glow(cyl(0, 0.04, 0.08, 5, AMBER, [qx + 0.08, F + 0.06, qz + 0.05]), 1.4);
    glow(cyl(0, 0.04, 0.08, 5, AMBER, [qx - 0.07, F + 0.06, qz - 0.06]), 1.4);
    // pot
    lathe(
      [[0, 0.1], [0.14, 0.1], [0.22, 0.18], [0.25, 0.28], [0.25, 0.34], [0.22, 0.34], [0.22, 0.28], [0.19, 0.2], [0, 0.17]],
      IRON,
      [qx, F, qz],
      { segments: 12 },
    );
    torus(0.235, 0.014, IRON, [qx, F + 0.34, qz], [90, 0, 0], 16);
    for (const y of [0.2, 0.27]) torus(y > 0.25 ? 0.252 : 0.225, 0.006, GOLD_DK, [qx, F + y, qz], [90, 0, 0], 14);
    for (const s of [-1, 1]) {
      ball(0.018, IRON, [qx, F + 0.3, qz + s * 0.26], {}, 6, 4);
    }
    // brew
    glow(cyl(0.215, 0.215, 0.01, 12, "#8bf05a", [qx, F + 0.305, qz]), 1.2);
    for (let i = 0; i < 6; i++) {
      const a = i * 1.1 + 0.3;
      const rr = 0.04 + (i % 3) * 0.05;
      glow(
        ball(0.016 + (i % 2) * 0.01, "#d8ffb0", [qx + rr * Math.cos(a), F + 0.325 + (i % 3) * 0.004, qz + rr * Math.sin(a)], { scale: [1, 0.6, 1] }, 6, 4),
        1.3,
      );
    }
    for (let i = 0; i < 4; i++)
      glow(ball(0.01 + i * 0.002, "#b8ff90", [qx + (i - 1.5) * 0.05, F + 0.42 + i * 0.07, qz + (i % 2) * 0.04], {}, 5, 4), 1.4);
    // ladle
    rod([qx - 0.05, F + 0.31, qz - 0.03], [qx + 0.22, F + 0.58, qz + 0.12], 0.008, WOOD_DK);
    ball(0.025, WOOD_DK, [qx - 0.05, F + 0.31, qz - 0.03], { scale: [1, 0.6, 1] }, 6, 4);
  }

  // ------------------------------------------------------------------ Anemo wind ribbons and motes
>>>>>>> REPLACE