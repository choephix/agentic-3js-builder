A glowing orbiting ring on the staff used the `P_GOLD` paint instead of a flat colour string.

## Edits

<<<<<<< SEARCH
  glow(
    b.part(new THREE.TorusGeometry(0.085, 0.006, 8, 24), P_GOLD, {
      bone: handR,
      at: headCoreP,
      rotation: [45, 45, 0],
      group: "staff",
    }),
    1.2,
  );
=======
  glow(
    b.part(new THREE.TorusGeometry(0.085, 0.006, 8, 24), C_GOLD_BRIGHT, {
      bone: handR,
      at: headCoreP,
      rotation: [45, 45, 0],
      group: "staff",
    }),
    1.2,
  );
>>>>>>> REPLACE