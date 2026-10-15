**Identity cues (three-quarter and front renders; no head close-up exists for a vehicle):**
- **Long raked fork, ape-hanger bars, teardrop tank.** All three read in the three-quarter view and are in proportion. From the front the bars and mirrors give a clear chopper "Y" silhouette.
- **V-twin, sissy bar and pennant.** All three are visible and sized correctly. The pennant is the only Overwatch-style flourish that stays readable at a distance.
- **Hero-shooter colour language.** The glow rings read well, but the chrome and gunmetal blow out to flat white or dark navy, so the fork legs and engine lose their form. The front view also lacks a glowing "face".

**Changes, in priority order:**

1. **Identity and form: front face.** I add a glowing teal halo ring around the headlight, and the lamp glow stays as it is.
   - *Front view:* the headlight becomes a bright teal-ringed eye that matches the wheel rings. It shows in the three-quarter view as well.
2. **Soundness: metal readability.** I darken and cool the chrome, and lighten the gunmetal.
   - *Three-quarter and front views:* the fork legs, pipes and bars show shading instead of flat white, and the engine jugs and frame separate from the navy tank.
3. **Composition: base fitted to the bike.** I shrink the hex pad, ring, bollards and props together, about 10%.
   - *Three-quarter and top views:* the bike fills more of the frame. The crates, cone, tyres and jerrycan stay inside the hex, and the cone is moved clear of the front wheel.
4. **Finish:** the atmosphere (hazard stripes, glow ring, emblems) is untouched.

## Edits

<<<<<<< SEARCH
const CHROME = toned("#dce6f4", 0.25, 0.42);
const GUNM = toned("#566390", 0.25, 0.35);
=======
const CHROME = toned("#b4c2dc", 0.2, 0.5);
const GUNM = toned("#6f80b6", 0.25, 0.35);
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(P(new THREE.CircleGeometry(0.088, 14), "#fff3c4", steer, sc(HL, FWD, 0.08), { dir: FWD, axis: "z" }), 1.7);
=======
  glow(P(new THREE.CircleGeometry(0.088, 14), "#fff3c4", steer, sc(HL, FWD, 0.08), { dir: FWD, axis: "z" }), 1.7);
  glow(P(new THREE.TorusGeometry(0.122, 0.007, 5, 20), TEAL, steer, sc(HL, FWD, 0.06), { dir: FWD, axis: "z" }), 1.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(new THREE.CylinderGeometry(1.72, 1.8, 0.05, 6), HAZARD, stage, [0, 0.025, 0.08]);
  P(new THREE.CylinderGeometry(1.52, 1.52, 0.02, 6), DECK, stage, [0, 0.06, 0.08]);
=======
  P(new THREE.CylinderGeometry(1.55, 1.62, 0.05, 6), HAZARD, stage, [0, 0.025, 0.08]);
  P(new THREE.CylinderGeometry(1.38, 1.38, 0.02, 6), DECK, stage, [0, 0.06, 0.08]);
>>>>>>> REPLACE

<<<<<<< SEARCH
        [1.25, 0],
        [1.28, 0],
        [1.28, 0.004],
        [1.25, 0.004],
=======
        [1.12, 0],
        [1.16, 0],
        [1.16, 0.004],
        [1.12, 0.004],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const x = 1.62 * Math.sin(a);
    const z = 0.08 + 1.62 * Math.cos(a);
=======
    const x = 1.48 * Math.sin(a);
    const z = 0.08 + 1.48 * Math.cos(a);
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(box(0.3, 0.3, 0.3), "#ffffff", stage, [-0.98, G + 0.15, 0.82], { rotation: [0, 12, 0], texture: CRATE });
  P(box(0.22, 0.22, 0.22), "#ffffff", stage, [-0.98, G + 0.41, 0.82], { rotation: [0, -25, 0], texture: CRATE });
=======
  P(box(0.3, 0.3, 0.3), "#ffffff", stage, [-0.86, G + 0.15, 0.7], { rotation: [0, 12, 0], texture: CRATE });
  P(box(0.22, 0.22, 0.22), "#ffffff", stage, [-0.86, G + 0.41, 0.7], { rotation: [0, -25, 0], texture: CRATE });
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(box(0.2, 0.02, 0.2), "#1b2133", stage, [0.82, G + 0.01, 0.82]);
  P(new THREE.ConeGeometry(0.075, 0.3, 10), CONE_P, stage, [0.82, G + 0.17, 0.82]);
  glow(P(ball(0.015), ORANGE, stage, [0.82, G + 0.325, 0.82]), 1.4);
=======
  P(box(0.2, 0.02, 0.2), "#1b2133", stage, [0.76, G + 0.01, 0.76]);
  P(new THREE.ConeGeometry(0.075, 0.3, 10), CONE_P, stage, [0.76, G + 0.17, 0.76]);
  glow(P(ball(0.015), ORANGE, stage, [0.76, G + 0.325, 0.76]), 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const x = 0.95;
=======
    const x = 0.88;
>>>>>>> REPLACE