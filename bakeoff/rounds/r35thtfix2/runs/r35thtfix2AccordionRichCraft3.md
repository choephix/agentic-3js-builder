Cause: `Fill` is imported but unused, while the helper parameters require the SDK’s `ColorInput` type, which was not imported.

```diff
<<<<<<< SEARCH
import type { Fill } from "agentic-3js-builder";
=======
import type { ColorInput } from "agentic-3js-builder";
>>>>>>> REPLACE
```