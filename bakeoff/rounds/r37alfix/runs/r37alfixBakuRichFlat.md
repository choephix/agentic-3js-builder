The errors come from nullable chain `.tip` references being passed where the SDK requires a definite `JointRef`; the overload error is the same issue surfacing through a helper call.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: INK, bone: spine.tip, name: "mane blade", group: "mane" },
=======
      color: INK, bone: spine.tip!, name: "mane blade", group: "mane" },
>>>>>>> REPLACE

<<<<<<< SEARCH
        { bone: spine.tip, name: "gold shoulder cut", group: "markings" },
=======
        { bone: spine.tip!, name: "gold shoulder cut", group: "markings" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine.tip!,
>>>>>>> REPLACE
```