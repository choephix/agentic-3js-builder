`glow()` was called on meshes using procedural `Paint` (`TRUE_ICE_PAINT`), which `glow()` rejects because painted materials share a baked texture atlas and cannot be individually converted to emissive materials.

<<<<<<< SEARCH
    // Chunky Hexagonal Crystal Monolith
    glow(
      b.part(new THREE.CylinderGeometry(r * 0.35, r, h, 6), TRUE_ICE_PAINT, {
        bone: altarBone,
        at: [px, 0.14 + h * 0.45, pz],
        dir: lean,
        flat: true,
        name: `crystal_monolith_${idx}`,
      }),
      1.25,
    );
=======
    // Chunky Hexagonal Crystal Monolith
    b.part(new THREE.CylinderGeometry(r * 0.35, r, h, 6), TRUE_ICE_PAINT, {
      bone: altarBone,
      at: [px, 0.14 + h * 0.45, pz],
      dir: lean,
      flat: true,
      name: `crystal_monolith_${idx}`,
    });
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(
    b.extrude(TRUE_ICE_MAIN_OUTLINE, {
      bone: bladeMain,
      at: [0, 1.48, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.036,
      bevel: 0.007,
      smoothing: 1,
      color: TRUE_ICE_PAINT,
      name: "blade_main_true_ice",
    }),
    1.4,
  );
=======
  b.extrude(TRUE_ICE_MAIN_OUTLINE, {
    bone: bladeMain,
    at: [0, 1.48, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.036,
    bevel: 0.007,
    smoothing: 1,
    color: TRUE_ICE_PAINT,
    name: "blade_main_true_ice",
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(
    b.extrude(TRUE_ICE_HOOK_OUTLINE, {
      bone: bladeBack,
      at: [0, 1.48, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.006,
      smoothing: 1,
      color: TRUE_ICE_PAINT,
      name: "blade_back_true_ice",
    }),
    1.4,
  );
=======
  b.extrude(TRUE_ICE_HOOK_OUTLINE, {
    bone: bladeBack,
    at: [0, 1.48, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.032,
    bevel: 0.006,
    smoothing: 1,
    color: TRUE_ICE_PAINT,
    name: "blade_back_true_ice",
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(
    b.extrude(SPEAR_CROSS_OUTLINE, {
      bone: topSpike,
      at: [0, 1.68, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.003,
      color: TRUE_ICE_PAINT,
      name: "spear_blade_cross",
    }),
    1.4,
  );
=======
  b.extrude(SPEAR_CROSS_OUTLINE, {
    bone: topSpike,
    at: [0, 1.68, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.003,
    color: TRUE_ICE_PAINT,
    name: "spear_blade_cross",
  });
>>>>>>> REPLACE