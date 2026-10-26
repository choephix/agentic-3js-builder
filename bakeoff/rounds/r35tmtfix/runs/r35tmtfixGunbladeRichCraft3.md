The optional third tuple element inferred `undefined`, which is not assignable to the SDK’s `OutlineInput` tuple union.

```text
<<<<<<< SEARCH
  const bladeOutline: [number, number, "sharp"?][] = [
=======
  const bladeOutline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE
```