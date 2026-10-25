`THREE.CylinderGeometry` has no `.rotate()` method; the rotation methods are `rotateX`, `rotateY` and `rotateZ`, so `.rotate(0, 0, Math.PI / 2)` throws. Replacing it with `.rotateZ(Math.PI / 2)` fixes it.

<<<<<<< SEARCH
    for (let i = 0; i < 8; i++) studs.push(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6).rotate(0, 0, Math.PI / 2).translate(s * 1.315, 1.22, 1.15 + i * 0.2));
=======
    for (let i = 0; i < 8; i++) studs.push(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6).rotateZ(Math.PI / 2).translate(s * 1.315, 1.22, 1.15 + i * 0.2));
>>>>>>> REPLACE