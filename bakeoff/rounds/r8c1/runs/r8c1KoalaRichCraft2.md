1. **Cheek tufts.** They read as striped planks stuck out of the head sides. I made them shorter, narrower and smooth-stepped, so they look like a cream ruff.
2. **Brows.** They sloped down toward the nose and made the koala look angry. I flipped the tilt to a gentle, friendly one.
3. **Eyes.** They were tiny for a face this big. I enlarged them so the white glint reads from the front.
4. **Arms and legs.** The upper limbs were oversized dark wedges that hid the grip on the trunk and branch. I slimmed both and pulled the elbows in a little, so the hugging pose and the feet on the branch show.

<<<<<<< SEARCH
    b.part(new THREE.PlaneGeometry(0.052, 0.052), "#ffffff", {
=======
    b.part(new THREE.PlaneGeometry(0.066, 0.066), "#ffffff", {
>>>>>>> REPLACE
<<<<<<< SEARCH
    box([0.06, 0.012, 0.01], "#23252d", [s * 0.098, 1.082, 0.164], head, { rotation: [0, 0, s * 8] });
=======
    box([0.06, 0.012, 0.01], "#23252d", [s * 0.098, 1.088, 0.164], head, { rotation: [0, 0, -s * 7] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.extrude(stepped([[0, 2], [0, 3], [0, 2], [0, 3], [0, 2], [0, 3]], TEXEL, { rows: true }), {
      at: [s * 0.185, 0.86, 0.04], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.22, color: CREAMP, bone: head,
=======
    b.extrude(stepped([[0, 1], [0, 2], [0, 2], [0, 1]], TEXEL, { rows: true }), {
      at: [s * 0.19, 0.85, 0.05], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.16, color: CREAMP, bone: head,
>>>>>>> REPLACE
<<<<<<< SEARCH
        [s * 0.27, 0.73, -0.07],
=======
        [s * 0.24, 0.74, -0.07],
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.sweep(arm, [0.052, 0.04], { section: "box", color: COAT, caps: "flat" });
=======
    b.sweep(arm, [0.044, 0.034], { section: "box", color: COAT, caps: "flat" });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.sweep(leg, [0.072, 0.052], { section: "box", color: COAT, caps: "flat" });
=======
    b.sweep(leg, [0.058, 0.044], { section: "box", color: COAT, caps: "flat" });
>>>>>>> REPLACE