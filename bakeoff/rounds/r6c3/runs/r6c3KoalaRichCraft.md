1. **Paws and hands:** they read as near-black blocks, especially from the side and three-quarter views. I swapped the paw paint to a mid grey so the hands and feet read as gripping furry paws against the pale bark.
2. **Face:** the eyes are tiny 4×4 dots, and the face is the focal point. I made them 5×5 pixel eyes with a second highlight and enlarged them so the koala has a more characterful gaze.
3. **Branch:** the fork limbs are bare sticks from the hands down to the tips, so the koala looks parked in front of a V instead of clinging to a eucalyptus branch. I started the twigs lower, added more of them, and gave each twig four leaves. The foliage now frames the head and hands and fills out the silhouette.

<<<<<<< SEARCH
const EYE = pixelArt([".kk.", "kwkk", "kkkk", ".kk."], { k: "#0d0c12", w: "#ffffff" });
=======
const EYE = pixelArt([".kkk.", "kwwkk", "kwkkk", "kkkwk", ".kkk."], { k: "#0d0c12", w: "#ffffff" });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.058, 0.058, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.07, 0.87, 0.176],
=======
    b.part(new THREE.BoxGeometry(0.07, 0.07, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.068, 0.868, 0.176],
>>>>>>> REPLACE
<<<<<<< SEARCH
  const PAW = fur(GREY_DK, 0.6, 8);
=======
  const PAW = fur(GREY, 0.3, 8);
>>>>>>> REPLACE
<<<<<<< SEARCH
    for (const t of [0.62, 0.7, 0.78, 0.86, 0.94, 1.0]) {
=======
    for (const t of [0.5, 0.58, 0.66, 0.74, 0.82, 0.9, 0.97, 1.0]) {
>>>>>>> REPLACE
<<<<<<< SEARCH
      for (let k = 0; k < 3; k++) {
        const d2 = norm([d[0] + (R() - 0.5) * 0.9,
=======
      for (let k = 0; k < 4; k++) {
        const d2 = norm([d[0] + (R() - 0.5) * 0.9,
>>>>>>> REPLACE