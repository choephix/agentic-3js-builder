1. The side rune panels were buried under a solid gold slab that read as a flat yellow rectangle on both flanks. I replaced it with a dark inset panel, glowing runes in front of it, and a thin gold frame.
2. The crescent finial was drawn in the side plane, so from the front it looked like a gold stick. I turned it to face the front, and the orb now sits in its cradle.
3. The roof was the same brown as the carcass, which flattened the silhouette and hid the gold trim. I gave it indigo cel-shaded scale shingles, so the roof reads as its own shape against the warm wood and the gold edge pops.

<<<<<<< SEARCH
    const gl = b.part(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", { at: [s * 0.7513, Y0 + 1.25, 0], dir: [s, 0, 0], axis: "z", texture: RUNES });
    glow(gl, 0.9);
    bx(0.006, 0.44, 0.34, GOLD, s * 0.7525, Y0 + 1.25, 0);
=======
    bx(0.004, 0.44, 0.34, "#1a1440", s * 0.752, Y0 + 1.25, 0);
    const gl = b.part(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", { at: [s * 0.7545, Y0 + 1.25, 0], dir: [s, 0, 0], axis: "z", texture: RUNES });
    glow(gl, 0.9);
    for (const vy of [-1, 1]) bx(0.008, 0.012, 0.36, GOLD, s * 0.7525, Y0 + 1.25 + vy * 0.226, 0);
    for (const vz of [-1, 1]) bx(0.008, 0.44, 0.012, GOLD, s * 0.7525, Y0 + 1.25, vz * 0.176);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.extrude(crown as any, { at: [0, CTOP + 0.022, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.38, bevel: 0.01, color: woodH });
=======
  b.extrude(crown as any, {
    at: [0, CTOP + 0.022, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.38,
    bevel: 0.01,
    color: cel(scales(["#3d3c94", "#4b4aac", "#33317a"], "#17154a", { size: 0.07, width: 0.1 }), "#23216a"),
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(rot, { at: [0, cy, 0], thickness: 0.05, bevel: 0.01, color: goldP });
=======
    b.extrude(rot, { at: [0, cy, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: goldP });
>>>>>>> REPLACE