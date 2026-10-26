The errors come from helper options being typed as `unknown` for `bone`, and from `as const` producing readonly tuples instead of mutable SDK point tuples.

```ts
<<<<<<< SEARCH
  options: Record<string, unknown> = {},
=======
  options: { bone?: import("agentic-3js-builder").JointRef; [key: string]: any } = {},
>>>>>>> REPLACE

<<<<<<< SEARCH
  options: Record<string, unknown> = {},
=======
  options: { bone?: import("agentic-3js-builder").JointRef; [key: string]: any } = {},
>>>>>>> REPLACE

<<<<<<< SEARCH
    bolt(b, p, 0.045, CORAL, hips);
=======
    bolt(b, [p[0], p[1], p[2]], 0.045, CORAL, hips);
>>>>>>> REPLACE
```