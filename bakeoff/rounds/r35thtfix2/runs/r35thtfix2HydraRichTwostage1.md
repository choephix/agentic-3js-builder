Cause: `Frame.bone` is typed as `Joint | null`, while builder options require `JointRef | undefined`; normalize nullable bones to `undefined`.

```diff
<<<<<<< SEARCH
      bone: ridge.bone,
      name: `bodySpine${i}`,
=======
      bone: ridge.bone ?? undefined,
      name: `bodySpine${i}`,
>>>>>>> REPLACE
```

```diff
<<<<<<< SEARCH
      bone: ridge.bone,
      name: `tailSpine${i}`,
=======
      bone: ridge.bone ?? undefined,
      name: `tailSpine${i}`,
>>>>>>> REPLACE
```

```diff
<<<<<<< SEARCH
        bone: dorsal.bone,
        name: `neckRidge${spec.key}${i}`,
=======
        bone: dorsal.bone ?? undefined,
        name: `neckRidge${spec.key}${i}`,
>>>>>>> REPLACE
```

```diff
<<<<<<< SEARCH
        bone: item.bone,
        name: `throatStud${spec.key}${i}`,
=======
        bone: item.bone ?? undefined,
        name: `throatStud${spec.key}${i}`,
>>>>>>> REPLACE
```