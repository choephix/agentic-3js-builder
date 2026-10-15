1. **Give the wheels real depth.** Replace the painted spokes with recessed metal spokes and chunky beadlock rims; reduce the sidewall lettering so the tyres feel heavier.
2. **Fix the exposed mechanical details.** Join the differential housing into one chamfered assembly and replace the disconnected spring washers with continuous square-section coils.
3. **Strengthen the truck’s identity.** Add a windshield racing banner, a larger skull grille badge, and small amber cab markers without cluttering the silhouette.

<<<<<<< SEARCH
      if (r > 18) return C.silver;
      if (r > 16) return "#40535f";
      if (r < 7) return C.cyan;
      const a = Math.atan2(dy, dx);
      const sector = ((a / (Math.PI * 2) * 8 + 8) % 1);
      return sector < 0.43 ? "#9bafb8" : "#24323c";
    });
    text(g, "BYTE", 21, 8, "#c5d7d5");
    text(g, "CRUSHER", 12, 49, "#82978f");
=======
      if (r > 18) return "#1b252d";
      return "#101a22";
    });
    text(g, "BYTE", 21, 8, "#9aada9");
    text(g, "8 BIT", 18, 50, "#71877f");
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12;
      const x = Math.round(31.5 + Math.cos(a) * 26);
      const y = Math.round(31.5 + Math.sin(a) * 26);
      if (y > 18 && y < 46) {
        g.set(x, y, "#54615e");
        g.set(x + 1, y, "#54615e");
      }
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.OctahedronGeometry(0.31, 0), C.steel, {
      name: `differential${z}`, at: [0, 1.30, z], bone: chassis,
      scale: [1.2, 0.87, 1],
    });
    box(`diffCover${z}`, [0, 1.30, z + 0.21], [0.31, 0.29, 0.10], C.orange);
=======
    b.extrude([
      [-0.20, -0.23],
      [0.20, -0.23],
      [0.33, -0.10],
      [0.33, 0.10],
      [0.20, 0.23],
      [-0.20, 0.23],
      [-0.33, 0.10],
      [-0.33, -0.10],
    ], {
      name: `differential${z}`,
      at: [0, 1.30, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.46,
      color: C.steel,
      bone: chassis,
    });
    b.extrude([
      [-0.13, -0.17],
      [0.13, -0.17],
      [0.23, -0.07],
      [0.23, 0.07],
      [0.13, 0.17],
      [-0.13, 0.17],
      [-0.23, 0.07],
      [-0.23, -0.07],
    ], {
      name: `diffCover${z}`,
      at: [0, 1.30, z + 0.245],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      color: C.orange,
      bone: chassis,
    });
    for (const x of [-0.13, 0.13]) {
      for (const y of [1.19, 1.41]) {
        box(`diffBolt${z}_${x}_${y}`, [x, y, z + 0.269],
          [0.042, 0.042, 0.018], C.ink);
      }
    }
    box(`diffCenter${z}`, [0, 1.30, z + 0.269],
      [0.11, 0.07, 0.018], C.orangeDark);
>>>>>>> REPLACE

<<<<<<< SEARCH
      for (let j = 0; j < 6; j++) {
        b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.045, 8), C.orange, {
          name: `spring${z}_${side}_${j}`,
          at: lerp(lower, upper, 0.21 + j * 0.105),
          dir: direction, bone: chassis,
        });
      }
=======
      const springFrame = frame(lower, direction);
      const springLength = direction.length();
      const springPoints: THREE.Vector3[] = [];
      const corners = [
        [-0.105, -0.105],
        [0.105, -0.105],
        [0.105, 0.105],
        [-0.105, 0.105],
      ];
      for (let j = 0; j <= 24; j++) {
        const corner = corners[j % 4];
        springPoints.push(springFrame.local([
          corner[0],
          springLength * (0.19 + 0.64 * j / 24),
          corner[1],
        ]));
      }
      b.sweep(springPoints, 0.027, {
        name: `spring${z}_${side}`,
        color: C.orange,
        bone: chassis,
        section: "box",
        caps: "flat",
      });
      for (const t of [0.17, 0.85]) {
        b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.065, 8), C.orangeDark, {
          name: `springSeat${z}_${side}_${t}`,
          at: lerp(lower, upper, t),
          dir: direction,
          bone: chassis,
        });
      }
>>>>>>> REPLACE

<<<<<<< SEARCH
    const outerX = x + side * 0.513;
    b.part(new THREE.CylinderGeometry(0.23, 0.27, 0.12, 8), C.cyanDark, {
=======
    const outerX = x + side * 0.513;

    // A dark recessed well, separate spokes, and a thick sixteen-sided rim.
    b.part(new THREE.CylinderGeometry(0.59, 0.59, 0.025, 16), C.ink, {
      name: `rimWell${name}`,
      at: [outerX, 1.30, z],
      bone,
      dir: [side, 0, 0],
    });
    b.lathe([
      [0.455, 0],
      [0.595, 0],
      [0.615, 0.025],
      [0.615, 0.060],
      [0.565, 0.080],
      [0.455, 0.060],
    ], {
      name: `beadlockRim${name}`,
      at: [outerX, 1.30, z],
      axis: [side, 0, 0],
      segments: 16,
      color: C.steel,
      bone,
    });
    b.lathe([
      [0.575, 0],
      [0.610, 0],
      [0.610, 0.018],
      [0.575, 0.018],
    ], {
      name: `beadlockEdge${name}`,
      at: [outerX + side * 0.065, 1.30, z],
      axis: [side, 0, 0],
      segments: 16,
      color: C.cyanHi,
      bone,
    });
    for (let spoke = 0; spoke < 8; spoke++) {
      const angle = spoke * Math.PI / 4;
      box(`rimSpoke${name}_${spoke}`, [
        outerX + side * 0.032,
        1.30 + Math.cos(angle) * 0.344,
        z + Math.sin(angle) * 0.344,
      ], [0.065, 0.32, 0.105], C.silver, bone, [spoke * 45, 0, 0]);
      box(`rimSpokeInset${name}_${spoke}`, [
        outerX + side * 0.070,
        1.30 + Math.cos(angle) * 0.352,
        z + Math.sin(angle) * 0.352,
      ], [0.014, 0.18, 0.038], C.steel, bone, [spoke * 45, 0, 0]);
    }
    b.part(new THREE.CylinderGeometry(0.23, 0.27, 0.12, 8), C.cyanDark, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.ring(frame([outerX, 1.30, z], [side, 0, 0]), {
      count: 8, radius: 0.40,
    }, (bolt) => {
      b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.034, 6), C.yellow, {
=======
    b.ring(frame([outerX + side * 0.080, 1.30, z], [side, 0, 0]), {
      count: 16, radius: 0.545,
    }, (bolt) => {
      b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.027, 4), C.yellow, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(`valve${name}`, [outerX, 1.84, z + 0.17],
      [0.05, 0.085, 0.05], C.silver, bone);
=======
    b.ring(frame([outerX + side * 0.078, 1.30, z], [side, 0, 0]), {
      count: 8, radius: 0.181,
    }, (bolt) => {
      b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.025, 4), C.silver, {
        name: `hubBolt${name}`, at: bolt, dir: [side, 0, 0], bone,
      });
    });
    box(`valve${name}`, [outerX + side * 0.095, 1.79, z + 0.12],
      [0.043, 0.075, 0.043], C.ink, bone);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box("windshieldCenter", [0, 3.35, 1.153], [0.045, 0.65, 0.025], C.cyanDark);
  for (const side of [1, -1]) {
=======
  box("windshieldCenter", [0, 3.35, 1.153], [0.045, 0.65, 0.025], C.cyanDark);
  panel("windshieldRaceBanner", [0, 3.605, 1.174], 1.92, 0.13, TITLE);
  for (const side of [1, -1]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  panel("radiatorGrille", [0, 2.58, 2.494], 1.25, 0.31, GRILLE);
  for (const side of [1, -1]) {
=======
  panel("radiatorGrille", [0, 2.58, 2.494], 1.25, 0.31, GRILLE);
  box("grilleBadgeBacking", [0, 2.59, 2.512],
    [0.34, 0.34, 0.025], C.ink);
  panel("grilleSkullBadge", [0, 2.59, 2.528], 0.32, 0.32, SKULL);
  for (const side of [1, -1]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Five voxel roof lights on a low, black light bar.
  for (const side of [1, -1]) {
=======
  // Small amber clearance lights give the tall cab a recognisable truck face.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.40;
    box(`cabMarkerBezel${i}`, [x, 3.765, 1.166],
      [0.135, 0.055, 0.035], C.ink);
    glow(box(`cabMarkerLens${i}`, [x, 3.768, 1.188],
      [0.09, 0.028, 0.018], "#ffae38"), 0.7);
  }

  // Five voxel roof lights on a low, black light bar.
  for (const side of [1, -1]) {
>>>>>>> REPLACE