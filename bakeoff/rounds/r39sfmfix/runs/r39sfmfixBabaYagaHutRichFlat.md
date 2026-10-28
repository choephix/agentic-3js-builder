The `P` helper types `at` as a tuple `V`, but `head.local(...)` returns a `Vector3`; I'll widen `P`'s `at` parameter to accept a `Vector3`.

<<<<<<< SEARCH
  const P = (g: THREE.BufferGeometry, c: string, at: V, o: O = {}) => b.part(g, c, { bone: hut, at, ...o });
=======
  const P = (g: THREE.BufferGeometry, c: string, at: V | THREE.Vector3, o: O = {}) =>
    b.part(g, c, { bone: hut, at, ...o });
>>>>>>> REPLACE