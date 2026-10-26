The errors come from using a type utility as a runtime value, passing `Vector3` objects to a `number[][]` parameter, and supplying an unsupported `spike` overload argument.

```text
<<<<<<< SEARCH
  function makeToe(
    name: string,
    parent: typeof legL.tip,
    points: number[][],
  ) {
    return b.chain(name, points, {
      parent: NonNullable<typeof legL.tip>,
=======
  function makeToe(
    name: string,
    parent: typeof hutRoot,
    points: (number[] | THREE.Vector3)[],
  ) {
    return b.chain(name, points, {
      parent,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const toeLInner = makeToe("toeLInner", footL, [
    footL.at,
=======
  const toeLInner = makeToe("toeLInner", footL, [
    footLP,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const toeLMiddle = makeToe("toeLMiddle", footL, [
    footL.at,
=======
  const toeLMiddle = makeToe("toeLMiddle", footL, [
    footLP,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const toeLOuter = makeToe("toeLOuter", footL, [
    footL.at,
=======
  const toeLOuter = makeToe("toeLOuter", footL, [
    footLP,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const toeRInner = makeToe("toeRInner", footR, [
    footR.at,
=======
  const toeRInner = makeToe("toeRInner", footR, [
    footRP,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const toeRMiddle = makeToe("toeRMiddle", footR, [
    footR.at,
=======
  const toeRMiddle = makeToe("toeRMiddle", footR, [
    footRP,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const toeROuter = makeToe("toeROuter", footR, [
    footR.at,
=======
  const toeROuter = makeToe("toeROuter", footR, [
    footRP,
>>>>>>> REPLACE

<<<<<<< SEARCH
        null,
        0.022,
=======
        undefined,
        0.022,
>>>>>>> REPLACE
```