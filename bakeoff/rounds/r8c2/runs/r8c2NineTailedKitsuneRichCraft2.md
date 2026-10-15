1. **Bigger head.** The head is small against the huge tail fan, and the anime eyes and face markings don't carry. I raise the head scale `H` from 1.28 to 1.5 and thicken the neck so the head sits on it properly.
2. **Brighter fur.** The shadow tone of the white fur renders muddy grey-beige. I lighten it to a pale lavender so the fox reads as white.
3. **Cheek ruff.** The cheek blades are thin grey shards. I widen and thicken them so they read as soft fur tufts.
4. **Tail flames.** The flames hover above the tail tips with a visible gap. I lower them onto the tips and make them larger.
5. **Foxfire orbs.** The orbs read as lollipops under their flames. I shrink the orbs and enlarge the flames.

<<<<<<< SEARCH
const H = 1.28; // head scale
=======
const H = 1.5; // head scale
>>>>>>> REPLACE

<<<<<<< SEARCH
  const WHITE = cel("#fffaf1", "#c9c3ef");
=======
  const WHITE = cel("#fffaf1", "#dcd6fa");
>>>>>>> REPLACE

<<<<<<< SEARCH
  const neckTube = b.sweep(neck, [0.088, 0.066], { color: WHITE });
=======
  const neckTube = b.sweep(neck, [0.1, 0.08], { color: WHITE });
>>>>>>> REPLACE

<<<<<<< SEARCH
      blade(0.17 * H, 0.06 * H, hp(0.0 - 0.01 * k, -0.01 - 0.035 * k, s * (0.1 + 0.005 * k)), [s * 0.8, -0.18 - 0.14 * k, -0.6], [0, 1, 0], k === 1 ? LAV : WHITE, head, 0.02);
=======
      blade(0.17 * H, 0.09 * H, hp(0.0 - 0.01 * k, -0.01 - 0.035 * k, s * (0.1 + 0.005 * k)), [s * 0.8, -0.18 - 0.14 * k, -0.6], [0, 1, 0], k === 1 ? "#efe9ff" : "#ffffff", head, 0.03);
>>>>>>> REPLACE

<<<<<<< SEARCH
    flame([tip.x, tip.y - 0.02, tip.z], [0.2, 0.4], [FLAME_A, FLAME_B], lastJoint, 1.6);
    flame([tip.x, tip.y - 0.02, tip.z], [0.12, 0.24], [FLAME_B, FLAME_A], lastJoint, 1.4);
=======
    flame([tip.x, tip.y - 0.1, tip.z], [0.27, 0.5], [FLAME_A, FLAME_B], lastJoint, 1.6);
    flame([tip.x, tip.y - 0.1, tip.z], [0.16, 0.3], [FLAME_B, FLAME_A], lastJoint, 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.IcosahedronGeometry(0.028, 1), "#d9fbff", { bone: root, at: p, flat: true }), 1.7);
    flame([p[0], p[1] + 0.01, p[2]], [0.19, 0.34], [FLAME_A, FLAME_B], root, 1.5);
=======
    glow(b.part(new THREE.IcosahedronGeometry(0.016, 1), "#d9fbff", { bone: root, at: p, flat: true }), 1.7);
    flame([p[0], p[1] - 0.01, p[2]], [0.24, 0.42], [FLAME_A, FLAME_B], root, 1.5);
>>>>>>> REPLACE