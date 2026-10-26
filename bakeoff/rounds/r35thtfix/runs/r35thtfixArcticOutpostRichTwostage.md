Cause: the `P` tuple was incorrectly used for two-number label sizes, and the `slab` helper relied on an implicit extrusion axis; explicitly providing a perpendicular `y` axis fixes the runtime error.

```text
<<<<<<< SEARCH
function slab(
  b: Builder,
  name: string,
  outline: [number, number][],
  at: Point,
  x: Point,
  thickness: number,
  color: string,
) {
  return b.extrude(outline, {
    at,
    x,
    thickness,
    color,
    name,
    bevel: 0.005,
  });
}
=======
function slab(
  b: Builder,
  name: string,
  outline: [number, number][],
  at: Point,
  x: Point,
  thickness: number,
  color: string,
) {
  return b.extrude(outline, {
    at,
    x,
    y: [0, 1, 0],
    thickness,
    color,
    name,
    bevel: 0.005,
  });
}
>>>>>>> REPLACE

<<<<<<< SEARCH
      label: [0.27, 0.12] as P,
=======
      label: [0.27, 0.12] as [number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
      label: [0.27, 0.14] as P,
=======
      label: [0.27, 0.14] as [number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
      label: [0.18, 0.09] as P,
=======
      label: [0.18, 0.09] as [number, number],
>>>>>>> REPLACE
```