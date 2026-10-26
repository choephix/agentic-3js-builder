Cause: `bladeLeftShadow` has a self-intersecting seven-point outline; its closing edge `6→0` crosses edge `1→2`.

```ts
<<<<<<< SEARCH
  const bladeShadowOutline: [number, number][] = [
    [-0.17, 1.32],
    [-0.125, 1.42],
    [-0.15, 2.16],
    [-0.102, 2.44],
    [-0.055, 2.65],
    [-0.095, 2.4],
    [-0.145, 2.13],
  ];
=======
  const bladeShadowOutline: [number, number][] = [
    [-0.17, 1.32],
    [-0.125, 1.42],
    [-0.15, 2.16],
    [-0.102, 2.44],
    [-0.055, 2.65],
    [-0.095, 2.4],
    [-0.145, 2.13],
    [-0.155, 1.62],
  ];
>>>>>>> REPLACE
```