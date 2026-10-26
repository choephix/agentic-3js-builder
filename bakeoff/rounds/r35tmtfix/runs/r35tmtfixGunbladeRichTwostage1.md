Cause: `bladeEdge` folds back across itself because its points `2→3` and `5→6` overlap while tracing the narrow cutting-edge strip.

```ts
<<<<<<< SEARCH
      [0.105, 0],
      [0.16, 0.22],
      [0.18, 0.88],
      [0.105, 1.34],
      [0.015, 1.72],
      [0.09, 1.28],
      [0.205, 0.87],
      [0.22, 0.22],
      [0.17, 0],
=======
      [0.105, 0],
      [0.16, 0.22],
      [0.18, 0.88],
      [0.105, 1.34],
      [0.015, 1.72],
      [0.035, 1.28],
      [0.145, 0.87],
      [0.18, 0.22],
      [0.15, 0],
>>>>>>> REPLACE
```