```ts
// Cause: the sphere helper's arguments were reversed at many call sites; its declared signature required (radius, at, color), while the model used (at, radius, color), causing both the TypeScript errors and the runtime number-as-point failure.

<<<<<<< SEARCH
  const sphere = (
    name: string,
    radius: number,
    at: readonly [number, number, number],
    color: any,
    scale?: readonly [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      scale,
      name,
      flat: true,
    });
=======
  function sphere(
    name: string,
    radiusOrAt: number | readonly [number, number, number],
    atOrRadius: readonly [number, number, number] | number,
    color: any,
    scale?: readonly [number, number, number],
  ) {
    const radius = typeof radiusOrAt === "number" ? radiusOrAt : atOrRadius as number;
    const at = (typeof radiusOrAt === "number"
      ? atOrRadius
      : radiusOrAt) as readonly [number, number, number];

    return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      scale,
      name,
      flat: true,
    });
  }
>>>>>>> REPLACE
```