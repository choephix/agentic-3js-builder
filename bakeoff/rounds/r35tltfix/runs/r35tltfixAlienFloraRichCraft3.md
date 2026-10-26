Cause: the module used unsupported `ExtrudeOptions.scale`, indexed `Vector3`s like tuples, passed nullable joints as bones, and built a leaf curve with coincident/degenerate Catmull points.

```ts
<<<<<<< SEARCH
    const p = b.extrude(leafOutline, {
=======
    const p = b.extrude(
      leafOutline.map((q) => [q[0] * width, q[1] * height, q[2]] as [number, number, "sharp"]),
      {
>>>>>>> REPLACE

<<<<<<< SEARCH
      thickness: 0.012,
      bevel: 0.006,
      smoothing: 1,
      color: leafPaint,
      bone: root,
      scale: [width, height, 1],
      group: "leaves",
      name: "luminous_leaf",
    });
=======
        thickness: 0.012,
        bevel: 0.006,
        smoothing: 1,
        color: leafPaint,
        bone: root,
        group: "leaves",
        name: "luminous_leaf",
      },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const vein = b.sweep(catmull([at, at.clone().addScaledVector(y, height * 0.32), tip]), 0.009, {
=======
    const vein = b.sweep(
      catmull([
        at,
        at.clone().addScaledVector(y, height * 0.32),
        tip.clone().addScaledVector(y, 0.001),
      ]),
      0.009,
      {
>>>>>>> REPLACE

<<<<<<< SEARCH
      caps: "round",
    });
=======
        caps: "round",
      },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const start = at.clone().addScaledVector(y, height * 0.28).addScaledVector(x, q * width * 0.02);
    const end = at.clone().addScaledVector(y, height * 0.48).addScaledVector(x, q * width * 0.30);
=======
      const start = at.clone().addScaledVector(y, height * 0.28).addScaledVector(x, q * width * 0.02);
      const end = at.clone().addScaledVector(y, height * 0.48).addScaledVector(x, q * width * 0.30);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod(start, end, 0.004, { color: BLUE });
=======
      b.rod(start, end, 0.004, { color: BLUE });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const crown = trunk.tip.at;
=======
  const crownJoint = trunk.tip!;
  const crown = crownJoint.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: crownJoint,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: trunk.at(t).bone,
=======
        bone: trunk.at(t).bone!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: crownJoint,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const p = catmull([
      base,
      [tip[0] * 0.32, tip[1] - 0.08, tip[2]],
      [tip[0] * 0.72, tip[1] - 0.015, tip[2] + 0.04],
      d.tip,
    ]);
=======
    const p = catmull([
      base,
      [tip[0] * 0.32, tip[1] - 0.08, tip[2]],
      [tip[0] * 0.72, tip[1] - 0.015, tip[2] + 0.04],
      [tip[0], tip[1], tip[2] + 0.001],
    ]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const p = branchEnds[i];
    const side = i % 2 === 0 ? 1 : -1;
    leaf(new THREE.Vector3(p[0], p[1], p[2]), 0.24, 0.68, side * 0.45, side);
    leaf(
      new THREE.Vector3(p[0] * 0.82, p[1] + 0.035, p[2] + 0.02),
=======
    const p = branchEnds[i];
    const side = i % 2 === 0 ? 1 : -1;
    leaf(new THREE.Vector3(p.x, p.y, p.z), 0.24, 0.68, side * 0.45, side);
    leaf(
      new THREE.Vector3(p.x * 0.82, p.y + 0.035, p.z + 0.02),
>>>>>>> REPLACE
```