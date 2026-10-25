The stabiliser footpad hazard band passes the `HAZ` texture as the colour argument of `b.part`, which only accepts a colour string or a paint. The texture belongs in the `texture` option, with a string as the colour.

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8), HAZ, { bone, at: [px, 0.78, z], texture: HAZ });
=======
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8), "#ffffff", { bone, at: [px, 0.78, z], texture: HAZ });
>>>>>>> REPLACE