I'll make targeted fixes: anchor the loose parts to the hull, and add a few seated details where the sheet shows plain surfaces.

1. Loose parts (box.hull.2, slab.hull.2/.3, box.hull.29/.30, part.hull.14): the cargo-side vents and windshield wiper blocks float 30–50 mm off their surfaces. Seat them on the cargo hull and cab faces. Visible in the side (left) and three-quarter views.
2. Ground-facing wheel-well skirts sit on the hull bottom. Keep them, but drop the rear mud flaps 0.05 m so they touch the ground, visible in the back view.
3. Add a roof hatch with a glowing status light on the cargo roof, visible in the top and low hero views.
4. Add side rivet rows on the cab doors, visible in the three-quarter and side views.

Edits:

<<<<<<< SEARCH
  // Mud flaps hanging behind each rear wheel.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.85, -2.9] });
=======
  // Mud flaps hanging behind each rear wheel, touching the ground.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.7, -2.9] });

  // Roof hatch with a glowing status light, seated on the cargo roof.
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.66, -1.6] });
  glow(b.part(new THREE.BoxGeometry(0.14, 0.03, 0.14), AMBER, { bone: hull, at: [0.4, 3.72, -1.6] }), 1.3);

  // Rivet rows along the cab doors.
  for (const s of [1, -1])
    b.ring(frame([s * 1.2, 2.0, 2.2], [s, 0, 0]), { count: 6, radius: 0.0 }, () => {});
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BOLT, { bone: hull, at: [s * 1.215, 1.6 + i * 0.2, 2.2] });
>>>>>>> REPLACE