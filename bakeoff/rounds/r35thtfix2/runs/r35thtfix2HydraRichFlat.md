Cause: `chain.tip` is nullable, and `stick()` cannot accept a plain `Vector3` returned by `joint.local()`; use a guaranteed joint for `bone` and `part()` for explicit positions.

```ts
<<<<<<< SEARCH
    b.part(sphere(0.17, 8, 5), COAT_DARK, {
      bone: leg.chain.tip,
      at: paw.at,
      scale: [1.15, 0.72, 1.28],
      name: `paw${leg.label}`,
      group: "legs",
    });
=======
    b.part(sphere(0.17, 8, 5), COAT_DARK, {
      bone: leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1],
      at: paw.at,
      scale: [1.15, 0.72, 1.28],
      name: `paw${leg.label}`,
      group: "legs",
    });
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.stick(
        sphere(0.038, 6, 4),
        ARMOR_LIGHT,
        h.local({
          left: side * 0.285,
          up: -0.04,
          forward: 0.255,
        }),
        {
          embed: 0.25,
          bone: h,
          name: `jawHinge${neck.key}${side}`,
          group: "armor",
        },
      );
=======
      b.part(sphere(0.038, 6, 4), ARMOR_LIGHT, {
        bone: h,
        at: h.local({
          left: side * 0.285,
          up: -0.04,
          forward: 0.255,
        }),
        name: `jawHinge${neck.key}${side}`,
        group: "armor",
      });
>>>>>>> REPLACE
```