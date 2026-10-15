1. **The head and eyes were lost.** The black brow flaps hid the eyes, the nose ball was oversized, and the muzzle box covered the eye sockets. I removed the flaps and replaced them with small fur brow wedges. I moved the eyes slightly forward and made them larger, so the amber glow shows from the front. I also shrank the nose.
2. **The mane and back ridge read as black thorns.** The blade roots and tips were too dark. I lightened them to a silver-to-bone gradient and widened the back-ridge blades, so they stop reading as thin spikes from the side.
3. **The Warcraft/Frostwolf identity needed more.** I added a leather collar around the neck with gold studs and a glowing blue clan stone on top. It matches the banner's colours and gives the neck a focal accent.

<<<<<<< SEARCH
const eyeP = [1, -1].map((s) => hp(s * 0.084, 0.044, 0.13));
=======
const eyeP = [1, -1].map((s) => hp(s * 0.088, 0.05, 0.125));
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: hp(0, -0.012, 0.405),
    scale: [0.05, 0.034, 0.036],
=======
    at: hp(0, -0.012, 0.405),
    scale: [0.04, 0.027, 0.03],
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: hp(s * 0.084, 0.044, 0.13),
      dir: [s * 0.62, 0.28, 0.73],
      size: [0.1, 0.066],
=======
      at: hp(s * 0.088, 0.05, 0.125),
      dir: [s * 0.62, 0.28, 0.73],
      size: [0.135, 0.088],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.075, 0.016, 0.05), "#3b3d45", {
      bone: head,
      at: hp(s * 0.088, 0.09, 0.115),
      rotation: [0, s * 40, s * 20],
    });
=======
    blob(hp(s * 0.082, 0.092, 0.1), [0.048, 0.02, 0.045], HEAD_FUR, head);
>>>>>>> REPLACE

<<<<<<< SEARCH
      root: "#565a63",
      tip: k ? "#c9ccce" : "#e6e8e8",
=======
      root: "#6d727b",
      tip: k ? "#dfe2e3" : "#f2f4f4",
>>>>>>> REPLACE

<<<<<<< SEARCH
      blade({ at: f, along: dir, side: [1, 0, 0], len: len * 0.8 * (0.85 + 0.3 * ((i * 7) % 3) / 2), w: w * 1.6, root: "#2f3139", tip: "#a9adb4" });
=======
      blade({ at: f, along: dir, side: [1, 0, 0], len: len * 0.8 * (0.85 + 0.3 * ((i * 7) % 3) / 2), w: w * 2.4, root: "#4a4e57", tip: "#c4c8cc" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  ridge(bodySweep, [0.15, 0.35, 0.55, 0.75, 0.92], 0.15, 0.09);
=======
  ridge(bodySweep, [0.15, 0.35, 0.55, 0.75, 0.92], 0.15, 0.09);

  // Frostwolf collar: leather band, gold studs and a glowing clan stone
  const collar = b.ring(neck.at(0.62), { count: 12, radius: 0.178 }, (it) => {
    b.part(new THREE.SphereGeometry(0.019, 6, 4), GOLD, { at: it, flat: true });
  });
  b.sweep(catmull(collar.items, { closed: true }), 0.016, { color: "#4a2f1a" });
  glow(
    b.part(new THREE.OctahedronGeometry(0.04, 0), "#5fd6ff", {
      at: collar.items[0],
      scale: [0.8, 1.3, 0.8],
      flat: true,
    }),
    1.5,
  );
>>>>>>> REPLACE