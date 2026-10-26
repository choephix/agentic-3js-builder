Cause: line 844 tests `b.joint` (always a function) as a condition, and line 890 passes `color` to `b.part`, whose options don't include it (the colour is the second argument).

<<<<<<< SEARCH
  const head = b.joint ? undefined : undefined;
  void head;
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.099, 0.099, 0.05, 12, 1, true), "#ffffff", {
      at: bandAt,
      dir,
      bone: "head2",
      texture: key,
      color: GOLD,
    });
=======
    b.part(new THREE.CylinderGeometry(0.099, 0.099, 0.05, 12, 1, true), GOLD, {
      at: bandAt,
      dir,
      bone: "head2",
      texture: key,
    });
>>>>>>> REPLACE