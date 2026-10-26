Cause: `earOutline` was typed as sharp-only points while some entries lacked the required `"sharp"` marker, and `tail.tip` is `null` because the chain did not create a separate tip joint.

```text
<<<<<<< SEARCH
  const earOutline: [number, number, "sharp"][] = [
    [0, 0],
    [0.12, 0.02],
    [0.16, 0.25, "sharp"],
    [0.035, 0.16],
  ];
=======
  const earOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.12, 0.02, "sharp"],
    [0.16, 0.25, "sharp"],
    [0.035, 0.16, "sharp"],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailTip = tail.tip!;
=======
  const tailTip = tail.joints[tail.joints.length - 1];
>>>>>>> REPLACE
```