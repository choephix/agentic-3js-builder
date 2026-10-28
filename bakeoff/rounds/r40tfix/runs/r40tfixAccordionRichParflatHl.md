`BufferGeometry` has no `applyEuler` (the rotation belongs on `applyMatrix4` with a rotation matrix), and the unused `const d = b.part(...)` in the keyboard inlay is the "all variables unused" error.

<<<<<<< SEARCH
    const m = new THREE.Euler(0, rot, 0);
    g.applyEuler(m);
=======
    g.applyMatrix4(new THREE.Matrix4().makeRotationY(rot));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const d = b.part(new THREE.OctahedronGeometry(0.008), P.tealInlay, {
=======
    b.part(new THREE.OctahedronGeometry(0.008), P.tealInlay, {
>>>>>>> REPLACE