1. **Identity and form.** The cues are the tall red hat, the big white beard and the gadget backpack.
   - The hat and beard are bold and in proportion. The goggles on the band and the glowing bulb on the drooping tip add to the hat.
   - The backpack reads well from the back but almost disappears from the front, where only the telescope and a sliver of pipe show beside the head. I'll add a spinning brass propeller on a mast above the shoulder, which shows in the front, three-quarter and top views.
   - The face is the weak point. In the three-quarter view the white brow runs across the eye, and in the front view the eyes sit tight under the brim and are small. I'll make the eyes bigger and lower, and lower the outer end of the brow.
   - The nose and both cheeks are the same strong pink, so they merge into three balls. I'll shrink the cheeks and lighten them.
2. **Soundness.**
   - The hammer head sits on top of the knee-patch decal in the front view. I'll shorten the hammer so it hangs clear of the patch.
   - The steam puffs float beside the hat in the front view. I'll add a small brass nozzle on the pipe end that touches the first puff, so the steam visibly comes from the pipe.
3. **Composition.** The gnome, hat and beard already fill the frame, and the stump base and its props frame it well. I'm leaving the base as it is.
4. **Finish.** The propeller blades and cap use the existing brass and copper paints. The gentler cheek colour gives the nose a clear focal point.

## Edits

<<<<<<< SEARCH
    const hit = headSkin.around(C).at(s * 27, -3);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.062, 0.072], lift: 0.002, mirror: s > 0 });
    const cheek = headSkin.around(C).at(s * 50, -14);
    if (cheek) b.stick(new THREE.SphereGeometry(0.03, 8, 6), "#f4877f", cheek, { embed: 0.65, scale: [1, 0.3, 0.85], flat: true });
=======
    const hit = headSkin.around(C).at(s * 26, -9);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.07, 0.082], lift: 0.002, mirror: s > 0 });
    const cheek = headSkin.around(C).at(s * 52, -20);
    if (cheek) b.stick(new THREE.SphereGeometry(0.024, 8, 6), "#f6a596", cheek, { embed: 0.7, scale: [1, 0.3, 0.8], flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.093, G + 0.852, 0.095],
        [s * 0.108, G + 0.828, 0.07],
=======
        [s * 0.093, G + 0.86, 0.09],
        [s * 0.108, G + 0.842, 0.062],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0.125, G + 0.44, 0.098], [0.125, G + 0.24, 0.115], 0.01, LEATHER2, { bone: spine.joints[0], sides: 6 });
  box(0.075, 0.034, 0.034, IRON, [0.125, G + 0.225, 0.118], spine.joints[0], { rotation: [0, 0, 0] });
  box(0.014, 0.038, 0.038, BRASS, [0.164, G + 0.225, 0.118], spine.joints[0]);
=======
  b.rod([0.125, G + 0.44, 0.098], [0.125, G + 0.33, 0.108], 0.01, LEATHER2, { bone: spine.joints[0], sides: 6 });
  box(0.075, 0.034, 0.034, IRON, [0.125, G + 0.315, 0.11], spine.joints[0], { rotation: [0, 0, 0] });
  box(0.014, 0.038, 0.038, BRASS, [0.164, G + 0.315, 0.11], spine.joints[0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  ball(0.017, GILT, [0.09, G + 1.085, PZ], chest);
=======
  ball(0.017, GILT, [0.09, G + 1.085, PZ], chest);
  // steam nozzle so the puffs rise out of the pipe
  cyl(0.02, 0.014, 0.034, GILT, [-0.172, G + 1.036, PZ], chest, [0, 1, 0], 8);

  // spinning brass propeller on a mast above the shoulder
  {
    const mx = 0.19;
    const top = G + 1.0;
    b.rod([mx, G + 0.88, PZ], [mx, top, PZ], 0.007, GILT, { bone: chest, sides: 6 });
    const BLADE: Outline = [[-0.068, 0], [-0.034, 0.02], [0.034, 0.013], [0.068, 0], [0.034, -0.02], [-0.034, -0.013]];
    b.extrude(BLADE, { at: [mx, top, PZ], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.006, bevel: 0.002, color: COPPER, bone: chest });
    b.extrude(BLADE, { at: [mx, top + 0.007, PZ], x: [0, 0, 1], y: [-1, 0, 0], thickness: 0.006, bevel: 0.002, color: BRASS, bone: chest });
    ball(0.014, GILT, [mx, top + 0.012, PZ], chest);
  }
>>>>>>> REPLACE