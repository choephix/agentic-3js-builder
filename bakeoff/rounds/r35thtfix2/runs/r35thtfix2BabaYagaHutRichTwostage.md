The errors come from narrow literal inference in helper/loop colour values, nullable chain tips, passing `ColorInput` where the builder requires `Fill`, unsupported `flat` options, and an invalid overload for tapered spur rods.

```text
<<<<<<< SEARCH
const addBox = (
    size: [number, number, number],
    color: ColorInput,
=======
const addBox = (
    size: [number, number, number],
    color: Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const addCylinder = (
    radius: number,
    height: number,
    color: ColorInput,
=======
  const addCylinder = (
    radius: number,
    height: number,
    color: Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const addRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: ColorInput,
=======
  const addRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const addTriangle = (
    outline: [number, number][],
    at: [number, number, number],
    color: ColorInput,
=======
  const addTriangle = (
    outline: [number, number][],
    at: [number, number, number],
    color: Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: PALETTE.cream,
=======
      color: PALETTE.cream as Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
          color: PALETTE.red,
=======
          color: PALETTE.red as Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
          color: PALETTE.cream,
=======
          color: PALETTE.cream as Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
      polyline([legL.tip.at, spec.midL, spec.tipL]),
=======
      polyline([legL.tip!.at, spec.midL, spec.tipL]),
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: legL.tip,
=======
        parent: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      polyline([legR.tip.at, spec.midR, spec.tipR]),
=======
      polyline([legR.tip!.at, spec.midR, spec.tipR]),
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: legR.tip,
=======
        parent: legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      const actualToe = side === "L" ? toeChainsL[i] : toeChainsR[i];

      b.sweep(actualToe, [0.048, 0.017], {
=======
      const actualToe = side === "L" ? toeChainsL[i] : toeChainsR[i];

      b.sweep(actualToe, [0.048, 0.017], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: leg.tip.at,
=======
      at: leg.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.tip,
=======
      bone: leg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name: "s26_broomHandle",
=======
      name: "s26_broomHandle",
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name,
      group: "herb-leaves",
=======
      name,
      group: "herb-leaves",
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name,
        group: "stage2",
=======
        name,
        group: "stage2",
>>>>>>> REPLACE

<<<<<<< SEARCH
        [0.017, 0.006],
=======
        0.017,
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name,
      group: GROUP,
=======
      name,
      group: GROUP,
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name,
      group: GROUP,
    });
=======
      name,
      group: GROUP,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name,
      group: "stage2",
=======
      name,
      group: "stage2",
>>>>>>> REPLACE
```