The errors come from nullable chain tips/bones being passed where the SDK requires definite joint references, a `stick` call receiving a plain vector instead of a frame, and outline tuples missing the required `"sharp"` marker.

```ts
<<<<<<< SEARCH
      parent: body.tip,
=======
      parent: body.joints[4],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: l.chain.tip,
=======
      bone: l.chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: l.chain.tip,
=======
      bone: l.chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: wing.upper.at(t).bone,
=======
      bone: wing.upper.at(t).bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [-0.19, 0],
      [0.19, 0],
      [0.15, 0.22],
      [0.09, 0.46, "sharp"],
      [0, 0.56, "sharp"],
      [-0.09, 0.46, "sharp"],
      [-0.15, 0.22],
=======
      [-0.19, 0, "sharp"],
      [0.19, 0, "sharp"],
      [0.15, 0.22, "sharp"],
      [0.09, 0.46, "sharp"],
      [0, 0.56, "sharp"],
      [-0.09, 0.46, "sharp"],
      [-0.15, 0.22, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: body.tip,
=======
      bone: body.joints[4],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.stick(
    new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10),
    SUN,
    head.local({ forward: 0.045, up: 0.16 }),
    { spin: 0, name: "forehead sun medallion" },
  );
=======
  b.part(
    new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10),
    SUN,
    {
      bone: head,
      at: head.local({ forward: 0.045, up: 0.16 }),
      dir: [0, 0, 1],
      name: "forehead sun medallion",
    },
  );
>>>>>>> REPLACE
```