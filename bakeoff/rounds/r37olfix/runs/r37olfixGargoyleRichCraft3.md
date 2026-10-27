Cause: nullable chain tips/joints were passed where the SDK requires a definite `JointRef`; use the chain itself as the parent and narrow each appendage tip before using it.

```ts
<<<<<<< SEARCH
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.22, 0.78], dir: [0, -0.03, 1], role: "head", group: "head" });
=======
  const head = b.joint("head", { parent: neck, at: [0, 1.22, 0.78], dir: [0, -0.03, 1], role: "head", group: "head" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.13, 0.91], dir: [0, -0.12, 0.95], role: "jaw", group: "head" });
=======
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.13, 0.91], dir: [0, -0.12, 0.95], role: "jaw", group: "head" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const leg of [hindL, hindR]) {
    b.sweep(leg, (t) => 0.105 - t * 0.045, { color: BELLY, section: { ngon: 6 }, name: "bent hind leg" });
    orb(0.12, leg.tip.at, STONE_LIGHT, leg.tip, 7);
    for (const s of [-1, 0, 1]) {
      const p = leg.tip.local([s * 0.045, 0.045, 0.08]);
      b.spike(p, [0, 0, 1], 0.13, 0.022, { color: CREVICE, bone: leg.tip });
    }
  }
=======
  for (const leg of [hindL, hindR]) {
    const foot = leg.tip!;
    b.sweep(leg, (t) => 0.105 - t * 0.045, { color: BELLY, section: { ngon: 6 }, name: "bent hind leg" });
    orb(0.12, foot.at, STONE_LIGHT, foot, 7);
    for (const s of [-1, 0, 1]) {
      const p = foot.local([s * 0.045, 0.045, 0.08]);
      b.spike(p, [0, 0, 1], 0.13, 0.022, { color: CREVICE, bone: foot.bone! });
    }
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const arm of [armL, armR]) {
    b.sweep(arm, (t) => 0.09 - t * 0.045, { color: STONE, section: { ngon: 6 }, name: "foreleg" });
    orb(0.105, arm.tip.at, STONE_LIGHT, arm.tip, 7);
    for (const s of [-1, 0, 1]) {
      const p = arm.tip.local([s * 0.04, 0.035, 0.02]);
      b.spike(p, [s * 0.20, -0.03, 0.32], null, 0.018, { color: CREVICE, bone: arm.tip });
    }
  }
=======
  for (const arm of [armL, armR]) {
    const claw = arm.tip!;
    b.sweep(arm, (t) => 0.09 - t * 0.045, { color: STONE, section: { ngon: 6 }, name: "foreleg" });
    orb(0.105, claw.at, STONE_LIGHT, claw, 7);
    for (const s of [-1, 0, 1]) {
      const p = claw.local([s * 0.04, 0.035, 0.02]);
      b.spike(p, [s * 0.20, -0.03, 0.32], null, 0.018, { color: CREVICE, bone: claw.bone! });
    }
  }
>>>>>>> REPLACE
```