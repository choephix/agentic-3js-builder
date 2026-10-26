Cause: `rod` and `spike` already define their end styles, so their options do not accept a `caps` property.

```ts
<<<<<<< SEARCH
      caps: "round",
      sides: 6,
=======
      sides: 6,
>>>>>>> REPLACE
<<<<<<< SEARCH
      caps: "round",
      name,
=======
      name,
>>>>>>> REPLACE
```