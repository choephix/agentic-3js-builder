Cause: `Chain`/nullable bone handles were being passed where the SDK requires a resolvable joint reference; use joint names for chain parents and assert non-null foot bones.

```ts
<<<<<<< SEARCH
    parent: spine,
    names: ["tailBase", "tail2", "tail3", "tail4", "tailTip"],
=======
    parent: "pelvis",
    names: ["tailBase", "tail2", "tail3", "tail4", "tailTip"],
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: z < 0 ? spine : spine,
        names:
=======
        parent: "shoulder",
        names:
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: spine,
        names: [`neck${i + 1}Base`, `neck${i + 1}Mid`, `neck${i + 1}Tip`],
=======
        parent: "sternum",
        names: [`neck${i + 1}Base`, `neck${i + 1}Mid`, `neck${i + 1}Tip`],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const foot = leg.at(1);
    sphere(b, 0.105, SCALE, foot.at, foot.bone, [1.25, 0.6, 1.5], `foot ${i}`);
=======
    const foot = leg.at(1);
    sphere(b, 0.105, SCALE, foot.at, foot.bone!, [1.25, 0.6, 1.5], `foot ${i}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
      claw(b, base, tip, 0.027, foot.bone, `talon ${i}-${t}`);
=======
      claw(b, base, tip, 0.027, foot.bone!, `talon ${i}-${t}`);
>>>>>>> REPLACE
```