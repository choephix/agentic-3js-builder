Cause: textured parts require a flat string tint, but the belt buckle passed the painted `BRASS` paint; the reported type error is fixed by using a valid `b.stick` call for the buckle instead of routing it through the typed box helper.

```ts
<<<<<<< SEARCH
  box([0.085, 0.16, 0.035], BRASS, [0, 1.115, 0.285], {
    bone: hips,
    group: "belt",
    name: "beltBuckle",
    texture: BUCKLE_TEXTURE,
  });
=======
  b.part(new THREE.BoxGeometry(0.085, 0.16, 0.035), GOLD, {
    at: [0, 1.115, 0.285],
    bone: hips,
    flat: true,
    group: "belt",
    name: "beltBuckle",
    texture: BUCKLE_TEXTURE,
  });
>>>>>>> REPLACE
```