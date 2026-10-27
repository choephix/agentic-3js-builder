Cause: the graffiti panel passes the painted `CONCRETE` material together with a texture, but textured parts require a string tint.

```ts
<<<<<<< SEARCH
  box([1.22, 0.58, 0.025], [-1.15, 1.22, 1.91], CONCRETE, "graffiti-panel", graffitiTex);
=======
  box([1.22, 0.58, 0.025], [-1.15, 1.22, 1.91], "#777873", "graffiti-panel", graffitiTex);
>>>>>>> REPLACE
```