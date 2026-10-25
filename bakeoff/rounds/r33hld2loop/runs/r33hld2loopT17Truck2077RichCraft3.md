Fixes, with the view where each shows on the next sheet:

1. Wheel hubs and loose bolt spheres: the four bolt spheres on the bumper and the hub caps float off their surfaces. Remove the floating bolt spheres (hull.4, 5, 9, 10) and the loose wheel-side boxes. Shows in the **front** and **three-quarter** views.
2. Roof hatch and turret indicator: the turret ring torus sits on the turret plate's face at the wrong height. Lower it onto the plate. Shows in the **top** view.
3. Cargo side flank: the magenta and cyan trims were lifted above the panel, so their bases hover. Seat them on the panel face. Shows in the **side (left)** view.
4. Windshield: the centre divider and HUD plane overlap the glass. Pull the HUD slightly forward. Shows in the **front** view.
5. Rear light bar: the cyan bar on the tail door sits inside the rear light cluster. Move it up so the clusters stay readable. Shows in the **back** view.

Edits:

<<<<<<< SEARCH
  // Bolt heads on the bumper face, seated on the bumper plate.
  for (const x of [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0])
    b.part(new THREE.SphereGeometry(0.04, 6, 4), BOLT, { bone: hull, at: [x, 1.15, 4.13] });
=======
  // Bolt heads on the bumper face, seated on the bumper plate.
  for (const x of [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0])
    b.part(new THREE.SphereGeometry(0.04, 6, 4), BOLT, { bone: hull, at: [x, 1.15, 4.1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Turret status band and side vents, seated on the turret plate.
=======
  // Turret status band and side vents, seated on the turret plate.
  // (Sensor ring above lowered onto the plate surface.)
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.TorusGeometry(0.14, 0.02, 6, 14), CYAN, { bone: turret, at: [-0.35, 3.74, -0.8], dir: [0, 1, 0] }), 1.4);
=======
  glow(b.part(new THREE.TorusGeometry(0.14, 0.02, 6, 14), CYAN, { bone: turret, at: [-0.35, 3.71, -0.8], dir: [0, 1, 0] }), 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.BoxGeometry(1.7, 0.05, 0.04), CYAN, { bone: hull, at: [0, 3.0, -2.99] }), 1.4);
=======
  glow(b.part(new THREE.BoxGeometry(1.7, 0.05, 0.04), CYAN, { bone: hull, at: [0, 3.2, -2.99] }), 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 4.3), CYAN, { bone: hull, at: [s * 1.13, 3.53, -0.6] }), 1.4);
=======
  glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 4.3), CYAN, { bone: hull, at: [s * 1.2, 3.53, -0.6] }), 1.4);
>>>>>>> REPLACE