`mix()` returns an `Rgb` tuple, but `b.part` colour only takes a string or a paint. Wrapping the mixes in `paint(() => ...)` makes each one a valid paint.

<<<<<<< SEARCH
      b.part(new THREE.IcosahedronGeometry(0.32, 1), mix(MOSS_D, MOSS, 0.5), { bone: ch.joints[2], at: [e[0], e[1] + 0.05, e[2]], flat: true });
=======
      b.part(new THREE.IcosahedronGeometry(0.32, 1), MOSSP, { bone: ch.joints[2], at: [e[0], e[1] + 0.05, e[2]], flat: true });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.26, 7, 5), mix(MOSS_D, MOSS, 0.5), {
=======
    b.part(new THREE.SphereGeometry(0.26, 7, 5), MOSSP, {
>>>>>>> REPLACE
<<<<<<< SEARCH
    const m = b.part(new THREE.SphereGeometry(0.42, 9, 6), mix(MOSS_D, MOSS, 0.5), {
=======
    const m = b.part(new THREE.SphereGeometry(0.42, 9, 6), MOSSP, {
>>>>>>> REPLACE
<<<<<<< SEARCH
const LEAF = svg(
=======
const MOSSP = paint((p) => mix(MOSS_D, MOSS, noise(p, 0.1, 2)));
const LEAF = svg(
>>>>>>> REPLACE