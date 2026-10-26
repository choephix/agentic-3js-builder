Cause: nullable chain tips were passed as parents/bones, `b.along` was given an unsupported callback signature, and the dream-cloud loop destructured point coordinates incorrectly.

```text
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
=======
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const trunkSkin = b.sweep(trunk, [0.092, 0.035], {
=======
  const trunkSkin = b.sweep(trunk, [0.092, 0.035], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: trunk.tip,
    at: trunk.tip.at,
=======
    bone: trunk.tip!,
    at: trunk.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
      at: trunk.tip.local([s * 0.045, 0.018, 0.035]),
=======
      bone: trunk.tip!,
      at: trunk.tip!.local([s * 0.045, 0.018, 0.035]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    const paw = chain.tip;
=======
    const paw = chain.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: paw,
      at: paw.at,
=======
      bone: paw,
      at: paw.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: paw,
      at: paw.local({ down: 0.015 }),
=======
      bone: paw,
      at: paw.local({ down: 0.015 }),
>>>>>>> REPLACE

<<<<<<< SEARCH
        paw.local([toe * 0.045, -0.035, 0.08]),
=======
        paw.local([toe * 0.045, -0.035, 0.08]),
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(body, 11, (at, i) => {
    const dorsal = body.at(Math.min(0.98, i / 10), 0);
    return b.spike(
      dorsal,
      [0, 1, 0],
      0.13 - i * 0.006,
      0.036,
      {
        color: i % 3 === 0 ? RUST : INK,
        name: `mane${i}`,
        group: "mane",
      },
    );
  });
=======
  b.along(body, 11, (at) =>
    b.spike(at, [0, 1, 0], 0.105, 0.036, {
      color: INK,
      name: "mane",
      group: "mane",
    }),
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [i, p] of [
    [0.1, 1.69, 0.7],
    [-0.03, 1.8, 0.76],
    [0.22, 1.83, 0.65],
    [0.37, 1.6, 0.75],
    [0.39, 1.73, 0.68],
  ] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(1, 8, 5), i % 2 ? SMOKE : CREAM, {
      at: p,
      scale: [0.055, 0.045, 0.055],
      group: "magic",
      name: `dreamCloud${i}`,
    });
  }
=======
  const dreamClouds: [number, number, number][] = [
    [0.1, 1.69, 0.7],
    [-0.03, 1.8, 0.76],
    [0.22, 1.83, 0.65],
    [0.37, 1.6, 0.75],
    [0.39, 1.73, 0.68],
  ];
  dreamClouds.forEach((p, i) => {
    b.part(new THREE.SphereGeometry(1, 8, 5), i % 2 ? SMOKE : CREAM, {
      at: p,
      scale: [0.055, 0.045, 0.055],
      group: "magic",
      name: `dreamCloud${i}`,
    });
  });
>>>>>>> REPLACE
```