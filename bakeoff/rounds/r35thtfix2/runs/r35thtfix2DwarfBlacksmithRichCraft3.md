Cause: `base.x/y/z` on array coordinates collapsed tassel endpoints to the same point, while `rightArm.tip` is nullable and must be narrowed before passing it as a bone.

<<<<<<< SEARCH
    const top = new THREE.Vector3(base.x + x, base.y - 0.015, base.z);
    const bottom = new THREE.Vector3(base.x + x * 1.35, base.y - 0.105 - (i % 2) * 0.012, base.z + 0.012);
=======
    const top = new THREE.Vector3(base[0] + x, base[1] - 0.015, base[2]);
    const bottom = new THREE.Vector3(
      base[0] + x * 1.35,
      base[1] - 0.105 - (i % 2) * 0.012,
      base[2] + 0.012,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hammerBone = rightArm.tip;
=======
  const hammerBone = rightArm.tip!;
>>>>>>> REPLACE