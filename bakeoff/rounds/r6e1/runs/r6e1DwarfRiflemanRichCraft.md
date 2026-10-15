**Art-director read**

Identity cues:
- **Braided ginger beard:** clearly visible and in proportion. The two gold-ringed braids and the leaf-card mass read well.
- **Goggled steel helmet:** reads well, with a gold crest and brim.
- **Blunderbuss:** the weakest cue. It is raised at about 40° so the bell flares up beside the face like a trumpet, and the flare competes with the head in the three-quarter and front views.
- **Face:** the eyes are the weak point. They are tiny blue slits under the brow, while the red nose and cheek balls dominate. Both eyes need to read from the front.

Changes, in priority order:

1. **Face (front and head close-up):** the eye decals get about 60% larger and sit a touch higher. The brows move up so they no longer cover the eyes. The nose and cheek balls shrink so the eyes become the focus.
2. **Blunderbuss (three-quarter and front):** the gun is lowered from about 40° to about 30°. The bell sits near chest height, pointing out front, so it reads as a gun and no longer rises beside the face. The wood grain axis follows the new angle.
3. **Soundness (back view):** the back tabard plane moves from 56 mm off the hips to about 10 mm off them. The zero-radius sphere on each bandolier shell is removed, and the shells grow slightly so they read as cartridges.
4. **Floor penetration (all views):** the snow rocks sat their centres at 0.35 of their size and sank 46 mm below the floor. They now sit at 0.7, which is about 10 to 20 mm deep. The warning clears.

## Edits

<<<<<<< SEARCH
    const shell = b.stick(new THREE.CylinderGeometry(0.009, 0.009, 0.03, 6), BRASS_P, hit.moved([0, 0.02, 0]), {
      bone: chest,
    });
    glow(b.part(new THREE.SphereGeometry(0.0, 3, 2), "#000000", { at: shell.at, bone: chest }), 0);
=======
    b.stick(new THREE.CylinderGeometry(0.011, 0.011, 0.045, 6), BRASS_P, hit.moved([0, 0.02, 0]), {
      bone: chest,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: [0, 0.46, -0.185],
    dir: [0, -0.18, -1],
=======
    at: [0, 0.46, -0.14],
    dir: [0, -0.1, -1],
>>>>>>> REPLACE

<<<<<<< SEARCH
const F = V(0, 0.64, 0.77).normalize();
=======
const F = V(0, 0.5, 0.87).normalize();
>>>>>>> REPLACE

<<<<<<< SEARCH
  const WOOD_G = tone(grain("#8d5a2e", "#5f3a1c", { size: 0.014, axis: [0, 0.64, 0.77], seed: 4 }));
=======
  const WOOD_G = tone(grain("#8d5a2e", "#5f3a1c", { size: 0.014, axis: [0, 0.5, 0.87], seed: 4 }));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hit = skin.around(HC).at(s * 24, -4);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.052, 0.033], segments: 8 });
=======
    const hit = skin.around(HC).at(s * 26, 1);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.085, 0.054], segments: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(BROW_P, [s * 0.062, 1.205, 0.172], head, [0.06, 0.022, 0.034], { rotation: [0, 0, s * 20] });
    blob(BROW_P, [s * 0.1, 1.212, 0.15], head, [0.04, 0.02, 0.03], { rotation: [0, 0, s * 28] });
=======
    blob(BROW_P, [s * 0.062, 1.226, 0.168], head, [0.062, 0.02, 0.034], { rotation: [0, 0, s * 20] });
    blob(BROW_P, [s * 0.105, 1.23, 0.145], head, [0.04, 0.019, 0.03], { rotation: [0, 0, s * 28] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(tone("#e57d62"), [s * 0.095, 1.11, 0.15], head, [0.05, 0.04, 0.04]);
=======
    blob(tone("#e88a6a"), [s * 0.105, 1.1, 0.145], head, [0.04, 0.03, 0.03]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  blob(NOSE_P, [0, 1.135, 0.205], head, [0.047, 0.052, 0.05]);
=======
  blob(NOSE_P, [0, 1.13, 0.205], head, [0.04, 0.044, 0.043]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [x, s * 0.35, z],
=======
      at: [x, s * 0.7, z],
>>>>>>> REPLACE