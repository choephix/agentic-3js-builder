Cause: `METAL_DARK` is referenced for the solar-panel feet but was never declared; use the existing `STEEL_DARK` palette colour.

```text
<<<<<<< SEARCH
    rod([x - 0.38, 0.93, -1.55], [x + 0.38, 0.93, -1.55], 0.025, METAL_DARK, "solar-foot");
=======
    rod([x - 0.38, 0.93, -1.55], [x + 0.38, 0.93, -1.55], 0.025, STEEL_DARK, "solar-foot");
>>>>>>> REPLACE
```