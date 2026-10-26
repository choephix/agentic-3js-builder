Cause: `Paint` was used without being imported, and `puck` restricted its color argument to `string` instead of the SDK’s `ColorInput`.

```diff
<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, paint, polyline, type ColorInput, frame } from "agentic-3js-builder";
=======
import { type Builder, createBuilder, catmull, paint, polyline, type ColorInput, type Paint, frame } from "agentic-3js-builder";
>>>>>>> REPLACE
```

```diff
<<<<<<< SEARCH
  color: string,
  name: string,
=======
  color: ColorInput,
  name: string,
>>>>>>> REPLACE
```