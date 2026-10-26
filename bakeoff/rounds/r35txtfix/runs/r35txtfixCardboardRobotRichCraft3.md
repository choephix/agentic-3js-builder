The errors come from nullable chain tips (`spine.tip`/`arm.tip`) being passed where the SDK requires definite joints or points.

```text
<<<<<<< SEARCH
  const neckBase = spine.tip;
=======
  const neckBase = spine.tip!;
>>>>>>> REPLACE
```

```text
<<<<<<< SEARCH
    const wrist = arm.tip;
=======
    const wrist = arm.tip!;
>>>>>>> REPLACE
```

```text
<<<<<<< SEARCH
      parent: arm.tip,
=======
      parent: arm.tip!,
>>>>>>> REPLACE
```

