`glow()` requires flat colour strings or textures, but `magatamaJewel` and `hoshinotamaRingA` were built using the `cel()` paint `GOLD_METAL`.

## Edits

<<<<<<< SEARCH
  const magatamaJewel = b.extrude(magatamaOutline, {
    at: [0, 0.54, 0.53],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    color: GOLD_METAL,
    bone: chest,
    name: "magatamaJewel",
  });
  glow(magatamaJewel, 1.3);
=======
  const magatamaJewel = b.extrude(magatamaOutline, {
    at: [0, 0.54, 0.53],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    color: "#ffd13b",
    bone: chest,
    name: "magatamaJewel",
  });
  glow(magatamaJewel, 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const ringA = b.part(new THREE.TorusGeometry(0.065, 0.004, 6, 24), GOLD_METAL, {
    at: starBallPos,
    dir: [0, 1, 0],
    bone: chest,
    name: "hoshinotamaRingA",
  });
  glow(ringA, 1.6);
=======
  const ringA = b.part(new THREE.TorusGeometry(0.065, 0.004, 6, 24), "#ffd13b", {
    at: starBallPos,
    dir: [0, 1, 0],
    bone: chest,
    name: "hoshinotamaRingA",
  });
  glow(ringA, 1.6);
>>>>>>> REPLACE