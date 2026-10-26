Cause: `flat` and `smooth` are unsupported option fields for those helpers, and `b.surface()` cannot query a `Chain`; query the corresponding built sweep instead.

```ts
<<<<<<< SEARCH
        flat: true,
        name: `gothicCorbel${s > 0 ? "L" : "R"}`,
=======
        name: `gothicCorbel${s > 0 ? "L" : "R"}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name: `pointedEar${s > 0 ? "L" : "R"}`,
=======
        name: `pointedEar${s > 0 ? "L" : "R"}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      smooth: false,
      name: `broadWingMembrane${s > 0 ? "L" : "R"}`,
=======
      name: `broadWingMembrane${s > 0 ? "L" : "R"}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      smooth: false,
      name: `wingLowerWeb${s > 0 ? "L" : "R"}`,
=======
      name: `wingLowerWeb${s > 0 ? "L" : "R"}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const wingSurface = b.surface(mainMembrane);
=======
    const wingSurface = b.surface([leadingTube, trailingTube, midTube, lowTube]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.surface([leading, trailing])
=======
    b.surface([leadingTube, trailingTube])
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.surface(leading)
=======
    b.surface(leadingTube)
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.surface(trailing)
=======
    b.surface(trailingTube)
>>>>>>> REPLACE
```