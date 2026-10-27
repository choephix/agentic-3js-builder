Cause: the outline arrays were typed with an optional third tuple element, which is incompatible with the SDK’s `OutlineInput`; use the SDK’s `OutlinePoint` type instead.

```ts
<<<<<<< SEARCH
import { createBuilder, paint, svg } from "agentic-3js-builder";
=======
import { createBuilder, paint, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const wingOutline: [number, number, "sharp"?][] = [
=======
  const wingOutline: OutlinePoint[] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailplane: [number, number, "sharp"?][] = [
=======
  const tailplane: OutlinePoint[] = [
>>>>>>> REPLACE
```