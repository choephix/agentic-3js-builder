The errors come from overly broad `unknown` helper options, readonly tuple inference, and the nonexistent `"body"` joint reference.

```text
<<<<<<< SEARCH
  options: Record<string, unknown> = {},
=======
  options: Record<string, any> = {},
>>>>>>> REPLACE

<<<<<<< SEARCH
  bone?: unknown,
=======
  bone?: any,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fasteners = [
    [-0.64, 1.72, 0.45],
    [0.64, 1.72, 0.45],
    [-0.44, 2.12, 0.82],
    [0.44, 2.12, 0.82],
    [0, 2.34, 0.96],
  ] as const;
=======
  const fasteners: [number, number, number][] = [
    [-0.64, 1.72, 0.45],
    [0.64, 1.72, 0.45],
    [-0.44, 2.12, 0.82],
    [0.44, 2.12, 0.82],
    [0, 2.34, 0.96],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bone = "body";
=======
  const bone = "bodyFront";
>>>>>>> REPLACE
```