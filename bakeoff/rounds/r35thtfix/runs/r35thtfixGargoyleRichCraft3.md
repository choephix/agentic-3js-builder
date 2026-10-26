The errors come from nullable chain tips being used as bones/points, invalid `rod` overload arguments, and a function-valued `b.membrane` being tested instead of called; the runtime failure is `chain.tip === null` in `clawedDigits`.

```ts
<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: leg.tip,
      scale: [1.35, 0.7, 1.4],
      bone: leg.tip,
=======
      at: leg.at(1),
      scale: [1.35, 0.7, 1.4],
      bone: leg.joints[leg.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: arm.tip,
      scale: [1.22, 0.75, 1.2],
      bone: arm.tip,
=======
      at: arm.at(1),
      scale: [1.22, 0.75, 1.2],
      bone: arm.joints[arm.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.rod(
        [s * (0.13 + i * 0.018), y, 0.255],
        [s * (0.28 + i * 0.024), y + 0.015, 0.22],
        0.014,
        {
          color: STONE_DARK,
          bone: spine.joints[2],
          name: `ribGroove${s > 0 ? "L" : "R"}${i}`,
        },
      );
=======
      b.rod(
        [s * (0.13 + i * 0.018), y, 0.255],
        [s * (0.28 + i * 0.024), y + 0.015, 0.22],
        0.014,
        STONE_DARK,
        {
          bone: spine.joints[2],
          name: `ribGroove${s > 0 ? "L" : "R"}${i}`,
        },
      );
>>>>>>> REPLACE

<<<<<<< SEARCH
        const wingMark = b.decal(b.membrane ? b.root : b.root, WING_CARVING, {
=======
        const wingMark = b.decal(b.root, WING_CARVING, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.rod(
      [s * 0.085, 1.86, 0.585],
      [s * 0.155, 1.875, 0.62],
      0.023,
      {
        color: STONE_DARK,
        bone: head,
        name: `browRidge${s > 0 ? "L" : "R"}`,
      },
    );
=======
      b.rod(
        [s * 0.085, 1.86, 0.585],
        [s * 0.155, 1.875, 0.62],
        0.023,
        STONE_DARK,
        {
          bone: head,
          name: `browRidge${s > 0 ? "L" : "R"}`,
        },
      );
>>>>>>> REPLACE
```