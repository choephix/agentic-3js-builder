The gauge plane in `buildTurret` passed `{ bone: yaw }.bone` (a Joint) as the `at` argument and the position array as the `bone` slot, so `part()` received an array as its bone.

<<<<<<< SEARCH
    part(new THREE.PlaneGeometry(0.1, 0.2), "#ffffff", { bone: yaw }.bone, [tx + s * 0.175, cy + 0.45, cz - 0.25], { dir: [s, 0, 0], axis: "z", texture: gauge });
=======
    part(new THREE.PlaneGeometry(0.1, 0.2), "#ffffff", [tx + s * 0.175, cy + 0.45, cz - 0.25], yaw, { dir: [s, 0, 0], axis: "z", texture: gauge });
>>>>>>> REPLACE