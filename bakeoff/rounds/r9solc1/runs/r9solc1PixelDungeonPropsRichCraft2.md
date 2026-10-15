1. **Make the lid’s iron bands stand proud of the wood.** They currently disappear into the roof; prominent bands will restore the chest’s ironbound silhouette.
2. **Give the lid a finished interior.** A burgundy inset with a gilded pixel emblem adds a focal detail without competing with the treasure.
3. **Simplify the surface noise.** Broader stone shading and darker, directional spike highlights will read as pixel art rather than scattered static.
4. **Add a connected pressure plate.** This explains how the trap works and fills the quiet foreground with a purposeful dungeon detail.

<<<<<<< SEARCH
      const broad =
        Math.sin(x * 0.23) * 0.7 + Math.cos(y * 0.19) * 0.5;
      const value = Math.max(
        0,
        Math.min(4, Math.floor(2 + broad + textureRandom() * 0.7)),
      );
      return colors[value];
    });
    for (let i = 0; i < 48; i++) {
=======
      const broad =
        Math.sin(Math.floor(x / 4) * 0.78) * 0.65 +
        Math.cos(Math.floor(y / 4) * 0.69) * 0.45;
      const value = Math.max(
        0,
        Math.min(4, Math.floor(2 + broad)),
      );
      return colors[value];
    });
    for (let i = 0; i < 14; i++) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const spikePaint = cellPaint(
    0.014,
    (c) => {
      if (c.at.y < 0.28 && c.random(31) < 0.34) return C.rust;
      return c.pick(
        [C.iron, C.steel, C.silver, "#f0f0dc"],
        0.45 + c.n.y * 0.21 + c.random(5) * 0.17,
      );
    },
    { dither: true },
  );
=======
  const spikePaint = cellPaint(
    0.018,
    (c) => {
      if (c.at.y < 0.275 && c.random(31) < 0.2) return C.rust;
      const light = c.n.x * 0.35 + c.n.z * 0.65;
      if (light > 0.43) {
        return c.at.y > 0.43 ? C.silver : C.steel;
      }
      if (light > -0.25) return "#677888";
      return "#343f52";
    },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(archShell, {
      at: [chestX + s * 0.397, 0.843, chestBack - 0.004],
      thickness: 0.079,
      color: ironPaint,
      bone: lid,
      name: "lidIronBand",
    });
=======
    const raisedBand: OutlinePoint[] = archShell.map((point, i) => {
      const u = point[0];
      const v = point[1];
      if (i >= 8) return [u, v];
      return [
        u <= 0.105 ? u - 0.012 : u >= 0.695 ? u + 0.012 : u,
        v + 0.016,
      ];
    });
    b.extrude(raisedBand, {
      at: [chestX + s * 0.397, 0.84, chestBack],
      thickness: 0.094,
      color: ironPaint,
      bone: lid,
      name: "lidIronBand",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Lift the front while leaving the back edge on its hinge.
  b.pose(lid, { axis: [1, 0, 0], deg: -32 });
=======
  // Upholstered inset against the flat inner roof of the arched lid.
  // Its lower face is visible when the lid opens.
  box(
    [chestX, 1.068, chestZ],
    [0.92, 0.012, 0.19],
    C.burgundy,
    lid,
    [0, 0, 0],
    "lidVelvetInset",
  );
  for (const s of [-1, 1]) {
    box(
      [chestX + s * 0.457, 1.058, chestZ],
      [0.018, 0.012, 0.205],
      C.gold,
      lid,
    );
    box(
      [chestX, 1.058, chestZ + s * 0.099],
      [0.92, 0.012, 0.018],
      C.gold,
      lid,
    );
    for (const x of [-0.35, -0.23, 0.23, 0.35]) {
      box(
        [chestX + x, 1.051, chestZ + s * 0.076],
        [0.014, 0.008, 0.014],
        C.goldLight,
        lid,
      );
    }
  }
  b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
    at: [chestX, 1.0605, chestZ],
    bone: lid,
    dir: [0, -1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: chestEmblem,
    name: "lidInnerGildedSeal",
  });

  // Lift the front while leaving the back edge on its hinge.
  b.pose(lid, { axis: [1, 0, 0], deg: -32 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // Bone pile and a small squared-off skull; empty sockets, separate lower jaw.
  // ---------------------------------------------------------------------------
=======
  // A worn pressure plate linked directly to the trap's left edge.
  const triggerX = 0.19;
  const triggerZ = 0.855;
  box(
    [triggerX, 0.156, triggerZ],
    [0.31, 0.012, 0.37],
    C.ink,
    stage,
    [0, 0, 0],
    "pressurePlateRecess",
  );
  tiledBox(
    [triggerX, 0.171, triggerZ],
    [0.268, 0.025, 0.327],
    metalTexture,
    C.iron,
    stage,
    [0, 0, 0],
    0.018,
    "trapPressurePlate",
  );
  for (const s of [-1, 1]) {
    box(
      [triggerX + s * 0.129, 0.187, triggerZ],
      [0.018, 0.009, 0.326],
      C.goldDark,
    );
    box(
      [triggerX, 0.187, triggerZ + s * 0.154],
      [0.252, 0.009, 0.018],
      C.goldDark,
    );
    for (const t of [-1, 1]) {
      box(
        [triggerX + s * 0.105, 0.191, triggerZ + t * 0.126],
        [0.021, 0.008, 0.021],
        C.steel,
      );
    }
  }
  b.part(new THREE.PlaneGeometry(0.145, 0.145), "#ffffff", {
    at: [triggerX, 0.187, triggerZ],
    bone: stage,
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: hazardTexture,
    name: "pressurePlateWarning",
  });
  box(
    [0.387, 0.161, triggerZ],
    [0.128, 0.014, 0.058],
    C.ink,
    stage,
    [0, 0, 0],
    "triggerLinkChannel",
  );
  box(
    [0.387, 0.17, triggerZ],
    [0.128, 0.012, 0.018],
    C.goldDark,
    stage,
    [0, 0, 0],
    "triggerLinkRod",
  );
  for (const x of [0.349, 0.421]) {
    box([x, 0.176, triggerZ], [0.025, 0.018, 0.05], C.iron);
  }

  // ---------------------------------------------------------------------------
  // Bone pile and a small squared-off skull; empty sockets, separate lower jaw.
  // ---------------------------------------------------------------------------
>>>>>>> REPLACE