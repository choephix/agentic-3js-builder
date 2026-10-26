Cause: `b.surface()` does not accept a `Chain`; the neck surface query must target the neck’s built `Sweep`.

```text
<<<<<<< SEARCH
    b.sweep(n.chain, (t) => 0.18 - 0.065 * t, {
      bone: n.chain,
      color: COAT,
      sides: 8,
      sectors: [
        [-60, 60, COAT_LIGHT],
        [120, 240, BELLY],
      ],
      group: "necks",
      name: `neckSkin${hi}`,
    });

    const crown = sphere(b, 0.29, COAT, head.at, [1.0, 0.9, 1.12], head);
=======
    const neckSkin = b.sweep(n.chain, (t) => 0.18 - 0.065 * t, {
      bone: n.chain,
      color: COAT,
      sides: 8,
      sectors: [
        [-60, 60, COAT_LIGHT],
        [120, 240, BELLY],
      ],
      group: "necks",
      name: `neckSkin${hi}`,
    });

    const crown = sphere(b, 0.29, COAT, head.at, [1.0, 0.9, 1.12], head);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const neckSurface = b.surface(n.chain);
=======
    const neckSurface = b.surface(neckSkin);
>>>>>>> REPLACE
```