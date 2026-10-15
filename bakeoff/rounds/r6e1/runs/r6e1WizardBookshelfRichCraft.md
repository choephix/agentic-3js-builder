1. **Identity and form.** The three cues are the pediment with its eye-pentagram emblem, the shelves of tomes, scrolls, orbs and candles, and the starry moon-and-sun cabinet. All three read clearly from the front and are in proportion. Two things undercut them, both fixed below:
   - **Crescent finial and star ornaments.** They were extruded edge-on to the viewer. The front render shows the finial as a plain gold column, and the crown and hanging stars as thin ticks.
   - **Crescent finial change.** It now faces front and cups the glowing orb, so the roofline gets its wizard silhouette in the front and three-quarter views.
   - **Star ornaments change.** The stars turn to face front in the front and top views and read as glowing stars.

2. **Soundness.**
   - **Side rune panels.** The gold slab at x = 0.7525 sits in front of the runes at 0.7513 and hides them. It shows in the three-quarter view as a flat yellow rectangle on the right flank. I rebuilt it as a navy inset panel with a thin gold frame and the glowing runes in front, narrow enough to clear the pillar. The three-quarter view will show a framed rune panel instead of the yellow block.
   - **Back view.** It is a blank near-black slab. I added a glowing starry back panel with a gold frame, a large eye-pentagram emblem, two rune panels and two stars, so the back view is as designed as the front.

3. **Composition.** The shelf already fills the frame and the dais fits its footprint, so I changed nothing here.

4. **Finish.** The back panel's glow and the stars facing front add colour and glow on the subject itself. The existing atmosphere is untouched.

## Edits

<<<<<<< SEARCH
    glow(b.extrude(starOutline(Rr, Rr * 0.45), { at: [x, y, z], thickness: th, bevel: th * 0.2, color }), strength);
=======
    glow(b.extrude(starOutline(Rr, Rr * 0.45), { at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: th, bevel: th * 0.2, color }), strength);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(rot, { at: [0, cy, 0], thickness: 0.05, bevel: 0.01, color: goldP });
=======
    b.extrude(rot, { at: [0, cy, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: goldP });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const gl = b.part(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", { at: [s * 0.7513, Y0 + 1.25, 0], dir: [s, 0, 0], axis: "z", texture: RUNES });
    glow(gl, 0.9);
    bx(0.006, 0.44, 0.34, GOLD, s * 0.7525, Y0 + 1.25, 0);
=======
    bx(0.008, 0.5, 0.3, "#14183f", s * 0.754, Y0 + 1.25, 0);
    bx(0.01, 0.014, 0.32, GOLD, s * 0.7565, Y0 + 1.25 + 0.257, 0);
    bx(0.01, 0.014, 0.32, GOLD, s * 0.7565, Y0 + 1.25 - 0.257, 0);
    for (const k of [1, -1]) bx(0.01, 0.52, 0.014, GOLD, s * 0.7565, Y0 + 1.25, k * 0.157);
    glow(
      b.part(new THREE.PlaneGeometry(0.26, 0.4), "#ffffff", { at: [s * 0.7595, Y0 + 1.25, 0], dir: [s, 0, 0], axis: "z", texture: RUNES }),
      1.1,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  // crown
=======
  // back panel dressing
  {
    const zb = -0.2115;
    glow(
      b.part(new THREE.PlaneGeometry(1.3, 1.9), "#ffffff", { at: [0, Y0 + 1.19, zb], dir: [0, 0, -1], axis: "z", texture: SKY }),
      0.55,
    );
    for (const yy of [Y0 + 0.235, Y0 + 2.145]) bx(1.34, 0.024, 0.01, GOLD, 0, yy, -0.213);
    for (const k of [1, -1]) bx(0.024, 1.93, 0.01, GOLD, k * 0.66, Y0 + 1.19, -0.213);
    glow(b.part(new THREE.CircleGeometry(0.3, 24), "#ffffff", { at: [0, Y0 + 1.4, zb - 0.003], dir: [0, 0, -1], axis: "z", texture: EMBL }), 1.2);
    b.part(new THREE.TorusGeometry(0.31, 0.01, 4, 24), GOLD, { at: [0, Y0 + 1.4, -0.214] });
    for (const k of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", { at: [k * 0.42, Y0 + 0.75, zb - 0.002], dir: [0, 0, -1], axis: "z", texture: RUNES }),
        1.1,
      );
      star(k * 0.42, Y0 + 1.95, -0.222, 0.07, "#ffe27a", 0.012, 1.3);
    }
  }

  // crown
>>>>>>> REPLACE