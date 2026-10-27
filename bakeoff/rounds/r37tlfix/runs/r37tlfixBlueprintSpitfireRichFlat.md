Cause: `b.part` receives the color as its second argument; `color` is not a valid property of `PartOptions`.

```text
<<<<<<< SEARCH
    at,
      dir,
      color,
      ...({} as Record<string, unknown>),
=======
    at,
      dir,
      ...({} as Record<string, unknown>),
>>>>>>> REPLACE
```