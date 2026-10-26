Cause: `frustumBox()` is receiving coincident chain samples in `segment()`, so its internal two-point path collapses to one distinct point.

```ts
<<<<<<< SEARCH
  function segment(
    name: string,
    a: Point,
    c: Point,
    width: number,
    height: number,
    color: string,
    bone: Bone,
  ) {
    return b.frustumBox(a, c, [width, height], [width * 0.96, height * 0.96], {
      color,
      bone,
      name,
      skin: "rigid",
    });
  }
=======
  function segment(
    name: string,
    a: Point,
    c: Point,
    width: number,
    height: number,
    color: string,
    bone: Bone,
  ) {
    const start = a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);
    const end = c instanceof THREE.Vector3 ? c.clone() : new THREE.Vector3(c[0], c[1], c[2]);
    const delta = end.clone().sub(start);
    const length = Math.max(delta.length(), 0.001);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);

    return b.part(new THREE.BoxGeometry(width, length, height), color, {
      at: midpoint,
      dir: delta.normalize(),
      bone,
      name,
      flat: true,
    });
  }
>>>>>>> REPLACE
```