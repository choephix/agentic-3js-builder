Cause: nullable chain references were passed where the SDK requires a definite `JointRef`, and `b.cards` does not accept `name`/`group` options.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE
<<<<<<< SEARCH
        bone: gill.joints[1],
=======
        bone: gill.joints[1]!,
>>>>>>> REPLACE
<<<<<<< SEARCH
      name: `ruffled gill fan ${side}-${index}`,
      group: "gills",
=======
>>>>>>> REPLACE
```