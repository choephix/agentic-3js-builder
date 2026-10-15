1. **Fix the partially buried lid crest.** Its flat medallion intersects the curved lid, leaving only fragments visible. Bring the complete assembly forward on a substantial mounting boss.
2. **Give the lid a stronger focal hierarchy.** Add restrained gold sun-rays around the restored crest and decorative corner inlays—not more scattered small detail.
3. **Finish the chest’s blank sides.** Add matching heraldic engraving behind the carrying rings, tying the side views to the decorated front.
4. **Improve the material contrast.** Give the gold warmer shadows and brighter directional highlights, and add a few crisp, physical highlights to the largest gemstones.

<<<<<<< SEARCH
  const gold = paint((p, n) => {
    const t = Math.max(0, Math.min(1, n.y * 0.35 + n.z * 0.15 + 0.46));
    return mix("#94602c", "#ffe096", t + (noise(p, 0.11, 3) - 0.5) * 0.13);
  });
  const brightGold = paint((_p, n) =>
    n.y > 0.25 ? "#ffe7ad" : n.z > -0.3 ? "#eab855" : "#a96e31",
  );
=======
  const gold = paint((p, n) => {
    const key = n.x * 0.26 + n.y * 0.72 + n.z * 0.32;
    const variation = (noise(p, 0.14, 3) - 0.5) * 0.09;
    if (key > 0.54)
      return mix("#f6c96b", "#fff0bd", (key - 0.54) * 1.6 + variation);
    return mix("#80502b", "#e5ad48", Math.max(0, key * 0.72 + 0.48 + variation));
  });
  const brightGold = paint((_p, n) =>
    n.y > 0.25 ? "#fff0bf" : n.z > -0.3 ? "#f0bf61" : "#99602d",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Carrying rings sit against each side and remain readable in three-quarter view.
  for (const s of [-1, 1]) {
=======
  // Broad side engraving belongs to the panel; the carrying boss sits over it.
  for (const s of [-1, 1]) {
    drawing(
      panelTexture,
      [s * 0.762, 0.663, chestZ],
      [0.85, 0.43],
      "side heraldic panel engraving",
      [s, 0, 0],
    );
    for (const z of [-0.58, 0.12]) {
      b.extrude(
        [[0, 0.045], [0.025, 0], [0, -0.045], [-0.025, 0]],
        {
          at: [s * 0.77, 0.66, z],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.012,
          color: brightGold,
          name: "side panel diamond inlay",
        },
      );
    }
  }

  // Carrying rings sit against each side and remain readable in three-quarter view.
  for (const s of [-1, 1]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  // The large heraldic medallion faces forward from the inside of the lid.
  const crestAt = lp(0, lidArch(0.56 / lidLength) - 0.067, 0.56);
  const crestDir = new THREE.Vector3(0, -1, 0).applyQuaternion(lidQ);
  const crestUp = new THREE.Vector3(0, 0, 1).applyQuaternion(lidQ);
=======
  // A flat medallion must clear the barrel's concave inner surface at its edges.
  // A substantial pedestal fills the space behind it rather than leaving a gap.
  const crestSeat = lp(0, lidArch(0.56 / lidLength) - 0.067, 0.56);
  const crestDir = new THREE.Vector3(0, -1, 0).applyQuaternion(lidQ);
  const crestUp = new THREE.Vector3(0, 0, 1).applyQuaternion(lidQ);
  const crestAt = crestSeat.clone().addScaledVector(crestDir, 0.105);

  b.part(new THREE.CylinderGeometry(0.225, 0.2, 0.15, 10), C.darkGold, {
    at: crestSeat.clone().addScaledVector(crestDir, 0.035),
    dir: crestDir,
    name: "medallion substantial mounting pedestal",
  });

  // A small sunburst makes the crest the visual heart of the open lid.
  // Rays follow the lid profile, so their roots remain seated in the wood.
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const radial = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tangent = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const r0 = 0.27;
    const r1 = i % 3 === 0 ? 0.395 : 0.35;
    const width = i % 3 === 0 ? 0.027 : 0.018;
    const coords = [
      radial.clone().multiplyScalar(r0).addScaledVector(tangent, -width),
      radial.clone().multiplyScalar(r1),
      radial.clone().multiplyScalar(r0).addScaledVector(tangent, width),
    ];
    b.slab(
      coords.map((p) => {
        const z = 0.56 + p.z;
        return lp(p.x, lidArch(z / lidLength) - 0.069, z);
      }),
      {
        color: gold,
        thickness: 0.014,
        name: "seated heraldic sun ray",
      },
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Follow the barrel profile with a narrow inner gold frame.
  for (const s of [-1, 1]) {
=======
  // Corner flourishes are seated separately on the barrel planks.
  for (const s of [-1, 1]) {
    for (const t of [0.19, 0.81]) {
      const z = t * lidLength;
      const slope = Math.PI * 0.245 / lidLength * Math.cos(Math.PI * t);
      const outward = new THREE.Vector3(0, -1, slope)
        .normalize()
        .applyQuaternion(lidQ);
      const upright = new THREE.Vector3(0, slope, 1)
        .normalize()
        .applyQuaternion(lidQ);
      const at = lp(s * 0.405, lidArch(t) - 0.065, z);
      b.part(new THREE.PlaneGeometry(0.23, 0.115), "#ffffff", {
        at,
        dir: outward,
        up: upright,
        axis: "z",
        texture: filigreeTexture,
        name: "lid corner gold scrollwork",
      });
    }
  }

  // Follow the barrel profile with a narrow inner gold frame.
  for (const s of [-1, 1]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A necklace drapes over the front rim, then curls across the coin spill.
  const necklacePath = catmull([
=======
  // Broad edge catches emphasize cut crystal without smoothing the facets.
  function gemEdgeCatch(
    center: number[],
    radius: number,
    height: number,
    rotation: number[],
    color: string,
  ) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2]),
      ),
    );
    const c = new THREE.Vector3(...center as [number, number, number]);
    const corner = (i: number, r: number, y: number) => {
      const a = i * Math.PI / 3 + Math.PI / 6;
      return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)
        .applyQuaternion(q)
        .add(c);
    };
    const topA = corner(0, radius * 0.52, height * 0.515);
    const topB = corner(1, radius * 0.52, height * 0.515);
    const shoulder = corner(0, radius * 1.005, height * 0.09);
    glow(b.rod(topA, topB, 0.0025, {
      color,
      sides: 4,
      name: "crystal table edge catch",
    }), 0.3);
    glow(b.rod(topA, shoulder, [0.0025, 0.001], {
      color,
      sides: 4,
      name: "crystal bevel edge catch",
    }), 0.3);
  }
  gemEdgeCatch([0.055, 1.065, -0.11], 0.143, 0.21,
    [10, 25, -12], "#baffdf");
  gemEdgeCatch([0.09, 0.344, 0.64], 0.145, 0.19,
    [0, 28, 0], "#ffc4d6");
  gemEdgeCatch([0.4, 0.241, 0.99], 0.102, 0.14,
    [0, -10, 0], "#c3f5ff");

  // A necklace drapes over the front rim, then curls across the coin spill.
  const necklacePath = catmull([
>>>>>>> REPLACE