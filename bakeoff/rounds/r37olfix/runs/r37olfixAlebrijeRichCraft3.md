The errors come from nullable `.tip` handles, passing `null` as a bone/parent, and querying a `Chain` directly as a surface target; use guaranteed chain joints and retain the neck sweep for surface queries.

```ts
<<<<<<< SEARCH
  b.sweep(neck, [0.16, 0.12], {
    color: stripePaint,
    section: { ngon: 8 },
    name: "striped-eagle-neck",
  });
=======
  const neckTube = b.sweep(neck, [0.16, 0.12], {
    color: stripePaint,
    section: { ngon: 8 },
    name: "striped-eagle-neck",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      { bone: chain.tip, at: legTargets[i], scale: [1.15, 0.55, 1.25], flat: true, name: `paw-${i}` },
=======
      {
        bone: chain.joints[chain.joints.length - 1],
        at: legTargets[i],
        scale: [1.15, 0.55, 1.25],
        flat: true,
        name: `paw-${i}`,
      },
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: wing.tip,
=======
      parent: wing.joints[wing.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = b.surface(neck).loop(neck.joints[0], { lift: 0.012 });
=======
  const collar = b.surface(neckTube).loop(neck.joints[0], { lift: 0.012 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.tip,
=======
      bone: tail.joints[tail.joints.length - 1],
>>>>>>> REPLACE
```