Cause: `body.joints[...]` is an internal joint object, not a valid `JointRef`; use the named spine joints instead.

```ts
<<<<<<< SEARCH
        parent: body.joints[Math.min(i + 1, body.joints.length - 1)],
=======
        parent: ["spineMidA", "spineMidB", "spineFront", "spineTip"][Math.min(i, 3)],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: body.joints[2],
=======
    parent: "spineMidB",
>>>>>>> REPLACE