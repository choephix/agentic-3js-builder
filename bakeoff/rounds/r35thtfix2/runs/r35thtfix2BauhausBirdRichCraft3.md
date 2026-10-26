The errors come from nullable surface hits, using `flat` on sweep-based helpers, passing a null neck tip as a joint parent, and using `b.stick` with a point instead of a frame.

<<<<<<< SEARCH
    parent: neck.tip!,
=======
    parent: neck.joints[1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const chestHit = bodySurface.nearest([0, 0.905, 0.344]);
=======
  const chestHit = bodySurface.nearest([0, 0.905, 0.344])!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name: "upperBeak",
=======
      name: "upperBeak",
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name: "lowerBeak",
=======
      name: "lowerBeak",
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.stick(
    new THREE.SphereGeometry(0.018, 6, 4),
    BLACK,
    [0, 1.285, 0.476],
    {
      bone: head,
      name: "beakTip",
      group: "face",
    },
  );
=======
  b.part(
    new THREE.SphereGeometry(0.018, 6, 4),
    BLACK,
    {
      bone: head,
      at: [0, 1.285, 0.476],
      name: "beakTip",
      group: "face",
    },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const markHit = wingSurface.nearest([side * 0.42, 1.18, 0.085]);
=======
    const markHit = wingSurface.nearest([side * 0.42, 1.18, 0.085])!;
>>>>>>> REPLACE