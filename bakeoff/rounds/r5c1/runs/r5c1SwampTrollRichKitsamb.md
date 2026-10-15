1. **Eyes.** They are tiny slits under the brow in the front render, and the face is the focal point. I enlarged the eye decals, and the cranium slightly, so the glowing yellow eyes read from a distance.
2. **Totem.** The pole and crossbar tangle with the troll's arm in the three-quarter view. I moved it further back and out so it reads as a separate prop behind him.
3. **Cauldron fire.** The flames sit inside the pot bowl and are almost invisible. I added a ring of outward-leaning flame tongues and a glowing ember bed so the fire shows under the pot.
4. **Limbs.** The arms and legs read as thin stilts. I thickened them for a heavier, brutish Warcraft body.
5. **Atmosphere.** I added glowing swamp wisps and embers floating over the bog for more magic and colour.

## Edits

<<<<<<< SEARCH
    at: P(0, 2.24, 0.48),
    scale: [0.155, 0.145, 0.165],
=======
    at: P(0, 2.245, 0.48),
    scale: [0.17, 0.155, 0.175],
>>>>>>> REPLACE

<<<<<<< SEARCH
        size: [0.07, 0.044],
=======
        size: [0.092, 0.058],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(arm, [0.12, 0.11, 0.085, 0.1, 0.075], { color: SKIN });
=======
    b.sweep(arm, [0.13, 0.125, 0.1, 0.115, 0.09], { color: SKIN });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg, [0.15, 0.12, 0.09, 0.07, 0.06], { color: SKIN });
=======
    b.sweep(leg, [0.165, 0.14, 0.108, 0.078, 0.062], { color: SKIN });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const TX = -1.0;
  const TZ = -0.55;
=======
  const TX = -1.12;
  const TZ = -0.72;
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let k = 0; k < 5; k++) {
    const a = k * 1.26;
    const rr = k === 0 ? 0 : 0.1;
    glow(
      b.spike(V(CX + Math.cos(a) * rr, F + 0.04, CZ + Math.sin(a) * rr), [Math.cos(a) * 0.15, 1, Math.sin(a) * 0.15], 0.2 + 0.05 * (k % 2), 0.05, {
        bone: root,
        color: FL[k % 3],
        sides: 5,
      }),
      1.3,
    );
  }
=======
  for (let k = 0; k < 5; k++) {
    const a = k * 1.26;
    const rr = k === 0 ? 0 : 0.1;
    glow(
      b.spike(V(CX + Math.cos(a) * rr, F + 0.04, CZ + Math.sin(a) * rr), [Math.cos(a) * 0.15, 1, Math.sin(a) * 0.15], 0.2 + 0.05 * (k % 2), 0.05, {
        bone: root,
        color: FL[k % 3],
        sides: 5,
      }),
      1.3,
    );
  }
  // outward-licking flame tongues, visible around the pot
  for (let k = 0; k < 7; k++) {
    const a = k * 0.898 + 0.3;
    const out = 0.27 + 0.02 * (k % 2);
    glow(
      b.spike(
        V(CX + Math.cos(a) * out, F + 0.03, CZ + Math.sin(a) * out),
        [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4],
        0.3 + 0.07 * (k % 3),
        0.05,
        { bone: root, color: FL[(k + 1) % 3], sides: 5 },
      ),
      1.5,
    );
  }
  glow(bp2(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 9), "#ff5a14", V(CX, F + 0.012, CZ)), 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  return b.root;
=======
  // swamp wisps and rising embers
  for (const [wx, wy, wz, wc] of [
    [-0.5, 0.55, 0.85, "#7dffd0"],
    [-0.95, 0.85, 0.45, "#7dffd0"],
    [0.3, 0.5, 1.15, "#ffe27a"],
    [1.2, 1.0, -0.25, "#7dffd0"],
    [-0.3, 1.25, 1.0, "#ffe27a"],
    [0.75, 0.55, 0.5, "#ff9a3a"],
    [1.28, 0.85, 0.95, "#ff9a3a"],
    [0.85, 1.15, 1.05, "#ffc23a"],
  ] as [number, number, number, string][])
    glow(bp2(sph(5, 4), wc, V(wx, F + wy, wz), { scale: 0.022 }), 1.8);

  return b.root;
>>>>>>> REPLACE