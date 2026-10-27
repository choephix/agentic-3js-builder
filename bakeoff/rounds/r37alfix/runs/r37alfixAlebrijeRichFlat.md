Cause: nullable chain tips were passed where the SDK requires a definite `JointRef`, and several `Vector3` values were indexed like tuples; the neck surface must target its sweep, while `part` positions must use `Vector3` components.

```ts
<<<<<<< SEARCH
      parent: spine.joints[leg.z > 0 ? 2 : 0],
=======
      parent: spine.joints[leg.z > 0 ? 2 : 0]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg.chain, (t) => 0.115 - t * 0.035, {
=======
    b.sweep(leg.chain, (t) => 0.115 - t * 0.035, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.chain.tip,
=======
      bone: leg.chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        { color: CREAM, bone: leg.chain.tip, name: `${leg.name}Claw${i}` },
=======
        { color: CREAM, bone: leg.chain.tip!, name: `${leg.name}Claw${i}` },
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [e[0] + (i - 1) * 0.055, 0.158, e[2] + 0.02],
=======
        at: [e.x + (i - 1) * 0.055, 0.158, e.z + 0.02],
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [end[0], 0.105, end[2] + 0.025],
=======
      at: [end.x, 0.105, end.z + 0.025],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [end[0] + i * 0.055, 0.11, end[2] + 0.12],
=======
        [end.x + i * 0.055, 0.11, end.z + 0.12],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = b.surface(neck);
=======
  const neckTube = b.sweep(neck, [0.20, 0.16], {
    color: furEdge(coat, cream, {
      level: -0.15,
      teeth: 0.18,
      period: 0.08,
      ink: INK,
    }),
    sides: 8,
    name: "stripedNeck",
  });
  const collar = b.surface(neckTube);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(neck, [0.20, 0.16], {
    color: furEdge(coat, cream, {
      level: -0.15,
      teeth: 0.18,
      period: 0.08,
      ink: INK,
    }),
    sides: 8,
    name: "stripedNeck",
  });
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: w.joints[Math.min(i, w.joints.length - 1)],
=======
      bone: w.joints[Math.min(i, w.joints.length - 1)]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [leg.s * 0.38, 0.13, leg.z + (leg.z > 0 ? 0.11 : -0.10)] as [
        number,
        number,
        number
      ],
=======
      at: new THREE.Vector3(
        leg.s * 0.38,
        0.13,
        leg.z + (leg.z > 0 ? 0.11 : -0.10),
      ),
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: root,
=======
      at: new THREE.Vector3(root[0], root[1], root[2]),
>>>>>>> REPLACE
```