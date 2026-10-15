1. **Expose the braids.** Their thick inner cores currently bury the interwoven segments, making the signature beard read as three smooth tubes.
2. **Open the blunderbuss muzzle.** Solid barrel-band cylinders are blocking the bore. Replace them with open sleeves and deepen the dark interior.
3. **Calm the material noise.** Leather currently resembles bark and steel resembles marble. Broader, quieter shading will make the chunky forms and gold fittings much stronger.
4. **Give him a sterner face and readable heraldry.** Lower the inner brows and mount the shoulder emblems on substantial shield plates instead of letting them clip into the armor.
5. **Clear the nameplate.** Remove the foreground rock that obscures it.

<<<<<<< SEARCH
  const STEEL = metal("steel", { polish: 0.45, tarnish: 0.28, size: 0.11 });
  const IRON = metal("iron", { polish: 0.2, tarnish: 0.45 });
  const BRASS = metal("brass", { polish: 0.45, tarnish: 0.28, verdigris: 0.12 });
  const COPPER = metal("copper", { polish: 0.25, tarnish: 0.32 });
  const WOOD = grain("#5b301c", "#aa6235", { size: 0.013, axis: "z", seed: 18 });
  const LEATHER = grain("#493124", "#805333", { size: 0.018, seed: 7 });
  const HAIR = grain("#a84422", "#d77a31", { size: 0.012, seed: 8 });
  const HAIR_LIGHT = grain("#c5652a", "#eca047", { size: 0.01, seed: 8 });
  const STONE = mottle("#414d59", "#77808a", { size: 0.21, seed: 13 });
=======
  const STEEL = paint((p, n) => {
    const light = Math.max(0, n.dot(new THREE.Vector3(0.3, 0.8, 0.5)));
    return mix("#465464", "#c2d0d5",
      0.22 + light * 0.65 + (noise(p, 0.19, 11) - 0.5) * 0.1);
  });
  const IRON = paint((p, n) =>
    mix("#222b37", "#596879",
      0.24 + Math.max(0, n.y) * 0.4 + noise(p, 0.24, 15) * 0.12));
  const BRASS = paint((p, n) =>
    mix("#95632e", "#f2cd79",
      0.38 + Math.max(0, n.y) * 0.43 + noise(p, 0.16, 9) * 0.1));
  const COPPER = metal("copper", { polish: 0.25, tarnish: 0.16 });
  const WOOD = grain("#613921", "#845031", { size: 0.025, axis: "z", seed: 18 });
  const LEATHER = paint((p, n) =>
    mix("#493025", "#78503a",
      0.25 + Math.max(0, n.y) * 0.42 + noise(p, 0.12, 7) * 0.15));
  const HAIR = grain("#b54e24", "#c5622b", { size: 0.022, seed: 8 });
  const HAIR_LIGHT = grain("#d2752f", "#e18b39", { size: 0.022, seed: 8 });
  const STONE = mottle("#52616d", "#667580", { size: 0.34, seed: 13 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const x = Math.cos(a) * 1.06;
    const z = Math.sin(a) * 0.73;
    ell([x, 0.12, z], [0.2, 0.065, 0.13], STONE, root, [0, -a * 180 / Math.PI, 0]);
=======
    const x = Math.cos(a) * 1.06;
    const z = Math.sin(a) * 0.73;
    if (z > 0.62 && Math.abs(x) < 0.5) continue;
    ell([x, 0.12, z], [0.2, 0.065, 0.13], STONE, root, [0, -a * 180 / Math.PI, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    drawing([s * 0.458, 1.297, 0.228], 0.205, 0.22, ramTexture, shoulder);
    for (const dx of [-0.073, 0.073]) {
=======
    b.extrude(
      [[-0.108, 0.087], [0, 0.125], [0.108, 0.087],
       [0.096, -0.055], [0, -0.13], [-0.096, -0.055]],
      {
        at: [s * 0.458, 1.306, 0.249],
        x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.06, bevel: 0.006,
        color: BRASS, bone: shoulder,
        name: `ram_shield_${side}`,
      },
    );
    drawing([s * 0.458, 1.307, 0.283], 0.184, 0.213, ramTexture, shoulder);
    for (const dx of [-0.073, 0.073]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
        face.p([s * 0.035, 0.094, 0.206]),
        face.p([s * 0.104, 0.138, 0.212]),
        face.p([s * 0.192, 0.111, 0.165]),
=======
        face.p([s * 0.035, 0.079, 0.212]),
        face.p([s * 0.104, 0.119, 0.219]),
        face.p([s * 0.192, 0.133, 0.17]),
>>>>>>> REPLACE

<<<<<<< SEARCH
      [width * 0.7, width * 0.46],
      { color: C.beardDark, bone: jaw, sides: 6, caps: "flat" },
=======
      [width * 0.25, width * 0.18],
      { color: C.beardDark, bone: jaw, sides: 6, caps: "flat" },
>>>>>>> REPLACE

<<<<<<< SEARCH
          [x + side * width * 0.22 * taper, y, z + 0.021 + (i % 2 === 0 ? side : -side) * 0.006],
          [width * 0.43 * taper, pitch * 0.69, width * 0.37],
          (i + (side > 0 ? 1 : 0)) % 2 ? HAIR_LIGHT : HAIR,
          jaw, [0, 0, side * 36],
=======
          [
            x + side * width * 0.235 * taper,
            y + side * pitch * 0.12,
            z + 0.046 + (i % 2 === 0 ? side : -side) * 0.009,
          ],
          [width * 0.38 * taper, pitch * 0.68, width * 0.34],
          (i + (side > 0 ? 1 : 0)) % 2 ? HAIR_LIGHT : HAIR,
          jaw, [0, 0, side * 43],
>>>>>>> REPLACE

<<<<<<< SEARCH
    cylinder([x, bandY, z + 0.02], width * 0.68, 0.068, BRASS, jaw, [0, 1, 0], width * 0.68, 8);
    cylinder([x, bandY + 0.029, z + 0.02], width * 0.73, 0.012, C.goldLight, jaw, [0, 1, 0], width * 0.73, 8);
    cylinder([x, bandY - 0.029, z + 0.02], width * 0.73, 0.012, C.goldLight, jaw, [0, 1, 0], width * 0.73, 8);
    box([x, bandY, z + width * 0.7], [0.026, 0.035, 0.014], C.greenDark, jaw);
    b.spike([x, bottom - 0.015, z + 0.02], [0, -1, 0.13], 0.09, width * 0.48, {
=======
    cylinder([x, bandY, z + 0.04], width * 0.62, 0.068, BRASS, jaw, [0, 1, 0], width * 0.62, 8);
    cylinder([x, bandY + 0.029, z + 0.04], width * 0.68, 0.012, C.goldLight, jaw, [0, 1, 0], width * 0.68, 8);
    cylinder([x, bandY - 0.029, z + 0.04], width * 0.68, 0.012, C.goldLight, jaw, [0, 1, 0], width * 0.68, 8);
    drawing(
      [x, bandY, z + 0.043 + width * 0.68],
      width * 0.72, 0.047, runeTexture, jaw,
    );
    b.spike([x, bottom - 0.015, z + 0.04], [0, -1, 0.13], 0.09, width * 0.48, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CircleGeometry(0.112, 12), "#171d25", {
    at: gp([0, 0.072, 0.515]), dir: gd([0, 0, 1]), axis: "z", bone: gunBone,
  });
=======
  b.part(new THREE.CircleGeometry(0.089, 12), "#101822", {
    at: gp([0, 0.072, 0.41]), dir: gd([0, 0, 1]), axis: "z", bone: gunBone,
  });
  b.lathe(
    [[0.09, 0.43], [0.13, 0.57], [0.153, 0.651],
     [0.157, 0.67], [0.151, 0.67], [0.126, 0.57], [0.086, 0.43]],
    {
      at: gp([0, 0.072, 0]),
      axis: gd([0, 0, 1]), segments: 12,
      color: IRON, bone: gunBone,
      name: "soot_darkened_inner_bore",
    },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(band.r, band.r, band.w, 12, 1), BRASS, {
      at: gp([0, 0.072, band.z]), dir: gd([0, 0, 1]), bone: gunBone, flat: true,
    });
=======
    b.lathe(
      [
        [band.r - 0.009, -band.w / 2],
        [band.r + 0.005, -band.w / 2],
        [band.r + 0.005, band.w / 2],
        [band.r - 0.009, band.w / 2],
      ],
      {
        at: gp([0, 0.072, band.z]),
        axis: gd([0, 0, 1]), segments: 12,
        color: BRASS, bone: gunBone,
      },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(gp([0, -0.137, -0.485]), [0.155, 0.195, 0.041], IRON, gunBone);
=======
  b.part(new THREE.BoxGeometry(0.155, 0.195, 0.041), IRON, {
    at: gp([0, -0.137, -0.485]), quat: gun.q(), bone: gunBone,
  });
>>>>>>> REPLACE