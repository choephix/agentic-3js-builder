Cause: `b.along` callbacks receive only the placement frame, while `glow()` cannot be applied to painted parts such as the `POD_EDGE` collar.

<<<<<<< SEARCH
      (at, i) => {
        const bead = b.stick(
          new THREE.IcosahedronGeometry(0.014 + 0.003 * (tubeIndex % 2), 0),
          tubeIndex % 2 === 0 ? CYAN : PINK,
=======
      (at) => {
        const bead = b.stick(
          new THREE.IcosahedronGeometry(0.014 + 0.003 * (tubeIndex % 2), 0),
          tubeIndex % 2 === 0 ? CYAN : PINK,
>>>>>>> REPLACE

<<<<<<< SEARCH
      (at, i) => {
        const spine = b.spike(
          at,
          at,
          0.027 + (i % 2) * 0.009,
          0.007,
          {
            color: i % 2 === 0 ? LIME : CYAN,
=======
      (at) => {
        const spine = b.spike(
          at,
          at,
          0.032,
          0.007,
          {
            color: LIME,
>>>>>>> REPLACE

<<<<<<< SEARCH
      (at, i) => {
        if (i === 0 || i === 6) return;
        const spore = b.stick(
          new THREE.SphereGeometry(0.014 + (i % 2) * 0.004, 7, 5),
          i % 3 === 0 ? LIME : i % 3 === 1 ? CYAN : PINK,
=======
      (at) => {
        const spore = b.stick(
          new THREE.SphereGeometry(0.016, 7, 5),
          tubeIndex % 3 === 0 ? LIME : tubeIndex % 3 === 1 ? CYAN : PINK,
>>>>>>> REPLACE

<<<<<<< SEARCH
        if (i % 2 === 0) {
          const filament = b.spike(at, at, 0.045, 0.0045, {
=======
        if (tubeIndex % 2 === 0) {
          const filament = b.spike(at, at, 0.045, 0.0045, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(collar, 1.15);
  }

  makeBloom(crown.at(1), new THREE.Vector3(0, 0.38, 0.9), 1.12, "crownBloom", 1201);
=======
  }

  makeBloom(crown.at(1), new THREE.Vector3(0, 0.38, 0.9), 1.12, "crownBloom", 1201);
>>>>>>> REPLACE