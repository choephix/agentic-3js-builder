Cause: in the bandolier `b.along` callback, `at.axis` is a `THREE.Vector3`, so `at.axis[0]` etc. are `undefined`; the tangent was garbage, the cross product came out as a zero or NaN vector, and `cyl` got a zero `dir`.

<<<<<<< SEARCH
      const axis = new THREE.Vector3().crossVectors(V(at.axis[0], at.axis[1], at.axis[2]), h.n).normalize();
=======
      const axis = new THREE.Vector3().crossVectors(new THREE.Vector3().copy(at.axis), h.n);
      if (axis.lengthSq() < 1e-8) return;
      axis.normalize();
>>>>>>> REPLACE