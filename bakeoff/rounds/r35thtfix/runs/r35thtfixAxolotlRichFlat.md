The errors come from passing `at`/`dir`/`axis` as a `stick()` surface frame and using an array where `stick()` expects its scale transform callback; use `b.part()` for literal-position spots instead.

```ts
<<<<<<< SEARCH
    b.stick(
      new THREE.SphereGeometry(0.019, 7, 5),
      GILL_LIGHT,
      {
        at: spotAt,
        dir: [0, 1, 0],
        axis: "y",
        bone: tail.at(t).bone,
        embed: 0.2,
        name: `tailFinSpot${i}`,
      },
    );
=======
    const tailFinSpot = new THREE.SphereGeometry(0.019, 7, 5);
    tailFinSpot.scale(1, 0.24, 1);
    b.part(tailFinSpot, GILL_LIGHT, {
      at: spotAt,
      bone: tail.at(t).bone,
      name: `tailFinSpot${i}`,
    });
>>>>>>> REPLACE
```