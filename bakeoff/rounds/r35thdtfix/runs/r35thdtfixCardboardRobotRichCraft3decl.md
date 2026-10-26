Cause: the helper inferred its colour parameter as `Paint`, while textured geometry also cannot accept a `Paint`; textured parts must use a string tint.

```ts
<<<<<<< SEARCH
    color = CARDBOARD,
    bone = torsoBone,
    texture: THREE.Texture | undefined = CORRUGATION,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      texture,
=======
    color: string | typeof CARDBOARD = CARDBOARD,
    bone = torsoBone,
    texture: THREE.Texture | undefined = CORRUGATION,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      texture: typeof color === "string" ? texture : undefined,
>>>>>>> REPLACE
```