Cause: the paint callbacks inferred `string` variables even though `mix()` returns `Rgb`; two option objects also used unsupported fields, and the blade outline self-intersects at its tip closure.

<<<<<<< SEARCH
  let color = n.z > 0.4 ? STEEL : EDGE;
=======
  let color: any = n.z > 0.4 ? STEEL : EDGE;
>>>>>>> REPLACE

<<<<<<< SEARCH
  let color = NAVY_DARK;
=======
  let color: any = NAVY_DARK;
>>>>>>> REPLACE

<<<<<<< SEARCH
  let color = band % 3 === 0 ? LEATHER_DARK : LEATHER;
=======
  let color: any = band % 3 === 0 ? LEATHER_DARK : LEATHER;
>>>>>>> REPLACE

<<<<<<< SEARCH
  let color = n.y > 0.2 ? GOLD_LIGHT : BRONZE;
=======
  let color: any = n.y > 0.2 ? GOLD_LIGHT : BRONZE;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bladeOutline: [number, number][] = [
    [-0.105, 0.91],
    [0.09, 0.91],
    [0.145, 1.25],
    [0.19, 2.24],
    [0.145, 2.53],
    [0.065, 2.76],
    [0.0, 2.94],
    [-0.07, 2.79],
    [-0.16, 2.51],
    [-0.205, 2.18],
    [-0.17, 1.28],
  ];
=======
  const bladeOutline: [number, number][] = [
    [-0.105, 0.91],
    [0.09, 0.91],
    [0.145, 1.25],
    [0.19, 2.24],
    [0.145, 2.53],
    [0.065, 2.76],
    [0.0, 2.94],
    [-0.07, 2.79],
    [-0.16, 2.51],
    [-0.205, 2.18],
    [-0.17, 1.28],
    [-0.125, 1.08],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
    at,
    color,
    name,
=======
    at,
    name,
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: NAVY_DARK,
        name: `s26GuardInset${prefix}`,
        flat: true,
=======
        color: NAVY_DARK,
        name: `s26GuardInset${prefix}`,
>>>>>>> REPLACE