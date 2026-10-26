Cause: `b.part` receives the color as its second argument, while the blade outline contains a self-intersecting concave path.

```ts
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
    [-0.125, 1.08],
  ];
=======
  const bladeOutline: [number, number][] = [
    [-0.105, 0.91],
    [0.09, 0.91],
    [0.145, 1.25],
    [0.19, 2.24],
    [0.12, 2.52],
    [0.0, 2.94],
    [-0.12, 2.52],
    [-0.205, 2.18],
    [-0.17, 1.28],
    [-0.125, 1.08],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(geometry, color, {
      at,
      color,
      name,
      ...options,
    });
=======
    b.part(geometry, color, {
      at,
      name,
      ...options,
    });
>>>>>>> REPLACE
```