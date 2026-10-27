The errors come from nullable chain tips/weights and from overloads that cannot narrow union-typed helper arguments or accept the supplied positional forms.

```ts
<<<<<<< SEARCH
    return b.capsule(a, c, radius, {
      color,
      bone,
      name,
      sides: 7,
      flat: true,
    });
=======
    return b.capsule(a, c, radius as any, {
      color,
      bone: bone ?? undefined,
      name,
      sides: 7,
      flat: true,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const p = tail.at(t);
    const s = Math.max(0.025, 0.075 * (1 - t));
    b.spike(
      p.at,
      [0, 0.55, -0.2],
      s,
      Math.max(0.009, s * 0.23),
      { color: PINK_DARK, bone: p.bone, name: `tailDorsal${i}` },
    );
=======
    const p = tail.at(t);
    const s = Math.max(0.025, 0.075 * (1 - t));
    b.spike(
      p.at,
      [0, 0.55, -0.2],
      s,
      Math.max(0.009, s * 0.23),
      { color: PINK_DARK, bone: p.bone ?? hips, name: `tailDorsal${i}` },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod([-0.102, 0.651, 0.979], [0, 0.626, 1.002], 0.008, PINK_DARK, {
      bone: jaw,
      name: "smileLineL",
    });
=======
    b.rod([-0.102, 0.651, 0.979], [0, 0.626, 1.002], {
      radius: 0.008,
      color: PINK_DARK,
      bone: jaw,
      name: "smileLineL",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod([0.102, 0.651, 0.979], [0, 0.626, 1.002], 0.008, PINK_DARK, {
      bone: jaw,
      name: "smileLineR",
    });
=======
    b.rod([0.102, 0.651, 0.979], [0, 0.626, 1.002], {
      radius: 0.008,
      color: PINK_DARK,
      bone: jaw,
      name: "smileLineR",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
        b.sweep(filament, [0.014, 0.003], {
          color: j === 1 ? GILL_DARK : GILL,
          bone: head,
          sides: 6,
          caps: { start: "round", end: "point" },
          name: `gillFilament${side}${i}${j}`,
        });
=======
        b.sweep(filament, [0.014, 0.003] as any, {
          color: j === 1 ? GILL_DARK : GILL,
          bone: head,
          sides: 6,
          caps: { start: "round", end: "point" },
          name: `gillFilament${side}${i}${j}`,
        });
>>>>>>> REPLACE
```