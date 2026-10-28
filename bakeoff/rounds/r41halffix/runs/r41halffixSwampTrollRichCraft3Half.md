The line tested `f.local([0, 0, 0]).toArray ?`, which is always true because `toArray` is a method. That line also made the unused `frame` result `f` pointless, so I replaced it with the plain jaw-box position.

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(sc * 1.1, sc * 0.5, sc * 0.9), BONE_D, { at: f.local([0, 0, 0]).toArray ? add(at, 0, -sc * 0.85, sc * 0.2) : at, bone });
=======
    void f;
    b.part(new THREE.BoxGeometry(sc * 1.1, sc * 0.5, sc * 0.9), BONE_D, { at: add(at, 0, -sc * 0.85, sc * 0.2), bone });
>>>>>>> REPLACE