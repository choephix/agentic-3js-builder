Cause: `chain.tip` is typed as `Joint | null`; assert the tip exists for the leg chains. The second error is the same nullable bone value causing overload resolution to fail.

```ts
<<<<<<< SEARCH
        bone: chain.tip,
        at: foot,
=======
        bone: chain.tip!,
        at: foot,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: chain.tip,
        color: BELLY,
=======
        bone: chain.tip!,
        color: BELLY,
>>>>>>> REPLACE
```