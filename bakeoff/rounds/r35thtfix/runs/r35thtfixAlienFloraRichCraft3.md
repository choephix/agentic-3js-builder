Cause: `ChainPoint` has no `.i`, and `glow()` cannot be applied to painted sweeps; use `at.t` for indexing and a flat colour for the glowing rib.

```text
<<<<<<< SEARCH
    const glowRib = b.sweep(branch, (t) => 0.006 - 0.003 * t, {
      color: GLOW_VEIN,
      shift: [0.045, 0.02],
      section: { ngon: 5 },
      caps: "round",
      group: "branch-veins",
      name: `branchGlowRib${i + 1}`,
    });
=======
    const glowRib = b.sweep(branch, (t) => 0.006 - 0.003 * t, {
      color: CYAN,
      shift: [0.045, 0.02],
      section: { ngon: 5 },
      caps: "round",
      group: "branch-veins",
      name: `branchGlowRib${i + 1}`,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.along(tendril, 4, (at) => {
      const node = addGlowOrb(b, at.at.clone(), 0.024 - at.t * 0.008, 1.7, at.t < 0.5 ? CYAN : BLUE_GLOW);
      if (at.i % 2 === 0) {
        addNodeCard(b, at.at.clone().add(vec(0, 0, 0.012)), vec(0, 0, 1), 0.06, SPORE_TEX);
      }
      return node;
    });
=======
    b.along(tendril, 4, (at) => {
      const node = addGlowOrb(b, at.at.clone(), 0.024 - at.t * 0.008, 1.7, at.t < 0.5 ? CYAN : BLUE_GLOW);
      if (Math.floor(at.t * 4) % 2 === 0) {
        addNodeCard(b, at.at.clone().add(vec(0, 0, 0.012)), vec(0, 0, 1), 0.06, SPORE_TEX);
      }
      return node;
    });
>>>>>>> REPLACE
```