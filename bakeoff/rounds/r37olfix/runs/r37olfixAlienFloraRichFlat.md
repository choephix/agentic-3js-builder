The errors come from an incorrect nested-array annotation, which makes each ridge endpoint a `number[][]`, and from using the unsupported `"branch"` role.

```text
<<<<<<< SEARCH
  ] as [number[][], number[][]][];
=======
  ] as [number[], number[]][];
>>>>>>> REPLACE

<<<<<<< SEARCH
      role: "branch",
=======
      role: "spine",
>>>>>>> REPLACE
```