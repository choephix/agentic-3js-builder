Cause: `glow()` rejects painted materials, and the flower petals use the painted `PETAL`/`PETAL_LIGHT` colors.

```text
<<<<<<< SEARCH
        color: i % 2 === 0 ? PETAL : PETAL_LIGHT,
=======
        color: i % 2 === 0 ? "#b834c5" : "#ed72df",
>>>>>>> REPLACE
```