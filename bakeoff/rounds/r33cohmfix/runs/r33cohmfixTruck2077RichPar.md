The turret passes an `svg` texture (`stripe`) as the `color` argument of `b.part` in three places; `color` accepts only a colour string or a paint, and textures go in the `texture:` option.

<<<<<<< SEARCH
  b.part(new THREE.PlaneGeometry(0.8, 0.1), P.trim, {
    bone: yaw,
    at: [rx, hy + 0.34, rz + 0.855],
    dir: [0, 0, 1],
    axis: "z",
    texture: stripe,
  });
=======
  b.part(new THREE.PlaneGeometry(0.8, 0.1), "#ffffff", {
    bone: yaw,
    at: [rx, hy + 0.34, rz + 0.855],
    dir: [0, 0, 1],
    axis: "z",
    texture: stripe,
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.PlaneGeometry(0.36, 0.1), P.trim, {
=======
  b.part(new THREE.PlaneGeometry(0.36, 0.1), "#ffffff", {
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.PlaneGeometry(0.5, 0.1), P.trim, {
=======
  b.part(new THREE.PlaneGeometry(0.5, 0.1), "#ffffff", {
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(cyl(0.805, 0.805, 0.04, 8), stripe, { bone: yaw, at: [rx, ry + 0.115, rz], texture: undefined, color: P.trim });
=======
  b.part(cyl(0.805, 0.805, 0.04, 8), P.trim, { bone: yaw, at: [rx, ry + 0.115, rz] });
>>>>>>> REPLACE