The error is on the `const m = b.part(...)` in `addTrunkBarkRidgesAndTendrils` (the knobbly-nodes loop): `m` is assigned and then only discarded with `void m;`. The checker reports it as an unused variable, so the fix is to drop the binding and call `b.part` directly.

<<<<<<< SEARCH
    const m = b.part(new THREE.IcosahedronGeometry(s, 0), i % 3 ? TRUNK_LIGHT : TRUNK, {
=======
    b.part(new THREE.IcosahedronGeometry(s, 0), i % 3 ? TRUNK_LIGHT : TRUNK, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    void m;
  }

  // ---- Hanging tendrils at tips of lower fronds ----
=======
  }

  // ---- Hanging tendrils at tips of lower fronds ----
>>>>>>> REPLACE