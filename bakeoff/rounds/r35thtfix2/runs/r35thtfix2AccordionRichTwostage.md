Cause: `color` is already passed as the second argument to `b.part`; `PartOptions` does not define a `color` property.

```text
<<<<<<< SEARCH
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      color,
      name,
      rotation,
      flat: true,
    });
=======
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      rotation,
      flat: true,
    });
>>>>>>> REPLACE
```