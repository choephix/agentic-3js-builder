Cause: in `barrel` (and the chest-lid call at line 58 and 92) I passed the texture as the colour argument; `b.part` takes the texture only via the `texture:` option, and `color` must be a string.

Line 58 is the `barrel` part, and line 92 is the `bone` helper's part. Both put `woodTile`/`boneTex` where the colour goes.

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.28, 0.24, h, 8), woodTile, { bone: root, at: [x, 0.1 + h / 2, z], texture: woodTile, flat: true, color: "#ffffff" });
=======
    b.part(new THREE.CylinderGeometry(0.28, 0.24, h, 8), "#ffffff", { bone: root, at: [x, 0.1 + h / 2, z], texture: woodTile, flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const p = b.part(new THREE.BoxGeometry(len, 0.05, 0.05), boneTex, { bone: root, at: [x, 0.125, z], rotation: [0, rot, 0], texture: boneTex, color: "#ffffff" });
=======
    const p = b.part(new THREE.BoxGeometry(len, 0.05, 0.05), "#ffffff", { bone: root, at: [x, 0.125, z], rotation: [0, rot, 0], texture: boneTex });
>>>>>>> REPLACE