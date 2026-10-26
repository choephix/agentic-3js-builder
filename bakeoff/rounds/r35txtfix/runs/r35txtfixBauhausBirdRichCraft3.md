Cause: `0. eighteenth` is invalid TypeScript; the scale component should be the numeric literal `0.18`.

```text
<<<<<<< SEARCH
      scale: [0. eighteenth ?? 0.17, 0.17, 0.17],
=======
      scale: [0.18, 0.17, 0.17],
>>>>>>> REPLACE
```