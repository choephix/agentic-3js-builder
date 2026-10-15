1. The floating shards read as ice-cream cones: the molten tip is a long octahedron hanging far below each rock. I shrink it into a short molten tip seated in the shard's underside, and pull the shards in closer so they orbit the golem.
2. The head is lost between the stacked pauldrons and their spikes. I lower the pauldrons, spikes and shoulder flames so the face and horns read first.
3. The stage pillars are as tall as the golem's thighs and block the side view. I shorten them so they frame the base instead.
4. The fists are plain dark blocks, and Genshin Pyro enemies burn at the hands. I add small flame cards on the knuckles.
5. The ember motes drift too far from the body. I tighten their radius.

<<<<<<< SEARCH
      [0.6, 0.14, 0.66, 2.3, 0.9, 14],
      [0.48, 0.13, 0.54, 2.42, 0.95, 20],
      [0.36, 0.12, 0.42, 2.53, 0.99, 26],
=======
      [0.6, 0.14, 0.66, 2.2, 0.9, 14],
      [0.48, 0.13, 0.54, 2.3, 0.95, 20],
      [0.36, 0.12, 0.42, 2.39, 0.99, 26],
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.spike([s * 0.99, 2.6, z], [s * 0.35, 1, 0], 0.22, 0.05, { bone: sh, color: OBS, sides: 6 }),
=======
      b.spike([s * 0.99, 2.46, z], [s * 0.35, 1, 0], 0.2, 0.05, { bone: sh, color: OBS, sides: 6 }),
>>>>>>> REPLACE
<<<<<<< SEARCH
    flames(sh, [[s * 0.98, 2.62, -0.05], [s * 0.98, 2.62, 0.13]], [0.12, 0.3], [0, 0, -1], 25, 20);
=======
    flames(sh, [[s * 0.98, 2.48, -0.05], [s * 0.98, 2.48, 0.13]], [0.12, 0.28], [0, 0, -1], 25, 20);
>>>>>>> REPLACE
<<<<<<< SEARCH
    [-1.2, -0.8, 0.75],
    [1.25, -0.75, 0.5],
    [0.5, -1.3, 0.9],
=======
    [-1.2, -0.8, 0.5],
    [1.25, -0.75, 0.38],
    [0.5, -1.3, 0.6],
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.spike(tp[2], [-s * 0.2, -1, 0.3], 0.1, 0.045, { bone: tc.joints[1], color: TEETH, sides: 5 });
=======
    b.spike(tp[2], [-s * 0.2, -1, 0.3], 0.1, 0.045, { bone: tc.joints[1], color: TEETH, sides: 5 });
    flames(wr, [[hx - 0.12, hy + 0.03, hz + 0.05], [hx, hy + 0.03, hz + 0.05], [hx + 0.12, hy + 0.03, hz + 0.05]], [0.1, 0.26], [0, 0, -1], 22, 20);
>>>>>>> REPLACE
<<<<<<< SEARCH
      [-1.35, 3.0, 0.5, 0.2],
      [1.45, 3.25, 0.1, 0.17],
      [-1.0, 3.55, -0.5, 0.14],
      [0.95, 3.7, 0.6, 0.12],
      [-0.5, 3.9, 0.5, 0.1],
=======
      [-1.2, 3.0, 0.5, 0.2],
      [1.25, 3.2, 0.1, 0.17],
      [-0.9, 3.5, -0.4, 0.14],
      [0.85, 3.6, 0.5, 0.12],
      [-0.45, 3.8, 0.4, 0.1],
>>>>>>> REPLACE
<<<<<<< SEARCH
    glow(b.part(new THREE.OctahedronGeometry(sz * 0.5, 0), "#ff6a1a", { bone: hips, at: [x, y - sz * 1.1, z], scale: [1, 1.6, 1], flat: true }), 1.4);
=======
    glow(b.part(new THREE.OctahedronGeometry(sz * 0.62, 0), "#ff6a1a", { bone: hips, at: [x, y - sz * 1.0, z], scale: [1, 0.85, 1], flat: true }), 1.4);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const rr = 1.05 + R() * 0.5;
=======
    const rr = 0.9 + R() * 0.4;
>>>>>>> REPLACE