1. **Loose back tabard.** It floated 56 mm behind the hips. I moved it onto the hips box so it hangs from the body.
2. **Powder horn read as a dagger.** In the side view it stuck 0.3 m out behind the hip. I made it a short inward curl against the hip.
3. **Eyes too small.** They were lost under the brow and beard. I enlarged the decals so the blue eyes carry the face.
4. **Beard cards too thin and spiky.** They stuck out like needles in the three-quarter view. I made them broader, laid them flatter against the beard mass and added more of them, so the beard reads as a solid ginger mass with overlapping blades.
5. **Left hand weak.** It was spindly, where Warcraft hands should be chunky. I made the palm and fingers thicker.
6. **Legs and boots too dark.** Warm brown was crushed to near-black in shadow. I lightened the pants and boots so the lower half reads and matches the saturated palette.
7. **Rocks looked like black crystals.** I let snow settle on more of each rock so they read as snow-capped stones.
8. **Setting thin.** I added a snow-laden fir sapling behind the keg and crate. It backs the silhouette with a cool green accent against the blue and orange.

<<<<<<< SEARCH
const PANTS_P = tone(mottle("#6b4a2c", "#523720", { size: 0.06, seed: 12 }), 0.7);
const BOOT_P = tone(mottle("#4b2e19", "#341f10", { size: 0.05, seed: 13 }), 0.9);
=======
const PANTS_P = tone(mottle("#8a6038", "#6b4a2c", { size: 0.06, seed: 12 }), 0.6);
const BOOT_P = tone(mottle("#63401f", "#46290f", { size: 0.05, seed: 13 }), 0.8);
>>>>>>> REPLACE

<<<<<<< SEARCH
const ROCK_SNOW = paint((p, n) => (n.y > 0.4 + 0.2 * noise(p, 0.05, 7) ? SNOW_P : ROCK));
=======
const ROCK_SNOW = paint((p, n) => (n.y > 0.0 + 0.25 * noise(p, 0.05, 7) ? SNOW_P : ROCK));
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: [0, 0.46, -0.185],
=======
    at: [0, 0.46, -0.15],
>>>>>>> REPLACE

<<<<<<< SEARCH
const hornPath = bezier(V(0.22, 0.65, -0.03), V(0.28, 0.6, -0.14), V(0.27, 0.5, -0.24), V(0.2, 0.44, -0.3));
=======
const hornPath = bezier(V(0.22, 0.65, -0.03), V(0.29, 0.6, -0.1), V(0.3, 0.52, -0.14), V(0.24, 0.46, -0.12));
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.055, 0.085, 0.1), GLOVE_P, { at: w.clone().addScaledVector(fd, 0.05), dir: fd, bone: wr });
=======
    b.part(new THREE.BoxGeometry(0.068, 0.09, 0.118), GLOVE_P, { at: w.clone().addScaledVector(fd, 0.05), dir: fd, bone: wr });
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(ch, [0.0145, 0.011, 0.0085], { color: SKIN_P });
=======
      b.sweep(ch, [0.018, 0.014, 0.011], { color: SKIN_P });
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.09, 0.056], segments: 10, mirror: s < 0 });
=======
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.108, 0.068], segments: 10, mirror: s < 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hits = beardSurf.scatter(120, { rng: rng(5), minDist: 0.03, filter: (h) => h.n.z > -0.1 });
=======
  const hits = beardSurf.scatter(150, { rng: rng(5), minDist: 0.028, filter: (h) => h.n.z > -0.1 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    size: [0.062, 0.115],
    lean: 50,
=======
    size: [0.082, 0.135],
    lean: 66,
>>>>>>> REPLACE

<<<<<<< SEARCH
  // cheerful snowflakes drifting around the hero
=======
  // snowy fir sapling behind the keg and crate
  {
    const TX = -0.12;
    const TZ = -0.6;
    const FIR = tone(mottle("#2f6b45", "#245238", { size: 0.06, seed: 31 }));
    b.rod([TX, 0, TZ], [TX, 0.2, TZ], 0.028, WOOD_P, { bone: root, sides: 6, smooth: false });
    [
      [0.2, 0.2, 0.22],
      [0.36, 0.16, 0.2],
      [0.5, 0.115, 0.18],
    ].forEach(([y, r, h], i) => {
      b.part(new THREE.ConeGeometry(r, h, 7), FIR, { at: [TX, y + h / 2, TZ], rotation: [0, i * 25, 0], bone: root, flat: true });
      b.part(new THREE.ConeGeometry(r * 0.72, h * 0.55, 7), SNOW_P, {
        at: [TX, y + h * 0.72, TZ],
        rotation: [0, i * 25, 0],
        bone: root,
        flat: true,
      });
    });
    b.part(new THREE.ConeGeometry(0.03, 0.08, 6), SNOW_P, { at: [TX, 0.72, TZ], bone: root, flat: true });
  }

  // cheerful snowflakes drifting around the hero
>>>>>>> REPLACE