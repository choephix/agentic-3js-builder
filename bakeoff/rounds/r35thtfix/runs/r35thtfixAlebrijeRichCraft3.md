Cause: nullable chain tips/bone handles were passed where the SDK requires an optional reference, the talon decal targeted an empty `Object3D`, and `b.along` callbacks accept only one frame parameter.

```text
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const pawAt = leg.tip.at;
    sphere(
=======
    const paw = sphere(
      front ? CREAM : GOLD,
      leg.tip!.at,
      [0.13, 0.095, 0.16],
      leg.tip!,
      `${legInfo.name}-paw`,
      9,
      6,
    );
    const pawAt = leg.tip!.at;
    /*
    sphere(
>>>>>>> REPLACE

<<<<<<< SEARCH
      `${legInfo.name}-paw`,
      9,
      6,
    );

    // A bright cuff is a classic alebrije paint band.
=======
      `${legInfo.name}-paw`,
      9,
      6,
    );
    */

    // A bright cuff is a classic alebrije paint band.
>>>>>>> REPLACE

<<<<<<< SEARCH
        new THREE.Object3D(),
=======
        paw,
>>>>>>> REPLACE

<<<<<<< SEARCH
          bone: leg.tip,
=======
          bone: leg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: rootFrame.bone ?? wing.joints[Math.min(i + 1, wing.joints.length - 1)],
=======
      bone: rootFrame.bone ?? wing.joints[Math.min(i + 1, wing.joints.length - 1)] ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(body, 8, (at, i) =>
    b.spike(at, at, 0.075 + 0.025 * Math.sin(i), 0.025, {
      color: i % 2 ? MAGENTA : GOLD,
      name: `back-ridge-${i}`,
      group: "body",
    }),
  );
=======
  b.along(body, 8, (at) =>
    b.spike(at, at, 0.085, 0.025, {
      color: GOLD,
      name: "back-ridge",
      group: "body",
    }),
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(tailSweep, 6, (at, i) =>
    b.spike(at, at, 0.065 - i * 0.006, 0.018, {
      color: i % 2 ? GOLD : TURQUOISE,
      name: `tail-ridge-${i}`,
      group: "tail",
    }),
  );
=======
  b.along(tailSweep, 6, (at) =>
    b.spike(at, at, 0.055, 0.018, {
      color: TURQUOISE,
      name: "tail-ridge",
      group: "tail",
    }),
  );
>>>>>>> REPLACE
```