Cause: `tip` is typed as nullable, and the outline annotations allow `undefined`; assert the known tip joints and use required `"sharp"` tuple types.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const wingOutline: [number, number, "sharp"?][] = [
=======
  const wingOutline: [number, number, "sharp"][] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailBlade: [number, number, "sharp"?][] = [
=======
  const tailBlade: [number, number, "sharp"][] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.tip,
=======
      bone: tail.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: tail.tip,
=======
        bone: tail.tip!,
>>>>>>> REPLACE
```