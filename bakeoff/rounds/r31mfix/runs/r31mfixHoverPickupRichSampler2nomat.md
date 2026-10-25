The sign texture was passed as the `color` argument of `put(...)`, but `part()` only accepts a colour string or paint there; textures belong in the `texture:` option on a plane.

<<<<<<< SEARCH
  put(b.part ? bx(0.8, 0.3, 0.05) : bx(0, 0, 0), SIGN as any, [0, 1.35, -2.66], {}) ;
=======
  b.part(new THREE.PlaneGeometry(0.8, 0.32), "#ffffff", {
    bone: B, at: [0, 1.38, -2.66], dir: [0, 0, -1], axis: "z", texture: SIGN,
  });
>>>>>>> REPLACE