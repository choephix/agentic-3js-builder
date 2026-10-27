Cause: the `leading` array was inferred as a union containing widened `number[]` entries, but `b.rod` requires each endpoint to be a 3-number tuple.

```ts
<<<<<<< SEARCH
    const leading = [
=======
    const leading: [number, number, number][] = [
>>>>>>> REPLACE
```