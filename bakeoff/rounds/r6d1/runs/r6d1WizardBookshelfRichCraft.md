1. **Side runes were buried under a flat gold slab.** On the three-quarter and side views a plain yellow rectangle sits on the pillar side. The rune plane at x = 0.7513 was swallowed by the gold box at x = 0.7525. I'm replacing the box with a navy plate with a recessed gold rim, and moving the glowing runes just in front of it. The next render should show a dark panel with glowing cyan glyphs framed in gold on both sides.

2. **The crescent finial read as a gold bar from the front.** It was extruded in the YZ plane, so it was edge-on. I'm extruding it along X so it faces the front. The front view should now show an upward-opening gold crescent cradling the blue orb.

3. **The back was a black void.** I'm giving the back panel a brighter wood paint, since the cel shadow tone made it read black. I'm also adding the glowing eye-pentagram emblem on its outer face. The back view should show warm wood with a lit sigil.

<<<<<<< SEARCH
    const gl = b.part(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", { at: [s * 0.7513, Y0 + 1.25, 0], dir: [s, 0, 0], axis: "z", texture: RUNES });
    glow(gl, 0.9);
    bx(0.006, 0.44, 0.34, GOLD, s * 0.7525, Y0 + 1.25, 0);
=======
    bx(0.004, 0.47, 0.37, GOLD, s * 0.7515, Y0 + 1.25, 0);
    bx(0.006, 0.44, 0.34, "#150f38", s * 0.7525, Y0 + 1.25, 0);
    const gl = b.part(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", { at: [s * 0.7575, Y0 + 1.25, 0], dir: [s, 0, 0], axis: "z", texture: RUNES });
    glow(gl, 1.1);
>>>>>>> REPLACE
<<<<<<< SEARCH
  bx(1.34, 2.1, 0.03, woodD, 0, Y0 + 1.19, -0.195);
=======
  bx(1.34, 2.1, 0.03, grain("#8a5a38", "#b07a4c", { size: 0.03, axis: "y" }), 0, Y0 + 1.19, -0.195);
  glow(b.part(new THREE.CircleGeometry(0.3, 24), "#ffffff", { at: [0, Y0 + 1.2, -0.2118], dir: [0, 0, -1], axis: "z", texture: EMBL }), 0.9);
  b.part(new THREE.TorusGeometry(0.31, 0.01, 4, 24), GOLD, { at: [0, Y0 + 1.2, -0.2125] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.extrude(rot, { at: [0, cy, 0], thickness: 0.05, bevel: 0.01, color: goldP });
=======
    b.extrude(rot, { at: [0, cy, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: goldP });
>>>>>>> REPLACE