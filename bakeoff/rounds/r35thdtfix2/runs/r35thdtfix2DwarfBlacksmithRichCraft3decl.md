The compile error comes from radius/shift callbacks being inferred as `number[]` instead of SDK tuple radii, and `glow()` rejects painted parts; use explicit readonly tuples and a flat coal colour.

```ts
<<<<<<< SEARCH
    (t) => [0.27 - 0.035 * t, 0.23 - 0.018 * t],
=======
    (t): readonly [number, number] => [0.27 - 0.035 * t, 0.23 - 0.018 * t],
>>>>>>> REPLACE
<<<<<<< SEARCH
      shift: () => [0, -0.012],
=======
      shift: (): readonly [number, number] => [0, -0.012],
>>>>>>> REPLACE
<<<<<<< SEARCH
    (t) => [0.19 - 0.025 * t, 0.18],
=======
    (t): readonly [number, number] => [0.19 - 0.025 * t, 0.18],
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.sweep(leg, (t) => [0.105 - 0.03 * t, 0.095 - 0.025 * t], {
=======
    b.sweep(leg, (t): readonly [number, number] => [0.105 - 0.03 * t, 0.095 - 0.025 * t], {
>>>>>>> REPLACE
<<<<<<< SEARCH
      (t) => [0.19 - 0.15 * t, 0.15 - 0.115 * t],
=======
      (t): readonly [number, number] => [0.19 - 0.15 * t, 0.15 - 0.115 * t],
>>>>>>> REPLACE
<<<<<<< SEARCH
      0.055,
      COAL,
      p,
=======
      0.055,
      "#38232c",
      p,
>>>>>>> REPLACE
```