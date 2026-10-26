The errors come from nullable chain tips, unsupported `rotation` on `extrude`, several helper arguments passed in the wrong order, and a destructured string being used where a point was expected.

```text
<<<<<<< SEARCH
    bone: spine.tip,
=======
    bone: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: spine.tip,
=======
    bone: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: neck.tip,
=======
    bone: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: spine.tip,
=======
    bone: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      rotation,
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  const box = (
    name: string,
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: string,
    rotation?: [number, number, number],
  ) => part(name, new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, bone, rotation);
=======
  const box = (
    name: string,
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: string,
    rotation?: [number, number, number],
  ) => part(name, new THREE.BoxGeometry(size[0], size[1], size[2]), at, color, bone, rotation);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    bone: string,
    rotation?: [number, number, number],
  ) =>
    b.part(geometry, color, {
=======
  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    at: [number, number, number],
    color: string,
    bone: string,
    rotation?: [number, number, number],
  ) =>
    b.part(geometry, color, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const p = part(
      name,
      new THREE.SphereGeometry(radius, 8, 6),
      color,
      at,
      bone,
    );
=======
    const p = part(
      name,
      new THREE.SphereGeometry(radius, 8, 6),
      at,
      color,
      bone,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(
      new THREE.CylinderGeometry(radius, radius * 0.94, 0.018, 10),
      color,
      hit,
=======
    b.stick(
      new THREE.CylinderGeometry(radius, radius * 0.94, 0.018, 10),
      color,
      hit,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(
      new THREE.SphereGeometry(1, 9, 6),
      BRASS,
      outer,
=======
    b.stick(
      new THREE.SphereGeometry(1, 9, 6),
      BRASS,
      outer,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [new THREE.Vector3(0.236, 0.852, 0.592), "top"],
    [new THREE.Vector3(0.278, 0.853, 0.565), "topR"],
=======
    [new THREE.Vector3(0.236, 0.852, 0.592), [0.236, 0.852, 0.592]],
    [new THREE.Vector3(0.278, 0.853, 0.565), [0.278, 0.853, 0.565]],
>>>>>>> REPLACE
```