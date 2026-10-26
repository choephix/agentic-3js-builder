Cause: `trunk.tip` is nullable because the chain has no explicit tip joint; use the last chain joint and pass that non-null joint as the bone.

```text
<<<<<<< SEARCH
  const crownJoint = trunk.tip!;
  const crown = crownJoint.at;
=======
  const crownJoint = trunk.joints[trunk.joints.length - 1];
  const crown = crownJoint.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: crown.clone().add(new THREE.Vector3(0, 0.07, 0)),
      bone: trunk.tip,
      name: "flower_core",
=======
      at: crown.clone().add(new THREE.Vector3(0, 0.07, 0)),
      bone: crownJoint,
      name: "flower_core",
>>>>>>> REPLACE

<<<<<<< SEARCH
      texture: glowDisc,
      bone: trunk.tip,
      rotation: [0, (i * 37) % 360, 0],
=======
      texture: glowDisc,
      bone: crownJoint,
      rotation: [0, (i * 37) % 360, 0],
>>>>>>> REPLACE```