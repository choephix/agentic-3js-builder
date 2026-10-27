The errors come from passing nullable chain tips as joint parents and from using unsupported shorthand options (`caps` on `rod`, and `sides` on `spike` overloads).

```ts
<<<<<<< SEARCH
    parent: torso.tip,
=======
    parent: torso,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 0.585, 0.704], [0.13, 0.582, 0.713], 0.014, INK, {
    bone: head,
    caps: "round",
    name: "smile-right",
  });
=======
  b.rod([0, 0.585, 0.704], [0.13, 0.582, 0.713], 0.014, INK, {
    bone: head,
    name: "smile-right",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 0.585, 0.704], [-0.13, 0.582, 0.713], 0.014, INK, {
    bone: head,
    caps: "round",
    name: "smile-left",
  });
=======
  b.rod([0, 0.585, 0.704], [-0.13, 0.582, 0.713], 0.014, INK, {
    bone: head,
    name: "smile-left",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
          bone: g.joint,
          sides: 5,
          name: `gill-frill-${s}-${i}-${k}`,
=======
          bone: g.joint,
          name: `gill-frill-${s}-${i}-${k}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
          bone: g.joint,
          sides: 5,
          name: `gill-frill-${s}-${i}-${k}`,
=======
          bone: g.joint,
          name: `gill-frill-${s}-${i}-${k}`,
>>>>>>> REPLACE
```