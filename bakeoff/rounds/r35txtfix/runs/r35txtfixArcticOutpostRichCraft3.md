Cause: one invalid readonly array type and two color constants were referenced without being defined.

```text
<<<<<<< SEARCH
    outline: readonly (readonly [number, number][]) ,
=======
    outline: ReadonlyArray<readonly [number, number]>,
>>>>>>> REPLACE
<<<<<<< SEARCH
  const WOOD = cel("#865044", "#4b3540", { threshold: 0.1 });
  const WOOD_LIGHT = cel("#b56a4f", "#6b3c42", { threshold: 0.15 });

  const METAL = cel("#506d78", "#273e4c", { threshold: 0.12 });
=======
  const WOOD = cel("#865044", "#4b3540", { threshold: 0.1 });
  const WOOD_LIGHT = cel("#b56a4f", "#6b3c42", { threshold: 0.15 });
  const WOOD_DARK = cel("#4b3540", "#2d2934", { threshold: 0.1 });

  const METAL = cel("#506d78", "#273e4c", { threshold: 0.12 });
>>>>>>> REPLACE
<<<<<<< SEARCH
  const ROOF = cel("#24444d", "#152a38", { threshold: 0.1 });
  const ROOF_LIGHT = cel("#37616a", "#1c3543", { threshold: 0.12 });
=======
  const ROOF = cel("#24444d", "#152a38", { threshold: 0.1 });
  const ROOF_DARK = cel("#152a38", "#0d1c29", { threshold: 0.08 });
  const ROOF_LIGHT = cel("#37616a", "#1c3543", { threshold: 0.12 });
>>>>>>> REPLACE
```