`catmull(...).at(t)` returns a `Vector3` point, not a chain-point object, so `p.at` is undefined. Use `p.x`, `p.y` and `p.z` directly.

<<<<<<< SEARCH
    const fr: ReturnType<typeof bunt.at>[] = [];
=======
    const fr: THREE.Vector3[] = [];
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(new THREE.ConeGeometry(0.1, 0.26, 3), cols[i], { bone: body, at: [p.at.x, p.at.y - 0.13, p.at.z], rotation: [180, 0, 0], name: "flag" });
=======
      b.part(new THREE.ConeGeometry(0.1, 0.26, 3), cols[i], { bone: body, at: [p.x, p.y - 0.13, p.z], rotation: [180, 0, 0], name: "flag" });
>>>>>>> REPLACE