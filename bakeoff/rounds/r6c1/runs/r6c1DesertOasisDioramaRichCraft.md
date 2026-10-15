1. **Sunk dunes (the validator warning).** The biggest dune dipped 135 mm below y = 0. Its ellipsoid centre sat 0.35h under the sand while its radius was h. I lift the centre (0.3h) and shrink the tall dune so every dune bottoms out at or above the floor.
2. **Camel neck "saw-blade".** The spikes along the top of each neck read as a comb. I thin them to two small tufts and keep the beard tufts underneath.
3. **Camel eyes.** The 1 cm eyes were lost in the head. I enlarge them and move the white highlight onto the new surface so the face reads from a distance.
4. **Setting and charm.** I add a small teal hoopoe-style bird perched on the signpost finial, and glowing fireflies drifting over the oasis, so the scene feels alive at dusk.

<<<<<<< SEARCH
    ell(SAND, V(x, TOP - h * 0.35, z), rx, h, rz, { dir: [Math.sin(yaw), 0, Math.cos(yaw)], seg: [10, 6] });
  dune(0.05, -0.72, 0.38, 0.26, 0.3, 0.25);
=======
    ell(SAND, V(x, TOP - h * 0.3, z), rx, h, rz, { dir: [Math.sin(yaw), 0, Math.cos(yaw)], seg: [10, 6] });
  dune(0.05, -0.72, 0.38, 0.26, 0.2, 0.25);
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 1; i <= 4; i++) {
      const hi = neckTube.at(0.2 + i * 0.16, 0);
      b.spike(hi, hi, s(0.022), s(0.01), { color: o_mane(coat), bone: neck.joints[Math.min(3, Math.floor((0.2 + i * 0.16) * 4))] });
    }
=======
    for (let i = 1; i <= 2; i++) {
      const hi = neckTube.at(0.2 + i * 0.16, 0);
      b.spike(hi, hi, s(0.015), s(0.01), { color: o_mane(coat), bone: neck.joints[Math.min(3, Math.floor((0.2 + i * 0.16) * 4))] });
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
      const eye = ell(INK, hl(sd * 0.028, 0.016, 0.035), s(0.0095), s(0.0095), s(0.0095), {
=======
      const eye = ell(INK, hl(sd * 0.028, 0.016, 0.035), s(0.012), s(0.012), s(0.012), {
>>>>>>> REPLACE

<<<<<<< SEARCH
      E("#ffffff", hl(sd * 0.0345, 0.0215, 0.042), 0.0035, 0.0035, 0.0035, head);
=======
      E("#ffffff", hl(sd * 0.0374, 0.0184, 0.042), 0.004, 0.004, 0.004, head);
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(sx - 0.04, sz + 0.04, 0.06);
=======
    tuft(sx - 0.04, sz + 0.04, 0.06);
    // a little bird perched on the sign finial
    const BIRD = "#2a9d8f";
    ell(BIRD, P(0, 0.337, 0), 0.016, 0.016, 0.026, { dir: D(0, 0, 1) });
    ell(CREAM, P(0, 0.328, 0.006), 0.012, 0.01, 0.018, { dir: D(0, 0, 1) });
    ell(BIRD, P(0, 0.355, 0.02), 0.012, 0.012, 0.012);
    b.spike(P(0, 0.354, 0.03), D(0, -0.1, 1), 0.024, 0.005, { color: SAFFRON, bone: root });
    b.spike(P(0, 0.335, -0.02), D(0, 0.1, -1), 0.04, 0.008, { color: "#1f6f66", bone: root });
    b.spike(P(0, 0.364, 0.016), D(0, 1, -0.4), 0.02, 0.005, { color: MAGENTA, bone: root });
    for (const sd of [1, -1]) ell(INK, P(sd * 0.008, 0.358, 0.026), 0.003, 0.003, 0.003);
    // fireflies drifting over the oasis
    for (let i = 0; i < 9; i++)
      glow(
        ell("#fff6a0", V(-0.1 + (R() - 0.5) * 0.9, TOP + 0.22 + R() * 0.3, 0.14 + (R() - 0.5) * 0.6), 0.007, 0.007, 0.007),
        2,
      );
>>>>>>> REPLACE