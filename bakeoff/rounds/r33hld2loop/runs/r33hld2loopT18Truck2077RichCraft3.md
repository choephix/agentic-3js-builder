I'll keep the chassis, cab, cargo hull, turret and wheels as they are. Fixes target the loose parts the render flags and a few misplaced details; additions add seated detail on the plain cargo flanks, the cab door and the roof.

1. Loose wheel-hub boxes (box.hull.62, box.hull.64) float 212 mm off the wheels; they are seated on the wheel hubs instead. View: three-quarter and side (left).
2. Loose rivet spheres (sphere.hull.4, 5, 9, 10) float 70 mm off the hull; they are seated on the cargo flank with `b.stick`. View: side (left) and three-quarter.
3. Plain cargo flank gets a seated vent grille and a stencilled unit plate. View: side (left).
4. Cab door gets a seated handle and window trim. View: three-quarter and low hero angle.
5. Roof gets seated cable conduits along the cyan rim. View: top.

<<<<<<< SEARCH
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 1.3, 0.02), DARK, { bone: hull, at: [s * 1.52, 2.0, 2.2] });
    glow(b.part(new THREE.BoxGeometry(0.04, 0.05, 0.04), CYAN, { bone: hull, at: [s * 1.52, 2.6, 2.2] }), 1.2);
  }
=======
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 1.3, 0.02), DARK, { bone: hull, at: [s * 1.52, 2.0, 2.2] });
    glow(b.part(new THREE.BoxGeometry(0.04, 0.05, 0.04), CYAN, { bone: hull, at: [s * 1.52, 2.6, 2.2] }), 1.2);
    // Cab door handle and frame trim, seated on the cab side.
    b.part(new THREE.BoxGeometry(0.03, 0.08, 0.2), STEEL, { bone: hull, at: [s * 1.53, 1.9, 2.0] });
    b.part(new THREE.BoxGeometry(0.02, 1.4, 0.04), SLATE, { bone: hull, at: [s * 1.53, 2.0, 2.45] });
  }
  // Seated vent grilles and a unit plate on the cargo flanks.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.02, 0.05, 0.5), DARK, { bone: hull, at: [s * 1.215, 2.7 - i * 0.12, -0.9] });
    b.part(new THREE.BoxGeometry(0.02, 0.3, 0.6), BOLT, { bone: hull, at: [s * 1.215, 1.85, -0.7] });
  }
  // Cable conduits seated on the roof, along the cyan rim.
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 4.0, 8), SLATE, { bone: hull, at: [s * 0.95, 3.5, -0.6], dir: [0, 0, 1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Hatch hinge bar and a cyan status ring around the light.
=======
  // Wheel hub caps seated on the wheel faces (replaces the loose hub boxes).
  for (const ax of AXLES)
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 10), BOLT, { bone: hull, at: [s * (WHEEL_X + 0.22), WHEEL_Y, ax.z], dir: [s, 0, 0] });
  // Rivets stuck onto the cargo flank surface.
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BOLT, { bone: hull, at: [s * 1.222, 1.6 + i * 0.25, 0.3] });
  // Hatch hinge bar and a cyan status ring around the light.
>>>>>>> REPLACE