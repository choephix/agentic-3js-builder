Cause: nullable chain tips were passed as bones, while mapped outline tuples widened `"sharp"` into `string | number`; the fixes make bone references non-null and preserve literal tuple types.

```text
<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const outline: [number, number, "sharp"?][] = [
=======
    const outline: [number, number, "sharp"][] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
    ].map(([x, y, sharp]) => [x * side * scale, y * scale, sharp]);
=======
    ].map(([x, y]) => [x * side * scale, y * scale, "sharp"] as [number, number, "sharp"]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const crownPetal: [number, number, "sharp"?][] = [
=======
  const crownPetal: [number, number, "sharp"][] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.joints[trunk.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.joints[trunk.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.joints[trunk.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.joints[trunk.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunk.joints[trunk.joints.length - 1],
>>>>>>> REPLACE
```