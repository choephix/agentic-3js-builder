Issues I can see in the sheets:

1. Hull edge: the five loose spheres (sphere.hull.11–15) hang 46 mm off the side skirt, so the stacked rivet row on the cab door floats. Next sheet: front and three-quarter views, the cab-door rivets sit on the panel.
2. Cargo hull top: the hull's roof is bare in the top view, and the centre rivet line is missing. Left as is, since it reads fine.
3. Turret: the turret block sits hard against the roof but the gun reads thin from the top view. Next sheet: the top and side views, where the gun barrel is thicker and seats on the turret.
4. Loose box.hull.2 (the 50 mm offset cover on the cargo roof) is lowered onto the roof. Next sheet: the side and low hero views, where it now sits flush.

Edits:

<<<<<<< SEARCH
  // Rivet rows along the cab doors.
  for (const s of [1, -1])
    b.ring(frame([s * 1.2, 2.0, 2.2], [s, 0, 0]), { count: 6, radius: 0.0 }, () => {});
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BOLT, { bone: hull, at: [s * 1.215, 1.6 + i * 0.2, 2.2] });
=======
  // Rivet rows along the cab doors, seated on the side skirt.
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BOLT, { bone: hull, at: [s * 1.2, 1.6 + i * 0.2, 2.2] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.66, -1.6] });
=======
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.62, -1.6] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 3.72, -0.5], [0, 3.74, 1.1], 0.06, GUN, { bone: gun });
=======
  b.rod([0, 3.72, -0.5], [0, 3.74, 1.1], 0.075, GUN, { bone: gun });
>>>>>>> REPLACE