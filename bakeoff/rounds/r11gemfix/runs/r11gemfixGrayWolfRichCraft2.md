`spineChain.tip` and `neckChain.tip` were `null` because providing 2 names for a 2-span chain names only the span joints; providing a 3rd name creates the chain's tip joint.

```ts
<<<<<<< SEARCH
  // Spine & Chest
  const spineChain = b.chain(
    "spine",
    catmull([
      [0, 0.74, -0.22],
      [0, 0.8, 0.04],
      [0, 0.9, 0.32],
    ]),
    {
      parent: hips,
      role: "spine",
      count: 2,
      names: ["spineMid", "chestJoint"],
    },
  );
  const chest = spineChain.tip!;

  // Neck
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.32],
      [0, 1.0, 0.54],
      [0, 1.12, 0.74],
    ]),
    {
      parent: chest,
      role: "neck",
      count: 2,
      names: ["neckBase", "neckTop"],
    },
  );
  const neckTop = neckChain.tip!;
=======
  // Spine & Chest
  const spineChain = b.chain(
    "spine",
    catmull([
      [0, 0.74, -0.22],
      [0, 0.8, 0.04],
      [0, 0.9, 0.32],
    ]),
    {
      parent: hips,
      role: "spine",
      names: ["spineBase", "spineMid", "chest"],
    },
  );
  const chest = spineChain.tip!;

  // Neck
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.32],
      [0, 1.0, 0.54],
      [0, 1.12, 0.74],
    ]),
    {
      parent: chest,
      role: "neck",
      names: ["neckBase", "neckMid", "neckTop"],
    },
  );
  const neckTop = neckChain.tip!;
>>>>>>> REPLACE
```