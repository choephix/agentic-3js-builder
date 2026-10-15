1. **Face and eyes.** In the close-up the eyes are tiny and half buried under the brow and cheek, and the tusks rise right beside them. I'm moving the amber eyes forward and up, enlarging them and their dark sockets, and lowering and thinning the brow. I'm also shortening and thinning the tusks so they curve up beside the muzzle instead of crowding the eyes. The next render should show clear glowing eyes under a heavy brow, with the tusks as bold ivory accents.
2. **Head set into the shoulders.** The head sits low in the hump and reads small. I'm lifting and pushing the neck and head up and forward by about 7 cm, and moving the mohawk's rear anchor to match. The next render should show the head and chin clear of the chest, with a stronger silhouette.
3. **Braids.** The braids use the mohawk's gradient paint, which on a tube turns solid orange, so they look like orange poles across the chest. I'm giving them a dark purple-black colour. They should now read as beaded braids against the teal skin, and the face is less cluttered.

<<<<<<< SEARCH
const neck = b.chain("neck", catmull([v(0, 1.96, 0.32), v(0, 2.04, 0.5), v(0, 2.1, 0.66)]), {
=======
const neck = b.chain("neck", catmull([v(0, 1.96, 0.32), v(0, 2.1, 0.52), v(0, 2.17, 0.72)]), {
>>>>>>> REPLACE
<<<<<<< SEARCH
const head = b.joint("head", { parent: neck, at: v(0, 2.1, 0.66), dir: [0, -0.05, 1], role: "head" });
=======
const head = b.joint("head", { parent: neck, at: v(0, 2.17, 0.72), dir: [0, -0.05, 1], role: "head" });
>>>>>>> REPLACE
<<<<<<< SEARCH
    // brow
    put(geoB(0.14, 0.05, 0.1), skin, head, L(head, 0.19, 0.115, s * 0.075), { rotation: [0, 0, 15 * s] });
    // eye in a dark socket
    put(geoS(0.04, 6, 5), "#16302f", head, L(head, 0.2, 0.07, s * 0.07));
    glow(put(geoS(0.028, 7, 5), AMBER, head, L(head, 0.222, 0.07, s * 0.07)), 1.4);
    put(geoB(0.008, 0.04, 0.006), "#2a1400", head, L(head, 0.248, 0.07, s * 0.07));
=======
    // brow
    put(geoB(0.14, 0.035, 0.1), skin, head, L(head, 0.2, 0.128, s * 0.075), { rotation: [0, 0, 15 * s] });
    // eye in a dark socket
    put(geoS(0.05, 6, 5), "#16302f", head, L(head, 0.225, 0.065, s * 0.07));
    glow(put(geoS(0.037, 7, 5), AMBER, head, L(head, 0.246, 0.065, s * 0.07)), 1.5);
    put(geoB(0.008, 0.05, 0.006), "#2a1400", head, L(head, 0.279, 0.065, s * 0.07));
>>>>>>> REPLACE
<<<<<<< SEARCH
      bezier(L(jaw, 0.22, 0.0, s * 0.1), L(jaw, 0.31, 0.12, s * 0.17), L(jaw, 0.32, 0.22, s * 0.15)),
      [0.045, 0],
=======
      bezier(L(jaw, 0.22, 0.0, s * 0.1), L(jaw, 0.31, 0.08, s * 0.16), L(jaw, 0.33, 0.16, s * 0.14)),
      [0.036, 0],
>>>>>>> REPLACE
<<<<<<< SEARCH
      const path = bezier(L(jaw, 0.22, 0.0, s * 0.1), L(jaw, 0.31, 0.12, s * 0.17), L(jaw, 0.32, 0.22, s * 0.15));
=======
      const path = bezier(L(jaw, 0.22, 0.0, s * 0.1), L(jaw, 0.31, 0.08, s * 0.16), L(jaw, 0.33, 0.16, s * 0.14));
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.sweep(bp, [0.03, 0.026, 0.02], { bone: head, color: HAIR, sides: 6 });
=======
    b.sweep(bp, [0.03, 0.026, 0.02], { bone: head, color: "#3b1c3f", sides: 6 });
>>>>>>> REPLACE
<<<<<<< SEARCH
    v(0, 2.12, 0.38),
=======
    v(0, 2.2, 0.4),
>>>>>>> REPLACE