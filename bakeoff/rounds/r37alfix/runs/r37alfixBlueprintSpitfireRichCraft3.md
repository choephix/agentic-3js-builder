Cause: `rotation` is not a supported property of `ExtrudeOptions`; the extrusion axes are already defined by `x` and `y`.

```text
<<<<<<< SEARCH
      color: a % 180 === 0 ? PALE : LIGHT,
      rotation: [0, 0, 0],
      name: `propeller-blade-${a}`,
=======
      color: a % 180 === 0 ? PALE : LIGHT,
      name: `propeller-blade-${a}`,
>>>>>>> REPLACE
```