Cause: `color` belongs in `PartSpec`, `flat` is not a sweep option, and SVG textures must be passed through `texture`, not as `color`.

```text
<<<<<<< SEARCH
      color,
      texture,
      flat: true,
=======
      texture,
      flat: true,
>>>>>>> REPLACE

<<<<<<< SEARCH
      caps: "round",
      sides: 8,
      flat: true,
      name,
=======
      caps: "round",
      sides: 8,
      name,
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.82, 0.22, 0.1], [0, 2.27, -0.815], GALLEY_LABEL, "nostromo-plaque");
=======
  box([0.82, 0.22, 0.1], [0, 2.27, -0.815], "#ffffff", "nostromo-plaque", GALLEY_LABEL);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.64, 0.38, 0.1], [1.2, 1.98, -0.54], SAFETY_LABEL, "emergency-box");
=======
  box([0.64, 0.38, 0.1], [1.2, 1.98, -0.54], "#ffffff", "emergency-box", SAFETY_LABEL);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.19, 0.22, 0.012], [-1.12, 0.42, 0.835], WARNING_LABEL, "floor-pressure-warning");
=======
  box([0.19, 0.22, 0.012], [-1.12, 0.42, 0.835], "#ffffff", "floor-pressure-warning", WARNING_LABEL);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.14, 0.16, 0.012], [1.16, 0.38, 0.785], UNIT_LABEL, "thermal-bottle-label");
=======
  box([0.14, 0.16, 0.012], [1.16, 0.38, 0.785], "#ffffff", "thermal-bottle-label", UNIT_LABEL);
>>>>>>> REPLACE
```