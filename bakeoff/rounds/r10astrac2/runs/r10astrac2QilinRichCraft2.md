1. **Rebuild the cloud masses.** The mane currently reads as flat discs with wire curls and horn-like extensions. Fuller, overlapping lobes and thicker, seated scrolls will make it unmistakably a cloud mane.
2. **Make the scales a continuous coat.** Tighten the spacing, reduce their raised centers, and soften the alternating colors so the flanks read as overlapping armor rather than scattered badges.
3. **Strengthen the front-view face and chest.** Broaden the eyes slightly, add sculpted upper lids, and give the throat a tapered ivory bib that connects visually to the mane.
4. **Improve the setting’s clouds.** Replace the flattened pebble-like mist with small billowing banks, keeping the feet and engraved seal visible.

<<<<<<< SEARCH
  const scaleGeo = shieldGeometry(0.205, 0.225);
  const smallScaleGeo = shieldGeometry(0.135, 0.17);
  const barrelSkin = b.surface(body);
  const scaleColors = ["#70c8b8", "#91ddc7", "#59b7ac", "#ace7ce"];

  // Bottom row first: upper rows visually overlap the roots below.
  for (const s of [1, -1]) {
    for (let row = 0; row < 4; row++) {
      const y = 1.265 + row * 0.15;
      for (let col = 0; col < 7; col++) {
        const z = -0.67 + col * 0.18 + (row % 2) * 0.075;
=======
  const scaleGeo = shieldGeometry(0.215, 0.245);
  const smallScaleGeo = shieldGeometry(0.15, 0.185);
  const barrelSkin = b.surface(body);
  const scaleColors = ["#78cbb8", "#8dd8c0", "#70c2b1", "#99dfc6"];

  // Broad, shallow shingles: each higher row covers the roots below.
  for (const s of [1, -1]) {
    for (let row = 0; row < 5; row++) {
      const y = 1.25 + row * 0.125;
      for (let col = 0; col < 9; col++) {
        const z = -0.70 + col * 0.14 + (row % 2) * 0.07;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const vertices = [0, width * 0.085, -length * 0.035];
=======
    const vertices = [0, width * 0.045, -length * 0.035];
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Cloud scrolls have volume, taper and a recessed inner spiral.
  // The outer stroke overlaps its solid core all the way around.
  function cloudScroll(
    center: number[], radius: number, bone: Bone,
    side: number, name: string, blue = false,
  ) {
    const [x, y, z] = center;
    ellipsoid(
      center,
      [radius * 0.72, radius * 0.94, radius * 1.16],
      blue ? cloudBlue : cloud, bone, `${name}Mass`,
      [side * 10, 0, 0],
    );

    const surfaceX = x + side * radius * 0.55;
    const outer = catmull([
      [surfaceX, y - radius * 0.68, z + radius * 0.55],
      [surfaceX, y - radius * 0.77, z - radius * 0.31],
      [surfaceX, y - radius * 0.22, z - radius * 0.88],
      [surfaceX, y + radius * 0.57, z - radius * 0.65],
      [surfaceX, y + radius * 0.78, z + radius * 0.12],
      [surfaceX, y + radius * 0.33, z + radius * 0.56],
      [surfaceX, y - radius * 0.06, z + radius * 0.24],
      [surfaceX, y + radius * 0.04, z - radius * 0.05],
    ]);
    b.sweep(outer, [radius * 0.26, radius * 0.30, radius * 0.25, radius * 0.12], {
      bone, color: blue ? cloud : ivory, sides: 8,
      name: `${name}SculptedScroll`,
    });

    const innerX = surfaceX + side * radius * 0.16;
    b.sweep(catmull([
      [innerX, y - radius * 0.48, z - radius * 0.27],
      [innerX, y - radius * 0.07, z - radius * 0.57],
      [innerX, y + radius * 0.41, z - radius * 0.35],
      [innerX, y + radius * 0.39, z + radius * 0.15],
      [innerX, y + radius * 0.10, z + radius * 0.22],
    ]), [radius * 0.04, radius * 0.025], {
      bone, color: C.cloudShadow, sides: 5,
      name: `${name}Recess`,
    });
  }
=======
  // Each scroll is a solid billow with a broad curling crest, not a ring
  // attached to a flat disc. Its small colored recess remains inside the mass.
  function cloudScroll(
    center: number[], radius: number, bone: Bone,
    side: number, name: string, blue = false,
  ) {
    const [x, y, z] = center;
    const fill = blue ? cloudBlue : cloud;
    ellipsoid(
      center,
      [radius * 0.91, radius * 1.02, radius * 1.10],
      fill, bone, `${name}Mass`,
    );
    ellipsoid(
      [x + side * radius * 0.18, y + radius * 0.64, z - radius * 0.29],
      [radius * 0.64, radius * 0.66, radius * 0.75],
      cloud, bone, `${name}UpperBillow`,
    );
    ellipsoid(
      [x + side * radius * 0.10, y - radius * 0.52, z + radius * 0.40],
      [radius * 0.66, radius * 0.54, radius * 0.76],
      fill, bone, `${name}LowerBillow`,
    );

    const surfaceX = x + side * radius * 0.66;
    const outer = catmull([
      [surfaceX, y - radius * 0.64, z + radius * 0.54],
      [surfaceX, y - radius * 0.68, z - radius * 0.18],
      [surfaceX, y - radius * 0.13, z - radius * 0.65],
      [surfaceX, y + radius * 0.49, z - radius * 0.45],
      [surfaceX, y + radius * 0.57, z + radius * 0.12],
      [surfaceX, y + radius * 0.19, z + radius * 0.42],
      [surfaceX, y - radius * 0.05, z + radius * 0.16],
      [surfaceX, y + radius * 0.07, z + radius * 0.02],
    ]);
    b.sweep(outer, [
      radius * 0.33, radius * 0.36, radius * 0.30, radius * 0.16,
    ], {
      bone, color: cloud, sides: 9,
      name: `${name}SculptedScroll`,
    });

    const innerX = surfaceX + side * radius * 0.22;
    b.sweep(catmull([
      [innerX, y - radius * 0.28, z - radius * 0.19],
      [innerX, y + radius * 0.02, z - radius * 0.36],
      [innerX, y + radius * 0.29, z - radius * 0.17],
      [innerX, y + radius * 0.23, z + radius * 0.11],
    ]), [radius * 0.026, radius * 0.013], {
      bone, color: C.cloudShadow, sides: 5,
      name: `${name}Recess`,
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    return b.sweep(catmull(points), [width, width * 0.94, width * 0.54, 0], {
      bone, color, sides: 8, caps: "flat", name,
    });
=======
    return b.sweep(catmull(points), [
      width * 1.15, width * 1.32, width * 0.76, width * 0.29, 0,
    ], {
      bone, color, sides: 9, caps: "flat", name,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [0.225, 0.254],
=======
      size: [0.246, 0.265],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(bezier(
      [s * 0.09, 2.70, 1.205],
=======
    // A fitted upper eyelid gives the painted eye depth without hiding its iris.
    const eyeSurface = b.surface(skull);
    const lid = eyeSurface.drape([
      [s * 0.075, 2.59, 1.30],
      [s * 0.15, 2.635, 1.28],
      [s * 0.245, 2.62, 1.20],
    ], { lift: 0.004 });
    b.sweep(lid, [0.008, 0.012, 0.004], {
      bone: head, color: C.ink, sides: 6, name: `UpperEyelid${s}`,
    });

    b.sweep(bezier(
      [s * 0.09, 2.70, 1.205],
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Collar and pendant.
  const collarLoop = b.surface(neckTube).loop([0, 1.84, 0.64], {
=======
  // A fitted, pointed ivory throat bib replaces the empty dark front of
  // the neck. Surface queries keep every lock seated on the existing neck.
  const throatSurface = b.surface(neckTube);
  for (const s of [-1, 1]) {
    const route = throatSurface.drape([
      [s * 0.075, 2.29, 1.00],
      [s * 0.12, 2.16, 1.02],
      [s * 0.14, 2.00, 0.99],
      [s * 0.075, 1.86, 0.96],
    ], { lift: 0.015 });
    b.sweep(route, [0.055, 0.07, 0.048, 0], {
      bone: neck, color: cloud,
      sides: 8, caps: "flat", name: `IvoryThroatLock${s}`,
    });
  }
  const bibCenter = throatSurface.drape([
    [0, 2.22, 1.06],
    [0, 2.08, 1.07],
    [0, 1.95, 1.02],
    [0, 1.87, 0.98],
  ], { lift: 0.022 });
  b.sweep(bibCenter, [0.053, 0.062, 0.038, 0], {
    bone: neck, color: ivory,
    sides: 8, caps: "flat", name: "IvoryThroatCenter",
  });

  // Collar and pendant.
  const collarLoop = b.surface(neckTube).loop([0, 1.84, 0.64], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    ellipsoid(
      [s * 0.72, 0.155, -1.22], [0.17, 0.035, 0.43],
      cloudBlue, stage, "GroundMistBank",
    );
    for (let i = 0; i < 3; i++) {
      ellipsoid(
        [s * (0.66 + i * 0.055), 0.17 + i * 0.012, -1.45 + i * 0.23],
        [0.14, 0.055 + random() * 0.018, 0.21],
        i % 2 ? cloudBlue : cloud, stage, "GroundMistLobe",
      );
    }
=======
    ellipsoid(
      [s * 0.72, 0.17, -1.22], [0.18, 0.05, 0.43],
      cloudBlue, stage, "GroundMistBank",
    );
    for (let i = 0; i < 3; i++) {
      const r = 0.075 + random() * 0.022;
      ellipsoid(
        [s * (0.66 + i * 0.055), 0.12 + r, -1.45 + i * 0.23],
        [0.14, r, 0.18],
        i % 2 ? cloudBlue : cloud, stage, "GroundMistLobe",
      );
    }
    ellipsoid(
      [s * 0.70, 0.225, -1.28],
      [0.105, 0.092, 0.125],
      cloud, stage, "GroundMistCrown",
    );
>>>>>>> REPLACE