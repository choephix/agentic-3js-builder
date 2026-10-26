```ts
// Cause: Chain.tip is nullable in the SDK types, and spike() requires a non-null JointRef when an explicit bone is supplied.

<<<<<<< SEARCH
    spine.tip.at,
=======
    spine.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: spine.tip,
=======
        parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailEnd = tail.tip.at;
=======
  const tailEnd = tail.tip!.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: tail.tip,
=======
        bone: tail.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.tip,
=======
      bone: tail.tip!,
>>>>>>> REPLACE
```