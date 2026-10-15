1. **Side panels were bare slabs.** The side view was a huge flat purple wall. I added a gilt frame and a glowing arcane emblem to each flank, repeating the crest motif so the piece reads as a deliberate high-fantasy object from every angle.
2. **Sparkles were thin lines from the side.** The flat star extrudes are edge-on in the side view and show up as stray gold slivers, which is also why they are flagged as loose parts. Each is now a crossed pair of stars, so it reads as a star from every angle.
3. **The shelf interior was too dark.** The starry mural behind the books was barely visible. It now glows softly, which makes the shelves feel enchanted and gives the books and orbs a lit backdrop.
4. **The wood was muddy.** I lifted the purple wood tones so the grain and the gilt trim separate better.
5. **The pediment was a big empty purple triangle.** I added a row of alternating gold and glowing cyan studs along each slope, echoing the cornice studs.

<<<<<<< SEARCH
  const WOOD_V = lit(grain("#35204f", "#4d2f70", { size: 0.035, axis: "y" }));
  const WOOD_H = lit(grain("#35204f", "#4d2f70", { size: 0.035, axis: "x" }));
=======
  const WOOD_V = lit(grain("#432763", "#6a41a0", { size: 0.035, axis: "y" }));
  const WOOD_H = lit(grain("#432763", "#6a41a0", { size: 0.035, axis: "x" }));
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(new THREE.PlaneGeometry(1.2, 1.77), "#ffffff", [0, 1.095, -0.168], { texture: MURAL });
=======
  glow(P(new THREE.PlaneGeometry(1.2, 1.77), "#ffffff", [0, 1.095, -0.168], { texture: MURAL }), 0.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 6; i++) glow(ball(0.011, "#8ff0ff", [s * 0.625, 0.32 + i * 0.3, 0.208]), 1.3);
=======
    for (let i = 0; i < 6; i++) glow(ball(0.011, "#8ff0ff", [s * 0.625, 0.32 + i * 0.3, 0.208]), 1.3);
    // side panel: gilt frame and glowing emblem
    box(0.008, 0.014, 0.34, GILT, [s * 0.653, 0.42, 0]);
    box(0.008, 0.014, 0.34, GILT, [s * 0.653, 1.8, 0]);
    box(0.008, 1.4, 0.014, GILT, [s * 0.653, 1.11, 0.163]);
    box(0.008, 1.4, 0.014, GILT, [s * 0.653, 1.11, -0.163]);
    glow(
      P(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", [s * 0.656, 1.1, 0], {
        dir: [s, 0, 0],
        axis: "z",
        texture: EMBLEM,
      }),
      1.2,
    );
    for (const yy of [0.66, 0.88, 1.32, 1.54])
      glow(ball(0.014, yy < 1 ? "#ffd46a" : "#8ff0ff", [s * 0.656, yy, 0]), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const mc: V = [0, CY + 0.34 + 0.115, 0.12];
=======
  for (const s of [1, -1])
    (
      [
        [0.54, 0.102],
        [0.36, 0.187],
        [0.185, 0.272],
      ] as [number, number][]
    ).forEach(([fx, fy], i) => {
      const gem = ball(0.012, i % 2 ? "#8ff0ff" : GOLD, [s * fx, CY + fy - 0.045, 0.182]);
      if (i % 2) glow(gem, 1.3);
    });
  const mc: V = [0, CY + 0.34 + 0.115, 0.12];
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [x, y, z, sz] of sparks)
    glow(
      b.extrude(star4(sz), {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        color: "#ffe9a0",
        bone: root,
      }),
      1.5,
    );
=======
  for (const [x, y, z, sz] of sparks)
    for (const xd of [[1, 0, 0], [0, 0, 1]] as V[])
      glow(
        b.extrude(star4(sz), {
          at: [x, y, z],
          x: xd,
          y: [0, 1, 0],
          thickness: 0.006,
          color: "#ffe9a0",
          bone: root,
        }),
        1.5,
      );
>>>>>>> REPLACE