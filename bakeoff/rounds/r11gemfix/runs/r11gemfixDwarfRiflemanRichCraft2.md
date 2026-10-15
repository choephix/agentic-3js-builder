The beard ring cylinder was created with `texture: BEARD_RING_TEX` while passing `BRASS_PAINT` (a `Paint`) instead of a color string.

<<<<<<< SEARCH
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.036, 12), BRASS_PAINT, {
        bone: head,
        at: [rPt.x, rPt.y, rPt.z],
        dir: [rTan.x, rTan.y, rTan.z],
        texture: BEARD_RING_TEX,
      });
=======
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.036, 12), "#ffffff", {
        bone: head,
        at: [rPt.x, rPt.y, rPt.z],
        dir: [rTan.x, rTan.y, rTan.z],
        texture: BEARD_RING_TEX,
      });
>>>>>>> REPLACE