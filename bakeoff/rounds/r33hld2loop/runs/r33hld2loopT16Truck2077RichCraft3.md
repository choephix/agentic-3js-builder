Fixes and additions, with the view where each shows on the next sheet:

1. Loose hull boxes (`box.hull.57`, `box.hull.59`) hung 212 mm from the wheel hubs are the mud-flap-like parts; I re-seat the hub caps' hazard stickers. Check: side (left) and low hero angle.
2. The cargo hull's flat walls read as bare sheets, so I add riveted corner guards and a bolted lower kick plate on both flanks. Check: side (left) and three-quarter.
3. The four loose spheres (`sphere.hull.4/5/9/10`) float 70 mm off the bumper. I attach them to the bumper face as bolt heads. Check: front and low hero angle.
4. The roof antenna mast is a bare sweep; I add a second thinner whip and a glowing tip so the roof silhouette reads at the back and top views. Check: back and top.
5. The turret reads as a plain box; I add a cyan status band and a pair of side vents to the turret plate. Check: three-quarter and top.
6. Front grille gaps look flat; I add a magenta light bar behind the grille so the face reads from the front. Check: front.

Edits:

<<<<<<< SEARCH
  // Roof searchlight on the turret ring, seated on the turret plate.
=======
  // Corner guards and kick plates on the cargo flanks, seated on the side panels.
  for (const s of [1, -1]) {
    for (const z of [-3.0, 1.5]) b.part(new THREE.BoxGeometry(0.06, 2.2, 0.12), SLATE, { bone: hull, at: [s * 1.22, 2.3, z] });
    b.part(new THREE.BoxGeometry(0.04, 0.35, 4.0), BODY, { bone: hull, at: [s * 1.23, 0.75, -0.6] });
    for (let i = -4; i <= 4; i++) b.part(new THREE.SphereGeometry(0.03, 6, 4), BOLT, { bone: hull, at: [s * 1.25, 0.75, -0.6 + i * 0.4] });
  }
  // Bolt heads on the bumper face, seated on the bumper plate.
  for (const x of [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0])
    b.part(new THREE.SphereGeometry(0.04, 6, 4), BOLT, { bone: hull, at: [x, 1.15, 4.13] });
  // Whip antenna at the back and its glowing tip, seated on the roof.
  b.sweep(
    catmull([
      [0.9, 3.45, -2.4],
      [0.9, 4.0, -2.45],
      [0.92, 4.6, -2.5],
    ]),
    [0.015, 0.006],
    { color: GUN, bone: hull },
  );
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), MAGENTA, { bone: hull, at: [0.92, 4.62, -2.5] }), 1.5);
  // Turret status band and side vents, seated on the turret plate.
  glow(b.part(new THREE.BoxGeometry(0.72, 0.03, 0.82), CYAN, { bone: turret, at: [0, 3.58, -0.8] }), 1.3);
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.03, 0.14, 0.4), DARK, { bone: turret, at: [s * 0.36, 3.55, -0.8] });
  // Magenta light bar behind the grille, seated on the grille bar.
  glow(b.part(new THREE.BoxGeometry(1.9, 0.05, 0.03), MAGENTA, { bone: hull, at: [0, 1.6, 3.99] }), 1.3);
  // Roof searchlight on the turret ring, seated on the turret plate.
>>>>>>> REPLACE