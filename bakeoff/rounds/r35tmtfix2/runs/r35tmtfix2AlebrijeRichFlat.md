The `parent` option accepts `JointRef | undefined`, but nullable joint handles were passed directly.

```text
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip ?? undefined,
>>>>>>> REPLACE
<<<<<<< SEARCH
    parent: head,
=======
    parent: head ?? undefined,
>>>>>>> REPLACE
```