Cause: `CircleGeometrySafe` is a factory function, so `new` causes TS7009, and the second `b.part` argument was incorrectly receiving an options object as the colour.

```diff
<<<<<<< SEARCH
    b.part(new CircleGeometrySafe(0.19, WINDOW_LIGHT), {
      at: p.clone().addScaledVector(n, 0.052),
      dir: n,
      axis: "z",
      flat: true,
      name: "atticOculusGlass",
    } as any);
=======
    b.part(CircleGeometrySafe(0.19, WINDOW_LIGHT), WINDOW_LIGHT, {
      at: p.clone().addScaledVector(n, 0.052),
      dir: n,
      axis: "z",
      flat: true,
      name: "atticOculusGlass",
    });
>>>>>>> REPLACE
```