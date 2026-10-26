Cause: the helper’s `Record<string, unknown>` makes `options.name` an object-like unknown value, which cannot satisfy the SDK’s `name?: string` option.

```diff
<<<<<<< SEARCH
    options: Record<string, unknown> = {},
=======
    options: { name?: string; [key: string]: any } = {},
>>>>>>> REPLACE
```