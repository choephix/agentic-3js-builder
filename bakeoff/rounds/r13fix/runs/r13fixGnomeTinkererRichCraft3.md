The scroll cylinder passed the `SCROLL` texture as its colour argument instead of a colour string, so `b.part` rejected it.

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 10), SCROLL, { at: [0, 0.858, -0.19], dir: [1, 0, 0], bone: chest, texture: SCROLL });
=======
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 10), "#ffffff", { at: [0, 0.858, -0.19], dir: [1, 0, 0], bone: chest, texture: SCROLL });
>>>>>>> REPLACE