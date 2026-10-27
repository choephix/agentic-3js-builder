The errors come from nullable chain tips being passed as bones, an `extrude` direction expression not matching the SDK overload, and a ring axis being supplied as an array where the API expects a `Vector3`.

```ts
<<<<<<< SEARCH
  const crownBone = stem.tip;
=======
  const crownBone = stem.joints[stem.joints.length - 1];
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
        x: side.toArray() as [number, number, number],
        y: dir.clone().multiplyScalar(0.35).add(new THREE.Vector3(0, 0.94, 0)).normalize().toArray() as [
          number,
          number,
          number,
        ],
=======
        x: side.clone(),
        y: dir.clone().multiplyScalar(0.35).add(new THREE.Vector3(0, 0.94, 0)).normalize(),
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
    { at: crown, axis: [0, 1, 0] },
=======
    { at: crown, axis: new THREE.Vector3(0, 1, 0) },
>>>>>>> REPLACE
```