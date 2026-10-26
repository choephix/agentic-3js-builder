The toes-back step uses `bone = \`leg${side}\``, but `legL` and `legR` are chain names, and the joints are named `hipL`, `kneeL` and `footL`. The fix is to use the foot joint, `foot${side}`, instead.

<<<<<<< SEARCH
    const bone = `leg${side}`;
    const foot = new THREE.Vector3(s * 0.46, 0.04, -0.24);
=======
    const bone = `foot${side}`;
    const foot = new THREE.Vector3(s * 0.46, 0.04, -0.24);
>>>>>>> REPLACE