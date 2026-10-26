Cause: `0. eighteenth` is an invalid numeric expression; it should be the intended marquee frame height `0.175`.

```text
<<<<<<< SEARCH
  neonRect(0, 1.704, 0.341, 0.575, 0. eighteenth ?? 0.175, MAGENTA, 0.008, 2.5, "marquee_magenta_frame");
=======
  neonRect(0, 1.704, 0.341, 0.575, 0.175, MAGENTA, 0.008, 2.5, "marquee_magenta_frame");
>>>>>>> REPLACE
```