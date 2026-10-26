Cause: The roof boxes pass the painted `ROOF` Paint together with `ROOF_TEXTURE`, but textured parts require a plain string tint.

```text
<<<<<<< SEARCH
      ROOF,
      [side * 35, 0, 0],
      ROOF_TEXTURE,
=======
      "#ffffff",
      [side * 35, 0, 0],
      ROOF_TEXTURE,
>>>>>>> REPLACE
```