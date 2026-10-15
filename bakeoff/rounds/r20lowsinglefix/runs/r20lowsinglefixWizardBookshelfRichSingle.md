The `scroll` helper passes the `SPIRAL` texture as the `color` argument of `b.part` (`b.part(geometry, SPIRAL, ...)`), but `color` only takes a colour string or a paint. The texture belongs in the `texture:` option, with a white colour string as the colour.

<<<<<<< SEARCH
      b.part(new THREE.CircleGeometry(rad * 0.97, 12), SPIRAL, {
=======
      b.part(new THREE.CircleGeometry(rad * 0.97, 12), "#ffffff", {
>>>>>>> REPLACE