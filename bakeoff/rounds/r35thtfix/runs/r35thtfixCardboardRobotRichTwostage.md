The cause is that the paint callback’s `c` variable is inferred as `Rgb`, but those two branches assign colour strings directly.

```text
<<<<<<< SEARCH
    if (Math.abs(diagonal - 1.0) < 0.048) c = CARDBOARD_GOLD;
    if (Math.abs(diagonal - 1.28) < 0.048) c = CARDBOARD_GOLD;
=======
    if (Math.abs(diagonal - 1.0) < 0.048) c = resolve(CARDBOARD_GOLD, p, n);
    if (Math.abs(diagonal - 1.28) < 0.048) c = resolve(CARDBOARD_GOLD, p, n);
>>>>>>> REPLACE
```