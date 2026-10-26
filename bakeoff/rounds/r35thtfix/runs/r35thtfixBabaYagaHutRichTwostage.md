Cause: `0. fifteen as number` contains an invalid space inside the numeric literal.

```text
<<<<<<< SEARCH
    addBox([0.048, 0.405, 0. fifteen as number], PALETTE.teal, [panelX, midY, z], `s22_shutterBoard${shutter.id}`);
=======
    addBox([0.048, 0.405, 0.15], PALETTE.teal, [panelX, midY, z], `s22_shutterBoard${shutter.id}`);
>>>>>>> REPLACE
```