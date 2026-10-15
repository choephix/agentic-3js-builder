1. **Make the hero graphics clearer:** enlarge the hood skull, replace the tyre-sidewall barcode marks with bitmap lettering, and give the grille a proper “B” badge.
2. **Fix the bumper hazard stripes:** use front-facing pixel panels instead of thin textured boxes, which currently crop the pattern into broken horizontal marks.
3. **Give the arena a story:** add a flattened, muted-plum scrap car beneath the chassis. Its crushed roof and scattered square glass fragments explain what this truck does without competing with its silhouette.
4. **Finish the tyres:** add restrained, blocky dirt scuffs to the tread texture so they belong on this arena floor.

<<<<<<< SEARCH
    for (let y = 7; y < 27; y += 7)
      for (let x = 5; x < 25; x++) g.set(x, y, "#151d23");
  });
=======
    for (let y = 7; y < 27; y += 7)
      for (let x = 5; x < 25; x++) g.set(x, y, "#151d23");
    // Sparse earth caught on the leading edges, in chunky pixel clusters.
    for (const [x, y] of [[5, 3], [22, 12], [9, 24]]) {
      for (let dx = 0; dx < 5; dx++)
        for (let dy = 0; dy < 2; dy++)
          g.set(x + dx, y + dy, dy === 0 ? "#78674f" : "#4d493d");
      g.set(x + 1, y + 2, "#4d493d");
      g.set(x + 2, y + 2, "#4d493d");
    }
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let x = 20; x < 28; x++)
      for (let y = 4; y < 12; y++) g.set(x, y, C.yellow);
    for (let y = 6; y < 10; y++) {
      g.set(22, y, C.ink);
      g.set(25, y, C.ink);
    }
=======
    for (let x = 19; x < 29; x++)
      for (let y = 2; y < 14; y++)
        g.set(x, y,
          x === 19 || x === 28 || y === 2 || y === 13
            ? C.yellow : C.ink);
    text(g, "B", 22, 4, C.yellow);
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let x = 20; x < 44; x++) {
      if (x % 3 !== 0) {
        g.set(x, 6, C.white);
        g.set(x, 7, C.white);
        g.set(x, 55, "#748189");
      }
    }
    text(g, "8", 29, 9, C.white);
=======
    text(g, "BYTE", 21, 8, "#c5d7d5");
    text(g, "CRUSHER", 12, 49, "#82978f");
    for (const x of [5, 56]) {
      for (let y = 29; y < 35; y++) {
        g.set(x, y, C.yellow);
        g.set(x + 1, y, C.yellow);
      }
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  box("hoodRaisedCenter", [0, 2.916, 1.71], [0.81, 0.08, 1.02], C.cyanDark);
  panel("hoodMonster", [0, 2.962, 1.73], 0.73, 0.88, SKULL, [0, 1, 0]);
  for (const side of [1, -1]) {
    box(`hoodStripe${side}`, [side * 0.78, 2.896, 1.74],
      [0.13, 0.016, 1.20], C.yellow);
    for (let j = 0; j < 3; j++) {
      box(`hoodVent${side}_${j}`, [side * 0.51, 2.90, 1.37 + j * 0.14],
        [0.15, 0.022, 0.065], C.ink);
    }
  }
=======
  box("hoodRaisedCenter", [0, 2.916, 1.71], [1.12, 0.08, 1.04], C.cyanDark);
  panel("hoodMonster", [0, 2.962, 1.73], 1.02, 0.96, SKULL, [0, 1, 0]);
  for (const side of [1, -1]) {
    box(`hoodStripe${side}`, [side * 0.96, 2.896, 1.74],
      [0.10, 0.016, 1.20], C.yellow);
    for (let j = 0; j < 3; j++) {
      box(`hoodVent${side}_${j}`, [side * 0.73, 2.90, 1.37 + j * 0.14],
        [0.19, 0.022, 0.065], C.ink);
    }
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  tiled("frontHazardStrip", [0, 2.235, 2.724],
    [1.61, 0.11, 0.025], HAZARD, 0.050);
=======
  panel("frontHazardStrip", [0, 2.235, 2.724],
    1.61, 0.11, HAZARD);
>>>>>>> REPLACE

<<<<<<< SEARCH
  tiled("rearHazardStrip", [0, 2.21, -2.677],
    [1.42, 0.09, 0.025], HAZARD, 0.045);
=======
  panel("rearHazardStrip", [0, 2.21, -2.677],
    1.42, 0.09, HAZARD, [0, 0, -1]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Arena corner markers stay below the truck and out of its frontal silhouette.
=======
  // A flattened arena scrap car fits entirely within the truck's wheelbase.
  // Its muted colours and low profile preserve the truck as the unmistakable hero.
  const SCRAP = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      if (y > 24) return "#493b49";
      if (x === 0 || y === 0) return "#3c303e";
      if (x === 1 || y === 1) return "#a67a86";
      return (x * 7 + y * 13) % 61 === 0 ? "#ac8e88" : "#785462";
    });
    for (const [x, y] of [[5, 9], [18, 18], [9, 25]]) {
      for (let j = 0; j < 7; j++) {
        g.set(x + j, y, "#bca99a");
        if (j < 4) g.set(x + j, y + 1, "#443c41");
      }
    }
  });

  const scrapZ = -0.18;
  box("scrapUnderpan", [0, 0.34, scrapZ],
    [1.26, 0.13, 2.56], "#343039");
  tiled("scrapBody", [0, 0.48, scrapZ],
    [1.34, 0.23, 2.70], SCRAP, 0.055);
  tiled("scrapRearDeck", [0, 0.60, scrapZ - 0.98],
    [1.29, 0.10, 0.64], SCRAP, 0.050);

  // The hood folds into a broad, shallow accordion.
  for (let i = 0; i < 3; i++) {
    tiled(`scrapHoodFold${i}`,
      [i === 1 ? 0.025 : 0, 0.61 + (i === 1 ? 0.035 : 0), scrapZ + 0.67 + i * 0.22],
      [1.28, 0.09, 0.26], SCRAP, 0.05,
      chassis, [i % 2 ? -10 : 8, 0, 0]);
  }

  // Collapsed cabin: deliberately bent panes and a buckled roof, not a tiny intact car.
  b.slab([
    [-0.58, 0.59, scrapZ + 0.42],
    [0.58, 0.59, scrapZ + 0.42],
    [0.50, 0.77, scrapZ + 0.12],
    [-0.47, 0.74, scrapZ + 0.12],
  ], { color: "#344952", thickness: 0.035, bone: chassis, name: "scrapWindshield" });

  b.slab([
    [-0.53, 0.74, scrapZ + 0.13],
    [0.52, 0.77, scrapZ + 0.13],
    [0.56, 0.68, scrapZ - 0.54],
    [-0.49, 0.70, scrapZ - 0.57],
  ], { color: "#8e6573", thickness: 0.055, bone: chassis, name: "scrapBuckledRoof" });

  for (const side of [1, -1]) {
    b.slab([
      [side * 0.63, 0.57, scrapZ + 0.40],
      [side * 0.50, 0.74, scrapZ + 0.10],
      [side * 0.54, 0.68, scrapZ - 0.54],
      [side * 0.64, 0.57, scrapZ - 0.73],
    ], { color: "#34424b", thickness: 0.025, bone: chassis,
      name: `scrapSideWindow${side}` });
    b.rod(
      [side * 0.60, 0.60, scrapZ + 0.40],
      [side * 0.49, 0.75, scrapZ + 0.10],
      0.025, { color: "#b38d94", section: "box", bone: chassis });
    box(`scrapDoorHandle${side}`, [side * 0.681, 0.51, scrapZ - 0.24],
      [0.025, 0.035, 0.15], "#ada39a");

    for (const z of [-0.98, 0.98]) {
      b.part(new THREE.CylinderGeometry(0.20, 0.20, 0.17, 8), "#28272e", {
        name: `scrapWheel${side}_${z}`,
        at: [side * 0.65, 0.36, scrapZ + z],
        bone: chassis, dir: [side, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.018, 8), "#7e7b79", {
        name: `scrapHub${side}_${z}`,
        at: [side * 0.744, 0.36, scrapZ + z],
        bone: chassis, dir: [side, 0, 0],
      });
    }
    box(`scrapHeadlamp${side}`, [side * 0.46, 0.48, scrapZ + 1.363],
      [0.23, 0.10, 0.02], "#c6bfa0");
    box(`scrapTailLamp${side}`, [side * 0.49, 0.48, scrapZ - 1.363],
      [0.17, 0.07, 0.02], "#8d4447");
  }
  box("scrapGrille", [0, 0.46, scrapZ + 1.365],
    [0.48, 0.11, 0.025], "#292a31");
  box("scrapBentBumper", [0.025, 0.35, scrapZ + 1.40],
    [1.40, 0.09, 0.11], "#8b8780", chassis, [0, -4, 3]);

  // Bright fractures and square glass chips are sparse accents.
  b.rod([-0.22, 0.682, scrapZ + 0.28],
    [0.04, 0.70, scrapZ + 0.25], 0.009,
    { color: "#a5c1bf", section: "box", bone: chassis });
  b.rod([0.04, 0.70, scrapZ + 0.25],
    [0.23, 0.75, scrapZ + 0.16], 0.009,
    { color: "#a5c1bf", section: "box", bone: chassis });

  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? 1 : -1;
    box(`scrapGlassChip${i}`,
      [side * (0.80 + random() * 0.14), 0.168,
        scrapZ - 0.6 + random() * 1.8],
      [0.045 + random() * 0.035, 0.014, 0.055],
      i % 3 ? "#6f989b" : "#aec9bf",
      chassis, [0, i % 2 ? 0 : 45, 0]);
  }

  // Arena corner markers stay below the truck and out of its frontal silhouette.
>>>>>>> REPLACE