Cause: the gill collar callback explicitly passed `bone: item.bone`, but the literal `line(...)` has no bone, so `item.bone` was `null`.

```ts
<<<<<<< SEARCH
            at: item,
            bone: item.bone,
            scale: [1, 0.7, 1],
=======
            at: item,
            scale: [1, 0.7, 1],
>>>>>>> REPLACE
```