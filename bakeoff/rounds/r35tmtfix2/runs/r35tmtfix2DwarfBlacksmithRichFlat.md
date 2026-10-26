Cause: the nullable `tip`/indexed-joint handles were passed where the SDK requires a definite `JointRef`, and the hammer hand inherited that nullability.

```ts
<<<<<<< SEARCH
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 1.68, 0.08], dir: [0, 0, 1], role: "head", group: "head" });
=======
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1]!, at: [0, 1.68, 0.08], dir: [0, 0, 1], role: "head", group: "head" });
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
  const hammerHand = armR.tip;
=======
  const hammerHand = armR.tip!;
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
    const arm = s > 0 ? armL : armR;
=======
    const arm = s > 0 ? armL : armR;
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
    sphere(0.10, SKIN, [s * 0.70, 1.15 + (s > 0 ? 0 : 0.03), 0.35], arm.tip);
=======
    sphere(0.10, SKIN, [s * 0.70, 1.15 + (s > 0 ? 0 : 0.03), 0.35], arm.tip!);
>>>>>>> REPLACE
```

```ts
<<<<<<< SEARCH
        color: SKIN_L, bone: arm.tip, caps: "round", name: `finger${s}_${i}` });
=======
        color: SKIN_L, bone: arm.tip!, caps: "round", name: `finger${s}_${i}` });
>>>>>>> REPLACE
```