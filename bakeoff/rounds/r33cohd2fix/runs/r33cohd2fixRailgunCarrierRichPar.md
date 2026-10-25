The foot-pad hazard part passes the `HAZ` texture as its `color` argument (`b.part(geo, HAZ, { texture: HAZ })`), but `color` only takes a colour string or a paint.

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(1.04, 0.08, 1.04), HAZ, { bone, at: [foot.x, 0.16, foot.z], texture: HAZ });
=======
    b.part(new THREE.BoxGeometry(1.04, 0.08, 1.04), "#ffffff", { bone, at: [foot.x, 0.16, foot.z], texture: HAZ });
>>>>>>> REPLACE