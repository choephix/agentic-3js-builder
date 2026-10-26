The errors come from nullable chain `.tip` references and from supplying three names for a chain with four spans.

```ts
<<<<<<< SEARCH
      names: ["spine1", "spine2", "chest"],
=======
      names: ["spine1", "spine2", "spine3", "chest"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: body.tip,
=======
      parent: body.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[2],
>>>>>>> REPLACE
```