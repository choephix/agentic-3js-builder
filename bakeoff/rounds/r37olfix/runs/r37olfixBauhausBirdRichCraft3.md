Cause: nullable chain tips were passed where the SDK requires a definite `JointRef`; use the non-null chain itself as the parent/bone reference, and avoid passing nullable tips.

```ts
<<<<<<< SEARCH
  const neck = spine.tip;
  const head = b.joint("head", {
    parent: neck,
=======
  const neck = spine.tip!;
  const head = b.joint("head", {
    parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.joints[2],
=======
      parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.joints[2],
=======
      parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.joints[0],
=======
      parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.joints[0],
=======
      parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
    { parent: legL.tip, names: ["toeL", "toeL_tip"], role: "digit" },
=======
    { parent: legL, names: ["toeL", "toeL_tip"], role: "digit" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    { parent: legR.tip, names: ["toeR", "toeR_tip"], role: "digit" },
=======
    { parent: legR, names: ["toeR", "toeR_tip"], role: "digit" },
>>>>>>> REPLACE
```