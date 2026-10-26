```ts
// Cause: the wing chains reuse the same joint names on both sides, and the tail fan passes a nullable `tail.tip` where the sweep overload requires a definite joint.

// Edits

<<<<<<< SEARCH
    ], { parent: wingRoot, role: "wing", names: ["wingBase", "wingElbow", "wingTip"] });
=======
    ], {
      parent: wingRoot,
      role: "wing",
      names: [
        `wingBase${side > 0 ? "L" : "R"}`,
        `wingElbow${side > 0 ? "L" : "R"}`,
        `wingTip${side > 0 ? "L" : "R"}`,
      ],
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep([root, tip], [0.055, 0.008], { bone: tail.tip, color: s > 0 ? GOLD : MAGENTA, caps: "point", name: "tailFanFeather" });
=======
    b.sweep([root, tip], [0.055, 0.008], { bone: tail.tip!, color: s > 0 ? GOLD : MAGENTA, caps: "point", name: "tailFanFeather" });
>>>>>>> REPLACE
```