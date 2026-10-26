Cause: `texture` is not an `ExtrudeOptions` field, and the helper’s texture argument must be passed through a separate `b.part` call rather than `b.extrude`.

```ts
<<<<<<< SEARCH
      texture: SIDE_TEXTURE,
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      texture: FRONT_TEXTURE,
=======
      texture: FRONT_TEXTURE,
>>>>>>> REPLACE
```