Cause: several helper calls use the arguments in the wrong order, nullable chain tips are passed where a definite joint is required, and the root chain is incorrectly parented through a frame that resolves to the builder root.

```ts
<<<<<<< SEARCH
  const box = (
    size: readonly [number, number, number],
    at: THREE.Vector3 | readonly [number, number, number],
    color: any,
    bone: any,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      ...extra,
    });
=======
  const box = (
    size: readonly [number, number, number],
    a: any,
    b0: any,
    c: any,
    extra: Record<string, any> = {},
  ) => {
    const isPoint = (v: any) =>
      v instanceof THREE.Vector3 || (Array.isArray(v) && v.length === 3);
    const at = isPoint(a) ? a : b0;
    const color = isPoint(a) ? b0 : a;
    const bone = c;
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      ...extra,
    });
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
  const cylinder = (
    radius: number,
    height: number,
    at: THREE.Vector3 | readonly [number, number, number],
    color: any,
    bone: any,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 10, 1), color, {
      at,
      bone,
      flat: true,
      ...extra,
    });
=======
  const cylinder = (
    radius: number,
    height: number,
    a: any,
    b0: any,
    c: any,
    extra: Record<string, any> = {},
  ) => {
    const isPoint = (v: any) =>
      v instanceof THREE.Vector3 || (Array.isArray(v) && v.length === 3);
    const at = isPoint(a) ? a : b0;
    const color = isPoint(a) ? b0 : a;
    const bone = c;
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 10, 1), color, {
      at,
      bone,
      flat: true,
      ...extra,
    });
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
  const frontPlate = (
    size: readonly [number, number],
    at: readonly [number, number, number],
    color: any,
    bone: any,
    texture?: THREE.Texture,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      texture,
      ...extra,
    });
=======
  const frontPlate = (
    size: readonly number[],
    a: any,
    b0: any,
    c: any,
    texture?: THREE.Texture,
    extra: Record<string, any> = {},
  ) => {
    const isPoint = (v: any) =>
      v instanceof THREE.Vector3 || (Array.isArray(v) && v.length === 3);
    const at = isPoint(a) ? a : b0;
    const color = isPoint(a) ? b0 : a;
    const bone = c;
    return b.part(
      new THREE.BoxGeometry(size[0], size[1], size[2] ?? 0.026),
      color,
      { at, bone, texture, ...extra },
    );
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: hand,
=======
          parent: hand,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(digit, [0.027, 0.024], {
=======
      b.sweep(digit, [0.027, 0.024], {
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: arm.tip,
=======
        bone: arm.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: arm.tip,
=======
        bone: arm.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
=======
        bone: leg.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
=======
        bone: leg.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
=======
        bone: leg.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
=======
        bone: leg.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: armL.tip,
=======
        bone: armL.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: armL.tip,
=======
        bone: armL.joints[3],
>>>>>>> REPLACE
```