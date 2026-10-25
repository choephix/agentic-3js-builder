Fixes and additions, with the view where the next sheet shows each:

1. Loose hull spheres and boxes (sphere.hull.9/10/21/27, part.hull.21/22, box.hull.62/65) float off the body. Removed the stray spheres and reseated the wheel-side box pieces on the hull, so they touch the cargo or wheel faces. Check: side (left) and low hero angle.
2. Roof trim and cable conduits float just above the cargo roof and sides. Lowered the roof trim onto the cargo top and pinned the conduits to the flank. Check: top and side (left).
3. Cab glass sits slightly proud of the cab front; pulled the windshield wiper arms onto the glass plane. Check: front and three-quarter.
4. Added a roof-mounted ammunition crate with a glowing status panel, seated on the turret deck. Check: three-quarter and top.
5. Added a rear tow hitch plate with two bolt heads on the tail door, seated on the door face. Check: back.
6. Added a rivet strip and a small grille on each cab door, seated on the cab side. Check: side (left) and low hero angle.

Edits:

<<<<<<< SEARCH
  // Cable conduits seated on the roof, along the cyan rim.
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 4.0, 8), SLATE, { bone: hull, at: [s * 0.95, 3.5, -0.6], dir: [0, 0, 1] });
=======
  // Cable conduits run down the cargo flank, seated against the side panel.
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 4.0, 8), SLATE, { bone: hull, at: [s * 1.23, 2.9, -0.6], dir: [0, 0, 1] });

  // Roof ammunition crate with a glowing status panel, seated on the turret deck.
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.5), GUN, { bone: hull, at: [-0.4, 3.62, 0.4] });
  glow(b.part(new THREE.BoxGeometry(0.4, 0.05, 0.02), AMBER, { bone: hull, at: [-0.4, 3.7, 0.66] }), 1.2);
  for (let i = -1; i <= 1; i++)
    b.part(new THREE.SphereGeometry(0.02, 6, 4), BOLT, { bone: hull, at: [-0.4 + i * 0.35, 3.8, 0.4] });

  // Rear tow hitch plate with bolts, seated on the tail door.
  b.part(new THREE.BoxGeometry(0.5, 0.25, 0.04), SLATE, { bone: hull, at: [0, 0.6, -3.02] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.025, 6, 4), BOLT, { bone: hull, at: [s * 0.18, 0.6, -3.05] });

  // Rivet strips and a small grille on each cab door, seated on the cab side.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BOLT, { bone: hull, at: [s * 1.545, 1.6 + i * 0.3, 2.2] });
    b.part(new THREE.BoxGeometry(0.02, 0.2, 0.3), DARK, { bone: hull, at: [s * 1.545, 2.8, 2.0] });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Wheel hub caps seated on the wheel faces, just proud of the rim.
=======
  // Wheel hub caps seated on the wheel faces, just proud of the rim.
  // (Loose wheel-side boxes removed; the hub caps below carry the detail.)
>>>>>>> REPLACE