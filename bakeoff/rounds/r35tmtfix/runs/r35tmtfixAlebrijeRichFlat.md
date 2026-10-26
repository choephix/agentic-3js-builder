Cause: `b.joint()` is typed as `Joint | null`, while `bone` accepts `JointRef | undefined`; convert the nullable joint to `undefined` when absent.

```text
<<<<<<< SEARCH
    bone: jaw,
=======
    bone: jaw ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: SCARLET, bone: jaw, section: { ngon: 6 }, caps: "point", name: "lowerBeak" },
=======
    { color: SCARLET, bone: jaw ?? undefined, section: { ngon: 6 }, caps: "point", name: "lowerBeak" },
>>>>>>> REPLACE
```