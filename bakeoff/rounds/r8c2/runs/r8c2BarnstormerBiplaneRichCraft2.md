1. **Exhaust pipes dived into the lower wing.** They ended at y 1.19, inside the wing. They now swoop back and end above the wing at about (±0.7, 1.5, 1.05) with a tip flare. This fixes a visible clip.
2. **No whimsy rising off the engine.** I added a stack of fat, growing smoke puffs from each exhaust. They break up the silhouette above the lower wing and add a cartoon "putt-putt" feel.
3. **The pilot's face is bare.** I added rosy cheeks, a big grin under the moustache and a bright yellow scarf knot at the neck, so the small pilot reads as a character from the front and side.
4. **Cabane top bolts and a pennant.** I added a small teal pennant and mast on the upper wing's right wingtip strut, which gives the top wing a lively, flag-flying edge.

<<<<<<< SEARCH
    b.sweep(bezier([s * 0.58, 1.5, 1.7], [s * 0.78, 1.38, 1.55], [s * 0.68, 1.2, 1.05]), [0.055, 0.04], { color: IRON, bone: body, sides: 6 });
    ball(0.05, ORANGE, [s * 0.68, 1.19, 1.0], { bone: body });
=======
    b.sweep(bezier([s * 0.58, 1.6, 1.75], [s * 0.85, 1.7, 1.5], [s * 0.7, 1.52, 1.05]), [0.055, 0.04], { color: IRON, bone: body, sides: 6 });
    P(new THREE.CylinderGeometry(0.075, 0.05, 0.07, 8), ORANGE, [s * 0.7, 1.5, 1.04], { flat: true, rotation: [90, 0, 0] });
    // whimsical smoke puffs drifting up and back
    ([
      [0.72, 1.66, 0.88, 0.06],
      [0.76, 1.84, 0.7, 0.085],
      [0.72, 2.06, 0.5, 0.11],
      [0.78, 2.3, 0.28, 0.14],
    ] as [number, number, number, number][]).forEach(([x, y, z, r], k) =>
      ball(r, k % 2 ? "#ffffff" : "#e9e4dc", [s * x, y, z], { bone: body }),
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  ball(0.035, TEAL, [0, HY + 0.225, HZ], { bone: pilotHead });
=======
  ball(0.035, TEAL, [0, HY + 0.225, HZ], { bone: pilotHead });
  // rosy cheeks and a big grin
  for (const s of [1, -1]) ball(0.045, "#ff8fa3", [s * 0.145, HY - 0.085, HZ + 0.14], { bone: pilotHead, scale: [1, 0.8, 0.5] });
  b.sweep(
    catmull([
      [-0.07, HY - 0.15, surfZ0(0.07, 0.15)],
      [0, HY - 0.175, surfZ0(0, 0.175)],
      [0.07, HY - 0.15, surfZ0(0.07, 0.15)],
    ]),
    0.011,
    { color: DARK, bone: pilotHead, sides: 5 },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = P(new THREE.SphereGeometry(0.2, 12, 9), SKIN, [0, HY, HZ], { bone: pilotHead, scale: [1, 1.05, 1] });
=======
  const surfZ0 = (x: number, dy: number) => HZ + Math.sqrt(Math.max(0.001, 0.206 * 0.206 - x * x - (dy / 1.05) * (dy / 1.05)));
  const head = P(new THREE.SphereGeometry(0.2, 12, 9), SKIN, [0, HY, HZ], { bone: pilotHead, scale: [1, 1.05, 1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------- struts and wires
=======
  // pennant mast on the upper wing tip strut
  b.rod([-2.55, 2.82, 1.2], [-2.55, 3.35, 1.2], 0.016, WOOD, { bone: body, sides: 5 });
  b.extrude(
    [
      [0, 0],
      [0.38, 0.1],
      [0, 0.2],
    ],
    { at: [-2.55, 3.15, 1.2], x: [0, 0, -1], thickness: 0.012, color: cel(TEAL), bone: body },
  );
  ball(0.03, YELLOW, [-2.55, 3.37, 1.2]);

  // ---------- struts and wires
>>>>>>> REPLACE