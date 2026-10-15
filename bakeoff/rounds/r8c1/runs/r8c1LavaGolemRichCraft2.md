1. **The molten core was buried.** The torso column was much narrower than the basalt rings, so the gaps between rings showed almost no lava. I widened the column and made the rings shorter, so the glowing seams now read as bands across the chest.
2. **The limb seams were too thin.** The lava rods inside the legs and arms were hidden by the stacked blocks. Thicker rods make the glow show in the gaps and tie the plates together visually.
3. **The face was weak.** The eyes were small slits. I enlarged them so the angry glare reads from the front and three-quarter views.
4. **The hands were spindly next to the huge forearms.** Thicker fingers and thumbs give the chunky, readable hands the style wants.

## Edits

<<<<<<< SEARCH
  const colR = (y: number) => 0.26 + 0.117 * (y - 1.46);
=======
  const colR = (y: number) => 0.32 + 0.18 * (y - 1.46);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [1.48, 0.14, 0.34],
    [1.66, 0.14, 0.35],
    [1.84, 0.16, 0.39],
    [2.04, 0.18, 0.45],
    [2.26, 0.16, 0.5],
=======
    [1.48, 0.12, 0.34],
    [1.66, 0.12, 0.35],
    [1.84, 0.14, 0.39],
    [2.04, 0.15, 0.45],
    [2.26, 0.14, 0.5],
>>>>>>> REPLACE

<<<<<<< SEARCH
    sign(head, s > 0 ? EYE_L : EYE_R, [s * 0.14, HY + 0.02, HZ + 0.234], [0, 0, 1], [0.2, 0.1], 1.4);
=======
    sign(head, s > 0 ? EYE_L : EYE_R, [s * 0.145, HY + 0.02, HZ + 0.234], [0, 0, 1], [0.25, 0.125], 1.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.rod(hipP, kneeP, 0.12, LAVA, { bone: hipJ, section: { ngon: 6 } }), 1);
    glow(b.rod(kneeP, ankP, 0.1, LAVA, { bone: kneeJ, section: { ngon: 6 } }), 1);
=======
    glow(b.rod(hipP, kneeP, 0.17, LAVA, { bone: hipJ, section: { ngon: 6 } }), 1);
    glow(b.rod(kneeP, ankP, 0.15, LAVA, { bone: kneeJ, section: { ngon: 6 } }), 1);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.rod(shP, elP, 0.1, LAVA, { bone: shJ, section: { ngon: 6 } }), 1);
=======
    glow(b.rod(shP, elP, 0.15, LAVA, { bone: shJ, section: { ngon: 6 } }), 1);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.rod(elP, wrP, 0.1, LAVA, { bone: elJ, section: { ngon: 6 } }), 1);
=======
    glow(b.rod(elP, wrP, 0.15, LAVA, { bone: elJ, section: { ngon: 6 } }), 1);
>>>>>>> REPLACE

<<<<<<< SEARCH
      finger(`finger${S}${i + 1}`, [wrP[0] + xo, wrP[1] - 0.29, wrP[2] + 0.02], [xo * 1.6, -1, 0.1], lens[i], 0.14, 0.047);
=======
      finger(`finger${S}${i + 1}`, [wrP[0] + xo, wrP[1] - 0.29, wrP[2] + 0.02], [xo * 1.6, -1, 0.1], lens[i], 0.14, 0.06);
>>>>>>> REPLACE

<<<<<<< SEARCH
    finger(`thumb${S}`, [wrP[0] - s * 0.2, wrP[1] - 0.12, wrP[2] + 0.06], [-s * 0.5, -0.6, 0.6], [0.12, 0.11], 0.1, 0.055);
=======
    finger(`thumb${S}`, [wrP[0] - s * 0.2, wrP[1] - 0.12, wrP[2] + 0.06], [-s * 0.5, -0.6, 0.6], [0.12, 0.11], 0.1, 0.07);
>>>>>>> REPLACE