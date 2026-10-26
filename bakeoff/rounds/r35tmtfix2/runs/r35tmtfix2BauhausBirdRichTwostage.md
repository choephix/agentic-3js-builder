Cause: nullable chain tips were passed where `JointRef | undefined` is required, and helper colour parameters were narrowed to `string` although the SDK accepts `Paint`.

```text
<<<<<<< SEARCH
function box(
  b: Builder,
  size: [number, number, number],
  color: string,
=======
function box(
  b: Builder,
  size: [number, number, number],
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
function sphere(
  b: Builder,
  radius: number,
  color: string,
=======
function sphere(
  b: Builder,
  radius: number,
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
function rod(
  b: Builder,
  a: THREE.Vector3 | [number, number, number],
  c: THREE.Vector3 | [number, number, number],
  radius: number,
  color: string,
=======
function rod(
  b: Builder,
  a: THREE.Vector3 | [number, number, number],
  c: THREE.Vector3 | [number, number, number],
  radius: number,
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: legL.tip,
=======
      parent: legL.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: legR.tip,
=======
      parent: legR.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: (s > 0 ? legL.tip : legR.tip) ?? undefined,
=======
      bone: (s > 0 ? legL.tip : legR.tip) ?? undefined,
>>>>>>> REPLACE
```