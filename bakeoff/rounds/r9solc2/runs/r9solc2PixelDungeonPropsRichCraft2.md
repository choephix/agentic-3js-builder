1. **Ground the bone pile and skull.** The low view shows the skull hovering slightly. Lower the bones, seat the jaw on the floor, and give the skull a proper head–jaw hierarchy.
2. **Open the chest farther.** A steeper lid makes the treasure and decorated interior readable from the front rather than hiding them behind a broad brown panel.
3. **Give the lid a rich, pixel-patterned lining.** Burgundy upholstery and restrained gold detailing add a strong contrast to the wood and iron.
4. **Quiet the wood texture.** Reduce the scattered bright grain pixels so the chest’s silhouette, hardware, and loot remain the focal points.

<<<<<<< SEARCH
  const skullJaw = b.joint("skullJaw", {
    parent: stage,
    at: [-1.08, 0.235, 0.87],
    dir: [0, 0, 1],
    role: "jaw",
  });
=======
  const skull = b.joint("skull", {
    parent: stage,
    at: [-1.08, 0.355, 0.865],
    dir: [0, 0, 1],
    role: "head",
  });
  const skullJaw = b.joint("skullJaw", {
    parent: skull,
    at: [-1.08, 0.193, 0.87],
    dir: [0, 0, 1],
    role: "jaw",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
      return ramp[2 + (textureRandom() > 0.77 ? 1 : 0)];
=======
      return ramp[2 + (textureRandom() > 0.94 ? 1 : 0)];
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 32; i++) {
      const x = Math.floor(textureRandom() * 48);
      const y = Math.floor(textureRandom() * 40);
      g.set(x, y, "#ce8d49");
      if (y + 1 < 40) g.set(x, y + 1, "#ce8d49");
    }
=======
    for (let i = 0; i < 14; i++) {
      const x = Math.floor(textureRandom() * 48);
      const y = Math.floor(textureRandom() * 40);
      g.set(x, y, "#ce8d49");
      if (y + 1 < 40) g.set(x, y + 1, "#ce8d49");
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  const woodPaint = cellPaint(0.018, (c) => {
    const streak = Math.abs(Math.sin(c.at.x * 85 + c.at.z * 13));
    return c.pick(
      [C.woodDark, C.wood, C.woodLight],
      0.4 + 0.25 * c.n.y + streak * 0.15 + c.random(8) * 0.12,
    );
  });

  const ironPaint = cellPaint(0.017, (c) =>
=======
  const woodPaint = cellPaint(0.018, (c) => {
    const streak = Math.abs(Math.sin(c.at.x * 85 + c.at.z * 13));
    return c.pick(
      [C.woodDark, C.wood, C.woodLight],
      0.4 + 0.25 * c.n.y + streak * 0.15 + c.random(8) * 0.12,
    );
  });

  const velvetPaint = cellPaint(0.012, (c) => {
    const u = Math.floor((c.at.x - chestX + 0.48) / 0.012);
    const v = Math.floor((c.at.z - chestBack) / 0.012);
    const wrap = (value: number, period: number) =>
      ((value % period) + period) % period;
    const du = Math.abs(wrap(u, 12) - 6);
    const dv = Math.abs(wrap(v, 12) - 6);
    if (du + dv === 5) return "#8c4859";
    if (du === 0 && dv === 0) return C.goldDark;
    return c.random(18) > 0.88 ? "#733b50" : C.burgundy;
  });

  const lidPaint = paint((p, n) => {
    const inset =
      Math.abs(p.x - chestX) < 0.465 &&
      p.z > chestBack + 0.08 &&
      p.z < chestFront - 0.08;
    return inset && n.y < -0.4 ? velvetPaint : woodPaint;
  });

  const ironPaint = cellPaint(0.017, (c) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
      p.z < chestFront - 0.08;
=======
      p.z < chestZ + 0.32;
>>>>>>> REPLACE

<<<<<<< SEARCH
    thickness: 1.17,
    color: woodPaint,
    bone: lid,
    name: "angularChestLid",
=======
    thickness: 1.17,
    color: lidPaint,
    bone: lid,
    name: "angularChestLid",
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0.92, 0.012, 0.19],
    C.burgundy,
    lid,
    [0, 0, 0],
    "lidVelvetInset",
=======
    [0.92, 0.012, 0.19],
    velvetPaint,
    lid,
    [0, 0, 0],
    "lidVelvetInset",
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Lift the front while leaving the back edge on its hinge.
  b.pose(lid, { axis: [1, 0, 0], deg: -32 });
=======
  // A generous opening exposes the lined interior and clears the treasure.
  b.pose(lid, { axis: [1, 0, 0], deg: -58 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  function longBone(a: V, end: V, radius = 0.027) {
    b.frustumBox(
=======
  function longBone(a: V, end: V, radius = 0.027) {
    // The broad end knuckles support the shaft on the flagstones.
    a = [a[0], a[1] - 0.02, a[2]];
    end = [end[0], end[1] - 0.02, end[2]];
    b.frustumBox(
>>>>>>> REPLACE

<<<<<<< SEARCH
        [x, 0.19, 0.29],
        [x - 0.065, 0.19, 0.345],
        [x - 0.08, 0.19, 0.43],
        [x - 0.035, 0.19, 0.48],
=======
        [x, 0.165, 0.29],
        [x - 0.065, 0.165, 0.345],
        [x - 0.08, 0.165, 0.43],
        [x - 0.035, 0.165, 0.48],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const sx = -1.08;
  const sz = 0.865;
  tiledBox([sx, 0.397, sz - 0.055], [0.27, 0.216, 0.105], boneTexture, "#ffffff", stage, [0, 0, 0], 0.011, "skullRear");
  tiledBox([sx, 0.47, sz + 0.025], [0.272, 0.086, 0.205], boneTexture);
  tiledBox([sx, 0.503, sz - 0.005], [0.213, 0.028, 0.151], boneTexture);

  // Darkness is recessed behind the solid brow, temples and bridge.
  box([sx - 0.064, 0.379, sz + 0.058], [0.083, 0.094, 0.034], C.ink);
  box([sx + 0.064, 0.379, sz + 0.058], [0.083, 0.094, 0.034], C.ink);

  for (const s of [-1, 1]) {
    tiledBox([sx + s * 0.111, 0.375, sz + 0.033], [0.051, 0.115, 0.15], boneTexture);
    tiledBox([sx + s * 0.087, 0.321, sz + 0.072], [0.088, 0.042, 0.108], boneTexture);
    box([sx + s * 0.067, 0.427, sz + 0.112], [0.09, 0.022, 0.029], C.boneLight);
  }

  tiledBox([sx, 0.388, sz + 0.087], [0.041, 0.091, 0.068], boneTexture);
  box([sx, 0.313, sz + 0.11], [0.035, 0.037, 0.027], C.ink);
  box([sx, 0.291, sz + 0.095], [0.168, 0.025, 0.073], C.bone);

  for (let i = 0; i < 5; i++) {
    box(
      [sx + (i - 2) * 0.033, 0.268, sz + 0.118],
      [0.024, 0.037 - (i % 2) * 0.006, 0.035],
      C.boneLight,
    );
  }

  tiledBox(
    [sx, 0.214, sz + 0.05],
    [0.216, 0.046, 0.166],
    boneTexture,
    "#ffffff",
    skullJaw,
  );
  for (const s of [-1, 1]) {
    box(
      [sx + s * 0.091, 0.238, sz - 0.013],
      [0.036, 0.086, 0.063],
      C.boneShade,
      skullJaw,
    );
  }
  for (let i = 0; i < 5; i++) {
    box(
      [sx + (i - 2) * 0.033, 0.243, sz + 0.116],
      [0.024, 0.025, 0.033],
      C.bone,
      skullJaw,
    );
  }
=======
  const sx = -1.08;
  const sz = 0.865;

  function skullBlock(at: V, size: V, color: Fill) {
    return box(at, size, color, skull);
  }

  function skullTile(at: V, size: V, name?: string) {
    return tiledBox(
      at,
      size,
      boneTexture,
      "#ffffff",
      skull,
      [0, 0, 0],
      0.011,
      name,
    );
  }

  skullTile(
    [sx, 0.355, sz - 0.055],
    [0.27, 0.216, 0.105],
    "skullRear",
  );
  skullTile([sx, 0.428, sz + 0.025], [0.272, 0.086, 0.205]);
  skullTile([sx, 0.461, sz - 0.005], [0.213, 0.028, 0.151]);

  // Empty sockets stay behind the projecting brow and cheekbones.
  for (const s of [-1, 1]) {
    skullBlock(
      [sx + s * 0.064, 0.337, sz + 0.058],
      [0.083, 0.094, 0.034],
      C.ink,
    );
    skullTile(
      [sx + s * 0.111, 0.333, sz + 0.033],
      [0.051, 0.115, 0.15],
    );
    skullTile(
      [sx + s * 0.087, 0.279, sz + 0.072],
      [0.088, 0.042, 0.108],
    );
    skullBlock(
      [sx + s * 0.067, 0.385, sz + 0.112],
      [0.09, 0.022, 0.029],
      C.boneLight,
    );
  }

  skullTile([sx, 0.346, sz + 0.087], [0.041, 0.091, 0.068]);
  skullBlock([sx, 0.271, sz + 0.11], [0.035, 0.037, 0.027], C.ink);
  skullBlock([sx, 0.249, sz + 0.095], [0.168, 0.025, 0.073], C.bone);
  skullBlock(
    [sx, 0.211, sz + 0.096],
    [0.165, 0.026, 0.017],
    C.ink,
  );

  for (let i = 0; i < 5; i++) {
    skullBlock(
      [sx + (i - 2) * 0.033, 0.226, sz + 0.118],
      [0.024, 0.025 - (i % 2) * 0.003, 0.035],
      C.boneLight,
    );
  }

  // The underside is at 0.149 m: seated on the 0.15 m floor.
  tiledBox(
    [sx, 0.172, sz + 0.05],
    [0.216, 0.046, 0.166],
    boneTexture,
    "#ffffff",
    skullJaw,
    [0, 0, 0],
    0.011,
    "groundedSkullJaw",
  );
  for (const s of [-1, 1]) {
    box(
      [sx + s * 0.091, 0.196, sz - 0.013],
      [0.036, 0.086, 0.063],
      C.boneShade,
      skullJaw,
    );
  }
  for (let i = 0; i < 5; i++) {
    box(
      [sx + (i - 2) * 0.033, 0.201, sz + 0.116],
      [0.024, 0.016, 0.033],
      C.bone,
      skullJaw,
    );
  }
>>>>>>> REPLACE