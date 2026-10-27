Cause: `tip` is nullable in the SDK, and `surface()` accepts a built Sweep or Joint—not a Chain.

```ts
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const head = b.joint(`${d.name}Head`, { parent: neck.tip, at: skull, dir: [0, 0.02, 1], role: "head" });
=======
    const head = b.joint(`${d.name}Head`, { parent: neck.tip!, at: skull, dir: [0, 0.02, 1], role: "head" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const n of necks) {
    b.sweep(n.chain, (t) => 0.18 - t * 0.065, {
      bone: n.chain,
      color: COAT,
      section: { ngon: 7 },
      sides: 7,
      name: "heavy neck",
    });
  }
=======
  for (const n of necks) {
    b.sweep(n.chain, (t) => 0.18 - t * 0.065, {
      bone: n.chain,
      color: COAT,
      section: { ngon: 7 },
      sides: 7,
      name: "heavy neck",
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    const loop = b.surface(n.chain).loop(n.chain.joints[0], { lift: 0.008 });
=======
    const loop = b.surface(n.chain.joints).loop(n.chain.joints[0], { lift: 0.008 });
>>>>>>> REPLACE
```