1. **Quiet the wood grain.** The high-contrast marbling competes with every crafted detail. Replace it with restrained, warm plum-brown timber and subtle directional streaks.
2. **Rebuild the paving silhouette.** Give the tiles one coherent chamfered foundation, eliminating the exposed dark wedges and unsupported-looking corners.
3. **Seat the small tools and support the chart.** Lower the mortar, spoon and cuttings onto the worktop; hang the reference sheet from visible cords.
4. **Make the alchemy feel alive.** Give potions clearer liquid levels, add a softly luminous retort meniscus and introduce a decorative heat-resistant work mat.
5. **Refine the botanical finish.** Broaden the fresh sage leaves and add fine central veins so the plant reads as lush foliage rather than spikes.

<<<<<<< SEARCH
  const wood = grain("#382d3c", "#74505a", {
    size: 0.033,
    axis: "x",
    seed: 12,
  });
  const uprightWood = grain("#3b303e", "#80535a", {
    size: 0.024,
    axis: "y",
    seed: 12,
  });
=======
  const subtleWood = grain("#59404a", "#75515a", {
    size: 0.065,
    axis: "x",
    seed: 12,
  });
  const subtleUpright = grain("#503a46", "#694a54", {
    size: 0.055,
    axis: "y",
    seed: 12,
  });
  const wood = paint((p, n) => {
    const base = subtleWood.at(p, n);
    return mix(base, "#9a726b", Math.max(0, n.y) * 0.13);
  });
  const uprightWood = paint((p, n) => {
    const base = subtleUpright.at(p, n);
    return mix(base, "#88616a", Math.max(0, n.x * 0.35 + n.z * 0.65) * 0.09);
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // The low, chamfered paving island frames the furniture rather than becoming a room.
  b.part(new THREE.CylinderGeometry(1, 1.035, 0.075, 8), stone, {
    at: [0, 0.0375, 0],
    scale: [1.22, 1, 0.73],
    bone: root,
    name: "octagonalStoneDais",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.012, 8), C.dark, {
    at: [0, 0.08, 0],
    scale: [1.195, 1, 0.708],
    bone: root,
    name: "recessedPavingBed",
  });
=======
  // A single clipped-rectangle foundation supports every paving corner.
  const daisOutline = [
    [-1.16, -0.45],
    [-1.0, -0.63],
    [1.0, -0.63],
    [1.16, -0.45],
    [1.16, 0.45],
    [1.0, 0.63],
    [-1.0, 0.63],
    [-1.16, 0.45],
  ];
  b.extrude(daisOutline, {
    at: [0, 0.039, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.078,
    bevel: 0.012,
    color: stone,
    bone: root,
    name: "chamferedStoneFoundation",
  });
  b.extrude(
    daisOutline.map(([x, z]) => [x * 0.985, z * 0.975]),
    {
      at: [0, 0.084, 0],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.018,
      color: "#687d8a",
      bone: root,
      name: "continuousPavingBorder",
    },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
      let c = p.y < level ? mix(glassDark, liquid, 0.78) : mix(glassDark, "#c4e5dc", 0.49);
      c = mix(c, "#fff5d2", Math.max(0, n.y) * 0.16);
=======
      let c = p.y < level
        ? mix(glassDark, liquid, 0.91)
        : mix(glassDark, "#c4e5dc", 0.36);
      if (Math.abs(p.y - level) < h * 0.012) {
        c = mix(liquid, "#f3ffe7", 0.52);
      }
      c = mix(c, "#fff5d2", Math.max(0, n.y) * 0.10);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Large central lunar retort and its copper cooling circuit.
  potion([0, 1.003, 0.055], 0.145, 0.425, "#28647b", "#72e5c3", labelMoon, "lunarRetort", false);
=======
  // An inset ceramic working mat separates the glass apparatus from the timber.
  b.extrude(
    [
      [-0.201, -0.135],
      [-0.166, -0.17],
      [0.426, -0.17],
      [0.462, -0.134],
      [0.462, 0.204],
      [0.426, 0.239],
      [-0.166, 0.239],
      [-0.201, 0.204],
    ],
    {
      at: [0, 0.998, 0],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.008,
      color: "#254e59",
      bone: root,
      name: "enamelDistillationMat",
    },
  );
  for (const z of [-0.225, 0.156]) {
    rod([-0.155, 1.003, z], [0.417, 1.003, z], 0.0025, C.gold, "matGiltBorder");
  }
  for (const x of [-0.182, 0.443]) {
    rod([x, 1.003, -0.19], [x, 1.003, 0.125], 0.0025, C.gold, "matSideBorder");
  }

  // Large central lunar retort and its copper cooling circuit.
  const lunarRetort = potion(
    [0, 1.003, 0.055],
    0.145,
    0.425,
    "#28647b",
    "#48ebc6",
    labelMoon,
    "lunarRetort",
    false,
  );
  const retortSkin = b.surface(lunarRetort);
  const liquidFoot = retortSkin.loop([0, 1.058, 0.055], {
    dir: [0, 1, 0],
    lift: 0.0012,
  });
  glow(
    b.sweep(liquidFoot, 0.0022, {
      color: "#8df4d3",
      bone: root,
      sides: 6,
      name: "retortLiquidCaustic",
    }),
    0.9,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A parchment reference sheet held behind the apparatus.
=======
  // A parchment reference sheet held behind the apparatus.
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A parchment reference sheet held behind the apparatus.
  drawing([0.60, 1.46, -0.346], [0.177, 0.237], scrollTexture, "pinnedAlchemyReference");
=======
  // A parchment reference sheet held behind the apparatus.
  drawing([0.60, 1.46, -0.346], [0.177, 0.237], scrollTexture, "pinnedAlchemyReference");
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A parchment reference sheet held behind the apparatus.
=======
  // A parchment reference sheet held behind the apparatus.
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A parchment reference sheet held behind the apparatus.
=======
  // A parchment reference sheet held behind the apparatus.
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A parchment reference sheet held behind the apparatus.
=======
  // A parchment reference sheet held behind the apparatus.
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A parchment reference sheet held behind the apparatus.
=======
  // A parchment reference sheet held behind the apparatus.
>>>>>>> REPLACE
