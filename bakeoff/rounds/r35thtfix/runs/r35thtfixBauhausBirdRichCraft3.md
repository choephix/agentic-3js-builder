The errors come from nullable surface hits, unsupported `flat` sweep options, passing raw points where frames are required, and using the builder’s implicit root joint as an explicit parent.

```ts
<<<<<<< SEARCH
  const spine = b.chain("spine", spinePath, {
    names: ["body", "chest", "neckBase"],
=======
  const root = b.joint("root", {
    at: [0, 0.91, 0],
    role: "spine",
  });

  const spine = b.chain("spine", spinePath, {
    parent: root,
    names: ["body", "chest", "neckBase"],
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: neckBase,
=======
      parent: neckBase.name,
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: chest,
=======
      parent: chest.name,
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: body,
=======
      parent: body.name,
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: body,
      names: [`hip${label}`, `knee${label}`, `ankle${label}`],
=======
      parent: body.name,
      names: [`hip${label}`, `knee${label}`, `ankle${label}`],
>>>>>>> REPLACE
<<<<<<< SEARCH
          parent: foot,
=======
          parent: foot.name,
>>>>>>> REPLACE
<<<<<<< SEARCH
  const chestHit = bodySurface.nearest([0, 0.905, 0.344]);
=======
  const chestHit = bodySurface.nearest([0, 0.905, 0.344])!;
>>>>>>> REPLACE
<<<<<<< SEARCH
  const crown = headSurface.around(headCenter).at(0, 76);
=======
  const crown = headSurface.around(headCenter).at(0, 76)!;
>>>>>>> REPLACE
<<<<<<< SEARCH
      color: BLUE,
      flat: true,
      name: `wingMembrane${label}`,
=======
      color: BLUE,
      name: `wingMembrane${label}`,
>>>>>>> REPLACE
<<<<<<< SEARCH
        color: BLUE,
        section: { ngon: 7 },
        caps: "round",
        name: "tailTube",
=======
        color: BLUE,
        section: { ngon: 7 },
        caps: "round",
        name: "tailTube",
>>>>>>> REPLACE
<<<<<<< SEARCH
      [0, 1.045, -0.52],
      dir: [0, 0.2, -1],
=======
      [0, 1.045, -0.52],
      dir: [0, 0.2, -1],
>>>>>>> REPLACE
<<<<<<< SEARCH
    at: [0, 1.045, -0.52],
    dir: [0, 0.2, -1],
=======
    at: [0, 1.045, -0.52],
    dir: [0, 0.2, -1],
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.stick(
      new THREE.SphereGeometry(0.022, 6, 4),
      BLACK,
      [0, 1.285, 0.476],
      {
        bone: head,
=======
    b.stick(
      new THREE.SphereGeometry(0.022, 6, 4),
      BLACK,
      head.moved([0, 0.0, 0.0]).moved([0, 0.0, 0.0]),
      {
        bone: head,
>>>>>>> REPLACE
```