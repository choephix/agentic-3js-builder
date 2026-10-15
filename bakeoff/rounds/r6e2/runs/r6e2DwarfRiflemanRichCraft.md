**Art-director read.** The three identity cues are all present: the braided ginger beard with gold-banded braids, the goggled steel helmet, and the brass-belled blunderbuss. The beard reads best, with a clear silhouette and good scale. The helmet and goggles read well from the front. The blunderbuss bell is large enough to read in every view. Faults: the signpost sits directly behind the left hand and hides "IRONFORGE", the knee guards are ball-bearing spheres standing proud of the shins, the snow rocks are big enough to compete with the hero in the foreground, and a few small ornaments float.

1. **Identity and form.** The knee guards become flat, gold-studded plates seated on the shin.
   - Check this in the three-quarter and front views.
   - The legs lose the floating silver balls and read as armoured dwarf greaves.
2. **Soundness.**
   - The back tabard moves from 11 mm off the hips to flush with the back of the pants, in the back view.
   - The beard clasp gem sits on its ring instead of 16 mm in front of it, in the head close-up and front view.
3. **Composition.**
   - The signpost moves back and to the right, and the sign now points outward to the right. In the front and three-quarter views "IRONFORGE" is fully legible and no longer overlapped by the arm.
   - The rim rocks shrink by about 30%, so the dwarf dominates the frame and the snowy cobble ring shows more in the three-quarter, front and top views.
4. **Finish.** The signpost and knee-guard changes keep the existing atmosphere, runes and glow untouched.

## Edits

<<<<<<< SEARCH
    blob(STEEL_P, knee.at.clone().add(V(0, 0.0, 0.085)), knee, [0.06, 0.055, 0.04]);
    torus(GOLD_P, 0.045, 0.007, knee.at.clone().add(V(0, 0, 0.1)), [0, 0, 1], knee);
=======
    blob(STEEL_P, knee.at.clone().add(V(0, 0.0, 0.07)), knee, [0.058, 0.052, 0.03]);
    torus(GOLD_P, 0.048, 0.007, knee.at.clone().add(V(0, 0, 0.083)), [0, 0, 1], knee);
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD_P, { at: knee.at.clone().add(V(0, 0, 0.098)), bone: knee });
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: [0, 0.46, -0.14],
=======
    at: [0, 0.46, -0.133],
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.OctahedronGeometry(0.014, 0), "#6fe3ff", { at: [0, 0.93, 0.325], bone: head, flat: true }), 1.2);
=======
  glow(b.part(new THREE.OctahedronGeometry(0.017, 0), "#6fe3ff", { at: [0, 0.93, 0.313], bone: head, flat: true }), 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const s = 0.05 + R() * 0.05;
=======
    const s = 0.035 + R() * 0.035;
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0.5, 0, -0.33], [0.5, 0.72, -0.33], 0.026, WOOD_P, { bone: root, sides: 6, smooth: false });
  b.extrude(
    [
      [-0.17, -0.04],
      [0.12, -0.04],
      [0.2, 0],
      [0.12, 0.04],
      [-0.17, 0.04],
    ] as [number, number][],
    { at: [0.5, 0.6, -0.3], x: [1, 0.06, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: WOOD_P, bone: root },
  );
  b.part(new THREE.PlaneGeometry(0.3, 0.075), "#ffffff", {
    at: [0.485, 0.604, -0.2885],
    dir: [0, 0, 1],
    up: [-0.06, 1, 0],
    axis: "z",
    texture: SIGN,
    bone: root,
  });
  blob(SNOW_P, [0.5, 0.735, -0.33], root, [0.04, 0.02, 0.04]);
  torus(IRON_P, 0.028, 0.005, [0.5, 0.55, -0.33], [0, 1, 0], root);
=======
  b.rod([0.55, 0, -0.5], [0.55, 0.72, -0.5], 0.026, WOOD_P, { bone: root, sides: 6, smooth: false });
  b.extrude(
    [
      [-0.09, -0.04],
      [0.2, -0.04],
      [0.29, 0],
      [0.2, 0.04],
      [-0.09, 0.04],
    ] as [number, number][],
    { at: [0.55, 0.6, -0.47], x: [1, 0.06, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: WOOD_P, bone: root },
  );
  b.part(new THREE.PlaneGeometry(0.27, 0.07), "#ffffff", {
    at: [0.6, 0.608, -0.4585],
    dir: [0, 0, 1],
    up: [-0.06, 1, 0],
    axis: "z",
    texture: SIGN,
    bone: root,
  });
  blob(SNOW_P, [0.55, 0.735, -0.5], root, [0.04, 0.02, 0.04]);
  torus(IRON_P, 0.028, 0.005, [0.55, 0.55, -0.5], [0, 1, 0], root);
>>>>>>> REPLACE