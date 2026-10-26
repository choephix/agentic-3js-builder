Cause: nullable chain tips and SDK callback/outline types require non-null assertions, single-argument callbacks, and union-typed outline points.

```ts
<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: neck.tip!,
    at: neck.tip.at,
=======
  const head = b.joint("head", {
    parent: neck.tip!,
    at: neck.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.along(edge, 7, (at, i) => {
      const color = i % 3 === 0 ? ORANGE_PAINT : i % 3 === 1 ? GOLD_PAINT : CREAM_PAINT;
      b.spike(at, [0, 1, 0], 0.08 + (i % 2) * 0.018, 0.014, {
        color,
        name: `${label}Quill${i}`,
        group: "wings",
      });
    });
=======
    let quillIndex = 0;
    b.along(edge, 7, (at) => {
      const i = quillIndex++;
      const color = i % 3 === 0 ? ORANGE_PAINT : i % 3 === 1 ? GOLD_PAINT : CREAM_PAINT;
      b.spike(at, [0, 1, 0], 0.08 + (i % 2) * 0.018, 0.014, {
        color,
        name: `${label}Quill${i}`,
        group: "wings",
      });
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      frame: chain.tip!,
=======
      frame: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.along(cuff, 10, (at) => {
=======
    b.along(cuff, 10, (at) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
=======
        bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const earOutline: [number, number, "sharp"][] = [
=======
  const earOutline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const innerEarOutline: [number, number, "sharp"][] = [
=======
  const innerEarOutline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE
```