**What the brief asks for vs. what the renders show**

Identity cues are a flame crest and ribbon-tail plumage, spread wings tipped with fire, and a gilded fierce raptor face.

- **Flame plumage and crest:** visible and strong from the top and three-quarter views.
- **Wings:** spread, but flat and horizontal. The front view reads as a straight bar instead of a rising, dramatic phoenix silhouette.
- **Raptor face:** weak. The head is tiny against a 5.7 m wingspan and the eyes are specks, so the front view hardly shows two eyes. The body is also small under the plumage.

**Changes, in priority order**

1. **Head and eyes (head close-up and front view).** The skull, jaw and both beak halves are rebuilt about 30% bigger, with a taller circlet, brow gem and brow rods. The eye decals are larger and move 18° toward the front, so both eyes face the camera in the front view and read as big golden raptor eyes in the close-up.
2. **Wings (front and three-quarter views).** The shoulder-to-hand line now rises (elbow 1.30, wrist 1.55, hand 1.82 m). The front view becomes a V with the flame tips lifted, and the primaries sweep upward in the three-quarter view.
3. **Body mass (front and three-quarter views).** Torso and neck radii grow a little, so the chest and neck carry the wing roots and the hero is less dwarfed by the plumage.
4. **Crest base (head and front views).** The crest ribbons now start at the new skull top (1.75 m) instead of inside the bigger head, so they sprout from the head cleanly.

<<<<<<< SEARCH
  const body = b.sweep(spine, [0.13, 0.22, 0.27, 0.29, 0.25, 0.18], { color: BODY, sides: 10 });
  const neckTube = b.sweep(neck, [0.17, 0.12, 0.1], { color: BODY, sides: 8 });
=======
  const body = b.sweep(spine, [0.15, 0.25, 0.31, 0.33, 0.29, 0.21], { color: BODY, sides: 10 });
  const neckTube = b.sweep(neck, [0.19, 0.14, 0.12], { color: BODY, sides: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const el = V(s * 0.8, 1.27, -0.02);
    const wr = V(s * 1.38, 1.42, -0.1);
    const hd = V(s * 1.86, 1.55, -0.04);
=======
    const el = V(s * 0.8, 1.3, -0.02);
    const wr = V(s * 1.38, 1.55, -0.1);
    const hd = V(s * 1.86, 1.82, -0.04);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const skullC = H(0.07, 0.04, 0);
=======
  const skullC = H(0.08, 0.05, 0);
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.115, 0.105, 0.14],
=======
    scale: [0.15, 0.14, 0.17],
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: H(0.1, -0.055, 0),
    scale: [0.07, 0.035, 0.1],
=======
    at: H(0.12, -0.075, 0),
    scale: [0.09, 0.045, 0.13],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(bezier(H(0.15, 0.015, 0), H(0.3, 0.035, 0), H(0.38, 0, 0), H(0.43, -0.07, 0)), (t) => [0.054 * (1 - t) + 0.004, 0.047 * (1 - t) + 0.004], {
=======
  b.sweep(bezier(H(0.2, 0.025, 0), H(0.37, 0.05, 0), H(0.47, 0.0, 0), H(0.54, -0.1, 0)), (t) => [0.072 * (1 - t) + 0.004, 0.064 * (1 - t) + 0.004], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(bezier(H(0.15, -0.045, 0), H(0.25, -0.05, 0), H(0.33, -0.05, 0)), [0.04, 0.004], {
=======
  b.sweep(bezier(H(0.18, -0.07, 0), H(0.3, -0.075, 0), H(0.4, -0.07, 0)), [0.055, 0.004], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hit = skullSurface.around(skullC).at(s * 70, 6);
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.11, 0.082], mirror: s < 0 }), 0.8);
    b.rod(H(0.05, 0.105, s * 0.06), H(0.17, 0.085, s * 0.11), 0.014, { color: "#8c1030", bone: head });
=======
    const hit = skullSurface.around(skullC).at(s * 52, 6);
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.16, 0.12], mirror: s < 0 }), 0.8);
    b.rod(H(0.1, 0.17, s * 0.07), H(0.22, 0.14, s * 0.1), 0.017, { color: "#8c1030", bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
    ribbon(H(-0.02, 0.04, s * 0.1), H(-0.15, 0.1, s * 0.18), H(-0.4, 0.02, s * 0.3), H(-0.75, -0.1, s * 0.4), 0.04, head, 1);
=======
    ribbon(H(-0.02, 0.05, s * 0.13), H(-0.15, 0.12, s * 0.2), H(-0.4, 0.04, s * 0.32), H(-0.75, -0.1, s * 0.42), 0.05, head, 1);
>>>>>>> REPLACE

<<<<<<< SEARCH
      V(lat, 1.7, 0.5),
=======
      V(lat, 1.75, 0.5),
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(H(0.1, 0.1, lat), V(lat * 3, 1, 0.25), 0.1, 0.02, { color: GOLDM, bone: head });
=======
    b.spike(H(0.12, 0.16, lat), V(lat * 3, 1, 0.25), 0.12, 0.024, { color: GOLDM, bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.IcosahedronGeometry(0.03, 0), "#ff4a2a", { bone: head, at: H(0.16, 0.085, 0), flat: true }), 1.3);
=======
  glow(b.part(new THREE.IcosahedronGeometry(0.035, 0), "#ff4a2a", { bone: head, at: H(0.22, 0.12, 0), flat: true }), 1.3);
>>>>>>> REPLACE