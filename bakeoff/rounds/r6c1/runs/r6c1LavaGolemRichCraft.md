1. The torso and limb cores render as a washed-out salmon, not molten lava. I deepened the lava colour to a saturated orange-red so the seams burn against the dark basalt, which suits Genshin's Pyro look.
2. The face is a dark box whose eyes barely read. I enlarged the eye glows and added glowing crack seams on the cheeks, so the face reads as molten behind the stone.
3. The setting felt static and the sky around the head was empty. I added floating basalt shards with molten undersides around the golem. They are deliberate and read as magical debris, in the style of Genshin boss arenas, and they give the silhouette more drama.

<<<<<<< SEARCH
  const LAVA = "#ff5a14";
=======
  const LAVA = "#e8400a";
>>>>>>> REPLACE

<<<<<<< SEARCH
    lit(s > 0 ? EYE_A : EYE_B, 0.2, 0.1, head, [s * 0.17, 2.77, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 1.5);
=======
    lit(s > 0 ? EYE_A : EYE_B, 0.25, 0.125, head, [s * 0.14, 2.765, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 1.8);
    lit(CRACK, 0.11, 0.11, head, [s * 0.2, 2.62, 0.586], [0, 0, 1], [s * 0.4, 1, 0], 1.2);
    lit(CRACK, 0.14, 0.14, head, [s * 0.402, 2.74, 0.34], [s, 0, 0], [0, 1, 0], 1.1);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // open the mouth a little for the rest pose
=======
  // floating basalt shards with molten undersides
  (
    [
      [-1.35, 3.0, 0.5, 0.2],
      [1.45, 3.25, 0.1, 0.17],
      [-1.0, 3.55, -0.5, 0.14],
      [0.95, 3.7, 0.6, 0.12],
      [-0.5, 3.9, 0.5, 0.1],
    ] as number[][]
  ).forEach(([x, y, z, sz], i) => {
    b.part(new THREE.DodecahedronGeometry(sz, 0), i % 2 ? BASALT2 : BASALT, {
      bone: hips,
      at: [x, y, z],
      rotation: [R() * 60, R() * 360, R() * 60],
      scale: [1, 1.3, 1],
      flat: true,
    });
    glow(b.part(new THREE.ConeGeometry(sz * 0.55, sz * 1.1, 6), HOT, { bone: hips, at: [x, y - sz * 1.35, z], dir: [0, -1, 0], flat: true }), 1.3);
    b.part(new THREE.TorusGeometry(sz * 0.95, sz * 0.08, 4, 8), GOLD, { bone: hips, at: [x, y, z], rotation: [90, 0, 0] });
  });

  // open the mouth a little for the rest pose
>>>>>>> REPLACE