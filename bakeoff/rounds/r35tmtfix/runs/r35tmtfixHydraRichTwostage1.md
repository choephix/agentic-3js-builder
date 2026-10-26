Cause: the rear legs used the same `frontL`/`frontR` joint names, and the neck sweep incorrectly supplied nullable parent-joint references as explicit bones.

```ts
<<<<<<< SEARCH
    ["L", 1, 0.43, -0.38],
    ["R", -1, 0.43, -0.38],
=======
    ["L", 1, -0.38, -0.45],
    ["R", -1, -0.38, -0.45],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const neck = (torso as any).joints
      ? undefined
      : undefined;
    // Locate the already-created chain through its public root hierarchy by using the named head bone.
    const head = heads[headSpecs.indexOf(s)];
    b.sweep(
=======
    const head = heads[headSpecs.indexOf(s)];
    b.sweep(
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: PALETTE.hideLight, bone: head.parent?.userData?.joint ?? head, section: "box", name: `${neckName}Armor` },
=======
      { color: PALETTE.hideLight, section: "box", name: `${neckName}Armor` },
>>>>>>> REPLACE
```