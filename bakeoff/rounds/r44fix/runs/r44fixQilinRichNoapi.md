`c.tip` is typed `Joint | null`, so the cast to an object with an `at` field was invalid; the cast and its unused `void tip;` are removed, and the later `c.tip as never` uses remain valid.

<<<<<<< SEARCH
      const tip = c.tip as THREE.Object3D & { at: THREE.Vector3 };
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      void tip;
=======
>>>>>>> REPLACE