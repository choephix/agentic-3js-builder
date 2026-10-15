1. **Blade colour**: the navy body was a flat dark mass against the dark socket. I lifted it to a brighter steel-blue so the blade silhouette and the glowing edge read clearly.
2. **Haft and grip**: the haft looked spindly under such a large head. I thickened the core and extended and widened the leather grip, and added studs and bands to match. I also added a flared bronze ferrule at the foot, so the haft ends in a fitting where it meets the snow mound.
3. **Fur collar**: it read as a thin grey duster. I made it bigger and fuller with more tufts in both layers.
4. **Rear fluke**: it was a plain dark wing. I added glowing rune strips on both faces, so the back of the head carries the same frost magic as the front.

<<<<<<< SEARCH
    const body: Rgb = mix("#233049", "#55699a", noise(p, 0.1, 2));
=======
    const body: Rgb = mix("#34497a", "#7b93c8", noise(p, 0.1, 2));
>>>>>>> REPLACE

<<<<<<< SEARCH
    0.034,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
=======
    0.04,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 0.27, 0], [0, 0.6, 0], 0.037, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.25, 0.265, 0.605, 0.62, 0.66, 0.84]) band(y, 0.042, 0.009, haft);
=======
  b.rod([0, 0.26, 0], [0, 0.64, 0], 0.048, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.26, 0.275, 0.63, 0.645, 0.84]) band(y, 0.052, 0.009, haft);
  b.lathe(
    [
      [0.036, 0],
      [0.064, 0.012],
      [0.066, 0.04],
      [0.05, 0.07],
      [0.04, 0.075],
    ],
    { at: [0, 0.2, 0], segments: 8, color: BRONZE, bone: haft, name: "ferrule" },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [Math.sin(a) * 0.046, 0.43, Math.cos(a) * 0.046],
=======
      at: [Math.sin(a) * 0.052, 0.45, Math.cos(a) * 0.052],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fur1 = b.ring(frame([0, 0.88, 0], [0, 1, 0]), { count: 12, radius: 0.04 });
=======
  const fur1 = b.ring(frame([0, 0.88, 0], [0, 1, 0]), { count: 16, radius: 0.045 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.08, 0.16],
=======
    size: [0.1, 0.2],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fur2 = b.ring(frame([0, 0.845, 0], [0, 1, 0]), { count: 9, radius: 0.042 });
=======
  const fur2 = b.ring(frame([0, 0.845, 0], [0, 1, 0]), { count: 12, radius: 0.048 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.07, 0.14],
=======
    size: [0.085, 0.17],
>>>>>>> REPLACE

<<<<<<< SEARCH
  crystal(H(-0.33, 0.1), [-0.5, -0.9, 0.1], 0.09, 0.018, ICE[0], { bone: head });
=======
  crystal(H(-0.33, 0.1), [-0.5, -0.9, 0.1], 0.09, 0.018, ICE[0], { bone: head });
  // Glowing runes on the fluke faces
  for (const sgn of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.04, 0.17), "#ffffff", {
        bone: head,
        at: H(-0.22, 0.1, sgn * 0.0165),
        dir: [0, 0, sgn],
        up: [sgn, 0, 0],
        axis: "z",
        texture: RUNE_STRIP,
      }),
      1.1,
    );
  }
>>>>>>> REPLACE