1. **Sharpen the silhouette from every angle.** Taper the dark blade core and rear hook as well as the silver edge; their constant thickness currently leaves blunt, dark blocks at the tips.
2. **Seat the shield rivets.** Move the six proud fasteners back into the enamel so their attachment reads correctly.
3. **Make the frost feel crystalline.** Give the ice cleaner, brighter facet colors and restrained luminous veins, rather than mostly slate-blue surfaces.
4. **Add frost where it would accumulate.** A small amount of seated rime along upward-facing head surfaces reinforces “frost-forged” without cluttering the runes or silhouette.

<<<<<<< SEARCH
  const ice = paint((p, n) => {
    const t = noise(p, 0.12, 62);
    const light = Math.max(0, n.y * 0.32 + n.z * 0.18);
    return mix("#4388ae", "#d4f8fc", 0.22 + t * 0.30 + light);
  });
=======
  const ice = paint((p, n) => {
    const t = noise(p, 0.16, 62);
    const light = Math.max(0, n.y * 0.34 + n.z * 0.34 + n.x * 0.12);
    return mix("#4c92b6", "#effdff", 0.30 + t * 0.16 + light);
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (luminous) glow(result, 0.85);
    return result;
  }

  // A closed prism with a separate half-depth at every silhouette corner.
=======
    if (luminous) glow(result, 0.85);

    // A narrow vein follows the actual front facets, not a floating line
    // through the crystal's centre. Keep small ground shards simple.
    if (!luminous && length > 0.20) {
      const direction = new THREE.Vector3(...axis).normalize();
      const origin = new THREE.Vector3(...at);
      const veinPoints = [0.14, 0.33, 0.52, 0.73, 0.91].map((t, i) => {
        const p = origin.clone().addScaledVector(direction, length * t);
        p.x += (i % 2 === 0 ? -0.11 : 0.11) * radius;
        p.z += radius * 2;
        return p;
      });
      const seatedVein = b.surface(result).drape(veinPoints, { lift: 0.001 });
      glow(
        b.sweep(seatedVein, Math.min(0.0025, radius * 0.045), {
          color: "#c2faff",
          bone: root,
          sides: 5,
          smooth: false,
          caps: "flat",
          name: `${name}FrozenLightVein`,
        }),
        0.8,
      );
    }
    return result;
  }

  // A closed prism with a separate half-depth at every silhouette corner.
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Head: the dark core ends at the silver wedge, rather than continuing inside it.
  const mainBlade = plate(
    [
      [0.07, 1.82],
      [0.35, 2.02],
      [0.66, 2.22],
      [0.80, 2.48],
      [0.84, 2.31],
      [0.96, 2.17],
      [1.04, 1.94],
      [1.00, 1.75],
      [0.85, 1.52],
      [0.78, 1.15],
      [0.67, 1.38],
      [0.47, 1.56],
      [0.10, 1.62],
    ],
    [0, 0, 0],
    0.19,
    forged,
    "massiveForgedCrescent",
    0.006,
  );
=======
  // The structural core tapers with the cutting wedge at both horns.
  // There must not be a full-thickness dark cap behind a sharp silver tip.
  const mainBlade = taperedPlate(
    [
      [0.07, 1.82, 0.095],
      [0.35, 2.02, 0.095],
      [0.66, 2.22, 0.095],
      [0.80, 2.48, 0.006],
      [0.84, 2.31, 0.095],
      [0.96, 2.17, 0.095],
      [1.04, 1.94, 0.095],
      [1.00, 1.75, 0.095],
      [0.85, 1.52, 0.095],
      [0.78, 1.15, 0.006],
      [0.67, 1.38, 0.075],
      [0.47, 1.56, 0.095],
      [0.10, 1.62, 0.095],
    ],
    forged,
    "massiveForgedCrescent",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  plate(
    [
      [-0.10, 2.16],
      [-0.36, 2.16],
      [-0.48, 2.29],
      [-0.51, 2.12],
      [-0.88, 2.17],
      [-0.73, 2.11],
      [-0.57, 2.05],
      [-0.35, 1.91],
      [-0.32, 1.79],
      [-0.10, 1.79],
    ],
    [0, 0, 0],
    0.23,
    forged,
    "hookedRearPoll",
    0.006,
  );
=======
  taperedPlate(
    [
      [-0.10, 2.16, 0.115],
      [-0.36, 2.16, 0.115],
      [-0.48, 2.29, 0.008],
      [-0.51, 2.12, 0.095],
      [-0.88, 2.17, 0.006],
      [-0.73, 2.11, 0.110],
      [-0.57, 2.05, 0.115],
      [-0.35, 1.91, 0.115],
      [-0.32, 1.79, 0.006],
      [-0.10, 1.79, 0.115],
    ],
    forged,
    "hookedRearPoll",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
      bolt([x, y, side * 0.241], [0, 0, side], 0.016, cuttingSteel);
=======
      bolt([x, y, side * 0.224], [0, 0, side], 0.016, cuttingSteel);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Continuous core and armored upper sleeve.
=======
  // Rime collects on upward-facing shoulders, with every shard embedded
  // into a queried surface. The clean front armor and its runes stay clear.
  const rimeHits = b.surface(mainBlade).scatter(15, {
    rng: rng(921),
    minDist: 0.042,
    filter: (hit) =>
      hit.n.y > 0.38 &&
      hit.at.y > 1.88 &&
      hit.at.x > 0.23 &&
      hit.at.x < 0.70,
  });

  for (let i = 0; i < rimeHits.length; i++) {
    b.stick(
      new THREE.OctahedronGeometry(0.012 + (i % 3) * 0.003, 0),
      i % 4 === 0 ? C.silver : ice,
      rimeHits[i],
      {
        embed: 0.55,
        scale: [1.45, 0.58, 0.9],
        spin: i * 37,
        bone: root,
        name: "shoulderAccumulatedRime",
      },
    );
  }

  // Continuous core and armored upper sleeve.
>>>>>>> REPLACE