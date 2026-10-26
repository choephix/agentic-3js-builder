Cause: the ice-chunk loop destructured each 3-number point as `[i, p]`, passing the scalar `p` to `at`; the fuel loop also cast a plain number array to tuple pairs.

```ts
<<<<<<< SEARCH
  for (const [i, p] of [
    [-2.65, 0.35, 0.6],
    [2.8, 0.32, 0.55],
    [-2.95, 0.3, -0.5],
    [2.45, 0.3, 2.3],
  ] as Array<[number, number, number]>) {
    b.part(new THREE.DodecahedronGeometry(0.22, 0), ICE_BLUE(), {
      at: p,
      name: `iceChunk${p[0]}${p[2]}`,
      group: "terrain",
    });
  }
=======
  for (const [x, y, z] of [
    [-2.65, 0.35, 0.6],
    [2.8, 0.32, 0.55],
    [-2.95, 0.3, -0.5],
    [2.45, 0.3, 2.3],
  ] as Array<[number, number, number]>) {
    b.part(new THREE.DodecahedronGeometry(0.22, 0), ICE_BLUE(), {
      at: [x, y, z],
      name: `iceChunk${x}${z}`,
      group: "terrain",
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [i, x] of [-1.15, -0.75, 2.35] as Array<[number, number]>) {
    cyl(`fuelDrum${i}`, 0.19, 0.54, [x, 0.51, 1.7], i === 2 ? YELLOW : ORANGE, 10);
    cyl(`fuelCap${i}`, 0.1, 0.025, [x, 0.8, 1.7], BLACK, 8);
    box(`fuelBand${i}`, [0.4, 0.055, 0.045], [x, 0.58, 1.7], BLACK, { group: "supplies" });
  }
=======
  for (const [i, x] of [
    [0, -1.15],
    [1, -0.75],
    [2, 2.35],
  ] as Array<[number, number]>) {
    cyl(`fuelDrum${i}`, 0.19, 0.54, [x, 0.51, 1.7], i === 2 ? YELLOW : ORANGE, 10);
    cyl(`fuelCap${i}`, 0.1, 0.025, [x, 0.8, 1.7], BLACK, 8);
    box(`fuelBand${i}`, [0.4, 0.055, 0.045], [x, 0.58, 1.7], BLACK, { group: "supplies" });
  }
>>>>>>> REPLACE
```