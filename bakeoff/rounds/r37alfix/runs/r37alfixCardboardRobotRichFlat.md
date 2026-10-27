```ts
// Cause: several chains used the path as the first argument instead of the required chain name, and `spine.tip` is nullable where a definite JointRef is required.

<<<<<<< SEARCH
  const neck = b.chain(
    [
=======
  const neck = b.chain(
    "neck",
    [
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const leftLeg = b.chain(
    [
=======
  const leftLeg = b.chain(
    "leftLeg",
    [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rightLeg = b.chain(
    [
=======
  const rightLeg = b.chain(
    "rightLeg",
    [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const leftArm = b.chain(
    [
=======
  const leftArm = b.chain(
    "leftArm",
    [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rightArm = b.chain(
    [
=======
  const rightArm = b.chain(
    "rightArm",
    [
>>>>>>> REPLACE
```