Cause: `warning()` passes its 3D `V3` size directly to `label()`, which expects a 2D `[width, height]` size.

```text
<<<<<<< SEARCH
    const p = label(text, at, size, C.yellow, C.black, name);
=======
    const p = label(text, at, [size[0], size[1]], C.yellow, C.black, name);
>>>>>>> REPLACE
```