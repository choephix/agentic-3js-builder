The errors come from using nullable chain handles (`tip`/`bone`) where the builder requires a definite joint; the neck also had too few names to create its requested tip joint.

```ts
<<<<<<< SEARCH
        names: ["neck", "neckTip"], role: "neck" },
=======
        names: ["neck1", "neck2", "neckTip"], role: "neck" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip!,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: ankle.bone, at: ankle.at, dir: ankle.tangent, name: `cream ankle ${i}` },
=======
      bone: ankle.bone!, at: ankle.at, dir: ankle.tangent, name: `cream ankle ${i}` },
>>>>>>> REPLACE
```