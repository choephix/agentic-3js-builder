1. **Head swallowed by the pauldrons.** The three-tier shoulder stacks rose above the head, so the face read as a small box between two towers. I lowered and narrowed the tiers, and moved their spikes and flames down with them. The head and the glowing eyes now frame the silhouette.
2. **Eyes too small.** The eye slits were tiny. I widened them and raised their glow, so the face reads as the focal point.
3. **Basalt too dark and muddy.** The hex plates vanished into near-black, losing the plated look Genshin-style cel shading depends on. I lifted the stone palette to a cooler violet-grey with darker seams, so each plate reads against the molten seams.
4. **Floating shards looked like ice-cream cones.** The pale cone under each rock read as a cone, not lava. I replaced it with a stretched molten crystal in saturated orange that overlaps the rock above it.

## Edits

<<<<<<< SEARCH
  const stoneBase = patches("#231e2b", ["#4a4559", "#55506a", "#3f3a4f", "#4c4a63"], { size: 0.17, gap: 0.07, seed: 3 });
=======
  const stoneBase = patches("#2a2536", ["#625c7e", "#6c668a", "#554f70", "#625f86"], { size: 0.17, gap: 0.07, seed: 3 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.66, 0.16, 0.74, 2.34, 0.9, 14],
      [0.54, 0.14, 0.62, 2.5, 0.95, 20],
      [0.4, 0.14, 0.48, 2.64, 0.99, 26],
=======
      [0.6, 0.14, 0.66, 2.3, 0.9, 14],
      [0.48, 0.13, 0.54, 2.42, 0.95, 20],
      [0.36, 0.12, 0.42, 2.53, 0.99, 26],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike([s * 1.0, 2.7, z], [s * 0.35, 1, 0], 0.26, 0.055, { bone: sh, color: OBS, sides: 6 }),
=======
      b.spike([s * 0.99, 2.6, z], [s * 0.35, 1, 0], 0.22, 0.05, { bone: sh, color: OBS, sides: 6 }),
>>>>>>> REPLACE

<<<<<<< SEARCH
    flames(sh, [[s * 0.98, 2.74, -0.05], [s * 0.98, 2.74, 0.13]], [0.12, 0.3], [0, 0, -1], 25, 20);
=======
    flames(sh, [[s * 0.98, 2.62, -0.05], [s * 0.98, 2.62, 0.13]], [0.12, 0.3], [0, 0, -1], 25, 20);
>>>>>>> REPLACE

<<<<<<< SEARCH
    lit(s > 0 ? EYE_A : EYE_B, 0.25, 0.125, head, [s * 0.14, 2.765, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 1.8);
=======
    lit(s > 0 ? EYE_A : EYE_B, 0.28, 0.15, head, [s * 0.15, 2.77, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 2.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.ConeGeometry(sz * 0.55, sz * 1.1, 6), HOT, { bone: hips, at: [x, y - sz * 1.35, z], dir: [0, -1, 0], flat: true }), 1.3);
=======
    glow(b.part(new THREE.OctahedronGeometry(sz * 0.5, 0), "#ff6a1a", { bone: hips, at: [x, y - sz * 1.1, z], scale: [1, 1.6, 1], flat: true }), 1.4);
>>>>>>> REPLACE